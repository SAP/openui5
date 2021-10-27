sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ExternalLink', './tnt-Scene-ExternalLink', './tnt-Spot-ExternalLink'], function (exports, Illustrations, tntDialogExternalLink, tntSceneExternalLink, tntSpotExternalLink) { 'use strict';

	const name = "ExternalLink";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogExternalLink,
		sceneSvg: tntSceneExternalLink,
		spotSvg: tntSpotExternalLink,
		set,
	});

	exports.dialogSvg = tntDialogExternalLink;
	exports.sceneSvg = tntSceneExternalLink;
	exports.spotSvg = tntSpotExternalLink;

	Object.defineProperty(exports, '__esModule', { value: true });

});
