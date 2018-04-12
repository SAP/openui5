/*!
 * ${copyright}
 */

sap.ui.define(["./DragInfo", "./DropInfo", "../Element"],
	function(DragInfo, DropInfo, Element) {
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
	 * @extends sap.ui.core.dnd.DropInfo
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.52
	 * @alias sap.ui.core.dnd.DragDropInfo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DragDropInfo = DropInfo.extend("sap.ui.core.dnd.DragDropInfo", /** @lends sap.ui.core.dnd.DragDropInfo.prototype */ { metadata : {

		library : "sap.ui.core",
		interfaces: [
			"sap.ui.core.dnd.IDragInfo",
			"sap.ui.core.dnd.IDropInfo"
		],
		properties : {
			/**
			 * The name of the aggregation from which all children can be dragged. If undefined, the control itself can be dragged.
			 */
			sourceAggregation: {type: "string", defaultValue : null}
		},
		associations : {
			/**
			 * The target element for this drag and drop action. If undefined, the control with this drag and drop configuration itself is the target.
			 * Leaving this empty, but defining source and target aggregation, allows you to reorder the children within a control, for example.
			 */
			targetElement: {type : "sap.ui.core.Element", multiple : false, invalidate: false}
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
			 * This event is fired when a drag operation is being ended.
			 *
			 * @name sap.ui.core.dnd.DragInfo#dragEnd
			 * @event
			 * @param {sap.ui.base.Event} oControlEvent
			 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
			 * @param {object} oControlEvent.getParameters
			 * @param {sap.ui.core.Element} oControlEvent.getParameters.target The target element that is being dragged
			 * @param {sap.ui.core.dnd.DragSession} oControlEvent.getParameters.dragSession The UI5 <code>dragSession</code> object that exists only during drag and drop
			 * @param {Event} oControlEvent.getParameters.browserEvent The underlying browser event
			 * @public
			 * @since 1.56
			 */
			dragEnd: {
			}
		}
	}});

	// Mixin the DragInfo implementation
	DragDropInfo.prototype.isDraggable = DragInfo.prototype.isDraggable;
	DragDropInfo.prototype.fireDragEnd = DragInfo.prototype.fireDragEnd;
	DragDropInfo.prototype.fireDragStart = DragInfo.prototype.fireDragStart;

	DragDropInfo.prototype.getDropTarget = function() {
		var sTargetElement = this.getTargetElement();
		if (sTargetElement) {
			return sap.ui.getCore().byId(sTargetElement);
		}

		return this.getParent();
	};

	/**
	 * <code>groupName</code> property must not be set.
	 *
	 * @private
	 * @returns {sap.ui.core.dnd.DragDropInfo} <code>this</code> to allow method chaining.
	 */
	DragDropInfo.prototype.setGroupName = function() {
		jQuery.sap.log.error("groupName property must not be set on " + this);
		return this;
	};

	return DragDropInfo;

}, /* bExport= */ true);