process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require('../app')
const db = require('../db')

beforeEach(async function() {
    await db.query(`INSERT into companies (code, name, description)
                    VALUES ($1, $2, $3)
                 `, ['testa', 'testnamea', 'testdescriptiona'])

    await db.query(`INSERT into invoices (comp_code, amt)
                    VALUES ($1, $2)
                 `, ['testa', 10000])
})

afterEach(async function() {
    await db.query('DELETE from invoices')
    await db.query('DELETE from companies')
})

afterAll(async function() {
    await db.end();
})

describe("GET /invoices", function() {
    test("Gets a list of invoices", async function() {
        const resp = await request(app).get('/invoices');

        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual( [{"add_date":expect.any(String), 
                                    "amt": 10000, 
                                    "comp_code": "testa", 
                                    "id": expect.any(Number), 
                                    "paid": expect.any(Boolean), 
                                    "paid_date": null
                                }])
    })
})

describe("POST /invoices", function() {
    test("Add an invoice and returns invoice added", async function() {
        const resp = await request(app)
        .post(`/invoices`)
        .send({
            "comp_code": "testa",
            "amt": 10000
        });

        expect(resp.statusCode).toBe(201)
        expect(resp.body).toEqual({
                "invoice": [{
                    "add_date": expect.any(String), 
                    "amt": 10000, 
                    "comp_code": "testa", 
                    "id": expect.any(Number), 
                    "paid": false, 
                    "paid_date": null
            }]
        })
    })
})
