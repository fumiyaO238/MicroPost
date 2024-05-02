const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const getFormatedCurrentTime = require('../util/datetime');

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();

  if (isAuth) {
    const userName = req.user.name;
    const myId = req.user.id;
    let following;
    let followes;
    const datetime = getFormatedCurrentTime();

    knex("relationships")
      .select("*")
      .where({ follower_id: myId })
      .whereNot({ followed_id: 0 })
      .then(function (results) {
        following = results.length;
      })

    knex("relationships")
      .select("*")
      .where({ followed_id: myId })
      .then(function (results) {
        followes = results.length;
      })

    knex("microposts")
      .select("*")
      .where({ user_id: myId })
      .then(function (results) {
        const postsCount = results.length
        res.render('index', {
          title: 'MicroPost App',
          username: userName,
          posts: results,
          created_time: datetime,
          isAuth: isAuth,
          count: postsCount,
          myId: myId,
          userId: myId,
          followingCount: following,
          followersCount: followes
        });
      })
      .catch(function (err) {
        console.error(err);
        res.render('index', {
          title: 'MicroPost App',
          isAuth: isAuth,
        });
      });
  } else {
    res.render('index', {
      title: 'MicroPost App',
      isAuth: isAuth,
    });
  }

  router.post('/', function (req, res, next) {
    const isAuth = req.isAuthenticated();
    const datetime = getFormatedCurrentTime();
    const post = req.body.content;
    const userId = req.user.id

    knex("microposts")
      .insert({
        content: post,
        user_id: userId,
        created_at: datetime
      })
      .then(function () {
        res.redirect('/')
      })
      .catch(function (err) {
        console.error(err);
        res.render('index', {
          title: 'MicroPost App',
          isAuth: isAuth,
          errorMessage: [err.sqlMessage],
        });
      });
  });
});

router.post('/users/:id', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const userId = req.params.id;
  let userName;
  let following;
  let followes;
  const myUserId = req.user.id;
  const datetime = getFormatedCurrentTime();

  knex("users")
    .select("*")
    .where({ id: userId })
    .then(function (results) {
      userName = results[0].name;
    })

  knex("relationships")
    .select("*")
    .where({ follower_id: userId })
    .whereNot({ followed_id: 0 })
    .then(function (results) {
      following = results.length;
  })

  knex("relationships")
    .select("*")
    .where({ followed_id: userId })
    .then(function (results) {
      followes = results.length;
    })

  knex("microposts")
    .select("*")
    .where({ user_id: userId })
    .then(function (results) {
      const postsCount = results.length

      res.render('index', {
        title: 'MicroPost App',
        username: userName,
        posts: results,
        created_time: datetime,
        isAuth: isAuth,
        count: postsCount,
        userId: userId,
        myId: myUserId,
        followingCount: following,
        followersCount: followes
      });
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'MicroPost App',
        isAuth: isAuth,
      });
    });
});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/delete', require('./delete'));
router.use('/setting', require('./setting'));
router.use('/users', require('./users'));
router.use('/logout', require('./logout'));

module.exports = router;