/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Button",
	"sap/m/MultiInput",
	"./Settings",
	"sap/m/Token",
	"sap/ui/core/Core"
], function (
	Control,
	Button,
	MultiInput,
	Settings,
	Token,
	Core
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

	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
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
					type: "string"
				},
				host: {
					type: "object"
				},
				visible: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				_field: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				_settingsButton: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				_dynamicField: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				afterInit: {}
			}
		},
		renderer: function (oRm, oControl) {
			var oField = oControl.getAggregation("_field"),
				oSettingsButton = oControl.getAggregation("_settingsButton"),
				oDynamicField = oControl._getDynamicField();
			oRm.openStart("div");
			oRm.addClass("sapUiIntegrationCardEditorItemField");
			if (oField && oField.getWidth && !oSettingsButton) {
				//oRm.addStyle("width", oField.getWidth());
			}
			if (!oControl.getVisible()) {
				oRm.addStyle("display", "none");
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeElementData(oControl);
			oRm.openEnd();
			if (oControl.getVisible()) {
				oRm.openStart("span");
				oRm.writeClasses();
				oRm.openEnd();
				oRm.openStart("span");
				oRm.addClass("sapUiIntegrationCardEditorEditor");
				if (oControl._hasDynamicValue()) {
					oRm.addStyle("width", "1px");
					oRm.addStyle("opacity", "0");
				}
				oRm.writeStyles();
				oRm.writeClasses();
				oRm.openEnd();
				oRm.renderControl(oField);
				oRm.close("span");
				oRm.close("span");
				if (oSettingsButton || oControl._hasDynamicValue()) {
					oRm.openStart("span");
					oRm.addClass("sapUiIntegrationCardEditorSettings");
					oRm.writeClasses();
					oRm.openEnd();
					oRm.openStart("span");
					oRm.addClass("sapUiIntegrationCardEditorSettingsField");
					if (oControl._hasDynamicValue()) {
						oRm.addStyle("width", "calc(100% - 2.5rem)");
						oRm.addStyle("opacity", "1");
					}
					oRm.writeClasses();
					oRm.writeStyles();
					oRm.openEnd();
					oRm.renderControl(oDynamicField);
					oRm.close("span");

					oRm.openStart("span");
					oRm.addClass("sapUiIntegrationCardEditorSettingsButton");
					oRm.writeClasses();
					oRm.openEnd();
					oRm.renderControl(oSettingsButton);
					oRm.close("span");
					oRm.close("span");
				}
			}
			oRm.close("div");

		}
	});

	BaseField.prototype.init = function () {
		this._readyPromise = new Promise(function (resolve) {
			this._fieldResolver = resolve;
		}.bind(this));
	};

	BaseField.prototype.setConfiguration = function (oConfig, bSuppress) {
		if (oConfig !== this.getConfiguration()) {
			this.setProperty("configuration", oConfig, bSuppress);
			if (oConfig) {
				//async to ensure all settings that are applied sync are processed.
				Promise.resolve().then(function () {
					this.initEditor(oConfig);
				}.bind(this));
			}
		}
		return this;
	};

	BaseField.prototype.initEditor = function (oConfig) {
		var oControl;
		this.initVisualization && this.initVisualization(oConfig);
		if (this._visualization.editor) {
			oControl = this._visualization.editor;
		} else if (this._visualization.type) {
			oControl = new this._visualization.type(this._visualization.settings || {});
		}
		if (oControl instanceof Control) {
			this.setAggregation("_field", oControl);
		}
		//default is true, Card editor needs set to false for translation and page admin mode if needed
		var sMode = this.getMode();
		oConfig.allowSettings = oConfig.allowSettings || oConfig.allowSettings !== false && sMode === "admin";
		oConfig.allowDynamicValues = oConfig.allowDynamicValues || oConfig.allowDynamicValues !== false;
		oConfig._changeDynamicValues = oConfig.visible && oConfig.editable && (oConfig.allowDynamicValues || oConfig.allowSettings) && sMode !== "translation";
		if (oConfig._changeDynamicValues) {
			this._addSettingsButton();
		}
		this._applySettings(oConfig);
	};

	/**
	 * Abstract, implemented by sub classes
	 */
	BaseField.prototype.initVisualization = function () {
	};

	/**
	 * Check if the value is a dynamic value
	 */
	BaseField.prototype._hasDynamicValue = function () {
		var vValue = this._getCurrentProperty("value");
		var bDynamicValue = typeof vValue === "string" && (vValue.indexOf("{context>") === 0 || vValue.indexOf("{{parameters") === 0);
		this._setCurrentProperty("_hasDynamicValue", bDynamicValue);
		return bDynamicValue;
	};

	/**
	 * Check if the _next setting is present and the inner values differ from the default values
	 */
	BaseField.prototype._hasSettings = function () {
		var oConfig = this.getConfiguration();
		if (oConfig._next) {
			oConfig._hasSettings = (
				oConfig._next.editable === false ||
				oConfig._next.visible === false ||
				oConfig._next.allowDynamicValues === false
			);
		} else {
			oConfig._hasSettings = false;
		}
		return oConfig._hasSettings;
	};

	BaseField.prototype._getDynamicField = function () {
		var oField = this.getAggregation("_dynamicField");
		if (!oField) {
			var oField = new MultiInput({
				showValueHelp: false
			});
			this.setAggregation("_dynamicField", oField);
		}
		return oField;
	};

	BaseField.prototype._hideDynamicField = function () {
		var oDynamicField = this._getDynamicField(),
			oField = this.getAggregation("_field");
		if (oDynamicField.getDomRef()) {
			var oStyle = oDynamicField.getDomRef().parentNode.style;
			oStyle.width = "1px";
			oStyle.opacity = 0;
			oStyle = oField.getDomRef().parentNode.style;
			oStyle.width = "calc(100% - 2.5rem)";
			oStyle.opacity = 1;
		}
	};

	BaseField.prototype._showDynamicField = function () {
		var oDynamicField = this._getDynamicField(),
			oField = this.getAggregation("_field");
		if (oDynamicField.getDomRef()) {
			var oStyle = oDynamicField.getDomRef().parentNode.style;
			oStyle.width = "calc(100% - 2.5rem)";
			oStyle.opacity = 1;
			oStyle = oField.getDomRef().parentNode.style;
			oStyle.width = "1px";
			oStyle.opacity = 0;
		}
	};

	BaseField.prototype._getSettingsPanel = function () {
		if (!this._oSettingsPanel) {
			this._oSettingsPanel = new Settings();
		}
		return this._oSettingsPanel;
	};

	BaseField.prototype._openSettingsDialog = function (iDelay) {
		var oSettingsPanel = this._getSettingsPanel();
		window.setTimeout(function () {
			oSettingsPanel.setConfiguration(this.getConfiguration());
			oSettingsPanel.open(
				this.getAggregation("_settingsButton"),
				this.getAggregation("_settingsButton"),
				this.getParent().getAggregation("_preview"),
				this.getHost(),
				this,
				this._applySettings.bind(this),
				this._cancelSettings.bind(this));
		}.bind(this), iDelay || 600);
	};


	/**
	 * Add the settings button
	 */
	BaseField.prototype._addSettingsButton = function () {
		this._getDynamicField(); //create the dynamic field
		this.setAggregation("_settingsButton", new Button({
			icon: "{= ${currentSettings>_hasDynamicValue} ? 'sap-icon://display-more' : 'sap-icon://enter-more'}",
			type: "Transparent",
			tooltip: oResourceBundle.getText("CARDEDITOR_FIELD_MORE_SETTINGS"),
			press: function () {
				this._openSettingsDialog(200);
			}.bind(this)
		}));
	};

	BaseField.prototype._setCurrentProperty = function (sProperty, vValue) {
		this.getModel("currentSettings").setProperty(sProperty, vValue, this.getBindingContext("currentSettings"));
	};

	BaseField.prototype._getCurrentProperty = function (sProperty) {
		return this.getModel("currentSettings").getProperty(sProperty, this.getBindingContext("currentSettings"));
	};

	BaseField.prototype._applySettings = function (oData) {
		var oDynamicField = this._getDynamicField(),
			o = this.getModel("contextflat")._getValueObject(oData.value);
		oDynamicField.removeAllTokens();
		if (!this._getCurrentProperty("_changeDynamicValues")) {
			oDynamicField.setEnabled(false);
		}
		if (o && o.path !== "empty") {
			if (o.object.value && o.object.value.indexOf("{{") == 0) {
				this._setCurrentProperty("value", o.object.value);
			} else {
				this._setCurrentProperty("value", o.value);
			}
			this._showDynamicField();
			oDynamicField.addToken(new Token({
				text: o.object.label,
				"delete": function () {
					this._setCurrentProperty("value", "");
					if (!this._hasDynamicValue()) {
						this._hideDynamicField();
					}
					this._applyButtonStyles();
					window.setTimeout(function () {
						//this closes a popup that might be still open.
						this.getAggregation("_field").focus();
					}.bind(this), 100);
				}.bind(this)
			}));
		} else {
			this._setCurrentProperty("value", oData.value);
			this._hideDynamicField();
		}
		//apply settings
		this._setCurrentProperty("_next", oData._next);
		this._applyButtonStyles();
		if (!this._hasDynamicValue()) {
			this._hideDynamicField();
		}
		this._fieldResolver && this._fieldResolver();
		this._fieldResolver = null;
	};

	BaseField.prototype._cancelSettings = function () {
		this._applyButtonStyles();
		if (!this._hasDynamicValue()) {
			this._hideDynamicField();
		}
	};

	BaseField.prototype._applyButtonStyles = function () {
		if (!this._hasDynamicValue()) {
			this.removeStyleClass("dynamicvalue");
		} else {
			this.addStyleClass("dynamicvalue");
		}
		if (!this._hasSettings()) {
			this.removeStyleClass("settings");
		} else {
			this.addStyleClass("settings");
		}
	};

	return BaseField;
});
