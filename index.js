const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const  {MongoClient}  = require('mongodb');
require('dotenv').config()
const app = express()
const port = 4000


app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static('service'));

app.use(fileUpload());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rg1nk.mongodb.net/facebook?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const postsCollection = client.db("facebook").collection("posts");
  const photoCollection = client.db("facebook").collection("photo");
  // perform actions on the collection object



 /////show post
 app.get('/posts', (req, res) => {
   postsCollection.find({})
   .toArray((err, documents)=>{
     res.send(documents);
   })
 })


////add post
  app.post('/post', (req, res)=>{
      const photo = req.body.photo;
      const name = req.body.name;
      const email = req.body.email;
      const caption = req.body.caption;
      const image = req.files?.image;
      const filePath = `${__dirname}/service/${image?.name}`;
      
       
         if (caption && image){
       
       
        image.mv(filePath, err => {
          if(err){
            res.status(500).send({msg:'Failed to upload Image'});
          }
          const newImage = fs.readFileSync(filePath);
          const encImg = newImage.toString('base64');
          const postImage = {
            contentType: req.files?.image.mimetype,
            size:req.files?.image.size,
            img: Buffer.from(encImg, 'base64')
          }
          postsCollection.insertOne({postImage, name, email, caption, photo})
          .then(result => {
            fs.remove(filePath, err => {
              if(err){
                res.status(500).send({msg:'Failed to'});
              }
              res.send(result.insertedCount > 0);
            })
          })
        })
      } else if(!caption){
           
        
       image.mv(filePath, err => {
         if(err){
           res.status(500).send({msg:'Failed to upload Image'});
         }
         const newImage = fs.readFileSync(filePath);
         const encImg = newImage.toString('base64');
         const postImage = {
           contentType: req.files?.image.mimetype,
           size:req.files?.image.size,
           img: Buffer.from(encImg, 'base64')
         }
         postsCollection.insertOne({postImage, name, email, photo})
         .then(result => {
           fs.remove(filePath, err => {
             if(err){
               res.status(500).send({msg:'Failed to'});
             }
             res.send(result.insertedCount > 0);
           })
         })
       })
      } else {
        postsCollection.insertOne({name, email, caption, photo})
        .then(result => {
          res.status(200).send(result.insertedCount > 0);
        })
      }
      
  })
 
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port || process.env.PORT)