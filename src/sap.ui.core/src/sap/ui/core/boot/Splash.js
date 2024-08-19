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
	"sap/ui/core/Core",
	"sap/ui/dom/_ready"
], (
	config,
	LoaderExtensions,
	Core,
	_ready
) => {
	"use strict";

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
				return splashDiv;
			}).then((splashDiv) => {
				sap.ui.require(["sap/ui/core/Rendering"], (Rendering) => {
					Rendering.addPrerenderingTask(() => {
						Core.ready().then(() => {
							document.body.removeChild(splashDiv);
						});
					});
				});
			});
		}
	}

	return {
		run: () => {
			return _ready().then(() => {
				_splash();
			});
		}
	};
});
