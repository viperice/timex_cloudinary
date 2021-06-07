/* API includes */
var MessageDigest = require('dw/crypto/MessageDigest');
var URLUtils = require('dw/web/URLUtils');

/* Local includes */
var data = require('~/cartridge/scripts/data/cloudinaryData');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system').Logger.getLogger('Cloudinary', '');
var imageFormats = require('~/cartridge/scripts/data/imageFormats').getImageFormats();
var videoFormats = require('~/cartridge/scripts/data/imageFormats').getVideoFormats();

// define service
var cloudinaryService = LocalServiceRegistry.createService("cloudinaryAPI", {
	createRequest: function (service, param) {
		service.setAuthentication('NONE');
		return param || null;
	},
	parseResponse: function (service, client) {
		return client;
	}
});

var serviceURL = cloudinaryService.URL;

// define logger
function logger(e) {
	Logger.error('Cloudinary. File - calls.js. Error - {0}', e);
}

// return hashed signature string from object
function addSignatureToBody(body) {
	var hasher = new MessageDigest(MessageDigest.DIGEST_SHA_1);
	var fieldsArray = [];

	for (var i in body) {
		if (body[i] == '' || body[i] == null) {
			delete body[i];
		} else {
			fieldsArray.push(i + '=' + body[i]);
		}
	}

	var fields = fieldsArray.sort().join('&');
	fields = fields + data.getSecretKey();
	var signature = hasher.digest(fields);
	return signature;
}

/**
 * Call Cloudinary service
 * @param {Object} body 
 * @param {string} fileType 
 * @param {string} callType 
 * 
 * @returns {Object} Object with fields: 'ok' {boolean} upload result, 'message' {string} error message
 */
function callService(body, fileType, callType) {
    var serviceResponse, 
        cloudinaryResponse = {
            ok: false,
            message: ''
        };

	try {
		cloudinaryService.setRequestMethod('POST');
		cloudinaryService.setURL(serviceURL + '/' + data.getCloudName() + '/' + fileType + '/' + callType);
        cloudinaryService.addHeader('Content-Type', 'application/json');
        
		serviceResponse = cloudinaryService.call(JSON.stringify(body));

		if (serviceResponse.ok) {
            if (serviceResponse.object.statusCode == '200') {
                cloudinaryResponse.ok = true;
                cloudinaryResponse.message = serviceResponse.object.text;
			} else {
				cloudinaryResponse.message = serviceResponse.object.errorText
			}
		} else {
            cloudinaryResponse.message = serviceResponse.errorMessage
		}

	} catch (e) {
		logger(e);
		cloudinaryResponse.message = e.message
    }
    return cloudinaryResponse;
};

/**
 * Function for uploading files to Cloudinary
 * @param {File} file 
 * @param {string} folderType 
 * @param {Object} attr 
 */
function uploadFileToCloudinary(file, folderType, attr) {
	var imageID = '';
	var imageURL = '';
	var URLUtils = require('dw/web/URLUtils');
	var filePath = file.getFullPath();
    var indexOfDefault = filePath.indexOf("/default/") + 9;
    var uploadResult = {
        ok: true,
        message: ''
    };

	filePath = filePath.substring(indexOfDefault);	// remove "default/" from file path

	switch (folderType) {
		case 'catalog':
			imageURL = URLUtils.imageURL(URLUtils.CONTEXT_CATALOG, attr.catalogID, filePath, {}).toString();
			imageID = 'Catalogs/' + attr.catalogID + '/';
			break;

		case 'library':
			imageURL = URLUtils.imageURL(URLUtils.CONTEXT_LIBRARY, attr.libraryID, filePath, {}).toString();
			imageID = 'Libraries/' + attr.libraryID + '/';
			break;

		case 'static':
			imageURL = URLUtils.imageURL(filePath, {}).toString().replace(/Sites(.+?)Site\/-\//, '-/Sites/');
			imageID = 'Static/';
			break;

		default:
	}

	imageID += filePath.substring(0, filePath.lastIndexOf('.'));
	var fileType = filePath.substring(filePath.lastIndexOf('.') + 1);
	var type = '';

	if (videoFormats.indexOf(fileType) > -1) {
		type = 'video';
	}
	if (imageFormats.indexOf(fileType) > -1) {
		type = 'image';
	}

	if (type === "image" || type === "video") {
		var body = {
			invalidate: true,
			timestamp: (Date.now() / 1000).toFixed(),
			public_id: imageID
		}
		body.signature = addSignatureToBody(body);
		body.file = imageURL;
		body.api_key = data.getAPIKey();

		uploadResult = callService(body, type, 'upload');

	} else {
        // skip the uploading for unsupported files
        uploadResult.message = 'Unsupported file extension: ' + fileType;
    }

    return uploadResult;
}

/**
 * Deletes file on Cloudinary 
 * @param {string} public_id 
 */
function deleteFileOnCloudinary(public_id) {

	var body = {
		invalidate: true,
		timestamp: (Date.now() / 1000).toFixed(),
		public_id: public_id.substring(0, public_id.lastIndexOf('.'))
	}
	body.signature = addSignatureToBody(body);
	body.api_key = data.getAPIKey();

	var fileType = public_id.substring(public_id.lastIndexOf('.') + 1);
	var type = '';

	if (videoFormats.indexOf(fileType) > -1) {
		type = 'video';
	}
	if (imageFormats.indexOf(fileType) > -1) {
		type = 'image';
	}
	if (type === "image" || type === "video") {

		callService(body, type, 'destroy');
	}
}

/**
 * Searches file on Cloudinary
 * @param {string} next_cursor 
 */
function searchFileOnCloudinary(next_cursor) {
	var next_cursor = next_cursor ? "&next_cursor=" + next_cursor : "";
	var service = cloudinaryService,
		serviceResponse, cloudinaryResponse;

	try {
		service.setRequestMethod('GET');
		service.setURL('https://' + data.getAPIKey() + ':' + data.getSecretKey() + '@api.cloudinary.com/v1_1/' + data.getCloudName() + '/resources/image?max_result=500&' + next_cursor);
		service.addHeader('Content-Type', 'application/json');
		serviceResponse = service.call();

		if (!serviceResponse.ok) {
			cloudinaryResponse = {
				error: true,
				message: serviceResponse.errorMessage
			}
		} else {
			if (serviceResponse.object.statusCode != '200') {
				cloudinaryResponse = {
					error: true,
					message: serviceResponse.object.errorText
				}
			} else {
				cloudinaryResponse = serviceResponse.object.text;
			}
		}
		return cloudinaryResponse;

	} catch (e) {
		logger(e);

		return {
			error: true
		};
	}
}

module.exports.searchFileOnCloudinary = searchFileOnCloudinary;
module.exports.deleteFileOnCloudinary = deleteFileOnCloudinary;
module.exports.uploadFileToCloudinary = uploadFileToCloudinary;