(() => {
	"use strict";
	window.flSupportTestAppReady = new Promise(function(resolve) {
		sap.ui.require([
			"sap/ui/core/Core"
		], function(Core) {
			Core.ready().then(resolve);
		});
	});
})();