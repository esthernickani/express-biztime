process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require('../app')
const db = require('../db')

beforeAll(async function() {
    await db.query(`INSERT into companies (code, name, description)
                    VALUES ($1, $2, $3)
                 `, ['testa', 'testnamea', 'testdescriptiona'])
})


beforeEach(async function() {
    await db.query(`INSERT into invoices (comp_code, amt)
                    VALUES ($1, $2)
                 `, ['testa', 10000])
})

afterEach(async function() {
    await db.query('DELETE from invoices')
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
        expect(resp.body).toEqual([{
                "code": "testb",
                "name": "testnameb",
                "description": "testdescriptionb"
            }
        ])
    })
})

/*describe("PUT /companies/:code", function() {
    test("Updates a single company", async function() {
      const resp = await request(app)
        .put(`/companies/testa`)
        .send({
          name: "changename2",
          description: "change description"
        });

      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({
        "company": [
            {
                "code": "testa",
                "name": "changename2",
                "description": "change description"
            }
        ]
    });
    });
  
    test("Responds with 404 if company code invalid", async function() {
      const resp = await request(app).put(`/companies/wrongname`);
      expect(resp.statusCode).toBe(404);
    });
  });*/