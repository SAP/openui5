/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the XML model implementation of a list binding
jQuery.sap.declare("sap.ui.model.xml.XMLTreeBinding");
jQuery.sap.require("sap.ui.model.TreeBinding");

/**
 *
 * @class
 * Tree binding implementation for XML format
 *
 * @param sPath
 * @param [oModel]
 */
sap.ui.model.xml.XMLTreeBinding = function(oModel, sPath, oContext){
	sap.ui.model.TreeBinding.apply(this, arguments);
	if (!this.oContext) {
		this.oContext = "";
	}
	this.filterInfo = {};
	this.filterInfo.aFilteredContexts = [];
	this.filterInfo.oParentContext = {};
};
sap.ui.model.xml.XMLTreeBinding.prototype = jQuery.sap.newObject(sap.ui.model.TreeBinding.prototype);

sap.ui.base.Object.defineClass("sap.ui.model.xml.XMLTreeBinding", {

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
sap.ui.model.xml.XMLTreeBinding.prototype.getRootContexts = function() {
	var oRootContext = this.oModel.getContext(this.sPath);
	return this.getNodeContexts(oRootContext);
};

/**
 * Return node contexts for the tree
 * @param {object} oContext to use for retrieving the node contexts
 * @return {Array} the contexts array
 * @protected
 */
sap.ui.model.xml.XMLTreeBinding.prototype.getNodeContexts = function(oContext) {
	var sContextPath = oContext.getPath();
	
	if (!jQuery.sap.endsWith(sContextPath,"/")) {
		sContextPath = sContextPath + "/";
	}
	if (!jQuery.sap.startsWith(sContextPath,"/")) {
		sContextPath = "/" + sContextPath;
	}

	var aContexts = [],
		mNodeIndices = {},
		that = this,
		oNode = this.oModel._getObject(oContext.getPath()),
		oChild, sChildPath, oChildContext;

	jQuery.each(oNode[0].childNodes, function(sName, oChild) {
		if (oChild.nodeType == 1) { // check if node is an element
			if (mNodeIndices[oChild.nodeName] == undefined){
				mNodeIndices[oChild.nodeName] = 0;
			} else {
				mNodeIndices[oChild.nodeName]++;
			}
			sChildPath = sContextPath + oChild.nodeName + "/" + mNodeIndices[oChild.nodeName];
			oChildContext = that.oModel.getContext(sChildPath);
			// check if there is a filter on this level applied
			if (that.aFilters && !that.bIsFiltering){
				if (jQuery.inArray(oChildContext, that.filterInfo.aFilteredContexts) != -1) {
					aContexts.push(oChildContext);
				}
			}else {
				aContexts.push(oChildContext);
			}
		}
	});

	return aContexts;
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
sap.ui.model.xml.XMLTreeBinding.prototype.filter = function(aFilters){
	// The filtering is applied recursively through the tree and stores all filtered contexts and its parent contexts in an array.

	var oRootContext = this.oModel.getContext(this.sPath);
	// reset previous stored filter contexts
	this.filterInfo.aFilteredContexts = [];
	this.filterInfo.oParentContext = {};
	if (!aFilters || !jQuery.isArray(aFilters) || aFilters.length == 0) {
		this.aFilters = null;
	} else {
		this.aFilters = aFilters;
		// start with binding path root
		this.filterRecursive(oRootContext);
	}
	this._fireChange();
	this._fireFilter({filters: aFilters});
};

/**
 * filters the tree recursively.
 * @param {object} oParentContext the context where to start. The children of this node context are then filtered recursively.
 * @private
 */
sap.ui.model.xml.XMLTreeBinding.prototype.filterRecursive = function(oParentContext){

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
sap.ui.model.xml.XMLTreeBinding.prototype.applyFilter = function(oParentContext){
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
			var oValue = that.oModel._getObject(sPath,oUnfilteredContext);
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
sap.ui.model.xml.XMLTreeBinding.prototype.getFilterFunction = function(oFilter){
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
sap.ui.model.xml.XMLTreeBinding.prototype.checkUpdate = function(bForceupdate){
	this._fireChange();
};