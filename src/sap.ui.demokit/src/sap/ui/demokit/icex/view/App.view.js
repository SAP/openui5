/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/JSView",
	"sap/ui/core/mvc/XMLView"
], function (JSView, XMLView) {
	"use strict";

	sap.ui.jsview("sap.ui.demokit.icex.view.App", {

		getControllerName : function () {
			return "sap.ui.demokit.icex.view.App";
		},
		
		createContent : function (oController) {
			
			// to avoid scrollbars on desktop the root view must be set to block display
			this.setDisplayBlock(true);
			
			this.app = new sap.m.SplitApp();
			
			this.app.addMasterPage(sap.ui.xmlview("Master", "sap.ui.demokit.icex.view.Master"));
			
			this.app.addDetailPage(sap.ui.xmlview("Welcome", "sap.ui.demokit.icex.view.Welcome"));
			
			return new sap.m.Shell("Shell", {
				title : "SAPUI5 Icon Explorer",
				showLogout : false,
				app : this.app,
				homeIcon : {
					'phone' : 'img/57_iPhone_Desktop_Launch.png',
					'phone@2' : 'img/114_iPhone-Retina_Web_Clip.png',
					'tablet' : 'img/72_iPad_Desktop_Launch.png',
					'tablet@2' : 'img/144_iPad_Retina_Web_Clip.png',
					'favicon' : 'img/favicon.ico',
					'precomposed': false
				}
			});
		}
	});
});
