sap.ui.define([
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function(
	FlexTestAPI,
	Opa5,
	Press
) {
	"use strict";

	/**
	 * Constructor for OPA5 common pages class.
	 *
	 * @class
	 * @extends sap.ui.test.Opa5
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.89
	 */
	return Opa5.extend("sap.ui.rta.integration.pages.Common", {
		iNavigateToFlpHomeScreen() {
			this.waitFor({
				id: "shellAppTitle",
				errorMessage: "Did not find the back button on the page",
				actions: new Press()
			});
			return this.waitFor({
				controlType: "sap.m.StandardListItem",
				matchers: {
					propertyStrictEquals: {
						name: "icon",
						value: "sap-icon://home"
					}
				},
				actions: new Press()
			});
		},

		iNavigateToApp(sName) {
			return this.waitFor({
				controlType: "sap.m.GenericTile",
				matchers: {
					propertyStrictEquals: {
						name: "header",
						value: sName
					}
				},
				success(aTiles) {
					aTiles[0].firePress();
				}
			});
		},

		iClearTheSessionLRep() {
			FlexTestAPI.clearStorage("SessionStorage");
			window.sessionStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
			window.sessionStorage.removeItem("sap.ui.rta.restart.USER");
			localStorage.clear();
		}
	});
});
