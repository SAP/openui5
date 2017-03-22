/*!
 * ${copyright}
 */

// Provides a simple search feature
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	var ToggleFullScreenHandler = {

		updateMode : function(oEvt, oView) {
			if (!this._oShell) {
				this._oShell = sap.ui.getCore().byId('Shell');
			}
			var bSwitchToFullScreen = (this._getSplitApp().getMode() === "ShowHideMode");
			if (bSwitchToFullScreen) {
				this._getSplitApp().setMode('HideMode');
				this._oShell.setAppWidthLimited(false);
			} else {
				this._getSplitApp().setMode('ShowHideMode');
				this._oShell.setAppWidthLimited(true);
			}
			this.updateControl(oEvt.getSource(), oView, bSwitchToFullScreen);
		},


		_getSplitApp : function () {
			if (!this._oSplitApp) {
				this._oSplitApp = sap.ui.getCore().byId('splitApp');
			}
			return this._oSplitApp;
		},

		updateControl : function (oButton, oView, bFullScreen) {
			if (arguments.length === 2) {
				bFullScreen = !(this._getSplitApp().getMode() === "ShowHideMode");
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
			this._oShell = null;
		}
	};

	return ToggleFullScreenHandler;

}, /* bExport= */ true);
