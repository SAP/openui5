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
				}
			}
		}
	});

});
