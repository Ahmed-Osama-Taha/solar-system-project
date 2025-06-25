const mongoose = require("mongoose");
const server = require("./app");
const chai = require("chai");
const chaiHttp = require("chai-http");

// Assertion setup
chai.should();
chai.use(chaiHttp);

// Reuse the planet model from the app
const planetModel = mongoose.model('planets');

// 🌱 Seed planet data before tests run
before((done) => {
  const planets = [
    { id: 1, name: "Mercury", description: "", image: "", velocity: "", distance: "" },
    { id: 2, name: "Venus", description: "", image: "", velocity: "", distance: "" },
    { id: 3, name: "Earth", description: "", image: "", velocity: "", distance: "" },
    { id: 4, name: "Mars", description: "", image: "", velocity: "", distance: "" },
    { id: 5, name: "Jupiter", description: "", image: "", velocity: "", distance: "" },
    { id: 6, name: "Saturn", description: "", image: "", velocity: "", distance: "" },
    { id: 7, name: "Uranus", description: "", image: "", velocity: "", distance: "" },
    { id: 8, name: "Neptune", description: "", image: "", velocity: "", distance: "" }
  ];

  // Clean old and insert fresh
  planetModel.deleteMany({}, () => {
    planetModel.insertMany(planets, (err) => {
      if (err) return done(err);
      done();
    });
  });
});

describe('Planets API Suite', () => {
  const testCases = [
    { id: 1, name: "Mercury" },
    { id: 2, name: "Venus" },
    { id: 3, name: "Earth" },
    { id: 4, name: "Mars" },
    { id: 5, name: "Jupiter" },
    { id: 6, name: "Saturn" },
    { id: 7, name: "Uranus" },
    { id: 8, name: "Neptune" },
  ];

  testCases.forEach(({ id, name }) => {
    it(`should fetch planet with id ${id} named ${name}`, (done) => {
      chai.request(server)
        .post('/planet')
        .send({ id })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('id').eql(id);
          res.body.should.have.property('name').eql(name);
          done();
        });
    });
  });

  // 🔴 Additional test: invalid planet ID to trigger error block
  it('should return empty object or error for unknown planet ID', (done) => {
    chai.request(server)
      .post('/planet')
      .send({ id: 999 })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.empty;
        done();
      });
  });
});

describe('Testing Other Endpoints', () => {
  it('should fetch OS details', (done) => {
    chai.request(server)
      .get('/os')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('os');
        done();
      });
  });

  it('should check liveness endpoint', (done) => {
    chai.request(server)
      .get('/live')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('status').eql('live');
        done();
      });
  });

  it('should check readiness endpoint', (done) => {
    chai.request(server)
      .get('/ready')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('status').eql('ready');
        done();
      });
  });

  // ✅ Test for homepage to hit index.html route
  it('should return index.html content from /', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.include('<!DOCTYPE html'); // Adjust based on your index.html content
        done();
      });
  });
});

// 💥 Global error handlers for visibility
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
