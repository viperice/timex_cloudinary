/** 
 * PDP
*/
module.exports.pdpPrimaryImage = {
	size433w : {style: "(max-width: 433px) 330px 396px", width:"433"},
	size1024w : {style: "(min-width: 1024px) 900px 1080px", width:"900"}
};

module.exports.pdpInfoImage = {
	size480w : {style: "(max-width: 1023px) 365px, 575px", width:"480"},
	size768w : {width:"768"},
	size1024w : {width:"1024"}
};

/** 
 * PLP
*/
module.exports.plpTileImageMobile = {
		size174w : {width:"174"}
	};

module.exports.plpTileImage = {
		size265w : {width:"265"}
	};

module.exports.plpTileImageCertona = {
		size318w : {width:"318"}
	};


/** 
 * CONTENT ASSET TEMPLATES
 * No size for hero images, the heroimage template is using the picture tag
*/
module.exports.heroImage = {
	size320w : {width:"320"},
	size480w : {width:"480"},
	size768w : {width:"768"},
	size1024w : {width:"1024"},
	size1440w : {width:"1440"},
	size1600w : {width:"1600"},
	size1920w : {width:"1920"}
};

// If mobile image has a different dimensions: landscape vs portrait
module.exports.heroImageMobile = {
	size320w : {width:"320"},
	size480w : {width:"480"},
	size768w : {width:"768"},
	size1024w : {width:"1024"}
};

// For tile like images, 2-3 in the row
module.exports.heroImageSmall = {
	size480w : {width:"480"},
	size768w : {style: "(max-width: 640px)", width:"640"}
};

module.exports.heroImageSmallMobile = {
	size480w : {width:"480"},
	size768w : {style: "(max-width: 768px)", width:"768"}
};

/** 
 * NAV IMAGES
*/
module.exports.navImages = {
	size330w : {style: "330px", width:"330"},
	size480w : {width:"480"},
	size660w : {width:"660"}
};

/** 
 * CART & CHECKOUT
*/
module.exports.cartImages = {
	size120w : {style: "(max-width: 1023px) 108px, 126px", width:"120"},
	size240w : {width:"240"}
};

module.exports.miniCartImages = {
	size80w : {style: "77px", width:"80"},
	size160w : {width:"160"}
};

module.exports.checkoutImages = {
	size80w : {style: "77px", width:"80"},
	size160w : {width:"160"}
};