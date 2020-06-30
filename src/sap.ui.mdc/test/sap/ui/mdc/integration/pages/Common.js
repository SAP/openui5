sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	"use strict";

	// All the arrangements for all Opa tests are defined here
	var Common = Opa5.extend("sap.ui.mdc.integrations.pages.Common", {

		iStartMyApp: function (tableType) {
			tableType = tableType ? tableType : "ResponsiveTable";
			// start without debug parameter, loads much faster
			return this.iStartMyAppInAFrame("../../demokit/apps/table/Table.html?tableType=" + tableType);
		},
		iLookAtTheScreen: function () {
			return this;
		},
		iTearDownMyApp: function () {
			return this.iTeardownMyAppFrame();
		}
	});

	return Common;

});
