sap.ui.define([
	"sap/ui/test/Opa5",
	"./Common",
	"sap/ui/test/actions/Press"
], function (
	Opa5,
	Common,
	Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheDialog : {
			baseClass: Common,
			actions : {

				iPressDeleteButtonOnTheConfirmationDialog : function () {
					return this.waitFor({
							controlType : "sap.m.Button",
							matchers: function(oControl){
								return this.I18NTextExtended(oControl, "MSGBOX_DELETE", "text", "sap.m");
							}.bind(this),
							actions : new Press(),
							errorMessage : "The delete button could not be pressed"
						}
					);
				},
				iPressCancelOnTheConfirmationDialog : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "MSGBOX_CANCEL", "text", "sap.m");
						}.bind(this),
						actions : new Press(),
						errorMessage : "The cancel button could not be pressed"
					});
				}
			},

			assertions : {

				iShouldBeTakenToTheConfirmationDialog : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "MSGBOX_DELETE", "text", "sap.m");
						}.bind(this),
						success : function (aControl) {
							Opa5.assert.ok(
								aControl,
								"The delete button was found"
							);
						},
						errorMessage : "The delete button was not found"
					});
				}
			}

		}
	});
});
