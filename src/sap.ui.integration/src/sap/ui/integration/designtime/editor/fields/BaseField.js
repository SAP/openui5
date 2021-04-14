/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Button",
	"sap/m/FormattedText",
	"sap/m/MultiInput",
	"./Settings",
	"sap/m/Token",
	"sap/ui/core/Core",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/core/ListItem"
], function (
	Control,
	Button,
	FormattedText,
	MultiInput,
	Settings,
	Token,
	Core,
	BindingHelper,
	ListItem
) {
	"use strict";

	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration"),
		sBuildInViz = "sap/ui/integration/designtime/editor/fields/viz";

	/**
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.editor.fields.BaseField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 * @experimental since 1.83.0
	 */
	var BaseField = Control.extend("sap.ui.integration.designtime.editor.fields.BaseField", {
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
				},
				_hint: {
					type: "sap.m.FormattedText",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				_messageIcon: {
					type: "sap.ui.core.Icon",
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
				oRm.openStart("div");
				oRm.writeAttribute("id", oControl.getId() + "-ms");
				oRm.addStyle("height", "0");
				oRm.writeStyles();
				oRm.openEnd();
				oRm.close("div");

				//render hint
				if (oControl.getMode() !== "translation") {
					var oHint = oControl.getAggregation("_hint");
					if (oHint) {
						oRm.openStart("div");
						oRm.addClass("sapUiIntegrationCardEditorHint");
						oRm.writeClasses();
						oRm.openEnd();
						oRm.renderControl(oHint);
						oRm.close("div");
					}
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
			//sanitize configuration
			this._sanitizeValidationSettings(oConfig);
			this.setProperty("configuration", oConfig, bSuppress);
			if (oConfig) {
				//async to ensure all settings that are applied sync are processed.
				Promise.resolve().then(function () {
					this.initEditor(oConfig);
					if (oConfig.hint && oConfig.type !== "boolean") {
						this._addHint(oConfig.hint);
					} else if (oConfig.hint && oConfig.type === "boolean" && oConfig.cols && oConfig.cols === 1) {
						this._addHint(oConfig.hint);
					}
				}.bind(this));

			}
		}
		return this;
	};

	BaseField.prototype._addHint = function (sHint) {
		sHint = sHint.replace(/<a href/g, "<a target='blank' href");
		var oFormattedText = new FormattedText({
			htmlText: sHint
		});
		this.setAggregation("_hint", oFormattedText);
	};

	BaseField.prototype._sanitizeValidationSettings = function (oConfig) {
		oConfig.validations = oConfig.validations || [];
		if (oConfig.validation && oConfig.validations && Array.isArray(oConfig.validations)) {
			oConfig.validations.push(oConfig.validation);
			delete oConfig.validation;
		}
		if (oConfig.validation && !oConfig.validations) {
			oConfig.validations = [oConfig.validation];
			delete oConfig.validation;
		}
		if (oConfig.required) {
			oConfig.validations.unshift({
				"required": true,
				"type": "error"
			});
		}
	};

	BaseField.prototype._triggerValidation = function (value) {
		var oConfig = this.getConfiguration();
		//check if trigger validation
		var doValidation = false;
		if (oConfig.required) {
			doValidation = true;
		} else if (oConfig.type === "string" && value) {
			doValidation = true;
		} else if ((oConfig.type === "integer" || oConfig.type === "number") && !isNaN(value)) {
			//the value passed in is "" when empty the field
			if (value !== "") {
				doValidation = true;
			}
		}
		if (oConfig.validations && Array.isArray(oConfig.validations) && doValidation) {
			for (var i = 0; i < oConfig.validations.length; i++) {
				if (!this._handleValidation(oConfig.validations[i], value)) {
					return false;
				}
			}
		}
		this._hideValueState();
		return true;
	};
	/*
		default error messages
		#XMSG: Validation Error: Does not match pattern
		CARDEDITOR_VAL_NOMATCH=Value does not match the validation criteria

		#XMSG: Validation Error: Max length exceeded
		CARDEDITOR_VAL_MAXLENGTH=Value exceeds the maximum length of {0}

		#XMSG: Validation Error: Min length
		CARDEDITOR_VAL_MINLENGTH=Value needs to be minimal {0} characters

		#XMSG: Validation Error: Number required
		CARDEDITOR_VAL_TEXTREQ=Field is required, please enter a text

		#XMSG: Validation Error: Number Maximum Inclusive
		CARDEDITOR_VAL_MAX_E=Value needs to be {0} or less

		#XMSG: Validation Error: Number Minimum Inclusive
		CARDEDITOR_VAL_MIN_E=Value needs to be {0} or greater

		#XMSG: Validation Error: Number Maximum Exclusive
		CARDEDITOR_VAL_MAX_E=Value needs to be less than {0}

		#XMSG: Validation Error: Number Minimum Exclusive
		CARDEDITOR_VAL_MIN_E=Value needs to be greater than {0}


		#XMSG: Validation Error: Number Multiple Of
		CARDEDITOR_VAL_MULTIPLE=Value needs to be a multiple of {0}

		#XMSG: Validation Error: Number required
		CARDEDITOR_VAL_NUMBERREQ=Field is required, please enter a number
	*/

	BaseField.validations = {
		string: {
			maxLength: function (v, max) {
				return v.length <= max;
			},
			maxLengthTxt: "CARDEDITOR_VAL_MAXLENGTH",
			minLength: function (v, min) {
				return v.length >= min;
			},
			minLengthTxt: "CARDEDITOR_VAL_MINLENGTH",
			pattern: function (v, pattern) {
				var p = new RegExp(pattern);
				return p.test(v);
			},
			patternTxt: "CARDEDITOR_VAL_NOMATCH",
			required: function (v, b) {
				return b && !!v;
			},
			requiredTxt: "CARDEDITOR_VAL_TEXTREQ",
			validateTxt: "CARDEDITOR_VAL_NOMATCH"
		},
		integer: {
			maximum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMaximum) {
					valSettings._txt = "maximumExclusiveTxt";
					return v < valValue;
				}
				return v <= valValue;
			},
			maximumTxt: "CARDEDITOR_VAL_MAX",
			maximumExclusiveTxt: "CARDEDITOR_VAL_MAX_E",
			minimum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMinimum) {
					valSettings._txt = "minimumExclusiveTxt";
					return v > valValue;
				}
				return v >= valValue;
			},
			minimumTxt: "CARDEDITOR_VAL_MIN",
			minimumExclusiveTxt: "CARDEDITOR_VAL_MIN_E",
			multipleOf: function (v, valValue) {
				return (v % valValue) === 0;
			},
			multipleOfTxt: "CARDEDITOR_VAL_MULTIPLE",
			required: function (v, b) {
				return !isNaN(v) && v !== "";
			},
			requiredTxt: "CARDEDITOR_VAL_NUMBERREQ",
			validateTxt: "CARDEDITOR_VAL_NOMATCH"
		},
		number: {
			maximum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMaximum) {
					valSettings._txt = "maximumExclusiveTxt";
					return v < valValue;
				}
				return v <= valValue;
			},
			maximumTxt: "CARDEDITOR_VAL_MAX",
			maximumExclusiveTxt: "CARDEDITOR_VAL_MAX_E",
			minimum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMinimum) {
					valSettings._txt = "minimumExclusiveTxt";
					return v > valValue;
				}
				return v >= valValue;
			},
			minimumTxt: "CARDEDITOR_VAL_MIN",
			minimumExclusiveTxt: "CARDEDITOR_VAL_MAX_E",
			multipleOf: function (v, valValue) {
				return (v % valValue) === 0;
			},
			multipleOfTxt: "CARDEDITOR_VAL_MULTIPLE",
			required: function (v, b) {
				return !isNaN(v) && v !== "";
			},
			requiredTxt: "CARDEDITOR_VAL_NUMBERREQ",
			validateTxt: "CARDEDITOR_VAL_NOMATCH"
		}
	};

	BaseField.prototype._handleValidation = function (oSettings, oValue) {
		var oConfig = this.getConfiguration(),
			oValidations = BaseField.validations[oConfig.type];
		for (var n in oSettings) {
			if (oValidations) {
				var fn = oValidations[n];
				oSettings._txt = "";
				if (fn) {
					if (!fn(oValue, oSettings[n], oSettings)) {
						var sError;
						if (typeof oSettings.message === "function") {
							sError = oSettings.message(oValue, oConfig);
						} else {
							sError = oSettings.message;
						}
						if (!sError) {
							if (oSettings._txt) {
								sError = oResourceBundle.getText(oValidations[oSettings._txt], [oSettings[n]]);
							} else {
								sError = oResourceBundle.getText(oValidations[n + "Txt"], [oSettings[n]]);
							}
						}
						this._showValueState(oSettings.type || "error", sError);
						return false;
					}
				}
			}
			if (n === "validate") {
				if (!oSettings[n](oValue, oConfig)) {
					var sError;
					if (typeof oSettings.message === "function") {
						sError = oSettings.message(oValue, oConfig);
					} else {
						sError = oSettings.message;
					}
					if (!sError) {
						if (oSettings._txt) {
							sError = oResourceBundle.getText(oValidations[oSettings._txt], [oSettings[n]]);
						} else {
							sError = oResourceBundle.getText(oValidations[n + "Txt"], [oSettings[n]]);
						}
					}
					this._showValueState(oSettings.type || "error", sError);
					return false;
				}
			}
		}
		return true;
	};

	BaseField.prototype.onAfterRendering = function () {
		this._applyMessage();
		var oMessageStrip = this.getParent().getAggregation("_messageStrip") || this.getParent().getParent().getAggregation("_messageStrip");
		if (oMessageStrip && oMessageStrip.getDomRef()) {
			oMessageStrip.getDomRef().style.opacity = "0";
		}
	};

	BaseField.prototype._applyMessage = function () {
		var oIcon = Core.byId(this.getAssociation("_messageIcon"));
		if (this.getAssociation("_messageIcon") && oIcon) {
			var oIconDomRef = oIcon.getDomRef();
			if (oIconDomRef) {
				oIconDomRef.classList.remove("error");
				oIconDomRef.classList.remove("warning");
				oIconDomRef.classList.remove("success");
				if (this._message) {
					oIconDomRef.classList.add(this._message.type);
				}
			}
		}
	};

	BaseField.prototype._showValueState = function (sType, sMessage, bFromDataRequest) {
		var oField = this.getAggregation("_field"),
			sEnumType = sType.substring(0, 1).toUpperCase() + sType.substring(1);
		this._message = {
			"enum": sEnumType,
			"type": sType,
			"message": sMessage,
			"atControl": false
		};
		var oMessageStrip = this.getParent().getAggregation("_messageStrip") || this.getParent().getParent().getAggregation("_messageStrip");
		if (oField.setValueState) {
			this._message.atControl = true;
			if (bFromDataRequest) {
				this._message.fromDataRequest = bFromDataRequest;
			}
			if (oField.setShowValueStateMessage) {
				oField.setShowValueStateMessage(false);
			}
			oField.setValueState(sEnumType);
			oField.setValueStateText(sMessage);
		} else if (oMessageStrip && oMessageStrip.getVisible()) {
			this._showMessage();
		}
		this._applyMessage();
	};

	BaseField.prototype._hideValueState = function (bFromDataRequest) {
		if (!this.getParent()) {
			return;
		}
		var oMessageStrip = this.getParent().getAggregation("_messageStrip") || this.getParent().getParent().getAggregation("_messageStrip");
		if (this._message) {
			if ((bFromDataRequest && this._message.fromDataRequest)
				|| (!bFromDataRequest && !this._message.fromDataRequest)) {
				var oField = this.getAggregation("_field");
				this._message = {
					"enum": "Success",
					"type": "success",
					"message": "Corrected",
					"atControl": this._message.atControl
				};
				if (this._messageto) {
					clearTimeout(this._messageto);
				}
				this._messageto = setTimeout(function () {
					this._messageto = null;
					this._applyMessage();
					if (!this._message && oField.setValueState) {
						oField.setValueState("None");
					}
				}.bind(this), 1500);
				this._applyMessage();
				if (oMessageStrip.getDomRef()) {
					oMessageStrip.getDomRef().style.opacity = "0";
				}
				if (oField.setValueState) {
					oField.setValueState("Success");
				}
				oMessageStrip.onAfterRendering = null;
				this._message = null;
				if (bFromDataRequest) {
					//check validations
					this._triggerValidation(this.getConfiguration().value);
				}
			}
		}
	};
	BaseField.prototype.onfocusin = function (oEvent) {
		if (oEvent && oEvent.target.classList.contains("sapMBtn")) {
			return;
		}
		this._showMessage();
	};
	BaseField.prototype.onfocusout = function (oEvent) {
		this._hideMessage();
	};

	BaseField.prototype._showMessage = function () {
		if (!this.getParent()) {
			return;
		}
		var oMessageStrip = this.getParent().getAggregation("_messageStrip") || this.getParent().getParent().getAggregation("_messageStrip");
		if (this._message) {
			oMessageStrip.applySettings({
				type: this._message.enum,
				text: this._message.message
			});

			var that = this;
			oMessageStrip.onAfterRendering = function () {
				oMessageStrip.getDomRef().style.opacity = "1";
				that.getDomRef("ms").appendChild(oMessageStrip.getDomRef());
				var oField = that.getAggregation("_field");
				if (that._message && !that._message.atControl) {
					oMessageStrip.getDomRef().style.marginTop = "0";
					oMessageStrip.getDomRef().style.marginLeft = "0";
				}
				oMessageStrip.getDomRef().style.width = (oField.getDomRef().offsetWidth - 2) + "px";
			};
			oMessageStrip.rerender();
		}
	};

	BaseField.prototype._hideMessage = function () {
		var oMessageStrip = this.getParent().getAggregation("_messageStrip") || this.getParent().getParent().getAggregation("_messageStrip");

		var oField = this.getAggregation("_field"),
			bFocusInField = oField.getDomRef().contains(window.document.activeElement);
		if (oMessageStrip) {
			if (!bFocusInField && oMessageStrip.getDomRef()) {
				oMessageStrip.getDomRef().style.opacity = "0";
			}
			oMessageStrip.onAfterRendering = null;
		}
	};

	BaseField.prototype.initEditor = function (oConfig) {
		var oControl;
		this.initVisualization && this.initVisualization(oConfig);
		if (this._visualization.editor) {
			oControl = this._visualization.editor;
		} else if (this._visualization.type) {
			if (typeof this._visualization.type === "string") {
				if (this._visualization.type.indexOf("/") === -1) {
					this._visualization.type = sBuildInViz + "/" + this._visualization.type;
					this._visualization.settings = this._visualization.settings || {
						value: "{currentSettings>value}",
						editable: oConfig.editable
					};
				}
				sap.ui.require([this._visualization.type], function (f) {
					this._visualization.type = f;
					this.initEditor(oConfig);
				}.bind(this));
				return;
			}
			oControl = new this._visualization.type(this._visualization.settings || {});
		}
		if (oControl instanceof Control) {
			this.setAggregation("_field", oControl);
			if (oControl.attachChange) {
				oControl.attachChange(function (oEvent) {
					this._triggerValidation(oEvent.getParameter("value"));
				}.bind(this));
			}
			var oBinding = this.getModel("currentSettings").bindProperty("value", this.getBindingContext("currentSettings"));
			oBinding.attachChange(function () {
				this._triggerValidation(oConfig.value);
			}.bind(this));
			this._triggerValidation(oConfig.value);
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
		this.fireAfterInit();
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
			oField.getDomRef().style.visibility = "visible";
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
			oField.getDomRef().style.visibility = "hidden";
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
			var oPreview = this.getParent().getParent().getAggregation("_preview")
				|| this.getParent().getParent().getParent().getAggregation("_preview")
				|| this.getParent().getParent().getParent().getParent().getAggregation("_preview");
			oSettingsPanel.open(
				this.getAggregation("_settingsButton"),
				this.getAggregation("_settingsButton"),
				oPreview,
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
		//avoid fire binding changes in the model
		if (this._getCurrentProperty(sProperty) !== vValue) {
			this.getModel("currentSettings").setProperty(sProperty, vValue, this.getBindingContext("currentSettings"));
		}
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
			this._setCurrentProperty("_changed", oData._changed);
			this._hideDynamicField();
		}
		//apply settings
		this._setCurrentProperty("_next", oData._next);
		this._applyButtonStyles();
		if (!this._hasDynamicValue()) {
			this._hideDynamicField();
		} else {
			this._showDynamicField();
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

	//check if need to filter backend by input, used for ComoboBox in StringField and MultiComboBox in ListField
	BaseField.prototype.isFilterBackend = function (oConfig) {
		var bIsFilterBackend = false;
		if (oConfig && oConfig.values && oConfig.values.data) {
			if (oConfig.values.data.request && oConfig.values.data.request.parameters && oConfig.values.data.request.parameters.$filter && oConfig.values.data.request.parameters.$filter.indexOf("{currentSettings>suggestValue}") > -1) {
				//if contains a '$filter' parameter with key word '{currentSettings>suggestValue}' in the values.data.request.parameters
				bIsFilterBackend = true;
			} else if (oConfig.values.data.request && oConfig.values.data.request.url && oConfig.values.data.request.url.indexOf("{currentSettings>suggestValue}") > -1) {
				//if contains a '$filter' parameter with key word '{currentSettings>suggestValue}' in the values.data.request.url
				bIsFilterBackend = true;
			}
		}
		return  bIsFilterBackend;
	};

	BaseField.prototype.formatListItem = function (vItems) {
		var oItem = new ListItem();
		for (var key in vItems) {
			oItem.bindProperty(key, BindingHelper.createBindingInfos(vItems[key]));
		}
		return oItem;
	};

	return BaseField;
});
