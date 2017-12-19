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
        const filteredPeople = filterPeople(typeaheadState.text.replace(/^(@|\()/, ''), firstChar, data);
        const normalizedIndex = normalizeSelectedIndex(typeaheadState.selectedIndex, filteredPeople.length);
        if( filteredPeople.length === 0) {
            return null
        }
        const CharacterComponent = this.props.Component;
        return (
            <div>
                <ul className={'typeahead'} style={typeaheadStyle}>
                    {filteredPeople.map((person, index) => {
                        const isActive = index === normalizedIndex;
                        const className = `person ${isActive ? 'selectedPerson' : ''}`;
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
                                <div dir="rtl" >{person.name}</div>
                                {isActive && CharacterComponent !== null ? <CharacterContainer>
                                    <CharacterComponent details={person} />
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