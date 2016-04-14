/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Currency.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/core/format/NumberFormat'],
	function(jQuery, Control, LocaleData, NumberFormat) {
		"use strict";

		/**
		 * Constructor for a new Currency.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * A text view which displays currency values and aligns them at the separator
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
				 * The currency value
				 */
				value : {type : "float", group : "Appearance", defaultValue : 0},

				/**
				 * The ISO 4217 currency code
				 */
				currency : {type : "string", group : "Appearance", defaultValue : null},

				/**
				 * Defines the space that is available for the precision of the various currencies.
				 */
				maxPrecision : {type : "int", group : "Appearance", defaultValue : 3},

				/**
				 * Show the currency symbol instead of the ISO currency code
				 */
				useSymbol : {type : "boolean", group : "Appearance", defaultValue : true}
			}
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

		/**
		 * Value property setter
		 *
		 * @override
		 * @param sValue
		 * @returns {sap.ui.unified.Currency} <code>this</code> pointer for chaining
		 */
		Currency.prototype.setValue = function(sValue) {
			// Check if the value is bound and is undefined. In case of
			// undefined value the Currency control will not display any value! This workaround
			// is necessary because of the default value 0 suppresses to set a undefined or null value
			// instead and this cannot be changed due to compatibility.
			if (this.isBound("value")) {
				this._bRenderNoValClass = sValue === undefined;
				// Toggle class if control is rendered
				if (this.$()) {
					this.$().toggleClass("sapUiUfdCurrencyNoVal", this._bRenderNoValClass);
				}
			}

			this.setProperty("value", sValue, true);
			this._renderValue();
			return this;
		};

		/**
		 * Currency property setter
		 * @param sValue {String} The ISO 4217 currency code
		 * @return {object} this to enable chaining
		 */
		Currency.prototype.setCurrency = function (sValue) {
			this.setProperty("currency", sValue, true);
			this._renderCurrency();
			// We need to update the value if the last currency value was * or the new value is *
			if (this._sLastCurrency === "*" || sValue === "*") {
				this._renderValue();
			}
			this._sLastCurrency = sValue;
			return this;
		};

		/**
		 * UseSymbol property setter
		 * @param bValue {boolean}
		 * @return {object} this to enable chaining
		 */
		Currency.prototype.setUseSymbol = function (bValue) {
			this.setProperty("useSymbol", bValue, true);
			this._renderCurrency();
			return this;
		};

		/**
		 * MaxPrecision property setter
		 * @param iValue {int}
		 * @return {object} this to enable chaining
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
		 * The formatted value
		 *
		 * @type string
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
			sFormattedCurrencyValue = this._oFormat.format(this.getValue(), sCurrency);

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
		 * Get symbol of the currency, if available
		 *
		 * @type string
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		Currency.prototype.getCurrencySymbol = function() {
			return this._oFormat.oLocaleData.getCurrencySymbol(this.getCurrency());
		};

		/**
		 * @see {sap.ui.core.Control#getAccessibilityInfo}
		 * @protected
		 */
		Currency.prototype.getAccessibilityInfo = function() {
			if (this._bRenderNoValClass) {
				return {};
			}
			return {description: (this.getFormattedValue() || "") + " " + (this.getCurrency() || "").trim()};
		};

		return Currency;

}, /* bExport= */ true);
