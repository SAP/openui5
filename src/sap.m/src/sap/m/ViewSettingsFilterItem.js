/*!
 * ${copyright}
 */

// Provides control sap.m.ViewSettingsFilterItem.
sap.ui.define(['jquery.sap.global', './ViewSettingsItem', './library'],
	function(jQuery, ViewSettingsItem, library) {
	"use strict";


	
	/**
	 * Constructor for a new ViewSettingsFilterItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A ViewSettingsFilterItem is used for modelling filter behaviour in the ViewSettingsDialog.
	 * It is derived from a core Item, but does not support the base class properties "textDirection" and "enabled", setting these properties will not have any effects.
	 * @extends sap.m.ViewSettingsItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.ViewSettingsFilterItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ViewSettingsFilterItem = ViewSettingsItem.extend("sap.m.ViewSettingsFilterItem", /** @lends sap.m.ViewSettingsFilterItem.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * If set to (true), multi selection will be allowed for the items aggregation.
			 */
			multiSelect : {type : "boolean", group : "Behavior", defaultValue : true}
		},
		aggregations : {
	
			/**
			 * Items that are logically grouped under this filter item. They are used to display filter details in the ViewSettingsDialog.
			 */
			items : {type : "sap.m.ViewSettingsItem", multiple : true, singularName : "item"}
		}
	}});
	
	

	return ViewSettingsFilterItem;

}, /* bExport= */ true);
