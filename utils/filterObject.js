const buildFilterObject = (params) => { 
    const { category, goodtype, priceRange } = params;
    const formattedPriceRange = priceRange.split("-");
    const minPrice = Number(formattedPriceRange[0]);
    const maxPrice = Number(formattedPriceRange[1]);
    if (goodtype && !priceRange) { 
        return { $and: [{ category }, { goodtype }] }
    }
    if (goodtype && priceRange) { 
        return { $and: [{ category }, { goodtype }, { price: { $in: [minPrice, maxPrice] } }] }
    }
    if (!goodtype && priceRange) {
        return { $and: [{ category }, { price: { $in: [minPrice, maxPrice] } }] }
    }
    else return { category };
}

module.exports = buildFilterObject;