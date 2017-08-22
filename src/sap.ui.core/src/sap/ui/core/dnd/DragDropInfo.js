/*!
 * ${copyright}
 */

sap.ui.define(["./DragDropBase", "../Element"],
	function(DragDropBase, Element) {
	"use strict";

	/**
	 * Constructor for a new DragDropInfo.
	 *
	 * @param {string} [sId] ID for the new DragDropInfo, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the DragDropInfo
	 *
	 * @class
	 * Provides the configuration for drag-and-drop operations.
	 *
	 * @extends sap.ui.core.dnd.DragDropBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.52
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DragDropInfo = DragDropBase.extend("sap.ui.core.dnd.DragDropInfo", /** @lends sap.ui.core.dnd.DragDropInfo.prototype */ { metadata : {

		library : "sap.ui.core",
		interfaces: [
			"sap.ui.core.dnd.IDragInfo",
			"sap.ui.core.dnd.IDropInfo"
		],
		properties : {
			/**
			 * The name of the aggregation from which all children can be dragged. If undefined, the control itself can be dragged.
			 */
			sourceAggregation: {type: "string", defaultValue : null},

			/**
			 * The aggregation name in the <code>targetElement</code> which is the target of this drag and drop action. If undefined, the entire
			 * <code>targetElement</code> is the target. This can be handy if the target control does not have any aggregations or if the drop
			 * position within the target does not matter.
			 */
			targetAggregation: {type: "string", defaultValue : null},

			/**
			 * Defines the visual drop effect.
			 */
			dropEffect: {type: "sap.ui.core.dnd.DropEffect", defaultValue : "Move"},

			/**
			 * Defines the position for the drop action, visualized by a rectangle.
			 */
			dropPosition: {type: "sap.ui.core.dnd.DropPosition", defaultValue : "On"},

			/**
			 * Defines the layout of the droppable controls if <code>dropPosition</code> is set to <code>Between</code> or <code>OnOrBetween</code>.
			 */
			dropLayout: {type: "sap.ui.core.dnd.DropLayout", defaultValue : "Vertical"}
		},

		associations : {
			/**
			 * The target element for this drag and drop action. If undefined, the control with this drag and drop configuration itself is the target.
			 * Leaving this empty, but defining source and target aggregation, allows you to reorder the children within a control, for example.
			 */
			targetElement: {type : "sap.ui.core.Element", multiple : false}
		},

		events: {
			/**
			 * This event is fired when the user starts dragging an element.
			 */
			dragStart: {
				enableEventBubbling: true,
				allowPreventDefault : true,
				parameters : {
					/**
					 * The target element that eill be dragged
					 */
					target: {type: "sap.ui.core.Element"},

					/**
					 * The UI5 <code>dragSession</code> object that exists only during drag and drop
					 */
					dragSession : {type: "object"},

					/**
					 * The underlying browser event
					 */
					browserEvent: {type: "object"}
				}
			},
			/**
			 * This event is fired when a dragged element enters a drop target.
			 */
			dragEnter: {
				enableEventBubbling: true,
				allowPreventDefault : true,
				parameters : {
					/**
					 * The target element on which the dragged element will be dropped
					 */
					target: {type: "sap.ui.core.Element"},

					/**
					 * The UI5 <code>dragSession</code> object that exists only during drag and drop
					 */
					dragSession : {type: "object"},

					/**
					 * The underlying browser event
					 */
					browserEvent: {type: "object"}
				}
			},
			/**
			 * This event is fired when an element is dropped on a valid drop target, as specified by the drag and drop info.
			 */
			drop : {
				enableEventBubbling: true,
				parameters: {
					/**
					 * The UI5 <code>dragSession</code> object that exists only during drag and drop
					 */
					dragSession : {type: "object"},

					/**
					 * The element being dragged
					 */
					draggedControl: {type: "sap.ui.core.Element"},

					/**
					 * The element is being dropped
					 */
					droppedControl: {type: "sap.ui.core.Element"},

					/**
					 * The calculated position of the drop action relative to the <code>droppedControl</code>
					 */
					dropPosition: {type: "string"},

					/**
					 * The underlying browser event
					 */
					browserEvent: {type: "object"}
				}
			}
		}
	}});


	// IDragInfo members

	DragDropInfo.prototype.isDraggable = function (oDragTargetElement) { // TODO: some caching?
		if (!(oDragTargetElement instanceof Element) || !this.getParent()) {
			return false;
		}

		var sSourceAggregationName = this.getSourceAggregation();

		if (oDragTargetElement === this.getParent()) { // Dragging the element itself.
			if (sSourceAggregationName) {
				// The element itself (not one of its aggregated children) is not draggable, if a source aggregation is defined.
				return false;
			}

		} else if (oDragTargetElement.getParent() === this.getParent()) { // Dragging a child element.
			if (!sSourceAggregationName || sSourceAggregationName !== oDragTargetElement.sParentAggregationName) {
				// The child of an element is not draggable, if it is not in the defined source aggregation.
				return false;
			}
		} else {
			// Unrelated elements (includes higher level children) are not draggable.
			return false;
		}

		return true;
	};

	DragDropInfo.prototype.fireDragStart = function (oEvent, oTargetElement) {
		var mParameters = {
			target: oTargetElement,
			dragSession: oEvent.dragSession,
			browserEvent: oEvent.originalEvent
		};
		return this.fireEvent("dragStart", mParameters, true);
	};


	// IDropInfo members

	DragDropInfo.prototype.isDroppable = function (oDropTargetElement) {
		if (!(oDropTargetElement instanceof Element)) {
			return false;
		}

		var sTargetElementId = this.getTargetElement();
		var oValidTarget;

		// If targetElement is defined, dropping is allowed on the target element or one of its aggregations,
		// otherwise on this element or one of its aggregations.
		if (sTargetElementId) {
			oValidTarget = sap.ui.getCore().byId(sTargetElementId);
		} else {
			oValidTarget = this.getParent();
		}

		if (!oValidTarget) {
			return false;
		}

		var sTargetAggregationName = this.getTargetAggregation();

		// If targetAggregation is defined, the drop target needs to be in the aggregation area of oValidTarget,
		// otherwise just anywhere in oValidTarget.
		if (sTargetAggregationName) {
			if (oDropTargetElement === oValidTarget) {
				// Dragging over this element, not any child, so we need to check whether the current DOM element corresponds to the configured
				// aggregation.
				// TODO, use designtime.js
				return false;

			} else if (!(oDropTargetElement.sParentAggregationName === sTargetAggregationName && oDropTargetElement.getParent() === oValidTarget)) {
				// Not dragging over an aggregated child of the element.
				return false;
			}
		} else if (!oValidTarget.getDomRef
				   || !oDropTargetElement.getDomRef
				   || !jQuery.sap.containsOrEquals(oValidTarget.getDomRef(), oDropTargetElement.getDomRef())) {

			// TODO: This check is insufficient for elements which consist of several DOM elements (getDomRef only returns the main DOM element)
			return false;
		}

		return true;
	};

	DragDropInfo.prototype.getCurrentDropPosition = function (oEvent) {
		return this.getDropPosition();
	};

	DragDropInfo.prototype.fireDragEnter = function (oEvent, oTargetElement) {
		var mParameters = {
			target: oTargetElement,
			dragSession: oEvent.dragSession,
			browserEvent: oEvent.originalEvent
		};
		return this.fireEvent("dragEnter", mParameters, true);
	};

	DragDropInfo.prototype.fireDrop = function (oEvent, sDropPosition) {
		var mParameters = {
			dragSession: oEvent.dragSession,
			draggedControl: oEvent.dragSession.draggedControl,
			droppedControl: oEvent.dragSession.dropControl,
			dropPosition: sDropPosition,
			browserEvent: oEvent.originalEvent
		};
		this.fireEvent("drop", mParameters);
	};

	return DragDropInfo;

}, /* bExport= */ true);