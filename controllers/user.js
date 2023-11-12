const User = require('../models/users');
const ChatHistory = require('../models/chat-history')
const Group = require('../models/groups')
const awsService = require('../services/awsservices');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;



exports.userSignup = async (request, response, next) => {
    try {
        const { name, email, phonenumber, imageUrl, password } = request.body;
        let userExist = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phonenumber }]
            }
        });
        if (!userExist) {
            const hash = await bcrypt.hash(password, 10);
            const user = await User.create({ name, email, phonenumber, imageUrl, password: hash });
            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
            response.cookie('token', token, { maxAge: 3600000 });
            return response.status(201).json({ message: "user Account created successfully" });
        } else {
            return response.status(409).json({ message: 'Email or Phone Number already exist!' })
        }


    } catch (error) {
        console.log(error);
    }
}
exports.userSignin = async (request, response, next) => {
    try {
        const { email, password } = request.body;
        let userExist = await User.findOne({ where: { email } })
        if (userExist) {
            const isPasswordValid = await bcrypt.compare(password, userExist.password);
            if (isPasswordValid) {
                const token = jwt.sign({ userId: userExist.id }, secretKey, { expiresIn: '1h' });
                response.cookie('token', token, { maxAge: 3600000 });
                return response.status(201).json({ message: "Username and password correct" })
            } else {
                return response.status(401).json({ message: 'Invalid Password!' })
            }
        } else {
            return response.status(409).json({ message: 'Account is not exist!' })
        }


    } catch (error) {
        console.log(error);
    }
}

exports.saveChatHistory = async (request, response, next) => {
    try {
        const user = request.user;
        const { message, GroupId } = request.body;
        if (GroupId == 0) {
            await user.createChatHistory({
                message,
            })
        } else {
            await user.createChatHistory({
                message,
                GroupId,
            })
        }

        return response.status(200).json({ message: "Message saved to database succesfully" })

    } catch (error) {
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.getUserChatHistory = async (request, response, next) => {
    try {
        const user = request.user;
        const chatHistories = await user.getChatHistories();
        return response.status(200).json({ chat: chatHistories, message: "User chat History Fetched" })

    } catch (error) {
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}
exports.getAllChatHistory = async (request, response, next) => {
    try {
        const lastMessageId = request.query.lastMessageId || 0;
        const chatHistories = await ChatHistory.findAll({
            include: [
                {
                    model: User,
                    attibutes: ['id', 'name', 'date_time']
                }
            ],
            order: [['date_time', 'ASC']],
            where: {
                GroupId: null,
                id: {
                    [Op.gt]: lastMessageId
                }
            }
        });
        const chats = chatHistories.map((ele) => {
            const user = ele.User;
            return {
                messageId: ele.id,
                message: ele.message,
                isImage: ele.isImage,
                name: user.name,
                userId: user.id,
                date_time: ele.date_time
            }
        })
        return response.status(200).json({ chats, message: "User chat History Fetched" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}
exports.getcurrentuser = async (request, response, next) => {
    const user = request.user;
    response.json({ userId: user.id ,user});
}
exports.getAlluser = async (request, response, next) => {
    try {
        const user = request.user;
        const users = await User.findAll({
            attributes: ['id', 'name', 'imageUrl'],
            where: {
                id: {
                    [Op.not]: user.id
                }
            }
        });
        return response.status(200).json({ users, message: "All users succesfully fetched" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.updateGroup = async (request, response, next) => {
    try {
        const user = request.user;
        const { groupId } = request.query;
        const group = await Group.findOne({ where: { id: Number(groupId) } });
        const { name, membersNo, membersIds } = request.body;
        const updatedGroup = await group.update({
            name,
            membersNo,
            AdminId: user.id
        })
        membersIds.push(user.id);
        await updatedGroup.setUsers(null);
        await updatedGroup.addUsers(membersIds.map((ele) => {
            return Number(ele)
        }));
        return response.status(200).json({ updatedGroup, message: "Group is succesfylly updated" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}
exports.createGroup = async (request, response, next) => {
    try {
        const user = request.user;
        const { name, membersNo, membersIds } = request.body;
        const group = await user.createGroup({
            name,
            membersNo,
            AdminId: user.id
        })
        membersIds.push(user.id);
        await group.addUsers(membersIds.map((ele) => {
            return Number(ele)
        }));
        return response.status(200).json({ group, message: "Group is succesfylly created" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.getAllgroups = async (request, response, next) => {
    try {
        const groups = await Group.findAll();
        return response.status(200).json({ groups, message: "All groups succesfully fetched" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.getGroupChatHistory = async (request, response, next) => {
    try {
        const { groupId } = request.query;
        const chatHistories = await ChatHistory.findAll({
            include: [
                {
                    model: User,
                    attibutes: ['id', 'name', 'date_time']
                }
            ],
            order: [['date_time', 'ASC']],
            where: {
                GroupId: Number(groupId),
            }
        });
        const chats = chatHistories.map((ele) => {
            const user = ele.User;
            return {
                messageId: ele.id,
                message: ele.message,
                isImage: ele.isImage,
                name: user.name,
                userId: user.id,
                date_time: ele.date_time
            }
        })
        return response.status(200).json({ chats, message: "User chat History Fetched" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.getGroupbyId = async (request, response, next) => {
    try {
        const { groupId } = request.query;
        const group = await Group.findOne({ where: { id: Number(groupId) } });
        response.status(200).json({ group, message: "Group details succesfully fetched" })
    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.getMygroups = async (request, response, next) => {
    try {
        const user = request.user;
        const groups = await user.getGroups();
        return response.status(200).json({ groups, message: "All groups succesfully fetched" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.getGroupMembersbyId = async (request, response, next) => {
    try {
        const { groupId } = request.query;
        const group = await Group.findOne({ where: { id: Number(groupId) } });
        const AllusersData = await group.getUsers();
        const users = AllusersData.map((ele) => {
            return {
                id: ele.id,
                name: ele.name,
            }
        })

        response.status(200).json({ users, message: "Group members name succesfully fetched" })
    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.saveChatImages = async (request, response, next) => {
    try {
        const user = request.user;
        const image = request.file;
        const { GroupId } = request.body;
        const filename = `chat-images/group${GroupId}/user${user.id}/${Date.now()}_${image.originalname}`;
        const imageUrl = await awsService.uploadToS3(image.buffer, filename)
        console.log(imageUrl);
        if (GroupId == 0) {
            await user.createChatHistory({
                message: imageUrl,
                isImage: true
            })
        } else {
            await user.createChatHistory({
                message: imageUrl,
                GroupId,
                isImage: true
            })
        }

        return response.status(200).json({ message: "image saved to database succesfully" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

