var UserModel = require('../models/user.model');
var PostModel = require('../models/motel.model');
var ContactModel = require('../models/contact.model');
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const async = require('async');
const nodemailer = require('nodemailer')
const fs = require('fs');
const { spawn } = require('child_process');
function isNumber(val) {
    return !isNaN(val);
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


class OwnerController {
    static async addnewroomPage(req, res, next) {
        try {
            res.render('owner/addnewroom', { title: 'Thêm bài mới', page_name: 'addnewroom', user: req.user, messages: req.flash('fail') });
        } catch {
            res.status(500).send(exception);
        }
    }

    static async addNewRoom2(req, res) {
        try {
            var newPost = new PostModel();
            newPost.userid = req.user._id;
            newPost.title = title;
            newPost.userstatus = 1;
            newPost.description = description;
            newPost.streetName = streetName;
            newPost.district = district;
            newPost.wards = wards;
            newPost.water = water;
            newPost.electric = electric;
            newPost.cost = cost;
            newPost.area = area;
            newPost.ultilities = ultilities;
            newPost.roomType = roomType;
            newPost.save();
            res.redirect('/owner/listroom/1');    
        }
        catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    static async addNewRoom(req, res) {
        try {
            upload(req, res, function(err) {
                if (err instanceof multer.MulterError) {
                    res.json({"kq":0, "errMsg":"A Multer error occurred when uploading."});
                } else if (err) {
                    res.json({"kq":0, "errMsg":"An unknown error occurred when uploading." + err});
                } else {
                    var title = req.body.title;
                    var description = req.body.description;
                    var streetName = req.body.streetName;
                    var wards = req.body.wards;
                    if (wards == "Lựa chọn phường") {
                        req.flash('fail', 'Vui lòng chọn phường!');
                        return res.redirect('/owner/addnewroom');
                    }   
                    var district = "Thủ Dầu Một";
                    var cost = req.body.cost; 
                    if (isNumber(cost) == false) {
                        req.flash('fail', 'Giá phòng phải là số!');
                        return res.redirect('/owner/addnewroom');
                    }   
                    var water = req.body.water;
                    if (isNumber(water) == false) {
                        req.flash('fail', 'Tiền nước phải là số!');
                        return res.redirect('/owner/addnewroom');
                    }   
                    var electric = req.body.electric;
                    if (isNumber(electric) == false) {
                        req.flash('fail', 'Tiền điện phải là số!');
                        return res.redirect('/owner/addnewroom');
                    }   
                    var area = req.body.area;
                    var ultilities = req.body.ultilities;
                    var roomType = req.body.roomType;
                    if (roomType == 'Chọn loại phòng') {
                        req.flash('fail', 'Tiền điện phải là số!');
                        return res.redirect('/owner/addnewroom');
                    }  
                    var newPost = new PostModel();
                    newPost.userid = req.user._id;
                    newPost.title = title;
                    newPost.userstatus = 1;
                    newPost.description = description;
                    newPost.streetName = streetName;
                    newPost.district = district;
                    newPost.wards = wards;
                    newPost.water = water;
                    newPost.electric = electric;
                    newPost.cost = cost;
                    newPost.area = area;
                    var content = title + description + ultilities;
                    const childPython2 = spawn('python', ['./ObjectDetection/predict.py',  content]);
                    childPython2.stdout.on('data', (data) => {
                    console.log(`stdout: ${data}`);
                    console.log(typeof(data))
                    var status = parseInt(data)
                    console.log('ststus: ')
                    console.log(status)
                    if (status == 0)
                    {
                        newPost.status = 2;
                        newPost.save();
                    } 
                    });
                    
                    childPython2.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                    });
                    
                    childPython2.on('close', (code) => {
                        console.log(`Child process exited with code ${code}`);
                    });
                    newPost.roomType = roomType;
                    
                    try {
                        
                        var uploadImage = '/uploads/' + req.file.filename;
                        var imageurl = 'public' + uploadImage
                        const childPython = spawn('python', ['./ObjectDetection/yolo.py', imageurl]);
                        childPython.stdout.on('data', (data) => {
                        console.log(`stdout: ${data}`);
                        console.log(typeof(data))
                        console.log(data.toString())
                        ultilities = ultilities + '\nTiện ích bổ sung:\nẢnh 1: \n' + data.toString();
                        console.log('ultilities')
                        console.log(ultilities)
                        newPost.ultilities = ultilities;
                        newPost.save();
                        
                        });
                        
                        childPython.stderr.on('data', (data) => {
                            console.error(`stderr: ${data}`);
                        });
                        
                        childPython.on('close', (code) => {
                            console.log(`Child process exited with code ${code}`);
                        });

                    
                    } 
                    catch {
                        var uploadImage = 'null';

                    }


                    newPost.uploadImage = uploadImage;
                    newPost.save();
                    setTimeout(function(){
                        res.redirect('/owner/listroom/1');
                    }, 3000);
                    
                }
            });     
        }
        catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    static async listroom(req, res) {
        console.log(req.user.id)
        let perPage = 10;
        let page = req.params.page || 1;
        var keyword = req.query.keyword;
        if (keyword != null)
        {
            PostModel.find({userid: req.user.id, $or: [{roomType: new RegExp(keyword)}, {wards: new RegExp(keyword)}, {description: new RegExp(keyword)}, {title: new RegExp(keyword)}]})
            .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, listroom) => {
                PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                if (err) return next(err);
                console.log('đây nè')

                res.render('owner/listroom', { title: 'Danh sách phòng', page_name: 'listroom', user: req.user, listroom, keyword: keyword,  current: page, pages: Math.ceil(count / perPage)});
          });
        });;
        }
        else {
        try {
            PostModel.find({userid: req.user.id}).skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, listroom) => {
                PostModel.countDocuments((err, count) => { // đếm để tính xem có bao nhiêu trang
                if (err) return next(err);
                console.log("đây nè")
                console.log(listroom)
                res.render('owner/listroom', { title: 'Danh sách phòng', page_name: 'listroom', user: req.user, listroom, keyword: keyword,  current: page, pages: Math.ceil(count / perPage)});
              });
            });
        }
        catch {
            res.status(500).send(exception);
        }
    }

        // try {
        //     var listRoom = await PostModel.find({userid: req.user.id});  
        //     console.log(listRoom)
        //     res.render('owner/listroom', { title: 'Danh sách phòng', page_name: 'listroom', user: req.user, listRoom: listRoom });
        // } catch {
        //     res.status(500).send(exception);
    }

    static async deleteRoom(req, res, next) {
        console.log(req.user.id)
        var postID = req.params.id;
        await PostModel.deleteOne({_id: postID});
        res.redirect('/owner/listroom/1');
    }

    static async uploadImage(req, res, next) {
        var postID = req.params.id;
        var Image1, Image2, Image3, Image4 = 'null';
        var post = await PostModel.findOne({_id: postID});
        var newPost = new PostModel();
        console.log("--1 ===============")
        console.log(postID)
        console.log(post)
        console.log(post.Image1)
        try {
            upload(req, res, function(err) {
                if (err instanceof multer.MulterError) {
                    res.json({"kq":0, "errMsg":"A Multer error occurred when uploading."});
                } else if (err) {
                    res.json({"kq":0, "errMsg":"An unknown error occurred when uploading." + err});
                } else {
                    try {
                        console.log("0 ===============")
                            console.log(post.Image1)
                        if (post.Image1 == 'null')
                        {
                            newPost.Image1 = '/uploads/' + req.file.filename;
                            
                        }
                        else if (post.Image2 == 'null')
                        {
                            newPost.Image2 = '/uploads/' + req.file.filename;

                        }
                        else if (post.Image3 == 'null')
                        {
                            newPost.Image3 = '/uploads/' + req.file.filename;
                            
                        }
                        else if (post.Image4 == 'null')
                        {
                            newPost.Image4 = '/uploads/' + req.file.filename;
                            
                        }  
                    } 
                    catch {
                        var Image1, Image2, Image3, Image4 = 'null';

                    }
                    console.log("2 ===============")
                    console.log(post.Image1)
                    
                    var url = '/owner/editroom/'+ postID
                    res.redirect(url) 
                }
            });     
        }
        catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }

    static async viewRoomID(req, res, next) {
        try {
            var listPostID = await PostModel.findOne({_id: req.params.id});

            res.render('owner/editroom', {
                title: 'Chi tiết phòng',
                page_name: 'editroom',
                user: req.user,
                _id: req.id,
                listPostID: listPostID,
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
                Image1: req.Image1,
                Image2: req.Image2,
                Image3: req.Image3,
                Image4: req.Image4,
            });
        }
        catch (e) {
            res.status(200).send('Error manager!');
        }
    }

    static async updateRoomID(req, res, next) {
        var postID = req.params.id;
        var Image1 = 'null';
        var Image2 = 'null';
        var Image3 = 'null';
        var Image4 = 'null';
        var post = await PostModel.findOne({_id: postID});
        var doc = await PostModel.findOne({_id: postID}) 
        try {
          upload(req, res, function(err) {
            if (err instanceof multer.MulterError) {
                res.json({"kq":0, "errMsg":"A Multer error occurred when uploading."});
            } else if (err) {
                res.json({"kq":0, "errMsg":"An unknown error occurred when uploading." + err});
            } else {
              
              var title = req.body.title;
              if (title == "") {
                req.flash('fail', 'Vui lòng nhập tiêu đề!');
                return res.redirect('/owner/addnewroom');
            }   
              var description = req.body.description;
              if (description == "") {
                req.flash('fail', 'Vui lòng nhập mô tả!');
                return res.redirect('/owner/addnewroom');
            }   
              var streetName = req.body.streetName;
              var streetName = req.body.streetName;
                    if (streetName == "") {
                        req.flash('fail', 'Vui lòng nhập địa chỉ!');
                        return res.redirect('/owner/addnewroom');
                    } 
              var wards = req.body.wards;
              if (wards == "Lựa chọn phường") {
                req.flash('fail', 'Vui lòng chọn phường!');
                return res.redirect('/owner/addnewroom');
            }   
              var cost = req.body.cost;
              var cost = req.body.cost; 
                    if (cost == "") {
                        req.flash('fail', 'Vui lòng nhập giá phòng!');
                        return res.redirect('/owner/addnewroom');
                    }  
                    if (isNumber(cost) == false) {
                        req.flash('fail', 'Giá phòng phải là số!');
                        return res.redirect('/owner/addnewroom');
                    }   
              var water = req.body.water;
              if (water == "") {
                req.flash('fail', 'Vui lòng nhập tiền nước!');
                return res.redirect('/owner/addnewroom');
            }  

            if (isNumber(water) == false) {
                req.flash('fail', 'Tiền nước phải là số!');
                return res.redirect('/owner/addnewroom');
            }   
              var electric = req.body.electric;
              if (electric == "") {
                req.flash('fail', 'Vui lòng nhập tiền điện!');
                return res.redirect('/owner/addnewroom');
            }  
            if (isNumber(electric) == false) {
                req.flash('fail', 'Tiền điện phải là số!');
                return res.redirect('/owner/addnewroom');
            }  
              var ultilities = req.body.ultilities;
              var roomType = req.body.roomType;
              if (roomType == 'Chọn loại phòng') {
                req.flash('fail', 'Tiền điện phải là số!');
                return res.redirect('/owner/addnewroom');
            }  
            
            doc.title = title;
            doc.description = description;
            doc.streetName = streetName;
            doc.wards = wards;
            doc.cost = cost;
            doc.water = water;
            doc.electric = electric;
            doc.roomType = roomType;
            doc.save()
            var content = title + description + ultilities;
            const childPython2 = spawn('python', ['./ObjectDetection/predict.py',  content]);
            childPython2.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            console.log(typeof(data))
            var status = parseInt(data)
            console.log('ststus: ')
            console.log(status)
            if (status == 0)
            {
                doc.status = 2;
                doc.save();
            } 
            });
            
            childPython2.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
            
            childPython2.on('close', (code) => {
                console.log(`Child process exited with code ${code}`);
            });
            try{
                if (post.Image1 == 'null')
                {
                    Image1 = '/uploads/' + req.file.filename;
                    var imageurl = 'public' + Image1
                    const childPython = spawn('python', ['./ObjectDetection/yolo.py', imageurl]);
                    childPython.stdout.on('data', (data) => {
                    ultilities = ultilities + 'Ảnh 2: \n' + data.toString();
                    console.log('ultilities')
                    console.log(ultilities)
                    doc.ultilities = ultilities;
                    doc.save();
                    });
                    
                    childPython.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                    });
                    
                    childPython.on('close', (code) => {
                        console.log(`Child process exited with code ${code}`);
                    });
                }
                else if (post.Image2 == 'null')
                {
                    Image2 = '/uploads/' + req.file.filename;
                    var imageurl = 'public' + Image2
                    const childPython = spawn('python', ['./ObjectDetection/yolo.py', imageurl]);
                    childPython.stdout.on('data', (data) => {
                    ultilities = ultilities + 'Ảnh 3: \n' + data.toString();
                    console.log('ultilities')
                    console.log(ultilities)
                    doc.ultilities = ultilities;
                    doc.save();
                    });
                    
                    childPython.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                    });
                    
                    childPython.on('close', (code) => {
                        console.log(`Child process exited with code ${code}`);
                    });
                }
                else if (post.Image3 == 'null')
                {
                    Image3 = '/uploads/' + req.file.filename;
                    var imageurl = 'public' + Image3
                    const childPython = spawn('python', ['./ObjectDetection/yolo.py', imageurl]);
                    childPython.stdout.on('data', (data) => {
                    ultilities = ultilities + 'Ảnh 4: \n' + data.toString();
                    console.log('ultilities')
                    console.log(ultilities)
                    doc.ultilities = ultilities;
                    doc.save();
                    });
                    
                    childPython.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                    });
                    
                    childPython.on('close', (code) => {
                        console.log(`Child process exited with code ${code}`);
                    });
                }
                else if (post.Image4 == 'null')
                {
                    Image4 = '/uploads/' + req.file.filename;
                    var imageurl = 'public' + Image4
                    const childPython = spawn('python', ['./ObjectDetection/yolo.py', imageurl]);
                    childPython.stdout.on('data', (data) => {
                    ultilities = ultilities + 'Ảnh 5: \n' + data.toString();
                    console.log('ultilities')
                    console.log(ultilities)
                    doc.ultilities = ultilities;
                    doc.save();
                    });
                    
                    childPython.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                    });
                    
                    childPython.on('close', (code) => {
                        console.log(`Child process exited with code ${code}`);
                    });
                }  
            }
            catch {
                Image1 = post.Image1;
                Image2 = post.Image2;
                Image3 = post.Image3;
                Image4 = post.Image4;
            }
                  if (Image1 != 'null')
                  {
                      console.log('1.=======')
                      console.log(Image1)
                      doc.Image1 = Image1;
                  }
                  if (Image2 != 'null')
                  {
                    console.log('2.=======')
                    console.log(Image2)
                    doc.Image2 = Image2;
                  }
                  if (Image3 != 'null')
                  {
                    doc.Image3 = Image3;
                  }
                  if (Image4 != 'null')
                  {
                    doc.Image4 = Image4;
                  }
                doc.ultilities = ultilities;
                doc.save()
                var listPostID = PostModel.findOne({_id: req.params.id});
                var url = "/owner/editroom/"+req.params.id
                res.redirect('/owner/listroom/1')
                
            }
        });   
        }
        catch (e) {
            console.log(e);
            res.status(500).send(e);
        }
    }
  

    static async roominfo(req, res, next) {
        try {
            res.render('owner/roominfo', { title: 'Thông tin phòng', page_name: 'roominfo', user: req.user });
        } catch {
            res.status(500).send(exception);
        }
    }
}
module.exports = OwnerController;