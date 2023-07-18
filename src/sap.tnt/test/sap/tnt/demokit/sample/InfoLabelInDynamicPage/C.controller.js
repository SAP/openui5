sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/f/library"
], function (Controller, fioriLibrary) {
	"use strict";

	return Controller.extend("sap.tnt.sample.InfoLabelInDynamicPage.C", {

		getPage: function () {
			return this.byId("dynamicPageId");
		},

		toggleAreaPriority: function () {
			var oTitle = this.getPage().getTitle(),
				sDefaultShrinkRatio = oTitle.getMetadata().getProperty("areaShrinkRatio").getDefaultValue(),
				sNewShrinkRatio = oTitle.getAreaShrinkRatio() === sDefaultShrinkRatio ? "1.6:1:1.6" : sDefaultShrinkRatio;
			oTitle.setAreaShrinkRatio(sNewShrinkRatio);
		},

		onToggleFooter: function () {
			var oPage = this.getPage();
			oPage.setShowFooter(!oPage.getShowFooter());
		}
	});
});