/*
* App.js, main react file
* Shows navbar and pages
* Check to see which user is currently logged in
*/

// variables, file setups, import
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import client from './api/client';

// component pages
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import PostsList from './components/PostsList';
import BlogPostForm from './components/BlogPostForm';
import EditPost from './components/EditPost';

// styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/globals.css';

/*
************************
****** FUNCTIONS *******
************************
*/

/* Process: keep track of user || set user,
            show navigation bar,
            check route location (for signout)
*/
function RoutedApp() {

    // set current user
    const [currentUser, setCurrentUser] = useState(null);

    // current url
    const location = useLocation();

    // one-time health ping (for error handling)
    useEffect(() => {
        client.get('/health').then(result => 
            console.log('API health:', result.data)).catch(console.error);
    }, []);

     // re-check session whenever the route changes
    useEffect(() => {

        // variable declaration
        let isCancelled = false;

        // client information
        client
            .get('/auth/me')
            .then(result => { 
                if (!isCancelled) {

                    // set user to whoever is logged in
                    setCurrentUser(result.data.user || null);
                }
            })

            // errpr handling
            .catch(() => { 
                if (!isCancelled) {
                    setCurrentUser(null); 
                }
            });

        // clean up
        return () => { 
            isCancelled = true;
        };
    }, [location.pathname]);

    // signout method, clear current user and reload page
    const signOut = async () => {

        // wait for signout
        try {
            await client.post('/auth/signout');
        } 
        
        // clear user and refresh
        finally {
            setCurrentUser(null);
            window.location.href = '/';
        }
    };

    return (
        <>
        {/* top navbar */}
        <nav className="navbar navbar-light bg-light px-3">

            {/* home page */}
            <Link to="/" className="navbar-brand">Blog App</Link>
            <div className="d-flex align-items-center gap-2">

                {/* if signed in, show user */}
                {currentUser && <span className="text-muted small">Signed in as {currentUser.name} ({currentUser.user_id})</span>}

                {/* if not signed in, show default buttons */}
                {!currentUser && <Link to="/signin" className="btn btn-outline-primary btn-sm">Sign In</Link>}
                {!currentUser && <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>}

                {/* if signed in, show sign out button */}
                {currentUser && <button className="btn btn-outline-secondary btn-sm" onClick={signOut}>Sign Out</button>}
        
                {/* new post button */}
                <Link to="/new" className="btn btn-success btn-sm">New Post</Link>
            </div>
        </nav>

        {/* routes */}
        <div className="container py-4">
        <Routes>
            {/* all posts */}
            <Route path="/" element={<PostsList />} />

            {/* authentication pages */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* post pages */}
            <Route path="/new" element={<BlogPostForm />} />
            <Route path="/edit/:id" element={<EditPost />} />
        </Routes>
        </div>
        </>
    );
}

// set up router
export default function App() {
    return (
        <BrowserRouter>
            <RoutedApp />
        </BrowserRouter>
    );
}
