sap.ui.define(['sap/base/Log', 'sap/ui/core/mvc/Controller'], function(Log, Controller) {
	"use strict";

	return Controller.extend("mvc.betweenLists", {
		handleDrop: function(oEvent) {
			var oModel = this.getView().getModel();
			var sPath = oEvent.getParameter("draggedControl").getBindingContext().getPath();
			oModel.getObject("/selectedNames").push(oModel.getProperty(sPath));
			oModel.refresh();
		},

		handleDragEnter: function(oEvent) {
			Log.info(oEvent.mParameters);
		}
	});

});