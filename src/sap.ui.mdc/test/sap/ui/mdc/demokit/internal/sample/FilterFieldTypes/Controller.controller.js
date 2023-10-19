sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterConverter",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/enums/ConditionValidated",
	'sap/ui/mdc/enums/OperatorName',
	"sap/ui/core/Core"
], function(
	Controller,
	Filter,
	FilterOperator,
	ConditionModel,
	Condition,
	FilterConverter,
	FilterOperatorUtil,
	Operator,
	ConditionValidated,
	OperatorName,
	oCore
) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.FilterFieldTypes.Controller", {

		onInit: function() {
			// this.getView().bindElement("/Books(1)");
			oCore.getMessageManager().registerObject(this.getView(), true);

			// create a ConditionModel for the listbinding
			const oCM = new ConditionModel();
			// var oConditionChangeBinding = oCM.bindProperty("/conditions", oCM.getContext("/"));
			// oConditionChangeBinding.attachChange(this.handleConditionModelChange.bind(this));

			// oCM.addCondition("title", Condition.createCondition(OperatorName.EQ, ["4711"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("title", Condition.createCondition(OperatorName.EQ, ["4711"]));

			//set the model on Form just to have it somehow local
			const oForm = this.byId("Form1");
			oForm.setModel(oCM, "cm");

			// add custom operators
			// FilterOperatorUtil.addOperator(new Operator({
			// 	name: "EUROPE",
			// 	tokenParse: "^#tokenText#$",
			// 	tokenFormat: "#tokenText#",
			// 	tokenText: "Europe",
			// 	longText: "European countries",
			// 	valueTypes: [],
			// 	getModelFilter: function(oCondition, sFieldPath) {
			// 		var oFilter1 = new Filter({ path: sFieldPath, operator: "EQ", value1: "DE" });
			// 		var oFilter2 = new Filter({ path: sFieldPath, operator: "EQ", value1: "FR" });
			// 		return new Filter({ filters: [oFilter1, oFilter2], and: false });
			// 	}
			// }));
		}

	});
});
