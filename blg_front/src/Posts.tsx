import React, {Component} from 'react';
import NavBar from "./NavBar";
import "./Posts.css"
import "./PostArticle"
import PostArticle from "./PostArticle";

class Posts extends Component<any, any> {

    state: { posts: { created_at: string; content: string; username: string }[] }

    constructor(props: any) {
        super(props);
        this.state = {
            posts: []
        };
    }

    setCategory(category:string){
        fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify({category: category}),
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
    setBuy(){
        this.setCategory('buy')
    }
    setSell(){
        this.setCategory('sell')
    }

    render() {
        return (
            <div>
                <NavBar></NavBar>
                <div className={'articles'}>
                    <PostArticle></PostArticle>
                    <div className={"categcontainer"}>
                        <p>Choose Category</p>
                        <div>
                            <button onClick={this.setBuy.bind(this)}>Buy</button>
                            <button onClick={this.setSell.bind(this)}>Sell</button>
                        </div>
                    </div>
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
