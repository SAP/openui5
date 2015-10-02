sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, JSONModel) {
	"use strict";

	var Sub2Controller = Controller.extend("samples.components.ext.sap.Sub2", {
	
		onInit: function() {
			jQuery.sap.log.info("Sub2 Controller onInit()");
		
		
			// create some dummy JSON data
			var data = {
				number: 43,
				names:[
					{name: "Anton"},
					{name: "Karl"},
					{name: "Hermann"}
				]
			};
		
			// create a Model and assign it to the View
			var oModel = new JSONModel();
			oModel.setData(data);
			this.getView().setModel(oModel);
		},
	
		onExit: function() {
			jQuery.sap.log.info("Sub2 Controller onExit()");
		},
	
		onBeforeRendering: function() {
			jQuery.sap.log.info("Sub2 Controller onBeforeRendering()");
		},
	
		onAfterRendering: function() {
			jQuery.sap.log.info("Sub2 Controller onAfterRendering()");
		},
	
	
		originalSAPAction: function() {
			alert("This is an original SAP Action");
		}

	});

	return Sub2Controller;

});
