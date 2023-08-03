import React from 'react';
import useAuth from './useAuth';

function Home({ code }) {
    const accessToken = useAuth(code)
    return ( <div>{ code } </div>
 )
}

export default Home;
