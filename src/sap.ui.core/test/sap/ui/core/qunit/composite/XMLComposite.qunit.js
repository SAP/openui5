sap.ui.define([
	"sap/ui/qunit/QUnitUtils", "sap/ui/core/Core", "sap/ui/core/Element",
	"sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLComposite", "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel", "sap/ui/core/Item", "sap/m/Text", "composites/SimpleText",
	"composites/SortedList", "composites/TextButton", "composites/TextList",
	"composites/ForwardText", "composites/Field", "composites/HiddenMetadata",
	"composites/TemplateTest", "composites/ChildOfAbstract", "composites/TextToggleButton",
	"composites/TextToggleButtonNested", "composites/TextToggleButtonForwarded",
	"composites/WrapperLayouter", "composites/TranslatableText", "composites/TranslatableTextLib",
	"composites/TranslatableTextBundle",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (QUnitUtils, Core, Element, XMLPreprocessor, XMLComposite, Controller, JSONModel, Item,
			 Text, SimpleText, SortedList, TextButton, TextList, ForwardText, Field, HiddenMetadata,
			 TemplateTest, ChildOfAbstract, TextToggleButton, TextToggleButtonNested,
			 TextToggleButtonForwarded, WrapperLayouter, TranslatableText, TranslatableTextLib,
			 TranslatableTextBundle, nextUIUpdate) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: Simple Text XMLComposite Control", {
		beforeEach: function () {
			this.oXMLComposite = new SimpleText();
			this.oXMLComposite.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oXMLComposite.destroy();
		}
	});
	//*********************************************************************************************

	QUnit.test("destroy", function (assert) {
		var oInnerText = this.oXMLComposite.getAggregation("_content");
		this.oXMLComposite.destroy();

		assert.strictEqual(this.oXMLComposite.bIsDestroyed, true, "The XMLComposite control is destroyed");
		assert.strictEqual(oInnerText.bIsDestroyed, true, "The text is destroyed");
		assert.strictEqual(oInnerText.getParent(), undefined, "Inner Control has no parent anymore");
		assert.strictEqual(Element.getElementById(oInnerText.getId()), undefined, "Inner Control is destroyed");
		try {
			oInnerText.placeAt("qunit-fixture");
			assert.ok(false, "This is not supposed to happen");
		} catch (ex) {
			assert.ok(true, "Inner Control cannot be used anymore (" + ex.message + ")");
		}
	});

	QUnit.test("properties", function (assert) {
		assert.strictEqual(this.oXMLComposite.getText(), "Default Text", "Default Text is set");
		assert.strictEqual(SimpleText.getMetadata().getProperty("text").defaultValue, "Default Text", "Default Text is set");
		assert.strictEqual(this.oXMLComposite.setText("Hello"), this.oXMLComposite, "Instance returned");
		assert.strictEqual(this.oXMLComposite.getText(), "Hello", "Text is set");
	});

	QUnit.test("inner control", function (assert) {
		var oInnerText = this.oXMLComposite.getAggregation("_content");
		assert.ok(oInnerText instanceof Text, "_content is set correctly");
		assert.strictEqual(oInnerText.getParent(), this.oXMLComposite, "Parent is the XMLComposite control");
		assert.strictEqual(oInnerText.getText(), this.oXMLComposite.getText(), "Text is propagated");
		assert.strictEqual(oInnerText.getBinding("text").getModel(), this.oXMLComposite._getManagedObjectModel(), "_getManagedObjectModel is set and propagated correctly");
		assert.strictEqual(oInnerText.getBinding("text").getContext().getProperty(), this.oXMLComposite, "Root node in ManagedObjectModel is the XMLComposite");
		assert.strictEqual(this.oXMLComposite._getManagedObjectModel().getRootObject(), this.oXMLComposite, "RootObject in ManagedObjectModel is the XMLComposite");
		assert.strictEqual(oInnerText.getVisible(), true, "Inner visible");
		// notice: oInnerText._getPropertiesToPropagate().oModels.$this === oInnerText._getPropertiesToPropagate().oBindingContexts.$this.oModel
		//TODO: Write additional test when another controlTreeModel is set on Fragment / should be filtered out!
		//TODO: Write additional test when another "regular" model is set on XMLComposite / should survice!
		//TODO: Write additional test when anpther "regular" model is set on inner control / should survive!
		assert.strictEqual(oInnerText._getPropertiesToPropagate().oBindingContexts["$this"].oModel, this.oXMLComposite._getManagedObjectModel(), "ControlTree Model is correctly propagated");

		var oInnerTextViaID = this.oXMLComposite.byId("myInnerTextControl");
		assert.strictEqual(oInnerText, oInnerTextViaID, "Inner control retrieved by ID equals the inner control retrieved by aggregation");

		this.oXMLComposite.setText("");
		assert.strictEqual(oInnerText.getVisible(), false, "Inner not visible due to condition in SimpleText.control.xml");
	});

	QUnit.test("data binding", function (assert) {
		var oInnerText = this.oXMLComposite.getAggregation("_content");

		var oGlobalModel = new JSONModel({
			text: "Global Model Text"
		});
		var oLocalModel = new JSONModel({
			text: "Local Model Text"
		});

		this.oXMLComposite.bindProperty("text", {
			path: "model>/text"
		});
		this.oXMLComposite.setText("Check");
		assert.strictEqual(oInnerText.getText(), "Check", "Text is not yet propagated");

		//global model
		Core.setModel(oGlobalModel, "model");
		assert.strictEqual(oInnerText.getText(), "Global Model Text", "Text is set from the global model");

		this.oXMLComposite.setText("SetModelTextGlobal");
		assert.strictEqual(oGlobalModel.getProperty("/text"), "SetModelTextGlobal", "Text is set via 2 way binding to the model");

		this.oXMLComposite.unbindProperty("text");
		assert.strictEqual(oInnerText.getText(), "Default Text", "Text is not propagated anymore and is the Default Text again");

		this.oXMLComposite.bindProperty("text", {
			path: "model>/text"
		});
		assert.strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is again bound");
		Core.setModel(null, "model");
		assert.strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is not propagated anymore but stays SetModelText because its still bound???");

		//local model
		this.oXMLComposite.setModel(oLocalModel, "model");
		assert.strictEqual(oInnerText.getText(), "Local Model Text", "Text is set from the local model");

		//set global model again
		Core.setModel(oGlobalModel, "model");
		assert.strictEqual(oInnerText.getText(), "Local Model Text", "Text is still set from local model");

		this.oXMLComposite.setText("SetModelText");
		assert.strictEqual(oLocalModel.getProperty("/text"), "SetModelText", "Text is set via 2 way binding to the local model");

		this.oXMLComposite.unbindProperty("text");
		assert.strictEqual(oInnerText.getText(), "Default Text", "Text is not propagated anymore and is the Default Text again");

		this.oXMLComposite.bindProperty("text", {
			path: "model>/text"
		});
		assert.strictEqual(oInnerText.getText(), "SetModelText", "Text is again bound");
		this.oXMLComposite.setModel(null, "model");

		//set the global model again
		Core.setModel(oGlobalModel, "model");
		assert.strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is now propagated from oGlobalModel");
	});

	QUnit.module("sap.ui.core.XMLComposite: Hidden properties & aggregations", {
		beforeEach: function() {
			this.oXMLComposite = new HiddenMetadata();
			this.oXMLComposite.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oXMLComposite.destroy();
		}
	});

	//*********************************************************************************************
	QUnit.test("properties", function (assert) {
		assert.strictEqual(this.oXMLComposite.getProperty("_text"),
			"The hidden text", "Default Text is set");
		assert.strictEqual(HiddenMetadata.getMetadata().getManagedProperty("_text").defaultValue,
			"The hidden text", "Default Text is set");
		assert.strictEqual(this.oXMLComposite.setProperty("_text", "Hello"),
			this.oXMLComposite, "Instance returned");
		assert.strictEqual(this.oXMLComposite.getProperty("_text"), "Hello", "Text is set");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: ForwardText XMLComposite Control with single aggregation", {
		beforeEach: function () {
			this.oText = new Text({
				text: "text"
			});
			this.oXMLComposite = new ForwardText({
				text: this.oText
			});
			this.oXMLComposite.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oXMLComposite.destroy();

		}
	});
	//*********************************************************************************************

	QUnit.test("destroy", function (assert) {
		var oInnerText = this.oXMLComposite.getAggregation("_content").getItems()[1]._oContent;

		this.oXMLComposite.destroy();
		assert.strictEqual(this.oXMLComposite.bIsDestroyed, true, "The XMLComposite control is destroyed");
		assert.strictEqual(oInnerText, undefined, "The inner text is undefined");
	});

	QUnit.test("destroy aggregation control", function (assert) {
		this.oText.destroy();
		assert.strictEqual(this.oXMLComposite.getText(), null, "The text is destroyed and the forwarded is null");
		assert.strictEqual(this.oText.getParent(), undefined, "Inner Control has no parent anymore"); //remember: oInnerText===oText
		assert.strictEqual(Element.getElementById(this.oText.getId()), undefined, "Inner Control is destroyed");
		try {
			this.oText.placeAt("qunit-fixture");
			assert.ok(false);
		} catch (ex) {
			assert.ok(true);
		}
	});

	QUnit.test("aggregation singular", function (assert) {
		var oInnerText = this.oXMLComposite.getAggregation("_content").getItems()[1].getContent();

		assert.strictEqual(this.oXMLComposite.setText(this.oText), this.oXMLComposite, "The XMLComposite control was returned after setText"); //check the inner control
		assert.strictEqual(oInnerText, this.oText, "Aggregation is forwarded to inner");
		assert.strictEqual(this.oText.getParent().getParent(), this.oXMLComposite.getAggregation("_content"), "The inner vbox is the parent");
	});

	QUnit.test("data binding", function (assert) {
		var oInnerText = this.oXMLComposite.getAggregation("_content").getItems()[1].getContent();
		var oModel = new JSONModel({
			text: "Model Text"
		});
		this.oText.bindProperty("text", {
			path: "model>/text"
		});
		this.oText.setText("Check");
		assert.strictEqual(oInnerText.getText(), "Check", "Text is not yet propagated");

		this.oText.setModel(oModel, "model");
		assert.strictEqual(oInnerText.getText(), "Model Text", "Text is propagated");

		this.oText.setText("SetModelText");
		assert.strictEqual(oModel.getProperty("/text"), "SetModelText", "Text is set via 2 way binding to the model");

		oInnerText.setText("SetModelText2");
		assert.strictEqual(oModel.getProperty("/text"), "SetModelText2", "Text is set via 2 way binding to the model from the innerText");

		this.oText.unbindProperty("text");
		assert.strictEqual(oInnerText.getText(), "", "Text is not propagated anymore and is the Default Text again");

		this.oText.bindProperty("text", {
			path: "model>/text"
		});
		assert.strictEqual(oInnerText.getText(), "SetModelText2", "Text is again bound");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: ForwardText XMLComposite Control with multi aggregation", {
		beforeEach: function () {
			this.aTexts = [];
			for (var i = 0; i < 5; i++) {
				this.aTexts.push(new Text({
					text: "text" + i
				}));
			}
			this.oXMLComposite = new ForwardText({
				textItems: this.aTexts
			});
			this.oXMLComposite.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			//	this.oXMLComposite.destroy();  TODO: why do this destroy lead to
			//
			// TypeError: Cannot read property 'destroyItems' of undefined at Aggregation.destroy
		}
	});
	//*********************************************************************************************

	QUnit.test("destroy", function (assert) {
		var aInnerItems = this.oXMLComposite.getAggregation("_content").getItems()[0].getItems();

		this.oXMLComposite.destroy();
		assert.strictEqual(this.oXMLComposite.bIsDestroyed, true, "The XMLComposite control is destroyed");
		for (var i = 0; i < 5; i++) {
			assert.strictEqual(aInnerItems[i].bIsDestroyed, true, "The text is destroyed");
		}
	});

	QUnit.test("destroy aggregation controls", function (assert) {
		var oInnerVBox = this.oXMLComposite.getAggregation("_content").getItems()[0];
		for (var i = 0; i < 5; i++) {
			this.aTexts[i].destroy();
			// the new i'th element is the former i+1'th
			assert.strictEqual(this.oXMLComposite.getTextItems()[0], this.aTexts[i + 1], "The text is destroyed and textItems has dropped that element");
			for (var j = 0; j < i; j++) {
				assert.strictEqual(this.oXMLComposite.getTextItems()[j], oInnerVBox.getItems()[j], "Forwarding has reflected the destroy correctly");
			}
			assert.strictEqual(this.aTexts[i].getParent(), undefined, "Inner Control has no parent anymore");
			assert.strictEqual(Element.getElementById(this.aTexts[i].getId()), undefined, "Inner Control is destroy");
			try {
				this.aTexts[i].placeAt("qunit-fixture");
			} catch (ex) {
				assert.ok(true, "Inner Control cannot be used anymore (" + ex.message + ")");
			}
		}
	});

	QUnit.test("data binding", function (assert) {
		var oModel = new JSONModel({
			texts: [
				{
					text: "Model Text0"
				}, {
					text: "Model Text1"
				}, {
					text: "Model Text2"
				}, {
					text: "Model Text3"
				}, {
					text: "Model Text4"
				}
			]
		});


		assert.strictEqual(this.oXMLComposite.getTextItems()[0].getText(), "text0", "Text is not set from model");

		// we need this due to a core issue discussed with Malte W & Andreas K
		this.oXMLComposite.destroyTextItems();

		this.oXMLComposite.bindAggregation("textItems", {
			path: "model1>/texts",
			template: new Text({
				text: {
					path: "model1>text"
				}
			})
		});

		// model / -
		Core.setModel(oModel, "model1");
		assert.strictEqual(this.oXMLComposite.getTextItems()[0].getText(), "Model Text0", "Text is set from model");

		// Rendering Parent inner <VBox>
		assert.strictEqual(this.oXMLComposite.getTextItems()[0].getParent(), this.oXMLComposite.getAggregation("_content").getItems()[0], "Rendering Parent is the inner VBox control");

		// null / -
		Core.setModel(null, "model");
		assert.strictEqual(this.oXMLComposite.getTextItems().length, 5, "Unbound global model");  // TODO: should it be zero instead of 5?

		// null / model
		this.oXMLComposite.setModel(oModel, "model");
		assert.strictEqual(this.oXMLComposite.getTextItems()[0].getText(), "Model Text0", "Text is set from the local model");

		// null / null
		this.oXMLComposite.setModel(null, "model");
		assert.strictEqual(this.oXMLComposite.getTextItems().length, 5, "Unbound model");  // TODO: should it be zero instead of 5?

		// model / null
		Core.setModel(oModel, "model");
		assert.strictEqual(this.oXMLComposite.getTextItems()[0].getText(), "Model Text0", "Text is set from global model");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: XMLComposite Control in XMLComposite Control", {
		beforeEach: function () {
			this.oXMLComposite = new Field();
			this.oXMLComposite.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oXMLComposite.destroy();
		}
	});
	//*********************************************************************************************

	QUnit.test("destroy", function (assert) {
		var oInnerBox = this.oXMLComposite.getAggregation("_content");
		var oInnerText = this.oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content");
		var oInnerInput = this.oXMLComposite.getAggregation("_content").getItems()[1];

		// act,
		this.oXMLComposite.destroy();

		// assert
		assert.strictEqual(this.oXMLComposite.getAggregation("_content"), null);
		assert.strictEqual(this.oXMLComposite.bIsDestroyed, true, "The XMLComposite control is destroyed");
		assert.strictEqual(oInnerBox.bIsDestroyed, true, "The box is destroyed");
		assert.strictEqual(oInnerText.bIsDestroyed, true, "The text is destroyed");
		assert.strictEqual(oInnerInput.bIsDestroyed, true, "The input is destroyed");
	});

	QUnit.test("destroy aggregation control", function (assert) {
		var oInnerText = this.oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content");
		var oInnerInput = this.oXMLComposite.getAggregation("_content").getItems()[1];

		oInnerText.destroy();
		oInnerInput.destroy();

		assert.strictEqual(this.oXMLComposite.getText(), "Default Text", "The text is destroyed but the property value in model is still remain");
		assert.strictEqual(this.oXMLComposite.getValue(), "Default Value", "The value is destroyed but the property value in model is still remain");
	});

	QUnit.test("properties", function (assert) {
		assert.strictEqual(this.oXMLComposite.getValue(), "Default Value", "Default value is set");
		assert.strictEqual(this.oXMLComposite.getText(), "Default Text", "Default value of inner control does not shine through to XMLComposite control"); // TODO ER: es scheint durch!

		var oInnerText = this.oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content");
		oInnerText.setText("inner Text");
		assert.strictEqual(this.oXMLComposite.getText(), "inner Text", "Text of 2nd level inner control shines through to XMLComposite control");

		this.oXMLComposite.setText("outer Text");
		assert.strictEqual(oInnerText.getText(), "outer Text", "Text of XMLComposite control is propagated to 2nd level inner control");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: eventing", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************

	QUnit.test("inner", function (assert) {
		var fnFirePressHandlerSpy = sinon.spy(TextButton.prototype, "onPress");
		var oXMLComposite = new TextButton();

		oXMLComposite.getAggregation("_content").getItems()[1].firePress();
		assert.ok(fnFirePressHandlerSpy.calledOnce);

		fnFirePressHandlerSpy.restore();
		oXMLComposite.destroy();
	});

	QUnit.test("outer", async function (assert) {
		var oXMLComposite = new TextToggleButton();
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		var done = assert.async();

		oXMLComposite.attachTextChanged(function () {
			// assert
			assert.equal(oXMLComposite.getText(), "On");
			assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getText(), "On");
			assert.equal(oXMLComposite.getAggregation("_content").getItems()[1].getPressed(), true);
			done();
		});
		// act: Click on ToggleButton
		QUnitUtils.triggerTouchEvent("tap", oXMLComposite.getAggregation("_content").getItems()[1].getDomRef());
		oXMLComposite.destroy();
	});

	QUnit.test("nested - event from deep inner to outer", async function (assert) {
		var fnFireTextChangedSpy = sinon.spy(TextToggleButtonNested.prototype, "fireTextChanged");
		var oXMLComposite = new TextToggleButtonNested();
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act: Click on ToggleButton
		QUnitUtils.triggerTouchEvent("tap", oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getDomRef());

		// assert
		assert.ok(fnFireTextChangedSpy.calledOnce);

		fnFireTextChangedSpy.restore();
		oXMLComposite.destroy();
	});

	QUnit.test("nested - event from inner to outer", async function (assert) {
		var oXMLComposite = new TextToggleButtonNested();
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		var done = assert.async();

		// Initial state of the nested controls
		assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getText(), "Default Text", "property 'text' of XMLComposite control");
		assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[0].getText(), "Default Text", "property 'text' of sap.m.Text");
		assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getPressed(), false);

		// prepare: Set ToggleButton to 'pressed'
		QUnitUtils.triggerTouchEvent("tap", oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getDomRef());

		assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getText(), "On", "property 'text' of XMLComposite control");
		assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[0].getText(), "On", "property 'text' of sap.m.Text");
		assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getPressed(), true);

		oXMLComposite.attachRefreshed(function () {
			// assert: Initial state should be restored
			assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getText(), "Default Text", "property 'text' of XMLComposite control");
			assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[0].getText(), "Default Text", "property 'text' of sap.m.Text");
			assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getPressed(), false);
			done();
		});

		// act: Click on 'Refresh' button
		QUnitUtils.triggerTouchEvent("tap", oXMLComposite.getAggregation("_content").getItems()[1].getDomRef());

		oXMLComposite.destroy();
	});

	QUnit.test("forwarded - event from deep inner to outer", async function (assert) {
		var oTextToggleButton = new TextToggleButton();
		var fnFireTextChangedSpy = sinon.spy(TextToggleButtonForwarded.prototype, "fireTextChanged");
		var oXMLComposite = new TextToggleButtonForwarded({
			textToggleButton: oTextToggleButton
		});
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();

		// act: Click on ToggleButton
		QUnitUtils.triggerTouchEvent("tap", oTextToggleButton.getAggregation("_content").getItems()[1].getDomRef());

		// assert
		assert.ok(fnFireTextChangedSpy.calledOnce);

		fnFireTextChangedSpy.restore();
		oXMLComposite.destroy();
	});

	QUnit.test("forwarded - event from inner to outer", async function (assert) {
		var oXMLComposite = new TextToggleButtonForwarded({
			textToggleButton: new TextToggleButton()
		});
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		var done = assert.async();

		// Initial state of controls
		var oTextToggleButton = oXMLComposite.getAggregation("_content").getItems()[0].getContent();
		assert.equal(oTextToggleButton.getText(), "Default Text");
		var oToggleButton = oTextToggleButton.getAggregation("_content").getItems()[1];
		assert.equal(oToggleButton.getPressed(), false);

		// Click on ToggleButton
		QUnitUtils.triggerTouchEvent("tap", oToggleButton.getDomRef());

		assert.equal(oTextToggleButton.getText(), "On");
		assert.equal(oToggleButton.getPressed(), true);

		oXMLComposite.attachRefreshed(function () {
			assert.equal(oTextToggleButton.getText(), "Default Text");
			assert.equal(oToggleButton.getPressed(), false);
			done();
		});

		// Click on 'Refresh' button
		QUnitUtils.triggerTouchEvent("tap", oXMLComposite.getAggregation("_content").getItems()[1].getDomRef());

		oXMLComposite.destroy();
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************

	QUnit.test("Aggregation", function (assert) {
		var oXMLComposite = new ForwardText();

		oXMLComposite.addTextItem(new Text({
			text: "text1"
		}));
		oXMLComposite.insertTextItem(new Text({
			text: "text0"
		}), 0);
		assert.equal(oXMLComposite.getTextItems().length, 2);

		oXMLComposite.removeTextItem(0);
		assert.equal(oXMLComposite.getTextItems().length, 1);

		oXMLComposite.removeAllTextItems();
		assert.equal(oXMLComposite.getTextItems().length, 0);

		oXMLComposite.destroy();
	});

	QUnit.test("Abstract", async function (assert) {
		var oXMLComposite = new ChildOfAbstract();
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.ok(oXMLComposite);
		oXMLComposite.destroy();
	});

	QUnit.test("Test to check if we have an invalidate setting in the core", function (assert) {
		var oXMLComposite = new TemplateTest();
		oXMLComposite.placeAt("qunit-fixture");
		var oMetadataPropertyText = oXMLComposite.getMetadata().getProperty("text");
		assert.strictEqual(oMetadataPropertyText.appData.invalidate, "template", "This test should fail once core also has an invalidate");
		oXMLComposite.destroy();
	});

	QUnit.module("clone");

	QUnit.test("simple", function (assert) {
		var done = assert.async();
		var oXMLComposite = new TextToggleButton("Frag1"), oButton, oText;
		var sId;
		var iCount = 0;

		oXMLComposite.attachTextChanged(function (oEvent) {
			iCount++;
			sId = oEvent.oSource.getId();
		});

		//TEMP-CLONE-ISSUE var fnVBoxCloneSpy = sinon.spy(oXMLComposite.getAggregation("_content"), "clone");

		var oClone = oXMLComposite.clone("MyClone");
		assert.equal(oClone.getId(), "Frag1-MyClone", "XMLComposite cloned");
		setTimeout(async function() {
			var oContent = oClone._getCompositeAggregation();
			//TEMP-CLONE-ISSUE assert.notOk(fnVBoxCloneSpy.called, "VBox clone function not called");
			//TEMP-CLONE-ISSUE assert.equal(oContent.getId(), "Frag1-MyClone--myVBox", "VBox created, not cloned");

			oXMLComposite.placeAt("qunit-fixture");
			oClone.placeAt("qunit-fixture");
			await nextUIUpdate();

			//Id access
			oButton = oXMLComposite.byId("myButton");
			oText = oXMLComposite.byId("myText");
			assert.ok(oButton, "The button is accessed from the original control");
			assert.ok(oText, "The text is accessed from the original control");
			assert.ok(oButton.getId().endsWith("myButton"), "the button has the correct suffix");
			assert.ok(oText.getId().endsWith("myText"), "the text has the correct suffix");

			oButton = oClone.byId("myButton");
			oText = oClone.byId("myText");
			assert.ok(oButton, "The button is accessed from the the clone");
			assert.ok(oText, "The text is accessed from the clone");
			assert.ok(oButton.getId().endsWith("myButton"), "the button has the correct suffix");
			assert.ok(oText.getId().endsWith("myText"), "the text has the correct suffix");

			//Eventing
			QUnitUtils.triggerTouchEvent("tap", oContent.getItems()[1].getDomRef());
			assert.equal(iCount, 1, "Event fired only once");
			assert.equal(sId, oClone.getId(), "The event is really fired from the clone");

			//To be sure fire from the template
			oContent = oXMLComposite._getCompositeAggregation();
			QUnitUtils.triggerTouchEvent("tap", oContent.getItems()[1].getDomRef());
			assert.equal(iCount, 2, "Event fired again");
			assert.equal(sId, oXMLComposite.getId(), "The event is fired from the template");

			oXMLComposite.destroy();
			oClone.destroy();
			done();
		}, 500);
	});

	QUnit.test("list", function (assert) {
		var oXMLComposite = new TextList("Frag1", {
			texts: [
				new Item("I1", {
					key: "K1",
					text: "Text 1"
				}), new Item("I2", {
					key: "K2",
					text: "Text 2"
				}), new Item("I3", {
					key: "K3",
					text: "Text 3"
				})
			]
		});

		var oClone = oXMLComposite.clone("MyClone");
		assert.equal(oClone.getId(), "Frag1-MyClone", "XMLComposite cloned");
		var aItems = oClone.getTexts();
		assert.equal(aItems.length, 3, "Clone has 3 Items");
		assert.equal(aItems[0].getId(), "I1-MyClone", "Item cloned");

		var aTexts = oClone.getAggregation("_content").getItems()[1].getItems();
		assert.equal(aTexts.length, 3, "Clone has 3 Texts");

		oXMLComposite.destroy();
		oClone.destroy();
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: Wrapper default properties", {
		beforeEach: function () {
			var Wrapper = XMLComposite.extend("Wrapper", {
				constructor: function (sId, mSettings) {
					XMLComposite.apply(this, arguments);
				},
				fragment: "composites.wrapper",
				renderer: "sap.ui.core.XMLCompositeRenderer"
			});
			this.oWrapper = new Wrapper("layout");
			this.oWrapper.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oWrapper.destroy();
		}
	});
	//*********************************************************************************************

	QUnit.test("default properties", function (assert) {
		assert.strictEqual(this.oWrapper.getHeight(), "", "Default height is undefined");
		assert.strictEqual(this.oWrapper.getWidth(), "100%", "Default width is 100%");
		assert.strictEqual(this.oWrapper.getDisplayBlock(), true, "Default displayBlock is true");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: Wrapper properties", {
		beforeEach: function () {
			var Wrapper = XMLComposite.extend("Wrapper", {
				constructor: function (sId, mSettings) {
					XMLComposite.apply(this, arguments);
				},
				fragment: "composites.wrapper",
				renderer: "sap.ui.core.XMLCompositeRenderer"
			});
			this.oWrapper = new Wrapper("layout");
			this.oWrapper.placeAt("qunit-fixture");
			this.oWrapper.setHeight("100%");
			this.oWrapper.setWidth("200px");
			this.oWrapper.setDisplayBlock(false);
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oWrapper.destroy();
		}
	});
	//*********************************************************************************************

	QUnit.test("properties", async function (assert) {
		assert.strictEqual(this.oWrapper.getHeight(), "100%", "Height is 100%");
		assert.strictEqual(this.oWrapper.getWidth(), "200px", "Width is 200px");
		assert.strictEqual(this.oWrapper.getDisplayBlock(), false, "DisplayBlock is false");

		this.oWrapper.invalidate();
		await nextUIUpdate();

		assert.strictEqual(this.oWrapper.getHeight(), "100%", "Height is 100%");
		assert.strictEqual(this.oWrapper.getWidth(), "200px", "Width is 200px");
		assert.strictEqual(this.oWrapper.getDisplayBlock(), false, "DisplayBlock is false");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: Translatable Texts from default lib", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************

	QUnit.test("properties", async function (assert) {
		var done = assert.async();
		var oXMLComposite = new TranslatableText();
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.equal(oXMLComposite.bUsesI18n, true, "The i18n resource model is used");
		if (oXMLComposite.getResourceBundle().then) {
			//async loading of resource bundle
			oXMLComposite.getResourceBundle().then(function (oBundle) {
				assert.strictEqual(oXMLComposite.byId("myTranslatableTextControl").getText(), "Translatable Text", "Text was read from messagemodel via binding (lib)");
				assert.strictEqual(oBundle.getText("key"), "Translatable Text", "Text was read from messagebundle via API (lib)");
				var oContent = oXMLComposite._getCompositeAggregation();
				assert.strictEqual(oContent.getModel("$" + oXMLComposite.alias + ".i18n").getProperty("key"), "Translatable Text", "Text was read from messagemodel via getProperty (lib)");
				oXMLComposite.destroy();
				done();
			});
		}
	});

	QUnit.test("positive tests - not in root", async function (assert) {
		var done = assert.async();

		var sFragmentContent = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout">'
			+ '<layout:HorizontalLayout><Input id="innerInput" placeholder="{$this>/placeholder}" />'
			+ '<Button id="myTranslatableTextControl" text="{$this.i18n>buttonText}" press="handleSearch" /></layout:HorizontalLayout></core:FragmentDefinition>';
		var oXml = new DOMParser().parseFromString(sFragmentContent, "text/xml").documentElement;

		var TextInButton = XMLComposite.extend("composites.TextInButton", {
			metadata: {
				properties: {
					placeholder: { type: "string", defaultValue: "Enter Search Term..." }
				}
			},
			fragmentContent: oXml
		});

		var oXMLComposite = new TextInButton({placeholder: "custom placeholder"});
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.equal(oXMLComposite.bUsesI18n, true, "The i18n resource model is used");
		if (oXMLComposite.getResourceBundle().then) {
			//async loading of resource bundle
			oXMLComposite.getResourceBundle().then(function (oBundle) {
				assert.strictEqual(oXMLComposite.byId("myTranslatableTextControl").getText(), "My Text", "Text was read from messagemodel via binding (lib)");
				assert.strictEqual(oBundle.getText("buttonText"), "My Text", "Text was read from messagebundle via API (lib)");
				var oContent = oXMLComposite._getCompositeAggregation();
				assert.strictEqual(oContent.getModel("$" + oXMLComposite.alias + ".i18n").getProperty("key"), "Translatable Text", "Text was read from messagemodel via getProperty (lib)");
				oXMLComposite.destroy();
				done();
			});
		}
	});

	QUnit.test("positive tests - in root", async function (assert) {
		var done = assert.async();
		var sFragmentContent = '<m:Panel id="myTranslatableTextControl" headerText="{$this.i18n>panelText}" xmlns:m="sap.m"><m:Input id="innerInput" placeholder="{$this>/placeholder}" />'
			+ '<m:Button text="{$this>/buttonText}" press="handleSearch" /></m:Panel>';
		var oXml = new DOMParser().parseFromString(sFragmentContent, "text/xml").documentElement;

		var TextInRoot = XMLComposite.extend("composites.TextInRoot", {
			metadata: {
				properties: {
					placeholder: { type: "string", defaultValue: "Enter Search Term..." },
					buttonText: {type: "string", defaultValue: "My Text"}
				}
			},
			fragmentContent: oXml
		});

		var oXMLComposite = new TextInRoot({placeholder: "custom placeholder"});
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.equal(oXMLComposite.bUsesI18n, true, "The i18n resource model is used");
		if (oXMLComposite.getResourceBundle().then) {
			//async loading of resource bundle
			oXMLComposite.getResourceBundle().then(function (oBundle) {
				assert.strictEqual(oXMLComposite.byId("myTranslatableTextControl").getHeaderText(), "My Panel Text", "Text was read from messagemodel via binding (lib)");
				assert.strictEqual(oBundle.getText("panelText"), "My Panel Text", "Text was read from messagebundle via API (lib)");
				var oContent = oXMLComposite._getCompositeAggregation();
				assert.strictEqual(oContent.getModel("$" + oXMLComposite.alias + ".i18n").getProperty("key"), "Translatable Text", "Text was read from messagemodel via getProperty (lib)");
				oXMLComposite.destroy();
				done();
			});
		}
	});

	QUnit.test("negative test lib not loaded when not used", async function (assert) {
		var oXMLComposite = new TextToggleButton();
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		var oContent = oXMLComposite._getCompositeAggregation();
		assert.equal(oXMLComposite.bUsesI18n, false, "No reference for the i18n resource model is found");
		assert.notOk(oContent.getModel("$" + oXMLComposite.alias + ".i18n"), "there is no i18n Model");

	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: Translatable Texts from this.lib", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************

	QUnit.test("properties", async function (assert) {
		var done = assert.async();
		var oXMLComposite = new TranslatableTextLib();
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		if (oXMLComposite.getResourceBundle().then) {
			//async loading of resource bundle
			oXMLComposite.getResourceBundle().then(function (oBundle) {
				assert.strictEqual(oXMLComposite.byId("myTranslatableTextControl").getText(), "Translatable Text from composites2", "Text was read from messagemodel via binding (lib)");
				assert.strictEqual(oBundle.getText("key"), "Translatable Text from composites2", "Text was read from messagebundle via API (lib)");
				var oContent = oXMLComposite.getAggregation(oXMLComposite.getMetadata().getCompositeAggregationName());
				assert.strictEqual(oContent.getModel("$" + oXMLComposite.alias + ".i18n").getProperty("key"), "Translatable Text from composites2", "Text was read from messagemodel via getProperty (lib)");
				oXMLComposite.destroy();
				done();
			});
		}
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: resource model on hidden aggregation and only there", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************

	QUnit.test("properties", async function (assert) {
		var done = assert.async();
		var oXMLComposite = new TranslatableText();
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		if (oXMLComposite.getResourceBundle().then) {
			//async loading of resource bundle
			oXMLComposite.getResourceBundle().then(function (oBundle) {
				assert.notEqual(oXMLComposite.getAggregation("_content").getModel("$this.i18n"), undefined, "resource model is available on the hidden aggregation");
				assert.strictEqual(oXMLComposite.getModel("$this.i18n"), undefined, "resource model is not available on the XMLComposite itself");
				oXMLComposite.destroy();
				done();
			});
		}
	});
	//*********************************************************************************************

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: Translatable Texts from this.messagebundle", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************

	QUnit.test("properties", async function (assert) {
		var done = assert.async();
		var oXMLComposite = new TranslatableTextBundle();
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		if (oXMLComposite.getResourceBundle().then) {
			//async loading of resource bundle
			oXMLComposite.getResourceBundle().then(function (oBundle) {
				assert.strictEqual(oXMLComposite.byId("myTranslatableTextControl").getText(), "Translatable Text 2", "Text was read from messagemodel via binding");
				assert.strictEqual(oBundle.getText("key2"), "Translatable Text 2", "Text was read from messagebundle via API");
				var oContent = oXMLComposite.getAggregation(oXMLComposite.getMetadata().getCompositeAggregationName());
				assert.strictEqual(oContent.getModel("$" + oXMLComposite.alias + ".i18n").getProperty("key2"), "Translatable Text 2", "Text was read from messagemodel via getProperty");
				oXMLComposite.destroy();
				done();
			});
		}
	});
	//*********************************************************************************************

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: destroy test", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************

	QUnit.test("properties", async function (assert) {
		var done = assert.async();
		var oXMLComposite = new TranslatableTextBundle();
		oXMLComposite.placeAt("qunit-fixture");
		await nextUIUpdate();
		if (oXMLComposite.getResourceBundle().then) {
			//async loading of resource bundle
			oXMLComposite.getResourceBundle().then(function (oBundle) {
				var oResourceModel = oXMLComposite._getResourceModel();
				oXMLComposite.destroy();
				assert.ok(oResourceModel.bDestroyed, "Resource Model was destroyed");
				done();
			});
		}
	});
	//*********************************************************************************************


	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: reuse test", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************

	QUnit.test("properties", async function (assert) {
		var done = assert.async();
		var oXMLComposite0 = new TranslatableTextLib();
		var oXMLComposite1 = new TranslatableTextLib();
		oXMLComposite0.placeAt("qunit-fixture");
		oXMLComposite1.placeAt("qunit-fixture");
		await nextUIUpdate();

		//async loading of resource bundle
		var p0 = oXMLComposite0.getResourceBundle();
		var p1 = oXMLComposite0.getResourceBundle();
		Promise.all([p0, p1]).then(function (values) {
			p0 = values[0];
			p1 = values[1];
			assert.strictEqual(p0, p1, "Resource Model is reused");
			done();
		});
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: create from given fragmentContent", {
		beforeEach: function () {
			this.sFragmentContent = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout">'
				+ '<layout:HorizontalLayout><Input id="innerInput" placeholder="{$this>/placeholder}" />'
				+ '<Button text="{$this>/buttonText}" press="handleSearch" /></layout:HorizontalLayout></core:FragmentDefinition>';
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************

	QUnit.test("create from string", function (assert) {
		var SearchFieldFromString = XMLComposite.extend("control.SearchFieldFromString", {
			metadata: {
				properties: {
					placeholder: { type: "string", defaultValue: "Enter Search Term..." },
					buttonText: { type: "string", defaultValue: "Search" }
				}
			},
			fragmentContent: this.sFragmentContent
		});

		var oSearchField = new SearchFieldFromString({placeholder: "custom placeholder"});

		assert.ok(oSearchField, "Composite instance should be created");
		assert.strictEqual(oSearchField.getPlaceholder(), "custom placeholder", "Property value should be applied");
		assert.strictEqual(oSearchField.getButtonText(), "Search", "Default property value should be applied");
	});
	//*********************************************************************************************
	QUnit.test("create from XML tree", function (assert) {
		var oXml = new DOMParser().parseFromString(this.sFragmentContent, "text/xml").documentElement;

		var SearchFieldFromXml = XMLComposite.extend("control.SearchFieldFromXml", {
			metadata: {
				properties: {
					placeholder: { type: "string", defaultValue: "Enter Search Term..." },
					buttonText: { type: "string", defaultValue: "Search" }
				}
			},
			fragmentContent: oXml
		});

		var oSearchField = new SearchFieldFromXml({placeholder: "custom placeholder"});

		assert.ok(oSearchField, "Composite instance should be created");
		assert.strictEqual(oSearchField.getPlaceholder(), "custom placeholder", "Property value should be applied");
		assert.strictEqual(oSearchField.getButtonText(), "Search", "Default property value should be applied");
	});

	//************************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: accessibility", {
		before: function (assert) {
			this.content = null;
			return new Promise( function( resolve, reject ) {
				var oField = new Field("accessible");
				sap.ui.require(["sap/m/Label", "sap/m/HBox"], function (Label, HBox) {
					var oLabel = new Label("label", {text: "test", labelFor: oField});
					var oAdditionalLabel = new Label("additional", {text: "additional"});
					oField.addAriaLabelledBy(oAdditionalLabel);
					this.content = new HBox({items: [oLabel,oField, oAdditionalLabel]});
					this.content.placeAt("qunit-fixture");
					nextUIUpdate().then(resolve);
				}.bind(this));
			}.bind(this));
		},
		after: function (assert) {
		}
	});

	QUnit.test("accessibility", function(assert) {
		var oField = this.content.getItems()[1];
		assert.equal(oField.getFocusDomRef().id, "accessible--focus", "FocusDomRef");
		assert.equal(document.getElementById("label").getAttribute("for"), "accessible--focus", "Label points to focusable DomRef");
		assert.equal(document.getElementById("accessible").getAttribute("aria-labelledby"), "label additional", "The focusable dom ref is also labelled by the additional label");
	});

	QUnit.test("BCP: 002075129400001541162020", function (assert) {
		var aItems,
			oModel,
			oSortedList;

		// preparation
		oModel = new JSONModel({
			data : [{key : 2, text : "2"}, {key : 1, text : "1"}, {key : 3, text : "3"}]
		});

		oSortedList = new SortedList({
			sortedItems : {
				path : '/data',
				template : new Item({text : {path : "text", key : "key"}})
			}
		});
		oSortedList.setModel(oModel);

		// code under test - data sorted in the inner control
		aItems = oSortedList.byId("sorted").getItems();
		assert.strictEqual(aItems.length, 3);
		assert.strictEqual(aItems[0].getTitle(), "1");
		assert.strictEqual(aItems[1].getTitle(), "2");
		assert.strictEqual(aItems[2].getTitle(), "3");

		// code under test - now simulate data change
		oModel.setProperty("/data", [{key : 1, text : "1"}, {key : 3, text : "3"}]);
		aItems = oSortedList.byId("sorted").getItems();

		// code under test - data still sorted in the inner control
		assert.strictEqual(aItems.length, 2);
		assert.strictEqual(aItems[0].getTitle(), "1");
		assert.strictEqual(aItems[1].getTitle(), "3");
	});
});