/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	var MainController = Controller.extend("sap.ui.core.sample.odata.v4.PropertyBinding.Main", {

		onInit: function () {
			this.getView().setModel(new JSONModel({ id : "1"}), "ui");
		},

		onReadPress : function (oEvent) {
			var oView = this.getView(),
				oForm = oView.byId("EmployeeForm"),
				sId = oView.getModel("ui").getObject("/id");

			oForm.bindObject("/EMPLOYEES(ID='" + sId + "')");
		}
	});

	return MainController;

});
