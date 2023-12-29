const express = require('express');
const db = require('../db')
const router = new express.Router();

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query(
            `SELECT * FROM companies`);
        return res.json(results.rows)
    } catch (err) {
        return next(err)
    }
})

module.exports = router;