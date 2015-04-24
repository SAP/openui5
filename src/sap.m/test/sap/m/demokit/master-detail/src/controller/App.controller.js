/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/demo/masterdetail/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("sap.ui.demo.masterdetail.controller.App", {

		onInit : function () {
			var oViewModel,
				fnSetAppNotBusy,
				oListSelector = this.getOwnerComponent().oListSelector,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy : true,
				delay : 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			this.getOwnerComponent().oWhenMetadataIsLoaded
				.then(fnSetAppNotBusy, fnSetAppNotBusy);

			// Makes sure that master view is hidden in split app
			// after a new list entry has been selected.
			oListSelector.attachListSelectionChange(function () {
				this.byId("idAppControl").hideMaster();
			}, this);

			// apply compact mode if touch is not supported; this could me made
			// configurable on "combi" devices with touch AND mouse
			this.getView().addStyleClass(this.getOwnerComponent().getCompactCozyClass());
		}
	});

}, /* bExport= */ true);
