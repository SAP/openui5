/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.core.ScrollBar.
jQuery.sap.declare("sap.ui.core.ScrollBar");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new ScrollBar.
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
 * <li>{@link #getVertical vertical} : boolean (default: true)</li>
 * <li>{@link #getScrollPosition scrollPosition} : int</li>
 * <li>{@link #getSize size} : sap.ui.core.CSSSize</li>
 * <li>{@link #getContentSize contentSize} : sap.ui.core.CSSSize</li>
 * <li>{@link #getSteps steps} : int</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.ui.core.ScrollBar#event:scroll scroll} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The ScrollBar control can be used for virtual scrolling of a certain area.
 * This means: to simulate a very large scrollable area when technically the area is small and the control takes care of displaying the respective part only. E.g. a Table control can take care of only rendering the currently visible rows and use this ScrollBar control to make the user think he actually scrolls through a long list.
 * @extends sap.ui.core.Control
 *
 * @author  
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.ui.core.ScrollBar
 */
sap.ui.core.Control.extend("sap.ui.core.ScrollBar", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"bind", "unbind", "pageUp", "pageDown"
	],

	// ---- control specific ----
	library : "sap.ui.core",
	properties : {
		"vertical" : {type : "boolean", group : "Behavior", defaultValue : true},
		"scrollPosition" : {type : "int", group : "Behavior", defaultValue : null},
		"size" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
		"contentSize" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
		"steps" : {type : "int", group : "Dimension", defaultValue : null}
	},
	events : {
		"scroll" : {}
	}
}});


/**
 * Creates a new subclass of class sap.ui.core.ScrollBar with name <code>sClassName</code> 
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
 * @name sap.ui.core.ScrollBar.extend
 * @function
 */

sap.ui.core.ScrollBar.M_EVENTS = {'scroll':'scroll'};


/**
 * Getter for property <code>vertical</code>.
 * Orientation. Defines if the Scrollbar is vertical or horizontal.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>vertical</code>
 * @public
 * @name sap.ui.core.ScrollBar#getVertical
 * @function
 */


/**
 * Setter for property <code>vertical</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVertical  new value for property <code>vertical</code>
 * @return {sap.ui.core.ScrollBar} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.ScrollBar#setVertical
 * @function
 */

/**
 * Getter for property <code>scrollPosition</code>.
 * Scroll position in steps or pixels.
 *
 * Default value is <code></code>
 *
 * @return {int} the value of property <code>scrollPosition</code>
 * @public
 * @name sap.ui.core.ScrollBar#getScrollPosition
 * @function
 */


/**
 * Setter for property <code>scrollPosition</code>.
 *
 * Default value is <code></code> 
 *
 * @param {int} iScrollPosition  new value for property <code>scrollPosition</code>
 * @return {sap.ui.core.ScrollBar} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.ScrollBar#setScrollPosition
 * @function
 */

/**
 * Getter for property <code>size</code>.
 * Size of the Scrollbar (in pixels).
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>size</code>
 * @public
 * @name sap.ui.core.ScrollBar#getSize
 * @function
 */


/**
 * Setter for property <code>size</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sSize  new value for property <code>size</code>
 * @return {sap.ui.core.ScrollBar} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.ScrollBar#setSize
 * @function
 */

/**
 * Getter for property <code>contentSize</code>.
 * Size of the scrollable content (in pixels).
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>contentSize</code>
 * @public
 * @name sap.ui.core.ScrollBar#getContentSize
 * @function
 */


/**
 * Setter for property <code>contentSize</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sContentSize  new value for property <code>contentSize</code>
 * @return {sap.ui.core.ScrollBar} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.ScrollBar#setContentSize
 * @function
 */

/**
 * Getter for property <code>steps</code>.
 * Number of steps to scroll. Used if the size of the content is not known as the data is loaded dynamically.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {int} the value of property <code>steps</code>
 * @public
 * @name sap.ui.core.ScrollBar#getSteps
 * @function
 */


/**
 * Setter for property <code>steps</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {int} iSteps  new value for property <code>steps</code>
 * @return {sap.ui.core.ScrollBar} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.ScrollBar#setSteps
 * @function
 */

/**
 * Scroll event. 
 *
 * @name sap.ui.core.ScrollBar#scroll
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.ScrollBarAction} oControlEvent.getParameters.action Actions are: Click on track, button, drag of thumb, or mouse wheel click.
 * @param {boolean} oControlEvent.getParameters.forward Direction of scrolling: back (up) or forward (down).
 * @param {int} oControlEvent.getParameters.newScrollPos Current Scroll position either in pixels or in steps.
 * @param {int} oControlEvent.getParameters.oldScrollPos Old Scroll position - can be in pixels or in steps.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'scroll' event of this <code>sap.ui.core.ScrollBar</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ui.core.ScrollBar</code>.<br/> itself. 
 *  
 * Scroll event. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.ui.core.ScrollBar</code>.<br/> itself.
 *
 * @return {sap.ui.core.ScrollBar} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.ScrollBar#attachScroll
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'scroll' event of this <code>sap.ui.core.ScrollBar</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ui.core.ScrollBar} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.ScrollBar#detachScroll
 * @function
 */


/**
 * Fire event scroll to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'action' of type <code>sap.ui.core.ScrollBarAction</code> Actions are: Click on track, button, drag of thumb, or mouse wheel click.</li>
 * <li>'forward' of type <code>boolean</code> Direction of scrolling: back (up) or forward (down).</li>
 * <li>'newScrollPos' of type <code>int</code> Current Scroll position either in pixels or in steps.</li>
 * <li>'oldScrollPos' of type <code>int</code> Old Scroll position - can be in pixels or in steps.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.core.ScrollBar} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ui.core.ScrollBar#fireScroll
 * @function
 */

/**
 * Binds the mouse wheel scroll event of the control that has the scrollbar to the scrollbar itself.
 *
 * @name sap.ui.core.ScrollBar.prototype.bind
 * @function
 * @param {string} 
 *         sOOwnerDomRef
 *         Dom ref of the control that uses the scrollbar

 * @type void
 * @public
 */


/**
 * Unbinds the mouse wheel scroll event of the control that has the scrollbar
 *
 * @name sap.ui.core.ScrollBar.prototype.unbind
 * @function
 * @param {string} 
 *         sOOwnerDomRef
 *         Dom ref of the Control that uses the scrollbar

 * @type void
 * @public
 */


/**
 * Page Up is used to scroll one page back.
 *
 * @name sap.ui.core.ScrollBar.prototype.pageUp
 * @function

 * @type void
 * @public
 */


/**
 * Page Down is used to scroll one page forward.
 *
 * @name sap.ui.core.ScrollBar.prototype.pageDown
 * @function

 * @type void
 * @public
 */


// Start of sap\ui\core\ScrollBar.js
/**
 * This file defines behavior for the control,
 */

// =============================================================================
// BASIC CONTROL API
// =============================================================================

/**
 * Initialization of the Scrollbar control
 * @private
 */
sap.ui.core.ScrollBar.prototype.init = function(){

	// JQuery Object - Dom reference of the scroll bar
	this._$ScrollDomRef = null;

	// In pixels - exact position
	this._iOldScrollPos = 0;

	// In steps
	this._iOldStep = 0;

	// True if the scroll position was verified. And false if the check was not done yet - for example if the rendering is not done completely
	this._bScrollPosIsChecked = false;

	// RTL mode
	this._bRTL = sap.ui.getCore().getConfiguration().getRTL();

	// Supress scroll event
	this._bSuppressScroll = false;
	
	if (jQuery.sap.touchEventMode !== "OFF") {
		jQuery.sap.require("sap.ui.thirdparty.zyngascroll");

		// Remember last touch scroller position to prevent unneeded rendering
		this._iLastTouchScrollerPosition = null;
		
		// The threshold in pixel for a step when scrolled by touch events
		this._iTouchStepTreshold = 24;
		
		// Some zynga scroller methods call the touch handler. By settings this variable to false, touch handling is prevented and
		// number of unneeded rendering is reduced.
		this._bSkipTouchHandling = false;
		
		this._oTouchScroller = new window.Scroller(jQuery.proxy(this._handleTouchScroll,this), {
			bouncing:false
		});
	}
};


/**
 * Rerendering handling
 * @private
 */
sap.ui.core.ScrollBar.prototype.onBeforeRendering = function() {
	jQuery.sap.byId(this.getId() + "-sb").unbind("scroll", this.onscroll);
};


/**
 * Rerendering handling
 * @private
 */
sap.ui.core.ScrollBar.prototype.onAfterRendering = function () {
	 // count of steps (comes per API)
	this._iSteps = this.getSteps();

	// content size in pixel
	var sContentSize = this.getContentSize();

	// determine the mode
	this._bStepMode = !sContentSize;

	var iScrollBarSize = this.getSize();
	if(jQuery.sap.endsWith(iScrollBarSize,"px")){
		iScrollBarSize = iScrollBarSize.substr(0, iScrollBarSize.length -2);
	} else {
		iScrollBarSize = this.getVertical() ? this.$().height() : this.$().width();
	}

	var stepSize = null;

	var $ffsize = jQuery.sap.byId(this.getId() + "-ffsize");
	if (jQuery.browser.mozilla) {
		stepSize = $ffsize.outerHeight();
	}
	$ffsize.remove();

	if  (jQuery.browser.webkit) {
		// document.width (was not supported by Chrome 17 anymore but works again with Chrome 18+) 
		stepSize = Math.round(40 / (document.width / jQuery(document).width()));
		//jQuery.sap.log.debug( stepSize + " ****************************STEP SIZE*************************************************************");
	}

	if (this.getVertical()) {
		this._iFactor = jQuery.browser.mozilla ? stepSize :	jQuery.browser.webkit ? stepSize : Math.floor(iScrollBarSize  * 0.125);
		this._iFactorPage = jQuery.browser.mozilla ? iScrollBarSize - stepSize : Math.floor(iScrollBarSize * 0.875)
	} else {
		this._iFactor = jQuery.browser.mozilla ? 10 : jQuery.browser.webkit ? stepSize :  7 ;
		this._iFactorPage = jQuery.browser.mozilla ? Math.floor(iScrollBarSize * 0.8) : jQuery.browser.webkit ? Math.floor(iScrollBarSize  * 0.875) : iScrollBarSize-14;
	}

	this._$ScrollDomRef = jQuery.sap.byId(this.getId() + "-sb");

	if (this._bStepMode) {
		if (this.getVertical()) {
			// calculate the height of the content size => scroll bar height + (steps * browser step size)
			var iContentSize = this._$ScrollDomRef.height() + this._iSteps * this._iFactor;
			// set the content size
			this._$ScrollDomRef.find("div").height(iContentSize);
		} else {
			// calculate the height of the content size => scroll bar size + (steps * browser step size)
			var iContentSize = this._$ScrollDomRef.width() + this._iSteps * this._iFactor;
			// set the content size
			this._$ScrollDomRef.find("div").width(iContentSize);
		}
	}

	this.setCheckedScrollPosition(this.getScrollPosition() ? this.getScrollPosition() : 0, true);

	this._$ScrollDomRef.bind("scroll", jQuery.proxy(this.onscroll, this));

	if (jQuery.sap.touchEventMode !== "OFF") {
		this._bSkipTouchHandling = true;
		
		var oContent = {
				width:0,
				height:0
		};
		oContent[this.getVertical()? "height" : "width"] = this._bStepMode ? (this.getSteps() * this._iTouchStepTreshold) : parseInt(this.getContentSize(), 10);

		this._oTouchScroller.setDimensions(0, 0, oContent.width, oContent.height);
	
		var oElement = this._$ScrollDomRef.get(0);
		var oRect = oElement.getBoundingClientRect();
		this._oTouchScroller.setPosition(oRect.left + oElement.clientLeft, oRect.top + oElement.clientTop);
		this._bSkipTouchHandling = false;
	}
};

//=============================================================================
// CONTROL EVENT HANDLING
//=============================================================================

/**
 * Event object contains detail (for Firefox and Opera), and wheelData (for Internet Explorer, Safari, and Opera).
 * Scrolling down is a positive number for detail, but a negative number for wheelDelta.
 * @param {jQuery.Event} oEvent Event object contains detail (for Firefox and Opera), and wheelData (for Internet Explorer, Safari, and Opera).
 * @private
*/
sap.ui.core.ScrollBar.prototype.onmousewheel = function(oEvent)  {

	// ignore the mousewheel events when the scrollbar is not visible
	if (this.$().is(":visible")) {
	
		// So let's scale and make negative value for all scroll down in all browsers.
		var oOriginalEvent = oEvent.originalEvent;
		var wheelData = oOriginalEvent.detail ? oOriginalEvent.detail : oOriginalEvent.wheelDelta * (-1) / 40;
	
		// find out if the user is scrolling up= back or down= forward.
		var bForward = wheelData > 0 ? true : false;
	
		if (jQuery.sap.containsOrEquals(this._$ScrollDomRef[0], oEvent.target)) {
			this._doScroll(sap.ui.core.ScrollBarAction.MouseWheel, bForward);
		} else {
	
			this._bMouseWheel = true;
			var pos = null;
			if (this._bStepMode) {
				pos = wheelData + this._iOldStep;
			} else {
				pos = wheelData * this._iFactor + this._iOldScrollPos;
			}
	
			this.setCheckedScrollPosition(pos, true);
		}
	
		// prevent the default behavior
		oEvent.preventDefault();
		oEvent.stopPropagation();
		return false;
		
	}
		
};


/**
 * Touch start handler. Called when the "touch start" event occurs on this control.
 * @param {jQuery.Event} oEvent Touch Event object 
 * @private
*/
sap.ui.core.ScrollBar.prototype.ontouchstart = function(oEvent) {
	// Don't react if initial down happens on a form element
	var aTouches =  oEvent.touches;
	var oFirstTouch = aTouches[0];
	if (oFirstTouch && oFirstTouch.target && oFirstTouch.target.tagName.match(/input|textarea|select/i)) {
		return;
	}

	this._oTouchScroller.doTouchStart(aTouches, oEvent.timeStamp);
	if (aTouches.length == 1) {
		oEvent.preventDefault();
	}
};


/**
 * Touch move handler. Called when the "touch move" event occurs on this control.
 * @param {jQuery.Event} oEvent Touch Event object 
 * @private
*/
sap.ui.core.ScrollBar.prototype.ontouchmove = function(oEvent) {
	this._oTouchScroller.doTouchMove(oEvent.touches, oEvent.timeStamp, oEvent.scale);
};


/**
 * Touch end handler. Called when the "touch end" event occurs on this control.
 * @param {jQuery.Event} oEvent Touch Event object 
 * @private
*/
sap.ui.core.ScrollBar.prototype.ontouchend = function(oEvent) {
	this._oTouchScroller.doTouchEnd(oEvent.timeStamp);
};

/**
 * Touch cancel handler. Called when the "touch cancel" event occurs on this control.
 * @param {jQuery.Event} oEvent Touch Event object 
 * @private
*/
sap.ui.core.ScrollBar.prototype.ontouchcancel = function(oEvent) {
	this._oTouchScroller.doTouchEnd(oEvent.timeStamp);
};

/**
 * Handles the Scroll event.
 *
 * @param {jQuery.Event}  oEvent Event object
 * @private
 */
sap.ui.core.ScrollBar.prototype.onscroll = function(oEvent) {
	//jQuery.sap.log.debug("*****************************onScroll************************ SUPRESS SCROLL:  " + this._bSuppressScroll );
	if (this._bSuppressScroll) {
		this._bSuppressScroll = false;
		oEvent.preventDefault();
		oEvent.stopPropagation();
		return false;
	}

	// Set new Scroll position
	var iScrollPos = null;
	if (this._$ScrollDomRef){
		if (this.getVertical()) {
			iScrollPos = this._$ScrollDomRef.scrollTop();
		} else {
			iScrollPos = this._$ScrollDomRef.scrollLeft();
			if ( jQuery.browser.mozilla && this._bRTL ) {
				iScrollPos = Math.abs(iScrollPos);
			} else if ( jQuery.browser.webkit && this._bRTL ) {
				var oScrollDomRef = this._$ScrollDomRef.get(0);
				iScrollPos = oScrollDomRef.scrollWidth - oScrollDomRef.clientWidth - oScrollDomRef.scrollLeft;
			}
		}
	}

	var iDelta = iScrollPos - this._iOldScrollPos;

	var bForward = iDelta > 0 ? true : false;
	if (iDelta < 0) {
		iDelta = iDelta*(-1);
	}

	var eAction = sap.ui.core.ScrollBarAction.Drag;
	if (iDelta == this._iFactor ) {
		eAction = sap.ui.core.ScrollBarAction.Step;
	} else if (iDelta == this._iFactorPage) {
		eAction = sap.ui.core.ScrollBarAction.Page;
	} else if (this._bMouseWheel) {
		eAction = sap.ui.core.ScrollBarAction.MouseWheel;
	}

	// Proceed scroll
	this._doScroll(eAction, bForward);

	oEvent.preventDefault();
	oEvent.stopPropagation();
	return false;
};


/**
 * Handler for the touch scroller instance. Called only when touch mode is enabled.
 *   
 * @param {number} left Horizontal scroll position
 * @param {number} top Vertical scroll position 
 * @param {number} zoom The zoom level
 * @private
 */
sap.ui.core.ScrollBar.prototype._handleTouchScroll = function(iLeft, iTop, iZoom) {
	if (this._bSkipTouchHandling) {
		return;
	}

	var iValue = this.getVertical() ? iTop : iLeft; 	
	if (this._bStepMode) {
		var iPos = Math.max(Math.round(iValue / this._iTouchStepTreshold), 0);
	} else {
		var iPos = Math.round(iValue);
	}
	if (this._iLastTouchScrollerPosition !== iPos) {
		this._iLastTouchScrollerPosition = iPos;
		this.setCheckedScrollPosition(iPos, true);
		this.fireScroll();	
	}
};


//=============================================================================
// PUBLIC API METHODS
//=============================================================================

/*
 * @see JSDoc generated by SAPUI5 control API generator
 */
sap.ui.core.ScrollBar.prototype.unbind = function (oOwnerDomRef) {
	if (oOwnerDomRef) {
		this._$OwnerDomRef = jQuery(oOwnerDomRef);
		if (this.getVertical()) {
			this._$OwnerDomRef.unbind(jQuery.browser.mozilla ? "DOMMouseScroll" : "mousewheel", this.onmousewheel);			
		}
		
		if (jQuery.sap.touchEventMode !== "OFF") {
			this._$OwnerDomRef.unbind(this._getTouchEventType("touchstart"), jQuery.proxy(this.ontouchstart, this));
			this._$OwnerDomRef.unbind(this._getTouchEventType("touchmove"), jQuery.proxy(this.ontouchmove, this));
			this._$OwnerDomRef.unbind(this._getTouchEventType("touchend"), jQuery.proxy(this.ontouchend, this));
			this._$OwnerDomRef.unbind(this._getTouchEventType("touchcancle"), jQuery.proxy(this.ontouchcancle, this));
		}
	}
};

/*
 * @see JSDoc generated by SAPUI5 control API generator
 */
sap.ui.core.ScrollBar.prototype.bind = function (oOwnerDomRef) {
	if (oOwnerDomRef) {
		this._$OwnerDomRef = jQuery(oOwnerDomRef);
		if (this.getVertical()) {
			this._$OwnerDomRef.bind(jQuery.browser.mozilla ? "DOMMouseScroll" : "mousewheel", jQuery.proxy(this.onmousewheel, this));
		}

		if (jQuery.sap.touchEventMode !== "OFF") {
			this._$OwnerDomRef.bind(this._getTouchEventType("touchstart"), jQuery.proxy(this.ontouchstart, this));
			this._$OwnerDomRef.bind(this._getTouchEventType("touchmove"), jQuery.proxy(this.ontouchmove, this));
			this._$OwnerDomRef.bind(this._getTouchEventType("touchend"), jQuery.proxy(this.ontouchend, this));
			this._$OwnerDomRef.bind(this._getTouchEventType("touchcancle"), jQuery.proxy(this.ontouchcancle, this));
		}
	}
};

/**
 * Returns the event type for a given touch event type base on the current touch event mode (jQuery.sap.touchEventMod).
 *   
 * @param {string} sType The touch event to convert
 * @return {string} The converted event type.
 * @private
 */
sap.ui.core.ScrollBar.prototype._getTouchEventType = function (sType) {
	return jQuery.sap.touchEventMode === "SIM" ? ("sap" + sType) : sType;
};

/*
 * @see JSDoc generated by SAPUI5 control API generator
 */
sap.ui.core.ScrollBar.prototype.pageUp = function() {
	// call on scroll
	this._doScroll(sap.ui.core.ScrollBarAction.Page, false);
};

/*
 * @see JSDoc generated by SAPUI5 control API generator
 */
sap.ui.core.ScrollBar.prototype.pageDown = function() {
    // call on scroll
    this._doScroll(sap.ui.core.ScrollBarAction.Page, true);
};

//=============================================================================
// OVERRIDE OF SETTERS
//=============================================================================

/*
 * @see JSDoc generated by SAPUI5 control API generator
 */
sap.ui.core.ScrollBar.prototype.setScrollPosition = function (scrollPosition) {
	if (this._$ScrollDomRef) {
		this.setCheckedScrollPosition(scrollPosition, true);
	} else {
		this.setProperty("scrollPosition", scrollPosition);
	}
};

/*
 * After the Scrollbar is rendered, we check the validity of the scroll position and set Scroll Left and ScrollTop.
 * @private
 */
sap.ui.core.ScrollBar.prototype.setCheckedScrollPosition = function (scrollPosition, callScrollEvent) {

	var iCheckedSP = Math.max(scrollPosition, 0);

	if ( this._bStepMode === undefined) {
		this._bStepMode = !this.getContentSize();
	}

	var iScrollPos = iCheckedSP;
	if ( this._bStepMode) {

		iCheckedSP = Math.min(iCheckedSP, this.getSteps());

		// STEPS MODE - Calculate the position in PX
		iScrollPos = iCheckedSP * this._iFactor;
	}

	this._bSuppressScroll = !callScrollEvent;
	this.setProperty("scrollPosition", iCheckedSP, true);

	if ( this.getVertical()) {
			this._$ScrollDomRef.scrollTop(iScrollPos);
		} else {
		if ( jQuery.browser.mozilla && this._bRTL ) {
			this._$ScrollDomRef.scrollLeft(-iScrollPos);
		} else if ( jQuery.browser.webkit && this._bRTL ) {
			var oScrollDomRef = this._$ScrollDomRef.get(0);
			this._$ScrollDomRef.scrollLeft(oScrollDomRef.scrollWidth - oScrollDomRef.clientWidth - iScrollPos);
		} else {
			this._$ScrollDomRef.scrollLeft(iScrollPos);
		}
	}

 	if (jQuery.sap.touchEventMode !== "OFF") {
		var value = iCheckedSP;
		if (this._bStepMode) {
			value = Math.round(iCheckedSP * this._iTouchStepTreshold);
		}

		this._oTouchScroller.__scrollTop = this.getVertical() ? value : 0;
		this._oTouchScroller.__scrollLeft =  this.getVertical() ? 0 : value;
	}
};

/*
 * @see JSDoc generated by SAPUI5 control API generator
 */
sap.ui.core.ScrollBar.prototype.setContentSize = function (sContentSize) {

	// Trigger the rerendering when switching the from step mode.
	this.setProperty("contentSize", sContentSize, !this._bStepMode);
	if (!this._bStepMode) {
		var $SbCnt = jQuery.sap.byId(this.getId() + "-sbcnt");
		if ($SbCnt) {
			if (this.getVertical()) {
				$SbCnt.height(sContentSize);
			} else {
				$SbCnt.width(sContentSize);
			}
		}
	}
};

//=============================================================================
// PRIVATE METHODS
//=============================================================================

/**
* Process scroll events and fire scroll event
* @param eAction Action type that can be mouse wheel, Drag, Step or Page.
* @param bForward Scroll Direction - forward or back
* @private
*/
sap.ui.core.ScrollBar.prototype._doScroll = function(eAction, bForward) {

	// Get new scroll position
	var iScrollPos = null;
	if (this._$ScrollDomRef){
		if (this.getVertical()) {
			iScrollPos = this._$ScrollDomRef.scrollTop();
		} else {
			iScrollPos = this._$ScrollDomRef.scrollLeft();
			if (jQuery.browser.mozilla && this._bRTL ) {
				iScrollPos = Math.abs(iScrollPos);
			} else if ( jQuery.browser.webkit && this._bRTL ) {
				var oScrollDomRef = this._$ScrollDomRef.get(0);
				iScrollPos = oScrollDomRef.scrollWidth - oScrollDomRef.clientWidth - oScrollDomRef.scrollLeft;
			}
		}
	}

	if (this._bStepMode) {

		// STEP MODE
		var iStep = parseInt(iScrollPos / this._iFactor, 10);
		var iOldStep = this._iOldStep;

		if (iOldStep !== iStep) {

			// Set new scrollposition without the rerendering
			this.setCheckedScrollPosition(iStep, false);

			jQuery.sap.log.debug("-----STEPMODE-----: New Step: " + iStep + " --- Old Step: " +  iOldStep  + " --- Scroll Pos in px: " + iScrollPos + " --- Action: " + eAction + " --- Direction is forward: " + bForward);
			this.fireScroll({ action: eAction, forward: bForward, newScrollPos: iStep, oldScrollPos: iOldStep});
			this._iOldStep = iStep;

		}
	} else {

		// Set new scroll position without the rerendering
		this.setCheckedScrollPosition(iScrollPos, false);

		jQuery.sap.log.debug("-----PIXELMODE-----: New ScrollPos: " + iScrollPos + " --- Old ScrollPos: " +  this._iOldScrollPos + " --- Action: " + eAction + " --- Direction is forward: " + bForward);
		this.fireScroll({ action: eAction, forward: bForward, newScrollPos: iScrollPos, oldScrollPos: this._iOldScrollPos});
	}
	this._bSuppressScroll = false;
	this._iOldScrollPos = iScrollPos;
	this._bMouseWheel = false;

};

sap.ui.core.ScrollBar.prototype.onThemeChanged = function() {
	this.rerender();
}

/**
 * return the native scroll position without any browser specific correction of 
 * the scroll position value (firefox & RTL => negative value / webkit & RTL =>
 * positive value not beginning with 0 because 0 is left and not as expected 
 * right for webkit RTL mode).
 * @return {int} native scroll position
 * @private
 */
sap.ui.core.ScrollBar.prototype.getNativeScrollPosition = function() {
	if (this._$ScrollDomRef) {
		if (this.getVertical()) {
			return this._$ScrollDomRef.scrollTop();
		} else {
			return this._$ScrollDomRef.scrollLeft();
		}
	}
	return 0;
}

/**
 * sets the scroll position directly
 * @param {int} iNativeScrollPos new native scroll position
 * @private
 */
sap.ui.core.ScrollBar.prototype.setNativeScrollPosition = function(iNativeScrollPos) {
	if (this._$ScrollDomRef) {
		if (this.getVertical()) {
			this._$ScrollDomRef.scrollTop(iNativeScrollPos);
		} else {
			this._$ScrollDomRef.scrollLeft(iNativeScrollPos);
		}
	}
}

