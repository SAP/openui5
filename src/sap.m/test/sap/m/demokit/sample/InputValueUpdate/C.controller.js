sap.ui.controller("sap.m.sample.InputValueUpdate.C", {
	
	onInit: function () {
		var oModel = new sap.ui.model.json.JSONModel({data: {}});
		this.getView().setModel(oModel);
	},

	handleLiveChange: function(oEvent) {
		var newValue = oEvent.getParameter("value");
		this.getView().byId('getValue').setText(newValue);
	}
});