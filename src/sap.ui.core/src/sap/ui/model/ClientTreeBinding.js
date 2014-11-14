/*!
 * ${copyright}
 */

// Provides the JSON model implementation of a list binding
sap.ui.define(['jquery.sap.global', './TreeBinding'],
	function(jQuery, TreeBinding) {
	"use strict";


	/**
	 *
	 * @class
	 * Tree binding implementation for client models
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {string} sPath the path pointing to the tree / array that should be bound
	 * @param {object} [oContext=null] the context object for this databinding (optional)
	 * @param {array} [aFilters=null] predefined filter/s contained in an array (optional)
	 * @param {object} [mParameters=null] additional model specific parameters (optional) 
	 * @alias sap.ui.model.ClientTreeBinding
	 * @extends sap.ui.model.TreeBinding
	 */
	var ClientTreeBinding = TreeBinding.extend("sap.ui.model.ClientTreeBinding", /** @lends sap.ui.model.ClientTreeBinding.prototype */ {
	
		constructor : function(oModel, sPath, oContext, aFilters, mParameters){
			TreeBinding.apply(this, arguments);
			if (!this.oContext) {
				this.oContext = "";
			}
			this.filterInfo = {};
			this.filterInfo.aFilteredContexts = [];
			this.filterInfo.oParentContext = {};
			
			if (this.aFilters) {
				if (this.oModel._getObject(this.sPath, this.oContext)) {
					this.filter(aFilters);
				}
			}
		}
		
	});
	
	/**
	 * Return root contexts for the tree
	 *
	 * @return {object[]} the contexts array
	 * @protected
	 * @param {integer} iStartIndex the startIndex where to start the retrieval of contexts
	 * @param {integer} iLength determines how many contexts to retrieve beginning from the start index.
	 */
	ClientTreeBinding.prototype.getRootContexts = function(iStartIndex, iLength) {
		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = this.oModel.iSizeLimit;
		}

		var aContexts = [];
		if (!this.oModel.isList(this.sPath)) {
			var oContext = this.oModel.getContext(this.sPath);
			if (this.bDisplayRootNode) {
				aContexts = [oContext];
			} else {
				aContexts = this.getNodeContexts(oContext);
			}
		} else {
			var that = this;
			jQuery.each(this.oModel._getObject(this.sPath), function(iIndex, oObject) {
				that._saveSubContext(oObject, aContexts, that.sPath + (jQuery.sap.endsWith(that.sPath, "/") ? "" : "/"), iIndex);
			});
		}
		
		return aContexts.slice(iStartIndex, iStartIndex + iLength);
	};
	
	/**
	 * Return node contexts for the tree
	 * @param {object} oContext to use for retrieving the node contexts
	 * @param {integer} iStartIndex the startIndex where to start the retrieval of contexts
	 * @param {integer} iLength determines how many contexts to retrieve beginning from the start index.
	 * @return {object[]} the contexts array
	 * @protected
	 */
	ClientTreeBinding.prototype.getNodeContexts = function(oContext, iStartIndex, iLength) {
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
			if (oNode) {
				jQuery.sap.each(oNode, function(sName, oChild) {
					if (jQuery.isArray(oChild)) {
						jQuery.each(oChild, function(sSubName, oSubChild) {
							that._saveSubContext(oSubChild, aContexts, sContextPath, sName + "/" + sSubName);
						});
					} else if (typeof oChild == "object") {
						that._saveSubContext(oChild, aContexts, sContextPath, sName);
					}
				});
			}
		}
		return aContexts.slice(iStartIndex, iStartIndex + iLength);
	};
	
	/**
	 * Returns if the node has child nodes
	 *
	 * @param {object} oContext the context element of the node
	 * @return {boolean} true if node has children
	 *
	 * @public
	 */
	ClientTreeBinding.prototype.hasChildren = function(oContext) {
		return oContext ? this.getNodeContexts(oContext).length > 0 : false;
	};
	
	ClientTreeBinding.prototype._saveSubContext = function(oNode, aContexts, sContextPath, sName) {
		if (typeof oNode == "object") {
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
	
	
	/**
	 * Filters the tree according to the filter definitions.
	 * 
	 * The filtering is applied recursively through the tree.
	 * The parent nodes of filtered child nodes will also be displayed if they don't match the filter conditions.
	 * All filters belonging to a group (=have the same path) are ORed and after that the
	 * results of all groups are ANDed.
	 * 
	 * @see sap.ui.model.TreeBinding.prototype.filter
	 * @param {sap.ui.model.Filter[]} aFilters Array of filter objects
	 * @public
	 */
	ClientTreeBinding.prototype.filter = function(aFilters){
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
		this._fireChange({reason: "filter"});
		// TODO remove this if the filter event is removed
		this._fireFilter({filters: aFilters});
	};
	
	/**
	 * filters the tree recursively.
	 * @param {object} oParentContext the context where to start. The children of this node context are then filtered recursively.
	 * @private
	 */
	ClientTreeBinding.prototype.filterRecursive = function(oParentContext){
	
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
	ClientTreeBinding.prototype.applyFilter = function(oParentContext){
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
		jQuery.each(that.aFilters, function(j, oFilter) {
			if (oFilter.sPath) {
				aFilterGroup = oFilterGroups[oFilter.sPath];
				if (!aFilterGroup) {
					aFilterGroup = oFilterGroups[oFilter.sPath] = [];
				}
			} else {
				aFilterGroup = oFilterGroups["__multiFilter"];
				if (!aFilterGroup) {
					aFilterGroup = oFilterGroups["__multiFilter"] = [];
				}
			}
			aFilterGroup.push(oFilter);
		});
		jQuery.each(aUnfilteredContexts, function(i, oUnfilteredContext) {
			bFiltered = true;
			jQuery.each(oFilterGroups, function(sPath, aFilterGroup) {
				if (sPath !== "__multiFilter") {
					var oValue = that.oModel._getObject(sPath, oUnfilteredContext);
					if (typeof oValue == "string") {
						oValue = oValue.toUpperCase();
					}
					bGroupFiltered = false;
					jQuery.each(aFilterGroup, function(j, oFilter) {
						var fnTest = that.getFilterFunction(oFilter);
						if (oValue != undefined && fnTest(oValue)) {
							bGroupFiltered = true;
							return false;
						}
					});
				} else {
					bGroupFiltered = false;
					jQuery.each(aFilterGroup, function(j, oFilter) {
						bGroupFiltered = that._resolveMultiFilter(oFilter, oUnfilteredContext);
						if (bGroupFiltered) {
							return false;
						}
					});
				}
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
	 * Resolve the client list binding and check if an index matches
	 *
	 * @private
	 */
	ClientTreeBinding.prototype._resolveMultiFilter = function(oMultiFilter, oUnfilteredContext){
		var that = this,
			bMatched = false,
			aFilters = oMultiFilter.aFilters;
		
		if (aFilters) {
			jQuery.each(aFilters, function(i, oFilter) {
				var bLocalMatch = false;
				if (oFilter._bMultiFilter) {
					bLocalMatch = that._resolveMultiFilter(oFilter, oUnfilteredContext);
				} else if (oFilter.sPath) {
					var oValue = that.oModel.getProperty(oFilter.sPath, oUnfilteredContext);
					if (typeof oValue == "string") {
						oValue = oValue.toUpperCase();
					}
					var fnTest = that.getFilterFunction(oFilter);
					if (oValue != undefined && fnTest(oValue)) {
						bLocalMatch = true;
					}
				}
				if (bLocalMatch && oMultiFilter.bAnd) {
					bMatched = true;
				} else if (!bLocalMatch && oMultiFilter.bAnd) {
					bMatched = false;
					return false;
				} else if (bLocalMatch) {
					bMatched = true;
					return false;
				}
			});
		}
		
		return bMatched;
	};
	
	/**
	 * Provides a JS filter function for the given filter
	 * @private
	 */
	ClientTreeBinding.prototype.getFilterFunction = function(oFilter){
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
	ClientTreeBinding.prototype.checkUpdate = function(bForceupdate){
		this._fireChange();
	};
	

	return ClientTreeBinding;

}, /* bExport= */ true);
