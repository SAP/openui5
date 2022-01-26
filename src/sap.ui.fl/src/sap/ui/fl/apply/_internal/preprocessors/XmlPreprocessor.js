/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/base/Log"
], function(
	Component,
	ManifestUtils,
	FlexControllerFactory,
	Utils,
	ChangePersistenceFactory,
	Log
) {
	"use strict";

	/**
	 * The implementation of the <code>XmlPreprocessor</code> for the SAPUI5 flexibility services that can be hooked in the <code>View</code> life cycle.
	 *
	 * @name sap.ui.fl.apply._internal.preprocessors.XmlPreprocessor
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.27.0
	 */
	var XmlPreprocessor = function() {};

	/**
	 * Asynchronous view processing method.
	 *
	 * @param {Node} oView - XML node of the view to process
	 * @param {object} mProperties - Property Bag
	 * @param {string} mProperties.componentId - ID of the component creating the view
	 * @param {string} mPropertyBag.id - ID of the processed view
	 * @returns {Promise.<Node>|Node} Result of the processing, promise if executed asynchronously
	 *
	 * @public
	 */
	XmlPreprocessor.process = function(oView, mProperties) {
		try {
			if (!mProperties || mProperties.sync) {
				Log.warning("Flexibility feature for applying changes on an XML view is only available for " +
					"asynchronous views; merge is be done later on the JS controls.");
				return (oView);
			}

			// align view id attribute with the js processing (getting the id passed in "viewId" instead of "id"
			mProperties.viewId = mProperties.id;

			var oComponent = Component.get(mProperties.componentId);

			if (!oComponent) {
				Log.warning("View is generated without a component. Flexibility features are not possible.");
				return Promise.resolve(oView);
			}

			var oAppComponent = Utils.getAppComponentForControl(oComponent);
			if (!Utils.isApplication(oAppComponent.getManifestObject())) {
				//we only consider components whose type is application. Otherwise, we might send request for components that can never have changes.
				return Promise.resolve(oView);
			}

			var sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
			var oFlexController = FlexControllerFactory.create(sFlexReference);

			return oFlexController.processXmlView(oView, mProperties)
			.then(function() {
				Log.debug("flex processing view " + mProperties.id + " finished");
				return oView;
			})
			.catch(function () {
				Log.warning("Error happens when getting flex cache key! flexibility XML view preprocessing is skipped. " +
				"The processing will be done later on the JS controls.");
				return Promise.resolve(oView);
			});
		} catch (error) {
			var sError = "view " + mProperties.id + ": " + error;
			Log.info(sError); //to allow control usage in applications that do not work with UI flex and components
			// throw new Error(sError); // throw again, when caller handles the promise
			return Promise.resolve(oView);
		}
	};

	/**
	 * Asynchronous determination of a hash key for caching purposes
	 *
	 * @param {object} mProperties - Property Bag
	 * @param {string} mProperties.componentId - Component instance ID
	 * @returns {Promise} Resolves with the hash key
	 *
	 * @public
	 */
	XmlPreprocessor.getCacheKey = function(mProperties) {
		var oComponent = Component.get(mProperties.componentId);
		var oAppComponent = Utils.getAppComponentForControl(oComponent);

		// no caching possible with startup parameter based variants
		if (Utils.isVariantByStartupParameter(oAppComponent)) {
			return Promise.resolve();
		}

		var sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sFlexReference);
		return oChangePersistence.getCacheKey(oAppComponent);
	};

	return XmlPreprocessor;
}, /* bExport= */true);