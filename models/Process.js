const mongoose = require("mongoose");

const ProcessSchema = new mongoose.Schema(
  {
    processContent: {
      type: String,
      required: false,
    },
    completionDate: {
      type: Date,
      required: false,
    },
    pdfUrl: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: [
        "Nộp đơn",
        "Yêu cầu bổ sung",
        "Bổ sung ủy quyền gốc",
        "Trả lời bổ sung",
        "Bị phản đối",
        "Trả lời phản đối",
        "Chấp nhận hợp lệ",
        "Thông báo nội dung",
        "Trả lời thông báo nội dung",
        "Thông báo cấp bằng",
        "Nộp phí cấp bằng",
        "Cấp bằng",
        "Từ chối hợp lệ",
        "Từ chối cấp bằng",
        "Chuyển giao đơn",
        "Rút đơn",
        "Đề nghị hủy bỏ/chấm dứt hiệu lực",
        "Trả lời đề nghị hủy bỏ/chấm dứt hiệu lực",
        "Hủy bỏ/chấm dứt hiệu lực",
      ],
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Process", ProcessSchema);
