/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/test/matchers/Matcher', "sap/base/strings/capitalize"], function(Matcher, capitalize) {
	"use strict";

	/**
	 * @class
	 * Checks if a property has the exact same value.
	 *
	 * As of version 1.72, it is available as a declarative matcher with the following syntax:
	 * <code><pre>{
	 *     propertyStrictEquals: {
	 *         name: "string",
	 *         value: "any"
	 *     }
	 * }
	 * </code></pre>
	 *
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new PropertyStrictEquals
	 * @public
	 * @name sap.ui.test.matchers.PropertyStrictEquals
	 * @author SAP SE
	 * @since 1.23
	 */
	return Matcher.extend("sap.ui.test.matchers.PropertyStrictEquals", /** @lends sap.ui.test.matchers.PropertyStrictEquals.prototype */ {

		metadata : {
			publicMethods : [ "isMatching" ],
			properties : {
				/**
				 * The Name of the property that is used for matching.
				 */
				name : {
					type : "string"
				},
				/**
				 * The value of the property that is used for matching.
				 */
				value : {
					type : "any"
				}
			}
		},

		/**
		 * Checks if the control has a property that matches the value
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the property has a strictly matching value.
		 * @public
		 */
		isMatching : function (oControl) {
			var sPropertyName = this.getName(),
				fnProperty = oControl["get" + capitalize(sPropertyName, 0)];

			if (!fnProperty) {
				this._oLogger.error("Control '" + oControl + "' does not have a property '" + sPropertyName + "'");
				return false;
			}

			var vPropertyValue = fnProperty.call(oControl);
			var bMatches = vPropertyValue === this.getValue();
			if (!bMatches) {
				this._oLogger.debug("Control '" + oControl + "' property '" + sPropertyName +
					"' has value '" + vPropertyValue + "' but should have value '" + this.getValue() + "'");
			}
			return bMatches;

		}
	});
});