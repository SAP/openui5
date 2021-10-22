/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.test.Element.
sap.ui.define([
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/OverlayRegistry"
], function(
	ElementUtil,
	DOMUtil,
	OverlayRegistry
) {
	"use strict";

	/**
	 * Utility functionality for Element tests.
	 *
	 * @namespace
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.38
	 * @alias sap.ui.dt.enablement.Util
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var MIN_SIZE = 5;
	var ElementTest = {};

	/**
	 * Returns all design time information of the element
	 * @param {sap.ui.core.Element} oElement - Element to test
	 * @returns {map} Result object
	 */
	ElementTest.getInfo = function(oElement) {
		var oMetadata = oElement.getMetadata();
		var oElementOverlay = OverlayRegistry.getOverlay(oElement);

		return {
			metadata: oMetadata,
			overlay: oElementOverlay
		};
	};


	/**
	 * Returns all aggregation infos of the element
	 * @param {sap.ui.core.Element} oElement - Element to test
	 * @param {string} sAggregationName - Name of the aggregation
	 * @returns {map} Result object
	 */
	ElementTest.getAggregationInfo = function(oElement, sAggregationName) {
		var mAggregationTest = {
			ignored: true,
			domRefDeclared: false,
			domRefFound: false,
			domRefVisible: false,
			overlayTooSmall: false,
			overlayGeometryCalculatedByChildren: false,
			overlayVisible: false
		};
		var oDesignTimeMetadata;

		var mElementInfo = this.getInfo(oElement);
		var oAggregationOverlay = mElementInfo.overlay.getAggregationOverlay(sAggregationName);
		if (oAggregationOverlay) {
			oDesignTimeMetadata = oAggregationOverlay.getDesignTimeMetadata();
		}

		if (oDesignTimeMetadata && !oDesignTimeMetadata.isIgnored(oElement)) {
			mAggregationTest.ignored = false;
			mAggregationTest.domRefDeclared = !!oDesignTimeMetadata.getDomRef();
			var $AggregationDomRef = oAggregationOverlay.getAssociatedDomRef();
			if ($AggregationDomRef) {
				mAggregationTest.domRefFound = true;
				mAggregationTest.domRefVisible = DOMUtil.isVisible($AggregationDomRef.get(0));
			}

			var mGeometry = oAggregationOverlay.getGeometry();
			if (mGeometry) {
				var mSize = mGeometry.size;
				mAggregationTest.overlayTooSmall = (mSize.width <= MIN_SIZE || mSize.height <= MIN_SIZE);
				mAggregationTest.overlayGeometryCalculatedByChildren = !mGeometry.domRef;
				mAggregationTest.overlayVisible = mGeometry.visible;
			}
		}

		return mAggregationTest;
	};


	/**
	 * Returns all information of all aggregations of the element
	 * @param {sap.ui.core.Element} oElement - Element to test
	 * @returns {map} Result object
	 */
	ElementTest.getAggregationsInfo = function(oElement) {
		var mAggregationTests = {};

		ElementUtil.iterateOverAllPublicAggregations(oElement, function(oAggregation) {
			mAggregationTests[oAggregation.name] = this.getAggregationInfo(oElement, oAggregation.name);
		}.bind(this));

		return mAggregationTests;
	};

	return ElementTest;
}, /* bExport= */ true);