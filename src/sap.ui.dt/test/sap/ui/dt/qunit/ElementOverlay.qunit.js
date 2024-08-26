/* global QUnit */

sap.ui.define([
	"dt/control/SimpleScrollControl",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Panel",
	"sap/m/TextArea",
	"sap/m/VBox",
	"sap/m/Title",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Popup",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Overlay",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/f/DynamicPage",
	"sap/f/DynamicPageTitle",
	"sap/f/DynamicPageHeader",
	"sap/ui/dt/qunit/TestUtil",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	SimpleScrollControl,
	Bar,
	Button,
	Label,
	Panel,
	TextArea,
	VBox,
	Title,
	ManagedObject,
	Popup,
	DesignTime,
	DOMUtil,
	ElementDesignTimeMetadata,
	ElementOverlay,
	ElementUtil,
	OverlayRegistry,
	Overlay,
	HorizontalLayout,
	VerticalLayout,
	ObjectPageHeader,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	DynamicPage,
	DynamicPageTitle,
	DynamicPageHeader,
	TestUtil,
	sinon,
	nextUIUpdate
) {
	"use strict";

	// Styles on "qunit-fixture" influence the scrolling tests if positioned on the screen during test execution.
	// Please keep this tag without any styling.
	document.getElementById("qunit-fixture").removeAttribute("style");

	var sandbox = sinon.createSandbox();

	QUnit.module("Creation of the overlay container", {
		beforeEach() {
			Overlay.getOverlayContainer();
		},
		afterEach() {
			Overlay.removeOverlayContainer();
		}
	}, function() {
		QUnit.test("check whether container is there", function(assert) {
			var aContainer = document.querySelectorAll("#overlay-container");
			assert.strictEqual(aContainer.length, 1);
		});
	});

	QUnit.module("Given that an overlay is created for a control", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oElementOverlay = new ElementOverlay({
				isRoot: true,
				element: this.oButton,
				init(oEvent) {
					oEvent.getSource().placeInOverlayContainer();
					// Wait until the overlay styles are applied (fixes IE11 timing issue)
					this.attachEventOnce("geometryChanged", function() {
						fnDone();
					});
				}
			});
			this.oElementOverlay.attachEvent("applyStylesRequired", this.oElementOverlay.applyStyles.bind(this.oElementOverlay));
		},
		afterEach() {
			this.oElementOverlay.detachEvent("applyStylesRequired", this.oElementOverlay.applyStyles.bind(this.oElementOverlay));
			this.oElementOverlay.destroy();
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when all is rendered", function(assert) {
			assert.ok(this.oElementOverlay.getDomRef(), "overlay is rendered");
			assert.ok(this.oElementOverlay.isVisible(), "overlay is visible");
			assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oElementOverlay.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oButton.getDomRef()).top), "overlay has same top position as a control");
			assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oElementOverlay.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oButton.getDomRef()).left), "overlay has same left position as a control");
			assert.equal(window.getComputedStyle(this.oElementOverlay.getDomRef())["z-index"], Popup.getLastZIndex(), "the root overlay has the last z-index provided by the Popup");
		});

		QUnit.test("when the control gets a new width and the Overlay is rerendered", function(assert) {
			var fnDone = assert.async();
			var iLastZIndex = window.getComputedStyle(this.oElementOverlay.getDomRef())["z-index"];

			this.oElementOverlay.attachEventOnce("geometryChanged", function() {
				assert.strictEqual(this.oButton.getDomRef().getBoundingClientRect().width, this.oElementOverlay.getDomRef().getBoundingClientRect().width, "the overlay has the new width as well");
				assert.equal(window.getComputedStyle(this.oElementOverlay.getDomRef())["z-index"], iLastZIndex, "the root overlay does not get a new z-index from the Popup");
				fnDone();
			}, this);

			this.oButton.setWidth("500px");
		});

		QUnit.test("when overlay is enabled/disabled", async function(assert) {
			var sWidth;
			var fnGetWidth = function(oOverlay) {
				return oOverlay.getDomRef().style.width;
			};

			// Overlay enabled by default
			sWidth = fnGetWidth(this.oElementOverlay);
			this.oButton.setText("Lorem ipsum dolor sit amet...");
			await nextUIUpdate();
			return this.oElementOverlay.applyStyles()
			.then(function() {
				assert.notStrictEqual(sWidth, fnGetWidth(this.oElementOverlay), "overlay changes its width");

				sWidth = fnGetWidth(this.oElementOverlay);

				// Explicitly disable overlay
				this.oElementOverlay.setVisible(false);
				this.oButton.setText("Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi...");

				assert.strictEqual(sWidth, fnGetWidth(this.oElementOverlay), "overlay didn't change its width");
			}.bind(this));
		});

		QUnit.test("when overlay is destroyed and applyStyles function is called", function(assert) {
			var oApplySizesSpy = sandbox.spy(this.oElementOverlay, "_applySizes");
			this.oElementOverlay.destroy();
			return this.oElementOverlay.applyStyles()
			.then(function() {
				assert.ok(true, "then applyStyles is returning a promise");
				assert.strictEqual(oApplySizesSpy.callCount, 0, "then private _applySizes function is not called");
			});
		});

		QUnit.test("elementModified event — property change ('visible')", function(assert) {
			var fnDone = assert.async();
			var oSetRelevantSpy = sandbox.spy(this.oElementOverlay, "setRelevantOverlays");

			this.oElementOverlay.attachEventOnce("elementModified", function(oEvent) {
				assert.equal(oEvent.getParameter("type"), "propertyChanged");
				assert.equal(oEvent.getParameter("name"), "visible");
				assert.equal(oEvent.getParameter("value"), false);
				assert.equal(oSetRelevantSpy.callCount, 1, "and setRelevantOverlays was called");
				fnDone();
			}, this);

			this.oButton.setVisible(false);
		});

		QUnit.test("elementModified event — property change ('text')", function(assert) {
			var fnDone = assert.async();
			var oSetRelevantSpy = sandbox.spy(this.oElementOverlay, "setRelevantOverlays");

			this.oElementOverlay.attachEventOnce("elementModified", function(oEvent) {
				assert.equal(oEvent.getParameter("type"), "propertyChanged");
				assert.equal(oEvent.getParameter("name"), "text");
				assert.equal(oEvent.getParameter("value"), "My Button");
				assert.equal(oSetRelevantSpy.callCount, 0, "and setRelevantOverlays was not called");
				fnDone();
			}, this);

			this.oButton.setText("My Button");
		});

		QUnit.test("elementModified event — after rendering", function(assert) {
			var fnDone = assert.async();
			var oSetRelevantSpy = sandbox.spy(this.oElementOverlay, "setRelevantOverlays");

			this.oElementOverlay.attachEventOnce("elementModified", function(oEvent) {
				assert.equal(oEvent.getParameter("type"), "afterRendering");
				assert.equal(oSetRelevantSpy.callCount, 0, "and setRelevantOverlays was not called");
				fnDone();
			}, this);

			this.oButton.invalidate();
		});

		QUnit.test("elementModified event — setParent", function(assert) {
			var fnDone = assert.async();
			var oSetRelevantSpy = sandbox.spy(this.oElementOverlay, "setRelevantOverlays");
			var oLayout = new VerticalLayout();

			this.oElementOverlay.attachEventOnce("elementModified", function(oEvent) {
				assert.equal(oEvent.getParameter("type"), "setParent");
				assert.equal(oEvent.getParameter("value"), oLayout);
				assert.equal(oSetRelevantSpy.callCount, 0, "and setRelevantOverlays was not called");
				oLayout.destroy();
				fnDone();
			}, this);

			this.oButton.setParent(oLayout);
		});

		QUnit.test("elementModified event — insertAggregation", async function(assert) {
			var fnDone = assert.async();
			var oLayout = new VerticalLayout();

			oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			// eslint-disable-next-line no-new
			new ElementOverlay({
				isRoot: true,
				element: oLayout,
				init: async function(oEvent) {
					var oLayoutOverlay = oEvent.getSource();
					var oSetRelevantSpy = sandbox.spy(oLayoutOverlay, "setRelevantOverlays");
					oLayoutOverlay.placeInOverlayContainer();
					oLayoutOverlay.attachEventOnce("elementModified", function(oEvent) {
						assert.equal(oEvent.getParameter("type"), "addOrSetAggregation");
						assert.equal(oEvent.getParameter("value"), this.oButton);
						assert.equal(oSetRelevantSpy.callCount, 1, "and setRelevantOverlays was called");

						// Putting Button back to qunit-fixture to avoid double destroy call
						this.oButton.placeAt("qunit-fixture");
						oLayout.destroy();
						fnDone();
					}, this);

					oLayout.addContent(this.oButton);
					await nextUIUpdate();
				}.bind(this)
			});
		});

		QUnit.test("when the control is rendered", function(assert) {
			var oDomRef = this.oElementOverlay.getDomRef();

			assert.ok(oDomRef.classList.contains("sapUiDtOverlay"), "and the right CSS class overlay is set to the element");
			assert.ok(oDomRef.classList.contains("sapUiDtElementOverlay"), "and the right CSS element overlay class is set to the element");

			var mElementOffset = DOMUtil.getOffset(this.oElementOverlay.getElement().getDomRef());
			var mOverlayOffset = DOMUtil.getOffset(oDomRef);
			assert.equal(Math.ceil(mOverlayOffset.top), Math.ceil(mElementOffset.top), "and the right position 'top' is applied to the overlay");
			assert.equal(Math.ceil(mOverlayOffset.left), Math.ceil(mElementOffset.left), "and the right position 'left' is applied to the overlay");
			assert.equal(window.getComputedStyle(this.oElementOverlay.getDomRef())["z-index"], window.getComputedStyle(oDomRef)["z-index"], "and the right z-index is applied to the overlay");

			var oDesignTimeMetadata = this.oElementOverlay.getDesignTimeMetadata();
			assert.ok(oDesignTimeMetadata instanceof ElementDesignTimeMetadata, "and the design time metadata for the control is set");
		});

		QUnit.test("when CSS animation takes place in UI", function(assert) {
			var style = document.createElement("style");
			document.head.appendChild(style);
			style.sheet.insertRule("\
				@keyframes example {\
					from	{ width: 100px; }\
					to		{ width: 200px; }\
				}\
			");
			style.sheet.insertRule("\
				.sapUiDtTestAnimate {\
					animation-name: example;\
					animation-duration: 0.05s;\
					animation-fill-mode: forwards;\
				}\
			");

			var fnDone = assert.async();

			this.oElementOverlay.attachEvent(
				"geometryChanged",
				sandbox.stub()
				// First call triggered by the mutation for adding the CSS class to the DOM element
				.onFirstCall().callsFake(function() {
					assert.ok(true);
				})
				// Second call triggered by animationend event
				.onSecondCall().callsFake(function() {
					setTimeout(function() {
						// setTimeout added to cover animation duration
						assert.strictEqual(this.oButton.getDomRef().getBoundingClientRect().width, 200, "then the button width is correct");
						assert.strictEqual(this.oButton.getDomRef().getBoundingClientRect().width, this.oElementOverlay.getDomRef().getBoundingClientRect().width, "then the overlay size is in sync");
						fnDone();
					}.bind(this), 51);
				}.bind(this))
			);
			this.oButton.addStyleClass("sapUiDtTestAnimate");
		});

		QUnit.test("when the overlay is rerendered", function(assert) {
			assert.ok(this.oElementOverlay.isRendered(), "ElementOverlay is initially rendered");

			var oDomRef = this.oElementOverlay.getDomRef();

			assert.strictEqual(oDomRef, this.oElementOverlay.render(), "then DOM Nodes are the same after second render()");
		});

		QUnit.test("when setSelectable, setMovable, setEditable is called on the overlay with undefined", function(assert) {
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

		QUnit.test("when setEditable is called on the overlay with true", function(assert) {
			assert.equal(this.oElementOverlay.isEditable(), false, "then the overlay is initially not editable");
			var oEventSpy = sandbox.spy(this.oElementOverlay, "fireEditableChange");
			this.oElementOverlay.setEditable(true);
			assert.equal(this.oElementOverlay.isEditable(), true, "then the overlay is editable");
			assert.strictEqual(oEventSpy.callCount, 1, "then 'editableChange' was fired");
			assert.deepEqual(oEventSpy.getCall(0).args[0], {
				id: this.oElementOverlay.getId(),
				editable: true
			}, "then 'editableChange' was fired with the required parameters");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlayEditable"), true, "the Overlay has the sapUiDtOverlayEditable StyleClass");
		});

		QUnit.test("when setSelected is called on the overlay with undefined", function(assert) {
			this.oElementOverlay.setSelectable(true);
			this.oElementOverlay.setSelected(undefined);
			assert.equal(this.oElementOverlay.isSelectable(), true, "then the overlay is selectable");
			assert.equal(this.oElementOverlay.isSelected(), false, "then the overlay is not selected");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlaySelectable"), true, "the Overlay doesn't have the Selectable StyleClass");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlayFocusable"), true, "the Overlay doesn't have the focusable StyleClass");
			assert.strictEqual(this.oElementOverlay.hasStyleClass("sapUiDtOverlaySelected"), false, "the Overlay doesn't have the selected StyleClass");
		});

		QUnit.test("when the overlay is selectable and selected", function(assert) {
			this.oElementOverlay.attachSelectionChange(function(oEvent) {
				assert.ok(oEvent.getParameter("selected"), "and a 'selectionChange' event is fired which provides the right selected state");
			}, this);
			this.oElementOverlay.setSelectable(true);
			this.oElementOverlay.setSelected(true);
			assert.ok(this.oElementOverlay.isSelected(), "then the state of the overlay is 'selected'");
		});

		QUnit.test("when the overlay is selected and selected again", function(assert) {
			this.oElementOverlay.setSelected(true);
			var bFired = false;
			this.oElementOverlay.attachSelectionChange(function() {
				bFired = true;
			}, this);
			this.oElementOverlay.setSelected(true);
			assert.ok(!bFired, "then the 'selection change' event should not fire again");
		});

		QUnit.test("when the overlay is changed to selectable false and the overlay is selected", function(assert) {
			this.oElementOverlay.setSelectable(false);
			assert.ok(!this.oElementOverlay.isSelectable(), "then the state of the overlay is 'not selectable'");

			var bFired = false;
			this.oElementOverlay.attachSelectionChange(function() {
				bFired = true;
			}, this);
			this.oElementOverlay.setSelected(true);
			assert.ok(!this.oElementOverlay.isSelected(), "and the state of the overlay is 'not selected'");
			assert.ok(!bFired, "and no 'selection change' event is fired");
		});

		QUnit.test("when the overlay is selectable or not selectable", function(assert) {
			this.oElementOverlay.setSelectable(true);
			assert.ok(this.oElementOverlay.isFocusable(), "then the control is focusable");

			this.oElementOverlay.setSelectable(false);
			assert.ok(!this.oElementOverlay.isFocusable(), "then the control is not focusable");
		});

		QUnit.test("when the overlay is focusable and is focused", function(assert) {
			this.oElementOverlay.setFocusable(true);
			assert.ok(this.oElementOverlay.isFocusable(), "then the control knows it is focusable");
			this.oElementOverlay.focus();
			assert.ok(this.oElementOverlay.hasFocus(), "then the state of the overlay is 'focused'");
		});

		QUnit.test("when ignore for the aggregation is not defined, then...", function(assert) {
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
			return this.oElementOverlay.applyStyles()
			.then(function() {
				assert.equal(oIsVisibleSpy.callCount, 0, "the applyStyles function directly returned");
			});
		});

		QUnit.test("when the overlay is being renamed several times in a row", function(assert) {
			var fnDone = assert.async();
			var fnHandlerSpy = sinon.spy(function() {
				window.requestAnimationFrame(function() {
					assert.strictEqual(fnHandlerSpy.callCount, 1, "then geometryChanged event is called just once");
					fnDone();
				});
			});
			this.oElementOverlay.attachEventOnce("geometryChanged", fnHandlerSpy);
			["text1", "text2", "text3"].forEach(function(sText) {
				this.oButton.setText(sText);
			}, this);
		});

		QUnit.test("when the _domChangedCallback function is being called twice in a row", function(assert) {
			var fnDone = assert.async();
			var mParameters = { name: "parameter_name" };
			var iCounter = 0;
			this.oElementOverlay.attachApplyStylesRequired(function(oEvent) {
				iCounter++;
				window.requestAnimationFrame(function(mResultParameters) {
					assert.strictEqual(iCounter, 1, "then the 'applyStylesRequired' event is called just once");
					assert.strictEqual(mResultParameters.name, mParameters.name, "then the parameters map is passed through");
					assert.strictEqual(mResultParameters.targetOverlay, this.oElementOverlay, "then the overlay is added to the parameters map");
					fnDone();
				}.bind(this, oEvent.mParameters));
			}.bind(this));
			this.oElementOverlay._domChangedCallback(mParameters);
			this.oElementOverlay._domChangedCallback(mParameters);
		});

		QUnit.test("when the 'visible' property is set to false and then back to true", function(assert) {
			var sPreviousVisibility = this.oElementOverlay.getDomRef().style.visibility;

			this.oElementOverlay.setVisible(false);
			assert.strictEqual(this.oElementOverlay.getDomRef().style.visibility, "hidden", "first the visibility is set to hidden");

			this.oElementOverlay.setVisible(true);
			assert.strictEqual(this.oElementOverlay.getDomRef().style.visibility, sPreviousVisibility, "then the visibility is reset to the original value");
		});

		QUnit.test("getAssociatedDomRef with the overlay having no designtime metadata", function(assert) {
			sandbox.stub(this.oElementOverlay, "getDesignTimeMetadata");
			const oElementUtilSpy = sandbox.spy(ElementUtil, "getDomRef");
			const oDomRef = this.oElementOverlay.getAssociatedDomRef();
			assert.strictEqual(oDomRef.get(0), oElementUtilSpy.lastCall.returnValue, "the domRef is found");
		});
	});

	QUnit.module("Given that an Overlay is created for a control with an invisible domRef", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oLabel = new Label();
			this.oLabel.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oLabel]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oOverlay = OverlayRegistry.getOverlay(this.oLabel);
				fnDone();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oLabel.destroy();
		}
	}, function() {
		QUnit.test("when the control's domRef is changed to visible...", async function(assert) {
			this.oLabel.setText("test");
			await nextUIUpdate();
			return this.oOverlay.applyStyles()
			.then(function() {
				assert.ok(DOMUtil.isVisible(this.oOverlay.getDomRef()), "the overlay is also visible in DOM");
			}.bind(this));
		});
	});

	QUnit.module("Given that an Overlay is created for a layout with an invisible domRef", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oLabel = new Label({ text: "text" });
			this.oVerticalLayout = new VerticalLayout({ content: [this.oLabel] });
			this.oVerticalLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oVerticalLayout.getDomRef().style.display = ("none");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLabelOverlay = OverlayRegistry.getOverlay(this.oLabel);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				fnDone();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oVerticalLayout.destroy();
		}
	}, function() {
		// TODO: BUG - Invisible layout still has a rendered overlay
		QUnit.test("when the layout's domRef is changed to visible...", async function(assert) {
			var fnDone = assert.async();
			assert.strictEqual(this.oLayoutOverlay.isVisible(), false, "the layout's overlay should not be in the DOM when the layout is invisible");
			this.oLabelOverlay.attachEventOnce("geometryChanged", function() {
				assert.ok(true, "the geometry changed event called first on the label (child) overlay");
				assert.strictEqual(this.oLabelOverlay.isVisible(), true, "the label's overlay is also in DOM");
				this.oLayoutOverlay.attachEventOnce("geometryChanged", function() {
					assert.ok(true, "the geometry changed event called finaly on the layout (parent) overlay");
					assert.strictEqual(this.oLayoutOverlay.isVisible(), true, "the layout's overlay is also in DOM");
					assert.strictEqual(this.oLabelOverlay.isVisible(), true, "layout children's overlay is also in DOM");
					fnDone();
				}, this);
			}, this);
			this.oVerticalLayout.getDomRef().style.display = "block";
			await nextUIUpdate();
		});
	});

	QUnit.module("Given that an Overlay is created for a layout with a visible domRef", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oLabel1 = new Label({ text: "text 1" });
			this.oLabel2 = new Label({ text: "text 2" });
			this.oInnerLayout = new VerticalLayout({ content: [this.oLabel2] });
			this.oVerticalLayout = new HorizontalLayout({ content: [this.oInnerLayout, this.oLabel1] });
			this.oVerticalLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
				this.oLabelOverlay1 = OverlayRegistry.getOverlay(this.oLabel1);
				this.oLabelOverlay2 = OverlayRegistry.getOverlay(this.oLabel2);
				fnDone();
			}.bind(this));
		},
		afterEach() {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when the layout is switched to invisible and the back to visible...", async function(assert) {
			var fnDone = assert.async();

			this.oVerticalLayout.setVisible(false);
			await nextUIUpdate();
			this.oVerticalLayout.setVisible(true);
			await nextUIUpdate();

			// timeout is needed to handle applyStyles
			setTimeout(function() {
				// Math.ceil is needed for IE11
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLayoutOverlay.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oVerticalLayout.getDomRef()).top), "top position of the Layout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLayoutOverlay.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oVerticalLayout.getDomRef()).left), "left position of the Layout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLabelOverlay1.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oLabel1.getDomRef()).top), "top position of the Label overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLabelOverlay1.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oLabel1.getDomRef()).left), "left position of the Label overlay is correct");
				fnDone();
			}.bind(this));
		});

		QUnit.test("layout shifting: scenario 1", async function(assert) {
			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLayoutOverlay.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oVerticalLayout.getDomRef()).top), "top position of the Layout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLayoutOverlay.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oVerticalLayout.getDomRef()).left), "left position of the Layout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLayoutOverlay.getDomRef()).width), Math.ceil(DOMUtil.getSize(this.oVerticalLayout.getDomRef()).width), "width of the Layout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLayoutOverlay.getDomRef()).height), Math.ceil(DOMUtil.getSize(this.oVerticalLayout.getDomRef()).height), "height of the Layout overlay is correct");

				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLabelOverlay1.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oLabel1.getDomRef()).top), "top position of the Label1 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLabelOverlay1.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oLabel1.getDomRef()).left), "left position of the Label1 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLabelOverlay1.getDomRef()).width), Math.ceil(DOMUtil.getSize(this.oLabel1.getDomRef()).width), "width of the Label1 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLabelOverlay1.getDomRef()).height), Math.ceil(DOMUtil.getSize(this.oLabel1.getDomRef()).height), "height of the Label1 overlay is correct");

				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oInnerLayoutOverlay.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oInnerLayout.getDomRef()).top), "top position of the InnerLayout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oInnerLayoutOverlay.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oInnerLayout.getDomRef()).left), "left position of the InnerLayout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oInnerLayoutOverlay.getDomRef()).width), Math.ceil(DOMUtil.getSize(this.oInnerLayout.getDomRef()).width), "width of the InnerLayout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oInnerLayoutOverlay.getDomRef()).height), Math.ceil(DOMUtil.getSize(this.oInnerLayout.getDomRef()).height), "height of the InnerLayout overlay is correct");

				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLabelOverlay2.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oLabel2.getDomRef()).top), "top position of the Label2 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLabelOverlay2.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oLabel2.getDomRef()).left), "left position of the Label2 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLabelOverlay2.getDomRef()).width), Math.ceil(DOMUtil.getSize(this.oLabel2.getDomRef()).width), "width of the Label2 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLabelOverlay2.getDomRef()).height), Math.ceil(DOMUtil.getSize(this.oLabel2.getDomRef()).height), "height of the Label2 overlay is correct");

				fnDone();
			}, this);

			this.oLabel2.setText("42");
			await nextUIUpdate();
		});

		QUnit.test("layout shifting: scenario 2", async function(assert) {
			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLayoutOverlay.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oVerticalLayout.getDomRef()).top), "top position of the Layout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLayoutOverlay.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oVerticalLayout.getDomRef()).left), "left position of the Layout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLayoutOverlay.getDomRef()).width), Math.ceil(DOMUtil.getSize(this.oVerticalLayout.getDomRef()).width), "width of the Layout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLayoutOverlay.getDomRef()).height), Math.ceil(DOMUtil.getSize(this.oVerticalLayout.getDomRef()).height), "height of the Layout overlay is correct");

				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLabelOverlay1.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oLabel1.getDomRef()).top), "top position of the Label1 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLabelOverlay1.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oLabel1.getDomRef()).left), "left position of the Label1 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLabelOverlay1.getDomRef()).width), Math.ceil(DOMUtil.getSize(this.oLabel1.getDomRef()).width), "width of the Label1 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLabelOverlay1.getDomRef()).height), Math.ceil(DOMUtil.getSize(this.oLabel1.getDomRef()).height), "height of the Label1 overlay is correct");

				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oInnerLayoutOverlay.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oInnerLayout.getDomRef()).top), "top position of the InnerLayout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oInnerLayoutOverlay.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oInnerLayout.getDomRef()).left), "left position of the InnerLayout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oInnerLayoutOverlay.getDomRef()).width), Math.ceil(DOMUtil.getSize(this.oInnerLayout.getDomRef()).width), "width of the InnerLayout overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oInnerLayoutOverlay.getDomRef()).height), Math.ceil(DOMUtil.getSize(this.oInnerLayout.getDomRef()).height), "height of the InnerLayout overlay is correct");

				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLabelOverlay2.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oLabel2.getDomRef()).top), "top position of the Label2 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oLabelOverlay2.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oLabel2.getDomRef()).left), "left position of the Label2 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLabelOverlay2.getDomRef()).width), Math.ceil(DOMUtil.getSize(this.oLabel2.getDomRef()).width), "width of the Label2 overlay is correct");
				assert.deepEqual(Math.ceil(DOMUtil.getSize(this.oLabelOverlay2.getDomRef()).height), Math.ceil(DOMUtil.getSize(this.oLabel2.getDomRef()).height), "height of the Label2 overlay is correct");

				fnDone();
			}, this);

			this.oLabel1.setText("42");
			await nextUIUpdate();
		});
	});

	QUnit.module("Given that an Overlay is created for a layout with child controls", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oButton1 = new Button({
				text: "Button 1"
			});
			this.oVerticalLayout1 = new VerticalLayout({
				content: [this.oButton1]
			});
			this.oVerticalLayout2 = new VerticalLayout();
			this.oVerticalLayout = new VerticalLayout({
				content: [this.oVerticalLayout1, this.oVerticalLayout2]
			});
			this.oVerticalLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oOverlayButton1 = OverlayRegistry.getOverlay(this.oButton1);
				this.oOverlayLayout1 = OverlayRegistry.getOverlay(this.oVerticalLayout1);
				this.oOverlayLayout2 = OverlayRegistry.getOverlay(this.oVerticalLayout2);
				fnDone();
			}.bind(this));
		},
		afterEach() {
			this.oButton1.destroy();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when the layout is rendered", function(assert) {
			assert.ok(this.oOverlayButton1.getParent().getParent() === this.oOverlayLayout1, "then a button's overlay should be inside of the layout's overlay");
		});

		QUnit.test("when a control is moved from one layout to another", async function(assert) {
			this.oVerticalLayout2.addContent(this.oButton1);
			await nextUIUpdate();
			// first parent is aggregation overlay, second parent is overlay control
			assert.ok(this.oOverlayButton1.getParent().getParent() === this.oOverlayLayout2, "then the button's overlay should be inside the other layout's overlay");
		});
	});

	QUnit.module("Given that an Overlay is created for a control with custom design time metadata", {
		async beforeEach(assert) {
			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oOverlay = new ElementOverlay({
				element: this.oButton,
				designTimeMetadata: new ElementDesignTimeMetadata({
					data: {
						name: "My Custom Metadata"
					}
				}),
				init: assert.async(),
				initFailed(oEvent) {
					assert.ok(false);
					throw new Error(oEvent.getParameter("error"));
				}
			});
		},
		afterEach() {
			this.oOverlay.destroy();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when the design time metadata is retrieved", function(assert) {
			var oDesignTimeMetadata = this.oOverlay.getDesignTimeMetadata();
			assert.equal(oDesignTimeMetadata.getData().name, "My Custom Metadata", "then the right custom data is set");
		});
	});

	QUnit.module("Given that an Overlay is created for a control marked as ignored in the designtime Metadata", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oOverlay = new ElementOverlay({
				isRoot: true,
				element: this.oButton,
				designTimeMetadata: new ElementDesignTimeMetadata({
					data: {
						ignore: true
					}
				}),
				init: function() {
					this.oOverlay.placeInOverlayContainer();
					fnDone();
				}.bind(this),
				initFailed(oEvent) {
					assert.ok(false);
					throw new Error(oEvent.getParameter("error"));
				}
			});
		},
		afterEach() {
			this.oOverlay.destroy();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("then...", function(assert) {
			assert.strictEqual(this.oOverlay.isVisible(), false, "the overlay is marked as invisible");
			assert.strictEqual(DOMUtil.isVisible(this.oOverlay.getDomRef()), false, "the overlay is hidden in DOM");
		});
	});

	QUnit.module("Given that an Overlay is created for two layouts with two child controls", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oButton1 = new Button({
				text: "Button 1",
				id: "Button1"
			});
			this.oButton2 = new Button({
				text: "Button 2",
				id: "Button2"
			});
			this.oButton3 = new Button({
				text: "Button 3",
				id: "Button3"
			});
			this.oButton4 = new Button({
				text: "Button 4",
				id: "Button4"
			});

			this.oVerticalLayout1 = new VerticalLayout({
				content: [this.oButton1, this.oButton2]
			});

			this.oVerticalLayout2 = new VerticalLayout({
				content: [this.oButton3, this.oButton4]
			});

			this.oVerticalLayout1.placeAt("qunit-fixture");
			this.oVerticalLayout2.placeAt("qunit-fixture");

			await nextUIUpdate();

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
		afterEach() {
			this.oVerticalLayout2.destroy();
			this.oVerticalLayout1.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
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
			this.oOverlayLayout2.getDomRef().prepend(document.createElement("div"));
			ElementUtil.insertAggregation(this.oVerticalLayout2, "content", this.oButton2, 0);

			var oDomRefButton2 = this.oOverlayButton2.getDomRef();
			var oDomRefButton3 = this.oOverlayButton3.getDomRef();

			assert.strictEqual(oDomRefButton3, oDomRefButton2.nextElementSibling, "then Overlay DOM elements in target layout are in correct order");
			assert.strictEqual(null, oDomRefButton2.previousElementSibling, "and extra element is not taken into account");
		});
	});

	QUnit.module("Given that an Overlay is created for a control in the content of a scrollable container", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oContainer = document.createElement("div");
			this.oContainer.style.height = "400px";
			this.oContainer.style.width = "200px";
			this.oContainer.style.overflowY = "auto";
			this.oContainer.setAttribute("id", "scroll-container");
			var oChild1 = document.createElement("div");
			oChild1.style.width = "100%";
			oChild1.style.height = "100px";
			var oChild2 = document.createElement("div");
			oChild2.style.height = "500px";
			oChild2.setAttribute("id", "scroll-content");
			this.oContainer.append(oChild1, oChild2);
			document.getElementById("qunit-fixture").append(this.oContainer);

			this.oButton = new Button({
				text: "Button"
			});
			this.oButton.placeAt("scroll-content");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oButton]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oOverlay = OverlayRegistry.getOverlay(this.oButton);
				fnDone();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oContainer.remove();
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the container is scrolled", function(assert) {
			var fnDone = assert.async();
			this.oOverlay.attachEventOnce("geometryChanged", function() {
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oOverlay.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oButton.getDomRef()).top), "overlay has same top position as a control");
				assert.deepEqual(Math.ceil(DOMUtil.getOffset(this.oOverlay.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oButton.getDomRef()).left), "overlay has same left position as a control");
				fnDone();
			}, this);
			this.oContainer.scrollTop = 50;
		});
	});

	QUnit.module("Given a SimpleScrollControl with Overlays", {
		async beforeEach(assert) {
			var fnDone = assert.async();

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
				items: [this.oSimpleScrollControl]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oSimpleScrollControlOverlay = OverlayRegistry.getOverlay(this.oSimpleScrollControl);
				this.oContent1Overlay = OverlayRegistry.getOverlay(this.oContent1);
				// FIXME: when synced event is resolved including scrollbar synchronization
				if (window.getComputedStyle(this.oContent1Overlay.getDomRef()).transform === "none") {
					this.oContent1Overlay.attachEventOnce("geometryChanged", fnDone);
				} else {
					fnDone();
				}
			}, this);
		},
		afterEach() {
			sandbox.restore();
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		function createInitialScrollHandlerValues() {
			return {
				offsetTop: DOMUtil.getOffset(this.oContent1.getDomRef()).top,
				controlOffset: DOMUtil.getOffset(this.oContent1.getDomRef()),
				overlayOffset: DOMUtil.getOffset(this.oContent1Overlay.getDomRef()),
				applyStylesSpy: sandbox.spy(this.oContent1Overlay, "applyStyles")
			};
		}

		function scrollHandler(assert, done, mInitialValues) {
			assert.equal(mInitialValues.applyStylesSpy.callCount, 0, "then the applyStyles Method is not called");
			assert.equal(Math.ceil(DOMUtil.getOffset(this.oContent1.getDomRef()).top), Math.ceil(mInitialValues.offsetTop) - 100, "Then the top offset is 100px lower");
			assert.strictEqual(Math.ceil(DOMUtil.getOffset(this.oContent1.getDomRef()).left), Math.ceil(DOMUtil.getOffset(this.oContent1Overlay.getDomRef()).left), "Then the offset left is still equal");
			assert.strictEqual(Math.ceil(DOMUtil.getOffset(this.oContent1.getDomRef()).top), Math.ceil(DOMUtil.getOffset(this.oContent1Overlay.getDomRef()).top), "Then the offset top is still equal");
			assert.strictEqual(Math.ceil(mInitialValues.controlOffset.left), Math.ceil(mInitialValues.overlayOffset.left), "Then the offset left is still equal");
			assert.strictEqual(Math.ceil(mInitialValues.controlOffset.top), Math.ceil(mInitialValues.overlayOffset.top), "Then the offset top is still equal");
			done();
		}

		QUnit.test("when the control is scrolled", function(assert) {
			var fnDone = assert.async();
			var mInitialValues = createInitialScrollHandlerValues.call(this);
			this.oSimpleScrollControlOverlay.attachEventOnce("scrollSynced", scrollHandler.bind(this, assert, fnDone, mInitialValues));
			var oScrollContainerDOM = this.oSimpleScrollControl.getDomRef().querySelector(".sapUiDtTestSSCScrollContainer");
			oScrollContainerDOM.scrollTop = 100;
		});

		QUnit.test("when the overlay is scrolled", function(assert) {
			var fnDone = assert.async();
			var mInitialValues = createInitialScrollHandlerValues.call(this);
			var oScrollContainerDOM = this.oSimpleScrollControl.getDomRef().querySelector(".sapUiDtTestSSCScrollContainer");
			oScrollContainerDOM.addEventListener("scroll", scrollHandler.bind(this, assert, fnDone, mInitialValues));
			this.oSimpleScrollControlOverlay.getScrollContainerById(0).get(0).scrollTop = 100;
		});

		QUnit.test("when the control is re-rendered (with removal of all events) and then scrolled", function(assert) {
			var fnDone = assert.async();
			var mInitialValues = createInitialScrollHandlerValues.call(this);
			this.oSimpleScrollControlOverlay.attachEventOnce("scrollSynced", scrollHandler.bind(this, assert, fnDone, mInitialValues));
			this.oSimpleScrollControl.$().find("> .sapUiDtTestSSCScrollContainer").off();
			var oDelegate = {
				onAfterRendering() {
					this.oSimpleScrollControl.removeEventDelegate(oDelegate);
					this.oSimpleScrollControl.$().find("> .sapUiDtTestSSCScrollContainer").scrollTop(100);
				}
			};
			this.oSimpleScrollControl.addEventDelegate(oDelegate, this);
			this.oSimpleScrollControl.invalidate();
		});

		QUnit.test("when the scroll container needs updating", function(assert) {
			var oScrollContainer = this.oSimpleScrollControlOverlay.getScrollContainerById(1).get(0);
			var aOverlayChildrenDomRef = this.oSimpleScrollControlOverlay.getChildrenDomRef();

			assert.strictEqual(oScrollContainer.children.length, 2, "initially there are two aggregations in the scroll container");
			assert.strictEqual(aOverlayChildrenDomRef.children.length, 4, "and 4 children in the element overlay");
			assert.strictEqual(this.oSimpleScrollControlOverlay.getAggregationOverlay("content3").getDomRef().parentElement, oScrollContainer, "content3 is in the scroll container");
			assert.strictEqual(this.oSimpleScrollControlOverlay.getAggregationOverlay("content4").getDomRef().parentElement, oScrollContainer, "content4 is in the scroll container");
			assert.strictEqual(this.oSimpleScrollControlOverlay.getAggregationOverlay("content5").getDomRef().parentElement, aOverlayChildrenDomRef, "content5 is not in the scroll container");

			this.oSimpleScrollControl.changeScrollContainer();

			assert.strictEqual(oScrollContainer.children.length, 2, "still two children in the scroll container");
			assert.strictEqual(aOverlayChildrenDomRef.children.length, 4, "and 4 children in the element overlay");
			assert.strictEqual(this.oSimpleScrollControlOverlay.getAggregationOverlay("content3").getDomRef().parentElement, aOverlayChildrenDomRef, "content3 is not in the scroll container");
			assert.strictEqual(this.oSimpleScrollControlOverlay.getAggregationOverlay("content4").getDomRef().parentElement, oScrollContainer, "content4 is in the scroll container");
			assert.strictEqual(this.oSimpleScrollControlOverlay.getAggregationOverlay("content5").getDomRef().parentElement, oScrollContainer, "content5 is in the scroll container");
		});

		QUnit.test("when the overlay gets destroyed and the scroll container needs updating", function(assert) {
			this.oSimpleScrollControlOverlay.destroy();
			this.oSimpleScrollControl.changeScrollContainer();
			assert.ok(true, "there is no exception");
		});
	});

	QUnit.module("Postponed an aggregation overlay rendering", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oPanel = new Panel({
				height: "300px",
				width: "300px"
			});
			this.oPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
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

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oPanelOverlay = OverlayRegistry.getOverlay(this.oPanel);
				this.oContentAggregationOverlay = this.oPanelOverlay.getAggregationOverlay("content");
				fnDone();
			}, this);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oPanel.destroy();
		}
	}, function() {
		QUnit.test("when a control is added to an empty aggregation", async function(assert) {
			var fnDone = assert.async();
			assert.ok(this.oPanelOverlay.isRendered());
			assert.notOk(this.oContentAggregationOverlay.isRendered(), "then the aggregation overlay for an empty aggregation is not rendered");
			var oButton = new Button({
				text: "test"
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				// Aggregation has been rendered
				assert.ok(this.oContentAggregationOverlay.isRendered(), "then the aggregation overlay is rendered");

				// Control inside aggregation has been rendered
				var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
				assert.ok(oButtonOverlay.isRendered(), "then the new control is rendered");
				assert.ok(oButtonOverlay.isVisible());
				fnDone();
			}, this);
			this.oPanel.addContent(oButton);
			await nextUIUpdate();
		});
	});

	QUnit.module("Aggregation sorting", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			var fnDone2 = assert.async();

			var oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [new Button({ text: "abc" }), new Button({ text: "def" }), new Button({ text: "ghi" })]
			});
			var oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [new Button({ text: "foo" }), new Button({ text: "bar" }), new Button({ text: "foobar" })]
			});
			var oSection = new ObjectPageSection("section", {
				subSections: [oSubSection]
			});
			var oSection2 = new ObjectPageSection("section2", {
				subSections: [oSubSection2]
			});
			this.oLayout = new ObjectPageLayout("layout", {
				height: "300px",
				sections: [oSection, oSection2],
				headerTitle: new ObjectPageHeader({
					objectTitle: "Title"
				}),
				headerContent: new Button({
					text: "headerContent"
				}),
				footer: new Bar({
					contentMiddle: [new Button({ text: "footer" })]
				}),
				showFooter: true
			}).attachEventOnce("onAfterRenderingDOMReady", fnDone2);
			this.oVBox = new VBox({
				items: [this.oLayout]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

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
		afterEach() {
			this.oDesignTime.destroy();
			this.oVBox.destroy();
		}
	}, function() {
		QUnit.test("check position in DOM tree", function(assert) {
			var aChildren = Array.from(this.oLayoutOverlay.getChildrenDomRef().children);
			var oScrollContainer = this.oLayoutOverlay.getScrollContainerById(this.oHeaderContentOverlay.getScrollContainerId()).get(0);
			var aScrollContainerChildren = Array.from(oScrollContainer.children);

			var iIndexHeaderTitleOverlay = aChildren.indexOf(this.oHeaderTitleOverlay.getDomRef());
			var iScrollContainer = aChildren.indexOf(oScrollContainer);
			var iIndexFooterOverlay = aChildren.indexOf(this.oFooterOverlay.getDomRef());
			var iIndexHeaderContentOverlay = aScrollContainerChildren.indexOf(this.oHeaderContentOverlay.getDomRef());
			var iIndexSectionsOverlay = aScrollContainerChildren.indexOf(this.oSectionsOverlay.getDomRef());

			assert.ok(iIndexHeaderTitleOverlay < iScrollContainer, "then the overlay for headerTitle is above scrollcontainer");
			assert.ok(iScrollContainer < iIndexFooterOverlay, "then the scrollcontainer is above the overlay for headerTitle");
			assert.ok(iIndexHeaderContentOverlay < iIndexSectionsOverlay, "then the overlay for headerContent is above the overlay for sections");
		});

		QUnit.test("check whether scrollbar position doesn't affect sorting", function(assert) {
			var fnDone = assert.async();

			var oScrollContainer = this.oLayoutOverlay.getScrollContainerById(this.oHeaderContentOverlay.getScrollContainerId()).get(0);
			var aScrollContainerChildren = Array.from(oScrollContainer.children);
			var iIndexHeaderContentOverlay = aScrollContainerChildren.indexOf(this.oHeaderContentOverlay.getDomRef());
			var iIndexSectionsOverlay = aScrollContainerChildren.indexOf(this.oSectionsOverlay.getDomRef());

			var oScrollbarSynchronizer = this.oLayoutOverlay._oScrollbarSynchronizers.get(oScrollContainer);
			oScrollbarSynchronizer.attachEventOnce("synced", function() {
				var aChildren = Array.from(this.oLayoutOverlay.getChildrenDomRef().children);
				var aScrollContainerChildren = Array.from(oScrollContainer.children);
				assert.ok(aChildren.indexOf(this.oHeaderTitleOverlay.getDomRef()) < aChildren.indexOf(oScrollContainer));
				assert.ok(aChildren.indexOf(oScrollContainer) < aChildren.indexOf(this.oFooterOverlay.getDomRef()));
				assert.strictEqual(aScrollContainerChildren.indexOf(this.oHeaderContentOverlay.getDomRef()), iIndexHeaderContentOverlay);
				assert.strictEqual(aScrollContainerChildren.indexOf(this.oSectionsOverlay.getDomRef()), iIndexSectionsOverlay);
				fnDone();
			}.bind(this));

			oScrollContainer.scrollTop = 300;
		});
	});

	QUnit.module("Given another SimpleScrollControl with Overlays and one scroll container aggregation is ignored", {
		async beforeEach(assert) {
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
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
				fnDone();
			}.bind(this));
		},
		afterEach() {
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when the overlay is rendered, also aggregation overlays are rendered", function(assert) {
			assert.ok(this.oScrollControlOverlay.getDomRef(), "overlay has domRef");
			assert.ok(this.oScrollControlOverlay.getAggregationOverlay("content2").getDomRef(), "aggregation overlay in scroll container has domRef");
			assert.ok(this.oScrollControlOverlay.getAggregationOverlay("footer").getDomRef(), "aggregation overlay outside scroll container has domRef");
		});
	});

	QUnit.module("Given a control with control domRef defined in dt-metadata", {
		async beforeEach(assert) {
			var AnyControl = SimpleScrollControl.extend("sap.ui.dt.test.controls.AnyControl", {
				metadata: {
					designtime: {
						domRef: ".sapUiDtTestSSCScrollContainer",
						scrollContainers: null // not needed in this test
					}
				},
				renderer: SimpleScrollControl.getMetadata().getRenderer().render
			});

			var fnDone = assert.async();

			this.oAnyControl = new AnyControl({
				id: "control"
			});

			this.oVBox = new VBox({
				items: [this.oAnyControl]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVBox]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oAnyControlOverlay = OverlayRegistry.getOverlay(this.oAnyControl);
				fnDone();
			}.bind(this));
		},
		afterEach() {
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when the overlay is rendered, also aggregation overlays are rendered", function(assert) {
			assert.ok(this.oAnyControlOverlay.getDomRef(), "overlay has domRef");
			assert.ok(this.oAnyControlOverlay.getGeometry().domRef.classList.contains("sapUiDtTestSSCScrollContainer"), "domRef from dt-metadata is taken");
		});
	});

	QUnit.module("Scrollbar classes", function() {
		QUnit.test("when one aggregation loses its scrolling, the scrollbar classes must not persist on the parent overlay (as the aggregation with scrollbar doesn't take the whole space inside the control)", async function(assert) {
			var ScrollControl = SimpleScrollControl.extend("sap.ui.dt.test.controls.ScrollControl", {
				metadata: {
					designtime: {
						...SimpleScrollControl.getMetadata()._oDesignTime,
						scrollContainers: null
					}
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
			await nextUIUpdate();

			var oContent1DOM = this.oScrollControl.getDomRef().querySelector("[id*='content1']");
			oContent1DOM.style.height = "300px";
			oContent1DOM.style.overflow = "auto";
			var oContent2DOM = this.oScrollControl.getDomRef().querySelector("[id*='content2']");
			oContent2DOM.style.height = "300px";
			oContent2DOM.style.overflow = "auto";

			this.oDesignTime = new DesignTime({
				rootElements: [this.oScrollControl]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
				assert.notOk(
					this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
					&& this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
				);
				this.oScrollControlOverlay.getAggregationOverlay("content2").getChildren()[0].attachEventOnce("geometryChanged", function(oEvent) {
					var oAggregationOverlay = oEvent.getSource();
					assert.strictEqual(oAggregationOverlay.getDomRef().querySelectorAll(".sapUiDtDummyScrollContainer").length, 0, "make sure dummy container has been removed");
					assert.notOk(
						this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
						&& this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
					);
					this.oDesignTime.destroy();
					this.oScrollControl.destroy();
					fnDone();
				}, this);
				this.oScrollControl.getContent2()[0].getDomRef().style.height = "250px";
			}.bind(this));
		});

		QUnit.test("when the aggregation has a scrolling which takes the whole space of the control", async function(assert) {
			var ScrollControl = SimpleScrollControl.extend("sap.ui.dt.test.controls.ScrollControl", {
				metadata: {
					designtime: {
						...SimpleScrollControl.getMetadata()._oDesignTime,
						scrollContainers: null
					}
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
			await nextUIUpdate();

			var oContent1DOM = this.oScrollControl.getDomRef().querySelector("[id*='content1']");
			oContent1DOM.style.height = "500px";
			oContent1DOM.style.overflow = "auto";

			this.oDesignTime = new DesignTime({
				rootElements: [this.oScrollControl]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
				assert.notOk(
					this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
					&& this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
				);

				this.oScrollControlOverlay.getAggregationOverlay("content1").getChildren()[0].attachEventOnce("geometryChanged", function(oEvent) {
					var oAggregationOverlay = oEvent.getSource().getParentAggregationOverlay();
					assert.strictEqual(oAggregationOverlay.getDomRef().querySelectorAll(".sapUiDtDummyScrollContainer").length, 1, "make sure dummy container has been created");
					assert.ok(
						this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
						&& this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
					);
					this.oDesignTime.destroy();
					this.oScrollControl.destroy();
					fnDone();
				}, this);
				this.oScrollControl.getContent1()[0].getDomRef().style.height = "700px";
			}.bind(this));
		});

		QUnit.test("when scrollcontainer loses scrolling, then scrollbar classes have to be removed", async function(assert) {
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
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [oVerticalLayout]
			});

			this.oDesignTime.attachEventOnce("synced", async function() {
				this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
				var mScrollSynchronizersMap = this.oScrollControlOverlay._oScrollbarSynchronizers;
				var oScrollbarSynchronizer = mScrollSynchronizersMap.get(Array.from(mScrollSynchronizersMap.keys())[0]);
				this.oTextAreaOverlay = OverlayRegistry.getOverlay(this.oTextArea);
				assert.ok(
					this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
					&& this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
				);
				oScrollbarSynchronizer.attachEventOnce("synced", function() {
					assert.ok(true, "then the scrollbar container content is synchronized before it is removed");
					// setTimeout is needed, because synced event doesn"t wait until all async processes are done
					setTimeout(function() {
						assert.ok(
							!this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBar")
							&& !this.oScrollControlOverlay.hasStyleClass("sapUiDtOverlayWithScrollBarVertical")
						);
						this.oDesignTime.destroy();
						oVerticalLayout.destroy();
						fnDone();
					}.bind(this));
				}.bind(this));
				this.oTextArea.setHeight("50px");
				await nextUIUpdate();
			}.bind(this));
		});

		QUnit.test("when scrollcontainer is removed, the corresponding overlay must be hidden", async function(assert) {
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
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [oVerticalLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				// setTimeout is needed, because synced event doesn"t wait until all async processes are done
				setTimeout(async function() {
					this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
					var oScrollContainerOverlayDomRef = this.oScrollControlOverlay.getScrollContainerById(0).get(0);
					assert.strictEqual(window.getComputedStyle(oScrollContainerOverlayDomRef).display, "block");
					this.oScrollControlOverlay.attachEvent("geometryChanged", function() {
						assert.strictEqual(window.getComputedStyle(oScrollContainerOverlayDomRef).display, "none");
						this.oDesignTime.destroy();
						oVerticalLayout.destroy();
						fnDone();
					}, this);
					this.oScrollControl.setScrollcontainerEnabled(false);
					await nextUIUpdate();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when applyStyles is running whith scrollcontainer exists and the synchroninzer is destroyed", async function(assert) {
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
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [oVerticalLayout]
			});

			this.oDesignTime.attachEventOnce("synced", async function() {
				this.oScrollControlOverlay = OverlayRegistry.getOverlay(this.oScrollControl);
				var oTextAreaOverlay = OverlayRegistry.getOverlay(this.oTextArea);
				var oScrollContainerOverlayDomRef = this.oScrollControlOverlay.getScrollContainerById(0).get(0);
				assert.strictEqual(window.getComputedStyle(oScrollContainerOverlayDomRef).display, "block");
				var oGeometryChangedSpy = sandbox.spy();
				oTextAreaOverlay.attachEvent("geometryChanged", oGeometryChangedSpy);
				this.oDesignTime.attachEventOnce("synced", function() {
					assert.ok(true, "then the synched event is fired by the designtime");
					assert.ok(oGeometryChangedSpy.called, "then the geometry change event is fired for the scroll control overlay");
					this.oDesignTime.destroy();
					oVerticalLayout.destroy();
					fnDone();
				}, this);
				oTextAreaOverlay.fireApplyStylesRequired({ targetOverlay: this.oTextArea });
				this.oScrollControlOverlay._oScrollbarSynchronizers.forEach(function(oSynchronizer) {
					oSynchronizer.destroy();
				});
				await nextUIUpdate();
			}.bind(this));
		});
	});

	QUnit.module("Given that an Overlay is created when scrolling is present", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oButton = new Button({
				text: "Button"
			});
			this.oButton2 = new Button({
				text: "Button2"
			});
			this.oButton3 = new Button({
				text: "Button3"
			});

			this.oPanel = new Panel({
				id: "SmallPanel",
				content: [this.oButton, this.oButton2, this.oButton3],
				width: "40px",
				height: "100px"
			});

			this.oPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oPanel.getDomRef().querySelector(".sapMPanelContent").scrollLeft = 20;
			this.oPanel.getDomRef().querySelector(".sapMPanelContent").scrollTop = 50;

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPanel]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone);
		},
		afterEach() {
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
				// Math.ceil is required for IE and Edge
				assert.equal(
					Math.ceil(DOMUtil.getOffset(this.oPanelOverlay.getDomRef()).left),
					Math.ceil(DOMUtil.getOffset(this.oPanel.getDomRef()).left),
					"panel overlay has same left position as the panel control"
				);
				assert.equal(
					Math.ceil(DOMUtil.getOffset(this.oPanelOverlay.getDomRef()).top),
					Math.ceil(DOMUtil.getOffset(this.oPanel.getDomRef()).top),
					"panel overlay has same top position as the panel control"
				);
				assert.equal(
					Math.ceil(DOMUtil.getOffset(this.oButtonOverlay.getDomRef()).left),
					Math.ceil(DOMUtil.getOffset(this.oButton.getDomRef()).left),
					"button overlay has same left position as the button control"
				);
				assert.equal(
					Math.ceil(DOMUtil.getOffset(this.oButtonOverlay.getDomRef()).top),
					Math.ceil(DOMUtil.getOffset(this.oButton.getDomRef()).top),
					"button overlay has same top position as the button control"
				);
				assert.equal(
					Math.ceil(DOMUtil.getOffset(this.oButton2Overlay.getDomRef()).left),
					Math.ceil(DOMUtil.getOffset(this.oButton2Overlay.getDomRef()).left),
					"button2 overlay has same left position as the button2 control"
				);
				assert.equal(
					Math.ceil(DOMUtil.getOffset(this.oButton2Overlay.getDomRef()).top),
					Math.ceil(DOMUtil.getOffset(this.oButton2Overlay.getDomRef()).top),
					"button2 overlay has same top position as the button2 control"
				);
			};

			// In internet explorer/edge, the checks happen before the overlays inside the scroll container
			// are properly placed, so we must wait until they are finalized before checking
			if (
				Math.ceil(DOMUtil.getOffset(this.oButtonOverlay.getDomRef()).left)
				!== Math.ceil(DOMUtil.getOffset(this.oButton.getDomRef()).left)
			) {
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

	QUnit.module("Error handling", function() {
		QUnit.test("when creating an ElementOverlay with incorrect elemement object", function(assert) {
			var oManagedObject = new ManagedObject();

			assert.throws(
				function() {
					// eslint-disable-next-line no-new
					new ElementOverlay({
						element: oManagedObject
					});
				},
				/Cannot create overlay without a valid element/
			);

			oManagedObject.destroy();
		});
	});

	QUnit.module("Highlighting on selection - Given a List with bound items and a List with unbound items", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oHorizontalLayout = await TestUtil.createListWithBoundItems();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oHorizontalLayout]
			});
			this.oDesignTime.attachEventOnce("synced", fnDone);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oHorizontalLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		[
			{
				description: "when overlay is selected that is a cloned item from binding aggregation",
				selected: { id: "boundListItem-boundlist-0", highlighted: true },
				twin: { id: "boundListItem-boundlist-1", highlighted: true }
			},
			{
				description: "when overlay is selected that is part of a cloned item from binding aggregation",
				selected: { id: "boundListItem-btn-boundlist-0", highlighted: true },
				twin: { id: "boundListItem-btn-boundlist-1", highlighted: true }
			},
			{
				description: "when overlay is selected that does not belong to a binding aggregation",
				selected: { id: "item1-btn", highlighted: false },
				twin: { id: "item2-btn", highlighted: false }
			},
			{
				description: "when overlay is selected that is part of the binding aggregation template",
				selected: { id: "boundListItem-btn", highlighted: false },
				twin: { id: "boundListItem-btn-boundlist-0", highlighted: true },
				twin1: { id: "boundListItem-btn-boundlist-1", highlighted: true }
			}
		].forEach(function(options) {
			QUnit.test(options.description, function(assert) {
				var oSelectedOverlay = OverlayRegistry.getOverlay(options.selected.id);
				var oFirstListItemButtonOverlay = OverlayRegistry.getOverlay(options.twin.id);
				oSelectedOverlay.setSelectable(true);
				oSelectedOverlay.setSelected(true);
				assert.equal(oSelectedOverlay.isSelectable(), true, "then the overlay is selectable");
				assert.equal(oSelectedOverlay.isSelected(), true, "then the overlay is selected");
				assert.strictEqual(oSelectedOverlay.hasStyleClass("sapUiDtOverlayHighlighted"), options.selected.highlighted,
					`then the selected Overlay ${options.selected.highlighted
						? "do have the highlighted StyleClss" : "does not have the highlighted StyleClass"}`
				);
				assert.strictEqual(oFirstListItemButtonOverlay.hasStyleClass("sapUiDtOverlayHighlighted"), options.twin.highlighted,
					`then the first twin Overlay ${options.twin.highlighted
						? "do have the highlighted StyleClss" : "does not have the highlighted StyleClass"}`
				);
				if (options.twin1) {
					var oSecondListItemButtonOverlay = OverlayRegistry.getOverlay(options.twin1.id);
					assert.strictEqual(oSecondListItemButtonOverlay.hasStyleClass("sapUiDtOverlayHighlighted"), options.twin1.highlighted,
						`then the second twin Overlay ${options.twin1.highlighted
							? "do have the highlighted StyleClss" : "does not have the highlighted StyleClass"}`
					);
				}
			});
		});
	});

	QUnit.module("Given a DynamicPage with scrolling", {
		async beforeEach(assert) {
			var fnDone = assert.async();

			function getDynamicPageTitle() {
				return new DynamicPageTitle({
					heading: new Title({
						text: "Dynamic Page Title"
					})
				});
			}

			function getDynamicPageHeader() {
				return new DynamicPageHeader({
					pinnable: true,
					content: [new Button("PageHeaderButton")]
				});
			}

			this.oDynamicPage = new DynamicPage("DynamicPage", {
				showFooter: true,
				title: getDynamicPageTitle(),
				header: getDynamicPageHeader(),
				content: [new VerticalLayout("PageContentLayout")]
			});

			this.oDynamicPage.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oDynamicPage]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oDynamicPageOverlay = OverlayRegistry.getOverlay(this.oDynamicPage);
				fnDone();
			}.bind(this));
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oDynamicPage.destroy();
		}
	}, function() {
		QUnit.test("check that the scrollcontainer overlay has the correct clip-path", function(assert) {
			assert.strictEqual(
				window.getComputedStyle(this.oDynamicPage.$wrapper.get(0))["clip-path"],
				window.getComputedStyle(this.oDynamicPageOverlay.getScrollContainerById(0).get(0))["clip-path"],
				"then the scroll container gets the clip-path property from the DynamicPage contentWrapper"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});