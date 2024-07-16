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
	"./mixin/FilterIntegrationMixin",
	"sap/m/Text",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/Title",
	"sap/m/OverflowToolbar",
	"sap/m/library",
	"sap/m/table/Util",
	"sap/m/table/columnmenu/Menu",
	"sap/m/MessageBox",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/format/ListFormat",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/BindingMode",
	"sap/base/strings/capitalize",
	"sap/base/util/deepEqual",
	"sap/base/util/Deferred",
	"sap/ui/core/InvisibleText",
	"sap/ui/mdc/p13n/subcontroller/ColumnController",
	"sap/ui/mdc/p13n/subcontroller/SortController",
	"sap/ui/mdc/p13n/subcontroller/FilterController",
	"sap/ui/mdc/p13n/subcontroller/GroupController",
	"sap/ui/mdc/p13n/subcontroller/AggregateController",
	"sap/m/table/ColumnWidthController",
	"sap/ui/mdc/actiontoolbar/ActionToolbarAction",
	"sap/ui/mdc/table/menu/QuickActionContainer",
	"sap/ui/mdc/table/menu/ItemContainer",
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
	"sap/ui/mdc/enums/TableRowCountMode"
], (
	Control,
	ActionToolbar,
	TableSettings,
	GridTableType,
	TreeTableType,
	ResponsiveTableType,
	PropertyHelper,
	PersonalizationUtils,
	FilterIntegrationMixin,
	Text,
	ToolbarSpacer,
	Button,
	Title,
	OverflowToolbar,
	MLibrary,
	MTableUtil,
	ColumnMenu,
	MessageBox,
	Element,
	Library,
	NumberFormat,
	ListFormat,
	coreLibrary,
	KeyCodes,
	ManagedObjectModel,
	BindingMode,
	capitalize,
	deepEqual,
	Deferred,
	InvisibleText,
	ColumnController,
	SortController,
	FilterController,
	GroupController,
	AggregateController,
	ColumnWidthController,
	ActionToolbarAction,
	QuickActionContainer,
	ItemContainer,
	ThemeParameters,
	Log,
	FESRHelper,
	TableMultiSelectMode,
	TableSelectionMode,
	TableP13nMode,
	TableType
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
	 * An object literal describing a data property in the context of an {@link sap.ui.mdc.Table}.
	 *
	 * When specifying the <code>PropertyInfo</code> objects in the {@link sap.ui.mdc.Table#getPropertyInfo propertyInfo} property, the
	 * following attributes need to be specified:
	 * <ul>
	 *   <li><code>key</code></li>
	 *   <li><code>path</code></li>
	 *   <li><code>dataType</code></li>
	 *   <li><code>formatOptions</code></li>
	 *   <li><code>constraints</code></li>
	 *   <li><code>maxConditions</code></li>
	 *   <li><code>caseSensitive</code></li>
	 *   <li><code>visualSettings.widthCalculation</code></li>
	 *   <li><code>propertyInfos</code></li>
	 *   <li><code>groupable</code></li>
	 *   <li><code>isKey</code></li>
	 *   <li><code>unit</code></li>
	 *   <li><code>text</code></li>
	 * </ul>
	 *
	 * If the property is complex, the following attributes need to be specified:
	 * <ul>
	 *   <li><code>key</code></li>
	 *   <li><code>visualSettings.widthCalculation</code></li>
	 *   <li><code>propertyInfos</code> (all referenced properties must be specified)</li>
	 * </ul>
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
	 *   Name of the unit property that is related to this property.
	 * @property {string} [text]
	 *   Name of the text property that is related to this property in a 1:1 relation.
	 * @property {object} [exportSettings]
	 *   Object that contains information about the export settings, see {@link sap.ui.export.Spreadsheet}.
	 * @property {object} [clipboardSettings]
	 *   Object that contains information about the clipboard settings. Setting this value to <code>null</code> disables the copy function.
	 * @property {string} [clipboardSettings.template]
	 *   Defines the formatting template that supports indexed placeholders of <code>propertyInfos</code> within curly brackets, for example, "{0} ({1})".
	 * @property {Object} [visualSettings]
	 *   This object contains all relevant properties for visual adjustments.
	 * @property {Object} [visualSettings.widthCalculation]
	 *   This object contains all properties and their default values for the column width calculation
	 * @property {int} [visualSettings.widthCalculation.minWidth=2]
	 *   The minimum content width in rem
	 * @property {int} [visualSettings.widthCalculation.maxWidth=19]
	 *   The maximum content width in rem
	 * @property {int} [visualSettings.widthCalculation.defaultWidth=8]
	 *   The default column content width when type check fails
	 * @property {float} [visualSettings.widthCalculation.gap=0]
	 *   The additional content width in rem
	 * @property {boolean} [visualSettings.widthCalculation.includeLabel=true]
	 *   Whether the label should be taken into account
	 * @property {boolean} [visualSettings.widthCalculation.truncateLabel=true]
	 *   Whether the label should be trucated or not
	 * @property {boolean} [visualSettings.widthCalculation.verticalArrangement=false]
	 *   Whether the referenced properties are arranged vertically
	 * @property {string[]} [visualSettings.widthCalculation.excludeProperties]
	 *   A list of invisible referenced property names
	 * @property {string[]} [propertyInfos]
	 *   The availability of this property makes the <code>PropertyInfo</code> a complex <code>PropertyInfo</code>. Provides a list of related
	 *   properties (by name). These related properties must not themselves be complex.
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.mdc.table.PropertyInfo} sap.ui.mdc.odata.v4.TablePropertyInfo
	 *
	 * An object literal describing a data property in the context of a {@link sap.ui.mdc.Table} with {@link module:sap/ui/mdc/odata/v4/TableDelegate sap/ui/mdc/odata/v4/TableDelegate}.
	 *
	 * When specifying the <code>PropertyInfo</code> objects in the {@link sap.ui.mdc.Table#getPropertyInfo propertyInfo} property, the following
	 * attributes need to be specified:
	 * <ul>
	 *   <li><code>key</code></li>
	 *   <li><code>path</code></li>
	 *   <li><code>dataType</code></li>
	 *   <li><code>formatOptions</code></li>
	 *   <li><code>constraints</code></li>
	 *   <li><code>maxConditions</code></li>
	 *   <li><code>caseSensitive</code></li>
	 *   <li><code>visualSettings.widthCalculation</code></li>
	 *   <li><code>propertyInfos</code></li>
	 *   <li><code>groupable</code></li>
	 *   <li><code>isKey</code></li>
	 *   <li><code>unit</code></li>
	 *   <li><code>text</code></li>
	 *   <li><code>aggregatable</code></li>
	 *   <li><code>extension.technicallyGroupable</code></li>
	 *   <li><code>extension.technicallyAggregatable</code></li>
	 *   <li><code>extension.customAggregate</code></li>
	 *   <li><code>extension.customAggregate.contextDefiningProperties</code></li>
	 * </ul>
	 *
	 * If the property is complex, the following attributes need to be specified:
	 * <ul>
	 *   <li><code>key</code></li>
	 *   <li><code>visualSettings.widthCalculation</code></li>
	 *   <li><code>propertyInfos</code> (all referenced properties must be specified)</li>
	 * </ul>
	 *
	 * @property {boolean} [aggregatable=false]
	 *   Defines whether a property is aggregatable.
	 * @property {Object} [extension]
	 *   Contains model-specific information.
	 * @property {boolean} [extension.technicallyGroupable=false]
	 *   If <code>groupable</code> is set to <code>false</code> to exclude it from group personalization on the UI, the UI still needs to know that
	 *   this property is groupable for data requests.
	 * @property {boolean} [extension.technicallyAggregatable=false]
	 *   If <code>aggregatable</code> is set to <code>false</code> to exclude it from aggregate personalization on the UI, the UI still needs to know
	 *   that this property is aggregatable for data requests.
	 * @property {Object} [extension.customAggregate]
	 *   Provide an object, it can be empty, if there is a <code>CustomAggregate</code> whose <code>Qualifier</code> is equal to the name of this
	 *   property. This enables the option to show totals if <code>aggregatable</code> is <code>true</code>.
	 * @property {string[]} [extension.customAggregate.contextDefiningProperties]
	 *   A list of related properties (by name) that are the context-defining properties of the <code>CustomAggregate</code>.
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
	 * {@link sap.ui.mdc.table.PropertyInfo}.
	 *
	 * <b>Note:</b> Read and write access to internal elements is not permitted. Such elements are, for example, the inner table including its
	 * children. This is independent of how access was gained. Internal elements and their types are subject to change without notice.
	 *
	 * @extends sap.ui.mdc.Control
	 * @borrows sap.ui.mdc.mixin.FilterIntegrationMixin.rebind as #rebind
	 * @author SAP SE
	 * @since 1.58
	 * @alias sap.ui.mdc.Table
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
				 * Personalization options for the table.
				 *
				 * <b>Note:</b> Whether a personalization option is supported depends on the used delegate. Please refer to the documentation of the
				 * individual delegates. The order of the provided options does not influence their order on the UI.
				 *
				 * @since 1.62
				 */
				p13nMode: {
					type: "sap.ui.mdc.enums.TableP13nMode[]",
					group: "Behavior",
					defaultValue: []
				},

				/**
				 * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
				 * The object has the following properties:
				 * <ul>
				 * 	<li><code>name</code> defines the path to the <code>Delegate</code> module. The used delegate module must inherit from
				 *      {@link module:sap/ui/mdc/TableDelegate TableDelegate}</li>.
				 * 	<li><code>payload</code> (optional) defines application-specific information that can be used in the given delegate</li>
				 * </ul>
				 * <i>Sample delegate object:</i>
				 * <pre><code>{
				 * 	name: "sap/ui/mdc/TableDelegate",
				 * 	payload: {}
				 * }</code></pre>
				 *
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. This property can only be configured during control initialization.
				 *
				 */
				delegate: {
					type: "object",
					defaultValue: {
						name: "sap/ui/mdc/TableDelegate",
						payload: {}
					}
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
				 * @experimental
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
				 * <b>Note:</b> This property only takes effect if it is set to a positive integer value. Otherwise the table uses a type-dependent
				 * default value.
				 *
				 * @since 1.63
				 */
				threshold: {
					type: "int",
					group: "Appearance",
					defaultValue: -1
				},

				/**
				 * Defines the sort conditions.
				 *
				 * <b>Note:</b> This property must not be bound.<br>
				 * This property is used exclusively for handling SAPUI5 flexibility changes. Do not use it otherwise.
				 *
				 * @since 1.73
				 */
				sortConditions: {
					type: "object"
				},

				/**
				 * Defines the filter conditions.
				 *
				 * <b>Note:</b> This property must not be bound.<br>
				 * This property is used exclusively for handling SAPUI5 flexibility changes. Do not use it otherwise.
				 *
				 * @since 1.80.0
				 */
				filterConditions: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * Defines the group conditions.
				 *
				 * <b>Note:</b> This property must not be bound.<br>
				 * This property is used exclusively for handling SAPUI5 flexibility changes. Do not use it otherwise.
				 *
				 * @since 1.87
				 */
				groupConditions: {
					type: "object"
				},

				/**
				 * Defines the aggregate conditions.
				 *
				 * <b>Note:</b> This property must not be bound.<br>
				 * This property is exclusively used for handling SAPUI5 flexibility changes. Do not use it otherwise.
				 *
				 * @since 1.87
				 */
				aggregateConditions: {
					type: "object"
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
				 * 	<li>Table type is not {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}. This is subject to change in the
				 *      future.</li>
				 * 	<li>Selection mode is not <code>Multi</code>.</li>
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
				 * <code>PropertyInfo</code> objects, specifying an array of {@link sap.ui.mdc.table.PropertyInfo PropertyInfo} objects here
				 * enables the table to speed up the initial setup.
				 *
				 * Instead of requesting the <code>PropertyInfo</code> objects from the <code>TableDelegate</code> and waiting for them, the table
				 * will use the <code>PropertyInfo</code> objects specified here for rendering-specific tasks, e.g. automatic column width
				 * calculation, and to trigger the initial data request.
				 *
				 * To enable the table for these tasks, certain attributes of a <code>PropertyInfo</code> must be specified. You can
				 * find the list of required attributes in the documentation of the <code>PropertyInfo</code>, for example, in
				 * {@link sap.ui.mdc.table.PropertyInfo}.
				 *
				 * This property is processed only once during the instantiation of the table. Any subsequent changes have no effect.
				 *
				 * <b>Note</b>: This property must not be bound.
				 * <b>Note</b>: This property is used exclusively for SAPUI5 flexibility / Fiori Elements. Do not use it otherwise.
				 *
				 * @since 1.111
				 */
				propertyInfo: {
					type: "object",
					defaultValue: []
				},

				/**
				 * Determines whether the toolbar is visible.
				 *
				 * <b>Note:</b> Hiding the toolbar limits the functionality of the table in the following ways:<br>
				 * <ul>
				 * 	<li>The <code>showRowCount</code> property <b>must</b> be set to <code>false</code>.</li>
				 * 	<li>The export <b>must</b> be disabled by setting the <code>enableExport</code> property to <code>false</code>.</li>
				 * 	<li>For {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}, show and hide details won't be visible as the table will always run in "Show Details" mode.</li>
				 * 	<li>Copy and paste will only work via keyboard.</li>
				 * 	<li>For {@link sap.ui.mdc.table.TreeTableType TreeTable}, "Collapse All" and "Expand All" won't be possible.</li>
				 * 	<li>The <code>actions</code> and the <code>quickFilter</code> aggregations and a table-related {@link sap.ui.fl.variants.VariantManagement} <b>must not</b> be used.</li>
				 * 	<li>The table title will not be displayed but will be replaced by an <code>InvisibleText</code>. The <code>header</code> property <b>must</b> be set. In addition, <code>headerVisible</code> <b>must</b> be set to <code>false</code> to ensure accessibility compatibility.</li>
				 * 	<li>Personalization (<code>p13nMode</code>) can still be used via the column headers. If the option to show or hide columns is activated, it is recommended to use an {@link sap.m.IllustratedMessage} for the <code>nodata</code> display. It ensures that columns can be made visible again when the user has accidentally hidden them all.</li>
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
				 * <b>Note:</b>
				 * This aggregation is managed by the control, can only be populated during the definition in the XML view, and is not bindable.
				 * Any changes of the initial aggregation content might result in undesired effects.
				 * Changes of the aggregation have to be made with the {@link sap.ui.mdc.p13n.StateUtil StateUtil}.
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
				 * @experimental Do not use
				 * @deprecated As of version 1.124, the concept has been discarded.
				 */
				creationRow: {
					type: "sap.ui.mdc.table.CreationRow",
					multiple: false
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
				 * managed by the application.<br>
				 * The <code>CopyProvider</code> requires a secure context to access the clipboard API. If the context is not secure, the plugin will
				 * not be added, and the Copy button will not be generated.
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
						 * <b>Note:</b> The <code>exportSettings</code> parameter can be modified by the listener.
						 * Thus the parameter can be different if multiple listeners are registered which manipulate the parameter.
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

	FilterIntegrationMixin.call(Table.prototype);

	const aToolBarBetweenAggregations = ["variant", "quickFilter"];

	/**
	 * Create setter and getter for aggregation that are passed to ToolBar aggregation named "Between"
	 * Several different Table aggregations are passed to the same ToolBar aggregation (Between)
	 */
	aToolBarBetweenAggregations.forEach((sAggregationName) => {
		const sCapAggregationName = capitalize(sAggregationName),
			sPropertyName = "_o" + sCapAggregationName,
			sGetter = "get" + sCapAggregationName,
			sSetter = "set" + sCapAggregationName,
			sDestroyer = "destroy" + sCapAggregationName;
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
			const oToolBar = this._createToolbar(),
				bNewValue = oControl !== this[sPropertyName];
			if (!oControl || bNewValue) {
				oToolBar.removeBetween((this[sGetter]()));
				this[sPropertyName] = oControl;
			}
			if (bNewValue && oControl) {
				this._setToolbarBetween(oToolBar);
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

		// indicates whether binding the table is inevitable or not
		this._bForceRebind = true;

		this._setPropertyHelperClass(PropertyHelper);
		this._setupPropertyInfoStore("propertyInfo");

		this._oManagedObjectModel = new ManagedObjectModel(this);
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
		if (sEventId == "rowPress") {
			this._getType().prepareRowPress();
		}
		return this;
	};

	Table.prototype.detachEvent = function(sEventId) {
		Control.prototype.detachEvent.apply(this, arguments);
		if (sEventId == "rowPress") {
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

		if (!this._oTable) {
			return this;
		}

		this._oTable.setAggregation("contextMenu", oContextMenu, true);

		if (!oContextMenu) {
			this._oTable.detachBeforeOpenContextMenu(this._onBeforeOpenContextMenu, this);
			return this;
		}

		if (!this._oTable.hasListeners("beforeOpenContextMenu")) {
			this._oTable.attachBeforeOpenContextMenu(this._onBeforeOpenContextMenu, this);
		}

		return this;
	};

	Table.prototype._onBeforeOpenContextMenu = function(oEvent) {
		const oEventParameters = this._getType().getContextMenuParameters(oEvent);
		!this.fireBeforeOpenContextMenu(oEventParameters) && oEvent.preventDefault();
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
		if (!this.bCreated ) {
			return this.setAggregation("type", vType, true);
		}

		// Remove the toolbar from the table to avoid its destruction when the table is destroyed. Do this only when a toolbar exists to not
		// create an unnecessary default type instance. Because the removal operation is specific to a table type, the old type has to remove the
		// toolbar before the new type is set.
		if (this._oToolbar) {
			this._getType().removeToolbar();
		}

		this._destroyDefaultType();
		this.setAggregation("type", vType);

		if (this._oTable) {
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

		this._createInitPromises();
		this._initializeContent();

		return this;
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

	Table.prototype.setHeaderLevel = function(sLevel) {
		if (this.getHeaderLevel() === sLevel) {
			return this;
		}
		this.setProperty("headerLevel", sLevel, true);
		this._oTitle && this._oTitle.setLevel(sLevel);
		return this;
	};

	Table.prototype.setHeaderStyle = function(sStyle) {
		if (this.getHeaderStyle() === sStyle) {
			return this;
		}
		this.setProperty("headerStyle", sStyle, true);
		this._oTitle?.setTitleStyle(this.getHeaderStyle() || TitleLevel[ThemeParameters.get({name: "_sap_ui_mdc_Table_HeaderStyle"})]);
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
				aAffectedP13nControllers.indexOf("Filter") > -1
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

		if (fCheckIfRebindIsRequired(aAffectedP13nControllers) && this.isTableBound()) {
			await this.finalizePropertyHelper();
			await this.rebind();
		}
	};

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

		if (!deepEqual(aOldP13nMode.sort(), this.getP13nMode().sort())) {
			updateP13nSettings(this);
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

		const mRegistryOptions = {
			Column: new ColumnController({control: this, stableKeys: aStableKeys}),
			Sort: new SortController({control: this}),
			Group: new GroupController({control: this}),
			Filter: new FilterController({control: this}),
			Aggregate: new AggregateController({control: this}),
			ColumnWidth: new ColumnWidthController({control: this, exposeXConfig: true})
		};

		this.getActiveP13nModes().forEach((sMode) => {
			oRegisterConfig.controller[sMode] = mRegistryOptions[sMode];
		});

		if (this.getEnableColumnResize()) {
			oRegisterConfig.controller["ColumnWidth"] = mRegistryOptions["ColumnWidth"];
		}

		this.getEngine().register(this, oRegisterConfig);
	};

	function updateP13nSettings(oTable) {
		oTable._updateP13nButton();

		if (oTable._oTable) {
			const oDnDColumns = oTable._oTable.getDragDropConfig()[0];
			if (oDnDColumns) {
				oDnDColumns.setEnabled(oTable.getActiveP13nModes().indexOf("Column") > -1);
			}
		}

		if (oTable.isFilteringEnabled()) {
			insertFilterInfoBar(oTable);
		}

		updateFilterInfoBar(oTable);
	}

	Table.prototype.setFilterConditions = function(mConditions) {
		this.setProperty("filterConditions", mConditions, true);

		const oP13nFilter = this.getInbuiltFilter();
		if (oP13nFilter) {
			oP13nFilter.setFilterConditions(mConditions);
		}

		updateFilterInfoBar(this);

		return this;
	};

	function updateFilterInfoBar(oTable) {
		const oFilterInfoBar = getFilterInfoBar(oTable);
		const oFilterInfoBarText = getFilterInfoBarText(oTable);
		const aFilteredProperties = getInternallyFilteredProperties(oTable);

		if (!oFilterInfoBar) {
			return;
		}

		if (aFilteredProperties.length === 0) {
			const oFilterInfoBarDomRef = oFilterInfoBar.getDomRef();

			if (oFilterInfoBarDomRef && oFilterInfoBarDomRef.contains(document.activeElement)) {
				oTable.focus();
			}

			oFilterInfoBar.setVisible(false);
			getFilterInfoBarInvisibleText(oTable).setText("");

			return;
		}

		oTable._fullyInitialized().then(() => {
			const oPropertyHelper = oTable.getPropertyHelper();
			const aPropertyLabels = aFilteredProperties.map((sPropertyName) => {
				return oPropertyHelper.hasProperty(sPropertyName) ? oPropertyHelper.getProperty(sPropertyName).label : "";
			});
			const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
			const oListFormat = ListFormat.getInstance();

			let sFilterText;
			if (aPropertyLabels.length > 1) {
				sFilterText = oResourceBundle.getText("table.MULTIPLE_FILTERS_ACTIVE", [aPropertyLabels.length, oListFormat.format(aPropertyLabels)]);
			} else {
				sFilterText = oResourceBundle.getText("table.ONE_FILTER_ACTIVE", aPropertyLabels);
			}

			if (!oFilterInfoBar.getVisible()) {
				oFilterInfoBar.setVisible(true);
			}

			oFilterInfoBarText.setText(sFilterText);
			getFilterInfoBarInvisibleText(oTable).setText(sFilterText);
		});
	}

	function insertFilterInfoBar(oTable) {
		if (!oTable._oTable) {
			return;
		}

		let oFilterInfoBar = getFilterInfoBar(oTable);
		const oInvisibleText = getFilterInfoBarInvisibleText(oTable);

		if (!oFilterInfoBar) {
			oFilterInfoBar = createFilterInfoBar(oTable);
		}

		oTable._getType().insertFilterInfoBar(oFilterInfoBar, oInvisibleText.getId());
	}

	function getFilterInfoBarInvisibleText(oTable) {
		if (!oTable._oFilterInfoBarInvisibleText) {
			oTable._oFilterInfoBarInvisibleText = new InvisibleText().toStatic();
		}
		return oTable._oFilterInfoBarInvisibleText;
	}

	function createFilterInfoBar(oTable) {
		const sToolbarId = oTable.getId() + "-filterInfoBar";
		let oFilterInfoToolbar = internal(oTable).oFilterInfoBar;
		const oRb = Library.getResourceBundleFor("sap.ui.mdc");

		if (oFilterInfoToolbar && !oFilterInfoToolbar.isDestroyed()) {
			oFilterInfoToolbar.destroy();
		}

		oFilterInfoToolbar = new OverflowToolbar({
			id: sToolbarId,
			active: true,
			design: ToolbarDesign.Info,
			visible: false,
			ariaLabelledBy: sToolbarId + "-text",
			content: [
				new Text({
					id: sToolbarId + "-text",
					wrapping: false
				}), new ToolbarSpacer(), new Button({
					type: MLibrary.ButtonType.Transparent,
					tooltip: oRb.getText("infobar.REMOVEALLFILTERS"),
					icon: "sap-icon://decline",
					press: function() {
						PersonalizationUtils.createClearFiltersChange(oTable);
						oTable.focus();
					}
				})
			],
			press: function() {
				PersonalizationUtils.openFilterDialog(oTable, () => {
					// Because the filter info bar was pressed, it must have had the focus when opening the dialog. When removing all filters in
					// the dialog and confirming, the filter info bar will be hidden, and the dialog tries to restore the focus on the hidden filter
					// info bar. To avoid a focus loss, the table gets the focus.
					if (getInternallyFilteredProperties(oTable).length === 0) {
						oTable.focus();
					}
				});
			}
		});

		internal(oTable).oFilterInfoBar = oFilterInfoToolbar;
		updateFilterInfoBar(oTable);

		return oFilterInfoToolbar;
	}

	function getFilterInfoBar(oTable) {
		const {oFilterInfoBar} = internal(oTable);

		if (oFilterInfoBar?.isDestroyStarted()) {
			return null;
		}

		return oFilterInfoBar;
	}

	function getFilterInfoBarText(oTable) {
		const oFilterInfoBar = getFilterInfoBar(oTable);
		return oFilterInfoBar ? oFilterInfoBar.getContent()[0] : null;
	}

	Table.prototype.setThreshold = function(iThreshold) {
		this.setProperty("threshold", iThreshold, true);
		if (!this._oTable) {
			return this;
		}

		iThreshold = this.getThreshold() > -1 ? this.getThreshold() : undefined;
		if (this._isOfType(TableType.ResponsiveTable)) {
			this._oTable.setGrowingThreshold(iThreshold);
		} else {
			this._oTable.setThreshold(iThreshold);
		}
		return this;
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
		if (!vNoData || typeof vNoData == "string") {
			return this._updateInnerTableNoDataText();
		}

		if (!vNoData.isA("sap.m.IllustratedMessage") || this._sLastNoDataTitle != vNoData.getTitle()) {
			return;
		}

		const oRb = Library.getResourceBundleFor("sap.ui.mdc");
		if (!this.isTableBound()) {
			vNoData.setDescription(" ");
			if (this.getFilter()) {
				vNoData.setTitle(oRb.getText("table.NO_DATA_WITH_FILTERBAR"));
				vNoData.setIllustrationType(IllustratedMessageType.SearchEarth);
			} else {
				vNoData.setIllustrationType(IllustratedMessageType.EmptyList);
				vNoData.setTitle(oRb.getText("table.NO_DATA"));
			}
		} else if (isFiltered(this)) {
			vNoData.setTitle(oRb.getText("table.NO_RESULTS_TITLE"));
			vNoData.setDescription(oRb.getText("table.NO_RESULTS_DESCRIPTION"));
			vNoData.setIllustrationType(IllustratedMessageType.NoFilterResults);
		} else {
			vNoData.setTitle(oRb.getText("table.NO_DATA")).setDescription(" ");
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
		if (vNoData && typeof vNoData == "string") {
			return vNoData;
		}

		const oRb = Library.getResourceBundleFor("sap.ui.mdc");
		if (!this.isTableBound()) {
			return oRb.getText(this.getFilter() ? "table.NO_DATA_WITH_FILTERBAR" : "table.NO_DATA");
		}

		// Table is bound, but does not show any data.
		// If the table is filtered internally or externally, e.g. FilterBar, then show the message that no data was found and that filters can be adjusted.
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

			this._updateAdaptation();

			const oDelegate = this.getControlDelegate();
			if (oDelegate.preInit) { // not used in the table, but is overridden in FE
				oDelegate.preInit(this);
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
		this._oTableReady = new Deferred();
		this._oFullInitialize = new Deferred();
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

	Table.prototype._createContent = function() {
		this._createToolbar();
		this._createTable();
		this._updateColumnResize();
		this._updateRowActions();
		this._updateExpandAllButton();
		this._updateCollapseAllButton();
		this._updateExportButton();
		this.getColumns().forEach(this._insertInnerColumn, this);

		return this.getControlDelegate().initializeContent(this).then(() => {
			if (this.isDestroyed()) {
				return Promise.reject("Destroyed");
			}

			this.setAggregation("_content", this._oTable);
			this._onAfterInitialization();

			return Promise.all([
				this.getPropertyInfo().length === 0 ? this.finalizePropertyHelper() : this.awaitPropertyHelper(),
				this.initialized() // Required for the CreationRow binding context handling.
			]);
		}).then(() => {
			if (this.isDestroyed()) {
				return Promise.reject("Destroyed");
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
		});
	};

	Table.prototype.setHeader = function(sText) {
		this.setProperty("header", sText, true);
		this._updateHeaderText();
		return this;
	};

	Table.prototype.setHeaderVisible = function(bVisible) {
		this.setProperty("headerVisible", bVisible, true);
		if (this._oTitle) {
			this._oTitle.setWidth(this.getHeaderVisible() ? undefined : "0px");
		}
		this._updateInvisibleTitle();
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

	Table.prototype.setShowRowCount = function(bShowCount) {
		this.setProperty("showRowCount", bShowCount, true);
		this._updateHeaderText();
		return this;
	};

	Table.prototype.setEnableExport = function(bEnableExport) {
		this.setProperty("enableExport", bEnableExport, true);
		this._updateExportButton();
		return this;
	};

	Table.prototype.setShowPasteButton = function(bShowPasteButton) {
		if ((bShowPasteButton = !!bShowPasteButton) == this.getShowPasteButton()) {
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
	 * <li>This setting only takes effect when the given <code>p13nMode</code> makes the button visible.</li>
	 * <li>Hiding the button also removes the option for the user to open the personalization dialog. This can lead to situations
	 * in which the user can't adjust certain settings although it is required, for example, show some columns again when all columns are hidden.</li>
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
			// Create Title
			this._oTitle = new Title(this.getId() + "-title", {
				text: this.getHeader(),
				width: this.getHeaderVisible() ? undefined : "0px",
				level: this.getHeaderLevel(),
				titleStyle: this.getHeaderStyle() || TitleLevel[ThemeParameters.get({name: "_sap_ui_mdc_Table_HeaderStyle"})]
			});
			// Create Toolbar
			this._oToolbar = new ActionToolbar(this.getId() + "-toolbar", {
				design: ToolbarDesign[ThemeParameters.get({name: "_sap_ui_mdc_Table_ToolbarDesign"})],
				begin: [
					this._oTitle
				],
				end: [
					this._getCopyButton(), this._getPasteButton(), this._getP13nButton()
				],
				visible: "{= !${$sap.ui.mdc.Table>/hideToolbar} }"
			});
			// Enfore the action order according to the UI Guideline
			this._oToolbar.setProperty("_endOrder", [
				"copy",
				"paste",
				"showHideDetails",
				"collapseAll",
				"expandAll",
				"settings",
				"export"
			].map((sSuffix) => this.getId() + "-" + sSuffix));

			this._updateInvisibleTitle();
		}

		this._oToolbar.setStyle(this._isOfType(TableType.ResponsiveTable) ? ToolbarStyle.Standard : ToolbarStyle.Clear);

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
		return this.getSortConditions() ? this.getSortConditions().sorters : [];
	};

	Table.prototype._getGroupedProperties = function() {
		return this.getGroupConditions() ? this.getGroupConditions().groupLevels : [];
	};

	Table.prototype._getAggregatedProperties = function() {
		return this.getAggregateConditions() ? this.getAggregateConditions() : {};
	};

	Table.prototype._getXConfig = function() {
		return this.getEngine().readXConfig(this);
	};

	/**
	 * Gets the keys of properties that are filtered internally via the inbuilt filtering ({@link sap.ui.mdc.filterbar.p13n.AdaptationFilterBar}).
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table.
	 * @returns {string[]} The keys of the filtered properties.
	 */
	function getInternallyFilteredProperties(oTable) {
		return oTable.isFilteringEnabled() ? getFilteredProperties(oTable.getFilterConditions()) : [];
	}

	/**
	 * Gets the keys of properties that are filtered externally via the associated filter ({@link sap.ui.mdc.IFilter}).
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table.
	 * @returns {string[]} The keys of the filtered properties.
	 */
	function getExternallyFilteredProperties(oTable) {
		const oFilter = Element.getElementById(oTable.getFilter());
		return oFilter ? getFilteredProperties(oFilter.getConditions()) : [];
	}

	/**
	 * Whether the table is filtered internally via the inbuilt filtering ({@link sap.ui.mdc.filterbar.p13n.AdaptationFilterBar}), or externally via
	 * the associated filter ({@link sap.ui.mdc.IFilter}).
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table.
	 * @return {boolean} Whether the table is filtered (internally or externally).
	 */
	function isFiltered(oTable) {
		const oFilter = Element.getElementById(oTable.getFilter());
		return getInternallyFilteredProperties(oTable).length > 0 ||
			getExternallyFilteredProperties(oTable).length > 0 ||
			oFilter && oFilter.getSearch() !== "";
	}

	function getFilteredProperties(mConditions) {
		return Object.keys(mConditions || {}).filter((sProperty) => {
			return mConditions[sProperty].length > 0;
		});
	}

	/**
	 * Fetches the current state of the table (as a JSON)
	 * <b>Note:</b> This API may return attributes corresponding to the <code>p13nMode</code> property configuration.
	 *
	 * @private
	 * @returns {Object} Current state of the table
	 */
	Table.prototype.getCurrentState = function() {
		const oState = {};
		const aP13nMode = this.getActiveP13nModes();

		if (aP13nMode.indexOf("Column") > -1) {
			oState.items = this._getVisibleProperties();
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

		if (this.getEnableColumnResize()) {
			oState.xConfig = this._getXConfig();
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
		let aSupportedP13nModes = getIntersection(Object.keys(TableP13nMode), this._getType().getSupportedP13nModes());

		if (this.isControlDelegateInitialized()) {
			aSupportedP13nModes = getIntersection(aSupportedP13nModes, this.getControlDelegate().getSupportedFeatures(this).p13nModes);
		}

		return aSupportedP13nModes;
	};

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
		if (window.isSecureContext) {
			return this.getCopyProvider()?.getCopyButton({id: this.getId() + "-copy"});
		}
	};

	Table.prototype._getPasteButton = function() {
		if (this.getShowPasteButton()) {
			if (!this._oPasteButton) {
				this._oPasteButton = TableSettings.createPasteButton(this.getId());
			}
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

	Table.prototype._isCollapseAllEnabled = function() {
		return this.isControlDelegateInitialized() && this.getControlDelegate().getSupportedFeatures(this).collapseAllRows;
	};

	/**
	 * Retrieves the "Collapse All" button. Creates the button if necessary.
	 *
	 * @returns {sap.m.MenuButton} button for "Expand All"
	 * @private
	 */
	Table.prototype._updateCollapseAllButton = function() {
		const bNeedCollapseAllButton = this._oToolbar != null && this._isCollapseAllEnabled();

		if (bNeedCollapseAllButton && !this._oCollapseAllButton) {
			this._oCollapseAllButton = TableSettings.createExpandCollapseAllButton(this.getId(), [
				function() {
					try {
						this.getControlDelegate().collapseAllRows(this);
					} catch (oError) {
						Log.error("CollapseAll could not be performed", oError, this);
					}
				}, this
			], false);
		}

		if (!this._oCollapseAllButton) {
			return;
		}

		if (this._oToolbar && !this._oToolbar.getEnd().includes(this._oCollapseAllButton)) {
			this._oToolbar.insertEnd(this._oCollapseAllButton, 0);
		}

		this._oCollapseAllButton.setEnabled(!MTableUtil.isEmpty(this.getRowBinding()));
		this._oCollapseAllButton.setVisible(this._isCollapseAllEnabled());
	};

	Table.prototype._isExpandAllEnabled = function() {
		return this.isControlDelegateInitialized() && this.getControlDelegate().getSupportedFeatures(this).expandAllRows;
	};

	/**
	 * Retrieves the "Collapse All" button. Creates the button if necessary.
	 *
	 * @returns {sap.m.MenuButton} button for "Expand All"
	 * @private
	 */
	Table.prototype._updateExpandAllButton = function() {
		const bNeedExpandAllButton = this._oToolbar != null && this._isExpandAllEnabled();

		if (bNeedExpandAllButton && !this._oExpandAllButton) {
			this._oExpandAllButton = TableSettings.createExpandCollapseAllButton(this.getId(), [
				function() {
					try {
						this.getControlDelegate().expandAllRows(this);
					} catch (oError) {
						Log.error("ExpandAll could not be performed", oError, this);
					}
				}, this
			], true);
		}

		if (!this._oExpandAllButton) {
			return;
		}

		if (this._oToolbar && !this._oToolbar.getEnd().includes(this._oExpandAllButton)) {
			this._oToolbar.insertEnd(this._oExpandAllButton, 0);
		}

		this._oExpandAllButton.setEnabled(!MTableUtil.isEmpty(this.getRowBinding()));
		this._oExpandAllButton.setVisible(this._isExpandAllEnabled());
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
	 * Triggers export via "sap.ui.export"/"Document Export Services" export functionality
	 *
	 * @param {boolean} bExportAs controls whether the regular export or the Export As dialog should be called
	 * @returns {Promise} export build process promise
	 * @private
	 */
	Table.prototype._onExport = function(bExportAs) {
		const that = this;
		return this._createExportColumnConfiguration().then((aSheetColumns) => {

			// If no columns exist, show message and return without exporting
			if (!aSheetColumns || !aSheetColumns.length) {
				sap.ui.require(["sap/m/MessageBox"], function(MessageBox) {
					MessageBox.error(Library.getResourceBundleFor("sap.ui.mdc").getText("table.NO_COLS_EXPORT"), {
						styleClass: (this.$() && this.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact" : ""
					});
				}.bind(that));
				return;
			}

			const oRowBinding = that.getRowBinding();
			const fnGetColumnLabel = that._getColumnLabel.bind(that);
			const sExportFunctionName = bExportAs ? "exportAs" : "export";
			const mExportSettings = {
				workbook: {
					columns: aSheetColumns,
					context: {
						title: that.getHeader()
					}
				},
				dataSource: oRowBinding,
				fileName: that.getHeader()
			};

			that._getExportHandler().then((oHandler) => {
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

		if ((oEvent.metaKey || oEvent.ctrlKey) && oEvent.shiftKey && oEvent.which === KeyCodes.E) {
			if (this._oExportButton && this._oExportButton.getEnabled() && this._isExportEnabled()) {
				this._onExport(true);
				oEvent.setMarked();
				oEvent.preventDefault();
			}
		}

		if ((oEvent.metaKey || oEvent.ctrlKey) && oEvent.which === KeyCodes.COMMA) {
			// CTRL (or Cmd) + COMMA key combination to open the table personalisation dialog
			if (this._oP13nButton && this._oP13nButton.getVisible()) {
				this._oP13nButton.firePress();

				// Mark the event to ensure that parent handlers (e.g. FLP) can skip their processing if needed. Also prevent potential browser defaults
				// (e.g. Cmd+, opens browser settings on Mac).
				oEvent.setMarked();
				oEvent.preventDefault();
			}
		}

	};

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

		if (this.isFilteringEnabled()) {
			insertFilterInfoBar(this);
		}

		if (!this._oColumnHeaderMenu) {
			this._oQuickActionContainer = new QuickActionContainer({table: this});
			this._oItemContainer = new ItemContainer({table: this});
			this._oColumnHeaderMenu = new ColumnMenu({
				id: this.getId() + "-columnHeaderMenu"
			});
			this._oColumnHeaderMenu.addAggregation("_quickActions", this._oQuickActionContainer);
			this._oColumnHeaderMenu.addAggregation("_items", this._oItemContainer);
			this.addDependent(this._oColumnHeaderMenu);

			FESRHelper.setSemanticStepname(this._oColumnHeaderMenu, "beforeOpen", "mdc:tbl:p13n:col");

			this._oColumnHeaderMenu.attachBeforeOpen(this._createColumnMenuContent, this);
		}

		this._updateInvisibleTitle();
	};

	Table.prototype._createColumnMenuContent = function(oEvent) {
		const oInnerColumn = oEvent.getParameter("openBy");
		const oColumn = this.getColumns()[oInnerColumn.getParent().indexOfColumn(oInnerColumn)];

		oEvent.preventDefault();

		this._oQuickActionContainer.setColumn(oColumn);
		this._oItemContainer.setColumn(oColumn);

		this._fullyInitialized().then(() => {
			return this.finalizePropertyHelper();
		}).then(() => {
			Promise.all([
				this._oQuickActionContainer.initializeQuickActions(), this._oItemContainer.initializeItems()
			]).then(() => {
				if (this._oQuickActionContainer.hasQuickActions() || this._oItemContainer.hasItems()) {
					this._oColumnHeaderMenu.openBy(oInnerColumn, true);
					PersonalizationUtils.detectUserPersonalizationCompletion(this, this._oColumnHeaderMenu);
				} else {
					MTableUtil.announceEmptyColumnMenu();
				}
			});
		});
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

	Table.prototype._onCustomSort = function(oEvent, sSortOrder) {
		const sSortProperty = oEvent.getParameter("property");

		this.getCurrentState().sorters.forEach((oProp) => {
			if (oProp.name === sSortProperty) {
				if (oProp.descending && sSortOrder === SortOrder.Descending || !oProp.descending && sSortOrder === SortOrder.Ascending) {
					sSortOrder = SortOrder.None;
				}
			}
		});

		PersonalizationUtils.createSortChange(this, {
			property: sSortProperty,
			sortOrder: sSortOrder
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
		if (!this._bSelectionChangedByAPI) {
			this.fireSelectionChange({
				selectAll: mPropertyBag.selectAll
			});
		}
	};

	Table.prototype._onColumnResize = function(mPropertyBag) {
		PersonalizationUtils.createColumnWidthChange(this, {
			column: mPropertyBag.column,
			width: mPropertyBag.width
		});
	};

	Table.prototype._onCustomGroup = function(sProperty) {
		PersonalizationUtils.createGroupChange(this, {
			property: sProperty
		});
	};

	Table.prototype._onCustomAggregate = function(sProperty) {
		PersonalizationUtils.createAggregateChange(this, {
			property: sProperty
		});
	};

	Table.prototype._insertInnerColumn = function(oColumn, iIndex) {
		if (!this._oTable) {
			return;
		}

		const oInnerColumn = oColumn.getInnerColumn();

		this._setMobileColumnTemplate(oColumn, iIndex);
		this._bForceRebind = true;

		if (iIndex === undefined) {
			this._oTable.addColumn(oInnerColumn);
		} else {
			this._oTable.insertColumn(oInnerColumn, iIndex);
		}
		this._getType()._onColumnInsert(oColumn);
	};

	/**
	 * Runtime API for JS flex change to avoid rebind.
	 *
	 * @param {object} oColumn - the mdc column instance which should be moved
	 * @param {int} iIndex - the index to which the column should be moved to
	 * @private
	 */
	Table.prototype.moveColumn = function(oColumn, iIndex) {
		oColumn._bIsBeingMoved = true;
		this.removeAggregation("columns", oColumn, true);
		this.insertAggregation("columns", oColumn, iIndex, true);
		delete oColumn._bIsBeingMoved;

		if (this._oTable) {
			const oInnerColumn = oColumn.getInnerColumn();

			// move column in inner table
			this._oTable.removeColumn(oInnerColumn);
			this._oTable.insertColumn(oInnerColumn, iIndex);

			this._updateMobileColumnTemplate(oColumn, iIndex);
		}
	};

	Table.prototype.removeColumn = function(oColumn) {
		oColumn = this.removeAggregation("columns", oColumn, true);
		this._updateMobileColumnTemplate(oColumn, -1);
		return oColumn;
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

	Table.prototype._setMobileColumnTemplate = function(oColumn, iIndex) {
		if (!this._oRowTemplate) {
			return;
		}

		const oCellTemplate = oColumn.getTemplateClone();

		if (iIndex >= 0) {
			this._oRowTemplate.insertCell(oCellTemplate, iIndex);
			this._oTable.getItems().forEach((oItem) => {
				// ignore group headers since it does not have "cells" aggregation
				if (oItem.isA("sap.m.GroupHeaderListItem")) {
					return;
				}
				// Add lightweight placeholders that can be rendered - if they cannot be rendered, there will be errors in the console.
				// The actual cells are created after rebind.
				oItem.insertAggregation("cells", new InvisibleText(), iIndex, true);
			});
		} else {
			this._oRowTemplate.addCell(oCellTemplate);
		}
	};

	Table.prototype._updateMobileColumnTemplate = function(oMDCColumn, iIndex) {
		if (!this._oRowTemplate) {
			return;
		}

		let oCellTemplate, iCellIndex;
		// TODO: Check if this can be moved inside the m.Table.

		// Remove cell template when column is hidden
		// Remove template cell from ColumnListItem (template)
		if (this._oRowTemplate) {
			oCellTemplate = oMDCColumn.getTemplateClone();
			iCellIndex = this._oRowTemplate.indexOfCell(oCellTemplate);
			removeMobileItemCell(this._oRowTemplate, iCellIndex, iIndex);
		}

		// Remove cells from actual rendered items, as this is not done automatically
		if (iCellIndex > -1) {
			this._oTable.getItems().forEach((oItem) => {
				// Grouping row (when enabled) will not have cells
				if (oItem.removeCell) {
					removeMobileItemCell(oItem, iCellIndex, iIndex);
				}
			});
		}
	};

	function removeMobileItemCell(oItem, iRemoveIndex, iInsertIndex) {
		const oCell = oItem.removeCell(iRemoveIndex);
		if (oCell) {
			// -1 index destroys the inner content
			if (iInsertIndex > -1) {
				oItem.insertCell(oCell, iInsertIndex);
			} else {
				oCell.destroy();
			}
		}
	}

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
			this._bSelectionChangedByAPI = true;
			this.getControlDelegate().clearSelection(this);
			this._bSelectionChangedByAPI = false;
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
	Table.prototype._onDataRequested = function() {
		this._bIgnoreChange = true;
	};

	/**
	 * Event handler for binding dataReceived
	 *
	 * @private
	 */
	Table.prototype._onDataReceived = function() {
		this._bIgnoreChange = false;
		this._updateTableHeaderState();
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

		/* skip calling of _updateHeaderText till data is received otherwise MTableUtil.announceTableUpdate
		will be called to early and the user gets an incorrect announcement via screen reader of the actual table state*/
		if (this._bIgnoreChange) {
			return;
		}
		this._updateTableHeaderState();
	};

	/**
	 * Updates the table header states, like the header text and the export button.
	 *
	 * @private
	 */
	Table.prototype._updateTableHeaderState = function() {
		this._updateHeaderText();
	};

	Table.prototype._updateHeaderText = function() {
		let sHeader, iRowCount;

		if (!this._oNumberFormatInstance) {
			this._oNumberFormatInstance = NumberFormat.getFloatInstance();
		}

		if (this._oTitle && this.getHeader()) {
			sHeader = this.getHeader();
			if (this.getShowRowCount()) {
				iRowCount = this.getRowBinding() ? this.getRowBinding().getCount() : 0;
				if (iRowCount > 0) {
					const sValue = this._oNumberFormatInstance.format(iRowCount);
					sHeader += " (" + sValue + ")";
				}
			}

			this._oTitle.setText(sHeader);
		}

		if (!this._bIgnoreChange && this._bAnnounceTableUpdate) {
			this._bAnnounceTableUpdate = false;
			// iRowCount is undefined, if this.getShowRowCount() returns false
			MTableUtil.announceTableUpdate(this.getHeader(), iRowCount);
		}
	};

	Table.prototype._updateColumnsBeforeBinding = function() {
		const aColumns = this.getColumns();
		const oPropertyHelper = this.getPropertyHelper();

		aColumns.forEach(function(oColumn) {
			const oProperty = oPropertyHelper.getProperty(oColumn.getPropertyKey());
			const aSortableProperties = oProperty ? oProperty.getSortableProperties().map((oProperty) => {
				return oProperty.name;
			}) : [];
			const oSortCondition = this._getSortedProperties().find((oSortCondition) => {
				return aSortableProperties.includes(oSortCondition.name);
			});
			let sSortOrder = SortOrder.None;

			if (oSortCondition) {
				sSortOrder = oSortCondition.descending ? SortOrder.Descending : SortOrder.Ascending;
			}

			this._getType().updateSortIndicator(oColumn, sSortOrder);
		}, this);
	};

	/**
	 * Returns the row/items binding of the internal table.<br>
	 * <i>Note</i>:
	 * <li>Do not use this API to keep the reference of the binding.</li>
	 * <li>Also, do not use it to trigger sort/filter on the binding.</li>
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @returns {sap.ui.model.Binding} the row/items binding
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
		this.getControlDelegate().updateBinding(this, oBindingInfo, this._bForceRebind ? null : this.getRowBinding(), {forceRefresh: bForceRefresh});
		this._updateInnerTableNoData();
		this._bForceRebind = false;
	};

	Table.prototype._finalizeBindingInfo = function(oBindingInfo) {
		if (this._oRowTemplate) {
			oBindingInfo.template = this._oRowTemplate;
			oBindingInfo.templateShareable = true;
		} else {
			delete oBindingInfo.template;
		}

		Table._addBindingListener(oBindingInfo, "dataRequested", this._onDataRequested.bind(this));
		Table._addBindingListener(oBindingInfo, "dataReceived", this._onDataReceived.bind(this));
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

		// Destroy destructible elements and delete references.
		[
			"_oTable",
			"_oTitle",
			"_vNoData",
			"_oContextMenu",
			"_oNumberFormatInstance",
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

	Table.prototype.addAction = function(oControl) {
		if (oControl.getMetadata().getName() !== "sap.ui.mdc.actiontoolbar.ActionToolbarAction") {
			oControl = new ActionToolbarAction(oControl.getId() + "-action", {
				action: oControl
			});
		}

		return Control.prototype.addAggregation.apply(this, ["actions", oControl]);
	};

	/**
	 * Handler for theme changes
	 */
	Table.prototype.onThemeChanged = function() {
		if (this._oExportButton) {
			const sButtonType = MLibrary.ButtonType[ThemeParameters.get({name: "_sap_ui_mdc_Table_ExportButtonType"})];
			this._oExportButton.setType(sButtonType);
		}

		if (this._oToolbar) {
			const sToolBarDesign = ToolbarDesign[ThemeParameters.get({name: "_sap_ui_mdc_Table_ToolbarDesign"})];
			this._oToolbar.setDesign(sToolBarDesign);
		}

		if (this._oTitle && !this.getHeaderStyle()) {
			const sHeaderStyle = TitleLevel[ThemeParameters.get({name: "_sap_ui_mdc_Table_HeaderStyle"})];
			this._oTitle.setTitleStyle(sHeaderStyle);
		}
	};

	/**
	 * Allows programmatic configuration of the table's selection state
	 * @param {array<sap.ui.model.Context>} aContexts Contexts which should be selected
	 * @ui5-restricted sap.ui.mdc
	 * @private
	 */
	Table.prototype._setSelectedContexts = function(aContexts) {
		this.getControlDelegate().setSelectedContexts(this, aContexts);
	};

	/**
	 * @name sap.ui.mdc.Table#addAction
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#destroyActions
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#insertAction
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#removeAction
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#removeAllActions
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#addColumn
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#destroyColumns
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#insertColumn
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#removeColumn
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#removeAllColumns
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#setSortConditions
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#getSortConditions
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#setFilterConditions
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#getFilterConditions
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#setGroupConditions
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#getGroupConditions
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#setAggregateConditions
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#getAggregateConditions
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#setPropertyInfo
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	/**
	 * @name sap.ui.mdc.Table#getPropertyInfo
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.fl
	 */

	return Table;
});