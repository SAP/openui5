/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.table.
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/base/DataType",
	"sap/ui/model/TreeAutoExpandMode", // TODO: Remove in UI5 2.0
	// library dependencies
	"sap/ui/core/library",
	"sap/ui/unified/library"
], function(
	Library,
	DataType,
	TreeAutoExpandMode // TODO: Remove in UI5 2.0
) {
	"use strict";

	/**
	 * Table-like controls, mainly for desktop scenarios.
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
		designtime: "sap/ui/table/designtime/library.designtime",
		types: [
			/** @deprecated As of version 1.38, the concept has been discarded. */
			"sap.ui.table.NavigationMode",
			"sap.ui.table.RowActionType",
			"sap.ui.table.SelectionBehavior",
			"sap.ui.table.SelectionMode",
			/** @deprecated As of version 1.120, replaced by <code>sap.ui.core.SortOrder</code> */
			"sap.ui.table.SortOrder",
			/** @deprecated As of version 1.119, see the <code>rowMode</code> aggregation of <code>sap.ui.table.Table</code> for more details. */
			"sap.ui.table.VisibleRowCountMode",
			/** @deprecated As of version 1.120, replaced by <code>sap.ui.model.TreeAutoExpandMode</code> */
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
			"sap.ui.table.rowmodes.Fixed",
			"sap.ui.table.rowmodes.Interactive",
			"sap.ui.table.rowmodes.Auto",
			"sap.ui.table.plugins.SelectionPlugin",
			"sap.ui.table.plugins.MultiSelectionPlugin",
			"sap.ui.table.plugins.ODataV4Selection"
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
	 * Navigation mode of the table
	 *
	 * @version ${version}
	 * @enum {string}
	 * @deprecated As of version 1.38, the concept has been discarded.
	 * @public
	 */
	thisLib.NavigationMode = {

		/**
		 * Uses the scrollbar control.
		 * @public
		 */
		Scrollbar: "Scrollbar",

		/**
		 * Uses the paginator control.
		 * This option must no longer be used. Using a scrollbar is the only navigation mode which is supported by
		 * the <code>sap.ui.table</code> library. The <code>navigationMode</code> property has always been a visual
		 * representation. No matter which navigation mode is used, data fetched from an OData service is loaded page-wise.
		 * @public
		 * @deprecated As of version 1.38, replaced by {@link sap.ui.table.NavigationMode.Scrollbar}
		 */
		Paginator: "Paginator"

	};

	/** @deprecated As of version 1.38 */
	DataType.registerEnum("sap.ui.table.NavigationMode", thisLib.NavigationMode);

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
		 * Select multiple rows at a time.
		 * @public
		 * @deprecated As of version 1.38, replaced by {@link sap.ui.table.SelectionMode.MultiToggle}
		 */
		Multi: "Multi",

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
	 * Sort order of a column
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @deprecated As of version 1.120, replaced with <code>sap.ui.core.SortOrder</code>
	 */
	thisLib.SortOrder = {

		/**
		 * Sort Order: ascending.
		 * @public
		 */
		Ascending: "Ascending",

		/**
		 * Sort Order: descending.
		 * @public
		 */
		Descending: "Descending"

	};

	/** @deprecated As of version 1.120 */
	DataType.registerEnum("sap.ui.table.SortOrder", thisLib.SortOrder);

	/**
	 * VisibleRowCountMode of the table
	 *
	 * @version ${version}
	 * @enum {string}
	 * @deprecated As of version 1.119, see the <code>rowMode</code> aggregation of <code>sap.ui.table.Table</code> for more details.
	 * @public
	 */
	thisLib.VisibleRowCountMode = {

		/**
		 * The table always has as many rows as defined in the <code>visibleRowCount</code> property.
		 * @public
		 */
		Fixed: "Fixed",

		/**
		 * The user can change the <code>visibleRowCount</code> by dragging a resizer.
		 *
		 * The following restrictions apply:
		 * <ul>
		 *   <li>The functionality targets only the mouse interaction (drag and drop). There is no keyboard alternative available.
		 *       An accessible alternative must be provided by applications, for example, by giving the user the possibility to enter
		 *       the number of required rows in an input field.</li>
		 *   <li>The resize interaction is not optimized for touch devices from a design and interaction perspective.
		 *       We do not recommend to use this mode in such scenarios.</li>
		 * </ul>
		 *
		 * @public
		 */
		Interactive: "Interactive",

		/**
		 * The table automatically fills the height of the surrounding container.
		 * @public
		 */
		Auto: "Auto"

	};

	/** @deprecated As of version 1.119 */
	DataType.registerEnum("sap.ui.table.VisibleRowCountMode", thisLib.VisibleRowCountMode);

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

	/**
	 * Enumeration of the <code>ResetAllMode</code> that can be used in a <code>TablePersoController</code>.
	 * @enum {string}
	 * @public
	 * @deprecated As of version 1.115, replaced by {@link sap.m.p13n.Engine}
	 */
	thisLib.ResetAllMode = {

		/**
		 * Default behavior of the <code>TablePersoDialog</code> Reset All button.
		 * @public
		 */
		Default: "Default",

		/**
		 * Resets the table to the default of the attached <code>PersoService</code>.
		 * @public
		 */
		ServiceDefault: "ServiceDefault",

		/**
		 * Resets the table to the result of <code>getResetPersData</code> of the attached <code>PersoService</code>.
		 * @public
		 */
		ServiceReset: "ServiceReset"
	};

	/** @deprecated As of version 1.115 */
	DataType.registerEnum("sap.ui.table.ResetAllMode", thisLib.ResetAllMode);

	/** @deprecated As of version 1.120 */
	thisLib.ColumnHeader = thisLib.Column; // map the new Column to the old ColumnHeader

	/**
	 * Different modes for setting the auto expand mode on tree or analytical bindings.
	 *
	 * This is an alias for {@link sap.ui.model.TreeAutoExpandMode} and kept for compatibility reasons.
	 *
	 * @version ${version}
	 * @typedef {sap.ui.model.TreeAutoExpandMode}
	 * @public
	 * @deprecated As of version 1.120, replaced by <code>sap.ui.model.TreeAutoExpandMode</code>
	 */
	thisLib.TreeAutoExpandMode = TreeAutoExpandMode;

	if (!thisLib.plugins) {
		thisLib.plugins = {};
	}

	//factory for table to create labels and textviews to be overwritten by commons and mobile library
	/**
	 * @deprecated As of version 1.118
	 */
	if (!thisLib.TableHelper) {
		thisLib.TableHelper = {
			addTableClass: function() { return ""; }, /* must return some additional CSS class */
			createLabel: function(mConfig) { throw new Error("no Label control available!"); }, /* must return a Label control */
			createTextView: function(mConfig) { throw new Error("no TextView control available!"); }, /* must return a textview control */
			bFinal: false /* if true, the helper must not be overwritten by an other library */
		};
	}

	return thisLib;

});