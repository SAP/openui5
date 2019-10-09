/* global QUnit, customElements */
/* eslint max-nested-callbacks: 0 */

sap.ui.define([
	"sap/ui/core/Core"
], function (
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oLibrary = Core.getLoadedLibraries()["sap.ui.integration"];
	var sPrefix = "ui-integration";
	var aCustomElements = Object.keys(oLibrary.customElements).map(function (sCustomElementName) { return sPrefix + "-" + sCustomElementName; }); // prefix custom elements names

	/* Helper functions */
	function registerLibraryTags() {
		var aTags = Object.keys(oLibrary.customElements);
		//collect all the implementation classes and require them
		sap.ui.require(
			aTags.map(
				function (o, i) {
					return oLibrary.customElements[aTags[i]];
				}
			)
		);
	}

	function initTags() {
		Core.loadLibraries(["sap/ui/integration"], {
			async: true
		}).then(function () {
			//register the tags for this library
			registerLibraryTags("sap.ui.integration");
		});
	}

	// await the registration of all known custom elements
	function whenDefinedAll() {
		var aPromises = aCustomElements.map(function (sCustomElementName) {
			return customElements.whenDefined(sCustomElementName);
		});

		return Promise.all(aPromises);
	}

	// wrapper for safe and convenient assertions
	function testWhenDefined(fnCb) {
		return whenDefinedAll().then(fnCb);
	}

	initTags(); // init the library custom elements

	QUnit.module("Initialize tags");

	QUnit.test("Initialization", function (assert) {
		var done = assert.async();

		testWhenDefined().then(function () {
			aCustomElements.map(function (sCustomElementName) {
				assert.ok(customElements.get(sCustomElementName), sCustomElementName + " custom element of the library is registered.");
			});
			done();
		});
	});

	QUnit.module("Direct create");

	QUnit.test("Create and remove tags directly and check whether they are connected/disconnected correctly", function (assert) {
		// arrange
		var done = assert.async();

		aCustomElements.forEach(function (sName) {
			var oElement = document.createElement(sName);
			// act
			document.getElementById(DOM_RENDER_LOCATION).appendChild(oElement);
		});

		testWhenDefined(function () {
			aCustomElements.forEach(function (sName) {
				var oElement = document.querySelector(sName.replace(/\-/g, "\\-"));

				// assert
				assert.ok(oElement._oControlInstance, "The control is connected to the element <" + sName + ">.");
				assert.ok(document.body.contains(oElement), "The element <" + sName + "> is in the active dom.");

				// act
				oElement.parentNode.removeChild(oElement);

				// assert
				assert.notOk(oElement._oControlInstance, "The control instance is destroyed from the element <" +  oElement.tagName.toLowerCase() + ">.");
				assert.notOk(document.body.contains(oElement), "The element <" + oElement.tagName.toLowerCase() + "> is NOT in the active dom.");
			});

			done();
		});
	});

	QUnit.test("Create and remove tags and check whether they are connected/disconnected correctly via innerHTML", function (assert) {
		// arrange
		var done = assert.async(),
			aElements = [],
			oDiv = document.createElement("div");

		aCustomElements.forEach(function (sName) {
			oDiv.innerHTML = oDiv.innerHTML + "<" + sName + "></" + sName + ">";
		});

		// act
		document.getElementById(DOM_RENDER_LOCATION).appendChild(oDiv);

		testWhenDefined(function () {

			aCustomElements.forEach(function (sName) {
				var oElement = document.querySelector(sName.replace(/\-/g, "\\-"));
				aElements.push(oElement);

				// assert
				assert.ok(oElement._oControlInstance, "The control is connected to the element <" + sName + ">.");
				assert.ok(document.body.contains(oElement), "The element <" + sName + "> is in the active dom.");
			});

			// act
			oDiv.innerHTML = "";

			aElements.forEach(function (oElement) {
				// assert
				assert.notOk(oElement._oControlInstance,  "The control instance is destroyed from the element <" +  oElement.tagName.toLowerCase() + ">.");
				assert.notOk(document.body.contains(oElement), "The element <" + oElement.tagName.toLowerCase() + "> is NOT in the active dom.");
			});

			done();
		});
	});

	QUnit.module("Attributes");

	QUnit.test("Create a card tag and change attributes", function (assert) {
		// arrange
		var done = assert.async(),
			oElement = document.createElement("ui-integration-card");

		// act
		oElement.setAttribute("height", "100px");

		testWhenDefined(function () {
			// assert
			assert.ok(oElement.getAttribute("height") === "100px", "Attribute height set correctly on the element.");
			assert.ok(oElement._oControlInstance.getProperty("height") === "100px", "Property height is set correctly on the control.");
			done();
		});
	});

	QUnit.test("Create a card tag and change property", function (assert) {
		// arrange
		var done = assert.async(),
			oElement = document.createElement("ui-integration-card");

		// act
		oElement.height = "100px";

		testWhenDefined(function () {
			// assert
			assert.ok(oElement._oControlInstance.getProperty("height") === "100px", "Property height set correctly on the control to 100px.");
			assert.ok(oElement.height === "100px", "Property height set correctly on the control to 100px.");

			done();
		});
	});


	QUnit.test("Create a tag with properties and then place it into DOM", function (assert) {
		// arrange
		var done = assert.async();

		var oElement = document.createElement("ui-integration-card");
		// act - set manifest property (might happen even before the custom element is defined)
		oElement.manifest = {
			"sap.app": {
				"id": "my.test.card.list",
				"type": "card",
				"i18n": "i18n/i18n.properties"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": [
							{
								"Icon": "sap-icon://help"
							}
						]
					},
					"item": {
						"icon": {
							"src": "{Icon}"
						}
					}
				}
			}
		};

		// act
		document.getElementById(DOM_RENDER_LOCATION).appendChild(oElement);

		testWhenDefined(function () {
			Core.applyChanges(); // finish rendering

			// assert
			assert.ok(oElement.querySelector(".sapFCard"), "Properties should be considered, regardless of when they are set (before or after custom element is defined).");

			// clean up
			document.getElementById(DOM_RENDER_LOCATION).removeChild(oElement);
			done();
		});
	});

	QUnit.module("Clone a node");

	QUnit.test("Clone a card tag and change attributes", function (assert) {
		// arrange
		var done = assert.async(),
			oElement = document.createElement("ui-integration-card");

		// act
		oElement.setAttribute("height", "100px");
		var oClone = oElement.cloneNode();
		oClone.id = "clonedElementId";

		testWhenDefined(function () {
			// assert
			assert.ok(oClone !== oElement, "A new node reference was created.");
			assert.ok(oClone._oControlInstance !== oElement._oControlInstance, "A new control instance was created.");
			assert.strictEqual(oClone._oControlInstance.getProperty("height"), "100px", "Property height set correctly on the control to 100px.");

			done();
		});
	});

	QUnit.module("Events");

	QUnit.test("Add event listener dynamically", function (assert) {
		// arrange
		var done = assert.async(),
			oElement = document.createElement("ui-integration-card");

		assert.expect(1);

		testWhenDefined(function () {
			oElement.addEventListener("action", function (oEvent) {
				// assert
				assert.strictEqual(oEvent.type, "action", "The proper event is fired.");

				// clean up
				document.getElementById(DOM_RENDER_LOCATION).removeChild(oElement);
				done();
			});

			// act
			document.getElementById(DOM_RENDER_LOCATION).appendChild(oElement);
			oElement._getControl().fireAction();
		});
	});
});