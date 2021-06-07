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
var imageFormats = require('~/cartridge/scripts/data/imageFormats').getImageFormats();
var videoFormats = require('~/cartridge/scripts/data/imageFormats').getVideoFormats();


/**
 * Rendering the BM extension for managing images and video content,
 * search functionality
 */
function imageManager(result) {
	// action (upload result msg)
	var result = result || '';
	// search parameters
	var parameters = request.httpParameterMap;
	var search = parameters.search ? parameters.search.stringValue : false;
	var images = cloudinaryExtHelper.getImages(search);

	// pagination
	var maxFilesPerPage = 10;
	var numberOfPages = (images.length / maxFilesPerPage).toFixed();
	var actualPage = parameters.actualPage.intValue ? parameters.actualPage.intValue : 1;
	var showPrev = actualPage == 1 ? false : true;
	var showNext = actualPage == numberOfPages ? false : true;
	var from = actualPage == 1 ? 0 : ((actualPage - 1) * maxFilesPerPage);
	var to = from + maxFilesPerPage;
	var displayImages = images.slice(from, to);
	var useDots = false;
	var listOfPages = [1];
	if (numberOfPages > 6) {
		useDots = true;
		if (actualPage > 4) {
			listOfPages.push('dots');
		}
		for (let i = -2; i <= 2; i++) {
			var pageNumber = actualPage + i;
			if (pageNumber > 0 && listOfPages.indexOf(pageNumber) == -1 && pageNumber < numberOfPages) {
				listOfPages.push(pageNumber);
			}
		}
		if (actualPage + 3 < numberOfPages) {
			listOfPages.push('dots');
		}
	}
	listOfPages.push(numberOfPages);

	var pagination = {
		useDots: useDots,
		listOfPages: listOfPages,
		numberOfPages: numberOfPages,
		actualPage: actualPage,
		showPrev: showPrev,
		showNext: showNext,
		showPagination: numberOfPages > 1
	}

	request.session.getForms().upload.clearFormElement();

	ISML.renderTemplate('cloudinary/bm/imagemanager', {
		result: result,
		images: displayImages,
		pagination: pagination,
		cloudName: "http://res.cloudinary.com/" + data.getCloudName()
	});

}
/**
 * uploads images and video to BM, and Cloudinary
 * 
 */

function uploadImage() {
	var cloudinaryFolderName = '/default/images/Cloudinary/';
	var cloudinaryFolder = new File(File.STATIC + cloudinaryFolderName);
	if (!cloudinaryFolder.exists()) {
		cloudinaryFolder.mkdir();
	}
	var result;
	var file;
	var action = request.triggeredFormAction;
	if (action.formId == "submit") {
		var params = request.httpParameterMap;
		var files = params.processMultipart((function (field, ct, oname) {

			if (oname != '') {

				var fileType = oname.substring(oname.lastIndexOf('.') + 1);
				if ((imageFormats.indexOf(fileType) == -1) && (videoFormats.indexOf(fileType) == -1)) {
					result = "FAILED:  file format '" + fileType + "' not allowed";
					return false;
				}


				var folder = new File(File.STATIC + cloudinaryFolderName);
				var existingFiles = folder.listFiles();
				for (var i = 0; i < existingFiles.length; i++) {
					if (existingFiles[i].name == oname.toString()) {
						result = "FAILED:  " + oname + " already exists";
						return false;
					}
				}
				result = "success";
				return file = new File(File.STATIC + cloudinaryFolderName + oname);
			} else {
				result = "error";
			}
		}));

	} else {
		result = "error";
	}
	// checks if file exists upload it to cloudinary
	if (file) {
		Calls.uploadFileToCloudinary(file, 'static');
	}
	// execute main controller for managing images and videos with result message
	return imageManager(result);

}

/**
 * deletes images and video in BM and Cloudinary,
 * 
 */

function deleteImage() {
	var image = request.httpParameterMap.file.value;
	var id = request.httpParameterMap.id.value;
	var file = new File(image);
	file.remove();
	Calls.deleteFileOnCloudinary(id);
	return imageManager();
}

/**
 * renders cloudinary url for images,
 * 
 */

function getSlotImageURL() {
	var imageURL = URLgenerator.getUrlForContentSlot(request.httpParameterMap);

	ISML.renderTemplate('cloudinary/renderimageurl', {
		imageURL: imageURL
	});
}
/**
 * renders cloudinary url for videos,
 * 
 */
function getSlotVideo() {
	ISML.renderTemplate('cloudinary/video/slotvideo', {
		cloudinaryRequest: request.httpParameterMap
	});
}

module.exports.Upload = uploadImage;
module.exports.ImageManager = imageManager;
module.exports.ImageManager.public = true;
module.exports.Upload.public = true;
module.exports.GetSlotImageURL = getSlotImageURL;
module.exports.GetSlotImageURL.public = true;
module.exports.Delete = deleteImage;
module.exports.Delete.public = true;
module.exports.GetSlotVideo = getSlotVideo;
module.exports.GetSlotVideo.public = true;
