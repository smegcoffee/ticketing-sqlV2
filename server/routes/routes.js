const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const branchController = require('../controllers/branch.controller');
const categoryController = require('../controllers/category.controller');
const supplierController = require('../controllers/supplier.controller');
const ticketController = require('../controllers/ticket.controller');
const assignedController = require('../controllers/assignedto.controller');
const assignedCategoryController = require('../controllers/assignedcategory.controller')
const userRoleController = require('../controllers/userRole.controller');
const helpController = require('../controllers/help.controller');
const areaManagerController = require('../controllers/assignedareamanager.controller')
const { verifyAccessToken, setUserRoleCookieHandler } = require('../utils/auth');
const notifController = require('../controllers/notif.controller');
const profileController = require('../controllers/userprofile.controller');
const upload = require('../utils/uploader');


router.post('/login', userController.loginUser, verifyAccessToken, setUserRoleCookieHandler);
router.get('/getUserLoginInfo', verifyAccessToken, userController.getUserLogin);
router.get('/getAllCategories', categoryController.getAllCategories);
router.get('/getAllSupplier', supplierController.getAllSupplier);
router.get('/getAllUsers', userController.getAllUsers);
router.get('/getAllTickets', verifyAccessToken, ticketController.getAllTickets);
router.get('/getAllCompleted', verifyAccessToken, ticketController.getAllCompletedTickets);
router.get('/getReports', verifyAccessToken, ticketController.getReports);
router.get('/getAllBranches', branchController.getAllBranch);
router.get('/getAllCategoryGroup', categoryController.getAllCategoryGroup);
router.get('/getAllBranchCategories', branchController.getAllBranchCategories);
router.get('/viewTicket/:ticketID', ticketController.viewTicket);
router.get('/viewReports', ticketController.viewReports);
router.get('/getAllAutomation', userController.getAutomationUsers);
router.get('/getAllAccounting', userController.getAccountingUsers);
router.get('/getAllAreaManager', userController.getAreaManagerUsers);
router.get('/getAllCAS', userController.getCASUsers);
router.get('/getAllStatus', ticketController.getAllTicketStatus);
router.get('/viewCategory/:categoryID', categoryController.viewCategory);
router.get('/viewSupplier/:supplierID', supplierController.viewSupplier);
router.get('/viewBranch/:branchID', branchController.viewBranch);
router.get('/getAllRoles', userRoleController.getAllRoles);
router.get('/viewUser/:userID', userController.viewUser);
router.get('/userCount', userController.userCount);
router.get('/ticketCompletedCount', verifyAccessToken, ticketController.ticketCount);
router.get('/ticketThisWeekCount', verifyAccessToken, ticketController.ticketCountsThisWeek);
router.get('/ticketPendingCount', verifyAccessToken, ticketController.ticketPendingCountsToday);
router.get('/getAllAutomationHelp', helpController.getAllAutomationHelp);
router.get('/getAllBranchHelp', helpController.getAllBranchHelp);
router.get('/getTicketThisWeek', verifyAccessToken, ticketController.ticketThisWeek);
router.get('/getTicketThisYear', verifyAccessToken, ticketController.ticketCountsByMonth);
router.get('/getTicketLastYear', verifyAccessToken, ticketController.ticketCountsByMonthLastYear);
router.get('/getAllNotifs', notifController.getAllNotif);
router.get('/getAllBranchesTable', branchController.tableBranches);
router.get('/getAllCategoriesTable', categoryController.tableCategories);
router.get('/getAllSupplierTable', supplierController.tableSupplier);
router.get('/getAllBlist', assignedController.findAllBlist);
router.get('/getAllBlistCAS', assignedController.findAllBlistCAS);
router.get('/getAllBlistManager', areaManagerController.findAllBlistManager);
router.get('/getAllInBlist', assignedController.findAllInBlist);
router.get('/getAutomationInCharge', assignedController.getAllAutomationAssigned);
router.get('/getAllUsersTable', verifyAccessToken, userController.tableUsers);
router.get('/viewHelp/:helpID', helpController.viewHelp);
router.get('/getAutomationData', userController.getAutomationWithData);
router.get('/getTopBranches', ticketController.topBranches);
router.get('/getAssignedCategory', assignedCategoryController.getAllAccountingAssigned);
router.get('/getAssignedCategoryGroup/:userID', verifyAccessToken, assignedCategoryController.getAssignedCategoryGroup);
router.get('/getAssignedCAS', assignedCategoryController.getAllCASAssigned);
router.get('/getAssignedManager', areaManagerController.getAllManagerAssigned);
router.get('/getAssignedCategories', verifyAccessToken, assignedCategoryController.getSingleAccountingAssigned);
router.get('/getautomationNotif', notifController.automationNotif);
router.get('/getAllAssignedCategories', verifyAccessToken, assignedCategoryController.getAssignedCategories);
router.get('/auth/check-cookie', verifyAccessToken);

 

router.post('/register', userController.registerUser);
router.post('/createBranch', branchController.createBranch);
router.post('/createCategory', categoryController.createCategory);
router.post('/createSupplier', supplierController.createSupplier);
router.post('/assignedTo', assignedController.assignedTo);
router.post('/createTicket', upload.attachment.array('support'), verifyAccessToken, ticketController.createTicket);
router.post('/createHelp', helpController.createHelp);
router.post('/assignedAccounting', assignedCategoryController.assignedToCategory);
router.post('/assignedCAS', assignedCategoryController.assignedBranchCAS);
router.post('/assignedManager', areaManagerController.assignedBranchManager);


router.patch('/updateSupport/:ticketID', ticketController.updateSupport);


router.put('/updateUser/:userID', userController.updateUser);
router.put('/updateBranch/:branchID', branchController.updateBranch);
router.put('/updateCategory/:categoryID', categoryController.updateCategory); 
router.put('/updateSupplier/:supplierID', supplierController.updateSupplier); 
router.put('/deleteTicket/:ticketID', ticketController.deleteTicket);
router.put('/updateTicket/:ticketID', upload.attachment.array('td_support'), verifyAccessToken, ticketController.updateTicket);
router.put('/updateTicketStatus/:ticketID', verifyAccessToken, ticketController.updateTicketStatus);
router.put('/assignedAutomation/:ticketID', ticketController.assignedAutomation);
router.put('/returnToAutomation/:ticketID', ticketController.returnToAutomation);
router.put('/updateCount/:ticketID', ticketController.setCount);
router.put('/updateNotif/:ticketId', notifController.notifRead);
router.put('/editHelp/:helpID', helpController.editHelp);
router.put('/changePass', verifyAccessToken, profileController.changePassword);
router.put('/editUserDetails', verifyAccessToken, profileController.editUserDetails);
router.put('/assignedToUpdate', assignedController.assignedToUpdate);
router.put('/uploadProfilePic', upload.profileUpload.single('profileImage'), verifyAccessToken, profileController.uploadProfilePic);
router.put('/updateApprovalStatus/:ticketID', verifyAccessToken, ticketController.updateApproved);
router.put('/updateNote/:ticketID', verifyAccessToken, ticketController.updateNote);

router.delete('/deleteCategory/:categoryID', categoryController.deleteCategory);
router.delete('/deleteSupplier/:supplierID', supplierController.deleteSupplier);
router.delete('/deleteBranch/:branchID', branchController.deleteBranch);
router.delete('/deleteUser/:userID', userController.deleteUser);
router.delete('/deleteHelp/:helpID', helpController.deleteHelp);
router.delete('/assignedToDelete', assignedController.assignedToDelete);
router.delete('/assignedDeleteCategory', assignedCategoryController.assignedCategoryDelete);
router.delete('/assignedDeleteCAS', assignedCategoryController.assignedCASDelete);
router.delete('/assignedDeleteManager', areaManagerController.assignedManagerDelete);


router.get('/logout', (req, res) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.status(200).json({message: "Logout Success"});
});


router.get('/*', verifyAccessToken, (req, res) => {
    return res.status(200).json({message: "Success", role: req.role});
});

module.exports = router;