/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/sample/common/Controller"
], function (MessageBox, MessageToast, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Sticky.Main", {
		discard : function () {
			this.setStickyContext(null);
			this.selectedContext.refresh();
			delete this.selectedContext;
		},

		onDiscard : function () {
			var oOperation = this.getView().getModel().bindContext("/DiscardChanges(...)"),
				that = this;

			oOperation.invoke().then(function () {
				that.discard();
				MessageToast.show("Sticky session discarded");
			}, function (oError) {
				MessageToast.show("Failed to discard sticky session " + oError);
			});
		},

		onInit : function () {
			var that = this;

			this.initMessagePopover("messagesButton");
			this.getView().getModel().attachEvent("sessionTimeout", function () {
				// The changes on the server are lost. Discard and allow for a new session.
				that.discard();
				MessageBox.error("Session timeout");
			});
		},

		onPrepare : function () {
			var oItem = this.byId("Sticky").getSelectedItem(),
				oOperation,
				that = this;

			if (!oItem) {
				MessageToast.show("No item selected");
				return;
			}

			oOperation = this.getView().getModel().bindContext(
				"com.sap.gateway.srvd.zrc_rap_sticky.v0001.PrepareForEdit(...)",
				oItem.getBindingContext());

			oOperation.invoke().then(function (oStickyContext) {
				MessageToast.show("Sticky session opened");
				that.setStickyContext(oStickyContext);
				that.selectedContext = oItem.getBindingContext();
			}, function (oError) {
				MessageToast.show("Failed to open sticky session: " + oError);
			});
		},

		onSave : function () {
			var oOperation,
				that = this;

			oOperation = this.getView().getModel().bindContext(
				"com.sap.gateway.srvd.zrc_rap_sticky.v0001.SaveChanges(...)",
				this.byId("Sticky::details").getBindingContext());

			oOperation.invoke().then(function () {
				MessageToast.show("Changes saved, sticky session closed");
				that.setStickyContext(null);
				that.selectedContext.refresh();
				delete that.selectedContext;
			}, function (oError) {
				MessageToast.show("Failed to close sticky session: " + oError);
			});
		},

		setStickyContext : function (oStickyContext) {
			this.getView().getModel("ui").setProperty("/bSticky", !!oStickyContext);
			this.byId("Sticky::details").setBindingContext(oStickyContext);
		}
	});
});
