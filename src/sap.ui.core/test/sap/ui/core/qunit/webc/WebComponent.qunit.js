/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/webc/WebComponent",
	"sap/ui/test/actions/Press",
	"webc/fixtures/BasicUI5Control",
	"webc/fixtures/ControlWrapper",
	"webc/fixtures/LabelWrapper",
	"webc/helper/renderingFor",
	"webc/helper/WebcWrapperPool",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(
	coreLibrary,
	WebComponent,
	Press,
	BasicUI5Control,
	ControlWrapper,
	LabelWrapper,
	renderingFor,
	WebcWrapperPool,
	createAndAppendDiv
) {
	"use strict";

	createAndAppendDiv("webc-fixture-container");
	const coreValueStateEnum = coreLibrary.ValueState;


	QUnit.module("Metadata", {
		beforeEach: function () {
		},
		afterEach: async function() {
			// clean up the pool after each test, so we don't leak anything
			// the pool automatically awaits the rendering, so that we can start with a clean DOM
			await WebcWrapperPool.clear();
		}
	});

	QUnit.test("Faulty metadata", async function(assert) {
		const MyFaultyClass = WebComponent.extend("faulty.class", {
			metadata: {
				// no tag
				properties: {
					// bad mapping, should not lead to issues
					text: {
						type: "string",
						mapping: 6
					}
				},
				associations: {
					wrongMapping: {
						type: "sap.ui.core.Control"
						// no mapping is given --> ignore
					}
				}
			}
		});

		assert.ok(MyFaultyClass, "WebComponentMetadata creation does not fail");

		await Promise.resolve();
	});

	QUnit.test("Getter/Method already defined on prototype", async function(assert) {
		const MyClass = WebComponent.extend("faulty.class", {
			metadata: {
				properties: {
					text: {
						type: "string"
					}
				},
				methods: ["myExistingMethod"],
				getters: ["text"]
			},
			getText() {
				return "my fixed text";
			},
			myExistingMethod() {
				return "existing method must be present";
			}
		});

		const myc = new MyClass();

		assert.equal(myc.getText(), "my fixed text", "Getter on prototype is not overwritten.");
		assert.equal(myc.myExistingMethod(), "existing method must be present", "Method on prototype is not overwritten.");

		assert.deepEqual(myc.getMetadata().getGetters(), ["text"], "Metadata defined 'getters' are returned.");
		assert.deepEqual(myc.getMetadata().getMethods(), ["myExistingMethod"], "Metadata defined 'methods' are returned.");

		myc.destroy();

		await Promise.resolve();
	});

	QUnit.test("Custom Renderer defined", async function(assert) {
		const oRenderer = {
			apiVersion: 2,
			render() {}
		};

		const MyClass = WebComponent.extend("faulty.class", {
			metadata: {
				properties: {
					text: {
						type: "string"
					}
				}
			},
			renderer: oRenderer
		});

		assert.ok(MyClass.getMetadata().getRenderer(), "WebComponentMetadata allows for custom renderer.");

		await Promise.resolve();
	});

	QUnit.module("Properties", {
		beforeEach: function () {
		},
		afterEach: async function() {
			// clean up the pool after each test, so we don't leak anything
			// the pool automatically awaits the rendering, so that we can start with a clean DOM
			await WebcWrapperPool.clear();
		}
	});

	QUnit.test("Getter and Setter - simple", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			text: "text in content",
			myWidth: "100%",
			height: "200px",
			borderWidth: "2px",
			otherText: "OtherText",
			propProp: {
				"key": "value"
			},
			slotProp: "SlotText",
			otherSlotProp: "OtherSlotText",
			noneProp: 1337
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		// Property getters
		assert.equal(myWebComponent.getText(), "text in content", "Property \"text\" is correct!");
		assert.equal(myWebComponent.getMyWidth(), "100%", "Property \"myWidth\" is correct!");
		assert.equal(myWebComponent.getHeight(), "200px", "Property \"height\" is correct!");
		assert.equal(myWebComponent.getBorderWidth(), "2px", "Property \"borderWidth\" is correct!");
		assert.deepEqual(myWebComponent.getPropProp(), {
			"key": "value"
		}, "Property \"propProp\" is correct!");
		assert.equal(myWebComponent.getSlotProp(), "SlotText", "Property \"slotProp\" is correct!");
		assert.equal(myWebComponent.getOtherSlotProp(), "OtherSlotText", "Property \"otherSlotProp\" is correct!");
		assert.equal(myWebComponent.getNoneProp(), 1337, "Property \"noneProp\" is correct!");
		assert.equal(myWebComponent.getOtherText(), "OtherText", "Property \"otherText\" is correct!");

		// Render output after setting properties
		const domRef = myWebComponent.getDomRef();

		// properties
		assert.equal(domRef.firstChild?.textContent, "text in content", "Text content is correctly rendered.");
		assert.equal(domRef.dataset.sapUi, "creationTest", "ID is correctly set in data-sap-ui attribute.");
		assert.equal(domRef.getAttribute("other-text"), "OtherText", "'otherText' property is correctly rendered as an attribute.");
		assert.equal(domRef.getAttribute("observed-prop"), "TestValue", "'observedProp' property is correctly rendered as an attribute.");
		assert.equal(domRef.style.width, "100%", "'width' is correctly rendered as '100%' in 'style' attribute.");
		assert.equal(domRef.style.height, "200px", "'height' is correctly rendered as '200px' in 'style' attribute.");

		// slots
		assert.ok(domRef.querySelector("div[slot=\"slotProp\"]"), "'slotProp' slot has correct node type (querySelector 'div' matched).");
		assert.equal(domRef.querySelector("div[slot=\"slotProp\"]")?.textContent, "SlotText", "'slotProp' slot has correct text content.");

		assert.ok(domRef.querySelector("span[slot=\"otherSlotProp\"]"), "'otherSlotProp' slot has correct node type (querySelector 'span' matched).");
		assert.equal(domRef.querySelector("span[slot=\"otherSlotProp\"]")?.textContent, "OtherSlotText", "'otherSlotProp' slot has correct text content.");
	});

	QUnit.test("Busy Indication", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			text: "Text",
			height: "100%"
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		myWebComponent.setBusyIndicatorDelay(0);

		myWebComponent.setBusy(true);
		myWebComponent.setBusy(true);
		myWebComponent.setBusy(false);
		myWebComponent.setBusy(true);

		assert.equal(myWebComponent.getBusy(), true, "External busy state is maintained correctly.");

		await new Promise((res) => {
			setTimeout(async () => {
				await renderingFor(myWebComponent);
				// Note: the attribute exists, thus it's an empty string.
				//       If an attribute does not exist, the DOM API returns null.
				assert.equal(myWebComponent.getDomRef().getAttribute("__is-busy"), "", "Busy attribute is correctly rendered.");
				assert.equal(myWebComponent.getProperty("__isBusy"), true, "Internal property correctly set after busy inidcator timeout");
				res();
			}, myWebComponent.getBusyIndicatorDelay() + 100);
		});

	});

	QUnit.test("Enabled mapping & propagation", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "enabledTest",
			enabled: false
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		// Note: enabled true means we will see "disabled" in the DOM, though without a value
		assert.equal(myWebComponent.getDomRef().getAttribute("disabled"), "", "'enabled' is mapped to 'disabled'");
	});

	QUnit.test("'textDirection' to 'dir' mapping", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "textDirectionTest",
			textDirection: coreLibrary.TextDirection.RTL
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		assert.equal(myWebComponent.getDomRef().getAttribute("dir"), "rtl", "'text-direction' was correctly mapped to 'dir'");
	});

	QUnit.test("'valueState' and 'valueStateText' mapping", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			myWidth: "100%",
			height: "100%",
			valueState: coreValueStateEnum.Error,
			valueStateText: "Error message"
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		assert.strictEqual(myWebComponent.getDomRef().getAttribute("value-state"), "Negative", "Value state is correctly rendered.");
		assert.strictEqual(myWebComponent.getDomRef().querySelector("div[slot=\"valueStateMessage\"]").textContent, "Error message", "Value state text is correctly rendered.");

		myWebComponent.setValueState(coreValueStateEnum.Success);
		myWebComponent.setValueStateText("Success message");

		await renderingFor(myWebComponent);

		assert.strictEqual(myWebComponent.getDomRef().getAttribute("value-state"), "Positive", "Value state is correctly rendered.");
		assert.strictEqual(myWebComponent.getDomRef().querySelector("div[slot=\"valueStateMessage\"]").textContent, "Success message", "Value state text is correctly rendered.");

		// Test property update after attribute change
		myWebComponent.getDomRef().setAttribute("value-state", "Critical");

		assert.strictEqual(myWebComponent.getValueState(), coreValueStateEnum.Warning, "Value state is correctly rendered.");
	});

	QUnit.test("Changing attributes without invalidation", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "invalidationTest",
			observedProp: "100%"
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		// Test property update after attribute change
		myWebComponent.getDomRef().setAttribute("observed-prop", "123px");
		assert.strictEqual(myWebComponent.getObservedProp(), "100%", "Unmanaged attribute change did not lead to a property update.");

		// ignore attribute change for unobserved property
		const setPropertySpy = sinon.spy(myWebComponent, "setProperty");
		myWebComponent.getDomRef().setAttribute("unobserved-prop", "abc");

		assert.equal(setPropertySpy.callCount, 0, "setProperty() was not called for unobserved attribute");
	});


	QUnit.module("Aggregations", {
		beforeEach: function () {
		},
		afterEach: async function() {
			// clean up the pool after each test, so we don't leak anything
			// the pool automatically awaits the rendering, so that we can start with a clean DOM
			await WebcWrapperPool.clear();
		}
	});

	QUnit.test("Getters (basic)", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			content: [
				new BasicUI5Control({ text: "Content" })
			],
			header: [
				new BasicUI5Control({ text: "Header" })
			]
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		// Aggregation getter
		assert.equal(myWebComponent.getContent().length, 1, "Aggregation \"content\" is filled!");
		assert.equal(myWebComponent.getContent()[0].getText(), "Content", "Aggregation \"content\" is correct!");
		assert.equal(myWebComponent.getHeader().length, 1, "Aggregation \"header\" is filled!");
		assert.equal(myWebComponent.getHeader()[0].getText(), "Header", "Aggregation \"header\" is correct!");
	});

	QUnit.test("Mutators - Set", async function(assert) {
		const originalSingleControl = new BasicUI5Control({ text: "one single control" });

		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			single: originalSingleControl
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		// only one element is in the aggregation
		assert.equal(myWebComponent.getSingle(), originalSingleControl, "Aggregation 'single' is correctly filled.");

		// First rendering check if
		const singleSlot = myWebComponent.getDomRef().querySelectorAll("div[slot=single]");
		assert.equal(singleSlot.length, 1, "'single' aggregation (multiple='false') has only one element it the corresponding slot 'single'");

		// overwrite the aggregation
		const newSingleControl = new BasicUI5Control({ text: "new single control" });
		myWebComponent.setSingle(newSingleControl);

		// assert rendering output
		await renderingFor(myWebComponent);
		const singleSlotAfterChange = myWebComponent.getDomRef().querySelectorAll("div[slot=single]");
		assert.equal(singleSlotAfterChange.length, 1, "Correct amount of controls rendered with slot='single'");
	});

	/**
	 * Setting a managed aggregation, must not write a slot into the DOM.
	 */
	QUnit.test("Mutators - Managed aggregations", async function(assert) {
		const depControl = new BasicUI5Control({ text: "one single control" });

		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "setAggrTest",
			text: "Hello"
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		myWebComponent.addDependent(depControl);

		await renderingFor(myWebComponent);

		// only one element is in the aggregation
		assert.deepEqual(myWebComponent.getDependents(), [depControl], "Aggregation 'dependents' is correctly filled.");

		// First rendering check if
		const depSlot = myWebComponent.getDomRef().querySelectorAll("div[slot=dependents]");
		assert.equal(depSlot.length, 0, "'dependents' slot has no elements");
	});

	QUnit.test("Mutators - Add", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			content: [
				new BasicUI5Control({ text: "1st 'content' control" })
			],
			header: [
				new BasicUI5Control({ text: "1st 'header' control" })
			]
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		// Adding elements (content)
		const contentBeforeChange = myWebComponent.getContent();
		const newContentControl = new BasicUI5Control({ text: "2nd 'content' control" });

		myWebComponent.addContent(newContentControl);
		assert.equal(myWebComponent.getContent().length, 2, "Length of 'content' aggregation is correct adding an element.");
		assert.deepEqual(myWebComponent.getContent(), [...contentBeforeChange, newContentControl], "'content' aggregation is correct after adding an element.");

		// adding elements (header slot)
		const headerBeforeChange = myWebComponent.getHeader();
		const newHeaderControl = new BasicUI5Control({ text: "2nd 'header' control" });

		myWebComponent.addHeader(newHeaderControl);
		assert.equal(myWebComponent.getHeader().length, 2, "Length of 'header' aggregation is correct adding an element.");
		assert.deepEqual(myWebComponent.getHeader(), [...headerBeforeChange, newHeaderControl], "'header' aggregation is correct after adding an element.");

		await renderingFor(myWebComponent);

		// assert rendering output
		// content slot is default, so no "slot" attribute must be present
		const contentSlot = myWebComponent.getDomRef().querySelectorAll("div:not([slot])");
		assert.equal(contentSlot.length, 2, "Correct amount of controls rendered with slot='header'");

		// header slot is NOT default, so we need a slot attribute in the DOM
		const headerSlot = myWebComponent.getDomRef().querySelectorAll("div[slot=header]");
		assert.equal(headerSlot.length, 2, "Correct amount of controls rendered with slot='header'");
	});

	QUnit.test("Mutators - Insert", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			content: [
				new BasicUI5Control({ text: "1st 'content' control" }),
				new BasicUI5Control({ text: "2nd 'content' control" })
			],
			header: [
				new BasicUI5Control({ text: "1st 'header' control" }),
				new BasicUI5Control({ text: "2nd 'header' control" })
			]
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		// inserting elements (content)
		const updatedContent = myWebComponent.getContent();
		const newContentControl = new BasicUI5Control({ text: "3rd 'content' control" });

		myWebComponent.insertContent(newContentControl, 1);
		updatedContent.splice(1, 0, newContentControl);
		assert.equal(myWebComponent.getContent().length, 3, "Length of 'content' aggregation is correct after insert.");
		assert.deepEqual(myWebComponent.getContent(), updatedContent, "'content' aggregation is correct after insert.");

		// inserting elements (header slot)
		const updatedHeader = myWebComponent.getHeader();
		const newHeaderControl = new BasicUI5Control({ text: "3rd 'header' control" });

		myWebComponent.insertHeader(newHeaderControl, 1);
		updatedHeader.splice(1, 0, newHeaderControl);

		assert.equal(myWebComponent.getHeader().length, 3, "Length of 'header' aggregation is correct after insert.");
		assert.deepEqual(myWebComponent.getHeader(), updatedHeader, "'header' aggregation is correct after insert.");

		await renderingFor(myWebComponent);

		// assert rendering output
		// content slot is default, so no "slot" attribute must be present
		const contentSlot = myWebComponent.getDomRef().querySelectorAll("div:not([slot])");
		assert.equal(contentSlot.length, 3, "Correct amount of controls rendered with slot='header'");

		// header slot is NOT default, so we need a slot attribute in the DOM
		const headerSlot = myWebComponent.getDomRef().querySelectorAll("div[slot=header]");
		assert.equal(headerSlot.length, 3, "Correct amount of controls rendered with slot='header'");
	});

	QUnit.test("Mutators - Remove", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			content: [
				new BasicUI5Control({ text: "1st 'content' control", id: "firstContentControl" }),
				new BasicUI5Control({ text: "2nd 'content' control" })
			],
			header: [
				new BasicUI5Control({ text: "1st 'header' control", id: "firstHeaderControl" }),
				new BasicUI5Control({ text: "2nd 'header' control" })
			]
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);


		// removing elements (content)
		const updatedContent = myWebComponent.getContent();
		updatedContent.splice(0, 1);

		const removedContentControl = myWebComponent.removeContent(0);

		assert.equal(removedContentControl.getId(), "firstContentControl", "Element removed from the 'content' aggregation is correctly returned");
		assert.equal(myWebComponent.getContent().length, 1, "Length of 'content' aggregation is correct after removal.");
		assert.deepEqual(myWebComponent.getContent(), updatedContent, "'content' aggregation is correct after removal.");

		// inserting elements (header slot)
		const updatedHeader = myWebComponent.getHeader();
		updatedHeader.splice(0, 1);

		const removedHeaderControl = myWebComponent.removeHeader(0);

		assert.equal(removedHeaderControl.getId(), "firstHeaderControl", "Element removed from the 'header' aggregation is correctly returned");
		assert.equal(myWebComponent.getHeader().length, 1, "Length of 'header' aggregation is correct after insert.");
		assert.deepEqual(myWebComponent.getHeader(), updatedHeader, "'header' aggregation is correct after insert.");

		// assert rendering output
		await renderingFor(myWebComponent);

		// content slot is default, so no "slot" attribute must be present
		const contentSlot = myWebComponent.getDomRef().querySelectorAll("div:not([slot])");
		assert.equal(contentSlot.length, 1, "Correct amount of controls rendered with slot='header'");

		// header slot is NOT default, so we need a slot attribute in the DOM
		const headerSlot = myWebComponent.getDomRef().querySelectorAll("div[slot=header]");
		assert.equal(headerSlot.length, 1, "Correct amount of controls rendered with slot='header'");


		// finally remove everything
		myWebComponent.removeAllContent();
		myWebComponent.removeAllHeader();

		// assert rendering output
		await renderingFor(myWebComponent);

		// content slot is default, so no "slot" attribute must be present
		const contentSlotAfterRemoveAll = myWebComponent.getDomRef().querySelectorAll("div:not([slot])");
		assert.equal(contentSlotAfterRemoveAll.length, 0, "Correct amount of controls rendered with slot='header'");

		// header slot is NOT default, so we need a slot attribute in the DOM
		const headerSlotAfterRemoveAll = myWebComponent.getDomRef().querySelectorAll("div[slot=header]");
		assert.equal(headerSlotAfterRemoveAll.length, 0, "Correct amount of controls rendered with slot='header'");
	});

	QUnit.module("Associations", {
		beforeEach: function () {
		},
		afterEach: async function() {
			// clean up the pool after each test, so we don't leak anything
			// the pool automatically awaits the rendering, so that we can start with a clean DOM
			await WebcWrapperPool.clear();
		}
	});

	QUnit.test("Getter and Setter", async function(assert) {
		await Promise.resolve();

		const labelControlForAssociation = await WebcWrapperPool.create(LabelWrapper, { id: "ariaLabelAssociation", text: "Label for Rendering" });

		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "associatedControl",
			ariaLabelledBy: labelControlForAssociation
		});

		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		// first test the aria label
		assert.equal(myWebComponent.getDomRef().getAttribute("accessible-name-ref"), labelControlForAssociation.getId(), "Aria label correctly referenced.");

		// LabelWrapper is a wrapped web component that represents a simple label.
		const myLabelComponent = await WebcWrapperPool.create(LabelWrapper, {
			id: "labelTest",
			text: "Hello from the QUnit test :)",
			// associate the control
			labelFor: myWebComponent
		});

		// place into DOM and wait for first rendering
		myLabelComponent.placeAt("webc-fixture-container");
		await renderingFor(myLabelComponent);

		// getter (initial)
		assert.equal(myLabelComponent.getLabelFor(), "associatedControl", "Association 'labelFor' is filled correctly.");

		// setter
		const myWebComponent2 = await WebcWrapperPool.create(ControlWrapper, {
			id: "associatedControl2"
		});
		myLabelComponent.setLabelFor(myWebComponent2);

		assert.equal(myLabelComponent.getLabelFor(), "associatedControl2", "Association 'labelFor' is filled correctly after updating it.");

		// assert rendering output
		await renderingFor(myLabelComponent);

		const domRef = myLabelComponent.getDomRef();
		assert.equal(domRef.getAttribute("for"), "associatedControl2", "Association 'labelFor' is correctly rendered to 'for' attribute.");
	});

	QUnit.module("Events", {
		beforeEach: function () {},
		afterEach: async function() {
			// clean up the pool after each test, so we don't leak anything
			// the pool automatically awaits the rendering, so that we can start with a clean DOM
			await WebcWrapperPool.clear();
		}
	});

	QUnit.test("Event handling", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			myWidth: "100%",
			height: "100%",
			pressAction: (oEvent) => {
				assert.strictEqual(oEvent.getParameter("target"), oEvent.getSource(), "Event handler was called!");
			}
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		new Press().executeOn(myWebComponent);
	});

	QUnit.module("Read-only attributes and methods", {
		beforeEach: function () {},
		afterEach: async function() {
			// clean up the pool after each test, so we don't leak anything
			// the pool automatically awaits the rendering, so that we can start with a clean DOM
			await WebcWrapperPool.clear();
		}
	});

	QUnit.test("getter only", async function(assert) {
		const wordsToSay = ["this", "is", "a", "test"];
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			myWidth: "100%",
			height: "100%"
		});

		assert.throws(() => {
			myWebComponent.getWordsToSay();
		}, new Error("Getter called before custom element has been created by: " + myWebComponent.getId()), "Getter throws an error before the custom element has been created.");

		assert.throws(() => {
			myWebComponent.say(wordsToSay);
		}, new Error("Method called before custom element has been created by: " + myWebComponent.getId()), "Method throws an error before the custom element has been created.");

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		assert.strictEqual(myWebComponent.say(wordsToSay), null, "Function has correct return value 'null'.");
		assert.strictEqual(myWebComponent.getDomRef().shadowRoot.querySelector("span").textContent, "this is a test", "Read-only attribute is correctly rendered.");
		assert.deepEqual(myWebComponent.getWordsToSay(), wordsToSay, "Read-only attribute is correctly returned.");
	});

	QUnit.test("method calls", async function(assert) {
		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "methodTest",
			header: [
				new BasicUI5Control({ text: "header" })
			]
		});

		// place into DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		// public method on webcomponent: (UI5-Control, function(domRef:HTMLElement))
		const result = myWebComponent.processElement(myWebComponent.getHeader()[0], (domRef) => {
			assert.equal(myWebComponent.getHeader()[0].getDomRef(), domRef, "callback is called with DOM ref of UI5 control");
		});

		// return value must be the UI5 control again
		// the DOMRef is reconverted into a UI5 Control again.
		assert.equal(myWebComponent.getHeader()[0], result, "return value of public method (on UI5 level) is the UI5 control again");

	});

	QUnit.module("Messaging", {
		beforeEach: function () {
		},
		afterEach: async function() {
			// clean up the pool after each test, so we don't leak anything
			// the pool automatically awaits the rendering, so that we can start with a clean DOM
			await WebcWrapperPool.clear();
		}
	});

	QUnit.test("TODO - migrate messaging tests?", async function(assert) {
		await Promise.resolve();
		// TODO: Implement messaging tests here --> or rather move to separate qunit file?
		//       They are quite extensive after all when faking a backend.
		assert.ok(true);
	});

});
