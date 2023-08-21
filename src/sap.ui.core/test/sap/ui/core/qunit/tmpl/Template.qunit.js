/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/tmpl/Template",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/handlebars",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Element, Template, JSONModel, jQuery, Handlebars, nextUIUpdate) {
	"use strict";

	QUnit.module("handlebars validation");

	QUnit.test("Check Recursive Field Lookup Patch", function(assert) {
		assert.expect(1);

		Handlebars.registerHelper("wrap", function(options) {
			return options.fn(this);
		});

		Handlebars.registerPartial("list", "{{#each items}}{{#wrap}}{{#wrap}}{{name}}{{#if ../../items}}{{> list}}{{/if}}{{/wrap}}{{/wrap}}{{/each}}");

		var fnTemplate = Handlebars.compile("{{> list}}");

		var sResult = fnTemplate({
			"items": [
				{ "name": "child1" },
				{ "name": "child2" },
				{ "name": "child3", "items": [
					{ "name": "child4" },
					{ "name": "child5" }
				]}
			]
		});

		assert.equal(sResult, "child1child2child3child4child5", "Handlebars doesn't preserve the same context on stack!");

		Handlebars.unregisterHelper("wrap");
		Handlebars.unregisterPartial("list");

	});

	QUnit.module("Basic Template Tests");

	QUnit.test("Basic Lookup", function(assert) {
		assert.expect(9);

		// find and load all existing known templates
		var aTemplates = sap.ui.template();
		assert.equal(aTemplates.length, 2, "2 Templates have been found!");

		// check the first template to be a valid template
		var oTemplate = sap.ui.getCore().getTemplate("theTemplate");
		assert.ok(oTemplate !== undefined, "Template has been found!");
		assert.ok(oTemplate instanceof Template, "Template is a sap.ui.core.tmpl.Template!");
		assert.ok(oTemplate === sap.ui.template("theTemplate"), "Same instance retrieved by sap.ui.template!");

		// check the second template to be ignored
		oTemplate = sap.ui.getCore().getTemplate("theSecondTemplate");
		assert.ok(oTemplate === undefined, "Second Template has not been found!");

		// check the first embedded template to be a valid template
		oTemplate = sap.ui.getCore().getTemplate("theEmbeddedTemplate");
		assert.ok(oTemplate !== undefined, "Embedded Template has been found!");
		assert.ok(oTemplate instanceof Template, "Embedded Template is a sap.ui.core.tmpl.Template!");
		assert.ok(oTemplate === sap.ui.template("theEmbeddedTemplate"), "Same instance retrieved by sap.ui.template!");

		// check the second embedded template to be ignored
		oTemplate = sap.ui.getCore().getTemplate("theSecondTemplate");
		assert.ok(oTemplate === undefined, "Second Embedded Template has not been found!");

	});

	QUnit.test("ID Lookup", function(assert) {
		assert.expect(4);

		// lookup an existing template
		var oTemplate = sap.ui.template("theTemplate");
		assert.ok(oTemplate !== undefined, "Template has been found!");
		assert.ok(oTemplate instanceof Template, "Template is a sap.ui.core.tmpl.Template!");
		assert.ok(oTemplate === sap.ui.template("theTemplate"), "Same instance retrieved by sap.ui.template!");
		assert.ok(oTemplate === sap.ui.getCore().getTemplate("theTemplate"), "Same instance retrieved by sap.ui.template!");

	});

	QUnit.test("Inline Templates", function(assert) {
		assert.expect(1);

		assert.equal(jQuery("#theEmbeddedTemplate > code").length, 1, "Inline Template doesn't create extra DOM");

	});

	QUnit.test("Unsupported Type", function(assert) {
		assert.expect(1);
		var theEx;
		try {
			sap.ui.template("theSecondTemplate");
		} catch (ex) {
			theEx = ex;
		}

		assert.ok(theEx !== undefined, "Unknown template type not found. Exception was raised!");
	});

	QUnit.module("Binding Template Tests");

	QUnit.test("Binding Path in Template", function(assert) {
		assert.expect(1);
		var done = assert.async();
		var sTitle = "Test123";

		sap.ui.controller("test.myController", {
			model: new JSONModel({
				title: sTitle
			}),

			onInit: function(){
				sap.ui.getCore().setModel(this.model, "navigation");
			}
		});

		var html = '' +
			'<template data-controller-name="test.myController">' +
				'<div id="myTemplate" data-type="text/x-handlebars-template">' +
					'<div>Binding in Template:</div>' +
					'<span id="templateContent">{{text path="navigation>/title"}}</span>' +
				'</div>' +
			'</template>';

		var myView = sap.ui.htmlview({viewContent:html});
		myView.placeAt("templateWithBinding");

		setTimeout(function(){
			sap.ui.template({
				id: "myTemplate"
			});

			setTimeout(function() {
				var sResult = jQuery(document.getElementById("templateContent")).text();
				assert.ok(sResult === sTitle, "Binding resolved properly");
				done();
			}, 10);
		}, 10);

	});

	QUnit.test("Rerendering on aggregation change", async function(assert) {

		// create a model to validate data binding
		var oModel = new JSONModel({
			"value": "A value",
			"subvalues": [{
				"value": "First subvalue"
			}, {
				"value": "Second subvalue"
			}]
		});
		sap.ui.getCore().setModel(oModel);

		// parse the template
		sap.ui.template({
			id: "templateWithListBinding",
			type: "text/x-handlebars-template"
		});

		// wait for the re-rendering
		await nextUIUpdate();

		var $tmpl = jQuery("#templateWithListBinding");
		assert.equal($tmpl.find("b").length, 1, "Found 1 B elements!");
		assert.equal($tmpl.find("b").text(), "A value", "The text of the B element is correct!");
		assert.equal($tmpl.find("li").length, 2, "Found 2 nested LI elements!");
		assert.equal(jQuery($tmpl.find("li").get(0)).text(), "First subvalue", "The text of the first LI element is correct!");

		// update the model
		oModel.getData()["value"] = "Another value";
		oModel.getData()["subvalues"].push({
			"value": "Third subvalue"
		});
		oModel.checkUpdate();

		// wait for the re-rendering
		await nextUIUpdate();

		$tmpl = jQuery("#templateWithListBinding");
		assert.equal($tmpl.find("b").length, 1, "Found 1 B elements!");
		assert.equal($tmpl.find("b").text(), "Another value", "The text of the B element is correct!");
		assert.equal($tmpl.find("li").length, 3, "Found 3 nested LI elements!");
		assert.equal(jQuery($tmpl.find("li").get(2)).text(), "Third subvalue", "The text of the new LI element is correct!");

		// update the model
		oModel.getData()["subvalues"].pop();
		oModel.checkUpdate();

		// wait for the re-rendering
		await nextUIUpdate();

		$tmpl = jQuery("#templateWithListBinding");
		assert.equal($tmpl.find("b").length, 1, "Found 1 B elements!");
		assert.equal($tmpl.find("b").text(), "Another value", "The text of the B element is correct!");
		assert.equal($tmpl.find("li").length, 2, "Found 2 nested LI elements!");

	});

	QUnit.test("Mixing Helpers and Controls", function(assert) {

		sap.ui.define("my/Control", ["sap/ui/core/Control"], function(Control) {
			 Control.extend("my.Control", {
				metadata: {
					properties: {
						text: "string"
					}
				},
				renderer: {
					apiVersion: 2,
					render: function(oRM, oControl) {
						oRM.openStart("div", oControl).openEnd();
						oRM.text(oControl.getText());
						oRM.close("div");
					}
				}
			});
		});

		var done = assert.async();

		sap.ui.require(["my/Control"], function() {
			// create a model to validate data binding
			var oModel = new JSONModel({
				"subvalues": [{
					"value": "First subvalue",
					"visible": true
				}, {
					"value": "Second subvalue",
					"visible": true
				}]
			});
			sap.ui.getCore().setModel(oModel, "other");

			// parse the template
			sap.ui.template({
				id: "templateWithListBindingAndControls",
				type: "text/x-handlebars-template"
			});

			// wait for the re-rendering
			nextUIUpdate().then(function() {
				var oTmplDom = document.getElementById("templateWithListBindingAndControls");
				var aChildDoms = oTmplDom.querySelectorAll("[data-sap-ui]");
				assert.equal(aChildDoms.length, 2, "Found 2 UI5 controls!");
				assert.equal(Element.closestTo(aChildDoms[0]).getText(), "First subvalue", "Text for 1st control is correct!");
				assert.equal(Element.closestTo(aChildDoms[1]).getText(), "Second subvalue", "Text for 2st control is correct!");
				assert.ok(aChildDoms[0].classList.contains("test1"), "First Custom Style Classes is set!");
				assert.ok(aChildDoms[0].classList.contains("test2"), "Second Custom Style Classes is set!");
				assert.ok(Element.closestTo(aChildDoms[0]).hasStyleClass("test1"), "First Custom Style Classes is set!");
				assert.ok(Element.closestTo(aChildDoms[0]).hasStyleClass("test2"), "Second Custom Style Classes is set!");

				done();
			});
		});
	});

	QUnit.test("Context Stacking (fix for migration from 3.x to 4.x)", function(assert) {

		sap.ui.define("my/Control", ["sap/ui/core/Control"], function(Control) {
			 Control.extend("my.Control", {
				metadata: {
					properties: {
						text: "string"
					}
				},
				renderer: {
					apiVersion: 2,
					render: function(oRM, oControl) {
						oRM.openStart("div", oControl).openEnd();
						oRM.text(oControl.getText());
						oRM.close("div");
					}
				}
			});
		});

		var done = assert.async();

		sap.ui.require(["my/Control"], function() {
			// create a model to validate data binding
			var oModel = new JSONModel({
				"subvalues": [{
					"value": "First subvalue",
					"visible": true
				}, {
					"value": "Second subvalue",
					"visible": true
				}]
			});
			sap.ui.getCore().setModel(oModel, "other");

			// parse the template
			sap.ui.template({
				id: "templateWithListBindingAndControls",
				type: "text/x-handlebars-template"
			});

			// wait for the re-rendering
			nextUIUpdate().then(function() {
				var oTmplDom = document.getElementById("templateWithListBindingAndControls");
				var aChildDoms = oTmplDom.querySelectorAll("[data-sap-ui]");
				assert.equal(aChildDoms.length, 2, "Found 2 UI5 controls!");
				assert.equal(Element.closestTo(aChildDoms[0]).getText(), "First subvalue", "Text for 1st control is correct!");
				assert.equal(Element.closestTo(aChildDoms[1]).getText(), "Second subvalue", "Text for 2st control is correct!");
				assert.ok(aChildDoms[0].classList.contains("test1"), "First Custom Style Classes is set!");
				assert.ok(aChildDoms[0].classList.contains("test2"), "Second Custom Style Classes is set!");
				assert.ok(Element.closestTo(aChildDoms[0]).hasStyleClass("test1"), "First Custom Style Classes is set!");
				assert.ok(Element.closestTo(aChildDoms[0]).hasStyleClass("test2"), "Second Custom Style Classes is set!");

				done();
			});
		});
	});

});
