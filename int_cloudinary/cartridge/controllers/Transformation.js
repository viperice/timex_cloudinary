/**
 * Controller that provides Cloudinary functionality, manages and uplaads images to BM and Cloudinary,
 * generate slot image and video url
 *
 */

/* API includes */
let ISML = require('dw/template/ISML');
let File = require('dw/io/File');
let URLUtils = require('dw/web/URLUtils');
let Response = require('dw/system/Response');

/* Local includes */
var data = require('~/cartridge/scripts/data/cloudinaryData');
var URLgenerator = require('~/cartridge/scripts/lib/URLgenerator');
var Calls = require('~/cartridge/scripts/lib/calls');
var cloudinaryExtHelper = require('~/cartridge/scripts/helpers/cloudinaryExtHelper');

/**
 * Rendering the BM extension for prewiev transformations,
 * that were done by Cloudinary
 */
function transformationMain() {
	var httpparams = request.httpParameterMap;
	// params of transformations
	var params = httpparams.param.stringValue || '';
	// public_id of image
	var image = httpparams.public_id.stringValue || false;
	var result = {
		isImage: false,
		message: "",
		resultImage: ""
	};

	if (image) {
		result = cloudinaryExtHelper.searchImageForTransform(image);
	}

	ISML.renderTemplate('cloudinary/bm/transformation', {
		params: params,
		image: result.resultImage,
		isImage: result.isImage,
		cloudName: "http://res.cloudinary.com/" + data.getCloudName() + "/image/upload/",
		message: result.message
	});

}

module.exports.Main = transformationMain;
module.exports.Main.public = true;
