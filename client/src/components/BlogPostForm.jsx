// variables, file setup, and imports
import { useState } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

/*
************************
****** FUNCTIONS *******
************************
*/
export default function BlogPostForm() {

    // user values
    const [form, setForm] = useState({ title: '', body: '' });

    // success/error messages
    const [message, setMessage] = useState(null);

    // helper to move pages
    const navigate = useNavigate();

    // update dynamically as information is entered
    const onChange = event => setForm({ ...form, [event.target.name]: event.target.value });

    // on "publish"
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

        // create post and redirect to home page
        try {
            const { data } = await client.post('/posts', payload);
            setMessage(data.message || 'Post created successfully.');
            navigate(`/`);
        }

        // error handling
        catch (error) {
            setMessage(error.response?.data?.error || 'Post creation failed.');
        }
    };

    return (

        // container
        <div className="card mx-auto" style={{ maxWidth: '720px' }}>

            <div className="card-body">

                {/* new post */}
                <h5 className="card-title mb-3">Create New Post</h5>

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

                    {/* publish + cancel buttons */}
                    <div className="d-flex gap-2">
                        <button className="btn btn-success" type="submit">Publish</button>
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
