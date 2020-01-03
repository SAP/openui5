/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/test/matchers/Matcher',
	'sap/ui/test/matchers/AggregationLengthEquals'
], function(Matcher, AggregationLengthEquals) {
	"use strict";

	var oAggregationLengthMatcher = new AggregationLengthEquals({
		length: 0
	});

	/**
	 * @class
	 * Checks if an aggregation is empty.
	 *
	 * As of version 1.72, it is available as a declarative matcher with the following syntax:
	 * <code><pre>{
	 *     aggregationEmpty: {
	 *         name: "string"
	 *     }
	 * }
	 * </code>
	 *
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new AggregationEmptyMatcher
	 * @extends sap.ui.test.matchers.Matcher
	 * @public
	 * @name sap.ui.test.matchers.AggregationEmpty
	 */
	return Matcher.extend("sap.ui.test.matchers.AggregationEmpty", /** @lends sap.ui.test.matchers.AggregationEmpty.prototype */ {

		metadata : {
			publicMethods : [ "isMatching" ],
			properties : {
				/**
				 * The name of the aggregation that is used for matching.
				 */
				name : {
					type : "string"
				}
			}
		},

		/**
		 * Checks if the control has an empty aggregation.
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the Aggregation set in the property aggregationName is empty, false if it is not.
		 * @public
		 */
		isMatching : function (oControl) {
			oAggregationLengthMatcher.setName(this.getName());
			return oAggregationLengthMatcher.isMatching(oControl);
		}

	});

});