/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	'sap/ui/Device',
	"sap/m/InputBase",
	"sap/m/library",
	"sap/m/Select",
	"sap/ui/core/Control",
	"sap/ui/core/library"
], function(
	qutils,
	createAndAppendDiv,
	Device,
	InputBase,
	mobileLibrary,
	Select,
	Control,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);



	QUnit.module("getId");


	QUnit.test("it should return a empty value state message ID", function (assert) {

		// system under test
		var oInput = new InputBase();
		var oValueStateMessage = new mobileLibrary.delegate.ValueState();

		// assert
		assert.strictEqual(oValueStateMessage.getId(), "");

		// cleanup
		oInput.destroy();
	});

	QUnit.test("it should return the value state message ID", function (assert) {

		// system under test
		var oSelect = new Select("ipsum");
		var oValueStateMessage = new mobileLibrary.delegate.ValueState(oSelect);

		// assert
		assert.strictEqual(oValueStateMessage.getId(), "ipsum-message");

		// cleanup
		oSelect.destroy();
	});

	QUnit.test("it should return the value state message ID", function (assert) {

		// system under test
		var CustomControl = Select.extend("CustomControl", {
			renderer: {}
		});

		CustomControl.prototype.getValueStateMessageId = function () {
			return this.getId() + "-lorem";
		};

		var oCustomSelect = new CustomControl("ipsum");

		// act
		var oValueStateMessage = new mobileLibrary.delegate.ValueState(oCustomSelect);

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
			renderer: {}
		});

		CustomControl.prototype.iOpenMessagePopupDuration = 5;

		var oCustomControl = new CustomControl();

		// system under test + act
		var oValueStateMessage = new mobileLibrary.delegate.ValueState(oCustomControl);

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
			renderer: {}
		});

		var oCustomControl = new CustomControl();

		// system under test + act
		var oValueStateMessage = new mobileLibrary.delegate.ValueState(oCustomControl);

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
		var oValueStateMessage = new mobileLibrary.delegate.ValueState(null);

		// assert
		assert.strictEqual(oValueStateMessage.getOpenDuration(), 0);

		// cleanup
		oValueStateMessage.destroy();
	});

	QUnit.module("destroy");

	QUnit.test("it should clean up the internal objects", function (assert) {

		// system under test
		var oInput = new InputBase();
		var oValueStateMessage = new mobileLibrary.delegate.ValueState(oInput);

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
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
		var oValueStateMessage = new mobileLibrary.delegate.ValueState(oInput);

		// arrange
		oInput.placeAt("content");
		sap.ui.getCore().applyChanges();
		oInput.focus();
		oValueStateMessage._oControl = {
			getDomRef: function() {
				return null;
			}
		};

		var oStubGetPopup = sinon.stub(oValueStateMessage, "getPopup" , function() {return true;});
		var oStubCreateDom = sinon.stub(oValueStateMessage, "createDom" , function() {return true;});

		// act
		oValueStateMessage.open();

		// assert
		assert.ok(true, "No exception should be thrown");

		// cleanup
		oStubGetPopup.restore();
		oStubCreateDom.restore();
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
		var oValueStateMessage = new mobileLibrary.delegate.ValueState(oInputBase);

		// act
		var oDomRef = oValueStateMessage.createDom();

		// assert
		assert.strictEqual(oDomRef.className, "sapMValueStateMessage sapMValueStateMessageWarning");
		assert.strictEqual(oDomRef.getAttribute("role"), "tooltip");
		assert.strictEqual(oDomRef.getAttribute("aria-live"), "off");
		assert.strictEqual(oDomRef.getAttribute("aria-hidden"), "true");
		assert.strictEqual(oDomRef.firstElementChild.getAttribute("aria-hidden"), Device.browser.msie ? "true" : null);

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
		var oValueStateMessage = new mobileLibrary.delegate.ValueState(oInputBase);

		// act
		var oDomRef = oValueStateMessage.createDom();

		// assert
		assert.strictEqual(oDomRef.className, "sapUiInvisibleText");

		// cleanup
		oInputBase.destroy();
	});

	QUnit.test("it should create the DOM for the value state and it should be smaller than the width of the control", function (assert) {

		// arrange
		var oInputBase = new InputBase({
			width: "30%",
			valueState: ValueState.Error,
			valueStateText: "Invalid SAP Fiori URL. Please enter the SAP Fiori configuration again. A list of correct configuration can be found at http://sap.com/configurations/."
		});

		oInputBase.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oInputBase.openValueStateMessage();
		this.clock.tick(100);

		// assert
		var oValueStateMessage = document.getElementById(oInputBase.getValueStateMessageId());
		assert.ok(oValueStateMessage.offsetWidth <= oInputBase.getDomRef().offsetWidth, "The ValueStateMessage has correct width.");

		// cleanup
		oInputBase.destroy();

	});

	QUnit.test("it should not throw an exeption", function (assert) {

		// system under test + act
		var oValueStateMessage = new mobileLibrary.delegate.ValueState(null);

		// act
		var oDomRef = oValueStateMessage.createDom();

		// assert
		assert.strictEqual(oDomRef, null);

		// cleanup
		oValueStateMessage.destroy();
	});
});