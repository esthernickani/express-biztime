const express = require('express');
const db = require('../db')
const ExpressError = require('../expressError')
const router = new express.Router();

const slugify = require('slugify')


router.get("/", async function(req, res, next) {
    try {
        const results = await db.query(
            `SELECT * FROM companies`);
        return res.json(results.rows)
    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.get("/:code", async function(req, res, next) {
    try {
        const comp_results = await db.query(
            `SELECT * FROM companies WHERE code = $1`, [req.params.code]);

        const inv_results = await db.query(
            `SELECT * FROM invoices WHERE comp_code = $1`, [req.params.code]);

        const industry_results = await db.query(
            `SELECT i.industry FROM industry_company as ic
            LEFT JOIN industries as i
            ON i.code = ic.industry_code
             WHERE company_code = $1`, [req.params.code]);

        const indResults = industry_results.rows.map(industry_result => {
            return Object.values(industry_result)
        })

       


        if (comp_results.rows.length === 0) {
            throw new ExpressError(`No such company ${req.params.code}`, 404)
        }

        const invResults = inv_results.rows.map(inv_result => {
            return Object.values(inv_result)
        })

        const compInv = {
            'company': comp_results.rows,
            'invoices': invResults,
            'industries': indResults
        }
        return res.json(compInv)
    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.post("/", async function(req, res, next) {
    try {
        const { name, description } = req.body
        const code = slugify(name, {
            replacement: '-',
            lower: true,
            trim: true
          })
        const results = await db.query(
            `INSERT into companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`, 
             [code, name, description]);
        return res.json(results.rows)
    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.put("/:code", async function(req, res, next) {
    try {
        const { name, description } = req.body
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2
             WHERE code = $3
             RETURNING code, name, description`,
            [name, description, req.params.code]
      );

        if (results.rows.length === 0) {
            throw new ExpressError(`No such company ${req.params.code}`, 404)
        }

        return res.json({"company": results.rows})

    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.delete("/:code", async function(req, res, next) {
    try {
        const results = await db.query(
            `DELETE FROM invoices 
            WHERE code = $1`,
            [req.params.code]
      );

        return res.json({status: 'deleted'})

    } catch (err) {
        console.log(err)
        return next(err)
    }
})


module.exports = router;