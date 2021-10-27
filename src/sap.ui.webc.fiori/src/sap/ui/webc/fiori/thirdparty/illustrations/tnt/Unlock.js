sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Unlock', './tnt-Scene-Unlock', './tnt-Spot-Unlock'], function (exports, Illustrations, tntDialogUnlock, tntSceneUnlock, tntSpotUnlock) { 'use strict';

	const name = "Unlock";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogUnlock,
		sceneSvg: tntSceneUnlock,
		spotSvg: tntSpotUnlock,
		set,
	});

	exports.dialogSvg = tntDialogUnlock;
	exports.sceneSvg = tntSceneUnlock;
	exports.spotSvg = tntSpotUnlock;

	Object.defineProperty(exports, '__esModule', { value: true });

});
