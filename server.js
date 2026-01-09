const app = require("./app");

const port = process.env.PORT || 3000;

// Routing

const global = require("./routing/globalRouting");

const admin = require("./routing/adminRouting");

app.use("/", admin);

app.use("/", global);

app.listen(port, () => {
  console.log(`app is running on port: ${port}`);
});
