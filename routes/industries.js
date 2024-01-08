const express = require('express');
const db = require('../db')
const ExpressError = require('../expressError')
const router = new express.Router();

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query(
            `SELECT * FROM industries as i
            LEFT JOIN industry_company as ic
            ON i.code = ic.industry_code`);

        const company_codes = {}

        results.rows.forEach(result => {
            return company_codes.hasOwnProperty(result.industry_code)? company_codes[result.industry_code].push(result.company_code): company_codes[result.industry_code] = [result.company_code]
        })

        console.log(company_codes)
        const industry_company_data = results.rows.map(results => {
            return {
                "code": results.code,
                "industry": results.industry,
                "companies": company_codes[results.code]
            }
        })

        return res.json(industry_company_data)
    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.post("/", async function(req, res, next) {
    try {
        const { code, name } = req.body
        const results = await db.query(
            `INSERT into industries (code, industry)
             VALUES ($1, $2)
             RETURNING code, industry`, 
             [code, name]);
             return res.status(201).json({"industry": results.rows})
    } catch (err) {
        console.log(err)
        return next(err)
    }
})




module.exports = router;