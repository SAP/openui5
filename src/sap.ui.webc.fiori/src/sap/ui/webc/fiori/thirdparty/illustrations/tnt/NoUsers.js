sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-NoUsers', './tnt-Scene-NoUsers', './tnt-Spot-NoUsers'], function (exports, Illustrations, tntDialogNoUsers, tntSceneNoUsers, tntSpotNoUsers) { 'use strict';

	const name = "NoUsers";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogNoUsers,
		sceneSvg: tntSceneNoUsers,
		spotSvg: tntSpotNoUsers,
		set,
	});

	exports.dialogSvg = tntDialogNoUsers;
	exports.sceneSvg = tntSceneNoUsers;
	exports.spotSvg = tntSpotNoUsers;

	Object.defineProperty(exports, '__esModule', { value: true });

});
