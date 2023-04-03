import React, {Component} from 'react';
import NavBar from "./NavBar";
import "./Posts.css"
import "./PostArticle"
import PostArticle from "./PostArticle";
import {useParams, Link} from "react-router-dom";

type CategoryChoice = {
    category:string;
}

type PostsState = { posts: { created_at: string; content: string; username: string }[] }
class Posts extends Component<CategoryChoice, PostsState> {

    constructor(props: any) {
        super(props);
        this.state = {
            posts: []
        };
    }
    fetchCategory(){
        fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify({category: this.props.category}),
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
        this.fetchCategory()
        return (
            <div>
                <NavBar></NavBar>
                <div className={'articles'}>
                    <PostArticle></PostArticle>
                    <div className={"categcontainer"}>
                        <p>Choose Category</p>
                        <div>
                            <Link to='/posts/buy'><button>Buy</button></Link>
                            <Link to='/posts/sell'><button>Sell</button></Link>
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

function PostsCategory() {
    const {category} = useParams();
    return(
        <Posts category={category!}></Posts>
    )
}

export default PostsCategory;
