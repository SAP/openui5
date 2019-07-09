/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.AggregationOverlay.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/Util",
	"sap/base/util/merge"
],
function(
	jQuery,
	Overlay,
	ElementUtil,
	Util,
	merge
) {
	"use strict";

	/**
	 * Constructor for an AggregationOverlay.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The AggregationOverlay allows to create an absolute positioned DIV above the aggregation
	 * of an element.
	 * @extends sap.ui.dt.Overlay
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
	var AggregationOverlay = Overlay.extend("sap.ui.dt.AggregationOverlay", /** @lends sap.ui.dt.AggregationOverlay.prototype */ {
		metadata : {
			library : "sap.ui.dt",
			properties : {
				/**
				 * Name of aggregation to create the AggregationOverlay for
				 */
				aggregationName : {
					type : "string"
				},
				/**
				 * Whether the AggregationOverlay is e.g. a drop target
				 */
				targetZone : {
					type : "boolean",
					defaultValue : false
				},
				scrollContainerId: {
					type: "int"
				}
			},
			events : {
				/**
				 * Event fired when the property "targetZone" was changed
				 */
				targetZoneChange : {
					parameters : {
						targetZone : { type : "boolean" }
					}
				}
			}
		}
	});

	/**
	 * @override
	 */
	AggregationOverlay.prototype._getAttributes = function () {
		return merge(
			{},
			Overlay.prototype._getAttributes.apply(this, arguments),
			{
				"data-sap-ui-dt-aggregation": this.getAggregationName()
			}
		);
	};

	/**
	 * Gets the current position of the provided child (ElementOverlay) in DOM
	 * @param {sap.ui.dt.ElementOverlay} oChild - Lookup ElementOverlay
	 * @return {number} - position index in DOM
	 */
	AggregationOverlay.prototype._getChildIndex = function (oChild) {
		var aChildren = this.getChildren();

		var oPreviousSibling;
		var iPreviousSiblingWithDomIndex = aChildren.indexOf(oChild) - 1;

		while (iPreviousSiblingWithDomIndex > 0) {
			oPreviousSibling = aChildren[iPreviousSiblingWithDomIndex];

			if (oPreviousSibling.isRendered()) {
				break;
			}

			iPreviousSiblingWithDomIndex--;
		}

		return iPreviousSiblingWithDomIndex < 0 ? 0 : iPreviousSiblingWithDomIndex + 1;
	};

	/**
	 * @override
	 */
	AggregationOverlay.prototype.insertChild = function (iPosition, oChild) {
		/**
		 * Legend:
		 * iPosition - position in aggregation/association
		 * iPreviousPosition - previous position in aggregation/association
		 * iPositionInDom - position in DOM
		 * iCurrentPosition - previous position in DOM
		 */
		if (!(Util.isInteger(iPosition))) {
			iPosition = ElementUtil[this.isAssociation() ? 'getIndexInAssociation' : 'getIndexInAggregation'](
				oChild.getElement(),
				this.getElement(),
				this.getAggregationName()
			);
		}

		var iPreviousPosition = this.indexOfAggregation('children', oChild);

		if (iPreviousPosition !== iPosition) {
			// when child is already inside the aggregation but on different position, we need to remove it first
			if (iPreviousPosition > -1) {
				this.removeAggregation('children', oChild);
			}
			this.insertAggregation('children', oChild, iPosition);

			if (this.isRendered()) {
				var iPositionInDom = this._getChildIndex(oChild);
				var bChildRendered = oChild.isRendered();
				var $Child = bChildRendered ? oChild.$() : oChild.render(true);
				var $Children = jQuery(this.getChildrenDomRef());
				var iCurrentPosition = $Children.find('>').index($Child);
				var iInsertIndex;

				if (iCurrentPosition !== iPositionInDom) {
					if (iPositionInDom > 0) {
						iInsertIndex = iCurrentPosition > -1 && iCurrentPosition < iPositionInDom ? iPositionInDom : iPositionInDom - 1;
						$Children.find('>').eq(iInsertIndex).after($Child);
					} else {
						iInsertIndex = iPositionInDom; // === 0
						$Children.prepend($Child);
					}
				}

				if (!bChildRendered) {
					oChild.fireAfterRendering({
						domRef: $Child.get(0)
					});
				}
			}

			this.fireChildAdded();
			return true;
		}
		return false;
	};

	/**
	 * @override
	 */
	AggregationOverlay.prototype.addChild = function (oChild, bSuppressedEvent) {
		this.insertChild(this.getChildren().length, oChild);

		if (!bSuppressedEvent) {
			this.fireChildAdded();
		}
	};

	/**
	 * @override
	 */
	AggregationOverlay.prototype.render = function () {
		if (this.getChildren().length > 0 || this.getDesignTimeMetadata().getDomRef()) {
			this.addStyleClass('sapUiDtAggregationOverlay');
			return Overlay.prototype.render.apply(this, arguments);
		}
	};

	/**
	 * @override
	 */
	AggregationOverlay.prototype._getRenderingParent = function () {
		if (Util.isInteger(this.getScrollContainerId())) {
			return this.getParent().getScrollContainerById(this.getScrollContainerId());
		}
		return Overlay.prototype._getRenderingParent.apply(this, arguments);
	};

	/**
	 * @override
	 */
	AggregationOverlay.prototype._setPosition = function ($Target, oGeometry, $Parent, bForceScrollbarSync) {
		// Apply Overlay position first, then extra logic based on this new position
		Overlay.prototype._setPosition.apply(this, arguments);

		if (oGeometry.domRef && !Util.isInteger(this.getScrollContainerId())) {
			this._handleOverflowScroll(oGeometry, this.$(), this.getParent(), bForceScrollbarSync);
		}
	};

	/**
	 * Returns a DOM representation for an aggregation, associated with this AggregationOverlay, if it can be found or undefined
	 * Representation is searched in DOM based on DesignTimeMetadata defined for the parent Overlay
	 * @return {jQuery} Associated with this AggregationOverlay DOM Element or null, if it can't be found
	 * @public
	 */
	AggregationOverlay.prototype.getAssociatedDomRef = function() {
		var oElement = this.getElement();
		var sAggregationName = this.getAggregationName();
		var oDesignTimeMetadata = this.getDesignTimeMetadata();

		return oDesignTimeMetadata.getAssociatedDomRef(
			oElement,
			oDesignTimeMetadata.getDomRef(),
			sAggregationName
		);
	};

	/**
	 * Sets a property "targetZone", toggles a CSS class for the DomRef based on a property's value and fires "targetZoneChange" event
	 * @param {boolean} bTargetZone state to set
	 * @returns {sap.ui.dt.AggregationOverlay} returns this
	 * @public
	 */
	AggregationOverlay.prototype.setTargetZone = function(bTargetZone) {
		if (this.getTargetZone() !== bTargetZone) {
			this.setProperty("targetZone", bTargetZone);
			this.toggleStyleClass("sapUiDtOverlayTargetZone", bTargetZone);

			this.fireTargetZoneChange({targetZone : bTargetZone});
		}

		return this;
	};

	/**
	 * Returns if the AggregationOverlay is a target zone
	 * @public
	 * @return {boolean} if the AggregationOverlay is a target zone
	 */
	AggregationOverlay.prototype.isTargetZone = function() {
		return this.getTargetZone();
	};

	/**
	 * Returns if the AggregationOverlay is an association
	 * @public
	 * @return {boolean} if the AggregationOverlay is an association
	 */
	AggregationOverlay.prototype.isAssociation = function() {
		return !!this.getDesignTimeMetadata().getData().aggregationLike;
	};

	return AggregationOverlay;
}, /* bExport= */ true);