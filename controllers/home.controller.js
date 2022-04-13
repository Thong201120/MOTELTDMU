const UserModel = require('../models/user.model');
const ContactModel = require('../models/contact.model');
var PostModel = require('../models/motel.model');
var BookingModel = require('../models/booking.model');
var VipTimeLineModel = require('../models/viptimeline.model');
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const async = require('async');
const querystring = require('querystring');
const nodemailer = require('nodemailer')
const regexp = require('regexp')

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file);
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/gif") {
            cb(null, true)
        } else {
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("Image");

class HomeController {
    static async index(req, res) {
        try {
            var listroom = await PostModel.find({status: 1});
            res.render('index', { title: 'Trang chủ', page_name: 'index', user: req.user, listroom: listroom });
        } catch (exception) {
            res.status(500).send(exception);
        }
    }

    static login(req, res) {
        try {
            res.render('login', { title: 'Đăng nhập', page_name: 'login', messages: req.flash('loginMessage') });
        } catch (exception) {
            res.status(500).send(exception);
        }
    }

    static quytac(req, res) {
        try {
            res.render('quytacdangbai', { title: 'Quy tắc đăng bài', page_name: 'quytac'});
        } catch (exception) {
            res.status(500).send(exception);
        }
    }

    static about(req, res) {
        try {
            res.render('about', { title: 'Giới thiệu', page_name: 'about', user: req.user });
        } catch {
            res.status(500).send(exception);
        }
    }

    static register(req, res) {
        try {
            res.render('register', { title: 'Đăng ký', page_name: 'register', messages: req.flash('signupMessage') });
        } catch {
            res.status(500).send(exception);
        }
    }

    


    // static motelPage(req, res) {
    //     try {
    //         var listroom = await PostModel.find({});
    //         res.render('motel', { title: 'Phòng trọ', page_name: 'motel', listroom: listroom});
    //     } catch {
    //         res.status(500).send(exception);
    //     }
    // }



    static async motel(req, res) {
        let perPage = 10;
        let page = req.params.page || 1;
        

        var keyword = req.query.keyword;
        if (keyword != null)
        {
            const regex = new RegExp(escapeRegex(keyword), 'gi');
            PostModel.find({$or: [{roomType: regex}, {wards: regex}, {description: regex}, {cost: regex},  {title: regex}]})
            .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, products) => {
                PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                if (err) return next(err);
                console.log('đây nè')
                console.log(keyword)
                console.log(products)
                res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, products: products, keyword: keyword, current: page, pages: Math.ceil(count / perPage)});
          });
        });;
        }
        // else if (roomType != null || wards != null || cost != null)
        // {
        //     if (roomType == null) 
        //     {
        //         roomType = ''
        //     }
        //     if (wards == null)
        //     {
        //         wards = ''
        //     }
        //     if (cost == null)
        //     {
        //         cost = ''
        //     }
        //     const regex2 = new RegExp(escapeRegex(roomType + ' ' + wards + ' ' + cost), 'gi');
        //     console.log(roomType + ' ' + wards + ' ' + cost)
        //     PostModel.find({roomType: regex2})
        //     .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        //     .limit(perPage)
        //     .exec((err, products) => {
        //         console.log('----==----')
        //         console.log(products)
        //         PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
        //         if (err) return next(err);
        //         console.log('đây nè')
                
        //         console.log(keyword)
        //         if (products == undefined)
        //         {
        //             var products = []
        //         }
        //         res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, products: products, roomType: roomType, wards: wards, cost: cost, keyword: keyword, current: page, pages: Math.ceil(count / perPage), messages: req.flash('fail')});
        //   });
        // });;
        //Chổ để ghi chú phía dưới
            // if (cost === "Dưới 1 triệu")
            // {
            //    PostModel.find({$and: [{roomType: roomType}, {wards: wards}, {cost: {$lt: 1000000}}]}).skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            //    .limit(perPage)
            //    .exec((err, products) => {
            //        PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
            //        if (err) return next(err);
            //        console.log(products)
            //        res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, products: products, roomType: roomType, wards: wards, cost: cost, keyword: keyword, current: page, pages: Math.ceil(count / perPage), messages: req.flash('fail')});
            //      });
            //    });
            // }
            // else if (cost === "Từ 1 triệu đến 1,5 triệu")
            // {
            //     PostModel.find({$and: [{roomType: roomType}, {wards: wards}, {cost: {$gte: 1000000, $lte: 1500000}}]}).skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            //     .limit(perPage)
            //     .exec((err, products) => {
            //         PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
            //         if (err) return next(err);
            //         console.log(products)
            //         res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, products: products, roomType: roomType, wards: wards, cost: cost, keyword: keyword, current: page, pages: Math.ceil(count / perPage), messages: req.flash('fail')});
            //       });
            //     });
            // }
            // else if (cost === "Trên 1,5 triệu")
            // {
            //     await PostModel.find({$and: [{roomType: roomType}, {wards: wards}, {cost: {$gt: 1500000}}]}).skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            //     .limit(perPage)
            //     .exec((err, products) => {
            //         PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
            //         if (err) return next(err);
            //         console.log(products)
            //         res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, products: products, roomType: roomType, wards: wards, cost: cost, keyword: keyword, messages: req.flash('fail')});
            //       });
            //     });
            // }
            // else {
            //     var products = []
            //     res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, products: products, roomType: roomType, wards: wards, cost: cost, keyword: keyword, current: page, pages: 1, messages: req.flash('fail')});
            // }  
           
        // }
        else {
            console.log('đây nè 2')
            PostModel.find().skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, products) => {
                PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                if (err) return next(err);
                console.log(products)
                res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, products: products, keyword: keyword, current: page, pages: Math.ceil(count / perPage)});
            });
            });

        }   
        // PostModel.find().skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        // .limit(perPage)
        // .exec((err, products) => {
        //     PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
        //     if (err) return next(err);
        //     console.log(products)
        //     res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, products: products, roomType: roomType, wards: wards, cost: cost, keyword: keyword, messages: req.flash('fail')});
        //   });
        // });
        // console.log(roomType)
        // console.log(wards)
        // console.log(cost)
        // console.log(keyword) 
    }

    static contactPage(req, res) {
        try {
            res.render('contact', { title: 'Phản hồi', page_name: 'contact', user: req.user, success: req.flash('success'), messages: req.flash('contactMessage')});
        } catch {
            res.status(500).send(exception);
        }
    }

    static async viewroom(req, res) {
        try {
            var listPostID = await PostModel.findOne({_id: req.params.id});
            var userPost = await UserModel.findOne({_id: listPostID.userid})
            console.log(listPostID.userid)
            res.render('viewroom', {
                userPost: userPost,
                title: "Chi tiết phòng",
                page_name: 'viewroom',
                user: req.userid,
                _id: req.id,
                listPostID: listPostID,
                title: req.title,
                description: req.description,
                streetName: req.streetName,
                district: req.district,
                wards: req.wards,
                water: req.water,
                electric: req.electric,
                cost: req.cost,
                ultilities: req.ultilities,
                roomType: req.roomType,
                uploadImage: req.uploadImage,
                user: req.user,
            });
        }
        catch (e) {
            res.status(200).send('Error manager!');
        }
    }

    static async viewprofile(req, res) {
        try {
            var userPost = await UserModel.findOne({_id: req.params.id})
            console.log('userPost')  
            console.log(userPost)  
            res.render('viewprofile', {
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

    static async contact(req, res, next) {
        
        var title = req.body.subject;
        var content = req.body.message;
        var userid = req.user.id;
        var username = req.user.name;
        var useremail = req.user.email;
        var userpermission = req.user.permission;
        var userphone = req.user.phoneNumber;
        console.log(req.user.id);
        
    
        if (content === "" || title === "") {
            req.flash('contactMessage', 'Vui lòng điền đầy đủ các trường!');
            return res.redirect("/contact");
        }                                                             
        var NewContact = new ContactModel();
        NewContact.title = title;
        NewContact.content = content;
        NewContact.userid = userid;
        NewContact.phoneNumber = userphone;
        NewContact.permission = userpermission;
        NewContact.email = useremail;
        NewContact.name = username;
        
        NewContact.save();

        req.flash('success', 'Phản hồi của bạn đã được gửi đi, Chúng tôi sẽ phản hồi đến bạn sớm !!');
        return res.redirect("/contact");
    }

    static profilePage(req, res) {
        try {
            res.render('profile', { title: 'Thông tin cá nhân', page_name: 'profile', user: req.user, messages: req.flash('fail') });
        } catch {
            res.status(500).send(exception);
        }
    }

    static introPay(req, res) {
        try {
            if (req.user.permission == 0) {
                res.render('intropay', { title: 'Trả phí bài đăng', page_name: 'intropay', user: req.user });
            }
            else {
                res.render("/");
            }
        } catch {
            res.status(500).send(exception);
        }
    }

    static resetPasswordPage(req, res) {
        try {
            res.render('resetpassword', { title: 'Khôi phục mật khẩu', page_name: 'resetpassword', messages: req.flash('resetPasswordMessage') });
        } catch {
            res.status(500).send(exception);
        }
    }

    static async profile(req, res) {
        try {
            upload(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                    res.json({ "kq": 0, "errMsg": "A Multer error occurred when uploading." });
                } else if (err) {
                    res.json({ "kq": 0, "errMsg": "An unknown error occurred when uploading." + err });
                } else {
                    var fullName = req.body.fullname;
                    var address = req.body.address;
                    var email = req.body.email;
                    var phone = req.body.phone;
                    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; 
                    if (!filter.test(email)) { 
                        req.flash('fail', 'Email không đúng định dạng!');
                        return res.redirect('/profile');
                    }
                    if (email === "" || fullName === "" || phone === "" || address === "") {
                        req.flash('fail', 'Vui lòng điền đầy đủ các trường!');
                        return res.redirect('/profile');
                    }
                    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
                    
                    if (vnf_regex.test(phone) == false) 
                    {
                            req.flash('fail', 'Số điện thoại không đúng định dạng!');
                            return res.redirect('/profile');
                    }
   
                    try {
                        var avatar = '/uploads/' + req.file.filename;
                    }
                    catch {
                        var avatar = null;
                    }

                    UserModel.findOne({ _id: req.user.id }, (err, doc) => {

                        doc.name = fullName;
                        doc.email = email;
                        doc.phoneNumber = phone;
                        doc.address = address;
                        if (avatar) {
                            doc.avatar = avatar;
                        }
                        doc.save();
                    });

                    VipTimeLineModel.find({ userid: req.user.id }, (err, doc) => {
                        if (doc.length > 0)
                        {
                            for (var i = 0; i < doc.length; i++)
                            {
                                doc[i].name = fullName;
                                doc[i].phone = phone;
                                doc[i].save();
                            }
                        }
                    });


                    ContactModel.find({ userid: req.user.id }, (err, doc) => {
                        if (doc.length > 0)
                        {
                            for (var i = 0; i < doc.length; i++)
                            {
                                doc[i].name = fullName;
                                doc[i].phoneNumber = phone;
                                doc[i].save();
                            }
                        }
                    });

                    res.redirect('/profile');
                }
            });
        }
        catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    static async resetPassword(req, res, next) {
        async.waterfall([
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function (token, done) {
                UserModel.findOne({ email: req.body.email }, function (err, user) {
                    if (!user) {
                        req.flash('resetPasswordMessage', 'Email không tồn tại.');
                        return res.redirect('/reset-password');
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function (err) {
                        done(err, token, user);
                    });
                });
            },
            function (token, user, done) {
                var smtpTransport = require('nodemailer-smtp-transport')
                var smtpTransport = nodemailer.createTransport(smtpTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'doanchuyennganh02@gmail.com',
                        pass: '1234@doan'
                    }
                }));
                console.log(req.body.email)
                var mailOptions = {
                    to: req.body.email,
                    from: 'doanchuyennganh02@gmail.com',
                    subject: 'Khôi phục lại mật khẩu',
                    text: 'Bạn nhận được thông báo này vì bạn (hoặc người khác) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n' +
                        'Vui lòng nhấp vào liên kết sau hoặc dán liên kết này vào trình duyệt của bạn để hoàn tất quá trình:\n\n' +
                        'http://' + req.headers.host + '/getnew-password/' + token + '\n\n' +
                        'Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    req.flash('resetPasswordMessage', 'Một email vừa được gửi tới ' + user.local.email + ' với hướng dẫn thêm.');
                    done(err, 'done');
                });
            }
        ], function (err) {
            if (err) return next(err);
            return res.redirect('/reset-password');
        });
    };

    static async changePassword(req, res, next) {
        // get new password
        let currentPassword = req.body.currentpassword;
        let newPassword = req.body.newpassword;
        let reenterPassword = req.body.reenterpassword;
        // hash password
        let hashNewPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8), null)
        let hashOldPassword = bcrypt.hashSync(currentPassword, bcrypt.genSaltSync(8), null)
        if (newPassword === "" || reenterPassword === "" || currentPassword === "") {
            req.flash('changePasswordMessage', 'Vui lòng điền đầy đủ các trường!');
            return res.redirect("/change-password");
        }


        if (newPassword.length < 8) {
            req.flash('changePasswordMessage', 'Mật khẩu mới phải có độ dài tối thiểu 8 ký tự!');
            return res.redirect("/change-password");
        }

        console.log(newPassword.length)
        if (newPassword != reenterPassword) {
            req.flash('changePasswordMessage', 'Mật khẩu mới không giống nhau!');
            return res.redirect("/change-password");
        }

        // check new passowrd
        if (currentPassword === newPassword) {
            req.flash('changePasswordMessage', 'Mật khẩu mới không được trùng với mật khẩu cũ!');
            return res.redirect("/change-password");
        }


        console.log(hashOldPassword);
        await UserModel.findOne({ _id: req.user._id }, (err, doc) => {
            // compareSync là hàm để kiểm tra mật khẩu mới và mật khẩu cũ (đã hash) có giống nhau hay không
            if (!bcrypt.compareSync(currentPassword, doc.local.password)) {
                req.flash('changePasswordMessage', 'Mật khẩu cũ không đúng!');
                return res.redirect("/change-password");
            }
            doc.local.password = hashNewPassword;
            doc.save();
            req.flash('success', 'Thay đổi mật khẩu thành công!');
            return res.redirect("/change-password");
        });
    }
    static changePasswordPage(req, res) {
        try {
            console.log("Đổi mật")
            console.log(req.user)
            res.render('changepassword', {title: 'Thay đổi mật khẩu', page_name: 'changepassword', user: req.user, success: req.flash('success'), messages: req.flash('changePasswordMessage')});
        } catch {
            res.status(500).send(exception);
        }
    }

    static bookingroom(req, res) {
        var description = req.body.description;
        var wards = req.body.wards;
        var cost = req.body.cost; 
        var roomType = req.body.roomType;

        var newPost = new BookingModel();
        newPost.user = req.user._id;
        newPost.description = description;
        newPost.wards = wards;
        newPost.cost = cost;
        newPost.roomType = roomType;
        newPost.save();

        req.flash('success', 'Đăng ký thành công. Chúng tôi sẽ gửi mail thông báo cho bạn khi tìm được phòng phù hợp với các lựa chọn của bạn');
        return res.redirect('/booking-room');
    }

    static async vipinfo(req, res) {
        var name = req.user.name;
        let perPage = 10;
        let page = req.params.page || 1;
        try {
        VipTimeLineModel.find({ userid: req.user._id}).sort({time: -1}).skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        .limit(perPage)
        .exec((err, listvip) => {
            console.log('listvip: ')
            console.log(listvip)
            VipTimeLineModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
            if (err) return next(err);  
            res.render('vipinfo', { title: 'Thông Tin Vip', page_name: 'vipinfo', name,  user: req.user, listvip, current: page, pages: Math.ceil(count/ perPage)});
        });
      });  
        } catch {
            res.status(500).send(exception);
        }
    }


    static bookingroomPage(req, res) {
        try {
            res.render('bookingroom', {title: 'Đăng ký tìm phòng', page_name: 'bookingroom', user: req.user, success: req.flash('success')});
        } catch {
            res.status(500).send(exception);
        }
    }

    static getnewPasswordPage(req, res) {
        try {
            UserModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                console.log("Mã: ")
                console.log(req.params.token)
                if (!user) {
                    req.flash('getnewPasswordMessage', 'Mã thông báo đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
                    return res.redirect('/reset-password');
                }
                console.log(user)
                res.render('getnewpassword', { title: 'Đặt lại mật khẩu', page_name: 'getnewpassword', user: user, messages: req.flash('getnewPasswordMessage') });
            });

        } catch {
            res.status(500).send(exception);
        }
    }

    static getnewPassword(req, res) {
        let newPassword = req.body.newpassword;
        let reenterPassword = req.body.reenterpassword;
        console.log("NEW PASSWORD: ")
        console.log(newPassword)
        let hashNewPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8), null)


        async.waterfall([
            function (done) {
                UserModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                    if (!user) {
                        req.flash('getnewPasswordMessage', 'Mã thông báo đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
                        return res.redirect('back');
                    }
                    var url = "/getnew-password/" + req.params.token
                    if (newPassword === "" || reenterPassword === "") {
                        req.flash('getnewPasswordMessage', 'Vui lòng điền đầy đủ các trường!');
                        return res.redirect(url);
                    }

                    if (newPassword.length < 8) {
                        req.flash('getnewPasswordMessage', 'Mật khẩu mới phải có độ dài tối thiểu 8 ký tự!');
                        return res.redirect(url);
                    }

                    console.log(newPassword.length)
                    if (newPassword != reenterPassword) {
                        req.flash('getnewPasswordMessage', 'Mật khẩu mới không giống nhau!');
                        return res.redirect(url);
                    }
                    console.log(user.resetPasswordToken)
                    user.local.password = hashNewPassword;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    user.save(function (err) {
                        req.logIn(user, function (err) {
                            done(err, user);
                        });
                    });

                });
            },
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
                    to: user.local.email,
                    from: 'doanchuyennganh02@gmail.com',
                    subject: 'Mật khẩu của bạn đã được thay đổi',
                    text: 'Xin chào ' + user.local.name + ' ,\n\n' +
                        'Đây là xác nhận rằng mật khẩu cho tài khoản của bạn ' + user.email + ' vừa được thay đổi.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    req.flash('success', 'Thành công!, mật khẩu của bạn đã được cập nhật rùi nhen!!!.');
                    done(err);
                });
            }
        ], function (err) {
            res.redirect('/');
        });
    }
}

module.exports = HomeController;
// {
        //     if (cost == null)
        //     {
        //         if (roomType == null) {
        //             var listroom = await PostModel.find({wards: wards});
        //             res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, listroom: listroom, roomType: roomType, wards: wards, cost: cost, keyword: keyword, messages: req.flash('fail') });

        //         }
        //         else if (wards == null)
        //         {
        //             var listroom = await PostModel.find({roomType: roomType});
        //         }
        //         var listroom = await PostModel.find({roomType: roomType}, {wards: wards});
        //         res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, listroom: listroom, roomType: roomType, wards: wards, cost: cost, keyword: keyword, messages: req.flash('fail') });

        //     }
        //     else if (roomType == null) {
        //         if (cost == null) {
        //             var listroom = await PostModel.find({wards: wards});
        //         }
        //         else if (wards == null) {
        //             if (cost == "Dưới 1 triệu")
        //             {
        //                 var listroom = await PostModel.find({cost: {$lt: 1000000}});
        //                 console.log(listroom)
        //             }
        //             else if (cost == "Từ 1 triệu đến 1,5 triệu")
        //             {
        //                 var listroom =  await PostModel.find({cost: {$gte: 1000000, $lte: 1500000}});
        //                 console.log(listroom)
        //             }
        //             else 
        //             {
        //                 var listroom = await PostModel.find({cost: {$gt: 1500000}});
        //                 console.log(listroom)
        //             }
        //         }
        //         else {
        //             if (cost == "Dưới 1 triệu")
        //             {
        //                 var listroom = await PostModel.find({$and: [{wards: wards}, {cost: {$lt: 1000000}}]});
        //                 console.log(listroom)
        //             }
        //             else if (cost == "Từ 1 triệu đến 1,5 triệu")
        //             {
        //                 var listroom =  await PostModel.find({$and: [{wards: wards}, {cost: {$gte: 1000000, $lte: 1500000}}]});
        //                 console.log(listroom)
        //             }
        //             else 
        //             {
        //                 var listroom = await PostModel.find({$and: [{wards: wards}, {cost: {$gt: 1500000}}]});
        //                 console.log(listroom)
        //             }
        //         }
        //         res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, listroom: listroom, roomType: roomType, wards: wards, cost: cost, keyword: keyword, messages: req.flash('fail')});
        //     }
        //     else if (wards == null) {
        //         if (cost == null) {
        //             var listroom = await PostModel.find({roomType: roomType});
        //         }
        //         else if (roomType == null) {
        //             if (cost == "Dưới 1 triệu")
        //             {
        //                 var listroom = await PostModel.find({cost: {$lt: 1000000}});
        //                 console.log(listroom)
        //             }
        //             else if (cost == "Từ 1 triệu đến 1,5 triệu")
        //             {
        //                 var listroom =  await PostModel.find({cost: {$gte: 1000000, $lte: 1500000}});
        //                 console.log(listroom)
        //             }
        //             else 
        //             {
        //                 var listroom = await PostModel.find({cost: {$gt: 1500000}});
        //                 console.log(listroom)
        //             }
        //         }
        //         else {
        //             if (cost == "Dưới 1 triệu")
        //             {
        //                 var listroom = await PostModel.find({$and: [{roomType: roomType}, {cost: {$lt: 1000000}}]});
        //                 console.log(listroom)
        //             }
        //             else if (cost == "Từ 1 triệu đến 1,5 triệu")
        //             {
        //                 var listroom =  await PostModel.find({$and: [{roomType: roomType}, {cost: {$gte: 1000000, $lte: 1500000}}]});
        //                 console.log(listroom)
        //             }
        //             else 
        //             {
        //                 var listroom = await PostModel.find({$and: [{roomType: roomType}, {cost: {$gt: 1500000}}]});
        //                 console.log(listroom)
        //             }
        //         }
        //         res.render('motel', { title: 'Phòng trọ', page_name: 'motel', user: req.user, listroom: listroom, roomType: roomType, wards: wards, cost: cost, keyword: keyword, messages: req.flash('fail') });

        //     }
            // else 