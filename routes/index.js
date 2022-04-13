var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');

const HomeCtrl = require('../controllers/home.controller');

/* GET home page. */
router
    .get(
        '/',
        HomeCtrl.index
    )

    .get(
        '/login',
        notLoggedIn,
        HomeCtrl.login
    )
    
    .get(
        '/quytac',
        HomeCtrl.quytac
    )

    .post(
        '/login',
        passport.authenticate('local-login', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true
        })
    )

    .get(
        '/about',
        HomeCtrl.about
    )

    .get(
        '/register',
        notLoggedIn,
        HomeCtrl.register
    )

    .post(
        '/register',
        passport.authenticate('local-signup', {
            successRedirect: '/',
            failureRedirect: '/register',
            failureFlash: true
        })
    )

    .get(
        '/logout', 
        (req, res) => {
            req.logout();
            res.redirect('/');
        }
    )

    // .get(
    //     '/motel',
    //     HomeCtrl.motelPage
    // )


    .get(
        '/motel/:page',
        HomeCtrl.motel
    )


    .get(
        '/intro-pay',
        isLoggedIn,
        HomeCtrl.introPay
    )

    .get(
        '/contact',
        isLoggedIn,
        HomeCtrl.contactPage
    )

    .post(
        '/contact',
        HomeCtrl.contact
    )

    .get(
        '/viewroom/:id',
        HomeCtrl.viewroom,
    )

    .get(
        '/viewprofile/:id',
        HomeCtrl.viewprofile,
    )

    .get(
        '/reset-password',
        HomeCtrl.resetPasswordPage
    )

    .post(
        '/reset-password',
        HomeCtrl.resetPassword
    )

    .get(
        '/change-password',
        isLoggedIn,
        HomeCtrl.changePasswordPage
    )

    .get(
        '/booking-room',
        isLoggedIn,
        HomeCtrl.bookingroomPage
    )

    .post(
        '/booking-room',
        isLoggedIn,
        HomeCtrl.bookingroom
    )

    .get(
        '/vipinfo/:page',
        isLoggedIn,
        HomeCtrl.vipinfo
    )

    .post('/change-password',
    
        HomeCtrl.changePassword
    )


    .get('/getnew-password/:token',
        HomeCtrl.getnewPasswordPage
    )

    .post('/getnew-password/:token',
        HomeCtrl.getnewPassword
    )

    .get(
        '/auth/facebook',
        passport.authenticate('facebook')
    )

    .get('/profile',
        isLoggedIn,
        HomeCtrl.profilePage)

    .post('/profile',
    HomeCtrl.profile)


    

    .get(
        '/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/'
        })
    )

    .get(
        '/auth/google', 
        passport.authenticate('google', {
            scope: [
            'profile', 
            'email'
            ]
        })
    )

    .get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/'
        }))

    
module.exports = router;


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        res.redirect('/');
    return next();
}