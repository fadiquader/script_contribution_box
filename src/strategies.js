import MentionSpan from './MentionSpan';
import { Entity, CompositeDecorator } from 'draft-js';

export function getEntityStrategy(mutability, type) {
    return function(contentBlock, callback) {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity();
                if (entityKey === null) {
                    return false;
                }
                const entity = Entity.get(entityKey);
                return entity.getMutability() === mutability && entity.getType() == type;
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
]);