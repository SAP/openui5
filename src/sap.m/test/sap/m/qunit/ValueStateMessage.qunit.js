/*global QUnit */

sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	'sap/ui/Device',
	"sap/m/InputBase",
	"sap/m/delegate/ValueStateMessage",
	"sap/m/Select",
	"sap/ui/core/Control",
	"sap/ui/core/library",
	"sap/ui/core/Core"
], function(
	createAndAppendDiv,
	Device,
	InputBase,
	ValueStateMessage,
	Select,
	Control,
	coreLibrary,
	oCore
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);



	QUnit.module("getId");


	QUnit.test("it should return a empty value state message ID", function (assert) {

		// system under test
		var oInput = new InputBase();
		var oValueStateMessage = new ValueStateMessage();

		// assert
		assert.strictEqual(oValueStateMessage.getId(), "");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("it should return the value state message ID", function (assert) {

		// system under test
		var oSelect = new Select("ipsum");
		var oValueStateMessage = new ValueStateMessage(oSelect);

		// assert
		assert.strictEqual(oValueStateMessage.getId(), "ipsum-message");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should return the value state message ID", function (assert) {

		// system under test
		var CustomControl = Select.extend("CustomControl", {
			renderer: {
				apiVersion: 2
			}
		});

		CustomControl.prototype.getValueStateMessageId = function () {
			return this.getId() + "-lorem";
		};

		var oCustomSelect = new CustomControl("ipsum");

		// act
		var oValueStateMessage = new ValueStateMessage(oCustomSelect);

		// assert
		assert.strictEqual(oValueStateMessage.getId(), "ipsum-lorem");

		// cleanup
		oCustomSelect.destroy();
		CustomControl = null;
		delete window.CustomControl;
		delete window.CustomControlRenderer;
	});

	QUnit.module("getOpenDuration");

	QUnit.test("it should return the open duration of the value state message popup", function (assert) {

		// arrange
		var CustomControl = Control.extend("CustomControl", {
			renderer: {
				apiVersion: 2
			}
		});

		CustomControl.prototype.iOpenMessagePopupDuration = 5;

		var oCustomControl = new CustomControl();

		// system under test + act
		var oValueStateMessage = new ValueStateMessage(oCustomControl);

		// assert
		assert.strictEqual(oValueStateMessage.getOpenDuration(), 5);

		// cleanup
		oCustomControl.destroy();
		CustomControl = null;
		delete window.CustomControl;
		delete window.CustomControlRenderer;
	});

	QUnit.test("it should return the open duration of the value state message popup", function (assert) {

		// arrange
		var CustomControl = Control.extend("CustomControl", {
			renderer: {
				apiVersion: 2
			}
		});

		var oCustomControl = new CustomControl();

		// system under test + act
		var oValueStateMessage = new ValueStateMessage(oCustomControl);

		// assert
		assert.strictEqual(oValueStateMessage.getOpenDuration(), 0);

		// cleanup
		oCustomControl.destroy();
		CustomControl = null;
		delete window.CustomControl;
		delete window.CustomControlRenderer;
	});

	QUnit.test("it should return the open duration of the value state message popup", function (assert) {

		// system under test + act
		var oValueStateMessage = new ValueStateMessage(null);

		// assert
		assert.strictEqual(oValueStateMessage.getOpenDuration(), 0);

		// cleanup
		oValueStateMessage.destroy();
	});

	QUnit.module("destroy");

	QUnit.test("it should clean up the internal objects", function (assert) {

		// system under test
		var oInput = new InputBase();
		var oValueStateMessage = new ValueStateMessage(oInput);

		// arrange
		oInput.placeAt("content");
		oCore.applyChanges();
		oInput.focus();
		oValueStateMessage.open();
		oValueStateMessage.close();

		// act
		oValueStateMessage.destroy();

		// assert
		assert.strictEqual(oValueStateMessage._oPopup, null);
		assert.strictEqual(oValueStateMessage._oControl, null);

		// cleanup
		oInput.destroy();
	});

	QUnit.test("it should not throw exception when the parent is destroyed or without domRef", function (assert) {
		// system under test
		var oInput = new InputBase();
		var oValueStateMessage = new ValueStateMessage(oInput);

		// arrange
		oInput.placeAt("content");
		oCore.applyChanges();
		oInput.focus();
		oValueStateMessage._oControl = {
			getDomRef: function() {
				return null;
			}
		};

		this.stub(oValueStateMessage, "getPopup").returns(true);
		this.stub(oValueStateMessage, "createDom").returns(true);

		// act
		oValueStateMessage.open();

		// assert
		assert.ok(true, "No exception should be thrown");

		// cleanup
		oInput.destroy();
	});

	QUnit.module("createDom");

	QUnit.test("it should create the DOM for the value state message popup (test case 1)", function (assert) {

		// arrange
		var oInputBase = new InputBase({
			valueState: ValueState.Warning,
			valueStateText: "lorem ipsum"
		});

		// system under test + act
		var oValueStateMessage = new ValueStateMessage(oInputBase);

		// act
		var oDomRef = oValueStateMessage.createDom();

		// assert
		assert.strictEqual(oDomRef.className, "sapMValueStateMessage sapMValueStateMessageWarning");
		assert.strictEqual(oDomRef.getAttribute("role"), "presentation", "The value state only serves as a visual representation of the message.");

		// cleanup
		oInputBase.destroy();
	});

	QUnit.test("it should create the DOM for the value state message popup (test case 2)", function (assert) {

		// arrange
		var oInputBase = new InputBase({
			valueState: ValueState.Success,
			valueStateText: "lorem ipsum"
		});

		// system under test + act
		var oValueStateMessage = new ValueStateMessage(oInputBase);

		// act
		var oDomRef = oValueStateMessage.createDom();

		// assert
		assert.strictEqual(oDomRef.className, "sapUiInvisibleText");

		// cleanup
		oInputBase.destroy();
	});

	QUnit.test("it should not throw an exeption", function (assert) {

		// system under test + act
		var oValueStateMessage = new ValueStateMessage(null);

		// act
		var oDomRef = oValueStateMessage.createDom();

		// assert
		assert.strictEqual(oDomRef, null);

		// cleanup
		oValueStateMessage.destroy();
	});
});