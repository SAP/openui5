/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/MultiInput",
	"sap/m/Token",
	"sap/ui/core/Element",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/core/ListItem",
	"sap/base/util/ObjectPath",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"sap/ui/core/Fragment",
	"sap/ui/integration/util/Validators",
	"sap/ui/model/json/JSONModel",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/VBox",
	"sap/ui/core/CustomData",
	"sap/ui/model/Sorter"
], function (
	Control,
	Text,
	Input,
	MultiInput,
	Token,
	Element,
	BindingHelper,
	ListItem,
	ObjectPath,
	deepEqual,
	deepClone,
	Fragment,
	Validators,
	JSONModel,
	List,
	CustomListItem,
	VBox,
	CustomData,
	Sorter
) {
	"use strict";

	var sBuildInViz = "sap/ui/integration/editor/fields/viz";

	/**
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.editor.fields.BaseField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 * @experimental since 1.83.0
	 */
	var BaseField = Control.extend("sap.ui.integration.editor.fields.BaseField", {
		metadata: {
			library: "sap.ui.integration",
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
				},
				parameterKey: {
					type: "string"
				},
				allowPopover: {
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
				_dynamicField: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				_messageIcon: {
					type: "sap.ui.core.Icon",
					multiple: false,
					visibility: "hidden"
				},
				_messageStrip: {
					type: "sap.m.MessageStrip",
					multiple: false,
					visibility: "hidden"
				},
				_editor: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				afterInit: {},
				/**
				 * Fired when validation failed.
				 * @experimental since 1.105
				 * Disclaimer: this event is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				validateFailed: {}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				var oField = oControl.getAggregation("_field"),
					oDynamicField = oControl._getDynamicField();
				oRm.openStart("div", oControl);
				oRm.class("sapUiIntegrationEditorItemField");
				if (oField && oField.getWidth) {
					//oRm.style("width", oField.getWidth());
				}
				if (!oControl.getVisible()) {
					oRm.style("display", "none");
				}
				oRm.openEnd();
				if (oControl.getVisible()) {
					oRm.openStart("span");
					oRm.class("sapUiIntegrationEditorEditor");
					if (oControl._hasDynamicValue()) {
						oRm.style("width", "1px");
						oRm.style("opacity", "0");
					} else {
						oRm.style("width", "100%");
					}
					oRm.openEnd();
					oRm.renderControl(oField);
					oRm.close("span");
					if (oControl._hasDynamicValue()) {
						oRm.openStart("span");
						oRm.class("sapUiIntegrationEditorSettings");
						oRm.openEnd();
						oRm.openStart("span");
						oRm.class("sapUiIntegrationEditorSettingsField");
						oRm.style("width", "100%");
						oRm.style("opacity", "1");
						oRm.openEnd();
						oRm.renderControl(oDynamicField);
						oRm.close("span");
						oRm.close("span");
					}
					oRm.openStart("div", oControl.getId() + "-ms");
					oRm.style("height", "0");
					oRm.openEnd();
					oRm.close("div");
				}
				oRm.close("div");

			}
		}
	});

	BaseField.prototype.init = function () {
		this._readyPromise = new Promise(function (resolve) {
			this._fieldResolver = resolve;
		}.bind(this));
	};

	BaseField.prototype.getMessagestrip = function () {
		var sMessageStripId = this.getAssociation("_messageStrip");
		return Element.getElementById(sMessageStripId);
	};

	BaseField.prototype.getMessageIcon = function () {
		var sMessageIconId = this.getAssociation("_messageIcon");
		return Element.getElementById(sMessageIconId);
	};

	BaseField.prototype._removeValidationMessage = function () {
		var oField = this.control,
		    oMessageIcon = oField.getParent().getMessageIcon();
		if (oMessageIcon) {
			oMessageIcon.setVisible(false);
		}
		if (oField.getEnabled()) {
			oField.setEnabled(false);
		}
	};

	BaseField.prototype.getResourceBundle = function() {
		return this.getModel("i18n").getResourceBundle();
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
				}.bind(this));

			}
		}
		return this;
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

	// delete the translation text
	BaseField.prototype.deleteTranslationValuesInTexts = function (sLanguage) {
		var that = this;
		var oConfig = that.getConfiguration();
		var sTranslationPath = "/texts";
		var oData = this._settingsModel.getData();
		if (!oData || !oData.texts) {
			return;
		}
		var oTexts = deepClone(oData.texts, 500);
		if (sLanguage) {
			if (oTexts[sLanguage]) {
				delete oTexts[sLanguage][oConfig.manifestpath];
				if (deepEqual(oTexts[sLanguage], {})) {
					delete oTexts[sLanguage];
				}
				if (deepEqual(oTexts, {})) {
					delete oData.texts;
					this._settingsModel.setData(oData);
				} else {
					this._settingsModel.setProperty(sTranslationPath, oTexts);
				}
			}
		} else {
			for (var n in oTexts) {
				that.deleteTranslationValuesInTexts(n);
			}
		}
	};

	BaseField.prototype._triggerValidation = function (value) {
		if (deepEqual(value, this._preChangedValue) && this._messageFrom === "validation") {
			return;
		}
		this._preChangedValue = value;
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
		} else if (oConfig.type === "boolean") {
			doValidation = true;
		} else if (oConfig.type === "string[]" && Array.isArray(value)) {
			doValidation = true;
		}
		if (oConfig.validations && Array.isArray(oConfig.validations) && doValidation) {
			for (var i = 0; i < oConfig.validations.length; i++) {
				var oValidate = this._handleValidation(oConfig.validations[i], value);
				if (typeof oValidate === "boolean" && !oValidate) {
					this.fireValidateFailed();
					oConfig.validateCheck = "failed";
					return false;
				} else if (typeof oValidate.then === "function") {
					oValidate.then(function(bResult) {
						if (!bResult) {
							this.fireValidateFailed();
							oConfig.validateCheck = "failed";
							return false;
						}
					}.bind(this));
				}
			}
			this._hideValueState();
		}
		return true;
	};

	BaseField.prototype._requestData = function (oRequest) {
		var oField = this.control.getParent();
		var oConfig = oField.getConfiguration();
		var oDataProvider = oField._oDataProviderFactory.create(oRequest.data);
		oField.getModel("currentSettings").setProperty(oConfig._settingspath + "/_loading", true);
		var oPromise = oDataProvider.getData();
		return oPromise.then(function (oData) {
			oField.getModel("currentSettings").setProperty(oConfig._settingspath + "/_loading", false);
			var sPath = oRequest.data.path || "/";
			if (sPath.startsWith("/")) {
				sPath = sPath.substring(1);
			}
			if (sPath.endsWith("/")) {
				sPath = sPath.substring(0, sPath.length - 1);
			}
			var aPath = sPath.split("/");
			var oResult = ObjectPath.get(aPath, oData);
			return oResult;
		});
	};

	BaseField.prototype._handleValidation = function (oSettings, oValue) {
		var oConfig = this.getConfiguration(),
			oValidations = Validators[oConfig.type];
		var fnFailed = function(n, oData) {
			var sError;
			if (typeof oSettings.message === "function") {
				sError = oSettings.message(oValue, oConfig, oData);
			} else {
				sError = oSettings.message;
			}
			if (!sError) {
				if (oSettings._txt) {
					sError = this.getResourceBundle().getText(oValidations[oSettings._txt], [oSettings[n]]);
				} else {
					sError = this.getResourceBundle().getText(oValidations[n + "Txt"], [oSettings[n]]);
				}
			}
			this._showValueState(oSettings.type || "error", sError);
		}.bind(this);
		if (oSettings["validate"]) {
			var oContext = {
				control: this.getAggregation("_field"),
				requestData: this._requestData,
				removeValidationMessage: this._removeValidationMessage
			};
			var fnValidate = oSettings["validate"];
			return Promise.resolve(fnValidate(oValue, oConfig, oContext)).then(function(result) {
				var bIsValid = result.isValid;
				if (typeof bIsValid === "undefined") {
					bIsValid = result;
				}
				var oData = result.data ? result.data : undefined;
				if (!bIsValid) {
					fnFailed("validate", oData);
					return false;
				} else {
					this._hideValueState(true, false);
					return true;
				}
			}.bind(this));
		} else {
			for (var n in oSettings) {
				if (oValidations) {
					var fn = oValidations[n];
					oSettings._txt = "";
					if (fn) {
						if (!fn(oValue, oSettings[n], oSettings)) {
							fnFailed(n);
							return false;
						}
					}
				}
			}
		}
		return true;
	};

	BaseField.prototype.onAfterRendering = function () {
		this._applyMessage();
		var oMessageStrip = this.getMessagestrip();
		if (oMessageStrip && oMessageStrip.getDomRef()) {
			oMessageStrip.getDomRef().style.opacity = "0";
		}
	};

	BaseField.prototype._applyMessage = function () {
		var oIcon = Element.getElementById(this.getAssociation("_messageIcon"));
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
		// add hasError property for error handling of panel
		if (this._message && (this._message.type === "error" || this._message.type === "warning")) {
			var sErrorType = this._message.type === "error" ? "Error" : "Warning";
			this._setCurrentProperty("hasError", true);
			this._setCurrentProperty("errorType", sErrorType);
		} else {
			this._setCurrentProperty("hasError", false);
			this._setCurrentProperty("errorType", "None");
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
		this._messageFrom = "validation";
		if (bFromDataRequest) {
			this._messageFrom = "request";
		}
		var oMessageStrip = this.getMessagestrip();
		if (oField && oField.setValueState) {
			this._message.atControl = true;
			if (oField.setShowValueStateMessage) {
				oField.setShowValueStateMessage(false);
			}
			oField.setValueState(sEnumType);
			oField.setValueStateText(sMessage);
		} else if (oMessageStrip && oMessageStrip.getVisible() && oField.getMetadata().getName() !== "sap.m.Switch") {
			this._showMessage();
		}
		this._applyMessage();
	};

	BaseField.prototype._hideValueState = function (bFromDataRequest, bTriggerValidationAgain) {
		if (!this.getParent()) {
			return;
		}
		var oMessageStrip = this.getMessagestrip();
		if (this._message) {
			if ((bFromDataRequest && this._messageFrom === "request")
				|| (!bFromDataRequest && this._messageFrom === "validation")) {
				var oField = this.getAggregation("_field");
				this._message = {
					"enum": "Success",
					"type": "success",
					"message": "Corrected",
					"atControl": this._message.atControl
				};
				this._messageFrom = "validation";
				if (bFromDataRequest) {
					this._messageFrom = "request";
				}
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
				if (oMessageStrip) {
					if (oMessageStrip.getDomRef()) {
						oMessageStrip.getDomRef().style.opacity = "0";
					}
					oMessageStrip.onAfterRendering = null;
				}
				if (oField.setValueState) {
					oField.setValueState("Success");
				}
				if (oField.setValueStateText) {
					oField.setValueStateText("");
				}
				this._message = null;
			}
			if (!this._message && bFromDataRequest && bTriggerValidationAgain) {
				//check validations
				this._triggerValidation(this.getConfiguration().value);
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
		var oMessageStrip = this.getMessagestrip();
		if (this._message && oMessageStrip) {
			oMessageStrip.applySettings({
				type: this._message.enum,
				text: this._message.message
			});

			var that = this;
			oMessageStrip.onAfterRendering = function () {
				oMessageStrip.getDomRef().style.zIndex = "1";
				oMessageStrip.getDomRef().style.opacity = "1";
				that.getDomRef("ms") && that.getDomRef("ms").appendChild(oMessageStrip.getDomRef());
				var oField = that.getAggregation("_field");
				if (that._message && !that._message.atControl) {
					oMessageStrip.getDomRef().style.marginTop = "0";
					oMessageStrip.getDomRef().style.marginLeft = "0";
				}
				var width = oField.getDomRef() ? oField.getDomRef().offsetWidth - 5 : 100;
				if (width <= 100) {
					width = oField.getParent().getDomRef() ? oField.getParent().getDomRef().offsetWidth - 35 : 100;
				}
				oMessageStrip.getDomRef().style.width = width + "px";
			};
			oMessageStrip.invalidate();
		}
	};

	BaseField.prototype._hideMessage = function () {
		var oMessageStrip = this.getMessagestrip();
		var oField = this.getAggregation("_field"),
			bFocusInField = oField.getDomRef() && oField.getDomRef().contains(window.document.activeElement);
		if (oMessageStrip) {
			if (!bFocusInField && oMessageStrip.getDomRef()) {
				oMessageStrip.getDomRef().style.opacity = "0";
				oMessageStrip.getDomRef().style.zIndex = "-1";
			}
			oMessageStrip.onAfterRendering = null;
		}
	};

	BaseField.prototype.getParameterId = function () {
		return this.getAssociation("_editor") + "_" + this.getParameterKey();
	};

	BaseField.prototype.initEditor = function (oConfig) {
		var oControl;
		this._settingsModel = this.getModel("currentSettings");
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
			oControl = new this._visualization.type(this.getParameterId() + "_control", this._visualization.settings || {});
		} else if (this._visualization.fragment) {
			if (typeof this._visualization.fragment === "string") {
				if (!this._visualization.controller) {
					this._visualization.controller = this._visualization.fragment + ".controller";
				}
				if (typeof this._visualization.controller === "string") {
					sap.ui.require([this._visualization.controller], function (f) {
						this._visualization.controller = new f();
						this._visualization.controller.init();
						this._visualization.controller.setField(this);
						this.initEditor(oConfig);
					}.bind(this));
				} else if (typeof this._visualization.controller === "object") {
					Fragment.load({
						name: this._visualization.fragment,
						controller: this._visualization.controller
					}).then(function (oFragment) {
						this._visualization.fragment = oFragment;
						this.initEditor(oConfig);
					}.bind(this));
				} else {
					Fragment.load({
						name: this._visualization.fragment
					}).then(function (oFragment) {
						this._visualization.fragment = oFragment;
						this.initEditor(oConfig);
					}.bind(this));
				}
				return;
			}
			oControl = this._visualization.fragment;
		}
		if (oControl instanceof Control) {
			this.setAggregation("_field", oControl);
			if (oControl.attachChange) {
				oControl.attachChange(function (oEvent) {
					if (oEvent.mParameters.value === "") {
						// for list field, if change value === "", should validate the whole value list
						var oConfig = this.getConfiguration();
						if (oConfig.type === "string[]") {
							this._triggerValidation(oConfig.value);
						} else {
							this._triggerValidation(oEvent.getParameter("value"));
						}
					}
				}.bind(this));
			}
			/*if (oControl.attachChange) {
				oControl.attachChange(function (oEvent) {
					var value;
					if (oConfig.type === "string[]") {
						value = oConfig.value || [];
						var sText = oEvent.getParameter("value");
						var oSelectedItem = oEvent.getSource().getItemByText(sText);
						if (oSelectedItem) {
							value = value.concat([oSelectedItem.getKey()]);
						}
					} else if (oEvent.getParameters()) {
						if (oEvent.getParameters().hasOwnProperty("value")) {
							value = oEvent.getParameter("value");
						} else if (oEvent.getParameters().hasOwnProperty("state")) {
							value = oEvent.getParameter("state");
						}
					}
					this._triggerValidation(value);
				}.bind(this));
			}*/
			var oBinding = this._settingsModel.bindProperty("value", this.getBindingContext("currentSettings"));
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
			this._getDynamicField();
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
			var bVisibleDefault = oConfig.hasOwnProperty("visibleToUser") ? oConfig.visibleToUser : true;
			var bEditableDefault = oConfig.hasOwnProperty("editableToUser") ? oConfig.editableToUser : true;
			var bEditable = oConfig._next.visible === false ? false : oConfig._next.editable;
			var bAllowDynamicValuesDefault = oConfig.hasOwnProperty("allowDynamicValues") ? oConfig.allowDynamicValues : true;
			oConfig._hasSettings = (
				oConfig._next.visible === !bVisibleDefault ||
				bEditable === !bEditableDefault ||
				oConfig._next.allowDynamicValues === !bAllowDynamicValuesDefault ||
				typeof oConfig._next.pageAdminNewDestinationParameter !== "undefined"
			);
		} else {
			oConfig._hasSettings = false;
			if (oConfig.hasOwnProperty("editableToUser") || oConfig.hasOwnProperty("visibleToUser")) {
				oConfig._next = {};
			}
			if (oConfig.hasOwnProperty("editableToUser")) {
				oConfig._next.editable = oConfig.editableToUser;
			}
			if (oConfig.hasOwnProperty("visibleToUser")) {
				oConfig._next.visible = oConfig.visibleToUser;
			}
		}
		return oConfig._hasSettings;
	};

	BaseField.prototype._getDynamicField = function () {
		var oField = this.getAggregation("_dynamicField");
		if (!oField) {
			var oField = new MultiInput(this.getParameterId() + "_dynamic_control", {
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
			oStyle.width = "100%";
			oStyle.opacity = 1;
		}
	};

	BaseField.prototype._showDynamicField = function () {
		var oDynamicField = this._getDynamicField(),
			oField = this.getAggregation("_field");
		if (oDynamicField.getDomRef()) {
			var oStyle = oDynamicField.getDomRef().parentNode.style;
			oStyle.width = "100%";
			oStyle.opacity = 1;
			oStyle = oField.getDomRef().parentNode.style;
			oField.getDomRef().style.visibility = "hidden";
			oStyle.width = "1px";
			oStyle.opacity = 0;
		}
	};

	BaseField.prototype._setCurrentProperty = function (sProperty, vValue) {
		//avoid fire binding changes in the model
		if (this._getCurrentProperty(sProperty) !== vValue) {
			this._settingsModel.setProperty(sProperty, vValue, this.getBindingContext("currentSettings"));
		}
	};

	BaseField.prototype._getCurrentProperty = function (sProperty) {
		return this._settingsModel.getProperty(sProperty, this.getBindingContext("currentSettings"));
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
					// save "" value to overwrite the dynamic value
					var oInput = this.getAggregation("_field");
					oInput.setValue("");
					oInput.fireChange();
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
			// delete all the transalation texts since the translatable string value now is a dynamic value
			var oConfig = this.getConfiguration();
			if (oConfig.type === "string" && oConfig.translatable) {
				this.deleteTranslationValuesInTexts();
			}
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
		if (!this._settingsButton) {
			return;
		}
		if (!this._hasDynamicValue()) {
			this._settingsButton.removeStyleClass("dynamicvalue");
		} else {
			this._settingsButton.addStyleClass("dynamicvalue");
		}
		if (!this._hasSettings()) {
			this._settingsButton.removeStyleClass("settings");
		} else {
			this._settingsButton.addStyleClass("settings");
		}
	};

	//check if need to filter backend by input, used for ComoboBox in StringField and MultiComboBox in ListField
	BaseField.prototype.isFilterBackend = function () {
		var oConfig = this.getConfiguration();
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

	// add model name into binding
	// before:
	//   {
	//		"text": "{text}",
	//		"key": "{key}"
	//   }
	// after:
	//   {
	//		"text": "{model>text}",
	//		"key": "{model>key}"
	//   }
	BaseField.prototype.addModelPrefix = function (oConfig, sModelName) {
		for (var key in oConfig) {
			var sValue = oConfig[key];
			sValue = "{" + sModelName + ">" + sValue.substring(1);
			oConfig[key] = sValue;
		}
		return oConfig;
	};

	BaseField.prototype.getPopoverPlacement = function (oControl) {
		var sPlacement = "Right";
		var iX = oControl.getDomRef().getBoundingClientRect().x;
		var iWidth = document.body.offsetWidth;
		if ( 2 * iX > iWidth) {
			sPlacement = "Left";
		}
		return sPlacement;
	};

	BaseField.prototype.buildTranslationsList = function (sId) {
		return new List(sId + "", {
			items: {
				path: "languages>/translatedLanguages",
				key: "key",
				template: new CustomListItem({
					content: [
						new VBox({
							items: [
								new Text({
									text: "{languages>description}"
								}),
								new Input({
									value: "{languages>value}",
									editable: "{languages>editable}",
									valueState: "{= ${languages>updated} === true ? 'Information' : 'None' }",
									showValueStateMessage: false
								})
							]
						})
					],
					customData: [
						new CustomData({
							key: "{languages>key}",
							value: "{languages>description}"
						})
					]
				}),
				sorter: [new Sorter({
					path: 'updated',
					descending: true
				})]
			}
		});
	};

	BaseField.prototype.buildTranslationsModel = function (oTranslatedValues) {
		var oTranslatonsModel = new JSONModel(oTranslatedValues);
		oTranslatonsModel.attachPropertyChange(function(oEvent) {
			var oContext = oEvent.getParameter("context");
			oTranslatonsModel.setProperty(oContext.getPath("updated"), true);
			oTranslatonsModel.setProperty("/isUpdated", true);
		});
		return oTranslatonsModel;
	};

	return BaseField;
});
