const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Farm = db.farm;
const Vaccine = db.vaccine
const RefreshToken = db.refreshToken;
const NotiParam = db.notificationParam;
const Param = db.param;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;

const { v4: uuidv4 } = require('uuid');

exports.signup = async (req, res) => {
    const farmCount = await Farm.count();

    const newFarm = {
      code : "F" + String(farmCount + 1).padStart(4,'0'),
      name : req.body.farmName,
      lineToken : null
    }

    try {    
      const result = await db.sequelize.transaction(async (t) => {
        const farm = await Farm.create(newFarm, { 
          transaction: t 
        });
        const newUser = {
          username: req.body.username,
          password: bcrypt.hashSync(req.body.password, 8),
          farmId : farm.id,
        };
        const user = await User.create(newUser, {
          transaction: t
        });

        await createMasterData(farm.id,t);
        return {farm,user:user.username}
      })
      res.status(200).send(result)
     } catch (error) { 
        console.error(error)
        res.status(500).send(error)
     }
};

exports.signin = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    let condition = username ? { username: { [Op.iLike]: `%${username}%` } } : null;
    
    User.findAll({ where : condition})
      .then(data => {
        
        if (data.length === 0) {
          return res.status(401).send({ message: "ชื่อผู้ใช้ไม่ถูกต้อง หรือ ไม่มีผู้ใช้ในระบบ กรุณาลองอีกครั้ง" });
        }

        const user = data[0]

        const passwordIsValid = bcrypt.compareSync(
          password,
          user.password
        );
  
        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง"
          });
        }
  
        const accessToken = jwt.sign(
          { id: user.farmId }, 
          config.secret, {
            expiresIn: config.jwtExpiration 
          }
        );

        Farm.findByPk(user.farmId)
          .then(async farm => {

              await RefreshToken.destroy({where : {userId:user.id}});

              let refreshToken = await createRefreshToken(user,config.jwtRefreshExpiration);
              
              res.status(200)
              .send({
                id: user.id,
                username: user.username,
                farm : farm,
                accessToken: accessToken,
                refreshToken: refreshToken,
              });
          });

    });
};

exports.user = async (req,res) => {
    const user = await User.scope('withoutPassword').findAll({where : {farmId :req.farmId},
      include: [
       'farm'
      ]});
    return res.status(200).json(user)
}

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  const refreshToken = await RefreshToken.findAll({where :{ token: requestToken }});

  if (refreshToken.length === 0) {
    res.status(403).json({ message: "Refresh token is not in database!" });
    return;
  }

  if (verifyExpiration(refreshToken[0])) {
    await RefreshToken.destroy({where:{id:refreshToken[0].id}});
    res.status(403).json({
      message: "Refresh token was expired. Please make a new signin request",
    });
    return;
  }

  const user = await User.findByPk(refreshToken[0].userId);

  let newAccessToken = jwt.sign({ id: user.farmId }, config.secret, {
    expiresIn: config.jwtExpiration,
  });

  return res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: refreshToken.token,
  });
};

const createRefreshToken = async (user,exp) => {
  let expiredAt = new Date();
  expiredAt.setMilliseconds(
    expiredAt.getMilliseconds() + exp
  );
  
  const _token = uuidv4();

  const newRefreshToken = {
    token: _token,
    userId: user.id,
    expiryDate: expiredAt.getTime(),
  };

  let refreshToken = await RefreshToken.create(newRefreshToken);

  return refreshToken.token;
};

const verifyExpiration = (token) => {
  return token.expiryDate.getTime() < new Date().getTime();
}

const createMasterData = async (farm,t) => {
    const notiParams = [
      { code : 'REPRO_ESTRUST' ,name : 'การเป็นสัด', before: 7 , after: 7 , farmId : farm },
      { code : 'REPRO_MATING' ,name : 'การผสม', farmId : farm },
      { code : 'REPRO_CHECK' ,name : 'การตรวจท้อง', before: 5 , after: 5 ,farmId : farm },
      { code : 'BIRTH' ,name : 'การคลอด', before: 7 , after: 7 ,farmId : farm },
      { code : 'VACCINE_FMD' ,name : 'วัคซีนปากเท้าเปื่อย (FMD)',before: 15 , farmId : farm },
      { code : 'VACCINE_LS' ,name : 'วัคซีนลัมพีสกิน (LUMPY SKIN)',before: 15 , farmId : farm },
      { code : 'VACCINE_CDT' ,name : 'วัคซีนราดหลัง (CYDECTIN)',before: 7, farmId : farm },
      { code : 'VACCINE_BIO' ,name : 'ยาบำรุง (BIO)',before: 3, farmId : farm },
      { code : 'VACCINE_IVOMEC' ,name : 'ยาฆ่าพยาธิโคท้อง (IVOMEC)', farmId : farm },
    ]

    await NotiParam.bulkCreate(notiParams,{transaction:t});

    const vaccines = [
      { code : 'VACCINE_FMD',frequency: 6,name:'ปากเท้าเปื่อย (FMD)',remark:'แจ้งเตือน 15 วัน ก่อนถึงวันที่กำหนด',farmId: farm},
      { code : 'VACCINE_LS',frequency: 6,name:'ลัมพีสกิน (LUMPY SKIN)',remark:'แจ้งเตือน 15 วัน ก่อนถึงวันที่กำหนด',farmId: farm},
      { code : 'VACCINE_CDT',frequency: 2,name:'ราดหลัง (CYDECTIN)',remark:'แจ้งเตือน 7 วัน ก่อนถึงวันที่กำหนด',farmId: farm},
      { code : 'VACCINE_BIO',frequency: 1,name:'ยาบำรุง (BIO)',remark:'แจ้งเตือน 3 วัน ก่อนถึงวันที่กำหนด',farmId: farm},
      { code : 'VACCINE_IVOMEC',frequency: 0,name:'ยาฆ่าพยาธิโคท้อง (IVOMEC)',remark:'แจ้งเตือนเมื่ออายุครรภ์ครบ 5,6 และ 7 เดือน',farmId: farm},
    ]

    await Vaccine.bulkCreate(vaccines,{transaction:t});

    const param = {
      code : 'RAW_MILK',
      group : 'PRICE',
      name : 'ราคาน้ำนมดิบ/กก.',
      valueNumber : 20.5,
      farmId : farm
    }

    await Param.create(param,{transaction:t})
}
