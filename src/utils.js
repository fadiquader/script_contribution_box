
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
    });
}
