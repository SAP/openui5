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
	 * @namespace onTheMDCFilterField
	 */
	Opa5.createPageObjects({
		onTheMDCFilterField: {
			actions: {
				/**
				 * OPA5 test action
				 * @memberof onTheMDCFilterField
				 * @method iEnterTextOnTheFilterField
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.FilterField</code>
				 * @param {string} sValue Value that is entered in the <code>sap.ui.mdc.FilterField</code>
				 * @returns {Promise} OPA waitFor
				 */
				iEnterTextOnTheFilterField: function(vIdentifier, sValue) {
					return fieldActions.iEnterTextOnTheFilterField.call(this, vIdentifier, sValue);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCFilterField
				 * @method iPressKeyOnFilterFieldWithLabel
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.FilterField</code>
				 * @param {string} sValue Value of the key code that is pressed
				 * @returns {Promise} OPA waitFor
				 */
				iPressKeyOnFilterFieldWithLabel: function(vIdentifier, sValue) {
					return fieldActions.iPressKeyOnFilterFieldWithLabel.call(this, vIdentifier, sValue);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCFilterField
				 * @method iPressOnTheFilterFieldValueHelpButton
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.FilterField</code>
				 * @returns {Promise} OPA waitFor
				 */
				iPressOnTheFilterFieldValueHelpButton: function(vIdentifier) {
					return fieldActions.iPressOnTheFilterFieldValueHelpButton.call(this, vIdentifier);
				}
			},
			assertions: {
				/**
				 * OPA5 test assertion
				 * @memberof onTheMDCFilterField
				 * @method iShouldSeeTheFilterField
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.FilterField</code>
				 * @param {object} oValues Expected values
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheFilterFieldWithValues: function(vIdentifier, oValues) {
					return fieldAssertions.iShouldSeeTheFilterField.call(this, vIdentifier, oValues);
				}
			}
		}
	});

});
