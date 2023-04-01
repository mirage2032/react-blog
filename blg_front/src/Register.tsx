import React, {Component} from 'react';
import './RegLogin.css';

class Register extends Component<any, any> {
    state: { attempt_made: boolean; attempt_success: boolean; name: string; password: string; email: string; }

    constructor(props: any) {
        super(props);
        this.state = {
            attempt_made: false,
            attempt_success: false,
            name: '',
            email: '',
            password: '',
        };
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        const sha256 = require('js-sha256');
        const {name, password, email} = this.state;
        fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify({name, password: sha256(password), email}),
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) this.setState({attempt_made: true, attempt_success: false})
                else {
                    this.setState({attempt_made: true, attempt_success: true})
                    window.location.href = '/posts';
                }
            })

    }

    render() {
        return (
            <div>
                <main>
                    <div className={"regform_container"}>
                        <form onSubmit={this.handleSubmit.bind(this)}>
                            <label><span>NAME:</span>
                                <input type="text" name="name" onChange={this.handleChange.bind(this)} required/>
                            </label><br/>
                            <label><span>PASSWORD:</span>
                                <input type="password" name="password" onChange={this.handleChange.bind(this)}
                                       required/>
                            </label><br/>
                            <label><span>EMAIL:</span>
                                <input type="email" name="email" onChange={this.handleChange.bind(this)} required/>
                            </label><br/>
                            <button className={"buttonSubmit"} type="submit"
                                    style={{visibility: this.state.attempt_success ? 'hidden' : 'visible'}}>Register
                            </button>
                            {
                                this.state.attempt_made ? (
                                    this.state.attempt_success ?
                                        <p className={"regnotif regnotifpos"}>REGISTERED</p>
                                        : <p className={"regnotif regnotifneg"}>REGISTRATION FAILED</p>
                                ) : <p className={"regnotif"}>&nbsp;</p>
                            }
                        </form>
                    </div>
                </main>
            </div>
        )
    }

}

export default Register;
