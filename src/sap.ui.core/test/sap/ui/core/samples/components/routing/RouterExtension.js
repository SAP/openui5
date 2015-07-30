sap.ui.define(['jquery.sap.global', 'sap/ui/core/routing/History', 'sap/ui/core/routing/Router'],
	function(jQuery, History, Router) {
	"use strict";

	var RouterExtension = Router.extend("samples.components.routing.RouterExtension", {
		myNavBack : function (route, data) {
			var history = History.getInstance();
			var url = this.getURL(route, data);
			var direction = history.getDirection(url);
			if ("Backwards" === direction) {
				window.history.go(-1);
			} else {
				var replace = true; // otherwise we go backwards with a forward history
				this.navTo(route, data, replace);
			}
		}
	});

	return RouterExtension;

});
