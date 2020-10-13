sap.ui.define(["sap/ui/integration/Designtime", "sap/ui/integration/designtime/editor/fields/viz/IconSelect"
], function (Designtime, IconSelect) {
	"use strict";
	return function () {
		return new Designtime({
			form: {
				items: {
					stringParameter: {
						"manifestpath": "/sap.card/configuration/parameters/stringParameter/value",
						"type": "string",
						"visualization": {
							"type": IconSelect,
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowFile": false,
								"allowNone": false
							}
						}
					}
				}
			},
			preview: {
				modes: "AbstractLive",
				src: "./img/preview.png"
			}
		});
	};
});
