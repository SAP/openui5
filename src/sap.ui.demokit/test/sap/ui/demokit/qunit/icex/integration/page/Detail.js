sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/matchers/I18NText',
	'test/page/Common',
	'sap/ui/test/actions/Press'
], function(Opa5, PropertyStrictEquals, I18NText, Common, Press) {
	"use strict";

	Opa5.createPageObjects({
		onTheDetail : {
			baseClass: Common,
			actions : {
				iFavoriteTheIcon : function () {
					return this.waitFor({
						viewName: "Detail",
						id: "favorite",
						errorMessage: "Failed to press the favorite button",
						actions: new Press()
					});
				}
			},
			assertions: {
				iShallSeeTwelveButtonsWithIcon : function (sIcon) {
					return this.waitFor({
						viewName: "Detail",
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({ name: "icon", value: "sap-icon://" + sIcon }),
						errorMessage: "The detail did not contain 12 buttons with icon " + sIcon,
						success: function (aListItems) {
							Opa5.assert.strictEqual(aListItems.length, 12, "Found 12 buttons with icon " + sIcon);
						}
					});
				},
				iShallSeeTheIconCode : function (sIconCode) {
					return this.waitFor({
						viewName: "Detail",
						controlType: "sap.m.Label",
						matchers: new I18NText({
							propertyName: "text",
							key: "iconIDLabel",
							parameters: [ sIconCode ]
						}),
						errorMessage: "The detail did not contain a label for the icon code " + sIconCode,
						success: function (aListItems) {
							Opa5.assert.ok(true, "Found a label with icon code " + sIconCode);
						}
					});
				},
				iShouldSeeAMessageToast : function () {
					return this.waitFor({
						pollingInterval : 100,
						viewName : "Detail",
						check : function () {
							return !!Opa5.getJQuery()(".sapMMessageToast").is(":visible");
						},
						success : function () {
							Opa5.assert.ok(true, "Found a Toast");
						},
						errorMessage : "No Toast message detected!"
					})
				}
			}
		}
	});
});