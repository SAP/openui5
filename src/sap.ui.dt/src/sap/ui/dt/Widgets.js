/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.Widgets.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/Utils'
],
function(jQuery, Utils) {
	"use strict";

	/**
	 * Constructor for a new Widgets instance.
	 * 
	 * @param {sap.ui.dt.DesignTime} oDesignTime The design time object
	 *
	 * @class
	 * The Widgets is responsible for operations on many widgets, 
	 * by listening on the eventBus, e.g.
	 * <ul>
	 * <li>D&D - Show and remove drop targets</li>
	 * <li>Holds the current selection</li>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.Widgets
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var Widgets = function(oDesignTime) {
		this.eventBus = oDesignTime.oEventBus;
		this._getRootControl = function() {
			return oDesignTime.getRootControl();
		};
		this.droppables = [];
		this.oDraggedControl = null;
		this.sPreviousDragOverId = null;
		this.sPreviousStamp = null;
		this.oScope = oDesignTime.oScope;
		this._initSubscriptions();
	};

	function getWYSWYGChildren(aList, oElement, oDraggedControl) {
		return aList.concat(checkChildren(oElement.__widget.getChildren(), oDraggedControl));
	}
	// checkChildren :: [Control] -> Control -> Maybe [Control]

	function checkChildren(aControlChildren, oDraggedControl) {
		var aNewList = [];
		// remove unwanted controls
		aControlChildren.filter(function(oElement) {
			var oElementDT = oElement.__widget.getDesignTimeOptions();
			if (oElementDT && oElementDT.isntDropTarget === true) {
				return false;
			}
			return oElement !== oDraggedControl;
		}).forEach(function(oElement) {
			if (oElement.__widget.accepts(oDraggedControl)[0]) {
				aNewList.push(oElement);
			} else if (oElement.__widget) {
				aNewList = getWYSWYGChildren(aNewList, oElement, oDraggedControl);
			}
		});
		return aNewList;
	}

	Widgets.prototype.getDroppables = function() {
		var aAccepts;
		this.droppables = this.droppables.filter(function(oDroppable) {
			return !!(oDroppable.$().is(":visible") && oDroppable !== this.oDraggedControl && oDroppable.__widget
					.accepts(this.oDraggedControl)[0]);
		}, this);

		if (this.droppables.length === 0) {
			var oRootControl = this._getRootControl();
			aAccepts = oRootControl.__widget.accepts(this.oDraggedControl);
			if (aAccepts[0]) {
				this.droppables = [ oRootControl ];
			} else {
				this.droppables = checkChildren([ oRootControl ], this.oDraggedControl);
			}
		}
		return this.droppables;
	};

	/**
	 *
	 * @param fromPalette if not from palette the parent of the draggedControl becomes the droppable context
	 * @param droppables these are the droppables that represent the current droppable context (before the recalculation)
	 * @param selectedControl if the user is dragging from the palette and the currently selected control accepts the
	 * dragged control, then the latter shall become the droppable context
	 *
	 *  @param draggedControl
	 *  @param toggle whether the user has indicated that they would like to change to the next droppable context (e.g. by pressing Ctrl)
	 *
	 */
	Widgets.prototype.recalculateDroppableAreas = function(fromPalette, droppables, selectedControl,
			draggedControl, toggle) {

		if (toggle) {
			return this.getDroppablesChildren();
		}

		if (!fromPalette) {
			return [ draggedControl.__widget.getDTView().presenter._getFirstSelectableParent(draggedControl) ];
		}

		if (selectedControl &&
			!!( selectedControl.$().is(":visible") &&
				selectedControl !== draggedControl &&
				selectedControl.__widget.accepts(draggedControl)[0] ) &&
			selectedControl.__widget.getDesignTimeOptions().isntDropTarget === false
			) {
			return [ selectedControl ];
		}

		return this.getDroppables();
	};

	Widgets.prototype.getDroppablesChildren = function() {
		var aNewList = [];

		// Extend droppables which come from drop target adjustments
		var that = this;
		this.droppables.forEach( function(oDroppable) {
			var oControlMetadata = oDroppable.getMetadata();
			var oWidget = oDroppable.__widget;
			if (!oWidget) { return; }

			var mAggregationsMetadata = oControlMetadata.getAggregations();
			for ( var sAggregation in mAggregationsMetadata ) {
				var fnAdjustDropTarget = oWidget.getAggregationsAdapterFunction( sAggregation, "adjustDropTarget");
				if (fnAdjustDropTarget) {
					var oDropTarget = fnAdjustDropTarget.call( oDroppable, mAggregationsMetadata[sAggregation] );
					if (oDropTarget && oDropTarget.control) {
						that.droppables.push(oDropTarget.control);
					}
				}
			}
		});

		// Determine the new set of droppables
		this.droppables.forEach(function(oElement) {
			aNewList = getWYSWYGChildren(aNewList, oElement, this.oDraggedControl);
		}, this);
		this.droppables = aNewList;
		this.getDroppables();

		return this.droppables;
	};

	Widgets.prototype.getDraggable = function() {
		return this.oDraggedControl;
	};

	Widgets.prototype.setDraggable = function(oControl) {
		this.oDraggedControl = oControl;
	};

	Widgets.prototype.getPreviousDragOverId = function() {
		return this.sPreviousDragOverId;
	};

	Widgets.prototype.setPreviousDragOverId = function(sId) {
		this.sPreviousDragOverId = sId;
	};

	Widgets.prototype.getPrevisousStamp = function() {
		return this.sPreviousStamp;
	};

	Widgets.prototype.setPrevisousStamp = function(sStamp) {
		this.sPreviousStamp = sStamp;
	};

	/*
	 * @private
	 */
	Widgets.prototype._initSubscriptions = function() {

		var that = this;

		function isDraggingFromPalette(oDraggedControl) {
			var oParent = oDraggedControl.getParent();
			return !(oParent && oParent.getId() !== that.oScope.getDropAreaId());
		}

		function enableContainers(oDroppables, oDraggedControl) {
			if (!oDroppables || !oDroppables[0] || !oDraggedControl) {
				jQuery.sap.log.warning("No draggables or droppables found!");
				return;
			}
			for (var i = oDroppables.length - 1; i >= 0; i--) {
				oDroppables[i].__widget.getDTView().presenter.enableEligibleContainers(oDraggedControl);
			}
		}

		that.eventBus.subscribe("drag.started", function(channel, path, data) {
			if (!data.oControl) {
				throw new Error("Cannot find the oControl in the the drag.start event");
			}

			that.oDraggedControl = data.oControl;
			that.oDraggedControl.addStyleClass("widget-draggable");

			that.droppables = that.recalculateDroppableAreas(isDraggingFromPalette(that.oDraggedControl), that.droppables,
					that.selectedControl, that.oDraggedControl, false);

			enableContainers(that.droppables, data.oControl);
		});

		that.eventBus.subscribe("drag.ended", function() {
			that.oDraggedControl = null;
			that.sPreviousDragOverId = null;
			that.sPreviousStamp = null;

			//Removing allContent from the DropArea!
			var oUIArea = that.oScope.getUIArea(that.oScope.getDropArea());
			if (oUIArea) {
				oUIArea.removeAllContent();
			}
		});

		that.eventBus.subscribe("droppables.toggle", function handleDroppablesToggle() {
			if (that.oDraggedControl) {
				for (var i = that.droppables.length - 1; i >= 0; i--) {
					that.droppables[i].__widget.getDTView().presenter.disableEligibleContainers();
					that.droppables[i].__widget.getDTView().presenter.stripDraggableControl(that.oDraggedControl);
					that.droppables[i].__widget.getDTView().fixOverlaySize();
				}
				that.droppables = that.recalculateDroppableAreas(isDraggingFromPalette(that.oDraggedControl), that.droppables,
						that.selectedControl, that.oDraggedControl, true);
				enableContainers(that.droppables, that.oDraggedControl);
			}
		});
        
        //TODO: discuss if this is the right way to do it
        // refreshing of handlers for droparea, to be raised in case they get lost or elements are new
		that.eventBus.subscribe("droppables.refresh", function handleDroppablesToggle() {
			enableContainers(that.droppables, that.oDraggedControl);
		});

		that.eventBus.subscribe("control.changeSelection", function handleControlChangeSelection(channel, path, data) {
			// Return if nothing selected yet
			if (!that.selectedControl) {
				return;
			}

			// Determine control to be selected
			var controlToBeSelected;
			if (data.action === "child") {
				if (!that.selectedControl.__widget.oChildControlSelectedBefore) {
					return;
				}
				controlToBeSelected = that.selectedControl.__widget.oChildControlSelectedBefore;
			} else {
				Utils.findParentWYSIWYGAggregation( that.selectedControl, function(oAggregation, oParentControl, aControls) {
					var indexSelectedControl = aControls.indexOf( that.selectedControl );
					if (data.action === "nextSibling") {
						if (aControls.length === 1) {
							return;
						}
						controlToBeSelected = aControls[ (indexSelectedControl + 1) % aControls.length ];
					} else if (data.action === "previousSibling") {
						if (aControls.length === 1) {
							return;
						}
						controlToBeSelected = (indexSelectedControl === 0) ?
							aControls[ aControls.length - 1 ] :
							aControls[ (indexSelectedControl - 1) % aControls.length ];
					} else if (data.action === "parent") {
						if (!oParentControl) {
							return;
						}
						controlToBeSelected = oParentControl;
						oParentControl.__widget.oChildControlSelectedBefore = that.selectedControl;
					}
				});
			}

			// Scroll it into view and select it
			that.eventBus.publish("control.show", {	"oControl": controlToBeSelected	});
			that.eventBus.publish("control.select", { "oControl": controlToBeSelected });
		});

		that.eventBus.subscribe("control.selected", function(channel, path, data) {
			that.selectedControl = data.oControl;
		});

		that.eventBus.subscribe("control.deselected", function() {
			that.selectedControl = null;
		});

	};


	return Widgets;
}, /* bExport= */ true);