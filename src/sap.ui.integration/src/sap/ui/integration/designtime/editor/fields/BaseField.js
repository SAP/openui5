/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/m/MultiInput",
	"sap/m/Token"
], function (
	Control,
	Button,
	HBox,
	MultiInput,
	Token
) {
	"use strict";
	/**
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.propertyEditors.BaseField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var BaseField = Control.extend("sap.ui.integration.designtime.editor.fields.Base", {
		metadata: {
			properties: {
				configuration: {
					type: "object"
				},
				specialButton: {
					type: "object"
				},
				mode: {
					style: "string"
				}
			},
			aggregations: {
				editor: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			associations: {
				designtime: {
					multiple: false
				}
			},
			events: {
				change: {

				}
			}
		},
		renderer: function (oRm, oControl) {
			oRm.openStart("div");
			oRm.addClass("sapUiIntegrationCardEditorItemField");
			if (oControl.getEditor() && oControl.getEditor().getWidth) {
				oRm.addStyle("width", oControl.getEditor().getWidth());
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeElementData(oControl);
			oRm.openEnd();
			oRm.renderControl(oControl.getEditor());
			oRm.close("div");

		}
	});

	BaseField.prototype.setConfiguration = function (oConfig, bSuppress) {
		if (oConfig !== this.getConfiguration()) {
			this.setProperty("configuration", oConfig, bSuppress);
			if (oConfig) {
				this.initEditor(oConfig);
			}
		}
	};

	BaseField.prototype.initEditor = function (oConfig) {
		var oControl;
		this.initVisualization && this.initVisualization(oConfig);
		if (this._visualization.editor) {
			oControl = this._visualization.editor;
		} else if (this._visualization.type) {
			oControl = new this._visualization.type(this._visualization.settings || {});
		}
		if (oControl) {
			this.setEditor(oControl);
		}
	};

	/**
	 * Adds a style class to the real editor that is used for this field.
	 * @param {string} sStyleClass
	 */
	BaseField.prototype.addStyleClass = function (sStyleClass) {
		if (this.getEditor()) {
			this.getEditor().addStyleClass(sStyleClass);
		}
	};

	BaseField.prototype.initVisualization = function () {
	};

	BaseField.prototype.getSpecialButton = function () {
		return null;
		/** if (this.getMode() !== "admin") {
			return null;
		}
		if (!this._oButton) {
			this._oButton = new Button({
				icon: "sap-icon://settings"
			});
			this._oButton.addStyleClass("sapUiIntegrationCardEditorSpecialButton");
		}
		return this._oButton; **/
	};


	BaseField.prototype.showMessage = function (sText, sIcon, sState) {

	};

	return BaseField;
});
