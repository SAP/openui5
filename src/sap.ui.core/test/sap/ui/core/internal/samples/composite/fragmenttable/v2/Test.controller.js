sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	return Controller.extend("sap.ui.mdc.sample.fragmenttable.v2.Test", {
		sType: "ResponsiveTable",
		toggleType: function() {
			// note that this will lead to retemplating of the fragment since the table was already bound,
			// thus will be unbound first which includes a destroyAggregation which in turn then triggers
			// the retemplating of the fragment !
			if (!this.getView().getModel("json")) {
				this.getView().setModel(new sap.ui.model.json.JSONModel({header: "Test",type:"ResponsiveTable"}),"json");
			}

			this.byId("myTemplateTableLazy").bindAggregation("list", {
				path: '/ProductCollection'
			});

			if (this.sType === "ResponsiveTable") {
				this.sType = "GridTable";
			} else {
				this.sType = "ResponsiveTable";
			}
			this.getView().getModel("json").setProperty("/type", this.sType);

		},
		i: 0,
		toggleHeader: function() {
			if (!this.getView().getModel("json")) {
				this.getView().setModel(new sap.ui.model.json.JSONModel({header: "Test", type:"ResponsiveTable"}),"json");
			}
			this.getView().getModel("json").setProperty("/header", "Test" + (this.i++));
		},
		toggleEditable: function() {
			if (!this.getView().getModel("json")) {
				this.getView().setModel(new sap.ui.model.json.JSONModel({header: "Test", type:"ResponsiveTable", editable: true}),"json");
			}
			this.getView().getModel("json").setProperty("/editable", !this.getView().getModel("json").getProperty("/editable"));
		},
		handleSelection: function() {
			sap.m.MessageToast.show("Selection Changed");
		},
		model: null,
		unbindList: function() {
			this.byId("myTemplateTableLazy").unbindAggregation("list");
		}
	});
}, true);
