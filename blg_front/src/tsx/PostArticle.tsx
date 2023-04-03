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

    handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        const {content} = this.state;
        const {category} = this.props;
        fetch('/api/postarticle', {
            method: 'POST',
            body: JSON.stringify({content, category}),
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                this.props.updatefunc();
            })

    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label className={"articlelabel articleinput"}>
                        <span>Contenty:</span>
                        <textarea name="content" onChange={this.handleChange.bind(this)} required/>
                    </label>
                    <button className={"postarticlesubmit"} type="submit">Post</button>
                </form>
            </div>
        )
    }

}

export default PostArticle;
