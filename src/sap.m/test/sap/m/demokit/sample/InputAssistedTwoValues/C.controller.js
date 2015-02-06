sap.ui.controller("sap.m.sample.InputAssistedTwoValues.C", {
	inputId: '',

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	handleValueHelp : function (oController) {
		this.inputId = oController.oSource.sId;
		// create value help dialog
		if (!this._valueHelpDialog) {
			this._valueHelpDialog = sap.ui.xmlfragment(
				"sap.m.sample.InputAssistedTwoValues.Dialog",
				this
			);
			this.getView().addDependent(this._valueHelpDialog);
		}

		// open value help dialog
		this._valueHelpDialog.open();
	},

	_handleValueHelpSearch : function (evt) {
		var sValue = evt.getParameter("value");
		var oFilter = new sap.ui.model.Filter(
			"Name",
			sap.ui.model.FilterOperator.Contains, sValue
		);
		evt.getSource().getBinding("items").filter([oFilter]);
	},

	_handleValueHelpClose : function (evt) {
		var oSelectedItem = evt.getParameter("selectedItem");
		if (oSelectedItem) {
			var productInput = this.getView().byId(this.inputId);
			productInput.setValue(oSelectedItem.getTitle());
		}
		evt.getSource().getBinding("items").filter([]);
	}
});
