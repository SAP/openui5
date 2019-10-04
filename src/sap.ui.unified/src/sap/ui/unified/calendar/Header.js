/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/unified/library',
	"./HeaderRenderer",
	"sap/ui/dom/containsOrEquals"
], function(Control, library, HeaderRenderer, containsOrEquals) {
	"use strict";

	/**
	 * Constructor for a new Header.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * renders a calendar header
	 *
	 * The calendar header consists of 3 buttons where the text can be set and a previous and a next button.
	 * In the normal calendar the first button contains the displayed day, the second button the displayed month and the third button the displayed year.
	 *
	 * <b>Note:</b> This is used inside the calendar. Not for standalone usage
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28.0
	 * @alias sap.ui.unified.calendar.Header
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Header = Control.extend("sap.ui.unified.calendar.Header", /** @lends sap.ui.unified.calendar.Header.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Text of the first button (normally day)
			 * @since 1.32.0
			 */
			textButton0 : {type : "string", group : "Appearance"},

			/**
			 * Additional text of the first button (normally day)
			 * @since 1.34.0
			 */
			additionalTextButton0 : {type : "string", group : "Appearance"},

			/**
			 * aria-label of the first button (normally day)
			 * @since 1.32.0
			 */
			ariaLabelButton0 : {type : "string", group : "Misc"},

			/**
			 * If set, the first button will be displayed
			 *
			 * <b>Note:</b> The default is set to false to be compatible to older versions
			 * @since 1.32.0
			 */
			visibleButton0 : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Text of the second button (normally month)
			 */
			textButton1 : {type : "string", group : "Appearance"},

			/**
			 * Additional text of the second button (normally month)
			 * @since 1.34.0
			 */
			additionalTextButton1 : {type : "string", group : "Appearance"},

			/**
			 * aria-label of the second button (normally month)
			 */
			ariaLabelButton1 : {type : "string", group : "Misc"},

			/**
			 * If set, the second button will be displayed
			 * @since 1.32.0
			 */
			visibleButton1 : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Text of the third button (normally year)
			 */
			textButton2 : {type : "string", group : "Appearance"},

			/**
			 * Additional text of the third button (normally year)
			 * @since 1.34.0
			 */
			additionalTextButton2 : {type : "string", group : "Appearance"},

			/**
			 * aria-label of the third button (normally year)
			 */
			ariaLabelButton2 : {type : "string", group : "Misc"},

			/**
			 * If set, the third button will be displayed
			 * @since 1.32.0
			 */
			visibleButton2 : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Enables the previous button
			 */
			enabledPrevious : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Enables the Next button
			 */
			enabledNext : {type : "boolean", group : "Behavior", defaultValue : true}

		},
		events : {

			/**
			 * Previous button pressed
			 */
			pressPrevious : {},

			/**
			 * Next button pressed
			 */
			pressNext : {},

			/**
			 * First button pressed (normally day)
			 * @since 1.32.0
			 */
			pressButton0 : {},

			/**
			 * Second button pressed (normally month)
			 */
			pressButton1 : {},

			/**
			 * Third button pressed (normally year)
			 */
			pressButton2 : {}

		}
	}});

	/**
	 * If set, the third button will be displayed
	 *
	 * @param bVisible
	 * @returns {sap.ui.unified.calendar.Header}
	 * @private
	 */
	Header.prototype._setVisibleButton3 = function (bVisible) {
		this._visibleButton3 = bVisible;
		this.invalidate();

		return this;
	};

	/**
	 * Gets the visibility of the private third button
	 * @returns {boolean}
	 * @private
	 */
	Header.prototype._getVisibleButton3 = function () {
		return this._visibleButton3;
	};

	/**
	 * Text of the third button (normally month)
	 *
	 * @param sText
	 * @returns {sap.ui.unified.calendar.Header}
	 * @private
	 */
	Header.prototype._setTextButton3 = function(sText){
		_setTextPrivateButton.call(this, 3, sText);

		return this;
	};

	/**
	 * Gets the text of the private third button
	 * @returns {string}
	 * @private
	 */
	Header.prototype._getTextButton3 = function () {
		return this._textButton3;
	};

	/**
	 * Additional text of the third button (normally month)
	 * @param sText
	 * @returns {sap.ui.unified.calendar.Header}
	 */
	Header.prototype._setAdditionalTextButton3 = function(sText){
		_setAdditionalTextPrivateButton.call(this, 3, sText);

		return this;
	};

	/**
	 * Gets the additional text of the private third button
	 * @returns {string}
	 * @private
	 */
	Header.prototype._getAdditionalTextButton3 = function () {
		return this._additionalTextButton3;
	};

	/**
	 * aria-label of the third button (normally month)
	 * @param sText
	 * @returns {sap.ui.unified.calendar.Header}
	 * @private
	 */
	Header.prototype._setAriaLabelButton3 = function(sText){
		_setAriaLabelPrivateButton.call(this, 3, sText);

		return this;
	};

	/**
	 * Gets the aria-label of the private third button
	 * @returns {string}
	 * @private
	 */
	Header.prototype._getAriaLabelButton3 = function () {
		return this._ariaLabelButton3;
	};

	/**
	 * If set, the fourth button will be displayed
	 *
	 * @param bVisible
	 * @returns {sap.ui.unified.calendar.Header}
	 * @private
	 */
	Header.prototype._setVisibleButton4 = function (bVisible) {
		this._visibleButton4 = bVisible;
		this.invalidate();

		return this;
	};

	/**
	 * Gets the visibility of the private fourth button
	 * @returns {boolean}
	 * @private
	 */
	Header.prototype._getVisibleButton4 = function () {
		return this._visibleButton4;
	};

	/**
	 * Text of the fourth button (normally year)
	 * @param sText
	 * @returns {sap.ui.unified.calendar.Header}
	 * @private
	 */
	Header.prototype._setTextButton4 = function(sText){
		_setTextPrivateButton.call(this, 4, sText);

		return this;
	};

	/**
	 * Gets the text of the private fourth button
	 * @returns {string}
	 * @private
	 */
	Header.prototype._getTextButton4 = function () {
		return this._textButton4;
	};

	/**
	 * Additional text of the fourth button (normally year)
	 * @param sText
	 * @returns {sap.ui.unified.calendar.Header}
	 * @private
	 */
	Header.prototype._setAdditionalTextButton4 = function(sText){
		_setAdditionalTextPrivateButton.call(this, 4, sText);

		return this;
	};

	/**
	 * Gets the additional text of the private fourth button
	 * @returns {string}
	 * @private
	 */
	Header.prototype._getAdditionalTextButton4 = function () {
		return this._additionalTextButton4;
	};

	/**
	 * aria-label of the fourth button (normally year)
	 * @param sText
	 * @returns {sap.ui.unified.calendar.Header}
	 * @private
	 */
	Header.prototype._setAriaLabelButton4 = function(sText){
		_setAriaLabelPrivateButton.call(this, 4, sText);

		return this;
	};

	/**
	 * Gets the aria-label of the private fourth button
	 * @returns {string}
	 * @private
	 */
	Header.prototype._getAriaLabelButton4 = function () {
		return this._ariaLabelButton4;
	};

	Header.prototype.onclick = function(oEvent){

		if (oEvent.isMarked("delayedMouseEvent") ) {
			return;
		}

		if (containsOrEquals(this.getDomRef("prev"), oEvent.target) && this.getEnabledPrevious()) {
			this.firePressPrevious();
		} else if (containsOrEquals(this.getDomRef("next"), oEvent.target) && this.getEnabledNext()){
			this.firePressNext();
		} else if (containsOrEquals(this.getDomRef("B0"), oEvent.target)){
			this.firePressButton0();
		} else if (containsOrEquals(this.getDomRef("B1"), oEvent.target)){
			this.firePressButton1();
		} else if (containsOrEquals(this.getDomRef("B2"), oEvent.target)){
			this.firePressButton2();
		} else if (containsOrEquals(this.getDomRef("B3"), oEvent.target)){
			this.fireEvent("pressButton3");
		} else if (containsOrEquals(this.getDomRef("B4"), oEvent.target)){
			this.fireEvent("pressButton4");
		}

	};

	Header.prototype.onsapnext = function(oEvent){

		//prevent browser scrolling
		oEvent.preventDefault();

	};

	function _setTextPrivateButton(iButton, sText) {
		this["_textButton" + iButton] = sText;

		if (this.isActive() && this["_getVisibleButton" + iButton]()) {
			if (this.$("B" + iButton + "-Text").get(0)) {
				this.$("B" + iButton + "-Text").text(sText);
			} else {
				this.$("B" + iButton).text(sText);
			}
		}
	}

	function _setAdditionalTextPrivateButton(iButton, sText) {
		var bRerender = false;
		var sOldText = this["_getAdditionalTextButton" + iButton]();

		if (sOldText == sText) {
			return;
		}

		if ((!sOldText && sText) || (sOldText && !sText)) {
			bRerender = true;
		}

		this["_additionalTextButton" + iButton] = sText;

		if (!bRerender && this.isActive() && this["_getVisibleButton" + iButton]()) {
			this.$("B" + iButton + "-AddText").text(sText);
		}

		if (bRerender) {
			this.invalidate();
		}
	}


	function _setAriaLabelPrivateButton(iButton, sText){
		this["_ariaLabelButton" + iButton] = sText;

		if (this.isActive() && this["_getVisibleButton" + iButton]()) {
			if (sText) {
				this.$("B" + iButton).attr("aria-label", sText);
			} else {
				this.$("B" + iButton).removeAttr("aria-label");
			}
		}
	}

	return Header;

});