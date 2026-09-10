export const getConfig = () => ({
  baseURL: process.env.BASE_URL || 'https://restful-booker.herokuapp.com',
  auth: {
    username: process.env.AUTH_USERNAME || 'admin',
    password: process.env.AUTH_PASSWORD || 'password123',
  },
});
