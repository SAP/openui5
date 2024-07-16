/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the OData model implementation of a tree binding
sap.ui.define([
	"sap/base/assert",
	"sap/base/Log",
	"sap/base/util/deepExtend",
	"sap/base/util/each",
	"sap/base/util/isEmptyObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter",
	"sap/ui/model/SorterProcessor",
	"sap/ui/model/TreeBinding",
	"sap/ui/model/TreeBindingUtils",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/OperationMode"
], function(assert, Log, deepExtend, each, isEmptyObject, ChangeReason, Context, Filter,
		FilterProcessor, FilterType, Sorter, SorterProcessor, TreeBinding, TreeBindingUtils,
		CountMode, ODataUtils, OperationMode) {
	"use strict";

	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.odata.v2.ODataModel#bindTree} instead!
	 *
	 * @param {sap.ui.model.odata.v2.ODataModel} oModel
	 *   The OData V2 model
	 * @param {string} sPath
	 *   The binding path, either absolute or relative to a given <code>oContext</code>
	 * @param {sap.ui.model.Context} [oContext]
	 *   The parent context which is required as base for a relative path
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [vFilters=[]]
	 *   The filters to be used initially with type {@link sap.ui.model.FilterType.Application}; call {@link #filter} to
	 *   replace them
	 * @param {object} [mParameters]
	 *   Map of binding parameters
	 * @param {boolean} [mParameters.transitionMessagesOnly=false]
	 *   Whether the tree binding only requests transition messages from the back end. If messages
	 *   for entities of this collection need to be updated, use
	 *   {@link sap.ui.model.odata.v2.ODataModel#read} on the parent entity corresponding to the
	 *   tree binding's context, with the parameter <code>updateAggregatedMessages</code> set to
	 *   <code>true</code>.
	 * @param {object} [mParameters.treeAnnotationProperties]
	 *   The mapping between data properties and the hierarchy used to visualize the tree, if not
	 *   provided by the service's metadata
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyLevelFor]
	 *   The property name in the same type holding the hierarchy level information
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyNodeFor]
	 *   The property name in the same type holding the hierarchy node id
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyParentNodeFor]
	 *   The property name in the same type holding the parent node id
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyDrillStateFor]
	 *   The property name in the same type holding the drill state for the node
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyNodeDescendantCountFor]
	 *   The property name in the same type holding the descendant count for the node
	 * @param {number} [mParameters.numberOfExpandedLevels=0]
	 *   The number of levels that are auto-expanded initially
	 * @param {number} [mParameters.rootLevel=0]
	 *   The level of the topmost tree nodes
	 * @param {string} [mParameters.groupId]
	 *   The group id to be used for requests originating from this binding
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode]
	 *   The operation mode for this binding
	 * @param {number} [mParameters.threshold]
	 *   Deprecated since 1.102.0, as {@link sap.ui.model.odata.OperationMode.Auto} is deprecated;
	 *   the threshold that defines how many entries should be fetched at least by the binding if
	 *   <code>operationMode</code> is set to <code>Auto</code>
	 * @param {boolean} [mParameters.useServersideApplicationFilters]
	 *   Deprecated since 1.102.0, as {@link sap.ui.model.odata.OperationMode.Auto} is deprecated;
	 *   whether <code>$filter</code> statements should be used for the <code>$count</code> /
	 *   <code>$inlinecount</code> requests and for the data request if the operation mode is
	 *   {@link sap.ui.model.odata.OperationMode.Auto OperationMode.Auto}
	 * @param {any} [mParameters.treeState]
	 *   A tree state handle
	 *  @param {sap.ui.model.odata.CountMode} [mParameters.countMode]
	 *    The count mode of this binding
	 *  @param {boolean} [mParameters.usePreliminaryContext]
	 *    Whether a preliminary context is used
	 * @param {string} [mParameters.batchGroupId]
	 *   <b>Deprecated</b>, use <code>groupId</code> instead
	 * @param {object} [mParameters.navigation]
	 *   <b>Deprecated since 1.44:</b> A map describing the navigation properties between entity
	 *   sets, which is used for constructing and paging the tree
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [vSorters=[]]
	 *   The sorters used initially; call {@link #sort} to replace them
	 * @throws {Error} If one of the filters uses an operator that is not supported by the underlying model
	 *   implementation or if the {@link sap.ui.model.Filter.NONE} filter instance is contained in
	 *   <code>vFilters</code> together with other filters
	 *
	 * @alias sap.ui.model.odata.v2.ODataTreeBinding
	 * @author SAP SE
	 * @class Tree binding implementation for the {@link sap.ui.model.odata.v2.ODataModel}. Use
	 *   {@link sap.ui.model.odata.v2.ODataModel#bindTree} for creating an instance.
	 * @extends sap.ui.model.TreeBinding
	 * @hideconstructor
	 * @public
	 * @version ${version}
	 */
	var ODataTreeBinding = TreeBinding.extend("sap.ui.model.odata.v2.ODataTreeBinding", /** @lends sap.ui.model.odata.v2.ODataTreeBinding.prototype */ {

		constructor : function (oModel, sPath, oContext, vFilters, mParameters, vSorters) {
			TreeBinding.apply(this, arguments);

			//make sure we have at least an empty parameter object
			this.mParameters = this.mParameters || mParameters || {};

			this.sGroupId = undefined;
			this.sRefreshGroupId = undefined;
			this.oFinalLengths = {};
			this.oLengths = {};
			this.oKeys = {};
			this.bNeedsUpdate = false;
			this._bRootMissing = false;
			this.bSkipDataEvents = false;

			if (vSorters instanceof Sorter) {
				vSorters = [vSorters];
			}
			this.aSorters = vSorters || [];
			this.sFilterParams = "";

			this.mNormalizeCache = {};

			vFilters = vFilters || [];
			// The ODataTreeBinding expects there to be only an array in this.aApplicationFilters later on.
			// Wrap the given application filters inside an array if necessary
			if (vFilters instanceof Filter) {
				vFilters = [vFilters];
			}
			if (vFilters.length > 1) {
				vFilters = [FilterProcessor.groupFilters(vFilters)];
			}
			this.aApplicationFilters = vFilters;

			// check filter integrity
			this.oModel.checkFilter(this.aApplicationFilters);

			// a queue containing all parallel running requests
			// a request is identified by (node id, startindex, length)
			this.mRequestHandles = {};

			this.oRootContext = null;

			this.iNumberOfExpandedLevels = (mParameters && mParameters.numberOfExpandedLevels) || 0;
			this.iRootLevel =  (mParameters && mParameters.rootLevel) || 0;

			this.sCountMode = (mParameters && mParameters.countMode) || this.oModel.sDefaultCountMode;
			if (this.sCountMode == CountMode.None) {
				Log.fatal("To use an ODataTreeBinding at least one CountMode must be supported by the service!");
			}

			if (mParameters) {
				this.sGroupId = mParameters.groupId || mParameters.batchGroupId;
			}

			this.bInitial = true;
			this._mLoadedSections = {};
			this._iPageSize = 0;

			// external operation mode
			this.sOperationMode = (mParameters && mParameters.operationMode) || this.oModel.sDefaultOperationMode;
			if (this.sOperationMode === OperationMode.Default) {
				this.sOperationMode = OperationMode.Server;
			}

			// internal operation mode switch, default is the same as "OperationMode.Server"
			// the internal operation mode might change, the external operation mode
			// (this.sOperationMode) will always be the original value
			this.bClientOperation = this.sOperationMode === OperationMode.Client;

			// the threshold for the OperationMode.Auto
			this.iThreshold = (mParameters && mParameters.threshold) || 0;

			// flag to check if the threshold was rejected after a count was issued
			this.bThresholdRejected = false;

			// the total collection count is the number of entries available in the backend (starting at the given rootLevel)
			this.iTotalCollectionCount = null;

			// a flag to decide if the OperationMode.Auto should "useServersideApplicationFilters", by default the filters are omitted.
			this.bUseServersideApplicationFilters = (mParameters && mParameters.useServersideApplicationFilters) || false;
			this.bUsePreliminaryContext = this.mParameters.usePreliminaryContext
				|| oModel.bPreliminaryContext;

			this.oAllKeys = null;
			this.oAllLengths = null;
			this.oAllFinalLengths = null;
			this.bTransitionMessagesOnly = !!this.mParameters.transitionMessagesOnly;

			// Whether a refresh has been performed
			this.bRefresh = false;
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
	 * Gets the request headers for a read request.
	 *
	 * @returns {Object<string, string>|undefined}
	 *   The request headers for a read request, or <code>undefined</code> if no headers are required
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getHeaders = function () {
		return this.bTransitionMessagesOnly ? {"sap-messages": "transientOnly"} : undefined;
	};

	/**
	 * Builds a node filter string.
	 * mParams.id holds the ID value for filtering on the hierarchy node.
	 *
	 * @param {object} mParams The filter params
	 * @returns {string} The filter to use with <code>$filter</code>
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getNodeFilterParams = function (mParams) {
		var sPropName = mParams.isRoot ? this.oTreeProperties["hierarchy-node-for"]
			: this.oTreeProperties["hierarchy-parent-node-for"];
		var oEntityType = this._getEntityType();
		return ODataUtils._createFilterParams(new Filter(sPropName, "EQ", mParams.id),
			this.oModel.oMetadata, oEntityType);
	};

	/**
	 * Builds the Level-Filter string
	 *
	 * @param {string} sOperator The filter operator
	 * @param {number} iLevel The filter level
	 * @returns {string} The filter to use with <code>$filter</code>
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getLevelFilterParams = function (sOperator, iLevel) {
		var oEntityType = this._getEntityType();
		return ODataUtils._createFilterParams(
			new Filter(this.oTreeProperties["hierarchy-level-for"], sOperator, iLevel),
			this.oModel.oMetadata, oEntityType);
	};

	/**
	 * Retrieves the root node given through sNodeId
	 * @param {string} sNodeId the ID od the root node which should be loaded (e.g. when bound to a single entity)
	 * @param {string} sRequestKey a key string used to store/clean-up request handles
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._loadSingleRootNodeByNavigationProperties = function (sNodeId, sRequestKey) {
		var that = this,
			sGroupId;

		if (this.mRequestHandles[sRequestKey]) {
			this.mRequestHandles[sRequestKey].abort();
		}
		sGroupId = this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId;
		var sAbsolutePath = this.getResolvedPath();
		if (sAbsolutePath) {
			this.mRequestHandles[sRequestKey] = this.oModel.read(sAbsolutePath, {
				groupId: sGroupId,
				headers: this._getHeaders(),
				success: function (oData) {
					var sNavPath = that._getNavPath(that.getPath());

					if (oData) {
						// we expect only one root node
						var oEntry = oData;
						var sKey = that.oModel._getKey(oEntry);
						// _loadSingleRootNodeByNavigationProperties is only used if there are no tree
						// annotations so "navigation"-mode is used which is is deprecated since 1.44 (see
						// mParameters.navigation), so deep path isn't needed
						var oNewContext = that.oModel.getContext('/' + sKey);

						that.oRootContext = oNewContext;
						that._processODataObject(oNewContext.getObject(), sNodeId, sNavPath);
					} else {
						that._bRootMissing = true;
					}
					that.bNeedsUpdate = true;

					delete that.mRequestHandles[sRequestKey];

					that.oModel.callAfterUpdate(function() {
						that.fireDataReceived({data: oData});
					});
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
		}
	};

	/**
	 * Returns root contexts for the tree. You can specify the start index and the length for paging
	 * requests. This function is not available when the annotation
	 * "hierarchy-node-descendant-count-for" is exposed on the service.
	 *
	 * @param {int} [iStartIndex=0]
	 *   The start index of the requested contexts
	 * @param {int} [iLength=v2.ODataModel.sizeLimit]
	 *   The requested amount of contexts. If none given, the default value is the size limit of the
	 *   underlying sap.ui.model.odata.v2.ODataModel instance.
	 * @param {int} [iThreshold=0]
	 *   The number of entities which should be retrieved in addition to the given length. A higher
	 *   threshold reduces the number of backend requests, yet these request blow up in size, since
	 *   more data is loaded.
	 * @return {sap.ui.model.odata.v2.Context[]}
	 *   The root contexts for the tree
	 * @public
	 */
	ODataTreeBinding.prototype.getRootContexts = function(iStartIndex, iLength, iThreshold) {
		var sNodeId = null,
			mRequestParameters = {
				numberOfExpandedLevels: this.iNumberOfExpandedLevels
			},
			aRootContexts = [];

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

			this.bDisplayRootNode = true;
			// load root level, node id is "null" in this case
			aRootContexts = this._getContextsForNodeId(null, iStartIndex, iLength, iThreshold);

		} else {
			sNodeId = this.getResolvedPath();

			var bIsList = this.oModel.isList(this.sPath, this.getContext());
			if (bIsList) {
				this.bDisplayRootNode = true;
			}

			if (this.bDisplayRootNode && !bIsList) {
				if (this.oRootContext) {
					return [this.oRootContext];
				} else if (this._bRootMissing) {
					// the backend may not return anything for the given root node, so in this case our root node is missing
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
	 * Returns the contexts of the child nodes for the given context. This function is not available
	 * when the annotation "hierarchy-node-descendant-count-for" is exposed on the service.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The context for which the child nodes should be retrieved
	 * @param {int} iStartIndex
	 *   The start index of the requested contexts
	 * @param {int} iLength
	 *   The requested amount of contexts
	 * @param {int} [iThreshold=0]
	 *   The maximum number of contexts to read before and after the given range; with this,
	 *   controls can prefetch data that is likely to be needed soon, e.g. when scrolling down in a
	 *   table.
	 * @return {sap.ui.model.odata.v2.Context[]}
	 *   The contexts of the child nodes for the given context
	 * @public
	 */
	ODataTreeBinding.prototype.getNodeContexts = function(oContext, iStartIndex, iLength, iThreshold) {

		var sNodeId,
			mRequestParameters = {};

		if (this.isInitial()) {
			return [];
		}

		if (this.bHasTreeAnnotations) {
			// previously only the Hierarchy-ID-property from the data was used as key but not the actual OData-Key
			// now the actual key of the odata entry is used
			sNodeId = this.oModel.getKey(oContext);
			mRequestParameters.level = parseInt(oContext.getProperty(this.oTreeProperties["hierarchy-level-for"])) + 1;
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
	 * This function is not available when the annotation "hierarchy-node-descendant-count-for" is exposed on the service.
	 *
	 * @param {sap.ui.model.Context} oContext the context element of the node
	 * @return {boolean} true if node has children
	 *
	 * @public
	 */
	ODataTreeBinding.prototype.hasChildren = function(oContext) {
		var iLength;

		if (this.bHasTreeAnnotations) {
			if (!oContext) {
				return false;
			}
			var sDrilldownState = oContext.getProperty(
				this.oTreeProperties["hierarchy-drill-state-for"]);

			var sNodeKey = this.oModel.getKey(oContext);

			iLength = this.oLengths[sNodeKey];

			// if the server returned no children for a node (even though it has a DrilldownState of
			// "expanded"), the length for this node is set to 0 and finalized
			// -> no children available
			if (iLength === 0 && this.oFinalLengths[sNodeKey]) {
				return false;
			}
			// leaves do not have children, only "expanded" and "collapsed" nodes
			// Beware: the drilldownstate may be undefined/empty string,
			//		 in case the entity (oContext) has no value for the drilldown state property
			if (sDrilldownState === "expanded" || sDrilldownState === "collapsed") {
				return true;
			} else if (sDrilldownState === "leaf"){
				return false;
			} else {
				Log.warning("The entity '" + oContext.getPath() +
					"' has not specified Drilldown State property value.");
				//fault tolerance for empty property values (we optimistically say that those nodes
				// can be expanded/collapsed)
				if (sDrilldownState === undefined || sDrilldownState === "") {
					return true;
				}
				return false;
			}
		} else {
			if (!oContext) {
				return this.oLengths[this.getPath()] > 0;
			}
			iLength = this.oLengths[oContext.getPath() + "/" + this._getNavPath(oContext.getPath())];

			//only return false if we definitely know that the length is 0, otherwise, we have
			// either a known length or none at all (undefined)
			return iLength !== 0;
		}
	};

	/**
	 * Returns the number of child nodes. This function is not available when the annotation "hierarchy-node-descendant-count-for"
	 * is exposed on the service.
	 *
	 * @param {Object} oContext the context element of the node
	 * @return {int} the number of children
	 *
	 * @public
	 */
	ODataTreeBinding.prototype.getChildCount = function(oContext) {
		if (this.bHasTreeAnnotations) {
			var vHierarchyNode;
			// only the root node should have no context
			// the child count is either stored via the rootNodeId or (if only the rootLevel is given) as "null", because we do not know the root id
			if (!oContext) {
				vHierarchyNode = null;
			} else {
				vHierarchyNode = this.oModel.getKey(oContext);
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
	 * Gets or loads all contexts for a specified node id (dependent on mode).
	 *
	 * @param {string} sNodeId
	 *   The value of the hierarchy node property on which a parent node filter will be performed
	 * @param {int} iStartIndex
	 *   The start index of the page
	 * @param {int} iLength
	 *   The length of the page
	 * @param {int} iThreshold
	 *   The additionally loaded entities
	 * @param {object} mRequestParameters
	 *   The additional request parameters
	 * @param {string} mRequestParameters.navPath
	 *   The navigation path
	 * @return {sap.ui.model.odata.v2.Context[]}
	 *   Contexts for the given node ID
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getContextsForNodeId = function(sNodeId, iStartIndex, iLength, iThreshold, mRequestParameters) {
		var aContexts = [],
			sKey;

		// Set default values if startindex, threshold or length are not defined
		iStartIndex = iStartIndex || 0;
		iLength = iLength || this.oModel.iSizeLimit;
		iThreshold = iThreshold || 0;

		if (!this._mLoadedSections[sNodeId]) {
			this._mLoadedSections[sNodeId] = [];
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

			return false;
			// check requested sections where we still wait for an answer
		};

		var aMissingSections = [];
		// Loop through known data and check whether we already have all rows loaded
		// make sure to also check that the entities before the requested start index can be served
		var i = Math.max((iStartIndex - iThreshold - this._iPageSize), 0);
		if (this.oKeys[sNodeId]) {

			// restrict loop to the maximum available length if we have a $(inline)count
			// this will make sure we do not find "missing" sections at the end of the known datablock, if it is outside the $(inline)count
			var iMaxIndexToCheck = iStartIndex + iLength + (iThreshold);
			if (this.oLengths[sNodeId]) {
				iMaxIndexToCheck = Math.min(iMaxIndexToCheck, this.oLengths[sNodeId]);
			}

			for (i; i < iMaxIndexToCheck; i++) {
				sKey = this.oKeys[sNodeId][i];
				if (!sKey) {
					//only collect missing sections if we are running in the internal operationMode "Server" -> bClientOperation = false
					if (!this.bClientOperation && !fnFindInLoadedSections(i)) {
						aMissingSections = TreeBindingUtils.mergeSections(aMissingSections, {startIndex: i, length: 1});
					}
				}

				// collect requested contexts if loaded
				if (i >= iStartIndex && i < iStartIndex + iLength) {
					if (sKey) {
						const sDeepPath = this.oModel.resolveDeep(this.sPath, this.oContext)
							+ sKey.slice(sKey.indexOf("("));
						aContexts.push(this.oModel.getContext('/' + sKey, sDeepPath));
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
					sKey = this.oKeys[sNodeId][i];
					if (!sKey) {
						if (!fnFindInLoadedSections(i)) {
							aMissingSections = TreeBindingUtils.mergeSections(aMissingSections, {startIndex: i, length: 1});
						}
					}
				}

				//last missing section will be appended with additional threshold ("positive")
				i = aMissingSections[aMissingSections.length - 1].startIndex + aMissingSections[aMissingSections.length - 1].length;
				var iEndIndex = i + iThreshold + this._iPageSize;
				// if we already have a count -> clamp the end index
				if (this.oLengths[sNodeId]) {
					iEndIndex = Math.min(iEndIndex, this.oLengths[sNodeId]);
				}

				for (i; i < iEndIndex; i++) {
					sKey = this.oKeys[sNodeId][i];
					if (!sKey) {
						if (!fnFindInLoadedSections(i)) {
							aMissingSections = TreeBindingUtils.mergeSections(aMissingSections, {startIndex: i, length: 1});
						}
					}
				}
			}
			// for initial loading of a node use this shortcut.
		} else if (!fnFindInLoadedSections(iStartIndex)) {
			// "i" is our shifted forward startIndex for the "negative" thresholding
			// in this case i is always smaller than iStartIndex, but minimum is 0
			var iLengthShift = iStartIndex - i;
			aMissingSections = TreeBindingUtils.mergeSections(aMissingSections,
				{startIndex: i, length: iLength + iLengthShift + iThreshold});
		}

		// check if metadata are already available
		if (this.oModel.getServiceMetadata()) {
			// If rows are missing send a request
			if (aMissingSections.length > 0) {
				var aParams = [];
				var sFilterParams = "";
				if (this.bHasTreeAnnotations) {

					if (this.sOperationMode == "Server" || this.bUseServersideApplicationFilters) {
						sFilterParams = this.getFilterParams();
						//sFilterParams = sFilterParams ? "%20and%20" + sFilterParams : "";
					}

					if (sNodeId) {
						sFilterParams = sFilterParams ? "%20and%20" + sFilterParams : "";
						// Retrieve the correct context for sNodeId (it's an OData-Key) and resolve the correct
						// hierarchy node property as a filter value;
						// aMissingSections are only requested for known contexts, so deep path isn't needed
						var oNodeContext = this.oModel.getContext("/" + sNodeId);
						var sNodeIdForFilter = oNodeContext.getProperty(this.oTreeProperties["hierarchy-node-for"]);

						//construct node filter parameter
						var sNodeFilterParameter = this._getNodeFilterParams({id: sNodeIdForFilter});
						aParams.push("$filter=" + sNodeFilterParameter + sFilterParams);
					} else if (sNodeId == null) {
						// no root node id is given: sNodeId === null
						// in this case we use the root level

						// in case the binding runs in OperationMode Server -> the level filter is EQ by default,
						// for the Client OperationMode GT is used to fetch all nodes below the given level
						// The only exception here is the rootLevel 0:
						// if the root Level is 0, we do not send any level filters, since by specification the top level nodes are on level 0
						// this is for compatibility reasons with different backend-systems, which do not support GE operators on the level
						var sLevelFilter = "";
						if (!this.bClientOperation || this.iRootLevel > 0) {
							var sLevelFilterOperator = this.bClientOperation ? "GE" : "EQ";
							sLevelFilter = this._getLevelFilterParams(sLevelFilterOperator, this.iRootLevel);
						}

						//only build filter statement if necessary
						if (sLevelFilter || sFilterParams) {
							//if we have a level filter AND an application filter, we need to add an escaped "AND" to between
							if (sFilterParams && sLevelFilter) {
								sFilterParams = "%20and%20" + sFilterParams;
							}
							aParams.push("$filter=" + sLevelFilter + sFilterParams);
						}
					}
				} else {
					// append application filters for navigation property case
					sFilterParams = this.getFilterParams();
					if (sFilterParams) {
						aParams.push("$filter=" + sFilterParams);
					}
				}

				if (this.sCustomParams) {
					aParams.push(this.sCustomParams);
				}

				if (!this.bClientOperation) {
					// request the missing sections and manage the loaded sections map
					for (i = 0; i < aMissingSections.length; i++) {
						var oRequestedSection = aMissingSections[i];
						this._mLoadedSections[sNodeId] = TreeBindingUtils.mergeSections(
							this._mLoadedSections[sNodeId],
							{
								startIndex: oRequestedSection.startIndex,
								length: oRequestedSection.length
							});
						this._loadSubNodes(sNodeId, oRequestedSection.startIndex,
							oRequestedSection.length, 0, aParams, mRequestParameters,
							oRequestedSection);
					}
				} else if (!this.oAllKeys
						&& !this.mRequestHandles[ODataTreeBinding.REQUEST_KEY_CLIENT]) {
					// OperationMode is set to "Client" AND we have something missing (should only
					// happen once, at the very first loading request)
					// of course also make sure no request is running already
					this._loadCompleteTreeWithAnnotations(aParams);
				}
			}
		}

		return aContexts;
	};

	/**
	 * Simple request to count how many nodes are available in the collection, starting at the given rootLevel.
	 * Depending on the countMode of the binding, either a $count or a $inlinecount is sent.
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getCountForCollection = function () {
		Log.error("The Count for the collection can only be retrieved with Hierarchy Annotations and in OperationMode.Auto.");
		return;
	};

	/**
	 * Issues a $count request for the given node-id/odata-key.
	 * Only used when running in <code>CountMode.Request</code>. Inlinecounts are appended directly
	 * when issuing a loading request.
	 *
	 * @param {string} sNodeId The node's ID
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getCountForNodeId = function(sNodeId) {
		var that = this,
			sGroupId;

		// create a request object for the data request
		var aParams = [];

		function _handleSuccess(oData) {
			that.oFinalLengths[sNodeId] = true;
			that.oLengths[sNodeId] = parseInt(oData);
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
			Log.warning(sErrorMsg);
		}

		var sAbsolutePath;

		var sFilterParams = this.getFilterParams() || "";
		var sNodeFilter = "";
		if (this.bHasTreeAnnotations) {
			sAbsolutePath = this.getResolvedPath();
			// only filter for the parent node if the given node is not the root (null)
			// if root and we $count the collection
			if (sNodeId != null) {
				// If node ID is given the count is requested for a missing section whose context is already available,
				// so deep path isn't needed
				const oNodeContext = this.oModel.getContext("/" + sNodeId);
				const sHierarchyNodeId = oNodeContext.getProperty(this.oTreeProperties["hierarchy-node-for"]);
				sNodeFilter = this._getNodeFilterParams({id: sHierarchyNodeId});
			} else {
				sNodeFilter = this._getLevelFilterParams("EQ", this.getRootLevel());
			}

		} else {
			sAbsolutePath = sNodeId;
		}

		if (sNodeFilter || sFilterParams) {
			var sAnd = "";
			if (sNodeFilter && sFilterParams) {
				sAnd = "%20and%20";
			}

			sFilterParams = "$filter=" + sFilterParams + sAnd + sNodeFilter;
			aParams.push(sFilterParams);
		}

		// Only send request, if path is defined
		if (sAbsolutePath) {
			sGroupId = this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId;
			this.oModel.read(sAbsolutePath + "/$count", {
				// this.bTransitionMessagesOnly is not relevant for $count requests -> no sap-messages header
				urlParameters: aParams,
				success: _handleSuccess,
				error: _handleError,
				sorters: this.aSorters,
				groupId: sGroupId
			});
		}
	};

	/**
	 * Retrieves parent ids from a given data set
	 *
	 * @param {Array} aData Lookup array to search for parent ids
	 * @returns {Object<string,string>} Map of all parent ids
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getParentMap = function(aData) {
		var mParentKeys = {};

		for (var i = 0; i < aData.length; i++) {
			var sID = aData[i][this.oTreeProperties["hierarchy-node-for"]];
			if (mParentKeys[sID]) {
				Log.warning("ODataTreeBinding: Duplicate key: " + sID + "!");
			}
			mParentKeys[sID] = this.oModel._getKey(aData[i]);

		}

		return mParentKeys;
	};

	/**
	 * Creates key map for given data
	 *
	 * @param {Array} aData
	 *   Data which should be preprocessed
	 * @param {boolean} bSkipFirstNode
	 *   Whether to skip the first node
	 * @returns {Object<string,string[]>|undefined}
	 *   Map of parent and child keys or <code>undefined</code> when <code>aData</code> is empty
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._createKeyMap = function(aData, bSkipFirstNode) {
		if (aData && aData.length > 0) {
			var mParentsKeys = this._getParentMap(aData), mKeys = {};

			for (var i = bSkipFirstNode ? 1 : 0; i < aData.length; i++) {
				var sParentNodeID = aData[i][this.oTreeProperties["hierarchy-parent-node-for"]],
					sParentKey = mParentsKeys[sParentNodeID];

				if (parseInt(aData[i][this.oTreeProperties["hierarchy-level-for"]]) === this.iRootLevel) {
					sParentKey = "null";
				}

				if (!mKeys[sParentKey]) {
					mKeys[sParentKey] = [];
				}

				// add the current entry key to the key map, as a child of its parent node
				mKeys[sParentKey].push(this.oModel._getKey(aData[i]));
			}

			return mKeys;
		}

		return undefined;
	};

	/**
	 * Should import the complete keys hierarchy.
	 *
	 * @param {Object<string,string[]>} mKeys Keys to add
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._importCompleteKeysHierarchy = function (mKeys) {
		var iChildCount, sKey;
		for (sKey in mKeys) {
			iChildCount = mKeys[sKey].length || 0;
			this.oKeys[sKey] = mKeys[sKey];
			// update the length of the parent node
			this.oLengths[sKey] = iChildCount;
			this.oFinalLengths[sKey] = true;

			// keep up with the loaded sections
			this._mLoadedSections[sKey] = [ { startIndex: 0, length: iChildCount } ];
		}
	};

	/**
	 * Update node key in case if it changes
	 *
	 * @param {object} oNode The node
	 * @param {string} sNewKey The new key
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._updateNodeKey = function (oNode, sNewKey) {
		var sOldKey = this.oModel.getKey(oNode.context),
			sParentKey, nIndex;
		if (parseInt(oNode.context.getProperty(this.oTreeProperties["hierarchy-level-for"])) === this.iRootLevel) {
			sParentKey = "null";
		} else {
			sParentKey = this.oModel.getKey(oNode.parent.context);
		}

		nIndex = this.oKeys[sParentKey].indexOf(sOldKey);
		if (nIndex !== -1) {
			this.oKeys[sParentKey][nIndex] = sNewKey;
		} else {
			this.oKeys[sParentKey].push(sNewKey);
		}
	};

	/**
	 * Triggers backend requests to load the subtree of a given node
	 *
	 * @param {object} oNode Root node of the requested subtree
	 * @param {string[]} aParams OData URL parameters
	 * @return {Promise} A promise resolving once the data has been imported
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._loadSubTree = function (oNode, aParams) {
		return new Promise(function (resolve, reject) {
			var sRequestKey, sGroupId, sAbsolutePath;

			// Prevent data from loading if no tree annotation is available
			if (!this.bHasTreeAnnotations) {
				reject(new Error("_loadSubTree: doesn't support hierarchies without tree annotations"));
				return;
			}

			sRequestKey = "loadSubTree-" + aParams.join("-");

			// Skip previous request
			if (this.mRequestHandles[sRequestKey]) {
				this.mRequestHandles[sRequestKey].abort();
			}

			var fnSuccess = function (oData) {
				// Collecting contexts
				// beware: oData.results can be an empty array -> so the length has to be checked
				if (oData.results.length > 0) {
					var sParentKey = this.oModel.getKey(oData.results[0]);
					this._updateNodeKey(oNode, sParentKey);
					var mKeys = this._createKeyMap(oData.results, true);
					this._importCompleteKeysHierarchy(mKeys);
				}

				delete this.mRequestHandles[sRequestKey];
				this.bNeedsUpdate = true;

				this.oModel.callAfterUpdate(function () {
					this.fireDataReceived({ data: oData });
				}.bind(this));

				resolve(oData);
			}.bind(this);

			var fnError = function (oError) {
				delete this.mRequestHandles[sRequestKey];

				//Only perform error handling if the request was not aborted intentionally
				if (oError && oError.statusCode === 0 && oError.statusText === "abort") {
					return;
				}

				this.fireDataReceived();

				reject(); // Application should retrieve error details via ODataModel events
			}.bind(this);


			// execute the request and use the metadata if available
			if (!this.bSkipDataEvents) {
				this.fireDataRequested();
			}
			this.bSkipDataEvents = false;

			sAbsolutePath = this.getResolvedPath();
			if (sAbsolutePath) {
				sGroupId = this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId;
				this.mRequestHandles[sRequestKey] = this.oModel.read(sAbsolutePath, {
					headers: this._getHeaders(),
					urlParameters: aParams,
					success: fnSuccess,
					error: fnError,
					sorters: this.aSorters,
					groupId: sGroupId
				});
			}
		}.bind(this));
	};

	/**
	 * Triggers backend requests to load the child nodes of the node with the given sNodeId.
	 *
	 * @param {string} sNodeId
	 *   The value of the hierarchy node property on which a parent node filter will be performed
	 * @param {int} iStartIndex
	 *   Start index of the page
	 * @param {int} iLength
	 *   Length of the page
	 * @param {int} iThreshold
	 *   Additionally loaded entities
	 * @param {array} aParams
	 *   OData URL parameters, already concatenated with "="
	 * @param {object} mParameters
	 *   Additional request parameters
	 * @param {object} mParameters.navPath
	 *   The navigation path
	 * @param {object} oRequestedSection
	 *   The requested section
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._loadSubNodes = function(sNodeId, iStartIndex, iLength, iThreshold,
			aParams, mParameters, oRequestedSection) {
		var that = this,
			sGroupId,
			bInlineCountRequested = false;

		// Only append $skip/$top values if we run in OperationMode "Server".
		// When the OperationMode is set to "Client", we will fetch the whole collection
		if ((iStartIndex || iLength) && !this.bClientOperation) {
			aParams.push("$skip=" + iStartIndex + "&$top=" + (iLength + iThreshold));
		}

		//check if we already have a count
		if (!this.oFinalLengths[sNodeId] || this.sCountMode == CountMode.InlineRepeat) {
			// issue $inlinecount
			if (this.sCountMode == CountMode.Inline || this.sCountMode == CountMode.InlineRepeat) {
				aParams.push("$inlinecount=allpages");
				bInlineCountRequested = true;
			} else if (this.sCountMode == CountMode.Request) {
				//... or $count request
				that._getCountForNodeId(sNodeId);
			}
		}

		var sRequestKey = "" + sNodeId + "-" + iStartIndex + "-" + this._iPageSize + "-" + iThreshold;

		function fnSuccess(oData) {
			var oEntry, i;

			if (oData) {
				// make sure we have a keys array
				that.oKeys[sNodeId] = that.oKeys[sNodeId] || [];

				// evaluate the count
				if (bInlineCountRequested && oData.__count >= 0) {
					that.oLengths[sNodeId] = parseInt(oData.__count);
					that.oFinalLengths[sNodeId] = true;
				}
			}

			// Collecting contexts
			// beware: oData.results can be an empty array -> so the length has to be checked
			if (Array.isArray(oData.results) && oData.results.length > 0) {

				// Case 1: Result is an entity set
				// Case 1a: Tree Annotations
				if (that.bHasTreeAnnotations) {
					var mLastNodeIdIndices = {};

					for (i = 0; i < oData.results.length; i++) {
						oEntry = oData.results[i];

						if (i == 0) {
							mLastNodeIdIndices[sNodeId] = iStartIndex;
						} else if (mLastNodeIdIndices[sNodeId] == undefined) {
							mLastNodeIdIndices[sNodeId] = 0;
						}

						that.oKeys[sNodeId][mLastNodeIdIndices[sNodeId]] = that.oModel._getKey(oEntry);
						mLastNodeIdIndices[sNodeId]++;
					}
				} else {
					// Case 1b: Navigation Properties
					for (i = 0; i < oData.results.length; i++) {
						oEntry = oData.results[i];
						var sKey = that.oModel._getKey(oEntry);
						that._processODataObject(oEntry, "/" + sKey, mParameters.navPath);
						that.oKeys[sNodeId][i + iStartIndex] = sKey;
					}
				}
			} else if (oData && !Array.isArray(oData.results)){
				// Case 2: oData.results is not an array, so oData is a single entity
				// this only happens if you bind to a single entity as root element)
				that.oKeys[null] = that.oModel._getKey(oData);
				if (!that.bHasTreeAnnotations) {
					that._processODataObject(oData, sNodeId, mParameters.navPath);
				}
			}

			delete that.mRequestHandles[sRequestKey];
			that.bNeedsUpdate = true;

			that.oModel.callAfterUpdate(function() {
				that.fireDataReceived({data: oData});
			});
		}

		function fnError(oError) {
			//Only perform error handling if the request was not aborted intentionally
			if (oError && oError.statusCode === 0 && oError.statusText === "abort") {
				return;
			}

			that.fireDataReceived();
			delete that.mRequestHandles[sRequestKey];

			if (oRequestedSection) {
				// remove section from loadedSections so the data can be requested again.
				// this might be required when e.g. when the service was not available for a short time
				var aLoadedSections = [];
				for (var i = 0; i < that._mLoadedSections[sNodeId].length; i++) {
					var oCurrentSection = that._mLoadedSections[sNodeId][i];
					if (oRequestedSection.startIndex >= oCurrentSection.startIndex && oRequestedSection.startIndex + oRequestedSection.length <= oCurrentSection.startIndex + oCurrentSection.length) {
						// remove the section interval and maintain adapted sections. If start index and length are the same, ignore the section
						if (oRequestedSection.startIndex !== oCurrentSection.startIndex && oRequestedSection.length !== oCurrentSection.length) {
							aLoadedSections = TreeBindingUtils.mergeSections(aLoadedSections, {startIndex: oCurrentSection.startIndex, length: oRequestedSection.startIndex - oCurrentSection.startIndex});
							aLoadedSections = TreeBindingUtils.mergeSections(aLoadedSections, {startIndex: oRequestedSection.startIndex + oRequestedSection.length, length: (oCurrentSection.startIndex + oCurrentSection.length) - (oRequestedSection.startIndex + oRequestedSection.length)});
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
			// execute the request and use the metadata if available
			if (!this.bSkipDataEvents) {
				this.fireDataRequested();
			}
			this.bSkipDataEvents = false;

			var sAbsolutePath;
			if (this.bHasTreeAnnotations) {
				sAbsolutePath = this.getResolvedPath();
			} else {
				sAbsolutePath = sNodeId;
			}

			if (this.mRequestHandles[sRequestKey]) {
				this.mRequestHandles[sRequestKey].abort();
			}
			if (sAbsolutePath) {
				sGroupId = this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId;
				this.mRequestHandles[sRequestKey] = this.oModel.read(sAbsolutePath, {
					headers: this._getHeaders(),
					urlParameters: aParams,
					success: fnSuccess,
					error: fnError,
					sorters: this.aSorters,
					groupId: sGroupId
				});
			}
		}
	};

	ODataTreeBinding.REQUEST_KEY_CLIENT = "_OPERATIONMODE_CLIENT_TREE_LOADING";

	/**
	 * Loads the complete collection from the given binding path. The tree is then reconstructed
	 * from the response entries based on the properties with hierarchy annotations.
	 * Adds additional URL parameters.
	 *
	 * @param {string[]} aURLParams Additional URL parameters
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._loadCompleteTreeWithAnnotations = function (aURLParams) {
		var that = this;

		var sRequestKey = ODataTreeBinding.REQUEST_KEY_CLIENT;

		var fnSuccess = function (oData) {

			// all nodes on root level -> save in this.oKeys[null] = [] (?)
			if (oData.results && oData.results.length > 0) {

				//collect mapping table between parent node id and actual OData-Key
				var mParentIds = {};
				var oDataObj;
				for (var k = 0; k < oData.results.length; k++) {
					oDataObj = oData.results[k];
					var sDataKey = oDataObj[that.oTreeProperties["hierarchy-node-for"]];
					// sanity check: if we have duplicate keys, the data is messed up. Has already happened...
					if (mParentIds[sDataKey]) {
						Log.warning("ODataTreeBinding - Duplicate data entry for key: " + sDataKey + "!");
					}
					mParentIds[sDataKey] = that.oModel._getKey(oDataObj);
				}

				// process data and built tree
				for (var i = 0; i < oData.results.length; i++) {
					oDataObj = oData.results[i];
					var sParentNodeId = oDataObj[that.oTreeProperties["hierarchy-parent-node-for"]];
					var sParentKey = mParentIds[sParentNodeId]; //oDataObj[that.oTreeProperties["hierarchy-parent-node-for"]];

					// the parentNodeID for root nodes (node level == iRootLevel) is "null"
					if (parseInt(oDataObj[that.oTreeProperties["hierarchy-level-for"]]) === that.iRootLevel) {
						sParentKey = "null";
					}

					// make sure the parent node is already present in the key map
					that.oKeys[sParentKey] = that.oKeys[sParentKey] || [];

					// add the current entry key to the key map, as a child of its parent node
					var sKey = that.oModel._getKey(oDataObj);
					that.oKeys[sParentKey].push(sKey);

					// update the length of the parent node
					that.oLengths[sParentKey] = that.oLengths[sParentKey] || 0;
					that.oLengths[sParentKey]++;
					that.oFinalLengths[sParentKey] = true;

					// keep up with the loaded sections
					that._mLoadedSections[sParentKey] = that._mLoadedSections[sParentKey] || [];
					that._mLoadedSections[sParentKey][0] = that._mLoadedSections[sParentKey][0] || {startIndex: 0, length: 0};
					that._mLoadedSections[sParentKey][0].length++;
				}

			} else {
				// no data received -> empty tree
				that.oKeys["null"] = [];
				that.oLengths["null"] = 0;
				that.oFinalLengths["null"] = true;
			}

			that.oAllKeys = deepExtend({}, that.oKeys);
			that.oAllLengths = deepExtend({}, that.oLengths);
			that.oAllFinalLengths = deepExtend({}, that.oFinalLengths);

			delete that.mRequestHandles[sRequestKey];
			that.bNeedsUpdate = true;

			// apply clientside filters, if any
			if ((that.aApplicationFilters && that.aApplicationFilters.length > 0) ||
				(that.aFilters && that.aFilters.length > 0)) {
				that._applyFilter();
			}

			// apply clientside sorters
			if (that.aSorters && that.aSorters.length > 0) {
				that._applySort();
			}

			that.oModel.callAfterUpdate(function() {
				that.fireDataReceived({data: oData});
			});
		};

		var fnError = function (oError) {
			delete that.mRequestHandles[sRequestKey];

			// handle error state like the ListBinding -> reset data and trigger update
			var bAborted = oError.statusCode == 0;
			if (!bAborted) {
				that.oKeys = {};
				that.oLengths = {};
				that.oFinalLengths = {};
				that.oAllKeys = {};
				that.oAllLengths = {};
				that.oAllFinalLengths = {};
				that._fireChange({reason: ChangeReason.Change});
				that.fireDataReceived();
			}
		};

		// request the tree collection
		if (!this.bSkipDataEvents) {
			this.fireDataRequested();
		}
		this.bSkipDataEvents = false;

		if (this.mRequestHandles[sRequestKey]) {
			this.mRequestHandles[sRequestKey].abort();
		}
		var sAbsolutePath = this.getResolvedPath();
		if (sAbsolutePath) {
			if (this.iTotalCollectionCount) {
				aURLParams.push("$top=" + this.iTotalCollectionCount);
			}
			this.mRequestHandles[sRequestKey] = this.oModel.read(sAbsolutePath, {
				headers: this._getHeaders(),
				urlParameters: aURLParams,
				success: fnSuccess,
				error: fnError,
				sorters: this.aSorters,
				groupId: this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId
			});
		}
	};

	/**
	 * Resets the current tree data and the lengths of the different nodes/groups.
	 *
	 * @param {object|boolean} vContextOrDoNotAbortReq If boolean, <code>true</code> will suppress abortion of pending requests.
	 * If an object is supplied, it is treated as the context for which the lengths values should be resetted.
	 *
	 * @private
	 */
	ODataTreeBinding.prototype.resetData = function(vContextOrDoNotAbortReq) {
		var oContext, bDoNotAbortRequests = false;
		if (typeof vContextOrDoNotAbortReq === "boolean") {
			bDoNotAbortRequests = vContextOrDoNotAbortReq;
		} else {
			oContext = vContextOrDoNotAbortReq;
		}
		if (oContext) {
			//Only reset specific content
			var sPath = oContext.getPath();

			delete this.oKeys[sPath];
			delete this.oLengths[sPath];
			delete this.oFinalLengths[sPath];
			delete this._mLoadedSections[sPath];
		} else {
			this.oKeys = {};

			// the internal operation mode might change, the external operation mode
			// (this.sOperationMode) will always be the original value
			// internal operation mode switch, default is the same as "OperationMode.Server"
			this.bClientOperation = this.sOperationMode === OperationMode.Client;

			// if no data is available after the reset we can't be sure the threshold is met or rejected
			this.bThresholdRejected = false;

			// the count might be wrong after a resetData, so we clear it
			this.iTotalCollectionCount = null;
			this.bCollectionCountRequested = false;

			// objects used for client side filter/sort
			this.oAllKeys = null;
			this.oAllLengths = null;
			this.oAllFinalLengths = null;

			this.oLengths = {};
			this.oFinalLengths = {};
			this.oRootContext = null;
			this._bRootMissing = false;

			if (!bDoNotAbortRequests) {
				this._abortPendingRequest();
			}

			this._mLoadedSections = {};
			this._iPageSize = 0;
			this.sFilterParams = "";
		}
	};

	/**
	 * Refreshes the binding, check whether the model data has been changed and fire change event
	 * if this is the case. For server side models this should refetch the data from the server.
	 * To update a control, even if no data has been changed, e.g. to reset a control after failed
	 * validation, use the parameter <code>bForceUpdate</code>.
	 *
	 * @param {boolean} [bForceUpdate] Update the bound control even if no data has been changed
	 * @param {string} [sGroupId] The  group Id for the refresh
	 *
	 * @public
	 */
	ODataTreeBinding.prototype.refresh = function(bForceUpdate, sGroupId) {
		if (typeof bForceUpdate === "string") {
			sGroupId = bForceUpdate;
		}
		this.sRefreshGroupId = sGroupId;
		this._refresh(bForceUpdate);
		this.sRefreshGroupId = undefined;
	};

	/**
	 * Refreshes the binding, check whether the model data has been changed and fire change event
	 * if this is the case. For server side models this should refetch the data from the server.
	 * To update a control, even if no data has been changed, e.g. to reset a control after failed
	 * validation, use the parameter <code>bForceUpdate</code>.
	 *
	 * @param {boolean} [bForceUpdate] Update the bound control even if no data has been changed
	 * @param {object} [mChangedEntities] A map of changed entities
	 * @param {string} [mEntityTypes] A map of entity types
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._refresh = function(bForceUpdate, mChangedEntities, mEntityTypes) {
		var bChangeDetected = false;
		if (!bForceUpdate) {
			if (mEntityTypes){
				var sResolvedPath = this.getResolvedPath();
				if (sResolvedPath) {
					// remove url parameters if any to get correct path for entity type resolving
					if (sResolvedPath.indexOf("?") !== -1) {
						sResolvedPath = sResolvedPath.split("?")[0];
					}
					var oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sResolvedPath);
					if (oEntityType && (oEntityType.entityType in mEntityTypes)) {
						bChangeDetected = true;
					}
				}
			}
			if (mChangedEntities && !bChangeDetected) {
				bChangeDetected = this._isRefreshAfterChangeAllowed()
					&& this._hasChangedEntity(mChangedEntities);
			}
			if (!mChangedEntities && !mEntityTypes) { // default
				bChangeDetected = true;
			}
		}
		if (bForceUpdate || bChangeDetected) {
			this.resetData();
			this.bNeedsUpdate = false;
			this.bRefresh = true;
			this._fireRefresh({reason: ChangeReason.Refresh});
		}
	};

	/**
	 * Checks whether this binding with its configuration is allowed to perform a refresh triggered
	 * by refreshAfterChange.
	 *
	 * @returns {boolean} Whether a refresh caused by refreshAfterChange is allowed
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._isRefreshAfterChangeAllowed = function () {
		return true;
	};

	/**
	 * Checks whether an entry of <code>this.oKeys</code> matches an entry of
	 * <code>mChangedEntities</code>.
	 *
	 * @param {Object<string,boolean>} mChangedEntities
	 *   Maps the key of a changed entity to <code>true</code>
	 * @return {boolean}
	 *   Whether at least one entry matches
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._hasChangedEntity = function (mChangedEntities) {
		var sChangedEntityKey, sNodeKey;

		for (sNodeKey in this.oKeys) {
			for (sChangedEntityKey in mChangedEntities) {
				if (this.oKeys[sNodeKey].includes(sChangedEntityKey)) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * Applies the given filters to the ODataTreeBinding.
	 *
	 * Please note that filters of type <code>FilterType.Control</code> are not supported for
	 * <code>OperationMode.Server</code>,
	 * here only filters of type <code>FilterType.Application</code> are allowed. Filters given via
	 * {@link sap.ui.model.odata.v2.ODataModel#bindTree} are always
	 * of type <code>Application</code> and will be sent with every back-end request.
	 * For more information, see {@link sap.ui.model.odata.v2.ODataModel#bindTree}.
	 *
	 * Since 1.34.0, complete client-side filtering is supported for
	 * <code>OperationMode.Client</code> and also in <code>OperationMode.Auto</code> if the
	 * back-end count is lower than the threshold.
	 * In this case, all types of filters will be applied on the client.
	 * See also: {@link sap.ui.model.odata.OperationMode.Auto} and {@link sap.ui.model.FilterType}.
	 *
	 * For the <code>OperationMode.Client</code> and <code>OperationMode.Auto</code>, you may also
	 * specify the <code>useServersideApplicationFilters</code>  binding parameter when creating an
	 * instance. If it is set, the filters of type <code>Application</code> will always be applied
	 * on the back end and trigger an OData request.
	 * For more information, see {@link sap.ui.model.odata.v2.ODataModel#bindTree}.
	 * <b>Note:</b> {@link sap.ui.model.odata.OperationMode.Auto} is deprecated since 1.102.0.
	 *
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [aFilters=[]]
	 *   The filters to use; in case of type {@link sap.ui.model.FilterType.Application} this replaces the filters given
	 *   in {@link sap.ui.model.odata.v2.ODataModel#bindTree}; a falsy value is treated as an empty array and thus
	 *   removes all filters of the specified type
	 * @param {sap.ui.model.FilterType} [sFilterType=sap.ui.model.FilterType.Control]
	 *   The type of the filter to replace
	 * @param {boolean} [bReturnSuccess]
	 *   Whether to return <code>true</code> or <code>false</code>, instead of <code>this</code>,
	 *   depending on whether the filtering has been done
	 * @return {this}
	 *   Returns <code>this</code> to facilitate method chaining
	 * @throws {Error} If one of the filters uses an operator that is not supported by the underlying model
	 *   implementation or if the {@link sap.ui.model.Filter.NONE} filter instance is contained in
	 *   <code>aFilters</code> together with other filters
	 *
	 * @see sap.ui.model.TreeBinding.prototype.filter
	 * @public
	 */
	ODataTreeBinding.prototype.filter = function (aFilters, sFilterType, bReturnSuccess) {
		var bSuccess = false;
		sFilterType = sFilterType || FilterType.Control;

		// check filter integrity
		this.oModel.checkFilter(aFilters);

		// check if filtering is supported for the current binding configuration
		if (sFilterType == FilterType.Control && (!this.bClientOperation || this.sOperationMode == OperationMode.Server)) {
			Log.warning("Filtering with ControlFilters is ONLY possible if the ODataTreeBinding is running in OperationMode.Client or " +
			"OperationMode.Auto, in case the given threshold is lower than the total number of tree nodes.");

			return this;
		}

		// empty filters
		if (!aFilters) {
			aFilters = [];
		}

		// accept single filter and arrays
		if (aFilters instanceof Filter) {
			aFilters = [aFilters];
		}

		if (sFilterType === FilterType.Control) {
			this.aFilters = aFilters;
		} else {
			if (aFilters.length > 1) {
				aFilters = [FilterProcessor.groupFilters(aFilters)];
			}
			this.aApplicationFilters = aFilters;
		}

		if (!this.bInitial) {

			// in client/auto mode: Always apply control filter.
			// Clientside Application filters are only applied if "bUseServersideApplicationFilters" is set to false (default), otherwise
			// the application filters will be applied on the backend.
			if (this.bClientOperation && (sFilterType === FilterType.Control || (sFilterType === FilterType.Application && !this.bUseServersideApplicationFilters))) {

				if (this.oAllKeys) {
					this.oKeys = deepExtend({}, this.oAllKeys);
					this.oLengths = deepExtend({}, this.oAllLengths);
					this.oFinalLengths = deepExtend({}, this.oAllFinalLengths);

					this._applyFilter();
					this._applySort();
					this._fireChange({reason: ChangeReason.Filter});
				} else {
					this.sChangeReason = ChangeReason.Filter;
				}
			} else {
				this.resetData();
				this.sChangeReason = ChangeReason.Filter;
				this._fireRefresh({reason: this.sChangeReason});
			}
			bSuccess = true;
		}

		if (bReturnSuccess) {
			return bSuccess;
		} else {
			return this;
		}
	};

	/**
	 * Process the currently set filters clientside. Uses the FilterProcessor and only works if the binding is running
	 * in the OperationModes "Client" or "Auto".
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._applyFilter = function () {
		var that = this;
		var oCombinedFilter;

		// if we do not use serverside application filters, we have to include them for the FilterProcessor
		if (this.bUseServersideApplicationFilters) {
			oCombinedFilter = FilterProcessor.groupFilters(this.aFilters);
		} else {
			oCombinedFilter = FilterProcessor.combineFilters(this.aFilters, this.aApplicationFilters);
		}

		// filter function for recursive filtering,
		// checks if a single key matches the filters
		var fnFilterKey = function (sKey) {
			var aFiltered = FilterProcessor.apply([sKey], oCombinedFilter, function(vRef, sPath) {
				// Only used in client mode, so deep path isn't needed
				var oContext = that.oModel.getContext('/' + vRef);
				return that.oModel.getProperty(sPath, oContext);
			}, that.mNormalizeCache);
			return aFiltered.length > 0;
		};

		// filtered tree will be stored in oFilteredKeys
		var oFilteredKeys = {};
		this._filterRecursive({id: "null"}, oFilteredKeys, fnFilterKey);

		this.oKeys = oFilteredKeys;

		// set the lengths for the root node
		if (!this.oKeys["null"]) {
			Log.warning("Clientside filter did not match on any node!");
		} else {
			this.oLengths["null"] = this.oKeys["null"].length;
			this.oFinalLengths["null"] = true;
		}
	};

	/*
	 * @private
	 */
	ODataTreeBinding.prototype._filterRecursive = function (oNode, mKeys, fnFilterKey) {
		var aChildrenKeys = this.oKeys[oNode.id];

		// node has children
		if (aChildrenKeys) {
			// loop over all children, and search for filter matches depth-first
			oNode.children = oNode.children || [];
			for (var i = 0; i < aChildrenKeys.length; i++) {
				var oChildNode = this._filterRecursive({
					id : aChildrenKeys[i]
				}, mKeys, fnFilterKey);

				if (oChildNode.isFiltered) {
					mKeys[oNode.id] = mKeys[oNode.id] || [];
					mKeys[oNode.id].push(oChildNode.id);

					oNode.children.push(oChildNode);
				}
			}

			// if node has children, then it should also be part of the filtered subset, since it is in the parent chain of a filter match
			if (oNode.children.length > 0) {
				oNode.isFiltered = true;
			} else {
				// if the node has no filter-matching children, it might still match the filter
				oNode.isFiltered = fnFilterKey(oNode.id);
			}

			// keep track of the group size and note the length as final if the node is part of the filtered subset
			if (oNode.isFiltered) {
				this.oLengths[oNode.id] = oNode.children.length;
				this.oFinalLengths[oNode.id] = true;
			}

			return oNode;
		} else {
			// node is leaf
			oNode.isFiltered = fnFilterKey(oNode.id);
			return oNode;
		}

	};

	/**
	 * Sorts the Tree according to the given Sorter(s). In <code>OperationMode.Client</code> or
	 * <code>OperationMode.Auto</code> (if the given threshold is satisfied), the sorters are
	 * applied locally on the client.
	 * <b>Note:</b> {@link sap.ui.model.odata.OperationMode.Auto} is deprecated since 1.102.0.
	 *
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [aSorters=[]]
	 *   The sorters to use; they replace the sorters given in {@link sap.ui.model.odata.v2.ODataModel#bindTree}; a
	 *   falsy value is treated as an empty array and thus removes all sorters
	 * @param {boolean} [bReturnSuccess]
	 *   Whether to return <code>true</code> or <code>false</code>, instead of <code>this</code>,
	 *   depending on whether the sorting has been done
	 * @return {this} returns <code>this</code> to facilitate method chaining
	 *
	 * @public
	 */
	ODataTreeBinding.prototype.sort = function(aSorters, bReturnSuccess) {

		var bSuccess = false;

		if (aSorters instanceof Sorter) {
			aSorters = [aSorters];
		}

		this.aSorters = aSorters || [];

		if (!this.bInitial) {
			this._abortPendingRequest();

			if (this.bClientOperation) {
				this.addSortComparators(aSorters, this.oEntityType);
				if (this.oAllKeys) {
					//apply client side sorter
					this._applySort();
					this._fireChange({reason: ChangeReason.Sort});
				} else {
					this.sChangeReason = ChangeReason.Sort;
				}
			} else {
				//server side sorting
				this.resetData(undefined, {reason: ChangeReason.Sort});
				this.sChangeReason = ChangeReason.Sort;
				this._fireRefresh({reason : this.sChangeReason});
			}
			bSuccess = true;
		}

		if (bReturnSuccess) {
			return bSuccess;
		} else {
			return this;
		}
	};

	/**
	 * Sets the comparator for each sorter in the sorters array according to the
	 * Edm type of the sort property
	 *
	 * @param {sap.ui.model.Sorter[]} aSorters The sorters
	 * @param {object} oEntityType The entity type of the collection
	 *
	 * @private
	 */
	ODataTreeBinding.prototype.addSortComparators = function(aSorters, oEntityType) {
		var oPropertyMetadata, sType;

		if (!oEntityType) {
			Log.warning("Cannot determine sort comparators, as entitytype of the collection is unknown!");
			return;
		}
		each(aSorters, function(i, oSorter) {
			if (!oSorter.fnCompare) {
				oPropertyMetadata = this.oModel.oMetadata._getPropertyMetadata(oEntityType, oSorter.sPath);
				sType = oPropertyMetadata && oPropertyMetadata.type;
				assert(oPropertyMetadata, "PropertyType for property " + oSorter.sPath + " of EntityType " + oEntityType.name + " not found!");
				oSorter.fnCompare = ODataUtils.getComparator(sType);
			}
		}.bind(this));
	};

	/**
	 * Sorts the data which is currently available on the client.
	 * Only used when running in OperationMode.Client.
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._applySort = function() {
		var that = this,
			oContext;

		// retrieves the sort value
		var fnGetValue = function(sKey, sPath) {
			// Only used in client mode, so deep path isn't needed
			oContext = that.oModel.getContext('/' + sKey);
			return that.oModel.getProperty(sPath, oContext);
		};

		// loop over all nodes and sort their children
		for (var sNodeID in this.oKeys) {
			SorterProcessor.apply(this.oKeys[sNodeID], this.aSorters, fnGetValue);
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,fire a change
	 * event.
	 *
	 * @param {boolean} [bForceUpdate]
	 *   Whether to fire the event regardless of the bindings state
	 * @param {object} mChangedEntities
	 *   A map of changed entities
	 *
	 * @private
	 */
	ODataTreeBinding.prototype.checkUpdate = function(bForceUpdate, mChangedEntities){
		var sChangeReason = this.sChangeReason ? this.sChangeReason : ChangeReason.Change;

		var bChangeDetected = false;
		if (!bForceUpdate) {
			if (this.bNeedsUpdate || !mChangedEntities) {
				bChangeDetected = true;
			} else {
				each(this.oKeys, function(i, aNodeKeys) {
					each(aNodeKeys, function(i, sKey) {
						if (sKey in mChangedEntities) {
							bChangeDetected = true;
							return false;
						}

						return true;
					});
					if (bChangeDetected) {
						return false;
					}

					return true;
				});
			}
		}
		if (bForceUpdate || bChangeDetected) {
			this.bNeedsUpdate = false;
			this._fireChange({reason: sChangeReason});
		}

		this.sChangeReason = undefined;
	};

	/**
	 * Splits the given path along the navigation properties.
	 * Only used when bound against a service, which describes the tree via navigation properties.
	 *
	 * @param {string} sPath The path
	 * @returns {string} The split path
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getNavPath = function(sPath) {
		//Check the last part of the path
		var sAbsolutePath = this.oModel.resolve(sPath, this.getContext());

		if (!sAbsolutePath) {
			return undefined;
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
	 *
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

		const oModel = this.getModel();
		var oRef = oModel._getObject(sPath);
		if (Array.isArray(oRef)) {
			this.oKeys[sPath] = oRef;
			this.oLengths[sPath] = oRef.length;
			this.oFinalLengths[sPath] = true;
		} else if (oRef) {
			this.oLengths[sPath] = 1;
			this.oFinalLengths[sPath] = true;
		}

		if (sNavPath && oObject[sNavPath]) {
			if (Array.isArray(oRef)) {
				oRef.forEach(function(sRef) {
					that._processODataObject(oModel.getProperty("/" + sRef), "/" + sRef + "/" + sNavPath,
						aNavPath.join("/"));
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
	 *
	 * The extracted hierarchy information will be stored in "this.oTreeProperties" (if any)
	 *
	 * @returns {boolean} Whether the metadata has tree annotations
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._hasTreeAnnotations = function() {
		var oMetadata = this.oModel.oMetadata,
			sAbsolutePath = this.getResolvedPath(),
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
		// true: everything is fine
		// false: we can't proceed
		var fnSanityCheckTreeAnnotations = function () {

			var iFoundAnnotations = 0;
			var iMaxAnnotationLength = 0;
			each(that.oTreeProperties, function (sPropName, sPropValue) {
				iMaxAnnotationLength++;

				if (sPropValue) {
					iFoundAnnotations += 1;
				}
			});

			if (iFoundAnnotations === iMaxAnnotationLength){
				return true;
			} else if (iFoundAnnotations > 0 && iFoundAnnotations < iMaxAnnotationLength) {
				Log.warning("Incomplete hierarchy tree annotations. Please check your service metadata definition!");
			}
			//if no annotations where found -> we are in the navigation property mode
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
			Log.fatal("EntityType for path " + sAbsolutePath + " could not be found.");
			return false;
		}

		//Check if all required properties are available
		each(oEntityType.property, function(iIndex, oProperty) {
			if (!oProperty.extensions) {
				return true;
			}
			each(oProperty.extensions, function(iIndex, oExtension) {
				var sName = oExtension.name;
				if (oExtension.namespace === sTreeAnnotationNamespace &&
						sName in that.oTreeProperties &&
						!that.oTreeProperties[sName]) {
					that.oTreeProperties[sName] = oProperty.name;
				}
			});

			return true;
		});

		return fnSanityCheckTreeAnnotations();
	};

	/**
	 * Initializes the binding. Fires a refresh event once initialization is completed in case the
	 * binding is resolved, or immediately in case it is unresolved.
	 *
	 * @returns {sap.ui.model.odata.v2.ODataTreeBinding} The binding instance
	 *
	 * @public
	 */
	ODataTreeBinding.prototype.initialize = function () {
		if (this.oModel.oMetadata && this.oModel.oMetadata.isLoaded() && this.bInitial) {
			if (this.isResolved()) {
				this._initialize(this._fireRefresh.bind(this, {reason : ChangeReason.Refresh}));
			} else {
				this._fireRefresh({reason : ChangeReason.Refresh});
			}
		}
		return this;
	};

	/**
	 * Private initialize.
	 * Triggers metadata checks for annotations and applies adapters if necessary.
	 *
	 * @param {function} fnFireEvent
	 *   A function which fires an event once the adapter has been applied
	 * @returns {sap.ui.model.odata.v2.ODataTreeBinding}
	 *   The binding instance
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._initialize = function (fnFireEvent) {
		this.bInitial = false;
		this.bHasTreeAnnotations = this._hasTreeAnnotations();
		this.oEntityType = this._getEntityType();
		this._processSelectParameters();
		this._applyAdapter(fnFireEvent);

		return this;
	};

	/**
	 * Sets the binding context.
	 *
	 * @param {sap.ui.model.Context} [oContext] The new binding context
	 *
	 * @private
	 */
	ODataTreeBinding.prototype.setContext = function (oContext) {
		if (oContext && oContext.isPreliminary() && !this.bUsePreliminaryContext) {
			return;
		}

		if (oContext && oContext.isUpdated() && this.bUsePreliminaryContext
				&& this.oContext === oContext) {
			this._fireChange({reason : ChangeReason.Context});
			return;
		}

		if (Context.hasChanged(this.oContext, oContext)) {
			this.oContext = oContext;
			if (!this.isRelative()) {
				return;
			}

			if (this.getResolvedPath()) {
				this.resetData();
				this._initialize(this._fireChange.bind(this, {reason : ChangeReason.Context}));
			} else if (!isEmptyObject(this.oAllKeys) || !isEmptyObject(this.oKeys)
					|| !isEmptyObject(this._aNodes)) { // binding is now unresolved, but has data
				this.resetData();
				this._fireChange({reason : ChangeReason.Context});
			}
		}
	};

	/**
	 * Initially only apply the Adapter interface.
	 * The real adapter will be applied after the initialize.
	 *
	 * @returns {this} A reference to itself
	 * @private
	 * @ui5-restricted sap.m.Tree, sap.ui.table.TreeTable
	 */
	ODataTreeBinding.prototype.applyAdapterInterface = function () {
		/*
		 * Data Interface.
		 * Documentation, see the corresponding Adapter classes.
		 */
		this.getContexts = this.getContexts || function () {
			return [];
		};
		this.getNodes = this.getNodes || function () {
			return [];
		};
		this.getLength = this.getLength || function () {
			return 0;
		};
		this.isLengthFinal = this.isLengthFinal || function () {
			return false;
		};
		this.getContextByIndex = this.getContextByIndex || function () {
			return;
		};
		/*
		 * Event Interface.
		 * Documentation, see the corresponding Adapter classes.
		 */
		this.attachSelectionChanged = this.attachSelectionChanged || function(oData, fnFunction, oListener) {
			this.attachEvent("selectionChanged", oData, fnFunction, oListener);
			return this;
		};
		this.detachSelectionChanged = this.detachSelectionChanged || function(fnFunction, oListener) {
			this.detachEvent("selectionChanged", fnFunction, oListener);
			return this;
		};
		this.fireSelectionChanged = this.fireSelectionChanged || function(oParameters) {
			this.fireEvent("selectionChanged", oParameters);
			return this;
		};

		return this;
	};

	/**
	 * Applies a TreeBindingAdapter, depending on the metadata. Either a hierarchical paging adapter
	 * (nav-props & annotations) or a flat paging adapter (magnitude) is applied.
	 *
	 * @param {function} fnFireEvent A function which is called after the adapter has been applied
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._applyAdapter = function (fnFireEvent) {
		var sAbsolutePath, oEntityType, i, j, sKeyProperty, sName,
			sAdapterModuleName = "sap/ui/model/odata/ODataTreeBindingAdapter",
			sMagnitudeAnnotation = "hierarchy-node-descendant-count-for",
			sPreorderRankAnnotation = "hierarchy-preorder-rank-for",
			sSiblingRankAnnotation = "hierarchy-sibling-rank-for",
			that = this;

		if (!this.bHasTreeAnnotations && !this.oNavigationPaths) {
			Log.error("Neither hierarchy annotations, "
				 + "nor navigation properties are specified to build the tree.", this);
			return;
		}

		if (this.bHasTreeAnnotations) {
			sAbsolutePath = this.getResolvedPath();
			// remove url parameters if any to get correct path for entity type resolving
			if (sAbsolutePath.indexOf("?") !== -1) {
				sAbsolutePath = sAbsolutePath.split("?")[0];
			}
			oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sAbsolutePath);
			//Check if all required properties are available
			each(oEntityType.property, function(iIndex, oProperty) {
				if (!oProperty.extensions) {
					return true;
				}
				each(oProperty.extensions, function(iIndex, oExtension) {
					sName = oExtension.name;
					if (oExtension.namespace === that.oModel.oMetadata.mNamespaces["sap"] &&
							(sName == sMagnitudeAnnotation || sName == sSiblingRankAnnotation
								|| sName == sPreorderRankAnnotation)) {
						that.oTreeProperties[sName] = oProperty.name;
					}
				});

				return true;
			});
			//perform magnitude annotation check
			this.oTreeProperties[sMagnitudeAnnotation] = this.oTreeProperties[sMagnitudeAnnotation]
				|| (this.mParameters.treeAnnotationProperties
					&& this.mParameters.treeAnnotationProperties.hierarchyNodeDescendantCountFor);
			// apply flat auto-expand mixin if the necessary annotations were found (in Server-Mode)
			// exception: the binding runs in operation-mode "Client". In this case, there is no
			// need for the advanced auto expand, since everything is loaded anyway.
			if (this.oTreeProperties[sMagnitudeAnnotation]
					&& this.sOperationMode == OperationMode.Server) {
				// Add Flat-specific tree properties
				this.oTreeProperties[sSiblingRankAnnotation] =
					this.oTreeProperties[sSiblingRankAnnotation]
					|| (this.mParameters.treeAnnotationProperties
						&& this.mParameters.treeAnnotationProperties.hierarchySiblingRankFor);
				this.oTreeProperties[sPreorderRankAnnotation] =
					this.oTreeProperties[sPreorderRankAnnotation]
					|| (this.mParameters.treeAnnotationProperties
						&& this.mParameters.treeAnnotationProperties.hierarchyPreorderRankFor);
				if (this.mParameters.restoreTreeStateAfterChange) {
					if (this.oTreeProperties[sSiblingRankAnnotation]
							&& this.oTreeProperties[sPreorderRankAnnotation]) {
						this._bRestoreTreeStateAfterChange = true;
						// Collect entity type key properties
						this._aTreeKeyProperties = [];
						for (i = oEntityType.key.propertyRef.length - 1; i >= 0; i--) {
							this._aTreeKeyProperties.push(oEntityType.key.propertyRef[i].name);
						}
					} else {
						Log.warning("Tree state restoration not possible: Missing annotation "
							+ "\"hierarchy-sibling-rank-for\" and/or "
							+ "\"hierarchy-preorder-rank-for\"");
						this._bRestoreTreeStateAfterChange = false;
					}
				} else {
					this._bRestoreTreeStateAfterChange = false;
				}
				// make sure magnitude is added to $select if not added by the application anyway
				if (this.mParameters && this.mParameters.select) {
					if (this.mParameters.select.indexOf(this.oTreeProperties[sMagnitudeAnnotation])
							=== -1) {
						this.mParameters.select += "," + this.oTreeProperties[sMagnitudeAnnotation];
					}
					if (this._bRestoreTreeStateAfterChange) {
						// Retrieve all key properties to allow filtering on them during tree state
						// restoration (PreorderPosition requests)
						for (j = this._aTreeKeyProperties.length - 1; j >= 0; j--) {
							sKeyProperty = this._aTreeKeyProperties[j];
							if (this.mParameters.select.indexOf(sKeyProperty) === -1) {
								this.mParameters.select += "," + sKeyProperty;
							}
						}
					}
					this.sCustomParams = this.oModel.createCustomParams(this.mParameters);
				}
				sAdapterModuleName = "sap/ui/model/odata/ODataTreeBindingFlat";
			}
		}
		sap.ui.require([sAdapterModuleName], function (oAdapterModule) {
			oAdapterModule.apply(that);
			fnFireEvent();
		});
	};

	/**
	 * Internal function to build up the $select, based on the select from the binding parameters
	 * and the properties being the target of the tree annotations.
	 *
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
					each(this.oNavigationPaths, function(sParamKey, sParamName){
						if (aNewSelectParams.indexOf(sParamName) == -1) {
							aNewSelectParams.push(sParamName);
						}
					});
				}

				// add new select params to custom select params
				each(aNewSelectParams, function(sParamKey, sParamName){
					if (aSelectParams.indexOf(sParamName) == -1) {
						aSelectParams.push(sParamName);
					}
				});
				// add hierarchy annotation properties to select params if not there already
				if (this.bHasTreeAnnotations) {
					each(this.oTreeProperties, function(sAnnotationName, sTreePropName){
						if (sTreePropName) {
							if (aSelectParams.indexOf(sTreePropName) == -1) {
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
			Log.error("Neither navigation paths parameters, nor (complete/valid) tree hierarchy annotations where provided to the TreeBinding.");
			this.oNavigationPaths = {};
		}
	};

	/**
	 * Returns the value of a given hierarchy annotation.
	 *
	 * @param {string} sAttributeName The name of the hierarchy annotation
	 * @return {string|undefined} The value of the hierarchy annotation
	 * @since 1.56
	 * @private
	 * @ui5-restricted sap.ui.comp.smarttable.SmartTable
	 */
	ODataTreeBinding.prototype.getTreeAnnotation = function(sAttributeName) {
		return this.bHasTreeAnnotations ? this.oTreeProperties[sAttributeName] : undefined;
	};

	/**
	 * Get a download URL with the specified format considering the
	 * sort/filter/custom parameters.
	 *
	 * @param {string} sFormat Value for the $format Parameter
	 * @return {string} URL which can be used for downloading
	 * @since 1.28
	 * @public
	 */
	ODataTreeBinding.prototype.getDownloadUrl = function(sFormat) {
		var aParams = [],
			sPath;

		if (sFormat) {
			aParams.push("$format=" + encodeURIComponent(sFormat));
		}
		// sort and filter not supported yet
		if (this.aSorters && this.aSorters.length > 0) {
			aParams.push(ODataUtils.createSortParams(this.aSorters));
		}

		if (this.getFilterParams()) {
			aParams.push("$filter=" + this.getFilterParams());
		}
		//also includes the select parameters
		//in hierarchy annotated trees, the mapping properties are mandatory
		if (this.sCustomParams) {
			aParams.push(this.sCustomParams);
		}

		sPath = this.getResolvedPath();

		return sPath && this.oModel._createRequestUrl(sPath, null, aParams);
	};

	/**
	 * Setting the number of expanded levels leads to different requests.
	 * This function is used by the TreeTable for the ungroup/ungroup-all feature.
	 * @see sap.ui.table.TreeTable#_getGroupHeaderMenu
	 * @param {int} iLevels the number of levels which should be expanded, minimum is 0
	 * @name sap.ui.model.odata.ODataTreeBinding#setNumberOfExpandedLevels
	 * @function
	 *
	 * @protected
	 * @ui5-restricted sap.ui.table.AnalyticalTable
	 */
	ODataTreeBinding.prototype.setNumberOfExpandedLevels = function(iLevels) {
		iLevels = iLevels || 0;
		if (iLevels < 0) {
			Log.warning("ODataTreeBinding: numberOfExpandedLevels was set to 0. Negative values are prohibited.");
			iLevels = 0;
		}
		// set the numberOfExpandedLevels on the binding directly
		// this.mParameters is inherited from the Binding super class
		this.iNumberOfExpandedLevels = iLevels;
		this._fireChange();
	};

	/**
	 * Retrieves the currently set number of expanded levels from the Binding (commonly an ODataTreeBinding).
	 * @name sap.ui.model.odata.ODataTreeBinding#getNumberOfExpandedLevels
	 * @function
	 * @returns {int} the number of expanded levels
	 *
	 * @protected
	 * @ui5-restricted sap.m.Tree, sap.ui.table.AnalyticalTable
	 */
	ODataTreeBinding.prototype.getNumberOfExpandedLevels = function() {
		return this.iNumberOfExpandedLevels;
	};

	/**
	 * Sets the <code>rootLevel</code>.
	 * The root level is the level of the topmost tree nodes that will be used as an entry point
	 * for OData services.
	 * This is only possible (and necessary) for OData services implementing the hierarchy
	 * annotation specification,
	 * or when providing the annotation information locally as a binding parameter.
	 * For more information, see {@link sap.ui.model.odata.v2.ODataModel#bindTree}.
	 *
	 * @param {int} iRootLevel The new <code>rootLevel</code>
	 *
	 * @public
	 */
	ODataTreeBinding.prototype.setRootLevel = function(iRootLevel) {
		iRootLevel = parseInt(iRootLevel || 0);
		if (iRootLevel < 0) {
			Log.warning("ODataTreeBinding: rootLevels was set to 0. Negative values are prohibited.");
			iRootLevel = 0;
		}
		// set the rootLevel on the binding directly
		this.iRootLevel = iRootLevel;
		this.refresh();
	};

	/**
	 * Returns the rootLevel
	 *
	 * @returns {int} The root level
	 *
	 * @public
	 */
	ODataTreeBinding.prototype.getRootLevel = function() {
		return parseInt(this.iRootLevel);
	};

	/**
	 * Retrieves the EntityType of the bindings path, resolved with the current context.
	 *
	 * @returns {object|undefined}
	 *   The entity type or <code>undefined</code>, if the bindings path can't be resolved
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getEntityType = function() {
		var sResolvedPath = this.getResolvedPath();

		if (sResolvedPath) {
			var oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sResolvedPath);
			assert(oEntityType, "EntityType for path " + sResolvedPath + " could not be found!");
			return oEntityType;
		}

		return undefined;
	};

	/**
	 * Creates valid odata filter strings for the application filters, given in "this.aApplicationFilters".
	 * Also sets the created filter-string to "this.sFilterParams".
	 * @returns {string} the concatenated OData filters
	 *
	 * @private
	 */
	ODataTreeBinding.prototype.getFilterParams = function() {
		var oGroupedFilter;
		if (this.aApplicationFilters) {
			this.aApplicationFilters = Array.isArray(this.aApplicationFilters) ? this.aApplicationFilters : [this.aApplicationFilters];
			if (this.aApplicationFilters.length > 0 && !this.sFilterParams) {
				oGroupedFilter = FilterProcessor.groupFilters(this.aApplicationFilters);
				this.sFilterParams = ODataUtils._createFilterParams(oGroupedFilter, this.oModel.oMetadata, this.oEntityType);
				// Add a bracket around filter params, as they will be combined with tree specific filters
				this.sFilterParams = this.sFilterParams ? "(" + this.sFilterParams + ")" : "";
			}
		} else {
			this.sFilterParams = "";
		}

		return this.sFilterParams;
	};

	/**
	 * Returns the filter information as an AST.
	 *
	 * @param {boolean} bIncludeOrigin
	 *   Whether to include information about the filter objects from which the tree has been created
	 * @returns {object|null} The AST of the filter tree or null if no filter is set
	 * @private
	 * @override
	 * @ui5-restricted sap.ui.table, sap.ui.export
	 */
	ODataTreeBinding.prototype.getFilterInfo = function (bIncludeOrigin) {
		return this.aApplicationFilters[0]
			? this.aApplicationFilters[0].getAST(bIncludeOrigin)
			: null;
	};

	/**
	* Abort all pending requests
	*
	* @private
	*/
	ODataTreeBinding.prototype._abortPendingRequest = function() {
		if (!isEmptyObject(this.mRequestHandles)) {
			this.bSkipDataEvents = true;

			// abort running request and clear the map afterwards
			each(this.mRequestHandles, function (sRequestKey, oRequestHandle) {
				if (oRequestHandle) {
					oRequestHandle.abort();
				}
			});
			this.mRequestHandles = {};
		}
	};

	/**
	 * Expand a nodes subtree to a given level.
	 *
	 * This API is only supported in <code>OperationMode.Server</code> and if the OData service implements the full
	 * specification of the "hierarchy-node-for" annotation.
	 *
	 * @param {int} iIndex Absolute row index
	 * @param {int} iLevel Level to which the data should be expanded
	 * @param {boolean} bSuppressChange If set to true, no change event will be fired
	 * @return {Promise} A promise resolving once the expansion process has been completed
	 *
	 * @function
	 * @name sap.ui.model.odata.v2.ODataTreeBinding.prototype.expandNodeToLevel
	 * @since 1.58
	 * @public
	 */

	/**
	 * Adds the given contexts to the tree by adding them as children to the given parent context.
	 * The contexts will be added before the current first child of the parent context.
	 *
	 * Only newly created contexts and contexts previously removed from the binding instance can be added.
	 * The binding does not accept contexts from other bindings.
	 *
	 * See the API documentation for the function {@link sap.ui.model.odata.v2.ODataTreeBinding#createEntry createEntry}.
	 *
	 * This feature is only available when the underlying OData service exposes the "hierarchy-node-descendant-count-for" annotation.
	 * See the constructor documentation for more details.
	 *
	 * @function
	 * @name sap.ui.model.odata.v2.ODataTreeBinding.prototype.addContexts
	 * @param {sap.ui.model.Context} oParentContext Parent context under which the new contexts will be inserted
	 * @param {sap.ui.model.Context|sap.ui.model.Context[]} vContextHandle An array of contexts or a single context, which will be added to the tree.
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Removes the given context from the tree, including all its descendants.
	 *
	 * Calling <code>removeContext</code> for a given context implicitly removes the complete subtree underneath it.
	 *
	 * This feature is only available when the underlying OData service exposes the "hierarchy-node-descendant-count-for" annotation.
	 * See the constructor documentation for more details.
	 *
	 * @function
	 * @name sap.ui.model.odata.v2.ODataTreeBinding.prototype.removeContext
	 * @param {sap.ui.model.Context} Context which should be removed
	 * @return {sap.ui.model.Context} The removed context
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Creates a new entry for the tree.
	 *
	 * A context object is returned which can be inserted in the tree hierarchy via
	 * {@link sap.ui.model.odata.v2.ODataTreeBinding#addContexts addContexts}.
	 * <b>Note:</b> The back-end request to create the entry is sent with the batch group stored at this binding's model
	 * for this binding's resolved path.
	 *
	 * This feature is only available when the underlying OData service exposes the
	 * "hierarchy-node-descendant-count-for" annotation. See
	 * {@link sap.ui.model.odata.v2.ODataModel#bindTree} for more details.
	 *
	 * @function
	 * @name sap.ui.model.odata.v2.ODataTreeBinding.prototype.createEntry
	 * @param {object} [mParameters]
	 *   A map of the following parameters:
	 * @param {string} [mParameters.changeSetId]
	 *   The ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {function} [mParameters.created]
	 *   The callback function that is called after the metadata of the service has been loaded and the
	 *   {@link sap.ui.model.odata.v2.Context} instance for the newly created entry is available;
	 *   The {@link sap.ui.model.odata.v2.Context} instance for the newly created entry is passed as
	 *   the first and only parameter.
	 * @param {function} [mParameters.error]
	 *   The error callback function
	 * @param {Object<string,string>} [mParameters.headers]
	 *   A map of headers
	 * @param {array|object} [mParameters.properties]
	 *   An array that specifies a set of properties or the initial data for the new entity as an object
	 * @param {function} [mParameters.success]
	 *   The success callback function
	 * @param {Object<string,string>} [mParameters.urlParameters]
	 *   A map of URL parameters
	 * @returns {sap.ui.model.odata.v2.Context|undefined}
	 *   An OData V2 context object that points to the newly created entry, or
	 *   <code>undefined</code> if the service metadata are not yet loaded or if a
	 *   <code>created</code> callback parameter is given
	 * @private
	 * @ui5-restricted
	 */

	return ODataTreeBinding;

});