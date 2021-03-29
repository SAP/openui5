/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.mdc.
 */
sap.ui.define([
	"sap/ui/core/Core", // provides sap.ui.getCore()
	"sap/ui/core/library", // library dependency
	"sap/m/library" // library dependency
], function () {
	"use strict";

	sap.ui.getCore().initLibrary({
		version: "${version}",
		name: "sap.ui.mdc",
		dependencies: ["sap.ui.core", "sap.m"],
		designtime: "sap/ui/mdc/designtime/library.designtime",
		types: [
			"sap.ui.mdc.TableType",
			"sap.ui.mdc.TableP13Mode",
			"sap.ui.mdc.GrowingMode",
			"sap.ui.mdc.RowCountMode",
			"sap.ui.mdc.SelectionMode",
			"sap.ui.mdc.TableRowAction",
			"sap.ui.mdc.FilterExpression"
			],
		interfaces: [
			"sap.ui.mdc.IFilterSource",
			"sap.ui.mdc.IFilter",
			"sap.ui.mdc.IxState"
		],
		controls: [
			"sap.ui.mdc.Chart",
			"sap.ui.mdc.Table",
			"sap.ui.mdc.FilterBar",
			"sap.ui.mdc.field.FieldBase",
			"sap.ui.mdc.field.FieldInput",
			"sap.ui.mdc.field.FieldMultiInput",
			"sap.ui.mdc.field.ValueHelpPanel",
			"sap.ui.mdc.field.DefineConditionPanel",
			"sap.ui.mdc.Field",
			"sap.ui.mdc.FilterField",
			"sap.ui.mdc.link.Panel",
			"sap.ui.mdc.link.ContactDetails",
			"sap.ui.mdc.ui.Container",
			"sap.ui.mdc.ChartNew",
			"sap.ui.mdc.p13n.PersistenceProvider"
			],
		elements: [
			"sap.ui.mdc.table.Column",
			"sap.ui.mdc.table.CreationRow",
			"sap.ui.mdc.table.TableTypeBase",
			"sap.ui.mdc.table.GridTableType",
			"sap.ui.mdc.table.ResponsiveTableType",
			"sap.ui.mdc.table.RowSettings",
			"sap.ui.mdc.chart.DimensionItem",
			"sap.ui.mdc.chart.MeasureItem",
			"sap.ui.mdc.chartNew.ItemNew",
			"sap.ui.mdc.chartNew.ChartSelectionDetailsNew",
			"sap.ui.mdc.chartNew.ChartToolbarNew",
			"sap.ui.mdc.chartNew.ChartTypeButtonNew",
			"sap.ui.mdc.chartNew.DrillBreadcrumbsNew",
			"sap.ui.mdc.chartNew.SelectionDetailsActionsNew",
			"sap.ui.mdc.field.CustomFieldHelp",
			"sap.ui.mdc.field.CustomFieldInfo",
			"sap.ui.mdc.field.FieldHelpBase",
			"sap.ui.mdc.field.FieldInfoBase",
			"sap.ui.mdc.field.FieldValueHelp",
			"sap.ui.mdc.field.FieldValueHelpContentWrapperBase",
			"sap.ui.mdc.field.FieldValueHelpTableWrapperBase",
			"sap.ui.mdc.field.FieldValueHelpMdcTableWrapper",
			"sap.ui.mdc.field.FieldValueHelpMTableWrapper",
			"sap.ui.mdc.field.FieldValueHelpUITableWrapper",
			"sap.ui.mdc.field.ListFieldHelp",
			"sap.ui.mdc.field.ListFieldHelpItem",
			"sap.ui.mdc.field.BoolFieldHelp",
			"sap.ui.mdc.field.ConditionFieldHelp",
			"sap.ui.mdc.filterbar.aligned.FilterItemLayout",
			"sap.ui.mdc.link.ContactDetailsAddressItem",
			"sap.ui.mdc.link.ContactDetailsEmailItem",
			"sap.ui.mdc.link.ContactDetailsItem",
			"sap.ui.mdc.link.ContactDetailsPhoneItem",
			"sap.ui.mdc.link.LinkItem",
			"sap.ui.mdc.link.PanelItem",
			"sap.ui.mdc.link.SemanticObjectUnavailableAction",
			"sap.ui.mdc.link.SemanticObjectMapping",
			"sap.ui.mdc.link.SemanticObjectMappingItem",
			"sap.ui.mdc.field.InParameter",
			"sap.ui.mdc.field.OutParameter",
			"sap.ui.mdc.ui.ContainerItem"
		],
		extensions: {
			flChangeHandlers: {
				"sap.ui.mdc.Table": "sap/ui/mdc/flexibility/Table",
				"sap.ui.mdc.Chart": "sap/ui/mdc/flexibility/Chart",
				"sap.ui.mdc.ChartNew": "sap/ui/mdc/flexibility/Chart",
				"sap.ui.mdc.FilterBar": "sap/ui/mdc/flexibility/FilterBar",
				"sap.ui.mdc.filterbar.p13n.AdaptationFilterBar": "sap/ui/mdc/flexibility/FilterBar",
				"sap.ui.mdc.link.PanelItem": "sap/ui/mdc/flexibility/PanelItem",
				"sap.ui.mdc.link.Panel": "sap/ui/mdc/flexibility/Panel"
			}
		},
		noLibraryCSS: false
	});
	/**
	 *
	 * Interface for controls or entities which are able to return a set of present conditions.
	 * The controls or entities have to implement the following APIs: <code>getConditions</code>.
	 *
	 * @since 1.80
	 * @name sap.ui.mdc.IFilterSource
	 * @interface
	 * @private
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * The function 'getConditions' is used to retrieve a set of present conditions as defined per {@link sap.ui.mdc.IFilterSource} interface.
	 *
	 * @name sap.ui.mdc.IFilterSource.getConditions
	 * @returns {map} a map containing the conditions according to the definition of the {@link sap.ui.mdc.condition.ConditionModel}
	 * @since 1.80
	 * @public
	 * @function
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 *
	 * Interface for controls or entities which can serve as filters in the <code>sap.ui.mdc.Table</code>.
	 * The controls or entities have to implement the following APIs: <code>getSearch</code> & <code>getConditions</code> & <code>triggerSearch</code> methods along with the <code>search</code> & <code>filtersChanged</code> events
	 *
	 * @since 1.70
	 * @name sap.ui.mdc.IFilter
	 * @interface
	 * @private
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 *
	 * Interface for controls or entities which support the appliance of an externalized state representation.
	 * The controls or entities have to implement the following APIs: <code>getCurrentState</code>, <code>getAdaptationConfigAttribute</code> & <code>initialized</code> methods.
	 *
	 * @since 1.75
	 * @name sap.ui.mdc.IxState
	 * @interface
	 * @private
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/* eslint-disable no-undef */
	/**
	 * The SAPUI5 library that contains the metadata-driven controls and other entities.
	 *
	 * SAP Internal
	 * This library is restricted to use by SAP internal projects only.
	 *
	 * @namespace
	 * @alias sap.ui.mdc
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.fe
	 * @experimental As of version 1.54 Disclaimer: Usage Restrictions: The components of this library are under development and documented as private. Their APIs are subject to change and should not be used in productive scenarios without further agreement. A general availability of sap.ui.mdc will be announced via the usual channels.
	 */
	var thisLib = sap.ui.mdc;
	/* eslint-enable no-undef */

	/**
	 * Defines the personalization mode of the filter bar.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.74
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FilterBarP13nMode = {
		/**
		 * FilterItem personalization is enabled.
		 *
		 * @public
		 */
		Item: "Item",
		/**
		 * Condition personalization is enabled.
		 *
		 * @public
		 */
		Value: "Value"
	};

	/**
	 * Defines the type of table used in the MDC table.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.58
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.TableType = {
		/**
		 * Grid table ({@link sap.ui.table.Table} control) is used (default)
		 *
		 * @public
		 */
		Table: "Table",
		/**
		 * Responsive table ({@link sap.m.Table} control) is used.
		 *
		 * @public
		 */
		ResponsiveTable: "ResponsiveTable"
	};

	/**
	 * Defines the personalization mode of the table.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.62
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.TableP13nMode = {
		/**
		 * Column personalization is enabled.
		 *
		 * @public
		 */
		Column: "Column",
		/**
		 * Sort personalization is enabled.
		 *
		 * @public
		 */
		Sort: "Sort",
		/**
		 * Filter personalization is enabled.
		 *
		 * @public
		 */
		Filter: "Filter",
		/**
		 * Group personalization is enabled.
		 *
		 * @public
		 */
		Group: "Group",
		/**
		 * Aggregation personalization is enabled.
		 *
		 * @public
		 */
		Aggregate: "Aggregate"
	};

	/**
	 * Defines the growing options of the responsive table.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.65
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.GrowingMode = {
		/**
		 * Growing does not take place (<code>growing</code> is not set in the responsive table)
		 *
		 * @public
		 */
		None: "None",
		/**
		 * Basic growing takes place (<code>growing</code> is set in the responsive table)
		 *
		 * @public
		 */
		Basic: "Basic",
		/**
		 * Growing with <code>scroll</code> takes place (<code>growing</code> and <code>growingScrollToLoad</code> are set in the responsive table)
		 *
		 * @public
		 */
		Scroll: "Scroll"
	};


	/**
	 * Defines the row count mode of the GridTable.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.65
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.RowCountMode = {
		/**
		 * The table automatically fills the height of the surrounding container.
		 *
		 * @public
		 */
		Auto: "Auto",
		/**
		 * The table always has as many rows as defined in the <code>rowCount</code> property of <code>GridTableType</code>.
		 *
		 * @public
		 */
		Fixed: "Fixed"
	};

	/**
	 * Defines the types of chart actions in the toolbar.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.64
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ChartToolbarActionType = {
		/**
		 * Zoom in and zoom out action.
		 *
		 * @public
		 */
		ZoomInOut: "ZoomInOut",
		/**
		 * Drill down and up action.
		 *
		 * @public
		 */
		DrillDownUp: "DrillDownUp",
		/**
		 * Legend action.
		 *
		 * @public
		 */
		Legend: "Legend",
		/**
		 * Full screen action.
		 *
		 * @public
		 */
		FullScreen: "FullScreen"
	};

	 /**
	 * Defines the personalization mode of the chart.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.75
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ChartP13nMode = {
		/**
		 * Item personalization is enabled.
		 *
		 * @public
		 */
		Item: "Item",
		/**
		 * Sort personalization is enabled.
		 *
		 * @public
		 */
		Sort: "Sort",
				/**
		 * Chart type personalization is enabled.
		 *
		 * @public
		 */
		Type: "Type"
	};

	/**
	 * Defines the mode of the table.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.58
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.SelectionMode = {
		/**
		 * No rows/items can be selected (default).
		 * @public
		 */
		None: "None",
		/**
		 * Only one row/item can be selected at a time.
		 * @public
		 */
		Single: "Single",
		/**
		 * Multiple rows/items can be selected at a time.
		 * @public
		 */
		Multi: "Multi"
	};

	/**
	 * Defines the actions that can be used in the table.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.60
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.RowAction = {
		/**
		 * Navigation arrow (chevron) is shown in the table rows/items.
		 *
		 * @public
		 */
		Navigation: "Navigation"
	};

	/**
	 * Defines the filter expression types.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.61
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FilterExpression = {
		/**
		 * Single interval value.
		 * @public
		 */
		Interval : "Interval",
		/**
		 * Single value.
		 * @public
		 */
		Single : "Single",
		/**
		 * Multiple value
		 * @public
		 */
		Multi : "Multi"
	};

	thisLib.ChartItemType = {
		/**
		 * Dimension Item
		 * @public
		 */
		Dimension: "Dimension",
		/**
		 * Measure Item
		 * @public
		 */
		Measure: "Measure"
	};

	thisLib.ChartItemRoleType = {
		/**
		 * All dimensions with role "category" are assigned to the feed uid "categoryAxis".
		 *
		 * <b>NOTE:</b> If the chart type requires at least one dimension on the feed "categoryAxis" (true for all chart types except pie and donut), but no dimension has the role "category" or "category2", then the first visible dimension is assigned to the "categoryAxis".
		 *
		 * @public
		 */
		category: "category",
		/**
		 * All dimensions with role "series" are assigned to the feed uid "color".
		 * @public
		 */
		series: "series",
		/**
		 * If a chart type does not use the feed uid "categoryAxis2", then all dimensions with role "category2" are treated as dimension with role "category" (appended).
		 * @public
		 */
		category2: "category2",
		/**
		 * General Rules for all chart types
		 * <ol>
		 *   <li>All measures with role "axis1" are assigned to feed uid "valueaxis". All measures with role "axis2" are assigned to feed uid "valueaxis2". All measures with role "axis3" are assigned to feed uid "bubbleWidth".</li>
		 *   <li>If a chart type does not use the feed uid "valueaxis2", then all measures with role "axis2" are treated as measures with role "axis1".</li>
		 *   <li>If a chart type requires at least 1 measure on the feed uid "valueaxis" (true for all non-"dual" chart types), but there is no measure with role "axis1", then the first measure with role "axis2" is assigned to feed uid "valueaxis"</li>
		 *   <li>If the chart type requires at least one measure on the feed uid "valueaxis2" (true for all "dual" chart types"), but there is no measure with role "axis2", then the first measure with role "axis3" or "axis4" or (if not exists) the last measure with role "axis1" is assigned to feed uid "valueaxis2".</li>
		 * </ol>
		 * @public
		 */
		axis1: "axis1",
		/**
		 * Measures with role "axis2" are assigned to feed uid "valueaxis2" if used.
		 * If a chart type does not use the feed uid "bubbleWidth" (true for all chart types except bubble and radar), then all measures with role "axis3" or "axis4" are treated as measures with role "axis2".
		 * @public
		 */
		axis2: "axis2",
		/**
		 * Measures with role "axis3" are assigned to feed uid "bubbleWidth" if used.
		 * @public
		 */
		axis3: "axis3"
	};
	/**
	 * Defines supported address types in ContactDetails control.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.64
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ContactDetailsAddressType = {
		work: "work",
		home: "home",
		preferred: "preferred"
	};
	/**
	 * Defines supported email types in ContactDetails control.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.64
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ContactDetailsEmailType = {
		work: "work",
		home: "home",
		preferred: "preferred"
	};
	/**
	 * Defines supported phone types in ContactDetails control.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.64
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ContactDetailsPhoneType = {
		work: "work",
		home: "home",
		cell: "cell",
		fax: "fax",
		preferred: "preferred"
	};

	/**
	* @typedef {object} sap.ui.mdc.TypeConfig
	* @property {string} [className] Model-specific data type
	* @property {sap.ui.model.SimpleType} typeInstance Type instance for given data type
	* @property {string} baseType Basic type category for given data type
	* @private
	*/

	/**
	* @typedef {object} sap.ui.mdc.DelegateConfig
	* @property {string} name Delegate module path
	* @property {*} payload Delegate payload
	* @private
	*/

	return thisLib;
});
