const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require('@socket.io/admin-ui');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const fs = require('fs')
require('dotenv').config();

// Importing the routes for our API
const sequelize = require('./util/database');
const User = require('./models/users');
const Forgotpasswords = require('./models/forgot-password');
const ChatHistory = require('./models/chat-history');
const Groups = require("./models/groups");
const GroupMember = require('./models/group-members');

const websocketService = require('./services/websocket');
const cronService = require('./services/cron');
cronService.job.start();

const maninRoute = require('./routes/home');
const userRoute = require('./routes/user');

const accessLogStream = fs.createWriteStream('./access.log', { flags: 'a' });

const app = express();
app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors({
  origin: '*',
  methods:['GET','POST'],

}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieParser());

app.use('/user',userRoute)
app.use(maninRoute)

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io",],
    credentials: true
  }
});
io.on('connection', websocketService )

instrument(io, { auth: false })

User.hasMany(Forgotpasswords);
Forgotpasswords.belongsTo(User,{constraints:true,onDelete:'CASCADE'});
User.hasMany(ChatHistory)
ChatHistory.belongsTo(User, { constraints: true });
User.belongsToMany(Groups, { through: GroupMember });
Groups.belongsToMany(User, { through: GroupMember });
Groups.belongsTo(User,{foreignKey: 'AdminId',constraints:true,onDelete:'CASCADE'})
Groups.hasMany(ChatHistory);
ChatHistory.belongsTo(Groups);

const PORT = process.env.PORT || 3000;
async function initiate() {
    try {
     const res = await sequelize.sync();
      httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} `);
      })
    } catch (err) {
      console.error('Error during server initialization:', err);
      process.exit(1); 
    }
  }
  initiate();