const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
// checks if request has necessary properties: deliverTo, mobileNumber, dishes, status all can be passed in
//used for CREATE and UPDATE
function reqHasData(property) {
    return function (req, res, next) {
        const {data={}}=req.body
        if(data[property] && data[property] !== "") {
            return next()
        }
        else next({
            status:400,
            message:`Order must include a ${property} property.`
        })
    }
}

//checks if dishes property is an array with length of at least 1
function dishesValidator(req, res, next) {
    const {data:{dishes}={}} = req.body;
    if(dishes.length >0 && Array.isArray(dishes)) {
        return next();
    } else {
        return next({
            status:400,
            message:`Order must include at least one dish`
        })
    }
}

// checks if quantity property is a valid non-zero integer

function quantityValidator(req, res, next) {
    const{data:{dishes}={}} = req.body
    dishes.forEach((dish, index)=> {
        const quantity=dish.quantity;
        if(!quantity || quantity<1|| Number(quantity) !== quantity) {
            next({
                status:400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            });
        };
    });
    next();
}

//makes sure body id matches orderId for PUT reuqest (aka UPDATE)

function orderIdMatcher(req, res, next) {
    const orderId = req.params.orderId;
    const {data:{id}={}}=req.body;
    if(id) {
        if(id ===orderId) {
            return next()
        } else {
            return next({
                status:400,
                message:`Order id does not match route id. Order: ${id}, Route: ${orderId}`
            })
        }
    } else{
        next();
    }
}





// finds order by id
function orderFinder(req, res, next) {
    const orderId= req.params.orderId
    const foundOrder= orders.find((order)=> order.id===orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    else {
        return next({
            status:404,
            message: `Order does not exist: ${req.params.orderId}`
        });
    };
}

function deleteStatusValidator(req, res,next) {
    const order = res.locals.order
    if(order.status === "pending") {
        return next()
    } else {
        return next({
            status:400,
            message:`An order cannot be deleted unless it is pending`
        })
    }
}

function updateStatusValidator(req, rex, next) {
    const {data:{status}={}} = req.body
    if(!status || (status !== "pending" && status !=="preparing" && status !== "out-for-delivery")) {
        return next({
            status:400,
            message:`Order must have a status of pending, preparing, out-for-delivery, or delivered`
        })
    } else if (status ==="delivered") {
        return next({
            status:400,
            message:`A delivered order cannot be changed`
        })
    }
    next()
}





//uses .post to create a new order


function create(req, res) {
    const {data:{deliverTo, mobileNumber, dishes, status}={}} =req.body;
const newOrder = {
    id:nextId(),
    deliverTo,
    mobileNumber,
    dishes,
    status,
};
orders.push(newOrder);
res.status(201).json({data:newOrder});

}

// uses .get to retrieve all orders

function list (req, res) {
    res.json({data:orders})
}

//uses .get to get one order
function read(req, res) {
    res.json({data:res.locals.order})
}


//uses .put to update an order

function update(req,res) {
    const foundOrder = res.locals.order
    const {data:{deliverTo, mobileNumber, dishes}={}}=req.body
        foundOrder.deliverTo = deliverTo
        foundOrder.mobileNumber=mobileNumber
        foundOrder.dishes = dishes
    res.json({data:foundOrder})
}

// uses .delete to remove an order

function destroy(req, res) {
    const order = res.locals.order;
    const index = orders.findIndex((eachOrder)=> eachOrder.id === Number(order.id));
    orders.splice(index, 1);
    res.sendStatus(204)
}


module.exports = {
list,
create:[reqHasData("deliverTo"),reqHasData("mobileNumber"), reqHasData("dishes"), dishesValidator, quantityValidator, create],
read: [orderFinder, read],
update: [orderFinder, updateStatusValidator, orderIdMatcher, reqHasData("deliverTo"),reqHasData("mobileNumber"),
 reqHasData("dishes"), reqHasData("status"), dishesValidator, quantityValidator, update],
delete:[orderFinder, deleteStatusValidator, destroy]
}