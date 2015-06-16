/*!
 * ${copyright}
 */

// Provides the concept of a sorter for list bindings
sap.ui.define(['sap/ui/base/Object'],
	function(BaseObject) {
	"use strict";


	/**
	 *
	 * Constructor for Sorter
	 *
	 * @class
	 * Sorter for the list binding
	 * This object defines the sort order for the list binding.
	 *
	 *
	 * @param {String} sPath the binding path used for sorting
	 * @param {boolean} [bDescending=false] whether the sort order should be descending
	 * @param {boolean|function} vGroup configure grouping of the content, can either be true to enable grouping
	 *        based on the raw model property value, or a function which calculates the group value out of the 
	 *        context (e.g. oContext.getProperty("date").getYear() for year grouping). The control needs to
	 *        implement the grouping behaviour for the aggregation which you want to group.
	 * @public
	 * @alias sap.ui.model.Sorter
	 */
	var Sorter = BaseObject.extend("sap.ui.model.Sorter", /** @lends sap.ui.model.Sorter.prototype */ {
		
		constructor : function(sPath, bDescending, vGroup){
			if (typeof sPath === "object") {
				var oSorterData = sPath;
				sPath = oSorterData.path;
				bDescending = oSorterData.descending;
				vGroup = oSorterData.group;
			}
			this.sPath = sPath;
	
			// if a model separator is found in the path, extract model name
			var iSeparatorPos = this.sPath.indexOf(">");
			if (iSeparatorPos > 0) {
				this.sPath = this.sPath.substr(iSeparatorPos + 1);
			}
	
			this.bDescending = bDescending;
			this.vGroup = vGroup;
			if (typeof vGroup == "boolean" && vGroup) {
				this.fnGroup = function(oContext) {
					return oContext.getProperty(this.sPath);
				};
			}
			if (typeof vGroup == "function") {
				this.fnGroup = vGroup;
			}
		}
	
	});

	return Sorter;

});
