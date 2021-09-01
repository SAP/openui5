sap.ui.define(['exports', '../getSharedResource'], function (exports, getSharedResource) { 'use strict';

	const registry = getSharedResource("SVGIllustration.registry", new Map());
	const ILLUSTRATION_NOT_FOUND = "ILLUSTRATION_NOT_FOUND";
	const registerIllustration = (name, { dialogSvg, sceneSvg, spotSvg, title, subtitle } = {}) => {
		registry.set(name, {
			dialogSvg,
			sceneSvg,
			spotSvg,
			title,
			subtitle,
		});
	};
	const getIllustrationDataSync = nameProp => {
		return registry.get(nameProp) || ILLUSTRATION_NOT_FOUND;
	};

	exports.getIllustrationDataSync = getIllustrationDataSync;
	exports.registerIllustration = registerIllustration;

	Object.defineProperty(exports, '__esModule', { value: true });

});
