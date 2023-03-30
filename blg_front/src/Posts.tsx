import React, {Component} from 'react';
import MainPage from "./Main";
import "./Posts.css"

class Posts extends Component {

    state: { posts: { created_at: string; content: string; username: string }[] }

    constructor(props: any) {
        super(props);
        this.state = {
            posts: []
        };
    }

    componentDidMount() {
        fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify({category: 'buy'}),
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data)
                if (data.error) return;
                else this.setState({posts: data})
            })
    }

    render() {
        return (
            <div>
                <MainPage></MainPage>
                <div className={'articles'}>
                    {(
                        this.state.posts.map((item, index) => (
                            <article className={'article'} key={index}>
                                <span className={'article_username'}>User: {item.username}</span>
                                <p className={'article_content'}>{item.content}</p>
                                <p className={'article_created_at'}>{item.created_at}</p>
                            </article>
                        ))
                    )}
                </div>
            </div>
        )
    }

}

export default Posts;
