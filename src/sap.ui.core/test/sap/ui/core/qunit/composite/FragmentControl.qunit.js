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
], function(jQuery)
{
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

	//*********************************************************************************************
	QUnit.module("sap.ui.core.FragmentControl",
	{
		beforeEach: function() {},

		afterEach: function() {},
		before: function() {

		},
		after: function() {

		}
	});

	//*********************************************************************************************

    QUnit.test("Test to check if we have an invalidate setting in the core", function(assert) {
        var oTemplateTest = new fragments.TemplateTest();
        oTemplateTest.placeAt("content");
        var oMetadataPropertyText = oTemplateTest.getMetadata().getProperty("text");
        strictEqual(oMetadataPropertyText.appData.invalidate, "template", "This test should fail once core also has an invalidate");
    });

	QUnit.test("Simple Text Fragment Control - properties", function(assert)
	{
		//create a SimpleText FragmentControl
		var oSimpleText = new fragments.SimpleText();
		oSimpleText.placeAt("content");
		strictEqual(oSimpleText.getText(), fragments.SimpleText.getMetadata().getProperty("text").defaultValue, "Default Text is set");
		strictEqual(oSimpleText.setText("Hello"), oSimpleText, "Instance returned");
		strictEqual(oSimpleText.getText(), "Hello", "Text is set");

		//check the inner control
		var oInnerText = oSimpleText.getAggregation("_content");
		strictEqual(oInnerText.getMetadata()._sClassName, "sap.m.Text", "_content is set correctly");
		strictEqual(oInnerText.getParent(), oSimpleText, "Parent is set");
	//	strictEqual(oInnerText.getAPIParent(), oSimpleText, "APIParent is set");
		strictEqual(oInnerText.getText(), oSimpleText.getText(), "Text is propagated");
		strictEqual(oInnerText.getBinding("text").getModel(), oSimpleText._getManagedObjectModel(), "_getManagedObjectModel is set and propagated correctly");
		strictEqual(oInnerText.getBinding("text").getContext().getProperty(), oSimpleText, "Root node in ManagedObjectModel is the FragmentControl");
		strictEqual(oSimpleText._getManagedObjectModel().getRootObject(), oSimpleText, "RootObject in ManagedObjectModel is the FragmentControl");
		strictEqual(oInnerText.getVisible(), true, "Inner visible");
		// notice: oInnerText._getPropertiesToPropagate().oModels.$this === oInnerText._getPropertiesToPropagate().oBindingContexts.$this.oModel
		//TODO: Write additional test when another controlTreeModel is set on Fragement / should be filtered out!
		//TODO: Write additional test when another "regular" model is set on Fragment / should survice!
		//TODO: Write additional test when anpther "regular" model is set on inner control / should survive!
		strictEqual(oInnerText._getPropertiesToPropagate().oBindingContexts["$this"].oModel, oSimpleText._getManagedObjectModel(), "ControlTree Model is correctly propagated");

		oSimpleText.setText("");
		strictEqual(oInnerText.getVisible(), false, "Inner not visible");

		//with data binding
		var oGlobalModel = new sap.ui.model.json.JSONModel(
		{
			text: "Global Model Text"
		});
		oSimpleText.bindProperty("text",
		{
			path: "model>/text"
		});
		oSimpleText.setText("Check");
		strictEqual(oInnerText.getText(), "Check", "Text is not yet propagated");

		//global model
		sap.ui.getCore().setModel(oGlobalModel, "model");
		strictEqual(oInnerText.getText(), "Global Model Text", "Text is set from the global model");

		oSimpleText.setText("SetModelTextGlobal");
		strictEqual(oGlobalModel.getProperty("/text"), "SetModelTextGlobal", "Text is set via 2 way binding to the model");

		oSimpleText.unbindProperty("text");
		strictEqual(oInnerText.getText(), "Default Text", "Text is not propagated anymore and is the Default Text again");

		oSimpleText.bindProperty("text",
		{
			path: "model>/text"
		});
		strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is again bound");
		sap.ui.getCore().setModel(null, "model");
		strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is not propagated anymore but stays SetModelText because its still bound???");

		//local model
		var oLocalModel = new sap.ui.model.json.JSONModel(
		{
			text: "Local Model Text"
		});
		oSimpleText.setModel(oLocalModel, "model");
		strictEqual(oInnerText.getText(), "Local Model Text", "Text is set from the local model");

		//set global model again
		sap.ui.getCore().setModel(oGlobalModel, "model");
		strictEqual(oInnerText.getText(), "Local Model Text", "Text is still set from local model");

		oSimpleText.setText("SetModelText");
		strictEqual(oLocalModel.getProperty("/text"), "SetModelText", "Text is set via 2 way binding to the local model");

		oSimpleText.unbindProperty("text");
		strictEqual(oInnerText.getText(), "Default Text", "Text is not propagated anymore and is the Default Text again");

		oSimpleText.bindProperty("text",
		{
			path: "model>/text"
		});
		strictEqual(oInnerText.getText(), "SetModelText", "Text is again bound");
		oSimpleText.setModel(null, "model");

		//set the global model again
		sap.ui.getCore().setModel(oGlobalModel, "model");
		strictEqual(oInnerText.getText(), "SetModelTextGlobal", "Text is now propagated from oGlobalModel");

		//parent
		strictEqual(oInnerText.getParent(), oSimpleText, "Parent is the fragment control");
	//	strictEqual(oInnerText.getAPIParent(), oSimpleText, "APIParent is the fragment control");

		//destroy
		oSimpleText.destroy();
		var sId = oInnerText.getId();
		strictEqual(oInnerText.getParent(), undefined, "Inner Control has no parent anymore");
		strictEqual(sap.ui.getCore().byId(sId), undefined, "Inner Control is destroyed");
		try
		{
			oInnerText.placeAt("content");
			strictEqual(0, 1, "This is not supposed to happen");
		}
		catch (ex)
		{
			strictEqual(ex, ex, "Inner Control cannot be used anymore (" + ex.message + ")");
		}
	});

	QUnit.test("ForwardText Fragment Control - aggregation singular", function(assert)
	{
		var oForwardText = new fragments.ForwardText();
		oForwardText.placeAt("content");
		var oText = new sap.m.Text(
		{
			text: "text"
		});
		strictEqual(oForwardText.setText(oText), oForwardText, "The fragment control was returned after setText"); //check the inner control

		// notice that oForwardText.getAggregation("_content").getItems()[1] is the FragmentProxy object, and that ._oContent
		// logically is the select aggregation (which is, however, empty since in the FragmentProxy we have _doesNotRequireFactory: true)!
		var oInnerText = oForwardText.getAggregation("_content").getItems()[1]._oContent;
		strictEqual(oInnerText, oText, "Aggregation is forwarded to inner");

		//with data binding
		var oModel = new sap.ui.model.json.JSONModel(
		{
			text: "Model Text"
		});
		oText.bindProperty("text",
		{
			path: "model>/text"
		});
		oText.setText("Check");
		strictEqual(oInnerText.getText(), "Check", "Text is not yet propagated");

		oText.setModel(oModel, "model");
		strictEqual(oInnerText.getText(), "Model Text", "Text is propagated");

		oText.setText("SetModelText");
		strictEqual(oModel.getProperty("/text"), "SetModelText", "Text is set via 2 way binding to the model");

		oInnerText.setText("SetModelText2");
		strictEqual(oModel.getProperty("/text"), "SetModelText2", "Text is set via 2 way binding to the model from the innerText");

		oText.unbindProperty("text");
		strictEqual(oInnerText.getText(), "", "Text is not propagated anymore and is the Default Text again");

		oText.bindProperty("text",
		{
			path: "model>/text"
		});
		strictEqual(oInnerText.getText(), "SetModelText2", "Text is again bound");

		//parents
		strictEqual(oText.getParent(), oForwardText.getAggregation("_content"), "The inner vbox is the parent");
	//	strictEqual(oText.getAPIParent(), oForwardText, "The fragment control is the APIParent");

		//destroy
		oText.destroy();
		var sId = oText.getId();
		strictEqual(oForwardText.getText(), null, "The text is destroyed and the forwarded is null");
		strictEqual(oText.getParent(), undefined, "Inner Control has no parent anymore"); //remember: oInnerText===oText
		strictEqual(sap.ui.getCore().byId(sId), undefined, "Inner Control is destroyed");
		try
		{
			oText.placeAt("content");
		}
		catch (ex)
		{
			strictEqual(ex, ex, "Inner Control cannot be used anymore (" + ex.message + ")");
		}
	});

	QUnit.test("ForwardText Fragment Control - aggregation multi", function(assert)
	{
		var oForwardText = new fragments.ForwardText();
		oForwardText.placeAt("content");
		var aTexts = [];

		for (var i = 0; i < 5; i++)
		{
			var oText = new sap.m.Text(
			{
				text: "text" + i
			});
			aTexts.push(oText);
			oForwardText.addTextItem(oText);
		}
		for (var i = 0; i < 5; i++)
		{
			//parents
			var oText = aTexts[i];
			strictEqual(oText.getParent(), oForwardText.getAggregation("_content").getItems()[0], "The inner vbox is the parent");
	//	strictEqual(oText.getAPIParent(), oForwardText, "The fragment control is the APIParent");
		}
		//destroy
		var oInnerVBox = oForwardText.getAggregation("_content").getItems()[0]
		for (var i = 0; i < 5; i++)
		{
			var oText = aTexts[i];
			var sId = oText.getId();
			oText.destroy();
			// the new i'th element is the former i+1'th
			strictEqual(oForwardText.getTextItems()[0], aTexts[i + 1], "The text is destroyed and textItems has dropped that element");
			for (var j = 0; j < i; j++)
			{
				strictEqual(oForwardText.getTextItems()[j], oInnerVBox.getItems()[j], "Forwarding has reflected the destroy correctly");
			}
			strictEqual(oText.getParent(), undefined, "Inner Control has no parent anymore");
			strictEqual(sap.ui.getCore().byId(sId), undefined, "Inner Control is destroy");
			try
			{
				oText.placeAt("content");
			}
			catch (ex)
			{
				strictEqual(ex, ex, "Inner Control cannot be used anymore (" + ex.message + ")");
			}
		}

		//with data binding
		var oModel = new sap.ui.model.json.JSONModel(
		{
			texts: [
			{
				text: "Model Text0"
			},
			{
				text: "Model Text1"
			},
			{
				text: "Model Text2"
			},
			{
				text: "Model Text3"
			},
			{
				text: "Model Text4"
			}]
		});

		oForwardText.bindAggregation("textItems",
		{
			path: "model>/texts",
			template: new sap.m.Text(
			{
				text:
				{
					path: "model>text"
				}
			})
		});

		// model / -
		sap.ui.getCore().setModel(oModel, "model");
		strictEqual(oForwardText.getTextItems()[0].getText(), "Model Text0", "Text is set from model");

		// Rendering Parent inner <VBox>
		strictEqual(oForwardText.getTextItems()[0].getParent(), oForwardText.getAggregation("_content").getItems()[0], "Rendering Parent is the inner VBox control");

		// item0 <VBox> FragmentProxy
		// strictEqual(oForwardText.getTextItems()[0].getAPIParent(), oForwardText, "APIParent is the forwardText control");

		// null / -
		sap.ui.getCore().setModel(null, "model");
		strictEqual(oForwardText.getTextItems().length, 0, "Unbound global model");

		// null / model
		oForwardText.setModel(oModel, "model");
		strictEqual(oForwardText.getTextItems()[0].getText(), "Model Text0", "Text is set from the local model");

		// null / null
		oForwardText.setModel(null, "model");
		strictEqual(oForwardText.getTextItems().length, 0, "Unbound model");

		// model / null
		sap.ui.getCore().setModel(oModel, "model");
		strictEqual(oForwardText.getTextItems()[0].getText(), "Model Text0", "Text is set from global model");
	});

	QUnit.test("Fragment Control - eventing", function(assert)
	{
		var fnFirePressHandlerSpy = sinon.spy(fragments.TextButton.prototype, "_handlePress");

		var oTextButton = new fragments.TextButton();
		var oInnerButton = oTextButton.getAggregation("_content").getItems()[1];

		oInnerButton.firePress(
		{
			payload: "my payload"
		});

		assert.ok(fnFirePressHandlerSpy.calledOnce);

		// event payload are short-living - perhaps nicer if hook in spy could grab event payload so that we can check with spy what is was -
		// for now we simply park the content in an instance variable "payload"
		assert.equal(oTextButton.payload, "my payload");

		fnFirePressHandlerSpy.restore();
	});

	//TODO: 	- aggregation + events
	QUnit.test("Fragment Control in Fragment Control - properties", function(assert)
	{
		var oField = new fragments.Field();
		oField.placeAt("content");

		strictEqual(oField.getValue(), fragments.Field.getMetadata().getProperty("value").defaultValue, "Default value is set");
		// strictEqual(oField.getText(), fragments.SimpleText.getMetadata().getProperty("text").defaultValue, "Default value of inner control shines through to fragment control");  --> no!
		strictEqual(oField.getText(), fragments.Field.getMetadata().getProperty("text").defaultValue, "Default value of inner control does not shine through to fragment control");

		var oInnerText = oField.getAggregation("_content").getItems()[0].getAggregation("_content");
		oInnerText.setText("inner Text");
		strictEqual(oField.getText(), "inner Text", "Text of 2nd level inner control shines through to fragment control");

		oField.setText("outer Text");
		strictEqual(oInnerText.getText(), "outer Text", "Text of fragment control is propagated to 2nd level inner control");
	});

});
