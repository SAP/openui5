sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.CommonCardSettings", {
		onBeforeRendering: function () {
			if (!this._oParentView) {
				this._oParentView = this._findParentView();
			}
		},

		onLoadingChange: function (oEvent) {
			this._oParentView
				.findAggregatedObjects(true, function (e) {
					return e.isA("sap.ui.integration.widgets.Card");
				})
				.forEach(function (oCard) {
					if (oEvent.getParameter("state")) {
						oCard.showLoadingPlaceholders();
					} else {
						oCard.hideLoadingPlaceholders();
					}
				});
		},

		_findParentView: function () {
			var oParent = this.getView().getParent();

			while (!oParent.isA("sap.ui.core.mvc.XMLView")) {
				oParent = oParent.getParent();
			}

			return oParent;
		}

	});
});