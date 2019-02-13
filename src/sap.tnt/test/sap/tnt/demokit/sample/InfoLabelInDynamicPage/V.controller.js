sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/f/library"
], function (jQuery, Controller, fioriLibrary) {
	"use strict";

	var DynamicPageTitleArea = fioriLibrary.DynamicPageTitleArea;

	return Controller.extend("sap.tnt.sample.InfoLabelInDynamicPage.V", {
		getPage : function() {
			return this.byId("dynamicPageId");
		},
		toggleAreaPriority: function () {
			var oTitle = this.getPage().getTitle(),
				sNewPrimaryArea = oTitle.getPrimaryArea() === DynamicPageTitleArea.Begin ? DynamicPageTitleArea.Middle : DynamicPageTitleArea.Begin;
			oTitle.setPrimaryArea(sNewPrimaryArea);
		}
	});
});
