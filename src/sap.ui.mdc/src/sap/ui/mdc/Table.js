/*!
 * ${copyright}
 */

sap.ui.define([
	"./Control",
	"./ActionToolbar",
	"./table/TableSettings",
	"./table/GridTableType",
	"./table/TreeTableType",
	"./table/ResponsiveTableType",
	"./table/PropertyHelper",
	"./table/utils/Personalization",
	"./table/utils/FilterInfoBar",
	"./mixin/FilterIntegrationMixin",
	"sap/m/Title",
	"sap/m/table/Title",
	"sap/m/library",
	"sap/m/table/Util",
	"sap/m/table/columnmenu/Menu",
	"sap/m/MessageBox",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/format/ListFormat",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/BindingMode",
	"sap/base/strings/capitalize",
	"sap/base/util/deepEqual",
	"sap/ui/core/InvisibleText",
	"sap/ui/mdc/p13n/subcontroller/ColumnController",
	"sap/ui/mdc/p13n/subcontroller/SortController",
	"sap/ui/mdc/p13n/subcontroller/FilterController",
	"sap/ui/mdc/p13n/subcontroller/GroupController",
	"sap/ui/mdc/p13n/subcontroller/AggregateController",
	"sap/m/table/ColumnWidthController",
	"sap/ui/mdc/p13n/subcontroller/ShowDetailsController",
	"sap/ui/mdc/p13n/subcontroller/ColumnFreezeController",
	"sap/ui/mdc/p13n/subcontroller/DynamicPropertiesController",
	"sap/ui/mdc/mixin/DynamicPropertiesMixin",
	"sap/ui/mdc/mixin/ActionToolbarMixin",
	"sap/ui/mdc/table/menus/QuickActionContainer",
	"sap/ui/core/theming/Parameters",
	"sap/base/Log",
	"sap/ui/performance/trace/FESRHelper",
	"sap/ui/mdc/enums/TableMultiSelectMode",
	"sap/ui/mdc/enums/TableSelectionMode",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/ui/mdc/enums/TableType",
	// load for availability
	"sap/ui/mdc/enums/TableGrowingMode",
	// load for availability
	"sap/ui/mdc/enums/TableRowCountMode",
	"sap/ui/mdc/flexibility/helpers/addKeyOrName"
], (
	Control,
	ActionToolbar,
	TableSettings,
	GridTableType,
	TreeTableType,
	ResponsiveTableType,
	PropertyHelper,
	PersonalizationUtils,
	FilterInfoBar,
	FilterIntegrationMixin,
	Title,
	TableTitle,
	MLibrary,
	MTableUtil,
	ColumnMenu,
	MessageBox,
	Element,
	Library,
	ListFormat,
	coreLibrary,
	KeyCodes,
	ManagedObjectModel,
	BindingMode,
	capitalize,
	deepEqual,
	InvisibleText,
	ColumnController,
	SortController,
	FilterController,
	GroupController,
	AggregateController,
	ColumnWidthController,
	ShowDetailsController,
	ColumnFreezeController,
	DynamicPropertiesController,
	DynamicPropertiesMixin,
	ActionToolbarMixin,
	QuickActionContainer,
	ThemeParameters,
	Log,
	FESRHelper,
	TableMultiSelectMode,
	TableSelectionMode,
	TableP13nMode,
	TableType,
	TableGrowingMode,
	TableRowCountMode,
	addKeyOrName
) => {
	"use strict";

	const {ToolbarDesign} = MLibrary;
	const {ToolbarStyle} = MLibrary;
	const {IllustratedMessageType} = MLibrary;
	const {TitleLevel} = coreLibrary;
	const {SortOrder} = coreLibrary;
	const internalMap = new window.WeakMap();
	const internal = function(oTable) {
		if (!internalMap.has(oTable)) {
			internalMap.set(oTable, {
				oFilterInfoBar: null
			});
		}
		return internalMap.get(oTable);
	};
	const mTypeMap = {
		"Table": GridTableType,
		"TreeTable": TreeTableType,
		"ResponsiveTable": ResponsiveTableType,
		"null": GridTableType // default
	};

	/**
	 * @typedef {sap.ui.mdc.util.PropertyInfo} sap.ui.mdc.table.PropertyInfo
	 *
	 * An object literal that describes attributes of a data property in the context of an {@link sap.ui.mdc.Table}.
	 *
	 * @property {boolean} [filterable=true]
	 *   Defines whether a property is filterable.
	 * @property {boolean} [sortable=true]
	 *   Defines whether a property is sortable.
	 * @property {boolean} [groupable=false]
	 *   Defines whether a property is groupable.
	 * @property {boolean} [isKey=false]
	 *   Defines whether a property is a key or part of a key in the data.
	 * @property {string} [unit]
	 *   Key of the unit property that is related to this property. A property must not have both a unit and a text.
	 * @property {string} [text]
	 *   Key of the text property that is related to this property in a 1:1 relation. A property must not have both a unit and a text.
	 * @property {sap.ui.export.Column|null} [exportSettings]
	 *   The export settings. Set to <code>null</code> to prevent this property from being exported.
	 * @property {object|null} [clipboardSettings]
	 *   The clipboard settings. Set to <code>null</code> prevent this property from being copied to clipboard.
	 * @property {string} [clipboardSettings.template]
	 *   Defines the formatting template that supports indexed placeholders, for example, "{0}".
	 * @property {object} [visualSettings]
	 *   This object contains all relevant properties for visual adjustments.
	 * @property {object|null} [visualSettings.widthCalculation]
	 *   Settings for column width calculation. Set to <code>null</code> to disable the automatic column width calculation for this property.
	 * @property {int} [visualSettings.widthCalculation.minWidth=2]
	 *   The minimum content width in rem
	 * @property {int} [visualSettings.widthCalculation.maxWidth=19]
	 *   The maximum content width in rem
	 * @property {int} [visualSettings.widthCalculation.defaultWidth=8]
	 *   The default column content width when type check fails
	 * @property {float} [visualSettings.widthCalculation.gap=0]
	 *   The additional content width in rem
	 * @property {boolean} [visualSettings.widthCalculation.includeLabel=true]
	 *   Whether the label is taken into account
	 * @property {boolean} [visualSettings.widthCalculation.truncateLabel=true]
	 *   Whether the label is truncated
	 * @property {boolean} [visualSettings.widthCalculation.verticalArrangement=false]
	 *   Whether the referenced properties are arranged vertically
	 * @property {string[]} [visualSettings.widthCalculation.excludeProperties]
	 *   A list of invisible referenced property keys
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.mdc.util.ComplexPropertyInfo} sap.ui.mdc.table.ComplexPropertyInfo
	 *
	 * An object literal that describes attributes of a complex data property in the context of an {@link sap.ui.mdc.Table}. A complex property
	 * references other properties in the <code>propertyInfos</code> attribute.
	 *
	 * If a <code>sap.ui.mdc.table.Column</code> points to a complex property via its <code>propertyKey</code> property, the table considers all the
	 * referenced properties as visible in the column. All referenced properties are taken into account for certain features, for example, for the
	 * column width calculation.
	 *
	 * Some attributes of the referenced properties can be overridden. If, for example, <code>exportSettings</code> are specified for the complex
	 * property, the export settings of the referenced properties are ignored. This can be used to provide a different formatting template, for
	 * example.
	 *
	 * @property {sap.ui.export.Column|null} [exportSettings]
	 *   The export settings. Set to <code>null</code> to prevent this property from being exported.
	 * @property {object|null} [clipboardSettings]
	 *   The clipboard settings. Set to <code>null</code> to prevent this property from being copied to clipboard.
	 * @property {string} [clipboardSettings.template]
	 *   Defines the formatting template that supports indexed placeholders for referenced properties within curly brackets, for example, "{0} ({1})".
	 * @property {object} [visualSettings]
	 *   This object contains all relevant attributes for visual adjustments.
	 * @property {object|null} [visualSettings.widthCalculation]
	 *   Settings for column width calculation. Set to <code>null</code> to disable the automatic column width calculation for this property.
	 * @property {int} [visualSettings.widthCalculation.minWidth=2]
	 *   The minimum content width in rem
	 * @property {int} [visualSettings.widthCalculation.maxWidth=19]
	 *   The maximum content width in rem
	 * @property {int} [visualSettings.widthCalculation.defaultWidth=8]
	 *   The default column content width when type check fails
	 * @property {float} [visualSettings.widthCalculation.gap=0]
	 *   The additional content width in rem
	 * @property {boolean} [visualSettings.widthCalculation.includeLabel=true]
	 *   Whether the label is taken into account
	 * @property {boolean} [visualSettings.widthCalculation.truncateLabel=true]
	 *   Whether the label is truncated
	 * @property {boolean} [visualSettings.widthCalculation.verticalArrangement=false]
	 *   Whether the referenced properties are arranged vertically
	 * @property {string[]} [visualSettings.widthCalculation.excludeProperties]
	 *   A list of invisible referenced property keys
	 *
	 * @public
	 */

	/**
	 * Constructor for a new <code>Table</code>.
	 *
	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 * <b>Note:</b> The optional ID can be omitted, no matter whether <code>mSettings</code> is given or not.
	 * @param {object} [mSettings] Object with initial settings for the new control
	 * @class
	 * A metadata-driven table to simplify the usage of existing tables, such as the <code>ResponsiveTable</code> and <code>GridTable</code>
	 * controls. The metadata needs to be provided via the {@link module:sap/ui/mdc/TableDelegate TableDelegate} implementation as
	 * {@link sap.ui.mdc.table.PropertyInfo} and {@link sap.ui.mdc.table.ComplexPropertyInfo}.
	 *
	 * <b>Note:</b> Read and write access to internal elements is not permitted. Such elements are, for example, the inner table including its
	 * children. This is independent of how access was gained. Internal elements and their types are subject to change without notice.
	 *
	 * @extends sap.ui.mdc.Control
	 * @borrows sap.ui.mdc.mixin.FilterIntegrationMixin.rebind as #rebind
	 * @author SAP SE
	 * @since 1.58
	 * @alias sap.ui.mdc.Table
	 * @see {@link topic:1dd2aa91115d43409452a271d11be95b sap.ui.mdc}
	 * @see {@link topic:3801656db27b4b7a9099b6ed5fa1d769 Table Building Block (OData V4)}
	 * @public
	 */
	const Table = Control.extend("sap.ui.mdc.Table", {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/table/Table.designtime",
			interfaces: [
				"sap.ui.mdc.IFilterSource", "sap.ui.mdc.IxState"
			],
			defaultAggregation: "columns",
			properties: {
				/**
				 * Width of the table.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null
				},
				/**
				 * This property has no effect and will be removed soon.
				 * @deprecated As of version 1.115, the concept has been discarded.
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null,
					deprecated: true
				},
				/**
				 * Personalization options for the table.
				 * The order of the provided options does not influence their order on the UI.
				 *
				 * <b>Note:</b> Whether a personalization option is supported depends on the used delegate. Please refer to the documentation of the
				 * individual delegates.
				 *
				 * @since 1.62
				 */
				p13nMode: {
					type: "sap.ui.mdc.enums.TableP13nMode[]",
					group: "Behavior",
					defaultValue: []
				},
				/**
				 * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.
				 *
				 * The object has the following properties (see {@link sap.ui.mdc.DelegateConfig DelegateConfig}):
				 * <ul>
				 *   <li><code>name</code> defines the path to the <code>Delegate</code> module. The used delegate module must inherit from
				 *       {@link module:sap/ui/mdc/TableDelegate TableDelegate}.</li>
				 *   <li><code>payload</code> (optional) defines application-specific information that can be used in the given delegate</li>
				 * </ul>
				 *
				 * <i>Sample delegate object:</i>
				 * <pre>{
				 * 	name: "sap/ui/mdc/TableDelegate",
				 * 	payload: {}
				 * }</pre>
				 *
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that). Do not bind or
				 * modify the module. This property can only be configured during control initialization.
				 *
				 */
				delegate: {
					type: "object",
					defaultValue: {
						name: "sap/ui/mdc/TableDelegate",
						payload: {}
					},
					bindable: false
				},
				/**
				 * Semantic level of the header. For more information, see {@link sap.m.Title#setLevel}.
				 *
				 * @since 1.84
				 */
				headerLevel: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance",
					defaultValue: TitleLevel.Auto
				},
				/**
				 * Defines style of the header. For more information, see {@link sap.m.Title#setTitleStyle}.
				 *
				 * @ui5-restricted sap.fe
				 * @since 1.116
				 */
				headerStyle: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance"
				},
				/**
				 * Determines whether to bind the table automatically after the initial creation or re-creation of the table.
				 */
				autoBindOnInit: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * Header text that is shown in the table. The header must always be set to comply with accessibility standards, even if other
				 * settings make the header invisible.
				 */
				header: {
					type: "string",
					group: "Appearance",
					defaultValue: null
				},
				/**
				 * Determines whether the header text is shown in the table. Regardless of its value, the given header text is used to label the table
				 * correctly for accessibility purposes.
				 *
				 * @since 1.63
				 */
				headerVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},
				/**
				 * If no tooltip has been provided for a column, the column header text will automatically be applied as a tooltip for the column.
				 *
				 * @since 1.115
				 */
				useColumnLabelsAsTooltips: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * Selection mode of the table. Specifies whether single or multiple rows can be selected and how the selection can be extended. It
				 * may also influence the visual appearance.
				 *
				 * <b>Note:</b> With the {@link sap.ui.mdc.table.GridTableType GridTable} and server-side models, range selections, including
				 * Select All, only work properly if the count is known. Please refer to the documentation of the used model for information on
				 * requesting the count, for example, {@link sap.ui.model.odata.v4.ODataModel}.
				 */
				selectionMode: {
					type: "sap.ui.mdc.enums.TableSelectionMode",
					group: "Behavior",
					defaultValue: TableSelectionMode.None
				},
				/**
				 * Determines whether the number of rows is shown along with the header text.
				 *
				 * <b>Note:</b> Whether this feature can be used depends on whether the model used and the data service can provide a count. Please
				 * refer to the documentation of the used model for information on requesting the count, for example,
				 * {@link sap.ui.model.odata.v4.ODataModel}.
				 */
				showRowCount: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Number of records to be requested from the model.
				 *
				 * If the table type is {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}, the threshold defines the number of rows that
				 * are displayed initially, and the number of rows that are added when the table grows
				 * ({@link sap.ui.mdc.table.ResponsiveTableType#getGrowingMode growingMode}).
				 *
				 * If the table type is {@link sap.ui.mdc.table.GridTableType GridTable}, the threshold defines how many additional (not yet visible)
				 * data records from the back-end system are pre-fetched. If the <code>threshold</code> is lower than the number of visible rows, the
				 * number of visible rows is used as the <code>threshold</code>. If the value is 0, thresholding is disabled.
				 *
				 * If the value is -1, a type-dependent default value is used.
				 *
				 * @since 1.63
				 */
				threshold: {
					type: "int",
					group: "Behavior",
					defaultValue: -1
				},

				/**
				 * Defines the XML baseline for sort conditions in SAPUI5 flexibility.
				 *
				 * <b>Note:</b> This property must not be bound.
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @since 1.73
				 */
				sortConditions: {
					type: "object",
					bindable: false
				},

				/**
				 * Defines the XML baseline for filter conditions in SAPUI5 flexibility.
				 *
				 * <b>Note:</b> This property must not be bound.
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @since 1.80.0
				 */
				filterConditions: {
					type: "object",
					defaultValue: {},
					bindable: false
				},

				/**
				 * Defines the XML baseline for group conditions in SAPUI5 flexibility.
				 *
				 * <b>Note:</b> This property must not be bound.
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @since 1.87
				 */
				groupConditions: {
					type: "object",
					bindable: false
				},

				/**
				 * Defines the XML baseline for aggregate conditions in SAPUI5 flexibility.
				 *
				 * <b>Note:</b> This property must not be bound.
				 * <b>Note:</b> This property must not be changed during runtime.
				 *
				 * @since 1.87
				 */
				aggregateConditions: {
					type: "object",
					bindable: false
				},

				/**
				 * Determines whether the data export is enabled.
				 *
				 * The delegate can customize the export result with the <code>exportSettings</code> field in the
				 * {@link sap.ui.mdc.table.PropertyInfo PropertyInfo}.
				 *
				 * <b>Note:</b> To use the export functionality, the {@link sap.ui.export} library is required, otherwise an error message is
				 * displayed when the user presses the Export button.
				 *
				 * @since 1.75
				 */
				enableExport: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				},

				/**
				 * The delay in milliseconds after which the busy indicator is shown.
				 */
				busyIndicatorDelay: {
					type: "int",
					defaultValue: 100
				},
				/**
				 * Determines whether column resizing is enabled.
				 *
				 * @since 1.90
				 */
				enableColumnResize: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * Determines whether the Paste button is visible.
				 *
				 * @since 1.91
				 */
				showPasteButton: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				},
				/**
				 * Determines whether the Paste button is enabled.
				 *
				 * @since 1.96
				 */
				enablePaste: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * Defines the multi-selection mode.
				 *
				 * <b>Note:</b> This property has no effect in the following cases:
				 * <ul>
				 *   <li>Table type is not {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}. This is subject to change in the future.</li>
				 *   <li>Selection mode is not <code>Multi</code>.</li>
				 * </ul>
				 *
				 * @since 1.93
				 */
				multiSelectMode: {
					type: "sap.ui.mdc.enums.TableMultiSelectMode",
					group: "Behavior",
					defaultValue: TableMultiSelectMode.Default
				},

				/**
				 * Enables automatic column width calculation. The column width calculation takes the type, column label, referenced properties, and
				 * other information into account. The calculated column widths can have a minimum of 3rem and a maximum of 20rem.
				 *
				 * The delegate can customize the automatic column width calculation with the <code>visualSettings.widthSettings</code> field in the
				 * {@link sap.ui.mdc.table.PropertyInfo PropertyInfo}. To disable the heuristic column width calculation for a particular column, the
				 * <code>visualSettings.widthSettings</code> field can be set to <code>null</code>.
				 * Providing a more precise <code>maxLength</code> value for the <code>String</code> type or <code>precision</code> value for numeric
				 * types can help the algorithm to produce better results.
				 *
				 * <b>Note:</b> The column width is not calculated if the <code>width</code> property of the column is bound or its value is set.
				 *
				 * @since 1.95
				 */
				enableAutoColumnWidth: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				},

				/**
				 * Specifies the table metadata.
				 *
				 * Whenever the <code>TableDelegate</code> needs to wait for, for example, server-side information to provide the
				 * <code>PropertyInfo</code> objects, specifying an array of {@link sap.ui.mdc.table.PropertyInfo PropertyInfo} and
				 * {@link sap.ui.mdc.table.ComplexPropertyInfo ComplexPropertyInfo} objects in this property enables the table to speed up the
				 * initial setup.
				 *
				 * Instead of requesting the <code>PropertyInfo</code> objects from the <code>TableDelegate</code> and waiting for them, the table
				 * will use the <code>PropertyInfo</code> objects specified here for rendering-specific tasks, e.g. automatic column width
				 * calculation, and to trigger the initial data request.
				 *
				 * <b>Note:</b>
				 * <ul>
				 *   <li>This property is processed only once during the instantiation of the table. Any subsequent changes have no effect.</li>
				 *   <li>This property must not be bound.</li>
				 *   <li>This property is used exclusively for SAPUI5 flexibility / Fiori Elements. Do not use it otherwise.</li>
				 *   <li>Existing properties (set via <code>sap.ui.mdc.Table#setPropertyInfo</code>) must not be removed and their attributes must
				 *       not be changed during the {@link module:sap/ui/mdc/TableDelegate.fetchProperties fetchProperties} callback. Otherwise
				 *       validation errors might occur whenever personalization-related control features (such as the opening of any personalization
				 *       dialog) are activated.</li>
				 * </ul>
				 *
				 * @since 1.111
				 */
				propertyInfo: {
					type: "object",
					defaultValue: [],
					bindable: false
				},

				/**
				 * Ordered list of property keys that define which columns the table has.
				 * The table creates and manages the <code>columns</code> aggregation based on this list.
				 *
				 * This is an alternative to defining <code>columns</code> directly in the aggregation.
				 * You can't define both <code>propertyKeys</code> and <code>columns</code> at the same time.
				 *
				 * This property must be set during control creation (for example, in the XML view or constructor settings).
				 * After initialization, it is managed by the control and must not be modified.
				 *
				 * <b>Note:</b> This property must not be bound.
				 *
				 * @private
				 * @ui5-restricted sap.fe
				 * @since 1.148
				 */
				propertyKeys: {
					type: "string[]",
					defaultValue: []
				},

				/**
				 * Determines whether the toolbar is visible.
				 *
				 * <b>Note:</b> Hiding the toolbar limits the functionality of the table in the following ways:
				 * <ul>
				 *   <li>The <code>showRowCount</code> property <b>must</b> be set to <code>false</code>.</li>
				 *   <li>The export <b>must</b> be disabled by setting the <code>enableExport</code> property to <code>false</code>.</li>
				 *   <li>For {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}, show and hide details won't be visible as the table will
				 *       always run in "Show Details" mode.</li>
				 *   <li>Copy and paste will only work via keyboard.</li>
				 *   <li>For {@link sap.ui.mdc.table.TreeTableType TreeTable}, "Collapse All" and "Expand All" won't be possible.</li>
				 *   <li>The <code>actions</code> and the <code>quickFilter</code> aggregations and a table-related
				 *       {@link sap.ui.fl.variants.VariantManagement} <b>must not</b> be used.</li>
				 *   <li>The table title will not be displayed but will be replaced by an <code>InvisibleText</code>. The <code>header</code>
				 *       property <b>must</b> be set. In addition, <code>headerVisible</code> <b>must</b> be set to <code>false</code> to ensure
				 *       accessibility compatibility.</li>
				 *   <li>Personalization (<code>p13nMode</code>) can still be used via the column headers. If the option to show or hide columns is
				 *       activated, it is recommended to use an {@link sap.m.IllustratedMessage} for the <code>nodata</code> display. It ensures that
				 *       columns can be made visible again when the user has accidentally hidden them all.</li>
				 * </ul>
				 *
				 * @since 1.121
				 */

				hideToolbar: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				}
			},
			aggregations: {
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				/**
				 * Type of the table.
				 */
				type: {
					type: "sap.ui.mdc.table.TableTypeBase",
					altTypes: [
						"sap.ui.mdc.enums.TableType"
					],
					multiple: false
				},
				/**
				 * Columns of the table.
				 *
				 * <b>Note:</b> This aggregation is managed by the control, can only be populated during the definition in the XML view, and is not
				 * bindable. Any changes of the initial aggregation content might result in undesired effects. Changes of the aggregation have to be
				 * made with the {@link sap.ui.mdc.p13n.StateUtil StateUtil}.
				 */
				columns: {
					type: "sap.ui.mdc.table.Column",
					multiple: true
				},

				/**
				 * This row can be used for user input to create new data if {@link sap.ui.mdc.enums.TableType TableType} is "<code>Table</code>".
				 *
				 * <b>Note:</b> Once the binding supports creating transient records, this aggregation will be removed.
				 *
				 * @ui5-restricted sap.fe
				 * @deprecated As of version 1.124, the concept has been discarded.
				 */
				creationRow: {
					type: "sap.ui.mdc.table.CreationRow",
					multiple: false,
					deprecated: true
				},

				/**
				 * Additional actions that will be available in the toolbar.
				 *
				 * <b>Note:</b> This aggregation is managed by the control, can only be populated during the definition in the XML view, and is not
				 * bindable. Any changes of the initial aggregation content might result in undesired effects. Changes of the aggregation have to be
				 * made with the {@link sap.ui.mdc.p13n.StateUtil StateUtil}.
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
				 * Additional table-related actions that are positioned together with other table-generated actions, based on the
				 * {@link sap.ui.mdc.table.ActionLayoutData ActionLayoutData} provided.
				 *
				 * <b>Note:</b> All actions should use layout data of the {@link sap.ui.mdc.table.ActionLayoutData ActionLayoutData} type to ensure
				 * correct ordering. Actions that do not use this layout data will be placed after the table-generated actions.<br>
				 * <b>Note:</b> Like other table-generated actions, these actions are excluded from the UI adaptation.
				 *
				 * @since 1.143
				 */
				tableActions: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						getter: "_createToolbar",
						aggregation: "controlActions"
					}
				},

				/**
				 * <code>VariantManagement<code> control for the table.
				 */
				variant: {
					type: "sap.ui.fl.variants.VariantManagement",
					multiple: false
				},

				/**
				 * Additional control for filtering that will be available in the toolbar.
				 */
				quickFilter: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * Settings for the table rows.
				 *
				 * <b>Note:</b> Each time the properties of the settings are changed, they have to be applied again via <code>setRowSettings</code>
				 * for the changes to take effect.
				 */
				rowSettings: {type: "sap.ui.mdc.table.RowSettings", multiple: false},

				/**
				 * Default values shown in the export dialog.
				 *
				 * <b>Note:</b> These values are defaults shown to the user in the export dialog. The user can still modify them before export.
				 * If the user modifies a value in the dialog, the user choice takes precedence and is not overridden by event handlers.
				 *
				 * The expected type is <code>sap.ui.export.TableExportSettings</code>. The <code>sap.ui.export</code> library must be loaded
				 * before setting this aggregation.
				 *
				 * @since 1.148
				 */
				defaultExportSettings: {
					type: "sap.ui.core.Element",
					multiple: false
				},

				/**
				 * <code>DataStateIndicator</code> plugin that can be used to show binding-related messages.
				 *
				 * @since 1.89
				 */
				dataStateIndicator: {
					type: "sap.m.plugins.DataStateIndicator",
					multiple: false
				},

				/**
				 * Defines the custom visualization if there is no data to show.
				 *
				 * <b>Note:</b> If {@link sap.m.IllustratedMessage} control is set for the <code>noData</code> aggregation and its
				 * {@link sap.m.IllustratedMessage#getTitle title} property is not set then the table automatically offers a no data text with
				 * fitting {@link sap.m.IllustratedMessage.IllustratedMessageType illustration}.
				 *
				 * @since 1.106
				 */
				noData: {type: "sap.ui.core.Control", multiple: false, altTypes: ["string"]},

				/**
				 * Defines an aggregation for the <code>CopyProvider</code> plugin that provides copy to clipboard capabilities for the selected rows
				 * and creates a Copy button for the toolbar. To disable the copy function, including the Copy button in the toolbar, the
				 * <code>enabled</code> property of the <code>CopyProvider</code> must be set to <code>false</code>. To hide the Copy button from the
				 * toolbar, the <code>visible</code> property of the <code>CopyProvider</code> must be set to <code>false</code>.
				 *
				 * <b>Note:</b> The {@link sap.m.plugins.CopyProvider#extractData extractData} property of the <code>CopyProvider</code> must not be
				 * managed by the application. The <code>CopyProvider</code> requires a secure context to access the clipboard API. If the context
				 * is not secure, the plugin will not be added, and the Copy button will not be generated.
				 *
				 * @since 1.114
				 */
				copyProvider: {
					type: "sap.m.plugins.CopyProvider",
					multiple: false
				},

				/**
				 * Defines the context menu for the rows.
				 *
				 * @since 1.118
				 */
				contextMenu: {type: "sap.ui.core.IContextMenu", multiple: false},

				/**
				 * Defines an aggregation for the <code>CellSelector</code> plugin that provides cell selection capabilities.
				 *
				 * <b>Note:</b> The <code>CellSelector</code> is currently only available in combination with the
				 * {@link sap.ui.mdc.table.GridTableType GridTable}. Please refer to {@link sap.m.plugins.CellSelector} for additional restrictions.
				 *
				 * @since 1.119
				 */
				cellSelector: {
					type: "sap.m.plugins.CellSelector",
					multiple: false
				}
			},
			associations: {
				/**
				 * Control or object that enables the table to do filtering, such as {@link sap.ui.mdc.FilterBar}. See also
				 * {@link sap.ui.mdc.IFilter}.
				 *
				 * <b>Note:</b> By default, automatic filter generation only works in combination with a <code>sap.ui.mdc.FilterBar</code>, see also
				 * {@link module:sap/ui/mdc/TableDelegate.getFilters}.
				 */
				filter: {
					type: "sap.ui.mdc.IFilter",
					multiple: false
				}
			},
			events: {
				/**
				 * This event is fired when a row is pressed.
				 */
				rowPress: {
					parameters: {
						/**
						 * The binding context
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						}
					}
				},
				/**
				 * This event is fired when the selection is changed.
				 */
				selectionChange: {
					parameters: {
						/**
						 * Identifies whether the Select All checkbox was pressed
						 */
						selectAll: {
							type: "boolean"
						}
					}
				},
				/**
				 * This event is fired right before the export is triggered.
				 *
				 * For more information about the export settings, see {@link sap.ui.export.Spreadsheet} or
				 * {@link topic:7e12e6b9154a4607be9d6072c72d609c Spreadsheet Export Configuration}.
				 *
				 * @since 1.75
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
						 *
						 * @since 1.110
						 */
						filterSettings: {
							type: "object[]"
						}
					}
				},
				/**
				 * This event is fired when the user pastes content from the clipboard to the table.
				 */
				paste: {
					parameters: {
						/**
						 * 2D array of strings with data from the clipboard.
						 * The first dimension represents the rows, and the second dimension represents the cells of the tabular data.
						 */
						data: {
							type: "string[][]"
						}
					}
				},
				/**
				 * This event is fired when the user requests the context menu for the table.
				 *
				 * @since 1.117
				 */
				beforeOpenContextMenu: {
					allowPreventDefault: true,
					parameters: {
						/**
						 * The binding context
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						},
						/**
						 * The column used for the context menu
						 *
						 * <b>Note:</b> This parameter can be undefined if the area where the context menu opens is not related to a column instance.
						 */
						column: {type: "sap.ui.mdc.table.Column"}
					}
				}
			}
		},
		constructor: function() {
			this._createInitPromises();
			Control.apply(this, arguments);
			this.bCreated = true;
			this._updateAdaptation();
			this._initializeContent();
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oTable) {
				oRm.openStart("div", oTable);
				oRm.class("sapUiMdcTable");
				oRm.style("width", oTable.getWidth());
				oTable._getType().getTableStyleClasses().forEach((sStyleClass) => {
					oRm.class(sStyleClass);
				});
				oRm.openEnd();
				oRm.renderControl(oTable.getAggregation("_content"));
				oRm.close("div");
			}
		}
	});

	const aToolBarBetweenAggregations = ["variant", "quickFilter"];

	/**
	 * Create setter and getter for aggregation that are passed to ToolBar aggregation named "Between"
	 * Several different Table aggregations are passed to the same ToolBar aggregation (Between)
	 */
	aToolBarBetweenAggregations.forEach((sAggregationName) => {
		const sCapAggregationName = capitalize(sAggregationName);
		const sPropertyName = "_o" + sCapAggregationName;
		const sGetter = "get" + sCapAggregationName;
		const sSetter = "set" + sCapAggregationName;
		const sDestroyer = "destroy" + sCapAggregationName;

		Table.prototype[sGetter] = function() {
			return this[sPropertyName];
		};

		Table.prototype[sDestroyer] = function() {
			const oControl = this[sPropertyName];
			this[sSetter]();
			if (oControl) {
				oControl.destroy();
			}
			return this;
		};

		Table.prototype[sSetter] = function(oControl) {
			this.validateAggregation(sAggregationName, oControl, false);
			const oToolBar = this._createToolbar();
			const bNewValue = oControl !== this[sPropertyName];
			if (!oControl || bNewValue) {
				oToolBar.removeBetween((this[sGetter]()));
				this[sPropertyName] = oControl;
			}
			if (bNewValue && oControl) {
				this._setToolbarBetween(oToolBar);
			}
			if (sAggregationName === "variant") {
				this._updateVariantManagementStyle();
			}
			return this;
		};
	});

	/**
	 * @inheritDoc
	 */
	Table.prototype.init = function() {
		Control.prototype.init.apply(this, arguments);

		// Skip propagation of properties (models and bindingContexts)
		this.mSkipPropagation = {
			rowSettings: true
		};

		this._bForceRebind = true;
		this._bForceRefreshBinding = false;

		this._setPropertyHelperClass(PropertyHelper);
		this._setupPropertyInfoStore("propertyInfo");

		this._oManagedObjectModel = new ManagedObjectModel(this, {
			hasGrandTotal: false,
			activeP13nModes: createActiveP13nModesMap(this),
			toolbarButtonType: TableSettings.getToolbarButtonType()
		});
		this._oManagedObjectModel.setDefaultBindingMode(BindingMode.OneWay);
		this.setModel(this._oManagedObjectModel, "$sap.ui.mdc.Table");
	};

	/**
	 * @inheritDoc
	 */
	Table.prototype.applySettings = function(mSettings, oScope) {
		// Some settings rely on the existence of a (table-)type instance. If the type is applied before other settings, initialization of a
		// (incorrect) default type instance can be avoided.
		// The delegate must be part of the early settings, because it can only be applied once (see sap.ui.mdc.mixin.DelegateMixin).
		if (mSettings && "type" in mSettings) {
			const mEarlySettings = {type: mSettings.type};

			if ("delegate" in mSettings) {
				mEarlySettings.delegate = mSettings.delegate;
				delete mSettings.delegate;
			}

			delete mSettings.type;
			Control.prototype.applySettings.call(this, mEarlySettings, oScope);
		}

		Control.prototype.applySettings.call(this, mSettings, oScope);
		this.initControlDelegate();

		// onModification is not called if changes are applied during XML preprocessing. For the initial validation, this call leads to duplicate log
		// entries if changes are applied on runtime (onModification is called).
		validateStateAgainstPropertyInfo(this);
	};

	Table.prototype._setToolbarBetween = function(oToolBar) {
		[this._oVariant, this._oQuickFilter].forEach((oControl) => {
			if (oControl) {
				oToolBar.addBetween(oControl);
			}
		});
	};

	/**
	 * Returns a <code>Promise</code> that resolves after the table has been initialized, and after it has been created or its type has been changed.
	 *
	 * @returns {Promise} A <code>Promise</code> that resolves after the table has been initialized
	 * @public
	 */
	Table.prototype.initialized = function() {
		return this._oTableReady.promise;
	};

	Table.prototype._fullyInitialized = function() {
		return this._oFullInitialize.promise;
	};

	/**
	 * Plugin owner methods for plugins applied to MDCTable.
	 */
	["CopyProvider", "CellSelector", "DataStateIndicator", "ContextMenuSetting"].forEach((sPlugin) => {
		Table.prototype[`get${sPlugin}PluginOwner`] = function() {
			return this._oTable || this._oFullInitialize?.promise;
		};
	});

	Table.prototype.setCopyProvider = function(oCopyProvider) {
		this.setAggregation("copyProvider", oCopyProvider, true);
		if (window.isSecureContext && oCopyProvider && !Element.getElementById(this.getId() + "-copy")) {
			this._oToolbar?.insertEnd(this._getCopyButton(), 0);
		}
		return this;
	};

	Table.prototype.attachEvent = function(sEventId) {
		Control.prototype.attachEvent.apply(this, arguments);
		if (sEventId === "rowPress") {
			this._getType().prepareRowPress();
		}
		return this;
	};

	Table.prototype.detachEvent = function(sEventId) {
		Control.prototype.detachEvent.apply(this, arguments);
		if (sEventId === "rowPress") {
			this._getType().cleanupRowPress();
		}
		return this;
	};

	/**
	 * Returns the clipboard settings for a column.
	 *
	 * @param {sap.ui.mdc.table.Column} oColumn The column for which to get the clipboard settings
	 * @returns {sap.m.plugins.CopyProvider.ColumnClipboardSettings} Clipboard setting object for the provided column.
	 * @private
	 * @ui5-restricted sap.m.plugins.CopyProvider
	 */
	Table.prototype.getColumnClipboardSettings = function(oColumn) {
		return this.getPropertyHelper().getColumnClipboardSettings(oColumn);
	};

	Table.prototype.setDataStateIndicator = function(oDataStateIndicator) {
		this._handleDataStateEvents(this.getDataStateIndicator(), "detach");
		this.setAggregation("dataStateIndicator", oDataStateIndicator, true);
		this._handleDataStateEvents(this.getDataStateIndicator(), "attach");
		return this;
	};

	Table.prototype._handleDataStateEvents = function(oDataStateIndicator, sAction) {
		if (oDataStateIndicator) {
			oDataStateIndicator[sAction + "ApplyFilter"](this._onApplyMessageFilter, this);
			oDataStateIndicator[sAction + "ClearFilter"](this._onClearMessageFilter, this);
			oDataStateIndicator[sAction + "Event"]("filterInfoPress", function() {
				PersonalizationUtils.openFilterDialog(this);
			}, this);
		}
	};

	/**
	 * This gets called from the DataStateIndicator plugin when data state message filter is applied
	 * @private
	 */
	Table.prototype._onApplyMessageFilter = function(oEvent) {
		this._oMessageFilter = oEvent.getParameter("filter");
		oEvent.preventDefault();

		if (this.isTableBound()) {
			this.rebind();
		}
	};

	/**
	 * This gets called from the DataStateIndicator plugin when the data state message filter is cleared
	 * @private
	 */
	Table.prototype._onClearMessageFilter = function(oEvent) {
		this._oMessageFilter = null;
		oEvent.preventDefault();

		if (this.isTableBound()) {
			this.rebind();
		}
	};

	/**
	 * Determine the table's type
	 * @param {sap.ui.mdc.enums.TableType} sType The table type to be checked
	 * @param {boolean} bIncludeSubTypes enable subtype check
	 * @returns {boolean} Indicates if the table is of the given type
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Table.prototype._isOfType = function(sType, bIncludeSubTypes) {
		const oType = this._getType();

		if (bIncludeSubTypes) {
			return oType.isA(mTypeMap[sType].getMetadata().getName());
		} else {
			return oType.constructor === mTypeMap[sType];
		}
	};

	Table.prototype.setContextMenu = function(oContextMenu) {
		this._oContextMenu = this.validateAggregation("contextMenu", oContextMenu, false);
		this._oTable?.setAggregation("contextMenu", oContextMenu, true);
		return this;
	};

	Table.prototype.getContextMenu = function() {
		return (this._oContextMenu && !this._oContextMenu.isDestroyed()) ? this._oContextMenu : null;
	};

	Table.prototype.destroyContextMenu = function() {
		if (this._oTable) {
			this._oTable.destroyContextMenu();
		} else if (this._oContextMenu) {
			this._oContextMenu.destroy();
		}
		this._oContextMenu = null;
		return this;
	};

	Table.prototype._onBeforeOpenContextMenu = function(mPropertyBag) {
		const oContextMenu = mPropertyBag.contextMenu;
		let bPreventDefault = true;

		if (oContextMenu.isA("sap.ui.mdc.table.menus.GroupHeaderRowContextMenu")) {
			oContextMenu.initContent(this, {
				groupLevel: mPropertyBag.groupLevel
			});
			bPreventDefault = oContextMenu.isEmpty();
		} else {
			bPreventDefault = !this.fireBeforeOpenContextMenu({
				bindingContext: mPropertyBag.bindingContext,
				column: mPropertyBag.column
			});
		}

		if (bPreventDefault) {
			mPropertyBag.event.preventDefault();
		}
	};

	/**
	 * Scrolls the table to the row with the given index. Depending on the table type, this might cause additional requests. If the given index is -1,
	 * it will scroll to the end of the table based on the length of the underlying binding. If the length is not final, it will only scroll to the
	 * end of the current binding and might trigger a request for additional entries. This also applies in case of a responsive table with growing
	 * enabled.
	 *
	 * @param {number} iIndex The index of the row that should be scrolled into the visible area
	 * @since 1.76
	 * @returns {Promise} A <code>Promise</code> that resolves after the table has been scrolled to the row with the given index
	 * @public
	 */
	Table.prototype.scrollToIndex = function(iIndex) {
		if (typeof iIndex !== "number") {
			return Promise.reject("The iIndex parameter has to be a number");
		}

		return this._getType().scrollToIndex(iIndex);
	};

	/**
	 * Sets the focus on the row. If <code>bFirstInteractiveElement</code> is <code>true</code>, and there are interactive elements inside the row,
	 * sets the focus on the first interactive element. Otherwise sets the focus on the first data cell, if the type is <code>GridTableType</code>,
	 * and on the entire row, if the type is <code>ResponsiveTableType</code>.
	 * If the given index is not visible, the table scrolls to it automatically. In this case the same rules apply as in {@link #scrollToIndex}.
	 *
	 * @param {number} iIndex The index of the row that is to be focused
	 * @param {boolean} [bFirstInteractiveElement=false] Indicates whether to set the focus on the first interactive element inside the row
	 * @since 1.86
	 * @returns {Promise} A <code>Promise</code> that resolves after the focus has been set
	 * @public
	 */
	Table.prototype.focusRow = function(iIndex, bFirstInteractiveElement) {
		return this.scrollToIndex(iIndex).then(() => {
			return this._oTable._setFocus(iIndex, bFirstInteractiveElement);
		});
	};

	Table.prototype.setType = function(vType) {
		if (!this.bCreated) {
			return this.setAggregation("type", vType, true);
		}

		this._resetContent();
		this.setAggregation("type", vType);
		this._initializeContent();
		this._updateAdaptation();

		return this;
	};

	Table.prototype.destroyType = function() {
		if (!this.getType()) {
			return this.destroyAggregation("type", true);
		}

		this._resetContent();
		this.destroyAggregation("type");
		this._initializeContent();

		return this;
	};

	Table.prototype._resetContent = function() {
		if (this._oTable) {
			// Remove the toolbar from the table to avoid its destruction when the table is destroyed. Do this only when a toolbar exists to not
			// create an unnecessary default type instance.
			if (this._oToolbar) {
				this._getType().removeToolbar();
			}

			// store and remove the noData otherwise it gets destroyed
			const vNoData = this.getNoData();
			this.setNoData();
			this._vNoData = vNoData;

			// store and remove the contextMenu otherwise it gets destroyed
			const oContextMenu = this.getContextMenu();
			this.setContextMenu();
			this._oContextMenu = oContextMenu;

			this._oTable.destroy("KeepDom");
			this._oTable = null;
		} else {
			this._onAfterInitialization("Type changed");
			this._onAfterFullInitialization("Type changed");
		}

		if (this._oRowTemplate) {
			this._oRowTemplate.destroy();
			this._oRowTemplate = null;
		}

		this._destroyDefaultType();
		this._createInitPromises();
	};

	/**
	 * Retrieve the table's type
	 * @returns {sap.ui.mdc.table.TableTypeBase} The TableType implementation in use
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Table.prototype._getType = function() {
		const vType = this.getType();

		if (!this._oDefaultType && (typeof vType === "string" || vType === null)) {
			this._oDefaultType = new mTypeMap[vType]();
			this.addDependent(this._oDefaultType);
		}

		return this._oDefaultType || this.getType();
	};

	Table.prototype._destroyDefaultType = function() {
		if (this._oDefaultType) {
			this._oDefaultType.destroy();
			delete this._oDefaultType;
		}
	};

	Table.prototype.setRowSettings = function(oRowSettings) {
		this.setAggregation("rowSettings", oRowSettings, true);
		this._getType().updateRowSettings();

		if (this.isTableBound()) {
			this._bForceRebind = true;
			this.rebind();
		}

		return this;
	};

	Table.prototype.setDefaultExportSettings = function(oExportSettings) {
		if (oExportSettings && !oExportSettings.isA("sap.ui.export.TableExportSettings")) {
			throw new Error("The 'defaultExportSettings' aggregation must be of type 'sap.ui.export.TableExportSettings'.");
		}

		return this.setAggregation("defaultExportSettings", oExportSettings);
	};

	Table.prototype.setHeaderLevel = function(sLevel) {
		this.setProperty("headerLevel", sLevel, true);
		this._updateVariantManagementStyle();
		return this;
	};

	Table.prototype.setHeaderStyle = function(sStyle) {
		this.setProperty("headerStyle", sStyle, true);
		const sHeaderStyle = this.getHeaderStyle() || TitleLevel[ThemeParameters.get({name: "_sap_ui_mdc_Table_HeaderStyle"})];
		this._oTitle?.setTitleStyle(sHeaderStyle);
		this._updateVariantManagementStyle();
		return this;
	};

	/**
	 * @inheritDoc
	 */
	Table.prototype.focus = function(oFocusInfo) {
		if (this._oTable) {
			this._oTable.focus(oFocusInfo);
		}
	};

	Table.prototype.setBusy = function(bBusy) {
		this.setProperty('busy', bBusy, true);

		if (this._oTable) {
			this._oTable.setBusy(bBusy);
		}

		return this;
	};

	Table.prototype.setBusyIndicatorDelay = function(iDelay) {
		this.setProperty('busyIndicatorDelay', iDelay, true);

		if (this._oTable) {
			this._oTable.setBusyIndicatorDelay(iDelay);
		}

		return this;
	};

	Table.prototype.setCreationRow = function(oCreationRow) {
		this.setAggregation("creationRow", oCreationRow, true);

		if (oCreationRow) {
			oCreationRow.update();
		}

		return this;
	};

	Table.prototype.setEnableColumnResize = function(bEnableColumnResize) {
		const bOldEnableColumnResize = this.getEnableColumnResize();
		this.setProperty("enableColumnResize", bEnableColumnResize, true);

		if (this.getEnableColumnResize() !== bOldEnableColumnResize) {
			this._updateColumnResize();
			this._updateAdaptation();
			updateColumnMenu(this);
		}

		return this;
	};

	const fCheckIfRebindIsRequired = function(aAffectedP13nControllers) {
		let bRebindRequired = false;
		if (
			aAffectedP13nControllers && (
				aAffectedP13nControllers.indexOf("Sort") > -1 ||
				aAffectedP13nControllers.indexOf("Column") > -1 ||
				aAffectedP13nControllers.indexOf("Group") > -1 ||
				aAffectedP13nControllers.indexOf("Aggregate") > -1 ||
				aAffectedP13nControllers.indexOf("Filter") > -1 ||
				aAffectedP13nControllers.indexOf("PropertyInfo") > -1
			)
		) {
			bRebindRequired = true;
		}

		return bRebindRequired;
	};

	Table.prototype._onModifications = async function(aAffectedP13nControllers) {
		this.getColumns().forEach((oColumn) => {
			oColumn._onModifications();
		});

		this._getType().onModifications(aAffectedP13nControllers);
		if (fCheckIfRebindIsRequired(aAffectedP13nControllers) && this.isTableBound()) {
			await this.finalizePropertyHelper();
			if (aAffectedP13nControllers.indexOf("PropertyInfo") > -1) {
				this._bForceRefreshBinding = true;
			}
			await this.rebind();
		}

		await validateStateAgainstPropertyInfo(this);
		updateFilterInfoBar(this);
	};

	/**
	 * Validates the current state of the table against the available property info, and logs a warning in case of invalid state.
	 *
	 * If the property info is not final, the state is validated against the <code>propertyInfo</code> property if defined, otherwise validation is
	 * scheduled after the property info is finalized after being fetched from the delegate.
	 *
	 * Validation succeeds if a state, such as a sort condition, was added and removed in the same change application, even if the property does not
	 * exist.
	 *
	 * Columns are not validated. ItemBaseFlex throws an error if Delegate.addItem does not create a column for a property. This should be the case
	 * if a property does not exist. However, if the delegate just makes something up and creates a column anyway, no validation error occurs
	 * anywhere.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise} Promise that resolves when validation is done
	 */
	async function validateStateAgainstPropertyInfo(oTable) {
		const oXConfig = oTable._getXConfig();
		const mState = {
			Sort: oTable._getSortedProperties().map((oSortCondition) => oSortCondition.key),
			Filter: getFilteredProperties(oTable.getFilterConditions()),
			"Group level": oTable._getGroupedProperties().map((oGroupCondition) => oGroupCondition.key),
			Aggregation: Object.keys(oTable._getAggregatedProperties()),
			"Column width": Object.keys(oXConfig?.aggregations?.columns || {}).filter((sKey) => oXConfig.aggregations.columns[sKey].width),
			"PropertyInfo": Object.keys(oXConfig?.propertyInfo || {})
				.filter((sKey) => Object.keys(oXConfig.propertyInfo[sKey]).length > 0)
		};
		const oPropertyHelper = await oTable.awaitPropertyHelper();

		if (oTable.isPropertyHelperFinal() || oPropertyHelper.getProperties().length > 0) {
			for (const sStateType in mState) {
				for (const sPropertyKey of mState[sStateType]) {
					if (!oPropertyHelper.getProperty(sPropertyKey, true)) {
						Log.error(`Invalid state: ${sStateType} modification exists for non-existent property '${sPropertyKey}'`, oTable);
					}
				}
			}
		} else {
			await oTable.propertiesFinalized();
			await validateStateAgainstPropertyInfo(oTable);
		}
	}

	Table.prototype.setP13nMode = function(aMode) {
		const aOldP13nMode = this.getP13nMode();

		let aSortedKeys = [];
		if (aMode && aMode.length > 1) {
			const mKeys = aMode.reduce((mMap, sKey, iIndex) => {
				mMap[sKey] = true;
				return mMap;
			}, {});

			//as the p13nMode has no strict order we need to ensure the order of tabs here
			if (mKeys.Column) {
				aSortedKeys.push("Column");
			}
			if (mKeys.Sort) {
				aSortedKeys.push("Sort");
			}
			if (mKeys.Filter) {
				aSortedKeys.push("Filter");
			}
			if (mKeys.Group) {
				aSortedKeys.push("Group");
			}
			if (mKeys.Aggregate) {
				aSortedKeys.push("Aggregate");
			}
		} else {
			aSortedKeys = aMode;
		}

		this.setProperty("p13nMode", aSortedKeys, true);
		this._updateAdaptation();
		this._oManagedObjectModel.setProperty("/@custom/activeP13nModes", createActiveP13nModesMap(this));

		if (!deepEqual(aOldP13nMode.sort(), this.getP13nMode().sort())) {
			updateP13nSettings(this);
			updateColumnMenu(this);
			this.invalidate(); // Inner columns must update aria-haspopup
		}

		return this;
	};

	Table.prototype._updateAdaptation = function() {
		const oRegisterConfig = {
			controller: {}
		};

		const aStableKeys = [];
		if (this.getColumns().length > 0 && this._isOfType(TableType.TreeTable)) {
			aStableKeys.push(this.getColumns()[0].getPropertyKey());
		}

		const mP13nModeControllers = {
			Column: new ColumnController({control: this, stableKeys: aStableKeys}),
			Sort: new SortController({control: this}),
			Group: new GroupController({control: this}),
			Filter: new FilterController({control: this}),
			Aggregate: new AggregateController({control: this})
		};

		oRegisterConfig.controller["PropertyInfo"] = new DynamicPropertiesController({
			control: this,
			allowedPropertyAttributes: [
				"isActive",
				"label",
				"tooltip"
			]
		});

		this.getActiveP13nModes().forEach((sMode) => {
			oRegisterConfig.controller[sMode] = mP13nModeControllers[sMode];
		});

		if (this.getEnableColumnResize()) {
			oRegisterConfig.controller["ColumnWidth"] = new ColumnWidthController({control: this, exposeXConfig: true});
		}

		if (this._isOfType(TableType.Table, true) && this._getType().getEnableColumnFreeze()) {
			oRegisterConfig.controller["ColumnFreeze"] = new ColumnFreezeController({control: this});
		}

		if (this._isOfType(TableType.ResponsiveTable) && this._getType().getShowDetailsButton()) {
			oRegisterConfig.controller["ShowDetails"] = new ShowDetailsController({control: this});
		}

		this.getEngine().register(this, oRegisterConfig);
	};

	function updateColumnMenu(oTable) {
		const bIsColumnMenuEnabled = oTable.getActiveP13nModes().length > 0 || oTable.getEnableColumnResize();

		if (bIsColumnMenuEnabled) {
			oTable._createColumnHeaderMenu();
		} else {
			oTable._destroyColumnHeaderMenu();
		}
	}

	function updateP13nSettings(oTable) {
		oTable._updateP13nButton();

		if (oTable._oTable) {
			const oDnDColumns = oTable._oTable.getDragDropConfig()[0];
			if (oDnDColumns) {
				oDnDColumns.setEnabled(oTable.getActiveP13nModes().indexOf("Column") > -1);
			}
		}

		updateFilterInfoBar(oTable);
	}

	Table.prototype.setFilterConditions = function(mConditions) {
		this.setProperty("filterConditions", mConditions, true);
		this.getInbuiltFilter()?.setFilterConditions(mConditions);
		updateFilterInfoBar(this);
		return this;
	};

	function updateFilterInfoBar(oTable) {
		let {oFilterInfoBar} = internal(oTable);
		const sFilterInfoText = getFilterInfoText(oTable);

		if (oFilterInfoBar?.isDestroyed()) {
			oFilterInfoBar = null;
		}

		if (oFilterInfoBar) {
			oFilterInfoBar.setInfoText(sFilterInfoText);
		} else if (sFilterInfoText && oTable._oTable) {
			oFilterInfoBar = new FilterInfoBar({
				id: oTable.getId() + "-filterInfoBar",
				infoText: sFilterInfoText,
				table: oTable
			});
			internal(oTable).oFilterInfoBar = oFilterInfoBar;
			oTable._getType().insertFilterInfoBar(oFilterInfoBar);
		}
	}

	function getFilterInfoText(oTable) {
		if (!oTable.isFilteringEnabled() || !oTable.getPropertyHelper()) {
			return "";
		}

		const aFilterLabels = oTable._getLabelsFromFilterConditions(); // FilterIntegrationMixin
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
	}

	Table.prototype.setThreshold = function(iThreshold) {
		return this.setProperty("threshold", iThreshold, true);
	};

	// Start: FilterIntegrationMixin hooks
	Table.prototype._onFilterProvided = function(oFilter) {
		this._updateInnerTableNoData();
	};

	Table.prototype._onFilterRemoved = function(oFilter) {
		this._updateInnerTableNoData();
	};

	Table.prototype._onFiltersChanged = function(oEvent) {
		if (this.isTableBound() && oEvent.getParameter("conditionsBased")) {
			this._oTable.setShowOverlay(true);
		}
	};

	Table.prototype._onFilterSearch = function(oEvent) {
		this._bAnnounceTableUpdate = true;
	};
	// End: FilterIntegrationMixin hooks

	Table.prototype.setNoData = function(vNoData) {
		this._vNoData = this.validateAggregation("noData", vNoData, false);
		if (!this._oTable) {
			return this;
		}

		if (vNoData && vNoData.isA && vNoData.isA("sap.m.IllustratedMessage")) {
			this._sLastNoDataTitle = "";
			vNoData.setEnableVerticalResponsiveness(!this._isOfType(TableType.ResponsiveTable));

			let oNoColumnsMessage = this._oTable.getAggregation("_noColumnsMessage");
			if (!oNoColumnsMessage) {
				oNoColumnsMessage = MTableUtil.getNoColumnsIllustratedMessage(() => {
					PersonalizationUtils.openSettingsDialog(this);
				});
				oNoColumnsMessage.setEnableVerticalResponsiveness(!this._isOfType(TableType.ResponsiveTable));
				this._oTable.setAggregation("_noColumnsMessage", oNoColumnsMessage);
			}
		}

		this._oTable.setNoData(vNoData);
		this._updateInnerTableNoData();
		return this;
	};

	Table.prototype.getNoData = function() {
		return (this._vNoData && !this._vNoData.isDestroyed?.()) ? this._vNoData : null;
	};

	Table.prototype.destroyNoData = function() {
		if (this._oTable) {
			this._oTable.destroyNoData(true);
		} else if (this._vNoData) {
			this._vNoData.destroy?.();
		}

		this._vNoData = null;
		return this;
	};

	Table.prototype._updateInnerTableNoData = function() {
		const vNoData = this.getNoData();
		if (!vNoData || typeof vNoData === "string") {
			return this._updateInnerTableNoDataText();
		}

		if (!vNoData.isA("sap.m.IllustratedMessage") || this._sLastNoDataTitle !== vNoData.getTitle()) {
			return;
		}

		const oRb = Library.getResourceBundleFor("sap.ui.mdc");
		if (!this.isTableBound()) {
			if (this.getFilter()) {
				vNoData.setTitle(oRb.getText("table.NO_DATA_WITH_FILTERBAR_TITLE"));
				vNoData.setDescription(oRb.getText("table.NO_DATA_WITH_FILTERBAR_DESCRIPTION"));
				vNoData.setIllustrationType(IllustratedMessageType.BeforeSearch);
			} else {
				vNoData.setIllustrationType(IllustratedMessageType.NoEntries);
				vNoData.setTitle(oRb.getText("table.NO_DATA_TITLE"));
				vNoData.setDescription(oRb.getText("table.NO_DATA_DESCRIPTION"));
			}
		} else if (isFiltered(this)) {
			vNoData.setTitle(oRb.getText("table.NO_RESULTS_TITLE"));
			vNoData.setDescription(oRb.getText("table.NO_RESULTS_DESCRIPTION"));
			vNoData.setIllustrationType(IllustratedMessageType.NoFilterResults);
		} else {
			vNoData.setTitle(oRb.getText("table.NO_DATA_TITLE"));
			vNoData.setDescription(oRb.getText("table.NO_DATA_DESCRIPTION"));
			vNoData.setIllustrationType(IllustratedMessageType.NoEntries);
		}
		this._sLastNoDataTitle = vNoData.getTitle();
	};

	Table.prototype._updateInnerTableNoDataText = function() {
		if (this._oTable) {
			this._oTable.setNoData(this._getNoDataText());
		}
	};

	Table.prototype._getNoDataText = function() {
		const vNoData = this.getNoData();
		if (vNoData && typeof vNoData === "string") {
			return vNoData;
		}

		const oRb = Library.getResourceBundleFor("sap.ui.mdc");
		if (!this.isTableBound()) {
			return this.getFilter() ? oRb.getText("table.NO_DATA_WITH_FILTERBAR") : oRb.getText("table.NO_DATA");
		}

		// Table is bound, but does not show any data.
		// If the table is filtered internally or externally, for example via the FilterBar, then show the message that no data was found and that
		// filters can be adjusted.
		if (isFiltered(this)) {
			return oRb.getText("table.NO_RESULTS");
		}

		// If no filters set, show only message that the data are not found, and nothing about the filters.
		return oRb.getText("table.NO_DATA");
	};

	Table.prototype._updateRowActions = function() {
		this._getType().updateRowActions();
	};

	Table.prototype._initializeContent = function() {
		const oType = this._getType();
		const aInitPromises = [
			this.awaitControlDelegate(),
			this.awaitPropertyHelper(),
			oType.loadModules()
		];

		if (this.isFilteringEnabled()) {
			aInitPromises.push(this.retrieveInbuiltFilter());
		}

		// Load the necessary modules via the corresponding TableType
		Promise.all(aInitPromises).then(() => {
			// The table type might be switched while the necessary libs, modules are being loaded; hence the below checks
			if (this.isDestroyed()) {
				return Promise.reject("Destroyed");
			}

			// TODO: Cache Delegate.getSupportedFeatures and use only cached feature information in the table.

			this._oManagedObjectModel.setProperty("/@custom/activeP13nModes", createActiveP13nModesMap(this));
			this._updateAdaptation();

			/**
			 * @deprecated As of version 1.134.
			 */
			if (this.getControlDelegate().preInit) {
				// Not used in the table, but is overridden in FE. In FE, it's tightly coupled to the CreationRow, which has been deprecated in
				// version 1.124. Therefore, this hook should also be deprecated.
				this.getControlDelegate().preInit(this);
			}

			// The table type might be switched while the necessary libs, modules are being loaded; hence the below checks
			if (!this._oTable && oType.constructor === this._getType().constructor) {
				return this._createContent();
			} else {
				return Promise.resolve();
			}
		}).catch((vError) => {
			this._onAfterInitialization(vError || "");
			this._onAfterFullInitialization(vError || "");
		});
	};

	Table.prototype._createInitPromises = function() {
		this._oTableReady = Promise.withResolvers();
		this._oFullInitialize = Promise.withResolvers();
		this._oFullInitialize.promise.catch(() => { }); // Avoid uncaught error
	};

	Table.prototype._onAfterInitialization = function(vError) {
		if (this._oTableReady) {
			if (vError != null) {
				this._oTableReady.reject(vError);
			} else {
				this._oTableReady.resolve(this);
			}
		}
	};

	Table.prototype._onAfterFullInitialization = function(vError) {
		if (this._oFullInitialize) {
			if (vError != null) {
				this._oFullInitialize.reject(vError);
			} else {
				this._oFullInitialize.resolve(this);
			}
		}
	};

	Table.prototype._createContent = async function() {
		this._createToolbar();
		this._createTable();
		this._updateColumnResize();
		this._updateRowActions();
		this._updateExpandAllButton();
		this._updateCollapseAllButton();
		this._updateExportButton();
		this.getColumns().forEach(this._insertInnerColumn, this);

		await this.getControlDelegate().initializeContent(this);
		if (this.isDestroyed()) {
			throw "Destroyed";
		}

		this.setAggregation("_content", this._oTable);

		if (this.isInPropertyKeysMode()) {
			await this.initializeItemsFromPropertyKeys();
		}

		this._onAfterInitialization();

		await Promise.all([
			this.getPropertyInfo().length === 0 ? this.finalizePropertyHelper() : this.awaitPropertyHelper(),
			this.initialized() // Required for the CreationRow binding context handling.
		]);
		if (this.isDestroyed()) {
			throw "Destroyed";
		}

		// Add this to the micro task execution queue to enable consumers to handle this correctly.
		// For example to add a binding context between the initialized promise and binding the rows.
		const oCreationRow = this.getCreationRow();
		if (oCreationRow) {
			oCreationRow.update();
		}

		if (this.getAutoBindOnInit()) {
			const oEngine = this.getEngine();
			oEngine.isModificationSupported(this).then((bModificationSupported) => {
				if (bModificationSupported) {
					oEngine.waitForChanges(this).then(() => {
						this.rebind();
					});
				} else {
					this.rebind();
				}
			});
		}

		this._onAfterFullInitialization();
	};

	Table.prototype.setHeaderVisible = function(bVisible) {
		this.setProperty("headerVisible", bVisible, true);
		this._updateInvisibleTitle();
		this._updateVariantManagementStyle();
		return this;
	};

	Table.prototype._updateInvisibleTitle = function() {
		if (this._oInvisibleTitle && (!this.getHideToolbar())) {
			this._oInvisibleTitle.destroy();
			this._oInvisibleTitle = null;
			this._oTable.removeAriaLabelledBy(this.getId() + "-invisibleTitle");
		} else if (this._oTable && !this._oInvisibleTitle && this.getHideToolbar()) {
			this._oInvisibleTitle = new InvisibleText(this.getId() + "-invisibleTitle", {
				text: "{$sap.ui.mdc.Table>/header}"
			}).toStatic();
			this._oTable.addAriaLabelledBy(this.getId() + "-invisibleTitle");
			// When the table type changes, the aria label reference gets deleted thus needs to be recreated
		} else if (this._oInvisibleTitle && !this._oTable.getAriaLabelledBy().includes(this.getId() + "-invisibleTitle")) {
			this._oTable.addAriaLabelledBy(this.getId() + "-invisibleTitle");
		}
	};

	Table.prototype.setEnableExport = function(bEnableExport) {
		this.setProperty("enableExport", bEnableExport, true);
		this._updateExportButton();
		return this;
	};

	Table.prototype.setShowPasteButton = function(bShowPasteButton) {
		if ((bShowPasteButton = !!bShowPasteButton) === this.getShowPasteButton()) {
			return this;
		}
		this.setProperty("showPasteButton", bShowPasteButton, true);
		if (bShowPasteButton && !this._oPasteButton && this._oToolbar) {
			this._oToolbar.insertEnd(this._getPasteButton(), 0);
			this._oPasteButton.setEnabled(this.getEnablePaste());
		} else if (this._oPasteButton) {
			this._oPasteButton.setVisible(bShowPasteButton);
			this._oPasteButton.setEnabled(this.getEnablePaste());
		}

		return this;
	};

	Table.prototype.setEnablePaste = function(bEnablePaste) {
		this.setProperty("enablePaste", bEnablePaste, true);
		if (this._oPasteButton) {
			this._oPasteButton.setEnabled(this.getEnablePaste());
		}
		return this;
	};

	/**
	 * Controls the visibility of the settings button.
	 *
	 * <b>Note:</b>
	 * <ul>
	 *   <li>This setting only takes effect when the given <code>p13nMode</code> makes the button visible.</li>
	 *   <li>Hiding the button also removes the option for the user to open the personalization dialog. This can lead to situations in which the user
	 *       can't adjust certain settings although it is required, for example, show some columns again when all columns are hidden.</li>
	 * </ul>
	 *
	 * @param {boolean} bShowP13nButton
	 * @since 1.108
	 * @private
	 * @ui5-restricted sap.fe
	 */
	Table.prototype._setShowP13nButton = function(bShowP13nButton) {
		this._bHideP13nButton = !bShowP13nButton;
		this._updateP13nButton();
	};

	Table.prototype._isP13nButtonHidden = function() {
		return this._bHideP13nButton;
	};

	Table.prototype._createToolbar = function() {
		if (this.isDestroyStarted()) {
			return;
		}

		if (!this._oToolbar) {
			this._oTitle = new Title(this.getId() + "-title", {
                text: "{$sap.ui.mdc.Table>/header}",
                level: "{$sap.ui.mdc.Table>/headerLevel}",
                titleStyle: this.getHeaderStyle() || TitleLevel[ThemeParameters.get({name: "_sap_ui_mdc_Table_HeaderStyle"})]
            });

            this._oTableTitle = new TableTitle(this.getId() + "-tableTitle", {
                title: this._oTitle,
                visible: "{$sap.ui.mdc.Table>/headerVisible}"
            });

			this._oToolbar = new ActionToolbar(this.getId() + "-toolbar", {
				design: ToolbarDesign[ThemeParameters.get({name: "_sap_ui_mdc_Table_ToolbarDesign"})],
				begin: [
					this._oTableTitle
				],
				end: [
					this._getCopyButton(), this._getPasteButton(), this._getP13nButton()
				],
				visible: "{= !${$sap.ui.mdc.Table>/hideToolbar} }"
			});

			this._updateInvisibleTitle();
		}

		const bResponsiveTable = this._isOfType(TableType.ResponsiveTable);
		this._oToolbar.setStyle(bResponsiveTable ? ToolbarStyle.Standard : ToolbarStyle.Clear);
		this._oTableTitle.setShowExtendedView(bResponsiveTable);

		return this._oToolbar;
	};

	Table.prototype._getVisibleProperties = function() {
		const aProperties = [];
		let sPropertyKey;

		this.getColumns().forEach((oMDCColumn, iIndex) => {
			sPropertyKey = oMDCColumn && oMDCColumn.getPropertyKey();
			if (sPropertyKey) {
				aProperties.push({
					key: sPropertyKey,
					/**
					 * @deprecated As of version 1.124.0
					 */
					name: sPropertyKey
				});
			}
		});

		return aProperties;
	};

	/**
	 * Returns the current filter conditions present on the table.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Table.prototype.getConditions = function() {
		//may only return conditions if the inner FilterBar has already been initialized
		return this.getInbuiltFilter() ? this.getInbuiltFilter().getConditions() : [];
	};

	Table.prototype._getSortedProperties = function() {
		const aSortConditions = this.getSortConditions() ? this.getSortConditions().sorters : [];
		aSortConditions.forEach((oSortCondition) => {
			addKeyOrName(oSortCondition);
		});
		return aSortConditions;
	};

	Table.prototype._getGroupedProperties = function() {
		const aGroupConditions = this.getGroupConditions() ? this.getGroupConditions().groupLevels : [];
		aGroupConditions.forEach((oGroupCondition) => {
			addKeyOrName(oGroupCondition);
		});
		return aGroupConditions;
	};

	Table.prototype._getAggregatedProperties = function() {
		return this.getAggregateConditions() ? this.getAggregateConditions() : {};
	};

	Table.prototype._getXConfig = function() {
		return this.getEngine().readXConfig(this);
	};

	/**
	 * Whether the table is filtered internally via the inbuilt filtering ({@link sap.ui.mdc.filterbar.p13n.AdaptationFilterBar}), or externally via
	 * the associated filter ({@link sap.ui.mdc.IFilter}).
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table.
	 * @return {boolean} Whether the table is filtered (internally or externally).
	 */
	function isFiltered(oTable) {
		const oFilter = Element.getElementById(oTable.getFilter());
		const aInternallyFilteredProperties = oTable.isFilteringEnabled() ? getFilteredProperties(oTable.getFilterConditions()) : [];
		const aExternallyFilteredProperties = getFilteredProperties(oFilter?.getConditions());
		return aInternallyFilteredProperties.length > 0 || aExternallyFilteredProperties.length > 0 || oFilter?.getSearch();
	}

	function getFilteredProperties(mConditions) {
		return Object.keys(mConditions || {}).filter((sProperty) => {
			return mConditions[sProperty].length > 0;
		});
	}

	/**
	 * Fetches the current state of the table (as a JSON).
	 *
	 * <b>Note:</b> Returns state information only for enabled personalization options, for example according to the <code>p13nMode</code> property.
	 *
	 * @private
	 * @returns {Object} Current state of the table
	 */
	Table.prototype.getCurrentState = function() {
		const oState = {};
		const aP13nMode = this.getActiveP13nModes();

		if (aP13nMode.indexOf("Column") > -1) {
			if (this.isInPropertyKeysMode()) {
				oState.items = this.getPropertyKeys().map((sKey) => ({
					key: sKey,
					/**
					 * @deprecated As of version 1.124.0
					 */
					name: sKey
				}));
			} else {
				oState.items = this._getVisibleProperties();
			}
		}

		if (this.isSortingEnabled()) {
			oState.sorters = this._getSortedProperties();
		}

		if (this.isFilteringEnabled()) {
			oState.filter = this.getFilterConditions();
		}

		if (this.isGroupingEnabled()) {
			oState.groupLevels = this._getGroupedProperties();
		}

		if (this.isAggregationEnabled()) {
			oState.aggregations = this._getAggregatedProperties();
		}

		if (this.getEnableColumnResize() || this._getType().showXConfigState()) {
			oState.xConfig = this._getXConfig();
			// The state might contain properties that are not used (for example if enableColumnResize is true and enableColumnFreeze is false).
			// This is not breaking any behavior, but we can optimize it in future by removing them.
		}

		return oState;
	};

	/**
	 * Checks whether filter personalization is enabled.
	 *
	 * @private
	 * @returns {boolean} Whether filter personalization is enabled
	 */
	Table.prototype.isFilteringEnabled = function() {
		return this.getActiveP13nModes().includes(TableP13nMode.Filter);
	};

	/**
	 * Checks whether sort personalization is enabled.
	 *
	 * @private
	 * @returns {boolean} Whether sort personalization is enabled
	 */
	Table.prototype.isSortingEnabled = function() {
		return this.getActiveP13nModes().includes(TableP13nMode.Sort);
	};

	/**
	 * Checks whether group personalization is enabled.
	 *
	 * @private
	 * @returns {boolean} Whether group personalization is enabled
	 */
	Table.prototype.isGroupingEnabled = function() {
		return this.getActiveP13nModes().includes(TableP13nMode.Group);
	};

	/**
	 * Checks whether aggregation personalization is enabled.
	 *
	 * @private
	 * @returns {boolean} Whether aggregation personalization is enabled
	 */
	Table.prototype.isAggregationEnabled = function() {
		return this.getActiveP13nModes().includes(TableP13nMode.Aggregate);
	};

	Table.prototype.getSupportedP13nModes = function() {
		let aSupportedP13nModes = Object.keys(TableP13nMode);

		if (this.isControlDelegateInitialized()) {
			aSupportedP13nModes = getIntersection(aSupportedP13nModes, this.getControlDelegate().getSupportedFeatures(this).p13nModes);
		}

		return aSupportedP13nModes;
	};

	function createActiveP13nModesMap(oTable) {
		const oAllP13nModes = new Set(Object.keys(TableP13nMode));
		const oEnabledP13nModes = new Set(oTable.getP13nMode());
		const oP13nModesSupportedByDelegate = new Set(oTable.isControlDelegateInitialized()
			? oTable.getControlDelegate().getSupportedFeatures(oTable).p13nModes
			: []);
		const oActiveP13nModes = oEnabledP13nModes.intersection(oP13nModesSupportedByDelegate);

		return Array.from(oAllP13nModes).reduce((oModes, sMode) => {
			oModes[sMode] = oActiveP13nModes.has(sMode);
			return oModes;
		}, {});
	}

	Table.prototype.getActiveP13nModes = function() {
		return getIntersection(this.getP13nMode(), this.getSupportedP13nModes());
	};

	function getIntersection(aArr1, aArr2) {
		return aArr1.filter((sValue) => {
			return aArr2.includes(sValue);
		});
	}

	Table.prototype._getP13nButton = function() {
		if (!this._oP13nButton) {
			this._oP13nButton = TableSettings.createSettingsButton(this.getId(), [function() {
				PersonalizationUtils.openSettingsDialog(this);
			}, this]);
		}
		this._updateP13nButton();
		return this._oP13nButton;
	};

	Table.prototype._updateP13nButton = function() {
		if (this._oP13nButton) {
			const aP13nMode = this.getActiveP13nModes();

			// Note: 'Aggregate' does not have a p13n UI, if only 'Aggregate' is enabled no settings icon is necessary
			const bAggregateP13nOnly = aP13nMode.length === 1 && aP13nMode[0] === "Aggregate";
			this._oP13nButton.setVisible(aP13nMode.length > 0 && !bAggregateP13nOnly && !this._bHideP13nButton);
		}
	};

	Table.prototype._getCopyButton = function() {
		if (window.isSecureContext && this.getCopyProvider()) {
			return TableSettings.createCopyButton(this.getId(), this.getCopyProvider());
		}
	};

	Table.prototype._getPasteButton = function() {
		if (this.getShowPasteButton()) {
			this._oPasteButton ??= TableSettings.createPasteButton(this.getId());
			return this._oPasteButton;
		}
	};

	Table.prototype._isExportEnabled = function() {
		return this.getEnableExport() &&
			this.isControlDelegateInitialized() &&
			this.getControlDelegate().getSupportedFeatures(this).export;
	};

	Table.prototype._updateExportButton = function() {
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

		this._oExportButton.setEnabled(MTableUtil.isExportable(this.getRowBinding()));
		this._oExportButton.setVisible(this._isExportEnabled());
	};

	/**
	 * Returns the export button if <code>enableExport</code> is <code>true</code>.
	 *
	 * @returns {null|sap.m.MenuButton} If <code>enableExport</code> property is set to <code>false</code> then returns null else export button
	 * @private
	 */
	Table.prototype._createExportButton = function() {
		return TableSettings.createExportButton(this.getId(), {
			"default": [
				function() {
					this._onExport();
				}, this
			],
			"exportAs": [
				function() {
					this._onExport(true);
				}, this
			]
		});
	};

	/**
	 * Creates the export column configuration.
	 *
	 * @param {object} mCustomConfig Custom settings for export
	 * @returns {Promise} Column configuration to be exported
	 * @private
	 */
	Table.prototype._createExportColumnConfiguration = function() {
		const aColumns = this.getColumns();

		return this._fullyInitialized().then(() => {
			return this.finalizePropertyHelper();
		}).then(() => {
			const oPropertyHelper = this.getPropertyHelper();
			let aSheetColumns = [];

			aColumns.forEach((oColumn) => {
				const aColumnExportSettings = oPropertyHelper.getColumnExportSettings(oColumn);
				aSheetColumns = aSheetColumns.concat(aColumnExportSettings);
			}, this);
			return aSheetColumns;
		});
	};

	Table.prototype.setSelectionMode = function(sSelectionMode) {
		const sOldSelectionMode = this.getSelectionMode();

		this.setProperty("selectionMode", sSelectionMode, true);

		if (sOldSelectionMode !== sSelectionMode) {
			this._updateExpandAllButton(true);
			this._updateCollapseAllButton(true);
		}

		return this;
	};

	/**
	 * Checks if collapse capabilities are enabled.
	 *
	 * @returns {boolean} whether collapse capabilities are enabled
	 */
	Table.prototype._isCollapseEnabled = async function() {
		if (!this.isControlDelegateInitialized()) {
			return false;
		}
		const oConfig = await this.getControlDelegate().fetchExpandAndCollapseConfiguration(this);
		let bAvailable = false;

		if ("collapseAll" in oConfig) {
			if (typeof oConfig.collapseAll !== "function") {
				throw new Error("TableDelegate#collapseAll: collapseAll needs to be a function");
			}
			bAvailable = true;
		}

		if ("collapseEntireNode" in oConfig && "isNodeExpanded" in oConfig) {
			if (typeof oConfig.collapseEntireNode !== "function") {
				throw new Error("TableDelegate#fetchExpandAndCollapseConfiguration: collapseEntireNode needs to be a function");
			}

			if (typeof oConfig.isNodeExpanded !== "function") {
				throw new Error("TableDelegate#isNodeExpanded: isNodeExpanded needs to be a function");
			}

			bAvailable = true;
		}

		return bAvailable;
	};

	/**
	 * Retrieves the "Collapse All" button. Creates the button if necessary.
	 *
	 * @param {boolean} bRecreate Whether the button should be recreated
	 * @private
	 */
	Table.prototype._updateCollapseAllButton = async function(bRecreate) {
		const bCollapseAllAvailable = await this._isCollapseEnabled();
		const bNeedCollapseAllButton = this._oToolbar != null && bCollapseAllAvailable;

		if (bNeedCollapseAllButton && (!this._oCollapseAllButton || bRecreate)) {
			if (this._oCollapseAllButton) {
				if (this._oToolbar && this._oToolbar.getEnd().includes(this._oCollapseAllButton)) {
					this._oToolbar.removeEnd(this._oCollapseAllButton);
				}
				this._oCollapseAllButton.destroy();
				this._oCollapseAllButton = null;
			}
			this._oCollapseAllButton = await this._createCollapseButton();
		}

		if (!this._oCollapseAllButton) {
			return;
		}

		if (this._oToolbar && !this._oToolbar.getEnd().includes(this._oCollapseAllButton)) {
			this._oToolbar.insertEnd(this._oCollapseAllButton, 0);
		}

		this._oCollapseAllButton.setEnabled(!MTableUtil.isEmpty(this.getRowBinding()));
		this._oCollapseAllButton.setVisible(bCollapseAllAvailable);
	};

	/**
	 * Checks if expand capabilities are enabled.
	 *
	 * @returns {boolean} whether expand capabilities are enabled
	 */
	Table.prototype._isExpandEnabled = async function() {
		if (!this.isControlDelegateInitialized()) {
			return false;
		}
		const oConfig = await this.getControlDelegate().fetchExpandAndCollapseConfiguration(this);
		let bAvailable = false;

		if ("expandAll" in oConfig) {
			if (typeof oConfig.expandAll !== "function") {
				throw new Error("TableDelegate#expandAll: expandAll needs to be a function");
			}
			bAvailable = true;
		}

		if ("expandEntireNode" in oConfig && "isNodeExpanded" in oConfig) {
			if (typeof oConfig.expandEntireNode !== "function") {
				throw new Error("TableDelegate#fetchExpandAndCollapseConfiguration: expandEntireNode needs to be a function");
			}

			if (typeof oConfig.isNodeExpanded !== "function") {
				throw new Error("TableDelegate#isNodeExpanded: isNodeExpanded needs to be a function");
			}

			bAvailable = true;
		}

		return bAvailable;
	};

	/**
	 * Retrieves the "Collapse All" button. Creates the button if necessary.
	 *
	 * @param {boolean} bRecreate Whether the button should be recreated
	 * @private
	 */
	Table.prototype._updateExpandAllButton = async function(bRecreate) {
		const bExpandAllAvailable = await this._isExpandEnabled();
		const bNeedExpandAllButton = this._oToolbar != null && bExpandAllAvailable;

		if (bNeedExpandAllButton && (!this._oExpandAllButton || bRecreate)) {
			if (this._oExpandAllButton) {
				if (this._oToolbar && this._oToolbar.getEnd().includes(this._oExpandAllButton)) {
					this._oToolbar.removeEnd(this._oExpandAllButton);
				}
				this._oExpandAllButton.destroy();
				this._oExpandAllButton = null;
			}
			this._oExpandAllButton = await this._createExpandButton();
		}

		if (!this._oExpandAllButton) {
			return;
		}

		if (this._oToolbar && !this._oToolbar.getEnd().includes(this._oExpandAllButton)) {
			this._oToolbar.insertEnd(this._oExpandAllButton, 0);
		}

		this._oExpandAllButton.setEnabled(!MTableUtil.isEmpty(this.getRowBinding()));
		this._oExpandAllButton.setVisible(bExpandAllAvailable);
	};

	/**
	 * Create an expand button for the toolbar.
	 *
	 * @returns {sap.m.Button|sap.m.MenuButton} either a button or a menu button
	 */
	Table.prototype._createExpandButton = async function() {
		const oConfiguration = await this.getControlDelegate().fetchExpandAndCollapseConfiguration(this);
		return this._createExpandCollapseButton(true, {
			tree: oConfiguration.expandAll,
			node: oConfiguration.expandEntireNode,
			isExpanded: oConfiguration.isNodeExpanded
		});
	};

	/**
	 * Create a collapse button for the toolbar.
	 *
	 * @returns {sap.m.Button|sap.m.MenuButton} either a button or a menu button
	 */
	Table.prototype._createCollapseButton = async function() {
		const oConfiguration = await this.getControlDelegate().fetchExpandAndCollapseConfiguration(this);
		return this._createExpandCollapseButton(false, {
			tree: oConfiguration.collapseAll,
			node: oConfiguration.collapseEntireNode,
			isExpanded: oConfiguration.isNodeExpanded
		});
	};

	/**
	 * Creates either an expand or collapse button as button or menu button.
	 *
	 * @param {*} bIsExpand whether the button should expand or collapse
	 * @param {object} mConfig configuration map that contains the expand/collapse methods
	 * @param {function} mConfig.tree method to expand/collapse the whole tree
	 * @param {function} mConfig.node method to expand/collapse a single node
	 * @param {function} mConfig.isExpanded method to check if a node is expanded
	 *
	 * @returns {sap.m.Button|sap.m.MenuButton} either a button or a menu button
	 * @private
	 */
	Table.prototype._createExpandCollapseButton = function(bIsExpand, mConfig) {
		const {tree: fnTree, node: fnNode, isExpanded: fnIsExpanded} = mConfig;

		if (this.getSelectionMode() === "None" || typeof fnNode !== "function" || typeof fnIsExpanded !== "function") {
			return TableSettings.createExpandCollapseButton(this.getId(), bIsExpand, () => fnTree(this));
		}

		const oMenuButton = TableSettings.createExpandCollapseMenuButton(this.getId(), bIsExpand, {
			"tree": () => fnTree(this),
			"node": () => {
				const aContexts = this.getSelectedContexts();
				return aContexts.length === 1 && fnNode(this, aContexts[0]);
			}
		});

		oMenuButton.attachBeforeMenuOpen(() => {
			const aContexts = this.getSelectedContexts();
			let bShowNodeOption;
			if (bIsExpand) {
				bShowNodeOption = aContexts.length === 1 && fnIsExpanded(this, aContexts[0]) !== undefined;
				// Expand node is enabled unless it is a leaf node
			} else {
				bShowNodeOption = aContexts.length === 1 && fnIsExpanded(this, aContexts[0]) === true;
				// Collapse node is enabled if the node is expanded
			}

			oMenuButton.getMenu().getItems()[0].setEnabled(fnTree !== undefined);
			oMenuButton.getMenu().getItems()[1].setEnabled(bShowNodeOption);
		});

		return oMenuButton;
	};

	/**
	 * Returns the label/header text of the column
	 * @param {string} sPath column key
	 * @returns {string|null} column label/header text. Returns null if no column or header/label text is available.
	 * @private
	 */
	Table.prototype._getColumnLabel = function(sPath) {
		const oPropertyHelper = this.getPropertyHelper();
		const mPropertyInfo = oPropertyHelper.getProperty(sPath);
		return mPropertyInfo && mPropertyInfo.label;
	};

	/**
	 * Allows manual triggering of the default export without the Export As features and resolves even if <code>preventDefault()</code> is called in
	 * the <code>beforeExport</code> event if no error is thrown.
	 *
	 * <b>Note:</b>
	 * <ul>
	 *   <li>Export must be enabled by setting the <code>enableExport</code> property to <code>true</code></li>
	 *   <li>The <code>sap.ui.export</code> library must be available.</li>
	 *   <li>The table must have at least one visible column.</li>
	 *   <li>Resolves even if <code>preventDefault()</code> is called in the <code>beforeExport</code> event if no error is thrown.</li>
	 * </ul>
	 *
	 * @private
	 * @ui5-restricted sap.ux.eng.fioriai.reuse
	 * @returns {Promise}
	 * <code>Promise</code> that resolves if the export is finished, rejects if the table does not have columns, the export is disabled,
	 * or the <code>sap.ui.export</code> library is unavailable.
	 */
	Table.prototype.triggerExport = function() {
		if (!this._isExportEnabled()) {
			return Promise.reject("Export is not enabled for this table.");
		}

		return this._onExport(false, true);
	};

	/**
	 * Triggers export via "sap.ui.export"/"Document Export Services" export functionality
	 *
	 * @param {boolean} bExportAs Controls whether the regular export or the Export As dialog is called
	 * @param {boolean} [bSuppressErrors=false] Indicates whether error messages are suppressed
	 * @returns {Promise} Resolves when the export process is finished
	 * @private
	 */
	Table.prototype._onExport = function(bExportAs, bSuppressErrors = false) {
		return this._createExportColumnConfiguration().then((aSheetColumns) => {

			// If no columns exist, show message and return without exporting
			if (!aSheetColumns || !aSheetColumns.length) {
				const sErrorMessage = Library.getResourceBundleFor("sap.ui.mdc").getText("table.NO_COLS_EXPORT");

				if (!bSuppressErrors) {
					sap.ui.require(["sap/m/MessageBox"], (MessageBox) => {
						MessageBox.error(sErrorMessage, {
							styleClass: (this.$() && this.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact" : ""
						});
					});
				}

				throw new Error(sErrorMessage);
			}

			const oRowBinding = this.getRowBinding();
			const fnGetColumnLabel = this._getColumnLabel.bind(this);
			const sExportFunctionName = bExportAs ? "exportAs" : "export";
			const oDefaultExportSettings = this.getDefaultExportSettings();
			const mExportSettings = {
				workbook: {
					columns: aSheetColumns,
					context: {
						title: this.getHeader()
					}
				},
				dataSource: oRowBinding,
				fileName: oDefaultExportSettings?.getFileName() || this.getHeader()
			};

			return this._getExportHandler().then((oHandler) => {
				oHandler[sExportFunctionName](mExportSettings, fnGetColumnLabel);
			});
		});
	};

	/**
	 * Loads the export library and export capabilities in parallel and
	 * returns an initialized <code>ExportHandler</code> instance. The
	 * instance will be cached for subsequent calls.
	 *
	 * @returns {Promise<sap.ui.export.ExportHandler>} Promise that resolves with an initialized <code>ExportHandler</code> instance
	 * @private
	 */
	Table.prototype._getExportHandler = function() {
		const that = this;

		if (this._oExportHandler) {
			return Promise.resolve(this._oExportHandler);
		}

		return new Promise((fnResolve, fnReject) => {
			Promise.all([
				that.getControlDelegate().fetchExportCapabilities(that), Library.load({name: "sap.ui.export"})
			]).then((aResult) => {
				const [oExportCapabilities] = aResult;

				sap.ui.require(["sap/ui/export/ExportHandler"], (ExportHandler) => {
					that._oExportHandler = new ExportHandler(oExportCapabilities);
					that._oExportHandler.attachBeforeExport(that._onBeforeExport, that);
					fnResolve(that._oExportHandler);
				});

			}).catch((vError) => {
				// If sap.ui.export is not loaded, show an error message and return without exporting
				if (!Library.all().hasOwnProperty("sap.ui.export")) {
					MessageBox.error(Library.getResourceBundleFor("sap.ui.mdc").getText("ERROR_MISSING_EXPORT_LIBRARY"));
				}

				fnReject(vError);
			});
		});
	};

	/**
	 * Generic event handler for <code>beforeExport</code> event of
	 * the referenced <code>ExportHandler</code>. The event parameters
	 * will be enhanced with table specific information and its own
	 * <code>beforeExport</code> is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent <code>beforeExport</code> event of the ExportHandler
	 * @private
	 */
	Table.prototype._onBeforeExport = function(oEvent) {
		const aFilters = oEvent.getParameter("filterSettings");
		const oHelper = this.getPropertyHelper();

		aFilters.forEach((oFilter) => {
			const oProperty = oHelper.getProperties().find((oPropertyInfo) => {
				return oPropertyInfo.path === oFilter.getProperty();
			});

			if (oProperty) {
				oFilter.setLabel(oProperty.label);
				oFilter.setType(oProperty.typeConfig.typeInstance);
			}
		});

		const bExecuteDefaultAction = this.fireBeforeExport({
			exportSettings: oEvent.getParameter("exportSettings"),
			userExportSettings: oEvent.getParameter("userExportSettings"),
			filterSettings: aFilters
		});

		if (!bExecuteDefaultAction) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Event handler for <code>keydown</code>.
	 * @param {object} oEvent The event object
	 * @private
	 */
	Table.prototype.onkeydown = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		if (isExportShortcut(oEvent)) {
			if (this._oExportButton && this._oExportButton.getEnabled() && this._isExportEnabled()) {
				this._onExport(true);
				oEvent.setMarked();
				oEvent.preventDefault();
			}
		}

		if (isOpenPersonalizationShortcut(oEvent)) {
			if (this._oP13nButton && this._oP13nButton.getVisible()) {
				this._oP13nButton.firePress();

				// Mark the event to ensure that parent handlers (e.g. FLP) can skip their processing if needed. Also prevent potential browser
				// defaults (e.g. Cmd+, opens browser settings on Mac).
				oEvent.setMarked();
				oEvent.preventDefault();
			}
		}
	};

	function isExportShortcut(oEvent) {
		return (oEvent.metaKey || oEvent.ctrlKey) && oEvent.shiftKey && oEvent.which === KeyCodes.E;
	}

	function isOpenPersonalizationShortcut(oEvent) {
		return (oEvent.metaKey || oEvent.ctrlKey) && oEvent.which === KeyCodes.COMMA;
	}

	Table.prototype._createTable = function() {
		const oType = this._getType();

		this._oTable = oType.createTable(this.getId() + "-innerTable");
		this._oRowTemplate = oType.createRowTemplate(this.getId() + "-innerTableRow");

		oType.updateTable();

		// let the inner table get the nodata aggregation from the mdc table
		if (this.getNoData()) {
			this.setNoData(this.getNoData());
		}

		if (this.getContextMenu()) {
			this.setContextMenu(this.getContextMenu());
		}

		updateFilterInfoBar(this);
		updateColumnMenu(this);

		this._updateInvisibleTitle();
	};

	Table.prototype._createColumnHeaderMenu = function() {
		if (this._oColumnHeaderMenu) {
			return;
		}

		this._oQuickActionContainer = new QuickActionContainer({table: this});
		this._oColumnHeaderMenu = new ColumnMenu({
			id: this.getId() + "-columnHeaderMenu",
			showTableSettingsButton: true
		});
		this._oColumnHeaderMenu.addAggregation("_quickActions", this._oQuickActionContainer);
		this.addDependent(this._oColumnHeaderMenu);

		FESRHelper.setSemanticStepname(this._oColumnHeaderMenu, "beforeOpen", "mdc:tbl:p13n:col");

		this._oColumnHeaderMenu.attachBeforeOpen(this._createColumnMenuContent, this);
	};

	Table.prototype._destroyColumnHeaderMenu = function() {
		this._oColumnHeaderMenu?.destroy();
		delete this._oColumnHeaderMenu;
		delete this._oQuickActionContainer;
	};

	Table.prototype._createColumnMenuContent = function(oEvent) {
		const oInnerColumn = oEvent.getParameter("openBy");
		const oColumn = this.getColumns()[oInnerColumn.getParent().indexOfColumn(oInnerColumn)];

		oEvent.preventDefault();

		this._oQuickActionContainer.setColumn(oColumn);

		this._fullyInitialized().then(() => {
			return this.finalizePropertyHelper();
		}).then(() => {
			this._oQuickActionContainer.initializeQuickActions();
			this._oColumnHeaderMenu.detachTableSettingsPressed(this._showTableP13nDialog, this);
			this._oColumnHeaderMenu.attachTableSettingsPressed(oColumn, this._showTableP13nDialog, this);
			this._oColumnHeaderMenu.setShowTableSettingsButton(this._isP13nSettingVisible());
			this._oColumnHeaderMenu.openBy(oInnerColumn, true);
			PersonalizationUtils.detectUserPersonalizationCompletion(this, this._oColumnHeaderMenu);
		});
	};

	Table.prototype._showTableP13nDialog = function(oEvent, oColumn) {
		PersonalizationUtils.openSettingsDialog(this, oColumn);
	};

	Table.prototype._isP13nSettingVisible = function() {
		const aP13nMode = this.getActiveP13nModes();

		// Note: 'Aggregate' does not have a p13n UI, if only 'Aggregate' is enabled no settings icon is necessary
		const bAggregateP13nOnly = aP13nMode.length === 1 && aP13nMode[0] === "Aggregate";
		return aP13nMode.length > 0 && !bAggregateP13nOnly && !this._bHideP13nButton;
	};

	/**
	 * Enable/Disable column resizing on the inner table based on <code>enableColumnResize</code> property of the MDC table
	 *
	 * @private
	 */
	Table.prototype._updateColumnResize = function() {
		const oType = this._getType();

		if (this.getEnableColumnResize()) {
			oType.enableColumnResize();
		} else {
			oType.disableColumnResize();
		}
	};

	Table.prototype._onColumnMove = function(mPropertyBag) {
		PersonalizationUtils.createColumnReorderChange(this, {
			column: mPropertyBag.column,
			index: mPropertyBag.newIndex
		});
	};

	Table.prototype._onRowPress = function(mPropertyBag) {
		if (this.getSelectionMode() !== TableSelectionMode.SingleMaster) {
			this.fireRowPress({
				bindingContext: mPropertyBag.bindingContext
			});
		}
	};

	Table.prototype._onSelectionChange = function(mPropertyBag) {
		this.fireSelectionChange({
			selectAll: mPropertyBag.selectAll
		});
	};

	Table.prototype._onColumnResize = function(mPropertyBag) {
		PersonalizationUtils.createColumnWidthChange(this, {
			column: mPropertyBag.column,
			width: mPropertyBag.width
		});
	};

	Table.prototype._insertInnerColumn = function(oColumn, iIndex) {
		if (!this._oTable) {
			return;
		}

		this._bForceRebind = true;
		this._getType().insertColumn(oColumn, iIndex);
	};

	Table.prototype.removeColumn = function(oColumn) {
		oColumn = this.removeAggregation("columns", oColumn, true);
		this._getType().removeColumn(oColumn);
		return oColumn;
	};

	Table.prototype.removeAllColumns = function() {
		const aRemovedColumns = this.removeAllAggregation("columns", true);
		const oType = this._getType();

		aRemovedColumns.forEach((oColumn) => {
			oType.removeColumn(oColumn);
		});

		return aRemovedColumns;
	};

	Table.prototype.addColumn = function(oColumn) {
		this.addAggregation("columns", oColumn, true);
		this._insertInnerColumn(oColumn);
		return this;
	};

	Table.prototype.insertColumn = function(oColumn, iIndex) {
		this.insertAggregation("columns", oColumn, iIndex, true);
		this._insertInnerColumn(oColumn, iIndex);
		return this;
	};

	/**
	 * Gets contexts that have been selected by the user.
	 *
	 * @returns {sap.ui.model.Context[]} The selected contexts
	 * @public
	 */
	Table.prototype.getSelectedContexts = function() {
		if (this.isControlDelegateInitialized()) {
			return this.getControlDelegate().getSelectedContexts(this);
		}

		return [];
	};

	/**
	 * Clears the selection.
	 *
	 * @public
	 */
	Table.prototype.clearSelection = function() {
		if (this.isControlDelegateInitialized()) {
			this.getControlDelegate().clearSelection(this);
		}
	};

	Table.prototype._registerInnerFilter = function(oFilter) {
		oFilter.attachSearch(this._rebind, this);
	};

	/**
	 * Checks whether the table is bound.
	 *
	 * @returns {boolean} Whether the table is bound
	 * @public
	 */
	Table.prototype.isTableBound = function() {
		return this._getType().isTableBound();
	};

	/**
	 * Event handler for binding dataRequested
	 *
	 * @private
	 */
	Table.prototype._onBindingDataRequested = function() {
		this._bSkipAnnounceTableUpdate = true;
	};

	/**
	 * Event handler for binding dataReceived
	 *
	 * @private
	 */
	Table.prototype._onBindingDataReceived = function() {
		this._bSkipAnnounceTableUpdate = false;
		this._updateRowCountForHeader();
	};

	/**
	 * Event handler for binding change
	 *
	 * @private
	 */
	Table.prototype._onBindingChange = function() {
		this.fireEvent("_bindingChange"); // consumed by sap.ui.mdc.valuehelp.content.MDCTable
		this._updateExpandAllButton();
		this._updateCollapseAllButton();
		this._updateExportButton();
		this._updateRowCountForHeader();
	};

	Table.prototype._updateRowCountForHeader = function() {
		if (this._bAnnounceTableUpdate && !this._bSkipAnnounceTableUpdate) {
			this._bAnnounceTableUpdate = false;
			const iCount = this.getRowBinding().getCount();
			MTableUtil.announceTableUpdate(this.getHeader(), (this.getShowRowCount() || iCount === 0) ? iCount : undefined);
		}
	};

	Table.prototype._updateColumnsBeforeBinding = function() {
		const aColumns = this.getColumns();
		const oPropertyHelper = this.getPropertyHelper();

		aColumns.forEach(function(oColumn) {
			const oProperty = oPropertyHelper.getProperty(oColumn.getPropertyKey());
			const aSortableProperties = oProperty?.getSortableProperties().map((oProperty) => oProperty.key) ?? [];
			const oSortCondition = this._getSortedProperties().find((oSortCondition) => aSortableProperties.includes(oSortCondition.key));
			let sSortOrder = SortOrder.None;

			if (oSortCondition) {
				sSortOrder = oSortCondition.descending ? SortOrder.Descending : SortOrder.Ascending;
			}

			this._getType().updateSortIndicator(oColumn, sSortOrder);
		}, this);
	};

	/**
	 * Returns the row binding instance of the table.
	 *
	 * <b>Note:</b>
	 * <ul>
	 *   <li>Do not use this API to keep the reference of the binding.</li>
	 *   <li>Do not trigger any actions on the binding that are the responsibility of the delegate, such as sorting and filtering.</li>
	 * </ul>
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @returns {sap.ui.model.Binding} The binding instance
	 */
	Table.prototype.getRowBinding = function() {
		return this._getType().getRowBinding();
	};

	Table.prototype._getRowBinding = function() {
		Log.error(this + ": The method '_getRowBinding' must not be used will be deleted soon. Use 'getRowBinding' instead.");
		return this.getRowBinding();
	};

	// TODO Util
	/**
	 * Static method for checking and wrapping binding event listeners
	 *
	 * @param {object} oBindingInfo The <code>bindingInfo</code> (or binding parameter) instance
	 * @param {object} sEventName The event name
	 * @param {object} fHandler The handler that is called internally
	 * @private
	 */
	Table._addBindingListener = function(oBindingInfo, sEventName, fHandler) {
		if (!oBindingInfo.events) {
			oBindingInfo.events = {};
		}

		if (!oBindingInfo.events[sEventName]) {
			oBindingInfo.events[sEventName] = fHandler;
		} else {
			// Wrap the event handler of the other party to add our handler.
			const fOriginalHandler = oBindingInfo.events[sEventName];
			oBindingInfo.events[sEventName] = function() {
				fHandler.apply(this, arguments);
				fOriginalHandler.apply(this, arguments);
			};
		}
	};

	/**
	 * Rebinds the table rows.
	 *
	 * @param {boolean} [bForceRefresh] Indicates that the binding must be refreshed regardless of any <code>bindingInfo</code> change
	 * @returns {Promise} A <code>Promise</code> that resolves after rebind is executed
	 * @private
	 */
	Table.prototype._rebind = async function(bForceRefresh = false) {
		const oBindingInfo = {};

		await this._fullyInitialized(); // Can be changed to initialized after removal of the CreationRow.
		this.getControlDelegate().updateBindingInfo(this, oBindingInfo);
		this._finalizeBindingInfo(oBindingInfo);
		this._oTable.setShowOverlay(false);
		this._updateColumnsBeforeBinding();
		this.getControlDelegate().updateBinding(this, oBindingInfo, this._bForceRebind ? null : this.getRowBinding(), {
			forceRefresh: bForceRefresh || this._bForceRefreshBinding || false
		});
		this._updateInnerTableNoData();
		this._bForceRebind = false;
		this._bForceRefreshBinding = false;
	};

	Table.prototype._finalizeBindingInfo = function(oBindingInfo) {
		if (this._oRowTemplate) {
			oBindingInfo.template = this._oRowTemplate;
			oBindingInfo.templateShareable = true;
		} else {
			delete oBindingInfo.template;
		}

		Table._addBindingListener(oBindingInfo, "dataRequested", this._onBindingDataRequested.bind(this));
		Table._addBindingListener(oBindingInfo, "dataReceived", this._onBindingDataReceived.bind(this));
		Table._addBindingListener(oBindingInfo, "change", this._onBindingChange.bind(this));
	};

	Table.prototype._onPaste = function(mPropertyBag) {
		if (this.getEnablePaste()) {
			this.firePaste({
				data: mPropertyBag.data
			});
		}
	};

	/**
	 * Terminates the <code>MDCTable</code> control.
	 * @private
	 */
	Table.prototype.exit = function() {
		this._onAfterInitialization("Destroyed");
		this._onAfterFullInitialization("Destroyed");

		// Cleanup plugins before the plugin owner is destroyed
		MTableUtil.cleanupPluginsBeforeDestroy(this);

		// Destroy destructible elements and delete references.
		[
			"_oTable",
			"_oTitle",
			"_oTableTitle",
			"_vNoData",
			"_oContextMenu",
			"_oTableReady",
			"_oFullInitialize",
			"_oPasteButton",
			"_oP13nButton",
			"_oRowTemplate",
			"_oToolbar",
			"_oFilterInfoBarInvisibleText",
			"_oColumnHeaderMenu",
			"_oManagedObjectModel",
			"_oDefaultType",
			"_oInvisibleTitle"
		].concat((() => aToolBarBetweenAggregations.map((sAggregationName) => "_o" + capitalize(sAggregationName)))()).forEach((sField) => {
			this[sField]?.destroy?.();
			delete this[sField];
		});

		Control.prototype.exit.apply(this, arguments);
	};

	/**
	 * Handler for theme changes
	 */
	Table.prototype.onThemeChanged = function() {
		this._oManagedObjectModel.setProperty("/@custom/toolbarButtonType", TableSettings.getToolbarButtonType());

		if (this._oToolbar) {
			const sToolBarDesign = ToolbarDesign[ThemeParameters.get({name: "_sap_ui_mdc_Table_ToolbarDesign"})];
			this._oToolbar.setDesign(sToolBarDesign);
		}

		if (!this.getHeaderStyle()) {
			const sHeaderStyle = TitleLevel[ThemeParameters.get({name: "_sap_ui_mdc_Table_HeaderStyle"})];
			this._oTitle?.setTitleStyle(sHeaderStyle);
			this.getVariant()?.setTitleStyle(sHeaderStyle);
		}
	};

	/**
	 * Allows programmatic configuration of the table's selection state
	 * @param {Array<sap.ui.model.Context>} aContexts Contexts which should be selected
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Table.prototype._setSelectedContexts = function(aContexts) {
		this.getControlDelegate().setSelectedContexts(this, aContexts);
	};

	Table.prototype._updateVariantManagementStyle = function() {
		const oVariantManagement = this.getVariant();

		if (oVariantManagement) {
			oVariantManagement.setShowAsText(this.getHeaderVisible());
			oVariantManagement.setHeaderLevel(this.getHeaderLevel());
			oVariantManagement.setTitleStyle(this.getHeaderStyle() || TitleLevel[ThemeParameters.get({name: "_sap_ui_mdc_Table_HeaderStyle"})]);
		}
	};

	/**
	 * Adds an action to the {@link #getActions actions} aggregation.
	 *
	 * @name sap.ui.mdc.Table#addAction
	 * @function
	 * @param {sap.ui.core.Control} oAction Additional action that will be available in the toolbar.
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Destroys all actions in the {@link #getActions actions} aggregation.
	 *
	 * @name sap.ui.mdc.Table#destroyActions
	 * @function
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Inserts an action into the {@link #getActions actions} aggregation.
	 *
	 * @name sap.ui.mdc.Table#insertAction
	 * @function
	 * @param {sap.ui.core.Control} oAction The action to be inserted
	 * @param {int} iIndex the <code>0</code>-based index the managed object should be inserted at; for a negative
	 * value <code>iIndex</code>, <code>oObject</code> is inserted at position 0; for a value
	 * greater than the current size of the aggregation, <code>oObject</code> is inserted at
	 * the last position
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Removes an action from the {@link #getActions actions} aggregation.
	 *
	 * @name sap.ui.mdc.Table#removeAction
	 * @function
	 * @param {int|string|sap.ui.core.Control} oAction The action to be removed or its index or id
	 * @returns {sap.ui.core.Control} The removed action or <code>null</code>
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Removes all actions from the {@link #getActions actions} aggregation.
	 *
	 * @name sap.ui.mdc.Table#removeAllActions
	 * @function
	 * @returns {sap.ui.core.Control[]} An array of the removed actions or an empty array
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Adds a column to the {@link #getColumns columns} aggregation.
	 *
	 * @name sap.ui.mdc.Table#addColumn
	 * @function
	 * @param {sap.ui.mdc.table.Column} oColumn Additional column that will be available in the table.
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Destroys all columns in the {@link #getColumns columns} aggregation.
	 *
	 * @name sap.ui.mdc.Table#destroyColumns
	 * @function
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Inserts a column into the {@link #getColumns columns} aggregation.
	 *
	 * @name sap.ui.mdc.Table#insertColumn
	 * @function
	 * @param {sap.ui.mdc.table.Column} oColumn The column to be inserted
	 * @param {int} iIndex the <code>0</code>-based index the managed object should be inserted at; for a negative
	 * value <code>iIndex</code>, <code>oObject</code> is inserted at position 0; for a value
	 * greater than the current size of the aggregation, <code>oObject</code> is inserted at
	 * the last position
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Removes a column from the {@link #getColumns columns} aggregation.
	 *
	 * @name sap.ui.mdc.Table#removeColumn
	 * @function
	 * @param {int|string|sap.ui.mdc.table.Column} oColumn The column to be removed or its index or id
	 * @returns {sap.ui.mdc.table.Column} The removed column or <code>null</code>
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Removes all columns from the {@link #getColumns columns} aggregation.
	 *
	 * @name sap.ui.mdc.Table#removeAllColumns
	 * @function
	 * @returns {sap.ui.mdc.table.Column[]} An array of the removed columns or an empty array
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Sets a new value for the {@link #getSortConditions sortConditions} property.
	 *
	 * @name sap.ui.mdc.Table#setSortConditions
	 * @function
	 * @param {object} oSortConditions SortConditions set on the table
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Gets the current value of the {@link #getSortConditions sortConditions} property.
	 *
	 * @name sap.ui.mdc.Table#getSortConditions
	 * @function
	 * @returns {object} The sort conditions set on the table
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Sets a new value for the {@link #getFilterConditions filterConditions} property.
	 *
	 * @name sap.ui.mdc.Table#setFilterConditions
	 * @function
	 * @param {object} oFilterConditions FilterConditions set on the table
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Gets the current value of the {@link #getFilterConditions filterConditions} property.
	 *
	 * @name sap.ui.mdc.Table#getFilterConditions
	 * @function
	 * @returns {object} The filter conditions set on the table
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Sets a new value for the {@link #getGroupConditions groupConditions} property.
	 *
	 * @name sap.ui.mdc.Table#setGroupConditions
	 * @function
	 * @param {object} oGroupConditions GroupConditions set on the table
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Gets the current value of the {@link #getGroupConditions groupConditions} property.
	 *
	 * @name sap.ui.mdc.Table#getGroupConditions
	 * @function
	 * @returns {object} The group conditions set on the table
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Sets a new value for the {@link #getAggregateConditions aggregateConditions} property.
	 *
	 * @name sap.ui.mdc.Table#setAggregateConditions
	 * @function
	 * @param {object} oAggregateConditions AggregateConditions set on the table
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Gets the current value of the {@link #getAggregateConditions aggregateConditions} property.
	 *
	 * @name sap.ui.mdc.Table#getAggregateConditions
	 * @function
	 * @returns {object} The aggregate conditions set on the table
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Sets a new value for the {@link #getPropertyInfo propertyInfo} property.
	 *
	 * @name sap.ui.mdc.Table#setPropertyInfo
	 * @function
	 * @param {Array.<sap.ui.mdc.table.PropertyInfo|sap.ui.mdc.table.ComplexPropertyInfo>} aPropertyInfo
	 * 	The property info objects containing the metadata for a table
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Gets the current value of the {@link #getPropertyInfo propertyInfo} property.
	 *
	 * @name sap.ui.mdc.Table#getPropertyInfo
	 * @function
	 * @returns {Array.<sap.ui.mdc.table.PropertyInfo|sap.ui.mdc.table.ComplexPropertyInfo>}
	 * 	The property info objects containing the metadata for a table
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Sets a new value for the {@link #getPropertyKeys propertyKeys} property.
	 *
	 * @name sap.ui.mdc.Table#setPropertyKeys
	 * @function
	 * @param {string[]} aPropertyKeys Ordered list of property keys
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * Gets the current value of the {@link #getPropertyKeys propertyKeys} property.
	 *
	 * @name sap.ui.mdc.Table#getPropertyKeys
	 * @function
	 * @returns {string[]} The property keys
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	FilterIntegrationMixin.call(Table.prototype);
	DynamicPropertiesMixin.call(Table.prototype, {aggregation: "columns"});
	ActionToolbarMixin.call(Table.prototype);

	return Table;
});