/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/m/Select",
	"sap/ui/core/ListItem"

], function (
	BaseField, Select, ListItem
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.BaseField
	 * @alias sap.ui.integration.editor.fields.DestinationField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var DestinationField = BaseField.extend("sap.ui.integration.editor.fields.DestinationField", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	DestinationField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			oVisualization = {
				type: Select,
				settings: {
					busy: { path: 'currentSettings>_loading' },
					selectedKey: { path: 'currentSettings>value' },
					forceSelection: false,
					width: "100%",
					items: {
						path: "currentSettings>_values", template: new ListItem({
							text: "{currentSettings>name}",
							key: "{currentSettings>name}"
						})

					}
				}
			};
		}
		this._visualization = oVisualization;
		this.attachAfterInit(this._afterInit);
	};

	DestinationField.prototype._afterInit = function () {
		var oControl = this.getAggregation("_field");
		if (oControl instanceof Select) {
			//workaround for DIGITALWORKPLACE-5156, set the min-height of the popover
			oControl.open = this.onOpen;
		}
	};

	DestinationField.prototype.onOpen = function () {
		Select.prototype.open.apply(this, arguments);
		var oPopover = this.getPicker();
		if (oPopover._oCalcedPos === "Bottom" && !oPopover.hasStyleClass("sapUiIntegrationEditorPopupHeight")) {
			oPopover.addStyleClass("sapUiIntegrationEditorPopupHeight");
		} else if (oPopover._oCalcedPos !== "Bottom" &&  oPopover.hasStyleClass("sapUiIntegrationEditorPopupHeight")) {
			oPopover.removeStyleClass("sapUiIntegrationEditorPopupHeight");
		}
	};

	return DestinationField;
});