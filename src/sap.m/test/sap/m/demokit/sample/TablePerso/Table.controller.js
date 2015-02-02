jQuery.sap.require("sap.m.TablePersoController");
jQuery.sap.require("sap.m.sample.TablePerso.DemoPersoService");
jQuery.sap.require("sap.m.sample.TablePerso.Formatter");

sap.ui.controller("sap.m.sample.TablePerso.Table", {

	onInit: function () {

		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		var oGroupingModel = new sap.ui.model.json.JSONModel({ hasGrouping: false});
		this.getView().setModel(oModel);
		this.getView().setModel(oGroupingModel, 'Grouping');

		// init and activate controller
		this._oTPC = new sap.m.TablePersoController({
			table: this.getView().byId("productsTable"),
			//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
			componentName: "demoApp",
			persoService: sap.m.sample.TablePerso.DemoPersoService,
		}).activate();
	},

	onPersoButtonPressed: function (oEvent) {
		this._oTPC.openDialog();
	},

	onTablePersoRefresh : function() {
		sap.m.sample.TablePerso.DemoPersoService.resetPersData();
		this._oTPC.refresh();
	},

	onTableGrouping : function(oEvent) {
		this._oTPC.setHasGrouping(oEvent.getSource().getSelected());
	}
});
