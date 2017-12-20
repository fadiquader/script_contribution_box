import React, { Component } from 'react';
import CharacterContainer from './CharacterContainer';
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
            <div>
                <ul className={`typeahead`} style={typeaheadStyle}>
                    {filteredCharacters.map((character, index) => {
                        const isActive = index === normalizedIndex;
                        const className = `person ${isActive ? 'selectedPerson' : ''}`;
                        const showPopover = isActive && firstChar === '@' && CharacterComponent !== null;
                        return (
                            <li id={`mention_${index}`}
                                key={`mention_${index}`}
                                className={className}
                                onMouseOver={() => onMouseOver(index)}
                                onMouseDown={() => {
                                    onTypeheadClick(index) ;
                                    focus();
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    onTypeheadClick(index) ;
                                }}

                            >
                                {CharacterItemComponent ? <CharacterItemComponent character={character} />:
                                    <div>{character.name}</div>
                                }
                                {showPopover ? <CharacterContainer>
                                    <CharacterComponent character={character} />
                                </CharacterContainer>: ''}
                            </li>
                        );
                    })}
                    {firstChar === '@' &&
                    <li className="add-character" onMouseDown={() => onTypeheadClick(-1)}>
                        <span>Add Character</span>
                    </li>}
                </ul>
            </div>
        );
    }
}

export default Mentions;