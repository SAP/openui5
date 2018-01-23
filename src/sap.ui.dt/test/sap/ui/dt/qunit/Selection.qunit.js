/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	// internal
	"sap/ui/dt/Selection",
	"sap/ui/dt/ElementOverlay",
	// controls
	"sap/m/Button"
], function(
	Selection,
	ElementOverlay,
	Button
) {
	"use strict";

	QUnit.start();

	QUnit.module("Given that an Selection is initialized with mode SingleSelection", {
		beforeEach : function() {
			this.oSelection = new Selection();
			this.oButton1 = new Button('selection-test-button1');
			this.oButton2 = new Button('selection-test-button2');
		},
		afterEach : function() {
			this.oSelection.destroy();
			this.oButton1.destroy();
			this.oButton2.destroy();
		}
	});

	QUnit.test("when it's initialized", function(assert) {
		assert.strictEqual(this.oSelection.getSelection().length, 0, "selection exists and is empty");
	});

	QUnit.test("when overlay is added to selection", function(assert) {
		var done = assert.async();
		var oOverlay = new ElementOverlay({ element: this.oButton1 });

		this.oSelection.attachEventOnce("change", function(oEvent) {
			assert.deepEqual(oEvent.getParameter("selection"), this.oSelection.getSelection(), "selection change event is fired with a correct selection");
			assert.strictEqual(this.oSelection.getSelection().length, 1, "one overlay is selected");
			assert.strictEqual(this.oSelection.getSelection()[0], oOverlay, "right overlay is selected");
			done();
			oOverlay.destroy();
		}, this);

		this.oSelection.add(oOverlay);
	});

	QUnit.test("when overlay is added to selection and then removed from selection", function(assert) {
		var done = assert.async();

		var oOverlay = new ElementOverlay({ element: this.oButton1 });
		this.oSelection.add(oOverlay);

		this.oSelection.attachEventOnce("change", function(oEvent) {
			var aSelection = oEvent.getParameter("selection");
			assert.strictEqual(aSelection.length, 0, "selection from event is empty");
			assert.strictEqual(this.oSelection.getSelection().length, 0, "selection is empty");
			oOverlay.destroy();
			done();
		}, this);

		this.oSelection.remove(oOverlay);
	});


	QUnit.test("when two overlay are added to selection", function(assert) {
		var oOverlay1 = new ElementOverlay({ element: this.oButton1 });
		var oOverlay2 = new ElementOverlay({ element: this.oButton2 });
		this.oSelection.add(oOverlay1);
		this.oSelection.add(oOverlay2);
		assert.strictEqual(this.oSelection.getSelection().length, 1, "one overlay is selected");
		assert.strictEqual(this.oSelection.getSelection()[0], oOverlay2, "just a second overlay is selected");
		oOverlay1.destroy();
		oOverlay2.destroy();
	});

	QUnit.module("Given that an Selection is initialized with mode MultipleSelection", {
		beforeEach : function() {
			this.oSelection = new Selection({mode : "Multi"});
			this.oButton1 = new Button('selection-test-button1');
			this.oButton2 = new Button('selection-test-button2');
			this.oButton3 = new Button('selection-test-button3');
		},
		afterEach : function() {
			this.oSelection.destroy();
			this.oButton1.destroy();
			this.oButton2.destroy();
			this.oButton3.destroy();
		}
	});

	QUnit.test("when two overlays are added to selection", function(assert) {
		var oOverlay1 = new ElementOverlay({ element: this.oButton1 });
		var oOverlay2 = new ElementOverlay({ element: this.oButton2 });
		this.oSelection.add(oOverlay1);
		this.oSelection.add(oOverlay2);
		assert.strictEqual(this.oSelection.getSelection().length, 2, "two overlays are selected");
		oOverlay1.destroy();
		oOverlay2.destroy();
	});

	QUnit.test("when two overlays are added to selection and then a second one is removed from selection", function(assert) {
		var oOverlay1 = new ElementOverlay({ element: this.oButton1 });
		var oOverlay2 = new ElementOverlay({ element: this.oButton2 });
		this.oSelection.set(oOverlay1, true); //.	 add
		this.oSelection.set(oOverlay2, true); //.add
		this.oSelection.set(oOverlay2, false); //.remove
		assert.strictEqual(this.oSelection.getSelection().length, 1, "one overlay is selected");
		assert.strictEqual(this.oSelection.getSelection()[0], oOverlay1, "just a first overlay is selected");
		oOverlay1.destroy();
		oOverlay2.destroy();
	});

	QUnit.test("when more 3 overlays are added to selection, selectionMode is switched to Single and one more overlay is added", function(assert) {
		var oOverlay1 = new ElementOverlay({ element: this.oButton1 });
		var oOverlay2 = new ElementOverlay({ element: this.oButton2 });
		var oOverlay3 = new ElementOverlay({ element: this.oButton3 });
		this.oSelection.add(oOverlay1);
		this.oSelection.add(oOverlay2);
		this.oSelection.setMode("Single");
		assert.strictEqual(this.oSelection.getSelection().length, 2, "2 overlays are selected after mode switch");
		this.oSelection.add(oOverlay3);
		assert.strictEqual(this.oSelection.getSelection().length, 1, "1 overlay is selected after add in single mode");
		assert.strictEqual(this.oSelection.getSelection()[0], oOverlay3, "last overlay is selected");
		oOverlay1.destroy();
		oOverlay2.destroy();
		oOverlay3.destroy();
	});

	QUnit.test("when more 3 overlays are added to selection, selectionMode is switched to Single and one overlay is removed from selection", function(assert) {
		var oOverlay1 = new ElementOverlay({ element: this.oButton1 });
		var oOverlay2 = new ElementOverlay({ element: this.oButton2 });
		this.oSelection.add(oOverlay1);
		this.oSelection.add(oOverlay2);
		this.oSelection.setMode("Single");
		this.oSelection.remove(oOverlay2);
		assert.strictEqual(this.oSelection.getSelection().length, 0, "no overlays is selected after remove in single mode");
		oOverlay1.destroy();
		oOverlay2.destroy();
	});

	QUnit.test("avoid data mutation", function(assert) {
		var oOverlay1 = new ElementOverlay({ element: this.oButton1 });
		var oOverlay2 = new ElementOverlay({ element: this.oButton2 });
		this.oSelection.add(oOverlay1);
		var aSelections1 = this.oSelection.getSelection();
		this.oSelection.add(oOverlay2);
		var aSelections2 = this.oSelection.getSelection();
		assert.ok(aSelections1 !== aSelections2, "then returned arrays are unique");
		oOverlay1.destroy();
		oOverlay2.destroy();
	});
});


