sap.ui.controller("sap.m.sample.ListSelectionSearch.List", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	onSearch : function (oEvt) {

		// add filter for search
		var aFilters = [];
		var sQuery = oEvt.getSource().getValue();
		if (sQuery && sQuery.length > 0) {
			var filter = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
			aFilters.push(filter);
		}

		// update list binding
		var list = this.getView().byId("idList");
		var binding = list.getBinding("items");
		binding.filter(aFilters, "Application");
	},

	onSelectionChange : function (oEvt) {

		var oList = oEvt.getSource();
		var oLabel = this.getView().byId("idFilterLabel");
		var oInfoToolbar = this.getView().byId("idInfoToolbar");

		// With the 'getSelectedContexts' function you can access the context paths
		// of all list items that have been selected, regardless of any current
		// filter on the aggregation binding.
		var aContexts = oList.getSelectedContexts(true);

		// update UI
		var bSelected = (aContexts && aContexts.length > 0);
		var sText = (bSelected) ? aContexts.length + " selected" : null;
		oInfoToolbar.setVisible(bSelected);
		oLabel.setText(sText);
	}
});
