var express = require('express');
var router = express.Router();

const OwnerCtrl = require('../controllers/owner.controller');

router
    // Index cho phân quyền chủ trọ
    .get(
        '/addnewroom',
        isLoggedIn,
        OwnerCtrl.addnewroomPage
    )

    .post('/addnewroom',
        OwnerCtrl.addNewRoom
    )

    .get(
        '/listroom/:page',
        isLoggedIn,
        OwnerCtrl.listroom
    )

    .get(
        '/delete-room/:id',
        isLoggedIn,
        OwnerCtrl.deleteRoom
    )

    .get(
        '/uploadImage/:id',
        isLoggedIn,
        OwnerCtrl.uploadImage
    )

    .get(
        '/editroom/:id',
        isLoggedIn,
        OwnerCtrl.viewRoomID,
    )

    .post(
        '/editroom/:id',
        OwnerCtrl.updateRoomID,
    )

    .get(
        '/roominfo',
        isLoggedIn,
        OwnerCtrl.roominfo
    )

    

    // .post('/room-info',
    //     OwnerCtrl.roomInfo
    // )

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