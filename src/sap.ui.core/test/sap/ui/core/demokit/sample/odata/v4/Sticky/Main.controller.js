/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/sample/common/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Sticky.Main", {
		onDiscard : function (oEvent) {
			var oOperation = this.getView().getModel().bindContext("/DiscardChanges(...)"),
				that = this;

			oOperation.execute().then(function () {
				sap.m.MessageToast.show("Sticky session dicarded");
				that.toggleSticky();
				that.selectedContext.refresh();
				delete that.selectedContext;
			}, function (oError) {
				sap.m.MessageToast.show("Failed to discard sticky session " + oError);
			});
		},

		onInit : function () {
			this.initMessagePopover("messagesButton");
		},

		onPrepare : function (oEvent) {
			var oItem = this.byId("Sticky").getSelectedItem(),
				oOperation,
				that = this;

			if (!oItem) {
				sap.m.MessageToast.show("No item selected");
				return;
			}

			oOperation = this.getView().getModel().bindContext(
				"com.sap.gateway.srvd.zrc_rap_sticky.v0001.PrepareForEdit(...)",
				oItem.getBindingContext());

			oOperation.execute().then(function (oStickyContext) {
				sap.m.MessageToast.show("Sticky session opened");
				that.toggleSticky(oStickyContext);
				that.selectedContext = oItem.getBindingContext();
			}, function (oError) {
				sap.m.MessageToast.show("Failed to open sticky session: " + oError);
			});
		},

		onSave : function (oEvent) {
			var oOperation,
				that = this;

			oOperation = this.getView().getModel().bindContext(
				"com.sap.gateway.srvd.zrc_rap_sticky.v0001.SaveChanges(...)" ,
				this.byId("Sticky::details").getBindingContext());

			oOperation.execute().then(function () {
				sap.m.MessageToast.show("Changes saved, sticky session closed");
				that.toggleSticky();
				that.selectedContext.refresh();
				delete that.selectedContext;
			}, function (oError) {
				sap.m.MessageToast.show("Failed to close sticky session: " + oError);
			});
		},

		toggleSticky : function (oStickyContext) {
			this.getView().getModel("ui").setProperty("/bSticky", !!oStickyContext);
			this.byId("Sticky::details").setBindingContext(oStickyContext);
		}
	});
});