// variables, file setup, and imports
import { useState } from "react";
import client from "../api/client";
import { useNavigate } from "react-router-dom";

/*
************************
****** FUNCTIONS *******
************************
*/
export default function SignUp() {

    // user values
    const [form, setForm] = useState({ user_id: '', password: '', name: '' });

    // // success/error messages
    const [message, setMessage] = useState(null);

    // helper to move pages
    const navigate = useNavigate();

    // update dynamically as information is entered
    const onChange = event => setForm({ ...form, [event.target.name]: event.target.value });

    // on "sign up"
    const onSubmit = async error => {
        error.preventDefault();
        setMessage(null);

        // validate user and redirect to signin page
        try {
            const { data } = await client.post('/auth/signup', form);
            setMessage(data.message || 'Sign-up successful.');
            navigate(`/signin`);
        } 
        
        // error handling
        catch (error) {
            setMessage(error.response?.data?.error || 'Sign-up failed.');
        }
    };

    return (

        // container
        <div className = "card mx-auto" style = {{ maxWidth: '400px' }}>

            <div className = "card-body">

                { /* sign up */}
                <h5 className = "card-title mb-3">Sign Up</h5>

                { /* form, make API call here */}
                <form onSubmit = {onSubmit}>

                    <div className = "mb-3">

                        { /* userID field */}
                        <label className = "form-label">User ID</label>
                        <input className = "form-control" name = "user_id" value = {form.user_id} onChange = {onChange} required />

                    </div>

                    <div className = "mb-3">

                        { /* password field */}
                        <label className = "form-label">Password</label>
                        <input className = "form-control" name = "password" type = "password" value = {form.password} onChange = {onChange} required />

                    </div>

                    <div className = "mb-3">

                        { /* username field */}
                        <label className = "form-label">Name</label>
                        <input className = "form-control" name = "name" value = {form.name} onChange = {onChange} required />

                    </div>

                    { /* sign up button */}
                    <button className = "btn btn-primary w-100" type = "submit">Create Account</button>

                </form>

                { /* message for errors or successes */}
                {message && <div className = "alert alert-info mt-3">{message}</div>}

            </div>

        </div>
    );
}