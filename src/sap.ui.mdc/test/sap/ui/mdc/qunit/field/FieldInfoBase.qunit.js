// Use this test page to test the API and features of the FieldHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/field/CustomFieldInfo",
	"sap/ui/mdc/field/FieldInfoBase",
	"sap/ui/core/Icon"
], function(
		CustomFieldInfo,
		FieldInfoBase,
		Icon
	) {
	"use strict";

	var oFieldInfoBase;
	var oField;
	var iDataUpdate = 0;

	var _myDataUpdateHandler = function(oEvent) {
		iDataUpdate++;
	};

	/* first test it without the Field to prevent loading of popup etc. */
	/* use dummy control to simulate Field */

	QUnit.module("FieldInfoBase", {
		beforeEach: function() {
			oField = new Icon("I1", {
				src: "sap-icon://sap-ui5"
			});
			oField.placeAt("content");
			oFieldInfoBase = new FieldInfoBase("F1-I", {
				dataUpdate: _myDataUpdateHandler
			});
			oField.addDependent(oFieldInfoBase);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oFieldInfoBase.destroy();
			oFieldInfoBase = undefined;
			oField.destroy();
			oField = undefined;
			iDataUpdate = 0;
		}
	});

	var _checkException = function(assert, fnFunction, sName) {

		var oException;

		try {
			fnFunction.call(oFieldInfoBase);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, sName + " fires exception");

	};

	QUnit.test("unimplemented functions", function(assert) {

		_checkException(assert, oFieldInfoBase.isTriggerable, "isTriggerable");
		_checkException(assert, oFieldInfoBase.getContent, "getContent");
		_checkException(assert, oFieldInfoBase.getTriggerHref, "getTriggerHref");

	});

	QUnit.test("basic functions", function(assert) {

		assert.equal(oFieldInfoBase.getSourceControl(), oField, "getSourceControl");

		var oContent = new Icon("I2", {
			src: "sap-icon://sap-ui5"
		});
		sinon.stub(oFieldInfoBase, "getContent").returns(Promise.resolve(oContent));

		var fnDone = assert.async();
		oFieldInfoBase.createPopover().then(function(oPopover) {
			assert.ok(!!oPopover, "Popover created");
			assert.notOk(!oPopover || oPopover.isOpen(), "Popover not open");
			var aPopoverContent = oPopover ? oPopover.getContent() : null;
			assert.equal(aPopoverContent.length, 1, "Popover has content");
			assert.equal(aPopoverContent[0], oContent, "Popover content");
			oContent.destroy();
			oPopover.destroy();
			fnDone();
		});
	});

	QUnit.test("open", function(assert) {

		var oContent = new Icon("I2", {
			src: "sap-icon://sap-ui5"
		});
		sinon.stub(oFieldInfoBase, "getContent").returns(Promise.resolve(oContent));
		sinon.stub(oFieldInfoBase, "isTriggerable").returns(Promise.resolve(true));

		var oPromise = oFieldInfoBase.open();
		sap.ui.getCore().applyChanges();
		assert.ok(oPromise instanceof Promise, "open returns promise");

		var fnDone = assert.async();
		oPromise.then(function() {
			assert.ok(!!oFieldInfoBase._oPopover);
			assert.ok(oFieldInfoBase._oPopover.isOpen(), "Popover open");
			assert.ok(oContent.getDomRef(), "content rendered");
			oFieldInfoBase._oPopover.attachAfterClose(function() {
				assert.ok(oFieldInfoBase._oPopover.bIsDestroyed, "Popover destroyed");
				oContent.destroy();
				fnDone();
			});
			oFieldInfoBase._oPopover.close(); // simulate autoclose
		});

	});

	QUnit.test("open without parent", function(assert) {

		oField.removeDependent(oFieldInfoBase);

		var oContent = new Icon("I2", {
			src: "sap-icon://sap-ui5"
		});
		sinon.stub(oFieldInfoBase, "getContent").returns(Promise.resolve(oContent));
		sinon.stub(oFieldInfoBase, "isTriggerable").returns(Promise.resolve(true));

		var bExceptionRaised = false;
		try {
			oFieldInfoBase.open();
		} catch (e) {
			bExceptionRaised = true;
		}
		assert.ok(bExceptionRaised);

		oContent.destroy();
	});

	QUnit.module("CustomFieldInfo", {
		beforeEach: function() {
			oField = new Icon("I1", {
				src: "sap-icon://sap-ui5"
			});
			oField.placeAt("content");
			oFieldInfoBase = new CustomFieldInfo("F1-I", {
				dataUpdate: _myDataUpdateHandler
			});
			oField.addDependent(oFieldInfoBase);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			oFieldInfoBase.destroy();
			oFieldInfoBase = undefined;
			oField.destroy();
			oField = undefined;
			iDataUpdate = 0;
		}
	});

	QUnit.test("without content", function(assert) {

		var fnDone = assert.async();
		oFieldInfoBase.isTriggerable().then(function(bTriggerable) {
			assert.notOk(bTriggerable, "isTriggerable");
			fnDone();
		});
		var fnDone2 = assert.async();
		oFieldInfoBase.getTriggerHref().then(function(sHref) {
			assert.notOk(sHref, "getTriggerHref");
			fnDone2();
		});

		sap.ui.getCore().applyChanges();

		var fnDone3 = assert.async();
		oFieldInfoBase.open().then(function() {
			assert.ok(!!oFieldInfoBase._oPopover);
			fnDone3();
		});

	});

	QUnit.test("with content", function(assert) {
		var oContent = new Icon("I2", {
			src: "sap-icon://sap-ui5"
		});
		oFieldInfoBase.setContent(oContent);

		assert.equal(iDataUpdate, 1, "dataUpdate fired");
		var fnDone = assert.async();
		oFieldInfoBase.isTriggerable().then(function(bTriggerable) {
			assert.ok(bTriggerable, "isTriggerable");
			fnDone();
		});
		var fnDone2 = assert.async();
		oFieldInfoBase.getTriggerHref().then(function(sHref) {
			assert.notOk(sHref, "getTriggerHref");
			fnDone2();
		});
		sap.ui.getCore().applyChanges();

		var fnDone3 = assert.async();
		oFieldInfoBase.open().then(function() {
			assert.ok(!!oFieldInfoBase._oPopover);
			assert.ok(oFieldInfoBase._oPopover.isOpen(), "Popover open");
			assert.ok(oContent.getDomRef(), "content rendered");
			oContent.destroy();
			fnDone3();
		});

	});

});