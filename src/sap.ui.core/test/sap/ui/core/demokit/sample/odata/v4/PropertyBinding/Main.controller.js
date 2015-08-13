/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/odata/type/String',
		'sap/ui/model/odata/type/Date',
		'sap/ui/model/odata/type/Decimal'
	], function(Controller, JSONModel, TypeString, TypeDate, TypeDecimal) {
	"use strict";

	function getUI5Type(sEdmTypeName) {
		// TODO constraints
		switch (sEdmTypeName) {
			case "Edm.Date":
				return new TypeDate();
			case "Edm.Decimal":
				return new TypeDecimal();
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

			function bindProperties(sRelPath, sId) {
				oView.getModel().requestObject(sPath + "/" + sRelPath + "/#Type").then(
					function(oType) {
						var oControl = oView.byId(sId);
						oControl.bindProperty("text", {
							path : sRelPath,
							type : getUI5Type(oType.QualifiedName)
						});
						oControl.setTooltip("Type: " + JSON.stringify(oType));
					});
			}

			oForm.bindObject(sPath);
			bindProperties("ENTRYDATE", "ENTRYDATE");
			bindProperties("SALARY/MONTHLY_BASIC_SALARY_AMOUNT",
				"SALARY-MONTHLY_BASIC_SALARY_AMOUNT");
		}
	});

	return MainController;

});
