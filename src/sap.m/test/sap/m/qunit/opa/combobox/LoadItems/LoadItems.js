sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/m/Panel",
		"sap/m/Text",
		"sap/ui/core/Item",
		"sap/ui/core/mvc/XMLView",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/odata/v2/ODataModel",
		"sap/ui/core/util/MockServer"
	], function (
		Panel,
		Text,
		Item,
		XMLView,
		Controller,
		ODataModel,
		MockServer
	) {
		var MyController = Controller.extend("mainView.controller", {
			onInit: function () {
				var oModel,
					sServiceName = "testService";

				this.setupMockServer(sServiceName);

				oModel = new ODataModel(sServiceName + "/", {
					useBatch: false,
					defaultCountMode: "Inline",
					defaultBindingMode: "TwoWay"
				});

				this.getView().setModel(oModel);
			},
			bindToExisting: function () {
				this.byId("c1").bindAggregation("items", {
					path: "/Employees",
					template: new Item({
						key: "{ID}",
						text: "{Name}"
					})
				});
			},
			handleLoadItems: function (oControlEvent) {
				var oComboBox = oControlEvent.getSource();

				if (!oComboBox.getItems().length) {
					oControlEvent.getSource().getBinding("items").refresh();
				}

				oControlEvent.getSource().getBinding("items").resume();
			},
			setupMockServer: function (service) {
				var basePath = service;

				var mockServer = new MockServer({
					rootUri: basePath
				});

				MockServer.config({
					autoRespond: true,
					autoRespondAfter: 3000
				});

				var reqList = mockServer.getRequests();

				// $metadata
				reqList.push({
					method: 'GET',
					path: '/\\$metadata(.*)',
					response: function (req, resp) {
						req.respondXML(200, {}, document.getElementById("metadata").textContent);
					}
				});

				// Data
				reqList.push({
					method: 'GET',
					path: '/\\Employees(.*)',
					response: function (req, resp) {
						req.respondJSON(200, {}, document.getElementById("employees").textContent);
					}
				});

				mockServer.setRequests(reqList);
				mockServer.simulate(basePath + '/$metadata',
					{
						sMockdataBaseUrl: basePath + '/Employees',
						bGenerateMissingMockData: true
					});
				mockServer.start();
			}
		});

		XMLView.create({
			id: "idView",
			definition: document.getElementById("mainView").textContent,
			controller: new MyController()
		}).then(function (oView) {
			oView.placeAt("content");
		});

	});

});
