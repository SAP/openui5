/*!
 * ${copyright}
 */
setBlanketFilters("sap/ui/core/FragmentControl.js");

/**
 * setBlanketFilters
 * @param sFilters comma separated strings to filter the paths for blanket
 */
function setBlanketFilters(sFilters) {
	if (top === window) { //only in local environment
		top["blanket.filter.only"] = sFilters;
	}
}

sap.ui.require([
	"jquery.sap.global"
], function(jQuery) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";
	jQuery.sap.registerModulePath("fragments", location.pathname.substring(0, location.pathname.lastIndexOf("/")) + "/fragments");
	jQuery.sap.require("fragments.SimpleText");
	jQuery.sap.require("fragments.TextButton");
	jQuery.sap.require("fragments.TextList");
	jQuery.sap.require("fragments.ForwardText");
	jQuery.sap.require("fragments.Field");
	jQuery.sap.require("fragments.TemplateTest");
	jQuery.sap.require("fragments.ChildOfAbstract");
	jQuery.sap.require("fragments.TextToggleButton");
	jQuery.sap.require("fragments.TextToggleButtonNested");
	jQuery.sap.require("fragments.TextToggleButtonForwarded");

	//*********************************************************************************************
	QUnit.module("sap.ui.core.FragmentControl: Simple Text Fragment Control", {
		beforeEach: function() {
			this.oFragmentControl = new fragments.SimpleText();
			this.oFragmentControl.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oFragmentControl.destroy();
		}
	});
	//*********************************************************************************************

	QUnit.test("destroy", function(assert) {
		var oInnerText = this.oFragmentControl.getAggregation("_content");
		this.oFragmentControl.destroy();

		assert.strictEqual(this.oFragmentControl.bIsDestroyed, true, "The fragment control is destroyed");
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

	QUnit.test("properties", function(assert) {
		assert.strictEqual(this.oFragmentControl.getText(), "Default Text", "Default Text is set");
		assert.strictEqual(fragments.SimpleText.getMetadata().getProperty("text").defaultValue, "Default Text", "Default Text is set");
		assert.strictEqual(this.oFragmentControl.setText("Hello"), this.oFragmentControl, "Instance returned");
		assert.strictEqual(this.oFragmentControl.getText(), "Hello", "Text is set");
	});

	QUnit.test("inner control", function(assert) {
		var oInnerText = this.oFragmentControl.getAggregation("_content");
		assert.ok(oInnerText instanceof sap.m.Text, "_content is set correctly");
		assert.strictEqual(oInnerText.getParent(), this.oFragmentControl, "Parent is the fragment control");
		assert.strictEqual(oInnerText.getText(), this.oFragmentControl.getText(), "Text is propagated");
		assert.strictEqual(oInnerText.getBinding("text").getModel(), this.oFragmentControl._getManagedObjectModel(), "_getManagedObjectModel is set and propagated correctly");
		assert.strictEqual(oInnerText.getBinding("text").getContext().getProperty(), this.oFragmentControl, "Root node in ManagedObjectModel is the FragmentControl");
		assert.strictEqual(this.oFragmentControl._getManagedObjectModel().getRootObject(), this.oFragmentControl, "RootObject in ManagedObjectModel is the FragmentControl");
		assert.strictEqual(oInnerText.getVisible(), true, "Inner visible");
		// notice: oInnerText._getPropertiesToPropagate().oModels.$this === oInnerText._getPropertiesToPropagate().oBindingContexts.$this.oModel
		//TODO: Write additional test when another controlTreeModel is set on Fragement / should be filtered out!
		//TODO: Write additional test when another "regular" model is set on Fragment / should survice!
		//TODO: Write additional test when anpther "regular" model is set on inner control / should survive!
		assert.strictEqual(oInnerText._getPropertiesToPropagate().oBindingContexts["$this"].oModel, this.oFragmentControl._getManagedObjectModel(), "ControlTree Model is correctly propagated");

		this.oFragmentControl.setText("");
		assert.strictEqual(oInnerText.getVisible(), false, "Inner not visible due to condition in SimpleText.control.xml");
	});

	QUnit.test("data binding", function(assert) {
		var oInnerText = this.oFragmentControl.getAggregation("_content");

		var oGlobalModel = new sap.ui.model.json.JSONModel({
			text: "Global Model Text"
		});
		var oLocalModel = new sap.ui.model.json.JSONModel({
			text: "Local Model Text"
		});

		this.oFragmentControl.bindProperty("text", {
			path: "model>/text"
		});
		this.oFragmentControl.setText("Check");
		assert.strictEqual(oInnerText.getText(), "Check", "Text is not yet propagated");

		//global model
		sap.ui.getCore().setModel(oGlobalModel, "model");
		assert.strictEqual(oInnerText.getText(), "Global Model Text", "Text is set from the global model");

		this.oFragmentControl.setText("SetModelTextGlobal");
		assert.strictEqual(oGlobalModel.getProperty("/text"), "SetModelTextGlobal", "Text is set via 2 way binding to the model");

		this.oFragmentControl.unbindProperty("text");
		assert.strictEqual(oInnerText.getText(), "Default Text", "Text is not propagated anymore and is the Default Text again");

		this.oFragmentControl.bindProperty("text", {
			path: "model>/text"
		});
		assert.strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is again bound");
		sap.ui.getCore().setModel(null, "model");
		assert.strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is not propagated anymore but stays SetModelText because its still bound???");

		//local model
		this.oFragmentControl.setModel(oLocalModel, "model");
		assert.strictEqual(oInnerText.getText(), "Local Model Text", "Text is set from the local model");

		//set global model again
		sap.ui.getCore().setModel(oGlobalModel, "model");
		assert.strictEqual(oInnerText.getText(), "Local Model Text", "Text is still set from local model");

		this.oFragmentControl.setText("SetModelText");
		assert.strictEqual(oLocalModel.getProperty("/text"), "SetModelText", "Text is set via 2 way binding to the local model");

		this.oFragmentControl.unbindProperty("text");
		assert.strictEqual(oInnerText.getText(), "Default Text", "Text is not propagated anymore and is the Default Text again");

		this.oFragmentControl.bindProperty("text", {
			path: "model>/text"
		});
		assert.strictEqual(oInnerText.getText(), "SetModelText", "Text is again bound");
		this.oFragmentControl.setModel(null, "model");

		//set the global model again
		sap.ui.getCore().setModel(oGlobalModel, "model");
		assert.strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is now propagated from oGlobalModel");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.FragmentControl: ForwardText Fragment Control with single aggregation", {
		beforeEach: function() {
			this.oText = new sap.m.Text({
				text: "text"
			});
			this.oFragmentControl = new fragments.ForwardText({
				text: this.oText
			});
			this.oFragmentControl.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oFragmentControl.destroy();
		}
	});
	//*********************************************************************************************

	QUnit.test("destroy", function(assert) {
		// notice that oFragmentControl.getAggregation("_content").getItems()[1] is the FragmentProxy object, and that ._oContent
		// logically is the select aggregation (which is, however, empty since in the FragmentProxy we have _doesNotRequireFactory: true)!
		var oInnerText = this.oFragmentControl.getAggregation("_content").getItems()[1]._oContent;

		this.oFragmentControl.destroy();
		assert.strictEqual(this.oFragmentControl.bIsDestroyed, true, "The fragment control is destroyed");
		assert.strictEqual(oInnerText.bIsDestroyed, true, "The text is destroyed");
	});

	QUnit.test("destroy aggregation control", function(assert) {
		this.oText.destroy();
		assert.strictEqual(this.oFragmentControl.getText(), null, "The text is destroyed and the forwarded is null");
		assert.strictEqual(this.oText.getParent(), undefined, "Inner Control has no parent anymore"); //remember: oInnerText===oText
		assert.strictEqual(sap.ui.getCore().byId(this.oText.getId()), undefined, "Inner Control is destroyed");
		try {
			this.oText.placeAt("content");
			assert.ok(false);
		} catch (ex) {
			assert.ok(true);
		}
	});

	QUnit.test("aggregation singular", function(assert) {
		// notice that oFragmentControl.getAggregation("_content").getItems()[1] is the FragmentProxy object, and that ._oContent
		// logically is the select aggregation (which is, however, empty since in the FragmentProxy we have _doesNotRequireFactory: true)!
		var oInnerText = this.oFragmentControl.getAggregation("_content").getItems()[1]._oContent;

		assert.strictEqual(this.oFragmentControl.setText(this.oText), this.oFragmentControl, "The fragment control was returned after setText"); //check the inner control
		assert.strictEqual(oInnerText, this.oText, "Aggregation is forwarded to inner");
		assert.strictEqual(this.oText.getParent(), this.oFragmentControl.getAggregation("_content"), "The inner vbox is the parent");
	});

	QUnit.test("data binding", function(assert) {
		// notice that oFragmentControl.getAggregation("_content").getItems()[1] is the FragmentProxy object, and that ._oContent
		// logically is the select aggregation (which is, however, empty since in the FragmentProxy we have _doesNotRequireFactory: true)!
		var oInnerText = this.oFragmentControl.getAggregation("_content").getItems()[1]._oContent;
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
	QUnit.module("sap.ui.core.FragmentControl: ForwardText Fragment Control with multi aggregation", {
		beforeEach: function() {
			this.aTexts = [];
			for (var i = 0; i < 5; i++) {
				this.aTexts.push(new sap.m.Text({
					text: "text" + i
				}));
			}
			this.oFragmentControl = new fragments.ForwardText({
				textItems: this.aTexts
			});
			this.oFragmentControl.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oFragmentControl.destroy();
		}
	});
	//*********************************************************************************************

	QUnit.test("destroy", function(assert) {
		var aInnerItems = this.oFragmentControl.getAggregation("_content").getItems()[0].getItems();

		this.oFragmentControl.destroy();
		assert.strictEqual(this.oFragmentControl.bIsDestroyed, true, "The fragment control is destroyed");
		for (var i = 0; i < 5; i++) {
			assert.strictEqual(aInnerItems[i].bIsDestroyed, true, "The text is destroyed");
		}
	});

	QUnit.test("destroy aggregation controls", function(assert) {
		var oInnerVBox = this.oFragmentControl.getAggregation("_content").getItems()[0];
		for (var i = 0; i < 5; i++) {
			this.aTexts[i].destroy();
			// the new i'th element is the former i+1'th
			assert.strictEqual(this.oFragmentControl.getTextItems()[0], this.aTexts[i + 1], "The text is destroyed and textItems has dropped that element");
			for (var j = 0; j < i; j++) {
				assert.strictEqual(this.oFragmentControl.getTextItems()[j], oInnerVBox.getItems()[j], "Forwarding has reflected the destroy correctly");
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

	QUnit.test("data binding", function(assert) {
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

		this.oFragmentControl.bindAggregation("textItems", {
			path: "model>/texts",
			template: new sap.m.Text({
				text: {
					path: "model>text"
				}
			})
		});

		// model / -
		sap.ui.getCore().setModel(oModel, "model");
		assert.strictEqual(this.oFragmentControl.getTextItems()[0].getText(), "Model Text0", "Text is set from model");

		// Rendering Parent inner <VBox>
		assert.strictEqual(this.oFragmentControl.getTextItems()[0].getParent(), this.oFragmentControl.getAggregation("_content").getItems()[0], "Rendering Parent is the inner VBox control");

		// null / -
		sap.ui.getCore().setModel(null, "model");
		assert.strictEqual(this.oFragmentControl.getTextItems().length, 0, "Unbound global model");

		// null / model
		this.oFragmentControl.setModel(oModel, "model");
		assert.strictEqual(this.oFragmentControl.getTextItems()[0].getText(), "Model Text0", "Text is set from the local model");

		// null / null
		this.oFragmentControl.setModel(null, "model");
		assert.strictEqual(this.oFragmentControl.getTextItems().length, 0, "Unbound model");

		// model / null
		sap.ui.getCore().setModel(oModel, "model");
		assert.strictEqual(this.oFragmentControl.getTextItems()[0].getText(), "Model Text0", "Text is set from global model");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.FragmentControl: Fragment Control in Fragment Control", {
		beforeEach: function() {
			this.oFragmentControl = new fragments.Field();
			this.oFragmentControl.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oFragmentControl.destroy();
		}
	});
	//*********************************************************************************************

	QUnit.test("destroy", function(assert) {
		var oInnerBox = this.oFragmentControl.getAggregation("_content");
		var oInnerText = this.oFragmentControl.getAggregation("_content").getItems()[0].getAggregation("_content");
		var oInnerInput = this.oFragmentControl.getAggregation("_content").getItems()[1];

		// act,
		this.oFragmentControl.destroy();

		// assert
		assert.strictEqual(this.oFragmentControl.getAggregation("_content"), null);
		assert.strictEqual(this.oFragmentControl.bIsDestroyed, true, "The fragment control is destroyed");
		assert.strictEqual(oInnerBox.bIsDestroyed, true, "The box is destroyed");
		assert.strictEqual(oInnerText.bIsDestroyed, true, "The text is destroyed");
		assert.strictEqual(oInnerInput.bIsDestroyed, true, "The input is destroyed");
	});

	QUnit.test("destroy aggregation control", function(assert) {
		var oInnerText = this.oFragmentControl.getAggregation("_content").getItems()[0].getAggregation("_content");
		var oInnerInput = this.oFragmentControl.getAggregation("_content").getItems()[1];

		oInnerText.destroy();
		oInnerInput.destroy();

		assert.strictEqual(this.oFragmentControl.getText(), "Default Text", "The text is destroyed but the property value in model is still remain");
		assert.strictEqual(this.oFragmentControl.getValue(), "Default Value", "The value is destroyed but the property value in model is still remain");
	});

	QUnit.test("properties", function(assert) {
		assert.strictEqual(this.oFragmentControl.getValue(), "Default Value", "Default value is set");
		assert.strictEqual(this.oFragmentControl.getText(), "Default Text", "Default value of inner control does not shine through to fragment control"); // TODO ER: es scheint durch!

		var oInnerText = this.oFragmentControl.getAggregation("_content").getItems()[0].getAggregation("_content");
		oInnerText.setText("inner Text");
		assert.strictEqual(this.oFragmentControl.getText(), "inner Text", "Text of 2nd level inner control shines through to fragment control");

		this.oFragmentControl.setText("outer Text");
		assert.strictEqual(oInnerText.getText(), "outer Text", "Text of fragment control is propagated to 2nd level inner control");
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.FragmentControl: eventing", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});
	//*********************************************************************************************

	QUnit.test("inner", function(assert) {
		var fnFirePressHandlerSpy = sinon.spy(fragments.TextButton.prototype, "onPress");
		var oFragmentControl = new fragments.TextButton();

		oFragmentControl.getAggregation("_content").getItems()[1].firePress();
		assert.ok(fnFirePressHandlerSpy.calledOnce);

		fnFirePressHandlerSpy.restore();
		oFragmentControl.destroy();
	});

	QUnit.test("outer", function(assert) {
		var oFragmentControl = new fragments.TextToggleButton();
		oFragmentControl.placeAt("content");
		sap.ui.getCore().applyChanges();
		var done = assert.async();

		oFragmentControl.attachTextChanged(function() {
			assert.equal(oFragmentControl.getText(), "On");
			assert.equal(oFragmentControl.getAggregation("_content").getItems()[0].getText(), "On");
			assert.equal(oFragmentControl.getAggregation("_content").getItems()[1].getPressed(), true);
			done();
		});
		sap.ui.test.qunit.triggerTouchEvent("tap", oFragmentControl.getAggregation("_content").getItems()[1].getDomRef());
		oFragmentControl.destroy();
	});

	QUnit.test("nested", function(assert) {
		var oFragmentControl = new fragments.TextToggleButtonNested();
		oFragmentControl.placeAt("content");
		sap.ui.getCore().applyChanges();
		var done = assert.async();

		// Initial state of the nested controls
		assert.equal(oFragmentControl.getAggregation("_content").getItems()[0].getText(), "Default Text", "property 'text' of fragment control");
		assert.equal(oFragmentControl.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[0].getText(), "Default Text", "property 'text' of sap.m.Text");
		assert.equal(oFragmentControl.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getPressed(), false);

		// Click on ToggleButton
		sap.ui.test.qunit.triggerTouchEvent("tap", oFragmentControl.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getDomRef());

		assert.equal(oFragmentControl.getAggregation("_content").getItems()[0].getText(), "On", "property 'text' of fragment control");
		assert.equal(oFragmentControl.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[0].getText(), "On", "property 'text' of sap.m.Text");
		assert.equal(oFragmentControl.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getPressed(), true);

		oFragmentControl.attachRefreshed(function() {
			assert.equal(oFragmentControl.getAggregation("_content").getItems()[0].getText(), "Default Text", "property 'text' of fragment control");
			assert.equal(oFragmentControl.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[0].getText(), "Default Text", "property 'text' of sap.m.Text");
			assert.equal(oFragmentControl.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].getPressed(), false);
			done();
		});

		// Click on 'Refresh' button
		sap.ui.test.qunit.triggerTouchEvent("tap", oFragmentControl.getAggregation("_content").getItems()[1].getDomRef());

		oFragmentControl.destroy();
	});

	QUnit.test("forwarded", function(assert) {
		var oFragmentControl = new fragments.TextToggleButtonForwarded({
			textToggleButton: new fragments.TextToggleButton()
		});
		oFragmentControl.placeAt("content");
		sap.ui.getCore().applyChanges();
		var done = assert.async();

		// Initial state of the forwarded controls
		assert.equal(oFragmentControl.getAggregation("_content").getItems()[0]._oContent.getAggregation("_content").getItems()[0].getText(), "Default Text");
		assert.equal(oFragmentControl.getAggregation("_content").getItems()[0]._oContent.getAggregation("_content").getItems()[1].getPressed(), false);

		// Click on ToggleButton
		sap.ui.test.qunit.triggerTouchEvent("tap", oFragmentControl.getAggregation("_content").getItems()[0]._oContent.getAggregation("_content").getItems()[1].getDomRef());

		assert.equal(oFragmentControl.getAggregation("_content").getItems()[0]._oContent.getAggregation("_content").getItems()[0].getText(), "On");
		assert.equal(oFragmentControl.getAggregation("_content").getItems()[0]._oContent.getAggregation("_content").getItems()[1].getPressed(), true);

		oFragmentControl.attachRefreshed(function() {
			assert.equal(oFragmentControl.getAggregation("_content").getItems()[0]._oContent.getAggregation("_content").getItems()[0].getText(), "Default Text");
			assert.equal(oFragmentControl.getAggregation("_content").getItems()[0]._oContent.getAggregation("_content").getItems()[1].getPressed(), false);
			done();
		});

		// Click on 'Refresh' button
		sap.ui.test.qunit.triggerTouchEvent("tap", oFragmentControl.getAggregation("_content").getItems()[1].getDomRef());

		oFragmentControl.destroy();
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.core.FragmentControl", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});
	//*********************************************************************************************

	QUnit.test("Aggregation", function(assert) {
		var oFragmentControl = new fragments.ForwardText();

		oFragmentControl.addTextItem(new sap.m.Text({
			text: "text1"
		}));
		oFragmentControl.insertTextItem(new sap.m.Text({
			text: "text0"
		}), 0);
		assert.equal(oFragmentControl.getTextItems().length, 2);

		oFragmentControl.removeTextItem(0);
		assert.equal(oFragmentControl.getTextItems().length, 1);

		oFragmentControl.removeAllTextItems();
		assert.equal(oFragmentControl.getTextItems().length, 0);

		oFragmentControl.destroy();
	});

	QUnit.test("Abstract", function(assert) {
		var oFragmentControl = new fragments.ChildOfAbstract();
		oFragmentControl.placeAt("content");
		sap.ui.getCore().applyChanges();
		assert.ok(oFragmentControl);
		oFragmentControl.destroy();
	});

	QUnit.test("Test to check if we have an invalidate setting in the core", function(assert) {
		var oFragmentControl = new fragments.TemplateTest();
		oFragmentControl.placeAt("content");
		var oMetadataPropertyText = oFragmentControl.getMetadata().getProperty("text");
		assert.strictEqual(oMetadataPropertyText.appData.invalidate, "template", "This test should fail once core also has an invalidate");
		oFragmentControl.destroy();
	});

	QUnit.test("clone", function(assert) {
		var oFragmentControl = new fragments.TextToggleButton("Frag1");
		var sId;
		var iCount = 0;

		oFragmentControl.attachTextChanged(function(oEvent) {
			iCount++;
			sId = oEvent.oSource.getId();
		});

		var fnVBoxCloneSpy = sinon.spy(oFragmentControl.getAggregation("_content"), "clone");

		var oClone = oFragmentControl.clone("MyClone");
		assert.equal(oClone.getId(), "Frag1-MyClone", "FragmentControl cloned");
		var oContent = oClone.getAggregation("_content");
		assert.notOk(fnVBoxCloneSpy.called, "VBox clone function not called");
		assert.equal(oContent.getId(), "Frag1-MyClone--myVBox", "VBox created, not cloned");

		oFragmentControl.placeAt("content");
		oClone.placeAt("content");
		sap.ui.getCore().applyChanges();

		sap.ui.test.qunit.triggerTouchEvent("tap", oContent.getItems()[1].getDomRef());
		assert.equal(sId, "Frag1-MyClone", "Event fired on clone");
		assert.equal(iCount, 1, "Event fired only once");

		oFragmentControl.destroy();
		oClone.destroy();
	});

	QUnit.test("clone list", function(assert) {
		var oFragmentControl = new fragments.TextList("Frag1", {
			texts: [ new sap.ui.core.Item("I1", {key: "K1", text: "Text 1"}),
			         new sap.ui.core.Item("I2", {key: "K2", text: "Text 2"}),
			         new sap.ui.core.Item("I3", {key: "K3", text: "Text 3"})
			        ]
		});

		var oClone = oFragmentControl.clone("MyClone");
		assert.equal(oClone.getId(), "Frag1-MyClone", "FragmentControl cloned");
		var aItems = oClone.getTexts();
		assert.equal(aItems.length, 3, "Clone has 3 Items");
		assert.equal(aItems[0].getId(), "I1-MyClone", "Item cloned");

		var aTexts = oClone.getAggregation("_content").getItems()[1].getItems();
		assert.equal(aTexts.length, 3, "Clone has 3 Texts");

		oFragmentControl.destroy();
		oClone.destroy();
	});

	});
