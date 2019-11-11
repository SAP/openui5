sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/documentation/sdk/controller/util/Highlighter"
], function (Controller, Highlighter) {
	"use strict";

	return Controller.extend("flexiblecolumnlayoutHighlighting.Master", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
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
		handleMasterPress: function () {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
			this.oRouter.navTo("detail", {layout: oNextUIState.layout});
		},
		onExit: function () {
			this.highlighter.destroy();
		}
	});
}, true);
