var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Video = require('./Videos');
var Comment = require('./Comments')
var mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        //user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});


app.post('/video', (req, res) => {
    const dbVideos = req.body
    Video.create(dbVideos, (err, data) => {
        if(err)
            res.status(500).send(err)
        else
            res.status(201).send(data)
    })
})

app.get('/video', (req, res) => {
    Video.find((err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post('/comments/', authJwtController.isAuthenticated, (req, res) => {
    const newComment = req.body;

    if (req.get('Content-Type')) {
        res = res.type(req.get('Content-Type'));
    }
    try {
        var objectId = ObjectId(req.params.id);
    } catch (err) {
        res.json({success: false, msg: 'Invalid video ID'});
        return;
    }

    Comment.create(newComment, (err, data) => {
        if(err)
            res.status(500).json({success: false, msg: err})
        else
            res.status(201).json({success: true, msg: 'Comment posted', data: data})
    });
})

app.get('/comments/:id', (req, res) => {
    res = res.status(200);
    var o = getJSONObjectForMovieRequirement(req);

    if (req.get('Content-Type')) {
        res = res.type(req.get('Content-Type'));
    }
    try {
        var objectId = ObjectId(req.params.id);
    } catch (err) {
        res.json({success: false, msg: 'Invalid video ID'});
        return;
    }

    console.log("getting comment with id ", req.params.id);
    Comment.find({videoId: req.params.id}, function(err, comments) {
        if (err) {
            res.send(err);
        } else {
            res.send(comments);
        }
    });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


