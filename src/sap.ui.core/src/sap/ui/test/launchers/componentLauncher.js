/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/ComponentContainer', // sap.ui.component
	"sap/base/util/uid",
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/Component'
], function(ComponentContainer, uid, jQueryDOM, Component) {
	"use strict";

	var _loadingStarted = false,
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
				throw new Error("sap.ui.test.launchers.componentLauncher: Start was called twice without teardown. Only one component can be started at a time.");
			}

			var oPromise = Component.create(mComponentConfig);

			_loadingStarted = true;

			return oPromise.then(function (oComponent) {
				var sId = uid();

				// create and add div to html
				_$Component = jQueryDOM('<div id="' + sId + '" class="sapUiOpaComponent"></div>');
				jQueryDOM("body").append(_$Component).addClass("sapUiOpaBodyComponent");

				// create and place the component into html
				_oComponentContainer = new ComponentContainer({
					component: oComponent,
					height: "100%",
					width: "100%"
				});

				_oComponentContainer.placeAt(sId);
			});

		},

		hasLaunched : function () {
			return _loadingStarted;
		},

		teardown: function () {
			// Opa prevent the case if teardown was called after the start but before the promise was fulfilled
			if (!_loadingStarted){
				throw new Error("sap.ui.test.launchers.componentLauncher: Teardown was called before start. No component was started.");
			}
			_oComponentContainer.destroy();
			_$Component.remove();
			_loadingStarted = false;
			jQueryDOM("body").removeClass("sapUiOpaBodyComponent");
		}
	};

}, /* export= */ true);
