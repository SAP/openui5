sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/dom/getFirstEditableInput"
], function (JSONModel, Controller, Core, getFirstEditableInput) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageFormFocusableInput.controller.ObjectPageFormFocusableInput", {
		handleFocusBtnPress: function () {
			var oObjectPageLayout = this.byId("ObjectPageLayout"),
				oSection = Core.byId(oObjectPageLayout.getSelectedSection()),
				oFirstEditableInput = getFirstEditableInput(oSection.getDomRef());

			if (oFirstEditableInput) {
				oFirstEditableInput.focus();
			}
		}
	});
}, true);
