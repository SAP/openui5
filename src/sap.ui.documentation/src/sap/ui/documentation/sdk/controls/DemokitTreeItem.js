
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/TreeItemBase"
], function (TreeItemBase) {
	"use strict";

	/**
	 * @private
	 * @ui5-restricted sdk
	 */
	return TreeItemBase.extend("sap.ui.documentation.sdk.controls.DemokitTreeItem", {
		metadata : {
			properties: {
				title : {type : "string", defaultValue : ""},
				deprecated: {type : "boolean", defaultValue : false}
			}
		},
		init: function () {
			TreeItemBase.prototype.init.call(this);
			this.addStyleClass("sapDemokitTreeItem");
		}
	});
});