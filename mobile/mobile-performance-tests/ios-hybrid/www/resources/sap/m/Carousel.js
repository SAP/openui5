/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.Carousel.
jQuery.sap.declare("sap.m.Carousel");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Carousel.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize (default: '100%')</li>
 * <li>{@link #getLoop loop} : boolean (default: false)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '100%')</li>
 * <li>{@link #getShowPageIndicator showPageIndicator} : boolean (default: true)</li>
 * <li>{@link #getPageIndicatorPlacement pageIndicatorPlacement} : sap.m.PlacementType (default: sap.m.PlacementType.Bottom)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getPages pages} : sap.ui.core.Control[]</li></ul>
 * </li>
 * <li>Associations
 * <ul>
 * <li>{@link #getActivePage activePage} : string | sap.ui.core.Control</li></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.Carousel#event:loadPage loadPage} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.Carousel#event:unloadPage unloadPage} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.Carousel#event:pageChanged pageChanged} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The Carousel control can be used to navigate through a list of sap.m controls just like flipping through the pages of a book by swiping right or left. An indicator shows the current position within the control list.
 * 
 * This carousel implementation always renders three controls: the one which is currently active, the one to the right and the one to the left. After a swipe, these pages are exchanged accordingly, the next control in the list is loaded, the control which is out of scope is released.
 * 
 * Similar to the NavContainer control, the carousel triggers events on it pages, when flipping through them. These events are:
 * - 'BeforeFirstShow': triggered, when a page is rendered for the first time wthin the carousel
 * - 'BeforeShow': triggered whenever a page is rendered (analogous to 'loadPage event)
 * - 'AfterHide': triggered when the page is discarded from the carousel's 'viewport' (analogous to 'unloadPage event)
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.Carousel
 */
sap.ui.core.Control.extend("sap.m.Carousel", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"next", "previous"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"height" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},
		"loop" : {type : "boolean", group : "Misc", defaultValue : false},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},
		"showPageIndicator" : {type : "boolean", group : "Appearance", defaultValue : true},
		"pageIndicatorPlacement" : {type : "sap.m.PlacementType", group : "Behavior", defaultValue : sap.m.PlacementType.Bottom}
	},
	defaultAggregation : "pages",
	aggregations : {
    	"pages" : {type : "sap.ui.core.Control", multiple : true, singularName : "page"}
	},
	associations : {
		"activePage" : {type : "sap.ui.core.Control", multiple : false}
	},
	events : {
		"loadPage" : {}, 
		"unloadPage" : {}, 
		"pageChanged" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.Carousel with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.m.Carousel.extend
 * @function
 */

sap.m.Carousel.M_EVENTS = {'loadPage':'loadPage','unloadPage':'unloadPage','pageChanged':'pageChanged'};


/**
 * Getter for property <code>height</code>.
 * The height of the carousel. Note that when a percentage is given, for the height to work as expected, the height of the surrounding container must be defined.
 *
 * Default value is <code>100%</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @name sap.m.Carousel#getHeight
 * @function
 */


/**
 * Setter for property <code>height</code>.
 *
 * Default value is <code>100%</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#setHeight
 * @function
 */

/**
 * Getter for property <code>loop</code>.
 * Defines whether the carousel should loop, i.e show the first page after the last page is reached and vice versa.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>loop</code>
 * @public
 * @name sap.m.Carousel#getLoop
 * @function
 */


/**
 * Setter for property <code>loop</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bLoop  new value for property <code>loop</code>
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#setLoop
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Hide carousel. Actually, it is not even rendered anymore if it is not 'visible'
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.Carousel#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#setVisible
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * The width of the carousel. Note that when a percentage is given, for the width to work as expected, the width of the surrounding container must be defined.
 *
 * Default value is <code>100%</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.Carousel#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>100%</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#setWidth
 * @function
 */

/**
 * Getter for property <code>showPageIndicator</code>.
 * Show or hide carousel's page indicator.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showPageIndicator</code>
 * @public
 * @name sap.m.Carousel#getShowPageIndicator
 * @function
 */


/**
 * Setter for property <code>showPageIndicator</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowPageIndicator  new value for property <code>showPageIndicator</code>
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#setShowPageIndicator
 * @function
 */

/**
 * Getter for property <code>pageIndicatorPlacement</code>.
 * This is the information about where the carousel's page indicator shall be displayed. Possible values are sap.m.PlacementType.Top, sap.m.PlacementType.Bottom. Other values are ignored and the default value will be applied. The default value is sap.m.PlacementType.Bottom.
 *
 * Default value is <code>Bottom</code>
 *
 * @return {sap.m.PlacementType} the value of property <code>pageIndicatorPlacement</code>
 * @public
 * @name sap.m.Carousel#getPageIndicatorPlacement
 * @function
 */


/**
 * Setter for property <code>pageIndicatorPlacement</code>.
 *
 * Default value is <code>Bottom</code> 
 *
 * @param {sap.m.PlacementType} oPageIndicatorPlacement  new value for property <code>pageIndicatorPlacement</code>
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#setPageIndicatorPlacement
 * @function
 */
	
/**
 * Getter for aggregation <code>pages</code>.<br/>
 * The content entities between which this Carousel navigates.
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.m.Carousel#getPages
 * @function
 */

/**
 * Inserts a page into the aggregation named <code>pages</code>.
 *
 * @param {sap.ui.core.Control}
 *          oPage the page to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the page should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the page is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the page is inserted at 
 *             the last position        
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#insertPage
 * @function
 */


/**
 * Adds some page <code>oPage</code> 
 * to the aggregation named <code>pages</code>.
 *
 * @param {sap.ui.core.Control}
 *            oPage the page to add; if empty, nothing is inserted
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#addPage
 * @function
 */


/**
 * Removes an page from the aggregation named <code>pages</code>.
 *
 * @param {int | string | sap.ui.core.Control} vPage the page to remove or its index or id
 * @return {sap.ui.core.Control} the removed page or null
 * @public
 * @name sap.m.Carousel#removePage
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>pages</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.Carousel#removeAllPages
 * @function
 */


/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>pages</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oPage the page whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.m.Carousel#indexOfPage
 * @function
 */


/**
 * Destroys all the pages in the aggregation 
 * named <code>pages</code>.
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#destroyPages
 * @function
 */

/**
 * Provides getter and setter for the currently displayed page. For the setter, argument may be the control itself, which must be member of the carousel's page list, or the control's id.
 * The getter will return the control id
 *
 * @return {string} Id of the element which is the current target of the <code>activePage</code> association, or null
 * @public
 * @name sap.m.Carousel#getActivePage
 * @function
 */


/**
 * Provides getter and setter for the currently displayed page. For the setter, argument may be the control itself, which must be member of the carousel's page list, or the control's id.
 * The getter will return the control id
 *
 * @param {string | sap.ui.core.Control} vActivePage 
 *    Id of an element which becomes the new target of this <code>activePage</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#setActivePage
 * @function
 */

/**
 * Carousel requires a new page to be loaded. This event may be used to fill the content of that page 
 *
 * @name sap.m.Carousel#loadPage
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {string} oControlEvent.getParameters.pageId Id of the page which is will be loaded
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'loadPage' event of this <code>sap.m.Carousel</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Carousel</code>.<br/> itself. 
 *  
 * Carousel requires a new page to be loaded. This event may be used to fill the content of that page 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Carousel</code>.<br/> itself.
 *
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#attachLoadPage
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'loadPage' event of this <code>sap.m.Carousel</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#detachLoadPage
 * @function
 */


/**
 * Fire event loadPage to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'pageId' of type <code>string</code> Id of the page which is will be loaded</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Carousel#fireLoadPage
 * @function
 */

/**
 * Carousel does not display a page any longer and unloads it. This event may be used to clean up the content of that page. 
 *
 * @name sap.m.Carousel#unloadPage
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {string} oControlEvent.getParameters.pageId Id of the page which is will be unloaded
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'unloadPage' event of this <code>sap.m.Carousel</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Carousel</code>.<br/> itself. 
 *  
 * Carousel does not display a page any longer and unloads it. This event may be used to clean up the content of that page. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Carousel</code>.<br/> itself.
 *
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#attachUnloadPage
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'unloadPage' event of this <code>sap.m.Carousel</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#detachUnloadPage
 * @function
 */


/**
 * Fire event unloadPage to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'pageId' of type <code>string</code> Id of the page which is will be unloaded</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Carousel#fireUnloadPage
 * @function
 */

/**
 * This event is thrown after a carousel swipe has been completed. It is triggered both by physical swipe events and through API carousel manipulations such as calling 'next', 'previous' or 'setActivePageId' functions. 
 *
 * @name sap.m.Carousel#pageChanged
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {string} oControlEvent.getParameters.oldActivePageId Id of the page which was active before the page change.
 * @param {string} oControlEvent.getParameters.newActivePageId Id of the page which is active after the page change.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'pageChanged' event of this <code>sap.m.Carousel</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Carousel</code>.<br/> itself. 
 *  
 * This event is thrown after a carousel swipe has been completed. It is triggered both by physical swipe events and through API carousel manipulations such as calling 'next', 'previous' or 'setActivePageId' functions. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Carousel</code>.<br/> itself.
 *
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#attachPageChanged
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'pageChanged' event of this <code>sap.m.Carousel</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Carousel#detachPageChanged
 * @function
 */


/**
 * Fire event pageChanged to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oldActivePageId' of type <code>string</code> Id of the page which was active before the page change.</li>
 * <li>'newActivePageId' of type <code>string</code> Id of the page which is active after the page change.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Carousel} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Carousel#firePageChanged
 * @function
 */

/**
 * Call this method to display the next page (corresponds to a swipe right). Returns 'this' for method chaining.
 *
 * @name sap.m.Carousel.prototype.next
 * @function

 * @type sap.m.Carousel
 * @public
 */


/**
 * Call this method to display the previous page (corresponds to a swipe left). Returns 'this' for method chaining.
 *
 * @name sap.m.Carousel.prototype.previous
 * @function

 * @type sap.m.Carousel
 * @public
 */


// Start of sap\m\Carousel.js
jQuery.sap.require("sap.ui.thirdparty.swipe-view");

/**
 * Initialize member variables which are needed later on.
 * 
 * @private
 */
sap.m.Carousel.prototype.init = function() {
	this.orientationProxy = jQuery.proxy(this._handleOrientationChange, this);
	jQuery(window).bind("orientationchange", this.orientationProxy);
};

/**
 * Called when the control is destroyed.
 *
 * @private
 */
sap.m.Carousel.prototype.exit = function() {
	if(this.orientationProxy) {
		jQuery(window).unbind("orientationchange", this.orientationProxy);
	}
	if(!!this._oSwipeView) {
		this._oSwipeView.destroy();
	}
	if(!!this._prevButton) {
		this._prevButton.destroy();
	}
	if(!!this._nextButton) {
		this._nextButton.destroy();
	}
	if(this._aBusyIndicators) {
		for (var i=0; i<3; i++) {
			this._aBusyIndicators[i].destroy();
		}
	}
	this._cleanUpTapBindings();
};

/**
 * Cleans up bindings of 'previous' and 'next' button
 * 
 * @private
 */
sap.m.Carousel.prototype._cleanUpTapBindings = function() {
	if(!!this.previousProxy) {
		jQuery.sap.byId(this._getPrevBtnId()).unbind("tap", this.previousProxy);
		delete this.previousProxy;
	}
	if(!!this.nextProxy) {
		jQuery.sap.byId(this._getNextBtnId()).unbind("tap", this.nextProxy);
		delete this.nextProxy;
	}
}

/**
 * Cleans up bindings of 'previous' and 'next' button
 * 
 * @private
 */
sap.m.Carousel.prototype._createTapBindings = function() {
	if(!this.previousProxy) {
		this.previousProxy = jQuery.proxy(this.previous, this);
		jQuery.sap.byId(this._getPrevBtnId()).bind("tap", this.previousProxy);
	}
	if(!this.nextProxy) {
		this.nextProxy = jQuery.proxy(this.next, this);
		jQuery.sap.byId(this._getNextBtnId()).bind("tap", this.nextProxy);
	}
}


/**
 * Cleans up bindings
 * 
 * @private
 */
sap.m.Carousel.prototype.onBeforeRendering = function() {
	this._cleanUpTapBindings();
};

/**
 * When this method is called for the first time, a swipe-view instance is created which is renders
 * itself into its dedicated spot within the DOM tree. This instance is used throughout the
 * Carousel instance's lifecycle.
 * 
 * @private
 */
sap.m.Carousel.prototype.onAfterRendering = function() {	
	
	var pageList = this.getPages();
	
	if(!this._oSwipeView) {
		var domRef = jQuery.sap.domById(this._getContentId());
		
		if(!this.getActivePage() && pageList.length > 0) {
			//initialize active page id
			this.setActivePage(pageList[0].getId());
		}
		
		this._oSwipeView = new window.SwipeView(domRef, 
			{	numberOfPages : pageList.length,
				loop: this.getLoop()
			});
		//remove touch listeners because carousel will delegate
		//corresponding events (see carousel's'ontouchstart', ontouchmove', ontouchend' functions)
		var aTEvts = ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup'];
		for (var i = 0; i < aTEvts.length; i++) {
			domRef.removeEventListener(aTEvts[i], this._oSwipeView, false);
		}
		//add css class to manipulate slider's properties
		jQuery(this._oSwipeView.slider).css("-webkit-transition-timing-function", "cubic-bezier(0.31, 0.385, 0.585, 1.0)");
		
		this._oSwipeView.fnLoadingCallback = jQuery.proxy( this._toggleBusyIcon, this);
		this._oSwipeView.onFlip(jQuery.proxy( this._doSwipeCompleted, this));
		this._oSwipeView.onMoveOut(jQuery.proxy( this._doSwipeStarted, this));
		this._oSwipeView.onMoveIn(jQuery.proxy( this._doMoveIn, this));
		
		this._aMasterPageDivs = [];
		this._aBusyIndicators = [];
		
		
		var rm = sap.ui.getCore().createRenderManager();
		for (var i=0; i<3; i++) {
			var ithContId = this._getContentId() + "-MstPgCont-" + i;
			rm.write("<div id='" + ithContId +"' class='sapMCrslContMstPag'></div>");
			this._aBusyIndicators[i] = new sap.m.BusyIndicator({size: '6em'});
			var $ithMasterPage = jQuery.sap.domById(this._oSwipeView.masterPages[i].id);
			rm.renderControl(this._aBusyIndicators[i]);
			rm.flush($ithMasterPage, false);
			
			this._aMasterPageDivs[i] = jQuery.sap.byId(ithContId);
			//add css class to center busy indicator
			this._aBusyIndicators[i].$().addClass("sapMCrslContMstPag");
		}
		rm.destroy();
		
		if(!this._moveToActivePage()){
			//this means that initial page has not changed. Since this
			//is the first time, 'unloadPage' must not
			//be fired for initial rendering
			this._doSwipeCompleted(null, true);
		}
	} else {
		//Called after re-rendering
		if(this.getPageIndicatorPlacement() == sap.m.PlacementType.Top) {
			//The page indicator is already rendered as first child of carousel. Since it must stay
			//on TOP, the wrapper, which contains the carousel content is inserted
			//after the page indicator
			jQuery.sap.byId(this.getId()).append(this._oSwipeView.wrapper);
		} else {
			//Page indicator shall displayed at bottom and is already in DOM. Therefore, the 
			//wrapper which contains the carousel elements must be inserted before the page indicator
			jQuery(this._oSwipeView.wrapper).insertBefore(jQuery.sap.byId(this._getNavId()));
		}
		
		this._doSwipeCompleted(null, true);
	}
	
	
	//Add tap events to 'Previous' and 'Next' div
	this._createTapBindings();
};


/**
 * Called when the control touch start. Delegates corresponding event to swipe-view.
 *
 * @private
 */
sap.m.Carousel.prototype.ontouchstart = function(oEvent) {
	//for controls which need to know if they should handle events from the Carousel control
	if(this._oSwipeView) {
		this._oSwipeView.__start(oEvent);
	}
	oEvent.originalEvent._sapui_handledByControl = true;
};

/**
 * Called when the control touch is moved. Delegates corresponding event to swipe-view.
 *
 * @private
 */
sap.m.Carousel.prototype.ontouchmove = function(oEvent) {
	//for control who need to know if they should handle events from the Carousel control
	if(this._oSwipeView) {
		this._oSwipeView.__move(oEvent);
	}
};

/**
 * Called when the control touch ends. Delegates corresponding event to swipe-view.
 *
 * @private
 */
sap.m.Carousel.prototype.ontouchend = function(oEvent) {
	if(this._oSwipeView) {
		this._oSwipeView.__end(oEvent);
	}
};

/**
 * API method to set carousel's active page during runtime.
 * 
 * @param oPage Id of the page or page which shall become active
 *
 */
sap.m.Carousel.prototype.setActivePage = function (oPage) {
	var oPageId = undefined;
	if(typeof(oPage) == 'string') {
		oPageId = oPage;
	} else if (oPage instanceof sap.ui.core.Control) {
		oPageId = oPage.getId();
	}
	
	if(oPageId) {
		this.setAssociation("activePage", oPageId, true);
		this._moveToActivePage();
	} else {
		jQuery.sap.assert(false, "sap.m.Carousel.prototype.setActivePage: Cannot set active page '" + 
				oPage + "' because it is neither of type 'string' nor a *sap.ui.core.Control'");
	}
	
	return this;
};

/**
 * Private method to add a control to the list of pages which is 
 * displayed in the carousel or to to insert a control at a certain 
 * position into the list of pages.
 * 
 * @param oPage page which is added to the list of pages to be 
 *		displayed in the carousel
 * @param iIndex position at which oPage shall be added
 */	
sap.m.Carousel.prototype._addPage = function(oPage, iIndex) {

	//Re-render only if there are no pages currently
	//(in this case there is no dom entry available)
	var bDoRerender = this.getPages().length == 0; 
	var bIsInsert = typeof(iIndex) == 'number';
	
	if(bIsInsert){
		this.insertAggregation("pages", oPage, iIndex, !bDoRerender);
	} else {
		this.addAggregation("pages", oPage, !bDoRerender);
	}
	
	//update page indicator if swipe view instance is already present
	if(!!this._oSwipeView) {
		this._oSwipeView.updatePageCount(this.getPages().length);
		
		if(!bDoRerender) {
			if(bIsInsert){
				//removed page may be displayed already. To make sure
				//that this does not cause problems, We will refill all 
				//master pages' content
				for (var i=0; i<3; i++) {
					var ithContId = this._getContentId() + "-MstPgCont-" + i;
					jQuery.sap.byId(ithContId).empty();
				}
			}
			//This is necessary because the number of pages has changed
			this._rerenderPageIndicatorDots();
		}
		//Calling 'goToPage' triggers re-calculation of upcoming indices
		//in swipe-view's master pages
		//The currently active page is not changed
		this._oSwipeView.goToPage(this._oSwipeView.page);
	}
	return this;
};

	

/**
 * API method to add a control to the list of pages which is 
 * displayed in the carousel.
 * 
 * @param oPage page which is added to the list of pages to be 
 *		displayed in the carousel
 * @public
 */	
sap.m.Carousel.prototype.addPage = function(oPage) {
	return this._addPage(oPage);
};

/**
 * API method to insert a control at a certain position to the list of
 * pages which is displayed in the carousel.
 * 
 * @param oPage page which is added to the list of pages to be 
 *		displayed in the carousel
 * @param iIndex position at which oPage shall be added
 * @public
 */	
sap.m.Carousel.prototype.insertPage = function(oPage, iIndex) {
	return this._addPage(oPage, iIndex);
};

/**
 * Private method to remove one or all control from the list of pages which is 
 * displayed in the carousel. Used to model removePage, removeAllPages, destroyPages
 * 
 * @param bAll remove all pages
 * @param bDestroy destroy all pages. Only taken into consideration if bAll is true
 * @param oPage page which shall be removed from the list of pages to be 
 *		displayed in the carousel
 * @return sap.m.Carousel the Carousel instance for method chaining 
 */	
sap.m.Carousel.prototype._removePages = function(bAll, bDestroy, oPage) {
	if(bAll) {
		if(bDestroy) {
			this.destroyAggregation("pages", true);
		} else {
			this.removeAllAggregation("pages", true);
		}
	} else if (!!oPage) {
		this.removeAggregation("pages", oPage, true);
	}
	//re-render if swipe view instance is already present
	if(!!this._oSwipeView) {
		
		//This is necessary because the number of pages has changed
		this._rerenderPageIndicatorDots();
		this._oSwipeView.updatePageCount(this.getPages().length);
		
		//Removed page may be displayed already. To make sure
		//that this does not cause problems, We will refill all 
		//master pages' content
		for (var i=0; i<3; i++) {
			var ithContId = this._getContentId() + "-MstPgCont-" + i;
			jQuery.sap.byId(ithContId).empty();
		}
		
		//calling 'goToPage' triggers re-calculation of upcoming indices
		//in swipe-view's master pages
		this._oSwipeView.goToPage(this._oSwipeView.page);
	}
	return this;
}

/**
 * API method to remove a control from the list of pages which is 
 * displayed in the carousel.
 * 
 * @param oPage page which shall be removed from the list of pages to be 
 *		displayed in the carousel
 * @return sap.m.Carousel the Carousel instance for method chaining 
 * @public
 */	
sap.m.Carousel.prototype.removePage = function(oPage) {
	return this._removePages(false, false, oPage); 
};

/**
 * API method to remove all pages which are displayed in the carousel.
 * These pages can be re-used afterwards though, as opposed to 
 * 'destroyPages'.
 * 
 * @param oPage page which shall be removed from the list of pages to be 
 *		displayed in the carousel
 * @return sap.m.Carousel the Carousel instance for method chaining 
 * @public
 */	
sap.m.Carousel.prototype.removeAllPages = function() {
	return this._removePages(true, false); 
};

/**
 * API method to remove and destroy all pages which are displayed in the carousel.
 * These pages can not be re-used afterwards.
 * 
 * @param oPage page which shall be removed from the list of pages to be 
 *		displayed in the carousel
 * @return sap.m.Carousel the Carousel instance for method chaining 
 * @public
 */	
sap.m.Carousel.prototype.destroyPages = function() {
	return this._removePages(true, true); 
};

/**
 * API method to remove all pages which are displayed in the carousel.
 * These pages can be re-used afterwards though, as opposed to 
 * 'destroyPages'.
 * 
 * @param oPage page which shall be removed from the list of pages to be 
 *		displayed in the carousel
 * @return sap.m.Carousel the Carousel instance for method chaining 
 * @public
 */	
sap.m.Carousel.prototype.removePage = function(oPage) {
	return this._removePages(false, false, oPage); 
};


/**
 * API method to set the carousel's height
 *
 * @param oHeight the new height as CSSSize
 * @public
 */
sap.m.Carousel.prototype.setHeight = function(oHeight) {
	//do suppress rerendering
	this.setProperty("height", oHeight, true);
	jQuery.sap.byId(this.getId()).css("height", oHeight);
	return this;
};

/**
 * API method to set the carousel's width
 *
 * @param oWidth the new width as CSSSize
 * @public
 */
sap.m.Carousel.prototype.setWidth = function(oWidth) {
	//do suppress rerendering
	this.setProperty("width", oWidth, true);
	jQuery.sap.byId(this.getId()).css("width", oWidth);
	return this;
};

/**
 * API method to place the page inidicator. 
 *
 * @param oPlacement either sap.m.PlacementType.Top or sap.m.PlacementType.Bottom
 * @public
 */
sap.m.Carousel.prototype.setPageIndicatorPlacement = function(oPlacement) {
	if(sap.m.PlacementType.Top != oPlacement &&
			sap.m.PlacementType.Bottom != oPlacement) {
		jQuery.sap.assert(false, "sap.m.Carousel.prototype.setPageIndicatorPlacement: invalid value '" + 
				oPlacement + "'. Valid values: sap.m.PlacementType.Top, sap.m.PlacementType.Bottom." +
						"\nUsing default value sap.m.PlacementType.Bottom");
		oPlacement = sap.m.PlacementType.Bottom;
	}
	
	//do NOT suppress rerendering
	this.setProperty("pageIndicatorPlacement", oPlacement);
	return this;
};

/**
 * API method to set whether the carousel should loop, i.e
 * show the first page after the last page is reached and vice 
 * versa.
 *
 * @param bLoop the new loop property
 * @public
 */
sap.m.Carousel.prototype.setLoop = function(bLoop) {
	if(!!this._oSwipeView) {
		this._oSwipeView.options.loop = bLoop;
	}
	
	//do suppress rerendering
	this.setProperty("loop", bLoop, true);
	return this;
};

/**
 * API method to set whether the carousel should display the page indicator
 *
 * @param bLoop the new loop property
 * @public
 */
sap.m.Carousel.prototype.setShowPageIndicator = function(bShowPageIndicator) {
	
	var $PageInd = jQuery.sap.byId(this._getNavId());
	
	if(!!$PageInd) {
		if(bShowPageIndicator) {
			$PageInd.show();
		} else {
			$PageInd.hide();
		}
	}
	
	//do suppress rerendering
	this.setProperty("showPageIndicator", bShowPageIndicator, true);
	return this;
};

/**
 * API method to show the next page in the page list.
 * @public
 */
sap.m.Carousel.prototype.previous = function () {
	if (!!this._oSwipeView) {
		this._oSwipeView.prev();
		this._updateVisualIndicator(this._oSwipeView.pageIndex);
	}
	return this;
}; 

/**
 * API method to show the previous page in the page list.
 * @public
 */
sap.m.Carousel.prototype.next = function () {
	if (!!this._oSwipeView) {
		this._oSwipeView.next();
		this._updateVisualIndicator(this._oSwipeView.pageIndex);
	}
	return this;
};

/**
 * Called when page swipe is initiated. 
 * 
 * @private
 */
sap.m.Carousel.prototype._doSwipeStarted = function () {
	
	this._oSwipeView.initialSizeCheck();
	
	//Make sure the visual indicator is updated when pages 
	//are flipped quickly
	this._updateVisualIndicator(this._oSwipeView.pageIndex);
};


/**
 * 'MoveIn' event is triggered instead 'flip' during 'hasty' page flips. Contains
 * a workaround to prevent swipe view from getting stuck after 'hasty' page flip
 * 
 * @private
 */
sap.m.Carousel.prototype._doMoveIn = function () {
	//Delayed call to make sure, any pending rendering is completed
	setTimeout(jQuery.proxy(function() {
		//sync currently displayed page with swipeview index
		if(!!this._oSwipeView) {
			this._doSwipeCompleted();
		}
	}, this), 250);
	
	
};


/**
 * Called after page change is complete. Takes care of the necessary 
 * re-rendering and property updates
 * 
 * @param oEvent generic event parameter
 * @param bInitialLoad if true, 'unloadPage' will not be fired. This is necessary on initial load.
 * @private
 */
sap.m.Carousel.prototype._doSwipeCompleted = function (oEvent, bInitialLoad) {
	var upcoming, i;
	var pageList = this.getPages();
	if(pageList.length == 0) {
		return;
	}
	
	//Page swipe is complete. Prepare to fire 'SwipeCompleted' event
	//Figure out ids of previous and next page
	var pPId =  pageList[this._oSwipeView.pageIndex - 1] ?  pageList[this._oSwipeView.pageIndex - 1].getId() : null;
	var nPId =  pageList[this._oSwipeView.pageIndex + 1] ?  pageList[this._oSwipeView.pageIndex + 1].getId() : null;
	
	if(this.getLoop()) {
		if(!pPId) {
			//if in loop mode, the page left to first page is the last page
			pPId = pageList[pageList.length-1].getId();
		} 
		if(!nPId) {
			//if in loop mode, the page right to last page is the first page
			nPId = pageList[0].getId();
		} 
	}
	
	//Put down active page id before for teh 'pageChanged' event 
	var sOldActivePageId = this.getActivePage();
	var rm = sap.ui.getCore().createRenderManager();
	//Reminder for the pages which will be kicked out after swipe. May be more than one if it is a fast swipe
	var aDeletedPages = [];

	//If there are less than 3 pages to display, we do not need
	//to populate all master pages
	var first = pageList.length > 2 ? 0 : 1;
	var last = pageList.length == 1 ? 2 : 3;
	
	for (i=first; i<last; i++) {
		//make sure 'upcoming' is a number. This is necessary if it is used to update
		//swipe view's current page nr
		upcoming = parseInt(this._oSwipeView.masterPages[i].dataset.upcomingPageIndex, 10);
		//first condition in if clause: masterPage needs new child
		//second condition: pageIndex is the dame as upcoming but there is no dom ref
		//this may happen when '_doSwipeCompleted' is triggered during startup
		var current = parseInt(this._oSwipeView.masterPages[i].dataset.pageIndex, 10);
		
		if (upcoming != current || !pageList[upcoming].getDomRef()) {
			aDeletedPages[i] = current; 
			
			//Check if page has been shown before. If not fire 'BeforeFirstShow'
			if(!pageList[upcoming]._bShownInMCarousel) {
				pageList[upcoming]._bShownInMCarousel = true;
				var oBeforeFirstShowEvent = jQuery.Event("BeforeFirstShow");
				oBeforeFirstShowEvent.srcControl = this;
				pageList[upcoming]._handleEvent(oBeforeFirstShowEvent);
			}

			//Fire 'BeforeShow' on upcoming control
			var oBeforeShowEvent = jQuery.Event("BeforeShow");
			oBeforeShowEvent.srcControl = this;
			pageList[upcoming]._handleEvent(oBeforeShowEvent);
			
			if(!!pageList[upcoming].getDomRef()) {
				// Need to remove this element from DOM because it will
				// be added again somewhere else
				jQuery(pageList[upcoming].getDomRef()).remove();
			}
			rm.renderControl(pageList[upcoming]);
			rm.flush(jQuery.sap.domById(this._getContentId() + "-MstPgCont-" + i ), false);
			
			//Event is fired before rendering of new page takes place to let clients
			//prepare these pages
			this.fireLoadPage({pageId: pageList[upcoming].getId()});
		} 
		var $ithMasterPage = jQuery(this._oSwipeView.masterPages[i]);
		//Page is loaded, remove busy indicator
		$ithMasterPage.removeClass("swipeview-loading");
		this._toggleBusyIcon(i, false);
		
		//Make sure that swipe-view pointer to current page is
		//up to date. This may sometimes not be the case, especially after
		//hasty page flips
		if($ithMasterPage.hasClass("swipeview-active")) {
			//This is where we 
			this._oSwipeView.pageIndex = upcoming; 
			//Also make sure that the master page is not hidden
			//Using same coding style as in swipe-view-js here
			this._oSwipeView.masterPages[i].style.visibility = '';
		}
	}
	
	this._updatePageWidths();
	
	//this updates the active page member and the visual indicator
	this._updateActivePage();
	if(!bInitialLoad) {
		for(i=0; i<3; i++) {
			if(!isNaN(aDeletedPages[i]) && !!pageList[aDeletedPages[i]]) {
				this.fireUnloadPage({ pageId: pageList[aDeletedPages[i]].getId()});
				//Fire 'AfterHide' on discarded control
				var oEvent = jQuery.Event("AfterHide");
				oEvent.srcControl = this;
				pageList[aDeletedPages[i]]._handleEvent(oEvent);
			}
		}
	}
	
	
	//Delayed call to make sure, any pending rendering is completed
	setTimeout(jQuery.proxy(function() {
		this._oSwipeView.__resize();
		if(!bInitialLoad) {
			this.firePageChanged({ oldActivePageId: sOldActivePageId,
				newActivePageId: this.getActivePage()});
		}
	}, this), 50);
	//clean up
	rm.destroy();
	//reset global swipe event flag
	this.bSuppressFireSwipeEvents = false;
};

/**
 * Moves the carousel to the currently active page by calling 'next' or 'prev'
 * several times.
 * 
 * @param newActivePageNr number of the new active page. Saves one call of the '_getPageNumber' method
 * @return true if move was necessary
 * @private
 */
sap.m.Carousel.prototype._moveToActivePage = function () {
	var bResult = false;
	var pageList = this.getPages();
	if (!!this._oSwipeView && pageList.length > 0) {
		this.bSuppressFireSwipeEvents = true;
		var lastActivePageNr = this._oSwipeView.pageIndex;
		var newActivePageNr = this._getPageNumber(this.getActivePage());
		
		if(isNaN(newActivePageNr)) {
			jQuery.sap.log.warning(false, "sap.m.Carousel.prototype._moveToActivePage: Cannot navigate to page '" + 
					this.getActivePage() + "' because it is not contained in the carousel's pages aggregation. Using 1. page instead");
			
			//initialize active page id
			this.setActivePage(pageList[0].getId());
			newActivePageNr = 0;
		}
		
		//Check if we have to step forward or backward to get to the new active page
		var fnMove = lastActivePageNr < newActivePageNr ? this.next : this.previous;  
		
		while (this._oSwipeView.pageIndex != newActivePageNr) {
			fnMove.apply(this);
			bResult = true;
		}
			
		this.bSuppressFireSwipeEvents = false;
	}
	return bResult;
};

/**
 * Determines the position of a given page in the carousel's page list
 * 
 * @return the position of a given page in the carousel's page list or 'undefined' if it does not exist in the list.
 * @private
 */
sap.m.Carousel.prototype._getPageNumber = function(oPage) {
	var i, result;
	
	for(i=0; i<this.getPages().length; i++) {
		if(this.getPages()[i].getId() == oPage) {
			result = i;
			break;
		}
	}
	return result;
};

/**
 * Updates visual indicator
 * 
 * @param iActivePageNr current active page
 * @private
 */
sap.m.Carousel.prototype._updateVisualIndicator = function (iActivePageNr) {
	if (!!this._oSwipeView) {
		//update visual indicator
		var selectedDot = document.querySelector('#' + this._getNavId() + ' .sapMCrslIndLstItSel');
		if(selectedDot) {
			jQuery.sap.byId(selectedDot.id).removeClass('sapMCrslIndLstItSel');
		}
		var dots = document.querySelectorAll('#' + this._getNavId() + ' .sapMCrslIndLstIt');
		//'dots' may be empty if carousel has already been removed from DOM
		if(dots[iActivePageNr]) {
			jQuery.sap.byId(dots[iActivePageNr].id).addClass('sapMCrslIndLstItSel');
		}
	}
};



/**
 * Updates 'ActivePage' association and the visual indicator. 
 * 
 * @param iActivePageNr current active page
 * @private
 */
sap.m.Carousel.prototype._updateActivePage = function () {
	if (!!this._oSwipeView) {
		var activePageNr = this._oSwipeView.pageIndex;
		var oPage = this.getPages()[activePageNr];
		this.setAssociation("activePage", oPage, true);
		//update visual indicator
		this._updateVisualIndicator(activePageNr);
	}
};


/**
 * Provides ID of indicator list for easy css class updates
 * 
 * @private
 */
sap.m.Carousel.prototype._getNavId = function() {
	return this.getId() + '-nav';
};

/**
 * Provides ID of carousel content for easy css class updates
 * 
 * @private
 */
sap.m.Carousel.prototype._getContentId = function() {
	return this.getId() + '-content';
};

/**
 * Provides ID of previous button for easy css class updates
 * 
 * @private
 */
sap.m.Carousel.prototype._getPrevBtnId = function() {
	return this.getId() + '-prevBtn';
};

/**
 * Provides ID of next button for easy css class updates
 * 
 * @private
 */
sap.m.Carousel.prototype._getNextBtnId = function() {
	return this.getId() + '-nextBtn';
};


/**
 * Refresh sizes after Orientation change (only necessary for non ios)
 * @param oEvent the event parameter
 * @private
 */
sap.m.Carousel.prototype._handleOrientationChange = function() {
	//Delayed call to make sure, any pending rendering is completed.
	//Must wait 200ms, otherwise the client width is not updated yet
	//after orientation change.
	if(!jQuery.os.ios && !!this._oSwipeView){
		setTimeout(jQuery.proxy(function() {
			this._oSwipeView.__resize();
			this._updatePageWidths();
		}, this), 250);
	}
};


/**
 * Displays busy icon and hides content on a given masterpage or vice versa.
 * @param iMasterPage masterPage which shall be updated
 * @param bShowBusyIcon if true, the busy icon will be displayed on the
 * masterpage and the content will be hidden.
 * @private
 */
sap.m.Carousel.prototype._toggleBusyIcon = function(iMasterPage, bShowBusyIcon) {
	if(bShowBusyIcon) {
		this._aBusyIndicators[iMasterPage].$().show();
		this._aMasterPageDivs[iMasterPage].hide();
	} else {
		this._aBusyIndicators[iMasterPage].$().hide();
		this._aMasterPageDivs[iMasterPage].show();
	}
};

/**
 * Workaround for an Android Bugfor image pages: sets the width of each image page to the 
 * currently available width within the device.
 * 
 * @private 
 */
sap.m.Carousel.prototype._updatePageWidths = function() {
	if(jQuery.os.android && !!jQuery.os.version && (!!jQuery.os.version.match(/2\.3\.[0-9]*/))){
		var pageList = this.getPages();
		var domRef = jQuery.sap.domById(this._getContentId());
		var pageWidth = domRef.clientWidth + "px";
		
		//In Android 2.3, we overwerite any widths which have been assigned
		//to the carousel pages to avoid a sizing issue
		for(var i=0; i<pageList.length; i++) {
			if(pageList[i] instanceof sap.m.Image) {
				jQuery.sap.byId(pageList[i].getId()).css("max-width", pageWidth)
			}
		}
	}
};


/**
 * Re-renders the carousel's page indicator dots
 *
 * @private
 */
sap.m.Carousel.prototype._rerenderPageIndicatorDots = function() {
	//The Tap bindings for 'next' and 'previous' button get lost 
	//after re-rendering, so we clean them up
	this._cleanUpTapBindings();
	
	var pageIndicator = jQuery.sap.domById(this._getNavId());
	var rm = sap.ui.getCore().createRenderManager();
	sap.m.CarouselRenderer.renderPageIndicatorDots(rm, this);
	rm.flush(pageIndicator);
	rm.destroy();
	
	//Re-create tap bindings for previous - and next- button
	//after rendering
	this._createTapBindings();
};



