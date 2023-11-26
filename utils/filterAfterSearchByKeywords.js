const buildFilterAfterSearchByKeywords = params => { 

    const { goodtype, priceRange, location, category, minSellerRating } = params;

    let minPrice = 0;
    let maxPrice = 0;

    if (priceRange) {
        const formattedPriceRange = priceRange.split("-");
        minPrice = Number(formattedPriceRange[0]);
        maxPrice = Number(formattedPriceRange[1]);
    }

    if (goodtype && !priceRange && !location && !category && !minSellerRating) { 
        return { goodtype }
    }

    if (goodtype && !priceRange && !location && category && !minSellerRating) { 
        return { $and: [{goodtype}, {category} ]}
    }

    if (!goodtype && !priceRange && location && !category && !minSellerRating) {
        return { location }
    }

    if (!goodtype && !priceRange && location && category && !minSellerRating) {
        return { $and: [{location}, {category} ] }
    }

    if (goodtype && !priceRange && location && !category && !minSellerRating) {
        return { $and: [{ goodtype }, {location}] }
    }

    if (goodtype && !priceRange && location && category && !minSellerRating) {
        return { $and: [{ goodtype }, {location}, {category}] }
    }

    if (!goodtype && priceRange && location && !category && !minSellerRating) { 
        return { $and: 
            [ 
            { location }, 
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (!goodtype && priceRange && location && category && !minSellerRating) { 
        return { $and: 
            [ 
            { location }, {category},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (goodtype && priceRange && !location && !category && !minSellerRating) { 
        return { $and: 
            [ 
            { goodtype },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
            {active: true},
            ] 
        }
    }

    if (goodtype && priceRange && !location && category && !minSellerRating) { 
        return { $and: 
            [ 
            { goodtype }, {category},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
            {active: true},
            ] 
        }
    }

    if (goodtype && priceRange && location && !category && !minSellerRating) { 
        return { $and: 
            [ 
            { goodtype },
            { location },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (goodtype && priceRange && location && category && !minSellerRating) { 
        return { $and: 
            [ 
            { goodtype }, {category},
            { location },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (!goodtype && priceRange && !location && !category && !minSellerRating) {
        return { $and: [{ $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}] }
    }

    if (!goodtype && priceRange && !location && category && !minSellerRating) {
        return { $and: [{category}, { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}] }
    }

    if (!goodtype && !priceRange && !location && category && !minSellerRating) {
        return { category }
    }

    //
    if (goodtype && !priceRange && !location && !category && minSellerRating) { 
        return { $and: 
            [{goodtype}, 
                { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]}]}
    }

    if (goodtype && !priceRange && !location && category && minSellerRating) { 
        return { $and: 
            [{goodtype}, 
                {category}, 
                { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]} ]}
    }

    if (!goodtype && !priceRange && location && !category && minSellerRating) {
        return { $and: 
            [{location}, 
                { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]} ] }
    }

    if (!goodtype && !priceRange && location && category && minSellerRating) {
        return { $and: [
            {location}, 
            {category}, 
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]} ] }
    }

    if (goodtype && !priceRange && location && !category && minSellerRating) {
        return { $and: 
            [{ goodtype }, 
                {location}, 
                { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]}] }
    }

    if (goodtype && !priceRange && location && category && minSellerRating) {
        return { $and: [{ goodtype }, {location}, {category}, 
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]}] }
    }

    if (!goodtype && priceRange && location && !category && minSellerRating) { 
        return { $and: 
            [ 
            { location }, 
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (!goodtype && priceRange && location && category && minSellerRating) { 
        return { $and: 
            [ 
            { location }, {category}, 
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (goodtype && priceRange && !location && !category && minSellerRating) { 
        return { $and: 
            [ 
            { goodtype }, 
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
            ] 
        }
    }

    if (goodtype && priceRange && !location && category && minSellerRating) { 
        return { $and: 
            [ 
            { goodtype }, {category}, 
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
            ] 
        }
    }

    if (goodtype && priceRange && location && !category && minSellerRating) { 
        return { $and: 
            [ 
            { goodtype },
            { location },
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (goodtype && priceRange && location && category && minSellerRating) { 
        return { $and: 
            [ 
            { goodtype }, {category},
            { location }, 
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (!goodtype && priceRange && !location && !category && minSellerRating) {
        return { $and: [
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]},
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}] }
    }

    if (!goodtype && priceRange && !location && category && minSellerRating) {
        return { $and: [{ $and: [ { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]}]}, 
                {category}, { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}] }
    }

    if (!goodtype && !priceRange && !location && category && minSellerRating) {
        return { $and: [{category}, { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]} ] }
    }

    if (!goodtype && !priceRange && !location && !category && minSellerRating) {
        return { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) }}]}
    }

    else return { };

}


module.exports = buildFilterAfterSearchByKeywords;