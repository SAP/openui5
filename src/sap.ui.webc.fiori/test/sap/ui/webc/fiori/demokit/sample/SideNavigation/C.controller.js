sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.sample.SideNavigation.C", {

		handleClick: function () {
			var oSideNavigation = this.getView().byId("sideNavigation");
			oSideNavigation.setCollapsed(!oSideNavigation.getCollapsed());
		}

	});
});