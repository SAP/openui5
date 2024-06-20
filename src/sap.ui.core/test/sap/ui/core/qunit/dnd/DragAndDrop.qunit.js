/*global QUnit,sinon*/
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/dnd/DragAndDrop",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/ui/core/UIArea",
	"sap/ui/Device",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils"
], function(Localization, DragAndDrop, DragInfo, DropInfo, DragDropInfo, jQuery, Control, UIArea, Device, nextUIUpdate, qutils) {
	"use strict";

	var DivControl = Control.extend("sap.ui.core.dnd.test.DivControl", {
		metadata: {
			properties: {
				elementTag: {type: "string", defaultValue: "div"},
				renderSomething: {type: "function"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(rm, oControl) {
				var sElementTag = oControl.getElementTag(),
					bIsVoid = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(sElementTag);

				rm.openStart("div").openEnd();
					if ( bIsVoid ) {
						rm.voidStart(sElementTag, oControl);
					} else {
						rm.openStart(sElementTag, oControl);
					}
					rm.attr("tabindex", 0);
					rm.style("width", "100px");
					rm.style("height", "50px");
					if ( bIsVoid ) {
						rm.voidEnd();
					} else {
						rm.openEnd();
						rm.close(sElementTag);
					}
					if (oControl.getRenderSomething()) {
						oControl.getRenderSomething()(rm);
					}
				rm.close("div");
			}
		},
		getDragGhost: function() {
			return this.getDomRef().cloneNode(true);
		}
	});

	var DragAndDropControl = Control.extend("sap.ui.core.dnd.test.DragAndDropControl", {
		metadata: {
			dnd: true,
			properties : {
				showNoData : {type : "boolean", defaultValue : false}
			},
			aggregations: {
				topItems: {
					name: "topItems",
					type: "sap.ui.core.dnd.test.DivControl",
					multiple: true,
					singularName: "topItem",
					selector : "#{id}-topItems",
					dnd: true
				},
				bottomItems: {
					name: "bottomItems",
					type: "sap.ui.core.dnd.test.DivControl",
					multiple: true,
					singularName: "bottomItem",
					selector : "#{id}-bottomItems",
					dnd: true
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(rm, oControl) {

				var aTopItems = oControl.getTopItems();
				var aBottomItems = oControl.getBottomItems();
				var i;

				rm.openStart("div", oControl).attr("tabindex", 0).openEnd();
					rm.openStart("div", oControl.getId() + "-topItems").openEnd();
					if (!aTopItems.length) {
						rm.openStart("div", oControl.getId() + "-topNoData")
							.openEnd()
							.text("No top items")
							.close("div");
					} else {
						for (i = 0; i < aTopItems.length; i++) {
							rm.renderControl(aTopItems[i]);
						}
					}
					rm.close("div");

					rm.openStart("div", oControl.getId() + "-bottomItems").openEnd();
					if (!aBottomItems.length) {
						rm.openStart("div", oControl.getId() + "-bottomNoData")
							.openEnd()
							.text("No bottom items")
							.close("div");
					} else {
						for (i = 0; i < aBottomItems.length; i++) {
							rm.renderControl(aBottomItems[i]);
						}
					}
					rm.close("div");

				rm.close("div");
			}
		}
	});

	function createjQueryDragEventDummy(sEventType, oControl, bRemoveId, bRemoveDraggable) {
		var oEvent = jQuery.Event(sEventType);
		var oTarget = oControl.getDomRef();

		oEvent.target = oTarget;
		if (bRemoveId === true) {
			delete oTarget.dataset.sapUi;
			oTarget.removeAttribute("id");
		}
		if (bRemoveDraggable === true) {
			oTarget.draggable = false;
		}
		oEvent.originalEvent = createNativeDragEventDummy(sEventType);

		return oEvent;
	}

	function createNativeDragEventDummy(sEventType) {

		var oEvent = new Event(sEventType, {
			bubbles: true,
			cancelable: true
		});

		oEvent.dataTransfer = new window.DataTransfer();
		return oEvent;
	}

	QUnit.module("DragSession", {
		beforeEach: function() {
			this.oControl = new DragAndDropControl({
				dragDropConfig: [
					new DragDropInfo({
						targetElement: "dummy"
					})
				]
			});
			this.oControl.addStyleClass("sapUiScrollDelegate").placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});

	QUnit.test("Non draggable elements", function(assert) {
		var oEvent = createjQueryDragEventDummy("dragstart", this.oControl, false, true);

		DragAndDrop.preprocessEvent(oEvent);
		assert.equal(oEvent.dragSession, null, "No drag session was created for a non draggable element");
	});

	QUnit.test("Text input elements", async function(assert) {
		var oEvent;

		this.oControl.addTopItem(new DivControl({elementTag: "input"}));
		this.oControl.addTopItem(new DivControl({elementTag: "textarea"}));
		this.oControl.addDragDropConfig(new DragDropInfo({sourceAggregation: "topItems"}));
		await nextUIUpdate();

		oEvent = createjQueryDragEventDummy("dragstart", this.oControl.getTopItems()[0]);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);
		assert.equal(oEvent.dragSession, null, "No drag session was created for an input element");
		assert.ok(oEvent.isDefaultPrevented(), "Drag is not started for the input element");

		oEvent = createjQueryDragEventDummy("dragstart", this.oControl.getTopItems()[1]);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);
		assert.equal(oEvent.dragSession, null, "No drag session was created for a textarea element");
	});

	QUnit.test("Text input elements - Workaround for a bug in Firefox", async function(assert) {
		var oBrowserStub = sinon.stub(Device, "browser");
		var that = this;
		var sBrowser = "firefox";

		oBrowserStub.value({firefox: true});
		that.oControl.destroyTopItems();
		that.oControl.addTopItem(new DivControl({elementTag: "input"}));
		that.oControl.addTopItem(new DivControl({elementTag: "textarea"}));
		that.oControl.addDragDropConfig(new DragDropInfo());
		await nextUIUpdate();

		assert.ok(that.oControl.getDomRef().draggable, sBrowser + " - Ancestor is draggable before mousedown");

		["input", "textarea"].forEach(function(sSelectableElementTagName) {
			that.oControl.$().find(sSelectableElementTagName).trigger("mousedown");
			assert.notOk(that.oControl.getDomRef().draggable, sBrowser + " - Ancestor is not draggable after mousedown to allow text selection");

			that.oControl.$().find(sSelectableElementTagName).trigger("mouseup");
			assert.ok(that.oControl.getDomRef().draggable, sBrowser + " - Ancestor is draggable again after mouseup to allow drag and drop again");
		});

		oBrowserStub.restore();
	});

	QUnit.test("Draggable elements without control id", function(assert) {
		var oEvent = createjQueryDragEventDummy("dragstart", this.oControl, true);

		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);
		assert.equal(oEvent.dragSession, null, "No drag session was created for an element without relation to a UI5 control");
	});

	QUnit.test("Lifecycle", function(assert) {
		var oEvent;
		var oDragSession;

		oEvent = createjQueryDragEventDummy("dragstart", this.oControl);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);
		assert.notEqual(oEvent.dragSession, null,
			"dragstart: A drag session was created for an element with a data-sap-ui control id");

		oDragSession = oEvent.dragSession;
		oEvent = createjQueryDragEventDummy("dragenter", this.oControl, false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession === oDragSession, "dragenter: Drag session was preserved");

		oEvent = createjQueryDragEventDummy("dragover", this.oControl, false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession === oDragSession, "dragover: Drag session was preserved");

		oEvent = createjQueryDragEventDummy("dragleave", this.oControl, false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession === oDragSession, "dragleave: Drag session was preserved");

		oEvent = createjQueryDragEventDummy("drop", this.oControl, false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession === oDragSession, "drop: Drag session was preserved");
		assert.notOk(oEvent.isDefaultPrevented(), "drop: Default is not prevented since there is no valid drop info");

		DragAndDrop.postprocessEvent(oEvent); // Postprocessing "drop" should not destroy the drag session.
		oEvent = createjQueryDragEventDummy("dragenter", this.oControl, false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession != null, "Drag session is not destroyed on drop");

		oEvent = createjQueryDragEventDummy("dragstart", this.oControl);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession != null, "dragstart: A new drag session was created");

		DragAndDrop.postprocessEvent(oEvent);
		assert.ok(jQuery("html").hasClass("sapUiDnDNoScrolling"), "scrolling of the html element is blocked");

		oEvent = createjQueryDragEventDummy("dragstart", this.oControl, true);
		oEvent.target.dataset.sapUiRelated = this.oControl.getId();
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession != null && oEvent.dragSession != oDragSession,
			"dragstart: A new drag session was created for an element with a data-sap-ui-related control id");

		oDragSession = oEvent.dragSession;
		DragAndDrop.postprocessEvent(oEvent); // Postprocessing "dragstart" registers a global "dragend" event handler

		oEvent = createjQueryDragEventDummy("dragend", this.oControl, false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession === oDragSession, "dragend: Drag session was preserved");

		DragAndDrop.postprocessEvent(oEvent);
		assert.notOk(jQuery("html").hasClass("sapUiDnDNoScrolling"), "scrolling of the html element is retained");

		DragAndDrop.postprocessEvent(oEvent); // Postprocessing "dragend" event. Drag session should be destroyed.
		oEvent = createjQueryDragEventDummy("dragenter", this.oControl, false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession == null, "Drag session was destroyed");
	});

	QUnit.module("Events", {
		beforeEach: function() {
			this.oControl = new DragAndDropControl({
				topItems: [
					new DivControl(),
					new DivControl()
				],
				dragDropConfig: [
					new DragDropInfo({
						targetElement: "dummy"
					})
				]
			});
			this.oControl.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});

	QUnit.test("Preprocessor", function(assert) {
		assert.ok(UIArea.getEventPreprocessors().indexOf(DragAndDrop.preprocessEvent) >= 0, "The UIArea contains the added preprocessor");
	});

	QUnit.test("Postprocessor", function(assert) {
		assert.ok(UIArea.getEventPostprocessors().indexOf(DragAndDrop.postprocessEvent) >= 0, "The UIArea contains the added postprocessor");
	});

	QUnit.test("Processing sequence", function(assert) {
		var aEventSequence = [];
		var oEventTarget = this.oControl.getDomRef();
		var i;

		oEventTarget.focus();

		this.oControl.ondragstart = function(oEvent) {aEventSequence.push({processor: "control", eventType: "dragstart"});};
		this.oControl.ondragenter = function(oEvent) {aEventSequence.push({processor: "control", eventType: "dragenter"});};
		this.oControl.ondragover = function(oEvent) {aEventSequence.push({processor: "control", eventType: "dragover"});};
		this.oControl.ondragleave = function(oEvent) {aEventSequence.push({processor: "control", eventType: "dragleave"});};
		this.oControl.ondragend = function(oEvent) {aEventSequence.push({processor: "control", eventType: "dragend"});};
		this.oControl.ondrop = function(oEvent) {aEventSequence.push({processor: "control", eventType: "drop"});};

		var fnOriginalDragAndDropEventPreprocessor;
		var fnOriginalDragAndDropEventPostprocessor;
		var aEventPreprocessors = UIArea.getEventPreprocessors();
		var aEventPostprocessors = UIArea.getEventPostprocessors();

		var wrappedEventPreprocessor = function(oEvent) {
			aEventSequence.push({processor: "dnd-preprocessor", eventType: oEvent.type});
			fnOriginalDragAndDropEventPreprocessor.apply(this, arguments);
		};

		var wrappedEventPostprocessor = function(oEvent) {
			aEventSequence.push({processor: "dnd-postprocessor", eventType: oEvent.type});
			fnOriginalDragAndDropEventPostprocessor.apply(this, arguments);
		};

		for (i = 0; i < aEventPreprocessors.length; i++) {
			if (aEventPreprocessors[i] === DragAndDrop.preprocessEvent) {
				fnOriginalDragAndDropEventPreprocessor = aEventPreprocessors[i];
				aEventPreprocessors[i] = wrappedEventPreprocessor;
			}
		}

		for (i = 0; i < aEventPostprocessors.length; i++) {
			if (aEventPostprocessors[i] === DragAndDrop.postprocessEvent) {
				fnOriginalDragAndDropEventPostprocessor = aEventPostprocessors[i];
				aEventPostprocessors[i] = wrappedEventPostprocessor;
			}
		}

		assert.strictEqual(fnOriginalDragAndDropEventPreprocessor, DragAndDrop.preprocessEvent,
			"The drag-and-drop event preprocessor is contained in the UIArea preprocessors");
		assert.strictEqual(fnOriginalDragAndDropEventPreprocessor, DragAndDrop.preprocessEvent,
			"The drag-and-drop event postprocessor is contained in the UIArea postprocessors");

		oEventTarget.dispatchEvent(createNativeDragEventDummy("dragstart"));
		oEventTarget.dispatchEvent(createNativeDragEventDummy("dragenter"));
		oEventTarget.dispatchEvent(createNativeDragEventDummy("dragover"));
		oEventTarget.dispatchEvent(createNativeDragEventDummy("dragleave"));
		oEventTarget.dispatchEvent(createNativeDragEventDummy("drop"));
		oEventTarget.dispatchEvent(createNativeDragEventDummy("dragend"));

		assert.deepEqual(aEventSequence, [
			{processor: "dnd-preprocessor", eventType: "dragstart"},
			{processor: "control", eventType: "dragstart"},
			{processor: "dnd-postprocessor", eventType: "dragstart"},
			{processor: "dnd-preprocessor", eventType: "dragenter"},
			{processor: "control", eventType: "dragenter"},
			{processor: "dnd-postprocessor", eventType: "dragenter"},
			{processor: "dnd-preprocessor", eventType: "dragover"},
			{processor: "control", eventType: "dragover"},
			{processor: "dnd-postprocessor", eventType: "dragover"},
			{processor: "dnd-preprocessor", eventType: "dragleave"},
			{processor: "control", eventType: "dragleave"},
			{processor: "dnd-postprocessor", eventType: "dragleave"},
			{processor: "dnd-preprocessor", eventType: "drop"},
			{processor: "control", eventType: "drop"},
			{processor: "dnd-postprocessor", eventType: "drop"},
			{processor: "dnd-preprocessor", eventType: "dragend"},
			{processor: "control", eventType: "dragend"},
			{processor: "dnd-postprocessor", eventType: "dragend"}
		], "The drag-and-drop events have been processed before and after they where dispatched to the controls");

		// Restore original dnd event preprocessor.
		fnOriginalDragAndDropEventPreprocessor = DragAndDrop.preprocessEvent;
	});

	QUnit.test("Simulated longdragover", function(assert) {
		var oEventTarget;
		var oOnLongDragOverSpy = sinon.spy(function(oEvent) {
			oOnLongDragOverSpy._oEventTarget = oEvent.target;
		});
		var iLastLongDragoverCount = 0;
		var oEvent;
		var oDateNowStub = sinon.stub(Date, "now");

		function assertLongdragover(iMsSinceDragEnter) {
			var iCallCount = Math.floor(iMsSinceDragEnter / 1000);

			oEventTarget.focus();
			oEventTarget.dispatchEvent(createNativeDragEventDummy("dragover"));
			assert.strictEqual(oOnLongDragOverSpy.callCount, iCallCount,
				"Time since dragenter: " + iMsSinceDragEnter + "ms - longdragover count: " + iCallCount);

			if (iCallCount > 0 && iCallCount !== iLastLongDragoverCount) {
				assert.strictEqual(oOnLongDragOverSpy._oEventTarget, oEventTarget, "The longdragover event was dispatched at the correct target");
			}
			iLastLongDragoverCount = iCallCount;
		}

		this.oControl.onlongdragover = oOnLongDragOverSpy;
		oEvent = createjQueryDragEventDummy("dragstart", this.oControl);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent); // Create drag session.

		function setTime(iTimeInMs) {
			oDateNowStub.returns(iTimeInMs);
		}

		setTime(0);
		oEventTarget = this.oControl.getTopItems()[0].getDomRef();
		oEventTarget.dispatchEvent(createNativeDragEventDummy("dragenter"));
		assertLongdragover(0);
		setTime(999);
		assertLongdragover(999);
		setTime(1000);
		assertLongdragover(1000);
		setTime(1999);
		assertLongdragover(1999);
		setTime(2000);
		assertLongdragover(2000);
		oEventTarget = this.oControl.getTopItems()[1].getDomRef();
		setTime(2999);
		oEventTarget.dispatchEvent(createNativeDragEventDummy("dragenter"));
		oOnLongDragOverSpy.resetHistory();
		assertLongdragover(0);
		setTime(3000);
		assertLongdragover(1);
		setTime(3999);
		assertLongdragover(1000);
		oDateNowStub.restore();
	});

	QUnit.module("Between Indicator", {
		beforeEach: function() {
			this.oControl = new DragAndDropControl({
				topItems: [new DivControl(), new DivControl()],
				dragDropConfig: [
					new DragDropInfo({
						keyboardHandling: true,
						sourceAggregation: "topItems",
						targetAggregation: "topItems",
						dropPosition: "Between"
					})
				]
			});
			this.oControl.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});

	QUnit.test("Indicator position with dropLayout property", function(assert) {
		var oEvent, $Indicator, mIndicatorOffset, mTargetOffset;
		var oDiv1 = this.oControl.getTopItems()[0];
		var oDiv2 = this.oControl.getTopItems()[1];
		oDiv2.getDropAreaRect = function() {
			return this.getDomRef().getBoundingClientRect().toJSON();
		};
		var oGetDropAreaRectSpy = sinon.spy(oDiv2, "getDropAreaRect");

		// init drag session
		oEvent = createjQueryDragEventDummy("dragstart", oDiv1);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);

		// validation
		oEvent = createjQueryDragEventDummy("dragenter", oDiv2);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);

		// act for top indicator
		oEvent = createjQueryDragEventDummy("dragover", oDiv2);
		mTargetOffset = oDiv2.$().offset();
		oEvent.pageY = mTargetOffset.top + 1;
		oEvent.pageX = mTargetOffset.left + 1;
		oDiv2.$().trigger(oEvent);
		$Indicator = jQuery(oEvent.dragSession.getIndicator());
		mIndicatorOffset = $Indicator.offset();

		assert.ok(oGetDropAreaRectSpy.calledTwice, "getDropAreaRect is called once for calculation once for the visual drop indicator");
		assert.ok(oGetDropAreaRectSpy.calledOn(oDiv2), "getDropAreaRect is called on the Div2");
		assert.strictEqual($Indicator.attr("data-drop-position"), "Between", "Indicator's data-drop-position attribute is set to between");
		assert.strictEqual($Indicator.attr("data-drop-layout"), "Vertical", "Indicator's data-drop-layout attribute is set to vertical.");
		assert.strictEqual($Indicator.width(), oDiv2.$().width() , "Indicator's width is equal to dropped item's width.");
		assert.strictEqual(mIndicatorOffset.top, mTargetOffset.top , "Indicator's top position is equal to dropped item's top position.");
		assert.strictEqual(mIndicatorOffset.left, mTargetOffset.left , "Indicator's left position is equal to dropped item's left position.");

		// act for bottom indicator
		oEvent = createjQueryDragEventDummy("dragover", oDiv2);
		mTargetOffset = oDiv2.$().offset();
		oEvent.pageX = mTargetOffset.left + 10;
		oEvent.pageY = mTargetOffset.top + oDiv2.$().height() - 1;
		oDiv2.$().trigger(oEvent);
		$Indicator = jQuery(oEvent.dragSession.getIndicator());
		mIndicatorOffset = $Indicator.offset();

		assert.strictEqual($Indicator.attr("data-drop-layout"), "Vertical", "Indicator's data-drop-layout attribute is still vertical.");
		assert.strictEqual($Indicator.width(), oDiv2.$().width() , "Indicator's width is equal to dropped item's width.");
		assert.strictEqual(mIndicatorOffset.left, mTargetOffset.left , "Indicator's left position is equal to dropped item's left position.");
		assert.strictEqual(mIndicatorOffset.top, mTargetOffset.top + oDiv2.$().height(), "Indicator's bottom position is equal to dropped item's bottom position.");

		// change the drop layout
		this.oControl.getDragDropConfig()[0].setDropLayout("Horizontal");

		// act for bottom indicator
		oEvent = createjQueryDragEventDummy("dragover", oDiv2);
		mTargetOffset = oDiv2.$().offset();
		oEvent.pageY = mTargetOffset.top + 1;
		oEvent.pageX = mTargetOffset.left + 1;
		oDiv2.$().trigger(oEvent);
		$Indicator = jQuery(oEvent.dragSession.getIndicator());
		mIndicatorOffset = $Indicator.offset();

		assert.strictEqual($Indicator.attr("data-drop-layout"), "Horizontal", "Indicator's data-drop-layout attribute is set to Horizontal.");
		assert.strictEqual($Indicator.height(), oDiv2.$().height() , "Indicator's height is equal to dropped item's height.");
		assert.strictEqual(mIndicatorOffset.top, mTargetOffset.top , "Indicator's top position is equal to dropped item's top position.");
		assert.strictEqual(mIndicatorOffset.left, mTargetOffset.left , "Indicator's left position is equal to dropped item's bottom position.");

		// act for right indicator
		oEvent = createjQueryDragEventDummy("dragover", oDiv2);
		mTargetOffset = oDiv2.$().offset();
		oEvent.pageY = mTargetOffset.top + 1;
		oEvent.pageX = mTargetOffset.left + oDiv2.$().width() - 1;
		oDiv2.$().trigger(oEvent);
		$Indicator = jQuery(oEvent.dragSession.getIndicator());
		mIndicatorOffset = $Indicator.offset();

		assert.strictEqual($Indicator.attr("data-drop-layout"), "Horizontal", "Indicator's data-drop-layout attribute is still Horizontal.");
		assert.strictEqual($Indicator.height(), oDiv2.$().height(), "Indicator's height is equal to dropped item's height.");
		assert.strictEqual(mIndicatorOffset.top, mTargetOffset.top , "Indicator's top position is equal to dropped item's top position.");
		assert.strictEqual(mIndicatorOffset.left, mTargetOffset.left + oDiv2.$().width(), "Indicator's left position is equal to dropped item's right position.");
		assert.strictEqual(oEvent.dragSession.getDropPosition(), "After", "Drop position is set correctly");

		// act for the RTL mode
		const oLocalizationStub = sinon.stub(Localization, "getRTL").callsFake(function() {
			return true;
		});

		oDiv2.$().trigger(oEvent);
		assert.strictEqual(oEvent.dragSession.getDropPosition(), "Before", "Drop position is set correctly for the RTL mode");

		// drop
		oDiv2.$().trigger("drop");
		assert.ok($Indicator.is(":visible"), "Indicator is still visible after drop");

		// cleanup
		oDiv2.$().trigger("dragend");
		assert.ok($Indicator.is(":hidden"), "Indicator is hidden after dragend");
		oLocalizationStub.restore();
	});

	QUnit.test("preventDefault on dragover event", function(assert) {
		let oEvent, mTargetRect;
		const oDiv1 = this.oControl.getTopItems()[0];
		const oDiv2 = this.oControl.getTopItems()[1];

		// drag start from Div1
		oEvent = createjQueryDragEventDummy("dragstart", oDiv1);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);

		// dragenter to the end of Div2
		this.oControl.getDragDropConfig()[0].attachEventOnce("dragEnter", function(oEvent) {
			assert.equal(oEvent.getParameter("target"), oDiv2);
			assert.equal(oEvent.getParameter("dropPosition"), "After");
		});
		oEvent = createjQueryDragEventDummy("dragenter", oDiv2);
		mTargetRect = oDiv2.getDomRef().getBoundingClientRect();
		oEvent.pageY = mTargetRect.bottom - 1;
		oEvent.pageX = mTargetRect.left + 1;
		oDiv2.$().trigger(oEvent);
		const $Indicator = jQuery(oEvent.dragSession.getIndicator());
		assert.ok($Indicator.is(":visible"), "Indicator is visible after dragenter on Div2");

		// dragover on the end of Div2
		this.oControl.getDragDropConfig()[0].attachDragOver(function(oEvent) {
			const oDropControl = oEvent.getParameter("target");
			const sDropPosition = oEvent.getParameter("dropPosition");
			if ((oDropControl == oDiv1 && sDropPosition == "After") || (oDropControl == oDiv2 && sDropPosition == "Before")) {
				oEvent.preventDefault(); // do not let dropping between Div1 and Div2
			}
		});
		oEvent = createjQueryDragEventDummy("dragover", oDiv2);
		oEvent.pageY = mTargetRect.bottom - 2;
		oDiv2.$().trigger(oEvent);
		assert.ok($Indicator.is(":visible"), "Indicator is still visible after dragover");

		// dragover on the beginnig of Div2
		oEvent = createjQueryDragEventDummy("dragover", oDiv2);
		oEvent.pageY = mTargetRect.top + 1;
		oDiv2.$().trigger(oEvent);
		assert.ok($Indicator.is(":hidden"), "Indicator is not visible since the default is prevented for the dragover event");

		// dragenter to the beginning of Div1
		this.oControl.getDragDropConfig()[0].attachEventOnce("dragEnter", function(oEvent) {
			assert.equal(oEvent.getParameter("target"), oDiv1);
			assert.equal(oEvent.getParameter("dropPosition"), "Before");
		});
		oEvent = createjQueryDragEventDummy("dragenter", oDiv1);
		mTargetRect = oDiv1.getDomRef().getBoundingClientRect();
		oEvent.pageY = mTargetRect.top + 1;
		oEvent.pageX = mTargetRect.left + 1;
		oDiv1.$().trigger(oEvent);
		assert.ok($Indicator.is(":visible"), "Indicator is visible after dragenter on Div1");

		// dragover on the beginning of Div1
		oEvent = createjQueryDragEventDummy("dragover", oDiv1);
		oEvent.pageY = mTargetRect.top + 2;
		oDiv1.$().trigger(oEvent);
		assert.ok($Indicator.is(":visible"), "Indicator is still visible after dragover");

		// dragover on the end of Div1
		oEvent = createjQueryDragEventDummy("dragover", oDiv1);
		oEvent.pageY = mTargetRect.bottom - 1;
		oDiv1.$().trigger(oEvent);
		assert.ok($Indicator.is(":hidden"), "Indicator is not visible since the default is prevented for the dragover event");

		// cleanup
		oDiv1.$().trigger("dragend");
	});

	QUnit.module("Drop on empty aggregation", {
		beforeEach: function() {
			this.oControl = new DragAndDropControl({
				topItems: [new DivControl(), new DivControl()],
				showNoData: true,
				dragDropConfig: [
					new DragDropInfo({
						sourceAggregation: "topItems",
						targetAggregation: "bottomItems",
						dropPosition: "OnOrBetween"
					})
				]
			});
			this.oControl.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});

	QUnit.test("Indicator position for no data", function(assert) {
		var oEvent, $Indicator, mIndicatorOffset, mTargetOffset;
		var oBottomItemsDomRef = this.oControl.getDomRef("bottomItems");
		var oTargetDomRef = this.oControl.getDomRef("bottomNoData");
		var oSourceControl = this.oControl.getTopItems()[0];
		var oSourceDomRef = oSourceControl.getDomRef();

		// init drag session
		oSourceDomRef.focus();
		oSourceDomRef.dispatchEvent(createNativeDragEventDummy("dragstart"));

		// validation
		oTargetDomRef.focus();
		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));

		// act for the indicator
		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragover"));

		oEvent = jQuery.Event("dragover");
		oEvent.originalEvent = createNativeDragEventDummy("dragover");
		mTargetOffset = oTargetDomRef.getBoundingClientRect();
		oEvent.pageY = mTargetOffset.top + 1;
		oEvent.pageX = mTargetOffset.left + 1;
		jQuery(oTargetDomRef).trigger(oEvent);
		$Indicator = jQuery(oEvent.dragSession.getIndicator());
		mIndicatorOffset = $Indicator.offset();

		assert.strictEqual($Indicator.attr("data-drop-position"), "On", "Indicator's data-drop-position attribute is set to on");
		assert.strictEqual($Indicator.outerWidth(), oBottomItemsDomRef.offsetWidth , "Indicator's width is equal to dropped item's width.");
		assert.strictEqual($Indicator.outerHeight(), oBottomItemsDomRef.offsetHeight , "Indicator's height is equal to dropped item's height.");
		assert.strictEqual(mIndicatorOffset.top, mTargetOffset.top , "Indicator's top position is equal to dropped item's top position.");
		assert.strictEqual(mIndicatorOffset.left, mTargetOffset.left , "Indicator's left position is equal to dropped item's left position.");

		// clean up
		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragend"));
		assert.ok($Indicator.is(":hidden"), "Indicator is hidden after dragend");
	});

	QUnit.test("cleanup", function(assert) {
		var done = assert.async();
		var oEvent, $Indicator;
		var oTargetDomRef = this.oControl.getDomRef("bottomNoData");
		var oSourceControl = this.oControl.getTopItems()[0];
		var oSourceDomRef = oSourceControl.getDomRef();

		// init drag session
		oSourceDomRef.focus();
		oSourceDomRef.dispatchEvent(createNativeDragEventDummy("dragstart"));

		// validation
		oEvent = jQuery.Event("dragenter");
		oEvent.originalEvent = createNativeDragEventDummy("dragenter");
		jQuery(oTargetDomRef).trigger(oEvent);
		$Indicator = jQuery(oEvent.dragSession.getIndicator());
		assert.ok($Indicator.is(":visible"), "Indicator is visible after dragenter");

		// drop handling indicator
		oTargetDomRef.focus();
		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("drop"));

		// assert
		window.requestAnimationFrame(function() {
			assert.ok($Indicator.is(":hidden"), "Indicator is hidden after drop without dragend");
			done();
		});
	});

	QUnit.module("dragSession", {
		beforeEach: async function() {
			this.oContainer = new DragAndDropControl({
				topItems: [this.oSourceControl = new DivControl()],
				bottomItems: [this.oTargetControl = new DivControl(), this.oLastTargetControl = new DivControl()],
				dragDropConfig: [
					this.oDragInfo = new DragInfo({
						sourceAggregation: "topItems"
					}),
					this.oDropInfo = new DropInfo({
						targetAggregation: "bottomItems"
					})
				]
			});

			this.oContainer.placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oTargetDomRef = this.oTargetControl.getDomRef();
			this.oSourceDomRef = this.oSourceControl.getDomRef();
			this.oLastTargetDomRef = this.oLastTargetControl.getDomRef();
		},
		afterEach: function() {
			this.oContainer.destroy();
		}
	});

	QUnit.test("dataTransfer", function(assert) {
		var oDataTransfer = {
			data: "dataValue",
			textData : "textData",
			complexData: ["complexData"]
		};

		var oSystemStub = sinon.stub(Device, "system");
		oSystemStub.value({desktop: false});

		this.oDragInfo.attachDragStart(function(oEvent) {
			var oSession = oEvent.getParameter("dragSession");
			assert.strictEqual(oEvent.getParameter("browserEvent").dataTransfer.getData("text"), " ", "empty text data set for mobile devices");
			oSession.setData("data", oDataTransfer.data);
			oSession.setTextData(oDataTransfer.textData);
			oSession.setComplexData("complexData", oDataTransfer.complexData);
		});
		this.oSourceDomRef.focus();
		this.oSourceDomRef.dispatchEvent(createNativeDragEventDummy("dragstart"));

		function sessionTest(oEvent) {
			var oSession = oEvent.getParameter("dragSession");
			assert.strictEqual(oSession.getData("data"), oDataTransfer.data, "data is transfered over drag session");
			assert.strictEqual(oSession.getTextData(), oDataTransfer.textData, "text data is transfered over drag session");
			assert.strictEqual(oSession.getComplexData("complexData"), oDataTransfer.complexData, "complex data is transfered over drag session");
		}

		this.oLastTargetDomRef.focus();
		this.oDropInfo.attachDragEnter(sessionTest);
		this.oDropInfo.attachDragOver(sessionTest);
		this.oDropInfo.attachDrop(function() {
			this.oSourceControl.destroy();
		}.bind(this));
		this.oDragInfo.attachDragEnd(sessionTest);
		this.oLastTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
		this.oLastTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragover"));
		this.oLastTargetDomRef.dispatchEvent(createNativeDragEventDummy("drop"));
		this.oLastTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragend"));
		oSystemStub.restore();
	});

	QUnit.test("dragged from outside the browser", function(assert) {
		var oSession;
		this.oTargetDomRef.focus();
		this.oDropInfo.attachDragEnter(function(oEvent) {
			oSession = oEvent.getParameter("dragSession");
			assert.ok(oSession, "drag session exists");
		});

		this.oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
		assert.equal(oSession.getDropControl(), this.oTargetControl, "drop control accessible from the session");
		assert.equal(document.querySelector(".sapUiDnDIndicator").style.width, this.oTargetDomRef.style.width, "drop indicator width set correctly");
		assert.equal(document.querySelector(".sapUiDnDIndicator").style.height, this.oTargetDomRef.style.height, "drop indicator height set correctly");
		assert.notEqual(document.querySelector(".sapUiDnDIndicator").style.display, "none", "drop indicator is visible");

		this.oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragleave"));
		assert.equal(document.querySelector(".sapUiDnDIndicator").style.display, "none", "drop indicator is not visible anylonger");
		assert.notOk(oSession.getDropControl(), "there is no more drop control");
	});

	QUnit.test("setDropControl", function(assert) {
		this.oSourceDomRef.focus();
		this.oSourceDomRef.dispatchEvent(createNativeDragEventDummy("dragstart"));

		this.oLastTargetDomRef.focus();
		this.oDropInfo.setDropPosition("OnOrBetween");
		this.oDropInfo.attachDragEnter(function(oEvent) {
			var oSession = oEvent.getParameter("dragSession");
			oSession.setDropControl(this.oTargetControl);
		}, this);
		this.oLastTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));

		this.oDropInfo.attachDrop(function(oEvent) {
			assert.strictEqual(oEvent.getParameter("droppedControl"), this.oTargetControl, "Drop control is changed");
		}, this);
		this.oLastTargetDomRef.dispatchEvent(createNativeDragEventDummy("drop"));
	});

	QUnit.test("setIndicatorConfig", function(assert) {
		this.oSourceDomRef.focus();
		this.oSourceDomRef.dispatchEvent(createNativeDragEventDummy("dragstart"));

		this.oLastTargetDomRef.focus();
		this.oLastTargetControl.ondragenter = function(oEvent) {
			oEvent.dragSession.setIndicatorConfig({
				borderLeft: 0,
				paddingTop: 10,
				left: 100
			});
		};

		this.oDropInfo.attachDragOver(function(oEvent) {
			var oSession = oEvent.getParameter("dragSession");
			var $Indicator = jQuery(oSession.getIndicator());
			assert.strictEqual($Indicator.css("border-left-width"), "0px", "Custom borderLeft is set correctly");
			assert.strictEqual($Indicator.css("padding-top"), "10px", "Custom paddingTop is set correctly");
			assert.strictEqual($Indicator.css("left"), "100px", "Custom left is set correctly");
		}, this);

		this.oLastTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
		this.oLastTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragover"));
		this.oLastTargetDomRef.dispatchEvent(createNativeDragEventDummy("drop"));
	});

	QUnit.module("groupName", {
		beforeEach: async function() {
			this.oContainer = new DragAndDropControl({
				topItems: [this.oSourceControl = new DivControl()],
				bottomItems: [this.oTargetControl = new DivControl()],
				dragDropConfig: [
					this.oDragInfo = new DragInfo({
						sourceAggregation: "topItems",
						dragStart: this.fnDragStartSpy = sinon.spy()
					}),
					this.oDropInfo = new DropInfo({
						targetAggregation: "bottomItems",
						dragEnter: this.fnDragEnterSpy = sinon.spy(),
						drop: this.fnDropSpy = sinon.spy()
					})
				]
			});

			this.oContainer.placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oTargetDomRef = this.oTargetControl.getDomRef();
			this.oSourceDomRef = this.oSourceControl.getDomRef();
		},
		afterEach: function() {
			this.oContainer.destroy();
		}
	});

	QUnit.test("Matching groupNames", function(assert) {
		this.oDragInfo.setGroupName("abc");
		this.oDropInfo.setGroupName("abc");

		this.oSourceDomRef.focus();
		this.oSourceDomRef.dispatchEvent(createNativeDragEventDummy("dragstart"));

		this.oTargetDomRef.focus();
		this.oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
		assert.ok(this.fnDragEnterSpy.calledOnce, "dragEnter event is called once.");

		this.oTargetDomRef.dispatchEvent(createNativeDragEventDummy("drop"));
		assert.ok(this.fnDropSpy.calledOnce, "drop event is called once.");
	});

	QUnit.test("Unmatching groupNames", function(assert) {
		this.oDragInfo.setGroupName("abc");
		this.oDropInfo.setGroupName("xxx");

		this.oSourceDomRef.focus();
		this.oSourceDomRef.dispatchEvent(createNativeDragEventDummy("dragstart"));

		this.oTargetDomRef.focus();
		this.oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
		assert.equal(this.fnDragEnterSpy.callCount, 0, "dragEnter event is not called");

		this.oTargetDomRef.dispatchEvent(createNativeDragEventDummy("drop"));
		assert.equal(this.fnDropSpy.callCount, 0, "drop event is not called");
	});

	QUnit.test("Master groups", function(assert) {
		this.oDragInfo.setGroupName("abc");
		this.oDropInfo.setGroupName("");

		this.oSourceDomRef.focus();
		this.oSourceDomRef.dispatchEvent(createNativeDragEventDummy("dragstart"));

		this.oTargetDomRef.focus();
		this.oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
		assert.ok(this.fnDragEnterSpy.calledOnce, "dragEnter event is called once.");

		this.oTargetDomRef.dispatchEvent(createNativeDragEventDummy("drop"));
		assert.ok(this.fnDropSpy.calledOnce, "drop event is called once.");
	});

	QUnit.module("Parent traverse", {
		beforeEach: async function() {
			this.oContainer = new DragAndDropControl({
				topItems: [this.oSourceControl = new DivControl()],
				bottomItems: [this.oTargetControl = new DivControl({
					renderSomething: function(rm) {
						this.oInnerDiv = new DivControl({
							elementTag: "b"
						});
						rm.renderControl(this.oInnerDiv);
					}.bind(this)
				})],
				dragDropConfig: [
					this.oDragInfo = new DragDropInfo({
						sourceAggregation: "topItems",
						targetAggregation: "bottomItems",
						dragStart: this.fnDragStartSpy = sinon.spy(),
						dragEnter: this.fnDragEnterSpy = sinon.spy(),
						drop: this.fnDropSpy = sinon.spy()
					})
				]
			});

			this.oContainer.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oTargetDomRef = this.oTargetControl.getDomRef();
			this.oSourceDomRef = this.oSourceControl.getDomRef();
			this.oInnerDivDomRef = this.oInnerDiv.getDomRef();
		},
		afterEach: function() {
			this.oInnerDiv.destroy();
			this.oContainer.destroy();
		}
	});

	QUnit.test("Drop control that has no parent", function(assert) {
		this.oSourceDomRef.focus();
		this.oSourceDomRef.dispatchEvent(createNativeDragEventDummy("dragstart"));

		this.oInnerDivDomRef.focus();
		this.oInnerDivDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
		assert.ok(this.fnDragEnterSpy.calledOnce, "dragEnter event is called once.");

		this.oInnerDivDomRef.dispatchEvent(createNativeDragEventDummy("drop"));
		assert.ok(this.fnDropSpy.calledOnce, "drop event is called once.");
	});

	QUnit.module("KeyboardHandling", {
		beforeEach: function() {
			this.oDiv1 = new DivControl();
			this.oDiv2 = new DivControl();
			this.oDnD = new DragDropInfo({
				sourceAggregation: "topItems",
				targetAggregation: "topItems",
				dropPosition: "Between",
				keyboardHandling: true
			});
			this.oControl = new DragAndDropControl({
				topItems: [this.oDiv1, this.oDiv2],
				dragDropConfig: this.oDnD
			});
			this.oControl.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oControl.destroy(true);
		}
	});

	QUnit.test("Ctrl + Down/Right", function(assert) {
		assert.expect(21);
		this.oDnD.attachDragStart((oEvent) => {
			assert.equal(oEvent.getParameter("target"), this.oDiv1, "Target=Div1 is valid for the dragStart event");
		});
		this.oDnD.attachDragEnter((oEvent) => {
			assert.equal(oEvent.getParameter("target"), this.oDiv2, "Target=Div2 is valid for the dragEnter event");
		});
		this.oDnD.attachDrop((oEvent) => {
			assert.equal(oEvent.getParameter("draggedControl"), this.oDiv1);
			assert.equal(oEvent.getParameter("droppedControl"), this.oDiv2);
			assert.equal(oEvent.getParameter("dropPosition"), "After", "DropPosition is After for the drop event");
		});
		this.oDnD.attachDragEnd((oEvent) => {
			assert.equal(oEvent.getParameter("target"), this.oDiv1);
		});

		this.oDiv1.focus();
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowUp", ctrlKey: true}); // this should have no effect
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowLeft", ctrlKey: true}); // this should have no effect
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowRight", ctrlKey: true}); // this should have no effect

		this.oControl.onkeydown = (oEvent) => {
			assert.ok(oEvent.getMark("dnd"), "Keyboard event is marked with dnd marker");
		};

		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowDown", ctrlKey: true});
		this.oDnD.setDropLayout("Horizontal");
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowRight", ctrlKey: true});
		const oLocalizationStub = sinon.stub(Localization, "getRTL").callsFake(function() {
			return true;
		});
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowLeft", ctrlKey: true});
		oLocalizationStub.restore();

	});

	QUnit.test("Ctrl + Up/Left", function(assert) {
		assert.expect(21);
		this.oDnD.attachDragStart((oEvent) => {
			assert.equal(oEvent.getParameter("target"), this.oDiv2, "Target=Div2 is valid for the dragStart event");
		});
		this.oDnD.attachDragEnter((oEvent) => {
			assert.equal(oEvent.getParameter("target"), this.oDiv1, "Target=Div1 is valid for the dragEnter event");
		});
		this.oDnD.attachDrop((oEvent) => {
			assert.equal(oEvent.getParameter("draggedControl"), this.oDiv2);
			assert.equal(oEvent.getParameter("droppedControl"), this.oDiv1);
			assert.equal(oEvent.getParameter("dropPosition"), "Before", "DropPosition is Before for the drop event");
		});
		this.oDnD.attachDragEnd((oEvent) => {
			assert.equal(oEvent.getParameter("target"), this.oDiv2);
		});

		this.oDiv2.focus();
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowDown", ctrlKey: true}); // this should have no effect
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowLeft", ctrlKey: true}); // this should have no effect
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowRight", ctrlKey: true}); // this should have no effect

		this.oControl.onkeydown = (oEvent) => {
			assert.ok(oEvent.getMark("dnd"), "Keyboard event is marked with dnd marker");
		};

		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowUp", ctrlKey: true});
		this.oDnD.setDropLayout("Horizontal");
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowLeft", ctrlKey: true});
		const oLocalizationStub = sinon.stub(Localization, "getRTL").callsFake(function() {
			return true;
		});
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowRight", ctrlKey: true});
		oLocalizationStub.restore();
	});

	QUnit.test("Prevent the default of dragStart event", function(assert) {
		const fnReject = () => {
			assert.ok(false, "This should never be called");
		};
		this.oDnD.attachDragEnter(fnReject);
		this.oDnD.attachDrop(fnReject);
		this.oDnD.attachDragEnd(fnReject);
		this.oDiv1.focus();

		this.oDnD.attachEventOnce("dragStart", (oEvent) => {
			assert.equal(oEvent.getParameter("target"), this.oDiv1, "Default is prevented before dragging Div1");
			oEvent.preventDefault();
		});
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowDown", ctrlKey: true});

		this.oControl.ondragstart = (oEvent) => {
			oEvent.setMark("NonDraggable");
		};
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowDown", ctrlKey: true});
	});

	QUnit.test("Prevent the default of dragEnter event", function(assert) {
		this.oDnD.attachDrop(() => {
			assert.ok(false, "Drop event should never be called");
		});
		this.oDnD.attachDragEnd((oEvent) => {
			assert.equal(oEvent.getParameter("target"), this.oDiv1, "Drag end is called on Div1");
		});
		this.oDiv1.focus();

		this.oDnD.attachEventOnce("dragEnter", (oEvent) => {
			assert.equal(oEvent.getParameter("target"), this.oDiv2, "Default is prevented before dragging enter on Div2");
			oEvent.preventDefault();
		});
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowDown", ctrlKey: true});

		this.oControl.ondragenter = (oEvent) => {
			oEvent.setMark("NonDroppable");
		};
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowDown", ctrlKey: true});
	});

	QUnit.test("keyboardHandling=false", function(assert) {
		assert.expect(1);
		const fnReject = () => {
			assert.ok(false, "This should never be called");
		};
		this.oDnD.attachDragStart(fnReject);
		this.oDnD.attachDragEnter(fnReject);
		this.oDnD.attachDrop(fnReject);
		this.oDnD.attachDragEnd(fnReject);

		this.oDiv1.focus();
		this.oDnD.setKeyboardHandling(false);
		qutils.triggerEvent("keydown", document.activeElement, {code: "ArrowDown", ctrlKey: true});
		assert.ok(true, "Keyboard handling for DnD is disabled");
	});

});