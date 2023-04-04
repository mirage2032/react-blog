import React, {Component} from 'react';
import '../scss/NavBar.scss';
import Cookies from "js-cookie";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-regular-svg-icons';
import {Link} from "react-router-dom";

const navbar_title = (
    <h1>The Deal</h1>
)

const navbar_nologin = (
    <nav>
        <Link to="/login" className={'navButton navButton-left'}>LOGIN</Link>
        {navbar_title}
        <Link to="/register" className={'navButton navButton-right'}>REGISTER</Link>
    </nav>
)

class NavBar extends Component<any, any> {

    state: { logged_in: boolean; navbar: JSX.Element }

    constructor(props: any) {
        super(props);
        this.state = {
            logged_in: false,
            navbar: navbar_nologin
        };
    }

    logOut() {
        Cookies.remove("user_token");
        window.location.replace('/')
    }

    componentDidMount() {
        fetch('/api/user/data', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Could not authenticate');
                }
                return response.json();
            })
            .then(data => {
                this.setState({
                    logged_in: true,
                    navbar: (
                        <nav>
                            <button className={'navButton navButton-left'} onClick={this.logOut.bind(this)}>LOG OUT
                            </button>
                            {navbar_title}
                            <Link to="/account" className={'navButton navButton-right'}><FontAwesomeIcon
                                icon={faUser}/>&nbsp;{data.username}
                            </Link>
                        </nav>
                    )
                })
            })
    }

    render() {
        return this.state.navbar
    }

}

export default NavBar;
