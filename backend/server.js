const express = require("express");
const app = express();
const Datastore = require("nedb");
const multer = require('multer');
const path = require("path");
var fs = require("fs");
var nodemailer = require('nodemailer');
//const fileUpload = require('express-fileupload');
//app.use(fileUpload());





app.use(express.urlencoded({ extended: true }));



const database = new Datastore("posts.db");
database.loadDatabase();

const accountDatabase = new Datastore("accounts.db");
accountDatabase.loadDatabase();

const newsletterDatabase = new Datastore("newsletterEmails.db");
newsletterDatabase.loadDatabase();




function sendEmail(){
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'drakehughes75@gmail.com',
      pass: 'ybyoszehwsbopbvl'
    }
  });
  var mailingList = "";
  newsletterDatabase.find({},(err, data) => {
    if(err){
      response.end(); 
      return;
    } 
    for(i=0;i<data.length;i++){
      mailingList += data[i]["email"];
      if(i+1<data.length){mailingList += ", ";}
    }
    console.log(mailingList)
  
    var mailOptions = {
      from: 'drakehughes75@gmail.com',
      to: mailingList,
      subject: 'New Post  by Drake!',
      html: '<h1>Drake has published a new post on INSERT SITE LATER</h1> <br> <p>If you wish to stop reciving these emails, please response as such.</p>'
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images/")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage});

app.post("/uploadPost", upload.single("image"), (req, res) => {
  //var imageLocation = __dirname+"/images/"+req.file.filename;
  if(req.body.password=="password"){
    const data = {"image": req.file.filename, "title": req.body.title, "description": req.body.description, "article": req.body.article, "date": new Date().getMonth()+1 + "/" + new Date().getDate() + "/" + new Date().getFullYear()};
    database.insert(data);
    res.json(data);
    sendEmail();
  }
});

//database.insert({"image": "imageLocation", "title": "req.body.title", "description": "req.body.description", "article": "req.body.article"});


//accountDatabase.insert({username: "newbuild100@outlook.com", password: "password"})
app.get("/getPost", (request, response) => {
  database.find({},(err, data) => {
    if(err){
      response.end(); 
      return;
    }
    app.use('/static', express.static(__dirname+'/images'))
    response.json(data);
  });
});

app.use(express.static("build"));
app.get("/getImages", (req, res) => {
  var folders = fs.readdirSync('./images');
  res.json(folders);
});
app.use(express.static(__dirname+"/images"));


/*
app.post("/postPost", (request, response) => {
  const data = {"image":"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.5Zw0aieDcEY3HHz7T0BpHAHaF7%26pid%3DApi&f=1","title":"Mars Rover","description":"The Mars Rover does some cool stfff and all","article":"Some stuff about the mars rover or whatever. Blah blah blah, nasa"};
  database.insert(data);
  response.json(data);
}) */

app.post("/login", (req, res) => {
  accountDatabase.find({"username": req.body.username},(err, data) => {
    if(err){
      res.end();
      return;
    }
    if(data[0]==undefined||data[0]==null){
      res.end();
      return;
    }
    res.json(data[0]["password"]==req.body.password);
  });
});


app.post("/signupNewsletter", (req, res) => {
  const data = {"email": req.body.email};
  newsletterDatabase.insert(data);
  res.json(data);
});



app.use(express.json({strict: false}))
app.post("/getSpecificPost", (request, response) => {
  database.find({"_id": request.body},(err, data) => {
    if(err){
      response.end(); 
      return;
    }
    app.use('/static', express.static(__dirname+'/images'))
    response.json(data);
  });
});


app.listen(5000, () => { console.log("Server started on port 5000") })
