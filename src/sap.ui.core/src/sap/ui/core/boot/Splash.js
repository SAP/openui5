/*!
 * ${copyright}
 */

/**
 * Initialize splash screen
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/config",
	"sap/base/util/LoaderExtensions",
	"sap/ui/dom/_ready"
], (
	config,
	LoaderExtensions,
	_ready
) => {
	"use strict";

	let oSplashDiv;

	/**
	 * Paint splash
	 * @private
	 */
	function _splash() {
		const sSplashLocation = config.get({
			name: "sapUiSplashLocation",
			type: config.Type.String
		});
		const aParts = sSplashLocation.split(".");
		const oLink = document.createElement("link");
		oLink.rel = "stylesheet";
		oLink.href = sap.ui.require.toUrl(`${aParts[0]}.css`);
		document.head.appendChild(oLink);
		if (sSplashLocation) {
			LoaderExtensions.loadResource(sSplashLocation, {
				async: true,
				dataType: "html"
			}).then((sSplash) => {
				const splashDiv = document.createElement("div");
				splashDiv.insertAdjacentHTML("beforeend", sSplash);
				document.body.append(splashDiv);
				oSplashDiv = splashDiv;
			});
		}
	}

	return {
		run: () => {
			return _ready().then(() => {
				_splash();
			});
		},
		beforeReady: (context) => {
			return context.then(() => {
				return new Promise((resolve, reject) => {
					sap.ui.require(["sap/ui/core/Rendering"], (Rendering) => {
						Rendering.addPrerenderingTask(() => {
							document.body.removeChild(oSplashDiv);
						});
						resolve();
					}, reject);
				});
			});
		}
	};
});
