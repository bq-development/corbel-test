/*jshint bitwise: false*/

var AES = require('crypto-js/aes');
var ECB = require('crypto-js/mode-ecb');
var PKCS7 = require('crypto-js/pad-pkcs7');
var MD5 = require('crypto-js/md5');
var B64ENC = require('crypto-js/enc-base64');
var UTF8 = require('crypto-js/enc-utf8');

var encoderHex = require('crypto-js/enc-hex');


var zeroFill = function(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ''; // always return a string
};

function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

function xor(jwt, secret, timestamp) {
    var layout;
    var result = [];
    var lastJwtByte = jwt.charCodeAt(jwt.length - 1);

    var algorithmSelector = ((lastJwtByte >> 1) & 1) ^ (lastJwtByte & 1);

    if (algorithmSelector === 0) {
        layout = timestamp.concat(secret);
    } else {
        layout = secret.concat(timestamp);
    }

    for (var jwtIndex = 0; jwtIndex < jwt.length; jwtIndex++) {
        result[jwtIndex] = (jwt.charCodeAt(jwtIndex) ^ layout.charCodeAt(jwtIndex % layout.length));
    }

    var output = '';
    result.forEach(function(value) {
        output += zeroFill(value.toString(16), 2);
    });

    return output;
}

var requiredDefecatorFields = ['timestamp', 'jwtSecret', 'token', 'defecatorSecret'];

function isValidDefecatorOptions(options) {
    return requiredDefecatorFields.every(function(key) {
        return options.hasOwnProperty(key);
    });
}

var requiredDecipherFields = ['data', 'key'];
function isValidDecipherOptions(options) {
    return requiredDecipherFields.every(function(key) {
        return options.hasOwnProperty(key);
    });
}


module.exports = function setup(app) {

    app.post('/cryptography/defecator', function(req, res) {
        var options = req.body;
        if (!isValidDefecatorOptions(options)) {
            res.status(400).send({
                error: 'Required fields: ' + requiredDefecatorFields
            });
            return;
        }
        var defecatorSecret = options.defecatorSecret;
        var timestamp = zeroFill(options.timestamp.toString(16), 16);
        var secret = options.jwtSecret;
        var cipherKey = MD5(secret);
        var signatureChallenge = xor(options.token, hex2a(defecatorSecret), hex2a(timestamp));
        var challenge = timestamp + defecatorSecret + 'defec8ed' + signatureChallenge;
        var aesResult = AES.encrypt(encoderHex.parse(challenge), cipherKey, {
            padding: PKCS7,
            mode: ECB
        }).ciphertext;
        var result = B64ENC.stringify(aesResult);

        res.json({
            challenge: result,
            challengeMd5: MD5(encoderHex.parse(challenge)).toString(),
            originalChallenge: challenge
        });
    });

    app.post('/cryptography/decipher', function(req, res) {
        var options = req.body;
        if (!isValidDecipherOptions(options)) {
            res.status(400).send({
                error: 'Required fields: ' + requiredDecipherFields
            });
            return;
        }

        var data = options.data;
        var key = options.key;

        try {
            var aesResult = AES.decrypt(data, encoderHex.parse(key), {
                padding: PKCS7,
                mode: ECB
            });

            res.json({
                aesResult: aesResult,
                data: aesResult.toString(UTF8)
            });
        } catch (e) {
            console.log(e);
        }
    });
};
