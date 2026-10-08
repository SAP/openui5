/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the geomap and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/odata/v4/GeomapDelegate",
	"sap/ui/mdc/GeomapDelegate",
	"sap/ui/mdc/geomap/PropertyHelper",
	"sap/base/Log",
	"../GeomapDelegate",
	'sap/ui/mdc/enums/GeomapControlPosition'
], function (
	V4GeomapDelegate,
	GeoMapDelegate,
	PropertyHelper,
	Log,
	BaseDelegate,
	GeomapControlPosition
) {
	"use strict";

	const GeomapDelegate = Object.assign({}, V4GeomapDelegate, BaseDelegate);

	const mStateMap = new window.WeakMap();

	GeomapDelegate._getState = function (oGeomap) {
		if (mStateMap.has(oGeomap)) {
			return mStateMap.get(oGeomap);
		}

		return {};
	};

	GeomapDelegate._setState = function (oGeomap, oState) {
		mStateMap.set(oGeomap, oState);
	};

	GeomapDelegate._getMetadataInfo = (oGeomap) => {
		return oGeomap.getDelegate().payload;
	};

	GeomapDelegate._getModel = (oGeomap) => {
		return oGeomap.getModel(GeomapDelegate._getMetadataInfo(oGeomap).model);
	};

	function _onModelContextChange(oGeomap) {
		oGeomap.detachModelContextChange(oGeomap._onModelContextChange);
		oGeomap.getControlDelegate()._createContentFromPropertyInfos(oGeomap);
	}

	/**
	 * Returns the relevant property infos based on the metadata used with the MDC geomap instance.
	 *
	 * @param {sap.ui.mdc.Geomap} oGeomap Reference to the MDC geomap
	 * @returns {array} Array of the property infos to be used within MDC geomap
	 * @since 1.154
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	GeomapDelegate.fetchProperties = (oGeomap) => {

		const oModel = oGeomap.getModel();
		let pCreatePropertyInfos;

		if (!oModel) {
			pCreatePropertyInfos = new Promise((resolve) => {
				oGeomap.attachModelContextChange({
					resolver: resolve
				}, onModelContextChange, this);
			}).then((oModel) => {
				return oGeomap.getControlDelegate()._createPropertyInfos(oGeomap, oModel);
			});
		} else {
			pCreatePropertyInfos = oGeomap.getControlDelegate()._createPropertyInfos(oGeomap, oModel);
		}

		return pCreatePropertyInfos.then((aProperties) => {
			if (oGeomap.data) {
				oGeomap.awaitPropertyHelper().then((oPropertyHelper) => {
					oPropertyHelper.setProperties(aProperties);
					oGeomap.setPropertyInfo(aProperties);


					oGeomap._onModelContextChange = _onModelContextChange.bind(null, oGeomap);
					oGeomap.attachModelContextChange(oGeomap._onModelContextChange);

				});
			}
			return aProperties;
		});
	};

	function onModelContextChange(oEvent, oData) {
		const oGeomap = oEvent.getSource();
		const oModel = oGeomap.getModel();

		if (oModel) {
			oGeomap.detachModelContextChange(onModelContextChange);
			oData.resolver(oModel);
		}
	}

	/**
	 * Returns the binding info for given geomap.
	 * If no binding info exists yet, a new one will be created.
	 * @param {sap.ui.mdc.Geomap} oGeomap Reference to the MDC geomap
	 * @returns {object} BindingInfo object
	 *
	 * @since 1.154
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */
	GeomapDelegate.getBindingInfo = function (oGeomap) {

		return {
			path: "/" + oGeomap.getControlDelegate()._getMetadataInfo(oGeomap).collectionName
		};
	};

	GeomapDelegate.initializeGeomap = function (oGeomap) {
		return new Promise((resolve, reject) => {
			oGeomap.getControlDelegate()._createContentFromPropertyInfos(oGeomap);
			resolve(oGeomap);
		});
	};


	GeomapDelegate.initPropertyHelper = function (oChart) {
		return new Promise((resolve) => {
			resolve(new PropertyHelper([]));
		});
	};

	/**
	 * "Forwards" the initial content (items) for the geomap
	 * @param oGeomap
	 */
	GeomapDelegate.createInitialGeomapContent = function (oGeomap) {
		const oGeomapInstance = oGeomap.getAggregation("_geomap");
		const oState = oGeomap.getControlDelegate()._getState(oGeomap);
		oState.innerGeomap = oGeomapInstance;
		oGeomap.getControlDelegate()._setState(oGeomap, oState);
	};

	// Gets internal property infos by exact property name
	GeomapDelegate._getPropertyInfosByName = function (sName, oGeomap) {
		return oGeomap._getPropertyByNameAsync(sName);
	};

	GeomapDelegate._geomapDataLoadComplete = function (mEventParams) {
		this.setBusy(false);
	};

	// called when a new item will be added (via Settings dialog)
	GeomapDelegate.addItem = function (oGeomap, sPropertyKey, mPropertyBag) {
		return new Promise((resolve, reject) => {
			resolve();
		});
	};

	// called when an item (spot, container & etc.) will be removed (via Settings dialog ???)
	GeomapDelegate.removeItem = function (oGeomap, oItem, mPropertyBag) {
		oItem.destroy();
		// tbd: remove from aggregation
		return Promise.resolve(true);
	};

	//  * Inserts a geomap item into the inner geomap.
	GeomapDelegate.insertItemToGeomap = function (oGeomap, oItem, iIndex, sType) {
		// console.log("insertItemToGeomap " + oItem.getLabel());
	};
	// * Removes a geomap item from the inner geomap.
	GeomapDelegate.removeItemToGeomap = function (oGeomap, oItem) {
		// console.log("removeItemToGeomap " + oItem.getLabel());
	};

	/**
	 * Propagates the changes from the control to the inner Geomap instance (webc)
	 * @param oGeomap
	 * @param oChange
	 */
	GeomapDelegate.propagateItemChangeToGeomap = function (oGeomap, oChange) {
		if (oChange.mutation === "insert") {
			if (oChange.child) {
				Log.info("Inserting item to geomap: " + oChange);
			}

			oGeomap.getControlDelegate().rebind(oGeomap, oGeomap.getControlDelegate().getBindingInfo(oGeomap));
		}
	};

	/**
	 * Updates the binding info
	 * @param oGeomap
	 * @param oBindingInfo
	 */
	GeomapDelegate.updateBindingInfo = function (oGeomap, oBindingInfo) {
		oGeomap.getControlDelegate().updateBindingInfo.call(GeomapDelegate, oGeomap, oBindingInfo);
		oBindingInfo.path = "/" + oGeomap.getPayload().collectionName;
	};

	/**
	 * Returns the inner Geomap instance (webc)
	 * @param oGeomap
	 * @returns {sap.ui.geomap.Geomap}
	 * @private
	 */
	GeomapDelegate._getInnerGeomap = function (oGeomap) {
		return oGeomap.getAggregation("_geomap");
	};

	/**
	 * Returns the current zoom level of the inner Geomap instance (webc)
	 * @param oGeomap
	 * @returns {number}
	 */
	GeomapDelegate.getZoomLevel = function (oGeomap) {
		oGeomap.getControlDelegate()._getInnerGeomap(oGeomap).getZoom();
	};

	/**
	 * Sets the zoom level of the inner Geomap instance (webc)
	 * @param oGeomap
	 * @param iZoomLevel
	 */
	GeomapDelegate.zoomIn = function (oGeomap) {
		oGeomap.getAggregation("_geomap").setZoom(oGeomap.getAggregation("_geomap").getZoom() + 1);
	};

	/**
	 * Sets the zoom level of the inner Geomap instance (webc)
	 * @param oGeomap
	 * @param iZoomLevel
	 */
	GeomapDelegate.zoomOut = function (oGeomap) {
		oGeomap.getAggregation("_geomap").setZoom(oGeomap.getAggregation("_geomap").getZoom() - 1);
	};

	GeomapDelegate.getGeomapBound = function (oChart) {
		const oState = this._getState(oChart);
		return !!oState?.innerGeomap;
	};

	GeomapDelegate.getControlPositions = function () {
		return {
			controlPositions: {
				navigation: GeomapControlPosition.TopLeft,
				selection: GeomapControlPosition.TopRight,
				fullscreen: GeomapControlPosition.TopRight,
				scale: GeomapControlPosition.BottomLeft
			}
		};
	};

	/**
	 * Returns the relevant provider url
	 * @returns {string} Relevant provider url
	 */
	GeomapDelegate.getProvider = function () {
		return "";
	};

	GeomapDelegate._setBindingInfoForState = function (oGeomap, oBindingInfo) {
		if (mStateMap.has(oGeomap)) {
			mStateMap.get(oGeomap).bindingInfo = oBindingInfo;
		} else {
			mStateMap.set(oGeomap, { bindingInfo: oBindingInfo });
		}
	};

	GeomapDelegate.rebind = function (oGeomap, oBindingInfo) {
		return;
	};

	/**
	 * Creates a new independent delegate instance.
	 * Use this in app delegates to avoid mutation of the shared base delegate.
	 * @returns {object} A new delegate object with all methods copied
	 */
	GeomapDelegate.createDelegate = function() {
		return Object.assign({}, GeomapDelegate);
	};

	return GeomapDelegate;
});
