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
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/VBox",
	"sap/base/util/each",
	"sap/base/util/restricted/_debounce",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/editor/EditorResourceBundles",
	"sap/base/util/deepClone",
	"sap/ui/model/Sorter",
	'sap/m/GroupHeaderListItem',
	"sap/base/util/includes",
	"sap/ui/core/CustomData"
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
	List,
	CustomListItem,
	VBox,
	each,
	_debounce,
	Core,
	JSONModel,
	EditorResourceBundles,
	deepClone,
	Sorter,
	GroupHeaderListItem,
	includes,
	CustomData
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
			library: "sap.ui.integration"
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	StringField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
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
					return !includes(aSpecParameters, oParameter);
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
				var oItem = new ListItem({
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
				var oItem = this.formatListItem(oConfig.values.item);
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
						placeholder: oConfig.placeholder,
						valueHelpIconSrc: "sap-icon://translate",
						showValueHelp: true,
						valueHelpRequest: this.openTranslationListPopup,
						change: function(oEvent) {
							//add current change into translation texts
							var oControl = oEvent.getSource();
							var sValue = oControl.getValue();
							var sLanguage =  Core.getConfiguration().getLanguage().replaceAll('_', '-');
							oControl.getParent().setTranslationValueInTexts(sLanguage, oConfig.manifestpath, sValue);
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
		var aEditorResourceBundles = EditorResourceBundles.getInstance();
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
				"desription": oResourceBundleTemp.language,
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

	StringField.prototype.setTranslationValueInTexts = function (sLanguage, sManifestPath, sValue) {
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

	//open the translation popup
	StringField.prototype.openTranslationListPopup = function(oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var oField = oControl.getParent();
		var oConfig = oField.getConfiguration();

		if (!that._aOriginTranslatedValues) {
			//init the origin translation value list in card i18n files
			that._aOriginTranslatedValues = oField.getOriginTranslatedValues(oConfig);
		}
		var aTempTranslatedLanguages = deepClone(that._aOriginTranslatedValues, 500);
		var oResourceBundle = oField.getResourceBundle();
		//merge the value in texts or beforeLayerChange into the value list of i18n files
		aTempTranslatedLanguages.forEach(function (translatedValue) {
			var sTranslateText = oField.getTranslationValueInTexts(translatedValue.key, oConfig.manifestpath);
			if (sTranslateText) {
				translatedValue.value = sTranslateText;
				if (!includes(that._aUpdatedLanguages, translatedValue.key)) {
					translatedValue.originValue = translatedValue.value;
				}
			} else if (oConfig._beforeLayerChange) {
				translatedValue.value = oConfig._beforeLayerChange;
				if (!includes(that._aUpdatedLanguages, translatedValue.key)) {
					translatedValue.originValue = translatedValue.value;
				}
			}
			translatedValue.status = oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED");
			if (translatedValue.key === oResourceBundle.sLocale.replaceAll('_', '-')) {
				translatedValue.editable = false;
			}
		});

		var aTranslatedValues = {
			"currentLanguage": {},
			"isUpdated": false,
			"translatedLanguages": []
		};
		var oModel;
		if (aTempTranslatedLanguages) {
			//check the updated language list, update the data model
			aTempTranslatedLanguages.forEach(function (translatedValue) {
				if (includes(that._aUpdatedLanguages, translatedValue.key)) {
					translatedValue.value = oField.getTranslationValueInTexts(translatedValue.key, oConfig.manifestpath);
					translatedValue.status = oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_UPDATED");
				}
				if (translatedValue.key === oResourceBundle.sLocale.replaceAll('_', '-')) {
					translatedValue.value = oControl.getValue();
					aTranslatedValues.currentLanguage = translatedValue;
				} else {
					aTranslatedValues.translatedLanguages.push(translatedValue);
				}
			});
		}
		var sPlacement = oField.getPopoverPlacement(oControl._oValueHelpIcon);
		if (!that._oTranslationPopover) {
			var oList = new List({
				//mode: "Delete",
				items: {
					path: "languages>/translatedLanguages",
					template: new CustomListItem({
						content: [
							new VBox({
								items: [
									new Text({
										text: "{languages>desription}"
									}),
									new Input({
										value: "{languages>value}",
										editable: "{languages>editable}"
									})
								]
							})
						],
						customData: [
							new CustomData({
								key: "{languages>key}",
								value: "{languages>desription}"
							})
						]
					}),
					sorter: [new Sorter({
						path: 'status',
						descending: true,
						group: true
					})],
					groupHeaderFactory: oField.getGroupHeader
				}
			});
			that._oTranslationPopover = new Popover({
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
								new Text({
									text: "{languages>/currentLanguage/desription}"
								}),
								new Input({
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
				footer: new OverflowToolbar({
					content: [
						new ToolbarSpacer(),
						new Button({
							type: "Emphasized",
							text: oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_BUTTON_SAVE"),
							enabled: "{languages>/isUpdated}",
							press: function () {
								var aLanguages = that._oTranslationPopover.getModel("languages").getData();
								//get changes in the popup
								var aUpdatedLanguages = [];
								aLanguages.translatedLanguages.forEach(function(oLanguage) {
									if (oLanguage.value !== oLanguage.originValue) {
										oField.setTranslationValueInTexts(oLanguage.key, oConfig.manifestpath, oLanguage.value);
										aUpdatedLanguages.push(oLanguage.key);
									}
								});
								if (aLanguages.currentLanguage.value != aLanguages.currentLanguage.originValue) {
									oField.setTranslationValueInTexts(aLanguages.currentLanguage.key, oConfig.manifestpath, aLanguages.currentLanguage.value);
									aUpdatedLanguages.push(aLanguages.currentLanguage.key);
								}
								if (aUpdatedLanguages.length > 0) {
									that._aUpdatedLanguages = aUpdatedLanguages;
								}
								that._oTranslationPopover.close();
							}
						}),
						new Button({
							text: oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_BUTTON_CANCEL"),
							press: function () {
								that._oTranslationPopover.close();
							}
						})
					]
				})
			}).addStyleClass("sapUiIntegrationFieldTranslation");
			oModel = new JSONModel(aTranslatedValues);
			oModel.attachPropertyChange(function(oEvent) {
				//update the status of each translation for grouping
				//update the isUpdated property
				var oData = oModel.getData();
				var sUpdatedStr = oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_UPDATED");
				var sNotUpdatedStr = oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED");
				var bIsUpdated = false;
				oData.translatedLanguages.forEach(function(oLanguage) {
					if (oLanguage.value !== oLanguage.originValue) {
						oLanguage.status = sUpdatedStr;
						bIsUpdated = true;
					} else {
						oLanguage.status = sNotUpdatedStr;
					}
				});
				oData.isUpdated = bIsUpdated;
				oModel.setData(oData);
				oModel.checkUpdate(true);
			});
			that._oTranslationPopover.setModel(oModel, "languages");
		} else {
			that._oTranslationPopover.setPlacement(sPlacement);
			oModel = that._oTranslationPopover.getModel("languages");
			oModel.setData(aTranslatedValues);
			oModel.checkUpdate(true);
		}
		that._oTranslationPopover.openBy(oControl._oValueHelpIcon);
	};

	StringField.prototype.getGroupHeader = function(oGroup) {
		return new GroupHeaderListItem({
			title: oGroup.key,
			upperCase: false
		});
	};

	return StringField;
});