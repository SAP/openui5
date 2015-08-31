sap.ui.define(["sap/ui/core/mvc/Controller"],
	function (Controller) {
		"use strict";

	return Controller.extend("sap.ui.demo.db.controller.App", {
		formatMapUrl: function(sStreet, sZip, sCity, sCountry) {
			return "https://maps.googleapis.com/maps/api/staticmap?zoom=13&size=500x300&markers="
			+ jQuery.sap.encodeURL(sStreet + ", " + sZip +  " " + sCity + ", " + sCountry);
		}
	});
});
