sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5, PropertyStrictEquals) {
	"use strict";

	var sViewName = "App",
		sAppControl = "app";

	Opa5.createPageObjects({
		onTheAppPage : {

			actions : {

				iWaitUntilTheBusyIndicatorIsGone : function () {
					return this.waitFor({
						id : sAppControl,
						viewName : sViewName,
						matchers: new PropertyStrictEquals({
							name: "busy",
							value: false
						}),
						autoWait: false,
						success : function () {
							Opa5.assert.ok(true, "The app is not busy");
						},
						errorMessage : "The app is busy"
					});
				}

			},

			assertions : {

				iShouldSeeTheBusyIndicator : function () {
					return this.waitFor({
						id : sAppControl,
						viewName : sViewName,
						matchers: new PropertyStrictEquals({
							name: "busy",
							value: true
						}),
						autoWait: false,
						success : function () {
							Opa5.assert.ok(true, "The app is busy");
						},
						errorMessage : "The app is not busy"
					});
				},

				iShouldSeeTheMessageBox : function () {
					return this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Dialog",
						matchers : new PropertyStrictEquals({ name: "type", value: "Message"}),
						success: function () {
							Opa5.assert.ok(true, "The correct MessageBox was shown");
						}
					});
				}

			}

		}

	});

});
