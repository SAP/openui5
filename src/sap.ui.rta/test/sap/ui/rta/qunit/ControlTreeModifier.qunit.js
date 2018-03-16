/*global QUnit, sinon*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/rta/ControlTreeModifier',
	'sap/ui/fl/changeHandler/JsControlTreeModifier',
	'sap/m/Button',
	'sap/ui/layout/HorizontalLayout',
	'sap/ui/core/TooltipBase',
	'sap/ui/model/json/JSONModel',
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],
function(
	RtaControlTreeModifier,
	JSControlTreeModifier,
	Button,
	HorizontalLayout,
	TooltipBase,
	JSONModel
){
	"use strict";
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a button is instantiated...", {

		beforeEach : function(assert) {
			this.oModel = new JSONModel({
				text1 : "text1",
				text2 : "text2"
			});
			this.oButton = new Button();
		},
		afterEach : function(assert) {
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when the button's property is changed via RTA ControlTreeModifier...", function(assert) {
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.setProperty(this.oButton, "text", "value");
			assert.strictEqual(this.oButton.getText(), "value", "then the correct property is set.");
		});

		QUnit.test("when the button's visibility is set to false and an undo happens afterwards...", function(assert) {
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.setVisible(this.oButton, false);
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(
				this.oButton.getVisible(),
				false,
				"then the button's visibility is false before the undo.");
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(
				this.oButton.getVisible(),
				true,
				"then the visibility of the button is set back to true after the undo.");
		});

		QUnit.test("when the button's text property is set and bound to a path...", function(assert){
			RtaControlTreeModifier.setProperty(this.oButton, "text", "first value");
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.bindProperty(this.oButton, "text", "/Binding");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(
				this.oButton.getText(),
				"first value",
				"then after the undo the text of the button goes back to the first value.");
		});

		QUnit.test("when the button's text property binding changes using bindProperty...", function(assert){
			RtaControlTreeModifier.bindProperty(this.oButton, "text", "/Binding");
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.bindProperty(this.oButton, "text", "/NewBinding");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(
				this.oButton.getBindingPath("text"),
				"/NewBinding",
				"then the binding path of the text property is changed properly."
				);
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(
				this.oButton.getBindingPath("text"),
				"/Binding",
				"then after the undo the binding of the text of the button goes back to the first value."
				);
		});

		QUnit.test("when the button's text property binding was done using a binding info object and is changed...", function(assert){
			this.oButton.bindProperty("text", {
					path: '/date',
					type: 'sap.ui.model.type.Date',
					formatOptions: {
						relative: true,
						relativeScale: 'auto'
					}
				});
			var mBindingInfo = this.oButton.getBindingInfo("text");
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.bindProperty(this.oButton, "text", "/NewBinding");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(
				this.oButton.getBindingPath("text"),
				"/NewBinding",
				"then the binding path of the text property is changed properly."
				);
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(
				this.oButton.getBindingInfo("text"),
				mBindingInfo,
				"then after the undo the binding of the text of the button goes back to the first value."
				);
		});

		QUnit.test("when the button's property binding is set with an expression and an undo is executed...", function(assert){
			this.oButton = new Button({text : "{= ${/Items}.length > 0}"});
			var mBindingInfo = this.oButton.getBindingInfo("text");
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.setPropertyBinding(this.oButton, "text", "/newBinding");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(
				this.oButton.getBindingInfo("text"),
				mBindingInfo,
				"then after the undo the previous binding is restored."
				);
		});

		QUnit.test("when a data model is present and a button's text property previously set as value is bound to a path...", function(assert){
			RtaControlTreeModifier.setProperty(this.oButton, "text", "first value");
			this.oButton.setModel(this.oModel);
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.bindProperty(this.oButton, "text", "/text1");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(
				this.oButton.getText(),
				"text1",
				"the text property is correctly set to the value in the data model.");
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(
				this.oButton.getText(),
				"first value",
				"then after the undo the text of the button goes back to the first value.");
		});

		QUnit.test("when a data model is present and a button's text property bound to a path is bound to a different path...", function(assert){
			this.oButton.setModel(this.oModel);
			RtaControlTreeModifier.bindProperty(this.oButton, "text", "/text1");
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.bindProperty(this.oButton, "text", "/text2");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(
				this.oButton.getText(),
				"text2",
				"the text property is correctly set to the value in the data model.");
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(
				this.oButton.getText(),
				"text1",
				"then after the undo the text of the button goes back to the first value in the data model.");
		});

		QUnit.test("when a data model is present and a button's text property binding was done using a binding info object and is changed...", function(assert){
			this.oButton.bindProperty("text", {
					path: '/date',
					type: 'sap.ui.model.type.Date',
					formatOptions: {
						relative: true,
						relativeScale: 'auto'
					}
				});
			this.oButton.setModel(this.oModel);
			var mBindingInfo = this.oButton.getBindingInfo("text");
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.bindProperty(this.oButton, "text", "/NewBinding");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(
				this.oButton.getBindingPath("text"),
				"/NewBinding",
				"then the binding path of the text property is changed properly."
				);
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(
				this.oButton.getBindingInfo("text"),
				mBindingInfo,
				"then after the undo the binding of the text of the button goes back to the first value."
				);
		});

		QUnit.test("when a button's text property is directly unbound (with unbindProperty())...", function(assert){
			this.oButton.bindProperty("text", {
					path: '/date',
					type: 'sap.ui.model.type.Date',
					formatOptions: {
						relative: true,
						relativeScale: 'auto'
					}
				});
			this.oButton.setModel(this.oModel);
			var mBindingInfo = this.oButton.getBindingInfo("text");
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.unbindProperty(this.oButton, "text");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(
				this.oButton.getBinding("text"),
				undefined,
				"then the binding is removed properly."
				);
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(
				this.oButton.getBindingInfo("text"),
				mBindingInfo,
				"then after the undo the binding of the text of the button goes back to the first value."
				);
		});
	});

	QUnit.module("Given an ObjectPageLayout with a visible Section and an invisible Section are available...", {

		beforeEach : function(assert) {
			this.oView = sap.ui.xmlview("idMain1", "sap.ui.rta.test.ObjectPage");
			this.oView.placeAt("test-view");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function(assert) {
			this.oView.destroy();
		}

	}, function() {
		QUnit.test("when stashed section is unstashed...", function(assert) {
			RtaControlTreeModifier.startRecordingUndo();
			var oStashedControl = sap.ui.getCore().byId(this.oView.createId("ObjectPageSection3"));
			RtaControlTreeModifier.setStashed(oStashedControl, false);
			var oCreatedControl = sap.ui.getCore().byId(this.oView.createId("ObjectPageSection3"));
			assert.strictEqual(oCreatedControl.getVisible(), true, "then the Object Page Section control is created and visible");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(oCreatedControl.getVisible(), false, "then after the undo the Page Section control is no longer visible");

		});

		QUnit.test("when visible section is stashed...", function(assert) {
			RtaControlTreeModifier.startRecordingUndo();
			var oControl = sap.ui.getCore().byId(this.oView.createId("ObjectPageSection1"));
			RtaControlTreeModifier.setStashed(oControl, true);
			assert.strictEqual(oControl.getVisible(), false, "then the Object Page Section control is now invisible");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(oControl.getVisible(), true, "then after the undo the Page Section control is again visible");
		});

		QUnit.test("when invisible section is stashed...", function(assert) {
			RtaControlTreeModifier.startRecordingUndo();
			var oControl = sap.ui.getCore().byId(this.oView.createId("ObjectPageSection4"));
			RtaControlTreeModifier.setStashed(oControl, true);
			assert.strictEqual(oControl.getVisible(), false, "then the Object Page Section control remains invisible");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(oControl.getVisible(), false, "then after the undo the Page Section control also remains invisible");
		});
	});

	QUnit.module("Given an HorizontalLayout with two buttons...", {

		beforeEach : function(assert) {
			this.oHorizontalLayout = new HorizontalLayout(
				{content : [new Button("firstButton"), new Button("secondButton")]}
			);
		},
		afterEach : function(assert) {
			this.oHorizontalLayout.destroy();
		}
	}, function() {
		QUnit.test("when insertAggregation is called to add a button in the middle of the layout...", function(assert){
			var oButton = new Button("AddedMiddle");
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.insertAggregation(this.oHorizontalLayout, "content", oButton, 1);
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(this.oHorizontalLayout.getAggregation("content")[1].getId(), "AddedMiddle", "then the button was properly added");
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(this.oHorizontalLayout.getAggregation("content").length, 2, "then after the undo the button is removed");
		});

		QUnit.test("when removeAggregation on the second button is called...", function(assert){
			var oControl = sap.ui.getCore().byId("secondButton");
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.removeAggregation(this.oHorizontalLayout, "content", oControl);
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(this.oHorizontalLayout.getAggregation("content").length, 1, "then the button was properly removed");
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(
				this.oHorizontalLayout.getAggregation("content")[1].getId(),
				"secondButton",
				"then after the undo the button is restored at the same position of the aggregation"
			);
		});

		QUnit.test("when removeAllAggregation is called to remove all buttons...", function(assert){
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.removeAllAggregation(this.oHorizontalLayout, "content");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(this.oHorizontalLayout.getAggregation("content"), null, "then the buttons were properly removed");
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(this.oHorizontalLayout.getAggregation("content").length, 2, "then after the undo all buttons are restored");
			assert.strictEqual(
				this.oHorizontalLayout.getAggregation("content")[1].getId(),
				"secondButton",
				"then after the undo the buttons are restored at the same position of the aggregation"
			);
		});
	});

	QUnit.module("Given a button and a tooltip...", {
		beforeEach : function(assert) {
			this.oButton = new Button("TooltipButton");
			this.oToolTip = new TooltipBase("ToolTip", { text : "first text" });
			this.oNewToolTip = new TooltipBase("NewToolTip", { text : "new text"});
		},
		afterEach : function(assert) {
			this.oButton.destroy();
			this.oToolTip.destroy();
			this.oNewToolTip.destroy();
		}
	}, function() {
		QUnit.test("when a tooltip aggregation is inserted in the button...", function(assert){
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.insertAggregation(this.oButton, "tooltip", this.oToolTip);
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(this.oButton.getTooltip().getText(), "first text", "then the tooltip was properly added to the button");
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(this.oButton.getTooltip(), null, "then after the undo the tooltip is removed");
		});

		QUnit.test("when a tooltip aggregation is inserted in the button with a tooltip already...", function(assert){
			RtaControlTreeModifier.insertAggregation(this.oButton, "tooltip", this.oToolTip);
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.insertAggregation(this.oButton, "tooltip", this.oNewToolTip);
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(this.oButton.getAggregation("tooltip").getText(), "new text", "then the tooltip was properly modified on the button");
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(this.oButton.getAggregation("tooltip").getText(), "first text", "then after the undo the first tooltip is restored");
		});

		QUnit.test("when a tooltip aggregation is removed from the button...", function(assert){
			RtaControlTreeModifier.insertAggregation(this.oButton, "tooltip", this.oToolTip);
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.insertAggregation(this.oButton, "tooltip");
			this.aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			assert.strictEqual(this.oButton.getAggregation("tooltip"), null, "then the tooltip was properly removed from the button");
			RtaControlTreeModifier.performUndo(this.aUndoStack);
			assert.strictEqual(this.oButton.getAggregation("tooltip").getText(), "first text", "then after the undo the tooltip is restored");
		});
	});

	QUnit.module("Given that instantiateFragment returns 3 Buttons...", {
		beforeEach: function(assert) {
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			sandbox.stub(JSControlTreeModifier, "instantiateFragment").returns([this.oButton1, this.oButton2, this.oButton3]);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when undoing instantiateFragment", function(assert) {
			RtaControlTreeModifier.startRecordingUndo();
			RtaControlTreeModifier.instantiateFragment();
			var aUndoStack = RtaControlTreeModifier.stopRecordingUndo();
			RtaControlTreeModifier.performUndo(aUndoStack);

			assert.ok(this.oButton1._bIsBeingDestroyed, "the first Button got destroyed");
			assert.ok(this.oButton2._bIsBeingDestroyed, "and the second Button got destroyed");
			assert.ok(this.oButton3._bIsBeingDestroyed, "and the third Button got destroyed");
		});
	});
});