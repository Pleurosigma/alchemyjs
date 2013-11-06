var alchemy = alchemy || {};
(function(A){
	
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
				var drag;
				if(options.before){
					drag = options.before(evt);
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
			};
			if(options.onMouseUp)
				evt.onMouseUp = options.onMouseUp;
		};
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