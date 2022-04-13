const crypto = require('crypto');
const https = require('https');
const UserModel = require('../models/user.model');
var VipTimeLineModel = require('../models/viptimeline.model');
const MotelModel = require('../models/motel.model');

class PaymentController {
    static async Momo(amount) {
        let partnerCode = 'MOMO1AE320220312';
        let accessKey = '8W0kVTYQC3zREzZi';
        let secretKey = '9ez5mKYROWhLTeuLA7Fp5442hqUq6oAU';
        let requestId = partnerCode + new Date().getTime();
        let orderId = requestId;
        let orderInfo = "Thanh toán qua ví điện tử Momo!";
        let redirectUrl = "http://localhost:3000/Payment/return";
        let ipnUrl = "https://callback.url/notify";
        let requestType = "captureWallet"
        let extraData = "";

        let rawSignature =
            "accessKey=" + accessKey +
            "&amount=" + amount +
            "&extraData=" + extraData +
            "&ipnUrl=" + ipnUrl +
            "&orderId=" + orderId +
            "&orderInfo=" + orderInfo +
            "&partnerCode=" + partnerCode +
            "&redirectUrl=" + redirectUrl +
            "&requestId=" + requestId +
            "&requestType=" + requestType;

        let signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        let requestBody = JSON.stringify({
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature
        });

        let options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        }

        return new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                res.setEncoding('utf8');
                res.on('data', (body) => {
                    let data = JSON.parse(body);
                    resolve(data);
                });
            });

            req.write(requestBody);
            req.end();
        });
    }

    static async MomoPayment(req, res, next) {
        let amount = req.query.amount;
        if (amount) {
            PaymentController.Momo(amount).then((response) => {
                return res.redirect(response.payUrl);
            });
        }
        else {
            return res.redirect("/");
        }
    }

    static async UpgradeAccount(req, res, next) {
        let amount = 50000;
        if (amount) {
            PaymentController.Momo(amount).then((response) => {
                return res.redirect(response.payUrl);
            });
        }
        else {
            return res.redirect("/");
        }
    }

    static async MomoCallBack(req, res, next) {
        let status = req.query.resultCode;
        var userid = req.user._id;
        if (status == 0) {
            // var User = new UserModel.findOne({_id: userid});
            // User.money = Number(doc.money) + Number(req.query.amount);
            // User.permission = 1;
            // User.save();
            
            // var Vip = new VipTimeLineModel.findOne({_id: userid});
            // Vip.userid = req.user.id;
            // console.log('bên trong: ')
            // console.log(req.user.id)
            // const d = new Date();
            // Vip.starttime = d;
            // const month = d.getMonth();
            // d.setMonth(d.getMonth() + 1);
            // while (d.getMonth() === month) {
            //     d.setDate(d.getDate() - 1);
            // }
            // Vip.endtime = d;
            // Vip.save();
            UserModel.findOne({ _id: userid }, (err, doc) => {
                doc.money = Number(doc.money) + Number(req.query.amount);
                doc.permission = 1;
                doc.save();
            });

            MotelModel.find({ userid: userid }
                , (err, doc) => {
                    console.log('==========')
                    console.log(doc.length)
                if (doc.length > 0)
                {
                    for (var i = 0; i < doc.length; i++)
                    {
                        console.log(i)
                        console.log(doc[i])
                        doc[i].userstatus = 1;
                        console.log('==========')
                        console.log(doc[i].userstatus)
                        doc[i].save();
                    }
                }
            });
            // console.log('userid: ')
            // console.log(userid)
            var Vip = new VipTimeLineModel()
            Vip.userid = req.user.id;
            // console.log('bên trong: ')
            // var day = new Date();
            // Vip.starttime = day;
            // console.log('ở đây: ')
            // console.log(day);
            // console.log(Vip.starttime);
            // console.log(req.user.id)
            // var month = day.getMonth();
            // day.setMonth(day.getMonth() + 1);
            // while (day.getMonth() === month) {
            //     day.setDate(day.getDate() - 1);
            // }
            // Vip.endtime = day;
            var current = new Date();
            Vip.starttime = current
            console.log(current)
            var oneMonthAfter = new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1, 
                new Date().getDate()
            );
            Vip.name = req.user.name;
            Vip.phone = req.user.phoneNumber;
            Vip.endtime = oneMonthAfter;
            console.log(oneMonthAfter);
            Vip.save();
            return res.redirect("/profile");
        }
        else {
            return res.redirect("/Payment/payment-error");
        }
    }

    static async PaymentError(req, res, next) {
        try {
            res.render('layout', { title: 'Lỗi Thanh Toán', page_name: 'payment-error'});
        } catch (exception) {
            res.status(500).send(exception);
        }
    }
}

module.exports = PaymentController;