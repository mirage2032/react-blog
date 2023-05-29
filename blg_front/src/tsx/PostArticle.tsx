import React, {Component} from 'react';
import "../scss/PostArticle.scss"

type PostArticleProps = { updatefunc: Function; category: string }

class PostArticle extends Component<PostArticleProps, any> {

    state: { content: string }

    constructor(props: any) {
        super(props);
        this.state = {
            content: ""
        };
    }

    handleChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) {
        this.setState({[event.target.name]: event.target.value});
    }
    async handleSubmit(event: any) {
        event.preventDefault();
        const {content} = this.state;
        const {category} = this.props;
        const response = await fetch('/api/post', {
            method: 'POST',
            body: JSON.stringify({content, category}),
            headers: {'Content-Type': 'application/json'}
        })
        if (!response.ok){
            console.log("Response from API was not OK.")
            return
        }
        this.props.updatefunc()
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label className={"articlelabel articleinput"}>
                        <span>Contenty:</span>
                        <textarea name="content" onChange={this.handleChange.bind(this)} required/>
                    </label>
                    <button className={"button-tp1"} type="submit">Post</button>
                </form>
            </div>
        )
    }

}

export default PostArticle;
