import React, { PureComponent } from 'react';
import CharacterContainer from './CharacterContainer';

class MentionItem extends PureComponent {
    constructor() {
        super();
        this.onMouseOver = this._onMouseOver.bind(this);
        this.onTypeheadClick = this._onTypeheadClick.bind(this);
    }
    _onMouseOver(e) {
        const { index, onMouseOver } = this.props;
        onMouseOver(index)
    }
    _onTypeheadClick(e) {
        const { index, onTypeheadClick } = this.props;
        e.preventDefault();
        onTypeheadClick(index)
    }
    render() {
        const {
            index,
            className,
            CharacterItemComponent,
            CharacterComponent,
            character,
            showPopover
        } = this.props;
        return (
            <li id={`mention_${index}`}
                className={className}
                onMouseOver={this.onMouseOver}
                onMouseDown={this.onTypeheadClick}
                onTouchEnd={this.onTypeheadClick}
                onContextMenu={this.onTypeheadClick}
            >
                {CharacterItemComponent ? <CharacterItemComponent character={character} />:
                    <div>{character.label || character.name }</div>
                }
                {showPopover ? <CharacterContainer>
                    <CharacterComponent character={character} />
                </CharacterContainer>: ''}
            </li>
        )
    }
}

export { MentionItem };