/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.table.
 */
sap.ui.define(['sap/ui/core/Core', 'sap/ui/model/TreeAutoExpandMode',
	'sap/ui/core/library', // library dependency
	'sap/ui/unified/library'], // library dependency
	function(Core, TreeAutoExpandMode) {

	"use strict";

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.table",
		version: "${version}",
		dependencies : ["sap.ui.core","sap.ui.unified"],
		designtime: "sap/ui/table/designtime/library.designtime",
		types: [
			"sap.ui.table.NavigationMode",
			"sap.ui.table.RowActionType",
			"sap.ui.table.SelectionBehavior",
			"sap.ui.table.SelectionMode",
			"sap.ui.table.SortOrder",
			"sap.ui.table.VisibleRowCountMode",
			"sap.ui.table.TreeAutoExpandMode" /*Note: Only added here to ensure that a corresponding module is created automatically. Cannot be used as type for properties!*/
		],
		interfaces: [],
		controls: [
			"sap.ui.table.AnalyticalColumnMenu",
			"sap.ui.table.AnalyticalTable",
			"sap.ui.table.ColumnMenu",
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
			"sap.ui.table.rowmodes.FixedRowMode",
			"sap.ui.table.rowmodes.InteractiveRowMode",
			"sap.ui.table.rowmodes.AutoRowMode",
			"sap.ui.table.plugins.MultiSelectionPlugin",
			"sap.ui.table.plugins.SelectionPlugin"
		],
		extensions: {
			flChangeHandlers: {
				"sap.ui.table.Column": {
					"propertyChange" : "default"
				},
				"sap.ui.table.Table" : {
					"moveElements": "default"
				},
				"sap.ui.table.AnalyticalTable" : {
					"moveElements": "default"
				}
			},
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				publicRules:true
			}
		}
	});

	/**
	 * Table-like controls, mainly for desktop scenarios.
	 *
	 * @namespace
	 * @alias sap.ui.table
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	var thisLib = sap.ui.table;

	/**
	 * Navigation mode of the table
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.NavigationMode = {

		/**
		 * Uses the scrollbar control.
		 * @public
		 */
		Scrollbar : "Scrollbar",

		/**
		 * Uses the paginator control.
		 * This option must no longer be used. Using a scrollbar is the only navigation mode which is supported by
		 * the <code>sap.ui.table</code> library. The <code>navigationMode</code> property has always been a visual representation. No matter which navigation mode
		 * is used, data fetched from an OData service is loaded page-wise.
		 * @public
		 * @deprecated As of version 1.38, replaced by {@link sap.ui.table.NavigationMode.Scrollbar}
		 */
		Paginator : "Paginator"

	};

	/**
	 * Row Action types.
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.RowActionType = {

		/**
		 * Custom defined Row Action.
		 * @public
		 */
		Custom : "Custom",

		/**
		 * Navigation Row Action.
		 * @public
		 */
		Navigation : "Navigation",

		/**
		 * Delete Row Action.
		 * @public
		 */
		Delete : "Delete"

	};


	/**
	 * Selection behavior of the table
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.SelectionBehavior = {

		/**
		 * Rows can be selected on the complete row.
		 * @public
		 */
		Row : "Row",

		/**
		 * Rows can only be selected on the row selector.
		 * @public
		 */
		RowSelector : "RowSelector",

		/**
		 * Rows can only be selected on the row (and the selector is hidden).
		 * @public
		 */
		RowOnly : "RowOnly"

	};


	/**
	 * Selection mode of the table
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.SelectionMode = {

		/**
		 * Select multiple rows at a time (toggle behavior).
		 * @public
		 */
		MultiToggle : "MultiToggle",

		/**
		 * Select multiple rows at a time.
		 * @public
		 * @deprecated As of version 1.38, replaced by {@link sap.ui.table.SelectionMode.MultiToggle}
		 */
		Multi : "Multi",

		/**
		 * Select one row at a time.
		 * @public
		 */
		Single : "Single",

		/**
		 * No rows can be selected.
		 * @public
		 */
		None : "None"

	};


	/**
	 * Sort order of a column
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.SortOrder = {

		/**
		 * Sort Order: ascending.
		 * @public
		 */
		Ascending : "Ascending",

		/**
		 * Sort Order: descending.
		 * @public
		 */
		Descending : "Descending"

	};


	/**
	 * VisibleRowCountMode of the table
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.VisibleRowCountMode = {

		/**
		 * The table always has as many rows as defined in the <code>visibleRowCount</code> property.
		 * @public
		 */
		Fixed : "Fixed",

		/**
		 * The user can change the <code>visibleRowCount</code> by dragging a resizer.
		 * @public
		 */
		Interactive : "Interactive",

		/**
		 * The table automatically fills the height of the surrounding container.
		 * @public
		 */
		Auto : "Auto"

	};

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
		HorizontalScrollBar : "hsb",

		/**
		 * The element id of the Vertical Scroll Bar of the sap.ui.table.Table.
		 * @public
		 */
		VerticalScrollBar : "vsb"
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

	// map the new Column to the old ColumnHeader
	thisLib.ColumnHeader = thisLib.Column;

	// copy sap.ui.model.TreeAutoExpandMode onto the legacy type sap.ui.table.TreeAutoExpandMode
	/**
	 * Different modes for setting the auto expand mode on tree or analytical bindings.
	 *
	 * This is an alias for {@link sap.ui.model.TreeAutoExpandMode} and kept for compatibility reasons.
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 */
	thisLib.TreeAutoExpandMode = TreeAutoExpandMode;

	//factory for table to create labels and textviews to be overwritten by commons and mobile library
	if (!thisLib.TableHelper) {
		thisLib.TableHelper = {
			addTableClass: function(){ return ""; }, /* must return some additional CSS class */
			createLabel: function(mConfig){ throw new Error("no Label control available!"); }, /* must return a Label control */
			createTextView: function(mConfig){ throw new Error("no TextView control available!"); }, /* must return a textview control */
			bFinal: false /* if true, the helper must not be overwritten by an other library */
		};
	}

	return thisLib;

});
