/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"./Actions",
	"./Assertions"
], function(
	Opa5,
	fieldActions,
	fieldAssertions
) {
	"use strict";

	/**
	 * @namespace onTheMDCField
	 */
	Opa5.createPageObjects({
		onTheMDCField: {
			actions: {
				/**
				 * Opa5 test action
				 * @memberof onTheMDCField
				 * @method iEnterTextOnTheField
				 * @param {string} sId ID of the given <code>sap.ui.mdc.Field</code>
				 * @param {Object} oValue Value that is entered in the <code>sap.ui.mdc.Field</code>
				 * @returns {Promise} OPA waitFor
				 * @public
				 */
				iEnterTextOnTheField: function(sId, oValue) {
					return fieldActions.iEnterTextOnTheField.apply(this, arguments);
				}
			},
			assertions: {
				/**
				 * Opa5 test assertion
				 * @memberof onTheMDCField
				 * @method iShouldSeeTheFieldWithValues
				 * @param {string} sId ID of the given <code>sap.ui.mdc.Field</code>
				 * @param {object} oValues Values that are expected in the <code>sap.ui.mdc.Field</code>
				 * @returns {Promise} OPA waitFor
				 * @public
				 */
				iShouldSeeTheFieldWithValues: function(sId, oValues) {
					return fieldAssertions.iShouldSeeTheFieldWithValues.apply(this, arguments);
				}

			}
		}
	});

});
