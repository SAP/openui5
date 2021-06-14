sap.ui.define(['exports', '../InitialConfiguration'], function (exports, InitialConfiguration) { 'use strict';

	let assetsPath;
	const getAssetsPath = () => {
		if (assetsPath === undefined) {
			assetsPath = InitialConfiguration.getAssetsPath();
		}
		return assetsPath;
	};
	const setAssetsPath = newAssetsPath => {
		assetsPath = newAssetsPath;
	};

	exports.getAssetsPath = getAssetsPath;
	exports.setAssetsPath = setAssetsPath;

	Object.defineProperty(exports, '__esModule', { value: true });

});
