sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Success', './tnt-Scene-Success', './tnt-Spot-Success'], function (exports, Illustrations, tntDialogSuccess, tntSceneSuccess, tntSpotSuccess) { 'use strict';

	const name = "Success";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogSuccess,
		sceneSvg: tntSceneSuccess,
		spotSvg: tntSpotSuccess,
		set,
	});

	exports.dialogSvg = tntDialogSuccess;
	exports.sceneSvg = tntSceneSuccess;
	exports.spotSvg = tntSpotSuccess;

	Object.defineProperty(exports, '__esModule', { value: true });

});
