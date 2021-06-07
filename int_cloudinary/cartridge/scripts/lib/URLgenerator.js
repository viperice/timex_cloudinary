/* API includes */
var URLUtils = require('dw/web/URLUtils');
var ContentMgr = require('dw/content/ContentMgr');
var CatalogMgr = require('dw/catalog/CatalogMgr');
/* Local includes */
var data = require('~/cartridge/scripts/data/cloudinaryData');
var calls = require('~/cartridge/scripts/lib/calls');
var imageSizes = require('~/cartridge/scripts/data/imageSizes');
var srcsets = require('~/cartridge/scripts/data/srcsets');

/**
 * Returns th Cloudinary URL
 * @returns {string} 
 */
function getCloudinaryURL() {
	var cloudinaryURL = 'res.cloudinary.com/' + data.getCloudName();
	if (data.getCloudinaryCNAME()) {
		cloudinaryURL = data.getCloudinaryCNAME();
	}
	var protocol = request.httpProtocol + '://'
	return protocol + cloudinaryURL;
}

/**
 * Returns the image size
 * @param {string} size 
 * @returns {string} 
 */
function getImageSize(size) {
	var imageSize = '';
	var dimension = [];
	var width = '';
	var height = '';
	if (size) {
		if (typeof size == "string" && imageSizes[size]) {
			width = imageSizes[size].width != '' ? 'w_' + imageSizes[size].width : '';
			height = imageSizes[size].height != '' ? 'h_' + imageSizes[size].height : '';
		} else if (typeof size == "object") {
			width = size.width ? 'w_' + size.width : '';
			height = size.height ? 'h_' + size.height : '';
		}
		if (width != '') {
			dimension.push(width);
		}
		if (height != '') {
			dimension.push(height);
		}
		imageSize = dimension.join(',');
		if (imageSize != '') {
			imageSize = imageSize + ',c_fit/';
		}
	}
	return imageSize;
}

/**
 * Returns url in BM 
 * @param {string} imageId 
 * @param {string} defaultImageURL 
 * @param {string} templateTransformations 
 * @param {string} templateSeosuffix
 * @returns {string} 
 * @returns {string}
 */
function getBMImageUrl(imageId, defaultImageURL, templateTransformations, templateSeosuffix) {
	if (data.isCloudinaryEnabled()) {
		var transformations = templateTransformations ? templateTransformations : '';
		var seoSuffix = templateSeosuffix ? templateSeosuffix : '';

		// site global transformations
		var CloudinaryGlobalImageSettings = JSON.parse(data.getImageTransformationsFree());
		if (CloudinaryGlobalImageSettings) {
			if (transformations == '' && CloudinaryGlobalImageSettings.transformations) {
				transformations = CloudinaryGlobalImageSettings.transformations;
			}
			if (seoSuffix == '' && CloudinaryGlobalImageSettings.seoSuffix) {
				seoSuffix = CloudinaryGlobalImageSettings.seoSuffix;
			}
		}
		var imageURL = '';
		if (seoSuffix != '') {
			imageURL = getCloudinaryURL() + '/images/' + data.getImageDropdowns() + transformations + '/' + imageId + '/' + seoSuffix;
		} else {
			imageURL = getCloudinaryURL() + '/image/upload/' + data.getImageDropdowns() + transformations + '/' + imageId;
		}
		return imageURL;
	}
	return defaultImageURL;
}

/**
 * Returns URL for Product image
 * @param {Object} templateProduct 
 * @param {Object} image 
 * @param {string} size 
 * @param {boolean} useSrcset 
 * @param {string} customSrcset
 * @returns {object} 
 */
function getUrlForProductImage(templateProduct, image, size, useSrcset, customSrcset) {
	if (data.isCloudinaryEnabled()) {
		var folder = 'Catalogs/';
		var cat;
		var masterProduct;
		var imageSize = getImageSize(size);
		var product;

		if ('selectedVariant' in templateProduct) {	// is variation model
			if (templateProduct.selectedVariant) {
				product = templateProduct.getSelectedVariant();
				masterProduct = templateProduct.getMaster();
			} else {
				product = templateProduct.getMaster();
			}
		} else if ('variationModel' in templateProduct) {	// for slots products
			if (templateProduct.variationModel && ('selectedVariant' in templateProduct.variationModel)) {
				if (templateProduct.variationModel.selectedVariant) {
					product = templateProduct.variationModel.getSelectedVariant();
					masterProduct = templateProduct.variationModel.getMaster();
				} else {
					product = templateProduct.variationModel.getMaster() || templateProduct;
				}
			}
		} else {
			product = templateProduct;
		}

		var imageURL = image.URL.toString();
		var imageCatalog = imageURL.substring(imageURL.indexOf('/on/demandware.static/-/Sites-') + 30);
		imageCatalog = imageCatalog.substring(0, imageCatalog.indexOf('/') + 1);
		var imageId = imageURL.substring(imageURL.indexOf('default') + 7);
		imageId = imageId.substring(imageId.indexOf('images'));
		var productImageId = imageId.substring(imageId.indexOf('images') + 7);
		var transformations = '';
		var seoSuffix = '';

		// image transformations
		var CloudinaryImageSettings = JSON.parse(product.custom.CloudinaryImageSettings);
		if (CloudinaryImageSettings && CloudinaryImageSettings[productImageId]) {
			if (CloudinaryImageSettings[productImageId].transformations) {
				transformations = CloudinaryImageSettings[productImageId].transformations + '/';
			}
			if (CloudinaryImageSettings[productImageId].seoSuffix) {
				seoSuffix = CloudinaryImageSettings[productImageId].seoSuffix;
			}
		}

		// product transformations
		var CloudinaryGlobalImageSettings = JSON.parse(product.custom.CloudinaryGlobalImageSettings);
		if (CloudinaryGlobalImageSettings) {
			if (transformations == '' && CloudinaryGlobalImageSettings.transformations) {
				transformations = CloudinaryGlobalImageSettings.transformations + '/';
			}
			if (seoSuffix == '' && CloudinaryGlobalImageSettings.seoSuffix) {
				seoSuffix = CloudinaryGlobalImageSettings.seoSuffix;
			}
		}

		if (masterProduct) {	// check master product for variation
			// check transformations for master
			// image transformations
			var CloudinaryImageSettings = JSON.parse(masterProduct.custom.CloudinaryImageSettings);
			if (CloudinaryImageSettings && CloudinaryImageSettings[productImageId]) {
				if (transformations == '' && CloudinaryImageSettings[productImageId].transformations) {
					transformations = CloudinaryImageSettings[productImageId].transformations + '/';
				}
				if (seoSuffix == '' && CloudinaryImageSettings[productImageId].seoSuffix) {
					seoSuffix = CloudinaryImageSettings[productImageId].seoSuffix;
				}
			}

			// product transformations
			var CloudinaryGlobalImageSettings = JSON.parse(masterProduct.custom.CloudinaryGlobalImageSettings);
			if (CloudinaryGlobalImageSettings) {
				if (transformations == '' && CloudinaryGlobalImageSettings.transformations) {
					transformations = CloudinaryGlobalImageSettings.transformations + '/';
				}
				if (seoSuffix == '' && CloudinaryGlobalImageSettings.seoSuffix) {
					seoSuffix = CloudinaryGlobalImageSettings.seoSuffix;
				}
			}

			// get product category
			cat = masterProduct.getPrimaryCategory();
		} else {
			// get only category
			cat = product.getPrimaryCategory();
		}

		// category global transformations
		var CloudinaryGlobalImageSettings = JSON.parse(cat.custom.CloudinaryGlobalImageSettings);
		if (CloudinaryGlobalImageSettings) {
			if (transformations == '' && CloudinaryGlobalImageSettings.transformations) {
				transformations = CloudinaryGlobalImageSettings.transformations + '/';
			}
			if (seoSuffix == '' && CloudinaryGlobalImageSettings.seoSuffix) {
				seoSuffix = CloudinaryGlobalImageSettings.seoSuffix;
			}
		}

		// site global transformations
		var CloudinaryGlobalImageSettings = JSON.parse(data.getImageTransformationsFree());
		if (CloudinaryGlobalImageSettings) {
			if (transformations == '' && CloudinaryGlobalImageSettings.transformations) {
				transformations = CloudinaryGlobalImageSettings.transformations + '/';
			}
			if (seoSuffix == '' && CloudinaryGlobalImageSettings.seoSuffix) {
				seoSuffix = CloudinaryGlobalImageSettings.seoSuffix;
			}
		}
		var imageType = imageId.substring(imageId.lastIndexOf('.'));
		imageId = imageId.substring(0, imageId.lastIndexOf('.'));

		if (useSrcset) {
			var srcset;
			if (seoSuffix != '') {
				imageURL = getCloudinaryURL() + '/images/' + data.getImageDropdowns() + transformations + imageSize + folder + imageCatalog + imageId + '/' + seoSuffix + imageType;
				var srcsetObject = getSrcsetForProductImage(getCloudinaryURL() + '/images/' + data.getImageDropdowns() + transformations, '/' + folder + imageCatalog + imageId + '/' + seoSuffix + imageType, customSrcset);
				srcset = srcsetObject.text;
				clearSrcset = srcsetObject.clearSrcset;
			} else {
				imageURL = getCloudinaryURL() + '/image/upload/' + data.getImageDropdowns() + transformations + imageSize + folder + imageCatalog + imageId + imageType;
				var srcsetObject = getSrcsetForProductImage(getCloudinaryURL() + '/image/upload/' + data.getImageDropdowns() + transformations, '/' + folder + imageCatalog + imageId + imageType, customSrcset);
				srcset = srcsetObject.text;
				clearSrcset = srcsetObject.clearSrcset;
			}
			return {
				imageUrl: imageURL,
				srcset: srcset,
				clearSrcset: clearSrcset
			}
		} else {

			if (seoSuffix != '') {
				imageURL = getCloudinaryURL() + '/images/' + data.getImageDropdowns() + transformations + imageSize + folder + imageCatalog + imageId + '/' + seoSuffix + imageType;
			} else {
				imageURL = getCloudinaryURL() + '/image/upload/' + data.getImageDropdowns() + transformations + imageSize + folder + imageCatalog + imageId + imageType;
			}
			return {imageUrl: imageURL};
		}
	}

	return {imageUrl: image.getURL()};
}

/**
 * Returns video public_id from Cloudinary 
 * @param {Object} video 
 * @returns {string}
 */
function getProductVideoPublicId(video) {
	if (data.isCloudinaryEnabled()) {
		var folder = 'Catalogs/';
		var videoURL = video.URL.toString();
		var videoCatalog = videoURL.substring(videoURL.indexOf('/on/demandware.static/-/Sites-') + 30);
		videoCatalog = videoCatalog.substring(0, videoCatalog.indexOf('/') + 1);
		var videoId = videoURL.substring(videoURL.indexOf('default') + 7);
		videoId = videoId.substring(videoId.indexOf('images'));
		videoId = videoId.substring(0, videoId.lastIndexOf('.'));
		return folder + videoCatalog + videoId;
	}
	return video.getURL();
}

/**
 * Returns video public_id from Cloudinary 
 * @param {Object} video 
 * @returns {string}
 */
function getSlotVideoPublicId(params) {
	var folder = 'Libraries/';
	var videoId = params.videoId.empty ? '' : params.videoId.stringValue;
	var libraryId = params.libraryId.empty ? '' : params.libraryId.stringValue;
	var contentId = params.contentId.empty ? '' : params.contentId.stringValue;
	var transformations = params.transformations.empty ? '' : params.transformations.stringValue + '/';
	var seoSuffix = params.seoSuffix.empty ? '' : params.seoSuffix.stringValue;

	videoId = videoId.substring(0, videoId.lastIndexOf('.'));

	return folder + '/' + libraryId + '/' + videoId;
}

/**
 * Returns transformation string for video
 * @param {Object} templateProduct 
 * @param {Object} video
 * @returns {string} 
 */
function getProductVideoTransformations(templateProduct, video) {
	var folder = 'Catalogs/';
	var cat;
	var masterProduct;
	var product;

	if ('selectedVariant' in templateProduct) {	// is variation model
		if (templateProduct.selectedVariant) {
			product = templateProduct.getSelectedVariant();
			masterProduct = templateProduct.getMaster();
		} else {
			product = templateProduct.getMaster();
		}
	} else if ('variationModel' in templateProduct) {	// for slots products
		if (templateProduct.variationModel && ('selectedVariant' in templateProduct.variationModel)) {
			if (templateProduct.variationModel.selectedVariant) {
				product = templateProduct.variationModel.getSelectedVariant();
				masterProduct = templateProduct.variationModel.getMaster();
			} else {
				product = templateProduct.variationModel.getMaster();
			}
		}
	} else {
		product = templateProduct;
	}

	var videoURL = video.URL.toString();
	var videoCatalog = videoURL.substring(videoURL.indexOf('/on/demandware.static/-/Sites-') + 30);
	videoCatalog = videoCatalog.substring(0, videoCatalog.indexOf('/') + 1);
	var videoId = videoURL.substring(videoURL.indexOf('default') + 7);
	videoId = videoId.substring(videoId.indexOf('images'));
	var productVideoId = videoId.substring(videoId.indexOf('images') + 7);
	var transformations = '';

	// image transformations
	var CloudinaryVideoSettings = JSON.parse(product.custom.CloudinaryVideoSettings);
	if (CloudinaryVideoSettings && CloudinaryVideoSettings[productVideoId]) {
		if (CloudinaryVideoSettings[productVideoId].transformations) {
			transformations = CloudinaryVideoSettings[productVideoId].transformations;
		}
	}

	// product transformations
	var CloudinaryGlobalVideoSettings = JSON.parse(product.custom.CloudinaryGlobalVideoSettings);
	if (CloudinaryGlobalVideoSettings) {
		if (empty(transformations) && CloudinaryGlobalVideoSettings.transformations) {
			transformations = CloudinaryGlobalVideoSettings.transformations;
		}
	}

	if (masterProduct) {	// check master product for variation
		// check transformations for master
		// image transformations
		var CloudinaryVideoSettings = JSON.parse(masterProduct.custom.CloudinaryVideoSettings);
		if (CloudinaryVideoSettings && CloudinaryVideoSettings[productVideoId]) {
			if (CloudinaryVideoSettings[productVideoId].transformations) {
				transformations = CloudinaryVideoSettings[productVideoId].transformations;
			}
		}

		// product transformations
		var CloudinaryGlobalVideoSettings = JSON.parse(masterProduct.custom.CloudinaryGlobalVideoSettings);
		if (CloudinaryGlobalVideoSettings) {
			if (empty(transformations) && CloudinaryGlobalVideoSettings.transformations) {
				transformations = CloudinaryGlobalVideoSettings.transformations;
			}
		}

		// get product category
		cat = masterProduct.getPrimaryCategory();
	} else {
		// get only category
		cat = product.getPrimaryCategory();
	}

	// category global transformations
	var CloudinaryVideoSettings = JSON.parse(cat.custom.CloudinaryVideoSettings);
	if (CloudinaryVideoSettings) {
		if (empty(transformations) && CloudinaryVideoSettings.transformations) {
			transformations = CloudinaryVideoSettings.transformations;
		}
	}

	// site global transformations
	var CloudinaryGlobalVideoSettings = JSON.parse(data.getVideoTransformations());
	if (CloudinaryGlobalVideoSettings) {
		if (empty(transformations) && CloudinaryGlobalVideoSettings) {
			transformations = CloudinaryGlobalVideoSettings;
		}
	}
	return transformations == '' ? '' : JSON.stringify(transformations);
}

/**
 * Returns transformation string for video
 * @param {Object} cloudinaryRequest
 * @returns {string} 
 */
function getSlotVideoTransformations(cloudinaryRequest) {
	var parameterNames = cloudinaryRequest.parameterNames;
	var requiredParameters = ['libraryId', 'contentId', 'videoId'];
	var transformationsNames = [];
	for (let i in parameterNames) {
		if (requiredParameters.indexOf(parameterNames[i]) == -1) {
			transformationsNames.push(parameterNames[i]);
		}
	}
	var transformations = {};
	for (let i in transformationsNames) {
		transformations[transformationsNames[i]] = cloudinaryRequest[transformationsNames[i]].stringValue;
	}

	if (empty(transformations)) {
		var libraryId = cloudinaryRequest.libraryId.stringValue;
		var contentId = cloudinaryRequest.contentId.stringValue;
		var folder = 'Libraries/';
		var contentLibrary = ContentMgr.getLibrary(libraryId);
		var contentAsset = ContentMgr.getContent(contentLibrary, contentId);
		var CloudinaryVideoSettings = JSON.parse(contentAsset.custom.CloudinaryVideoSettings.transformations);

		if (CloudinaryVideoSettings && CloudinaryVideoSettings.transformations) {
			transformations = CloudinaryVideoSettings.transformations;
		}

		// site global transformations
		if (empty(transformations)) {
			var CloudinaryVideoSettings = JSON.parse(data.getVideoTransformations());
			if (CloudinaryVideoSettings && CloudinaryVideoSettings.transformations) {
				transformations = CloudinaryVideoSettings.transformations;
			}
		}
	}
	return JSON.stringify(transformations);
}

/**
 * Returns url for product swatches images 
 * @param {Object} templateProduct 
 * @param {Object} swatchImageUrl 
 * @returns {string}
 */
function getUrlForProductSwatch(templateProduct, swatchImageUrl) {
	if (data.isCloudinaryEnabled()) {
		var folder = 'Catalogs/';
		var product;
		if ('selectedVariant' in templateProduct) {	// is variation model
			if (templateProduct.selectedVariant) {
				product = templateProduct.selectedVariant;
			} else {
				product = templateProduct.master;
			}
		} else {
			product = templateProduct;
		}

		var imageURL = swatchImageUrl.toString();
		var imageCatalog = imageURL.substring(imageURL.indexOf('/on/demandware.static/-/Sites-') + 30);
		imageCatalog = imageCatalog.substring(0, imageCatalog.indexOf('/') + 1);
		var imageId = imageURL.substring(imageURL.indexOf('default') + 7);
		imageId = imageId.substring(imageId.indexOf('images'));
		var productImageId = imageId.substring(imageId.indexOf('images') + 7);
		var transformations = '';
		var seoSuffix = '';

		// image transformations
		var CloudinaryImageSettings = JSON.parse(product.custom.CloudinaryImageSettings);
		if (CloudinaryImageSettings && CloudinaryImageSettings[productImageId]) {
			if (CloudinaryImageSettings[productImageId].transformations) {
				transformations = CloudinaryImageSettings[productImageId].transformations + '/';
			}
			if (CloudinaryImageSettings[productImageId].seoSuffix) {
				seoSuffix = CloudinaryImageSettings[productImageId].seoSuffix;
			}
		}

		// product transformations
		var CloudinaryGlobalImageSettings = JSON.parse(product.custom.CloudinaryGlobalImageSettings);
		if (CloudinaryGlobalImageSettings) {
			if (transformations == '' && CloudinaryGlobalImageSettings.transformations) {
				transformations = CloudinaryGlobalImageSettings.transformations + '/';
			}
			if (seoSuffix == '' && CloudinaryGlobalImageSettings.seoSuffix) {
				seoSuffix = CloudinaryGlobalImageSettings.seoSuffix;
			}
		}

		var imageType = imageId.substring(imageId.lastIndexOf('.'));
		imageId = imageId.substring(0, imageId.lastIndexOf('.'));
		if (seoSuffix != '') {
			imageURL = getCloudinaryURL() + '/images/' + data.getImageDropdowns() + transformations + folder + imageCatalog + imageId + '/' + seoSuffix + imageType;
		} else {
			imageURL = getCloudinaryURL() + '/image/upload/' + data.getImageDropdowns() + transformations + folder + imageCatalog + imageId + imageType;
		}
		return imageURL;
	}
	return swatchImageUrl;
}

/**
 * Returns url for category
 * @param {string} categoryId 
 * @param {Object} categoryImageUrl 
 * @param {string} size 
 * @returns {string}
 */
function getUrlForCategory(categoryId, categoryImageUrl, size) {
	if (data.isCloudinaryEnabled()) {
		var folder = 'Catalogs/';
		var imageSize = getImageSize(size);
		var imageURL = categoryImageUrl.toString();
		var imageCatalog = imageURL.substring(imageURL.indexOf('/on/demandware.static/-/Sites-') + 30);
		imageCatalog = imageCatalog.substring(0, imageCatalog.indexOf('/') + 1);
		var imageId = imageURL.substring(imageURL.indexOf('default') + 8);
		imageId = imageId.substring(imageId.indexOf('/') + 1);
		var transformations = '';
		var seoSuffix = '';

		// category global transformations
		var cat = CatalogMgr.getCategory(categoryId);
		var CloudinaryGlobalImageSettings = JSON.parse(cat.custom.CloudinaryGlobalImageSettings);
		if (CloudinaryGlobalImageSettings) {
			if (transformations == '' && CloudinaryGlobalImageSettings.transformations) {
				transformations = CloudinaryGlobalImageSettings.transformations + '/';
			}
			if (seoSuffix == '' && CloudinaryGlobalImageSettings.seoSuffix) {
				seoSuffix = CloudinaryGlobalImageSettings.seoSuffix;
			}
		}

		// site global transformations
		var CloudinaryGlobalImageSettings = JSON.parse(data.getImageTransformationsFree());
		if (CloudinaryGlobalImageSettings) {
			if (transformations == '' && CloudinaryGlobalImageSettings.transformations) {
				transformations = CloudinaryGlobalImageSettings.transformations + '/';
			}
			if (seoSuffix == '' && CloudinaryGlobalImageSettings.seoSuffix) {
				seoSuffix = CloudinaryGlobalImageSettings.seoSuffix;
			}
		}

		var imageType = imageId.substring(imageId.lastIndexOf('.'));
		imageId = imageId.substring(0, imageId.lastIndexOf('.'));

		if (seoSuffix != '') {
			imageURL = getCloudinaryURL() + '/images/' + data.getImageDropdowns() + transformations + imageSize + folder + imageCatalog + imageId + '/' + seoSuffix + imageType;
		} else {
			imageURL = getCloudinaryURL() + '/image/upload/' + data.getImageDropdowns() + transformations + imageSize + folder + imageCatalog + imageId + imageType;
		}
		return imageURL;
	}
	return categoryImageUrl;
}

/**
 * Returns URL for content slot
 * @param {Object} params 
 * @returns {string}
 */
function getUrlForContentSlot(params) {
	var imageId = params.imageId.empty ? '' : params.imageId.stringValue;
	var libraryId = params.libraryId.empty ? '' : params.libraryId.stringValue;
	var contentId = params.contentId.empty ? '' : params.contentId.stringValue;
	var transformations = params.transformations.empty ? '' : params.transformations.stringValue + '/';
	var seoSuffix = params.seoSuffix.empty ? '' : params.seoSuffix.stringValue;
	var size = params.size.empty ? '' : params.size.stringValue;
	var imageSize = getImageSize(size);

	if (data.isCloudinaryEnabled()) {
		var imageURL = '';
		var folder = 'Libraries/';
		var contentLibrary = ContentMgr.getLibrary(libraryId);
		var contentAsset = ContentMgr.getContent(contentLibrary, contentId);
		// product transformations
		var CloudinaryGlobalImageSettings = JSON.parse(contentAsset.custom.CloudinaryGlobalImageSettings);
		if (CloudinaryGlobalImageSettings) {
			if (transformations == '' && CloudinaryGlobalImageSettings.transformations) {
				transformations = CloudinaryGlobalImageSettings.transformations + '/';
			}
			if (seoSuffix == '' && CloudinaryGlobalImageSettings.seoSuffix) {
				seoSuffix = CloudinaryGlobalImageSettings.seoSuffix;
			}
		}

		// site global transformations
		var CloudinaryGlobalImageSettings = JSON.parse(data.getImageTransformationsFree());
		if (CloudinaryGlobalImageSettings) {
			if (transformations == '' && CloudinaryGlobalImageSettings.transformations) {
				transformations = CloudinaryGlobalImageSettings.transformations + '/';
			}
			if (seoSuffix == '' && CloudinaryGlobalImageSettings.seoSuffix) {
				seoSuffix = CloudinaryGlobalImageSettings.seoSuffix;
			}
		}

		if (seoSuffix != '') {
			var imageType = imageId.substring(imageId.lastIndexOf('.'));
			imageId = imageId.substring(0, imageId.lastIndexOf('.'));
			imageURL = getCloudinaryURL() + '/images/' + data.getImageDropdowns() + transformations + imageSize + folder + libraryId + '/' + imageId + '/' + seoSuffix + imageType;
		} else {
			imageURL = getCloudinaryURL() + '/image/upload/' + data.getImageDropdowns() + transformations + imageSize + folder + libraryId + '/' + imageId;
		}
		return imageURL;
	}
	var staticURL = URLUtils.imageURL(URLUtils.CONTEXT_LIBRARY, libraryId, imageId, {});
	return staticURL;
}

/**
 * Returns srcset
 * @param {string} firstPart 
 * @param {string} secondPart 
 * @param {string} customSrcset 
 * @returns {Object}
 */
function getSrcsetForProductImage(firstPart, secondPart, customSrcset) {
	var imgsrcset = {
		text: '',
		clearSrcset: ''
	};
	if (data.isCloudinaryEnabled()) {
		var SrcsetSizes;

		if (customSrcset && typeof customSrcset == "string" && srcsets[customSrcset]) {
			SrcsetSizes = srcsets[customSrcset];
		} else if (customSrcset && typeof customSrcset == "object") {
			SrcsetSizes = customSrcset;
		}

		if (SrcsetSizes) {
			var keys = Object.keys(SrcsetSizes);
			var clearSrcset = '';
			var srcsetText = "srcset='";
			var sizesText = "sizes='";
			for (var i = 0; i < keys.length; i++) {
				var size = keys[i].replace('size', '');
				var dimension = [];
				var width = SrcsetSizes[keys[i]].width ? 'w_' + SrcsetSizes[keys[i]].width : '';
				var height = SrcsetSizes[keys[i]].height ? 'h_' + SrcsetSizes[keys[i]].height : '';
	
				if (width != '') {
					dimension.push(width);
				}
				if (height != '') {
					dimension.push(height);
				}

				var urlSize = dimension.join(',') + ',c_fit';
				var chImageUrl = firstPart + urlSize + secondPart;
				clearSrcset = clearSrcset + chImageUrl + " " + size + ", ";
				sizesText = sizesText + SrcsetSizes[keys[i]].style + ", ";
			}
			srcsetText = srcsetText + clearSrcset + "' ";
			sizesText = sizesText + "'";
			imgsrcset.text = srcsetText + sizesText;
			imgsrcset.clearSrcset = clearSrcset;
		}
	}
	return imgsrcset;
}

module.exports.getSrcsetForProductImage = getSrcsetForProductImage;
module.exports.getUrlForProductImage = getUrlForProductImage;
module.exports.getBMImageUrl = getBMImageUrl;
module.exports.getProductVideoPublicId = getProductVideoPublicId;
module.exports.getProductVideoTransformations = getProductVideoTransformations;
module.exports.getSlotVideoPublicId = getSlotVideoPublicId;
module.exports.getSlotVideoTransformations = getSlotVideoTransformations;
module.exports.getUrlForProductSwatch = getUrlForProductSwatch;
module.exports.getUrlForCategory = getUrlForCategory;
module.exports.getUrlForContentSlot = getUrlForContentSlot;