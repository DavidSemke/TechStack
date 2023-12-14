const bcrypt = require('bcryptjs')
const User = require("../models/user");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const ents = require('./htmlEntities')

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const filter = { username: username }
        ents.encodeObject(filter)
        const user = await User
            .findOne(filter)
            .exec();

        if (!user) {
            return done(
                null, 
                false, 
                { message: "Incorrect username or password." }
            );
        };

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return done(
                null, 
                false, 
                { message: "Incorrect username or password." }
            )
        }
        
        return done(null, user);
    } 
    catch(err) {
        return done(err);
    };
}));
  
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } 
    catch(err) {
        done(err);
    };
});

module.exports = passport