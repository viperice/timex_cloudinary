function getImageFormats(){
	return [
		'jpg', 'jpeg', 'tiff', 'gif', 'bmp', 'png', 'ico', 'svg'
	];
}

function getVideoFormats(){
	return [
		'avi', 'mpeg', 'mp4', 'flv', 'mov', 'mkv', 'mpg', '3gp', 'mpv', 'wmv'
	];
}

module.exports.getVideoFormats = getVideoFormats;
module.exports.getImageFormats = getImageFormats;