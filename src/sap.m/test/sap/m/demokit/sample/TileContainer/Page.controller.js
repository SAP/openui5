sap.ui.controller("sap.m.sample.TileContainer.Page", {

	onInit : function (evt) {
		// set mock model
		var sPath = jQuery.sap.getModulePath("sap.m.sample.TileContainer", "/data.json");
		var oModel = new sap.ui.model.json.JSONModel(sPath);
		this.getView().setModel(oModel);
	},

	handleEditPress : function (evt) {
		var oTileContainer = this.getView().byId("container");
		var newValue = ! oTileContainer.getEditable();
		oTileContainer.setEditable(newValue);
		evt.getSource().setText(newValue ? "Done" : "Edit");
	},

	handleTileDelete : function (evt) {
		var tile = evt.getParameter("tile");
		evt.getSource().removeTile(tile);
	}
});