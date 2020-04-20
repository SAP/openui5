sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor"
], function(Opa5, Press, Properties, Ancestor) {
	"use strict";

	var iTeamCount;

	Opa5.createPageObjects({

		onTheMainPage: {

			actions: Object.assign({

				iClickOnALegendButton: function (oControlIds) {

					return this.waitFor({
						id: oControlIds.sLegendButtonId,
						fragmentId: oControlIds.sFragmentId,
						actions: new Press(),
						success: function () {
							this.waitFor({
								controlType: "sap.m.ResponsivePopover",
								matchers : new Properties({ title: "Calendar Legend" }),
								errorMessage: "Could not open the legend of the Calendar"
							});
						},
						errorMessage: "Could not find the Legend Button of the Calendar"
					});
				},

				iSelectACalendarView: function (oControlIds, sViewKey) {

					return this.waitFor({
						id: oControlIds.sCalendarId,
						fragmentId: oControlIds.sFragmentId,
						success: function (oCalendar) {
							var oViewSwitch = oCalendar._getHeader()._getOrCreateViewSwitch();
							this.waitFor({
								controlType: "sap.m.SegmentedButtonItem",
								matchers: [
									new Ancestor(oViewSwitch),
									new Properties({ key: sViewKey })
								],
								actions: new Press(),
								errorMessage: "Could not select a View of the Calendar"
							});
						},
						errorMessage: "Could not find the View Switch of the Calendar"
					});
				},

				iClickOnCreateButton: function (oControlIds) {

					return this.waitFor({
						id: oControlIds.sCreateButtonId,
						fragmentId: oControlIds.sFragmentId,
						actions: new Press(),
						errorMessage: "Could not find the Create Button"
					});
				},

				iSelectATeamMember: function (oControlIds, iSelectedMember) {

					return this.waitFor({
						id: oControlIds.sSelectorId,
						fragmentId: oControlIds.sFragmentId,
						actions: new Press(),
						success: function (oSelect) {
							var sSelectedMemberName = oSelect.getItems()[iSelectedMember].getText();
							this.waitFor({
								controlType: "sap.ui.core.Item",
								matchers: [
									new Ancestor(oSelect),
									new Properties({ text: sSelectedMemberName })
								],
								actions: new Press(),
								errorMessage: "Could not select an item of Team Member Selector"
							});
						},
						errorMessage: "Could not find Team Member Selector"
					});
				}

			}),

			assertions: Object.assign({

				thePlanningCalendarShouldHaveAllTeamMembers: function (oControlIds) {
					return this.waitFor({
						id: oControlIds.sCalendarId,
						fragmentId: oControlIds.sFragmentId,
						success: function (oCalendar) {
							var iRowsCount = oCalendar.getRows().length,
								oModel = oCalendar.getBinding("rows").getModel();
							iTeamCount = oModel.getProperty("/team").length;
							Opa5.assert.strictEqual(
								iRowsCount,
								iTeamCount,
								"The Planning Calendar has " + iRowsCount + " rows"
							);
						},
						errorMessage: "The Planning Calendar rows are not equal to the team members"
					});
				},

				theTeamSelectorHaveAllTeamMembers: function (oControlIds) {
					return this.waitFor({
						id: oControlIds.sSelectorId,
						fragmentId: oControlIds.sFragmentId,
						success: function (oSelector) {
							var iSelectorItems = oSelector.getItems().length;
							Opa5.assert.strictEqual(
								iSelectorItems,
								iTeamCount + 1,
								"The Calendar has " + iSelectorItems + " items and the Team Member Selector has (1 + " + iTeamCount + ") items"
							);
						},
						errorMessage: "The Calendar does not have all Team Members in the Team Member Selector"
					});
				},

				theCalendarViewIsProperlySet: function (oControlIds, sExpectedViewKey) {
					return this.waitFor({
						id: oControlIds.sCalendarId,
						fragmentId: oControlIds.sFragmentId,
						success: function (oCalendar) {
							var sSelectedViewKey;
							if (!sExpectedViewKey) {
								// there is no expected key, use initial one (from the model)
								sExpectedViewKey = oCalendar.getBinding("rows").getModel().getProperty("/viewKey");
							}
							if (!!oCalendar.getViewKey) {
								sSelectedViewKey = oCalendar.getViewKey();
							} else {
								sSelectedViewKey = sap.ui.getCore().byId(oCalendar.getSelectedView()).getKey();
							}
							Opa5.assert.strictEqual(
								sExpectedViewKey,
								sSelectedViewKey,
								"The Calendar has '" + sExpectedViewKey + "' view selected"
							);
						},
						errorMessage: "The Calendar does not have proper view selected"
					});
				},

				theCalendarLegendIsOpened: function () {
					return this.waitFor({
						controlType: "sap.m.ResponsivePopover",
						success: function (oPopover) {
							Opa5.assert.ok(oPopover[0].isOpen(),
								"The Calendar Legend is opened"
							);
						},
						errorMessage: "The Calendar Legend is not opened"
					});
				},

				theMessageToastAppears: function () {
					return this.waitFor({
						pollingInterval: 100,
						viewName: "Main",
						check: function () {
							return !!sap.ui.test.Opa5.getJQuery()(".sapMMessageToast").length;
						},
						success: function () {
							Opa5.assert.ok(
								true,
								"The MessageToast appears"
							);
						},
						errorMessage: "The MessageToast doesn't appear"
					});
				},

				theSinglePlanningCalendarIsLoaded: function (oControlIds, iSelectedMember) {
					return this.waitFor({
						id: oControlIds.sCalendarId,
						fragmentId: oControlIds.sFragmentId,
						success: function () {
							Opa5.assert.strictEqual(
								sap.ui.getCore().byId(oControlIds.sSelectorId).getSelectedIndex(),
								iSelectedMember,
								"The Planning Calendar is switched to Single Planning Calendar and proper team member is selected"
							);
						},
						errorMessage: "The Planning Calendar is not switched to Single Planning Calendar"
					});
				}

			})

		}

	});

});