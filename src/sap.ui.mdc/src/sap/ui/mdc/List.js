/*!
 * ${copyright}
 */

sap.ui.define([
	"./ListTableBase",
	"./ActionToolbar",
	"./util/ListToolbarFactory",
	"./list/PropertyHelper",
	"./util/Common",
	"./list/GridListType",
	"./list/ListType",
	"./enums/ListP13nMode",
	"./enums/ListGrowingMode",
	"./enums/ListSelectionMode",
	"./p13n/subcontroller/SortController",
	"./p13n/subcontroller/FilterController",
	"./p13n/subcontroller/GroupController",
	"sap/m/library",
	"./mixin/ActionToolbarMixin",
	"./mixin/DeferredAggregationForwardMixin",
	"sap/base/Log",
	"./enums/ListType"
], (
	ListTableBase,
	ActionToolbar,
	ListToolbarFactory,
	PropertyHelper,
	Common,
	GridListType,
	ListType,
	ListP13nMode,
	ListGrowingMode,
	ListSelectionMode,
	SortController,
	FilterController,
	GroupController,
	MLibrary,
	ActionToolbarMixin,
	DeferredAggregationForwardMixin,
	Log,
	ListTypeEnum // load for availability
) => {
	"use strict";

	const {ToolbarStyle} = MLibrary;
	const mTypeMap = {
		"List": ListType,
		"GridList": GridListType,
		"null": GridListType // default
	};

	/**
	 * Constructor for a new <code>List</code>.
	 *
	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * A metadata-driven list to simplify the usage of list-like controls such as <code>sap.f.GridList</code> and <code>sap.m.List</code>.
	 *
	 * The template for the item content is provided by the application via <code>itemContentTemplate</code>.
	 *
	 * @extends sap.ui.mdc.ListTableBase
	 * @author SAP SE
	 * @since 1.153
	 * @alias sap.ui.mdc.List
	 * @private
	 * @ui5-restricted sap.fe
	 */
	const List = ListTableBase.extend("sap.ui.mdc.List", {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/list/List.designtime",
			properties: {
				/**
				 * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.
				 *
				 * The object has the following properties:
				 * <ul>
				 *   <li><code>name</code> defines the path to the <code>Delegate</code> module</li>
				 *   <li><code>payload</code> (optional) defines application-specific information to provide to the delegate</li>
				 * </ul>
				 */
				delegate: {
					type: "object",
					defaultValue: {
						name: "sap/ui/mdc/ListDelegate",
						payload: {}
					},
					bindable: false
				},
				/**
				 * Determines whether the item count is shown in the toolbar of the list.
				 */
				showItemCount: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},
				/**
				 * Selection mode of the list. Determines whether items can be selected and how.
				 */
				selectionMode: {
					type: "sap.ui.mdc.enums.ListSelectionMode",
					group: "Behavior",
					defaultValue: ListSelectionMode.None
				},
				/**
				 * Personalization options for the list.
				 * The order of the provided options does not influence their order on the UI.
				 *
				 * Supported values and their effects:
				 * <ul>
				 *   <li><code>Sort</code> — enables the sort panel in the personalization dialog and applies sorters to the items binding.</li>
				 *   <li><code>Filter</code> — enables the inbuilt filter panel in the personalization dialog and applies filter conditions
				 *       to the items binding. External <code>IFilter</code> association is also supported via
				 *       {@link sap.ui.mdc.mixin.FilterIntegrationMixin}.</li>
				 *   <li><code>Group</code> — enables the group panel in the personalization dialog and applies grouping sorters to the items binding.
				 *       Only single-level grouping is supported; multi-level grouping options in the dialog are not applicable.</li>
				 * </ul>
				 *
				 * The following capabilities are <b>not</b> supported for <code>sap.ui.mdc.List</code>:
				 * column visibility, aggregation, and column reorder.
				 */
				p13nMode: {
					type: "sap.ui.mdc.enums.ListP13nMode[]",
					group: "Behavior",
					defaultValue: []
				},
				/**
				 * Activates the growing feature of the list. Use <code>threshold</code> to control the batch size.
				 */
				growingMode: {
					type: "sap.ui.mdc.enums.ListGrowingMode",
					group: "Behavior",
					defaultValue: ListGrowingMode.Basic
				}
			},
			aggregations: {
				/**
				 * Type of the list. Defines which inner list control is used.
				 */
				type: {
					type: "sap.ui.mdc.list.ListTypeBase",
					altTypes: [
						"sap.ui.mdc.enums.ListType"
					],
					multiple: false
				},
				/**
				 * Template for the content of each list item.
				 */
				itemContentTemplate: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				/**
				 * Settings that are applied to each item of the list, such as highlight and navigated state.
				 *
				 * <b>Note:</b> Each time the properties of the settings are changed, they must be applied
				 * again via <code>setItemSettings</code> for the changes to take effect.
				 */
				itemSettings: {
					type: "sap.ui.mdc.list.ItemSettings",
					multiple: false
				}
			},
			events: {
				/**
				 * This event is fired when a list item is pressed.
				 */
				itemPress: {
					parameters: {
						/**
						 * The binding context of the pressed item.
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						}
					}
				}
			}
		},
		constructor: function() {
			ListTableBase.apply(this, arguments);
			this.bCreated = true;
			this._updateAdaptation();
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oList) {
				const oType = oList._getType();
				const sTypeClass = oType?.isA?.("sap.ui.mdc.list.ListTypeBase") ? oType : null;
				oRm.openStart("div", oList);
				oRm.class("sapUiMdcList");
				sTypeClass?.getStyleClasses().forEach((sClass) => oRm.class(sClass));
				oRm.style("width", oList.getWidth());
				oRm.openEnd();
				oRm.renderControl(oList.getAggregation("_content"));
				oRm.close("div");
			}
		}
	});

	ActionToolbarMixin.call(List.prototype);

	List.prototype.init = function() {
		ListTableBase.prototype.init.apply(this, arguments);
		this._oInitialized = Promise.withResolvers();
		this._oInitialized.promise.catch(() => { /* suppress unhandled rejection when List is destroyed before initialization */ });
		// Prevent propagation of models and binding contexts into the itemSettings and itemContentTemplate
		// aggregations, as bindings there must be relative to the list items, not the list itself.
		// Without this, V4 auto-$expand/$select walks the template's property bindings and tries to
		// resolve item properties (e.g. SalesOrderItemText) against the page-level entity type.
		this.mSkipPropagation = { itemSettings: true, itemContentTemplate: true };

		this._setPropertyHelperClass(PropertyHelper);
	};

	List.prototype.applySettings = function(mSettings, oScope) {
		ListTableBase.prototype.applySettings.apply(this, arguments);
		// Initialize the property helper with an empty set so that awaitPropertyHelper() resolves
		// immediately. finalizePropertyHelper() later fetches real properties from the delegate.
		this.initPropertyHelper();
		this._initializeContent();
	};

	List.prototype.exit = function() {
		if (this._oItemsBinding) {
			this._detachItemsBindingListeners(this._oItemsBinding);
			this._oItemsBinding = null;
		}

		this._oInitialized.reject(new Error("sap.ui.mdc.List: control was destroyed before initialization completed"));
		this._oInitialized = null;

		Common.cleanup(this, [
			"_oToolbar"
		]);

		this._oList = null;
		this._oAppliedState = null;

		ListTableBase.prototype.exit.apply(this, arguments);
	};

	List.prototype.setType = function(vType) {
		if (!this.bCreated) {
			return this.setAggregation("type", vType, true);
		}

		this._resetContent();
		this._destroyDefaultType();
		this.setAggregation("type", vType);
		this._updateAdaptation();
		this._initializeContent();
		return this;
	};

	List.prototype.destroyType = function() {
		if (!this.getType()) {
			return this.destroyAggregation("type", true);
		}

		this._resetContent();
		this._destroyDefaultType();
		this.destroyAggregation("type");
		this._initializeContent();
		return this;
	};

	List.prototype.setItemContentTemplate = function(oTemplate) {
		this.setAggregation("itemContentTemplate", oTemplate, true);
		this._bindItems();
		return this;
	};

	List.prototype.setItemSettings = function(oItemSettings) {
		this.setAggregation("itemSettings", oItemSettings, true);
		this._getType().updateItemSettings();
		this._bindItems();
		return this;
	};

	List.prototype.setP13nMode = function(aP13nMode) {
		this.setProperty("p13nMode", aP13nMode, true);
		this._updateAdaptation();
		this._updateP13nButton();
		return this;
	};

	List.prototype.getEngineControllers = function() {
		const mControllers = {
			Sort: new SortController({ control: this }),
			Filter: new FilterController({ control: this }),
			Group: new GroupController({ control: this })
		};

		return this.getActiveP13nModes().reduce((mActive, sMode) => {
			mActive[sMode] = mControllers[sMode];
			return mActive;
		}, {});
	};

	List.prototype._onModifications = async function(aAffectedP13nControllers) {
		if (!aAffectedP13nControllers || !this._oList) {
			return;
		}

		const bRebindRequired = aAffectedP13nControllers.includes("Sort")
			|| aAffectedP13nControllers.includes("Filter")
			|| aAffectedP13nControllers.includes("Group");

		if (!bRebindRequired) {
			return;
		}

		await this.finalizePropertyHelper();
		this._bindItems();
		this._validateState();
	};

	/**
	 * Validates the current sort, filter, and group conditions against the available property helper.
	 * Logs an error for any condition key that no longer maps to a known property.
	 *
	 * @private
	 */
	List.prototype._validateState = function() {
		const oPropertyHelper = this.getPropertyHelper();

		if (!oPropertyHelper) {
			return;
		}

		const oSortConditions = this.getSortConditions();
		const aSorters = oSortConditions ? oSortConditions.sorters : [];
		aSorters.forEach((oSorter) => {
			if (!oPropertyHelper.getProperty(oSorter.key)) {
				Log.error(
					"sap.ui.mdc.List: sort condition references unknown property '" + oSorter.key + "'",
					null,
					"sap.ui.mdc.List"
				);
			}
		});

		const mFilterConditions = this.getFilterConditions();
		Object.keys(mFilterConditions).forEach((sKey) => {
			if (mFilterConditions[sKey].length > 0 && !oPropertyHelper.getProperty(sKey)) {
				Log.error(
					"sap.ui.mdc.List: filter condition references unknown property '" + sKey + "'",
					null,
					"sap.ui.mdc.List"
				);
			}
		});

		const oGroupConditions = this.getGroupConditions();
		const aGroups = oGroupConditions ? oGroupConditions.groupLevels : [];
		aGroups.forEach((oGroup) => {
			if (!oPropertyHelper.getProperty(oGroup.key)) {
				Log.error(
					"sap.ui.mdc.List: group condition references unknown property '" + oGroup.key + "'",
					null,
					"sap.ui.mdc.List"
				);
			}
		});
	};

	List.prototype.getSelectedContexts = function() {
		return this._oList?.getSelectedContexts() ?? [];
	};

	List.prototype.clearSelection = function() {
		this._oList?.removeSelections(true);
		return this;
	};

	List.prototype._initializeContent = function() {
		const oType = this._getType();
		const aInitPromises = [
			this.awaitControlDelegate(),
			this.awaitPropertyHelper(),
			oType.loadModules()
		];

		if (this.isFilteringEnabled()) {
			aInitPromises.push(this.retrieveInbuiltFilter());
		}

		Promise.all(aInitPromises).then(async () => {
			if (this.isDestroyed() || oType !== this._getType()) {
				return;
			}

			this._updateAdaptation();
			this._createContent();
			await this.getControlDelegate().initializeContent(this);
			this._oInitialized?.resolve(this);
			await this.finalizePropertyHelper();
		}).catch((vError) => {
			Log.error("Failed to initialize sap.ui.mdc.List content", vError, "sap.ui.mdc.List");
			if (this._oInitialized) {
				this._oInitialized.reject(vError);
			}
		});
	};

	List.prototype.initialized = function() {
		const oDelegatePromise = this.awaitControlDelegate ? this.awaitControlDelegate() : Promise.resolve();
		const oListPromise = this._oInitialized ? this._oInitialized.promise : Promise.resolve(this);

		return Promise.all([oDelegatePromise, oListPromise]).then(() => this);
	};

	List.prototype._getTypeKey = function() {
		const vType = this.getType();

		if (typeof vType === "string" || vType === null) {
			return vType || "GridList";
		}

		return this._isOfType("List", true) ? "List" : "GridList";
	};

	List.prototype.getCurrentState = function() {
		const aP13nMode = this.getActiveP13nModes();
		const oState = {};

		if (aP13nMode.includes("Sort")) {
			const oSortConditions = this.getSortConditions();
			oState.sorters = oSortConditions ? oSortConditions.sorters : [];
		}

		if (aP13nMode.includes("Filter")) {
			oState.filter = this.getFilterConditions();
		}

		if (aP13nMode.includes("Group")) {
			const oGroupConditions = this.getGroupConditions();
			oState.groupLevels = oGroupConditions ? oGroupConditions.groupLevels : [];
		}

		return oState;
	};

	List.prototype.applyState = function(oState) {
		if (!oState) {
			return Promise.resolve();
		}

		if (oState.type && oState.type !== this._getTypeKey()) {
			this.setType(oState.type);
		}

		if (Array.isArray(oState.p13nMode)) {
			this.setP13nMode(oState.p13nMode);
		}

		if (oState.sorters !== undefined) {
			this.setSortConditions({ sorters: oState.sorters });
		}

		if (oState.filter !== undefined) {
			this.setFilterConditions(oState.filter);
		}

		if (oState.groupLevels !== undefined) {
			this.setGroupConditions({ groupLevels: oState.groupLevels });
		}

		if (oState.sorters !== undefined || oState.filter !== undefined || oState.groupLevels !== undefined) {
			this._bindItems();
		}

		this._oAppliedState = oState;

		return Promise.resolve();
	};

	List.prototype._resetContent = function() {
		if (!this._oList) {
			return;
		}

		if (this._oItemsBinding) {
			this._detachItemsBindingListeners(this._oItemsBinding);
			this._oItemsBinding = null;
		}

		this._getType().removeToolbar();

		this._oList.destroy("KeepDom");
		this._oList = null;
	};

	List.prototype._createContent = function() {
		const oType = this._getType();

		this._createToolbar();
		this._oList = oType.createList();

		if (!this._oList) {
			return;
		}

		// The title element always serves as the accessible label for the inner list,
		// even when it is visually hidden (headerVisible=false).
		// _createToolbar() is called above so _oTitle is always available here;
		// the guard is a defensive fallback in case toolbar creation is skipped.
		if (this._oTitle) {
			this._oList.addAriaLabelledBy(this._oTitle);
		} else {
			// Fallback: label the inner list directly with the header text
			const sHeader = this.getHeader();
			if (sHeader) {
				if (this._oList.setAriaLabelledBy) {
					this._oList.setAriaLabelledBy(sHeader);
				} else if (this._oList.setProperty) {
					this._oList.setProperty("accessibleName", sHeader, true);
				}
			}
		}

		this.setAggregation("_content", this._oList);
		this._registerForwardingTarget(this._oList);
		this._oList.attachBeforeOpenContextMenu((oEvent) => {
			const oListItem = oEvent.getParameter("listItem");
			const bPreventDefault = !this.fireBeforeOpenContextMenu({
				bindingContext: oListItem?.getBindingContext()
			});
			if (bPreventDefault) {
				oEvent.preventDefault();
			}
		});
		if (this.getAutoBindOnInit()) {
			this._bindItems();
		}
		this._updateP13nButton();
		this._updateExportButton();
	};

	List.prototype._getManagedObjectModelName = function() {
		return "$sap.ui.mdc.List";
	};

	List.prototype._getTypeStrategyMap = function() {
		return mTypeMap;
	};

	List.prototype._createToolbar = function() {
		if (this.isDestroyStarted()) {
			return null;
		}

		if (this._oToolbar && this._oToolbar.bIsDestroyed) {
			this._oToolbar = null;
			this._oTitle = null;
		}

		if (this._oToolbar) {
			this._updateToolbarStyle();
			return this._oToolbar;
		}

		this._oToolbar = new ActionToolbar(this.getId() + "-toolbar", {
			begin: [this._createTitle()],
			end: [this._getP13nButton()],
			ariaLabelledBy: [this._oTitle]
		});
		this._updateToolbarStyle();

		return this._oToolbar;
	};

	/**
	 * Applies the toolbar style based on the current list type.
	 *
	 * The GridList (card layout) uses the <code>Clear</code> toolbar style so no separator line is
	 * rendered below the title, matching how <code>sap.ui.mdc.Table</code> styles its non-responsive
	 * toolbar. The plain <code>sap.m.List</code> type keeps the <code>Standard</code> style (with the
	 * line), consistent with Table's <code>ResponsiveTable</code>. Re-applied on every toolbar
	 * retrieval so the style stays correct across type switches.
	 *
	 * @private
	 */
	List.prototype._getToolbarStyle = function() {
		return this._isOfType("List", true) ? ToolbarStyle.Standard : ToolbarStyle.Clear;
	};

	List.prototype._createTitle = function() {
		const oTitle = ListTableBase.prototype._createTitle.apply(this, arguments);
		oTitle.setContext("List"); // the count reads as items, not rows
		oTitle.setShowExtendedView(true); // and shown in the extended form by default
		return oTitle;
	};

	List.prototype.getSupportedP13nModes = function() {
		return Object.keys(ListP13nMode);
	};

	/**
	 * Rebinds the list items. Called by {@link sap.ui.mdc.mixin.FilterIntegrationMixin}
	 * when the external filter fires a search event.
	 *
	 * @param {boolean} [bForceRefresh=false] If <code>true</code>, forces a full refresh of the binding
	 * @returns {Promise} A promise that resolves after the rebind is complete
	 * @private
	 */
	List.prototype._rebind = async function(bForceRefresh = false) {
		await this.initialized();

		if (this.isDestroyed()) {
			return;
		}

		const oBindingInfo = {
			templateShareable: false
		};

		this.getControlDelegate().updateBindingInfo(this, oBindingInfo);

		if (!oBindingInfo.path) {
			return;
		}

		const oExistingBinding = this._oList ? this._oList.getBinding("items") : null;
		await this.getControlDelegate().updateBinding(this, oBindingInfo, oExistingBinding, { forceRefresh: bForceRefresh });
	};

	List.prototype._getToolbarFactory = function() {
		return ListToolbarFactory;
	};

	List.prototype._bindItems = function() {
		if (!this._oList) {
			return;
		}

		const bDelegateReady = this.isControlDelegateInitialized();

		const oBindingInfo = {
			templateShareable: false
		};

		if (bDelegateReady) {
			this.getControlDelegate().updateBindingInfo(this, oBindingInfo);
		} else if (this.awaitControlDelegate instanceof Function && !this._bPendingInitialRebind) {
			this._bPendingInitialRebind = true;
			this.awaitControlDelegate().then(() => {
				this._bPendingInitialRebind = false;
				if (!this.isDestroyed()) {
					this._bindItems();
				}
			}).catch(() => {
				this._bPendingInitialRebind = false;
			});
		}

		if (!oBindingInfo.path) {
			this._updateExportButton();
			return;
		}

		const oItemTemplate = this.getItemContentTemplate();

		if (!oItemTemplate) {
			this._updateExportButton();
			return;
		}

		if (this._oList.getBindingInfo("items")) {
			const oOldTemplate = this._oList.getBindingInfo("items").template;
			this._oList.unbindItems();
			oOldTemplate?.destroy();
		}

		const oContentClone = oItemTemplate.clone(this.getId() + "-itemContentTemplate");
		const oWrapper = this._getType().wrapItemTemplate(oContentClone);
		// Extract the model name before bindItems() is called so that applyItemActions
		// can correctly resolve the per-row binding context via getBindingContext(sModelName).
		const sModelName = oBindingInfo.model ?? (typeof oBindingInfo.path === "string" && oBindingInfo.path.includes(">") ? oBindingInfo.path.split(">")[0] : undefined);
		this._applyItemSettings(oWrapper, sModelName);
		oBindingInfo.template = oWrapper;

		this._getType().bindItems(oBindingInfo);

		this._observeItemsBinding();
		this._updateExportButton();
		this._updateFilterInfoBar();
	};

	List.prototype._applyItemSettings = function(oWrapper, sModelName) {
		const oItemSettings = this.getItemSettings();

		if (!oItemSettings) {
			return;
		}

		const mSettings = oItemSettings.getAllSettings();
		const mSetterMap = {
			type: "setType",
			highlight: "setHighlight",
			highlightText: "setHighlightText",
			navigated: "setNavigated"
		};

		Object.keys(mSetterMap).forEach((sProperty) => {
			const vValue = mSettings[sProperty];
			const sSetter = mSetterMap[sProperty];

			if (!(oWrapper[sSetter] instanceof Function) || vValue === undefined) {
				return;
			}

			if (typeof vValue === "object" && vValue !== null) {
				oWrapper.bindProperty(sProperty, vValue);
			} else {
				oWrapper[sSetter](vValue);
			}
		});

		this._getType().applyItemActions(oWrapper, oItemSettings, sModelName);
	};

	List.prototype._fireDefaultItemAction = function(oBindingContext, oItem) {
		if (oItem?.data("sap.ui.mdc.hasVisualItemActions")) {
			return;
		}

		const oItemSettings = this.getItemSettings();

		if (!oItemSettings) {
			return;
		}

		if (oItemSettings.isBound("itemActions")) {
			const oActionsConfig = oItemSettings.getAllActions();
			const oTemplateAction = oActionsConfig?.items?.template;

			if (!oTemplateAction || !oBindingContext) {
				return;
			}

			const oAction = oTemplateAction.clone();
			const sActionModel = oActionsConfig.items.model;
			oAction.setBindingContext(oBindingContext, sActionModel);
			oAction._onPress({ bindingContext: oBindingContext });
			oAction.destroy();
			return;
		}

		const oAction = oItemSettings.getItemActions().find((oActionItem) => oActionItem.getVisible());

		if (!oAction) {
			return;
		}

		oAction._onPress({ bindingContext: oBindingContext });
	};

	List.prototype._observeItemsBinding = function() {
		if (this._oItemsBinding) {
			this._detachItemsBindingListeners(this._oItemsBinding);
			this._oItemsBinding = null;
		}

		this._oItemsBinding = this._oList ? this._oList.getBinding("items") : null;

		if (!this._oItemsBinding) {
			return;
		}

		this._oItemsBinding.attachChange(this._onBindingChange, this);
		this._oItemsBinding.attachDataRequested(this._onBindingDataRequested, this);
		this._oItemsBinding.attachDataReceived(this._onBindingDataReceived, this);
	};

	List.prototype._detachItemsBindingListeners = function(oBinding) {
		oBinding.detachChange(this._onBindingChange, this);
		oBinding.detachDataRequested(this._onBindingDataRequested, this);
		oBinding.detachDataReceived(this._onBindingDataReceived, this);
	};

	List.prototype.getRowBinding = function() {
		return this._oList?.getBinding("items");
	};

	List.prototype._isRowCountShown = function() {
		return this.getShowItemCount();
	};

	List.prototype._getExportData = function() {
		const oItemsBinding = this._oList ? this._oList.getBinding("items") : null;

		if (!oItemsBinding) {
			return [];
		}

		const iLength = oItemsBinding.getLength instanceof Function ? oItemsBinding.getLength() : 0;
		if (!Number.isFinite(iLength) || iLength < 1) {
			return [];
		}

		const aContexts = oItemsBinding.getContexts instanceof Function ? oItemsBinding.getContexts(0, iLength) : [];

		return aContexts.filter(Boolean).map((oContext) => oContext.getObject());
	};

	List.prototype._createExportColumns = function() {
		const aPropertyInfo = this.getPropertyHelper()?.getProperties() || [];

		return aPropertyInfo.reduce((aColumns, oProperty) => {
			if (oProperty.exportSettings === null) {
				return aColumns;
			}

			const oExportSettings = oProperty.exportSettings || {};
			const oColumn = {
				...oExportSettings
			};

			oColumn.property = oColumn.property || oProperty.path || oProperty.name;
			oColumn.label = oColumn.label || oProperty.label || oProperty.name || oColumn.property;

			if (oColumn.property) {
				aColumns.push(oColumn);
			}

			return aColumns;
		}, []);
	};

	List.prototype._onExport = function(bExportAs) {
		if (!this.getEnableExport()) {
			return Promise.resolve();
		}

		const aColumns = this._createExportColumns();

		if (aColumns.length === 0) {
			return Promise.resolve();
		}

		const oItemsBinding = this._oList ? this._oList.getBinding("items") : null;
		const sExportFunctionName = bExportAs ? "exportAs" : "export";
		const oDefaultExportSettings = this.getDefaultExportSettings();
		const mExportSettings = {
			workbook: {
				columns: aColumns,
				context: {
					title: this.getHeader()
				}
			},
			dataSource: oItemsBinding || this._getExportData(),
			fileName: oDefaultExportSettings?.getFileName() || this.getHeader() || "List"
		};

		return this._getExportHandler().then((oHandler) => {
			oHandler[sExportFunctionName](mExportSettings);
		});
	};

	DeferredAggregationForwardMixin.call(List.prototype, [{
		aggregation: "contextMenu",
		applyToTarget: function(oContextMenu) {
			this._oList?.setContextMenu(oContextMenu);
		}
	}, {
		aggregation: "noData",
		applyToTarget: function(vNoData) {
			this._oList?.setNoData(vNoData);
		}
	}]);

	return List;
});
