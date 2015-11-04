/*!
 * ${copyright}
 */

// Provides the OData model implementation of a tree binding
sap.ui.define(['jquery.sap.global', 'sap/ui/model/TreeBinding', 'sap/ui/model/odata/CountMode', 'sap/ui/model/ChangeReason', 'sap/ui/model/odata/ODataUtils'],
	function(jQuery, TreeBinding, CountMode, ChangeReason, ODataUtils) {
	"use strict";


	/**
	 *
	 * @class
	 * Tree binding implementation for odata models. The ODataTreeBinding does only support CountMode.Inline.
	 * This CountMode is set as default. To use the ODataTreeBinding with an odata service, which exposed hierarchy annotations, please
	 * consult the "SAP Annotations for OData Version 2.0" Specification. The necessary property annotations, as well as accepted/default values
	 * are documented in the specification.
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {sap.ui.model.Filter[]} [aFilters] predefined filter/s (can be either a filter or an array of filters)
	 * @param {object} [mParameters] Parameter Object
	 * 
	 * @param {object} [mParameters.treeAnnotationProperties] This parameter defines the mapping between data properties and 
	 *                                                        the hierarchy used to visualize the tree, if not provided by the services metadata.
	 *                                                        For correct metadata annotation, please check the "SAP Annotations for OData Version 2.0" Specification. 
	 * @param {int} [mParameters.treeAnnotationProperties.hierarchyLevelFor] Mapping to the property holding the level information,
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyNodeFor] Mapping to the property holding the hierarchy node id,
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyParentNodeFor] Mapping to the property holding the parent node id,
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyDrillStateFor] Mapping to the property holding the drill state for the node,
	 * 
	 * @param {int} [mParameters.numberOfExpandedLevels=0] This property defines the number of levels, which will be expanded initially.
	 *                                                   Please be aware, that this property leads to multiple backend requests. Default value is 0.
	 * @param {int} [mParameters.rootLevel=0] The root level is the level of the topmost tree nodes, which will be used as an entry point for OData services.
	 *                                        Conforming to the "SAP Annotations for OData Version 2.0" Specification, the root level must start at 0. 
	 *                                        Default value is thus 0.
	 * @param {sap.ui.model.Sorter[]} [aSorters] predefined sorter/s (can be either a sorter or an array of sorters)
	 * @alias sap.ui.model.odata.v2.ODataTreeBinding
	 * @extends sap.ui.model.TreeBinding
	 */
	var ODataTreeBinding = TreeBinding.extend("sap.ui.model.odata.v2.ODataTreeBinding", /** @lends sap.ui.model.odata.v2.ODataTreeBinding.prototype */ {
	
		constructor : function(oModel, sPath, oContext, aFilters, mParameters, aSorters){
			TreeBinding.apply(this, arguments);
			
			//make sure we have at least an empty parameter object
			this.mParameters = this.mParameters || mParameters || {};
			
			this.oFinalLengths = {};
			this.oLengths = {};
			this.oKeys = {};
			this.bNeedsUpdate = false;
			this._bRootMissing = false;
			
			// make sure the sorters are inside an array
			if (aSorters instanceof sap.ui.model.Sorter) {
				aSorters = [aSorters];
			}
			this.aSorters = aSorters || [];
			
			this.sFilterParams = "";

				// a queue containing all parallel running requests
			// a request is identified by (node id, startindex, length)
			this.mRequestHandles = {};
			
			this.oRootContext = null;
			
			this.iNumberOfExpandedLevels = (mParameters && mParameters.numberOfExpandedLevels) || 0;
			this.iRootLevel =  (mParameters && mParameters.rootLevel) || 0;
			
			if (mParameters && mParameters.countMode && mParameters.countMode !== CountMode.Inline) {
				jQuery.log.fatal("ODataTreeBinding only supports CountMode.Inline!");
			} else {
				this.sCountMode = CountMode.Inline;
			}
			//this.sCountMode = (mParameters && mParameters.countMode) || this.oModel.sDefaultCountMode;
			this.bInitial = true;
			this._mLoadedSections = {};
			this._iPageSize = 0;
		}
	
	});
	
	/**
	 * Drill-States for Hierarchy-Nodes
	 * 
	 * From the spec:
	 * A property holding the drill state of a hierarchy node includes this attribute. 
	 * The drill state is indicated by one of the following values: collapsed, expanded, leaf.
	 * The value of this attribute is always the name of another property in the same type. 
	 * It points to the related property holding the hierarchy node ID.
	 */
	ODataTreeBinding.DRILLSTATES = {
		Collapsed: "collapsed",
		Expanded: "expanded",
		Leaf: "leaf"
	};
	
	/**
	 * Validates the binding parameters against eachother.
	 * If no root node ID is given, the root level must be set!
	 * @private
	 */
	ODataTreeBinding.prototype._validateParameters = function () {
		
		var sRootNodeID = this.mParameters.rootNodeID;
		var iRootLevel = this.mParameters.rootLevel;
		//var iNumberOfExpandedLevels = this.mParameters.numberOfExpandedLevels;
		
		//case 1: root node id is given -> life's good
		if (sRootNodeID) {
			return true;
		}
		
		//case 2: NO root node id is given -> we need a root level
		if (!sRootNodeID) {
			jQuery.sap.assert(iRootLevel >= 0, "ODataTreeBinding: If no root node ID is given, a root entry level is mandatory, e.g. 0!");
			// ... and the displayRootNode flag must be set, because initially we need to filter on the level
			this.bDisplayRootNode = true;
			//jQuery.sap.assert(bDisplayRootNode, "ODataTreeBinding: When providing a root node level, the parameter 'displayRootNode' must be set to 'true'!");
		}
		
	};
	
	/**
	 * Tries to load the entity with the HierarchyNode ID of sRootNodeID.
	 * In case the backend returns nothing, the this._bRootMissing flag is set.
	 * 
	 * @param {string} sRootNodeID the property value of the annotated HierarchyNode property, on which a $filter is performed
	 * @param {string} sRequestKey a key for the request, used to keep track of pending requests
	 * @private
	 */
	ODataTreeBinding.prototype._loadSingleRootByHierarchyNodeID = function (sRootNodeID, sRequestKey) {
		var that = this;
		
		var _handleSuccess = function (oData) {
			if (oData.results && oData.results.length > 0) {
				// we expect only one root node
				var oEntry = oData.results[0];
				var sKey =  that.oModel._getKey(oEntry);
				that.oRootContext = that.oModel.getContext('/' + sKey);
			} else {
				//we received an empty response, this means the root is not there and should not be requested again
				that._bRootMissing = true;
			}
			that.bNeedsUpdate = true;
			
			delete that.mRequestHandles[sRequestKey];
			
			that.fireDataReceived();
		};
		
		var _handleError = function (oError) {
			//check if the error handler was executed because of an intentionally aborted request: 
			if (oError && oError.statusCode != 0 && oError.statusText != "abort") {
				var sErrorMsg = "Request for root node failed: " + oError.message;
				if (oError.response){
					sErrorMsg += ", " + oError.response.statusCode + ", " + oError.response.statusText + ", " + oError.response.body;
				}
				jQuery.sap.log.fatal(sErrorMsg);
				that.bNeedsUpdate = true;
				that._bRootMissing = true;
				delete that.mRequestHandles[sRequestKey];
				
				that.fireDataReceived();
			}
		};
		
		var aParams = [];
		var sFilterParams = this.getFilterParams() ? "%20and%20" + this.getFilterParams() : "";
		aParams.push("$filter=" + jQuery.sap.encodeURL(this.oTreeProperties["hierarchy-node-for"] + " eq '" + sRootNodeID + "'") + sFilterParams);
		// make sure to abort previous requests, with the same paging parameters
		// this is necessary to make sure, that only the most recent request gets processed
		// e.g. the (Tree)Table performs multiple calls to the binding (see BindingTimer in Table.js) 
		if (this.mRequestHandles[sRequestKey]) {
			this.mRequestHandles[sRequestKey].abort();
		}
		this.fireDataRequested();
		this.mRequestHandles[sRequestKey] = this.oModel.read(this.getPath(), {
			urlParameters: aParams, 
			success: _handleSuccess, 
			error: _handleError,
			sorters: this.aSorters
		});
	};
	
	/**
	 * Retrieves the root node given through sNodeId
	 * @param {string} sNodeId the ID od the root node which should be loaded (e.g. when bound to a single entity)
	 * @param {string} sRequestKey a key string used to store/clean-up request handles
	 */
	ODataTreeBinding.prototype._loadSingleRootNodeByNavigationProperties = function (sNodeId, sRequestKey) {
		var that = this;
		
		if (this.mRequestHandles[sRequestKey]) {
			this.mRequestHandles[sRequestKey].abort();
		}
		
		this.mRequestHandles[sRequestKey] = this.oModel.read(sNodeId, {
			success: function (oData) {
				var sNavPath = that._getNavPath(that.getPath());
				
				if (oData) {
					// we expect only one root node
					var oEntry = oData;
					var sKey =  that.oModel._getKey(oEntry);
					var oNewContext = that.oModel.getContext('/' + sKey);
					
					that.oRootContext = oNewContext;
					that._processODataObject(oNewContext.getObject(), sNodeId, sNavPath);
				} else {
					that._bRootMissing = true;
				}
				that.bNeedsUpdate = true;
				
				delete that.mRequestHandles[sRequestKey];
				
				that.fireDataReceived();
			},
			error: function (oError) {
				//Only perform error handling if the request was not aborted intentionally
				if (oError && oError.statusCode != 0 && oError.statusText != "abort") {
					that.bNeedsUpdate = true;
					that._bRootMissing = true;
					delete that.mRequestHandles[sRequestKey];
				
					that.fireDataReceived();
				}
			}
		});
	};
	
	/**
	 * Returns root contexts for the tree. You can specify the start index and the length for paging requests
	 * @param {integer} [iStartIndex=0] the start index of the requested contexts
	 * @param {integer} [iLength=v2.ODataModel.sizeLimit] the requested amount of contexts. If none given, the default value is the size limit of the underlying
	 *                                                 sap.ui.model.odata.v2.ODataModel instance.
	 * @param {integer} [iThreshold=0] the number of entities which should be retrieved in addition to the given length.
	 *                  A higher threshold reduces the number of backend requests, yet these request blow up in size, since more data is loaded.
	 * @return {sap.ui.model.Context[]} an array containing the contexts for the entities returned by the backend, might be fewer than requested 
	 *                                  if the backend does not have enough data.
	 * @protected
	 */
	ODataTreeBinding.prototype.getRootContexts = function(iStartIndex, iLength, iThreshold) {
		
		var sNodeId = null,
			mRequestParameters = {
				numberOfExpandedLevels: this.iNumberOfExpandedLevels
			},
			aRootContexts = [],
			sRootNodeID = this.mParameters.rootNodeID || null;

		if (this.isInitial()) {
			return aRootContexts;
		}
		
		// make sure the input parameters are not undefined
		iStartIndex = iStartIndex || 0;
		iLength = iLength || this.oModel.sizeLimit;
		iThreshold = iThreshold || 0;
		
		// node ID for the root context(s) ~> null
		// startindex/length may differ due to paging
		// same node id + different paging sections are treated as different requests and will not abort each other
		var sRequestKey = "" + sNodeId + "-" + iStartIndex + "-" + this._iPageSize + "-" + iThreshold;
		
		if (this.bHasTreeAnnotations) {
			
			this._validateParameters();
			
			// load single root node via rootNodeID (if given)
			if (this.bDisplayRootNode && sRootNodeID) {
				
				// if we already have a root context, return it
				if (this.oRootContext) {
					return [this.oRootContext];
				} else if (this._bRootMissing) {
					// the backend may not return anything for the given rootNodeID, so in this case our root node is missing
					return [];
				} else {
					//trigger loading of the single root node
					this._loadSingleRootByHierarchyNodeID(sRootNodeID, sRequestKey);
				}
				
			} else {
				// load root level, rootNodeID is "null" in this case
				aRootContexts = this._getContextsForNodeId(sRootNodeID, iStartIndex, iLength, iThreshold);
			}
			
		} else {
			sNodeId = this.oModel.resolve(this.getPath(), this.getContext());
			
			var bIsList = this.oModel.isList(this.sPath, this.getContext());
			if (bIsList) {
				this.bDisplayRootNode = true;
			}
			
			if (this.bDisplayRootNode && !bIsList) {
				if (this.oRootContext) {
					return [this.oRootContext];
				} else if (this._bRootMissing) {
					// the backend may not return anything for the given rootNodeID, so in this case our root node is missing
					return [];
				} else {
					this._loadSingleRootNodeByNavigationProperties(sNodeId, sRequestKey);
				}
			} else {
				mRequestParameters.navPath = this._getNavPath(this.getPath());
				
				//append nav path if binding path is not a collection and the root node should not be displayed
				if (!this.bDisplayRootNode) {
					sNodeId += "/" + mRequestParameters.navPath;
				}
				aRootContexts = this._getContextsForNodeId(sNodeId, iStartIndex, iLength, iThreshold, mRequestParameters);
			}
			
		}
		
		return aRootContexts;
	};
	
	/**
	 * Returns the contexts of the child nodes for the given context.
	 * 
	 * @param {sap.ui.model.Context} oContext the context for which the child nodes should be retrieved
	 * @param {integer} iStartIndex the start index of the requested contexts
	 * @param {integer} iLength the requested amount of contexts
	 * @param {integer} iThreshold
	 * @return {sap.ui.model.Context[]} the contexts array
	 * @protected
	 */
	ODataTreeBinding.prototype.getNodeContexts = function(oContext, iStartIndex, iLength, iThreshold) {
		
		var sNodeId,
			mRequestParameters = {};
		
		if (this.isInitial()) {
			return [];
		}
		
		if (this.bHasTreeAnnotations) {
			sNodeId = oContext.getProperty(this.oTreeProperties["hierarchy-node-for"]);
			mRequestParameters.level = parseInt(oContext.getProperty(this.oTreeProperties["hierarchy-level-for"]), 10) + 1;
		} else {
			var sNavPath = this._getNavPath(oContext.getPath());

			//If no nav path was found no nav property is defined and we cannot find any more data
			if (!sNavPath) {
				return [];
			}
		
			sNodeId = this.oModel.resolve(sNavPath, oContext);
			mRequestParameters.navPath = this.oNavigationPaths[sNavPath];
		}

		return this._getContextsForNodeId(sNodeId, iStartIndex, iLength, iThreshold, mRequestParameters);
	};
	
	/**
	 * Returns if the node has child nodes.
	 * If the ODataTreeBinding is running with hierarchy annotations, a context with the property values "expanded" or "collapsed"
	 * for the drilldown state property, returns true. Entities with drilldown state "leaf" return false.
	 *
	 * @param {sap.ui.model.Context} oContext the context element of the node
	 * @return {boolean} true if node has children
	 *
	 * @public
	 */
	ODataTreeBinding.prototype.hasChildren = function(oContext) {
		if (this.bHasTreeAnnotations) {
			if (!oContext) {
				return false;
			}
			var sDrilldownState = oContext.getProperty(this.oTreeProperties["hierarchy-drill-state-for"]);
			var sHierarchyNode = oContext.getProperty(this.oTreeProperties["hierarchy-node-for"]);
			var iLength = this.oLengths[sHierarchyNode];
			
			// if the server returned no children for a node (even though it has a DrilldownState of "expanded"),
			// the length for this node is set to 0 and finalized -> no children available
			if (iLength === 0 && this.oFinalLengths[sHierarchyNode]) {
				return false;
			} 
			// leaves do not have childre, only "expanded" and "collapsed" nodes
			// Beware: the drilldownstate may be undefined/empty string, 
			//         in case the entity (oContext) has no value for the drilldown state property
			if (sDrilldownState === "expanded" || sDrilldownState === "collapsed") {
				return true;
			} else if (sDrilldownState === "leaf"){
				return false;
			} else {
				jQuery.sap.log.warning("The entity '" + oContext.getPath() + "' has not specified Drilldown State property value.");
				//fault tolerance for empty property values (we optimistically say that those nodes can be expanded/collapsed)
				if (sDrilldownState === undefined || sDrilldownState === "") {
					return true;
				}
				return false;
			}
		} else {
			if (!oContext) {
				return this.oLengths[this.getPath()] > 0;
			}
			var iLength = this.oLengths[oContext.getPath() + "/" + this._getNavPath(oContext.getPath())];
			
			//only return false if we definitely know that the length is 0, otherwise, we have either a known length or none at all (undefined)
			return iLength !== 0;
		}
	};
	
	/**
	 * Returns the number of child nodes
	 *
	 * @param {Object} oContext the context element of the node
	 * @return {integer} the number of children
	 *
	 * @public
	 */
	ODataTreeBinding.prototype.getChildCount = function(oContext) {
		if (this.bHasTreeAnnotations) {
			var vHierarchyNode;
			// only the root node should have no context 
			// the child count is either stored via the rootNodeId or (if only the rootLevel is given) as "null", because we do not know the root id
			if (!oContext) {
				vHierarchyNode = this.mParameters.rootNodeID || null;
			} else {
				vHierarchyNode = oContext.getProperty(this.oTreeProperties["hierarchy-node-for"]);
			}
			return this.oLengths[vHierarchyNode];
		} else {
			if (!oContext) {
				// if no context was given, we retrieve the top-level child count:
				// 1. in case the binding path is a collection we need use the binding path as a key in the length map
				// 2. in case the binding path is a single entity, we need to add the navigation property from the "$expand" query option
				if (!this.bDisplayRootNode) {
					return this.oLengths[this.getPath() + "/" + this._getNavPath(this.getPath())];
				} else {
					return this.oLengths[this.getPath()];
				}
			}
			return this.oLengths[oContext.getPath() + "/" + this._getNavPath(oContext.getPath())];
		}
	};

	/**
	 * Merges together oNewSection into a set of other sections (aSections)
	 * The array/objects are not modified, the function returns a new section array.
	 * @param {object[]} aSections the sections into which oNewSection will be merged
	 * @param {objec} oNewSection the section which should be merged into aNewSections
	 * @return {object[]} a new array containing all sections from aSections merged with oNewSection
	 * @private
	 */
	ODataTreeBinding.prototype._mergeSections = function (aSections, oNewSection) {

		// Iterate over all known/loaded sections of the node
		var aNewSections = [];
		for (var i = 0; i < aSections.length; i++) {

			var oCurrentSection = aSections[i];
			var iCurrentSectionEndIndex = oCurrentSection.startIndex + oCurrentSection.length;
			var iNewSectionEndIndex = oNewSection.startIndex + oNewSection.length;

			if (oNewSection.startIndex <= iCurrentSectionEndIndex && iNewSectionEndIndex >= iCurrentSectionEndIndex
				&& oNewSection.startIndex >= oCurrentSection.startIndex) {
				//new section expands to the left
				oNewSection.startIndex = oCurrentSection.startIndex;
				oNewSection.length = iNewSectionEndIndex - oCurrentSection.startIndex;
			} else if (oNewSection.startIndex <= oCurrentSection.startIndex && iNewSectionEndIndex >= oCurrentSection.startIndex
				&& iNewSectionEndIndex <= iCurrentSectionEndIndex) {
				//new section expands to the right
				oNewSection.length = iCurrentSectionEndIndex - oNewSection.startIndex;
			} else if (oNewSection.startIndex >= oCurrentSection.startIndex && iNewSectionEndIndex <= iCurrentSectionEndIndex) {
				//new section is contained in old one
				oNewSection.startIndex = oCurrentSection.startIndex;
				oNewSection.length = oCurrentSection.length;
			} else if (iNewSectionEndIndex < oCurrentSection.startIndex || oNewSection.startIndex > iCurrentSectionEndIndex) {
				//old and new sections do not overlap, either the new section is completely left or right from the old one
				aNewSections.push(oCurrentSection);
			}
		}

		aNewSections.push(oNewSection);

		return aNewSections;
	};
	
	/**
	 * Gets or loads all contexts for a specified node id (dependent on mode)
	 *
	 * @param {String} sNodeId the value of the hierarchy node property on which a parent node filter will be performed
	 * @param {integer} iStartIndex start index of the page
	 * @param {integer} iLength length of the page
	 * @param {integer} iThreshold additionally loaded entities
	 * @param {object} mParameters additional request parameters
	 * 
	 * @return {sap.ui.model.Context[]} Array of contexts
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getContextsForNodeId = function(sNodeId, iStartIndex, iLength, iThreshold, mRequestParameters) {
		var aContexts = [],
			sKey,
			iRootLevel;
		
		// Set default values if startindex, threshold or length are not defined
		iStartIndex = iStartIndex || 0;
		iLength = iLength || this.oModel.iSizeLimit;
		iThreshold = iThreshold || 0;

		if (!this._mLoadedSections[sNodeId]) {
			this._mLoadedSections[sNodeId] = [];
		}

		if (this.bHasTreeAnnotations) {
			//the ID of the root node must be defined via parameters in case we use an annotated service
			if (sNodeId == null) {
				iRootLevel = this.iRootLevel;
			}
		}
	
		// make sure we only request the maximum length available (length is known and final)
		if (this.oFinalLengths[sNodeId] && this.oLengths[sNodeId] < iStartIndex + iLength) {
			iLength = Math.max(this.oLengths[sNodeId] - iStartIndex, 0);
		}

		var that = this;
		// check whether a start index was already requested
		var fnFindInLoadedSections = function(iStartIndex) {
			// check in the sections which where loaded
			for (var i = 0; i < that._mLoadedSections[sNodeId].length; i++) {
				var oSection = that._mLoadedSections[sNodeId][i];
				// try to find i in the loaded sections. If i is within one of the sections it needs not to be loaded again
				if (iStartIndex >= oSection.startIndex && iStartIndex < oSection.startIndex + oSection.length) {
					return true;
				}
			}

			// check requested sections where we still wait for an answer
		};

		var aMissingSections = [];
		// Loop through known data and check whether we already have all rows loaded
		// make sure to also check that the entities before the requested start index can be served
		var i = Math.max((iStartIndex - iThreshold - this._iPageSize), 0);
		if (this.oKeys[sNodeId]) {
			for (i; i < iStartIndex + iLength + (iThreshold); i++) {
				sKey = this.oKeys[sNodeId][i];
				if (!sKey) {
					if (!fnFindInLoadedSections(i)) {
						aMissingSections = this._mergeSections(aMissingSections, {startIndex: i, length: 1});
					}
				}

				// collect requested contexts if loaded
				if (i >= iStartIndex && i < iStartIndex + iLength) {
					if (sKey) {
						aContexts.push(this.oModel.getContext('/' + sKey));
					} else {
						aContexts.push(undefined);
					}
				}
			}

			// check whether the missing section already spans the complete page. If this is the case, we don't need to request an additional page
			var iBegin = Math.max((iStartIndex - iThreshold - this._iPageSize), 0);
			var iEnd = iStartIndex + iLength + (iThreshold);
			var bExpandThreshold = aMissingSections[0] && aMissingSections[0].startIndex === iBegin && aMissingSections[0].startIndex + aMissingSections[0].length === iEnd;

			if (aMissingSections.length > 0 && !bExpandThreshold) {
				//first missing section will be prepended with additional threshold ("negative")
				i = Math.max((aMissingSections[0].startIndex - iThreshold - this._iPageSize), 0);
				var iFirstStartIndex = aMissingSections[0].startIndex;
				for (i; i < iFirstStartIndex; i++) {
					var sKey = this.oKeys[sNodeId][i];
					if (!sKey) {
						if (!fnFindInLoadedSections(i)) {
							aMissingSections = this._mergeSections(aMissingSections, {startIndex: i, length: 1});
						}
					}
				}

				//last missing section will be appended with additional threshold ("positive")
				i = aMissingSections[aMissingSections.length - 1].startIndex + aMissingSections[aMissingSections.length - 1].length;
				var iEndIndex = i + iThreshold + this._iPageSize;
				for (i; i < iEndIndex; i++) {
					var sKey = this.oKeys[sNodeId][i];
					if (!sKey) {
						if (!fnFindInLoadedSections(i)) {
							aMissingSections = this._mergeSections(aMissingSections, {startIndex: i, length: 1});
						}
					}
				}
			}
		} else {
			// for initial loading of a node use this shortcut.
			if (!fnFindInLoadedSections(iStartIndex)) {
				// "i" is our shifted forward startIndex for the "negative" thresholding
				// in this case i is always smaller than iStartIndex, but minimum is 0
				var iLengthShift = iStartIndex - i;
				aMissingSections = this._mergeSections(aMissingSections, {startIndex: i, length: iLength + iLengthShift + iThreshold});
			}
		}

		// check if metadata are already available
		if (this.oModel.getServiceMetadata()) {
			// If rows are missing send a request
			if (aMissingSections.length > 0) {
				var aParams = [];
				var sFilterParams = this.getFilterParams();
				if (this.bHasTreeAnnotations) {
					sFilterParams = sFilterParams ? "%20and%20" + sFilterParams : "";
					if (sNodeId) {
						aParams.push("$filter=" + jQuery.sap.encodeURL(this.oTreeProperties["hierarchy-parent-node-for"] + " eq '" + sNodeId + "'") + sFilterParams);
					} else {
						// no root node id is given: sNodeId === null
						// in this case we use the root level
						aParams.push("$filter=" + jQuery.sap.encodeURL(this.oTreeProperties["hierarchy-level-for"] + " eq " + iRootLevel) + sFilterParams);
					}
				} else {
					// append application filters for navigation property case
					if (sFilterParams) {
						aParams.push("$filter=" + sFilterParams);
					}
				}
				
				if (this.sCustomParams) {
					aParams.push(this.sCustomParams);
				}

				for (i = 0; i < aMissingSections.length; i++) {
					var oRequestedSection = aMissingSections[i];
					this._mLoadedSections[sNodeId] = this._mergeSections(this._mLoadedSections[sNodeId], {startIndex: oRequestedSection.startIndex, length: oRequestedSection.length});
					this._loadSubNodes(sNodeId, oRequestedSection.startIndex, oRequestedSection.length, 0, aParams, mRequestParameters, oRequestedSection);
				}
			}
		}
	
		return aContexts;
	};
	
	ODataTreeBinding.prototype._getCountForNodeId = function(sNodeId, iStartIndex, iLength, iThreshold, mParameters) {
		var that = this;
		
		// create a request object for the data request
		var aParams = [];
		
		function _handleSuccess(oData) {
			that.oFinalLengths[sNodeId] = true;
			that.oLengths[sNodeId] = parseInt(oData, 10);
		}
	
		function _handleError(oError) {
			//Only perform error handling if the request was not aborted intentionally
			if (oError && oError.statusCode === 0 && oError.statusText === "abort") {
				return;
			}
			var sErrorMsg = "Request for $count failed: " + oError.message;
			if (oError.response){
				sErrorMsg += ", " + oError.response.statusCode + ", " + oError.response.statusText + ", " + oError.response.body;
			}
			jQuery.sap.log.warning(sErrorMsg);
		}
		
		var sPath;
		if (this.bHasTreeAnnotations) {
			sPath = this.oModel.resolve(this.getPath(), this.getContext());
			var sFilterParams = this.getFilterParams() ? "%20and%20" + this.getFilterParams() : "";
			aParams.push("$filter=" + jQuery.sap.encodeURL(this.oTreeProperties["hierarchy-parent-node-for"] + " eq '" + sNodeId + "'") + sFilterParams);
		} else {
			sPath = sNodeId;
		}
	
		// Only send request, if path is defined
		if (sPath) {
			this.oModel.read(sPath + "/$count", {
				urlParameters: aParams,
				success: _handleSuccess,
				error: _handleError,
				sorters: this.aSorters
			});
		}
	};
	
	/**
	 * Triggers backend requests to load the child nodes of the node with the given sNodeId.
	 * 
	 * @param {String} sNodeId the value of the hierarchy node property on which a parent node filter will be performed
	 * @param {integer} iStartIndex start index of the page
	 * @param {integer} iLength length of the page
	 * @param {integer} iThreshold additionally loaded entities
	 * @param {array} aParams odata url parameters, already concatenated with "="
	 * @param {object} mParameters additional request parameters
	 * @param {object} mParameters.navPath the navigation path
	 * 
	 * @return {sap.ui.model.Context[]} Array of contexts
	 * 
	 * @private
	 */
	ODataTreeBinding.prototype._loadSubNodes = function(sNodeId, iStartIndex, iLength, iThreshold, aParams, mParameters, oRequestedSection) {
		var that = this,
			bInlineCountRequested = false;

		if (iStartIndex || iLength) {
			aParams.push("$skip=" + iStartIndex + "&$top=" + (iLength + iThreshold));
		}
		
		if (!this.oFinalLengths[sNodeId] && (this.sCountMode == CountMode.Inline || this.sCountMode == CountMode.Both)) {
			aParams.push("$inlinecount=allpages");
			bInlineCountRequested = true;
		}
		
		var sRequestKey = "" + sNodeId + "-" + iStartIndex + "-" + this._iPageSize + "-" + iThreshold;
		
		function fnSuccess(oData) {

			// Collecting contexts
			//beware: oData.results can be an empty array -> so the length has to be checked
			if (oData.results && oData.results.length > 0) {
				//Case 1: Result is an entity set
				if (that.bHasTreeAnnotations) {
					var mLastNodeIdIndices = {};
					
					// evaluate the count
					if (bInlineCountRequested && oData.__count) {
						that.oLengths[sNodeId] = parseInt(oData.__count, 10);
						that.oFinalLengths[sNodeId] = true;
					}
					
					for (var i = 0; i < oData.results.length; i++) {
						var oEntry = oData.results[i];
						
						var sEntryNodeId = sNodeId;
						
						if (i == 0) {
							mLastNodeIdIndices[sEntryNodeId] = iStartIndex;
						} else if (mLastNodeIdIndices[sEntryNodeId] == undefined) {
							mLastNodeIdIndices[sEntryNodeId] = 0;
						}
						
						if (!(sEntryNodeId in that.oKeys)) {
							that.oKeys[sEntryNodeId] = [];
							
							// update length (only when the inline count was requested and is available)
							if (bInlineCountRequested && oData.__count) {
								that.oLengths[sEntryNodeId] = parseInt(oData.__count, 10);
								that.oFinalLengths[sEntryNodeId] = true;
							} else {
								//calculate the number of children for this node/context
								var iResultLength = parseInt(oData.results.length, 10);
								that.oLengths[sEntryNodeId] = Math.max(that.oLengths[sEntryNodeId] || 0, iStartIndex + iResultLength);
								
								// if we received fewer items than requested, the length is final
								if (iResultLength < iLength) {
									that.oFinalLengths[sEntryNodeId] = true;
								}
								
								//send an additional count request, in case no inline count was sent
								if (!that.oFinalLengths[sEntryNodeId] && that.oModel.isCountSupported()) {
									that._getCountForNodeId(sEntryNodeId);
								}
							}
							
						}
						
						that.oKeys[sEntryNodeId][mLastNodeIdIndices[sEntryNodeId]] = that.oModel._getKey(oEntry);
						mLastNodeIdIndices[sEntryNodeId]++;
					}
				} else {
					// update length (only when the inline count was requested and is available)
					if (bInlineCountRequested && oData.__count) {
						that.oLengths[sNodeId] = parseInt(oData.__count, 10);
						that.oFinalLengths[sNodeId] = true;
					} else {
						if (that.oModel.isCountSupported()) {
							that._getCountForNodeId(sNodeId);
						}
					}
					
					that.oKeys[sNodeId] = [];
					for (var i = 0; i < oData.results.length; i++) {
						var oEntry = oData.results[i];
						var sKey = that.oModel._getKey(oEntry);
						that._processODataObject(oEntry, "/" + sKey, mParameters.navPath);
						that.oKeys[sNodeId][i + iStartIndex] = sKey;
					}
				}
			} else if (oData.results && oData.results.length === 0) {
				//Case 2: we have an empty result (and possible a count)
				if (bInlineCountRequested && oData.__count) {
					that.oLengths[sNodeId] = parseInt(oData.__count, 10);
				}
				that.oFinalLengths[sNodeId] = true;
			} else {
				//Case 3: Single entity (this only happens if you bind to a single entity as root element)
				that.oKeys[null] = that.oModel._getKey(oData);
				if (!that.bHasTreeAnnotations) {
					that._processODataObject(oData, sNodeId, mParameters.navPath);
				}
			}
	
			that.oRequestHandle = null;
			delete that.mRequestHandles[sRequestKey];
			that.bNeedsUpdate = true;

			that.fireDataReceived();
		}
	
		function fnError(oError) {
			//Only perform error handling if the request was not aborted intentionally
			if (oError && oError.statusCode === 0 && oError.statusText === "abort") {
				return;
			}
			
			that.oRequestHandle = null;
			delete that.mRequestHandles[sRequestKey];
			that.fireDataReceived();

			if (oRequestedSection) {
			// remove section from loadedSections so the data can be requested again.
			// this might be required when e.g. when the service was not available for a short time
			var aLoadedSections = [];
			for (var i = 0; i < that._mLoadedSections[sNodeId].length; i++) {
				var oCurrentSection = that._mLoadedSections[sNodeId][i];
				if (oRequestedSection.startIndex >= oCurrentSection.startIndex && oRequestedSection.startIndex + oRequestedSection.length <= oCurrentSection.startIndex + oCurrentSection.length) {
					// remove the section interval and maintain adapted sections. If start index and length are the same, ignore the section
					if (oRequestedSection.startIndex !== oCurrentSection.startIndex && oRequestedSection.length !== oCurrentSection.length) {
						aLoadedSections = that._mergeSections(aLoadedSections, {startIndex: oCurrentSection.startIndex, length: oRequestedSection.startIndex - oCurrentSection.startIndex});
						aLoadedSections = that._mergeSections(aLoadedSections, {startIndex: oRequestedSection.startIndex + oRequestedSection.length, length: (oCurrentSection.startIndex + oCurrentSection.length) - (oRequestedSection.startIndex + oRequestedSection.length)});
					}

				} else {
					aLoadedSections.push(oCurrentSection);
				}
			}
			that._mLoadedSections[sNodeId] = aLoadedSections;
			}
		}
		
		// !== because we use "null" as sNodeId in case the user only provided a root level
		if (sNodeId !== undefined) {
			if ((!this.oFinalLengths[sNodeId] || this.bHasTreeAnnotations)) {
				// execute the request and use the metadata if available
				this.fireDataRequested();
				var sAbsolutePath;
				if (this.bHasTreeAnnotations) {
					sAbsolutePath = this.oModel.resolve(this.getPath(), this.getContext());
				} else {
					sAbsolutePath = sNodeId;
				}
				
				if (this.mRequestHandles[sRequestKey]) {
					this.mRequestHandles[sRequestKey].abort();
				} 
				this.mRequestHandles[sRequestKey] = this.oModel.read(sAbsolutePath, {
					urlParameters: aParams,
					success: fnSuccess,
					error: fnError,
					sorters: this.aSorters
				});
			}
		}
	};
	
	/**
	 * Resets the current tree data and the lengths of the different nodes/groups. 
	 * 
	 * @param {object} oContext the context for which the lengths values should be resetted.
	 * 
	 * @private
	 */
	ODataTreeBinding.prototype.resetData = function(oContext, mParameters) {
		if (oContext) {
			//Only reset specific content
			var sPath = oContext.getPath();
	
			delete this.oKeys[sPath];
			delete this.oLengths[sPath];
			delete this.oFinalLengths[sPath];
			delete this._mLoadedSections[sPath];
		} else {
			this.oKeys = {};
			this.oLengths = {};
			this.oFinalLengths = {};
			this.oRootContext = null;
			this._bRootMissing = false;
			
			// abort running request and clear the map afterwards
			jQuery.each(this.mRequestHandles, function (sRequestKey, oRequestHandle) {
				if (oRequestHandle) {
					oRequestHandle.abort();
				}
			});
			this.mRequestHandles = {};
			
			this._mLoadedSections = {};
			this._iPageSize = 0;
			this.sFilterParams = "";
		}
	};
	
	/**
	 * Refreshes the binding, check whether the model data has been changed and fire change event
	 * if this is the case. For server side models this should refetch the data from the server.
	 * To update a control, even if no data has been changed, e.g. to reset a control after failed
	 * validation, please use the parameter bForceUpdate.
	 * 
	 * @param {boolean} [bForceUpdate] Update the bound control even if no data has been changed
	 * @param {object} [mChangedEntities]
	 * @param {string} [mEntityTypes]
	 * 
	 * @public
	 */
	ODataTreeBinding.prototype.refresh = function(bForceUpdate, mChangedEntities, mEntityTypes) {
		var bChangeDetected = false;
		if (!bForceUpdate) {
			if (mEntityTypes){
				var sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);
				// remove url parameters if any to get correct path for entity type resolving
				if (sResolvedPath.indexOf("?") !== -1) {
					sResolvedPath = sResolvedPath.split("?")[0];
				}
				var oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sResolvedPath);
				if (oEntityType && (oEntityType.entityType in mEntityTypes)) {
					bChangeDetected = true;
				}
			}
			if (mChangedEntities && !bChangeDetected) {
				jQuery.each(this.oKeys, function(i, aNodeKeys) {
					jQuery.each(aNodeKeys, function(i, sKey) {
						if (sKey in mChangedEntities) {
							bChangeDetected = true;
							return false;
						}
					});
					if (bChangeDetected) {
						return false;
					}
				});
			}
			if (!mChangedEntities && !mEntityTypes) { // default
				bChangeDetected = true;
			}
		}
		if (bForceUpdate || bChangeDetected) {
			this.resetData();
			this.bNeedsUpdate = false;
			this.bRefresh = true;
			this._fireRefresh({reason: sap.ui.model.ChangeReason.Refresh});
		}
	};
	
	/**
	 * Filtering is currently not supported.
	 * 
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} aFilters
	 * @see sap.ui.model.TreeBinding.prototype.filter
	 * @return {sap.ui.model.odata.v2.ODataTreeBinding} returns <code>this</code> to facilitate method chaining
	 * @public
	 */
	ODataTreeBinding.prototype.filter = function(aFilters){
		jQuery.sap.log.warning("Filtering is currently not possible in the ODataTreeBinding");
		return this;
	};
	
	/**
	 * Sorts the Tree according to the given Sorter(s)
	 * 
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} aSorters the Sorter or an Array of sap.ui.model.Sorter instances
	 * @return {sap.ui.model.odata.v2.ODataTreeBinding} returns <code>this</code> to facilitate method chaining
	 * @public
	 */
	ODataTreeBinding.prototype.sort = function(aSorters, bReturnSuccess) {

		var bSuccess = false;

		if (aSorters instanceof sap.ui.model.Sorter) {
			aSorters = [aSorters];
		}

		this.aSorters = aSorters || [];

		if (!this.bInitial) {
			this.resetData(undefined, {reason: ChangeReason.Sort});
			
			// abort running request, since new requests will be sent containing $orderby
			jQuery.each(this.mRequestHandles, function (sRequestKey, oRequestHandle) {
				if (oRequestHandle) {
					oRequestHandle.abort();
				}
			});
			
			this._fireRefresh({reason : ChangeReason.Sort});
			bSuccess = true;
		}
		
		if (bReturnSuccess) {
			return bSuccess;
		} else {
			return this;
		}
	};
	
	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 * 
	 * @param {boolean} bForceUpdate
	 * 
	 */
	ODataTreeBinding.prototype.checkUpdate = function(bForceUpdate, mChangedEntities){
		var bChangeDetected = false;
		if (!bForceUpdate) {
			if (this.bNeedsUpdate || !mChangedEntities) {
				bChangeDetected = true;
			} else {
				jQuery.each(this.oKeys, function(i, aNodeKeys) {
					jQuery.each(aNodeKeys, function(i, sKey) {
						if (sKey in mChangedEntities) {
							bChangeDetected = true;
							return false;
						}
					});
					if (bChangeDetected) {
						return false;
					}
				});
			}
		}
		if (bForceUpdate || bChangeDetected) {
			this.bNeedsUpdate = false;
			this._fireChange();
		}
	};
	
	/**
	 * Splits the given path along the navigation properties.
	 * Only used when bound against a service, which describes the tree via navigation properties.
	 * 
	 * @param {string} sPath
	 * @private
	 */
	ODataTreeBinding.prototype._getNavPath = function(sPath) {
		//Check the last part of the path
		var sAbsolutePath = this.oModel.resolve(sPath, this.getContext());
		
		if (!sAbsolutePath) {
			return;
		}
		
		var aPathParts = sAbsolutePath.split("/"),
			sEntityName = aPathParts[aPathParts.length - 1],
			sNavPath;

		//Only if part contains "(" we are working on a specific entity with children
		var sCurrent = sEntityName.split("(")[0];
		if (sCurrent && this.oNavigationPaths[sCurrent]) {
			//Replace context with subitems context
			sNavPath = this.oNavigationPaths[sCurrent];
		}
		return sNavPath;
	};
	
	/**
	 * Processes the odata entries returned after a backend request.
	 * navigation property paths are split and stored internally.
	 * 
	 * @param {object} oObject the object which will be processed
	 * @param {string} sPath the binding path of the object
	 * @param {string} sNavPath the path through the data object along the navigation properties
	 * @private
	 */
	ODataTreeBinding.prototype._processODataObject = function(oObject, sPath, sNavPath) {
		var aNavPath = [],
			that = this;
		
		if (sNavPath && sNavPath.indexOf("/") > -1) {
			aNavPath = sNavPath.split("/");
			sNavPath = aNavPath[0];
			aNavPath.splice(0,1);
		}
	
		var oRef = this.oModel._getObject(sPath);
		if (jQuery.isArray(oRef)) {
			this.oKeys[sPath] = oRef;
			this.oLengths[sPath] = oRef.length;
			this.oFinalLengths[sPath] = true;
		} else if (oRef) {
			this.oLengths[sPath] = 1;
			this.oFinalLengths[sPath] = true;
		}
		
		if (sNavPath && oObject[sNavPath]) {
			if (jQuery.isArray(oRef)) {
				jQuery.each(oRef, function(iIndex, sRef) {
					var oObject = that.getModel().getData("/" + sRef);
					that._processODataObject(oObject, "/" + sRef + "/" + sNavPath, aNavPath.join("/"));
				});
			} else if (typeof oRef === "object") {
				that._processODataObject(oObject, sPath + "/" + sNavPath, aNavPath.join("/"));
			}
		}
	};

	/**
	 * Checks the metadata for Hierarchy Tree Annotations.
	 * The property mapping describing the tree will be placed in "this.oTreeProperties".
	 * Also checks if clientside property mappings are given.
	 */
	ODataTreeBinding.prototype._hasTreeAnnotations = function() {
		var oModel = this.oModel,
			oMetadata = oModel.oMetadata,
			sAbsolutePath = oModel.resolve(this.getPath(), this.getContext()),
			oEntityType,
			sTreeAnnotationNamespace = oMetadata.mNamespaces["sap"],
			that = this;

		//List of all annotations that are required for the OdataTreebinding to work
		this.oTreeProperties = {
			"hierarchy-level-for": false,
			"hierarchy-parent-node-for": false,
			"hierarchy-node-for": false,
			"hierarchy-drill-state-for": false
		};
		
		// Checks if no tree annotations are missing
		// true: everythings fine
		// false: we can't proceed
		var fnSanityCheckTreeAnnotations = function () {
			
			var iFoundAnnotations = 0;
			var iMaxAnnotationLength = 0;
			jQuery.each(that.oTreeProperties, function (sPropName, sPropValue) {
				iMaxAnnotationLength++;
				
				if (sPropValue) {
					iFoundAnnotations += 1;
				}
			});
			
			if (iFoundAnnotations === iMaxAnnotationLength){
				return true;
			} else if (iFoundAnnotations > 0 && iFoundAnnotations < iMaxAnnotationLength) {
				jQuery.sap.log.warning("Incomplete hierarchy tree annotations. Please check your service metadata definition!");
			}
			//if no annotations where found -> we are in the navigtion property mode
			return false;
		};
		
		// support for locally annotated tree hierarchy properties
		if (this.mParameters && this.mParameters.treeAnnotationProperties) {
			this.oTreeProperties["hierarchy-level-for"] = this.mParameters.treeAnnotationProperties.hierarchyLevelFor;
			this.oTreeProperties["hierarchy-parent-node-for"] = this.mParameters.treeAnnotationProperties.hierarchyParentNodeFor;
			this.oTreeProperties["hierarchy-node-for"] = this.mParameters.treeAnnotationProperties.hierarchyNodeFor;
			this.oTreeProperties["hierarchy-drill-state-for"] = this.mParameters.treeAnnotationProperties.hierarchyDrillStateFor;
			
			return fnSanityCheckTreeAnnotations();
		}
		
		// remove url parameters if any to get correct path for entity type resolving
		if (sAbsolutePath.indexOf("?") !== -1) {
			sAbsolutePath = sAbsolutePath.split("?")[0];
		}
		
		oEntityType = oMetadata._getEntityTypeByPath(sAbsolutePath);
		
		if (!oEntityType) {
			jQuery.sap.log.fatal("EntityType for path " + sAbsolutePath + " could not be found.");
			return false;
		}

		//Check if all required proeprties are available
		jQuery.each(oEntityType.property, function(iIndex, oProperty) {
			if (!oProperty.extensions) {
				return true;
			}
			jQuery.each(oProperty.extensions, function(iIndex, oExtension) {
				var sName = oExtension.name;
				if (oExtension.namespace === sTreeAnnotationNamespace &&
						sName in that.oTreeProperties &&
						!that.oTreeProperties[sName]) {
					that.oTreeProperties[sName] = oProperty.name;
				}
			});
		});

		return fnSanityCheckTreeAnnotations();
	};
	
	/**
	 * Initialize binding. Fires a change if data is already available ($expand) or a refresh.
	 * If metadata is not yet available, do nothing, method will be called again when
	 * metadata is loaded.
	 *  
	 * @public
	 */
	ODataTreeBinding.prototype.initialize = function() {
		if (this.oModel.oMetadata && this.oModel.oMetadata.isLoaded()) {
			this.bInitial = false;
			this.bHasTreeAnnotations = this._hasTreeAnnotations();
			this._processSelectParameters();
			this.oEntityType = this._getEntityType();
			this._fireRefresh({reason: sap.ui.model.ChangeReason.Refresh});
		}
		return this;
	};
	
	/**
	 * Internal function to evaluate the select parameters for the binding.
	 * @private
	 */
	ODataTreeBinding.prototype._processSelectParameters = function () {
		if (this.mParameters) {
			this.oNavigationPaths = this.mParameters.navigation;
			
			// put navigation params also to select params if there are select params
			if (this.mParameters.select) {
				//split all select params
				var aSelectParams = this.mParameters.select.split(",");
				var aNewSelectParams = [];
				
				if (this.oNavigationPaths) {
					jQuery.each(this.oNavigationPaths, function(sParamKey, sParamName){
						if (jQuery.inArray(sParamName, aNewSelectParams) == -1) {
							aNewSelectParams.push(sParamName);
						}
					});
				}
				
				// add new select params to custom select params
				jQuery.each(aNewSelectParams, function(sParamKey, sParamName){
					if (jQuery.inArray(sParamName, aSelectParams) == -1) {
						aSelectParams.push(sParamName);
					}
				});
				// add hierarchy annotation properties to select params if not there already
				if (this.bHasTreeAnnotations) {
					jQuery.each(this.oTreeProperties, function(sAnnotationName, sTreePropName){
						if (sTreePropName) {
							if (jQuery.inArray(sTreePropName, aSelectParams) == -1) {
								aSelectParams.push(sTreePropName);
							}
						}
					});
				}
				
				this.mParameters.select = aSelectParams.join(",");
			}
			
			this.sCustomParams = this.oModel.createCustomParams(this.mParameters);
		}
		
		//after parameter processing:
		//check if we have navigation parameters
		if (!this.bHasTreeAnnotations && !this.oNavigationPaths) {
			jQuery.sap.log.error("Neither navigation paths parameters, nor (complete/valid) tree hierarchy annotations where provided to the TreeBinding.");
			this.oNavigationPaths = {};
		}
	};
	
	/**
	 * Builds a download URL
	 * @param {string} sFormat The format for the result data, when accessing the Download-URL
	 */
	ODataTreeBinding.prototype.getDownloadUrl = function(sFormat) {
		var aParams = [],
			sPath;
		
		if (sFormat) {
			aParams.push("$format=" + encodeURIComponent(sFormat));
		}
		// sort and filter not supported yet
		/*if (this.sSortParams) {
			aParams.push(this.sSortParams);
		}*/

		if (this.getFilterParams()) {
			aParams.push("$filter=" + this.getFilterParams());
		}
		//also includes the selct parameters
		//in hierarchy annotated trees, the mapping properties are mandatory
		if (this.sCustomParams) {
			aParams.push(this.sCustomParams);
		}
		
		sPath = this.oModel.resolve(this.sPath,this.oContext);

		if (sPath) {
			return this.oModel._createRequestUrl(sPath, null, aParams);
		}
	};
	
	/**
	 * Setting the number of expanded levels leads to different requests.
	 * This function is used by the TreeTable for the ungroup/ungroup-all feature.
	 * @see sap.ui.table.TreeTable#_getGroupHeaderMenu
	 * @param {int} iLevels the number of levels which should be expanded, minimum is 0
	 * @protected
	 * @name sap.ui.model.odata.ODataTreeBinding#setNumberOfExpandedLevels
	 * @function
	 */
	ODataTreeBinding.prototype.setNumberOfExpandedLevels = function(iLevels) {
		iLevels = iLevels || 0;
		if (iLevels < 0) {
			jQuery.sap.log.warning("ODataTreeBinding: numberOfExpandedLevels was set to 0. Negative values are prohibited.");
			iLevels = 0;
		}
		// set the numberOfExpandedLevels on the binding directly
		// this.mParameters is inherited from the Binding super class
		this.iNumberOfExpandedLevels = iLevels;
		this._fireChange();
	};
	
	/**
	 * Retrieves the currently set number of expanded levels from the Binding (commonly an ODataTreeBinding).
	 * @protected
	 * @name sap.ui.model.odata.ODataTreeBinding#getNumberOfExpandedLevels
	 * @function
	 * @returns {int} the number of expanded levels
	 */
	ODataTreeBinding.prototype.getNumberOfExpandedLevels = function() {
		return this.iNumberOfExpandedLevels;
	};
	
	/**
	 * Sets the rootLevel
	 * The root level is the level of the topmost tree nodes, which will be used as an entry point for OData services.
	 * @param {int} iRootLevel
	 */
	ODataTreeBinding.prototype.setRootLevel = function(iRootLevel) {
		iRootLevel = parseInt(iRootLevel || 0, 10);
		if (iRootLevel < 0) {
			jQuery.sap.log.warning("ODataTreeBinding: rootLevels was set to 0. Negative values are prohibited.");
			iRootLevel = 0;
		}
		// set the rootLevel on the binding directly
		this.iRootLevel = iRootLevel;
		this.refresh();
	};

	/**
	 * Returns the rootLevel
	 * @returns {int}
	 */
	ODataTreeBinding.prototype.getRootLevel = function() {
		return this.iRootLevel;
	};

	ODataTreeBinding.prototype._getEntityType = function(){
		var sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);

		if (sResolvedPath) {
			var oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sResolvedPath);
			jQuery.sap.assert(oEntityType, "EntityType for path " + sResolvedPath + " could not be found!");
			return oEntityType;
		}

		return undefined;
	};

	ODataTreeBinding.prototype.getFilterParams = function() {
		if (this.aFilters) {
			this.aFilters = jQuery.isArray(this.aFilters) ? this.aFilters : [this.aFilters];
			if (this.aFilters.length > 0 && !this.sFilterParams) {
				this.sFilterParams = ODataUtils._createFilterParams(this.aFilters, this.oModel.oMetadata, this.oEntityType);
				this.sFilterParams = this.sFilterParams ? this.sFilterParams : "";
			}
		} else {
			this.sFilterParams = "";
		}

		return this.sFilterParams;
	};

	return ODataTreeBinding;

}, /* bExport= */ true);
