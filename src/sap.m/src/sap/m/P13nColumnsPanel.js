/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nColumnsPanel.
sap.ui.define([
	'sap/ui/core/library', 'sap/ui/model/ChangeReason', 'sap/ui/model/json/JSONModel', 'sap/ui/model/BindingMode', 'sap/ui/core/ResizeHandler', 'sap/ui/core/IconPool', './library', './Table', './Column', './ColumnListItem', './P13nPanel', './P13nColumnsItem', './SearchField', './ScrollContainer', './Text', './Button', './OverflowToolbar', './OverflowToolbarLayoutData', './OverflowToolbarButton', './ToolbarSpacer', "sap/ui/thirdparty/jquery"
], function(CoreLibrary, ChangeReason, JSONModel, BindingMode, ResizeHandler, IconPool, library, Table, Column, ColumnListItem, P13nPanel, P13nColumnsItem, SearchField, ScrollContainer, Text, Button, OverflowToolbar, OverflowToolbarLayoutData, OverflowToolbarButton, ToolbarSpacer, jQuery) {
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
	 * Constructor for a new P13nColumnsPanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>P13nColumnsPanel</code> control is used to define column-specific settings for table personalization.
	 * @extends sap.m.P13nPanel
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.26.0
	 * @alias sap.m.P13nColumnsPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nColumnsPanel = P13nPanel.extend("sap.m.P13nColumnsPanel", /** @lends sap.m.P13nColumnsPanel.prototype */
	{
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Specifies a threshold of visible items. If the end user makes a lot of columns visible, this might cause performance to slow down.
				 * When this happens, the user can receive a corresponding warning triggered by the <code>visibleItemsThreshold</code> property. The
				 * property needs to be activated and set to the required value by the consuming application to ensure that the warning message is
				 * shown when the threshold has been exceeded. In the following example the message will be shown if more than 100 visible columns are
				 * selected:
				 *
				 * <pre>
				 * customData&gt;
				 * core:CustomData key=&quot;p13nDialogSettings&quot;
				 * value='\{&quot;columns&quot;:\{&quot;visible&quot;: true, &quot;payload&quot;: \{&quot;visibleItemsThreshold&quot;: 3\}\}\}' /&gt;
				 * /customData&gt;
				 * </pre>
				 *
				 * @since 1.26.7
				 */
				visibleItemsThreshold: {
					type: "int",
					group: "Behavior",
					defaultValue: -1
				}

			},
			aggregations: {
				/**
				 * List of columns that has been changed.
				 *
				 * @since 1.26.0
				 */
				columnsItems: {
					type: "sap.m.P13nColumnsItem",
					multiple: true,
					singularName: "columnsItem",
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
				}
			},
			events: {

				/**
				 * Event raised when a <code>columnsItem</code> is added.
				 * @deprecated As of version 1.50, replaced by extended event {@link sap.m.P13nColumnsPanel#event:changeColumnsItems}
				 * @since 1.26.0
				 */
				addColumnsItem: {
					parameters: {
						/**
						 * <code>columnsItem</code> that needs to be added in the model.
						 */
						newItem: {
							type: "sap.m.P13nColumnsItem"
						}
					}
				},
				/**
				 * Event raised if <code>columnsItems</code> is changed or new one needs to be created in the model.
				 *
				 * @since 1.26.7
				 */
				changeColumnsItems: {
					parameters: {
						/**
						 * Contains <code>columnsItems</code> that needs to be created in the model.
						 * Deprecated as of version 1.50, replaced by new parameter <code>items</code>.
						 * @deprecated As of version 1.50, replaced by new parameter <code>items</code>.
						 */
						newItems: {
							type: "sap.m.P13nColumnsItem[]"
						},
						/**
						 * Contains <code>columnsItems</code> that needs to be changed in the model.
						 * Deprecated as of version 1.50, replaced by new parameter <code>items</code>.
						 * @deprecated As of version 1.50, replaced by new parameter <code>items</code>.
						 */
						existingItems: {
							type: "sap.m.P13nColumnsItem[]"
						},
						// Using both events 'addColumnsItem' and 'changeColumnsItems' instead of only one 'changeColumnsItems' event the implicit item order is getting lost.
						// Example:
						// Given transient items ^A, ^B, C, D (note that transient item contains 'visible' property) and persistent columnsItem B3.
						// Open: ^A, ^B, C, D; Change to: A, ^B, C, D
						// -> changeColumnsItems contains {A false}, {C false}, {D false} as newItems and {B true index=0} as existingItems. So the ColumnsController processes
						// first newItems and then existingItems with result:
						// columnsItems: ^B3, A, C, D. Due to aggregation update the order of table items in P13nColumnsPanel changes to ^B, A, C, D instead of keeping the order as it is A, ^B, C, D.
						//
						// 'index': {undefined, 0, 1,...}. Undefined means that initially consumer does not have defined via aggregation and later on the position of the 'column' has not been changed.
						// 'visible': {undefined, false, true}. Undefined means that initially consumer does not have defined via aggregations and later on the visibility of the 'column' has not been changed.
						/**
						 * Array contains an object for each item in <code>items</code> aggregation enriched with index and visibility information. The item order reflects the current order of columns in the panel.
						 * @since 1.50.0
						 */
						items: {
							type: "object[]"
						}
					}
				},
				/**
				 * Event raised if <code>setData</code> is called in model. The event serves the purpose of minimizing such calls since they can
				 * take up a lot of performance.
				 * @deprecated As of version 1.50, the event <code>setData</code> is obsolete.
				 * @since 1.26.7
				 */
				setData: {}
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

	P13nColumnsPanel.prototype.init = function() {
		// The panel is using internal JSON model which is bound to internal sap.m.Table.
		// When a table item is selected it reflects in the JSON model. When a table item is moved,
		// we bring the JSON items in the right order and it reflects in the sap.m.Table.
		// The JSON model is filled based on 'items' aggregation and is updated afterwards
		// with information like selection and position of an item based on 'columnsItem' aggregation
		// (the information is taken from the model of aggregation binding. See _updateInternalModel() for more details).
		//
		// This update should be done:
		//  * before the panel is rendered first time (onBeforeRendering) - with item sorting
		//
		//  * after the 'columnsItem' or 'items' aggregation has been changed (via API e.g. addColumnsItem or via binding e.g. updateColumnsItems) - with item sorting
		//    Note: the JSON model should not be updated during the 'changeColumnsItems' and 'setData' event is fired.
		//
		//  * before getOKPayload is called. getOKPayload is called when the user opens the dialog were other panel is
		//    initially visible and P13nColumnsPanel has not yet rendered. For validation the JSON model should be updated - with item sorting
		//
		// General note: it is not supposed that control keeps the 'columnsItems' aggregation up-to-date.
		//  * The usual SAPUI5 wide approach is that the control fires an event (here 'changeColumnsItems' and 'setData')
		//    and the consumer has to update the model data of the aggregation binding. This is the case where user's interaction,
		//    like set selection or move items, ends up in model data.
		//  * The case where the consumer pushes changes into model data, like e.g. Restore, is done also via binding update.

		this._iLiveChangeTimer = 0;
		this._iSearchTimer = 0;

		this._bIgnoreUpdateInternalModel = false;
		this._bUpdateInternalModel = true;

		// Due to backwards compatibility
		this._bTableItemsChanged = false;
		this._bOnAfterRenderingFirstTimeExecuted = false;

		var oModel = new JSONModel({
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
		this.setModel(oModel, "$sapmP13nColumnsPanel");

		this.setType(P13nPanelType.columns);
		this.setTitle(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("COLUMSPANEL_TITLE"));

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
		// jQuery.outerHeight(true)
		var that = this;
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

	/**
	 * This method does a re-initialization of the panel
	 *
	 * @public
	 * @since 1.28
	 */
	P13nColumnsPanel.prototype.reInitialize = function() {
	};

	P13nColumnsPanel.prototype.onBeforeRendering = function() {
		this._updateInternalModel();

		// Set marked item initially to the first table item
		if (!this._getInternalModel().getProperty("/columnKeyOfMarkedItem")) {
			this._setColumnKeyOfMarkedItem(this._getColumnKeyByTableItem(this._getVisibleTableItems()[0]));
		}
		// After each re-render the 'markedTableItem' is re-created. So we have to set the new table item as marked.
		this._switchMarkedTableItemTo(this._getTableItemByColumnKey(this._getInternalModel().getProperty("/columnKeyOfMarkedItem")));
		this._updateControlLogic();
	};

	P13nColumnsPanel.prototype.onAfterRendering = function() {
		// adapt scroll-container very first time to the right size of the browser
		if (!this._bOnAfterRenderingFirstTimeExecuted) {
			this._bOnAfterRenderingFirstTimeExecuted = true;

			window.clearTimeout(this._iLiveChangeTimer);
			var that = this;
			this._iLiveChangeTimer = window.setTimeout(function() {
				that._fnHandleResize();
			}, 0);
		}
	};

	/**
	 * Delivers a payload for columnsPanel that can be used at consumer side
	 *
	 * @public
	 * @since 1.26.7
	 * @returns {object} oPayload, which contains useful information
	 */
	P13nColumnsPanel.prototype.getOkPayload = function() {
		this._updateInternalModel();

		var aMItems = this._getInternalModel().getProperty("/items");
		return {
			tableItems: aMItems.map(function(oMItem) {
				return {
					columnKey: oMItem.columnKey,
					index: oMItem.persistentIndex === -1 ? undefined : oMItem.persistentIndex,
					visible: oMItem.persistentSelected,
					width: oMItem.width
				};
			}),
			tableItemsChanged: this._bTableItemsChanged,
			selectedItems: aMItems.filter(function(oMItem) {
				return oMItem.persistentSelected;
			}).map(function(oMItem) {
				return {
					columnKey: oMItem.columnKey
				};
			})
		};
	};

	/**
	 * Delivers a payload for columnsPanel that can be used at consumer side
	 *
	 * @public
	 * @since 1.28
	 * @returns {object} oPayload, which contains useful information
	 */
	P13nColumnsPanel.prototype.getResetPayload = function() {
		return {
			oPanel: this
		};
	};

	P13nColumnsPanel.prototype.exit = function() {
		ResizeHandler.deregister(this._sContainerResizeListener);
		this._sContainerResizeListener = null;

		this._getToolbar().destroy();

		this._oTable.destroy();
		this._oTable = null;

		// destroy model and its data
		if (this._getInternalModel()) {
			this._getInternalModel().destroy();
		}

		window.clearTimeout(this._iLiveChangeTimer);
		window.clearTimeout(this._iSearchTimer);
	};

	P13nColumnsPanel.prototype.addItem = function(oItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.addAggregation("items", oItem);
		return this;
	};

	P13nColumnsPanel.prototype.insertItem = function(oItem, iIndex) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.insertAggregation("items", oItem, iIndex);
		return this;
	};

	P13nColumnsPanel.prototype.removeItem = function(oItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		oItem = this.removeAggregation("items", oItem);
		return oItem;
	};

	P13nColumnsPanel.prototype.removeAllItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAllAggregation("items");
	};

	P13nColumnsPanel.prototype.destroyItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.destroyAggregation("items");
		return this;
	};

	P13nColumnsPanel.prototype.addColumnsItem = function(oColumnsItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.addAggregation("columnsItems", oColumnsItem);
		return this;
	};

	P13nColumnsPanel.prototype.insertColumnsItem = function(oColumnsItem, iIndex) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.insertAggregation("columnsItems", oColumnsItem, iIndex);
		return this;
	};

	P13nColumnsPanel.prototype.updateColumnsItems = function(sReason) {
		this.updateAggregation("columnsItems");

		if (sReason === ChangeReason.Change && !this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
	};

	P13nColumnsPanel.prototype.removeColumnsItem = function(oColumnsItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAggregation("columnsItems", oColumnsItem);
	};

	P13nColumnsPanel.prototype.removeAllColumnsItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAllAggregation("columnsItems");
	};

	P13nColumnsPanel.prototype.destroyColumnsItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.destroyAggregation("columnsItems");
		return this;
	};

	P13nColumnsPanel.prototype.onBeforeNavigationFrom = function() {
		var aMItems = this._getSelectedModelItems();
		var iVisibleItemsThreshold = this.getVisibleItemsThreshold();
		return !(aMItems && iVisibleItemsThreshold !== -1 && aMItems.length > iVisibleItemsThreshold);
	};

	P13nColumnsPanel.prototype._notifyChange = function() {
		this._bTableItemsChanged = true;

		var fListener = this.getChangeNotifier();
		if (fListener) {
			fListener(this);
		}
	};

	P13nColumnsPanel.prototype._scrollToSelectedItem = function(oItem) {
		if (!oItem) {
			return;
		}
		sap.ui.getCore().applyChanges();
	};

	// -------------------------- new --------------------------------------------
	P13nColumnsPanel.prototype._getInternalModel = function() {
		return this.getModel("$sapmP13nColumnsPanel");
	};

	P13nColumnsPanel.prototype._createTable = function() {
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
								return sap.ui.getCore().getLibraryResourceBundle("sap.m").getText('COLUMNSPANEL_SELECT_ALL_WITH_COUNTER', [
									iCountOfSelectedItems, iCountOfItems
								]);
							}
						}
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

	P13nColumnsPanel.prototype._createToolbar = function() {
		var that = this;
		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		var oToolbar = new OverflowToolbar(this.getId() + "-toolbar", {
			design: ToolbarDesign.Auto,
			content: [
				new ToolbarSpacer(), new SearchField(this.getId() + "-searchField", {
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

	P13nColumnsPanel.prototype.onPressButtonMoveToTop = function() {
		this._moveMarkedTableItem(this._getMarkedTableItem(), this._getVisibleTableItems()[0]);
	};
	P13nColumnsPanel.prototype.onPressButtonMoveUp = function() {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveMarkedTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) - 1]);
	};
	P13nColumnsPanel.prototype.onPressButtonMoveDown = function() {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveMarkedTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.indexOf(this._getMarkedTableItem()) + 1]);
	};
	P13nColumnsPanel.prototype.onPressButtonMoveToBottom = function() {
		var aVisibleTableItems = this._getVisibleTableItems();
		this._moveMarkedTableItem(this._getMarkedTableItem(), aVisibleTableItems[aVisibleTableItems.length - 1]);
	};
	P13nColumnsPanel.prototype._onSwitchButtonShowSelected = function() {
		this._getInternalModel().setProperty("/showOnlySelectedItems", !this._getInternalModel().getProperty("/showOnlySelectedItems"));

		this._switchVisibilityOfUnselectedModelItems();
		this._filterModelItemsBySearchText();

		this._scrollToSelectedItem(this._getMarkedTableItem());

		this._updateControlLogic();

		this._fnHandleResize();
	};
	P13nColumnsPanel.prototype._onExecuteSearch = function() {
		this._switchVisibilityOfUnselectedModelItems();
		this._filterModelItemsBySearchText();
		this._updateControlLogic();
	};
	P13nColumnsPanel.prototype._switchVisibilityOfUnselectedModelItems = function() {
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

	P13nColumnsPanel.prototype._getVisibleModelItems = function() {
		return this._getInternalModel().getProperty("/items").filter(function(oMItem) {
			return !!oMItem.visible;
		});
	};

	P13nColumnsPanel.prototype._moveMarkedTableItem = function(oTableItemFrom, oTableItemTo) {
		var oMItemFrom = this._getModelItemByColumnKey(this._getColumnKeyByTableItem(oTableItemFrom));
		var oMItemTo = this._getModelItemByColumnKey(this._getColumnKeyByTableItem(oTableItemTo));
		var iIndexFrom = this._getModelItemIndexByColumnKey(oMItemFrom.columnKey);
		var iIndexTo = this._getModelItemIndexByColumnKey(oMItemTo.columnKey);

		this._moveModelItems(iIndexFrom, iIndexTo);

		this._scrollToSelectedItem(this._getMarkedTableItem());
		this._updateControlLogic();
		this._fireChangeColumnsItems();
		this._fireSetData();
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
	P13nColumnsPanel.prototype._moveModelItems = function(iIndexFrom, iIndexTo) {
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

	P13nColumnsPanel.prototype._getModelItemByColumnKey = function(sColumnKey) {
		var aMItems = this._getInternalModel().getProperty("/items").filter(function(oMItem) {
			return oMItem.columnKey === sColumnKey;
		});
		return aMItems[0];
	};

	P13nColumnsPanel.prototype._updateCounts = function(aMItems) {
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

	P13nColumnsPanel.prototype._sortModelItemsByPersistentIndex = function(aModelItems) {
		// BCP 0020751294 0000593415 2018
		var oCollator;
		var sLanguage;
		try {
			sLanguage = sap.ui.getCore().getConfiguration().getLocale().toString();
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

	P13nColumnsPanel.prototype._getColumnKeyByTableItem = function(oTableItem) {
		var iIndex = this._oTable.indexOfItem(oTableItem);
		if (iIndex < 0) {
			return null;
		}
		return this._oTable.getBinding("items").getContexts()[iIndex].getObject().columnKey;
	};

	P13nColumnsPanel.prototype._getModelItemIndexByColumnKey = function(sColumnKey) {
		var iIndex = -1;
		this._getInternalModel().getProperty("/items").some(function(oMItem, iIndex_) {
			if (oMItem.columnKey === sColumnKey) {
				iIndex = iIndex_;
				return true;
			}

		});
		return iIndex;
	};

	P13nColumnsPanel.prototype._getSelectedModelItems = function() {
		return this._getInternalModel().getProperty("/items").filter(function(oMItem) {
			return oMItem.persistentSelected;
		});
	};

	P13nColumnsPanel.prototype._getVisibleTableItems = function() {
		return this._oTable.getItems().filter(function(oTableItem) {
			return oTableItem.getVisible();
		});
	};

	P13nColumnsPanel.prototype._getTableItemByColumnKey = function(sColumnKey) {
		var aContext = this._oTable.getBinding("items").getContexts();
		var aTableItems = this._oTable.getItems().filter(function(oTableItem, iIndex) {
			return aContext[iIndex].getObject().columnKey === sColumnKey;
		});
		return aTableItems[0];
	};

	P13nColumnsPanel.prototype._getToolbar = function() {
		return sap.ui.getCore().byId(this.getId() + "-toolbar") || null;
	};
	P13nColumnsPanel.prototype._getSearchField = function() {
		return sap.ui.getCore().byId(this.getId() + "-searchField") || null;
	};
	P13nColumnsPanel.prototype._getSearchText = function() {
		var oSearchField = this._getSearchField();
		return oSearchField ? oSearchField.getValue() : "";
	};
	P13nColumnsPanel.prototype._isFilteredBySearchText = function() {
		return !!this._getSearchText().length;
	};
	P13nColumnsPanel.prototype._isFilteredByShowSelected = function() {
		return this._getInternalModel().getData().showOnlySelectedItems;
	};
	P13nColumnsPanel.prototype._updateControlLogic = function() {
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

	P13nColumnsPanel.prototype._updateModelItemsPersistentIndex = function(aMItems) {
		var iPersistentIndex = -1;
		aMItems.forEach(function(oMItem) {
			oMItem.persistentIndex = -1;
			if (oMItem.persistentSelected) {
				iPersistentIndex++;
				oMItem.persistentIndex = iPersistentIndex;
			}
		});
	};

	P13nColumnsPanel.prototype._fireSetData = function() {
		this._bIgnoreUpdateInternalModel = true;
		this.fireSetData();
		this._bIgnoreUpdateInternalModel = false;
	};

	P13nColumnsPanel.prototype._fireChangeColumnsItems = function() {
		this._bIgnoreUpdateInternalModel = true;

		var aMItems = this._getInternalModel().getProperty("/items");
		var oEventParameter = {
			newItems: [],
			existingItems: [],
			items: aMItems.map(function(oMItem) {
				return {
					columnKey: oMItem.columnKey,
					visible: oMItem.persistentSelected,
					index: oMItem.persistentIndex === -1 ? undefined : oMItem.persistentIndex,
					width: oMItem.width,
					total: oMItem.total
				};
			})
		};
		// Due to backwards compatibility we have to support "newItems" and "existingItems" parameters
		aMItems.forEach(function(oMItem) {
			var oColumnsItem = this._getColumnsItemByColumnKey(oMItem.columnKey);
			if (oColumnsItem) {
				oColumnsItem.setVisible(oMItem.persistentSelected);
				oColumnsItem.setIndex(oMItem.persistentIndex === -1 ? undefined : oMItem.persistentIndex);
				if (oMItem.width !== undefined) {
					oColumnsItem.setWidth(oMItem.width);
				}
				if (oMItem.total !== undefined) {
					oColumnsItem.setTotal(oMItem.total);
				}
				oEventParameter.existingItems.push(oColumnsItem);
			} else {
				oEventParameter.newItems.push(new P13nColumnsItem({
					columnKey: oMItem.columnKey,
					visible: oMItem.persistentSelected,
					index: oMItem.persistentIndex === -1 ? undefined : oMItem.persistentIndex,
					width: oMItem.width,
					total: oMItem.total
				}));
			}
		}, this);

		this.fireChangeColumnsItems(oEventParameter);

		this._bIgnoreUpdateInternalModel = false;
	};

	P13nColumnsPanel.prototype._getColumnsItemByColumnKey = function(sColumnKey) {
		var aColumnsItems = this.getColumnsItems().filter(function(oColumnsItem) {
			return oColumnsItem.getColumnKey() === sColumnKey;
		});
		return aColumnsItems[0];
	};

	P13nColumnsPanel.prototype._getMarkedTableItem = function() {
		return this._getTableItemByColumnKey(this._getInternalModel().getProperty("/columnKeyOfMarkedItem"));
	};

	P13nColumnsPanel.prototype._setColumnKeyOfMarkedItem = function(sColumnKey) {
		this._getInternalModel().setProperty("/columnKeyOfMarkedItem", sColumnKey);
	};

	/**
	 * Item press behavior is called as soon as a table item is selected
	 *
	 * @private
	 */
	P13nColumnsPanel.prototype._onItemPressed = function(oEvent) {
		this._switchMarkedTableItemTo(oEvent.getParameter('listItem'));
		this._updateControlLogic();
	};

	P13nColumnsPanel.prototype._onSelectionChange = function(oEvent) {
		if (!oEvent.getParameter("selectAll") && oEvent.getParameter("listItems").length === 1) {
			this._switchMarkedTableItemTo(oEvent.getParameter("listItem"));
		}
		this._selectTableItem();
	};

	P13nColumnsPanel.prototype._selectTableItem = function() {
		this._updateControlLogic();

		// No update of model items is needed as it is already up-to-date due to binding

		// Do not sort after user interaction as the table should not be sorted once selected items has been rendered

		// Re-Index only the persistentIndex after user interaction
		var aMItems = this._getInternalModel().getProperty("/items");
		this._updateModelItemsPersistentIndex(aMItems);
		this._updateCounts(aMItems);
		this._getInternalModel().setProperty("/items", aMItems);

		this._fireChangeColumnsItems();
		this._fireSetData();

		this._notifyChange();

		var fValidate = this.getValidationExecutor();
		if (fValidate) {
			fValidate();
		}
	};

	/**
	 * Change the selected item instance to the new given one
	 *
	 * @private
	 */
	P13nColumnsPanel.prototype._switchMarkedTableItemTo = function(oTableItem) {
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
	P13nColumnsPanel.prototype._removeStyleOfMarkedTableItem = function() {
		if (this._getMarkedTableItem()) {
			this._getMarkedTableItem().removeStyleClass("sapMP13nColumnsPanelItemSelected");
		}
	};

	/**
	 * Filters items by its selection status
	 *
	 * @private
	 */
	P13nColumnsPanel.prototype._filterModelItemsBySearchText = function() {
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
			oMItem.visible = false;
			// Search in item text
			if (typeof oMItem.text === "string" && oMItem.text.match(oRegExp)) {
				oMItem.visible = true;
			}
			// Search in tooltip
			if (typeof oMItem.tooltip === "string" && oMItem.tooltip.match(oRegExp)) {
				oMItem.visible = true;
			}
		});
		this._getInternalModel().refresh();
	};

	/**
	 * Synchronize <code>columnsItems</code> and <code>items</code> aggregations with the internal JSON model
	 * and take over data from the model of aggregation binding.
	 * @private
	 */
	P13nColumnsPanel.prototype._updateInternalModel = function() {
		if (!this._bUpdateInternalModel) {
			return;
		}
		this._bUpdateInternalModel = false;

		// Remove the marking style before table items are updated
		this._removeStyleOfMarkedTableItem();

		var aMItemsOld = this._getInternalModel().getProperty("/items");
		this._getInternalModel().setProperty("/items", this.getItems().map(function(oItem) {
			return {
				columnKey: oItem.getColumnKey(),
				visible: true,
				text: oItem.getText(),
				tooltip: oItem.getTooltip(),
				// default value
				persistentIndex: -1,
				persistentSelected: oItem.getVisible(),
				width: undefined,
				total: undefined
			};
		}, this));

		this.getColumnsItems().forEach(function(oColumnsItem) {
			var oMItem = this._getModelItemByColumnKey(oColumnsItem.getColumnKey());
			if (!oMItem) {
				return;
			}
			if (oColumnsItem.getIndex() !== undefined) {
				oMItem.persistentIndex = oColumnsItem.getIndex();
			}
			if (oColumnsItem.getVisible() !== undefined) {
				oMItem.persistentSelected = oColumnsItem.getVisible();
			}
			if (oColumnsItem.getWidth() !== undefined) {
				oMItem.width = oColumnsItem.getWidth();
			}
			if (oColumnsItem.getTotal() !== undefined) {
				oMItem.total = oColumnsItem.getTotal();
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

		// Due to backward compatibility we have to determine if some items have been changed in order to set OK payload parameter 'tableItemsChanged'.
		// Use-case: 1. the model data bound to 'items' or 'columnsItems' are changed via API. Due to aggregation update the sync between
		// aggregation and internal model is set to true.
		// 2. Click 'OK'. At this point in time getOKPayload is called and _updateInternalModel is forced. The consumer (e.g. ColumnsController evaluates
		// 'tableItemsChanged'. See unittest Controller.qunit.html 'Freeze (UITable): move selected item out of frozen zone'.
		if (jQuery(aMItems).not(aMItemsOld).length !== 0 || jQuery(aMItemsOld).not(aMItems).length !== 0) {
			this._bTableItemsChanged = true;
		}
	};

	return P13nColumnsPanel;

});
