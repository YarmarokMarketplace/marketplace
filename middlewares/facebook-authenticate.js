const facebookPassport = require("passport");
const { Strategy } = require("passport-facebook");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");

const { User } = require("../db/models/users");

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, BASE_URL } = process.env;

const facebookParams = {
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: `${BASE_URL}/api/auth/facebook/callback`,
    //passReqToCallback: true,
};

const facebookCallback = async(accessToken, refreshToken, profile, done) => {
    try {
        const {email, displayName} = profile;
        const user = await User.findOne({email});
        if(user) {
            return done(null, user); // req.user = user;
        }
        const password = await bcrypt.hash(nanoid(), 10);
        const newUser = await User.create({email, password, name: displayName});
        done(null, newUser);
    }
    catch(error) {
        done(error, false);
    }
}

const facebookStrategy = new Strategy(facebookParams, facebookCallback);

facebookPassport.use("facebook", facebookStrategy);

module.exports = facebookPassport;