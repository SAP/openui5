/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/ResponsivePopover",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/CheckBox",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/Input",
	"sap/ui/integration/util/ParameterMap",
	"sap/base/util/merge",
	"sap/ui/core/Core"
], function (
	Control,
	Popover,
	JSONModel,
	Button,
	SegmentedButton,
	SegmentedButtonItem,
	VBox,
	HBox,
	Select,
	ListItem,
	Label,
	Text,
	Title,
	CheckBox,
	Menu,
	MenuItem,
	Input,
	ParameterMap,
	merge,
	Core
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.editor.fields.Settings
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var Settings = Control.extend("sap.ui.integration.designtime.editor.fields.Settings", {
		metadata: {},
		renderer: function () {
		}
	});
	Settings.prototype.setConfiguration = function (oConfig) {
		this._originalConfig = oConfig;
		oConfig = merge({}, oConfig);
		var oModel = new JSONModel(oConfig);
		this.setModel(oModel, "currentSettings");
		this.bindElement({
			path: "currentSettings>/"
		});
	};

	Settings.prototype.open = function (oField, oReferrer, oPreview, oHost, oParent, fnApply, fnCancel) {
		this.addDependent(oPopover);
		this.oHost = oHost;
		this.fnApply = fnApply;
		this.fnCancel = fnCancel;
		this._oOpener = oParent;
		bCancel = true;
		oField.addDependent(this);
		oCurrentInstance = this;
		//force update of all bindings
		this.getModel("currentSettings").checkUpdate(true, true);
		applyVariableDescription(oResourceBundle.getText("CARDEDITOR_SELECT_FROM_LIST"), []);
		if (oReferrer) {
			var iOffsetWidth = oPreview.getDomRef().offsetWidth === 0 ? 270 : oPreview.getDomRef().offsetWidth;
			oPopover.setContentWidth(iOffsetWidth + "px");
			oPopover.setContentHeight((oPreview.getDomRef().offsetHeight - 80) + "px");
			oPopover.setPlacement("Right");
			oDynamicValueField.setValue(oField._label);
			oPopover.openBy(oField);
		} else {
			oPopover.open();
		}
		oCurrentModel = this.getModel("currentSettings");
		if (oCurrentModel.getProperty("/_hasDynamicValue")) {
			selectDynamic();
		} else if (oCurrentModel.getProperty("/_hasSettings")) {
			selectSettings();
		} else if (oCurrentModel.getProperty("/allowDynamicValues")) {
			selectDynamic();
		} else if (oCurrentModel.getProperty("/allowSettings")) {
			selectSettings();
		}
	};

	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration"),
		oCurrentModel,
		bCancel,
		oCurrentInstance = null,
		oDynamicPanel,
		oSettingsPanel,
		oDescriptionLabel,
		oDynamicValueField,
		oMenu,
		aMenuItems,
		oSelectFormat,
		oFormatDescriptionLabel;
	Settings.prototype._applyCurrentSettings = function () {
		this.fnApply(oCurrentModel.getData());
	};

	Settings.prototype._cancelCurrentSettings = function () {
		this.fnCancel(this._originalConfig);
	};

	Settings.prototype.destroy = function () {
		this.removeDependent(oPopover);
		return Control.prototype.destroy.apply(this, arguments);
	};

	var oPopover = new Popover({
		showArrow: true,
		contentWidth: "400px",
		showHeader: false,
		horizontalScrolling: false,
		modal: false,
		endButton: new Button({
			text: oResourceBundle.getText("CARDEDITOR_MORE_CANCEL"),
			press: function () {
				oPopover.close();
			}
		}),
		beginButton: new Button({
			text: oResourceBundle.getText("CARDEDITOR_MORE_OK"),
			type: "Emphasized",
			press: function () {
				oCurrentInstance._applyCurrentSettings();
				bCancel = false;
				oPopover.close();
			}
		}),
		afterClose: function () {
			if (bCancel) {
				oCurrentInstance._cancelCurrentSettings();
			}
			bCancel = true;
		}
	});
	oPopover.attachAfterOpen(function () {
		var oFooter = this.getDomRef().querySelector("footer"),
			oCVDom = oCurrentValue.getDomRef();
		if (oCVDom.nextSibling !== oFooter) {
			oFooter.parentNode.insertBefore(oCVDom, oFooter);
			oFooter.style.marginTop = "0rem";
			oCVDom.style.display = "flex";
		}
		var oResetToDefaultButtonDom = oResetToDefaultButton.getDomRef(),
			oInsert = oFooter.querySelector("button").parentNode;
		if (oResetToDefaultButtonDom) {
			oInsert.insertBefore(oResetToDefaultButtonDom, oInsert.firstChild);
		}

		window.requestAnimationFrame(function () {
			oPopover.getDomRef() && (oPopover.getDomRef().style.opacity = "1");
		});
	});

	function selectSettings() {
		oSettingsPanel.setVisible(true);
		oDynamicPanel.setVisible(false);
		oSegmentedButton.setSelectedKey("settings");
		var oCVDom = oCurrentValue.getDomRef();
		window.requestAnimationFrame(function () {
			oCVDom && (oCVDom.style.opacity = "0");
		});
	}

	function selectDynamic() {
		oSettingsPanel.setVisible(false);
		oDynamicPanel.setVisible(true);
		oSegmentedButton.setSelectedKey("dynamic");
		var oFlat = oCurrentInstance.getModel("contextflat"),
			o = oFlat._getValueObject(oCurrentModel.getProperty("/value"));
		if (o && o.object.label) {
			oDynamicValueField.setValue(o.object.label);
			applyVariableDescription(o.object.description, o.object.tags);
			if (o.path === "empty") {
				oDynamicValueField.setValue(o.object.label);
			}
			updateCurrentValue(o);
		}
		var oCVDom = oCurrentValue.getDomRef();
		window.requestAnimationFrame(function () {
			oCVDom && (oCVDom.style.opacity = "1");
		});
	}

	oPopover.addStyleClass("sapUiIntegrationFieldSettings");
	var oSegmentedButton = new SegmentedButton({
		width: "100%",
		visible: "{= ${currentSettings>allowDynamicValues} && ${currentSettings>allowSettings}}"
	});

	var oDynamicValueButton = new SegmentedButtonItem({
		text: oResourceBundle.getText("CARDEDITOR_MORE_DYNAMICVALUES"),
		key: "dynamic",
		icon: "{= ${currentSettings>_hasDynamicValue} ? 'sap-icon://display-more' : 'sap-icon://enter-more'}",
		width: "50%",
		press: selectDynamic
	});

	oDynamicValueButton.addStyleClass("dynbtn sel");

	var oSettingsButton = new SegmentedButtonItem({
		text: oResourceBundle.getText("CARDEDITOR_MORE_SETTINGS"),
		key: "settings",
		icon: "sap-icon://action-settings",
		width: "50%",
		press: selectSettings
	});
	oSettingsButton.addStyleClass("setbtn");

	oSegmentedButton.addItem(oDynamicValueButton);
	oSegmentedButton.addItem(oSettingsButton);

	var oDynamicValueText = new Text({
		text: oResourceBundle.getText("CARDEDITOR_MORE_DYNAMICVALUES"),
		visible: "{= ${currentSettings>allowDynamicValues} && !${currentSettings>allowSettings}}"
	});
	oDynamicValueText.addStyleClass("sapUiTinyMagin");

	var oSettingsText = new Text({
		text: oResourceBundle.getText("CARDEDITOR_MORE_SETTINGS"),
		visible: "{= !${currentSettings>allowDynamicValues} && ${currentSettings>allowSettings}}"
	});
	oSettingsText.addStyleClass("sapUiTinyMagin");

	var oTitle = new HBox({
		width: "100%",
		items: [oSegmentedButton, oDynamicValueText, oSettingsText]
	});
	oTitle.addStyleClass("headertitle");

	var oCurrentValue = new VBox({
		width: "100%",
		items: [
			new Text({
				text: oResourceBundle.getText("CARDEDITOR_ACTUAL_VALUE")
			}),
			new Input({
				value: {
					path: "currentSettings>_currentContextValue"
				},
				editable: false
			})]
	});
	oCurrentValue.addStyleClass("currentval");
	var oResetToDefaultButton = new Button({
		type: "Transparent",
		text: oResourceBundle.getText("CARDEDITOR_MORE_RESET"),
		enabled: "{= ${currentSettings>_next/visible} === false || ${currentSettings>_next/editable} === false || ${currentSettings>_next/allowDynamicValues} === false || ${currentSettings>_beforeValue} !== ${currentSettings>value}}",
		tooltip: oResourceBundle.getText("CARDEDITOR_MORE_SETTINGS_P_ADMIN_RESET"),
		press: function () {
			setNextSetting("visible", true);
			setNextSetting("editable", true);
			setNextSetting("allowDynamicValues", true);
			if (oCurrentModel.getProperty("/translatable")) {
				oCurrentModel.setProperty("/value", oCurrentModel.getProperty("/_translatedDefaultValue"));
				oCurrentModel.setProperty("/_changed", false);
			} else {
				oCurrentModel.setProperty("/value", oCurrentModel.getProperty("/_beforeValue"));
			}

			oPopover.getBeginButton().firePress();
		}
	});
	oResetToDefaultButton.addStyleClass("resetbutton");

	var oHeader = new VBox({
		width: "100%",
		items: [
			oTitle,
			oCurrentValue,
			oResetToDefaultButton
		]
	});
	oHeader.addStyleClass("tabs");

	oPopover.setCustomHeader(oHeader);

	function setNextSetting(sProperty, vValue) {
		if (!oCurrentModel.getProperty("/_next")) {
			oCurrentModel.setProperty("/_next", {});
		}
		oCurrentModel.setProperty("/_next/" + sProperty, vValue);
	}
	function createMenuItems(oData, path) {
		var a = [];
		for (var n in oData) {
			if (oData[n] && oData[n].label) {
				var oItem = new MenuItem({
					text: oData[n].label
				});
				oItem.__data = oData[n];
				oData[n].pathvalue = (path + "/" + n).substring(1);
				a.push(oItem);
				var sub = createMenuItems(oData[n], path + "/" + n);
				for (var i = 0; i < sub.length; i++) {
					oItem.addItem(sub[i]);
				}
			}
		}
		return a;
	}

	function createPopupContent() {
		oDynamicPanel = new VBox({ visible: true });
		oSettingsPanel = new VBox({ visible: false });
		oDynamicPanel.addStyleClass("sapUiSmallMargin");
		oDynamicValueField = new Input({
			width: "100%",
			showValueHelp: true,
			valueHelpOnly: true,
			valueHelpRequest: function () {
				if (oMenu) {
					oMenu.destroy();
				}
				oMenu = new Menu({});
				aMenuItems = createMenuItems(oDynamicPanel.getModel("context").getData(), "");
				for (var i = 0; i < aMenuItems.length; i++) {
					oMenu.addItem(aMenuItems[i]);
				}
				oMenu.attachItemSelected(function (oEvent) {
					var oData = oEvent.getParameter("item").__data;
					applyVariableDescription(oData.description || "", oData.tags || []);
					oDynamicValueField.setValue(oData.placeholder || oData.label);
					//get the path and value
					var oFlat = oCurrentInstance.getModel("contextflat");
					updateCurrentValue(oFlat._getPathObject(oData.pathvalue));
				});
				oDynamicValueField.addDependent(oMenu);
				oMenu.addStyleClass("sapUiIntegrationFieldSettingsMenu");
				oMenu.openBy(oDynamicValueField, false, null, null, "1 0");
			}
		});


		oDynamicValueField.addStyleClass("selectvariable");


		var oVBox = new VBox({
			items: [
				new Label({ text: "Select a dynamic value" }),
				oDynamicValueField
			]
		});
		oDynamicPanel.addItem(oVBox);

		oDescriptionLabel = new Text({ text: "", maxLines: 6, renderWhitespace: true });
		oVBox = new VBox({
			width: "100%",
			items: [
				oDescriptionLabel
			]
		});
		oDescriptionLabel.addStyleClass("description");
		oDynamicPanel.addItem(oVBox);
		if (aFormatters.length === -1) {
			//not applicable right now
			oSelectFormat = new Select({
				width: "100%",
				enabled: true,
				change: function () {
					oFormatDescriptionLabel.setText(oSelectFormat.getSelectedItem()._data.description);
				}
			});
			oVBox = new VBox({
				visible: false,
				items: [
					new Label({ text: "Customize the value..." }),
					oSelectFormat
				]
			});
			oDynamicPanel.addItem(oVBox);
			oFormatDescriptionLabel = new Text({ text: "", maxLines: 4, renderWhitespace: true });
			oFormatDescriptionLabel.addStyleClass("description");
			oVBox = new VBox({
				width: "100%",
				items: [
					oFormatDescriptionLabel
				]
			});
			oDynamicPanel.addItem(oVBox);
			oDynamicPanel.getItems()[2].getItems()[0].addStyleClass("sapUiTinyMarginTop");
		}
		oDynamicPanel.getItems()[0].getItems()[0].addStyleClass("sapUiTinyMarginTop");

		//create the settings content
		oSettingsPanel.addStyleClass("sapUiSmallMargin");
		oSettingsPanel.addItem(new HBox({
			items: [
				new Title({ text: oResourceBundle.getText("CARDEDITOR_MORE_SETTINGS_P_ADMIN") }),
				new Button({
					type: "Transparent",
					tooltip: oResourceBundle.getText("CARDEDITOR_MORE_SETTINGS_P_ADMIN_RESET"),
					enabled: "{= ${currentSettings>_next/visible} === false || ${currentSettings>_next/editable} === false || ${currentSettings>_next/allowDynamicValues} === false}",
					icon: "sap-icon://reset",
					visible: false,
					press: function () {
						//set the focus to avoid closing of popup. enabled binding sets disabled and then focus handling breaks.
						oSettingsPanel.getItems()[1].getItems()[1].focus(); //first checkbox
						setNextSetting("visible", true);
						setNextSetting("editable", true);
						setNextSetting("allowDynamicValues", true);
					}
				})
			]
		}));
		oSettingsPanel.addItem(new HBox({
			items: [
				new Label({
					text: oResourceBundle.getText("CARDEDITOR_MORE_SETTINGS_P_ADMIN_VISIBLE")
				}),
				new CheckBox({
					selected: "{= ${currentSettings>_next/visible} !== false}",
					select: function (oEvent) {
						setNextSetting("visible", oEvent.getParameter("selected"));
					}
				})
			]
		}));
		oSettingsPanel.addItem(new HBox({
			items: [
				new Label({
					text: oResourceBundle.getText("CARDEDITOR_MORE_SETTINGS_P_ADMIN_EDIT")
				}),
				new CheckBox({
					selected: "{= ${currentSettings>_next/editable} !== false}",
					enabled: "{= ${currentSettings>_next/visible} !== false}",
					select: function (oEvent) {
						setNextSetting("editable", oEvent.getParameter("selected"));
					}
				})
			]
		}));
		oSettingsPanel.addItem(new HBox({
			visible: "{= ${currentSettings>allowDynamicValues}!== false}",
			items: [
				new Label({
					text: oResourceBundle.getText("CARDEDITOR_MORE_SETTINGS_P_ADMIN_DYN")
				}),
				new CheckBox({
					selected: "{= ${currentSettings>_next/allowDynamicValues} !== false}",
					enabled: "{= ${currentSettings>_next/visible} !== false && ${currentSettings>_next/editable} !== false}",
					select: function (oEvent) {
						setNextSetting("allowDynamicValues", oEvent.getParameter("selected"));
					}
				})
			]
		}));

		var oItems = oSettingsPanel.getItems();
		oItems[0].addStyleClass("stitle");
		oItems[1].addStyleClass("cbrow");
		oItems[2].addStyleClass("cbrow");
		oItems[3].addStyleClass("cbrow");

		oPopover.addContent(oDynamicPanel);
		oPopover.addContent(oSettingsPanel);
	}

	var aFormatters = [
		{
			formatMethod: "format.DateTime",
			sourceTypes: ["datetime", "date"],
			label: "Relative date/datetime text of the value",
			description: "Should be applied to dynamic values of type date or datetime or string values that represent a datetime in the format 'yyyy-MM-ddZhh:mm:ss'",
			example: "4 weeks ago",
			syntax: "handlebars",
			binding: "{= format.dateTime('__|VALUE|__',{relative:true})}"
		},
		{
			formatMethod: "format.DateTime",
			sourceTypes: ["datetime", "date"],
			label: "Short date/datetime text of the value",
			description: "Should be applied to dynamic values of type date, date-time or text values that represent a datetime in the format 'yyyy-MM-ddZhh:mm:ss.sss'",
			example: "9/18/20, 2:09 PM",
			binding: "{= format.dateTime('__|VALUE|__',{style:'short'})}"
		},
		{
			formatMethod: "format.DateTime",
			sourceTypes: ["datetime", "date"],
			label: "Medium date/datetime text of the value",
			description: "Should be applied to dynamic values of type date, date-time or text values that represent a datetime in the format 'yyyy-MM-ddThh:mm:ss.sssZ'",
			example: "Sep 18, 2020, 2:09:04 PM",
			binding: "{= format.dateTime('__|VALUE|__',{style:'medium'})}"
		},
		{
			formatMethod: "format.DateTime",
			sourceTypes: ["datetime", "date"],
			label: "Long date, date-time text of the value",
			description: "Should be applied to dynamic values of type date or date-time or string values that represent a datetime in the format 'yyyy-MM-ddThh:mm:ss.sssZ'",
			example: "Sep 18, 2020, 2:09:04 PM",
			binding: "{= format.dateTime('__|VALUE|__',{style:'long'})}"
		}
	];

	function applyFormatItems(aCustomize, sType) {
		aCustomize = aCustomize || [];
		oSelectFormat.removeAllItems();
		var aItems = [];
		oSelectFormat.addItem(new ListItem({
			text: "No customizing needed",
			key: ""
		}));
		for (var i = 0; i < aFormatters.length; i++) {
			//first add the best matches for the type
			var oFormatter = aFormatters[i],
				oItem = new ListItem({
					text: oFormatter.label,
					key: "key" + i
				});
			oItem._data = oFormatter;
			if (oFormatter.sourceTypes.indexOf(sType) > -1 || aCustomize.indexOf(oFormatter.formatMethod) > -1) {
				oSelectFormat.addItem(oItem);
			} else {
				aItems.push(oItem);
			}
		}
		for (var i = 0; i < aItems.length; i++) {
			oSelectFormat.addItem(aItems[i]);
		}
	}



	createPopupContent();

	function applyVariableDescription(sText, aTags) {
		aTags = aTags || [];
		if (aTags.indexOf("technical") > -1) {
			sText = sText + "\n" + oResourceBundle.getText("CARDEDITOR_MORE_DYNAMICVALUES_TECHHINT");
		}
		oDescriptionLabel.setText(sText);
	}


	function updateFormatterSelect(oData) {
		if (aFormatters.length === -1) {
			//currently not applicable
			if (!oData) {
				oSelectFormat.removeAllItems();
				oSelectFormat.addItem(
					new ListItem({
						text: "No customizing available for this value"
					})
				);
				oFormatDescriptionLabel.setText("");
				oSelectFormat.setEnabled(false);
			} else {
				applyFormatItems(oData.customize, oData.type);
				oSelectFormat.setEnabled(true);
			}
		}
	}

	function updateCurrentValue(oData) {
		if (oData) {
			oCurrentModel.setProperty("/_hasDynamicValue", true);
			var vValue = oData.value;
			oCurrentModel.setProperty("/value", vValue);
			oCurrentModel.setProperty("/_contextpath", oData.path);
			if (oData.object && oData.object.value && oData.object.value.indexOf("{{") === 0) {
				oCurrentModel.setProperty("/_currentContextValue", ParameterMap.processPredefinedParameter(oData.object.value));
				updateFormatterSelect(oData.object);
			} else {
				if (oData.path === "empty") {
					oCurrentModel.setProperty("/value", "");
					oCurrentModel.setProperty("/_currentContextValue", "");
					oCurrentModel.setProperty("/_hasDynamicValue", false);
					updateFormatterSelect();
				} else {
					updateFormatterSelect(oData.object);
					if (oData.object && oData.object.hasOwnProperty("value")) {
						oCurrentModel.setProperty("/_currentContextValue", oData.object.value);
					} else {
						oCurrentInstance.oHost.getContextValue(oData.path + "/value").then(function (v) {
							if (v === null) {
								oCurrentModel.setProperty("/_currentContextValue", "(not available)");
							} else {
								oCurrentModel.setProperty("/_currentContextValue", v);
							}
							oData.object && (oData.object.value = v);
						});
					}
				}
			}
		}
	}
	Settings._private = function () {
		return {
			oPopover: oPopover,
			oSegmentedButton: oSegmentedButton,
			oSettingsButton: oSettingsButton,
			oDynamicPanel: oDynamicPanel,
			oSettingsPanel: oSettingsPanel,
			oCurrentModel: oCurrentModel,
			updateCurrentValue: updateCurrentValue,
			oCurrentInstance: oCurrentInstance,
			oDynamicValueField: oDynamicValueField,
			getMenuItems: function () {
				return aMenuItems;
			},
			getMenu: function () {
				return oMenu;

			}
		};
	};

	return Settings;
});