/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/base/util/restricted/_pick"
], function (
	OverlayRegistry,
	DtUtil,
	_pick
) {
	"use strict";

	/**
	 * Provides necessary functionality to get and execute actions on controls. Actions are UI operations available in key user adaptation such as rename, remove, move etc.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.Action
	 * @author SAP SE
	 * @experimental Since 1.58
	 * @since 1.58
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 *
	*/

	/**
	 * Object containing the detailed information about the action.
	 *
	 * <pre>
	 * {
	 *    id: &lt;string&gt;, // ID of the action
	 *    group: &lt;string&gt;, // Group name, in case the action has been grouped with other action(s)
	 *    icon: &lt;string&gt;, // Icon name
	 *    enabled: &lt;boolean&gt;, // Indicates whether the action is active and can be executed
	 *    rank: &lt;int&gt;, // Sorting rank for visual representation of the action position
	 *    text: &lt;string&gt;, // Action name
	 * }
	 * </pre>
	 *
	 *
	 * @typedef {object} sap.ui.rta.service.Action.ActionObject
	 * @since 1.58
	 * @private
	 * @ui5-restricted
	 * @property {string} id - ID of the action
	 * @property {string} group - Group name in case the action has been grouped with other action(s)
	 * @property {string} icon - Icon name
	 * @property {boolean} enabled - Indicates whether the action is active and can be executed
	 * @property {int} rank - Sorting rank for visual representation of the action position
	 * @property {string} text - Action name
	*/


	return function (oRta) {
		function invoke(vValue, oOverlay) {
			return typeof vValue === 'function'
				? vValue(oOverlay)
				: vValue;
		}

		function getActions(aElementOverlays) {
			var aMenuItemPromises = oRta._oDesignTime.getPlugins()
				.map(function (oPlugin) {
					return oPlugin.getMenuItems(aElementOverlays);
				});
			return Promise.all(aMenuItemPromises)
				.then(function(aMenuItems) {
					return aMenuItems
						.reduce(function (aResult, aMenuItems) {
							return aMenuItems
								? aResult.concat(aMenuItems)
								: aResult;
						}, [])
						.map(function (mMenuItem) {
							return Object.assign({}, mMenuItem, {
								enabled: invoke(mMenuItem.enabled, aElementOverlays),
								text: invoke(mMenuItem.text, aElementOverlays[0])
							});
						});
				});
		}

		function get(vControlIds) {
			var aControlIds = DtUtil.castArray(vControlIds);
			var aElementOverlays = aControlIds.map(function (sControlId) {
				var oElementOverlay = OverlayRegistry.getOverlay(sControlId);

				if (!oElementOverlay) {
					throw new Error(DtUtil.printf('Control with id="{0}" is not under the one of root elements or ignored.', sControlId));
				}

				return oElementOverlay;
			});

			return getActions(aElementOverlays)
				.then(function(aMenuItems) {
					return aMenuItems.map(function (mMenuItem) {
						return _pick(mMenuItem, ['id', 'icon', 'rank', 'group', 'enabled', 'text']);
					});
				});
		}

		function execute(vControlIds, sActionId) {
			var aControlIds = DtUtil.castArray(vControlIds);
			var aElementOverlays = aControlIds.map(function (sControlId) {
				var oElementOverlay = OverlayRegistry.getOverlay(sControlId);

				if (!oElementOverlay) {
					throw new Error(DtUtil.printf('Control with id="{0}" is not under the one of root elements or ignored.', sControlId));
				}

				return oElementOverlay;
			});

			return getActions(aElementOverlays)
				.then(function(aActions) {
					var mAction = aActions.filter(function (mAction) {
						return mAction.id === sActionId;
					}).pop();

					if (!mAction) {
						throw new Error('No action found by specified ID');
					} else {
						return mAction.handler(aElementOverlays, {});
					}
				});
		}

		return {
			exports: {
				/**
				 * Returns a list of available actions for the specified control(s) wrapped in a promise.
				 *
				 * Example:
				 *
				 * <pre>
				 * [
				 *     {
				 *         "id": "CTX_RENAME",
				 *         "text": "Rename",
				 *         "enabled": false,
				 *         "rank": 10,
				 *         "icon": "sap-icon://edit"
				 *     },
				 *     {
				 *         "id": "CTX_ADD_ELEMENTS_AS_SIBLING",
				 *         "text": "Add Field",
				 *         "enabled": false,
				 *         "rank": 20,
				 *         "icon": "sap-icon://add",
				 *         "group": "Add"
				 *     },
				 *     {
				 *         "id": "CTX_REMOVE",
				 *         "text": "Remove",
				 *         "enabled": true,
				 *         "rank": 60,
				 *         "icon": "sap-icon://decline"
				 *     },
				 *     {
				 *         "id": "CTX_CUT",
				 *         "text": "Cut",
				 *         "enabled": false,
				 *         "rank": 70,
				 *         "icon": "sap-icon://scissors"
				 *     },
				 *     {
				 *         "id": "CTX_PASTE",
				 *         "text": "Paste",
				 *         "enabled": false,
				 *         "rank": 80,
				 *         "icon": "sap-icon://paste"
				 *     }
				 * ]
				 * </pre>
				 *
				 * @name sap.ui.rta.service.Action.get
				 * @param {string|string[]} vControlIds - Control ID or an array of IDs to get actions for
				 * @returns {Promise.<sap.ui.rta.service.Action.ActionObject[]>} List of available actions wrapped in a promise
				 * @public
				 * @function
				 */
				get: get,

				/**
				 * Returns a list of available actions for the specified control(s).
				 *
				 * @name sap.ui.rta.service.Action.execute
				 * @param {string|string[]} vControlIds - Control ID or an array of IDs to get actions for
				 * @param {string} sActionId - Action ID to be executed on the specified controls
				 * @returns {Promise.<any>} Result of the operation wrapped in a promise.
				 * @public
				 * @function
				 */
				execute: execute
			}
		};
	};
});