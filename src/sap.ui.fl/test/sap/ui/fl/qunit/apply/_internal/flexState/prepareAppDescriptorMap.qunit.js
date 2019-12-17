/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/prepareAppDescriptorMap",
	"sap/ui/thirdparty/sinon-4"
], function (
	prepareAppDescriptorMap,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("prepareAppDescriptorMap: ", {
		beforeEach: function () {
			this.mPropertyBag = {
				storageResponse: {
					changes: {
						appDescriptorChanges: {}
					}
				}
			};
		},
		afterEach: function () {
			sandbox.restore();
		}

	}, function () {
		QUnit.test("when called with no parameters", function (assert) {
			var oExpectedMap = {appDescriptorChanges: []};
			assert.deepEqual(prepareAppDescriptorMap({storageResponse: {changes: {}}}), oExpectedMap, "the function returns an object with a map inside");
		});

		QUnit.test("when called with three non condesable changes", function (assert) {
			var aChanges = [
				{
					changeType: "appdescr_ui5_addLibraries",
					content: { libraries: "descriptor.mocha133"}
				}, {
					changeType: "appdescr_ui5_addLibraries",
					content: { libraries: "sap.m"}
				}, {
					changeType: "appdescr_ui5_addLibraries",
					content: { libraries: "sap.ushell"}
				}
			];
			this.mPropertyBag.storageResponse.changes.appDescriptorChanges = aChanges;
			var aResult = prepareAppDescriptorMap(this.mPropertyBag).appDescriptorChanges;
			assert.equal(aResult.length, 3, "the map contains three changes");
			assert.equal(aResult[0].getContent().libraries, "descriptor.mocha133", "the map contains first change");
			assert.equal(aResult[1].getContent().libraries, "sap.m", "the map contains second change");
			assert.equal(aResult[2].getContent().libraries, "sap.ushell", "the map contains third change");
		});

		//TODO: Enable once condensable change mergers are implemented
		QUnit.skip("when called with three condesable changes", function (assert) {
			var aChanges = [
				{
					changeType: "appdescr_app_setTitle",
					content: {}
				}, {
					changeType: "appdescr_app_setTitle",
					content: {}
				}, {
					changeType: "appdescr_app_setTitle",
					content: { text: "whatever"}
				}
			];
			this.mPropertyBag.storageResponse.changes.appDescriptorChanges = aChanges;
			var aResult = prepareAppDescriptorMap(this.mPropertyBag).appDescriptorChanges;
			assert.equal(aResult.length, 1, "the map contains one changes");
			assert.equal(aResult[0].getContent().text, "whatever", "the map contains last change");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
