const express = require('express')
const app = express()
app.use(express.json());
const port = 3000

const fileUpload = require('express-fileupload');
app.use(fileUpload());


  

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

db.serialize(function() {
    console.log('Creating database if it doesn\'t exist');
    db.run('CREATE TABLE if not exists images (id integer primary key, url text not null, datetime integer)');
});



app.post('/api/images', (req, res, next) => {
    try {
        const datetime = new Date().getTime();
        const image = req.files.image;
        const caption = req.body.caption;
                
        const pathName = '/images/' + image.name

        console.log('Saving image to ' + __dirname + pathName);

        // Flytta filen til images-mappen
        image.mv(__dirname + pathName);

        db.serialize(function() {
            db.run('INSERT INTO images (url, datetime) VALUES (?, ?)', [pathName, Date.now()], function(err) {
                if(err) {
                    console.error(err);
                    return res.status(500).json(err);
                }
            });
        });
        return res.send('ok')
        
    } catch(err) {
      console.error(`Error `, err.message);
      return res.status(500).json(err);
    };
});



app.get('/api/images', (req, res, next) => {
    try {
      db.serialize(function() {
        db.all("SELECT * FROM images", function(err, data){
          res.json({ images: data });
        });
      });
    } catch(err) {
      console.error(`Error `, err.message);
      res.status(500).json(err);
    };
});





// Opgave 1:

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// Serve style.css
app.get('/style', (req, res) => {
    res.sendFile(__dirname + '/style.css')
})

// sevrer images
app.get('/images/:name', (req, res) => {
    res.sendFile(__dirname + '/images/' + req.params.name)
})

// public folder
app.use(express.static('images'));


// serve on port
var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
})

