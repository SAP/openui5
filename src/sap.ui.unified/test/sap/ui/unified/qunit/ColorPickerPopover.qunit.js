/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/unified/ColorPickerPopover",
	"sap/m/ResponsivePopover",
	"sap/m/Button"
], function(
	qutils,
	createAndAppendDiv,
	ColorPickerPopover,
	ResponsivePopover,
	Button
) {
	"use strict";

	QUnit.module("Control API");

	QUnit.test("exit", function (assert) {
		var oCPP = new ColorPickerPopover(),
			oSpyPopoverRemoveDelegate = this.spy(),
			oSpyPopoverDestroy = this.spy(),
			onAfterRenderingDelegate = {};

		oCPP._oPopover = {
			removeDelegate: oSpyPopoverRemoveDelegate,
			destroy: oSpyPopoverDestroy,
			_onAfterRenderingDelegate: onAfterRenderingDelegate,
			getDomRef: function () {
			}
		};

		// Act
		oCPP.destroy();

		// Assert
		assert.equal(oSpyPopoverDestroy.callCount, 1, "..should destroy internal popover");
		assert.equal(oSpyPopoverRemoveDelegate.callCount, 1, "..should call internal popover's removeDelegate");
		assert.deepEqual(oSpyPopoverRemoveDelegate.getCall(0).args, [onAfterRenderingDelegate],
			"..with the right delegate object");
		assert.notOk(oCPP._oPopover, "..should not keep reference to the popover");

	});

	QUnit.test("openBy", function (assert) {
		// Prepare
		var oOpener = new Button(),
			oCPP = new ColorPickerPopover(),
			oRPopover = new ResponsivePopover(),
			oStubEnsurePopover = this.stub(oCPP, "_ensurePopover", function () {
				return oRPopover;
			}),
			oSpyResponsivePopoverOpenBy = this.spy(sap.m.ResponsivePopover.prototype, "openBy");

		// Act
		oCPP.openBy(oOpener);

		// Assert
		assert.strictEqual(oSpyResponsivePopoverOpenBy.callCount, 1, "..should call ResponsivePopover.openBy");
		assert.deepEqual(oSpyResponsivePopoverOpenBy.getCall(0).args, [oOpener]);

		// Cleanup
		oOpener.destroy();
		oCPP.destroy();
		oStubEnsurePopover.restore();
		oSpyResponsivePopoverOpenBy.restore();
	});

	QUnit.test("getDomRef", function (assert) {
		// Prepare
		var oOpener = new Button(),
			oCPP = new ColorPickerPopover(),
			oRPopover = new ResponsivePopover(),
			oStubEnsurePopover = this.stub(oCPP, "_ensurePopover", function () {
				return oRPopover;
			}),
			oSpyResponsivePopoverGetDomRef = this.spy(sap.m.ResponsivePopover.prototype, "getDomRef");

		// Act
		oCPP.getDomRef();

		// Assert
		assert.equal(oSpyResponsivePopoverGetDomRef.callCount, 1, "..should call ResponsivePopover.getDomRef");
		assert.deepEqual(oSpyResponsivePopoverGetDomRef.getCall(0).args, []);

		// Cleanup
		oOpener.destroy();
		oCPP.destroy();
		oStubEnsurePopover.restore();
		oSpyResponsivePopoverGetDomRef.restore();
	});

	QUnit.test("close", function (assert) {
		// Prepare
		var oOpener = new Button(),
			oCPP = new ColorPickerPopover(),
			oRPopover = new ResponsivePopover(),
			oStubEnsurePopover = this.stub(oCPP, "_ensurePopover", function () {
				return oRPopover;
			}),
			oSpyResponsivePopoveClose = this.spy(sap.m.ResponsivePopover.prototype, "close");

		// Act
		oCPP.close();

		// Assert
		assert.equal(oSpyResponsivePopoveClose.callCount, 1, "..should call ResponsivePopover.close");
		assert.deepEqual(oSpyResponsivePopoveClose.getCall(0).args, []);

		// Cleanup
		oOpener.destroy();
		oCPP.destroy();
		oStubEnsurePopover.restore();
		oSpyResponsivePopoveClose.restore();
	});

	QUnit.test("change event", function (assert) {
		// Prepare
		var oCPP = new ColorPickerPopover(),
			oPopover = oCPP._ensurePopover(),
			oCP = oPopover.getContent()[0],
			oCPChangeEventParameters = {
				"r": 255,
				"g": 0,
				"b": 0,
				"h": 0,
				"s": 100,
				"v": 100,
				"l": 50,
				"alpha": 1,
				"hex": "#ff0000",
				"colorString": "rgb(255,0,0)",
				"id": "colorPickerPopover"
			};

		assert.expect(2); //this is needed to make sure the change event handler is called otherwise we won't know.

		oCPP.attachChange(function (oEvent) {
			assert.ok(true, "Change event is called when submit button is pressed");
			assert.equal(oEvent.getParameter("colorString"), "rgb(255,0,0)", "colorString parameter is correct");
		});

		oCP.fireChange(oCPChangeEventParameters); //this is the function we know will set the value in this._oLastChangeCPParams

		oPopover.getBeginButton().firePress();

		// Cleanup
		oCPP.destroy();
	});

	QUnit.test("liveChange event", function (assert) {
		// Prepare
		var oCPP = new ColorPickerPopover({
				displayMode: sap.ui.unified.ColorPickerDisplayMode.Large
			}),
			aTestCasesRed = [128, 192, 255, 0],
			iTestCasesLength = aTestCasesRed.length,
			iCase,
			oCP;

		// initialize the ColorPickerPopover and its internal ColorPicker without opening it
		oCPP._ensurePopover();
		oCP = oCPP._getColorPicker();
		oCP._createLayout();
		oCP.$CPBox = oCP.oCPBox.$();

		// set initial color of the ColorPicker
		oCP.oHexField.setValue('#000000');
		oCP._handleHexValueChange();

		assert.expect(iTestCasesLength * 2); // this is needed to make sure the change event handler is called otherwise we won't know.

		// attach liveChange handler
		oCPP.attachLiveChange(function (oEvent) {
			var sColorString = oEvent.getParameter("colorString");
			// assert
			assert.ok(true, "liveChange event is called");
			assert.equal(sColorString, "rgb(" + aTestCasesRed[iCase] + ",0,0)", "colorString parameter is correct: " + sColorString);
		});

		// act - simulate change of the RED color input value and call the field change handler
		for (iCase = 0; iCase < iTestCasesLength; iCase++) {
			oCP.oRedField.setValue(aTestCasesRed[iCase]);
			oCP._handleRedValueChange();
		}

		// Cleanup
		oCPP.destroy();
	});

	QUnit.test("_handleChange function", function (assert) {
		// Prepare
		var oCPP = new ColorPickerPopover(),
			oPopover = oCPP._ensurePopover(),
			oCP = oPopover.getContent()[0],
			// for the perpose of the test we need only one parameter in addition of the id
			oCPChangeEventParameters = {
				"colorString": "rgb(255,0,0)",
				"id": "colorPickerPopover-color_picker"
			},
			oEventParamsExpected = {
				"colorString": "rgb(255,0,0)"
			};

		oCP.fireChange(oCPChangeEventParameters); //this is the function we know will set the value in this._oLastChangeCPParams

		assert.deepEqual(oCPP._oLastChangeCPParams, oEventParamsExpected, "ColorPicker id param is removed in _handleChange function and the other parameters are copied");

		// Cleanup
		oCPP.destroy();
	});

	QUnit.module("ColorPickerPopover - Private API functions");

	QUnit.test("_ensurePopover", function (assert) {
		// Prepare
		var oCPP = new ColorPickerPopover(),
			oFakePopover = {destroy: jQuery.noop, getDomRef: jQuery.noop, removeDelegate: jQuery.noop},
			oStubCreatePopover = this.stub(oCPP, "_createPopover").returns(oFakePopover);

		oCPP._oPopover = null;

		// Act
		oCPP._ensurePopover();


		// Assert
		assert.deepEqual(oCPP._oPopover, oFakePopover, "..should assign an instance to private _oPopover like the " +
			"one returned from the _createPopover");

		// Act
		oCPP._ensurePopover();

		// Assert
		assert.deepEqual(oCPP._oPopover, oFakePopover, "..should reuse the existing instance");

		// Cleanup
		oCPP.destroy();
		oStubCreatePopover.restore();
	});

	QUnit.module("ColorPickerPopover - ARIA");

	QUnit.test("Popover has certain aria attributes", function (assert) {
		// Prepare
		var oCPP = new ColorPickerPopover(),
			oOpener = new Button();

		oOpener.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		oCPP.openBy(oOpener);

		// Assert
		assert.equal(oCPP._oPopover.$().attr("aria-modal"), "true", "aria-modal");
		assert.equal(oCPP._oPopover.$().attr("aria-label"), oCPP._oPopover.getTitle(), "aria-label");

		// Cleanup
		oCPP.destroy();
	});

});