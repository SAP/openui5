/*!
 * ${copyright}
 */

// Provides the OData model implementation of a tree binding
sap.ui.define([
	'sap/ui/model/TreeBinding',
	'sap/ui/model/odata/CountMode',
	'sap/ui/model/ChangeReason',
	'sap/ui/model/Filter',
	'sap/ui/model/Sorter',
	'sap/ui/model/odata/ODataUtils',
	'sap/ui/model/TreeBindingUtils',
	'sap/ui/model/odata/OperationMode',
	'sap/ui/model/SorterProcessor',
	'sap/ui/model/FilterProcessor',
	'sap/ui/model/FilterType',
	'sap/ui/model/Context',
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isEmptyObject"
],
	function(
		TreeBinding,
		CountMode,
		ChangeReason,
		Filter,
		Sorter,
		ODataUtils,
		TreeBindingUtils,
		OperationMode,
		SorterProcessor,
		FilterProcessor,
		FilterType,
		Context,
		Log,
		assert,
		jQuery,
		isEmptyObject
	) {
	"use strict";


	/**
	 *
	 * @class
	 * Tree binding implementation for OData models.
	 *
	 * <h3>Hierarchy Annotations</h3>
	 * To use the v2.ODataTreeBinding with an OData service which exposes hierarchy annotations, see the
	 * <b>"SAP Annotations for OData Version 2.0"</b> specification. The required property annotations as well
	 * as accepted/default values are documented in this specification.
	 *
	 * Services which include the <code>hierarchy-node-descendant-count-for</code> annotation and expose the data
	 * points sorted in a depth-first, pre-order manner, can use an optimized auto-expand feature by specifying the
	 * <code>numberOfExpandedLevels</code> in the binding parameters. This will pre-expand the hierarchy to the given
	 * number of levels, with only a single initial OData request.
	 *
	 * For services without the <code>hierarchy-node-descendant-count-for</code> annotation, the
	 * <code>numberOfExpandedLevels</code> property is not supported and deprecated.
	 *
	 *
	 * <h3>Navigation Properties</h3>
	 * <b>Note:</b> The use of navigation properties to build up the hierarchy structure is deprecated and it is
	 * recommended to use the hierarchy annotations mentioned above instead.
	 *
	 * In addition to the hierarchy annotations, the <code>ODataTreeBinding</code> also supports (cyclic) references
	 * between entities based on navigation properties. They have to be specified with the binding parameter
	 * <code>navigation</code>. The value for that parameter has to be structured as a map object where the keys
	 * are entity names and the values are names of navigation properties.
	 *
	 * Example:
	 * <pre>
	 *   oTree.bindItems({
	 *
	 *     path: "Employees",
	 *     template: ...
	 *
	 *	   parameters: {
	 *       navigation: {
	 *         "Employees": "toColleagues"
	 *       }
	 *     }
	 *   });
	 * </pre>
	 *
	 *
	 * <h3>Operation Modes</h3>
	 * For a full definition and explanation of all OData binding operation modes see {@link sap.ui.model.odata.OperationMode}.
	 *
	 * <h4>OperationMode.Server</h4>
	 * Filtering on the <code>ODataTreeBinding</code> is only supported with ({@link sap.ui.model.FilterType.Application application filters}).
	 * However please be aware that this applies only to filters which do not prevent the creation of a hierarchy.
	 * So filtering on a property (e.g. a "Customer") is fine, as long as the application can ensure that the responses
	 * from the backend are sufficient to create a valid hierarchy on the client. Subsequent paging requests for
	 * sibling and child nodes must also return responses since the filters will be sent with every request.
	 * Using control-defined filters ({@link sap.ui.model.FilterType.Control FilterType.Control}) via the
	 * <code>filter()</code> function is not supported for the operation mode <code>Server</code>.
	 *
	 * <h4>OperationMode.Client and OperationMode.Auto</h4>
	 * The ODataTreeBinding supports control-defined filters only in operation modes <code>Client</code> and
	 * <code>Auto</code>. In these operation modes, the filters and sorters will be applied on the client, like for
	 * the <code>v2.ODataListBinding</code>.
	 *
	 * The operation modes <code>Client</code> and <code>Auto</code> are only supported for services which expose the
	 * hierarchy annotations mentioned above, but do <b>not</b> expose the <code>hierarchy-node-descendant-count-for</code>
	 * annotation. Services with hierarchy annotations including the <code>hierarchy-node-descendant-count-for</code>
	 * annotation, do <b>not</b> support the operation modes <code>Client</code> and <code>Auto</code>.
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aApplicationFilters]
	 *               Predefined filter/s (can be either a filter or an array of filters). All these filters will be sent
	 *               with every request. Filtering on the <code>ODataTreeBinding</code> is only supported with initial filters.
	 * @param {object} [mParameters]
	 *               Parameter Object
	 * @param {object} [mParameters.treeAnnotationProperties]
	 *               This parameter defines the mapping between data properties and the hierarchy used to visualize the tree,
	 *               if not provided by the services metadata. For the correct metadata annotations, please check the
	 *               "SAP Annotations for OData Version 2.0" specification.
	 * @param {int} [mParameters.treeAnnotationProperties.hierarchyLevelFor]
	 *               Mapping to the property holding the hierarchy level information
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyNodeFor]
	 *               Mapping to the property holding the hierarchy node id
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyParentNodeFor]
	 *               Mapping to the property holding the parent node id
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyDrillStateFor]
	 *               Mapping to the property holding the drill state for the node
	 * @param {string} [mParameters.treeAnnotationProperties.hierarchyNodeDescendantCountFor]
	 *               Mapping to the property holding the descendant count for the node
	 * @param {object} [mParameters.navigation]
	 *               A map describing the navigation properties between entity sets, which should be used for constructing and
	 *               paging the tree. Keys in this object are entity names whereas the values name the navigation property
	 * @param {int} [mParameters.numberOfExpandedLevels=0]
	 *               This property defines the number of levels, which will be auto-expanded initially. Setting this property
	 *               might leads to multiple backend requests. Default value is 0. The auto-expand feature is deprecated for
	 *               services without the <code>hierarchy-node-descendant-count-for</code> annotation.
	 * @param {int} [mParameters.rootLevel=0]
	 *               The root level is the level of the topmost tree nodes, which will be used as an entry point for OData
	 *               services. According to the "SAP Annotations for OData Version 2.0" specification, the root level must
	 *               start at 0, default value thus is 0.
	 * @param {string} [mParameters.batchGroupId]
	 *               Deprecated - use <code>groupId</code> instead. Sets the batch group id to be used for requests
	 *               originating from this binding
	 * @param {string} [mParameters.groupId]
	 *               Sets the group id to be used for requests originating from this binding
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters]
	 *               Predefined sorters, can be either a sorter or an array of sorters
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode]
	 *               Operation mode for this binding; defaults to the model's default operation mode when not specified
	 * @param {int} [mParameters.threshold]
	 *               A threshold, which will be used in {@link sap.ui.model.odata.OperationMode.Auto OpeationMode.Auto}.
	 *               The binding tries to fetch (at least) as many entries as specified by the threshold value.
	 *               <code>OperationMode.Auto</code> is only supported for services which expose the hierarchy-annotations,
	 *               yet do <b>NOT</b> expose the <code>hierarchy-node-descendant-count-for</code> annotation.
	 * @param {boolean} [mParameters.useServersideApplicationFilters]
	 *               Whether <code>$filter</code> statements should be used for the <code>$count/$inlinecount</code> and
	 *               data-retrieval in the <code>OperationMode.Auto</code>. Only use this if your backend supports pre-
	 *               filtering the tree and is capable of responding with a complete tree hierarchy, including all inner
	 *               nodes. To construct the hierarchy on the client, it is mandatory that all filter-matches include
	 *               their complete parent chain up to the root level.
	 *               <code>OperationMode.Client</code> will still request the complete collection without filters, since
	 *               they will be applied on the client side.
	 * @param {any} [mParameters.treeState]
	 *               A tree state handle can be given to the <code>ODataTreeBinding</code> when two conditions are met:
	 *               The binding is running in <code>OperationMode.Client</code> AND the {@link sap.ui.table.TreeTable}
	 *               is used. The feature is only available when using the <code>ODataTreeBindingAdapter</code>, which is
	 *               automatically applied when using the <code>sap.ui.table.TreeTable</code>. The tree state handle will
	 *               contain all necessary information to expand the tree to the given state.
	 *
	 *               This feature is not supported in <code>OperationMode.Server</code> and <code>OperationMode.Auto</code>.
	 *               Please see also the {@link sap.ui.model.odata.ODataTreeBindingAdapter#getCurrentTreeState getCurrentTreeState}
	 *               method in class <code>ODataTreeBindingAdapter</code>.
	 * @public
	 * @alias sap.ui.model.odata.v2.ODataTreeBinding
	 * @extends sap.ui.model.TreeBinding
	 * @see {@link https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0 "SAP Annotations for OData Version 2.0" Specification}
	 */
	var ODataTreeBinding = TreeBinding.extend("sap.ui.model.odata.v2.ODataTreeBinding", /** @lends sap.ui.model.odata.v2.ODataTreeBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, aApplicationFilters, mParameters, aSorters){
			TreeBinding.apply(this, arguments);

			//make sure we have at least an empty parameter object
			this.mParameters = this.mParameters || mParameters || {};

			this.sGroupId;
			this.sRefreshGroupId;
			this.oFinalLengths = {};
			this.oLengths = {};
			this.oKeys = {};
			this.bNeedsUpdate = false;
			this._bRootMissing = false;

			this.aSorters = aSorters || [];
			this.sFilterParams = "";

			this.mNormalizeCache = {};

			// The ODataTreeBinding expects there to be only an array in this.aApplicationFilters later on.
			// Wrap the given application filters inside an array if necessary
			if (aApplicationFilters instanceof Filter) {
				aApplicationFilters = [aApplicationFilters];
			}
			this.aApplicationFilters = aApplicationFilters;

			// check filter integrity
			this.oModel.checkFilterOperation(this.aApplicationFilters);

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
			this.bClientOperation = false;

			// the internal operation mode might change, the external operation mode (this.sOperationMode) will always be the original value
			switch (this.sOperationMode) {
				case OperationMode.Server: this.bClientOperation = false; break;
				case OperationMode.Client: this.bClientOperation = true; break;
				case OperationMode.Auto: this.bClientOperation = false; break; //initially start the same as the server mode
			}

			// the threshold for the OperationMode.Auto
			this.iThreshold = (mParameters && mParameters.threshold) || 0;

			// flag to check if the threshold was rejected after a count was issued
			this.bThresholdRejected = false;

			// the total collection count is the number of entries available in the backend (starting at the given rootLevel)
			this.iTotalCollectionCount = null;

			// a flag to decide if the OperationMode.Auto should "useServersideApplicationFilters", by default the filters are omitted.
			this.bUseServersideApplicationFilters = (mParameters && mParameters.useServersideApplicationFilters) || false;

			this.oAllKeys = null;
			this.oAllLengths = null;
			this.oAllFinalLengths = null;
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
	 * Builds a node filter string.
	 * mParams.id holds the ID value for filtering on the hierarchy node.
	 */
	ODataTreeBinding.prototype._getNodeFilterParams = function (mParams) {
		var sPropName = mParams.isRoot ? this.oTreeProperties["hierarchy-node-for"] : this.oTreeProperties["hierarchy-parent-node-for"];
		var oEntityType = this._getEntityType();
		return ODataUtils._createFilterParams(new Filter(sPropName, "EQ", mParams.id), this.oModel.oMetadata, oEntityType);
	};

	/**
	 * Builds the Level-Filter string
	 */
	ODataTreeBinding.prototype._getLevelFilterParams = function (sOperator, iLevel) {
		var oEntityType = this._getEntityType();
		return ODataUtils._createFilterParams(new Filter(this.oTreeProperties["hierarchy-level-for"], sOperator, iLevel), this.oModel.oMetadata, oEntityType);
	};

	/**
	 * Retrieves the root node given through sNodeId
	 * @param {string} sNodeId the ID od the root node which should be loaded (e.g. when bound to a single entity)
	 * @param {string} sRequestKey a key string used to store/clean-up request handles
	 * @private
	 */
	ODataTreeBinding.prototype._loadSingleRootNodeByNavigationProperties = function (sNodeId, sRequestKey) {
		var that = this,
			sGroupId;

		if (this.mRequestHandles[sRequestKey]) {
			this.mRequestHandles[sRequestKey].abort();
		}
		sGroupId = this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId;
		var sAbsolutePath = this.oModel.resolve(this.getPath(), this.getContext());
		if (sAbsolutePath) {
			this.mRequestHandles[sRequestKey] = this.oModel.read(sAbsolutePath, {
				groupId: sGroupId,
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
	 * Returns root contexts for the tree. You can specify the start index and the length for paging requests.
	 * This function is not available when the annotation "hierarchy-node-descendant-count-for" is exposed on the service.
	 *
	 * @param {int} [iStartIndex=0] the start index of the requested contexts
	 * @param {int} [iLength=v2.ODataModel.sizeLimit] the requested amount of contexts. If none given, the default value is the size limit of the underlying
	 *												 sap.ui.model.odata.v2.ODataModel instance.
	 * @param {int} [iThreshold=0] the number of entities which should be retrieved in addition to the given length.
	 *				  A higher threshold reduces the number of backend requests, yet these request blow up in size, since more data is loaded.
	 * @return {sap.ui.model.Context[]} an array containing the contexts for the entities returned by the backend, might be fewer than requested
	 *								  if the backend does not have enough data.
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
			sNodeId = this.oModel.resolve(this.getPath(), this.getContext());

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
	 * Returns the contexts of the child nodes for the given context. This function is not available when the annotation "hierarchy-node-descendant-count-for"
	 * is exposed on the service.
	 *
	 * @param {sap.ui.model.Context} oContext the context for which the child nodes should be retrieved
	 * @param {int} iStartIndex the start index of the requested contexts
	 * @param {int} iLength the requested amount of contexts
	 * @param {int} iThreshold
	 * @return {sap.ui.model.Context[]} the contexts array
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
		if (this.bHasTreeAnnotations) {
			if (!oContext) {
				return false;
			}
			var sDrilldownState = oContext.getProperty(this.oTreeProperties["hierarchy-drill-state-for"]);

			var sNodeKey = this.oModel.getKey(oContext);
			//var sHierarchyNode = oContext.getProperty(this.oTreeProperties["hierarchy-node-for"]);

			var iLength = this.oLengths[sNodeKey];

			// if the server returned no children for a node (even though it has a DrilldownState of "expanded"),
			// the length for this node is set to 0 and finalized -> no children available
			if (iLength === 0 && this.oFinalLengths[sNodeKey]) {
				return false;
			}
			// leaves do not have childre, only "expanded" and "collapsed" nodes
			// Beware: the drilldownstate may be undefined/empty string,
			//		 in case the entity (oContext) has no value for the drilldown state property
			if (sDrilldownState === "expanded" || sDrilldownState === "collapsed") {
				return true;
			} else if (sDrilldownState === "leaf"){
				return false;
			} else {
				Log.warning("The entity '" + oContext.getPath() + "' has not specified Drilldown State property value.");
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
	 * Gets or loads all contexts for a specified node id (dependent on mode)
	 *
	 * @param {string} sNodeId the value of the hierarchy node property on which a parent node filter will be performed
	 * @param {int} iStartIndex start index of the page
	 * @param {int} iLength length of the page
	 * @param {int} iThreshold additionally loaded entities
	 * @param {object} mParameters additional request parameters
	 *
	 * @return {sap.ui.model.Context[]} Array of contexts
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._getContextsForNodeId = function(sNodeId, iStartIndex, iLength, iThreshold, mRequestParameters) {
		var aContexts = [],
			sKey;

		// OperationMode.Auto: handle synchronized count to check what the actual internal operation mode should be
		// If the $count or $inlinecount is used, is determined by the respective
		if (this.sOperationMode == OperationMode.Auto) {
			// as long as we do not have a collection count, we return an empty array
			if (this.iTotalCollectionCount == null) {
				if (!this.bCollectionCountRequested) {
					this._getCountForCollection();
					this.bCollectionCountRequested = true;
				}
				return [];
			}
		}

		// Set default values if startindex, threshold or length are not defined
		iStartIndex = iStartIndex || 0;
		iLength = iLength || this.oModel.iSizeLimit;
		iThreshold = iThreshold || 0;

		// re-set the threshold in OperationMode.Auto
		// between binding-treshold and the threshold given as an argument, the bigger one will be taken
		if (this.sOperationMode == OperationMode.Auto) {
			if (this.iThreshold >= 0) {
				iThreshold = Math.max(this.iThreshold, iThreshold);
			}
		}

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
					var sKey = this.oKeys[sNodeId][i];
					if (!sKey) {
						if (!fnFindInLoadedSections(i)) {
							aMissingSections = TreeBindingUtils.mergeSections(aMissingSections, {startIndex: i, length: 1});
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
				aMissingSections = TreeBindingUtils.mergeSections(aMissingSections, {startIndex: i, length: iLength + iLengthShift + iThreshold});
			}
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

						//retrieve the correct context for the sNodeId (it's an OData-Key) and resolve the correct hierarchy node property as a filter value
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
						this._mLoadedSections[sNodeId] = TreeBindingUtils.mergeSections(this._mLoadedSections[sNodeId], {startIndex: oRequestedSection.startIndex, length: oRequestedSection.length});
						this._loadSubNodes(sNodeId, oRequestedSection.startIndex, oRequestedSection.length, 0, aParams, mRequestParameters, oRequestedSection);
					}
				} else {
					// OperationMode is set to "Client" AND we have something missing (should only happen once, at the very first loading request)
					// of course also make sure no request is running already
					if (!this.oAllKeys && !this.mRequestHandles[ODataTreeBinding.REQUEST_KEY_CLIENT]) {
						this._loadCompleteTreeWithAnnotations(aParams);
					}
				}

			}
		}

		return aContexts;
	};

	/**
	 * Simple request to count how many nodes are available in the collection, starting at the given rootLevel.
	 * Depending on the countMode of the binding, either a $count or a $inlinecount is sent.
	 */
	ODataTreeBinding.prototype._getCountForCollection = function () {

		if (!this.bHasTreeAnnotations || this.sOperationMode != OperationMode.Auto) {
			Log.error("The Count for the collection can only be retrieved with Hierarchy Annotations and in OperationMode.Auto.");
			return;
		}

		// create a request object for the data request
		var aParams = [];

		function _handleSuccess(oData) {

			// $inlinecount is in oData.__count, the $count is just oData
			var iCount = oData.__count ? parseInt(oData.__count) : parseInt(oData);

			this.iTotalCollectionCount = iCount;

			// in the OpertionMode.Auto, we check if the count is LE than the given threshold and set the client operation flag accordingly
			if (this.sOperationMode == OperationMode.Auto) {
				if (this.iTotalCollectionCount <= this.iThreshold) {
					this.bClientOperation = true;
					this.bThresholdRejected = false;
				} else {
					this.bClientOperation = false;
					this.bThresholdRejected = true;
				}
				this._fireChange({reason: ChangeReason.Change});
			}
		}

		function _handleError(oError) {
			// Only perform error handling if the request was not aborted intentionally
			if (oError && oError.statusCode === 0 && oError.statusText === "abort") {
				return;
			}
			var sErrorMsg = "Request for $count failed: " + oError.message;
			if (oError.response){
				sErrorMsg += ", " + oError.response.statusCode + ", " + oError.response.statusText + ", " + oError.response.body;
			}
			Log.warning(sErrorMsg);
		}

		var sAbsolutePath = this.oModel.resolve(this.getPath(), this.getContext());

		// default filter is on the rootLevel
		var sLevelFilter = "";
		if (this.iRootLevel > 0) {
			sLevelFilter = this._getLevelFilterParams("GE", this.getRootLevel());
		}

		// if necessary we add all other filters to the count request
		var sFilterParams = "";
		if (this.bUseServersideApplicationFilters) {
			var sFilterParams = this.getFilterParams();
		}

		//only build filter statement if necessary
		if (sLevelFilter || sFilterParams) {
			//if we have a level filter AND an application filter, we need to add an escaped "AND" to between
			if (sFilterParams && sLevelFilter) {
				sFilterParams = "%20and%20" + sFilterParams;
			}
			aParams.push("$filter=" + sLevelFilter + sFilterParams);
		}

		// figure out how to request the count
		var sCountType = "";
		if (this.sCountMode == CountMode.Request || this.sCountMode == CountMode.Both) {
			sCountType = "/$count";
		} else if (this.sCountMode == CountMode.Inline || this.sCountMode == CountMode.InlineRepeat) {
			aParams.push("$top=0");
			aParams.push("$inlinecount=allpages");
		}

		// send the counting request
		if (sAbsolutePath) {
			this.oModel.read(sAbsolutePath + sCountType, {
				urlParameters: aParams,
				success: _handleSuccess.bind(this),
				error: _handleError.bind(this),
				groupId: this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId
			});
		}
	};

	/**
	 * Issues a $count request for the given node-id/odata-key.
	 * Only used when running in CountMode.Request. Inlinecounts are appended directly when issuing a loading request.
	 * @private
	 */
	ODataTreeBinding.prototype._getCountForNodeId = function(sNodeId, iStartIndex, iLength, iThreshold, mParameters) {
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
			//resolve OData-Key to hierarchy node property value for filtering
			var oNodeContext = this.oModel.getContext("/" + sNodeId);
			var sHierarchyNodeId = oNodeContext.getProperty(this.oTreeProperties["hierarchy-node-for"]);

			sAbsolutePath = this.oModel.resolve(this.getPath(), this.getContext());
			// only filter for the parent node if the given node is not the root (null)
			// if root and we $count the collection
			if (sNodeId != null) {
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
	 * @param {Boolean} bExcludeRootNodes Can be set to exclude root node elements
	 * @returns {Array} Array of all parent ids
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
	 * @param {Array} aData data which should be preprocessed
	 * @returns {Object<string,string[]>} Map of parent and child keys
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
	 * @param {object} oNode
	 * @param {string} sNewKey
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
					var mKeys = this._createKeyMap(oData.results);
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
				// Always fire data received event
				this.fireDataReceived();

				//Only perform error handling if the request was not aborted intentionally
				if (oError && oError.statusCode === 0 && oError.statusText === "abort") {
					return;
				}

				delete this.mRequestHandles[sRequestKey];

				reject(); // Application should retrieve error details via ODataModel events
			}.bind(this);


			// execute the request and use the metadata if available
			this.fireDataRequested();

			sAbsolutePath = this.oModel.resolve(this.getPath(), this.getContext());
			if (sAbsolutePath) {
				sGroupId = this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId;
				this.mRequestHandles[sRequestKey] = this.oModel.read(sAbsolutePath, {
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
	 * @param {string} sNodeId the value of the hierarchy node property on which a parent node filter will be performed
	 * @param {int} iStartIndex start index of the page
	 * @param {int} iLength length of the page
	 * @param {int} iThreshold additionally loaded entities
	 * @param {array} aParams OData URL parameters, already concatenated with "="
	 * @param {object} mParameters additional request parameters
	 * @param {object} mParameters.navPath the navigation path
	 *
	 * @return {sap.ui.model.Context[]} Array of contexts
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._loadSubNodes = function(sNodeId, iStartIndex, iLength, iThreshold, aParams, mParameters, oRequestedSection) {
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
			if (this.sCountMode == CountMode.Inline || this.sCountMode == CountMode.InlineRepeat || this.sCountMode == CountMode.Both) {
				aParams.push("$inlinecount=allpages");
				bInlineCountRequested = true;
			} else if (this.sCountMode == CountMode.Request) {
				//... or $count request
				that._getCountForNodeId(sNodeId);
			}
		}

		var sRequestKey = "" + sNodeId + "-" + iStartIndex + "-" + this._iPageSize + "-" + iThreshold;

		function fnSuccess(oData) {

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

					for (var i = 0; i < oData.results.length; i++) {
						var oEntry = oData.results[i];

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
					for (var i = 0; i < oData.results.length; i++) {
						var oEntry = oData.results[i];
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
			// Always fire data received event
			that.fireDataReceived();

			//Only perform error handling if the request was not aborted intentionally
			if (oError && oError.statusCode === 0 && oError.statusText === "abort") {
				return;
			}

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
			if (sAbsolutePath) {
				sGroupId = this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId;
				this.mRequestHandles[sRequestKey] = this.oModel.read(sAbsolutePath, {
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
	 * Loads the complete collection from the given binding path.
	 * The tree is then reconstructed from the response entries based on the properties with hierarchy annotations.
	 * Adds additional URL parameters.
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
					// sanity check: if we have duplicate keys, the data is messed up. Has already happend...
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

			that.oAllKeys = jQuery.extend(true, {}, that.oKeys);
			that.oAllLengths = jQuery.extend(true, {}, that.oLengths);
			that.oAllFinalLengths = jQuery.extend(true, {}, that.oFinalLengths);

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
			}

			that.fireDataReceived();
		};

		// request the tree collection
		this.fireDataRequested();
		if (this.mRequestHandles[sRequestKey]) {
			this.mRequestHandles[sRequestKey].abort();
		}
		var sAbsolutePath = this.oModel.resolve(this.getPath(), this.getContext());
		if (sAbsolutePath) {
			this.mRequestHandles[sRequestKey] = this.oModel.read(sAbsolutePath, {
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

			// the internal operation mode might change, the external operation mode (this.sOperationMode) will always be the original value
			// internal operation mode switch, default is the same as "OperationMode.Server"
			this.bClientOperation = false;

			// the internal operation mode might change, the external operation mode (this.sOperationMode) will always be the original value
			switch (this.sOperationMode) {
				case OperationMode.Server: this.bClientOperation = false; break;
				case OperationMode.Client: this.bClientOperation = true; break;
				case OperationMode.Auto: this.bClientOperation = false; break; //initially start the same as the server mode
			}
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
	 * @param {object} [mChangedEntities]
	 * @param {string} [mEntityTypes]
	 *
	 * @private
	 */
	ODataTreeBinding.prototype._refresh = function(bForceUpdate, mChangedEntities, mEntityTypes) {
		var bChangeDetected = false;
		if (!bForceUpdate) {
			if (mEntityTypes){
				var sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);
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
			// TODO: Abort pending requests --> like ODataListBinding
			this.bNeedsUpdate = false;
			this.bRefresh = true;
			this._fireRefresh({reason: ChangeReason.Refresh});
		}
	};

	/**
	 * Applies the given filters to the ODataTreeBinding.
	 *
	 * Please note that filters of type <code>FilterType.Control</code> are not supported for <code>OperationMode.Server</code>,
	 * here only filters of type <code>FilterType.Application</code> are allowed. Filters given via the constructor are always
	 * of type <code>Application</code> and will be sent with every backend request.
	 * See the constructor documentation for more information.
	 *
	 * Since 1.34.0, complete client-side filtering is supported for <code>OperationMode.Client</code> and also in
	 * <code>OperationMode.Auto</code> if the backend count is lower than the threshold.
	 * In this case, all types of filters will be applied on the client.
	 * See also: {@link sap.ui.model.odata.OperationMode.Auto}, {@link sap.ui.model.FilterType}.
	 *
	 * For the <code>OperationMode.Client</code> and <code>OperationMode.Auto</code>, you may also specify the
	 * binding parameter <code>useServersideApplicationFilters</code> in the constructor. If it is set, the filters of type
	 * <code>Application</code> will always be applied on the backend and trigger an OData request.
	 * See the constructor documentation for more information.
	 *
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} aFilters Filter or array of filters to apply
	 * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted. If it is not given,
	 *   the type <code>FilterType.Control</code> is assumed
	 * @return {sap.ui.model.odata.v2.ODataTreeBinding} Returns <code>this</code> to facilitate method chaining
	 * @see sap.ui.model.TreeBinding.prototype.filter
	 * @public
	 */
	ODataTreeBinding.prototype.filter = function (aFilters, sFilterType, bReturnSuccess) {
		var bSuccess = false;
		sFilterType = sFilterType || FilterType.Control;

		// check filter integrity
		this.oModel.checkFilterOperation(aFilters);

		// check if filtering is supported for the current binding configuration
		if (sFilterType == FilterType.Control && (!this.bClientOperation || this.sOperationMode == OperationMode.Server)) {
			Log.warning("Filtering with ControlFilters is ONLY possible if the ODataTreeBinding is running in OperationMode.Client or " +
			"OperationMode.Auto, in case the given threshold is lower than the total number of tree nodes.");
			return;
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
			this.aApplicationFilters = aFilters;
		}

		if (!this.bInitial) {

			// in client/auto mode: Always apply control filter.
			// Clientside Application filters are only applied if "bUseServersideApplicationFilters" is set to false (default), otherwise
			// the application filters will be applied on the backend.
			if (this.bClientOperation && (sFilterType === FilterType.Control || (sFilterType === FilterType.Application && !this.bUseServersideApplicationFilters))) {

				if (this.oAllKeys) {
					this.oKeys = jQuery.extend(true, {}, this.oAllKeys);
					this.oLengths = jQuery.extend(true, {}, this.oAllLengths);
					this.oFinalLengths = jQuery.extend(true, {}, this.oAllFinalLengths);

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
	 * Sorts the Tree according to the given Sorter(s).
	 * In OperationMode.Client or OperationMode.Auto (if the given threshold is satisfied), the sorters are applied locally on the client.
	 *
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} aSorters the Sorter or an Array of sap.ui.model.Sorter instances
	 * @return {sap.ui.model.odata.v2.ODataTreeBinding} returns <code>this</code> to facilitate method chaining
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
	 * @private
	 */
	ODataTreeBinding.prototype.addSortComparators = function(aSorters, oEntityType) {
		var oPropertyMetadata, sType;

		if (!oEntityType) {
			Log.warning("Cannot determine sort comparators, as entitytype of the collection is unkown!");
			return;
		}
		jQuery.each(aSorters, function(i, oSorter) {
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
	 * @private
	 */
	ODataTreeBinding.prototype._applySort = function() {
		var that = this,
			oContext;

		// retrieves the sort value
		var fnGetValue = function(sKey, sPath) {
			oContext = that.oModel.getContext('/' + sKey);
			return that.oModel.getProperty(sPath, oContext);
		};

		// loop over all nodes and sort their children
		for (var sNodeID in this.oKeys) {
			SorterProcessor.apply(this.oKeys[sNodeID], this.aSorters, fnGetValue);
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} bForceUpdate
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
			this._fireChange({reason: sChangeReason});
		}

		this.sChangeReason = undefined;
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
	 *
	 * The extracted hierarchy information will be stored in "this.oTreeProperties" (if any)
	 *
	 * @private
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
				Log.warning("Incomplete hierarchy tree annotations. Please check your service metadata definition!");
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
			Log.fatal("EntityType for path " + sAbsolutePath + " could not be found.");
			return false;
		}

		//Check if all required properties are available
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
	 * @returns {sap.ui.model.odata.v2.ODataTreeBinding} The binding instance
	 * @public
	 */
	ODataTreeBinding.prototype.initialize = function() {
		if (this.oModel.oMetadata && this.oModel.oMetadata.isLoaded() && this.bInitial) {

			// relative bindings will be properly initialized once the context is set
			var bIsRelative = this.isRelative();
			if (!bIsRelative || (bIsRelative && this.oContext)) {
				this._initialize();
			}

			this._fireRefresh({reason: ChangeReason.Refresh});
		}
		return this;
	};

	/**
	 * Private initialize.
	 * Triggers metadata checks for annotations and applys adapters if necessary.
	 * @private
	 */
	ODataTreeBinding.prototype._initialize = function () {
		this.bInitial = false;
		this.bHasTreeAnnotations = this._hasTreeAnnotations();
		this.oEntityType = this._getEntityType();

		// build up the $select, based on the given select-properties and the known/necessary annotated properties
		this._processSelectParameters();

		this._applyAdapter();

		return this;
	};

	/**
	 * Sets the binding context.
	 * @param oContext
	 * @private
	 */
	ODataTreeBinding.prototype.setContext = function(oContext) {
		if (Context.hasChanged(this.oContext, oContext)) {
			this.oContext = oContext;

			// If binding is not a relative binding, nothing to do here
			if (!this.isRelative()) {
				return;
			}

			// resolving the path makes sure that we can safely analyze the metadata
			var sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);

			if (sResolvedPath) {
				this.resetData();
				this._initialize(); // triggers metadata/annotation check
				this._fireChange({ reason: ChangeReason.Context });
			} else {
				// path could not be resolved, but some data was already available, so we fire a context-change
				if (!isEmptyObject(this.oAllKeys) || !isEmptyObject(this.oKeys) || !isEmptyObject(this._aNodes)) {
					this.resetData();
					this._fireChange({ reason: ChangeReason.Context });
				}
			}
		}
	};

	/**
	 * Initially only apply the Adapter interface.
	 * The real adapter will be applied after the initialize.
	 * @private
	 */
	ODataTreeBinding.prototype.applyAdapterInterface = function () {
		/**
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
		/**
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
	 * Applies a TreeBindingAdapter, depending on the metadata.
	 * Either a hierarchical paging adapter (nav-props & annotations) or a
	 * flat paging adapter (magnitude) is applied.
	 * @private
	 */
	ODataTreeBinding.prototype._applyAdapter = function () {
		var sMagnitudeAnnotation = "hierarchy-node-descendant-count-for";
		var sSiblingRankAnnotation = "hierarchy-sibling-rank-for";
		var sPreorderRankAnnotation = "hierarchy-preorder-rank-for";

		if (this.bHasTreeAnnotations) {

			var sAbsolutePath = this.oModel.resolve(this.getPath(), this.getContext());
			// remove url parameters if any to get correct path for entity type resolving
			if (sAbsolutePath.indexOf("?") !== -1) {
				sAbsolutePath = sAbsolutePath.split("?")[0];
			}
			var oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sAbsolutePath);
			var that = this;

			//Check if all required properties are available
			jQuery.each(oEntityType.property, function(iIndex, oProperty) {
				if (!oProperty.extensions) {
					return true;
				}
				jQuery.each(oProperty.extensions, function(iIndex, oExtension) {
					var sName = oExtension.name;
					if (oExtension.namespace === that.oModel.oMetadata.mNamespaces["sap"] &&
							(sName == sMagnitudeAnnotation || sName == sSiblingRankAnnotation || sName == sPreorderRankAnnotation)) {
						that.oTreeProperties[sName] = oProperty.name;
					}
				});
			});

			//perform magnitude annotation check
			this.oTreeProperties[sMagnitudeAnnotation] = this.oTreeProperties[sMagnitudeAnnotation] ||
				(this.mParameters.treeAnnotationProperties && this.mParameters.treeAnnotationProperties.hierarchyNodeDescendantCountFor);

			// apply the flat auto-expand mixin if the necessary annotations were found (in Server-Mode)
			// exception: the binding runs in operation-mode "Client"
			// In this case there is no need for the advanced auto expand, since everything is loaded anyway.
			if (this.oTreeProperties[sMagnitudeAnnotation] && this.sOperationMode == OperationMode.Server) {
				var i, j, sKeyProperty;
				// Add Flat-specific tree properties
				this.oTreeProperties[sSiblingRankAnnotation] = this.oTreeProperties[sSiblingRankAnnotation] ||
					(this.mParameters.treeAnnotationProperties && this.mParameters.treeAnnotationProperties.hierarchySiblingRankFor);
				this.oTreeProperties[sPreorderRankAnnotation] = this.oTreeProperties[sPreorderRankAnnotation] ||
					(this.mParameters.treeAnnotationProperties && this.mParameters.treeAnnotationProperties.hierarchyPreorderRankFor);

				if (this.mParameters.restoreTreeStateAfterChange) {
					if (this.oTreeProperties[sSiblingRankAnnotation] && this.oTreeProperties[sPreorderRankAnnotation]) {
						this._bRestoreTreeStateAfterChange = true;
						// Collect entity type key properties
						this._aTreeKeyProperties = [];
						for (i = oEntityType.key.propertyRef.length - 1; i >= 0; i--) {
							this._aTreeKeyProperties.push(oEntityType.key.propertyRef[i].name);
						}
					} else {
						Log.warning("Tree state restoration not possible: Missing annotation \"hierarchy-sibling-rank-for\" and/or \"hierarchy-preorder-rank-for\"");
						this._bRestoreTreeStateAfterChange = false;
					}
				} else {
					this._bRestoreTreeStateAfterChange = false;
				}


				// make sure the magnitude is added to the $select if it was not added by the application anyway
				if (this.mParameters && this.mParameters.select) {
					if (this.mParameters.select.indexOf(this.oTreeProperties[sMagnitudeAnnotation]) === -1) {
						this.mParameters.select += "," + this.oTreeProperties[sMagnitudeAnnotation];
					}
					if (this._bRestoreTreeStateAfterChange) {
						// Retrieve all key properties to allow filtering on them during tree state restoration (PreorderPosition requests)
						for (j = this._aTreeKeyProperties.length - 1; j >= 0; j--) {
							sKeyProperty = this._aTreeKeyProperties[j];
							if (this.mParameters.select.indexOf(sKeyProperty) === -1) {
								this.mParameters.select += "," + sKeyProperty;
							}
						}
					}
					this.sCustomParams = this.oModel.createCustomParams(this.mParameters);
				}
				// apply flat paging adapter
				var ODataTreeBindingFlat = sap.ui.requireSync("sap/ui/model/odata/ODataTreeBindingFlat");
				ODataTreeBindingFlat.apply(this);
			} else {
				// apply hierarchical paging adapter
				var ODataTreeBindingAdapter = sap.ui.requireSync("sap/ui/model/odata/ODataTreeBindingAdapter");
				ODataTreeBindingAdapter.apply(this);
			}
		} else if (this.oNavigationPaths) {
			// apply hierarchical paging adapter
			var ODataTreeBindingAdapter = sap.ui.requireSync("sap/ui/model/odata/ODataTreeBindingAdapter");
			ODataTreeBindingAdapter.apply(this);
		} else {
			Log.error("Neither hierarchy annotations, nor navigation properties are specified to build the tree.", this);
		}
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
						if (aNewSelectParams.indexOf(sParamName) == -1) {
							aNewSelectParams.push(sParamName);
						}
					});
				}

				// add new select params to custom select params
				jQuery.each(aNewSelectParams, function(sParamKey, sParamName){
					if (aSelectParams.indexOf(sParamName) == -1) {
						aSelectParams.push(sParamName);
					}
				});
				// add hierarchy annotation properties to select params if not there already
				if (this.bHasTreeAnnotations) {
					jQuery.each(this.oTreeProperties, function(sAnnotationName, sTreePropName){
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
	 * @ui5-restricted sap.ui.comp
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
	 * This is only possible (and necessary) for OData services implementing the hierarchy annotation specification,
	 * or when providing the annotation information locally as a binding parameter. See the constructor for API documentation on this.
	 * @param {int} iRootLevel
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
	 * @returns {int}
	 *
	 * @public
	 */
	ODataTreeBinding.prototype.getRootLevel = function() {
		return parseInt(this.iRootLevel);
	};

	/**
	 * Retrieves the EntityType of the bindings path, resolved with the current context.
	 * @private
	 */
	ODataTreeBinding.prototype._getEntityType = function(){
		var sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);

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
	* Abort all pending requests
	*/
	ODataTreeBinding.prototype._abortPendingRequest = function() {
		// abort running request and clear the map afterwards
		jQuery.each(this.mRequestHandles, function (sRequestKey, oRequestHandle) {
			if (oRequestHandle) {
				oRequestHandle.abort();
			}
		});
		this.mRequestHandles = {};
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
	 * This feature is only available when the underlying OData service exposes the "hierarchy-descendant-count-for" annotation.
	 * See the constructor documentation for more details.
	 *
	 * @function
	 * @name sap.ui.model.odata.v2.ODataTreeBinding.prototype.addContexts
	 * @param {sap.ui.model.Context} oParentContext Parent context under which the new contexts will be inserted
	 * @param {sap.ui.model.Context|sap.ui.model.Context[]} vContextHandle An array of contexts or a single context, which will be added to the tree.
	 * @private
	 */

	/**
	 * Removes the given context from the tree, including all its descendants.
	 *
	 * Calling <code>removeContext</code> for a given context implicitly removes the complete subtree underneath it.
	 *
	 * This feature is only available when the underlying OData service exposes the "hierarchy-descendant-count-for" annotation.
	 * See the constructor documentation for more details.
	 *
	 * @function
	 * @name sap.ui.model.odata.v2.ODataTreeBinding.prototype.removeContext
	 * @param {sap.ui.model.Context} Context which should be removed
	 * @return {sap.ui.model.Context} The removed context
	 * @private
	 */

	/**
	 * Creates a new binding context related to this binding instance.
	 *
	 * The available API is the same as for the v2.ODataModel.
	 * See the API documentation here: {@link sap.ui.model.odata.v2.ODataModel#createEntry createEntry}.
	 *
	 * This feature is only available when the underlying OData service exposes the "hierarchy-descendant-count-for" annotation.
	 * See the constructor documentation for more details.
	 *
	 * @function
	 * @name sap.ui.model.odata.v2.ODataTreeBinding.prototype.createEntry
	 * @private
	 */

	/**
	 * Submits all queued hierarchy changes for this binding instance.
	 *
	 * This includes property changes, as well as newly created nodes and deleted nodes.
	 * The available API is the same as for the v2.ODataModel.
	 * See the API documentation here: {@link sap.ui.model.odata.v2.ODataModel#submitChanges submitChanges}.
	 *
	 * This feature is only available when the underlying OData service exposes the "hierarchy-descendant-count-for" annotation.
	 * See the Constructor documentation for more details.
	 *
	 * @function
	 * @name sap.ui.model.odata.v2.ODataTreeBinding.prototype.submitChanges
	 * @private
	 */

	return ODataTreeBinding;

});