sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor"
], function (Opa5, Press, Properties, Ancestor) {
	"use strict";

	var sViewName = "SinglePlanningCalendar",
		sPlanningViewName = "PlanningCalendar",
		sCalendarId = "SPC",
		sPlanningCalendarId = "PC",
		sLegendButtonId = "legendButton",
		sTeamButtonId = "teamButton",
		oProperties = { visibility: 'visible', display: 'block' },
		oModel,
		oViewSwitch,
		oInitialDate,
		oSelectedDate,
		oPopoverProperties,
		sInitialView,
		sSelectedMemberName,
		sSelectedView,
		sSelectedViewKey,
		sMemberName,
		sViewKey;

	Opa5.createPageObjects({

		onTheSinglePlanningCalendarPage: {

			actions : Object.assign({

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
				},


				iSelectASinglePlanningCalendarView : function () {

					return this.waitFor({
						id: sCalendarId,
						viewName: sViewName,
						success: function (oCalendar) {
							oViewSwitch = oCalendar._getHeader()._getOrCreateViewSwitch();
							sSelectedViewKey = oViewSwitch.getItems()[0].getKey();
							this.waitFor({
								controlType: "sap.m.SegmentedButtonItem",
								matchers: [
									new Ancestor(oViewSwitch),
									new Properties({ key: sSelectedViewKey})
								],
								actions: new Press(),
								errorMessage: "Cannot select a View of the Single Planning Calendar"
							});
						},
						errorMessage: 'Could not find the View Switch of the Single Planning Calendar.'
					});
				},

				iClickOnATeamButton : function () {

					return this.waitFor({
						id : sTeamButtonId,
						viewName: sViewName,
						actions: new Press(),
						success: function () {
							this.waitFor({
								id : sPlanningCalendarId,
								viewName : sPlanningViewName,
								errorMessage : "Single Planning Calendar is not switched to Planning Calendar."
							});
						},
						errorMessage: 'Could not find the Team Calendar Button of the Planning Calendar.'
					});
				}

			}),

			assertions: Object.assign({

				theCalendarShouldHaveMembersSelected : function (iMemberIndex) {
					return this.waitFor({
						id: sCalendarId,
						viewName: sViewName,
						matchers : function (oCalendar) {
							oModel = oCalendar.getBinding("appointments").getModel();
							sSelectedMemberName = oCalendar._getHeader().getTitle();
							sMemberName = oModel.getProperty("/team/" + iMemberIndex + '/name');
							return true;
						},
						success : function () {
							Opa5.assert.strictEqual(sSelectedMemberName, sMemberName, "The Single Planning Calendar has '" + sMemberName + "' member selected");
						},
						errorMessage : "Calendar does not have proper Team Member selected."
					});
				},

				theCalendarViewIsProperlySet : function () {
					return this.waitFor({
						id: sCalendarId,
						viewName: sViewName,
						matchers : function (oCalendar) {
							sSelectedView = sap.ui.getCore().byId(oCalendar.getSelectedView()).getKey();
							sInitialView = oModel.getProperty("/viewKey");
							return true;
						},
						success : function () {
							Opa5.assert.strictEqual(sInitialView, sSelectedView, "The Single Planning Calendar has '" + sSelectedView + "' view selected");
						},
						errorMessage : "Calendar does not have proper view selected."
					});
				},

				theCalendarDateIsProperlySet : function () {
					return this.waitFor({
						id: sCalendarId,
						viewName: sViewName,
						matchers : function (oCalendar) {
							oSelectedDate = oCalendar.getStartDate();
							oInitialDate = new Date(oModel.getProperty("/startDate"));
							return true;
						},
						success : function () {
							Opa5.assert.deepEqual(oInitialDate, oSelectedDate, "The Single Planning Calendar has '" + oSelectedDate + "' date set");
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
							Opa5.assert.deepEqual(oPopoverProperties, oProperties, "The Planning Calendar Legend is opened");
						},
						errorMessage : "Planning Calendar Legend is not opened."
					});
				},

				theCalendarViewIsChangedToDay : function () {
					return this.waitFor({
						id : sCalendarId,
						viewName: sViewName,
						matchers : function (oCalendar) {
							sViewKey = sap.ui.getCore().byId(oCalendar.getSelectedView()).getKey();
							return true;
						},
						success : function () {
							Opa5.assert.strictEqual(sViewKey, sSelectedViewKey, "The Single Planning Calendar switched to '" + sSelectedViewKey + "' view");
						},
						errorMessage : "Single Planning Calendar is not switched to different view."
					});
				},

				theViewIsChangedToPlanningCalendar : function () {
					return this.waitFor({
						id : sPlanningCalendarId,
						viewName : sPlanningViewName,
						matchers : function () {
							return true;
						},
						success : function (bTeamSelector) {
							Opa5.assert.ok(bTeamSelector, "The Single Planning Calendar switched to Planning Calendar");
						},
						errorMessage : "Single Planning Calendar is not switched to Planning Calendar."
					});
				}

			})

		}

	});

});