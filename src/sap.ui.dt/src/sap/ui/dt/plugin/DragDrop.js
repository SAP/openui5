/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/dt/Plugin",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/qunit/QUnitUtils"
],
function(
	BaseObject,
	Plugin,
	DOMUtil,
	OverlayUtil,
	OverlayRegistry,
	jQuery,
	Device
) {
	"use strict";

	/**
	 * Constructor for a new DragDrop.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @abstract
	 * @class
	 * The DragDrop plugin is an abstract plugin to enable drag and drop functionality of the Overlays
	 * This Plugin should be overwritten by the D&D plugin implementations, the abstract functions should be used to perform actions
	 * @extends sap.ui.dt.Plugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.plugin.DragDrop
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DragDrop = Plugin.extend("sap.ui.dt.plugin.DragDrop", /** @lends sap.ui.dt.plugin.DragDrop.prototype */ {
		metadata: {
			"abstract": true,
			library: "sap.ui.dt",
			properties: {},
			associations: {},
			events: {}
		}
	});

	var I_TOUCH_DRAG_START_THRESHOLD_DISTANCE = 7;

	var bPreventScrollOnTouch = false;

	// previous target overlay drag enter was called for
	var oPreviosTargetOverlayForTouch;

	/*
	 * @private
	 */
	DragDrop.prototype._preventScrollOnTouch = function(oEvent) {
		if (bPreventScrollOnTouch) {
			oEvent.preventDefault();
		}
	};

	/*
	 * @private
	 */
	DragDrop.prototype.init = function() {
		Plugin.prototype.init.apply(this, arguments);

		// We want to prevent the page from scrolling before getting to its children (=> useCapture "true")
		document.addEventListener('touchmove', this._preventScrollOnTouch, true);

		this._dragScrollHandler = this._dragScroll.bind(this);
		this._dragLeaveHandler = this._dragLeave.bind(this);
		this._mScrollIntervals = {};
	};


	/*
	 * @private
	 */
	DragDrop.prototype.exit = function() {
		Plugin.prototype.exit.apply(this, arguments);

		document.removeEventListener('touchmove', this._preventScrollOnTouch);

		delete this._mElementOverlayDelegate;
		delete this._mAggregationOverlayDelegate;
		delete this._dragScrollHandler;
	};

	/**
	 * @override
	 * @param {sap.ui.dt.Overlay} an Overlay which should be registered
	 */
	DragDrop.prototype.registerElementOverlay = function(oOverlay) {
		// this._checkMovable(oOverlay);

		oOverlay.attachEvent("movableChange", this._onMovableChange, this);

		if (oOverlay.isMovable()) {
			this._attachDragEvents(oOverlay);
		}

		oOverlay.attachBrowserEvent("dragover", this._onDragOver, this);
		oOverlay.attachBrowserEvent("dragenter", this._onDragEnter, this);
		oOverlay.attachBrowserEvent("dragleave", this._onDragLeave, this);
	};

	/**
	 * @override
	 */
	DragDrop.prototype.registerAggregationOverlay = function(oAggregationOverlay) {
		oAggregationOverlay.attachTargetZoneChange(this._onAggregationTargetZoneChange, this);

		if (!Device.browser.webkit) {
			this._attachDragScrollHandler(oAggregationOverlay);
		}
	};

	/**
	 * @override
	 */
	DragDrop.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachEvent("movableChange", this._onMovableChange, this);

		this._detachDragEvents(oOverlay);

		oOverlay.detachBrowserEvent("dragover", this._onDragOver, this);
		oOverlay.detachBrowserEvent("dragenter", this._onDragEnter, this);
		oOverlay.detachBrowserEvent("dragleave", this._onDragLeave, this);
	};

	/**
	 * @override
	 */
	DragDrop.prototype.deregisterAggregationOverlay = function(oAggregationOverlay) {
		oAggregationOverlay.detachTargetZoneChange(this._onAggregationTargetZoneChange, this);

		if (!Device.browser.webkit) {
			this._removeDragScrollHandler(oAggregationOverlay);
			this._clearScrollIntervalFor(oAggregationOverlay.$().attr("id"));
		}
	};

	/**
	 * @private
	 * @param {sap.ui.dt.Overlay} an Overlay to attach events to
	 */
	DragDrop.prototype._attachDragEvents = function(oOverlay) {
		oOverlay.attachBrowserEvent("dragstart", this._onDragStart, this);
		oOverlay.attachBrowserEvent("drag", this._onDrag, this);
		oOverlay.attachBrowserEvent("dragend", this._onDragEnd, this);
		oOverlay.attachBrowserEvent("touchstart", this._onTouchStart, this);
	};

	/**
	 * @private
	 * @param {sap.ui.dt.Overlay} an Overlay to detach events from
	 */
	DragDrop.prototype._detachDragEvents = function(oOverlay) {
		oOverlay.detachBrowserEvent("dragstart", this._onDragStart, this);
		oOverlay.detachBrowserEvent("drag", this._onDrag, this);
		oOverlay.detachBrowserEvent("dragend", this._onDragEnd, this);
		oOverlay.detachBrowserEvent("touchstart", this._onTouchStart, this);
	};

	/**
	 * @param {sap.ui.dt.Overlay} oOverlay overlay instance
	 * @protected
	 */
	DragDrop.prototype.onMovableChange = function() { };

	/**
	 * @param {sap.ui.dt.Overlay} oDraggedOverlay dragged overlay instance
	 * @protected
	 */
	DragDrop.prototype.onDragStart = function() { };

	/**
	 * @param {sap.ui.dt.Overlay} oDraggedOverlay dragged overlay instance
	 * @protected
	 */
	DragDrop.prototype.onDragEnd = function() { };

	/**
	 * @param {sap.ui.dt.Overlay} oDraggedOverlay dragged overlay instance
	 * @protected
	 */
	DragDrop.prototype.onDrag = function() { };

	/**
	 * @param {sap.ui.dt.Overlay} oOverlay overlay instance
	 * @return {boolean} return true to omit event.preventDefault
	 * @protected
	 */
	DragDrop.prototype.onDragEnter = function() { };

	/**
	 * @param {sap.ui.dt.Overlay} oOverlay overlay instance
	 * @return {boolean} return true to omit event.preventDefault
	 * @protected
	 */
	DragDrop.prototype.onDragLeave = function() { };

	/**
	 * @param {sap.ui.dt.Overlay} oOverlay overlay instance
	 * @return {boolean} return true to omit event.preventDefault
	 * @protected
	 */
	DragDrop.prototype.onDragOver = function() { };

	/**
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay aggregation overlay instance
	 * @protected
	 */
	DragDrop.prototype.onAggregationDragEnter = function() { };

	/**
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay aggregation overlay instance
	 * @protected
	 */
	DragDrop.prototype.onAggregationDragOver = function() { };

	/**
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay aggregation overlay instance
	 * @protected
	 */
	DragDrop.prototype.onAggregationDragLeave = function() { };

	/**
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay aggregation overlay instance
	 * @protected
	 */
	DragDrop.prototype.onAggregationDrop = function() { };

	/**
	 * @private
	 */
	DragDrop.prototype._checkMovable = function(oOverlay) {
		if (oOverlay.isMovable() || DOMUtil.getDraggable(oOverlay.$()) !== undefined) {
			DOMUtil.setDraggable(oOverlay.$(), oOverlay.isMovable());
		}
	};

	/**
	 * @private
	 */
	DragDrop.prototype._onMovableChange = function(oEvent) {
		var oOverlay = oEvent.getSource();
		if (oOverlay.isMovable()) {
			this._attachDragEvents(oOverlay);
		} else {
			this._detachDragEvents(oOverlay);
		}

		this.onMovableChange(oOverlay);
	};

	/**
	 * @private
	 */
	DragDrop.prototype._onDragStart = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);

		oEvent.stopPropagation();

		// Fix for Firfox - Firefox only fires drag events when data is set
		if (Device.browser.firefox && oEvent && oEvent.originalEvent && oEvent.originalEvent.dataTransfer && oEvent.originalEvent.dataTransfer.setData) {
			oEvent.originalEvent.dataTransfer.setData('text/plain', '');
		}

		this.setBusy(true);
		this.showGhost(oOverlay, oEvent);
		this.onDragStart(oOverlay);
	};

	DragDrop.prototype._attachTouchDragEvents = function(oOverlay) {
		oOverlay.attachBrowserEvent("touchmove", this._onTouchMove, this);
		oOverlay.attachBrowserEvent("touchend", this._onTouchEnd, this);
	};

	DragDrop.prototype._detachTouchDragEvents = function(oOverlay) {
		oOverlay.detachBrowserEvent("touchmove", this._onTouchMove, this);
		oOverlay.detachBrowserEvent("touchend", this._onTouchEnd, this);
	};

	DragDrop.prototype._onTouchStart = function(oEvent) {
		var touchStartX = oEvent.touches[0].pageX;
		var touchStartY = oEvent.touches[0].pageY;

		var oTouchedOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);


		function detachTouchHandlers() {
			oTouchedOverlay.detachBrowserEvent("touchmove", touchMoveHandler, this);
			oTouchedOverlay.detachBrowserEvent("touchend", touchEndHandler, this);
			oTouchedOverlay.detachBrowserEvent("contextmenu", touchEndHandler, this);
		}

		function getMoveDistance(touchMoveX, touchMoveY) {
			var distanceX = touchStartX - touchMoveX;
			var distanceY = touchStartY - touchMoveY;
			return Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
		}

		function touchMoveHandler(oEvent) {
			var touchMoveX = oEvent.touches[0].pageX;
			var touchMoveY = oEvent.touches[0].pageY;
			var movedDistance = getMoveDistance(touchMoveX, touchMoveY);

			if (movedDistance > I_TOUCH_DRAG_START_THRESHOLD_DISTANCE) {
				this.onDragStart(oTouchedOverlay);
				detachTouchHandlers.call(this);
				this._attachTouchDragEvents(oTouchedOverlay);
			}
		}

		function touchEndHandler() {
			detachTouchHandlers.call(this);
			bPreventScrollOnTouch = false;
		}

		bPreventScrollOnTouch = true;
		oEvent.stopPropagation();

		oTouchedOverlay.attachBrowserEvent("touchmove", touchMoveHandler, this);
		oTouchedOverlay.attachBrowserEvent("contextmenu", touchEndHandler, this);
		oTouchedOverlay.attachBrowserEvent("touchend", touchEndHandler, this);
	};

	DragDrop.prototype._getTargetOverlay = function(oElement) {
		if (BaseObject.isA(oElement, "sap.ui.dt.Overlay")) {
			// target overlay is the overlay that we could drop on and therefore have to fire events for
			var oTargetOverlay;
			// is overlay a targetZone AggregationOverlay
			if (BaseObject.isA(oElement, "sap.ui.dt.AggregationOverlay") && oElement.getTargetZone()) {
				oTargetOverlay = oElement;
			} else if (BaseObject.isA(oElement, "sap.ui.dt.ElementOverlay") && OverlayUtil.isInTargetZoneAggregation(oElement)) {
				oTargetOverlay = oElement;
			}

			return oTargetOverlay || this._getTargetOverlay(oElement.getParent());
		}
	};

	DragDrop.prototype._findTargetOverlayFromCoordinates = function(pageX, pageY) {
		var oDomNode = document.elementFromPoint(pageX, pageY);

		var oElement = oDomNode ? sap.ui.getCore().byId(oDomNode.id) : undefined;

		return this._getTargetOverlay(oElement);
	};

	DragDrop.prototype._onTouchMove = function(oEvent) {
		var oDraggedOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);

		this.onDrag(oDraggedOverlay);

		// changedTouches will have the information related to the moved finger, because it’s what caused the event "touchmove"
		var aTouches = oEvent.touches || oEvent.changedTouches;

		var pageX = aTouches[0].pageX;
		var pageY = aTouches[0].pageY;

		var oTargetOverlay = this._findTargetOverlayFromCoordinates(pageX, pageY);

		if (!oTargetOverlay) {
			return;
		}

		if (oTargetOverlay !== oPreviosTargetOverlayForTouch) {
			if (oPreviosTargetOverlayForTouch) {
				if (BaseObject.isA(oPreviosTargetOverlayForTouch, "sap.ui.dt.AggregationOverlay")) {
					this.onAggregationDragLeave(oPreviosTargetOverlayForTouch);
				} else {
					this.onDragLeave(oPreviosTargetOverlayForTouch);
				}
			}
			oPreviosTargetOverlayForTouch = oTargetOverlay;

			if (BaseObject.isA(oTargetOverlay, "sap.ui.dt.AggregationOverlay")) {
				this.onAggregationDragEnter(oTargetOverlay);
			} else {
				this.onDragEnter(oTargetOverlay);
			}
		}

		if (BaseObject.isA(oTargetOverlay, "sap.ui.dt.AggregationOverlay")) {
			this.onAggregationDragOver(oTargetOverlay);
		} else {
			this.onDragOver(oTargetOverlay);
		}

		oEvent.stopPropagation();
	};

	DragDrop.prototype._getValidTargetZoneAggregationOverlay = function(oOverlay) {
		if (BaseObject.isA(oOverlay, "sap.ui.dt.AggregationOverlay") && oOverlay.getTargetZone()) {
			return oOverlay;
		}
		return this._getValidTargetZoneAggregationOverlay(oOverlay.getParent());
	};

	DragDrop.prototype._onTouchEnd = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);

		var oAggregationOverlay = this._getValidTargetZoneAggregationOverlay(oOverlay);

		if (oAggregationOverlay) {
			this.onAggregationDrop(oAggregationOverlay);
		}

		this.onDragEnd(oOverlay);
		this._detachTouchDragEvents(oOverlay);

		oPreviosTargetOverlayForTouch = undefined;

		bPreventScrollOnTouch = false;
	};

	/**
	 * @protected
	 */
	DragDrop.prototype.showGhost = function(oOverlay, oEvent) {
		if (oEvent && oEvent.originalEvent && oEvent.originalEvent.dataTransfer) {
			// Edge has default effect "copy", so we set it here to "move"
			oEvent.originalEvent.dataTransfer.effectAllowed = "move";
			oEvent.originalEvent.dataTransfer.dropEffect = "move";
			// IE and Edge do no support dataTransfer.setDragImage on D&D event
			if (!Device.browser.msie && !Device.browser.edge
				&& !Device.browser.msie && oEvent.originalEvent.dataTransfer.setDragImage) {
				this._$ghost = this.createGhost(oOverlay, oEvent);

				// ghost should be visible to set it as dragImage
				this._$ghost.appendTo("#overlay-container");
				// if ghost will be removed without timeout, setDragImage won't work
				setTimeout(function() {
					this._removeGhost();
				}.bind(this), 0);
				oEvent.originalEvent.dataTransfer.setDragImage(
					this._$ghost.get(0),
					oEvent.originalEvent.pageX - oOverlay.$().offset().left,
					oEvent.originalEvent.pageY - oOverlay.$().offset().top
				);
			}
		}
	};

	/**
	 * @private
	 */
	DragDrop.prototype._removeGhost = function() {
		this.removeGhost();
		delete this._$ghost;
	};

	/**
	 * @protected
	 */
	DragDrop.prototype.removeGhost = function() {
		var $ghost = this.getGhost();
		if ($ghost) {
			$ghost.remove();
		}
	};

	/**
	 * @protected
	 */
	DragDrop.prototype.createGhost = function(oOverlay) {
		var $GhostDom = oOverlay.getAssociatedDomRef();
		var $ghost;
		if (!$GhostDom) {
			$GhostDom = this._getAssociatedDomCopy(oOverlay);
			$ghost = $GhostDom;
		} else {
			$ghost = jQuery("<div></div>");
			jQuery.makeArray($GhostDom).forEach(function(oNode) {
				DOMUtil.cloneDOMAndStyles(oNode, $ghost);
			});
		}

		var $ghostWrapper = jQuery("<div></div>").addClass("sapUiDtDragGhostWrapper");
		return $ghostWrapper.append($ghost.addClass("sapUiDtDragGhost"));
	};

	/**
	 * @private
	 */
	DragDrop.prototype._getAssociatedDomCopy = function(oOverlay) {
		var $DomCopy = jQuery("<div></div>");

		oOverlay.getAggregationOverlays().forEach(function(oAggregationOverlay) {
			oAggregationOverlay.getChildren().forEach(function(oChildOverlay) {
				var oChildDom = oChildOverlay.getAssociatedDomRef();
				if (oChildDom) {
					DOMUtil.cloneDOMAndStyles(oChildDom, $DomCopy);
				} else {
					DOMUtil.cloneDOMAndStyles(this._getAssociatedDomCopy(oChildOverlay), $DomCopy);
				}
			}, this);
		}, this);

		return $DomCopy;
	};

	/**
	 * @protected
	 * @return {jQuery} jQuery object drag ghost
	 */
	DragDrop.prototype.getGhost = function() {
		return this._$ghost;
	};


	/**
	 * @private
	 */
	DragDrop.prototype._onDragEnd = function(oEvent) {
		this.setBusy(false);
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		this._removeGhost();

		this._clearAllScrollIntervals();
		this.onDragEnd(oOverlay);

		oEvent.stopPropagation();
	};

	/**
	 * @private
	 */
	DragDrop.prototype._onDrag = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);

		this.onDrag(oOverlay);

		oEvent.stopPropagation();
	};

	/**
	 * @private
	 */
	DragDrop.prototype._onDragEnter = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (OverlayUtil.isInTargetZoneAggregation(oOverlay)) {
			//if "true" returned, propagation won't be canceled
			if (!this.onDragEnter(oOverlay)) {
				oEvent.stopPropagation();
			}
		}

		oEvent.preventDefault();
	};

	/**
	 * @private
	 */
	DragDrop.prototype._onDragLeave = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (OverlayUtil.isInTargetZoneAggregation(oOverlay)) {
			//if "true" returned, propagation won't be canceled
			if (!this.onDragLeave(oOverlay)) {
				oEvent.stopPropagation();
			}
		}

		oEvent.preventDefault();
	};

	/**
	 * @private
	 */
	DragDrop.prototype._onDragOver = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (OverlayUtil.isInTargetZoneAggregation(oOverlay)) {
			//if "true" returned, propagation won't be canceled
			if (!this.onDragOver(oOverlay)) {
				oEvent.stopPropagation();
			}
		}

		oEvent.preventDefault();
	};

	/**
	 * @private
	 */
	DragDrop.prototype._onAggregationTargetZoneChange = function(oEvent) {
		var oAggregationOverlay = oEvent.getSource();
		var bTargetZone = oEvent.getParameter("targetZone");

		if (bTargetZone) {
			this._attachAggregationOverlayEvents(oAggregationOverlay);
		} else {
			this._detachAggregationOverlayEvents(oAggregationOverlay);
		}
	};

	/**
	 * @private
	 */
	DragDrop.prototype._attachAggregationOverlayEvents = function(oAggregationOverlay) {
		oAggregationOverlay.attachBrowserEvent("dragenter", this._onAggregationDragEnter, this);
		oAggregationOverlay.attachBrowserEvent("dragover", this._onAggregationDragOver, this);
		oAggregationOverlay.attachBrowserEvent("dragleave", this._onAggregationDragLeave, this);
		oAggregationOverlay.attachBrowserEvent("drop", this._onAggregationDrop, this);
	};

	/**
	 * @private
	 */
	DragDrop.prototype._detachAggregationOverlayEvents = function(oAggregationOverlay) {
		oAggregationOverlay.detachBrowserEvent("dragenter", this._onAggregationDragEnter, this);
		oAggregationOverlay.detachBrowserEvent("dragover", this._onAggregationDragOver, this);
		oAggregationOverlay.detachBrowserEvent("dragleave", this._onAggregationDragLeave, this);
		oAggregationOverlay.detachBrowserEvent("drop", this._onAggregationDrop, this);
	};


	/**
	 * @private
	 */
	DragDrop.prototype._onAggregationDragEnter = function(oEvent) {
		var oAggregationOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		this.onAggregationDragEnter(oAggregationOverlay);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * @private
	 */
	DragDrop.prototype._onAggregationDragOver = function(oEvent) {
		var oAggregationOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		this.onAggregationDragOver(oAggregationOverlay);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * @private
	 */
	DragDrop.prototype._onAggregationDragLeave = function(oEvent) {
		var oAggregationOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		this.onAggregationDragLeave(oAggregationOverlay);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * @private
	 */
	DragDrop.prototype._onAggregationDrop = function(oEvent) {
		var oAggregationOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		this.onAggregationDrop(oAggregationOverlay);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Scroll ondrag enablement (only for non-webkit browsers) *
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	var I_SCROLL_TRAP_SIZE = 100;
	var I_SCROLL_STEP = 20;
	var I_SCROLL_INTERVAL = 50;

	/**
	 * @private
	 */
	DragDrop.prototype._clearScrollInterval = function(sElementId, sDirection) {
		if (this._mScrollIntervals[sElementId]) {
			window.clearInterval(this._mScrollIntervals[sElementId][sDirection]);
			delete this._mScrollIntervals[sElementId][sDirection];
		}
	};

	/**
	 * @private
	 */
	DragDrop.prototype._clearScrollIntervalFor = function(sElementId) {
		if (this._mScrollIntervals[sElementId]) {
			Object.keys(this._mScrollIntervals[sElementId]).forEach(function(sDirection) {
				this._clearScrollInterval(sElementId, sDirection);
			}, this);
		}
	};

	/**
	 * @private
	 */
	DragDrop.prototype._clearAllScrollIntervals = function() {
		Object.keys(this._mScrollIntervals).forEach(this._clearScrollIntervalFor.bind(this));
	};

	/**
	 * @private
	 */
	DragDrop.prototype._checkScroll = function($element, sDirection, iEventOffset) {
		var iSize;
		var fnScrollFunction;
		var iScrollMultiplier = 1;

		if (sDirection === "top" || sDirection === "bottom") {
			iSize = $element.height();
			fnScrollFunction = $element.scrollTop.bind($element);
		} else {
			iSize = $element.width();
			fnScrollFunction = $element.scrollLeft.bind($element);
		}
		if (sDirection === "top" || sDirection === "left") {
			iScrollMultiplier = -1;
		}

		// ensure scroll trap size isn't be bigger then ¼ of the container size
		var iSizeQuarter = Math.floor(iSize / 4);
		var iTrapSize = I_SCROLL_TRAP_SIZE;
		if (iSizeQuarter < I_SCROLL_TRAP_SIZE) {
			iTrapSize = iSizeQuarter;
		}


		if (iEventOffset < iTrapSize) {
			this._mScrollIntervals[$element.attr("id")] = this._mScrollIntervals[$element.attr("id")] || {};
			if (!this._mScrollIntervals[$element.attr("id")][sDirection]) {
				this._mScrollIntervals[$element.attr("id")][sDirection] = window.setInterval(function() {
					var iInitialScrollOffset = fnScrollFunction();
					fnScrollFunction(iInitialScrollOffset + iScrollMultiplier * I_SCROLL_STEP);
				}, I_SCROLL_INTERVAL);
			}
		} else {
			this._clearScrollInterval($element.attr("id"), sDirection);
		}
	};

	/**
	 * @private
	 */
	DragDrop.prototype._dragLeave = function(oEvent) {
		var oAggregationOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);

		this._clearScrollIntervalFor(oAggregationOverlay.$().attr("id"));
	};

	/**
	 * @private
	 */
	DragDrop.prototype._dragScroll = function(oEvent) {
		var oAggregationOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		var $aggregationOverlay = oAggregationOverlay.$();

		var iDragX = oEvent.clientX;
		var iDragY = oEvent.clientY;

		var oOffset = $aggregationOverlay.offset();
		var iHeight = $aggregationOverlay.height();
		var iWidth = $aggregationOverlay.width();

		var iTop = oOffset.top;
		var iLeft = oOffset.left;
		var iBottom = iTop + iHeight;
		var iRight = iLeft + iWidth;

		this._checkScroll($aggregationOverlay, "bottom", iBottom - iDragY);
		this._checkScroll($aggregationOverlay, "top", iDragY - iTop);
		this._checkScroll($aggregationOverlay, "right", iRight - iDragX);
		this._checkScroll($aggregationOverlay, "left", iDragX - iLeft);
	};

	/**
	 * @private
	 */
	DragDrop.prototype._attachDragScrollHandler = function(oEventOrAggregationOverlay) {
		var oAggregationOverlay;
		if (BaseObject.isA(oEventOrAggregationOverlay, "sap.ui.dt.AggregationOverlay")) {
			oAggregationOverlay = oEventOrAggregationOverlay;
		} else {
			oAggregationOverlay = oEventOrAggregationOverlay.srcControl;
		}

		if (DOMUtil.hasScrollBar(oAggregationOverlay.$())) {
			oAggregationOverlay.getDomRef().addEventListener("dragover", this._dragScrollHandler, true);
			oAggregationOverlay.getDomRef().addEventListener("dragleave", this._dragLeaveHandler, true);
		}
	};

	/**
	 * @private
	 */
	DragDrop.prototype._removeDragScrollHandler = function(oEventOrAggregationOverlay) {
		var oAggregationOverlay;
		if (BaseObject.isA(oEventOrAggregationOverlay, "sap.ui.dt.AggregationOverlay")) {
			oAggregationOverlay = oEventOrAggregationOverlay;
		} else {
			oAggregationOverlay = oEventOrAggregationOverlay.srcControl;
		}

		var oDomRef = oAggregationOverlay.getDomRef();

		if (oDomRef) {
			oDomRef.removeEventListener("dragover", this._dragScrollHandler, true);
		}
	};

	return DragDrop;
});