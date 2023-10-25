sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/dom/getFirstEditableInput"
], function (Element, JSONModel, Controller, getFirstEditableInput) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageFormFocusableInput.controller.ObjectPageFormFocusableInput", {
		handleFocusBtnPress: function () {
			var oObjectPageLayout = this.byId("ObjectPageLayout"),
				oSection = Element.getElementById(oObjectPageLayout.getSelectedSection()),
				oFirstEditableInput = getFirstEditableInput(oSection.getDomRef());

			if (oFirstEditableInput) {
				oFirstEditableInput.focus();
			}
		}
	});
});
