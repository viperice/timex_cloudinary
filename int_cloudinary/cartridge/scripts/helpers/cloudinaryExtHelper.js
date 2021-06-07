/* API includes */
var URLUtils = require('dw/web/URLUtils');
var File = require('dw/io/File');
/* Local includes */
var data = require('~/cartridge/scripts/data/cloudinaryData');
var calls = require('~/cartridge/scripts/lib/calls');
var defaultCloudinaryURL = 'http://res.cloudinary.com/';
var cloudName = data.getCloudName();
var imageFormats = require('~/cartridge/scripts/data/imageFormats').getImageFormats();
var videoFormats = require('~/cartridge/scripts/data/imageFormats').getVideoFormats();

/**
 * Function for searching images
 * returns array of objects (images)
 * @param {string} search
 * @returns {Array}
 */
function getImages(search) {
	var images = [];
	var type = '';
	// images from STATIC
	var directory = new File(File.STATIC + "/default/images/Cloudinary");
	var uploadedImages = directory.listFiles();
	if (uploadedImages) {
		for (var i = 0; i < uploadedImages.length; i++) {
			var filePath = uploadedImages[i].getFullPath();
			var indexOfDefault = filePath.indexOf("/default/") + 9;
			var path = filePath.substring(indexOfDefault);

			var fileType = path.substring(path.lastIndexOf('.') + 1);

			if (imageFormats.indexOf(fileType) > -1) {
				type = 'image';
			}

			if (videoFormats.indexOf(fileType) > -1) {
				type = 'video';
			}

			if (type === "image" || type === "video") {

				var image = {
					path: defaultCloudinaryURL + cloudName + '/' + type + '/upload/Static/' + path,
					public_id: 'Static/' + path,
					file: uploadedImages[i].fullPath,
					type: type,
					time: uploadedImages[i].lastModified()
				}

				if (search) {
					var name = image.public_id.toString();
					name = name.toLowerCase();
					if (name.indexOf(search.toLowerCase()) != -1) {
						images.push(image);
					}
				} else {
					images.push(image);
				}
			}
		}
	}
	images = images.sort(function (a, b) {
		return b.time - a.time;
	})
	// other images
	var catalogImages = GetContentFiles(data.getSiteCatalogs(), "Catalogs", search);
	var libraryImages = GetContentFiles(data.getContentLibraries(), "Libraries", search);
	images.push.apply(images, libraryImages);
	images.push.apply(images, catalogImages);

	return images;
}

/** 
* functions for searchin images in Catalogs and Libraries
* returns array of pathes
* @param {Object} Content
* @param {string} Dir
* @param {string} search
* @returns {Array}
*/
function GetContentFiles(Content, Dir, search) {
	var patharr = [];
	for (let i in Content) {
		var directory = Content[i];
		var DIR = Dir.toUpperCase()
		var file = new File(File[DIR] + '/' + directory);
		patharr.push.apply(patharr, getfiles(file, Dir + "/" + directory, search));
	}
	return patharr;
}

/** 
* Return ready object for isml template
* @param {string} path
* @param {string} fullPath
* @param {string} type
* @returns {Object}
*/
function createImageItem(path, fullPath, type) {
	return {
		path: defaultCloudinaryURL + cloudName + '/' + type + '/upload/' + path,
		public_id: path,
		file: fullPath,
		type: type
	}
}

/** 
* Returns array of ready objects from folder and subfolders with reccursion
* @param {Folder} folder
* @param {string} name
* @param {string} search
* @returns {Array}
*/
function getfiles(folder, name, search) {
	var arr = [];
	var type = '';
	var list = folder.listFiles();
	for (var i = 0; i < list.length; i++) {
		if (list[i].isDirectory()) {
			arr.push.apply(arr, getfiles(list[i], name, search));
		}
		if (list[i].isFile()) {

			var filePath = list[i].getFullPath();
			var indexOfDefault = filePath.indexOf("default/");
			var path = filePath.substring(indexOfDefault);
			
			
			var fileType = path.substring(path.lastIndexOf('.') + 1);
			if (imageFormats.indexOf(fileType) > -1) {
				type = 'image';
			}

			if (videoFormats.indexOf(fileType) > -1) {
				type = 'video';
			}

			if (type === "image" || type === "video") {
				if (search) {
					var searchname = path.replace('default', name);
					searchname = searchname.toLowerCase();

					if (searchname.indexOf(search.toLowerCase()) != -1) {
						arr.push(createImageItem(path.replace('default', name), path.fullPath, type));
					}
				} else {
					arr.push(createImageItem(path.replace('default', name), path.fullPath, type));
				}
			}
		}
	}
	return arr;
}

/** 
* Returns the image for transformation it checks if this image exists in BM
* @param {string} image
* @returns {Object}
*/
function searchImageForTransform(image) {
	var isImage = false;
	var pointer = image.search("/");
	var path;
	var resultImage = '';
	var message = "";
	var content = image.substr(0, pointer);
	// checking if public_ID starts with allowed words
	if ((content === 'Static') || (content === 'Libraries') || (content === 'Catalogs')) {

		var folderPath = image.slice(pointer, image.lastIndexOf("/"));
		var fName = image.substr(image.lastIndexOf("/") + 1);
		// looking in libraries and Catalogs		
		if (content !== "Static") {
			var context = folderPath.slice(folderPath.search("/") + 1, folderPath.indexOf("/", 1));
			var result = GetContentFiles([context], content, fName);
			if (result.length > 0) {
				isImage = true;
				resultImage = result[0].public_id;
			} else {
				message = "image not found";
			}
		} else {
			// looking in static 		
			try {
				var folder = new File(File[content.toUpperCase()] + '/default' + folderPath);
				folder = folder.listFiles();
				for (var i = 0; i < folder.length; i++) {
					if (folder[i].name.indexOf(fName) != -1) {
						isImage = true;
						var filePath = folder[i].getFullPath();
						var indexOfDefault = filePath.indexOf("/default/") + 8;
						var path = filePath.substring(indexOfDefault);
						resultImage = content + path;
						break
					}
				}
			} catch (e) {
				message = "image not found";
			}
		}
	} else {
		message = "image not found";
	}
	return {
		isImage: isImage,
		resultImage: resultImage,
		message: message
	}
}

module.exports.searchImageForTransform = searchImageForTransform;
module.exports.getImages = getImages;
