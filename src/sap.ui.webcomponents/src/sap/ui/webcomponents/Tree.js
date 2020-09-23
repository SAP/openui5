/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Tree.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./library",
	"./thirdparty/ui5-wc-bundles/Tree"
], function(WebComponent, library) {
	"use strict";

	var ListMode = library.ListMode;

	/**
	 * Constructor for a new <code>Tree</code>.
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
	 * @alias sap.ui.webcomponents.Tree
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Tree = WebComponent.extend("sap.ui.webcomponents.Tree", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-tree",
			properties: {

				width : {
					type : "sap.ui.core.CSSSize",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				mode: {
					type: "sap.ui.webcomponents.ListMode",
					defaultValue: ListMode.None
				},

				headerText: {
					type: "string"
				},

				footerText: {
					type: "string"
				},

				noDataText: {
					type: "string"
				}
			},
			aggregations: {
				/**
				 * Defines the items contained within this control.
				 */
				items : {type : "sap.ui.webcomponents.TreeItem", multiple : true, singularName : "item", bindable : "bindable"},

				header : {type : "sap.ui.core.Control", multiple : false, slot : "header"}
			},
			events: {
				"itemToggle": {
					allowPreventDefault : true,
					parameters : {
						item: {type: "sap.ui.webcomponents.TreeItem"}
					}
				},
				"itemClick": {},
				"itemDelete": {},
				"selectionChange": {}
			}
		}
	});

	return Tree;
});
