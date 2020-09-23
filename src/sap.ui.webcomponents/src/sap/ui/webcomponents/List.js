/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.List.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./library",
	"./thirdparty/ui5-wc-bundles/List"
], function(WebComponent, library) {
	"use strict";

	var ListMode = library.ListMode;
	var ListSeparators = library.ListSeparators;

	/**
	 * Constructor for a new <code>List</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.List
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var List = WebComponent.extend("sap.ui.webcomponents.List", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-list",
			properties: {

				width : {
					type : "sap.ui.core.CSSSize",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				headerText: {
					type: "string"
				},

				footerText: {
					type: "string"
				},

				inset: {
					type: "boolean"
				},

				mode: {
					type: "sap.ui.webcomponents.ListMode",
					defaultValue: ListMode.None
				},

				noDataText: {
					type: "string"
				},

				separators: {
					type: "sap.ui.webcomponents.ListSeparators",
					defaultValue: ListSeparators.All
				},

				infiniteScroll: {
					type: "boolean"
				},

				busy: {
					type: "boolean"
				}
			},
			aggregations: {
				/**
				 * Defines the items contained within this control.
				 */
				items : {type : "sap.ui.webcomponents.ListItemBase", multiple : true, singularName : "item", bindable : "bindable"},

				header : {type : "sap.ui.core.Control", multiple : false, slot : "header"}
			},
			events: {
				"itemClick": {},
				"itemClose": {},
				"itemToggle": {},
				"itemDelete": {},
				"selectionChange": {},
				"loadMore": {}
			}
		}
	});

	return List;
});
