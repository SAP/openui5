sap.ui.define(["sap/ui/integration/Designtime"
], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"dateRange": {
						"manifestpath": "/sap.card/configuration/parameters/dateRange/value",
						"type": "string",
						"label": "Date Range",
						"displayFormat": "yyyy/MM/dd",
						"visualization": {
							"type": "sap/ui/integration/editor/test/customfield/viz/CustomDateRangeSelection",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"displayFormat": "{currentSettings>displayFormat}"
							}
						}
					}
				}
			}
		});
	};
});
