sap.ui.define([
		"sap/ui/demo/worklist/controller/BaseController"
	], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.worklist.controller.Object", {

		onInit : function () {
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			// Store original busy indicator delay, so it can be restored later on
			var iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			// Set the detail page busy after the metadata has been loaded successfully
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function () {
					// Make sure, busy indication is showing immediately so there is no
					// break in between the busy indication for loading the view's meta data
					// (this is being taken care of by class 'BusyHandler')
					this.getView().setBusyIndicatorDelay(0)
						.setBusy(true);
					// Method chaining not possible, 'setBusy' does not return view
					// Restore original busy indicator delay for the object view
					this.getView().setBusyIndicatorDelay(iOriginalBusyDelay);
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
			var oView = this.getView();
			// Set busy indicator during view binding
			oView.setBusy(true);
			oView.bindElement(sObjectPath);

			this.getModel().whenThereIsDataForTheElementBinding(oView.getElementBinding()).then(
				function (sPath) {
					// Everything went fine.
					this.getView().setBusy(false);
				}.bind(this),
				function () {
					// Something went wrong. Display an error page.
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
