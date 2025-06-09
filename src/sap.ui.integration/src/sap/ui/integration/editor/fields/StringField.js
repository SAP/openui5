/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Select",
	"sap/m/ComboBox",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/ListItem",
	"sap/m/VBox",
	"sap/base/util/each",
	"sap/base/util/restricted/_debounce",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/ui/integration/util/Utils"
], function (
	BaseField,
	Input,
	Text,
	Title,
	Select,
	ComboBox,
	Popover,
	Button,
	OverflowToolbar,
	ToolbarSpacer,
	ListItem,
	VBox,
	each,
	_debounce,
	deepClone,
	deepEqual,
	Utils
) {
	"use strict";
	var REGEXP_PARAMETERS = /parameters\.([^\}\}]+)/g;
	var aSpecParameters = [
		"TODAY_ISO",
		"NOW_ISO",
		"LOCALE"
	];

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.BaseField
	 * @alias sap.ui.integration.editor.fields.StringField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var StringField = BaseField.extend("sap.ui.integration.editor.fields.StringField", {
		metadata: {
			library: "sap.ui.integration",
			events: {
				/**
				 * Fired when translation popover opened.
				 * @experimental since 1.132
				 * Disclaimer: this event is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				translationPopoverOpened: {}
			}
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	StringField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		var oItem;
		if (!oVisualization) {
			// check if value contains {{parameters.XX}} syntax
			var aResult = oConfig.value ? oConfig.value.match(REGEXP_PARAMETERS) : undefined;
			var aParts,
				oValue,
				fnChange;
			if (aResult && aResult.length > 0) {
				// filter out TODAY_ISO NOW_ISO LOCALE
				aResult = aResult.filter(function (oResult) {
					var oParameter = oResult.substring(11);
					return !aSpecParameters.includes(oParameter);
				});
			}
			if (aResult && aResult.length > 0) {
				// format the {{parameters.XX}} syntax to {items>XX/value} syntax for data binding
				aParts = aResult.map(function (oResult) {
					if (this.isOrigLangField) {
						return "items>" + oResult.substring(11) + "/_language/value";
					}
					return "items>" + oResult.substring(11) + "/value";
				}.bind(this));
				aParts.unshift("currentSettings>value");
				oValue = {
					parts: aParts,
					formatter: function(sValue) {
						// get the parameter values, then use them to replace the {{parameters.XX}} syntax in current parameter value.
						var aArguments = Array.prototype.slice.call(arguments, 1);
						for (var i = 0; i < aArguments.length; i++) {
							if (aArguments[i]) {
								sValue = sValue.replaceAll("{{" + aResult[i] + "}}", aArguments[i]);
							}
						}
						return sValue;
					}
				};
				fnChange = function (oEvent) {
					var sValue = oEvent.getSource().getValue();
					var sSettingspath = this.getBindingContext("currentSettings").sPath;
					//clean the value in data model
					this._settingsModel.setProperty(sSettingspath + "/value", sValue);
					//update the dependent fields via bindings
					var aBindings = this._settingsModel.getBindings();
					var sParameter = sSettingspath.substring(sSettingspath.lastIndexOf("/") + 1);
					each(aBindings, function(iIndex, oBinding) {
						if (oBinding.sPath === "/form/items/" + sParameter + "/value") {
							oBinding.checkUpdate(true);
						}
					});
				}.bind(this);
			}
			if (this.getMode() === "translation") {
				if (oConfig.editable) {
					oVisualization = {
						type: Input,
						settings: {
							value: {
								path: 'currentSettings>value'
							},
							tooltip: {
								path: 'currentSettings>value'
							},
							editable: oConfig.editable,
							visible: oConfig.visible,
							maxLength: oConfig.maxLength,
							placeholder: oConfig.placeholder
						}
					};
				} else {
					oVisualization = {
						type: Text,
						settings: {
							text: {
								path: 'currentSettings>value'
							},
							tooltip: {
								path: 'currentSettings>value'
							},
							visible: oConfig.visible,
							wrapping: false
						}
					};
				}
			} else if (oConfig.enum) {
				oItem = new ListItem({
					key: {
						path: "currentSettings>"
					},
					text: {
						path: "currentSettings>"
					}
				});
				oVisualization = {
					type: Select,
					settings: {
						selectedKey: {
							path: 'currentSettings>value'
						},
						forceSelection: false,
						editable: oConfig.editable,
						visible: oConfig.visible,
						showSecondaryValues: false,
						width: "100%",
						items: {
							path: "currentSettings>enum",
							template: oItem
						}
					}
				};
			} else if (oConfig.values) {
				oItem = this.formatListItem(oConfig.values.item);
				if (!oConfig.values.item.key) {
					oConfig.values.item.key = oConfig.values.item.text;
				}
				oVisualization = {
					type: ComboBox,
					settings: {
						busy: { path: 'currentSettings>_loading' },
						selectedKey: {
							path: 'currentSettings>value'
						},
						editable: oConfig.editable,
						visible: oConfig.visible,
						showSecondaryValues: true,
						width: "100%",
						items: {
							path: "", //empty, because the bindingContext for the undefined model already points to the path
							template: oItem
						}
					}
				};
				//check if need to filter backend
				if (this.isFilterBackend()) {
					oVisualization.settings.selectedKey = {
						parts: [
							'currentSettings>value',
							'currentSettings>suggestValue'
						],
						formatter: function(sValue, sSuggestValue) {
							if ((!sValue || sValue === "") && sSuggestValue) {
								return sSuggestValue.replaceAll('\'\'', "'");
							} else {
								return sValue;
							}
						}
					};
				}
			} else if (this.getMode() !== "translation" && oConfig.translatable) {
				//use value help function of input to show the multi language popup
				oVisualization = {
					type: Input,
					settings: {
						value: {
							path: 'currentSettings>value'
						},
						tooltip: {
							path: 'currentSettings>value'
						},
						editable: oConfig.editable,
						visible: oConfig.visible,
						maxLength: oConfig.maxLength,
						placeholder: oConfig.placeholder,
						valueHelpIconSrc: "sap-icon://translate",
						showValueHelp: true,
						valueHelpRequest: this.openTranslationListPopup.bind(this),
						change: function(oEvent) {
							//add current change into translation texts
							var oControl = oEvent.getSource();
							var sValue = oControl.getValue();
							var sLanguage = Utils._language;
							oControl.getParent().setTranslationValueInTexts(sLanguage, sValue);
						}
					}
				};
				if (aParts) {
					delete oVisualization.settings.tooltip;
					oVisualization.settings.value = oValue;
					oVisualization.settings.change = fnChange;
					//if value contains {{parameters.XX}} syntax, do not show the translation button and popup
					oVisualization.settings.showValueHelp = false;
					delete oVisualization.settings.valueHelpRequest;
				}
			} else {
				oVisualization = {
					type: Input,
					settings: {
						value: {
							path: 'currentSettings>value'
						},
						tooltip: {
							path: 'currentSettings>value'
						},
						editable: oConfig.editable,
						visible: oConfig.visible,
						maxLength: oConfig.maxLength,
						placeholder: oConfig.placeholder
					}
				};
				if (aParts) {
					delete oVisualization.settings.tooltip;
					oVisualization.settings.value = oValue;
					oVisualization.settings.change = fnChange;
				}
			}
		} else if (oVisualization.type === "TextArea") {
			oVisualization.type = "sap/m/TextArea";
		} else if (oVisualization.type === "Select" && oConfig.values) {
			oItem = this.formatListItem(oConfig.values.item);
			var oSettings = Object.assign({
				selectedKey: {
					path: 'currentSettings>value'
				},
				forceSelection: false,
				editable: oConfig.editable,
				visible: oConfig.visible,
				showSecondaryValues: false,
				width: "100%",
				items: {
					path: '',
					template: oItem
				}
			}, oVisualization.settings || {});
			oVisualization = {
				type: Select,
				settings: oSettings
			};
		}
		this._visualization = oVisualization;
		this.attachAfterInit(this._afterInit);
	};

	StringField.prototype._afterInit = function () {
		var oControl = this.getAggregation("_field");
		if (oControl instanceof ComboBox) {
			if (this.isFilterBackend()) {
				this.onInput = _debounce(this.onInput, 500);
				//if need to filter backend by input value, need to hook the onInput function which only support filter locally.
				oControl.oninput = this.onInput.bind(this);
				//listen to the selectionChange event of Combobox
				oControl.attachSelectionChange(this.onSelectionChange.bind(this));
			}
		}
	};

	StringField.prototype.onSelectionChange = function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem") || {};
		var sKey = oSelectedItem.getKey();
		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		this._settingsModel.setProperty(sSettingspath + "/value", sKey);
		//oSettingsModel.setProperty(sSettingspath + "/suggestValue", "");
	};

	StringField.prototype.onInput = function (oEvent) {
		//get the suggestion value in the input field of the ComoboBox
		var sTerm = oEvent.target.value;
		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		//set the suggestion value into data model property "suggestValue" for filter backend
		this._settingsModel.setProperty(sSettingspath + "/suggestValue", sTerm.replaceAll("'", "\'\'"));
		this._settingsModel.setProperty(sSettingspath + "/_loading", true);
		//clean the value in data model
		this._settingsModel.setProperty(sSettingspath + "/value", "");
		//update the dependent fields via bindings
		var aBindings = this._settingsModel.getBindings();
		var sParameter = sSettingspath.substring(sSettingspath.lastIndexOf("/") + 1);
		each(aBindings, function(iIndex, oBinding) {
			if (oBinding.sPath === "/form/items/" + sParameter + "/value") {
				oBinding.checkUpdate(true);
			}
		});
		var oComboBox = oEvent.srcControl;
		//open the popup dialog
		oComboBox.open();
		//set the suggestion value to the input field of the ComboBox
		oComboBox.setValue(sTerm);
		//remove the previous selection
		oComboBox.setSelection(null);
	};

	//get origin values in i18n files
	StringField.prototype.getOriginTranslatedValues = function(oConfig) {
		var aOriginTranslatedValues = [];
		var aEditorResourceBundles = this._oEditorResourceBundles.getResourceBundles();
		//get translation key of the value
		var sKey;
		if (oConfig._translatedDefaultPlaceholder && oConfig._translatedDefaultPlaceholder.startsWith("{i18n>") && oConfig._translatedDefaultPlaceholder.endsWith("}")) {
			sKey = oConfig._translatedDefaultPlaceholder.substring(6, oConfig._translatedDefaultPlaceholder.length - 1);
		} else if (oConfig._translatedDefaultPlaceholder && oConfig._translatedDefaultPlaceholder.startsWith("{{") && oConfig._translatedDefaultPlaceholder.endsWith("}}")) {
			sKey = oConfig._translatedDefaultPlaceholder.substring(2, oConfig._translatedDefaultPlaceholder.length - 2);
		}
		for (var p in aEditorResourceBundles) {
			var oResourceBundleTemp = aEditorResourceBundles[p];
			var sTranslatedValue = "";
			var sOriginValue = "";
			if (sKey && oResourceBundleTemp) {
				var sText = oResourceBundleTemp.resourceBundle && oResourceBundleTemp.resourceBundle.getText(sKey, [], true);
				if (sText !== undefined) {
					sTranslatedValue = sText;
					sOriginValue = sText;
				} else {
					//no value in resource bundle means the i18n setting is not correct
					sTranslatedValue = oConfig._translatedValue || "";
					sOriginValue = oConfig._translatedValue || "";
				}
			} else {
				//if no translation key which means item defined as string value directly.
				//set the sTranslatedValue and sOriginValue for each language with item manifest value or default value.
				sTranslatedValue = oConfig._translatedDefaultPlaceholder || "";
				sOriginValue = oConfig._translatedDefaultPlaceholder || "";
			}
			var oLanguage = {
				"key": p,
				"description": oResourceBundleTemp.language,
				"value": sTranslatedValue,
				"originValue": sOriginValue,
				"editable": true
			};
			aOriginTranslatedValues.push(oLanguage);
		}
		return aOriginTranslatedValues;
	};

	StringField.prototype.getTranslationValueInTexts = function (sLanguage, sManifestPath) {
		var sTranslationPath = "/texts/" + sLanguage;
		var oProperty = this._settingsModel.getProperty(sTranslationPath) || {};
		return oProperty[sManifestPath];
	};

	StringField.prototype.setTranslationValueInTexts = function (sLanguage, sValue) {
		var sManifestPath = this.getConfiguration().manifestpath;
		var sTranslationPath = "/texts";
		var oData = this._settingsModel.getData();
		if (!oData) {
			return;
		}
		if (!oData.hasOwnProperty("texts")) {
			var oTexts = {};
			oTexts[sLanguage] = {};
			oTexts[sLanguage][sManifestPath] = sValue;
			this._settingsModel.setProperty(sTranslationPath, oTexts);
		} else {
			sTranslationPath = "/texts/" + sLanguage;
			var oLanguage;
			if (!oData.texts.hasOwnProperty(sLanguage)) {
				oLanguage = {};
			} else {
				oLanguage = oData.texts[sLanguage];
			}
			oLanguage[sManifestPath] = sValue;
			this._settingsModel.setProperty(sTranslationPath, oLanguage);
		}
	};

	StringField.prototype.deleteTranslationValueInTexts = function (sLanguage) {
		var sManifestPath = this.getConfiguration().manifestpath;
		var oData = this._settingsModel.getData();
		if (oData && oData.texts && oData.texts[sLanguage]) {
			delete oData.texts[sLanguage][sManifestPath];
		}
		if (deepEqual(oData.texts[sLanguage], {})) {
			delete oData.texts[sLanguage];
		}
		if (deepEqual(oData.texts, {})) {
			delete oData.texts;
		}
		this._settingsModel.setData(oData);
	};

	//open the translation popup
	StringField.prototype.openTranslationListPopup = function(oEvent) {
		var that = this;
		if (!that._oEditorResourceBundles.isReady()) {
			// waiting for loading resource bundles
			that._oEditorResourceBundles.attachEventOnce("ready", function() {
				that.openTranslationListPopup(oEvent);
			});
			return;
		}
		var oControl = oEvent.getSource();
		var sParameterId = that.getParameterId();
		var oResourceBundle = that.getResourceBundle();
		var oTranslatedValues = that.buildTranslationsData(oControl);
		var oTranslatonsModel;
		var sPlacement = that.getPopoverPlacement(oControl._oValueHelpIcon);
		if (!that._oTranslationPopover) {
			var oList = that.buildTranslationsList(sParameterId + "_translation_popover_value_list");
			that._oTranslationPopover = new Popover(sParameterId + "_translation_popover", {
				placement: sPlacement,
				contentWidth: "300px",
				contentHeight: "345px",
				customHeader: new VBox({
					items: [
						new Title({
							text: oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE")
						}).addStyleClass("sapMPopoverTitle"),
						new Title({
							text: oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE")
						}).addStyleClass("sapMHeaderTitle"),
						new VBox({
							items: [
								new Text(sParameterId + "_translation_popover_currentlanguage_description_label", {
									text: "{languages>/currentLanguage/description}"
								}),
								new Input(sParameterId + "_translation_popover_currentlanguage_value_input", {
									value: "{languages>/currentLanguage/value}",
									editable: false
								})
							]
						}).addStyleClass("sapMCurrentLanguageVBox"),
						new Title({
							text: oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES")
						}).addStyleClass("sapMHeaderTitle")
					]
				}),
				content: oList,
				afterOpen: function () {
					that.fireTranslationPopoverOpened();
				},
				footer: new OverflowToolbar({
					content: [
						new ToolbarSpacer(),
						new Button(sParameterId + "_translation_popover_save_btn", {
							type: "Emphasized",
							text: oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_BUTTON_SAVE"),
							enabled: "{languages>/isUpdated}",
							press: function () {
								var aLanguages = that._oTranslationPopover.getModel("languages").getData();
								//get changes in the popup
								var aUpdatedLanguages = [];
								aLanguages.translatedLanguages.forEach(function(oLanguage) {
									if (oLanguage.value !== oLanguage.originValue) {
										if (oLanguage.updated) {
											that.setTranslationValueInTexts(oLanguage.key, oLanguage.value);
											aUpdatedLanguages.push(oLanguage.key);
										}
									} else if (oLanguage.updated) {
										that.deleteTranslationValueInTexts(oLanguage.key);
									}
								});
								if (aUpdatedLanguages.length > 0) {
									that._aUpdatedLanguages = aUpdatedLanguages;
								} else {
									that._aUpdatedLanguages = undefined;
								}
								that._oTranslationPopover.close();
							}
						}),
						new Button(sParameterId + "_translation_popover_cancel_btn", {
							text: oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_BUTTON_CANCEL"),
							press: function () {
								that._oTranslationPopover.close();
							}
						})
					]
				})
			}).addStyleClass("sapUiIntegrationFieldTranslation");
			oTranslatonsModel = that.buildTranslationsModel(oTranslatedValues);
			that._oTranslationPopover.setModel(oTranslatonsModel, "languages");
		} else {
			that._oTranslationPopover.setPlacement(sPlacement);
			oTranslatonsModel = that._oTranslationPopover.getModel("languages");
			oTranslatonsModel.setData(oTranslatedValues);
			oTranslatonsModel.checkUpdate(true);
		}
		that._oTranslationPopover.openBy(oControl._oValueHelpIcon);
	};

	StringField.prototype.buildTranslationsData = function(oControl) {
		var that = this;
		var oConfig = that.getConfiguration();
		if (!that._aOriginTranslatedValues) {
			//init the origin translation value list in card i18n files
			that._aOriginTranslatedValues = that.getOriginTranslatedValues(oConfig);
		}
		var aTempTranslatedLanguages = deepClone(that._aOriginTranslatedValues, 500);
		//merge the value in texts or beforeLayerChange into the value list of i18n files
		aTempTranslatedLanguages.forEach(function (translatedValue) {
			var sTranslateText = that.getTranslationValueInTexts(translatedValue.key, oConfig.manifestpath);
			if (sTranslateText) {
				translatedValue.value = sTranslateText;
				if (Array.isArray(that._aUpdatedLanguages) && !that._aUpdatedLanguages.includes(translatedValue.key)) {
					translatedValue.originValue = translatedValue.value;
				}
			} else if (oConfig._beforeLayerChange) {
				translatedValue.value = oConfig._beforeLayerChange;
				if (Array.isArray(that._aUpdatedLanguages) && !that._aUpdatedLanguages.includes(translatedValue.key)) {
					translatedValue.originValue = translatedValue.value;
				}
			}
			translatedValue.updated = false;
			if (translatedValue.key === Utils._language) {
				translatedValue.editable = false;
			}
		});

		var oTranslatedValues = {
			"currentLanguage": {},
			"isUpdated": false,
			"translatedLanguages": []
		};
		if (aTempTranslatedLanguages) {
			//check the updated language list, update the data model
			aTempTranslatedLanguages.forEach(function (translatedValue) {
				if (Array.isArray(that._aUpdatedLanguages) && that._aUpdatedLanguages.includes(translatedValue.key)) {
					translatedValue.value = that.getTranslationValueInTexts(translatedValue.key, oConfig.manifestpath);
					translatedValue.updated = true;
				}
				if (translatedValue.key === Utils._language) {
					translatedValue.value = oControl.getValue();
					oTranslatedValues.currentLanguage = translatedValue;
				} else {
					oTranslatedValues.translatedLanguages.push(translatedValue);
				}
			});
		}
		return oTranslatedValues;
	};

	return StringField;
});