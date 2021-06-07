(function () {
	/**
	 * Library for providing access to DW site preferences
	 */
	var Data = function () {
		var system = require('dw/system'),
			Transaction = require('dw/system/Transaction'),
			currentSite = system.Site.getCurrent(),
			that = this;

		/**
		 * @returns {boolean}
		 */
		that.isCloudinaryEnabled = function () {
			return currentSite.getCustomPreferenceValue('CloudinaryEnabled');
		};

		/**
		 * Return Cloudinary API key
		 *
		 * @returns {string} API key
		 */
		that.getAPIKey = function () {
			return currentSite.getCustomPreferenceValue('CloudinaryAPIkey');
		};

		/**
		 * Return Cloudinary API token
		 *
		 * @returns {string} API token
		 */
		that.getSecretKey = function () {
			return currentSite.getCustomPreferenceValue('CloudinarySecretKey');
		};

		/**
		 * Return Cloudinary URL
		 *
		 * @returns {string} URL
		 */
		that.getCloudinaryCNAME = function () {
			return currentSite.getCustomPreferenceValue('CloudinaryCNAME');
		};

		/**
		 * Return Cloudinary Cloud Name
		 *
		 * @returns {string} Cloud Name
		 */
		that.getCloudName = function () {
			return currentSite.getCustomPreferenceValue('CloudinaryCloudName');
		};

		/**
		 * Returns srcset Sizes
		 * @returns {object} srcset Sizes
		 */
		that.getSrcsetSizes = function () {
			return currentSite.getCustomPreferenceValue('CloudinarySrcsetSizes');
		};

		/**
		 * Returns string for transformations
		 * @returns {string}
		 */
		that.getImageTransformationsQuality = function () {
			let quality = currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsQuality').value;
			return quality == 'null' ? '' : 'q_' + quality;
		};

		/**
		 * Returns string for image and video format
		 * @returns {string}
		 */
		that.getImageTransformationsFormat = function () {
			let format = currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsFormat').value;
			return format == 'null' ? '' : 'f_' + format;
		};

		/**
		 * Returns Default settings for image transformations - Device Pixel Ratio (DPR)
		 * @returns  {string}
		 */
		that.getImageTransformationsDPR = function () {
			let dpr = currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsDPR').value;
			return dpr == 'null' ? '' : 'dpr_' + dpr;
		};
		/**
		 * Returns Boolean for Lazy Loading images
		 */
		that.getLazyLoadingImages = function () {
			return currentSite.getCustomPreferenceValue('lazyLoadingImages');
		};
		
		that.getImageDropdowns = function () {
			let quality = that.getImageTransformationsQuality();
			let format = that.getImageTransformationsFormat();
			let dpr = that.getImageTransformationsDPR();
			let lazy = that.getLazyLoadingImages();
			let loading = '';
			if (lazy == 'Yes' || lazy == 'YES' || lazy == true) {
				loading = 'fl_progressive:steep';
			}
			let dropdowns = [];
			if (quality != '') {
				dropdowns.push(quality);
			}
			if (format != '') {
				dropdowns.push(format);
			}
			if (dpr != '') {
				dropdowns.push(dpr);
			}
			if (loading != '') {
				dropdowns.push(loading);
			}
			let dropdownsValue = dropdowns.join(',');
			if (dropdownsValue != '') {
				dropdownsValue = dropdownsValue + '/';
			}
			return dropdownsValue;
		}

		that.getPLPImageDropdowns = function () {
			let quality = that.getImageTransformationsQuality();
			let format = that.getImageTransformationsFormat();
			let dpr = that.getImageTransformationsDPR();
			let lazy = that.getLazyLoadingImages();
			let loading = '';
			if (lazy == 'Yes' || lazy == 'YES' || lazy == true) {
				loading = 'fl_progressive:steep';
			}
			let dropdowns = [];
			if (quality != '') {
				dropdowns.push('q_85');
			}
			if (format != '') {
				dropdowns.push(format);
			}
			if (dpr != '') {
				dropdowns.push(dpr);
			}
			if (loading != '') {
				dropdowns.push(loading);
			}
			let dropdownsValue = dropdowns.join(',');
			if (dropdownsValue != '') {
				dropdownsValue = dropdownsValue + '/';
			}
			return dropdownsValue;
		}

		/**
		 * Returns Default settings for image transformations
		 * @returns {string}
		 */
		that.getImageTransformationsFree = function () {
			return currentSite.getCustomPreferenceValue('CloudinaryImageTransformationsFree');
		};

		/**
		 * Returns Default settings for video transformations - Bit Rate
		 * @returns {string}
		 */
		that.getVideoTransformationsBitRate = function () {
			let bitrate = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsBitRate').value;
			return bitrate == 'default' ? '' : 'br_' + bitrate + '/';
		};

		/**
		 * Returns Default settings for video transformations - Format
		 * @returns {string}
		 */
		that.getVideoTransformationsFormat = function () {
			let format = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsFormat')
			return format == 'default' ? '' : '.' + format;
		};

		/**
		 * Returns Default settings for video transformations - Quality
		 * @returns {string}
		 */
		that.getVideoTransformationsQuality = function () {
			let quality = currentSite.getCustomPreferenceValue('CloudinaryVideoTransformationsQuality').value;
			return quality == 'Auto' ? '' : 'q_' + quality + '/';
		};

		/**
		 * Returns Default settings for video transformations
		 * @returns {string}
		 */
		that.getVideoTransformations = function () {
			return currentSite.getCustomPreferenceValue('CloudinaryVideoTransformations');
		};

		/**
		 * Return Date when export job runs last time
		 * @returns {Date}
		 */
		that.getExportJobLastRun = function () {
			return currentSite.getCustomPreferenceValue('CloudinaryExportJobLastRun');
		};

		/**
		 * Returns All Catalogs used by site
		 * @returns {Array}
		 */
		that.getSiteCatalogs = function () {
			return currentSite.getCustomPreferenceValue('CloudinarySiteCatalogs');
		};

		/**
		 * Returns All Libraries used by site
		 * @returns {Array}
		 */
		that.getContentLibraries = function () {
			return currentSite.getCustomPreferenceValue('CloudinaryContentLibraries');
		};

		/**
		 *  Save site preference value CloudinaryExportJobLastRun
		 */
		that.setExportJobLastRun = function (lastRun) {	// date
			Transaction.wrap(function () {
				currentSite.setCustomPreferenceValue('CloudinaryExportJobLastRun', lastRun);
			});
		};
		
//		Product Tile
		that.getProductImageTransformationsQuality = function () {
			let quality = currentSite.getCustomPreferenceValue('CloudinaryProductImageTransformationsQuality').value;
			return quality == 'null' ? '' : 'q_' + quality;
		};
		that.getProductImageTransformationsDPR = function () {
			let dpr = currentSite.getCustomPreferenceValue('CloudinaryProductImageTransformationsDPR').value;
			return dpr == 'null' ? '' : 'dpr_' + dpr;
		};
		that.getProductImageTransformationsFormat = function () {
			let format = currentSite.getCustomPreferenceValue('CloudinaryProductImageTransformationsFormat').value;
			return format == 'null' ? '' : 'f_' + format;
		};
		that.getProductImageDropdowns = function () {
			let quality = that.getProductImageTransformationsQuality();
			let format = that.getProductImageTransformationsFormat();
			let dpr = that.getProductImageTransformationsDPR();
			let lazy = that.getLazyLoadingImages();
			let loading = '';
			if (lazy == 'Yes' || lazy == 'YES' || lazy == true) {
				loading = 'fl_progressive:steep';
			}
			let dropdowns = [];
			if (quality != '') {
				dropdowns.push(quality);
			}
			if (format != '') {
				dropdowns.push(format);
			}
			if (dpr != '') {
				dropdowns.push(dpr);
			}
			if (loading != '') {
				dropdowns.push(loading);
			}
			let dropdownsValue = dropdowns.join(',');
			if (dropdownsValue != '') {
				dropdownsValue = dropdownsValue + '/';
			}
			return dropdownsValue;
		}
//		Mobile Product Tite
		that.getMobileProductImageTransQuality = function () {
			let quality = currentSite.getCustomPreferenceValue('CloudinaryProductImageTransformationsQuality').value;
			return quality == 'null' ? '' : 'q_' + quality;
		};
		that.getMobileProductImageTransFormat = function () {
			let format = currentSite.getCustomPreferenceValue('CloudinaryProductImageTransformationsFormat').value;
			return format == 'null' ? '' : 'f_' + format;
		};
		that.getMobileProductImageTransDPR = function () {
			return 'dpr_2';
		};
		that.getMobileProductImageDropdowns = function () {
			let quality = that.getMobileProductImageTransQuality();
			let format = that.getMobileProductImageTransFormat();
			let dpr = that.getMobileProductImageTransDPR();
			let dropdowns = [];
			if (quality != '') {
				dropdowns.push(quality);
			}
			if (format != '') {
				dropdowns.push(format);
			}
			if (dpr != '') {
				dropdowns.push(dpr);
			}
			let dropdownsValue = dropdowns.join(',');
			if (dropdownsValue != '') {
				dropdownsValue = dropdownsValue + '/';
			}
			return dropdownsValue;
		}
	};

	module.exports = new Data();
}());