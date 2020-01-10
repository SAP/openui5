/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/matchers/Matcher",
	"sap/base/strings/capitalize",
	"sap/ui/thirdparty/jquery"
], function(Matcher, capitalize, jQueryDOM) {
	"use strict";

	/**
	 * @class
	 * Checks if an aggregation contains a specified number of entries.
	 *
	 * As of version 1.72, it is available as a declarative matcher with the following syntax:
	 * <code><pre>{
	 *     aggregationLengthEquals: {
	 *         name: "string",
	 *         length: "integer"
	 *     }
	 * }
	 * </code></pre>
	 *
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new AggregationLengthEqualsMatcher
	 * @extends sap.ui.test.matchers.Matcher
	 * @public
	 * @name sap.ui.test.matchers.AggregationLengthEquals
	 * @author SAP SE
	 * @since 1.23
	 */
	return Matcher.extend("sap.ui.test.matchers.AggregationLengthEquals", /** @lends sap.ui.test.matchers.AggregationLengthEquals.prototype */ {

		metadata : {
			publicMethods : [ "isMatching" ],
			properties : {
				/**
				 * The name of the aggregation that is used for matching.
				 */
				name : {
					type : "string"
				},
				/**
				 * The length that aggregation <code>name</code> should have.
				 */
				length : {
					type : "int"
				}
			}
		},

		/**
		 * Checks if the control's aggregation <code>name</code> has length <code>length</code>.
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the length of aggregation <code>name</code> is the same as <code>length</code>, false if it is not.
		 * @public
		 */
		isMatching : function (oControl) {
			var sAggregationName = this.getName(),
				fnAggregation = oControl["get" + capitalize(sAggregationName, 0)];

			if (!fnAggregation) {
				this._oLogger.error("Control '" + oControl + "' does not have an aggregation called '" + sAggregationName + "'");
				return false;
			}
			var vAggregation = fnAggregation.call(oControl);
			var aAggregation = jQueryDOM.isArray(vAggregation) ? vAggregation : [vAggregation];
			var iAggregationLength = aAggregation.length;
			var iExpectedLength = this.getLength();
			var bIsMatch = iAggregationLength === iExpectedLength;
			if (!bIsMatch) {
				this._oLogger.debug("Control '" + oControl + "' has " + iAggregationLength +
					" Objects in the aggregation '" + sAggregationName + "' but it should have " + iExpectedLength);
			}
			return bIsMatch;
		}

	});

});