sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-UnsuccessfulAuth', './tnt-Scene-UnsuccessfulAuth', './tnt-Spot-UnsuccessfulAuth'], function (exports, Illustrations, tntDialogUnsuccessfulAuth, tntSceneUnsuccessfulAuth, tntSpotUnsuccessfulAuth) { 'use strict';

	const name = "UnsuccessfulAuth";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogUnsuccessfulAuth,
		sceneSvg: tntSceneUnsuccessfulAuth,
		spotSvg: tntSpotUnsuccessfulAuth,
		set,
	});

	exports.dialogSvg = tntDialogUnsuccessfulAuth;
	exports.sceneSvg = tntSceneUnsuccessfulAuth;
	exports.spotSvg = tntSpotUnsuccessfulAuth;

	Object.defineProperty(exports, '__esModule', { value: true });

});
