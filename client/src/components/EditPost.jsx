// variables, file setup, and imports
import { useEffect, useState } from 'react';
import client from '../api/client';
import { useNavigate, useParams } from 'react-router-dom';

/*
************************
****** FUNCTIONS *******
************************
*/
export default function EditPost() {

    // route param (post id)
    const { id } = useParams();

    // helper to move pages
    const navigate = useNavigate();

    // user values
    const [form, setForm] = useState({ title: '', body: '' });

    // loading and message states
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    // get post by id and prefill form
    useEffect(() => {

        // reset state for new id
        setLoading(true);
        setMessage(null);

        // fetch post (IIFE pattern so we can use async/await)
        (async () => {
            try {
                const response = await client.get(`/posts/${id}`);
                const post = response.data.post;

                // set values
                setForm({ title: post.title, body: post.body });
            }

            // error handling
            catch (error) {
                setMessage(error.response?.data?.error || 'Error loading post.');
            }

            // always stop loading
            finally {
                setLoading(false);
            }
        })();

    }, [id]);

    // update dynamically as information is entered
    const onChange = event => setForm({ ...form, [event.target.name]: event.target.value });

    // on "save changes"
    const onSubmit = async event => {
        event.preventDefault();
        setMessage(null);

        // trim and validate before sending to backend
        const payload = {
            title: form.title.trim(),
            body: form.body.trim(),
        };

        if (!payload.title || !payload.body) {
            setMessage('Please fill in both Title and Content.');
            return;
        }

        // update post and redirect to home page
        try {
            const { data } = await client.put(`/posts/${id}`, payload);
            setMessage(data.message || 'Post updated successfully.');
            navigate(`/`);
        }

        // error handling (e.g., 403 Not owner, 404 Not found)
        catch (error) {
            setMessage(error.response?.data?.error || 'Update failed.');
        }
    };

    // display loading to user
    if (loading) {
        return <div>Loading…</div>;
    }

    return (

        // container
        <div className="card mx-auto" style={{ maxWidth: '720px' }}>

            <div className="card-body">

                {/* edit post */}
                <h5 className="card-title mb-3">Edit Post</h5>

                {/* form, make API call here */}
                <form onSubmit={onSubmit}>

                    <div className="mb-3">

                        {/* title field */}
                        <label className="form-label">Title</label>
                        <input
                            className="form-control"
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            required
                        />

                    </div>

                    <div className="mb-3">

                        {/* content field */}
                        <label className="form-label">Content</label>
                        <textarea
                            className="form-control"
                            rows={6}
                            name="body"
                            value={form.body}
                            onChange={onChange}
                            required
                        />

                    </div>

                    {/* save + cancel buttons */}
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" type="submit">Save Changes</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                    </div>

                </form>

                {/* message for errors or successes */}
                {message && <div className="alert alert-info mt-3">{message}</div>}

            </div>

        </div>
    );
}
