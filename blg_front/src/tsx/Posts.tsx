import React, {Component} from 'react';
import NavBar from "./NavBar";
import "../scss/Posts.scss"
import "./PostArticle"
import PostArticle from "./PostArticle";
import {Link, useParams} from "react-router-dom";

type CategoryChoice = {
    category: string;
}

type PostsState = { posts: { created_at: string; content: string; username: string }[] }

class Posts extends Component<CategoryChoice, PostsState> {

    constructor(props: any) {
        super(props);
        this.state = {
            posts: []
        };
    }

    componentDidMount() {
        this.fetchCategory()
    }

    componentDidUpdate(prevProps: Readonly<CategoryChoice>, prevState: Readonly<PostsState>, snapshot?: any) {
        if (prevProps.category !== this.props.category) {
            this.fetchCategory()
        }
    }

    fetchCategory() {
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
        return (
            <div>
                <NavBar></NavBar>
                <div className={'articles'}>
                    <PostArticle updatefunc={this.fetchCategory.bind(this)}
                                 category={this.props.category}></PostArticle>
                    <main className={"articlecontainer"}>
                        <div className={"categcontainer"}>
                            <p>Choose Category</p>
                            <div>
                                <Link to='/posts/buy'>
                                    <button>Buy</button>
                                </Link>
                                <Link to='/posts/sell'>
                                    <button>Sell</button>
                                </Link>
                            </div>
                        </div>
                        {(
                            this.state.posts.map((item, index) => (
                                <article className={'article'} key={index}>
                                    <span className={'article_username'}>User: {item.username}</span>
                                    <p className={'article_content'}>{item.content}</p>
                                    <p className={'article_created_at'}>{parseDBTime(item.created_at)}</p>
                                </article>
                            ))
                        )}
                    </main>
                </div>
            </div>
        )
    }

}

function parseDBTime(dbtime: string) {
    const date = new Date(dbtime);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
    };
    return date.toLocaleString('en-US', options);
}

function PostsCategory() {
    const {category} = useParams();
    return (
        <Posts category={category!}></Posts>
    )
}

export default PostsCategory;
