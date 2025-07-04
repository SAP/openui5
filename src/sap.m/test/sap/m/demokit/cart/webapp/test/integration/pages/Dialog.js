sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/I18NText"
], (Opa5, Press, I18NText) => {
	"use strict";

	Opa5.createPageObjects({
		onTheDialog: {
				actions: {
				iPressDeleteButtonOnTheConfirmationDialog() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: {
							properties: {
								text: "Delete"
							}
						},
						actions: new Press(),
						errorMessage: "The delete button could not be pressed"
					});
				},

				iPressCancelOnTheConfirmationDialog() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: {
							properties: {
								text: "Cancel"
							}
						},
						actions: new Press(),
						errorMessage: "The cancel button could not be pressed"
					});
				}
			},

			assertions: {
				iShouldBeTakenToTheConfirmationDialog() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: {
							properties: {
								text: "Delete"
							}
						},
						success(aControl) {
							Opa5.assert.ok(
								aControl,
								"The delete button was found"
							);
						},
						errorMessage: "The delete button was not found"
					});
				}
			}

		}
	});
});
