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
		var oElementDomRef =  this._mGeometry ? this._mGeometry.domRef : null;
		if (oElementDomRef) {
			this._detachDomRefScrollHandler(oElementDomRef);
		}

		if (this._aScrollContainers) {
			this._aScrollContainers.forEach(function(oScrollContainer, iIndex) {
				if (this.getElementInstance()) {
					var $scrollContainerAssociatedDomRef = this.getDesignTimeMetadata().getAssociatedDomRef(this.getElementInstance(), oScrollContainer.domRef);
					if ($scrollContainerAssociatedDomRef && $scrollContainerAssociatedDomRef.length) {
						var oScrollContainerAssociatedDomRef = $scrollContainerAssociatedDomRef.get(0);
						this._detachDomRefScrollHandler(oScrollContainerAssociatedDomRef);
					}
				}
				window.cancelAnimationFrame(oScrollContainer._iSyncScrollWithDomRef);
			}.bind(this));
		}

		this._restoreVisibility();

		delete this._oDomRef;
		delete this._bVisible;
		window.clearTimeout(this._iCloneDomTimeout);
		window.cancelAnimationFrame(this._iSyncScrollWithDomRef);
		this.fireDestroyed();
	};

	/**
	 * Restore the visibility of the element which was set to "hidden" before DomRef cloning
	 * @private
	 */
	Overlay.prototype._restoreVisibility = function(){
		if (this._oCloneDomRefVisibility){
			sap.ui.dt.Overlay.getMutationObserver().ignoreOnce({
				target: jQuery(this._oCloneDomRefVisibility.domRef).get(0),
				type: "attributes"
			});
			jQuery(this._oCloneDomRefVisibility.domRef).css("visibility", this._oCloneDomRefVisibility.visibility);
			delete this._oCloneDomRefVisibility;
		}
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
		if (this._aScrollContainers && !this._oDomRef) {
			this._aScrollContainers.forEach(function(oScrollContainer, iIndex) {
				if (!oScrollContainer.overlayDomRef) {
					oScrollContainer.overlayDomRef = this.$().find('> .sapUiDtOverlayChildren > [data-sap-ui-dt-scrollContainerIndex="' + iIndex + '"]');
				}
			}.bind(this));
		}

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
		return ElementUtil.getElementInstance(this.getElement());
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

		// invalidate cached geometry
		delete this._mGeometry;

		if (!this._oDomRef) {
			return;
		}

		if (!this.isVisible()) {
			this.$().css("display", "none");
			return;
		}

		var oGeometry = this.getGeometry();

		if (oGeometry && oGeometry.visible) {
			this._ensureDomOrder();
			var $overlay = this.$();

			this._setOverlaySize($overlay, oGeometry, this.getParent());

			if (oGeometry.domRef) {
				this._handleOverflowScroll(oGeometry, $overlay, this.getParent());
				this._cloneDomRef(oGeometry.domRef);
			}

			if (this._aScrollContainers && this._aScrollContainers.length) {
				this._aScrollContainers.forEach(function(oScrollContainer, iIndex) {
					if (this.getDesignTimeMetadata().getAssociatedDomRef(this.getElementInstance(), oScrollContainer.domRef)) {
						var oScrollContainerDomRef = this.getDesignTimeMetadata().getAssociatedDomRef(this.getElementInstance(), oScrollContainer.domRef).get(0);
						this._setOverlaySize(oScrollContainer.overlayDomRef, DOMUtil.getGeometry(oScrollContainerDomRef), this);
						//sync scroll events from control to scroll container
						this._handleOverflowScroll(DOMUtil.getGeometry(oScrollContainerDomRef), oScrollContainer.overlayDomRef, this);
						// sync scroll events from scroll container to control
						this._attachDomRefScrollHandler(oScrollContainer.overlayDomRef, oScrollContainerDomRef);
					} else {
						this._deleteDummyContainer(oScrollContainer.overlayDomRef);
						oScrollContainer.scrollEvents = false;
						oScrollContainer.overlayDomRef.css("display", "none");
					}
				}.bind(this));
			}

			this.getChildren().forEach(function(oChild) {
				oChild.applyStyles();
			});

		} else {
			this.$().css("display", "none");
		}
	};

	/**
	 * @private
	 */
	Overlay.prototype._setOverlaySize = function($overlay, oGeometry, oOverlayParent) {
		// ensure visibility
		$overlay.css("display", "block");
		var $overlayParentDomRef = (oOverlayParent && oOverlayParent instanceof Overlay) ? oOverlayParent.$() : null;

		if (oOverlayParent._aScrollContainers && $overlay.attr("class") !== "sapUiDtOverlayScrollContainer") {

			var iScrollContainerIndex = this._getScrollContainerIndex(oOverlayParent);

			if (iScrollContainerIndex > -1) {
				var $scrollContainer = oOverlayParent.$().find('> .sapUiDtOverlayChildren > [data-sap-ui-dt-scrollContainerIndex="' + iScrollContainerIndex + '"]');
				$overlayParentDomRef = $scrollContainer;
			}
		}

		var iScrollingWidth = DOMUtil.getScrollbarWidth();
		var mSize = oGeometry.size;

		var iParentScrollTop = $overlayParentDomRef ? $overlayParentDomRef.scrollTop() : null;
		var iParentScrollLeft = $overlayParentDomRef ? $overlayParentDomRef.scrollLeft() : null;
		var mParentOffset = $overlayParentDomRef ? $overlayParentDomRef.offset() : null;

		if (mParentOffset && jQuery('html').attr('dir') === 'rtl' && DOMUtil.hasVerticalScrollBar(oOverlayParent.getDomRef())) {
			mParentOffset.left += iScrollingWidth;
		}

		var mPosition = DOMUtil.getOffsetFromParent(oGeometry.position, mParentOffset, iParentScrollTop, iParentScrollLeft);

		// OVERLAY SIZE
		$overlay.css("width", mSize.width + "px");
		$overlay.css("height", mSize.height + "px");
		$overlay.css("top", mPosition.top + "px");
		$overlay.css("left", mPosition.left + "px");
	};

	/**
	 * @private
	 */
	Overlay.prototype._deleteDummyContainer = function($overlay) {
		if ($overlay.find("> .sapUiDtDummyScrollContainer").length > 0) {
				$overlay.find("> .sapUiDtDummyScrollContainer").remove();
				if (this.getParent() && this.getParent().$) {
					var $parent = this.getParent().$();
					$parent.removeClass("sapUiDtOverlayWithScrollBar");
					$parent.removeClass("sapUiDtOverlayWithScrollBarVertical");
					$parent.removeClass("sapUiDtOverlayWithScrollBarHorizontal");
				}
			}
	};

	/**
	 * Handle overflow from controls and sync with overlay
	 * @private
	 */
	Overlay.prototype._handleOverflowScroll = function(oGeometry, $overlayDomRef, oOverlayParent) {
		var $originalDomRef = oGeometry.domRef;
		var mSize = oGeometry.size;
		var iZIndex = DOMUtil.getZIndex($originalDomRef);
		if (iZIndex) {
			$overlayDomRef.css("z-index", iZIndex);
		}

		// OVERFLOW & SCROLLING
		var oOverflows = DOMUtil.getOverflows($originalDomRef);
		if (oOverflows) {
			if (oOverflows.overflowX) {
				$overlayDomRef.css("overflow-x", oOverflows.overflowX);
			}
			if (oOverflows.overflowY) {
				$overlayDomRef.css("overflow-y", oOverflows.overflowY);
			}
			var iScrollHeight = $originalDomRef.scrollHeight;
			var iScrollWidth = $originalDomRef.scrollWidth;
			// Math.ceil is needed because iScrollHeight is an integer value, mSize not. To compare we should have an integer value for mSize too.
			// example: iScrollHeight = 24px, mSize.height = 23.98375. Both should be the same.
			if (iScrollHeight > Math.ceil(mSize.height) || iScrollWidth > Math.ceil(mSize.width)) {
				var oDummyScrollContainer = $overlayDomRef.find("> .sapUiDtDummyScrollContainer");
				if (!oDummyScrollContainer.length) {
					oDummyScrollContainer = jQuery("<div class='sapUiDtDummyScrollContainer' style='height: " + iScrollHeight + "px; width: " + iScrollWidth + "px;'></div>");
					if (oOverlayParent.$ && DOMUtil.hasVerticalScrollBar(oGeometry.domRef)) {
						oOverlayParent.$().addClass("sapUiDtOverlayWithScrollBar");
						oOverlayParent.$().addClass("sapUiDtOverlayWithScrollBarVertical");
					}
					if (oOverlayParent.$ && DOMUtil.hasHorizontalScrollBar(oGeometry.domRef)) {
						oOverlayParent.$().addClass("sapUiDtOverlayWithScrollBar");
						oOverlayParent.$().addClass("sapUiDtOverlayWithScrollBarHorizontal");
					}
					$overlayDomRef.append(oDummyScrollContainer);
				} else {
					oDummyScrollContainer.css({
						"height": iScrollHeight,
						"width" : iScrollWidth
					});
				}
			} else {
				this._deleteDummyContainer($overlayDomRef);
			}

			this._attachDomRefScrollHandler(oGeometry.domRef, $overlayDomRef);

			this._syncScrollWithDomRef(oGeometry.domRef, $overlayDomRef);
		}
	};

	/**
	 * Sync scroll events from controls domRef with overlay
	 * @private
	 */
	Overlay.prototype._attachDomRefScrollHandler = function(oDomRef, $overlayDomRef) {

		this._detachDomRefScrollHandler(oDomRef);
		if (oDomRef) {
			jQuery(oDomRef).on("scroll", null, [oDomRef, $overlayDomRef], this._domRefScrollHandler);
		}
	};

	/**
	 * @param {object} oDomRef element's DOM reference
	 * @private
	 */
	Overlay.prototype._detachDomRefScrollHandler = function(oDomRef) {
		if (oDomRef) {
			jQuery(oDomRef).off("scroll", this._domRefScrollHandler);
		}
	};

	/**
	 * @private
	 */
	Overlay.prototype._onSyncScrollWithDomRef = function(oEvent) {
		var oSourceDomRef = oEvent.data[0];
		var $targetDomRef = oEvent.data[1];
		var oScrollContainer;
		var sScrollContainerIndex = jQuery($targetDomRef).attr("data-sap-ui-dt-scrollcontainerindex") || jQuery(oSourceDomRef).attr("data-sap-ui-dt-scrollcontainerindex");

		if (sScrollContainerIndex) {
			oScrollContainer = this._aScrollContainers[sScrollContainerIndex];
		} else {
			oScrollContainer = this;
		}

		window.cancelAnimationFrame(oScrollContainer._iSyncScrollWithDomRef);
		// timeout needed so that scroll wheel in chrome windows works fast
		oScrollContainer._iSyncScrollWithDomRef = window.requestAnimationFrame(function() {
			this._syncScrollWithDomRef(oSourceDomRef, $targetDomRef);
			delete oScrollContainer._iSyncScrollWithDomRef;
		}.bind(this));
	};

	/**
	 * @private
	 */
	Overlay.prototype._syncScrollWithDomRef = function(oDomRef, oOverlayDomRef) {
		DOMUtil.syncScroll(oDomRef, oOverlayDomRef);
	};

	/**
	 * @private
	 * @returns index of the scroll container containing this aggregation, -1 if scroll container exist, but this aggregation is not included, undefined if no scroll container exist
	 */
	Overlay.prototype._getScrollContainerIndex = function(oOverlayParent, oOverlay) {};

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

					this._restoreVisibility();

					//TODO: disable update
					DOMUtil.cloneDOMAndStyles(oDomRef, $clonedDom);

					this._oCloneDomRefVisibility = {
						domRef: jQuery(oDomRef),
						visibility: jQuery(oDomRef).css("visibility")
					};
					sap.ui.dt.Overlay.getMutationObserver().ignoreOnce({
						target: jQuery(oDomRef).get(0),
						type: "attributes"
					});
					jQuery(oDomRef).css("visibility", "hidden");
				}.bind(this);

				if (!this._bClonedDom) {
					this._bClonedDom = true;
					fnCloneDom();
				} else {
					window.clearTimeout(this._iCloneDomTimeout);
					// cloneDom is expensive, therefore the call is delayed
					this._iCloneDomTimeout = window.setTimeout(fnCloneDom, 0);
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
		var bApplyStyles;
		if (!document.getElementById(this.getId()) && document.getElementById(this.getParent().getId())) {
			bApplyStyles = true;
		}

		if (this.isRoot()) {
			this._ensureIsInOverlayContainer();
			// apply styles propagated from root overlays to all their children
			this.applyStyles();
		} else if (bApplyStyles) {
			this.applyStyles();
		}
	};

	/**
	 * @private
	 */
	Overlay.prototype._ensureDomOrder = function() {
		var $this = this.$();

		var oParentOverlay = this.getParent();
		if (!oParentOverlay || !oParentOverlay.$) {
			return;
		}

		var $parentDomRef = oParentOverlay.$();
		var $parentContainer = $parentDomRef.find(">.sapUiDtOverlayChildren");
		var aSiblingOverlays = oParentOverlay.getChildren();

		var iScrollContainerIndex = this._getScrollContainerIndex(oParentOverlay);
		if (iScrollContainerIndex > -1) {
			//there are scroll containers and it contains the current aggregation overlay
			$parentContainer = $parentContainer.find('> [data-sap-ui-dt-scrollContainerIndex="' + iScrollContainerIndex + '"]');
			aSiblingOverlays = aSiblingOverlays.filter(function(oSibling) {
				return oParentOverlay._aScrollContainers[iScrollContainerIndex].aggregations.indexOf(oSibling.getAggregationName()) > -1;
			});
		}

		var bIsDomOrderCorrect;
		var iPreviousScrollContainerIndex;
		var $PreviousSiblingWithDom;
		var iPreviousSiblingWithDomIndex = aSiblingOverlays.indexOf(this) - 1;
		while (iPreviousSiblingWithDomIndex >= 0) {
			iPreviousScrollContainerIndex = this._getScrollContainerIndex(oParentOverlay, aSiblingOverlays[iPreviousSiblingWithDomIndex]);

			if (iPreviousScrollContainerIndex > -1) {
				$PreviousSiblingWithDom = jQuery($parentContainer.children()[iPreviousSiblingWithDomIndex]);
			} else {
				$PreviousSiblingWithDom = aSiblingOverlays[iPreviousSiblingWithDomIndex].$();
			}

			if ($PreviousSiblingWithDom.length) {
				break;
			}
			iPreviousSiblingWithDomIndex--;
		}

		// if our dom is already after our previous sibling
		if ($PreviousSiblingWithDom && $PreviousSiblingWithDom.length) {
			bIsDomOrderCorrect = $this.prev().get(0) === $PreviousSiblingWithDom.get(0);
		// .. or first in parent container
		} else {
			bIsDomOrderCorrect = $parentContainer.children().index($this) === 0;
		}

		if (!bIsDomOrderCorrect) {
			if ($PreviousSiblingWithDom && $PreviousSiblingWithDom.length) {
				$PreviousSiblingWithDom.after($this);
			} else {
				$parentContainer.prepend($this);
			}
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
		bVisible = !!bVisible;

		if (this.getVisible() !== bVisible) {
			if (!bVisible) {
				this._restoreVisibility();
			}
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
			var oElement = this.getElementInstance();
			if (!oElement){
				return false;
			}
			var oDesignTimeMetadata = this.getDesignTimeMetadata();
			return oDesignTimeMetadata ? !oDesignTimeMetadata.isIgnored(oElement) : false;
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
	 * Returns if the Overlay is visible in the DOM (using jQuery).
	 *
	 * @return {boolean} Returns if the Overlay is visible in the DOM
	 * @public
	 */
	Overlay.prototype.isVisibleInDom = function() {
		return this.$().is(":visible");
	};

	/**
	 * Returns if overlay is root
	 * @public
	 * @return {boolean} if the Overlay is root
	 */
	Overlay.prototype.isRoot = function() {
		var oParent = this.getParent();
		if (!oParent || !oParent.getDomRef) {
			return true;
		}
	};

	return Overlay;
}, /* bExport= */ true);
