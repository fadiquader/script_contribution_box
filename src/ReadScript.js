import React, { Component } from 'react';
import {
    Editor,
    EditorState,
    convertFromRaw,
    convertToRaw,
} from 'draft-js';
import { decorator } from './strategies';
import { CHARACTER, DIALOGUE } from './constants';

class ReadScript extends Component {
    constructor() {
        super();
        this.state = {
            editorState: EditorState.createEmpty(decorator),
            showReadMore: false,
            isCollapsed: false
        };
    }

    componentWillMount() {
        const { initialState } = this.props;
        if(initialState != null)
            this.prepareState(initialState);
    }

    componentDidMount() {
        if(this.readScript) this.showMore();
    }

    componentWillReceiveProps(next) {
        const { initialState } = next;
        if(initialState == null) return;
        if(initialState !== this.initialState) {
            this.prepareState(initialState)
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { initialState } = prevProps;
        if(initialState && initialState !== this.props.initialState) {
            this.showMore();
        }
    }

    prepareState(initialState) {
        const _contentState = convertFromRaw(JSON.parse(initialState));
        const editorState = EditorState.createWithContent(_contentState, decorator);
        this.onChange(editorState)
    }

    showMore() {
        const hight = this.readScript.clientHeight;
        const showMore =  hight > 300;
        this.setState({ showMore });
    }

    onChange = (editorState) => this.setState({ editorState });

    toggleReadMore = e => {
        e.preventDefault();
        this.setState(prev => ({ ...prev, isCollapsed: !prev.isCollapsed}))
    };
    blockStyleFn = block => {
        const type = block.getType();
        switch (type) {
            case CHARACTER:
                return 'courier character';
            case DIALOGUE:
                return 'courier dialogue';
            default:
                return 'courier action';
        }
    };
    render() {
        const { showMore, isCollapsed } = this.state;
        return (
            <div ref="editorWrapper">
                <div className={`editor-s ${!isCollapsed ? 'expanded-script': ''}`}>
                    <div ref={(node) => { this.readScript = node; }}>
                        <Editor ref="editor"
                                editorState={this.state.editorState}
                                onChange={this.onChange}
                                blockStyleFn={this.blockStyleFn}
                                readOnly={true}
                        />
                    </div>
                </div>
                {showMore && <div className="text-right">
                    <a onClick={this.toggleReadMore}>{!isCollapsed ? 'Read More':''}
                    <i className={`fa ${!isCollapsed ? 'fa-chevron-down': 'fa-chevron-up'} fa-fw`}></i></a>
                </div>}
            </div>
        );
    }
}

ReadScript.defaultProps = {
    initialState: null,
};

export  { ReadScript };