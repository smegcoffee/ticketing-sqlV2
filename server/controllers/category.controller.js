const Category = require("../models/category.model");
const TicketDetails = require("../models/ticketdetails.model");
const CategoryGroup = require("../models/categorygroup.model");
const { Op } = require("sequelize");

const createCategory = async (req, res) => {
  const { category_name, category_shortcut, group_code } = req.body;

  try {
    const existingName = await Category.findOne({ where: { category_name } });

    if (existingName) {
      return res.status(409).json({ message: "Category already exist!" });
    } else {
      await Category.create({
        category_shortcut,
        category_name,
        group_code,
      });

      return res.status(201).json({ message: "Category added" });
    }
  } catch (error) {
    console.error("Error adding category:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while adding category" });
  }
};

const viewCategory = async (req, res) => {
  const categoryID = req.params.categoryID;

  try {
    const category = await Category.findByPk(categoryID, {
      attributes: ["category_name", "category_shortcut"],
      include: [
        {
          model: CategoryGroup,
          as: "CategoryGroup",
        },
      ],
    });

    return res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching the category" });
  }
};

const updateCategory = async (req, res) => {
  const categoryID = req.params.categoryID;
  const { category_name, category_shortcut, group_code } = req.body;

  try {
    const category = await Category.findByPk(categoryID);

    if (category_name !== category.category_name) {
      const existingCategory = await Category.findOne({
        where: { category_name: category_name },
      });
      if (existingCategory) {
        return res.status(409).json({ message: "Category already exist!" });
      }
    }

    await Category.update(
      {
        category_shortcut,
        category_name,
        group_code,
      },
      {
        where: { ticket_category_id: categoryID },
      }
    );

    return res.status(200).json({ message: "Category updated" });
  } catch (error) {
    console.error("Error updating category:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating category" });
  }
};

const deleteCategory = async (req, res) => {
  const categoryID = req.params.categoryID;

  try {
    const category = await Category.findByPk(categoryID);
    const ticket = await TicketDetails.findOne({
      where: { ticket_category_id: categoryID },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (ticket) {
      return res
        .status(409)
        .json({ message: `Can't delete! Category is in used!` });
    }

    await Category.destroy({
      where: {
        ticket_category_id: categoryID,
      },
    });

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting category" });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.findAll({
      order: [["category_name", "ASC"]],
    });
    return res.json(allCategories);
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching all categories" });
  }
};

const tableCategories = async (req, res) => {
  const { search } = req.query || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    const allCategory = await Category.findAndCountAll({
      include: [
        {
          model: CategoryGroup,
          as: "CategoryGroup",
        },
      ],
      where: {
        [Op.or]: [
          { category_shortcut: { [Op.like]: `%${search}%` } },
          { category_name: { [Op.like]: `%${search}%` } },
        ],
      },
      order: [["category_name", "ASC"]],
      limit: limit,
      offset: offset,
    });

    return res.json(allCategory);
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching all categories" });
  }
};

const getAllCategoryGroup = async (req, res) => {
  try {
    const allCategoryGroup = await CategoryGroup.findAll();
    const sortedData = allCategoryGroup.sort();
    return res.json(sortedData);
  } catch (error) {
    console.error("Error fetching all category group:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching all category group" });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  getAllCategories,
  viewCategory,
  deleteCategory,
  tableCategories,
  getAllCategoryGroup,
};
