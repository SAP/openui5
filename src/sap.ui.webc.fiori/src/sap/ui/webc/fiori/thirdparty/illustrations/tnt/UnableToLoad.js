sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-UnableToLoad', './tnt-Scene-UnableToLoad', './tnt-Spot-UnableToLoad'], function (exports, Illustrations, tntDialogUnableToLoad, tntSceneUnableToLoad, tntSpotUnableToLoad) { 'use strict';

	const name = "UnableToLoad";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogUnableToLoad,
		sceneSvg: tntSceneUnableToLoad,
		spotSvg: tntSpotUnableToLoad,
		set,
	});

	exports.dialogSvg = tntDialogUnableToLoad;
	exports.sceneSvg = tntSceneUnableToLoad;
	exports.spotSvg = tntSpotUnableToLoad;

	Object.defineProperty(exports, '__esModule', { value: true });

});
