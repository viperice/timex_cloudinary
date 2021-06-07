function size(w,h){
	this.width = w || '';
	this.height = h || '';
}

module.exports.small = new size(140, 140);
module.exports.medium = new size(400, 400);
module.exports.large = new size(800);
module.exports.categoryBanner = new size(1280, 300);
module.exports.categoryTile = new size(600, 600);