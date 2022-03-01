sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.Card.C", {

		resolveUrl: function(sUrl) {
			return sap.ui.require.toUrl("sap/ui/webc/main/sample/Card/assets/avatars/" + sUrl);
		}

	});
});