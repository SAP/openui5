/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nSelectionPanel.
sap.ui.define([
	'./library', './ColumnListItem', './P13nPanel', './SearchField', './Text', './Table', './Column', './ScrollContainer', './P13nSelectionItem', './VBox', './Link', './OverflowToolbar', './OverflowToolbarLayoutData', './ToolbarSpacer', 'sap/ui/core/library', 'sap/ui/model/ChangeReason', 'sap/ui/model/json/JSONModel', 'sap/ui/model/BindingMode', 'sap/ui/core/ResizeHandler', "sap/ui/thirdparty/jquery"
], function(library, ColumnListItem, P13nPanel, SearchField, Text, Table, Column, ScrollContainer, P13nSelectionItem /* kept for compatibility*/, VBox, Link, OverflowToolbar, OverflowToolbarLayoutData, ToolbarSpacer, CoreLibrary, ChangeReason, JSONModel, BindingMode, ResizeHandler, jQuery) {
	"use strict";

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.P13nPanelType
	var P13nPanelType = library.P13nPanelType;

	/**
	 * Constructor for a new P13nSelectionPanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nSelectionPanel control is used to define selection settings like the visibility or the order of items.
	 * @extends sap.m.P13nPanel
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.46.0
	 * @alias sap.m.P13nSelectionPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nSelectionPanel = P13nPanel.extend("sap.m.P13nSelectionPanel", /** @lends sap.m.P13nSelectionPanel.prototype */
	{
		metadata: {
			library: "sap.m",
			aggregations: {
				/**
				 * List of columns that has been changed
				 */
				selectionItems: {
					type: "sap.m.P13nSelectionItem",
					multiple: true,
					singularName: "selectionItem",
					bindable: "bindable"
				},

				/**
				 * Internal aggregation for the toolbar
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
				 * Event raised if <code>selectionItems</code> is changed or new one needs to be created in the model.
				 *
				 * @since 1.52
				 */
				changeSelectionItems: {
					parameters: {
						/**
						 * Array contains an object for each item in <code>items</code> aggregation enriched with
						 * visibility information. The item order reflects the current order of columns in the panel.
						 * @since 1.52
						 */
						items: {
							type: "object[]"
						}
					}
				}
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

	// ----------------------- Overwrite Method -----------------

	P13nSelectionPanel.prototype.init = function() {
		this._iLiveChangeTimer = 0;
		this._iSearchTimer = 0;

		this._bIgnoreUpdateInternalModel = false;
		this._bUpdateInternalModel = true;

		this._bOnAfterRenderingFirstTimeExecuted = false;

		var oModel = new JSONModel({
			items: [],
			countOfSelectedItems: 0,
			countOfItems: 0
		});
		oModel.setDefaultBindingMode(BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapmP13nSelectionPanel");

		this.setType(P13nPanelType.selection);

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

	P13nSelectionPanel.prototype.onBeforeRendering = function() {
		this._updateInternalModel();
	};

	P13nSelectionPanel.prototype.onAfterRendering = function() {
		var that = this;

		// adapt scroll-container very first time to the right size of the browser
		if (!this._bOnAfterRenderingFirstTimeExecuted) {
			this._bOnAfterRenderingFirstTimeExecuted = true;

			window.clearTimeout(this._iLiveChangeTimer);
			this._iLiveChangeTimer = window.setTimeout(function() {
				that._fnHandleResize();
			}, 0);
		}
	};

	P13nSelectionPanel.prototype.getOkPayload = function() {
		this._updateInternalModel();
		var aMItems = this._getInternalModel().getProperty("/items");
		return {
			// We have to return selectionItems as of the fact that new created or deleted selectionItems
			// are not updated in the model via list binding.
			selectionItems: aMItems.map(function(oMItem) {
				return {
					columnKey: oMItem.columnKey,
					selected: oMItem.persistentSelected
				};
			})
		};
	};

	P13nSelectionPanel.prototype.exit = function() {
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

	// ----------------------- Overwrite Methods of Item Aggregation ----------------------

	P13nSelectionPanel.prototype.addItem = function(oItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.addAggregation("items", oItem);
		return this;
	};

	P13nSelectionPanel.prototype.insertItem = function(oItem, iIndex) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.insertAggregation("items", oItem, iIndex);
		return this;
	};

	P13nSelectionPanel.prototype.removeItem = function(oItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		oItem = this.removeAggregation("items", oItem);
		return oItem;
	};

	P13nSelectionPanel.prototype.removeAllItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAllAggregation("items");
	};

	P13nSelectionPanel.prototype.destroyItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.destroyAggregation("items");
		return this;
	};

	// ----------------------- Overwrite Methods of SelectionItem Aggregation ---------------------

	P13nSelectionPanel.prototype.addSelectionItem = function(oSelectionItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.addAggregation("selectionItems", oSelectionItem);
		return this;
	};

	P13nSelectionPanel.prototype.insertSelectionItem = function(oSelectionItem, iIndex) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.insertAggregation("selectionItems", oSelectionItem, iIndex);
		return this;
	};

	P13nSelectionPanel.prototype.updateSelectionItems = function(sReason) {
		this.updateAggregation("selectionItems");

		if (sReason === ChangeReason.Change && !this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
	};

	P13nSelectionPanel.prototype.removeSelectionItem = function(oSelectionItem) {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAggregation("selectionItems", oSelectionItem);
	};

	P13nSelectionPanel.prototype.removeAllSelectionItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		return this.removeAllAggregation("selectionItems");
	};

	P13nSelectionPanel.prototype.destroySelectionItems = function() {
		if (!this._bIgnoreUpdateInternalModel) {
			this._bUpdateInternalModel = true;
		}
		this.destroyAggregation("selectionItems");
		return this;
	};

	// ----------------------- Overwrite Method of P13nPanel -----------------

	P13nSelectionPanel.prototype.onBeforeNavigationFrom = function() {
		// this._syncModel2Panel();
		return true;
	};

	P13nSelectionPanel.prototype._notifyChange = function() {
		var fListener = this.getChangeNotifier();
		if (fListener) {
			fListener(this);
		}
	};

	// -------------------------- new --------------------------------------------

	P13nSelectionPanel.prototype._getInternalModel = function() {
		return this.getModel("$sapmP13nSelectionPanel");
	};

	P13nSelectionPanel.prototype._createTable = function() {
		var that = this;
		this._oTable = new Table({
			mode: ListMode.MultiSelect,
			rememberSelections: false,
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
					cells: new VBox({
						items: [
							new Link({
								href: "{href}",
								text: "{text}",
								target: "{target}",
								enabled: {
									path: 'href',
									formatter: function(oValue) {
										if (!oValue) {
											this.addStyleClass("sapUiCompSmartLink");
										}
										return !!oValue;
									}
								},
								press: function(oEvent) {
									var sHref = oEvent.getSource().getHref();
									var oItems = that.getItems().filter(function(oItem) {
										return oItem.getHref() === sHref && !!oItem.getPress();
									});
									if (!oItems.length) {
										return;
									}
									var fnPress = oItems[0].getPress();
									fnPress(oEvent);
								}
							}), new Text({
								visible: {
									path: 'description',
									formatter: function(sDescription) {
										return !!sDescription;
									}
								},
								text: "{description}"
							})
						]
					}),
					visible: "{visible}",
					selected: "{persistentSelected}",
					tooltip: "{tooltip}",
					type: ListType.Active
				})
			}
		});
		this._oTable.setModel(this._getInternalModel());
	};

	P13nSelectionPanel.prototype._createToolbar = function() {
		var that = this;
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
					// priority: OverflowToolbarPriority.High
					})
				})
			]
		});
		oToolbar.setModel(this._getInternalModel());
		this.addAggregation("content", oToolbar);
	};

	P13nSelectionPanel.prototype._onExecuteSearch = function() {
		this._switchVisibilityOfUnselectedModelItems();
		this._filterModelItemsBySearchText();
		this._updateControlLogic();
	};

	P13nSelectionPanel.prototype._switchVisibilityOfUnselectedModelItems = function() {
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

	P13nSelectionPanel.prototype._getVisibleModelItems = function() {
		return this._getInternalModel().getProperty("/items").filter(function(oMItem) {
			return !!oMItem.visible;
		});
	};

	P13nSelectionPanel.prototype._getModelItemByColumnKey = function(sColumnKey) {
		var aMItems = this._getInternalModel().getProperty("/items").filter(function(oMItem) {
			return oMItem.columnKey === sColumnKey;
		});
		return aMItems[0];
	};

	P13nSelectionPanel.prototype._updateCounts = function(aMItems) {
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

	P13nSelectionPanel.prototype._getToolbar = function() {
		return sap.ui.getCore().byId(this.getId() + "-toolbar") || null;
	};
	P13nSelectionPanel.prototype._getSearchField = function() {
		return sap.ui.getCore().byId(this.getId() + "-searchField") || null;
	};
	P13nSelectionPanel.prototype._getSearchText = function() {
		var oSearchField = this._getSearchField();
		return oSearchField ? oSearchField.getValue() : "";
	};
	P13nSelectionPanel.prototype._isFilteredBySearchText = function() {
		return !!this._getSearchText().length;
	};
	P13nSelectionPanel.prototype._isFilteredByShowSelected = function() {
		return false;
	};
	P13nSelectionPanel.prototype._updateControlLogic = function() {
		var bIsSearchActive = this._isFilteredBySearchText();
		var bShowOnlySelectedItems = this._isFilteredByShowSelected();

		// Switch off the "Select all (n/m)" checkbox if search
		var oTableCB = sap.ui.getCore().byId(this._oTable.getId() + '-sa');
		if (oTableCB) {
			oTableCB.setEnabled(!bIsSearchActive && !bShowOnlySelectedItems);
		}
	};

	P13nSelectionPanel.prototype._fireChangeSelectionItems = function() {
		this._bIgnoreUpdateInternalModel = true;

		var aMItems = this._getInternalModel().getProperty("/items");
		this.fireChangeSelectionItems({
			items: aMItems.map(function(oMItem) {
				return {
					columnKey: oMItem.columnKey,
					selected: oMItem.persistentSelected
				};
			})
		});

		this._bIgnoreUpdateInternalModel = false;
	};

	P13nSelectionPanel.prototype._onSelectionChange = function() {
		this._selectTableItem();
	};

	P13nSelectionPanel.prototype._selectTableItem = function() {
		// No update of model items is needed as it is already up-to-date due to binding of 'persistentSelected'

		// Do not sort after user interaction as the table should not be sorted once selected items has been rendered

		var aMItems = this._getInternalModel().getProperty("/items");
		this._updateCounts(aMItems);
		this._getInternalModel().setProperty("/items", aMItems);

		this._fireChangeSelectionItems();

		this._notifyChange();
	};

	P13nSelectionPanel.prototype._filterModelItemsBySearchText = function() {
		var sSearchText = this._getSearchText();
		// Replace white spaces at begin and end of the searchText. Leave white spaces in between.
		sSearchText = sSearchText.replace(/(^\s+)|(\s+$)/g, '');
		// Escape special characters entered by user
		sSearchText = sSearchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		// i = ignore case; g = global; m = multiline
		var oRegExp = new RegExp(sSearchText, 'igm');

		this._getVisibleModelItems().forEach(function(oMItem) {
			oMItem.visible = false;
			// Search in item text
			if (oMItem.text && oMItem.text.match(oRegExp)) {
				oMItem.visible = true;
			}
			// Search in tooltip
			if (oMItem.tooltip && oMItem.tooltip.match(oRegExp)) {
				oMItem.visible = true;
			}
		});
		this._getInternalModel().refresh();
	};

	/**
	 * Synchronize <code>selectionItems</code> and <code>items</code> aggregations with the internal JSON model
	 * and take over data from the model of aggregation binding.
	 * @private
	 */
	P13nSelectionPanel.prototype._updateInternalModel = function() {
		if (!this._bUpdateInternalModel) {
			return;
		}
		this._bUpdateInternalModel = false;

		this._getInternalModel().setProperty("/items", this.getItems().map(function(oItem) {
			return {
				columnKey: oItem.getColumnKey(),
				visible: true,
				text: oItem.getText(),
				tooltip: oItem.getTooltip(),
				href: oItem.getHref(),
				target: oItem.getTarget(),
				// default value
				persistentSelected: oItem.getVisible(),
				description: oItem.getDescription()
			};
		}, this));

		this.getSelectionItems().forEach(function(oSelectionItem) {
			var oMItem = this._getModelItemByColumnKey(oSelectionItem.getColumnKey());
			if (!oMItem) {
				return;
			}
			if (oSelectionItem.getSelected() !== undefined) {
				oMItem.persistentSelected = oSelectionItem.getSelected();
			}
		}, this);

		this._switchVisibilityOfUnselectedModelItems();
		this._filterModelItemsBySearchText();

		var aMItems = this._getInternalModel().getProperty("/items");
		this._updateCounts(aMItems);
		this._getInternalModel().setProperty("/items", aMItems);
	};

	return P13nSelectionPanel;

});
