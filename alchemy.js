var alchemy = alchemy || {};
(function(A){	

	//----------------
	// Standard Tools
	//---------------- 
	
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
		for (var i in sources){
			if(options.cache && A.loadImages._cache[sources[i]]){
				images.push(A.loadImages._cache[sources[i]]);
				imagesLoaded += 1;
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
			image.onload = function(){
				imagesLoaded += 1;
				if(sources.length == 1){
					options.success(image);
				}
				else if(imagesLoaded == sources.length && options.success)
					options.success(images);
			}
			image.onerror = function(){
				if(options.error)
					options.error();
			}
			image.src = sources[i];
		}
	};

	A.loadImage = function(source, options){
		var queue = new createjs.LoadQueue(false);
		queue.loadFile({id:'img', src:source});
		queue.addEventListener('complete', function(){
			var image = queue.getResult('img');
			image.crossOrigin = '';
			//console.log(image);
			options.success(image);
		})
	}
	
	// Clears the image cache
	A.clearImageCache = function(){
		for (var key in A.loadImages._cache){
			delete A.loadImages._cache[key]
		}
	};
	
	// Generates a partial function
	A.partial = function(){
		var fn = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		return function(){
			alchemy.log('test');
			var arg = 0;
			for (var i = 0; i < args.length && arg < arguments.length; i++){
				if (typeof args[i] == 'undefined'){
					args[i] = arguments[arg++];
				}
			}
			return fn.apply(this, args);
		};
	};
	
	/*
	*	isArray
	*	Returns true if the argument is an array
	*	
	*	@param {Object} object to test
	*	@return {boolean} true if object is an Array, false otherwise
	*/
	A.isArray = function(obj){
		return Object.prototype.toString.call(obj) === '[object Array]';
	};
	
	/*
	*	isFunction
	*	Returns true if the argument is a function
	*
	*	@param {Object} object to test
	*	@return {boolean} true if object is a Function, false otherwise
	*/
	A.isFunction = function(obj){
		return Object.prototype.toString.call(obj) === '[object Function]';
	};
	
	/*
	*	noop
	*	Does nothing.
	*/
	A.noop = function(){}

	A.randomColor = function(){
		var hue = '#' + String(Math.floor(Math.random() * 256)) + String(Math.floor(Math.random() * 256)) + String(Math.floor(Math.random() * 256));
		return hue;
	}

	A.range = function(start, stop, step){
		step = typeof step != 'undefined' ? step : 1;
		if(typeof stop == 'undefined'){
			stop = start;
			start = 0;
		}
		if((step > 0 && start >= stop) || (step < 0 && start <= stop) || (step == 0)){
			return [];
		}
		var range = [];
		for (var i = start; step > 0 ? i < stop : i > stop; i+= step){
			result.push(i);
		};
		return result;
	}
	
	//-----------------
	// Debugging Tools
	//-----------------	
	
	/*
	*	log
	*	A cross-browser logging function. Typically it just uses
	*	console.log. In out-of-date opera browsers it uses opera.postError.
	*
	*	@param {Objects} Accepts one or more objects or strings to log.
	*/
	A.log = function(){
		try{
			console.log.apply(console, arguments);
		}
		catch(e){
			try{
				opera.postError.apply(opera, arguments);
			}
			catch(e){
				alert(Array.prototype.join.call(arguments, " "));
			}
		}
	};
	
	/*
	*	err
	*	A cross-browser logging function. Typically it uses
	*	console.log, but can fall back on proprietary methods
	*	or alert as needed
	*	
	*	@param {Objects} Accepts one or more objects to go out as the error message
	*/
	A.err = function(){
		try{
			console.error.apply(console, arguments);
		}
		catch(e){
			try{
				opera.postError.apply(opera, arguments);
			}
			catch(e){
				alert(Array.prototype.join.call(arguments, " "));
			}
			
		}
	};
	
	/*
	*	assert
	*	Logs a message/error depending on the boolean value passed to assert,
	*	throws an error if value is false and halt is true
	*
	*	@param {Boolean} The assertion value
	*	@param {String} Description of the assertion
	*	@param {Boolean} Whether to halt if assertion fails
	*	@throw {Error} Thrown is value is false and halt is true
	*/
	A.assert = function(value, desc, halt){
		
		if(value)
			A.log('PASS: ', desc);
		else{
			A.err('FAIL: ', desc);
			if(halt)
				throw new Error('Halting due to failed assertion.');
		}
	};
	
	/*
	*	time
	*	Time the execution of a function a given number of times
	*	@param {Function} The function to execute
	*	@param {Number} The number of times execute the function
	*	@params The parameters to pass into the function
	*	@return {Number} The Time in milliseconds the function took to execute
	*/
	A.time = function(){
		var f = arguments[0];
		var iter = arguments[1];
		var start = A.now();
		for (var i = 0; i < iter; i++){
			f.apply(window,(Array.prototype.slice.call(arguments, 2)));
		}
		var end = A.now();
		return end-start;
	};
	
	/*
	*	now
	*	@return the current time in milliseconds
	*/
	A.now = function(){
		return new Date().getTime();
	};
	
	//-------------
	//	Math Tools
	//-------------

	A.deg2rad = Math.PI/180;
	A.rad2deg = 180/Math.PI;
	
	/*
	*	closestPointOnCircle
	*	Determines the closest point on a circle to a given point
	*
	*	@param {Object/Array} Object or Array representing the center
	*		point of the circle with x and y attributes or 
	*		with [0] = x and [1] = y
	*	@param {Number} radius of the circle
	*	@param {Object/Array} Object or Array representing the point to
	*		test with x and y attributes or with [0] = x and [1] = y
	*	@return {Object} Returns an object representing nearest point
	*		on the circle. x = x cord, y = y cord, dist = distance from
	*		p to the point.
	*/
	A.closestPointOnCircle = function(center, radius, point){
		var c = !A.isArray(center) ? center : A.point2d(center);
		var p = !A.isArray(point)  ? point  : A.point2d(point);		
		
		var v = {};
		v.x = p.x - c.x;
		v.y = p.y - c.y;
		v.mag = Math.sqrt(v.x*v.x + v.y*v.y);
		var a = {};
		a.x = c.x + v.x / v.mag * radius;
		a.y = c.y + v.y / v.mag * radius;
		a.dist = Math.sqrt(Math.pow((a.x - p.x),2) + Math.pow((a.y - p.y),2));
		return a;
	};
	
	//Converts objects to a point object with an x and y attribute
	A.point2d = function(x, y){
		if(typeof y == 'undefined'){
			return {x:x[0], y:x[1]}
		}
		else{
			return {x:x, y:y};
		}
	};
		
	//rotate one point around another
	A.rotateAroundPoint = function(point, center, angle){
		angle = angle * Math.PI / 180;
		return {
			x: center.x + (point.x - center.x) * Math.cos(angle) - (point.y - center.y)*Math.sin(angle),
			y: center.y + (point.x - center.x) * Math.sin(angle) + (point.y - center.y)*Math.cos(angle)
		}
	};
	
	//move point through an arc
	A.moveThroughArc = function(point, center, arcLength){
		var radius = Math.sqrt(Math.pow(point.x - center.x,2) + Math.pow(point.y - center.y, 2));
		var angle = arcLength * 180 / (Math.PI * radius);
		return A.rotateAroundPoint(point, center, angle);
	};

	A.angle = function(center, point){
		var angle = Math.atan2(point.y - center.y, point.x - center.x) * A.rad2deg;
		return angle >= 0 ? angle : angle + 360;
	}

	// Dist between two points.
	A.dist = function(a, b){
		return Math.sqrt(Math.pow(b.x-a.x,2 ) + Math.pow(b.y - a.y, 2))
	}

	//Javascript % is a remainder, this is a more conventional mod
	A.mod = function(x, n){
		return ((x % n)+n)%n;
	}

	/*
	* Assumes degrees. Touching does not mean overlap, 
	* assumes values [0, 360)
	* z1: {start, end}
	*/
	A.angleOverlap = function(z1, z2){
		var zone1 = {start: z1.start, end: z1.end};
		var zone2 = {start: z2.start, end: z2.end};
		// If zone1 overlaps boundary
		if(zone1.start > zone1.end){
			zone1.end = A.mod(zone1.end - zone1.start, 360);
			zone2.start = A.mod(zone2.start - zone1.start, 360);
			zone2.end = A.mod(zone2.end - zone1.start, 360);
			zone1.start = 0;
		}

		// Check if zone 2 boundaries in zone 1
		var o = zone2.start > zone1.start && zone2.start < zone1.end
			||  zone2.end   > zone1.start && zone2.end   < zone1.end;
		if(o){
			return o;
		}

		// if zone2 overlaps boundary
		if(zone2.start > zone2.end){
			zone2.end = A.mod(zone2.end - zone2.start, 360);
			zone1.start = A.mod(zone1.start - zone2.start, 360);
			zone1.end = A.mod(zone1.end - zone2.start, 360);
			zone2.start = 0;
		}

		var o = zone1.start > zone2.start && zone1.start < zone2.end
			||  zone1.end   > zone2.start && zone1.end < zone2.end;
		return o;
	}
	
	//---------------
	// Easeljs Tools
	//---------------
	
	//Makes a display object draggable. 
	//options is should be full of possible call backs.
	//onPress: called onPress
	//onMouseUp: called onMouseUp
	//before: called before moving is down on mouse move
	//	if before returns false dragging will not occur
	//after: called after moving is done on mouse move
	A.makeDraggable = function(displayObject, options){	
		options = options || {};
		displayObject.onPress = function(evt){
			if(options.onPress)
				options.onpress(evt);
			var localPoint = evt.target.globalToLocal(evt.stageX, evt.stageY);
			evt.onMouseMove = function(evt){
				var drag
				if(options.before){
					var drag = options.before(evt);
					if(!drag)
						return;
				}
				
				//move
				var globalPoint = evt.target.localToGlobal(localPoint.x, localPoint.y);
				var globalReg = evt.target.localToGlobal(evt.target.regX, evt.target.regY);
				var dX = globalPoint.x - globalReg.x;
				var dY = globalPoint.y - globalReg.y;
				evt.target.x = evt.stageX - dX;
				evt.target.y = evt.stageY - dY;
				
				if(options.after)
					options.after(evt);
			}
			if(options.onMouseUp)
				evt.onMouseUp = options.onMouseUp;
		}
	};
	
	//Translates a displayObject and scales it to a new center based off an old center
	A.scaleOffPoint = function(displayObject, oldC, newC, scaleX, scaleY){
		var delta = A.point2d(newC.x-oldC.x, newC.y-oldC.y);
		console.log(delta);
		displayObject.x += delta.x;
		displayObject.y += delta.y;
		
		var dist = A.point2d(displayObject.x - newC.x, displayObject.y - newC.y);
		console.log(dist);
		dist.x *= scaleX;
		dist.y *= scaleY;
		
		displayObject.x = newC.x + dist.x;
		displayObject.y = newC.y + dist.y;
		displayObject.scaleX *= scaleX;
		displayObject.scaleY *= scaleY;
	};
}(alchemy));