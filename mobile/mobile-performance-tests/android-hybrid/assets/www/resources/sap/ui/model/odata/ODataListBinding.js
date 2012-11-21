/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.model.odata.ODataListBinding
jQuery.sap.declare("sap.ui.model.odata.ODataListBinding");
jQuery.sap.require("sap.ui.model.odata.Filter");
jQuery.sap.require("sap.ui.model.ListBinding");
jQuery.sap.require("sap.ui.core.format.DateFormat");

/*global OData *///declare unusual global vars for JSLint/SAPUI5 validation

/**
 *
 * @class
 * List binding implementation for oData format
 *
 * @param sPath
 * @param [oModel]
 */
sap.ui.model.odata.ODataListBinding = function(oModel, sPath, oContext, oSorter, aFilters, mParameters) {
	sap.ui.model.ListBinding.apply(this, arguments);
	this.sFilterParams = null;
	this.sSortParams = null;
	this.sRangeParams = null;
	this.sCustomParams = this.oModel.createCustomParams(this.mParameters);
	this.aPredefinedFilters = aFilters;
	this.iStartIndex = 0;
	this.bPendingChange = false;
	this.aKeys = [];
	this.bInitialized = false;
	
	// load the entity type for the collection only once and not e.g. every time when filtering
	var sCollection = this.sPath;
	// get last part of sPath which is the collection and remove starting slash
	sCollection = sPath.substr(sPath.lastIndexOf("/") + 1);
	this.oEntityType = this.oModel._getEntityType(sCollection);
	
	this.oDateTimeFormat = sap.ui.core.format.DateFormat.getDateInstance({
		pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss''"
	});
	this.oDateTimeOffsetFormat = sap.ui.core.format.DateFormat.getDateInstance({
		pattern: "'datetimeoffset'''yyyy-MM-dd'T'HH:mm:ss'Z'''"
	});
//	this.oTimeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
//		pattern: "'time'''HH:mm:ss''"
//	});

	this.createSortParams(this.oSorter);
	this.createFilterParams(this.aFilters);

	// if nested list is already available, use the data and don't send additional requests
	// TODO: what if nested list is not complete, because it was too large?
	var oRef = this.oModel._getObject(sPath, oContext);
	if (jQuery.isArray(oRef)) {
		this.aKeys = oRef;
		this.iLength = oRef.length;
		this.bLengthFinal = true;
	}
	else {
		this.iLength = 0;
		this.bLengthFinal = false;
		if (this.oModel.isCountSupported()) {
			this._getLength();
		}
	}

};
sap.ui.model.odata.ODataListBinding.prototype = jQuery.sap.newObject(sap.ui.model.ListBinding.prototype);

sap.ui.base.Object.defineClass("sap.ui.model.odata.ODataListBinding", {

	  // ---- object ----
	  baseType : "sap.ui.model.ListBinding",
	  publicMethods : [
		// methods
		"getLength"
	  ]

	});

/**
 * Return contexts for the list
 *
 * @param {int} [iStartIndex=0] the start index of the requested contexts
 * @param {int} [iLength] the requested amount of contexts
 *
 * @return {Array} the contexts array
 * @protected
 */
sap.ui.model.odata.ODataListBinding.prototype.getContexts = function(iStartIndex, iLength, iThreshold) {
	this.bInitialized = true;
	// Set default values if startindex or length are not defined
	if (!iStartIndex) {
		iStartIndex = 0;
	}
	if (!iLength) {
		iLength = this.oModel.iSizeLimit;
	}

	// If we already know the length of the data set, make sure not to request more than exists
	if (this.bLengthFinal) {
		if (iStartIndex + iLength > this.iLength) {
			iLength = this.iLength - iStartIndex;
		}
		if (iLength < 0) {
			iLength = 0;
		}
	}

	// Loop through known data and check whether we already have all rows loaded
	var aContexts = [],
		sKey,
		oContext;
	for (var i = iStartIndex; i < iStartIndex + iLength; i++) {
		sKey = this.aKeys[i];
		if (!sKey) {
			break;
		}
		oContext = this.oModel.getContext(sKey);
		aContexts.push(oContext);
	}

	// TODO: thresholding
	if (iThreshold && (iThreshold <= iLength || aContexts.length === iLength )) {
		iThreshold = undefined;
	}
	var iSectionStart = iStartIndex;
	var iSectionLength = iLength;
	if (iThreshold) {
		var iSection = Math.floor(iStartIndex / (iThreshold / 2));
		var iSectionStart = Math.floor(iSection * (iThreshold / 2));
		var iSectionLength = this.bLengthFinal ? Math.min(this.iLength - iSectionStart, iThreshold) : Math.max(iLength, iThreshold);
		//jQuery.sap.log.warning("getContexts (threshold): " + iSectionStart + " - " + iSectionLength);
		if (!this.bPendingRequest && iSectionLength > 0) { //&& this.aKeys.length < iSectionStart + iSectionLength) {   // this.aKeys.length returns a length even if some value are undefined
			this.loadData(iSectionStart, iSectionLength);
		}
	} else {
		// If rows are missing send a request for the complete set of rows again
		if (!this.bPendingRequest && iLength > 0 && aContexts.length != iLength) {
			this.loadData(iStartIndex, iLength);
		}
	}

	return aContexts;
};

/**
 * Setter for context
 * @param {Object} oContext the new context object
 */
sap.ui.model.odata.ODataListBinding.prototype.setContext = function(oContext) {
	if (this.oContext != oContext) {
		this.oContext = oContext;
		
		if (this.bInitialized){
			// if nested list is already available, use the data and don't send additional requests
			// TODO: what if nested list is not complete, because it was too large?
			var oRef = this.oModel._getObject(this.sPath, this.oContext);
			if (jQuery.isArray(oRef)) {
				this.aKeys = oRef;
				this.iLength = oRef.length;
				this.bLengthFinal = true;
				this._fireChange();
			}
			else {
				this.aKeys = [];
				this.loadData();
			}			
		} 
		
	}
};

/**
 * Load list data from the server
 */
sap.ui.model.odata.ODataListBinding.prototype.loadData = function(iStartIndex, iLength, bSync) {

	var that = this;

	this.bPendingRequest = true;

	// determine the callback handler (only used internally to support events for sort/filter)
	// TODO: @JW: please rework - because you don't like currying
	var fnCallback = undefined;
	if (arguments.length === 1 && typeof iStartIndex === "function") {
		fnCallback = iStartIndex;
		iStartIndex = undefined;
	}

	// create range parameters and store start index for sort/filter requests
	if (iStartIndex || iLength) {
		this.sRangeParams = "$skip=" + iStartIndex + "&$top=" + iLength;
		this.iStartIndex = iStartIndex;
	}
	else {
		iStartIndex = this.iStartIndex;
	}

	// create the request url
	var aParams = [];
	if (this.sRangeParams) { 
		aParams.push(this.sRangeParams);
	}
	if (this.sSortParams) {
		aParams.push(this.sSortParams);
	}
	if (this.sFilterParams) {
		aParams.push(this.sFilterParams);
	}
	if (this.sCustomParams) {
		aParams.push(this.sCustomParams);
	}
	aParams.push("$inlinecount=allpages");


	function _processResult(oData) {

		// Collecting contexts
		jQuery.each(oData.results, function(i, entry) {
			that.aKeys[iStartIndex + i] = that.oModel._getKey(entry);
		});

		// update iLength (only when the inline count is available)
		if (oData.__count) {
			that.iLength = parseInt(oData.__count, 10);
			that.bLengthFinal = true;
		}

		// if we got data and the results + startindex is larger than the
		// length we just apply this value to the length
		if (that.iLength < iStartIndex + oData.results.length) {
			that.iLength = iStartIndex + oData.results.length;
			that.bLengthFinal = false;
		}

		// if less entries are returned than have been requested
		// set length accordingly
		if (oData.results.length < iLength) {
			that.iLength = iStartIndex + oData.results.length;
			that.bLengthFinal = true;
		}

		// check if there are any results at all...
		if (oData.results.length == 0) {
			that.iLength = 0;
			that.bLengthFinal = true;
		}

		that.bPendingRequest = false;

		// notifiy the callback handler
		if (fnCallback) {
			fnCallback.call(that);
		}

	}

	var sPath = this.sPath,
		oContext = this.oContext,
		bIsRelative = !jQuery.sap.startsWith(sPath, "/");
	if (bIsRelative) {
		if (oContext) {
			sPath = oContext + "/" + sPath;
		}
		else {
			sPath = this.oModel.isLegacySyntax() ? "/" + sPath : undefined;
		}
	}

	if (sPath) {
		// execute the request and use the metadata if available
		this.oModel._loadData(sPath, aParams, _processResult, function() {
			// notifiy the callback handler
			if (fnCallback) {
				fnCallback.call(that);
			}
		}, this.getContext());
	}

};

/**
 * Return the length of the list
 *
 * @return {number} the length
 * @protected
 */
sap.ui.model.odata.ODataListBinding.prototype.getLength = function() {
	return this.iLength;
};

/**
 * Return the length of the list
 *
 * @return {number} the length
 */
sap.ui.model.odata.ODataListBinding.prototype._getLength = function() {

	var that = this;

	// create a request object for the data request
	var aParams = [];
	if (this.sFilterParams) {
		aParams.push(this.sFilterParams);
	}
	
	function _handleSuccess(oData) {
		that.iLength = parseInt(oData, 10);
		that.bLengthFinal = true;
	}

	function _handleError(oXHR, sError, oError) {
		jQuery.sap.log.warning("Request for $count failed: " +
				sError,
				oXHR.responseText + "," +
				  oXHR.status + "," +
				  oXHR.statusText);
	}
	
	// Use context and check for relative binding
	var sPath = this.sPath,
	oContext = this.oContext,
	bIsRelative = !jQuery.sap.startsWith(sPath, "/");
	if (bIsRelative) {
		if (oContext) {
			sPath = oContext + "/" + sPath;
		}
		else {
			sPath = this.oModel.isLegacySyntax() ? "/" + sPath : undefined;
		}
	}

	// Only send request, if path is defined
	if (sPath) {
		var oRequest = this.oModel._createRequest(sPath + "/$count", aParams, false);
	
		// execute the request and use the metadata if available
		jQuery.ajax({
			url: oRequest.requestUri,
			async: oRequest.async,
			cache: this.oModel.bCache,
			username: oRequest.user,
			password: oRequest.password,
			success: _handleSuccess,
			error: _handleError
		});
	}
};

/**
 * Check whether this Binding would provide new values and in case it changed,
 * inform interested parties about this.
 *
 * @param {boolean} bForceupdate
 */
sap.ui.model.odata.ODataListBinding.prototype.checkUpdate = function(bForceupdate) {
	this._fireChange();
};

/**
 * Sorts the list
 *
 * @public
 */
sap.ui.model.odata.ODataListBinding.prototype.sort = function(oSorter) {

	this.createSortParams(oSorter);
	this.aKeys = [];

	this.loadData(function() {
		this._fireSort({sorter: oSorter});
	});

};

/**
 * Create URL parameters for sorting
 */
sap.ui.model.odata.ODataListBinding.prototype.createSortParams = function(oSorter) {

	if(oSorter){
		this.sSortParams = "$orderby=" + oSorter.sPath;
		this.sSortParams += oSorter.bDescending ? "%20desc" : "%20asc";
	}else{
		this.sSortParams = null;
	}

};


/**
 * 
 * Filters the list.
 * 
 * When using sap.ui.model.Filter the filters are first grouped according to their binding path.
 * All filters belonging to a group are ORed and after that the
 * results of all groups are ANDed.
 * Usually this means, all filters applied to a single table column
 * are ORed, while filters on different table columns are ANDed.
 * 
 * When using the specific sap.ui.model.odata.Filter it is possible to specify to AND or OR the filters with the same binding path:
 * Syntax: new sap.ui.model.odata.Filter(sPath, [{operator:sap.ui.model.FilterOperator, value1: oValue},
 *				                                 {operator: sap.ui.model.FilterOperator, value1: oValue}], bAND); // [bAND] = true
 * 
 * @param {Array} aFilters Array of sap.ui.model.Filter or sap.ui.model.odata.Filter objects
 * 
 * @public
 */
sap.ui.model.odata.ODataListBinding.prototype.filter = function(aFilters) {

	if (!aFilters) {
		aFilters = [];
	}
	if (this.aPredefinedFilters) {
		aFilters = aFilters.concat(this.aPredefinedFilters);
	}
	this.createFilterParams(aFilters);
	this.aKeys = [];
	this.iLength = 0;
	this.bLengthFinal = false;

	this.loadData(function() {
		this._fireFilter({filters: aFilters});
	});

};

/**
 * Create URL parameters for filtering
 */
sap.ui.model.odata.ODataListBinding.prototype.createFilterParams = function(aFilters) {

	if(aFilters && aFilters.length > 0){
		var oFilterGroups = {},
			iFilterGroupLength = 0,
			aFilterGroup,
			sFilterParam = "$filter=(",
			iFilterGroupCount = 0,
			that = this;
		//group filters by path
		jQuery.each(aFilters, function(j, oFilter) {
			aFilterGroup = oFilterGroups[oFilter.sPath];
			if (!aFilterGroup) {
				aFilterGroup = oFilterGroups[oFilter.sPath] = [];
				iFilterGroupLength++;
			}
			aFilterGroup.push(oFilter);
		});
		jQuery.each(oFilterGroups, function(sPath, aFilterGroup) {
			sFilterParam += '(';
			jQuery.each(aFilterGroup, function(i,oFilter) {
				if (oFilter instanceof sap.ui.model.odata.Filter) {
					if (aFilterGroup.length > 1) {
						sFilterParam += '(';
					}
					jQuery.each(oFilter.aValues, function(i, oFilterSegment) {
						if (i > 0) {
							if(oFilter.bAND) {
								sFilterParam += ")%20and%20(";
							} else {
								sFilterParam += ")%20or%20(";
							}
						}
						sFilterParam = that._createFilterSegment(oFilter.sPath, oFilterSegment.operator, oFilterSegment.value1, oFilterSegment.value2, sFilterParam);
					});
					if (aFilterGroup.length > 1) {
						sFilterParam += ')';
					}
				} else {
					sFilterParam = that._createFilterSegment(oFilter.sPath, oFilter.sOperator, oFilter.oValue1, oFilter.oValue2, sFilterParam);
				}
				if (i < aFilterGroup.length-1) {
					sFilterParam += ")%20or%20(";
				}
			});
			sFilterParam += ')';
			if (iFilterGroupCount < iFilterGroupLength-1) {
				sFilterParam += ")%20and%20(";
			}
			iFilterGroupCount++;
		});
		sFilterParam += ")"; 
		this.sFilterParams = sFilterParam;
	}else{
		this.sFilterParams = null;
	}
};

sap.ui.model.odata.ODataListBinding.prototype._createFilterSegment = function(sPath, sOperator, oValue1, oValue2, sFilterParam) {
	
	var oProperty;
	if (this.oEntityType) {
		// TODO ...complex types not supported e.g. sPath == Address/City...
		oProperty = this.oModel._getPropertyMetadata(this.oEntityType, sPath);		
	}
	
	if (oProperty) {
		switch(oProperty.type) {
			case "Edm.String":
				// quote
				oValue1 = "'" + String(oValue1).replace(/'/g, "''") + "'";
				oValue2 = (oValue2) ? "'" + String(oValue2).replace(/'/g, "''") + "'" : null;
				break;
			case "Edm.Time":
				oValue1 = "time'" + oValue1 + "'";
				oValue2 = (oValue2) ? "time'" + oValue2 + "'" : null;
				break;			
			case "Edm.DateTime":
				oValue1 = this.oDateTimeFormat.format(new Date(oValue1));
				oValue2 = (oValue2) ? this.oDateTimeFormat.format(new Date(oValue2)) : null;
				break;
			case "Edm.DateTimeOffset":
				oValue1 = this.oDateTimeOffsetFormat.format(new Date(oValue1));
				oValue2 = (oValue2) ? this.oDateTimeOffsetFormat.format(new Date(oValue2)) : null;
				break;
			case "Edm.Guid":
				oValue1 = "guid'" + oValue1 + "'";
				oValue2 = (oValue2) ? "guid'" + oValue2 + "'" : null;
				break;
			case "Edm.Binary":
				oValue1 = "binary'" + oValue1 + "'";
				oValue2 = (oValue2) ? "binary'" + oValue2 + "'" : null;
				break;
			default: 
				break;
		}
	} else {
		// ensure old behavior if no type could be found
		if (isNaN(oValue1)) {
			// date check
			if (!isNaN(Date.parse(oValue1))) {
				oValue1 = this.oDateTimeFormat.format(new Date(oValue1));
			}else {
				oValue1 = "'" + oValue1 + "'";
			}
		}
		if (oValue2) {
			if (isNaN(oValue2)) {
				// date check
				if (!isNaN(Date.parse(oValue2))) {
					oValue2 = this.oDateTimeFormat.format(new Date(oValue2));
				}else {
					oValue2 = "'" + oValue2 + "'";
				}
			}
		}
	}
	
	// TODO embed 2nd value
	switch(sOperator) {
		case "EQ":
		case "NE":
		case "GT":
		case "GE":
		case "LT":
		case "LE":
			sFilterParam += sPath + "%20" + sOperator.toLowerCase() + "%20" + oValue1;
			break;
		case "BT":
			sFilterParam += sPath + "%20gt%20" + oValue1 + "%20and%20" + sPath + "%20lt%20" + oValue2;
			break;
		case "Contains":
			sFilterParam += "indexof(" + sPath + "," + oValue1 + ")%20ne%20-1";
			break;
		case "StartsWith":
			sFilterParam += "startswith(" + sPath + "," + oValue1 + ")%20eq%20true";
			break;
		case "EndsWith":
			sFilterParam += "endswith(" + sPath + "," + oValue1 + ")%20eq%20true";
			break;
		default:
			sFilterParam += "true";
	}
	return sFilterParam;
};

sap.ui.model.odata.ODataListBinding.prototype._refresh = function(){
	this.aKeys = [];
	this.bLengthFinal = false;
	this.checkUpdate();
};
