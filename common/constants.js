exports.MONGODB_CONFIG = {
  uri: "mongodb+srv://anhhk101:hoanganh123@cluster0.0mo8vfp.mongodb.net/?retryWrites=true&w=majority",
  options: {
    useNewUrlParser: true,
    maxPoolSize: 10,
  },
};

exports.MAIL_AUTH = {
  email: "blackwolfiiooo@gmail.com",
  password: "cxckdhwifosiiaml",
};

exports.JWT_CONFIG = {
  TOKEN_KEY: "car#sharing@secret",
  TOKEN_LIFE_TIME: "1d",
  REFRESH_TOKEN_KEY: "refresh#key@scr_token",
  REFRESH_TOKEN_LIFE_TIME: "3d",
};

exports.FALSE_COUNT = 5;

exports.JWT_EXCEPTION = {
  EXPIRED: "TokenExpiredError",
};

exports.DEFAULT_AVATAR = "";
