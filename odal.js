const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const db = require('./private/database.js');
const vd = require('./private/validation.js');
const helmet = require('helmet');
const crypto = require('crypto');
const rateLimit = require("express-rate-limit");
const exphbs = require('exphbs')


http.createServer(app).listen(process.env.PORT);
console.log("SERVING RUNNING AT: localhost:" + process.env.PORT);

app.use(helmet());
app.use(function (req, res, next) {
  res.locals.nonce = crypto.randomBytes(10).toString('hex');
  next();
});

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", 'maxst.icons8.com'],
    styleSrc: ["'self'", 'maxst.icons8.com', (req, res) => `'nonce-${res.locals.nonce}'`],
    objectSrc: ["'none'"],
    scriptSrc: ["'self'", "'unsafe-inline'", (req, res) => `'nonce-${res.locals.nonce}'`], // add "'strict-dynamic'"
    baseUri: ["'self'"],
  }
}));

app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }))

app.engine('hbs', exphbs);
app.set('view engine', 'hbs');

// Handlebars helpers
const Handlebars = exphbs.handlebars;

Handlebars.registerHelper('if', function(conditional, options) {
  if (conditional) {
    return options.fn(Handlebars);
  }

return options.inverse(Handlebars);

});

let pgSession = require('connect-pg-simple')(session);
app.use(session({
  store: new pgSession({conString: "postgres://" + process.env.PGDATABASE + ":" + process.env.PGPASSWORD + "@localhost:5432/" + process.env.PGDATABASE}),
  secret: process.env.DB_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 259200000, secure: false, httpOnly: true},
  autoRemove: 'native',
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});

app.use(limiter);
app.use(express.static("public/css"));
app.use(express.static("public/js"));
app.use(express.static("public/images"));



app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname  + '/public/html/index.html'));
});

app.get('/register', async (req, res) => {
  if (vd.verifySession(req)) {
    res.redirect('/profile');
  } else {
    res.sendFile(path.join(__dirname + '/public/html/register.html'));
  }
});

app.post("/register", async (req, res) => {
  if (vd.verifySession(req)) {
    res.redirect('/profile');
  } else {
    try {
      await db.checkRegisteringUser(req);
      vd.passwordsMatch(req);
      vd.userRequirements(req, res);
      db.insertUser(req, new Date());
      res.redirect('/login');
    } catch (err) {
      res.sendStatus(403);
    }
  }
});

app.get('/login', async (req, res) => {
  if (vd.verifySession(req)) {
    res.redirect('/profile');
  } else {
    res.sendFile(path.join(__dirname + '/public/html/login.html'));
  }
});

// The user session is validated/verified to see if the user is logged on.
// IF the user is logged on, they will be redirected to their profile.
// If they are not logged on, the server tries to run several database queries to
// verify and log in the user. If an error occurs during any step of logging in the
// user, the server will send the HTTP error code '403' (Forbidden).
app.post('/login', async (req, res) => {
  if (vd.verifySession(req)) {
    res.redirect('/profile');
  } else {
    try {
      db.checkLoginUserExists(req)
      vd.userRequirements(req);
      db.validateUser(req, res);
      db.updateIpAddress(req);
    } catch (error) {
      res.sendStatus(403);
    }
  }
});

app.get('/profile', async (req, res) => {
  if (vd.verifySession(req)) {

    res.render('profile', {
      layout: false,
      user: req.session.user,
      userBio: await db.retrieveUserBio(req.session.user),
      userPosts: await db.retrieveUserPosts(req.session.user),
    });
  } else {
    res.status(403).send(vd.sessionError());
  }
});

app.get('/profile/customize', async (req, res) => {
  if (vd.verifySession(req)) {
    res.render('profile-customize', {layout: false});
  } else {
    res.status(403).send(vd.sessionError());
  }
});

app.post('/profile/update-bio', async (req, res) => {
  await db.updateUserBio(req.body.update_bio, req.session.user);
  res.redirect('/profile');
});

app.get('/search', async (req, res) => {
  if (vd.verifySession(req)) {
    res.render('search',
    {
      layout: false,
      usernames: await db.retrieveAllUsers(),
    });
  } else {
    res.status(403).send(vd.sessionError());
  }
});

app.post('/search', async (req, res) => {
  res.redirect('/user/' + req.body.usernameSearch);
});


app.get('/logout', async (req, res) => {
  if (vd.verifySession(req)) {
    db.deleteSessions(req.session.user);
    res.redirect('/');
  } else {
    res.sendStatus(403);
  }
});

app.get('/user/:username', async (req, res) => {
  if (vd.verifySession(req)) {
    if (req.params.username == req.session.user) {
      res.redirect('/profile');
    } else {
      let userExists = await db.checkExistingUser(req.params.username);
      if (userExists.rowCount > 0) {
        req.session.lastViewedUser= req.params.username;
        let followingUser = await db.checkUserFollowingExists(req.params.username, req.session.user);
          res.render('other-profiles', {
            layout: false,
            name: req.params.username,
            following: followingUser,
            userBio: await db.retrieveUserBio(req.params.username),
            userPosts: await db.retrieveUserPosts(req.params.username),
          });
      } else {
        res.sendStatus(403);
      }
    }
  }
});

app.get('/profile/following', async (req, res) => {
  if (vd.verifySession(req)) {
    let following = await db.retrieveUserFollowing(req.session.user)
    res.render('user-following',  {
      layout: false,
      userFollowing: following,
    });
  } else {
    res.sendStatus(403);
  }
});

app.get('/profile/followers', async (req, res) => {
  if (vd.verifySession(req)) {
    let followers = await db.retrieveUserFollowers(req.session.user);
    res.render('user-followers', {
      layout: false,
      userFollowers: followers,
    });
  } else {
    res.sendStatus(403);
  }
});

app.post('/user/follow', async (req, res) => {
  db.addUserFollower(req.session.user, req.session.lastViewedUser);
  res.redirect('/user/' + req.session.lastViewedUser);
});

app.post('/user/unfollow', async (req, res) => {
  db.removeUserFollower(req.session.user, req.session.lastViewedUser);
  res.redirect('/user/' + req.session.lastViewedUser);
});

app.get('/browser', async (req, res) => {
  if (vd.verifySession(req)) {
    let miniverseColumn = await db.listMiniverses();
    let miniverseFollowerCount = await db.listMiniverseFollowerCount();
    res.render('browser', {
      layout: false,
      miniverseColumn: miniverseColumn,
      miniverseFollowerCount: miniverseFollowerCount,
    });
  } else {
    res.status(403).send(vd.sessionError());
  }
});

app.get('/create/miniverse', async (req, res) => {
  if (vd.verifySession(req)) {
    res.render('create-miniverse', {
      layout: false,
    });
  } else {
    res.status(403).send("Please register, login, or enable cookies to access this content.");
  }
});

app.post('/create/miniverse', async (req, res) => {
  try {
    vd.miniverseCreationForm(req);
    let nameExists = await db.findMiniverseName(req.body.miniverseName);
    if (nameExists > 0) {
      throw "Name already exists";
    }
    let encodedURI = encodeURIComponent(req.body.miniverseName);
    db.createMiniverse(req, encodedURI);
    res.redirect('/browser');
  } catch (error) {
    res.sendStatus(404);
  }
});

app.get('/m/:miniverseName', async (req, res) => {
  if (vd.verifySession(req)) {
    let miniverseExists = await db.findMiniverseName(req.params.miniverseName);
    if (miniverseExists > 0) {
      req.session.lastViewedMiniverse = req.params.miniverseName;
      let miniverseCreatorName = await db.retrieveMiniverseCreatorName(req.params.miniverseName);
      if (miniverseCreatorName == req.session.user) {
        res.render('miniverse-creator', {
          layout: false,
          miniverseName: req.params.miniverseName,
          miniverseCreatorName: miniverseCreatorName,
          miniverseSummary: await db.retrieveMiniverseSummaries(req.params.miniverseName),
          miniverseTopics: await db.topicColumnsOrderedByCreationDate(req.params.miniverseName),
          nonceID: `${res.locals.nonce}`,
        });
      } else {
        let followerExists = await db.checkMiniverseFollowerExists(req);
        if (followerExists == 1) {
          res.render('miniverse-followed', {
            layout: false,
            miniverseData: await db.retrieveMiniverseDataParams(req),
            miniverseTopics: await db.topicColumnsOrderedByCreationDate(req.params.miniverseName),
            nonceID: `${res.locals.nonce}`,
          });
        } else {
          res.render('miniverse-unfollowed', {
            layout: false,
            miniverseData: await db.retrieveMiniverseDataParams(req),
            miniverseTopics: await db.topicColumnsOrderedByCreationDate(req.params.miniverseName),
            nonceID: `${res.locals.nonce}`,
          });
        }
      }
    }
  } else {
    res.sendStatus(403);
  }
});

app.post('/m/delete', async (req, res) => {
  await db.deleteMiniverse(req.session.user, req.session.lastViewedMiniverse);
  res.redirect('/browser');
});

app.get('/m/:miniverseName/topic/:topic', async (req, res) => {

  if (vd.verifySession(req)) {
    req.session.lastViewedTopic = req.params.topic;
    if (await db.retrieveMiniverseTopicCreator(req.params.miniverseName, req.params.topic) == req.session.user) {
      res.render('miniverse-topic-creator', {
        layout: false,
        topicTitle: await db.retrieveMiniverseTopicTitle(req.session.lastViewedMiniverse, req.params.topic),
        topicSummary: await db.retrieveMiniverseTopicSummary(req.session.lastViewedMiniverse, req.params.topic),
        topicCreator: await db.retrieveMiniverseTopicCreator(req.session.lastViewedMiniverse, req.params.topic),
        topicReplies : await db.displayUserTopicReplies(req.params.topic, req.params.miniverseName),
      });
    } else {
      res.render('miniverse-topic', {
        layout: false,
        topicTitle: await db.retrieveMiniverseTopicTitle(req.session.lastViewedMiniverse, req.params.topic),
        topicSummary: await db.retrieveMiniverseTopicSummary(req.session.lastViewedMiniverse, req.params.topic),
        topicCreator: await db.retrieveMiniverseTopicCreator(req.session.lastViewedMiniverse, req.params.topic),
        topicReplies : await db.displayUserTopicReplies(req.params.topic, req.params.miniverseName),
      });
    }
  } else {
    res.sendStatus(403);
  }
});

app.post('/topic-delete', async (req, res) => {
  await db.deleteMiniverseTopic(req.session.user, req.session.lastViewedMiniverse, req.session.lastViewedTopic);
  res.redirect('/browser');
});

app.post('/create/topic-reply', async (req, res) => {
  if (await db.checkRepliesExist() <= 0) {
    await db.createUserReply(req, 0);
  } else {
    let replyID = await db.lastReplyID();
    await db.createUserReply(req, replyID);
  }
  res.redirect('/m/' + req.session.lastViewedMiniverse + '/topic/' + req.session.lastViewedTopic);
});

app.post('/reply-delete', async (req, res) => {
  if (req.body.replyCreator == req.session.user) {
    await db.deleteMiniverseTopicReply(req.session.user, req.body.replyID);
    res.redirect('back');
  } else {
    res.send("<h1>This is not your post!<h1>")
  }
});

app.post('/m/follow', async (req, res) => {
  db.updateMiniverseFollowers(req);
  res.redirect('/browser');
});

app.post('/m/unfollow', async (req, res) => {
  db.removeMiniverseFollower(req.session.user, req.session.lastViewedMiniverse);
  res.redirect('/browser');
});

app.post('/create/miniverse-post', async (req, res) => {
  if (req.body.topicTitle  == '' || req.body.topicContent == '') {
    res.send("<h1>Please include a title and the content of the post <br> that you are trying to make and try again.</h1>");
  } else {
    if (await db.checkMiniverseTopicsExist(req.session.lastViewedMiniverse) == 0) {
      db.insertMiniverseTopic(req, new Date(), 1);
    } else {
      let topicID = await db.lastMiniverseID(req.session.lastViewedMiniverse);
      topicID = parseInt(topicID) + 1;
      db.insertMiniverseTopic(req, new Date(), topicID);
    }
    res.redirect('/m/' + req.session.lastViewedMiniverse);
  }
});

app.post('/create/profile-post', async (req, res) => {
  if (vd.verifySession(req)) {
    if (req.body.profilePostContent != '') {
      let d = new Date();
      let date = d.toString();
      if (await db.checkProfilePostsExist() == false) {
        db.insertProfilePost(req, date, 1);
      } else {
        let postID = await db.lastPostID(req.session.user);
        postID = parseInt(postID) + 1;
        db.insertProfilePost(req, date, postID);
      }
    }
    res.redirect('back');
  } else {
    res.status(403).send(vd.sessionError());
  }
});

app.get('/admin', async (req, res) => {
  if (vd.verifySession(req)) {
    if (await db.retrieveUserRole(req.session.user) != "admin") {
      res.sendStatus(403);
    } else {
      res.render('admin-panel', {
        layout: false,
        allUsers: await db.retrieveUsersData(),
        adminUsername: req.session.user,
      });
    }
  } else {
    res.sendStatus(401);
  }
});

app.get('/chat', async (req, res) => {
  res.send("Feature is currently disabled.");
});

app.get('/terms-and-conditions', async (req, res) => {
  res.sendFile(path.join(__dirname + '/public/html/terms-and-conditions.html'));
});

app.get('/privacy-policy', async (req, res) => {
  res.sendFile(path.join(__dirname + '/public/html/privacy-policy.html'));
});
