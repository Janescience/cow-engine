const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Farm = db.farm;
const RefreshToken = db.refreshToken;
const NotiParam = db.notificationParam;
const Param = db.param;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {

    const countF = await Farm.collection.countDocuments();
    // console.log("farm count : ",countF);

    const farm = new Farm({
      code : "F" + String(countF + 1).padStart(4,'0'),
      name : req.body.farmName,
      lineToken : null
    })

    const user = new User({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 8),
      farm : farm,
    });

    const farmResp = await farm.save();
    // console.log("farm saved : ",farmResp);

    const userResp = await user.save();
    // console.log("user saved : ",userResp);

    const notiParams = [
      { code : 'REPRO_ESTRUST' ,name : 'การเป็นสัด', farm : farm },
      { code : 'REPRO_MATING' ,name : 'การผสม', farm : farm },
      { code : 'REPRO_CHECK' ,name : 'การตรวจท้อง', farm : farm },
      { code : 'BIRTH' ,name : 'การคลอด', farm : farm },
      { code : 'VACCINE_FMD' ,name : 'วัคซีนปากเท้าเปื่อย (FMD)', farm : farm },
      { code : 'VACCINE_LS' ,name : 'วัคซีนลัมพีสกิน (LUMPY SKIN)', farm : farm },
      { code : 'VACCINE_CDT' ,name : 'วัคซีนลาดหลัง (CYDECTIN)', farm : farm },
      { code : 'VACCINE_BIO' ,name : 'ยาบำรุง (BIO)', farm : farm },
      { code : 'VACCINE_IVOMEC' ,name : 'ยาถ่ายพยาธิ (IVOMEC)', farm : farm },
    ]

    await NotiParam.insertMany(notiParams);

    const param = {
      code : 'RAW_MILK',
      group : 'PRICE',
      name : 'ราคาน้ำนมดิบ/กก.',
      valueNumber : 20.5,
      farm : farm
    }

    const newParam = new Param(param);
    await newParam.save()

    res.status(200).send({message:"Registered Successfully."});

};

exports.signin = (req, res) => {

    User.findOne({
        username: req.body.username
    }).select('+password').exec(async (error,user) => {
        if (!user) {
          // console.log("Username not found : "+req.body.username)
          return res.status(401).send({ message: "ชื่อผู้ใช้ไม่ถูกต้อง หรือ ไม่มีผู้ใช้ในระบบ กรุณาลองอีกครั้ง" });
        }
  
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );
  
        if (!passwordIsValid) {
          // console.info("Invalid password : "+req.body.username)
          return res.status(401).send({
            accessToken: null,
            message: "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง"
          });
        }
  
        var accessToken = jwt.sign({ id: user.farm }, config.secret, {
          expiresIn: config.jwtExpiration // 24 hours
        });

        const farm = await Farm.findById(user.farm).exec();

        await RefreshToken.deleteMany({user:user._id}).exec();

        let refreshToken = await RefreshToken.createToken(user,config.jwtRefreshExpiration);

        // console.log("Signined : "+req.body.username)

        res
          .status(200)
          .send({
            id: user._id,
            username: user.username,
            farm : farm,
            accessToken: accessToken,
            lineToken : farm.lineToken,
            refreshToken: refreshToken,
          });

    });
};

exports.user = async (req,res) => {
    const user = await User.findOne({farm:req.farmId});
    user.farm = await Farm.findOne({_id:req.farmId});

    // console.log("Get user : "+user.username)
    return res.status(200).json({user:user})
}

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    // console.log("Refresh Token is required!");
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  let refreshToken = await RefreshToken.findOne({ token: requestToken }).exec();

  if (!refreshToken) {
    res.status(403).json({ message: "Refresh token is not in database!" });
    // console.log("Refresh token is not in database!");
    return;
  }

  if (RefreshToken.verifyExpiration(refreshToken)) {
    RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

    // console.log("Refresh token was expired. Please make a new signin request");
    res.status(403).json({
      message: "Refresh token was expired. Please make a new signin request",
    });
    return;
  }

  const user = await User.findOne({_id:refreshToken.user}).exec();

  let newAccessToken = jwt.sign({ id: user.farm }, config.secret, {
    expiresIn: config.jwtExpiration,
  });

  return res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: refreshToken.token,
  });
};
