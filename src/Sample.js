import React, { Component } from 'react';
import { Editor, EditorState } from 'draft-js';

class Sample extends Component {
    state = {
        editorState: EditorState.createEmpty()
    }
    onChange = newState => {
        this.setState({ editorState: newState })
    }
    render() {
        const { editorState } = this.state
        return (
            <div>
                <Editor editorState={editorState} onChange={this.onChange}/>
            </div>
        )
    }
}