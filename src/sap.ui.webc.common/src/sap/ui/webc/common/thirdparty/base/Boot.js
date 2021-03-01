sap.ui.define(['exports', './EventProvider', './util/whenDOMReady', './FontFace', './SystemCSSVars', './config/Theme', './theming/applyTheme', './FeaturesRegistry'], function (exports, EventProvider, whenDOMReady, FontFace, SystemCSSVars, Theme, applyTheme, FeaturesRegistry) { 'use strict';

	let booted = false;
	const eventProvider = new EventProvider();
	const attachBoot = listener => {
		eventProvider.attachEvent("boot", listener);
	};
	const boot = async () => {
		if (booted) {
			return;
		}
		const OpenUI5Support = FeaturesRegistry.getFeature("OpenUI5Support");
		if (OpenUI5Support) {
			await OpenUI5Support.init();
		}
		await whenDOMReady();
		await applyTheme(Theme.getTheme());
		OpenUI5Support && OpenUI5Support.attachListeners();
		FontFace();
		SystemCSSVars();
		await eventProvider.fireEventAsync("boot");
		booted = true;
	};

	exports.attachBoot = attachBoot;
	exports.boot = boot;

	Object.defineProperty(exports, '__esModule', { value: true });

});
