sap.ui.controller("sap.m.sample.InputSuggestionsDynamic.C", {

	onInit: function() {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	handleSuggest: function(oEvent) {
		var sTerm = oEvent.getParameter("suggestValue");
		var aFilters = [];
		if (sTerm) {
			aFilters.push(new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.StartsWith, sTerm));
		}
		oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
	}

});
