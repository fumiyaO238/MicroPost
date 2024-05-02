const express = require('express');
const router = express.Router();
const knex = require("../db/knex");
const getFormatedCurrentTime = require('../util/datetime');
const bcrypt = require("bcrypt");

router.get('/', function (req, res, next) {
  // const userId = req.session.userid;
  // const isAuth = Boolean(userId);
  const isAuth = req.isAuthenticated();

  res.render('signup', {
    title: 'Sign up',
    isAuth: isAuth,
  });
});

router.post('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmation = req.body.confirmation;
  const datetime = getFormatedCurrentTime();

  knex("users")
    .where({ email: email })
    .select("*")
    .then(async function (result) {
      if (result.length !== 0) {
        res.render("signup", {
          title: "Sign up",
          errorMessage: ["このメールアドレスは既に使われています"],
          isAuth: isAuth,
        })
      } else if (password === confirmation) {
        const hashedPassword = await bcrypt.hash(password, 10);
        knex("users")
          .insert({ name: username, email: email, password: hashedPassword, created_at: datetime })
          .then(function () {
            res.redirect("/signin");
          })
          .catch(function (err) {
            console.error(err);
            res.render("signup", {
              title: "Sign up",
              errorMessage: [err.sqlMessage],
              isAuth: isAuth,
            });
          });
      } else {
        res.render("signup", {
          title: "Sign up",
          errorMessage: ["パスワードが一致しません"],
          isAuth: isAuth,
        });
      }
    })
    .catch(function (err) {
      console.error(err);
      res.render("signup", {
        title: "Sign up",
        errorMessage: [err.sqlMessage],
        isAuth: isAuth,
      });
    });
});

module.exports = router;