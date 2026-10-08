/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepClone",
	"sap/base/util/merge",
	"sap/m/Button",
	"sap/m/FormattedText",
	"sap/m/Label",
	"sap/m/ResponsivePopover",
	"sap/m/Text",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/Utils",
	"./Constants",
	"./Settings"
], function (
	Log,
	deepClone,
	merge,
	Button,
	FormattedText,
	Label,
	RPopover,
	Text,
	Separator,
	Icon,
	JSONModel,
	Utils,
	Constants,
	Settings
) {
	"use strict";

	/**
	 * Field management helper for the Editor control.
	 * Contains methods for creating and managing form fields.
	 *
	 * @namespace
	 * @alias sap.ui.integration.editor.EditorFieldManager
	 * @static
	 * @private
	 */
	var EditorFieldManager = {};

	// Map of field type strings to AMD module paths
	EditorFieldManager._fieldMap = {
		"string": "sap/ui/integration/editor/fields/StringField",
		"string[]": "sap/ui/integration/editor/fields/StringListField",
		"integer": "sap/ui/integration/editor/fields/IntegerField",
		"number": "sap/ui/integration/editor/fields/NumberField",
		"boolean": "sap/ui/integration/editor/fields/BooleanField",
		"date": "sap/ui/integration/editor/fields/DateField",
		"datetime": "sap/ui/integration/editor/fields/DateTimeField",
		"object": "sap/ui/integration/editor/fields/ObjectField",
		"object[]": "sap/ui/integration/editor/fields/ObjectListField",
		"destination": "sap/ui/integration/editor/fields/DestinationField",
		"group": "sap/ui/integration/editor/fields/GroupField"
	};

	// Loaded field classes, populated by requireFields
	EditorFieldManager.Fields = null;

	/**
	 * Loads all field modules registered in EditorFieldManager._fieldMap and stores the classes in EditorFieldManager.Fields
	 *
	 * @returns {Promise}
	 */
	EditorFieldManager.requireFields = function () {
		if (EditorFieldManager.Fields) {
			return Promise.resolve();
		}
		return new Promise(function (resolve) {
			sap.ui.require(Object.values(EditorFieldManager._fieldMap), function () {
				EditorFieldManager.Fields = {};
				for (var n in EditorFieldManager._fieldMap) {
					EditorFieldManager.Fields[n] = arguments[Object.keys(EditorFieldManager._fieldMap).indexOf(n)];
				}

				const aFieldsDependencies = [];

				for (const FieldClass of Object.values(EditorFieldManager.Fields)) {
					if (FieldClass.loadDependencies) {
						aFieldsDependencies.push(FieldClass.loadDependencies());
					}
				}

				Promise.all(aFieldsDependencies).then(resolve);
			});
		});
	};

	/**
	 * Creates a description icon for a field
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfig
	 * @param {string} sParameterKey
	 * @returns {sap.ui.core.Icon}
	 */
	EditorFieldManager._createDescription = function (oEditor, oConfig, sParameterKey) {
		var oDescIcon = new Icon(oEditor.getId() + "_" + sParameterKey + "_description_icon", {
			src: "sap-icon://message-information",
			color: "Marker",
			size: "12px",
			useIconTooltip: false,
			visible: typeof oConfig.visible === "boolean" ? "{currentSettings>visible}" : oConfig.visible,
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				},
				items: {
					path: "items>/form/items"
				},
				context: {
					path: "context>/"
				}
			}
		});
		oDescIcon.addStyleClass("sapUiIntegrationEditorDescriptionIcon");
		oDescIcon.onmouseover = function (oDescIcon) {
			oDescIcon.addDependent(oEditor._getPopover());
			oEditor._getPopover().getContent()[0].applySettings({ text: oConfig.description });
			oEditor._getPopover().openBy(oDescIcon);
		}.bind(oEditor, oDescIcon);
		oDescIcon.onmouseout = function (oDescIcon) {
			oEditor._getPopover().close();
			oDescIcon.removeDependent(oEditor._getPopover());
		}.bind(oEditor, oDescIcon);
		return oDescIcon;
	};

	/**
	 * Creates a message icon for a field
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 * @param {string} sParameterKey
	 * @returns {sap.ui.core.Icon}
	 */
	EditorFieldManager._createMessageIcon = function (oEditor, oField, sParameterKey) {
		var oConfig = oField.getConfiguration();
		var oMsgIcon = new Icon(oEditor.getId() + "_" + sParameterKey + "_message_icon", {
			src: "sap-icon://message-information",
			size: "12px",
			visible: typeof oConfig.visible === "boolean" ? "{currentSettings>visible}" : oConfig.visible,
			useIconTooltip: false,
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				},
				items: {
					path: "items>/form/items"
				},
				context: {
					path: "context>/"
				}
			}
		});
		oMsgIcon.onmouseover = function () {
			oField._showMessage();
		};
		oMsgIcon.onmouseout = function () {
			oField._hideMessage();
		};
		oMsgIcon.addStyleClass("sapUiIntegrationEditorMessageIcon");
		return oMsgIcon;
	};

	/**
	 * Creates a label based on the configuration settings
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfig
	 * @param {string} sParameterKey
	 * @returns {sap.m.Label}
	 */
	EditorFieldManager._createLabel = function (oEditor, oConfig, sParameterKey) {
		var oLabel = new Label(oEditor.getId() + "_" + sParameterKey + "_label", {
			text: oConfig.label,
			tooltip: oConfig.tooltip || oConfig.label,
			required: oConfig.required && oConfig.editable || false,
			visible: typeof oConfig.visible === "boolean" ? "{currentSettings>visible}" : oConfig.visible,
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				},
				items: {
					path: "items>/form/items"
				},
				context: {
					path: "context>/"
				}
			}
		});
		oLabel._cols = oConfig.cols || 2;
		if (oConfig.layout) {
			oLabel._layout = oConfig.layout;
		}
		oLabel._sOriginalType = oConfig.type;
		return oLabel;
	};

	/**
	 * Creates the settings button for a field
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 * @param {string} sParameterKey
	 * @returns {sap.m.Button}
	 */
	EditorFieldManager._createSettingsButton = function (oEditor, oField, sParameterKey) {
		var oConfig = oField.getConfiguration();
		var oSettingsButton = new Button(oEditor.getId() + "_" + sParameterKey + "_settings_btn", {
			icon: "{= ${currentSettings>_hasDynamicValue} ? 'sap-icon://display-more' : 'sap-icon://enter-more'}",
			type: "Transparent",
			tooltip: oEditor._oResourceBundle.getText("EDITOR_FIELD_MORE_SETTINGS"),
			press: function (oEvent) {
				EditorFieldManager._openSettingsDialog(oEditor, 200, oEvent.oSource, oField);
			},
			visible: typeof oConfig.visible === "boolean" ? "{currentSettings>visible}" : oConfig.visible,
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				},
				items: {
					path: "items>/form/items"
				},
				context: {
					path: "context>/"
				}
			}
		});
		return oSettingsButton;
	};

	/**
	 * Returns (or lazily creates) the Settings panel for a field
	 *
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 * @returns {sap.ui.integration.editor.Settings}
	 */
	EditorFieldManager._getSettingsPanel = function (oField) {
		if (!oField._oSettingsPanel) {
			oField._oSettingsPanel = new Settings();
		}
		return oField._oSettingsPanel;
	};

	/**
	 * Opens the settings dialog for a field after a short delay
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {number} iDelay
	 * @param {sap.m.Button} oSettingsButton
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 */
	EditorFieldManager._openSettingsDialog = function (oEditor, iDelay, oSettingsButton, oField) {
		var oSettingsPanel = EditorFieldManager._getSettingsPanel(oField);
		window.setTimeout(function () {
			oSettingsPanel.setConfiguration(oField.getConfiguration());
			oSettingsPanel.open(
				oSettingsButton,
				oSettingsButton,
				oEditor,
				oField.getHost(),
				oField,
				oField._applySettings.bind(oField),
				oField._cancelSettings.bind(oField));
		}, iDelay || 600);
	};

	/**
	 * Creates the description popover for the editor.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @returns {sap.m.ResponsivePopover}
	 */
	EditorFieldManager.getPopover = function (oEditor) {
		const oText = new Text({
			text: ""
		});
		oText.addStyleClass("sapUiTinyMargin sapUiIntegrationEditorDescriptionText");
		const oPopover = new RPopover(oEditor.getId() + "_popover", {
			showHeader: false,
			content: [oText]
		});
		oPopover.addStyleClass("sapUiIntegrationEditorPopover");

		return oPopover;
	};

	/**
	 * Creates a Field based on the configuration settings
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfig
	 * @param {string} sParameterKey
	 * @returns {sap.ui.integration.editor.fields.BaseField}
	 */
	EditorFieldManager._createField = function (oEditor, oConfig, sParameterKey) {
		var oMessageStrip = oEditor.getAggregation("_messageStrip");
		var sMessageStripId = oMessageStrip ? oMessageStrip.getId() : undefined;
		var oField = new EditorFieldManager.Fields[oConfig.type](oEditor.getId() + "_" + sParameterKey + "_field", {
			configuration: oConfig,
			mode: oEditor.getMode(),
			host: oEditor.getHostInstance(),
			parameterKey: sParameterKey,
			objectBindings: {
				currentSettings: {
					path: "currentSettings>" + oConfig._settingspath
				},
				items: {
					path: "items>/form/items"
				},
				context: {
					path: "context>/"
				},
				destinations: {
					path: "destinations>/"
				}
			},
			visible: typeof oConfig.visible === "boolean" ? "{currentSettings>visible}" : oConfig.visible
		});
		oField.setAssociation("_editor", oEditor);

		oEditor._aFieldReadyPromise.push(oField._readyPromise.then(function () {
			if (oConfig.type !== "group") {
				if (oConfig.require
					|| oConfig.validation
					|| (oConfig.validations && oConfig.validations.length > 0)
					|| (oConfig.values && oConfig.values.data && !oConfig.values.data.json)) {
					var oMsgIcon = EditorFieldManager._createMessageIcon(oEditor, oField, sParameterKey);
					oField.setAssociation("_messageIcon", oMsgIcon);
				}
				if (oConfig.description && oEditor.getMode() !== Constants.EDITOR_MODE.TRANSLATION) {
					oField._descriptionIcon = EditorFieldManager._createDescription(oEditor, oConfig, sParameterKey);
				}
				if (oConfig._changeDynamicValues) {
					oField._settingsButton = EditorFieldManager._createSettingsButton(oEditor, oField, sParameterKey);
					oField._applyButtonStyles();
				}
			}
		}));
		if (oConfig.type !== "group") {
			oField._oValueBinding = oEditor._oSettingsModel.bindProperty(oConfig._settingspath + "/value");
			oField._oValueBinding.attachChange(function () {
				if (!oEditor._bIgnoreUpdates) {
					oConfig._changed = true;
					if (oConfig._dependentFields && oConfig._dependentFields.length > 0) {
						EditorFieldManager._updateEditor(oEditor, oConfig._dependentFields);
					}
					oEditor._updatePreview();
				}
			});
			if (oField.isFilterBackend()) {
				var oSuggestValueBinding = oEditor._oSettingsModel.bindProperty(oConfig._settingspath + "/suggestValue");
				oSuggestValueBinding.attachChange(function () {
					var oConfigTemp = merge({}, oConfig);
					oConfigTemp._cancel = false;
					oEditor._addValueListModel(oConfigTemp, oField);
				});
			}
			if (oConfig.values) {
				if (oConfig.values.metadata) {
					oEditor._addMetadataModel(oConfig, oField);
				}
				if (oConfig.type === "string[]" && oField.isFilterBackend() && oConfig.visualization && oConfig.visualization.type === "MultiInput") {
					oField.setModel(new JSONModel({}), undefined);
				} else {
					var pGetFieldData = Utils.timeoutPromise(oEditor._addValueListModel(oConfig, oField));
					pGetFieldData = pGetFieldData
						.catch(function (sReason) {
							Log.error("sap.ui.integration.editor.Editor: get data of field " + sParameterKey + " could not be resolved. Reason: " + sReason);
						});

					oEditor._aFieldDataReadyPromise.push(pGetFieldData);
				}
			}
			EditorFieldManager._createDependentFields(oEditor, oConfig, oField);
			oField._oDataProviderFactory = oEditor._oDataProviderFactory;
		}
		oField._cols = oConfig.cols || 2;
		if (oConfig.layout) {
			oField._layout = oConfig.layout;
		}
		oField._oEditorResourceBundles = oEditor._oEditorResourceBundles;
		oField.setAssociation("_messageStrip", sMessageStripId);
		return oField;
	};

	/**
	 * Updates dependent editor fields when a value changes
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {Array} aDependentFields
	 */
	EditorFieldManager._updateEditor = function (oEditor, aDependentFields) {
		if (oEditor._fieldReady) {
			if (aDependentFields.length === 0) {
				return;
			}
			for (var i = 0; i < aDependentFields.length; i++) {
				var o = aDependentFields[i];
				o.config._cancel = true;
			}
			if (!oEditor._oDataProviderFactory) {
				return;
			}
			oEditor._bIgnoreUpdates = true;
			for (var i = 0; i < aDependentFields.length; i++) {
				var o = aDependentFields[i];
				o.config._cancel = false;
				oEditor._addValueListModel(o.config, o.field, 500 * i);
			}
			oEditor._bIgnoreUpdates = false;
		}
	};

	/**
	 * Sets up field dependency tracking based on parameter/destination references in values.data
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfig
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 */
	EditorFieldManager._createDependentFields = function (oEditor, oConfig, oField) {
		if (oConfig.values) {
			var sData = JSON.stringify(oConfig.values.data);
			if (sData) {
				var destParamRegExp = /parameters\.([^\}\}]+)|destinations\.([^\}\}]+)|\{items\>[\/?\w+]+\}/g,
					aResult = sData.match(destParamRegExp);
				if (aResult) {
					for (var i = 0; i < aResult.length; i++) {
						var sValueKey = "/value";
						var sDependentPath = oEditor.getConfigurationPath();
						if (aResult[i].indexOf("destinations.") === 0 || aResult[i].indexOf("parameters.") === 0) {
							if (aResult[i].indexOf("destinations.") === 0) {
								sValueKey = "/name";
							}
							sDependentPath = sDependentPath + "/" + aResult[i].replace(".", "/") + sValueKey;
						} else if (aResult[i].indexOf("{items>") === 0) {
							sDependentPath = sDependentPath + "/parameters/" + aResult[i].slice(7, -1);
						}
						var oItem = oEditor._mItemsByPaths[sDependentPath];
						if (oItem) {
							if (oItem._settingspath === oConfig._settingspath) {
								oConfig = merge({}, oConfig);
							}
							oItem._dependentFields = oItem._dependentFields || [];
							oItem._dependentFields.push({
								field: oField,
								config: oConfig
							});
						}
					}
				}
			}
		}
	};

	/**
	 * Adds an item to the _formContent aggregation based on the config settings
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfig
	 * @param {string} sParameterKey
	 * @param {object} oLanguages
	 */
	EditorFieldManager._addItem = function (oEditor, oConfig, sParameterKey, oLanguages) {
		var sMode = oEditor.getMode();
		if (oEditor.getAllowDynamicValues() === false || !oConfig.allowDynamicValues) {
			oConfig.allowDynamicValues = false;
		}
		if (oEditor.getAllowSettings() === false) {
			oConfig.allowSettings = false;
		}
		oConfig.__cols = oConfig.cols || 2;

		if (oConfig.visible === false || (!oConfig.translatable && sMode === Constants.EDITOR_MODE.TRANSLATION && oConfig.type !== "group")) {
			return;
		}
		if (oConfig.type === "group") {
			oConfig.expanded = oConfig.expanded !== false;
			var oField = EditorFieldManager._createField(oEditor, oConfig, sParameterKey);
			oEditor.addAggregation("_formContent", oField);
			if (oConfig.hint) {
				EditorFieldManager._addHint(oEditor, oConfig.hint, oEditor.getId() + "_" + sParameterKey);
			}
			return;
		}
		if (oConfig.type === "separator") {
			var oSeparator = new Separator();
			oEditor.addAggregation("_formContent", oSeparator);
			return;
		}
		var oNewLabel = null;
		var sLanguage = Utils._language;
		if (!oLanguages[sLanguage] && sLanguage.indexOf("-") > -1) {
			sLanguage = sLanguage.substring(0, sLanguage.indexOf("-"));
		}
		if (sMode === Constants.EDITOR_MODE.TRANSLATION) {
			if (oConfig.type !== "string") {
				return;
			}
			if ((typeof oConfig.value === "string" && oConfig.value.indexOf("{") === 0) || typeof oConfig.values !== "undefined") {
				return;
			}
			oConfig._language = {
				value: oConfig.value
			};
			oConfig.cols = 1;
			delete oConfig.values;

			var origLangFieldConfig = deepClone(oConfig, 500);
			origLangFieldConfig._settingspath += "/_language";
			origLangFieldConfig.editable = false;
			origLangFieldConfig.required = false;
			if (oLanguages[sLanguage]) {
				var sTranslateText = oEditor.getTranslationValueInTexts(sLanguage, oConfig.manifestpath);
				if (sTranslateText) {
					origLangFieldConfig.value = sTranslateText;
				}
			}
			if (!origLangFieldConfig.value) {
				origLangFieldConfig.value = "-";
			}
			var oLabel = EditorFieldManager._createLabel(oEditor, origLangFieldConfig, sParameterKey);
			oEditor.addAggregation("_formContent", oLabel);
			var oOrigLanguageField = EditorFieldManager._createField(oEditor, origLangFieldConfig, sParameterKey + "_ori");
			oOrigLanguageField.isOrigLangField = true;
			oEditor.addAggregation("_formContent", oOrigLanguageField);

			oConfig.editable = oConfig.visible = oConfig.translatable;
			sLanguage = oEditor._language;
			if (!oEditor._oBeforeLayerChange[oConfig.manifestpath]) {
				oConfig.value = oConfig._translatedValue || "";
			}
			var sTranslateText = oEditor.getTranslationValueInTexts(sLanguage, oConfig.manifestpath);
			if (sTranslateText) {
				oConfig.value = sTranslateText;
			}
			oConfig.label = oConfig._translatedLabel || "";
			oConfig.required = false;
			var oTranslateLanguageField = EditorFieldManager._createField(oEditor, oConfig, sParameterKey + "_trans");
			var tfDelegate = {
				onAfterRendering: function (oEvent) {
					var tfField = document.getElementById(oTranslateLanguageField.getId());
					tfField.setAttribute("aria-label", oLabel);
				}
			};
			oTranslateLanguageField.addEventDelegate(tfDelegate);
			oEditor.addAggregation("_formContent", oTranslateLanguageField);
		} else {
			oNewLabel = EditorFieldManager._createLabel(oEditor, oConfig, sParameterKey);
			oEditor.addAggregation("_formContent", oNewLabel);
			var sBeforeLayerChange = oEditor._oBeforeLayerChange[oConfig.manifestpath];
			if (sBeforeLayerChange) {
				oConfig._beforeLayerChange = sBeforeLayerChange;
			}
			if (oEditor._oCurrentLayerChange && oEditor._oCurrentLayerChange[oConfig.manifestpath]) {
				oConfig.value = oEditor._oCurrentLayerChange[oConfig.manifestpath];
				oConfig._beforeLayerChange = oConfig.value;
			}
			if (oConfig.type === "string" && oLanguages[sLanguage]) {
				var sTranslateText = oEditor.getTranslationValueInTexts(sLanguage, oConfig.manifestpath);
				if (sTranslateText) {
					oConfig.value = sTranslateText;
				}
			}
			var oField = EditorFieldManager._createField(oEditor, oConfig, sParameterKey);
			var fDelegate = {
				onAfterRendering: function (oEvent) {
					var eField = document.getElementById(oField.getId());
					eField.setAttribute("aria-label", oNewLabel);
				}
			};
			oField.addEventDelegate(fDelegate);
			oEditor.addAggregation("_formContent", oField);
		}
		if (oConfig.hint && (!oConfig.cols || oConfig.cols === 2)) {
			EditorFieldManager._addHint(oEditor, oConfig.hint, oEditor.getId() + "_" + sParameterKey);
		}
		oConfig.cols = oConfig.__cols;
		delete oConfig.__cols;
	};

	/**
	 * Creates a FormattedText hint control
	 *
	 * @param {string} sHint
	 * @param {string} sHintIdPrefix
	 * @returns {sap.m.FormattedText}
	 */
	EditorFieldManager.createHint = function (sHint, sHintIdPrefix) {
		sHint = sHint.replace(/<a href/g, "<a target='blank' href");
		var oFormattedText = new FormattedText(sHintIdPrefix + "_hint", {
			htmlText: sHint
		});
		return oFormattedText;
	};

	/**
	 * Creates and adds a hint to the form content aggregation
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {string} sHint
	 * @param {string} sHintIdPrefix
	 */
	EditorFieldManager._addHint = function (oEditor, sHint, sHintIdPrefix) {
		var oHint = EditorFieldManager.createHint(sHint, sHintIdPrefix);
		oEditor.addAggregation("_formContent", oHint);
	};

	/**
	 * Starts the editor by building and populating all form fields
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oLanguages
	 */
	EditorFieldManager.startEditor = function (oEditor, oLanguages) {
		var oContents = oEditor.getAggregation("_formContent");
		if (oContents && oContents.length > 0) {
			oEditor.destroyAggregation("_formContent");
		}

		var oSettingsData = oEditor._oSettingsModel.getData();
		var oItems;
		if (oSettingsData.form && oSettingsData.form.items) {
			oItems = oSettingsData.form.items;
			var bAddGeneralSettingsPanel = false,
				iStartIndex = oEditor._bDestinationGroupAtTop ? 1 : 0,
				aKeys = Object.keys(oItems),
				iLength = aKeys.length,
				iInsertPosition = 0;
			for (var i = iStartIndex; i < iLength; i++) {
				var oItem = oItems[aKeys[i]];
				if (oItem.type === "destination") {
					if (!oEditor._bDestinationGroupAtTop) {
						break;
					}
					iInsertPosition = i;
					continue;
				} else if (oItem.type === "group" && oItem.level !== "1") {
					break;
				} else if (oItem.visible) {
					bAddGeneralSettingsPanel = true;
					break;
				}
			}
			if (bAddGeneralSettingsPanel) {
				var oGeneralPanel = {
					type: "group",
					translatable: true,
					expanded: true,
					label: oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"),
					_settingspath: "/form/items/generalPanel"
				};
				if (oEditor._bDestinationGroupAtTop) {
					var oNewItems = {};
					var iPosition = 0;
					aKeys.forEach(function (sKey) {
						oNewItems[sKey] = oItems[sKey];
						if (iPosition === iInsertPosition) {
							oNewItems["generalPanel"] = oGeneralPanel;
						}
						iPosition++;
					});
					oItems = oNewItems;
				} else {
					oItems = merge(
						{
							"generalPanel": oGeneralPanel
						}, oItems
					);
				}
				oSettingsData.form.items = oItems;
				oEditor._oSettingsModel.setData(oSettingsData);
			}
		}

		var oSettings = oEditor._oSettingsModel.getProperty("/");
		oEditor._mItemsByPaths = {};
		if (oSettings.form && oSettings.form.items) {
			oItems = oSettings.form.items;
			var sLanguage = oEditor._language || oEditor.getLanguage() || Utils._language;
			if (oEditor.getMode() === Constants.EDITOR_MODE.TRANSLATION) {
				EditorFieldManager._addItem(oEditor, {
					type: "group",
					translatable: true,
					expandable: false,
					expanded: true,
					label: oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + oLanguages[sLanguage]
				}, "translationTopPanel");
			}
			for (var n in oItems) {
				var oItem = oItems[n];
				if (oItem) {
					oItem.label = oItem.label || n;
					var sCurrentLayerValue;
					if (oItem.manifestpath) {
						oEditor._mItemsByPaths[oItem.manifestpath] = oItem;
						if (oEditor.getMode() !== Constants.EDITOR_MODE.TRANSLATION) {
							sCurrentLayerValue = oEditor._oCurrentLayerChange[oItem.manifestpath];
						}
					}
					oItem._changed = sCurrentLayerValue !== undefined && oEditor.getMode() !== Constants.EDITOR_MODE.TRANSLATION;

					if (oItem.values) {
						oItem.translatable = false;
					}

					oItem._beforeLayerValue = oEditor._getBeforeLayerValue(oItem.manifestpath);

					if (oItem.type === "string") {
						oItem._translatedDefaultPlaceholder = oEditor._getInitialValue(oItem.manifestpath);
						var sTranslationTextKey = null,
							sPlaceholder = oItem._translatedDefaultPlaceholder;
						if (sPlaceholder) {
							if (oEditor._isValueWithParameterSyntax(sPlaceholder)) {
								oItem.translatable = false;
							}
							if (oEditor._isValueWithHandlebarsTranslation(sPlaceholder)) {
								sTranslationTextKey = sPlaceholder.substring(2, sPlaceholder.length - 2);
							} else if (sPlaceholder.startsWith("{i18n>")) {
								sTranslationTextKey = sPlaceholder.substring(6, sPlaceholder.length - 1);
							}
							if (sTranslationTextKey) {
								oItem.translatable = true;
							} else if (oItem.translatable && oEditor.getMode() === Constants.EDITOR_MODE.TRANSLATION && !oEditor._oBeforeLayerChange[oItem.manifestpath]) {
								oItem._translatedValue = oItem._translatedDefaultPlaceholder;
								oItem.value = oItem._translatedValue;
							}
						}
						oItem._translatedPlaceholder = oItem._beforeLayerValue;
						sPlaceholder = oItem._translatedPlaceholder;
						if (sPlaceholder) {
							if (oEditor._isValueWithParameterSyntax(sPlaceholder)) {
								oItem.translatable = false;
							}
							if (oEditor._isValueWithHandlebarsTranslation(sPlaceholder)) {
								sTranslationTextKey = sPlaceholder.substring(2, sPlaceholder.length - 2);
							} else if (sPlaceholder.startsWith("{i18n>")) {
								sTranslationTextKey = sPlaceholder.substring(6, sPlaceholder.length - 1);
							}
						}
						if (oItem.value && (oItem.value.indexOf("{context>") === 0 || oItem.value.indexOf("{{parameters") === 0)) {
							oEditor.deleteAllTranslationValuesInTexts(oItem.manifestpath);
							sTranslationTextKey = null;
						}
						var sTranslationValueinTexts = oEditor.getTranslationValueInTexts(sLanguage, oItem.manifestpath);
						if (sTranslationTextKey) {
							oItem._translatedValue = oEditor.getModel("i18n").getResourceBundle().getText(sTranslationTextKey);
							if (oItem._changed) {
								oItem.value = sCurrentLayerValue;
							} else if (oItem.value === oItem._translatedDefaultPlaceholder) {
								oItem.value = oItem._translatedValue;
							}
							if (oEditor.getMode() === Constants.EDITOR_MODE.TRANSLATION) {
								var sCurrentLanguageSpecificText = oEditor.getCurrentLanguageSpecificText(sTranslationTextKey);
								if (sCurrentLanguageSpecificText !== "") {
									oItem._translatedValue = sCurrentLanguageSpecificText;
								}
							} else if (sTranslationValueinTexts) {
								oItem.value = sTranslationValueinTexts;
							}
						} else if (oEditor.getMode() !== Constants.EDITOR_MODE.TRANSLATION && oItem.translatable && sTranslationValueinTexts) {
							oItem.value = sTranslationValueinTexts;
						}
						if (oEditor.getMode() === Constants.EDITOR_MODE.TRANSLATION) {
							if (oEditor._isValueWithHandlebarsTranslation(oItem.label)) {
								oItem._translatedLabel = oEditor.getCurrentLanguageSpecificText(oItem.label.substring(2, oItem.label.length - 2));
							} else if (oItem.label && oItem.label.startsWith("{i18n>")) {
								oItem._translatedLabel = oEditor.getCurrentLanguageSpecificText(oItem.label.substring(6, oItem.label.length - 1));
							}
						}
					} else if (oItem.type === "string[]") {
						var sValueItemsPath = oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueItems";
						var oValueItems = oEditor._oManifestModel.getProperty(sValueItemsPath);
						if (oValueItems) {
							oItem.valueItems = oValueItems;
						}
						var sValueTokensPath = oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueTokens";
						var oValueTokens = oEditor._oManifestModel.getProperty(sValueTokensPath);
						if (oValueTokens) {
							oItem.valueTokens = oValueTokens;
						}
					} else if (typeof oItem.value === "object" && oItem.type === "object") {
						if (typeof oItem.value._editable === "boolean") {
							oItem.value._dt = {
								"_editable": oItem.value._editable
							};
							delete oItem.value._editable;
						}
					} else if (Array.isArray(oItem.value) && oItem.value.length > 0 && oItem.type === "object[]") {
						oItem.value.forEach(function (oObject) {
							if (typeof oObject._editable === "boolean") {
								oObject._dt = {
									"_editable": oObject._editable
								};
								delete oObject._editable;
							}
						});
					}

					if (oItem.label && oEditor._isValueWithHandlebarsTranslation(oItem.label)) {
						var sTranslationLabelKey = oItem.label.substring(2, oItem.label.length - 2);
						if (sTranslationLabelKey) {
							oItem.label = oEditor.getModel("i18n").getResourceBundle().getText(sTranslationLabelKey);
						}
					}
				}
			}
		}

		for (var n in oItems) {
			var oItem = oItems[n];
			EditorFieldManager._addItem(oEditor, oItem, n, oLanguages);
		}
		var editorHeight = oEditor._oSettingsModel.getProperty("/form/height") !== undefined ? oEditor._oSettingsModel.getProperty("/form/height") : "350px",
			editorWidth = oEditor._oSettingsModel.getProperty("/form/width") !== undefined ? oEditor._oSettingsModel.getProperty("/form/width") : "100%";
		if (oEditor.getProperty("height") === "") {
			oEditor.setProperty("height", editorHeight);
			document.body.style.setProperty("--sapUiIntegrationEditorFormHeight", editorHeight);
			document.body.style.setProperty("--sapUiIntegrationEditorPreviewHeight", editorHeight);
		}
		if (oEditor.getProperty("width") === "") {
			oEditor.setProperty("width", editorWidth);
			document.body.style.setProperty("--sapUiIntegrationEditorFormWidth", editorWidth);
		}
		if (oEditor.getMode() !== Constants.EDITOR_MODE.TRANSLATION && oEditor.getPreviewPosition() !== "separate") {
			oEditor._initPreview();
		}
		Promise.all(oEditor._aFieldReadyPromise).then(function () {
			oEditor._fieldReady = true;
			oEditor.fireFieldReady();
			if (oEditor.getMode() !== Constants.EDITOR_MODE.ADMIN && oEditor.getMode() !== Constants.EDITOR_MODE.ALL) {
				setTimeout(function () {
					oEditor.fireDestinationReady();
				}, 100);
			}
		});
	};

	/**
	 * Parses the key field names from an item configuration's key template
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfig
	 */
	EditorFieldManager.prepareFieldsInKey = function (oEditor, oConfig) {
		oEditor._sKeySeparator = oConfig.values.keySeparator;
		if (!oEditor._sKeySeparator) {
			oEditor._sKeySeparator = "#";
		}
		var sKey = oConfig.values.item.key;
		oEditor._aFields = sKey.split(oEditor._sKeySeparator);
		for (var n in oEditor._aFields) {
			if (oEditor._aFields[n].startsWith("{")) {
				oEditor._aFields[n] = oEditor._aFields[n].substring(1);
			}
			if (oEditor._aFields[n].endsWith("}")) {
				oEditor._aFields[n] = oEditor._aFields[n].substring(0, oEditor._aFields[n].length - 1);
			}
		}
	};

	/**
	 * Builds a composite key string from an item using the parsed field names
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oItem
	 * @returns {string}
	 */
	EditorFieldManager.getKeyFromItem = function (oEditor, oItem) {
		var sItemKey = "";
		oEditor._aFields.forEach(function (field) {
			sItemKey += oItem[field].toString() + oEditor._sKeySeparator;
		});
		if (sItemKey.endsWith(oEditor._sKeySeparator)) {
			sItemKey = sItemKey.substring(0, sItemKey.length - oEditor._sKeySeparator.length);
		}
		return sItemKey;
	};

	return EditorFieldManager;

});
