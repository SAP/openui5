/* global QUnit */
sap.ui.define([
	"sap/ui/core/html/HTMLElement",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	HTMLElement,
	coreLibrary,
	Control,
	createAndAppendDiv,
	nextUIUpdate
) {
	"use strict";

	const TextDirection = coreLibrary.TextDirection;

	createAndAppendDiv("html-element-fixture-container");

	QUnit.module("Basic", {
		beforeEach: function() {
			this.SimpleHTMLElement = HTMLElement.extend("test.SimpleHTMLElement", {
				metadata: {
					tag: "test-element",
					properties: {
						value: {
							type: "string",
							defaultValue: "",
							mapping: "property"
						},
						width: {
							type: "sap.ui.core.CSSSize",
							mapping: "style"
						},
						content: {
							type: "string",
							mapping: "textContent"
						},
						enabled: {
							type: "boolean",
							defaultValue: true,
							mapping: {
								type: "property",
								to: "disabled",
								formatter: "_mapEnabled"
							}
						},
						textDirection: {
							type: "sap.ui.core.TextDirection",
							defaultValue: TextDirection.Inherit,
							mapping: {
								type: "property",
								to: "dir",
								formatter: "_mapTextDirection"
							}
						}
					},
					aggregations: {
						items: {
							type: "sap.ui.core.Control",
							multiple: true,
							slot: "items"
						}
					},
					associations: {
						ariaLabelledBy: {
							type: "sap.ui.core.Control",
							multiple: true,
							mapping: {
								type: "property",
								to: "aria-labelledby",
								formatter: "_getAriaLabelledByForRendering"
							}
						}
					},
					events: {
						customEvent: {
							parameters: {
								value: { type: "string" }
							}
						}
					}
				}
			});
		},
		afterEach: function() {
			if (this.oHTMLElement) {
				this.oHTMLElement.destroy();
			}
		}
	});

	QUnit.test("Constructor and basic setup", function(assert) {
		this.oHTMLElement = new this.SimpleHTMLElement({
			id: "test-element-1",
			value: "test-value",
			content: "Test Content"
		});

		assert.ok(this.oHTMLElement, "HTMLElement instance created successfully");
		assert.equal(this.oHTMLElement.getId(), "test-element-1", "ID is set correctly");
		assert.equal(this.oHTMLElement.getValue(), "test-value", "Property value is set correctly");
		assert.equal(this.oHTMLElement.getContent(), "Test Content", "TextContent property is set correctly");
		assert.ok(this.oHTMLElement instanceof HTMLElement, "Instance is of type HTMLElement");
		assert.ok(this.oHTMLElement instanceof Control, "Instance extends Control");
	});

	QUnit.test("Metadata validation", function(assert) {
		const oMetadata = this.SimpleHTMLElement.getMetadata();

		assert.equal(oMetadata.getName(), "test.SimpleHTMLElement", "Metadata name is correct");
		assert.equal(oMetadata.getTag(), "test-element", "Tag name is correct");
		assert.ok(oMetadata.hasProperty("value"), "Property 'value' exists in metadata");
		assert.ok(oMetadata.hasProperty("content"), "Property 'content' exists in metadata");
		assert.ok(oMetadata.hasAggregation("items"), "Aggregation 'items' exists in metadata");
		assert.ok(oMetadata.hasAssociation("ariaLabelledBy"), "Association 'ariaLabelledBy' exists in metadata");
	});

	QUnit.test("Property mappings", async function(assert) {
		this.oHTMLElement = new this.SimpleHTMLElement({
			value: "test-value",
			width: "100px",
			content: "Test Content",
			enabled: false,
			textDirection: TextDirection.LTR
		});

		this.oHTMLElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		const oDomRef = this.oHTMLElement.getDomRef();
		assert.ok(oDomRef, "DOM reference exists");
		assert.equal(oDomRef.tagName.toLowerCase(), "test-element", "Tag name is rendered correctly");
		assert.equal(oDomRef.getAttribute("value"), "test-value", "Property mapping works correctly");
		assert.equal(oDomRef.style.width, "100px", "Style mapping works correctly");
		assert.equal(oDomRef.textContent, "Test Content", "TextContent mapping works correctly");

		// Test formatted property mapping (enabled -> disabled)
		assert.equal(oDomRef.hasAttribute("disabled"), true, "Boolean property with formatter works correctly");

		// Test formatted property mapping (textDirection -> dir)
		assert.equal(oDomRef.getAttribute("dir"), "ltr", "TextDirection mapping works correctly");
	});

	QUnit.test("Property getters and setters", function(assert) {
		this.oHTMLElement = new this.SimpleHTMLElement();

		assert.equal(this.oHTMLElement.getValue(), "", "Initial value is empty string");
		assert.equal(this.oHTMLElement.getEnabled(), true, "Initial enabled is true");
		assert.equal(this.oHTMLElement.getTextDirection(), TextDirection.Inherit, "Initial textDirection is Inherit");

		this.oHTMLElement.setValue("new-value");
		assert.equal(this.oHTMLElement.getValue(), "new-value", "setValue works correctly");

		this.oHTMLElement.setEnabled(false);
		assert.equal(this.oHTMLElement.getEnabled(), false, "setEnabled works correctly");

		this.oHTMLElement.setTextDirection(TextDirection.RTL);
		assert.equal(this.oHTMLElement.getTextDirection(), TextDirection.RTL, "setTextDirection works correctly");
	});

	QUnit.test("Aggregation handling", function(assert) {
		this.oHTMLElement = new this.SimpleHTMLElement();

		const oChild1 = new Control({ id: "child1" });
		const oChild2 = new Control({ id: "child2" });
		this.oHTMLElement.addItem(oChild1);
		this.oHTMLElement.addItem(oChild2);

		assert.equal(this.oHTMLElement.getItems().length, 2, "Two items added to aggregation");
		assert.equal(this.oHTMLElement.getItems()[0].getId(), "child1", "First item is correct");
		assert.equal(this.oHTMLElement.getItems()[1].getId(), "child2", "Second item is correct");

		this.oHTMLElement.removeItem(oChild1);
		assert.equal(this.oHTMLElement.getItems().length, 1, "Item removed from aggregation");
		assert.equal(this.oHTMLElement.getItems()[0].getId(), "child2", "Remaining item is correct");
	});

	QUnit.test("Focus handling", async function(assert) {
		this.oHTMLElement = new this.SimpleHTMLElement();
		this.oHTMLElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		const oDomRef = this.oHTMLElement.getDomRef();
		const oFocusDomRef = this.oHTMLElement.getFocusDomRef();

		assert.equal(oFocusDomRef, oDomRef, "getFocusDomRef returns the main DOM reference");

		// Test focus info
		const oFocusInfo = this.oHTMLElement.getFocusInfo();
		assert.ok(oFocusInfo, "getFocusInfo returns an object");
		assert.ok(oFocusInfo.hasOwnProperty("id"), "Focus info contains id property");
		assert.ok(oFocusInfo.hasOwnProperty("oFocusedElement"), "Focus info contains oFocusedElement property");
	});

	QUnit.test("Event handling", async function(assert) {
		const done = assert.async();
		this.oHTMLElement = new this.SimpleHTMLElement();

		this.oHTMLElement.attachCustomEvent(function(oEvent) {
			assert.equal(oEvent.getParameter("value"), "test-value", "Event parameter is correct");
			done();
		});

		this.oHTMLElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();		// Simulate custom event
		setTimeout(function() {
			this.oHTMLElement.fireCustomEvent({ value: "test-value" });
		}.bind(this), 10);
	});

	QUnit.test("Formatter functions", function(assert) {
		this.oHTMLElement = new this.SimpleHTMLElement();

		// Test _mapEnabled formatter
		assert.equal(this.oHTMLElement._mapEnabled(true), false, "_mapEnabled(true) returns false");
		assert.equal(this.oHTMLElement._mapEnabled(false), true, "_mapEnabled(false) returns true");

		// Test _mapTextDirection formatter
		assert.equal(this.oHTMLElement._mapTextDirection(TextDirection.LTR), "ltr", "_mapTextDirection(LTR) returns 'ltr'");
		assert.equal(this.oHTMLElement._mapTextDirection(TextDirection.RTL), "rtl", "_mapTextDirection(RTL) returns 'rtl'");
		assert.equal(this.oHTMLElement._mapTextDirection(TextDirection.Inherit), null, "_mapTextDirection(Inherit) returns null");
	});

	QUnit.test("Destroy functionality", async function(assert) {
		this.oHTMLElement = new this.SimpleHTMLElement();
		this.oHTMLElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		const oDomRef = this.oHTMLElement.getDomRef();
		assert.ok(oDomRef, "DOM reference exists before destroy");

		this.oHTMLElement.destroy();
		assert.ok(this.oHTMLElement.bIsDestroyed, "HTMLElement is marked as destroyed");

		// Reset the reference so afterEach doesn't try to destroy again
		this.oHTMLElement = null;
	});

	QUnit.module("HTMLElement Error Handling", {
		beforeEach: function() {
			this.FaultyHTMLElement = HTMLElement.extend("test.FaultyHTMLElement", {
				metadata: {
					tag: "faulty-element",
					properties: {
						invalidMapping: {
							type: "string",
							mapping: "invalid-mapping-type"
						}
					},
					aggregations: {
						// Missing slot information
						children: {
							type: "sap.ui.core.Control",
							multiple: true
						}
					}
				}
			});
		}
	});

	QUnit.test("Invalid metadata handling", function(assert) {
		// Should not throw an error even with faulty metadata
		const oElement = new this.FaultyHTMLElement();
		assert.ok(oElement, "HTMLElement with faulty metadata can be created");
		oElement.destroy();
	});

	QUnit.module("HTMLElement Rendering", {
		beforeEach: function() {
			this.RenderingHTMLElement = HTMLElement.extend("test.RenderingHTMLElement", {
				metadata: {
					tag: "rendering-element",
					properties: {
						title: {
							type: "string",
							mapping: "property"
						},
						backgroundColor: {
							type: "sap.ui.core.CSSColor",
							mapping: {
								type: "style",
								to: "background-color"
							}
						},
						label: {
							type: "string",
							mapping: "textContent"
						},
						hidden: {
							type: "boolean",
							mapping: "property"
						}
					}
				}
			});
		}
	});

	QUnit.test("Rendering with different property mappings", async function(assert) {
		const oElement = new this.RenderingHTMLElement({
			title: "Test Title",
			backgroundColor: "red",
			label: "Test Label",
			hidden: true
		});

		oElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		const oDomRef = oElement.getDomRef();

		assert.equal(oDomRef.getAttribute("title"), "Test Title", "Property attribute is rendered correctly");
		assert.equal(oDomRef.style.backgroundColor, "red", "Style property is rendered correctly");
		assert.equal(oDomRef.textContent, "Test Label", "TextContent property is rendered correctly");
		assert.ok(oDomRef.hasAttribute("hidden"), "Boolean property is rendered as attribute");

		oElement.destroy();
	});

	QUnit.test("Re-rendering after property changes", async function(assert) {
		const oElement = new this.RenderingHTMLElement({
			title: "Initial Title",
			label: "Initial Label"
		});

		oElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		let oDomRef = oElement.getDomRef();
		assert.equal(oDomRef.getAttribute("title"), "Initial Title", "Initial title is correct");
		assert.equal(oDomRef.textContent, "Initial Label", "Initial label is correct");

		// Change properties
		oElement.setTitle("Updated Title");
		oElement.setLabel("Updated Label");
		await nextUIUpdate();

		oDomRef = oElement.getDomRef();
		assert.equal(oDomRef.getAttribute("title"), "Updated Title", "Title is updated after re-rendering");
		assert.equal(oDomRef.textContent, "Updated Label", "Label is updated after re-rendering");

		oElement.destroy();
	});

	QUnit.module("HTMLElement Accessibility", {
		beforeEach: function() {
			this.AccessibleHTMLElement = HTMLElement.extend("test.AccessibleHTMLElement", {
				metadata: {
					tag: "accessible-element",
					associations: {
						ariaLabelledBy: {
							type: "sap.ui.core.Control",
							multiple: true,
							mapping: {
								type: "property",
								to: "aria-labelledby",
								formatter: "_getAriaLabelledByForRendering"
							}
						}
					}
				}
			});
		}
	});

	QUnit.test("Aria labelling association", function(assert) {
		const oLabel1 = new Control({ id: "label1" });
		const oLabel2 = new Control({ id: "label2" });
		const oElement = new this.AccessibleHTMLElement();

		oElement.addAriaLabelledBy(oLabel1);
		oElement.addAriaLabelledBy(oLabel2);

		assert.equal(oElement.getAriaLabelledBy().length, 2, "Two aria labels added");
		assert.equal(oElement.getAriaLabelledBy()[0], "label1", "First aria label ID is correct");
		assert.equal(oElement.getAriaLabelledBy()[1], "label2", "Second aria label ID is correct");

		oElement.destroy();
		oLabel1.destroy();
		oLabel2.destroy();
	});

	QUnit.module("HTMLElement Advanced Features", {
		beforeEach: function() {
			this.AdvancedHTMLElement = HTMLElement.extend("test.AdvancedHTMLElement", {
				metadata: {
					tag: "advanced-element",
					properties: {
						complexObject: {
							type: "object",
							mapping: "property"
						},
						slotText: {
							type: "string",
							mapping: "slot"
						}
					},
					aggregations: {
						slotContent: {
							type: "sap.ui.core.Control",
							multiple: true,
							slot: "content"
						}
					},
					events: {
						change: {
							parameters: {
								newValue: { type: "string" },
								oldValue: { type: "string" }
							}
						}
					},
					methods: ["publicMethod"],
					getters: ["complexValue"]
				},

				publicMethod: function(param) {
					return "public method called with: " + param;
				},

				getComplexValue: function() {
					return { computed: true, value: this.getComplexObject() };
				}
			});
		}
	});

	QUnit.test("Object property handling", async function(assert) {
		const oComplexObj = { key: "value", nested: { prop: 123 } };
		const oElement = new this.AdvancedHTMLElement({
			complexObject: oComplexObj
		});

		assert.deepEqual(oElement.getComplexObject(), oComplexObj, "Object property is stored correctly");

		oElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		// Object properties should be set on the DOM element after rendering
		const oDomRef = oElement.getDomRef();
		assert.deepEqual(oDomRef.complexObject, oComplexObj, "Object property is set on DOM element");

		oElement.destroy();
	});

	QUnit.test("Slot property mapping", async function(assert) {
		const oElement = new this.AdvancedHTMLElement({
			slotText: "Slot Content Text"
		});

		oElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		// Note: Actual slot rendering depends on the renderer implementation
		// This tests the basic property setup
		assert.equal(oElement.getSlotText(), "Slot Content Text", "Slot text property is stored correctly");		oElement.destroy();
	});

	QUnit.test("Slot aggregation", function(assert) {
		const oChild = new Control({ id: "slotChild" });
		const oElement = new this.AdvancedHTMLElement();

		oElement.addSlotContent(oChild);
		assert.equal(oElement.getSlotContent().length, 1, "Child added to slot aggregation");
		assert.equal(oElement.getSlotContent()[0].getId(), "slotChild", "Child ID is correct");

		oElement.destroy();
	});

	QUnit.test("Methods and getters metadata", function(assert) {
		const oElement = new this.AdvancedHTMLElement();
		const oMetadata = oElement.getMetadata();

		assert.deepEqual(oMetadata.getMethods(), ["publicMethod"], "Methods are defined in metadata");
		assert.deepEqual(oMetadata.getGetters(), ["complexValue"], "Getters are defined in metadata");

		// Test if the actual methods exist
		assert.equal(typeof oElement.publicMethod, "function", "Public method exists on instance");
		assert.equal(typeof oElement.getComplexValue, "function", "Getter method exists on instance");

		assert.equal(oElement.publicMethod("test"), "public method called with: test", "Public method works correctly");

		oElement.destroy();
	});

	QUnit.module("HTMLElement Internal Methods", {
		beforeEach: function() {
			this.InternalTestElement = HTMLElement.extend("test.InternalTestElement", {
				metadata: {
					tag: "internal-element",
					properties: {
						testProp: {
							type: "string",
							mapping: "property"
						}
					},
					events: {
						internalEvent: {
							parameters: {
								detail: { type: "object" }
							}
						}
					}
				}
			});
		}
	});

	QUnit.test("_updateObjectProperties method", async function(assert) {
		const oElement = new this.InternalTestElement({
			testProp: "test-value"
		});

		oElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		const oDomRef = oElement.getDomRef();

		// Test that the method is called during rendering
		assert.ok(typeof oElement._updateObjectProperties === "function", "_updateObjectProperties method exists");

		// Test direct call
		oElement._updateObjectProperties(oDomRef);

		oElement.destroy();
	});

	QUnit.test("Event handling methods", function(assert) {
		const oElement = new this.InternalTestElement();

		assert.ok(typeof oElement._attachCustomEventsListeners === "function", "_attachCustomEventsListeners method exists");
		assert.ok(typeof oElement._detachCustomEventsListeners === "function", "_detachCustomEventsListeners method exists");
		assert.ok(typeof oElement._handleCustomEvent === "function", "_handleCustomEvent method exists");
		assert.ok(typeof oElement._formatEventData === "function", "_formatEventData method exists");

		oElement.destroy();
	});

	QUnit.test("_formatEventData method", function(assert) {
		const oElement = new this.InternalTestElement();

		// Test with non-object data
		const result1 = oElement._formatEventData("simple string");
		assert.deepEqual(result1, {}, "Non-object data returns empty object");

		// Test with object data
		const testData = { key: "value", number: 123 };
		const result2 = oElement._formatEventData(testData);
		assert.deepEqual(result2, testData, "Object data is processed correctly");

		oElement.destroy();
	});

	QUnit.test("Property initialization check", function(assert) {
		const oElement = new this.InternalTestElement();

		// Property not set - should be initial
		assert.ok(oElement.isPropertyInitial("testProp"), "Unset property is initial");

		// Set property - should not be initial
		oElement.setTestProp("value");
		assert.notOk(oElement.isPropertyInitial("testProp"), "Set property is not initial");

		oElement.destroy();
	});

	QUnit.module("HTMLElement Edge Cases", {
		beforeEach: function() {
			this.EdgeCaseElement = HTMLElement.extend("test.EdgeCaseElement", {
				metadata: {
					tag: "edge-case-element",
					properties: {
						nullableProperty: {
							type: "string",
							defaultValue: "",
							mapping: "property"
						}
					}
				}
			});
		}
	});

	QUnit.test("Null and undefined property values", function(assert) {
		const oElement = new this.EdgeCaseElement();

		// Test initial value (should be empty string for string type)
		assert.strictEqual(oElement.getNullableProperty(), "", "Initial value is empty string for string type");

		// Test setting null value - UI5 normalizes null to default value (empty string for string type)
		oElement.setNullableProperty(null);
		assert.strictEqual(oElement.getNullableProperty(), "", "Null value is normalized to empty string");

		// Test setting undefined value - UI5 normalizes undefined to default value (empty string for string type)
		oElement.setNullableProperty(undefined);
		assert.strictEqual(oElement.getNullableProperty(), "", "Undefined value is normalized to empty string");

		// Test setting a valid value
		oElement.setNullableProperty("test");
		assert.strictEqual(oElement.getNullableProperty(), "test", "Valid string value is handled correctly");

		oElement.destroy();
	});

	QUnit.test("Element without DOM reference", function(assert) {
		const oElement = new this.EdgeCaseElement();

		// Test calling methods that require DOM reference before rendering
		try {
			const oFocusInfo = oElement.getFocusInfo();
			assert.ok(oFocusInfo, "getFocusInfo works without DOM reference");
		} catch (e) {
			assert.ok(false, "getFocusInfo should not throw without DOM reference");
		}

		oElement.destroy();
	});

	QUnit.module("HTMLElement Native Event Listeners", {
		before: function() {
			// Test class with custom events
			this.EventElement = HTMLElement.extend("test.EventElement", {
				metadata: {
					tag: "event-test-element",
					events: {
						press: {},
						select: {},
						doubleClick: {} // maps to the hyphenated native event name "double-click"
					}
				}
			});
		},
		afterEach: function() {
			if (this.oHTMLElement) {
				this.oHTMLElement.destroy();
				this.oHTMLElement = null;
			}
			this.EventElement = null;
		}
	});

	// Records the type of every addEventListener/removeEventListener call on a DOM node
	function spyNativeListeners(oDomRef) {
		const aAdded = [];
		const aRemoved = [];
		const fnAdd = oDomRef.addEventListener.bind(oDomRef);
		const fnRemove = oDomRef.removeEventListener.bind(oDomRef);
		oDomRef.addEventListener = function(sType) {
			aAdded.push(sType);
			return fnAdd.apply(this, arguments);
		};
		oDomRef.removeEventListener = function(sType) {
			aRemoved.push(sType);
			return fnRemove.apply(this, arguments);
		};
		return { added: aAdded, removed: aRemoved };
	}

	QUnit.test("Only used events get a native listener on initial rendering", async function(assert) {
		this.oHTMLElement = new this.EventElement();
		this.oHTMLElement.attachPress(function() {});

		// Track which event ids are handled during onAfterRendering
		const aConnected = [];
		const fnOrig = this.oHTMLElement._connectNativeEvent;
		this.oHTMLElement._connectNativeEvent = function(sEventId, bDeregister) {
			if (!bDeregister) {
				aConnected.push(sEventId);
			}
			return fnOrig.apply(this, arguments);
		};

		this.oHTMLElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		assert.deepEqual(aConnected, ["press"],
			"Native listener is wired only for the attached event, not for unused events");
	});

	QUnit.test("event listener is called when native DOM event is dispatched", async function(assert) {
		this.oHTMLElement = new this.EventElement();
		let oFiredEvent = null;
		this.oHTMLElement.attachPress(function(oEvent) {
			oFiredEvent = oEvent;
		});

		this.oHTMLElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		this.oHTMLElement.getDomRef().dispatchEvent(new window.CustomEvent("press", { detail: {} }));

		assert.ok(oFiredEvent, "UI5 event listener is called when a native event is dispatched");
	});

	QUnit.test("Attaching event after rendering connects the native listener", async function(assert) {
		this.oHTMLElement = new this.EventElement();
		this.oHTMLElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		const oDomRef = this.oHTMLElement.getDomRef();
		const oSpy = spyNativeListeners(oDomRef);

		let bFired = false;
		this.oHTMLElement.attachPress(function() {
			bFired = true;
		});

		assert.deepEqual(oSpy.added, ["press"], "Native listener is added when a listener is attached after rendering");

		oDomRef.dispatchEvent(new window.CustomEvent("press", { detail: {} }));
		assert.ok(bFired, "Late listener fires on the native event");
	});

	QUnit.test("Detaching the last listener removes the native listener and stops firing", async function(assert) {
		this.oHTMLElement = new this.EventElement();
		let iCount = 0;
		const fnHandler = function() {
			iCount++;
		};
		this.oHTMLElement.attachPress(fnHandler);
		this.oHTMLElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		const oDomRef = this.oHTMLElement.getDomRef();
		oDomRef.dispatchEvent(new window.CustomEvent("press", { detail: {} }));
		assert.equal(iCount, 1, "listener fires while it is attached");

		const oSpy = spyNativeListeners(oDomRef);
		this.oHTMLElement.detachPress(fnHandler);

		assert.deepEqual(oSpy.removed, ["press"], "Native listener is removed when the last listener is detached");

		oDomRef.dispatchEvent(new window.CustomEvent("press", { detail: {} }));
		assert.equal(iCount, 1, "listener no longer fires after being detached");
	});

	QUnit.test("Detaching one of several listeners keeps the native listener", async function(assert) {
		this.oHTMLElement = new this.EventElement();
		let iCount = 0;
		const fnFirst = function() {
			iCount++;
		};
		const fnSecond = function() {
			iCount++;
		};
		this.oHTMLElement.attachPress(fnFirst);
		this.oHTMLElement.attachPress(fnSecond);
		this.oHTMLElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		const oDomRef = this.oHTMLElement.getDomRef();
		const oSpy = spyNativeListeners(oDomRef);

		this.oHTMLElement.detachPress(fnFirst);
		assert.deepEqual(oSpy.removed, [],
			"Native listener is kept while another listener for the same event remains");

		iCount = 0;
		oDomRef.dispatchEvent(new window.CustomEvent("press", { detail: {} }));
		assert.equal(iCount, 1, "Remaining listener still fires");
	});

	QUnit.test("Non-custom events in the registry are ignored and do not throw", async function(assert) {
		this.oHTMLElement = new this.EventElement();
		this.oHTMLElement.placeAt("html-element-fixture-container");
		await nextUIUpdate();

		const oDomRef = this.oHTMLElement.getDomRef();
		const oSpy = spyNativeListeners(oDomRef);

		// "validationSuccess" is an inherited event from ManagedObject, not an event of the sample control
		this.oHTMLElement.attachEvent("validationSuccess", function() {});
		assert.deepEqual(oSpy.added, [], "No native listener is added for a non-custom event");

		// Force a re-render so both the detach and attach listener loops iterate the registry,
		// which now contains the non-custom event id.
		this.oHTMLElement.invalidate();
		await nextUIUpdate();

		assert.ok(true, "Re-rendering with a non-custom event in the registry does not throw");
	});
});
