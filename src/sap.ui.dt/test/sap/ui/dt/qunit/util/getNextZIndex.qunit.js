/* global QUnit*/

sap.ui.define([
	"sap/ui/dt/util/getNextZIndex",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Popup",
	"sap/ui/dt/Util",
	"sap/base/Log",
	"sap/ui/qunit/utils/waitForThemeApplied",
	"sap/ui/thirdparty/sinon-4"
],
function(
	getNextZIndex,
	BusyIndicator,
	Popup,
	Util,
	Log,
	waitForThemeApplied,
	sinon
){
	"use strict";

	QUnit.module("Basic functionality", function () {
		QUnit.test("check return value type (simple case)", function (assert) {
			assert.ok(Util.isInteger(getNextZIndex()), "the returned value is an integer");
		});
		QUnit.test("check that the following index is always greater than the previous", function (assert) {
			var aIndexes = [];
			for (var i = 0; i < 100; i++) {
				aIndexes.push(getNextZIndex());
			}

			assert.ok(
				aIndexes.every(function (iCurrent, iIndex, aSource) {
					return (
						iIndex === 0 // do not check the first element of the array
						|| iCurrent > aSource[iIndex - 1]
					);
				})
			);
		});
	});

	QUnit.module("When BusyIndicator is shown", {
		beforeEach: function () {
			Popup.getNextZIndex(); // To force sap.ui.core.Popup to generate new z-index for BusyIndicator
			BusyIndicator.show(0); // "0" is required to disable async behaviour
			this.oLogStub = sinon.stub(Log, "error");
			this.oLogStub.callThrough(); // Do not stub irrelevant errors in console
			this.oLogStubWithArgs = this.oLogStub
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.includes('sap.ui.dt.util.getNextZIndex');
					})
				)
				.returns();
		},
		afterEach: function () {
			BusyIndicator.hide();
			this.oLogStub.restore();
		}
	}, function () {
		QUnit.test("check return value type", function (assert) {
			assert.ok(Util.isInteger(getNextZIndex()), "the returned value is an integer");
		});
		QUnit.test("check that the following index is always greater or equal than the previous without", function (assert) {
			var aIndexes = [];
			for (var i = 0; i < 50; i++) {
				aIndexes.push(getNextZIndex());
			}

			assert.ok(
				aIndexes.every(function (iCurrent, iIndex, aSource) {
					return (
						iIndex === 0 // Do not check the first element of the array
						|| iCurrent >= aSource[iIndex - 1]
					);
				})
			);
		});
		QUnit.test("check that when we reach the equal sequence the index will never go up", function (assert) {
			var aIndexes = [];
			var bEqualSequence;
			for (var i = 0; i < 50; i++) {
				aIndexes.push(getNextZIndex());
			}

			assert.ok(
				aIndexes.every(function (iCurrent, iIndex, aSource) {
					return (
						iIndex === 0 // Do not check the first element of the array
						|| (
							// When we reach the sequence of two equal values, we turn on the mutex
							!bEqualSequence
							&& (
								iCurrent > aSource[iIndex - 1]
								|| (
									iCurrent === aSource[iIndex - 1]
									&& (bEqualSequence = true)
								)
							)
						)
						|| (
							// If we are in the equal sequence we must ensure the next value is always
							// equal the previous and never goes up.
							bEqualSequence
							&& iCurrent === aSource[iIndex - 1]
						)
					);
				})
			);
		});
		QUnit.test("check that the error message is shown for the collision indexes", function (assert) {
			var aIndexes = [];
			var iEqualSequenceStartIndex;
			for (var i = 0; i < 50; i++) {
				aIndexes.push(getNextZIndex());
			}

			aIndexes.some(function (iCurrent, iIndex, aSource) {
				return (
					iIndex !== 0 // Do not check the first element of the array
					// When we reach the sequence of two equal values, we keep the start index of the sequence
					&& iCurrent === aSource[iIndex - 1]
					&& (iEqualSequenceStartIndex = iIndex - 1)
				);
			});

			// Number of errors is less on 1 than the length of sequence because
			// we do not expect the error for the first member of the sequence
			var iExpectedNumberOfErrors = aIndexes.length - (iEqualSequenceStartIndex + 1);
			assert.strictEqual(iExpectedNumberOfErrors, this.oLogStubWithArgs.callCount);
		});
		QUnit.test("check that the following index is always less than BusyIndicator z-index", function (assert) {
			var aIndexes = [];
			for (var i = 0; i < 50; i++) {
				aIndexes.push(getNextZIndex());
			}

			assert.ok(
				aIndexes.every(function (iCurrent) {
					return iCurrent < BusyIndicator.oPopup._iZIndex;
				})
			);
		});
		QUnit.test("check that the following index is always less than BusyIndicator z-index incl. 2 reserved ones", function (assert) {
			var iBusyIndicatorZIndex = BusyIndicator.oPopup._iZIndex - 2;
			var aIndexes = [];
			for (var i = 0; i < 50; i++) {
				aIndexes.push(getNextZIndex());
			}

			assert.ok(
				aIndexes.every(function (iCurrent) {
					return iCurrent < iBusyIndicatorZIndex;
				})
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});

	return waitForThemeApplied();
});