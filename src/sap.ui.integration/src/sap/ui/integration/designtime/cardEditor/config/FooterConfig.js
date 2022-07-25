/*!
 * ${copyright}
 *
 * @private
 * @experimental
 */
sap.ui.define([
	"sap/ui/integration/designtime/cardEditor/config/generateFooterActionsStripConfig"
], function (
	generateFooterActionsStripConfig
) {
	"use strict";

	return {
		"items": generateFooterActionsStripConfig({
			"tags": ["footer"],
			"path": "footer/actionsStrip"
		})
	};
});
