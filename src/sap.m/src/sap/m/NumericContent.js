/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/core/ResizeHandler",
	"sap/m/Image",
	"./NumericContentRenderer",
	"sap/ui/events/KeyCodes",
	"sap/base/util/deepEqual"
], function (library, Control, IconPool, ResizeHandler, Image, NumericContentRenderer, KeyCodes, deepEqual) {
	"use strict";

	var LANG_MAP = { // keys are compared in lowercase
		"ar": 4,
		"ar_eg": 4,
		"ar_sa": 4,
		"bg": 4,
		"ca": 6,
		"cs": 4,
		"da": 4,
		"de": 8,
		"de_at": 8,
		"de_ch": 8,
		"el": 4,
		"el_cy": 4,
		"en": 4,
		"en_au": 4,
		"en_gb": 4,
		"en_hk": 4,
		"en_ie": 4,
		"en_in": 4,
		"en_nz": 4,
		"en_pg": 4,
		"en_sg": 4,
		"en_us": 4,
		"en_za": 4,
		"es": 6,
		"es_ar": 4,
		"es_bo": 4,
		"es_cl": 4,
		"es_co": 4,
		"es_mx": 6,
		"es_pe": 4,
		"es_uy": 4,
		"es_ve": 4,
		"et": 4,
		"fa": 4,
		"fi": 4,
		"fr": 4,
		"fr_be": 4,
		"fr_ca": 4,
		"fr_ch": 4,
		"fr_lu": 4,
		"he": 4,
		"hi": 4,
		"hr": 4,
		"hu": 4,
		"id": 4,
		"it": 8,
		"it_ch": 8,
		"ja": 6,
		"kk": 4,
		"ko": 6,
		"lt": 4,
		"lv": 4,
		"ms": 4,
		"nb": 4,
		"nl": 4,
		"nl_be": 4,
		"pl": 4,
		"pt": 4,
		"pt_pt": 4,
		"ro": 4,
		"ru": 4,
		"ru_ua": 4,
		"sk": 4,
		"sl": 4,
		"sr": 4,
		"sv": 4,
		"th": 4,
		"tr": 4,
		"uk": 4,
		"vi": 4,
		"zh_cn": 6,
		"zh_hk": 6,
		"zh_sg": 6,
		"zh_tw": 6
	};

	/**
	 * Constructor for a new sap.m.GenericTile control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class Shows numeric values used for example in tiles colored according to their meaning and displays deviations.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.m.NumericContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NumericContent = Control.extend("sap.m.NumericContent", /** @lends sap.m.NumericContent.prototype */ {
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * If set to true, the change of the value will be animated.
				 */
				"animateTextChange": {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * If set to true, the value parameter contains a numeric value and scale. If set to false (default), the value parameter contains a numeric value only.
				 */
				"formatterValue": {type: "boolean", group: "Data", defaultValue: false},

				/**
				 * The icon to be displayed as a graphical element within the control. This can be an image or an icon from the icon font.
				 */
				"icon": {type: "sap.ui.core.URI", group: "Appearance", defaultValue: null},

				/**
				 * Description of an icon that is used in the tooltip.
				 */
				"iconDescription": {type: "string", group: "Accessibility", defaultValue: null},

				/**
				 * The indicator arrow that shows value deviation.
				 */
				"indicator": {type: "sap.m.DeviationIndicator", group: "Appearance", defaultValue: "None"},

				/**
				 * If set to true, the omitted value property is set to 0.
				 */
				"nullifyValue": {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * The scaling prefix. Financial characters can be used for currencies and counters. The SI prefixes can be used for units. If the scaling prefix contains more than three characters, only the first three characters are displayed.
				 */
				"scale": {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * Updates the size of the control. If not set, then the default size is applied based on the device tile.
				 * @deprecated Since version 1.38.0. The NumericContent control has now a fixed size, depending on the used media (desktop, tablet or phone).
				 */
				"size": {type: "sap.m.Size", group: "Appearance", defaultValue: "Auto"},

				/**
				 * The number of characters of the <code>value</code> property to display.
				 *
				 * <b>Note</b> If <code>adaptiveFontSize</code> is set to <code>true</code> the default value of this property will vary between languages.
				 * If <code>adaptiveFontSize</code> is set to <code>false</code> the default value of this property is <code>4</code>.
				 */
				"truncateValueTo": {type: "int", group: "Appearance"},

				/**
				 * The actual value.
				 */
				"value": {type: "string", group: "Data", defaultValue: null},

				/**
				 * The semantic color of the value.
				 */
				"valueColor": {type: "sap.m.ValueColor", group: "Appearance", defaultValue: "Neutral"},

				/**
				 * The width of the control. If it is not set, the size of the control is defined by the 'size' property.
				 */
				"width": {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: null},

				/**
				 * If the value is set to false, the content is adjusted to the whole size of the control.
				 */
				"withMargin": {type: "boolean", group: "Appearance", defaultValue: true},

				/**
				 * Indicates the load status.
				 */
				"state": {type: "sap.m.LoadState", group: "Behavior", defaultValue: "Loaded"},

				/**
				 * If set to its default value true this property applies the appropriate font style class based on the language. When set to false the font size will always be large
				 *
				 * @experimental As of version 1.73 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 * @since 1.73
				 */
				"adaptiveFontSize": {type: "boolean", group: "Appearance", defaultValue: true}


			},
			events: {
				/**
				 * The event is fired when the user chooses the numeric content.
				 */
				"press": {}
			}
		}
	});

	/* --- Lifecycle methods --- */

	NumericContent.prototype.init = function () {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this.setTooltip("{AltText}");
		sap.ui.getCore().attachInit(this._registerResizeHandler.bind(this));
	};

	NumericContent.prototype._getParentTile = function () {
		var oParent = this.getParent();
		while (oParent) {
			if (oParent.isA("sap.m.GenericTile")) {
				return oParent;
			}

			oParent = oParent.getParent();
		}

		return null;
	};

	NumericContent.prototype._getMaxDigitsData = function () {
		var sFontClass = null,
		  sLang = sap.ui.getCore().getConfiguration().getLanguage().toLowerCase(),
		  iMaxLength = LANG_MAP[sLang] || 4;

		if (this.getAdaptiveFontSize()) {
			switch (iMaxLength) {
				case 6:
					sFontClass = "sapMNCMediumFontSize";
					break;
				case 8:
					sFontClass = "sapMNCSmallFontSize";
					break;
				default:
					sFontClass = "sapMNCLargeFontSize";
					break;
			}
		} else {
			sFontClass = "sapMNCLargeFontSize";
			iMaxLength = 4; // the default value if size is not adaptive
		}

		return {
			fontClass: sFontClass,
			maxLength: iMaxLength
		};
	};

	/**
	 * Registers resize handler.
	 * @private
	 */
	NumericContent.prototype._registerResizeHandler = function () {
		ResizeHandler.register(this, this.invalidate.bind(this));
	};

	NumericContent.prototype.onBeforeRendering = function () {
		this.$().unbind("mouseenter");
		this.$().unbind("mouseleave");

		this._iMaxLength = null;
	};

	NumericContent.prototype.onAfterRendering = function () {
		this.$().bind("mouseenter", this._addTooltip.bind(this));
		this.$().bind("mouseleave", this._removeTooltip.bind(this));

		if (!sap.ui.getCore().isThemeApplied()) {
			sap.ui.getCore().attachThemeChanged(this._checkIfIconFits, this);
		} else {
			this._checkIfIconFits();
		}
	};

	/**
	 * Sets the control's title attribute in order to show the tooltip.
	 * @private
	 */
	NumericContent.prototype._addTooltip = function () {
		this.$().attr("title", this.getTooltip_AsString());
	};

	/**
	 * Shows/hides icon depending if it fits or not.
	 * @private
	 */
	NumericContent.prototype._checkIfIconFits = function() {
		//first check if parent tile is going to resize in the future so resize it now for our calculation
		var oParentTile = this._getParentTile();
		if (oParentTile && (oParentTile.isA("sap.m.GenericTile") || oParentTile.isA("sap.m.SlideTile"))) {
			oParentTile._setupResizeClassHandler();
		}

		var $icon = this.$("icon-image"),
			$value = this.$("value-inner"),
			$wrapper = this.$("value-scr");

		var iSize = $icon.outerWidth() + $value.width(),
			iWrapperSize = $wrapper.width();

		iSize > iWrapperSize ? $icon.hide() : $icon.show();
	};

	/**
	 * Removes the control's tooltip in order to prevent screen readers from reading it.
	 * @private
	 */
	NumericContent.prototype._removeTooltip = function () {
		this.$().attr("title", null);
	};

	NumericContent.prototype.exit = function () {
		if (this._oIcon) {
			this._oIcon.destroy();
		}
	};

	/* --- Getters and Setters --- */

	/**
	 * Returns the AltText
	 *
	 * @returns {String} The alternative text
	 */
	NumericContent.prototype.getAltText = function () {
		var sValue = this.getValue();
		var sScale = this.getScale();
		var sEmptyValue;
		var sMeaning = this._rb.getText(("SEMANTIC_COLOR_" + this.getValueColor()).toUpperCase());
		var sAltText = "";
		if (this.getNullifyValue()) {
			sEmptyValue = "0";
		} else {
			sEmptyValue = "";
		}
		if (this.getIconDescription()) {
			sAltText = sAltText.concat(this.getIconDescription());
			sAltText = sAltText.concat("\n");
		}
		if (sValue) {
			sAltText = sAltText.concat(sValue + sScale);
		} else {
			sAltText = sAltText.concat(sEmptyValue);
		}
		sAltText = sAltText.concat("\n");
		if (this.getIndicator() && this.getIndicator() !== library.DeviationIndicator.None) {
			sAltText = sAltText.concat(this._rb.getText(("NUMERICCONTENT_DEVIATION_" + this.getIndicator()).toUpperCase()));
			sAltText = sAltText.concat("\n");
		}
		sAltText = sAltText.concat(sMeaning);
		return sAltText;
	};

	NumericContent.prototype.getTooltip_AsString = function () { //eslint-disable-line
		var oTooltip = this.getTooltip();
		var sTooltip = this.getAltText();
		if (typeof oTooltip === "string" || oTooltip instanceof String) {
			// TODO Nov. 2015: needs to be checked with ACC. Issue will be addresses via BLI.
			sTooltip = oTooltip.split("{AltText}").join(sTooltip).split("((AltText))").join(sTooltip);
			return sTooltip;
		}
		if (oTooltip) {
			return oTooltip;
		} else {
			return "";
		}
	};

	NumericContent.prototype.setIcon = function (uri) {
		var bValueChanged = !deepEqual(this.getIcon(), uri);
		if (bValueChanged) {
			if (this._oIcon) {
				this._oIcon.destroy();
				this._oIcon = undefined;
			}
			if (uri) {
				this._oIcon = IconPool.createControlByURI({
					id: this.getId() + "-icon-image",
					src: uri
				}, Image);
			}
		}
		this._setPointerOnIcon();
		return this.setProperty("icon", uri);
	};

	/**
	 * Sets CSS class 'sapMPointer' for the internal Icon if needed.
	 * @private
	 */
	NumericContent.prototype._setPointerOnIcon = function () {
		if (this._oIcon && this.hasListeners("press")) {
			this._oIcon.addStyleClass("sapMPointer");
		} else if (this._oIcon && this._oIcon.hasStyleClass("sapMPointer")) {
			this._oIcon.removeStyleClass("sapMPointer");
		}
	};

	/* --- Event Handling --- */

	/**
	 * Handler for tap event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	NumericContent.prototype.ontap = function (oEvent) {
		this.$().focus();
		this.firePress();
		oEvent.preventDefault();
	};

	/**
	 * Handler for keyup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	NumericContent.prototype.onkeyup = function (oEvent) {
		if (oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	NumericContent.prototype.onkeydown = function (oEvent) {
		if (oEvent.which === KeyCodes.SPACE) {
			oEvent.preventDefault();
		}
	};

	NumericContent.prototype.attachEvent = function (eventId, data, functionToCall, listener) {
		Control.prototype.attachEvent.call(this, eventId, data, functionToCall, listener);
		if (this.hasListeners("press")) {
			this.$().attr("tabindex", 0).addClass("sapMPointer");
			this._setPointerOnIcon();
		}
		return this;
	};

	NumericContent.prototype.detachEvent = function (eventId, functionToCall, listener) {
		Control.prototype.detachEvent.call(this, eventId, functionToCall, listener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapMPointer");
			this._setPointerOnIcon();
		}
		return this;
	};

	/* --- Helpers --- */

	/**
	 * Parses the formatted value
	 *
	 * @private
	 * @param {string} sValue - With scale and value
	 * @returns {Object} The scale and formatted value
	 */
	NumericContent.prototype._parseFormattedValue = function (sValue) {

		// remove the invisible unicode character LTR and RTL mark before processing the regular expression.
		var sTrimmedValue = sValue.replace(String.fromCharCode(8206), "").replace(String.fromCharCode(8207), "");

		return {
			scale: sTrimmedValue.replace(/[+-., \d]*(.*)$/g, "$1").trim().replace(/\.$/, ""),
			value: sTrimmedValue.replace(/([+-., \d]*).*$/g, "$1").trim()
		};
	};

	return NumericContent;
});