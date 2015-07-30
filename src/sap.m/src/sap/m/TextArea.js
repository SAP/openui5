/*!
 * ${copyright}
 */

// Provides control sap.m.TextArea.
sap.ui.define(['jquery.sap.global', './InputBase', './library'],
	function(jQuery, InputBase, library) {
	"use strict";


	
	/**
	 * Constructor for a new TextArea.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Enable users to input multi-line text.
	 * @extends sap.m.InputBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.0
	 * @alias sap.m.TextArea
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TextArea = InputBase.extend("sap.m.TextArea", /** @lends sap.m.TextArea.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Specifies the height of the text area (in lines).
			 */
			rows : {type : "int", group : "Appearance", defaultValue : 2},
	
			/**
			 * Specifies the width of the textarea (in average character width).
			 */
			cols : {type : "int", group : "Appearance", defaultValue : 20},
	
			/**
			 * Defines the height of the textarea with CSS. This property can overwrite the rows property.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
	
			/**
			 * Maximum number of characters that user can input. If your value property's length bigger than maxLength then value is not truncated and user can see whole value property but cannot write anymore.
			 */
			maxLength : {type : "int", group : "Behavior", defaultValue : 0},
	
			/**
			 * The wrap attribute specifies how the text in a text area is to be wrapped when submitted in a form. Possible values are: Soft, Hard, Off.
			 */
			wrapping : {type : "sap.ui.core.Wrapping", group : "Behavior", defaultValue : null},
	
			/**
			 * Indicates when the value gets updated with the user changes: At each keystroke (true) or first when the user presses enter or tabs out (false).
			 * @since 1.30
			 */
			valueLiveUpdate : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		events : {
	
			/**
			 * This event is fired when the value of the input is changed - e.g. at each keypress
			 */
			liveChange : {
				parameters : {
	
					/**
					 * The new value of the textarea.
					 */
					value : {type : "string"}
				}
			}
		}
	}});
	
	// Attach listeners on after rendering and find iscroll
	TextArea.prototype.onAfterRendering = function() {
		InputBase.prototype.onAfterRendering.call(this);
	
		// touch browser behaviour differs
		if (sap.ui.Device.support.touch) {
	
			// check behaviour mode
			if (this._behaviour.INSIDE_SCROLLABLE_WITHOUT_FOCUS) {
	
				// Bind browser events to mimic native scrolling
				this._$input.on("touchstart", jQuery.proxy(this._onTouchStart, this));
				this._$input.on("touchmove", jQuery.proxy(this._onTouchMove, this));
			} else if (this._behaviour.PAGE_NON_SCROLLABLE_AFTER_FOCUS) {
	
				// stop bubbling to disable preventDefault calls
				this._$input.on("touchmove", function(e) {
					if (jQuery(this).is(":focus")) {
						e.stopPropagation();
					}
				});
			}
		}
	};
	
	// overwrite the input base enter handling for change event
	TextArea.prototype.onsapenter = function(oEvent) {
	};
	
	// Overwrite input base revert handling for escape 
	// to fire own liveChange event and property set
	TextArea.prototype.onValueRevertedByEscape = function(sValue) {
		// update value property if needed
		if (this.getValueLiveUpdate()) {
			this.setProperty("value", sValue, true);

			// get the value back maybe there is a formatter
			sValue = this.getValue();
		}
		
		this.fireLiveChange({
			value: sValue,

			// backwards compatibility
			newValue: sValue
		});
	};
	
	/**
	 * Getter for property <code>value</code>.
	 * Defines the value of the control's input field.
	 *
	 * Default value is <code>undefined</code>
	 *
	 * @return {string} the value of property <code>value</code>
	 * @public
	 */
	TextArea.prototype.getValue = function() {
		var oDomRef = this.getFocusDomRef();
		return oDomRef ? oDomRef.value : this.getProperty("value");
	};
	
	TextArea.prototype.oninput = function(oEvent) {
		InputBase.prototype.oninput.call(this, oEvent);
		if (oEvent.isMarked("invalid")) {
			return;
		}

		var sValue = this._$input.val(),
			iMaxLength = this.getMaxLength();
	
		// some browsers do not respect to maxlength property of textarea
		if (iMaxLength > 0 && sValue.length > iMaxLength) {
			sValue = sValue.substring(0, iMaxLength);
			this._$input.val(sValue);
		}
		
		// update value property if needed
		if (this.getValueLiveUpdate()) {
			this.setProperty("value", sValue, true);

			// get the value back maybe there is a formatter
			sValue = this.getValue();
		}
		
		this.fireLiveChange({
			value: sValue,

			// backwards compatibility
			newValue: sValue
		});
	};
	
	/**
	 * Some browsers let us to scroll inside of the textarea without focusing.
	 * Android is very buggy and no touch event is publishing after focus.
	 * Android 4.1+ has touch events but page scroll is not possible after
	 * we reached the edge(bottom, top) of the textarea
	 *
	 * @private
	 */
	TextArea.prototype._behaviour = (function(oDevice) {
		return {
			INSIDE_SCROLLABLE_WITHOUT_FOCUS : oDevice.os.ios || oDevice.os.blackberry || oDevice.browser.chrome,
			PAGE_NON_SCROLLABLE_AFTER_FOCUS : oDevice.os.android && oDevice.os.version >= 4.1
		};
	}(sap.ui.Device));
	
	
	/**
	 * On touch start get iscroll and save starting point
	 *
	 * @private
	 * @param {jQuery.EventObject} oEvent The event object
	 */
	TextArea.prototype._onTouchStart = function(oEvent) {
		var oTouchEvent = oEvent.touches[0];
		this._iStartY = oTouchEvent.pageY;
		this._iStartX = oTouchEvent.pageX;
		this._bHorizontalScroll = undefined;
	
		// disable swipe handling of jQuery-mobile since it calls preventDefault
		// on touchmove and this can break the scrolling nature of the textarea
		oEvent.setMarked("swipestartHandled");
	};
	
	
	/**
	 * Touch move listener doing native scroll workaround
	 *
	 * @private
	 * @param {jQuery.EventObject} oEvent The event object
	 */
	TextArea.prototype._onTouchMove = function(oEvent) {
	
		var oDomRef = this._$input[0],	// textarea dom reference
			iPageY = oEvent.touches[0].pageY,
			iScrollTop = oDomRef.scrollTop,
			bTop = iScrollTop <= 0,
			bBottom = iScrollTop + oDomRef.clientHeight >= oDomRef.scrollHeight,
			bGoingUp = this._iStartY > iPageY,
			bGoingDown =  this._iStartY < iPageY,
			bOnEnd = bTop && bGoingDown || bBottom && bGoingUp;
	
		if (this._bHorizontalScroll === undefined) { // check once
			this._bHorizontalScroll = Math.abs(this._iStartY - iPageY) < Math.abs(this._iStartX - oEvent.touches[0].pageX);
		}
	
		if (this._bHorizontalScroll || !bOnEnd) {
	
			// to prevent the rubber-band effect we are calling prevent default on touchmove
			// from jquery.sap.mobile but this breaks the scrolling nature of the textarea
			oEvent.setMarked();
		}
	};

	return TextArea;

}, /* bExport= */ true);
