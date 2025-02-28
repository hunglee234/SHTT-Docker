const Contract = require("../../models/Contract");
const Account = require("../../models/Account/Account");
const InfoAccount = require("../../models/Account/InfoStaff");

// Thêm hợp đồng
exports.createContract = async (req, res) => {
  try {
    const userId = req.user.id;
    const { customerId } = req.params;
    const nameContract = req.body.name || [];
    const pdfFile = req.file || {};
    const pdfId = pdfFile.location;

    const Contracts = await Contract.create({
      name: nameContract,
      pdfUrl: pdfId,
      createdBy: userId,
      customerId,
    });
    res
      .status(201)
      .json({ message: "Hợp đồng được tạo thành công!", data: Contracts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo hợp đồng!", error: error.message });
  }
};

// Sửa hợp đồng
exports.updateContract = async (req, res) => {
  const { contractId } = req.params;
  const nameContract = req.body.name;
  const pdfFile = req.file || {};
  const pdfId = pdfFile.location || null;

  try {
    const currentContract = await Contract.findById(contractId);
    if (!currentContract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng!" });
    }

    const updatedData = {
      name: nameContract || currentContract.name,
      pdfUrl: pdfId || currentContract.pdfUrl,
    };

    const Contracts = await Contract.findByIdAndUpdate(
      contractId,
      updatedData,
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Thủ tục được cập nhật thành công!", data: Contracts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật thủ tục!", error: error.message });
  }
};

// Xóa hợp đồng
exports.deleteContract = async (req, res) => {
  const { contractId } = req.params;
  const userId = req.user.id;
  try {
    const account = await Account.findById(userId).populate("role");
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "SuperAdmin") {
      return res.status(403).json({ error: "Bạn không có quyền xóa hợp đồng" });
    }
    const Contracts = await Contract.findByIdAndDelete(contractId);
    if (!Contracts) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng!" });
    }
    res.status(200).json({ message: "Hợp đồng đã được xóa thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa hợp đồng!", error: error.message });
  }
};

// Xem danh sách hợp đồng
exports.getAllContracts = async (req, res) => {
  try {
    const { search_value, page = 1, limit = 10 } = req.query;
    let ContractQuery = {};

    if (
      search_value &&
      search_value.trim() !== "" &&
      search_value.trim() !== '""'
    ) {
      const cleanSearchValue = search_value.replace(/"/g, "").trim();
      ContractQuery.name = { $regex: cleanSearchValue, $options: "i" };
    }
    const skip = (page - 1) * limit;
    const Contracts = await Contract.find(ContractQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .populate([
        {
          path: "createdBy customerId",
          select: "fullName",
        },
      ]);

    const totalContracts = await Contract.countDocuments(ContractQuery);
    const totalPages = Math.ceil(totalContracts / limit);

    res.status(200).json({
      message: "Danh sách hợp đồng:",
      data: {
        currentPage: page,
        totalPages: totalPages,
        totalContracts: totalContracts,
        contracts: Contracts,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách hợp đồng!",
      error: error.message,
    });
  }
};

exports.getAllContractsByUserId = async (req, res) => {
  const { search_value, page = 1, limit = 10 } = req.query;
  const { id: userId } = req.user;
  const userRole = req.user.role;

  try {
    let contractQuery = {};

    if (userRole === "Manager") {
      // Nếu là manager, lấy hợp đồng của chính họ
      contractQuery = { customerId: userId };
    } else if (userRole === "Staff" || userRole === "Collaborator") {
      // Nếu là staff, tìm manager của họ trong database
      const managerInfo = await InfoAccount.findOne({ account: userId }).select(
        "createdByManager"
      );
      if (!managerInfo) {
        return res.status(404).json({
          message: "Không tìm thấy người quản lý của bạn!",
        });
      }

      // Lấy hợp đồng của manager đó
      contractQuery = { customerId: managerInfo.createdByManager };
    } else {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập hợp đồng!",
      });
    }

    if (search_value && search_value.trim() !== "") {
      const cleanSearchValue = search_value.replace(/"/g, "").trim();
      contractQuery.name = { $regex: cleanSearchValue, $options: "i" };
    }

    const skip = (page - 1) * limit;

    // Tìm các hợp đồng theo userId
    const contracts = await Contract.find(contractQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate([
        {
          path: "createdBy customerId",
          select: "fullName",
        },
      ])
      .lean();

    const totalContracts = await Contract.countDocuments(contractQuery);
    const totalPages = Math.ceil(totalContracts / limit);

    res.status(200).json({
      message: "Danh sách hợp đồng ds :",
      data: {
        currentPage: page,
        totalPages: totalPages,
        totalContracts: totalContracts,
        contracts: contracts,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách hợp đồng!",
      error: error.message,
    });
  }
};

// Xem chi tiết hợp đồng theo ID
exports.getContractDetails = async (req, res) => {
  const { contractId } = req.params;
  const { id: userId, role } = req.user; // Lấy ID và role từ user trong request

  try {
    // Tìm hợp đồng theo ID và populate thông tin tạo và khách hàng
    const contract = await Contract.findById(contractId).populate([
      { path: "createdBy customerId", select: "fullName" },
    ]);

    // Kiểm tra nếu không tìm thấy hợp đồng
    if (!contract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng!" });
    }

    // Kiểm tra quyền truy cập của người dùng
    if (
      role !== "Admin" &&
      role !== "SuperAdmin" &&
      contract.customerId._id.toString() !== userId
    ) {
      return res.status(403).json({
        message: "Bạn không có quyền xem hợp đồng này!",
      });
    }

    // Trả về chi tiết hợp đồng
    res
      .status(200)
      .json({ message: "Thông tin chi tiết hợp đồng:", data: contract });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết hợp đồng!",
      error: error.message,
    });
  }
};

// Xem danh sách hợp đồng theo UserId
exports.getContractsByUserId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { search_value } = req.query;
    let contractQuery = { customerId };

    if (
      search_value &&
      search_value.trim() !== "" &&
      search_value.trim() !== '""'
    ) {
      const cleanSearchValue = search_value.replace(/"/g, "").trim();
      contractQuery.name = { $regex: cleanSearchValue, $options: "i" };
    }

    const listContract = await Contract.find(contractQuery)
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "createdBy customerId",
          select: "fullName",
        },
      ])
      .lean();

    res.status(200).json({
      message: "Danh sách hợp đồng theo UserId:",
      data: {
        listContract: listContract,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết hợp đồng!",
      error: error.message,
    });
  }
};
