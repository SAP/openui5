/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/ComponentContainer'
], function ($, ComponentContainer) {
	"use strict";
	var _loadingStarted = false,
		_oComponent = null,
		_$Component = null;

	/**
	 * By using start launcher will instantiate and place the component into html.
	 * By using teardown launcher will destroy the component and remove the div from html.
	 * Calling start twice without teardown is not allowed
	 * @private
	 * @class
	 * @author SAP SE
	 * @alias sap.ui.test.launchers.componentLauncher
	 */
	return {

		start: function (mComponentConfig) {
			if (_loadingStarted) {
				throw "sap.ui.test.launchers.componentLauncher: Start was called twice without teardown";
			}

			mComponentConfig.async = true;
			var oPromise = sap.ui.component(mComponentConfig);

			_loadingStarted = true;

			return oPromise.then(function (oComponent) {
				var sId = jQuery.sap.uid();

				// create and add div to html
				_$Component = $('<div id="' + sId + '" class="sapUiOpaComponent"></div>');
				$("body").append(_$Component);

				// create and place the component into html
				_oComponent = new ComponentContainer({component: oComponent});

				_oComponent.placeAt(sId);
			});

		},

		teardown: function () {
			// Opa prevent the case if teardown was called after the start but before the promise was fulfilled
			if (!_loadingStarted){
				throw "sap.ui.test.launchers.componentLauncher: Teardown has been called but there was no start";
			}
			_oComponent.destroy();
			_$Component.remove();
			_loadingStarted = false;
		}
	};

}, /* export= */ true);