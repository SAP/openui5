sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"dest1.destination": {
						"type": "destination",
						"label": "dest1 label defined in DT",
						"allowSettings": true
					},
					"dest2.destination": {
						"type": "destination",
						"allowSettings": true,
						"editable": false
					},
					"dest3.destination": {
						"type": "destination",
						"label": "dest3 label defined in DT",
						"visible": false
					}
				}
			}
		});
	};
});
