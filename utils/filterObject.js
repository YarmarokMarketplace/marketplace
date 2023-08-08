const buildFilterObject = (params) => { 
    const { category, goodtype, priceRange} = params;
    let minPrice = 0;
    let maxPrice = 0;
    if (priceRange) {
        const formattedPriceRange = priceRange.split("-");
        minPrice = Number(formattedPriceRange[0]);
        maxPrice = Number(formattedPriceRange[1]);
    }
    if (goodtype && !priceRange) { 
        return { $and: [{ category }, { goodtype }, {active: true}] }
    }
    if (goodtype && priceRange) { 
        return { $and: 
            [{ category }, 
            { goodtype },
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice }}]},
            {active: true},
            ] 
        }
    }
    if (!goodtype && priceRange) {
        return { $and: [{ category }, 
            { $and: [ { price: { $gte: minPrice, $lte: maxPrice } }]},
            {active: true},] }
    }
    else return { $and: [{ category }, {active: true}]};
}

module.exports = buildFilterObject;