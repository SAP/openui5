/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.table.
 */
sap.ui.define([
 "sap/ui/core/Lib",
 "sap/ui/base/DataType",
 // library dependencies
 "sap/ui/core/library",
 "sap/ui/unified/library"
], function(
 Library,
 DataType
) {
 "use strict";

 /**
  * Table-like controls, mainly for desktop scenarios.
  *
  * Basic support for OData V4 is provided, especially by the following plugins:
  * <ul>
  *   <li>{@link sap.ui.table.plugins.ODataV4MultiSelection ODataV4MultiSelection}</li>
  *   <li>{@link sap.ui.table.plugins.ODataV4SingleSelection ODataV4SingleSelection}</li>
  *   <li>{@link sap.ui.table.plugins.ODataV4Aggregation ODataV4Aggregation}</li>
  *   <li>{@link sap.ui.table.plugins.ODataV4Hierarchy ODataV4Hierarchy}</li>
  * </ul>
  * With OData V4, use one of the OData V4 selection plugins instead of the table's built-in selection or a different selection plugin.
  *
  * For more extensive functionality, the SAP Fiori Elements framework for OData V4 provides the
  * {@link topic:549749bd901440d4bb242282a16b0ec2 Flexible Programming Model}. It offers building blocks that can be used without additional
  * integration effort. For more table-related information, see the {@link topic:3801656db27b4b7a9099b6ed5fa1d769 Table Building Block}.
  *
  * @namespace
  * @alias sap.ui.table
  * @author SAP SE
  * @version ${version}
  * @since 0.8
  * @public
  */
 const thisLib = Library.init({
	 name: "sap.ui.table",
	 apiVersion: 2,
	 version: "${version}",
	 dependencies: ["sap.ui.core", "sap.ui.unified"],
	 ...{
		 interactionDocumentation: true
	 },
	 designtime: "sap/ui/table/designtime/library.designtime",
	 types: [
	  "sap.ui.table.RowActionType",
	  "sap.ui.table.SelectionBehavior",
	  "sap.ui.table.SelectionMode"
	 ],
	 interfaces: [],
	 controls: [
	  "sap.ui.table.AnalyticalTable",
	  "sap.ui.table.CreationRow",
	  "sap.ui.table.Table",
	  "sap.ui.table.TreeTable",
	  "sap.ui.table.RowAction"
	 ],
	 elements: [
		 "sap.ui.table.AnalyticalColumn",
		 "sap.ui.table.Column",
		 "sap.ui.table.Row",
		 "sap.ui.table.RowActionItem",
		 "sap.ui.table.RowSettings",
		 "sap.ui.table.rowmodes.RowMode",
		 "sap.ui.table.rowmodes.Fixed",
		 "sap.ui.table.rowmodes.Interactive",
		 "sap.ui.table.rowmodes.Auto",
		 "sap.ui.table.plugins.SelectionPlugin",
		 "sap.ui.table.plugins.MultiSelectionPlugin",
		 "sap.ui.table.plugins.ODataV4MultiSelection",
		 "sap.ui.table.plugins.ODataV4SingleSelection",
		 "sap.ui.table.plugins.ODataV4Aggregation",
		 "sap.ui.table.plugins.ODataV4Hierarchy"
	 ],
	 extensions: {
		 flChangeHandlers: {
			 // Note: MoveElements change handling is deprecated
			 //
			 // "sap.ui.table.Table": {
			 // 	"moveElements": "default"
			 // },
			 // "sap.ui.table.AnalyticalTable": {
			 // 	"moveElements": "default"
			 // }
		 },
		 //Configuration used for rule loading of Support Assistant
		 "sap.ui.support": {
			 publicRules: true
		 }
	 }
 });

 /**
  * Row Action types.
  *
  * @version ${version}
  * @enum {string}
  * @public
  */
 thisLib.RowActionType = {

	 /**
	  * Custom defined Row Action.
	  * @public
	  */
	 Custom: "Custom",

	 /**
	  * Navigation Row Action.
	  * @public
	  */
	 Navigation: "Navigation",

	 /**
	  * Delete Row Action.
	  * @public
	  */
	 Delete: "Delete"

 };

 DataType.registerEnum("sap.ui.table.RowActionType", thisLib.RowActionType);

 /**
  * Selection behavior of the table
  *
  * @version ${version}
  * @enum {string}
  * @public
  */
 thisLib.SelectionBehavior = {

	 /**
	  * Rows can be selected on the complete row.
	  * @public
	  */
	 Row: "Row",

	 /**
	  * Rows can only be selected on the row selector.
	  * @public
	  */
	 RowSelector: "RowSelector",

	 /**
	  * Rows can only be selected on the row (and the selector is hidden).
	  * @public
	  */
	 RowOnly: "RowOnly"

 };

 DataType.registerEnum("sap.ui.table.SelectionBehavior", thisLib.SelectionBehavior);

 /**
  * Selection mode of the table
  *
  * @version ${version}
  * @enum {string}
  * @public
  */
 thisLib.SelectionMode = {
  /**
   * Select multiple rows at a time (toggle behavior).
   * @public
   */
  MultiToggle: "MultiToggle",

  /**
   * Select one row at a time.
   * @public
   */
  Single: "Single",

  /**
   * No rows can be selected.
   * @public
   */
  None: "None"
 };

 DataType.registerEnum("sap.ui.table.SelectionMode", thisLib.SelectionMode);

 /**
  * Shared DOM Reference IDs of the table.
  *
  * Contains IDs of shared DOM references, which should be accessible to inheriting controls via getDomRef() function.
  *
  * @version ${version}
  * @enum {string}
  * @public
  */
 thisLib.SharedDomRef = {

	 /**
	  * The element id of the Horizontal Scroll Bar of the sap.ui.table.Table.
	  * @public
	  */
	 HorizontalScrollBar: "hsb",

	 /**
	  * The element id of the Vertical Scroll Bar of the sap.ui.table.Table.
	  * @public
	  */
	 VerticalScrollBar: "vsb"
 };

 /**
  * Details about the group event to distinguish between different actions associated with grouping
  * @enum {string}
  * @public
  * @type {{group: string, ungroup: string, ungroupAll: string, moveUp: string, moveDown: string, showGroupedColumn: string, hideGroupedColumn: string}}
  */
 thisLib.GroupEventType = {
	 /**
	  * Group Column
	  * @public
	  */
	 group: "group",
	 /**
	  * Ungroup Column
	  * @public
	  */
	 ungroup: "ungroup",
	 /**
	  * Ungroup All Columns
	  * @public
	  */
	 ungroupAll: "ungroupAll",
	 /**
	  * Change the group order of the columns. Move column one position up in the group sequence
	  * @public
	  */
	 moveUp: "moveUp",
	 /**
	  * Change the group order of the columns. Move column one position down in the group sequence
	  * @public
	  */
	 moveDown: "moveDown",
	 /**
	  * Show grouped column also as a column, not just as group header
	  * @public
	  */
	 showGroupedColumn: "showGroupedColumn",
	 /**
	  * Show grouped column only as group header
	  * @public
	  */
	 hideGroupedColumn: "hideGroupedColumn"
 };

 if (!thisLib.plugins) {
	 thisLib.plugins = {};
 }

 //factory for table to create labels and textviews to be overwritten by commons and mobile library
 /* -------------------------------------- */
 return thisLib;
});