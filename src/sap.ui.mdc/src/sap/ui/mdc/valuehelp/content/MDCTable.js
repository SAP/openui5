/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/FilterableListContent',
	'sap/ui/mdc/util/loadModules',
	'sap/ui/mdc/util/Common',
	'sap/base/Log',
	'sap/ui/core/Element',
	'sap/ui/mdc/enums/TableSelectionMode',
	'sap/ui/mdc/enums/TableType',
	'sap/ui/mdc/enums/ValueHelpSelectionType',
	'sap/ui/mdc/enums/TableRowCountMode',
	'sap/base/util/restricted/_throttle'
], function(
	FilterableListContent,
	loadModules,
	Common,
	Log,
	Element,
	TableSelectionMode,
	TableType,
	ValueHelpSelectionType,
	TableRowCountMode,
	_throttle
) {
	"use strict";

	/**
	 * Constructor for a new <code>MDCTable</code> content.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element using a {@link sap.ui.mdc.Table}.
	 * @extends sap.ui.mdc.valuehelp.base.FilterableListContent
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @public
	 * @since 1.95.0
	 * @alias sap.ui.mdc.valuehelp.content.MDCTable
	 */
	var MDCTable = FilterableListContent.extend("sap.ui.mdc.valuehelp.content.MDCTable", /** @lends sap.ui.mdc.valuehelp.content.MDCTable.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.IDialogContent"
			],
			properties: {
				/**
				 * This property will lead to a rebind on newly inserted tables after initial filters are set, immediately before the table is shown for the first time.
				 *
				 * <b>Note:</b> This only takes effect if autoBindOnInit is disabled on the <code>Table</code>
				 */
				forceBind: {
					type: "boolean",
					defaultValue: false
				}
			},
			aggregations: {
				/**
				 * Table to be used in value help
				 *
				 * <b>Note:</b> Set the right selection mode (multiple selection or single selection) as it cannot be determined automatically
				 * for every case. (Maybe for multi-value {@link sap.ui.mdc.FilterField FilterField} controls only single selection from table might be wanted.)
				 */
				table: {
					type: "sap.ui.mdc.Table",
					multiple: false
				}
			},
			events: {

			},
			defaultAggregation: "table"
		}
	});

	MDCTable.prototype.init = function () {
		FilterableListContent.prototype.init.apply(this, arguments);
		this._oObserver.observe(this, {
			aggregations: ["table"]
		});
		this._bRebindTable = false;
	};


	MDCTable.prototype._setTableSelectionState = function () {
		this._bSelectionIsUpdating = true;
		var aAllCurrentContexts = this._getAllCurrentContexts();
		if (aAllCurrentContexts) {
			this._oTable._setSelectedContexts(aAllCurrentContexts.filter(function (oContext) {
				return this._isContextSelected(oContext, this.getConditions());
			}.bind(this)));
		}
		this._bSelectionIsUpdating = false;
	};

	MDCTable.prototype.handleConditionsUpdate = function() {
		if (!this._bIgnoreNextConditionChange) {
			// When new conditions are set from outside (connected control or dialog tokenizer) we have to sync all the table selection once
			this._setTableSelectionState();
		} else {
			// If the Table updated the conditions itself because of an interaction, we do not need to update anything
			this._bIgnoreNextConditionChange = false;
		}
	};

	MDCTable.prototype._handleUpdateFinished = function (oEvent) {
		if (this._oTable) {
			this._handleRowBinding();
			if (!this._bQueryingContexts) {
				// In every case update table selection state for eventual newly loaded contexts
				this._setTableSelectionState();
			}
		}
	};

	MDCTable.prototype._handleUpdateFinishedThrottled = _throttle(MDCTable.prototype._handleUpdateFinished, 100, {leading: false});

	MDCTable.prototype._handleRowBinding = function () {
		var oRowBinding = this._oTable.getRowBinding();
		if (oRowBinding) {
			this._resolvePromise("listBinding", oRowBinding);
		}
	};

	MDCTable.prototype.observeChanges = function (oChanges) {
		if (oChanges.name === "table") { // outer table
			var oTable = oChanges.child;
			if (oChanges.mutation === "remove") {
				this._oTable.detachEvent('_bindingChange', this._handleUpdateFinishedThrottled, this);
				this._oTable.detachEvent('selectionChange', this._handleSelectionChange, this);
				this._oTable = null;
			} else {
				this._oTable = oTable;
				this._addPromise("listBinding");
				this._handleRowBinding();
				if (this._oTable.getAutoBindOnInit()) {
					Log.warning("Usage of autobound tables may lead to unnecessary requests.");
				} else if (this.getForceBind()) {
					this._bRebindTable = true;
				}

				oTable.addDelegate({ onmouseover: function (oEvent) {   // Fix m.Table itemPress
					var oItem = Element.closestTo(oEvent.target);
					if (oItem && oItem.isA("sap.m.ColumnListItem")) {
						oItem.setType("Active");
					}
				}});

				this._oTable.initialized().then(function () {
					this._oTable.attachEvent('_bindingChange', this._handleUpdateFinishedThrottled, this);
					this._oTable.attachEvent('selectionChange', this._handleSelectionChange, this);
				}.bind(this));
			}
			return;
		}

		FilterableListContent.prototype.observeChanges.apply(this, arguments);
	};

	MDCTable.prototype._getAllCurrentContexts = function () {
		var oRowBinding = this._oTable && this._oTable.getRowBinding();
		if (oRowBinding) {
			return oRowBinding.getAllCurrentContexts ? oRowBinding.getAllCurrentContexts() : oRowBinding.getContexts();
		}
		return undefined;
	};

	MDCTable.prototype._handleSelectionChange = function (oEvent) {
		if (!this._bSelectionIsUpdating) { // TODO: New handling for internally triggered events on MDC Table's events?
			this._bQueryingContexts = true; // In ODataV4 getAllCurrentContexts may lead to a binding change event
			var aAllCurrentContexts = this._getAllCurrentContexts();
			var aSelectedTableContexts = aAllCurrentContexts && this._oTable.getSelectedContexts();
			this._bQueryingContexts = false;

			if (aAllCurrentContexts) {
				var aCurrentConditions = this.getConditions();
				var aModifiedConditions = aCurrentConditions;
				var bFireSelect = false;

				aAllCurrentContexts.forEach(function (oContext) {
					var aConditionsForContext = this._findConditionsForContext(oContext, aCurrentConditions);
					var bIsInSelectedConditions = !!aConditionsForContext.length;
					var bSelectedInTable = aSelectedTableContexts.indexOf(oContext) >= 0;
					if (!bIsInSelectedConditions && bSelectedInTable) {
						var oItem = this.getItemFromContext(oContext);
						var oCondition = oItem && this.createCondition(oItem.key, oItem.description, oItem.payload);
						aModifiedConditions = this.isSingleSelect() ? [oCondition] : aModifiedConditions.concat(oCondition);
						bFireSelect = true;
					} else if (bIsInSelectedConditions && !bSelectedInTable) {
						aModifiedConditions = aModifiedConditions.filter(function (oCondition) {
							return aConditionsForContext.indexOf(oCondition) === -1;
						});
						bFireSelect = true;
					}
				}.bind(this));

				if (bFireSelect) {
					this._prepareSelect(aModifiedConditions, ValueHelpSelectionType.Set);
				}
			}
		}
	};


	MDCTable.prototype._prepareSelect = function (aConditions, vSelected) {
		var sMultiSelectType = typeof vSelected === 'string' && vSelected;
		sMultiSelectType = sMultiSelectType || (vSelected ? ValueHelpSelectionType.Add : ValueHelpSelectionType.Remove);
		this._bIgnoreNextConditionChange = true;
		this._fireSelect({type: sMultiSelectType, conditions: aConditions});
	};

	MDCTable.prototype._getTable = function () {
		return this._oTable;
	};

	MDCTable.prototype.getContent = function () {
		return this._retrievePromise("wrappedContent", function () {
			return loadModules([
				"sap/ui/layout/FixFlex",
				"sap/m/VBox",
				"sap/m/ScrollContainer"
			]).then(function(aModules) {

				var FixFlex = aModules[0];
				var VBox = aModules[1];
				var ScrollContainer = aModules[2];

				if (!this._oContentLayout) {

					this._oFilterBarVBox = new VBox(this.getId() + "-FilterBarBox", {visible: "{$this>/_filterBarVisible}"});
					this._oFilterBarVBox.addStyleClass("sapMdcValueHelpPanelFilterbar");
					this._oFilterBarVBox._oWrapper = this;
					this._oFilterBarVBox.getItems = function () {
						var oFilterBar = this._oWrapper._getPriorityFilterBar.call(this._oWrapper);
						var aItems = oFilterBar ? [oFilterBar] : [];
						return aItems;
					};

					this._oTableBox = new VBox(this.getId() + "-TB", {height: "100%"});
					this._oTableBox.addStyleClass("sapMdcValueHelpPanelTableBox");
					this._oTableBox._oWrapper = this;
					this._oTableBox.getItems = function () {
						var oTable = this._oWrapper._oTable._isOfType(TableType.ResponsiveTable) ? this._oWrapper._oScrollContainer : this._oWrapper._oTable;
						var aItems = oTable ? [oTable] : [];
						return aItems;
					};

					this._oContentLayout = new FixFlex(this.getId() + "-FF", {minFlexSize: 200, fixContent: this._oFilterBarVBox, flexContent: this._oTableBox});

					this._oScrollContainer = new ScrollContainer(this.getId() + "-SC", {
						height: "calc(100% - 0.5rem)",
						width: "100%",
						vertical: true
					});

					this._oScrollContainer._oWrapper = this;
					this._oScrollContainer.getContent = function() {
						var aContent = [];
						var oTable = this._oWrapper && this._oWrapper._oTable;
						if (oTable) {
							aContent.push(oTable);
						}
						return aContent;
					};
				}

				this.setAggregation("displayContent", this._oContentLayout);

				if (!this._getPriorityFilterBar()) {
					return this._createDefaultFilterBar().then(function () {
						this._oFilterBarVBox.invalidate(); // to rerender if FilterBar added
						return this._oContentLayout;
					}.bind(this));
				}
				return this._oContentLayout;
			}.bind(this));
		}.bind(this));
	};

	MDCTable.prototype.getListBinding = function() {
		var oTable = this.getTable();
		return oTable && oTable.getRowBinding();
	};

	MDCTable.prototype._configureTable = function () {
		if (this._oTable) {
			var bSingleSelect = FilterableListContent.prototype.isSingleSelect.apply(this);
			var oTableType = this._oTable._getType();

			// Connect filterBar
			var oFilterBar = this._getPriorityFilterBar();
			if (oFilterBar && this._oTable.getFilter() !== oFilterBar.getId()) {
				this._oTable.setFilter(oFilterBar);
			}

			// Adjust header
			if (!this._oTable.getHeader()) {
				this._oTable.setHeader( this._oResourceBundle.getText("valuehelp.TABLETITLENONUMBER"));
			}

			// Adjust selection
			var sSelectionMode = bSingleSelect ? TableSelectionMode.SingleMaster : TableSelectionMode.Multi;
			if (this._oTable.getSelectionMode() === TableSelectionMode.None) { // only set automatically if not provided from outside (and do it only once)
				this._oTable.setSelectionMode(sSelectionMode);
			}

			if (this._oTable.getSelectionMode() !== sSelectionMode) {
				throw new Error("Table selectionMode needs to be " + sSelectionMode);
			}

			var bGridTableType = this._oTable._isOfType(TableType.Table);
			var bResponsiveTableType = !bGridTableType && this._oTable._isOfType(TableType.ResponsiveTable);

			if (bGridTableType) {
				var oRowCountMode = oTableType.getRowCountMode();
				if (oRowCountMode === TableRowCountMode.Auto) {
					oTableType.setRowCount(3);
				}
			}

			// Wait for internal table creation to apply the selectionBehavior
			this._oTable.initialized().then(() => {
				if (bGridTableType) {
					if (sSelectionMode !== TableSelectionMode.SingleMaster) {
						this._oTable._setInternalProperty("selectionBehavior", "Row"); // We want to be able to click anywhere on the row for selection in Multi mode
					}
				} else if (bResponsiveTableType) {
					this._oTable._setInternalProperty("includeItemInSelection", true);
				}
			});
		}
	};

	MDCTable.prototype.onShow = function () {
		FilterableListContent.prototype.onShow.apply(this, arguments);
	};

	MDCTable.prototype.onBeforeShow = function (bInitial) {
		this._configureTable();
		return Promise.resolve(FilterableListContent.prototype.onBeforeShow.apply(this, arguments)).then(function () {
			var oTable = this.getTable();
			if (oTable) {
				var bTableBound = oTable.isTableBound();
				var bOverlay = bTableBound && oTable._oTable.getShowOverlay();
				if (this._bRebindTable || bOverlay) {
					oTable.rebind();
					this._bRebindTable = false;
				} else if (bInitial) {
					if (oTable._isOfType(TableType.ResponsiveTable)) {
						this._oScrollContainer.scrollTo(0, 0);
					} else if (bTableBound) { //scrollToIndex throws error if internal table doesn't exist
						return oTable.scrollToIndex(0);
					}
				}
			}
		}.bind(this));
	};

	MDCTable.prototype.getScrollDelegate = function() {
		if (!this.isTypeahead() && this._oScrollContainer) {
			return this._oScrollContainer.getScrollDelegate();
		}
		return FilterableListContent.prototype.getScrollDelegate.apply(this, arguments);
	};

	MDCTable.prototype.isQuickSelectSupported = function() {
		return true;
	};

	MDCTable.prototype.setParent = function(oParent) {
		FilterableListContent.prototype.setParent.apply(this, arguments);
	};

	MDCTable.prototype.isSingleSelect = function() {

		// use selection mode of table if set
		if (this._oTable) {
			if (this._oTable.getSelectionMode() === TableSelectionMode.Multi) {
				return false;
			} else {
				return true;
			}
		} else {
			return FilterableListContent.prototype.isSingleSelect.apply(this, arguments);
		}

	};

	MDCTable.prototype.exit = function name(params) {
		Common.cleanup(this, [
			"_oContentLayout",
			"_oFilterBarVBox",
			"_oTableBox",
			"_oResourceBundle",
			"_oScrollContainer",
			"_oTableHelper",
			"_bSelectionIsUpdating",
			"_sTableType",
			"_oUITableSelectionPlugin",
			"_oTable",
			"_bRebindTable",
			"_mKnownContexts",
			"_bIgnoreNextConditionChange",
			"_bQueryingContexts"
		]);

		FilterableListContent.prototype.exit.apply(this, arguments);
	};

	return MDCTable;
});

