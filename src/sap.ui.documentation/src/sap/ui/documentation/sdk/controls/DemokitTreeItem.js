
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
				deprecated: {type : "boolean", defaultValue : false},
				target: {type: "string", defaultValue: ""},
				encodeTarget: {type: "boolean", defaultValue: false},
				section: {type: "string", defaultValue: "#"},
				entityType: {type: "string", defaultValue: ""}
			}
		},
		getHref: function () {
			return '#/' + this.getSection() + '/' +
				(this.getEncodeTarget() ? encodeURIComponent(this.getTarget()) : this.getTarget());
		},
		/**
		 * Override of padding method as in DemoKit we need a custom tree padding behavior. We don't take into account
		 * the nesting level to adjust padding size
		 * @returns {number} padding
		 * @override
		 * @private
		 */
		_getPadding: TreeItemBase.prototype.getLevel
	});
});