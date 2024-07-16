/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/test/matchers/Matcher",
	"sap/base/strings/capitalize"
], function (ManagedObject, Matcher, capitalize) {
	"use strict";

	/**
	 * @class
	 * Checks if an aggregation contains at least one item that has a property set to a certain value.
	 *
	 * As of version 1.72, it is available as a declarative matcher with the following syntax:
	 * <pre><code>{
	 *     aggregationContainsPropertyEqual: {
	 *         aggregationName: "string",
	 *         propertyName: "string",
	 *         propertyValue: "string"
	 *     }
	 * }
	 * </code></pre>
	 *
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new AggregationContainsPropertyEqualMatcher
	 * @public
	 * @name sap.ui.test.matchers.AggregationContainsPropertyEqual
	 * @author SAP SE
	 * @since 1.23
	 */
	return Matcher.extend("sap.ui.test.matchers.AggregationContainsPropertyEqual", /** @lends sap.ui.test.matchers.AggregationContainsPropertyEqual.prototype */ {

		metadata: {
			properties: {
				/**
				 * The Name of the aggregation that is used for matching.
				 */
				aggregationName: {
					type: "string"
				},
				/**
				 * The Name of the property that is used for matching.
				 */
				propertyName: {
					type: "string"
				},
				/**
				 * The value of the Property that is used for matching.
				 */
				propertyValue: {
					type: "any"
				}
			}
		},

		constructor: function (mSettings) {
			if (mSettings && mSettings.propertyValue) {
				mSettings.propertyValue = ManagedObject.escapeSettingsValue(mSettings.propertyValue);
			}
			Matcher.prototype.constructor.call(this, mSettings);
		},

		/**
		 * Checks if the control has a filled aggregation with at least one control that have a property equaling propertyName/Value.
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the Aggregation set in the property aggregationName is filled, false if it is not.
		 * @public
		 */
		isMatching: function (oControl) {
			var sAggregationName = this.getAggregationName(),
				sPropertyName = this.getPropertyName(),
				vPropertyValue = this.getPropertyValue(),
				fnAggregation = oControl["get" + capitalize(sAggregationName, 0)];

			if (!fnAggregation) {
				this._oLogger.error("Control '" + oControl + "' does not have an aggregation called '" + sAggregationName + "'");
				this._oLogger.trace("Control '" + oControl + "' has aggregations: '" + Object.keys(oControl.mAggregations) + "'");
				return false;
			}

			var vAggregation = fnAggregation.call(oControl);
			var aAggregation = Array.isArray(vAggregation) ? vAggregation : [vAggregation];

			var bMatches = aAggregation.some(function (vAggregationItem) {
				var fnPropertyGetter = vAggregationItem["get" + capitalize(sPropertyName, 0)];

				//aggregation item does not have such a property
				if (!fnPropertyGetter) {
					this._oLogger.trace("Control '" + oControl + "' aggregation '" + sAggregationName + "': controls do not have a property '" + sPropertyName + "'");
					return false;
				}

				return fnPropertyGetter.call(vAggregationItem) === vPropertyValue;
			}.bind(this));

			if (!bMatches) {
				this._oLogger.debug("Control '" + oControl + "' has no property '" + sPropertyName + "' with the value '" +
					vPropertyValue + "' in the aggregation '" +
					sAggregationName + "'");
			}

			return bMatches;
		}

	});

});