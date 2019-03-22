const jwtStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;
//Strategy is the rules by virtue of which the passport module will authenticate the user.
// The ExtractJWT module will extract the Information to be used for authentication.

//Use of Tokens:
//When the User tries, to Authenticate, and when the Credentials match, the Server responds the Authentication 
// with a Token, which the Server generates for a particular amount of time. This is how a Session is established.
// Then, this token is saved in the Browser Cache of the Client.
// next, whenever the Client wants to make any request to the Server,( to the routes which are available after login), the Server
// will ask for a Token.
// This token must match with the Token sent by the Server.
// If it doesnt, the User must be requested to Login once again.
// All this is taken care of by the Passport Middleware.
// http://www.dotnetcurry.com/nodejs/1302/nodejs-token-based-authentication-security 

const User = require('../models/user');
const config = require('../config/database');

module.exports = function(passport)
{
    let opts = {};
    opts.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secret;
    passport.use(new jwtStrategy(opts,function(jwt_payload,done) 
    {
        console.log(jwt_payload);
        User.getUserById(jwt_payload.id,function(err,user)
        {
            if(err)
            {
                return done(err,false);
            }
            if(user)
            {
                return done(null,user);
            }
            else
            {
                return done(null,false);
            }

        });
    }));
};