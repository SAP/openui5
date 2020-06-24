sap.ui.define(["sap/ui/integration/Extension", "sap/base/Log"], function (Extension, Log) {
	"use strict";

	var oExtension = new Extension({

		action: function () {
			Log.error("Extension");
		}
	});

	return oExtension;
});
