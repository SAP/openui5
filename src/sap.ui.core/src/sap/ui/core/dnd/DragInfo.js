/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "./DragDropBase"],
	function(jQuery, DragDropBase) {
	"use strict";

	/**
	 * Constructor for a new DragInfo.
	 *
	 * @param {string} [sId] ID for the new DragInfo, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the DragInfo
	 *
	 * @class
	 * Provides the configuration for drag operations.
	 * <b>Note:</b> This configuration might be ignored due to control {@link sap.ui.core.Element.extend metadata} restrictions.
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
	var DragInfo = DragDropBase.extend("sap.ui.core.dnd.DragInfo", /** @lends sap.ui.core.dnd.DragInfo.prototype */ { metadata: {

		library: "sap.ui.core",
		interfaces: [
			"sap.ui.core.dnd.IDragInfo"
		],
		properties: {
			/**
			 * The name of the aggregation from which all children can be dragged. If undefined, the control itself can be dragged.
			 */
			sourceAggregation: {type: "string", defaultValue: null}
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
				allowPreventDefault: true
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

	DragInfo.prototype.isDraggable = function(oControl) {
		if (!this.getEnabled()) {
			return false;
		}

		var oDragSource = this.getParent();
		if (!oDragSource) {
			return false;
		}

		// draggable by default
		var sSourceAggregation = this.getSourceAggregation();
		var oMetadata = oDragSource.getMetadata().getDragDropInfo(sSourceAggregation);
		if (!oMetadata.draggable) {
			jQuery.sap.log.warning((sSourceAggregation ? sSourceAggregation + " aggregation of " : "") + oDragSource + " is not configured to be draggable");
			return false;
		}

		// control itself is the drag source
		if (oDragSource === oControl && !sSourceAggregation) {
			return true;
		}

		// control is in the aggregation of the drag source
		if (oControl.getParent() === oDragSource && sSourceAggregation === oControl.sParentAggregationName) {
			return true;
		}

		return false;
	};

	DragInfo.prototype.fireDragStart = function(oEvent) {
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

	DragInfo.prototype.fireDragEnd = function(oEvent) {
		if (!oEvent || !oEvent.dragSession) {
			return;
		}

		var oDragSession = oEvent.dragSession;
		return this.fireEvent("dragEnd", {
			dragSession: oDragSession,
			browserEvent: oEvent.originalEvent,
			target: oDragSession.getDragControl()
		});
	};

	return DragInfo;

}, /* bExport= */ true);