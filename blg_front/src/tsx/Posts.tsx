import React, {useContext, useEffect, useState, useCallback} from 'react';
import NavBar from "./NavBar";
import "../scss/Posts.scss"
import {Link, useParams} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrashAlt, faPenToSquare} from '@fortawesome/free-regular-svg-icons';
import {SessionContext} from '../sessionContext';


type PostData = { created_at: string; content: string; username: string; post_uid: string }
type PostProp = { data: PostData, updateCallback: { (): void; } }
type PostArticleProps = { updatefunc: Function; category: string };

const PostArticle: React.FC<PostArticleProps> = ({updatefunc, category}) => {
    const [content, setContent] = useState("");
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const response = await fetch('/api/post', {
            method: 'POST',
            body: JSON.stringify({content, category}),
            headers: {'Content-Type': 'application/json'}
        });

        if (!response.ok) {
            console.log("Response from API was not OK.");
            return;
        }

        updatefunc();
    };

    return (
        <div>
            <form className={"postform"} onSubmit={handleSubmit}>
                <label className={"articlelabel articleinput"}>
                    <span>Content:</span>
                    <textarea name="content" onChange={handleChange} required/>
                </label>
                <button className={"button-tp1"} type="submit">Post</button>
            </form>
        </div>
    );
}
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
            {props.data.username === username ?
                <>
                    <button className={'article_btn'} onClick={deletePost}>
                        <FontAwesomeIcon icon={faTrashAlt}/>
                    </button>
                    <button
                        className={`article_btn ${editing ? 'article_btn_green' : ''}`}
                        onClick={switchEditingState}>
                        <FontAwesomeIcon icon={faPenToSquare}/>
                    </button>
                </> : <></>}
        </article>
    );
};

const Posts = () => {
    const {category} = useParams();
    const [posts, setPosts] = useState<PostData[]>([]);

    const fetchCategory = useCallback(() => {
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
                setPosts(data);
            })
    }, [category]);

    useEffect(() => {
        fetchCategory();
    }, [category, fetchCategory]);

    return (
        <div>
            <NavBar/>
            <div className={'articles'}>
                <PostArticle updatefunc={fetchCategory} category={category!}/>
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
                    {posts.map((item) => (
                        <Post key={item.post_uid} data={item} updateCallback={fetchCategory}/>
                    ))}
                </main>
            </div>
        </div>
    );
}

export default Posts;

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
