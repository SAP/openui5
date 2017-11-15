sap.ui.controller("mvc.betweenLists", {
	handleDrop: function(oEvent) {
		var oModel = this.getView().getModel();
		var sPath = oEvent.getParameter("draggedControl").getBindingContext().getPath();
		oModel.getObject("/selectedNames").push(oModel.getProperty(sPath));
		oModel.refresh();
	},

	handleDragEnter: function(oEvent) {
		console.log(oEvent.mParameters);
	}
});