const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../models/user.model");
const VipTimeLineModel = require("../models/viptimeline.model");
const configAuth = require("../config/auth");
const MotelModel = require("../models/motel.model");
const bcrypt = require('bcrypt')
const { spawn } = require('child_process');
module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // SIGNUP LOCAL
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        fullnameField: "name",
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },

      function (req, email, password, done) {
        process.nextTick(function () {
          User.findOne({ "local.email": email }, function (err, user) {

            if (err) return done(err);
            if (user) {
              return done(
                null,
                false,
                req.flash("signupMessage", "Email này đã được sử dụng!")
              );
            }
            if (password.length < 8) {
              return done(
                null,
                false,
                req.flash("signupMessage", "Mật khẩu phải dài tối thiểu 8 ký tự!")
              );
            }
            else {
              var newUser = new User();
              newUser.local.name = req.body.fullname;
              newUser.name = req.body.fullname;
              newUser.local.email = email;
              newUser.email = email;
              newUser.local.password = newUser.generateHash(password);
              newUser.save(function (err) {
                if (err) throw err;
                return done(null, newUser);
              });
            }
          });
        });
      }
    )
  );

  // LOGIN LOCAL
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        
        User.findOne({ "local.email": email }, function (err, user) {
          if (err) return done(err);
          if (!user)
            return done(
              null,
              false,
              req.flash(
                "loginMessage",
                "Email không tồn tại!"
              )
            );
          if (!user.validPassword(password))
            return done(
              null,
              false,
              req.flash(
                "loginMessage",
                "Mật khẩu không chính xác!"
              )
            );
            if (user.status == 1)
            {
              return done(
                null,
                false,
                req.flash("loginMessage", "Tại khoản đang tạm khóa!")
              );
            }
          console.log('================') 
          console.log(user)  
          if (user.permission == 1)
          {
            console.log('endtime-------')
            console.log(user.id)
            VipTimeLineModel.find({userid: user.id}).sort({time: - 1})
            .exec((err, listvip) => {
              var endtime = listvip[listvip.length -1].endtime;
              var d = new Date();
              var millisBetween = endtime.getTime() - d.getTime();
              var days = millisBetween / (1000 * 3600 * 24);
          
              var count = Math.round(days);
              if (count <= 0)
              {
                user.permission = 0;
                user.save();
                MotelModel.find({userid: user.id}
                  ,(err, listroom) => {
                    console.log(listroom)
                    for (var i = 0; i < listroom.length; i++)
                    {
                      listroom[i].status = 0;
                      listroom[i].userstatus = 0;
                      console.log('note');
                      console.log(listroom[i].status);
                      listroom[i].save();
                    }
                    
                });
              }  
          });  
         }
          return done(null, user);
        });
      }
    )
  );

  //CHANGE PASS LOCAL
  // passport.use(
  //   "local-changepass",
  //   new LocalStrategy(
  //     {
  //       currentpasswordField: "currentpassword",
  //       newpasswordField: "newpassword",
  //       reenterpasswordField: "reenterpassword",
  //       usernameField: "email",
  //       passReqToCallback: true,
  //     },
  //     function (req, currentpassword, newpassword, reenterpassword, done) {
  //       User.findOne({ "local.email": email }, function (err, user) {
  //         if (!user.validPassword(password))
  //           return done(
  //             null,
  //             false,
  //             req.flash(
  //               "changeMessage",
  //               "Mật khẩu hiện tại không chính xác!"
  //             )
  //           );
  //           if (newpassword != reenterpassword) {
  //           return done(
  //             null,
  //             false,
  //             req.flash(
  //               "changeMessage",
  //               "Mật khẩu mới và nhập lại mật khẩu mới không khớp!"
  //             )
  //           );}
  //           else {
  //             var currentPassword = req.body.currentpassword;
  //             var newPassword = req.body.newpassword;
  //             var currentPassword = req.body.reenterpassword;
  //             var hashpass =  bcrypt.hash(newPassword, 10);
  //             User.findOne({_id: req.user._id}, (err, doc) => {
  //                 doc.local.password = hashpass;
  //                 doc.save();
  //             });
  //       }
  //         return done(null, user);
  //       });
  //     }
  //   )
  // );

  // FACEBOOK LOGIN
  passport.use(
    new FacebookStrategy(
      {
        // pull in our app id and secret from our auth.js file
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
      },

      // facebook will send back the token and profile
      (token, refreshToken, profile, done) => {
        // asynchronous
        process.nextTick(() => {
          // find the user in the database based on their facebook id
          User.findOne(
            {
              "facebook.id": profile.id,
            },
            (err, user) => {
              // if there is an error, stop everything and return that
              // ie an error connecting to the database
              if (err) return done(err);

              // if the user is found, then log them in
              if (user) {
                return done(null, user); // user found, return that user
              } else {
                // if there is no user found with that facebook id, create them
                var newUser = new User();

                // set all of the facebook information in our user model
                newUser.facebook.id = profile.id; // set the users facebook id
                newUser.facebook.token = token; // we will save the token that facebook provides to the user
                newUser.name = profile.displayName; // look at the passport user profile to see how names are returned

                // save our user to the database
                newUser.save((err) => {
                  if (err) throw err;

                  // if successful, return the new user
                  return done(null, newUser);
                });
              }
            }
          );
        });
      }
    )
  );

  // GOOGLE LOGIN
  passport.use(
    new GoogleStrategy(
      {
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
      },
      function (token, refreshToken, profile, done) {
        process.nextTick(function () {
          // // tìm trong db xem có user nào đã sử dụng google id này chưa
          User.findOne({ "google.id": profile.id }, function (err, user) {
            if (err) return done(err);
            if (user) {
              // if a user is found, log them in
              return done(null, user);
            } else {
              // if the user isnt in our database, create a new user
              var newUser = new User();
              // set all of the relevant information
              newUser.google.id = profile.id;
              newUser.google.token = token;
              newUser.name = profile.displayName;
              newUser.email = profile.emails[0].value; // pull the first email
              // save the user
              newUser.save(function (err) {
                if (err) throw err;
                return done(null, newUser);
              });
            }
          });
        });
      }
    )
  );
};
