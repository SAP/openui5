sap.ui.require(["sap/ui/core/Core"], (Core) => {
	"use strict";
	Core.ready().then(() => {
		sap.ui.require("sap/ushell/Container").createRenderer(true).then(function(oRenderer) {
			oRenderer.placeAt("content");
		});
	});
});