const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


//checks if request has data properties (name, description, image_url passed in)
const reqHasData = (property) => {
    return (req, res, next) => {
        const {data = {}} = req.body;
        if(data[property] &&data[property] !== "") {
            next()
        }
        next({
            status:400,
            message:`Dish must include a ${property}`
        })
    }
}

//checks if request has a valid price
const priceValidator = (req, res, next) =>{
    const {data:{price}={}}= req.body;
    if(Number(price)>0 && typeof price === "number") {
        next()
    }
    else {
        next({
            status: 400,
            message:`Dish must have a price that is an integer greater than 0 `
        })
    }
}

///checks if router param aka url aka dishId, matches with the request body id
const dishIdMatches = (req, res, next) => {
    const {dishId} = req.params;
    const {data:{id}={}} = req.body
   if (id){
    if(id !== dishId) {
        next({
            status:400,
            message:`Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        })
    }
    else{
        next()
    }
}
next()
}



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
            status: 404,
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
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({data:dish})
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
create:[reqHasData("name"), reqHasData("description"), priceValidator, reqHasData("image_url"), create],
update:[dishFinder, dishIdMatches, reqHasData("name"), reqHasData("description"), priceValidator, reqHasData("image_url"), update]
}