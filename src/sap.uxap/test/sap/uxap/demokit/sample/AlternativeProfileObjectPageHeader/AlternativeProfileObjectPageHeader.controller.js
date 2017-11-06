sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.AlternativeProfileObjectPageHeader.AlternativeProfileObjectPageHeader", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/AlternativeProfileObjectPageHeader/employee.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		},
		handlePress: function (oEvent) {
			var oObjectHeaderCont = this.byId("ObjectPageLayout");
			oObjectHeaderCont.setShowHeaderContent(!oObjectHeaderCont.getShowHeaderContent());
		},
		_getResponsivePopoverUnsavedChanges: function () {
			if (!this._oPopoverChanges) {
				this._oPopoverChanges = sap.ui.xmlfragment("sap.uxap.sample.AlternativeProfileObjectPageHeader.PopoverUnsavedChanges", this);
				this.getView().addDependent(this._oPopover);
			}
			return this._oPopoverChanges;
		},
		handleMarkChangesPress: function (oEvent) {
			var oPopoverChanges = this._getResponsivePopoverUnsavedChanges();
			oPopoverChanges.openBy(oEvent.getParameter("domRef"));
			oPopoverChanges.setModel(oEvent.getSource().getModel());
		}
	});
}, true);
