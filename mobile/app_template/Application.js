jQuery.sap.declare("Application");
jQuery.sap.require("ApplicationBase");

ApplicationBase.extend("Application", {

	init : function() {
		// set global models
		var model = new sap.ui.model.json.JSONModel("model/data.json");
		var imgModel = new sap.ui.model.json.JSONModel("model/img.json");
		sap.ui.getCore().setModel(model);
		sap.ui.getCore().setModel(imgModel, "img");
	},

	main : function() {
		// create app view and put to html root element
		var root = this.getRoot();
		sap.ui.jsview("app", "view.App").placeAt(root);
	}
});