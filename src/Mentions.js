import React, { Component } from 'react';
import { MentionItem } from './MentionItem';
import { normalizeSelectedIndex, filterPeople } from './utils';

class Mentions extends Component {
    render() {
        const { typeaheadState, onMouseOver, onTypeheadClick, focus, data } = this.props;
        const typeaheadStyle = {
            position: 'absolute',
            left: typeaheadState.left,
            top: typeaheadState.top
        };
        const firstChar = typeaheadState.text[0] || '';
        const filteredCharacters = filterPeople(typeaheadState.text.replace(/^(@|\()/, ''), firstChar, data);
        const normalizedIndex = normalizeSelectedIndex(typeaheadState.selectedIndex, filteredCharacters.length);
        if( filteredCharacters.length === 0) {
            return null
        }
        const { CharacterComponent, CharacterItemComponent } = this.props;

        return (
            <div className={`typeahead`}  style={typeaheadStyle}>
                <ul >
                    {filteredCharacters.map((character, index) => {
                        const isActive = index === normalizedIndex;
                        const className = `person ${isActive ? 'selectedPerson' : ''}`;
                        const showPopover = isActive && firstChar === '@' && CharacterComponent !== null;
                        return (
                            <MentionItem key={`mention_${index}`}
                                         index={index}
                                         isActive={isActive}
                                         className={className}
                                         onTypeheadClick={onTypeheadClick}
                                         onMouseOver={onMouseOver}
                                         CharacterItemComponent={CharacterItemComponent}
                                         CharacterComponent={CharacterComponent}
                                         showPopover={showPopover}
                                         character={character}
                            />
                        );
                    })}
                </ul>
                {firstChar === '@' &&
                <div className="add-character" onMouseDown={() => onTypeheadClick(-1)}>
                    <span>Add Character</span>
                </div>}
            </div>
        );
    }
}

export { Mentions };