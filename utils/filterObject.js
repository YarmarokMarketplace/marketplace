const buildFilterObject = (params) => { 

    const { category, goodtype, priceRange, location, minSellerRating } = params;
    let minPrice = 0;
    let maxPrice = 0;

    if (priceRange) {
        const formattedPriceRange = priceRange.split("-");
        minPrice = Number(formattedPriceRange[0]);
        maxPrice = Number(formattedPriceRange[1]);
    }

    if (goodtype && !priceRange && !location && !minSellerRating) { 
        return { $and: [{ category }, { goodtype }] }
    }

    if (!goodtype && !priceRange && location && !minSellerRating) {
        return { $and: [{ category }, { location }] }
    }

    if (goodtype && !priceRange && location && !minSellerRating) {
        return { $and: [{ category }, { goodtype }, {location}] }
    }

    if (!goodtype && priceRange && location && !minSellerRating) { 
        return { $and: 
            [{ category }, 
            { location }, 
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (goodtype && priceRange && !location && !minSellerRating) { 
        return { $and: 
            [{ category }, 
            { goodtype },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
            {active: true},
            ] 
        }
    }

    if (goodtype && priceRange && location && !minSellerRating) { 
        return { $and: 
            [{ category }, 
            { goodtype },
            { location },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}
            ] 
        }
    }

    if (!goodtype && priceRange && !location && !minSellerRating) {
        return { $and: [{ category },  { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]}] }
    }

    if (goodtype && !priceRange && !location && minSellerRating) { 
        return { $and: [{ goodtype }, { category },
            {$and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]}]}
    }

    if (!goodtype && !priceRange && !location && minSellerRating) { 
        return { $and: [{ category },
                        {$and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]}]}
    }

    if (!goodtype && !priceRange && location && minSellerRating) {
        return { $and: [{ category }, { location }, 
                        {$and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]}] }
    }

    if (goodtype && !priceRange && location && minSellerRating) {
        return { $and: [{ category }, { goodtype }, {location}, 
                        {$and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]}] }
    }

    if (!goodtype && priceRange && location && minSellerRating) { 
        return { $and: 
            [{ category }, 
            { location }, 
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]},
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]},
            ] 
        }
    }

    if (goodtype && priceRange && !location && minSellerRating) { 
        return { $and: 
            [{ category }, 
            { goodtype },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
            {active: true},
            {$and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]},
            ] 
        }
    }

    if (goodtype && priceRange && location && minSellerRating) { 
        return { $and: 
            [{ category }, 
            { goodtype },
            { location },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]},
            { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) } }]},
            ] 
        }
    }

    if (!goodtype && priceRange && !location && minSellerRating) {
        return { $and: [{ category },  
                        { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
                        { $and: [ { "owner.0.rating": { $gte: Number(minSellerRating) }}]}] }
    }
    
    else return { category };
}

module.exports = buildFilterObject;