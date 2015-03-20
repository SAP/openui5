/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DTWidgetPresenter.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/Object'
],
function(jQuery, BaseObject) {
	"use strict";

	/**
	 * Constructor for a new DTWidgetPresenter.
	 *
	 * @param {sap.ui.dt.DTWidgetView} oView The view object
	 * @param {sap.ui.core.Control} oControl The dragged control
	 *
	 * @class
	 * The DTWidgetPresenter
	 * <ul>
	 * <li> does the D&D drop event handling on DragManager events for the widget </li>
	 * <li> responsible for the drag over and drop behavior on DOM level </li>
	 * <li> works with the Widget and the DTWidgetView </li>
	 * </ul>
	 * 
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.DTWidgetPresenter
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var DTWidgetPresenter = BaseObject.extend("sap.ui.dt.DTWidgetPresenter", /** @lends sap.ui.dt.DTWidgetPresenter.prototype */ {

		constructor: function(oView, oControl) {
			var that = this;
			this.view = oView;
			this.eventBus = oView.eventBus;
			this.oScope = oView.scope;
			this.selected = false;
			this.highlighted = false;
			this.oControl = oControl;
			this.initSubscriptions();
			this.aChildEnabledControls = [];
			this.aEnabledAggregations = [];
			this.dropEnabled = false;
			this.lastX = -1;
			this.lastY = -1;
			this.containerDragEnterOccured = false;

			function getWidgets() {
				return that.view.getWidget().getWidgets();
			}

			this.isEventAllowed = function(e, oControl) {
				var oWidgets = getWidgets();
				return !!((e.timeStamp - oWidgets.getPrevisousStamp()) > 250 || oControl.getId() !== oWidgets.getPreviousDragOverId());
			};

			this.saveTimeStampAndId = function(e, oControl) {
				var oWidgets = getWidgets();
				oWidgets.setPrevisousStamp(e.timeStamp);
				oWidgets.setPreviousDragOverId(oControl.getId());
			};
			
			this._publishControlShowAfterNextRenderingOf = function(oParentControl, oControlToShow){
				var oShowDelegate = {
					onAfterRendering : function(){
						that.eventBus.publish("control.show", {	"oControl": oControlToShow });
						oParentControl.removeEventDelegate(oShowDelegate);
					}
				};
				oParentControl.addEventDelegate(oShowDelegate);
			};

			this.onDragOver = function(e) {
				/*eslint-disable consistent-this */
				var oControl = this;
				/*eslint-enable consistent-this */
				e.preventDefault();
				e.stopPropagation();
				if (e.originalEvent) {
					var event = e.originalEvent;
					if (event.dataTransfer) {
						event.dataTransfer.dropEffect = "move";
					}
					if (event.clientX == that.lastX && event.clientY == that.lastY) {
						return false;
					}
					that.lastX = event.clientX;
					that.lastY = event.clientY;
				}

				if (that.isEventAllowed(e, oControl)) {
					sap.ui.dt.Utils.findParentWYSIWYGAggregation(oControl, function(oAggregation, oParentControl, aControls) {
						var iIndex = aControls.indexOf(oControl);
						var draggable = getWidgets().getDraggable();
						jQuery.sap.log.debug("dragover - addAggregation [" + oAggregation.name + "]: " + draggable.getId() + " over " + oControl.getId());
						oParentControl.__widget.addAggregation(oAggregation.name, draggable, iIndex);
						that._publishControlShowAfterNextRenderingOf(oParentControl, draggable);
					});
				}
				that.saveTimeStampAndId(e, oControl);
			};

			/**
			 * A draggable has entered a drop target container:
			 * Append it to the target conainter
			 * @param  {event} e DOM event
			 * @return {undefined}
			 */
			this.onContainerDragEnter = function(e) {

				// Register container drag enter processing: See comments in this.onContainerDragOverDetected
				that.containerDragEnterOccured = true;

				// Determine control and aggregation of container from DOM element
				e.stopPropagation();
				var oControl = that.oScope.getControl(jQuery(this).attr("data-aggregation-id"));
				var sAggregationName = jQuery(this).attr("data-aggregation");

				// Take drop target adjustment into consideration if specified
				//TODO shouldn't widget encapsulate the adjustDropTarget functionality?
				var oWidgets = getWidgets();
				var oDraggable = oWidgets.getDraggable();
				var fnAdjustDropTarget = oControl.__widget.getAggregationsAdapterFunction(sAggregationName, "adjustDropTarget");
				if (fnAdjustDropTarget) {
					var oAggregationMetadata = oControl.getMetadata().getAggregations()[sAggregationName];
					var oAdjustedDropTarget = fnAdjustDropTarget.call(oControl, oAggregationMetadata);
					if (oAdjustedDropTarget) {
						if (oAdjustedDropTarget.aggregation) { sAggregationName = oAdjustedDropTarget.aggregation.name; }
						if (oAdjustedDropTarget.control) {oControl = oAdjustedDropTarget.control; }
					}
				}

				// Add draggable to last position in drop target aggregation
				if (oControl.__widget.getAggregation(sAggregationName).indexOf(oDraggable) === -1 && (that.isEventAllowed(e, oControl))) {
					oControl.__widget.addAggregation(sAggregationName, oDraggable);
					that._publishControlShowAfterNextRenderingOf(oControl, oDraggable);
					that.saveTimeStampAndId(e, oControl);
				}


			};

			/**
			 * Launch container drag enter processing if not done yet
			 * May be needed if [Ctrl] key is pressed during a control drag operation
			 * @param  {event} e
			 * @return {undefined}
			 */
			this.onContainerDragOverDetected = function(e) {
				this.removeEventListener("dragover", that.onContainerDragOverDetected);
				if (!that.containerDragEnterOccured) {
					that.onContainerDragEnter.call(this, e);
				}
			};

			this.removeEventsAndStyles = function() {
				jQuery(this).removeClass("sapUiDtWidget-droparea-sortable sapUiDtWidget-droparea-min-height sapUiDtWidget-droparea-min-width sapUiDtWidget-droparea-relative");
				this.removeEventListener("dragover", that.onContainerDragOverDetected);
				this.removeEventListener("dragenter", that.onContainerDragEnter);
			};

			this.addEventsAndStyles = function(oElement) {
				var $elem = jQuery(oElement);
				if ($elem.css("position") === "static") {
					$elem.addClass("sapUiDtWidget-droparea-relative");
				}
				$elem.addClass("sapUiDtWidget-droparea-sortable");
				if ($elem.height() === 0) {
					$elem.addClass("sapUiDtWidget-droparea-min-height");
				}
				if ($elem.width() === 0) {
					$elem.addClass("sapUiDtWidget-droparea-min-width");
				}
				oElement.addEventListener("dragover", that.onContainerDragOverDetected);
				oElement.addEventListener("dragenter", that.onContainerDragEnter);
				that.containerDragEnterOccured = false;
			};
		}
	});


	/**
	 * Enables all controls where dropping of the current dragged control is allowed.
	 *
	 *  @param {sap.ui.core.Control} oControl The dragged control.
	 *  @public
	 */
	DTWidgetPresenter.prototype.enableEligibleContainers = function(oControl, bRerender) {
		var that = this;
		var oControl = oControl;
		function addDroppable(item) {
			for (var i = 0; i < item.aBindParameters.length; i++) {
				if (item.aBindParameters[i].sEventType == "dragover") {
					item.aBindParameters.splice(i, 1);
				}
			}
			item.attachBrowserEvent("dragover", that.onDragOver)
				.addStyleClass("sapUiDtWidget-droparea-sortable-child");
			
		}
		//Needed in case the ui5 control rerenders itself during dragover and the dragover event handlers are lost.
		that._oOnAfterRenderDelegate = {
				onAfterRendering : function(){
					that.oControl.removeEventDelegate(that._oOnAfterRenderDelegate);
					that.enableEligibleContainers(oControl, true);
				}
			};
		this.oControl.addEventDelegate(that._oOnAfterRenderDelegate);

		if (this.oControl === oControl) {
			return;
		}
		var oListOfAggregations = this.oControl.__widget.accepts(oControl);

		this.dropEnabled = true;

		oListOfAggregations.forEach(function(oSingleAggregation) {
			var sAggregationName = oSingleAggregation.oAggregation.name;

			var oContent = that.oControl.__widget.getAggregation(sAggregationName);
			var oControlList = oContent.filter(function(oSingleControl) {
				//oContent is sometimes [null] because the control has not been rendered yet.
				return oSingleControl && oSingleControl !== oControl;
			});
			if (!bRerender) {
				that.aEnabledAggregations.push(sAggregationName);
				that.aChildEnabledControls = that.aChildEnabledControls.concat(oControlList);
				// Make sure that the aggregation DOM Element always has the right data set (even when the DOM element was rerendered -> 
				// this might happen when there are hidden aggregations, e.g. for the headerContent aggregation of a sap.m.Page, which do not have a DOM element as an container)
				that._addAggregationInfo(oSingleAggregation);
				that.addEventsAndStyles(oSingleAggregation.DOMElement);
			}
			oControlList.forEach(addDroppable);
		});
	};


	/**
	 * Attaches drag events to all dropable aggregations of the control.
	 *
	 * @public
	 */
	DTWidgetPresenter.prototype.attachContentDragEvents = function() {
		var oAggregations = this.oControl.__widget.accepts();
		for (var i = oAggregations.length - 1; i >= 0; i--) {
			this._addAggregationInfo(oAggregations[i]);
			if (this.dropEnabled && this.aEnabledAggregations.indexOf(oAggregations[i].oAggregation.name) !== -1) {
				this.addEventsAndStyles(oAggregations[i].DOMElement);
			}
		}
	};
	
	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._addAggregationInfo = function(mAggregation) {
		jQuery(mAggregation.DOMElement)
			.attr("data-aggregation", mAggregation.oAggregation.name)
			.attr("data-aggregation-id", this.oControl.__widget.getEscapedId());
	};

	/**
	 * Disables all controls where dropping of the current dragged control is allowed.
	 *
	 *  @public
	 */
	DTWidgetPresenter.prototype.disableEligibleContainers = function() {
		var that = this;
		this.dropEnabled = true;

		function removeDroppable(item) {
			item.detachBrowserEvent("dragover", that.onDragOver)
				.removeStyleClass("sapUiDtWidget-droparea-sortable-child");
		}
		this.oControl.removeEventDelegate(this._oOnAfterRenderDelegate);
		this.aChildEnabledControls.forEach(removeDroppable);
		this.aChildEnabledControls = [];
		this.aEnabledAggregations = [];

		this.oScope.jQuery("[data-aggregation-id='" + this.oControl.__widget.getEscapedId() + "']").each(this.removeEventsAndStyles);
	};


	/**
	 * Removes the "widget-draggable" css class.
	 *
	 * @param {sap.ui.core.Control} oControl The dragged control.
	 * @public
	 */
	DTWidgetPresenter.prototype.stripDraggableControl = function(oControl) {
		if (this.oControl === oControl) {
			this.oControl.removeStyleClass("widget-draggable");
		}
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onDrop = function(e) {
		// Prevents controls that are not in the drop list to consume this event.
		var oWidgets = this.__widget.getWidgets();
		if (oWidgets.droppables.indexOf(this) === -1) {
			return;
		}
		e.stopPropagation();
		// TODO find a workaround this
		var oDraggable = oWidgets.getDraggable();
		
		var oEventBus = this.__widget.eventBus;
		oEventBus.publish("control.select", {
			"oControl": oDraggable,
			"dragging": true
		});

		oEventBus.publish("drag.ended", {
			"oControl": oDraggable
		});

		// Scroll control droped into view
		oEventBus.publish("control.show", {
			"oControl": oDraggable
		});

	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onDragOver = function(e) {
		e.preventDefault();
		e.stopPropagation();
		if (e.originalEvent) {
			e.originalEvent.dataTransfer.dropEffect = "move";
		}
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onControlToggle = function(channel, path, data) {
		if (data.action) {
			if (data.action == "select" && !this.selected) {
				this.select(true);
			} else if (data.action == "deselect" && this.selected) {
				if (this !== data.except) {
					this.deselect();
				}
			}
		}
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onDragEnded = function(channel, path, data) {
		this.disableEligibleContainers();
		this.stripDraggableControl(data.oControl);
		this.view.fixOverlaySize();
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onDomChanged = function(channel, path, data) {
		this.view.fixOverlaySize();
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onControlRemove = function(channel, path, data) {
		this.removeWidget(data);
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onControlShow = function(channel, path, data) {
		if (data.oControl && data.oControl === this.oControl) {
			this.showControl();
		}
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onControlSelect = function(channel, path, data) {
		if (data.oControl && data.oControl === this.oControl) {
			this.select(false, data.dragging, false);
		}
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onControlDeselect = function(channel, path, data) {
		if (data.oControl && data.oControl === this.oControl) {
			this.deselect(data.multiple);
		}
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onControlHighlight = function(channel, path, data) {
		if (data.oControl && data.oControl === this.oControl && !this.highlighted) {
			this.highlighted = true;
			this.view.highlight();
		}
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onDownplay = function(channel, path, data) {
		if (data.oControl && data.oControl === this.oControl && this.highlighted) {
			this.highlighted = false;
			this.view.downplay();
		}
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._onMovePosition = function(channel, path, data) {
		// Use current draggable as the control to be moved if not handed over
		if (!data.oControl) {
		   var widgets = this.view.getWidget().oWysiwygCanvasControl.oWidgets;
		   data.oControl = widgets.getDraggable();
		}

		if (data.oControl && data.oControl === this.oControl) {
			var that = this;

			// Determine step
			var iBy = 0;
			if (data.sDirection == "next") {
				iBy = 1;
			} else if (data.sDirection == "previous") {
				iBy = -1;
			} else {
				return;
			}

			// Move control
			sap.ui.dt.Utils.findParentWYSIWYGAggregation(this.oControl, function(oAggregation, oParentControl, aControls) {
				//var iIndex = (aControls.indexOf(that.oControl) + data.iBy) % (aControls.length);
				var iIndex = (aControls.indexOf(that.oControl) + iBy);
				if (iIndex > aControls.length || iIndex < 0) {
					return;
				}
				var draggable = that.oControl;
				jQuery.sap.log.debug("dragover - addAggregation [" + oAggregation.name + "]: " + draggable.getId() + " over " + oParentControl.getId());
				oParentControl.__widget.addAggregation(oAggregation.name, draggable, iIndex);
				that._publishControlShowAfterNextRenderingOf(oParentControl, draggable);
				oParentControl.__widget._fireChanged();
			});
		}
	};

	/**
	 * Subscribes to / unsubscribes from the internal event bus.
	 *
	 * @private
	 */
	DTWidgetPresenter.prototype.initSubscriptions = function() {
		this.eventBus.subscribe("control.toggle", this._onControlToggle, this);
		this.eventBus.subscribe("drag.ended", this._onDragEnded, this);
		this.eventBus.subscribe("dom.changed", this._onDomChanged, this);
		this.eventBus.subscribe("control.remove", this._onControlRemove, this);
		this.eventBus.subscribe("control.show", this._onControlShow, this);
		this.eventBus.subscribe("control.select", this._onControlSelect, this);
		this.eventBus.subscribe("control.deselect", this._onControlDeselect, this);
		this.eventBus.subscribe("control.highlight", this._onControlHighlight, this);
		this.eventBus.subscribe("control.downplay", this._onDownplay, this);
		this.eventBus.subscribe("control.movePosition", this._onMovePosition, this);

		//Transformations fix
		this.oControl.attachBrowserEvent("dragover", this._onDragOver);
		this.oControl.attachBrowserEvent("drop", this._onDrop);

	};

	DTWidgetPresenter.prototype.destroy = function(oData) {
		this.eventBus.unsubscribe("control.toggle", this._onControlToggle, this);
		this.eventBus.unsubscribe("drag.ended", this._onDragEnded, this);
		this.eventBus.unsubscribe("dom.changed", this._onDomChanged, this);
		this.eventBus.unsubscribe("control.remove", this._onControlRemove, this);
		this.eventBus.unsubscribe("control.show", this._onControlShow, this);
		this.eventBus.unsubscribe("control.select", this._onControlSelect, this);
		this.eventBus.unsubscribe("control.deselect", this._onControlDeselect, this);
		this.eventBus.unsubscribe("control.highlight", this._onControlHighlight, this);
		this.eventBus.unsubscribe("control.downplay", this._onDownplay, this);
		this.eventBus.unsubscribe("control.movePosition", this._onMovePosition, this);

		// destroy was called from setRootControl
		if (oData.fromSetRootControl) {
			this.oControl.detachBrowserEvent("dragover", this._onDragOver);
			this.oControl.detachBrowserEvent("drop", this._onDrop);
		}
	};

	/**
	 * Selects the control and if the control is selected than the parent is selected.
	 *
	 * @param {boolean} multiple Whether the selection is multiple
	 * @param {boolean} dragging Whether selection occurs during dragging
	 * @param {boolean} nextParent Whether the next parent should be selected
	 *
	 * @public
	 */
	DTWidgetPresenter.prototype.select = function(multiple, dragging, nextParent) {
		var bIsTemplate = this.oControl.__widget.isTemplate;
		var oSelectionData = this._getParentSelection();
		var bhasNextSelectableParent = oSelectionData.nextSelectableParent;

		if ((bIsTemplate && !bhasNextSelectableParent) || (this.selected && !dragging && nextParent)) {
			var oParent = this._getFirstSelectableParent(this.oControl);
			if (oParent) {
				this.deselect(multiple);
				oParent.__widget.getDTView().presenter.select(multiple);
			}
			return;
		}

		if (!bIsTemplate && (!oSelectionData.selectedParents.length || dragging || jQuery.inArray(oSelectionData.lastParent, oSelectionData.selectedParents) > -1) && nextParent) {
			this._selectInternal(multiple);
			return;
		}

		if (!bIsTemplate &&  (!oSelectionData.nextSelectableParent || !nextParent)) {
			deselectParents(oSelectionData);
			this._selectInternal();
			return;
		}

		deselectParents(oSelectionData);
		oSelectionData.nextSelectableParent.__widget.getDTView().presenter.select();
	};


	/**
	 * Internal selection method.
	 *
	 * @param {boolean} multiple Whether the selection is multiple
	 *
	 * @private
	 */
	DTWidgetPresenter.prototype._selectInternal = function(multiple) {
		this.selected = true;
		// Implicit show on select
		this.eventBus.publish("control.show", {
			oControl: this.oControl
		});
		if (!multiple) {
			this.eventBus.publish("control.toggle", {
				action: "deselect",
				except: this
			});
		}
		this.eventBus.publish("control.selected", {
			oControl: this.oControl,
			element: this.view.getOverlay()
		});
		this.view.onSelect();
		this._changeChildDragging();
		this.setDraggable(this.oControl.__widget.isDraggable(0));

	};

	DTWidgetPresenter.prototype.deselect = function(multiple) {
		if (!this.selected) {
			return;
		}

		this.selected = false;
		this.eventBus.publish("control.deselected", {
			oControl: this.oControl,
			element: this.view.getOverlay()
		});
		this.view.onDeselect();
		this._changeChildDragging();
		this.setDraggable(this.oControl.__widget.isDraggable(this._getParentSelection().selectedParents.length));
	};


	DTWidgetPresenter.prototype.showControl = function() {
		var that = this;
		sap.ui.dt.Utils.findParentWYSIWYGAggregation(this.oControl, function(oAggregation, oParentControl) {
			var show = oParentControl.__widget.getAggregationsAdapterFunction( oAggregation.name, "show" );
			if (show) {
				show.call(oParentControl, that.oControl);
			}
		});
	};

	DTWidgetPresenter.prototype.toggleSelection = function(multiple) {
		if (this.selected) {
			this.deselect(multiple);
		} else {
			this.select(multiple);
		}
	};

	DTWidgetPresenter.prototype.removeWidget = function(data) {
		if (data.oControl && data.oControl !== this.oControl) {
			return;
		}
		if (data.drop && !data.oControl) {
			return;
		}
		// TODO : required?!
		if (!this.oControl.getMetadata().__designTimeOptions.unsupported && !this.oControl.__widget.isRemovable()) {
			return;
		}
		if (this.selected || data.oControl === this.oControl) {
			this.oControl.destroy();
		}
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._getFirstSelectableParent = function(oControl) {
		var oParent = sap.ui.dt.Utils.getWYSIWYGParent(oControl);
		while (oParent && oParent.__widget && oParent.__widget.getDesignTimeProperty("isntDropTarget")) {
			oParent = sap.ui.dt.Utils.getWYSIWYGParent(oParent);
		}
		return oParent;
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._getParentSelection = function() {

		var selection = {
			parents: [],
			selectedParents: [],
			nextSelectableParent: undefined,
			lastParent: undefined
		};
		var oParent = this.oControl;

		var bLoopUntilReturn = true;
		while (bLoopUntilReturn) {
			oParent = this._getFirstSelectableParent(oParent);
			if (!oParent) {
				return selection;
			}
			selection.parents.push(oParent);
			selection.lastParent = oParent;

			if (oParent.__widget.getDTView().presenter.selected) {
				selection.selectedParents.push(oParent);
				selection.nextSelectableParent = null;
			} else {
				if (!selection.nextSelectableParent) {
					selection.nextSelectableParent = oParent;
				}
			}
		}
	};

	/*
	 * @private
	 */
	DTWidgetPresenter.prototype._changeChildDragging = function() {

		var children = this.oControl.__widget.getChildren();
		var that = this;

		children.filter(function(oControl) {
			return oControl.__widget.isSelectable();
		}).forEach(function(oControl) {
			oControl.__widget.getDTView().presenter.setDraggable(!that.selected);
		});
	};

	DTWidgetPresenter.prototype.setDraggable = function(bIsDraggable) {
		var oOverlay = this.view.getOverlay();
		// TODO :remove, hack for now, as we have rerendering issues when having a forms in xml
		if (oOverlay) {
			if (bIsDraggable) {
				this.view.oDragManager.set(this.view.getOverlay());
			} else {
				this.view.oDragManager.remove(this.view.getOverlay());
			}
		}
	};

	function deselectParents(oSelectionData) {
		if (!oSelectionData || !oSelectionData.selectedParents) {
			return;
		}
		oSelectionData.selectedParents.forEach(function(parent) {
			parent.__widget.getDTView().presenter.deselect();
		});
	}

	return DTWidgetPresenter;
}, /* bExport= */ true);