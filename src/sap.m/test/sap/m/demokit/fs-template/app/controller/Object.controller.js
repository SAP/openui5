sap.ui.define([
		"sap/ui/demo/fstemplate/controller/BaseController"
	], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.fstemplate.controller.Object", {

		onInit : function () {
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Set the detail page busy after the metadata has been loaded successfully
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function () {
					this.getView().setBusyIndicatorDelay(0)
						.setBusy(true)
						.setBusyIndicatorDelay(null);
				}.bind(this)
			);
		},

		/**
		 * Binds the view to the object path.
		 *
		 * @function
		 * @param oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
			var sObjectPath = "/Objects('" + oEvent.getParameter("arguments").objectId + "')";
			this._bindView(sObjectPath);
		},

		/**
		 * Binds the view to the object path.
		 *
		 * @function
		 * @private
		 */
		_bindView : function (sObjectPath) {
			var oView = this.getView().bindElement(sObjectPath);

			this.getModel().whenThereIsDataForTheElementBinding(oView.getElementBinding()).then(
				function (sPath) {
					this.getView().setBusy(false);
				}.bind(this),
				function () {
					this.getView().setBusy(false);
					this.getRouter().getTargets().display("objectNotFound");
				}.bind(this)
			);

		},

		/**
		 * On detail view, 'nav back' is only relevant when
		 * running on phone devices. On larger screens, the detail
		 * view has no other view to go back to.
		 * If running on phone though, the app
		 * will navigate back to the 'master' view.
		 *
		 * @function
		 */
		onNavBack : function () {
			// This is only relevant when running on phone devices
			this.myNavBack("worklist");
		}

	});

}, /* bExport= */ true);
