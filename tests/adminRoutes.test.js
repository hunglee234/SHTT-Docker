const request = require("supertest");
const app = require("../index");
describe("Admin Routes", () => {
  let adminToken;

  beforeAll(async () => {
    // Giả sử bạn có một route đăng nhập để lấy token
    const loginResponse = await request(app)
      .post("/login") // Đảm bảo rằng endpoint đăng nhập đúng
      .send({
        username: "admin", // Tên tài khoản admin
        password: "adminPassword", // Mật khẩu của tài khoản admin
      });
    // Kết nối MongoDB cho test
    await mongoose.connect(
      "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    // Lấy token từ phản hồi đăng nhập
    adminToken = loginResponse.body.token;

    // Kiểm tra xem token có hợp lệ không
    expect(loginResponse.status).toBe(200);
    expect(adminToken).toBeDefined();

    // In ra thông báo "xin chào admin" khi token hợp lệ
    console.log("xin chào admin");
  });

  afterAll(async () => {
    // Đóng kết nối MongoDB sau khi test xong
    await mongoose.connection.close();
  });
});
