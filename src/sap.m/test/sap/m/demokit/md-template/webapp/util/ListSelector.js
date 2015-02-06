sap.ui.define(['sap/ui/base/Object'], function (Object) {
	"use strict";

	return Object.extend("sap.ui.demo.mdtemplate.util.ListSelector", {
		/**
		 * Provides a convenience API for selecting list items. All the functions will wait until the initial load of the a List passed to the instance by the setBoundMasterList
		 * function.
		 *
		 * @class
		 * @public
		 * @alias sap.ui.demo.mdtemplate.util.ListSelector
		 */
		constructor : function () {

			// this promise needs to be created in the constructor, since it is allowed to invoke selectItem functions before calling setBoundMasterList
			this.oWhenListLoadingIsDone = new Promise(function (fnResolve, fnReject) {
				// Used to wait until the setBound masterList function is invoked
				new Promise(function (fnResolveListHasBeenSet) {
					this._fnResolveListHasBeenSet = fnResolveListHasBeenSet;
				}.bind(this))
					.then(function (oList) {
						oList.attachEventOnce("updateFinished", function() {
							var oFirstListItem = oList.getItems()[0];

							if (oFirstListItem) {
								fnResolve(oFirstListItem.getBindingContext().getPath());
							} else {
								//no items in the list
								fnReject();
							}

						});
					});
			}.bind(this));

		},

		/**
		 * A bound list should be passed in here. Should be done, before the list has received its initial data from the server.
		 * May only be invoked once per ListSelector instance.
		 *
		 * @param {sap.m.List} oList The list all the select functions will be invoked on.
		 * @public
		 */
		setBoundMasterList : function (oList) {
			this._oList = oList;
			this._fnResolveListHasBeenSet(oList);
		},

		/**
		 * After the list is loaded, the first item will be selected, if there are items and if the ListMode is not None.
		 * @public
		 */
		selectAndScrollToFirstItem : function () {
			this.oWhenListLoadingIsDone.then(this._selectAndScrollToFirstItem.bind(this));
		},

		/**
		 * Searches for the first item of the list then
		 * @private
		 */
		_selectAndScrollToFirstItem : function(sPath) {
			if (sPath) {
				this.selectAndScrollToAListItem(sPath);
			}
		},

		/**
		 * Tries to select and scroll to a list item with a matching binding context. If there are no items matching the binding context or the ListMode is none,
		 * no selection/scrolling will happen
		 *
		 * @param sBindingPath the binding path matching the binding path of a list item
		 * @public
		 */
		selectAndScrollToAListItem : function (sBindingPath) {

			this.oWhenListLoadingIsDone.then(function () {
				var oList = this._oList,
					oSelectedItem;

				if (oList.getMode() === "None") {
					return;
				}

				oSelectedItem = oList.getSelectedItem();

				// skip update if the current selection is already matching the object path
				if (oSelectedItem && oSelectedItem.getBindingContext().getPath() === sBindingPath) {
					return;
				}

				oList.getItems().some(function (oItem) {
					if (oItem.getBindingContext().getPath() === sBindingPath) {
						oList.setSelectedItem(oItem);
						return true;
					}
				});
			}.bind(this));
		}
	});

}, /* bExport= */ true);