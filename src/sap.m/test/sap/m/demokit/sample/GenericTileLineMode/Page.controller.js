sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(jQuery, Controller, MessageToast) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.GenericTileLineMode.Page", {
		onInit: function() {
			var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getResourcePath("sap/m/sample/GenericTileLineMode/tiles.json"));
			this.getView().setModel(oModel);
		},

		press : function(evt) {
			var oTile = evt.getSource();

			if (evt.getParameter("action") === "Remove") {
				MessageToast.show("Remove action of GenericTile \"" + oTile.getHeader() + "\" has been pressed.");
			} else {
				MessageToast.show("The GenericTile \"" + oTile.getHeader() + "\" has been pressed.");
			}
		}
	});

	return PageController;
});
