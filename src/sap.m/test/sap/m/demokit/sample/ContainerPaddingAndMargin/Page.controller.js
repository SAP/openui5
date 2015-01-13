sap.ui.controller("sap.m.sample.ContainerPaddingAndMargin.Page", {

	onInit : function (evt) {
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			widthS: (sap.ui.Device.system.phone) ? "2em" : "5em",
			widthM: (sap.ui.Device.system.phone) ? "4em" : "10em",
			widthL: (sap.ui.Device.system.phone) ? "6em" : "15em"
		}));
	}
});