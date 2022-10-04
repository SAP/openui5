sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/EditMode"
], function(
	Controller,
	oCore,
	JSONModel,
	ConditionModel,
	Condition,
	EditMode
	) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.FilterFieldCustomContent.Controller", {

		onInit: function() {
			var oView = this.getView();
			oCore.getMessageManager().registerObject(oView, true);

			var oCM = new ConditionModel();
			oCM.addCondition("title", Condition.createCondition("EQ", ["4711"]));
			oCM.addCondition("metricsWords", Condition.createCondition("EQ", [4711]));
			oCM.addCondition("descr", Condition.createCondition("GT", ["A"]));
			oCM.addCondition("descr", Condition.createCondition("BT", ["B", "C"]));

			//set the model on Form just to have it somehow local
			var oForm = this.byId("Form1");
			oForm.setModel(oCM, "cm");

			// var oViewModel = new JSONModel({
			// 	editMode: EditMode.Editable
			// });
			// oView.setModel(oViewModel, "view");

		}

	});
});
