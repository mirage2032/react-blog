import React, {useContext, useEffect, useState} from 'react';
import '../scss/NavBar.scss';
import Cookies from 'js-cookie';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-regular-svg-icons';
import {Link} from 'react-router-dom';
import {SessionContext} from '../sessionContext';


const navbarTitle = (
    <h1>The Deal</h1>
);

const navbarNoLogin = (
    <nav>
        <Link to="/login" className={'navButton navButton-left'}>
            LOGIN
        </Link>
        {navbarTitle}
        <Link to="/register" className={'navButton navButton-right'}>
            REGISTER
        </Link>
    </nav>
);
const NavBar = () => {
    const [navbar, setNavbar] = useState(navbarNoLogin);
    const sessionContext = useContext(SessionContext);
    const logOut = () => {
        Cookies.remove('user_token');
        window.location.replace('/');
    };

    useEffect(() => {
        fetch('/api/user/data', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Could not authenticate');
                }
                return response.json();
            })
            .then((data) => {
                setNavbar(
                    <nav>
                        <button className={'navButton navButton-left'} onClick={logOut}>
                            LOG OUT
                        </button>
                        {navbarTitle}
                        <Link to="/account" className={'navButton navButton-right'}>
                            <FontAwesomeIcon icon={faUser}/>&nbsp;{data.username}
                        </Link>
                    </nav>
                );
                sessionContext.setSessionData(data.username, data.user_uid)
            });
    }, [sessionContext]);

    return navbar;
};

export default NavBar;