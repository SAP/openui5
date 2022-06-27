/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/viz/VizBase",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/base/util/merge"
], function (
	VizBase, SegmentedButton, SegmentedButtonItem, merge
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.viz.VizBase
	 * @alias sap.ui.integration.editor.fields.viz.ShapeSelect
	 * @author SAP SE
	 * @since 1.84.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.84.0
	 * @ui5-restricted
	 */
	var ShapeSelect = VizBase.extend("sap.ui.integration.editor.fields.viz.ShapeSelect", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				value: {
					type: "string",
					defaultValue: "Circle"
				}
			}
		},
		renderer: VizBase.getMetadata().getRenderer()
	});

	// create this._oControl and set up it
	ShapeSelect.prototype.onInit = function () {
		this._oControl = new SegmentedButton({
			items: [
				new SegmentedButtonItem({
					icon: "sap-icon://circle-task",
					key: "Circle"
				}),
				new SegmentedButtonItem({
					icon: "sap-icon://border",
					key: "Square"
				})
			]
		});
	};

	// add style class to the render manager
	ShapeSelect.prototype.applyStyle = function (oRm) {
		oRm.addClass("sapUiIntegrationShapeSelect");
	};

	// bind propeties to this._oControl
	ShapeSelect.prototype.bindPropertyToControl = function (sProperty, oBindingInfo) {
		if (sProperty === "editable") {
			var oControlBindingInfo = merge({}, oBindingInfo);
			this._oControl.bindProperty("enabled", oControlBindingInfo);
		}
		if (sProperty === "value") {
			var oControlBindingInfo = merge({}, oBindingInfo);
			this._oControl.bindProperty("selectedKey", oControlBindingInfo);
		}
	};

	return ShapeSelect;
});