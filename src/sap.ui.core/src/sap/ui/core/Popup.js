/*!
 * ${copyright}
 */

 /* global Set, HTMLElement */

// Provides helper class sap.ui.core.Popup
sap.ui.define([
	'sap/ui/Device',
	'sap/ui/base/DataType',
	'sap/ui/base/Event',
	'sap/ui/base/ManagedObject',
	'sap/ui/base/Object',
	'sap/ui/base/ObjectPool',
	'./Control',
	'./Element',
	'./EventBus',
	'./FocusHandler',
	'./IntervalTrigger',
	'./RenderManager',
	'./ResizeHandler',
	'./library',
	'./StaticArea',
	"sap/base/assert",
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/util/Version",
	"sap/base/util/uid",
	"sap/base/util/extend",
	"sap/base/util/each",
	"sap/base/util/deepExtend",
	"sap/ui/events/F6Navigation",
	"sap/ui/base/EventProvider",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/jqueryui/jquery-ui-position",
	// jQuery Plugin "firstFocusableDomRef"
	"sap/ui/dom/jquery/Focusable",
	// jQuery Plugin "rect"
	"sap/ui/dom/jquery/rect"
], function(
	Device,
	DataType,
	Event,
	ManagedObject,
	BaseObject,
	ObjectPool,
	Control,
	Element,
	EventBus,
	FocusHandler,
	IntervalTrigger,
	RenderManager,
	ResizeHandler,
	library,
	StaticArea,
	assert,
	Log,
	Localization,
	Version,
	uid,
	extend,
	each,
	deepExtend,
	F6Navigation,
	EventProvider,
	jQuery
	//jquery-ui-position
	//control
	//Focusable
	//rect
) {
	"use strict";

	// shortcut for sap.ui.core.CSSSize
	var CSSSize = library.CSSSize;

	// shortcut for sap.ui.core.OpenState
	var OpenState = library.OpenState;

	// shortcut for sap.ui.core.Collision
	var Collision = library.Collision;

	var oStaticUIArea;

	var vGlobalWithinArea;

	var oResizeObserver;
	var sResizeHandlerIdAttribute = "sapUiPopupResize";

	var oEventBus = new EventBus();

	if (window.ResizeObserver) {
		oResizeObserver = new window.ResizeObserver(function(aEntries){
			adaptSizeAndPosition(jQuery("#sap-ui-blocklayer-popup"), aEntries[0].target);
		});
	} else {
		oResizeObserver = {
			observe: function(oElement) {
				var sHandlerId = oElement.dataset[sResizeHandlerIdAttribute];
				if (!sHandlerId) {
					sHandlerId = ResizeHandler.register(oElement, function(oEvent) {
						adaptSizeAndPosition(jQuery("#sap-ui-blocklayer-popup"), oEvent.target);
					});
					oElement.dataset[sResizeHandlerIdAttribute] = sHandlerId;
				}
			},
			unobserve: function(oElement) {
				var sHandlerId = oElement.dataset[sResizeHandlerIdAttribute];
				if (sHandlerId) {
					ResizeHandler.deregister(sHandlerId);
					delete oElement.dataset[sResizeHandlerIdAttribute];
				}
			}
		};
	}

	function getStaticUIArea() {
		if (oStaticUIArea) {
			return oStaticUIArea;
		}

		var oControl;
		try {
			// only a facade of the static UIArea is returned that contains only the public methods
			oStaticUIArea = StaticArea.getUIArea();
		} catch (e) {
			Log.error(e);
			throw new Error("Popup cannot be opened because static UIArea cannot be determined.");
		}

		oControl = new Control();
		oStaticUIArea.addDependent(oControl);
		// get the real instance (not facade) of the static UIArea
		oStaticUIArea = oControl.getUIArea();

		oControl.destroy();

		return oStaticUIArea;
	}

	/**
	 * Convert the different types of 'within' values to a DOM element or the window object.
	 *
	 * @param {string | sap.ui.core.Element | Element | Window} [vWithin] the given within
	 * @returns {Element | Window} the DOM element or Window object that represents the given within
	 * @private
	 */
	function convertWithin(vWithin) {
		var oWithin;

		if (typeof vWithin === "string") {
			oWithin = document.querySelector(vWithin);
		} else if (vWithin instanceof Element) {
			oWithin = vWithin.getDomRef();
		} else  {
			oWithin = vWithin;
		}

		return oWithin || window;
	}

	/**
	 * Remove the size and position CSS properties from the blocklayer DOM element
	 *
	 * @param {jQuery} $BlockRef the block layer jQuery object
	 * @private
	 */
	function clearSizeAndPosition($BlockRef) {
		// left and top are set by jQuery.position
		// width and height are set by function 'adaptSizeAndPosition'
		// All of them need to be removed for being prepared to show a full screen blocklayer
		var aProperties = ["left", "top", "width", "height"];

		if ($BlockRef[0]) {
			$BlockRef[0].classList.remove("sapUiBLyWithin");
			aProperties.forEach(function(sProperty) {
				$BlockRef[0].style.removeProperty(sProperty);
			});
		}
	}

	/**
	 * Change the size and position of the blocklayer to the same values as for the given 'within'.
	 *
	 * @param {jQuery} $BlockRef the jQuery object that contains the blocklayer DOM element
	 * @param {Element} oWithin the DOM element of the given within
	 * @private
	 */
	function adaptSizeAndPosition($BlockRef, oWithin) {
		var oClientRect = oWithin.getBoundingClientRect();

		$BlockRef
			.css({
				width: oClientRect.width,
				height: oClientRect.height
			})
			.addClass("sapUiBLyWithin")
			.position({
			my: "left top",
			at: "left top",
			of: oWithin
		});
	}

	/**
	 * Creates an instance of <code>sap.ui.core.Popup</code> that can be used to open controls as a Popup,
	 * visually appearing in front of other controls.
	 *
	 * @class Popup Class is a helper class for controls that want themselves or
	 * parts of themselves or even other aggregated or composed controls
	 * or plain HTML content to popup on the screen like menus, dialogs, drop down boxes.
	 *
	 * It allows the controls to be aligned to other DOM elements
	 * using the {@link sap.ui.core.Popup.Dock} method. With it you can define where
	 * the popup should be docked. One can dock the popup to the top, bottom, left or right side
	 * of another DOM element.
	 *
	 * In the case that the popup has no space to show itself in the view port
	 * of the current window, it tries to open itself to the inverted direction.
	 *
	 * <strong>Since 1.12.3</strong>, it is possible to add further DOM-element-IDs that can get the focus when
	 * <code>autoclose</code> or <code>modal</code> is enabled. E.g. the <code>RichTextEditor</code> with running
	 * TinyMCE uses this method to be able to focus the popups of the TinyMCE if the <code>RichTextEditor</code> runs
	 * within a <code>Popup</code>/<code>Dialog</code> etc.
	 *
	 * <strong>Since 1.75</strong>, DOM elements which have the attribute
	 * <code>data-sap-ui-integration-popup-content</code> are considered to be part of all opened popups. Those DOM
	 * elements can get the focus without causing the autoclose popup to be closed or the modal popup to take the focus
	 * back to itself. Additionally, a further DOM query selector can be provided by using
	 * {@link sap.ui.core.Popup.addExternalContent} to make the DOM elements which match the selector be considered as
	 * part of all opened popups.  Please be aware that the Popup implementation only checks if a DOM element is marked
	 * with the attribute <code>data-sap-ui-integration-popup-content</code>. The actual attribute value is not checked. To
	 * prevent a DOM element from matching, you must remove the attribute itself. Setting the attribute to a falsy value
	 * is not enough in this case.
	 *
	 * @param {sap.ui.core.Control | sap.ui.core.Element | Element} oContent the content to render in the popup. In case of sap.ui.core.Element or DOMNode, the content must be present in the page (i.e. rendered). In case of sap.ui.core.Control, the Popup ensures rendering before opening.
	 * @param {boolean} [bModal=false] whether the popup should be opened in a modal way (i.e. with blocking background). Setting this to "true" effectively blocks all attempts to focus content outside the modal popup. A modal popup also automatically sets the focus back to whatever was focused when the popup opened.
	 * @param {boolean} [bShadow=true] whether the popup should be have a visual shadow underneath (shadow appearance depends on active theme and browser support)
	 * @param {boolean} [bAutoClose=false] whether the popup should automatically close when the focus moves out of the popup
	 *
	 * @public
	 * @class
	 * @alias sap.ui.core.Popup
	 * @extends sap.ui.base.ManagedObject
	 */
	var Popup = ManagedObject.extend("sap.ui.core.Popup", {
		constructor: function (oContent, bModal, bShadow, bAutoClose) {
			assert(arguments.length == 0 || (oContent && typeof oContent === "object"), "oContent must be an object or there may be no arguments at all");
			assert((bModal === undefined || bModal === true || bModal === false), "bModal must be true, false, or undefined");
			assert((bShadow === undefined || bShadow === true || bShadow === false), "bShadow must be true, false, or undefined");
			assert((bAutoClose === undefined || bAutoClose === true || bAutoClose === false), "bAutoClose must be true, false, or undefined");

			ManagedObject.apply(this);

			this._popupUID = uid(); // internal ID to make event handlers unique

			this.bOpen = false; // true exactly if the Popup is opening, open, or closing
			this.eOpenState = OpenState.CLOSED;

			this._mEvents = {};
			this._mEvents["sap.ui.core.Popup.addFocusableContent-" + this._popupUID] = this._addFocusableArea;
			this._mEvents["sap.ui.core.Popup.removeFocusableContent-" + this._popupUID] = this._removeFocusableArea;
			this._mEvents["sap.ui.core.Popup.closePopup-" + this._popupUID] = this._closePopup;
			this._mEvents["sap.ui.core.Popup.onFocusEvent-" + this._popupUID] = this.onFocusEvent;
			this._mEvents["sap.ui.core.Popup.increaseZIndex-" + this._popupUID] = this._increaseMyZIndex;
			this._mEvents["sap.ui.core.Popup.contains-" + this._popupUID] = this._containsEventBusWrapper;
			this._mEvents["sap.ui.core.Popup.extendFocusInfo-" + this._popupUID] = this._extendFocusInfoEventBusWrapper;

			if (oContent) {
				this.setContent(oContent);
			}

			this._oDefaultPosition = {
				my: Popup.Dock.CenterCenter,
				at: Popup.Dock.CenterCenter,
				of: document,
				offset: "0 0",
				collision: "flip"
			};

			this._oPosition = Object.assign({},this._oDefaultPosition);

			this._bModal = !!bModal;
			this._oPreviousFocus = null;
			this._sInitialFocusId = null;
			this._bShadow = typeof (bShadow) === "boolean" ? bShadow : true;
			this._bAutoClose = !!bAutoClose;
			this._animations = { open: null, close: null };
			this._durations = {	open: "fast", close: "fast" };
			this._iZIndex = -1;
			this.setNavigationMode();

			//autoclose handler for mobile or desktop browser in touch mode
			//this function needs to be put onto the instance other than the prototype because functions on the prototype are treated as same function and can't be bound twice.
			if (this.touchEnabled) {
				this._fAutoCloseHandler = function(oEvent) {
					// Suppress the delayed mouse event from mobile browser
					if (oEvent.isMarked("delayedMouseEvent") || oEvent.isMarked("cancelAutoClose")) {
						return;
					}
					// call the close handler only when it's fully opened
					// this also prevents calling close while closing
					if (this.eOpenState === OpenState.CLOSING || this.eOpenState === OpenState.CLOSED) {
						return;
					}

					if (!this._contains(oEvent.target)) {
						this.close();
					}
				}.bind(this);
			}

			this._F6NavigationHandler = function(oEvent) {
				var oSettings = {},
					sMode = this._sF6NavMode,
					oDockElement;

				// DOCK mode only possible for non-modal popups with valid dock element
				if (sMode == "DOCK") {
					if (this._bModal) {
						sMode = "NONE";
					} else if (this._oLastPosition && this._oLastPosition.of) {
						oDockElement = this._getOfDom(this._oLastPosition.of);
						if (!oDockElement || oDockElement === document ){
							oDockElement = null;
							sMode = "NONE";
						}
					}
				}

				// Define navigation settings according to specified mode
				switch (sMode) {
					case "SCOPE":
						oSettings.scope = this._$()[0]; // Search scope for next F6 target is the popup itself
						break;
					case "DOCK":
						oSettings.target = oDockElement; // Starting point for searching the next F6 target is the dock element
						var $DockPopup = jQuery(oDockElement).parents("[data-sap-ui-popup]");
						oSettings.scope = $DockPopup.length ? $DockPopup[0] : null; // Search scope is the parent popup (if exists, otherwise the document)
						break;
					default: //"NONE" and others
						oSettings.skip = true; // Ignore the F6 key event
				}

				F6Navigation.handleF6GroupNavigation(oEvent, oSettings);
			}.bind(this);
		},

		metadata : {
			library: "sap.ui.core",

			associations : {
				"childPopups" : {
					type : "sap.ui.core.Popup",
					multiple : true,
					visibility: "hidden"
				}
			},

			events : {
				"opened" : {},
				"closed" : {}
			}
		}

	});

	/**
	 * @typedef {object} sap.ui.core.Popup.PositionInfo
	 * @public
	 *
	 * @property {object} lastPosition The last position value
	 * @property {DOMRect} lastOfRect The DOMRect of the previous "of" element
	 * @property {DOMRect} currentOfRect The DOMRect of the current "of" element
	 */

	Popup.prototype.getChildPopups = function() {
		return this.getAssociation("childPopups", []);
	};

	Popup.prototype.addChildPopup = function(vChildPopup) {
		return this.addAssociation("childPopups", vChildPopup);
	};

	Popup.prototype.removeChildPopup = function(vChildPopup) {
		return this.removeAssociation("childPopups", vChildPopup);
	};

	// stack used for storing z-indices for blocklayer
	Popup.blStack = [];

	/**
	 * Enumeration providing options for docking of some element to another.
	 *
	 * "Right" and "Left" will stay the same in RTL mode, but "Begin" and "End" will flip to the other side ("Begin" is "Right" in RTL).
	 *
	 * @public
	 * @enum {string}
	 */
	Popup.Dock = {

		/**
		 * @public
		 * @type {string}
		 */
		BeginTop      : "begin top",

		/**
		 * @public
		 * @type {string}
		 */
		BeginCenter   : "begin center",

		/**
		 * @public
		 * @type {string}
		 */
		BeginBottom   : "begin bottom",

		/**
		 * @public
		 * @type {string}
		 */
		LeftTop      : "left top",

		/**
		 * @public
		 * @type {string}
		 */
		LeftCenter   : "left center",

		/**
		 * @public
		 * @type {string}
		 */
		LeftBottom   : "left bottom",

		/**
		 * @public
		 * @type {string}
		 */
		CenterTop    : "center top",

		/**
		 * @public
		 * @type {string}
		 */
		CenterCenter : "center center",

		/**
		 * @public
		 * @type {string}
		 */
		CenterBottom : "center bottom",

		/**
		 * @public
		 * @type {string}
		 */
		RightTop     : "right top",

		/**
		 * @public
		 * @type {string}
		 */
		RightCenter  : "right center",

		/**
		 * @public
		 * @type {string}
		 */
		RightBottom  : "right bottom",

		/**
		 * @public
		 * @type {string}
		 */
		EndTop     : "end top",

		/**
		 * @public
		 * @type {string}
		 */
		EndCenter  : "end center",

		/**
		 * @public
		 * @type {string}
		 */
		EndBottom  : "end bottom"
	};

	DataType.registerEnum("sap.ui.core.Popup.Dock", Popup.Dock);

	/**
	 * This property changes how the autoClose behaves on the Popup.
	 *
	 * When it's set to true, the Popup will be closed when tap outside of the Popup.
	 * Otherwise it will close as soon as the focus leaves the Popup.
	 *
	 * The default value of this property is determined by checking whether the devices supports touch event. The touch
	 * event is used in case the touch interface is the only source for handling user interaction by checking
	 * (!Device.system.combi). Since iPadOS 13, a desktop mode is introduced on iPad which sets this property with
	 * false. However, the "button" tag loses focus again after it's tapped in Safari browser which makes the
	 * "autoclose" feature in Popup behave wrongly. Therefore this property is always true in touch supported Safari
	 * browser.
	 *
	 * @static
	 * @type {boolean}
	 * @private
	 */
	Popup.prototype.touchEnabled = Device.support.touch && (Device.browser.safari || !Device.system.combi);

	/**
	 * On mobile device, the browser may set the focus to somewhere else after
	 * the restoring of focus from Popup. This behavior should be prevented in
	 * order to make sure that the focus is restored to the right DOM element in
	 * mobile environment.
	 *
	 * @type {boolean}
	 * @private
	 */
	Popup.prototype.preventBrowserFocus = Device.support.touch && !Device.system.combi;

	//****************************************************
	// Layer et al.
	//****************************************************

	/**
	 * This constructor of the Popup.Layer  class
	 *
	 * @class
	 * @private
	 * @alias sap.ui.core.Popup.Layer
	*/
	var Layer = BaseObject.extend("sap.ui.core.Popup.Layer", {
		constructor: function() {
			BaseObject.call(this);
			var sDomString = this.getDomString();
			this._$Ref = jQuery(sDomString).appendTo(StaticArea.getDomRef());
		}
	});

	/**
	 * Initializes the popup layer by adding z-index and visibility to the popup layer
	 * and insert the popup directly after the given <code>oRef</code> element
	 *
	 * @param {jQuery} oRef The element as a jQuery object
	 * @param {int} iZIndex The z-index value
	 * @private
	 */
	Layer.prototype.init = function(oRef, iZIndex) {
		this._$Ref.css({
			"visibility" : "visible",
			"z-index" : iZIndex
		});
		this.update(oRef, iZIndex);
		this._$Ref.insertAfter(oRef).show();
	};

	/**
	 * Update the popup layer with the given <code>iZIndex</code> on the given <code>oRef</code> element
	 *
	 * @param {jQuery} oRef The element as a jQuery object
	 * @param {int} iZIndex The z-index value
	 * @protected
	 */
	Layer.prototype.update = function(/** jQuery */oRef, iZIndex){
		if (oRef.length) {
			var oRect = oRef.rect();
			this._$Ref.css({
				"left" : oRect.left,
				"top" : oRect.top
			});

			if (oRef.css("right") != "auto" && oRef.css("right") != "inherit") {
				this._$Ref.css({
					"right" : oRef.css("right"),
					"width" : "auto"
				});
			} else {
				this._$Ref.css({
					"width" : oRect.width,
					"right" : "auto"
				});
			}
			if (oRef.css("bottom") != "auto" && oRef.css("bottom") != "inherit") {
				this._$Ref.css({
					"bottom" : oRef.css("bottom"),
					"height" : "auto"
				});
			} else {
				this._$Ref.css({
					"height" : oRect.height,
					"bottom" : "auto"
				});
			}

			if (typeof (iZIndex) === "number") {
				this._$Ref.css("z-index", iZIndex);
			}
		}
	};

	/**
	 * Resets the popup layer by hidding and assigning to the static area
	 *
	 * @private
	 */
	Layer.prototype.reset = function(){
		if (this._$Ref.length) {
			this._$Ref[0].style.display = "none";
			this._$Ref[0].style.visibility = "hidden";

			this._$Ref.appendTo(StaticArea.getDomRef());
		}
	};

	/**
	 * Must be overwritten by sub class.
	 *
	 * @abstract
	 * @returns {string} The DOM string
	 */
	Layer.prototype.getDomString = function(){
		Log.error("sap.ui.core.Popup.Layer: getDomString function must be overwritten!");

		return "";
	};

	// End of Layer

	//****************************************************
	// ShieldLayer et al.
	//****************************************************

	/**
	* @class
	* @private
	* @alias sap.ui.core.Popup.ShieldLayer
	*/
	var ShieldLayer = Layer.extend("sap.ui.core.Popup.ShieldLayer", {
		constructor: function() {
			Layer.apply(this);
		}
	});

	ShieldLayer.prototype.getDomString = function(){
		return "<div class=\"sapUiPopupShield\" id=\"sap-ui-shieldlayer-" + uid() + "\"></div>";
	};

	/**
	* Facility for reuse of created shield layers.
	* @type sap.ui.base.ObjectPool
	* @private
	*/
	Popup.prototype.oShieldLayerPool = new ObjectPool(ShieldLayer);
	//End of ShieldLayer

	// Begin of Popup-Stacking facilities
	(function() {
		var iLastZIndex = 0;
		// TODO: Implement Number.SAFE_MAX_INTEGER (Math.pow(2, 53) -1) when ECMAScript 6 is mostly supported
		var iMaxInteger = Math.pow(2, 32) - 1;

		/**
		 * Set an initial z-index that should be used by all Popup so all Popups start at least
		 * with the set z-index.
		 * If the given z-index is lower than any current available z-index the highest z-index will be used.
		 *
		 * @param {number} iInitialZIndex is the initial z-index
		 * @public
		 * @since 1.30.0
		 */
		Popup.setInitialZIndex = function(iInitialZIndex){
			if (iInitialZIndex >= iMaxInteger) {
				throw new Error("Z-index can't be higher than Number.MAX_SAFE_INTEGER");
			}

			iLastZIndex = Math.max(iInitialZIndex, this.getLastZIndex());
		};

		/**
		 * Returns the last z-index that has been handed out. does not increase the internal z-index counter.
		 *
		 * @returns {number} The z-index value
		 * @public
		 */
		Popup.getLastZIndex = function(){
			return iLastZIndex;
		};

		/**
		 * Returns the last z-index that has been handed out. does not increase the internal z-index counter.
		 *
		 * @returns {number} Th z-index value
		 * @public
		 */
		Popup.prototype.getLastZIndex = function(){
			return Popup.getLastZIndex();
		};

		/**
		 * Returns the next available z-index on top of the existing/previous popups. Each call increases the internal z-index counter and the returned z-index.
		 *
		 * @returns {number} the next z-index on top of the Popup stack
		 * @public
		 */
		Popup.getNextZIndex = function(){
			iLastZIndex += 10;
			if (iLastZIndex >= iMaxInteger) {
				throw new Error("Z-index can't be higher than Number.MAX_SAFE_INTEGER");
			}
			return iLastZIndex;
		};

		/**
		 * Returns the next available z-index on top of the existing/previous popups. Each call increases the internal z-index counter and the returned z-index.
		 *
		 * @returns {number} the next z-index on top of the Popup stack
		 * @public
		 */
		Popup.prototype.getNextZIndex = function(){
			return Popup.getNextZIndex();
		};
	}());
	// End of Popup-Stacking facilities

	/**
	 * This function compares two different objects (created via jQuery(DOM-ref).rect()).
	 * If the left, top, width or height differs more than a set puffer this function
	 * will return false.
	 *
	 * @param {object} oRectOne the first object
	 * @param {object} oRectTwo the other object
	 * @return {boolean} if the given objects are equal
	 * @private
	 */
	var fnRectEqual = function(oRectOne, oRectTwo) {
		if ((!oRectOne && oRectTwo) || (oRectOne && !oRectTwo)) {
			return false;
		}

		if (!oRectOne && !oRectTwo) {
			return true;
		}

		var iPuffer = 3;
		var iLeft = Math.abs(oRectOne.left - oRectTwo.left);
		var iTop = Math.abs(oRectOne.top - oRectTwo.top);
		var iWidth = Math.abs(oRectOne.width - oRectTwo.width);
		var iHeight = Math.abs(oRectOne.height - oRectTwo.height);

		// check if the of has moved more pixels than set in the puffer
		// Puffer is needed if the opener changed its position only by 1 pixel
		if (iLeft > iPuffer || iTop > iPuffer || iWidth > iPuffer || iHeight > iPuffer) {
			return false;
		}
		return true;
	};

	/**
	 * Opens the popup's content at the position either specified here or beforehand via {@link #setPosition}.
	 * Content must be capable of being positioned via "position:absolute;"
	 * All parameters are optional (open() may be called without any parameters). iDuration may just be omitted, but if any of "at", "of", "offset", "collision" is given, also the preceding positional parameters ("my", at",...) must be given.
	 *
	 * If the Popup's OpenState is different from "CLOSED" (i.e. if the Popup is already open, opening or closing), the call is ignored.
	 *
	 * @param {int} [iDuration=jQuery.fx.speed.fast] animation duration in milliseconds. For <code>iDuration</code> == 0 the opening happens synchronously without animation.
	 * @param {sap.ui.core.Popup.Dock} [my=sap.ui.core.Popup.Dock.CenterCenter] the popup content's reference position for docking
	 * @param {sap.ui.core.Popup.Dock} [at=sap.ui.core.Popup.Dock.CenterCenter] the "of" element's reference point for docking to
	 * @param {string | sap.ui.core.Element | Element | jQuery | jQuery.Event} [of=document] specifies the reference element to which the given content should dock to
	 * @param {string} [offset='0 0'] the offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "10 0" to move the popup 10 pixels to the right). If the docking of both "my" and "at" are both RTL-sensitive ("begin" or "end"), this offset is automatically mirrored in the RTL case as well.
	 * @param {sap.ui.core.Collision} [collision='flip'] defines how the position of an element should be adjusted in case it overflows the within area in some direction.
	 * @param {string | sap.ui.core.Element | Element | Window} [within=Window] defines the area the popup should be placed in. This affects the collision detection.
	 * @param {boolean | function(sap.ui.core.Popup.PositionInfo) | null} [followOf=false] defines whether the popup should follow the dock reference when the reference changes its position.
	 * @ui5-omissible-params iDuration
	 * @public
	 */
	Popup.prototype.open = function(iDuration, my, at, of, offset, collision, within, followOf) {
		assert(this.oContent, "Popup content must have been set by now");
		// other asserts follow after parameter shifting

		if (this.eOpenState != OpenState.CLOSED) {
			return;
		}

		// iDuration is optional... if not given:
		if (typeof (iDuration) == "string") {
			followOf = within;
			within = collision;
			collision = offset;
			offset = of;
			of = at;
			at = my;
			my = iDuration;
			iDuration = -1;
		}

		// compatibility: map the parameter "within" to "followOf"
		if (typeof within === "boolean" || typeof within === "function" || within === Popup.CLOSE_ON_SCROLL) {
			followOf = within;
			within = undefined;
		}

		// if no arguments are passed iDuration has to be set to -1
		if (iDuration === undefined) {
			iDuration = -1;
		}

		// all other parameters must be given if any subsequent parameter is given, hence no more shifting
		// now every parameter should be in the right variable

		assert(iDuration === -1 || (typeof iDuration === "number" && iDuration % 1 == 0), "iDuration must be an integer (or omitted)"); // omitted results in -1
		assert(my === undefined || typeof my === "string", "my must be a string or empty");
		assert(at === undefined || typeof at === "string", "at must be a string or empty");
		assert(!of || typeof of === "object" || typeof of === "function", "of must be empty or an object");
		assert(!offset || typeof offset === "string", "offset must be empty or a string");
		assert(!collision || Collision.isValid(collision), "collision must be empty or of type sap.ui.core.Collision");
		assert(!within || within === window || typeof within === "string" || within instanceof Element || within instanceof HTMLElement, "within must be either empty, or the global window object, or a string, or a sap.ui.core.Element, or a DOM element");
		assert(!followOf || typeof followOf === "boolean" || typeof followOf === "function" || followOf === Popup.CLOSE_ON_SCROLL, "followOf must be either empty or a boolean");

		this.eOpenState = OpenState.OPENING;

		var oStaticUIArea = getStaticUIArea(),
			oUIArea;

		// If the content is a control and has no parent, add it to the static UIArea.  This makes automatic rerendering
		// after invalidation work.  When the popup closes, the content is removed again from the static UIArea.
		//
		// If the content has a parent, but the parent isn't connected to any UIArea, the getUIArea function is
		// overwritten to return the static UIArea to make further rerendering works. The function is deleted once the
		// popup is closed.
		this._bContentAddedToStatic = false;
		this._bUIAreaPatched = false;
		if (this.oContent instanceof Control) {
			if (!this.oContent.getParent()) {
				oStaticUIArea.addContent(this.oContent, true);
				this._bContentAddedToStatic = true;
			} else if (!this.oContent.getUIArea()) {
				this.oContent.getUIArea = function() {
					return oStaticUIArea;
				};
				this._bUIAreaPatched = true;
			}

			oUIArea = this.oContent.getUIArea();
			if (Popup._bEnableUIAreaCheck && oUIArea.getRootNode().id !== oStaticUIArea.getRootNode().id) {
				// the variable 'sap.ui.core.Popup._bEnableUIAreaCheck' isn't defined anywhere. To enable this check this variable
				// has to be defined within the console or somehow else.
				Log.warning("The Popup content is NOT connected with the static-UIArea and may not work properly!");
			}
		}

		// save current focused element to restore the focus after closing
		this._oPreviousFocus = Popup.getCurrentFocusInfo();

		// It is mandatory to check if the new Popup runs within another Popup because
		// if this new Popup is rendered via 'this._$(true)' and focused (happens e.g. if
		// the Datepicker runs in a Popup and the corresponding Calendar will also open
		// in a Popup. Then the corresponding date will be focused immediately. If the
		// Calendar-Popup wasn't added to the previous Popup as child it is impossible to
		// check in 'onFocusEvent' properly if the focus is being set to a Calendar-Popup which is
		// a child of a Popup.
		if (this.isInPopup(of) || this.isInPopup(this._oPosition.of)) {
			var sParentId = this.getParentPopupId(of) ||  this.getParentPopupId(this._oPosition.of);
			var sChildId = "";

			var oContent = this.getContent();
			if (oContent instanceof Element) {
				sChildId = oContent.getId();
			} else if (typeof oContent === "object") {
				sChildId = oContent.id;
			}

			this.addChildToPopup(sParentId, sChildId);
			this.addChildToPopup(sParentId, this._popupUID);
		}

		var $Ref = this._$(true);

		var iRealDuration = "fast";
		if ((iDuration === 0) || (iDuration > 0)) {
			iRealDuration = iDuration;
		} else if ((this._durations.open === 0) || (this._durations.open > 0)) {
			iRealDuration = this._durations.open;
		}

		// Ensure right position is used for this call
		var _oPosition;
		if (my || at || of || offset || collision || within) {
			_oPosition = this._createPosition(my, at, of, offset, collision, within);
			// position object has to be set accordingly otherwise "oPosition.of" of a DOM-reference
			// would be the "document" even if a proper "of" was provided
			this._oPosition = _oPosition;
		} else {
			_oPosition = this._oPosition;
			if (!this._bOwnWithin && vGlobalWithinArea) {
				this._oPosition.within = vGlobalWithinArea;
			}
		}
		if (!_oPosition.of) {
			_oPosition.of = this._oPosition.of || document;
		}

		this._iZIndex = this._iZIndex === this.getLastZIndex() ? this._iZIndex : this.getNextZIndex();

		var oStaticArea = StaticArea.getDomRef();
		$Ref.css({
			"position" : "absolute",
			"visibility" : "hidden"
		});

		if (!($Ref[0].parentNode == oStaticArea)) { // do not move in DOM if not required - otherwise this destroys e.g. the RichTextEditor
			$Ref.appendTo(oStaticArea);
		}
		$Ref.css("z-index", this._iZIndex);

		Log.debug("position popup content " + $Ref.attr("id") + " at " + JSON.stringify(_oPosition.at));
		this._applyPosition(_oPosition);

		if (followOf !== undefined) {
			this.setFollowOf(followOf);
		}

		// and show the popup content
		$Ref.toggleClass("sapUiShd", this._bShadow);

		var oDomRef = $Ref[0];

		if (oDomRef) {
			oDomRef.style.display = "none";
			oDomRef.style.visibility = "visible";
		}

		var bNoAnimation = iRealDuration == 0;

		this._duringOpen(!bNoAnimation);

		if (bNoAnimation) { // do not animate if there is a duration == 0
			this._opened();
		} else if (this._animations.open) { // if custom animation is defined, call it
			this._animations.open.call(null, $Ref, iRealDuration, this._opened.bind(this));
		} else { // otherwise play the default animation
			$Ref.fadeIn(iRealDuration, this._opened.bind(this));
		}
	};

	Popup.prototype._getDomRefToFocus = function() {
		var $Ref = this._$(/* bForceReRender */false, /* bGetOnly */true),
			oDomRefToFocus,
			oControl;

		if (this._shouldGetFocusAfterOpen()) {
			if (this._sInitialFocusId) {
				oControl = Element.getElementById(this._sInitialFocusId);

				if (oControl) {
					oDomRefToFocus = oControl.getFocusDomRef();
				}
				oDomRefToFocus = oDomRefToFocus || window.document.getElementById(this._sInitialFocusId);
			}

			oDomRefToFocus = oDomRefToFocus || $Ref.firstFocusableDomRef();
		}

		return oDomRefToFocus;
	};

	/**
	 * This function is called after the open animation has been finished.
	 * It sets the DOM really to 'visible', sets the focus inside the Popup,
	 * registers the 'followOf-Handler' and fires the 'opened' event.
	 *
	 * @fires sap.ui.core.Popup#opened
	 * @private
	 */
	Popup.prototype._opened = function() {
		// If the popup's state is changed again after 'open' function is called,
		// for example, the 'close' is called before the opening animation finishes,
		// it's needed to immediately return from this function.
		if (this.eOpenState !== OpenState.OPENING) {
			return;
		}

		// internal status that any animation has been finished should set to true;
		this.bOpen = true;

		var $Ref = this._$(/* bForceReRender */false, /* bGetOnly */true);
		if ($Ref[0] && $Ref[0].style) {
			$Ref[0].style.display = "block";
		}

		// in modal and auto-close case the focus needs to be in the popup; provide this generic implementation as helper, but users can change the focus in the "opened" event handler
		if (this._shouldGetFocusAfterOpen()) {
			var domRefToFocus = this._getDomRefToFocus();

			if (domRefToFocus) {
				domRefToFocus.focus();
			}

			// if the opener was focused but it exceeds the current window width
			// the window will scroll/reposition accordingly.
			// When this popup registers the followOf-Handler the check if the
			// opener moved will result in that the opener moved due to the focus
			// and scrolling of the browser. So it is necessary to resize/reposition
			// the popup right after the focus.
			var oCurrentOfRef = this._getOfDom(this._oLastPosition.of);
			var oCurrentOfRect = jQuery(oCurrentOfRef).rect();
			if (this._oLastOfRect && oCurrentOfRect && !fnRectEqual(this._oLastOfRect, oCurrentOfRect)) {
				this._applyPosition(this._oLastPosition);
			}
		}

		this.eOpenState = OpenState.OPEN;

		// set and register listener of 'followOf' (given via Popup.open()) only when
		// the popup has been opened already. Otherwise checking the opener's positio
		// starts to early
		if (this.getFollowOf()) {
			Popup.DockTrigger.addListener(Popup.checkDocking, this);
		}

		// notify that opening has completed
		this.fireOpened();
	};

	/**
	 * This function is called before or during the Popup opens. Here the registration
	 * of events and delegates takes place and the corresponding flags for the Popup are set.
	 *
	 * @param {boolean} bOpenAnimated Determines if the opening has animation
	 *
	 * @private
	 */
	Popup.prototype._duringOpen = function(bOpenAnimated) {
		var oStaticArea = StaticArea.getDomRef(),
			oFirstFocusableInStaticArea = document.getElementById(oStaticArea.id + "-firstfe");

		Popup._clearSelection();
		this._setupUserSelection();

		if (this._bModal) {
			this._showBlockLayer();
		}

		// When it runs on a mobile device, the focus doesn't need to be set into the popup area immediately after opening
		// the popup. It even causes some rendering problem in iOS safari when the focus is set here.
		if (!this.touchEnabled
			// When the open process is animated, the focus should be moved out of the previous focused element during the
			// opening animation. Otherwise, it's not needed to shift the focus because the focus will be set into the popup
			// in the same call stack in function "_opened"
			&& bOpenAnimated
			// some application or test create the static UIArea div by itself and therefore the first focusable element
			// is not available
			&& oFirstFocusableInStaticArea
			// Some popup scenarios requires the blur of the previous focused element should be done
			// at the end of this open method to first show the block layer which changes the top most displayed popup
			&& this._shouldGetFocusAfterOpen()
			// when the current active element is in a popup, it's not blurred at this position because the focus isn't
			// set to the new popup yet and blurring in the previous popup will mess up the modal or autoclose in the
			// previous popup
			&& !this.isInPopup(document.activeElement)
			// If the focus needs to be set into the popup and it's different than the current document active element
			// (the focus may stay with the current active element when the initial focus id is set), the current active
			// element is blurred here to prevent it from getting further events during the opening animation of the
			// popup
			&& this._getDomRefToFocus() !== document.activeElement) {

			/* actively move the focus to the static UI area to blur the previous focused element after popup is open.
			 The focus will be moved into the popup once the popup opening animation is finished
			 */
			/* In safari no scrolling happens when focus() is called on DOM elements with height: 0px.
			 In firefox and chrome no scrolling has to be forced with preventScroll: true in this scenario.
			*/
			oFirstFocusableInStaticArea.focus({preventScroll: true});
		}

		// add Delegate to hosted content for handling of events (e.g. onfocusin)
		if (this.oContent instanceof Element) {
			this.oContent.addDelegate(this);
		}

		this.bOpen = true;

		this._activateFocusHandle();

		this._$(false, true).on("keydown", this._F6NavigationHandler);
	};

	Popup.prototype._shouldGetFocusAfterOpen = function() {
		return this._bModal || this._bAutoClose || this._sInitialFocusId;
	};

	/**
	 * Checks whether the given DOM element is contained in the current popup or
	 * one of the child popups.
	 *
	 * @param {Element} oDomRef The DOM element for which the check is performed
	 * @returns {boolean} Whether the given DOM element is contained
	 */
	Popup.prototype._contains = function(oDomRef) {
		var oPopupDomRef = this._$().get(0);
		if (!oPopupDomRef) {
			return false;
		}

		var bContains = oPopupDomRef.contains(oDomRef);

		var aChildPopups;

		if (!bContains) {
			aChildPopups = this.getChildPopups();

			bContains = aChildPopups.some(function(sChildID) {
				// sChildID can either be the popup id or the DOM id
				// therefore we need to try with document.getElementById to check the DOM id case first
				// only when it doesn't contain the given DOM, we publish an event to the event bus
				var oContainDomRef = (sChildID ? window.document.getElementById(sChildID) : null);
				var bContains = oContainDomRef && oContainDomRef.contains(oDomRef);
				if (!bContains) {
					var sEventId = "sap.ui.core.Popup.contains-" + sChildID;
					var oData = {
						domRef: oDomRef
					};
					oEventBus.publish("sap.ui", sEventId, oData);

					bContains = oData.contains;
				}
				return bContains;
			});
		}

		if (!bContains) {
			oPopupExtraContentSelectorSet.forEach(function(sSelector) {
				bContains = bContains || jQuery(oDomRef).closest(sSelector).length > 0;
			});
		}

		return bContains;
	};

	// Wrapper of _contains method for the event bus
	Popup.prototype._containsEventBusWrapper = function(sChannel, sEvent, oData) {
		oData.contains = this._contains(oData.domRef);
	};

	/**
	 * Handles the focus/blur events.
	 *
	 * @param {document#event} oBrowserEvent the browser event
	 * @private
	 */
	Popup.prototype.onFocusEvent = function(oBrowserEvent) {
		var oEvent = jQuery.event.fix(oBrowserEvent);
		if (arguments.length > 1 && arguments[1] === "sap.ui.core.Popup.onFocusEvent-" + this._popupUID) {
			// if forwarding a focus event to this Popup via EventBus by any child Popup
			oEvent = jQuery.event.fix(arguments[2]);
		}
		var type = (oEvent.type == "focus" || oEvent.type == "activate") ? "focus" : "blur";
		var bContains = false;

		if (type == "focus") {
			var oDomRef = this._$().get(0);
			if (oDomRef) {
				bContains = this._contains(oEvent.target);

				Log.debug("focus event on " + oEvent.target.id + ", contains: " + bContains);

				if (this._bModal && !bContains) { // case: modal popup and focus has gone somewhere else in the document
					// The popup is modal, but the focus has moved to a part of the document that is NOT inside the popup
					// check whether this modal popup is the topmost one
					var bTopMost = Popup.blStack.length > 0 && Popup.blStack[Popup.blStack.length - 1].popup === this;

					if (bTopMost) {
						// if in desktop browser or the DOM node which has the focus is input outside the popup,
						// focus on the last blurred element
						if (Device.system.desktop || jQuery(oEvent.target).is(":input")) {
							if (this.oLastBlurredElement) {
								// If a DOM element inside the popup was blurred, the focus should be set
								// after the current call stack is finished because the existing timer for
								// autoclose popup is cancelled by setting the focus here.
								//
								// Suppose an autoclose popup is opened within a modal popup. Clicking
								// on the block layer should wait the autoclose popup to first close then
								// set the focus back to the lasted blurred element.
								setTimeout(function() {
									if (this.oLastBlurredElement) {
										this.oLastBlurredElement.focus();
									}
								}.bind(this), 0);
							} else {
								// If the focus is set to somewhere else without a blurred element in popup,
								// the focus is set to the root DOM element of the popup
								oDomRef.focus();
							}
						}
					}
				} else if (this._bAutoClose && bContains && this._sTimeoutId) { // case: autoclose popup and focus has returned into the popup immediately
					// focus has returned, so it did only move inside the popup => clear timeout
					clearTimeout(this._sTimeoutId);
					this._sTimeoutId = null;
				}
			}
		} else if (type == "blur") { // an element inside the popup is loosing focus - remember in case we need to re-set
			Log.debug("blur event on " + oEvent.target.id);
			if (this._bModal) {
				this.oLastBlurredElement = oEvent.target;
			} else if (this._bAutoClose) {
				// focus/blur for handling autoclose is disabled for desktop browsers which are not in the touch simulation mode
				// create timeout for closing the popup if there is no focus immediately returning to the popup
				if (!this.touchEnabled && !this._sTimeoutId) {
					// If Popup has focus and we click outside of the browser, in Chrome the blur event is fired, but the focused element is still in the Popup and is the same as the focused that triggers the blur event.
					// if the DOM element that fires the blur event is the same as the currently focused element, just return
					// because in Chrome when the browser looses focus, it fires the blur event of the
					// dom element that has the focus before, but document.activeElement is still this element
					if (oEvent.target === document.activeElement) {
						return;
					}

					var iDuration = typeof this._durations.close === "string" ? 0 : this._durations.close;
					// provide some additional event-parameters: closingDuration, where this delayed call comes from
					this._sTimeoutId = setTimeout(function(){
						this.close(iDuration, "autocloseBlur");
						var oOf = this._oLastPosition && this._oLastPosition.of;
						if (oOf) {
							var sParentPopupId = this.getParentPopupId(oOf);
							if (sParentPopupId) {
								// Also inform the parent popup that the focus is lost from the child popup
								// Parent popup can check whether the current focused element is inside the parent popup. If it's still inside the
								// parent popup, it keeps open, otherwise parent popup is also closed.
								var sEventId = "sap.ui.core.Popup.onFocusEvent-" + sParentPopupId;
								oEventBus.publish("sap.ui", sEventId, oEvent);
							}
						}
					}.bind(this), iDuration);
				}
			}
		}
	};

	/**
	 * Sets the ID of the element that should be focused once the popup opens.
	 * If the given ID is the ID of an existing Control, this Control's focusDomRef will be focused instead, which may be an HTML element with a different ID (usually a sub-element inside the Control).
	 * If no existing element ID is supplied and the Popup is modal or auto-close, the Popup will instead focus the first focusable element.
	 *
	 * @param {string} sId the ID of the DOM element to focus
	 * @public
	 */
	Popup.prototype.setInitialFocusId = function(sId) {
		assert(!sId || typeof sId === "string", "sId must be a string or empty");
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
	 * @param {int} [iDuration=jQuery.fx.speed.fast] Animation duration in milliseconds. For <code>iDuration</code> == 0 the closing happens synchronously without animation.
	 * @public
	 */
	Popup.prototype.close = function(iDuration) {
		if (Popup._autoCloseDebug) {
			return;
		}
		if (this._sTimeoutId) {
			clearTimeout(this._sTimeoutId);
			this._sTimeoutId = null;
		}

		assert(iDuration === undefined || (typeof iDuration === "number" && (iDuration % 1 == 0)), "iDuration must be empty or an integer");

		if (this.eOpenState == OpenState.CLOSED || this.eOpenState == OpenState.CLOSING) {
			return;
		} // also close when OPENING
		// the above will queue the animations (close only after opening), but may lead to the CLOSED event happening before the OPENED event

		var iRealDuration = "fast";
		if ((iDuration === 0) || (iDuration > 0)) {
			iRealDuration = iDuration;
		} else if ((this._durations.close === 0) || (this._durations.close > 0)) {
			iRealDuration = this._durations.close;
		}

		//if(this.eOpenState != sap.ui.core.OpenState.OPEN) return; // this is the more conservative approach: to only close when the Popup is OPEN

		this.eOpenState = OpenState.CLOSING;

		if (this.getFollowOf()) {
			Popup.DockTrigger.removeListener(Popup.checkDocking, this);
		}

		if (this.oContent) {
			// If we added the content control to the static UIArea,
			// then we should remove it again now.
			// Assumption: application did not move the content in the meantime!
			if (this._bContentAddedToStatic ) {
				//Fix for RTE in PopUp
				oEventBus.publish("sap.ui","__beforePopupClose", { domNode : this._$().get(0) });
				var oStatic = StaticArea.getUIArea();

				const iIndex = oStatic.indexOfContent(this.oContent);
				if (iIndex >= 0) {
					oStatic.removeContent(iIndex, true);
				}
			} else if (this._bUIAreaPatched) { // if the getUIArea function is patched, delete it
				delete this.oContent.getUIArea;
			}
		}

		this._bContentAddedToStatic = false;
		this._bUIAreaPatched = false;

		this._sTimeoutId = null;

		this._deactivateFocusHandle();

		this._$(false, true).off("keydown", this._F6NavigationHandler);

		if (this.oContent instanceof Element) {
			this.oContent.removeDelegate(this);
		}

		var $Ref = this._$();
		// unsubscribe the event listeners from EventBus
		if (this._bEventBusEventsRegistered) {
			this._unregisterEventBusEvents();
		}

		// Check if this instance is a child Popup. If true de-register this from
		// the parent
		if (this.isInPopup(this._oLastPosition.of)) {
			var sParentId = this.getParentPopupId(this._oLastPosition.of);
			var sChildId = "";

			var oContent = this.getContent();
			if (oContent instanceof Element) {
				sChildId = oContent.getId();
			} else if (typeof oContent === "object") {
				sChildId = oContent.id;
			}

			this.removeChildFromPopup(sParentId, sChildId);
			this.removeChildFromPopup(sParentId, this._popupUID);
		}

		if (this._bModal && this.preventBrowserFocus) {
			$Ref.one("mousedown", function(oEvent) {
				// browser sets the focus after mousedown event
				// On mobile devices, the restoring of focus may happen before
				// the delayed mousedown event.
				// The browser will set the focus to the clicked element again
				// after restoring of the focus.
				// Calling 'preventDefault' prevents the browser from setting
				// the focus after the delayed mousedown event.
				oEvent.preventDefault();
			});
		}

		this._duringClose();
		if (iRealDuration == 0) { // iRealDuration == 0 means: no animation!
			this._closed();
		} else if (this._animations.close) {
			this._animations.close.call(null, $Ref, iRealDuration, this._closed.bind(this)); // play custom animation, if supplied
		} else {
			$Ref.fadeOut(iRealDuration, this._closed.bind(this)); // otherwise use jQuery animation
		}
	};

	/**
	 * This function must be called after a Popup has been closed.
	 * Here the DOM-reference is really hidden and it is ensured that due to
	 * some delayed rendering the DOM is really hidden.
	 * Additionally the focus is set back where it has been before the Popup has
	 * been opened and this Popup will close all its children.
	 * Finally the 'closed' event is being fired.
	 *
	 * @fires sap.ui.core.Popup#closed
	 * @private
	 */
	Popup.prototype._closed = function() {
		var $Ref = this._$(/* bForceReRender */false, /* bGetOnly */true);

		if (this._bModal) {
			this._hideBlockLayer();
		}

		Popup._clearSelection();
		this._restoreUserSelection();

		if ($Ref.length) {
			var oDomRef = $Ref.get(0);

			// hide the old DOM ref
			if (oDomRef) {
				oDomRef.style.display = "none";
				oDomRef.style.visibility = "hidden";
				oDomRef.style.left = "0px";
				oDomRef.style.top = "0px";
				oDomRef.style.right = "";
			}

			// update the DomRef because it could have been re-rendered during closing
			$Ref = this._$(/* forceRerender */ false, /* only get DOM */ true);
			oDomRef = $Ref.length ? $Ref[0] : null;

			if (oDomRef) {
				// also hide the new DOM ref
				oDomRef.style.display = "none";
				oDomRef.style.visibility = "hidden";
				oDomRef.style.left = "0px";
				oDomRef.style.top = "0px";
				oDomRef.style.right = "";
			}
		}

		if (this._bModal) {
			// try to set the focus back to whatever was focused before. Do this here because animation needs to be finished.
			//- TODO: currently focus is restored only for modal popups. Non modal popups have to do it themselves because the outside focus can change!
			Popup.applyFocusInfo(this._oPreviousFocus);
			this._oPreviousFocus = null;
			this.oLastBlurredElement = null;
		}

		this.bOpen = false;
		this.eOpenState = OpenState.CLOSED;

		var aChildPopups = this.getChildPopups();
		for (var j = 0, l = aChildPopups.length; j < l; j++) {
			this.closePopup(aChildPopups[j]);
		}

		// notify users that the popup is now officially closed
		this.fireClosed();
	};

	/**
	 * This stuff is being executed during an animation is going on. But if there
	 * is no animation this stuff has to be done in advance, before ._closed is
	 * called.
	 *
	 * @private
	 */
	Popup.prototype._duringClose = function() {
		//deregister resize handler
		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}
	};

	/**
	 * Returns an object containing as much information about the current focus as
	 * possible, or null if no focus is present or no focus information can be gathered.
	 *
	 * @returns {object} oPreviousFocus with the information which control/element
	 *                                  was focused before the Popup has been opened.
	 *                                  If a control was focused the control will add
	 *                                  additional information if the control
	 *                                  implemented 'getFocusInfo'.
	 */
	Popup.getCurrentFocusInfo = function() {
		var _oPreviousFocus = null;
		var oActiveElement = Element.closestTo(document.activeElement);
		if (oActiveElement) {
			_oPreviousFocus = {
				'sFocusId' : oActiveElement.getId(),
				'oFocusInfo' : oActiveElement.getFocusInfo()
			};
		} else {
			// not an SAPUI5 control... but if something has focus, save as much information about it as available
			_oPreviousFocus = {
				'sFocusId' : document.activeElement.id,
				'oFocusedElement' : document.activeElement,
				// add empty oFocusInfo to avoid the need for all recipients to check
				'oFocusInfo': {}
			};
		}

		if (_oPreviousFocus) {
			// Storing the information that this focusInfo is processed by the Popup.
			// There are two different scenarios using the FocusInfo:
			// - Keep the value inside an input field if the renderer re-renders the
			// input
			// - The Popup focuses the previous focused control/element and uses
			// the FocusInfo mechanism as well.
			_oPreviousFocus.popup = this;
		}
		return _oPreviousFocus;
	};

	/**
	 * Applies the stored FocusInfo to the control/element where the focus
	 * was before the Popup was opened.
	 * When the FocusInfo has been applied the corresponding control/element
	 * will be focused.
	 *
	 * @param {object} oPreviousFocus is the stored focusInfo that was fetched
	 *                                from the control (if available)
	 */
	Popup.applyFocusInfo = function(oPreviousFocus) {
		var oOptions = {
			// this option informs the browser not to scroll the focused element
			// into the viewport
			preventScroll: true
		};

		if (oPreviousFocus) {
			var oFocusedControl = Element.getElementById(oPreviousFocus.sFocusId);
			if (oFocusedControl) {

				// if an SAPUI5 control had been focused, just re-focus it
				oFocusedControl.applyFocusInfo(Object.assign(oOptions, oPreviousFocus.oFocusInfo));
			} else {

				// no SAPUI5 control... try to find the control by ID if an ID was there
				var oElement = ((oPreviousFocus.sFocusId ? window.document.getElementById(oPreviousFocus.sFocusId) : null))
						|| oPreviousFocus.oFocusedElement; // if not even an ID was available when focus was lost maybe the original DOM element is still there
				if (oElement){
					oElement.focus(oOptions);
				}
			}
		}
	};

	/**
	 * Sets the content this instance of the Popup should render.
	 * Content must be capable of being positioned via position:absolute;
	 *
	 * @param {sap.ui.core.Control | Element } oContent The content of the popup
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Popup.prototype.setContent = function(oContent) {
		assert(typeof oContent === "object", "oContent must be an object");
		this.oContent = oContent;
		return this;
	};

	/**
	 * Returns this Popup's content.
	 * @return {sap.ui.core.Control | Element } the content that has been set previously (if any)
	 * @public
	 */
	Popup.prototype.getContent = function() {
		return this.oContent;
	};

	/**
	 * Sets the position of the Popup (if you refer to a Control as anchor then do not
	 * use the DOMRef of the control which might change after re-renderings).
	 * Optional parameters can only be omitted when all subsequent parameters are omitted as well.
	 *
	 * @param {sap.ui.core.Popup.Dock} my specifies which point of the given Content should be aligned
	 * @param {sap.ui.core.Popup.Dock | {left: sap.ui.core.CSSSize, top: sap.ui.core.CSSSize}} at specifies the point of the reference element to which the given Content should be aligned
	 * @param {string | sap.ui.core.Element | Element | jQuery | jQuery.Event} [of=document] specifies the reference element to which the given content should be aligned as specified in the other parameters
	 * @param {string} [offset='0 0'] the offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "0 10" to move the popup 10 pixels to the right). If the docking of both "my" and "at" are both RTL-sensitive ("begin" or "end"), this offset is automatically mirrored in the RTL case as well.
	 * @param {sap.ui.core.Collision} [collision] defines how the position of an element should be adjusted in case it overflows the within area in some direction.
	 * @param {string | sap.ui.core.Element | Element | Window} [within=Window] defines the area the popup should be placed in. This affects the collision detection.
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Popup.prototype.setPosition = function(my, at, of, offset, collision, within) {
		assert(typeof my === "string", "my must be a string");
		assert(typeof at === "string" || (typeof at === "object" && (typeof at.left === "number") && (typeof at.top === "number")), "my must be a string or an object with 'left' and 'top' properties");
		assert(!of || typeof of === "object" || typeof of === "function", "of must be empty or an object");
		assert(!offset || typeof offset === "string", "offset must be empty or a string");
		assert(!collision || Collision.isValid(collision), "collision must be empty or of type sap.ui.core.Collision");
		assert(!within || within === window || typeof within === "string" || within instanceof Element || within instanceof HTMLElement, "within must be either empty, or the global window object, or a string, or a sap.ui.core.Element, or a DOM element");

		this._oPosition = this._createPosition(my, at, of, offset, collision, within);

		if (this.eOpenState != OpenState.CLOSED) {
			this._applyPosition(this._oPosition);
		}

		return this;
	};


	Popup.prototype._createPosition = function(my, at, of, offset, collision, within) {
		// check if new jQuery-UI (>1.9) offset is used
		var bNewOffset = false;
		if (my && (my.indexOf("+") >= 0 || my.indexOf("-") >= 0)) {
			bNewOffset = true;
			if (offset && offset != "0 0") {
				Log.warning("offset used in my and in offset, the offset value will be ignored", "sap.ui.core.Popup", "setPosition");
			}
			offset = null;
		}

		var oPosition = extend({}, this._oDefaultPosition, {
			my: my || this._oDefaultPosition.my, // to use default my if empty string
			at: at || this._oDefaultPosition.at, // to use default at if empty string
			of: of,
			offset: offset,
			collision: collision
		});

		if (within || vGlobalWithinArea) {
			oPosition.within = within || vGlobalWithinArea;
		}

		this._bOwnWithin = !!within;

		if ( !jQuery.ui.version) {
			// only jquery-ui-position.js loaded, not jquery-ui-core.js, so no version info available
			if ( Popup._bNewOffset == null ) {
				// check whether the jQuery UI version is new (no more offset parameter) or not
				Popup._bNewOffset = true;
				var $Div = jQuery(document.createElement("div"));
				$Div.position({
					of: window,
					using: function(position, data) {
						// the data parameter to the using callback was introduced together with the replacement for 'offset'
						Popup._bNewOffset = (data !== undefined);
					}
				});
			}
		}

		var aMy = [];
		var aOffset = [];

		if ( Popup._bNewOffset || Version(jQuery.ui.version).compareTo("1.8.23") > 0) {
			if (offset && offset != "0 0") {
				// convert offset to my
				aMy = oPosition.my.split(" ");
				aOffset = offset.split(" ");
				var aSign = [parseInt(aOffset[0]) < 0 ? "" : "+", parseInt(aOffset[1]) < 0 ? "" : "+"]; // no "-" sign because already in numer of offset

				oPosition.my = aMy[0] + aSign[0] + aOffset[0] + " " + aMy[1] + aSign[1] + aOffset[1];
				oPosition.offset = null;
			}
		} else if (bNewOffset) {
			// new offset used with old jQuery version -> convert into offset property
			aMy = oPosition.my.split(" ");
			aOffset = ["",""];
			var iIndex = aMy[0].indexOf("+");
			if (iIndex < 0) {
				iIndex = aMy[0].indexOf("-");
			}
			if (iIndex >= 0) {
				aOffset[0] = aMy[0].slice(iIndex);
				aMy[0] = aMy[0].slice(0, iIndex);
			}

			iIndex = aMy[1].indexOf("+");
			if (iIndex < 0) {
				iIndex = aMy[1].indexOf("-");
			}
			if (iIndex >= 0) {
				aOffset[1] = aMy[1].slice(iIndex);
				aMy[1] = aMy[1].slice(0, iIndex);
			}

			oPosition.my = aMy[0] + " " + aMy[1];
			oPosition.offset = aOffset[0] + " " + aOffset[1];
		}

		return oPosition;

	};

	Popup.prototype._getPositionOffset = function() {

		var aOffset = [];

		if (this._oPosition.my && (this._oPosition.my.indexOf("+") >= 0 || this._oPosition.my.indexOf("-") >= 0)) {
			var aMy = this._oPosition.my.split(" ");
			var iIndex = aMy[0].indexOf("+");
			if (iIndex < 0) {
				iIndex = aMy[0].indexOf("-");
			}
			if (iIndex >= 0) {
				aOffset[0] = aMy[0].slice(iIndex);
			}

			iIndex = aMy[1].indexOf("+");
			if (iIndex < 0) {
				iIndex = aMy[1].indexOf("-");
			}
			if (iIndex >= 0) {
				aOffset[1] = aMy[1].slice(iIndex);
			}

		} else if (this._oPosition.offset) {
			aOffset = this._oPosition.offset.split(" ");
		}

		return aOffset;

	};

	/**
	 * Applies the given position to the Popup which is assumed to be currently open
	 *
	 * @param {object} oPosition position info object describing the desired position of the popup.
	 * @private
	 */
	Popup.prototype._applyPosition = function(oPosition) {
		var bRtl = Localization.getRTL();
		var $Ref = this._$();

		if ($Ref.length) {
			var oAt = oPosition.at;
			var oDomRef = $Ref.get(0);

			if (typeof (oAt) === "string") {
				oDomRef.style.display = "block";

				// reset the 'left' and 'right' position CSS to avoid changing the DOM size by setting both 'left' and 'right'.
				oDomRef.style.left = "";
				oDomRef.style.right = "";
				$Ref.position(this._resolveReference(this._convertPositionRTL(oPosition, bRtl))); // must be visible, so browsers can calculate its offset!
				this._fixPositioning(oPosition, bRtl);
			} else if (CSSSize.isValid(oAt.left) && CSSSize.isValid(oAt.top)) {
				$Ref.css({
					"left" : oAt.left,
					"top" : oAt.top
				});
			} else if (CSSSize.isValid(oAt.right) && CSSSize.isValid(oAt.top)) {
				$Ref.css({
					"right" : oAt.right,
					"top" : oAt.top
				});
			} else if (typeof (oAt.left) === "number" && typeof (oAt.top) === "number") {
				var domRef = $Ref[0];
				if (domRef && domRef.style.right) { // in some RTL cases leave the Popup attached to the right side of the browser window
					var width = $Ref[0].getBoundingClientRect().width;
					$Ref.css({
						"right" : (document.documentElement.clientWidth - (oAt.left + width)) + "px",
						"top" : oAt.top + "px"
					});
				} else {
					$Ref.css({
						"left" : oAt.left + "px",
						"top" : oAt.top + "px"
					});
				}
			}

			// remember given position for later redraws
			this._oLastPosition = oPosition;
			this._oLastOfRect = this._calcOfRect(oPosition.of);
		}
	};

	/**
	 * Calculates the rect information of the given parameter.
	 *
	 * @param {string| Element | jQuery |sap.ui.core.Element | Event | jQuery.Event} oOf the DOM Element, UI Element instance on which the calculation is done
	 * @returns {object} the rect information which contains the top, left, width, height of the given object. If Event or jQuery.Event type parameter is given, null is returned because there's no way to calculate the rect info based on an event object.
	 * @private
	 */
	Popup.prototype._calcOfRect = function(oOf){
		var oOfDom = this._getOfDom(oOf);

		if (oOfDom) {
			return jQuery(oOfDom).rect();
		}

		return null;
	};

	/**
	 * Get the DOM reference of the given parameter. The "of" parameter can be different types. This methods returns the referred DOM reference based on the given parameter. If Event or jQuery.Event type parameter is given, null is returned.
	 *
	 * @param {string| Element | jQuery |sap.ui.core.Element | Event | jQuery.Event} oOf the DOM Element, UI Element instance on which the calculation is done
	 * @returns {DomNode} the DOM reference calculated based on the given parameter. If Event, or jQuery Event type parameter is given, null is returned.
	 * @private
	 */
	Popup.prototype._getOfDom = function(oOf) {
		if (oOf instanceof jQuery.Event) {
			return null;
		}

		var $Of;

		if (typeof (oOf) === "string") {
			$Of = jQuery(document.getElementById(oOf));
		} else if (oOf instanceof jQuery) {
			$Of = oOf;
		} else {
			$Of = jQuery(oOf instanceof Element ? oOf.getDomRef() : oOf);
		}

		return $Of[0];
	};

	/**
	 * Converts a position string with RTL-independent settings like "begin top" or "end center" into a string understood by
	 * jQuery UI position() by replacing "begin" and "end" with the respective concrete value, depending on RTL settings.
	 * The returned object is a clone, the original is unchanged.
	 *
	 * @param {object} oPosition position info object describing position of the popup.
	 * @param {boolean} bRtl Determines if RTL <code>true</code> or LTR <code>false</code> mode is active
	 * @returns {object} The converted position info object
	 * @private
	 */
	Popup.prototype._convertPositionRTL = function(oPosition, bRtl) {
		var oFixedPos = Object.assign({}, oPosition); // don't modify the original object

		if (bRtl) {
			var bNewOffset = false;
			if (oFixedPos.my && (oFixedPos.my.indexOf("+") >= 0 || oFixedPos.my.indexOf("-") >= 0)) {
				// check if new jQuery-Ui (>1.9) offset is used
				bNewOffset = true;
			}

			if ((oFixedPos.offset || bNewOffset)
					&& ((oFixedPos.my.indexOf("begin") > -1) || (oFixedPos.my.indexOf("end") > -1))
					&& ((oFixedPos.at.indexOf("begin") > -1) || (oFixedPos.at.indexOf("end") > -1))) {
				if (bNewOffset) {
					var aMy = oFixedPos.my.split(" ");
					if (aMy.length == 2) {
						oFixedPos.my = "";
						if (aMy[0]) {
							if (aMy[0].indexOf("begin") > -1 || aMy[0].indexOf("end") > -1) {
								if (aMy[0].indexOf("+") > -1) {
									aMy[0] = aMy[0].replace("+", "-");
								} else if (aMy[0].indexOf("-") > -1) {
									aMy[0] = aMy[0].replace("-", "+");
								}
							}
							oFixedPos.my = aMy[0];
						}
						if (aMy[1]) {
							if (aMy[1].indexOf("begin") > -1 || aMy[1].indexOf("end") > -1) {
								if (aMy[1].indexOf("+") > -1) {
									aMy[1] = aMy[1].replace("+", "-");
								} else if (aMy[1].indexOf("-") > -1) {
									aMy[1] = aMy[1].replace("-", "+");
								}
							}
							if (aMy[0]) {
								oFixedPos.my = oFixedPos.my + " ";
							}
							oFixedPos.my = oFixedPos.my + aMy[1];
						}
					}
				} else {
					oFixedPos.offset = this._mirrorOffset(oFixedPos.offset);
				}
			}
			oFixedPos.my = oFixedPos.my.replace("begin", "right").replace("end", "left");
			oFixedPos.at = oFixedPos.at.replace("begin", "right").replace("end", "left");
		} else {
			oFixedPos.my = oFixedPos.my.replace("end", "right").replace("begin", "left");
			oFixedPos.at = oFixedPos.at.replace("end", "right").replace("begin", "left");
		}

		return oFixedPos;
	};

	/**
	 * Mirrors the given offset which is a string containing two integer numbers separated by whitespace.
	 * (=negates the first number)
	 *
	 * @param {string} sOffset the offset to be mirrored
	 * @returns {string} the mirrored offset
	 *
	 * @private
	 */
	Popup.prototype._mirrorOffset = function(sOffset) {
		var aOffset = String(sOffset).trim().split(/\s/);
		var posX = parseInt(aOffset[0]);
		return (-posX) + " " + aOffset[aOffset.length - 1]; // array could be longer than 2 with multiple whitespace characters
	};

	/**
	 * Changes the default positioning of the Popup ("left: ...px") to ("right: ...px"), maintaining the
	 * actual screen position, if the Popup should "grow to the left" when increasing in size.
	 * This is the case if:
	 * - LTR mode and horizontal alignment is right or end
	 * - RTL mode and horizontal alignment is right, begin or center
	 *
	 * @param {object} oPosition The position
	 * @param {boolean} bRtl Determines if RTL <code>true</code> or LTR <code>false</code> mode is active
	 * @private
	 */
	Popup.prototype._fixPositioning = function (oPosition, bRtl) {
		var sMy = oPosition.my;
		if (typeof (sMy) === "string") {
			if (Popup._isPositionFixingNeeded(sMy, bRtl)) {
				var $Ref = this._$();
				var fpRight = jQuery(window).width() - $Ref[0].getBoundingClientRect().width - $Ref.offset().left;
				$Ref.css({
					"right": fpRight + "px",
					"left": ""
				});
			}
		}
	};

	/**
	 * Determines if the position of the popup has to be fixed
	 *
	 * @param {sap.ui.core.Popup.Dock} sMy The "my" position value
	 * @param {boolean} bRtl Determines if RTL <code>true</code> or LTR <code>false</code> mode is active
	 * @returns {boolean} <code>true</code> if position fixing is needed, <code>false</code> if not
	 * @private
	 */
	Popup._isPositionFixingNeeded = function (sMy, bRtl) {
		return bRtl && ((sMy.indexOf("right") > -1) || (sMy.indexOf("begin") > -1) || (sMy.indexOf("center") > -1))
			|| !bRtl && ((sMy.indexOf("right") > -1) || (sMy.indexOf("end") > -1));
	};

	/**
	 * If the reference element is specified as an sap.ui.core.Element, then it is resolved to a DOM node.
	 *
	 * @param {object} oPosition position info object describing the desired position of the popup.
	 * @returns {object} resolved position info
	 * @private
	 */
	Popup.prototype._resolveReference = function(oPosition) {

		var oExtension,
			aProperties = ["of", "within"];

		aProperties.forEach(function(sProperty) {
			if ( oPosition[sProperty] instanceof Element ) {
				oExtension = oExtension || {};
				oExtension[sProperty] = oPosition[sProperty].getDomRef();
			}
		});

		return oExtension ? Object.assign({}, oPosition, oExtension) : oPosition;
	};

	/**
	 * Determines whether the Popup should have a shadow (in supporting browsers).
	 * This also affects a currently open popup.
	 *
	 * @param {boolean} bShowShadow whether to show a shadow
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Popup.prototype.setShadow = function(bShowShadow) {
		assert(typeof bShowShadow === "boolean", "bShowShadow must be boolean");
		this._bShadow = bShowShadow;
		if (this.eOpenState != OpenState.CLOSED) {
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
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Popup.prototype.setModal = function(bModal, sModalCSSClass) {
		assert(typeof bModal === "boolean", "bModal must be boolean");
		assert(!sModalCSSClass || typeof sModalCSSClass === "string", "sModalCSSClass must be empty or a string");

		var bOldModal = this._bModal;

		this._bModal = bModal;
		this._sModalCSSClass = sModalCSSClass;

		// update the blocklayer and autoclose handler when the popup is open
		if (this.isOpen()) {
			if (bOldModal !== bModal) {
				Popup._clearSelection();

				if (bModal) {
					this._setupUserSelection();
					this._showBlockLayer();
				} else {
					this._hideBlockLayer();
					this._restoreUserSelection();
				}

				if (this.touchEnabled && this._bAutoClose) {
					if (!bModal) {
						// register the autoclose handler when modal is set to false
						jQuery(document).on("touchstart mousedown", this._fAutoCloseHandler);
					} else {
						// deregister the autoclose handler when modal is set to true
						jQuery(document).off("touchstart mousedown", this._fAutoCloseHandler);
					}
				}
			}
		}
		return this;
	};

	/**
	 * Returns the value if a Popup is of modal type
	 *
	 * @return {boolean} bModal whether the Popup is of modal type
	 * @public
	 */
	Popup.prototype.getModal = function() {
		return this._bModal;
	};

	/**
	 * Sets the behavior of the popup for fast navigation (F6).
	 *
	 *  "NONE": Fast Navigation is disabled within the popup (default).
	 *  "DOCK": Fast Navigation is disabled within the popup. When a fast navigation is triggered the first element before/after the dock element in the
	 *          fast navigation chain will be focused. If the popup is modal, there is no dock element or the dock element is the document this option behaves like "NONE".
	 *  "SCOPE": Fast Navigation is enabled and cycles within the popup.
	 *
	 * @private
	 * @param {string} sMode the desired navigation mode
	 * @since 1.25.0
	 */
	Popup.prototype.setNavigationMode = function(sMode) {
		if (sMode != "NONE" && sMode != "DOCK" && sMode != "SCOPE") {
			this._sF6NavMode = "NONE";
		}
		this._sF6NavMode = sMode;
	};

	/**
	 * Used to specify whether the Popup should close as soon as
	 * - for non-touch environment: the focus leaves
	 * - for touch environment: user clicks the area which is outside the popup itself, the DOM element which the popup
	 *   aligns to (except document), and any extra popup content set by calling setExtraContent.
	 * @param {boolean} bAutoClose whether the Popup should close as soon as the focus leaves
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Popup.prototype.setAutoClose = function(bAutoClose) {
		assert(typeof bAutoClose === "boolean", "bAutoClose must be boolean");

		if (this.touchEnabled && this.isOpen() && this._bAutoClose !== bAutoClose) {
			if (!this._bModal) {
				if (bAutoClose) {
					//register the autoclose hanlder when autoclose is set to true
					jQuery(document).on("touchstart mousedown", this._fAutoCloseHandler);
				} else {
					//deregister the autoclose handler when autoclose is set to false
					jQuery(document).off("touchstart mousedown", this._fAutoCloseHandler);
				}
			}
		}

		this._bAutoClose = bAutoClose;
		return this;
	};

	/**
	 * Sets additional content that are considered part of the Popup.
	 *
	 * A popup with autoclose {@link #setAutoClose} enabled allows the focus to be moved into the extra content without
	 * closing itself.
	 *
	 * A popup with modal {@link #setModal} enabled allows the focus to be shifted into the extra content without taking it
	 * back to the previous focused element in the popup.
	 *
	 * @param {Element[]|sap.ui.core.Element[]|string[]} aContent An array containing DOM elements, sap.ui.core.Element
	 *  or an ID which are considered to be part of the Popup; a value of null removes all previous content
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.75
	 */
	Popup.prototype.setExtraContent = function(aContent) {
		// TODO: also handle the case when 'aContent' is set with null
		assert(Array.isArray(aContent), "Extra popup content must be an array which contains either sap.ui.core.Element, DOM Element or an ID");

		if (!this._aExtraContent) {
			this._aExtraContent = [];
		}

		var createDelegate = function (oElement) {
			return {
				/**
				 * @this {sap.ui.core.Popup}
				 * @private
				 */
				onBeforeRendering: function() {
					var oDomRef = oElement.getDomRef();
					if (oDomRef && this.isOpen()) {
						oDomRef.removeEventListener("blur", this.fnEventHandler, true);
					}
				},
				/**
				 * @this {sap.ui.core.Popup}
				 * @private
				 */
				onAfterRendering: function() {
					var oDomRef = oElement.getDomRef();
					if (oDomRef && this.isOpen()) {
						oDomRef.addEventListener("blur", this.fnEventHandler, true);
					}
				}
			};
		};

		var sId,
			oExtraContent,
			oDelegate,
			oExtraContentRef;

		for (var i = 0, l = aContent.length; i < l; i++) {
			oExtraContent = aContent[i];

			if (oExtraContent instanceof Element) {
				sId = oExtraContent.getId();
			} else if (typeof oExtraContent === "object") {
				sId = oExtraContent.id;
			} else if (typeof oExtraContent === "string") {
				sId = oExtraContent;
			}

			if (this.getChildPopups().indexOf(sId) === -1) {
				// when the autoclose area isn't registered, add it as a child popup and
				// also to _aExtraContent
				this.addChildPopup(sId);

				oExtraContentRef = {
					id: sId
				};

				if (oExtraContent instanceof Element) {
					oDelegate = createDelegate(oExtraContent);
					oExtraContent.addEventDelegate(oDelegate, this);
					oExtraContentRef.delegate = oDelegate;
				}

				this._aExtraContent.push(oExtraContentRef);
			}
		}

		return this;
	};

	/**
	 * Sets the animation functions to use for opening and closing the Popup. Any null value will be ignored and not change the respective animation function.
	 * When called, the animation functions receive three parameters:
	 * - the jQuery object wrapping the DomRef of the popup
	 * - the requested animation duration
	 * - a function that MUST be called once the animation has completed
	 *
	 * @param {function(jQuery, int, function())} fnOpen The function which executes the custom opening animation
	 * @param {function(jQuery, int, function())} fnClose The function  which executes the custom closing animation
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Popup.prototype.setAnimations = function(fnOpen, fnClose) {
		assert(fnOpen === null || typeof fnOpen === "function", "fnOpen must be a function");
		assert(fnClose === null || typeof fnClose === "function", "fnClose must be a function");

		if (fnOpen && (typeof (fnOpen) == "function")) {
			this._animations.open = fnOpen;
		}

		if (fnClose && (typeof (fnClose) == "function")) {
			this._animations.close = fnClose;
		}

		return this;
	};

	/**
	 * Sets the durations for opening and closing animations.
	 * Null values and values < 0 are ignored.
	 * A duration of 0 means no animation.
	 *
	 * @param {int} [iOpenDuration=jQuery.fx.speed.fast] in milliseconds
	 * @param {int} [iCloseDuration=jQuery.fx.speed.fast] in milliseconds
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Popup.prototype.setDurations = function(iOpenDuration, iCloseDuration) {
		assert(iOpenDuration === null || (typeof iOpenDuration === "number" && (iOpenDuration % 1 == 0)), "iOpenDuration must be null or an integer");
		assert(!iCloseDuration || (typeof iCloseDuration === "number" && (iCloseDuration % 1 == 0)), "iOpenDuration must be undefined or an integer");

		if ((iOpenDuration > 0) || (iOpenDuration === 0)) {
			this._durations.open = iOpenDuration;
		}

		if ((iCloseDuration > 0) || (iCloseDuration === 0)) {
			this._durations.close = iCloseDuration;
		}

		return this;
	};

	Popup.CLOSE_ON_SCROLL = "close_Popup_if_of_is_moved";

	/**
	 * Closes the popup instance
	 *
	 * @param {sap.ui.core.Popup.PositionInfo} oEventParameters The event parameters
	 * @private
	 */
	Popup.prototype._fnCloseOnScroll = function(oEventParameters) {
		this.close();
	};

	/**
	 * This enabled/disables the Popup to follow its opening reference. If the Popup is open and a followOf should
	 * be set the corresponding listener will be attached.
	 *
	 * @param {boolean|function(sap.ui.core.Popup.PositionInfo)|null} followOf a boolean value enabled/disables the default followOf-Handler. Or an individual handler can be given.
	 * null deletes all followOf settings.
	 * @since 1.13.0
	 * @public
	 */
	Popup.prototype.setFollowOf = function(followOf) {
		// deregister any listener to ensure that in every state of the Popup the correct listener is attached (or not)
		Popup.DockTrigger.removeListener(Popup.checkDocking, this);

		var bUpdateOfRect = false;
		this._bFollowOf = true;
		this._followOfHandler = null;

		if (typeof (followOf) === "function") {
			this._followOfHandler = followOf;
			bUpdateOfRect = true;
		} else if (typeof (followOf) === "boolean") {
			bUpdateOfRect = followOf;
		} else if (followOf === Popup.CLOSE_ON_SCROLL) {
			this._followOfHandler = this._fnCloseOnScroll;
			bUpdateOfRect = true;
		} else {
			this._bFollowOf = false;

			if (followOf !== null) {
				Log.error("Trying to set an invalid type to 'followOf: " + followOf);
			}
		}

		if (bUpdateOfRect && this._oLastPosition) {
			this._oLastOfRect = this._calcOfRect(this._oLastPosition.of);
		}

		if (this._bFollowOf && this.getOpenState() === OpenState.OPEN) {
			Popup.DockTrigger.addListener(Popup.checkDocking, this);
		}
	};

	/**
	 * Determines whether the Popup should auto closes or not.
	 *
	 * @returns {boolean} <code>true</code> if auto close is enabled, <code>false</code> if no auto close is configured for this popup instance
	 * @since 1.16
	 * @public
	 */
	Popup.prototype.getAutoClose = function() {
		return this._bAutoClose;
	};

	/**
	 * This returns true/false if the default followOf method should be used. If a separate followOf-handler was previously added
	 * the corresponding function is returned.
	 *
	 * @returns {boolean|function(sap.ui.core.Popup.PositionInfo)} if a function was set it is returned otherwise a boolean value whether the follow of is activated
	 * @since 1.13.0
	 * @public
	 */
	Popup.prototype.getFollowOf = function() {
		if (this._bFollowOf) {
			return typeof (this._followOfHandler) === "function" ? this._followOfHandler : true;
		}

		return false;
	};

	/**
	 * Returns whether the Popup is currently open (this includes opening and
	 * closing animations).
	 *
	 * @returns {boolean} whether the Popup is opened (or currently being
	 *                            opened or closed)
	 * @public
	 */
	Popup.prototype.isOpen = function() {
		return this.bOpen;
	};

	/**
	 * Returns whether the Popup is currently open, closed, or in a transition between these states.
	 *
	 * @returns {sap.ui.core.OpenState} whether the Popup is opened
	 * @public
	 */
	Popup.prototype.getOpenState = function() {
		return this.eOpenState;
	};

	/**
	 * Closes and destroys this instance of Popup.
	 * Does not destroy the hosted content.
	 * @public
	 */
	Popup.prototype.destroy = function() {
		// deregister resize handler
		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}

		// close the popup without any animation
		this.close(0);
		this.oContent = null;

		if (this._bFollowOf) {
			this.setFollowOf(null);
		}

		if (this._bEventBusEventsRegistered) {
			this._unregisterEventBusEvents();
		}

		// remove the top shield layer if the timer isn't done yet
		if (this._iTopShieldRemoveTimer) {
			clearTimeout(this._iTopShieldRemoveTimer);
			this.oShieldLayerPool.returnObject(this._oTopShieldLayer);
			this._oTopShieldLayer = null;
			this._iTopShieldRemoveTimer = null;
		}

		// remove the bottom shield layer if the timer isn't done yet
		if (this._iBottomShieldRemoveTimer) {
			clearTimeout(this._iBottomShieldRemoveTimer);
			this.oShieldLayerPool.returnObject(this._oBottomShieldLayer);
			this._oBottomShieldLayer = null;
			this._iBottomShieldRemoveTimer = null;
		}

		if (this._aExtraContent) {
			// remove registered delegate on autoclose areas
			var oElement;
			this._aExtraContent.forEach(function(oAreaRef) {
				if (oAreaRef.delegate) {
					oElement = Element.closestTo(document.getElementById(oAreaRef.id));
					if (oElement) {
						oElement.removeEventDelegate(oAreaRef.delegate);
					}
				}
			});
		}

		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	/**
	 * When the Popup is being destroyed all corresponding references should be
	 * deleted as well to prevent any memory leaks.
	 *
	 * @public
	 */
	Popup.prototype.exit = function() {
		delete this._mEvents;
	};

	/**
	 * Adds 'focus' event listeners to the popup
	 *
	 * @private
	 */
	Popup.prototype._addFocusEventListeners = function() {
		if (!this.fnEventHandler) {
			this.fnEventHandler = this.onFocusEvent.bind(this);
		}
		// make sure to notice all blur's in the popup
		var $PopupRoot = this._$();
		var aChildPopups = this.getChildPopups();
		var oDomRef = {};
		var i = 0, l = 0;

		if ($PopupRoot.length) {
			document.addEventListener("focus", this.fnEventHandler, true);
			$PopupRoot.get(0).addEventListener("blur", this.fnEventHandler, true);

			for (i = 0, l = aChildPopups.length; i < l; i++) {
				oDomRef = (aChildPopups[i] ? window.document.getElementById(aChildPopups[i]) : null);
				if (oDomRef) {
					oDomRef.addEventListener("blur", this.fnEventHandler, true);
				}
			}
		}
	};

	/**
	 * Removes the 'focus' event listeners from the popup
	 *
	 * @private
	 */
	Popup.prototype._removeFocusEventListeners = function() {
		var $PopupRoot = this._$(/* bForceReRender */false, /* bGetOnly */true);

		// if popup's content isn't rendered yet, focus vent listeners don't need to be removed
		if (!$PopupRoot.length) {
			return;
		}

		var aChildPopups = this.getChildPopups();
		var oDomRef = {};
		var i = 0, l = 0;

		document.removeEventListener("focus", this.fnEventHandler, true);
		$PopupRoot.get(0).removeEventListener("blur", this.fnEventHandler, true);

		for (i = 0, l = aChildPopups.length; i < l; i++) {
			oDomRef = (aChildPopups[i] ? window.document.getElementById(aChildPopups[i]) : null);
			if (oDomRef) {
				oDomRef.removeEventListener("blur", this.fnEventHandler, true);
			}

			this.closePopup(aChildPopups[i]);
		}
		this.fnEventHandler = null;
	};

	/**
	 * Registers the focus event listeners for autoclose and modal popup for both mobile and desktop devices.
	 */
	Popup.prototype._activateFocusHandle = function() {
		if (this._bModal || this._bAutoClose) { // initialize focus handling
			this._addFocusEventListeners();
		}

		//autoclose implementation for mobile or desktop browser in touch mode
		if (this.touchEnabled && !this._bModal && this._bAutoClose) {
			jQuery(document).on("touchstart mousedown", this._fAutoCloseHandler);
		}
	};

	/**
	 * Deregisters the focus event listeners for autoclose and modal popup for both mobile and desktop devices.
	 */
	Popup.prototype._deactivateFocusHandle = function() {
		if (this.fnEventHandler) { // remove focus handling
			this._removeFocusEventListeners();
		}

		//deregister the autoclose handler for mobile
		if (this.touchEnabled && !this._bModal && this._bAutoClose) {
			jQuery(document).off("touchstart mousedown", this._fAutoCloseHandler);
		}
	};

	/**
	 * Register popup events in the event bus
	 *
	 * @private
	 */
	Popup.prototype._registerEventBusEvents = function() {
		var that = this;

		each(that._mEvents, function(sEventId, fnListener) {
			oEventBus.subscribe("sap.ui", sEventId, fnListener, that);
		});

		this._bEventBusEventsRegistered = true;
	};

	/**
	 * Unregister popup events from the event bus
	 *
	 * @private
	 */
	Popup.prototype._unregisterEventBusEvents = function() {
		var that = this;

		each(that._mEvents, function(sEventId, fnListener) {
			oEventBus.unsubscribe("sap.ui", sEventId, fnListener, that);
		});

		delete this._bEventBusEventsRegistered;
	};

	/**
	 * This listener is called by the EventBus when an element-id should be added to the
	 * focusable area. The event is fired when a control publishes the corresponding event
	 * according to the channel id "sap.ui" with the event id:
	 * "sap.ui.core.Popup.addFocusableContent-<Popup-ID>". The Popup-id can be obtained by this._popupUID.
	 *
	 * @param {string} sChannel channel of the EventBus
	 * @param {string} sEvent name of the event
	 * @param {object} oEventData object with an id-property of the element which should be added to the focusable area
	 * @since 1.12.3
	 * @private
	 */
	Popup.prototype._addFocusableArea = function(sChannel, sEvent, oEventData) {
		if ( this.getChildPopups().indexOf(oEventData.id) === -1) {
			this.addChildPopup(oEventData.id);
		}
	};

	/**
	 * This listener is called by the EventBus when an element-ID should be removed from the
	 * focusable area. The event is fired when a control publishes the corresponding event
	 * according to the channel ID "sap.ui" with the event ID:
	 * "sap.ui.core.Popup.removeFocusableContent-<Popup-ID>". The Popup-ID can be obtained by this._popupUID.
	 *
	 * @param {string} sChannel channel of the EventBus
	 * @param {string} sEvent name of the event
	 * @param {Object} oEventData object with an id-property of the element which should be removed from the focusable area
	 * @since 1.17.0
	 * @private
	 */
	Popup.prototype._removeFocusableArea = function(sChannel, sEvent, oEventData) {
		this.removeChildPopup(oEventData.id);
	};

	/**
	 * This is the internal event listener that is called when a parent Popup closes its child
	 * Popups.
	 *
	 * @param {string} sChannel channel of the EventBus
	 * @param {string} sEvent name of the event
	 * @param {object} oEventData provides further attributes
	 */
	Popup.prototype._closePopup = function(sChannel, sEvent, oEventData) {
		this.close(typeof this._durations.close === "string" ? 0 : this._durations.close);
	};

	/**
	 * This adds the Popup's id to the given DOM-reference right into the HTML as
	 * an attribute to identify the Popup within the static UI-area.
	 *
	 * Additionally the corresponding event-listener is registered to the EventBus. The event is registered
	 * to the reserved channel "sap.ui" and is called "sap.ui.core.Popup.addFocusableContent-"
	 * with the corresponding Popup-ID.
	 * This event can be published via the EventBus to add a focusable DOM-element-ID to the focusable area when
	 * the Popup looses its focus.
	 *
	 * @param {jQuery} $Ref to which DOM-reference the Popup-ID should be added to
	 * @private
	 */
	Popup.prototype._setIdentity = function($Ref) {
		if (typeof $Ref === "object") {
			$Ref.attr("data-sap-ui-popup", this._popupUID);
		} else {
			Log.warning("Incorrect DomRef-type for 'setIdentity': " + $Ref, this);
			return;
		}

		if (!this._bEventBusEventsRegistered) {
			this._registerEventBusEvents();
		}
	};

	/**
	 * Returns the jQuery object containing the root of the content of the Popup
	 *
	 * @param {boolean} [bForceReRender] The content will be rendered again regardless of the render status. When it's set to true, the bGetOnly parameter is ignored.
	 * @param {boolean} [bGetOnly] Only returns the existing content DOM. When content isn't rendered yet, empty jQuery Object is returned.
	 * @returns {jQuery} the jQuery object containing the root of the content of the Popup
	 * @private
	 */
	Popup.prototype._$ = function(bForceReRender, bGetOnly){
		var $ContentRef;

		if (this.oContent instanceof Control) {
			$ContentRef = this.oContent.$();
			if (bForceReRender || ($ContentRef.length === 0 && !bGetOnly)) {
				Log.info("Rendering of popup content: " + this.oContent.getId());
				if ($ContentRef.length > 0) {
					RenderManager.preserveContent($ContentRef[0], /* bPreserveRoot */ true, /* bPreserveNodesWithId */ false);
				}
				new RenderManager().render(this.oContent, StaticArea.getDomRef());
				$ContentRef = this.oContent.$();
			}
		} else if (this.oContent instanceof Element) {
			$ContentRef = this.oContent.$();
		} else {
			$ContentRef = jQuery(this.oContent);
		}

		this._setIdentity($ContentRef);

		return $ContentRef;
	};

	/**
	 * The 'blockLayerStateChange' event is fired only in case of using modal popups and under certain conditions:
	 * <pre>
	 *  a. the first inserted modal popup in a popup stack opens
	 *  b. the first inserted modal popup in a popup stack closes
	 * </pre>
	 *
	 * @name sap.ui.core.Popup.blockLayerStateChange
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {boolean} oEvent.getParameters.visible Indicates whether a blocking layer is currently visible <code>visible: true</code>
	 *  or not <code>visible: false</code>
	 * @param {number} oEvent.getParameters.zIndex In case a blocking layer is visible, the <code>zIndex</code> property
	 *  will represent the zIndex at which the blocking layer is displayed.
	 *  In case of <code>visible: false</code>, <code>zIndex</code> represents the zIndex value of the last open popup.
	 * @static
	 * @public
	 */

	/**
	 * Triggers the static 'blockLayerStateChange' event with a given map of parameters.
	 *
	 * @param {object} mParams A map of parameters with which the event gets fired.
	 *
	 * @private
	 */
	function _fireBlockLayerStateChange (mParams) {
		if (Popup._blockLayerStateProvider) {
			Popup._blockLayerStateProvider.fireEvent("blockLayerStateChange", mParams);
		}
	}

	/**
	 * Attaches event handler <code>fnFunction</code> to the static {@link #.blockLayerStateChange blockLayerStateChange} event.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to a dummy event provider object.
	 *
	 * The event gets triggered in case of modal popups when the first of multiple popups opens and closes.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to a dummy event
	 *            provider object
	 * @public
	 */
	Popup.attachBlockLayerStateChange = function (oData, fnFunction, oListener) {
		if (!Popup._blockLayerStateProvider) {
			Popup._blockLayerStateProvider = new EventProvider();
		}
		Popup._blockLayerStateProvider.attachEvent("blockLayerStateChange", oData, fnFunction, oListener);
	};

	/**
	 * Removes a previously attached event handler <code>fnFunction</code> from the static
	 * {@link #.blockLayerStateChange blockLayerStateChange} event.
	 *
	 * The event gets triggered in case of modal popups when the first of multiple popups opens and closes.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 *
	 * @public
	 */
	Popup.detachBlockLayerStateChange = function (fnFunction, oListener) {
		if (Popup._blockLayerStateProvider) {
			Popup._blockLayerStateProvider.detachEvent("blockLayerStateChange", fnFunction, oListener);
		}
	};


	function connectBlockLayerAndWithin($BlockRef, oWithinDOMRef) {
		if (oWithinDOMRef === window) {
			clearSizeAndPosition($BlockRef);
			document.documentElement.classList.add("sapUiBLyBack");
		} else {
			adaptSizeAndPosition($BlockRef, oWithinDOMRef);
			oWithinDOMRef.classList.add("sapUiBLyBack");
			oResizeObserver.observe(oWithinDOMRef);
		}
	}

	function disconnectBlockLayerAndWithin(oWithinDOMRef) {
		if (oWithinDOMRef === window) {
			document.documentElement.classList.remove("sapUiBLyBack");
		} else {
			oWithinDOMRef.classList.remove("sapUiBLyBack");
			oResizeObserver.unobserve(oWithinDOMRef);
		}
	}

	Popup.prototype._extendFocusInfo = function(oEvent, oEventData) {
		var bExtended = false,
			sEventPrefix = "sap.ui.core.Popup.extendFocusInfo-",
			oData;

		if (oEvent instanceof Event) {
			// the call is from event provider
			oData = {
				info: oEventData.info,
				element: oEvent.getParameter("domRef")
			};
		} else {
			// the call is from the event bus
			oData = oEvent;
		}

		var oContent = this.getContent();
		var oContentDom = (oContent instanceof Element) ? oContent.getDomRef() : oContent;

		if (oContentDom && oContentDom.contains(oData.element)) {
			oData.info.preventScroll = true;
			bExtended = true;
		} else {
			var aChildPopups = this.getChildPopups();
			bExtended = aChildPopups.some(function(sChildID) {
				var sEventId = sEventPrefix + sChildID;
				oEventBus.publish("sap.ui", sEventId, oData);

				return oData.extended;
			});
		}

		return bExtended;
	};

	// Wrapper of _contains method for the event bus
	Popup.prototype._extendFocusInfoEventBusWrapper = function(sChannel, sEvent, oData) {
		oData.contains = this._extendFocusInfo(oData);
	};

	/**
	 * @private
	 */
	Popup.prototype._showBlockLayer = function() {
		var $BlockRef = jQuery("#sap-ui-blocklayer-popup"),
			sClassName = "sapUiBLy" + (this._sModalCSSClass ? " " + this._sModalCSSClass : ""),
			oWithinDOMRef;

		if ($BlockRef.length === 0) {
			$BlockRef = jQuery('<div id="sap-ui-blocklayer-popup" tabindex="0" class="' + sClassName + '"></div>');
			$BlockRef.appendTo(StaticArea.getDomRef());
		} else {
			$BlockRef.removeClass().addClass(sClassName);
		}

		// unregister the resize handler for the within area of the currently top most popup
		var oLastPopupInfo = Popup.blStack[Popup.blStack.length - 1];
		if (oLastPopupInfo) {
			oWithinDOMRef = convertWithin(oLastPopupInfo.popup._oLastPosition.within);
			disconnectBlockLayerAndWithin(oWithinDOMRef);
		}

		oWithinDOMRef = convertWithin(this._oLastPosition.within);
		connectBlockLayerAndWithin($BlockRef, oWithinDOMRef);

		// push current z-index to stack
		Popup.blStack.push({
			zIndex: this._iZIndex - 2,
			popup: this
		});

		$BlockRef.css({
			"z-index": this._iZIndex - 2,
			"visibility": "visible"
		}).show();

		if (!this.isInPopup(this._oLastPosition.of)) {
			this._bFocusExtenderAdded = true;
			FocusHandler.addFocusInfoExtender(this._extendFocusInfo, this);
		}

		if (Popup.blStack.length === 1) {
			_fireBlockLayerStateChange({
				visible: true,
				zIndex: Popup.blStack[0].zIndex
			});
		}
	};

	Popup.prototype._hideBlockLayer = function() {
		// a dialog was closed so pop his z-index from the stack
		var $BlockRef = jQuery("#sap-ui-blocklayer-popup"),
			oBlockLayerDomRef = $BlockRef[0],
			that = this,
			oLastPopupInfo, oWithinDOMRef;

		oWithinDOMRef = convertWithin(this._oLastPosition.within);
		disconnectBlockLayerAndWithin(oWithinDOMRef);

		if ($BlockRef.length) {
			if (this._bFocusExtenderAdded) {
				this._bFocusExtenderAdded = false;
				FocusHandler.removeFocusInfoExtender(this._extendFocusInfo, this);
			}

			// if there are more z-indices this means there are more dialogs stacked
			// up. So redisplay the block layer (with new z-index) under the new
			// current dialog which should be displayed.
			if (Popup.blStack.length > 1) {
				Popup.blStack = Popup.blStack.filter(function(oPopupInfo) {
					return oPopupInfo.popup !== that;
				});
				oLastPopupInfo = Popup.blStack[Popup.blStack.length - 1];
				// set the block layer z-index to the last z-index in the stack and show it
				oBlockLayerDomRef.style.zIndex = oLastPopupInfo.zIndex;

				oBlockLayerDomRef.style.visibility = "visible";
				oBlockLayerDomRef.style.display = "block";

				oWithinDOMRef = convertWithin(oLastPopupInfo.popup._oLastPosition.within);
				connectBlockLayerAndWithin($BlockRef, oWithinDOMRef);
			} else {
				oLastPopupInfo = Popup.blStack.pop();
				// the last dialog was closed so we can hide the block layer now
				oBlockLayerDomRef.style.visibility = "hidden";
				oBlockLayerDomRef.style.display = "none";


				_fireBlockLayerStateChange({
					visible: false,
					zIndex: oLastPopupInfo.zIndex
				});
			}
		}
	};

	/**
	 * Check if the focused element is still inside the Popup
	 *
	 * @returns {boolean} true if the focused element is still inside the Popup, otherwise returns false
	 * @private
	 */
	Popup.prototype._isFocusInsidePopup = function () {
		var oDomRef = this._$(false).get(0);

		if (oDomRef && oDomRef.contains(document.activeElement)) {
			return true;
		}

		return false;
	};

	//****************************************************
	//Handling of movement of the dock references
	//****************************************************
	Popup.DockTrigger = IntervalTrigger;

	Popup.checkDocking = function(){
		if (this.getOpenState() === OpenState.OPEN) {
			var oCurrentOfRef = this._getOfDom(this._oLastPosition.of),
				oCurrentOfRect;

			if (oCurrentOfRef) {
				if ((oCurrentOfRef === window) || (oCurrentOfRef === window.document) || document.documentElement.contains(oCurrentOfRef)) {
					// When the current Of reference is window or window.document or it's contained in the DOM tree,
					// The client bounding rect can be calculated
					oCurrentOfRect = jQuery(oCurrentOfRef).rect();
				} else if (oCurrentOfRef.id) {
					// Otherwise when the Of reference has an id,
					// the 'of' was re-rendered so the newest DOM-element has to be updated for the corresponding rect-object.
					// Because the id of the 'of' may be still the same but due to its re-rendering the reference changed and has to be updated
					var oNewestOf = window.document.getElementById(oCurrentOfRef.id);
					var oNewestOfRect = jQuery(oNewestOf).rect();

					// if there is a newest corresponding DOM-reference and it differs from the current -> use the newest one
					if (oNewestOfRect && !fnRectEqual(oCurrentOfRect, oNewestOfRect)) {
						oCurrentOfRect = oNewestOfRect;
						this._oLastPosition.of = oNewestOf;
					}
				}
			}

			// it's not possible to check for the width/height because the "of" could be window.document and the
			// document doesn't have a height/width
			if (!oCurrentOfRect) {
				this.close();
				return;
			} else if (oCurrentOfRect.left === 0 && oCurrentOfRect.top === 0 &&
					oCurrentOfRect.height === 0 && oCurrentOfRect.height === 0 &&
					this._oLastPosition.of.id) {
				// sometimes the "of" was re-rendered and therefore the new DOM-reference must be used for the checks.
				// An id is only ensured for controls and only those can be re-rendered
				this._oLastPosition.of = window.document.getElementById(this._oLastPosition.of.id);
				oCurrentOfRef = this._getOfDom(this._oLastPosition.of);
				oCurrentOfRect = jQuery(oCurrentOfRef).rect();

				if (!oCurrentOfRect) {
					this.close();
					return;
				}
			}

			/*
			 * It's possible that the triggering has already started since the listener is added in 'open' and the Popup hasn't opened yet.
			 * Therefore '_oLastOfRect' wasn't set due to the Popup didn't set it in '_applyPosition'.
			 */
			if (this._oLastOfRect) {
				if (!fnRectEqual(this._oLastOfRect, oCurrentOfRect)) {
					if (this._followOfHandler) {
						// provide the last position additionally if the call back needs it also
						// e.g. the Callout needs it => create deep copy of old positioning object
						var oLastPositionCopy = deepExtend({}, this._oLastPosition),
							oLastOfRectCopy = deepExtend({}, this._oLastOfRect);
						this._followOfHandler({
							lastPosition: oLastPositionCopy,
							lastOfRect: oLastOfRectCopy,
							currentOfRect: oCurrentOfRect
						});
					} else {
						this._applyPosition(this._oLastPosition);
					}
				}
			}
		}
	};

	//****************************************************
	//Focus Handling Delegate function for use with the given content (of type sap.ui.core.Element)
	//****************************************************

	/**
	 * Delegate function for handling of touchstart event on sap.ui.core.Elements as content
	 *
	 * This is a fix for preventing the Popup A from getting higher z-index than popup B when popup B is opened within popup A.
	 *
	 * Mousedown event is fired with 300ms delay and when the event is caught by popup A, the popup B is already opened. Therefore popup A increases its z-index to be on the front.
	 * When ontouchstart is called, the next mousedown event which comes with a 300ms delay will be ignored.
	 *
	 * @param {jQuery.Event} oEvent The event
	 * @private
	 */
	Popup.prototype.ontouchstart = function(oEvent){
		this.onmousedown(oEvent, true);
		// this marks that the onmousedown function is already called by listening to touchstart event on device which supports touchstart.
		// the onmousedown won't be called again by listening to mousedown event
		this._bMousedownCalled = true;
	};

	/**
	 * Delegate function for handling of mousedown event on sap.ui.core.Elements as content
	 *
	 * @param {jQuery.Event} oEvent The event
	 * @param {boolean} bSupressChecking Determines if the retrieved event was fired by another event with that no further checking is needed
	 * @private
	 */
	Popup.prototype.onmousedown = function(oEvent, bSupressChecking) {
		if (this._bMousedownCalled && !bSupressChecking) {
			//if onmousedown is already called, isn't needed to be called again.
			this._bMousedownCalled = false;
			return;
		}

		/*
		 *  If this Popup is 'uppermost' and therefore everything is ok.
		 *  Or if this is a modal Popup - its index has to be the 'uppermost'
		 *  otherwise there must be another issue with the modal-mode.
		 */
		if (this._iZIndex === this.getLastZIndex() || this.getModal()) {
			return;
		}

		this._increaseMyZIndex("", "mousedown", oEvent);
	};

	/**
	 * Increases the z-index of the popup
	 *
	 * @param {string} sChannel channel of the EventBus
	 * @param {string} sEvent name of the event
	 * @param {jQuery.Event} oEventData the object containing the event data
	 * @private
	 */
	Popup.prototype._increaseMyZIndex = function(sChannel, sEvent, oEventData) {
		var oParentPopup = this.getParentPopup(this._oLastPosition.of);

		/*
		 * Checks if the parent Popup should increase its z-index.
		 * If true then all child popups should increase their indexes accordingly
		 * to the parent popup.
		 */
		if (oEventData && oEventData.type === "mousedown" || oEventData && oEventData.isFromParentPopup || oParentPopup.length === 0) {
			this._iZIndex = this.getNextZIndex();

			var $Ref = this._$(/*bForceReRender*/ false, /*bGetOnly*/ true);
			$Ref.css("z-index", this._iZIndex);

			// only increase children's z-index if this function called via mousedown
			if (oEventData && !oEventData.type || oEventData && oEventData.type != "mousedown" || sEvent === "mousedown") {
				var aChildPopups = this.getChildPopups();
				for (var i = 0, l = aChildPopups.length; i < l; i++) {
					this.increaseZIndex(aChildPopups[i], /*bIsParent*/ true);
				}
			}
		} else if (oParentPopup.length > 0) {
			// call the parent popup to increase index
			var sPopupId = jQuery(oParentPopup.get(0)).attr("data-sap-ui-popup");
			this.increaseZIndex(sPopupId, /*bIsParent*/ false);
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
	Popup.prototype.onAfterRendering = function(){
		var oContent = this.getContent();
		var $Ref = oContent instanceof Element ? oContent.$() : jQuery(oContent);

		// TODO all stuff done in 'open' is destroyed if the content was rerendered
		$Ref.toggleClass("sapUiShd", this._bShadow);
		Popup._clearSelection();
		this._setupUserSelection();
		$Ref.css("position", "absolute");

		// set/update the identification properly
		this._setIdentity($Ref);

		// Ensure right position is used for this call
		var ref = $Ref[0];
		var left = ref.style.left;
		var right = ref.style.right;
		var top = ref.style.top;
		var bottom = ref.style.bottom;

		if (!(left && left != "auto" || right && right != "auto" || top && top != "auto" || bottom && bottom != "auto")) {
			Log.debug("reposition popup content " + $Ref.attr("id") + " at " + JSON.stringify(this._oLastPosition.at));
			this._applyPosition(this._oLastPosition);
		}

		$Ref.show().css({
			"visibility" : "visible",
			"z-index" : this._iZIndex
		});

		if (this.isOpen() && (this.getModal() || this.getAutoClose())) {
			// register the focus event listener again after rendering because the content DOM node is changed
			this._addFocusEventListeners();
		}

		this._$(false, true).on("keydown", this._F6NavigationHandler);
	};

	/**
	* Delegate function for onBeforeRendering.
	* @private
	*/
	Popup.prototype.onBeforeRendering = function() {
		// deregister resize handler
		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}

		if (this.isOpen() && (this.getModal() || this.getAutoClose())) {
			// deregister the focus event listener because the content DOM node is going to be deleted
			this._removeFocusEventListeners();
		}

		this._$(false, true).off("keydown", this._F6NavigationHandler);
	};

	/**
	 * Checks if the (optional) given jQuery-object or DOM-node is within a
	 * Popup. If no object is given the popup instance itself will be used
	 * to check.
	 *
	 * @param {jQuery|Node} [oObject=this] is an optional object that should be checked
	 * @returns {boolean} whether this control instance is part of a Popup
	 */
	Popup.prototype.isInPopup = function(oObject) {
		var $ParentPopup = this.getParentPopup(oObject);

		return $ParentPopup && $ParentPopup.length > 0;
	};

	/**
	 * This function returns the parent Popup if available.
	 *
	 * @param {sap.ui.core.Control}
	 *            [oControl=this] is an optional control instance. If another
	 *            instance than "this" is given the corresponding control
	 *            instance will be used to fetch the Popup.
	 * @returns {jQuery} [ParentPopup]
	 */
	Popup.prototype.getParentPopup = function(oControl) {
		// use either given object (control or DOM-ref) or this instance
		var oThis = oControl ? oControl : this;

		// if oThis is an element use its DOM-ref to look for a Popup. Else
		// 'oThis' is a DOM-ref therefore simply use it
		var $This = jQuery(oThis instanceof Element ? oThis.getDomRef() : oThis);

		// look up if there is a Popup above used DOM-ref
		return $This.closest("[data-sap-ui-popup]");
	};

	/**
	 * This returns the corresponding unique ID of the parent Popup.
	 *
	 * @param {sap.ui.core.Control}
	 *            [oControl=this] is an optional control instance. If another
	 *            instance than "this" is given the corresponding control
	 *            instance will be used to fetch the Popup.
	 * @returns {string} ParentPopupId
	 */
	Popup.prototype.getParentPopupId = function(oControl) {
		var $ParentPopup = this.getParentPopup(oControl);
		return $ParentPopup.attr("data-sap-ui-popup");
	};

	/**
	 * Adds the given child Popup id to the given parent's association.
	 *
	 * @param {string}
	 *            sParentPopupId to which the id will be added
	 * @param {string}
	 *            sChildPopupId that will be added to the parent Popup
	 */
	Popup.prototype.addChildToPopup = function(sParentPopupId, sChildPopupId) {
		var sEventId = "sap.ui.core.Popup.addFocusableContent-" + sParentPopupId;
		oEventBus.publish("sap.ui", sEventId, {
			id : sChildPopupId
		});
	};

	/**
	 * Removes the child Popup from the parent Popup. If a dedicated Popup id is given
	 * then the control will be removed accordingly from this Popup. Else
	 * the closest Popup will be used as parent.
	 *
	 * @param {string}
	 *        sParentPopupId from which parent Popup the child should be removed
	 * @param {string}
	 *        sChildPopupId which child popup should be removed
	 */
	Popup.prototype.removeChildFromPopup = function(sParentPopupId, sChildPopupId) {
		var sEventId = "sap.ui.core.Popup.removeFocusableContent-" + sParentPopupId;
		oEventBus.publish("sap.ui", sEventId, {
			id : sChildPopupId
		});
	};

	/**
	 * Closes a specific Popup when the control instance isn't available
	 *
	 * @param {string}
	 *            sPopupId of Popup that should be closed
	 */
	Popup.prototype.closePopup = function(sPopupId) {
		var sEventId = "sap.ui.core.Popup.closePopup-" + sPopupId;
		oEventBus.publish("sap.ui", sEventId);
	};

	/**
	 * This function calls a popup to increase its z-index
	 *
	 * @param {string}
	 *            sPopupId of Popup that should increase its z-index
	 * @param {boolean}
	 *            bIsParent marks if a parent Popup calls its child Popups
	 *            to increase their z-index
	 */
	Popup.prototype.increaseZIndex = function(sPopupId, bIsParent) {
		var sEventId = "sap.ui.core.Popup.increaseZIndex-" + sPopupId;
		oEventBus.publish("sap.ui", sEventId, {
			isFromParentPopup : bIsParent ? bIsParent : false
		});
	};

	/**
	 * This function helps Popup controls to enable a tabchaining within its
	 * content. For the commons.Dialog and ux3.ToolPopup there is a fake
	 * element at the beginning and at the end of the DOM-structure. These
	 * elements are used to enable a chaining. If these element are focused
	 * this function determines which element in the content or footer area
	 * has to be focused. Since those control have a content and footer area
	 * with buttons it has to be checked whether a button or content-element
	 * is available that can be focused.
	 *
	 * @param {object}
	 *            mParameters contain all necessary parameters
	 * @param {object}
	 *            mParameters.that is the control that calls this function.
	 *            Needed for debug logging info
	 * @param {object}
	 *            mParameters.event is the event that is being forwarded
	 *            from the
	 * @param {string}
	 *            mParameters.firstFocusable is the first focusable element
	 *            in the control
	 * @param {string}
	 *            mParameters.lastFocusable is the last focusable element in
	 *            the control
	 * @param {jQuery}
	 *            mParameters.$FocusablesContent are focusable elements in
	 *            the content area of the control
	 * @param {jQuery}
	 *            mParameters.$FocusablesFooter are focusable elements in
	 *            the footer area of the control (e.g. buttons)
	 */
	Popup.prototype.focusTabChain = function(mParameters) {
		var oSourceDomRef = mParameters.event.target,
			sName = mParameters.that.getMetadata().getName(),
			oFocusDomRef;

		if ((!mParameters.$FocusablesContent ||  !mParameters.$FocusablesFooter) ||
			 (!mParameters.$FocusablesContent.length && !mParameters.$FocusablesFooter.length)) {
			// if there is neither content nor footer content (yet) simply do nothing
			return;
		}
		/*
		 * It's not needed to check if buttons are set since
		 * jQuery(":focusable", this.$("fhfe")) or
		 * jQuery(":sapFocusable", this.$("fhfe"))
		 * returns an empty array. Therefore these elements won't be found
		 * via 'lastFocusableDomRef()'
		 */
		if (oSourceDomRef.id === mParameters.firstFocusable) {
			// the FocusHandlingFirstElement was focused and thus the focus
			// should move to the last element.
			Log.debug("First dummy focus element was focused", "", sName);
			if (mParameters.$FocusablesFooter.length > 0) {
				Log.debug("Last footer element will be focused", "", sName);
				oFocusDomRef = mParameters.$FocusablesFooter[mParameters.$FocusablesFooter.length - 1];
			} else {
				Log.debug("Last content element will be focused", "", sName);
				oFocusDomRef = mParameters.$FocusablesContent[mParameters.$FocusablesContent.length - 1];
			}
		} else if (oSourceDomRef.id === mParameters.lastFocusable) {
			// the FocusHandlingEndElement was focused and thus the focus
			// should move to the first element.
			Log.debug("Last dummy focus element was focues", "", sName);
			if (mParameters.$FocusablesContent.length > 0) {
				Log.debug("First content element will be focused", "", sName);
				oFocusDomRef = mParameters.$FocusablesContent[0];
			} else {
				Log.debug("First footer element will be focused", "", sName);
				oFocusDomRef = mParameters.$FocusablesFooter[0];
			}
		}

		if (oFocusDomRef) {
			setTimeout(function() {
				// if the element is a control the focus should be called
				// via the control
				// especially if the control has an individual focus DOM-ref
				var oControl = Element.getElementById(oFocusDomRef.id);
				if (oControl instanceof Control) {
					Log.debug("Focus will be handled by " + oControl.getMetadata().getName(), "", sName);
				} else {
					Log.debug("oFocusDomRef will be focused", "", sName);
				}
				if (oControl) {
					oControl.focus();
				} else if (oFocusDomRef) {
					oFocusDomRef.focus();
				}

				return oControl ? oControl.getId() : oFocusDomRef.id;
			}, 0);
		}
	};

	/**
	 * Marks the popup instance as user selectable
	 *
	 * @private
	 */
	Popup.prototype._setupUserSelection = function(){

		var $Ref = this._$(/* bForceReRender */false, /* bGetOnly */true);

		// mark the popup as user selectable
		Popup._markAsUserSelectable($Ref, /* bForce */this._bModal || Popup.blStack.length > 0);

		if (this._bModal){
			if (Popup.blStack.length > 0){
				// determine the last popup in the stack
				var oLastPopup = Popup.blStack[Popup.blStack.length - 1];

				var fnGetPopupId = function(oPopup){
					return oPopup.popup.getId();
				};

				if (Popup.blStack.map(fnGetPopupId).indexOf(this.getId()) === -1){
					// new current popup does not exist in the stack -> it will be added soon,
					// lets mark the last popup in the stack as explicitly not user selectable
					Popup._markAsNotUserSelectable(oLastPopup.popup._$(false, true), /* bForce */true);
				} else if (oLastPopup.popup.getId() !== this.getId()){
					// the current popup exists however its not at the top of the stack, so it should be marked as explicitly not user selectable
					Popup._markAsNotUserSelectable($Ref, /* bForce */true);
				}
			} else {
				// freeze the whole screen
				Popup._markAsNotUserSelectable(jQuery("html"), /* bForce */true);

				// mark the external content as user selectable
				Popup._markExternalContentAsUserSelectable(true);
			}
		}
	};

	/**
	 * Marks the popup instance as not user selectable
	 *
	 * @private
	 */
	Popup.prototype._restoreUserSelection = function(){

		var $Ref = this._$(/* bForceReRender */false, /* bGetOnly */true);

		// mark this popup as not longer forced user selectable
		Popup._markAsNotUserSelectable($Ref, /* bForce */false);

		if (Popup.blStack.length > 0) {
			// mark the next popup in the stack as user selectable
			Popup._markAsUserSelectable(Popup.blStack[Popup.blStack.length - 1].popup._$(false, true), /* bForce */true);
		} else {
			// unfreeze the whole document
			Popup._markAsUserSelectable(jQuery("html"), /* bForce */false);

			// mark the external content as not longer forced user selectable
			Popup._markExternalContentAsNotUserSelectable(false);
		}
	};

	/**
	 * @private
	 * @ui-restricted sap.m.Popover
	 */
	Popup.prototype.isTopmost = function() {
		return this._iZIndex === Popup.getLastZIndex();
	};

	/**
	 * Removes all selections from the window except if the selection is collapsed
	 *
	 * @private
	 */
	Popup._clearSelection = function(){
		// only clear the selection if it isn't collapsed e.g. the range contains only the cursor position
		var oSelection = document.getSelection();
		if (!oSelection.isCollapsed) {
			oSelection.removeAllRanges();
		}
	};

	/**
	 * Marks the given <code>$Ref</code> as user selectable
	 *
	 * @param {jQuery} $Ref The jQuery reference
	 * @param {boolean} bForce If the element should be marked explicitly as user selectable
	 * @private
	 */
	Popup._markAsUserSelectable = function($Ref, bForce){
		$Ref.removeClass("sapUiNotUserSelectable");
		if (bForce){
			$Ref.addClass("sapUiUserSelectable");
		}
	};

	/**
	 * Marks the given <code>$Ref</code> as not selectable
	 *
	 * @param {jQuery} $Ref The jQuery reference
	 * @param {boolean} bForce If the element should be marked explicitly as not user selectable
	 * @private
	 */
	Popup._markAsNotUserSelectable = function($Ref, bForce){
		$Ref.removeClass("sapUiUserSelectable");
		if (bForce){
			$Ref.addClass("sapUiNotUserSelectable");
		}
	};

	var oPopupExtraContentSelectorSet = new Set(),
		sDefaultSeletor = "[data-sap-ui-integration-popup-content]";

	// always add the default selector
	oPopupExtraContentSelectorSet.add(sDefaultSeletor);

	/**
	 * Adds a DOM query selector for determining additional external popup content.
	 *
	 * When the browser focus is switched from the main popup content (which is set by calling {@link #setContent}) to another
	 * DOM element, this DOM element is tested against the selector to determine:
	 *
	 *  <ul>
	 *  	<li>Autoclose popup: whether the popup should be kept open</li>
	 *  	<li>Modal popup: whether the focus is allowed to be taken away</li>
	 *  </ul>
	 *
	 * @param {string[]|string} vSelectors One query selector or an array of query selectors to be added
	 * @param {boolean} [bMarkAsSelectable=false] Whether the external content should be marked instantly as user selectable.
	 * 	If the external content which matches the given or default selector is added after a modal popup is opened,
	 *  this parameter needs to be set to <code>true</code> to make the external content user selectable.
	 * @public
	 * @since 1.75
	 */
	Popup.addExternalContent = function(vSelectors, bMarkAsSelectable) {
		if (!Array.isArray(vSelectors)) {
			vSelectors = [vSelectors];
		}

		vSelectors.forEach(Set.prototype.add.bind(oPopupExtraContentSelectorSet));

		if (bMarkAsSelectable){
			Popup.markExternalContentAsSelectable();
		}
	};

	/**
	 * Removes a DOM query selector which has been added by {@link sap.ui.core.Popup.addExternalContent}.
	 *
	 * The default query selector <code>[data-sap-ui-integration-popup-content]</code> can't be deleted.
	 *
	 * @param {string[]|string} vSelectors One query selector or an array of query selectors to be deleted
	 * @param {boolean} [bMarkAsNotSelectable=false] Whether the external content should be marked instantly as not user selectable.
	 * 	If the selector is removed while a modal popup is still open, this parameter needs to be set to <code>true</code>
	 *  to make the external content not user selectable.
	 * @public
	 * @since 1.75
	 */
	Popup.removeExternalContent = function(vSelectors, bMarkAsNotSelectable) {
		if (!Array.isArray(vSelectors)) {
			vSelectors = [vSelectors];
		}

		if (bMarkAsNotSelectable){
			Popup.markExternalContentAsNotSelectable();
		}

		vSelectors.forEach(function(sSelector) {
			// prevent the default selector from being deleted
			if (sSelector !== sDefaultSeletor) {
				oPopupExtraContentSelectorSet.delete(sSelector);
			}
		});
	};

	/**
	 * Marks the external content as user selectable
	 *
	 * @public
	 * @since 1.77
	 */
	Popup.markExternalContentAsSelectable = function() {
		Popup._clearSelection();
		if (Popup.blStack.length > 0){
			Popup._markExternalContentAsUserSelectable(true);
		}
	};

	/**
	 * Marks the external content as not user selectable
	 *
	 * @public
	 * @since 1.77
	 */
	Popup.markExternalContentAsNotSelectable = function() {
		Popup._clearSelection();
		if (Popup.blStack.length > 0){
			Popup._markExternalContentAsNotUserSelectable(false);
		}
	};

	/**
	 * Determines the external content which is associated to the UI5 popups
	 *
	 * @returns {jQuery[]} The array containing the jQuery references of all DOM elements which are marked as external content to the UI5 popups
	 * @private
	 */
	Popup._getExternalContent = function(){
		var aExternalContent = [];
		if (oPopupExtraContentSelectorSet.size > 0){
			oPopupExtraContentSelectorSet.forEach(function(sSelector){
				var $Ref = jQuery(sSelector);
				if ($Ref.length > 0){
					aExternalContent.push($Ref);
				}
			});
		}
		return aExternalContent;
	};

	/**
	 * Marks the external content as user selectable
	 *
	 * @param {boolean} bForce If the external content should be marked activly as user selectable
	 * @private
	 */
	Popup._markExternalContentAsUserSelectable = function(bForce){
		var aExternalContent = Popup._getExternalContent();
		aExternalContent.forEach(function($IntegratedPopupContent){
			Popup._markAsUserSelectable($IntegratedPopupContent, bForce);
		});
	};

	/**
	 * Marks the external content as not user selectable
	 *
	 * @param {boolean} bForce If the external content should be marked activly as not user selectable
	 * @private
	 */
	Popup._markExternalContentAsNotUserSelectable = function(bForce){
		var aExternalContent = Popup._getExternalContent();
		aExternalContent.forEach(function($IntegratedPopupContent){
			Popup._markAsNotUserSelectable($IntegratedPopupContent, bForce);
		});
	};

	/**
	 * Sets a within area that is used as the area available for positioning the popup. It mainly affects the collision
	 * detection. The position of the popup can then be further adapted depending on the "collision" parameter that is
	 * set with {@link sap.ui.core.Popup#open} or {@link sap.ui.core.Popup#setPosition} when the popup overflows the
	 * within area.
	 *
	 * If no within area is specified, all popups use the <code>window</code> as within area.
	 *
	 * When an {@link sap.ui.core.Element} is set as the within area, make sure that the control is rendered when the popup
	 * opens, otherwise the <code>window</code> is used as the within area.
	 *
	 * @param {string|Element|sap.ui.core.Element|Window} vValue The within area
	 * @public
	 * @since 1.89.0
	 */
	Popup.setWithinArea = function (vValue) {
		vGlobalWithinArea = vValue;
	};

	/**
	 * Returns the value that has been set by {@link sap.ui.core.Popup.setWithinArea}. When a DOM element that represents the
	 * within area is needed, use {@link sap.ui.core.Popup.getWithinAreaDomRef} instead.
	 *
	 * If no within area is specified, <code>undefined</code> is returned.
	 *
	 * @returns {string|Element|sap.ui.core.Element|Window} The specfied within area
	 * @public
	 * @since 1.89.0
	 */
	Popup.getWithinArea = function () {
		return vGlobalWithinArea;
	};

	/**
	 * Returns the actual DOM element of the value that has been set by {@link sap.ui.core.Popup.setWithinArea}. It
	 * returns <code>window</code> by default when no within area has been set using {@link sap.ui.core.Popup.setWithinArea}.
	 *
	 * When an {@link sap.ui.core.Element} is set as a within area, <code>document.documentElement</code> is returned before element is
	 * rendered.
	 *
	 * @returns {Element | Window} The DOM Element or the window object
	 * @public
	 * @since 1.89.0
	 */
	Popup.getWithinAreaDomRef = function () {
		return convertWithin(vGlobalWithinArea);
	};

	return Popup;
});
