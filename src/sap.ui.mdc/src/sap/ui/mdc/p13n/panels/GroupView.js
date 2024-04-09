/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/BasePanel",
	"sap/m/Label",
	"sap/base/util/deepEqual",
	"sap/m/CustomListItem",
	"sap/m/List",
	"sap/m/Panel",
	"sap/m/Toolbar",
	"sap/m/Text",
	"sap/ui/core/Element",
	"sap/ui/core/Icon",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/m/HBox",
	"sap/m/library",
	"sap/base/util/merge",
	"sap/m/Title"
], (BasePanel, Label, deepEqual, CustomListItem, List, Panel, Toolbar, Text, Element, Icon, Library, coreLibrary, HBox, mLibrary, merge, Title) => {
	"use strict";


	// shortcut for sap.ui.core.IconColor
	const { IconColor } = coreLibrary;

	// shortcut for sap.m.FlexJustifyContent
	const { FlexJustifyContent } = mLibrary;

	// shortcut for sap.m.ListKeyboardMode
	const { ListKeyboardMode } = mLibrary;

	/**
	 * Constructor for a new GroupView
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The GroupView is a list based view to personalize selection and filter values of a Control that allows certain filter capabilities.
	 * @extends sap.m.p13n.BasePanel
	 * @author SAP SE
	 * @private
	 * @since 1.85
	 * @alias sap.ui.mdc.p13n.panels.GroupView
	 */
	const GroupView = BasePanel.extend("sap.ui.mdc.p13n.panels.GroupView", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * This factory function must return a single control instance of an input based control to provide custom filter capabilities.
				 * This control is then going to be added in the <code>GroupView</code> layout.
				 *
				 * <b>Note:</b>: The <code>getIdForLabel</code> method can be imlplemented on the returned control instance
				 * to return a focusable children control to provide the <code>labelFor</code> reference for the associated text.
				 */
				itemFactory: {
					type: "function"
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	GroupView.prototype.init = function() {
		// Initialize the BasePanel
		BasePanel.prototype.init.apply(this, arguments);
		this.addStyleClass("sapUiMDCGroupView");

		const oGroupPanelTemplate = new CustomListItem({
			visible: "{" + this.P13N_MODEL + ">groupVisible}",
			accDescription: {
				path: this.P13N_MODEL + ">groupLabel",
				//Do not read the whole content
				//Announce tet 'Filter Group' + <grouplabel>, e.g. "Filter Group Basic"
				formatter: function(sGroupLabel) {
					return Library.getResourceBundleFor("sap.ui.mdc").getText("p13nDialog.FILTER_GROUP_DESCRIPTION", [sGroupLabel]);
				}
			},
			content: [
				this._createGroupPanelTemplate()
			]
		});

		this._bShowFactory = true;
		this.displayColumns();

		this._aInitializedLists = [];

		this._setTemplate(oGroupPanelTemplate);
		oGroupPanelTemplate.setType("Inactive");
		this._setMoveButtonVisibility(true);
	};

	GroupView.prototype._getShowFactory = function() {
		return this._bShowFactory;
	};

	GroupView.prototype.getPanels = function() {
		const aPanels = [];

		this._oListControl.getItems().forEach((oItem) => {
			aPanels.push(oItem.getContent()[0]);
		});

		return aPanels;
	};

	GroupView.prototype._createGroupPanelTemplate = function() {
		const { P13N_MODEL } = this;
		return new Panel({
			expandable: true,
			expanded: {
				path: this.P13N_MODEL + ">group",
				formatter: function() {
					if (this.getBindingContext(P13N_MODEL)) {
						const bExpanded = this.getBindingContext(P13N_MODEL).sPath.split("/")[2] === "0";
						return bExpanded;
					} else {
						return false;
					}
				}
			},

			expand: function(oEvt) {

				const oSource = oEvt.getSource();
				const oInnerList = oSource.getContent()[0];
				this._addInitializedList(oInnerList);
				if (this._getShowFactory()) {
					this._addFactoryControl(oInnerList);
					this.filterContent(this._aCurrentFilters); // --> check if there is already an existing Filter
				}

			}.bind(this),

			width: "100%",
			headerToolbar: [
				new Toolbar({
					content: [
						new Title({
							wrapping: true,
							text: "{" + this.P13N_MODEL + ">groupLabel}"
						})
					]
				})
			],
			content: [
				this._createGroupListTemplate()
			]
		});
	};

	GroupView.prototype._createGroupListTemplate = function() {
		const oList = new List({
			keyboardMode: ListKeyboardMode.Edit,
			selectionChange: function(oEvent) {
				const { sPath } = oEvent.getParameter("listItem").getBindingContext(this.P13N_MODEL);
				const oItem = this._getP13nModel().getProperty(sPath);
				const oP13nModel = this.getModel(this.P13N_MODEL);
				//TODO: remove 'selected' condition enhance
				if (oP13nModel && oItem) {
					oP13nModel.setProperty(sPath + "/selected", oItem.visible);
				}
				const sSpecialChangeReason = this._checkSpecialChangeReason(oEvent.getParameter("selectAll"), oEvent.getParameter("listItems"));

				this.fireChange({
					reason: sSpecialChangeReason || (oItem.visible ? this.CHANGE_REASON_ADD : this.CHANGE_REASON_REMOVE),
					item: oItem
				});
			}.bind(this),
			showSeparators: "None",
			mode: "MultiSelect"
		});

		oList.bindItems(this._getItemsBinding());

		return oList;
	};

	GroupView.prototype._addFactoryControl = function(oList) {

		if (oList.getItems().length == 0 || oList.getItems()[0].getContent().length < 2) {
			oList.getItems().forEach((oItem) => {
				const oContext = oItem.getBindingContext(this.P13N_MODEL);
				const oField = this.getItemFactory().call(this, oContext);

				//Add Factory Control + setLabelFor association (acc announcements)
				if (oField) {
					oItem.addContent(oField);
					const oLabel = oItem.getContent()[0].getItems()[0];
					oLabel.setLabelFor(oField);
				}

				//Remove Icon
				if (oItem.getContent()[0].getItems().length > 1) {
					oItem.getContent()[0].removeItem(1);
				}
			});
		}

		this.addStyleClass("sapUiMDCAFLabelMarking");

	};

	GroupView.prototype._createInnerListControl = function() {
		const oList = new List(this.getId() + "-innerGroupViewList", Object.assign(this._getListControlConfig(), {
			keyboardMode: ListKeyboardMode.Edit,
			mode: "None",
			infoToolbar: new Toolbar(),
			updateStarted: function(oEvt) {
				this._checkAllPanels();
			}.bind(this)
		}));

		return oList;
	};

	GroupView.prototype._getItemsBinding = function() {

		const fnCreatePlain = function() {

			const aInnerListItemContent = [
				new HBox({
					width: "100%",
					justifyContent: FlexJustifyContent.SpaceBetween,
					items: [
						//Icon dynamically added to the HBox
						new Label({
							required: "{" + this.P13N_MODEL + ">required}",
							text: "{" + this.P13N_MODEL + ">label}"
						})
					]
				})
			];

			return new CustomListItem({
				selected: "{" + this.P13N_MODEL + ">visible}",
				tooltip: "{" + this.P13N_MODEL + ">tooltip}",
				accDescription: "{" + this.P13N_MODEL + ">label}",
				content: aInnerListItemContent
			});

		}.bind(this);

		return {
			path: this.P13N_MODEL + ">items",
			templateShareable: false,
			template: fnCreatePlain()
		};
	};

	GroupView.prototype._getIconTemplate = function() {
		return new HBox({
			width: "18.5%",
			justifyContent: FlexJustifyContent.Center,
			items: [
				new Icon({
					src: "sap-icon://circle-task-2",
					size: "0.5rem",
					color: IconColor.Neutral,
					visible: {
						path: this.P13N_MODEL + ">active",
						formatter: function(bIsFiltered) {
							if (bIsFiltered) {
								return true;
							} else {
								return false;
							}
						}
					}
				})
			]
		});
	};

	GroupView.prototype._loopGroupList = function(fnCallback) {
		this._oListControl.getItems().forEach((oOuterItem) => {
			const oPanel = oOuterItem.getContent()[0];
			const oInnerList = oPanel.getContent()[0];
			this._loopItems(oInnerList, (oItem, sKey) => {
				fnCallback(oItem, sKey);
			});
		});
	};

	GroupView.prototype._loopItems = function(oList, fnItemCallback) {
		oList.getItems().forEach((oItem) => {

			const sPath = oItem.getBindingContextPath();
			const sKey = this._getP13nModel().getProperty(sPath).name;

			fnItemCallback.call(this, oItem, sKey);
		});
	};

	GroupView.prototype._removeFactoryControl = function() {
		this._loopGroupList((oItem, sKey) => {
			if (oItem.getContent()[1]) {

				//Remove Factory Control
				oItem.removeContent(oItem.getContent()[1]);
				const oList = oItem.getParent();
				this._addInitializedList(oList);

				//Add Icon
				const oIcon = this._getIconTemplate();
				oItem.getContent()[0].addItem(oIcon);
			}
		});

		this.removeStyleClass("sapUiMDCAFLabelMarking");

		return this._aInitializedLists || [];
	};

	GroupView.prototype._addInitializedList = function(oList) {
		const sListId = oList.getId();
		if (this._aInitializedLists.indexOf(sListId) < 0) {
			this._aInitializedLists.push(sListId);
		}
	};

	GroupView.prototype._getInitializedLists = function() {
		const aLists = [];
		this._aInitializedLists.forEach((sListId) => {
			const oList = Element.getElementById(sListId);
			if (oList) {
				aLists.push(oList);
			}
		});
		return aLists;
	};

	GroupView.prototype.getSelectedFields = function() {
		const aSelectedItems = [];
		this._oListControl.getItems().forEach((oOuterItem) => {
			const oPanel = oOuterItem.getContent()[0];
			const oInnerList = oPanel.getContent()[0];
			this._loopItems(oInnerList, (oItem, sKey) => {
				if (oItem.getSelected()) {
					aSelectedItems.push(sKey);
				}
			});
		});

		return aSelectedItems;
	};

	GroupView.prototype.filterContent = function(aFilter) {
		if (!this._bInitialized || deepEqual(aFilter, this._aCurrentFilters)) {
			return;
		}

		const aInitializedGroups = this._removeFactoryControl();

		this._oListControl.getItems().forEach((oOuterItem) => {
			const oPanel = oOuterItem.getContent()[0];
			const oInnerList = oPanel.getContent()[0];

			if (oInnerList.getBinding("items")) {
				oInnerList.getBinding("items").filter(aFilter, true);
				this._togglePanelVisibility(oPanel);
			}

			if (this._getShowFactory() && aInitializedGroups.indexOf(oInnerList.getId()) > -1) {
				this._addFactoryControl(oInnerList);
			}
		});

		this._aCurrentFilters = aFilter;
	};

	GroupView.prototype.showFactory = function(bShow) {

		this._bShowFactory = bShow;
		this.displayColumns();

		if (bShow) {
			this._getInitializedLists().forEach((oInitializedList) => {
				this._addFactoryControl(oInitializedList);
			});
		} else {
			this._removeFactoryControl();
		}

	};

	GroupView.prototype._checkAllPanels = function() {
		this._oListControl.getItems().forEach((oOuterItem) => {
			const oPanel = oOuterItem.getContent()[0];
			this._togglePanelVisibility(oPanel);
		});
	};

	GroupView.prototype.setGroupExpanded = function(sGroup, bExpand) {
		this._oListControl.getItems().forEach(function(oOuterItem) {
			const oPanel = oOuterItem.getContent()[0];
			const sBindingPath = oPanel.getBindingContext(this.P13N_MODEL).sPath;
			const oItem = this._getP13nModel().getProperty(sBindingPath);
			if (oItem.group === sGroup) {
				oPanel.setExpanded(bExpand);
			}
		}, this);
	};

	GroupView.prototype._togglePanelVisibility = function(oPanel) {
		const oInnerList = oPanel.getContent()[0];
		const oContext = oPanel.getBindingContext(this.P13N_MODEL);

		if (oContext) {
			const sPanelBindingContextPath = oContext.sPath;

			const oItem = this._getP13nModel().getProperty(sPanelBindingContextPath);
			oItem.groupVisible = oInnerList.getVisibleItems().length < 1 ? false : true;

			this._getP13nModel().setProperty(sPanelBindingContextPath, oItem);
		}

	};

	GroupView.prototype.getItems = function() {
		return this._oListControl.getItems();
	};

	GroupView.prototype._checkFirstGroup = function() {

		//One time operation for the first panel in the group view
		if (
			!this._bInitialized &&
			this._oListControl &&
			this._oListControl.getItems().length > 0
		) {
			this._bInitialized = true;
			const oFirstList = this._oListControl.getItems()[0].getContent()[0].getContent()[0];
			this._addFactoryControl(oFirstList);
			this._addInitializedList(oFirstList);
		}
	};

	GroupView.prototype.displayColumns = function() {

		const aPrior = this._oListControl.getInfoToolbar().removeAllContent();

		aPrior.forEach((oControl) => {
			oControl.destroy();
		});

		this._oListControl.getInfoToolbar().addContent(new Text({
			width: "75%",
			text: Library.getResourceBundleFor("sap.ui.mdc").getText("p13nDialog.LIST_VIEW_COLUMN")
		}).addStyleClass("firstColumnPadding"));

		if (!this._bShowFactory) {
			this._oListControl.getInfoToolbar().addContent(new Text({
				textAlign: "Center",
				width: "25%",
				text: Library.getResourceBundleFor("sap.ui.mdc").getText("p13nDialog.LIST_VIEW_ACTIVE")
			}).addStyleClass("firstColumnPadding"));
		}

	};

	GroupView.prototype.setP13nData = function(aP13nData) {
		this._getP13nModel().setProperty("/itemsGrouped", aP13nData);
		if (!this._bInitialized) {
			this._bindListItems();
		}
		this._checkFirstGroup();
		this._checkAllPanels();
	};

	GroupView.prototype.getP13nData = function(bOnlyActive) {
		let aItems = this._getP13nModel().getProperty("/itemsGrouped");
		if (bOnlyActive) {
			aItems = aItems.filter((oItem) => {
				return oItem[this.PRESENCE_ATTRIBUTE];
			});
		}
		return aItems;
	};

	GroupView.prototype._bindListItems = function() {
		this._oListControl.bindItems(Object.assign({
			path: this.P13N_MODEL + ">/itemsGrouped",
			templateShareable: false,
			key: "group",
			template: this.getAggregation("_template").clone()
		}));
	};

	GroupView.prototype.exit = function() {
		BasePanel.prototype.exit.apply(this, arguments);
		this._aInitializedLists = null;
		this._bShowFactory = false;
		this._bInitialized = false;
	};

	return GroupView;

});