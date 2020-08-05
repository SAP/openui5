/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/prepareChangesMap",
	"sap/ui/fl/Change"
], function (
	prepareChangesMap,
	Change
) {
	"use strict";

	QUnit.module("prepareChangesMap: ", {
	}, function () {
		QUnit.test("when called with two change definitions", function (assert) {
			var aChangeDefinitions = [{fileName: "a"}, {fileName: "b"}];
			var mPropertyBag = {
				storageResponse: {
					changes: {
						changes: aChangeDefinitions
					}
				}
			};
			var mPreparedMap = prepareChangesMap(mPropertyBag);
			assert.equal(mPreparedMap.changes.length, 2, "an array with 2 objects is returned");
			assert.ok(mPreparedMap.changes[0] instanceof Change, "both objects are Change instances");
			assert.ok(mPreparedMap.changes[1] instanceof Change, "both objects are Change instances");
			assert.deepEqual(mPreparedMap.changes[0].getDefinition(), {fileName: "a"}, "the change was created with the correct definition");
			assert.deepEqual(mPreparedMap.changes[1].getDefinition(), {fileName: "b"}, "the change was created with the correct definition");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
