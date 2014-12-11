/*!
 * @copyright@
 */

// Provides a simple search feature
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	var ToggleFullScreenHandler = {
		
		actionPerformed : function(oEvt, oView) {	
			if (!this.oShell) {
				this.oShell = sap.ui.getCore().byId('Shell');
			}
			var bSwitchToFullScreen = (this._getSplitApp().getMode() == "ShowHideMode");
			if (bSwitchToFullScreen) {
				this._getSplitApp().setMode('HideMode');
				this.oShell.setAppWidthLimited(false);
			} else {
				this._getSplitApp().setMode('ShowHideMode');
				this.oShell.setAppWidthLimited(true);
			}
			this.updateToggleFullScreenBtn(oEvt.getSource(), oView, bSwitchToFullScreen);
		},
		
		
		_getSplitApp : function () {
			if (!this.oSplitApp) {
				this.oSplitApp = sap.ui.getCore().byId('splitApp');
			}
			return this.oSplitApp;
		},
	
		updateToggleFullScreenBtn : function (oButton, oView, bFullScreen) {
			if (arguments.length == 2) {
				bFullScreen = !(this._getSplitApp().getMode() == "ShowHideMode");
			}
			var i18nModel = oView.getModel('i18n');
			if (!bFullScreen) {
				oButton.setText(i18nModel.getProperty('sampleFullScreen'));
				oButton.setTooltip(i18nModel.getProperty('sampleFullScreenTooltip'));
				oButton.setIcon('sap-icon://full-screen');
			} else {
				oButton.setText(i18nModel.getProperty('sampleExitFullScreen'));
				oButton.setTooltip(i18nModel.getProperty('sampleExitFullScreenTooltip'));
				oButton.setIcon('sap-icon://exit-full-screen');
			}
		},
		
		cleanUp : function() {
			this.oSplitApp = null;
			this.oShell = null;
		}
	};

	return ToggleFullScreenHandler;

}, /* bExport= */ true);