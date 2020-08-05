/*!
 * ${copyright}
 */

sap.ui.define(["./DragDropBase"],
	function(DragDropBase) {
	"use strict";

	/**
	 * Constructor for a new DropInfo.
	 *
	 * @param {string} [sId] ID for the new DropInfo, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the DropInfo
	 *
	 * @class
	 * Provides the configuration for drop operations.
	 * <b>Note:</b> This configuration might be ignored due to control {@link sap.ui.core.Element.extend metadata} restrictions.
	 *
	 * @extends sap.ui.core.dnd.DragDropBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.56
	 * @alias sap.ui.core.dnd.DropInfo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DropInfo = DragDropBase.extend("sap.ui.core.dnd.DropInfo", /** @lends sap.ui.core.dnd.DropInfo.prototype */ { metadata: {

		library: "sap.ui.core",
		interfaces: [
			"sap.ui.core.dnd.IDropInfo"
		],
		properties: {
			/**
			 * The aggregation name in the drop target control which is the target of this drag-and-drop action. If undefined, the entire
			 * control is the target. This can be handy if the target control does not have any aggregations or if the drop position within the target does not matter.
			 */
			targetAggregation: {type: "string", defaultValue: null, invalidate: false},

			/**
			 * Defines the visual drop effect.
			 *
			 * In Internet Explorer, default visual drop effect is <code>Copy</code> and this property has no effect.
			 */
			dropEffect: {type: "sap.ui.core.dnd.DropEffect", defaultValue: "Move", invalidate: false},

			/**
			 * Defines the position for the drop action, visualized by a rectangle.
			 */
			dropPosition: {type: "sap.ui.core.dnd.DropPosition", defaultValue: "On", invalidate: false},

			/**
			 * Defines the layout of the droppable controls if <code>dropPosition</code> is set to <code>Between</code> or <code>OnOrBetween</code>.
			 */
			dropLayout: {type: "sap.ui.core.dnd.DropLayout", defaultValue: "Default", invalidate: false}
		},

		events: {
			/**
			 * This event is fired when a dragged element enters a drop target.
			 *
			 * @name sap.ui.core.dnd.DropInfo#dragEnter
			 * @event
			 * @param {sap.ui.base.Event} oControlEvent
			 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
			 * @param {object} oControlEvent.getParameters
			 * @param {sap.ui.core.Element} oControlEvent.getParameters.target The target element on which the dragged element will be dropped
			 * @param {sap.ui.core.dnd.DragSession} oControlEvent.getParameters.dragSession The UI5 <code>dragSession</code> object that exists only during drag and drop
			 * @param {Event} oControlEvent.getParameters.browserEvent The underlying browser event
			 * @public
			 */
			dragEnter: {
				allowPreventDefault: true
			},

			/**
			 * This event is fired when an element is being dragged over a valid drop target.
			 *
			 * @name sap.ui.core.dnd.DropInfo#dragOver
			 * @event
			 * @param {sap.ui.base.Event} oControlEvent
			 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
			 * @param {object} oControlEvent.getParameters
			 * @param {sap.ui.core.Element} oControlEvent.getParameters.target The target element on which the dragged element will be dropped
			 * @param {sap.ui.core.dnd.DragSession} oControlEvent.getParameters.dragSession The UI5 <code>dragSession</code> object that exists only during drag and drop
			 * @param {string} oControlEvent.getParameters.dropPosition The calculated position of the drop action relative to the <code>target</code>, possible values are <code>Before</code>, <code>On</code>, <code>After</code>
			 * @param {Event} oControlEvent.getParameters.browserEvent The underlying browser event
			 * @public
			 * @since 1.56
			 */
			dragOver: {
			},

			/**
			 * This event is fired when an element is dropped on a valid drop target, as specified by the drag-and-drop info.
			 *
			 * @name sap.ui.core.dnd.DropInfo#drop
			 * @event
			 * @param {sap.ui.base.Event} oControlEvent
			 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
			 * @param {object} oControlEvent.getParameters
			 * @param {sap.ui.core.dnd.DragSession} oControlEvent.getParameters.dragSession The UI5 <code>dragSession</code> object that exists only during drag and drop
			 * @param {sap.ui.core.Element} oControlEvent.getParameters.draggedControl The element being dragged
			 * @param {sap.ui.core.Element} oControlEvent.getParameters.droppedControl The element being dropped
			 * @param {string} oControlEvent.getParameters.dropPosition The calculated position of the drop action relative to the <code>droppedControl</code>, possible values are <code>Before</code>, <code>On</code>, <code>After</code>
			 * @param {Event} oControlEvent.getParameters.browserEvent The underlying browser event
			 * @public
			 */
			drop: {
			}
		}
	}});

	DropInfo.prototype.getDropTarget = function() {
		return this.getParent();
	};

	DropInfo.prototype.isDroppable = function(oControl, oEvent) {
		this.sTemporaryDropPosition = "";

		if (!this.getEnabled()) {
			return false;
		}

		var oDropTarget = this.getDropTarget();
		if (!oDropTarget) {
			return false;
		}

		// droppable by default
		var sTargetAggregation = this.getTargetAggregation();
		if (!this.checkMetadata(oDropTarget, sTargetAggregation, "droppable")) {
			return false;
		}

		// control itself is the drop target
		var sTargetAggregation = this.getTargetAggregation();
		if (oDropTarget === oControl && !sTargetAggregation) {
			return true;
		}

		// control is in the aggregation of the drop target
		if (oControl.getParent() === oDropTarget && sTargetAggregation === oControl.sParentAggregationName) {
			return true;
		}

		// the current DOM element corresponds to the configured aggregation
		if (oEvent && sTargetAggregation && oDropTarget === oControl) {
			var oAggregationDomRef = oControl.getDomRefForSetting(sTargetAggregation);
			if (oAggregationDomRef && oAggregationDomRef != oEvent.target && oAggregationDomRef.contains(oEvent.target)) {
				// mark the event for the found aggregation name
				oEvent.setMark("DragWithin", sTargetAggregation);
				this.sTemporaryDropPosition = "On";
				return true;
			}
		}

		return false;
	};

	DropInfo.prototype.getDropPosition = function(bCheckTemporary) {
		if (bCheckTemporary && this.sTemporaryDropPosition) {
			return this.sTemporaryDropPosition;
		}

		return this.getProperty("dropPosition");
	};

	DropInfo.prototype.getDropLayout = function(bDetectDefault) {
		var sDropLayout = this.getProperty("dropLayout");
		if (!bDetectDefault || sDropLayout != "Default") {
			return sDropLayout;
		}

		return this.getDropTarget().getMetadata().getDragDropInfo(this.getTargetAggregation()).layout;
	};

	DropInfo.prototype.fireDragEnter = function(oEvent) {
		if (!oEvent || !oEvent.dragSession) {
			return;
		}

		var oDragSession = oEvent.dragSession;
		return this.fireEvent("dragEnter", {
			dragSession: oEvent.dragSession,
			browserEvent: oEvent.originalEvent,
			target: oDragSession.getDropControl()
		}, true);
	};

	DropInfo.prototype.fireDragOver = function(oEvent) {
		if (!oEvent || !oEvent.dragSession) {
			return;
		}

		var oDragSession = oEvent.dragSession;
		return this.fireEvent("dragOver", {
			dragSession: oEvent.dragSession,
			browserEvent: oEvent.originalEvent,
			target: oDragSession.getDropControl(),
			dropPosition: oDragSession.getDropPosition()
		});
	};

	DropInfo.prototype.fireDrop = function(oEvent) {
		if (!oEvent || !oEvent.dragSession) {
			return;
		}

		var oDragSession = oEvent.dragSession;
		this.fireEvent("drop", {
			dragSession: oEvent.dragSession,
			browserEvent: oEvent.originalEvent,
			dropPosition: oDragSession.getDropPosition(),
			draggedControl: oDragSession.getDragControl(),
			droppedControl: oDragSession.getDropControl()
		});
	};

	return DropInfo;

});