/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/designtime/editor/fields/BaseField",
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
	"./viz/IconSelect",
	"sap/base/util/each",
	"sap/base/util/restricted/_debounce",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/designtime/editor/CardResourceBundles",
	"sap/base/util/deepClone",
	"sap/ui/model/Sorter",
	"sap/ui/core/SeparatorItem",
	"sap/base/util/includes",
	"sap/base/util/merge",
	"sap/ui/core/CustomData"
], function (
	BaseField, Input, Text, Title, Select, ComboBox, Popover, Button, OverflowToolbar, ToolbarSpacer, ListItem, List, CustomListItem, VBox, IconSelect, each, _debounce, Core, JSONModel, CardResourceBundles, deepClone, Sorter, SeparatorItem, includes, merge, CustomData
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.designtime.editor.fields.BaseField
	 * @alias sap.ui.integration.designtime.editor.fields.StringField
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var StringField = BaseField.extend("sap.ui.integration.designtime.editor.fields.StringField", {
		renderer: BaseField.getMetadata().getRenderer()
	});

	StringField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
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
			} else {
				if (oConfig.enum) {
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
								path: "currentSettings>enum", //empty, because the bindingContext for the undefined model already points to the path
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
					if (this.isFilterBackend(oConfig)) {
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
				/* hide multi language function since there has a translation issue in Portal
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
							liveChange: function(oEvent) {
								//add current change into valueTranslations
								if (!oConfig.valueTranslations) {
									oConfig.valueTranslations = {};
								}
								var oControl = oEvent.getSource();
								var sValue = oControl.getValue();
								var sLanguage =  Core.getConfiguration().getLanguage().replaceAll('-', '_');
								var oValueTranslations = deepClone(oConfig.valueTranslations);
								oValueTranslations[sLanguage] = sValue;
								oConfig.valueTranslations = oValueTranslations;
							}
						}
					};*/
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
				}
			}
		}
		this._visualization = oVisualization;
		this.attachAfterInit(this._afterInit);
	};

	StringField.prototype._afterInit = function () {
		var oControl = this.getAggregation("_field");
		if (oControl instanceof ComboBox) {
			var oConfig = this.getConfiguration();
			if (this.isFilterBackend(oConfig)) {
				this.onInput = _debounce(this.onInput, 500);
				//if need to filter backend by input value, need to hook the onInput function which only support filter locally.
				oControl.oninput = this.onInput;
				//listen to the selectionChange event of Combobox
				oControl.attachSelectionChange(this.onSelectionChange);
			}
		}
	};

	StringField.prototype.onSelectionChange = function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem") || {};
		var sKey = oSelectedItem.getKey();
		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		var oSettingsModel = this.getModel("currentSettings");
		oSettingsModel.setProperty(sSettingspath + "/value", sKey);
		//oSettingsModel.setProperty(sSettingspath + "/suggestValue", "");
	};

	StringField.prototype.onInput = function (oEvent) {
		//get the suggestion value in the input field of the ComoboBox
		var sTerm = oEvent.target.value;
		var sSettingspath = this.getBindingContext("currentSettings").sPath;
		var oSettingsModel = this.getModel("currentSettings");
		//set the suggestion value into data model property "suggestValue" for filter backend
		oSettingsModel.setProperty(sSettingspath + "/suggestValue", sTerm.replaceAll("'", "\'\'"));
		oSettingsModel.setProperty(sSettingspath + "/_loading", true);
		//clean the value in data model
		oSettingsModel.setProperty(sSettingspath + "/value", "");
		//update the dependent fields via bindings
		var aBindings = oSettingsModel.getBindings();
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
		var aCardResourceBundles = CardResourceBundles.getInstance(oConfig._resourceBundleURL);
		for (var p in aCardResourceBundles) {
			var oResourceBundleTemp = aCardResourceBundles[p];
			//get translation key of the value
			var sKey;
			if (oConfig._translatedDefaultPlaceholder.startsWith("{i18n>") && oConfig._translatedDefaultPlaceholder.endsWith("}")) {
				sKey = oConfig._translatedDefaultPlaceholder.substring(6, oConfig._translatedDefaultPlaceholder.length - 1);
			} else if (oConfig._translatedDefaultPlaceholder.startsWith("{{") && oConfig._translatedDefaultPlaceholder.endsWith("}}")) {
				sKey = oConfig._translatedDefaultPlaceholder.substring(2, oConfig._translatedDefaultPlaceholder.length - 2);
			}
			var sTranslatedValue = "";
			var sOriginValue = "";
			if (sKey && oResourceBundleTemp) {
				var sText = oResourceBundleTemp.resourceBundle.getText(sKey, [], true);
				if (sText !== undefined) {
					sTranslatedValue = sText;
					sOriginValue = sText;
				}
			} else {
				//if no translation key which means item defined as string value directly.
				//set the sTranslatedValue and sOriginValue for each language with item manifest value or default value.
				sTranslatedValue = oConfig._translatedDefaultPlaceholder;
				sOriginValue = oConfig._translatedDefaultPlaceholder;
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
		var aTempTranslatedLanguages = deepClone(that._aOriginTranslatedValues);
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
		//merge the value in config.valueTranslations into the value list of i18n files
		aTempTranslatedLanguages.forEach(function (translatedValue) {
			if (oConfig.valueTranslations && oConfig.valueTranslations[translatedValue.key]) {
				translatedValue.value = oConfig.valueTranslations[translatedValue.key];
				if (!includes(that._aUpdatedLanguages, translatedValue.key)) {
					translatedValue.originValue = translatedValue.value;
				}
			}
			translatedValue.status = oResourceBundle.getText("CARDEDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED");
			if (translatedValue.key === oResourceBundle.sLocale) {
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
					translatedValue.value = oConfig.valueTranslations[translatedValue.key];
					translatedValue.status = oResourceBundle.getText("CARDEDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_UPDATED");
				}
				if (translatedValue.key === oResourceBundle.sLocale) {
					translatedValue.value = oControl.getValue();
					aTranslatedValues.currentLanguage = translatedValue;
				} else {
					aTranslatedValues.translatedLanguages.push(translatedValue);
				}
			});
		}
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
					groupHeaderFactory: that.getGroupHeader
				}
			});
			that._oTranslationPopover = new Popover({
				placement: "Right",
				contentWidth: "300px",
				contentHeight: "345px",
				customHeader: new VBox({
					items: [
						new Title({
							text: oResourceBundle.getText("CARDEDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE")
						}).addStyleClass("sapMPopoverTitle"),
						new Title({
							text: oResourceBundle.getText("CARDEDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE")
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
							text: oResourceBundle.getText("CARDEDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES")
						}).addStyleClass("sapMHeaderTitle")
					]
				}),
				content: oList,
				footer: new OverflowToolbar({
					content: [
						new ToolbarSpacer(),
						new Button({
							type: "Emphasized",
							text: oResourceBundle.getText("CARDEDITOR_FIELD_TRANSLATION_LIST_POPOVER_BUTTON_SAVE"),
							enabled: "{languages>/isUpdated}",
							press: function () {
								var aLanguages = that._oTranslationPopover.getModel("languages").getData();
								var oCurrentValueTranslations = deepClone(oConfig.valueTranslations);
								//get changes in the popup
								var oValueTranslations = {};
								var aUpdatedLanguages = [];
								aLanguages.translatedLanguages.forEach(function(oLanguage) {
									if (oLanguage.value !== oLanguage.originValue) {
										oValueTranslations[oLanguage.key] = oLanguage.value;
										aUpdatedLanguages.push(oLanguage.key);
									}
								});
								if (aLanguages.currentLanguage.value != aLanguages.currentLanguage.originValue) {
									oValueTranslations[aLanguages.currentLanguage.key] = aLanguages.currentLanguage.value;
									aUpdatedLanguages.push(aLanguages.currentLanguage.key);
								}
								//merge the chanegs with existing translations
								if (oValueTranslations !== {}) {
									oConfig.valueTranslations = merge(oCurrentValueTranslations, oValueTranslations);
									oConfig._changed = true;
								}
								if (aUpdatedLanguages.length > 0) {
									that._aUpdatedLanguages = aUpdatedLanguages;
								}
								that._oTranslationPopover.close();
							}
						}),
						new Button({
							text: oResourceBundle.getText("CARDEDITOR_FIELD_TRANSLATION_LIST_POPOVER_BUTTON_CANCEL"),
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
				var sUpdatedStr = oResourceBundle.getText("CARDEDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_UPDATED");
				var sNotUpdatedStr = oResourceBundle.getText("CARDEDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED");
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
			oModel = that._oTranslationPopover.getModel("languages");
			oModel.setData(aTranslatedValues);
			oModel.checkUpdate(true);
		}
		that._oTranslationPopover.openBy(oControl);
	};

	StringField.prototype.getGroupHeader = function(oGroup) {
		return new SeparatorItem( {
			text: oGroup.key
		});
	};

	return StringField;
});