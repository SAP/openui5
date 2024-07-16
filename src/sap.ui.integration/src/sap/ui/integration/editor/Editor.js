/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/base/util/merge",
	"sap/ui/base/Interface",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/integration/Designtime",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/integration/util/Utils",
	"sap/ui/integration/util/Destinations",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/m/Label",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/Icon",
	"sap/m/ResponsivePopover",
	"sap/m/Popover",
	"sap/m/Text",
	"sap/base/Log",
	"sap/ui/core/Popup",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/integration/editor/EditorResourceBundles",
	"sap/ui/dom/includeStylesheet",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/theming/Parameters",
	"sap/base/util/ObjectPath",
	"sap/m/FormattedText",
	"sap/m/MessageStrip",
	"sap/m/ToolbarSpacer",
	"sap/ui/model/resource/ResourceModel",
	"./Manifest",
	"./Merger",
	"./Settings",
	"sap/m/FlexItemData",
	"sap/m/FlexBox",
	"sap/m/Button"
], function(
	Localization,
	Control,
	Core,
	deepClone,
	deepEqual,
	merge,
	Interface,
	Element,
	Library,
	Designtime,
	JSONModel,
	ODataModel,
	Utils,
	Destinations,
	DataProviderFactory,
	Label,
	HBox,
	VBox,
	Icon,
	RPopover,
	Popover,
	Text,
	Log,
	Popup,
	ResourceBundle,
	EditorResourceBundles,
	includeStylesheet,
	LoaderExtensions,
	Parameters,
	ObjectPath,
	FormattedText,
	MessageStrip,
	Separator,
	ResourceModel,
	EditorManifest,
	Merger,
	Settings,
	FlexItemData,
	FlexBox,
	Button
) {
	"use strict";

	//workaround issue of orientation change fired that reapplies position and closes the popup
	//issue is not predictable and depends on host environment. Solution - apply all, simply do not close for position changes.
	var popoverInit = Popover.prototype.init;
	Popover.prototype.init = function () {
		popoverInit.apply(this, arguments);
		var fn = this.oPopup._applyPosition,
			that = this;
		this.oPopup._applyPosition = function () {
			var fnClose = that.close;
			that.close = function () { };
			fn.apply(this, arguments);
			that.close = fnClose;
		};
	};

	function getHigherZIndex(source) {
		if (source && source.nodeType !== 1) {
			return 0;
		}
		var z = parseInt(window.getComputedStyle(source).getPropertyValue('z-index'));
		if (isNaN(z)) {
			return getHigherZIndex(source.parentNode);
		}
		return z + 1;
	}
	var REGEXP_TRANSLATABLE = /\{\{(?!parameters.)(?!destinations.)([^\}\}]+)\}\}/g,
		REGEXP_PARAMETERS = /\{\{parameters\.([^\}\}]+)/g,
		CONTEXT_TIMEOUT = 5000,
		MessageStripId = "_strip",
		MODULE_PREFIX = "module:",
		CONTEXT_ENTRIES;

	/**
	 * Constructor for a new <code>Editor</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control allows to edit manifest settings from a designtime module.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.94
	 * @private
	 * @experimental since 1.94.0
	 * @alias sap.ui.integration.editor.Editor
	 */
	var Editor = Control.extend("sap.ui.integration.editor.Editor", /** @lends sap.ui.integration.editor.Editor.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * admin, content, translation, all
				 * Used to control the editors capabilities
				 */
				mode: {
					type: "string",
					defaultValue: "admin"
				},
				language: {
					type: "string",
					defaultValue: ""
				},
				allowDynamicValues: {
					type: "boolean",
					defaultValue: false
				},
				allowSettings: {
					type: "boolean",
					defaultValue: false
				},
				designtime: {
					type: "object"
				},
				section: {
					type: "string",
					defaultValue: "sap.card"
				},
				host: {
					type: "string",
					defaultValue: ""
				},
				baseUrl: {
					type: "sap.ui.core.URI",
					defaultValue: null
				},
				json: {
					type: "object"
				},
				previewPosition:{
					type: "string",
					defaultValue: "right" // value can be "top", "bottom", "left", "right" or "separate"
				},
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				}
			},
			aggregations: {
				/**
				 * Defines the header of the Editor.
				 */
				_formContent: {
					type: "sap.ui.core.Control",
					multiple: true,
					visibility: "hidden"
				},
				_preview: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				_messageStrip: {
					type: "sap.m.MessageStrip",
					multiple: false,
					visibility: "hidden"
				},
				_extension: {
					type: "sap.ui.integration.editor.Extension",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				ready: {},
				manifestReady: {}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				var oPreview = oControl.getAggregation("_preview");
				var bShowPreview = oControl.getMode() !== "translation" && oControl.hasPreview();
				var sPreviewPosition = oControl.getPreviewPosition();
				if (bShowPreview && (sPreviewPosition === "top" || sPreviewPosition === "bottom")) {
					oRm.openStart("div", oControl);
					oRm.openEnd();
					//render the additional content if alignment of it is "top"
					if (oControl.isReady() && sPreviewPosition === "top") {
						oRm.renderControl(oPreview);
					}
				}
				if (bShowPreview && sPreviewPosition === "left") {
					oRm.openStart("div", oControl);
					oRm.class("sapUiIntegrationEditor");
					oRm.openEnd();
					if (oControl.isReady()){
						oRm.renderControl(oPreview);
					}
				} else if (bShowPreview && (sPreviewPosition === "top" || sPreviewPosition === "bottom")) {
					oRm.openStart("div");
					oRm.class("sapUiIntegrationEditor");
					oRm.openEnd();
				} else {
					oRm.openStart("div", oControl);
					oRm.class("sapUiIntegrationEditor");
					oRm.openEnd();
				}
				if (oControl.isReady()) {
					//surrounding div tag for form <div class="sapUiIntegrationEditorForm"
					oRm.openStart("div");
					oRm.class("sapUiIntegrationEditorForm");
					if (oControl.getMode() !== "translation") {
						oRm.class("settingsButtonSpace");
					}
					oRm.openEnd();
					if (oControl.getMode() !== "translation") {
						oRm.renderControl(oControl.getAggregation("_messageStrip"));
					}
					var oItems = oControl.getAggregation("_formContent");
					//render items
					if (oItems) {
						var oPanel;
						var oSubGroup;
						var oLanguagePanel;
						var oLabelItemForNotWrapping;
						var oColFields = [];
						var oColFieldsOfSubGroup = [];
						var oOriginalField;
						var addColFields = function () {
							if (oColFields.length > 0) {
								var iLess = 2 - oColFields.length;
								for (var n = 0; n < iLess; n++) {
									oColFields.push(new VBox());
								}
								oPanel.addContent(new FlexBox({
									alignItems: "Start",
									justifyContent: "SpaceBetween",
									items: oColFields
								}));
								oColFields = [];
							}
						};
						var addColFieldsOfSubGroup = function () {
							if (oColFieldsOfSubGroup.length > 0) {
								var iLess = 2 - oColFieldsOfSubGroup.length;
								for (var n = 0; n < iLess; n++) {
									oColFieldsOfSubGroup.push(new VBox());
								}
								oSubGroup.addContent(new FlexBox({
									alignItems: "Start",
									justifyContent: "SpaceBetween",
									items: oColFieldsOfSubGroup
								}));
								oColFieldsOfSubGroup = [];
							}
						};
						var renderPanel = function (oPanel) {
							if (oPanel.getContent().length > 0) {
								var aContents = oPanel.getContent();
								if (aContents.length === 1 && aContents[0].isA("sap.m.MessageStrip")) {
									return;
								}
								if (aContents[0].isA("sap.m.MessageStrip")) {
									oPanel.removeContent(0);
									oPanel.addContent(aContents[0]);
								}
								oRm.renderControl(oPanel.getParent());
								if (oPanel._messageStrip) {
									oRm.renderControl(oPanel._messageStrip);
								}
							}
						};
						var addSubPanel = function (oPanel, oSubGroup) {
							if (oPanel && oSubGroup.getContent().length > 0) {
								var aContents = oSubGroup.getContent();
								if (aContents[0].isA("sap.m.MessageStrip")) {
									oSubGroup.removeContent(0);
									oSubGroup.addContent(aContents[0]);
								}
								oPanel.addContent(oSubGroup.getParent());
								if (oSubGroup._messageStrip) {
									oPanel.addContent(oSubGroup._messageStrip);
								}
							} else {
								oSubGroup = null;
							}
						};
						var addSubTab = function (oPanel, oSubGroup) {
							var oSubItems = oPanel.getContent(),
							oIconTabBar;
							if (oSubItems.length > 0) {
								for (var m = 0; m < oSubItems.length; m++) {
									if (oSubItems[m].getAggregation("_field") && oSubItems[m].getAggregation("_field").isA("sap.m.IconTabBar")) {
										oIconTabBar = oSubItems[m].getAggregation("_field");
									}
								}
							}
							if (oIconTabBar && oSubGroup.getContent().length > 0) {
								oIconTabBar.addItem(oSubGroup);
							}
						};
						for (var i = 0; i < oItems.length; i++) {
							var oItem = oItems[i];
							if (oControl.getMode() !== "translation") {
								if (oItem.isA("sap.ui.integration.editor.fields.GroupField")) {
									var oGroupControl = oItem.getAggregation("_field");
									if (!oGroupControl) {
										continue;
									}
									if (oSubGroup) {
										//add current col fields to previous sub panel, then empty the col fields list
										addColFieldsOfSubGroup();
										//add sub group to panel
										if (oGroupControl.isA("sap.m.Panel") && oSubGroup.isA("sap.m.Panel")) {
											addSubPanel(oPanel, oSubGroup);
										} else {
											addSubTab(oPanel, oSubGroup);
										}
									}
									var oItemLevel = 0;
									if (oGroupControl.isA("sap.m.Panel")) {
										oItemLevel = oGroupControl._level;
									} else if (oGroupControl.isA("sap.m.IconTabBar")) {
										oItemLevel = "1";
									}
									if (oItemLevel === "1") {
										if (oColFields.length > 0) {
											addColFields();
											// renderPanel(oPanel);
										}
										if (oGroupControl.isA("sap.m.IconTabBar")) {
											var subItems = oPanel.getContent(),
											    iconTabBarExist = false,
												nIconTabBar;
											if (subItems.length > 0) {
												for (var j = 0; j < subItems.length; j++) {
													if (subItems[j].getAggregation("_field") && subItems[j].getAggregation("_field").isA("sap.m.IconTabBar")) {
														iconTabBarExist = true;
														nIconTabBar = subItems[j].getAggregation("_field");
													}
												}
											}
											oSubGroup = oGroupControl.getItems()[0];
											oSubGroup._subItems = oSubGroup._subItems || [];
											if (!iconTabBarExist) {
												oGroupControl.removeItem(oGroupControl.getItems()[0]);
												if (oGroupControl._messageStrip) {
													oPanel.addContent(oGroupControl._messageStrip);
												}
												oGroupControl.addStyleClass("sapUiIntegrationEditorSubTab");
												oPanel.addContent(oItem);
											} else {
												//add the iconTabFilter into the existed iconTabBar
												nIconTabBar.addItem(oGroupControl.getItems()[0]);
												//remove the unnecessary iconTabBar
												oGroupControl.destroy();
											}
										} else {
											oSubGroup = oGroupControl;
											oSubGroup._subItems = oSubGroup._subItems || [];
										}
									} else {
										if (oPanel) {
											//add current col fields to previous panel, then empty the col fields list
											addColFields();
											//render previous panel
											renderPanel(oPanel);
											oSubGroup = null;
										}
										oPanel = oGroupControl;
										oPanel._subItems = oPanel._subItems || [];
										oPanel.addStyleClass("sapUiIntegrationEditorItem");
									}
									if (i === oItems.length - 1) {
										//add current col fields to panel, then empty the col fields list
										addColFields();
										renderPanel(oPanel);
									}
									continue;
								}
								// add style class for the hint under group and checkbox/toggle
								if (oItem.isA("sap.m.FormattedText")) {
									if (oSubGroup) {
										oSubGroup.addContent(oItem.addStyleClass("sapUiIntegrationEditorHint"));
									} else {
										oPanel.addContent(oItem.addStyleClass("sapUiIntegrationEditorHint"));
									}
									if (i === oItems.length - 1) {
										if (oSubGroup) {
											//add current col fields to previous sub panel, then empty the col fields list
											addColFieldsOfSubGroup();
											//add sub panel to panel
											addSubPanel(oPanel, oSubGroup);
										}
										//add current col fields to panel, then empty the col fields list
										addColFields();
										renderPanel(oPanel);
									}
									continue;
								}

								var oLayout = oItem._layout;
								if (oItem.isA("sap.m.Label")) {
									oItem.addStyleClass("sapUiIntegrationEditorItemLabel");
									if (oItem.getRequired()) {
										oItem.addStyleClass("sapUiIntegrationEditorItemLabelWithRequired");
									}
									if (oLayout && !deepEqual(oLayout, {})) {
										if (oLayout.alignment && oLayout.alignment.label === "end") {
											oItem.setTextAlign("End");
										}
										oLabelItemForNotWrapping = oItem;
									} else {
										//if cols === 1 and reach the col size, add the col fields to panel, then empty the col fields list
										//if cols === 2, add the col fields to panel, then empty the col fields list
										if (oItem._cols === 2) {
											if (oSubGroup) {
												addColFieldsOfSubGroup();
											} else {
												addColFields();
											}
										} else if (oColFieldsOfSubGroup.length === 2) {
											addColFieldsOfSubGroup();
										} else if (oColFields.length === 2) {
											addColFields();
										}
										if (oSubGroup) {
											oSubGroup.addContent(oItem);
										} else {
											oPanel.addContent(oItem);
										}
									}
								} else if (oItem.isA("sap.m.ToolbarSpacer")) {
									if (oItem._hasLine) {
										oItem.addStyleClass("sapUiIntegrationEditorSpacerWithLine");
									} else {
										oItem.addStyleClass("sapUiIntegrationEditorSpacerWithoutLine");
									}
									if (oSubGroup) {
										addColFieldsOfSubGroup();
										oSubGroup.addContent(oItem);
									} else {
										addColFields();
										oPanel.addContent(oItem);
									}
								} else {
									var oConfig = oItem.getConfiguration(),
										aInfoHBox = new HBox(),
										iInfoHBoxWidth = 0.1,
										iSettingsHBoxWidth = 0,
										oLabelHBox;
									if (oItem._descriptionIcon) {
										aInfoHBox.addItem(oItem._descriptionIcon);
										iInfoHBoxWidth += 0.9;
									}
									var oMessageIcon = Element.getElementById(oItem.getAssociation("_messageIcon"));
									if (oItem.getAssociation("_messageIcon") && oMessageIcon) {
										aInfoHBox.addItem(oMessageIcon);
										iInfoHBoxWidth += 1.2;
									}
									if (oItem._settingsButton) {
										oItem._settingsButton.addStyleClass("sapUiIntegrationEditorSettingsButton");
										iSettingsHBoxWidth = 2;
									}
									var oFlexItemDataForSettings = new FlexItemData({
										growFactor: 10,
										maxWidth: "calc(100% - " + iSettingsHBoxWidth + "rem)"
									});
									var oFlexItemDataForInfo = new FlexItemData({
										maxWidth: "calc(100% - " + iInfoHBoxWidth + "rem)"
									});
									if (oLabelItemForNotWrapping) {
										var oHBox,
											oFlexBox,
											sLabelWidth = "50%";
										if (oLayout && oLayout["label-width"]) {
											sLabelWidth = oLayout["label-width"];
										}
										var iLabelWidth = parseInt(sLabelWidth);
										var iFieldWidth = 100 - iLabelWidth;
										if (oItem._cols === 2) {
											iLabelWidth = iLabelWidth - 0.5;
											iFieldWidth = iFieldWidth - 0.5;
										}

										if (oLayout.alignment && oLayout.alignment.field === "end") {
											oItem.addStyleClass("sapUiIntegrationEditorFieldAlignEnd");
										}
										if (oLayout.alignment && oLayout.alignment.label === "end") {
											oLabelItemForNotWrapping.setLayoutData(new FlexItemData({
												maxWidth: "calc(100% - " + iInfoHBoxWidth + "rem)",
												minWidth: "calc(100% - " + iInfoHBoxWidth + "rem)"
											}));
										} else {
											oLabelItemForNotWrapping.setLayoutData(oFlexItemDataForInfo);
										}
										if (aInfoHBox.getItems().length > 0) {
											oLabelItemForNotWrapping.addStyleClass("sapUiIntegrationEditorItemLabelWithInfo");
											oLabelHBox = new HBox({
												items: [
													oLabelItemForNotWrapping,
													aInfoHBox
												]
											});
										} else {
											oLabelHBox = oLabelItemForNotWrapping;
										}
										if (oLayout && oLayout.position && oLayout.position === "field-label") {
											oLabelHBox.setLayoutData(oFlexItemDataForSettings);
											oFlexBox = new HBox({
												alignItems: "Start",
												justifyContent: "SpaceBetween",
												items: [
													oLabelHBox,
													oItem._settingsButton
												]
											});
											oFlexBox.setLayoutData(new FlexItemData({
												growFactor: iLabelWidth,
												maxWidth: iLabelWidth + "%"
											}));
											oItem.setLayoutData(new FlexItemData({
												growFactor: iFieldWidth,
												maxWidth: iFieldWidth + "%"
											}));
											oHBox = new HBox({
												alignItems: "Start",
												justifyContent: "SpaceBetween",
												items: [
													oItem,
													oFlexBox
												]
											});
										} else {
											oItem.setLayoutData(oFlexItemDataForSettings);
											oFlexBox = new HBox({
												alignItems: "Start",
												justifyContent: "SpaceBetween",
												items: [
													oItem,
													oItem._settingsButton
												]
											});
											oLabelHBox.setLayoutData(new FlexItemData({
												growFactor: iLabelWidth,
												maxWidth: iLabelWidth + "%"
											}));
											oFlexBox.setLayoutData(new FlexItemData({
												growFactor: iFieldWidth,
												maxWidth: iFieldWidth + "%"
											}));
											oHBox = new HBox({
												alignItems: "Start",
												justifyContent: "SpaceBetween",
												items: [
													oLabelHBox,
													oFlexBox
												]
											});
										}
										//render label and field for NotWrapping parameter
										if (oItem._cols === 1) {
											if (oSubGroup) {
												if (oColFieldsOfSubGroup.length === 2) {
													addColFieldsOfSubGroup();
												}
												if (oConfig.hint) {
													var oHint = oControl._createHint(oConfig.hint, oItem.getParameterId());
													var oColVBox = new VBox({
														items: [
															oHBox,
															oHint.addStyleClass("sapUiIntegrationEditorHint")
														]
													});
													oColVBox.addStyleClass("col1");
													oColFieldsOfSubGroup.push(oColVBox);
												} else {
													oHBox.addStyleClass("col1");
													oColFieldsOfSubGroup.push(oHBox);
												}
											} else {
												if (oColFields.length === 2) {
													addColFields();
												}
												if (oConfig.hint) {
													var oHint = oControl._createHint(oConfig.hint, oItem.getParameterId());
													var oColVBox = new VBox({
														items: [
															oHBox,
															oHint.addStyleClass("sapUiIntegrationEditorHint")
														]
													});
													oColVBox.addStyleClass("col1");
													oColFields.push(oColVBox);
												} else {
													oHBox.addStyleClass("col1");
													oColFields.push(oHBox);
												}
											}
										} else if (oSubGroup) {
											addColFieldsOfSubGroup();
											oSubGroup.addContent(oHBox);
										} else {
											addColFields();
											oPanel.addContent(oHBox);
										}
										oLabelItemForNotWrapping = null;
									} else {
										var oLabel;
										if (oSubGroup) {
											oLabel = oSubGroup.getContent().pop();
										} else {
											oLabel = oPanel.getContent().pop();
										}
										oLabel.setLayoutData(oFlexItemDataForInfo);
										if (aInfoHBox.getItems().length > 0) {
											oLabel.addStyleClass("sapUiIntegrationEditorItemLabelWithInfo");
											oLabelHBox = new HBox({
												items: [
													oLabel,
													aInfoHBox
												]
											});
										} else {
											oLabelHBox = oLabel;
										}
										oLabelHBox.setLayoutData(oFlexItemDataForSettings);
										var oLabelFlexBox = new FlexBox({
											alignItems: "Start",
											justifyContent: "SpaceBetween",
											items: [
												oLabelHBox,
												oItem._settingsButton
											]
										});
										if (oItem._cols === 1) {
											var oColVBox = new VBox({
												items: [
													oLabelFlexBox,
													oItem
												]
											});
											if (oConfig.hint) {
												var oHint = oControl._createHint(oConfig.hint, oItem.getParameterId());
												oColVBox.addItem(oHint.addStyleClass("sapUiIntegrationEditorHint"));
											}
											oColVBox.addStyleClass("col1");
											if (oSubGroup) {
												oColFieldsOfSubGroup.push(oColVBox);
											} else {
												oColFields.push(oColVBox);
											}
										} else if (oSubGroup) {
											oSubGroup.addContent(oLabelFlexBox);
											oSubGroup.addContent(oItem);
										} else {
											oPanel.addContent(oLabelFlexBox);
											oPanel.addContent(oItem);
										}
									}
									if (oSubGroup) {
										oSubGroup._subItems.push({
											"settingspath": oItem.getConfiguration()._settingspath,
											"itemId": oItem.getId()
										});
									}
									oPanel._subItems.push({
										"settingspath": oItem.getConfiguration()._settingspath,
										"itemId": oItem.getId()
									});
								}
								if (i === oItems.length - 1) {
									if (oSubGroup) {
										//add current col fields to previous sub panel, then empty the col fields list
										addColFieldsOfSubGroup();
										//add sub panel to panel
										if (oSubGroup.isA("sap.m.Panel")) {
											addSubPanel(oPanel, oSubGroup);
										} else {
											addSubTab(oPanel, oSubGroup);
										}
									}
									//add current col fields to panel, then empty the col fields list
									addColFields();
									renderPanel(oPanel);
								}
							} else {
								if (i === 0) {
									//render the top panel field of translation
									oLanguagePanel = oItem.getAggregation("_field");
									oRm.renderControl(oItem);
									oItem.addStyleClass("sapUiIntegrationEditorTranslationPanel");
									continue;
								}
								if (oItem.isA("sap.ui.integration.editor.fields.GroupField")) {
									var oGroupControl = oItem.getAggregation("_field");
									if (oSubGroup) {
										//add sub panel to panel
										if (oGroupControl.isA("sap.m.Panel") && oSubGroup.isA("sap.m.Panel")) {
											addSubPanel(oPanel, oSubGroup);
										} else {
											addSubTab(oPanel, oSubGroup);
										}
									}
									var tItemLevel = 0;
									if (oGroupControl.isA("sap.m.Panel")) {
										tItemLevel = oGroupControl._level;
									} else if (oGroupControl.isA("sap.m.IconTabBar")) {
										if (oGroupControl.getItems().length > 0 && oGroupControl.getItems()[0]._level) {
											tItemLevel = oGroupControl.getItems()[0]._level;
										}
									}
									if (tItemLevel === "1") {
										if (oGroupControl.isA("sap.m.IconTabBar")) {
											if (i !== oItems.length - 1 || (i < oItems.length && (oItems[i].isA("sap.m.IconTabBar") || oItems[i].isA("sap.m.Panel")))) {
												var tSubItems = oPanel.getContent(),
											    tIconTabBarExist = false;
												if (tSubItems.length > 0) {
													for (var l = 0; l < tSubItems.length; l++) {
														if (tSubItems[l].getAggregation("_field") && tSubItems[l].getAggregation("_field").isA("sap.m.IconTabBar")) {
															tIconTabBarExist = true;
														}
													}
												}
												if (!tIconTabBarExist) {
													oSubGroup = oGroupControl.getItems()[0];
													oGroupControl.removeItem(oGroupControl.getItems()[0]);
													oPanel.addContent(oGroupControl.getParent());
												} else {
													oSubGroup = oGroupControl.getItems()[0];
												}
											}
										} else {
											oSubGroup = oGroupControl;
										}
									} else {
										oSubGroup = null;
										//add sub panel if it has content into top panel
										if (oPanel && oPanel.getContent().length > 0) {
											oLanguagePanel.addContent(oPanel.getParent());
										}
										oPanel = oGroupControl;
									}
									if (i === oItems.length - 1) {
										//add current col fields to panel, then empty the col fields list
										addColFields();
										renderPanel(oPanel);
									}
									continue;
								}
								if (oItem.isA("sap.m.ToolbarSpacer")) {
									continue;
								}
								if (oItem.isA("sap.m.FormattedText")) {
									continue;
								}
								if (oItem.isA("sap.m.Label")) {
									if (oSubGroup) {
										oSubGroup.addContent(oItem);
									} else {
										oPanel.addContent(oItem);
									}
									continue;
								}
								//oItem.addStyleClass("language");
								if (oItem.isOrigLangField) {
									oOriginalField = oItem;
									continue;
								}
								oOriginalField.addStyleClass("sapUiIntegrationFieldTranslationText");
								//bind originalField and translation field together
								var oHBox = new HBox({
									items: [
										oOriginalField,
										oItem
									]
								}).addStyleClass("notWrappingRow");
								if (oSubGroup) {
									oSubGroup.addContent(oHBox);
								} else {
									oPanel.addContent(oHBox);
								}
								if (i === oItems.length - 1) {
									if (oSubGroup) {
										//add sub panel to panel
										if (oSubGroup.isA("sap.m.Panel")) {
											addSubPanel(oPanel, oSubGroup);
										} else {
											addSubTab(oPanel, oSubGroup);
										}
									}
									oLanguagePanel.addContent(oPanel.getParent());
								}
							}
						}
					}
					oRm.close("div");
					//render the additional content if alignment of it is "right"
					if (bShowPreview && sPreviewPosition === "right") {
						oRm.renderControl(oPreview);
					}
				}
				oRm.close("div");
				if (bShowPreview && (sPreviewPosition === "top" || sPreviewPosition === "bottom")) {
					//render the additional content if alignment of it is "bottom"
					if (sPreviewPosition === "bottom") {
						oRm.renderControl(oPreview);
					}
					oRm.close("div");
				}
			}
		}
	});

	/**
		 * Init of the editor
		 */
	Editor.prototype.init = function () {
		if (Editor.oResourceBundle && Editor.oResourceBundle.sLocale !== Utils._language) {
			Editor.oResourceBundle = Library.getResourceBundleFor("sap.ui.integration", Utils._language);
			this._applyLanguageChange();
		}
		this._ready = false;
		this._aFieldReadyPromise = [];
		this._oResourceBundle = Library.getResourceBundleFor("sap.ui.integration", Utils._language);
		this._appliedLayerManifestChanges = [];
		this._currentLayerManifestChanges = {};
		this._mDestinationDataProviders = {};
		var oMessageStrip = new MessageStrip(this.getId() + MessageStripId, {
			showIcon: false
		});
		oMessageStrip.addStyleClass("sapUiIntegrationEditorFieldMessageStrip");
		this.setAggregation("_messageStrip", oMessageStrip);
		MessageStripId = oMessageStrip.getId();
		this.setLanguage(Localization.getLanguage());
		/**
		 * Facade of the {@link sap.ui.integration.editor.Editor} control.
		 * @interface
		 * @name sap.ui.integration.editor.EditorFacade
		 * @experimental since 1.94
		 * @public
		 * @author SAP SE
		 * @version ${version}
		 * @borrows sap.ui.integration.editor.Editor#getParameters as getParameters
		 * @borrows sap.ui.integration.editor.Editor#resolveDestination as resolveDestination
		 * @borrows sap.ui.integration.editor.Editor#request as request
		 * @borrows sap.ui.integration.editor.Editor#getModel as getModel
		 */
		 this._oLimitedInterface = new Interface(this, [
			"getParameters",
			"resolveDestination",
			"request",
			"getModel"
		]);
	};

	Editor.prototype.getParameters = function () {
		if (!this._isManifestReady) {
			Log.error("The manifest is not ready. Consider using the 'manifestReady' event.", "sap.ui.integration.editor.Editor");
			return null;
		}

		var oParams = this._oEditorManifest.getProcessedParameters(),
			oResultParams = {},
			sKey;

		for (sKey in oParams) {
			oResultParams[sKey] = oParams[sKey].value;
		}

		return oResultParams;
	};

	Editor.prototype.resolveDestination = function (sKey) {
		return this._oDestinations.getUrl(sKey);
	};

	/**
	 * Returns whether the editor is ready to be used
	 */
	Editor.prototype.isReady = function () {
		return this._ready;
	};

	Editor.prototype.hasPreview = function() {
		var oPreview = this.getAggregation("_preview");
		if (oPreview && oPreview.visible !== false) {
			return true;
		}
		return false;
	};

	Editor.prototype.getSeparatePreview = function() {
		var sPreviewPosition = this.getPreviewPosition();
		if (!this.isReady() || sPreviewPosition !== "separate") {
			return null;
		}
		if (!this._oPreview) {
			this._oPreview = this.getAggregation("_preview");
		}
		return this._oPreview;
	};

	Editor.prototype.flattenData = function(oData, s, a, path) {
		path = path || "";
		a = a || [];
		if (typeof oData === "object") {
			if (!oData[s]) {
				for (var n in oData) {
					this.flattenData(oData[n], s, a, path + "/" + n);
				}
			} else {
				//found leave
				if (oData.type) {
					a.push({
						path: oData.pathvalue || path.substring(1),
						value: oData.pathvalue || "{context>" + path.substring(1) + "/value}",
						object: oData
					});
				} else {
					a.push({
						path: path.substring(1),
						object: oData
					});
					for (var n in oData) {
						this.flattenData(oData[n], s, a, path + "/" + n);
					}
				}
			}
		}
		return a;
	};

	Editor.prototype.setJson = function (vIdOrSettings, bSuppress) {
		this._ready = false;
		if (deepEqual(vIdOrSettings, this._preIdOrSettings)) {
			return this;
		}
		this._preIdOrSettings = deepClone(vIdOrSettings, 500);
		if (typeof vIdOrSettings === "string") {
			try {
				vIdOrSettings = JSON.parse(vIdOrSettings);
			} catch (ex) {
				//not json
			}
		}
		if (typeof vIdOrSettings === "object") {
			if (vIdOrSettings.manifestChanges) {
				//map translations of unmatch languages
				Utils.mapLanguagesInManifestChanges(vIdOrSettings.manifestChanges);
				//remove the changes from the current layer
				this._filterManifestChangesByLayer(vIdOrSettings);
			}
			if (this._manifestModel) {
				//already created
				return;
			}
			if (this._oDesigntimeInstance) {
				this._oDesigntimeInstance.destroy();
			}
			if (vIdOrSettings.host) {
				this.setProperty("host", vIdOrSettings.host);
			}
			if (vIdOrSettings.baseUrl) {
				this.setProperty("baseUrl", vIdOrSettings.baseUrl);
			}
			this._appliedLayerManifestChanges = vIdOrSettings.manifestChanges;

			this.createManifest(vIdOrSettings, bSuppress);
		}
	};

	Editor.prototype.createManifest = function (vIdOrSettings, bSuppress) {
		var sBaseUrl = this.getBaseUrl();
		var mOptions = {},
			vManifest = vIdOrSettings.manifest;
		this._isManifestReady = false;

		if (typeof vManifest === "string") {
			mOptions.manifestUrl = vManifest;
			vManifest = null;
		}

		if (this._oEditorManifest) {
			this._oEditorManifest.destroy();
		}
		this.destroyAggregation("_extension");
		var iCurrentModeIndex = Merger.layers[this.getMode()];

		this._oEditorManifest = new EditorManifest(this.getSection(), vManifest, sBaseUrl, vIdOrSettings.manifestChanges);
		this._oEditorManifest
			.load(mOptions)
			.then(function () {
				this._registerManifestModulePath();
				this._oInitialManifestModel = new JSONModel(this._oEditorManifest._oInitialJson);
				this.setProperty("json", this._oEditorManifest._oInitialJson, bSuppress);
				var oManifestJson = this._oEditorManifest.oJson;
				var _beforeCurrentLayer = merge({}, oManifestJson);
				this._beforeManifestModel = new JSONModel(_beforeCurrentLayer);
				if (iCurrentModeIndex < Merger.layers["translation"] && this._currentLayerManifestChanges) {
					//merge if not translation
					oManifestJson = Merger.mergeDelta(oManifestJson, [this._currentLayerManifestChanges], this.getSection());
				}
				//create a manifest model after the changes are merged
				this._manifestModel = new JSONModel(oManifestJson);
				this._isManifestReady = true;
				this.fireManifestReady();
				this._initResourceBundlesForMultiTranslation();
				//use the translations
				this._loadDefaultTranslations();
				//add a context model
				this._createContextModel();
				if (this._oEditorManifest.getResourceBundle()) {
					this._enhanceI18nModel(this._oEditorManifest.getResourceBundle());
				}
				return this._loadExtension().then(function() {
					this._initInternal();
				}.bind(this));
			}.bind(this));
	};

	/**
	 * Init the Resource Bundles for Multi Translation
	 */
	Editor.prototype._initResourceBundlesForMultiTranslation = function () {
		var vI18n = this._oEditorManifest.get("/sap.app/i18n");
		var sResourceBundleURL;
		var aSupportedLocales;
		if (typeof vI18n === "string") {
			sResourceBundleURL = this.getBaseUrl() + vI18n;
		} else if (typeof vI18n === "object") {
			if (vI18n.bundleUrl) {
				sResourceBundleURL = this.getBaseUrl() + vI18n.bundleUrl;
			}
			if (vI18n.supportedLocales) {
				aSupportedLocales = vI18n.supportedLocales;
			}
		}
		this._oEditorResourceBundles = new EditorResourceBundles({
			url: sResourceBundleURL,
			languages: Editor._oLanguages,
			supportedLocales: aSupportedLocales
		});
	};

	/**
	 * Registers the manifest ID as a module path.
	 */
	Editor.prototype._registerManifestModulePath = function () {
		if (!this._oEditorManifest) {
			return;
		}
		this._sAppId = this._oEditorManifest.get("/sap.app/id");
		if (this._sAppId) {
			LoaderExtensions.registerResourcePath(this._sAppId.replace(/\./g, "/"), this._oEditorManifest.getUrl() || "/");
		} else {
			Log.error("sap.app/id entry in the manifest is mandatory");
		}
	};

	Editor.prototype._loadDefaultTranslations = function () {
		if (this._defaultTranslationsLoaded) {
			return;
		}

		var oResourceModel = new ResourceModel({
			bundle: this._oResourceBundle
		});

		this.setModel(oResourceModel, "i18n");
		this._defaultTranslationsLoaded = true;
	};

	Editor.prototype._enhanceI18nModel = function (oResourceBundle) {
		var oResourceModel = this.getModel("i18n");
		if (oResourceModel.getResourceBundle().oUrlInfo.url !== oResourceBundle.oUrlInfo.url) {
			oResourceModel.enhance(oResourceBundle);
			this._oResourceBundle = oResourceModel.getResourceBundle();
		}
	};

	Editor.prototype._loadExtension = function () {
		var sExtensionPath = this._oEditorManifest.get(this.getConfigurationPath() + "/extension") || this._oEditorManifest.get("/" + this.getSection() + "/extension"),
			sFullExtensionPath;
		if (!sExtensionPath) {
			Log.info("Extension is not defined in manifest, do not load it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}

		if (sExtensionPath.startsWith(MODULE_PREFIX)) {
			sFullExtensionPath = sExtensionPath.replace(MODULE_PREFIX, "");
		} else {
			sFullExtensionPath = this._sAppId.replace(/\./g, "/") + "/" + sExtensionPath;
		}

		return new Promise(function (resolve, reject) {
			sap.ui.require([sFullExtensionPath], function (ExtensionSubclass) {
				var oExtension = new ExtensionSubclass();
				if (oExtension._setEditor) {
					oExtension._setEditor(this, this._oLimitedInterface);
					this.setAggregation("_extension", oExtension); // the framework validates that the subclass extends "sap.ui.integration.Extension"
				}
				resolve();
			}.bind(this), function (vErr) {
				Log.error("Failed to load " + sExtensionPath + ". Check if the path is correct. Reason: " + vErr);
				reject(vErr);
			});
		}.bind(this));
	};

	/**
	 * Performs an HTTP request using the given configuration.
	 *
	 * @public
	 * @experimental since 1.94
	 * @param {object} oConfiguration The configuration of the request.
	 * @param {string} oConfiguration.URL The URL of the resource.
	 * @param {string} [oConfiguration.mode="cors"] The mode of the request. Possible values are "cors", "no-cors", "same-origin".
	 * @param {string} [oConfiguration.method="GET"] The HTTP method. Possible values are "GET", "POST".
	 * @param {Object} [oConfiguration.parameters] The request parameters. If the method is "POST" the parameters will be put as key/value pairs into the body of the request.
	 * @param {Object} [oConfiguration.dataType="json"] The expected Content-Type of the response. Possible values are "xml", "json", "text", "script", "html", "jsonp". Note: Complex Binding is not supported when a dataType is provided. Serialization of the response to an object is up to the developer.
	 * @param {Object} [oConfiguration.headers] The HTTP headers of the request.
	 * @param {boolean} [oConfiguration.withCredentials=false] Indicates whether cross-site requests should be made using credentials.
	 * @returns {Promise} Resolves when the request is successful, rejects otherwise.
	 */
	 Editor.prototype.request = function (oConfiguration) {
		return this._oDataProviderFactory
			.create({ request: oConfiguration })
			.setAllowCustomDataType(true)
			.getData();
	};

	Editor.prototype.initDestinations = function (vHost) {
		this._destinationsModel = new JSONModel({});
		this.setModel(this._destinationsModel, "destinations");
		var oHostInstance = this.getHostInstance();

		if (vHost && !oHostInstance) {
			Log.error(
				"Host with id '" + vHost + "' is not available during editor initialization. It must be available for host specific features to work.",
				"Make sure that the host already exists, before assigning it to the editor.",
				"sap.ui.integration.editor.Editor"
			);
		}

		if (this._oDestinations) {
			this._oDestinations.setHost(oHostInstance);
		} else {
			var sConfigurationPath = this.getConfigurationPath();
			this._oDestinations = new Destinations({
				host: oHostInstance,
				manifestConfig: this._manifestModel.getProperty(sConfigurationPath + "/destinations")
			});
		}
	};

	Editor.prototype.initDataProviderFactory = function () {
		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.destroy();
		}
		var oExtension = this.getAggregation("_extension");
		this._oDataProviderFactory = new DataProviderFactory({
			destinations: this._oDestinations,
			extension: oExtension,
			editor: this
		});
	};

	/**
	 * Resolves the given URL relatively to the manifest base path.
	 * Absolute paths are not changed.
	 *
	 * @example
	 * oEditor.getRuntimeUrl("images/Avatar.png") === "sample/card/images/Avatar.png"
	 * oEditor.getRuntimeUrl("http://www.someurl.com/Avatar.png") === "http://www.someurl.com/Avatar.png"
	 * oEditor.getRuntimeUrl("https://www.someurl.com/Avatar.png") === "https://www.someurl.com/Avatar.png"
	 *
	 * @ui5-restricted
	 * @param {string} sUrl The URL to resolve.
	 * @returns {string} The resolved URL.
	 */
	 Editor.prototype.getRuntimeUrl = function (sUrl) {
		var sAppId = this._sAppId,
			sAppName,
			sSanitizedUrl = sUrl && sUrl.trim().replace(/^\//, "");

		if (sAppId === null) {
			Log.error("The manifest is not ready so the URL can not be resolved. Consider using the 'manifestReady' event.", "sap.ui.integration.editor.Editor");
			return null;
		}

		if (!sAppId ||
			sUrl.startsWith("http://") ||
			sUrl.startsWith("https://") ||
			sUrl.startsWith("//")) {
			return sUrl;
		}

		sAppName = sAppId.replace(/\./g, "/");

		// do not use sap.ui.require.toUrl(sAppName + "/" + sSanitizedUrl)
		// because it doesn't work when the sSanitizedUrl starts with ".."
		return sap.ui.require.toUrl(sAppName) + "/" + sSanitizedUrl;
	};

	/**
	 * @private
	 * @ui5-restricted
	 * @returns {object} Local binding functions for this Editor
	 */
	 Editor.prototype.getBindingNamespaces = function () {
		var mNamespaces = {},
			oExtension = this.getAggregation("_extension");

		if (oExtension) {
			mNamespaces.extension = {
				formatters: oExtension.getFormatters()
			};
		}

		return mNamespaces;
	};

	/**
	 * Gets the instance of the <code>host</code> association.
	 *
	 * @public
	 * @experimental Since 1.77
	 * @returns {sap.ui.integration.Host} The host object associated with this editor.
	 */
	Editor.prototype.getHostInstance = function () {
		var sHost = this.getHost();
		if (!sHost) {
			return null;
		}
		return Element.getElementById(sHost);
	};

	/**
	 * Sets the language of the editor
	 *
	 * @param {string} sValue the language in the format language_region or language-region
	 * @param {*} bSuppress suppress rerendering of the editor
	 */
	Editor.prototype.setLanguage = function (sValue, bSuppress) {
		//unify the language-region to language_region
		if (!sValue || typeof sValue !== "string") {
			return this;
		}
		this._language = sValue.replaceAll('_', '-');
		if (this.getLanguage() != sValue) {
			//reload resource bundler if language changed
			this._loadDefaultTranslations();
		}
		this.setProperty("language", sValue, bSuppress);
		if (!Editor._oLanguages[this._language]) {
			this._language = this._language.split("-")[0];
		}
		if (!Editor._oLanguages[this._language]) {
			Log.warning("The language: " + sValue + " is currently unknown, some UI controls might show " + sValue + " instead of the language name.");
		}
		return this;
	};
	/**
	 * Increases the zIndex to a higher value for all popups
	 */
	Editor.prototype.onAfterRendering = function () {
		if (this.getDomRef()) {
			this._iZIndex = getHigherZIndex(this.getDomRef());
			Popup.setInitialZIndex(this._iZIndex);
		}
	};
	/**
		 * Filters the manifestChanges array in the oManifestSettings
		 * All changes that are done for layers > than current layer are removed (see also layers)
		 * The current layers changes are stored in this._currentLayerManifestChanges to be applied later in the editor code.
		 * All changes that are done for layers < that the current layer are kept in oManifestSettings.manifestChanges
		 *
		 * @param {*} oManifestSettings
		 */
	 Editor.prototype._filterManifestChangesByLayer = function (oManifestSettings) {
		var aChanges = [],
			that = this,
			oBeforeLayerChanges = {},
			oCurrentLayerChanges = { ":layer": Merger.layers[this.getMode()] },
			iCurrentModeIndex = Merger.layers[that.getMode()];
		oManifestSettings.manifestChanges.forEach(function (oChange) {
			//filter manifest changes. only the changes before the current layer are needed
			//editor will merge the last layer locally to allow "reset" or properties
			//also for translation layer, the "original" value is needed
			var iLayer = oChange.hasOwnProperty(":layer") ? oChange[":layer"] : 1000;
			if (iLayer === Merger.layers["translation"]) {
				var sLanguage = that._language;
				if (sLanguage === "") {
					sLanguage = Localization.getLanguage().replaceAll('_', '-');
				}
				var oTranslationChange = {
					"texts": {}
				};
				// delete the error texts property
				delete oChange.texts;
				oTranslationChange.texts[sLanguage] = {};
				Object.keys(oChange).forEach(function (s) {
					if (s.charAt(0) === "/") {
						oTranslationChange.texts[sLanguage][s] = oChange[s];
					} else {
						oTranslationChange[s] = oChange[s];
					}
				});
				oChange = oTranslationChange;
			}
			if (iLayer < iCurrentModeIndex) {
				aChanges.push(oChange);
				oBeforeLayerChanges = merge(oBeforeLayerChanges, oChange);
			} else if (iLayer === iCurrentModeIndex) {
				//store the current layer changes locally for later processing
				oCurrentLayerChanges = oChange;
			}
		});
		oManifestSettings.manifestChanges = aChanges;
		this._currentLayerManifestChanges = oCurrentLayerChanges;
		this._beforeLayerManifestChanges = oBeforeLayerChanges;
	};
	/**
	 * Initializes the editor after the json is set
	 */
	Editor.prototype._initInternal = function () {
		var that = this;
		//handle keyword designtime removal
		var sConfigurationPath = that.getConfigurationPath();
		var sDesigntime = that._oEditorManifest.get(sConfigurationPath + "/editor");
		if (!sDesigntime) {
			sDesigntime = that._oEditorManifest.get("/" + that.getSection() + "/designtime");
		}
		//load the designtime control and bundles lazy
		var	oConfiguration = that._manifestModel.getProperty(sConfigurationPath),
			oPromise,
			oDesigntimeConfig = that.getDesigntime();
		if (oDesigntimeConfig) {
			if (typeof oDesigntimeConfig === "function") {
				oPromise = new Promise(function (resolve, reject) {
					var oDesigntimeInstance = new oDesigntimeConfig();
					that._applyDesigntimeDefaults(oDesigntimeInstance.getSettings());
					resolve(oDesigntimeInstance);
				});
			} else if (typeof oDesigntimeConfig === "object") {
				oPromise = new Promise(function (resolve, reject) {
					sap.ui.require(["sap/ui/integration/Designtime"], function (Designtime) {
						var AdvancedDesigntime = Designtime.extend("test.Designtime");
						AdvancedDesigntime.prototype.create = function () {
							return oDesigntimeConfig;
						};
						var oDesigntime = new AdvancedDesigntime();
						that._applyDesigntimeDefaults(oDesigntime.getSettings());
						resolve(oDesigntime);
					});
				});
			}
		} else if (sDesigntime) {
			//load designtime from module
			oPromise = that.loadDesigntime().then(function (oDesigntime) {
				that._applyDesigntimeDefaults(oDesigntime.getSettings());
				return oDesigntime;
			});
		} else {
			//stay compatible and create designtime configuration based on parameters/destinations
			oPromise = Promise.resolve(that._createParameterDesigntime(oConfiguration));
		}
		oPromise.then(function (oDesigntime) {
			that._oDesigntimeInstance = oDesigntime;
			that.initDestinations();
			that.initDataProviderFactory();
			if (that.getMode() === "admin" || that.getMode() === "all") {
				//always add destination settings for admin and all modes
				that._addDestinationSettings(oConfiguration);
			} else {
				//delete destination settings in dt for other modes
				that._deleleDestinationSettings();
			}
			//create a settings model
			that._settingsModel = new JSONModel(that._oDesigntimeInstance.getSettings());
			that.setModel(that._settingsModel, "currentSettings");
			that.setModel(that._settingsModel, "items");
			return that._loadValueContextInDesigntime();
		}).then(function () {
			that._applyDesigntimeLayers(); //changes done from admin to content on the dt values
			return that._requestExtensionData();
		}).then(function () {
			that._requireFields().then(function () {
				that._startEditor();
			});
		});
	};

	Editor.prototype.loadDesigntime = function () {
		if (this._oDesigntime) {
			return Promise.resolve(this._oDesigntime);
		}

		if (!this._oEditorManifest) {
			return new Promise(function (resolve, reject) {
				this.attachManifestReady(function () {
					this.loadDesigntime().then(resolve, reject);
				}.bind(this));
			}.bind(this));
		}

		if (!this._sAppId) {
			return Promise.reject("App id not maintained");
		}

		return new Promise(function (resolve, reject) {
			//build the module path to load as part of the widgets module path
			//handle keyword designtime removal
			var sDesigntimePath = this._oEditorManifest.get(this.getConfigurationPath() + "/editor");
			if (!sDesigntimePath) {
				sDesigntimePath = this._oEditorManifest.get("/" + this.getSection() + "/designtime");
			}
			var	sFullDesigntimePath = this._sAppId.replace(/\./g, "/") + "/" + sDesigntimePath;
			if (sFullDesigntimePath) {
				sap.ui.require([sFullDesigntimePath], function (oDesigntime) {
					//successfully loaded
					oDesigntime = new oDesigntime();
					oDesigntime._readyPromise(this._oLimitedInterface, this).then(function () {
						this._oDesigntime = oDesigntime;
						resolve(oDesigntime);
					}.bind(this));
				}.bind(this), function () {
					//error
					reject({
						error: sFullDesigntimePath + " not found"
					});
				});
			} else {
				reject();
			}
		}.bind(this));
	};

	Editor.prototype.getConfigurationPath = function() {
		return "/" + this.getSection() + "/configuration";
	};

	/**
	 * Returns the current settings as a json with a manifest path and the current value
	 * additionally there is a layer number added as ":layer"
	 */
	Editor.prototype.getCurrentSettings = function () {
		var oSettings = this._settingsModel.getProperty("/"),
			mResult = {},
			mNext;
		if (oSettings && oSettings.form && oSettings.form.items) {
			for (var n in oSettings.form.items) {
				var oItem = oSettings.form.items[n];
				if (oItem.editable && oItem.visible) {
					if (this.getMode() !== "translation") {
						if (oItem.translatable && !oItem._changed && oItem._translatedPlaceholder && !this._currentLayerManifestChanges[oItem.manifestpath]) {
							//do not save a value that was not changed and comes from a translated default value
							//mResult[oItem.manifestpath] = oItem._translatedPlaceholder;
							//but we need to save the setting changes for the next layer, so remove the continue sentence.
							//continue;
						} else {
							if (oItem.valueItems) {
								mResult[oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueItems"] = oItem.valueItems;
							}
							if (oItem.valueTokens) {
								mResult[oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueTokens"] = oItem.valueTokens;
							}
							switch (oItem.type) {
								case "string":
									if (!oItem.translatable) {
										mResult[oItem.manifestpath] = oItem.value;
									} else if (oItem._hasDynamicValue) {
										// if value is dynamic value of a translatable parameter, save it and delete all the current translations
										mResult[oItem.manifestpath] = oItem.value;
										this.deleteAllTranslationValuesInTexts(oItem.manifestpath);
									} else if (oItem._beforeValue && (oItem._beforeValue.indexOf("{context>") === 0 || oItem._beforeValue.indexOf("{{parameters") === 0)) {
										// if before value is dynamic value of a translatable parameter, save it
										mResult[oItem.manifestpath] = oItem.value;
									}
									break;
								case "group":
									break;
								case "object":
									if (oItem.value && oItem.value !== "" && typeof oItem.value === "object") {
										mResult[oItem.manifestpath] = oItem.value;
									}
									break;
								case "object[]":
									if (Array.isArray(oItem.value)) {
										var aValue = deepClone(oItem.value, 500);
										// sort the value list according by the position value
										aValue = aValue.sort(function (a, b) {
											// if _position property not exists, do nothing
											if (!a._dt || !a._dt._position || !b._dt || !b._dt._position) {
												return 0;
											}
											return a._dt._position - b._dt._position;
										});
										// recount the position value
										for (var i = 0; i < aValue.length; i++) {
											var oValue = aValue[i];
											oValue._dt = oValue._dt || {};
											oValue._dt._position = i + 1;
										}
										mResult[oItem.manifestpath] = aValue;
									}
									break;
								default:
									mResult[oItem.manifestpath] = oItem.value;
							}
						}
					} else if (oItem.translatable && oItem.value) {
						//in translation mode create an entry if there is a value
						mResult[oItem.manifestpath] = oItem.value;
					}
					if (oItem._next && (this.getAllowSettings())) {
						if (oItem.type === "destination") {
							if (oItem._next.pageAdminNewDestinationParameter) {
								mNext = mNext || {};
								mNext[oItem._settingspath + "/pageAdminNewDestinationParameter"] = oItem._next.pageAdminNewDestinationParameter;
							}
						} else {
							var bVisibleDefault = typeof (oItem.visibleToUser) === "undefined" ? true : oItem.visibleToUser;
							var bEditableDefault = typeof (oItem.editableToUser) === "undefined" ? true : oItem.editableToUser;
							var bAllowDynamicValuesDefault = typeof (oItem.allowDynamicValues) === "undefined" ? true : oItem.allowDynamicValues;
							if (oItem._next.visible === !bVisibleDefault) {
								mNext = mNext || {};
								mNext[oItem._settingspath + "/visible"] = oItem._next.visible;
							}
							if (oItem._next.editable === !bEditableDefault) {
								mNext = mNext || {};
								mNext[oItem._settingspath + "/editable"] = oItem._next.editable;
							}
							if (oItem._next.allowDynamicValues === !bAllowDynamicValuesDefault) {
								mNext = mNext || {};
								mNext[oItem._settingspath + "/allowDynamicValues"] = oItem._next.allowDynamicValues;
							}
							if (oItem._next.pageAdminValues) {
								mNext = mNext || {};
								mNext[oItem._settingspath + "/pageAdminValues"] = oItem._next.pageAdminValues;
							}
						}
					}
				}
			}
		}
		if (this.getMode() === "translation") {
			// translation mode don't have texts property
			delete mResult.texts;
		} else if (oSettings.texts) {
			mResult.texts = deepClone(oSettings.texts, 500) || {};
			// Clean the translations of object or object list field :
			// - remove the translations if the object is not exist in value
			for (var language in mResult.texts){
				for (var key in mResult.texts[language]) {
					if (typeof mResult.texts[language][key] === "object") {
						var vValue = mResult[key];
						if (!vValue || typeof vValue !== "object" || deepEqual(vValue, {}) || deepEqual(vValue, [])) {
							delete mResult.texts[language][key];
						} else if (Array.isArray(vValue)) {
							// get all the uuids in value list of object list field
							var aUUIDs = vValue.map(function (oObject) {
								return oObject._dt ? oObject._dt._uuid || "" : "";
							});
							// delete translation texts if uuid not included in value list
							for (var uuid in mResult.texts[language][key]) {
								if (!aUUIDs.includes(uuid)) {
									delete mResult.texts[language][key][uuid];
								}
							}
						} else {
							// get the uuid in the object value of object field
							var sUUID = vValue._dt ? vValue._dt._uuid || "" : "";
							if (sUUID !== "") {
								// only save the translation texts of current uuid
								var oTranslation = mResult.texts[language][key][sUUID];
								if (!oTranslation) {
									delete mResult.texts[language][key];
								} else {
									mResult.texts[language][key] = {};
									mResult.texts[language][key][sUUID] = oTranslation;
								}
							} else {
								delete mResult.texts[language][key];
							}
						}
					}
				}
				if (deepEqual(mResult.texts[language], {})) {
					delete mResult.texts[language];
				}
			}
			if (deepEqual(mResult.texts, {})) {
				delete mResult.texts;
			}
		}
		mResult[":layer"] = Merger.layers[this.getMode()];
		mResult[":errors"] = this.checkCurrentSettings()[":errors"];
		if (mNext) {
			mResult[":designtime"] = mNext;
		}
		if (oSettings[":designtime"]) {
			mResult[":designtime"] = merge(mResult[":designtime"], oSettings[":designtime"]);
		}
		return mResult;
	};
	/**
	 * Checks for invalid values in the current settings and reports the errors
	 * TODO: highlight issues and add states...
	 */
	Editor.prototype.checkCurrentSettings = function () {
		var oSettings = this._settingsModel.getProperty("/"),
			mChecks = {};
		if (oSettings && oSettings.form && oSettings.form.items) {
			for (var n in oSettings.form.items) {
				var oItem = oSettings.form.items[n];
				if (oItem.editable) {
					if (oItem.validateCheck === "failed") {
						mChecks[oItem.manifestpath] = false;
					} else if ((oItem.isValid || oItem.required) && !(this.getMode() === "translation" && oItem.translatable)) {
						if (oItem.isValid) {
							mChecks[oItem.manifestpath] = oItem.isValid(oItem);
						}
						mChecks[oItem.manifestpath] = true;
						var value = oItem.value;
						var sType = oItem.type;
						if (sType === "string" && value === "") {
							mChecks[oItem.manifestpath] = value;
							//inform user of this error
						}
						if ((sType === "date" || sType === "datetime") && isNaN(Date.parse(value))) {
							mChecks[oItem.manifestpath] = value;
							//inform user of this error
						}
						if (sType === "integer") {
							if (isNaN(parseInt(value))) {
								mChecks[oItem.manifestpath] = value;
								//inform user of this error
							} else if (value < oItem.min || value > oItem.max) {
								mChecks[oItem.manifestpath] = value;
								//inform user of this error
							}
						} if (sType === "number") {
							if (isNaN(parseFloat(value))) {
								mChecks[oItem.manifestpath] = value;
							} else if (value < oItem.min || value > oItem.max) {
								mChecks[oItem.manifestpath] = value;
							}
						}
					}
				}
			}
			mChecks[":layer"] = Merger.layers[this.getMode()];
		}
		mChecks[":errors"] = Object.values(mChecks).indexOf(false) > -1;
		return mChecks;
	};

	/**
	 * Creates a model for the context object of the host environment
	 */
	Editor.prototype._createContextModel = function () {
		var oHost = this.getHostInstance(),
			oContextModel = new JSONModel({}),
			oFlatContextModel = new JSONModel([]);

			//add the models in any case
		this.setModel(oContextModel, "context");
		this.setModel(oFlatContextModel, "contextflat");
		oContextModel._aPendingPromises = [];
		oFlatContextModel._getPathObject = function (sPath) {
			var a = this.getData().filter(function (o) {
				if (o.path === sPath) {
					return true;
				}
			});
			return a.length ? a[0] : null;
		};
		oFlatContextModel._getValueObject = function (sValue) {
			var a = this.getData() || [];
			a = a.filter(function (o) {
				if (o.value === sValue || o.object.value === sValue) {
					return true;
				}
			});
			return a.length ? a[0] : null;
		};
		var oContextDataPromise = new Promise(function (resolve, reject) {
			if (oHost && oHost.getContext) {
				var bResolved = false;
				setTimeout(function () {
					if (bResolved) {
						return;
					}
					Log.error("Editor context could not be determined with " + CONTEXT_TIMEOUT + ".");
					bResolved = true;
					resolve({});
				}, CONTEXT_TIMEOUT);
				oHost.getContext().then(function (oContextData) {
					if (bResolved) {
						Log.error("Editor context returned after more than " + CONTEXT_TIMEOUT + ". Context is ignored.");
					}
					bResolved = true;
					resolve(oContextData || {});
				});
			} else {
				resolve({});
			}
		});

		//get the context from the host
		oContextDataPromise.then(function (oContextData) {
			var oData = this._mergeContextData(oContextData);
			oContextModel.setData(oData);
			oFlatContextModel.setData(this.flattenData(oData, "label"));
		}.bind(this));

		//async update of the value via host call
		oContextModel.getProperty = function (sPath, oContext) {
			if (sPath && !sPath.startsWith("/") && !oContext) {
				sPath = "/" + sPath;
			}
			var sAbsolutePath = this.resolve(sPath, oContext),
				pGetProperty;
			if (sAbsolutePath.endsWith("/value")) {
				this._mValues = this._mValues || {};
				if (this._mValues.hasOwnProperty(sAbsolutePath)) {
					return this._mValues[sAbsolutePath];
					//when should this be invalidated?
				}
				this._mValues[sAbsolutePath] = undefined;
				// ask the host and timeout if it does not respond
				pGetProperty = Utils.timeoutPromise(oHost.getContextValue(sAbsolutePath.substring(1)));
				pGetProperty = pGetProperty.then(function (vValue) {
						this._mValues[sAbsolutePath] = vValue;
						this.checkUpdate();
					}.bind(this))
					.catch(function (sReason) {
						this._mValues[sAbsolutePath] = null;
						this.checkUpdate();
						Log.error("Path " + sAbsolutePath + " could not be resolved. Reason: " + sReason);
					}.bind(this));

				this._aPendingPromises.push(pGetProperty);
				return undefined;
			} else {
				//resolve dt data locally
				return JSONModel.prototype.getProperty.apply(this, arguments);
			}
		};
	};

	Editor.prototype._mergeContextData = function (oContextData) {
		var oData = {};
		//empty entry
		oData["empty"] = CONTEXT_ENTRIES.empty;
		//custom entries
		for (var n in oContextData) {
			oData[n] = oContextData[n];
		}
		//editor internal
		oData["editor.internal"] = CONTEXT_ENTRIES["editor.internal"];
		return oData;
	};

	Editor.prototype._loadValueContextInDesigntime = function () {
		var oContextModel = this.getModel("context");
		var oSettings = this._oDesigntimeInstance.getSettings();
		var sItemsString;
		if (oSettings && oSettings.form && oSettings.form.items) {
			sItemsString = JSON.stringify(oSettings.form.items);
		}
		if (sItemsString) {
			var contextParamRegExp = /\{context\>[\/?\w+.]+\}/g;
			var aResult = sItemsString.match(contextParamRegExp);
			var aContextEntries;
			if (aResult && aResult.length > 0) {
				// only value context need to load
				aResult = aResult.filter(function (sResult) {
					return sResult.endsWith("value}");
				});
				aContextEntries = aResult.map(function (sResult) {
					return sResult.substring(9, sResult.length - 1);
				});
				aContextEntries.forEach(function (sContextEntry) {
					oContextModel.getProperty(sContextEntry);
				});
				return Promise.all(oContextModel._aPendingPromises).then(function () {
					oContextModel._aPendingPromises = [];
				});
			}
		}
		return Promise.resolve();
	};

	//map editors for a specific type
	Editor.fieldMap = {
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
	Editor.Fields = null;
	/**
	 * Loads all field modules registered in Editor.fieldMap and stores the classes in Editor.Fields
	 */
	Editor.prototype._requireFields = function () {
		if (Editor.Fields) {
			return Promise.resolve();
		}
		return new Promise(function (resolve) {
			sap.ui.require(Object.values(Editor.fieldMap), function () {
				Editor.Fields = {};
				for (var n in Editor.fieldMap) {
					Editor.Fields[n] = arguments[Object.keys(Editor.fieldMap).indexOf(n)];
				}
				resolve();
			});
		});
	};

	Editor.prototype._createDescription = function (oConfig, sParameterKey) {
		var oDescIcon = new Icon(this.getId() + "_" + sParameterKey + "_description_icon", {
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
			oDescIcon.addDependent(this._getPopover());
			this._getPopover().getContent()[0].applySettings({ text: oConfig.description });
			this._getPopover().openBy(oDescIcon);
		}.bind(this, oDescIcon);
		oDescIcon.onmouseout = function (oDescIcon) {
			this._getPopover().close();
			oDescIcon.removeDependent(this._getPopover());
		}.bind(this, oDescIcon);
		return oDescIcon;
	};

	Editor.prototype._createMessageIcon = function (oField, sParameterKey) {
		var oConfig = oField.getConfiguration();
		var oMsgIcon = new Icon(this.getId() + "_" + sParameterKey + "_message_icon", {
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
		oMsgIcon.onmouseover = function (oField) {
			oField._showMessage();
		}.bind(this, oField);
		oMsgIcon.onmouseout = function (oField) {
			oField._hideMessage();
		}.bind(this, oField);
		oMsgIcon.addStyleClass("sapUiIntegrationEditorMessageIcon");
		return oMsgIcon;
	};

	/**
	 * Creates a label based on the configuration settings
	 * @param {object} oConfig
	 * @param {string} sParameterKey
	 */
	Editor.prototype._createLabel = function (oConfig, sParameterKey) {
		var oLabel = new Label(this.getId() + "_" + sParameterKey + "_label", {
			text: oConfig.label,
			tooltip: oConfig.tooltip || oConfig.label,
			//mark only fields that are required and editable,
			//otherwise this is confusing because user will not be able to correct it
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
		oLabel._cols = oConfig.cols || 2; //by default 2 cols
		if (oConfig.layout) {
			oLabel._layout = oConfig.layout;
		}
		oLabel._sOriginalType = oConfig.type;
		return oLabel;
	};

	/**
	 * Create the settings button
	 */
	 Editor.prototype._createSettingsButton = function (oField, sParameterKey) {
		var oConfig = oField.getConfiguration();
		var oSettingsButton = new Button(this.getId() + "_" + sParameterKey + "_settings_btn", {
			icon: "{= ${currentSettings>_hasDynamicValue} ? 'sap-icon://display-more' : 'sap-icon://enter-more'}",
			type: "Transparent",
			tooltip: this._oResourceBundle.getText("EDITOR_FIELD_MORE_SETTINGS"),
			press: function (oEvent) {
				this._openSettingsDialog(200, oEvent.oSource, oField);
			}.bind(this),
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

	Editor.prototype._getSettingsPanel = function (oField) {
		if (!oField._oSettingsPanel) {
			oField._oSettingsPanel = new Settings();
		}
		return oField._oSettingsPanel;
	};

	Editor.prototype._openSettingsDialog = function (iDelay, oSettingsButton, oField) {
		var oSettingsPanel = this._getSettingsPanel(oField);
		window.setTimeout(function () {
			oSettingsPanel.setConfiguration(oField.getConfiguration());
			oSettingsPanel.open(
				oSettingsButton,
				oSettingsButton,
				this,
				oField.getHost(),
				oField,
				oField._applySettings.bind(oField),
				oField._cancelSettings.bind(oField));
		}.bind(this), iDelay || 600);
	};

	Editor.prototype._getPopover = function () {
		if (this._oPopover) {
			return this._oPopover;
		}
		var oText = new Text({
			text: ""
		});
		oText.addStyleClass("sapUiTinyMargin sapUiIntegrationEditorDescriptionText");
		this._oPopover = new RPopover(this.getId() + "_popover", {
			showHeader: false,
			content: [oText]
		});
		this._oPopover.addStyleClass("sapUiIntegrationEditorPopover");
		return this._oPopover;
	};

	/**
	 * Creates a Field based on the configuration settings
	 * @param {object} oConfig
	 * @param {string} sParameterKey
	 */
	Editor.prototype._createField = function (oConfig, sParameterKey) {
		var oField = new Editor.Fields[oConfig.type](this.getId() + "_" + sParameterKey + "_field", {
			configuration: oConfig,
			mode: this.getMode(),
			host: this.getHostInstance(),
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
		oField.setAssociation("_editor", this);

		this._aFieldReadyPromise.push(oField._readyPromise.then(function() {
			// for group field, will do nothing else
			if (oConfig.type !== "group") {
				if (oConfig.require
					|| oConfig.validation
					|| (oConfig.validations && oConfig.validations.length > 0)
					|| (oConfig.values && oConfig.values.data && !oConfig.values.data.json)) {
					var oMsgIcon = this._createMessageIcon(oField, sParameterKey);
					oField.setAssociation("_messageIcon", oMsgIcon);
				}
				if (oConfig.description && this.getMode() !== "translation") {
					oField._descriptionIcon = this._createDescription(oConfig, sParameterKey);
				}
				if (oConfig._changeDynamicValues) {
					oField._settingsButton = this._createSettingsButton(oField, sParameterKey);
					oField._applyButtonStyles();
				}
			}
		}.bind(this)));
		if (oConfig.type !== "group") {
			// listen to value changes on the settings
			oField._oValueBinding = this._settingsModel.bindProperty(oConfig._settingspath + "/value");
			oField._oValueBinding.attachChange(function () {
				if (!this._bIgnoreUpdates) {
					oConfig._changed = true;
					if (oConfig._dependentFields && oConfig._dependentFields.length > 0) {
						this._updateEditor(oConfig._dependentFields);
					}
					this._updatePreview();
				}
			}.bind(this));
			if (oField.isFilterBackend()) {
				// listen to suggest value changes on the settings if current field support filter backend feature
				var oSuggestValueBinding = this._settingsModel.bindProperty(oConfig._settingspath + "/suggestValue");
				oSuggestValueBinding.attachChange(function () {
					var oConfigTemp = merge({}, oConfig);
					oConfigTemp._cancel = false;
					this._addValueListModel(oConfigTemp, oField);
				}.bind(this));
			}
			if (oConfig.values) {
				// load metadata
				if (oConfig.values.metadata) {
					this._addMetadataModel(oConfig, oField);
				}
				// for MultiInput used in string[] field with filter backend, do not request data when creating it
				if (oConfig.type === "string[]" && oField.isFilterBackend() && oConfig.visualization && oConfig.visualization.type === "MultiInput") {
					oField.setModel(new JSONModel({}), undefined);
				} else {
					this._addValueListModel(oConfig, oField);
				}
			}
			this._createDependentFields(oConfig, oField);
			oField._oDataProviderFactory = this._oDataProviderFactory;
		}
		oField._cols = oConfig.cols || 2; //by default 2 cols
		if (oConfig.layout) {
			oField._layout = oConfig.layout;
		}
		oField._oEditorResourceBundles = this._oEditorResourceBundles;
		oField.setAssociation("_messageStrip", MessageStripId);
		return oField;
	};

	Editor.prototype._updateEditor = function (aDependentFields) {
		if (this._ready) {
			if (aDependentFields.length === 0) {
				return;
			}
			for (var i = 0; i < aDependentFields.length; i++) {
				var o = aDependentFields[i];
				o.config._cancel = true;
			}
			if (!this._oDataProviderFactory) {
				return;
			}
			this._bIgnoreUpdates = true;
			for (var i = 0; i < aDependentFields.length; i++) {
				var o = aDependentFields[i];
				o.config._cancel = false;
				this._addValueListModel(o.config, o.field, 500 * i);
			}
			this._bIgnoreUpdates = false;
		}
	};

	/**
	 * updates the additional content
	 * TODO: Track changes and call update of the additional content
	 */
	Editor.prototype._updatePreview = function () {
		var oPreview = this.getAggregation("_preview") || this._oPreview;
		if (oPreview && oPreview.update) {
			oPreview.update();
		}
	};

	/**
	 * request data via data provider in RT
	 * @param {object} oConfig
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 */
	Editor.prototype._requestData = function (oConfig, oField) {
		var oDataProvider = this._oDataProviderFactory.create(oConfig.values.data);
		oDataProvider.bindObject({
			path: "items>/form/items"
		});
		oDataProvider.bindObject({
			path: "currentSettings>" + oConfig._settingspath
		});
		oDataProvider.bindObject({
			path: "context>/"
		});
		var oPromise = oDataProvider.getData();
		oPromise.then(function (oData) {
			if (oConfig._cancel) {
				oConfig._values = [];
				this._settingsModel.setProperty(oConfig._settingspath + "/_loading", false);
				return;
			}
			// filter data for page admin
			var oPath = oConfig.values.data.path,
			    aPath,
			    tResult = [];
			if (oPath && oPath !== "/") {
				if (oPath.startsWith("/")) {
					oPath = oPath.substring(1);
				}
				if (oPath.endsWith("/")) {
					oPath = oPath.substring(0, oPath.length - 1);
				}
				aPath = oPath.split("/");
				tResult = ObjectPath.get(aPath, oData);
			} else {
				tResult = oData;
			}
			if (oConfig.type === "object" || oConfig.type === "object[]") {
				tResult.forEach(function (oResult) {
					oResult._dt = {
						_editable: false
					};
				});
			}
			if (this.getMode() === "content" && oConfig.pageAdminValues && oConfig.pageAdminValues.length > 0) {
				var paValues = oConfig.pageAdminValues,
				    selValues = oConfig.value,
					selValueItems = oConfig.valueItems,
				    results = [],
					selResults = [],
					selItemsResults = [];
				this.prepareFieldsInKey(oConfig);
				if (paValues.length > 0) {
					for (var i = 0; i < paValues.length; i++) {
						for (var j = 0; j < tResult.length; j++) {
							var keyValue = this.getKeyFromItem(tResult[j]);
							if (paValues[i] === keyValue) {
								results.push(tResult[j]);
							}
						}
						if (Array.isArray(selValues)) {
							for (var k = 0; k < selValues.length; k++) {
								if (paValues[i] === selValues[k]) {
									selResults.push(selValues[k]);
								}
							}
							for (var l = 0; l < selValueItems.length; l++) {
								var kValue = this.getKeyFromItem(selValueItems[l]);
								if (paValues[i] === kValue) {
									selItemsResults.push(selValueItems[l]);
								}
							}
						}
					}
					if (selResults.length > 0) {
						oConfig.value = [];
						oConfig.value = selResults;
					}
					if (selItemsResults.length > 0) {
						oConfig.valueItems = [];
						oConfig.valueItems = selItemsResults;
					}
				}
				if (oConfig.values.data.path && oConfig.values.data.path !== "/") {
					delete oData[aPath];
					ObjectPath.set(aPath, results, oData);
				} else {
					oData = [];
					oData = results;
				}
			}
			//add group property "Selected" to each record for MultiComboBox in StringListField
			//user configration of the field since its value maybe changed
			var oFieldConfig = oField.getConfiguration();
			if (oConfig.type === "string[]") {
				var sPath = oConfig.values.data.path;
				if (sPath && sPath !== "/") {
					if (sPath.startsWith("/")) {
						sPath = sPath.substring(1);
					}
					if (sPath.endsWith("/")) {
						sPath = sPath.substring(0, sPath.length - 1);
					}
					var aPath = sPath.split("/");
					var oResult = ObjectPath.get(aPath, oData);
					if (Array.isArray(oResult)) {
						for (var n in oResult) {
							var sKey = oField.getKeyFromItem(oResult[n]);
							if (Array.isArray(oFieldConfig.value) && oFieldConfig.value.length > 0 && oFieldConfig.value.includes(sKey)) {
								oResult[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_SELECTED");
							} else {
								oResult[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_UNSELECTED");
							}
						}
						ObjectPath.set(aPath, oResult, oData);
					}
				} else if (Array.isArray(oData)) {
					for (var n in oData) {
						var sKey = oField.getKeyFromItem(oData[n]);
						if (Array.isArray(oFieldConfig.value) && oFieldConfig.value.length > 0 && oFieldConfig.value.includes(sKey)) {
							oData[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_SELECTED");
						} else {
							oData[n].Selected = this._oResourceBundle.getText("EDITOR_ITEM_UNSELECTED");
						}
					}
				}
			}
			oConfig._values = oData;
			var oValueModel = oField.getModel();
			oValueModel.setData(oData);
			oValueModel.checkUpdate(true);
			oValueModel.firePropertyChange();
			if (oConfig.type === "object" || oConfig.type === "object[]") {
				oField.mergeValueWithRequestResult(tResult);
			}
			this._settingsModel.setProperty(oConfig._settingspath + "/_loading", false);
			oField._hideValueState(true, true);
		}.bind(this))
		.catch(function (oError) {
			var oErrorPromise = new Promise(function (resolve) {
				var sError = this._oResourceBundle.getText("EDITOR_BAD_REQUEST");
				if (Array.isArray(oError) && oError.length > 0) {
					sError = oError[0];
					var oResponse = oError[1];
					if (oResponse) {
						var oErrorInResponse;
						oResponse.text().then(function (sResponseText) {
							if (Utils.isJson(sResponseText)) {
								oErrorInResponse = JSON.parse(sResponseText).error;
							} else {
								sError = sResponseText;
							}

							if (oErrorInResponse) {
								sError = (oErrorInResponse.code || oErrorInResponse.errorCode || oResponse.status) + ": " + oErrorInResponse.message;
							}

							resolve(sError);
						});
						return;
					} else {
						resolve(sError);
						return;
					}
				} else if (typeof (oError) === "string") {
					sError = oError;
					resolve(sError);
					return;
				} else {
					resolve(sError);
					return;
				}
			}.bind(this));

			return oErrorPromise.then(function (sError) {
				var oValueModel = oField.getModel();
				oValueModel.firePropertyChange();
				if (oConfig.type === "object" || oConfig.type === "object[]") {
					oField.mergeValueWithRequestResult();
				}
				this._settingsModel.setProperty(oConfig._settingspath + "/_loading", false);
				oField._showValueState("error", sError, true);
			}.bind(this));

		}.bind(this));
	};

	Editor.prototype._requestExtensionData = function () {
		var oExtension = this.getAggregation("_extension");
		if (!oExtension) {
			Log.info("Extension is not defined or created, do not load data of it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}
		var bHasExtensionData = false;
		var oExtensionConfig = {};
		var oExtensionProperty = this._oEditorManifest.get(this.getConfigurationPath() + "/data/extension");
		var sPath;
		if (oExtensionProperty) {
			bHasExtensionData = true;
			sPath = this._oEditorManifest.get(this.getConfigurationPath() + "/data/path");
			oExtensionConfig = {
				"extension": oExtensionProperty
			};
			if (sPath) {
				oExtensionConfig.path = sPath;
			}
		} else {
			oExtensionProperty = this._oEditorManifest.get("/" + this.getSection() + "/data/extension");
			if (oExtensionProperty) {
				bHasExtensionData = true;
				sPath = this._oEditorManifest.get("/" + this.getSection() + "/data/path");
				oExtensionConfig = {
					"extension": oExtensionProperty
				};
				if (sPath) {
					oExtensionConfig.path = sPath;
				}
			}
		}
		if (!bHasExtensionData) {
			Log.info("Extension data is not defined in manifest, do not load data of it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}
		var oDataProvider = this._oDataProviderFactory.create(oExtensionConfig);
		var oPromise = oDataProvider.getData();
		return oPromise.then(function (oData) {
			var oValueModel = oExtension.getModel();
			if (!oValueModel) {
				oValueModel = new JSONModel(oData || {});
				oExtension.setModel(oValueModel, undefined);
			} else {
				oValueModel.setData(oData);
			}
			oValueModel.checkUpdate(true);
		}).catch(function (oError) {
			var sError = this._oResourceBundle.getText("EDITOR_BAD_REQUEST");
			if (Array.isArray(oError) && oError.length > 0) {
				sError = oError[0];
				var oResponse = oError[1];
				if (oResponse) {
					var oErrorInResponse;
					oResponse.text().then(function (sResponseText) {
						if (Utils.isJson(sResponseText)) {
							oErrorInResponse = JSON.parse(sResponseText).error;
						} else {
							sError = sResponseText;
						}

						if (oErrorInResponse) {
							sError = (oErrorInResponse.code || oErrorInResponse.errorCode || oResponse.status) + ": " + oErrorInResponse.message;
						}

						Log.error("Request extension data failed, " + sError);
					});
				}
			} else if (typeof (oError) === "string") {
				sError = oError;
				Log.error("Request extension data failed, " + sError);
			}
		}.bind(this));
	};

	/**
	 * Creates a unnamed model if a values.data section exists in the configuration
	 * @param {object} oConfig
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 */
	Editor.prototype._addValueListModel = function (oConfig, oField, nTimeout) {
		if (oConfig.values) {
			var oValueModel;
			if (oConfig.values.data) {
				if (this._oDataProviderFactory) {
					oValueModel = oField.getModel();
					if (!oValueModel) {
						oValueModel = new JSONModel({});
						oField.setModel(oValueModel, undefined);
					}
					this._settingsModel.setProperty(oConfig._settingspath + "/_loading", true);
					if (!nTimeout) {
						this._requestData(oConfig, oField);
					} else {
						setTimeout(function() {
							this._requestData(oConfig, oField);
						}.bind(this), nTimeout);
					}
				}
				//we use the binding context to connect the given path from oConfig.values.data.path
				//with that the result of the data request can be have also other structures.
				oField.bindObject({
					path: oConfig.values.data.path || "/"
				});
			} else if (this.getAggregation("_extension")) {
				oValueModel = this.getAggregation("_extension").getModel();
				//filter data for page admin
				if (oValueModel && this.getMode() === "content" && oConfig.pageAdminValues && oConfig.pageAdminValues.length > 0) {
					this.prepareFieldsInKey(oConfig);
					var ePath = oConfig.values.path;
					if (ePath.length > 1) {
						ePath = ePath.substring(1);
					}
					var oValueData = ObjectPath.get([ePath], oValueModel.getData()),
					    paValues = oConfig.pageAdminValues,
						results = [];
					for (var m = 0; m < paValues.length; m++) {
						for (var j = 0; j < oValueData.length; j++) {
							var keyValue = this.getKeyFromItem(oValueData[j]);
							if (paValues[m] === keyValue) {
								results.push(oValueData[j]);
							}
						}
					}
					delete oValueData[ePath];
					ObjectPath.set(ePath, results, oValueData);
					oValueModel.setData(oValueData);
				}
				//we use the binding context to connect the given path from oConfig.values.path
				//with that the result of the data request can be have also other structures.
				oField.bindObject({
					path: oConfig.values.path || "/"
				});
				//in the designtime the item bindings will not use a named model, therefore we add a unnamed model for the field
				//to carry the values.
				oField.setModel(oValueModel, undefined);
			}
		}
	};

	/**
	 * Creates a meta model if a values.metadata section exists in the configuration
	 * @param {object} oConfig
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 */
	 Editor.prototype._addMetadataModel = function (oConfig, oField) {
		if (oConfig.values && oConfig.values.metadata) {
			var oRequestDefaultParameters = merge({}, oConfig.values.metadata.request);

			var oRequest = {
				url: oRequestDefaultParameters.serviceUrl
			};
			var pRequestChain = Promise.resolve(oRequest);
			if (this._oDestinations) {
				pRequestChain = this._oDestinations.process(oRequest);
			}
			pRequestChain.then(function(oData) {
				if (!oData.url.endsWith("/")) {
					oData.url = oData.url + "/";
				}
				oRequestDefaultParameters.serviceUrl = oData.url;
				var oMetaDataModel = new ODataModel(oRequestDefaultParameters);
				oMetaDataModel.oMetaModel.fetchData().then(function(oMetaData) {
					oField.setModel(new JSONModel(oMetaData), "meta");
				});
			});
		}
	};

	Editor.prototype._createDependentFields = function (oConfig, oField) {
		if (oConfig.values) {
			var sData = JSON.stringify(oConfig.values.data);
			if (sData) {
				var destParamRegExp = /parameters\.([^\}\}]+)|destinations\.([^\}\}]+)|\{items\>[\/?\w+]+\}/g,
					aResult = sData.match(destParamRegExp);
				if (aResult) {
					//add the field to dependency to either the parameter or destination
					for (var i = 0; i < aResult.length; i++) {
						var sValueKey = "/value";
						var sDependentPath = this.getConfigurationPath();
						if (aResult[i].indexOf("destinations.") === 0 || aResult[i].indexOf("parameters.") === 0) {
							if (aResult[i].indexOf("destinations.") === 0) {
								sValueKey = "/name";
							}
							sDependentPath = sDependentPath + "/" + aResult[i].replace(".", "/") + sValueKey;
						} else if (aResult[i].indexOf("{items>") === 0) {
							sDependentPath = sDependentPath + "/parameters/" + aResult[i].slice(7, -1);
						}
						var oItem = this._mItemsByPaths[sDependentPath];
						if (oItem) {
							//DIGITALWORKPLACE-4802
							//clone the config since the item may dependent to itself in filter backend feature
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

	Editor.prototype.getBeforeLayerChange = function (sManifestPath) {
		if (!this._beforeLayerManifestChanges) {
			this._beforeLayerManifestChanges = {};
		}
		return this._beforeLayerManifestChanges[sManifestPath];
	};

	Editor.prototype.getTranslationValueInTexts = function (sLanguage, sManifestPath) {
		var sTranslationPath = "/texts/" + sLanguage;
		var oProperty = this._settingsModel.getProperty(sTranslationPath) || {};
		return oProperty[sManifestPath];
	};

	Editor.prototype.deleteAllTranslationValuesInTexts = function (sManifestPath) {
		var that = this;
		var oData = that._settingsModel.getData();
		if (!oData || !oData.texts) {
			return;
		}
		var sTranslationPath = "/texts";
		var oTexts = deepClone(oData.texts, 500);
		for (var n in oTexts) {
			if (oTexts[n][sManifestPath]) {
				delete oTexts[n][sManifestPath];
			}
		}
		this._settingsModel.setProperty(sTranslationPath, oTexts);
	};

	/**
	 * Adds an item to the _formContent aggregation based on the config settings
	 * @param {object} oConfig
	 * @param {string} sParameterKey
	 */
	 Editor.prototype._addItem = function (oConfig, sParameterKey) {
		var sMode = this.getMode();
		//force to turn off features for settings and dynamic values and set the default if not configured
		if (this.getAllowDynamicValues() === false || !oConfig.allowDynamicValues) {
			oConfig.allowDynamicValues = false;
		}
		if (this.getAllowSettings() === false) {
			oConfig.allowSettings = false;
		}
		oConfig.__cols = oConfig.cols || 2;

		//if the item is not visible or translation mode, continue immediately
		if (oConfig.visible === false || (!oConfig.translatable && sMode === "translation" && oConfig.type !== "group")) {
			return;
		}
		//display subPanel as iconTabBar or Panel
		if (oConfig.type === "group") {
			oConfig.expanded = oConfig.expanded !== false;
			var oField = this._createField(oConfig, sParameterKey);
			this.addAggregation("_formContent", oField);
			if (oConfig.hint) {
				this._addHint(oConfig.hint, this.getId() + "_" + sParameterKey);
			}
			return;
		}
		if (oConfig.type === "separator") {
			var oSeparator = new Separator();
			this.addAggregation("_formContent", oSeparator);
			//currently do not publish the line property to customer
			//oSeparator._hasLine = oConfig.line || false;
			return;
		}
		var oNewLabel = null;
		var sLanguage = Utils._language;
		if (sMode === "translation") {
			if (oConfig.type !== "string") {
				return;
			}
			if ((typeof oConfig.value === "string" && oConfig.value.indexOf("{") === 0) || typeof oConfig.values !== "undefined") {
				//do not show dynamic values for translation
				return;
			}
			//adding an internal _language object to save the original value for the UI
			oConfig._language = {
				value: oConfig.value
			};

			//force a 2 column layout in the form, remember the original to reset

			oConfig.cols = 1;
			//delete values property of string field
			delete oConfig.values;

			//create a configuration clone. map the _settingspath setting to _language, and set it to not editable
			var origLangFieldConfig = deepClone(oConfig, 500);
			origLangFieldConfig._settingspath += "/_language";
			origLangFieldConfig.editable = false;
			origLangFieldConfig.required = false;
			//if has value transaltions, get value via language setting in core
			if (!Editor._oLanguages[sLanguage] && sLanguage.indexOf("-") > -1) {
				sLanguage = sLanguage.substring(0, sLanguage.indexOf("-"));
			}
			if (Editor._oLanguages[sLanguage]) {
				var sTranslateText = this.getTranslationValueInTexts(sLanguage, oConfig.manifestpath);
				if (sTranslateText) {
					origLangFieldConfig.value = sTranslateText;
				}
			}
			if (!origLangFieldConfig.value) {
				//the original language field shows only a text control. If empty we show a dash to avoid empty text.
				origLangFieldConfig.value = "-";
			}
			var oLabel = this._createLabel(origLangFieldConfig, sParameterKey);
			this.addAggregation("_formContent",
				oLabel
			);
			var oOrigLanguageField = this._createField(origLangFieldConfig, sParameterKey + "_ori");
			oOrigLanguageField.isOrigLangField = true;
			this.addAggregation("_formContent", oOrigLanguageField);

			//even if a item is not visible or not editable by another layer for translations it should always be editable and visible
			oConfig.editable = oConfig.visible = oConfig.translatable;
			sLanguage = this._language;
			if (!this.getBeforeLayerChange(oConfig.manifestpath)) {
				oConfig.value = oConfig._translatedValue || "";
			}
			var sTranslateText = this.getTranslationValueInTexts(sLanguage, oConfig.manifestpath);
			if (sTranslateText) {
				oConfig.value = sTranslateText;
			}
			//change the label for the translation field
			oConfig.label = oConfig._translatedLabel || "";
			oConfig.required = false; //translation is never required
			var oTranslateLanguageField = this._createField(oConfig, sParameterKey + "_trans");
			//accessibility set aria-label
			var tfDelegate = {
				onAfterRendering: function(oEvent) {
					var tfField = document.getElementById(oTranslateLanguageField.getId());
					tfField.setAttribute("aria-label", oLabel);
				}
			};
			oTranslateLanguageField.addEventDelegate(tfDelegate);
			this.addAggregation("_formContent",
				oTranslateLanguageField
			);
		} else {
			oNewLabel = this._createLabel(oConfig, sParameterKey);
			this.addAggregation("_formContent",
				oNewLabel
			);
			var sBeforeLayerChange = this.getBeforeLayerChange(oConfig.manifestpath);
			if (sBeforeLayerChange) {
				oConfig._beforeLayerChange = sBeforeLayerChange;
			}
			//if there are changes for the current layer, read the already translated value from there
			//now merge these changes for translation into the item configs
			if (this._currentLayerManifestChanges && this._currentLayerManifestChanges[oConfig.manifestpath]) {
				oConfig.value = this._currentLayerManifestChanges[oConfig.manifestpath];
				oConfig._beforeLayerChange = oConfig.value;
			}
			//only get translations of string fields
			if (oConfig.type === "string") {
				sLanguage = this._language;
				var sTranslateText = this.getTranslationValueInTexts(sLanguage, oConfig.manifestpath);
				if (sTranslateText) {
					oConfig.value = sTranslateText;
				}
			}
			var oField = this._createField(oConfig, sParameterKey);
			//accessibility set aria-label
			var fDelegate = {
				onAfterRendering: function(oEvent) {
					var eField = document.getElementById(oField.getId());
					eField.setAttribute("aria-label", oNewLabel);
				}
			};
			oField.addEventDelegate(fDelegate);
			this.addAggregation("_formContent",
				oField
			);
		}
		//add hint in the new row.
		if (oConfig.hint && (!oConfig.cols || oConfig.cols === 2)) {
			this._addHint(oConfig.hint, this.getId() + "_" + sParameterKey);
		}
		//reset the cols to original
		oConfig.cols = oConfig.__cols;
		delete oConfig.__cols;
	};

	Editor.prototype._createHint = function (sHint, sHintIdPrefix) {
		sHint = sHint.replace(/<a href/g, "<a target='blank' href");
		var oFormattedText = new FormattedText(sHintIdPrefix + "_hint", {
			htmlText: sHint
		});
		return oFormattedText;
	};

	Editor.prototype._addHint = function (sHint, sHintIdPrefix) {
		var oHint = this._createHint(sHint, sHintIdPrefix);
		this.addAggregation("_formContent", oHint);
	};
	/**
	 * Returns the current language specific text for a given key or "" if no translation for the key exists
	 */
	Editor.prototype._getCurrentLanguageSpecificText = function (sKey) {
		if (this._oTranslationBundle) {
			var sText = this._oTranslationBundle.getText(sKey, [], true);
			if (sText === undefined) {
				return "";
			}
			return sText;
		}
		var sLanguage = this._language;
		if (!sLanguage) {
			return "";
		}
		var vI18n = this._oEditorManifest.get("/sap.app/i18n"),
			sResourceBundleURL,
			aSupportedLocales;
		if (!vI18n) {
			return "";
		}
		if (typeof vI18n === "string") {
			sResourceBundleURL = this.getBaseUrl() + vI18n;
		} else if (typeof vI18n === "object") {
			if (vI18n.bundleUrl) {
				sResourceBundleURL = this.getBaseUrl() + vI18n.bundleUrl;
			}
			if (vI18n.supportedLocales && Array.isArray(vI18n.supportedLocales)) {
				aSupportedLocales = vI18n.supportedLocales;
				for (var i = 0; i < aSupportedLocales.length; i++) {
					aSupportedLocales[i] = aSupportedLocales[i].replaceAll('_', '-');
				}
			}
		}
		if (sResourceBundleURL) {
			var aFallbacks = [sLanguage];
			if (sLanguage.indexOf("-") > -1) {
				aFallbacks.push(sLanguage.substring(0, sLanguage.indexOf("-")));
			}
			//add en into fallbacks
			if (!aFallbacks.includes("en")) {
				aFallbacks.push("en");
			}
			aFallbacks = this._filterSupportedFallbackLanguages(aFallbacks, aSupportedLocales);
			// load the ResourceBundle relative to the manifest
			this._oTranslationBundle = ResourceBundle.create({
				url: sResourceBundleURL,
				async: false,
				locale: aFallbacks[0],
				supportedLocales: aFallbacks,
				fallbackLocale: "en"
			});
			return this._getCurrentLanguageSpecificText(sKey);
		} else {
			return "";
		}
	};

	/**
	 * Filter the supported fallback languages
	 */
	Editor.prototype._filterSupportedFallbackLanguages = function (aFallbacks, aSupportedLocales) {
		if (Array.isArray(aSupportedLocales)) {
			var aSupportedFallbacks = [];
			for (var i = 0; i < aFallbacks.length; i++) {
				if (aSupportedLocales.includes(aFallbacks[i])) {
					aSupportedFallbacks.push(aFallbacks[i]);
				}
			}
			aFallbacks = aSupportedFallbacks;
		}
		return aFallbacks;
	};

	/**
	 * Starts the editor, creates the fields
	 */
	Editor.prototype._startEditor = function () {
		var oContents = this.getAggregation("_formContent");
		if (oContents && oContents.length > 0) {
			this.destroyAggregation("_formContent");
		}

		var oSettingsData = this._settingsModel.getData();
		var oItems;
		if (oSettingsData.form && oSettingsData.form.items) {
			oItems = oSettingsData.form.items;
			// ### check if need to add general configuration group ###
			// since the items had already reordered in _addDestinationSettings function according by this._destinationGroupAtTop,
			// if destination group is at top:
			//    a. check item from 2nd position (the 1st item is the destination group itme)
			//    b. if item is a destination item, set iInsertPosition to current position number, then check the next item
			//    c. if item is a group and not a sub group, break, no need to add general configuration group
			//    d. if item is not a group and visible is true, which means it is a valid item, so need to add general configuration group, or check the next item
			// if destination group is NOT at top:
			//    a. check item from 1st position
			//    b. if item is destination item, which means no parameters exist(items sorted in _addDestinationSettings), no need to add general configuration group
			//    c. if item is a group and not a sub group, break, no need to add general configuration group
			//    d. if item is not a group and visible is true, which means it is a valid item, so need to add general configuration group, or check the next item
			var bAddGeneralSettingsPanel = false,
				iStartIndex = this._destinationGroupAtTop ? 1 : 0,
				aKeys = Object.keys(oItems),
				iLength = aKeys.length,
				iInsertPosition = 0;
			for (var i = iStartIndex; i < iLength; i++) {
				var oItem = oItems[aKeys[i]];
				if (oItem.type === "destination") {
					if (!this._destinationGroupAtTop) {
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
					label: this._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"),
					_settingspath: "/form/items/generalPanel"
				};
				//insert general settings panel in position iInsertPosition
				if (this._destinationGroupAtTop) {
					var oNewItems = {};
					var iPosition = 0;
					aKeys.forEach(function(sKey) {
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
				this._settingsModel.setData(oSettingsData);
			}
		}

		var oSettings = this._settingsModel.getProperty("/");
		this._mItemsByPaths = {};
		if (oSettings.form && oSettings.form.items) {
			oItems = oSettings.form.items;
			//get current language
			var sLanguage = this._language || this.getLanguage() || Utils._language;
			if (this.getMode() === "translation") {
				//add top panel of translation editor
				this._addItem({
					type: "group",
					translatable: true,
					expandable: false,
					expanded: true,
					label: this._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._oLanguages[sLanguage]
				}, "translationTopPanel");
			}
			for (var n in oItems) {
				var oItem = oItems[n];
				if (oItem) {
					//force a label setting, set it to the name of the item
					oItem.label = oItem.label || n;
					//what is the current value from the change?
					var sCurrentLayerValue;
					if (oItem.manifestpath) {
						this._mItemsByPaths[oItem.manifestpath] = oItem;
						if (this.getMode() !== "translation") {
							sCurrentLayerValue = this._currentLayerManifestChanges[oItem.manifestpath];
						}
					}
					//if not changed it should be undefined, and ignore changes in tranlation layer
					oItem._changed = sCurrentLayerValue !== undefined && this.getMode() !== "translation";

					if (oItem.values) {
						oItem.translatable = false;
					}

					oItem._beforeValue = this._getManifestBeforelValue(oItem.manifestpath);

					//check if the provided value from the parameter or designtime default value is a translated value
					//restrict this to string types for now
					if (oItem.type === "string") {
						//check if is translatable via default value, if default value match "{{sTranslationTextKey}}" or "{i18n>sTranslationTextKey}", it is translatable
						oItem._translatedDefaultPlaceholder = this._getManifestDefaultValue(oItem.manifestpath);
						var sTranslationTextKey = null,
							sPlaceholder = oItem._translatedDefaultPlaceholder;
						if (sPlaceholder) {
							//value with parameter syntax will not be translated
							if (this._isValueWithParameterSyntax(sPlaceholder)) {
								oItem.translatable = false;
							}
							//parameter translated value
							if (this._isValueWithHandlebarsTranslation(sPlaceholder)) {
								sTranslationTextKey = sPlaceholder.substring(2, sPlaceholder.length - 2);
							} else if (sPlaceholder.startsWith("{i18n>")) {
								sTranslationTextKey = sPlaceholder.substring(6, sPlaceholder.length - 1);
							}
							//only if there is a translation key
							if (sTranslationTextKey) {
								//force translatable, even if it was not explicitly set already
								oItem.translatable = true;
							} else if (oItem.translatable  && this.getMode() === "translation" && !this.getBeforeLayerChange(oItem.manifestpath)) {
								//if no translation key which means item defined as string value directly.
								//set the _translatedValue with item manifest value.
								oItem._translatedValue  = oItem._translatedDefaultPlaceholder;
								oItem.value = oItem._translatedValue;
							}
						}
						//check if before value still has tranlation key
						oItem._translatedPlaceholder = oItem._beforeValue;
						sPlaceholder = oItem._translatedPlaceholder;
						if (sPlaceholder) {
							//value with parameter syntax will not be translated
							if (this._isValueWithParameterSyntax(sPlaceholder)) {
								oItem.translatable = false;
							}
							//parameter translated value wins over designtime defaultValue
							if (this._isValueWithHandlebarsTranslation(sPlaceholder)) {
								sTranslationTextKey = sPlaceholder.substring(2, sPlaceholder.length - 2);
							} else if (sPlaceholder.startsWith("{i18n>")) {
								sTranslationTextKey = sPlaceholder.substring(6, sPlaceholder.length - 1);
							}
						}
						// if the value is a dynamic value, do not allow to translate, and delete all the translations
						if (oItem.value && (oItem.value.indexOf("{context>") === 0 || oItem.value.indexOf("{{parameters") === 0)) {
							this.deleteAllTranslationValuesInTexts(oItem.manifestpath);
							sTranslationTextKey = null;
						}
						var sTranslationValueinTexts = this.getTranslationValueInTexts(sLanguage, oItem.manifestpath);
						//only if there is a translation key
						if (sTranslationTextKey) {
							oItem._translatedValue = this.getModel("i18n").getResourceBundle().getText(sTranslationTextKey);
							if (oItem._changed) {
								//item was changed, take the current value
								oItem.value = sCurrentLayerValue;
							} else if (oItem.value === oItem._translatedDefaultPlaceholder) {
								oItem.value = oItem._translatedValue;
							}
							if (this.getMode() === "translation") {
								//if we are in translation mode the default value differs and depends on the language
								//TODO this does not work in SWZ, the base path is not taken into account...
								//get the translated default value for the language we want to translate this.getLanguage()
								//if the value is "", which means the i18n setting is not correct, do not use it as translated value
								var sCurrentLanguageSpecificText = this._getCurrentLanguageSpecificText(sTranslationTextKey);
								if (sCurrentLanguageSpecificText !== "") {
									oItem._translatedValue = sCurrentLanguageSpecificText;
								}
							} else if (sTranslationValueinTexts) {
								oItem.value = sTranslationValueinTexts;
							}
						} else if (this.getMode() !== "translation" && oItem.translatable && sTranslationValueinTexts) {
							oItem.value = sTranslationValueinTexts;
						}
						if (this.getMode() === "translation") {
							if (this._isValueWithHandlebarsTranslation(oItem.label)) {
								oItem._translatedLabel = this._getCurrentLanguageSpecificText(oItem.label.substring(2, oItem.label.length - 2), true);
							} else if (oItem.label && oItem.label.startsWith("{i18n>")) {
								//TODO this does not work in SWZ, the base path is not taken into account...
								//get the translated default value for the language we want to translate this.getLanguage()
								oItem._translatedLabel = this._getCurrentLanguageSpecificText(oItem.label.substring(6, oItem.label.length - 1), true);
							}
						}
					} else if (oItem.type === "string[]") {
						var sValueItemsPath = oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueItems";
						var oValueItems = this._manifestModel.getProperty(sValueItemsPath);
						if (oValueItems) {
							oItem.valueItems = oValueItems;
						}
						// get value tokens of MultiInput from manifest change for current item
						var sValueTokensPath = oItem.manifestpath.substring(0, oItem.manifestpath.lastIndexOf("/")) + "/valueTokens";
						var oValueTokens = this._manifestModel.getProperty(sValueTokensPath);
						if (oValueTokens) {
							oItem.valueTokens = oValueTokens;
						}
					} else if (typeof oItem.value === "object" && oItem.type === "object") {
						// backward compatibility for pre saved value
						if (typeof oItem.value._editable === "boolean") {
							oItem.value._dt = {
								"_editable" : oItem.value._editable
							};
							delete oItem.value._editable;
						}
					} else if (Array.isArray(oItem.value) && oItem.value.length > 0 && oItem.type === "object[]") {
						// backward compatibility for pre saved value
						oItem.value.forEach(function (oObject) {
							if (typeof oObject._editable === "boolean") {
								oObject._dt = {
									"_editable" : oObject._editable
								};
								delete oObject._editable;
							}
						});
					}

					//translate label if it is {{KEY}}
					if (oItem.label && this._isValueWithHandlebarsTranslation(oItem.label)) {
						var sTranslationLabelKey = oItem.label.substring(2, oItem.label.length - 2);
						if (sTranslationLabelKey) {
							oItem.label = this.getModel("i18n").getResourceBundle().getText(sTranslationLabelKey);
						}
					}
				}
			}
		}

		for (var n in oItems) {
			var oItem = oItems[n];
			this._addItem(oItem, n);
		}
		// customize the size of card editor, define the size in dt.js
		var editorHeight = this._settingsModel.getProperty("/form/height") !== undefined ? this._settingsModel.getProperty("/form/height") : "350px",
		editorWidth = this._settingsModel.getProperty("/form/width") !== undefined ? this._settingsModel.getProperty("/form/width") : "100%";
		if (this.getProperty("height") === "") {
			this.setProperty("height", editorHeight);
			document.body.style.setProperty("--sapUiIntegrationEditorFormHeight", editorHeight);
			document.body.style.setProperty("--sapUiIntegrationEditorPreviewHeight", editorHeight);
		}
		if (this.getProperty("width") === "") {
			this.setProperty("width", editorWidth);
			document.body.style.setProperty("--sapUiIntegrationEditorFormWidth", editorWidth);
		}
		//add preview
		if (this.getMode() !== "translation" && this.getPreviewPosition() !== "separate") {
			this._initPreview();
		}
		Promise.all(this._aFieldReadyPromise).then(function () {
			this._ready = true;
			this.fireReady();
		}.bind(this));
	};

	Editor.prototype.setHeight = function(sValue) {
		if (sValue) {
			this.setProperty("height", sValue);
			document.body.style.setProperty("--sapUiIntegrationEditorFormHeight", sValue);
			document.body.style.setProperty("--sapUiIntegrationEditorPreviewHeight", sValue);
		}
	};

	Editor.prototype.setWidth = function(sValue) {
		if (sValue) {
			this.setProperty("width", sValue);
			document.body.style.setProperty("--sapUiIntegrationEditorFormWidth", sValue);
		}
	};

	/**
	 * Destroy the editor and the internal instances that it created
	 */
	Editor.prototype.destroy = function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}
		if (this._oDesigntimeInstance) {
			this._oDesigntimeInstance.destroy();
		}
		var oPreview = this.getAggregation("_preview");
		if (oPreview && oPreview.destroy) {
			oPreview.destroy();
		}
		var oMessageStrip = Element.getElementById(MessageStripId);
		if (oMessageStrip) {
			oMessageStrip.destroy();
		}
		this._manifestModel = null;
		this._beforeManifestModel = null;
		this._oInitialManifestModel = null;
		this._settingsModel = null;
		this._destinationsModel = null;
		document.body.style.removeProperty("--sapUiIntegrationEditorFormWidth");
		document.body.style.removeProperty("--sapUiIntegrationEditorFormHeight");
		Control.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Initializes the additional content
	 */
	Editor.prototype._initPreview = function () {
	};

	/**
	 * Applies the defaults for the designtime settings
	 */
	Editor.prototype._applyDesigntimeDefaults = function (oSettings) {
		oSettings = oSettings || {};
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		var mItems = oSettings.form.items || oSettings.form.items;
		for (var n in mItems) {
			var oItem = mItems[n];
			// do not apply default values for destination
			if (oItem.type === "destination") {
				continue;
			}
			if (oItem.manifestpath) {
				oItem.value = this._manifestModel.getProperty(oItem.manifestpath);
			}
			if (oItem.visible === undefined || oItem.visible === null) {
				oItem.visible = true;
			}
			if (oItem.editable === undefined || oItem.editable === null) {
				oItem.editable = true;
			}
			if (this.getMode() !== "admin") {
				if (oItem.visibleToUser !== undefined) {
					oItem.visible = oItem.visibleToUser;
				}
				if (oItem.editableToUser !== undefined) {
					oItem.editable = oItem.editableToUser;
				}
			}
			if (typeof oItem.translatable !== "boolean") {
				oItem.translatable = false;
			}
			if (!oItem.label) {
				oItem.label = n;
			}

			if (!oItem.type || oItem.type === "enum") {

				oItem.type = "string";
			}
			//only if the value is undefined from the this._manifestModel.getProperty(oItem.manifestpath)
			//false, "", 0... are valid values and should not apply the default
			if (oItem.value === undefined || oItem.value === null) {
				switch (oItem.type) {
					case "boolean": oItem.value = false; break;
					case "integer":
					case "number": oItem.value = 0; break;
					case "string[]": oItem.value = []; break;
					case "object": oItem.value = undefined; break;
					case "object[]": oItem.value = undefined; break;
					default: oItem.value = "";
				}
			}
			if (oItem.type === "group") {
				if (oItem.visible === undefined || oItem.value === null) {
					oItem.visible = true;
				}
			}
			oItem._settingspath = "/form/items/" + n;
		}
	};
	/**
	 * Applies previous layer designtime settings that were changed
	 */
	Editor.prototype._applyDesigntimeLayers = function (oSettings) {
		var oTexts = {};
		var oDesigntime = {};
		//pull current values
		if (this._appliedLayerManifestChanges && Array.isArray(this._appliedLayerManifestChanges)) {
			for (var i = 0; i < this._appliedLayerManifestChanges.length; i++) {
				var oChanges = this._appliedLayerManifestChanges[i][":designtime"];
				if (oChanges) {
					var aKeys = Object.keys(oChanges);
					for (var j = 0; j < aKeys.length; j++) {
						var sPath = aKeys[j],
							vValue = oChanges[sPath];
						if (!sPath.endsWith("/pageAdminValues") && typeof vValue === "object") {
							// if vValue is a object type and not from pageAdminValues
							if (vValue.configuration && vValue.configuration.parameterFromDestination) {
								//if it is a parameter transformed from destination, add it into form/items as new parameter for this layer
								var oNewParameterConfig = vValue.configuration;
								delete oNewParameterConfig.parameterFromDestination;
								oNewParameterConfig.value = this._manifestModel.getProperty(oNewParameterConfig.manifestpath);
								oNewParameterConfig._settingspath = "/form/items/" + vValue.parameter;
								this._settingsModel.setProperty(oNewParameterConfig._settingspath, oNewParameterConfig);
							} else {
								// else it should for the object field/object list field
								// add it into designtime of settings
								oDesigntime[aKeys[j]] = merge(oDesigntime[aKeys[j]], vValue);
								continue;
							}
						} else {
							this._settingsModel.setProperty(aKeys[j], vValue);
						}
					}
				}
				var oAppliedLayerManifestChangeTexts = this._appliedLayerManifestChanges[i]["texts"];
				if (oAppliedLayerManifestChangeTexts) {
					oTexts = merge(oTexts, oAppliedLayerManifestChangeTexts);
				}
			}
		}
		if (this._currentLayerManifestChanges) {
			var oChanges = this._currentLayerManifestChanges[":designtime"];
			if (oChanges) {
				var aKeys = Object.keys(oChanges);
				for (var j = 0; j < aKeys.length; j++) {
					//apply the values to a "_next/editable", "_next/visible" entry to the settings.
					//the current layer needs to be able to change those values
					var sPath = aKeys[j],
						vValue = oChanges[sPath];
						sNext = sPath.substring(0, sPath.lastIndexOf("/") + 1) + "_next";
					if (!sPath.endsWith("/pageAdminValues") && typeof vValue === "object") {
						// if the value of design time is object type and not from pageAdminValues or a parameter transformed from destination, it should for the object field/object list field
						// add it into designtime of settings, else add it into _next property
						if (!vValue.configuration || !vValue.configuration.parameterFromDestination) {
							oDesigntime[sPath] = merge(oDesigntime[sPath], vValue);
							continue;
						}
					}
					if (!this._settingsModel.getProperty(sNext)) {
						//create a _next entry if it does not exist
						this._settingsModel.setProperty(sNext, {});
					}
					var sNext = sPath.substring(0, sPath.lastIndexOf("/") + 1) + "_next",
						sProp = sPath.substring(sPath.lastIndexOf("/") + 1);
					this._settingsModel.setProperty(sNext + "/" + sProp, vValue);
				}
			}
			var ocurrentLayerManifestChangeTexts = this._currentLayerManifestChanges["texts"];
			if (ocurrentLayerManifestChangeTexts) {
				oTexts = merge(oTexts, ocurrentLayerManifestChangeTexts);
			}
		}
		if (!deepEqual(oTexts, {})) {
			this._settingsModel.setProperty("/texts", oTexts);
		}
		if (!deepEqual(oDesigntime, {})) {
			this._settingsModel.setProperty("/:designtime", oDesigntime);
		}
	};
	/**
	 * Creates a designtime instance based on an configuration section within the manifest.
	 * This is valid if there is no explicit sap.card/designtime module in the manifest itself.
	 */
	Editor.prototype._createParameterDesigntime = function (oConfiguration) {
		var oSettings = {},
			sBasePath = this.getConfigurationPath() + "/parameters",
			sMode = this.getMode();
		if (oConfiguration && oConfiguration.parameters) {
			oSettings.form = oSettings.form || {};
			oSettings.form.items = oSettings.form.items || {};
			var oItems = oSettings.form.items;
			Object.keys(oConfiguration.parameters).forEach(function (n) {
				oItems[n] = merge({
					manifestpath: sBasePath + "/" + n + "/value",
					editable: (sMode !== "translation"),
					_settingspath: "/form/items/" + n
				}, oConfiguration.parameters[n]);
				var oItem = oItems[n];
				if (!oItem.type) {
					oItem.type = "string";
				}
				if (!oItem.hasOwnProperty("visible")) {
					oItem.visible = true;
				}
			});
		}
		return new Designtime(oSettings);
	};

	/**
	 * Adds additional settings for destinations section in admin mode and all modeß
	 * @param {object} oConfiguration
	 */
	Editor.prototype._addDestinationSettings = function (oConfiguration) {
		var oSettings = this._oDesigntimeInstance.getSettings(),
			sBasePath = this.getConfigurationPath() + "/destinations";
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		if (oSettings && oConfiguration && oConfiguration.destinations) {
			this._destinationGroupAtTop = false;
			var oItems = oSettings.form.items,
				oDestinations = {},
				oHost = this.getHostInstance();
			var oDestinationGroup = {
				label: this._oResourceBundle.getText("EDITOR_DESTINATIONS") || "Destinations",
				type: "group",
				expanded: true,
				visible: true,
				_settingspath: "/form/items/destination.group"
			};
			if (oItems["destination.group"]) {
				// if the 1st item is destination group, set this._destinationGroupAtTop to true. Then render destination group at top
				this._destinationGroupAtTop = Object.keys(oItems)[0] === "destination.group";
				oDestinationGroup = merge(oDestinationGroup, oItems["destination.group"]);
				delete oItems["destination.group"];
			}
			oDestinations["destination.group"] = oDestinationGroup;
			Object.keys(oConfiguration.destinations).forEach(function (n) {
				var oDestination = merge({
					manifestpath: sBasePath + "/" + n + "/name", //destination points to name not value
					visible: true,
					type: "destination",
					editable: true,
					allowDynamicValues: false,
					allowSettings: false,
					value: oConfiguration.destinations[n].name,
					defaultValue: oConfiguration.destinations[n].defaultUrl,
					_settingspath: "/form/items/" + [n + ".destination"],
					_values: [],
					_destinationName: n
				}, oConfiguration.destinations[n]);
				if (typeof oDestination.label === "undefined") {
					oDestination.label = n;
				}
				if (oItems[n + ".destination"]) {
					oDestination = merge(oDestination, oItems[n + ".destination"]);
					delete oItems[n + ".destination"];
				}
				oDestinations[n + ".destination"] = oDestination;
			});
			// reorder the items according by this._destinationGroupAtTop
			if (this._destinationGroupAtTop) {
				oSettings.form.items = merge(oDestinations, oItems);
			} else {
				oSettings.form.items = merge(oItems, oDestinations);
			}
			var getDestinationsDone = false;
			if (oHost) {
				this._destinationsModel.setProperty("/_loading", true);
				this._destinationsModel.checkUpdate(true);
				this.getHostInstance().getDestinations().then(function (a) {
					getDestinationsDone = true;
					this._destinationsModel.setProperty("/_values", a);
					this._destinationsModel.setProperty("/_loading", false);
					this._destinationsModel.setSizeLimit(a.length);
					this._destinationsModel.checkUpdate(true);
				}.bind(this)).catch(function () {
					//Fix DIGITALWORKPLACE-4359, retry once for the timeout issue
					return this.getHostInstance().getDestinations();
				}.bind(this)).then(function (b) {
					if (getDestinationsDone) {
						return;
					}
					this._destinationsModel.setProperty("/_values", b);
					this._destinationsModel.setProperty("/_loading", false);
					this._destinationsModel.setSizeLimit(b.length);
					this._destinationsModel.checkUpdate(true);
				}.bind(this)).catch(function (e) {
					this._destinationsModel.setProperty("/_loading", false);
					this._destinationsModel.checkUpdate(true);
					Log.error("Can not get destinations list from '" + oHost.getId() + "'.");
				}.bind(this));
			}
		}
	};

	/**
	 * Delete destinations if mode is NOT admin or all
	 */
	Editor.prototype._deleleDestinationSettings = function () {
		var oSettings = this._oDesigntimeInstance.getSettings();
		oSettings.form = oSettings.form || {};
		oSettings.form.items = oSettings.form.items || {};
		delete oSettings.form.items["destination.group"];
		for (var n in oSettings.form.items) {
			var oItem = oSettings.form.items[n];
			if (oItem.type === "destination") {
				delete oSettings.form.items[n];
			}
		}
	};

	/**
	 * Returns the default value that was given by the developer for the given path
	 * @param {string} sPath
	 */
	Editor.prototype._getManifestDefaultValue = function (sPath) {
		return this._oInitialManifestModel.getProperty(sPath);
	};
	Editor.prototype._getManifestBeforelValue = function (sPath) {
		return this._beforeManifestModel.getProperty(sPath);
	};
	/**
	 * Returns whether the value is translatable via the handlbars translation syntax {{KEY}}
	 * For other than string values false is returned
	 * @param {any} vValue
	 */
	Editor.prototype._isValueWithHandlebarsTranslation = function (vValue) {
		if (typeof vValue === "string") {
			return !!vValue.match(REGEXP_TRANSLATABLE);
		}
		return false;
	};

	Editor.prototype._isValueWithParameterSyntax = function (vValue) {
		if (typeof vValue === "string") {
			return !!vValue.match(REGEXP_PARAMETERS);
		}
		return false;
	};

	Editor.prototype.prepareFieldsInKey = function(oConfig) {
		//get field names in the item key
		this._sKeySeparator = oConfig.values.keySeparator;
		if (!this._sKeySeparator) {
			this._sKeySeparator = "#";
		}
		var sKey = oConfig.values.item.key;
		this._aFields = sKey.split(this._sKeySeparator);
		for (var n in this._aFields) {
			//remove the {} in the field
			if (this._aFields[n].startsWith("{")) {
				this._aFields[n] = this._aFields[n].substring(1);
			}
			if (this._aFields[n].endsWith("}")) {
				this._aFields[n] = this._aFields[n].substring(0, this._aFields[n].length - 1);
			}
		}
	};

	Editor.prototype.getKeyFromItem = function(oItem) {
		var sItemKey = "";
		this._aFields.forEach(function (field) {
			sItemKey += oItem[field].toString() + this._sKeySeparator;
		}.bind(this));
		if (sItemKey.endsWith(this._sKeySeparator)) {
			sItemKey = sItemKey.substring(0, sItemKey.length - this._sKeySeparator.length);
		}
		return sItemKey;
	};

	Editor.oResourceBundle = Library.getResourceBundleFor("sap.ui.integration", Utils._language);

	//init context entries
	Editor.initContextEntries = function () {
		return {
			empty: {
				label: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_VAL"),
				type: "string",
				description: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_DESC"),
				placeholder: "",
				value: ""
			},
			"editor.internal": {
				label: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_INTERNAL_VAL"),
				todayIso: {
					type: "string",
					label: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					description: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_DESC"),
					tags: [],
					placeholder: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					customize: ["format.dataTime"],
					value: "{{parameters.TODAY_ISO}}"
				},
				nowIso: {
					type: "string",
					label: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					description: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_DESC"),
					tags: [],
					placeholder: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					customize: ["dateFormatters"],
					value: "{{parameters.NOW_ISO}}"
				},
				currentLanguage: {
					type: "string",
					label: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					description: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					tags: ["technical"],
					customize: ["languageFormatters"],
					placeholder: Editor.oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					value: "{{parameters.LOCALE}}"
				}
			}
		};
	};

	//create static context entries
	CONTEXT_ENTRIES = Editor.initContextEntries();

	//change static members if language changed
	Editor.prototype._applyLanguageChange = function () {
		CONTEXT_ENTRIES = Editor.initContextEntries();
	};

	//map of language strings in their actual language representation, initialized in Editor.init
	Editor._oLanguages = {};

	//theming from parameters to css valiables if css variables are not turned on
	//find out if css vars are turned on
	Editor._appendThemeVars = function () {
		//if (!window.getComputedStyle(document.documentElement).getPropertyValue('--sapBackgroundColor')) {
		var aVars = [
			"sapUiButtonHoverBackground",
			"sapUiBaseBG",
			"sapUiContentLabelColor",
			"sapUiTileSeparatorColor",
			"sapUiHighlight",
			"sapUiListSelectionBackgroundColor",
			"sapUiNegativeText",
			"sapUiCriticalText",
			"sapUiPositiveText",
			"sapUiChartScrollbarBorderColor"
		];
		var mParams = Parameters.get({
			name: aVars,
			callback: function (_params) {
			   // this will only be called if params weren’t available synchronously
			}
		});
		if (mParams) {
			for (var n in mParams) {
				document.body.style.setProperty("--" + n, mParams[n]);
			}
		}
		//}
	};

	//initializes global settings
	Editor.init = function () {
		this.init = function () { }; //replace self

		//add theming variables if css vars are not turned on
		Editor._appendThemeVars();

		var sCssURL = sap.ui.require.toUrl("sap.ui.integration.editor.css.Editor".replace(/\./g, "/") + ".css");
		includeStylesheet(sCssURL);
		Editor._oLanguages = LoaderExtensions.loadResource("sap/ui/integration/editor/languages.json", {
			dataType: "json",
			failOnError: false,
			async: false
		});
	};

	/**
	 * attach theme changes
	 */
	Editor.prototype.onThemeChanged = function () {
		Editor._appendThemeVars();
	};

	Editor.init();

	return Editor;
});
