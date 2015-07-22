/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/odata/type/String',
		'sap/ui/model/odata/type/Date'
	], function(Controller, JSONModel, TypeString, TypeDate) {
	"use strict";

	function getUI5Type(sEdmTypeName) {
		// TODO constraints
		switch (sEdmTypeName) {
			case "Edm.Date":
				return new TypeDate();
			// TODO other EDM types
			default:
				return new TypeString();
		}
	}


	var MainController = Controller.extend("sap.ui.core.sample.odata.v4.PropertyBinding.Main", {

		onInit: function () {
			this.getView().setModel(new JSONModel({ id : "1"}), "ui");
		},

		onReadPress : function (oEvent) {
			var oView = this.getView(),
				oForm = oView.byId("EmployeeForm"),
				sId = oView.getModel("ui").getObject("/id"),
				sPath = "/EMPLOYEES(ID='" + sId + "')";

			oForm.bindObject(sPath);
			oView.getModel().requestObject(
				sPath + "/ENTRYDATE/#Type/QualifiedName"
			).then(function(sEdmTypeName) {
				oView.byId("ENTRYDATE").bindProperty("text", {
					path : "ENTRYDATE",
					type : getUI5Type(sEdmTypeName)
				});
			});
		}
	});

	return MainController;

});
