/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/test/matchers/Matcher'
], function (Matcher) {
	"use strict";

	/**
	 * @class
	 * Checks if the date values for a given Control are correct.
	 *
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new DateValue
	 * @public
	 * @name sap.ui.mdc.matchers.DateValue
	 * @author SAP SE
	 * @since 1.108
	 */
	return Matcher.extend("sap.ui.mdc.matchers.DateValue", /** @lends sap.ui.mdc.matchers.DateValue.prototype */ {
		metadata: {
			publicMethods: ["isMatching"],
			properties: {
				/**
				 * The dateValue which is expected.
				 */
				dateValue: {
					type: "Date"
				},
				/**
				 * The secondDateValie which is expected.
				 */
				 secondDateValue: {
					type: "Date"
				}
			}
		},

		/**
		 * Checks if the control has the expected date values
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the date values are correct.
		 * @public
		 */
		isMatching: function (oControl) {
			var bDateValueMatching = true;
			var bSecondDateValueMatching = true;

			if (oControl.getDateValue && oControl.getDateValue() && this.getDateValue()) {
				bDateValueMatching = oControl.getDateValue().toString() === this.getDateValue().toString();
			}

			if (oControl.getSecondDateValue && oControl.getSecondDateValue() && this.getSecondDateValue()) {
				bSecondDateValueMatching = oControl.getSecondDateValue().toString() === this.getSecondDateValue().toString();
			}

			return bDateValueMatching && bSecondDateValueMatching;
		}
	});

});