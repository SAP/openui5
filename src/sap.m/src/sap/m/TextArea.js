/*!
 * ${copyright}
 */

// Provides control sap.m.TextArea.
sap.ui.define([
	'./InputBase',
	'./Text',
	'sap/ui/core/ResizeHandler',
	'./library',
	'sap/ui/core/library',
	'sap/ui/events/KeyCodes',
	'sap/ui/Device',
	"sap/base/security/encodeXML",
	'./TextAreaRenderer',
	"sap/ui/thirdparty/jquery"
],
function(
	InputBase,
	Text,
	ResizeHandler,
	library,
	coreLibrary,
	KeyCodes,
	Device,
	encodeXML,
	TextAreaRenderer,
	jQuery
) {
	"use strict";



	// shortcut for sap.ui.core.Wrapping
	var Wrapping = coreLibrary.Wrapping;



	/**
	 * Constructor for a new TextArea.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that is used for multi-line input of text.
	 * <h3>Overview</h3>
	 * The text area is used to enter multiple lines of text. When empty, it can hold a placeholder similar to an {@link sap.m.Input input}.
	 * You can define the height and width of the text area and also determine specific behavior when handling long texts.
	 * <h3>Structure</h3>
	 * Parameters that determine the size:
	 * <ul>
	 * <li><code>rows</code> - Number of visible text lines (overruled by <code>height</code>, if both are set)</li>
	 * <li><code>cols</code> - Number of visible characters per line line (overruled by <code>width</code>, if both are set)</li>
	 * <li><code>height</code> - Height of the control</li>
	 * <li><code>width</code> - Width of the control</li>
	 * </ul>
	 * Parameters that determine the behavior:
	 * <ul>
	 * <li><code>growing</code> - The text area adjusts its size based on the content</li>
	 * <li><code>growingMaxLines</code> - Threshold for the <code>growing</code> property (shouldn't exceed the screen size)</li>
	 * <li><code>maxLength</code> - Maximum number of characters that can be entered in a text area</li>
	 * <li><code>wrapping</code> - The way the entered text is wrapped by the control</li>
	 * <li><code>showExceededText</code> - Determines how text beyond the <code>maxLength</code> length is handled</li>
	 * </ul>
	 * <h3>Usage</h3>
	 * <h4>When to use</h4>
	 * <ul>
	 * <li>You want to enter multiple lines of text.</li>
	 * <li>Always provide labels for a text area.</li>
	 * <li>A placeholder does not substitute a label.</li>
	 * </ul>
	 * <h3>Responsive Behavior</h3>
	 * <ul>
	 * <li>On smaller screens, you can scroll down the text area to see the entire text. To indicate that the text continues, the control shows only half of the last line.</li>
	 * <li>If you have a growing text area, have in mind that its maximum height should not exceed the height of the screen. If that is the case, the screen height is used instead.</li>
	 * <li>If <code>showExceededText</code> is set to TRUE and you paste a longer text, all characters beyond the <code>maxLength</code> limit are automatically selected.</li>
	 * <li>If <code>showExceededText</code> is set to TRUE, the control will display a counter for the remaining characters.
	 *
	 * @extends sap.m.InputBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.0
	 * @alias sap.m.TextArea
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/text-area/ Text Area}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TextArea = InputBase.extend("sap.m.TextArea", /** @lends sap.m.TextArea.prototype */ { metadata : {

		library : "sap.m",
		designtime: "sap/m/designtime/TextArea.designtime",
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
			 * Determines whether the characters, exceeding the maximum allowed character count, are visible in the input field.
			 *
			 * If set to <code>false</code> the user is not allowed to enter more characters than what is set in the <code>maxLength</code> property.
			 * If set to <code>true</code> the characters exceeding the <code>maxLength</code> value are selected on paste and the counter below
			 * the input field displays their number.
			 *  @since 1.48
			 */
			showExceededText: {type: "boolean", group: "Behavior", defaultValue: false},

			/**
			 * Indicates how the control wraps the text, e.g. <code>Soft</code>, <code>Hard</code>, <code>Off</code>.
			 */
			wrapping : {type : "sap.ui.core.Wrapping", group : "Behavior", defaultValue : Wrapping.None},

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
		aggregations: {
			// The hidden aggregation for internal usage
			_counter: {type: "sap.m.Text", multiple: false, visibility: "hidden"}
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
		},
		dnd: { draggable: false, droppable: true }
	}});

	/**
	 * Initializes the control.
	 */
	TextArea.prototype.init = function(){
		var oCounter;
		InputBase.prototype.init.call(this);
		this.sResizeListenerId = null;
		this._bPasteIsTriggered = false;
		oCounter = new Text(this.getId() + '-counter', {}).addStyleClass("sapMTextAreaCounter").setVisible(false);
		this.setAggregation("_counter", oCounter);
	};

	TextArea.prototype.setShowExceededText = function (bValue) {
		var oCounter = this.getAggregation("_counter"),
			sValue;

		if (bValue) {

			if (this.getAriaLabelledBy().indexOf(oCounter.getId()) < 0) {
				this.addAriaLabelledBy(oCounter.getId());
			}
		} else {
			//remove the counter from AriaLabelledBy
			oCounter = this.getAggregation("_counter");
			oCounter && this.removeAriaLabelledBy(oCounter.getId());

			// respect to max length
			sValue = this.getValue();
			if (this.getMaxLength()) {
				sValue = sValue.substring(0, this.getMaxLength());
				this.setValue(sValue);
			}
		}

		oCounter.setVisible(bValue);
		this.setProperty("showExceededText", bValue);
		this._updateMaxLengthAttribute();
		return this;
	};

	TextArea.prototype.exit = function() {
		InputBase.prototype.exit.call(this);
		jQuery(window).off("resize.sapMTextAreaGrowing");
		this._detachResizeHandler();
		this._deregisterEvents();
	};

	TextArea.prototype.onBeforeRendering = function() {
		InputBase.prototype.onBeforeRendering.call(this);
		var oCounter = this.getAggregation("_counter");
		if ((this.getMaxLength() <= 0 || !this.getShowExceededText()) && oCounter.getVisible()) {
			oCounter.setVisible(false);
		}
		this._detachResizeHandler();

		if (this.getGrowing()) {
			jQuery(window).on("resize.sapMTextAreaGrowing", this._updateOverflow.bind(this));
		} else {
			jQuery(window).off("resize.sapMTextAreaGrowing");
		}
	};

	// Attach listeners on after rendering and find iscroll
	TextArea.prototype.onAfterRendering = function() {
		InputBase.prototype.onAfterRendering.call(this);

		if (this.getGrowing()) {
			// Register resize event
			this._sResizeListenerId = ResizeHandler.register(this, this._resizeHandler.bind(this));

			// adjust textarea height
			if (this.getGrowingMaxLines() > 0) {
				this._setGrowingMaxHeight();
			}

			this._adjustContainerDimensions();
		}

		this._updateMaxLengthAttribute();

		if (!Device.support.touch) {
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

	/**
	 * Removes the <code>touchstart</code> and <code>touchmove</code> custom events
	 * binded to the textarea in <code>.onAfterRendering</code>.
	 *
	 * The semantic renderer does NOT remove DOM structure from the DOM tree;
	 * therefore all custom events, including the ones that are registered
	 * with jQuery, must be deregistered correctly at the <code>.onBeforeRendering</code>
	 * and exit hooks.
	 *
	 * @private
	 *
	 */
	TextArea.prototype._deregisterEvents = function() {
		this.$("inner").off("touchstart").off("touchmove");
	};

	/**
	 * Sets the maximum height of the HTML textarea.
	 * This is the actual implementation of growingMaxLines property.
	 *
	 * @private
	 */
	TextArea.prototype._setGrowingMaxHeight = function () {
		var oHiddenDiv = this.getDomRef('hidden'),
			oCore = sap.ui.getCore(),
			oLoadedLibraries = oCore.getLoadedLibraries(),
			fLineHeight,
			fMaxHeight,
			oStyle;

		// The CSS rules might not hve been applied yet and the getComputedStyle function might not return the proper values. So, wait for the theme to be applied properly
		// The check for loaded libraries is to ensure that sap.m has been loaded. TextArea's CSS sources would be loaded along with the library
		if (!oLoadedLibraries || !oLoadedLibraries['sap.m']) {
			oCore.attachThemeChanged(this._setGrowingMaxHeight.bind(this));
			return;
		}

		// After it's been executed, we need to release the resources
		oCore.detachThemeChanged(this._setGrowingMaxHeight);

		oStyle = window.getComputedStyle(oHiddenDiv);

		fLineHeight = this._getLineHeight();

		fMaxHeight = (fLineHeight * this.getGrowingMaxLines()) +
			parseFloat(oStyle.getPropertyValue("padding-top")) +
			parseFloat(oStyle.getPropertyValue("border-top-width")) +
			parseFloat(oStyle.getPropertyValue("border-bottom-width"));

		// bottom padding is out of scrolling content in firefox
		if (Device.browser.firefox) {
			fMaxHeight += parseFloat(oStyle.getPropertyValue("padding-bottom"));
		}

		oHiddenDiv.style.maxHeight = fMaxHeight + "px";
	};

	/**
	 * Calculates the line height of the HTML textarea in px.
	 *
	 * @returns {float|null} The line height in px
	 * @private
	 */
	TextArea.prototype._getLineHeight = function () {
		var oTextAreaRef = this.getFocusDomRef(),
			oStyle;

		if (!oTextAreaRef) {
			return;
		}

		oStyle = window.getComputedStyle(oTextAreaRef);

		return isNaN(parseFloat(oStyle.getPropertyValue("line-height"))) ?
			1.4 * parseFloat(oStyle.getPropertyValue("font-size")) :
			parseFloat(oStyle.getPropertyValue("line-height"));
	};

	/**
	 * Function is called when TextArea is resized
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	TextArea.prototype._resizeHandler = function (oEvent) {
		this._adjustContainerDimensions();
	};

	/**
	 * Detaches the resize handler
	 * @private
	 */
	TextArea.prototype._detachResizeHandler = function () {
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
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

	TextArea.prototype.getValue = function() {
		var oTextAreaRef = this.getFocusDomRef();
		return oTextAreaRef ? oTextAreaRef.value : this.getProperty("value");
	};

	TextArea.prototype.setValue = function (sValue) {
		InputBase.prototype.setValue.call(this, sValue);
		this._handleShowExceededText();
		if (this.getGrowing()) {
			this._adjustContainerDimensions();
		}
		return this;
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

		/* TODO remove after the end of support for Internet Explorer */
		// Handles paste. This is before checking for "invalid" because in IE after paste the event is set as "invalid"
		if (this._bPasteIsTriggered) {
			this._bPasteIsTriggered = false;
			this._selectExceededText();
		}

		if (oEvent.isMarked("invalid")) {
			return;
		}

		var oTextAreaRef = this.getFocusDomRef(),
			sValue = oTextAreaRef.value,
			bShowExceededText = this.getShowExceededText(),
			iMaxLength = this.getMaxLength();

		if (!bShowExceededText && iMaxLength && sValue.length > iMaxLength) {
			sValue = sValue.substring(0, iMaxLength);
			oTextAreaRef.value = sValue;
		}

		// update value property if needed
		if (this.getValueLiveUpdate()) {
			this.setProperty("value", sValue, true);

			// get the value back maybe there is a formatter
			sValue = this.getValue();
		}

		this._handleShowExceededText();

		// handle growing
		if (this.getGrowing()) {
			this._adjustContainerDimensions();
		}

		this.fireLiveChange({
			value: sValue,

			// backwards compatibility
			newValue: sValue
		});
	};

	/**
	 * Handles the onpaste event.
	 *
	 * The event is customized and the <code>textArea</code> value is calculated manually
	 * because when the <code>showExceededText</code> is set to
	 * <code>true</code> the exceeded text should be selected on paste.
	 * @param {jQuery.Event} oEvent The event object
	 */
	TextArea.prototype.onpaste = function (oEvent) {
		if (this.getShowExceededText()) {
			this._bPasteIsTriggered = true;
		}
	};

	TextArea.prototype._adjustContainerDimensions = function() {
		var oTextAreaRef = this.getFocusDomRef(),
			oHiddenDiv = this.getDomRef("hidden"),
			sHiddenDivMinHeight, sNeededMinHeight;

		if (!oTextAreaRef || !oHiddenDiv) {
			return;
		}

		oHiddenDiv.style.width = "";

		if (this.getGrowing() &&
			!this.getWidth() && /* width property overwrites cols */
			this.getCols() !== 20 /* the default value */) {
			oHiddenDiv.style.width = (this.getCols() * 0.5) + "rem";
		}

		sHiddenDivMinHeight = oHiddenDiv.style["min-height"];
		sNeededMinHeight = this.getRows() * this._getLineHeight() + "px";

		// change the min-height of the mirror div,
		// depending on the rows, only if needed
		if (!sHiddenDivMinHeight || sNeededMinHeight !== sHiddenDivMinHeight) {
			oHiddenDiv.style["min-height"] = sNeededMinHeight;
		}

		// ensure that there will be left space if the last row is a new line
		// ensure that possible html/script content is escaped
		oHiddenDiv.innerHTML = encodeXML(oTextAreaRef.value) + '&nbsp;';
		this._updateOverflow();
	};

	TextArea.prototype._updateOverflow = function() {
		var oTextAreaRef = this.getFocusDomRef(),
			oHiddenDiv = this.getDomRef("hidden"),
			fMaxHeight;

		if (oTextAreaRef) {
			fMaxHeight = parseFloat(window.getComputedStyle(oHiddenDiv)["max-height"]);
			oTextAreaRef.style.overflowY = (oHiddenDiv.scrollHeight > fMaxHeight) ? "auto" : "";
		}
	};

	TextArea.prototype._getInputValue = function(sValue) {
		//not calling InputBase.prototype._getInputValue because it always respects maxValue
		sValue = (sValue === undefined) ? this.$("inner").val() || "" : sValue.toString();

		if (this.getMaxLength() > 0 && !this.getShowExceededText()) {
			sValue = sValue.substring(0, this.getMaxLength());
		}

		return sValue.replace(/\r\n/g, "\n");
	};

	TextArea.prototype._selectExceededText = function () {
		var iValueLength = this.getValue().length;

		if (iValueLength > this.getMaxLength()) {
			this.selectText(this.getMaxLength(), iValueLength);
		}
	};

	TextArea.prototype._updateMaxLengthAttribute = function () {
		var oTextAreaRef = this.getFocusDomRef();
		if (!oTextAreaRef) {
			return;
		}

		if (this.getShowExceededText()) {
			oTextAreaRef.removeAttribute("maxlength");
			this._handleShowExceededText();
		} else {
			this.getMaxLength() && oTextAreaRef.setAttribute("maxlength", this.getMaxLength());
		}
	};

	/**
	 * Updates counter value.
	 * @private
	 */

	TextArea.prototype._handleShowExceededText = function () {
		var oCounter = this.getAggregation("_counter"),
			iMaxLength = this.getMaxLength(),
			sCounterText;

		if (!this.getDomRef() || !this.getShowExceededText() || !iMaxLength) {
			return;
		}

		sCounterText = this._getCounterValue();
		oCounter.setText(sCounterText);
	};

	/**
	 * Checks if the TextArea has exceeded the value for MaxLength
	 * @param {number} bValue The value
	 * @returns {boolean} True if the text area exceeded the max length
	 * @private
	 */
	TextArea.prototype._maxLengthIsExceeded = function (bValue) {
		var bResult = false;
		if (this.getMaxLength() > 0 && this.getShowExceededText() && this.getValue().length > this.getMaxLength()) {
			bResult = true;
		}
		return bResult;
	};

	TextArea.prototype._getCounterValue = function () {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
				iCharactersExceeded = this.getMaxLength() - this.getValue().length,
				bExceeded = (iCharactersExceeded < 0 ? true : false),
				sMessageBundleKey = "TEXTAREA_CHARACTER" + ( Math.abs(iCharactersExceeded) === 1 ? "" : "S") + "_" + (bExceeded ? "EXCEEDED" : "LEFT");

		return oBundle.getText(sMessageBundleKey, [Math.abs(iCharactersExceeded)]);
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
	}(Device));


	/**
	 * On touch start get iscroll and save starting point
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
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
	 * @param {jQuery.Event} oEvent The event object
	 */
	TextArea.prototype._onTouchMove = function(oEvent) {

		var oTextAreaRef = this.getFocusDomRef(),
			iPageY = oEvent.touches[0].pageY,
			iScrollTop = oTextAreaRef.scrollTop,
			bTop = iScrollTop <= 0,
			bBottom = iScrollTop + oTextAreaRef.clientHeight >= oTextAreaRef.scrollHeight,
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
	var _bMSWebView = Device.os.windows_phone && (/MSAppHost/i).test(navigator.appVersion);

	/**
	 * Special handling for the focusing issue in SAP Fiori Client on Windows Phone.
	 * @param {jQuery.Event} oEvent The event object
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

	/**
	 * Special handling for Enter key which triggers the FieldGroupNavigation on Enter. This treatment is only relevant
	 * for the Enter key itself, as this is used in TextArea to start a new line.
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	TextArea.prototype.onkeyup = function(oEvent) {
		if (oEvent.keyCode === KeyCodes.ENTER) {
			oEvent.setMarked("enterKeyConsumedAsContent");
		}
	};

	return TextArea;

});