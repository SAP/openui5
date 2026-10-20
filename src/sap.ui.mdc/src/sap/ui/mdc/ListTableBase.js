/*!
 * ${copyright}
 */

sap.ui.define([
	"./Control",
	"./mixin/FilterIntegrationMixin",
	"./util/P13nUtils",
	"./util/ExportUtils",
	"./util/Common",
	"./table/utils/Personalization",
	"./table/utils/FilterInfoBar",
	"sap/m/MessageBox",
	"sap/m/Title",
	"sap/m/table/Title",
	"sap/m/table/Util",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/BindingMode",
	"sap/ui/core/format/ListFormat",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/theming/Parameters"
], (
	Control,
	FilterIntegrationMixin,
	P13nUtils,
	ExportUtils,
	Common,
	PersonalizationUtils,
	FilterInfoBar,
	MessageBox,
	Title,
	TableTitle,
	MTableUtil,
	ManagedObjectModel,
	BindingMode,
	ListFormat,
	Library,
	coreLibrary,
	ThemeParameters
) => {
	"use strict";

	const {TitleLevel} = coreLibrary;

	/**
	 * Constructor for a new <code>ListTableBase</code>.
	 *
	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Abstract base for the metadata-driven collection controls <code>sap.ui.mdc.List</code> and
	 * <code>sap.ui.mdc.Table</code>, holding the metadata and behavior they share.
	 * It must not be used stand-alone.
	 * @extends sap.ui.mdc.Control
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.154
	 * @alias sap.ui.mdc.ListTableBase
	 * @public
	 */
	const ListTableBase = Control.extend("sap.ui.mdc.ListTableBase", {
		metadata: {
			"abstract": true,
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.IFilterSource", "sap.ui.mdc.IxState"
			],
			properties: {
				/**
				 * Width of the control.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null
				},
				/**
				 * Header text that is shown in the toolbar.
				 */
				header: {
					type: "string",
					group: "Appearance",
					defaultValue: null
				},
				/**
				 * Determines whether the header text is shown in the toolbar.
				 * Regardless of this property, the header text is used as a title for accessibility purposes.
				 */
				headerVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},
				/**
				 * Defines the semantic level of the header. For more information, see {@link sap.m.Title#setLevel}.
				 */
				headerLevel: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance",
					defaultValue: TitleLevel.Auto
				},
				/**
				 * Defines the style of the header. For more information, see {@link sap.m.Title#setTitleStyle}.
				 *
				 * @private
				 * @ui5-restricted sap.fe
				 */
				headerStyle: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance"
				},
				/**
				 * Determines whether the data can be exported to a spreadsheet.
				 */
				enableExport: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				},
				/**
				 * Determines whether the control is bound automatically after its initial creation or re-creation.
				 */
				autoBindOnInit: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * The delay in milliseconds after which the busy indicator is shown.
				 */
				busyIndicatorDelay: {
					type: "int",
					defaultValue: 100
				},
				/**
				 * Number of items that are requested from the model for each growing/scroll request.
				 *
				 * If the value is -1, a type-dependent default value is used.
				 */
				threshold: {
					type: "int",
					group: "Behavior",
					defaultValue: -1
				},
				/**
				 * Defines the XML baseline for filter conditions in SAPUI5 flexibility.
				 *
				 * <b>Note:</b> This property must not be bound.
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				filterConditions: {
					type: "object",
					defaultValue: {},
					bindable: false
				},
				/**
				 * Defines the XML baseline for sort conditions in SAPUI5 flexibility.
				 *
				 * <b>Note:</b> This property must not be bound.
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				sortConditions: {
					type: "object",
					bindable: false
				},
				/**
				 * Defines the XML baseline for group conditions in SAPUI5 flexibility.
				 *
				 * <b>Note:</b> This property must not be bound.
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @private
				 * @ui5-restricted sap.ui.mdc
				 */
				groupConditions: {
					type: "object",
					bindable: false
				}
			},
			aggregations: {
				/**
				 * Additional actions that will be available in the toolbar.
				 *
				 * <b>Note:</b> This aggregation is managed by the control, can only be populated during the definition in the XML view, and is not
				 * bindable. Any changes of the initial aggregation content might result in undesired effects.
				 */
				actions: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						getter: "_createToolbar",
						aggregation: "actions"
					}
				},
				/**
				 * Defines the control to be displayed when there is no data.
				 * Pass a string as an <code>altTypes</code> shorthand or a full control instance.
				 */
				noData: {
					type: "sap.ui.core.Control",
					multiple: false,
					altTypes: ["string"]
				},
				/**
				 * Defines the context menu for the items.
				 */
				contextMenu: {
					type: "sap.ui.core.IContextMenu",
					multiple: false
				},
				/**
				 * Default values shown in the export dialog.
				 *
				 * <b>Note:</b> These values are defaults shown to the user in the export dialog. The user can still modify them before export.
				 * If the user modifies a value in the dialog, the user choice takes precedence and is not overridden by event handlers.
				 *
				 * The expected type is <code>sap.ui.export.TableExportSettings</code>. The <code>sap.ui.export</code> library must be loaded
				 * before setting this aggregation.
				 */
				defaultExportSettings: {
					type: "sap.ui.core.Element",
					multiple: false
				},
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				/**
				 * Control or object that enables filtering, such as {@link sap.ui.mdc.FilterBar}.
				 * See also {@link sap.ui.mdc.IFilter}.
				 *
				 * When this association is set, the control listens to the <code>search</code> event of the filter
				 * and triggers a rebind. This enables the <code>Filter</code> p13n mode to work in combination
				 * with an external filter bar.
				 */
				filter: {
					type: "sap.ui.mdc.IFilter",
					multiple: false
				}
			},
			events: {
				/**
				 * This event is fired when the selection changes.
				 */
				selectionChange: {},
				/**
				 * This event is fired before a context menu is opened.
				 */
				beforeOpenContextMenu: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * The binding context the context menu was opened for.
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						}
					}
				},
				/**
				 * This event is fired right before the export is triggered.
				 *
				 * For more information about the export settings, see {@link sap.ui.export.Spreadsheet} or
				 * {@link topic:7e12e6b9154a4607be9d6072c72d609c Spreadsheet Export Configuration}.
				 *
				 * The export can be prevented by calling <code>preventDefault</code> on the event.
				 */
				beforeExport: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * Contains <code>workbook.columns, dataSource</code>, and other export-related information.
						 *
						 * <b>Note:</b> The <code>exportSettings</code> parameter can be modified by the listener. Thus the parameter can be
						 * different if multiple listeners are registered which manipulate the parameter.
						 */
						exportSettings: {
							type: "object"
						},
						/**
						 * Contains the export settings defined by the user.
						 */
						userExportSettings: {
							type: "object"
						},
						/**
						 * Contains an array of {@link sap.ui.export.util.Filter} objects.
						 */
						filterSettings: {
							type: "object[]"
						}
					}
				}
			}
		},
		renderer: null
	});

	FilterIntegrationMixin.call(ListTableBase.prototype);

	ListTableBase.prototype.init = function() {
		Control.prototype.init.apply(this, arguments);
		this._createManagedObjectModel();
	};

	ListTableBase.prototype.exit = function() {
		Common.cleanup(this, [
			"_oManagedObjectModel",
			"_oFilterInfoBar",
			"_oDefaultType",
			"_oTitle",
			"_oTableTitle",
			"_oP13nButton",
			"_oExportButton",
			"_oExportHandler"
		]);

		Control.prototype.exit.apply(this, arguments);
	};

	/**
	 * Returns the mapping from a <code>type</code> enum value (and the <code>null</code> default) to the
	 * type-strategy class that creates and manages the matching inner control.
	 *
	 * @returns {object} Map of type key to type-strategy class
	 * @private
	 * @abstract
	 */
	ListTableBase.prototype._getTypeStrategyMap = function() {
		throw new Error(this + " does not implement #_getTypeStrategyMap");
	};

	ListTableBase.prototype.setThreshold = function(iThreshold) {
		return this.setProperty("threshold", iThreshold, true);
	};

	ListTableBase.prototype.setEnableExport = function(bEnableExport) {
		this.setProperty("enableExport", bEnableExport, true);
		this._updateExportButton();
		return this;
	};

	ListTableBase.prototype.setDefaultExportSettings = function(oExportSettings) {
		if (oExportSettings && !oExportSettings.isA("sap.ui.export.TableExportSettings")) {
			throw new Error("The 'defaultExportSettings' aggregation must be of type 'sap.ui.export.TableExportSettings'.");
		}

		return this.setAggregation("defaultExportSettings", oExportSettings);
	};

	ListTableBase.prototype.getConditions = function() {
		return this.getInbuiltFilter() ? this.getInbuiltFilter().getConditions() : [];
	};

	ListTableBase.prototype.getActiveP13nModes = function() {
		return P13nUtils.getIntersection(this.getP13nMode(), this.getSupportedP13nModes());
	};

	ListTableBase.prototype.isFilteringEnabled = function() {
		return this.getActiveP13nModes().includes("Filter");
	};

	ListTableBase.prototype._isOfType = function(sType, bIncludeSubTypes) {
		const oType = this._getType();
		const mTypeMap = this._getTypeStrategyMap();

		if (bIncludeSubTypes) {
			return oType.isA(mTypeMap[sType].getMetadata().getName());
		} else {
			return oType.constructor === mTypeMap[sType];
		}
	};

	ListTableBase.prototype._getType = function() {
		const vType = this.getType();

		if (!this._oDefaultType && (typeof vType === "string" || vType === null)) {
			const mTypeMap = this._getTypeStrategyMap();
			const TypeClass = mTypeMap[vType] || mTypeMap.null;
			this._oDefaultType = new TypeClass();
			this.addDependent(this._oDefaultType);
		}

		return this._oDefaultType || vType;
	};

	ListTableBase.prototype._destroyDefaultType = function() {
		if (this._oDefaultType) {
			this.removeDependent(this._oDefaultType);
			this._oDefaultType.destroy();
			delete this._oDefaultType;
		}
	};

	/**
	 * Returns the name of the managed object model of this control.
	 *
	 * @returns {string} The model name
	 * @private
	 * @abstract
	 */
	ListTableBase.prototype._getManagedObjectModelName = function() {
		throw new Error(this + " does not implement #_getManagedObjectModelName");
	};

	ListTableBase.prototype._getP13nButton = function() {
		if (!this._oP13nButton) {
			this._oP13nButton = this._getToolbarFactory().createSettingsButton(this.getId(), [function() {
				PersonalizationUtils.openSettingsDialog(this);
			}, this]);
		}

		this._updateP13nButton();
		return this._oP13nButton;
	};

	/**
	 * Returns the toolbar button factory for this control. Subclasses return their control-specific
	 * factory (<code>TableToolbarFactory</code> / <code>ListToolbarFactory</code>) so that shared
	 * buttons receive the correct action layout data.
	 *
	 * @returns {object} The toolbar button factory
	 * @private
	 * @abstract
	 */
	ListTableBase.prototype._getToolbarFactory = function() {
		throw new Error(this + " does not implement #_getToolbarFactory");
	};

	ListTableBase.prototype._updateP13nButton = function() {
		this._oP13nButton?.setVisible(this._isP13nSettingVisible());
	};

	/**
	 * Returns whether the settings (personalization) button is visible.
	 *
	 * @returns {boolean} Whether the button is visible
	 * @private
	 */
	ListTableBase.prototype._isP13nSettingVisible = function() {
		return P13nUtils.isSettingsButtonVisible(this.getActiveP13nModes(), false, false);
	};

	/**
	 * Returns whether the export is enabled.
	 *
	 * @returns {boolean} Whether the export is enabled
	 * @private
	 */
	ListTableBase.prototype._isExportEnabled = function() {
		return this.getEnableExport();
	};

	/**
	 * Creates, inserts, and refreshes the export button in the toolbar, reflecting the current
	 * <code>enableExport</code> state and whether the current binding can be exported.
	 *
	 * @private
	 */
	ListTableBase.prototype._updateExportButton = function() {
		const bNeedExportButton = this._oToolbar != null && this._isExportEnabled();

		if (bNeedExportButton && !this._oExportButton) {
			this._oExportButton = this._createExportButton();
		}

		if (!this._oExportButton) {
			return;
		}

		if (this._oToolbar && !this._oToolbar.getEnd().includes(this._oExportButton)) {
			this._oToolbar.addEnd(this._oExportButton);
		}

		this._oExportButton.setVisible(this._isExportEnabled());
		this._oExportButton.setEnabled(MTableUtil.isExportable(this.getRowBinding()));
	};

	/**
	 * Creates the export menu button, wiring its quick-export and export-with-settings actions.
	 *
	 * @returns {sap.m.OverflowToolbarMenuButton} The export button
	 * @private
	 */
	ListTableBase.prototype._createExportButton = function() {
		return this._getToolbarFactory().createExportButton(this.getId(), {
			"default": [function() {
				this._onExport(false);
			}, this],
			"exportAs": [function() {
				this._onExport(true);
			}, this]
		});
	};

	ListTableBase.prototype._getExportHandler = function() {
		if (this._oExportHandler) {
			return Promise.resolve(this._oExportHandler);
		}

		return new Promise((fnResolve, fnReject) => {
			Promise.all([
				this.getControlDelegate().fetchExportCapabilities(this), Library.load({name: "sap.ui.export"})
			]).then((aResult) => {
				const [oExportCapabilities] = aResult;

				sap.ui.require(["sap/ui/export/ExportHandler"], (ExportHandler) => {
					if (this.isDestroyed()) {
						fnReject(new Error(this + ": control was destroyed before export handler could be initialized"));
						return;
					}
					this._oExportHandler = new ExportHandler(oExportCapabilities);
					this._oExportHandler.attachBeforeExport(this._onBeforeExport, this);
					fnResolve(this._oExportHandler);
				});
			}).catch((vError) => {
				if (!Library.all().hasOwnProperty("sap.ui.export")) {
					MessageBox.error(Library.getResourceBundleFor("sap.ui.mdc").getText("ERROR_MISSING_EXPORT_LIBRARY"));
				}

				fnReject(vError);
			});
		});
	};

	ListTableBase.prototype._onBeforeExport = function(oEvent) {
		const aFilters = oEvent.getParameter("filterSettings");
		const oHelper = this.getPropertyHelper();

		aFilters.forEach((oFilter) => {
			const oProperty = oHelper?.getProperties().find((oPropertyInfo) => {
				return oPropertyInfo.path === oFilter.getProperty();
			});

			if (oProperty) {
				oFilter.setLabel(oProperty.label);
				oFilter.setType(oProperty.typeConfig?.typeInstance);
			}
		});

		ExportUtils.fireBeforeExport(this, {filterSettings: aFilters}, oEvent);
	};

	ListTableBase.prototype.onkeydown = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		if (Common.isExportShortcut(oEvent)) {
			if (this._oExportButton && this._oExportButton.getEnabled() && this._isExportEnabled()) {
				this._onExport(true);
				oEvent.setMarked();
				oEvent.preventDefault();
			}
		}

		if (Common.isOpenPersonalizationShortcut(oEvent)) {
			if (this._oP13nButton && this._oP13nButton.getVisible()) {
				this._oP13nButton.firePress();
				oEvent.setMarked();
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * Creates the toolbar title (<code>_oTitle</code>) wrapped in the count-aware title plugin
	 * (<code>_oTableTitle</code>). The item/selected count is managed by a <code>sap.m.plugins.TitleProvider</code>
	 * that the delegate adds to the inner control.
	 *
	 * @returns {sap.m.table.Title} The title control to place in the toolbar
	 * @private
	 */
	ListTableBase.prototype._createTitle = function() {
		const sModelName = this._getManagedObjectModelName();

		this._oTitle = new Title(this.getId() + "-title", {
			text: `{${sModelName}>/header}`,
			level: `{${sModelName}>/headerLevel}`,
			titleStyle: this._getEffectiveHeaderStyle()
		});

		this._oTableTitle = new TableTitle(this.getId() + "-tableTitle", {
			title: this._oTitle,
			visible: `{${sModelName}>/headerVisible}`
		});

		return this._oTableTitle;
	};

	/**
	 * Returns the header style to apply, falling back to the theme default.
	 *
	 * @returns {sap.ui.core.TitleLevel} The effective header style
	 * @private
	 */
	ListTableBase.prototype._getEffectiveHeaderStyle = function() {
		return this.getHeaderStyle() || TitleLevel[ThemeParameters.get({name: "_sap_ui_mdc_Table_HeaderStyle"})];
	};

	ListTableBase.prototype.setHeaderStyle = function(sStyle) {
		this.setProperty("headerStyle", sStyle, true);
		this._oTitle?.setTitleStyle(this._getEffectiveHeaderStyle());
		return this;
	};

	ListTableBase.prototype.setHeaderLevel = function(sLevel) {
		this.setProperty("headerLevel", sLevel, true);
		return this;
	};

	ListTableBase.prototype.setHeaderVisible = function(bHeaderVisible) {
		this.setProperty("headerVisible", bHeaderVisible, true);
		return this;
	};

	ListTableBase.prototype._onFilterSearch = function(oEvent) {
		this._bAnnounceContentUpdate = true;
	};

	/**
	 * Event handler for the inner binding's <code>dataRequested</code> event.
	 *
	 * @private
	 */
	ListTableBase.prototype._onBindingDataRequested = function() {
		this._bSkipAnnounceContentUpdate = true;
	};

	/**
	 * Event handler for the inner binding's <code>dataReceived</code> event.
	 *
	 * @private
	 */
	ListTableBase.prototype._onBindingDataReceived = function() {
		this._bSkipAnnounceContentUpdate = false;
		this._updateRowCountForHeader();
	};

	/**
	 * Event handler for the inner binding's <code>change</code> event.
	 *
	 * @private
	 */
	ListTableBase.prototype._onBindingChange = function() {
		this._updateExportButton();
		this._updateRowCountForHeader();
	};

	/**
	 * Announces the current item/row count via the invisible message area, once per search.
	 *
	 * @private
	 */
	ListTableBase.prototype._updateRowCountForHeader = function() {
		if (this._bAnnounceContentUpdate && !this._bSkipAnnounceContentUpdate) {
			this._bAnnounceContentUpdate = false;
			const iCount = this.getRowBinding().getCount();
			MTableUtil.announceTableUpdate(this.getHeader(), (this._isRowCountShown() || iCount === 0) ? iCount : undefined);
		}
	};

	/**
	 * Returns whether the control shows the item/row count.
	 *
	 * @returns {boolean} Whether the count is shown
	 * @private
	 * @abstract
	 */
	ListTableBase.prototype._isRowCountShown = function() {
		throw new Error(this + " does not implement #_isRowCountShown");
	};

	/**
	 * Returns the binding of the inner control's items/rows.
	 *
	 * @returns {sap.ui.model.Binding} The row binding
	 * @private
	 * @abstract
	 */
	ListTableBase.prototype.getRowBinding = function() {
		throw new Error(this + " does not implement #getRowBinding");
	};

	ListTableBase.prototype.setFilterConditions = function(mConditions) {
		this.setProperty("filterConditions", mConditions, true);
		this.getInbuiltFilter()?.setFilterConditions(mConditions);
		this._updateFilterInfoBar();
		return this;
	};

	ListTableBase.prototype.setSortConditions = function(mConditions) {
		return this.setProperty("sortConditions", mConditions, true);
	};

	ListTableBase.prototype.setGroupConditions = function(mConditions) {
		return this.setProperty("groupConditions", mConditions, true);
	};

	/**
	 * Shows, updates, or hides the filter info bar based on the active filter conditions.
	 *
	 * @private
	 */
	ListTableBase.prototype._updateFilterInfoBar = function() {
		const sFilterInfoText = this._getFilterInfoText();

		if (this._oFilterInfoBar?.isDestroyed()) {
			this._oFilterInfoBar = null;
		}

		if (this._oFilterInfoBar) {
			this._oFilterInfoBar.setInfoText(sFilterInfoText);
		} else if (sFilterInfoText && this._getType().getInnerControl()) {
			this._oFilterInfoBar = new FilterInfoBar({
				id: this.getId() + "-filterInfoBar",
				infoText: sFilterInfoText,
				table: this
			});
			this._getType().insertFilterInfoBar(this._oFilterInfoBar);
		}
	};

	/**
	 * Returns the text describing the active filters, or an empty string when none apply.
	 *
	 * @returns {string} The filter info text
	 * @private
	 */
	ListTableBase.prototype._getFilterInfoText = function() {
		if (!this.isFilteringEnabled() || !this.getPropertyHelper()) {
			return "";
		}

		const aFilterLabels = this._getLabelsFromFilterConditions();
		const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

		if (aFilterLabels.length === 0) {
			return "";
		} else if (aFilterLabels.length === 1) {
			return oResourceBundle.getText("table.ONE_FILTER_ACTIVE", aFilterLabels);
		} else {
			return oResourceBundle.getText("table.MULTIPLE_FILTERS_ACTIVE", [
				aFilterLabels.length,
				ListFormat.getInstance().format(aFilterLabels)
			]);
		}
	};

	/**
	 * Creates the managed object model and sets it as the control's internal model.
	 *
	 * @param {object} [mData] Initial data for the model
	 * @private
	 */
	ListTableBase.prototype._createManagedObjectModel = function(mData) {
		this._oManagedObjectModel = new ManagedObjectModel(this, mData);
		this._oManagedObjectModel.setDefaultBindingMode(BindingMode.OneWay);
		this.setModel(this._oManagedObjectModel, this._getManagedObjectModelName());
	};

	ListTableBase.prototype.applySettings = function(mSettings, oScope) {
		Common.applySettingsWithEarlyTypeAndDelegate(this, mSettings, oScope, Control.prototype.applySettings);
		this.initControlDelegate();
	};

	ListTableBase.prototype._updateToolbarStyle = function() {
		this._oToolbar?.setStyle(this._getToolbarStyle());
	};

	/**
	 * Returns the toolbar style (<code>Standard</code> or <code>Clear</code>) for the current inner control type.
	 *
	 * @returns {sap.m.ToolbarStyle} The toolbar style
	 * @private
	 * @abstract
	 */
	ListTableBase.prototype._getToolbarStyle = function() {
		throw new Error(this + " does not implement #_getToolbarStyle");
	};

	ListTableBase.prototype._updateAdaptation = function() {
		this.getEngine().register(this, {
			controller: this.getEngineControllers()
		});
	};

	/**
	 * Returns the map of controller key to subcontroller instance to register with the engine.
	 *
	 * @returns {Object<string, sap.ui.mdc.p13n.subcontroller.Controller>} Map of controller key to controller instance
	 * @private
	 * @abstract
	 */
	ListTableBase.prototype.getEngineControllers = function() {
		throw new Error(this + " does not implement #getEngineControllers");
	};

	return ListTableBase;
});
