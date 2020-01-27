sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/f/FlexibleColumnLayoutSemanticHelper"
], function (jQuery, UIComponent, JSONModel, FlexibleColumnLayoutSemanticHelper) {
	"use strict";

	var Component = UIComponent.extend("teamCalendar.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			var oRouter;

			UIComponent.prototype.init.apply(this, arguments);
			this._sCalendarViewKey = "";
			this._oStartDate = undefined;
			oRouter = this.getRouter();
			this._aControllers = {};

			oRouter.initialize();
			oRouter.attachRouteMatched(this._routeMatched.bind(this));
		},

		_routeMatched: function(oEvent) {
			var oViewName = oEvent.getParameter("name"),
				oController = this._aControllers[oViewName];

			if (!oController) {
				this._aControllers[oViewName] = oEvent.getParameter("view").getController();
			} else {
				if (oController._oSelector) {
					// Planning Calendar View is selected
					oController._setCalendar();
					oController._oSelector.setSelectedKey(oController._sTeamSelected);
				} else {
					// Single Planning Calendar is selected
					oController._setCalendar();
				}
			}
		}

	});
	return Component;
}, true);
