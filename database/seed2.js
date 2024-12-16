const mongoose = require("mongoose");
const Service = require("../models/Service/Service");
const SubService = require("../models/Service/SubService");

mongoose
  .connect(
    "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/servicetest?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
    // Gọi seedDatabase sau khi kết nối thành công
    seedDatabase();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const seedDatabase = async () => {
  try {
    // Xóa dữ liệu cũ trong Service và SubService
    // await Service.deleteMany({});
    // await SubService.deleteMany({});

    // Tạo dữ liệu SubService mẫu
    const subServices = [
      {
        subServiceName: "Đăng ký nhãn hiệu",
        details: {
          applicantInfo: {
            name: "Nguyễn Văn A",
            address: "123 Đường ABC, Hà Nội",
            phone: "0123456789",
            email: "nguyenvana@example.com",
          },
          serviceInfo: {
            inventionName: "Nhãn hiệu A",
            technicalField: "Thời trang",
            summary: "Đăng ký bảo hộ nhãn hiệu thời trang A",
          },
          attachments: {
            authorizationFile: "/uploads/authorization_a.pdf",
            logoFile: "/uploads/logo_a.png",
          },
        },
      },
      {
        subServiceName: "Đăng ký sáng chế",
        details: {
          applicantInfo: {
            name: "Trần Văn B",
            address: "456 Đường XYZ, TP HCM",
            phone: "0987654321",
            email: "tranvanb@example.com",
          },
          serviceInfo: {
            inventionName: "Máy hút bụi thông minh",
            technicalField: "Công nghệ gia dụng",
            summary: "Đăng ký sáng chế máy hút bụi tự động thông minh",
          },
          attachments: {
            authorizationFile: "/uploads/authorization_b.pdf",
            logoFile: "/uploads/logo_b.png",
          },
        },
      },
    ];

    // Lưu SubServices vào database
    const savedSubServices = await SubService.insertMany(subServices);

    // Tạo dữ liệu Service mẫu
    const services = [
      {
        serviceName: "Kiểu dáng công nghiệp",
        shortServiceName: "KDCN",
        description: "Dịch vụ đăng ký và bảo hộ kiểu dáng công nghiệp.",
        price: 5000000,
        status: "Cấp bằng",
        applicationNumber: "KDCN20240002",
        submissionDate: new Date(),
        category: "Kiểu dáng công nghiệp",
        patentNumber: null,
        subServices: [savedSubServices[0]._id], // Tham chiếu SubService
      },
      {
        serviceName: "Bản quyền",
        shortServiceName: "BQ",
        description: "Dịch vụ đăng ký và bảo hộ bản quyền.",
        price: 10000000,
        status: "Hợp lệ",
        applicationNumber: "BQ20240002",
        submissionDate: new Date(),
        category: "Bản quyền",
        patentNumber: "SC123456",
        subServices: [savedSubServices[1]._id], // Tham chiếu SubService
      },
    ];

    // Lưu Services vào database
    await Service.insertMany(services);

    console.log("Database đã được seed thành công!");
  } catch (error) {
    console.error("Lỗi khi seed database:", error);
  } finally {
    // Đảm bảo kết nối được đóng sau khi seed dữ liệu
    mongoose.connection.close();
  }
};
