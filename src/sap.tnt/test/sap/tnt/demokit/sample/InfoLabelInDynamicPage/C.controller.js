sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/f/library"
], function (Controller, fioriLibrary) {
	"use strict";

	var DynamicPageTitleArea = fioriLibrary.DynamicPageTitleArea;

	return Controller.extend("sap.tnt.sample.InfoLabelInDynamicPage.C", {

		getPage: function () {
			return this.byId("dynamicPageId");
		},

		toggleAreaPriority: function () {
			var oTitle = this.getPage().getTitle(),
				sNewPrimaryArea = oTitle.getPrimaryArea() === DynamicPageTitleArea.Begin ? DynamicPageTitleArea.Middle : DynamicPageTitleArea.Begin;
			oTitle.setPrimaryArea(sNewPrimaryArea);
		},

		onToggleFooter: function () {
			var oPage = this.getPage();
			oPage.setShowFooter(!oPage.getShowFooter());
		}
	});
});