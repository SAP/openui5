sap.ui.define([
	"sap/ui/demo/masterdetail/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.masterdetail.controller.App", {

		onInit : function () {

			var oComponent = this.getOwnerComponent();
			// attaches to the onInit event that gets called by the component after it is
			// initialized.
			// this is used to handle all things that have dependencies on component assets
			var oListSelector = oComponent.oListSelector;

			oListSelector.attachEvent(oListSelector.M_EVENTS.ListSelectionChanged, function () {
				this.byId("idAppControl").hideMaster();
			}, this);

			// apply compact mode if touch is not supported; this could me made configurable on "combi" devices with touch AND mouse
			this.getView().addStyleClass(oComponent.getCompactCozyClass());
		}
	});

}, /* bExport= */ true);
