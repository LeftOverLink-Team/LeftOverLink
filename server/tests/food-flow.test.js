const assert = require('assert');
const axios = require('axios');

(async () => {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
  const email = `provider-${Date.now()}@example.com`;
  const password = 'TempPass123!';

  const registerRes = await axios.post(`${baseUrl}/api/auth/register`, {
    name: 'Regression Provider',
    email,
    password,
    role: 'provider',
  });

  const token = registerRes.data.token;
  const postRes = await axios.post(`${baseUrl}/api/food`, {
    title: 'Regression post',
    description: 'A regression test post',
    quantity: 5,
    expiry: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    imageUrl: '',
    location: {
      address: 'Regression street, Test city',
    },
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.strictEqual(postRes.status, 201, 'expected food creation to return 201');
  assert.strictEqual(postRes.data.title, 'Regression post');
  assert.strictEqual(postRes.data.location.address, 'Regression street, Test city');

  const listRes = await axios.get(`${baseUrl}/api/food`);
  assert.ok(listRes.data.some((food) => food.title === 'Regression post'));

  console.log('food-flow regression passed');
})().catch((err) => {
  console.error(err.response?.status, err.response?.data);
  process.exit(1);
});
