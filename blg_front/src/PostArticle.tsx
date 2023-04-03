import React, {Component} from 'react';
import "./PostArticle.css"

class PostArticle extends Component<any, any> {

    state: { content: string; category: string }

    constructor(props: any) {
        super(props);
        this.state = {
            content: "",
            category: "buy"
        };
    }

    handleChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        const {content, category} = this.state;
        fetch('/api/postarticle', {
            method: 'POST',
            body: JSON.stringify({content, category}),
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                    window.location.href = '/posts';
                }
            )

    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label className={"articlelabel articleinput"}>
                        <span>Contenty:</span>
                        <textarea name="content" onChange={this.handleChange.bind(this)} required/>
                    </label>
                    <div className={"spacebetween"}>
                        <label className={"articlelabel articlecategory"}>
                            <span>Category:</span>
                            <select name="category" defaultValue="buy" onChange={this.handleChange.bind(this)}>
                                <option value={"buy"}>Buy</option>
                                <option value={"sell"}>Sell</option>
                            </select>
                        </label>
                        <button className={"postarticlesubmit"} type="submit">Post</button>
                    </div>
                </form>
            </div>
        )
    }

}

export default PostArticle;
