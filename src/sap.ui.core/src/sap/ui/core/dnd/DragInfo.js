/*!
 * ${copyright}
 */

sap.ui.define(["./DragDropBase", "../Element"],
	function(DragDropBase, Element) {
	"use strict";

	/**
	 * Constructor for a new DragInfo.
	 *
	 * @param {string} [sId] ID for the new DragInfo, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the DragInfo
	 *
	 * @class
	 * Provides the configuration for drag operations.
	 *
	 * @extends sap.ui.core.dnd.DragDropBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.56
	 * @alias sap.ui.core.dnd.DragInfo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DragInfo = DragDropBase.extend("sap.ui.core.dnd.DragInfo", /** @lends sap.ui.core.dnd.DragInfo.prototype */ { metadata : {

		library : "sap.ui.core",
		interfaces: [
			"sap.ui.core.dnd.IDragInfo"
		],
		properties : {
			/**
			 * The name of the aggregation from which all children can be dragged. If undefined, the control itself can be dragged.
			 */
			sourceAggregation: {type: "string", defaultValue : null},

			/**
			 * Defines the name of the group to which this <code>DragInfo</code> belongs. If <code>groupName</code> is specified, then this <code>DragInfo</code> object will only interact with other <code>DropInfo</code> objects within the same group.
			 */
			groupName: {type: "string", defaultValue : null}
		},

		events: {
			/**
			 * This event is fired when the user starts dragging an element.
			 *
			 * @name sap.ui.core.dnd.DragInfo#dragStart
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
			}
		}
	}});

	DragInfo.prototype.isDraggable = function(oControl) {
		if (!(oControl instanceof Element)) {
			return false;
		}

		var oDragSource = this.getParent();
		if (!oDragSource) {
			return false;
		}

		// control itself is the drag source
		var sSourceAggregation = this.getSourceAggregation();
		if (oDragSource === oControl && !sSourceAggregation) {
			return true;
		}

		// control is in the aggregation of the drag source
		if (oControl.getParent() === oDragSource && sSourceAggregation === oControl.sParentAggregationName) {
			return true;
		}

		return false;
	};

	DragInfo.prototype.fireDragStart = function (oEvent) {
		if (!oEvent || !oEvent.dragSession) {
			return;
		}

		var oDragSession = oEvent.dragSession;
		return this.fireEvent("dragStart", {
			dragSession: oDragSession,
			browserEvent: oEvent.originalEvent,
			target: oDragSession.getDragControl()
		}, true);
	};

	return DragInfo;

}, /* bExport= */ true);