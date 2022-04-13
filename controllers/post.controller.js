var PostModel = require('../models/posts.model');
var UserModel = require('../models/user.model');

class PostController {
    static async acceptPost(req, res, next) {
        var postID = req.params.id;
        await PostModel.findOne({_id: postID}, (err, doc) => {
            doc.status = 1;
            doc.save();
        });
        res.redirect('/admin/list-post');
    }

    static async declinePost(req, res, next) {
        var postID = req.params.id;
        await PostModel.findOne({_id: postID}, (err, doc) => {
            doc.status = 2;  
            doc.save();
        });
        res.redirect('/admin/list-post');
    }

    static async deletePost(req, res, next) {
        var postID = req.params.id;
        await PostModel.deleteOne({_id: postID});
        res.redirect('/viewpost');
    }

    static async singlePost(req, res, next) {
        var postID = req.params.id;
        await PostModel.findOne({_id: postID}, (err, doc) => {
            UserModel.findOne({_id: doc.user}, (err, viewUser) => {
                res.render(
                    'propertysingle',
                    {
                        user: req.user,
                        post: doc,
                        viewUser: viewUserpm
                    }
                )
            });
        });
    }

    
}

module.exports = PostController;