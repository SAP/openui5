/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Currency.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/core/format/NumberFormat',
	"./CurrencyRenderer"
], function(jQuery, Control, NumberFormat, CurrencyRenderer) {
		"use strict";

		/**
		 * Constructor for a new <code>Currency</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A text view which displays currency values and aligns them at the decimal point.
		 *
		 * <h3>Overview</h3>
		 *
		 * The currency control consists of an amount, which is formatted automatically according
		 * to the user’s locale (using delimiter symbols for the decimal point and thousand separators)
		 * and to the currency set for this specific number (number of decimal places).
		 *
		 * The currency is expressed as a three-letter code.
		 *
		 * <h3>Usage</h3>
		 *
		 * <i>When to use</i>
		 * <ul>
		 * <li>To display amounts with different currencies in a vertical layout, such as in a table,
		 * list, or form, and it is important that the user is able to compare the amounts.</li>
		 * </ul>
		 *
		 * <i>When not to use</i>
		 * <ul>
		 * <li>To display amounts with the same currency in a table. Use the {@link sap.m.ObjectNumber} instead.</li>
		 * <li>to display a number with a unit of measurement that is not a currency. Use the
		 * {@link sap.m.ObjectNumber} instead.</li>
		 * <li>To display an amount in a structure other than a list, table, or form.</li>
		 * </ul>
		 *
		 * <h3>Responsive behavior</h3>
		 *
		 * The control supports amounts smaller than 100 trillion, which still fit on a phone screen in portrait mode.
		 * For larger amounts, the unit of measurement wraps to the next line, which makes it difficult to compare the amounts.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.21.1
		 * @alias sap.ui.unified.Currency
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Currency = Control.extend("sap.ui.unified.Currency", /** @lends sap.ui.unified.Currency.prototype */ { metadata : {

			library : "sap.ui.unified",
			properties : {

				/**
				 * Determines the currency value.
				 */
				value : {type : "float", group : "Appearance", defaultValue : 0},

				/**
				 * Determines the currency value as a string.
				 *
				 * String value is useful if you want to store really big values. If there are more than 21 digits
				 * before the decimal point or if the number starts with “0.” followed by more than five zeros, it is
				 * represented in exponential form. In these cases use the <code>stringValue</code> property to keep the number in
				 * decimal format.
				 *
				 * <b>Note:</b> If set, it will take precedence over the <code>value</code> property.
				 * @since 1.54
				 */
				stringValue : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * Determines the displayed currency code (ISO 4217).
				 *
				 * <b>Note:</b> If a * character is set instead of currency code,
				 * only the character itself will be rendered, ignoring the <code>value</code> property.
				 */
				currency : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * Defines the space that is available for the precision of the various currencies.
				 */
				maxPrecision : {type : "int", group : "Appearance", defaultValue : 3},

				/**
				 * Displays the currency symbol instead of the ISO currency code.
				 */
				useSymbol : {type : "boolean", group : "Appearance", defaultValue : true}
			},
			designtime: "sap/ui/unified/designtime/Currency.designtime"
		}});

		//Whitespace characters to align values
		Currency.FIGURE_SPACE = '\u2007';
		Currency.PUNCTUATION_SPACE = '\u2008';

		/**
		 * Initializes the control.
		 *
		 * @public
		 */
		Currency.prototype.init = function() {
			this._oFormat = NumberFormat.getCurrencyInstance({
				showMeasure: false
			});
		};

		/**
		 * Called from parent if the control is destroyed.
		 *
		 * @private
		 */
		Currency.prototype.exit = function () {
			this._oFormat = null;
			this._$Value = null;
			this._$Currency = null;
			this._sLastCurrency = null;
			this._iLastCurrencyDigits = null;
			this._bRenderNoValClass = null;
		};

		/**
		 * Called after the control is rendered
		 * @override
		 */
		Currency.prototype.onAfterRendering = function () {
			if (this.$()) {
				this._$Value = this.$().find(".sapUiUfdCurrencyValue");
				this._$Currency = this.$().find(".sapUiUfdCurrencyCurrency");
			}
		};

		/*
		 * Value property setter.
		 *
		 * @override
		 * @param {string} sValue The value to be set
		 * @returns {sap.ui.unified.Currency} <code>this</code> pointer for chaining
		 */
		Currency.prototype.setValue = function(sValue) {
			// Check if the value is bound and is undefined. In case of
			// undefined value the Currency control will not display any value! This workaround
			// is necessary because of the default value 0 suppresses to set an undefined or null value
			// instead and this cannot be changed due to compatibility.
			if (this.isBound("value")) {
				this._bRenderNoValClass = sValue == null;
				// Toggle class if control is rendered
				if (this.$()) {
					this.$().toggleClass("sapUiUfdCurrencyNoVal", this._bRenderNoValClass);
				}
			}

			this.setProperty("value", sValue, true);
			this._renderValue();
			return this;
		};

		Currency.prototype.unbindProperty = function(sPropName) {
			Control.prototype.unbindProperty.apply(this, arguments);

			if (sPropName === "value") {
				this._bRenderNoValClass = false;
				if (this.$()) {
					this.$().toggleClass("sapUiUfdCurrencyNoVal", false);
				}
			}
		};

		/*
		 * Currency property setter.
		 * @param {string} sValue The ISO 4217 currency code
		 * @return {sap.ui.unified.Currency} <code>this</code> pointer for chaining
		 */
		Currency.prototype.setCurrency = function (sValue) {
			var iCurrencyDigits,
				bRenderValue;

			this.setProperty("currency", sValue, true);
			this._renderCurrency();

			// Take into account currencies that do not have decimal values or the decimal value differs. Example: JPY.
			// If we switch from a currency which differs we should update the value too.
			iCurrencyDigits = this._oFormat.oLocaleData.getCurrencyDigits(sValue);
			if (jQuery.isNumeric(this._iLastCurrencyDigits) && this._iLastCurrencyDigits !== iCurrencyDigits) {
				bRenderValue = true;
			}
			this._iLastCurrencyDigits = iCurrencyDigits;

			// We need to update the value if the last currency value was * or the new value is *
			if (this._sLastCurrency === "*" || sValue === "*") {
				bRenderValue = true;
			}
			this._sLastCurrency = sValue;

			if (bRenderValue) {
				this._renderValue();
				// In the special case where the currency is set to "*" we need to remove the CSS class
				// "sapUiUfdCurrencyNoVal" which hides the control.
				if (sValue === "*" && this.$()) {
					this._bRenderNoValClass = false;
					this.$().toggleClass("sapUiUfdCurrencyNoVal", false);
				}
			}

			return this;
		};

		/*
		 * UseSymbol property setter.
		 * @param {boolean} bValue Whether the control must show the currency symbol instead of the ISO currency code
		 * @return {sap.ui.unified.Currency} <code>this</code> pointer for chaining
		 */
		Currency.prototype.setUseSymbol = function (bValue) {
			this.setProperty("useSymbol", bValue, true);
			this._renderCurrency();
			return this;
		};

		/*
		 * MaxPrecision property setter.
		 * @param {int} iValue The maximum precision value
		 * @return {sap.ui.unified.Currency} <code>this</code> pointer for chaining
		 */
		Currency.prototype.setMaxPrecision = function (iValue) {
			this.setProperty("maxPrecision", iValue, true);
			this._renderValue();
			return this;
		};

		/**
		 * Updates the value directly in the control dom
		 * @private
		 */
		Currency.prototype._renderValue = function () {
			if (this._$Value) {
				this._$Value.text(this.getFormattedValue());
			}
		};

		/**
		 * Updates the currency directly in the control dom
		 * @private
		 */
		Currency.prototype._renderCurrency = function () {
			if (this._$Currency) {
				this._$Currency.text(this._getCurrency());
			}
		};

		/**
		 * Used to get proper currency text to be rendered depending on the useSymbol property of the control.
		 * @returns {string} Currency symbol or ISO 4217 code
		 * @private
		 */
		Currency.prototype._getCurrency = function () {
			return this.getUseSymbol() ? this.getCurrencySymbol() : this.getCurrency();
		};

		/**
		 * The formatted value.
		 *
		 * @type {string}
		 * @returns {string} The formatted value
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		Currency.prototype.getFormattedValue = function() {
			var sCurrency = this.getCurrency(),
				iMaxPrecision,
				iPadding,
				iCurrencyDigits,
				sFormattedCurrencyValue;

			if (sCurrency === "*") {
				return "";
			}

			iCurrencyDigits = this._oFormat.oLocaleData.getCurrencyDigits(sCurrency);
			iMaxPrecision = this.getMaxPrecision();
			// Should recalculate iMaxPrecision in order to fix an edge case where decimal precision is not removed
			// Note: Take into account currencies that do not have decimal values. Example: JPY
			iMaxPrecision = (iMaxPrecision <= 0 && iCurrencyDigits > 0 ? iMaxPrecision - 1 : iMaxPrecision);
			iPadding = iMaxPrecision - iCurrencyDigits;
			sFormattedCurrencyValue = this._oFormat.format(this.getStringValue() || this.getValue(), sCurrency);

			if (iPadding == iMaxPrecision && iMaxPrecision > 0) {
				sFormattedCurrencyValue += Currency.PUNCTUATION_SPACE;
			}

			// create spaces
			if (iPadding > 0) {
				sFormattedCurrencyValue = jQuery.sap.padRight(sFormattedCurrencyValue, Currency.FIGURE_SPACE, sFormattedCurrencyValue.length + iPadding);
			} else if (iPadding < 0) {
				sFormattedCurrencyValue = sFormattedCurrencyValue.substr(0, sFormattedCurrencyValue.length + iPadding);
			}

			return sFormattedCurrencyValue;
		};

		/**
		 * Get symbol of the currency, if available.
		 *
		 * @type {string}
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		Currency.prototype.getCurrencySymbol = function() {
			return this._oFormat.oLocaleData.getCurrencySymbol(this.getCurrency());
		};

		/**
		 * @see sap.ui.core.Control#getAccessibilityInfo
		 * @returns {Object} Current accessibility state of the control.
		 * @protected
		 */
		Currency.prototype.getAccessibilityInfo = function() {
			if (this._bRenderNoValClass) {
				return {};
			}
			return {description: (this.getFormattedValue() || "") + " " + (this.getCurrency() || "").trim()};
		};

		return Currency;

});
