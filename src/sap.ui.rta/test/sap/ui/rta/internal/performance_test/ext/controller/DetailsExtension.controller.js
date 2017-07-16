sap.ui.controller("sap.ui.rta.test.performance.ext.controller.DetailsExtension", {
	onObjectPageCustomAction: function(oEvent) {
		"use strict";
		sap.m.MessageBox.success("Hello from ObjectPage custom action!", {});
	},
	onMySmartTableAction: function() {
		"use strict";
		sap.m.MessageBox.success("Hello from ObjectPage/SmartTable custom action!", {});
	}
});
