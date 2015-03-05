sap.ui.define([
		"sap/m/routing/Router"
	], function (Router) {
	"use strict";

	return Router.extend("sap.ui.demo.mdtemplate.Router", {

		constructor : function() {
			sap.m.routing.Router.apply(this, arguments);
		}

	});

}, /* bExport= */ true);
