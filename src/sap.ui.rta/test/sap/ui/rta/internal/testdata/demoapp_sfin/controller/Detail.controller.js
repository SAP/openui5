/*global location*/
sap.ui.define([
	"sap/ui/rta/test/Demo/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.rta.test.Demo.controller.Detail", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			this.oAPARAccount = {
					customerProperty: "Customer",
					supplierProperty: "Supplier",
					semanticObject: "Customer",
					customerAccountInputFieldID: "fin.ar.payment.post.customerAccountInput",
					supplierAccountInputFieldID: "fin.ar.payment.post.supplierAccountInput",
					companyCodeForAccountInputFieldID: "fin.ar.payment.post.companyCode4customerAccountInput",
					noteToPayeeFieldID: "fin.ar.payment.post.noteToPayee"
				};

			this.byId("fin.ar.payment.post.header").bindElement("/FinsPostingPaymentHeaders(TmpId='4HNF052050',TmpIdType='T')");

			if (sap.ui.Device.system.desktop === true) { // apply compact mode for desktop
				this.getView().addStyleClass("sapUiSizeCompact");
				var that = this;
				this.getView().setModel(this.getOwnerComponent().getModel());
				this.getView().getModel().metadataLoaded().then(function() {
					var oContext = that.getView().getModel().createEntry("/APAROpenItems");
					that.byId(that.oAPARAccount.customerAccountInputFieldID).setBindingContext(oContext);
					that.byId(that.oAPARAccount.customerAccountInputFieldID).bindProperty("value", that.oAPARAccount.customerProperty);

					that.byId(that.oAPARAccount.supplierAccountInputFieldID).setBindingContext(oContext);
					that.byId(that.oAPARAccount.supplierAccountInputFieldID).bindProperty("value", that.oAPARAccount.supplierProperty);

					that.byId(that.oAPARAccount.companyCodeForAccountInputFieldID).setBindingContext(oContext);
					that.byId(that.oAPARAccount.companyCodeForAccountInputFieldID).bindProperty("value", "CompanyCode");

				});
			}
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		switchToAdaptionMode : function() {
			var that = this;
			sap.ui.require(["sap/ui/rta/RuntimeAuthoring"], function(RTA) {
				var oRta = new RTA({
					rootControl : that.getOwnerComponent().getAggregation("rootControl"),
					flexSettings: {
						developerMode: false
					}
				});
				oRta.attachEvent('stop', function() {
					oRta.destroy();
				});
				oRta.start();
			});
		}
	});

});