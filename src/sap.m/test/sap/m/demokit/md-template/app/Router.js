sap.ui.define([
		"sap/m/routing/Router",
		"sap/m/routing/RouteMatchedHandler"
	], function (Router, RouteMatchedHandler) {
	"use strict";

	return Router.extend("sap.ui.demo.mdtemplate.Router", {

		constructor : function() {
			sap.m.routing.Router.apply(this, arguments);
		},
		
		myNavBack : function(sRoute, mData) {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
	
			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var bReplace = true; // otherwise we go backwards with a forward history
				this.navTo(sRoute, mData, bReplace);
			}
		},

		backWithoutHash : function (oCurrentView, bIsMaster) {
			var sBackMethod = bIsMaster ? "backMaster" : "backDetail";
			this._findSplitApp(oCurrentView)[sBackMethod]();
		},

		_findSplitApp : function(oControl) {
			var sAncestorControlName = "idAppControl";
	
			if (oControl instanceof sap.ui.core.mvc.View && oControl.byId(sAncestorControlName)) {
				return oControl.byId(sAncestorControlName);
			}
	
			return oControl.getParent() ? this._findSplitApp(oControl.getParent(), sAncestorControlName) : null;
		}
	
	});

}, /* bExport= */ true);