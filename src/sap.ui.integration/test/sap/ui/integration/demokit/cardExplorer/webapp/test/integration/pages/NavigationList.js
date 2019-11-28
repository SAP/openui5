sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/actions/Press"
], function(Opa5, Properties, Press) {
	"use strict";

	var sViewName = "App";

	Opa5.createPageObjects({
		onTheNavigationList: {

			actions: {
				iSwitchToSample: function (sKey) {
					return this.waitFor({
						viewName: sViewName,
						controlType: "sap.tnt.NavigationListItem",
						matchers: new Properties({ key: sKey }),
						actions: new Press(),
						errorMessage: "Could not NavigationListItem with key: " + sKey
					});
				}
			}
		}
	});
});