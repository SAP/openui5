sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageToast, Fragment, Controller, JSONModel) {
	"use strict";

	var ControllerController = Controller.extend("sap.ui.unified.sample.ShellBasic.Controller", {
		onInit: function() {
			var oData = {logo: sap.ui.require.toUrl("sap/ui/core/mimes/logo/sap_50x26.png")};
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

			this.getOverlay().then(function(oOverlay) {
				oOverlay.setModel(oModel);

				// set reference to shell and open overlay
				oOverlay.setShell(this.byId("myShell"));
				oOverlay.open();
			}.bind(this));
		},

		getOverlay: function() {
			return new Promise(function(resolve) {
				// create Overlay only once
				if (!this._overlay) {
					Fragment.load({
						type: "XML",
						name: "sap.ui.unified.sample.ShellBasic.ShellOverlay",
						controller: this
					}).then(function(oOverlay) {
						this._overlay = oOverlay;
						resolve(oOverlay);
					}.bind(this));
				} else {
					resolve(this._overlay);
				}
			}.bind(this));
		}
	});

	return ControllerController;

});