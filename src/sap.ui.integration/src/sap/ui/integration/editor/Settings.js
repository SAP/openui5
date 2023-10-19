/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Popover",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
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
	"sap/ui/core/Core",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/ScrollContainer",
	"sap/base/util/ObjectPath",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/editor/fields/ObjectListField",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/integration/util/Utils",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual"
], function (
	Control,
	Popover,
	JSONModel,
	Button,
	SegmentedButton,
	SegmentedButtonItem,
	OverflowToolbar,
	ToolbarSpacer,
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
	Core,
	Table,
	Column,
	ColumnListItem,
	ScrollContainer,
	ObjectPath,
	BindingHelper,
	ObjectListField,
	SimpleForm,
	Utils,
	deepClone,
	deepEqual
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.editor.Settings
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var Settings = Control.extend("sap.ui.integration.editor.Settings", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: null // Dialog-like control without renderer
	});

	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration"),
		oCurrentModel,
		bCancel,
		oCurrentInstance = null,
		oDynamicPanel,
		oSettingsPanel,
		oTransformPanel,
		oDescriptionLabel,
		oDynamicValueField,
		oMenu,
		aMenuItems,
		oSelectFormat,
		oFormatDescriptionLabel,
		oSettingsButton,
		oSegmentedButton,
		oResetToDefaultButton,
		oPopover,
		iOffsetMaxHeight = 450,
		iOffsetMaxWidth = 360;
	Settings.prototype.setConfiguration = function (oConfig) {
		this._originalConfig = oConfig;
		oConfig = merge({}, oConfig);
		var oModel = new JSONModel(oConfig);
		this.setModel(oModel, "currentSettings");
		this.bindElement({
			path: "currentSettings>/"
		});
	};

	Settings.prototype.open = function (oControl, oReferrer, oEditor, oHost, oParent, fnApply, fnCancel) {
		var oCurrentData = this.getModel("currentSettings").getData(),
			sParameterId = oParent.getParameterId();
		//prepare fields in key
		if (oCurrentData.values && oCurrentData.values.item) {
			this.prepareFieldsInKey(oCurrentData);
		}
		oCurrentInstance = this;
		oPopover = createPopover(oCurrentData, oParent);
		this.addDependent(oPopover);
		this.oHost = oHost;
		this.fnApply = fnApply;
		this.fnCancel = fnCancel;
		this._oOpener = oParent;
		bCancel = true;
		oControl.addDependent(this);
		//adjust page admin values table height
		if (!oCurrentData.allowDynamicValues && oCurrentData.values && oCurrentData.values.item) {
			Core.byId(sParameterId + "_settings_popover_scroll_container").setHeight("155px");
		}
		//force update of all bindings
		this.getModel("currentSettings").checkUpdate(true, true);
		applyVariableDescription(oResourceBundle.getText("EDITOR_SELECT_FROM_LIST"), []);
		if (oReferrer) {
			var iOffsetHeight = oEditor.getDomRef().offsetHeight;
			iOffsetHeight = iOffsetHeight > iOffsetMaxHeight ? iOffsetMaxHeight : iOffsetHeight;
			oPopover.setContentHeight((iOffsetHeight - 50) + "px");
			var iOffsetWidth;
			var sPlacement = "Right";
			var oEditorBoundingClientRect = oEditor.getDomRef().getBoundingClientRect();
			var oControlBoundingClientRect = oControl.getDomRef().getBoundingClientRect();
			var iXofControl = oControlBoundingClientRect.x + oControlBoundingClientRect.width / 2 - oEditorBoundingClientRect.x;
			var iEditorWidth = oEditorBoundingClientRect.width;
			if ( 2 * iXofControl > iEditorWidth) {
				sPlacement = "Left";
				iOffsetWidth = iXofControl - oControlBoundingClientRect.width * 1.5;
			} else {
				iOffsetWidth = iEditorWidth - iXofControl - oControlBoundingClientRect.width;
			}
			iOffsetWidth = iOffsetWidth > iOffsetMaxWidth ? iOffsetMaxWidth : iOffsetWidth;
			oPopover.setContentWidth(iOffsetWidth + "px");
			oPopover.setPlacement(sPlacement);
			oDynamicValueField.setValue(oControl._label);
			oPopover.openBy(oControl);
		} else {
			oPopover.open();
		}
		oCurrentModel = this.getModel("currentSettings");
		if (oCurrentModel.getProperty("/type") === "destination") {
			selectTransform(sParameterId);
		} else if (oCurrentModel.getProperty("/_hasDynamicValue")) {
			selectDynamic(sParameterId);
		} else if (oCurrentModel.getProperty("/_hasSettings")) {
			selectSettings(sParameterId);
		} else if (oCurrentModel.getProperty("/allowDynamicValues")) {
			selectDynamic(sParameterId);
		} else if (oCurrentModel.getProperty("/allowSettings")) {
			selectSettings(sParameterId);
		}
	};

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

	function createPopover(oData, oField) {
		var sParameterId = oField.getParameterId(),
			oHeader = createHeader(oData, sParameterId),
		    oResetToDefaultButton = createResetBtn(oData, sParameterId, oField),
		    oDynamicPanel = createDynamicPanel(sParameterId),
			oCurrentValue = createCurrentValuesBox(sParameterId),
		    oSettingsPanel = createSettingPanel(oData, oField),
			oTransformPanel = createTransformPanel(oData, oField),
		    oPopover = new Popover({
			id: sParameterId + "_settings_popover",
			showArrow: true,
			contentWidth: "400px",
			showHeader: false,
			horizontalScrolling: false,
			verticalScrolling: false,
			modal: false,
			footer: new OverflowToolbar({
				content: [
					oResetToDefaultButton,
					new ToolbarSpacer(),
					new Button(sParameterId + "_settings_popover_ok_btn", {
						text: oResourceBundle.getText("EDITOR_MORE_OK"),
						type: "Emphasized",
						press: function () {
							if (oData.type === "destination") {
								if (oField._oNewParameter) {
									var newParameter = Object.assign({}, oField._oNewParameter);
									var aValues = deepClone(Object.assign([], oField._oValue.value));
									aValues = aValues.sort(function (a, b) {
										// if _position property not exists, do nothing
										if (!a._dt || !a._dt._position || !b._dt || !b._dt._position) {
											return 0;
										}
										return a._dt._position - b._dt._position;
									});
									aValues.forEach(function (value) {
										delete value._dt;
									});
									newParameter.configuration.values.data.json = {
										"values": aValues
									};
									setNextSetting("pageAdminNewDestinationParameter", newParameter);
								}
							} else {
								//handle page admin values
								if (oData.values && oData.values.item) {
									var oTable = Core.byId(sParameterId + "_settings_popover_pav_table"),
									selectedContexts = oTable.getSelectedContexts(),
									selectedKeys = [];
									if (oCurrentModel.getProperty("/selectedValues") === "Partion") {
										for (var i = 0; i < selectedContexts.length; i++) {
											var selectedKey = oCurrentInstance.getKeyFromItem(selectedContexts[i].getObject());
											selectedKeys.push(selectedKey);
										}
										setNextSetting("pageAdminValues", selectedKeys);
									} else {
										setNextSetting("pageAdminValues", []);
									}
								}
							}
							oCurrentInstance._applyCurrentSettings();
							bCancel = false;
							oPopover.close();
						}
					}),
					new Button(sParameterId + "_settings_popover_cancel_btn", {
						text: oResourceBundle.getText("EDITOR_MORE_CANCEL"),
						press: function () {
							oPopover.close();
						}
					})
				]
			}),
			afterClose: function () {
				if (bCancel) {
					oCurrentInstance._cancelCurrentSettings();
				}
				bCancel = true;
				oPopover.destroy();
			},
			afterOpen: function () {
				window.requestAnimationFrame(function () {
					oPopover.getDomRef() && (oPopover.getDomRef().style.opacity = "1");
				});

				//handle page admin values selection
				if (oData.values && oData.values.item) {
					var oTable = Core.byId(sParameterId + "_settings_popover_pav_table"),
					paValues = oCurrentModel.getProperty("/_next/pageAdminValues");
					if (paValues !== undefined && paValues.length > 0) {
						oTable.removeSelections();
						oCurrentModel.setProperty("/selectedValues", "None");
						var sItems = oCurrentModel.getProperty("/_next/pageAdminValues"),
							aItems = oTable.getItems();
						for (var i = 0; i < sItems.length; i++) {
							for (var j = 0; j < aItems.length; j++) {
								var aItemValue = oCurrentInstance.getKeyFromItem(aItems[j].getBindingContext().getObject());
								if (sItems[i] === aItemValue) {
									oTable.setSelectedItem(aItems[j]);
								}
							}
						}
						oCurrentModel.setProperty("/selectedValues", "Partion");
					} else {
						oTable.selectAll();
						oCurrentModel.setProperty("/selectedValues", "All");
					}
				}
			}
		});
		oPopover.setCustomHeader(oHeader);
		oPopover.addContent(oDynamicPanel);
		oPopover.addContent(oCurrentValue);
		oPopover.addContent(oSettingsPanel);
		oPopover.addContent(oTransformPanel);

		oPopover.addStyleClass("sapUiIntegrationFieldSettings");

		return oPopover;
	}

	function createSettingsButton(sParameterId) {
		oSettingsButton = new SegmentedButtonItem({
			text: oResourceBundle.getText("EDITOR_MORE_SETTINGS"),
			tooltip: oResourceBundle.getText("EDITOR_MORE_SETTINGS"),
			key: "settings",
			icon: "sap-icon://action-settings",
			width: "50%",
			press: function(oEvent) {
				selectSettings(sParameterId);
			}
		}).addStyleClass("setbtn");

		return oSettingsButton;
	}

	function createSegmentedButton(sParameterId) {
		oSettingsButton = createSettingsButton(sParameterId);
		oSegmentedButton = new SegmentedButton(sParameterId + "_settings_popover_segmented_btn", {
			width: "100%",
			visible: "{= ${currentSettings>allowDynamicValues} && ${currentSettings>allowSettings}}",
			items: [
				new SegmentedButtonItem({
					text: oResourceBundle.getText("EDITOR_MORE_DYNAMICVALUES"),
					tooltip: oResourceBundle.getText("EDITOR_MORE_DYNAMICVALUES"),
					key: "dynamic",
					icon: "{= ${currentSettings>_hasDynamicValue} ? 'sap-icon://display-more' : 'sap-icon://enter-more'}",
					width: "50%",
					press: function(oEvent) {
						selectDynamic(sParameterId);
					}
				}).addStyleClass("dynbtn sel"),
				oSettingsButton
			]
		});

		return oSegmentedButton;
	}

	function createHeader(oData, sParameterId) {
		oSegmentedButton = createSegmentedButton(sParameterId);
		var oDynamicValueText = new Text(sParameterId + "_settings_popover_dynamicvalue_txt", {
			text: oResourceBundle.getText("EDITOR_MORE_DYNAMICVALUES"),
			tooltip: oResourceBundle.getText("EDITOR_MORE_DYNAMICVALUES"),
			visible: oData.type !== "destination" && oData.allowDynamicValues && !oData.allowSettings
		}).addStyleClass("sapUiTinyMagin");
		var oSettingsText = new Text(sParameterId + "_settings_popover_settings_txt", {
			text: oResourceBundle.getText("EDITOR_MORE_SETTINGS"),
			visible: oData.type !== "destination" && !oData.allowDynamicValues && oData.allowSettings
		}).addStyleClass("sapUiTinyMagin");
		var oTransformText = new Text(sParameterId + "_settings_popover_transform_txt", {
			text: oResourceBundle.getText("EDITOR_MORE_TRANSFORM"),
			visible: oData.type === "destination"
		}).addStyleClass("sapUiTinyMagin");

		var oTitle = new OverflowToolbar({
			content: [
				oSegmentedButton,
				oDynamicValueText,
				oSettingsText,
				oTransformText
			]
		}).addStyleClass("headertitle");
		return oTitle;
	}

	function createResetBtn(oData, sParameterId, oField) {
	    oResetToDefaultButton = new Button(sParameterId + "_settings_popover_reset_btn", {
			type: "Transparent",
			text: oResourceBundle.getText("EDITOR_MORE_RESET"),
			enabled: "{= ${currentSettings>_next/visible} === (typeof(${currentSettings>visibleToUser}) === 'undefined' ? false : !${currentSettings>visibleToUser}) || ${currentSettings>_next/editable} === (typeof(${currentSettings>editableToUser}) === 'undefined' ? false : !${currentSettings>editableToUser}) || ${currentSettings>_next/allowDynamicValues} === (typeof(${currentSettings>allowDynamicValues}) === 'undefined' ? false : !${currentSettings>allowDynamicValues}) || ${currentSettings>_beforeValue} !== ${currentSettings>value} || ${currentSettings>type} === 'destination'}",
			tooltip: oResourceBundle.getText("EDITOR_MORE_SETTINGS_P_ADMIN_RESET"),
			press: function () {
				if (oData.type === "destination") {
					setNextSetting("pageAdminNewDestinationParameter", undefined);
					oField._oValue = undefined;
					oField._oNewParameter = undefined;
				} else {
					var bVisibleDefault = typeof (oCurrentModel.getProperty("/visibleToUser")) === 'undefined' ? true : oCurrentModel.getProperty("/visibleToUser");
					var bEditableDefault = typeof (oCurrentModel.getProperty("/editableToUser")) === 'undefined' ? true : oCurrentModel.getProperty("/editableToUser");
					var bAllowDynamicValuesDefault = typeof (oCurrentModel.getProperty("/allowDynamicValues")) === 'undefined' ? true : oCurrentModel.getProperty("/allowDynamicValues");
					setNextSetting("visible", bVisibleDefault);
					setNextSetting("editable", bEditableDefault);
					setNextSetting("allowDynamicValues", bAllowDynamicValuesDefault);
					if (oCurrentModel.getProperty("/translatable")) {
						if (oCurrentModel.getProperty("/_translatedDefaultValue") && oCurrentModel.getProperty("/_translatedDefaultValue") !== "") {
							oCurrentModel.setProperty("/value", oCurrentModel.getProperty("/_translatedDefaultValue"));
						} else if (oCurrentModel.getProperty("/_translatedDefaultPlaceholder") && oCurrentModel.getProperty("/_translatedDefaultPlaceholder") !== "") {
							oCurrentModel.setProperty("/value", oCurrentModel.getProperty("/_translatedDefaultPlaceholder"));
						}
						oCurrentModel.setProperty("/_changed", false);
					} else {
						oCurrentModel.setProperty("/value", oCurrentModel.getProperty("/_beforeValue"));
						if (oData.type.indexOf("object") > -1) {
							oField.setValue(oCurrentModel.getProperty("/_beforeValue"));
							oField.resetControl();
						}
					}

					//reset table selection
					if (oData.values && oData.values.item) {
						var oTable = Core.byId(sParameterId + "_settings_popover_pav_table"),
							sItems = oCurrentModel.getProperty("/_next/pageAdminValues"),
							aItems = oTable.getItems();
						// 	pavItemKey = oCurrentModel.getData().values.item.key;
						// pavItemKey = pavItemKey.substring(1, pavItemKey.length - 1);
						if (sItems !== undefined && sItems.length > 0 && sItems.length < aItems.length) {
							oTable.removeSelections();
							for (var i = 0; i < sItems.length; i++) {
								for (var j = 0; j < aItems.length; j++) {
									// var aItemValue = aItems[j].getBindingContext("currentSettings").getObject();
									var aItemValue = oCurrentInstance.getKeyFromItem(aItems[j].getBindingContext().getObject());
									if (sItems[i] === aItemValue) {
										oTable.setSelectedItem(aItems[j]);
									}
								}
							}
							oCurrentModel.setProperty("/selectedValues", "Partion");
						} else {
							oTable.selectAll();
							oCurrentModel.setProperty("/selectedValues", "All");
						}
					}
				}
				var oPopover = Core.byId(sParameterId + "_settings_popover");
				oPopover.getFooter().getContent()[2].firePress();
			}
		}).addStyleClass("resetbutton");
		return oResetToDefaultButton;
	}

	function selectSettings(sParameterId) {
		oSettingsPanel.setVisible(true);
		oDynamicPanel.setVisible(false);
		oTransformPanel.setVisible(false);
		Core.byId(sParameterId + "_settings_popover_segmented_btn").setSelectedKey("settings");
		var oCurrentValue = Core.byId(sParameterId + "_settings_popover_currentvalue");
		oCurrentValue.setVisible(false);
	}

	function selectTransform(sParameterId) {
		oTransformPanel.setVisible(true);
		oSettingsPanel.setVisible(false);
		oDynamicPanel.setVisible(false);
		var oCurrentValue = Core.byId(sParameterId + "_settings_popover_currentvalue");
		oCurrentValue.setVisible(false);
	}

	function selectDynamic(sParameterId) {
		oSettingsPanel.setVisible(false);
		oTransformPanel.setVisible(false);
		oDynamicPanel.setVisible(true);
		Core.byId(sParameterId + "_settings_popover_segmented_btn").setSelectedKey("dynamic");
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
		//visible current value field
		var oCurrentValue = Core.byId(sParameterId + "_settings_popover_currentvalue");
		oCurrentValue.setVisible(true);
	}

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

	function createDynamicPanel(sParameterId) {
		oDynamicPanel = new VBox({ visible: true });
		oDynamicPanel.addStyleClass("sapUiSmallMargin");
		oDynamicValueField = new Input(sParameterId + "_settings_popover_dynamicvalue_input", {
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

		var selectDynamicValueLabel = new Label(sParameterId + "_settings_popover_dynamicvalue_label", {
			text: "Select a dynamic value"
		});
		oDynamicValueField.addAriaLabelledBy(selectDynamicValueLabel);
		var oVBox = new VBox({
			items: [
				selectDynamicValueLabel,
				oDynamicValueField
			]
		});
		oDynamicPanel.addItem(oVBox);

		oDescriptionLabel = new Text(sParameterId + "_settings_popover_dynamicvalue_desc_txt", { text: "", maxLines: 6, renderWhitespace: true });
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
			oSelectFormat = new Select(sParameterId + "_settings_popover_dynamicvalue_format_select", {
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
			oFormatDescriptionLabel = new Text(sParameterId + "_settings_popover_dynamicvalue_format_label", { text: "", maxLines: 4, renderWhitespace: true });
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

		return oDynamicPanel;
	}

	function createCurrentValuesBox(sParameterId) {
		var settingsActualValueTxt = new Text(sParameterId + "_settings_popover_actualvalue_label", {
			text: oResourceBundle.getText("EDITOR_ACTUAL_VALUE")
		});
		var settingsActualValueInput = new Input(sParameterId + "_settings_popover_actualvalue_input", {
			value: {
				path: "currentSettings>_currentContextValue"
			},
			editable: false
		});
		settingsActualValueInput.addAriaLabelledBy(settingsActualValueTxt);
		var oCurrentValue = new VBox(sParameterId + "_settings_popover_currentvalue", {
			width: "100%",
			items: [
				settingsActualValueTxt,
				settingsActualValueInput]
		});
		oCurrentValue.addStyleClass("currentval");

		return oCurrentValue;
	}

	function createSettingPanel(oData, oField) {
		var sParameterId = oField.getParameterId();
		oSettingsPanel = new VBox({ visible: false });
		if (oData.type === "destination") {
			return oSettingsPanel;
		}
		var oBox = new VBox().addStyleClass("commonSettings");
		oSettingsPanel.addItem(oBox);
		oBox.addItem(new Title({
			text: oResourceBundle.getText("EDITOR_MORE_SETTINGS_P_ADMIN"),
			wrapping: true
		}).addStyleClass("stitle"));
		var settingsAdminVisibleLabel = new Label(sParameterId + "_settings_popover_adminvisible_label", {
			text: oResourceBundle.getText("EDITOR_MORE_SETTINGS_P_ADMIN_VISIBLE"),
			wrapping: true
		});
		var settingsAdminVisibleCKB = new CheckBox(sParameterId + "_settings_popover_adminvisible_checkbox", {
			selected: "{= ${currentSettings>_next/visible} !== false}",
			select: function (oEvent) {
				setNextSetting("visible", oEvent.getParameter("selected"));
			}
		});
		settingsAdminVisibleCKB.addAriaLabelledBy(settingsAdminVisibleLabel);
		oBox.addItem(new HBox({
			alignItems: "Start",
			justifyContent: "SpaceBetween",
			items: [
				settingsAdminVisibleLabel,
				settingsAdminVisibleCKB
			]
		}).addStyleClass("cbrow"));
		var settingsAdminEditLabel = new Label(sParameterId + "_settings_popover_admineditable_label", {
			text: oResourceBundle.getText("EDITOR_MORE_SETTINGS_P_ADMIN_EDIT"),
			wrapping: true
		});
		var settingsAdminEditCKB = new CheckBox(sParameterId + "_settings_popover_admineditable_checkbox", {
			selected: "{= ${currentSettings>_next/editable} !== false}",
			enabled: "{= ${currentSettings>_next/visible} !== false}",
			select: function (oEvent) {
				setNextSetting("editable", oEvent.getParameter("selected"));
			}
		});
		settingsAdminEditCKB.addAriaLabelledBy(settingsAdminEditLabel);
		oBox.addItem(new HBox({
			alignItems: "Start",
			justifyContent: "SpaceBetween",
			items: [
				settingsAdminEditLabel,
				settingsAdminEditCKB
			]
		}).addStyleClass("cbrow"));
		var settingsAdminDYNLabel = new Label(sParameterId + "_settings_popover_allowdynamicvalues_label", {
			text: oResourceBundle.getText("EDITOR_MORE_SETTINGS_P_ADMIN_DYN"),
			wrapping: true
		});
		var settingsAdminDYNCKB = new CheckBox(sParameterId + "_settings_popover_allowdynamicvalues_checkbox", {
			selected: "{= ${currentSettings>_next/allowDynamicValues} !== false}",
			enabled: "{= ${currentSettings>_next/visible} !== false && ${currentSettings>_next/editable} !== false}",
			select: function (oEvent) {
				setNextSetting("allowDynamicValues", oEvent.getParameter("selected"));
			}
		});
		settingsAdminDYNCKB.addAriaLabelledBy(settingsAdminDYNLabel);
		oBox.addItem(new HBox({
			alignItems: "Start",
			justifyContent: "SpaceBetween",
			visible: "{= ${currentSettings>allowDynamicValues}!== false}",
			items: [
				settingsAdminDYNLabel,
				settingsAdminDYNCKB
			]
		}).addStyleClass("cbrow"));

		//Binding page admin data to table
		if (oData.values && oData.values.item) {
			var vData;
			if (oData.values.data) {
				var sPath = oData.values.data.path,
					aPath;
				if (sPath && sPath !== "/") {
					if (sPath.startsWith("/")) {
						sPath = sPath.substring(1);
					}
					if (sPath.endsWith("/")) {
						sPath = sPath.substring(0, sPath.length - 1);
					}
					aPath = sPath.split("/");
					vData = ObjectPath.get(["_values", aPath], oData);
				} else {
					vData = ObjectPath.get(["_values"], oData);
				}
			} else if (oField.getParent().getParent().getAggregation("_extension")) {
				var ePath = oData.values.path;
				if (ePath.length > 1) {
					ePath = ePath.substring(1);
				}
				vData = ObjectPath.get([ePath], oField.getModel().getData());
			}
			oBox.addItem(new HBox({
				alignItems: "Start",
				justifyContent: "SpaceBetween",
				visible: "{= ${currentSettings>_next/visible} !== false && ${currentSettings>_next/editable} !== false}",
				items: [
					new Label(sParameterId + "_settings_popover_allowselectedvalues_label", {
						text: oResourceBundle.getText("EDITOR_MORE_SETTINGS_P_ADMIN_VALUES_LIST"),
						tooltip: oResourceBundle.getText("EDITOR_MORE_SETTINGS_P_ADMIN_VALUES_LIST_TOOLTIPS"),
						wrapping: false
					}),
					new Button(sParameterId + "_settings_popover_allowselectedvalues_all_btn", {
						type: "Transparent",
						enabled: vData !== undefined,
						icon: {
							path: "currentSettings>selectedValues",
							formatter: function(values) {
								if (values === "All") {
									return "sap-icon://multiselect-all";
								} else if (values === "Partion") {
									return "sap-icon://multi-select";
								} else if (values === "None") {
									return "sap-icon://multiselect-none";
								}
							}
						},
						tooltip: {
							path: "currentSettings>selectedValues",
							formatter: function(values) {
								if (values === "All") {
									return oResourceBundle.getText("EDITOR_MORE_SETTINGS_P_ADMIN_DESELECT_ALL");
								} else {
									return oResourceBundle.getText("EDITOR_MORE_SETTINGS_P_ADMIN_SELECT_ALL");
								}
							}
						},
						press: function () {
							onMultiSelectionClick(sParameterId);
						}
					})
				]
			}).addStyleClass("cbrow"));
			var pavTable = new Table({
				id: sParameterId + "_settings_popover_pav_table",
				mode: "MultiSelect",
				select: function (oEvent) {
					onTableSelection(oEvent, sParameterId);
				},
				columns: [
					new Column()
				]
			}).addStyleClass("tableHdr");
			var pavItemText = oData.values.item.text,
				vModel = new JSONModel(vData);
			pavTable.setModel(vModel);
			var oTemplate = new ColumnListItem().addStyleClass("pavlistItem");
			if (vData) {
				for (var i = 0; i < vData.length; i++) {
					oTemplate.addCell(new HBox({
						items: [
							new Text({
								text: BindingHelper.createBindingInfos(pavItemText)
							}).addStyleClass("pavTblCellText")
						]
					})).addStyleClass("pavlistItem");
				}
			}
			pavTable.bindItems("/", oTemplate);
			var oScrollContainer = new ScrollContainer({
				id: sParameterId + "_settings_popover_scroll_container",
				height: "125px",
				vertical: true,
				horizontal: false,
				visible: "{= ${currentSettings>_next/visible} !== false && ${currentSettings>_next/editable} !== false}",
				content: [pavTable]
			}).addStyleClass("SettingsPAVTable");
			oSettingsPanel.addItem(oScrollContainer);
		}

		return oSettingsPanel;
	}

	function createTransformPanel(oData, oField) {
		oTransformPanel = new VBox({ visible: false });
		if (oData.type !== "destination") {
			return oTransformPanel;
		}
		var oLabel = new Label({
			text: oResourceBundle.getText("EDITOR_MORE_TRANSFORM_P_ADMIN_LABEL"),
			wrapping: true
		});
		var oLabelValue = new Input({
			id: oField.getAssociation("_editor") + "_" + oField.getParameterKey() + ".toParameter_label",
			value: "{/configuration/label}"
		});
		oLabelValue.addAriaLabelledBy(oLabel);
		var valueLabel = new Label({
			text: oResourceBundle.getText("EDITOR_MORE_TRANSFORM_P_ADMIN_MAPPINGS"),
			wrapping: true
		});

		var iPositionCount = 1,
			oDestinationList = deepClone(oField.getModel("destinations").getData()._values),
			oPageAdminNewDestinationParameter = oData._next ? oData._next.pageAdminNewDestinationParameter : undefined;
		if (!oField._oValue) {
			var oValues = oPageAdminNewDestinationParameter ? oPageAdminNewDestinationParameter.configuration.values.data.json.values : [];

			if (Array.isArray(oValues) && oValues.length > 0) {
				// add uuid and position for each result in value, and mark them as selected
				oValues.forEach(function (oValueItem) {
					oValueItem.label = oValueItem.label || oValueItem.name;
					oValueItem._dt = {
						_uuid: Utils.generateUuidV4(),
						_position: iPositionCount
					};
					iPositionCount++;
				});
			} else {
				var oSelectedDestinationItem = oField.getAggregation("_field").getSelectedItem();
				var sPath = oSelectedDestinationItem ? oSelectedDestinationItem.getBindingContext("destinations").getPath() : undefined;
				if (sPath) {
					var oDestination =  deepClone(oSelectedDestinationItem.getModel("destinations").getProperty(sPath));
					oDestination.label = oDestination.label || oDestination.name;
					oDestination._dt = {
						_uuid: Utils.generateUuidV4(),
						_position: iPositionCount
					};
					oValues = [
						oDestination
					];
				}
			}
			oField._oValue = {
				value: oValues
			};
		} else {
			// add uuid and position for each result in value, and mark them as selected
			oField._oValue.value.forEach(function (oValueItem) {
				oValueItem._dt = oValueItem._dt || {};
				var oValueCloned = deepClone(oValueItem);
				delete oValueCloned._dt;
				if (typeof oValueCloned === "object" && !deepEqual(oValueCloned, {})) {
					oValueItem.label = oValueCloned.label || oValueCloned.name;
				}
			});
		}
		var oModel = new JSONModel(oField._oValue);

		oField._oDestinationValueObjectConfig = {
			"label": "Destination Mappings",
			"type": "object[]",
			"values": {
				"data": {
					"path": "/value"
				},
				"allowAdd": true
			},
			"showSelectionColumn": false,
			"properties": {
				"label": {
					"label": "Label",
					"column": {
						"width": "50%"
					},
					"cell": {
						"text": "{label}",
						"editable": true
					}
				},
				"name": {
					"label": "Name",
					"column": {
						"width": "50%"
					},
					"cell": {
						"type": "string",
						"values": {
							"data": {
								"json": oDestinationList,
								"path": "/"
							},
							"item": {
								"text": "{settings>name}",
								"key": "{settings>name}"
							},
							"sorter": "name"
						},
						"change": function(oEvent) {
							var oControl = oEvent.getSource();
							var oObject = oControl.getBindingContext().getObject();
							// if label is undefined, set its value to name value
							if (oObject && !oObject.label && oObject.name) {
								oObject.label = oObject.name;
							}
						}
					}
				}
			},
			"value": oField._oValue.value
		};
		var oValueField = new ObjectListField(oField.getAssociation("_editor") + "_" + oField.getParameterKey() + ".toParameter_field", {
			configuration: oField._oDestinationValueObjectConfig,
			allowPopover: false,
			parameterKey: oField.getParameterKey() + ".toParameter",
			objectBindings: {
				currentSettings: {
					path: "currentSettings>/"
				}
			}
		});
		oValueField.setAssociation("_editor", oField.getAssociation("_editor"));
		oValueField.setModel(oModel);
		oValueField.setModel(new JSONModel(oField._oDestinationValueObjectConfig), "currentSettings");

		var oForm = new SimpleForm({
			layout: "ResponsiveGridLayout",
			labelSpanXL: 4,
			labelSpanL: 4,
			labelSpanM: 4,
			//labelSpanS: "{= ${/editMode} === 'Properties' ? 4 : 12}",
			labelSpanS: 12,
			emptySpanXL: 1,
			emptySpanL: 1,
			emptySpanM: 1,
			emptySpanS: 0,
			columnsXL: 1,
			columnsL: 1,
			columnsM: 1,
			content: [
				oLabel,
				oLabelValue,
				valueLabel,
				oValueField
			]
		});

		/*
		_oRelatedParameterListPage.addContent();
		*/
		if (!oField._oNewParameter) {
			oField._oNewParameter = {
				"parameter": oField.getParameterKey() + ".toParameter",
				"configuration": {
					"label": oData.label,
					"manifestpath": oData.manifestpath,
					"type": "string",
					"visible": true,
					"editable": true,
					"values": {
						"data": {
							"path": "/values"
						},
						"item": {
							"text": "{label}",
							"key": "{name}"
						}
					},
					"parameterFromDestination": true
				}
			};
			if (oPageAdminNewDestinationParameter) {
				delete oPageAdminNewDestinationParameter.configuration.values.data.json;
				oField._oNewParameter = Object.assign(oField._oNewParameter, oPageAdminNewDestinationParameter);
			}
		}
		var oFormModel = new JSONModel(oField._oNewParameter);
		oForm.setModel(oFormModel);
		oTransformPanel.addItem(oForm);

		return oTransformPanel;
	}

	function onMultiSelectionClick(sParameterId) {
		var oTable = Core.byId(sParameterId + "_settings_popover_pav_table"),
		    oResetBtn = Core.byId(sParameterId + "_settings_popover_reset_btn"),
		    selectedValues = oCurrentModel.getProperty("/selectedValues");
		if (selectedValues === "All") {
			oTable.removeSelections();
			oCurrentModel.setProperty("/selectedValues", "None");
		} else {
			oTable.selectAll();
			oCurrentModel.setProperty("/selectedValues", "All");
		}
		if (!oResetBtn.getEnabled()) {
			oResetBtn.setEnabled(true);
		}
	}

	function onTableSelection(oEvent, sParameterId) {
		var oTable = oEvent.getSource(),
		    selectedItems = oTable.getSelectedItems(),
		    allItems = oTable.getItems(),
			oResetBtn = Core.byId(sParameterId + "_settings_popover_reset_btn");
		if (selectedItems.length === allItems.length) {
			oCurrentModel.setProperty("/selectedValues", "All");
		} else if (selectedItems.length < allItems.length && selectedItems.length > 0) {
			oCurrentModel.setProperty("/selectedValues", "Partion");
		} else {
			oCurrentModel.setProperty("/selectedValues", "None");
		}
		if (!oResetBtn.getEnabled()) {
			oResetBtn.setEnabled(true);
		}
	}

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

	function applyVariableDescription(sText, aTags) {
		aTags = aTags || [];
		if (aTags.indexOf("technical") > -1) {
			sText = sText + "\n" + oResourceBundle.getText("EDITOR_MORE_DYNAMICVALUES_TECHHINT");
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
			oTransformPanel: oTransformPanel,
			oCurrentModel: oCurrentModel,
			updateCurrentValue: updateCurrentValue,
			oCurrentInstance: oCurrentInstance,
			oDynamicValueField: oDynamicValueField,
			oResetToDefaultButton: oResetToDefaultButton,
			getMenuItems: function () {
				return aMenuItems;
			},
			getMenu: function () {
				return oMenu;

			}
		};
	};

	Settings.prototype.prepareFieldsInKey = function(oConfig) {
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

	Settings.prototype.getKeyFromItem = function(oItem) {
		var sItemKey = "";
		this._aFields.forEach(function (field) {
			sItemKey += oItem[field].toString() + this._sKeySeparator;
		}.bind(this));
		if (sItemKey.endsWith(this._sKeySeparator)) {
			sItemKey = sItemKey.substring(0, sItemKey.length - this._sKeySeparator.length);
		}
		return sItemKey;
	};

	return Settings;
});