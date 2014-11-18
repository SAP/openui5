jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.require("patternApp.model.Pattern");

sap.ui.controller("patternApp.view.PatternTable", {

	onInit : function () {
		var oRouter = new sap.ui.core.routing.Router();
		this._oModel = new patternApp.model.Pattern(oRouter);

		this.getView().setModel(this._oModel);
		oRouter.initialize();
	},

	onSetHash : function () {
		var sNewHash = this.getView().byId("hash").getValue();

		// Dont reset the list if the hash is the same
		if (sNewHash === this._sHash) {
			return;
		}

		this._oModel.resetMatched();
		this._sHash = sNewHash;

		// Call replace hash here since setHash add history entries.
		sap.ui.core.routing.HashChanger.getInstance().replaceHash(sNewHash);
	},

	onAddPattern : function () {
		this._oModel.addPattern(this.getView().byId("pattern").getValue());
	},

	handleValueHelp : function () {
		// create value help dialog
		if (!this._valueHelpDialog) {
			this._valueHelpDialog = sap.ui.xmlfragment("patternApp.view.Dialog", this);
			this.getView().addDependent(this._valueHelpDialog);
		}

		// open value help dialog
		this._valueHelpDialog.open();
	},

	handleValueHelpSearch : function (oEvent) {
		var sValue = oEvent.getParameter("value");
		var oFilter = new sap.ui.model.Filter("pattern", sap.ui.model.FilterOperator.Contains, sValue);
		oEvent.getSource().getBinding("items").filter([oFilter]);
	},

	handleValueHelpClose : function (oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem) {
			var oPatternInput = this.getView().byId("hash");
			oPatternInput.setValue(oSelectedItem.getTitle());
		}
		oEvent.getSource().getBinding("items").filter([]);
	},

	formatMatched : function (bValue) {
		if (bValue) {
			// Green color for matched patterns
			return "Success";
		}

		// Red color for unmatched ones
		return "Error";
	},

	formatHash : function (sValue) {
		if (!sValue) {
			return "empty";
		}

		return sValue;
	}

});
