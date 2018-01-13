
export function normalizeSelectedIndex(selectedIndex, max) {
    let index = selectedIndex % max;
    if (index < 0) {
        index += max;
    }
    return index;
}

export function filterPeople(query, t, data) {
    return data[t].filter(person => {
        return person.name.toLowerCase().startsWith(query.toLowerCase());
    }).slice(0,10);
}


export function getSelectedBlockNode(root) {
    const selection = root.getSelection();
    if (selection.rangeCount === 0) {
        return null;
    }
    let node = selection.getRangeAt(0).startContainer;
    // console.log(node);
    do {
        if (node.getAttribute && node.getAttribute('data-block') === 'true') {
            return node;
        }
        node = node.parentNode;
        // console.log(node);
    } while (node !== null);
    return null;
}

export function getSelection (root) {
    let t = null;
    if (root.getSelection) {
        t = root.getSelection();
    } else if (root.document.getSelection) {
        t = root.document.getSelection();
    } else if (root.document.selection) {
        t = root.document.selection.createRange().text;
    }
    return t;
}

export function getSelectionRect (selected) {
    const _rect = selected.getRangeAt(0).getBoundingClientRect();
    // selected.getRangeAt(0).getBoundingClientRect()
    let rect = _rect && _rect.top ? _rect : selected.getRangeAt(0).getClientRects()[0];
    if (!rect) {
        if (selected.anchorNode && selected.anchorNode.getBoundingClientRect) {
            rect = selected.anchorNode.getBoundingClientRect();
            rect.isEmptyline = true;
        } else {
            return null;
        }
    }
    return rect;
}