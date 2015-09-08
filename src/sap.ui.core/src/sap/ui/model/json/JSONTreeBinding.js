/*!
 * ${copyright}
 */

// Provides the JSON model implementation of a list binding
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ClientTreeBinding'],
	function(jQuery, ClientTreeBinding) {
	"use strict";


	/**
	 *
	 * @class
	 * Tree binding implementation for JSON format.
	 * 
	 * The tree data structure may contain JSON objects and also arrays. If using arrays and don't want to bind every array data in the data structure you can 
	 * specify a parameter <code>arrayNames</code> in the mParameters which contains the names of the arrays in a string array which should be bound for the tree.
	 * An array not included there won't be bound. If an array is included but it is nested in another parent array which isn't included in the names list it won't be bound.
	 * So make sure that the parent array name is also included. If the tree data structure doesn't include any arrays you don't have to specify this parameter at all. 
	 *
	 * @param {sap.ui.model.json.JSONModel} [oModel]
	 * @param {string}
	 *         sPath the path pointing to the tree / array that should be bound
	 * @param {object}
	 *         [oContext=null] the context object for this databinding (optional)
	 * @param {array}
	 *         [aFilters=null] predefined filter/s contained in an array (optional)
	 * @param {object}
	 *         [mParameters=null] additional model specific parameters (optional)
	 *         If the mParameter <code>arrayNames</code> is specified with an array of string names this names will be checked against the tree data structure
	 *         and the found data in this array is included in the tree but only if also the parent array is included.
	 *         If this parameter is not specified then all found arrays in the data structure are bound.
	 *         If the tree data structure doesn't contain an array you don't have to specify this parameter. 
	 * 
	 * @alias sap.ui.model.json.JSONTreeBinding
	 * @extends sap.ui.model.TreeBinding
	 */
	var JSONTreeBinding = ClientTreeBinding.extend("sap.ui.model.json.JSONTreeBinding");
	
	/**
	 * Return node contexts for the tree
	 * @param {object} oContext to use for retrieving the node contexts
	 * @param {integer} iStartIndex the startIndex where to start the retrieval of contexts
	 * @param {integer} iLength determines how many contexts to retrieve beginning from the start index.
	 * @return {Array} the contexts array
	 * @protected
	 */
	JSONTreeBinding.prototype.getNodeContexts = function(oContext, iStartIndex, iLength) {
		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = this.oModel.iSizeLimit;
		}
	
		var sContextPath = oContext.getPath();
		if (!jQuery.sap.endsWith(sContextPath,"/")) {
			sContextPath = sContextPath + "/";
		}
		if (!jQuery.sap.startsWith(sContextPath,"/")) {
			sContextPath = "/" + sContextPath;
		}
	
		var aContexts = [],
			that = this,
			oNode = this.oModel._getObject(sContextPath),
			aArrayNames = this.mParameters && this.mParameters.arrayNames,
			aChildArray;
		
		if (oNode) {
			if (aArrayNames && jQuery.isArray(aArrayNames)) {
				jQuery.each(aArrayNames, function(iIndex, sArrayName){
					aChildArray = oNode[sArrayName];
					if (aChildArray) {
						jQuery.each(aChildArray, function(sSubName, oSubChild) {
							that._saveSubContext(oSubChild, aContexts, sContextPath, sArrayName + "/" + sSubName);
						});
					}
				});
			} else {
				jQuery.sap.each(oNode, function(sName, oChild) {
					if (jQuery.isArray(oChild)) {
						jQuery.each(oChild, function(sSubName, oSubChild) {
							that._saveSubContext(oSubChild, aContexts, sContextPath, sName + "/" + sSubName);
						});
					} else if (oChild && typeof oChild == "object") {
						that._saveSubContext(oChild, aContexts, sContextPath, sName);
					}
				});
			}
		}
		return aContexts.slice(iStartIndex, iStartIndex + iLength);
	};
	
	
	JSONTreeBinding.prototype._saveSubContext = function(oNode, aContexts, sContextPath, sName) {
		if (oNode && typeof oNode == "object") {
			var oNodeContext = this.oModel.getContext(sContextPath + sName);
			// check if there is a filter on this level applied
			if (this.aFilters && !this.bIsFiltering) {
				if (jQuery.inArray(oNodeContext, this.filterInfo.aFilteredContexts) != -1) {
					aContexts.push(oNodeContext);
				}
			} else {
				aContexts.push(oNodeContext);
			}
		}
	};

	return JSONTreeBinding;

}, /* bExport= */ true);
