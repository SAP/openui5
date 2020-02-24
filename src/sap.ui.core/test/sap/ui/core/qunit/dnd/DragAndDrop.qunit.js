/*global QUnit,sinon*/
sap.ui.define([
	"sap/ui/core/dnd/DragAndDrop",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/core/dnd/DragDropInfo",
	"jquery.sap.global",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/UIArea",
	"sap/ui/core/Core",
	"sap/ui/Device"
], function(DragAndDrop, DragInfo, DropInfo, DragDropInfo, jQuery, Control, Element, UIArea, Core, Device) {
	"use strict";

	var DivControl = Control.extend("sap.ui.core.dnd.test.DivControl", {
		metadata: {
			properties: {
				elementTag: {type: "string", defaultValue: "div"}
			}
		},
		renderer: function(rm, oControl) {
			rm.write("<div><" + oControl.getElementTag());
			rm.writeControlData(oControl);
			rm.writeAttribute("tabindex", 0);
			rm.addStyle("width", "100px");
			rm.addStyle("height", "50px");
			rm.writeStyles();
			rm.write("></" + oControl.getElementTag() + "></div>");
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
		renderer: function(rm, oControl) {
			var aTopItems = oControl.getTopItems();
			var aBottomItems = oControl.getBottomItems();
			var i;

			rm.write("<div");
			rm.writeControlData(oControl);
			rm.writeAttribute("tabindex", 0);
			rm.write(">");

			rm.write("<div");
			rm.writeAttribute("id", oControl.getId() + "-topItems");
			rm.write(">");

			if (!aTopItems.length) {
				rm.write('<div id="' + oControl.getId() + '-topNoData">No top items</div>"');
			} else {
				for (i = 0; i < aTopItems.length; i++) {
					rm.renderControl(aTopItems[i]);
				}
			}
			rm.write("</div>");

			rm.write("<div");
			rm.writeAttribute("id", oControl.getId() + "-bottomItems");
			rm.write(">");
			if (!aBottomItems.length) {
				rm.write('<div id="' + oControl.getId() + '-bottomNoData">No bottom items</div>"');
			} else {
				for (i = 0; i < aBottomItems.length; i++) {
					rm.renderControl(aBottomItems[i]);
				}
			}
			rm.write("</div>");

			rm.write("</div>");
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
		var oEvent;

		if (typeof Event === "function") {
			oEvent = new Event(sEventType, {
				bubbles: true,
				cancelable: true
			});
		} else { // IE
			oEvent = document.createEvent("Event");
			oEvent.initEvent(sEventType, true, true);
		}

		oEvent.dataTransfer = {
			types: [],
				dropEffect: "",
				setDragImage: function() {},
			setData: function() {}
		};

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
			this.oControl.placeAt("qunit-fixture");
			Core.applyChanges();
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

	QUnit.test("Text input elements", function(assert) {
		var oEvent;

		this.oControl.addTopItem(new DivControl({elementTag: "input"}));
		this.oControl.addTopItem(new DivControl({elementTag: "textarea"}));
		this.oControl.addDragDropConfig(new DragDropInfo({sourceAggregation: "topItems"}));
		Core.applyChanges();

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

	QUnit.test("IE - Text input elements", function(assert) {
		var oBrowserStub = sinon.stub(Device, "browser").value({msie: true});

		this.oControl.addTopItem(new DivControl({elementTag: "input"}));
		this.oControl.addTopItem(new DivControl({elementTag: "textarea"}));
		this.oControl.addDragDropConfig(new DragDropInfo());
		Core.applyChanges();

		assert.ok(this.oControl.getDomRef().draggable, "Ancestor is draggable before mousedown");

		["input", "textarea"].forEach(function(sSelectableElementTagName) {
			this.oControl.$().find(sSelectableElementTagName).trigger("mousedown");
			assert.notOk(this.oControl.getDomRef().draggable, "Ancestor is not draggable after mousedown to allow text selection");

			this.oControl.$().find(sSelectableElementTagName).trigger("mouseup");
			assert.ok(this.oControl.getDomRef().draggable, "Ancestor is draggable again after mouseup to allow drag and drop again");
		}, this);

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
			Core.applyChanges();
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
		oOnLongDragOverSpy.reset();
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
						sourceAggregation: "topItems",
						targetAggregation: "topItems",
						dropPosition: "Between"
					})
				]
			});
			this.oControl.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});

	QUnit.test("Indicator position with dropLayout property", function(assert) {
		var oEvent, $Indicator, mIndicatorOffset, mTargetOffset;
		var oDiv1 = this.oControl.getTopItems()[0];
		var oDiv2 = this.oControl.getTopItems()[1];

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
		assert.strictEqual($Indicator.height(), oDiv2.$().height() , "Indicator's height is equal to dropped item's height.");
		assert.strictEqual(mIndicatorOffset.top, mTargetOffset.top , "Indicator's top position is equal to dropped item's top position.");
		assert.strictEqual(mIndicatorOffset.left, mTargetOffset.left + oDiv2.$().width(), "Indicator's left position is equal to dropped item's right position.");
		assert.strictEqual(oEvent.dragSession.getDropPosition(), "After", "Drop position is set correctly");

		// act for the RTL mode
		sinon.stub(sap.ui.getCore().getConfiguration(), "getRTL").callsFake(function() {
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
			Core.applyChanges();
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
		beforeEach: function() {
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
			Core.applyChanges();

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

		this.oSourceDomRef.focus();
		this.oDragInfo.attachDragStart(function(oEvent) {
			var oSession = oEvent.getParameter("dragSession");
			oSession.setData("data", oDataTransfer.data);
			oSession.setTextData(oDataTransfer.textData);
			oSession.setComplexData("complexData", oDataTransfer.complexData);
		});
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
	});

	QUnit.test("dragged from outside the browser", function(assert) {
		this.oTargetDomRef.focus();
		this.oDropInfo.attachDragEnter(function(oEvent) {
			assert.ok(oEvent.getParameter("dragSession"), "drag session exists");
		});
		this.oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
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
		beforeEach: function() {
			this.oContainer = new DragAndDropControl({
				topItems: [this.oSourceControl = new DivControl()],
				bottomItems: [this.oTargetControl = new DivControl()],
				dragDropConfig: [
					this.oDragInfo = new DragInfo({
						sourceAggregation: "topItems",
						dragStart: this.fnDragStartSpy = sinon.spy(function() {})
					}),
					this.oDropInfo = new DropInfo({
						targetAggregation: "bottomItems",
						dragEnter: this.fnDragEnterSpy = sinon.spy(),
						drop: this.fnDropSpy = sinon.spy()
					})
				]
			});

			this.oContainer.placeAt("qunit-fixture");
			Core.applyChanges();

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

	QUnit.module("DropIndicator DOM wrapper", {
		beforeEach: function() {
			this.oControl = new DragAndDropControl({
				topItems: [new DivControl(), new DivControl()],
				dragDropConfig: [
					new DragDropInfo({
						sourceAggregation: "topItems",
						targetAggregation: "topItems"
					})
				]
			});
			this.oControl.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});

	if (Device.browser.msie) {
		QUnit.test("Drop Indicator DOM wrapper structure for IE browser", function(assert) {
			var oEvent, $Indicator;
			var oDiv1 = this.oControl.getTopItems()[0];
			var oDiv2 = this.oControl.getTopItems()[1];

			// init drag session
			oEvent = createjQueryDragEventDummy("dragstart", oDiv1);
			oEvent.target.focus();
			DragAndDrop.preprocessEvent(oEvent);

			// validation
			oEvent = createjQueryDragEventDummy("dragenter", oDiv2);
			oEvent.target.focus();
			DragAndDrop.preprocessEvent(oEvent);
			oDiv2.$().trigger(oEvent);
			$Indicator = jQuery(oEvent.dragSession.getIndicator());

			assert.notOk($Indicator.parent().hasClass("sapUiDnDIndicatorWrapper"), "sapUiDnDIndicatorWrapper div wrapper not created for IE browser");

			// cleanup
			// drop
			oDiv2.$().trigger("drop");
			// dragend
			oDiv2.$().trigger("dragend");
		});
	} else {
		QUnit.test("Drop Indicator DOM wrapper structure for non IE browsers", function(assert) {
			var oEvent, $Indicator;
			var oDiv1 = this.oControl.getTopItems()[0];
			var oDiv2 = this.oControl.getTopItems()[1];

			// init drag session
			oEvent = createjQueryDragEventDummy("dragstart", oDiv1);
			oEvent.target.focus();
			DragAndDrop.preprocessEvent(oEvent);

			// validation
			oEvent = createjQueryDragEventDummy("dragenter", oDiv2);
			oEvent.target.focus();
			DragAndDrop.preprocessEvent(oEvent);
			oDiv2.$().trigger(oEvent);
			$Indicator = jQuery(oEvent.dragSession.getIndicator());

			assert.ok($Indicator.parent().hasClass("sapUiDnDIndicatorWrapper"), "sapUiDnDIndicatorWrapper div wrapper created for non IE browsers");

			// cleanup
			// drop
			oDiv2.$().trigger("drop");
			// dragend
			oDiv2.$().trigger("dragend");
		});
	}
});