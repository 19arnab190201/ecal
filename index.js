const app = require("./app");

const server = app.listen(4000, () => {
  console.log(`Server is running on port ${4000}`);
});
