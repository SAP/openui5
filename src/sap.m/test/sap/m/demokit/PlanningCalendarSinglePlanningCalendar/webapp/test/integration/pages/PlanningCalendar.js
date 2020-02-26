sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor"
], function(Opa5, Press, Properties, Ancestor) {
	"use strict";

	var sViewName = "PlanningCalendar",
		sSingleViewName = "SinglePlanningCalendar",
		sCalendarId = "PC",
		sSingleCalendarId = "SPC",
		sTeamSelectorId = "teamSelector",
		sLegendButtonId = "legendButton",
		iTeamCount,
		iRowsCount,
		iSelectorItems,
		oModel,
		oInitialDate,
		oViewSwitch,
		oSelectedDate,
		oPopoverProperties,
		oProperties,
		sInitialView,
		sSelectedMemberName,
		sSelectedView,
		sSelectedViewKey,
		sViewKey,
		sCalendarName;

	Opa5.createPageObjects({

		onThePlanningCalendarPage : {

			actions : Object.assign({

				iSelectATeamMember : function () {

					return this.waitFor({
						id : sTeamSelectorId,
						viewName : sViewName,
						actions: new Press(),
						success: function (oSelect) {
							sSelectedMemberName = oSelect.getItems()[1].getText();
							this.waitFor({
								controlType: "sap.ui.core.Item",
								matchers: [
									new Ancestor(oSelect),
									new Properties({ text: sSelectedMemberName})
								],
								actions: new Press(),
								errorMessage: "Cannot select an item of Team Selector"
							});
						},
						errorMessage: 'Could not find Team Selector.'
					});
				},

				iSelectAPlanningCalendarView : function () {

					return this.waitFor({
						id : sCalendarId,
						viewName : sViewName,
						success: function (oCalendar) {
							oViewSwitch = oCalendar._oIntervalTypeSelect;
							sSelectedViewKey = oViewSwitch.getItems()[0].getKey();
							this.waitFor({
								controlType: "sap.m.SegmentedButtonItem",
								matchers: [
									new Ancestor(oViewSwitch),
									new Properties({ key: sSelectedViewKey})
								],
								actions: new Press(),
								errorMessage: "Cannot select a View of the Planning Calendar"
							});
						},
						errorMessage: 'Could not find the View Switch of the Planning Calendar.'
					});
				},

				iClickOnALegendButton : function () {

					return this.waitFor({
						id : sLegendButtonId,
						viewName : sViewName,
						actions: new Press(),
						success: function () {
							this.waitFor({
								controlType: "sap.m.ResponsivePopover",
								matchers : new Properties({ title: "Calendar Legend" }),
								errorMessage: "Cannot open a legend of the Planning Calendar"
							});
						},
						errorMessage: 'Could not find the Legend Button of the Planning Calendar.'
					});
				}

			}),

			assertions: Object.assign({

				theCalendarShouldHaveAllTeamMembers : function () {
					return this.waitFor({
						id : sCalendarId,
						viewName : sViewName,
						success : function (oCalendar) {
							iRowsCount = oCalendar.getRows().length;
							oModel = oCalendar.getBinding("rows").getModel();
							iTeamCount = oModel.getProperty("/team").length;
							Opa5.assert.strictEqual(iRowsCount, iTeamCount, "The Planning Calendar has " + iRowsCount + " rows");
						},
						errorMessage : "Calendar does not have all rows."
					});
				},

				theTeamSelectorHaveAllTeamMembers : function () {
					return this.waitFor({
						id: sTeamSelectorId,
						viewName : sViewName,
						success : function (oSelector) {
							iSelectorItems = oSelector.getItems().length;
							Opa5.assert.strictEqual(iSelectorItems, iTeamCount + 1, "The Planning Calendar has " + iSelectorItems + " items in the Team Member Selector (1 + " + iTeamCount + ")");
						},
						errorMessage : "Calendar does not have all Team Members in the Team Member Selector."
					});
				},

				theCalendarViewIsProperlySet : function () {
					return this.waitFor({
						id: sCalendarId,
						viewName : sViewName,
						success : function (oCalendar) {
							sSelectedView = oCalendar.getViewKey();
							sInitialView = oModel.getProperty("/viewKey");
							Opa5.assert.strictEqual(sInitialView, sSelectedView, "The Planning Calendar has '" + sSelectedView + "' view selected");
						},
						errorMessage : "Calendar does not have proper view selected."
					});
				},

				theCalendarDateIsProperlySet : function () {
					return this.waitFor({
						id: sCalendarId,
						viewName : sViewName,
						success : function (oCalendar) {
							oSelectedDate = oCalendar.getStartDate();
							oInitialDate = new Date(oModel.getProperty("/startDate"));
							Opa5.assert.deepEqual(oInitialDate, oSelectedDate, "The Planning Calendar has '" + oSelectedDate + "' date set");
						},
						errorMessage : "Calendar does not have proper date set."
					});
				},

				theCalendarLegendIsOpen : function () {
					return this.waitFor({
						controlType: "sap.m.ResponsivePopover",
						matchers : [
							new Properties({ title: "Calendar Legend" }),
							function (oPopover) {
								oPopoverProperties = {
									visibility: oPopover.$().css('visibility'),
									display: oPopover.$().css('display')
								};
								return true;
							}
						],
						success : function () {
							oProperties = { visibility: 'visible', display: 'block' };
							Opa5.assert.deepEqual(oPopoverProperties, oProperties, "The Planning Calendar Legend is opened");
						},
						errorMessage : "Planning Calendar Legend is not opened."
					});
				},

				theCalendarViewIsChangedToDay : function () {
					return this.waitFor({
						id : sCalendarId,
						viewName : sViewName,
						success : function (oCalendar) {
							sViewKey = oCalendar.getViewKey();
							Opa5.assert.strictEqual(sViewKey, sSelectedViewKey, "The Planning Calendar switched to '" + sSelectedViewKey + "' view");
						},
						errorMessage : "Planning Calendar is not switched to different view."
					});
				},

				theViewIsChangedToSinglePlanningCalendar : function () {
					return this.waitFor({
						id : sSingleCalendarId,
						viewName : sSingleViewName,
						success : function (oCalendar) {
							sCalendarName = oCalendar.getTitle();
							Opa5.assert.strictEqual(sCalendarName, sSelectedMemberName, "The Planning Calendar switched to Single Planning Calendar of '" + sSelectedMemberName + "' team member");
						},
						errorMessage : "Planning Calendar is not switched to Single Planning Calendar."
					});
				},

				theCalendarIsDisplayed : function () {
					return this.waitFor({
						id : sCalendarId,
						viewName : sViewName,
						success : function (oCalendar) {
							Opa5.assert.ok(oCalendar.getRows().length > 0, "The Planning Calendar is displayed");
						},
						errorMessage : "Calendar is not displayed."
					});
				}

			})

		}

	});

});