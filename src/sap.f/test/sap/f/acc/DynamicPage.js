sap.ui.define([
	"util/DynamicPageUtility",
	"sap/m/App",
	"sap/m/Button"
], function(oDynamicPageUtil, App, Button) {
	"use strict";

	var fnToggleFooter = function () {
		oPage.setShowFooter(!oPage.getShowFooter());
	};

	var oToggleFooterButton = new Button({
		text: "Toggle footer",
		press: fnToggleFooter
	});

	var oTitle = oDynamicPageUtil.getTitle(oToggleFooterButton);
	var oHeader = oDynamicPageUtil.getHeader();
	var oContent = new Button({text: "Home"});
	var oFooter = oDynamicPageUtil.getFooter();

	var oPage = oDynamicPageUtil.getDynamicPage(false, oTitle, oHeader, oContent, oFooter);

	var oApp = new App("myApp");
	oApp.addPage(oPage).placeAt("body");
});
