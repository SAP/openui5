/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.AggregationOverlay.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/dt/DOMUtil',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil'
],
function(jQuery, Control, DOMUtil, ElementUtil, OverlayUtil) {
	"use strict";


	/**
	 * Constructor for a new AggregationOverlay.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The AggregationOverlay allows to create an absolute positioned DIV above the associated
	 * control / element.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.AggregationOverlay
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AggregationOverlay = Control.extend("sap.ui.dt.AggregationOverlay", /** @lends sap.ui.dt.AggregationOverlay.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				visible : {
					type : "boolean",
					defaultValue : true
				},
				aggregationName : {
					type : "string"
				},
				offset : {
					type : "object"
				},
				droppable : {
					type : "boolean",
					defaultValue : false
				}
			}, 
			aggregations : {
				children : {
					type : "sap.ui.dt.Overlay",
					multiple : true
				}
			},
			events : {
				droppableChange : {
					parameters : {
						droppable : "boolean"
					}
				}
			}
		}
	});

	/** 
	 * @protected
	 */
	AggregationOverlay.prototype.init = function() {
		this.attachBrowserEvent("scroll", this._onScroll, this);
	};

	/** 
	 * @protected
	 */
	AggregationOverlay.prototype.exit = function() {
		this.removeAllChildren();
		this.setOffset(null);

		delete this._oDomRef;
	};	

	/** 
	 * @override
	 */
	AggregationOverlay.prototype.getDomRef = function() {
		return this._oDomRef || Control.prototype.getDomRef.apply(this, arguments);
	};

	/** 
	 * @protected
	 */
	AggregationOverlay.prototype.onAfterRendering = function() {
		this._oDomRef = this.getDomRef();
		if (this._oDomRef) {
			this._updateDom();
		}
	};

	/** 
	 * @private
	 */
	AggregationOverlay.prototype._updateDom = function() {
		var oAggregationGeometry = this.getGeometry();

		var oParent = this.getParent();
		if (oParent) {
			if (oParent.getDomRef) {
				this.$().appendTo(oParent.getDomRef());
			} else {
				this.$().appendTo(oParent.getRootNode());
			}
		}		
		if (oAggregationGeometry && this.isVisible()) {
			this.$().show();
		} else {
			this.$().hide();
		}

	};

	AggregationOverlay.prototype.applyStyles = function() {
		var oAggregationGeometry = this.getGeometry();

		if (oAggregationGeometry) {
			var oElementOverlay = this.getParent();
			var mElementOffset = oElementOverlay ? oElementOverlay.$().offset() : null;
			var mPosition = DOMUtil.getOffsetFromParent(oAggregationGeometry.position, mElementOffset);

			var iZIndex = DOMUtil.getZIndex(oAggregationGeometry.domRef);
			var oOverflows = DOMUtil.getOverflows(oAggregationGeometry.domRef);

			var $aggregation = this.$();

			var mSize = oAggregationGeometry.size;
			$aggregation.css("width", mSize.width + "px");
			$aggregation.css("height", mSize.height + "px");
			$aggregation.css("top", mPosition.top + "px");
			$aggregation.css("left", mPosition.left + "px");
			if (iZIndex) {
				$aggregation.css("z-index", iZIndex);
			}
			if (oOverflows) {
				this._bScrollable = true;
				$aggregation.css("overflow-x", oOverflows.overflowX);
				$aggregation.css("overflow-y", oOverflows.overflowY);
			} else {
				this._bScrollable = false;
			}

			if (oAggregationGeometry.domRef && this._bScrollable ) {
				DOMUtil.syncScroll(oAggregationGeometry.domRef, this.$());
			}

			this.getChildren().forEach(function(oOverlay) {
				oOverlay.applyStyles();
			});
		}
	};

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.getAssociatedDomRef = function() {
		var oOverlay = this.getParent();
		var oElement = this.getElementInstance();
		var sAggregationName = this.getAggregationName();

		var oElementDomRef = ElementUtil.getDomRef(oElement);
		if (oElementDomRef) {
			var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
			var vAggregationDomRef = oDesignTimeMetadata.getAggregationDomRef(sAggregationName);
			if (typeof vAggregationDomRef === "function") {
				return vAggregationDomRef.call(oElement, sAggregationName);
			} else if (typeof vAggregationDomRef === "string") {
				return DOMUtil.getDomRefForCSSSelector(oElementDomRef, vAggregationDomRef);
			}
		}
	};

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.getGeometry = function() {
		var oDomRef = this.getAssociatedDomRef();
		var mGeometry = DOMUtil.getGeometry(oDomRef);

		if (!mGeometry) {
			var aChildrenGeometry = [];
			this.getChildren().forEach(function(oOverlay) {
				aChildrenGeometry.push(oOverlay.getGeometry());
			});
			mGeometry = OverlayUtil.getGeometry(aChildrenGeometry);
		}

		return mGeometry;
	};

	/** 
	 * @private
	 */
	AggregationOverlay.prototype._onScroll = function() {
		var oGeometry = this.getGeometry();
		var oAggregationDomRef = oGeometry ? oGeometry.domRef : null;
		if (oAggregationDomRef) {
			DOMUtil.syncScroll(this.$(), oAggregationDomRef);
		}
	};

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.setDroppable = function(bDroppable) {
		if (this.getDroppable() !== bDroppable) {
			this.setProperty("droppable", bDroppable);
			this.toggleStyleClass("sapUiDtAggregationOverlayDroppable", bDroppable);

			// TODO : cancelable
			this.fireDroppableChange({droppable : bDroppable});
		}
	};	

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.getElementInstance = function() {
		var oElementOverlay = this.getParent();
		if (oElementOverlay) {
			return oElementOverlay.getElementInstance();
		}
	};	

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.isScrollable = function() {
		return this._bScrollable;
	};	

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.isDroppable = function() {
		return this.getDroppable();
	};	

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.isVisible = function() {
		return this.getVisible();
	};	

	/** 
	 * @public
	 */
	AggregationOverlay.prototype.getChildren = function() {
		return this.getAggregation("children") || [];
	};	

	return AggregationOverlay;
}, /* bExport= */ true);