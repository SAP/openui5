/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"../valueHelp/Actions",
	"../valueHelp/Assertions"
], function(
	Opa5,
	Actions,
	Assertions
) {
	"use strict";

	/**
	 * @namespace onTheMDCValueHelp
	 */
	Opa5.createPageObjects({
		onTheMDCValueHelp: {
			actions: {
				/**
				 * OPA5 test action
				 * @memberof onTheMDCValueHelp
				 * @method iCloseTheValueHelpDialog
				 * @param {boolean} bCancel Boolean that defines if the Cancel button is pressed
				 * @returns {Promise} OPA waitFor
				 * Closes an open value help dialog by pressing the OK / Cancel button.
				 */
				iCloseTheValueHelpDialog: function(bCancel) {
					return Actions.iCloseTheValueHelpDialog.call(this, bCancel);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCValueHelp
				 * @method iNavigateToValueHelpContent
				 * @param {object} oProperties Properties identifying the content to navigate to
				 * @param {string} [sValueHelp] Optional identifier for the affected valuehelp
				 * @returns {Promise} OPA waitFor
				 * Navigates inside an open value help dialog programmatically and waits for rendering of expected display content
				 */
				iNavigateToValueHelpContent: function(oProperties, sValueHelp) {
					return Actions.iNavigateToValueHelpContent.call(this, oProperties, sValueHelp);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCValueHelp
				 * @method iRemoveValueHelpToken
				 * @param {string} sValue Identifier for the token to be removed (should equal it's text property)
				 * @param {string} [sValueHelp] Optional identifier for the affected valuehelp
				 * @returns {Promise} OPA waitFor
				 * Removes a token and the condition it represents from the given valuehelp
				 */
				iRemoveValueHelpToken: function (sValue, sValueHelp) {
					return Actions.iRemoveValueHelpToken.call(this, sValue, sValueHelp);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCValueHelp
				 * @method iRemoveAllValueHelpTokens
				 * @param {string} [sValueHelp] Optional identifier for the affected valuehelp
				 * @returns {Promise} OPA waitFor
				 * Removes all tokens and the conditions they represent from the given valuehelp
				 */
				iRemoveAllValueHelpTokens: function (sValueHelp) {
					return Actions.iRemoveAllValueHelpTokens.call(this, sValueHelp);
				}
			},

			assertions: {
				/**
				 * OPA5 test action
				 * @memberof onTheMDCValueHelp
				 * @method iShouldSeeValueHelpListItems
				 * @param {string|Array<string>|Array<Array<String>>} vTexts Text(s) the searched listitems must contain
				 * @param {string} [sValueHelp] Optional identifier for the affected valuehelp
				 * @returns {Promise} OPA waitFor
				 * Searches one or more listitems containing cells with the given text(s)
				 */
				iShouldSeeValueHelpListItems: function(vTexts, sValueHelp) {
					return Assertions.iShouldSeeValueHelpListItems.call(this, vTexts, sValueHelp);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCValueHelp
				 * @method iShouldSeeTheValueHelpDialog
				 * @param {string} [sValueHelp] Optional identifier for the affected valuehelp
				 * @returns {Promise} OPA waitFor
				 * Searches for an open dialog which has a valuehelp ancestor
				 */
				iShouldSeeTheValueHelpDialog: function(sValueHelp) {
					return Assertions.iShouldSeeTheValueHelpDialog.call(this, sValueHelp);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCValueHelp
				 * @method iShouldSeeValueHelpContent
				 * @param {object} oProperties Properties identifying the searched content
				 * @param {string} [sValueHelp] Optional identifier for the affected valuehelp
				 * @returns {Promise} OPA waitFor
				 * Searches for an valuehelp content by properties and a given valuehelp ancestor
				 */
				iShouldSeeValueHelpContent: function(oProperties, sValueHelp) {
					return Assertions.iShouldSeeValueHelpContent.call(this, oProperties, sValueHelp);
				},
				/**
				 * OPA5 test action
				 * @memberof onTheMDCValueHelp
				 * @method iShouldSeeValueHelpToken
				 * @param {object} sValue Text the token should hold
				 * @param {string} [sValueHelp] Optional identifier for the affected valuehelp
				 * @returns {Promise} OPA waitFor
				 * Searches a token in the valuehelp dialog's tokenizer by text
				 */
				iShouldSeeValueHelpToken: function (sValue, sValueHelp) {
					return Assertions.iShouldSeeValueHelpToken.call(this, sValue, sValueHelp);
				}
			}
		}
	});

});
