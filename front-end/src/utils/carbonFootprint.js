/**
 * Calculate carbon footprint reduction based on donation type and quantity
 * 
 * @param {string} donationType - Type of donation (medicine, equipment, blood)
 * @param {number} quantity - Quantity of items donated (default 1 for blood donations)
 * @returns {Object} Carbon footprint data
 */
export const calculateCarbonReduction = (donationType, quantity = 1) => {
    // Base carbon reduction values in kg CO2 equivalent per unit
    const baseReduction = {
      medicine: 2.3, // kg CO2e per medicine unit (considering manufacturing & disposal)
      equipment: 8.7, // kg CO2e per medical equipment (average)
      blood: 4.5, // kg CO2e per blood donation (transportation & processing saved)
    };
  
    // Convert quantity to number to ensure proper calculation
    const numericQuantity = Number(quantity) || 1;
    
    // Calculate total carbon reduction
    const totalReduction = baseReduction[donationType] * numericQuantity;
    
    // Environmental equivalents for visualization
    const equivalents = {
      treeHours: Math.round(totalReduction * 1.2), // Hours of oxygen a tree would need to produce
      carMiles: Math.round(totalReduction * 2.5), // Miles of driving avoided
      lightBulbHours: Math.round(totalReduction * 33), // Hours of LED light bulb usage
    };
    
    return {
      totalReduction: Number(totalReduction.toFixed(2)),
      equivalents,
      donationType
    };
  };
  
  /**
   * Get a visual representation for the carbon footprint reduction
   * 
   * @param {string} donationType - Type of donation
   * @returns {string} Emoji representation
   */
  export const getCarbonIcon = (donationType) => {
    switch(donationType) {
      case 'medicine':
        return '🌿';
      case 'equipment':
        return '🌎';
      case 'blood':
        return '🌱';
      default:
        return '🌳';
    }
  };
  
  /**
   * Format carbon number with units
   * 
   * @param {number} value - Carbon reduction value
   * @returns {string} Formatted string
   */
  export const formatCarbon = (value) => {
    return `${value} kg CO₂e`;
  };