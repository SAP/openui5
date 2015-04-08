/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/demo/worklist/controller/BaseController",
		"sap/ui/demo/worklist/model/promise",
		"sap/ui/model/json/JSONModel",
		"sap/ui/demo/worklist/model/formatter"
	], function (BaseController, promise, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("sap.ui.demo.worklist.controller.Object", {

		formatter: formatter,

		onInit : function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			// (this is being taken care of by class 'BusyHandler')
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy : true,
					delay : 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "view");
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function () {
					// Restore original busy indicator delay for the object view
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				}
			);
		},

		/**
		 * Binds the view to the object path.
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
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
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView : function (sObjectPath) {
			var oView = this.getView(),
				oViewModel = this.getModel("view");
			// Set busy indicator during view binding
			oViewModel.setProperty("/busy", true);
			oView.bindElement(sObjectPath);

			promise.whenThereIsDataForTheElementBinding(oView.getElementBinding()).then(
				function () {
					// Everything went fine.
					oViewModel.setProperty("/busy", false);
				},
				function () {
					// Something went wrong. Display an error page.
					oViewModel.setProperty("/busy", false);
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

});
