sap.ui.define(['exports', '../getSharedResource'], function (exports, getSharedResource) { 'use strict';

	const registry = getSharedResource("SVGIllustration.registry", new Map());
	const ILLUSTRATION_NOT_FOUND = "ILLUSTRATION_NOT_FOUND";
	const registerIllustration = (name, { dialogSvg, sceneSvg, spotSvg, set, title, subtitle } = {}) => {
		registry.set(`${set}/${name}`, {
			dialogSvg,
			sceneSvg,
			spotSvg,
			title,
			subtitle,
		});
	};
	const getIllustrationDataSync = nameProp => {
		let set = "fiori";
		if (nameProp.startsWith("Tnt")) {
			set = "tnt";
			nameProp = nameProp.replace(/^Tnt/, "");
		}
		return registry.get(`${set}/${nameProp}`) || ILLUSTRATION_NOT_FOUND;
	};

	exports.getIllustrationDataSync = getIllustrationDataSync;
	exports.registerIllustration = registerIllustration;

	Object.defineProperty(exports, '__esModule', { value: true });

});
