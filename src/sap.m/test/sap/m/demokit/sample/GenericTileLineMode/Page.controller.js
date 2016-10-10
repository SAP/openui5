sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(jQuery, Controller, MessageToast) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.GenericTileLineMode.Page", {
		onInit: function() {
			var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getResourcePath("sap/m/sample/GenericTileLineMode/tiles.json"));
			this.getView().setModel(oModel);

			sap.ui.getCore().attachIntervalTimer(function() {
				var bCompact = jQuery("body").hasClass("sapUiSizeCompact");
				if (this._bCompact !== bCompact) {
					this.getView().byId("TileContainerCollapsed").invalidate();
					this._bCompact = bCompact;
				}
			}.bind(this));
		},

		press : function(evt) {
			var oTile = evt.getSource();
			MessageToast.show("The GenericTile \"" + oTile.getHeader() + "\" was pressed.");
		}
	});

	return PageController;
});
