sap.ui.define([
	"sap/ui/core/routing/History",
	"sap/ui/core/routing/Router"
], function(History, Router) {
	"use strict";

	var RouterExtension = Router.extend("sap.ui.test.routing.RouterExtension", {
		myNavBack : function (route, data) {
			var history = History.getInstance();
			var url = this.getURL(route, data);
			var direction = history.getDirection(url);
			if (direction === "Backwards") {
				window.history.go(-1);
			} else {
				var replace = true; // otherwise we go backwards with a forward history
				this.navTo(route, data, replace);
			}
		}
	});

	return RouterExtension;

});
