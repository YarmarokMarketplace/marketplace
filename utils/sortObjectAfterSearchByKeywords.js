const buildSortObjectAfterSearchByKeywords = (notices, param) => { 
    switch (param) { 
        case "newest": return notices.sort(
            (firstNotice, secondNotice) => secondNotice.createdAt - firstNotice.createdAt
        );
        case "cheapest": return notices.sort(
            (firstNotice, secondNotice) => firstNotice.price - secondNotice.price
        );
        case "expensive": return notices.sort(
            (firstNotice, secondNotice) => secondNotice.price - firstNotice.price
        );
    }
}

module.exports = buildSortObjectAfterSearchByKeywords;