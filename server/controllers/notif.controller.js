const Ticket = require("../models/ticket.model");
const TicketDetails = require('../models/ticketdetails.model');
const Category = require('../models/category.model');
const User = require('../models/userlogin.model');
const UserDetails = require('../models/userdetails.model');
const UserRole = require('../models/user_role.model');
const BranchList = require('../models/branchlist.model');
const AssignedTo = require('../models/assigendto.model');
const { Op } = require('sequelize');
const { Sequelize } = require('../config/db.config');


const getAllNotif = async (req, res) => {
    try {
        const notifs = await Ticket.findAll({
            include: [
            {
                model: User,
                as: 'UserTicket',
                attributes: {
                    exclude: ['username', 'password', 'user_details_id', 'user_role_id', 'blist_id']
                },
                include: [
                    {
                        model: UserDetails,
                        as: 'UserDetails',
                        attributes: ['fname', 'lname', 'user_contact', 'user_email']
                    } , {
                        model: UserRole,
                        as: 'UserRole',
                        attributes: ['role_name']
                    } , {
                        model: BranchList,
                        as: 'Branch',
                        attributes: ['b_code', 'b_name']
                    }
                ] 
            } , {
                model: TicketDetails,
                as: 'TicketDetails',
                include: [
                    {
                        model: Category,
                        as: 'Category',
                        attributes: {
                            exclude: ['category_shortcut']
                        },
                        // attributes: ['category_name']
                    }
                ]
            } , {
                model: User,
                as: 'AssignedTicket',
                attributes: {
                    exclude: ['username', 'password', 'user_details_id', 'user_role_id', 'blist_id']
                },
                include: [
                    {
                        model: UserDetails,
                        as: 'UserDetails',
                        attributes: ['fname', 'lname', 'user_contact', 'user_email']
                    }, {
                        model: UserRole,
                        as: 'UserRole',
                        attributes: ['role_name']
                    }, {
                        model: BranchList,
                        as: 'Branch',
                        attributes: ['b_code', 'b_name']
                    }
                ]
            }],
        });
      
        return res.json(notifs);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }
};


const notifRead = async (req, res) => {
    const ticketId = req.params.ticketId;
    const { notifID } = req.body;
    const ticket = await Ticket.findByPk(ticketId);

    try {
        if(notifID === 1){
            
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }

            await Ticket.update({
                notifAdmin: 0 
            } , {
                where: { ticket_id: ticketId }
            });
        
            return res.status(200).json({ message: 'Successfully updated notif to 0' });
        }else if(notifID === 3){
            
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }

            await Ticket.update({
                notifAccounting: 0
            } , {
                where: { ticket_id: ticketId }
            });
        
            return res.status(200).json({ message: 'Successfully updated notif to 0' });
        }else if(notifID === 4){
            
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }

            await Ticket.update({
                notifHead: 0
            } , {
                where: { ticket_id: ticketId }
            });
        
            return res.status(200).json({ message: 'Successfully updated notif to 0' });
        }else if(notifID === 5){
            
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }

            await Ticket.update({
                notifStaff: 0
            } , {
                where: { ticket_id: ticketId }
            });
        
            return res.status(200).json({ message: 'Successfully updated notif to 0' });
        }else if(notifID === 7){
            
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }

            await Ticket.update({
                notifAccounting: 0
            } , {
                where: { ticket_id: ticketId }
            });
        
            return res.status(200).json({ message: 'Successfully updated notif to 0' });
        } else if (notifID === 100){
            
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }

            await Ticket.update({
                notifAUTM: 0 
            } , {
                where: { ticket_id: ticketId }
            });
        
            return res.status(200).json({ message: 'Successfully updated notif to 0' });
        }
    } catch (error) {
        
        return res.status(500).json({ message: 'An error occurred while deleting the ticket' });
    }
};

const automationNotif = async (req, res) => {
    const login_id = req.userID;

    try{
        if(login_id){
        const automationID = await Ticket.findAll({ 
            where: {assigned_person: login_id},
            
        });
            return res.json(automationID);
        }else{
            console.log('Error: User Not found')
        }
    }catch{

    }

};


module.exports = { getAllNotif, notifRead, automationNotif };