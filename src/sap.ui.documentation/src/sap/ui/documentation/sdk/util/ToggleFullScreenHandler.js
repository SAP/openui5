/*!
 * ${copyright}
 */

// Provides a simple search feature
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
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
			var i18nModel = oView.getModel('i18n');
			if (!bFullScreen) {
				oButton.setTooltip(i18nModel.getProperty('sampleFullScreenTooltip'));
				oButton.setIcon('sap-icon://full-screen');
			} else {
				oButton.setTooltip(i18nModel.getProperty('sampleExitFullScreenTooltip'));
				oButton.setIcon('sap-icon://exit-full-screen');
			}
		},

		cleanUp : function() {
			this._oSplitApp = null;
		}
	};

	return ToggleFullScreenHandler;

}, /* bExport= */ true);
