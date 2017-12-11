import React, { Component } from 'react';
import Draft from 'draft-js';
import {
    changeDepth,
    handleNewLine,
    getCustomStyleMap,
    extractInlineStyle,
    getSelectedBlocksType,
    getSelectedBlock,
    removeSelectedBlocksStyle,
    insertNewUnstyledBlock,
    addLineBreakRemovingSelection,
    toggleCustomInlineStyle,
    getBlockBeforeSelectedBlock,
    getAllBlocks,
    getSelectionEntity
} from 'draftjs-utils';
import {Map, List } from 'immutable';
import Mentions from './Mentions';
import TypeaheadEditor from './TypeHead';
import { Action } from './Action';
import { Character } from './Character';
import { Dialogue } from './Dialogue';
import { decorator } from './strategies';
import { normalizeSelectedIndex, filterPeople } from './utils'
import { MENTION_PATTERN, MENTION_PATTERN2 } from './constants';

const {
    Editor,
    EditorState, ContentState,
    ContentBlock,
    Entity, Modifier,
    AtomicBlockUtils,
    getDefaultKeyBinding,
    KeyBindingUtil,
    CompositeDecorator,
    DefaultDraftBlockRenderMap,
    RichUtils,
    genKey,
    SelectionState
} = Draft;

const {hasCommandModifier} = KeyBindingUtil;

const blockRenderMap = Map({
    // 'character': {
    //     element: 'div',
    //     wrapper: Character
    // },
    // 'dialogue': {
    //     element: 'div',
    //     wrapper: Dialogue
    // }
});
const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);

// const MENTION_ENTITY_KEY = Entity.create('MENTION', 'IMMUTABLE');
const myKeyBindingFn = (e) => {
    if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
        return 'myeditor-save';
    }
    else if (e.keyCode === 8 && hasCommandModifier(e)) {
        return 'backspace';
    }
    return getDefaultKeyBinding(e);
};

export default class MentionsEditorExample extends Component {
    constructor() {
        super();
        this.state = {
            editorState: EditorState.createEmpty(decorator),
            typeaheadState: null
        };
        this.stackMode = false;
    }
    onChange = (editorState, foucusOnLastBlock=false) => {
        this.setState({ editorState }, () => {
            foucusOnLastBlock && this.focusOnTheLastBlock()
        })
        // const currentSelectionState = editorState.getSelection();
        // const end = currentSelectionState.getAnchorOffset();
        // const anchorKey = currentSelectionState.getAnchorKey();
        // const currentContent = editorState.getCurrentContent();
        // const currentBlock = currentContent.getBlockForKey(anchorKey);
        // const blockText = currentBlock.getText();
        // const blockType = currentBlock.getType();
        // const start = blockText.substring(0, end).lastIndexOf('@');
    };
    onTypeaheadChange = (typeaheadState) => {
        this.setState({ typeaheadState });
    };

    getInsertState(selectedIndex, trigger) {
        const {
            editorState
        } = this.state;
        const currentSelectionState = editorState.getSelection();
        const end = currentSelectionState.getAnchorOffset();
        const anchorKey = currentSelectionState.getAnchorKey();
        const currentContent = editorState.getCurrentContent();
        const currentBlock = currentContent.getBlockForKey(anchorKey);
        const blockText = currentBlock.getText();
        const start = blockText.substring(0, end).lastIndexOf(trigger);
        return {
            editorState,
            start,
            end,
            trigger,
            selectedIndex
        }
    }
    handleTypeaheadReturn = (text, selectedIndex, selection) => {
        const { editorState } = this.state;
        const firstChar = text[0];
        // console.log(text, selectedIndex)
        const contentState = editorState.getCurrentContent();
        const filteredPeople = filterPeople(text.replace(/^(@|\()/, ''), firstChar);
        const index = normalizeSelectedIndex(selectedIndex, filteredPeople.length);
        if(isNaN(index)) return;
        const insertState = this.getInsertState(index, /^(@|\()/);
        const currentSelectionState = editorState.getSelection();
        const mentionTextSelection = currentSelectionState.merge({
            anchorOffset: insertState.start,
            focusOffset: insertState.end
        });
        const blockKey = mentionTextSelection.getAnchorKey();
        const blockSize = editorState.getCurrentContent().getBlockForKey(blockKey).getLength();
        const contentWithEntity = contentState.createEntity('MENTION', 'IMMUTABLE', '');
        const MENTION_ENTITY_KEY = contentWithEntity.getLastCreatedEntityKey();
        // console.log('text ', text)
        // if(!MENTION_PATTERN.test(text)) {
        //     return;
        // }
        const menText = text.indexOf('@') !== -1 ? filteredPeople[index]: `(${filteredPeople[index]})`
        let contentStateWithEntity = Modifier.replaceText(
            contentWithEntity,
            selection,
            menText,
            null,
            MENTION_ENTITY_KEY
        );
        if (blockSize === insertState.end) {
            contentStateWithEntity = Modifier.insertText(
                contentStateWithEntity,
                contentStateWithEntity.getSelectionAfter(),
                ' '
            );
        }
        const nextEditorState = EditorState.push(
            editorState, contentStateWithEntity, 'apply-entity'
        );
        this.onChange(nextEditorState)
    };

    renderTypeahead() {
        const { typeaheadState } = this.state;
        // console.log(typeaheadState)
        if (typeaheadState === null) {
            return null;
        }
        return <Mentions  typeaheadState = { this.state.typeaheadState}
                          onMouseOver={this.onMentionMouseOver}
                          onTypeheadClick={this.onTypeheadClick}
                          focus={this.editorFoucs}
        />;
    }

    onMentionMouseOver = index => {
        const newTypeheadState = { ...this.state.typeaheadState };
        newTypeheadState.selectedIndex = index;
        this.setState({ typeaheadState: newTypeheadState })
    };

    getTypeaheadRange() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            return null;
        }
        const range = selection.getRangeAt(0);
        let text = range.startContainer.textContent;

        // Remove text that appears after the cursor..
        text = text.substring(0, range.startOffset);

        // ..and before the typeahead token.
        let index = text.lastIndexOf('@');
        if (index === -1) {
            index = text.lastIndexOf('(');
            if(index === -1) return null;
        }
        text = text.substring(index);
        return {
            text,
            start: index,
            end: range.startOffset
        };
    }

    onTypeheadClick = (selectedIndex) => {
        console.log(selectedIndex)
        if(selectedIndex === -1) {
            this.stackMode = true
            return ;
        }
        this.stackMode = false;
        const contentState = this.state.editorState.getCurrentContent();
        const selection = contentState.getSelectionAfter();
        const { text } = this.getTypeaheadRange();
        const entitySelection = selection.set(
            'anchorOffset', selection.getFocusOffset() - text.length
        );
        this.handleTypeaheadReturn(text, selectedIndex, entitySelection)
    };

    editorFoucs = () => {
        if(this.refs.editor){
            this.refs.editor.focus();
            this.refs.editor.refs.draftEditor.focus()
        }
    };

    onTab = (event) => {
        event.preventDefault();
        const { editorState } = this.state;
        // const editorState = changeDepth(this.state.editorState, event.shiftKey ? -1 : 1, 4);
        let newEditorState = this.insertCharacter('character');
        const { currentBlock } = this.getCurrentAndBeforBlocks(editorState);
        const currentType = currentBlock.getType();
        if(currentType == 'character') {
            newEditorState = this.addEmptyBlock(editorState, 'character')
        }
        this.onChange(newEditorState, currentType == 'character');

    };
    getEditorState = () => this.state.editorState;

    blockRendererFn = contentBlock => {
        const type = contentBlock.getType();
        const text = contentBlock.getText();
        switch (text) {
            case 'character':
                return {
                    component: Character,
                    editable: true,
                    props: {
                        getEditorState: this.getEditorState,
                        onChange: this.onChange
                    }
                };
            case 'dialogue':
                return {
                    component: Dialogue,
                    editable: true,
                    props: {
                        getEditorState: this.getEditorState,
                        onChange: this.onChange
                    }
                };
            default:
                return null
                // return {
                //     component: Action,
                //     editable: true,
                //     props: {
                //         getEditorState: this.getEditorState,
                //         onChange: this.onChange
                //     }
                // };
        }
    };

    blockStyleFn = block => {
        const type = block.getType();
        // const text = block.getText();
        switch (type) {
            case 'character':
                return 'courier character';
            case 'dialogue':
                return 'courier dialogue';
            default:
                return 'courier action';
        }
    };

    insertCharacter = () => {
        const {editorState} = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = Modifier.setBlockType(
            contentState,
            contentState.getSelectionAfter(),
            'character'
        );
        return  EditorState.push(
            editorState, contentStateWithEntity, 'apply-entity'
        );
    };

    handleKeyCommand = command => {
        const { editorState } = this.state;
        if (command === 'myeditor-save') {
            return 'handled';
        } else if(command == 'backspace') {
            this.stackMode = false;
            const { currentBlock, prevBlock } = this.getCurrentAndBeforBlocks(editorState);
            const blockType = currentBlock.getType();
            const prevType = prevBlock && prevBlock.getType();
            const last = editorState.getCurrentContent().getBlockMap().last();
            const first = editorState.getCurrentContent().getBlockMap().first();
            // console.log(blockType, prevType)
            if(first.getKey() == last.getKey() && first.getType() == 'character') {
                this.resetBlockType(editorState, 'action');
                return 'handled';
            }
            else if(blockType == 'dialogue' && (prevType =='character' || prevType =='dialogue')) {
                this.resetBlockType(editorState, 'action');
                return 'handled';
            }
            // if(blockType == 'dialogue' && prevType =='dialogue' || first === 'character'){
            //     this.resetBlockType(editorState, 'action');
            //     return 'handled';
            // }
            return 'not-handled'

        }
        return 'not-handled';
    };

    getCurrentAndBeforBlocks(editorState) {
        const selection = editorState.getSelection();
        const startKey = selection.getStartKey();
        const endKey = selection.getEndKey();
        /* Get the current block */
        const contentState = editorState.getCurrentContent();
        const currentBlock = contentState.getBlockForKey(startKey);
        const blockType = currentBlock.getType();
        const blockLength = currentBlock.getLength();
        const prevBlock = contentState.getBlockBefore(startKey);
        return {
            currentBlock,
            prevBlock
        }
    }
    handleBeforeInput = (str) => {
        // console.log('str ', str)
        const { editorState } = this.state;
        this.stackMode = false;
        const selection = editorState.getSelection();
        const { currentBlock, prevBlock } = this.getCurrentAndBeforBlocks(editorState);
        const blockType = currentBlock.getType();
        const blockText = currentBlock.getText();
        const prevType = prevBlock && prevBlock.getType();
        const entityKey = currentBlock.getEntityAt(0)
        const entity = entityKey && Entity.get(entityKey).getType();
        console.log(prevType, blockType)
        if(prevType == 'character' && blockType == 'dialogue') {
            return false;
        }
        if(blockType == 'character') {
            // if(entity == 'MENTION') return true;
            if((str == '@' || str == '(') && blockText.length == 0) {
                return false;
            } else if(blockText.length > 0 &&MENTION_PATTERN.test(blockText.trim())) {
                // console.log(blockText,MENTION_PATTERN.test(blockText.trim()))
                return false;
            }
            else if(entity == 'MENTION' && str == '(') {
                return false
            }
            else if(entity == 'MENTION' && MENTION_PATTERN2.test(blockText.trim())) {
                return false
            } else {
                return true
            }
        }
        // if(prevType == 'character' && blockType !== 'dialogue') {
        //     this.resetBlockType(editorState, 'dialogue');
        //     return true;
        // }
        return false;
    };

    resetBlockType = (editorState, newType) => {
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const key = selectionState.getStartKey();
        const blockMap = contentState.getBlockMap();
        const block = blockMap.get(key);
        const newBlock = block.merge({
            text: '',
            type: newType,
        });
        const newContentState = contentState.merge({
            blockMap: blockMap.set(key, newBlock),
            selectionAfter: selectionState.merge({
                anchorOffset: 0,
                focusOffset: 0,
            }),
        });
        const newState = EditorState.push(editorState, newContentState, 'change-block-type');
        this.onChange(newState)
    };

    onPressEnter = () => {
        const { editorState } = this.state;
        this.insertFragment('after', editorState, 'dialogue');
        // this.resetBlockType(editorState, 'dialogue');
    };

    addEmptyBlock = (editorState, type) => {
        const newBlock = new ContentBlock({
            key: genKey(),
            type: type,
            text: '',
            characterList: List()
        });
        const contentState = editorState.getCurrentContent()
        const newBlockMap = contentState.getBlockMap().set(newBlock.key, newBlock)

        return EditorState.push(
            editorState,
            ContentState
                .createFromBlockArray(newBlockMap.toArray())
                .set('selectionBefore', contentState.getSelectionBefore())
                .set('selectionAfter', contentState.getSelectionAfter())
        )
    };

    focusOnTheLastBlock = () => {
        const { editorState } = this.state;
        const last = editorState.getCurrentContent().getBlockMap().last();
        const selState = SelectionState.createEmpty().merge({
            anchorKey: last.getKey(),
            focusKey: last.getKey(),
            focusOffset: 0,
            anchorOffset: 0,
            isBackward: false,
            hasFocus: false
        });
        this.onChange(EditorState.forceSelection( editorState, selState))
    };

    insertFragment = (direction, editorState, blockType) => {
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const currentBlock = contentState.getBlockForKey(selection.getEndKey());
        const blockMap = contentState.getBlockMap();
        // Split the blocks
        const blocksBefore = blockMap.toSeq().takeUntil(function (v) {
            return v === currentBlock
        });
        const blocksAfter = blockMap.toSeq().skipUntil(function (v) {
            return v === currentBlock
        }).rest();
        const newBlockKey = genKey();
        let newBlocks = direction === 'before' ? [
            [newBlockKey, new ContentBlock({
                key: newBlockKey,
                type: blockType,
                text: '',
                characterList: List(),
            })],
            [currentBlock.getKey(), currentBlock],
        ] : [
            [currentBlock.getKey(), currentBlock],
            [newBlockKey, new ContentBlock({
                key: newBlockKey,
                type: blockType,
                text: '',
                characterList: List(),
            })],
        ];
        const newBlockMap = blocksBefore.concat(newBlocks, blocksAfter).toOrderedMap()
        const newContentState = contentState.merge({
            blockMap: newBlockMap,
            selectionBefore: selection,
            selectionAfter: selection,
        });
        const newEditorState = EditorState.push(editorState, newContentState, 'insert-fragment')
        // this.addEmptyBlock(newEditorState)
        this.setState({
            editorState: newEditorState
        }, () => {
            this.focusOnTheLastBlock()
        })
    };

    render() {
        return (
            <div onClick={this.editorFoucs}>
                {this.renderTypeahead()}
                <div className={'editor'}>
                    <TypeaheadEditor
                        ref="editor"
                        onTab={this.onTab}
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        onTypeaheadChange={this.onTypeaheadChange}
                        handleTypeaheadReturn={this.handleTypeaheadReturn}
                        handleBeforeInput={this.handleBeforeInput}
                        blockStyleFn={this.blockStyleFn}
                        blockRendererFn={this.blockRendererFn}
                        blockRenderMap={extendedBlockRenderMap}
                        handleKeyCommand={this.handleKeyCommand}
                        keyBindingFn={myKeyBindingFn}
                        onPressEnter={this.onPressEnter}
                        getCurrentAndBeforBlocks={this.getCurrentAndBeforBlocks}
                        stackMode={this.stackMode}
                        placeholder="Enter script contribution here"
                    />
                </div>
            </div>
        );
    }
}
