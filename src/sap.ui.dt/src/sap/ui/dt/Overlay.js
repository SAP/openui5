/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.Overlay.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/dt/MutationObserver',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/DOMUtil',
	'jquery.sap.dom'
],
function(jQuery, Control, MutationObserver, ElementUtil, OverlayUtil, DOMUtil) {
	"use strict";

	var sOverlayContainerId = "overlay-container";
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
	 * @extends sap.ui.core.Control
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
	var Overlay = Control.extend("sap.ui.dt.Overlay", /** @lends sap.ui.dt.Overlay.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				/**
				 * Whether the overlay and it's descendants should be visible on a screen
				 * We are overriding Control's property to prevent RenderManager from rendering of an invisible placeholder
				 */
				visible : {
					type : "boolean",
					defaultValue : true
				},
				/**
				 * Render overlay only if associated element is visible
				 */
				lazyRendering : {
					type : "boolean",
					defaultValue : true
				},
				/**
				 * Whether the Overlay can get the browser focus (has tabindex)
				 */
				focusable : {
					type : "boolean",
					defaultValue : false
				},

				/**
				 * Whether the Overlay is enabled
				 */
				enabled: {
					type: "boolean",
					defaultValue: true
				}
			},
			associations : {
				/**
				 * Element associated with an overlay
				 */
				element : {
					type : "sap.ui.core.Element"
				}
			},
			aggregations : {
				/**
				 * DesignTime metadata for the associated Element
				 */
				designTimeMetadata : {
					type : "sap.ui.dt.DesignTimeMetadata",
					multiple : false
				}
			},
			events : {
				/**
				 * Event fired when the property "Focusable" is changed
				 */
				focusableChange : {
					parameters : {
						focusable : { type : "boolean" }
					}
				},
				/**
				 * Event fired when the Overlay is destroyed
				 */
				destroyed : {
					parameters : {}
				},
				/**
				 * Event fired when the Overlay visibility is changed
				 */
				visibleChanged : {
					parameters : {
						visible : "boolean"
					}
				}
			}
		}
	});

	/**
	 * Returns children of this overlay
	 * @return {sap.ui.dt.Overlay[]} overlays that are logical children of this overlay
	 * @protected
	 */
	//Overlay.prototype.getChildren = function() {};

	/**
	 * Creates and/or returns an overlay container element, where all Overlays should be rendered (initially)
	 * @return {Element} overlay container
	 * @static
	 */
	Overlay.getOverlayContainer = function() {
		if (!oOverlayContainer) {
			oOverlayContainer = jQuery.sap.byId(sOverlayContainerId);
			if (!oOverlayContainer.length) {
				oOverlayContainer = jQuery("<div id='" + sOverlayContainerId + "'></div>").appendTo("body");
			}
		}
		return oOverlayContainer.get(0);
	};

	/**
	 * Removes an overlay container element from DOM
	 * @static
	 */
	Overlay.removeOverlayContainer = function() {
		if (oOverlayContainer) {
			oOverlayContainer.remove();
		}

		oOverlayContainer = null;
	};

	/**
	 * @static
	 */
	Overlay.getMutationObserver = function() {
		if (!oMutationObserver) {
			oMutationObserver = new MutationObserver();
		}
		return oMutationObserver;
	};

	/**
	 * @static
	 */
	Overlay.destroyMutationObserver = function() {
		if (oMutationObserver) {
			oMutationObserver.destroy();
			oMutationObserver = null;
		}
	};

	/**
	 * Called when the Overlay is initialized
	 * @protected
	 */
	Overlay.prototype.init = function() {
		this._bVisible = null;

		this._domRefScrollHandler = this._onSyncScrollWithDomRef.bind(this);

		this.attachBrowserEvent("scroll", this._onOverlayScroll, this);
	};

	/**
	 * Called when the Overlay is destroyed
	 * @protected
	 */
	Overlay.prototype.exit = function() {
		this._detachDomRefScrollHandler();

		delete this._oDomRef;
		delete this._bVisible;
		window.clearTimeout(this._iCloneDomTimeout);
		window.clearTimeout(this._iSyncScrollWithDomRef);
		this.fireDestroyed();
	};

	/**
	 * this is needed to prevent UI5 renderManager from removing overlay's node from DOM in a rendering phase
	 * see RenderManager.js "this._fPutIntoDom" function
	 * @private
	 */
	Overlay.prototype._onChildRerenderedEmpty = function() {
		return true;
	};

	/**
	 * Called after Overlay rendering phase
	 * @protected
	 */
	Overlay.prototype.onAfterRendering = function() {
		this._oDomRef = this.getDomRef();

		if (this._oDomRef) {
			this._updateDom();
		}

		var bFocusable = this.isFocusable();
		if (bFocusable) {
			this.$().attr("tabindex", 0);
		} else {
			this.$().attr("tabindex", null);
		}
	};

	/**
	 * @return {Element} The Element's DOM Element sub DOM Element or null
	 * @override
	 */
	Overlay.prototype.getDomRef = function() {
		return this._oDomRef || Control.prototype.getDomRef.apply(this, arguments);
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
	 * @return {sap.ui.Element} associated Element
	 * @public
	 */
	Overlay.prototype.getElementInstance = function() {
		return sap.ui.getCore().byId(this.getElement());
	};

	/**
	 * @return {boolean} if the Overlay has focus
	 * @private
	 */
	Overlay.prototype.hasFocus = function() {
		return document.activeElement === this.getFocusDomRef();
	};

	/**
	 * Sets whether the Overlay can get the browser focus (tabindex)
	 * @param {boolean} bFocusable if the Overlay is focusable
	 * @returns {sap.ui.dt.Overlay} returns this
	 * @public
	 */
	Overlay.prototype.setFocusable = function(bFocusable) {
		bFocusable = !!bFocusable;
		if (this.isFocusable() !== bFocusable) {
			this.setProperty("focusable", bFocusable);
			this.toggleStyleClass("sapUiDtOverlayFocusable", bFocusable);
			this.fireFocusableChange({focusable : bFocusable});
		}

		return this;
	};

	/**
	 * Returns if the Overlay is can get the focus
	 * @public
	 * @return {boolean} if the Overlay is focusable
	 */
	Overlay.prototype.isFocusable = function() {
		return this.getFocusable();
	};

	/**
	 * Calculate and update CSS styles for the Overlay's DOM
	 * The calculation is based on original associated DOM state and parent overlays
	 * This method also calls "applyStyles" method for every child Overlay of this Overlay (cascade)
	 * @public
	 */
	Overlay.prototype.applyStyles = function() {

		if (!this.getEnabled()) {
			return;
		}

		var fnDeleteDummyContainer = function() {
			if (this._oDummyScrollContainer) {
				this._oDummyScrollContainer.remove();
				delete this._oDummyScrollContainer;
				if (this.getParent() && this.getParent().$) {
					var $parent = this.getParent().$();
					$parent.removeClass("sapUiDtOverlayWithScrollBar");
					$parent.removeClass("sapUiDtOverlayWithScrollBarVertical");
					$parent.removeClass("sapUiDtOverlayWithScrollBarHorizontal");
				}
			}
		}.bind(this);

		// invalidate cached geometry
		delete this._mGeometry;

		if (!this.getDomRef()) {
			return;
		}

		if (!this.isVisible()) {
			this.$().css("display", "none");
			return;
		}

		var oGeometry = this.getGeometry();

		if (oGeometry && oGeometry.visible) {
			var $overlay = this.$();
			var iScrollingWidth = DOMUtil.getScrollbarWidth();
			var mSize = oGeometry.size;

			// ensure visibility
			$overlay.css("display", "block");

			var oOverlayParent = this.getParent();

			var iParentScrollTop = (oOverlayParent && oOverlayParent instanceof Overlay) ? oOverlayParent.$().scrollTop() : null;
			var iParentScrollLeft = (oOverlayParent && oOverlayParent instanceof Overlay) ? oOverlayParent.$().scrollLeft() : null;
			var mParentOffset = (oOverlayParent && oOverlayParent instanceof Overlay) ? oOverlayParent.$().offset() : null;

			if (mParentOffset && jQuery('html').attr('dir') === 'rtl' && DOMUtil.hasVerticalScrollBar(oOverlayParent.getDomRef())) {
				mParentOffset.left += iScrollingWidth;
			}

			var mPosition = DOMUtil.getOffsetFromParent(oGeometry.position, mParentOffset, iParentScrollTop, iParentScrollLeft);

			// OVERLAY SIZE
			$overlay.css("width", mSize.width + "px");
			$overlay.css("height", mSize.height + "px");
			$overlay.css("top", mPosition.top + "px");
			$overlay.css("left", mPosition.left + "px");

			if (oGeometry.domRef) {
				var iZIndex = DOMUtil.getZIndex(oGeometry.domRef);
				if (iZIndex) {
					$overlay.css("z-index", iZIndex);
				}

				// OVERFLOW & SCROLLING
				var oOverflows = DOMUtil.getOverflows(oGeometry.domRef);
				if (oOverflows) {
					if (oOverflows.overflowX) {
						$overlay.css("overflow-x", oOverflows.overflowX);
					}
					if (oOverflows.overflowY) {
						$overlay.css("overflow-y", oOverflows.overflowY);
					}
					var iScrollHeight = oGeometry.domRef.scrollHeight;
					var iScrollWidth = oGeometry.domRef.scrollWidth;
					// Math.ceil is needed because iScrollHeight is an integer value, mSize not. To compare we should have an integer value for mSize too.
					// example: iScrollHeight = 24px, mSize.height = 23.98375. Both should be the same.
					if (iScrollHeight > Math.ceil(mSize.height) || iScrollWidth > Math.ceil(mSize.width)) {
						if (!this._oDummyScrollContainer) {
							this._oDummyScrollContainer = jQuery("<div class='sapUiDtDummyScrollContainer' style='height: " + iScrollHeight + "px; width: " + iScrollWidth + "px;'></div>");

							if (oOverlayParent.$ && DOMUtil.hasVerticalScrollBar(oGeometry.domRef)) {
								oOverlayParent.$().addClass("sapUiDtOverlayWithScrollBar");
								oOverlayParent.$().addClass("sapUiDtOverlayWithScrollBarVertical");
							}
							if (oOverlayParent.$ && DOMUtil.hasHorizontalScrollBar(oGeometry.domRef)) {
								oOverlayParent.$().addClass("sapUiDtOverlayWithScrollBar");
								oOverlayParent.$().addClass("sapUiDtOverlayWithScrollBarHorizontal");
							}
							this.$().append(this._oDummyScrollContainer);
						} else {
							this._oDummyScrollContainer.css({
								"height": iScrollHeight,
								"width" : iScrollWidth
							});
						}
					} else {
						fnDeleteDummyContainer();
					}
					this._attachDomRefScrollHandler();

					this._syncScrollWithDomRef();
				}

				this._cloneDomRef(oGeometry.domRef);
			}

			this.getChildren().forEach(function(oChild) {
				oChild.applyStyles();
			});

		} else {
			fnDeleteDummyContainer();
			this.$().css("display", "none");
		}
	};

	/**
	 * @private
	 */
	Overlay.prototype._attachDomRefScrollHandler = function() {
		this._detachDomRefScrollHandler();

		var oGeometry = this.getGeometry();
		var oDomRef = oGeometry ? oGeometry.domRef : null;
		if (oDomRef) {
			this._oDomRefWithScrollHandler = oDomRef;

			jQuery(this._oDomRefWithScrollHandler).on("scroll", this._domRefScrollHandler);
		}
	};

	/**
	 * @param {object} oDomRef element's DOM reference
	 * @private
	 */
	Overlay.prototype._detachDomRefScrollHandler = function(oDomRef) {
		if (this._oDomRefWithScrollHandler) {
			jQuery(this._oDomRefWithScrollHandler).off("scroll", this._domRefScrollHandler);
			delete this._oDomRefWithScrollHandler;
		}
	};

	/**
	 * @private
	 */
	Overlay.prototype._onSyncScrollWithDomRef = function() {
		window.clearTimeout(this._iSyncScrollWithDomRef);
		// timeout needed so that scroll wheel in chrome windows works fast
		this._iSyncScrollWithDomRef = window.setTimeout(function() {
			this._syncScrollWithDomRef();
			delete this._iSyncScrollWithDomRef;
		}.bind(this), 0);
	};

	/**
	 * @private
	 */
	Overlay.prototype._syncScrollWithDomRef = function() {
		DOMUtil.syncScroll(this._oDomRefWithScrollHandler, this.$());
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
	 * @param {object} oDomRef element's DOM reference to be cloned
	 * @private
	 */
	Overlay.prototype._cloneDomRef = function(oDomRef) {
		var $this = this.$();

		var $clonedDom = $this.find(">.sapUiDtClonedDom");
		var vCloneDomRef = this.getDesignTimeMetadata().getCloneDomRef();
		if (vCloneDomRef) {
			if (oDomRef) {
				var fnCloneDom = function() {
					if (vCloneDomRef !== true) {
						oDomRef = DOMUtil.getDomRefForCSSSelector(oDomRef, vCloneDomRef);
					}

					if (!$clonedDom.length) {
						$clonedDom = jQuery("<div class='sapUiDtClonedDom'></div>").prependTo($this);
					} else {
						$clonedDom.empty();
					}

					//TODO: disable update
					DOMUtil.cloneDOMAndStyles(oDomRef, $clonedDom);
				};

				if (!this._bClonedDom) {
					this._bClonedDom = true;
					fnCloneDom();
				} else {
					window.clearTimeout(this._iCloneDomTimeout);
					// cloneDom is expensive, therefore the call is delayed
					this._iCloneDomTimeout = window.setTimeout(fnCloneDom, 250);
				}
			}
		} else {
			$clonedDom.remove();
		}
	};

	/**
	 * @private
	 */
	Overlay.prototype._updateDom = function() {
		if (this.isRoot()) {
			this._ensureIsInOverlayContainer();

			// apply styles propagated from root overlays to all their children
			this.applyStyles();
		} else {
			this._ensureDomOrder();
		}
	};

	/**
	 * @private
	 */
	Overlay.prototype._ensureDomOrder = function() {
		var $this = this.$();

		var oParent = this.getParent();
		var $parentDomRef = oParent.$();
		var $parentContainer = $parentDomRef.find(">.sapUiDtOverlayChildren");

		var bIsDomOrderCorrect;

		var $PreviousChildWithDom;

		var aChildren = oParent.getChildren();
		var iPreviousChildWithDomIndex = aChildren.indexOf(this) - 1;
		while (iPreviousChildWithDomIndex >= 0) {
			$PreviousChildWithDom = aChildren[iPreviousChildWithDomIndex].$();
			if ($PreviousChildWithDom.length) {
				break;
			}
			iPreviousChildWithDomIndex--;
		}

		// if our dom is already after out previous sibling
		if ($PreviousChildWithDom && $PreviousChildWithDom.length) {
			bIsDomOrderCorrect = $this.prev().get(0) === $PreviousChildWithDom.get(0);
		// .. or first in parent container
		} else {
			bIsDomOrderCorrect = $parentContainer.children().index($this) === 0;
		}

		if (!bIsDomOrderCorrect) {
			if ($PreviousChildWithDom && $PreviousChildWithDom.length) {
				$PreviousChildWithDom.after($this);
			} else {
				$parentContainer.prepend($this);
			}
			oParent.applyStyles();
		}
	};

	/**
	 * @private
	 */
	Overlay.prototype._ensureIsInOverlayContainer = function() {
		var $this = this.$();
		var $currentDomParent = $this.parent();
		// instead of adding the created DOM into the UIArea's DOM, we are adding it to overlay-container to avoid clearing of the DOM
		var oOverlayContainer = Overlay.getOverlayContainer();
		var oParentElement = $currentDomParent.length ? $currentDomParent.get(0) : null;
		if (oOverlayContainer !== oParentElement) {
			$this.appendTo(oOverlayContainer);
		}
	};

	/**
	 * @private
	 */
	Overlay.prototype._onOverlayScroll = function() {
		var oGeometry = this.getGeometry();
		var oDomRef = oGeometry ? oGeometry.domRef : null;
		if (oDomRef) {
			DOMUtil.syncScroll(this.$(), oDomRef);
		}
	};

	/**
	 * Sets whether the Overlay is visible
	 * @param {boolean} bVisible if the Overlay is visible
	 * @returns {sap.ui.dt.Overlay} returns this
	 * @public
	 */
	Overlay.prototype.setVisible = function(bVisible) {
		if (this.getVisible() !== bVisible) {
			this.setProperty("visible", bVisible);
			this._bVisible = bVisible;
			this.fireVisibleChanged({visible : bVisible});
		}

		return this;
	};

	/**
	 * Returns whether the Overlay is visible
	 * @return {boolean} if the Overlay is visible
	 * @public
	 */
	Overlay.prototype.getVisible = function() {

		if (this._bVisible === null) {
			if (!this.getLazyRendering()) {
				return true;
			}
			var oDesignTimeMetadata = this.getDesignTimeMetadata();
			return oDesignTimeMetadata ? !oDesignTimeMetadata.isIgnored(this.getElementInstance()) : false;
		} else {
			return this.getProperty("visible");
		}
	};


	/**
	 * Returns if the Overlay is visible
	 * @public
	 * @return {boolean} if the Overlay is visible
	 */
	Overlay.prototype.isVisible = function() {
		return this.getVisible();
	};

	/**
	 * Returns if overlay is root
	 * @public
	 * @return {boolean} if the Overlay is root
	 */
	Overlay.prototype.isRoot = function() {
		var oParent = this.getParent();
		if (oParent) {
			if (!oParent.getDomRef) {
				return true;
			}
		}
	};

	return Overlay;
}, /* bExport= */ true);
