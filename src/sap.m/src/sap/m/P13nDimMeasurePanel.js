/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nDimMeasurePanel.
sap.ui.define([
	'./library',
	'./P13nPanel',
	'./P13nDimMeasureItem',
	'./SearchField',
	'./Table',
	'./Column',
	'./ColumnListItem',
	'./ScrollContainer',
	'./Text',
	'./Select',
	'./ComboBox',
	'./Button',
	'./OverflowToolbar',
	'./OverflowToolbarLayoutData',
	'./OverflowToolbarButton',
	'./ToolbarSpacer',
	'sap/ui/core/library',
	'sap/ui/model/ChangeReason',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/BindingMode',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/Item',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/IconPool',
	"sap/ui/thirdparty/jquery"
], function(
	library,
	P13nPanel,
	P13nDimMeasureItem,
	SearchField,
	Table,
	Column,
	ColumnListItem,
	ScrollContainer,
	Text,
	Select,
	ComboBox,
	Button,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	OverflowToolbarButton,
	ToolbarSpacer,
	CoreLibrary,
	ChangeReason,
	JSONModel,
	BindingMode,
	ResizeHandler,
	Item,
	InvisibleText,
	IconPool,
	jQuery
) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = library.OverflowToolbarPriority;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.P13nPanelType
	var P13nPanelType = library.P13nPanelType;

	/**
	 * Constructor for a new P13nDimMeasurePanel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nDimMeasurePanel control is used to define chart-specific settings like chart type, the visibility, the order and roles of
	 *        dimensions and measures for table personalization.
	 * @extends sap.m.P13nPanel
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.P13nDimMeasurePanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nDimMeasurePanel = P13nPanel.extend("sap.m.P13nDimMeasurePanel", /** @lends sap.m.P13nDimMeasurePanel.prototype */
	{
		metadata: {
			library: "sap.m",
			properties: {

				/**
				 * Specifies a chart type key.
				 */
				chartTypeKey: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {
				/**
				 * List of columns that has been changed.
				 */
				dimMeasureItems: {
					type: "sap.m.P13nDimMeasureItem",
					multiple: true,
					singularName: "dimMeasureItem",
					bindable: "bindable"
				},

				/**
				 * Internal aggregation for the toolbar content.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content",
					visibility: "hidden"
				},

				/**
				 * Specifies available chart types.
				 */
				availableChartTypes: {
					type: "sap.ui.core.Item",
					multiple: true,
					singularName: "availableChartType"
				}
			},
			events: {
				// TODO
				/**
				 * Event raised when one or more <code>DimMeasureItems</code> has been updated.
				 * Aggregation <code>DimMeasureItems</code> should be updated outside...
				 * @since 1.50.0
				 */
				changeDimMeasureItems: {},
				/**
				 * Event raised when a <code>ChartType</code> has been updated.
				 * @since 1.50.0
				 */
				changeChartType: {}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl){
				oRm.openStart("div", oControl);
				oRm.class("sapMP13nColumnsPanel");
				oRm.openEnd();
				oControl.getAggregation("content").forEach(function(oChildren){
					oRm.renderControl(oChildren);
				});
				oRm.close("div");
			}
		}
	});

	P13nDimMeasurePanel.prototype.init = function() {
		// The panel is using internal JSON model which is bound to internal sap.m.Table.
		// When a table item is selected it reflects in the JSON model. When a table item is moved,
		// we bring the JSON items in the right order and it reflects in the sap.m.Table.
		// The JSON model is filled based on 'items' aggregation and is updated afterwards
		// with information like selection and position of an item based on 'dimMeasureItems' aggregation
		// (the information is taken from the model of aggregation binding. See _updateInternalModel() for more details).
		//
		// This update should be done:
		//  * before the panel is rendered first time (onBeforeRendering) - with item sorting
		//
		//  * after the 'dimMeasureItems' or 'items' aggregation has been changed (via API e.g. addDimMeasureItem or via binding e.g. updateDimMeasureItem) - with item sorting
		//    Note: the JSON model should not be updated during the 'changeDimMeasureItems' event is fired.
		//
		//  * before getOKPayload is called. getOKPayload is called when the user opens the dialog were other panel is
		//    initially visible and P13nDimMeasurePanel has not yet rendered. For validation the JSON model should be updated - with item sorting
		//
		// General note: it is not supposed that control keeps the 'dimMeasureItems' aggregation up-to-date.
		//  * The usual SAPUI5 wide approach is that the control fires an event (here 'changeDimMeasureItems')
		//    and the consumer has to update the model data of the aggregation binding. This is the case where user's interaction,
		//    like set selection or move items, ends up in model data.
		//  * The case where the consumer pushes changes into model data, like e.g. Restore, is done also via binding update.

		var that = this;
		this._iLiveChangeTimer = 0;
		this._iSearchTimer = 0;

		this._bIgnoreUpdateInternalModel = false;
		this._bUpdateInternalModel = true;

		this._bOnAfterRenderingFirstTimeExecuted = false;

		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this.oAvailableRoleTypes = {
			Dimension: [
				{
					key: "category",
					text: oRb.getText('COLUMNSPANEL_CHARTROLE_CATEGORY')
				}, {
					key: "category2",
					text: oRb.getText('COLUMNSPANEL_CHARTROLE_CATEGORY2')
				}, {
					key: "series",
					text: oRb.getText('COLUMNSPANEL_CHARTROLE_SERIES')
				}
			],
			Measure: [
				{
					key: "axis1",
					text: oRb.getText('COLUMNSPANEL_CHARTROLE_AXIS1')
				}, {
					key: "axis2",
					text: oRb.getText('COLUMNSPANEL_CHARTROLE_AXIS2')
				}, {
					key: "axis3",
					text: oRb.getText('COLUMNSPANEL_CHARTROLE_AXIS3')
				}, {
					key: "axis4",
					text: oRb.getText('COLUMNSPANEL_CHARTROLE_AXIS4')
				}
			]
		};

		var oModel = new JSONModel({
			availableChartTypes: [],
			selectedChartTypeKey: null,
			items: [],
			columnKeyOfMarkedItem: undefined,
			isMoveDownButtonEnabled: undefined,
			isMoveUpButtonEnabled: undefined,
			showOnlySelectedItems: undefined,
			countOfSelectedItems: 0,
			countOfItems: 0
		});
		oModel.setDefaultBindingMode(BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapmP13nDimMeasurePanel");

		this.setType(P13nPanelType.dimeasure);
		this.setTitle(oRb.getText("CHARTPANEL_TITLE"));

		this._createTable();
		this._createToolbar();

		this.setVerticalScrolling(false);
		var oScrollContainer = new ScrollContainer({
			horizontal: false,
			vertical: true,
			content: [
				this._oTable
			],
			width: '100%',
			height: '100%'
		});
		this.addAggregation("content", oScrollContainer);

		// Call-back for handling of resizing
		// TODO: make sure we optimize calculation and respect margins and borders, use e.g.
		// jQuery.outerHeight(true)
		this._fnHandleResize = function() {
			var bChangeResult = false, iScrollContainerHeightOld, iScrollContainerHeightNew;
			if (that.getParent) {
				var $dialogCont = null, iContentHeight, iHeaderHeight;
				var oParent = that.getParent();
				var oToolbar = that._getToolbar();
				if (oParent && oParent.$) {
					$dialogCont = oParent.$("cont");
					if ($dialogCont.children().length > 0 && oToolbar.$().length > 0) {
						iScrollContainerHeightOld = oScrollContainer.$()[0].clientHeight;

						iContentHeight = $dialogCont.children()[0].clientHeight;
						iHeaderHeight = oToolbar ? oToolbar.$()[0].clientHeight : 0;

						iScrollContainerHeightNew = iContentHeight - iHeaderHeight;

						if (iScrollContainerHeightOld !== iScrollContainerHeightNew) {
							oScrollContainer.setHeight(iScrollContainerHeightNew + 'px');
							bChangeResult = true;
						}
					}
				}
			}
			return bChangeResult;
		};
		this._sContainerResizeListener = ResizeHandler.register(oScrollContainer, this._fnHandleResize);
	};

	P13nDimMeasurePanel.prototype.onBeforeRendering = function() {
		this._updateInternalModel();

		// Set marked item initially to the first table item
		if (!this._getInternalModel().getProperty("/columnKeyOfMarkedItem")) {
			this._setColumnKeyOfMarkedItem(this._getColumnKeyByTableItem(this._getVisibleTableItems()[0]));
		}
		// After each re-render the 'markedTableItem' is re-created. So we have to set the new table item as marked.
		this._switchMarkedTableItemTo(this._getTableItemByColumnKey(this._getInternalModel().getProperty("/columnKeyOfMarkedItem")));
		this._updateControlLogic();
	};

	P13nDimMeasurePanel.prototype.onAfterRendering = function() {
		var that = this;

		// adapt scroll-container very first time to the right size of the browser
		if (!this._bOnAfterRenderingFirstTimeExecuted) {
			this._bOnAfterRenderingFirstTimeExecuted = true;
			window.clearTimeout(this._iLiveChangeTimer);
			this._iLiveChangeTimer = window.setTimeout(function() {
				that._fnHandleResize();

				// following line is needed to get layout of OverflowToolbar rearranged IF it is used in a dialog
				that._getToolbar()._resetAndInvalidateToolbar();
			}, 0);
		}
	};

	P13nDimMeasurePanel.prototype.getOkPayload = function() {
		this._updateInternalModel();

		// This is very bad practice. As of SAPUI5 directive it is not supposed that control keeps the 'dimMeasureItems' aggregation up-to-date.
		// The usual SAPUI5 approach is that the control fires an event ('changeDimMeasureItems') and the consumer has to update the model data
		// of the aggregation binding. This is the case where user's interaction, like set selection or move items, ends up in model data.
		// But due to backward compatibility we have to keep it.
		this._getInternalModel().getProperty("/items").forEach(function(oMItem) {
			if (this._getDimMeasureItemByColumnKey(oMItem.columnKey)) {
				// Do not update existing dimMeasureItem as it has been just updated in _updateInternalModel method
				return;
			}
			if (!oMItem.persistentSelected) {
				// Nothing relevant has been changed as item is not selected
				return;
			}
			// Create a new dimMeasureItem if an item have been changed to 'selected'
			this.addAggregation("dimMeasureItems", new P13nDimMeasureItem({
				columnKey: oMItem.columnKey,
				visible: oMItem.persistentSelected,
				index: oMItem.persistentIndex === -1 ? undefined : oMItem.persistentIndex,
				role: oMItem.role
			}));
		}, this);

		return {
			// We have to return dimMeasureItems as of the fact that new created or deleted dimMeasureItems are not updated in the model via list
			// binding.
			dimMeasureItems: this.getDimMeasureItems(),
			chartTypeKey: this.getChartTypeKey()
		};
	};

	P13nDimMeasurePanel.prototype.exit = function() {

		ResizeHandler.deregister(this._sContainerResizeListener);
		this._sContainerResizeListener = null;

		this._getToolbar().destroy();

		this._oTable.destroy();
		this._oTable = null;

		// destroy model and its data
		if (this._getInternalModel()) {
			this._getInternalModel().destroy();
		}

		if (this.oInvisibleChartTypeText) {
			this.oInvisibleChartTypeText.destroy();
			this.oInvisibleChartTypeText = null;
		}

		window.clearTimeout(this._iLiveChangeTimer);
		window.clearTimeout(this._iSearchTimer);
	};

	P13nDimMeasurePanel.prototype.addItem = function(oItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.addAggregation("items", oItem);
		return this;
	};

	P13nDimMeasurePanel.prototype.insertItem = function(oItem, iIndex) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.insertAggregation("items", oItem, iIndex);
		return this;
	};

	P13nDimMeasurePanel.prototype.removeItem = function(oItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		oItem = this.removeAggregation("items", oItem);
		return oItem;
	};

	P13nDimMeasurePanel.prototype.removeAllItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAllAggregation("items");
	};

	P13nDimMeasurePanel.prototype.destroyItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.destroyAggregation("items");
		return this;
	};

	P13nDimMeasurePanel.prototype.addDimMeasureItem = function(oDimMeasureItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.addAggregation("dimMeasureItems", oDimMeasureItem);
		return this;
	};

	P13nDimMeasurePanel.prototype.insertDimMeasureItem = function(oDimMeasureItem, iIndex) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.insertAggregation("dimMeasureItems", oDimMeasureItem, iIndex);
		return this;
	};

	P13nDimMeasurePanel.prototype.updateDimMeasureItems = function(sReason) {
		this.updateAggregation("dimMeasureItems");

		if (sReason === ChangeReason.Change && !this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
	};

	P13nDimMeasurePanel.prototype.removeDimMeasureItem = function(oDimMeasureItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAggregation("dimMeasureItems", oDimMeasureItem);
	};

	P13nDimMeasurePanel.prototype.removeAllDimMeasureItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAllAggregation("dimMeasureItems");
	};

	P13nDimMeasurePanel.prototype.destroyDimMeasureItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.destroyAggregation("dimMeasureItems");
		return this;
	};

	P13nDimMeasurePanel.prototype.setChartTypeKey = function(sChartTypeKey) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.setProperty("chartTypeKey", sChartTypeKey);
		return this;
	};

	P13nDimMeasurePanel.prototype.addAvailableChartType = function(oAvailableChartType) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.addAggregation("availableChartTypes", oAvailableChartType);
		return this;
	};

	P13nDimMeasurePanel.prototype.insertAvailableChartType = function(oAvailableChartType, iIndex) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.insertAggregation("availableChartTypes", oAvailableChartType, iIndex);
		return this;
	};

	P13nDimMeasurePanel.prototype.removeAvailableChartType = function(oAvailableChartType) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAggregation("availableChartTypes", oAvailableChartType);
	};

	P13nDimMeasurePanel.prototype.removeAllAvailableChartType = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAllAggregation("availableChartTypes");
	};

	P13nDimMeasurePanel.prototype.destroyAvailableChartType = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.destroyAggregation("availableChartTypes");
		return this;
	};

	P13nDimMeasurePanel.prototype._notifyChange = function() {
		var fListener = this.getChangeNotifier();
		if (fListener) {
			fListener(this);
		}
	};

	P13nDimMeasurePanel.prototype._scrollToSelectedItem = function(oItem) {
		if (!oItem) {
			return;
		}
		sap.ui.getCore().applyChanges();
		if (!!oItem.getDomRef()) {
			oItem.focus();
		}
	};

	// -------------------------------------------------------------------------------------------------
	P13nDimMeasurePanel.prototype._getInternalModel = function() {
		return this.getModel("$sapmP13nDimMeasurePanel");
	};

	P13nDimMeasurePanel.prototype._createTable = function() {
		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oTable = new Table({
			mode: ListMode.MultiSelect,
			rememberSelections: false,
			itemPress: jQuery.proxy(this._onItemPressed, this),
			selectionChange: jQuery.proxy(this._onSelectionChange, this),
			columns: [
				new Column({
					vAlign: CoreLibrary.VerticalAlign.Middle,
					header: new Text({
						text: {
							parts: [
								{
									path: '/countOfSelectedItems'
								}, {
									path: '/countOfItems'
								}
							],
							formatter: function(iCountOfSelectedItems, iCountOfItems) {
								return oRb.getText('COLUMNSPANEL_SELECT_ALL_WITH_COUNTER', [
									iCountOfSelectedItems, iCountOfItems
								]);
							}
						}
					})
				}), new Column({
					vAlign: CoreLibrary.VerticalAlign.Middle,
					header: new Text({
						text: oRb.getText('COLUMNSPANEL_COLUMN_TYPE')
					})
				}), new Column({
					vAlign: CoreLibrary.VerticalAlign.Middle,
					header: new Text({
						text: oRb.getText('COLUMNSPANEL_COLUMN_ROLE')
					})
				})
			],
			items: {
				path: "/items",
				templateShareable: false,
				template: new ColumnListItem({
					cells: [
						new Text({
							text: "{text}"
						}), new Text({
							text: {
								path: '',
								formatter: function(oMItem) {
									if (oMItem.aggregationRole === "Dimension") {
										return oRb.getText('COLUMNSPANEL_TYPE_DIMENSION');
									}
									if (oMItem.aggregationRole === "Measure") {
										return oRb.getText('COLUMNSPANEL_TYPE_MEASURE');
									}
								}
							}
						}), new Select({
							selectedKey: "{role}",
							items: {
								path: 'availableRoleTypes',
								// sorter: [
								// new sap.ui.model.Sorter("/text", false)
								// ],
								factory: function(sId, oBindingContext) {
									var oAvailableRoleType = oBindingContext.getObject();
									return new Item({
										key: oAvailableRoleType.key,
										text: oAvailableRoleType.text
									});
								}
							},
							change: jQuery.proxy(this._onRoleChange, this)
						})
					],
					visible: "{visible}",
					selected: "{persistentSelected}",
					tooltip: "{tooltip}",
					type: ListType.Active
				})
			}
		});
		this._oTable.setModel(this._getInternalModel());
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._createToolbar = function() {
		var that = this;
		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		var oInvisibleChartTypeText = new InvisibleText({
			text: oRb.getText('COLUMNSPANEL_CHARTTYPE')
		});

		// set a reference on the instance so it can be later destroyed
		this.oInvisibleChartTypeText = oInvisibleChartTypeText;

		var oChartTypeComboBox = new ComboBox({
			placeholder: oInvisibleChartTypeText.getText(),
			selectedKey: {
				path: '/selectedChartTypeKey'
			},
			ariaLabelledBy: oInvisibleChartTypeText,
			items: {
				path: '/availableChartTypes',
				templateShareable: false,
				template: new Item({
					key: "{key}",
					text: "{text}"
				})
			},
			selectionChange: jQuery.proxy(this._onChartTypeChange, this),
			layoutData: new OverflowToolbarLayoutData({
				moveToOverflow: false,
				stayInOverflow: false
			})
		});

		var oToolbar = new OverflowToolbar(this.getId() + "-toolbar", {
			design: ToolbarDesign.Auto,
			content: [
				oInvisibleChartTypeText, oChartTypeComboBox, new ToolbarSpacer(), new SearchField(this.getId() + "-searchField", {
					liveChange: function(oEvent) {
						var sValue = oEvent.getSource().getValue(), iDelay = (sValue ? 300 : 0); // no delay if value is empty
						// execute search after user stops typing for 300ms
						window.clearTimeout(that._iSearchTimer);
						if (iDelay) {
							that._iSearchTimer = window.setTimeout(function() {
								that._onExecuteSearch();
							}, iDelay);
						} else {
							that._onExecuteSearch();
						}
					},
					// execute the standard search
					search: jQuery.proxy(this._onExecuteSearch, this),
					layoutData: new OverflowToolbarLayoutData({
						minWidth: "12.5rem",
						maxWidth: "23.077rem",
						shrinkable: true,
						moveToOverflow: false,
						stayInOverflow: false
					})
				}), new Button({
					text: {
						path: '/showOnlySelectedItems',
						formatter: function(bShowOnlySelectedItems) {
							return bShowOnlySelectedItems ? oRb.getText('COLUMNSPANEL_SHOW_ALL') : oRb.getText('COLUMNSPANEL_SHOW_SELECTED');
						}
					},
					tooltip: {
						path: '/showOnlySelectedItems',
						formatter: function(bShowOnlySelectedItems) {
							return bShowOnlySelectedItems ? oRb.getText('COLUMNSPANEL_SHOW_ALL') : oRb.getText('COLUMNSPANEL_SHOW_SELECTED');
						}
					},
					type: ButtonType.Transparent,
					press: jQuery.proxy(this._onSwitchButtonShowSelected, this),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						priority: OverflowToolbarPriority.High
					})
				}), new OverflowToolbarButton({
					icon: IconPool.getIconURI("collapse-group"),
					text: oRb.getText('COLUMNSPANEL_MOVE_TO_TOP'),
					tooltip: oRb.getText('COLUMNSPANEL_MOVE_TO_TOP'),
					type: ButtonType.Transparent,
					enabled: {
						path: '/isMoveUpButtonEnabled'
					},
					press: jQuery.proxy(this.onPressButtonMoveToTop, this),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						priority: OverflowToolbarPriority.Low,
						group: 2
					})
				}), new OverflowToolbarButton({
					icon: IconPool.getIconURI("slim-arrow-up"),
					text: oRb.getText('COLUMNSPANEL_MOVE_UP'),
					tooltip: oRb.getText('COLUMNSPANEL_MOVE_UP'),
					type: ButtonType.Transparent,
					enabled: {
						path: '/isMoveUpButtonEnabled'
					},
					press: jQuery.proxy(this.onPressButtonMoveUp, this),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						priority: OverflowToolbarPriority.High,
						group: 1
					})
				}), new OverflowToolbarButton({
					icon: IconPool.getIconURI("slim-arrow-down"),
					text: oRb.getText('COLUMNSPANEL_MOVE_DOWN'),
					tooltip: oRb.getText('COLUMNSPANEL_MOVE_DOWN'),
					type: ButtonType.Transparent,
					enabled: {
						path: '/isMoveDownButtonEnabled'
					},
					press: jQuery.proxy(this.onPressButtonMoveDown, this),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						priority: OverflowToolbarPriority.High,
						group: 1
					})
				}), new OverflowToolbarButton({
					icon: IconPool.getIconURI("expand-group"),
					text: oRb.getText('COLUMNSPANEL_MOVE_TO_BOTTOM'),
					tooltip: oRb.getText('COLUMNSPANEL_MOVE_TO_BOTTOM'),
					type: ButtonType.Transparent,
					enabled: {
						path: '/isMoveDownButtonEnabled'
					},
					press: jQuery.proxy(this.onPressButtonMoveToBottom, this),
					layoutData: new OverflowToolbarLayoutData({
						moveToOverflow: true,
						priority: OverflowToolbarPriority.Low,
						group: 2
					})
				})
			]
		});
		oToolbar.setModel(this._getInternalModel());
		this.addAggregation("content", oToolbar);
	};

	P13nDimMeasurePanel.prototype.onPressButtonMoveToTop = function() {
		this._moveMarkedTableItem(this._getMarkedTableItem(), this._getVisibleTableItems()[0]);
	};
	P13nDimMeasurePanel.prototype.onPressButtonMoveUp = function() {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveMarkedTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) - 1]);
	};
	P13nDimMeasurePanel.prototype.onPressButtonMoveDown = function() {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveMarkedTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) + 1]);
	};
	P13nDimMeasurePanel.prototype.onPressButtonMoveToBottom = function() {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveMarkedTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.length - 1]);
	};
	P13nDimMeasurePanel.prototype._onSwitchButtonShowSelected = function() {
		this._getInternalModel().setProperty("/showOnlySelectedItems", !this._getInternalModel().getProperty("/showOnlySelectedItems"));

		this._switchVisibilityOfUnselectedModelItems();
		this._filterModelItemsBySearchText();

		this._scrollToSelectedItem(this._getMarkedTableItem());

		this._updateControlLogic();

		this._fnHandleResize();
	};

	P13nDimMeasurePanel.prototype._onExecuteSearch = function() {
		this._switchVisibilityOfUnselectedModelItems();
		this._filterModelItemsBySearchText();
		this._updateControlLogic();
	};

	P13nDimMeasurePanel.prototype._switchVisibilityOfUnselectedModelItems = function() {
		var bShowOnlySelectedItems = this._isFilteredByShowSelected();
		var aMItems = this._getInternalModel().getProperty("/items");
		aMItems.forEach(function(oMItem) {
			if (oMItem.persistentSelected) {
				oMItem.visible = true;
				return;
			}
			oMItem.visible = !bShowOnlySelectedItems;
		});
		this._getInternalModel().setProperty("/items", aMItems);
	};

	P13nDimMeasurePanel.prototype._getVisibleModelItems = function() {
		return this._getInternalModel().getProperty("/items").filter(function(oMItem) {
			return !!oMItem.visible;
		});
	};

	P13nDimMeasurePanel.prototype._getVisibleModelItems = function() {
		return this._getInternalModel().getProperty("/items").filter(function(oMItem) {
			return !!oMItem.visible;
		});
	};

	P13nDimMeasurePanel.prototype._moveMarkedTableItem = function(oTableItemFrom, oTableItemTo) {
		var oMItemFrom = this._getModelItemByColumnKey(this._getColumnKeyByTableItem(oTableItemFrom));
		var oMItemTo = this._getModelItemByColumnKey(this._getColumnKeyByTableItem(oTableItemTo));
		var iIndexFrom = this._getModelItemIndexByColumnKey(oMItemFrom.columnKey);
		var iIndexTo = this._getModelItemIndexByColumnKey(oMItemTo.columnKey);

		this._moveModelItems(iIndexFrom, iIndexTo);

		this._scrollToSelectedItem(this._getMarkedTableItem());
		this._updateControlLogic();
		this._fireChangeDimMeasureItems();
		this._notifyChange();
	};

	/**
	 * Moves model item from <code>iIndexFrom</code> to <code>iIndexTo</code>.
	 *
	 * @param {int} iIndexFrom Model item at this index will be removed. Range: {0, length-1}
	 * @param {int} iIndexTo Model item at this index will be inserted. Range: {0, length-1}
	 * @return {boolean} <code>true</code> if table item has been moved, else <code>false</code>
	 * @private
	 */
	P13nDimMeasurePanel.prototype._moveModelItems = function(iIndexFrom, iIndexTo) {
		var aMItems = this._getInternalModel().getProperty("/items");
		if (iIndexFrom < 0 || iIndexTo < 0 || iIndexFrom > aMItems.length - 1 || iIndexTo > aMItems.length - 1) {
			return false;
		}
		// Remove the marking style before table items are updated
		this._removeStyleOfMarkedTableItem();

		// Move items
		var aModelItems = aMItems.splice(iIndexFrom, 1);
		aMItems.splice(iIndexTo, 0, aModelItems[0]);

		// Do not sort after user action as the table should not be sorted once selected items has been rendered

		// Re-Index the persistentIndex
		this._updateModelItemsPersistentIndex(aMItems);
		this._updateCounts(aMItems);
		this._getInternalModel().setProperty("/items", aMItems);

		// Set the marking style again after table items are updated
		this._switchMarkedTableItemTo(this._getMarkedTableItem());
		return true;
	};

	P13nDimMeasurePanel.prototype._getModelItemByColumnKey = function(sColumnKey) {
		var aMItems = this._getInternalModel().getProperty("/items").filter(function(oMItem) {
			return oMItem.columnKey === sColumnKey;
		});
		return aMItems[0];
	};

	P13nDimMeasurePanel.prototype._updateCounts = function(aMItems) {
		var iCountOfItems = 0;
		var iCountOfSelectedItems = 0;
		aMItems.forEach(function(oMItem) {
			iCountOfItems++;
			if (oMItem.persistentSelected) {
				iCountOfSelectedItems++;
			}
		});
		this._getInternalModel().setProperty("/countOfItems", iCountOfItems);
		this._getInternalModel().setProperty("/countOfSelectedItems", iCountOfSelectedItems);
	};

	P13nDimMeasurePanel.prototype._sortModelItemsByPersistentIndex = function(aModelItems) {
        // BCP 0020751294 0000593415 2018
        var oCollator;
        var sLanguage = sap.ui.getCore().getConfiguration().getLocale().toString();
        try {
            if (typeof window.Intl !== 'undefined') {
                oCollator = window.Intl.Collator(sLanguage, {
                    numeric: true
                });
            }
        } catch (oException) {
            // this exception can happen if the configured language is not convertible to BCP47 -> getLocale will deliver an exception
        }
        // BCP 0020751295 0000514259 2018
        aModelItems.forEach(function(oMItem, iIndex) {
            oMItem.localIndex = iIndex;
        });
		aModelItems.sort(function(a, b) {
			if (a.persistentSelected === true && (b.persistentSelected === false || b.persistentSelected === undefined)) {
				return -1;
			} else if ((a.persistentSelected === false || a.persistentSelected === undefined) && b.persistentSelected === true) {
				return 1;
			} else if (a.persistentSelected === true && b.persistentSelected === true) {
				if (a.persistentIndex > -1 && a.persistentIndex < b.persistentIndex) {
					return -1;
				} else if (b.persistentIndex > -1 && a.persistentIndex > b.persistentIndex) {
					return 1;
				} else {
                    return a.localIndex - b.localIndex;
				}
			} else if ((a.persistentSelected === false || a.persistentSelected === undefined) && (b.persistentSelected === false || b.persistentSelected === undefined)) {
                return oCollator ? oCollator.compare(a.text, b.text) : a.text.localeCompare(b.text, sLanguage, {
                    numeric: true
                });
			}
		});
        aModelItems.forEach(function(oMItem) {
            delete oMItem.localIndex;
        });
	};

	P13nDimMeasurePanel.prototype._getColumnKeyByTableItem = function(oTableItem) {
		var iIndex = this._oTable.indexOfItem(oTableItem);
		if (iIndex < 0) {
			return null;
		}
		return this._oTable.getBinding("items").getContexts()[iIndex].getObject().columnKey;
	};

	P13nDimMeasurePanel.prototype._getModelItemIndexByColumnKey = function(sColumnKey) {
		var iIndex = -1;
		this._getInternalModel().getData().items.some(function(oMItem, iIndex_) {
			if (oMItem.columnKey === sColumnKey) {
				iIndex = iIndex_;
				return true;
			}
		});
		return iIndex;
	};

	P13nDimMeasurePanel.prototype._getSelectedModelItems = function() {
		return this._getInternalModel().getProperty("/items").filter(function(oMItem) {
			return oMItem.persistentSelected;
		});
	};

	P13nDimMeasurePanel.prototype._getVisibleTableItems = function() {
		return this._oTable.getItems().filter(function(oTableItem) {
			return oTableItem.getVisible();
		});
	};

	P13nDimMeasurePanel.prototype._getTableItemByColumnKey = function(sColumnKey) {
		var aContext = this._oTable.getBinding("items").getContexts();
		var aTableItems = this._oTable.getItems().filter(function(oTableItem, iIndex) {
			return aContext[iIndex].getObject().columnKey === sColumnKey;
		});
		return aTableItems[0];
	};

	P13nDimMeasurePanel.prototype._getToolbar = function() {
		return sap.ui.getCore().byId(this.getId() + "-toolbar") || null;
	};
	P13nDimMeasurePanel.prototype._getSearchField = function() {
		return sap.ui.getCore().byId(this.getId() + "-searchField") || null;
	};
	P13nDimMeasurePanel.prototype._getSearchText = function() {
		var oSearchField = this._getSearchField();
		return oSearchField ? oSearchField.getValue() : "";
	};
	P13nDimMeasurePanel.prototype._isFilteredBySearchText = function() {
		return !!this._getSearchText().length;
	};
	P13nDimMeasurePanel.prototype._isFilteredByShowSelected = function() {
		return this._getInternalModel().getData().showOnlySelectedItems;
	};
	P13nDimMeasurePanel.prototype._updateControlLogic = function() {
		var bIsSearchActive = this._isFilteredBySearchText();
		var bShowOnlySelectedItems = this._isFilteredByShowSelected();
		var aVisibleTableItems = this._getVisibleTableItems();

		// Value in search field has been changed...
		this._getInternalModel().setProperty("/isMoveUpButtonEnabled", aVisibleTableItems.indexOf(this._getMarkedTableItem()) > 0);
		this._getInternalModel().setProperty("/isMoveDownButtonEnabled", aVisibleTableItems.indexOf(this._getMarkedTableItem()) > -1 && aVisibleTableItems.indexOf(this._getMarkedTableItem()) < aVisibleTableItems.length - 1);

		// Switch off the "Select all (n/m)" checkbox if search
		var oTableCB = sap.ui.getCore().byId(this._oTable.getId() + '-sa');
		if (oTableCB) {
			oTableCB.setEnabled(!bIsSearchActive && !bShowOnlySelectedItems);
		}
	};

	P13nDimMeasurePanel.prototype._updateModelItemsPersistentIndex = function(aMItems) {
		var iPersistentIndex = -1;
		aMItems.forEach(function(oMItem) {
			oMItem.persistentIndex = -1;
			if (oMItem.persistentSelected) {
				iPersistentIndex++;
				oMItem.persistentIndex = iPersistentIndex;
			}
		});
	};

	P13nDimMeasurePanel.prototype._fireChangeDimMeasureItems = function() {
		this._bIgnoreUpdateInternalModel = true;

		// var aMItems = this._getInternalModel().getProperty("/items");
		// aMItems.forEach(function(oMItem) {
		// 	var oDimMeasureItem = this._getDimMeasureItemByColumnKey(oMItem.columnKey);
		// 	if (oDimMeasureItem) {
		// 		oDimMeasureItem.setVisible(oMItem.persistentSelected);
		// 		oDimMeasureItem.setIndex(oMItem.persistentIndex === -1 ? undefined : oMItem.persistentIndex);
		// 		if (oMItem.role !== undefined) {
		// 			oDimMeasureItem.setRole(oMItem.role);
		// 		}
		// 	}
		// }, this);

		this.fireChangeDimMeasureItems({
			items: this._getInternalModel().getProperty("/items").map(function(oMItem) {
				return {
					columnKey: oMItem.columnKey,
					visible: oMItem.persistentSelected,
					index: oMItem.persistentIndex === -1 ? undefined : oMItem.persistentIndex,
					role: oMItem.role
				};
			})
		});

		this._bIgnoreUpdateInternalModel = false;
	};

	P13nDimMeasurePanel.prototype._fireChangeChartType = function() {
		this._bIgnoreUpdateInternalModel = true;

		this.fireChangeChartType({
			chartTypeKey: this._getInternalModel().getProperty("/selectedChartTypeKey")
		});

		this._bIgnoreUpdateInternalModel = false;
	};

	P13nDimMeasurePanel.prototype._getDimMeasureItemByColumnKey = function(sColumnKey) {
		var aDimMeasureItems = this.getDimMeasureItems().filter(function(oDimMeasureItem) {
			return oDimMeasureItem.getColumnKey() === sColumnKey;
		});
		return aDimMeasureItems[0];
	};

	P13nDimMeasurePanel.prototype._getMarkedTableItem = function() {
		return this._getTableItemByColumnKey(this._getInternalModel().getProperty("/columnKeyOfMarkedItem"));
	};

	P13nDimMeasurePanel.prototype._setColumnKeyOfMarkedItem = function(sColumnKey) {
		this._getInternalModel().setProperty("/columnKeyOfMarkedItem", sColumnKey);
	};

	P13nDimMeasurePanel.prototype._onItemPressed = function(oEvent) {
		this._switchMarkedTableItemTo(oEvent.getParameter('listItem'));
		this._updateControlLogic();
	};

	P13nDimMeasurePanel.prototype._onChartTypeChange = function(oEvent) {
		this._fireChangeChartType();
		this._notifyChange();
	};

	P13nDimMeasurePanel.prototype._onRoleChange = function(oEvent) {
		this._fireChangeDimMeasureItems();
		this._notifyChange();
	};

	P13nDimMeasurePanel.prototype._onSelectionChange = function(oEvent) {
		if (!oEvent.getParameter("selectAll") && oEvent.getParameter("listItems").length === 1) {
			this._switchMarkedTableItemTo(oEvent.getParameter("listItem"));
		}

		this._selectTableItem();
	};

	P13nDimMeasurePanel.prototype._selectTableItem = function() {
		this._updateControlLogic();

		// No update of model items is needed as it is already up-to-date due to binding

		// Do not sort after user interaction as the table should not be sorted once selected items has been rendered

		// Re-Index only the persistentIndex after user interaction
		var aMItems = this._getInternalModel().getProperty("/items");
		this._updateModelItemsPersistentIndex(aMItems);
		this._updateCounts(aMItems);
		this._getInternalModel().setProperty("/items", aMItems);

		this._fireChangeDimMeasureItems();

		this._notifyChange();
	};

	P13nDimMeasurePanel.prototype._switchMarkedTableItemTo = function(oTableItem) {
		this._removeStyleOfMarkedTableItem();

		// When filter is set, the table items are reduced so marked table item can disappear.
		var sColumnKey = this._getColumnKeyByTableItem(oTableItem);
		if (sColumnKey) {
			this._setColumnKeyOfMarkedItem(sColumnKey);
			oTableItem.addStyleClass("sapMP13nColumnsPanelItemSelected");
		}
	};

	/**
	 * Remove highlighting from the current marked table item
	 *
	 * @private
	 */
	P13nDimMeasurePanel.prototype._removeStyleOfMarkedTableItem = function() {
		if (this._getMarkedTableItem()) {
			this._getMarkedTableItem().removeStyleClass("sapMP13nColumnsPanelItemSelected");
		}
	};

	/**
	 * @private
	 */
	P13nDimMeasurePanel.prototype._filterModelItemsBySearchText = function() {
		var sSearchText = this._getSearchText();
		// Replace white spaces at begin and end of the searchText. Leave white spaces in between.
		sSearchText = sSearchText.replace(/(^\s+)|(\s+$)/g, '');
		// Escape special characters entered by user
		sSearchText = sSearchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		// i = ignore case; g = global; m = multiline
		var oRegExp = new RegExp(sSearchText, 'igm');
		if (!oRegExp) {
			return;
		}

		this._getVisibleModelItems().forEach(function(oMItem) {
			var oItem = this._getTableItemByColumnKey(oMItem.columnKey);
			var aCells = oItem.getCells();

			oMItem.visible = false;
			// Search in item text
			if (aCells[0] && aCells[0].getText().match(oRegExp)) {
				oMItem.visible = true;
			}
			// Search in aggregationRole
			if (aCells[1] && aCells[1].getText().match(oRegExp)) {
				oMItem.visible = true;
			}
			// Search in role
			if (aCells[2] && aCells[2].getSelectedItem() && aCells[2].getSelectedItem().getText().match(oRegExp)) {
				oMItem.visible = true;
			}
			// Search in tooltip
			if (oMItem.tooltip && oMItem.tooltip.match(oRegExp)) {
				oMItem.visible = true;
			}
		}, this);
		this._getInternalModel().refresh();
	};

	P13nDimMeasurePanel.prototype._updateInternalModel = function() {
		if (!this._bUpdateInternalModel) {
			return;
		}
		this._bUpdateInternalModel = false;

		// Remove the marking style before table items are updated
		this._removeStyleOfMarkedTableItem();

		// Items
		this._getInternalModel().setProperty("/items", this.getItems().map(function(oItem) {
			return {
				columnKey: oItem.getColumnKey(),
				visible: true,
				text: oItem.getText(),
				tooltip: oItem.getTooltip(),
				aggregationRole: oItem.getAggregationRole(),
				availableRoleTypes: this.oAvailableRoleTypes[oItem.getAggregationRole()],
				role: oItem.getRole(),
				// default value
				persistentIndex: -1,
				persistentSelected: undefined
			};
		}, this));

		// ChartTypeKey
		this._getInternalModel().setProperty("/selectedChartTypeKey", this.getChartTypeKey());

		// AvailableChartType
		this._getInternalModel().setProperty("/availableChartTypes", this.getAvailableChartTypes().map(function(oAvailableChartType) {
			return {
				key: oAvailableChartType.getKey(),
				text: oAvailableChartType.getText()
			};
		}, this));

		// DimMeasureItems
		this.getDimMeasureItems().forEach(function(oDimMeasureItem) {
			var oMItem = this._getModelItemByColumnKey(oDimMeasureItem.getColumnKey());
			if (!oMItem) {
				return;
			}
			if (oDimMeasureItem.getIndex() !== undefined) {
				oMItem.persistentIndex = oDimMeasureItem.getIndex();
			}
			if (oDimMeasureItem.getVisible() !== undefined) {
				oMItem.persistentSelected = oDimMeasureItem.getVisible();
			}
			if (oDimMeasureItem.getRole() !== undefined) {
				oMItem.role = oDimMeasureItem.getRole();
			}
		}, this);

		this._switchVisibilityOfUnselectedModelItems();
		this._filterModelItemsBySearchText();

		var aMItems = this._getInternalModel().getProperty("/items");
		// Sort the table items only by persistentIndex
		this._sortModelItemsByPersistentIndex(aMItems);
		this._updateCounts(aMItems);
		this._getInternalModel().setProperty("/items", aMItems);

		// Set the marking style again after table items are updated
		this._switchMarkedTableItemTo(this._getMarkedTableItem());
	};

	return P13nDimMeasurePanel;

});