/** BizTime express application. */


const express = require("express");
const bodyParser = require('body-parser')

const app = express();
const ExpressError = require("./expressError")

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended:true,
  }),
);

const companyRoutes = require("./routes/companies")
const invoiceRoutes = require("./routes/invoices")
const industryRoutes = require("./routes/industries")
const industryCompanyRoutes = require("./routes/industry_company")

app.use('/companies', companyRoutes)
app.use('/invoices', invoiceRoutes)
app.use('/industries', industryRoutes)
app.use('/industrycompany', industryCompanyRoutes)

app.use(express.json());


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});



module.exports = app;
