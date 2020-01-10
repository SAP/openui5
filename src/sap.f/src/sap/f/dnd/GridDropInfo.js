/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/dnd/DropInfo",
	"sap/f/dnd/GridDragOver",
	"sap/base/Log"
], function(
	coreLibrary,
	DropInfo,
	GridDragOver,
	Log
) {
	"use strict";

	/**
	 * Constructor for a new GridDropInfo.
	 *
	 * @param {string} [sId] ID for the new DropInfo, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the GridDropInfo
	 *
	 * @class
	 * Provides enhanced configuration for drop operations inside grid-based controls.
	 *
	 * If drop position is <code>Between</code> and drop layout is <code>Horizontal</code>, this drop configuration will provide enhanced visualization and interaction, better suited for grid items.
	 * It will show a drop indicator which mimics the size of the dragged item and shows the potential drop position inside the grid.
	 * The indicator will push away other grid items, showing the correct arrangement calculated by the grid’s auto-placement algorithm.
	 *
	 * When position is different than <code>Between</code> or layout is not <code>Horizontal</code>, the drag and drop will look and behave like the general <code>{@link sap.ui.core.dnd.DropInfo}</code>.
	 *
	 * <b>Note:</b> This configuration might be ignored due to control {@link sap.ui.core.Element.extend metadata} restrictions.
	 *
	 * @extends sap.ui.core.dnd.DropInfo
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @experimental Since 1.68 This class is experimental. The API may change.
	 * @since 1.68
	 * @alias sap.f.dnd.GridDropInfo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GridDropInfo = DropInfo.extend("sap.f.dnd.GridDropInfo", /** @lends sap.f.dnd.GridDropInfo.prototype */ { metadata: {
		library: "sap.ui.core",
		interfaces: [
			"sap.ui.core.dnd.IDropInfo"
		],
		properties: {
			/**
			 * A function which will define the desired drop indicator size. The drop indicator shows the user how the grid will rearrange after drop.
			 *
			 * Use when custom size needs to be defined. For example when an item is dragged from outside a grid and is dropped over the grid.
			 *
			 * If not specified or if the function returns <code>null</code>, the indicator size will be calculated automatically.
			 *
			 * This callback will be called when the indicator is displayed, that happens during the drag over movement.
			 *
			 * The callback receives <code>draggedControl</code> as parameter and must return an object of type <code>{rows: <int>, columns: <int>}</code> or <code>null</code>.
			 */
			dropIndicatorSize: {
				type: "function",
				invalidate: false,
				parameters: {
					/**
					 * The control which is currently being dragged.
					 */
					draggedControl: {type: "sap.ui.core.Control"}
				}
			}
		}
	}});

	GridDropInfo.prototype.isDroppable = function(oControl, oEvent) {
		if (!this._shouldEnhance()) {
			return DropInfo.prototype.isDroppable.apply(this, arguments);
		}

		if (!this.getEnabled()) {
			return false;
		}

		if (!oControl || !oEvent) {
			return false;
		}

		var oDropTarget = this.getDropTarget();
		if (!oDropTarget) {
			return false;
		}

		// if target aggregation is configured, the dom element containing this aggregation is a drop target
		var oAggregationDomRef = oDropTarget.getDomRefForSetting(this.getTargetAggregation());
		if (oAggregationDomRef && oAggregationDomRef.contains(oEvent.target)) {
			// mark the event for the found aggregation name
			oEvent.setMark("DragWithin", this.getTargetAggregation());
			return true;
		}

		// if aggregation dom ref is not configured, the whole control is a drop target
		if (!oAggregationDomRef && oDropTarget === oControl) {
			return true;
		}

		return false;
	};

	GridDropInfo.prototype.fireDragEnter = function(oEvent) {
		if (!this._shouldEnhance()) {
			return DropInfo.prototype.fireDragEnter.apply(this, arguments);
		}

		if (!oEvent || !oEvent.dragSession || !oEvent.dragSession.getDragControl()) {
			return null;
		}

		// hide the original indicator
		this._hideDefaultIndicator(oEvent);

		var gridDragOver = GridDragOver.getInstance(),
			oDragControl = oEvent.dragSession.getDragControl();

		if (this.getDropIndicatorSize()) {
			gridDragOver.setDropIndicatorSize(this.getDropIndicatorSize()(oDragControl));
		}

		gridDragOver.setCurrentContext(
			oEvent.dragSession.getDragControl(),
			this.getDropTarget(),
			this.getTargetAggregation()
		);

		var mDropPosition = gridDragOver.getSuggestedDropPosition();

		var eventResult = this.fireEvent("dragEnter", {
			dragSession: oEvent.dragSession,
			browserEvent: oEvent.originalEvent,
			target: mDropPosition ? mDropPosition.targetControl : null
		}, true);

		if (eventResult) {
			gridDragOver.handleDragOver(oEvent);
		}

		return eventResult;
	};

	GridDropInfo.prototype.fireDragOver = function(oEvent) {
		if (!this._shouldEnhance()) {
			return DropInfo.prototype.fireDragOver.apply(this, arguments);
		}

		if (!oEvent || !oEvent.dragSession || !oEvent.dragSession.getDragControl()) {
			return null;
		}

		// hide the original indicator
		this._hideDefaultIndicator(oEvent);

		var mDropPosition = this._suggestDropPosition(oEvent);

		if (mDropPosition && oEvent.dragSession) {
			oEvent.dragSession.setDropControl(mDropPosition.targetControl);
			// mDropPosition.position may be different than oEvent.dragSession.getDropPosition, since the second is calculated inside DragAndDrop.js.
			// This can be fixed by having a method oEvent.dragSession.setDropPosition
		}

		return this.fireEvent("dragOver", {
			dragSession: oEvent.dragSession,
			browserEvent: oEvent.originalEvent,
			target: mDropPosition ? mDropPosition.targetControl : null,
			dropPosition: mDropPosition ? mDropPosition.position : null
		});
	};

	GridDropInfo.prototype.fireDrop = function(oEvent) {
		if (!this._shouldEnhance()) {
			return DropInfo.prototype.fireDrop.apply(this, arguments);
		}

		if (!oEvent || !oEvent.dragSession || !oEvent.dragSession.getDragControl()) {
			return null;
		}

		var oDragSession = oEvent.dragSession,
			gridDragOver = GridDragOver.getInstance(),
			mDropPosition;

		gridDragOver.setCurrentContext(
			oDragSession.getDragControl(),
			this.getDropTarget(),
			this.getTargetAggregation()
		);

		mDropPosition = gridDragOver.getSuggestedDropPosition();

		this.fireEvent("drop", {
			dragSession: oEvent.dragSession,
			browserEvent: oEvent.originalEvent,
			dropPosition: mDropPosition ? mDropPosition.position : null,
			draggedControl: oDragSession.getDragControl(),
			droppedControl: mDropPosition ? mDropPosition.targetControl : null
		});

		gridDragOver.scheduleEndDrag();
	};

	/**
	 * Should the drag and drop be enhanced with target drop area.
	 * It works for drop position "Between" and "Horizontal" layout.
	 * @private
	 * @returns {boolean} Should it be enhanced.
	 */
	GridDropInfo.prototype._shouldEnhance = function() {
		if (this._bShouldEnhance === undefined) {
			if (!this.getParent().isA("sap.f.dnd.IGridDroppable")) {
				Log.error("The control which uses 'sap.f.dnd.GridDropInfo' has to implement 'sap.f.dnd.IGridDroppable'.", "sap.f.dnd.GridDropInfo");
				this._bShouldEnhance = false;
				return this._bShouldEnhance;
			}

			this._bShouldEnhance = this.getDropPosition() === coreLibrary.dnd.DropPosition.Between
				&& this.getDropLayout() === coreLibrary.dnd.DropLayout.Horizontal;
		}

		return this._bShouldEnhance;
	};

	/**
	 * Suggests a drop position for the given drag event.
	 * @private
	 * @param {jQuery.Event} oDragEvent The drag event
	 * @returns {Object} The suggested position
	 */
	GridDropInfo.prototype._suggestDropPosition = function(oDragEvent) {
		if (!oDragEvent.dragSession || !oDragEvent.dragSession.getDragControl()) {
			return null;
		}

		var gridDragOver = GridDragOver.getInstance();

		gridDragOver.setCurrentContext(
			oDragEvent.dragSession.getDragControl(),
			this.getDropTarget(),
			this.getTargetAggregation()
		);

		gridDragOver.handleDragOver(oDragEvent);

		return gridDragOver.getSuggestedDropPosition();
	};

	/**
	 * Hide original indicator
	 * @private
	 * @param {jQuery.Event} oDragEvent The drag event
	 */
	GridDropInfo.prototype._hideDefaultIndicator = function(oDragEvent) {
		oDragEvent.dragSession.setIndicatorConfig({
			visibility: "hidden",
			position: "relative" // this prevents a scroll to appear sometimes on the page
		});
	};

	return GridDropInfo;

});
