sap.ui.define([
	"sap/ui/demo/worklist/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("sap.ui.demo.worklist.controller.App", {

		onInit : function () {
			var oViewModel;
			this._iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy : true,
				delay : 0
			});

			this.setModel(oViewModel, "view");

			this.getOwnerComponent().oWhenMetadataIsLoaded
				.then(this._setAppUnbusy.bind(this), this._setAppUnbusy.bind(this));
		},

		/**
		 * This method removes the busy indicator delay and the app's busy state.
		 * The busy indicator delay is reset to the UI5 default after the initial busy state of the view.
		 *
		 * @private
		 */
		_setAppUnbusy : function () {
			var oModel = this.getModel("view"),
				oData = oModel.getData();

			oData.busy = false;
			oData.delay = this._iOriginalBusyDelay;
			oModel.setData(oData);
		}
	});

}, /* bExport= */ true);
