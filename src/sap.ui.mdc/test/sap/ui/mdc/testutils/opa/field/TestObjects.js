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
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.Field</code>
				 * @param {string} sValue Value that is entered in the <code>sap.ui.mdc.Field</code>
				 * @returns {Promise} OPA waitFor
				 * @public
				 */
				iEnterTextOnTheField: function(vIdentifier, sValue) {
					return fieldActions.iEnterTextOnTheField.call(this, vIdentifier, sValue);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCField
				 * @method iOpenTheValueHelpForField
				 * @param {Object | string} oField ID or identifying properties of the <code>sap.ui.mdc.Field</code>
				 * @returns {Promise} OPA waitFor
				 * Opens the value help for a given <code>sap.ui.mdc.Field</code>.
				 */
				iOpenTheValueHelpForField: function(oField) {
					return fieldActions.iOpenTheValueHelpForField.call(this, oField);
				}
			},
			assertions: {
				/**
				 * Opa5 test assertion
				 * @memberof onTheMDCField
				 * @method iShouldSeeTheField
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.Field</code>
				 * @param {string} sValue Value that is expected in the <code>sap.ui.mdc.Field</code>
				 * @returns {Promise} OPA waitFor
				 * @public
				 */
				iShouldSeeTheFieldWithValues: function(vIdentifier, sValue) {
					return fieldAssertions.iShouldSeeTheField.call(this, vIdentifier, sValue);
				}

			}
		}
	});

});
