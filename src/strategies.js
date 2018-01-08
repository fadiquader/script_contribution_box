import { Entity, CompositeDecorator } from 'draft-js';
import MentionSpan from './MentionSpan';
import ParenthesSpan from './ParenthesSpan';
import { DIALOGUE, MENTION_PATTERN4 } from "./constants";


export function getEntityStrategy(mutability, type, regex) {
    return function(contentBlock, callback) {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity();
                const [blockType, blockText] = [contentBlock.getType(), contentBlock.getText()];
                // console.log(character, blockType, blockText);
                if(type === 'MENTION') {
                    if (entityKey === null) return false;
                    const entity = Entity.get(entityKey);
                    return entity.getMutability() === mutability && entity.getType() == type;
                }
                if(type === 'PARENTHES' && blockType === DIALOGUE) {
                    if(MENTION_PATTERN4.test(blockText.trim())) return true;
                }
                return null
                // return entity.getMutability() === mutability && entity.getType() == type;
            },
            callback
        );
    };
}

export const decorator = new CompositeDecorator([
    {
        strategy: getEntityStrategy('IMMUTABLE', 'MENTION'),
        component: MentionSpan,
    },
    {
        strategy: getEntityStrategy('IMMUTABLE', 'PARENTHES', MENTION_PATTERN4),
        component: ParenthesSpan,
    },
]);