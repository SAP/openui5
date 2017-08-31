/*global QUnit,sinon*/

(function (jQuery, QUnit, sinon) {
	"use strict";

	sinon.config.useFakeTimers = true;
	var iLoadingDelay = 2500;


	QUnit.module("Rescheduling");

	QUnit.test("task arguments are preserved on rescheduling", function (assert) {

		var oPage = new sap.uxap.ObjectPageLayout(),
		oSpy = this.spy(oPage, "_executeAdjustLayout"),
		bExpectedNeedsLazyLoading;

		//schedule WITH lazy loading
		oPage._requestAdjustLayout(null, false /* no immediate */, true /* needs lazy loading*/);
		bExpectedNeedsLazyLoading = true;

		//RE-schedule WITHOUT lazy loading
		oPage._requestAdjustLayout(null, false /* no immediate */, false /* needs lazy loading*/);

		this.clock.tick(iLoadingDelay);

		assert.ok(oSpy.calledWith({needLazyLoading: bExpectedNeedsLazyLoading}), "The lazyloading request is preserved");
	});

}(jQuery, QUnit, sinon));