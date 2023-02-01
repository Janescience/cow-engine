const axios = require('axios');
const qs = require('qs');
const dotenv = require('dotenv');
const db = require("../models");
const User = db.user;
const Farm = db.farm;
const NotiLogs = db.notificationLogs;

dotenv.config();

const url_line_notification = "https://notify-api.line.me/api/notify";
const url_line_authorize = "https://notify-bot.line.me/oauth/authorize";
const url_line_token = "https://notify-bot.line.me/oauth/token";

//Authentication
auth = async () => {
    axios.get(url_line_authorize,
        {
            params: {
                response_type : 'code',
                client_id : 'oXiT9LVmeywPufRQwwlUfV',
                redirect_uri : 'http://localhost:4000/line/redirect',
                scope : 'notify',
                state : '9xZ6CmqcX2gECK4bZH8cyzkAH8BjEzRIuyo6E5Vo3Vw'
            }
        }
    ).then(function (response) {
        // console.log('Line Auth : ',response);
    })
    .catch(function (error) {
        console.log('Error : ',error);
    });
}

//Get Token
token = (code,username) => {
    axios.post(
        url_line_token,
        qs.stringify({
            grant_type : 'authorization_code',
            code : code,
            redirect_uri : 'http://localhost:4000/line/redirect',
            client_id : 'oXiT9LVmeywPufRQwwlUfV',
            client_secret : '9xZ6CmqcX2gECK4bZH8cyzkAH8BjEzRIuyo6E5Vo3Vw'
        }),
        {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
    ).then(function  (response) {
        console.log('Get Token : ',response.data);
        
        if(response.data){
            User.findOne({username:username})
                .exec((err, user) => {
                    const filter = { _id : user.farm._id };
                    const update = { lineToken: response.data.access_token };
                    Farm.findOneAndUpdate(filter,{$set:update},{new : true })
                        .exec((err, user) => {
                            if (err) {
                                console.error('Error : ',err);
                            }
                            console.log('Updated Successfully : ',user);
                        })
                })
            
        }
        return response.data;
    })
    .catch(function (error) {
        console.error('Error : ',error.response.data.message);
    });
}

//Notification to Line
notify = async (text,type,farm,token) => {
    await axios.post(
        url_line_notification,
        qs.stringify({message:text}),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization' : 'Bearer ' + token
            }
        },
        ).then(function (response) {
            console.log('Notify Successfully : ',response.data);
            const newNotiLog = new NotiLogs({
                message : text,
                type : type,
                status : 'S',
                respMessage : 'status='+response.data.status + ',message='+response.data.message,
                farm : farm
            });
            newNotiLog.save();

            console.log('Notification log saved : ',newNotiLog);
            return response.data;
        })
        .catch(function (error) {
            console.error('Notification Error : ',error);
            const newNotiLog = new NotiLogs({
                message : text,
                type : type,
                status : 'F',
                respMessage : 'status='+response.data.status + ',message='+response.data.message,
                farm : farm
            });
            newNotiLog.save();
            console.log('Notification log saved : ',newNotiLog);
        });
}

const lineNotify = {
    notify,
    auth,
    token
};

module.exports = lineNotify;