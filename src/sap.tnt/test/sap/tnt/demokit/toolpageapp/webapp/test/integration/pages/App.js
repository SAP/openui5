sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Properties"
], function (Opa5, Press, BindingPath, Properties) {
	"use strict";

	var sViewName = "App";
	Opa5.createPageObjects({
		onTheAppPage: {

			actions: {
				iPressTheErrorButton: function () {
					return this.waitFor({
						id: "errorButton",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "Did not find the error button on App page"
					});
				},

				iPressTheErrorMessage: function () {
					return this.waitFor({
						controlType: "sap.m.MessagePopoverItem",
						viewName: sViewName,
						matchers: new BindingPath({
							modelName: "alerts",
							path: "/alerts/errors/0"
						}),
						actions: new Press(),
						errorMessage: "Did not find the error message item"
					});
				},

				iPressTheNotificationButton: function () {
					return this.waitFor({
						id: "notificationButton",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "Did not find the notification Button on the App page"
					});
				},

				iPressTheUserButton: function () {
					return this.waitFor({
						id: "userButton",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "Did not find the notification Button on the App page"
					});
				},

				iPressTheSettingsButton: function () {
					this.waitFor({
						controlType: "sap.tnt.NavigationListItem",
						viewName: sViewName,
						matchers: new BindingPath({
							modelName: "side",
							path: "/navigation/1"
						}),
						actions: new Press(),
						errorMessage: "Did not find the settings button on the sid navigation"
					});

				},

				iPressTheStatisticsButton: function () {
					this.waitFor({
						controlType: "sap.tnt.NavigationListItem",
						viewName: sViewName,
						matchers: new BindingPath({
							modelName: "side",
							path: "/navigation/2"
						}),
						success: function(aNavListItem){
							if (aNavListItem[0].getParent().getExpanded()) {
								Opa5.assert.ok(true, "Pressed!");
							} else { // when the side navigation is collapsed
								this.waitFor({
									controlType: "sap.tnt.NavigationListItem",
									matchers: [
										new Properties({
											text: "Statistics",
											icon: ""
										})
									],
									actions: new Press(),
									errorMessage: "Did not find the statistics button on the side navigation popup"
								});
							}
						},
						actions: new Press(),
						errorMessage: "Did not find the statistics button on the side navigation"
					});
				},

				iPressTheUsageStatisticsButton: function () {
					this.waitFor({
						controlType: "sap.tnt.NavigationListItem",
						viewName: sViewName,
						matchers: new BindingPath({
							modelName: "side",
							path: "/navigation/2"
						}),
						success: function(aNavListItem){
							if (aNavListItem[0].getParent().getExpanded()) {
								this.waitFor({
									controlType: "sap.tnt.NavigationListItem",
									viewName: sViewName,
									matchers: new BindingPath({
										modelName: "side",
										path: "/navigation/2/items/0"
									}),
									actions: new Press()
								});
								Opa5.assert.ok(true, "Pressed!");
							} else { // when the side navigation is collapsed
								this.waitFor({
									controlType: "sap.tnt.NavigationListItem",
									matchers: [
										new Properties({
											text: "Usage Statistics",
											icon: ""
										})
									],
									actions: new Press(),
									errorMessage: "Did not find the Usage statistics button on the side navigation popup"
								});
							}
						},
						actions: new Press(),
						errorMessage: "Did not find the Usage statistics button on the side navigation"
					});
				},

				iPressTheOrderStatisticsButton: function () {
					this.waitFor({
						controlType: "sap.tnt.NavigationListItem",
						viewName: sViewName,
						matchers: new BindingPath({
							modelName: "side",
							path: "/navigation/2"
						}),
						success: function(aNavListItem){
							if (aNavListItem[0].getParent().getExpanded()) {
								this.waitFor({
									controlType: "sap.tnt.NavigationListItem",
									viewName: sViewName,
									matchers: new BindingPath({
										modelName: "side",
										path: "/navigation/2/items/1"
									}),
									actions: new Press()
								});
								Opa5.assert.ok(true, "Pressed!");
							} else { // when the side navigation is collapsed
								this.waitFor({
									controlType: "sap.tnt.NavigationListItem",
									matchers: [
										new Properties({
											text: "Order Statistics",
											icon: ""
										})
									],
									actions: new Press(),
									errorMessage: "Did not find the Order statistics button on the side navigation popup"
								});
							}
						},
						actions: new Press(),
						errorMessage: "Did not find the Order statistics button on the side navigation"
					});

				},

				iPressTheHomeButton: function () {
					this.waitFor({
						controlType: "sap.tnt.NavigationListItem",
						viewName: sViewName,
						matchers: new BindingPath({
							modelName: "side",
							path: "/navigation/0"
						}),
						actions: new Press(),
						errorMessage: "Did not find the home button on the sid navigation"
					});

				}
			},

			assertions: {

				iShouldSeeTheErrorPopover: function () {
					this.waitFor({
						id: "errorMessagePopover",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(sViewName,"The error popover message was displayed");
						},
						errorMessage: "The error popover was not displayed"
					});
				},

				iShouldSeeTheErrorMessage: function () {
					this.waitFor({
						id: "moreDetailsLink",
						controlType: "sap.m.Link",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(sViewName, "The error message was displayed");
						},
						errorMessage: "The error Message was not displayed"
					});
				},

				iShouldSeeTheNotificationPopover: function () {
					this.waitFor({
						id: "notificationMessagePopover",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(sViewName,"The notification popover message was displayed");
						},
						errorMessage: "The notification popover was not displayed"
					});
				},

				iShouldSeeTheUserPopover: function () {
					this.waitFor({
						id: "userMessageActionSheet",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(sViewName,"The user popover message was displayed");
						},
						errorMessage: "The notification popover was not displayed"
					});
				},

				iShouldSeeMessageToast: function() {
					return this.waitFor({
						//increase opa's polling because the message toast is only shown for a brief moment
						pollingInterval: 100,
						viewName: sViewName,
						check: function(oView) {
							return !!Opa5.getJQuery()(".sapMMessageToast").length;
						},
						success: function(oView) {
							Opa5.assert.ok(oView, "The message toast was displayed");
						},
						errorMessage: "The message toast was not displayed"
					});
				}
			}
		}
	});
});