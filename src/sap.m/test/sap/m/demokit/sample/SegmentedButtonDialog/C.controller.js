sap.ui.define([
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(Fragment, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.SegmentedButtonDialog.C", {

		onOpenDialog: function () {
			var oView = this.getView();

			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.SegmentedButtonDialog.Dialog",
					controller: this
				}).then(function(oDialog){
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._pDialog.then(function(oDialog){
				oDialog.open();
			});
		},

		onCloseDialog: function () {
			// note: We don't need to chain to the _pDialog promise, since this event-handler
			// is only called from within the loaded dialog itself.
			this.byId("myDialog").close();
		}
	});

});
