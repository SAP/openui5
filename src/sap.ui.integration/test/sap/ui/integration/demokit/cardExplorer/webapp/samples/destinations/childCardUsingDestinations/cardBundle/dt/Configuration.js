sap.ui.define(["sap/ui/integration/Designtime"], (Designtime) => {
	"use strict";

	return () => {
		return new Designtime({
			"form": {
				"items": {
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
