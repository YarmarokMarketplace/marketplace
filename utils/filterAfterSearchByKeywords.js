const buildFilterAfterSearchByKeywords = (params) => { 
  
    const { goodtype, priceRange, location } = params;
    let minPrice = 0;
    let maxPrice = 0;

    if (priceRange) {
        const formattedPriceRange = priceRange.split("-");
        minPrice = Number(formattedPriceRange[0]);
        maxPrice = Number(formattedPriceRange[1]);
    }

    if (goodtype && !priceRange && !location) { 
        return { goodtype }
    }

    if (!goodtype && !priceRange && location) {
        return { location }
    }

    if (goodtype && !priceRange && location) {
        return { $and: [{ goodtype }, {location}] }
    }

    if (!goodtype && priceRange && location) { 
        return { $and: 
            [ 
            { location }, 
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (goodtype && priceRange && !location) { 
        return { $and: 
            [ 
            { goodtype },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
            {active: true},
            ] 
        }
    }

    if (goodtype && priceRange && location) { 
        return { $and: 
            [ 
            { goodtype },
            { location },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (!goodtype && priceRange && !location) {
        return { $and: [{ $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}] }
    }

    else return { };
}

module.exports = buildFilterAfterSearchByKeywords;