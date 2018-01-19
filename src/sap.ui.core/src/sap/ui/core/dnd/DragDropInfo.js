/*!
 * ${copyright}
 */

sap.ui.define(["./DragDropBase", "../Element", "jquery.sap.dom"],
	function(DragDropBase, Element, jQuery) {
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
	 * @public
	 * @since 1.52
	 * @alias sap.ui.core.dnd.DragDropInfo
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
			 *
			 * @name sap.ui.core.dnd.DragDropInfo#dragStart
			 * @event
			 * @param {sap.ui.base.Event} oControlEvent
			 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
			 * @param {object} oControlEvent.getParameters
			 * @param {sap.ui.core.Element} oControlEvent.getParameters.target The target element that will be dragged
			 * @param {sap.ui.core.dnd.DragSession} oControlEvent.getParameters.dragSession The UI5 <code>dragSession</code> object that exists only during drag and drop
			 * @param {Event} oControlEvent.getParameters.browserEvent The underlying browser event
			 * @public
			 */
			dragStart: {
				allowPreventDefault : true
			},

			/**
			 * This event is fired when a dragged element enters a drop target.
			 *
			 * @name sap.ui.core.dnd.DragDropInfo#dragEnter
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
				allowPreventDefault : true
			},

			/**
			 * This event is fired when an element is dropped on a valid drop target, as specified by the drag and drop info.
			 *
			 * @name sap.ui.core.dnd.DragDropInfo#drop
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
			drop : {
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

	DragDropInfo.prototype.isDroppable = function (oDropTargetElement, oDropTargetDomRef) {
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

				// Dragging over this element, not any child, so we need to check whether the current DOM element corresponds to the configured aggregation.
				if (!oValidTarget.getAggregationDomRef) {
					return false;
				}

				var oAggregationDomRef = oValidTarget.getAggregationDomRef(sTargetAggregationName);
				if (!oAggregationDomRef || oAggregationDomRef === oDropTargetDomRef) {
					return false;
				}

				if (oAggregationDomRef.contains(oDropTargetDomRef)) {
					return true;
				}

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

});