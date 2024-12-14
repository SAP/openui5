/*global QUnit */
sap.ui.define([
	"sap/ui/core/library",
	"webc/fixtures/BasicUI5Control",
	"webc/fixtures/ControlWrapper",
	"webc/fixtures/LabelWrapper",
	"webc/helper/renderingFor",
	"webc/helper/WebcWrapperPool",
	"webc/helper/uglifyHTML",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(
	coreLibrary,
	BasicUI5Control,
	ControlWrapper,
	LabelWrapper,
	renderingFor,
	WebcWrapperPool,
	uglifyHTML,
	createAndAppendDiv
) {
	"use strict";

	createAndAppendDiv("webc-fixture-container");
	const coreValueStateEnum = coreLibrary.ValueState;


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
			text: "Text",
			myWidth: "100%",
			height: "100%",
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
		assert.equal(myWebComponent.getText(), "Text", "Property \"text\" is correct!");
		assert.equal(myWebComponent.getMyWidth(), "100%", "Property \"myWidth\" is correct!");
		assert.equal(myWebComponent.getHeight(), "100%", "Property \"height\" is correct!");
		assert.equal(myWebComponent.getBorderWidth(), "2px", "Property \"borderWidth\" is correct!");
		assert.deepEqual(myWebComponent.getPropProp(), {
			"key": "value"
		}, "Property \"propProp\" is correct!");
		assert.equal(myWebComponent.getSlotProp(), "SlotText", "Property \"slotProp\" is correct!");
		assert.equal(myWebComponent.getOtherSlotProp(), "OtherSlotText", "Property \"otherSlotProp\" is correct!");
		assert.equal(myWebComponent.getNoneProp(), 1337, "Property \"noneProp\" is correct!");
		assert.equal(myWebComponent.getOtherText(), "OtherText", "Property \"otherText\" is correct!");

		// TODO: Render output after setting properties

	});

	QUnit.test("Enabled mapping & propagation", async function(assert) {
		await Promise.resolve();
		// TODO: implement enabled propagation tests
		assert.ok(true, "ok");
	});

	QUnit.test("'textDirection' to 'dir' mapping", async function(assert) {
		await Promise.resolve();
		// TODO: implement enabled propagation tests
		assert.ok(true, "ok");
	});

	QUnit.test("'valueState' and 'valueStateText' mapping ", async function(assert) {
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


	QUnit.module("Aggregations", {
		beforeEach: function () {
		},
		afterEach: async function() {
			// clean up the pool after each test, so we don't leak anything
			// the pool automatically awaits the rendering, so that we can start with a clean DOM
			await WebcWrapperPool.clear();
		}
	});

	QUnit.test("Getters and Mutators", async function(assert) {
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

		// aggregation changes
		// TODO: implement changes and await the rendering
		// TODO: assert rendering output
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

		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "associatedControl"
		});

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



	/**
	 * TODO:
	 * This is a 1:1 refactoring of the old tests.
	 * Kept for reference, since they include rendering checks.
	 * Can be removed once all sub modules have been implemented and tested with higher coverage.
	 */
	QUnit.module("Old Tests", {
		beforeEach: function () {
		},
		afterEach: async function() {
			// clean up the pool after each test, so we don't leak anything
			// the pool automatically awaits the rendering, so that we can start with a clean DOM
			await WebcWrapperPool.clear();
		}
	});

	QUnit.test("Simple output comparison", async function(assert) {
		const labelControlForAssociation = await WebcWrapperPool.create(LabelWrapper, { id: "ariaLabelAssociation", text: "Label for Rendering" });
		const contentControl = new BasicUI5Control({ text: "Content" });
		const headerControl = new BasicUI5Control({ text: "Header" });

		const myWebComponent = await WebcWrapperPool.create(ControlWrapper, {
			id: "creationTest",
			text: "Text",
			myWidth: "100%",
			height: "100%",
			borderWidth: "2px",
			propProp: {
				"key": "value"
			},
			slotProp: "SlotText",
			otherSlotProp: "OtherSlotText",
			noneProp: 1337,
			content: [
				contentControl
			],
			header: [
				headerControl
			],
			ariaLabelledBy: labelControlForAssociation
		});

		// render to DOM and wait
		myWebComponent.placeAt("webc-fixture-container");
		await renderingFor(myWebComponent);

		// assert rendering output in DOM
		const expected = uglifyHTML(
		`<sample-webc id="creationTest" data-sap-ui="creationTest" data-sap-ui-render="" accessible-name-ref="${labelControlForAssociation.getId()}" style="width: 100%; height: 100%; border: 2px solid red;">
			Text
			<div slot="slotProp">SlotText</div>
			<span slot="otherSlotProp">OtherSlotText</span>
			<div id="${contentControl.getId()}" data-sap-ui="${contentControl.getId()}" data-sap-ui-render="">Content</div>
			<div id="${headerControl.getId()}" data-sap-ui="${headerControl.getId()}" data-sap-ui-render="" slot="header">Header</div>
		</sample-webc>`);

		assert.equal(myWebComponent.getDomRef().outerHTML,
			expected,
			"styles and text nodes are written correctly");
		assert.deepEqual(myWebComponent.getDomRef().webcProp, {
			"key": "value"
		}, "property webcProp is set correctly");
	});

});
