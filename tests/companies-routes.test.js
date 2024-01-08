process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require('../app')
const db = require('../db')


beforeEach(async function() {
    await db.query(`INSERT into companies (code, name, description)
                    VALUES ($1, $2, $3)
                 `, ['testa', 'testnamea', 'testdescriptiona'])
})

afterEach(async function() {
    await db.query('DELETE from companies')
})

afterAll(async function() {
    await db.end();
})

describe("GET /companies", function() {
    test("Gets a list of companies", async function() {
        const resp = await request(app).get('/companies');

        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual([
            {
                "code": "testa",
                "name": "testnamea",
                "description": "testdescriptiona"
            }
        ])
    })
})

describe("POST /companies", function() {
    test("Gets a list of companies", async function() {
        const resp = await request(app)
        .post(`/companies`)
        .send({
            "code": "testb",
            "name": "testnameb",
            "description": "testdescriptionb"
        });

        expect(resp.statusCode).toBe(200)
        expect(resp.body).toEqual([{
                "code": "testb",
                "name": "testnameb",
                "description": "testdescriptionb"
            }
        ])
    })
})

describe("PUT /companies/:code", function() {
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
  });