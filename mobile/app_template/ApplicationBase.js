jQuery.sap.declare("Application");
jQuery.sap.require("ApplicationBase");

var Application = {};
ApplicationBase.extend("Application", {

	init: function() {
		// load the global data model
		var oJSONDataModel = new sap.ui.model.json.JSONModel("js/splitapp/model/data.json");
		sap.ui.getCore().setModel(oJSONDataModel);
		
		// load the global image source model
		var oImgModel = new sap.ui.model.json.JSONModel("js/splitapp/model/img.json");
		sap.ui.getCore().setModel(oImgModel, "img");
	},
	
	main: function() {
		// create app view and put to html root element
        var root = this.getRoot();
        sap.ui.jsview("app", "view.App").placeAt(root);
	}

});