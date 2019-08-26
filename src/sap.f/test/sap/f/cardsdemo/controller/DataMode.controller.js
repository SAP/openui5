sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/util/deepClone"
], function (Controller, deepClone) {
	"use strict";


	var oCardManifest = {
		"_version": "1.8.0",
		"sap.app": {
			"type": "card",
			"i18n": "i18n/i18n.properties"
		},
		"sap.ui5": {
			"services": {
				"RandomRevenue": {
					"factoryName": "cardsdemo.service.RandomRevenueFactory"
				}
			}
		},
		"sap.card": {
			"type": "Analytical",
			"header": {
				"type": "Numeric",
				"data": {
					"request": {
						"url": "./cardcontent/kpi.json"
					},
					"path": "/kpiInfos/kpi"
				},
				"title": "{{contactDetails}}",
				"subTitle": "Revenue",
				"unitOfMeasurement": "EUR",
				"mainIndicator": {
					"number": "{number}",
					"unit": "{unit}",
					"trend": "{trend}",
					"state": "{state}"
				},
				"details": "{details}",
				"sideIndicators": [
					{
						"title": "Target",
						"number": "{target/number}",
						"unit": "{target/unit}"
					},
					{
						"title": "Deviation",
						"number": "{deviation/number}",
						"unit": "%"
					}
				]
			},
			"content": {
				"data": {
					"service": {
						"name": "RandomRevenue"
					},
					"path": "/"
				},
				"chartType": "Line",
				"legend": {
					"visible": true,
					"position": "Right",
					"alignment": "Center"
				},
				"plotArea": {
					"dataLabel": {
						"visible": true
					}
				},
				"title": {
					"text": "Line chart",
					"visible": true,
					"alignment": "Bottom"
				},
				"measureAxis": "valueAxis",
				"dimensionAxis": "categoryAxis",
				"dimensions": [
					{
						"label": "Weeks",
						"value": "{Week}"
					}
				],
				"measures": [
					{
						"label": "Revenue",
						"value": "{Revenue}"
					},
					{
						"label": "Cost",
						"value": "{Cost}"
					}
				]
			}
		}
	};

	return Controller.extend("sap.f.cardsdemo.controller.DataMode", {

		onBeforeRendering: function () {
			this.getView().byId("card").setManifest(oCardManifest);
			this.getView().byId("card").setBaseUrl("./cardcontent/objectcontent/");
		},

		onSelectionChange: function (oEvent) {
			var sDataMode = oEvent.getParameter("item").getText();
			this.getView().byId("card").setDataMode(sDataMode);
		},

		onTryToRefresh: function (oEvent) {
			var oCard = this.getView().byId("card");

			if (oCard) {
				this.getView().byId("card").refresh();
			}
		},

		onSubmit: function (oEvent) {

			var iInterval = oEvent.getParameter("value");
			var oClone = deepClone(oCardManifest);

			oClone["sap.card"].content.data.updateInterval = iInterval;

			this.getView().byId("card").setManifest(oClone);
		}
	});
});
