/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/demo/worklist/controller/BaseController",
		"sap/ui/demo/worklist/model/promise",
		"sap/ui/model/json/JSONModel"
	], function (BaseController, promise, JSONModel) {
	"use strict";

	return BaseController.extend("sap.ui.demo.worklist.controller.Object", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			// (this is being taken care of by class 'BusyHandler')
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy : true,
					delay : 0,
					shareSaveAsTileTitle: "",
					shareOnJamTitle: "",
					shareSendEmailSubject: "",
					shareSendEmailMessage: ""
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			// Store original busy indicator delay, so it can be restored later on
			var iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "view");
			this.getOwnerComponent().oWhenMetadataIsLoaded.then(function () {
					// Restore original busy indicator delay for the object view
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				}.bind(this)
			);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Navigates back to the worklist
		 * @function
		 */
		onNavBack : function () {
			this.myNavBack("worklist");
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

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
			var oView = this.getView(),
				oViewModel = this.getModel("view");
			// Set busy indicator during view binding
			oViewModel.setProperty("/busy", true);
			oView.bindElement(sObjectPath);

			promise.whenThereIsDataForTheElementBinding(oView.getElementBinding()).then(
				function (sPath) {
					var oResourceBundle = this.getResourceBundle(),
						oObject = oView.getBindingContext().getObject(),
						sObjectId = oObject.ObjectID,
						sObjectName = oObject.Name;

					// Everything went fine.
					oViewModel.setProperty("/busy", false);
					oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
					oViewModel.setProperty("/shareOnJamTitle", sObjectName);
					oViewModel.setProperty("/shareSendEmailSubject",
						oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
					oViewModel.setProperty("/shareSendEmailMessage",
						oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, window.location.href]));
				}.bind(this),
				function () {
					// Something went wrong. Display an error page.
					oViewModel.setProperty("/busy", false);
					this.getRouter().getTargets().display("objectNotFound");
				}.bind(this)
			);

		}

	});

}, /* bExport= */ true);
