sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/UIComponent',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/ComponentSupport',
	'sap/ui/core/library',
	'jquery.sap.strings'
], function(jQuery, UIComponent, ComponentContainer, ComponentSupport, library /*, jQuerySapStrings */) {

	"use strict";
	/*global QUnit, sinon, Promise*/

	var ComponentLifecycle = library.ComponentLifecycle;

	// helper functionality to create component container DIVs
	function createComponentDIV(sId, mAttributes) {
		var oDIV = document.createElement("div");
		if (mAttributes) {
			Object.keys(mAttributes).forEach(function(sKey) {
				oDIV.setAttribute(sKey, mAttributes[sKey]);
			});
		}
		oDIV.setAttribute("id", sId);
		return oDIV;
	}

	var oContentElement = createComponentDIV("content");
	document.body.appendChild(oContentElement);

	// settings
	var mSettings = {
		"div1": {
			id: "container1",
			name: "sap.ui.test.v2empty",
			settings: {
				id: "component1"
			},
			componentCreated: "componentCreated"
		},
		"div2": {
			id: "container2",
			name: "sap.ui.test.v2empty",
			settings: {
				id: "component2"
			},
			componentCreated: "componentCreated",
			async: false
		}
	};

	// convert the settings and create the component container div elements
	var mContainers = {};
	Object.keys(mSettings).forEach(function(sId) {
		// create the component configuration for the div element from the settings
		var mContainer = mContainers[sId] = {
			"data-sap-ui-component": ""
		};
		Object.keys(mSettings[sId]).forEach(function(sKey) {
			mContainer["data-" + jQuery.sap.hyphen(sKey)] = sKey === "settings" ? JSON.stringify(mSettings[sId][sKey]) : mSettings[sId][sKey];
		});
		// create the div element for the component container
		oContentElement.appendChild(createComponentDIV(sId, mContainer));
	});

	// Promise which resolves once the component instances are created
	function runComponentSupport() {
		return new Promise(function(resolve, reject) {

			// create a global function to count the component instances
			var iComponentCount = 0;
			window.componentCreated = function() {
				iComponentCount++;
				// start the test once both component instances are created
				if (iComponentCount == 2) {
					resolve();
				}
			};

			// execute the ComponentSupport
			ComponentSupport.run();

		});
	}


	QUnit.module("Component Support");

	QUnit.test("Finder, Parser and Default Settings", function(assert) {

		// check the finder
		var aElements = ComponentSupport._find();
		assert.equal(aElements.length, 2, "Found 2 declarative components!");

		for (var i = 0, l = aElements.length; i < l; i++) {
			var oElement = aElements[i];
			var mExpectedSettings = jQuery.extend(true, {}, mSettings[oElement.id]);

			// check the parser
			window.componentCreated = function() {};
			var mComponentSettings = ComponentSupport._parse(oElement);
			mComponentSettings.componentCreated = "componentCreated"; // reset function for comparision!
			assert.deepEqual(mComponentSettings, mExpectedSettings, "Component settings parsed correctly for component " + oElement.id + "!");

			// check the default settings
			ComponentSupport._applyDefaultSettings(mComponentSettings);
			mExpectedSettings.async = true;
			mExpectedSettings.lifecycle = ComponentLifecycle.Container;
			mExpectedSettings.manifest = true;
			mExpectedSettings.autoPrefixId = true;
			assert.deepEqual(mComponentSettings, mExpectedSettings, "Component settings defaults applied properly for component " + oElement.id + "!");
		}

	});

	QUnit.test("Parser with unknown property/event", function(assert) {

		var oElement = document.createElement("div");
		oElement.setAttribute("data-unkown", "foo");
		assert.throws(function() {
			ComponentSupport._parse(oElement);
		}, new Error("Property or event \"unkown\" does not exist in sap.ui.core.ComponentContainer"));

	});

	QUnit.test("Parser with invalid event callback", function(assert) {

		var oElement = document.createElement("div");
		oElement.setAttribute("data-component-created", "does.not.exist");
		assert.throws(function() {
			ComponentSupport._parse(oElement);
		}, new Error("Callback handler for event \"componentCreated\" not found"));

	});

	QUnit.test("ComponentContainer Factory", function(assert) {

		var oComponentContainerApplySettingsSpy = this.spy(ComponentContainer.prototype, "applySettings");

		var aComponentElements = document.querySelectorAll("[data-sap-ui-component]");

		assert.equal(aComponentElements.length, 2, "There should be two declarative elements");
		assert.ok(aComponentElements[0].hasAttribute("data-sap-ui-component"), "First element should have the indicator attribute");
		assert.ok(aComponentElements[1].hasAttribute("data-sap-ui-component"), "Second element should have the indicator attribute");

		var pComponentSupport = runComponentSupport();

		// Two ComponentContainers should have been created
		sinon.assert.callCount(oComponentContainerApplySettingsSpy, 2);

		assert.notOk(aComponentElements[0].hasAttribute("data-sap-ui-component"), "First element should not have the indicator attribute anymore");
		assert.ok(aComponentElements[0].parentNode, "First element should still be part of the DOM");
		assert.notOk(aComponentElements[1].hasAttribute("data-sap-ui-component"), "Second element should not have the indicator attribute anymore");
		assert.ok(aComponentElements[1].parentNode, "Second element should still be part of the DOM");

		assert.equal(document.querySelectorAll("[data-sap-ui-component]").length, 0, "There should not be any declarative elements anymore");

		// Directly executing run again shouldn't try to create the same containers again
		ComponentSupport.run();

		// Still, only two ComponentContainers should have been created
		sinon.assert.callCount(oComponentContainerApplySettingsSpy, 2);

		return pComponentSupport.then(function() {

			assert.ok(document.getElementById("div1"), "Placeholder DIV for first Component found!");
			assert.ok(document.getElementById("div2"), "Placeholder DIV for second Component found!");
			assert.ok(document.getElementById("container1"), "ComponentContainer element for first Component found!");
			assert.ok(document.getElementById("container2"), "ComponentContainer element for second Component found!");

			var oContainer1 = sap.ui.getCore().byId("container1");
			var oContainer2 = sap.ui.getCore().byId("container2");
			assert.ok(oContainer1 instanceof ComponentContainer, "ComponentContainer for first Component found!");
			assert.ok(oContainer2 instanceof ComponentContainer, "ComponentContainer for second Component found!");

			var oComponent1 = oContainer1.getComponentInstance();
			var oComponent2 = oContainer2.getComponentInstance();
			assert.ok(oComponent1 instanceof UIComponent, "UIComponent instance for first Component found!");
			assert.ok(oComponent2 instanceof UIComponent, "UIComponent instance for second Component found!");

			assert.equal(oComponent1.getId(), oContainer1.getId() + "-component1", "The id of the first Component is correct!");
			assert.equal(oComponent1.getMetadata().getName(), "sap.ui.test.v2empty.Component", "The name of the first Component is correct!");
			assert.equal(oComponent2.getId(), oContainer2.getId() + "-component2", "The id of the second Component is correct!");
			assert.equal(oComponent2.getMetadata().getName(), "sap.ui.test.v2empty.Component", "The name of the second Component is correct!");

			// Executing run again afterwards also shouldn't try to create the same containers again
			ComponentSupport.run();

			// Still, only two ComponentContainers should have been created
			sinon.assert.callCount(oComponentContainerApplySettingsSpy, 2);

		});

	});

});