// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/field/CustomFieldInfo",
	"sap/ui/mdc/field/FieldInfoBase",
	"sap/ui/core/Icon",
	"sap/ui/core/Core"
], function(
		CustomFieldInfo,
		FieldInfoBase,
		Icon,
		oCore
	) {
	"use strict";

	let oFieldInfoBase;
	let oField;
	let iDataUpdate = 0;

	const _myDataUpdateHandler = function(oEvent) {
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
			sinon.stub(oFieldInfoBase, "checkDirectNavigation").returns(Promise.resolve(false));
			oField.addDependent(oFieldInfoBase);
			oCore.applyChanges();
		},
		afterEach: function() {
			oFieldInfoBase.destroy();
			oFieldInfoBase = undefined;
			oField.destroy();
			oField = undefined;
			iDataUpdate = 0;
		}
	});

	const _checkException = function(assert, fnFunction, sName) {

		let oException;

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

		const oContent = new Icon("I2", {
			src: "sap-icon://sap-ui5"
		});
		sinon.stub(oFieldInfoBase, "getContent").returns(Promise.resolve(oContent));

		const fnDone = assert.async();
		oFieldInfoBase.createPopover().then(function(oPopover) {
			assert.ok(!!oPopover, "Popover created");
			assert.notOk(!oPopover || oPopover.isOpen(), "Popover not open");
			const aPopoverContent = oPopover ? oPopover.getContent() : null;
			assert.equal(aPopoverContent.length, 1, "Popover has content");
			assert.equal(aPopoverContent[0], oContent, "Popover content");
			oContent.destroy();
			oPopover.destroy();
			fnDone();
		});
	});

	QUnit.test("open", function(assert) {

		const oContent = new Icon("I2", {
			src: "sap-icon://sap-ui5"
		});
		sinon.stub(oFieldInfoBase, "getContent").returns(Promise.resolve(oContent));
		sinon.stub(oFieldInfoBase, "isTriggerable").returns(Promise.resolve(true));

		const oPromise = oFieldInfoBase.open();
		oCore.applyChanges();
		assert.ok(oPromise instanceof Promise, "open returns promise");

		const fnDone = assert.async();
		oPromise.then(function() {
			const oPopover = oFieldInfoBase.getDependents().find(function(oDependent) {
				return oDependent.isA("sap.m.ResponsivePopover");
			});
			assert.ok(!!oPopover);
			assert.ok(oPopover.isOpen(), "Popover open");
			assert.ok(oContent.getDomRef(), "content rendered");
			oPopover.attachAfterClose(function() {
				assert.ok(oPopover.bIsDestroyed, "Popover destroyed");
				oContent.destroy();
				fnDone();
			});
			oPopover.close(); // simulate autoclose
		});

	});

	QUnit.test("open without parent", function(assert) {

		oField.removeDependent(oFieldInfoBase);

		const oContent = new Icon("I2", {
			src: "sap-icon://sap-ui5"
		});
		sinon.stub(oFieldInfoBase, "getContent").returns(Promise.resolve(oContent));
		sinon.stub(oFieldInfoBase, "isTriggerable").returns(Promise.resolve(true));

		let bExceptionRaised = false;
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
			sinon.stub(oFieldInfoBase, "checkDirectNavigation").returns(Promise.resolve(false));
			oField.addDependent(oFieldInfoBase);
			oCore.applyChanges();
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

		const fnDone = assert.async();
		oFieldInfoBase.isTriggerable().then(function(bTriggerable) {
			assert.notOk(bTriggerable, "isTriggerable");
			fnDone();
		});
		const fnDone2 = assert.async();
		oFieldInfoBase.getTriggerHref().then(function(sHref) {
			assert.notOk(sHref, "getTriggerHref");
			fnDone2();
		});

		oCore.applyChanges();

		const fnDone3 = assert.async();
		oFieldInfoBase.open().then(function() {
			const oPopover = oFieldInfoBase.getDependents().find(function(oDependent) {
				return oDependent.isA("sap.m.ResponsivePopover");
			});
			assert.ok(!!oPopover);
			fnDone3();
		});

	});

	QUnit.test("with content", function(assert) {
		const oContent = new Icon("I2", {
			src: "sap-icon://sap-ui5"
		});
		oFieldInfoBase.setContent(oContent);

		assert.equal(iDataUpdate, 1, "dataUpdate fired");
		const fnDone = assert.async();
		oFieldInfoBase.isTriggerable().then(function(bTriggerable) {
			assert.ok(bTriggerable, "isTriggerable");
			fnDone();
		});
		const fnDone2 = assert.async();
		oFieldInfoBase.getTriggerHref().then(function(sHref) {
			assert.notOk(sHref, "getTriggerHref");
			fnDone2();
		});
		oCore.applyChanges();

		const fnDone3 = assert.async();
		oFieldInfoBase.open().then(function() {
			const oPopover = oFieldInfoBase.getDependents().find(function(oDependent) {
				return oDependent.isA("sap.m.ResponsivePopover");
			});
			assert.ok(!!oPopover);
			assert.ok(oPopover.isOpen(), "Popover open");
			assert.ok(oContent.getDomRef(), "content rendered");
			oContent.destroy();
			fnDone3();
		});

	});

});