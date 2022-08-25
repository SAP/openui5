/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/m/Panel",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/MessageStrip",
	"sap/ui/core/Core"
], function (
	BaseField,
	Panel,
	IconTabBar,
	IconTabFilter,
	MessageStrip,
	Core
) {
	"use strict";

	/**
	 * @class Group Field which will contains multi parameters via Panel/Tab
	 * @extends sap.ui.integration.editor.fields.BaseField
	 * @alias sap.ui.integration.editor.fields.GroupField
	 * @author SAP SE
	 * @since 1.106.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.106.0
	 * @ui5-restricted
	 */
	var GroupField = BaseField.extend("sap.ui.integration.editor.fields.GroupField", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	GroupField.prototype.initVisualization = function (oConfig) {
		var oVisualization = oConfig.visualization;
		if (!oVisualization || oVisualization.type === "Panel") {
			oVisualization = {
				type: Panel,
				settings: {
					headerText: oConfig.label,
					visible: oConfig.visible,
					expandable: oConfig.expandable !== false,
					expanded: "{currentSettings>expanded}",
					width: "auto",
					backgroundDesign: "Transparent",
					objectBindings: {
						currentSettings: {
							path: "currentSettings>" + (oConfig._settingspath || "/form/items")
						},
						items: {
							path: "items>/form/items"
						},
						context: {
							path: "context>/"
						}
					},
					expand: function (oEvent) {
						var oControl = oEvent.getSource();
						var bExpand = oEvent.getParameter("expand");
						// handle error message strip for field
						var oConfig = this.getConfiguration();
						if (!oControl._level) {
							oControl._level = oConfig.level || 0;
						}
						var oMessageStrip = oControl._level === "1" ? this.getParent().getParent().getAggregation("_messageStrip") : this.getParent().getAggregation("_messageStrip");
						if (oMessageStrip === null) {
							oMessageStrip = Core.byId(this.getAssociation("_messageStrip"));
						}
						if (bExpand) {
							oControl.addContent(oMessageStrip);
							oControl.focus();
						}
					}.bind(this)
				}
			};
		} else if (oVisualization.type === "Tab") {
			oVisualization = {
				type: IconTabBar,
				settings: {
					expandable: oConfig.expandable !== false,
					visible: oConfig.visible,
					expanded: "{currentSettings>expanded}",
					objectBindings: {
						currentSettings: {
							path: "currentSettings>" + (oConfig._settingspath || "/form/items")
						},
						items: {
							path: "items>/form/items"
						},
						context: {
							path: "context>/"
						}
					},
					select: this.checkErrorsInIconTabBar.bind(this)
				}
			};
		}
		this._visualization = oVisualization;
		this.attachAfterInit(this._afterInit);
	};

	GroupField.prototype._afterInit = function () {
		var oConfig = this.getConfiguration();
		var oControl = this.getAggregation("_field");
		if (oControl instanceof Panel) {
			if (this.getMode() !== "translation") {
				var oResourceBundle = this.getResourceBundle();
				var oMessageStripOfPanel = new MessageStrip({
					id: oControl.getId() + "_strip",
					showIcon: false,
					visible: "{= !${currentSettings>expanded} && ${currentSettings>hasError} === true}",
					text: {
						path: 'currentSettings>errorType',
						formatter: function (errorType) {
							var sPanelTitle = "";
							switch (errorType) {
								case "Error":
									sPanelTitle = oResourceBundle.getText("EDITOR_GROUP_ERRORS");
									break;
								case "Warning":
									sPanelTitle = oResourceBundle.getText("EDITOR_GROUP_WARNINGS");
									break;
								default:
							}
							return sPanelTitle;
						}
					},
					type: "{currentSettings>errorType}",
					objectBindings: {
						currentSettings: {
							path: "currentSettings>" + (oConfig._settingspath || "/form/items")
						}
					}
				});
				if (oConfig.level !== "1") {
					oMessageStripOfPanel.setModel(this._settingsModel, "currentSettings");
				}
				oMessageStripOfPanel.addStyleClass("sapUiIntegrationEditorPanelMessageStrip");
				oControl._messageStrip = oMessageStripOfPanel;
			}

			oControl._cols = oConfig.cols || 2; //by default 2 cols
			oControl._level = oConfig.level || 0; //by default 0 level

			//add "aria-label" for each panel to make the landmark uniquely
			var oDelegate = {
				onAfterRendering: function(oEvent) {
					var oControl = oEvent.srcControl;
					var ePanel = document.getElementById(oControl.getId());
					ePanel.setAttribute("aria-label", oConfig.label);
					// handle error message for panel
					if (oControl._subItems && oControl._subItems.length > 0) {
						this.checkErrorsInSubItems(this._settingsModel, oControl);
					}
					var oMessageStrip = oControl._messageStrip;
					if (oControl._level !== "1" && oMessageStrip) {
						oMessageStrip.rerender();
					}
					if (oControl.getExpanded()) {
						// handle error message for sub panel/tab
						var oItems = oControl.getContent();
						oItems.forEach(function(oItem) {
							if (oItem.isA("sap.ui.integration.editor.fields.GroupField")) {
								var oItemControl = oItem.getAggregation("_field");
								if (oItemControl instanceof Panel && oItemControl._subItems && oItemControl._subItems.length > 0) {
									oItem.checkErrorsInSubItems(oItem._settingsModel, oItemControl);
								} else if (oItemControl instanceof IconTabBar && oItemControl.getItems().length > 0) {
									oItem.checkErrorsInIconTabBar();
								}
							}
						});
					}
				}.bind(this)
			};
			oControl.addEventDelegate(oDelegate);
		} else if (oControl instanceof IconTabBar) {
			var oIconTabFilter = new IconTabFilter({
				text: oConfig.label,
				visible: oConfig.visible,
				objectBindings: {
					currentSettings: {
						path: "currentSettings>" + (oConfig._settingspath || "/form/items")
					},
					items: {
						path: "items>/form/items"
					},
					context: {
						path: "context>/"
					}
				}
			});
			oControl.addItem(oIconTabFilter);
			oControl.setBackgroundDesign("Transparent");
			oControl.setHeaderBackgroundDesign("Transparent");
			// oControl.setHeaderBackgroundDesign("Solid");
			oControl.addStyleClass("sapUiIntegrationEditorSubGroup");
			// oControl.addStyleClass("sapUiIntegrationEditorSubGroup").addStyleClass("cardEditorIconTabBarBG");
			// handle messageStrip for tab filter
			if (this.getMode() !== "translation") {
				var oMessageStripOfTab = new MessageStrip({
					id: oControl.getId() + "_strip",
					showIcon: false,
					visible: false,
					objectBindings: {
						currentSettings: {
							path: "currentSettings>" + (oConfig._settingspath || "/form/items")
						}
					}
				});
				oMessageStripOfTab.addStyleClass("sapUiIntegrationEditorTabMessageStrip");
				oControl._messageStrip = oMessageStripOfTab;
			}
			// oControl._cols = oConfig.cols || 2; //by default 2 cols
			oControl._level = oConfig.level || 0; //by default 0 level
		}
	};

	GroupField.prototype.checkErrorsInIconTabBar = function (oEvent) {
		var oControl = this.getAggregation("_field"),
		oSelectITFKey = oControl.getSelectedKey(),
		aItems = oControl.getItems(),
		vExpanded = oControl.getExpanded(),
		vShowErrors = false;
		for (var n = 0; n < aItems.length; n++) {
			if (!vExpanded) {
				vShowErrors = true;
			} else if (aItems[n].getId() !== oSelectITFKey) {
				vShowErrors = true;
			} else if (aItems[n].getId() === oSelectITFKey) {
				vShowErrors = false;
			}
			if (vShowErrors) {
				var bHasError = false,
				sErrorType = "None";
				if (aItems[n]._subItems && aItems[n]._subItems.length > 0) {
					var oCurrentSettingsModel = aItems[n].getModel("currentSettings");
					var oResult = this.checkErrorsInSubItems(oCurrentSettingsModel, aItems[n]);
					bHasError = oResult.hasError;
					sErrorType = oResult.errorType;
				}
				if (bHasError) {
					var vITF = new IconTabFilter(),
					aItem = aItems[n];
					if (aItem.getItems().length > 0) {
						aItem.removeAllItems();
					}
					aItem.addItem(vITF);
					this._handleITBValidation(aItem, sErrorType);
					if (aItem._oExpandButton === undefined) {
						this._delayHandleITBValidation(aItem, sErrorType);
					} else {
						this._handleITBValidation(aItem, sErrorType);
					}
				}
			} else if (aItems[n].getItems().length > 0) {
				aItems[n].removeItem(aItems[n].getItems()[0]);
				if (aItems[n]._oExpandButton) {
					aItems[n]._oExpandButton.visible = false;
				}
				//handle error message for fields
				var tMessageStrip = this.getParent().getParent().getAggregation("_messageStrip");
				if (tMessageStrip === null) {
					tMessageStrip = Core.byId(this.getAssociation("_messageStrip"));
				}
				aItems[n].addContent(tMessageStrip);
			}
		}
	};

	GroupField.prototype.checkErrorsInSubItems = function (oModel, oControl) {
		var bHasError = false;
		var sErrorType = "None";
		for (var i = 0; i < oControl._subItems.length; i++) {
			var sSettingsPath = oControl._subItems[i].settingspath;
			var oItem = Core.byId(oControl._subItems[i].itemId);
			if (oModel.getProperty(sSettingsPath + "/hasError") === true && oItem.getVisible()) {
				bHasError = true;
				var sType = oModel.getProperty(sSettingsPath + "/errorType");
				if (sType === "Error") {
					sErrorType = "Error";
					break;
				} else if (sType === "Warning" && sErrorType !== "Error") {
					sErrorType = "Warning";
				}
			}
		}
		oModel.setProperty("hasError", bHasError, this.getBindingContext("currentSettings"));
		oModel.setProperty("errorType", sErrorType, this.getBindingContext("currentSettings"));
		return {
			hasError: bHasError,
			errorType: sErrorType
		};
	};

	GroupField.prototype._handleITBValidation = function (sItem, sErrorType) {
		var oResourceBundle = this.getResourceBundle();
		if (sItem.getItems().length > 0 && sItem._oExpandButton) {
			var expandBTN = sItem._oExpandButton;
			var errorMSG = null;
			if (sErrorType === "Error") {
				errorMSG = oResourceBundle.getText("EDITOR_GROUP_ERRORS");
				expandBTN.setIcon("sap-icon://message-error");
				expandBTN.addStyleClass("errorBTNImage");
			} else if (sErrorType === "Warning") {
				errorMSG = oResourceBundle.getText("EDITOR_GROUP_WARNINGS");
				expandBTN.setIcon("sap-icon://message-warning");
				expandBTN.addStyleClass("warningBTNImage");
			}
			//remove expandButton addtional information
			expandBTN.setTooltip(null);
			expandBTN.addEventDelegate({
				onAfterRendering: function(oEvent) {
					var eExpandBTN = document.getElementById(expandBTN.getId());
					eExpandBTN.setAttribute("aria-label", "With validation errors");
					eExpandBTN.setAttribute("title", "");
				}
			});
			expandBTN.setEnabled(false);
			expandBTN.addStyleClass("errorBTN").addStyleClass("errorBTNDisabled");
			var iITBar = expandBTN.getParent().getParent().getParent();
			var iMessageStrip = Core.byId(iITBar.getId() + "_strip");
			expandBTN.addEventDelegate({
				onmouseover: function() {
					iMessageStrip.setVisible(true);
					iMessageStrip.setType(sErrorType);
					iMessageStrip.setText(errorMSG);
				},
				onmouseout: function() {
					iMessageStrip.setVisible(false);
				}
			}, this);
		}
	};

	GroupField.prototype._delayHandleITBValidation = function(oItem, sErrorType) {
		var that = this;
		var checkExpandBTNExist = setInterval(function() {
			if (oItem._oExpandButton) {
				that._handleITBValidation(oItem, sErrorType);
				clearInterval(checkExpandBTNExist);
			}
		}, 50);
	};

	return GroupField;
});