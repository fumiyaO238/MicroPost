const express = require('express');
const router = express.Router();
const knex = require("../db/knex");
const getFormatedCurrentTime = require('../util/datetime');

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const userId = req.user.id
  let relationshipsResult;

  knex("relationships")
    .select("*")
    .where({ follower_id: userId })
    .then(async function (results) {
      relationshipsResult = results;
    });

  knex("users")
    .select("*")
    .then(async function (results) {
      const len = results.length;
      res.render('users', {
        title: 'All Users',
        allUsers: results,
        isAuth: isAuth,
        checkUserId: userId,
        relationshipsResult: relationshipsResult,
        len: len,
      });
    });
});

router.post('/follow/:id', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const datetime = getFormatedCurrentTime();
  const myUserId = req.user.id;
  const followedId = req.params.id;

  knex("relationships")
    .select("*")
    .where({ follower_id: myUserId, followed_id: followedId })
    .then(async function (results) {
      if (results.length !== 0) {
        knex("relationships")
          .update({
            followed_id: followedId,     //フォローしたユーザーのId
            updated_at: datetime
          })
          .where({ follower_id: myUserId, followed_id: followedId })
          .then(function () {
            res.redirect('/users')
          })
          .catch(function (err) {
            console.error(err);
            res.render('users', {
              title: 'All Users',
              isAuth: isAuth,
              errorMessage: [err.sqlMessage],
            })
          })
      } else {
        knex("relationships")
          .select("*")
          .where({ follower_id: myUserId, followed_id: 0 })
          .then(async function (results) {
            if (results.length !== 0) {
              knex("relationships")
                .update({
                  followed_id: followedId,     //フォローしたユーザーのId
                  updated_at: datetime
                })
                .where({ follower_id: myUserId, followed_id: 0 })
                .then(function () {
                  res.redirect('/users')
                })
                .catch(function (err) {
                  console.error(err);
                  res.render('users', {
                    title: 'All Users',
                    isAuth: isAuth,
                    errorMessage: [err.sqlMessage],
                  });
                });
            } else {
              knex("relationships")
                .insert({
                  follower_id: myUserId, //ログインしているユーザーのId
                  followed_id: followedId,   //フォローしたユーザーのId
                  created_at: datetime
                })
                .then(function () {
                  res.redirect('/users')
                })
                .catch(function (err) {
                  console.error(err);
                  res.render('users', {
                    title: 'All Users',
                    isAuth: isAuth,
                    errorMessage: [err.sqlMessage],
                  });
                });
            }
          });
      }
    })
})

router.post('/unfollow/:id', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const datetime = getFormatedCurrentTime();
  const myUserId = req.user.id;
  const followedId = req.params.id;

  knex("relationships")
    .update({
      followed_id: 0,     //フォローしたユーザーのId
      updated_at: datetime
    })
    .where({ follower_id: myUserId, followed_id: followedId })
    .then(function () {
      res.redirect('/users')
    })
    .catch(function (err) {
      console.error(err);
      res.render('users', {
        title: 'All Users',
        isAuth: isAuth,
        errorMessage: [err.sqlMessage],
      });
    });
});

// フォローしているユーザーをすべて取得
router.get('/:id/following', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const userId = req.params.id

  knex("relationships")
    .join("users", "relationships.followed_id", "users.id")
    .select("*")
    .where({ follower_id: userId })
    .then(async function (results) {
      if(results.length !== 0){
        res.render('follow', {
          title: 'Following',
          followes: results,
          isAuth: isAuth,
        });
      } else {
        console.log("")
        res.redirect('/users')
      }
    });
});

// フォロワーをすべて取得
router.get('/:id/followers', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const userId = req.params.id

  knex("relationships")
    .join("users", "relationships.follower_id", "users.id")
    .select("*")
    .where({ followed_id: userId })
    .then(async function (results) {
      if(results.length !== 0){
        res.render('follow', {
          title: 'Followers',
          followes: results,
          isAuth: isAuth,
        });
      } else {
        console.log("")
        res.redirect('/users')
      }
    });
});

module.exports = router;