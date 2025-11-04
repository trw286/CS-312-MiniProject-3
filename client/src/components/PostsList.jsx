// variables, file setup, and imports
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

/*
************************
****** FUNCTIONS *******
************************
*/
export default function PostsList() {

    // set data
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null); // single error state

    // load current user and posts on mount
    const load = async () => {
        setLoading(true);
        setErrorMsg(null);

        // gete posts and user information from routes
        try {
            const [currentUserResponse, postResponse] = await Promise.all([
                client.get('/posts'),
                client.get('/auth/me'),
            ]);

            // set posts and users
            setPosts(currentUserResponse.data.posts || []);
            setCurrentUser(postResponse.data.user || null);
        } 
        
        // error handling
        catch (error) {
            setErrorMsg('Failed to load posts.');
        } 
    
        finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // delete handler for owners
    const onDelete = async (blogId) => {

        // cancel delete post
        if (!window.confirm('Delete this post?')) {
            return;
        }

        // delete post
        try {
            await client.delete(`/posts/${blogId}`);
            setPosts(prev => prev.filter(post => post.blog_id !== blogId));
        } 
        
        // error handling
        catch (error) {
            alert(error.response?.data?.error || 'Error deleting post');
        }
    };

    // display loading to user
    if (loading) {
        return <div>Loading…</div>;
    }

    return (

        <div>
        {/* error message */}
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        {/* display post (one card per post) */}
        {posts.map(post => (

            <div key={post.blog_id} className="card mb-3 shadow-sm">
            <div className="card-body">

                {/* post contents */}
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">{post.body}</p>
                <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">

                    {/* post creator information */}
                    By {post.creator_name} ({post.creator_user_id}) • {new Date(post.date_created).toLocaleString()}

                </small>

                <div className="d-flex gap-2">
                    
                    {/* if user is also post creator*/}
                    {currentUser?.user_id === post.creator_user_id && (
                    
                    <>
                        {/* edir and delete privilages and buttons */}
                        <Link to={`/edit/${post.blog_id}`} className="btn btn-sm btn-outline-primary">Edit</Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(post.blog_id)}>
                        Delete
                        </button>

                    </>
                    )}

                </div>
                </div>

            </div>
            </div>
        ))}

        {/* message if no posts are in DB */}
        {posts.length === 0 && <div className="alert alert-secondary">No posts yet.</div>}
        </div>
    );
}