const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sohit:Test123@cluster0.uw6cakl.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your To Do List"
});

const item2 = new Item({
    name: "Hit the + button to add an item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = new mongoose.model("List",listSchema);

app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Successfully saved default items to DB");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("list", { listTitle: "Today", newListItem: foundItems });
        }
    });

});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                // Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                // Show an existing list
                res.render("list",{listTitle: foundList.name, newListItem:foundList.items});
            }
        }
        else{
            console.log(err);
        }
    });
   
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const itemNew = new Item({
        name: itemName
    });
    if(listName === "Today"){
        itemNew.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(itemNew);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Successfully deleted checked item");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
            else{
                console.log(err);
            }
        });
    }   
});




app.listen(process.env.PORT || 3000, function () {
    console.log("Server has started successfully");
});


// Mongodb Atlas Cloud Database Access Authentication
// Username
// admin-sohit

// Password
// Test123

// Heroku Website
// https://to-do-list-08.herokuapp.com/