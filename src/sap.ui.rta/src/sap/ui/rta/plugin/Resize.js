/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/dt/Util",
	"sap/ui/core/Core"
], function(
	Plugin,
	Overlay,
	OverlayRegistry,
	ZIndexManager,
	DtUtil,
	Core
) {
	"use strict";

	/**
	 * Constructor for a new Resize plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.101
	 * @alias sap.ui.rta.plugin.Resize
	 * @experimental Since 1.101. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Resize = Plugin.extend("sap.ui.rta.plugin.Resize", /** @lends sap.ui.rta.plugin.Resize.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				// Handle used for resizing (dragging or keyboard)
				handle: "object",
				// Defines if resize dragging is currently happening
				dragging: "boolean"
			},
			associations: {},
			events: {}
		}
	});

	var HANDLE_CLASS_NAME = "sapUiRtaResizeHandle";
	var HANDLE_EXTENSION_CLASS_NAME = "sapUiRtaResizeHandleExtension";
	var FULL_SCREEN_DIV_CLASS_NAME = "sapUiRtaFullScreenDiv";
	var MINIMUM_WIDTH = 15; // px

	var bRTL = Core.getConfiguration().getRTL();
	var iDirectionFactor = bRTL ? -1 : 1;
	var sBeginDirection = bRTL ? "right" : "left";
	var iKeyboardStep = 15 * iDirectionFactor; // px

	function getWidth(oOverlay) {
		return oOverlay.getDomRef().offsetWidth;
	}

	function createFullScreenDiv() {
		this._oFullScreenDiv = document.createElement("div");
		this._oFullScreenDiv.className = FULL_SCREEN_DIV_CLASS_NAME;
		this._oFullScreenDiv.style["z-index"] = ZIndexManager.getNextZIndex();
		var oOverlayContainer = Overlay.getOverlayContainer()[0];
		oOverlayContainer.append(this._oFullScreenDiv);
	}

	function removeFullScreenDiv() {
		this._oFullScreenDiv.removeEventListener("mouseup", this._fnOnMouseUp);
		this._oFullScreenDiv.removeEventListener("mousemove", this._fnOnMouseMove);
		this._oFullScreenDiv.remove();
		delete this._oFullScreenDiv;
	}

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @return {Promise.<boolean>} <code>true</code> if it's editable wrapped in a promise.
	 * @private
	 * @override
	 */
	Resize.prototype._isEditable = function(oOverlay) {
		var oAction = this.getAction(oOverlay);
		if (oAction && oAction.handler) {
			return Promise.resolve(this.hasStableId(oOverlay));
		}
		return this._checkChangeHandlerAndStableId(oOverlay);
	};

	Resize.prototype._createResizeCommand = function(oOverlay, mChange, oCompositeCommand) {
		var sVariantManagementReference = this.getVariantManagementReference(oOverlay);

		return this.getCommandFactory().getCommandFor(
			mChange.selectorElement,
			"resize",
			mChange.changeSpecificData,
			undefined,
			sVariantManagementReference
		)
			.then(function(oResizeCommand) {
				return oCompositeCommand.addCommand(oResizeCommand);
			});
	};

	Resize.prototype._createCompositeCommand = function(oOverlay, oElement, aChanges) {
		var oCompositeCommand;

		return this.getCommandFactory().getCommandFor(oElement, "composite")
			.then(function(_oCompositeCommand) {
				oCompositeCommand = _oCompositeCommand;
				return aChanges.reduce(function(oPreviousPromise, mChange) {
					return oPreviousPromise.then(this._createResizeCommand.bind(this, oOverlay, mChange, oCompositeCommand));
				}.bind(this), Promise.resolve());
			}.bind(this))
			.then(function() {
				return oCompositeCommand;
			});
	};

	Resize.prototype._createCommand = function(oOverlay, iNewWidth) {
		var oElement = oOverlay.getElement();
		var oAction = this.getAction(oOverlay);
		var fnHandler = oAction.handler;

		return Promise.resolve()
			.then(function() {
				if (fnHandler) {
					var mPropertyBag = {
						newWidth: iNewWidth
					};
					return fnHandler(oElement, mPropertyBag)
						.then(function(aChanges) {
							if (aChanges.length > 0) {
								return this._createCompositeCommand(oOverlay, oElement, aChanges);
							}
							return undefined;
						}.bind(this))
						.catch(function(vError) {
							throw DtUtil.propagateError(
								vError,
								"Resize#handler",
								"Error occurred during handler execution",
								"sap.ui.rta.plugin"
							);
						});
				}
				// Case without handler - single command (= one change)
				return this._createCompositeCommand(oOverlay, oElement, [{
					changeSpecificData: {
						changeType: oAction.changeType,
						content: {
							resizedElementId: oElement.getId(),
							newWidth: iNewWidth
						}
					},
					selectorElement: oElement
				}]);
			}.bind(this))
			.then(function(oCompositeCommand) {
				if (oCompositeCommand && oCompositeCommand.getCommands().length > 0) {
					this.fireElementModified({
						command: oCompositeCommand
					});
				}
			}.bind(this));
	};

	Resize.prototype._onHandleMouseDown = function(oOverlay, oEvent) {
		this.setBusy(true);
		if (oEvent.detail === 2) {
			this._onDoubleClick(oOverlay);
			this.setBusy(false);
			return;
		}
		createFullScreenDiv.call(this);
		var oAction = this.getAction(oOverlay);
		var oHandle = this.getHandle();
		var oElement = oOverlay.getElement();
		var oOverlayDomElement = oOverlay.getDomRef();
		var iOverlayBoundary = Math.round(oOverlayDomElement.getBoundingClientRect()[sBeginDirection]);
		var iHalfOffsetWidth = Math.round(oHandle.offsetWidth / 2);
		var iMousePosition = oEvent.clientX;
		var oExtension;

		// Initially set the current size of the element
		var iNewWidth = getWidth(oOverlay);
		// Place the middle of the handle on the mouse position
		oHandle.style[sBeginDirection] = (iMousePosition - iOverlayBoundary) * iDirectionFactor - iHalfOffsetWidth + "px";

		this.setDragging(true);
		oOverlay.focus();

		this._fnOnMouseMove = onMouseMove.bind(this);
		this._fnOnMouseUp = onMouseUp.bind(this);

		// Create handle extension (e.g. vertical line on the handle end going through all the lines of a table)
		if (oAction.getHandleExtensionHeight) {
			var iHandleExtensionHeight = oAction.getHandleExtensionHeight(oElement);
			oExtension = document.createElement("div");
			oExtension.className = HANDLE_EXTENSION_CLASS_NAME;
			oExtension.style["height"] = iHandleExtensionHeight + "px";
			oExtension.style["pointer-events"] = "none";
		}

		// The handle position is relative to the parent Overlay
		function onMouseMove(oEvent) {
			if (oExtension) {
				oHandle.append(oExtension);
				oHandle.extension = oExtension;
			}

			iNewWidth = (oEvent.clientX - iOverlayBoundary) * iDirectionFactor + iHalfOffsetWidth;

			iNewWidth = this._limitNewWidth(oOverlay, iNewWidth);

			// The middle of the handle is on the mouse cursor
			oHandle.style[sBeginDirection] = iNewWidth - oHandle.offsetWidth + "px";
		}

		function onMouseUp() {
			this._finalizeResize(oOverlay, iNewWidth);

			removeFullScreenDiv.call(this);
			this.setDragging(false);
			this.setBusy(false);
		}

		this._oFullScreenDiv.addEventListener("mousemove", this._fnOnMouseMove);
		this._oFullScreenDiv.addEventListener("mouseup", this._fnOnMouseUp);
	};

	Resize.prototype._onDoubleClick = function(oOverlay) {
		var vAction = this.getAction(oOverlay);
		if (vAction.getDoubleClickWidth) {
			var iNewWidth = vAction.getDoubleClickWidth(oOverlay.getElement());
			this._finalizeResize(oOverlay, iNewWidth);
		}
	};

	Resize.prototype._finalizeResize = function(oOverlay, iNewWidth) {
		var iOldWidth = getWidth(oOverlay);

		if (iNewWidth === iOldWidth) {
			return Promise.resolve();
		}

		var fnRestoreEventHandler = function() {
			oOverlay.setSelected(true);
			oOverlay.focus();
			oOverlay.detachEvent("geometryChanged", fnRestoreEventHandler, this);
			oOverlay.attachEvent("geometryChanged", this._onOverlayGeometryChanged, this);
		};

		oOverlay.detachEvent("geometryChanged", this._onOverlayGeometryChanged, this);
		oOverlay.attachEvent("geometryChanged", fnRestoreEventHandler, this);
		oOverlay.setSelected(false);

		return this._createCommand(oOverlay, iNewWidth)
			.catch(function(vError) {
				fnRestoreEventHandler.call(this);
				throw DtUtil.propagateError(
					vError,
					"Resize",
					"Error occurred during resize command creation",
					"sap.ui.rta.plugin"
				);
			}.bind(this));
	};

	Resize.prototype._limitNewWidth = function(oOverlay, iNewWidth) {
		var vAction = this.getAction(oOverlay);
		var oElement = oOverlay.getElement();
		var mSizeLimits = vAction.getSizeLimits && vAction.getSizeLimits(oElement);
		// Prevent resize to negative widths (minimum = 15px)
		var iMinimumWidth = mSizeLimits && mSizeLimits.minimumWidth || MINIMUM_WIDTH;
		var iMaximumWidth = mSizeLimits && mSizeLimits.maximumWidth;

		if (iMinimumWidth && (iNewWidth < iMinimumWidth)) {
			iNewWidth = iMinimumWidth;
		}
		if (iMaximumWidth && (iNewWidth > iMaximumWidth)) {
			iNewWidth = iMaximumWidth;
		}

		return iNewWidth;
	};

	Resize.prototype._createHandle = function(oEvent) {
		var oCurrentHandle = this.getHandle();
		var oOverlay = OverlayRegistry.getOverlay(oEvent.target.id);

		// Mouse is over Overlay without action (e.g. child overlay)
		if (!this.isEnabled([oOverlay])) {
			this._removeHandle(false);
			return;
		}

		// Create the handle and attach it to active overlay
		if (!oCurrentHandle && !this.getDragging()) {
			var oOverlayDomElement = oOverlay.getDomRef();
			var oNewHandle = document.createElement("div");
			oNewHandle.className = HANDLE_CLASS_NAME;
			oOverlayDomElement.append(oNewHandle);
			oNewHandle.style[sBeginDirection] = oOverlayDomElement.clientWidth - oNewHandle.clientWidth + "px";
			oNewHandle.style["z-index"] = ZIndexManager.getNextZIndex();
			oNewHandle.addEventListener("mousedown", this._onHandleMouseDown.bind(this, oOverlay));
			this.setHandle(oNewHandle);
		}
	};

	Resize.prototype._removeHandle = function(bIgnoreDrag) {
		var oHandle = this.getHandle();
		if (oHandle && (bIgnoreDrag || !this.getDragging())) {
			oHandle.remove();
			this.setDragging(false);
			this.setHandle(null);
		}
	};

	Resize.prototype._onOverlayMouseMove = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.target.id);
		if (oOverlay && oOverlay.isSelectable()) {
			this._createHandle(oEvent);
		}
	};

	Resize.prototype._onOverlayKeyDown = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.target.id);
		var iNewWidth;
		// During drag the focus remains on the overlay
		if (oEvent.key === "Escape") {
			this._removeHandle(true);
			if (this._oFullScreenDiv) {
				removeFullScreenDiv.call(this);
			}
			oEvent.stopImmediatePropagation();
			return;
		}
		// Shift + right/left to resize
		if (!oEvent.shiftKey || oEvent.ctrlKey || oEvent.metaKey || oEvent.altKey) {
			return;
		}
		var iCurrentWidth = getWidth(oOverlay);
		if (oEvent.key === "ArrowLeft" || oEvent.key === "ArrowRight") {
			var iDeltaWidth = oEvent.key === "ArrowLeft" ? iKeyboardStep * (-1) : iKeyboardStep;
			iNewWidth = this._limitNewWidth(oOverlay, iCurrentWidth + iDeltaWidth);
			this._finalizeResize(oOverlay, iNewWidth);
		}
	};

	Resize.prototype._onOverlayMouseLeave = function() {
		this._removeHandle(false);
	};

	// Handle selection change via keyboard - show handle without mouseover
	Resize.prototype._onOverlaySelectionChange = function(oEvent) {
		if (oEvent.getParameter("selected")) {
			this._removeHandle(false);
			// Add target.id to DT event so it can be handled like a browser event
			oEvent.target = {
				id: oEvent.getParameter("id")
			};
			this._createHandle(oEvent);
		} else {
			this._removeHandle();
		}
	};

	Resize.prototype._onOverlayFocus = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.target.id);
		if (oOverlay.getSelected() && !this.getHandle()) {
			this._createHandle(oEvent);
		}
	};

	Resize.prototype._onOverlayGeometryChanged = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.getParameter("id"));
		if (oOverlay.getSelected() && oOverlay.hasFocus()) {
			this._removeHandle();
			this._createHandle(oEvent);
		}
	};

	/**
	 * Registers the event handlers for resizing on the enabled overlays
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be registered
	 *
	 * @override
	 */
	Resize.prototype.registerElementOverlay = function(oOverlay) {
		if (this.isEnabled([oOverlay])) {
			oOverlay.attachBrowserEvent("mousemove", this._onOverlayMouseMove, this);
			oOverlay.attachBrowserEvent("mouseleave", this._onOverlayMouseLeave, this);
			oOverlay.attachBrowserEvent("keydown", this._onOverlayKeyDown, this);
			oOverlay.attachBrowserEvent("focus", this._onOverlayFocus, this);
			oOverlay.attachEvent("selectionChange", this._onOverlaySelectionChange, this);
			oOverlay.attachEvent("geometryChanged", this._onOverlayGeometryChanged, this);
		}
		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * De-registers the event handlers for resizing on the previously enabled overlays
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be de-registered
	 *
	 * @override
	 */
	Resize.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent("mousemove", this._onOverlayMouseMove, this);
		oOverlay.detachBrowserEvent("mouseleave", this._onOverlayMouseLeave, this);
		oOverlay.detachBrowserEvent("keydown", this._onOverlayKeyDown, this);
		oOverlay.detachBrowserEvent("focus", this._onOverlayFocus, this);
		oOverlay.detachEvent("selectionChange", this._onOverlaySelectionChange, this);
		oOverlay.detachEvent("geometryChanged", this._onOverlayGeometryChanged, this);
		Plugin.prototype.deregisterElementOverlay.apply(this, arguments);
	};

	/**
	 * Gets the name of the action related to this plugin.
	 * @return {string} Action name
	 */
	Resize.prototype.getActionName = function() {
		return "resize";
	};

	return Resize;
});