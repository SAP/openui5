/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/DesignTime",
	"sap/m/Bar",
	"sap/m/VBox",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/TextArea",
	"sap/m/Panel",
	"sap/ui/layout/VerticalLayout",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/uxap/ObjectPageHeader",
	"sap/ui/Device",
	"dt/control/SimpleScrollControl",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Popup",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/DOMUtil",
	"sap/ui/thirdparty/sinon-4"
],
function (
	ElementOverlay,
	Overlay,
	OverlayRegistry,
	ElementUtil,
	ElementDesignTimeMetadata,
	DesignTime,
	Bar,
	VBox,
	Button,
	Label,
	TextArea,
	Panel,
	VerticalLayout,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageHeader,
	Device,
	SimpleScrollControl,
	jQuery,
	Popup,
	ManagedObject,
	DOMUtil,
	sinon
) {
	"use strict";

	// Styles on "qunit-fixture" influence the scrolling tests if positioned on the screen during test execution.
	// Please keep this tag without any styling.
	jQuery("#qunit-fixture").removeAttr("style");

	var sandbox = sinon.sandbox.create();

	QUnit.module("Creation of the overlay container", {
		beforeEach: function() {
			Overlay.getOverlayContainer();
		},
		afterEach: function() {
			Overlay.removeOverlayContainer();
		}
	}, function () {
		QUnit.test("check whether container is there", function (assert) {
			var $container = jQuery("#overlay-container");
			assert.strictEqual($container.length, 1);
		});
	});

	QUnit.module("Given that an overlay is created for a control", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oElementOverlay = new ElementOverlay({
				isRoot: true,
				element: this.oButton,
				init: function (oEvent) {
					oEvent.getSource().placeInOverlayContainer();
					fnDone();
				}
			});
			this.oElementOverlay.attachEvent('applyStylesRequired', this.oElementOverlay.applyStyles.bind(this.oElementOverlay));
		},
		afterEach: function() {
			this.oElementOverlay.detachEvent('applyStylesRequired', this.oElementOverlay.applyStyles.bind(this.oElementOverlay));
			this.oElementOverlay.destroy();
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when all is rendered", function (assert) {
			assert.ok(this.oElementOverlay.getDomRef(), "overlay is rendered");
			assert.ok(this.oElementOverlay.isVisible(), "overlay is visible");
			assert.deepEqual(this.oElementOverlay.$().offset(), this.oButton.$().offset(), "overlay has same position as a control");
			assert.equal(this.oElementOverlay.$().css("z-index"), Popup.getLastZIndex(), "the root overlay has the last z-index provided by the Popup");
		});

		QUnit.test("when the control gets a new width and the Overlay is rerendered", function (assert) {
			var done = assert.async();
			var iLastZIndex = this.oElementOverlay.$().css("z-index");

			this.oElementOverlay.attachEventOnce("geometryChanged", function () {
				assert.strictEqual(this.oButton.$().width(), this.oElementOverlay.$().width(), "the overlay has the new width as well");
				assert.equal(this.oElementOverlay.$().css("z-index"), iLastZIndex, "the root overlay does not get a new z-index from the Popup");
				done();
			}, this);

			this.oButton.setWidth("500px");
		});

		QUnit.test("when overlay is enabled/disabled", function (assert) {
			var sWidth;
			var fnGetWidth = function (oOverlay) {
				return oOverlay.getDomRef().style.width;
			};

			// Overlay enabled by default
			sWidth = fnGetWidth(this.oElementOverlay);
			this.oButton.setText("Lorem ipsum dolor sit amet...");
			sap.ui.getCore().applyChanges();
			this.oElementOverlay.applyStyles();
			assert.notStrictEqual(sWidth, fnGetWidth(this.oElementOverlay), "overlay changes its width");

			sWidth = fnGetWidth(this.oElementOverlay);

			// Explicitly disable overlay
			this.oElementOverlay.setVisible(false);
			this.oButton.setText("Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi...");

			assert.strictEqual(sWidth, fnGetWidth(this.oElementOverlay), "overlay didn't change its width");
		});

		QUnit.test("elementModified event — property change ('visible')", function (assert) {
			var oSetRelevantSpy = sandbox.spy(this.oElementOverlay, "setRelevantOverlays");

			this.oElementOverlay.attachEventOnce("elementModified", function (oEvent) {
				assert.equal(oEvent.getParameter("type"), "propertyChanged");
				assert.equal(oEvent.getParameter("name"), "visible");
				assert.equal(oEvent.getParameter("value"), false);
				assert.equal(oSetRelevantSpy.callCount, 1, "and setRelevantOverlays was called");
			}, this);

			this.oButton.setVisible(false);
		});

		QUnit.test("elementModified event — property change ('text')", function (assert) {
			var oSetRelevantSpy = sandbox.spy(this.oElementOverlay, "setRelevantOverlays");

			this.oElementOverlay.attachEventOnce("elementModified", function (oEvent) {
				assert.equal(oEvent.getParameter("type"), "propertyChanged");
				assert.equal(oEvent.getParameter("name"), "text");
				assert.equal(oEvent.getParameter("value"), "My Button");
				assert.equal(oSetRelevantSpy.callCount, 0, "and setRelevantOverlays was not called");
			}, this);

			this.oButton.setText("My Button");
		});

		QUnit.test("elementModified event — after rendering", function (assert) {
			var oSetRelevantSpy = sandbox.spy(this.oElementOverlay, "setRelevantOverlays");

			this.oElementOverlay.attachEventOnce("elementModified", function (oEvent) {
				assert.equal(oEvent.getParameter("type"), "afterRendering");
				assert.equal(oSetRelevantSpy.callCount, 0, "and setRelevantOverlays was not called");
			}, this);

			this.oButton.rerender();
		});

		QUnit.test("elementModified event — setParent", function (assert) {
			var oSetRelevantSpy = sandbox.spy(this.oElementOverlay, "setRelevantOverlays");
			var oLayout = new VerticalLayout();

			this.oElementOverlay.attachEventOnce("elementModified", function (oEvent) {
				assert.equal(oEvent.getParameter("type"), "setParent");
				assert.equal(oEvent.getParameter("value"), oLayout);
				assert.equal(oSetRelevantSpy.callCount, 0, "and setRelevantOverlays was not called");
				oLayout.destroy();
			}, this);

			this.oButton.setParent(oLayout);
		});

		QUnit.test("elementModified event — insertAggregation", function (assert) {
			var fnDone = assert.async();
			var oLayout = new VerticalLayout();

			oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			new ElementOverlay({
				isRoot: true,
				element: oLayout,
				init: function (oEvent) {
					var oLayoutOverlay = oEvent.getSource();
					var oSetRelevantSpy = sandbox.spy(oLayoutOverlay, "setRelevantOverlays");
					oLayoutOverlay.placeInOverlayContainer();
					oLayoutOverlay.attachEventOnce("elementModified", function (oEvent) {
						assert.equal(oEvent.getParameter("type"), "addOrSetAggregation");
						assert.equal(oEvent.getParameter("value"), this.oButton);
						assert.equal(oSetRelevantSpy.callCount, 1, "and setRelevantOverlays was called");

						// Putting Button back to qunit-fixture to avoid double destroy call
						this.oButton.placeAt("qunit-fixture");
						oLayout.destroy();
						fnDone();
					}, this);

					oLayout.addContent(this.oButton);
					sap.ui.getCore().applyChanges();
				}.bind(this)
			});
		});

		QUnit.test("when the control is rendered", function (assert) {
			var $DomRef = this.oElementOverlay.$();

			assert.ok($DomRef.hasClass("sapUiDtOverlay"), "and the right CSS class overlay is set to the element");
			assert.ok($DomRef.hasClass("sapUiDtElementOverlay"), "and the right CSS element overlay class is set to the element");

			var mElementOffset = this.oElementOverlay.getElement().$().offset();
			var mOverlayOffset = $DomRef.offset();
			assert.equal(mOverlayOffset.top, mElementOffset.top, "and the right position 'top' is applied to the overlay");
			assert.equal(mOverlayOffset.left, mElementOffset.left, "and the right position 'left' is applied to the overlay");
			assert.equal(this.oElementOverlay.$().css("z-index"), $DomRef.css("z-index"), "and the right z-index is applied to the overlay");

			var oDesignTimeMetadata = this.oElementOverlay.getDesignTimeMetadata();
			assert.ok(oDesignTimeMetadata instanceof ElementDesignTimeMetadata, "and the design time metadata for the control is set");
		});

		QUnit.test("when CSS animation takes place in UI", function (assert) {
			DOMUtil.insertStyles("\
				@keyframes example {\
					from	{ width: 100px; }\
					to		{ width: 200px; }\
				}\
				.sapUiDtTestAnimate {\
					animation-name: example;\
					animation-duration: 0.05s;\
					animation-fill-mode: forwards;\
				} \
			", document.getElementById("qunit-fixture"));

			var done = assert.async();

			this.oElementOverlay.attachEvent(
				"geometryChanged",
				sandbox.stub()
					// First call triggered by the mutation for adding the CSS class to the DOM element
					.onFirstCall().callsFake(function () {
						assert.ok(true);
					})
					// Second call triggered by animationend event
					.onSecondCall().callsFake(function () {
						assert.strictEqual(this.oButton.$().width(), 200, "then the button width is correct");
						assert.strictEqual(this.oButton.$().width(), this.oElementOverlay.$().width(), "then the overlay size is in sync");
						done();
					}.bind(this))
			);

			this.oButton.addStyleClass("sapUiDtTestAnimate");
		});

		QUnit.test("when the overlay is rerendered", function (assert) {
			assert.ok(this.oElementOverlay.isRendered(), "ElementOverlay is initially rendered");

			var oDomRef = this.oElementOverlay.getDomRef();

			assert.strictEqual(oDomRef, this.oElementOverlay.render(), "then DOM Nodes are the same after second render()");
		});

		QUnit.test("when setSelectable, setMovable, setEditable is called on the overlay with undefined", function (assert) {
			this.oElementOverlay.setSelectable(undefined);
			assert.equal(this.oElementOverlay.isSelectable(), false, "then the overlay is not selectable");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlaySelectable"), false, "the Overlay doesn't have the sapUiDtOverlaySelectable StyleClass");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlayFocusable"), false, "the Overlay doesn't have the sapUiDtOverlayFocusable StyleClass");

			this.oElementOverlay.setMovable(undefined);
			assert.equal(this.oElementOverlay.isMovable(), false, "then the overlay is not movable");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlayMovable"), false, "the Overlay doesn't have the sapUiDtOverlayMovable StyleClass");
			this.oElementOverlay.setMovable(true);
			assert.equal(this.oElementOverlay.isMovable(), true, "then the overlay is movable");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlayMovable"), true, "the Overlay has the sapUiDtOverlayMovable StyleClass");

			this.oElementOverlay.setEditable(undefined);

			assert.equal(this.oElementOverlay.isEditable(), false, "then the overlay is not editable");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlayEditable"), false, "the Overlay doesn't have the sapUiDtOverlayEditable StyleClass");
		});

		QUnit.test("when setEditable is called on the overlay with true", function (assert) {
			assert.equal(this.oElementOverlay.isEditable(), false, "then the overlay is initially not editable");
			var oEventSpy = sandbox.spy(this.oElementOverlay, "fireEditableChange");
			this.oElementOverlay.setEditable(true);
			assert.equal(this.oElementOverlay.isEditable(), true, "then the overlay is editable");
			assert.strictEqual(oEventSpy.callCount, 1, "then 'editableChange' was fired");
			assert.deepEqual(oEventSpy.getCall(0).args[0], {
				id: this.oElementOverlay.getId(),
				editable : true
			}, "then 'editableChange' was fired with the required parameters");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlayEditable"), true, "the Overlay has the sapUiDtOverlayEditable StyleClass");
		});

		QUnit.test("when setSelected is called on the overlay with undefined", function (assert) {
			this.oElementOverlay.setSelectable(true);
			this.oElementOverlay.setSelected(undefined);
			assert.equal(this.oElementOverlay.isSelectable(), true, "then the overlay is selectable");
			assert.equal(this.oElementOverlay.isSelected(), false, "then the overlay is not selected");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlaySelectable"), true, "the Overlay doesn't have the Selectable StyleClass");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlayFocusable"), true, "the Overlay doesn't have the focusable StyleClass");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlaySelected"), false, "the Overlay doesn't have the selected StyleClass");
		});

		QUnit.test("when the overlay is selectable and selected", function (assert) {
			this.oElementOverlay.attachSelectionChange(function (oEvent) {
				assert.ok(oEvent.getParameter("selected"), "and a 'selectionChange' event is fired which provides the right selected state");
			}, this);
			this.oElementOverlay.setSelectable(true);
			this.oElementOverlay.setSelected(true);
			assert.ok(this.oElementOverlay.isSelected(), "then the state of the overlay is 'selected'");
		});

		QUnit.test("when the overlay is selected and selected again", function (assert) {
			this.oElementOverlay.setSelected(true);
			var bFired = false;
			this.oElementOverlay.attachSelectionChange(function () {
				bFired = true;
			}, this);
			this.oElementOverlay.setSelected(true);
			assert.ok(!bFired, "then the 'selection change' event should not fire again");
		});

		QUnit.test("when the overlay is changed to selectable false and the overlay is selected", function (assert) {
			this.oElementOverlay.setSelectable(false);
			assert.ok(!this.oElementOverlay.isSelectable(), "then the state of the overlay is 'not selectable'");

			var bFired = false;
			this.oElementOverlay.attachSelectionChange(function () {
				bFired = true;
			}, this);
			this.oElementOverlay.setSelected(true);
			assert.ok(!this.oElementOverlay.isSelected(), "and the state of the overlay is 'not selected'");
			assert.ok(!bFired, "and no 'selection change' event is fired");
		});

		QUnit.test("when the overlay is selectable or not selectable", function (assert) {
			this.oElementOverlay.setSelectable(true);
			assert.ok(this.oElementOverlay.isFocusable(), "then the control is focusable");

			this.oElementOverlay.setSelectable(false);
			assert.ok(!this.oElementOverlay.isFocusable(), "then the control is not focusable");
		});

		QUnit.test("when the overlay is focusable and is focused", function (assert) {
			this.oElementOverlay.setFocusable(true);
			assert.ok(this.oElementOverlay.isFocusable(), "then the control knows it is focusable");
			this.oElementOverlay.focus();
			assert.ok(this.oElementOverlay.hasFocus(), "then the state of the overlay is 'focused'");
		});

		QUnit.test("when ignore for the aggregation is not defined, then...", function (assert) {
			this.oElementOverlay.setDesignTimeMetadata(new ElementDesignTimeMetadata({
				data: {
					aggregations: {
						testAggregation1: {
							ignore: true
						},
						testAggregation2: {}
					}
				}
			}));

			assert.ok(this.oElementOverlay.getAggregationNames().indexOf("testAggregation1") === -1, "then aggregation is ignored properly");
			assert.ok(this.oElementOverlay.getAggregationNames().indexOf("testAggregation2") !== -1, "then aggregation is not ignored");
		});

		QUnit.test("when the overlay is being destroyed and applyStyles is triggered", function(assert) {
			var oIsVisibleSpy = sinon.spy(this.oElementOverlay, "isVisible");
			this.oElementOverlay.destroy();
			this.oElementOverlay.applyStyles();
			assert.equal(oIsVisibleSpy.callCount, 0, "the applyStyles function directly returned");
		});
	});

	QUnit.module("Given that an Overlay is created for a control with an invisible domRef", {
		beforeEach: function (assert) {
			var done = assert.async();
			this.oLabel = new Label();
			this.oLabel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oLabel]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oOverlay = OverlayRegistry.getOverlay(this.oLabel);
				done();
			}.bind(this));
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oLabel.destroy();
		}
	}, function () {
		QUnit.test("when the control's domRef is changed to visible...", function(assert) {
			this.oLabel.setText("test");
			sap.ui.getCore().applyChanges();
			this.oOverlay.applyStyles();
			assert.ok(DOMUtil.isVisible(this.oOverlay.getDomRef()), "the overlay is also visible in DOM");
		});
	});

	QUnit.module("Given that an Overlay is created for a layout with an invisible domRef", {
		beforeEach: function (assert) {
			var done = assert.async();
			this.oLabel = new Label({text : "text"});
			this.oVerticalLayout = new VerticalLayout({ content : [this.oLabel] });
			this.oVerticalLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oVerticalLayout.$().css("display", "none");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLabelOverlay = OverlayRegistry.getOverlay(this.oLabel);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				done();
			}.bind(this));
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oVerticalLayout.destroy();
		}
	}, function () {
		// TODO: BUG - Invisible layout still has a rendered overlay
		QUnit.test("when the layout's domRef is changed to visible...", function(assert) {
			var fnDone = assert.async();
			assert.strictEqual(this.oLayoutOverlay.isVisible(), false, "the layout's overlay should not be in the DOM when the layout is invisible");
			this.oLabelOverlay.attachEventOnce("geometryChanged", function () {
				assert.ok(true, "the geometry changed event called first on the label (child) overlay");
				assert.strictEqual(this.oLabelOverlay.isVisible(), true, "the label's overlay is also in DOM");
				this.oLayoutOverlay.attachEventOnce("geometryChanged", function () {
					assert.ok(true, "the geometry changed event called finaly on the layout (parent) overlay");
					assert.strictEqual(this.oLayoutOverlay.isVisible(), true, "the layout's overlay is also in DOM");
					assert.strictEqual(this.oLabelOverlay.isVisible(), true, "layout children's overlay is also in DOM");
					fnDone();
				}, this);
			}, this);
			this.oVerticalLayout.$().css("display", "block");
			sap.ui.getCore().applyChanges();
		});
	});

	QUnit.module("Given that an Overlay is created for a layout with a visible domRef", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oLabel1 = new Label({text : "text 1"});
			this.oLabel2 = new Label({text : "text 2"});
			this.oInnerLayout = new VerticalLayout({ content : [this.oLabel2] });
			this.oVerticalLayout = new VerticalLayout({ content : [this.oLabel1, this.oInnerLayout] });
			this.oVerticalLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVerticalLayout]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLabelOverlay1 = OverlayRegistry.getOverlay(this.oLabel1);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				fnDone();
			}.bind(this));
		},
		afterEach : function() {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when the layout is switched to invisible and the back to visible...", function(assert) {
			var fnDone = assert.async();

			this.oVerticalLayout.setVisible(false);
			sap.ui.getCore().applyChanges();
			this.oVerticalLayout.setVisible(true);
			sap.ui.getCore().applyChanges();

			// timeout is needed to handle applyStyles
			setTimeout(function() {
				// Math.ceil is needed for IE11
				assert.deepEqual(Math.ceil(this.oLayoutOverlay.$().offset().top), Math.ceil(this.oVerticalLayout.$().offset().top), "top position of the Layout overlay is correct");
				assert.deepEqual(Math.ceil(this.oLayoutOverlay.$().offset().left), Math.ceil(this.oVerticalLayout.$().offset().left), "left position of the Layout overlay is correct");
				assert.deepEqual(Math.ceil(this.oLabelOverlay1.$().offset().top), Math.ceil(this.oLabel1.$().offset().top), "top position of the Label overlay is correct");
				assert.deepEqual(Math.ceil(this.oLabelOverlay1.$().offset().left), Math.ceil(this.oLabel1.$().offset().left), "left position of the Label overlay is correct");
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("Given that an Overlay is created for a layout with child controls", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oButton1 = new Button({
				text : "Button 1"
			});
			this.oVerticalLayout1 = new VerticalLayout({
				content : [this.oButton1]
			});
			this.oVerticalLayout2 = new VerticalLayout();
			this.oVerticalLayout = new VerticalLayout({
				content: [this.oVerticalLayout1, this.oVerticalLayout2]
			});
			this.oVerticalLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVerticalLayout]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oOverlayButton1 = OverlayRegistry.getOverlay(this.oButton1);
				this.oOverlayLayout1 = OverlayRegistry.getOverlay(this.oVerticalLayout1);
				this.oOverlayLayout2 = OverlayRegistry.getOverlay(this.oVerticalLayout2);
				fnDone();
			}.bind(this));
		},
		afterEach : function() {
			this.oButton1.destroy();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when the layout is rendered", function(assert) {
			assert.ok(this.oOverlayButton1.getParent().getParent() === this.oOverlayLayout1, "then a button's overlay should be inside of the layout's overlay");
		});

		QUnit.test("when a control is moved from one layout to another", function(assert) {
			this.oVerticalLayout2.addContent(this.oButton1);
			sap.ui.getCore().applyChanges();
			// first parent is aggregation overlay, second parent is overlay control
			assert.ok(this.oOverlayButton1.getParent().getParent() === this.oOverlayLayout2, "then the button's overlay should be inside the other layout's overlay");
		});
	});

	QUnit.module("Given that an Overlay is created for a control with custom design time metadata", {
		beforeEach : function(assert) {
			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oOverlay = new ElementOverlay({
				element : this.oButton,
				designTimeMetadata : new ElementDesignTimeMetadata({
					data : {
						name : "My Custom Metadata"
					}
				}),
				init: assert.async(),
				initFailed: function (oEvent) {
					assert.ok(false);
					throw new Error(oEvent.getParameter("error"));
				}
			});
		},
		afterEach : function() {
			this.oOverlay.destroy();
			this.oButton.destroy();
		}
	}, function () {
		QUnit.test("when the design time metadata is retrieved", function(assert) {
			var oDesignTimeMetadata = this.oOverlay.getDesignTimeMetadata();
			assert.equal(oDesignTimeMetadata.getData().name, "My Custom Metadata", "then the right custom data is set");
		});
	});

	QUnit.module("Given that an Overlay is created for a control marked as ignored in the designtime Metadata", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oOverlay = new ElementOverlay({
				isRoot: true,
				element : this.oButton,
				designTimeMetadata : new ElementDesignTimeMetadata({
					data: {
						ignore : true
					}
				}),
				init: function () {
					this.oOverlay.placeInOverlayContainer();
					fnDone();
				}.bind(this),
				initFailed: function (oEvent) {
					assert.ok(false);
					throw new Error(oEvent.getParameter("error"));
				}
			});
		},
		afterEach: function() {
			this.oOverlay.destroy();
			this.oButton.destroy();
		}
	}, function () {
		QUnit.test("then...", function(assert) {
			assert.strictEqual(this.oOverlay.isVisible(), false, "the overlay is marked as invisible");
			assert.strictEqual(DOMUtil.isVisible(this.oOverlay.getDomRef()), false, "the overlay is hidden in DOM");
		});
	});

	QUnit.module("Given that an Overlay is created for two layouts with two child controls", {
		beforeEach: function(assert) {
			var fnDone = assert.async();
			this.oButton1 = new Button({
				text : "Button 1"
			});
			this.oButton2 = new Button({
				text : "Button 2"
			});
			this.oButton3 = new Button({
				text : "Button 3"
			});
			this.oButton4 = new Button({
				text : "Button 4"
			});

			this.oVerticalLayout1 = new VerticalLayout({
				content : [this.oButton1, this.oButton2]
			});

			this.oVerticalLayout2 = new VerticalLayout({
				content : [this.oButton3, this.oButton4]
			});

			this.oVerticalLayout1.placeAt("qunit-fixture");
			this.oVerticalLayout2.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oVerticalLayout1,
					this.oVerticalLayout2
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oOverlayLayout1 = OverlayRegistry.getOverlay(this.oVerticalLayout1);
				this.oOverlayLayout2 = OverlayRegistry.getOverlay(this.oVerticalLayout2);
				this.oOverlayButton1 = OverlayRegistry.getOverlay(this.oButton1);
				this.oOverlayButton2 = OverlayRegistry.getOverlay(this.oButton2);
				this.oOverlayButton3 = OverlayRegistry.getOverlay(this.oButton3);
				this.oOverlayButton4 = OverlayRegistry.getOverlay(this.oButton4);
				fnDone();
			}, this);
		},
		afterEach : function() {
			this.oVerticalLayout2.destroy();
			this.oVerticalLayout1.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when a control is moved to another layout", function(assert) {
			ElementUtil.insertAggregation(this.oVerticalLayout2, "content", this.oButton2, 1);

			var oDomRefButton1 = this.oOverlayButton1.getDomRef();
			var oDomRefButton2 = this.oOverlayButton2.getDomRef();
			var oDomRefButton3 = this.oOverlayButton3.getDomRef();
			var oDomRefButton4 = this.oOverlayButton4.getDomRef();

			assert.strictEqual(oDomRefButton3, oDomRefButton2.previousElementSibling, "then Overlay DOM elements in target layout are in correct order - button3 before button2");
			assert.strictEqual(oDomRefButton4, oDomRefButton2.nextElementSibling, "then Overlay DOM elements in target layout are in correct order - button4 after button2");
			assert.strictEqual(null, oDomRefButton1.nextElementSibling, "and source layout contains only one control");
		});
		QUnit.test("when DomRef of Overlay Layout contains extra elements and the control is prepended to this layout", function(assert) {
			this.oOverlayLayout2.$().prepend("<div></div>");
			ElementUtil.insertAggregation(this.oVerticalLayout2, "content", this.oButton2, 0);

			var oDomRefButton2 = this.oOverlayButton2.getDomRef();
			var oDomRefButton3 = this.oOverlayButton3.getDomRef();

			assert.strictEqual(oDomRefButton3, oDomRefButton2.nextElementSibling, "then Overlay DOM elements in target layout are in correct order");
			assert.strictEqual(null, oDomRefButton2.previousElementSibling, "and extra element is not taken into account");
		});
	});

	QUnit.module("Given that an Overlay is created for a control in the content of a scrollable container", {
		beforeEach: function(assert) {
			var fnDone = assert.async();
			this.$container = jQuery('<div id="scroll-container" style="height: 400px; width: 200px; overflow-y: auto;"><div style="width: 100%; height: 100px;"></div><div id="scroll-content" style="height: 500px;"></div></div>');
			this.$container.appendTo("#qunit-fixture");

			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("scroll-content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oButton]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oOverlay = OverlayRegistry.getOverlay(this.oButton);
				fnDone();
			}.bind(this));
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.$container.remove();
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when the container is scrolled", function(assert) {
			var fnDone = assert.async();
			this.oOverlay.attachEventOnce("geometryChanged", function () {
				assert.deepEqual(this.oOverlay.$().offset(), this.oButton.$().offset(), "overlay has same position as a control");
				fnDone();
			}, this);
			this.$container.scrollTop(50);
		});
	});

	QUnit.module("Given a SimpleScrollControl with Overlays", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oSimpleScrollControl = new SimpleScrollControl("scrollControl");
			this.oSimpleScrollControl.addContent1(
				this.oContent1 = new TextArea({
					height: "500px",
					width: "400px",
					value: "foo"
				})
			);
			this.oSimpleScrollControl.addContent2(new TextArea({
				height: "500px",
				width: "400px",
				value: "bar"
			}));
			this.oVBox = new VBox({
				items : [this.oSimpleScrollControl]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oSimpleScrollControlOverlay = OverlayRegistry.getOverlay(this.oSimpleScrollControl);
				this.oContent1Overlay = OverlayRegistry.getOverlay(this.oContent1);
				// FIXME: when synced event is resolved including scrollbar synchronization
				if (this.oContent1Overlay.$().css("transform") === "none") {
					this.oContent1Overlay.attachEventOnce("geometryChanged", done);
				} else {
					done();
				}
			}, this);
		},
		afterEach : function() {
			sandbox.restore();
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when the control is scrolled", function(assert) {
			var done = assert.async();
			var sInitialOffsetTop = this.oContent1.$().offset().top;
			var oInitialControlOffset = this.oContent1.$().offset();
			var oInitialOverlayOffset = this.oContent1Overlay.$().offset();
			var oApplyStylesSpy;

			if (!Device.browser.msie) {
				oApplyStylesSpy = sandbox.spy(this.oContent1Overlay, "applyStyles");
			}

			this.oSimpleScrollControlOverlay.attachEventOnce("scrollSynced", function() {
				if (!Device.browser.msie) {
					assert.equal(oApplyStylesSpy.callCount, 0, "then the applyStyles Method is not called");
				} else {
					this.oContent1Overlay.applyStyles();
				}
				assert.equal(this.oContent1.$().offset().top, sInitialOffsetTop - 100, "Then the top offset is 100px lower");
				assert.deepEqual(this.oContent1.$().offset(), this.oContent1Overlay.$().offset(), "Then the offset is still equal");
				assert.deepEqual(oInitialControlOffset, oInitialOverlayOffset, "Then the offset is still equal");
				done();
			}, this);
			this.oSimpleScrollControl.$().find("> .sapUiDtTestSSCScrollContainer").scrollTop(100);
		});

		QUnit.test("when the overlay is scrolled", function(assert) {
			var done = assert.async();
			var sInitialOffsetTop = this.oContent1.$().offset().top;
			var oInitialControlOffset = this.oContent1.$().offset();
			var oInitialOverlayOffset = this.oContent1Overlay.$().offset();
			var oApplyStylesSpy;

			if (!Device.browser.msie) {
				oApplyStylesSpy = sandbox.spy(Overlay.prototype, "applyStyles");
			}

			this.oSimpleScrollControl.$().find("> .sapUiDtTestSSCScrollContainer").scroll(function() {
				if (!Device.browser.msie) {
					assert.equal(oApplyStylesSpy.callCount, 0, "then the applyStyles Method is not called");
				} else {
					this.oContent1Overlay.applyStyles();
				}
				assert.equal(this.oContent1.$().offset().top, sInitialOffsetTop - 100, "Then the top offset is 100px lower");
				assert.deepEqual(this.oContent1.$().offset(), this.oContent1Overlay.$().offset(), "Then the offset is still equal");
				assert.deepEqual(oInitialControlOffset, oInitialOverlayOffset, "Then the offset is still equal");
				done();
			}.bind(this));
			this.oSimpleScrollControlOverlay.getScrollContainerById(0).scrollTop(100);
		});
	});

	QUnit.module("Postponed an aggregation overlay rendering", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			this.oPanel = new Panel({
				height: "300px",
				width: "300px"
			});
			this.oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oDesignTime = new DesignTime({
				designTimeMetadata: {
					"sap.m.Panel": {
						aggregations: {
							content: {
								domRef: null
							}
						}
					}
				},
				rootElements: [this.oPanel]
			});

			this.oDesignTime.attachEventOnce("synced", function () {
				this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
				this.oContentAggregationOverlay = this.oPanelOverlay.getAggregationOverlay("content");
				fnDone();
			}, this);
		},
		afterEach: function () {
			this.oDesignTime.destroy();
			this.oPanel.destroy();
		}
	}, function () {
		QUnit.test("when a control is added to an empty aggregation", function (assert) {
			var fnDone = assert.async();
			assert.ok(this.oPanelOverlay.isRendered());
			assert.notOk(this.oContentAggregationOverlay.isRendered(), "then the aggregation overlay for an empty aggregation is not rendered");
			var oButton = new Button({
				text: "test"
			});

			this.oDesignTime.attachEventOnce("synced", function () {
				// Aggregation has been rendered
				assert.ok(this.oContentAggregationOverlay.isRendered(), "then the aggregation overlay is rendered");

				// Control inside aggregation has been rendered
				var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
				assert.ok(oButtonOverlay.isRendered(), "then the new control is rendered");
				assert.ok(oButtonOverlay.isVisible());
				fnDone();
			}, this);
			this.oPanel.addContent(oButton);
			sap.ui.getCore().applyChanges();
		});
	});

	QUnit.module("Aggregation sorting", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			var fnDone2 = assert.async();

			var oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [new Button({text: "abc"}), new Button({text: "def"}), new Button({text: "ghi"})]
			});
			var oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [new Button({text: "foo"}), new Button({text: "bar"}), new Button({text: "foobar"})]
			});
			var oSection = new ObjectPageSection("section", {
				subSections: [oSubSection]
			});
			var oSection2 = new ObjectPageSection("section2", {
				subSections: [oSubSection2]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				height: "300px",
				sections : [oSection, oSection2],
				headerTitle: new ObjectPageHeader({
					objectTitle: "Title"
				}),
				headerContent: new Button({
					text: "headerContent"
				}),
				footer: new Bar({
					contentMiddle: [new Button({text: "footer"})]
				}),
				showFooter: true
			}).attachEventOnce("onAfterRenderingDOMReady", fnDone2);
			this.oVBox = new VBox({
				items : [this.oLayout]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oHeaderTitleOverlay = this.oLayoutOverlay.getAggregationOverlay("headerTitle");
				this.oHeaderContentOverlay = this.oLayoutOverlay.getAggregationOverlay("headerContent");
				this.oSectionsOverlay = this.oLayoutOverlay.getAggregationOverlay("sections");
				this.oFooterOverlay = this.oLayoutOverlay.getAggregationOverlay("footer");
				fnDone();
			}.bind(this));
		},
		afterEach : function() {
			this.oDesignTime.destroy();
			this.oVBox.destroy();
		}
	}, function () {
		QUnit.test("check position in DOM tree", function (assert) {
			var a$Children = jQuery(this.oLayoutOverlay.getChildrenDomRef()).find(">");
			var $ScrollContainer = this.oLayoutOverlay.getScrollContainerById(this.oHeaderContentOverlay.getScrollContainerId());
			var a$ScrollContainerChildren = $ScrollContainer.find(">");

			var iIndexHeaderTitleOverlay = a$Children.index(this.oHeaderTitleOverlay.getDomRef());
			var iScrollcontainer = a$Children.index($ScrollContainer);
			var iIndexFooterOverlay = a$Children.index(this.oFooterOverlay.getDomRef());
			var iIndexHeaderContentOverlay = a$ScrollContainerChildren.index(this.oHeaderContentOverlay.getDomRef());
			var iIndexSectionsOverlay = a$ScrollContainerChildren.index(this.oSectionsOverlay.getDomRef());

			assert.ok(iIndexHeaderTitleOverlay < iScrollcontainer, "then the overlay for headerTitle is above scrollcontainer");
			assert.ok(iScrollcontainer < iIndexFooterOverlay, "then the scrollcontainer is above the overlay for headerTitle");
			assert.ok(iIndexHeaderContentOverlay < iIndexSectionsOverlay, "then the overlay for headerContent is above the overlay for sections");
		});
		QUnit.test("check whether scrollbar position doesn't affect sorting", function (assert) {
			var fnDone = assert.async();

			var a$Children = jQuery(this.oLayoutOverlay.getChildrenDomRef()).find(">");
			var $ScrollContainer = this.oLayoutOverlay.getScrollContainerById(this.oHeaderContentOverlay.getScrollContainerId());
			var a$ScrollContainerChildren = $ScrollContainer.find(">");

			var iIndexHeaderTitleOverlay = a$Children.index(this.oHeaderTitleOverlay.getDomRef());
			var iScrollcontainer = a$Children.index($ScrollContainer);
			var iIndexFooterOverlay = a$Children.index(this.oFooterOverlay.getDomRef());
			var iIndexHeaderContentOverlay = a$ScrollContainerChildren.index(this.oHeaderContentOverlay.getDomRef());
			var iIndexSectionsOverlay = a$ScrollContainerChildren.index(this.oSectionsOverlay.getDomRef());

			// FIXME: remove timeout when #1870203056 is implemented
			setTimeout(function () {
				var a$Children = jQuery(this.oLayoutOverlay.getChildrenDomRef()).find(">");
				var a$ScrollContainerChildren = $ScrollContainer.find(">");

				assert.strictEqual(a$Children.index(this.oHeaderTitleOverlay.getDomRef()), iIndexHeaderTitleOverlay);
				assert.strictEqual(a$Children.index($ScrollContainer), iScrollcontainer);
				assert.strictEqual(a$Children.index(this.oFooterOverlay.getDomRef()), iIndexFooterOverlay);
				assert.strictEqual(a$ScrollContainerChildren.index(this.oHeaderContentOverlay.getDomRef()), iIndexHeaderContentOverlay);
				assert.strictEqual(a$ScrollContainerChildren.index(this.oSectionsOverlay.getDomRef()), iIndexSectionsOverlay);
				fnDone();
			}.bind(this));

			$ScrollContainer.scrollTop(300);
		});
	});

	QUnit.module("Given another SimpleScrollControl with Overlays and one scroll container aggregation is ignored", {
		beforeEach : function(assert) {
			var ScrollControl = SimpleScrollControl.extend("sap.ui.dt.test.controls.ScrollControl", {
				metadata: {
					designtime: {
						aggregations: {
							content1: {
								ignore: true
							}
						}
					}
				},
				renderer: SimpleScrollControl.getMetadata().getRenderer().render
			});

			var fnDone = assert.async();

			this.oScrollControl = new ScrollControl({
				id: "scrollControl",
				content1: [
					new TextArea({ value: "foo" })
				],
				content2: [
					new TextArea({ value: "bar" })
				],
				footer: [
					new TextArea({ value: "footer" })
				]
			});

			this.oVBox = new VBox({
				items: [this.oScrollControl]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
				fnDone();
			}.bind(this));
		},
		afterEach: function() {
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when the overlay is rendered, also aggregation overlays are rendered", function(assert) {
			assert.ok(this.oScrollControlOverlay.getDomRef(), "overlay has domRef");
			assert.ok(this.oScrollControlOverlay.getAggregationOverlay("content2").getDomRef(), "aggregation overlay in scroll container has domRef");
			assert.ok(this.oScrollControlOverlay.getAggregationOverlay("footer").getDomRef(), "aggregation overlay outside scroll container has domRef");
		});
	});

	QUnit.module("Given a control with control domRef defined in dt-metadata", {
		beforeEach : function(assert) {
			var AnyControl = SimpleScrollControl.extend("sap.ui.dt.test.controls.AnyControl", {
				metadata: {
					designtime: {
						domRef: ".sapUiDtTestSSCScrollContainer",
						scrollContainers : null //not needed in this test
					}
				},
				renderer: SimpleScrollControl.getMetadata().getRenderer().render
			});

			var fnDone = assert.async();

			this.oAnyControl = new AnyControl({
				id : "control"
			});

			this.oVBox = new VBox({
				items: [this.oAnyControl]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oAnyControlOverlay = OverlayRegistry.getOverlay(this.oAnyControl);
				fnDone();
			}.bind(this));
		},
		afterEach: function() {
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when the overlay is rendered, also aggregation overlays are rendered", function(assert) {
			assert.ok(this.oAnyControlOverlay.getDomRef(), "overlay has domRef");
			assert.ok(jQuery(this.oAnyControlOverlay.getGeometry().domRef).hasClass("sapUiDtTestSSCScrollContainer"), "domRef from dt-metadata is taken");
		});
	});

	QUnit.module("Scrollbar classes", function () {
		QUnit.test("when one aggregation loses its scrolling, the scrollbar classes must not persist on the parent overlay (as the aggregation with scrollbar doesn't take the whole space inside the control)", function (assert) {
			var ScrollControl = SimpleScrollControl.extend("sap.ui.dt.test.controls.ScrollControl", {
				metadata: {
					designtime: Object.assign(
						{},
						SimpleScrollControl.getMetadata()._oDesignTime,
						{
							scrollContainers: null
						}
					)
				},
				renderer: SimpleScrollControl.getMetadata().getRenderer().render
			});

			var fnDone = assert.async();

			this.oScrollControl = new ScrollControl({
				id: "scrollControl",
				scrollcontainerEnabled: false,
				content1: [
					new TextArea({
						height: "500px",
						width: "400px",
						value: "foo"
					})
				],
				content2: [
					new TextArea({
						height: "500px",
						width: "400px",
						value: "bar"
					})
				]
			});

			this.oScrollControl.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oScrollControl.$("content1").css({
				height: 300,
				overflow: "auto"
			});
			this.oScrollControl.$("content2").css({
				height: 300,
				overflow: "auto"
			});

			this.oDesignTime = new DesignTime({
				rootElements: [this.oScrollControl]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
				assert.notOk(
					this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
					&& this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
				);
				this.oScrollControlOverlay.getAggregationOverlay("content2").getChildren()[0].attachEventOnce("geometryChanged", function (oEvent) {
					var oAggregationOverlay = oEvent.getSource();
					assert.strictEqual(oAggregationOverlay.$().find(">.sapUiDtDummyScrollContainer").length, 0, "make sure dummy container has been removed");
					assert.notOk(
						this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
						&& this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
					);
					this.oDesignTime.destroy();
					this.oScrollControl.destroy();
					fnDone();
				}, this);
				this.oScrollControl.getContent2()[0].$().height(250);
			}.bind(this));
		});

		QUnit.test("when the aggregation has a scrolling which takes the whole space of the control", function (assert) {
			var ScrollControl = SimpleScrollControl.extend("sap.ui.dt.test.controls.ScrollControl", {
				metadata: {
					designtime: Object.assign(
						{},
						SimpleScrollControl.getMetadata()._oDesignTime,
						{
							scrollContainers: null
						}
					)
				},
				renderer: SimpleScrollControl.getMetadata().getRenderer().render
			});

			var fnDone = assert.async();

			this.oScrollControl = new ScrollControl({
				id: "scrollControl",
				scrollcontainerEnabled: false,
				content1: [
					new TextArea({
						height: "300px",
						width: "400px",
						value: "foo"
					})
				]
			});

			this.oScrollControl.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oScrollControl.$("content1").css({
				height: 500,
				overflow: "auto"
			});

			this.oDesignTime = new DesignTime({
				rootElements: [this.oScrollControl]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
				assert.notOk(
					this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
					&& this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
				);

				this.oScrollControlOverlay.getAggregationOverlay("content1").getChildren()[0].attachEventOnce("geometryChanged", function (oEvent) {
					var oAggregationOverlay = oEvent.getSource().getParentAggregationOverlay();
					assert.strictEqual(oAggregationOverlay.$().find(">.sapUiDtDummyScrollContainer").length, 1, "make sure dummy container has been created");
					assert.ok(
						this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
						&& this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
					);
					this.oDesignTime.destroy();
					this.oScrollControl.destroy();
					fnDone();
				}, this);
				this.oScrollControl.getContent1()[0].$().height(700);
			}.bind(this));
		});

		QUnit.test("when scrollcontainer loses scrolling, then scrollbar classes have to be removed", function (assert) {
			var fnDone = assert.async();
			var oVerticalLayout = new VerticalLayout("layout", {
				content: [
					this.oScrollControl = new SimpleScrollControl({
						id: "scrollControl",
						content1: [
							this.oTextArea = new TextArea({
								height: "500px",
								width: "400px",
								value: "foo"
							})
						],
						content2: [
							new TextArea({
								height: "500px",
								width: "400px",
								value: "bar"
							})
						]
					})
				]
			});


			oVerticalLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [oVerticalLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				// setTimeout is needed, because synced event doesn"t wait until all async processes are done
				setTimeout(function () {
					this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
					this.oTextAreaOverlay = OverlayRegistry.getOverlay(this.oTextArea);
					assert.ok(
						this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
						&& this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
					);
					this.oTextAreaOverlay.attachEventOnce("geometryChanged", function () {
						assert.ok(
							!this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
							&& !this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
						);
						this.oDesignTime.destroy();
						oVerticalLayout.destroy();
						fnDone();
					}, this);
					this.oTextArea.setHeight("50px");
					sap.ui.getCore().applyChanges();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when scrollcontainer is removed, the corresponding overlay must be hidden", function (assert) {
			var fnDone = assert.async();
			var oVerticalLayout = new VerticalLayout("layout", {
				content: [
					this.oScrollControl = new SimpleScrollControl({
						id: "scrollControl",
						content1: [
							this.oTextArea = new TextArea({
								height: "500px",
								width: "400px",
								value: "foo"
							})
						],
						content2: [
							new TextArea({
								height: "500px",
								width: "400px",
								value: "bar"
							})
						],
						footer: [
							new Button({
								text: "Button"
							})
						]
					})
				]
			});


			oVerticalLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [oVerticalLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				// setTimeout is needed, because synced event doesn"t wait until all async processes are done
				setTimeout(function () {
					this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
					var $ScrollContainerOverlayDomRef = this.oScrollControlOverlay.getScrollContainerById(0);
					assert.strictEqual($ScrollContainerOverlayDomRef.css("display"), "block");
					this.oScrollControlOverlay.attachEvent("geometryChanged", function () {
						assert.strictEqual($ScrollContainerOverlayDomRef.css("display"), "none");
						this.oDesignTime.destroy();
						oVerticalLayout.destroy();
						fnDone();
					}, this);
					this.oScrollControl.setScrollcontainerEnabled(false);
					sap.ui.getCore().applyChanges();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Given that an Overlay is created when scrolling is present", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oButton = new Button({
				text : "Button"
			});
			this.oButton2 = new Button({
				text : "Button2"
			});
			this.oButton3 = new Button({
				text : "Button3"
			});

			this.oPanel = new Panel({
				id : "SmallPanel",
				content : [this.oButton, this.oButton2, this.oButton3],
				width : "40px",
				height : "100px"
			});

			this.oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oPanel.$().find(">.sapMPanelContent").scrollLeft(20);
			this.oPanel.$().find(">.sapMPanelContent").scrollTop(50);

			this.oDesignTime = new DesignTime({
				rootElements : [this.oPanel]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone);
		},
		afterEach : function() {
			this.oPanel.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("then", function(assert) {
			var fnDone = assert.async();
			this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
			this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
			this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);

			var fnAssertPositions = function() {
				// Math.round is required for IE and Edge
				assert.equal(
					Math.round(this.oPanelOverlay.$().offset().left),
					Math.round(this.oPanel.$().offset().left),
					"panel overlay has same left position as the panel control"
				);
				assert.equal(
					Math.round(this.oPanelOverlay.$().offset().top),
					Math.round(this.oPanel.$().offset().top),
					"panel overlay has same top position as the panel control"
				);
				assert.equal(
					Math.round(this.oButtonOverlay.$().offset().left),
					Math.round(this.oButton.$().offset().left),
					"button overlay has same left position as the button control"
				);
				assert.equal(
					Math.round(this.oButtonOverlay.$().offset().top),
					Math.round(this.oButton.$().offset().top),
					"button overlay has same top position as the button control"
				);
				assert.equal(
					Math.round(this.oButton2Overlay.$().offset().left),
					Math.round(this.oButton2.$().offset().left),
					"button2 overlay has same left position as the button2 control"
				);
				assert.equal(
					Math.round(this.oButton2Overlay.$().offset().top),
					Math.round(this.oButton2.$().offset().top),
					"button2 overlay has same top position as the button2 control"
				);
			};

			// In internet explorer/edge, the checks happen before the overlays inside the scroll container
			// are properly placed, so we must wait until they are finalized before checking
			if (this.oButtonOverlay.$().offset().left !== this.oButton.$().offset().left) {
				this.oButton2Overlay.attachEventOnce("geometryChanged", function() {
					fnAssertPositions.apply(this);
					fnDone();
				}, this);
			} else {
				fnAssertPositions.apply(this);
				fnDone();
			}
		});
	});

	QUnit.module("Given an object page with scrolling", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			var fnDone2 = assert.async();

			var oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [new Button({text: "abc"}), new Button({text: "def"}), new Button({text: "ghi"})]
			});
			var oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [new Button({text: "foo"}), new Button({text: "bar"}), new Button({text: "foobar"})]
			});
			var oSection = new ObjectPageSection("section", {
				subSections: [oSubSection]
			});
			var oSection2 = new ObjectPageSection("section2", {
				subSections: [oSubSection2]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				height: "300px",
				sections : [oSection, oSection2],
				headerTitle: new ObjectPageHeader({
					objectTitle: "Title"
				}),
				headerContent: new Button({
					text: "headerContent"
				})
			}).attachEventOnce("onAfterRenderingDOMReady", fnDone2);
			this.oVBox = new VBox({
				items : [this.oLayout]
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				fnDone();
			}.bind(this));
		},
		afterEach : function() {
			this.oDesignTime.destroy();
			this.oVBox.destroy();
		}
	}, function () {
		QUnit.test("check that the scrollcontainer overlay has the correct z-index", function (assert) {
			var fnDone = assert.async();

			var $ScrollContainerOverlayDomRef = this.oLayoutOverlay.getScrollContainerById(1);
			var $ScrollContainerDomRef = this.oLayoutOverlay.getDesignTimeMetadata().getAssociatedDomRef(this.oLayout, this.oLayoutOverlay.getScrollContainers()[1].domRef);

			// FIXME: remove timeout when #1870203056 is implemented
			setTimeout(function () {
				assert.equal(
					DOMUtil.getZIndex($ScrollContainerOverlayDomRef),
					DOMUtil.getZIndex($ScrollContainerDomRef),
					"the z-index of the scrollcontainer overlay is " + DOMUtil.getZIndex($ScrollContainerDomRef) + " and correct"
				);
				fnDone();
			}, 200);
		});
	});

	QUnit.module("Error handling", function () {
		QUnit.test("when creating an ElementOverlay with incorrect elemement object", function (assert) {
			var oManagedObject = new ManagedObject();

			assert.throws(
				function () {
					new ElementOverlay({
						element: oManagedObject
					});
				},
				/Cannot create overlay without a valid element/
			);

			oManagedObject.destroy();
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});