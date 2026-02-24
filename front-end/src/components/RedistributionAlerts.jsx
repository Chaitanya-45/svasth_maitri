import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  LocalShipping,
  AccessTime,
  LocationOn,
  Inventory,
  LocalHospital,
  MoveDown,
  Info,
  CheckCircle,
  Close,
} from "@mui/icons-material";
import { database } from "../firebase/firebase";
import axios from "axios";

const RedistributionAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProcessed, setShowProcessed] = useState(false);

  // Fetch inventory data and analyze with OpenAI
  useEffect(() => {
    const getRedistributionAlerts = async () => {
      try {
        setLoading(true);

        // 1. Fetch inventory data from Firebase
        const medicineSnapshot = await database
          .ref("medicineDonations")
          .once("value");
        const equipmentSnapshot = await database
          .ref("equipmentDonations")
          .once("value");
        const locationsSnapshot = await database.ref("locations").once("value");

        const medicines = [];
        medicineSnapshot.forEach((item) => {
          const data = item.val();
          medicines.push({
            id: item.key,
            type: "medicine",
            name: data.medicineName,
            location: data.location,
            quantity: data.quantity,
            dateAdded: data.createdAt,
            expiryDate: data.expiryDate || null,
            lastMoved: data.lastMoved || data.createdAt,
          });
        });

        const equipment = [];
        equipmentSnapshot.forEach((item) => {
          const data = item.val();
          equipment.push({
            id: item.key,
            type: "equipment",
            name: data.equipmentName,
            location: data.location,
            quantity: data.quantity,
            dateAdded: data.createdAt,
            condition: data.condition || "good",
            lastMoved: data.lastMoved || data.createdAt,
          });
        });

        const locations = {};
        locationsSnapshot.forEach((loc) => {
          const data = loc.val();
          locations[loc.key] = {
            id: loc.key,
            name: data.name,
            address: data.address,
            needs: data.needs || [],
          };
        });

        // 2. Prepare data for OpenAI analysis
        const inventoryData = [...medicines, ...equipment];

        // 3. Call OpenAI API
        const analysisResult = await analyzeWithOpenAI(
          inventoryData,
          locations,
        );

        // 4. Process and set the alerts
        setAlerts(analysisResult);
        setError(null);
      } catch (err) {
        console.error("Error getting redistribution alerts:", err);
        setError("Failed to analyze inventory data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getRedistributionAlerts();
  }, []);

  // Function to analyze inventory with OpenAI API
  const analyzeWithOpenAI = async (inventory, locations) => {
    try {
      const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!openAIKey) {
        throw new Error("Missing VITE_OPENAI_API_KEY in front-end/.env");
      }

      // Format the data for OpenAI
      const today = new Date();
      const longTimeThreshold = 60; // days

      // Identify items that haven't been moved in a long time
      const stagnantItems = inventory.filter((item) => {
        const lastMovedDate = new Date(item.lastMoved);
        const daysSinceLastMoved =
          (today - lastMovedDate) / (1000 * 60 * 60 * 24);
        return daysSinceLastMoved > longTimeThreshold;
      });

      if (stagnantItems.length === 0) {
        return [];
      }

      // Create a prompt for OpenAI
      const prompt = {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant for a medical donation platform. Your task is to analyze inventory data and suggest redistribution of items that have been sitting unused for a long time. For each item, identify the best location to move it to based on location needs, item expiry dates, and optimal distribution.",
          },
          {
            role: "user",
            content: `I have the following medical inventory items that haven't been moved in 60+ days:\n${JSON.stringify(stagnantItems)}\n\nThese are our locations with their needs:\n${JSON.stringify(locations)}\n\nPlease analyze and suggest which items should be moved to which locations. For each suggestion, provide: 1) The item to move, 2) Where to move it from and to, 3) Urgency level (high/medium/low), 4) Brief explanation of why this move is recommended. Format your response as a JSON array of objects with fields: itemId, itemName, itemType, fromLocation, toLocation, quantity, urgency, reasoning.`,
          },
        ],
      };

      // Call OpenAI API
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        prompt,
        {
          headers: {
            Authorization: `Bearer ${openAIKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Parse the response
      const responseText = response.data.choices[0].message.content;

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);

        // Add unique IDs and status to each suggestion
        return suggestions.map((suggestion, index) => ({
          ...suggestion,
          id: `suggestion-${index}`,
          status: "pending",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw new Error("Failed to analyze inventory with AI");
    }
  };

  // Handle accepting a suggestion
  const handleAccept = async (alertId) => {
    try {
      const alert = alerts.find((a) => a.id === alertId);

      // Update the alert status
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, status: "processing" } : a,
        ),
      );

      // Create transfer record
      const transferRef = database.ref("transfers").push();

      const transfer = {
        sourceLocation: alert.fromLocation,
        destinationLocation: alert.toLocation,
        itemName: alert.itemName,
        itemType: alert.itemType,
        itemId: alert.itemId,
        quantity: alert.quantity,
        status: "pending",
        createdAt: new Date().toISOString(),
        reason: alert.reasoning,
      };

      await transferRef.set(transfer);

      // Update the item's location and lastMoved date
      const itemRef = database.ref(
        `${alert.itemType}Donations/${alert.itemId}`,
      );
      await itemRef.update({
        transferStatus: "pending_transfer",
        transferId: transferRef.key,
        transferDestination: alert.toLocation,
        lastMoved: new Date().toISOString(),
      });

      // Update alert status to accepted
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: "accepted" } : a)),
      );
    } catch (err) {
      console.error("Error accepting suggestion:", err);

      // Revert to pending status on error
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, status: "pending", error: err.message }
            : a,
        ),
      );
    }
  };

  // Handle rejecting a suggestion
  const handleReject = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "rejected" } : a)),
    );
  };

  // Filter alerts based on showProcessed state
  const filteredAlerts = showProcessed
    ? alerts
    : alerts.filter((alert) => alert.status === "pending");

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle color="success" />;
      case "rejected":
        return <Close color="error" />;
      case "processing":
        return <CircularProgress size={20} />;
      default:
        return null;
    }
  };

  // Get item type icon
  const getTypeIcon = (type) => {
    return type === "medicine" ? (
      <LocalHospital fontSize="small" color="primary" />
    ) : (
      <Inventory fontSize="small" color="secondary" />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Resource Redistribution Alerts</Typography>

        <Button
          variant="outlined"
          onClick={() => setShowProcessed(!showProcessed)}
        >
          {showProcessed ? "Hide Processed" : "Show All"}
        </Button>
      </Box>

      {alerts.length === 0 ? (
        <Alert severity="info">
          No redistribution alerts at this time. All inventory is optimally
          distributed.
        </Alert>
      ) : filteredAlerts.length === 0 ? (
        <Alert severity="success">
          All redistribution alerts have been processed. Inventory is now
          optimally distributed.
        </Alert>
      ) : (
        filteredAlerts.map((alert) => (
          <Card
            key={alert.id}
            sx={{
              mb: 2,
              borderLeft: 4,
              borderColor: getUrgencyColor(alert.urgency),
              opacity: alert.status !== "pending" ? 0.7 : 1,
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={7}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    {getTypeIcon(alert.itemType)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {alert.itemName}
                    </Typography>
                    <Chip
                      label={alert.urgency}
                      color={getUrgencyColor(alert.urgency)}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                    {alert.status !== "pending" && (
                      <Box
                        sx={{
                          ml: "auto",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ mr: 1, textTransform: "capitalize" }}
                        >
                          {alert.status}
                        </Typography>
                        {getStatusIcon(alert.status)}
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Tooltip title="Quantity">
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        Qty: {alert.quantity}
                      </Typography>
                    </Tooltip>

                    <Tooltip title="Item sitting unused">
                      <Box
                        sx={{ display: "flex", alignItems: "center", mr: 2 }}
                      >
                        <AccessTime
                          fontSize="small"
                          sx={{ mr: 0.5, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          60+ days
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LocationOn
                      fontSize="small"
                      sx={{ color: "error.main", mr: 0.5 }}
                    />
                    <Typography variant="body2">
                      From: {alert.fromLocation}
                    </Typography>
                    <MoveDown sx={{ mx: 1, color: "text.secondary" }} />
                    <LocationOn
                      fontSize="small"
                      sx={{ color: "success.main", mr: 0.5 }}
                    />
                    <Typography variant="body2">
                      To: {alert.toLocation}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Info
                      fontSize="small"
                      sx={{ color: "info.main", mr: 1, mt: 0.3 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {alert.reasoning}
                    </Typography>
                  </Box>
                </Grid>

                {alert.status === "pending" && (
                  <Grid
                    item
                    xs={12}
                    sm={5}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mr: 2 }}
                      startIcon={<LocalShipping />}
                      onClick={() => handleAccept(alert.id)}
                    >
                      Initiate Transfer
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </Grid>
                )}

                {alert.error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{alert.error}</Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default RedistributionAlerts;
