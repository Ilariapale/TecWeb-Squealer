const { bcrypt, usernameRegex, emailRegex, findUser, generateToken, generateGuestToken, verifyToken } = require("./utils");
const { Guest } = require("./schemas");
const uuidGen = require("uuid").v4;

module.exports = {
  login: async (options) => {
    const { username, password } = options; //Username can be both username or email

    if (!username || !password) {
      //username or password not provided
      return {
        status: 400,
        data: { error: `Both 'username' and 'password' must be specified.` },
      };
    }
    // Implementa qui la logica di verifica delle credenziali dell'utente
    // Ad esempio, verifica le credenziali con il database o un altro servizio di autenticazione
    if (emailRegex.test(username)) {
      return {
        status: 400,
        data: { error: `Login requires a username, not an email.` },
      };
    }
    if (!usernameRegex.test(username)) {
      //username not valid
      return {
        status: 400,
        data: { error: `'username' format is not valid.` },
      };
    }

    let user = await findUser(username);

    if (!user.data) {
      //user not found
      return {
        status: 404,
        data: { error: `Wrong credentials.` },
      };
    }
    const isPasswordValid = await bcrypt.compare(password, user.data.password);

    if (!isPasswordValid) {
      //password not valid
      return {
        status: 401,
        data: { error: `Wrong credentials.` },
      };
    }
    const token = generateToken(user.data); // Funzione per generare il token JWT (da implementare)
    return {
      status: 200,
      data: { token },
    };
  },

  refreshToken: async (options) => {
    const { token } = options;
    if (!token) {
      return {
        status: 400,
        data: { error: `No token provided.` },
      };
    }
    const decoded = verifyToken(token); // Funzione per verificare il token JWT (da implementare)
    if (!decoded) {
      return {
        status: 401,
        data: { error: `Invalid token.` },
      };
    }
    const user = await findUser(decoded.username);
    if (!user.data) {
      return {
        status: 404,
        data: { error: `User not found.` },
      };
    }
    //controllo se il token sta per scadere
    const tokenExpiration = decoded.exp;
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = tokenExpiration - now;
    if (timeLeft <= 60 * 30) {
      const newToken = generateToken(user.data); // JWT Token generator function
      return {
        status: 200,
        data: { token: newToken },
      };
    } else {
      return {
        status: 200,
        data: { token: token },
      };
    }
  },

  login_guest: async (options) => {
    //User has no credentials and is assigned a random uuid
    let { uuid } = options;
    let guest;

    if (!uuid) {
      uuid = uuidGen();
      guest = new Guest({
        uuid: uuid,
        created_at: Date.now(),
        last_login: Date.now(),
      });
    } else {
      guest = await Guest.findOne({ uuid: uuid });
      if (!guest) {
        guest = new Guest({
          uuid: uuid,
          created_at: Date.now(),
          last_login: Date.now(),
        });
      } else {
        guest.last_login = Date.now();
      }
    }
    await guest.save();
    const token = generateGuestToken({ uuid: guest.uuid, reacted_to: guest.reacted_to });
    return {
      status: 200,
      data: { token },
    };
  },
};
