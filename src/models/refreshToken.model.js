const mongoose = require("mongoose");
const config = require("../config/auth.config");
const { v4: uuidv4 } = require('uuid');

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  expiryDate: Date,
});

RefreshTokenSchema.statics.createToken = async function (user,exp) {
  let expiredAt = new Date();

  expiredAt.setSeconds(
    expiredAt.getSeconds() + exp
  );

  let _token = uuidv4();

  let _object = new this({
    token: _token,
    user: user._id,
    expiryDate: expiredAt.getTime(),
  });

  console.log('createToken : ',_object);

  let refreshToken = await _object.save();

  return refreshToken.token;
};

RefreshTokenSchema.statics.verifyExpiration = (token) => {
  return token.expiryDate.getTime() < new Date().getTime();
}

const RefreshToken = mongoose.model("refreshToken", RefreshTokenSchema);

module.exports = RefreshToken;