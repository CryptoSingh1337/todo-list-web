const mongoose = require("mongoose");

exports.connect = function (url) {
    try {
        mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Database connected");
    } catch (error) {
        console.log(error.message);
        throw err;
        process.exit(-1);
    }
}

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);    // MongoDB Collection
const List = mongoose.model("List", listSchema);    // Custom List Collection

exports.saveItem = function (name) {
    new Item({
        name: name
    }).save().then(() => {
        console.log("Item Saved");
    }).catch(err => {
        console.log("db error " + err.message);
        console.log("Item not saved");
        throw err;
    });
}

exports.saveManyItems = function (itemsArray) {
    Item.insertMany(itemsArray, err => {
        if (err) {
            console.log(err.message);
            throw err;
        }
        else
            console.log("Default Items saved");
    });
}

exports.saveList = function (name, defaultList) {
    new List({
        name: name,
        items: defaultList
    }).save().then(() => {
        console.log("List saved");
    }).catch(err => {
        console.log("db error " + err.message);
        console.log("List not saved");
    });
}

exports.pushDefault = function(list, ...defaultItems) {
    List.findOne({_id: list._id}, (err, foundList) => {
        if(err) {
            console.log(err.message);
            throw err;
        } else {
            foundList.items = defaultItems;
            foundList.save();
        }
    });
    console.log("Pushed Default Items");
}


exports.saveListItem = function (listName, newItem) {
    List.findOne({ name: listName }, (err, foundList) => {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            const item = new Item({
                name: newItem
            });
            foundList.items.push(item);
            foundList.save();
            console.log("List Item saved!");
        }
    })
}

exports.getItems = function () {
    return Item.find({}, (err, items) => {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            // console.log(items);
            return items;
        }
    });
}

exports.getLists = function (name) {
    return List.findOne({ name: name }, (err, found) => {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            if (found === null)
                return null;
            else {
                return found;
            }
        }
    });
}

exports.clearAllItems = function () {
    Item.deleteMany({}).then(() => console.log("Cleared The DB!"));
}

exports.getDefaultItems = function () {
    return [new Item({ name: "Welcome to your TodoList!" }), new Item({ name: "Hit the + button to add a new item." }), new Item({ name: "<----Hit this to delete an item." })];
}

exports.deleteItemById = function (id) {
    Item.findByIdAndRemove(id, err => {
        if (err) {
            console.log(err.message);
            console.log("Item not deleted");
        } else
            console.log("Item Deleted");
    });
}

exports.deleteListItemById = function (listName, id) {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: id } } }, (err, result) => {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("List Item deleted!");
        }
    });
}

exports.close = mongoose.connection.close();