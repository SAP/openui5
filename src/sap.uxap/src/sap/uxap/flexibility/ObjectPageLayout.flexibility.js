/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/uxap/changeHandler/MoveObjectPageSection',
	'sap/uxap/changeHandler/AddIFrameObjectPageLayout'
], function (MoveObjectPageSection, AddIFrameObjectPageLayout) {
	"use strict";

	return {
		"moveControls": {
			"changeHandler": MoveObjectPageSection,
			"layers": {
				"USER": true
			}
		},
		"addIFrame": {
			"changeHandler": AddIFrameObjectPageLayout
		}
	};
}, /* bExport= */ true);
