/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/test/matchers/Matcher'], function (Matcher) {
	"use strict";

	/**
	 * Creates a new instance of the SwatchColor matcher.
	 *
	 * @class Checks if a color palette entry matches the given color.
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new SwatchColor matcher
	 * @private
	 * @name cp.opa.test.env.integration.matchers.SwatchColor
	 * @author SAP SE
	 * @since 1.23
	 */
	return Matcher.extend("cp.opa.test.env.integration.matchers.SwatchColor", /** @lends cp.opa.test.env.integration.matchers.SwatchColor.prototype */ {

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
		 * Checks if one of the control's color palette entries has the given color.
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if at least one of the control's color palette entries has the given color
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

});
