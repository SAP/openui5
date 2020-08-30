/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer"
], function(uid, Component, ComponentContainer) {
	"use strict";

	var _loadingStarted = false,
		_oComponentContainer = null,
		_oComponentDOM = null;

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
				_oComponentDOM = document.createElement("div");
				_oComponentDOM.id = sId;
				_oComponentDOM.className = "sapUiOpaComponent";
				document.body.appendChild(_oComponentDOM);
				document.body.classList.add("sapUiOpaBodyComponent");

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
			_oComponentDOM.remove();
			_loadingStarted = false;
			document.body.classList.remove("sapUiOpaBodyComponent");
		}
	};

}, /* export= */ true);
