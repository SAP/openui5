/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/dt/MutationObserver",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/ScrollbarSynchronizer",
	"sap/ui/dt/Util",
	"sap/base/Log",
	"sap/ui/dt/util/ZIndexManager"
], function(
	Element,
	MutationObserver,
	ElementUtil,
	OverlayUtil,
	DOMUtil,
	ScrollbarSynchronizer,
	Util,
	Log,
	ZIndexManager
) {
	"use strict";

	var OVERLAY_CONTAINER_ID = "overlay-container";
	var oOverlayContainer;
	var oMutationObserver;

	/**
	 * Constructor for an Overlay.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The Overlay allows to create an absolute positioned DIV above the associated element.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @abstract
	 * @since 1.30
	 * @alias sap.ui.dt.Overlay
	 */
	var Overlay = Element.extend("sap.ui.dt.Overlay", /** @lends sap.ui.dt.Overlay.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				/**
				 * Whether the overlay and it's descendants are visible on a screen
				 */
				visible: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Whether the overlay can get the browser focus (has tabindex)
				 */
				focusable: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Whether it's a root overlay
				 */
				isRoot: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Whether overlay is part of an aggregation binding template
				 */
				isPartOfTemplate: {
					type: "boolean",
					defaultValue: false
				}
			},
			associations: {
				/**
				 * ManagedObject associated with an overlay
				 */
				element: {
					type: "sap.ui.base.ManagedObject"
				}
			},
			aggregations: {
				/**
				 * Stores all children of the current overlay
				 */
				children: {
					type: "sap.ui.dt.Overlay",
					multiple: true,
					defaultValue: []
				},

				/**
				 * DesignTime metadata for the associated Element
				 */
				designTimeMetadata: {
					type: "sap.ui.dt.DesignTimeMetadata",
					altTypes: ["function", "object"],
					multiple: false
				}
			},
			events: {
				/**
				 * Fires when overlay is successfully initialized
				 */
				init: {},

				/**
				 * Fires when some errors occurred during initializing process
				 */
				initFailed: {},

				/**
				 * Fires when rendering is successfully completed
				 */
				afterRendering: {},

				/**
				 * Fires before overlay is destroyed
				 */
				beforeDestroy: {},

				/**
				 * Fires when the Overlay is destroyed
				 */
				destroyed: {
					parameters: {}
				},

				/**
				 * Fires when the Overlay visibility is changed
				 */
				visibleChanged: {
					parameters: {
						visible: "boolean"
					}
				},

				/**
				 * Fires when stylies are applied
				 */
				geometryChanged: {},

				/**
				 * Fires when new child is added
				 */
				childAdded: {},

				/**
				 * Fires when scrollbar is synced
				 */
				scrollSynced: {},

				/**
				 * Fires when isRoot is changed
				 */
				isRootChanged: {
					parameters: {
						value: {
							type: "boolean"
						}
					}
				},
				/**
				 * Event fired before geometryChanged event is fired
				 */
				beforeGeometryChanged: {},
				/**
				 * Event fired when the styles applying is required
				 */
				applyStylesRequired: {
					parameters: {
						type: {
							type: "string"
						},
						targetOverlay: {
							type: "sap.ui.dt.ElementOverlay"
						}
					}
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			this._aStyleClasses = this._aStyleClasses.slice(0);
			this._oScrollbarSynchronizers = new Map();
			this._aBindParameters = [];

			Element.apply(this, aArgs);

			if (!this.getElement()) {
				throw Util.createError(
					"Overlay#constructor",
					`Cannot create overlay without a valid element. Expected a descendant of sap.ui.core.Element or sap.ui.core.Component, but ${Util.getObjectType(aArgs[0].element)} was given`
				);
			}

			this.asyncInit()
			.then(function() {
				// Can happen that destroy() is called during asynchronous initialization
				if (this._bShouldBeDestroyed) {
					this.fireInitFailed({
						error: Util.createError(
							"Overlay#asyncInit",
							`ElementOverlay is destroyed during initialization ('${this.getId()}')`
						)
					});
				} else {
					this._bInit = true;
					this.fireInit();
				}
			}.bind(this))
			.catch(function(vError) {
				var oError = Util.propagateError(
					vError,
					"Overlay#asyncInit",
					`Error initializing overlay (id='${this.getId()}'). Original error: ${Util.wrapError(vError).message}`
				);

				this.fireInitFailed({
					error: oError
				});
			}.bind(this));

			// Attach stored browser events
			this.attachEventOnce("afterRendering", function(oEvent) {
				var oDomRef = oEvent.getParameter("domRef");
				this._aBindParameters.forEach(function(mBrowserEvent) {
					if (oDomRef) {
						oDomRef.addEventListener(mBrowserEvent.sEventType, mBrowserEvent.fnProxy);
					}
				});
			}, this);
		},

		/**
		 * Indicates whether overlay is ready
		 * @type {boolean}
		 * @private
		 */
		_bInit: false,

		/**
		 * Indicates whether overlay is rendered
		 * @type {boolean}
		 * @private
		 */
		_bRendered: false,

		/**
		 * Stores reference to the rendered DOM Element
		 * @type {HTMLElement}
		 * @private
		 */
		_oDomRef: null,

		/**
		 * Stores CSS classes for overlay. Please do not mutate this array manually.
		 * Use addStyleClass/removeStyleClass/toggleStyleClass helpers.
		 * @type {Array.<string>}
		 * @private
		 */
		_aStyleClasses: ["sapUiDtOverlay"],

		_bShouldBeDestroyed: false,

		_aBindParameters: null
	});

	// ========================================================
	// Static methods
	// ========================================================

	/**
	 * Creates and/or returns an overlay container element, where all Overlays should be rendered (initially)
	 * @return {Element} overlay container
	 * @static
	 */
	Overlay.getOverlayContainer = function() {
		if (!oOverlayContainer) {
			oOverlayContainer = document.createElement("div");
			oOverlayContainer.id = OVERLAY_CONTAINER_ID;
			document.body.append(oOverlayContainer);
		}
		return oOverlayContainer;
	};

	/**
	 * Removes an overlay container element from DOM
	 * @static
	 */
	Overlay.removeOverlayContainer = function() {
		if (oOverlayContainer) {
			oOverlayContainer.remove();
		}

		oOverlayContainer = undefined;
	};

	/**
	 * Creates and/or returns mutation observer instance
	 * @returns {object} Mutation observer
	 * @static
	 */
	Overlay.getMutationObserver = function() {
		oMutationObserver ||= new MutationObserver();
		return oMutationObserver;
	};

	/**
	 * Destroys mutation observer instance
	 * @static
	 */
	Overlay.destroyMutationObserver = function() {
		if (oMutationObserver) {
			oMutationObserver.destroy();
			oMutationObserver = null;
		}
	};

	// ========================================================
	// Prototype methods
	// ========================================================

	Overlay.prototype.asyncInit = function() {
		return Promise.resolve();
	};

	/**
	 * Returns set of attributes for DOM Node of overlay
	 * @returns {{id: string, "data-sap-ui": string, class: string, tabindex: *}} Object with attributes
	 * @protected
	 */
	Overlay.prototype._getAttributes = function() {
		return {
			id: this.getId(),
			"data-sap-ui": this.getId(),
			"class": this._aStyleClasses.join(" "),
			tabindex: this.isFocusable() ? 0 : -1
		};
	};

	Overlay.prototype._renderChildren = function() {
		return this.getChildren()
		.map((oChild) => {
			// Return the DOM reference of rendered children or render them if not rendered
			return oChild.isRendered() ? oChild.getDomRef() : oChild.render();
		})
		.filter((oChild) => oChild instanceof HTMLElement);
	};

	Overlay.prototype.render = function(bSuppressEvent) {
		if (this.isRendered()) {
			return this.getDomRef();
		}

		// Create the main DOM element
		this._oDomRef = document.createElement("div");
		const oAttributes = this._getAttributes();
		Object.entries(oAttributes).forEach(([key, value]) => {
			if (value !== null) {
				this._oDomRef.setAttribute(key, value);
			}
		});

		// Create the children container
		this._oChildren = document.createElement("div");
		this._oChildren.setAttribute("class", "sapUiDtOverlayChildren");
		this._oDomRef.append(this._oChildren);

		// Append rendered children
		const aChildren = this._renderChildren();
		aChildren.forEach((oChild) => {
			this._oChildren.append(oChild);
		});

		this._bRendered = true;

		if (!bSuppressEvent) {
			this.fireAfterRendering({
				domRef: this._oDomRef
			});
		}

		return this._oDomRef;
	};

	Overlay.prototype.isInit = function() {
		return this._bInit;
	};

	Overlay.prototype.isRendered = function() {
		return this._bRendered;
	};

	Overlay.prototype.isReady = function() {
		return this.isInit() && this.isRendered();
	};

	Overlay.prototype.addStyleClass = function(sClassName) {
		if (!this.hasStyleClass(sClassName)) {
			this._aStyleClasses.push(sClassName);
			if (this.isReady()) {
				this.getDomRef()?.classList.add(sClassName);
			}
		}
	};

	Overlay.prototype.hasStyleClass = function(sClassName) {
		return this._aStyleClasses.indexOf(sClassName) !== -1;
	};

	Overlay.prototype.removeStyleClass = function(sClassName) {
		if (this.hasStyleClass(sClassName)) {
			this._aStyleClasses = this._aStyleClasses.filter(function(sItem) {
				return sItem !== sClassName;
			});
			if (this.isReady()) {
				this.getDomRef()?.classList.remove(sClassName);
			}
		}
	};

	Overlay.prototype.toggleStyleClass = function(sClassName) {
		this[`${this.hasStyleClass(sClassName) ? "remove" : "add"}StyleClass`](sClassName);
	};

	Overlay.prototype.setElement = function(vElement) {
		if (!this.getElement()) {
			this.setAssociation("element", vElement);
			if (this._designTimeMetadataCache) {
				this.setDesignTimeMetadata(this._designTimeMetadataCache);
				delete this._designTimeMetadataCache;
			}
		}
	};

	Overlay.prototype.destroy = function(...aArgs) {
		if (this.bIsDestroyed) {
			Log.error(`FIXME: Do not destroy overlay twice (overlayId = ${this.getId()})!`);
			return;
		}

		this.fireBeforeDestroy();

		Element.prototype.destroy.apply(this, aArgs);
	};

	/**
	 * Called when the Overlay is destroyed
	 * @protected
	 */
	Overlay.prototype.exit = function() {
		this._oScrollbarSynchronizers.forEach(function(oScrollbarSynchronizer) {
			oScrollbarSynchronizer.destroy();
		});
		this._oScrollbarSynchronizers.clear();

		const oDomRef = this.getDomRef();
		if (oDomRef && oDomRef.parentNode) {
			oDomRef.parentNode.removeChild(oDomRef);
		}

		delete this._bInit;
		delete this._bShouldBeDestroyed;
		delete this._oDomRef;
		delete this._oScrollbarSynchronizers;
		this.fireDestroyed();
	};

	Overlay.prototype.setDesignTimeMetadata = function(vMetadata) {
		if (!this.getElement()) {
			this._designTimeMetadataCache = vMetadata;
		} else {
			this.setAggregation("designTimeMetadata", vMetadata);
		}
	};

	/**
	 * Retrieves reference to the plain DOM Element
	 * @return {Element} - DOM Element or null if overlay is not rendered yet
	 * @public
	 */
	Overlay.prototype.getDomRef = function() {
		return this._oDomRef;
	};

	Overlay.prototype.getChildrenDomRef = function() {
		return this._oChildren;
	};

	/**
	 * Returns a DOM reference for the associated Element or null, if it can't be found
	 * @public
	 */
	Overlay.prototype.getAssociatedDomRef = function() {
		throw new Error("This method is abstract and needs to be implemented");
	};

	/**
	 * Returns an instance of the Element, which is associated with this Overlay
	 * @return {sap.ui.core.Element} associated Element
	 * @public
	 */
	Overlay.prototype.getElement = function() {
		return ElementUtil.getElementInstance(this.getAssociation("element"));
	};

	/**
	 * Checks whether focus is on the overlay
	 * @return {boolean} - true if the overlay has browser focus
	 * @public
	 */
	Overlay.prototype.hasFocus = function() {
		return document.activeElement === this.getDomRef();
	};

	Overlay.prototype.focus = function() {
		this.getDomRef()?.focus();
	};

	/**
	 * Sets whether the overlay can get the browser focus (tabindex)
	 * @param {boolean} bFocusable - true if the overlay is focusable
	 * @public
	 */
	Overlay.prototype.setFocusable = function(bFocusable) {
		bFocusable = !!bFocusable;
		if (this.getFocusable() !== bFocusable) {
			this.setProperty("focusable", bFocusable);
			this.toggleStyleClass("sapUiDtOverlayFocusable");
			this.getDomRef()?.setAttribute("tabindex", bFocusable ? 0 : -1);
		}
	};

	/**
	 * Returns if the Overlay can get the focus
	 * @public
	 * @return {boolean} - true if the overlay is focusable
	 */
	Overlay.prototype.isFocusable = function() {
		return this.getFocusable();
	};

	/**
	 * Returns valuable parent DOM element that has dimensions and certain position.
	 * @returns {HTMLElement|null} Parent DOM element or null, if there is none
	 * @protected
	 */
	Overlay.prototype._getRenderingParent = function() {
		return this.isRoot() ? null : this.getParent().getDomRef();
	};

	/**
	 * Calculate and update CSS styles for the Overlay's DOM
	 * The calculation is based on original associated DOM state and parent overlays
	 * This method also calls "applyStyles" method for every child Overlay of this Overlay (cascade)
	 * @param {boolean} bForceScrollbarSync - `true` to force a scrollbars synchronisation if there are any
	 * @param {boolean} bSkipForceCalculation - `true` to skip the geometry calculation (geometry was already cached)
	 * @returns {Promise} Resolves as soon as <code>applyStyles</code> is done
	 * @public
	 */
	Overlay.prototype.applyStyles = function(bForceScrollbarSync, bSkipForceCalculation) {
		var oGeometry;
		this.fireBeforeGeometryChanged();

		if (!this.isRendered() || this._bIsBeingDestroyed || this.getShouldBeDestroyed()) {
			return Promise.resolve();
		}

		// If not done before, re-calculate the Geometry to cache the values for the isVisible() check
		if (this.getVisible()) {
			oGeometry = this.getGeometry(!bSkipForceCalculation);
		}

		var oGeometryChangedPromise = Promise.resolve();
		if (this.isVisible()) {
			if (oGeometry && oGeometry.visible) {
				this._ensureVisibility(this.getDomRef());
				this._setSize(this.getDomRef(), oGeometry);
				var oRenderingParent = this._getRenderingParent();

				if (!this.isRoot()) {
					var aPromises = [];
					this.getParent()._oScrollbarSynchronizers.forEach(function(oScrollbarSynchronizer) {
						if (oScrollbarSynchronizer.isSyncing()) {
							aPromises.push(
								new Promise(function(fnResolve) {
									oScrollbarSynchronizer.attachEventOnce("synced", fnResolve);
									oScrollbarSynchronizer.attachEventOnce("destroyed", fnResolve);
								})
							);
						}
					});
					if (aPromises.length) {
						oGeometryChangedPromise = Promise.all(aPromises).then(function() {
							return this._applySizes(oGeometry, oRenderingParent, bForceScrollbarSync);
						}.bind(this));
					} else {
						oGeometryChangedPromise = this._applySizes(oGeometry, oRenderingParent, bForceScrollbarSync);
					}
				} else {
					oGeometryChangedPromise = this._applySizes(oGeometry, oRenderingParent, bForceScrollbarSync);
				}
			} else {
				this.getDomRef().style.display = "none";
			}
		} else {
			this.getDomRef().style.display = "none";
		}

		// TODO: refactor geometryChanged event
		return oGeometryChangedPromise
		.catch(function(vError) {
			Log.error(Util.createError(
				"Overlay#applyStyles",
				`An error occurred during applySizes calculation: ${vError}`
			));
		})
		.then(function() {
			this.fireGeometryChanged();
		}.bind(this));
	};

	Overlay.prototype._applySizes = function(oGeometry, oRenderingParent, bForceScrollbarSync) {
		this._setPosition(this.getDomRef(), oGeometry, oRenderingParent, bForceScrollbarSync);
		if (oGeometry.domRef) {
			this._setZIndex(oGeometry, this.getDomRef());
		}
		// We need to know when all our children have correct positions
		var aPromises = this.getChildren()
		.filter(function(oChild) {
			return oChild.isRendered();
		})
		.map(function(oChild) {
			var mParameters = {};
			mParameters.bForceScrollbarSync = bForceScrollbarSync;
			return new Promise(function(fnResolve) {
				oChild.attachEventOnce("geometryChanged", fnResolve);
				oChild.fireApplyStylesRequired(mParameters);
			});
		});
		return Promise.all(aPromises);
	};

	/**
	 * Sets z-index to specified DOM element.
	 * If no pre-existing z-index value exists for a root element,
	 * then ZIndexManager is used to calculate a z-index value lower than open popups and higher than other controls.
	 * @see sap.ui.core.util.ZIndexManager
	 * @param {object} oGeometry - Geometry object to get reference z-index from
	 * @param {HTMLObject} oOverlayDomRef - DOM element to receive the z-index
	 */
	Overlay.prototype._setZIndex = function(oGeometry, oOverlayDomRef) {
		var oOriginalDomRef = oGeometry.domRef;
		var iZIndex = DOMUtil.getZIndex(oOriginalDomRef);
		if (Util.isInteger(iZIndex)) {
			oOverlayDomRef.style.zIndex = iZIndex;
		} else if (this.isRoot()) {
			this._iZIndex ||= ZIndexManager.getZIndexBelowPopups();
			oOverlayDomRef.style.zIndex = this._iZIndex;
		}
	};

	/**
	 * Ensures that the DOM element is visible
	 * @param {HTMLElement} oTarget - DOM element which we will ensure visibility
	 * @protected
	 */
	Overlay.prototype._ensureVisibility = function(oTarget) {
		oTarget.style.display = "block";
	};

	/**
	 * Sets size to specified DOM Element
	 * @param {HTMLElement} oTarget - DOM element which will receive new size
	 * @param {object} oGeometry - Geometry object to get new dimensions from
	 * @protected
	 */
	Overlay.prototype._setSize = function(oTarget, oGeometry) {
		var mSize = oGeometry.size;

		// ASSIGN SIZE
		oTarget.style.width = `${mSize.width}px`;
		oTarget.style.height = `${mSize.height}px`;
	};

	/**
	 * Sets position of specified DOM element
	 * @param {HTMLElement} oTarget - DOM element which will receive new position
	 * @param {object} oGeometry - Geometry object to get positioning from
	 * @param {HTMLElement} oParent - Offset element for position calculation
	 * @protected
	 */
	Overlay.prototype._setPosition = function(oTarget, oGeometry, oParent) {
		var mPosition = DOMUtil.getOffsetFromParent(oGeometry, oParent);
		oTarget.style.transform = `translate(${mPosition.left}px, ${mPosition.top}px)`;
	};

	/**
	 * Sets clip-path of specified DOM element
	 * @param {HTMLElement} oTarget - DOM element which will receive new clip-path property
	 * @param {HTMLElement} oSource - DOM element from which the clip-path property will be copied
	 */
	Overlay.prototype._setClipPath = function(oTarget, oSource) {
		var sClipPath = window.getComputedStyle(oSource).clipPath;
		oTarget.style.clipPath = sClipPath;
	};

	Overlay.prototype.attachBrowserEvent = function(sEventType, fnHandler, oListener) {
		if (sEventType && (typeof (sEventType) === "string")) { // do nothing if the first parameter is empty or not a string
			if (typeof fnHandler === "function") { // also do nothing if the second parameter is not a function
				// store the parameters for on()
				this._aBindParameters ||= [];
				oListener ||= this;

				var fnProxy = fnHandler.bind(oListener);

				this._aBindParameters.push({
					sEventType,
					fnHandler,
					oListener,
					fnProxy
				});

				// If the control is rendered, directly add the event listener
				const oDomRef = this.getDomRef();
				if (oDomRef) {
					oDomRef.addEventListener(sEventType, fnProxy);
				}
			}
		}

		return this;
	};

	/**
	 * Removes event handlers which have been previously attached using {@link #attachBrowserEvent}.
	 *
	 * Note: listeners are only removed, if the same combination of event type, callback function
	 * and context object is given as in the call to <code>attachBrowserEvent</code>.
	 *
	 * @param {string} [sEventType] - String containing one or more JavaScript event types, such as "click" or "blur".
	 * @param {function} [fnHandler] - Function that is to be no longer executed.
	 * @param {object} [oListener] - Context object that was given in the call to <code>attachBrowserEvent</code>.
	 * @returns {sap.ui.dt.Overlay} <code>this</code> object
	 * @public
	 */
	Overlay.prototype.detachBrowserEvent = function(sEventType, fnHandler, oListener) {
		if (sEventType && (typeof (sEventType) === "string")) { // do nothing if the first parameter is empty or not a string
			if (typeof (fnHandler) === "function") { // also do nothing if the second parameter is not a function
				oListener ||= this;

				// remove the bind parameters from the stored array
				if (this._aBindParameters) {
					var oParamSet;
					var oDomRef = this.getDomRef();
					for (var i = this._aBindParameters.length - 1; i >= 0; i--) {
						oParamSet = this._aBindParameters[i];
						if (oParamSet.sEventType === sEventType && oParamSet.fnHandler === fnHandler && oParamSet.oListener === oListener) {
							this._aBindParameters.splice(i, 1);
							// if control is rendered, directly call off()
							if (oDomRef) {
								oDomRef.removeEventListener(sEventType, oParamSet.fnProxy);
							}
						}
					}
				}
			}
		}

		return this;
	};

	/**
	 * Cleans up when scrolling is no longer needed in the overlay.
	 * @param {HTMLElement} oTargetDomRef - DOM reference to the element where dummy container is located.
	 * @param {sap.ui.dt.ElementOverlay} [oTargetOverlay] - Overlay which holds scrollbar padding via CSS classes. In case of root overlay, the target is undefined.
	 * @param {Element} oOriginalDomRef - DomRef for the original element.
	 * @private
	 */
	Overlay.prototype._deleteDummyContainer = function(oTargetDomRef, oTargetOverlay, oOriginalDomRef) {
		var aDummyScrollContainer = oTargetDomRef.querySelectorAll(":scope > .sapUiDtDummyScrollContainer");
		if (aDummyScrollContainer.length) {
			var oScrollbarSynchronizer = this._oScrollbarSynchronizers.get(oTargetDomRef);
			aDummyScrollContainer[0].remove();
			// Ensure that the element positions are synced before destroying
			oScrollbarSynchronizer.attachEventOnce("synced", function() {
				oScrollbarSynchronizer.destroy();
				this._oScrollbarSynchronizers.delete(oTargetDomRef);
				if (
					oTargetOverlay._oScrollbarSynchronizers.size === 0
					&& !oTargetOverlay.getChildren().some(function(oAggregationOverlay) {
						return oAggregationOverlay._oScrollbarSynchronizers.size > 0;
					})
				) {
					oTargetOverlay.removeStyleClass("sapUiDtOverlayWithScrollBar");
					oTargetOverlay.removeStyleClass("sapUiDtOverlayWithScrollBarVertical");
					oTargetOverlay.removeStyleClass("sapUiDtOverlayWithScrollBarHorizontal");
				}
			}.bind(this));
			oScrollbarSynchronizer.sync(oOriginalDomRef, true);
		}
	};

	/**
	 * Handle overflow from controls and sync with overlay
	 * @private
	 */
	Overlay.prototype._handleOverflowScroll = function(oGeometry, oTargetDomRef, oTargetOverlay, bForceScrollbarSync) {
		var oOriginalDomRef = oGeometry.domRef;
		var mSize = oGeometry.size;

		// OVERFLOW & SCROLLING
		var oOverflows = DOMUtil.getOverflows(oOriginalDomRef);

		oTargetDomRef.style.overflowX = oOverflows.overflowX;
		oTargetDomRef.style.overflowY = oOverflows.overflowY;

		var iScrollHeight = oOriginalDomRef.scrollHeight;
		var iScrollWidth = oOriginalDomRef.scrollWidth;
		var oDummyScrollContainer = oTargetDomRef.querySelector(":scope> .sapUiDtDummyScrollContainer");

		// Math.ceil is needed because iScrollHeight is an integer value, mSize not. To compare we should have an integer value for mSize too.
		// example: iScrollHeight = 24px, mSize.height = 23.98375. Both should be the same.
		if (iScrollHeight > Math.ceil(mSize.height) || iScrollWidth > Math.ceil(mSize.width)) {
			var oScrollbarSynchronizer;
			if (!oDummyScrollContainer) {
				oDummyScrollContainer = document.createElement("div");
				oDummyScrollContainer.classList.add("sapUiDtDummyScrollContainer");
				oDummyScrollContainer.style.height = `${iScrollHeight}px`;
				oDummyScrollContainer.style.width = `${iScrollWidth}px`;

				if (
					oTargetOverlay
					&& DOMUtil.hasVerticalScrollBar(oOriginalDomRef)
					&& oTargetOverlay._hasSameSize(oGeometry, "height")
				) {
					oTargetOverlay.addStyleClass("sapUiDtOverlayWithScrollBar");
					oTargetOverlay.addStyleClass("sapUiDtOverlayWithScrollBarVertical");
				}

				if (
					oTargetOverlay
					&& DOMUtil.hasHorizontalScrollBar(oOriginalDomRef)
					&& oTargetOverlay._hasSameSize(oGeometry, "width")
				) {
					oTargetOverlay.addStyleClass("sapUiDtOverlayWithScrollBar");
					oTargetOverlay.addStyleClass("sapUiDtOverlayWithScrollBarHorizontal");
				}
				oTargetDomRef.append(oDummyScrollContainer);
				oScrollbarSynchronizer = new ScrollbarSynchronizer({
					synced: this.fireScrollSynced.bind(this)
				});
				oScrollbarSynchronizer.addTarget(oOriginalDomRef, oTargetDomRef);
				this._oScrollbarSynchronizers.set(oTargetDomRef, oScrollbarSynchronizer);
			} else {
				oDummyScrollContainer.style.height = `${iScrollHeight}px`;
				oDummyScrollContainer.style.width = `${iScrollWidth}px`;
				oScrollbarSynchronizer = this._oScrollbarSynchronizers.get(oTargetDomRef);
				if (!oScrollbarSynchronizer.hasTarget(oOriginalDomRef)) {
					oScrollbarSynchronizer.addTarget(oOriginalDomRef);
				}
			}

			if (bForceScrollbarSync) {
				oScrollbarSynchronizer.sync(oOriginalDomRef, true);
			}
		} else {
			this._deleteDummyContainer(oTargetDomRef, oTargetOverlay, oOriginalDomRef);
		}
	};

	/**
	 * Returns an object, which describes the DOM geometry of the element associated with this overlay or null if it can't be found
	 * The geometry is calculated based on the associated element's DOM reference, if it exists or based on it's public children
	 * Object may contain following fields: position - absolute position of Element in DOM; size - absolute size of Element in DOM
	 * Object may contain domRef field, when the associated Element's DOM can be found
	 * @param {boolean} bForceCalculation - Forces the recalculation of the geometry
	 * @return {object} geometry object describing the DOM of the Element associated with this Overlay
	 * @public
	 */
	Overlay.prototype.getGeometry = function(bForceCalculation) {
		if (bForceCalculation || !this._mGeometry) {
			var oDomRef = this.getAssociatedDomRef();
			var aChildrenGeometry;

			// oDomRef is either on DOM Node or an array of DOM nodes
			if (oDomRef) {
				var bIsRoot = this.isRoot();
				if (oDomRef instanceof Array) {
					aChildrenGeometry = oDomRef.map(function(oElement) {
						return DOMUtil.getGeometry(oElement, bIsRoot);
					});
				} else {
					aChildrenGeometry = [DOMUtil.getGeometry(oDomRef, bIsRoot)];
				}
			} else {
				aChildrenGeometry = this.getChildren().map(function(oChildOverlay) {
					return oChildOverlay.getGeometry(true);
				});
			}

			if (aChildrenGeometry.length) {
				// cache geometry
				this._mGeometry = aChildrenGeometry.length > 1 ? OverlayUtil.getGeometry(aChildrenGeometry) : aChildrenGeometry[0];
			} else {
				delete this._mGeometry;
			}
		}

		return this._mGeometry;
	};

	/**
	 * Sets whether the Overlay is visible
	 * @param {boolean} bVisible if the Overlay is visible
	 * @public
	 */
	Overlay.prototype.setVisible = function(bVisible) {
		bVisible = !!bVisible;
		if (this.getVisible() !== bVisible) {
			this.setProperty("visible", bVisible);
			const oDomRef = this.getDomRef();
			if (oDomRef) {
				oDomRef.style.visibility = bVisible ? "" : "hidden";
			}
			this.fireVisibleChanged({
				visible: bVisible
			});
		}
	};

	/**
	 * Returns if the Overlay is visible
	 * @return {boolean} if the overlay is visible
	 * @public
	 */
	Overlay.prototype.isVisible = function() {
		return (
			this.getVisible()
			&& (this.isRoot() ? true : this.getParent().isVisible())
		);
	};

	Overlay.prototype.setIsRoot = function(bValue) {
		bValue = !!bValue;

		if (this.getIsRoot() !== bValue) {
			this.setProperty("isRoot", bValue);
			this.fireIsRootChanged({
				value: bValue
			});
		}
	};

	/**
	 * Alias for this.getIsRoot()
	 * @return {boolean} - true if the overlay is root one
	 * @public
	 */
	Overlay.prototype.isRoot = function() {
		return this.getIsRoot();
	};

	/**
	 * Returns true if the overlay should be destroyed
	 *
	 * @return {boolean} - true if overlay is scheduled to be destroyed
	 * @public
	 */
	Overlay.prototype.getShouldBeDestroyed = function() {
		return this._bShouldBeDestroyed;
	};

	return Overlay;
});