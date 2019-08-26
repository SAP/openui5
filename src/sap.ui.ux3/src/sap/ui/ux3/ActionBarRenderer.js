/*!
 * ${copyright}
 */

sap.ui.define(["./library"],
	function(library) {
	"use strict";


	// shortcut for sap.ui.ux3.ActionBarSocialActions
	var ActionBarSocialActions = library.ActionBarSocialActions;


	/**
	 * Static initializer. Creates and empty ActionBarRenderer instance.
	 *
	 * @class ActionBar renderer.
	 * @static
	 */
	var ActionBarRenderer = {
		apiVersion: 2
	};



	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ActionBarRenderer.render = function(rm, oControl){

		// render ActionBar
		// result: <div id="<id>" data-sap-ui="<id>" class="sapUiUx3ActionBar" role="toolbar">
		rm.openStart("div", oControl);
		rm.class("sapUiUx3ActionBar");
		if ( sap.ui.getCore().getConfiguration().getAccessibility()) {
			rm.attr('role', 'toolbar');
		}
		rm.openEnd();

		// render list for social actions
		rm.openStart("ul", oControl.getId() + "-socialActions");
		rm.class("sapUiUx3ActionBarSocialActions");

		rm.style("min-width", oControl._getSocialActionListMinWidth() + "px");

		rm.openEnd();
		this.renderSocialActions(rm, oControl);
		rm.close("ul");

		// render list for business actions
		rm.openStart("ul", oControl.getId() + '-businessActions');
		rm.class("sapUiUx3ActionBarBusinessActions");
		rm.openEnd();
		this.renderBusinessActionButtons(rm, oControl);
		rm.close("ul");

		// closing tag for toolbar
		rm.close("div");

	};

	/**
	 * Renders the HTML for toolbar buttons of business actions
	 *
	 * @param {sap.ui.core.RenderManager}
	 *			rm the RenderManager that can be used for writing to
	 *			the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *			oControl an object representation of the control that should be
	 *			rendered
	 */
	ActionBarRenderer.renderBusinessActionButtons = function(rm, oControl) {

		var actionButtons = oControl._getBusinessActionButtons();
		var oMoreMenuButton = oControl._getMoreMenuButton();

		if (actionButtons && actionButtons.length > 0) {
			//Render list for business action buttons
			//Do not write attribue tabindex in list element because this is
			//already contained in the buttons control. If you write it twice,
			//both arrow and tab will work, which is wrong
			for ( var i = 0; i < actionButtons.length; i++) {
				var oButton = actionButtons[i];
				rm.openStart("li");
				rm.class("sapUiUx3ActionBarItemRight");
				rm.openEnd();
				rm.renderControl(oButton);
				rm.close("li");
			}
			this._renderMoreMenuButton(rm, oMoreMenuButton);
		} else if (oMoreMenuButton) {
			//There may be business actions which have to be displayed in the "More Menu"
			this._renderMoreMenuButton(rm, oMoreMenuButton);
		}
	}

	/**
	 * Renders "More" menu button if present
	 *
	 * @param {sap.ui.core.RenderManager}
	 *			rm the RenderManager that can be used for writing to
	 *			the Render-Output-Buffer
	 * @param {sap.ui.commons.MenuButton}
	 *			oMoreMenuButton menu button to be rendered, may be null
	 * @private
	 */;
	ActionBarRenderer._renderMoreMenuButton = function (rm, oMoreMenuButton) {

		if (oMoreMenuButton) {
			rm.openStart("li");
			rm.class("sapUiUx3ActionBarItemRight");
			rm.class("sapUiUx3ActionBarMoreButton");
			rm.openEnd();
			rm.renderControl(oMoreMenuButton);
			rm.close("li");
		}
	};



	/**
	 * Renders the HTML for sap.ui.ux3.Actionbar: social actions in a specified order:
	 * 1. Update (Feed)
	 * 2. Follow
	 * 3. Flag
	 * 4. Favorite
	 * 5. Open
	 *
	 * They are rendered only if they are present in action bar's 'mActionMap' though.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *			rm the RenderManager that can be used for writing to
	 *			the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *			oControl an object representation of the control that should be
	 *			rendered
	 */
	 ActionBarRenderer.renderSocialActions = function(rm, oControl) {

		var mMap = oControl.mActionMap;
		var mKeys = oControl.mActionKeys;


		if (mMap[mKeys.Update]) {
			this._renderSocialActionListItem(rm, oControl, mMap[mKeys.Update]);
		}
		if (mMap[mKeys.Follow]) {
			this._renderSocialActionListItem(rm, oControl, mMap[mKeys.Follow]);
		}
		if (mMap[mKeys.Flag]) {
			this._renderSocialActionListItem(rm, oControl, mMap[mKeys.Flag]);
		}
		if (mMap[mKeys.Favorite]) {
			this._renderSocialActionListItem(rm, oControl, mMap[mKeys.Favorite]);
		}
		if (mMap[mKeys.Open]) {
			this._renderSocialActionListItem(rm, oControl, mMap[mKeys.Open]);
		}
		//Render social actions, which might have been added by an application
		//developer to aggregation 'socialActions' manually and which are not contained
		//in the predefined list of social actions Update, Follow, Flag, Favorite, Open
		for (var sKey in  mMap) {
			if (!(sKey in ActionBarSocialActions)) {
				this._renderSocialActionListItem(rm, oControl, mMap[sKey]);
			}
		}
	 };

	 /**
	  * Renders the HTML for sap.ui.ux3.Actionbar: single social action list item
	  *
	  * @param {sap.ui.core.RenderManager}
	  *			rm the RenderManager that can be used for writing to
	  *			the Render-Output-Buffer
	  * @param {sap.ui.core.Control}
	  *			oControl an object representation of the control that should be
	  *			rendered
	  * @param {sap.ui.ux3.ThingAction}
	  *			action an object representation of the control that should be
	  *			rendered
	  *  @private
	  */
	  ActionBarRenderer._renderSocialActionListItem = function(rm, oControl, action) {
		if (action && !action.hide) {
			rm.openStart("li");
			rm.class("sapUiUx3ActionBarItem");
			rm.openEnd();
			this._renderSocialAction(rm, oControl, action);
			rm.close("li");
		}
	  };


	 /**
	 * Renders the HTML for sap.ui.ux3.Actionbar: single social action
	 *
	 * @param {sap.ui.core.RenderManager}
	 *			rm the RenderManager that can be used for writing to
	 *			the Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *			oControl an object representation of the control that should be
	 *			rendered
	 * @param {sap.ui.ux3.ThingAction}
	 *			action an object representation of the control that should be
	 *			rendered
	 *  @private
	 */
	 ActionBarRenderer._renderSocialAction = function(rm, oControl, action) {
		 rm.openStart("a", action);
		 rm.attr("role", "button");
		 rm.attr("aria-disabled", "false");
		 rm.attr("aria-haspopup", action.isMenu && action.isMenu(oControl) ? "true" : "false");

		if (action.name === oControl.mActionKeys.Flag || action.name === oControl.mActionKeys.Favorite) {
			rm.attr("aria-pressed", action.fnCalculateState(oControl) === "Selected" ? "true" : "false");
		}
		rm.attr("tabindex", "0");
		rm.class(action.cssClass);
		if (action.fnCalculateState) {
			rm.class(action.fnCalculateState(oControl));
		}
		rm.class("sapUiUx3ActionBarAction");

		if (action.getTooltip()) {
			rm.attr("title", action.getTooltip());
		}
		if (action.text) {
			rm.attr("text", oControl.getLocalizedText(action.getText()));
		}
		rm.openEnd();
		rm.close("a");
	 };






	return ActionBarRenderer;

});
