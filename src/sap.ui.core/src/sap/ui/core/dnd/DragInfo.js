/*!
 * ${copyright}
 */

sap.ui.define(["./DragDropBase"],
	function(DragDropBase) {
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

	/**
	 * Provides DragInfo mixin for the subclasses that need DragInfo functionalities.
	 *
	 * @private
	 * @mixin
	 * @since 1.87
	 */
	DragInfo.Mixin = function() {

		this.isDraggable = function(oControl) {
			if (!this.getEnabled()) {
				return false;
			}

			var oDragSource = this.getParent();
			if (!oDragSource) {
				return false;
			}

			// metadata restrictions
			var sSourceAggregation = this.getSourceAggregation();
			if (!this.checkMetadata(oDragSource, sSourceAggregation, "draggable")) {
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

		this.fireDragStart = function(oEvent) {
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

		this.fireDragEnd = function(oEvent) {
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

		this.setEnabled = function(bEnabled) {
			this.setProperty("enabled", bEnabled, false);
			this.invalidateDraggables();
			return this;
		};

		this.setParent = function() {
			DragDropBase.prototype.setParent.apply(this, arguments);
			this.invalidateDraggables();
			return this;
		};

		this.setSourceAggregation = function(sSourceAggregation) {
			var sOldSourceAggregation = this.getSourceAggregation();
			if (sOldSourceAggregation == sSourceAggregation) {
				return this;
			}

			sOldSourceAggregation && this.invalidateDraggables();
			this.setProperty("sourceAggregation", sSourceAggregation, false);
			this.invalidateDraggables();
			return this;
		};

		this.invalidateDraggables = function() {
			var oParent = this.getParent();
			if (oParent && oParent.bOutput == true) {
				var sSourceAggregation = this.getSourceAggregation();
				if (sSourceAggregation) {
					[].concat(oParent.getAggregation(sSourceAggregation)).forEach(function(oAggregation) {
						if (oAggregation && oAggregation.bOutput == true) {
							oAggregation.invalidate();
						}
					});
				} else {
					oParent.invalidate();
				}
			}
		};

	};

	DragInfo.Mixin.apply(DragInfo.prototype);

	return DragInfo;

});