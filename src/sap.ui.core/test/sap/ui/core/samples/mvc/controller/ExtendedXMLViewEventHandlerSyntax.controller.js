sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast" // also called from View
], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("mvctest.controller.ExtendedXMLViewEventHandlerSyntax", {
		onInit: function () {
			var oModel = new JSONModel();
			oModel.setData({"data": "This text comes from a model"});
			this.getView().setModel(oModel);

			oModel = new JSONModel();
			oModel.setData([
				{"name": "Peter"},
				{"name": "Paul"},
				{"name": "Mary"}
			]);
			this.getView().setModel(oModel, "names");
		},

		saySomething: function(sText) {
			MessageToast.show(typeof sText === "string" ? sText : "[no argument passed to saySomething()]");
		},

		saySomethingComplex: function(sBoundStringInModel, sQuery, sPlaceholder, oObject) {
			MessageToast.show("Query '" + sQuery + "' fired from SearchField with placeholder:\n'" + sPlaceholder + "'\n\n" +
					"Oh, and by the way, the following text comes from a model:\n'" + sBoundStringInModel + "'\n" +
					"The config object has the same data:" +
					"\nstatic: " + oObject.static +
					"\nquery: " + oObject.query +
					"\nplaceholder: " + oObject.placeholder +
					"\nbound: " + oObject.bound
			);
		},

		someExtension: {
			isInExtension: true,
			sayHelloFromExtension: function() {
				MessageToast.show("Hello! Am I in an extension? What is 'this'?\n" + this.isInExtension);
			}
		},

		onDelete: function(oBindingContext) {
			var oPerson = oBindingContext.getProperty(); // get the data object of the current row context from the model
			MessageToast.show("Could now delete: " + oPerson.name);
		}
	});
});