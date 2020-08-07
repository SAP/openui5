sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/f/library"
], function (Controller, fioriLibrary) {
	"use strict";

	// shortcut for sap.f.LayoutType
	var LT = fioriLibrary.LayoutType;

	return Controller.extend("sap.f.FlexibleColumnLayoutColumnResize.controller.Master", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oObjectPage = this.getView().byId("ObjectPageLayout");
			this.oFCL = this.getOwnerComponent().getFCL();
			this.bFirstRendering = true;

			this.oRouter.getRoute("master").attachPatternMatched(this._onMasterMatched, this);

			this.oObjectPage.attachNavigate(this._updateUrlOnNavigate, this);

			this.oFCL.attachColumnResize(function (oEvent) {
				if (oEvent.getParameter("beginColumn") && (this.oFCL.getLayout() === LT.OneColumn)) {
					this._scrollToIndexedSection();
				}
			}, this);
		},
		toDetail: function() {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
			this.oRouter.navTo("detail", {layout: oNextUIState.layout});
		},
		_onMasterMatched: function(oEvent) {
			this.iSectionIndex = parseInt(oEvent.getParameter("arguments").section);

			if (this.bFirstRendering) {
				this._scrollToIndexedSection();
				this.bFirstRendering = false;
			}
		},
		_updateUrlOnNavigate: function(oEvent) {
			var oSection = oEvent.getParameter("section"),
				iSectionIndex = this.oObjectPage.indexOfSection(oSection);
			this.oRouter.navTo("master", { section: iSectionIndex});
		},
		_scrollToIndexedSection: function() {
			var oSection;
			if (this.iSectionIndex >= 0) {
				oSection = this.oObjectPage.getSections()[this.iSectionIndex];
				this.getView().byId("ObjectPageLayout").setSelectedSection(oSection);
			}
		}
	});
}, true);
