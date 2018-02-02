/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	// internal
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/plugin/DragDrop",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	// controls
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	// should be last
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
], function(
	ElementOverlay,
	DragDrop,
	ElementUtil,
	DesignTime,
	OverlayRegistry,
	VerticalLayout,
	Button,
	sinon
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	function testDragAndDropEventHandlerTriggering(sHandlerFunctionName, oOverlay, aDomDragEvents, assert, mFakeTouchEvents, oTargetOverlay){
		var done = assert.async();

		this.oDragDrop[sHandlerFunctionName] = function(oOverlayInHandler) {
			assert.ok(true, "handler was called");
			if (oTargetOverlay) {
				assert.equal(oTargetOverlay.getId(), oOverlayInHandler.getId(), "correct overlay passed to the handler");
			}  else {
				assert.equal(oOverlay.getId(), oOverlayInHandler.getId(), "correct overlay passed to the handler");
			}
			done();
		};

		if (aDomDragEvents.length) {
			for (var i = 0; i < aDomDragEvents.length; i++) {
				if (mFakeTouchEvents) {
					var oEventData = mFakeTouchEvents[aDomDragEvents[i]];
					var oEvent;
					if ( oEventData ) {
						oEvent = jQuery.Event(aDomDragEvents[i], oEventData);
						oOverlay.$().trigger(oEvent);
					}
				} else {
					oOverlay.$().trigger(aDomDragEvents[i]);
				}
			}
		}
	}

	QUnit.module("Given that an DragDrop is initialized ", {
		beforeEach : function(assert) {
			this.oButton = new Button();
			this.oLayout = new VerticalLayout({content : [this.oButton]});
			this.oLayout.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDragDrop = new DragDrop();
			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oDragDrop]
			});

			var done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButtonOverlay.setMovable(true);
				this.oAggregationOverlay = this.oButtonOverlay.getParentAggregationOverlay();
				this.oAggregationOverlay.setTargetZone(true);
				done();
			}.bind(this));

			this.mFakeTouchEvents = {
				touchstart: {
					touches: [{
						pageX:5,
						pageY:5
					}],
					originalEvent: {
						touches: [{
							pageX:5,
							pageY:5
						}]
					}
				},
				touchmove: {
					touches: [{
						pageX:10,
						pageY:10
					}],
					originalEvent: {
						touches: [{
							pageX:10,
							pageY:10
						}]
					}
				},
				touchend: {
					touches: [{
						pageX:10,
						pageY:10
					}],
					originalEvent: {
						touches: [{
							pageX:10,
							pageY:10
						}],
						changedTouches: [{
							pageX: 10,
							pageY: 10
						}]
					},
					changedTouches: [{
						pageX:10,
						pageY:10
					}]
				}
			};
		},
		afterEach : function() {
			this.oButtonOverlay.destroy();
			this.oLayoutOverlay.destroy();
			this.oLayout.destroy();
			this.oDragDrop.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when the touchstart is triggered on an overlay and touchmove is being listened", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onDragStart", this.oButtonOverlay, ["touchstart", "touchmove"], assert, this.mFakeTouchEvents);
	});

	QUnit.test("when the touchmove is triggered on an overlay and dragenter is triggered on an element overlay", function(assert) {
		var fnElementFromPointStub = sandbox.stub(document, 'elementFromPoint');

		var fakeIdStub = {
		  id: this.oButtonOverlay.getId()
		};

		fnElementFromPointStub.returns(fakeIdStub);

		testDragAndDropEventHandlerTriggering.call(this, "onDragEnter", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents);

		sandbox.restore();
	});

	QUnit.test("when the touchmove is triggered on an overlay and dragover is triggered on an element overlay", function(assert) {
		var fnElementFromPointStub = sandbox.stub(document, 'elementFromPoint');

		var fakeIdStub = {
		  id: this.oButtonOverlay.getId()
		};

		fnElementFromPointStub.returns(fakeIdStub);
		testDragAndDropEventHandlerTriggering.call(this, "onDragOver", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents);

		sandbox.restore();
	});

	QUnit.test("when the touchmove is triggered on an overlay and drag is triggered", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onDrag", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents);
	});

	QUnit.test("when the touchmove is triggered on an overlay and aggregationdragenter is triggered on an aggregation overlay", function(assert) {
		var fnElementFromPointStub = sandbox.stub(document, 'elementFromPoint');

		var fakeIdStub = {
		  id: this.oAggregationOverlay.getId()
		};

		fnElementFromPointStub.returns(fakeIdStub);
		testDragAndDropEventHandlerTriggering.call(this, "onAggregationDragEnter", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents, this.oAggregationOverlay);

		sandbox.restore();
	});

	QUnit.test("when the touchmove is triggered on an overlay and aggregationdragover is triggered on an aggregation overlay", function(assert) {
		var fnElementFromPointStub = sandbox.stub(document, 'elementFromPoint');

		var fakeIdStub = {
		  id: this.oAggregationOverlay.getId()
		};

		fnElementFromPointStub.returns(fakeIdStub);
		testDragAndDropEventHandlerTriggering.call(this, "onAggregationDragOver", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents, this.oAggregationOverlay);

		sandbox.restore();
	});

	QUnit.test("when the touchend is triggered on an overlay and aggregationdrop is triggered on an aggregation overlay", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onAggregationDrop", this.oButtonOverlay, ["touchstart", "touchmove", "touchend"], assert, this.mFakeTouchEvents, this.oAggregationOverlay);
	});

	QUnit.test("when the touchend is triggered on an overlay and dragend is triggered on an element overlay", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onDragEnd", this.oButtonOverlay, ["touchstart", "touchmove", "touchend"], assert, this.mFakeTouchEvents);
	});

	QUnit.test("when the dragstart triggered on overlay", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onDragStart", this.oButtonOverlay, ["dragstart"], assert);
	});

	QUnit.test("when the dragend triggered on overlay", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onDragEnd", this.oButtonOverlay, ["dragend"], assert);
	});

	QUnit.test("when the drag triggered on overlay", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onDrag", this.oButtonOverlay, ["drag"], assert);
	});

	QUnit.test("when the dragenter triggered on overlay in droppable aggregation", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onDragEnter", this.oButtonOverlay, ["dragenter"], assert);
	});

	QUnit.test("when the dragover triggered on overlay in droppable aggregation", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onDragOver", this.oButtonOverlay, ["dragover"], assert);
	});

	QUnit.test("when the dragleave triggered on overlay in droppable aggregation", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onDragLeave", this.oButtonOverlay, ["dragleave"], assert);
	});

	QUnit.test("when the dragenter triggered on aggregation overlay", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onAggregationDragEnter", this.oAggregationOverlay, ["dragenter"], assert);
	});

	QUnit.test("when the dragover triggered on aggregation overlay", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onAggregationDragOver", this.oAggregationOverlay, ["dragover"], assert);
	});

	QUnit.test("when the dragleave triggered on aggregation overlay", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onAggregationDragLeave", this.oAggregationOverlay, ["dragleave"], assert);
	});

	QUnit.test("when the drop triggered on aggregation overlay", function(assert) {
		testDragAndDropEventHandlerTriggering.call(this, "onAggregationDrop", this.oAggregationOverlay, ["drop"], assert);
	});

	QUnit.module("Given that an DragDrop touchevents are initialized ", {
		beforeEach : function(assert) {
			this.oButton = new Button();
			this.oLayout1 = new VerticalLayout({content : [this.oButton]});
			this.oLayout2 = new VerticalLayout({content : [this.oLayout1]});
			this.oLayout2.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDragDrop = new DragDrop();
			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout2],
				plugins : [this.oDragDrop]
			});

			var done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayout1Overlay = OverlayRegistry.getOverlay(this.oLayout1);
				this.oLayout2Overlay = OverlayRegistry.getOverlay(this.oLayout2);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButtonOverlay.setMovable(true);
				this.oAggregationOverlay = this.oLayout1Overlay.getParentAggregationOverlay();
				this.oAggregationOverlay.setTargetZone(true);
				done();
			}.bind(this));

			// this.oLayout1Overlay = new ElementOverlay({element : this.oLayout1, designTimeMetadata : {}});

			// this.oLayout2Overlay = new ElementOverlay({element : this.oLayout2, designTimeMetadata : {}});
			// this.oLayout2Overlay.placeInOverlayContainer();
			// this.oAggregationOverlay = this.oLayout2Overlay.getAggregationOverlay("content");
			// this.oButtonOverlay = new ElementOverlay({element : this.oButton, designTimeMetadata : {}});
			// this.oButtonOverlay.setMovable(true);

			// sap.ui.getCore().applyChanges();
			// this.oDragDrop = new DragDrop();
			// this.oDragDrop.registerElementOverlay(this.oButtonOverlay);
			// this.oDragDrop.registerElementOverlay(this.oLayout1Overlay);
			// this.oDragDrop.registerAggregationOverlay(this.oAggregationOverlay);
			// this.oAggregationOverlay.setTargetZone(true);

			this.mFakeTouchEvents = {
				touchstart: {
					touches: [{
						pageX:5,
						pageY:5
					}],
					originalEvent: {
						touches: [{
							pageX:5,
							pageY:5
						}]
					}
				},
				touchmove: {
					touches: [{
						pageX:10,
						pageY:10
					}],
					originalEvent: {
						touches: [{
							pageX:10,
							pageY:10
						}]
					}
				}
			};
		},
		afterEach : function() {
			this.oButtonOverlay.destroy();
			this.oLayout1Overlay.destroy();
			this.oLayout2Overlay.destroy();
			this.oLayout2.destroy();
			this.oDragDrop.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when the touchmove is triggered on an overlay and dragenter is triggered on an element overlay (go to the parent) which is in the target zone", function(assert) {
		var fnElementFromPointStub = sandbox.stub(document, 'elementFromPoint');

		var fakeIdStub = {
		  id: this.oButtonOverlay.getId()
		};

		fnElementFromPointStub.returns(fakeIdStub);

		testDragAndDropEventHandlerTriggering.call(this, "onDragEnter", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents, this.oLayout1Overlay);

		sandbox.restore();
	});

	QUnit.test("when the touchmove is triggered on an overlay and dragover is triggered on an element overlay (go to the parent) which is in the target zone", function(assert) {
		var fnElementFromPointStub = sandbox.stub(document, 'elementFromPoint');

		var fakeIdStub = {
		  id: this.oButtonOverlay.getId()
		};

		fnElementFromPointStub.returns(fakeIdStub);

		testDragAndDropEventHandlerTriggering.call(this, "onDragOver", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents, this.oLayout1Overlay);

		sandbox.restore();
	});

	QUnit.test("when the touchmove is triggered on an overlay and aggregationdragenter is triggered on an aggregation overlay which has a target zone", function(assert) {
		var fnElementFromPointStub = sandbox.stub(document, 'elementFromPoint');

		var fakeIdStub = {
		  id: this.oAggregationOverlay.getId()
		};

		fnElementFromPointStub.returns(fakeIdStub);

		testDragAndDropEventHandlerTriggering.call(this, "onAggregationDragEnter", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents, this.oAggregationOverlay);

		sandbox.restore();
	});

	QUnit.test("when the touchmove is triggered on an overlay and aggregationdragover is triggered on an aggregation overlay which has a target zone", function(assert) {
		var fnElementFromPointStub = sandbox.stub(document, 'elementFromPoint');

		var fakeIdStub = {
		  id: this.oAggregationOverlay.getId()
		};

		fnElementFromPointStub.returns(fakeIdStub);

		testDragAndDropEventHandlerTriggering.call(this, "onAggregationDragOver", this.oButtonOverlay, ["touchstart", "touchmove", "touchmove"], assert, this.mFakeTouchEvents, this.oAggregationOverlay);

		sandbox.restore();
	});

	if (!sap.ui.Device.browser.webkit) {

		/**
		 * scroll on drag
		 */
		QUnit.module("Given that overlay is created for a m.Page with Panels", {
			beforeEach : function(assert) {
				var that = this;
				var done = assert.async();
				this.aPanels = [];
				this.aPanelOverlays = [];
				for (var i = 0; i < 10; i++) {
					var oPanel = new sap.m.Panel();
					this.aPanels.push(oPanel);
					var oPanelOverlay =  new ElementOverlay({
						element : oPanel
					});
					this.aPanelOverlays.push(oPanelOverlay);
				}

				this.oPage = new sap.m.Page({
					content: this.aPanels
				}).placeAt("content");

				this.oPage.getMetadata().loadDesignTime().then(function(oDesignTimeMetadata) {
					that.oPageOverlay = new ElementOverlay({
						element : that.oPage,
						designTimeMetadata : { data : oDesignTimeMetadata },
						lazyRendering : false
					});
					sap.ui.getCore().applyChanges();
					that.oDragDrop = new DragDrop();
					var oPageContentOverlay = that.oPageOverlay.getAggregationOverlay("content");
					that.oDragDrop.registerAggregationOverlay(oPageContentOverlay);
					done();
				});
			},
			afterEach : function() {
				this.oPage.destroy();
				this.oPageOverlay.destroy();
				for (var i = 0; i < 10; i++) {
					this.aPanels[i].destroy();
					this.aPanelOverlays[i].destroy();
				}
				this.oDragDrop.destroy();
			}
		});

		// FIXME: in FireFox
		// QUnit.test("when a dragover event happens in a an overlay with a scrollbar near the edge...", function(assert) {
		// 	var done = assert.async();
		// 	var oPageContentOverlay = this.oPageOverlay.getAggregationOverlay("content");
		// 	var $PageContentOverlay = oPageContentOverlay.$();
		// 	var $PageContent = jQuery(oPageContentOverlay.getGeometry().domRef);
		// 	var oEvent;
		//
		// 	var oOffset = $PageContentOverlay.offset();
		//
		// 	var iX = oOffset.left + 10;
		// 	var iY = oOffset.top + $PageContentOverlay.height() - 10;
		//
		// 	if (document.createEvent) {
		// 		oEvent = document.createEvent("MouseEvent");
		// 		oEvent.initMouseEvent("dragover", true, true, window, 0,
		// 			iX, iY,
		// 			iX, iY, false, false, false, false, 0, null);
		// 	} else {
		// 		oEvent = new MouseEvent('dragover', {
		// 		   'view' : window,
		// 		   'bubbles' : true,
		// 		   'cancelable': true,
		// 		   clientX : iX,
		// 		   clientY : iY
		// 		});
		// 	}
		//
		// 	$PageContentOverlay.get(0).dispatchEvent(oEvent);
		//
		// 	$PageContent.one("scroll", function() {
		// 		assert.notStrictEqual($PageContent.scrollTop(), 0, "page content is scrolled after drag event");
		// 		done();
		// 	});
		//
		// });
	}
});


