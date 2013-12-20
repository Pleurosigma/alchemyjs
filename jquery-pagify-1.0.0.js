/**
*	Pagify
*	v 1.0.0
*	Author: Logan Wilkerson
*	Jquery plugin to allow for the easy handling of horizontal paging of divs.
*	Allows both preloaded and dynamically loaded data as well as a mix of the both.
*/
(function($) {

	/*
	*	pagify
	*	Inits pagify on the container.
	*
	*	Pagify does apply a minor modification to the css of the container 
	*	and alters the html structure inside the container. Pagify also assumes
	*	that each child of the container will act as a pagify-page. Pagify will
	*	apply overflow: hidden to the parent and put all of the container's 
	*	children inside a div with the class 'pagify-viewer' 
	*	
	*	An object is attatched to the pagify element named pagifyState is contains
	*	the following attributes:
	*		- totalPages {Number}: Total number of pages contained in the element
	*		- currentPage {Number}: The index of the current pages.
	*
	*	Two event listeners are added to the element. One for pagify.forward, and 
	*	one for pagify.backward. Triggering pagify.forward and pagify.backword on
	*	the element should be used to trigger the page turns. The event
	*	pageturn.pagify is also triggered on page turn, but has no events by default
	*
	*	Pages are counted starting at 1
	*	
	*	@param {Object} options
	*		- pageHeight {Number}: The percentage height of each page.
	*			default: 100
	*
	*		- pageWidth {Number}: The percentage width of each page.
	*			default: 100
	*
	*		- turnSpeed {Number}: Animation speed in milliseconds for the page turn
	*			default: 250
	*
	*		- throttle  {Number}: How often a page turn can occur. If another page turn
	*							  occurs while one is already in progress the previous
	*							  animation will stop and the next will begin
	*			default: 250
	*
	*		- allowBlankColumns {Boolean}: Whether or not to allow blank columns in the 
	*									   final view. Note that allowing them may cause
	*									   some issues with determining the current view
	*			default: false
	*
	*		- ordering {String}: Determines how pages should be ordered in a single view. 
	*						  'column' denotes column major ordering, while 'row' denotes
	*						  row major ordering
	*			default: 'row'
	*
	*		- turnType  {String}: The type of page turn. Options - 'page', 'column', 'view'
	*							  page will inc a single page container, column will attempt
	*							  to move forward a single column, and view will attempt to
	*							  increment a single view forward
	*			default: 'page'
	*
	*		- columnLoadBuffer {Number}: The column buffer to allow before attempting to load more pages
	*			default: 0
	*
	*		- getMorePages {Function}:	The function to use to load more pages into the view. This function
	*									will be called during a forward.pagify event when it is determined
	*									that more pages will be needed. The function will need to add the 
	*									new pages (if anyway) and return a boolean. The return value should
	*									be true if the page turn should continue, or false otherwise. For
	*									dynamically loaded pages it can be useful to add temporary pages
	*									to act as a placeholder while the assets load.
	*			default: function(){return true;}
	*
	*		- initWithPagesFunction {Boolean}: True if pagify should initialize the viewer with pages using the 
	*										   getMorePages function
	*
	*
	*/
	$.fn.pagify = function(options){
		this.css('overflow', 'hidden');
		return this.each(function(){
			var opt = $.extend({
				pageHeight: 100,
				pageWidth: 100,
				turnSpeed: 250,
				turnType: 'page',
				columnLoadBuffer: 0,
				getMorePages: function(){return true;},
				initWithPagesFunction: false,
				throttle: 0,
				allowBlankColumns: false,
				ordering: 'row'
			}, options);
			this.pagifyState = {};
			this.pagifyState.opt = opt;

			var viewer = $('<div>').addClass('pagify-viewer');
			viewer.css({
				width: '100%',
				height: '100%',
				position: 'relative'
			});
			$(this).html(viewer.html($(this).html()));
			if(opt.initWithPagesFunction){
				opt.getMorePages.call(this);
			}
			updateEvents.call(this, opt);
			this.pagifyState.totalPages = updateChildren(viewer, opt);
			this.pagifyState.currentPage = 1;
		});
	};	

	/*
	*	pagify
	*	Updates the pagify element and all pages within. This update is mainly to allow for responsive
	*	changes. updatePagify does not add or remove content. After the update pagify will attempt to
	*	go back to the page it was on before.
	*
	*	@param {Object} newOptions: The new options to be used to update pagify. Allows for the
	*								modification of all the attributes in options from the pagify
	*								method's options parameter. However updatePagify does not
	*								add new pages, so changing "initWithPagesFunction" will not
	*								no effect.
	*
	*	@param{Number} turnSpeed: By default the pageturn that happens after an update will happen
	*							  happen at the turn speed in options/newOptions. This value will
	*							  act as a one time override of that speed.
	*/
	$.fn.updatePagify = function(newOptions, turnSpeed){
		newOptions = typeof newOptions != 'undefined' ? newOptions : {};
		return this.each(function(){			
			this.pagifyState.opt = $.extend(this.pagifyState.opt, newOptions);
			updateEvents.call(this, this.pagifyState.opt);
			this.pagifyState.totalPages = updateChildren($(this).children('.pagify-viewer'), this.pagifyState.opt);
			$(this).goToPage(this.pagifyState.currentPage, turnSpeed, true);
		});
	}

	/*
	*	updateNewPages
	*	Styles any new pages added to the page container. It will also update totalPages to the corrent value
	*/
	$.fn.updateNewPages = function(){
		return this.each(function(){			
			this.pagifyState.totalPages = updateChildren($(this).children('.pagify-viewer'), this.pagifyState.opt, true)
		});		
	}

	/*
	*	addPage
	*	Adds a new page to the element. If update is not true
	*	then this page will not have the correct css until
	*	updatePagify or updateNewPages is called. The page will
	*	also not be added to total pages. The getMorePages function
	*	should use this method to add pages.
	*	
	*	@param {String/Object} page: The page to add
	*	@param {Boolean} update: If true updateNewPages will be called after the page is added.
	*/
	$.fn.addPage = function(page, update){
		update = typeof update != 'undefined' ? update : false;
		this.each(function(){
			var viewer = $(this).children('.pagify-viewer');
			viewer.append(page);
		});
		if(update){
			this.updateNewPages();
		}
		return this;
	}

	/*
	*	removePage
	*	removes the page at the given pageNum (pages start at 1)
	*/
	$.fn.removePage = function(page){
		this.each(function(){			
			var viewer = $(this).children('.pagify-viewer');
			var pageNumber;
			if(typeof page == 'Number'){
				pageNumber = page;
				viewer.children(':eq(' + (page - 1) + ')').each(function(){
					$(this).remove();
				})
			}
			else{
				if(page instanceof jQuery && page.length > 0){
					pageNumber = page[0].pageNumber;
					page.remove();
				}
				else if(typeof page != 'undefined' && page != null){
					pageNumber = page.pageNumber;
					$(page).remove();
				}
				else{
					return;
				}
			}
			if(this.pagifyState.currentPage > pageNumber){
				this.pagifyState.currentPage -= 1;
			}

		});
		return this.updatePagify();
	}

	/*
	*	goToPreviousPage
	*
	*	@param {Number} turnSpeed: The speed to preform the page turn animation at.
	*/
	$.fn.goToPreviousPage = function(turnSpeed){
		return this.each(function(){
			$(this).goToPage(this.pagifyState.currentPage - 1, turnSpeed);
		});
	};

	/*
	*	goToNextPage
	*
	*	@param {Number} turnSpeed: The speed to preform the page turn animation at.
	*/
	$.fn.goToNextPage = function(turnSpeed){
		return this.each(function(){
			$(this).goToPage(this.pagifyState.currentPage + 1, turnSpeed);
		});
	};

	/*
	*	goToPreviousColumn
	*	Moves the view so that the previous column is against the left edge of the view.
	*
	*	@param {Number} turnSpeed: The speed to preform the page turn animation at.
	*/
	$.fn.goToPreviousColumn = function(turnSpeed){
		return this.each(function(){			
			var colCount = parseInt(100 / this.pagifyState.opt.pageHeight);
			var tarCol = parseInt(this.pagifyState.currentPage / colCount) - 1;
			$(this).goToPage(tarCol * colCount, turnSpeed);
		});
	};

	/*
	*	goToNextColumn
	*	Moves the view so that the next column is against the left edge of the view.
	*
	*	@param {Number} turnSpeed: The speed to preform the page turn animation at.
	*/
	$.fn.goToNextColumn = function(turnSpeed){
		return this.each(function(){			
			var colCount = parseInt(100 / this.pagifyState.opt.pageHeight);
			var tarCol = parseInt(this.pagifyState.currentPage / colCount) + 1;
			$(this).goToPage(tarCol * colCount + 1, turnSpeed);
		});
	};

	/*
	*	goToPreviousView
	*	Moves the view to the previous one
	*
	*	@param {Number} turnSpeed: The speed to preform the page turn animation at.
	*/
	$.fn.goToPreviousView = function(turnSpeed){
		return this.each(function(){
			var colCount = parseInt(100 / this.pagifyState.opt.pageHeight);
			var rowCount = parseInt(100 / this.pagifyState.opt.pageWidth);
			var pageCount = colCount * rowCount;
			$(this).goToPage(this.pagifyState.currentPage - pageCount, turnSpeed);
		});

	};

	/*
	*	goToNextView
	*	Moves the view to the next one
	*
	*	@param {Number} turnSpeed: The speed to preform the page turn animation at.
	*/
	$.fn.goToNextView = function(turnSpeed){
		return this.each(function(){
			var colCount = parseInt(100 / this.pagifyState.opt.pageHeight);
			var rowCount = parseInt(100 / this.pagifyState.opt.pageWidth);
			var pageCount = colCount * rowCount;
			$(this).goToPage(this.pagifyState.currentPage + pageCount, turnSpeed);
		});
	};

	/*
	*	goToPage
	*	Moves the viewer so that the page is against the left side (or as close as possible
	*	if blank columns are not allowed.)
	*
	*	@param {Number} pageNum: The page number to turn too.
	*	@param {turnSpeed} turnSpeed: overrides the pageTurn animation speed in options
	*	@param {Boolean} force: Forces a page turn to occur even if it's going to the same page
	*							used for updating
	*		- default: false
	*
	*/
	$.fn.goToPage = function(pageNum, turnSpeed, force){
		force = typeof force != 'undefined' ? force : false;
		pageNum = Math.max(1, pageNum);
		return this.each(function(){
			var curPageNum = pageNum;
			var viewer = $(this).children('.pagify-viewer');
			var pagesPerColumn = parseInt(100 / this.pagifyState.opt.pageHeight);
			var columnsPerView = parseInt(100 / this.pagifyState.opt.pageWidth);
			var targetColumn;
			if(this.pagifyState.opt.ordering == 'column'){
				targetColumn = parseInt((pageNum-1) / pagesPerColumn);
			}
			else if(this.pagifyState.opt.ordering == 'row'){
				targetColumn = mod(pageNum-1, columnsPerView) + parseInt((pageNum-1) / (pagesPerColumn * columnsPerView)) * columnsPerView;
			}
			if(this.pagifyState.opt.turnType == 'view' && this.pagifyState.opt.allowBlankColumns){
				targetColumn -= mod(targetColumn, columnsPerView)
			}
			var totalColumns = Math.ceil(this.pagifyState.totalPages / pagesPerColumn)
			if((targetColumn + columnsPerView + this.pagifyState.opt.columnLoadBuffer) > totalColumns) {
				if(!this.pagifyState.opt.getMorePages.call(this)){
					return;
				}
				else{
					totalColumns = Math.ceil(this.pagifyState.totalPages / pagesPerColumn)
				}
			}
			if(!this.pagifyState.opt.allowBlankColumns && (targetColumn + columnsPerView) > totalColumns){
				targetColumn = totalColumns - columnsPerView;
				curPageNum = targetColumn * pagesPerColumn + 1;
			}
			else if(targetColumn >= totalColumns){
				curPageNum = this.pagifyState.currentPage
			}
			if(this.pagifyState.currentPage != curPageNum || force){
				this.pagifyState.currentPage = curPageNum;
				turnSpeed = typeof turnSpeed != 'undefined' ? turnSpeed : this.pagifyState.opt.turnSpeed
				viewer.stop().animate({'right': targetColumn * this.pagifyState.opt.pageWidth + '%'}, turnSpeed);
				$(this).trigger('pageturn.pagify');
			}
		});
	}

	$.fn.getCurrentView = function(){
		var ele = this.first()[0];		
		var colCount = parseInt(100 / ele.pagifyState.opt.pageHeight);
		var rowCount = parseInt(100 / ele.pagifyState.opt.pageWidth);
		var pageCount = colCount * rowCount;
		return Math.ceil(ele.pagifyState.currentPage / pageCount);
	}

	$.fn.getPagesInView = function(){
		var pages = [];
		this.each(function(){
			var viewIndex = $(this).getCurrentView();
			var colCount = parseInt(100 / this.pagifyState.opt.pageHeight);
			var rowCount = parseInt(100 / this.pagifyState.opt.pageWidth);
			var firstIndex = (viewIndex-1) * colCount * rowCount;
			var lastIndex = Math.min(this.pagifyState.totalPages, firstIndex + (colCount * rowCount));
			var viewer = $(this).children('.pagify-viewer');
			pages.push.apply(pages, viewer.children().slice(firstIndex, lastIndex));
		});	
		return pages;
	}

	//-----------------
	// Private Methods
	//-----------------

	//Preforms a mod more consistent with the mathematical modulo
	var mod = function(x, n){
		return ((x % n)+n)%n;
	};

	//Used to loop through and update the pages of the viewer.
	var updateChildren = function(viewer, opt, newOnly){
		var pageCount = 0;
		newOnly = typeof newOnly != 'undefined' ? newOnly : false;
		viewer.children('div').each(function(){
			pageCount += 1;
			if(newOnly && $(this).hasClass('pagify-page')){				
				updatePage(viewer, opt, this, pageCount);
			}
			else{
				updatePage(viewer, opt, this, pageCount);
			}
		});
		return pageCount;
	};

	//Used to update a single page
	var updatePage = function(viewer, opt, page, pageCount){
		$(page).addClass('pagify-page');
		page.pageNumber = pageCount;
		var numRows = parseInt(100 / opt.pageHeight);
		var numCols = parseInt(100 / opt.pageWidth);
		var rowCount, colCount;
		if(opt.ordering == 'column'){
			rowCount = mod(pageCount-1, numRows);
			colCount = parseInt((pageCount-1) / numRows);
		}
		else{
			rowCount = mod(parseInt((pageCount-1) / numCols), numRows);
			colCount = mod(pageCount-1, numCols) + parseInt((pageCount-1) / (numRows * numCols)) * numCols;
		}
		var	top = rowCount * opt.pageHeight + '%';
		var	left = colCount * opt.pageWidth + '%';
		$(page).css({
			position: 'absolute',
			height: opt.pageHeight + '%',
			width: opt.pageWidth + '%',
			'top': top,
			'left': left,
		});
	}

	//Returns a page turn function with the options locked into the closure
	var getPageTurnFunction = function(opt, type){
		if(type == 'backward'){
			return function(evt){				
				if(opt.turnType == 'page'){
					$(this).goToPreviousPage();
				}
				else if(opt.turnType == 'column'){
					$(this).goToPreviousColumn();
				}
				else if(opt.turnType == 'view'){
					$(this).goToPreviousView();
				}
			};
		}
		else{
			return function(evt){				
				if(opt.turnType == 'page'){
					$(this).goToNextPage();
				}
				else if(opt.turnType == 'column'){
					$(this).goToNextColumn();
				}
				else if(opt.turnType == 'view'){
					$(this).goToNextView();
				}
			}
		}
	}

	//Updates the events on the current scope.
	var updateEvents = function(opt){
		$(this).off('backward.pagify forward.pagify');
		var bF = getPageTurnFunction(opt, 'backward');
		var fF = getPageTurnFunction(opt, 'forsward');
		if(opt.throttle > 0){
			bF = throttle(bF, opt.throttle, this);
			fF = throttle(fF, opt.throttle, this);
		}
		$(this).off('backward.pagify forward.pagify');
		$(this).on('backward.pagify', bF);
		$(this).on('forward.pagify', fF);
	};

	// Generates a throttled function, threshhold defaults to 250ms
	// From http://remysharp.com/2010/07/21/throttling-function-calls/
	var throttle = function(fn, threshhold, scope){
		threshhold = typeof threshhold != 'undefined' ? threshhold : 250;
		var last;
		var deferTimer;
		return function(){
			var context = scope || this;
			var now = Number(new Date());
			var args = arguments;
			if(last && now < last + threshhold){
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function(){
					last = now;
					fn.apply(context, args);
				}, threshhold);
			}
			else{
				last = now;
				fn.apply(context, args);
			}
		};
	};
}(jQuery));