/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/BasePanel",
	"sap/m/Label",
	"sap/m/ColumnListItem",
	"sap/m/Select",
	"sap/m/Text",
	"sap/ui/core/Item",
	"sap/m/Button",
	'sap/m/Column',
	"sap/m/Table",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/ComboBox",
	"sap/ui/model/Sorter",
	"sap/base/Log",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/CustomData",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/mdc/enums/ChartItemRoleType",
	"sap/ui/core/InvisibleMessage"
], function (BasePanel, Label, ColumnListItem, Select, Text, Item, Button, Column, Table, Filter, FilterOperator, VBox, HBox, ComboBox, Sorter, Log, mLibrary, Device, ResizeHandler, CustomData, jQuery, coreLibrary, KeyCode, ChartItemRoleType, InvisibleMessage) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.FlexJustifyContent
	const FlexJustifyContent = mLibrary.FlexJustifyContent;
	const core = sap.ui.getCore();

	/**
	 * Constructor for ChartItemPanel
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class TODO
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.m.p13n.BasePanel
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.97
	 * @alias sap.ui.mdc.p13n.panels.ChartItemPanel
	 */
	const ChartItemPanel = BasePanel.extend("sap.ui.mdc.p13n.panels.ChartItemPanel", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/*This provides the panel the necessary information to build the UI for MDC/Comp.
				* The object contains the following information:
				* {
				*	allowedLayoutOptions : [] -> an array of strings with the allowed layout options for the current chart type, e.g. "axis1", "axis2", "category", "series", ...
					templateConfig : [        -> array containing information how the templating rows should look like
						{kind: "Groupable"},  -> object containing information for which tyoe should be a termplate row created (may contain additional config in the future e.g. only one measure allwoed)
						{kind: "Aggregatable"}
					]
				* }
				*/
				panelConfig: {
					type: "object"
				}
			},
			events: {
				// TODO
				/**
				 * Event raised when one or more <code>DimMeasureItems</code> has been updated.
				 * Aggregation <code>DimMeasureItems</code> should be updated outside...
				 * @since 1.50.0
				 */
				changeItems: {}
			}
		},
		init: function () {
			this._bMobileMode = Device.system.phone;
			// Initialize the BasePanel
			BasePanel.prototype.init.apply(this, arguments);

			this._bindListItems();

		},
		renderer: {
			apiVersion: 2
		}
	});

	ChartItemPanel.prototype._setInnerLayout = function() {

		this._oInnerControl = new VBox({
			items: [
				this._oListControl
			]
		});

		this.setAggregation("_content", this._oInnerControl);

		this._fnHandleResize = function() {
			//var bChangeResult = false, iScrollContainerHeightOld, iScrollContainerHeightNew;
			if (this.getParent) {
				let $dialogCont = null;
				const oParent = this.getParent();
				if (oParent && oParent.$) {
					$dialogCont = oParent.$("cont");
					if ($dialogCont.children().length > 0) {
						const iScrollContainerWidth = this._oInnerControl.$()[0].clientWidth;
						const iMinWidth = 570;

						if (!this._bMobileMode && iScrollContainerWidth <= iMinWidth) {
							this._switchMobileMode(true);
						} else if (this._bMobileMode && iScrollContainerWidth > iMinWidth) {
							this._switchMobileMode(false);
						}

					}
				}
			}
			//return bChangeResult;
		};


		if (Device.system.desktop) {
			this._sContainerResizeListener = ResizeHandler.register(this._oInnerControl , this._fnHandleResize.bind(this));
		}

	};

	ChartItemPanel.prototype._switchMobileMode = function(bMobile) {

		if (this._bMobileMode == bMobile) {
			return;
		}

		this._bMobileMode = bMobile;

		if (this._sContainerResizeListener) {
			ResizeHandler.deregister(this._sContainerResizeListener);
			this._sContainerResizeListener = null;
		}

		this._oListControl.destroy();
		this._oDragDropInfo = null;

		// list is necessary to set the template + model on
		this._oListControl = this._createInnerListControl();

		this._setInnerLayout();
		this._bindListItems();

	};

	ChartItemPanel.prototype._createInnerListControl = function() {

		const sId = this._bMobileMode ? this.getId() + "-innerP13nListMobile" : this.getId() + "-innerP13nList";

		const oTable = new Table(sId, Object.assign(this._getListControlConfig(), {}));
		this.setEnableReorder(true); //We always want reordering to be active in this panel

		oTable.addEventDelegate({
			onAfterRendering: this._onAfterTableRender.bind(this)
		});

		return oTable;
	};

	ChartItemPanel.prototype._onAfterTableRender = function(){

		if (this._oFocusInfo){

			if (this._oFocusInfo.oMoveButton){
				//Focus move button directly
				this._oFocusInfo.oMoveButton.focus();
			}

			//Reset focus info
			this._oFocusInfo = null;
		}

		//Restore invalid selections
		this._mInvalidMap.forEach(function(sValue, sKeyName){
			if (this._mNamesMap.has(sKeyName)){
				this._mNamesMap.get(sKeyName).setValueState(ValueState.Error);
				this._mNamesMap.get(sKeyName).setValue(sValue);
			}
		}.bind(this));

	};

	ChartItemPanel.prototype._bindListItems = function(mBindingInfo) {
			let oSorter;
			const MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

			if ( this.getPanelConfig() && this.getPanelConfig().sorter) {
				oSorter = this.getPanelConfig().sorter;
			} else {

					const oMeasuresGroup = { text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_MEASURE_GROUP_HEADER')};
					const oDimensionsGroup = { text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_DIMENSION_GROUP_HEADER')};

					const mGroupInfo = {
						"Aggregatable": oMeasuresGroup,
						"Groupable" : oDimensionsGroup,
						"Measure": oMeasuresGroup,
						"Dimension" : oDimensionsGroup
					};

					const fGrouper = function(oContext) {
						const group = oContext.getProperty("kind");
						return { key: group, text: mGroupInfo[group].text };
					};

					const fSorter = function(a,b) {
						if (a === b) {
							return 0;
						}

						if (a === "MEASURE" || a === "AGGREGATABLE"){
							return 1;
						}

						return -1;
					};

				oSorter = new Sorter("kind", false, fGrouper, fSorter);
			}


			let oFactoryFunction;
			this._mTemplatesMap = new Map();
			this._mNamesMap = new Map();
			this._mInvalidMap = new Map();
			if (this._bMobileMode) {
				oFactoryFunction = this._createListItemMobile;
			} else {
				oFactoryFunction = this._createListItem;
			}

			this._oListControl.bindItems(
				Object.assign(
					{
						path: this.P13N_MODEL + ">/items",
						key: "name", //TODO: Bind with combined key (name + kind)?
						filters: [new Filter({
							filters: [
								new Filter("visible", FilterOperator.EQ, true),
								new Filter("template", FilterOperator.EQ, true)
							],
							and: false
						})],
						factory: oFactoryFunction.bind(this),
						sorter : oSorter
					},
					mBindingInfo
				)
			);
	};

	ChartItemPanel.prototype._getTemplateComboBox = function(sKind){
		const oVisibleFilter = new Filter("visible", FilterOperator.EQ, false);
		const oCollator = new window.Intl.Collator();
		const fnSorter = function(a,b) {
			return oCollator.compare(a,b);
		};

		const oSorter = new Sorter("label", false, false, fnSorter);

		const oComboBox = new ComboBox({
			id: "p13nPanel-templateComboBox-" + sKind,
			width: "100%",
			placeholder: this._getPlaceholderTextForTemplate(sKind),
			items: {
				path: this.P13N_MODEL + ">/items",
				template: new Item({
					key: "{" + this.P13N_MODEL + ">name}",
					text: "{" + this.P13N_MODEL + ">label}"
				}),
				templateShareable : false,
				filters: [oVisibleFilter, new Filter("kind", FilterOperator.EQ, sKind)],
				sorter: oSorter
			},
			change: [this.onChangeOfTemplateName, this]
		});

		this._mTemplatesMap.set(sKind, oComboBox);

		return oComboBox;
	};

	ChartItemPanel.prototype._getPlaceholderTextForTemplate = function(sKind) {
		const MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		return MDCRb.getText('chart.PERSONALIZATION_DIALOG_TEMPLATE_PLACEHOLDER');
	};

	ChartItemPanel.prototype._getRoleSelect = function() {
		return new Select({
			width: "100%",
			selectedKey: "{" + this.P13N_MODEL + ">role}",
			change: [this.onChangeOfRole, this],
			forceSelection: false,
			items: {
				path: this.P13N_MODEL + ">availableRoles",
				templateShareable: false,
				template: new Item({
					key: "{" + this.P13N_MODEL + ">key}",
					text: "{" + this.P13N_MODEL + ">text}"
				})
			},
			visible: {
				path: this.P13N_MODEL + ">availableRoles",
				formatter: function(aRoles) {

					if (!aRoles) {
						return false;
					}

					return aRoles.length > 1;
				}
			}
		});
	};

	ChartItemPanel.prototype._getNameComboBox = function(sId, sKind, sName) {
		const oCollator = new window.Intl.Collator();
		const fnSorter = function(a,b) {
			return oCollator.compare(a,b);
		};

		const oSorter = new Sorter("label", false, false, fnSorter);

		const oNameFilterPersistent = new Filter({
			filters: [
				new Filter("visible", FilterOperator.EQ, false),
				new Filter("name", FilterOperator.EQ, sName)
			],
			and: false
		});

		return new ComboBox(sId + "-combo", {
			width: "100%",
			items: {
				path: this.P13N_MODEL + ">/items",
				factory: function(sId, oObject) {
					return new Item({
						key: oObject.getObject().name,
						text: oObject.getObject().label
					});
				},
				templateShareable : false,
				filters: [oNameFilterPersistent, new Filter("kind", FilterOperator.EQ, sKind)],
				sorter: oSorter
			},
			change: [this.onChangeOfItemName, this],
			selectedKey: "{" + this.P13N_MODEL + ">tempName}",
			customData: [new CustomData({key: "prevName", value: sName}),
						 new CustomData({key: "prevKind", value: sKind})]
		});
	};

	ChartItemPanel.prototype._createListItem = function(sId, oObject){

		let sRemoveBtnId;
		const aCells = [];


		if (oObject.getObject() && oObject.getObject().template){
			aCells.push(this._getTemplateComboBox(oObject.getObject().kind));
		} else {

			//When user had selected an incorrect value, correct it
			if (oObject.getObject().name != oObject.getObject().tempName){
				oObject.getObject().tempName = oObject.getObject().name;
			}

			const oNameComboBox = this._getNameComboBox(sId, oObject.getObject().kind, oObject.getObject().name);
			aCells.push(oNameComboBox);
			aCells.push(this._getRoleSelect());
			sRemoveBtnId = this.getId() + oObject.getObject().kind + "-RemoveBtn-" + oObject.getObject().name;

			aCells.push(new HBox({
				justifyContent: FlexJustifyContent.End,
				items: [
				new Button({
					id: sRemoveBtnId,
					press: [this._onPressHide, this],
					type: "Transparent",
					icon: "sap-icon://decline",
					tooltip: this._getResourceTextMDC("chart.PERSONALIZATION_DIALOG_REMOVE_ENTRY"),
					customData: [new CustomData({key: "propertyName", value: "{" + this.P13N_MODEL + ">name}"}),
								 new CustomData({key: "propertyKind", value: "{" + this.P13N_MODEL + ">kind}"})]
				})
			]}));

			this._mNamesMap.set(oObject.getObject().name, oNameComboBox);

		}

		let oListItem;
		if (oObject.getObject() && oObject.getObject().template) {
			const sKind = oObject.getObject().kind;
			oListItem = new ColumnListItem({
				cells: aCells,
				visible: {
					path: this.P13N_MODEL + ">/items",
					formatter: function(aItems){
						aItems = aItems.filter(function(oItem){return oItem.visible === false && oItem.template === false && oItem.kind === sKind;});
						return aItems.length != 0;
					}
				}
			});
		} else {
			oListItem = new ColumnListItem({
				cells: aCells
			});
		}

		oListItem.addEventDelegate({
			onmouseover: this._hoverHandler.bind(this),
			onfocusin: this._focusHandler.bind(this),
			onkeydown: this._keydownHandler.bind(this)
		});

		return oListItem;
	};

	ChartItemPanel.prototype._createListItemMobile = function(sId, oObject){

		let sRemoveBtnId;
		const aCells = [];

		if (oObject.getObject() && oObject.getObject().template){
			aCells.push(this._getTemplateComboBox(oObject.getObject().kind));
		} else {

			const oVBox = new VBox({
				items: [
					this._getNameComboBox(sId, oObject.getObject().kind, oObject.getObject().name),
					this._getRoleSelect()
				]
			});

			sRemoveBtnId = oObject.getObject().kind + "-RemoveBtn-" + oObject.getObject().name;
			aCells.push(oVBox);

		}

		const oRemoveColumn = new HBox({
			justifyContent: FlexJustifyContent.End,
			items: [new Button({
			id: sRemoveBtnId,
			press: [this._onPressHide, this],
			type: "Transparent", icon: "sap-icon://decline",
			visible: {
				path: this.P13N_MODEL + ">template",
				formatter: function(bEnabled) {
					return !bEnabled;
				}
			},
			customData: [new CustomData({key: "propertyName", value: "{" + this.P13N_MODEL + ">name}"}),
						 new CustomData({key: "propertyKind", value: "{" + this.P13N_MODEL + ">kind}"})]
		})]});

		aCells.push(oRemoveColumn);


		let oListItem;
		if (oObject.getObject() && oObject.getObject().template) {
			const sKind = oObject.getObject().kind;
			oListItem = new ColumnListItem({
				cells: aCells,
				visible: {
					path: this.P13N_MODEL + ">/items",
					formatter: function(aItems){
						aItems = aItems.filter(function(oItem){return oItem.visible === false && oItem.template === false && oItem.kind === sKind;});
						return aItems.length != 0;
					}
				}
			});
		} else {
			oListItem = new ColumnListItem({
				cells: aCells
			});
		}

		oListItem.addEventDelegate({
			onmouseover: this._hoverHandler.bind(this),
			onfocusin: this._focusHandler.bind(this),
			onkeydown: this._keydownHandler.bind(this)
		});

		return oListItem;
	};

	//ACC realted stuff
	ChartItemPanel.prototype._keydownHandler = function(oEvent){

		if ((oEvent.metaKey || oEvent.ctrlKey) && oEvent.keyCode === KeyCode.D){
			//Ctrl+D
			//Remove
			let oRemoveBtn;
			const oListItem = core.byId(oEvent.currentTarget.id);

			if (this._bMobileMode) {
				oRemoveBtn = oListItem.getCells()[1].getItems()[oListItem.getCells()[1].getItems().length - 1];
			} else {
				oRemoveBtn = oListItem.getCells()[2].getItems()[oListItem.getCells()[2].getItems().length - 1];
			}

			if (oRemoveBtn){
				this._onPressHide(oEvent, oRemoveBtn);
				oEvent.preventDefault();
			}

		} else {
			BasePanel.prototype._keydownHandler.apply(this, arguments);
		}

	};

	ChartItemPanel.prototype._focusHandler = function(oEvt) {

		const oTarget = core.byId(oEvt.target.id);

		//Don't handle focus on button presses as this messes up event propagation
		if (oTarget instanceof Button){
			return;
		}

		BasePanel.prototype._focusHandler.apply(this, arguments);
	};

	ChartItemPanel.prototype._handleActivated = function(oHoveredItem) {
		const oItem = this._getModelItemByTableItem(oHoveredItem);
		if (oItem && oItem.template) {
			this.removeMoveButtons();
		}

		this._oHoveredItem = oHoveredItem;
		this._updateEnableOfMoveButtons(oHoveredItem, false);
		this._addMoveButtons(oHoveredItem);
		this._setMoveButtonVisibility(true);

	};

	ChartItemPanel.prototype.onChangeOfItemName = function(oEvent) {
		const sPrevName = oEvent.getSource().data().prevName;
		const sKind = oEvent.getSource().data().prevKind; //Can only select fields within same kind
		const sNewName = oEvent.getSource().getSelectedKey();

		const oPrevItem = this._getP13nModel().getProperty("/items").find(function(it){ return it.name === sPrevName && it.kind === sKind;});
		const oNewItem = this._getP13nModel().getProperty("/items").find(function(it){ return it.name === sNewName && it.kind === sKind;});

		this.removeMoveButtons();

		if (oPrevItem && oNewItem) {

			oPrevItem.visible = false;
			oNewItem.visible = true;

			oPrevItem.tempName = oPrevItem.name;

			oNewItem.role = oPrevItem.role;
			this._moveItemsByIndex(this._getItemIndex(oNewItem), this._getItemIndex(oPrevItem), true);

			this._refreshP13nModel();

			this._fireChangeItems();
			this._updateVisibleIndexes();

			this._mInvalidMap.delete(sPrevName);
			this._mInvalidMap.delete(sNewName);

			/*
			var oOldBox = this._mNamesMap.get(sPrevName);
			this._mNamesMap.delete(sPrevName);
			this._mNamesMap.set(sNewName, oOldBox);
			oEvent.getSource().setValueState(ValueState.None);
			*/
		} else if (oEvent.getSource() && oEvent.getSource() instanceof ComboBox) {

			//Save ivalid states to restore after table render
			this._mInvalidMap.set(oEvent.getSource().data("prevName"), oEvent.getSource().getValue());
			oEvent.getSource().setValueState(ValueState.Error);

		}

	};

	ChartItemPanel.prototype._getItemIndexByNameAndKind = function(sName, sKind) {
		const aFields = this._getP13nModel().getProperty("/items");
		const oField = aFields.find(function(it){return (it.name === sName && it.kind === sKind && !it.template);});

		return this._getItemIndex(oField);
	};

	ChartItemPanel.prototype._getItemIndex = function(oItem) {
		return this._getP13nModel().getProperty("/items").indexOf(oItem);
	};

	ChartItemPanel.prototype.removeMoveButtons = function() {
		const oMoveButtonBox = this._getMoveButtonContainer();

		if (oMoveButtonBox){
			oMoveButtonBox.removeItem(this._getMoveBottomButton());
			oMoveButtonBox.removeItem(this._getMoveDownButton());
			oMoveButtonBox.removeItem(this._getMoveUpButton());
			oMoveButtonBox.removeItem(this._getMoveTopButton());
		}

	};

	//Called on exit of panel; resets templates
	ChartItemPanel.prototype.getP13nData = function() {

		const aItems = this._getCleanP13nItems();

		this._getP13nModel().setProperty("/items", aItems);

		return aItems;
	};

	ChartItemPanel.prototype._getMoveButtonContainer = function() {
		if (this._oMoveUpButton &&
			this._oMoveUpButton.getParent() &&
			this._oMoveUpButton.getParent().isA("sap.m.FlexBox")
		){
			return this._oMoveUpButton.getParent();
		}

		return undefined;
	};

	ChartItemPanel.prototype._addMoveButtons = function(oItem) {
		const oTableItem = oItem;
		if (!oTableItem){
			return;
		}

		const bIgnore = this._getP13nModel().getProperty(oTableItem.getBindingContextPath()) ? this._getP13nModel().getProperty(oTableItem.getBindingContextPath()).template : true;

		if (oTableItem.getCells() && (oTableItem.getCells().length === 2 || oTableItem.getCells().length === 3) && !bIgnore){
			if (this._bMobileMode){
				oTableItem.getCells()[1].insertItem(this._getMoveDownButton(), 0);
				oTableItem.getCells()[1].insertItem(this._getMoveUpButton(), 0);
			} else {
				oTableItem.getCells()[2].insertItem(this._getMoveBottomButton(), 0);
				oTableItem.getCells()[2].insertItem(this._getMoveDownButton(), 0);
				oTableItem.getCells()[2].insertItem(this._getMoveUpButton(), 0);
				oTableItem.getCells()[2].insertItem(this._getMoveTopButton(), 0);
			}

		}
	};

	ChartItemPanel.prototype._moveSelectedItem = function(){
		this._oSelectedItem = this._getMoveButtonContainer().getParent();

		BasePanel.prototype._moveSelectedItem.apply(this, arguments);
	};


	ChartItemPanel.prototype._updateAvailableRolesForItems = function() {
		const aItems = this._getP13nModel().getProperty("/items");
		let aAllowedRoles = [];
		if (this.getPanelConfig() && this.getPanelConfig().allowedLayoutOptions) {
			aAllowedRoles = this.getPanelConfig().allowedLayoutOptions;
		} else {
			Log.warning("No allowedLayoutOptions configured for chart type. This will not show any p13n options!");
		}


		aItems.forEach(function(oItem){

			if (!oItem.availableRoles) {
				return;
			}

			oItem.availableRoles = oItem.availableRoles.filter(function(it){return aAllowedRoles.indexOf(it.key) != -1;});
		});

		this._getP13nModel().setProperty("/items", aItems);
		this._refreshP13nModel();
	};

	ChartItemPanel.prototype._onPressHide = function(oEvent, oRemoveBtn) {

		let sPropertyName;
		if (oRemoveBtn) {
			sPropertyName = oRemoveBtn.data().propertyName;
		} else {
			sPropertyName = oEvent.getSource().data().propertyName;
		}

		const aItems = jQuery.extend([], this._getP13nModel().getProperty("/items"), true);

		aItems.filter(function(it){return it.name === sPropertyName;}).forEach(function(oItem){
			oItem.visible = false;
			//Used to set focus on template row after re-render of table
			if (this._mTemplatesMap.has(oItem.kind) && this._mTemplatesMap.get(oItem.kind).getVisible()){
				this._mTemplatesMap.get(oItem.kind).focus();
			}
		}.bind(this));

		this._announce(this._getResourceTextMDC("chart.PERSONALIZATION_DIALOG_REMOVE_ENTRY_ANNOUNCE"));

		this._getP13nModel().setProperty("/items", aItems);
		this._refreshP13nModel();
		this._fireChangeItems();
		this._updateVisibleIndexes();
	};

	ChartItemPanel.prototype._announce = function (sMessage) {
		const InvisibleMessageMode = coreLibrary.InvisibleMessageMode;
		const oInvisibleMessage = InvisibleMessage.getInstance();
		oInvisibleMessage.announce(sMessage, InvisibleMessageMode.Assertive);
	};

	ChartItemPanel.prototype.setP13nData = function(aP13nData){

		//Clear previous templates (if any)
		aP13nData = aP13nData.filter(function(it){return !it.template;});

		BasePanel.prototype.setP13nData.apply(this, arguments);

		let aItems = [];
		const aAddableItems = [];

		this.getP13nData().forEach(function(oItem, iIndex){
			if (!oItem.availableRoles) {
				oItem.availableRoles = this._getChartItemTextByKey(oItem.kind);
			}

			if (this.getPanelConfig() && this.getPanelConfig().allowedLayoutOptions) {
				const aAllowedRoles = this.getPanelConfig().allowedLayoutOptions;

				if (aAllowedRoles && aAllowedRoles.length >= 1) {
					oItem.availableRoles = oItem.availableRoles.filter(function(it){return aAllowedRoles.indexOf(it.key) != -1;});

					//Reset if an invalid role is selected
					if (aAllowedRoles.indexOf(oItem.role) === -1) {
						oItem.role = aAllowedRoles[0];
					}
				}
			}

			oItem.template = false;
			//Used for comboboxes renaming
			oItem.tempName = oItem.name;

			if (!oItem.visible){
				aAddableItems.push(oItem);
			}

			if (!oItem.index) {
				oItem.index = iIndex;
			}

			aItems.push(oItem);
		}.bind(this));

		aItems = aItems.concat(this._getTemplateItems());

		this._getP13nModel().setProperty("/items", aItems);
		this._updateVisibleIndexes();
	};

	ChartItemPanel.prototype._updateVisibleIndexes = function() {
		this._mVisibleIndexes = new Map();

		this._getP13nModel().getProperty("/items").forEach(function(oItem, _iIndex){

			if (oItem.template || !oItem.visible) {
				return;
			}

			if (this._mVisibleIndexes.has(oItem.kind)){
				this._mVisibleIndexes.get(oItem.kind).push(_iIndex);
			} else {
				const aIndexes = [_iIndex];
				this._mVisibleIndexes.set(oItem.kind, aIndexes);
			}
		}.bind(this));

	};

	ChartItemPanel.prototype.onChangeOfTemplateName = function(oEvent){

		const sSelectedName = oEvent.getSource().getSelectedKey();

		const oSelectedItem = this._getCleanP13nItems().find(function(it){ return it.name === sSelectedName;});

		if (oSelectedItem){
			oSelectedItem.visible = true;

			oEvent.getSource().setSelectedKey(undefined);
			this._refreshP13nModel();

			const aIndexes = this._mVisibleIndexes.has(oSelectedItem.kind) ? this._mVisibleIndexes.get(oSelectedItem.kind) : [];
			const iOldIndex = this._getItemIndexByNameAndKind(oSelectedItem.name, oSelectedItem.kind);
			let iNewIndex = aIndexes[aIndexes.length - 1];

			if (iOldIndex > iNewIndex) {
				iNewIndex += 1;
			}

			if (iNewIndex && iOldIndex != iNewIndex) {
				this._moveItemsByIndex(iOldIndex, iNewIndex, true);
			} else {
				this._fireChangeItems(); //Otherwise already fired by _moveItemsByIndex
			}

			this._mInvalidMap.delete(oEvent.getSource().getValue());
			this._updateVisibleIndexes();
		} else if (oEvent.getSource() && oEvent.getSource() instanceof ComboBox) {

			if (oEvent.getSource().getValue() != "") {
				oEvent.getSource().setValueState(ValueState.Error);
			} else {
				oEvent.getSource().setValueState(ValueState.None);
			}

		}

	};

	ChartItemPanel.prototype._refreshP13nModel = function() {
		/*
		//Save ivalid states to restore after table render
		this._mInvalidMap = new Map();

		this._mNamesMap.forEach(function(oCombo){
			if (oCombo.getValueState() === ValueState.Error) {
				this._mInvalidMap.set(oCombo.data("prevName"), oCombo.getValue());
			}
		}.bind(this));*/

		this._getP13nModel().refresh(true);
	};

	ChartItemPanel.prototype._getTemplateItems = function() {
		const aItems = [];

		if (!this.getPanelConfig() || !this.getPanelConfig().templateConfig){
			return [];
		}

		this.getPanelConfig().templateConfig.forEach(function(oTemplateConfig){
			const oItem = {template: true, kind: oTemplateConfig.kind};

			aItems.push(oItem);
		});

		return aItems;
	};

	ChartItemPanel.prototype._getListControlConfig = function(){
		const oConfig = BasePanel.prototype._getListControlConfig.apply(this, arguments);

		if (this._bMobileMode){
			oConfig.columns = [new Column({
				header: new Text({
					text: this._getResourceTextMDC("chart.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION") + " / " + this._getResourceTextMDC("chart.PERSONALIZATION_DIALOG_COLUMN_ROLE")
				})
			}), new Column()];
		} else {

			const oDescColumn = new Column({
				header: new Text({
					text: this._getResourceTextMDC("chart.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION")
				})
			});

			const oRoleColumn = new Column({
				header: new Text({
					text: this._getResourceTextMDC("chart.PERSONALIZATION_DIALOG_COLUMN_ROLE")
				})
			});
			oConfig.columns = [oDescColumn, oRoleColumn, new Column()];
		}

		oConfig.mode = "None";
		return oConfig;
	};

	ChartItemPanel.prototype._getCleanP13nItems = function() {
		return this._getP13nModel().getProperty("/items").filter(function(it){return !it.template;});
	};

	ChartItemPanel.prototype._fireChangeItems = function() {

		this.fireChangeItems({
			items: this._getCleanP13nItems().map(function(oMItem) {
				return {
					columnKey: oMItem.name,
					visible: oMItem.visible,
					index: oMItem.index,
					role: oMItem.role
				};
			})
		});

		//fire also the BasePanel event to ensure sap.m.p13n.UIManager works as expected
		this.fireChange();

	};

	ChartItemPanel.prototype.onChangeOfRole = function (oEvent) {
		const oSelectedItem = oEvent.getParameter("selectedItem");
		// Fire event only for valid selection
		if (oSelectedItem) {

			let oTableItem;

			if (this._bMobileMode){
				oTableItem = oEvent.getSource().getParent().getParent();
			} else {
				oTableItem = oEvent.getSource().getParent();
			}

			this.fireChange();
			this._updateEnableOfMoveButtons(oTableItem);
		}

		this._fireChangeItems();
	};

	ChartItemPanel.prototype._updateEnableOfMoveButtons = function(oTableItem, bFocus) {

		if (!oTableItem) {
			return;
		}

		const oMItem = this._getModelItemByTableItem(oTableItem);
		const iTableItemPos = this._getP13nModel().getProperty("/items").indexOf(oMItem);
		let bUpEnabled = true, bDownEnabled = true;

		if (!oMItem || oMItem.template) {
			return;
		}

		const aIndexes = this._mVisibleIndexes.has(oMItem.kind) ? this._mVisibleIndexes.get(oMItem.kind) : [];

		if (iTableItemPos == 0 || aIndexes.indexOf(iTableItemPos) === 0 ) {
			// disable move buttons upwards, if the item is at the top
			bUpEnabled = false;
		}

		if (aIndexes.indexOf(iTableItemPos) === aIndexes.length - 1 ) {
			bDownEnabled = false;
		}

		this._getMoveTopButton().setEnabled(bUpEnabled);
		this._getMoveUpButton().setEnabled(bUpEnabled);
		this._getMoveDownButton().setEnabled(bDownEnabled);
		this._getMoveBottomButton().setEnabled(bDownEnabled);

		if (bFocus && (!bDownEnabled || !bUpEnabled)) {
			//Table re-renders after reorder; this is used in onAfterRendering
			this._oFocusInfo = { oMoveButton : !bDownEnabled ? this._getMoveUpButton() : this._getMoveDownButton()};
		}
	};

	ChartItemPanel.prototype._getListItemFromMoveButton = function (oBtn) {
		if (oBtn && oBtn.getParent() && oBtn.getParent().getParent()) {
			return oBtn.getParent().getParent();
		}

		return undefined;
	};

	ChartItemPanel.prototype._onPressButtonMoveToTop = function(oEvent) {
		const oListItem = this._getListItemFromMoveButton(oEvent.getSource());
		if (!oListItem){
			return;
		}
		const  oMItem = this._getP13nModel().getProperty(oListItem.getBindingContextPath());
		const oTopIndex = this._mVisibleIndexes.get(oMItem.kind)[0];

		this._oSelectedItem = oListItem;

		this._moveSelectedItem(oTopIndex);
	};

	ChartItemPanel.prototype._onPressButtonMoveUp = function(oEvent, oListItem) {
		if (!oListItem){
			oListItem = this._getListItemFromMoveButton(oEvent.getSource());
		}

		if (!oListItem){
			return;
		}
		const oMItem = this._getP13nModel().getProperty(oListItem.getBindingContextPath());
		const aIndexes = this._mVisibleIndexes.get(oMItem.kind);
		const iTableItemPos = this._getP13nModel().getProperty("/items").indexOf(oMItem);

		this._oSelectedItem = oListItem;

		//TODO: Get current index
		const oNewIndex = aIndexes[aIndexes.indexOf(iTableItemPos) - 1];

		this._moveSelectedItem(oNewIndex);
	};

	ChartItemPanel.prototype._onPressButtonMoveDown = function(oEvent, oListItem) {
		if (!oListItem){
			oListItem = this._getListItemFromMoveButton(oEvent.getSource());
		}

		if (!oListItem){
			return;
		}
		const oMItem = this._getP13nModel().getProperty(oListItem.getBindingContextPath());
		const aIndexes = this._mVisibleIndexes.get(oMItem.kind);
		const iTableItemPos = this._getP13nModel().getProperty("/items").indexOf(oMItem);

		this._oSelectedItem = oListItem;

		//TODO: Get current index
		const oNewIndex = aIndexes[aIndexes.indexOf(iTableItemPos) + 1];

		this._moveSelectedItem(oNewIndex);
	};

	ChartItemPanel.prototype._onPressButtonMoveToBottom = function(oEvent) {

		const oListItem = this._getListItemFromMoveButton(oEvent.getSource());
		if (!oListItem){
			return;
		}
		const  oMItem = this._getP13nModel().getProperty(oListItem.getBindingContextPath());
		const oBottomIndex = this._mVisibleIndexes.get(oMItem.kind)[this._mVisibleIndexes.get(oMItem.kind).length - 1];

		this._oSelectedItem = oListItem;
		this._moveSelectedItem(oBottomIndex);
	};

	ChartItemPanel.prototype._moveTableItem = function(oItem, iNewIndex) {
		const aFields = this._getP13nModel().getProperty("/items");

		// index of the item in the model not the index in the aggregation
		const iOldIndex = aFields.indexOf(oItem.getBindingContext(this.P13N_MODEL).getObject());

		this._moveItemsByIndex(iOldIndex, iNewIndex);
	};

	ChartItemPanel.prototype._moveItemsByIndex = function(iOldIndex, iNewIndex, bPreventFocusHandling) {
		const aFields = this._getP13nModel().getProperty("/items");

		// limit the minumum and maximum index
		iNewIndex = (iNewIndex <= 0) ? 0 : Math.min(iNewIndex, aFields.length - 1);

		if (iNewIndex == iOldIndex) {
			return;
		}

		// remove data from old position and insert it into new position
		aFields.splice(iNewIndex, 0, aFields.splice(iOldIndex, 1)[0]);
		aFields.forEach(function(oField, iIndex){
			if (!oField.template) {
				oField.index = iIndex;
			}
		});
		this._getP13nModel().setProperty("/items", aFields);

		if (!bPreventFocusHandling){
			// store the moved item again due to binding
			this._oSelectedItem = this._oListControl.getItems().find(function(it){
				const oItem = this._getModelItemByTableItem(it);

				return oItem && oItem === aFields[iNewIndex];

			}.bind(this));

			this._updateEnableOfMoveButtons(this._oSelectedItem, !bPreventFocusHandling);

			this._handleActivated(this._oSelectedItem);
		}

		this._fireChangeItems();
	};

	ChartItemPanel.prototype._getModelItemByTableItem = function (oTableItem) {
		return this._getP13nModel().getProperty(oTableItem.getBindingContextPath());
	};
	//TODO: Check from here on for kind

	ChartItemPanel.prototype._getMoveConfigForTableItem = function(oTableItem) {

		const oModelItem = this._getModelItemByTableItem(oTableItem);

		if (!oModelItem) {
			return undefined;
		}

		return {
			currentIndex: this._getP13nModel().getProperty("/items").indexOf(oModelItem),
			aggregationRole: oModelItem.kind,
			template: oModelItem.template
		};
	};

	ChartItemPanel.prototype._getDragDropConfig = function () {
		if (!this._oDragDropInfo) {
			const oDndConfig = BasePanel.prototype._getDragDropConfig.apply(this, arguments);

			oDndConfig.attachDragStart(this._checkDragStart.bind(this));
			oDndConfig.attachDragEnter(this._checkDrag.bind(this));
			oDndConfig.attachDragEnd(function() {
				this._oDraggedItem = null;
			}.bind(this));

			return oDndConfig;
		}

		return this._oDragDropInfo;
	};

	ChartItemPanel.prototype._checkDrag = function(oEvent) {
		const oEventItem = oEvent.getParameter("target");
		const oMoveConfigEvent = this._getMoveConfigForTableItem(oEventItem);
		const oMoveConfigDragged = this._getMoveConfigForTableItem(this._oDraggedItem);

		//Prevents template from being draggable
		if (!oMoveConfigEvent || oMoveConfigEvent.template || oMoveConfigDragged.aggregationRole != oMoveConfigEvent.aggregationRole) {
			oEvent.preventDefault();
			return;
		}
	};

	ChartItemPanel.prototype._checkDragStart = function(oEvent) {
		this._oDraggedItem = oEvent.getParameter("target");

		this._checkDrag(oEvent);
	};

	ChartItemPanel.prototype._onRearrange = function(oEvent) {
		const oDraggedItem = oEvent.getParameter("draggedControl");
		const oDroppedItem = oEvent.getParameter("droppedControl");
		const sDropPosition = oEvent.getParameter("dropPosition");

		const oMoveConfigDragged = this._getMoveConfigForTableItem(oDraggedItem);
		const oMoveConfigDropped = this._getMoveConfigForTableItem(oDroppedItem);

		if (!oMoveConfigDragged || oMoveConfigDragged.template || !oMoveConfigDropped) {
			oEvent.preventDefault();
			return;
		}

		const iDraggedIndex = oMoveConfigDragged.currentIndex;
		let iDroppedIndex = oMoveConfigDropped.currentIndex;

		if (oMoveConfigDropped.template && sDropPosition == "After") {
			oEvent.preventDefault();
			return;
		}

		if (!oMoveConfigDropped.template &&
			(
				oMoveConfigDragged.aggregationRole != undefined &&
				oMoveConfigDragged.aggregationRole != oMoveConfigDropped.aggregationRole)) {
			oEvent.preventDefault();
			return;
		}

		//When an item gets dragged into the same "direction" it come from inside the array, an offset is needed
		if (iDraggedIndex < iDroppedIndex) {
			if (sDropPosition == "Before" && iDroppedIndex != 0) {
				iDroppedIndex -= 1;
			}

		//Max index not needed here since draggedIndex must be greater than dropped index -> can't be dropped at max
		} else if (sDropPosition == "After") {

			iDroppedIndex += 1;
		}

		this._moveItemsByIndex(iDraggedIndex, iDroppedIndex);

		this._refreshP13nModel();
		this._updateVisibleIndexes();

	};

	ChartItemPanel.prototype._getMoveTopButton = function() {

		if (this._oMoveTopButton && this._oMoveTopButton.isDestroyed()) {
			this._oMoveTopButton = null;
		}

		return BasePanel.prototype._getMoveTopButton.apply(this, arguments);
	};

	ChartItemPanel.prototype._getMoveUpButton = function() {

		if (this._oMoveUpButton && this._oMoveUpButton.isDestroyed()) {
			this._oMoveUpButton = null;
		}

		return BasePanel.prototype._getMoveUpButton.apply(this, arguments);
	};

	ChartItemPanel.prototype._getMoveDownButton = function() {

		if (this._oMoveDownButton && this._oMoveDownButton.isDestroyed()) {
			this._oMoveDownButton = null;
		}

		return BasePanel.prototype._getMoveDownButton.apply(this, arguments);
	};

	ChartItemPanel.prototype._getMoveBottomButton = function() {

		if (this._oMoveBottomButton && this._oMoveBottomButton.isDestroyed()) {
			this._oMoveBottomButton = null;
		}

		return BasePanel.prototype._getMoveBottomButton.apply(this, arguments);
	};

	ChartItemPanel.prototype._getChartItemTextByKey = function (sKey) {
		const MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		const oAvailableRoles = {
			Dimension: [
				{
					key: ChartItemRoleType.category,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY')
				}, {
					key: ChartItemRoleType.category2,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY2')
				}, {
					key: ChartItemRoleType.series,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_SERIES')
				}
			],
			Measure: [
				{
					key: ChartItemRoleType.axis1,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS1')
				}, {
					key: ChartItemRoleType.axis2,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS2')
				}, {
					key: ChartItemRoleType.axis3,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS3')
				}
			]
		};
		return oAvailableRoles[sKey];
	};

	ChartItemPanel.prototype._getResourceTextMDC = function(sText, aValue) {
		this.oResourceBundleMDC = this.oResourceBundleMDC ? this.oResourceBundleMDC : sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		return sText ? this.oResourceBundleMDC.getText(sText, aValue) : this.oResourceBundleMDC;
	};

	ChartItemPanel.prototype.exit = function() {

		this._fnSort = null;
		this.oResourceBundleMDC = null;
		this._bMobileMode = null;

		return BasePanel.prototype.exit.apply(this, arguments);
	};

	return ChartItemPanel;

});
