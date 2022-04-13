var UserModel = require('../models/user.model');
var PostModel = require('../models/motel.model');
var ContactModel = require('../models/contact.model');
var ReplyModel = require('../models/reply.model');
const bcrypt = require('bcrypt');

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

const crypto = require('crypto')
const async = require('async');
const querystring = require('querystring');
const nodemailer = require('nodemailer')
const regexp = require('regexp')
const replyModel = require('../models/reply.model');
const VipTimeLineModel = require('../models/viptimeline.model');
class AdminController {
    static async qlbaidang(req, res) {
        let perPage = 10;
        let page = req.params.page || 1;
        var keyword = req.query.keyword;
        if (keyword != null)
        {
            const regex = new RegExp(escapeRegex(keyword), 'gi');
            PostModel.find({userstatus: 1, $or: [{wards: regex}, {description: regex}, {title: regex}]})
            .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, listroom) => {
                PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                if (err) return next(err);
                console.log('đây nè')

                res.render('admin/qlbaidang', { title: 'Quản lý bài đăng', page_name: 'qlbaidang', user: req.user, keyword,  listroom, current: page, pages: Math.ceil(count/ perPage) });
          });
        });;
        }
        else
        {
        try {
            PostModel.find({userstatus: 1}).sort({time: -1}).skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, listroom) => {
                console.log(listroom)
                PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                if (err) return next(err);  
                res.render('admin/qlbaidang', { title: 'Quản lý bài đăng', page_name: 'qlbaidang', user: req.user, keyword, listroom, current: page, pages: Math.ceil(count/ perPage) });

            });
          });
        } catch {
            res.status(500).send(exception);
        }
    }
    }

    static async AddMemberPage(req, res, next) {
        try {
            res.render('admin/addmember', { title: 'Thêm quản trị viên', page_name: 'addmember', user: req.user,  messages: req.flash('fail') });
        } catch {
            res.status(500).send(exception);
        }
    }

    static async viewRoomID(req, res, next) {
        try {
            var listPostID = await PostModel.findOne({_id: req.params.id});
            var userPost = await UserModel.findOne({_id: listPostID.userid})
            res.render('admin/viewroom', {
                page_name: 'viewroom',
                title: 'Chi tiết bài đăng',
                userPost: userPost,
                listPostID: listPostID,
                user: req.user,
            });
        }
        catch (e) {
            res.status(200).send('Error manager!');
        }
    }
//{$or: [{roomType: new RegExp(keyword)}, {wards: new RegExp(keyword)}, {description: new RegExp(keyword)}, {title: new RegExp(keyword)}]}
    static async qlthanhvien(req, res) {
        let perPage = 10;
        let page = req.params.page || 1;
        var keyword = req.query.keyword;
        if (req.user.permission == 2) {   
            if (keyword != null)
            {
                const regex = new RegExp(escapeRegex(keyword), 'gi');
                UserModel.find( {$or: [{name: regex}, {email: regex}, {phoneNumber: regex}]})
                .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
                .limit(perPage)
                .exec((err, listuser) => {
                    UserModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                    if (err) return next(err);
                    console.log('đây nè')

                    res.render('admin/qlthanhvien', { title: 'Quản lý thành viên', page_name: 'qlthanhvien', user: req.user, listuser, keyword, current: page, pages: Math.ceil(count/ perPage)  });
            });
            });;
            }
            else{
            try {
                const regex = new RegExp(escapeRegex(keyword), 'gi');
                UserModel.find({$or: [{name: regex}, {email: regex}, {phoneNumber: regex}]})
                .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
                .limit(perPage)
                .exec((err, listuser) => {
                    UserModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                    if (err) return next(err);  
                    res.render('admin/qlthanhvien', { title: 'Quản lý thành viên', page_name: 'qlthanhvien', user: req.user, listuser, keyword, current: page, pages: Math.ceil(count/ perPage)  });
    
                });
              });  
            } catch {
                res.status(500).send(exception);
            }}
        }
        else {
            if (keyword != null)
            {
                const regex = new RegExp(escapeRegex(keyword), 'gi');
                UserModel.find({$or: [{name: regex}, {email: regex}, {phoneNumber: regex}]})
                .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
                .limit(perPage)
                .exec((err, listuser) => {
                    UserModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                    if (err) return next(err);
                    console.log('đây nè')

                    res.render('admin/qlthanhvien', { title: 'Quản lý thành viên', page_name: 'qlthanhvien', user: req.user, listuser, keyword, current: page, pages: Math.ceil(count/ perPage)  });
            });
            });;}
            else {
            try {
                UserModel.find()
                .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
                .limit(perPage)
                .exec((err, listuser) => {
                    UserModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                    if (err) return next(err);  
                    res.render('admin/qlthanhvien', { title: 'Quản lý thành viên', page_name: 'qlthanhvien', user: req.user, listuser,keyword, current: page, pages: Math.ceil(count/ perPage)  });
                });
              });  
            } catch {
                res.status(500).send(exception);
            }
        }
        }
        
    }

    static async viewprofile(req, res) {
        try {
            var userPost = await UserModel.findOne({_id: req.params.id})
            console.log(userPost)  
            res.render('admin/viewprofile', {
                userPost: userPost,
                title: "Thông tin chủ trọ",
                page_name: 'viewprofile',
                user: req.user,                
            });
        }
        catch (e) {
            res.status(200).send('Error manager!');
        }
    }

    static async Reply(req, res) {
        try {
            
            var contact = await ContactModel.findOne({userid: req.params.id})
            console.log(req.params.id)
            res.render('admin/replycontact', {
                contact: contact,
                title: "Trả lời phản hồi",
                page_name: 'replycontact',
                user: req.user,   
                messages: req.flash('fail'), 
                success: req.flash('success')              
            });
        }
        catch (e) {
            res.status(200).send('Error manager!');
        }
    }

    static async ReplyContact(req, res) {
        let title = req.body.subject;
        let content = req.body.message;
        var url = "/admin/replycontact/" + req.params.id
        console.log(url)
        if (title === "" || content === "") {
            req.flash('fail', 'Vui lòng điền đầy đủ các trường!');
            return res.redirect(url);
        }   
        console.log("Khúc này nè")
        console.log(req.user.id);
        console.log(req.params.id)
        var contact = await ContactModel.findOne({id: req.params.id})
        var replyAdmin = new replyModel();                                                  
        replyAdmin.title = title;
        replyAdmin.content = content;
        replyAdmin.adminid = req.user.id;
        replyAdmin.userid = req.params.id;
        console.log('contact nè:')
        console.log(contact)
        replyAdmin.save();
        var userPost = await UserModel.findOne({_id: contact.userid})
        console.log(req.params.id)
        console.log(userPost)
        async.waterfall([
            function (user, done) {
                var smtpTransport = require('nodemailer-smtp-transport')
                var smtpTransport = nodemailer.createTransport(smtpTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'doanchuyennganh02@gmail.com',
                        pass: '1234@doan'
                    }
                }));
                var mailOptions = {
                    to: userPost.local.email,
                    from: 'doanchuyennganh02@gmail.com',
                    subject: 'Phản hồi từ TDMU - Motel: ' + title,
                    text: 'Xin chào ' + userPost.local.name + ' ,\n\n' +
                        'Đây là trả lời của chúng tôi về phản hồi của bạn: ' + content + '.\n'
                };
                smtpTransport.sendMail(mailOptions)
                ContactModel.findOne({_id: req.params.id}, (err, doc) => {
                    doc.status = 1;
                    doc.save(); 
                });
               
                return res.redirect('/admin/xemphanhoi');
            }
        ], function (err) {
            
        });
    }

    static async banMember(req, res, next) {
        var userID = req.params.id;
        await UserModel.findOne({ _id: userID }, (err, doc) => {
            doc.status = 1;
            doc.save();
            res.redirect('/admin/qlthanhvien');
        });
    }

    static async unbanMember(req, res, next) {
        var userID = req.params.id;
        await UserModel.findOne({ _id: userID }, (err, doc) => {
            doc.status = 0;
            doc.save();
            res.redirect('/admin/qlthanhvien');
        });
    }

    static async xemphanhoi(req, res, next) {
        let perPage = 10;
        let page = req.params.page || 1;
        var keyword = req.query.keyword;
        if (keyword != null)
        {
            const regex = new RegExp(escapeRegex(keyword), 'gi');
            ContactModel.find({$or: [{title: regex}, {content: regex}, {name: regex}]})
            .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, listcontact) => {
                ContactModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                if (err) return next(err);
                console.log('đây nè')

                res.render('admin/xemphanhoi', { title: 'Phản hồi từ thành viên', page_name: 'xemphanhoi', keyword, user: req.user, listcontact, current: page, pages: Math.ceil(count/ perPage) });
            });
        });;
        }
        else {
        try {
            ContactModel.find().skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, listcontact) => {
                ContactModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                if (err) return next(err);  
                res.render('admin/xemphanhoi', { title: 'Phản hồi từ thành viên', page_name: 'xemphanhoi', keyword, user: req.user, listcontact, current: page, pages: Math.ceil(count/ perPage) });
            });
          }); 
        } catch {
            res.status(500).send(exception);
        }
    }
    }

    static async thongke(req, res, next) {
        let perPage = 10;
        let page = req.params.page || 1;
        var keyword = req.query.keyword;
        if (keyword != null)
        {
            UserModel.find({$or: [{name: new RegExp(keyword)}]})
            .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, listuser) => {
                UserModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                let sum = 0;

                for (let i = 0; i < listuser.length; i++) {
                    sum += listuser[i].money;
                }
                if (err) return next(err);
                console.log('đây nè')

                res.render('admin/thongke', { title: 'Thống kê doanh thu', page_name: 'thongke', keyword, user: req.user, listuser, sum,  current: page, pages: Math.ceil(count/ perPage) });
            });
        });;
        }
        try {
            UserModel.find({money: {$gt: 10000}}).skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, listuser) => {
                ContactModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                if (err) return next(err); 
                let sum = 0;

                for (let i = 0; i < listuser.length; i++) {
                    sum += listuser[i].money;
                }
                console.log(sum); 
                res.render('admin/thongke', { title: 'Thống kê doanh thu', page_name: 'thongke', keyword, user: req.user, listuser, sum,  current: page, pages: Math.ceil(count/ perPage) });
            });
          }); 
        } catch {
            res.status(500).send(exception);
        }
    }

    static async viewvipinfo(req, res) {
        var name = req.user.name;
        let perPage = 10;
        let page = req.params.page || 1;
        let pageid = req.params.userid;
        var uservip = await UserModel.findOne({_id: req.params.userid})
        console.log('user:')
        console.log(uservip.name)
        console.log('req.params.userid')
        console.log(req.params.userid)
        try {
        VipTimeLineModel.find({ userid: req.params.userid}).sort({time: -1}).skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        .limit(perPage)
        .exec((err, listvip) => {
            console.log('listvip: ')
            console.log(listvip)
            VipTimeLineModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
            if (err) return next(err);  
            res.render('admin/viewvipinfo', { title: 'Chi tiết tài khoản VIP', page_name: 'viewvipinfo', name, pageid, user: req.user, uservip,  listvip, current: page, pages: Math.ceil(count/ perPage)});
        });
      });  
        } catch {
            res.status(500).send(exception);
        }
    }

    static async reviewPhanhoi(req, res, next) {
        let perPage = 10;
        let page = req.params.page || 1;
        var keyword = req.query.keyword;
        if (keyword != null)
        {
            const regex = new RegExp(escapeRegex(keyword), 'gi');
            ReplyModel.find({$or: [{title: regex}, {content: regex}]})
            .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, listreply) => {
                ReplyModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                if (err) return next(err);
                console.log('đây nè')

                res.render('admin/reviewphanhoi', { title: 'Xem lại các phản hồi cho thành viên', page_name: 'reviewphanhoi', keyword,  user: req.user, listreply, current: page, pages: Math.ceil(count/ perPage)});
            });
        });;
        }
        else{
        try {
        ReplyModel.find().sort({time: -1}).skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        .limit(perPage)
        .exec((err, listreply) => {
            ContactModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
            if (err) return next(err);  
            res.render('admin/reviewphanhoi', { title: 'Xem lại các phản hồi cho thành viên', page_name: 'reviewphanhoi', keyword, user: req.user, listreply, current: page, pages: Math.ceil(count/ perPage)});
        });
      });  
            
        } catch {
            res.status(500).send(exception);
        }
    }
    }

    static async AddMember(req, res) {
        let email = req.body.email;
        let newpassword = req.body.password;
        let phone = req.body.phone; 
        let name = req.body.username;
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        // hash password
        let password = bcrypt.hashSync(newpassword, bcrypt.genSaltSync(8), null)
      
            
        if (email === "" || newpassword === "" || phone === "" || name === "") {
            req.flash('fail', 'Vui lòng điền đầy đủ các trường!');
            return res.redirect('/admin/addmember');
        }   

        if (newpassword.length < 8) {
            req.flash('fail', 'Mật khẩu phải có độ dài tối thiểu 8 ký tự!');
            return res.redirect('/admin/addmember');
        }
        var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
                    
        if (vnf_regex.test(phone) == false) 
            {
            req.flash('fail', 'Số điện thoại không đúng định dạng!');
            return res.redirect('/admin/addmember');
        } 
        if (!filter.test(email)) { 
            req.flash('fail', 'Email không đúng định dạng!');
            return res.redirect('/admin/addmember');
        }                                            
        var User = new UserModel();
        User.local.email = email;
        User.phoneNumber = phone;
        User.permission = 2;
        User.local.password = password;
        User.local.name = name;
        User.name = name;
        User.email = email;
        
        User.save();
        res.redirect("/admin/qlthanhvien/1");
    }// ngon tim sua
    static async deleteRoom(req, res, next) {
        
        var postID = req.params.id;
        ;
        var postModel = await PostModel.findOne({ _id: postID })
        if (postModel.status == 1)
        {
            var user = await UserModel.findOne({_id: postModel.userid})
            user.countPost = user.countPost - 1
            user.save();
        }
        await PostModel.deleteOne({_id: postID})
        res.redirect('/admin/qlbaidang/1');
    }
    //duyệt bài
    static async acceptRoom(req, res, next) {
        var postID = req.params.id;
        var postModel = await PostModel.findOne({ _id: postID })
        var user = await UserModel.findOne({_id: postModel.userid})
            user.countPost = user.countPost + 1
            user.save();
            postModel.status = 1
            postModel.save();
            res.redirect('/admin/qlbaidang/1')
        
    }
}
module.exports = AdminController;