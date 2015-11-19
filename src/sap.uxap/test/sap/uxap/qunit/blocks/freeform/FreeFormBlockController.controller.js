sap.ui.define(["sap/m/MessageToast", "sap/ui/core/mvc/Controller"], function (MessageToast, Controller) {
	"use strict";
	return Controller.extend("sap.uxap.testblocks.freeform.FreeFormBlockController", {
		handlePress: function () {
			MessageToast.show("button pressed");
		}
	});
}, true);
