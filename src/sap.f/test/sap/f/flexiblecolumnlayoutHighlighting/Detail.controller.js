sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/documentation/sdk/controller/util/Highlighter"
], function (Controller, Highlighter) {
	"use strict";

	return Controller.extend("flexiblecolumnlayoutHighlighting.Detail", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();
		},
		onAfterRendering: function () {
			var oConfig = {
				useExternalStyles: false,
				shouldBeObserved: true,
				isCaseSensitive: false
			};

			if (!this.highlighter) {
				this.highlighter = new Highlighter(this.getView().getDomRef(), oConfig);
			}
		},
		onSearchFieldSearch: function (oEvent) {
			this.highlighter.highlight(oEvent.getSource().getValue());
		},
		handleDetailPress: function () {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
			this.oRouter.navTo("detailDetail", {layout: oNextUIState.layout});
		},
		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout});
		},
		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout});
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {layout: sNextLayout});
		},
		onExit: function () {
			this.highlighter.destroy();
		}
	});
}, true);
