const Process = require("../../models/Process");
const Profile = require("../../models/Service/Profile");
const Noti = require("../../models/Noti");
const Account = require("../../models/Account/Account");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

exports.createProcess = async (req, res) => {
  const { profileId } = req.params;
  const { name, status, completionDate } = req.body;
  const pdfFile = req.file || {};
  const pdfId = pdfFile.location;
  try {
    // Tạo tiến trình mới
    const newProcess = await Process.create({
      processContent: name,
      completionDate: completionDate,
      pdfUrl: pdfId,
      status: status,
    });

    // Cập nhật Profile để thêm tiến trình vào danh sách
    await Profile.findByIdAndUpdate(
      profileId,
      {
        $push: { processes: newProcess._id },
      },
      { new: true }
    );

    const newNoti = await Noti.create({
      profileId,
      message: `Tiến trình hồ sơ ${profileId} đã được cập nhật trạng thái thành: ${status}. `,
      status: "New",
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "Tiến trình được tạo thành công",
      data: { process: newProcess, notification: newNoti },
    });
  } catch (error) {
    console.error("Lỗi khi tạo tiến trình:", error.message);
    return res.status(500).json({ message: "Lỗi khi tạo tiến trình" });
  }
};

exports.getProcesses = async (req, res) => {
  const { profileId } = req.params;

  try {
    const profile = await Profile.findById(profileId).populate("processes");

    if (!profile) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ" });
    }

    return res.status(200).json({
      message: "Danh sách tiến trình",
      data: profile.processes,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tiến trình:", error.message);
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách tiến trình" });
  }
};

exports.updateProcess = async (req, res) => {
  const { processId } = req.params;
  const { name, status, completionDate } = req.body;
  const pdfFile = req.file || {};
  const pdfId = pdfFile.location;
  const userId = req.user.id;
  try {
    const parsedcompletionDate = dayjs(completionDate, "DD/MM/YYYY").isValid()
      ? dayjs(completionDate, "DD/MM/YYYY").toDate()
      : null;
    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "SuperAdmin") {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền sửa tiến trình" });
    }
    // Tìm tiến trình cần cập nhật
    const process = await Process.findById(processId);
    if (!process) {
      return res.status(404).json({ message: "Không tìm thấy tiến trình" });
    }

    // Cập nhật tiến trình
    const updatedProcess = await Process.findByIdAndUpdate(
      processId,
      {
        processContent: name,
        completionDate: parsedcompletionDate,
        pdfUrl: pdfId,
        status: status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProcess) {
      return res.status(404).json({ message: "Không tìm thấy tiến trình" });
    }

    return res.status(200).json({
      message: "Tiến trình được cập nhật thành công",
      data: updatedProcess,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật tiến trình:", error.message);
    return res.status(500).json({ message: "Lỗi khi cập nhật tiến trình" });
  }
};

exports.deleteProcess = async (req, res) => {
  const { processId, profileId } = req.params;
  const userId = req.user.id;
  try {
    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "SuperAdmin") {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền xóa tiến trình" });
    }
    // Xóa tiến trình
    await Process.findByIdAndDelete(processId);

    // Cập nhật hồ sơ để loại bỏ tiến trình khỏi danh sách
    await Profile.findByIdAndUpdate(profileId, {
      $pull: { processes: processId },
    });

    return res.status(200).json({
      message: "Tiến trình đã được xóa thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa tiến trình:", error.message);
    return res.status(500).json({ message: "Lỗi khi xóa tiến trình" });
  }
};
