/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/ComponentContainer'
], function (jQuery, ComponentContainer) {
	"use strict";
	var $ = jQuery,
		_loadingStarted = false,
		_oComponentContainer = null,
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
				$("body").addClass("sapUiOpaBodyComponent");


				// create and place the component into html
				_oComponentContainer = new ComponentContainer({component: oComponent});

				_oComponentContainer.placeAt(sId);
			});

		},

		teardown: function () {
			// Opa prevent the case if teardown was called after the start but before the promise was fulfilled
			if (!_loadingStarted){
				throw "sap.ui.test.launchers.componentLauncher: Teardown has been called but there was no start";
			}
			_oComponentContainer.destroy();
			_$Component.remove();
			_loadingStarted = false;
			$("body").removeClass("sapUiOpaBodyComponent");
		}
	};

}, /* export= */ true);