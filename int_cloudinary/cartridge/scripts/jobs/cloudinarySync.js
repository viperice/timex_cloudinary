var data = require('~/cartridge/scripts/data/cloudinaryData');
var calls = require('~/cartridge/scripts/lib/calls');

// log failed upload attempt
function logFailedUpload(file, errorMessage) {
    var jobLogger = require('dw/system').Logger.getLogger('Cloudinary', 'Sync-Job');
    jobLogger.error("Error uploading file: {0}, message: {1}", file.fullPath, errorMessage);
    return true;
}

// function for uploading images to Cloudinary
function uploadFiles(lastUpload, folder, folderType, attr) {
    var checkCloudinaryDir = folder.getFullPath();
    var uploadResult, 
        failedFiles = [];

	if (checkCloudinaryDir.search('default/images/Cloudinary') == -1) {
		var listFiles = folder.listFiles();

		for (let i in listFiles) {
			if (listFiles[i].isFile()) {
				var fileModified = (listFiles[i].lastModified() / 1000).toFixed();
				
				if (lastUpload < fileModified) {
					//0. call Cloudinary
                    uploadResult = calls.uploadFileToCloudinary(listFiles[i], folderType, attr);
                    //1. check the operation result
                    if (!uploadResult.ok) {
                        //2. log the file with error
                        logFailedUpload(listFiles[i], uploadResult.message);
                        //3. save for later use
                        failedFiles.push(listFiles[i]);
                    }
				}
			} else {
                failedFiles = failedFiles.concat(uploadFiles(lastUpload, listFiles[i], folderType, attr));
			}
		}
	}
	return failedFiles;
}
/**
 * Job's start pont
 * uploads all content images that was changed 
 * after last jobs run into Cloudinary
*/
function start() {
	if (data.isCloudinaryEnabled()) {
		var exportJobLastRun = data.getExportJobLastRun();
        var File = require('dw/io/File');
        var catalogFailedFiles = [], libraryFailedFiles = [], staticFailedFiles = [];

		var lastUpload;
		if (exportJobLastRun) {
			lastUpload = (Date.parse(exportJobLastRun) / 1000).toFixed();
		} else {
			lastUpload = 0;
		}

		// catalogs
		var siteCatalogs = data.getSiteCatalogs();
		for (let i in siteCatalogs) {
			var catalogId = siteCatalogs[i];
			var catalogFiles = new File(File.CATALOGS + '/' + catalogId);
			var attr = {
				catalogID: catalogId
			}
			catalogFailedFiles = uploadFiles(lastUpload, catalogFiles, 'catalog', attr);	// job last run, folder, folder type, attrs
		}

		// content libraries
		var contentLibraries = data.getContentLibraries();
		for (let i in contentLibraries) {
			var libraryId = contentLibraries[i];
			var libraryFiles = new File(File.LIBRARIES + '/' + libraryId);
			var attr = {
				libraryID: libraryId
			}
			libraryFailedFiles = uploadFiles(lastUpload, libraryFiles, 'library', attr);	// job last run, folder, folder type, attrs
		}

		// static
        var libraryFiles = new File(File.STATIC);
		staticFailedFiles = uploadFiles(lastUpload, libraryFiles, 'static');	// job last run, folder, folder type, attrs

        var jobLogger = require('dw/system').Logger.getLogger('Cloudinary', 'Sync-Job');
        jobLogger.info("Failed files count. Catalog: {0}, Library: {1}, Static: {2}", catalogFailedFiles.length, libraryFailedFiles.length, staticFailedFiles.length);

        // check if there was any failed file
        if (catalogFailedFiles.length == 0 && libraryFailedFiles.length == 0 && staticFailedFiles.length == 0) {
            //update preferences value
            var date = new Date();
            data.setExportJobLastRun(date);
        }

	}
}

module.exports.Start = start;