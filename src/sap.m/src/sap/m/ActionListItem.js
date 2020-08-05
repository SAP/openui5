/*!
 * ${copyright}
 */

// Provides control sap.m.ActionListItem.
sap.ui.define(['./ListItemBase', './library', './ActionListItemRenderer'],
	function(ListItemBase, library, ActionListItemRenderer) {
	"use strict";



	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;



	/**
	 * Constructor for a new ActionListItem.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.ActionListItem</code> can be used like a <code>button</code> to fire actions when pressed.
	 * <b>Note:</b> The inherited <code>selected</code> property of the <code>sap.m.ListItemBase</code> is not supported.
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.ActionListItem
	 * @see {@link fiori:/action-list-item/ Action List Item}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ActionListItem = ListItemBase.extend("sap.m.ActionListItem", /** @lends sap.m.ActionListItem.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the text that appears in the control.
			 */
			text : {type : "string", group : "Misc", defaultValue : null}
		}
	}});


	/**
	 * Initializes member variables which are needed later on.
	 *
	 * @private
	 */
	ActionListItem.prototype.init = function() {
		this.setType(ListType.Active);
		ListItemBase.prototype.init.apply(this, arguments);
	};

	/**
	 * Determines item specific mode.
	 *
	 * ActionListItems are not selectable because they are command controls (like Button or Link),
	 * so triggering the associated command, rather than selection is appropriate to happen upon
	 * user action on these items.
	 *
	 * By overwriting <code>getMode</code> (inherited from <code>ListItemBase</code>), we
	 * exclude the item from processing steps that are specific for selectable list-items.
	 *
	 * @returns {sap.m.ListMode|""} Mode of the list item.
	 * @protected
	 * @overwrite
	 */
	ActionListItem.prototype.getMode = function() {
		return ListMode.None;
	};

	/**
	 * Event handler called when the space key is pressed.
	 *
	 * ActionListItems are command controls so keydown [SPACE] should have the same effect as keydown [ENTER] (i.e. triggering the associated command, instead of
	 * selection)
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	ActionListItem.prototype.onsapspace = ActionListItem.prototype.onsapenter;

	ActionListItem.prototype.getContentAnnouncement = function() {
		return this.getText();
	};

	return ActionListItem;

});
