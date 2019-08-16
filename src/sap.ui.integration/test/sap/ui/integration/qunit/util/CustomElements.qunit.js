/* global QUnit */

sap.ui.define([
		"sap/ui/integration/util/CustomElements",
		"sap/ui/core/Core"
	],
	function (
		CustomElements,
		Core
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var aTags, sPrefix;

		/* Helper functions */
		function registerLibraryTags(sLibrary, done) {
			CustomElements.coreInstance = Core;
			var oLibrary = Core.getLoadedLibraries()[sLibrary];
			//collect the prefix and the relevant tags
			sPrefix = oLibrary.defaultTagPrefix;
			aTags = Object.keys(oLibrary.customTags);
			//collect all the implementation classes and require them
			sap.ui.require(
				aTags.map(
					function (o, i) {
						return oLibrary.customTags[aTags[i]];
					}
				),
				function () {
					//after require, register the tags via CustomElements
					var args = arguments;
					aTags.forEach(
						function (o, i) {
							CustomElements.registerTag(aTags[i], sPrefix, args[i]);
						}
					);
					done();
				}
			);
		}

		function initTags(done) {
			//need to wait for the onload event of the window to ensure that the MutationObserver reacts
			//load the lib(s) and register
			Core.loadLibraries(["sap/ui/integration"], {
				async: true
			}).then(function () {
				//register the tags for this library
				registerLibraryTags("sap.ui.integration", done);
			});

		}

		QUnit.module("Initialize tags", {
			beforeEach: function (assert) {
				var done = assert.async();
				initTags(done);
			}
		});

		QUnit.test("Initialization", function (assert) {
			var done = assert.async();
			// setTimeout until everything is initialized.
			setTimeout(function () {
				assert.ok(Object.keys(document.createCustomElement).length === aTags.length, "All tags of the library are registered");
				aTags.forEach(function (sTag) {
					var sPrefixedTag = sPrefix + "-" + sTag;
					assert.ok(document.createCustomElement.hasOwnProperty(sPrefixedTag), "Tag <" + sPrefixedTag + "> registered");
				});
				done();
			}, 100);
		});

		QUnit.module("Direct create", {
			beforeEach: function (assert) {
				var done = assert.async();
				initTags(done);
			}
		});
		QUnit.test("Create and remove tags directly and check whether they are connected/disconnected correctly", function (assert) {
			var done = assert.async(),
				aElements = [];
			aTags.forEach(function (sTag) {
				var sPrefixedTag = sPrefix + "-" + sTag,
					oElement = document.createElement(sPrefixedTag);
				aElements.push(oElement);
				document.getElementById(DOM_RENDER_LOCATION).appendChild(oElement);
			});
			setTimeout(function () {
				aTags.forEach(function (sTag) {
					var sPrefixedTag = sPrefix + "-" + sTag,
						oElement = document.querySelector(sPrefixedTag.replace(/\-/g, "\\-"));
					assert.ok(oElement._control, "The control is connected to the element <" + sPrefixedTag + ">");
					var Tag = document.createCustomElement[sPrefixedTag];
					assert.ok(Tag.isInActiveDocument(oElement) === true, "The element <" + sPrefixedTag + "> is in the active dom ");
				});
				aTags.forEach(function (sTag) {
					var sPrefixedTag = sPrefix + "-" + sTag;
					var oElement = document.querySelector(sPrefixedTag.replace(/\-/g, "\\-"));
					oElement.parentNode.removeChild(oElement);
				});
				setTimeout(function () {
					aElements.forEach(function (oElement) {
						assert.ok(oElement._control, "The control is still connected to the element <" + oElement.tagName.toLowerCase() + ">");
						var Tag = document.createCustomElement[oElement.tagName.toLowerCase()];
						assert.ok(Tag.isInActiveDocument(oElement) === false, "The element <" + oElement.tagName.toLowerCase() + "> is not in the active dom ");
					});
					done();
				}, 100);
			}, 100);
		});

		QUnit.module("InnerHTML create", {
			beforeEach: function (assert) {
				var done = assert.async();
				initTags(done);
			}
		});
		QUnit.test("Create and remove tags and check whether they are connected/disconnected correctly via innerHTML", function (assert) {
			var done = assert.async(),
				aElements = [],
				oDiv = document.createElement("div");
			aTags.forEach(function (sTag) {
				var sPrefixedTag = sPrefix + "-" + sTag;
				oDiv.innerHTML = oDiv.innerHTML + "<" + sPrefixedTag + "></" + sPrefixedTag + ">";

			});
			document.getElementById(DOM_RENDER_LOCATION).appendChild(oDiv);
			setTimeout(function () {
				aTags.forEach(function (sTag) {
					var sPrefixedTag = sPrefix + "-" + sTag;
					var oElement = document.querySelector(sPrefixedTag.replace(/\-/g, "\\-"));
					aElements.push(oElement);
					assert.ok(oElement._control, "The control is connected to the element <" + sPrefixedTag + ">");
					var Tag = document.createCustomElement[sPrefixedTag];
					assert.ok(Tag.isInActiveDocument(oElement) === true, "The element <" + sPrefixedTag + "> is in the active dom ");
				});
				oDiv.innerHTML = "";
				setTimeout(function () {
					aElements.forEach(function (oElement) {
						assert.ok(oElement._control, "The control is still connected to the element <" + oElement.tagName.toLowerCase() + ">");
						var Tag = document.createCustomElement[oElement.tagName.toLowerCase()];
						assert.ok(Tag.isInActiveDocument(oElement) === false, "The element <" + oElement.tagName.toLowerCase() + "> is not in the active dom ");
					});
					done();
				}, 100);
			}, 100);
		});

		QUnit.module("Change attributes", {
			beforeEach: function (assert) {
				var done = assert.async();
				initTags(done);
			}
		});
		QUnit.test("Create a card tag and change attributes", function (assert) {
			var done = assert.async(),
				oElement = document.createCustomElement("ui-card");
			oElement.setAttribute("height", "100px");
			oElement.setAttribute("width", 100); //invalid value
			assert.notOk(oElement._control._controlImpl.getProperty("height") === "100px", "Property height not yet set correctly on the control, waitng for mutation observer to chip in");
			assert.ok(oElement.getAttribute("height") === "100px", "Attribute height set correctly on the element");
			setTimeout(function () {
				assert.ok(oElement._control._controlImpl.getProperty("height") === "100px", "Property height set correctly on the control to 100px");
				assert.notOk(oElement._control._controlImpl.getProperty("width") === "100", "Property width not set correctly on the control because it has an invalid value");
				done();
			}, 100);
		});
		QUnit.test("Create a card tag and change property", function (assert) {
			var done = assert.async(),
				oElement = document.createCustomElement("ui-card");
			oElement.height = "100px";
			oElement.width = 100;
			setTimeout(function () {
				assert.ok(oElement._control._controlImpl.getProperty("height") === "100px", "Property height set correctly on the control to 100px");
				assert.notOk(oElement._control._controlImpl.getProperty("width") === "100", "Property width not set correctly on the control because it has an invalid value");
				assert.ok(oElement.height === "100px", "Property height set correctly on the control to 100px");
				assert.ok(oElement.width === "100%", "Property width still 100%");
				done();
			}, 100);
		});

		QUnit.module("Clone a node", {
			beforeEach: function (assert) {
				var done = assert.async();
				initTags(done);
			}
		});
		QUnit.test("Clone a card tag and change attributes", function (assert) {
			var done = assert.async(),
				oElement = document.createCustomElement("ui-card");
			oElement.setAttribute("height", "100px");
			oElement.setAttribute("width", 100); //invalid value
			var oClone = oElement.cloneNode();
			assert.ok(oClone !== oElement, "A new node reference was created");
			assert.ok(oClone._control._controlImpl !== oElement._control._controlImpl, "A new control instance was created");
			setTimeout(function () {
				assert.ok(oClone._control._controlImpl.getProperty("height") === "100px", "Property height set correctly on the control to 100px");
				assert.notOk(oClone._control._controlImpl.getProperty("width") === "100", "Property width not set correctly on the control because it has an invalid value");
				done();
			}, 100);
		});

		QUnit.module("Add/remove classes", {
			beforeEach: function (assert) {
				var done = assert.async();
				initTags(done);
			}
		});
		QUnit.test("Add and remove a classes and check whether it is correctly added to the control", function (assert) {
			var done = assert.async(),
				oElement = document.createCustomElement("ui-card");
			oElement.className = "test1 test2";
			setTimeout(function () {
				assert.ok(oElement._control._controlImpl.hasStyleClass("test1"), "Class test1 added to the control correctly");
				assert.ok(oElement._control._controlImpl.hasStyleClass("test2"), "Class test2 added to the control correctly");
				oElement.className = "test1";
			}, 100);
			setTimeout(function () {
				assert.ok(oElement._control._controlImpl.hasStyleClass("test2") === false, "Class test2 removed from the control correctly");
				done();
			}, 200);
		});

		QUnit.module("Events", {
			beforeEach: function (assert) {
				var done = assert.async();
				initTags(done);
			}
		});

		QUnit.test("Add event listener dynamically", function (assert) {
			var done = assert.async(),
				oElement = document.createCustomElement("ui-card");

			assert.expect(1);
			oElement.addEventListener("action", function (oEvent) {
				assert.strictEqual(oEvent.type, "action", "The proper event is fired.");
				done();
			});

			// act
			oElement._control._controlImpl.fireAction();
		});
	});