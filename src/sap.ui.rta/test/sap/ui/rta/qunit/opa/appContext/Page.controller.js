sap.ui.define([
	'sap/ui/core/mvc/Controller',
	"sap/ui/rta/appContexts/AppContextsOverviewDialog",
	"sap/ui/rta/appContexts/controller/RestAPIConnector",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/write/_internal/Storage"
], function (Controller, AppContextsOverviewDialog, RestAPIConnector, Layer, sinon, JSONModel, WriteStorage) {
	"use strict";

	var PageController = Controller.extend("sap.ui.rta.appcontext.Page", {
		onInit: function () {
			this.sandbox = sinon.sandbox.create();
			var oAppContextModel = new JSONModel();
			var oRolesModel = new JSONModel();
			oAppContextModel.loadData("./model/appContexts.json", "", false);
			oRolesModel.loadData("./model/roles.json", "", false);
			this.sandbox.stub(RestAPIConnector, "getAppContextData").returns(oAppContextModel.getData());
			this.sandbox.stub(WriteStorage, "loadContextDescriptions").callsFake(function (args) {
				var aFilterRoles = oRolesModel.getProperty("/values").filter(function (oElement) {
					for (var i = 0; i < args["flexObjects"].role.length; i++) {
						var role = args["flexObjects"].role[i];
						if (role.toLowerCase() === oElement.id.toLowerCase()) {
							return oElement;
						}
					}
				});
				return Promise.resolve({ role: aFilterRoles });
			});

			this.sandbox.stub(WriteStorage, "getContexts").callsFake(function (args) {
				if (Object.keys(args).includes("$filter")) {
					var filterRoles = oRolesModel.getData().values.filter(function (element) {
						if (element.id.toLowerCase().includes(args["$filter"].toLowerCase()) ||
							element.description.toLowerCase().includes(args["$filter"].toLowerCase())) {
							return element;
						}
					});
					return Promise.resolve({ values: filterRoles, lastHitReached: true });
				}
				return Promise.resolve(oRolesModel.getData());
			});
		},
		onClick: function () {
			this.oAppVariantOverviewDialog = new AppContextsOverviewDialog("testOverview1", { layer: Layer.CUSTOMER });
			this.oAppVariantOverviewDialog.open();
		}
	});
	return PageController;
});