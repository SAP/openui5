sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Fragment, Controller, JSONModel) {
	"use strict";

	var ControllerController = Controller.extend("sap.ui.unified.sample.ShellBasic.Controller", {
		onInit: function() {
			var oData = {logo: sap.ui.require.toUrl("sap/ui/core") + "/" + "mimes/logo/sap_50x26.png"};
			var oModel = new JSONModel();
			oModel.setData(oData);
			this.getView().setModel(oModel);
		},

		handlePressConfiguration: function(oEvent) {
			var oItem = oEvent.getSource();
			var oShell = this.byId("myShell");
			var bState = oShell.getShowPane();
			oShell.setShowPane(!bState);
			oItem.setShowMarker(!bState);
			oItem.setSelected(!bState);
		},

		handleLogoffPress: function(oEvent) {
			MessageToast.show("Logoff Button Pressed");
		},

		handleUserItemPressed: function(oEvent) {
			MessageToast.show("User Button Pressed");
		},

		handleSearchItemSelect: function(oEvent) {
			MessageToast.show("Search Entry Selected: " + oEvent.getSource().getTitle());
		},

		handleShellOverlayClosed: function() {
			MessageToast.show("Overlay closed");
		},

		handleSearchPressed: function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			if (sQuery == "") {
				return;
			}

			// create Overlay only once
			if (!this._overlay) {
				this._overlay = sap.ui.xmlfragment(
					"sap.ui.unified.sample.ShellBasic.ShellOverlay",
					this
				);
				this.getView().addDependent(this._overlay);
			}

			// mock data
			var aResultData = [];
			for (var i = 0; i < 10; i++) {
				aResultData.push({
									title:(i + 1) + ". " + sQuery,
									text:"Lorem ipsum sit dolem"
								});
			}
			var oData = {
							searchFieldContent: sQuery,
							resultData: aResultData
						};
			var oModel = new JSONModel();
			oModel.setData(oData);
			this._overlay.setModel(oModel);

			// set reference to shell and open overlay
			this._overlay.setShell(this.byId("myShell"));
			this._overlay.open();
		}
	});

	return ControllerController;

});