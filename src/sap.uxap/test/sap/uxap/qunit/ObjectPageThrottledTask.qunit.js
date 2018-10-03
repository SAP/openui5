/*global QUnit, sinon*/

sap.ui.define(["sap/uxap/ObjectPageLayout"],
function (ObjectPageLayout) {
	"use strict";

	var iLoadingDelay = 2500;

	QUnit.module("Rescheduling");

	QUnit.test("task arguments are preserved on rescheduling", function (assert) {
		this.clock = sinon.useFakeTimers();
		var oPage = new ObjectPageLayout(),
			oSpy = this.spy(oPage, "_updateScreenHeightSectionBasesAndSpacer");

		//schedule WITH lazy loading
		oPage._requestAdjustLayout(true);

		this.clock.tick(iLoadingDelay);

		assert.ok(oSpy.calledOnce, "The lazyloading request is preserved");
	});

});