/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Matcher'], function (jQuery, fnMatcher) {
	"use strict";

	/**
	 * PropertyStrictEquals - checks if a property has the exact same value.
	 *
	 * @class PropertyStrictEquals - checks if a property has the exact same value
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new PropertyStrictEquals
	 * @public
	 * @name sap.ui.test.matchers.PropertyStrictEquals
	 * @author SAP SE
	 * @since 1.23
	 */
	return fnMatcher.extend("sap.ui.test.matchers.PropertyStrictEquals", /** @lends sap.ui.test.matchers.PropertyStrictEquals.prototype */ {

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
				fnProperty = oControl["get" + jQuery.sap.charToUpperCase(sPropertyName, 0)];

			if (!fnProperty) {
				jQuery.sap.log.error("Control " + oControl.sId + " does not have a property called: " + sPropertyName, this._sLogPrefix);
				return false;
			}

			return fnProperty.call(oControl) === this.getValue();

		}
	});

}, /* bExport= */ true);