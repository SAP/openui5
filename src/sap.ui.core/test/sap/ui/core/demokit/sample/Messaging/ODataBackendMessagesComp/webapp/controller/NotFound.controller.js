sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.core.sample.Messaging.ODataBackendMessagesComp.controller.NotFound", {

		onInit() {
			const oRouter = this.getRouter();
			const oTarget = oRouter.getTarget("notFound");
			oTarget.attachDisplay((oEvent) => {
				this._oData = oEvent.getParameter("data");	// store the data
			});
		},

		// override the parent's onNavBack (inherited from BaseController)
		onNavBack() {
			// in some cases we could display a certain target when the back button is pressed
			if (this._oData?.fromTarget) {
				this.getRouter().getTargets().display(this._oData.fromTarget);
				delete this._oData.fromTarget;
				return;
			}

			// call the parent's onNavBack
			BaseController.prototype.onNavBack.apply(this, arguments);
		}

	});

});
