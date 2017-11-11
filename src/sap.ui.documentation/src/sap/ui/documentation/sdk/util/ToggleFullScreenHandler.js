/*!
 * ${copyright}
 */

// Provides a simple search feature
sap.ui.define([],
	function() {
	"use strict";


	var ToggleFullScreenHandler = {

		updateMode : function(oEvt, oView, oController) {
			var bSwitchToFullScreen = (this._getSplitApp(oController).getMode() === "ShowHideMode");
			if (bSwitchToFullScreen) {
				this._getSplitApp(oController).setMode('HideMode');
			} else {
				this._getSplitApp(oController).setMode('ShowHideMode');
			}
			this.updateControl(oEvt.getSource(), oView, bSwitchToFullScreen, oController);
		},


		_getSplitApp : function (oController) {
			if (!this._oSplitApp) {
				this._oSplitApp = oController.getSplitApp();
			}
			return this._oSplitApp;
		},

		updateControl : function (oButton, oView, bFullScreen, oController) {
			if (arguments.length === 2) {
				bFullScreen = !(this._getSplitApp(oController).getMode() === "ShowHideMode");
			}
			if (!bFullScreen) {
				oButton.setTooltip("Show this sample in full screen mode");
				oButton.setIcon('sap-icon://full-screen');
			} else {
				oButton.setTooltip("Show this sample in the detail view of a split container.");
				oButton.setIcon('sap-icon://exit-full-screen');
			}
		},

		cleanUp : function() {
			this._oSplitApp = null;
		}
	};

	return ToggleFullScreenHandler;

}, /* bExport= */ true);
