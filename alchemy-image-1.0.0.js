/**
*	alchemy-image
*	Author: Logan Wilkerson
*
*	Image related javascript tools to go into the alchemy suite.
*/

var alchemy = alchemy || {};
(function(A){

	/*
	*	loadImages
	*	Loads image or images in sources. Once all the images are loaded
	*	it will call the function success with the Image objects. If
	*	there is an error the function failure can be called instead
	*
	*	@param {String/Array} Single src string or array of src strings
	*	@param {Function/Object} Success function or Object containing
	*	the callback functions and options
	*	options.success(images) - success function that will be called
	*	options.error - failure function to call
	*	options.cache - whether the images should be caches
	*/
	A.loadImages = function(sources, options){	
		sources = A.isArray(sources) ? sources : [sources];
		options = !A.isFunction(options) ? options : {success:options};
		A.loadImages._cache = A.loadImages._cache || {};
		var images = [];
		var imagesLoaded = 0;
		var onload = function(){
			imagesLoaded += 1;
			if(sources.length == 1){
				options.success(image);
			}
			else if(imagesLoaded == sources.length && options.success){
				options.success(images);
			}
		};
		var onerror = function(){
			if(options.error){
				options.error();
			}
		};
		for (var i = 0; i < sources.length; i++){
			if(options.cache && (sources[i] in A.loadImages._cache)){
				images.push(A.loadImages._cache[sources[i]]);
				imagesLoaded += 1;
				if(sources.length == 1){
					options.success(A.loadImages._cache[sources[i]]);
				}
				else if(imagesLoaded == sources.length && options.success){
					options.success(images);
				}
				continue;
			}
			var image = new Image();
			images.push(image);
			if(options.cache){
				A.loadImages._cache[sources[i]] = image;
			}
			if(options.crossOrigin){
				image.crossOrigin = 'anonymous';
			}
			image.onload = onload;
			image.onerror = onerror;
			image.src = sources[i];
		}
	};
	
	// Clears the image cache
	A.clearImageCache = function(){
		for (var key in A.loadImages._cache){
      if(A.loadImage._cache.hasOwnProperty(key)){
				delete A.loadImages._cache[key];
      }
		}
	};

	/*
	*	editImage
	*	Requires the canvas element
	*	Edits a given source image based on the settings in options.
	*	Once the edit is complete a base64 encoded string of the image
	*	is passed to the callback function. This function does NOT
	*	edit the original image, and will not work with cross-domain
	*	images
	*	
	*	@param {String} source - the source image
	*	@param {Object} options - the options for editing the image
	*	It can have the following attributes
	*	options.callback {Function} - the callback function to pass
	*		the edit image url too.
	*	options.width - the width of the final image, defaults to
	*		original image width
	*	options.height - the height of the final image, defaults to
	*		original image height
	*	option.toDataURLArgs - This function uses the canvas method
	*		toDataURL to get out the image data. This option is an 
	*		array of arguments to pass to that function. Defaults
	*		to ['image/png']
	*/
	A.editImage = function(source, options){
		var opt = options || {};
		var sourceImage = new Image();
		sourceImage.onload = function(){
			opt.width = typeof opt.width != 'undefined' ? opt.width : sourceImage.width;
			opt.height = typeof opt.height != 'undefined' ? opt.height : sourceImage.height;
			opt.toDataURLArgs = typeof opt.toDataURLArgs != 'undefined' ? opt.toDataURLArgs : ['image/png'];
			var canvas = document.createElement('canvas');
			canvas.width = opt.width;
			canvas.height = opt.height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(sourceImage, 0, 0, opt.width, opt.height);

			if(opt.background){
				ctx.globalCompositeOperation = 'destination-over';
				ctx.fillStyle = opt.background;
				ctx.fillRect(0, 0, opt.height, opt.width);
			}

			opt.callback(canvas.toDataURL.apply(canvas, opt.toDataURLArgs));
		};
		sourceImage.src = source;
	};
}(alchemy));