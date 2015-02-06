/*!
 * ${copyright}
 */

// Provides control sap.ui.ux3.ToolPopup.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/IconPool', 'sap/ui/core/Popup', 'sap/ui/core/theming/Parameters', './library'],
	function(jQuery, Control, IconPool, Popup, Parameters, library) {
	"use strict";



	/**
	 * Constructor for a new ToolPopup.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A pop up which the user can open from the Shell's tool pane. Generally, the starting point would be an icon.
	 * For this pop up, buttons can be defined with any text; therefore, it has the same purpose and similar look like any common dialog box.
	 * A ToolPopup can have any content. Depending on the application type and design, the structure of the texts and input fields can be for
	 * example form-like.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.PopupInterface
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.ux3.ToolPopup
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ToolPopup = Control.extend("sap.ui.ux3.ToolPopup", /** @lends sap.ui.ux3.ToolPopup.prototype */ { metadata : {

		interfaces : [
			"sap.ui.core.PopupInterface"
		],
		library : "sap.ui.ux3",
		properties : {

			/**
			 * The title displayed in the pop up window
			 */
			title : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * This property is relevant for Shell-use:
			 * The URL to the icon displayed in the tool area which is used to open the ToolPopup. The recommended size is 32x32px, including some transparent border. Therefore, the content will cover about 20x20px.
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * This property is relevant for Shell-use:
			 * The URL to the icon in hover state, displayed in the tool area which is used to open the pop up.
			 */
			iconHover : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * This property is relevant for Shell-use:
			 * The URL to the icon in selected state displayed in the tool area which is used to open the pop up. If no selected icon is given, the hover icon is used.
			 */
			iconSelected : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * Whether the popup is modal and blocks any user-interaction with controls in the background.
			 * Changing this property while the ToolPopup is open is not allowed (and currently has no effect)
			 * Please don't use "modal" and "autoclose" at the same time. In this case a warning will be prompted to the console and "autoclose" won't be used.
			 */
			modal : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Specifies whether the ToolPopup has a dark or bright background. If set to true the background and borders will be dark. If false this stuff will be bright.
			 * This property only has an effect for the GoldReflection-theme.
			 * @since 1.11.1
			 */
			inverted : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * This property tells the ToolPopup to close itself if the ToolPopup looses the focus. If the user e.g. clicks outside of the ToolPopup it will be closed. Please don't use "modal" and "autoclose" at the same time. In this case a warning will be prompted to the console and "autoclose" won't be used.
			 * @since 1.13.2
			 */
			autoClose : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * This property can be used to force a maximum height of the ToolPopup in pixels. If the ToolPopup content is higher than the ToolPopup, the content will be scrollable.
			 * @since 1.13.2
			 */
			maxHeight : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * This property can be used to force a maximum width of the ToolPopup in pixels.
			 * @since 1.15.0
			 */
			maxWidth : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * Time in milliseconds for the open animation.
			 * @since 1.19.0
			 */
			openDuration : {type : "int", group : "Misc", defaultValue : 400},

			/**
			 * Time in milliseconds for the close animation.
			 * @since 1.19.0
			 */
			closeDuration : {type : "int", group : "Misc", defaultValue : 400}
		},
		defaultAggregation : "content",
		aggregations : {

			/**
			 * The buttons to appear in the pop up
			 */
			buttons : {type : "sap.ui.core.Control", multiple : true, singularName : "button"}, 

			/**
			 * The content of the pop up
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		},
		associations : {

			/**
			 * Defines the control that shall get the focus when the ToolPopup is opened.
			 */
			initialFocus : {type : "sap.ui.core.Control", multiple : false}, 

			/**
			 * This property is relevant for stand-alone-use:
			 * This association needs to be set if the ToolPopup should not be opened by/with the Shell. This association contains the instance of the control that assigns the ToolPopup's position.
			 */
			opener : {type : "sap.ui.core.Control", multiple : false}, 

			/**
			 * Defines one of the buttons that have been provided via button aggregation to be the default button. This default button is initially selected, if no control is set via the initialFocus association explicitly. The default button is activated when Enter is pressed in the context of the dialog and when the currently selected element does not handle the Enter event itself.
			 * @since 1.20.1
			 */
			defaultButton : {type : "sap.ui.core.Control", multiple : false}
		},
		events : {

			/**
			 * Event is fired when the pop up opens
			 */
			open : {}, 

			/**
			 * Event is fired when the pop up closes because the user pressed Escape or the ToolPopup Button in the Shell. This is called before the closing animation.
			 */
			close : {allowPreventDefault : true}, 

			/**
			 * Event is fired whenever the user clicks the Enter or the Return key inside the pop up
			 */
			enter : {
				parameters : {

					/**
					 * The onsapenter event, received by the pop up
					 */
					originalEvent : {type : "object"}, 

					/**
					 * The control that was focused when the user pressed the Enter key (may be null)
					 */
					originalSrcControl : {type : "sap.ui.core.Control"}
				}
			}, 

			/**
			 * Event is fired when one of the icon properties is modified (Note: The icon is not rendered by the ToolPopup).
			 * To be used by other controls which want to update the icon in their UI.
			 */
			iconChanged : {}, 

			/**
			 * This event is fired after the ToolPopup has finished its closing animation. It is called for EVERY close, regardless of whether the user has triggered the close or whether the ToolPopup was closed via API call.
			 */
			closed : {}, 

			/**
			 * Event is being fired after the ToolPopup has been opened.
			 * @since 1.19.0
			 */
			opened : {}
		}
	}});


	


	/**
	 * Opens the pop up.
	 *
	 * @name sap.ui.ux3.ToolPopup#open
	 * @function
	 * @param {string} sMy
	 *         The ToolPopup's content reference position for docking. This value is optional if the position of the ToolPopup is set via 'setPosition'.
	 * @param {string} sAt
	 *         The "of" element's reference point for docking to. This value is optional if the position of the ToolPopup is set via 'setPosition'.
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */


	


	


	/**
	 * Whether the ToolPopup is currently enabled or not.
	 * 
	 * Applications can't control the enabled state via a property. A ToolPopup is implicitly enabled while it is OPENING or OPEN. Descendant controls that honor the enabled state of their ancestors will appear disabled after the ToolPopup is closed.
	 *
	 * @name sap.ui.ux3.ToolPopup#getEnabled
	 * @function
	 * @type boolean
	 * @public
	 * @since 1.13.1
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */


	/**
	 * Add an identified area to the parent Popup as additional focusable area that can be used for an "autoclose" ToolPopup. This added area can be focused and prevent the ToolPopup from closing if the added area is outside of the ToolPopup.
	 *
	 * @name sap.ui.ux3.ToolPopup#addFocusableArea
	 * @function
	 * @param {string} sId
	 *         ID of a control or DOM-node
	 * @type void
	 * @public
	 * @since 1.19.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */


	/**
	 * Removes the control's or DOM-node's id from focusable areas.
	 *
	 * @name sap.ui.ux3.ToolPopup#removeFocusableArea
	 * @function
	 * @param {string} sId
	 *         ID of a control or DOM-node
	 * @type void
	 * @public
	 * @since 1.19.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */


	// regex rules for arrows corresponding to the given 'my' and 'at' parameters
	// these regexes also consider the new offset style of jQueryUI-position from version 1.10.x
	// from version 1.10.x the offset is used right within the 'my' parameter
	ToolPopup.ARROW_LEFT =  new RegExp(/my:(left|begin)([-+]\d*\%?)?\|[a-z]+([-+]\d*\%?)? at:(right|end)\|[a-z]+/);
	ToolPopup.ARROW_RIGHT = new RegExp(/my:(right|end)([-+]\d*\%?)?\|[a-z]+([-+]\d*\%?)? at:(left|begin)\|[a-z]+/);
	ToolPopup.ARROW_UP =    new RegExp(/my:[a-z]+([-+]\d*\%?)?\|top([-+]\d*\%?)? at:[a-z]+\|bottom/);
	ToolPopup.ARROW_DOWN =  new RegExp(/my:[a-z]+([-+]\d*\%?)?\|bottom([-+]\d*\%?)? at:[a-z]+\|top/);

	(function() {
	ToolPopup.prototype.init = function() {
		this.oPopup = null;
		this._bPositionSet = false;

		this._mParameters = {};
		this._mParameters.that = this;
		this._mParameters.firstFocusable = this.getId() + "-firstFocusable";
		this._mParameters.lastFocusable = this.getId() + "-lastFocusable";

		this._bFocusSet = false;
		this._proxyOpened = jQuery.proxy(fnPopupOpened, this);
		this._proxyClosed = jQuery.proxy(fnOnClosed, this);
		this._proxyFixSize = jQuery.proxy(fnFixSize, this);
	
		fnSetArrowDimensions(this);
	};
	ToolPopup.prototype.exit = function() {
		if (this.oPopup) {
			this.oPopup.detachOpened(this._proxyOpened);
			this.oPopup.detachClosed(this._proxyClosed);
			this.oPopup.destroy();
			delete this.oPopup;
		}
		delete this._bPositionSet;
		
		delete this._mParameters;

		delete this._bFocusSet;
		delete this._bPreventRestoreFocus;
		delete this._proxyOpened;
		delete this._proxyClosed;

		if (this._bBoundOnResize) {
			jQuery(window).unbind("resize", this._proxyFixSize);
		}

		delete this._bRTL;
		delete this._sArrowDir;
		delete this._oArrowIcon;
		delete this._bThemeInverted;
	
		delete this._sInitialFocusId;
	};
	
	/* 
	 * Checks if the ToolPopup already has a focused element. If not it's checked whether
	 * the fake-element should be used or if there is an element that could be focused instead
	 */
	var fnSetInitialFocus = function(that){
		var oElement = jQuery.sap.byId(that._mParameters.firstFocusable).get(0);
		var aFocusables = jQuery(":sapFocusable", that.$()).get();

		// if there is an initial focus it was already set to the Popup onBeforeRendering
		if (!that._bFocusSet) {
			// search the first focusable element
			if (aFocusables.length > 0) {
				for (var i = 0; i < aFocusables.length; i++) {
					if (aFocusables[i].id !== that._mParameters.firstFocusable && 
						aFocusables[i].id !== that._mParameters.lastFocusable) {

						oElement = aFocusables[i];
						break;
					}
				}
			}

			// If focusables are part of a control, focus the controls instead
			var oFocusControl = jQuery(oElement).control();
			if (oFocusControl[0]) {
				var oFocusDomRef = oFocusControl[0].getFocusDomRef();
				oElement = oFocusDomRef ? oFocusDomRef : oElement;
			}
		
			jQuery.sap.focus(oElement);
			that._sInitialFocusId = oElement.id;
		} else {
			that._sInitialFocusId = that.oPopup._sInitialFocusId;
		}
	};

	ToolPopup.prototype.onfocusin = function(oEvent){
		this._mParameters.event = oEvent;
		this._mParameters.$FocusablesContent = jQuery(":sapFocusable", this.$("content"));
		this._mParameters.$FocusablesFooter = jQuery(":sapFocusable", this.$("buttons"));

		this.oPopup.focusTabChain(this._mParameters);
	};

	/**
	 * This function fixes the height of the ToolPopup if the content is too large.
	 * So the height will be set to the possible maximum and a scrollbar is provided.
	 * Additionally the width of the ToolPopup is fixed as well since the scrollbar reduces
	 * the possible space for the content.
	 */
	var fnFixSize = function(){
		var $This = this.$();
		var iValue = 0;
	
		var sMaxHeight = this.getMaxHeight();
		var iMaxHeight = sMaxHeight ? parseInt(sMaxHeight, 10) : 0;
		
		/*
		 * Fix the width (if necessary)
		 */
		var sMaxWidth = this.getMaxWidth();
		if (sMaxWidth) {
			var iMaxWidth = parseInt(sMaxWidth, 10);
		
			var sBorderLeft = $This.css("border-left-width");
			var iBorderLeft = parseInt(sBorderLeft, 10);
			var sBorderRight = $This.css("border-right-width");
			var iBorderRight = parseInt(sBorderRight, 10);
		
			var sPaddingLeft = $This.css("padding-left");
			var iPaddingLeft = parseInt(sPaddingLeft, 10);
			var sPaddingRight = $This.css("padding-right");
			var iPaddingRight = parseInt(sPaddingRight, 10);
		
			iMaxWidth -= iBorderLeft + iPaddingLeft + iPaddingRight + iBorderRight;
			$This.css("max-width", iMaxWidth + "px");
		} else {
			$This.css("max-width", "");
		}
	
		/*
		 * Fix the height
		 */
		// get all paddings
		var sPaddingTop = $This.css("padding-top");
		var iPaddingTop = parseInt(sPaddingTop, 10);
		var sPaddingBottom = $This.css("padding-bottom");
		var iPaddingBottom = parseInt(sPaddingBottom, 10);
	
		// get all border widths
		var sBorderTop = $This.css("border-top-width");
		var iBorderTop = parseInt(sBorderTop, 10);
		var sBorderBottom = $This.css("border-bottom-width");
		var iBorderBottom = parseInt(sBorderBottom, 10);
	
		var iPaddings = iPaddingTop + iPaddingBottom + iBorderTop + iBorderBottom;
	
		// determine the corresponding scrollTop to calculate the proper bottom end of the ToolPopup
		var iScrollTop = jQuery(document).scrollTop();
		var oThisRect = $This.rect();
		var iBottomEnd = oThisRect.top - iScrollTop + $This.outerHeight(true);
	
		// only use this mechanism when there is NO maxHeight set
		var iWinHeight = jQuery(window).height();
		var bTooHigh = (iBottomEnd > iWinHeight) && (iMaxHeight === 0);
		var iYOffset = 0;
	
		// check if an offset forces the ToolPopup out of the window
		// and below the opener
		if (bTooHigh) {
			var $Opener = jQuery.sap.byId(this.getOpener());
			var oOpenerRect = $Opener.rect();
			var iOpenerBottom = oOpenerRect.top - iScrollTop + $Opener.outerHeight(true);
		
			// if bottom of the ToolPopup is below the opener and there is a possible offset
			var aOffset = this.oPopup._getPositionOffset();
			if (iBottomEnd > iOpenerBottom && aOffset.length > 0) {
				// check if the offset is responsible for pushing the ToolPopup below the opener
				// and therefore out of the window
				iYOffset = Math.abs(parseInt(aOffset[1], 10));

				// this check inverts the variable to prevent any resize of the ToolPopup since it
				// is pushed out of the window because of the offset
				if ((iBottomEnd - iYOffset) < iWinHeight) {
					bTooHigh = false;
					var sMessage = "Offset of " + iYOffset + " pushes ToolPopup out of the window";
					jQuery.sap.log.warning(sMessage, "", "sap.ui.ux3.ToolPopup");
				}
			}
		}
		
		if (!bTooHigh) {
			$This.toggleClass("sapUiUx3TPLargeContent", false);
		}
	
		if (iMaxHeight > 0) {
			$This.css("max-height", iMaxHeight + "px");
	
			var $Title = this.$("title");
			var $TitleSep = this.$("title-separator");
		
			var $Buttons = this.$("buttons");
			var $ButtonsSep = this.$("buttons-separator");
		
			// Calculate the correct start value. Either simply take the set maxHeight
			// or calculate the value between Popup.top and window end (incl. padding and offset)
			iValue = iMaxHeight > 0 ? iMaxHeight : iWinHeight - oThisRect.top - iPaddingBottom - iYOffset;
		
			// subtract all paddings and border-widths
			iValue -= iPaddings;
		
			// subtracting all corresponding values from top to down
			iValue -= $Title.outerHeight(true);
			iValue -= $TitleSep.outerHeight(true); // including margin
		
			// height of content needn't to be subtracted
		
			iValue -= $ButtonsSep.outerHeight(true); // including margin
			iValue -= $Buttons.length > 0 ? $Buttons.outerHeight(true) : 0;
		
			// if the height has to be corrected
			iValue = parseInt(iValue, 10);
		
			var $Content = this.$("content");
			$Content.css("max-height", iValue + "px");
		
			$Content.toggleClass("sapUiUx3TPLargeContent", true);
		}

		fnSetArrow(this);
	};

	/**
	 * Function is called via 'jQuery.proxy()' when the ToolPopup has been opened
	 * including the fade-in-animation of the Popup
	 */
	var fnPopupOpened = function(){
		fnSetInitialFocus(this);
		this._proxyFixSize();
	
		// forward the Popup's opened event accordingly
		// was added in "1.19.0" as a fix for a CSN and was downported to "1.18.2" and "1.16.6"
		this.fireOpened();
	};


	/**
	 * Returns whether the pop up is currently open
	 *
	 * @type boolean
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ToolPopup.prototype.isOpen = function() {
		if (this.oPopup && this.oPopup.isOpen()) {
			return true;
		}
		return false;
	};

	ToolPopup.prototype.willBeClosed = function() {
		var eState = this.oPopup && this.oPopup.getOpenState();
		return eState !== sap.ui.core.OpenState.OPENING && eState !== sap.ui.core.OpenState.OPEN;
	};

	/**
	 * This opens the ToolPopup. It is checked which control wants to open the ToolPopup. The Shell was previously set as parent so the
	 * corresponding parent element is used to set the correct position of the ToolPopup.
	 * If another control (i.e. a button) opens the ToolPopup, the control must be previously set as 'opener' via 'setOpener' to the
	 * ToolPopup. Corresponding to this opener the position of the ToolPopup will be set.
	 * It's also possible to set the position above, below or left from the opener. This can be done via the possible parameters 'my' and 'at'.
	 * These parameters refers to work the same way as they do of sap.ui.core.Popup.open.
	 *
	 * @param {sap.ui.core.Popup.Dock} [my=sap.ui.core.Popup.Dock.CenterCenter] the ToolPopup's content reference position for docking
	 * @param {sap.ui.core.Popup.Dock} [at=sap.ui.core.Popup.Dock.CenterCenter] the "of" element's reference point for docking to
	 * @public
	 */
	ToolPopup.prototype.open = function(my, at) {
		this._my = my;
		this._at = at;
		this._sArrowDir = fnGetArrowDirection(this);
		var $OpenerRef = null;
		this.sOffset = "";
		fnUpdateThemeInverted(this);

		// if the popup position has not been (re-)initialized since the last time this was opened, try to apply the default position
		if (!this._bPositionSet) {
			var iOffsetX = 0;
			var iOffsetY = 0;

			// any further validation of the values is done within the Popup
			if (!this._my) {
				this._my = Popup.Dock.BeginTop;
			}
			if (!this._at) {
				this._at = Popup.Dock.EndTop;
			}

			$OpenerRef = jQuery.sap.domById(this.getOpener());
			if ($OpenerRef) {
				switch (this._sArrowDir) {
					case "Up":
						iOffsetX = 0;
						iOffsetY = this.iArrowWidth;
						break;

					case "Down":
						iOffsetX = 0;
						iOffsetY = -this.iArrowWidth;
						break;

					case "Right":
						iOffsetX = -this.iArrowWidth;
						break;

					default:
					case "Left":
						iOffsetX = this.iArrowWidth;
						break;
				}

				iOffsetX = parseInt( iOffsetX, 10 );
				iOffsetY = parseInt( iOffsetY, 10 );
				this.sOffset = "" + iOffsetX + " " + iOffsetY;
				// my, at, of, offset, collision /*none*/
				this.setPosition(this._my, this._at, $OpenerRef, this.sOffset, "none");
			} else {
				this.setPosition(Popup.Dock.BeginTop, Popup.Dock.BeginTop, window, "0 0", "fit");
				jQuery.sap.log.warning("No opener set. Using a default position for Popup", "", "sap.ui.ux3.ToolPopup");
			}
			/* value is set in 'setPosition'. This value shows if the position was previously set manually =>
			 * in this case it was definitely not set manually
			 */
			this._bPositionSet = false;
		}
		// create popup if required
		this._ensurePopup();
	
		var bAutoClose = this.getAutoClose();
		var bModal = this.getModal();
		if (bAutoClose && bModal) {
			jQuery.sap.log.warning("A modal & autoclose ToolPopup will not work properly. Therefore 'autoclose' will be deactived!");
			bAutoClose = false;
		}
		this.oPopup.setAutoClose(bAutoClose);
		this.oPopup.setModal(bModal);

		// Save current focused element to restore the focus after closing the dialog
		this._oPreviousFocus = Popup.getCurrentFocusInfo();
		// open popup
		this.fireOpen();

		// the opener is needed for the intelligent arrow positioning
		fnCheckOpener(this);

		// function(iDuration, my, at, of, offset, collision /*empty to avoid any override*/, followOf /*true*/)
		this.oPopup.open(this.getOpenDuration(), this._my, this._at, $OpenerRef, this.sOffset, "", true);
		fnSetArrow(this);
	
		return this;
	};

	/**
	 * Checks if an opener was set. If not this functions tries to get the opener from the Popup. 
	 */
	var fnCheckOpener = function(oThis) {
		if (!oThis.getOpener()) {
			var sId = "";
			if (oThis.oPopup) {
				if (oThis.oPopup._oPosition.of instanceof sap.ui.core.Element) {
					sId = oThis.oPopup._oPosition.of.getId();
				} else {
					if (oThis.oPopup._oPosition.of.length > 0) {
						sId = oThis.oPopup._oPosition.of[0].id;
					} else {
						sId = oThis.oPopup._oPosition.of.id;
					}
				}
			}
		
			if (sId !== "") {
				oThis.setAssociation("opener", sId, true);
			} else {
				jQuery.sap.log.error("Neither an opener was set properly nor a corresponding one can be distinguished", "", "sap.ui.ux3.ToolPopup");
			}
		}
	};

	var fnSetArrowDimensions = function(oThis){
		var sParam = "sapUiUx3ToolPopupArrowWidth";
		oThis.sArrowWidth = Parameters.get(sParam);
		oThis.iArrowWidth = parseInt(oThis.sArrowWidth, 10);
	
		sParam = "sapUiUx3ToolPopupArrowHeight";
		oThis.sArrowHeight = Parameters.get(sParam);
		oThis.iArrowHeight = parseInt(oThis.sArrowHeight, 10);
	
		sParam = "sapUiUx3ToolPopupArrowRightMarginCorrection";
		oThis.sArrowPadding = Parameters.get(sParam);
		oThis.iArrowPadding = parseInt(oThis.sArrowPadding, 10);

		sParam = "sapUiUx3ToolPopupArrowRightMarginCorrectionInverted";
		oThis.sArrowPaddingInverted = Parameters.get(sParam);
		oThis.iArrowPaddingInverted = parseInt(oThis.sArrowPaddingInverted, 10);
	};

	/**
	 * Calculates the desired arrow direction related to the set docking. This only works when "my" and "at" both use the jQuery-based docking
	 * which means they are strings like "begin top".
	 *
	 * @private
	 */
	var fnGetArrowDirection = function(oThis) {

		// do not mirror the arrow direction here in RTL mode, because otherwise the offset is calculated wrong
		// (Because the offset mirroring happens inside popup)
		// the arrow is later mirrored at the output...

		// this is the default case if no match was found
		var sDirection = "Left";

		// if 'my' is not set check if it was previously set via 'setPosition'
		var my = oThis._my;
		var at = oThis._at;
		if (!my && oThis.oPopup) {
			my = oThis.oPopup._oPosition.my;
		}
		if (!at && oThis.oPopup) {
			at = oThis.oPopup._oPosition.at;
		}
	
		oThis._bHorizontalArrow = false;

		if (my && at) {
			var aMy = my.split(" ");
			var aAt = at.split(" ");
			// create a rule like "my:top|left at:left|top"
			var sRule = "my:" + aMy[0] + "|" + aMy[1];
			sRule += " at:" + aAt[0] + "|" + aAt[1];
		
			if (ToolPopup.ARROW_LEFT.exec(sRule)) {
				oThis._bHorizontalArrow = true;
				sDirection = "Left";
			} else if (ToolPopup.ARROW_RIGHT.exec(sRule)) {
				oThis._bHorizontalArrow = true;
				sDirection = "Right";
			} else if (ToolPopup.ARROW_UP.exec(sRule)) {
				sDirection = "Up";
			} else if (ToolPopup.ARROW_DOWN.exec(sRule)) {
				sDirection = "Down";
			}

			if (oThis.getDomRef() && oThis.isOpen()) {
				var $This = oThis.$();
				var oPopRect = $This.rect();
				var $Opener = jQuery.sap.byId(oThis.getOpener());
				var oOpenerRect = $Opener.rect();
			
				if (oOpenerRect) {
					// check if the ToolPopup was positioned at another side relative to the opener due to any collision.
					if (oThis._bHorizontalArrow) {
						// left/right arrow
						var iPopRight = oPopRect.left + $This.outerWidth(true) + oThis.iArrowWidth;
						var iOpenerRight = oOpenerRect.left + $Opener.outerWidth(true);
					
						if (iPopRight <= iOpenerRight) {
							sDirection = "Right";
						
						} else {
							sDirection = "Left";
						}
					} else {
					// up/down arrow
						var iPopBottom = oPopRect.top + $This.outerHeight(true) + oThis.iArrowWidth;
						var iOpenerBottom = oOpenerRect.top + $Opener.outerHeight(true);
					
						if (iPopBottom <= iOpenerBottom) {
							sDirection = "Down";
						} else {
							sDirection = "Up";
						}
					}
				}
			}
		}

		return sDirection;
	};

	/**
	 * Calculates the desired arrow position related to the set docking and to the size of the popup. 
	 * This only works when "my" and "at" both use the jQuery-based docking which means they are strings like "begin top".
	 * If there is no opener set properly an error is logged into the console and there will be no arrow for the ToolPopup.
	 *
	 * @private
	 */
	var fnSetArrow = function(oThis){
		if (!oThis.getDomRef()) {
			return;
		}

		var sKey = "";
		var iVal = 0;
		var iZero = 0; // this is the 0 of the  relative position between ToolPopup and Opener
		var iHalfArrow = oThis.iArrowHeight / 2;

		oThis._sArrowDir = fnGetArrowDirection(oThis);
		var sArrowDir = oThis._sArrowDir;
		if (oThis._bRTL) {
			// in RTL mode arrow must be mirrowed here
			if (oThis._sArrowDir === "Right") {
				sArrowDir = "Left";
			} else if (oThis._sArrowDir === "Left") {
				sArrowDir = "Right";
			}
		}

		var oPopRect = oThis.$().rect();
		var oOpenerRect = jQuery.sap.byId(oThis.getOpener()).rect();
		if (!oOpenerRect) {
			// if a proper opener isn't available
			jQuery.sap.log.warning("Opener wasn't set properly. Therefore arrow will be at a default position", "", "sap.ui.ux3.ToolPopup");
		}
		var $Arrow = oThis.$("arrow");

		// get the corresponding my-property
		if (!oThis._my && oThis.oPopup) {
			oThis._my = oThis.oPopup._oPosition.my;
		}

		// calculate the horizontal/vertical value of the arrow
		if (oThis._bHorizontalArrow) {
			// left or right arrow
			sKey = "top";

			if (oOpenerRect) {
				iZero = oOpenerRect.top - oPopRect.top;

				iVal = Math.round(iZero + oOpenerRect.height / 2);

				// if the position would exceed the ToolPopup's height
				iVal = iVal + iHalfArrow > oPopRect.height ? iVal - oThis.iArrowHeight : iVal;
			}
		} else {
			// up/down arrow
			sKey = "left";

			if (oOpenerRect) {
				iZero = oOpenerRect.left - oPopRect.left;
				if (iZero < 0) {
					iZero = oPopRect.width - oThis.iArrowHeight;
				}

				iVal = Math.round(iZero + oOpenerRect.width / 2);
				// if the position would exceed the ToolPopup's width
				iVal = iVal + iHalfArrow > oPopRect.width ? iVal - oThis.iArrowHeight : iVal;
			}
		}

		if (oOpenerRect) {
			iVal -= iHalfArrow;
		} else {
			iVal =  oThis.iArrowHeight;
		}


		// set the corresponding classes
		var sClassAttr = "";
		if ($Arrow.hasClass("sapUiUx3TPNewArrow")) {
			sClassAttr = "sapUiUx3TPNewArrow sapUiUx3TPNewArrow";
		} else {
			sClassAttr = oThis.isInverted() ? "sapUiUx3TPArrow sapUiTPInverted sapUiUx3TPArrow" : "sapUiUx3TPArrow sapUiUx3TPArrow";
		}
		$Arrow.attr("class", sClassAttr + sArrowDir);

		if (sArrowDir === "Right" ) {
			var iWidth = oPopRect.width;
			// if the ToolPopup is invertable and it is being inverted use another
			// value since in such a case the padding is different for the arrow
			if (oThis.isInverted()) {
				iWidth += oThis.iArrowPaddingInverted;
			} else {
				iWidth += oThis.iArrowPadding;
			}
		
			oThis._bRTL = sap.ui.getCore().getConfiguration().getRTL();
			if (oThis._bRTL) {
				$Arrow.css("right", iWidth + "px");
			} else {
				$Arrow.css("left", iWidth + "px");
			}
		} else {
			$Arrow.css({
				"left" : "",
				"right" : ""
			});
		}

		iVal = parseInt(iVal, 10);
		iVal = iVal < 0 ? 0 : iVal;
		if (iVal > 0) {
			iVal -= 2; // due to some padding
			// only correct corresponding position if there is something to correct
			// otherwise the default position is used (via styling)
			$Arrow.css(sKey, iVal + "px");
		}
	};
	/**
	 * Handles the sapescape event, triggers closing of the ToolPopup.
	 *
	 * @private
	 */
	ToolPopup.prototype.onsapescape = function() {
		if (this.fireClose()) {
			this.close();
		}
	};

	/**
	 * This function is called when the Popup has been closed. No matter if through the "close"-function
	 * or through the autoClose-mechanism.
	 * Additionally it is necessary to restore the focus as if the ToolPopup was closed via "close()".
	 * If the corresponding suppress-parameter was given to "close" no focus will be restored.
	 */
	var fnOnClosed = function(oEvent) {
		if (!this._bPreventRestoreFocus) {
			Popup.applyFocusInfo(this._oPreviousFocus);
		}
		this.fireClosed();
	};


	/**
	 * Closes the pop up. Can be called by the Shell when the pop up's button is clicked again; or by the application
	 * when the interaction in the pop up has been completed or canceled.
	 *
	 * @param {boolean} bPreventRestoreFocus
	 *         If set, the focus is NOT restored to the element that had the focus before the ToolPopup was opened. This makes sense when the ToolPopup is closed programmatically from a different area of the application (outside the ToolPopup) and the focus should not move aways from that place.
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ToolPopup.prototype.close = function(bPreventRestoreFocus) {
		if (this.oPopup && this.oPopup.isOpen()) {
			if (this._bBoundOnResize) {
				jQuery(window).unbind("resize", this._proxyFixSize);
				delete this._bBoundOnResize;
			}

			this.oPopup.close(this.getCloseDuration());
			this._bPreventRestoreFocus = bPreventRestoreFocus;
		}
		return this;
	};

	/**
	 * Whether the ToolPopup is currently enabled or not.
	 * 
	 * Applications can't control the enabled state via a property. A ToolPopup is implicitly 
	 * enabled depending on its <code>openStatey</code>. Descendant controls that honor the 
	 * enabled state of their ancestors will appear disabled after the ToolPopup is closed.
	 * 
	 * @experimental Whether a dialog is regarded as "enabled" during the state transitions 
	 * (OPENING, CLOSING) is not fully decided. Currently, it is enabled during the OPENING phase 
	 * and disabled during the CLOSING phase. The only potential change would be to treat the 
	 * OPENING phase as disabled as well. Applications should be prepared to receive events from
	 * "enabled" controls after they called open() on the dialog until close() is called on it.
	 * If the mentioned potential change should happen, the dialog will become enabled only 
	 * after the transition to OPEN. Events from "enabled" children then can still only arrive 
	 * between open() and close(), so applications that obey the previous rule should continue 
	 * to work. Only end users or code that explicitly triggers pseudo user events would notice
	 * a difference. <br>
	 * A second aspect that might change is the visual behavior of the content: during the CLOSING 
	 * phase it 'looks' enabled but in fact it is already disabled. This avoids unnecessary redraws 
	 * for content that becomes hidden soon. Should this show to be confusing for end users, it might 
	 * be changed.
	 * 
	 * @since: 1.13.1
	 * @return {boolean} whether the ToolPopup is currently enabled or not.
	 * @public
	 */
	ToolPopup.prototype.getEnabled = function() {
		var eState = this.oPopup ? this.oPopup.getOpenState() : sap.ui.core.OpenState.CLOSED; // assuming that a ToolPopup without a Popup can’t be open

		//TODO the check for state OPENING is a compromise. Without that, the content of the dialog will render 
		// in disabled state but will be enabled. As an alternative, the dialog could render again after OPEN is reached
		// and after switching to CLOSING (to properly reflect the changed enabled state in the descendants) 
		return eState === sap.ui.core.OpenState.OPENING || eState === sap.ui.core.OpenState.OPEN;
	};

	ToolPopup.prototype.onsapenter = function(oEvent) {
		// See open-method
		var sInitFocus = this.getDefaultButton();
		var oFocusCtrl = sap.ui.getCore().byId(sInitFocus);

		// trigger the default button if it exists and is inside the Dialog
		if (sInitFocus && oFocusCtrl && jQuery.contains(this.getDomRef(), oFocusCtrl.getDomRef())) {
			// Okay, we have the control
			if (oFocusCtrl instanceof sap.ui.commons.Button) {
				var $FocusCtrl = oFocusCtrl.$();
				$FocusCtrl.click();
				$FocusCtrl.focus();
			}
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	ToolPopup.prototype.onBeforeRendering = function() {
		var sInitialFocusId = this.getInitialFocus();
		var sDefaultButtontId = this.getDefaultButton();
		this._bFocusSet = true;
	
		if (sInitialFocusId) {
			this.oPopup.setInitialFocusId(sInitialFocusId);
		} else if (sDefaultButtontId) {
			this.oPopup.setInitialFocusId(sDefaultButtontId);
		} else {
			this._bFocusSet = false;
		}
	
		this._bRTL = sap.ui.getCore().getConfiguration().getRTL();
	};

	ToolPopup.prototype._ensurePopup = function() {
		if (!this.oPopup) {
			this.oPopup = new Popup(this, false, true, false);
			this.oPopup.attachOpened(this._proxyOpened);
			this.oPopup.attachClosed(this._proxyClosed);

			var that = this;
			this.oPopup._applyPosition = function(){
				Popup.prototype._applyPosition.apply(that.oPopup, arguments);

				var of = that.oPopup._oLastPosition.of;
				if (!of) {
					// In case setPosition is called from the outside and the opener has
					// been removed, this leads to closing the ToolPopup instead of causing
					// an error
					that.oPopup.close();
				} else {
					var $of = jQuery.sap.byId(of.id);
					// only after an open popup the corresponding arrow can be determined
					// if the position was set manually
					if (that._bPositionSet) {
						// shell stuff should still use the left arrow
						if (!$of.hasClass("sapUiUx3ShellTool")) {
							that._my = that.oPopup._oLastPosition.my;
							that._at = that.oPopup._oLastPosition.at;
						}
					}
					fnSetArrow(that);
				}
			};
		}
		return this.oPopup;
	};


	/**
	 * Sets the position of the pop up, the same parameters as for sap.ui.core.Popup can be used.
	 *
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ToolPopup.prototype.setPosition = function() {
		this._ensurePopup();
		this.oPopup.setPosition.apply(this.oPopup, arguments);
		this._bPositionSet = true;
	
		fnCheckOpener(this);
	
		return this;
	};

	var fnRenderContent = function(oThis) {
		var oContentDomRef = oThis.getDomRef("content");
		oContentDomRef.innerHTML = "";
	
		var aContent = oThis.getContent();
		var rm = sap.ui.getCore().createRenderManager();
	
		for (var i = 0; i < aContent.length; i++) {
			rm.renderControl(aContent[i]);
		}
	
		rm.flush(oContentDomRef, true);
		rm.destroy();
	
		// this fixes the height of the ToolPopup if the height exceeds the window height
		oThis._proxyFixSize();
	};
	var fnRenderButtons = function(oThis) {
		var oButtons = oThis.getDomRef("buttons");
		var oSeparator = oThis.getDomRef("buttons-separator");
		var aButtons = oThis.getButtons();
	
		if (aButtons.length === 0) {
			jQuery(oButtons).addClass("sapUiUx3TPButtonRowHidden");
			jQuery(oSeparator).addClass("sapUiUx3TPButtonRowHidden");
		} else {
			jQuery(oButtons).removeClass("sapUiUx3TPButtonRowHidden");
			jQuery(oSeparator).removeClass("sapUiUx3TPButtonRowHidden");
			oButtons.innerHTML = "";
			var rm = sap.ui.getCore().createRenderManager();
		
			for (var i = 0; i < aButtons.length; i++) {
				rm.renderControl(aButtons[i]);
			}
		
			rm.flush(oButtons, true);
			rm.destroy();
		
			// this fixes the height of the ToolPopup if the height exceeds the window height
			oThis._proxyFixSize();
		}
	};

	ToolPopup.prototype.addContent = function(oContent) {
		this.addAggregation("content", oContent, true);
	
		if (this.isOpen()) {
			fnRenderContent(this);
			fnSetArrow(this);
		}
	
		return this;
	};
	ToolPopup.prototype.insertContent = function(oContent, index) {
		this.insertAggregation("content", oContent, index, true);
	
		if (this.isOpen()) {
			fnRenderContent(this);
			fnSetArrow(this);
		}
	
		return this;
	};
	ToolPopup.prototype.removeContent = function(oContent) {
		this.removeAggregation("content", oContent, true);
	
		if (this.isOpen()) {
			fnRenderContent(this);
			fnSetArrow(this);
		}
	
		return this;
	};
	ToolPopup.prototype.addButton = function(oButton) {
		this.addAggregation("buttons", oButton, true);
	
		if (this.isOpen()) {
			fnRenderButtons(this);
			fnSetArrow(this);
		}
	
		return this;
	};
	ToolPopup.prototype.insertButton = function(oButton, index) {
		this.insertAggregation("buttons", oButton, index, true);
	
		if (this.isOpen()) {
			fnRenderButtons(this);
			fnSetArrow(this);
		}
	
		return this;
	};
	ToolPopup.prototype.removeButton = function(oButton) {
		this.removeAggregation("button", oButton, true);
	
		if (this.isOpen()) {
			fnRenderButtons(this);
			fnSetArrow(this);
		}
	
		return this;
	};

	/**
	 * This updates the instance's parameter if the ToolPopup is inverted per default
	 *
	 * @private
	 */
	var fnUpdateThemeInverted = function(oThis) {
		var sParam = "sapUiUx3ToolPopupInverted";
	
		sParam = Parameters.get(sParam);
		oThis._bThemeInverted = sParam === "true";
	};

	/**
	 * @private
	 */
	ToolPopup.prototype.onThemeChanged = function() {
		fnUpdateThemeInverted(this);
	};

	/**
	 * This checks if the ToolPopup is inverted. This depends on the parameter
	 * 'inverted' and the LESS-parameter 'sapUiUx3ToolPopupInverted' in the current
	 * theme. 
	 * 
	 * @return {sap.ui.core.boolean} whether the ToolPopup is inverted
	 * @private
	 */
	ToolPopup.prototype.isInverted = function() {
		fnUpdateThemeInverted(this);
		return this.getInverted() && this._bThemeInverted;
	};

	/**
	 * This is just a forward to the Popup's function (sap.ui.core.Popup.setAutoCloseAreas)
	 * with the same functionality.
	 * 
	 * @param {Element[]} aAutoCloseAreas
	 * @public
	 * @since: 1.19.0
	 */
	ToolPopup.prototype.setAutoCloseAreas = function(aAutoCloseAreas) {
		this._ensurePopup();
		return this.oPopup.setAutoCloseAreas(aAutoCloseAreas);
	};

	/**
	 * Adds an ID to the Popup that should be focusable as well when using 'autoclose'.
	 * Chaining is only possible if a valid type (string) is given.
	 * 
	 * @param {sap.ui.core.string} [sID] of the corresponding element that should be focusable as well
	 * @since: 1.19.0
	 * @public
	 */
	ToolPopup.prototype.addFocusableArea = function(sID) {
		this._ensurePopup();

		if (typeof (sID) === "string") {
			// channelId & eventId are mandatory dummy values
			this.oPopup._addFocusableArea("channelId", "eventId", {
				id : sID
			});
			return this;
		} else {
			jQuery.sap.log.error("Wrong type of focusable area ID - string expected", "", "sap.ui.ux3.ToolPopup");
		}
	};

	/**
	 * Removes an ID to the Popup that should be focusable as well when using 'autoclose'.
	 * Chaining is only possible if a valid type (string) is given.
	 * 
	 * @param {sap.ui.core.string} [sID] of the corresponding element
	 * @since: 1.19.0
	 * @public
	 */

	ToolPopup.prototype.removeFocusableArea = function(sID) {
		this._ensurePopup();
	
		if (typeof (sID) === "string") {
			// channelId & eventId are mandatory dummy values
			this.oPopup._removeFocusableArea("channelId", "eventId", {
				id : sID
			});
			return this;
		} else {
			jQuery.sap.log.error("Wrong type of focusable area ID - string expected", "", "sap.ui.ux3.ToolPopup");
		}
	};
	}());

	ToolPopup.prototype.setIcon = function(sIcon) {
		this.setProperty("icon", sIcon, true); // rerendering makes no sense, as this icon is not rendered by the ToolPopup
		this.fireIconChanged(); // tell other interested parties to update the icon
		return this;
	};
	ToolPopup.prototype.setIconHover = function(sIconHover) {
		this.setProperty("iconHover", sIconHover, true); // rerendering makes no sense, as this icon is not rendered by the ToolPopup
		this.fireIconChanged(); // tell other interested parties to update the icon
		return this;
	};
	ToolPopup.prototype.setIconSelected = function(sIconSelected) {
		this.setProperty("iconSelected", sIconSelected, true); // rerendering makes no sense, as this icon is not rendered by the ToolPopup
		this.fireIconChanged(); // tell other interested parties to update the icon
		return this;
	};
	ToolPopup.prototype.getIconSelected = function() {
		return this.getProperty("iconSelected") || this.getProperty("iconHover"); // implement the documented fallback
	};

	ToolPopup.prototype.setMaxWidth = function(sMaxWidth) {
		var pattern = /[0-9]+px/;
	
		if (pattern.test(sMaxWidth)) {
			this.setProperty("maxWidth", sMaxWidth);
		} else {
			jQuery.sap.log.error("Only values in pixels are possible", "", "sap.ui.ux3.ToolPopup");
		}
	};

	return ToolPopup;

}, /* bExport= */ true);
