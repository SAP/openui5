sap.ui.define(['exports', './util/whenDOMReady', './FontFace', './SystemCSSVars', './config/Theme', './theming/applyTheme', './Runtimes', './FeaturesRegistry'], function (exports, whenDOMReady, FontFace, SystemCSSVars, Theme, applyTheme, Runtimes, FeaturesRegistry) { 'use strict';

	let bootPromise;
	const attachBoot = async listener => {
		await boot();
		listener();
	};
	const boot = async () => {
		if (bootPromise) {
			return bootPromise;
		}
		bootPromise = new Promise(async resolve => {
			Runtimes.registerCurrentRuntime();
			const OpenUI5Support = FeaturesRegistry.getFeature("OpenUI5Support");
			const F6Navigation = FeaturesRegistry.getFeature("F6Navigation");
			if (OpenUI5Support) {
				await OpenUI5Support.init();
			} else if (F6Navigation) {
				F6Navigation.init();
			}
			await whenDOMReady();
			await applyTheme(Theme.getTheme());
			OpenUI5Support && OpenUI5Support.attachListeners();
			FontFace();
			SystemCSSVars();
			resolve();
		});
		return bootPromise;
	};

	exports.attachBoot = attachBoot;
	exports.boot = boot;

	Object.defineProperty(exports, '__esModule', { value: true });

});
