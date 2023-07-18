const buildSortObject = (param) => { 
    switch (param) { 
        case "oldest": return { createdAt: 1 };
        case "cheapest": return { price: 1 };
        case "expensive": return { price: -1 };
        default: return { createdAt: -1 };
    }
}

module.exports = buildSortObject;