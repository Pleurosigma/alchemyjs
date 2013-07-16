/**
*	through.js
*	A jQuery plugin to propagate 
*	@author Logan Wilkerson
*/
(function($){
	/*
	*	Makes it possible to click through an element on the page.
	*	Particually useful to click through canvas elements.
	*	Works by hiding the element momentarily then grabbing the
	*	element at the mouse event spot, calling the relevant mouse
	*	event on that element, then reshowing the hidden element
	*
	*	@param {Object} The options for the mouseThrough. The attributes
	*	can be click, mousedown, and/or mouseup. The value should be the function
	*	that should be called on the overlaying object(s) first when
	*	the relevant mouse event occurs. That function should return true
	*	if a mouseThrough should occur, and false otherwise. This
	*	method will only allow mouseThrough for functions provided.
	*	To always allow mouseThrough just use the function: function(){return true}
	*/
	$.fn.mouseThrough = function(options){

		var cfg = $.extend({
			click: function(evt){return true;},
			},options);
	
		/*
		*	Generates a mouseThroughWrapper function given the
		*	name of the event to be wrapped and a function to
		*	handle the event on the overlay
		*
		*	@param {String} The event name ('click', 'mousedown', or 'mouseup')
		(	@param {handler} the event handler function to wrap around
		*/
		var mouseThroughWrapper = function(eventName, handler){		
			return function(evt){
				var mouseThrough = handler(evt);
				if(mouseThrough){
					$(this).hide();
					var ele = document.elementFromPoint(evt.clientX, evt.clientY);
					if(ele){			
						$(ele)[eventName]();
					}
					$(this).show();						
				}
			}
		}	
		
		return this.each(function(){
			for(var eventName in cfg){
				$(this)[eventName](mouseThroughWrapper(eventName, cfg[eventName]));
			}
		});
	}
	
	//Custom Events
	//hoverthroughon, hoverthroughoff
	$.fn.hoverThrough = function(options){
		var cfg = $.extend({
			interval: 25,
			sensitivity: 7,
			delay: 100
			}, options);
		
		
		var cX, cY, pX, pY;
		
		var track = function(event){
			cX = event.clientX;
			cY = event.clientY;
		}
		
		var monitor = function(event, ob){
			ob.hoverThroughTimer = clearTimeout(ob.hoverIntentTimer);
			if(!ob.hoverElement){	
				var delta = Math.abs(pX-cX) + Math.abs(pY-cY);
				if(delta < cfg.sensitivity){
					$(ob).hide();
					var ele = document.elementFromPoint(cX, cY);
					if(ele){
						ob.hoverElement = ele
						$(ob.hoverElement).trigger('mouseenter.through');
					}
					$(ob).show();
				}else{
					pX = cX;
					pY = cY;
				}
			}
			else{
				$(ob).hide();
				var ele = document.elementFromPoint(cX, cY);
				if(ele != ob.hoverElement){
					$(ob.hoverElement).trigger('mouseleave.through');
					ob.hoverElement = null;
				}
				$(ob).show();
			}
			ob.hoverThroughTimer = setTimeout(function(){monitor(event, ob);}, cfg.interval);
		}
		
		var delay = function(ob){	
			$(ob).off('mousemove.hoverthrough', track);
			ob.hoverThroughTimer = clearTimeout(ob.hoverThroughTimer);
			if(ob.hoverElement){
				$(ob.hoverElement).trigger('mouseleave.through');
				ob.hoverElement = null;
			}
		}
		
		var handleHover = function(e){
			var event = $.extend({}, e);
			var ob = this;
			if(ob.hoverThroughTimer){
				ob.hoverThroughTimer = clearTimeout(ob.hoverThroughTimer);
			}
			
			if(e.type == 'mouseenter'){
				pX = event.clientX;
				pY = event.clientY;
				$(ob).on('mousemove.hoverthrough', track);
				ob.hoverThroughTimer = setTimeout(function(){monitor(event, ob)}, cfg.interval);
			}
			else{
				ob.hoverThroughTimer = setTimeout(function(){delay(ob);}, cfg.delay);
			}			
		}
		return this.on({'mouseenter.hoverThrough':handleHover, 'mouseleave.hoverThrough':handleHover});
	}
}(jQuery));