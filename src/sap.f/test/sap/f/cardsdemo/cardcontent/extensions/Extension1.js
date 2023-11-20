sap.ui.define(["sap/ui/integration/Extension", "sap/ui/integration/ActionDefinition"], function (Extension, ActionDefinition) {
	"use strict";

	var Extension1 = Extension.extend("sap.ui.integration.qunit.testResources.extensions.Extension1");

	Extension1.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);

		this.setFormatters({
			toUpperCase: function (sValue) {
				return sValue.toUpperCase();
			},
			stringifiedJsonSample: function (sValue) {
				return JSON.stringify({
					"value": sValue,
					"presentationVariant": {
						"SortOrder": [
							{
								"Property": "BillingDocDateYearMonth",
								"Descending": false
							}
						]
					},
					"sensitiveProps": {}
				});
			}
		});
	};

	Extension1.prototype.getData = function () {
		return Promise.resolve([
			{ city: "Berlin", description: "Germany" },
			{ city: "Tokyo", description: "Japan" }
		]);
	};

	return Extension1;
});
