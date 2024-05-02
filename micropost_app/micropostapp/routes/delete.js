const express = require('express');
const router = express.Router();
const knex = require("../db/knex");

router.post('/microposts/:id', function (req, res, next) {
  console.log("削除成功")
  const buttonNumber = req.params.id;
  knex("microposts")
    .del()
    .where({ id: buttonNumber })
    .then(function () {
      res.redirect("/")
    })
    .catch(function (err) {
      console.error(err);
      res.render("/", {
        title: "MicroPost App",
      });
    });
});

module.exports = router;