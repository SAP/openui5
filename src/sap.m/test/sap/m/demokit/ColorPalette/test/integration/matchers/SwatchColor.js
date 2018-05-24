/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/test/matchers/Matcher'], function ($, Matcher) {
	"use strict";

	/**
	 * AggregationContainsPropertyEqual - checks if an aggregation contains at least one item that has a Property set to a certain value.
	 *
	 * @class AggregationContainsPropertyEqual - checks if an aggregation contains at least one item that has a Property set to a certain value
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new AggregationContainsPropertyEqualMatcher
	 * @public
	 * @name sap.ui.test.matchers.AggregationContainsPropertyEqual
	 * @author SAP SE
	 * @since 1.23
	 */
	return Matcher.extend("sap.ui.test.matchers.AggregationContainsPropertyEqual", /** @lends sap.ui.test.matchers.AggregationContainsPropertyEqual.prototype */ {

		metadata : {
			publicMethods : [ "isMatching" ],
			properties : {
				/**
				 * The value of the color used for matching.
				 */
				color : { type : "sap.ui.core.CSSColor"}
			}
		},

		/**
		 * Checks if the control has a filled aggregation with at least one control that have a property equaling propertyName/Value.
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the Aggregation set in the property aggregationName is filled, false if it is not.
		 * @public
		 */
		isMatching : function (oControl) {
			var sColor = this.getColor() || "",
				$ColorFound = oControl.$().find(".sapMColorPaletteSquare").filter(function (iIndex, oColor) {
				return oColor.getAttribute("data-sap-ui-color") === sColor;
			});

			if (!$ColorFound.length) {
				this._oLogger.debug("Control '" + oControl + "' has no color with value '" + sColor + "'");
			}

			return $ColorFound[0];
		}

	});

}, /* bExport= */ true);
