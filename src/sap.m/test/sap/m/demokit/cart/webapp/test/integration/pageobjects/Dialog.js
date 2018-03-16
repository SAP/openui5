sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/actions/Press'
], function (
	Opa5,
	PropertyStrictEquals,
	Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheDialog : {

			actions : {

				iPressDeleteButtonOnTheConfirmationDialog : function () {
					return this.waitFor({
							controlType : "sap.m.Button",
							matchers : new PropertyStrictEquals({name : "text", value : "Delete"}),
							actions : new Press(),
							errorMessage : "The delete button could not be pressed"
						}
					);
				},
				iPressCancelOnTheConfirmationDialog : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers : new PropertyStrictEquals({name : "text", value : "Cancel"}),
						actions : new Press(),
						errorMessage : "The cancel button could not be pressed"
					});
				}
			},

			assertions : {

				iShouldBeTakenToTheConfirmationDialog : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers : new PropertyStrictEquals({name : "text", value : "Delete"}),
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
