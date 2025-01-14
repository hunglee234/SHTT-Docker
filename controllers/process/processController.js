const Process = require("../../models/Process");
const Profile = require("../../models/Service/Profile");

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
    await Profile.findByIdAndUpdate(profileId, {
      $push: { processes: newProcess._id },
    });

    return res.status(201).json({
      message: "Tiến trình được tạo thành công",
      data: newProcess,
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
  const { processContent, completionDate, documents } = req.body;

  try {
    const updatedProcess = await Process.findByIdAndUpdate(
      processId,
      { processContent, completionDate, documents },
      { new: true }
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

  try {
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
