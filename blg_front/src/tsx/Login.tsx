import React, {Component} from 'react';
import '../scss/RegLogin.scss';
import Cookies from 'js-cookie';
import {Navigate} from "react-router-dom";
import {sha256} from 'js-sha256';
import {tokendata_encrypted} from "./types/common";

class Login extends Component<any, any> {

    state: { attempt_made: boolean; attempt_success: boolean; password: string; email: string; }

    constructor(props: any) {
        super(props);
        this.state = {
            attempt_made: false,
            attempt_success: false,
            email: '',
            password: '',
        };
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({[event.target.name]: event.target.value});
    }

    async handleSubmit(event: any) {
        event.preventDefault();
        const {password, email} = this.state;
        const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({password: sha256(password), email}),
            headers: {'Content-Type': 'application/json'}
        })
        if (!response.ok) {
            this.setState({attempt_made: true, attempt_success: false})
            console.log("Response from API was not OK.")
            return
        }
        const data: { user_token: tokendata_encrypted } = await response.json()
        this.setState({attempt_made: true, attempt_success: true})
        Cookies.set("user_token", JSON.stringify(data.user_token), {expires: 3 * 24});
    }

    render() {
        return (
            <div>
                <main>
                    <div className={"regform_container"}>
                        <form onSubmit={this.handleSubmit.bind(this)}>
                            <label><span>EMAIL:</span>
                                <input type="email" name="email" onChange={this.handleChange.bind(this)} required/>
                            </label><br/>
                            <label><span>PASSWORD:</span>
                                <input type="password" name="password" onChange={this.handleChange.bind(this)}
                                       required/>
                            </label><br/>
                            <button className={"buttonSubmit"} type="submit"
                                    style={{visibility: this.state.attempt_success ? 'hidden' : 'visible'}}>Log In
                            </button>
                            {
                                this.state.attempt_made ? (
                                    this.state.attempt_success ?
                                        <Navigate to='/posts'></Navigate>
                                        : <p className={"regnotif regnotifneg"}>FAILED</p>
                                ) : <p className={"regnotif"}>&nbsp;</p>
                            }
                        </form>
                    </div>
                </main>
            </div>
        )
    }

}

export default Login;
