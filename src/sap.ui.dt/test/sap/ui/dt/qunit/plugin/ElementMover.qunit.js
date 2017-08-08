/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/dt/plugin/ElementMover",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	// controls
	'sap/ui/layout/form/Form',
	'sap/ui/layout/form/FormContainer',
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout"
], function(
	ElementMover,
	OverlayRegistry,
	DesignTime,
	Form,
	FormContainer,
	Button,
	VerticalLayout
) {
	"use strict";

	QUnit.start();

	QUnit.module("Given smartform groups and groupElements", {
		beforeEach : function(assert) {
			this.oForm1 = new Form("form1", {
				formContainers : [
					new FormContainer("group1"),
					new FormContainer("group2")
				]
			});

			this.oGroup1 = sap.ui.getCore().byId("group1");
			this.oGroup2 = sap.ui.getCore().byId("group2");
			this.oElementMover = new ElementMover();

			this.oForm1.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		afterEach : function(assert) {
			this.oElementMover.destroy();
			this.oForm1.destroy();
		}
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the aggregation property of the source and target is same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({aggregation: "formElements"}, {aggregation: "formElements"}), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the aggregation property of the source and target is not same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({aggregation: "formElements"}, {aggregation: "content"}), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the index of the source and target is same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({index: 0}, {index: 0}), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the index of the source and target is not same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({index: 0}, {index: 1}), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the parent of GroupElement is same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({parent: this.oGroup1}, {parent: this.oGroup1}), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the parent of GroupElement is not same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({parent: this.oGroup1}, {parent: this.oGroup2}), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the publicAggregation aggregation property of the source and target is same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({publicAggregation: "formElements"}, {publicAggregation: "formElements"}), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the publicAggregation property of the source and target is not same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({publicAggregation: "formElements"}, {publicAggregation: "content"}), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the publicParent of GroupElement is same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({publicParent: this.oGroup1}, {publicParent: this.oGroup1}), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when the publicParent of GroupElement is not same", function(assert) {
		assert.strictEqual(this.oElementMover._compareSourceAndTarget({publicParent: this.oGroup1}, {publicParent: this.oGroup2}), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when all the properties of source and target are same", function(assert) {

		var oSource = {
			aggregation: "formElements",
			index: 0,
			parent: this.oGroup1,
			publicAggregation: "formElements",
			publicParent: this.oGroup1
		};

		var oTarget = {
			aggregation: "formElements",
			index: 0,
			parent: this.oGroup1,
			publicAggregation: "formElements",
			publicParent: this.oGroup1
		};

		assert.strictEqual(this.oElementMover._compareSourceAndTarget(oSource, oTarget), true, "then there is no move operation and the command stack is empty");
	});

	QUnit.test("Calling a _compareSourceAndTarget method, when one of the properties of source and target is not same", function(assert) {

		var oSource = {
			aggregation: "formElements",
			index: 0,
			parent: this.oGroup1,
			publicAggregation: "formElements",
			publicParent: this.oGroup1
		};

		var oTarget = {
			aggregation: "formElements",
			index: 0,
			parent: this.oGroup2,
			publicAggregation: "formElements",
			publicParent: this.oGroup2
		};

		assert.strictEqual(this.oElementMover._compareSourceAndTarget(oSource, oTarget), false, "then there is a move operation and the command stack has been pushed with a move operation");
	});

	QUnit.module("Given verticalLayout, buttons and associated overlays", {
		beforeEach : function(assert) {
			this.oElementMover = new ElementMover();
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oVerticalLayout = new VerticalLayout("layout1", {
				content: [
					this.oButton1,
					this.oButton2,
					this.oButton3
				]
			}).placeAt('qunit-fixture');

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVerticalLayout]
			});

			var done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			this.oButton1Overlay.destroy();
			this.oButton2Overlay.destroy();
			this.oButton3Overlay.destroy();
			this.oVerticalLayoutOverlay.destroy();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("Calling repositionOn method with button1 as source and button2 as target overlay", function(assert) {
		this.oElementMover.repositionOn(this.oButton1Overlay, this.oButton2Overlay);
		var aContent = this.oVerticalLayout.getContent();
		assert.strictEqual(aContent.indexOf(this.oButton1), 1, "then button1 is moved to position 1");
		assert.strictEqual(aContent.indexOf(this.oButton2), 0, "then button2 is moved to position 0");
		assert.strictEqual(aContent.indexOf(this.oButton3), 2, "then button3 is moved to position 2");
	});

	QUnit.test("Calling repositionOn method with button1 as source and button3 as target overlay", function(assert) {
		this.oElementMover.repositionOn(this.oButton1Overlay, this.oButton3Overlay);
		var aContent = this.oVerticalLayout.getContent();
		assert.strictEqual(aContent.indexOf(this.oButton1), 2, "then button1 is moved to position 2");
		assert.strictEqual(aContent.indexOf(this.oButton2), 0, "then button2 is moved to position 0");
		assert.strictEqual(aContent.indexOf(this.oButton3), 1, "then button3 is moved to position 1");
	});

	QUnit.test("Calling repositionOn method with button3 as source and button2 as target overlay", function(assert) {
		this.oElementMover.repositionOn(this.oButton3Overlay, this.oButton2Overlay);
		var aContent = this.oVerticalLayout.getContent();
		assert.strictEqual(aContent.indexOf(this.oButton1), 0, "then button1 is moved to position 0");
		assert.strictEqual(aContent.indexOf(this.oButton2), 2, "then button2 is moved to position 2");
		assert.strictEqual(aContent.indexOf(this.oButton3), 1, "then button3 is moved to position 1");
	});

	QUnit.test("Calling insertInto method with button1 as source and verticalLayout as target overlay", function(assert) {
		this.oElementMover.insertInto(this.oButton1Overlay, this.oButton1Overlay.getParentAggregationOverlay());
		var aContent = this.oVerticalLayout.getContent();
		assert.strictEqual(aContent.indexOf(this.oButton1), 2, "then button1 is moved to position 2");
		assert.strictEqual(aContent.indexOf(this.oButton2), 0, "then button2 is moved to position 0");
		assert.strictEqual(aContent.indexOf(this.oButton3), 1, "then button3 is moved to position 1");
	});

});
