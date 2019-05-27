/* global QUnit, sinon */
sap.ui.define(["sap/ui/performance/trace/initTraces"], function (initTraces) {
	"use strict";

	QUnit.module("FESR");

	QUnit.test("meta tag", function(assert) {
		var FESR = sap.ui.require("sap/ui/performance/trace/FESR");
		assert.ok(FESR, "FESR module has been loaded");
		assert.ok(FESR.getActive(), "FESR is active");
		assert.strictEqual(FESR.getBeaconURL(), "example.url",  "Beacon URL has not been set");
	});

	QUnit.test("Deactivate FEST using meta tag", function(assert) {
		var FESR = sap.ui.require("sap/ui/performance/trace/FESR");
		var setActiveStub = sinon.stub(FESR, "setActive");
		var fesrMetaTag = document.getElementsByTagName("meta")["sap-ui-fesr"];
		var sMetaBeforeMutation = fesrMetaTag.content;

		fesrMetaTag.content = "false";
		initTraces();
		assert.equal(setActiveStub.getCall(0).args[0], false, "FESR was set to inactive via meta tag");

		fesrMetaTag.content = "true";
		initTraces();
		assert.equal(setActiveStub.getCall(1).args[0], true, "FESR was set to active via meta tag");

		fesrMetaTag.content = "";
		initTraces();
		assert.equal(setActiveStub.getCall(2).args[0], false, "FESR was set to inactive via meta tag");

		fesrMetaTag.content = "example.url";
		initTraces();
		assert.equal(setActiveStub.getCall(3).args[0], true, "FESR was set to active via meta tag");

		fesrMetaTag.content = sMetaBeforeMutation;
		initTraces();

		setActiveStub.restore();
	});

});