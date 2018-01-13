import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Draft from 'draft-js';
import  { getSelectedBlockNode } from './utils';

export class AddButton extends Component {
    constructor(props) {
        super(props);
        const {getEditorState} = props;
        const editorState = getEditorState();
        const _currentStyle = editorState.getCurrentInlineStyle();
        const selection = editorState.getSelection();
        const _blockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();

        this.state = {
            style: {},
            visible: false,
            isOpen: false,
            currentStyle: _currentStyle,
            blockType : _blockType,
            showURLInput: false,
            urlValue: '',
            urlType: ''
        };

        this.node = null;
        this.blockKey = '';
        this.blockType = '';
        this.blockLength = -1;

        this.sendPost = this.props.sendPost;
        this.editor = this.props.editor;
        this.editorStyles = this.props.editorStyles;
        this.confirmUrl = this._confirmUrl.bind(this);
        this.cancelUrlFn = this._cancelUrl.bind(this);
        this.selectionIsCollapsed = this.props.selectionCollapsed;
        this.findNode = this.findNode.bind(this);
        this.hideBlock = this.hideBlock.bind(this);
        this.openToolbar = this.openToolbar.bind(this);
        this.onURLChange = (e,newState, handleConfirm) => this._onUrlChange(e, newState, handleConfirm);
        this.blockIsActive = this.props.blockIsActive;
        this.customBlockIsActive = this.props.customBlockIsActive;
        this.customBlockToggleFn = this._customBlockToggleFn.bind(this);
        this.getInput = this._getInput.bind(this);
        this.findStyleObjectByName = this._findStyleObjectByName.bind(this);

    }
    _customBlockToggleFn(blockName){
        const styleObject = this.findStyleObjectByName(blockName);
        if(styleObject.toggleFn === null) return;

        if(styleObject.requiresSelection && this.editor.selectionIsCollapsed()) return;

        if(styleObject.requiresInput) {
            this.getInput(styleObject.label);
            return;
        }
        // styleObject.toggleFn(this.editor);
        styleObject.toggleFn(this.editor, blockName, this.state.urlValue);
        this.hideBlock()
    }
    _findStyleObjectByName(name) {
        let customStyles = this.editorStyles.CUSTOM_STYLES;
        const matches = customStyles.filter(function(style) {
            return (style.label === name || style.style === name);
        });
        return matches[0];
    }
    _getInput(type){
        this.setState({showURLInput: true, urlType: type});
    }
    _onUrlChange(event, newState, handleConfirm) {
        if(event !== null) {
            this.setState({urlValue: event.target.value});
        } else {
            this.setState({urlValue: newState}, () => {
                if(handleConfirm)  this.confirmUrl(null);
            });
        }
    }

    _confirmUrl(e){
        if(e !== null) e.preventDefault();
        const styleObject = this.findStyleObjectByName(this.state.urlType);

        if(styleObject.toggleFn == null)
            return;

        styleObject.toggleFn(this.editor, this.state.urlType, this.state.urlValue);
        this.hideBlock();
    }

    _cancelUrl() {
        this.setState({showURLInput: false, urlValue: '', urlType: ''});
    }
    // To show + button only when text length == 0
    componentWillReceiveProps(newProps) {
        const { getEditorState } = newProps;
        const editorState = getEditorState();
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        if (!selectionState.isCollapsed() || selectionState.anchorKey !== selectionState.focusKey || contentState.getBlockForKey(selectionState.getAnchorKey()).getType().indexOf('atomic') >= 0) {
            this.hideBlock();
            return;
        }
        const block = contentState.getBlockForKey(selectionState.anchorKey);
        const bkey = block.getKey();
        if (block.getLength() > 0) {
            this.hideBlock();
            return;
        }
        if (block.getType() !== this.blockType) {
            this.blockType = block.getType();
            if (block.getLength() === 0) {
                setTimeout(this.findNode, 0);
            }
            this.blockKey = bkey;
            return;
        }
        if (this.blockKey === bkey) {
            // console.log('block exists');
            if (block.getLength() > 0) {
                this.hideBlock();
            } else {
                this.setState({
                    visible: true,
                });
            }
            return;
        }
        this.blockKey = bkey;
        if (block.getLength() > 0) {
            // console.log('no len');
            this.hideBlock();
            return;
        }
        setTimeout(this.findNode, 0);
    }

    hideBlock() {
        if (this.state.visible) {
            this.setState({
                visible: false,
                isOpen: false,
                showURLInput: false,
                urlValue: '',
                urlType: ''
            });
        }
    }

    openToolbar() {
        this.setState({
            isOpen: !this.state.isOpen,
        }, this.props.focus);
    }

    findNode() {
        // eslint-disable-next-line no-undef
        const node = getSelectedBlockNode(window);
        if (node === this.node) {
            // console.log('Node exists');
            return;
        }
        if (!node) {
            // console.log('no node');
            this.setState({
                visible: false,
                isOpen: false,
            });
            return;
        }
        // const rect = node.getBoundingClientRect();
        this.node = node;
        this.setState({
            visible: true,
            style: {
                // top: node.offsetTop - 3,
                top: node.offsetTop + 16,
            },
        });
    }

    render() {
        if (this.state.visible) {
            return (
                <div>
                    <div className="fe-side-toolbar" style={this.state.style}>
                        <button
                            onClick={this.openToolbar}
                            className={`add-btn ${this.state.isOpen ? ' open-button' : ''}`}
                            disabled={this.state.showURLInput}
                        >+</button>
                        <span className={`fe-side-toolbar-btns ${this.state.isOpen ? 'fe-side-toolbar-open':''}`}>
                           <span className="arrow" />
                            <div>
                               sfsdds
                           </div>
                            {/*{this.state.isOpen ?*/}
                               {/*this.editorStyles.CUSTOM_STYLES.map((type) =>*/}
                                   {/*<StyleButton*/}
                                       {/*key={type.label}*/}
                                       {/*activeFn={this.customBlockIsActive}*/}
                                       {/*label={type.label}*/}
                                       {/*onToggle={this.customBlockToggleFn}*/}
                                       {/*style={type.style}*/}
                                       {/*icon={type.icon}*/}
                                       {/*disabled={this.state.showURLInput}*/}
                                   {/*/>*/}
                               {/*): null}*/}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    }
}

AddButton.propTypes = {
    focus: PropTypes.func,
    getEditorState: PropTypes.func.isRequired,
    setEditorState: PropTypes.func.isRequired,
    sideButtons: PropTypes.arrayOf(PropTypes.object),
};