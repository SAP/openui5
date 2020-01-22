sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.f.FlexibleColumnLayoutWithOneColumnStart.controller.DetailDetail", {
		onInit: function () {
			this._bInitiallyScrolledToSection = false;
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();
			this.getOwnerComponent().getFCL().attachColumnAnimationEnd(this.handleNavigationToSection, this);

			this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onSupplierMatched, this);
		},
		handleNavigationToSection: function (oEvent) {
			if (!oEvent.getParameter("endColumn")) {
				return;
			}

			this.scrollToSection();
			this._bInitiallyScrolledToSection = true;
		},
		scrollToSection: function () {
			var sSectionPrefixId = sTargetSectionId = "section" + this._oCurrentSection,
				sTargetSectionId = this.byId(sSectionPrefixId),
				oOPL = this.byId("testpage");

			oOPL.setSelectedSection(sTargetSectionId);
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},
		_onSupplierMatched: function (oEvent) {
			var oComponent = this.getOwnerComponent();

			this._product = oEvent.getParameter("arguments").product || this._product || "0";
			this._oCurrentSection = oEvent.getParameter("arguments").section || this._oCurrentSection || null;

			if (oComponent.getMatchedRoutePatternEndColumn() && oComponent.getMatchedRoutePattern() && !this._bInitiallyScrolledToSecton) {
				this.scrollToSection();
				this._bInitiallyScrolledToSecton = true;
			}
		}
	});
}, true);
