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
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.TextArea</code> enables multi-line text input.
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
			 * Defines the number of visible text lines for the control.
			 * <b>Note:</b> The <code>height</code> property wins over the <code>rows</code> property, if both are set.
			 */
			rows : {type : "int", group : "Appearance", defaultValue : 2},

			/**
			 * Defines the visible width of the control, in average character widths.
			 * <b>Note:</b> The <code>width</code> property wins over the <code>cols</code> property, if both are set.
			 */
			cols : {type : "int", group : "Appearance", defaultValue : 20},

			/**
			 * Defines the height of the control.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

			/**
			 * Defines the maximum number of characters that the <code>value</code> can be.
			 */
			maxLength : {type : "int", group : "Behavior", defaultValue : 0},

			/**
			 * Indicates how the control wraps the text, e.g. <code>Soft</code>, <code>Hard</code>, <code>Off</code>.
			 */
			wrapping : {type : "sap.ui.core.Wrapping", group : "Behavior", defaultValue : sap.ui.core.Wrapping.None},

			/**
			 * Indicates when the <code>value</code> property gets updated with the user changes. Setting it to <code>true</code> updates the <code>value</code> property whenever the user has modified the text shown on the text area.
			 * @since 1.30
			 */
			valueLiveUpdate : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Indicates the ability of the control to automatically grow and shrink dynamically with its content.
			 * <b>Note:</b> The <code>height</code> property is ignored, if this property set to <code>true</code>.
			 * @since 1.38.0
			 */
			growing : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Defines the maximum number of lines that the control can grow.
			 * @since 1.38.0
			 */
			growingMaxLines : {type : "int", group : "Behavior", defaultValue : 0}
		},
		events : {

			/**
			 * Is fired whenever the user has modified the text shown on the text area.
			 */
			liveChange : {
				parameters : {

					/**
					 * The new <code>value</code> of the control.
					 */
					value : {type : "string"}
				}
			}
		}
	}});

	TextArea.prototype.exit = function() {
		InputBase.prototype.exit.call(this);
		jQuery(window).off("resize.sapMTextAreaGrowing");
	};

	// Attach listeners on after rendering and find iscroll
	TextArea.prototype.onAfterRendering = function() {
		InputBase.prototype.onAfterRendering.call(this);

		if (this.getGrowing()) {
			// adjust textarea height
			var oTextArea = this.getFocusDomRef();
			if (this.getGrowingMaxLines() > 0) {
				var oStyle = window.getComputedStyle(oTextArea),
					fMaxHeight = parseFloat(oStyle.lineHeight) * this.getGrowingMaxLines() +
								parseFloat(oStyle.paddingTop) + parseFloat(oStyle.borderTopWidth) + parseFloat(oStyle.borderBottomWidth);

				// bottom padding is out of scrolling content in firefox
				if (sap.ui.Device.browser.firefox) {
					fMaxHeight += parseFloat(oStyle.paddingBottom);
				}

				oTextArea.style.maxHeight = fMaxHeight + "px";
			}

			this._adjustHeight(oTextArea);
		}

		if (!sap.ui.Device.support.touch) {
			return;
		}

		// check behaviour mode
		var $TextArea = this.$("inner");
		if (this._behaviour.INSIDE_SCROLLABLE_WITHOUT_FOCUS) {

			// Bind browser events to mimic native scrolling
			$TextArea.on("touchstart", jQuery.proxy(this._onTouchStart, this));
			$TextArea.on("touchmove", jQuery.proxy(this._onTouchMove, this));
		} else if (this._behaviour.PAGE_NON_SCROLLABLE_AFTER_FOCUS) {

			// stop bubbling to disable preventDefault calls
			$TextArea.on("touchmove", function(e) {
				if ($TextArea.is(":focus")) {
					e.stopPropagation();
				}
			});
		}
	};

	// overwrite the input base enter handling for change event
	TextArea.prototype.onsapenter = function(oEvent) {
		oEvent.setMarked();
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
		var oTextArea = this.getFocusDomRef();
		return oTextArea ? oTextArea.value : this.getProperty("value");
	};

	// mark the event that it is handled by the textarea
	TextArea.prototype.onsapnext = function(oEvent) {
		oEvent.setMarked();
	};

	// mark the event that it is handled by the textarea
	TextArea.prototype.onsapprevious = function(oEvent) {
		oEvent.setMarked();
	};

	TextArea.prototype.oninput = function(oEvent) {
		InputBase.prototype.oninput.call(this, oEvent);
		if (oEvent.isMarked("invalid")) {
			return;
		}

		var oTextArea = this.getFocusDomRef(),
			sValue = oTextArea.value,
			iMaxLength = this.getMaxLength();

		// some browsers do not respect to maxlength property of textarea
		if (iMaxLength > 0 && sValue.length > iMaxLength) {
			sValue = sValue.substring(0, iMaxLength);
			oTextArea.value = sValue;
		}

		// update value property if needed
		if (this.getValueLiveUpdate()) {
			this.setProperty("value", sValue, true);

			// get the value back maybe there is a formatter
			sValue = this.getValue();
		}

		// handle growing
		if (this.getGrowing()) {
			this._adjustHeight(oTextArea);
		}

		this.fireLiveChange({
			value: sValue,

			// backwards compatibility
			newValue: sValue
		});
	};

	TextArea.prototype.setGrowing = function(bGrowing) {
		this.setProperty("growing", bGrowing);
		if (this.getGrowing()) {
			jQuery(window).on("resize.sapMTextAreaGrowing", this._updateOverflow.bind(this));
		} else {
			jQuery(window).off("resize.sapMTextAreaGrowing");
		}
		return this;
	};

	TextArea.prototype._adjustHeight = function(oTextArea) {
		oTextArea.style.height = sap.ui.Device.browser.firefox ? "0px" : "auto";
		oTextArea.style.height = oTextArea.scrollHeight + oTextArea.offsetHeight - oTextArea.clientHeight - 1 + "px";
		this._updateOverflow();
	};

	TextArea.prototype._updateOverflow = function() {
		var oTextArea = this.getFocusDomRef();
		var fMaxHeight = parseFloat(window.getComputedStyle(oTextArea)["max-height"]);
		oTextArea.style.overflowY = (oTextArea.scrollHeight > fMaxHeight) ? "auto" : "";
	};

	TextArea.prototype._getInputValue = function(sValue) {
		sValue = InputBase.prototype._getInputValue.call(this, sValue);
		return sValue.replace(/\r\n/g, "\n");
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

		var oTextArea = this.getFocusDomRef(),
			iPageY = oEvent.touches[0].pageY,
			iScrollTop = oTextArea.scrollTop,
			bTop = iScrollTop <= 0,
			bBottom = iScrollTop + oTextArea.clientHeight >= oTextArea.scrollHeight,
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

	// Flag for the Fiori Client on Windows Phone
	var _bMSWebView = sap.ui.Device.os.windows_phone && (/MSAppHost/i).test(navigator.appVersion);

	/**
	 * Special handling for the focusing issue in SAP Fiori Client on Windows Phone.
	 *
	 * @private
	 */
	TextArea.prototype.onfocusin = function(oEvent) {
		var scrollContainer,
			$this = this.$();

		InputBase.prototype.onfocusin.apply(this, arguments);

		// Workaround for the scroll-into-view bug in the WebView Windows Phone 8.1
		// As the browser does not scroll the window as it should, scroll the parent scroll container to make the hidden text visible

		function scrollIntoView() {
			jQuery(window).scrollTop(0);
			scrollContainer.scrollTop($this.offset().top - scrollContainer.offset().top + scrollContainer.scrollTop());
		}

		if (_bMSWebView && $this.height() + $this.offset().top > 260) {
			for (scrollContainer = $this.parent(); scrollContainer[0]; scrollContainer = scrollContainer.parent()) {
				if (scrollContainer.css("overflow-y") == "auto") {
					// make sure to have enough padding to be able to scroll even the bottom control to the top of the screen
					scrollContainer.children().last().css("padding-bottom", jQuery(window).height() + "px");
					// do scroll
					window.setTimeout(scrollIntoView, 100);
					return;
				}
			}
		}
	};

	return TextArea;

}, /* bExport= */ true);
