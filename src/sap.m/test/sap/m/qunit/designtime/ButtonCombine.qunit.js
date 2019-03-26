/*global QUnit */

sap.ui.define([
	"sap/ui/core/Title",
	"sap/ui/core/mvc/View",
	"sap/m/changeHandler/CombineButtons",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/ui/fl/Change",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/CustomData",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Title,
	View,
	CombineButtons,
	Bar,
	Button,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	EventExtension,
	JSONModel,
	CustomData,
	UIComponent,
	ComponentContainer,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	jQuery("#qunit-fixture").css({
		top: "auto",
		left: "auto",
		bottom: 0,
		right: 0,
		width: "500px",
		height: "500px",
		boxShadow: "rgba(0, 0, 0, 0.7) 2px 2px 10px",
		backgroundColor: "rgb(255, 255, 255)"
	});

	QUnit.module("Checking the combine action: ", {
		beforeEach: function () {
			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							"id": "fixture.application"
						}
					}
				},
				createContent: function () {
					return this.oView.getContent()[0];
				}.bind(this)
			});

			this.oButton1 = new Button({
				id: "button1",
				text: "Button 1"
			});
			this.oButton2 = new Button({
				id: "button2",
				text: "Button 2"
			});
			this.oBar = new Bar({
				id: "idBar",
				contentRight: [
					this.oButton1,
					this.oButton2
				]
			});
			this.oView = new View({
				content: [
					this.oBar
				]
			});

			this.oComponent = new FixtureComponent();
			this.oComponentContainer = new ComponentContainer("CompCont", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.mSpecificChangeInfo = {
				"parentId": "idFormContainer",
				"combineElementIds": ["button1", "button2"]
			};
			this.oChange = new Change({
				"changeType": "combineButtons",
				"content": {}
			});
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test('Press event fired correctly after combine', function (assert) {
			var oPressSpy = sinon.spy();
			this.oButton1.attachPress(oPressSpy);

			CombineButtons.completeChangeContent(
				this.oChange,
				this.mSpecificChangeInfo,
				{
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				}
			);
			CombineButtons.applyChange(
				this.oChange,
				this.oBar,
				{
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				}
			);

			var oCreatedMenuButton = this.oBar.getContentRight()[0];
			var oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];
			oFirstMenuItem.firePress();

			assert.strictEqual(oPressSpy.callCount, 1, "then the press event handler on the original button was called once");
		});

		QUnit.test("Enable / Disable Button when the property is bound", function(assert) {
			var oModel = new JSONModel();
			oModel.setData({
				mData: {
					enabled: false,
					visible: false,
					text: "Title 1",
					icon: "sap-icon://accept"
				}
			});

			// Step 1: set defaults
			this.oButton1.setEnabled(true);
			this.oButton1.setVisible(true);
			this.oButton1.setText("initial");
			this.oButton1.setIcon("sap-icon://add");

			assert.strictEqual(this.oButton1.getEnabled(), true, "then the initial value of the `enabled` property of the original button is correct");
			assert.strictEqual(this.oButton1.getVisible(), true, "then the initial value of the `visible` property of the original button is correct");
			assert.strictEqual(this.oButton1.getText(), "initial", "then the initial value of the `text` property of the original button is correct");
			assert.strictEqual(this.oButton1.getIcon(), "sap-icon://add", "then the initial value of the `icon` property of the original button is correct");

			// Step 2: assign custom model
			this.oButton1.setModel(oModel);
			this.oButton1.bindProperty("enabled", "/mData/enabled");
			this.oButton1.bindProperty("visible", "/mData/visible");
			this.oButton1.bindProperty("text", "/mData/text");
			this.oButton1.bindProperty("icon", "/mData/icon");

			assert.strictEqual(this.oButton1.getEnabled(), false, "then the value of the `enabled` property of the original button is taken from the Model");
			assert.strictEqual(this.oButton1.getVisible(), false, "then the value of the `visible` property of the original button is taken from the Model");
			assert.strictEqual(this.oButton1.getText(), "Title 1", "then the value of the `text` property of the original button is taken from the Model");
			assert.strictEqual(this.oButton1.getIcon(), "sap-icon://accept", "then the value of the `icon` property of the original button is taken from the Model");

			// Step 3: apply change (combine buttons)
			CombineButtons.completeChangeContent(
				this.oChange,
				this.mSpecificChangeInfo,
				{
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				}
			);
			CombineButtons.applyChange(
				this.oChange,
				this.oBar,
				{
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				}
			);

			var oCreatedMenuButton = this.oBar.getContentRight()[0];
			var oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];

			// Step 4: check if new button received properties from the original button
			assert.strictEqual(oFirstMenuItem.getEnabled(), false, "then the value of the `enabled` property of the MenuItem button is taken from the original button");
			assert.strictEqual(oFirstMenuItem.getVisible(), false, "then the value of the `visible` property of the MenuItem button is taken from the original button");
			assert.strictEqual(oFirstMenuItem.getText(), "Title 1", "then the value of the `text` property of the MenuItem button is taken from the original button");
			assert.strictEqual(oFirstMenuItem.getIcon(), "sap-icon://accept", "then the value of the `icon` property of the MenuItem button is taken from the original button");

			// Step 5: check if new button reacts on updates on original button
			oModel.setData({
				mData: {
					enabled: true,
					visible: true,
					text: "Title 2",
					icon: "sap-icon://home"
				}
			});
			assert.strictEqual(oFirstMenuItem.getEnabled(), true, "then the value of the `enabled` property of the MenuItem button is taken from the original button");
			assert.strictEqual(oFirstMenuItem.getVisible(), true, "then the value of the `visible` property of the MenuItem button is taken from the original button");
			assert.strictEqual(oFirstMenuItem.getText(), "Title 2", "then the value of the `text` property of the MenuItem button is taken from the original button");
			assert.strictEqual(oFirstMenuItem.getIcon(), "sap-icon://home", "then the value of the `icon` property of the MenuItem button is taken from the original button");
		});

		QUnit.test('CustomData of the Button is copied to MenuItem', function (assert) {
			var oMyCustomData = new CustomData({
				key: "myCustomData",
				value: "my custom data value"
			});

			this.oButton1.insertAggregation("customData", oMyCustomData);

			// Combine buttons
			CombineButtons.completeChangeContent(
				this.oChange,
				this.mSpecificChangeInfo,
				{
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				}
			);
			CombineButtons.applyChange(
				this.oChange,
				this.oBar,
				{
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				}
			);

			var oCreatedMenuButton = this.oBar.getContentRight()[0];
			var oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];
			var aCustomData = oFirstMenuItem.getCustomData();
			var bIsFound = aCustomData.some(function (oCustomData) {
				return (
					oCustomData.getKey() === oMyCustomData.getKey()
					&& oCustomData.getValue() === oMyCustomData.getValue()
				);
			});

			assert.ok(bIsFound, "First menuItem has the the customData that was set to the button from which was created");
		});

		QUnit.test('CustomData of the MenuItem contains original button id', function (assert) {
			var sOriginalButtonId = this.oButton1.getId();

			// Combine buttons
			CombineButtons.completeChangeContent(
				this.oChange,
				this.mSpecificChangeInfo,
				{
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				}
			);
			CombineButtons.applyChange(
				this.oChange,
				this.oBar,
				{
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				}
			);

			var oCreatedMenuButton = this.oBar.getContentRight()[0];
			var oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];
			var aCustomData = oFirstMenuItem.getCustomData();

			var bIsFound = aCustomData.some(function (oCustomData) {
				return (
						oCustomData.getKey() === "originalButtonId"
						&& oCustomData.getValue() === sOriginalButtonId
				);
			});

			assert.ok(bIsFound, "First menuItem contains in the customData the original Button id");
		});

		QUnit.test('MenuButton text should be created from the original Buttons names in reverse order in RTL mode', function (assert) {
			var config = sap.ui.getCore().getConfiguration();
			//turn on rtl for this test
			sandbox.stub(config, "getRTL").returns(true);

			var sMenuButtonText = this.oButton2.getText() + "/" + this.oButton1.getText();

			// Combine buttons
			CombineButtons.completeChangeContent(
				this.oChange,
				this.mSpecificChangeInfo,
				{
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				}
			);
			CombineButtons.applyChange(
				this.oChange,
				this.oBar,
				{
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				}
			);

			var oCreatedMenuButton = this.oBar.getContentRight()[0];

			assert.equal(oCreatedMenuButton.getText(), sMenuButtonText, "MenuButton text is correct in RTL");
		});

		QUnit.test('Revert change', function (assert) {
			var oPropertyBag = {
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				};
			// Combine buttons
			CombineButtons.completeChangeContent(this.oChange, this.mSpecificChangeInfo, oPropertyBag);
			CombineButtons.applyChange(this.oChange, this.oBar, oPropertyBag);

			assert.strictEqual(this.oBar.getContentRight().length, 1, "The change was successfully executed.");

			CombineButtons.revertChange(this.oChange, this.oBar, oPropertyBag);

			assert.strictEqual(this.oBar.getContentRight().length, 2, "The change was successfully reverted.");
		});

		QUnit.test('Buttons are reverted in the initial order', function (assert) {
			var oPropertyBag = {
					modifier: JsControlTreeModifier,
					view: this.oView,
					appComponent: this.oComponent
				};
			// combine buttons in reverse order
				this.mSpecificChangeInfo = {
					"parentId": "idFormContainer",
					"combineElementIds": ["button2", "button1"]
				};
			// Combine buttons
			CombineButtons.completeChangeContent(this.oChange, this.mSpecificChangeInfo, oPropertyBag);
			CombineButtons.applyChange(this.oChange, this.oBar, oPropertyBag);

			var oCreatedMenuButton = this.oBar.getContentRight()[0];
			var oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];
			var oSecondMenuItem = oCreatedMenuButton.getMenu().getItems()[1];

			assert.strictEqual(oFirstMenuItem.getText(), this.oButton2.getText(), "Button2 is first inside the menu.");
			assert.strictEqual(oSecondMenuItem.getText(), this.oButton1.getText(), "Button1 is second inside the menu.");

			CombineButtons.revertChange(this.oChange, this.oBar, oPropertyBag);

			assert.strictEqual(this.oBar.getContentRight()[0].getText(), this.oButton1.getText(), "Button1 is first.");
			assert.strictEqual(this.oBar.getContentRight()[1].getText(), this.oButton2.getText(), "Button2 is second.");
		});

	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});