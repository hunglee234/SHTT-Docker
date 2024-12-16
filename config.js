const ENV = {
  development: {
    DB_URI:
      "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users?retryWrites=true&w=majority&appName=Cluster0",
  },
  test: {
    DB_URI:
      "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/userstest?retryWrites=true&w=majority&appName=Cluster0",
  },
  production: {
    DB_URI: "mongodb://localhost:27017/proddb",
  },
};

const currentEnv = "test"; // Thay "development" bằng "test" khi chạy test.

module.exports = {
  ...ENV[currentEnv],
  currentEnv,
};
