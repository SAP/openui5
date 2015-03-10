sap.ui.controller("sap.m.sample.TextAreaValueUpdate.C", {
	
	onInit: function () {
		var oModel = new sap.ui.model.json.JSONModel({data: {}});
		this.getView().setModel(oModel);
	},

	handleLiveChange: function(oEvent) {
		var sValue = oEvent.getParameter("value");
		this.getView().byId("getValue").setText(sValue);
	}
});