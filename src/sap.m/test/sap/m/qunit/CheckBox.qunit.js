/*global QUnit */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/Messaging",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/CheckBox",
	"sap/ui/core/library",
	"sap/m/Label",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/base/Log"
], function(
	Library,
	Messaging,
	QUtils,
	createAndAppendDiv,
	nextUIUpdate,
	CheckBox,
	coreLibrary,
	Label,
	Device,
	KeyCodes,
	JSONModel,
	Message,
	MessageType,
	Log
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	createAndAppendDiv("content");



	QUnit.module("Properties");

	/* --------------------------------------- */
	/* Test: Default Values                    */
	/* --------------------------------------- */

	QUnit.test("Default Values", async function(assert) {

		var bEnabled = true;
		var bEditable = true;
		var bVisible = true;
		var bSelected = false;
		var bRequired = false;
		var sName = "";
		var sText = "";
		var sTextDirection = TextDirection.Inherit;
		var sWidth = "";
		var bUseEntireWidth = false;

		// system under test
		var oCheckBox = new CheckBox();

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oCheckBox.getEnabled(), bEnabled, "Property 'enabled': Default value should be '" + bEnabled + "'");
		assert.strictEqual(oCheckBox.getEditable(), bEditable, "Property 'editable': Default value should be '" + bEditable + "'");
		assert.strictEqual(oCheckBox.getVisible(), bVisible, "Property 'visible': Default value should be '" + bVisible + "'");
		assert.strictEqual(oCheckBox.getSelected(), bSelected, "Property 'selected': Default value should be '" + bSelected + "'");
		assert.strictEqual(oCheckBox.getRequired(), bRequired, "Property 'required': Default value should be '" + bRequired + "'");
		assert.strictEqual(oCheckBox.getName(), sName, "Property 'name': Default value should be '" + sName + "'");
		assert.strictEqual(oCheckBox.getText(), sText, "Property 'text': Default value should be '" + sText + "'");
		assert.strictEqual(oCheckBox.getTextDirection(), sTextDirection, "Property 'textDirection': Default value should be '" + sTextDirection + "'");
		assert.strictEqual(oCheckBox.getWidth(), sWidth, "Property 'width': Default value should be '" + sWidth + "'");
		assert.strictEqual(oCheckBox.getUseEntireWidth(), bUseEntireWidth, "Property 'useEntireWidth': Default value should be '" + bUseEntireWidth + "'");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------- */
	/* Test: 'visible=true'                            */
	/* ----------------------------------------------- */

	QUnit.test("'visible=true'", async function(assert) {

		// system under test
		var oCheckBox = new CheckBox({ visible: true });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oCheckBox.getDomRef(), "visible=true: CheckBox should have been rendered");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------- */
	/* Test: 'visible=false'                           */
	/* ----------------------------------------------- */

	QUnit.test("'visible=false'", async function(assert) {

		// system under test
		var oCheckBox = new CheckBox({ visible: false });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(!oCheckBox.getDomRef(), "visible=false: CheckBox should not have been rendered");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------- */
	/* Test: 'enabled=true'                            */
	/* ----------------------------------------------- */

	QUnit.test("'enabled=true'", async function(assert) {

		// system under test
		var bEnabled = true;
		var oCheckBox = new CheckBox({ enabled: bEnabled });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(!oCheckBox.$("CbBg").hasClass("sapMCbBgDis"), "enabled=" + bEnabled + ": CheckBox should not have class sapMCbBgDis");
		assert.strictEqual(oCheckBox.$("CB").attr("disabled"), undefined, "enabled=" + bEnabled + ": CheckBox should not have attribute 'disabled'");
		var iTabindex = oCheckBox.getTabIndex();
		assert.strictEqual(oCheckBox.$().attr("tabindex"), iTabindex.toString(), "enabled=" + bEnabled + ": CheckBox should have attribute 'tabindex=" + iTabindex + "'");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------- */
	/* Test: 'enabled=false'                           */
	/* ----------------------------------------------- */

	QUnit.test("'enabled=false'", async function(assert) {

		// system under test
		var bEnabled = false;
		var oCheckBox = new CheckBox({ enabled: bEnabled });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(!oCheckBox.$().hasClass("sapMPointer"), "enabled=" + bEnabled + ": CheckBox should not have class sapMPointer");
		assert.ok(oCheckBox.$().hasClass("sapMCbBgDis"), "enabled=" + bEnabled + ": CheckBox should have class sapMCbBgDis");
		assert.strictEqual(oCheckBox.$("CB").attr("disabled"), "disabled", "enabled=" + bEnabled + ": CheckBox should have attribute 'disabled=disabled'");
		assert.strictEqual(oCheckBox.$().attr("aria-disabled"), "true", "Property 'aria-disabled' should be 'true'");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'editable=false'                          */
	/* ----------------------------------------------- */

	QUnit.test("'editable=false'", async function(assert) {

		// system under test
		var bEditable = false;
		var oCheckBox = new CheckBox({ editable: bEditable });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oCheckBox.getTabIndex(), 0, "'getTabindex' should return 0");
		assert.equal(oCheckBox.$().hasClass("sapMCbRo"), true, ": The CheckBox should have class sapMCbRo");
		assert.strictEqual(oCheckBox.$("CB").attr("readonly"), "readonly", "The Checkbox should have attribute 'readonly=readonly'");
		assert.strictEqual(oCheckBox.$().attr("aria-readonly"), "true", "Property 'aria-readonly' should be 'true'");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'displayOnly=true'                        */
	/* ----------------------------------------------- */
	QUnit.test("'displayOnly=true'", async function(assert) {

		// system under test
		var bDisplayOnly = true;
		var oCheckBox = new CheckBox({ displayOnly: bDisplayOnly });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oCheckBox.getTabIndex(), -1, "'getTabindex' should return -1");
		assert.equal(oCheckBox.$().hasClass("sapMCbDisplayOnly"), true, ": The CheckBox should have class sapMCbDisplayOnly");
		assert.strictEqual(oCheckBox.$().attr("aria-readonly"), "true", "Property 'aria-readonly' should be 'true'");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'displayOnly=true&enabled=false'          */
	/* ----------------------------------------------- */
	QUnit.test("'displayOnly=true'", async function(assert) {

		// system under test
		var bDisplayOnly = true;
		var bEnabled = false;
		var oCheckBox = new CheckBox({ displayOnly: bDisplayOnly, enabled: bEnabled });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.equal(oCheckBox.$().hasClass("sapMCbDisplayOnly"), false, ": The CheckBox should not have class sapMCbDisplayOnly");
		assert.strictEqual(oCheckBox.$().attr("aria-readonly"), undefined, "Property 'aria-readonly' is not set");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------- */
	/* Test: 'selected=true'                           */
	/* ----------------------------------------------- */

	QUnit.test("'selected=true'", async function(assert) {

		// system under test
		var oCheckBox = new CheckBox({ selected: true });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oCheckBox.$("CbBg").hasClass("sapMCbMarkChecked"), "selected=true: CheckBox should have class sapMCbMarkChecked");
		assert.ok(oCheckBox.$("CB").is(":checked"), "selected=false: CheckBox should have attribute 'checked'");
		assert.strictEqual(oCheckBox.$().attr("aria-checked"), "true", "Property 'aria-checked': Default value should be 'true'");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------- */
	/* Test: 'selected=false'						   */
	/* ----------------------------------------------- */

	QUnit.test("'selected=false'", async function(assert) {

		// system under test
		var oCheckBox = new CheckBox({ selected: false });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(!oCheckBox.$("CbBg").hasClass("sapMCbMarkChecked"), "selected=false: CheckBox should not have class sapMCbMarkChecked");
		assert.ok(!oCheckBox.$("CB").is(":checked"), "selected=false: CheckBox should not have attribute 'checked'");
		assert.strictEqual(oCheckBox.$().attr("aria-checked"), "false", "Property 'aria-checked': Default value should be 'false'");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'selected=false'						   */
	/* ----------------------------------------------- */

	QUnit.test("'selected=null'", async function(assert) {

		// system under test
		var oCheckBox = new CheckBox({ selected: false });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		//act
		oCheckBox.setSelected(null);

		// assert
		assert.ok(!oCheckBox.$("CbBg").hasClass("sapMCbMarkChecked"), "selected=null: CheckBox should not have class sapMCbMarkChecked");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'partiallySelected'				   */
	/* ----------------------------------------------- */

	QUnit.test("partiallySelected=true", async function(assert) {

		// system under test
		var oCheckBox = new CheckBox({ partiallySelected: true });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oCheckBox.$("CbBg").hasClass("sapMCbMarkPartiallyChecked"), "Should have sapMCbMarkPartiallyChecked class");
		assert.equal(oCheckBox.getPartiallySelected(), true, "Should have partiallySelected property = true");

		//act
		oCheckBox.setPartiallySelected(false);
		await nextUIUpdate();
		assert.notOk(oCheckBox.$("CbBg").hasClass("sapMCbMarkPartiallyChecked"), "Should not have sapMCbMarkPartiallyChecked class");
		assert.equal(oCheckBox.getPartiallySelected(), false, "Should have partiallySelected property = false");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'required'				   				   */
	/* ----------------------------------------------- */

	QUnit.test("'required' true/false", async function (assert) {

		// system under test
		var oCheckBox = new CheckBox({ required: true, text: "Label" }),
			oCheckBoxLabel = oCheckBox._getLabel();

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oCheckBox.getRequired(), true, "Required property is set correctly");
		assert.strictEqual(oCheckBoxLabel.getRequired(), true, "Required property is set correctly");

		assert.strictEqual(oCheckBox.$().attr("aria-required"), "true", "Property 'aria-required' should be 'true'");
		assert.ok(oCheckBoxLabel.$().hasClass("sapMLabelRequired"), "Label should have class 'sapMLabelRequired'");

		oCheckBox.setRequired(false);
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oCheckBox.getRequired(), false, "Required property is set correctly");
		assert.strictEqual(oCheckBoxLabel.getRequired(), false, "Required property is set correctly");

		assert.strictEqual(oCheckBox.$().attr("aria-required"), undefined, "Property 'aria-required' should be undefined");
		assert.ok(!oCheckBoxLabel.$().hasClass("sapMLabelRequired"), "Label should not have class 'sapMLabelRequired'");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: wrapping property                         */
	/* ----------------------------------------------- */

	QUnit.test("wrapping property", async function(assert) {

		// system under test
		var oCheckBox = new CheckBox({ wrapping: true });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oCheckBox._getLabel().getWrapping(), "wrapping=true: CheckBox's label wrapping should be set");
		assert.ok(oCheckBox.$().hasClass("sapMCbWrapped"), "wrapping=true: CheckBox should have class sapMCbWrapped");

		//act
		oCheckBox.setWrapping(false);
		await nextUIUpdate();

		// assertions
		assert.ok(!oCheckBox._getLabel().getWrapping(), "wrapping=false: CheckBox's label wrapping should not be set");
		assert.ok(!oCheckBox.$().hasClass("sapMCbWrapped"), "wrapping=false: CheckBox should not have class sapMCbWrapped");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'useEntireWidth functionality'            */
	/* ----------------------------------------------- */

	QUnit.test("useEntireWidth functionality", async function(assert) {

		// system under test
		var CHECKBOX_WIDTH = 50,
			oCheckBox = new CheckBox({
				text: "Label",
				useEntireWidth: true
			}),
			oLabel = oCheckBox._getLabel();

		// arrange
		oCheckBox.placeAt("content");
		oCheckBox.setWidth("50px");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oCheckBox.$().outerWidth(), CHECKBOX_WIDTH, "CheckBox main div should have width of '50px'");
		assert.strictEqual(oLabel.$().prop("style")["width"], "", "CheckBox label should not have width set");

		// act
		oCheckBox.setUseEntireWidth(false);
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oCheckBox.$().prop("style")["width"], "", "CheckBox main div should not have width set");
		assert.strictEqual(oLabel.$().width(), CHECKBOX_WIDTH, "CheckBox label should have width of '50px'");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'ValueState=Error'						   */
	/* ----------------------------------------------- */

	QUnit.test("'ValueState=Error'", async function(assert) {
		// system under test
		var oCheckBox = new CheckBox({ valueState: ValueState.Error });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oCheckBox.$().hasClass("sapMCbErr"), "The CheckBox has value state error css class.");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------- */
	/* Test: 'ValueState=Warning'						   */
	/* ----------------------------------------------- */

	QUnit.test("'ValueState=Warning'", async function(assert) {
		// system under test
		var oCheckBox = new CheckBox({ valueState: ValueState.Warning });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oCheckBox.$().hasClass("sapMCbWarn"), "The CheckBox has value state warning css class.");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'ValueState=Success'						   */
	/* ----------------------------------------------- */

	QUnit.test("'ValueState=Success'", async function(assert) {
		// system under test
		var oCheckBox = new CheckBox({ valueState: ValueState.Success });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oCheckBox.$().hasClass("sapMCbSucc"), "The CheckBox has value state success css class.");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'ValueState=Information'				   */
	/* ----------------------------------------------- */

	QUnit.test("'ValueState=Information'", async function(assert) {
		// system under test
		var oCheckBox = new CheckBox({ valueState: ValueState.Information });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oCheckBox.$().hasClass("sapMCbInfo"), "The CheckBox has value state information css class.");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'name'                                    */
	/* ----------------------------------------------- */

	QUnit.test("'name'", async function(assert) {

		var sName = "my Name";

		// system under test
		var oCheckBox = new CheckBox({ name: sName });

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oCheckBox.$("CB").attr("name"), sName, "Property 'name=" + sName + "': CheckBox input element should have attribute 'name=" + sName + "'");

		// cleanup
		oCheckBox.destroy();
	});



	/* ----------------------------------------------- */
	/* Test: getTabIndex (enabled=true)				   */
	/* ----------------------------------------------- */

	QUnit.test("'getTabIndex (enabled=true)'", function (assert) {

		// system under test
		var oCheckBox = new CheckBox({ enabled: true });

		// assertions
		assert.strictEqual(oCheckBox.getTabIndex(), 0, "'getTabindex' should return 0");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------- */
	/* Test: getTabIndex (enabled=false				   */
	/* ----------------------------------------------- */

	QUnit.test("'getTabIndex (enabled=false)'", function (assert) {

		// system under test
		var oCheckBox = new CheckBox({ enabled: false });

		// assertions
		assert.strictEqual(oCheckBox.getTabIndex(), -1, "'getTabindex' should return -1");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------------------------------- */
	/* Test: getTabIndex (tabIndex previously set explicitly via setTabIndex) */
	/* ----------------------------------------------------------------------- */

	QUnit.test("'getTabIndex (tabIndex previously set explicitly via setTabIndex)'", function (assert) {

		// system under test
		var oCheckBox = new CheckBox();

		// arrange
		oCheckBox.setTabIndex(2);

		// assertions
		assert.strictEqual(oCheckBox.getTabIndex(), 2, "'getTabindex' should return 2");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------- */
	/* Test: 'tabIndex' 							   */
	/* ----------------------------------------------- */

	QUnit.test("'tabIndex'", async function(assert) {

		var iTabIndex = 2;

		// system under test
		var oCheckBox = new CheckBox();

		// arrange
		oCheckBox.placeAt("content");
		oCheckBox.setTabIndex(iTabIndex);
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oCheckBox.$().attr("tabindex"), iTabIndex.toString(), "Property 'tabIndex=" + iTabIndex + "': CheckBox should have attribute 'tabindex=" + iTabIndex + "'");

		// cleanup
		oCheckBox.destroy();
	});


	/* ----------------------------------------------- */
	/* Test: testSetLabelProperty  					   */
	/* ----------------------------------------------- */

	QUnit.module("Label Properties", {
		beforeEach: function (assert) {
			this.testSetLabelProperty = function(property, value, mode) {

				var sPropertyCamelCase = property[0].toUpperCase() + property.slice(1);
				var sSetterMethod = "set" + sPropertyCamelCase;

				var oSpy = this.spy(Label.prototype, sSetterMethod);


				// system under test
				switch (mode) {
					case "Constructor":
						// set property via constructor
						var args = {};
						args[property] = value;
						var oCheckBox = new CheckBox(args);
						break;
					case "Setter":
						// set property via setter method
						var oCheckBox = new CheckBox();
						oCheckBox[sSetterMethod](value);
						break;
					default:
						Log.error(": wrong argument for parameter 'mode'");
				}

				// arrange
				oCheckBox.placeAt("content");
				nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;

				// assertions
				assert.strictEqual(oSpy.lastCall.args[0], value, "Property '" + property + "=" + value + "'testSetLabelProperty: Corresponding setter method of label control should have been called accordingly");

				// cleanup
				oCheckBox.destroy();
				Label.prototype[sSetterMethod].restore(); // restore as method might be called multiple times
			};
		}
	});

	QUnit.test("Should render the text of a Checkbox after rendering the checkbox without setting label properties", async function(assert) {
		// Arrange
		var oCheckBox = new CheckBox();

		// System under Test
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// Act
		oCheckBox.setText("foo");
		await nextUIUpdate();

		// Assert
		assert.ok(oCheckBox.$("label").length);

		// Cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* Test: 'text' - via Constructor                  */
	/* ----------------------------------------------- */

	QUnit.test("'text' - via Constructor", function (assert) {

		this.testSetLabelProperty("text", "my Text", "Constructor");
	});


	/* ----------------------------------------------- */
	/* Test: 'text' - via Setter Method                */
	/* ----------------------------------------------- */

	QUnit.test("'text' - via Setter Method", function (assert) {

		this.testSetLabelProperty("text", "my Text", "Setter");
	});



	/* ----------------------------------------------- */
	/* Test: 'textDirection' - via Constructor         */
	/* ----------------------------------------------- */

	QUnit.test("'textDirection' - via Constructor", function (assert) {

		this.testSetLabelProperty("textDirection", "RTL", "Constructor");
		this.testSetLabelProperty("textDirection", "LTR", "Constructor");
		this.testSetLabelProperty("textDirection", "Inherit", "Constructor");
	});


	/* ----------------------------------------------- */
	/* Test: 'textDirection' - via Setter Method         */
	/* ----------------------------------------------- */

	QUnit.test("'textDirection' - via Setter Method", function (assert) {

		this.testSetLabelProperty("textDirection", "RTL", "Setter");
		this.testSetLabelProperty("textDirection", "LTR", "Setter");
		this.testSetLabelProperty("textDirection", "Inherit", "Setter");
	});

	/* ----------------------------------------------- */
	/* Test: 'textAlign' - via Constructor         */
	/* ----------------------------------------------- */

	QUnit.test("'textAlign' - via Constructor", function (assert) {
		this.testSetLabelProperty("textAlign", "Begin", "Constructor");
		this.testSetLabelProperty("textAlign", "End", "Constructor");
		this.testSetLabelProperty("textAlign", "Left", "Constructor");
		this.testSetLabelProperty("textAlign", "Right", "Constructor");
		this.testSetLabelProperty("textAlign", "Center", "Constructor");
		this.testSetLabelProperty("textAlign", "Initial", "Constructor");
	});


	/* ----------------------------------------------- */
	/* Test: 'textAlign' - via Setter Method         */
	/* ----------------------------------------------- */

	QUnit.test("'textAlign' - via Setter Method", function (assert) {
		this.testSetLabelProperty("textAlign", "Begin", "Setter");
		this.testSetLabelProperty("textAlign", "End", "Setter");
		this.testSetLabelProperty("textAlign", "Left", "Setter");
		this.testSetLabelProperty("textAlign", "Right", "Setter");
		this.testSetLabelProperty("textAlign", "Center", "Setter");
		this.testSetLabelProperty("textAlign", "Initial", "Setter");
	});


	/* ----------------------------------------------- */
	/* Test: 'width' - via Constructor                 */
	/* ----------------------------------------------- */

	QUnit.test("'width' - via Constructor", function (assert) {

		this.testSetLabelProperty("width", "100px", "Constructor");
	});


	/* ----------------------------------------------- */
	/* Test: 'width' - via Setter Method               */
	/* ----------------------------------------------- */

	QUnit.test("'width' - via Setter Method", function (assert) {

		this.testSetLabelProperty("width", "100px", "Setter");
	});



	QUnit.module("Properties");

	QUnit.test("valueState with enabled and editable set to false", async function(assert) {
		// system under test
		var oCheckBox = new CheckBox({
			enabled: false,
			valueState: ValueState.Error
		});

		// act
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.notOk(oCheckBox.$().hasClass("sapMCbErr"));

		// act
		oCheckBox.setEnabled(true);
		await nextUIUpdate();

		// assert
		assert.ok(oCheckBox.$().hasClass("sapMCbErr"));

		// act
		oCheckBox.setEditable(false);
		await nextUIUpdate();

		// assert
		assert.notOk(oCheckBox.$().hasClass("sapMCbErr"));

		// act
		oCheckBox.setEditable(true);
		await nextUIUpdate();

		// assert
		assert.ok(oCheckBox.$().hasClass("sapMCbErr"));

		// cleanup
		oCheckBox.destroy();

	});



	QUnit.module("Basic CSS classes");

	/* ----------------------------------------------- */
	/* Test: Existence                                 */
	/* ----------------------------------------------- */

	QUnit.test("Existence", async function(assert) {

		// system under test
		var oCheckBox = new CheckBox();

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.ok(oCheckBox.$().hasClass("sapMCb"), "CheckBox should have class sapMCb");
		assert.ok(oCheckBox.$("CbBg").hasClass("sapMCbBg"), "CheckBox should have class sapMCbBg");

		// cleanup
		oCheckBox.destroy();
	});

	/* ----------------------------------------------- */
	/* function: sapMCbHoverable                       */
	/* ----------------------------------------------- */
	function testSapMCbHoverable(assert, oThat, bDesktop, sMessage) {

		oThat.stub(Device, "system").value({ desktop: bDesktop });

		// system under test
		var oCheckBox = new CheckBox();

		// arrange
		oCheckBox.placeAt("content");
		nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;

		// assertions
		if (bDesktop) {
			assert.ok(oCheckBox.$("CbBg").hasClass("sapMCbHoverable"), sMessage);
		} else {
			assert.ok(!oCheckBox.$("CbBg").hasClass("sapMCbHoverable"), sMessage);
		}

		// cleanup
		oCheckBox.destroy();
	}


	/* ----------------------------------------------- */
	/* Test: sapMCbHoverable (non-desktop environment) */
	/* ----------------------------------------------- */

	QUnit.test("sapMCbHoverable (non-desktop environment)", function (assert) {

		testSapMCbHoverable(assert, this, false, "CheckBox should not have class sapMCbHoverable");
	});


	/* ----------------------------------------------- */
	/* Test: sapMCbHoverable (desktop environment)     */
	/* ----------------------------------------------- */

	QUnit.test("sapMCbHoverable (desktop environment)", function (assert) {
		testSapMCbHoverable(assert, this, true, "CheckBox should have class sapMCbHoverable");
	});



	QUnit.module("Events");

	/* ----------------------------------------------- */
	/* Test: tap                                       */
	/* ----------------------------------------------- */

	QUnit.test("tap", async function(assert) {

		// system under test
		var oCheckBox = new CheckBox();
		var oSpy = this.spy();
		oCheckBox.attachSelect(oSpy);

		// arrange
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assertions
		assert.equal(oCheckBox.getSelected(), false, "CheckBox should not be selected");
		assert.strictEqual(oCheckBox.$().attr("aria-checked"), "false", "Property 'aria-checked': Default value should be 'false'");

		QUtils.triggerEvent("tap", oCheckBox.getId());
		await nextUIUpdate();

		assert.ok(oSpy.calledOnce, "Event 'select' should have been fired");
		assert.equal(oCheckBox.getSelected(), true, "CheckBox should be selected");
		assert.strictEqual(oCheckBox.$().attr("aria-checked"), "true", "Property 'aria-checked': Default value should be 'true'");

		QUtils.triggerEvent("tap", oCheckBox.getId());
		await nextUIUpdate();

		assert.ok(oSpy.calledTwice, "Event 'select' should have been fired");
		assert.equal(oCheckBox.getSelected(), false, "CheckBox should not be selected");

		oCheckBox.setEditable(false);
		QUtils.triggerEvent("tap", oCheckBox.getId());
		await nextUIUpdate();

		assert.ok(oSpy.calledTwice, "Event 'select' should have been fired");
		assert.equal(oCheckBox.getSelected(), false, "CheckBox should not be selected");

		// cleanup
		oCheckBox.destroy();
	});

	/* ------------------------------------------------------------------------------- */
	/* Test: Tap with different values of selected and partiallySelected properties    */
	/* ------------------------------------------------------------------------------- */

	function testTap(sTestName, oTestObject, oAssertion) {
		QUnit.test(sTestName, async function(assert) {

			// system under test
			var oCheckBox = new CheckBox({ selected: oTestObject.selected, partiallySelected: oTestObject.partiallySelected });

			// arrange
			oCheckBox.placeAt("content");
			await nextUIUpdate();

			QUtils.triggerEvent("tap", oCheckBox.getId());
			await nextUIUpdate();

			// assertions
			assert.equal(oCheckBox.getSelected(), oAssertion.isSelected, "Selected should be: " + oAssertion.isSelected);
			assert.equal(oCheckBox.getPartiallySelected(), oAssertion.isPartiallySelected, "PartiallySelected should be: " + oAssertion.isPartiallySelected);
			assert.equal(oCheckBox.$("CbBg").hasClass("sapMCbMarkChecked"), oAssertion.hasClass, "CheckBox should have class sapMCbMarkChecked: " + oAssertion.hasClass);
			assert.equal(oCheckBox.$("CB").is(":checked"), oAssertion.isChecked, "CheckBox should have attribute 'checked': " + oAssertion.isChecked);
			assert.strictEqual(oCheckBox.$().attr("aria-checked"), oAssertion.ariaChecked, "Property 'aria-checked' should be: " + oAssertion.ariaChecked);

			// cleanup
			oCheckBox.destroy();
		});
	}

	testTap(
		"Tap when selected=true and partiallySelected=true",
		{ selected: true, partiallySelected: true },
		{ isSelected: true, isPartiallySelected: false, hasClass: true, isChecked: true, ariaChecked: "true" }
	);

	testTap(
		"Tap when selected=false and partiallySelected=true",
		{ selected: false, partiallySelected: true },
		{ isSelected: true, isPartiallySelected: false, hasClass: true, isChecked: true, ariaChecked: "true" }
	);

	testTap(
		"Tap when selected=true and partiallySelected=false",
		{ selected: true, partiallySelected: false },
		{ isSelected: false, isPartiallySelected: false, hasClass: false, isChecked: false, ariaChecked: "false" }
	);

	testTap(
		"Tap when selected=false and partiallySelected=false",
		{ selected: false, partiallySelected: false },
		{ isSelected: true, isPartiallySelected: false, hasClass: true, isChecked: true, ariaChecked: "true" }
	);

	/* ----------------------------------------------- */
	/* Test: SPACE key                                 */
	/* ----------------------------------------------- */
	function testSpaceKey(sTestName, oOptions) {
		QUnit.test(sTestName, async function(assert) {

			//Arrange
			var oSpy = this.spy();
			var oCheckBox = new CheckBox({ select: oSpy, selected: oOptions.selected });

			// System under Test
			oCheckBox.placeAt("qunit-fixture");
			await nextUIUpdate();

			oCheckBox.$().trigger("focus"); // set focus on checkbox

			QUtils.triggerKeyup(oCheckBox.$(), KeyCodes.SPACE); // trigger Space up on checkbox
			await nextUIUpdate();

			assert.strictEqual(oSpy.callCount, 1, "SPACE is pressed, select event was fired");
			assert.equal(oCheckBox.getSelected(), oOptions.expectedSelection, oOptions.expectedMessage);
			assert.strictEqual(oCheckBox.$().attr("aria-checked"), "" + oOptions.expectedSelection, oOptions.expectedMessageAria);

			oSpy.resetHistory();
			QUtils.triggerKeyup(oCheckBox.$(), KeyCodes.SPACE, true); // trigger Space up on checkbox with SHIFT key pressed
			assert.strictEqual(oSpy.callCount, 0, "SPACE is released when holding SHIFT key, select event was not fired");

			// Clean up
			oCheckBox.destroy();
		});
	}

	testSpaceKey("Press Space on not selected checkBox", {
		selected: false,
		expectedSelection: true,
		expectedMessage: "CheckBox should be selected",
		expectedMessageAria: "Property 'aria-checked' should be 'true'"
	});

	testSpaceKey("Press Space on selected checkBox", {
		selected: true,
		expectedSelection: false,
		expectedMessage: "CheckBox should be deselected",
		expectedMessageAria: "Property 'aria-checked' should be 'false'"
	});


	/* ----------------------------------------------- */
	/* Test: ENTER key                                 */
	/* ----------------------------------------------- */
	function testEnterKey(sTestName, oOptions) {
		QUnit.test(sTestName, async function(assert) {

			//Arrange
			var oSpy = this.spy();
			var oCheckBox = new CheckBox({ select: oSpy, selected: oOptions.selected });

			// System under Test
			oCheckBox.placeAt("qunit-fixture");
			await nextUIUpdate();

			oCheckBox.$().trigger("focus"); // set focus on checkbox

			QUtils.triggerKeydown(oCheckBox.$(), KeyCodes.ENTER); // trigger Enter on checkbox
			await nextUIUpdate();

			assert.strictEqual(oSpy.callCount, 1, "Enter is pressed, select event was fired");
			assert.equal(oCheckBox.getSelected(), oOptions.expectedSelection, oOptions.expectedMessage);
			assert.strictEqual(oCheckBox.$().attr("aria-checked"), "" + oOptions.expectedSelection, oOptions.expectedMessageAria);

			// Clean up
			oCheckBox.destroy();
		});
	}

	testEnterKey("Press Enter on not selected checkBox", {
		selected: false,
		expectedSelection: true,
		expectedMessage: "CheckBox should be selected",
		expectedMessageAria: "Property 'aria-checked' should be 'true'"
	});

	testEnterKey("Press Enter on selected checkBox", {
		selected: true,
		expectedSelection: false,
		expectedMessage: "CheckBox should be deselected",
		expectedMessageAria: "Property 'aria-checked' should be 'false'"
	});

	QUnit.module("Private API");

	QUnit.test("_getSelectedState with different combinations of selected and partiallySelected properties", function (assert) {

		// system under test
		var oCheckBox = new CheckBox(),
			bSelected = this.stub(oCheckBox, "getSelected").returns(true),
			bPartiallySelected = this.stub(oCheckBox, "getPartiallySelected").returns(true);

		// assertions
		assert.equal(oCheckBox._getSelectedState(), true, "Should return true when selected = true and partiallySelected = true");

		// act
		bPartiallySelected.returns(false);

		// assertions
		assert.equal(oCheckBox._getSelectedState(), false, "Should return false when selected = true and partiallySelected = false");

		// act
		bSelected.returns(false);

		// assertions
		assert.equal(oCheckBox._getSelectedState(), true, "Should return true when selected = false and partiallySelected = false");

		// act
		bPartiallySelected.returns(true);

		// assertions
		assert.equal(oCheckBox._getSelectedState(), true, "Should return true when selected = false and partiallySelected = true");

		// cleanup
		oCheckBox.destroy();
	});

	QUnit.test("_getAriaChecked with different combinations of selected and partiallySelected properties", function (assert) {

		// system under test
		var oCheckBox = new CheckBox(),
			bSelected = this.stub(oCheckBox, "getSelected").callsFake(function () { return true; }),
			bPartiallySelected = this.stub(oCheckBox, "getPartiallySelected").callsFake(function () { return true; });

		// assertions
		assert.strictEqual(oCheckBox._getAriaChecked(), "mixed", "Should return 'mixed' when selected = true and partiallySelected = true");

		// act
		bPartiallySelected.returns(false);

		// assertions
		assert.equal(oCheckBox._getAriaChecked(), true, "Should return true when selected = true and partiallySelected = false");

		// act
		bSelected.returns(false);

		// assertions
		assert.equal(oCheckBox._getAriaChecked(), false, "Should return false when selected = false and partiallySelected = false");

		// act
		bPartiallySelected.returns(true);

		// assertions
		assert.equal(oCheckBox._getAriaChecked(), false, "Should return false when selected = false and partiallySelected = true");

		// cleanup
		oCheckBox.destroy();
	});

	QUnit.module("Accessibility");

	QUnit.test("Tooltips", async function(assert) {
		// system under test
		var oCheckBox = new CheckBox();

		// act
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oCheckBox.getDomRef().getAttribute("title"), null, "No tooltip or value state - title attribute is empty");

		// act
		oCheckBox.setTooltip("Sample tooltip");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oCheckBox.getDomRef().getAttribute("title"), "Sample tooltip", "Tooltip set - title attribute is not empty");

		// act
		oCheckBox.setValueState("Error");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oCheckBox.getDomRef().getAttribute("title"), "Sample tooltip - Invalid entry", "Tooltip and value state set - title attribute is correct");

		// act
		oCheckBox.setEditable(false);
		oCheckBox.setEnabled(false);
		await nextUIUpdate();

		// assert
		assert.strictEqual(oCheckBox.getDomRef().getAttribute("title"), "Sample tooltip", "Checkbox not editable or enabled - title attribute is set with custom tooltip only");

		oCheckBox.setEditable(true);
		oCheckBox.setEnabled(true);

		// act
		oCheckBox.setValueStateText("Custom Value State");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oCheckBox.getDomRef().getAttribute("title"), "Sample tooltip - Custom Value State", "Custom value state text set - title attribute is correct");

		// cleanup
		oCheckBox.destroy();
	});

	QUnit.test("Referencing labels enhancing", async function(assert) {
		// system under test
		var oSpy = this.spy(CheckBox.prototype, "_handleReferencingLabels"),
			oSpyHandler = this.spy(CheckBox.prototype, "_fnLabelTapHandler"),
			oLabel = new Label({
				text: "referencing label",
				labelFor: 'cbTest1'
			}),
			oCheckBox = new CheckBox({
				id: 'cbTest1'
			});

		// assert
		assert.ok(oSpy.calledOnce, "Enhancing function is called on init");

		// act
		oLabel.placeAt("content");
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		QUtils.triggerEvent("tap", oLabel.getId());
		await nextUIUpdate();

		// assert
		assert.ok(oSpyHandler.calledOnce, "Handler function is called");

		// cleanup
		oLabel.destroy();
		oCheckBox.destroy();
	});

	// test that ariaLabelledBy includes the external label's id when the labelFor is set and there is value in the text property
	QUnit.test("AriaLabelledBy", async function(assert) {
		// system under test
		var oLabel = new Label({
				text: "referencing label",
				labelFor: 'cbTest1'
			}),
			oCheckBox = new CheckBox({
				id: 'cbTest1'
			}),
			oCbLabel,
			sAriaLabelledBy;

		// act
		oLabel.placeAt("content");
		oCheckBox.placeAt("content");
		await nextUIUpdate();

		// assert
		assert.strictEqual(oCheckBox.getDomRef().getAttribute("aria-labelledby"), oLabel.getId(), "AriaLabelledBy includes the external label's id");

		// act
		oCheckBox.setText("Test");
		await nextUIUpdate();

		sAriaLabelledBy = oCheckBox.getDomRef().getAttribute("aria-labelledby");
		oCbLabel = oCheckBox.getAggregation("_label");

		// assert
		assert.ok(sAriaLabelledBy.includes(oLabel.getId()), "AriaLabelledBy includes the external label's id");
		assert.ok(sAriaLabelledBy.includes(oCbLabel.getId()), "AriaLabelledBy includes the internal label's id");

		// cleanup
		oLabel.destroy();
		oCheckBox.destroy();
	});

	QUnit.test("getAccessibilityInfo", function (assert) {
		var oControl = new CheckBox({ text: "Text" });
		assert.ok(!!oControl.getAccessibilityInfo, "CheckBox has a getAccessibilityInfo function");
		var oInfo = oControl.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, "checkbox", "AriaRole");
		assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.m").getText("ACC_CTR_TYPE_CHECKBOX"), "Type");
		assert.strictEqual(oInfo.description, "Text " + Library.getResourceBundleFor("sap.m").getText("ACC_CTR_STATE_NOT_CHECKED"), "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		assert.strictEqual(oInfo.enabled, true, "Enabled");
		assert.strictEqual(oInfo.editable, true, "Editable");
		oControl.setSelected(true);
		oControl.setEnabled(false);
		oControl.setEditable(false);
		oInfo = oControl.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Text " + Library.getResourceBundleFor("sap.m").getText("ACC_CTR_STATE_CHECKED"), "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.strictEqual(oInfo.enabled, false, "Enabled");
		assert.strictEqual(oInfo.editable, false, "Editable");
		oControl.destroy();
	});

	QUnit.module("Message support", {
		beforeEach: async function() {
			this.oCheckBox = new CheckBox({
				selected: "{/selected}"
			});
			this.oCheckBox.placeAt('qunit-fixture');
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCheckBox.destroy();
		}
	});

	QUnit.test("'valueState' property change when there is a Message", function (assert) {
		// arrange
		var done = assert.async(),
			oModel = new JSONModel({
				selected: true
			}),
			oMessageManager = Messaging,
			oMessage = new Message({
				type: MessageType.Error,
				target: "/selected",
				processor: oModel
			}),
			sExpectedTooltipText = Library.getResourceBundleFor("sap.ui.core").getText("VALUE_STATE_ERROR");

		// act
		this.oCheckBox.setModel(oModel);
		oMessageManager.registerObject(this.oCheckBox, true);
		oMessageManager.addMessages([oMessage]);

		setTimeout(function () {
			// assert
			assert.strictEqual(this.oCheckBox.getValueState(), "Error");
			assert.strictEqual(this.oCheckBox.$("Descr").text(), sExpectedTooltipText, "Default error message should be shown in the tooltip.");
			done();
		}.bind(this), 100);
	});

	QUnit.test("Description value when there is a Message containing error text", function (assert) {
		// arrange
		var done = assert.async(),
			oModel = new JSONModel({
				selected: true
			}),
			oMessageManager = Messaging,
			sMessage = "This error message should be shown in the tooltip instead of the default message from the Resource Bundle",
			oMessage = new Message({
				type: MessageType.Error,
				target: "/selected",
				processor: oModel,
				message: sMessage
			});

		// act
		this.oCheckBox.setModel(oModel);
		oMessageManager.registerObject(this.oCheckBox, true);
		oMessageManager.addMessages([oMessage]);

		setTimeout(function () {
			// assert
			assert.strictEqual(this.oCheckBox.$("Descr").text(), sMessage, "The error message should be shown in the tooltip");
			done();
		}.bind(this), 100);
	});

	/* ---------------------------------------------------------------------------------------- */
	/* Test: 'aria-checked with different values of selected and partiallySelected properties   */
	/* ---------------------------------------------------------------------------------------- */
	function testAriaChecked(sTestName, oTestObject, sAssertion) {
		QUnit.test(sTestName, async function(assert) {
			var oCheckBox = new CheckBox({ selected: oTestObject.selected, partiallySelected: oTestObject.partiallySelected });

			// arrange
			oCheckBox.placeAt("content");
			await nextUIUpdate();

			// assertions
			assert.strictEqual(oCheckBox.$().attr("aria-checked"), sAssertion);

			// cleanup
			oCheckBox.destroy();
		});
	}

	testAriaChecked(
		"Property 'aria-checked': Should be 'mixed'",
		{ selected: true, partiallySelected: true },
		"mixed"
	);

	testAriaChecked(
		"Property 'aria-checked': Should be 'false'",
		{ selected: false, partiallySelected: true },
		"false"
	);

	testAriaChecked(
		"Property 'aria-checked': Should be 'true'",
		{ selected: true, partiallySelected: false },
		"true"
	);

	testAriaChecked(
		"Property 'aria-checked': Should be 'false'",
		{ selected: false, partiallySelected: false },
		"false"
	);
});
