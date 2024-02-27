sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.dynamicpage.controller.Main", {
		onInit: function () {
			var oView = this.getView();
			this.oDynamicPageTitle = oView.byId("dynamicPageTitleId");
			this.oDynamicPageHeader = oView.byId("dynamicPageHeaderId");
			this.oDynamicPage = oView.byId("dynamicPageId");
		},
		onToggleFooter: function () {
			this.oDynamicPage.setShowFooter(!this.oDynamicPage.getShowFooter());
		},
		onSetSolidBackground: function () {
			this.setBackgroundDesign("Solid");
		},
		onSetTransparentBackground: function () {
			this.setBackgroundDesign("Transparent");
		},
		onSetTranslucentBackground: function () {
			this.setBackgroundDesign("Translucent");
		},
		setBackgroundDesign: function (backgroundDesign) {
			this.oDynamicPageTitle.setBackgroundDesign(backgroundDesign);
			this.oDynamicPageHeader.setBackgroundDesign(backgroundDesign);
		}
	});
});
