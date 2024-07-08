/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/util/adaptationStarter",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/base/util/merge"
], function(
	adaptationStarter,
	Layer,
	LayerUtils,
	merge
) {
	"use strict";

	function checkLayer(sLayer) {
		if (!LayerUtils.isValidLayer(sLayer)) {
			throw new Error("An invalid layer is passed");
		}
	}

	/**
	 * Starts UI adaptation, initiated for an application at the passed root control instance.
	 * With this API you are also able to modify the UI adaptation plugins list and or add some event handler functions to be called on start, failed and stop events.
	 * CAUTION: In the key user layer (CUSTOMER) the adaptation mode starts automatically after a reload triggered by the adaptation mode
	 * (e.g. due to personalization changes or versioning). In this case the RuntimeAuthoring class will be started with default parameters.
	 *
	 * @function
	 * @since 1.83
	 * @alias module:sap/ui/rta/api/startAdaptation
	 *
	 * @param {object} mOptions - Object with properties
	 * @param {sap.ui.core.Control|sap.ui.core.UIComponent} mOptions.rootControl - Control instance to get the AppComponent. This then is used to start UI adaptation.
	 * @param {object} [mOptions.flexSettings] - Map with flex-related settings
	 * @param {string} [mOptions.flexSettings.layer] - The Layer in which RTA should be started. Default: "CUSTOMER"
	 * @param {boolean} [mOptions.flexSettings.developerMode] - Whether RTA is started in developerMode mode. Default: <code>false</code>
	 * @param {function} [loadPlugins] - Callback function that enables the modification of the default plugin list of UI adaptation. UI adaptation is passed to this function
	 * @param {function} [onStart] - Event handler function called on start event
	 * @param {function} [onFailed] - Event handler function called on failed event
	 * @param {function} [onStop] - Event handler function called on stop event
	 * @returns {Promise} Resolves when UI adaptation was successfully started
	 * @public
	 */
	function startAdaptation(mOptions, loadPlugins, onStart, onFailed, onStop) {
		var mDefaultOptions = {
			flexSettings: {
				developerMode: false,
				layer: Layer.CUSTOMER
			}
		};
		mOptions = merge(mDefaultOptions, mOptions);
		return Promise.resolve()
		.then(checkLayer.bind(this, mOptions.flexSettings.layer))
		.then(adaptationStarter.bind(this, mOptions, loadPlugins, onStart, onFailed, onStop));
	}

	return startAdaptation;
});