/*!
 * ${copyright}
 */

sap.ui.define([
	"./ListBase",
	"./NotificationListRenderer"
],
function(
	ListBase,
	NotificationListRenderer
	) {
	'use strict';

	/**
	 * Constructor for a new <code>NotificationList<code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NotificationList control provides a container for <code>NotificationListGroup</code>
	 * and <code>NotificationListItem</code>.
	 *
	 * @extends sap.m.ListBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.90
	 * @alias sap.m.NotificationList
	 */
	var NotificationList = ListBase.extend('sap.m.NotificationList', /** @lends sap.m.NotificationList.prototype */ {
		metadata: {
			library: 'sap.m'
		},

		renderer: NotificationListRenderer
	});

	NotificationList.prototype.onItemFocusIn = function() { };

	NotificationList.prototype._startItemNavigation = function () {
		ListBase.prototype._startItemNavigation.call(this);

		if (this._oItemNavigation) {
			this._oItemNavigation.setTableMode(false);
		}
	};

	NotificationList.prototype.setNavigationItems = function(oItemNavigation, oNavigationRoot) {
		var aItems = [],
			aGroupItems = oNavigationRoot.querySelectorAll(":scope > .sapMNLGroup"),
			aListItems = oNavigationRoot.querySelectorAll(":scope > .sapMNLI");

		aGroupItems.forEach(function (oGroupItem) {
			aItems.push(oGroupItem);
			aItems = aItems.concat(Array.from(oGroupItem.querySelectorAll(".sapMNLI")));
		});

		aItems = aItems.concat(Array.from(aListItems));

		oItemNavigation.setItemDomRefs(aItems);
	};

	return NotificationList;
});
