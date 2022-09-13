const axios = require('axios');
const dotenv = require('dotenv');
const db = require("../models");
const User = db.user;

dotenv.config();

const url_line_notification = "https://notify-api.line.me/api/notify";
const url_line_authorize = "https://notify-bot.line.me/oauth/authorize";
const url_line_token = "https://notify-bot.line.me/oauth/token";

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
        console.log('Line Auth : ',response.data);
    })
    .catch(function (error) {
        console.log('Error : ',error);
    });
}

token = (code,secret,userId) => {
    axios.post(
        url_line_token,
        {
            grant_type : 'authorization_code',
            code : code,
            redirect_uri : 'http://localhost:4000/line/redirect',
            client_id : 'oXiT9LVmeywPufRQwwlUfV',
            client_secret : secret
        },
        {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
    ).then(function (response) {
        console.log('Line Token : ',response.data);
        if(response.data){
            User.findOneAndUpdate(
                {_id: userId},
                {$set :{lineToken : response.data.access_token}}
            )
        }
    })
    .catch(function (error) {
        console.log('Error : ',error);
    });
}

notify = (text) => {
    request({
        method: 'POST',
        uri: url_line_notification,
        header: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            bearer: process.env.TOKEN,
        },
        form: {
            message: text
        },
    }, (err, httpResponse, body) => {
        if (err) {
            console.log(err)
        } else {
            console.log(body)
        }
    });
}

const lineNotify = {
    notify,
    auth,
    token
};

module.exports = lineNotify;