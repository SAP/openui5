/*!
 * ${copyright}
 */

/* global Map */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Element",
	"sap/ui/dt/MutationObserver",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/ScrollbarSynchronizer",
	"sap/ui/dt/Util",
	"sap/base/Log",
	"sap/ui/dt/util/ZIndexManager"
],
function (
	jQuery,
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
	var $OverlayContainer;
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
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
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
					multiple: true
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
				 * @private
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
				beforeGeometryChanged : {},
				/**
				 * Event fired when the styles applying is required
				 */
				applyStylesRequired: {
					parameters: {
						type: {
							type : "string"
						},
						targetOverlay: {
							type : "sap.ui.dt.ElementOverlay"
						}
					}
				}
			}
		},
		constructor: function () {
			this._aStyleClasses = this._aStyleClasses.slice(0);
			this._oScrollbarSynchronizers = new Map();
			this._aBindParameters = [];

			Element.apply(this, arguments);

			if (!this.getElement()) {
				throw Util.createError(
					"Overlay#constructor",
					Util.printf(
						"Cannot create overlay without a valid element. Expected a descendant of sap.ui.core.Element or sap.ui.core.Component, but {0} was given",
						Util.getObjectType(arguments[0].element)
					)
				);
			}

			this.asyncInit()
				.then(function () {
					// Can happen that destroy() is called during asynchronous initialization
					if (this._bShouldBeDestroyed) {
						this.fireInitFailed({
							error: Util.createError(
								"Overlay#asyncInit",
								"ElementOverlay is destroyed during initialization ('" + this.getId() + "')"
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
						Util.printf(
							"Can't initialize overlay (id='{0}') properly. Original error: {1}",
							this.getId(),
							Util.wrapError(vError).message
						)
					);

					this.fireInitFailed({
						error: oError
					});
				}.bind(this));

			// Attach stored browser events
			this.attachEventOnce('afterRendering', function (oEvent) {
				var $DomRef = jQuery(oEvent.getParameter('domRef'));
				this._aBindParameters.forEach(function (mBrowserEvent) {
					$DomRef.on(mBrowserEvent.sEventType, mBrowserEvent.fnProxy);
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
		 * Stores reference to the rendered DOM Element wrapped into jQuery object
		 * @type {jQuery}
		 * @private
		 */
		_$DomRef: null,

		/**
		 * Stores CSS classes for overlay. Please do not mutate this array manually.
		 * Use addStyleClass/removeStyleClass/toggleStyleClass helpers.
		 * @type {Array.<string>}
		 * @private
		 */
		_aStyleClasses: ['sapUiDtOverlay'],

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
		if (!$OverlayContainer) {
			$OverlayContainer = jQuery("<div/>").attr('id', OVERLAY_CONTAINER_ID).appendTo("body");
		}
		return $OverlayContainer;
	};

	/**
	 * Removes an overlay container element from DOM
	 * @static
	 */
	Overlay.removeOverlayContainer = function() {
		if ($OverlayContainer) {
			$OverlayContainer.remove();
		}

		$OverlayContainer = undefined;
	};

	/**
	 * Creates and/or returns mutation observer instance
	 * @static
	 */
	Overlay.getMutationObserver = function() {
		if (!oMutationObserver) {
			oMutationObserver = new MutationObserver();
		}
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

	Overlay.prototype.asyncInit = function () {
		return Promise.resolve();
	};

	/**
	 * Returns set of attributes for DOM Node of overlay
	 * @returns {{id: string, "data-sap-ui": string, class: string, tabindex: *}}
	 * @protected
	 */
	Overlay.prototype._getAttributes = function () {
		return {
			id: this.getId(),
			"data-sap-ui": this.getId(),
			"class": this._aStyleClasses.join(" "),
			tabindex: this.isFocusable() ? 0 : null
		};
	};

	Overlay.prototype._renderChildren = function () {
		return this.getChildren().map(function (oChild) {
			// If a rendered element is being moved to a parent that was just created, it should not be rendered again
			return oChild.isRendered() ? oChild.$() : oChild.render();
		});
	};

	Overlay.prototype.render = function (bSuppressEvent) {
		if (this.isRendered()) {
			return this.getDomRef();
		}

		this._$DomRef = jQuery('<div/>').attr(this._getAttributes());

		this._$Children = jQuery('<div/>').attr({
			"class": "sapUiDtOverlayChildren"
		}).appendTo(this._$DomRef);

		this._$Children.append(this._renderChildren());

		this._bRendered = true;

		if (!bSuppressEvent) {
			this.fireAfterRendering({
				domRef: this._$DomRef.get(0)
			});
		}

		return this._$DomRef;
	};

	Overlay.prototype.isInit = function () {
		return this._bInit;
	};

	Overlay.prototype.isRendered = function () {
		return this._bRendered;
	};

	Overlay.prototype.isReady = function () {
		return this.isInit() && this.isRendered();
	};


	Overlay.prototype.addStyleClass = function (sClassName) {
		if (!this.hasStyleClass(sClassName)) {
			this._aStyleClasses.push(sClassName);
			if (this.isReady()) {
				this.$().addClass(sClassName);
			}
		}
	};

	Overlay.prototype.hasStyleClass = function (sClassName) {
		return this._aStyleClasses.indexOf(sClassName) !== -1;
	};

	Overlay.prototype.removeStyleClass = function (sClassName) {
		if (this.hasStyleClass(sClassName)) {
			this._aStyleClasses = this._aStyleClasses.filter(function (sItem) {
				return sItem !== sClassName;
			});
			if (this.isReady()) {
				this.$().removeClass(sClassName);
			}
		}
	};

	Overlay.prototype.toggleStyleClass = function (sClassName) {
		this[(this.hasStyleClass(sClassName) ? 'remove' : 'add') + 'StyleClass'](sClassName);
	};

	Overlay.prototype.setElement = function (vElement) {
		if (!this.getElement()) {
			this.setAssociation("element", vElement);
			if (this._designTimeMetadataCache) {
				this.setDesignTimeMetadata(this._designTimeMetadataCache);
				delete this._designTimeMetadataCache;
			}
		}
	};

	Overlay.prototype.destroy = function () {
		if (this.bIsDestroyed) {
			Log.error('FIXME: Do not destroy overlay twice (overlayId = ' + this.getId() + ')!');
			return;
		}

		this.fireBeforeDestroy();

		Element.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Called when the Overlay is destroyed
	 * @protected
	 */
	Overlay.prototype.exit = function() {
		this._oScrollbarSynchronizers.forEach(function (oScrollbarSynchronizer) {
			oScrollbarSynchronizer.destroy();
		});
		this._oScrollbarSynchronizers.clear();

		this.$().remove();
		delete this._bInit;
		delete this._bShouldBeDestroyed;
		delete this._$DomRef;
		delete this._oScrollbarSynchronizers;
		this.fireDestroyed();
	};

	Overlay.prototype.setDesignTimeMetadata = function (vMetadata) {
		if (!this.getElement()) {
			this._designTimeMetadataCache = vMetadata;
		} else {
			this.setAggregation('designTimeMetadata', vMetadata);
		}
	};

	/**
	 * Retrieves reference to the plain DOM Element
	 * @return {Element} - DOM Element or null if overlay is not rendered yet
	 * @public
	 */
	Overlay.prototype.getDomRef = function() {
		return this.$().get(0);
	};

	Overlay.prototype.getChildrenDomRef = function () {
		return this._$Children.get(0);
	};

	/**
	 * Retrieves reference to the DOM Element wrapped into jQuery object
	 * @return {jQuery} - jQuery with DOM Element inside
	 * @public
	 */
	Overlay.prototype.$ = function () {
		return this._$DomRef || jQuery();
	};

	/**
	 * Returns a DOM reference for the associated Element or null, if it can't be found
	 * @public
	 */
	Overlay.prototype.getAssociatedDomRef = function() {
		throw new Error("This method is abstract and needs to be implemented");
	};

	/**
	 * FIXME: backwards compatibility, remove when possible
	 * Returns an instance of the Element, which is associated with this Overlay
	 * @return {sap.ui.Element} associated Element
	 * @public
	 * @deprecated
	 */
	Overlay.prototype.getElementInstance = function() {
		return this.getElement();
	};

	/**
	 * Returns an instance of the Element, which is associated with this Overlay
	 * @return {sap.ui.Element} associated Element
	 * @public
	 */
	Overlay.prototype.getElement = function () {
		return ElementUtil.getElementInstance(this.getAssociation('element'));
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
		this.$().focus();
	};

	/**
	 * Sets whether the overlay can get the browser focus (tabindex)
	 * @param {boolean} bFocusable - true if the overlay is focusable
	 * @returns {sap.ui.dt.Overlay} returns this
	 * @public
	 */
	Overlay.prototype.setFocusable = function(bFocusable) {
		bFocusable = !!bFocusable;
		if (this.getFocusable() !== bFocusable) {
			this.setProperty("focusable", bFocusable);
			this.toggleStyleClass("sapUiDtOverlayFocusable");
			this.$().attr("tabindex", bFocusable ? 0 : null);
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
	 * Returns valuable parent node that has dimensions and certain position.
	 * @returns {jQuery|null}
	 * @protected
	 */
	Overlay.prototype._getRenderingParent = function () {
		return this.isRoot() ? null : this.getParent().$();
	};

	/**
	 * Calculate and update CSS styles for the Overlay's DOM
	 * The calculation is based on original associated DOM state and parent overlays
	 * This method also calls "applyStyles" method for every child Overlay of this Overlay (cascade)
	 * @param {boolean} bForceScrollbarSync - `true` to force a scrollbars synchronisation if there are any
	 * @public
	 */
	Overlay.prototype.applyStyles = function (bForceScrollbarSync) {
		this.fireBeforeGeometryChanged();

		if (!this.isRendered() || this._bIsBeingDestroyed || this.getShouldBeDestroyed()) {
			return;
		}

		if (this.isVisible()) {
			var oGeometry = this.getGeometry(true);

			if (oGeometry && oGeometry.visible) {
				this._setSize(this.$(), oGeometry);
				var $RenderingParent = this._getRenderingParent();

				if (!this.isRoot()) {
					var aPromises = [];
					this.getParent()._oScrollbarSynchronizers.forEach(function(oShr) {
						if (oShr._bSyncing) {
							aPromises.push(
								new Promise(function (fnResolve) {
									oShr.attachEventOnce('synced', fnResolve);
								})
							);
						}
					});
					if (aPromises.length) {
						Promise.all(aPromises).then(function () {
							this._applySizes(oGeometry, $RenderingParent, bForceScrollbarSync);
							this.fireGeometryChanged();
						}.bind(this));
					} else {
						this._applySizes(oGeometry, $RenderingParent, bForceScrollbarSync);
					}
				} else {
					this._applySizes(oGeometry, $RenderingParent, bForceScrollbarSync);
				}
			} else {
				this.$().css("display", "none");
			}
		} else {
			this.$().css("display", "none");
		}

		// TODO: refactor geometryChanged event
		if (!aPromises || !aPromises.length) {
			this.fireGeometryChanged();
		}
	};

	Overlay.prototype._applySizes = function (oGeometry, $RenderingParent, bForceScrollbarSync) {
		this._setPosition(this.$(), oGeometry, $RenderingParent, bForceScrollbarSync);
		if (oGeometry.domRef) {
			this._setZIndex(oGeometry, this.$());
		}

		this.getChildren().forEach(function(oChild) {
			var mParameters = {};
			mParameters.bForceScrollbarSync = bForceScrollbarSync;
			oChild.fireApplyStylesRequired(mParameters);
		});
	};

	/**
	 * Sets z-index to specified DOM element.
	 * If no pre-existing z-index value exists for a root element,
	 * then ZIndexManager is used to calculate a z-index value lower than open popups and higher than other controls.
	 * @see sap.ui.core.util.ZIndexManager
	 * @param {object} oGeometry - Geometry object to get reference z-index from
	 * @param {jQuery} $overlayDomRef - DOM Element to receive the z-index
	 */
	Overlay.prototype._setZIndex = function (oGeometry, $overlayDomRef) {
		var oOriginalDomRef = oGeometry.domRef;
		var iZIndex = DOMUtil.getZIndex(oOriginalDomRef);
		if (Util.isInteger(iZIndex)) {
			$overlayDomRef.css("z-index", iZIndex);
		} else if (this.isRoot()) {
			this._iZIndex = this._iZIndex || ZIndexManager.getZIndexBelowPopups();
			$overlayDomRef.css("z-index", this._iZIndex);
		}
	};

	/**
	 * Sets size to specified DOM Element
	 * @param {jQuery} $Target - DOM Element which will receive new size
	 * @param {object} oGeometry - Geometry object to get new dimensions from
	 * @protected
	 */
	Overlay.prototype._setSize = function($Target, oGeometry) {
		// ensure visibility
		$Target.css("display", "block"); // FIXME: this method should not be responsible for visibility

		var mSize = oGeometry.size;

		// ASSIGN SIZE
		$Target.css("width", mSize.width + "px");
		$Target.css("height", mSize.height + "px");
	};

	/**
	 * Sets position of specified DOM Element
	 * @param {jQuery} $Target - DOM Element which will receive new position
	 * @param {object} oGeometry - Geometry object to get positioning from
	 * @param {jQuery} $Parent - Offset element for position calculation
	 * @protected
	 */
	Overlay.prototype._setPosition = function($Target, oGeometry, $Parent) {
		var mPosition = DOMUtil.getOffsetFromParent(oGeometry, $Parent ? $Parent.get(0) : null);
		$Target.css("transform", "translate(" + mPosition.left + "px, " + mPosition.top + "px)");
	};

	Overlay.prototype.attachBrowserEvent = function(sEventType, fnHandler, oListener) {
		if (sEventType && (typeof (sEventType) === "string")) { // do nothing if the first parameter is empty or not a string
			if (typeof fnHandler === "function") {   // also do nothing if the second parameter is not a function
				// store the parameters for bind()
				if (!this._aBindParameters) {
					this._aBindParameters = [];
				}
				oListener = oListener || this;

				// FWE jQuery.proxy can't be used as it breaks our contract when used with same function but different listeners
				var fnProxy = fnHandler.bind(oListener);

				this._aBindParameters.push({
					sEventType: sEventType,
					fnHandler: fnHandler,
					oListener: oListener,
					fnProxy : fnProxy
				});

				// if control is rendered, directly call bind()
				this.$().on(sEventType, fnProxy);
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
	 * @param {string} [sEventType] A string containing one or more JavaScript event types, such as "click" or "blur".
	 * @param {function} [fnHandler] The function that is to be no longer executed.
	 * @param {object} [oListener] The context object that was given in the call to <code>attachBrowserEvent</code>.
	 * @public
	 */
	Overlay.prototype.detachBrowserEvent = function(sEventType, fnHandler, oListener) {
		if (sEventType && (typeof (sEventType) === "string")) { // do nothing if the first parameter is empty or not a string
			if (typeof (fnHandler) === "function") {   // also do nothing if the second parameter is not a function
				oListener = oListener || this;

				// remove the bind parameters from the stored array
				if (this._aBindParameters) {
					var $ = this.$();
					var oParamSet;
					for (var i = this._aBindParameters.length - 1; i >= 0; i--) {
						oParamSet = this._aBindParameters[i];
						if (oParamSet.sEventType === sEventType && oParamSet.fnHandler === fnHandler && oParamSet.oListener === oListener) {
							this._aBindParameters.splice(i, 1);
							// if control is rendered, directly call unbind()
							$.unbind(sEventType, oParamSet.fnProxy);
						}
					}
				}
			}
		}

		return this;
	};

	/**
	 * Cleans up when scrolling is no longer needed in the overlay
	 * @param {jQuery} $TargetDomRef - DOM reference to the element where dummy container is located
	 * @param {sap.ui.dt.ElementOverlay} [oTargetOverlay]
	 *        Overlay which holds scrollbar padding via CSS classes. In case of root overlay, the target is undefined.
	 *
	 * @private
	 */
	Overlay.prototype._deleteDummyContainer = function($TargetDomRef, oTargetOverlay) {
		var $DummyScrollContainer = $TargetDomRef.find(">.sapUiDtDummyScrollContainer");
		if ($DummyScrollContainer.length) {
			$DummyScrollContainer.remove();
			this._oScrollbarSynchronizers.get($TargetDomRef.get(0)).destroy();
			this._oScrollbarSynchronizers.delete($TargetDomRef.get(0));
			if (
				oTargetOverlay._oScrollbarSynchronizers.size === 0
				&& !oTargetOverlay.getChildren().some(function (oAggregationOverlay) {
					return oAggregationOverlay._oScrollbarSynchronizers.size > 0;
				})
			) {
				oTargetOverlay.removeStyleClass("sapUiDtOverlayWithScrollBar");
				oTargetOverlay.removeStyleClass("sapUiDtOverlayWithScrollBarVertical");
				oTargetOverlay.removeStyleClass("sapUiDtOverlayWithScrollBarHorizontal");
			}
		}
	};

	/**
	 * Handle overflow from controls and sync with overlay
	 * @private
	 */
	Overlay.prototype._handleOverflowScroll = function(oGeometry, $TargetDomRef, oTargetOverlay, bForceScrollbarSync) {
		var oOriginalDomRef = oGeometry.domRef;
		var mSize = oGeometry.size;

		// OVERFLOW & SCROLLING
		var oOverflows = DOMUtil.getOverflows(oOriginalDomRef);

		$TargetDomRef.css("overflow-x", oOverflows.overflowX);
		$TargetDomRef.css("overflow-y", oOverflows.overflowY);

		var iScrollHeight = oOriginalDomRef.scrollHeight;
		var iScrollWidth = oOriginalDomRef.scrollWidth;

		// Math.ceil is needed because iScrollHeight is an integer value, mSize not. To compare we should have an integer value for mSize too.
		// example: iScrollHeight = 24px, mSize.height = 23.98375. Both should be the same.
		if (iScrollHeight > Math.ceil(mSize.height) || iScrollWidth > Math.ceil(mSize.width)) {
			// TODO: save ref to DummyScrollContainer somewhere to avoid "find" selector
			var oDummyScrollContainer = $TargetDomRef.find("> .sapUiDtDummyScrollContainer");
			var oScrollbarSynchronizer;
			if (!oDummyScrollContainer.length) {
				oDummyScrollContainer = jQuery("<div/>", {
					css: {
						height: iScrollHeight + "px",
						width: iScrollWidth + "px"
					}
				});
				oDummyScrollContainer = jQuery("<div class='sapUiDtDummyScrollContainer' style='height: " + iScrollHeight + "px; width: " + iScrollWidth + "px;'></div>");

				if (
					oTargetOverlay
					&& DOMUtil.hasVerticalScrollBar(oOriginalDomRef)
					&& oTargetOverlay._hasSameSize(oGeometry, 'height')
				) {
					oTargetOverlay.addStyleClass("sapUiDtOverlayWithScrollBar");
					oTargetOverlay.addStyleClass("sapUiDtOverlayWithScrollBarVertical");
				}

				if (
					oTargetOverlay
					&& DOMUtil.hasHorizontalScrollBar(oOriginalDomRef)
					&& oTargetOverlay._hasSameSize(oGeometry, 'width')
				) {
					oTargetOverlay.addStyleClass("sapUiDtOverlayWithScrollBar");
					oTargetOverlay.addStyleClass("sapUiDtOverlayWithScrollBarHorizontal");
				}
				$TargetDomRef.append(oDummyScrollContainer);
				oScrollbarSynchronizer = new ScrollbarSynchronizer({
					synced: this.fireScrollSynced.bind(this)
				});
				oScrollbarSynchronizer.addTarget(oOriginalDomRef, $TargetDomRef.get(0));
				this._oScrollbarSynchronizers.set($TargetDomRef.get(0), oScrollbarSynchronizer);
			} else {
				oDummyScrollContainer.css({
					height: iScrollHeight,
					width : iScrollWidth
				});
				oScrollbarSynchronizer = this._oScrollbarSynchronizers.get($TargetDomRef.get(0));
				if (!oScrollbarSynchronizer.hasTarget(oOriginalDomRef)) {
					oScrollbarSynchronizer.addTarget(oOriginalDomRef);
				}
			}

			if (bForceScrollbarSync) {
				oScrollbarSynchronizer.sync(oOriginalDomRef, true);
			}
		} else {
			this._deleteDummyContainer($TargetDomRef, oTargetOverlay);
		}
	};

	/**
	 * Returns an object, which describes the DOM geometry of the element associated with this overlay or null if it can't be found
	 * The geometry is calculated based on the associated element's DOM reference, if it exists or based on it's public children
	 * Object may contain following fields: position - absolute position of Element in DOM; size - absolute size of Element in DOM
	 * Object may contain domRef field, when the associated Element's DOM can be found
	 * @return {object} geometry object describing the DOM of the Element associated with this Overlay
	 * @public
	 */
	Overlay.prototype.getGeometry = function(bForceCalculation) {
		if (bForceCalculation || !this._mGeometry) {
			var $DomRef = this.getAssociatedDomRef();
			var aChildrenGeometry;

			// dom Ref is either jQuery object with one/multiple elements
			if ($DomRef) {
				var bIsRoot = this.isRoot();
				aChildrenGeometry = jQuery.makeArray($DomRef).map(function($element) {
					return DOMUtil.getGeometry($element, bIsRoot);
				});
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
	 * @returns {sap.ui.dt.Overlay} returns this
	 * @public
	 */
	Overlay.prototype.setVisible = function(bVisible) {
		bVisible = !!bVisible;
		if (this.getVisible() !== bVisible) {
			this.setProperty("visible", bVisible);
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

	Overlay.prototype.setIsRoot = function (bValue) {
		bValue = !!bValue;

		if (this.getIsRoot() !== bValue) {
			this.setProperty('isRoot', bValue);
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