/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/viz/IconSelect"
], function (
	IconSelect
) {
	"use strict";

	/**
	 * @class Image Select
	 * @extends sap.ui.integration.editor.fields.viz.IconSelect
	 * @alias sap.ui.integration.editor.fields.viz.ImageSelect
	 * @author SAP SE
	 * @since 1.119.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.119.0
	 * @ui5-restricted
	 */
	var ImageSelect = IconSelect.extend("sap.ui.integration.editor.fields.viz.ImageSelect", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				allowDefaultIcons: {
					type: "boolean",
					defaultValue: false
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	return ImageSelect;
});