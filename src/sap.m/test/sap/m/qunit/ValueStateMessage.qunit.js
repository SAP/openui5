sinon.config.useFakeTimers = true;
sap.ui.test.qunit.delayTestStart();

QUnit.module("getId");


QUnit.test("it should return a empty value state message ID", function(assert) {

	// system under test
	var oInput = new sap.m.InputBase();
	var oValueStateMessage = new sap.m.delegate.ValueState();

	// assert
	assert.strictEqual(oValueStateMessage.getId(), "");

	// cleanup
	oInput.destroy();
});

QUnit.test("it should return the value state message ID", function(assert) {

	// system under test
	var oSelect = new sap.m.Select("ipsum");
	var oValueStateMessage = new sap.m.delegate.ValueState(oSelect);

	// assert
	assert.strictEqual(oValueStateMessage.getId(), "ipsum-message");

	// cleanup
	oSelect.destroy();
});

QUnit.test("it should return the value state message ID", function(assert) {

	// system under test
	var CustomControl = sap.m.Select.extend("CustomControl", {
		renderer: {}
	});

	CustomControl.prototype.getValueStateMessageId = function() {
		return this.getId() + "-lorem";
	};

	var oCustomSelect = new CustomControl("ipsum");

	// act
	var oValueStateMessage = new sap.m.delegate.ValueState(oCustomSelect);

	// assert
	assert.strictEqual(oValueStateMessage.getId(), "ipsum-lorem");

	// cleanup
	oCustomSelect.destroy();
	CustomControl = null;
	delete window.CustomControl;
	delete window.CustomControlRenderer;
});

QUnit.module("getOpenDuration");

QUnit.test("it should return the open duration of the value state message popup", function(assert) {

	// arrange
	var CustomControl = sap.ui.core.Control.extend("CustomControl", {
		renderer: {}
	});

	CustomControl.prototype.iOpenMessagePopupDuration = 5;

	var oCustomControl = new CustomControl();

	// system under test + act
	var oValueStateMessage = new sap.m.delegate.ValueState(oCustomControl);

	// assert
	assert.strictEqual(oValueStateMessage.getOpenDuration(), 5);

	// cleanup
	oCustomControl.destroy();
	CustomControl = null;
	delete window.CustomControl;
	delete window.CustomControlRenderer;
});

QUnit.test("it should return the open duration of the value state message popup", function(assert) {

	// arrange
	var CustomControl = sap.ui.core.Control.extend("CustomControl", {
		renderer: {}
	});

	var oCustomControl = new CustomControl();

	// system under test + act
	var oValueStateMessage = new sap.m.delegate.ValueState(oCustomControl);

	// assert
	assert.strictEqual(oValueStateMessage.getOpenDuration(), 0);

	// cleanup
	oCustomControl.destroy();
	CustomControl = null;
	delete window.CustomControl;
	delete window.CustomControlRenderer;
});

QUnit.test("it should return the open duration of the value state message popup", function(assert) {

	// system under test + act
	var oValueStateMessage = new sap.m.delegate.ValueState(null);

	// assert
	assert.strictEqual(oValueStateMessage.getOpenDuration(), 0);

	// cleanup
	oValueStateMessage.destroy();
});

QUnit.module("destroy");

QUnit.test("it should clean up the internal objects", function(assert) {

	// system under test
	var oInput = new sap.m.InputBase();
	var oValueStateMessage = new sap.m.delegate.ValueState(oInput);

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

QUnit.module("createDom");

QUnit.test("it should create the DOM for the value state message popup (test case 1)", function(assert) {

	// arrange
	var oInputBase = new sap.m.InputBase({
		valueState: sap.ui.core.ValueState.Warning,
		valueStateText: "lorem ipsum"
	});

	// system under test + act
	var oValueStateMessage = new sap.m.delegate.ValueState(oInputBase);

	// act
	var oDomRef = oValueStateMessage.createDom();

	// assert
	assert.strictEqual(oDomRef.className, "sapMValueStateMessage sapMValueStateMessageWarning");
	assert.strictEqual(oDomRef.getAttribute("role"), "tooltip");
	assert.strictEqual(oDomRef.getAttribute("aria-live"), "assertive");
	assert.strictEqual(oDomRef.firstElementChild.className, "sapUiHidden");
	assert.strictEqual(oDomRef.firstElementChild.getAttribute("aria-hidden"), "true");
	assert.strictEqual(oDomRef.firstElementChild.textContent, sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("INPUTBASE_VALUE_STATE_" + oInputBase.getValueState().toUpperCase()));

	// cleanup
	oInputBase.destroy();
});

QUnit.test("it should create the DOM for the value state message popup (test case 2)", function(assert) {

	// arrange
	var oInputBase = new sap.m.InputBase({
		valueState: sap.ui.core.ValueState.Success,
		valueStateText: "lorem ipsum"
	});

	// system under test + act
	var oValueStateMessage = new sap.m.delegate.ValueState(oInputBase);

	// act
	var oDomRef = oValueStateMessage.createDom();

	// assert
	assert.strictEqual(oDomRef.className, "sapUiInvisibleText");

	// cleanup
	oInputBase.destroy();
});

QUnit.test("it should not throw an exeption", function(assert) {

	// system under test + act
	var oValueStateMessage = new sap.m.delegate.ValueState(null);

	// act
	var oDomRef = oValueStateMessage.createDom();

	// assert
	assert.strictEqual(oDomRef, null);

	// cleanup
	oValueStateMessage.destroy();
});