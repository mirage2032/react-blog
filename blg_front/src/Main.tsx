import React, {Component} from 'react';
import './Main.css';
import Cookies from "js-cookie";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-regular-svg-icons';

const navbar_title = (
    <h1>The Deal</h1>
)

const navbar_nologin = (
    <nav>
        <a className={'navButton navButton-left'} href={"/login"}>LOG IN</a>
        {navbar_title}
        <a className={'navButton navButton-right'} href={"/register"}>REGISTER</a>
    </nav>
)

class MainPage extends Component<any, any> {

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
        this.setState({
            logged_in: false,
            navbar: navbar_nologin
        })
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
                            <a className={'navButton navButton-right'} href={"/account"}><FontAwesomeIcon
                                icon={faUser}/>&nbsp;{data.username}
                            </a>
                        </nav>
                    )
                })
            })
    }

    render() {
        return this.state.navbar
    }

}

export default MainPage;
