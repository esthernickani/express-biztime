const express = require('express');
const db = require('../db')
const ExpressError = require('../expressError')
const router = new express.Router();

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query(
            `SELECT * FROM invoices`);
        return res.json(results.rows)
    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.get("/:id", async function(req, res, next) {
    try {
        const results = await db.query(
            `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, i.comp_code, c.name, c.description
            FROM invoices as i INNER JOIN COMPANIES as c
            ON i.comp_code = c.code WHERE id = $1 `, [req.params.id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`No invoice ${req.params.id}`, 404)
        }

        const invoice =  results.rows[0]
        const invoiceAndCompanyData = {
            'invoice':{ 'id': invoice.id,
                        'amt': invoice.amt, 
                        'paid': invoice.paid,
                        'add_date': invoice.add_date,
                        "paid_date": invoice.paid_date},
            'company': {
                'code': invoice.comp_code,
                'name': invoice.name,
                'description': invoice.description
            }
            
        }

        return res.json(invoiceAndCompanyData)

    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.post("/", async function(req, res, next) {
    try {
        console.log(req)
        const { comp_code, amt } = req.body
        const results = await db.query(
            `INSERT into invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
             [comp_code, amt]);
             return res.status(201).json({"invoice": results.rows})
    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.put("/:id", async function(req, res, next) {
    try {
        const { amt, paid } = req.body
        let paid_date;
        /*paid? paid_date === new Date().toDateString() : null*/
        const results = await db.query(
            `UPDATE invoices SET amt=$1
             WHERE id = $2
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, req.params.id]
      );

        const curr_paid_date = results.rows[0].paid_date

        if (results.rows.length === 0) {
            throw new ExpressError(`No invoice found with id of ${req.params.id}`, 404)
        }

        if (!curr_paid_date && paid) {
            paid_date = new Date().toDateString()
        } else if (!paid) {
            paid_date =  null
        } else {
            paid_date = curr_paid_date
        }

        const final_results = await db.query(
            `UPDATE invoices SET amt=$1, paid=$2, paid_date=$3
             WHERE id = $4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paid_date, req.params.id]
      );
        results.rows[0].paid_date = paid_date
        return res.json({"invoice":final_results.rows})

    } catch (err) {
        console.log(err)
        return next(err)
    }
})

router.delete("/:id", async function(req, res, next) {
    try {
        const results = await db.query(
            `DELETE FROM invoices 
            WHERE id = $1`,
            [req.params.id]
      );

        return res.json({status: 'deleted'})

    } catch (err) {
        console.log(err)
        return next(err)
    }
})




module.exports = router;