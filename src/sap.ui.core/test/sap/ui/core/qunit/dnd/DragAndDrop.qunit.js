sap.ui.define([
	"sap/ui/core/dnd/DragAndDrop",
	"sap/ui/core/dnd/DragDropInfo",
	"jquery.sap.global",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/UIArea"
], function(DragAndDrop, DragDropInfo, jQuery, Control, Element, UIArea) {
	"use strict";

	/*global QUnit,sinon*/

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
		}
	});

	var DragAndDropControl = Control.extend("sap.ui.core.dnd.test.DragAndDropControl", {
		metadata: {
			properties : {
				showNoData : {type : "boolean", defaultValue : false},
			},
			aggregations: {
				topItems: {
					name: "topItems",
					type: "sap.ui.core.dnd.test.DivControl",
					multiple: true,
					singularName: "topItem"
				},
				bottomItems: {
					name: "bottomItems",
					type: "sap.ui.core.dnd.test.DivControl",
					multiple: true,
					singularName: "bottomItem"
				},
				dragDropConfig: {
					name: "dragDropConfig",
					type: "sap.ui.core.dnd.DragDropBase",
					multiple: true,
					singularName: "dragDropConfig"
				}
			}
		},
		getAggregationDomRef: function(sAggregationName) {
			return this.getDomRef(sAggregationName);
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
			sap.ui.getCore().applyChanges();
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
		sap.ui.getCore().applyChanges();

		oEvent = createjQueryDragEventDummy("dragstart", this.oControl.getTopItems()[0]);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);
		assert.equal(oEvent.dragSession, null, "No drag session was created for an input element");

		oEvent = createjQueryDragEventDummy("dragstart", this.oControl.getTopItems()[1]);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);
		assert.equal(oEvent.dragSession, null, "No drag session was created for a textarea element");
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

		DragAndDrop.postprocessEvent(oEvent); // Postprocessing "drop" destroys the drag session.
		oEvent = createjQueryDragEventDummy("dragenter", this.oControl, false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession == null, "Drag session was destroyed");

		oEvent = createjQueryDragEventDummy("dragstart", this.oControl);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession != null, "dragstart: A new drag session was created");

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

		document.dispatchEvent(oEvent.originalEvent); // Fire global "dragend" event. Drag session should be destroyed.
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
			sap.ui.getCore().applyChanges();
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
		oEventTarget.dispatchEvent(createNativeDragEventDummy("dragend"));
		oEventTarget.dispatchEvent(createNativeDragEventDummy("drop"));

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
			{processor: "dnd-preprocessor", eventType: "dragend"},
			{processor: "control", eventType: "dragend"},
			{processor: "dnd-postprocessor", eventType: "dragend"},
			{processor: "dnd-preprocessor", eventType: "drop"},
			{processor: "control", eventType: "drop"},
			{processor: "dnd-postprocessor", eventType: "drop"}
		], "The drag-and-drop events have been processed before and after they where dispatched to the controls");

		// Restore original dnd event preprocessor.
		fnOriginalDragAndDropEventPreprocessor = DragAndDrop.preprocessEvent;
	});

	QUnit.test("Simulated longdragover", function(assert) {
		var done = assert.async();
		var oEventTarget;
		var oControlADomRef = this.oControl.getTopItems()[0].getDomRef();
		var oControlBDomRef = this.oControl.getTopItems()[1].getDomRef();
		var oOnLongDragOverSpy = sinon.spy(function(oEvent) {
			oOnLongDragOverSpy._oEventTarget = oEvent.target;
		});
		var iLastLongDragoverCount = 0;
		var oEvent;

		function executeDelayed(iDelayInMs, fn) {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					fn();
					resolve();
				}, iDelayInMs);
			});
		}

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

		oEventTarget = oControlADomRef;
		oEventTarget.focus();
		oEventTarget.dispatchEvent(createNativeDragEventDummy("dragenter"));
		assertLongdragover(0);
		executeDelayed(500, function() {
			assertLongdragover(500);
		}).then(executeDelayed.bind(this, 600, function() {
			assertLongdragover(1100);
		})).then(executeDelayed.bind(this, 400, function() {
			assertLongdragover(1500);
		})).then(executeDelayed.bind(this, 600, function() {
			assertLongdragover(2100);
		})).then(executeDelayed.bind(this, 400, function() {
			assertLongdragover(2500);
		})).then(executeDelayed.bind(this, 1, function() {
			oEventTarget = oControlBDomRef;
			oEventTarget.dispatchEvent(createNativeDragEventDummy("dragenter"));
			oOnLongDragOverSpy.reset();
		})).then(executeDelayed.bind(this, 600, function() {
			assertLongdragover(600);
		})).then(executeDelayed.bind(this, 500, function() {
			assertLongdragover(1100);
		})).then(done);

		// PhantomJS does not allow this. Keep it in case PhantomJS will be replaced someday, it is a lot faster.
		//var oDateNowStub = sinon.stub(Date, "now");
		//
		//function setTime(iTimeInMs) {
		//	oDateNowStub.returns(iTimeInMs);
		//}
		//
		//setTime(0);
		//oEventTarget = oControlADomRef;
		//oEventTarget.dispatchEvent(createNativeDragEventDummy("dragenter"));
		//assertLongdragover(0);
		//setTime(999);
		//assertLongdragover(999);
		//setTime(1000);
		//assertLongdragover(1000);
		//setTime(1999);
		//assertLongdragover(1999);
		//setTime(2000);
		//assertLongdragover(2000);
		//oEventTarget = oControlBDomRef;
		//setTime(2999);
		//oEventTarget.dispatchEvent(createNativeDragEventDummy("dragenter"));
		//oOnLongDragOverSpy.reset();
		//assertLongdragover(0);
		//setTime(3000);
		//assertLongdragover(1);
		//setTime(3999);
		//assertLongdragover(1000);
		//oDateNowStub.restore();
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
			sap.ui.getCore().applyChanges();
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

		assert.strictEqual($Indicator.attr("data-drop-position"), "between", "Indicator's data-drop-position attribute is set to between");
		assert.strictEqual($Indicator.attr("data-drop-layout"), "vertical", "Indicator's data-drop-layout attribute is set to vertical.");
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

		assert.strictEqual($Indicator.attr("data-drop-layout"), "vertical", "Indicator's data-drop-layout attribute is still vertical.");
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

		assert.strictEqual($Indicator.attr("data-drop-layout"), "horizontal", "Indicator's data-drop-layout attribute is set to horizontal.");
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

		assert.strictEqual($Indicator.attr("data-drop-layout"), "horizontal", "Indicator's data-drop-layout attribute is still horizontal.");
		assert.strictEqual($Indicator.height(), oDiv2.$().height() , "Indicator's height is equal to dropped item's height.");
		assert.strictEqual(mIndicatorOffset.top, mTargetOffset.top , "Indicator's top position is equal to dropped item's top position.");
		assert.strictEqual(mIndicatorOffset.left, mTargetOffset.left + oDiv2.$().width(), "Indicator's left position is equal to dropped item's right position.");

		// clean up
		oDiv2.$().trigger("drop");
		assert.ok($Indicator.is(":hidden"), "Indicator is hidden after drop");
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
						dropPosition: "Between"
					})
				]
			});
			this.oControl.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
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

		assert.strictEqual($Indicator.attr("data-drop-position"), "on", "Indicator's data-drop-position attribute is set to on");
		assert.strictEqual($Indicator.outerWidth(), oBottomItemsDomRef.offsetWidth , "Indicator's width is equal to dropped item's width.");
		assert.strictEqual($Indicator.outerHeight(), oBottomItemsDomRef.offsetHeight , "Indicator's height is equal to dropped item's height.");
		assert.strictEqual(mIndicatorOffset.top, mTargetOffset.top , "Indicator's top position is equal to dropped item's top position.");
		assert.strictEqual(mIndicatorOffset.left, mTargetOffset.left , "Indicator's left position is equal to dropped item's left position.");

		// clean up
		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("drop"));
		assert.ok($Indicator.is(":hidden"), "Indicator is hidden after drop");
	});
});