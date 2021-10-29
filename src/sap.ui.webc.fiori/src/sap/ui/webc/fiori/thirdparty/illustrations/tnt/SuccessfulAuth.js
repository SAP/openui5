sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-SuccessfulAuth', './tnt-Scene-SuccessfulAuth', './tnt-Spot-SuccessfulAuth'], function (exports, Illustrations, tntDialogSuccessfulAuth, tntSceneSuccessfulAuth, tntSpotSuccessfulAuth) { 'use strict';

	const name = "SuccessfulAuth";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogSuccessfulAuth,
		sceneSvg: tntSceneSuccessfulAuth,
		spotSvg: tntSpotSuccessfulAuth,
		set,
	});

	exports.dialogSvg = tntDialogSuccessfulAuth;
	exports.sceneSvg = tntSceneSuccessfulAuth;
	exports.spotSvg = tntSpotSuccessfulAuth;

	Object.defineProperty(exports, '__esModule', { value: true });

});
