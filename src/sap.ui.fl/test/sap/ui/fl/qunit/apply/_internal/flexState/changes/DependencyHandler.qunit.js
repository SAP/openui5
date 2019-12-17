/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/Change"
], function (
	DependencyHandler,
	Change
) {
	"use strict";

	var PENDING = "sap.ui.fl:PendingChange";

	QUnit.module("Given a Changes map with some dependencies", {
		beforeEach: function() {
			var oChange1 = new Change({fileName: "fileNameChange2"});
			var oChange2 = new Change({fileName: "fileNameChange4"});
			var oChange3 = new Change({fileName: "fileNameChange5"});

			this.mChanges = {
				mDependencies: {
					fileNameChange2: {
						changeObject: oChange1,
						dependencies: ["fileNameChange1"]
					},
					fileNameChange4: {
						changeObject: oChange2,
						dependencies: ["fileNameChange2"]
					},
					fileNameChange5: {
						changeObject: oChange3,
						dependencies: ["fileNameChange4"]
					}
				},
				mDependentChangesOnMe: {
					fileNameChange1: ["fileNameChange2"],
					fileNameChange2: ["fileNameChange4"],
					fileNameChange4: ["fileNameChange5"]
				},
				mControlsWithDependencies: {}
			};
		}
	}, function () {
		QUnit.test("when addChangeApplyCallbackToDependency is called with a function", function (assert) {
			assert.expect(2);
			var fnCallback = function() {
				assert.ok(true, "the function was called");
			};
			var mChangesMap = {
				mDependencies: {
					foo: {}
				}
			};
			var mExpectedChangesMap = {
				mDependencies: {
					foo: {}
				}
			};
			mExpectedChangesMap.mDependencies.foo[PENDING] = fnCallback;
			DependencyHandler.addChangeApplyCallbackToDependency(mChangesMap, "foo", fnCallback);
			mChangesMap.mDependencies.foo[PENDING]();
			assert.deepEqual(mChangesMap, mExpectedChangesMap, "the callback was added to the changes map");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
