import React, {Component} from 'react';
import './Main.css';

class MainPage extends Component {

    state: { logged_in: boolean; name: string; navbar: JSX.Element }

    constructor(props: any) {
        super(props);
        this.state = {
            logged_in: false,
            name: '',
            navbar: (
                <nav>
                    <a className={'navButton'} href={"/login"}>LOG IN</a>
                    <span><h1>BLOG</h1></span>
                    <a className={'navButton'} href={"/register"}>REGISTER</a>
                </nav>)
        };
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
                    name: data.username,
                    navbar: (
                        <nav>
                            <a className={'navButton'} href={"/logout"}>LOG OUT</a>
                            <span><h1>BLOG</h1></span>
                            <a className={'navButton'} href={"/account"}>{data.username}</a>
                        </nav>
                    )
                })
            })
    }

    render() {
        return (
            <div>
                {this.state.navbar}
                <main>
                </main>
            </div>
        )
    }

    rotatelogo() {

    }
}

export default MainPage;
