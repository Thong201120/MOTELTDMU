var express = require('express');
var router = express.Router();

const AdminCtrl = require('../controllers/admin.controller');

router
    .get(
        '/qlbaidang/:page',
        isAdmin,
        AdminCtrl.qlbaidang
    )
    .get(
        '/qlthanhvien/:page',
        isAdmin,
        AdminCtrl.qlthanhvien
    )
    .get(
        '/ban-member/:id',
        AdminCtrl.banMember
    )
    .get(
        '/unban-member/:id',
        AdminCtrl.unbanMember
    )

    .get(
        '/xemphanhoi/:page',
        isAdmin,
        AdminCtrl.xemphanhoi
    )

    .get(
        '/viewroom/:id',
        isAdmin,
        AdminCtrl.viewRoomID,
    )

    .get(
        '/viewprofile/:id',
        isAdmin,
        AdminCtrl.viewprofile,
    )

    .get(
        '/replycontact/:id',
        isAdmin,
        AdminCtrl.Reply,
    )

    .post(
        '/replycontact/:id',
        AdminCtrl.ReplyContact,
    )

    .get(
        '/addmember',
        isSuperUser,
        AdminCtrl.AddMemberPage,
    )

    .get(
        '/thongke/:page',
        isSuperUser,
        AdminCtrl.thongke,
    )

    .get(
        '/viewvipinfo/:userid/:page',
        isAdmin,
        AdminCtrl.viewvipinfo,
    )

    .post(
        '/addmember',
        isSuperUser,
        AdminCtrl.AddMember,
    )

    .get(
        '/delete-room/:id',
        isAdmin,
        AdminCtrl.deleteRoom,
    )
    
    .get(
        '/accept-room/:id',
        isAdmin,
        AdminCtrl.acceptRoom,
    )
    .get(
        '/reviewphanhoi/:page',
        isAdmin,
        AdminCtrl.reviewPhanhoi,
    )
module.exports = router;

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.permission >= 2) {
        return next();
    }
    res.redirect('/');
}

function isSuperUser(req, res, next) {
    if (req.isAuthenticated() && req.user.permission == 3) {
        return next();
    }
    res.redirect('/');
}