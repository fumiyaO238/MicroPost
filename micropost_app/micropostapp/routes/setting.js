const express = require('express');
const router = express.Router();
const knex = require("../db/knex");
const getFormatedCurrentTime = require('../util/datetime');
const bcrypt = require("bcrypt");

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();

  res.render('setting', {
    title: 'Update your profile',
    isAuth: isAuth,
  });
});

router.post('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmation = req.body.confirmation;
  const userId = req.user.id;
  const datetime = getFormatedCurrentTime();

  knex("users")
    .select("*")
    .where({ id: userId })
    .then(async function (result) {
      if (result.length === 0) {
        res.render("setting", {
          title: 'Update your profile',
          errorMessage: ["ユーザー情報の変更に失敗しました"],
          isAuth: isAuth,
        })
      } else if (password === confirmation) {
        const hashedPassword = await bcrypt.hash(password, 10);
        knex("users")
          .update({ name: username, email: email, password: hashedPassword, updated_at: datetime })
          .where({ id: userId })
          .then(function () {
            res.redirect("/");
          })
          .catch(function (err) {
            console.error(err);
            res.render("setting", {
              title: 'Update your profile',
              errorMessage: [err.sqlMessage],
              isAuth: isAuth,
            });
          });
      } else {
        res.render("setting", {
          title: "Update your profile",
          errorMessage: ["パスワードが一致しません"],
          isAuth: isAuth,
        });
      }
    })
    .catch(function (err) {
      console.error(err);
      res.render("setting", {
        title: "Update your profile",
        errorMessage: [err.sqlMessage],
        isAuth: isAuth,
      });
    });
});

module.exports = router;