const Supplier = require("../models/supplier.model");
const TicketDetails = require("../models/ticketdetails.model");
const { Op } = require("sequelize");

const createSupplier = async (req, res) => {
  const { supplier } = req.body;

  try {
    
    if (supplier) {
        await Supplier.create({
            supplier
        });
    }

    return res.status(201).json({ message: "Supplier added" });
  } catch (error) {
    console.error("Error adding supplier:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while adding supplier" });
  }
};

const tableSupplier = async (req, res) => {
  const { search } = req.query || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    const allSupplier = await Supplier.findAndCountAll({
      where: {
        [Op.or]: [
          { supplier: { [Op.like]: `%${search}%` } }
        ],
      },
      order: [["supplier", "ASC"]],
      limit: limit,
      offset: offset,
    });

    return res.json(allSupplier);
  } catch (error) {
    console.error("Error fetching all supplier:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching all supplier" });
  }
};

const viewSupplier = async (req, res) => {
  const supplierID = req.params.supplierID;

  try {
    const supplier = await Supplier.findByPk(supplierID);

    return res.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching supplier" });
  }
};

const updateSupplier = async (req, res) => {
  const supplierID = req.params.supplierID;
  const { supplier_name } = req.body;

  try {

    await Supplier.update(
      {
        supplier: supplier_name
      },
      {
        where: { id: supplierID },
      }
    );

    return res.status(200).json({ message: "Supplier updated" });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating supplier" });
  }
};

const deleteSupplier = async (req, res) => {
  const supplierID = req.params.supplierID;

  try {
    const ticket = await TicketDetails.findOne({
      where: { supplier: supplierID },
    });

    if (ticket) {
      return res
        .status(409)
        .json({ message: `Can't delete! Supplier is in used!` });
    } else {
        await Supplier.destroy({
            where: {
            id: supplierID,
            },
        });
    }


    return res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting supplier" });
  }
};

const getAllSupplier = async (req, res) => {
  try {
    const allSupplier = await Supplier.findAll();
    return res.json(allSupplier);
  } catch (error) {
    console.error("Error fetching all supplier:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching all supplier" });
  }
};

module.exports = {
  createSupplier,
  tableSupplier,
  viewSupplier,
  updateSupplier,
  deleteSupplier,
  getAllSupplier
};
