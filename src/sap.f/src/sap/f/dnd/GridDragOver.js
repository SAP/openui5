/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/base/Object', "sap/ui/thirdparty/jquery", "sap/base/Log"],
	function(BaseObject, jQuery, Log) {
	"use strict";

	/**
	 * Handles dragging of a control over a given grid container.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @private
	 * @constructor
	 * @alias sap.f.dnd.GridDragOver
	 */
	var GridDragOver = BaseObject.extend("sap.f.dnd.GridDragOver", {
		/**
		 * @type {Number} The timeout to hold on same position, before drop is suggested
		 */
		_iTimeoutBeforeDrop: 200,

		/**
		 * @type {jQuery} The indicator to show in the grid
		 */
		_$indicator: jQuery("<div class='sapUiDnDGridIndicator'></div>"),

		/**
		 * Constructor.
		 */
		constructor: function() {
			// prepare drag end delegate for later use
			this._oDragControlDelegate = {
				ondragend: this.scheduleEndDrag
			};

			this._oDropContainerDelegate = {
				ondragleave: this._onDragLeave
			};
		},

		/**
		 * Destroyer.
		 */
		destroy: function () {
			this._oDragEndDelegate = null;
		}
	});

	/**
	 * Sets in what context the drag happens.
	 * @public
	 * @param {sap.ui.core.Control} oDragControl The control which is dragged
	 * @param {sap.ui.core.Control} oDropContainer The drop container
	 * @param {string} sTargetAggregation The name of the target aggregation inside the drop container
	 * @returns {sap.f.dnd.GridDragOver} Self for method chaining
	 */
	GridDragOver.prototype.setCurrentContext = function (oDragControl, oDropContainer, sTargetAggregation) {
		if (this._oDragControl === oDragControl
			&& this._oDropContainer === oDropContainer
			&& this._sTargetAggregation === sTargetAggregation) {
			// context is already set
			return this;
		}

		if (this._oDragControl && this._oDragControl !== oDragControl) {
			// finalize previous drag if not finished
			this.endDrag();
		}

		this._oDragControl = oDragControl;
		this._oDropContainer = oDropContainer;
		this._sTargetAggregation = sTargetAggregation;

		this._mDragItemDimensions = this._getDimensions(oDragControl);
		this._bIsInSameContainer = oDragControl.getParent() === oDropContainer;

		if (this._bIsInSameContainer) {
			this._iDragFromIndex = oDropContainer.indexOfAggregation(sTargetAggregation, oDragControl);
		} else {
			this._iDragFromIndex = null;
		}

		oDropContainer.getAggregation(sTargetAggregation).forEach(function (oControl) {
			oControl.addStyleClass("sapUiDnDGridControl"); // helps with locating the controls later
		});

		this._attachEventDelegates();

		return this;
	};

	/**
	 * Handles the actual drag over event.
	 * Calculates where to show drop indicator based on drag over event.
	 * @public
	 * @param {jQuery.Event} oDragEvent The jQuery drag event
	 */
	GridDragOver.prototype.handleDragOver = function(oDragEvent) {
		// prevent infinite move of position, caused by rearranging
		if (this._shouldFreeze(oDragEvent.pageX, oDragEvent.pageY)) {
			return;
		}

		// propose a drop position
		var mDropPosition = this._calculateDropPosition(oDragEvent);

		if (!mDropPosition) {
			// drop position is the indicator
			return;
		}

		// After some timeout - show the drop target
		if (this._timeoutOnSamePosition(mDropPosition)) {
			// should not indicate if target is the same control
			if (mDropPosition.targetControl === this._oDragControl) {
				return;
			}

			this._hideDraggedItem();
			this._showIndicator(mDropPosition, oDragEvent);
			// prevent infinite move of position, caused by rearranging
			this._freezeCurrentPosition(oDragEvent.pageX, oDragEvent.pageY);
		}
	};

	/**
	 * @typedef {Object} DropPosition
	 * @property {sap.ui.core.Control} targetControl The control over which, or next to which is the suggested drop position.
	 * @property {string} position Is it before or after the target control. Possible values are <code>Before</code> and <code>After</code>.
	 */

	/**
	 * What is the suggested drop position.
	 * @public
	 * @returns {DropPosition} The suggested position
	 */
	GridDragOver.prototype.getSuggestedDropPosition = function() {
		return this._mLastDropPosition;
	};

	/**
	 * Sets a custom size in rows and columns for the indicator. Use to override the default one.
	 * @public
	 * @param {object} mIndicatorSize The custom indicator size
	 * @param {int} mIndicatorSize.rows The number of rows to occupy
	 * @param {int} mIndicatorSize.columns The number of columns to occupy
	 */
	GridDragOver.prototype.setDropIndicatorSize = function(mIndicatorSize) {
		if (!mIndicatorSize) {
			this._mDropIndicatorSize = null;
			return;
		}

		if (!mIndicatorSize.rows || !mIndicatorSize.columns) {
			Log.error("Custom indicator size for grid drag and drop is not valid. It must be an object with rows and columns properties: '{rows: <int>, columns: <int>}'.");
			this._mDropIndicatorSize = null;
			return;
		}

		this._mDropIndicatorSize = mIndicatorSize;
	};

	/**
	 * Schedule the execution of end drag which will hide the indicator and show the control.
	 */
	GridDragOver.prototype.scheduleEndDrag = function() {
		if (!this._isDragActive()) {
			return;
		}

		var oBinding = this._oDropContainer.getBindingInfo(this._sTargetAggregation);
		if (oBinding && oBinding.template) {
			// if there is template binding for target aggregation, wait for the framework to update items and then hide the indicator
			setTimeout(this.endDrag.bind(this), 0);
		} else {
			// if there is no template binding for target aggregation, execute endDrag immediately
			this.endDrag();
		}
	};

	/**
	 * Clean up after dragging is finished. This will hide the indicator and show the dragged control.
	 * Use <code>scheduleEndDrag</code> if cleanup should be scheduled for a different tick and not executed immediately.
	 */
	GridDragOver.prototype.endDrag = function() {
		if (!this._isDragActive()) {
			return;
		}

		this._$indicator.detach();

		// this._oDragControl.setVisible(true); // todo
		this._showDraggedItem();

		this._removeEventDelegates();

		// fire private event for handling IE specific layout fixes
		this._oDropContainer.fireEvent("_gridPolyfillAfterDragEnd", {
			indicator: this._$indicator
		});

		this._$indicator.attr("style", ""); // VirtualGrid sets position 'absolute' to the indicator, which breaks calculations in other containers, such as GridList
		this._mDropIndicatorSize = null;
		this._oDragControl = null;
		this._oDropContainer = null;
		this._sTargetAggregation = null;

		this._iDragFromIndex = null;
		this._iDropPositionHoldStart = null;
		this._mLastDropPosition = null;
		this._mFreezePosition = null;
	};

	/**
	 * Is the drag still active or it has ended.
	 * @returns {bool} True if the drag is still active, false if it was ended.
	 */
	GridDragOver.prototype._isDragActive = function() {
		return this._oDragControl && this._oDropContainer;
	};

	/**
	 * Shows the drop indicator at the suggested position.
	 * @param {DropPosition} mDropPosition The suggested position.
	 * @param {jQuery.Event} oDragEvent The jQuery drag event.
	 */
	GridDragOver.prototype._showIndicator = function(mDropPosition, oDragEvent) {
		var $targetGridItem = this._findContainingGridItem(mDropPosition.targetControl),
			$insertTarget = $targetGridItem || mDropPosition.targetControl.$(),
			mStyles;

		if (this._oDropContainer.isA("sap.f.GridContainer")) {
			// todo: find better way to find the item wrapper when it is not grid item, needed for IE
			$insertTarget = $insertTarget.closest(".sapFGridContainerItemWrapper");
		}

		if (this._mDropIndicatorSize) {
			mStyles = {
				"grid-row-start": "span " + this._mDropIndicatorSize.rows,
				"grid-column-start": "span " + this._mDropIndicatorSize.columns
			};
		} else if ($targetGridItem) { // target container is a grid
			// indicator should be the same size as dragged item
			mStyles = {
				"grid-column-start": this._mDragItemDimensions.columnsSpan,
				"grid-row-start": this._mDragItemDimensions.rowsSpan
			};
		}

		if (mStyles) {
			this._$indicator.css(mStyles);
		}

		if (mDropPosition.position == "Before") {
			this._$indicator.insertBefore($insertTarget);
		} else {
			this._$indicator.insertAfter($insertTarget);
		}

		this._$indicator.show();

		// when drop indicator is shown, it becomes the new "drag from"
		this._iDragFromIndex = this._$indicator.index();

		/* IE Polyfill */

		// Let the container decide the dimensions of the indicator.
		var oEventData = {
			indicator: this._$indicator
		};

		if (this._mDropIndicatorSize) {
			oEventData.rows = this._mDropIndicatorSize.rows;
			oEventData.columns = this._mDropIndicatorSize.columns;
		} else {
			oEventData.width = this._mDragItemDimensions.rect.width;
			oEventData.height = this._mDragItemDimensions.rect.height;
		}

		// fire private event for handling IE specific layout fixes
		this._oDropContainer.fireEvent("_gridPolyfillAfterDragOver", oEventData);
	};

	/**
	 * Hides the control that is currently dragged.
	 */
	GridDragOver.prototype._hideDraggedItem = function() {
		this._oDragControl.$().hide();
		// this._oDragControl.setVisible(false); // todo, this brakes the drag session

		var $gridItem = this._findContainingGridItem(this._oDragControl);
		if ($gridItem) {
			$gridItem.hide();
		}
	};

	/**
	 * Shows the control that is currently dragged.
	 */
	GridDragOver.prototype._showDraggedItem = function() {

		if (this._oDragControl.getDomRef()) {
			this._oDragControl.$().show();
		}
		// this._oDragControl.setVisible(false); // todo, this brakes the drag session

		var $gridItem = this._findContainingGridItem(this._oDragControl);
		if ($gridItem) {
			$gridItem.show();
		}

	};

	/**
	 * Checks if the user holds the same drop position for some time.
	 * @param {DropPosition} mDropPosition The suggested position
	 * @returns {boolean} If the position is hold
	 */
	GridDragOver.prototype._timeoutOnSamePosition = function(mDropPosition) {
		if (!this._mLastDropPosition
			|| mDropPosition.targetControl !== this._mLastDropPosition.targetControl
			|| mDropPosition.position != this._mLastDropPosition.position) {

			this._iDropPositionHoldStart = Date.now();
			this._mLastDropPosition = mDropPosition;
			return false;
		}

		// if the drop position is hold for
		return Date.now() - this._iDropPositionHoldStart > this._iTimeoutBeforeDrop;
	};

	/**
	 * Prevents infinite move of position, caused by the rearrangement.
	 * @param {Number} iPageX Mouse x
	 * @param {Number} iPageY Mouse y
	 * @returns {boolean} Should suggested position freeze
	 */
	GridDragOver.prototype._shouldFreeze = function(iPageX, iPageY) {

		var iTolerance = 20; // if mouse is moved more than this tolerance, the freeze stops

		return this._mFreezePosition
			&& Math.abs(this._mFreezePosition.pageX - iPageX) < iTolerance
			&& Math.abs(this._mFreezePosition.pageY - iPageY) < iTolerance;
	};

	/**
	 * Prevents infinite move of position, caused by the rearrangement.
	 * Saves the current position
	 * @param {Number} iPageX Mouse x
	 * @param {Number} iPageY Mouse y
	 */
	GridDragOver.prototype._freezeCurrentPosition = function(iPageX, iPageY) {
		this._mFreezePosition = {
			pageX: iPageX,
			pageY: iPageY
		};
	};

	/**
	 * Calculates where the drop position should be.
	 * @param {jQuery.Event} oDragEvent The jQuery drag event
	 * @returns {DropPosition} Suggested drop position
	 */
	GridDragOver.prototype._calculateDropPosition = function(oDragEvent) {
		var $target = this._findItemFromPoint(oDragEvent.pageX, oDragEvent.pageY),
			mCloseTarget,
			oTargetControl,
			sBeforeOrAfter;

		if (!$target) {
			mCloseTarget = this._findClosestItem(oDragEvent.pageX, oDragEvent.pageY);
		}

		if (mCloseTarget) {
			$target = mCloseTarget.target;
		}

		if (mCloseTarget && mCloseTarget.direction === "Left") {
			sBeforeOrAfter = "After";
		}

		if (!$target) {
			// fallback to last item in the target
			$target = this._getLastItem();
			sBeforeOrAfter = "After";
		}

		if ($target.hasClass("sapUiDnDGridIndicator")) {
			// the indicator is the target
			return null;
		}

		oTargetControl = $target.control(0, true);

		if (!sBeforeOrAfter) {
			sBeforeOrAfter = this._calculateDropBeforeOrAfter(oTargetControl, oDragEvent);
		}

		return {
			targetControl: oTargetControl,
			position: sBeforeOrAfter
		};
	};

	/**
	 * Calculates where should it drop - before or after the target.
	 * @param {sap.ui.core.Control} oTargetControl The drop target
	 * @param {jQuery.Event} oDragEvent The jQuery drag event
	 * @returns {string} <code>Before</code> or <code>After</code>
	 */
	GridDragOver.prototype._calculateDropBeforeOrAfter = function(oTargetControl, oDragEvent) {
		var mDimensions = this._getDimensions(oTargetControl),
			mClientRect = mDimensions.rect;

		// drop on same control
		if (this._oDragControl === oTargetControl) {
			return "Before";
		}

		// if small item is over big item - calculate relative position
		if ((this._mDragItemDimensions.rect.width * 1.5) < mClientRect.width) {
			/* mostly copied from DragAndDrop.js */
			var iPageXOffset = window.pageXOffset,
				mDropRect = {
					left: mClientRect.left + iPageXOffset,
					width: mClientRect.width
				},
				iCursorX = oDragEvent.pageX - mDropRect.left;

			return iCursorX < mDropRect.width * 0.5 ? "Before" : "After";
		}

		// for same size items - try to place the drag item on the position of the target item by comparing the indexes

		// if items are from different containers, drag item will be new and should push other items
		if (this._iDragFromIndex === null) {
			return "Before";
		}

		// if drag item is originally After the target item - put the drag item in front of target, so it will push it
		var iTargetIndex = this._oDropContainer.indexOfAggregation(this._sTargetAggregation, oTargetControl);
		if (this._iDragFromIndex > iTargetIndex) {
			return "Before";
		}

		// fallback to After
		return "After";
	};

	/**
	 * Gets dimensions of a control in the context of grid.
	 * @param {sap.ui.core.Control} oControl The control
	 * @returns {Object} The dimensions
	 */
	GridDragOver.prototype._getDimensions = function(oControl) {
		var $gridItem = this._findContainingGridItem(oControl);

		if ($gridItem) {
			return {
				rect: $gridItem[0].getBoundingClientRect(),
				columnsSpan: $gridItem.css("grid-column-start"),
				rowsSpan: $gridItem.css("grid-row-start")
			};
		}

		return {
			rect: oControl.getDomRef().getBoundingClientRect(),
			columnsSpan: "span 1", // fallback to 1 row and 1 column
			rowsSpan: "span 1"
		};
	};

	/**
	 * Finds if the control is contained in grid item and returns it.
	 * @param {sap.ui.core.Control} oControl The control
	 * @returns {jQuery|null} The grid item which contains the control. If any.
	 */
	GridDragOver.prototype._findContainingGridItem = function(oControl) {
		var $control = oControl.$(),
			sDisplay = $control.parent().css("display");

		if (sDisplay === "grid" || sDisplay === "inline-grid") {
			return $control;
		}

		// if there is a wrapping element
		sDisplay = $control.parent().parent().css("display");
		if (sDisplay === "grid" || sDisplay === "inline-grid") {
			return $control.parent();
		}

		return null;
	};

	/**
	 * Gets the last control in the target aggregation.
	 * @returns {jQuery|null} The last item
	 */
	GridDragOver.prototype._getLastItem = function () {
		var aItems = this._oDropContainer.getAggregation(this._sTargetAggregation),
			$target;

		if (aItems.length) {
			$target = aItems[aItems.length - 1].$();
		}

		return $target;
	};

	/**
	 * Gets the control from target aggregation which is on the given position (if any).
	 * @param {Number} iPageX Mouse x
	 * @param {Number} iPageY Mouse y
	 * @returns {jQuery|null} The jQuery ref of the control which is on this position
	 */
	GridDragOver.prototype._findItemFromPoint = function(iPageX, iPageY) {
		var oOverElement = document.elementFromPoint(iPageX, iPageY),
			$closestItem = jQuery(oOverElement).closest(".sapUiDnDGridControl, .sapUiDnDGridIndicator");

		if ($closestItem.hasClass("sapUiDnDGridIndicator")) {
			// drag over the indicator
			return $closestItem;
		}

		if ($closestItem.hasClass("sapUiDnDGridControl")) {
			return $closestItem;
		}

		return null;
	};

	/**
	 * Gets the closest control from target aggregation which is on the given position (if any).
	 * @param {Number} iPageX Mouse x
	 * @param {Number} iPageY Mouse y
	 * @returns {jQuery|null} The jQuery ref of the control which is closest to this position
	 */
	GridDragOver.prototype._findClosestItem = function(iPageX, iPageY) {
		// note: this method can be improved, currently it handles most of the cases, but not all of them

		// try around
		var bIsRtl = sap.ui.getCore().getConfiguration().getRTL(),
			iIsRtlModifier = bIsRtl ? -1 : 1,
			iStepX = 80 * iIsRtlModifier, // px
			iStepY = 20, // px
			$found,
			sDirection,
			iTries = 0,
			iX = iPageX - iStepX;

		 // try left
		while (!$found && iX > 0 && iTries < 4) {
			$found = this._findItemFromPoint(iX, iPageY);
			iX -= iStepX;
			iTries++;
		}

		if ($found) {
			sDirection = "Left";
		}

		// try upwards, only in close proximity
		if (!$found && iPageY - iStepY > 0) {
			$found = this._findItemFromPoint(iPageX, iPageY - 20);
			sDirection = "Top";
		}

		return {
			target: $found,
			direction: sDirection
		};
	};

	/**
	 * Removes event delegates from drop container and drag control.
	 */
	GridDragOver.prototype._removeEventDelegates = function() {
		if (this._oDropContainer) {
			this._oDropContainer.removeEventDelegate(this._oDropContainerDelegate);
		}

		if (this._oDragControl) {
			this._oDragControl.removeEventDelegate(this._oDragControlDelegate);
		}
	};

	/**
	 * Attaches event delegates to the container over which we currently drag and the dragged control.
	 */
	GridDragOver.prototype._attachEventDelegates = function() {
		this._removeEventDelegates(); // make sure we attach only once
		this._oDragControl.addEventDelegate(this._oDragControlDelegate, this);
		this._oDropContainer.addEventDelegate(this._oDropContainerDelegate, this);
	};

	/**
	 * Ends the drag on drag leave.
	 * @param {jQuery.Event} oEvent The jQuery dragleave event.
	 */
	GridDragOver.prototype._onDragLeave = function(oEvent) {
		var oElement = document.elementFromPoint(oEvent.pageX, oEvent.pageY),
			bIsElementWithinDropContainer = this._oDropContainer.getDomRef().contains(oElement);

		// Check if element from point is inside the drop container, because dragleave
		// can be fired even when the control is inside the drop container.
		if (!bIsElementWithinDropContainer) {
			this.scheduleEndDrag();
		}
	};


	/**
	 * Holds the instance of the current drag.
	 * It is logical to have only 1 drag at a time.
	 * @type {sap.f.dnd.GridDragOver}
	 */
	var oInstance;

	/**
	 * Gets the singleton object responsible for dragging over a container.
	 * It is logical to have only 1 drag at a time.
	 * @public
	 * @static
	 * @returns {sap.f.dnd.GridDragOver} The drag
	 */
	GridDragOver.getInstance = function () {
		if (!oInstance) {
			oInstance = new GridDragOver();
		}

		return oInstance;
	};

	return GridDragOver;

});
