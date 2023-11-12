const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Groupmember = sequelize.define('GroupMembers',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey:true
    }},
    {
        timestamps: false
    });

module.exports=Groupmember;