/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"./Actions",
	"./Assertions"
], function(
	Opa5,
	multiValueFieldActions,
	multiValueFieldAssertions
) {
	"use strict";

	/**
	 * @namespace onTheMDCField
	 */
	Opa5.createPageObjects({
		onTheMDCMultiValueField: {
			actions: {
				/**
				 * Opa5 test action
				 * @memberof onTheMDCMultiValueField
				 * @method iEnterTextOnTheMultiValueField
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.MultiValueField</code>
				 * @param {string} sValue Value that is entered in the <code>sap.ui.mdc.MultiValueField</code>
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iEnterTextOnTheMultiValueField: function(vIdentifier, sValue) {
					return multiValueFieldActions.iEnterTextOnTheMultiValueField.call(this, vIdentifier, sValue);
				}
			},
			assertions: {
				/**
				 * Opa5 test assertion
				 * @memberof onTheMDCMultiValueField
				 * @method iShouldSeeTheMultiValueFieldWithValues
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.MultiValueField</code>
				 * @param {string} sValue Value that is expected in the <code>sap.ui.mdc.MultiValueField</code>
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheMultiValueFieldWithValues: function(vIdentifier, sValue) {
					return multiValueFieldAssertions.iShouldSeeTheMultiValueField.call(this, vIdentifier, sValue);
				},
				/**
				 * Opa5 test assertion
				 * @memberof onTheMDCMultiValueField
				 * @method iShouldSeeTheMultiValueField
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.MultiValueField</code>
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheMultiValueField: function(vIdentifier) {
					return multiValueFieldAssertions.iShouldSeeTheMultiValueField.call(this, vIdentifier);
				},
				/**
				 * Opa5 test assertion
				 * @memberof onTheMDCMultiValueField
				 * @method iShouldSeeTheMultiValueFieldWithMatchingValue
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.MultiValueField</code>
				 * @param {object[]} aConditions Conditions of the <code>sap.ui.mdc.MultiValueField</code>
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeConditions: function(vIdentifier, aConditions) {
					return multiValueFieldAssertions.iShouldSeeConditions.call(this, vIdentifier, aConditions);
				},
				/**
				 * Opa5 test assertion
				 * @memberof onTheMDCMultiValueField
				 * @method iShouldSeeTheMultiValueFieldWithMatchingValue
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.MultiValueField</code>
				 * @param {string[]} aKeys Keys of the values that are shown in a <code>sap.ui.mdc.MultiValueField</code>
				 * @returns {Promise} OPA waitFor
				 * @private
				 */
				iShouldSeeTheKeys: function(vIdentifier, aKeys) {
					return multiValueFieldAssertions.iShouldSeeTheKeys.call(this, vIdentifier, aKeys);
				}
			}
		}
	});

});
