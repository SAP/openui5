/*global QUnit,sinon*/

sap.ui.define([
	"sap/ui/demo/cart/controller/Checkout.controller"
], function (Checkout) {
	"use strict";

	QUnit.module("CheckoutController", {
		beforeEach: function () {
			this.Checkout = new Checkout();
			this.oEvent = {
				getSource: function () {
					return new sap.m.Button();
				}
			};
			sinon.stub(this.Checkout, "byId", function () {
				return undefined;
			});

			sinon.stub(this.Checkout, "createId", function (sId) {
				return sId;
			});

			sinon.stub(this.Checkout, "_addDependent", function () {
				return true;
			});
		},

		afterEach: function () {
			this.Checkout.destroy();
		}
	});

	QUnit.test("Should check if the destroy function of the message popover is called", function (assert) {
		var oStub = sinon.stub(sap.m.MessagePopover.prototype, "destroy");
		var sMessagePopoverId = this.Checkout.createId("messagePopover");
		this.Checkout.onShowMessagePopoverPress(this.oEvent);
		var oMessagPopover = sap.ui.getCore().byId(sMessagePopoverId);
		oMessagPopover.fireAfterClose();
		assert.strictEqual(oStub.callCount, 1, "The destroy function has been successfully called");
	});
});
