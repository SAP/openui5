/*global QUnit */
sap.ui.define([
	"sap/m/Label",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/xml/XMLModel",
	"sap/ui/model/Context",
	"sap/ui/thirdparty/jquery"
], function(Label, List, StandardListItem, VerticalLayout, XMLModel, Context, jQuery) {
	"use strict";

	var oLabel, oLayout, oModel, oModelChild, aTestData, aTestDataChild;

	function cleanUp(){
		oLabel.destroy();
	}

	function setup(){
		aTestData =
			"<teamMembers>" +
				"<member firstName=\"Andreas\" lastName=\"Klark\"></member>" +
				"<member firstName=\"Peter\" lastName=\"Miller\"></member>" +
				"<member firstName=\"Gina\" lastName=\"Rush\"></member>" +
				"<member firstName=\"Steave\" lastName=\"Ander\"></member>" +
				"<member firstName=\"Michael\" lastName=\"Spring\"></member>" +
				"<member firstName=\"Marc\" lastName=\"Green\"></member>" +
				"<member firstName=\"Frank\" lastName=\"Wallace\"></member>" +
			"</teamMembers>";

		aTestDataChild =
			"<pets>" +
				"<pet type=\"ape\" age=\"1\"></pet>" +
				"<pet type=\"bird\" age=\"2\"></pet>" +
				"<pet type=\"cat\" age=\"3\"></pet>" +
				"<pet type=\"fish\" age=\"4\"></pet>" +
				"<pet type=\"dog\" age=\"5\"></pet>" +
			"</pets>";

		oModel = new XMLModel();
		oModel.setXML(aTestData);

		oModelChild = new XMLModel();
		oModelChild.setXML(aTestDataChild);

		oLayout = new VerticalLayout();
		oLabel = new Label("myLabel");
		oLabel.setModel(oModel);
		oLabel.setText("testText");
	}

	QUnit.module("sap.ui.model.xml.XMLModel", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		afterEach: function() {
			cleanUp();
		},
		beforeEach: function() {
			setup();
		}
	});

	QUnit.test("test model getProperty with context", function(assert) {
		var oContext = oModel.createBindingContext("/member/6");
		var value = oModel.getProperty("@lastName", oContext); // relative path when using context
		assert.equal(value, "Wallace", "model value");
	});


	QUnit.test("test model getProperty", function(assert) {
		var value = oModel.getProperty("/member/6/@lastName");
		assert.equal(value, "Wallace", "model value");
	});

	QUnit.test("test model setProperty", function(assert) {
		oModel.setProperty("/member/4/@lastName", "Jackson");
		var value = oModel.getProperty("/member/4/@lastName");
		assert.equal(value, "Jackson", "model value");
	});

	QUnit.test("test getProperty on label", function(assert) {
		assert.equal(oLabel.getText(),"testText", "old text value");
		oLabel.bindProperty("text", "/member/4/@firstName");
		assert.equal(oLabel.getText(), "Michael", "text value from model");
		oLabel.unbindProperty("text");
	});

	QUnit.test("test model setProperty onlabel", function(assert) {
		oLabel.setText("test");
		assert.equal(oLabel.getText(),"test", "old text value");
		oLabel.bindProperty("text", "/member/1/@firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("/member/1/@firstName", "Petre");
		assert.equal(oLabel.getText(), "Petre", "new text value from model");
	});

	QUnit.test("test model setProperty with invalid bindingContext and relative path", function(assert) {
		var oContext = oModel.createBindingContext("/member/HorstDerGrosse");
		oModel.setProperty("@firstName", "Petre", oContext);
		assert.expect(0);
	});

	QUnit.test("test model setProperty onlabel with bindingContext and relative path", function(assert) {
		var oContext = oModel.createBindingContext("/member");
		oLabel.setBindingContext(oContext);
		oLabel.bindProperty("text", "1/@firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("1/@firstName", "Petri", oLabel.getBindingContext());
		assert.equal(oLabel.getText(), "Petri", "new text value from model");
	});

	QUnit.test("test model setProperty onlabel with bindingContext and absolute path", function(assert) {
		var oContext = oModel.createBindingContext("/member/HorstDerGrosse");
		oLabel.setBindingContext(oContext);
		oLabel.bindProperty("text", "/member/1/@firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("/member/1/@firstName", "Petre");
		assert.equal(oLabel.getText(), "Petre", "new text value from model");
		oLabel.setBindingContext(undefined);
	});

	/**
	 * @deprecated As of version 1.111
	 */
	QUnit.test("test model setProperty onlabel without bindingContext and relative path (legacySyntax = true)", function(assert) {
		oModel.setLegacySyntax(true);
		oLabel.bindProperty("text", "member/1/@firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("member/1/@firstName", "Petro", oLabel.getBindingContext());
		assert.equal(oLabel.getText(), "Petro", "new text value from model");
		oModel.setLegacySyntax(false);
	});

	/**
	 * @deprecated As of version 1.111 legacySyntax is deprecated
	 */
	QUnit.test("test model setProperty onlabel with bindingContext and relative path (legacySyntax = true)", function(assert) {
		oModel.setLegacySyntax(true);
		var oContext = oModel.createBindingContext("/member");
		oLabel.setBindingContext(oContext);
		oLabel.bindProperty("text", "1/@firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("1/@firstName", "Petri", oLabel.getBindingContext());
		assert.equal(oLabel.getText(), "Petri", "new text value from model");
		oModel.setLegacySyntax(false);
	});

	/**
	 * @deprecated As of version 1.111 legacySyntax is deprecated
	 */
	QUnit.test("test model setProperty onlabel with bindingContext and absolute path (legacySyntax = true)", function(assert) {
		oModel.setLegacySyntax(true);
		var oContext = oModel.createBindingContext("/member/HorstDerGrosse");
		oLabel.setBindingContext(oContext);
		oLabel.bindProperty("text", "/member/1/@firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("/member/1/@firstName", "Petre", oLabel.getBindingContext());
		assert.equal(oLabel.getText(), "Petre", "new text value from model");
		oModel.setLegacySyntax(false);
	});

	QUnit.test("test model getProperty with bindingContext and path = null", function(assert) {
		var oContext = oModel.createBindingContext("/member");
		assert.equal(oModel.getProperty(null, oContext).length, 0 , "array of team members");
	});

	QUnit.test("test createBindingContext with two models", function(assert) {
		var oContext = oModel.createBindingContext("/member");
		oLayout.addContent(oLabel);
		oLayout.setModel(oModel);
		oLayout.setBindingContext(oContext);
		oLabel.setModel(oModelChild);
		oLabel.bindProperty("text", "/pet/0/@type");
		assert.equal(oLabel.getText(), "ape", "text value from model");
		oModelChild.setProperty("/pet/0/@type", "hamster");
		assert.equal(oLabel.getText(), "hamster", "new text value from model");
	});

	QUnit.test("test model bindAggregation on List", function(assert) {
		var oLB = new List("myLb"),
			oItemTemplate = new StandardListItem();

		oLB.setModel(oModel);
		oItemTemplate.bindProperty("title", "@firstName").bindProperty("description", "@lastName");
		oLB.bindAggregation("items", "/member", oItemTemplate);

		var listItems = oLB.getItems();
		assert.equal(listItems.length, 7, "length of items");
		var oBinding = oLB.getBinding("items");

		assert.ok(oBinding, "oBinding should not be null");
		assert.equal(oBinding.getLength(), 7, "oBinding length");

		listItems.forEach(function(item, i) {
			assert.equal(item.getTitle(), oModel.getProperty("/member/" + i + "/@firstName"),
				"firstname check");
			assert.equal(item.getDescription(), oModel.getProperty("/member/" + i + "/@lastName"),
				"lastname check");
		});
		oLB.destroy();
	});

	QUnit.test("test XMLModel XML constructor", function(assert) {

		var testModel = new XMLModel(

		);
		testModel.setXML("<root>" +
				"<foo>The quick brown fox jumps over the lazy dog.</foo>" +
				"<bar>ABCDEFG</bar>" +
				"<baz>52</baz>" +
			"</root>");
		assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
		assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
		assert.equal(testModel.getProperty("/baz"), 52);

	});

	QUnit.test("test create binding context", function(assert) {
		var oContext;

		oContext = oModel.createBindingContext("/root/test/subtest/name");
		assert.equal(oContext.getPath(), "/root/test/subtest/name", "newContext returnValue");

		oModel.createBindingContext("/root/test/subtest/name", null, function(context){
			assert.equal(context.getPath(), "/root/test/subtest/name", "newContext");
		});
		oModel.createBindingContext("root/test/subtest/name", null, function(context){
			assert.ok(context == null, "newContext");
		});
		oContext = new Context(oModel, "/myContext");
		// if spath starts with / ... context will be ignored, because path is absolute
		oModel.createBindingContext("/root/test/subtest/name", oContext, function(context){
			assert.equal(context.getPath(), "/root/test/subtest/name", "newContext");
		});
		oContext = new Context(oModel, "/myContext");
		oModel.createBindingContext("root/test/subtest/name", oContext, function(context){
			assert.equal(context.getPath(), "/myContext/root/test/subtest/name", "newContext");
		});
	});

	QUnit.test("test inheritance of context", function(assert) {
		var oContext;
		oLabel.setBindingContext(undefined);
		oContext = oModel.createBindingContext("/member");
		oLayout.setModel(oModel);
		oLayout.setBindingContext(oContext);
		oLabel.setModel(oModelChild);
		oLabel.bindProperty("text", "/pet/0/@type");
		oLayout.addContent(oLabel);
		assert.ok(oLabel.getBindingContext() == undefined, "context undefined");
		oContext = oModelChild.createBindingContext("/pet");
		oLabel.setBindingContext(oContext);
		assert.equal(oLabel.getBindingContext().getPath(), "/pet", "context set correctly");
		oModelChild.setProperty("0/@type", "rat",oLabel.getBindingContext());
		assert.equal(oLabel.getText(), "rat", "new text value from model");
	});

	QUnit.test("test XMLModel loadData",function(assert){
		var done = assert.async();
		var testModel = new XMLModel();
		testModel.loadData("test-resources/sap/ui/core/qunit/xml/data/testdata.xml");
		testModel.attachRequestCompleted(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
			assert.equal(testModel.getProperty("/baz"), "[52, 97]");
			done();          // resume normal testing
		});
	});

	QUnit.test("test XMLModel loadData constructor",function(assert){
		var done = assert.async();
		var testModel = new XMLModel("test-resources/sap/ui/core/qunit/xml/data/testdata.xml");
		testModel.attachRequestCompleted(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
			assert.equal(testModel.getProperty("/baz"), "[52, 97]");
			done();          // resume normal testing
		});
	});


	QUnit.test("test XML setXML error", function(assert) {
		var oModel = new XMLModel();
		var sXML = "<?xml version=\"1.0\"><teamMembers>" +
		"<member firstName=\"Andreas\" lastName=\"Klark\"></member>" +
		"<member firstName=\"Peter\" lastName=\"Miller\"></member>" +
		"<member firstName=\"Gina\" lastName=\"Rush\"></member>" +
		"<member firstName=\"Steave\" lastName=\"Ander\"></member>" +
		"<member firstName=\"Michael\" lastName=\"Spring\"></member>" +
		"<member firstName=\"Marc\" lastName=\"Green\"></member>" +
		"<member firstName=\"Frank\" lastName=\"Wallace\"></member>" +
	"</teamMembers>";
		var error = false;
		oModel.attachParseError(sXML, function(oEvent){
			error = true;
			assert.equal(oEvent.sId, "parseError", "event type");
		});
		oModel.setXML(sXML);
		assert.ok(error, "error occurred");

	});

	QUnit.test("test XML getXML", function(assert) {
		var oModel = new XMLModel();
		var sXML = "<root>" +
				"<foo>The quick brown fox jumps over the lazy dog.</foo>" +
				"<bar>ABCDEFG</bar>" +
				"<baz>52</baz>" +
			"</root>";
		oModel.setXML(sXML);
		assert.equal(oModel.getXML().trim(), sXML.trim(), "get XML test");
	});

	QUnit.test("test XML getData", function(assert) {
		var oModel = new XMLModel();
		var sXML = "<root>" +
		"<foo>The quick brown fox jumps over the lazy dog.</foo>" +
		"<bar>ABCDEFG</bar>" +
		"<baz>52</baz>" +
		"</root>";
		oModel.setXML(sXML);
		assert.equal(oModel.getData().getElementsByTagName("bar")[0].textContent, "ABCDEFG", "get XML test");
	});

	/**
	 * @deprecated As of version 1.111 legacySyntax is deprecated
	 */
	QUnit.test("test XML compatible syntax", function(assert) {
		var oModel = new XMLModel(),
			value, oContext;

		oModel.setLegacySyntax(true);
		oModel.setXML(aTestData);
		value = oModel.getProperty("member/6/@lastName");
		assert.equal(value, "Wallace", "model value");
		oModel.setProperty("member/4/@lastName", "Jackson");
		value = oModel.getProperty("/member/4/@lastName");
		assert.equal(value, "Jackson", "model value");
		oContext = oModel.createBindingContext("member/6");
		value = oModel.getProperty("@lastName", oContext);
		assert.equal(value, "Wallace", "model value");
	});

	/**
	 * @deprecated As of version 1.111 legacySyntax is deprecated
	 */
	QUnit.test("test XML compatible syntax fail", function(assert) {
		var oModel = new XMLModel(),
			value, oContext;
		oModel.setLegacySyntax(false);
		oModel.setXML(aTestData);
		value = oModel.getProperty("member/6/@lastName");
		assert.equal(value, undefined, "model value");
		oModel.setProperty("/member/4/@lastName", "Ander");
		try {
			oModel.setProperty("member/4/@lastName", "Jackson");
		} catch (e) {
			assert.ok(true, "setting a property for a relative path should fail");
		}
		value = oModel.getProperty("/member/4/@lastName");
		assert.equal(value, "Ander", "model value");
		oContext = oModel.createBindingContext("member/6");
		assert.equal(oContext, undefined, "model value");
	});

	QUnit.test("text XML getObject", function(assert) {
		var oModel = new XMLModel();
		oModel.setXML(aTestData);
		var oNode = oModel.getObject("/member/4/@lastName"); // direct attribute access
		assert.ok(oNode);
		assert.equal(oNode, "Spring", "node attribute value");
		oNode = oModel.getObject("/member/4/");
		assert.ok(oNode);
		assert.equal(oNode.nodeName, "member", "node text name");
		assert.equal(oNode.getAttribute('firstName'), "Michael", "node attribute value");
	});

	QUnit.test("test XMLModel destroy", function(assert) {
		var testModel = new XMLModel();
		testModel.attachRequestCompleted(function() {
			assert.ok(false, "Request should be aborted!");
		});
		testModel.attachRequestFailed(function() {
			assert.ok(false, "Error handler should not be called when request is aborted via destroy!");
		});
		var spy = this.spy(jQuery, "ajax");
		testModel.loadData("test-resources/sap/ui/core/qunit/xml/data/testdata.xml");
		testModel.destroy();
		assert.ok(testModel.bDestroyed, "Model should be destroyed");
		assert.equal(spy.callCount, 1, "number of requests should be still 1");
		assert.equal(spy.getCall(0).returnValue.statusText, "abort", "should be abort"); // Note: statusText 'abort' is set by the model itself

	});


	QUnit.test("test XMLModel loadData after destroy", function(assert) {
		//var server = this.sandbox.useFakeServer();
		//server.respondWith("data.json", function(xhr, id) {
			//assert.ok(false, "Request should not be sent after calling destroy!");
			//xhr.respond(200, { "Content-Type": "application/json" }, '{ "test": "data" }');
		//});

		var spy = this.spy(jQuery, "ajax");
		var testModel = new XMLModel();

		testModel.attachRequestCompleted(function() {
			assert.ok(false, "Request should be aborted!");
		});
		testModel.attachRequestFailed(function() {
			assert.ok(false, "Error handler should not be called when request is aborted via destroy!");
		});

		testModel.loadData("test-resources/sap/ui/core/qunit/xml/data/testdata.xml", null, true);
		testModel.destroy();
		assert.ok(testModel.bDestroyed, "Model should be destroyed");
		assert.equal(spy.callCount, 1, "number of requests");
		assert.equal(spy.getCall(0).returnValue.statusText, "abort", "should be abort"); // Note: statusText 'abort' is set by the model itself

		// call loaddata again
		testModel.loadData("test-resources/sap/ui/core/qunit/xml/data/testdata.xml", null, true);

		assert.ok(testModel.bDestroyed, "Model should be destroyed");
		assert.equal(spy.callCount, 1, "number of requests should be still 1");
		assert.equal(spy.getCall(0).returnValue.statusText, "abort", "should be abort"); // Note: statusText 'abort' is set by the model itself

	});

});
