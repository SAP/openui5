/*global QUnit,sinon*/

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/demo/cart/controller/Checkout.controller",
	"sap/m/Button",
	"sap/m/MessagePopover"
], (Element, Checkout, Button, MessagePopover) => {
	"use strict";

	QUnit.module("CheckoutController", {
		beforeEach() {
			this.Checkout = new Checkout();
			this.oEvent = {
				getSource: () => new Button()
			};
			sinon.stub(this.Checkout, "byId").returns(undefined);
			sinon.stub(this.Checkout, "createId").callsFake((sId) => sId);
			sinon.stub(this.Checkout, "_addDependent").returns(true);
		},

		afterEach() {
			this.Checkout.destroy();
		}
	});

	QUnit.test("Should check if the destroy function of the message popover is called", function (assert) {
		const oStub = sinon.stub(MessagePopover.prototype, "destroy");
		const sMessagePopoverId = this.Checkout.createId("messagePopover");
		this.Checkout.onShowMessagePopoverPress(this.oEvent);
		const oMessagePopover = Element.getElementById(sMessagePopoverId);
		oMessagePopover.fireAfterClose();
		assert.strictEqual(oStub.callCount, 1, "The destroy function has been successfully called");
	});
});
