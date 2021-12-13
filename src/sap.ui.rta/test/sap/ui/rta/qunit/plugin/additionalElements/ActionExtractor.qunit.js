/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/ActionExtractor",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function(
	ActionExtractor,
	AdditionalElementsUtils,
	ElementDesignTimeMetadata,
	Log,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oDTMetadata = {};

	QUnit.module("Given DesignTime Metadata structures with valid and invalid actions...", {
		beforeEach: function() {
			this.fnLogErrorStub = sandbox.stub(Log, "error");
			sandbox.stub(ActionExtractor, "_getRevealActions").returns(Promise.resolve());
			sandbox.stub(ActionExtractor, "_getAddViaDelegateActions").returns(Promise.resolve());
			sandbox.stub(AdditionalElementsUtils, "getParents").returns({
				parentOverlay: {
					getDesignTimeMetadata: function() {
						return oDTMetadata;
					}
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getActions is called with DT Metadata containing valid actions", function(assert) {
			oDTMetadata = new ElementDesignTimeMetadata({
				data: {
					aggregations: {
						dummyAggregation: {
							actions: {
								add: {
									delegate: "addViaDelegateAction"
								},
								reveal: "revealAction"
							}
						}
					}
				}
			});

			ActionExtractor.getActions(true, {});
			assert.notOk(this.fnLogErrorStub.called, "then no error is raised on the log");
		});

		QUnit.test("when getActions is called with DT Metadata containing invalid actions", function(assert) {
			oDTMetadata = new ElementDesignTimeMetadata({
				data: {
					aggregations: {
						dummyAggregation: {
							actions: {
								add: {
									custom: "customAddAction"
								},
								addODataProperty: "addODataPropertyAction"
							}
						}
					}
				}
			});

			ActionExtractor.getActions(true, {});
			assert.equal(this.fnLogErrorStub.callCount, 2, "then one error is raised on the log for each outdated action");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
