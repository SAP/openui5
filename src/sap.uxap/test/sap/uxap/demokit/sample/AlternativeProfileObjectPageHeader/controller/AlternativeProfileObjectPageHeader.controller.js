sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller", "sap/ui/core/Fragment"], function (JSONModel, Controller, Fragment) {
	"use strict";

	return Controller.extend("sap.uxap.sample.AlternativeProfileObjectPageHeader.controller.AlternativeProfileObjectPageHeader", {
		onInit: function () {
			var oJsonModel = new JSONModel(sap.ui.require.toUrl("sap/uxap/sample/SharedJSONData/employee.json"));
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		},
		handlePress: function (oEvent) {
			var oObjectHeaderCont = this.byId("ObjectPageLayout");
			oObjectHeaderCont.setShowHeaderContent(!oObjectHeaderCont.getShowHeaderContent());
		},
		_getResponsivePopoverUnsavedChanges: function () {
			if (!this._oPopoverChangesPromise) {
				this._oPopoverChangesPromise = Fragment.load({
					id: this.getView().getId(),
					name: "sap.uxap.sample.AlternativeProfileObjectPageHeader.view.PopoverUnsavedChanges",
					controller: this
				}).then(function (oPopover) {
					this.getView().addDependent(oPopover);
					return oPopover;
				}.bind(this));
			}
			return this._oPopoverChangesPromise;
		},
		handleMarkChangesPress: function (oEvent) {
			this._getResponsivePopoverUnsavedChanges().then(function (oPopoverChanges) {
				oPopoverChanges.openBy(oEvent.getParameter("domRef"));
				oPopoverChanges.setModel(oEvent.getSource().getModel());
			});
		}
	});
});
