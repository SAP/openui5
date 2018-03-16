sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast" // for call from View
], function(Controller) {
	"use strict";

	return Controller.extend("mvctest.controller.ExtendedXMLViewEventHandlerSyntax", {
		onInit: function () {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({"data": "This text comes from a model"});
			this.getView().setModel(oModel);

			oModel = new sap.ui.model.json.JSONModel();
			oModel.setData([
				{"name": "Peter"},
				{"name": "Paul"},
				{"name": "Mary"}
			]);
			this.getView().setModel(oModel, "names");
		},

		saySomething: function(sText) {
			alert(typeof sText === "string" ? sText : "[no argument passed to saySomething()]");
		},

		saySomethingComplex: function(sBoundStringInModel, sQuery, sPlaceholder, oObject) {
			alert("Query '" + sQuery + "' fired from SearchField with placeholder:\n'" + sPlaceholder + "'\n\n" +
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
				alert("Hello! Am I in an extension? What is 'this'?\n" + this.isInExtension);
			}
		},

		onDelete: function(oBindingContext) {
			var oPerson = oBindingContext.getProperty(); // get the data object of the current row context from the model
			alert("Could now delete: " + oPerson.name);
		}
	});
});