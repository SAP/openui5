/*global QUnit*/

sap.ui.define([
	"sap/ui/demo/orderbrowser/controller/Detail.controller",
	"sap/m/library"
], function(Detail, mobileLibrary) {
	"use strict";

	QUnit.module("DetailController" ,{
		beforeEach: function (){
			this.Detail = new Detail();
			this.oEvent = {
				getSource: function () {
					return {
						getText: this.stub().returns("12345")
					};
				}
			};
		},
		afterEach: function () {
			this.Detail.destroy();
		}
	});

	QUnit.test("Should trigger the telephone helper in the _onHandleTelephonePress event", function (assert) {
		var oStub = this.stub(mobileLibrary.URLHelper, "triggerTel");

		this.Detail._onHandleTelephonePress(this.oEvent);

		assert.ok(oStub.calledWith("12345"), "The function \"sap.m.URLHelper.triggerTel\" was called with the telephone number");
		assert.strictEqual(oStub.callCount, 1, "the telephone action has been triggered once");
	});
});