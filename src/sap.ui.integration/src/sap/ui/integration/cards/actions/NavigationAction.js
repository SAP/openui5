/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction",
	"sap/ui/util/openWindow"
], function (
	BaseAction,
	openWindow
) {
	"use strict";

	var NavigationAction = BaseAction.extend("sap.ui.integration.cards.actions.NavigationAction", {
		metadata: {
			library: "sap.ui.integration"
		}
	});

	/**
	 * @override
	 */
	NavigationAction.prototype.execute = function () {
		var oResolvedConfig = this.getResolvedConfig();

		if (oResolvedConfig.service) {
			return;
		}

		var oParameters = this.getParameters(),
			sUrl,
			sTarget,
			sParametersUrl,
			sParametersTarget;

		if (oParameters) {
			sParametersUrl = oParameters.url;
			sParametersTarget = oParameters.target;
		}

		sUrl = oResolvedConfig.url || sParametersUrl;
		sTarget = oResolvedConfig.target || sParametersTarget || NavigationAction.DEFAULT_TARGET;

		if (sUrl) {
			this._openUrl(sUrl, sTarget);
		}

	};

	/**
	 * Navigates to url
	 *
	 * @param {string} sUrl url to navigate to.
	 * @param {string} sTarget target of the url
	 * @private
	 */
	NavigationAction.prototype._openUrl = function (sUrl, sTarget) {
		openWindow(sUrl, sTarget);
	};

	/** Static methods */

	/**
	 * Default target for the navigation action.
	 * @readonly
	 * @const {string}
	 */
	NavigationAction.DEFAULT_TARGET = "_blank";

	return NavigationAction;
});