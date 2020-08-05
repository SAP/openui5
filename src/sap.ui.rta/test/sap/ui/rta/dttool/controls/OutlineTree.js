/*
 * ! ${copyright}
 */
// Provides control sap.ui.rta.dttool.controls.OutlineTree.
/* globals sap */
sap.ui.define([
	"sap/m/Tree",
	"sap/m/TreeRenderer"
], function(
	Tree,
	TreeRenderer
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.dttool.controls.OutlineTree control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class A simple OutlineTree.
	 * @extends sap.m.Tree
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.rta.dttool.controls.OutlineTree
	 */
	var OutlineTree = Tree.extend('sap.ui.rta.dttool.controls.OutlineTree', {

		metadata: {
		},

		renderer : function () {
			TreeRenderer.render.apply(this, arguments);
		}
	});

	/**
	 * Selects item by path
	 * @param {string} sPath The Item path
	 * @param {boolean} bSelect Sets selected status of the list item. Default value is true.
	 * @private
	 */
	Tree.prototype.setSelectedItemByPath = function (sPath, bSelect) {
		var aItems;

		if (bSelect === undefined || bSelect) {
			var aPathSegments = sPath.split("/");

			var iStartIndex = 0;

			var fnExpandItems = function (sPath, bSelect, oItem, iIndex) {
				if (oItem.getBindingContextPath() === sPath) {
					if (bSelect) {
						this.setSelectedItem(oItem);
						setTimeout(function () {
							oItem.focus();
						}, 0);
						return true;
					}
					if (!oItem.getExpanded()) {
						this.onItemExpanderPressed(oItem);
					}
					iStartIndex += iIndex + 1;
					return true;
				}
			};

			for (var i = 2; i <= aPathSegments.length; i += 2) {
				var sSegmentsPath = aPathSegments.slice(0, i).join("/");
				aItems = this.getItems();
				aItems.slice(iStartIndex).some(fnExpandItems.bind(this, sSegmentsPath, i === aPathSegments.length));
			}
		} else {
			aItems = this.getItems();
			aItems.some(function (oItem) {
				if (oItem.getBindingContextPath() === sPath) {
					this.setSelectedItem(oItem, false);
					return true;
				}
			}.bind(this));
		}
	};

	return OutlineTree;
});