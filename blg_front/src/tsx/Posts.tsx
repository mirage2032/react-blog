import React, {Component} from 'react';
import NavBar from "./NavBar";
import "../scss/Posts.scss"
import "./PostArticle"
import PostArticle from "./PostArticle";
import {Link, useParams} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrashAlt} from '@fortawesome/free-regular-svg-icons';

type CategoryChoice = {
    category: string;
}

type PostData = { created_at: string; content: string; username: string; post_uid: string }
type PostProp = { data: PostData, updateCallback: { (): void; } }
type PostState = { editing: boolean }
type PostsState = { posts: PostData[] }

class Post extends Component<PostProp, PostState> {
    constructor(props: any) {
        super(props);
        this.state = {editing: false};
    }

    deletePost() {
        fetch('/api/deletepost', {
            method: 'POST',
            body: JSON.stringify({post_uid: this.props.data.post_uid}),
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                this.props.updateCallback()
            })
    }

    render() {
        return (
            <article className={'article'}>
                <span className={'article_username'}>User: {this.props.data.username}</span>
                <p>{this.props.data.content}</p>
                <p>{parseDBTime(this.props.data.created_at)}</p>
                <button className={'article_remove_btn'} onClick={this.deletePost.bind(this)}><FontAwesomeIcon
                    icon={faTrashAlt}/></button>
            </article>
        );
    }
}

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
                this.setState({posts: data})
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
                                    <button className={"button-tp1"}>Buy</button>
                                </Link>
                                <Link to='/posts/sell'>
                                    <button className={"button-tp1"}>Sell</button>
                                </Link>
                            </div>
                        </div>
                        {(
                            this.state.posts.map((item, index) => (
                                <Post data={item} updateCallback={this.fetchCategory.bind(this)}></Post>
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
