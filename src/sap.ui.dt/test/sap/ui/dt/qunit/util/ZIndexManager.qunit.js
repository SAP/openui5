/* global QUnit*/

sap.ui.define([
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Popup",
	"sap/ui/dt/Util",
	"sap/m/Dialog",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
],
function(
	ZIndexManager,
	BusyIndicator,
	Popup,
	Util,
	Dialog,
	Log,
	sinon
) {
	"use strict";
	var sAdaptableDialogId = "adaptableDialog";
	var sandbox = sinon.sandbox.create();
	var fnFilter = function(oPopupElement) {
		if (oPopupElement.getId() === sAdaptableDialogId) {
			return true;
		}
	};

	QUnit.module("Given no open popups", function () {
		QUnit.test("when getNextZIndex() is called to check basic functionality", function (assert) {
			assert.ok(Util.isInteger(ZIndexManager.getNextZIndex()), "then returned value is an integer");
		});
		QUnit.test("when getNextZIndex() is called multiple times without open popups", function (assert) {
			var aIndexes = [];
			for (var i = 0; i < 100; i++) {
				aIndexes.push(ZIndexManager.getNextZIndex());
			}

			assert.ok(
				aIndexes.every(function (iCurrent, iIndex, aSource) {
					return (
						iIndex === 0 // do not check the first element of the array
						|| iCurrent > aSource[iIndex - 1]
					);
				}),
				"then returned value is greater than previous value"
			);
		});
	});

	QUnit.module("Given a non-adaptable popup is open", {
		beforeEach: function () {
			Popup.getNextZIndex(); // To force sap.ui.core.Popup to generate new z-index for BusyIndicator
			BusyIndicator.show(0); // "0" is required to disable async behaviour
			var oLogStub = sandbox.stub(Log, "error");
			oLogStub.callThrough(); // Do not stub irrelevant errors in console
			this.oLogStubWithArgs = oLogStub
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.includes('sap.ui.dt.util.ZIndexManager');
					})
				)
				.returns();
			this.iBusyIndicatorZIndex = BusyIndicator.oPopup._iZIndex;
		},
		afterEach: function () {
			sandbox.restore();
			BusyIndicator.hide();
		}
	}, function () {
		QUnit.test("when getNextZIndex() is called to check return value type", function (assert) {
			assert.ok(Util.isInteger(ZIndexManager.getNextZIndex()), "the returned value is an integer");
		});
		QUnit.test("when getNextZIndex() is called to get the next 50 z-index values", function (assert) {
			var aIndexes = [];
			var iEqualSequenceStartIndex;
			for (var i = 0; i < 50; i++) {
				aIndexes.push(ZIndexManager.getNextZIndex());
			}

			assert.ok(
				aIndexes.every(function (iCurrent, iIndex, aSource) {
					return (
						iIndex === 0 // Do not check the first element of the array
						|| (
							iCurrent > aSource[iIndex - 1]
							&& iCurrent < this.iBusyIndicatorZIndex
						)
						|| (
							// If we are in the equal sequence we must ensure the next value is always
							// equal the previous and never goes up.
							iCurrent === aSource[iIndex - 1]
							&& iCurrent < this.iBusyIndicatorZIndex
							&& (iEqualSequenceStartIndex = !Util.isInteger(iEqualSequenceStartIndex) ? iIndex - 1 : iEqualSequenceStartIndex)
						)
					);
				}.bind(this)),
				"then the z-index value is greater than or equal to the non-adaptable popup minus the reserved indices"
			);

			// Number of errors is less on 1 than the length of sequence because
			// we do not expect the error for the first member of the sequence
			var iExpectedNumberOfErrors = aIndexes.length - (iEqualSequenceStartIndex + 1);
			assert.strictEqual(iExpectedNumberOfErrors, this.oLogStubWithArgs.callCount, "then the expected error messages were logged");
		});
	});
	QUnit.module("Given an adaptable popup is open", {
		beforeEach: function (assert) {
			var done = assert.async();
			sandbox.stub(Log, "error")
				.callThrough()
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.includes('sap.ui.dt.util.ZIndexManager');
					})
				)
				.returns();
			ZIndexManager.addPopupFilter(fnFilter);

			this.oDialog = new Dialog(sAdaptableDialogId);

			this.oDialog.attachAfterOpen(function() {
				this.iDialogZIndex = this.oDialog.oPopup._iZIndex;
				done();
			}.bind(this));

			this.oDialog.open();
		},
		afterEach: function () {
			this.oDialog.destroy();
			sandbox.restore();
			ZIndexManager.removePopupFilter(fnFilter);
		}
	}, function () {
		QUnit.test("when getNextZIndex() is called to check return value type", function (assert) {
			assert.ok(Util.isInteger(ZIndexManager.getNextZIndex()), "then returned value is an integer");
		});
		QUnit.test("when getNextZIndex() is called to get the next 10 z-index values", function (assert) {
			var aIndexes = [];
			for (var i = 0; i < 10; i++) {
				aIndexes.push(ZIndexManager.getNextZIndex());
			}

			assert.ok(
				aIndexes.every(function (iCurrent, iIndex, aSource) {
					return (
						iIndex === 0 // Do not check the first element of the array
						|| (
							iCurrent > aSource[iIndex - 1]
							&& iCurrent > this.iDialogZIndex
							&& iCurrent % 10 === 0 // sap.ui.core.Popup.getNextZIndex() increments value by 10
						)
					);
				}.bind(this)),
				"then the z-index value is greater than the adaptable popup"
			);

			assert.strictEqual(Log.error.callCount, 0, "then no error messages were logged");
		});
	});

	QUnit.module("Given an adaptable popup with greater z-index than a non-adaptable popup", {
		beforeEach: function (assert) {
			var done = assert.async();
			ZIndexManager.addPopupFilter(fnFilter);
			Popup.getNextZIndex(); // To force sap.ui.core.Popup to generate new z-index for BusyIndicator
			BusyIndicator.show(0); // "0" is required to disable async behaviour

			this.oDialog = new Dialog(sAdaptableDialogId);

			this.oDialog.attachAfterOpen(function() {
				this.iDialogZIndex = this.oDialog.oPopup._iZIndex;
				done();
			}.bind(this));

			this.oDialog.open();
		},
		afterEach: function () {
			this.oDialog.destroy();
			BusyIndicator.hide();
			ZIndexManager.removePopupFilter(fnFilter);
		}
	}, function () {
		QUnit.test("when getZIndexBelowPopups() is called", function (assert) {
			var iLowerZIndex = ZIndexManager.getZIndexBelowPopups();
			assert.ok(iLowerZIndex < this.iDialogZIndex, "then the returned z-index was less than the adaptable popup z-index");
			assert.ok(iLowerZIndex < BusyIndicator.oPopup._iZIndex, "then the returned z-index was lower than the non-adaptable popup z-index");
		});
		QUnit.test("when getNextZIndex() is called", function (assert) {
			var iNextZIndex = ZIndexManager.getNextZIndex();
			assert.ok(BusyIndicator.oPopup._iZIndex < this.iDialogZIndex, "then the z-index of the non-adaptable popup was less than the adaptable popup");
			assert.ok(iNextZIndex > this.iDialogZIndex, "then the returned z-index was higher than the adaptable popup z-index");
		});
	});

	QUnit.module("Given a non-adaptable popup with greater z-index than an adaptable popup", {
		beforeEach: function (assert) {
			var done = assert.async();
			ZIndexManager.addPopupFilter(fnFilter);
			this.oDialog = new Dialog(sAdaptableDialogId);

			this.oDialog.attachAfterOpen(function() {
				this.iDialogZIndex = this.oDialog.oPopup._iZIndex;
				BusyIndicator.show(0); // "0" is required to disable async behaviour
				done();
			}.bind(this));

			this.oDialog.open();
		},
		afterEach: function () {
			this.oDialog.destroy();
			BusyIndicator.hide();
			ZIndexManager.removePopupFilter(fnFilter);
		}
	}, function () {
		QUnit.test("when getZIndexBelowPopups() is called", function (assert) {
			var iLowerZIndex = ZIndexManager.getZIndexBelowPopups();
			assert.ok(iLowerZIndex < this.iDialogZIndex, "then the returned z-index was less than the adaptable popup z-index");
			assert.ok(iLowerZIndex < BusyIndicator.oPopup._iZIndex, "then the returned z-index was lower than the non-adaptable popup z-index");
		});
		QUnit.test("when getNextZIndex() is called", function (assert) {
			var iNextZIndex = ZIndexManager.getNextZIndex();
			assert.ok(BusyIndicator.oPopup._iZIndex > this.iDialogZIndex, "then the z-index of the adaptable popup was less than the non-adaptable popup");
			assert.ok(iNextZIndex > this.iDialogZIndex, "then the returned z-index was higher than the adaptable popup z-index");
			assert.ok(iNextZIndex < BusyIndicator.oPopup._iZIndex, "then the returned z-index was lower than the non-adaptable popup");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});