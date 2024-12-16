const Service = require("../../models/Service/Service");

// Thêm dịch vụ mới
exports.createService = async (req, res) => {
  try {
    const { serviceName, description, price, status } = req.body;

    const newService = new Service({ serviceName, description, price, status });
    await newService.save();

    res
      .status(201)
      .json({ message: "Service created successfully", service: newService });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create service", error: error.message });
  }
};

// Lấy danh sách dịch vụ
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.status(200).json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch services", error: error.message });
  }
};

// Cập nhật thông tin dịch vụ
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedService = await Service.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update service", error: error.message });
  }
};

// Xóa dịch vụ
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete service", error: error.message });
  }
};
