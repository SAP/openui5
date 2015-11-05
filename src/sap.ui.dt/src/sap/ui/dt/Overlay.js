/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.Overlay.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/DOMUtil',
	'jquery.sap.dom'
],
function(jQuery, Control, ElementUtil, OverlayUtil, DOMUtil) {
	"use strict";

	var sOverlayContainerId = "overlay-container";
	var oOverlayContainer;

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
				 * Whether the overlay is created for an element or aggregation, which is not accessible via the public tree
				 */
				inHiddenTree : {
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
				 * Event fired when the Overlay is destroyed
				 */
				destroyed : {
					parameters : {}
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
	 * Called when the Overlay is initialized
	 * @protected
	 */
	Overlay.prototype.init = function() {
		this._bVisible = null;

		this.attachBrowserEvent("scroll", this._onScroll, this);
	};

	/**
	 * Called when the Overlay is destroyed
	 * @protected
	 */
	Overlay.prototype.exit = function() {
		delete this._oDomRef;
		delete this._bVisible;

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

	/*
	 * Called before Overlay rendering phase
	 * @protected
	 */
	Overlay.prototype.onBeforeRendering = function() {
		// UI5 restore focus won't restore focus on overlay, because DOM ref isn't changed
		if (this.hasFocus()) {
			this._bRestoreFocus = true;
		}
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

		if (this._bRestoreFocus) {
			delete this._bRestoreFocus;

			this.focus();
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
	 * Calculate and update CSS styles for the Overlay's DOM
	 * The calculation is based on original associated DOM state and parent overlays
	 * This method also calls "applyStyles" method for every child Overlay of this Overlay (cascade)
	 * @public
	 */
	Overlay.prototype.applyStyles = function() {
		var oGeometry = this.getGeometry();

		if (oGeometry) {
			var $overlay = this.$();

			var oOverlayParent = this.getParent();

			var iParentScrollTop = (oOverlayParent && oOverlayParent instanceof Overlay) ? oOverlayParent.$().scrollTop() : null;
			var iParentScrollLeft = (oOverlayParent && oOverlayParent instanceof Overlay) ? oOverlayParent.$().scrollLeft() : null;
			var mParentOffset = (oOverlayParent && oOverlayParent instanceof Overlay) ? oOverlayParent.$().offset() : null;
			var mPosition = DOMUtil.getOffsetFromParent(oGeometry.position, mParentOffset, iParentScrollTop, iParentScrollLeft);


			var mSize = oGeometry.size;

			$overlay.css("width", mSize.width + "px");
			$overlay.css("height", mSize.height + "px");
			$overlay.css("top", mPosition.top + "px");
			$overlay.css("left", mPosition.left + "px");

			var iZIndex = DOMUtil.getZIndex(oGeometry.domRef);
			if (iZIndex) {
				$overlay.css("z-index", iZIndex);
			}
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
				if (iScrollHeight > mSize.height || iScrollWidth > mSize.width) {
					this._oDummyScrollContainer = jQuery("<div class='sapUiDtDummyScrollContainer' style='height: " + iScrollHeight + "px; width: " + iScrollWidth + "px;'></div>");
					this.$().append(this._oDummyScrollContainer);
				}
				DOMUtil.syncScroll(oGeometry.domRef, this.getDomRef());
			}

			this.getChildren().forEach(function(oChild) {
				oChild.applyStyles();
			});

			if (this._oDummyScrollContainer) {
				this._oDummyScrollContainer.remove();
				delete this._oDummyScrollContainer;
			}
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
	Overlay.prototype.getGeometry = function() {

		var oDomRef = this.getAssociatedDomRef();
		var mGeometry = DOMUtil.getGeometry(oDomRef);

		if (!mGeometry) {
			var aChildrenGeometry = [];
			this.getChildren().forEach(function(oChildOverlay) {
				aChildrenGeometry.push(oChildOverlay.getGeometry());
			});
			mGeometry = OverlayUtil.getGeometry(aChildrenGeometry);
		}

		return mGeometry;
	};

	/**
	 * @private
	 */
	Overlay.prototype._updateDom = function() {
		var oGeometry = this.getGeometry();
		var $this = this.$();

		var oParent = this.getParent();
		if (oParent) {
			if (oParent.getDomRef) {
				var oParentDomRef = oParent.getDomRef();
				if (oParentDomRef !== this.$().parent().get(0)) {
					$this.appendTo(oParentDomRef);
				}
			} else {
				// instead of adding the created DOM into the UIArea's DOM, we are adding it to overlay-container to avoid clearing of the DOM
				var oOverlayContainer = Overlay.getOverlayContainer();
				var $parent = $this.parent();
				var oParentElement = $parent.length ? $parent.get(0) : null;
				if (oOverlayContainer !== oParentElement) {
					$this.appendTo(oOverlayContainer);
				}
				this.applyStyles();
			}
		}
		if (oGeometry && this.isVisible()) {
			$this.show();
		} else {
			// we should always be in DOM to make sure, that drop events (dragend) will be fired even if the overlay isn't visible anymore
			$this.hide();
		}

		var $clonedDom = $this.find(">.sapUiDtClonedDom");
		var vCloneDomRef = this.getDesignTimeMetadata().getCloneDomRef();
		if (vCloneDomRef) {
			var oDomRef = oGeometry ? oGeometry.domRef : null;
			if (oDomRef) {
				if (vCloneDomRef !== true) {
					oDomRef = DOMUtil.getDomRefForCSSSelector(oDomRef, vCloneDomRef);
				}

				if (!$clonedDom.length) {
					$clonedDom = jQuery("<div class='sapUiDtClonedDom'></div>").prependTo($this);
				} else {
					$clonedDom.empty();
				}
				DOMUtil.cloneDOMAndStyles(oDomRef, $clonedDom);
			}
		} else {
			$clonedDom.remove();
		}
	};


	Overlay.prototype._onScroll = function() {
		var oGeometry = this.getGeometry();
		var oDomRef = oGeometry ? oGeometry.domRef : null;
		if (oDomRef) {
			DOMUtil.syncScroll(this.$(), oDomRef);
		}
	};


	/**
	 * Sets whether the Overlay is for an element/aggregation in a hidden tree (not accessible via public aggregations)
	 * @param {boolean} bInHiddenTree if the Overlay is inHiddenTree
	 * @returns {sap.ui.dt.Overlay} returns this
	 * @public
	 */
	Overlay.prototype.setInHiddenTree = function(bInHiddenTree) {
		if (bInHiddenTree !== this.isInHiddenTree()) {

			this.toggleStyleClass("sapUiDtOverlayInHiddenTree", bInHiddenTree);
			this.setProperty("inHiddenTree", bInHiddenTree);
		}

		return this;
	};

	/**
	 * Returns if the Overlay is for an element/aggregation in a hidden tree (not accessible via public aggregations)
	 * @public
	 * @return {boolean} if the Overlay is in hidden tree
	 */
	Overlay.prototype.isInHiddenTree = function() {
		return this.getInHiddenTree();
	};


	/**
	 * Sets whether the Overlay is visible
	 * @param {boolean} bVisible if the Overlay is visible
	 * @returns {sap.ui.dt.Overlay} returns this
	 * @public
	 */
	Overlay.prototype.setVisible = function(bVisible) {
		this.setProperty("visible", bVisible);
		this._bVisible = bVisible;

		return this;
	};

	/**
	 * Returns whether the Overlay is visible
	 * @return {boolean} if the Overlay is visible
	 * @public
	 */
	Overlay.prototype.getVisible = function() {
		if (this._bVisible === null) {
			return !this.getDesignTimeMetadata().isIgnored();
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

	return Overlay;
}, /* bExport= */ true);
