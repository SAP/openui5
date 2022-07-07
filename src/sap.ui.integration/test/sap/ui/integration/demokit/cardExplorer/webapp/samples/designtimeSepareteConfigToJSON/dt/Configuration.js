
sap.ui.define([
	"sap/ui/integration/Designtime",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/merge",
	"sap/ui5/test/editor/listcard/separateconfigtojson/dt/Functions"
], function (
	Designtime,
	jQuery,
	merge,
	Functions
) {
	"use strict";
	return function () {
		// create designtime
		var oDesigntime = new Designtime({
			"form": {
				"items": {
					"validationGroup": {
						"type": "group",
						"label": "Validation",
						"expanded": false
					},
					"Customers": {
						"manifestpath": "/sap.card/configuration/parameters/Customers/value",
						"type": "string[]",
						"required": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						},
						"validations": [{
							"type": "error",
							"validate": Functions.fnValidate,
							"message": function (value, config, minLength) {
								return "Please select at least " + minLength + " items!";
							}
						}]
					}
				}
			},
			"preview": {
				"modes": "None"
			}
		});
		// overwrite the _readyPromise function of the designtime to load json files and js files
		oDesigntime._readyPromise = function (oCardInterface, oInternalCard) {
			var that = this;
			that.onCardReady(oCardInterface, oInternalCard);
			var aJsonFiles = [
				"dt/items1.json",
				"dt/items2.json"
			];
			var aPromises = [];
			aJsonFiles.forEach(function (sFileName) {
				// the prefix of the json files should match the id in manifest.json
				// "id": "sap.ui5.test.editor.listcard.separateconfigtojson"
				var sItemsPath = sap.ui.require.toUrl("sap/ui5/test/editor/listcard/separateconfigtojson/" + sFileName);
				aPromises.push(
					new Promise(function (resolve, reject) {
						jQuery.ajax(sItemsPath, {
							dataType: "json"
						}).done(function (oItems) {
							resolve(oItems);
						}).fail(function (jqXHR, sTextStatus, sError) {
							reject();
						});
					})
				);
			});
			// load json files
			return Promise.all(aPromises).then(function (aItems) {
				var items1 = aItems[0],
					items2 = aItems[1];
				var oOriItems = that.settings.form.items;
				var oItems = merge(oOriItems, items1, items2);
				that.settings.form.items = oItems;
			}).then(function () {
				for (var n in that.settings.form.items) {
					var oItem = that.settings.form.items[n];
					oItem.name = Functions.changeName(n);
					oItem.newValue = Functions.changeValue(n);
					if (oItem.validation && oItem.validation.validate && typeof oItem.validation.validate === "string" && typeof Functions[oItem.validation.validate] === "function") {
						oItem.validation.validate = Functions[oItem.validation.validate];
					}
					if (Array.isArray(oItem.validations)) {
						oItem.validations.forEach(function(oValidation) {
							if (oValidation.validate && typeof oValidation.validate === "string" && typeof Functions[oValidation.validate] === "function") {
								oValidation.validate = Functions[oValidation.validate];
							}
						});
					}
				}
			});
		};
		return oDesigntime;
	};
});