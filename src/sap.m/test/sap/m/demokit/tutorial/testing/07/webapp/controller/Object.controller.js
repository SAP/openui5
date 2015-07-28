sap.ui.define([
	'sap/ui/demo/bulletinboard/controller/BaseController',
	'sap/ui/demo/bulletinboard/model/promise',
	'sap/ui/model/json/JSONModel',
	'sap/ui/demo/bulletinboard/model/formatter'
], function (BaseController, promise, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("sap.ui.demo.bulletinboard.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					shareSaveAsTileTitle: "",
					shareOnJamTitle: "",
					shareSendEmailSubject: "",
					shareSendEmailMessage: ""
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "objectView");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Navigates back to the worklist
		 * @function
		 */
		onNavBack: function () {
			this.myNavBack("worklist");
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectPath = "/Posts('" + oEvent.getParameter("arguments").objectId + "')";

			this._bindView(sObjectPath);
		},

		/**
		 * Binds the view to the object path.
		 *
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView");

			// Set busy indicator during view binding
			oViewModel.setProperty("/busy", true);
			oView.bindElement(sObjectPath);

			promise.whenThereIsDataForTheElementBinding(oView.getElementBinding()).then(
				function () {
					var oResourceBundle = this.getResourceBundle(),
						oObject = oView.getBindingContext().getObject(),
						sObjectId = oObject.PostID,
						sObjectName = oObject.Title;

					// Everything went fine.
					oViewModel.setProperty("/shareSendEmailSubject",
						oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
					oViewModel.setProperty("/shareSendEmailMessage",
						oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, window.location.href]));
				}.bind(this)
			);

		}

	});

});
