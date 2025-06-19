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
	 * Allowd keys for keyboard navigation in {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.MultiValueField MultiValueField}, and {@link sap.ui.mdc.FilterField FilterField}
	 *
	 * @static
	 * @constant
	 * @typedef {int} sap.ui.mdc.field.NavigationKeys Only the following keys of {@link sap.ui.events.KeyCodes} are allowed:
	 * <code>ARROW_DOWN</code>, <code>ARROW_UP</code>, <code>HOME</code>, <code>END</code>, <code>PAGE_DOWN</code> and <code>PAGE_UP</code>
	 * @public
	 * @since 1.138
	 */

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
				 * @param {Object} [oConfig] Configuration object
				 * @returns {Promise} OPA waitFor
				 */
				iEnterTextOnTheFilterField: function(vIdentifier, sValue, oConfig) {
					return fieldActions.iEnterTextOnTheFilterField.call(this, vIdentifier, sValue, oConfig);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCFilterField
				 * @method iNavigateOnTheFilterField
				 * @param {string | Object} vIdentifier ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.FilterField</code>
				 * @param {sap.ui.mdc.field.NavigationKeys} iKeyCode Key code that is pressed on the <code>sap.ui.mdc.FilterField</code>
				 * @param {Object} [oConfig] Configuration object
				 * @returns {Promise} OPA waitFor
				 * @since 1.138
				 */
				iNavigateOnTheFilterField: function(vIdentifier, iKeyCode, oConfig) {
					return fieldActions.iNavigateOnTheFilterField.call(this, vIdentifier, iKeyCode, oConfig);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCFilterField
				 * @method iOpenTheValueHelpForFilterField
				 * @param {Object | string} oFilterField ID or identifying properties of the <code>sap.ui.mdc.FilterField</code>
				 * @returns {Promise} OPA waitFor
				 * Opens the value help for a given <code>sap.ui.mdc.FilterField</code>.
				 */
				 iOpenTheValueHelpForFilterField: function(oFilterField) {
					return fieldActions.iOpenTheValueHelpForFilterField.call(this, oFilterField);
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
