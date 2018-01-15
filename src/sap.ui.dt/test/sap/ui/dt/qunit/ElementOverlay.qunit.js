/*global QUnit sinon*/

sap.ui.define([
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/AggregationDesignTimeMetadata",
	"sap/ui/dt/DesignTime",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/ElementMetadata",
	// should be last:
	"sap/ui/qunit/qunit-coverage",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-ie",
	"sap/ui/thirdparty/sinon-qunit"
],
function(
	ElementOverlay,
	Overlay,
	OverlayRegistry,
	DOMUtil,
	ElementUtil,
	ElementDesignTimeMetadata,
	AggregationDesignTimeMetadata,
	DesignTime,
	Button,
	Page,
	Label,
	Text,
	VerticalLayout,
	SimpleForm,
	ElementMetadata
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.start();

	QUnit.module("Given that an Overlay Container is created", {
		beforeEach : function() {
			Overlay.getOverlayContainer();
		},
		afterEach : function() {
			Overlay.removeOverlayContainer();
		}
	});

	QUnit.test("then", function(assert) {
		var $container = jQuery("#overlay-container");
		assert.strictEqual($container.length, 1, "overlay container exists");
	});

	QUnit.module("Given that an Overlay is created for a control", {
		beforeEach : function() {
			this.oButton = new Button({
				text : "Button"
			});

			this.oOverlay = new ElementOverlay({
				element : this.oButton,
				designTimeMetadata : {}
			});
			this.oOverlay.placeInOverlayContainer();

			this.oButton.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oButton.destroy();
			this.oOverlay.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when all is rendered", function(assert) {
		assert.ok(this.oOverlay.$(), "overlay is visible");
		assert.deepEqual(this.oOverlay.$().offset(), this.oButton.$().offset(), "overlay has same position as a control");
	});

	QUnit.test("when an overlay is newly created and placed", function(assert) {
		var oEventSpy = sandbox.spy(ElementOverlay.prototype, "fireElementModified");
		var oButton1 = new Button({
			text : "Button1"
		});
		var oOverlay = new ElementOverlay({
			element: oButton1,
			designTimeMetadata: {}
		});
		oOverlay.placeInOverlayContainer();
		oButton1.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(oEventSpy.callCount, 2, "after rendering the elementModified event is fired twice");
		assert.deepEqual(oEventSpy.args[1][0], {id: oOverlay.getId(), type: "overlayRendered"}, "and the after rendering event is properly used");

		oOverlay.onAfterRendering();
		assert.equal(oEventSpy.callCount, 2, "when calling onAfterRendering again, no additional event is fired");
		oOverlay.destroy();
	});

	QUnit.test("when overlay is enabled/disabled", function(assert) {
		var sWidth;
		var fnGetWidth = function (oOverlay) {
			return oOverlay.getDomRef().style.width;
		};

		//Overlay enabled by default
		sWidth = fnGetWidth(this.oOverlay);
		this.oButton.setText('Lorem ipsum dolor sit amet...');
		sap.ui.getCore().applyChanges();
		assert.notStrictEqual(sWidth, fnGetWidth(this.oOverlay), "overlay changes its width");

		//Explicitly disable overlay
		sWidth = fnGetWidth(this.oOverlay);
		this.oOverlay.setVisible(false);
		this.oButton.setText('Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi...');
		sap.ui.getCore().applyChanges();
		assert.strictEqual(sWidth, fnGetWidth(this.oOverlay), "overlay didn't change its width");
	});

	QUnit.test("When _onElementModified is called ", function(assert) {
		var oEventSpy = sandbox.spy(this.oOverlay, "fireElementModified");
		var oSetRelevantSpy = sandbox.spy(this.oOverlay, "setRelevantOverlays");

		var oEvent = {
			getParameters: function() {
				return {};
			}
		};
		this.oOverlay._onElementModified(oEvent);
		assert.equal(oEventSpy.callCount, 0, "without parameters, the modified event is not fired");
		assert.equal(oSetRelevantSpy.callCount, 0, "and setRelevantOverlays was not called");

		oEvent = {
			getParameters: function() {
				return {
					type: "propertyChanged",
					name: "visible"
				};
			}
		};
		this.oOverlay._onElementModified(oEvent);
		assert.equal(oEventSpy.callCount, 1, "with propertyChanged and visible as parameters,the modified event is fired");
		assert.equal(oSetRelevantSpy.callCount, 1, "and setRelevantOverlays was called");

		oEvent = {
			getParameters: function() {
				return {
					type: "propertyChanged",
					name: "text"
				};
			}
		};
		this.oOverlay._onElementModified(oEvent);
		assert.equal(oEventSpy.callCount, 1, "with propertyChanged and text as parameters, the modified event is not fired");
		assert.equal(oSetRelevantSpy.callCount, 1, "and setRelevantOverlays was not called");

		sandbox.stub(this.oOverlay, "getAggregationOverlay").returns(this.oOverlay);
		oEvent = {
			getParameters: function() {
				return {
					type: "insertAggregation",
					name: "aggregationName"
				};
			}
		};
		this.oOverlay._onElementModified(oEvent);
		assert.equal(oEventSpy.callCount, 2, "with inserAggregation and a name, the modified event is fired");
		assert.equal(oSetRelevantSpy.callCount, 2, "and setRelevantOverlays was called");

		oEvent = {
			getParameters: function() {
				return {
					type: "setParent"
				};
			}
		};
		this.oOverlay._onElementModified(oEvent);
		assert.equal(oEventSpy.callCount, 3, "with setParent as type, the modified event is fired");
		assert.equal(oSetRelevantSpy.callCount, 2, "and setRelevantOverlays was not called");
	});


	QUnit.module("Given that an Overlay is created for a control with an existing designTime metadata", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oPage = new Page();
			this.oPage.placeAt("content");
			ElementUtil.loadDesignTimeMetadata(this.oPage).then(function(oDesignTimeMetadata) {
				this.oOverlay = new ElementOverlay({
					designTimeMetadata : { data : oDesignTimeMetadata},
					element : this.oPage
				});
				this.oOverlay.placeInOverlayContainer();
				sap.ui.getCore().applyChanges();
				done();
			}.bind(this));
		},
		afterEach : function() {
			this.oPage.destroy();
			this.oOverlay.destroy();
		}
	});

	QUnit.test("when OverlayRegistry initialized", function(assert) {
		assert.strictEqual(this.oOverlay, OverlayRegistry.getOverlay(this.oPage.getId()), "overlay is registered in OverlayRegistery");
	});

	QUnit.test("when the control is rendered", function(assert) {
		var oDomRef = this.oOverlay.getDomRef();
		assert.strictEqual(this.oOverlay.$().parent().attr("id"), "overlay-container", 'then the overlay is added to the overlay container');

		assert.notEqual(oDomRef.className.indexOf("sapUiDtOverlay"), -1, 'and the right CSS class overlay is set to the element');
		assert.notEqual(oDomRef.className.indexOf("sapUiDtElementOverlay"), -1, 'and the right CSS element overlay class is set to the element');

		var mElementOffset = jQuery(oDomRef).offset();
		var mOverlayOffset = jQuery(oDomRef).offset();
		assert.equal(mOverlayOffset.top, mElementOffset.top, 'and the right postion "top" is applied to the overlay');
		assert.equal(mOverlayOffset.left, mElementOffset.left, 'and the right postion "left" is applied to the overlay');

		var oDesignTimeMetadata = this.oOverlay.getDesignTimeMetadata();
		assert.ok(oDesignTimeMetadata instanceof ElementDesignTimeMetadata, "and the design time metadata for the control is set");
	});

	QUnit.test("when CSS animation takes place in UI", function(assert) {
		var done = assert.async();

		var fnCheckSize = function() {
			assert.strictEqual(this.oPage.$().width(), this.oOverlay.$().width());
			done();
		}.bind(this);

		if (!sap.ui.Device.browser.phantomJS && !sap.ui.Device.browser.edge && !sap.ui.Device.browser.msie) {
			this.oPage.$().on("animationend webkitAnimationEnd oanimationend", fnCheckSize);
		} else {
			// phantomjs, MSIE & MS Edge don't support animation end events
			setTimeout(fnCheckSize, 1000);
		}

		this.oPage.addStyleClass("sapUiDtTestAnimate");
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("when the overlay is rerendered", function(assert) {
		var done = assert.async();

		var fnOriginalOnAfterRendering = this.oOverlay.onAfterRendering;
		this.oOverlay.onAfterRendering = function() {
			// if this test fails, check if there're changes in RenderManager _fPutIntoDom function (see ElementOverlay init comment for details)
			assert.notStrictEqual(this.getUIArea().getRootNode().childNodes.length, 0, "overlay is still in UIArea's DOM");

			done();
			return fnOriginalOnAfterRendering.apply(this, arguments);
		};

		this.oOverlay.rerender();
	});

	QUnit.test("when setSelectable, setMovable, setEditable is called on the overlay with undefined", function(assert) {
		this.oOverlay.setSelectable(undefined);
		assert.equal(this.oOverlay.isSelectable(), false, 'then the overlay is not selectable');
		assert.strictEqual(this.oOverlay.hasStyleClass("sapUiDtOverlaySelectable"), false, "the Overlay doesn't have the sapUiDtOverlaySelectable StyleClass");
		assert.strictEqual(this.oOverlay.hasStyleClass("sapUiDtOverlayFocusable"), false, "the Overlay doesn't have the sapUiDtOverlayFocusable StyleClass");

		this.oOverlay.setMovable(undefined);
		assert.equal(this.oOverlay.isMovable(), false, 'then the overlay is not movable');
		assert.strictEqual(this.oOverlay.hasStyleClass("sapUiDtOverlayMovable"), false, "the Overlay doesn't have the sapUiDtOverlayMovable StyleClass");
		this.oOverlay.setMovable(true);
		assert.equal(this.oOverlay.isMovable(), true, 'then the overlay is movable');
		assert.strictEqual(this.oOverlay.hasStyleClass("sapUiDtOverlayMovable"), true, "the Overlay has the sapUiDtOverlayMovable StyleClass");

		this.oOverlay.setEditable(undefined);
		assert.equal(this.oOverlay.isEditable(), false, 'then the overlay is not editable');
		assert.strictEqual(this.oOverlay.hasStyleClass("sapUiDtOverlayEditable"), false, "the Overlay doesn't have the sapUiDtOverlayEditable StyleClass");
		this.oOverlay.setEditable(true);
		assert.equal(this.oOverlay.isEditable(), true, 'then the overlay is editable');
		assert.strictEqual(this.oOverlay.hasStyleClass("sapUiDtOverlayEditable"), true, "the Overlay has the sapUiDtOverlayEditable StyleClass");
	});

	QUnit.test("when setSelected is called on the overlay with undefined", function(assert) {
		this.oOverlay.setSelectable(true);
		this.oOverlay.setSelected(undefined);
		assert.equal(this.oOverlay.isSelectable(), true, 'then the overlay is selectable');
		assert.equal(this.oOverlay.isSelected(), false, 'then the overlay is not selected');
		assert.strictEqual(this.oOverlay.hasStyleClass("sapUiDtOverlaySelectable"), true, "the Overlay doesn't have the Selectable StyleClass");
		assert.strictEqual(this.oOverlay.hasStyleClass("sapUiDtOverlayFocusable"), true, "the Overlay doesn't have the focusable StyleClass");
		assert.strictEqual(this.oOverlay.hasStyleClass("sapUiDtOverlaySelected"), false, "the Overlay doesn't have the selected StyleClass");
	});

	QUnit.test("when the overlay is selectable and selected", function(assert) {
		this.oOverlay.attachSelectionChange(function(oEvent) {
			assert.ok(oEvent.getParameter("selected"), 'and a "selectionChange" event is fired which provides the right selected state');
		}, this);
		this.oOverlay.setSelectable(true);
		this.oOverlay.setSelected(true);
		assert.ok(this.oOverlay.isSelected(), 'then the state of the overlay is "selected"');
	});

	QUnit.test("when the overlay is selected and selected again", function(assert) {
		this.oOverlay.setSelected(true);
		var bFired = false;
		this.oOverlay.attachSelectionChange(function(oEvent) {
			bFired = true;
		}, this);
		this.oOverlay.setSelected(true);
		assert.ok(!bFired, 'then the "selection change" event should not fire again');
	});

	QUnit.test("when the overlay is changed to selectable false and the overlay is selected", function(assert) {
		this.oOverlay.setSelectable(false);
		assert.ok(!this.oOverlay.isSelectable(), 'then the state of the overlay is "not selectable"');

		var bFired = false;
		this.oOverlay.attachSelectionChange(function(oEvent) {
			bFired = true;
		}, this);
		this.oOverlay.setSelected(true);
		assert.ok(!this.oOverlay.isSelected(), 'and the state of the overlay is "not selected"');
		assert.ok(!bFired, 'and no "selection change" event is fired');
	});

	QUnit.test("when the overlay is selectable or not selectable", function(assert) {
		this.oOverlay.setSelectable(true);
		assert.ok(this.oOverlay.isFocusable(), "then the control is focusable");

		this.oOverlay.setSelectable(false);
		assert.ok(!this.oOverlay.isFocusable(), "then the control is not focusable");
	});

	QUnit.test("when the overlay is focusable and is focused", function(assert) {
		this.oOverlay.setFocusable(true);
		assert.ok(this.oOverlay.isFocusable(), "then the control knows it is focusable");
		sap.ui.getCore().applyChanges();

		this.oOverlay.focus();
		var that = this;
		var done = assert.async();
		setTimeout(function() {
			assert.ok(that.oOverlay.hasFocus(), 'then the state of the overlay is "focused"');
			done();
		}, 0);
	});

	QUnit.test("when the overlay is changed to focusable", function(assert) {

		var fnHandler = this.spy();
		this.oOverlay.attachFocusableChange(fnHandler);

		this.oOverlay.setFocusable(true);
		assert.equal(fnHandler.callCount, 1, 'then the event handler is called');
	});


	QUnit.module("Given that an Overlay is created for a control with an existing designTime metadata", {
		beforeEach : function(assert) {
			var that = this;
			var done = assert.async();
			this.oPage = new Page();
			this.oPage.placeAt("content");
			ElementUtil.loadDesignTimeMetadata(this.oPage).then(function(oDesignTimeMetadata) {
				that.oOverlay = new ElementOverlay({
					designTimeMetadata : { data : oDesignTimeMetadata},
					element : that.oPage
				});
				that.oOverlay.placeInOverlayContainer();
				sap.ui.getCore().applyChanges();
				done();
			});
		},
		afterEach : function() {
			this.oPage.destroy();
			this.oOverlay.destroy();
		}
	});

	QUnit.test("When the overlay and it's aggregations are rendered", function(assert) {
		var oContentOverlay = this.oOverlay.getAggregationOverlay("content");
		var oHeaderOverlay = this.oOverlay.getAggregationOverlay("customHeader");

		var aAggregationOverlays = this.oOverlay.getAggregationOverlays();
		var iIndexOfContentOverlay = aAggregationOverlays.indexOf(oContentOverlay);
		var iIndexOfHeaderOverlay = aAggregationOverlays.indexOf(oHeaderOverlay);

		assert.ok(iIndexOfContentOverlay > iIndexOfHeaderOverlay, "overlay for header aggregation is above section aggregation (according to dom order)");
	});

	QUnit.module("Given that an Overlay is created for a control with an invisible domRef", {
		beforeEach : function(assert) {
			var that = this;
			this.oLabel = new Label();
			this.oLabel.placeAt("content");
			that.oOverlay = new ElementOverlay({
				designTimeMetadata : {},
				element : that.oLabel
			});
			that.oOverlay.placeInOverlayContainer();
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oLabel.destroy();
			this.oOverlay.destroy();
		}
	});

	QUnit.test("when the control's domRef is changed to visible...", function(assert) {
		var done = assert.async();

		var fnOriginalOnAfterRendering = this.oOverlay.onAfterRendering;
		this.oOverlay.onAfterRendering = function() {
			var vOriginalReturn = fnOriginalOnAfterRendering.apply(this, arguments);
			assert.ok(this.$().is(":visible"), "the overlay is also visible in DOM");

			done();
			return vOriginalReturn;
		};

		this.oLabel.setText("test");
		sap.ui.getCore().applyChanges();
	});

	QUnit.module("Given that an Overlay is created for a layout with an invisible domRef", {
		beforeEach : function(assert) {
			var that = this;
			this.oLabel = new Label({text : "text"});
			this.oVerticalLayout = new VerticalLayout({ content : [this.oLabel] });
			this.oVerticalLayout.placeAt("content");
			sap.ui.getCore().applyChanges();
			this.oVerticalLayout.$().css("display", "none");

			that.oLayoutOverlay = new ElementOverlay({
				designTimeMetadata : {},
				element : that.oVerticalLayout
			});
			that.oLayoutOverlay.placeInOverlayContainer();
			that.oLabelOverlay = new ElementOverlay({
				designTimeMetadata : {},
				element : that.oLabel
			});
			that.oLabelOverlay.placeInOverlayContainer();
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oVerticalLayout.destroy();
			this.oLayoutOverlay.destroy();
			this.oLabelOverlay.destroy();
		}
	});

	QUnit.test("when the layout's domRef is changed to visible...", function(assert) {
		var that = this;
		var done = assert.async();

		var fnOriginalOnAfterRendering = this.oLabelOverlay.onAfterRendering;
		this.oLabelOverlay.onAfterRendering = function() {
			var vOriginalReturn = fnOriginalOnAfterRendering.apply(this, arguments);
			assert.ok(that.oLayoutOverlay.$(), "the layout's overlay is also in DOM");
			assert.ok(this.$(), "layout children's overlay is also in DOM");

			done();
			return vOriginalReturn;
		};

		this.oVerticalLayout.$().css("display", "block");
	});

	QUnit.module("Given that an Overlay is created for a layout with a visible domRef", {
		beforeEach : function(assert) {
			var that = this;
			this.oLabel1 = new Label({text : "text 1"});
			this.oLabel2 = new Label({text : "text 2"});
			this.oInnerLayout = new VerticalLayout({ content : [this.oLabel2] });
			this.oVerticalLayout = new VerticalLayout({ content : [this.oLabel1, this.oInnerLayout] });
			this.oVerticalLayout.placeAt("content");
			sap.ui.getCore().applyChanges();

			that.oLayoutOverlay = new ElementOverlay({
				element : that.oVerticalLayout,
				designTimeMetadata : {}
			});
			that.oLayoutOverlay.placeInOverlayContainer();
			that.oInnerLayoutOverlay = new ElementOverlay({
				element : that.oInnerLayout,
				designTimeMetadata : {}
			});
			that.oInnerLayoutOverlay.placeInOverlayContainer();
			that.oLabelOverlay1 = new ElementOverlay({
				element : that.oLabel1,
				designTimeMetadata : {}
			});
			that.oLabelOverlay1.placeInOverlayContainer();
			that.oLabelOverlay2 = new ElementOverlay({
				element : that.oLabel2,
				designTimeMetadata : {}
			});
			that.oLabelOverlay2.placeInOverlayContainer();
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oVerticalLayout.destroy();
		}
	});

	QUnit.test("when the layout is switched to invisible and the back to visible...", function(assert) {
		var that = this;
		var done = assert.async();

		this.oVerticalLayout.setVisible(false);
		sap.ui.getCore().applyChanges();
		this.oVerticalLayout.setVisible(true);
		sap.ui.getCore().applyChanges();

		// timeout is needed to handle applyStyles
		setTimeout(function() {
			// Math.ceil is needed for IE11
			assert.deepEqual(Math.ceil(that.oLayoutOverlay.$().offset().top), Math.ceil(that.oVerticalLayout.$().offset().top), "top position of the Layout overlay is correct");
			assert.deepEqual(Math.ceil(that.oLayoutOverlay.$().offset().left), Math.ceil(that.oVerticalLayout.$().offset().left), "left position of the Layout overlay is correct");
			assert.deepEqual(Math.ceil(that.oLabelOverlay1.$().offset().top), Math.ceil(that.oLabel1.$().offset().top), "top position of the Label overlay is correct");
			assert.deepEqual(Math.ceil(that.oLabelOverlay1.$().offset().left), Math.ceil(that.oLabel1.$().offset().left), "left position of the Label overlay is correct");

			done();
		}, 0);
	});

	QUnit.module("Given that an Overlay is created for a layout with child controls", {
		beforeEach : function() {
			this.oButton1 = new Button({
				text : "Button 1"
			});
			this.oVerticalLayout1 = new VerticalLayout({
					content : [this.oButton1]
			});
			this.oVerticalLayout2 = new VerticalLayout();
			this.oVerticalLayout1.placeAt("content");
			this.oVerticalLayout2.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oOverlayButton1 = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oButton1
			});
			this.oOverlayButton1.placeInOverlayContainer();

			this.oOverlayLayout1 = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oVerticalLayout1
			});
			this.oOverlayLayout1.placeInOverlayContainer();

			this.oOverlayLayout2 = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oVerticalLayout2
			});
			this.oOverlayLayout2.placeInOverlayContainer();

		},
		afterEach : function() {

			this.oButton1.destroy();
			this.oVerticalLayout1.destroy();
			this.oVerticalLayout2.destroy();
			this.oOverlayLayout1.destroy();
			this.oOverlayLayout2.destroy();
			this.oOverlayButton1.destroy();

		}
	});

	QUnit.test("when the layout is rendered", function(assert) {
		assert.ok(this.oOverlayButton1.getParent().getParent() === this.oOverlayLayout1, "then a button's overlay should be inside of an layout's overlay");
	});

	QUnit.test("when a control is moved from one layout to another", function(assert) {
		this.oVerticalLayout2.addContent(this.oButton1);
		sap.ui.getCore().applyChanges();
		// first parent is aggregation overlay, second parent is overlay control
		assert.ok(this.oOverlayButton1.getParent().getParent() === this.oOverlayLayout2, "then a button's overlay should be inside of an another layout's overlay");
	});

	QUnit.module("Given that an Overlay is created for a control with custom design time metadata", {
		beforeEach : function() {
			this.oButton = new Button({
				text : "Button"
			});
			this.oOverlay = new ElementOverlay({
				element : this.oButton,
				designTimeMetadata : new ElementDesignTimeMetadata({
					data : {
						name : "My Custom Metadata"
					}
				})
			});
			this.oOverlay.placeInOverlayContainer();
			this.oButton.placeAt("content");
			// Render Controls
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oButton.destroy();
			this.oOverlay.destroy();
		}
	});

	QUnit.test("when the design time metadata is retrieved", function(assert) {
		var oDesignTimeMetadata = this.oOverlay.getDesignTimeMetadata();
		assert.equal(oDesignTimeMetadata.getData().name, "My Custom Metadata", "then the right custom data is set");
	});

	QUnit.module("Given that an Overlay is created for a control marked as ignored in the designtime Metadata", {
		beforeEach : function() {
			this.oButton = new Button({
				text : "Button"
			});

			this.oOverlay = new ElementOverlay({
				element : this.oButton,
				designTimeMetadata : new ElementDesignTimeMetadata({
					data : {
						ignore : true
					}
				})
			});
			this.oOverlay.placeInOverlayContainer();
			this.oButton.placeAt("content");
			// Render Controls
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oButton.destroy();
			this.oOverlay.destroy();
		}
	});

	QUnit.test("then...", function(assert) {
		assert.strictEqual(this.oOverlay.isVisible(), false, "the overlay is marked as invisible");
		assert.strictEqual(this.oOverlay.$().is(":visible"), false, "the overlay is hidden in DOM");
	});

	QUnit.module("Given that an Overlay is created for a control with an aggregation", {
		beforeEach : function() {
			this.oPage = new Page();
			this.oDTMetadata = new ElementDesignTimeMetadata({
				data : {
					aggregations: {
						content: {
							domRef : ":sap-domref > section"
						}
					}
				}
			});

		},
		afterEach : function() {
			this.oPage.destroy();
			this.oOverlay.destroy();
		}
	});

	QUnit.test("when ignore for the aggregation is not defined, then...", function(assert) {
		this.oOverlay = new ElementOverlay({
			designTimeMetadata : this.oDTMetadata
		});
		this.oOverlay.placeInOverlayContainer();
		this.oOverlay.setElement(this.oPage);
		this.oPage.placeAt("content");
		// Render Controls
		sap.ui.getCore().applyChanges();

		var oAggregationOverlay = this.oOverlay.getAggregationOverlay("content");
		assert.ok(oAggregationOverlay, "the aggregation overlay is created");
		assert.strictEqual(oAggregationOverlay.$().is(":visible"), true, "the aggregation overlay is visible in DOM");
	});

	QUnit.test("when ignore for the aggregation is boolean and equal true, then...", function(assert) {
		this.oDTMetadata.getData().aggregations.content.ignore = true;
		this.oOverlay = new ElementOverlay({
			designTimeMetadata : this.oDTMetadata
		});
		this.oOverlay.placeInOverlayContainer();
		this.oOverlay.setElement(this.oPage);
		this.oPage.placeAt("content");
		// Render Controls
		sap.ui.getCore().applyChanges();

		var oAggregationOverlay = this.oOverlay.getAggregationOverlay("content");
		assert.notOk(oAggregationOverlay, "the aggregation overlay is not created");
	});

	QUnit.test("when ignore for the aggregation is boolean and equal false, then...", function(assert) {
		this.oDTMetadata.getData().aggregations.content.ignore = false;
		this.oOverlay = new ElementOverlay({
			designTimeMetadata : this.oDTMetadata
		});
		this.oOverlay.placeInOverlayContainer();
		this.oOverlay.setElement(this.oPage);
		this.oPage.placeAt("content");
		// Render Controls
		sap.ui.getCore().applyChanges();

		var oAggregationOverlay = this.oOverlay.getAggregationOverlay("content");
		assert.ok(oAggregationOverlay, "the aggregation overlay is created");
		assert.strictEqual(oAggregationOverlay.$().is(":visible"), true, "the aggregation overlay is visible in DOM");
	});

	QUnit.test("when ignore for the aggregation is a function and the function returns true, then...", function(assert) {
		this.oDTMetadata.getData().aggregations.content.ignore = function(oElement) {
			return true;
		};
		this.oOverlay = new ElementOverlay({
			designTimeMetadata : this.oDTMetadata
		});
		this.oOverlay.placeInOverlayContainer();
		this.oOverlay.setElement(this.oPage);
		this.oPage.placeAt("content");
		// Render Controls
		sap.ui.getCore().applyChanges();

		var oAggregationOverlay = this.oOverlay.getAggregationOverlay("content");
		assert.notOk(oAggregationOverlay, "the aggregation overlay is not created");
	});

	QUnit.module("Given that an Overlay is created for a control with an aggregation containing a control", {
		beforeEach : function() {
			this.oText = new Text();
			this.oPage = new Page({
				content : [this.oText]
			});
			this.oDTMetadata = new ElementDesignTimeMetadata({
				data : {
					aggregations: {
						content: {
							domRef : ":sap-domref > section"
						}
					}
				}
			});

		},
		afterEach : function() {
			this.oPage.destroy();
			this.oOverlay.destroy();
		}
	});

	QUnit.test("when ignore is a function which returns true when a Text is in the content, then...", function(assert) {
		this.oDTMetadata.getData().aggregations.content.ignore = function(oElement) {
			if (oElement.getContent()[0].getMetadata().getName() === "sap.m.Text") {
				return true;
			} else {
				return false;
			}
		};
		this.oOverlay = new ElementOverlay({
			designTimeMetadata : this.oDTMetadata
		});
		this.oOverlay.placeInOverlayContainer();
		this.oOverlay.setElement(this.oPage);
		this.oPage.placeAt("content");
		// Render Controls
		sap.ui.getCore().applyChanges();

		var oAggregationOverlay = this.oOverlay.getAggregationOverlay("content");
		assert.notOk(oAggregationOverlay, "the aggregation overlay is not created");
	});

	QUnit.module("Given that an Overlay is created for a control with copyDom:true in the designtime Metadata", {
		beforeEach : function() {
			this.oButton = new Button({
				text : "Button"
			});
			this.oButton.placeAt("content");

			this.oOverlay = new ElementOverlay({
				element : this.oButton,
				designTimeMetadata : new ElementDesignTimeMetadata({
					data: {
						cloneDomRef : true
					}
				})
			});
			this.oOverlay.placeInOverlayContainer();
			// Render Controls
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oButton.destroy();
			this.oOverlay.destroy();
		}
	});

	QUnit.test("when the overlay is rendered", function(assert) {
		assert.strictEqual(this.oOverlay.$().find(".sapUiDtClonedDom").length, 1, "then a cloned DOM node is found in the overlay");
	});


	QUnit.module("Given that an Overlay is created for a control with copyDom:'css-selector' in the designtime Metadata", {
		beforeEach : function() {
			this.oButton = new Button({
				text : "Button"
			});
			this.oOverlay = new ElementOverlay({
				element : this.oButton,
				designTimeMetadata : new ElementDesignTimeMetadata({
					data: {
						cloneDomRef : ":sap-domref"
					}
				})
			});
			this.oOverlay.placeInOverlayContainer();
			this.oButton.placeAt("content");
			// Render Controls
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oButton.destroy();
			this.oOverlay.destroy();
		}
	});

	QUnit.test("when the overlay is rendered", function(assert) {
		assert.strictEqual(this.oOverlay.$().find(".sapUiDtClonedDom").length, 1, "then a cloned DOM node is found in the overlay");
	});

	QUnit.module("Given that an Overlay is created for a control", {
		beforeEach : function() {
			this.oButton = new Button({
				text : "Button"
			});
			this.oOverlay = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oButton
			});
			this.oOverlay.placeInOverlayContainer();
			this.oButton.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oButton.destroy();
		}
	});

	QUnit.test("when the overlay is destroyed", function(assert) {
		var sId = this.oOverlay.getId();
		this.oOverlay.destroy();
		assert.strictEqual(OverlayRegistry.getOverlay(sId), undefined, "then OverlayRegistry.getOverlay should returns undefined for it's id");
		var $container = jQuery("#overlay-container");
		assert.strictEqual($container.length, 0, "overlay container is also destroyed with a last overlay");
	});

	QUnit.module("Given that an Overlay is created for a control", {
		beforeEach : function() {
			this.oButton = new Button({
				text : "Button"
			});
			this.oOverlay = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oButton
			});
			this.oOverlay.placeInOverlayContainer();
			this.oButton.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
		}
	});

	QUnit.test("when the control is destroyed before the overlay", function(assert) {
		var sId = this.oButton.getId();
		this.oButton.destroy();
		this.oOverlay.destroy();
		assert.strictEqual(OverlayRegistry.getOverlay(sId), undefined, "then OverlayRegistry.getOverlay should returns undefined for it's id");
	});

	QUnit.module("Given that an Overlay is created for two layouts with two child controls", {
		beforeEach : function() {
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

			this.oVerticalLayout1.placeAt("content");
			this.oVerticalLayout2.placeAt("content");

			sap.ui.getCore().applyChanges();


			this.oOverlayLayout1 = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oVerticalLayout1
			});
			this.oOverlayLayout1.placeInOverlayContainer();

			this.oOverlayLayout2 = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oVerticalLayout2
			});
			this.oOverlayLayout2.placeInOverlayContainer();

			this.oOverlayButton1 = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oButton1
			});
			this.oOverlayButton1.placeInOverlayContainer();

			this.oOverlayButton2 = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oButton2
			});
			this.oOverlayButton2.placeInOverlayContainer();

			this.oOverlayButton3 = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oButton3
			});
			this.oOverlayButton3.placeInOverlayContainer();

			this.oOverlayButton4 = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oButton4
			});
			this.oOverlayButton4.placeInOverlayContainer();

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {

			this.oButton1.destroy();
			this.oButton2.destroy();
			this.oButton3.destroy();
			this.oButton4.destroy();
			this.oVerticalLayout1.destroy();
			this.oVerticalLayout2.destroy();
			this.oOverlayLayout1.destroy();
			this.oOverlayLayout2.destroy();
			this.oOverlayButton1.destroy();
			this.oOverlayButton2.destroy();
			this.oOverlayButton3.destroy();
			this.oOverlayButton4.destroy();

		}
	});

	QUnit.test("when a control is moved to another layout", function(assert) {
		var done = assert.async();
		ElementUtil.insertAggregation(this.oVerticalLayout2, "content", this.oButton2, 1);
		sap.ui.getCore().applyChanges();

		var animationFrame = window.requestAnimationFrame(function() {
			var oDomRefButton1 = this.oOverlayButton1.getDomRef();
			var oDomRefButton2 = this.oOverlayButton2.getDomRef();
			var oDomRefButton3 = this.oOverlayButton3.getDomRef();
			var oDomRefButton4 = this.oOverlayButton4.getDomRef();

			assert.strictEqual(oDomRefButton3, oDomRefButton2.previousElementSibling, "then Overlay DOM elements in target layout are in correct order - button3 before button2");
			assert.strictEqual(oDomRefButton4, oDomRefButton2.nextElementSibling, "then Overlay DOM elements in target layout are in correct order - button4 after button2");
			assert.strictEqual(null, oDomRefButton1.nextElementSibling, "and source layout contains only one control");
			window.cancelAnimationFrame(animationFrame);
			done();
		}.bind(this));
	});

	QUnit.test("when DomRef of Overlay Layout contains extra elements and the control is prepended to this layout", function(assert) {
		var done = assert.async();
		this.oOverlayLayout2.$().prepend("<div></div>");
		ElementUtil.insertAggregation(this.oVerticalLayout2, "content", this.oButton2, 0);
		sap.ui.getCore().applyChanges();

		var animationFrame = window.requestAnimationFrame(function() {
			var oDomRefButton2 = this.oOverlayButton2.getDomRef();
			var oDomRefButton3 = this.oOverlayButton3.getDomRef();

			assert.strictEqual(oDomRefButton3, oDomRefButton2.nextElementSibling, "then Overlay DOM elements in target layout are in correct order");
			assert.strictEqual(null, oDomRefButton2.previousElementSibling, "and extra element is not taken into account");
			window.cancelAnimationFrame(animationFrame);
			done();
		}.bind(this));
	});

	QUnit.module("Given that an Overlay is created for a control in the content of a scrollable container", {
		beforeEach : function() {
			this.$container = jQuery("<div id='scroll-container' style='height: 400px; width: 200px; overflow-y: auto;'><div style='width: 100%; height: 100px;'></div><div id='scroll-content' style='height: 500px;'></div></div>");
			this.$container.appendTo("#content");

			this.oButton = new Button({
				text : "Button"
			});

			this.oOverlay = new ElementOverlay({
				designTimeMetadata : {},
				element : this.oButton
			});
			this.oOverlay.placeInOverlayContainer();

			this.oButton.placeAt("scroll-content");
			sap.ui.getCore().applyChanges();

		},
		afterEach : function() {
			this.$container.remove();
			this.oButton.destroy();
			this.oOverlay.destroy();
		}
	});

	QUnit.test("when the container is scrolled", function(assert) {
		var that = this;
		var done = assert.async();

		this.$container.scrollTop(50);
		setTimeout(function() {
			assert.deepEqual(that.oOverlay.$().offset(), that.oButton.$().offset(), "overlay has same position as a control");
			done();
		}, 0);
	});

	QUnit.done(function( details ) {
		jQuery("#content").hide();
	});

});