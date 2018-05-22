/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/SelectionManager",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	'sap/ui/thirdparty/sinon'
], function(
	Button,
	VerticalLayout,
	ElementOverlay,
	SelectionManager,
	DesignTime,
	OverlayRegistry,
	sinon
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a Selection Manager is initialized", {
		beforeEach : function() {
			this.oSelectionManager = new SelectionManager();

			sandbox.stub(ElementOverlay.prototype, "isSelectable").returns(true);
		},
		afterEach : function() {
			this.oSelectionManager.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when it's initialized", function(assert) {
			assert.strictEqual(this.oSelectionManager.get().length, 0, "selection exists and is empty");
		});

		QUnit.test("when overlay is added to selection", function(assert) {
			var done = assert.async();

			var oElementOverlay = new ElementOverlay({
				element: new Button(),
				init: function () {
					sandbox.stub(OverlayRegistry, "getOverlay").returns(oElementOverlay);
					this.oSelectionManager.add(oElementOverlay);
				}.bind(this)
			});

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.ok(true, 'change event was called');
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected");
				assert.strictEqual(this.oSelectionManager.get()[0], oElementOverlay, "right overlay is selected");
				oElementOverlay.destroy();
				done();
			}, this);

		});

		QUnit.test("when overlay is added to selection and then removed from selection", function(assert) {
			var done = assert.async();

			var oElementOverlay = new ElementOverlay({
				element: new Button(),
				init: function () {
					sandbox.stub(OverlayRegistry, "getOverlay").returns(oElementOverlay);
					this.oSelectionManager.add(oElementOverlay);

					this.oSelectionManager.attachEventOnce("change", function(oEvent) {
						var aSelection = oEvent.getParameter("selection");
						assert.strictEqual(aSelection.length, 0, "selection from event is empty");
						assert.strictEqual(this.oSelectionManager.get().length, 0, "selection is empty");
						oElementOverlay.destroy();
						done();
					}, this);

					this.oSelectionManager.remove(oElementOverlay);
				}.bind(this)
			});
		});

		QUnit.test("when two overlays are added to selection", function(assert) {
			return Promise.all([
				new Promise(function (fnResolve) {
					this.oElementOverlay1 = new ElementOverlay({
						element: new Button(),
						init: fnResolve
					});
				}.bind(this)),
				new Promise(function (fnResolve) {
					this.oElementOverlay2 = new ElementOverlay({
						element: new Button(),
						init: fnResolve
					});
				}.bind(this))
			]).then(function () {
				sandbox.stub(OverlayRegistry, "getOverlay", function(oOverlay){
					return oOverlay;
				});
				this.oSelectionManager.add(this.oElementOverlay1);
				this.oSelectionManager.add(this.oElementOverlay2);
				assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected");
				this.oElementOverlay1.destroy();
				this.oElementOverlay2.destroy();
			}.bind(this));
		});

		QUnit.test("when two overlays are added to selection and one is removed", function(assert) {
			return Promise.all([
				new Promise(function (fnResolve) {
					this.oElementOverlay1 = new ElementOverlay({
						element: new Button(),
						init: fnResolve
					});
				}.bind(this)),
				new Promise(function (fnResolve) {
					this.oElementOverlay2 = new ElementOverlay({
						element: new Button(),
						init: fnResolve
					});
				}.bind(this))
			]).then(function () {
				sandbox.stub(OverlayRegistry, "getOverlay", function(oOverlay){
					return oOverlay;
				});
				this.oSelectionManager.add(this.oElementOverlay1);
				this.oSelectionManager.add(this.oElementOverlay2);
				this.oSelectionManager.remove(this.oElementOverlay2);
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected");
				this.oElementOverlay1.destroy();
				this.oElementOverlay2.destroy();
			}.bind(this));
		});

		QUnit.test("avoid data mutation", function(assert) {
			var fnDone = assert.async();

			this.oElementOverlay = new ElementOverlay({
				element: new Button(),
				init: function () {
					sandbox.stub(OverlayRegistry, "getOverlay", function(oOverlay){
						return oOverlay;
					});
					this.oSelectionManager.add(this.oElementOverlay);
					var aSelections1 = this.oSelectionManager.get();
					var aSelections2 = this.oSelectionManager.get();
					assert.ok(aSelections1 !== aSelections2, "then returned arrays are unique");
					this.oElementOverlay.destroy();
					fnDone();
				}.bind(this)
			});
		});

	});

	QUnit.module("Given that Selection API is initialized", {
		beforeEach : function(assert) {
			var done = assert.async();
			// create buttons & layout
			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oButton3 = new Button("button3");
			this.oButton4 = new Button("button4");
			this.oButton5 = new Button("button5");
			this.oButton6 = new Button("button6");
			this.oLayout = new VerticalLayout({
				content : [
					this.oButton1,
					this.oButton2,
					this.oButton3,
					this.oButton4,
					this.oButton5
				]
			});

			this.oLayout.placeAt("qunit-fixture");
			this.oButton6.placeAt("qunit-fixture");

			// create the designtime
			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout]
			});

			sap.ui.getCore().applyChanges();

			this.oDesignTime.attachEventOnce("synced", function() {
				// get all Overlays and set them selectable
				this.aOverlays = this.oDesignTime.getElementOverlays();
				this.aOverlays.forEach(function(oOverlay){
					oOverlay.setSelectable(true);
				});
				// the last overlay is not selectable
				this.aOverlays[5].setSelectable(false);
				done();
			}, this);

			this.oSelectionManager = this.oDesignTime._oSelectionManager;

		},
		afterEach : function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			this.oSelectionManager.destroy();
			this.oButton6.destroy();
			this.aOverlays = [];
		}
	}, function () {

		QUnit.test("when set() is called with one overlay", function(assert) {
			var done = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), true, "the correct overlay is selected");
				done();
			}, this);

			this.oSelectionManager.set(this.aOverlays[1]);
		});

		QUnit.test("when set() is called with an empty parameter (and selection exists)", function(assert) {
			var done = assert.async();
			// select Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 0, "no overlay is selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), false, "the correct overlay is deselected");
				done();
			}, this);

			this.oSelectionManager.set();
		});

		QUnit.test("when set() is called with an empty parameter (and nothing is selected)", function(assert) {
			this.oSelectionManager.set();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "no overlay is selected after execution");
		});

		QUnit.test("when set() is called with an array of overlays", function(assert) {
			var done = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 5, "five overlays are selected after execution");
				this.aOverlays.pop();  // the last Overlay is not selectable, remove it from the array
				this.aOverlays.forEach(function(oOverlay){
					assert.strictEqual(oOverlay.getSelected(), true, "correct overlay is selected");
				});
				done();
			}, this);

			this.oSelectionManager.set(this.aOverlays);
		});

		QUnit.test("when set() is called with one element", function(assert) {
			var done = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), true, "the correct overlay is selected");
				done();
			}, this);

			this.oSelectionManager.set(this.oButton1);
		});

		QUnit.test("when set() is called with an array of elements", function(assert) {
			var done = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
				assert.strictEqual(this.aOverlays[2].getSelected(), true, "overlay of Button2 is selected");
				assert.strictEqual(this.aOverlays[3].getSelected(), false, "overlay of Button3 is not selected");
				assert.strictEqual(this.aOverlays[4].getSelected(), true, "overlay of Button4 is selected");
				done();
			}, this);

			this.oSelectionManager.set([this.oButton1, this.oButton2, this.oButton4]);
		});

		QUnit.test("when set() is called with one overlay which is not selectable", function(assert) {
			var done = assert.async();
			// select Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected after the execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), false, "the previous selected overlay is deselected");
				done();
			}, this);

			this.oSelectionManager.set(this.aOverlays[5]);
		});

		QUnit.test("when set() is called with one element without overlay", function(assert) {
			var done = assert.async();
			// select Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected after the execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), false, "the previous selected overlay is deselected");
				done();
			}, this);

			this.oSelectionManager.set(this.oButton6);
		});

		QUnit.test("when set() is called with a mixed array (overlays/elements)", function(assert) {
			var done = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 5, "five overlays are selected after execution");
				this.aOverlays.pop(); //button 5 is not selectable, remove it from the array
				this.aOverlays.forEach(function(oOverlay){
					assert.strictEqual(oOverlay.getSelected(), true, "correct overlay is selected");
				});
				done();
			}, this);

			var aSelection = this.aOverlays.slice(2,5); //overlays of Button 2, 3 and 4
			aSelection.push(this.oButton1, this.oLayout);
			this.oSelectionManager.set(aSelection);
		});

		QUnit.test("when add() is called with empty parameter", function(assert) {
			// select Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of button1 is selected before execution");

			this.oSelectionManager.add();

			assert.strictEqual(this.oSelectionManager.get().length, 1, "it is still one overlay selected after execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "the selection didn't change");
		});

		QUnit.test("when add() is called with one overlay", function(assert) {
			var done = assert.async();
			// select Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
				assert.strictEqual(this.aOverlays[2].getSelected(), true, "overlay of Button2 is selected");
				done();
			}, this);

			this.oSelectionManager.add(this.aOverlays[2]);
		});

		QUnit.test("when add() is called with an array of overlays", function(assert) {
			var done = assert.async();
			// select Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 4, "four overlays are selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
				assert.strictEqual(this.aOverlays[2].getSelected(), true, "overlay of Button2 is selected");
				assert.strictEqual(this.aOverlays[3].getSelected(), true, "overlay of Button3 is selected");
				assert.strictEqual(this.aOverlays[4].getSelected(), true, "overlay of Button4 is selected");
				done();
			}, this);

			this.oSelectionManager.add(this.aOverlays.slice(2,5)); //overlays of Button 2,3 and 4
		});

		QUnit.test("when add() is called with one element", function(assert) {
			var done = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), true, "the correct overlay is selected");
				done();
			}, this);

			this.oSelectionManager.add(this.oButton1);
		});

		QUnit.test("when add() is called with an array of elements", function(assert) {
			var done = assert.async();
			assert.strictEqual(this.oSelectionManager.get().length, 0, "nothing is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
				assert.strictEqual(this.aOverlays[2].getSelected(), true, "overlay of Button2 is selected");
				assert.strictEqual(this.aOverlays[3].getSelected(), false, "overlay of Button3 is not selected");
				assert.strictEqual(this.aOverlays[4].getSelected(), true, "overlay of Button4 is selected");
				done();
			}, this);

			this.oSelectionManager.add([this.oButton1, this.oButton2, this.oButton4]);
		});

		QUnit.test("when add() is called with with an overlay which is not selectable", function(assert) {
			//select Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");

			this.oSelectionManager.add(this.aOverlays[5]);

			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
			assert.strictEqual(this.aOverlays[5].getSelected(), false, "overlay of Button5 is not selected");
		});

		QUnit.test("when add() is called with with an overlay which is already selected", function(assert) {
			//select  Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");

			this.oSelectionManager.add(this.aOverlays[1]);

			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "selection didn't change");
		});

		QUnit.test("when add() is called with with an element without overlay", function(assert) {
			// select Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");

			this.oSelectionManager.add(this.oButton6);

			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "selection didn't change");
		});

		QUnit.test("when add() is called with a mixed array (overlays/elements)", function(assert) {
			var done = assert.async();
			// select Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 5, "five overlays are selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
				assert.strictEqual(this.aOverlays[2].getSelected(), true, "overlay of Button2 is selected");
				assert.strictEqual(this.aOverlays[3].getSelected(), true, "overlay of Button3 is selected");
				assert.strictEqual(this.aOverlays[4].getSelected(), true, "overlay of Button4 is selected");
				assert.strictEqual(this.aOverlays[0].getSelected(), true, "overlay of VerticalLayout is selected");
				done();
			}, this);

			var aSelection = this.aOverlays.slice(2,5); //overlays of Button 2, 3 and 4
			aSelection.push(this.oLayout);
			this.oSelectionManager.add(aSelection);
		});

		QUnit.test("when remove() is called with empty parameter", function(assert) {
			// select Button1
			this.oSelectionManager.set(this.aOverlays[1]);
			assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected before execution");

			this.oSelectionManager.remove();

			assert.strictEqual(this.oSelectionManager.get().length, 1, "it is still one overlay selected after execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "the selection didn't change");
		});

		QUnit.test("when remove() is called with one overlay", function(assert) {
			var done = assert.async();
			// select three overlays
			this.oSelectionManager.set([this.oButton1, this.oButton2, this.oButton3]);
			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
				assert.strictEqual(this.aOverlays[2].getSelected(), false, "overlay of Button2 is not selected");
				assert.strictEqual(this.aOverlays[3].getSelected(), true, "overlay of Button3 is selected");
				done();
			}, this);

			this.oSelectionManager.remove(this.aOverlays[2]);
		});

		QUnit.test("when remove() is called with an array of overlays", function(assert) {
			var done = assert.async();
			// select all overlays
			this.oSelectionManager.set(this.aOverlays);
			assert.strictEqual(this.oSelectionManager.get().length, 5, "five overlays are selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected after execution");
				assert.strictEqual(this.aOverlays[0].getSelected(), true, "overlay of Layout is selected");
				assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
				assert.strictEqual(this.aOverlays[2].getSelected(), false, "overlay of Button2 is not selected");
				assert.strictEqual(this.aOverlays[3].getSelected(), false, "overlay of Button3 is not selected");
				assert.strictEqual(this.aOverlays[4].getSelected(), false, "overlay of Button4 is not selected");
				done();
			}, this);

			this.oSelectionManager.remove(this.aOverlays.slice(2,5)); //overlays of Button 2, 3 and 4
		});

		QUnit.test("when remove() is called with one element", function(assert) {
			var done = assert.async();
			// select three Overlays
			this.oSelectionManager.set([this.oButton1, this.oButton2, this.oButton3]);
			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected after execution");
				assert.strictEqual(this.aOverlays[1].getSelected(), false, "overlay of Button1 is not selected");
				assert.strictEqual(this.aOverlays[2].getSelected(), true, "overlay of Button2 is selected");
				assert.strictEqual(this.aOverlays[3].getSelected(), true, "overlay of Button3 is selected");
				done();
			}, this);

			this.oSelectionManager.remove(this.oButton1);
		});

		QUnit.test("when remove() is called with an array of elements", function(assert) {
			var done = assert.async();
			// select all overlays
			this.oSelectionManager.set(this.aOverlays);
			assert.strictEqual(this.oSelectionManager.get().length, 5, "five overlays are selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 2, "two overlays are selected after execution");
				assert.strictEqual(this.aOverlays[0].getSelected(), true, "overlay of Layout is selected");
				assert.strictEqual(this.aOverlays[1].getSelected(), false, "overlay of Button1 is not selected");
				assert.strictEqual(this.aOverlays[2].getSelected(), false, "overlay of Button2 is not selected");
				assert.strictEqual(this.aOverlays[3].getSelected(), true, "overlay of Button3 is selected");
				assert.strictEqual(this.aOverlays[4].getSelected(), false, "overlay of Button4 is not selected");
				done();
			}, this);

			this.oSelectionManager.remove([this.oButton1, this.oButton2, this.oButton4]);
		});

		QUnit.test("when remove() is called with one overlay which is not selected", function(assert) {
			// select three overlays
			this.oSelectionManager.set([this.oButton1, this.oButton2, this.oButton3]);
			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected before execution");

			this.oSelectionManager.remove(this.aOverlays[4]);

			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected after execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
			assert.strictEqual(this.aOverlays[2].getSelected(), true, "overlay of Button2 is selected");
			assert.strictEqual(this.aOverlays[3].getSelected(), true, "overlay of Button3 is selected");
		});

		QUnit.test("when remove() is called with one element which is not selected", function(assert) {
			// select three overlays
			this.oSelectionManager.set([this.oButton1, this.oButton2, this.oButton3]);
			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected before execution");

			this.oSelectionManager.remove(this.oButton4);

			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected after execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
			assert.strictEqual(this.aOverlays[2].getSelected(), true, "overlay of Button2 is selected");
			assert.strictEqual(this.aOverlays[3].getSelected(), true, "overlay of Button3 is selected");
		});

		QUnit.test("when remove() is called with one element which has no overlay", function(assert) {
			// select three overlays
			this.oSelectionManager.set([this.oButton1, this.oButton2, this.oButton3]);
			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected before execution");

			this.oSelectionManager.remove(this.oButton6);

			assert.strictEqual(this.oSelectionManager.get().length, 3, "three overlays are selected after execution");
			assert.strictEqual(this.aOverlays[1].getSelected(), true, "overlay of Button1 is selected");
			assert.strictEqual(this.aOverlays[2].getSelected(), true, "overlay of Button2 is selected");
			assert.strictEqual(this.aOverlays[3].getSelected(), true, "overlay of Button3 is selected");
		});

		QUnit.test("when remove() is called with a mixed array (overlays/elements)", function(assert) {
			var done = assert.async();
			// select all overlays
			this.oSelectionManager.set(this.aOverlays);
			assert.strictEqual(this.oSelectionManager.get().length, 5, "five overlays are selected before execution");

			this.oSelectionManager.attachEventOnce("change", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("selection"), this.oSelectionManager.get(), "selection change event is fired with a correct selection");
				assert.strictEqual(this.oSelectionManager.get().length, 1, "one overlay is selected after execution");
				assert.strictEqual(this.aOverlays[0].getSelected(), false, "overlay of Layout is not selected");
				assert.strictEqual(this.aOverlays[1].getSelected(), false, "overlay of Button1 is not selected");
				assert.strictEqual(this.aOverlays[2].getSelected(), true, "overlay of Button2 is selected");
				assert.strictEqual(this.aOverlays[3].getSelected(), false, "overlay of Button3 is not selected");
				assert.strictEqual(this.aOverlays[4].getSelected(), false, "overlay of Button4 is not selected");
				done();
			}, this);

			var aSelection = this.aOverlays.slice(3,5); //overlays of Button 3 and 4
			aSelection.push(this.oButton1, this.oLayout);
			this.oSelectionManager.remove(aSelection);
		});
	});

	QUnit.done(function( details ) {
		jQuery("#qunit-fixture").hide();
	});
});