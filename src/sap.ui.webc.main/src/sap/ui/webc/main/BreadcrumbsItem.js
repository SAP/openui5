/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.BreadcrumbsItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/BreadcrumbsItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>BreadcrumbsItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.BreadcrumbsItem</code> component defines the content of an item in <code>ui5-breadcumbs</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.95.0
	 * @experimental Since 1.95.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.BreadcrumbsItem
	 * @implements sap.ui.webc.main.IBreadcrumbsItem
	 */
	var BreadcrumbsItem = WebComponent.extend("sap.ui.webc.main.BreadcrumbsItem", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-breadcrumbs-item-ui5",
			interfaces: [
				"sap.ui.webc.main.IBreadcrumbsItem"
			],
			properties: {

				/**
				 * Defines the accessible aria name of the item.
				 */
				accessibleName: {
					type: "string",
					defaultValue: undefined
				},

				/**
				 * Defines the link href. <br>
				 * <br>
				 * <b>Note:</b> Standard hyperlink behavior is supported.
				 */
				href: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the link target. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>_self</code></li>
				 *     <li><code>_top</code></li>
				 *     <li><code>_blank</code></li>
				 *     <li><code>_parent</code></li>
				 *     <li><code>_search</code></li>
				 * </ul> <br>
				 * <br>
				 * <b>Note:<b> This property must only be used when the <code>href</code> property is set.
				 */
				target: {
					type: "string",
					defaultValue: undefined
				},

				/**
				 * Defines the content of the control
				 */
				text: {
					type: "string",
					defaultValue: "",
					mapping: "textContent"
				}
			},
			designtime: "sap/ui/webc/main/designtime/BreadcrumbsItem.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return BreadcrumbsItem;
});