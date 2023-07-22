const mongoose = require("mongoose");
const { Notification, User, Squeal, Channel, Keyword } = require("./schemas");
const {
  jwt,
  bcrypt,
  usernameRegex,
  channelNameRegex,
  officialChannelNameRegex,
  keywordRegex,
  mongooseObjectIdRegex,
  emailRegex,
  findUser,
  findSqueal,
  findChannel,
  findKeyword,
  findNotification,
  generateToken,
  verifyToken,
} = require("./utils");

module.exports = {
  // Funzione di login

  login: async (options) => {
    const { username, password } = options; //Username can be both username or email

    if (!username || !password) {
      //username or password not provided
      return {
        status: 400,
        data: { error: "Username or password not provided." },
      };
    }
    // Implementa qui la logica di verifica delle credenziali dell'utente
    // Ad esempio, verifica le credenziali con il database o un altro servizio di autenticazione
    if (emailRegex.test(username)) {
      return {
        status: 400,
        data: { error: "Login require a username, not an email." },
      };
    }
    if (!usernameRegex.test(username)) {
      //username not valid
      return {
        status: 400,
        data: { error: "Username not valid." },
      };
    }

    let user = await findUser(username);

    if (!user.data) {
      //user not found
      return {
        status: 404,
        data: { error: "wrong credentials" },
      };
    }
    const isPasswordValid = await bcrypt.compare(password, user.data.password);

    if (!isPasswordValid) {
      //password not valid
      return {
        status: 401,
        data: { error: "wrong credentials" },
      };
    }
    const token = generateToken(username); // Funzione per generare il token JWT (da implementare)
    return {
      status: 200,
      data: { token },
    };
  },
};
