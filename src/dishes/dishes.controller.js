const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


//finds dish / validates if dishId in request exists
const dishFinder = (req, res, next) => {
    const {dishId} = req.params;
    const foundDish = dishes.find((dish) => dish.id===dishId);
    if (foundDish) {
        res.locals.dish = foundDish
        next()
    }
    else {
        next({
            satus: 404,
            message: `Dish ID does not exist: ${dishId}`
        })
    }
}



// call with .post method to create a new dish

const create = (req, res) => {
    const {data: {name, description, price, image_url}} = req.body
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    };
dishes.push(newDish);
res.status(201).json({data:newDish})
}


// call with .put to update a dish

function update(req, res) {
    const dish = res.locals.dish
    const { data: { name, description, price, image_url } = {} } = req.body;
    
}


// call with .get to get one dish 

const read = (req, res) => {
const dish = res.locals.dish
res.json({data: dish})
}


// call with .get to get all dishes
const list = (req, res) => {
    res.json({data:dishes})
}

module.exports = {
    read: [dishFinder, read],
list,
create
}