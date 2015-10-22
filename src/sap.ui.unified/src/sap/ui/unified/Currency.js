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
		};

		/**
		 * Value property setter
		 *
		 * @override
		 * @param sValue
		 * @returns {sap.ui.unified.Currency} <code>this</code> pointer for chaining
		 */
		Currency.prototype.setValue = function(sValue) {
			// force the invalidation if the value should be displayed
			// to re-render the control finally
			var bHasValue = this._hasValue(),
				bHasNoValueClass = this.$().hasClass("sapUiUfdCurrencyNoVal");
			if (bHasValue === bHasNoValueClass) {
				this.invalidate();
			}
			this.setProperty("value", sValue);
			return this;
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
				sFormattedCurrencyValue;

			if (sCurrency === "*") {
				return "";
			}

			iMaxPrecision = this.getMaxPrecision();
			iPadding = iMaxPrecision - this._oFormat.oLocaleData.getCurrencyDigits(sCurrency);
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
		 * Checks if the binding has a proper value or the value is undefined. In case of
		 * undefined value the Currency control will not display any value! This workaround
		 * is necessary because of the default value 0 suppresses to set a undefined or null value
		 * instead and this cannot be changed due to compatibility.
		 * @private
		 */
		Currency.prototype._hasValue = function() {
			var oValueBinding = this.getBinding("value"),
				bHasBinding = oValueBinding !== undefined;

			return bHasBinding ? oValueBinding.getValue() !== undefined : true /* no databinding => always true */;
		};


		return Currency;

}, /* bExport= */ true);
