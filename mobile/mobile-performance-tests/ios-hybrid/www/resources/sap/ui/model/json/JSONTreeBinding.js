/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the JSON model implementation of a list binding
jQuery.sap.declare("sap.ui.model.json.JSONTreeBinding");
jQuery.sap.require("sap.ui.model.TreeBinding");

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
 * @param [oModel]
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
 */
sap.ui.model.json.JSONTreeBinding = function(oModel, sPath, oContext, aFilters, mParameters){
	sap.ui.model.TreeBinding.apply(this, arguments);
	if (!this.oContext) {
		this.oContext = "";
	}
	this.filterInfo = {};
	this.filterInfo.aFilteredContexts = [];
	this.filterInfo.oParentContext = {};
};
sap.ui.model.json.JSONTreeBinding.prototype = jQuery.sap.newObject(sap.ui.model.TreeBinding.prototype);

sap.ui.base.Object.defineClass("sap.ui.model.json.JSONTreeBinding", {

  // ---- object ----
  baseType : "sap.ui.model.TreeBinding",
  publicMethods : [
	// methods
  ]

});

/**
 * Return root contexts for the tree
 *
 * @return {Array} the contexts array
 * @protected
 */
sap.ui.model.json.JSONTreeBinding.prototype.getRootContexts = function() {
	var oContext = this.oModel.getContext(this.sPath);
	return this.getNodeContexts(oContext);
};

/**
 * Return node contexts for the tree
 * @param {object} oContext to use for retrieving the node contexts
 * @return {Array} the contexts array
 * @protected
 */
sap.ui.model.json.JSONTreeBinding.prototype.getNodeContexts = function(oContext) {

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
	oChild, 
    aArrayNames = this.mParameters && this.mParameters.arrayNames,
    aChildArray;
	
	if (aArrayNames && jQuery.isArray(aArrayNames)) {
		
		jQuery.each(aArrayNames, function(iIndex, sArrayName){
			aChildArray = oNode[sArrayName];
			if (aChildArray) {
				jQuery.each(aChildArray, function(sSubName, oSubChild) {
					that._saveSubContext(oSubChild, aContexts, sContextPath, sArrayName + "/" + sSubName);           	
				})
			}
		});
	} else {
		jQuery.each(oNode, function(sName, oChild) {
			if (jQuery.isArray(oChild)){
				jQuery.each(oChild, function(sSubName, oSubChild) {
					that._saveSubContext(oSubChild, aContexts, sContextPath, sName + "/" + sSubName);           	
				})
			} else if (typeof oChild == "object") {
				that._saveSubContext(oChild, aContexts, sContextPath, sName);
			}	
		});
	}
	return aContexts;
};


sap.ui.model.json.JSONTreeBinding.prototype._saveSubContext = function(oNode, aContexts, sContextPath, sName) {
	if (typeof oNode == "object") {
		var oNodeContext = this.oModel.getContext(sContextPath + sName);
		// check if there is a filter on this level applied
		if (this.aFilters && !this.bIsFiltering){
			if (jQuery.inArray(oNodeContext, this.filterInfo.aFilteredContexts) != -1) {
				aContexts.push(oNodeContext);
			}
		} else {
			aContexts.push(oNodeContext);
		}
	}
};


/**
 *
 * @see sap.ui.model.TreeBinding.prototype.filter
 * Filters the tree according to the filter definitions.
 * The filtering is applied recursively through the tree.
 * The parent nodes of filtered child nodes will also be displayed if they don't match the filter conditions.
 * All filters belonging to a group (=have the same path) are ORed and after that the
 * results of all groups are ANDed.
 * @function
 * @name sap.ui.model.TreeBinding.prototype.filter
 * @param {Array} aFilters Array of sap.ui.model.Filter objects
 *
 * @public
 */
sap.ui.model.json.JSONTreeBinding.prototype.filter = function(aFilters){
	// The filtering is applied recursively through the tree and stores all filtered contexts and its parent contexts in an array.

	// reset previous stored filter contexts
	this.filterInfo.aFilteredContexts = [];
	this.filterInfo.oParentContext = {};
	if (!aFilters || !jQuery.isArray(aFilters) || aFilters.length == 0) {
		this.aFilters = null;
	} else {
		this.aFilters = aFilters;
		// start with binding path root
		var oContext = new sap.ui.model.Context(this.oModel, this.sPath);
		this.filterRecursive(oContext);
	}
	this._fireChange();
	this._fireFilter({filters: aFilters});
};

/**
 * filters the tree recursively.
 * @param {object} oParentContext the context where to start. The children of this node context are then filtered recursively.
 * @private
 */
sap.ui.model.json.JSONTreeBinding.prototype.filterRecursive = function(oParentContext){

	this.bIsFiltering = true;
	var aChildren = this.getNodeContexts(oParentContext);
	this.bIsFiltering = false;

	if (aChildren.length > 0) {
		var that = this;
		jQuery.each(aChildren, function(i, oChildContext){
			that.filterRecursive(oChildContext);
		});
		this.applyFilter(oParentContext);
	}
};


/**
 * Performs the real filtering and stores all filtered contexts and its parent context into an array.
 * @param {object} oParentContext the context where to start. The children of this node context are filtered.
 * @private
 */
sap.ui.model.json.JSONTreeBinding.prototype.applyFilter = function(oParentContext){
	if (!this.aFilters) {
		return;
	}
	var that = this,
		oFilterGroups = {},
		aFilterGroup,
		aFiltered = [],
		bGroupFiltered = false,
		bFiltered = true;
	this.bIsFiltering = true;
	var aUnfilteredContexts = this.getNodeContexts(oParentContext);
	this.bIsFiltering = false;
	jQuery.each(aUnfilteredContexts, function(i, oUnfilteredContext) {
		bFiltered = true;
		jQuery.each(that.aFilters, function(j, oFilter) {
			aFilterGroup = oFilterGroups[oFilter.sPath];
			if (!aFilterGroup) {
				aFilterGroup = oFilterGroups[oFilter.sPath] = [];
			}
			aFilterGroup.push(oFilter);
		});
		jQuery.each(oFilterGroups, function(sPath, aFilterGroup) {
			var oValue = that.oModel._getObject(sPath, oUnfilteredContext);
			if (typeof oValue == "string") {
				oValue = oValue.toUpperCase();
			}
			bGroupFiltered = false;
			jQuery.each(aFilterGroup, function(j, oFilter) {
				var fnTest = that.getFilterFunction(oFilter);
				if (oValue && fnTest(oValue)) {
					bGroupFiltered = true;
					return false;
				}
			});
			if (!bGroupFiltered) {
				bFiltered = false;
				return false;
			}
		});
		if (bFiltered) {
			aFiltered.push(oUnfilteredContext);
		}
	});
	if (aFiltered.length > 0) {
		jQuery.merge(this.filterInfo.aFilteredContexts, aFiltered);
		this.filterInfo.aFilteredContexts.push(oParentContext);
		this.filterInfo.oParentContext = oParentContext;
	}
	// push additionally parentcontexts if any children are already included in filtered contexts
	if (jQuery.inArray(this.filterInfo.oParentContext, aUnfilteredContexts) != -1) {
		this.filterInfo.aFilteredContexts.push(oParentContext);
		// set the parent context which was added to be the new parent context
		this.filterInfo.oParentContext = oParentContext;
	}

};

/**
 * Provides a JS filter function for the given filter
 * @private
 */
sap.ui.model.json.JSONTreeBinding.prototype.getFilterFunction = function(oFilter){
	if (oFilter.fnTest) {
		return oFilter.fnTest;
	}
	var oValue1 = oFilter.oValue1,
		oValue2 = oFilter.oValue2;
	if (typeof oValue1 == "string") {
		oValue1 = oValue1.toUpperCase();
	}
	if (typeof oValue2 == "string") {
		oValue2 = oValue2.toUpperCase();
	}
	switch (oFilter.sOperator) {
		case "EQ":
			oFilter.fnTest = function(value) { return value == oValue1; }; break;
		case "NE":
			oFilter.fnTest = function(value) { return value != oValue1; }; break;
		case "LT":
			oFilter.fnTest = function(value) { return value < oValue1; }; break;
		case "LE":
			oFilter.fnTest = function(value) { return value <= oValue1; }; break;
		case "GT":
			oFilter.fnTest = function(value) { return value > oValue1; }; break;
		case "GE":
			oFilter.fnTest = function(value) { return value >= oValue1; }; break;
		case "BT":
			oFilter.fnTest = function(value) { return (value > oValue1) && (value < oValue2); }; break;
		case "Contains":
			oFilter.fnTest = function(value) { return value.indexOf(oValue1) != -1; }; break;
		case "StartsWith":
			oFilter.fnTest = function(value) { return value.indexOf(oValue1) == 0; }; break;
		case "EndsWith":
			oFilter.fnTest = function(value) { return value.indexOf(oValue1) == value.length - new String(oFilter.oValue1).length; }; break;
		default:
			oFilter.fnTest = function(value) { return true; };
	}
	return oFilter.fnTest;
};


/**
 * Check whether this Binding would provide new values and in case it changed,
 * inform interested parties about this.
 * 
 * @param {boolean} bForceupdate
 * 
 */
sap.ui.model.json.JSONTreeBinding.prototype.checkUpdate = function(bForceupdate){
	this._fireChange();
};