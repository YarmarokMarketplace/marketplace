const buildFilterAfterSearchByKeywords = (params) => { 
  
    const { goodtype, priceRange, location, category } = params;
    let minPrice = 0;
    let maxPrice = 0;

    if (priceRange) {
        const formattedPriceRange = priceRange.split("-");
        minPrice = Number(formattedPriceRange[0]);
        maxPrice = Number(formattedPriceRange[1]);
    }

    if (goodtype && !priceRange && !location && !category) { 
        return { goodtype }
    }

    if (goodtype && !priceRange && !location && category) { 
        return { $and: [{goodtype}, {category} ]}
    }

    if (!goodtype && !priceRange && location && !category) {
        return { location }
    }

    if (!goodtype && !priceRange && location && category) {
        return { $and: [{location}, {category} ] }
    }

    if (goodtype && !priceRange && location && !category) {
        return { $and: [{ goodtype }, {location}] }
    }

    if (goodtype && !priceRange && location && category) {
        return { $and: [{ goodtype }, {location}, {category}] }
    }

    if (!goodtype && priceRange && location && !category) { 
        return { $and: 
            [ 
            { location }, 
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (!goodtype && priceRange && location && category) { 
        return { $and: 
            [ 
            { location }, {category},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (goodtype && priceRange && !location && !category) { 
        return { $and: 
            [ 
            { goodtype },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
            {active: true},
            ] 
        }
    }

    if (goodtype && priceRange && !location && category) { 
        return { $and: 
            [ 
            { goodtype }, {category},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
            {active: true},
            ] 
        }
    }

    if (goodtype && priceRange && location && !category) { 
        return { $and: 
            [ 
            { goodtype },
            { location },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (goodtype && priceRange && location && category) { 
        return { $and: 
            [ 
            { goodtype }, {category},
            { location },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (!goodtype && priceRange && !location && !category) {
        return { $and: [{ $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}] }
    }

    if (!goodtype && priceRange && !location && category) {
        return { $and: [{category}, { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}] }
    }

    if (!goodtype && !priceRange && !location && category) {
        return { category }
    }

    else return { };
}

module.exports = buildFilterAfterSearchByKeywords;