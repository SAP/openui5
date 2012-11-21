/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.BusyDialog.
jQuery.sap.declare("sap.m.BusyDialog");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new BusyDialog.
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
 * <li>{@link #getText text} : string</li>
 * <li>{@link #getTitle title} : string</li>
 * <li>{@link #getCustomIcon customIcon} : sap.ui.core.URI</li>
 * <li>{@link #getCustomIconRotationSpeed customIconRotationSpeed} : int (default: 1000)</li>
 * <li>{@link #getCustomIconDensityAware customIconDensityAware} : boolean (default: true)</li>
 * <li>{@link #getCustomIconWidth customIconWidth} : sap.ui.core.CSSSize</li>
 * <li>{@link #getCustomIconHeight customIconHeight} : sap.ui.core.CSSSize</li>
 * <li>{@link #getCancelButtonText cancelButtonText} : string</li>
 * <li>{@link #getShowCancelButton showCancelButton} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.BusyDialog#event:close close} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Busy Dilaog is used to indicate that the system is busy with some task and the user has to wait. During this time the UI is blocked.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.BusyDialog
 */
sap.ui.core.Control.extend("sap.m.BusyDialog", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"open", "close"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"text" : {type : "string", group : "Appearance", defaultValue : null},
		"title" : {type : "string", group : "Appearance", defaultValue : null},
		"customIcon" : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},
		"customIconRotationSpeed" : {type : "int", group : "Appearance", defaultValue : 1000},
		"customIconDensityAware" : {type : "boolean", group : "", defaultValue : true},
		"customIconWidth" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"customIconHeight" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"cancelButtonText" : {type : "string", group : "Misc", defaultValue : null},
		"showCancelButton" : {type : "boolean", group : "Appearance", defaultValue : false}
	},
	events : {
		"close" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.BusyDialog with name <code>sClassName</code> 
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
 * @name sap.m.BusyDialog.extend
 * @function
 */

sap.m.BusyDialog.M_EVENTS = {'close':'close'};


/**
 * Getter for property <code>text</code>.
 * Optional text shown inside the popup.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.m.BusyDialog#getText
 * @function
 */


/**
 * Setter for property <code>text</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#setText
 * @function
 */

/**
 * Getter for property <code>title</code>.
 * Sets a title to the busy dialog. Default is no title.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>title</code>
 * @public
 * @name sap.m.BusyDialog#getTitle
 * @function
 */


/**
 * Setter for property <code>title</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTitle  new value for property <code>title</code>
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#setTitle
 * @function
 */

/**
 * Getter for property <code>customIcon</code>.
 * Icon that is displayed in the dialog header. This icon is invisible in iOS platform and it's density aware that you can use the density convention (@2, @1.5, etc.) to provide higher resolution image for higher density screen.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>customIcon</code>
 * @public
 * @name sap.m.BusyDialog#getCustomIcon
 * @function
 */


/**
 * Setter for property <code>customIcon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sCustomIcon  new value for property <code>customIcon</code>
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#setCustomIcon
 * @function
 */

/**
 * Getter for property <code>customIconRotationSpeed</code>.
 * Defines the rotation speed of the given image. If a gif is used, the speed has to be set to 0. The unit is in ms.
 *
 * Default value is <code>1000</code>
 *
 * @return {int} the value of property <code>customIconRotationSpeed</code>
 * @public
 * @name sap.m.BusyDialog#getCustomIconRotationSpeed
 * @function
 */


/**
 * Setter for property <code>customIconRotationSpeed</code>.
 *
 * Default value is <code>1000</code> 
 *
 * @param {int} iCustomIconRotationSpeed  new value for property <code>customIconRotationSpeed</code>
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#setCustomIconRotationSpeed
 * @function
 */

/**
 * Getter for property <code>customIconDensityAware</code>.
 * If this is set to false, the src image will be loaded directly without attempting to fetch the density perfect image for high density device.
 * 
 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
 * 
 * If bandwidth is the key for the application, set this value to false.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>customIconDensityAware</code>
 * @public
 * @name sap.m.BusyDialog#getCustomIconDensityAware
 * @function
 */


/**
 * Setter for property <code>customIconDensityAware</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bCustomIconDensityAware  new value for property <code>customIconDensityAware</code>
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#setCustomIconDensityAware
 * @function
 */

/**
 * Getter for property <code>customIconWidth</code>.
 * Width of the provided icon. By default 44px are used.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>customIconWidth</code>
 * @public
 * @name sap.m.BusyDialog#getCustomIconWidth
 * @function
 */


/**
 * Setter for property <code>customIconWidth</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sCustomIconWidth  new value for property <code>customIconWidth</code>
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#setCustomIconWidth
 * @function
 */

/**
 * Getter for property <code>customIconHeight</code>.
 * Height of the provided icon. By default 44px are used.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>customIconHeight</code>
 * @public
 * @name sap.m.BusyDialog#getCustomIconHeight
 * @function
 */


/**
 * Setter for property <code>customIconHeight</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sCustomIconHeight  new value for property <code>customIconHeight</code>
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#setCustomIconHeight
 * @function
 */

/**
 * Getter for property <code>cancelButtonText</code>.
 * The text of the cancel button. The default text is "Cancel" (translated to the respective language).
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>cancelButtonText</code>
 * @public
 * @name sap.m.BusyDialog#getCancelButtonText
 * @function
 */


/**
 * Setter for property <code>cancelButtonText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sCancelButtonText  new value for property <code>cancelButtonText</code>
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#setCancelButtonText
 * @function
 */

/**
 * Getter for property <code>showCancelButton</code>.
 * A cancel button will be rendered inside the busy dialog if this property is set to true.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showCancelButton</code>
 * @public
 * @name sap.m.BusyDialog#getShowCancelButton
 * @function
 */


/**
 * Setter for property <code>showCancelButton</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowCancelButton  new value for property <code>showCancelButton</code>
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#setShowCancelButton
 * @function
 */

/**
 * This event will be fired when the busy dialog is closed. 
 *
 * @name sap.m.BusyDialog#close
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'close' event of this <code>sap.m.BusyDialog</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.BusyDialog</code>.<br/> itself. 
 *  
 * This event will be fired when the busy dialog is closed. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.BusyDialog</code>.<br/> itself.
 *
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#attachClose
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'close' event of this <code>sap.m.BusyDialog</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyDialog#detachClose
 * @function
 */


/**
 * Fire event close to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.BusyDialog} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.BusyDialog#fireClose
 * @function
 */

/**
 * Open the busy popup.
 *
 * @name sap.m.BusyDialog.prototype.open
 * @function

 * @type sap.m.BusyDialog
 * @public
 */


/**
 * Close the busy popup.
 *
 * @name sap.m.BusyDialog.prototype.close
 * @function

 * @type sap.m.BusyDialog
 * @public
 */


// Start of sap\m\BusyDialog.js
///**
// * This file defines behavior for the control,
// */
//sap.m.BusyDialog.prototype.init = function(){
//   // do something for initialization...
//};
jQuery.sap.require("sap.ui.core.Popup");

sap.m.BusyDialog.prototype.init = function(){
	var that = this;
	this._$window = jQuery(window);

	this.oPopup = new sap.ui.core.Popup();
	(jQuery.os.ios) ? this.oPopup.setShadow(true): this.oPopup.setShadow(false);
	this.oPopup.setModal(true, 'sapMBusyBLy');
	this.oPopup.setAnimations(this.openAnimation, this.closeAnimation);

	//the orientationchange event listener
	this._fOrientationChange = jQuery.proxy(this._reposition, this);
	
	this.oPopup._applyPosition = function(oPosition){
		that._setDimensions();
		sap.ui.core.Popup.prototype._applyPosition.call(this, oPosition);
	};
	this.oPopup._showBlockLayer = function(){
		sap.ui.core.Popup.prototype._showBlockLayer.call(this);
		var $BlockRef = jQuery("#sap-ui-blocklayer-popup");
		if (!jQuery.os.ios) {
			if($BlockRef.css('top') !== '48px'){
				$BlockRef.css('top', '48px');
				var className = "sapUiBLy" + (this._sModalCSSClass ? " " + this._sModalCSSClass : "") + ' sapUiBLyBar';
				var $BlockBarRef = jQuery("<div id=\"sap-ui-blocklayer-popup-bar\" tabindex=\"0\" class=\"" + className + "\" style=\"display:block; z-index:" +  $BlockRef.css('z-index') +"; visibility:visible\"></div>");
				$BlockBarRef.appendTo(sap.ui.getCore().getStaticAreaRef());
			} else {
				var $BlockBarRef = $BlockRef.next('div');
				$BlockBarRef.css({"z-index" : $BlockRef.css('z-index'),
								"visibility": "visible",
								"display" : "block"});
			}
		}//Without timeout the animation is not visible from the second time.
		setTimeout(function() {
			$BlockRef.toggleClass('sapUiBLyShow', true);
		}, 0);
	};
	this.oPopup._hideBlockLayer = function(){
		var $BlockRef = jQuery("#sap-ui-blocklayer-popup");
		var $BlockBarRef = $BlockRef.next('div');
		$BlockRef.toggleClass('sapUiBLyShow', false);
		$BlockRef.one("webkitTransitionEnd", function(){
			$BlockBarRef.css({'visibility': '', 'display': 'none'});
			sap.ui.core.Popup.prototype._hideBlockLayer.call(this);
		});	
	};
};

sap.m.BusyDialog.prototype.openAnimation = function($Ref, iRealDuration, fnOpened) {
	if(jQuery.os.ios) {
		$Ref.css('display', 'block');
		$Ref.one("webkitAnimationEnd", function(){
			fnOpened();
		});
		$Ref.css('-webkit-animation-name', 'sapMBusyBounce');
	} else {
		fnOpened();
	}
};

sap.m.BusyDialog.prototype.closeAnimation = function($Ref, iRealDuration, fnClose) {
	fnClose();
};

/**
 * Destroys the dialog control
 * @private
 */
sap.m.BusyDialog.prototype.exit = function(){
	this.oPopup.close();
	this.oPopup.destroy();
	this.oPopup = null;
	
	if(this._oLabel){
		this._oLabel.destroy();
		this._oLabel = null;
	}
	if(this._oButton){
		this._oButton.destroy();
		this._oButton = null;
	}
	if(this._busyIndicator){
		this._busyIndicator.destroy();
		this._busyIndicator = null;
	}
	this._$window.unbind("resize", this._fOrientationChange);
};

/**
 * Opens the dialog
 *
 * @public
 *
 */
sap.m.BusyDialog.prototype.open = function(){
	jQuery.sap.log.debug("sap.m.BusyDialog.open called at " + new Date().getTime());
	
	var oPopup = this.oPopup;
	if (oPopup.isOpen()){
		return this;
	}
	// Open popup
	oPopup.setContent(this);
	oPopup.attachEvent(sap.ui.core.Popup.M_EVENTS.opened, this._handleOpened, this);
	oPopup.setPosition("center center", "center center", document, "0 0", "fit");

	this._bOpenRequested = true;
	this._openNowIfPossibleAndRequested();

	return this;
};


sap.m.BusyDialog.prototype._openNowIfPossibleAndRequested = function(){
	if (!this._bOpenRequested) {
		return;
	}
	
	// If body/Core are not available yet, give them some more time and open later if still required
	if (!document.body || !sap.ui.getCore().isInitialized()) {
		jQuery.sap.delayedCall(50, this, "_openNowIfPossibleAndRequested");
		return;
	}
	
	this._bOpenRequested = false; // opening request is handled
	this.oPopup.open();
};

/**
 * Closes the dialog
 *
 * @public
 *
 */
sap.m.BusyDialog.prototype.close = function(){
	this._bOpenRequested = false;
	var oPopup = this.oPopup;

	var eOpenState = this.oPopup.getOpenState();
	if(!(eOpenState === sap.ui.core.OpenState.CLOSED || eOpenState === sap.ui.core.OpenState.CLOSING)){
		oPopup.attachEvent(sap.ui.core.Popup.M_EVENTS.closed, this._handleClosed, this);
		jQuery.sap.log.debug("sap.m.BusyDialog.close called at " + new Date().getTime());
		oPopup.close();
		this.fireClose();
	}
	return this;
};

sap.m.BusyDialog.prototype._reposition = function() {
	var ePopupState = this.oPopup.getOpenState();
	if(!(ePopupState === sap.ui.core.OpenState.OPEN)){
		return;
	}
	this.oPopup._applyPosition(this.oPopup._oLastPosition);
};

sap.m.BusyDialog.prototype._handleOpened = function(){
	this.oPopup.detachEvent(sap.ui.core.Popup.M_EVENTS.opened, this._handleOpened, this);
	// bind to window resize
	// In android, the orientationchange fires before the size of the window changes
	//  that's why the resize event is used here.
	this._$window.bind("resize", this._fOrientationChange);
};

sap.m.BusyDialog.prototype._handleClosed = function(){
	this.oPopup.detachEvent(sap.ui.core.Popup.M_EVENTS.closed, this._handleClosed, this);
	this._$window.unbind("resize", this._fOrientationChange);
};

sap.m.BusyDialog.prototype._setDimensions = function() {
	// Derive width and height from viewport
	var iWindowHeight = this._$window.height(),
	$this = this.$();
	//reset
	$this.css({
		"left": "0px",
		"top": "0px",
		"max-height": iWindowHeight + "px"
	});
};