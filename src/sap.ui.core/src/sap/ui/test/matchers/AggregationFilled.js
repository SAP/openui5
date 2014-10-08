/*!
 * ${copyright}
 */

sap.ui.define(['./Matcher'], function (fnMatcher) {

	/**
	 * @class AggregationFilled - checks if an aggregation contains at least one entry
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {string} [name] the name of the aggregation
	 * @public
	 * @name sap.ui.test.matchers.AggregationFilled
	 * @author SAP SE
	 * @since 1.23
	 */
	return fnMatcher.extend("sap.ui.test.matchers.AggregationFilled", {

		metadata : {
			publicMethods : [ "isMatching" ],
			properties : {
				name : {
					type : "string"
				}
			}
		},

		/**
		 * Getter for property <code>name</code>.
		 * 
		 * The name of the aggregation that is used for matching
		 *
		 * @return {string} the name of the aggregation <code>name</code>
		 * @public
		 * @name sap.ui.test.matchers.AggregationFilled#getName
		 * @function
		 */

		/**
		 * Setter for property <code>name</code>.
		 * 
		 * @param {string} sName the name of the aggregation <code>name</code>
		 * @return {sap.ui.test.matchers.AggregationFilled} <code>this</code> to allow method chaining
		 * @public
		 * @name sap.ui.test.matchers.AggregationFilled#setName
		 * @function
		 */

		/**
		 * Checks if the control has a filled aggregation
		 * 
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the Aggregation set in the property aggregationName is filled, false if it is not.
		 * @public
		 * @name sap.ui.test.matchers.AggregationFilled#isMatching
		 * @function
		 */
		isMatching : function (oControl) {
			var sAggregationName = this.getName(),
				fnAggregation = oControl["get" + jQuery.sap.charToUpperCase(sAggregationName, 0)];

			if (!fnAggregation) {
				jQuery.sap.log.error("Control " + oControl.sId + " does not have an aggregation called: " + sAggregationName);
				return false;
			}

			return !!fnAggregation.call(oControl).length;
		}

	});

}, /* bExport= */ true);