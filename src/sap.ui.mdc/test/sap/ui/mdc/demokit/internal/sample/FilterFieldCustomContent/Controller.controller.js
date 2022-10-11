sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/EditMode",
	'sap/ui/mdc/enum/ConditionValidated',
	"sap/m/MessageToast"
], function(
	Controller,
	oCore,
	ConditionModel,
	Condition,
	EditMode,
	ConditionValidated,
	MessageToast
	) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.FilterFieldCustomContent.Controller", {

		onInit: function() {
			var oView = this.getView();
			oCore.getMessageManager().registerObject(oView, true);

			var oCM = new ConditionModel();
			oCM.addCondition("title", Condition.createCondition("EQ", ["4711"], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("metricsWords", Condition.createCondition("EQ", [4711], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("descr", Condition.createCondition("GT", ["A"], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("descr", Condition.createCondition("BT", ["B", "C"], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("number", Condition.createCondition("EQ", [1], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("number", Condition.createCondition("EQ", [3], undefined, undefined, ConditionValidated.NotValidated));

			//set the model on Form just to have it somehow local
			var oForm = this.byId("Form1");
			oForm.setModel(oCM, "cm");
		},

		handleChange: function(oEvent) {
			var oFilterField = oEvent.getSource();
			var oPromise = oEvent.getParameter("promise");

			if (oPromise) {
				oPromise.then(function(aConditions) {
					var sText = "[";
					for (var i = 0; i < aConditions.length; i++) {
						sText = sText + JSON.stringify(aConditions[i]) + " ;";
					}
					sText = sText + "]";
					MessageToast.show("Change " + oFilterField.getId() + "; conditions: " + sText);
				}).catch(function(oError) {
					MessageToast.show(oError.message);
				});
			}
		}

	});
});
