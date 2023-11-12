const Sequelize = require('sequelize');
const sequelize = require('../util/database')

const User = sequelize.define('User',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey:true
    },
    name:{
        type : Sequelize.STRING,
        allowNull:false
    },
    email:{
        type: Sequelize.STRING,
        allowNull:false
    },
    phonenumber:{
        type: Sequelize.BIGINT(10),
        unique: true,
        allowNull: false
    },
    imageUrl:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    password:{
        type: Sequelize.TEXT,
        allowNull:false 
    }},
    {
        timestamps: false
    }
)
module.exports=User;