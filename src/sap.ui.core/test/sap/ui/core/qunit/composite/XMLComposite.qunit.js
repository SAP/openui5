/*!
 * ${copyright}
 */
setBlanketFilters("sap/ui/core/XMLComposite.js");

/**
 * setBlanketFilters
 * @param {string} sFilters comma separated strings to filter the paths for blanket
 */
function setBlanketFilters(sFilters) {
	if (top === window) { //only in local environment
		top["blanket.filter.only"] = sFilters;
	}
}

sinon.config.useFakeTimers = true;

sap.ui.require([
	"jquery.sap.global"
], function (jQuery) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";
	jQuery.sap.registerModulePath("composites", location.pathname.substring(0, location.pathname.lastIndexOf("/")) + "/composites");
	jQuery.sap.require("composites.SimpleText");
	jQuery.sap.require("composites.TextButton");
	jQuery.sap.require("composites.TextList");
	jQuery.sap.require("composites.ForwardText");
	jQuery.sap.require("composites.Field");
	jQuery.sap.require("composites.TemplateTest");
	jQuery.sap.require("composites.ChildOfAbstract");
	jQuery.sap.require("composites.TextToggleButton");
	jQuery.sap.require("composites.TextToggleButtonNested");
	jQuery.sap.require("composites.TextToggleButtonForwarded");
	jQuery.sap.require("composites.LabelButtonTemplate");
	jQuery.sap.require("composites.LabelButtonsTemplate");
	jQuery.sap.require("composites.WrapperLayouter");

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: Simple Text XMLComposite Control", {
		beforeEach: function () {
			this.oXMLComposite = new composites.SimpleText();
			this.oXMLComposite.placeAt("content");
			sap.ui.getCore().applyChanges();
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
		assert.strictEqual(sap.ui.getCore().byId(oInnerText.getId()), undefined, "Inner Control is destroyed");
		try {
			oInnerText.placeAt("content");
			assert.ok(false, "This is not supposed to happen");
		} catch (ex) {
			assert.ok(true, "Inner Control cannot be used anymore (" + ex.message + ")");
		}
	});

	QUnit.test("properties", function (assert) {
		assert.strictEqual(this.oXMLComposite.getText(), "Default Text", "Default Text is set");
		assert.strictEqual(composites.SimpleText.getMetadata().getProperty("text").defaultValue, "Default Text", "Default Text is set");
		assert.strictEqual(this.oXMLComposite.setText("Hello"), this.oXMLComposite, "Instance returned");
		assert.strictEqual(this.oXMLComposite.getText(), "Hello", "Text is set");
	});

	QUnit.test("inner control", function (assert) {
		var oInnerText = this.oXMLComposite.getAggregation("_content");
		assert.ok(oInnerText instanceof sap.m.Text, "_content is set correctly");
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

		var oGlobalModel = new sap.ui.model.json.JSONModel({
			text: "Global Model Text"
		});
		var oLocalModel = new sap.ui.model.json.JSONModel({
			text: "Local Model Text"
		});

		this.oXMLComposite.bindProperty("text", {
			path: "model>/text"
		});
		this.oXMLComposite.setText("Check");
		assert.strictEqual(oInnerText.getText(), "Check", "Text is not yet propagated");

		//global model
		sap.ui.getCore().setModel(oGlobalModel, "model");
		assert.strictEqual(oInnerText.getText(), "Global Model Text", "Text is set from the global model");

		this.oXMLComposite.setText("SetModelTextGlobal");
		assert.strictEqual(oGlobalModel.getProperty("/text"), "SetModelTextGlobal", "Text is set via 2 way binding to the model");

		this.oXMLComposite.unbindProperty("text");
		assert.strictEqual(oInnerText.getText(), "Default Text", "Text is not propagated anymore and is the Default Text again");

		this.oXMLComposite.bindProperty("text", {
			path: "model>/text"
		});
		assert.strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is again bound");
		sap.ui.getCore().setModel(null, "model");
		assert.strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is not propagated anymore but stays SetModelText because its still bound???");

		//local model
		this.oXMLComposite.setModel(oLocalModel, "model");
		assert.strictEqual(oInnerText.getText(), "Local Model Text", "Text is set from the local model");

		//set global model again
		sap.ui.getCore().setModel(oGlobalModel, "model");
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
		sap.ui.getCore().setModel(oGlobalModel, "model");
		assert.strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is now propagated from oGlobalModel");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: ForwardText XMLComposite Control with single aggregation", {
		beforeEach: function () {
			this.oText = new sap.m.Text({
				text: "text"
			});
			this.oXMLComposite = new composites.ForwardText({
				text: this.oText
			});
			this.oXMLComposite.placeAt("content");
			sap.ui.getCore().applyChanges();
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
		assert.strictEqual(sap.ui.getCore().byId(this.oText.getId()), undefined, "Inner Control is destroyed");
		try {
			this.oText.placeAt("content");
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
		var oModel = new sap.ui.model.json.JSONModel({
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
				this.aTexts.push(new sap.m.Text({
					text: "text" + i
				}));
			}
			this.oXMLComposite = new composites.ForwardText({
				textItems: this.aTexts
			});
			this.oXMLComposite.placeAt("content");
			sap.ui.getCore().applyChanges();
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
			assert.strictEqual(sap.ui.getCore().byId(this.aTexts[i].getId()), undefined, "Inner Control is destroy");
			try {
				this.aTexts[i].placeAt("content");
			} catch (ex) {
				assert.ok(true, "Inner Control cannot be used anymore (" + ex.message + ")");
			}
		}
	});

	QUnit.test("data binding", function (assert) {
		var oModel = new sap.ui.model.json.JSONModel({
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
			template: new sap.m.Text({
				text: {
					path: "model1>text"
				}
			})
		});

		// model / -
		sap.ui.getCore().setModel(oModel, "model1");
		assert.strictEqual(this.oXMLComposite.getTextItems()[0].getText(), "Model Text0", "Text is set from model");

		// Rendering Parent inner <VBox>
		assert.strictEqual(this.oXMLComposite.getTextItems()[0].getParent(), this.oXMLComposite.getAggregation("_content").getItems()[0], "Rendering Parent is the inner VBox control");

		// null / -
		sap.ui.getCore().setModel(null, "model");
		assert.strictEqual(this.oXMLComposite.getTextItems().length, 5, "Unbound global model");  // TODO: should it be zero instead of 5?

		// null / model
		this.oXMLComposite.setModel(oModel, "model");
		assert.strictEqual(this.oXMLComposite.getTextItems()[0].getText(), "Model Text0", "Text is set from the local model");

		// null / null
		this.oXMLComposite.setModel(null, "model");
		assert.strictEqual(this.oXMLComposite.getTextItems().length, 5, "Unbound model");  // TODO: should it be zero instead of 5?

		// model / null
		sap.ui.getCore().setModel(oModel, "model");
		assert.strictEqual(this.oXMLComposite.getTextItems()[0].getText(), "Model Text0", "Text is set from global model");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: XMLComposite Control in XMLComposite Control", {
		beforeEach: function () {
			this.oXMLComposite = new composites.Field();
			this.oXMLComposite.placeAt("content");
			sap.ui.getCore().applyChanges();
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
		var fnFirePressHandlerSpy = sinon.spy(composites.TextButton.prototype, "onPress");
		var oXMLComposite = new composites.TextButton();

		oXMLComposite.getAggregation("_content").getItems()[1].firePress();
		assert.ok(fnFirePressHandlerSpy.calledOnce);

		fnFirePressHandlerSpy.restore();
		oXMLComposite.destroy();
	});

	QUnit.test("outer", function (assert) {
		var oXMLComposite = new composites.TextToggleButton();
		oXMLComposite.placeAt("content");
		sap.ui.getCore().applyChanges();
		var done = assert.async();

		oXMLComposite.attachTextChanged(function () {
			// assert
			assert.equal(oXMLComposite.getText(), "On");
			assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getText(), "On");
			assert.equal(oXMLComposite.getAggregation("_content").getItems()[1].getPressed(), true);
			done();
		});
		// act: Click on ToggleButton
		sap.ui.test.qunit.triggerTouchEvent("tap", oXMLComposite.getAggregation("_content").getItems()[1].getDomRef());
		oXMLComposite.destroy();
	});

	QUnit.test("nested - event from deep inner to outer", function (assert) {
		var fnFireTextChangedSpy = sinon.spy(composites.TextToggleButtonNested.prototype, "fireTextChanged");
		var oXMLComposite = new composites.TextToggleButtonNested();
		oXMLComposite.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act: Click on ToggleButton
		sap.ui.test.qunit.triggerTouchEvent("tap", oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getDomRef());

		// assert
		assert.ok(fnFireTextChangedSpy.calledOnce);

		fnFireTextChangedSpy.restore();
		oXMLComposite.destroy();
	});

	QUnit.test("nested - event from inner to outer", function (assert) {
		var oXMLComposite = new composites.TextToggleButtonNested();
		oXMLComposite.placeAt("content");
		sap.ui.getCore().applyChanges();
		var done = assert.async();

		// Initial state of the nested controls
		assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getText(), "Default Text", "property 'text' of XMLComposite control");
		assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[0].getText(), "Default Text", "property 'text' of sap.m.Text");
		assert.equal(oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getPressed(), false);

		// prepare: Set ToggleButton to 'pressed'
		sap.ui.test.qunit.triggerTouchEvent("tap", oXMLComposite.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getDomRef());

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
		sap.ui.test.qunit.triggerTouchEvent("tap", oXMLComposite.getAggregation("_content").getItems()[1].getDomRef());

		oXMLComposite.destroy();
	});

	QUnit.test("forwarded - event from deep inner to outer", function (assert) {
		var oTextToggleButton = new composites.TextToggleButton();
		var fnFireTextChangedSpy = sinon.spy(composites.TextToggleButtonForwarded.prototype, "fireTextChanged");
		var oXMLComposite = new composites.TextToggleButtonForwarded({
			textToggleButton: oTextToggleButton
		});
		oXMLComposite.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act: Click on ToggleButton
		sap.ui.test.qunit.triggerTouchEvent("tap", oTextToggleButton.getAggregation("_content").getItems()[1].getDomRef());

		// assert
		assert.ok(fnFireTextChangedSpy.calledOnce);

		fnFireTextChangedSpy.restore();
		oXMLComposite.destroy();
	});

	QUnit.test("forwarded - event from inner to outer", function (assert) {
		var oXMLComposite = new composites.TextToggleButtonForwarded({
			textToggleButton: new composites.TextToggleButton()
		});
		oXMLComposite.placeAt("content");
		sap.ui.getCore().applyChanges();
		var done = assert.async();

		// Initial state of controls
		var oTextToggleButton = oXMLComposite.getAggregation("_content").getItems()[0].getContent();
		assert.equal(oTextToggleButton.getText(), "Default Text");
		var oToggleButton = oTextToggleButton.getAggregation("_content").getItems()[1];
		assert.equal(oToggleButton.getPressed(), false);

		// Click on ToggleButton
		sap.ui.test.qunit.triggerTouchEvent("tap", oToggleButton.getDomRef());

		assert.equal(oTextToggleButton.getText(), "On");
		assert.equal(oToggleButton.getPressed(), true);

		oXMLComposite.attachRefreshed(function () {
			assert.equal(oTextToggleButton.getText(), "Default Text");
			assert.equal(oToggleButton.getPressed(), false);
			done();
		});

		// Click on 'Refresh' button
		sap.ui.test.qunit.triggerTouchEvent("tap", oXMLComposite.getAggregation("_content").getItems()[1].getDomRef());

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
		var oXMLComposite = new composites.ForwardText();

		oXMLComposite.addTextItem(new sap.m.Text({
			text: "text1"
		}));
		oXMLComposite.insertTextItem(new sap.m.Text({
			text: "text0"
		}), 0);
		assert.equal(oXMLComposite.getTextItems().length, 2);

		oXMLComposite.removeTextItem(0);
		assert.equal(oXMLComposite.getTextItems().length, 1);

		oXMLComposite.removeAllTextItems();
		assert.equal(oXMLComposite.getTextItems().length, 0);

		oXMLComposite.destroy();
	});

	QUnit.test("Abstract", function (assert) {
		var oXMLComposite = new composites.ChildOfAbstract();
		oXMLComposite.placeAt("content");
		sap.ui.getCore().applyChanges();
		assert.ok(oXMLComposite);
		oXMLComposite.destroy();
	});

	QUnit.test("Test to check if we have an invalidate setting in the core", function (assert) {
		var oXMLComposite = new composites.TemplateTest();
		oXMLComposite.placeAt("content");
		var oMetadataPropertyText = oXMLComposite.getMetadata().getProperty("text");
		assert.strictEqual(oMetadataPropertyText.appData.invalidate, "template", "This test should fail once core also has an invalidate");
		oXMLComposite.destroy();
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: templating", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});
	//*********************************************************************************************
	sap.ui.define([
		"sap/ui/core/mvc/Controller"
	], function (Controller) {
		"use strict";
		return Controller.extend("composites.TestComponent", {});
	});
	sap.ui.define("my/composite/Component", [
		"sap/ui/core/UIComponent"
	], function (UIComponent) {
		return UIComponent.extend("my.composite.Component", {
			metadata: {
				rootView: "composites.TestComponent"
			},
			createContent: function () {
				sap.ui.core.util.XMLPreprocessor.plugIn(function (oNode, oVisitor) {
					sap.ui.core.XMLComposite.initialTemplating(oNode, oVisitor, "composites.LabelButtonTemplate");
				}, "composites", "LabelButtonTemplate");

				// For pre-templating we use here metadata model called "models.preprocessor". Via binding to
				// the property 'labelFirst' we can control if-condition in templating.
				return sap.ui.xmlview({
					async: false,
					viewContent: '<View height="100%" xmlns:m="sap.m" xmlns="sap.ui.core" xmlns:f="composites"> <m:VBox> <f:LabelButtonTemplate id="IDLabelButtonTemplate" label="{/label}" value="{/value}" labelFirst="{preprocessor>/labelFirst}"/></m:VBox></View>',
					preprocessors: {
						xml: {
							models: {
								preprocessor: new sap.ui.model.json.JSONModel({
									labelFirst: false,
									value: "preprocessor"
								})
							}
						}
					}
				});
			}
		});
	});

	QUnit.test("property", function (assert) {
		var fnInitialTemplatingSpy = sinon.spy(sap.ui.core.XMLComposite, "initialTemplating");

		var oComponentContainer = new sap.ui.core.ComponentContainer({
			component: new my.composite.Component()
		}).placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(fnInitialTemplatingSpy.calledOnce);

		var oView = oComponentContainer.getComponentInstance().getRootControl();
		var oXMLComposite = oView.byId("IDLabelButtonTemplate");

		var fnFragmentRetemplatingSpy = sinon.spy(oXMLComposite, "fragmentRetemplating");

		// Now we define another model in order to fill properties in the XMLComposite control
		oView.setModel(new sap.ui.model.json.JSONModel({
			label: "Click",
			value: "Me"
		}));

		assert.equal(fnFragmentRetemplatingSpy.called, false);
		// act: change the order to 'label' after 'button'
		oXMLComposite.setLabelFirst(false);
		this.clock.tick(500);

		assert.ok(fnFragmentRetemplatingSpy.calledOnce);

		assert.ok(oView);
		assert.equal(oView.$().find("div").find("span.sapMLabel" || "label.sapMLabel")[0].textContent, "Click");
		assert.equal(oView.$().find("div").find("button.sapMBtn")[0].textContent, "Me");

		assert.equal(oView.$().find(".IDLabelButtonTemplate").children().length, 2);
		assert.equal(oView.$().find(".IDLabelButtonTemplate").children()[0].firstChild.nodeName, "BUTTON");
		assert.ok(oView.$().find(".IDLabelButtonTemplate").children()[1].firstChild.nodeName, "LABEL" || "SPAN");

		// act: change the order to 'label' before 'button'
		oXMLComposite.setLabelFirst(true);
		this.clock.tick(500);

		assert.ok(oView);
		assert.equal(oView.$().find("div").find("span.sapMLabel" || "label.sapMLabel")[0].textContent, "Click");
		assert.equal(oView.$().find("div").find("button.sapMBtn")[0].textContent, "Me");

		assert.equal(oView.$().find(".IDLabelButtonTemplate").children().length, 2);
		assert.ok(oView.$().find(".IDLabelButtonTemplate").children()[0].firstChild.nodeName, "LABEL" || "SPAN");
		assert.equal(oView.$().find(".IDLabelButtonTemplate").children()[1].firstChild.nodeName, "BUTTON");

		oComponentContainer.destroy();
	});

	sap.ui.define([
		"sap/ui/core/mvc/Controller"
	], function (Controller) {
		"use strict";
		return Controller.extend("composites.TestComponent2", {});
	});
	sap.ui.define("my/composite2/Component", [
		"sap/ui/core/UIComponent", 'composites/Helper'
	], function (UIComponent, Helper) {
		return UIComponent.extend("my.composite2.Component", {
			Helper: Helper,
			metadata: {
				rootView: "composites.TestComponent2"
			},
			createContent: function () {
				sap.ui.core.util.XMLPreprocessor.plugIn(function (oNode, oVisitor) {
					sap.ui.core.XMLComposite.initialTemplating(oNode, oVisitor, "composites.LabelButtonsTemplate");
				}, "composites", "LabelButtonsTemplate");

				return sap.ui.xmlview({
					async: false,
					viewContent: '<View height="100%" xmlns:m="sap.m" xmlns="sap.ui.core" xmlns:f="composites"><m:VBox><f:LabelButtonsTemplate id="IDLabelButtonsTemplate" items="{path:&quot;preprocessor>/items&quot;}"/></m:VBox></View>',
					preprocessors: {
						xml: {
							models: {
								preprocessor: new sap.ui.model.json.JSONModel({
									items: [
										{
											text: "first"
										}, {
											text: 'second'
										}
									]
								})
							}
						}
					}
				});
			}
		});
	});

	//we want to use metadataContexts so we should still dicuss here
	/*	QUnit.test("aggregation with pretemplating model only", function(assert) {
			var oComponentContainer = new sap.ui.core.ComponentContainer({
				component: new my.composite2.Component()
			}).placeAt("content");
			sap.ui.getCore().applyChanges();
			this.clock.tick(500);
	
			var oView = oComponentContainer.getComponentInstance().getRootControl();
	
			assert.ok(oView);
			assert.equal(oView.$().find(".IDLabelButtonsTemplate").children().length, 4);
			assert.ok(oView.$().find(".IDLabelButtonsTemplate").children()[0].firstChild.nodeName === "LABEL" || "SPAN");
			assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[1].firstChild.nodeName, "BUTTON");
			assert.ok(oView.$().find(".IDLabelButtonsTemplate").children()[2].firstChild.nodeName === "LABEL" || "SPAN");
			assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[3].firstChild.nodeName, "BUTTON");
	
			// ER: this 'act' should work in the future
	
			// // act: change the order to 'label' after 'button'
			// oView.byId("IDLabelButtonsTemplate").setLabelFirst(false);
			// this.clock.tick(500);
			//
			// assert.equal(oView.$().find(".IDLabelButtonsTemplate").children().length, 4);
			// assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[0].firstChild.nodeName, "BUTTON");
			// assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[1].firstChild.nodeName, "LABEL");
			// assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[2].firstChild.nodeName, "BUTTON");
			// assert.equal(oView.$().find(".IDLabelButtonsTemplate").children()[3].firstChild.nodeName, "LABEL");
	
			oComponentContainer.destroy();
		});
	*/
	QUnit.module("clone");

	QUnit.test("simple", function (assert) {
		var oXMLComposite = new composites.TextToggleButton("Frag1");
		var sId;
		var iCount = 0;

		oXMLComposite.attachTextChanged(function (oEvent) {
			iCount++;
			sId = oEvent.oSource.getId();
		});

		var fnVBoxCloneSpy = sinon.spy(oXMLComposite.getAggregation("_content"), "clone");

		var oClone = oXMLComposite.clone("MyClone");
		assert.equal(oClone.getId(), "Frag1-MyClone", "XMLComposite cloned");
		var oContent = oClone.getAggregation("_content");
		assert.notOk(fnVBoxCloneSpy.called, "VBox clone function not called");
		assert.equal(oContent.getId(), "Frag1-MyClone--myVBox", "VBox created, not cloned");

		oXMLComposite.placeAt("content");
		oClone.placeAt("content");
		sap.ui.getCore().applyChanges();

		sap.ui.test.qunit.triggerTouchEvent("tap", oContent.getItems()[1].getDomRef());
		assert.equal(sId, "Frag1-MyClone", "Event fired on clone");
		assert.equal(iCount, 1, "Event fired only once");

		oXMLComposite.destroy();
		oClone.destroy();
	});

	QUnit.test("list", function (assert) {
		var oXMLComposite = new composites.TextList("Frag1", {
			texts: [
				new sap.ui.core.Item("I1", {
					key: "K1",
					text: "Text 1"
				}), new sap.ui.core.Item("I2", {
					key: "K2",
					text: "Text 2"
				}), new sap.ui.core.Item("I3", {
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
		beforeEach: function() {
			var Wrapper = sap.ui.core.XMLComposite.extend("Wrapper", {
				constructor: function (sId, mSettings) {
					sap.ui.core.XMLComposite.apply(this, arguments);
				},
				fragment: "composites.wrapper",
				renderer: "sap.ui.core.XMLCompositeRenderer"
			});
			this.oWrapper = new Wrapper("layout");
			this.oWrapper.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oWrapper.destroy();
		}
	});
	//*********************************************************************************************

	QUnit.test("default properties", function(assert) {
		assert.strictEqual(this.oWrapper.getHeight(), "", "Default height is undefined");
		assert.strictEqual(this.oWrapper.getWidth(), "100%", "Default width is 100%");
		assert.strictEqual(this.oWrapper.getDisplayBlock(), true, "Default displayBlock is true");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.XMLComposite: Wrapper properties", {
		beforeEach: function() {
			var Wrapper = sap.ui.core.XMLComposite.extend("Wrapper", {
				constructor: function (sId, mSettings) {
					sap.ui.core.XMLComposite.apply(this, arguments);
				},
				fragment: "composites.wrapper",
				renderer: "sap.ui.core.XMLCompositeRenderer"
			});
			this.oWrapper = new Wrapper("layout");
			this.oWrapper.placeAt("content");
			this.oWrapper.setHeight("100%");
			this.oWrapper.setWidth("200px");
			this.oWrapper.setDisplayBlock(false);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oWrapper.destroy();
		}
	});
	//*********************************************************************************************

	QUnit.test("properties", function(assert) {
		assert.strictEqual(this.oWrapper.getHeight(), "100%", "Height is 100%");
		assert.strictEqual(this.oWrapper.getWidth(), "200px", "Width is 200px");
		assert.strictEqual(this.oWrapper.getDisplayBlock(), false, "DisplayBlock is false");

		this.oWrapper.rerender();

		assert.strictEqual(this.oWrapper.getHeight(), "100%", "Height is 100%");
		assert.strictEqual(this.oWrapper.getWidth(), "200px", "Width is 200px");
		assert.strictEqual(this.oWrapper.getDisplayBlock(), false, "DisplayBlock is false");
	});
});
