/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/base/util/deepEqual",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/Element",
	"sap/m/FlexItemData",
	"sap/m/FlexBox",
	"sap/ui/core/UIArea",
	"./Constants"
], function(
	Renderer,
	deepEqual,
	HBox,
	VBox,
	Element,
	FlexItemData,
	FlexBox,
	UIArea,
	Constants
) {
	"use strict";

	/**
	 * Editor renderer.
	 *
	 * @namespace
	 * @alias sap.ui.integration.editor.EditorRenderer
	 * @static
	 * @private
	 */
	const EditorRenderer = Renderer.extend("sap.ui.integration.editor.EditorRenderer", {
		apiVersion: 2
	});

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.integration.editor.Editor} oControl an object representation of the control that should be rendered
	 */
	EditorRenderer.render = function (oRm, oControl) {
		var oPreview = oControl.getAggregation("_preview");
		var bShowPreview = oControl.getMode() !== Constants.EDITOR_MODE.TRANSLATION && oControl.hasPreview();
		var sPreviewPosition = oControl.getPreviewPosition();
		if (bShowPreview && (sPreviewPosition === "top" || sPreviewPosition === "bottom")) {
			oRm.openStart("div", oControl);
			oRm.openEnd();
			//render the additional content if alignment of it is "top"
			if (oControl.isFieldReady() && sPreviewPosition === "top") {
				oRm.renderControl(oPreview);
			}
		}
		if (bShowPreview && sPreviewPosition === "left") {
			oRm.openStart("div", oControl);
			oRm.class("sapUiIntegrationEditor");
			oRm.openEnd();
			if (oControl.isFieldReady()){
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
		// render the Child editors tree
		var oRef = oControl.getId() + "_childsTreeContainer";
		var bChildTreeRendered;
		var renderChildsTreePromise;
		if (oControl.isFieldReady() && oControl._oChildTree) {
			bChildTreeRendered = false;
			// render the container for Child editors tree
			oRm.openStart("div", oRef);
			oRm.class("childsTreeContainer");
			oRm.openEnd();
			oRm.close("div");

			// if the container is not rendered in body immediately by above codes, wait for it to be created
			var waitForContainer = new Promise((resolve) => {
				const observer = new MutationObserver((mutations, obs) => {
					const container = document.getElementById(oRef);
					if (container) {
						obs.disconnect();
						resolve(container);
					}
				});
				observer.observe(document.body, {
					childList: true,
					subtree: true
				});
			});

			// wait for the container to be created and then render the nodes tree
			renderChildsTreePromise = waitForContainer.then((container) => {
				// create a UIArea for the container and render the tree into it
				var oUIArea = UIArea.create(oRef);
				oUIArea.addContent(oControl._oChildTree);
				// focus the selected item in the nodes tree
				var expandTreeItemPromise = new Promise(function (resolve, reject) {
					setTimeout(function () {
						if (oControl._oChildTree._itemIndex) {
							var oItem = oControl._oChildTree.getItems().find(function(item) {
								return item.getBindingContext().getPath() === oControl._oChildTree._itemIndex;
							});
							if (oItem) {
								oItem.focus();
								if (!oItem.isLeaf() && !oItem.getExpanded()) {
									oControl._oChildTree.expand(oControl._oChildTree.indexOfItem(oItem));
								}
							}
						} else {
							oControl._oChildTree.expand(0);
						}
						bChildTreeRendered = true;
						setTimeout(function () {
							resolve({});
						}, 100);
					}, 100);
				});
				return expandTreeItemPromise;
			});
		}
		if (oControl.isFieldReady()) {
			//surrounding div tag for form <div class="sapUiIntegrationEditorForm"
			oRm.openStart("div");
			oRm.class("sapUiIntegrationEditorForm");
			if (oControl.getMode() !== Constants.EDITOR_MODE.TRANSLATION) {
				oRm.class("settingsButtonSpace");
			}
			oRm.openEnd();
			if (oControl.getMode() !== Constants.EDITOR_MODE.TRANSLATION) {
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
				for (var i = 0; i < oItems.length; i++) {
					var oItem = oItems[i];
					if (oControl.getMode() !== Constants.EDITOR_MODE.TRANSLATION) {
						if (oItem.isA("sap.ui.integration.editor.fields.GroupField")) {
							var oGroupControl = oItem.getAggregation("_field");
							if (!oGroupControl) {
								continue;
							}
							if (oSubGroup) {
								//add current col fields to previous sub panel, then empty the col fields list
								oColFieldsOfSubGroup = EditorRenderer.addColFieldsOfSubGroup(oColFieldsOfSubGroup, oSubGroup);
								//add sub group to panel
								if (oGroupControl.isA("sap.m.Panel") && oSubGroup.isA("sap.m.Panel")) {
									EditorRenderer.addSubPanel(oPanel, oSubGroup);
								} else {
									EditorRenderer.addSubTab(oPanel, oSubGroup);
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
									oColFields = EditorRenderer.addColFields(oColFields, oPanel);
									// EditorRenderer.renderPanel(oRm, oPanel);
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
									oColFields = EditorRenderer.addColFields(oColFields, oPanel);
									//render previous panel
									EditorRenderer.renderPanel(oRm, oPanel);
									oSubGroup = null;
								}
								oPanel = oGroupControl;
								oPanel._subItems = oPanel._subItems || [];
								oPanel.addStyleClass("sapUiIntegrationEditorItem");
							}
							if (i === oItems.length - 1) {
								//add current col fields to panel, then empty the col fields list
								oColFields = EditorRenderer.addColFields(oColFields, oPanel);
								EditorRenderer.renderPanel(oRm, oPanel);
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
									oColFieldsOfSubGroup = EditorRenderer.addColFieldsOfSubGroup(oColFieldsOfSubGroup, oSubGroup);
									//add sub panel to panel
									EditorRenderer.addSubPanel(oPanel, oSubGroup);
								}
								//add current col fields to panel, then empty the col fields list
								oColFields = EditorRenderer.addColFields(oColFields, oPanel);
								EditorRenderer.renderPanel(oRm, oPanel);
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
										oColFieldsOfSubGroup = EditorRenderer.addColFieldsOfSubGroup(oColFieldsOfSubGroup, oSubGroup);
									} else {
										oColFields = EditorRenderer.addColFields(oColFields, oPanel);
									}
								} else if (oColFieldsOfSubGroup.length === 2) {
									oColFieldsOfSubGroup = EditorRenderer.addColFieldsOfSubGroup(oColFieldsOfSubGroup, oSubGroup);
								} else if (oColFields.length === 2) {
									oColFields = EditorRenderer.addColFields(oColFields, oPanel);
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
								oColFieldsOfSubGroup = EditorRenderer.addColFieldsOfSubGroup(oColFieldsOfSubGroup, oSubGroup);
								oSubGroup.addContent(oItem);
							} else {
								oColFields = EditorRenderer.addColFields(oColFields, oPanel);
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
											oColFieldsOfSubGroup = EditorRenderer.addColFieldsOfSubGroup(oColFieldsOfSubGroup, oSubGroup);
										}
										if (oConfig.hint) {
											var oHint = oControl.createHint(oConfig.hint, oItem.getParameterId());
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
											oColFields = EditorRenderer.addColFields(oColFields, oPanel);
										}
										if (oConfig.hint) {
											var oHint = oControl.createHint(oConfig.hint, oItem.getParameterId());
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
									oColFieldsOfSubGroup = EditorRenderer.addColFieldsOfSubGroup(oColFieldsOfSubGroup, oSubGroup);
									oSubGroup.addContent(oHBox);
								} else {
									oColFields = EditorRenderer.addColFields(oColFields, oPanel);
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
										var oHint = oControl.createHint(oConfig.hint, oItem.getParameterId());
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
								oColFieldsOfSubGroup = EditorRenderer.addColFieldsOfSubGroup(oColFieldsOfSubGroup, oSubGroup);
								//add sub panel to panel
								if (oSubGroup.isA("sap.m.Panel")) {
									EditorRenderer.addSubPanel(oPanel, oSubGroup);
								} else {
									EditorRenderer.addSubTab(oPanel, oSubGroup);
								}
							}
							//add current col fields to panel, then empty the col fields list
							oColFields = EditorRenderer.addColFields(oColFields, oPanel);
							EditorRenderer.renderPanel(oRm, oPanel);
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
									EditorRenderer.addSubPanel(oPanel, oSubGroup);
								} else {
									EditorRenderer.addSubTab(oPanel, oSubGroup);
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
								oColFields = EditorRenderer.addColFields(oColFields, oPanel);
								EditorRenderer.renderPanel(oRm, oPanel);
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
									EditorRenderer.addSubPanel(oPanel, oSubGroup);
								} else {
									EditorRenderer.addSubTab(oPanel, oSubGroup);
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
		if (oControl.isFieldReady() && !oControl.isReady()) {
			oControl.fireUIReady();
			if (oControl._aFieldDataReadyPromise.length > 0) {
				Promise.all(oControl._aFieldDataReadyPromise).then(function () {
					oControl._aFieldDataReadyPromise = [];
					// check ready status again since this is in async promise
					if (!oControl.isReady()) {
						if (bChildTreeRendered === false && renderChildsTreePromise) {
							renderChildsTreePromise.then(function() {
								if (oControl._oChildTree.getModel().getData()[0].dataReady) {
									// add a timeout to make sure all UI updates are done before firing ready
									setTimeout(function () {
										oControl._ready = true;
										oControl.fireReady();
									}, 200);
								} else {
									// attach to child tree data ready event, then fire ready
									oControl.attachEventOnce("childTreeDataReady", function() {
										// add a timeout to make sure all UI updates are done before firing ready
										setTimeout(function () {
											oControl._ready = true;
											oControl.fireReady();
										}, 200);
									});
								}
							});
						} else {
							oControl._ready = true;
							oControl.fireReady();
						}
					}
				});
			} else if (bChildTreeRendered === false && renderChildsTreePromise) {
				renderChildsTreePromise.then(function() {
					if (oControl._oChildTree.getModel().getData()[0].dataReady) {
						// add a timeout to make sure all UI updates are done before firing ready
						setTimeout(function () {
							oControl._ready = true;
							oControl.fireReady();
						}, 200);
					} else {
						// attach to child tree data ready event, then fire ready
						oControl.attachEventOnce("childTreeDataReady", function() {
							// add a timeout to make sure all UI updates are done before firing ready
							setTimeout(function () {
								oControl._ready = true;
								oControl.fireReady();
							}, 200);
						});
					}
				});
			} else {
				oControl._ready = true;
				oControl.fireReady();
			}
		}
	};

	/**
	 * Flushes pending col-fields into oPanel as a FlexBox row, returns an empty array.
	 *
	 * @param {Array} oColFields
	 * @param {sap.m.Panel} oPanel
	 * @returns {Array} empty array to replace oColFields
	 */
	EditorRenderer.addColFields = function (oColFields, oPanel) {
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
		}
		return [];
	};

	/**
	 * Flushes pending sub-group col-fields into oSubGroup as a FlexBox row, returns an empty array.
	 *
	 * @param {Array} oColFieldsOfSubGroup
	 * @param {sap.m.Panel} oSubGroup
	 * @returns {Array} empty array to replace oColFieldsOfSubGroup
	 */
	EditorRenderer.addColFieldsOfSubGroup = function (oColFieldsOfSubGroup, oSubGroup) {
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
		}
		return [];
	};

	/**
	 * Renders a panel into the RenderManager output if it has visible content.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 * @param {sap.m.Panel} oPanel
	 */
	EditorRenderer.renderPanel = function (oRm, oPanel) {
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

	/**
	 * Adds oSubGroup into oPanel if it has content.
	 *
	 * @param {sap.m.Panel} oPanel
	 * @param {sap.m.Panel} oSubGroup
	 */
	EditorRenderer.addSubPanel = function (oPanel, oSubGroup) {
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
		}
	};

	/**
	 * Adds oSubGroup into the IconTabBar found inside oPanel.
	 *
	 * @param {sap.m.Panel} oPanel
	 * @param {sap.m.IconTabFilter} oSubGroup
	 */
	EditorRenderer.addSubTab = function (oPanel, oSubGroup) {
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

	return EditorRenderer;

});
