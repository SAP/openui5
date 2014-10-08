sap.ui.controller("sap.m.sample.ScrollContainer.ScrollContainer", {

	onInit: function() {
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			width: (sap.ui.Device.system.phone) ? "50em" : "100em"
		}));
	}
});