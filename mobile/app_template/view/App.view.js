sap.ui.jsview("view.App", {

	getControllerName: function() {
		return "view.App";
	},
	createContent: function(oController) {
		this.app = new sap.m.App();
		return this.app;
	}
}