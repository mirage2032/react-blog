import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import {Routes, Route, BrowserRouter, Navigate} from "react-router-dom";
import Register from "./tsx/Register";
import Login from "./tsx/Login";
import PostsCategory from "./tsx/Posts";
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to='/posts'></Navigate>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/posts" element={<Navigate to="/posts/buy" replace></Navigate>}></Route>
                <Route path="/posts/:category" element={<PostsCategory/>}></Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
