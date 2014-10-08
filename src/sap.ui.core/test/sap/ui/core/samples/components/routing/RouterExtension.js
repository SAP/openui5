jQuery.sap.declare("samples.components.routing.RouterExtension");
jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.require("sap.ui.core.routing.History");
sap.ui.core.routing.Router.extend("samples.components.routing.RouterExtension", {
	myNavBack : function (route, data) {
		var history = sap.ui.core.routing.History.getInstance();
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