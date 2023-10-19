/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.TabSeparator.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"./thirdparty/TabSeparator"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>TabSeparator</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * The <code>sap.ui.webc.main.TabSeparator</code> represents a vertical line to separate tabs inside a <code>sap.ui.webc.main.TabContainer</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.TabSeparator
	 * @implements sap.ui.webc.main.ITab
	 */
	var TabSeparator = WebComponent.extend("sap.ui.webc.main.TabSeparator", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-tab-separator-ui5",
			interfaces: [
				"sap.ui.webc.main.ITab"
			],
			methods: ["getTabInStripDomRef"]
		}
	});

	/**
	 * Returns the DOM reference of the separator that is placed in the header. <b>Note:</b> Tabs and separators, placed in the <code>subTabs</code> slot of other tabs are not shown in the header. Calling this method on such tabs or separators will return <code>null</code>.
	 * @public
	 * @name sap.ui.webc.main.TabSeparator#getTabInStripDomRef
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return TabSeparator;
});
