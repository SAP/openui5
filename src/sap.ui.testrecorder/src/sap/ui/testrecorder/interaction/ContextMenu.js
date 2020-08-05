/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/Object",
	"sap/ui/testrecorder/Constants",
	"sap/ui/testrecorder/interaction/Commands",
	"sap/ui/testrecorder/interaction/CommandExecutor",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels"
], function ($, BaseObject, constants, Commands, CommandExecutor, CommunicationBus, CommunicationChannels) {
	"use strict";

	var CONTEXTMENU_MARGIN = 5;
	var $contextmenu = null;
	var sSelectedDomElement = {};
	var mMenuItems = {};

	var ContextMenu = BaseObject.extend("sap.ui.testrecorder.interaction.ContextMenu", {});

	/**
	 * Set the position of the context menu.
	 * Creates and shows the context menu if necessary.
	 * @param {object} mData parameters to modify the menu appearance
	 * @param {string} mData.domElementId - The ID of the DOM element for which to show a context
	 * @param {object} mData.location - x and y of right click event
	 * @param {boolean} mData.withEvents - whether the menu actions should throw events or directly call the Command Executor.
	 * withEvents helps the contextmenu distinguish the context in which it is shown (is it app or control tree)
	 * @param {object} mData.items - override the visibility of menu items. By default all items are shown. If no value is given for an item, the default is applied.
	 * @returns {object} this
	 */
	ContextMenu.show = function (mData) {
		sSelectedDomElement = mData.domElementId;

		if ($contextmenu === null && !document.getElementById(constants.CONTEXTMENU_ID)) {
			$contextmenu = _createContextmenu(mData);
		}

		if (mData.items) {
			var aHiddenItems = Object.keys(mMenuItems).filter(function (sItem) {
				return !(mData.items[sItem] || mData.items[sItem] === undefined);
			});
			var aVisibleItems = Object.keys(mMenuItems).filter(function (sItem) {
				return mData.items[sItem] || mData.items[sItem] === undefined;
			});

			if (aHiddenItems.length === Object.keys(mMenuItems).length) {
				// hide the entire menu if all items should be hidden
				this.hide();
				return this;
			}

			aHiddenItems.forEach(function (sItem) {
				mMenuItems[sItem].hide();
			});
			aVisibleItems.forEach(function (sItem) {
				mMenuItems[sItem].show();
			});
		}

		var sViewportWidth = $(window).width();
		var sViewportHeight = $(window).height();
		var sMenuWidth = $contextmenu.width();
		var sMenuHeight = $contextmenu.height();
		var sMenuX = mData.location.x + sMenuWidth + CONTEXTMENU_MARGIN >= sViewportWidth ? mData.location.x - sMenuWidth : mData.location.x;
		var sMenuY = mData.location.y + sMenuHeight + CONTEXTMENU_MARGIN >= sViewportHeight ? mData.location.y - sMenuHeight : mData.location.y;
		$contextmenu.css("top", (sMenuY + CONTEXTMENU_MARGIN) + "px");
		$contextmenu.css("left", (sMenuX + CONTEXTMENU_MARGIN) + "px");

		ContextMenu._show();
		return this;
	};

	ContextMenu.hide = function () {
		if ($contextmenu) {
			$contextmenu.hide();
		}
	};

	ContextMenu._show = function () {
		if ($contextmenu) {
			$contextmenu.show();
		}
	};

	function _createContextmenu(mData) {
		var $contextmenu = $("<div></div>");
		var $highlight = $("<div></div>");
		var $press = $("<div></div>");
		var $enterText = $("<div></div>");

		mMenuItems = {
			highlight: $highlight,
			press: $press,
			enterText: $enterText
		};

		$highlight.text("Highlight");
		$press.text("Press");
		$enterText.text("Enter Text");

		$highlight.on("click", function () {
			ContextMenu.hide();
			var mCommandData = {
				domElementId: sSelectedDomElement
			};
			if (mData.withEvents) {
				CommunicationBus.publish(CommunicationChannels.CONTEXT_MENU_HIGHLIGHT, mCommandData);
			} else {
				CommandExecutor.execute(Commands.HIGHLIGHT, mCommandData);
			}
		});

		$press.on("click", function () {
			ContextMenu.hide();
			var mCommandData = {
				domElementId: sSelectedDomElement
			};
			if (mData.withEvents) {
				CommunicationBus.publish(CommunicationChannels.CONTEXT_MENU_PRESS, mCommandData);
			} else {
				CommandExecutor.execute(Commands.PRESS, mCommandData);
			}
		});

		$enterText.on("click", function () {
			ContextMenu.hide();
			var mCommandData = {
				domElementId: sSelectedDomElement
			};
			if (mData.withEvents) {
				CommunicationBus.publish(CommunicationChannels.CONTEXT_MENU_ENTER_TEXT, mCommandData);
			} else {
				CommandExecutor.execute(Commands.ENTER_TEXT, mCommandData);
			}
		});

		$contextmenu.attr("id", constants.CONTEXTMENU_ID);
		$contextmenu.css("min-width", "150px");
		$contextmenu.css("position", "absolute");
		$contextmenu.css("z-index", 1001); // should be more than Highlighter z-index
		$contextmenu.css("border", "1px solid rgb(200, 142, 250)");
		$contextmenu.css("border-radius", "3px");
		$contextmenu.css("background", "#fff");
		$contextmenu.css("box-sizing", "border-box");

		[$highlight, $enterText, $press].forEach(function ($element) {
			$element.css("padding", "16px");
			$element.css("cursor", "pointer");
			$element.hover(function () {
				$element.css("background-color", "#ebf5fe");
			}, function () {
				$element.css("background-color", "transparent");
			});
		});

		[$highlight, $press].forEach(function ($element) {
			$element.css("border-bottom", "1px solid #d9d9d9");
		});

		$contextmenu.append($highlight);
		$contextmenu.append($press);
		$contextmenu.append($enterText);

		$(document.body).append($contextmenu);

		return $contextmenu;
	}

	return ContextMenu;
});
