/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides helper class sap.ui.core.Popup
jQuery.sap.declare("sap.ui.core.Popup");
jQuery.sap.require("jquery.sap.script");
jQuery.sap.require("sap.ui.core.UIArea");
jQuery.sap.require("sap.ui.base.Object");
jQuery.sap.require("sap.ui.base.EventProvider");
jQuery.sap.require("sap.ui.core.Control");
jQuery.sap.require("sap.ui.core.RenderManager");

/**
 * Creates an instance of <code>sap.ui.core.Popup</code> that can be used to open controls as a Popup,
 * visually appearing in front of other controls.
 *
 * @class Popup Class is a helper class for controls that want themselves or
 * parts of themselves or even other aggregated or composed controls
 * or plain HTML content to popup on the screen like menues, dialogs, drop down boxes.
 *
 * It allows the controls to be aligned to other dom elements
 * using the {@link sap.ui.core.Popup#dock} method. With it you can define where
 * the popup should be docked. One can dock the popup to the top bottom left or right side
 * of a dom ref.
 *
 * In the case that the popup has no space to show itself in the view port
 * of the current window it tries to open itself to
 * the inverted direction.
 *
 * @param {sap.ui.core.Control | sap.ui.core.Element | DOMNode} oContent the content to render in the popup. In case of sap.ui.core.Element or DOMNode, the content must be present in the page (i.e. rendered). In case of sap.ui.core.Control, the Popup ensures rendering before opening.
 * @param {boolean} [bModal=false] whether the popup should be opened in a modal way (i.e. with blocking background). Setting this to "true" effectively blocks all attempts to focus content outside the modal popup. A modal popup also automatically sets the focus back to whatever was focused when the popup opened.
 * @param {boolean} [bShadow=true] whether the popup should be have a visual shadow underneath (shadow appearance depends on active theme and browser support)
 * @param {boolean} [bAutoClose=false] whether the popup should automatically close when the focus moves out of the popup
 *
 * @constructor
 * @public
 */
sap.ui.core.Popup = function (oContent, bModal, bShadow, bAutoClose) {
	jQuery.sap.assert(arguments.length == 0 || (oContent && typeof oContent === "object"), "oContent must be an object or there may be no arguments at all");
	jQuery.sap.assert((bModal === undefined || bModal === true || bModal === false), "bModal must be true, false, or undefined");
	jQuery.sap.assert((bShadow === undefined || bShadow === true || bShadow === false), "bShadow must be true, false, or undefined");
	jQuery.sap.assert((bAutoClose === undefined || bAutoClose === true || bAutoClose === false), "bAutoClose must be true, false, or undefined");

	sap.ui.base.EventProvider.apply(this);
	
	this._id = jQuery.sap.uid(); // internal ID to make event handlers unique

	this.bOpen = false; // true exactly if the Popup is opening, open, or closing
	this.eOpenState = sap.ui.core.OpenState.CLOSED;
	if (oContent) {
		this.setContent(oContent);
	}

	this._oPosition = {my: sap.ui.core.Popup.Dock.CenterCenter, at: sap.ui.core.Popup.Dock.CenterCenter, of:document, offset:"0 0", collision:"flip"};
	this._bModal = !!bModal;
	this._oPreviousFocus = null;
	this._sInitialFocusId = null;
	this._bShadow = typeof(bShadow) === "boolean" ? bShadow : true;
	this._bAutoClose = !!bAutoClose;
	this._aAutoCloseAreas;
	this._animations = {open: null, close: null};
	this._durations = {open: "fast", close: "fast"};
	this._iZIndex = -1;
	this._oBlindLayer = null;
	
	//autoclose handler for mobile or desktop browser in touch mode
	//this function needs to be put onto the instance other than the prototype because functions on the prototype are treated as same function and can't be bound twice.
	if(this.touchEnabled){
		this._fAutoCloseHandler = function(oEvent){
			var oDomNode = oEvent.target,
				oPopupDomNode = this._$().get(0),
				oParentDomNode = this._oLastPosition.of === document ? null : this._oLastPosition.of,
				bInsidePopup = jQuery.contains(oPopupDomNode, oDomNode),
				bInsideParent = oParentDomNode ? jQuery.contains(oParentDomNode, oDomNode) : false,
				bInsideAutoCloseAreas = false;
				
			if(this._aAutoCloseAreas){
				for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
					if(jQuery.contains(this._aAutoCloseAreas[i], oDomNode)){
						bInsideAutoCloseAreas = true;
						break;
					}
				}
			}
				
			if(!(bInsidePopup || bInsideParent || bInsideAutoCloseAreas)){
				this.close();
			}
		};
	}
};

sap.ui.core.Popup._activateBlindLayer = true;

// stack used for storing z-indices for blocklayer
sap.ui.core.Popup.blStack = [];

// this should be capable of raising event etc and thus uses EventProvider
sap.ui.core.Popup.prototype = jQuery.sap.newObject(sap.ui.base.EventProvider.prototype);

sap.ui.base.Object.defineClass("sap.ui.core.Popup", {
		// ---- object ----
		baseType : "sap.ui.base.EventProvider",
		publicMethods : ["open", "close", "setContent", "getContent", "setPosition", "setShadow", "setModal", "setAutoClose", "isOpen", "getOpenState", "setAnimations", "setDurations", "attachOpened", "attachClosed", "detachOpened", "detachClosed"]
	});

sap.ui.core.Popup.M_EVENTS = {opened:'opened',closed:'closed'};

/**
 * Enumeration providing options for docking of some element to another.
 * "Right" and "Left" will stay the same in RTL mode, but "Begin" and "End" will flip to the other side ("Begin" is "Right" in RTL).
 *
 * @static
 * @namespace
 * @public
 */
sap.ui.core.Popup.Dock = {
		/**
		 * @public
		 */
		BeginTop      : "begin top",
		/**
		 * @public
		 */
		BeginCenter   : "begin center",
		/**
		 * @public
		 */
		BeginBottom   : "begin bottom",
		/**
		 * @public
		 */
		LeftTop      : "left top",
		/**
		 * @public
		 */
		LeftCenter   : "left center",
		/**
		 * @public
		 */
		LeftBottom   : "left bottom",
		/**
		 * @public
		 */
		CenterTop    : "center top",
		/**
		 * @public
		 */
		CenterCenter : "center center",
		/**
		 * @public
		 */
		CenterBottom : "center bottom",
		/**
		 * @public
		 */
		RightTop     : "right top",
		/**
		 * @public
		 */
		RightCenter  : "right center",
		/**
		 * @public
		 */
		RightBottom  : "right bottom",
		/**
		 * @public
		 */
		EndTop     : "end top",
		/**
		 * @public
		 */
		EndCenter  : "end center",
		/**
		 * @public
		 */
		EndBottom  : "end bottom"
};

/**
 * This property changes how the autoClose behaves on the Popup. When it's set to true, the Popup will be closed when tap outside of the Popup. Otherwise it will close as soon as the focus leaves the Popup.
 * 
 * The default value of this property is true when running in touchable environments.
 * 
 * @static
 * @type {boolean}
 * @private
 */
sap.ui.core.Popup.prototype.touchEnabled = (jQuery.sap.touchEventMode !== "OFF");

/**
 * This property changes how focus handling works. When it's set to true, focus will be restored after Popup is closed to the previous focused element before Popup is open. Otherwise, this function is disabled.
 * 
 * By default, the focus is restored only in non-touch environments.
 * 
 * @static
 * @type {boolean}
 * @private
 */
sap.ui.core.Popup.prototype.restoreFocus = (jQuery.sap.touchEventMode === "OFF");

/**
 * This property also changes how focus handling works. When it's set to true, focus will be done to the first focusable element in the Popup after Popup is open. Otherwise, this function is disabled.
 * 
 * By default, focusing on the first focusable elements in popup content is only enabled in non-touch environments.
 * 
 * @static
 * @type {boolean}
 * @private
 */
sap.ui.core.Popup.prototype.focusOnPopup = (jQuery.sap.touchEventMode === "OFF");

//****************************************************
// Event handlers
//****************************************************

/**
 * Attach event-handler <code>fnFunction</code> to the 'opened' event of this <code>sap.ui.core.Popup</code>.<br/>
 *
 * Event is fired when the popup has completely opened (after any animation).
 *
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present)
 * @param {object}
 *            [oListener] object on which to call the given function.
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.attachOpened = function(fnFunction, oListener) {
	this.attachEvent("opened", fnFunction, oListener);
	return this;
};

/**
 * Attach event-handler <code>fnFunction</code> to the 'closed' event of this <code>sap.ui.core.Popup</code>.<br/>
 *
 * Event is fired when the popup has completely closed (after any animation).
 *
 *
 * @param {function}
 *            fnFunction The function to call when the popup has completely closed (after any animation).
 * @param {object}
 *            [oListener] object on which to call the given function.
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.attachClosed = function(fnFunction, oListener) {
	this.attachEvent("closed", fnFunction, oListener);
	return this;
};

/**
 * Detach event handler <code>fnFunction</code> from the 'opened' event of this <code>sap.ui.core.Popup</code>.<br/>
 *
 * @param {function}
 *            fnFunction The function to call when the popup has completely opened (after any animation).
 * @param {object}
 *            oListener (optional) The object, that wants to be notified, when the event occurs
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.detachOpened = function(fnFunction, oListener) {
	this.detachEvent("opened", fnFunction, oListener);
	return this;
};

/**
 * Detach event handler <code>fnFunction</code> from the 'closed' event of this <code>sap.ui.core.Popup</code>.<br/>
 *
 * @param {function}
 *            fnFunction The function to call when the popup has completely closed (after any animation).
 * @param {object}
 *            oListener (optional) The object, that wants to be notified, when the event occurs
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.detachClosed = function(fnFunction, oListener) {
	this.detachEvent("closed", fnFunction, oListener);
	return this;
};


//****************************************************
// BlindLayer et al
//****************************************************
/**
 * @class
 * @private
 */
sap.ui.core.Popup.BlindLayer = function() {
	this._$Ref = jQuery("<div class=\"sapUiBliLy\" id=\"sap-ui-blindlayer-" + jQuery.sap.uid() + "\"><iframe scrolling=\"no\" src=\"javascript:''\"	tabIndex=\"-1\"></iframe></div>");
	this._$Ref.appendTo(sap.ui.getCore().getStaticAreaRef());
};
sap.ui.core.Popup.BlindLayer.prototype = jQuery.sap.newObject(sap.ui.base.Object.prototype);
/**
 *
 * @param oRef
 * @param iZIndex
 * @private
 */
sap.ui.core.Popup.BlindLayer.prototype.init = function(/** jQuery */oRef, iZIndex) {
	this._$Ref
		.css("visibility", "visible")
		.css("z-index", iZIndex);
	this.update(oRef, iZIndex);
	this._$Ref.insertAfter(oRef).show();
};
/**
 * @protected
 */
sap.ui.core.Popup.BlindLayer.prototype.update = function(/** jQuery */oRef, iZIndex){
	var oRect = oRef.rect();
	this._$Ref
		.css("left", oRect.left)
		.css("top", oRect.top);
	
	if(oRef.css("right") != "auto" && oRef.css("right") != "inherit"){
		this._$Ref
			.css("right", oRef.css("right"))
			.css("width", "auto");
	}else{
		this._$Ref
			.css("width", oRect.width)
			.css("right", "auto");
	}
	if(oRef.css("bottom") != "auto" && oRef.css("bottom") != "inherit"){
		this._$Ref
			.css("bottom", oRef.css("bottom"))
			.css("height", "auto");
	}else{
		this._$Ref
			.css("height", oRect.height)
			.css("bottom", "auto");
	}

	if(typeof(iZIndex) === "number") {
		this._$Ref.css("z-index", iZIndex);
	}
};
sap.ui.core.Popup.BlindLayer.prototype.reset = function(){
	this._$Ref
		.hide()
		.css("visibility", "hidden")
		.appendTo(sap.ui.getCore().getStaticAreaRef());
};
/**
 * Facility for reuse of created iframes.
 * @type sap.ui.base.ObjectPool
 * @private
 */
sap.ui.core.Popup.prototype.oBlindLayerPool = new sap.ui.base.ObjectPool(sap.ui.core.Popup.BlindLayer);

// End of BlindLayer


// Begin of Popup-Stacking facilities
(function() {
	var iLastZIndex = 0;

	/**
	 * Returns the last z-index that has been handed out. does not increase the internal z-index counter.
	 *
	 * @returns {Number}
	 * @public
	 */
	sap.ui.core.Popup.getLastZIndex = function(){
		return iLastZIndex;
	};

	/**
	 * Returns the last z-index that has been handed out. does not increase the internal z-index counter.
	 *
	 * @returns {Number}
	 * @public
	 */
	sap.ui.core.Popup.prototype.getLastZIndex = function(){
		return sap.ui.core.Popup.getLastZIndex();
	};

	/**
	 * Returns the next available z-index on top of the existing/previous popups. Each call increases the internal z-index counter and the returned z-index.
	 *
	 * @returns {Number} the next z-index on top of the Popup stack
	 * @public
	 */
	sap.ui.core.Popup.getNextZIndex = function(){
		return (iLastZIndex += 10);
	};

	/**
	 * Returns the next available z-index on top of the existing/previous popups. Each call increases the internal z-index counter and the returned z-index.
	 *
	 * @returns {Number} the next z-index on top of the Popup stack
	 * @public
	 */
	sap.ui.core.Popup.prototype.getNextZIndex = function(){
		return sap.ui.core.Popup.getNextZIndex();
	};
}());
// End of Popup-Stacking facilites



/**
 * Opens the popup's content at the position either specified here or beforehand via {@link #setPosition}.
 * Content must be capable of being positioned via "position:absolute;"
 * All parameters are optional (open() may be called without any parameters). iDuration may just be omitted, but if any of "at", "of", "offset", "collision" is given, also the preceding positioning parameters ("my", at",...) must be given.
 *
 * If the Popup's OpenState is different from "CLOSED" (i.e. if the Popup is already open, opening or closing), the call is ignored.
 *
 * @param {int} [iDuration] animation duration in milliseconds; default is the jQuery preset "fast". For iDuration == 0 the opening happens synchronously without animation.
 * @param {sap.ui.core.Popup.Dock} [my=sap.ui.core.Popup.Dock.CenterCenter] the popup content's reference position for docking
 * @param {sap.ui.core.Popup.Dock} [at=sap.ui.core.Popup.Dock.CenterCenter] the "of" element's reference point for docking to
 * @param {DOMNode|sap.ui.core.Element} [of=document] the DOM element or control to dock to
 * @param {string} [offset="0 0"] the offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "0 10" to move the popup 10 pixels to the right). If the docking of both "my" and "at" are both RTL-sensitive ("begin" or "end"), this offset is automatically mirrored in the RTL case as well.
 * @param {string} [collision="flip"] defines how the position of an element should be adjusted in case it overflows the window in some direction.
 * @public
 */
sap.ui.core.Popup.prototype.open = function(iDuration, my, at, of, offset, collision) {
	jQuery.sap.assert(this.oContent, "Popup content must have been set by now");
	// other asserts follow after parameter shifting

	if(this.eOpenState != sap.ui.core.OpenState.CLOSED) {
		return;
	}

	this.eOpenState = sap.ui.core.OpenState.OPENING;

	// If the content is a control and has no parent, add it to the static UIArea.
	// This makes automatic rerendering after invalidation work.
	// When the popup closes, the content is removed again from the static UIArea.
	this._bContentAddedToStatic = false;
	if ( this.oContent instanceof sap.ui.core.Control && !this.oContent.getParent() ) {
		var oStatic = sap.ui.getCore().getStaticAreaRef();
		oStatic = sap.ui.getCore().getUIArea(oStatic);
		oStatic.addContent(this.oContent, true);
		this._bContentAddedToStatic = true;
	}

	// iDuration is optional... if not given:
	if (typeof(iDuration) == "string") {
		collision = offset;
		offset = of;
		of = at;
		at = my;
		my = iDuration;
		iDuration = -1;
	}

	// if no arguments are passed iDuration has to be set to -1
	if (iDuration === undefined) {
		iDuration = -1;
	}

	// all other parameters must be given if any subsequent parameter is given, hence no more shifting
	// now every parameter should be in the right variable

	jQuery.sap.assert(iDuration === -1 || (typeof iDuration === "number" && iDuration % 1 == 0), "iDuration must be an integer (or omitted)"); // omitted results in -1
	jQuery.sap.assert(my === undefined || typeof my === "string", "my must be a string or empty");
	jQuery.sap.assert(at === undefined || typeof at === "string", "at must be a string or empty");
	jQuery.sap.assert(!of || typeof of === "object" || typeof of === "function", "of must be empty or an object");
	jQuery.sap.assert(!offset || typeof offset === "string", "offset must be empty or a string");
	jQuery.sap.assert(!collision || typeof collision === "string", "collision must be empty or a string");

	// disable for mobile or desktop browser in touch mode
	if(this.restoreFocus){
		// save current focused element to restore the focus after closing
		this._oPreviousFocus = sap.ui.core.Popup.getCurrentFocusInfo();
	}

	var $Ref = this._$(true);
	var iRealDuration = "fast";
	if((iDuration === 0) || (iDuration > 0)) {
		iRealDuration = iDuration;
	} else if ((this._durations.open === 0) || (this._durations.open > 0)) {
		iRealDuration = this._durations.open;
	}

	// Ensure right position is used for this call
	var _oPosition = {
			"my": my || this._oPosition.my,
			"at": at || this._oPosition.at,
			"of": of || this._oPosition.of || document,
			"offset": offset || this._oPosition.offset,
			"collision": collision || this._oPosition.collision
		};
	this._iZIndex = this._iZIndex === this.getLastZIndex() ? this._iZIndex : this.getNextZIndex();

	var oStaticArea = sap.ui.getCore().getStaticAreaRef();
	$Ref.css("position", "absolute").css("visibility", "hidden");
	if(!($Ref[0].parentNode == oStaticArea)) { // do not move in DOM if not required - otherwise this destroys e.g. the RichTextEditor
		$Ref.appendTo(oStaticArea);
	}
	$Ref.css("z-index", this._iZIndex);

	jQuery.sap.log.debug("position popup content " + $Ref.attr("id") + " at " + (window.JSON ? JSON.stringify(_oPosition.at) : String(_oPosition.at)));
	this._applyPosition(_oPosition);

	var that = this;
	var fnOpened = function() {
		$Ref.css("display","block");
		
		//disabled for mobile or desktop browser in touch mode
		if(that.focusOnPopup){
			// in modal and auto-close case the focus needs to be in the popup; provide this generic implementation as helper, but users can change the focus in the "opened" event handler
			if (that._bModal || that._bAutoClose || that._sInitialFocusId) {
				var domRefToFocus = null;
				if (that._sInitialFocusId) {
					var control = sap.ui.getCore().byId(that._sInitialFocusId);
					if (control) {
						domRefToFocus = control.getFocusDomRef();
					}
					domRefToFocus = domRefToFocus || jQuery.sap.domById(that._sInitialFocusId);
				}

				jQuery.sap.focus(domRefToFocus || $Ref.firstFocusableDomRef());
			}
		}

		that.eOpenState = sap.ui.core.OpenState.OPEN;

		// notify that opening has completed
		if (jQuery.browser.msie && jQuery.browser.version == '9.0') {
			jQuery.sap.delayedCall(0,that,function(){
				that.fireEvent(sap.ui.core.Popup.M_EVENTS.opened);
			});
		} else {
			that.fireEvent(sap.ui.core.Popup.M_EVENTS.opened);
		}

	};

	// and show the popup content
	$Ref.toggleClass("sapUiShd", this._bShadow).hide().css("visibility", "visible");
	if (iRealDuration == 0) { // do not animate if there is a duration == 0
		fnOpened.apply(); // otherwise call after-opening functions directly
	} else {
		if (this._animations.open) { // if custom animation is defined, call it
			this._animations.open.call(null, $Ref, iRealDuration, fnOpened);
		} else { // otherwise play the default animation
			$Ref.fadeIn(iRealDuration, fnOpened);
		}
	}

	// get (and 'show' i.e. activate) the BlindLayer
	if(jQuery.browser.msie && sap.ui.core.Popup._activateBlindLayer) {
		this._oBlindLayer = this.oBlindLayerPool.borrowObject($Ref, this._iZIndex - 1);
	} // -1 = BlindLayer, -2 = BlockLayer

	if(this._bModal) {
		this._showBlockLayer();
	}

	// add Delegate to hosted content for handling of events (e.g. onfocusin)
	if(this.oContent instanceof sap.ui.core.Element) {
		this.oContent.addDelegate(this);
	}

	this.bOpen = true;
	
	//disabled for mobile or desktop browser in touch mode
	if(!this.touchEnabled){
		if (this._bModal || this._bAutoClose) { // initialize focus handling
			this.fEventHandler = jQuery.proxy(this.onFocusEvent, this);
			// make sure to notice all blur's in the popup
			var jPopupRoot = $Ref;//this._$();
			if(document.addEventListener) { //FF, Safari
				document.addEventListener("focus", this.fEventHandler, true);
				jPopupRoot.get(0).addEventListener("blur", this.fEventHandler, true);
				if (this._aAutoCloseAreas) {
					for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
						this._aAutoCloseAreas[i].addEventListener("blur", this.fEventHandler, true);
					}
				}
			} else { // IE8
				jQuery(document).bind("activate." + this._id, this.fEventHandler);
				jPopupRoot.bind("deactivate." + this._id, this.fEventHandler);
				if (this._aAutoCloseAreas) {
					for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
						jQuery(this._aAutoCloseAreas[i]).bind("deactivate." + this._id, this.fEventHandler);
					}
				}
			}
		}
	}
	//autoclose implementation for mobile or desktop browser in touch mode
	else{
		if(!this._bModal && this._bAutoClose){
			jQuery(document).bind("vmousedown", jQuery.proxy(this._fAutoCloseHandler, this));
		}
	}
	
	//  register resize handler for blindlayer resizing
	if(this._oBlindLayer) {
		this._resizeListenerId = sap.ui.core.ResizeHandler.register(this._$().get(0), jQuery.proxy(this.onresize, this));
	}
};



/**
 * Handles the focus/blur events.
 *
 * @param oBrowserEvent the browser event
 * @private
 */
sap.ui.core.Popup.prototype.onFocusEvent = function(oBrowserEvent) {
	var oEvent = jQuery.event.fix(oBrowserEvent);
	var type = (oEvent.type == "focus" || oEvent.type == "activate") ? "focus" : "blur";

	if (type=="focus") {
		var oDomRef = this._$().get(0);
		if (oDomRef) {
			var contains = (oDomRef == oEvent.target) || (jQuery.contains(oDomRef, oEvent.target));

			// if focus does not go into the popup, check any other areas belonging to it
			if (!contains && this._aAutoCloseAreas) {
				for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
					contains = (this._aAutoCloseAreas[i] == oEvent.target) || (jQuery.contains(this._aAutoCloseAreas[i], oEvent.target));
					if (contains) {
						break;
					}
				}
			}
			jQuery.sap.log.debug("focus event on " + oEvent.target.id + ", contains: " + contains);

			if (this._bModal && !contains) { // case: modal popup and focus has gone somewhere else in the document
				// The popup is modal, but the focus has moved to a part of the document that is NOT inside the popup
				// check whether this modal popup is the topmost one
				var bTopMost = (sap.ui.core.Popup.getLastZIndex() == this._iZIndex);
				if (bTopMost) {
					// set the focus back to the last focused element inside the popup or at least to the popup root
					var oDomRefToFocus = this.oLastBlurredElement ? this.oLastBlurredElement : oDomRef;
					jQuery.sap.focus(oDomRefToFocus);
				}
			} else if (this._bAutoClose && contains && this._sTimeoutId) { // case: autoclose popup and focus has returned into the popup immediately
				// focus has returned, so it did only move inside the popup => clear timeout
				jQuery.sap.clearDelayedCall(this._sTimeoutId);
				this._sTimeoutId = null;
			}
		}

	} else if (type=="blur") { // an element inside the popup is loosing focus - remember in case we need to re-set
		jQuery.sap.log.debug("blur event on " + oEvent.target.id);
		if (this._bModal) {
			this.oLastBlurredElement = oEvent.target;
		} else if (this._bAutoClose) {
			// create timeout for closing the popup if there is no focus immediately returning to the popup
			if (!this._sTimeoutId) {
				this._sTimeoutId = jQuery.sap.delayedCall(0, this, "close"); // TODO: do we need a "onBeforeClose" event?
			}
		}
	}
};


/**
 * Sets the ID of the element that should be focused once the popup opens.
 * If the given ID is the ID of an existing Control, this Control's focusDomRef will be focused instead, which may be an HTML element with a different ID (usually a sub-element inside the Control).
 * If no existing element ID is supplied and the Popup is modal or auto-close, the Popup will instead focus the first focusable element.
 *
 * @param sId the ID of the DOM element to focus
 * @public
 */
sap.ui.core.Popup.prototype.setInitialFocusId = function(sId) {
	jQuery.sap.assert(!sId || typeof sId === "string", "sId must be a string or empty");
	this._sInitialFocusId = sId;
};


/**
 * Closes the popup.
 *
 * If the Popup is already closed or in the process of closing, calling this method does nothing.
 * If the Popup is in the process of being opened and closed with a duration of 0, calling this method does nothing.
 * If the Popup is in the process of being opened and closed with an animation duration, the animation will be chained, but this functionality is dangerous,
 * may lead to inconsistent behavior and is thus not recommended and may even be removed.
 *
 * @param {int} [iDuration] animation duration in milliseconds; default is the jQuery preset "fast".  For iDuration == 0 the closing happens synchronously without animation.
 * @public
 */
sap.ui.core.Popup.prototype.close = function(iDuration) {
	jQuery.sap.assert(iDuration === undefined || (typeof iDuration === "number" && (iDuration % 1 == 0)), "iDuration must be empty or an integer");

	if(this.eOpenState == sap.ui.core.OpenState.CLOSED || this.eOpenState == sap.ui.core.OpenState.CLOSING) {
		return;
	} // also close when OPENING
	// the above will queue the animations (close only after opening), but may lead to the CLOSED event happening before the OPENED event

	var iRealDuration = "fast";
	if((iDuration === 0) || (iDuration > 0)) {
		iRealDuration = iDuration;
	} else if ((this._durations.close === 0) || (this._durations.close > 0)) {
		iRealDuration = this._durations.close;
	}

	if (iRealDuration === 0 && this.eOpenState == sap.ui.core.OpenState.OPENING) {
		return;
	} // do not allowed immediate closing while opening


	//if(this.eOpenState != sap.ui.core.OpenState.OPEN) return; // this is the more conservative approach: to only close when the Popup is OPEN

	this.eOpenState = sap.ui.core.OpenState.CLOSING;

	// If we added the content control to the static UIArea,
	// then we should remove it again now.
	// Assumption: application did not move the content in the meantime!
	if ( this.oContent && this._bContentAddedToStatic ) {
		var oStatic = sap.ui.getCore().getStaticAreaRef();
		oStatic = sap.ui.getCore().getUIArea(oStatic);
		oStatic.removeContent(oStatic.indexOfContent(this.oContent), true);
	}
	this._bContentAddedToStatic = false;

	this._sTimeoutId = null;
	
	//disabled for mobile or desktop browser in touch mode
	if(!this.touchEnabled){
		if (this.fEventHandler) { // remove focus handling
			var jPopupRoot = this._$();
			if(document.removeEventListener) { //FF, Safari
				document.removeEventListener("focus", this.fEventHandler, true);
				jPopupRoot.get(0).removeEventListener("blur", this.fEventHandler, true);
				if (this._aAutoCloseAreas) {
					for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
						this._aAutoCloseAreas[i].removeEventListener("blur", this.fEventHandler, true);
					}
				}
			} else { // IE8
				jQuery(document).unbind("activate." + this._id, this.fEventHandler);
				jPopupRoot.unbind("deactivate." + this._id, this.fEventHandler);
				if (this._aAutoCloseAreas) {
					for (var i = 0; i < this._aAutoCloseAreas.length; i++) {
						jQuery(this._aAutoCloseAreas[i]).unbind("deactivate." + this._id, this.fEventHandler);
					}
				}
			}
			this.fEventHandler = null;
		}
	}
	//deregister the autoclose handler for mobile
	else{
		if(!this._bModal && this._bAutoClose){
			jQuery(document).unbind("vmousedown", this._fAutoCloseHandler);
		}
	}

	

	if(this.oContent instanceof sap.ui.core.Element) {
		this.oContent.removeDelegate(this);
	}

	var $Ref = this._$();
	// get (and 'hide' i.e. remove) the BlindLayer
	if(this._oBlindLayer) {
		this.oBlindLayerPool.returnObject(this._oBlindLayer);
	}
	this._oBlindLayer = null;

	var that = this;
	var fnClose = function() { // the function to call when the popup closing animation has completed
		jQuery($Ref).hide().
			css("visibility", "inherit").
			css("left", "0px").
			css("top", "0px").
			css("right", "");

		//disabled for mobile or desktop browser in touch mode
		if(that.restoreFocus){
			if (that._bModal){
				// try to set the focus back to whatever was focused before. Do this here because animation needs to be finished.
				//- TODO: currently focus is restored only for modal popups. Non modal popups have to do it themselves because the outside focus can change!
				sap.ui.core.Popup.applyFocusInfo(that._oPreviousFocus);
				that._oPreviousFocus = null;
				that.oLastBlurredElement = null;
			}
		}
		

		that.bOpen = false;
		that.eOpenState = sap.ui.core.OpenState.CLOSED;

		// notify users that the popup is now officially closed
		that.fireEvent(sap.ui.core.Popup.M_EVENTS.closed);
	};

	if (iRealDuration == 0) { // iRealDuration == 0 means: no animation!
		fnClose.apply();
	} else {
		if (this._animations.close) {
			this._animations.close.call(null, $Ref, iRealDuration, fnClose); // play custom animation, if supplied
		} else {
			$Ref.fadeOut(iRealDuration, fnClose); // otherwise use jQuery animation
		}
	}

	if(this._bModal) {
		this._hideBlockLayer();
	}

	//deregister resize handler
	if (this._resizeListenerId) {
		sap.ui.core.ResizeHandler.deregister(this._resizeListenerId);
		this._resizeListenerId = null;
	}
};



/**
 * Returns an object containing as much information about the current focus as possible, or null if no focus is present or no focus information can be gathered.
 */
sap.ui.core.Popup.getCurrentFocusInfo = function() {
	var _oPreviousFocus = null;
	var focusedControlId = sap.ui.getCore().getCurrentFocusedControlId();
	if(focusedControlId) {
		// a SAPUI5 control was focused before
		var oFocusedControl = sap.ui.getCore().getControl(focusedControlId);
		_oPreviousFocus = {'sFocusId':focusedControlId,'oFocusInfo': oFocusedControl ? oFocusedControl.getFocusInfo() : {}}; // add empty oFocusInfo to avoid the need for all recipients to check
	} else {
		try {
			// not a SAPUI5 control... but if something has focus, save as much information about it as available
			var oElement = document.activeElement;
			if (oElement) {
				_oPreviousFocus = {'sFocusId':oElement.id,'oFocusedElement':oElement,'oFocusInfo':{}}; // add empty oFocusInfo to avoid the need for all recipients to check
			}
		} catch (ex) {
			// IE9 throws an Unspecified Error when accessing document.activeElement inside a frame before body.onload
			// This is not an issue, as there is just no focus yet to restore
			// Other browsers do not fail here, but even if they would, the worst thing would be a non-restored focus
			_oPreviousFocus = null;
		}
	}
	return _oPreviousFocus;
};

/**
 *
 */
sap.ui.core.Popup.applyFocusInfo = function(oPreviousFocus) {
	if(oPreviousFocus) {
		var oFocusedControl = sap.ui.getCore().getControl(oPreviousFocus.sFocusId);
		if(oFocusedControl) {
			// if a SAPUI5 control had been focused, just re-focus it
			oFocusedControl.applyFocusInfo(oPreviousFocus.oFocusInfo);
		} else {
			// no SAPUI5 control... try to find the control by ID if an ID was there
			var oElement = jQuery.sap.domById(oPreviousFocus.sFocusId)
					|| oPreviousFocus.oFocusedElement; // if not even an ID was available when focus was lost maybe the original DOM element is still there
			jQuery.sap.focus(oElement); // also works for oElement == null
		}
	}
};



/**
 * Sets the content this instance of the Popup should render.
 * Content must be capable of being positioned via position:absolute;
 * @param {sap.ui.core.Control | DOMRef } oContent
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.setContent = function(oContent) {
	jQuery.sap.assert(typeof oContent === "object", "oContent must be an object");
	this.oContent = oContent;
	return this;
};


/**
 * Returns this Popup's content.
 * @return {sap.ui.core.Control | DOMRef } the content that has been set previously (if any)
 * @public
 */
sap.ui.core.Popup.prototype.getContent = function() {
	return this.oContent;
};

/**
 * Sets the position of the Popup (if you refer to a Control as anchor then do not
 * use the DOMRef of the control which might change after re-renderings).
 * Optional parameters can only be omitted when all subsequent parameters are omitted as well.
 *
 * @param {sap.ui.core.Popup.Dock} my specifies which point of the given Content should be aligned
 * @param {sap.ui.core.Popup.Dock | object {left: {sap.ui.core.CSSSize}, top: {sap.ui.core.CSSSize}}} at specifies the point of the reference element to which the given Content should be aligned
 * @param {string | sap.ui.core.Control | DOMRef | jQuery | jQuery.Event} [of=document] specifies the reference element to which the given content should be aligned as specified in the other parameters
 * @param {string} [offset="0 0"] the offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "0 10" to move the popup 10 pixels to the right). If the docking of both "my" and "at" are both RTL-sensitive ("begin" or "end"), this offset is automatically mirrored in the RTL case as well.
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.setPosition = function(my, at, of, offset, collision) { // TODO: document collision and implications on offset
	jQuery.sap.assert(typeof my === "string", "my must be a string");
	jQuery.sap.assert(typeof at === "string" || (typeof at === "object" && (typeof at.left === "number") && (typeof at.top === "number")), "my must be a string or an object with 'left' and 'top' properties");
	jQuery.sap.assert(!of || typeof of === "object" || typeof of === "function", "of must be empty or an object");
	jQuery.sap.assert(!offset || typeof offset === "string", "offset must be empty or a string");
	jQuery.sap.assert(!collision || typeof collision === "string", "collision must be empty or a string");

	// defaults are implemented in Popup.open()
	this._oPosition = jQuery.extend({},this._oPosition, {
			"my": my,
			"at": at,
			"of": of,
			"offset": offset,
			"collision": collision
		});

	if(this.eOpenState != sap.ui.core.OpenState.CLOSED) {
		this._applyPosition(this._oPosition);
		this._oBlindLayer && this._oBlindLayer.update(this._$());
	}

	return this;
};


/**
 * Applies the given position to the Popup which is assumed to be currently open
 *
 * @private
 */
sap.ui.core.Popup.prototype._applyPosition = function(oPosition) {
	var bRtl = sap.ui.getCore().getConfiguration().getRTL();
	var $Ref = this._$();
	var oAt = oPosition.at;
	if(typeof(oAt) === "string") {
		$Ref.css("display", "block").position(this._resolveReference(this._convertPositionRTL(oPosition, bRtl))); // must be visible, so browsers can calculate its offset!
		this._fixPositioning(oPosition, bRtl);
	} else if(sap.ui.core.CSSSize.isValid(oAt.left) && sap.ui.core.CSSSize.isValid(oAt.top)) {
		$Ref.css("left", oAt.left).css("top", oAt.top);
	} else if(sap.ui.core.CSSSize.isValid(oAt.right) && sap.ui.core.CSSSize.isValid(oAt.top)) {
		$Ref.css("right", oAt.right).css("top", oAt.top);
	} else if(typeof(oAt.left) === "number" && typeof(oAt.top) === "number") {
		var domRef = $Ref[0];
		if (domRef && domRef.style.right) { // in some RTL cases leave the Popup attached to the right side of the browser window
			var width = $Ref.outerWidth();
			$Ref.css("right", (document.documentElement.clientWidth - (oAt.left + width)) + "px").css("top", oAt.top + "px");
		} else {
			$Ref.css("left", oAt.left + "px").css("top", oAt.top + "px");
		}
	}

	// remember given position for later redraws
	this._oLastPosition = oPosition;
};

/**
 * Converts a position string with RTL-independent settings like "begin top" or "end center" into a string understood by
 * jQuery UI position() by replacing "begin" and "end" with the respective concrete value, depending on RTL settings.
 * The returned object is a clone, the original is unchanged.
 *
 * @private
 */
sap.ui.core.Popup.prototype._convertPositionRTL = function(oPosition, bRtl) {
	var fixedPos = jQuery.extend({}, oPosition); // don't modify the original object
	if (bRtl) {
		if (oPosition.offset
				&& ((oPosition.my.indexOf("begin") > -1) || (oPosition.my.indexOf("end") > -1))
				&& ((oPosition.at.indexOf("begin") > -1) || (oPosition.at.indexOf("end") > -1))) {
			fixedPos.offset = this._mirrorOffset(oPosition.offset);
		}
		fixedPos.my = oPosition.my.replace("begin", "right").replace("end", "left");
		fixedPos.at = oPosition.at.replace("begin", "right").replace("end", "left");
	} else {
		fixedPos.my = oPosition.my.replace("end", "right").replace("begin", "left");
		fixedPos.at = oPosition.at.replace("end", "right").replace("begin", "left");
	}
	return fixedPos;
};

/**
 * Mirrors the given offset which is a string containing two integer numbers separated by whitespace.
 * (=negates the first number)
 *
 * @param sOffset
 * @returns {String}
 *
 * @private
 */
sap.ui.core.Popup.prototype._mirrorOffset = function(sOffset) {
	var aOffset = jQuery.trim(sOffset).split(/\s/);
	var posX = parseInt(aOffset[0], 10);
	return (-posX) + " " + aOffset[aOffset.length-1]; // array could be longer than 2 with multiple whitespace characters
};

/**
 * Changes the default positioning of the Popup ("left: ...px") to ("right: ...px"), maintaining the
 * actual screen position, if the Popup should "grow to the left" when increasing in size.
 * This is the case if:
 * - LTR mode and horizontal alignment is right or end
 * - RTL mode and horizontal alignment is right, begin or center
 *
 * @private
 */
sap.ui.core.Popup.prototype._fixPositioning = function(sPosition, bRtl) {
	var my = sPosition.my;
	if (typeof(my) === "string") {
		if (bRtl && ((my.indexOf("right") > -1) || (my.indexOf("begin") > -1) || (my.indexOf("center") > -1))) {
			var $Ref = this._$();
			var right = jQuery(window).width() - $Ref.outerWidth() - $Ref.offset().left;
			$Ref.css("right", right + "px").css("left", "");
		} else if ((my.indexOf("right") > -1) || (my.indexOf("end") > -1)) {
			// LTR
			var $Ref = this._$();
			var right = jQuery(window).width() - $Ref.outerWidth() - $Ref.offset().left;
			$Ref.css("right", right + "px").css("left", "");
		}
	}
};

/**
 * If the reference element is specified as a sap.ui.core.Element, then it is resovled to a DOM node
 * @param oPosition
 * @returns
 */
sap.ui.core.Popup.prototype._resolveReference = function(oPosition) {
	var oResult = oPosition;
	if ( oPosition.of instanceof sap.ui.core.Element ) {
		oResult = jQuery.extend({}, oPosition, { of : oPosition.of.getDomRef()});
	}
	return oResult;
};

/**
 * Determines whether the Popup should have a shadow (in supporting browsers).
 * This also affects a currently open popup.
 *
 * @param bShowShadow
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.setShadow = function(bShowShadow) {
	jQuery.sap.assert(typeof bShowShadow === "boolean", "bShowShadow must be boolean");
	this._bShadow = bShowShadow;
	if(this.eOpenState != sap.ui.core.OpenState.CLOSED) {
		this._$().toggleClass("sapUiShd", bShowShadow);
	}
	return this;
};

/**
 * Used to specify whether the Popup should be modal. A modal popup will put some fading "block layer" over the background and
 * prevent attempts to put the focus outside/below the popup.
 * Setting this while the popup is open will change "block layer" immediately.
 *
 * @param {boolean} bModal whether the Popup is of modal type
 * @param {string} [sModalCSSClass] a CSS class (or space-separated list of classes) that should be added to the block layer
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.setModal = function(bModal, sModalCSSClass) {
	jQuery.sap.assert(typeof bModal === "boolean", "bModal must be boolean");
	jQuery.sap.assert(!sModalCSSClass || typeof sModalCSSClass === "string", "sModalCSSClass must be empty or a string");

	var bOldModal = this._bModal;
	
	this._bModal = bModal;
	this._sModalCSSClass = sModalCSSClass;
	
	//update the blocklayer and autoclose handler when the popup is open
	if(this.isOpen()){
		if(bOldModal !== bModal){
			if(bModal){
				this._showBlockLayer();
			}else{
				this._hideBlockLayer();
			}
			
			if(this.touchEnabled && this._bAutoClose){
				if(!bModal){
					//register the autoclose handler when modal is set to false
					jQuery(document).bind("vmousedown", jQuery.proxy(this._fAutoCloseHandler, this));
				}else{
					//deregister the autoclose handler when modal is set to true
					jQuery(document).unbind("vmousedown", this._fAutoCloseHandler);
				}
			}
		}
	}
	return this;
};

/**
 * Used to specify whether the Popup should close as soon as 
 * - for non-touch environment: the focus leaves
 * - for touch environment: user clicks the area which is outside the popup itself, the dom elemnt which popup aligns to (except document),
 *  and one of the autoCloseAreas set by calling setAutoCloseAreas.
 * @param {boolean} bAutoClose whether the Popup should close as soon as the focus leaves
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.setAutoClose = function(bAutoClose) {
	jQuery.sap.assert(typeof bAutoClose === "boolean", "bAutoClose must be boolean");
	
	if(this.touchEnabled && this.isOpen() && this._bAutoClose !== bAutoClose){
		if(!this._bModal){
			if(bAutoClose){
				//register the autoclose hanlder when autoclose is set to true
				jQuery(document).bind("vmousedown", jQuery.proxy(this._fAutoCloseHandler, this));
			}else{
				//deregister the autoclose handler when autoclose is set to false
				jQuery(document).unbind("vmousedown", this._fAutoCloseHandler);
			}
		}
	}
	
	this._bAutoClose = bAutoClose;
	return this;
};

/**
 * Sets the additional areas in the page that are considered part of the Popup when autoclose is enabled. 
 * - non-touch environment: if the focus leaves the Popup but immediately enters one of these areas, the Popup does NOT close.
 * - touch environment: if user clicks one of these areas, the Popup does NOT close.
 *
 * @param {DomRef[]} aAutoCloseAreas an array containing DOM elements considered part of the Popup; a value of null removes all previous areas
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.setAutoCloseAreas = function(aAutoCloseAreas) {
	jQuery.sap.assert(aAutoCloseAreas === null || jQuery.isArray(aAutoCloseAreas), "aAutoCloseAreas must be null or an array");
	this._aAutoCloseAreas = aAutoCloseAreas;
	return this;
};

/**
 * Sets the animation functions to use for opening and closing the Popup. Any null value will be ignored and not change the respective animation function.
 * When called, the animation functions receive three parameters:
 * - the jQuery object wrapping the DomRef of the popup
 * - the requested animation duration
 * - a function that MUST be called once the animation has completed
 *
 * @param {function} fnOpen
 * @param {function} fnClose
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.setAnimations = function(fnOpen, fnClose) {
	jQuery.sap.assert(fnOpen === null || typeof fnOpen === "function", "fnOpen must be a function");
	jQuery.sap.assert(fnClose === null || typeof fnClose === "function", "fnClose must be a function");

	if (fnOpen && (typeof(fnOpen) == "function")) {
		this._animations.open = fnOpen;
	}
	if (fnClose && (typeof(fnClose) == "function")) {
		this._animations.close = fnClose;
	}
	return this;
};

/**
 * Sets the durations for opening and closing animations.
 * Null values and values < 0 are ignored.
 * A duration of 0 means no animation.
 * Default value is "fast" which is the jQuery constant for "200 ms".
 *
 * @param {int} iOpenDuration in milliseconds
 * @param {int} iCloseDuration in milliseconds
 * @return {sap.ui.core.Popup} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.Popup.prototype.setDurations = function(iOpenDuration, iCloseDuration) {
	jQuery.sap.assert(iOpenDuration === null || (typeof iOpenDuration === "number" && (iOpenDuration % 1 == 0)), "iOpenDuration must be null or an integer");
	jQuery.sap.assert(!iCloseDuration || (typeof iCloseDuration === "number" && (iCloseDuration % 1 == 0)), "iOpenDuration must be undefined or an integer");

	if ((iOpenDuration > 0) || (iOpenDuration === 0)) {
		this._durations.open = iOpenDuration;
	}
	if ((iCloseDuration > 0) || (iCloseDuration === 0)) {
		this._durations.close = iCloseDuration;
	}
	return this;
};

/**
 * Returns whether the Popup is currently open (this includes opening and closing animations).
 *
 * @returns {Boolean} whether the Popup is opened (or currently being opened or closed)
 * @public
 */
sap.ui.core.Popup.prototype.isOpen = function() {
	return this.bOpen;
};

/**
 * Returns whether the Popup is currently open, closed, or transitioning between these states.
 *
 * @returns {OpenState} whether the Popup is opened
 * @public
 */
sap.ui.core.Popup.prototype.getOpenState = function() {
	return this.eOpenState;
};

/**
 * Closes and destroys this instance of Popup.
 * Does not destroy the hosted content.
 * @public
 */
sap.ui.core.Popup.prototype.destroy = function() {
	// deregister resize handler
	if (this._resizeListenerId) {
		sap.ui.core.ResizeHandler.deregister(this._resizeListenerId);
		this._resizeListenerId = null;
	}
	this.close();
	this.oContent = null;
};

/**
 * Returns the jQuery object containing the root of the content of the Popup
 * @returns {jQuery} the jQuery object containing the root of the content of the Popup
 * @private
 */
sap.ui.core.Popup.prototype._$ = function(bForceReRender){
	if(this.oContent instanceof sap.ui.core.Control){
		var oContentRef = this.oContent.$();
		if (oContentRef.length === 0 || bForceReRender) {
			jQuery.sap.log.info("Rendering of popup content: " + this.oContent.getId());
			if (oContentRef.length > 0) {
				sap.ui.core.RenderManager.preserveContent(oContentRef[0], /* bPreserveRoot */ true, /* bPreserveNodesWithId */ false);
			}
			sap.ui.getCore().getRenderManager().render(this.oContent, sap.ui.getCore().getStaticAreaRef());
			oContentRef = this.oContent.$();
		}
		return oContentRef;
	} else if(this.oContent instanceof sap.ui.core.Element){
		return this.oContent.$();
	} else {
		return jQuery(this.oContent);
	}
};

/**
 *
 * @param iZIndex
 * @private
 */
sap.ui.core.Popup.prototype._showBlockLayer = function() {
	var $BlockRef = jQuery("#sap-ui-blocklayer-popup");
	if($BlockRef.length === 0){
		var className = "sapUiBLy" + (this._sModalCSSClass ? " " + this._sModalCSSClass : "");
		$BlockRef = jQuery("<div id=\"sap-ui-blocklayer-popup\" tabindex=\"0\" class=\"" + className + "\"></div>");
		$BlockRef.appendTo(sap.ui.getCore().getStaticAreaRef());
	}
	// push current z-index to stack
	sap.ui.core.Popup.blStack.push(this._iZIndex - 2);
	$BlockRef.css("z-index", this._iZIndex - 2).css("visibility","visible").show();
};

sap.ui.core.Popup.prototype._hideBlockLayer = function() {
	// a dialog was closed so pop his z-index from the stack
	sap.ui.core.Popup.blStack.pop();
	// if there are more z-indices this means there are more dialogs stacked up. So redisplay the blocklayer (with new z-index) under the new current dialog which should be displayed.
	if (sap.ui.core.Popup.blStack.length > 0){
		// set the blocklayer z-index to the last z-index in the stack and show it
		jQuery("#sap-ui-blocklayer-popup").css("z-index", sap.ui.core.Popup.blStack[sap.ui.core.Popup.blStack.length-1]).css("visibility","visible").show();
	}
	else{
		// the last dialog was closed so we can hide the block layer now
		jQuery("#sap-ui-blocklayer-popup").css("visibility","inherit").hide();
	}
};



//****************************************************
//Focus Handling Delegate function for use with the given content (of type sap.ui.core.Element)
//****************************************************

/**
 * Delegate function for handling of mousedown event on sap.ui.core.Elements as content
 * @private
 */
sap.ui.core.Popup.prototype.onmousedown = function(oEvent) {
	if(this._iZIndex === this.getLastZIndex()) {
		return;
	} // we are 'uppermost' and therefore everything is ok

	this._iZIndex = this.getNextZIndex();

	var $Ref = this._$();
	$Ref.css("z-index", this._iZIndex);

	if(this._oBlindLayer) {
		this._oBlindLayer.update($Ref, this._iZIndex -1);
	}
};


//****************************************************
//Rerendering Handling Delegate function for use with the given content (of type sap.ui.core.Element)
//****************************************************

/**
 * Delegate function for onAfterRendering.
 * Only active when Popup is opened.
 * @private
 */
sap.ui.core.Popup.prototype.onAfterRendering = function(oEvent){
	var $Ref = this.getContent().$();

	$Ref.toggleClass("sapUiShd", this._bShadow);
	var pos = $Ref.css("position");
	if (!pos || pos == "static") {
		$Ref.css("position", "absolute");
	} // only set 'position:absolute' if nobody else has set positioning yet

	// Ensure right position is used for this call
	var ref = $Ref[0];
	var left = ref.style.left;
	var right = ref.style.right;
	var top = ref.style.top;
	var bottom = ref.style.bottom;
	if (!(left && left != "auto" || right && right != "auto" || top && top != "auto" || bottom && bottom != "auto")) {
		jQuery.sap.log.debug("reposition popup content " + $Ref.attr("id") + " at " + (window.JSON ? JSON.stringify(this._oLastPosition.at) : String(this._oLastPosition.at)));
		this._applyPosition(this._oLastPosition);
	}
	$Ref.show()
		.css("visibility", "visible")
		.css("z-index", this._iZIndex);
	// register resize handler for blindlayer resizing
	if(this._oBlindLayer) {
		this._resizeListenerId = sap.ui.core.ResizeHandler.register(this._$().get(0), jQuery.proxy(this.onresize, this));
	}
};

/**
* Delegate function for onBeforeRendering.
* @private
*/
sap.ui.core.Popup.prototype.onBeforeRendering = function(oEvent){
	// deregister resize handler
	if (this._resizeListenerId) {
		sap.ui.core.ResizeHandler.deregister(this._resizeListenerId);
		this._resizeListenerId = null;
	}
};

/**
 * Resize handler listening to the popup. If the Popup changes its size the blindlayer
 * should be updated as well. For example necessary when popup content has absolute positions.
 *
 * @private
 */
sap.ui.core.Popup.prototype.onresize = function(oEvent) {
	if(this.eOpenState != sap.ui.core.OpenState.CLOSED) {
		this._oBlindLayer && this._oBlindLayer.update(this._$());
	}
};

