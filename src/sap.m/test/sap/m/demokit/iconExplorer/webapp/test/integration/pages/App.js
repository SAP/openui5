sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheAppPage: {

			assertions: {
				iShouldSeeAMessageToast: function(sMsg) {
					return this.waitFor({
						//increase OPA polling because the message toast is only shown for a brief moment
						pollingInterval: 100,
						autoWait: false,
						check: function() {
							return !!document.getElementsByClassName("sapMMessageToast").length;
						},
						success: function() {
							Opa5.assert.ok(true, sMsg + ": The message toast was displayed");
						},
						errorMessage:  sMsg + ": The message toast was not displayed"
					});
				}
			}
		}
	});
});
