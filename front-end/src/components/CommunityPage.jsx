import React, { useState, useEffect } from 'react';
import './Commstyle.css';

function CommunityPage() {
    const [posts, setPosts] = useState([]);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load posts from localStorage on initial render
    useEffect(() => {
        const savedPosts = localStorage.getItem('communityPosts');
        if (savedPosts) {
            setPosts(JSON.parse(savedPosts));
        }
    }, []);

    // Save posts to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('communityPosts', JSON.stringify(posts));
    }, [posts]);

    const addPost = (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setFormError('');
        
        const title = event.target.title.value.trim();
        const author = event.target.author.value.trim();
        const content = event.target.content.value.trim();

        if (!title || !author || !content) {
            setFormError("Please fill in all fields.");
            setIsSubmitting(false);
            return;
        }

        // Create a new post with timestamp and ID
        const newPost = { 
            id: Date.now(), 
            title, 
            author, 
            content, 
            date: new Date().toLocaleDateString(),
            likes: 0
        };

        // Add the new post to the list
        setPosts([newPost, ...posts]);

        // Clear the form
        event.target.reset();
        setIsSubmitting(false);
    };

    const handleLike = (postId) => {
        setPosts(posts.map(post => 
            post.id === postId ? {...post, likes: post.likes + 1} : post
        ));
    };

    const deletePost = (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setPosts(posts.filter(post => post.id !== postId));
        }
    };

    return (
        <div className="community-page">
            <section className="community-header">
                <div className="header-content">
                    <h1>Empowering Health: Our Community Hub</h1>
                    <p>Share your experiences, ask questions, and connect with others on their healthcare journey</p>
                </div>
            </section>

            <div className="community-container">
                <section className="add-post-section">
                    <div className="form-card">
                        <div className="form-header">
                            <h2>Share Your Thoughts</h2>
                            <p>Create a new post to share with the community</p>
                        </div>
                        
                        {formError && <div className="form-error">{formError}</div>}
                        
                        <form id="post-form" onSubmit={addPost}>
                            <div className="form-group">
                                <label htmlFor="post-title">Title</label>
                                <input 
                                    type="text" 
                                    id="post-title" 
                                    name="title" 
                                    placeholder="What's your post about?" 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="post-author">Your Name</label>
                                <input 
                                    type="text" 
                                    id="post-author" 
                                    name="author" 
                                    placeholder="How should we address you?" 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="post-content">Your Message</label>
                                <textarea 
                                    id="post-content" 
                                    name="content" 
                                    placeholder="Share your thoughts, questions, or experiences..." 
                                    rows="5"
                                ></textarea>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Posting...' : 'Post to Community'}
                            </button>
                        </form>
                    </div>
                </section>

                <section className="posts-section">
                    <div className="posts-header">
                        <h2>Community Discussions</h2>
                        <p>{posts.length} {posts.length === 1 ? 'post' : 'posts'} shared</p>
                    </div>
                    
                    <div className="posts-container">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div className="post-card" key={post.id}>
                                    <div className="post-header">
                                        <h3>{post.title}</h3>
                                        <button 
                                            className="delete-button" 
                                            onClick={() => deletePost(post.id)}
                                            aria-label="Delete post"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    
                                    <div className="post-meta">
                                        <span className="post-author">{post.author}</span>
                                        <span className="post-date">{post.date}</span>
                                    </div>
                                    
                                    <div className="post-content">
                                        <p>{post.content}</p>
                                    </div>
                                    
                                    <div className="post-actions">
                                        <button 
                                            className="like-button" 
                                            onClick={() => handleLike(post.id)}
                                        >
                                            <span className="like-icon">❤️</span>
                                            <span className="like-count">{post.likes}</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">💬</div>
                                <h3>No posts yet</h3>
                                <p>Be the first to share your thoughts with the community!</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default CommunityPage;