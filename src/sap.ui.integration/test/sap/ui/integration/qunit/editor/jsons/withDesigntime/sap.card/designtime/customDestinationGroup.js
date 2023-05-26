sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"dest1.destination": {
						"type": "destination",
						"label": "dest1 label defined in DT"
					},
					"destination.group": {
						"label": "Destinations group label defined in DT",
						"type": "group",
						"expanded": false
					}
				}
			}
		});
	};
});
