/*!
 * ${copyright}
 */

// Provides control sap.m.ViewSettingsItem.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Item'],
	function(jQuery, library, Item) {
	"use strict";



	/**
	 * Constructor for a new ViewSettingsItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ViewSettingsItem is used for modelling filter behaviour in the ViewSettingsDialog.
	 * It is derived from a core Item, but does not support the base class properties "textDirection" and "enabled", setting these properties will not have any effects.
	 * @extends sap.ui.core.Item
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.ViewSettingsItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ViewSettingsItem = Item.extend("sap.m.ViewSettingsItem", /** @lends sap.m.ViewSettingsItem.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Selected state of the item. If set to "true", the item will be displayed as selected in the view settings dialog.
			 */
			selected : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		events : {
			/**
			 * Let the outside world know that some of its properties has changed.
			 * @private
			 */
			itemPropertyChanged: {
				parameters: {
					/**
					 * Instance of the item that changed.
					 */
					changedItem: {type: 'sap.m.ViewSettingsItem'},
					/**
					 * Key of the changed property.
					 */
					propertyKey: {type: "string"},
					/**
					 * Value of the changed property.
					 */
					propertyValue:  {type: "any"}
				}
			}
		}
	}});

	ViewSettingsItem.prototype.setSelected = function(bValue) {
		ViewSettingsItem.prototype.setProperty.call(this, "selected", bValue, true);
		return this;
	};

	/**
	 * Overriding of the setProperty method in order to fire an event.
	 *
	 * @override
	 * @param {string} sName The name of the property
	 * @param {string} sValue The value of the property
	 * @param {boolean} bSupressInvalidation
	 */
	ViewSettingsItem.prototype.setProperty = function (sName, vValue, bSupressInvalidation, bFireEvent) {
		sap.ui.base.ManagedObject.prototype.setProperty.apply(this, arguments);

		bFireEvent = bFireEvent === undefined ? true : bFireEvent;

		if (bFireEvent) {
			this.fireItemPropertyChanged({
				changedItem: this,
				propertyKey: sName,
				propertyValue: vValue
			});
		}
	};

	return ViewSettingsItem;

}, /* bExport= */ true);
