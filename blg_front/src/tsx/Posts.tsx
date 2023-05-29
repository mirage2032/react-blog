import React, {Component, useContext, useState} from 'react';
import NavBar from "./NavBar";
import "../scss/Posts.scss"
import "./PostArticle"
import PostArticle from "./PostArticle";
import {Link, useParams} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrashAlt, faPenToSquare} from '@fortawesome/free-regular-svg-icons';
import {SessionContext} from '../sessionContext';

type CategoryChoice = {
    category: string;
}

type PostData = { created_at: string; content: string; username: string; post_uid: string }
type PostProp = { data: PostData, updateCallback: { (): void; } }
type PostsState = { posts: PostData[] }

const Post = (props: PostProp) => {
    const [editing, setEditing] = useState(false);
    const [currentContent, setCurrentContent] = useState(props.data.content);
    const {username} = useContext(SessionContext);

    const deletePost = () => {
        fetch('/api/deletepost', {
            method: 'POST',
            body: JSON.stringify({post_uid: props.data.post_uid}),
            headers: {'Content-Type': 'application/json'},
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                props.updateCallback();
            });
    };

    const handleChange = (event: any) => {
        setCurrentContent(event.target.value);
    };

    const switchEditingState = () => {
        if (editing && currentContent !== props.data.content) {
            fetch('/api/editpost', {
                method: 'POST',
                body: JSON.stringify({post_uid: props.data.post_uid, content: currentContent}),
                headers: {'Content-Type': 'application/json'},
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    props.updateCallback();
                });
        }
        setEditing(!editing);
    };

    return (
        <article className={'article'}>
            <span className={'article_username'}>User: {props.data.username}</span>
            {editing ? (
                <input
                    className={'article_content_editable'}
                    defaultValue={props.data.content}
                    onChange={handleChange}
                />
            ) : (
                <p className={'article_content'}>{props.data.content}</p>
            )}
            <p>{parseDBTime(props.data.created_at)}</p>
            {props.data.username===username?
                <>
                <button className={'article_btn'} onClick={deletePost}>
                    <FontAwesomeIcon icon={faTrashAlt}/>
                </button>
                <button
                    className={`article_btn ${editing ? 'article_btn_green' : ''}`}
                    onClick={switchEditingState}>
                    <FontAwesomeIcon icon={faPenToSquare}/>
                </button>
            </>:<></>}
        </article>
    );
};

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
                            this.state.posts.map((item) => (
                                <Post key={item.post_uid} data={item}
                                      updateCallback={this.fetchCategory.bind(this)}></Post>
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
