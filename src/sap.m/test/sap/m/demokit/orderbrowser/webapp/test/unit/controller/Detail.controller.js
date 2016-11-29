sap.ui.define([
		"sap/ui/demo/orderbrowser/controller/Detail.controller",
		"sap/ui/thirdparty/sinon"
	], function (Detail, Sinon) {
		"use strict";
		QUnit.module("DetailController" ,{
			beforeEach: function (){
				this.Detail = new Detail();
				this.oEvent = {
					getSource: function () {
						return {
							getText: function () {
								return "dummy"
							}
						};
					},
					getParameter: function () {
						return "dummy"
					}
				};
				this.Detail.getRouter = function () {
					return {
						navTo: function () {
							return "router";
						}
					};
				};
			},
			afterEach: function () {
				this.Detail.destroy();
			}
		});
		QUnit.test("should return telephone number in the _onHandleTelephonePress", function (assert) {
			this.Detail._onHandleTelephonePress(this.oEvent);
			var sSpy = Sinon.spy(sap.m.URLHelper.triggerTel);
			assert.strictEqual(sSpy.callCount, 0, "the telephone action has been triggered");
		});

});

