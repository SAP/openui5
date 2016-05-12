/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.table.
 */
sap.ui.define(['jquery.sap.global',
	'sap/ui/core/library', // library dependency
	'sap/ui/unified/library'], // library dependency
	function(jQuery) {

	"use strict";

	/**
	 * Table-like controls, mainly for desktop scenarios.
	 *
	 * @namespace
	 * @name sap.ui.table
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.table",
		version: "${version}",
		dependencies : ["sap.ui.core","sap.ui.unified"],
		types: [
			"sap.ui.table.NavigationMode",
			"sap.ui.table.SelectionBehavior",
			"sap.ui.table.SelectionMode",
			"sap.ui.table.SortOrder",
			"sap.ui.table.VisibleRowCountMode",
			"sap.ui.table.SharedDomRef"
		],
		interfaces: [],
		controls: [
			"sap.ui.table.AnalyticalColumnMenu",
			"sap.ui.table.AnalyticalTable",
			"sap.ui.table.ColumnMenu",
			"sap.ui.table.Table",
			"sap.ui.table.TreeTable"
		],
		elements: [
			"sap.ui.table.AnalyticalColumn",
			"sap.ui.table.Column",
			"sap.ui.table.Row"
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
			}
		}
	});


	/**
	 * Navigation mode of the table
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.table.NavigationMode = {

		/**
		 * Uses the scrollbar control.
		 * @public
		 */
		Scrollbar : "Scrollbar",

		/**
		 * Uses the paginator control.
		 * @public
		 */
		Paginator : "Paginator"

	};


	/**
	 * Selection behavior of the table
	 *
	 * @version ${version}
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.table.SelectionBehavior = {

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
	sap.ui.table.SelectionMode = {

		/**
		 * Select multiple rows at a time (toggle behavior).
		 * @public
		 */
		MultiToggle : "MultiToggle",

		/**
		 * Select multiple rows at a time.
		 * @public
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
	sap.ui.table.SortOrder = {

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
	sap.ui.table.VisibleRowCountMode = {

		/**
		 * The table always has as many rows as defined in the visibleRowCount property.
		 * @public
		 */
		Fixed : "Fixed",

		/**
		 * After rendering the table has as many rows as defined in visibleRowCount property. The user is able to change the visible rows by moving a grip with the mouse. The visibleRowCount property is changed accordingly.
		 * @public
		 */
		Interactive : "Interactive",

		/**
		 * The table automatically fills the height of the surrounding container.
		 * The visibleRowCount property is automatically changed accordingly.
		 * All rows need the same height, otherwise the auto mode doesn't always work as expected.
		 * The height of all siblings within the same layout container of the table will be subtracted from the available height.
		 * For performance reasons, it is recommended to add no siblings in the table's parent container.
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
	sap.ui.table.SharedDomRef = {

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
	sap.ui.table.GroupEventType = {
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
	sap.ui.table.ColumnHeader = sap.ui.table.Column;

	//factory for table to create labels an textviews to be overwritten by commons and mobile library
	if (!sap.ui.table.TableHelper) {
		sap.ui.table.TableHelper = {
			createLabel: function(mConfig){ throw new Error("no Label control available!"); }, /* must return a Label control */
			createTextView: function(mConfig){ throw new Error("no TextView control available!"); }, /* must return a textview control */
			createTextField: function(mConfig){ throw new Error("no TextField control available!"); }, /* must return a textfield control */
			createImage: function(mConfig){ throw new Error("no Image control available!"); }, /* must return a textview control */
			bFinal: false /* if true, the helper must not be overwritten by an other library */
		};
	}

	return sap.ui.table;

});
