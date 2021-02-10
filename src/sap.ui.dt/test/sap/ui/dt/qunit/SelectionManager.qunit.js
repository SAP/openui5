/*global QUnit*/

sap.ui.define([
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	VerticalLayout,
	DesignTime,
	OverlayRegistry,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a DesignTime instance", {
		beforeEach: function(assert) {
			var fnDone = assert.async();
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton1 = new Button("button1"),
					this.oButton2 = new Button("button2")
				]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout]
			});

			this.oSelectionManager = this.oDesignTime.getSelectionManager();

			this.oDesignTime.attachEventOnce("synced", function () {
				this.oDesignTime.getElementOverlays().forEach(function (oElementOverlay) {
					oElementOverlay.setSelectable(true);
				});

				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);

				fnDone();
			}, this);
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when get() is called", function (assert) {
			var aSelection = this.oSelectionManager.get();
			assert.ok(Array.isArray(aSelection));
		});

		QUnit.test("when get() is called make sure that returned value is immutable", function (assert) {
			var aSelection = this.oSelectionManager.get();
			assert.strictEqual(aSelection.length, 0);
			aSelection.push(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 0);
		});

		QUnit.test("when set() is called with one overlay", function (assert) {
			assert.expect(6);
			var fnDone = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				var aSelection = oEvent.getParameter("selection");
				assert.deepEqual(aSelection, this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(aSelection.length, 1, "one overlay is selected after the execution");
				assert.strictEqual(this.oButton1Overlay.isSelected(), true, "the overlay is selected");
				assert.strictEqual(aSelection[0].getId(), this.oButton1Overlay.getId(), "the correct overlay is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.set(this.oButton1Overlay), true);
		});

		QUnit.test("when set() is called with an empty parameter (and selection exists)", function (assert) {
			assert.expect(5);
			var fnDone = assert.async();
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 0, "no overlay is selected after the execution");
				assert.strictEqual(this.oButton1Overlay.isSelected(), false, "the correct overlay is deselected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.set(), true);
		});

		QUnit.test("when set() is called without parameter (and nothing is selected)", function (assert) {
			assert.strictEqual(this.oSelectionManager.set(), false);
			var oSpy = sandbox.spy();
			this.oSelectionManager.attachChange(oSpy);
			assert.strictEqual(this.oSelectionManager.get().length, 0);
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("when set() is called with an array of overlays", function (assert) {
			assert.expect(6);
			var fnDone = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 2);
				assert.ok(this.oButton1Overlay.isSelected());
				assert.ok(this.oButton2Overlay.isSelected());
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.set([this.oButton1Overlay, this.oButton2Overlay]), true);
		});

		QUnit.test("when set() is called with one element", function (assert) {
			assert.expect(5);
			var fnDone = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after the execution");
				assert.ok(this.oButton1Overlay.isSelected(), "the correct overlay is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.set(this.oButton1), true);
		});

		QUnit.test("when set() is called with an array of elements", function (assert) {
			assert.expect(6);
			var fnDone = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before the execution");

			this.oSelectionManager.attachChange(function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 2, "2 overlays are selected after the execution");
				assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
				assert.ok(this.oButton2Overlay.isSelected(), "overlay for Button2 is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.set([this.oButton1, this.oButton2]), true);
		});

		QUnit.test("when set() is called with one overlay which is not selectable", function (assert) {
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");

			var oSpy = sandbox.spy();
			this.oSelectionManager.attachChange(oSpy);

			this.oButton2Overlay.setSelectable(false);

			var bResult = this.oSelectionManager.set(this.oButton2Overlay);

			assert.strictEqual(bResult, false);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "nothing changed");
			assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is still selected");
			assert.notOk(this.oButton2Overlay.isSelected(), "overlay for Button2 is not selected");
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("when set() is called with one element without an overlay", function (assert) {
			assert.expect(5);
			var fnDone = assert.async();

			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected after the execution");
				assert.notOk(this.oButton1Overlay.isSelected(), "the previous selected overlay is deselected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.set(new Button()), true);
		});

		QUnit.test("when set() is called with a mixed array (overlays/elements)", function (assert) {
			assert.expect(6);
			var fnDone = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 2, "2 overlays are selected after the execution");
				assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
				assert.ok(this.oButton2Overlay.isSelected(), "overlay for Button2 is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.set([this.oButton1Overlay, this.oButton2]), true);
		});

		QUnit.test("when add() is called with empty parameter", function (assert) {
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "overlay for button1 is selected before the execution");
			var oSpy = sandbox.spy();
			this.oSelectionManager.attachChange(oSpy);
			var bResult = this.oSelectionManager.add();
			assert.strictEqual(bResult, false);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "it is still one overlay selected after the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "the selection didn't change");
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("when add() is called with one overlay", function (assert) {
			assert.expect(7);
			var fnDone = assert.async();
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "overlay for button1 is selected before the execution");

			this.oSelectionManager.attachChange(function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected after the execution");
				assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
				assert.ok(this.oButton2Overlay.isSelected(), "overlay for Button2 is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.add(this.oButton2Overlay), true);
		});

		QUnit.test("when add() is called with an array of overlays", function (assert) {
			assert.expect(8);
			var fnDone = assert.async();
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "overlay for button1 is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 3, "four overlays are selected after the execution");
				assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
				assert.ok(this.oButton2Overlay.isSelected(), "overlay for Button2 is selected");
				assert.ok(this.oLayoutOverlay.isSelected(), "overlay for Layout is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.add([this.oButton2Overlay, this.oLayoutOverlay]), true);
		});

		QUnit.test("when add() is called with one element", function (assert) {
			assert.expect(5);
			var fnDone = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after the execution");
				assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.add(this.oButton1), true);
		});

		QUnit.test("when add() is called with an array of elements", function (assert) {
			assert.expect(6);
			var fnDone = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected after the execution");
				assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
				assert.ok(this.oButton2Overlay.isSelected(), "overlay for Button2 is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.add([this.oButton1, this.oButton2]), true);
		});

		QUnit.test("when add() is called with with an overlay which is not selectable", function (assert) {
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");

			this.oButton2Overlay.setSelectable(false);
			var oSpy = sandbox.spy();
			this.oSelectionManager.attachChange(oSpy);

			var oResult = this.oSelectionManager.add(this.oButton2Overlay);

			assert.strictEqual(oResult, false);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
			assert.notOk(this.oButton2Overlay.isSelected(), "overlay for Button2 is not selected");
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("when add() is called with with an overlay which is already selected", function (assert) {
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");
			var oSpy = sandbox.spy();
			this.oSelectionManager.attachChange(oSpy);

			var bResult = this.oSelectionManager.add(this.oButton1Overlay);

			assert.strictEqual(bResult, false);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "selection didn't change");
		});

		QUnit.test("when add() is called with an element without overlay", function (assert) {
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");

			var bResult = this.oSelectionManager.add(new Button());

			assert.strictEqual(bResult, false);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after the execution");
			assert.strictEqual(this.oSelectionManager.get()[0].getId(), this.oButton1Overlay.getId(), "selection didn't change");
		});

		QUnit.test("when add() is called with a mixed array (overlays/elements)", function (assert) {
			assert.expect(8);
			var fnDone = assert.async();
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "overlay of Button1 is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected after the execution");
				assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
				assert.ok(this.oButton2Overlay.isSelected(), "overlay for Button2 is selected");
				assert.ok(this.oLayoutOverlay.isSelected(), "overlay for Layout is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.add([this.oButton2Overlay, this.oLayout]), true);
		});

		QUnit.test("when add() is called with one selectable overlay and another non-selectable overlay", function (assert) {
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before the execution");

			var oSpy = sandbox.spy();
			this.oSelectionManager.attachChange(oSpy);
			this.oButton2Overlay.setSelectable(false);

			var bResult = this.oSelectionManager.add([this.oButton1Overlay, this.oButton2Overlay]);

			assert.strictEqual(bResult, false);
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected after the execution");
			assert.notOk(this.oButton1Overlay.isSelected());
			assert.notOk(this.oButton1Overlay.isSelected());
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("when remove() is called without parameters", function (assert) {
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");

			var oSpy = sandbox.spy();
			this.oSelectionManager.attachChange(oSpy);
			var bResult = this.oSelectionManager.remove();

			assert.strictEqual(bResult, false);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "it is still one overlay selected after the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "selection didn't change");
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("when remove() is called with one overlay", function (assert) {
			assert.expect(6);
			var fnDone = assert.async();
			this.oSelectionManager.set([this.oButton1Overlay, this.oButton2Overlay]);
			assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after the execution");
				assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
				assert.notOk(this.oButton2Overlay.isSelected(), "overlay for Button2 is not selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.remove(this.oButton2Overlay), true);
		});

		QUnit.test("when remove() is called with an array of overlays", function (assert) {
			assert.expect(5);
			var fnDone = assert.async();
			this.oSelectionManager.set([this.oButton1Overlay, this.oButton2Overlay, this.oLayoutOverlay]);
			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "two overlays are selected after the execution");
				assert.ok(this.oLayoutOverlay.isSelected(), "overlay for Layout is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.remove([this.oButton1Overlay, this.oButton2Overlay]), true);
		});

		QUnit.test("when remove() is called with one element", function (assert) {
			assert.expect(5);
			var fnDone = assert.async();
			this.oSelectionManager.set([this.oButton1Overlay, this.oButton2Overlay]);
			assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after the execution");
				assert.ok(this.oButton2Overlay.isSelected(), "overlay for Button2 is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.remove(this.oButton1), true);
		});

		QUnit.test("when remove() is called with an array of elements", function (assert) {
			assert.expect(5);
			var fnDone = assert.async();
			this.oSelectionManager.set([this.oButton1Overlay, this.oButton2Overlay, this.oLayoutOverlay]);
			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlays is selected after the execution");
				assert.ok(this.oLayoutOverlay.isSelected(), "overlay for Layout is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.remove([this.oButton1, this.oButton2]), true);
		});

		QUnit.test("when remove() is called with one overlay which is not selected", function (assert) {
			this.oSelectionManager.set([this.oButton1Overlay, this.oButton2Overlay]);
			assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected before the execution");

			var oSpy = sandbox.spy();
			this.oSelectionManager.attachChange(oSpy);

			var bResult = this.oSelectionManager.remove(this.oLayoutOverlay);

			assert.strictEqual(bResult, false);
			assert.strictEqual(this.oSelectionManager.get().length, 2, "three overlays are selected after the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
			assert.ok(this.oButton2Overlay.isSelected(), "overlay for Button2 is selected");
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("when remove() is called with one element which is not selected", function (assert) {
			this.oSelectionManager.set([this.oButton1, this.oButton2]);
			assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected before the execution");

			var oSpy = sandbox.spy();
			this.oSelectionManager.attachChange(oSpy);

			var bResult = this.oSelectionManager.remove(this.oLayout);

			assert.strictEqual(bResult, false);
			assert.strictEqual(this.oSelectionManager.get().length, 2, "three overlays are selected after the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
			assert.ok(this.oButton2Overlay.isSelected(), "overlay for Button2 is selected");
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("when remove() is called with one element which has no overlay", function (assert) {
			this.oSelectionManager.set([this.oButton1, this.oButton2]);
			assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected before the execution");

			var bResult = this.oSelectionManager.remove(new Button());

			assert.strictEqual(bResult, false);
			assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected after the execution");
			assert.ok(this.oButton1Overlay.isSelected(), "overlay for Button1 is selected");
			assert.ok(this.oButton2Overlay.isSelected(), "overlay for Button2 is selected");
		});

		QUnit.test("when remove() is called with a mixed array (overlays/elements)", function (assert) {
			assert.expect(7);
			var fnDone = assert.async();
			this.oSelectionManager.set([this.oButton1Overlay, this.oButton2Overlay, this.oLayoutOverlay]);
			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after the execution");
				assert.notOk(this.oButton1Overlay.isSelected(), "overlay for Button1 is not selected");
				assert.notOk(this.oButton2Overlay.isSelected(), "overlay for Button2 is not selected");
				assert.ok(this.oLayoutOverlay.isSelected(), "overlay for Layout is selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.remove([this.oButton1Overlay, this.oButton2]), true);
		});

		QUnit.test("when reset() is called", function (assert) {
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before the execution");
			var oSpy = sandbox.spy();
			this.oSelectionManager.attachChange(oSpy);
			assert.strictEqual(this.oSelectionManager.reset(), false);
			assert.ok(oSpy.notCalled);
		});

		QUnit.test("when reset() is called with pre-selected overlay", function (assert) {
			assert.expect(5);
			var fnDone = assert.async();
			this.oSelectionManager.set(this.oButton1Overlay);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before the execution");

			this.oSelectionManager.attachChange(function (oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected after the execution");
				assert.notOk(this.oButton1Overlay.isSelected(), "overlay for Button1 is not selected");
				fnDone();
			}, this);

			assert.strictEqual(this.oSelectionManager.reset(), true);
		});

		QUnit.test("when addValidator()/removeValidator() are called with a custom validator", function (assert) {
			// Validator allows to select only overlays for sap.m.Button control
			var fnCustomValidator = function (aElementOverlays) {
				return aElementOverlays.every(function (oElementOverlay) {
					return oElementOverlay.getElement() instanceof Button;
				});
			};

			this.oSelectionManager.addValidator(fnCustomValidator);

			assert.strictEqual(this.oSelectionManager.set([this.oButton1Overlay, this.oButton2Overlay]), true);
			assert.strictEqual(this.oSelectionManager.set([this.oButton1Overlay, this.oLayoutOverlay]), false);

			this.oSelectionManager.reset();
			this.oSelectionManager.removeValidator(fnCustomValidator);

			assert.strictEqual(this.oSelectionManager.set([this.oButton1Overlay, this.oButton2Overlay]), true);
			assert.strictEqual(this.oSelectionManager.set([this.oButton1Overlay, this.oLayoutOverlay]), true);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});