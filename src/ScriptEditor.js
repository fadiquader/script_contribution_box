import React, { Component } from 'react';
import {
    Editor,
    EditorState, ContentState,
    ContentBlock,
    Entity, Modifier,
    getDefaultKeyBinding,
    KeyBindingUtil,
    DefaultDraftBlockRenderMap,
    genKey,
    SelectionState,
    convertFromRaw,
    convertToRaw
} from 'draft-js';
import {Map, List } from 'immutable';
import isEqual from 'lodash/isEqual';
import { Mentions } from './Mentions';
import { Action } from './Action';
import {Character }  from './Character';
import { Dialogue }  from './Dialogue';
import { decorator } from './strategies';
import { normalizeSelectedIndex, filterPeople } from './utils'
import {
    MENTION_REGEX,
    MENTION_PATTERN,
    MENTION_PATTERN2,
    MENTION_REGEX2 ,
    MENTION_PATTERN3,
    ACTION,
    CHARACTER,
    DIALOGUE
} from './constants';
import 'draft-js/dist/Draft.css';
import './index.css';

const {hasCommandModifier} = KeyBindingUtil;

const blockRenderMap = Map({
    // 'character': {
    //     element: 'div',
    //     wrapper: <Character />
    // },
    // 'dialogue': {
    //     element: 'div',
    //     wrapper: <Dialogue />
    // },
    // 'unstyled': {
    //     element: 'div',
    //     wrapper: <Action />
    // },
    // 'action': {
    //     element: 'div',
    //     wrapper: <Action />
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


class ScriptEditor extends Component {
    constructor() {
        super();
        this.state = {
            editorState: EditorState.createEmpty(decorator),
            typeaheadState: null,
            characterDescription: null
        };
        this.stackMode = false;
        this.inFocus = false;
        this.character = {
            style: {},
            data: {}
        };
        this.data = {
            '@': [],
            '(': [
                { name: 'V.O' },
                { name: 'O.C' },
                { name: 'O.S' }
            ]
        }
    }

    componentWillMount() {
        const { initialState } = this.props;
        if(initialState !== null) {
            const _contentState = convertFromRaw(JSON.parse(initialState));
            const editorState = EditorState.createWithContent(_contentState, decorator);
            this.onChange(editorState)
        }
    }

    componentDidMount() {
        const { characters } = this.props;
        this.data['@'] = characters;
    }

    componentWillReceiveProps(next) {
        const { characters } = this.props;
        if(next.characters.length !== characters.length){
            this.data['@'] = next.characters;
        }
    }

    onChange = (editorState, foucusOnLastBlock=false, focus=false) => {
        this.setState({ editorState }, () => {
            foucusOnLastBlock && this.focusOnTheLastBlock();
            // this.editorFoucs();
        });
        window.requestAnimationFrame(() => {
            this.onTypeaheadChange(this.getTypeaheadState(),
                // this.getCharacterDescriptionPopover()
            );});
        this.props.onChange(editorState)
    };

    getCharacterDescriptionPopover() {
        const entity = this.hasEntityAtSelection();
        if(entity) {
            const entityM = Entity.get(entity);
            const entityData = entityM.getData();
            if(this.character == null || entityData.name !== this.character.data.name) {
                this.character = {};
                this.character.data = entityData;
                const tempRange = window.getSelection().getRangeAt(0).cloneRange();
                tempRange.setStart(tempRange.startContainer, 0 );
                const rangeRect = tempRange.getBoundingClientRect();
                // console.log(tempRange, rangeRect)
                this.character.style = {
                    left: rangeRect.left,
                    top: rangeRect.top + rangeRect.height
                }
            }
        } else {
            this.character = null
        }
        return  this.character;
    }

    onTypeaheadChange = (typeaheadState, characterDescription=null) => {
        this.setState({ typeaheadState, characterDescription });
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

    insertChar(contentState, char) {
        return Modifier.insertText(
            contentState,
            contentState.getSelectionAfter(),
            char
        );
    }

    handleTypeaheadReturn = (text, selectedIndex, selection) => {
        const { editorState } = this.state;
        if(text == null) return;
        const firstChar = text[0];
        const contentState = editorState.getCurrentContent();
        const filteredCharacters = filterPeople(text.replace(/^(@|\()/, ''), firstChar, this.data);
        const index = normalizeSelectedIndex(selectedIndex, filteredCharacters.length);
        if(isNaN(index)) return;
        const insertState = this.getInsertState(index, /^(@|\()/);
        const currentSelectionState = editorState.getSelection();
        const mentionTextSelection = currentSelectionState.merge({
            anchorOffset: insertState.start,
            focusOffset: insertState.end
        });
        const blockKey = mentionTextSelection.getAnchorKey();
        const blockSize = editorState.getCurrentContent().getBlockForKey(blockKey).getLength();
        const men = filteredCharacters[index];
        const contentWithEntity = contentState.createEntity('MENTION', 'IMMUTABLE', men);
        const menText = text.indexOf('@') !== -1 ? filteredCharacters[index].name: `(${filteredCharacters[index].name})`
        const MENTION_ENTITY_KEY = contentWithEntity.getLastCreatedEntityKey();
        let contentStateWithEntity = Modifier.replaceText(
            contentWithEntity,
            selection,
            menText,
            null,
            MENTION_ENTITY_KEY
        );
        if (blockSize === insertState.end) {
            contentStateWithEntity = this.insertChar(contentStateWithEntity, ' ')
        }
        const nextEditorState = EditorState.push(
            editorState, contentStateWithEntity, 'apply-entity'
        );
        this.onChange(nextEditorState);
        setTimeout(() => this.editorFoucs(), 0)
    };

    renderTypeahead() {
        const { typeaheadState } = this.state;
        const { isMobile } = this.props;
        if (typeaheadState === null) return null;
        return <Mentions  typeaheadState = { this.state.typeaheadState}
                          onMouseOver={this.onMentionMouseOver}
                          onTypeheadClick={this.onTypeheadClick}
                          focus={this.editorFoucs}
                          data={this.data}
                          CharacterComponent={this.props.characterComponent}
                          CharacterItemComponent={this.props.characterItemComponent}
                          isMobile={isMobile}
        />;
    }

    renderCharacterDescription() {
        const { characterDescription } = this.state;
        if(characterDescription == null) return null;
        const CharacterDetails = this.props.characterComponent;
        return (
            <div style={characterDescription.style} className="character-details">
                <CharacterDetails character={characterDescription.data} />
            </div>
        )
    }

    onMentionMouseOver = index => {
        const newTypeheadState = { ...this.state.typeaheadState };
        newTypeheadState.selectedIndex = index;
        this.setState({ typeaheadState: newTypeheadState })
    };

    onTypeheadClick = (selectedIndex) => {
        if(selectedIndex === -1) {
            this.stackMode = true;
            this.props.onAddCharacter('');
            return ;
        }
        this.stackMode = false;
        const contentState = this.state.editorState.getCurrentContent();
        const selection = contentState.getSelectionAfter();
        let text = '@';
        const typehead = this.getTypeaheadRange();
        if(typehead !== null) text = typehead.text;
        if(text == null) return;
        const entitySelection = selection.set(
            'anchorOffset',
            selection.getFocusOffset() - text.length
        );
        this.handleTypeaheadReturn(text, selectedIndex, entitySelection)
    };

    editorFoucs = () => {
        if(this.refs.editor) this.refs.editor.focus();
    };

    onTab = (event) => {
        event.preventDefault();
        const { editorState } = this.state;
        // const editorState = changeDepth(this.state.editorState, event.shiftKey ? -1 : 1, 4);
        let newEditorState = this.insertCharacter(CHARACTER);
        const { currentBlock, prevBlock } = this.getCurrentAndBeforBlocks(editorState);
        const currentType = currentBlock.getType();
        const currentText = currentBlock.getText();
        const blockMap = editorState.getCurrentContent().getBlockMap();
        // const last = blockMap.last();
        const first = blockMap.first();
        const isActionBlock  = currentType === ACTION || currentType === 'unstyled';
        if(first.getKey() == currentBlock.getKey() && currentText.trim() == '') return;
        if(isActionBlock && currentText.trim() != '') {
            newEditorState = this.addEmptyBlock(editorState, ACTION)
        }
        if(currentType === DIALOGUE && prevBlock === CHARACTER) return;
        if(currentText.trim() != '') return;
        // if(currentText !== '' && currentType !== 'character') return;
        // if(currentType == 'character') {
        //     newEditorState = this.addEmptyBlock(editorState, 'character')
        // }
        this.onChange(newEditorState, currentType == CHARACTER || isActionBlock && currentText.trim() != '');

    };

    getEditorState = () => this.state.editorState;

    blockRendererFn = contentBlock => {
        const type = contentBlock.getType();
        const text = contentBlock.getText();
        return null;
        switch (text) {
            case CHARACTER:
                return {
                    component: Character,
                    editable: true,
                    props: {
                        getEditorState: this.getEditorState,
                        onChange: this.onChange
                    }
                };
            case DIALOGUE:
                return {
                    component: Dialogue,
                    editable: true,
                    props: {
                        getEditorState: this.getEditorState,
                        onChange: this.onChange
                    }
                };
            case ACTION:
                return {
                    component: Action,
                    editable: true,
                    props: {
                        getEditorState: this.getEditorState,
                        onChange: this.onChange
                    }
                };
            default:
                return null

        }
    };

    blockStyleFn = block => {
        const type = block.getType();
        // const text = block.getText();
        switch (type) {
            case CHARACTER:
                return 'courier character';
            case DIALOGUE:
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
            CHARACTER
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
            const { currentBlock, prevBlock, nextBlock } = this.getCurrentAndBeforBlocks(editorState);
            const blockMap = editorState.getCurrentContent().getBlockMap();
            const blockType = currentBlock.getType();
            const prevType = prevBlock && prevBlock.getType();
            const last = blockMap.last();
            const first = blockMap.first();
            const selection = editorState.getSelection();
            const focusOffset = selection.getFocusOffset();
            // console.log(selection.getFocusOffset())
            if(first.getKey() == last.getKey() && first.getType() == CHARACTER) {
                this.resetBlockType(editorState, ACTION);
                return 'handled';
            }
            if(currentBlock.getText() == "" &&
                blockType === CHARACTER && (prevType === DIALOGUE || prevType === ACTION)) {
                this.resetBlockType(editorState, prevType);
                return 'handled';
            }
            if((blockType == DIALOGUE || blockType == CHARACTER && nextBlock && nextBlock.getType() === DIALOGUE)
                && currentBlock.getText().trim() != "" && focusOffset == 0) {
                return 'handled';
            }
            if(blockType === DIALOGUE && prevType === CHARACTER) {
                if((currentBlock.getText() == "" || focusOffset == 0)&& nextBlock && nextBlock.getType() === ACTION) {
                    return 'handled'
                }
                return 'not-handled';
            }
            else if(blockType == DIALOGUE && (prevType == CHARACTER || prevType == DIALOGUE)) {
                if(currentBlock.getText() != '') return 'not-handled';
                this.resetBlockType(editorState, ACTION);
                return 'handled';
            }
            else if(currentBlock.getText() == "" && blockType == CHARACTER && nextBlock && nextBlock.getType() === ACTION) {
                return 'handled'
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
        const prevBlock = contentState.getBlockBefore(startKey);
        const nextBlock = contentState.getBlockAfter(startKey);
        return {
            currentBlock,
            prevBlock,
            nextBlock
        }
    }

    handleBeforeInput = (str) => {
        // console.log('str ', str)
        const { editorState } = this.state;
        this.stackMode = false;
        const { currentBlock, prevBlock } = this.getCurrentAndBeforBlocks(editorState);
        const blockType = currentBlock.getType();
        const blockText = currentBlock.getText();
        const prevType = prevBlock && prevBlock.getType();
        const entityKey = currentBlock.getEntityAt(0);
        const entity = entityKey && Entity.get(entityKey).getType();
        if(prevType == CHARACTER && blockType == DIALOGUE) return false;
        if(blockType == CHARACTER) {
            const mCh =  MENTION_PATTERN3.test(blockText);
            if((str == '@' || str == '(')&& blockText.indexOf("@") !== -1) return true;
            if(mCh) return true;
            if((str == '@') && blockText.length == 0) {
                return false;
            } else if(blockText.length > 0 &&MENTION_PATTERN.test(blockText.trim())) {
                return false;
            }
            else if(entity == 'MENTION' && (str == '(' || str == ' ')) {
                return false
            }
            else if(entity == 'MENTION' && MENTION_PATTERN2.test(blockText.trim())) {
                return false
            } else {
                return true
            }
        }
        return false;
    };

    resetBlockType = (editorState, newType, text='') => {
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
        let newState = EditorState.push(editorState, newContentState, 'change-block-type');
        this.onChange(newState)
    };

    onPressEnter = () => {
        const { editorState } = this.state;
        this.insertFragment('after', editorState, DIALOGUE);
        // const newState = this.addEmptyBlock(editorState,  'DIALOGUE');
        // this.onChange(newState, true)
    };

    addEmptyBlock = (editorState, type, text='') => {
        const newBlock = new ContentBlock({
            key: genKey(),
            type: type,
            text: text,
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
        this.onChange(newEditorState, true);
    };

    // type head
    hasEntityAtSelection() {
        const { editorState } = this.state;
        const selection = editorState.getSelection();
        if (!selection.getHasFocus()) return false;
        const contentState = editorState.getCurrentContent();
        const block = contentState.getBlockForKey(selection.getStartKey());
        const entity = block.getEntityAt(selection.getStartOffset() - 1);
        return entity || false;
    }

    getTypeaheadRange() {
        const { editorState } = this.state;
        const { currentBlock } = this.getCurrentAndBeforBlocks(editorState);
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;
        if (this.hasEntityAtSelection()) return null;
        const range = selection.getRangeAt(0);
        let text = range.startContainer.textContent;
        // Remove text that appears after the cursor..
        text = text.substring(0, range.startOffset);
        let index = text.lastIndexOf('@');
        if (index === -1) {
            if(currentBlock.getType() != CHARACTER) return null;
            index = text.lastIndexOf('(');
        }
        if (index === -1) {
            return null;
        }
        let prev = text.substring(index, index - 1);
        if(index != 0 && prev !== " ") return null;
        text = text.substring(index);
        return {
            text,
            start: index,
            end: range.startOffset
        };
    }

    getTypeaheadState(invalidate = true) {
        if (!invalidate) return this.typeaheadState;
        const typeaheadRange = this.getTypeaheadRange();
        if(this.stackMode) return this.typeaheadState;
        if (!typeaheadRange) {
            this.typeaheadState = null;
            return null;
        }
        const testRe = MENTION_REGEX.test(typeaheadRange.text) || MENTION_REGEX2.test(typeaheadRange.text);
        if(!testRe) {
            this.typeaheadState = null;
            return null;
        }
        const tempRange = window.getSelection().getRangeAt(0).cloneRange();
        tempRange.setStart(tempRange.startContainer, typeaheadRange.start);

        const rangeRect = tempRange.getBoundingClientRect();
        const {
            offsetLeft,
            // offsetWidth, offsetHeight, offsetBottom, offsetTop
        } = this.refs.editorWrapper;
        const p = this.refs.editorWrapper.getBoundingClientRect()
        const bot = rangeRect.bottom - p.bottom + p.height + rangeRect.height;
        // const bot = offsetBottom + rangeRect.bottom - p.bottom + rangeRect.height +  p.height ;
        const le = offsetLeft + rangeRect.left - p.left + 4;
        let [left, top] = [le,bot];
        this.typeaheadState = {
            left,
            top,
            text: typeaheadRange.text,
            selectedIndex: 0
        };
        return this.typeaheadState;
    }

    onEscape = (e) => {
        if (!this.getTypeaheadState(false)) {
            this.props.onEscape && this.props.onEscape(e);
            return;
        }

        e.preventDefault();
        this.typeaheadState = null;
        this.onTypeaheadChange && this.onTypeaheadChange(null);
    };

    onArrow(e, originalHandler, nudgeAmount) {
        let typeaheadState = this.getTypeaheadState(false);
        if (!typeaheadState) {
            originalHandler && originalHandler(e);
            return;
        }
        e.preventDefault();
        typeaheadState.selectedIndex += nudgeAmount;
        this.typeaheadState = typeaheadState;
        this.onTypeaheadChange && this.onTypeaheadChange(typeaheadState);
    }

    onUpArrow = (e) => this.onArrow(e, this.props.onUpArrow, -1);

    onDownArrow = (e) => this.onArrow(e, this.props.onDownArrow, 1);

    handleReturn = (e) => {
        const { editorState } = this.state;
        if (this.typeaheadState) {
            if (this.handleTypeaheadReturn) {
                // console.log(this.typeaheadState)
                const contentState = editorState.getCurrentContent();
                const selection = contentState.getSelectionAfter();
                const entitySelection = selection.set(
                    'anchorOffset', selection.getFocusOffset() - this.typeaheadState.text.length
                );
                this.handleTypeaheadReturn(
                    this.typeaheadState.text,
                    this.typeaheadState.selectedIndex,
                    entitySelection
                );
                this.typeaheadState = null;
                this.onTypeaheadChange && this.onTypeaheadChange(null);
            } else {
                console.error(
                    "Warning: A typeahead is showing and return was pressed but `handleTypeaheadReturn` " +
                    "isn't implemented."
                );
            }
            return true;
        }
        if(this.onPressEnter) {
            const { editorState } = this.state;
            const { currentBlock, prevBlock } = this.getCurrentAndBeforBlocks(editorState)
            const blockType = currentBlock.getType();
            const prevType = prevBlock && prevBlock.getType();
            const entityKey = currentBlock.getEntityAt(0);
            const entity = entityKey && Entity.get(entityKey).getType();
            // console.log('entity ', entity);
            if( currentBlock.getText() == "" ||
                blockType == CHARACTER && entity === null) return true;

            if((prevType == 'unstyled' || CHARACTER )&& blockType == CHARACTER) {
                // this.props.onChange(handleNewLine())
                this.onPressEnter();
                return true;
            }
        }
        return false;
    };

    exportToJSON = () => {
        const contentState = this.state.editorState.getCurrentContent();
        const rawJson = convertToRaw(contentState);
        const jsonStr = JSON.stringify(rawJson, null, 1);
        const plainText = contentState.getPlainText();
        console.log(jsonStr)
        // const html = `
        // <div class="courier action">sdfsdfdsf <span class="mention">fadi</span></div>
        // <div class="courier character"><span class="mention">qua</span> <span class="mention">(v.o)</span></div>
        // <div class="courier dialogue">gggggggg <span class="mention">qua</span></div>
        // `;
        // this.createWithHTML(html)
    };

    onFocus = () => {
        this.inFocus = true;
        this.props.onFocus();
    };
    onBlur = () => {
        this.inFocus = false;
        this.props.onBlur();
    };
    getCurrentBlock = (editorState) => {
        const selectionState = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const block = contentState.getBlockForKey(selectionState.getStartKey());
        return block;
    };
    addNewBlock = (editorState, newType = ACTION, initialData = {}) => {
        const selectionState = editorState.getSelection();
        if (!selectionState.isCollapsed()) {
            return editorState;
        }
        const contentState = editorState.getCurrentContent();
        const key = selectionState.getStartKey();
        const blockMap = contentState.getBlockMap();
        const currentBlock = this.getCurrentBlock(editorState);
        if (!currentBlock) {
            return editorState;
        }
        if (currentBlock.getLength() === 0) {
            if (currentBlock.getType() === newType) {
                return editorState;
            }
            const newBlock = currentBlock.merge({
                type: newType,
                data: '',
            });
            const newContentState = contentState.merge({
                blockMap: blockMap.set(key, newBlock),
                selectionAfter: selectionState,
            });
            return EditorState.push(editorState, newContentState, 'change-block-type');
        }
        return editorState;
    };
    insertBlockUsingMobile (type) {
        const { editorState } = this.state;
        const { currentBlock, prevBlock, nextBlock } = this.getCurrentAndBeforBlocks(editorState);
        const blockMap = editorState.getCurrentContent().getBlockMap();
        const blockType = currentBlock.getType();
        const prevType = prevBlock && prevBlock.getType();
        const last = blockMap.last();
        const first = blockMap.first();
        if(currentBlock.getText().trim() !== "" || (last.getKey() == first.getKey())) {
            // this.editorFoucs();
            return;
        };
        switch (type) {
            case CHARACTER:
                if(prevType && prevType === CHARACTER || currentBlock.getText().trim() !== "") {
                    // this.editorFoucs();
                    return;
                };
                this.onChange(this.insertCharacter(CHARACTER));
                break;
            case DIALOGUE:
                if(prevType && prevType === ACTION || prevType === 'unstyled') {
                    // this.editorFoucs();
                    return;
                };
                this.resetBlockType(editorState, DIALOGUE);
                break;
            case 'Parenthetical':
                if((prevType && prevType === ACTION || prevType === 'unstyled') || blockType === CHARACTER) {
                    // this.editorFoucs();
                    return;
                }
                let newS = EditorState.push(
                    editorState, this.insertChar(editorState.getCurrentContent(), '('), 'apply-entity'
                );
                this.onChange(newS);
                break;
            case ACTION:
                this.resetBlockType(editorState, ACTION);
                break;
            default:
        }
    }
    renderMobileActions() {
        const { isMobile } = this.props;
        if(!isMobile) return;
        return (
            <div className="script-contributions-ctrls">
                <a onClick={this.insertBlockUsingMobile.bind(this, ACTION)}>
                    Action
                </a>
                <a onClick={this.insertBlockUsingMobile.bind(this, CHARACTER)}>
                    Character
                </a>
                <a onClick={this.insertBlockUsingMobile.bind(this, DIALOGUE)}>
                    Dialogue
                </a>
                <a onClick={this.insertBlockUsingMobile.bind(this, 'Parenthetical')}>
                    Parenthetical
                </a>

            </div>
        )
    }
    render() {
        const { readOnly, placeholder } = this.props;
        return (
            <div ref="editorWrapper"
                // onClick={this.editorFoucs}
            >
                {this.renderTypeahead()}
                {this.renderCharacterDescription()}
                { this.renderMobileActions() }
                <div className={'editor-s'}>
                    <Editor
                        ref="editor"
                        onTab={this.onTab}
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        onEscape={this.onEscape}
                        onUpArrow={this.onUpArrow}
                        onDownArrow={this.onDownArrow}
                        handleReturn={this.handleReturn}
                        handleBeforeInput={this.handleBeforeInput}
                        blockStyleFn={this.blockStyleFn}
                        // blockRendererFn={this.blockRendererFn}
                        // blockRenderMap={extendedBlockRenderMap}
                        handleKeyCommand={this.handleKeyCommand}
                        keyBindingFn={myKeyBindingFn}
                        placeholder={`${!this.inFocus ? placeholder: ''}`}
                        onFocus={this.onFocus }
                        onBlur={this.onBlur }
                        readOnly={readOnly}
                    />
                </div>
                {/*<button onClick={this.exportToJSON}>export to json</button>*/}
            </div>
        );
    }
}

ScriptEditor.defaultProps = {
    characterItemComponent: null,
    characterComponent: null,
    onChange: () => null,
    onBlur: () => null,
    onFocus: () => null,
    onTab: () => null,
    initialState: null,
    readOnly: false,
    isMobile: false,
    placeholder: 'Enter script contribution here'
};

export  { ScriptEditor };