/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/test/matchers/Matcher'
], function (Matcher) {
	"use strict";

	/**
	 * @class
	 * Checks if the DOMRef for a given elementType and attribute exists.
	 *
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new DOMRefMatcher
	 * @public
	 * @name sap.ui.mdc.matchers.DOMRefMatcher
	 * @author SAP SE
	 * @since 1.108
	 */
	return Matcher.extend("sap.ui.mdc.matchers.DOMRefMatcher", /** @lends sap.ui.mdc.matchers.DOMRefMatcher.prototype */ {
		metadata: {
			publicMethods: ["isMatching"],
			properties: {
				/**
				 * The Name of the elenent that is used for matching.
				 */
				elementType: {
					type: "string"
				},
				/**
				 * The configuration for the attributes of the DOMRef.
				 */
				attributes: {
					type: "object"
				}
			}
		},

		/**
		 * Checks if the control has a DOMRef for a given querySelector
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the DOMRef exists.
		 * @public
		 */
		isMatching: function (oControl) {
			var sQuerySelector = this.getElementType();
			var oAttributes = this.getAttributes();

			Object.keys(oAttributes).forEach(function(sKey) {
				sQuerySelector += "[" + sKey + "='" + oAttributes[sKey] + "']";
			});

			return oControl.getDomRef().querySelector(sQuerySelector);
		}
	});

});