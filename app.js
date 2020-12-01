const express = require("express");
const bodyParser = require("body-parser");
const dbHandling = require("./DB/dbHandling");
const _ = require("lodash");

const app = express();
const url = "mongodb+srv://**REMOVED**:**REMOVED**@cluster0.msjrw.mongodb.net/todoListDB";
const port = 8080;

const defaultItems = dbHandling.getDefaultItems();


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connecting mongoose with the MongoDB
dbHandling.connect(url);

app.get("/", async (req, res) => {
    const items = await dbHandling.getItems();
    if (items.length === 0) {
        dbHandling.saveManyItems(defaultItems);
        res.redirect("/");
    } else {
        res.render("list", { listTitle: "Today", newListItems: items });
    }
});

app.post("/", (req, res) => {
    const newItem = req.body.newItem;
    const listName = req.body.list;
    if (listName === "Today") {
        dbHandling.saveItem(req.body.newItem);
        res.redirect("/");
    } else {
        dbHandling.saveListItem(listName, newItem);
        res.redirect("/" + listName);
    }
});

app.post("/delete", (req, res) => {
    const listName = req.body.listName;
    const checkBoxItemId = req.body.checkbox;
    if(listName === "Today") {
        dbHandling.deleteItemById(req.body.checkbox);
        res.redirect("/");
    } else {
        dbHandling.deleteListItemById(listName, checkBoxItemId);
        res.redirect("/" + listName);
    }
});

app.get("/:customListName", async (req, res) => {
    const listName = _.capitalize(req.params.customListName);
    const list = await dbHandling.getLists(listName);
    // console.log(list);
    if (list === null) {
        console.log("List is Empty!");
        dbHandling.saveList(listName, defaultItems);
        res.redirect("/" + listName);
    } else {
        if(list.items.length === 0) {
            dbHandling.pushDefault(list, ...defaultItems);
            res.redirect("/" + listName);
        } else {
            res.render("list", { listTitle: list.name, newListItems: list.items }); 
        }
    }
});

app.get("*", (req, res) => {
    res.send('<img alt="404" src="https://illustatus.herokuapp.com/?title=Oops,%20Page%20not%20found&fill=%234f86ed"/>');
});

app.listen(process.env.PORT || port, () => {
    console.log("Server is running on port: " + port);
});