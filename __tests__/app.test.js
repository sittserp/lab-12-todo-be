require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns Jon\'s todo list', async () => {

      const expectation = [
        {
          id: 4,
          todo: 'make the bed',
          completed: false,
          owner_id: 2
        },
        {
          id: 5,
          todo: 'do laundry',
          completed: false,
          owner_id: 2
        },
        {
          id: 6,
          todo: 'wash the car',
          completed: false,
          owner_id: 2
        }
      ];

      const expectation6 = [
        {
          id: 4,
          todo: 'make the bed',
          completed: false,
          owner_id: 2
        },
        {
          id: 5,
          todo: 'do laundry',
          completed: false,
          owner_id: 2
        },
        {
          id: 6,
          todo: 'wash the car',
          completed: true,
          owner_id: 2
        }
      ];

      await fakeRequest(app)
        .post('/api/todo')
        .send(expectation[0])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todo')
        .send(expectation[1])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todo')
        .send(expectation[2])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/todo')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .put('/api/todo/6')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data6 = await fakeRequest(app)
        .get('/api/todo')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(data6.body).toEqual(expectation6);
    });
  });
});
