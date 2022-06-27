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
				 * @param {string} sLabelName Label of the given <code>FilterField</code>
				 * @param {string} sValue Value which is to be entered in the <code>FilterField</code>
				 * @param {object} oConfig TODO: to be clarified
				 * @returns {Promise} OPA waitFor
				 */
				iEnterTextOnTheFilterField: function(sLabelName, sValue, oConfig) {
					return fieldActions.iEnterTextOnTheFilterField.apply(this, arguments);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCFilterField
				 * @method iPressKeyOnFilterFieldWithLabel
				 * @param {string} sLabelName Label of the given <code>FilterField</code>
				 * @param {string} sValue Value of the Keycode which is to be pressed
				 * @returns {Promise} OPA waitFor
				 */
				iPressKeyOnFilterFieldWithLabel: function(sLabelName, sValue) {
					return fieldActions.iPressKeyOnFilterFieldWithLabel.apply(this, arguments);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCFilterField
				 * @method iPressOnTheFilterFieldValueHelpButton
				 * @param {string} sLabelName Label of the given <code>FilterField</code>
				 * @returns {Promise} OPA waitFor
				 */
				iPressOnTheFilterFieldValueHelpButton: function(sLabelName) {
					return fieldActions.iPressOnTheFilterFieldValueHelpButton.apply(this, arguments);
				}
			},
			assertions: {
				/**
				 * OPA5 test assertion
				 * @memberof onTheMDCFilterField
				 * @method iShouldSeeTheFilterFieldWithValues
				 * @param {string} sLabelName Label of the given <code>FilterField</code>
				 * @param {object} oValues Expected values
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheFilterFieldWithValues: function(sLabelName, oValues) {
					return fieldAssertions.iShouldSeeTheFilterFieldWithValues.call(this, sLabelName, oValues);
				}
			}
		}
	});

});
