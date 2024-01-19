/* global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Lib,
	nextUIUpdate
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oLibrary = Lib.all()["sap.ui.integration"];
	var mCustomElements = oLibrary.extensions["sap.ui.integration"].customElements;
	var sPrefix = "ui-integration";
	var aCustomElements = Object.keys(mCustomElements).map(function (sCustomElementName) { return sPrefix + "-" + sCustomElementName; }); // prefix custom elements names

	/* Helper functions */
	function registerLibraryTags() {
		var aTags = Object.keys(mCustomElements);
		//collect all the implementation classes and require them
		sap.ui.require(
			aTags.map(
				function (o, i) {
					return mCustomElements[aTags[i]];
				}
			)
		);
	}

	async function initTags() {
		await Lib.load({ name: "sap.ui.integration" });

		//register the tags for this library
		registerLibraryTags("sap.ui.integration");
	}

	// await the registration of all known custom elements
	async function whenDefinedAll() {
		var aPromises = aCustomElements.map(function (sCustomElementName) {
			return customElements.whenDefined(sCustomElementName);
		});

		await Promise.all(aPromises);
	}

	// wrapper for safe and convenient assertions
	async function customElementsDefine() {
		await whenDefinedAll();
	}

	initTags(); // init the library custom elements

	QUnit.module("Initialize tags");

	QUnit.test("Initialization", async function (assert) {
		await customElementsDefine();

		aCustomElements.map(function (sCustomElementName) {
			assert.ok(customElements.get(sCustomElementName), sCustomElementName + " custom element of the library is registered.");
		});
	});

	QUnit.module("Direct create");

	QUnit.test("Create and remove tags directly and check whether they are connected/disconnected correctly", async function (assert) {
		await customElementsDefine();

		aCustomElements.forEach(function (sName) {
			var oElement = document.createElement(sName);
			// act
			document.getElementById(DOM_RENDER_LOCATION).appendChild(oElement);
		});

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
	});

	QUnit.test("Create and remove tags and check whether they are connected/disconnected correctly via innerHTML", async function (assert) {
		await customElementsDefine();

		var aElements = [],
			oDiv = document.createElement("div");

		aCustomElements.forEach(function (sName) {
			oDiv.innerHTML = oDiv.innerHTML + "<" + sName + "></" + sName + ">";
		});

		// act
		document.getElementById(DOM_RENDER_LOCATION).appendChild(oDiv);

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
	});

	QUnit.module("Attributes");

	QUnit.test("Create a card tag and change attributes", async function (assert) {
		await customElementsDefine();

		var oElement = document.createElement("ui-integration-card");

		// act
		oElement.setAttribute("data-mode", "Active");

		// assert
		assert.strictEqual(oElement.getAttribute("data-mode"), "Active", "Attribute 'data-mode' correctly set on the element.");
		assert.strictEqual(oElement.dataMode, "Active", "Set attribute 'data-mode' reflects correctly on the element.");
	});

	QUnit.test("Create a card tag and change badge", async function (assert) {
		await customElementsDefine();

		var oElement = document.createElement("ui-integration-card");

		// act
		oElement.setAttribute("badge", "New");

		// assert
		assert.strictEqual(oElement.getAttribute("badge"), "New", "Attribute 'badge' correctly set on the element.");
		assert.strictEqual(oElement.badge, "New", "Set attribute 'badge' reflects correctly on the element.");
	});

	QUnit.test("Create a card tag and change property", async function (assert) {
		await customElementsDefine();

		var oElement = document.createElement("ui-integration-card");

		// act
		oElement.dataMode = "Active";

		// assert
		assert.strictEqual(oElement.getAttribute("data-mode"), "Active", "Attribute 'data-mode' reflects on the custom control to 'Active'.");
		assert.strictEqual(oElement._oControlInstance.getProperty("dataMode"), "Active", "Property dataMode propagated correctly onto the contained control to 'Active'.");
	});

	QUnit.test("Changing height or width through attribute or property should not work", async function (assert) {
		await customElementsDefine();

		var oElement = document.createElement("ui-integration-card");
		document.getElementById(DOM_RENDER_LOCATION).appendChild(oElement);

		// assert
		assert.notOk(oElement.getAttribute("height"), "Private attribute 'height' should be undefined for the custom element");
		assert.notOk(oElement.height, "Private property 'height' should be undefined for the custom element");
		assert.notOk(oElement.getAttribute("width"), "Private attribute 'height' should be undefined for the custom element");
		assert.notOk(oElement.width, "Private property 'width' should be undefined for the custom element");

		// act
		oElement.setAttribute("height", "32rem");
		oElement.height = "64rem";
		oElement.setAttribute("width", "100rem");
		oElement.width = "200rem";

		// assert
		var oElementStyle = window.getComputedStyle(oElement);
		assert.notStrictEqual(oElementStyle.height, "32rem", "Changing attribute/property 'height' must not reflect actual style of element");
		assert.notStrictEqual(oElementStyle.height, "64rem", "Changing attribute/property 'height' must not reflect actual style of element");
		assert.notStrictEqual(oElementStyle.width, "100rem", "Changing attribute/property 'width' must not reflect actual style of element");
		assert.notStrictEqual(oElementStyle.width, "200rem", "Changing attribute/property 'width' must not reflect actual style of element");

		document.getElementById(DOM_RENDER_LOCATION).removeChild(oElement);
	});

	QUnit.test("Create a tag with properties and then place it into DOM", async function (assert) {
		await customElementsDefine();

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
		await nextUIUpdate(); // finish rendering

		// assert
		assert.ok(oElement.querySelector(".sapFCard"), "Properties should be considered, regardless of when they are set (before or after custom element is defined).");

		// clean up
		document.getElementById(DOM_RENDER_LOCATION).removeChild(oElement);
	});

	QUnit.module("Clone a node");

	QUnit.test("Clone a card tag and change attributes", async function (assert) {
		await customElementsDefine();

		var oElement = document.createElement("ui-integration-card"),
			oClone = oElement.cloneNode();

		// act
		oClone.id = "clonedElementId";

		assert.notOk(oElement._oControlInstance, "Control instance of original element should be undefined prior to being placed in DOM");
		assert.notOk(oClone._oControlInstance, "Control instance of cloned element should be undefined prior to being placed in DOM");

		oElement.setAttribute("data-mode", "Inactive");

		var oClone2 = oElement.cloneNode();
		oClone.id = "secondClonedElementId";

		assert.ok(oClone._oControlInstance !== oElement._oControlInstance, "A new control instance was created.");
		assert.strictEqual(oClone2._oControlInstance.getProperty("dataMode"), "Inactive", "Property 'dataMode' set correctly on the control to 'Inactive'.");
	});

	QUnit.module("Events");

	QUnit.test("Add event listener dynamically", async function (assert) {
		// arrange
		var done = assert.async();

		await customElementsDefine();

		var oElement = document.createElement("ui-integration-card");

		assert.expect(1);

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
