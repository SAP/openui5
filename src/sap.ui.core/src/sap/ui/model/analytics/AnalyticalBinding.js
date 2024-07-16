/*!
 * ${copyright}
 */

// Disable some ESLint rules. camelcase (some "_" in names to indicate indexed variables (like in math)),
// valid-jsdoc (not completed yet)
/*eslint camelcase:0, valid-jsdoc:0, max-len:0 */

// Provides class sap.ui.model.odata.ODataListBinding
sap.ui.define([
	"./BatchResponseCollector",
	"./odata4analytics",
	"sap/base/Log",
	"sap/base/util/deepExtend",
	"sap/base/util/each",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject",
	"sap/base/util/uid",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter",
	"sap/ui/model/TreeAutoExpandMode",
	"sap/ui/model/TreeBinding",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/ODataUtils"
], function(BatchResponseCollector, odata4analytics, Log, deepExtend, each, extend, isEmptyObject, uid,
		ChangeReason, Filter, FilterOperator, FilterProcessor, FilterType, Sorter, TreeAutoExpandMode,
		TreeBinding, CountMode, ODataUtils) {
	"use strict";

	var sClassName = "sap.ui.model.analytics.AnalyticalBinding",
		iInstanceCount = 0,
		oLogger = Log.getLogger(sClassName);

	/**
	 * Checks whether the select binding parameter fits to the current analytical info and returns
	 * an array of properties that need to be added to leaf requests. If the select binding
	 * parameter does not fit to the current analytical info a warning is logged and the select
	 * binding parameter is ignored.
	 * Select binding parameter does not fit to the analytical info,
	 * <ul>
	 * <li>if an additional dimension is contained in the select binding parameter
	 * <li>if an associated property (e.g. text property or attribute) of an additional dimension
	 * is contained in the select binding parameter
	 * <li>if an additional measure is contained in the select binding parameter
	 * <li>if an associated property (e.g. text property) of an additional measure is contained in
	 * the select binding parameter
	 * <li>if a dimension or a measure of the current analytical info is not contained in the select
	 * binding parameter, unless the dimension or measure has been added automatically by the
	 * binding, because a property associated to the dimension or measure has been added as a
	 * "visible" or "inResult" column
	 * </ul>
	 *
	 * @param {sap.ui.model.analytics.AnalyticalBinding} oBinding
	 *   The analytical binding instance
	 * @returns {string[]} An array of additional properties that need to be selected or an empty
	 *   array if there are no additional select properties needed
	 */
	function getAdditionalSelects(oBinding) {
		var oColumn, aComputedSelect, sComputedSelect, oDimension, i, j, oMeasure, n, sPropertyName,
			oAnalyticalQueryRequest
				= new odata4analytics.QueryResultRequest(oBinding.oAnalyticalQueryResult),

			aSelect = oBinding.mParameters.select.split(","),
			bError = trimAndCheckForDuplicates(aSelect, oBinding.sPath);

		// prepare oAnalyticalQueryRequest to be able to call getURIQueryOptionValue("$select")
		oAnalyticalQueryRequest.setAggregationLevel(oBinding.aMaxAggregationLevel);
		oAnalyticalQueryRequest.setMeasures(oBinding.aMeasureName);

		// update dimension's key, text and attributes as done in relevant _prepare... functions
		Object.keys(oBinding.oDimensionDetailsSet).forEach(function (sDimensionKey) {
			oDimension = oBinding.oDimensionDetailsSet[sDimensionKey];

			oAnalyticalQueryRequest.includeDimensionKeyTextAttributes(sDimensionKey,
				true, oDimension.textPropertyName !== undefined, oDimension.aAttributeName);
		});

		// update measure's raw value, formatted value and unit property as done in relevant
		// _prepare... functions
		Object.keys(oBinding.oMeasureDetailsSet).forEach(function (sMeasureKey) {
			oMeasure = oBinding.oMeasureDetailsSet[sMeasureKey];

			oAnalyticalQueryRequest.includeMeasureRawFormattedValueUnit(sMeasureKey,
				oMeasure.rawValuePropertyName !== undefined,
				oMeasure.formattedValuePropertyName !== undefined,
				oMeasure.unitPropertyName !== undefined);
		});

		// at least all selected properties, computed by the binding, are contained in select
		// binding parameter
		sComputedSelect = oAnalyticalQueryRequest.getURIQueryOptionValue("$select");
		if (sComputedSelect) {
			aComputedSelect = sComputedSelect.split(",");
			for (i = 0, n = aComputedSelect.length; i < n; i++) {
				sPropertyName = aComputedSelect[i];
				j = aSelect.indexOf(sPropertyName);
				if (j < 0) {
					oColumn = oBinding.mAnalyticalInfoByProperty[sPropertyName];
					if (!oColumn || (!oColumn.visible && !oColumn.inResult)) {
						continue; // ignore automatically added columns
					}
					oLogger.warning("Ignored the 'select' binding parameter, because"
							+ " it does not contain the property '" + sPropertyName + "'",
						oBinding.sPath);
					bError = true;
				} else {
					aSelect.splice(j, 1);
				}
			}
		}

		const aAdditionalSelects = [];
		// check additionally selected properties, no new dimensions and new measures or
		// associated properties for new dimensions or measures are allowed
		for (i = 0; i < aSelect.length; i += 1) {
			sPropertyName = aSelect[i];

			oDimension = oBinding.oAnalyticalQueryResult.findDimensionByPropertyName(sPropertyName);
			if (oDimension) {
				const oDimensionDetails = oBinding.oDimensionDetailsSet[oDimension.getName()];
				if (oDimensionDetails === undefined) {
					logUnsupportedPropertyInSelect(oBinding.sPath, sPropertyName, oDimension);
					bError = true;
				} else {
					// eslint-disable-next-line no-use-before-define
					AnalyticalBinding._updateDimensionDetailsTextProperty(oDimension, sPropertyName, oDimensionDetails);
					continue;
				}
			}

			oMeasure = oBinding.oAnalyticalQueryResult.findMeasureByPropertyName(sPropertyName);
			if (oMeasure && oBinding.oMeasureDetailsSet[oMeasure.getName()] === undefined) {
				logUnsupportedPropertyInSelect(oBinding.sPath, sPropertyName, oMeasure);
				bError = true;
			}
			aAdditionalSelects.push(sPropertyName);
		}
		return bError ? [] : aAdditionalSelects;
	}

	/**
	 * Logs a warning that the given select property is not supported. Either it is a dimension or
	 * a measure or it is associated with a dimension or a measure which is not part of the
	 * analytical info.
	 *
	 * @param {string} sPath The binding path
	 * @param {string} sSelectedProperty The name of the selected property
	 * @param {sap.ui.model.analytics.odata4analytics.Dimension
	 *         |sap.ui.model.analytics.odata4analytics.Measure} oDimensionOrMeasure
	 *   The dimension or measure that causes the issue
	 */
	function logUnsupportedPropertyInSelect(sPath, sSelectedProperty, oDimensionOrMeasure) {
		var sDimensionOrMeasure = oDimensionOrMeasure
				instanceof odata4analytics.Dimension
					? "dimension" : "measure";

		if (oDimensionOrMeasure.getName() === sSelectedProperty) {
			oLogger.warning("Ignored the 'select' binding parameter, because it contains"
					+ " the " + sDimensionOrMeasure + " property '"
					+ sSelectedProperty
					+ "' which is not contained in the analytical info (see updateAnalyticalInfo)",
				sPath);

		} else {
			oLogger.warning("Ignored the 'select' binding parameter, because the property '"
					+ sSelectedProperty + "' is associated with the "
					+ sDimensionOrMeasure + " property '"
					+ oDimensionOrMeasure.getName() + "' which is not contained in the analytical"
					+ " info (see updateAnalyticalInfo)",
				sPath);
		}
	}

	/**
	 * Iterate over the given array, trim each value and check whether there are duplicate entries
	 * in the array. If there are duplicate entries a warning is logged and the duplicate is removed
	 * from the array.
	 *
	 * @param {string[]} aSelect An array of strings
	 * @param {string} sPath The binding path
	 * @returns {boolean} <code>true</code> if there is at least one duplicate entry in the array.
	 */
	function trimAndCheckForDuplicates(aSelect, sPath) {
		var sCurrentProperty,
			bError = false,
			i,
			n;

		// replace all white-spaces before and after the value
		for (i = 0, n = aSelect.length; i < n; i++) {
			aSelect[i] = aSelect[i].trim();
		}
		// check for duplicate entries and remove from list
		for (i = aSelect.length - 1; i >= 0; i--) {
			sCurrentProperty = aSelect[i];
			if (aSelect.indexOf(sCurrentProperty) !== i) {
				// found duplicate
				oLogger.warning("Ignored the 'select' binding parameter, because it"
						+ " contains the property '" + sCurrentProperty + "' multiple times",
					sPath);
				aSelect.splice(i, 1);
				bError = true;
			}
		}
		return bError;
	}

	/**
	 * @class
	 * Tree binding implementation for OData entity sets with aggregate semantics.
	 *
	 * Note on the handling of different count modes: The AnalyticalBinding always uses the OData
	 * $inlinecount system query option to determine the total count of matching entities. It
	 * ignores the default count mode set in the ODataModel instance and the count mode specified in
	 * the binding parameters. If the default count mode is <code>None</code>, a warning is added to
	 * the log to remind the application that OData requests generated by the AnalyticalBinding will
	 * include a $inlinecount. If a count mode has been specified in the binding parameters, an
	 * error message is logged if it is <code>None</code>, because the binding still adds the
	 * $inlinecount to OData requests. If a binding count mode is set to <code>Request</code> or
	 * <code>Both</code>, a warning is logged to remind the application that the OData requests
	 * generated by the AnalyticalBinding include a $inlinecount.
	 *
	 * @param {sap.ui.model.Model} oModel
	 *   The OData model
	 * @param {string} sPath
	 *   The path pointing to the tree / array that should be bound
	 * @param {object} [oContext=null]
	 *   The context object for this data binding
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [aSorters=[]]
	 *   The sorters used initially; call {@link #sort} to replace them
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [aFilters=[]]
	 *   The filters to be used initially with type {@link sap.ui.model.FilterType.Application}; call {@link #filter} to
	 *   replace them
	 * @param {object} [mParameters=null]
	 *   A map containing additional binding parameters; for the <code>AnalyticalBinding</code> this
	 *   parameter is mandatory
	 * @param {sap.ui.model.TreeAutoExpandMode} [mParameters.autoExpandMode=sap.ui.model.TreeAutoExpandMode.Bundled]
	 *   The auto expand mode; applying sorters to groups is only possible in auto expand mode
	 *   {@link sap.ui.model.TreeAutoExpandMode.Sequential}
	 * @param [mParameters.entitySet]
	 *   The entity set addressed by the last segment of the given binding path
	 * @param [mParameters.useBatchRequests=false]
	 *   Whether multiple OData requests are wrapped into a single $batch request wherever possible
	 * @param [mParameters.provideGrandTotals=true]
	 *   Whether grand total values are provided for all bound measure properties
	 * @param [mParameters.provideTotalResultSize=true]
	 *   Whether the total number of matching entries in the bound OData entity set is provided
	 * @param [mParameters.reloadSingleUnitMeasures=true]
	 *   Whether the binding checks aggregated entries with multi-unit occurrences, if some measure
	 *   properties have a unique unit and will trigger separate OData requests to fetch them
	 * @param {string} [mParameters.select]
	 *   A comma-separated list of property names that need to be selected.<br/>
	 *   If the <code>select</code> parameter is given, it has to contain all properties that are
	 *   contained in the analytical information (see
	 *   {@link sap.ui.model.analytics.AnalyticalBinding#updateAnalyticalInfo}). It must not contain
	 *   additional dimensions or measures or associated properties for additional dimensions or
	 *   measures. But it may contain additional properties like a text property of a dimension that
	 *   is also selected.<br/>
	 *   All properties of the <code>select</code> parameter are also considered in
	 *   {@link sap.ui.model.analytics.AnalyticalBinding#getDownloadUrl}.<br/>
	 *   The <code>select</code> parameter must not contain any duplicate entry.<br/>
	 *   If the <code>select</code> parameter does not fit to the analytical information or if the
	 *   <code>select</code> parameter contains duplicates, a warning is logged and the
	 *   <code>select</code> parameter is ignored.
	 *
	 * @throws {Error}
	 *   If no analytic query result object could be determined from the bound OData entity set, either from an
	 *   explicitly given EntitySet (via optional mParameters.entitySet argument), or by default implicitly from the
	 *   binding path (see mandatory sPath argument), or if the {@link sap.ui.model.Filter.NONE} filter instance is
	 *   contained in <code>aFilters</code> together with other filters, or if the given model is not supported.
	 *
	 * @alias sap.ui.model.analytics.AnalyticalBinding
	 * @extends sap.ui.model.TreeBinding
	 * @deprecated As of version 2.0, will be replaced by OData V4 data aggregation, see
	 *   {@link topic:7d914317c0b64c23824bf932cc8a4ae1 Extension for Data Aggregation}
	 * @protected
	 */
	var AnalyticalBinding = TreeBinding.extend("sap.ui.model.analytics.AnalyticalBinding", /** @lends sap.ui.model.analytics.AnalyticalBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, aSorter, aFilters, mParameters) {
			TreeBinding.call(this, oModel, sPath, oContext, aFilters, mParameters);

			this.iModelVersion = AnalyticalBinding._getModelVersion(this.oModel);
			if (this.iModelVersion === null) {
				throw new Error("The AnalyticalBinding does not support the given model");
			}
			this.aAdditionalSelects = [];
			// attribute members for addressing the requested entity set
			this.sEntitySetName = mParameters.entitySet ? mParameters.entitySet : undefined;
			// attribute members for maintaining aggregated OData requests
			this.bArtificalRootContext = false;
			// Note: aApplicationFilter is used by sap.ui.comp.smarttable.SmartTable
			this.aApplicationFilter = aFilters;
			this.aControlFilter = undefined;
			this.aSorter = aSorter ? aSorter : [];
			if (!Array.isArray(this.aSorter)) {
				this.aSorter = [this.aSorter];
			}
			this.aMaxAggregationLevel = [];
			this.aAggregationLevel = [];
			this.oPendingRequests = {};
			this.oPendingRequestHandle = [];
			this.oGroupedRequests = {};
			this.bUseBatchRequests = mParameters.useBatchRequests === true;
			this.bProvideTotalSize = mParameters.provideTotalResultSize !== false;
			this.bProvideGrandTotals = mParameters.provideGrandTotals !== false;
			this.bReloadSingleUnitMeasures = mParameters.reloadSingleUnitMeasures !== false;
			this.bUseAcceleratedAutoExpand = mParameters.useAcceleratedAutoExpand !== false;
			this.bNoPaging = mParameters.noPaging === true;

			iInstanceCount += 1;
			this._iId = iInstanceCount;
			// attribute members for maintaining loaded data; mapping from groupId to related information
			this.iTotalSize = -1;
				/* data loaded from OData service */
			this.mServiceKey = {}; // keys of loaded entities belonging to group with given ID
			this.mServiceLength = {}; // number of currently loaded entities
			this.mServiceFinalLength = {}; // true iff all entities of group with given ID have been loaded (keys in mServiceKey)
				/* consolidated view on loaded data */
			this.mKeyIndex = {}; // consumer view: group entries are index positions in mServiceKey
			this.mFinalLength = this.mServiceFinalLength; // true iff all entities of group with given ID have been loaded (keys in mKey)
			this.mLength = {}; // number of currently loaded entities
				/* locally created multi-currency entities */
			this.mMultiUnitKey = {}; // keys of multi-currency entities
			this.aMultiUnitLoadFactor = {}; // compensate discarded multi-unit entities by a load factor per aggregation level to increase number of loaded entities
			this.bNeedsUpdate = false;
			// use this.aSorter to sort the groups (only for non multi-unit cases)
			this.bApplySortersToGroups = true;
			// Content of this._autoExpandMode during last call of _canApplySortersToGroups;
			// used for logging a warning if auto expand mode is bundled
			this.sLastAutoExpandMode = undefined;
			/* entity keys of loaded group Id's */
			this.mEntityKey = {};
			/* increased load factor due to ratio of non-multi-unit entities versus loaded entities */

			// custom parameters which will be send with every request
			// the custom parameters are extracted from the mParameters object, because the SmartTable does some weird things to the parameters
			this.sCustomParams = this.oModel.createCustomParams({custom: this.mParameters.custom});

			// attribute members for maintaining structure details requested by the binding consumer
			this.oAnalyticalQueryResult = null; //will be initialized via the "initialize" function of the binding

			this.aAnalyticalInfo = [];
			this.mAnalyticalInfoByProperty = {};

			// maintaining request to be bundled in a single $batch request
			this.aBatchRequestQueue = [];

			// considering different count mode settings
			if (mParameters.countMode == CountMode.None) {
				oLogger.fatal("requested count mode is ignored; OData requests will include"
					+ " $inlinecount options");
			} else if (mParameters.countMode == CountMode.Request) {
				oLogger.warning("default count mode is ignored; OData requests will include"
					+ " $inlinecount options");
			} else if (this.oModel.sDefaultCountMode == CountMode.Request) {
				oLogger.warning("default count mode is ignored; OData requests will include"
					+ " $inlinecount options");
			}

			// list of sorted dimension names as basis for later calculations, initialized via "initialize" function
			this.aAllDimensionSortedByName = null;

			//Some setup steps have to be deferred, until the metadata was loaded by the model:
			// - updateAnalyticalInfo, the parameters given in the constructor are kept though
			// - fetch the oAnalyticalQueryResult
			this.aInitialAnalyticalInfo = mParameters.analyticalInfo;

			//this flag indicates if the analytical binding was initialized via initialize(), called either via bindAggregation or the Model
			this.bInitial = true;
		}

	});


	// Creates Information for SupportTool (see e.g. library.support.js of sap.ui.table library)
	function createSupportInfo(oAnalyticalBinding, sErrorId) {
		return function() {
			if (!oAnalyticalBinding.__supportUID) {
				oAnalyticalBinding.__supportUID = uid();
			}
			return {
				type: sClassName,
				analyticalError: sErrorId,
				analyticalBindingId: oAnalyticalBinding.__supportUID
			};
		};
	}


	/**
	 * Setter for context
	 * @param {Object} oContext the new context object
	 */
	AnalyticalBinding.prototype.setContext = function (oContext) {
		var sResolvedPath;

		if (this.oContext !== oContext) {
			this.oContext = oContext;

			if (!this.isRelative()) {
				// If binding is not a relative binding, nothing to do here
				return;
			}

			this.oDataState = null;
			this.bApplySortersToGroups = true;
			this.iTotalSize = -1; // invalidate last row counter
			this._abortAllPendingRequests();
			// resolving the path makes sure that we can safely analyze the metadata,
			// as we have a resourcepath for the QueryResult
			sResolvedPath = this.getResolvedPath();
			if (sResolvedPath) {
				this.resetData();
				this._initialize(); // triggers metadata/annotation check
				this._fireChange({ reason: ChangeReason.Context });
			} else {
				this.bInitial = true;
			}
		}
	};

	/**
	 * Initialize binding. Fires a change if data is already available ($expand) or a refresh.
	 * If metadata is not yet available, do nothing, method will be called again when
	 * metadata is loaded.
	 *
	 * The ODataModel will call this on all bindings as soon as the metadata was loaded
	 *
	 * @public
	 * @name sap.ui.model.analytics.v2.AnalyticalBinding#initialize
	 * @function
	 */
	AnalyticalBinding.prototype.initialize = function() {
		if (this.oModel.oMetadata && this.oModel.oMetadata.isLoaded() && this.isInitial()) {

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
	 * Performs the actual initialization.
	 * Called either by sap.ui.model.analytics.v2.AnalyticalBinding#initialize or
	 * sap.ui.model.analytics.v2.AnalyticalBinding#setContext.
	 */
	AnalyticalBinding.prototype._initialize = function() {
		if (this.oModel.oMetadata && this.oModel.oMetadata.isLoaded()) {
			this.bInitial = false;
			//first fetch the analyticalQueryResult object from the adapted Model (see ODataModelAdapter.js)
			this.oAnalyticalQueryResult = this.oModel.getAnalyticalExtensions().findQueryResultByName(this._getEntitySet());

			// Sanity check: If the AnalyticalQueryResult could not be retrieved, the AnalyticalBinding will not work correctly,
			// and it will sooner or later break when accessing the AnalyticalQueryResult object.
			if (!this.oAnalyticalQueryResult) {
				throw ("Error in AnalyticalBinding - The QueryResult '" + this._getEntitySet() + "' could not be retrieved. Please check your service definition.");
			}

			//afterwards update the analyticalInfo with the initial parameters given in the constructor
			this.updateAnalyticalInfo(this.aInitialAnalyticalInfo);
			//initialize the list of sorted dimension names
			this.aAllDimensionSortedByName = this.oAnalyticalQueryResult.getAllDimensionNames().concat([]).sort();

			this._fireRefresh({reason: ChangeReason.Refresh});
		}
	};

	/* *******************************
	 *** API - Public methods
	 ********************************/

	/**
	 * Gets the context for the root aggregation level representing the grand total for all bound measure properties.
	 *
	 * The context is assigned to parent group ID <code>null</code>. If the binding is configured not to provide a grand total,
	 * this context is empty. If data for this context is not locally available yet, an OData request will be triggered to load it.
	 *
	 * This function must be called whenever the bound set of OData entities changes, e.g., by changing selected dimensions,
	 * modifying filter conditions, etc.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getRootContexts
	 * @param {object|int} mParameters
	 *   Parameter map specifying how the topmost aggregation level shall be fetched. If this
	 *   parameter map is set, the optional function parameters are ignored. Optionally, instead
	 *   of a parameter map an integer value can be set to define the parameter
	 *   <code>startIndex</code> as described in this parameter list. In this case, the function
	 *   parameters <code>iLength</code>, <code>iNumberOfExpandedLevels</code> and
	 *   <code>iThreshold</code> become mandatory.
	 * @param {int} mParameters.length
	 *   Number of entries to return at and after the given start index; defaults to the model's
	 *   size limit, see {@link sap.ui.model.Model#setSizeLimit}
	 * @param {int} mParameters.numberOfExpandedLevels
	 *   Number of child levels that shall be fetched automatically
	 * @param {int} mParameters.startIndex
	 *   Index of first entry to return from parent group ID <code>"/"</code> (zero-based)
	 * @param {int} mParameters.threshold
	 *   Number of additional entries that shall be locally available in the binding for subsequent
	 *   accesses to contexts of parent group ID <code>"/"</code> or below, if auto-expanding is
	 *   selected
	 * @param {int} [iLength]
	 *   See documentation of the <code>length</code> parameter in the parameter list of
	 *   <code>mParameters</code>
	 * @param {int} [iNumberOfExpandedLevels=0]
	 *   See documentation of the <code>numberOfExpandedLevels</code> parameter in the parameter
	 *   list of <code>mParameters</code>
	 * @param {int} [iThreshold=0]
	 *   See documentation of the <code>threshold</code> parameter in the parameter list of
	 *   <code>mParameters</code>
	 * @return {sap.ui.model.Context[]}
	 *   Array with a single object of class sap.ui.model.Context for the root context, or an empty
	 *   array if an OData request is pending to fetch requested contexts that are not yet locally
	 *   available.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.getRootContexts = function(mParameters, iLength,
			iNumberOfExpandedLevels, iThreshold) {
		if (typeof mParameters !== "object") {
			mParameters = {
				length : iLength,
				numberOfExpandedLevels : iNumberOfExpandedLevels,
				startIndex : mParameters,
				threshold : iThreshold
			};
		}

		if (this.isInitial()) {
			return [];
		}

		var iAutoExpandGroupsToLevel = (mParameters && mParameters.numberOfExpandedLevels ? mParameters.numberOfExpandedLevels + 1 : 1);
		var aRootContext = null;

		var sRootContextGroupMembersRequestId = this._getRequestId(AnalyticalBinding._requestType.groupMembersQuery, {groupId: null});

		// if the root context is artificial (i.e. no grand total requested), then delay its return until all other related requests have been completed
		if (this.bArtificalRootContext
				&& !this._cleanupGroupingForCompletedRequest(sRootContextGroupMembersRequestId)) {
			return aRootContext;
		}
		aRootContext = this._getContextsForParentContext(null);
		if (aRootContext.length == 1) {
			return aRootContext;
		}

		if (iAutoExpandGroupsToLevel <= 1) {
			if (iAutoExpandGroupsToLevel == 1) {
				this._considerRequestGrouping([ sRootContextGroupMembersRequestId,
												this._getRequestId(AnalyticalBinding._requestType.groupMembersQuery, {groupId: "/"}) ]);
				this.getNodeContexts(this.getModel().getContext("/"), {
					startIndex : mParameters.startIndex,
					length : mParameters.length,
					threshold : mParameters.threshold,
					level : 0,
					numberOfExpandedLevels : 0
				});
			}
		} else {
			var aRequestId = this._prepareGroupMembersAutoExpansionRequestIds("/", mParameters.numberOfExpandedLevels);
			aRequestId.push(sRootContextGroupMembersRequestId);
			this._considerRequestGrouping(aRequestId);
			this.getNodeContexts(this.getModel().getContext("/"), {
				startIndex : mParameters.startIndex,
				length : mParameters.length,
				threshold : mParameters.threshold,
				level : 0,
				numberOfExpandedLevels : mParameters.numberOfExpandedLevels
			});
		}
		if (aRootContext.length > 1) {
			oLogger.fatal("assertion failed: grand total represented by a single entry");
		}
		return aRootContext;
	};

	/**
	 * Gets child contexts for a specified parent context.
	 *
	 * Contexts are returned in a stable order imposed by the
	 * dimension property that defines this aggregation level beneath the parent context: Either a sort order has been specified for this property,
	 * or the entries are returned in ascending order of the values of this dimension property by default.
	 *
	 * If any of the requested data is missing, an OData request will be triggered to load it.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getNodeContexts
	 * @param {sap.ui.model.Context} oContext
	 *            Parent context identifying the requested group of child contexts
	 * @param {object|int} mParameters
	 *            Parameters, specifying the aggregation level for which contexts shall be fetched
	 *            or (legacy signature variant) index of first child entry to return from the parent context (zero-based)
	 * @param {int} mParameters.level
	 *            Level number for oContext, because it might occur at multiple levels; context with group ID <code>"/"</code> has level 0
	 * @param {int} [mParameters.numberOfExpandedLevels=0]
	 *            Number of child levels that shall be fetched automatically
	 * @param {int} [mParameters.startIndex=0]
	 *            Index of first child entry to return from the parent context (zero-based)
	 * @param {int} [mParameters.length=<model size limit>]
	 *            Number of entries to return; counting begins at the given start index
	 * @param {int} [mParameters.threshold=0]
	 *            Number of additional entries that shall be locally available in the binding for subsequent
	 *            accesses to child entries of the given parent context
	 * @param {int} [iLength=<model size limit>]
	 *            Same meaning as <code>mParameters.length</code>, legacy signature variant only
	 * @param {int} [iThreshold=0]
	 *            Same meaning as <code>mParameters.threshold</code>, legacy signature variant only
	 * @param {int} [iLevel]
	 *            Same meaning as <code>mParameters.level</code>, legacy signature variant only
	 * @param {int} [iNumberOfExpandedLevels=0]
	 *            Same meaning as <code>mParameters.numberOfExpandedLevels</code>, legacy signature variant only
	 * @returns {sap.ui.model.Context[]}
	 *            Array containing the requested contexts of class sap.ui.model.Context, limited by the number of entries contained
	 *            in the entity set at that aggregation level.
	 *            The array will contain less than the requested number of contexts, if some are not locally available and an OData request is
	 *            pending to fetch them. In this case, if the parameter numberOfExpandedLevels > 0, the array will be completely empty.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.getNodeContexts = function(oContext, mParameters) {

		if (this.isInitial()) {
			return [];
		}

		var iStartIndex, iLength, iThreshold, iLevel, iNumberOfExpandedLevels, bSupressRequest;
		if (typeof mParameters == "object") {
			iStartIndex = mParameters.startIndex;
			iLength = mParameters.length;
			iThreshold = mParameters.threshold;
			iLevel = mParameters.level;
			iNumberOfExpandedLevels = mParameters.numberOfExpandedLevels;
			bSupressRequest = mParameters.supressRequest;
		} else { // due to compatibility; can be removed if table is adapted
			iStartIndex = arguments[1];
			iLength = arguments[2];
			iThreshold = arguments[3];
			iLevel = arguments[4];
			iNumberOfExpandedLevels = arguments[5];
			bSupressRequest = arguments[6];
		}

		var aContext = this._getContextsForParentContext(oContext, iStartIndex, iLength, iThreshold, iLevel, iNumberOfExpandedLevels, bSupressRequest);
		return aContext;
	};

	AnalyticalBinding.prototype.ContextsAvailabilityStatus = { ALL: 2, SOME: 1, NONE: 0 };
	/**
	 * Determines if the binding has the entries of a given aggregation level locally available.
	 *
	 * If so, no further OData request is required to fetch any of them.
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.hasAvailableNodeContexts
	 * @param {sap.ui.model.Context}
	 *            oContext the parent context identifying the aggregation level.
	 * @param {int}
	 *            iLevel the level number of oContext (because the context might occur at multiple levels).
	 * @return {boolean}
	 *            property of sap.ui.model.analytics.AnalyticalBinding.ContextsAvailabilityStatus,
	 * indicating whether all, some, or none of the entries are locally available.
	 * @public
	 */
	AnalyticalBinding.prototype.hasAvailableNodeContexts = function(oContext, iLevel) {
		var sGroupId = this._getGroupIdFromContext(oContext, iLevel);
		if (this._getKeys(sGroupId) != undefined) {
			if (this.mFinalLength[sGroupId] == true) {
				return AnalyticalBinding.prototype.ContextsAvailabilityStatus.ALL;
			} else {
				return AnalyticalBinding.prototype.ContextsAvailabilityStatus.SOME;
			}
		} else {
			return AnalyticalBinding.prototype.ContextsAvailabilityStatus.NONE;
		}
	};

	/**
	 * Gets the total number of contexts contained in a group, if known.
	 *
	 * For a given group, be aware that the group size might vary over time. In principle, this can happen if the
	 * bound set of OData entities includes measure properties with amount or quantity values. The AnalyticalBinding
	 * recognizes situations where the OData service returns multiple entries for a single group entry due to the fact that a
	 * measure property cannot be aggregated properly, because an amount exists in multiple currencies or a quantity exists
	 * in multiple units. In such situations, the AnalyticalBinding substitutes these entries by a single representative, and
	 * the group size gets reduced by the count of duplicate entries. Finally, since the Binding does not always fetch all children of
	 * a group at once, but only a page with a certain range, such size changes might happen after every page access.
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getGroupSize
	 * @param {sap.ui.model.Context}
	 *            oContext the parent context identifying the requested group of child contexts.
	 * @param {int}
	 *            iLevel the level number of oContext (because the context might occur at multiple levels)
	 * @return {int}
	 *            The currently known group size, or -1, if not yet determined
	 * @public
	 */
	AnalyticalBinding.prototype.getGroupSize = function(oContext, iLevel) {
		if (oContext === undefined) {
			return 0; // API robustness
		}
		var sGroupId = this._getGroupIdFromContext(oContext, iLevel);

		return this.mFinalLength[sGroupId] ? this.mLength[sGroupId] : -1;
	};

	/**
	 * Gets the total number of leaves or <code>undefined</code> if this is unknown.
	 *
	 * @return {number|undefined}
	 *   The total number of leaves, or <code>undefined</code> if the number is not yet known or if
	 *   the <code>provideTotalResultSize</code> binding parameter is set to <code>false</code>
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataListBinding#getCount
	 * @since 1.92.0
	 */
	AnalyticalBinding.prototype.getCount = function () {
		return this.iTotalSize >= 0 ? this.iTotalSize : undefined;
	};

	/**
	 * Determines if the contexts in a specified group have further children. If so,
	 * any of these group contexts can be a parent context of a nested sub-group in
	 * a subsequent aggregation level.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.hasChildren
	 * @param {sap.ui.model.Context} oContext
	 *   The parent context identifying the requested group of child contexts
	 * @param {object} [mParameters]
	 *   The only supported parameter is <code>level</code> as the level number of oContext (because
	 *   the context might occur at multiple levels)
	 * @param {int} [mParameters.level=1]
	 *   The aggregation level number
	 * @return {boolean}
	 *   <code>true</code> if any of the contexts in the specified group has further children
	 * @public
	 */
	AnalyticalBinding.prototype.hasChildren = function(oContext, mParameters) {
		mParameters = mParameters || {level : 1};

		if (oContext === undefined) {
			return false; // API robustness
		}
		if (oContext == null) {
			return true;
		}
		var iContextLevel = mParameters.level;
		if (iContextLevel == 0) {
			return true;
		}

		if (this.aAggregationLevel.length < iContextLevel) {
			return false;
		}
		// children exist if it is not the rightmost grouped column or there is at least one further level with an ungrouped groupable column.
		return this.aMaxAggregationLevel.indexOf(this.aAggregationLevel[iContextLevel - 1]) < this.aMaxAggregationLevel.length - 1;
	};

	/**
	 * Determines if any of the properties included in the bound OData entity set is a measure property.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.hasMeasures
	 * @return {boolean}
	 *            true if and only one or more properties are measure properties.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.hasMeasures = function() {
		var bHasMeasures = false;
		for (var p in this.oMeasureDetailsSet) {
			if (this.oMeasureDetailsSet.hasOwnProperty(p)) {
				bHasMeasures = true;
				break;
			}
		}
		return bHasMeasures;
	};

	/**
	 * Gets details about the dimension properties included in the bound OData entity set.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getDimensionDetails
	 * @return {object}
	 *            details for every dimension property addressed by its name. The details object provides these properties: name of the dimension,
	 * keyPropertyName for the name of the property holding the dimension key, textPropertyName for the name of the property holding the
	 * text for the dimension, aAttributeName listing all properties holding dimension attributes, grouped as indicator whether or not this
	 * dimension is currently grouped, and analyticalInfo, which contains the binding information for this dimension passed from the
	 * AnalyticalBinding's consumer via call to function updateAnalyticalInfo.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.getDimensionDetails = function() {
		return this.oDimensionDetailsSet;
	};

	/**
	 * Gets details about the measure properties included in the bound OData entity set.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getMeasureDetails
	 * @return {object}
	 *            details for every measure property addressed by its name. The details object provides these properties: name of the measure,
	 * rawValuePropertyName for the name of the property holding the raw value, unitPropertyName for the name of the property holding the related
	 * value unit or currency, if any, and analyticalInfo, which contains the binding information for this measure passed from the
	 * AnalyticalBinding's consumer via call to function updateAnalyticalInfo.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.getMeasureDetails = function() {
		return this.oMeasureDetailsSet;
	};

	/**
	 * Determines if the binding has been configured to provide a grand total for the selected measure properties.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.providesGrandTotal
	 * @return {boolean}
	 *            true if and only if the binding provides a context for the grand totals of all selected measure properties.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.providesGrandTotal = function() {
		return this.bProvideGrandTotals;
	};

	/**
	 * Gets the metadata of a property with a given name.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getProperty
	 * @param {string}
	 *            sPropertyName The property name.
	 * @return {object}
	 *            OData metadata of this property or null if it does not exist.
	 * @public
	 */
	AnalyticalBinding.prototype.getProperty = function(sPropertyName) {
		if (this.isInitial()) {
			return {};
		}
		return this.oAnalyticalQueryResult.getEntityType().findPropertyByName(sPropertyName);
	};

	/**
	 * Gets the names of the filterable properties in the bound OData entity set.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getFilterablePropertyNames
	 * @returns {array}
	 *             names of properties that can be filtered.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.getFilterablePropertyNames = function() {
		if (this.isInitial()) {
			return [];
		}
		return this.oAnalyticalQueryResult.getEntityType().getFilterablePropertyNames();
	};

	/**
	 * Gets the names of the sortable properties in the bound OData entity set.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getSortablePropertyNames
	 * @returns {array}
	 *             names of properties that can be used for sorting the result entities.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.getSortablePropertyNames = function() {
		if (this.isInitial()) {
			return [];
		}
		return this.oAnalyticalQueryResult.getEntityType().getSortablePropertyNames();
	};

	/**
	 * Gets the label of a property with a given name.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getPropertyLabel
	 * @param {string}
	 *            sPropertyName The property name.
	 * @returns {string}
	 *            The label maintained for this property or null if it does not exist.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.getPropertyLabel = function(sPropertyName) {
		if (this.isInitial()) {
			return "";
		}
		return this.oAnalyticalQueryResult.getEntityType().getLabelOfProperty(sPropertyName);
	};

	/**
	 * Gets the label of a property with a given name.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getPropertyHeading
	 * @param {string}
	 *            sPropertyName The property name.
	 * @returns {string}
	 *            The heading maintained for this property or null if it does not exist.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.getPropertyHeading = function(sPropertyName) {
		if (this.isInitial()) {
			return "";
		}
		return this.oAnalyticalQueryResult.getEntityType().getHeadingOfProperty(sPropertyName);
	};

	/**
	 * Gets the quick info of a property with a given name.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getPropertyQuickInfo
	 * @param {string}
	 *            sPropertyName The property name.
	 * @returns {string}
	 *            The quick info maintained for this property or null if it does not exist.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.getPropertyQuickInfo = function(sPropertyName) {
		if (this.isInitial()) {
			return "";
		}
		return this.oAnalyticalQueryResult.getEntityType().getQuickInfoOfProperty(sPropertyName);
	};

	/**
	 * Determines if a given name refers to a measure property
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.isMeasure
	 * @param {string}
	 *            sPropertyName The property name.
	 * @return {boolean}
	 *            true if and only if the bound OData entity set includes a measure property with this name.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.isMeasure = function(sPropertyName) {
		return this.aMeasureName && this.aMeasureName.indexOf(sPropertyName) !== -1;
	};

	/**
	 * Sets filters for matching only a subset of the entities in the bound OData entity set.
	 *
	 * Invoking this function resets the state of the binding. Subsequent data requests such as calls to getNodeContexts() will
	 * need to trigger OData requests in order to fetch the data that are in line with these filters.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.filter
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [aFilters=[]]
	 *   The filters to use; in case of type {@link sap.ui.model.FilterType.Application} this replaces the filters
	 *   given in {@link sap.ui.model.odata.v2.ODataModel#bindList}; a falsy value is treated as an empty array and thus
	 *   removes all filters of the specified type
	 * @param {sap.ui.model.FilterType}
	 *            [sFilterType=sap.ui.model.FilterType.Control] Type of the filter which should be adjusted.
	 * @return {this}
	 *            returns <code>this</code> to facilitate method chaining
	 *
 	 * @public
	 */
	AnalyticalBinding.prototype.filter = function(aFilter, sFilterType) {
		//ensure at least an empty array, so the later validation of odata4analytics.js does not fail
		if (!aFilter) {
			aFilter = [];
		}
		// wrap filter argument in an array if it's a single instance
		if (aFilter instanceof Filter) {
			aFilter = [aFilter];
		}

		if (sFilterType == FilterType.Application) {
			this.aApplicationFilter = aFilter;
		} else {
			this.aControlFilter = aFilter;
		}

		this.iTotalSize = -1; // invalidate last row counter

		this._abortAllPendingRequests();

		this.resetData();
		// resets the flag to sort groups by this.aSorter; a new filter might resolve a multi-unit
		// case; do it before refresh event is fired
		this.bApplySortersToGroups = true;
		this._fireRefresh({
			reason : ChangeReason.Filter
		});

		return this;
	};

	/**
	 * Returns the filter information as an abstract syntax tree.
	 * Consumers must not rely on the origin information to be available, future filter
	 * implementations will not provide this information.
	 *
	 * @param {boolean} [bIncludeOrigin=false] whether to include information about the filter
	 *   objects from which the tree has been created
	 * @returns {object} The AST of the filter tree or null if no filters are set
	 * @private
	 * @ui5-restricted sap.ui.table, sap.ui.export
	 */
	//@override
	AnalyticalBinding.prototype.getFilterInfo = function(bIncludeOrigin) {
		var oCombinedFilter = FilterProcessor.combineFilters(this.aControlFilter,
				this.aApplicationFilter);

		if (oCombinedFilter) {
			return oCombinedFilter.getAST(bIncludeOrigin);
		}

		return null;
	};

	/**
	 * Sets sorters for retrieving the entities in the bound OData entity set in a specific order.
	 *
	 * Invoking this function resets the state of the binding. Subsequent data requests such as calls to getNodeContexts() will
	 * need to trigger OData requests in order to fetch the data that are in line with these sorters.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.sort
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [aSorter=[]]
	 *   The sorters to use; they replace the sorters given in {@link sap.ui.model.odata.v2.ODataModel#bindList}; a
	 *   falsy value is treated as an empty array and thus removes all sorters
	 * @return {this}
	 *            returns <code>this</code> to facilitate method chaining.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.sort = function(aSorter) {

		if (aSorter instanceof Sorter) {
			aSorter = [ aSorter ];
		}

		this.aSorter = aSorter ? aSorter : [];

		this._abortAllPendingRequests();
		this.resetData(undefined, {reason: ChangeReason.Sort});
		this._fireRefresh({
			reason : ChangeReason.Sort
		});

		return this;
	};

	/**
	 * Gets a printable name for a group.
	 *
	 * The printable name follows the pattern is <code>&lt;label&gt;:&lt;key-value&gt;[-&lt;text-value&gt;]</code>,
	 * where <code>label</code> is the label of the dimension property used at the aggregation level for the group,
	 * <code>key-value</code> is the key value of that dimension for the group, and <code>text-value</code> is the
	 * value of the associated text property, if it is also used in the binding.
	 *
	 * Whenever a formatter function has been defined for a column displaying the key or text of this dimension, the return value
	 * of this function is applied for the group name instead of the respective key or text value.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getGroupName
	 * @param {sap.ui.model.Context}
	 *            oContext the parent context identifying the requested group.
	 * @param {int}
	 *            iLevel the level number of oContext (because the context might occur at multiple levels)
	 * @return {string} a printable name for the group.
	 * @public
	 */
	AnalyticalBinding.prototype.getGroupName = function(oContext, iLevel) {
		if (oContext === undefined) {
			return ""; // API robustness
		}

		var sGroupProperty = this.aAggregationLevel[iLevel - 1],
			oDimension = this.oAnalyticalQueryResult.findDimensionByPropertyName(sGroupProperty),
			// it might happen that grouped property is not contained in the UI (e.g. if grouping is
			// done with a dimension's text property)
			fValueFormatter = this.mAnalyticalInfoByProperty[sGroupProperty]
				&& this.mAnalyticalInfoByProperty[sGroupProperty].formatter,
			sPropertyValue = oContext.getProperty(sGroupProperty),
			sFormattedPropertyValue, sFormattedTextPropertyValue, sGroupName, sLabelText,
			oTextProperty, sTextProperty, sTextPropertyValue, fTextValueFormatter;

		if (oDimension && this.oDimensionDetailsSet[sGroupProperty].textPropertyName) {
			oTextProperty = oDimension.getTextProperty();
		}

		if (oTextProperty) {
			sTextProperty = oTextProperty.name;
			// it might happen that text property is not contained in the UI
			fTextValueFormatter = this.mAnalyticalInfoByProperty[sTextProperty]
				&& this.mAnalyticalInfoByProperty[sTextProperty].formatter;
			sTextPropertyValue = oContext.getProperty(sTextProperty);
			sFormattedPropertyValue = fValueFormatter
				? fValueFormatter(sPropertyValue, sTextPropertyValue) : sPropertyValue;

			sFormattedTextPropertyValue = fTextValueFormatter
				? fTextValueFormatter(sTextPropertyValue, sPropertyValue) : sTextPropertyValue;
		} else {
			sFormattedPropertyValue = fValueFormatter
				? fValueFormatter(sPropertyValue) : sPropertyValue;
		}
		sLabelText = oDimension.getLabelText && oDimension.getLabelText();
		sGroupName = (sLabelText ? sLabelText + ': ' : '') + sFormattedPropertyValue;
		if (sFormattedTextPropertyValue) {
			sGroupName += ' - ' + sFormattedTextPropertyValue;
		}

		return sGroupName;
	};

	/**
	 * Updates the binding's structure with new analytical information.
	 *
	 * Analytical information is the mapping of UI columns to properties in the bound OData entity
	 * set. Every column object contains the <code>name</code> of the bound property and in
	 * addition:
	 * <ol>
	 *   <li>A column bound to a dimension property has further boolean properties:
	 *     <ul>
	 *       <li>grouped: dimension is used for building groups</li>
	 *       <li>inResult: if the column is not visible, but declared to be part of the result,
	 *         values for the related property are also fetched from the OData service</li>
	 *       <li>visible: if the column is visible, values for the related property are fetched from
	 *         the OData service</li>
	 *     </ul>
	 *   </li>
	 *   <li>A column bound to a measure property has further boolean properties:
	 *     <ul>
	 *       <li>inResult: if the column is not visible, but declared to be part of the result,
	 *         values for the related property are also fetched from the OData service</li>
	 *       <li>total: totals and sub-totals are provided for the measure at all aggregation
	 *         levels</li>
	 *       <li>visible: if the column is visible, values for the related property are fetched from
	 *         the OData service</li>
	 *     </ul>
	 *   </li>
	 *   <li>A column bound to a hierarchy property has further properties:
	 *     <ul>
	 *       <li>grouped: boolean value; indicates whether the hierarchy is used for building
	 *           groups</li>
	 *       <li>level: integer value; the hierarchy level is mandatory for at least one of those
	 *           columns that represent the same hierarchy</li>
	 *     </ul>
	 *   </li>
	 * </ol>
	 *
	 * Invoking this function resets the state of the binding and subsequent data requests such as
	 * calls to getNodeContexts() trigger OData requests in order to fetch the data that are in line
	 * with this analytical information.
	 *
	 * Be aware that a call of this function might lead to additional back-end requests, as well as
	 * a control re-rendering later on.
	 * Whenever possible use the API of the analytical control, instead of relying on the binding.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.updateAnalyticalInfo
	 * @param {object[]} aColumns
	 *   An array with objects holding the analytical information for every column
	 * @param {boolean} bForceChange
	 *   Whether to fire a change event asynchronously even if columns didn't change
	 * @protected
	 */
	AnalyticalBinding.prototype.updateAnalyticalInfo = function(aColumns, bForceChange) {
		var iDiff,
			oDimensionDetails,
			oEntityType,
			aHierarchyProperties,
			that = this;

		/*
		 * If the given analytical column is related to a hierarchy, add or update the corresponding
		 * entry in <code>that.mHierarchyDetailsByName</code>.
		 * @param {object} The analytical info for an analytical column
		 */
		function addOrUpdateHierarchy(oColumn) {
			var iLevel = oColumn.level,
				sName = oColumn.name;

			aHierarchyProperties = aHierarchyProperties
				|| oEntityType.getAllHierarchyPropertyNames();

			aHierarchyProperties.forEach(function (sHierarchyName) {
				var oHierarchy = that.oAnalyticalQueryResult
						.findDimensionByPropertyName(sHierarchyName).getHierarchy(),
					oHierarchyDetails = null,
					// each hierarchy has a node ID property, see post processing in
					// sap.ui.model.analytics.odata4analytics.EntityType.prototype._init
					sNodeIDName = oHierarchy.getNodeIDProperty().name,
					oProperty;

				if (sNodeIDName === sName) {
					oHierarchyDetails = getOrCreateHierarchyDetails(oHierarchy);
				} else {
					oProperty = oHierarchy.getNodeExternalKeyProperty();
					if (oProperty && oProperty.name === sName) {
						oHierarchyDetails = getOrCreateHierarchyDetails(oHierarchy);
						oHierarchyDetails.nodeExternalKeyName = sName;
					} else {
						oProperty = oEntityType.getTextPropertyOfProperty(sNodeIDName);
						if (oProperty && oProperty.name === sName) {
							oHierarchyDetails = getOrCreateHierarchyDetails(oHierarchy);
							oHierarchyDetails.nodeTextName = sName;
						}
					}
				}
				if (oHierarchyDetails && "level" in oColumn) {
					// add level restriction and check that aColumns is properly defined
					if (typeof iLevel === "number") {
						if ("level" in oHierarchyDetails && oHierarchyDetails.level !== iLevel) {
							throw new Error("Multiple different level filter for hierarchy '"
								+ sNodeIDName + "' defined");
						}
						oHierarchyDetails.level = iLevel;
						// the property which defines the level also defines the grouping
						oHierarchyDetails.grouped = !!oColumn.grouped;
					} else {
						throw new Error("The level of '" + sNodeIDName
							+ "' has to be an integer value");
					}
				}
			});
		}

		/*
		 * Get the hierarchy details for the given name from
		 * <code>that.mHierarchyDetailsByName</code>. If there is no entry in the set, a new empty
		 * object is added to the hierarchy details map and returned.
		 * @param {object} oHierarchy The hierarchy for which to get the details
		 * @returns {object} The hierarchy details object.
		 */
		function getOrCreateHierarchyDetails(oHierarchy) {
			var sName = oHierarchy.getNodeIDProperty().name,
				oNodeLevelProperty,
				oHierarchyDetails = that.mHierarchyDetailsByName[sName];

			if (!oHierarchyDetails) {
				oNodeLevelProperty = oHierarchy.getNodeLevelProperty();
				// add hierarchy information
				oHierarchyDetails = {
					dimensionName : oHierarchy.getNodeValueProperty().name,
					nodeIDName : sName,
					nodeLevelName : oNodeLevelProperty && oNodeLevelProperty.name
				};
				that.mHierarchyDetailsByName[sName] = oHierarchyDetails;
			}
			return oHierarchyDetails;
		}

		if (!this.oModel.oMetadata || !this.oModel.oMetadata.isLoaded() || this.isInitial()) {
			this.aInitialAnalyticalInfo = aColumns;
			return;
		}

		// check if something has changed --> deep equal on the column info objects, only 1 level "deep"
		iDiff = odata4analytics.helper.deepEqual(this._aLastChangedAnalyticalInfo, aColumns,
			function (oColumn) { // only formatter changed
				that.mAnalyticalInfoByProperty[oColumn.name].formatter = oColumn.formatter;
			});
		if (iDiff) {
			// make a deep copy of the column definition, so we can ignore duplicate calls the next time, see above
			// copy is necessary because the original analytical info will be changed and used internally, through out the binding "coding"
			this._aLastChangedAnalyticalInfo = [];
			for (var j = 0; j < aColumns.length; j++) {
				this._aLastChangedAnalyticalInfo[j] = extend({}, aColumns[j]);
			}
		}
		if (iDiff < 2) {
			if (bForceChange || iDiff) {
				setTimeout(function () {
					this._fireChange({reason: ChangeReason.Change});
				}.bind(this), 0);
			}
			return;
		}

		// parameter is an array with elements whose structure is defined by sap.ui.analytics.model.AnalyticalTable.prototype._getColumnInformation()
		var oPreviousDimensionDetailsSet = this.oDimensionDetailsSet || {},
			oPreviousMeasureDetailsSet = this.oMeasureDetailsSet || {};

		this.mAnalyticalInfoByProperty = {}; // enable associative access to analytical update information
		this.aMaxAggregationLevel = []; // names of all dimensions referenced by any column
		this.aAggregationLevel = []; // names of all currently grouped dimensions
		this.aMeasureName = []; // names of all measures referenced by any column
		if (this.iAnalyticalInfoVersionNumber == undefined) {
			this.iAnalyticalInfoVersionNumber = 1;
		} else if (this.iAnalyticalInfoVersionNumber > 999) {
			this.iAnalyticalInfoVersionNumber = 1;
		} else {
			this.iAnalyticalInfoVersionNumber = this.iAnalyticalInfoVersionNumber + 1;
		}

		this.oMeasureDetailsSet = {}; // properties with structure {rawValueProperty,unitProperty,formattedValueProperty}
		this.oDimensionDetailsSet = {}; // properties with structure {name,keyProperty,textProperty,aAttributeName}
		this.aAdditionalSelects = [];
		// Maps the nodeIDName to an object with the structure: {dimensionName, grouped, level,
		// nodeExternalKeyName, nodeIDName, nodeLevelName, nodeTextName}
		this.mHierarchyDetailsByName = {}; //

		oEntityType = this.oAnalyticalQueryResult.getEntityType();
		// process column settings for dimensions and measures part of the result or visible
		for (var i = 0; i < aColumns.length; i++) {
			// determine requested aggregation level from columns representing dimension-related properties
			var oDimension = this.oAnalyticalQueryResult.findDimensionByPropertyName(aColumns[i].name);
			if (oDimension && (aColumns[i].inResult == true || aColumns[i].visible == true)) {
				aColumns[i].dimensionPropertyName = oDimension.getName();
				oDimensionDetails = this.oDimensionDetailsSet[oDimension.getName()];
				if (!oDimensionDetails) {
					oDimensionDetails = {};
					oDimensionDetails.name = oDimension.getName();
					oDimensionDetails.aAttributeName = [];
					oDimensionDetails.grouped = false;
					this.oDimensionDetailsSet[oDimension.getName()] = oDimensionDetails;
					this.aMaxAggregationLevel.push(oDimensionDetails.name);
					if (aColumns[i].grouped == true) {
						this.aAggregationLevel.push(oDimensionDetails.name);
					}
				}
				if (aColumns[i].grouped == true) {
					if (!this.getSortablePropertyNames() || this.getSortablePropertyNames().indexOf(oDimension.getName()) == -1) {
						oLogger.fatal("property " + oDimension.getName() + " must be sortable in order to be used as grouped dimension");
					}
					oDimensionDetails.grouped = true;
				}

				if (oDimension.getName() == aColumns[i].name) {
					oDimensionDetails.keyPropertyName = aColumns[i].name;
				}
				AnalyticalBinding._updateDimensionDetailsTextProperty(oDimension, aColumns[i].name, oDimensionDetails);
				if (oDimension.findAttributeByName(aColumns[i].name)) {
					oDimensionDetails.aAttributeName.push(aColumns[i].name);
				}
				oDimensionDetails.analyticalInfo = aColumns[i];
			}

			// determine necessary measure details from columns visualizing measure-related properties
			var oMeasure = this.oAnalyticalQueryResult.findMeasureByPropertyName(aColumns[i].name);
			if (oMeasure && (aColumns[i].inResult == true || aColumns[i].visible == true)) {
				aColumns[i].measurePropertyName = oMeasure.getName();
				var oMeasureDetails = this.oMeasureDetailsSet[oMeasure.getName()];
				if (!oMeasureDetails) {
					oMeasureDetails = {};
					oMeasureDetails.name = oMeasure.getName();
					this.oMeasureDetailsSet[oMeasure.getName()] = oMeasureDetails;
					this.aMeasureName.push(oMeasureDetails.name);
				}
				if (oMeasure.getRawValueProperty().name == aColumns[i].name) {
					oMeasureDetails.rawValuePropertyName = aColumns[i].name;
				}
				var oFormattedValueProperty = oMeasure.getFormattedValueProperty();
				if (oFormattedValueProperty && oFormattedValueProperty.name == aColumns[i].name) {
					oMeasureDetails.formattedValuePropertyName = aColumns[i].name;
				}
				oMeasureDetails.analyticalInfo = aColumns[i];
			}

			// determine requested hierarchy information from columns representing hierarchy-related
			// information (column properties are not considered)
			if (!oDimension && !oMeasure) {
				addOrUpdateHierarchy(aColumns[i]);
			}
			this.mAnalyticalInfoByProperty[aColumns[i].name] = aColumns[i];
		}
		// for compatibility reasons remove hierarchy elements without a level information
		Object.keys(this.mHierarchyDetailsByName).forEach(function (sNodeIDName) {
			var oHierarchyDetails = that.mHierarchyDetailsByName[sNodeIDName];
			if (!("level" in oHierarchyDetails)) {
				delete that.mHierarchyDetailsByName[sNodeIDName];
				if (oLogger.isLoggable(Log.Level.INFO)) {
					oLogger.info("No level specified for hierarchy node '" + sNodeIDName
						+ "'; ignoring hierarchy", "");
				}
			} else if (!that.oDimensionDetailsSet[sNodeIDName]) {
				// also add it as regular dimension, which is a precondition to integrate
				// hierarchies with regular processing of data requests and responses
				that.oDimensionDetailsSet[sNodeIDName] = {
					aAttributeName : [],
					grouped : oHierarchyDetails.grouped,
					isHierarchyDimension : true, // mark it as hierarchy dimension
					name : sNodeIDName
				};
				that.aMaxAggregationLevel.push(sNodeIDName);
				if (oHierarchyDetails.grouped) {
					that.aAggregationLevel.push(sNodeIDName);
				}
			}
		});

		// finalize measure information with unit properties also being part of the table
		for ( var measureName in this.oMeasureDetailsSet) {
			var oUnitProperty = this.oAnalyticalQueryResult.findMeasureByName(measureName).getUnitProperty();
			if (oUnitProperty) {
				this.oMeasureDetailsSet[measureName].unitPropertyName = oUnitProperty.name;
			}
		}

		// check if any dimension has been added or removed. If so, invalidate the total size
		var bDimensionsChanged = Object.keys(oPreviousDimensionDetailsSet).sort().join(";")
				!== Object.keys(this.oDimensionDetailsSet).sort().join(";");
		if (bDimensionsChanged) {
			this.iTotalSize = -1;
		}
		if (bDimensionsChanged
				|| Object.keys(oPreviousMeasureDetailsSet).sort().join(";")
					!== Object.keys(this.oMeasureDetailsSet).sort().join(";")) {
			// do not reset the flag if the dimensions and the measures are the same
			this.bApplySortersToGroups = true;
		}

		// remember column settings for later reference
		this.aAnalyticalInfo = aColumns;

		// reset attributes holding previously loaded data
		this.resetData();

		this.bNeedsUpdate = false;

		if (this.mParameters.select) {
			this.aAdditionalSelects = getAdditionalSelects(this);
		}

		if (bForceChange) {
			this._fireChange({reason: ChangeReason.Change});
		}

	};

	/**
	 * Gets the analytical information for a column with a given name.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getAnalyticalInfoForColumn
	 * @param {string} sColumnName the column name.
	 * @return {object}
	 *            analytical information for the column; see {@link #updateAnalyticalInfo}
	 *            for an explanation of the object structure
	 * @public
	 */
	AnalyticalBinding.prototype.getAnalyticalInfoForColumn = function(sColumnName) {
		return this.mAnalyticalInfoByProperty[sColumnName];
	};

	/**
	 * Loads child contexts of multiple groups.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.loadGroups
	 * @param {Object<string,array>}
	 *            mGroupIdRanges specifies index ranges of child contexts to be loaded for multiple groups identified by their ID. A group index range is
	 *            given by an object consisting of startIndex, length, threshold. For every group ID, the map holds an array of such range objects.
	 *
	 * @public
	 */
	AnalyticalBinding.prototype.loadGroups = function(mGroupIdRanges) {
		var aGroupId = [];
		for ( var sGroupId in mGroupIdRanges) {
			aGroupId.push(sGroupId);

			// clean up existing loaded data for the given group ID
			this._resetData(sGroupId);

			var aGroupIdRange = mGroupIdRanges[sGroupId];

			for (var i = 0; i < aGroupIdRange.length; i++) {
				var oGroupIdRange = aGroupIdRange[i];
				// force reload of every requested index range for the given group ID
				this._getContextsForParentGroupId(sGroupId, oGroupIdRange.startIndex, oGroupIdRange.length,
						oGroupIdRange.threshold);
			}

			var aRequestId = [];
			for (var j = -1, sGroupId2; (sGroupId2 = aGroupId[++j]) !== undefined; ) {
				aRequestId.push(this._getRequestId(AnalyticalBinding._requestType.groupMembersQuery, {groupId: sGroupId2}));
			}
			this._considerRequestGrouping(aRequestId);
		}
	};

	/**
	 * Gets analytical metadata for the bound OData entity set.
	 *
	 * @function
	 * @name sap.ui.model.analytics.AnalyticalBinding.prototype.getAnalyticalQueryResult
	 * @return {sap.ui.model.analytics.odata4analytics.QueryResult} analytical metadata for the bound OData entity set
	 * @public
	 */
	AnalyticalBinding.prototype.getAnalyticalQueryResult = function() {
		return this.oAnalyticalQueryResult;
	};


	/********************************
	 *** Private section follows
	 ********************************/


	/**
	 * Enumeration of request types implemented for the analytical binding.
	 * Every type <T> is implemented with the two methods prepare<T>Request and process<T>Response, names in proper upper camel case notation.
	 * @private
	 */
	AnalyticalBinding._requestType = {
			groupMembersQuery : 1, // members of a named group G identified by its path /G1/G2/G3/.../G/
			totalSizeQuery : 2, // total number of entities in result matching all specified filter conditions
			groupMembersAutoExpansionQuery : 3, // all members residing in a group or sub group w.r.t. a given group ID
			levelMembersQuery : 4, // members of a given level
			reloadMeasuresQuery : 5 // measures of a certain entry
			};

	AnalyticalBinding._artificialRootContextGroupId = "artificialRootContext";

	/**
	 * Iterates over the given array of hierarchy level filters. For each level filter removes an
	 * already existing entry from given filter expression and adds a new entry to the filter
	 * expression.
	 *
	 * @param {object[]} aFilters
	 *   An array of hierarchy level filter objects. Each object has a <code>propertyName</code>
	 *   property of type string and a <code>level</code> property of type number.
	 * @param {sap.ui.model.analytics.odata4analytics.FilterExpression} oFilterExpression
	 *   The FilterExpression to which to add the hierarchy level filters
	 * @private
	 */
	AnalyticalBinding._addHierarchyLevelFilters = function (aFilters, oFilterExpression) {
		// add level restrictions, if hierarchy is included in request
		aFilters.forEach(function (oFilter) {
			oFilterExpression.removeConditions(oFilter.propertyName);
			oFilterExpression.addCondition(oFilter.propertyName, FilterOperator.EQ, oFilter.level);
		});
	};

	/**
	 * Returns the version of the given OData model if the model is supported.
	 *
	 * @param {sap.ui.model.Model} oModel The OData model
	 * @returns {number|null}
	 *   The version of the OData model, e.g. <code>2</code>, or <code>null</code> if the model is not supported
	 * @private
	 */
	AnalyticalBinding._getModelVersion = function (oModel) {
		const sModelName = oModel.getMetadata().getName();
		const iVersion = sModelName === "sap.ui.model.odata.v2.ODataModel" ? 2 : null;

		return iVersion;
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._getContextsForParentContext = function(oParentContext, iStartIndex, iLength,
			iThreshold, iLevel, iNumberOfExpandedLevels, bSupressRequest) {

		if (oParentContext === undefined) {
			return []; // API robustness
		}
		if (oParentContext && oParentContext.getPath() == "/" + AnalyticalBinding._artificialRootContextGroupId) {
			// special case for artificial root contexts: adjust context to point to the real path
			oParentContext = this.getModel().getContext("/");
		}
		var sParentGroupId = this._getGroupIdFromContext(oParentContext, iLevel);
		return this._getContextsForParentGroupId(sParentGroupId, iStartIndex, iLength, iThreshold, iNumberOfExpandedLevels, bSupressRequest);
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._getContextsForParentGroupId = function(sParentGroupId, iStartIndex, iLength,
			iThreshold, iNumberOfExpandedLevels, bSupressRequest) {
		if (sParentGroupId === undefined) {
			return []; // API robustness
		}

		//	Set default values if start index, threshold, length or number of expanded levels are not defined
		if (!iStartIndex) {
			iStartIndex = 0;
		}

		if (!iLength) {
			iLength = this.oModel.iSizeLimit;
		}

		if (this.mFinalLength[sParentGroupId] && this.mLength[sParentGroupId] < iStartIndex + iLength) {
			iLength = this.mLength[sParentGroupId] - iStartIndex;
			if (iLength < 0) {
				oLogger.fatal("invalid start index greater than total group length passed");
			}
		}

		if (!iThreshold) {
			iThreshold = 0;
		}

		if (!iNumberOfExpandedLevels) {
			iNumberOfExpandedLevels = 0;
		}
		if (sParentGroupId == null) {
			if (iNumberOfExpandedLevels > 0) {
				oLogger.fatal("invalid request to determine nodes of root context");
				return null;
			}
		} else {
			if (this._getGroupIdLevel(sParentGroupId) >= this.aAggregationLevel.length && iNumberOfExpandedLevels > 0) {
				oLogger.fatal("invalid request to determine nodes of context with group ID " + sParentGroupId);
				return null;
			}
			if (this._getGroupIdLevel(sParentGroupId) + iNumberOfExpandedLevels > this.aAggregationLevel.length) {
				// need to adjust number of levels to expand
				iNumberOfExpandedLevels = this.aAggregationLevel.length - this._getGroupIdLevel(sParentGroupId) - 1;
			}
		}

		var aContext = [], bLoadContexts, oGroupSection, oGroupExpansionFirstMissingMember, missingMemberCount;
		var iAggregationLevel = sParentGroupId == null ? 0 : this._getGroupIdLevel(sParentGroupId) + 1;
		if (!this.aMultiUnitLoadFactor[iAggregationLevel]) {
			this.aMultiUnitLoadFactor[iAggregationLevel] = 1;
		}

		var bGroupLevelAutoExpansionIsActive = iNumberOfExpandedLevels > 0 && sParentGroupId != null;
		if (bGroupLevelAutoExpansionIsActive) {
			var iMinRequiredLevel = this._getGroupIdLevel(sParentGroupId);
			var iAutoExpandGroupsToLevel = iMinRequiredLevel + iNumberOfExpandedLevels;
			var bDataAvailable = true;
			if (!bSupressRequest) {
				oGroupExpansionFirstMissingMember = this._calculateRequiredGroupExpansion(sParentGroupId, iAutoExpandGroupsToLevel, iStartIndex, iLength + iThreshold);
				bDataAvailable = oGroupExpansionFirstMissingMember.groupId_Missing == null;
				// the following line further reliefs the condition to load data by just looking at the sub-tree
				bDataAvailable = bDataAvailable
					// first missing member is in a different upper level sub-tree, e.g. sParentGroupId: /A/B/C groupId_Missing: /A/X
					|| oGroupExpansionFirstMissingMember.groupId_Missing.length < sParentGroupId.length
					// first missing member is in a different lower level sub-tree, e.g. sParentGroupId: /A/B groupId_Missing: /A/C/D
					|| oGroupExpansionFirstMissingMember.groupId_Missing.substring(0, sParentGroupId.length) != sParentGroupId;
			}
			if (bDataAvailable) {
				aContext = this._getLoadedContextsForGroup(sParentGroupId, iStartIndex, iLength);
			} else {
				missingMemberCount = iLength + iThreshold;
			}
			bLoadContexts = !bDataAvailable;
			// finally adjust the number of entities to be loaded by the load factor (after(!) all calculations have been made)
			missingMemberCount = Math.ceil(missingMemberCount * this.aMultiUnitLoadFactor[iAggregationLevel]);
		} else { // no automatic expansion of group levels
			aContext = this._getLoadedContextsForGroup(sParentGroupId, iStartIndex, iLength, bSupressRequest);
			bLoadContexts = false;
			if (!bSupressRequest) {
				if (this._oWatermark && sParentGroupId === this._oWatermark.groupID) {
					// use a large value, but do not omit $top, else GW might use a small default
					iThreshold = 10000;
				}
				oGroupSection = this._calculateRequiredGroupSection(sParentGroupId, iStartIndex, iLength, iThreshold);
				var bPreloadContexts = oGroupSection.length > 0 && iLength < oGroupSection.length;
				bLoadContexts = (aContext.length != iLength
								 && !(this.mFinalLength[sParentGroupId] && aContext.length >= this.mLength[sParentGroupId] - iStartIndex))
								|| bPreloadContexts;
				// finally adjust the number of entities to be loaded by the load factor (after(!) all calculations have been made)
				oGroupSection.length = Math.ceil(oGroupSection.length * this.aMultiUnitLoadFactor[iAggregationLevel]);
			}
		}

		if (!bLoadContexts) {
			// all data available so no request will be issued that might be related to some group of requests
			this._cleanupGroupingForCompletedRequest(this._getRequestId(AnalyticalBinding._requestType.groupMembersQuery, {groupId: sParentGroupId}));
		}

		// check if metadata are already available
		var bExecuteRequest = false;
		if (this.oModel.getServiceMetadata()) {
			// If rows are missing send a request
			if (bLoadContexts) {
				var bNeedTotalSize = this.bProvideTotalSize && this.iTotalSize == -1 && !this._isRequestPending(this._getRequestId(AnalyticalBinding._requestType.totalSizeQuery));
				bExecuteRequest = true;
				var aMembersRequestId;
				if (this.bUseBatchRequests) {
					if (bGroupLevelAutoExpansionIsActive) {
						aMembersRequestId = this._prepareGroupMembersAutoExpansionRequestIds(sParentGroupId, iNumberOfExpandedLevels);
						for (var i = -1, sRequestId; (sRequestId = aMembersRequestId[++i]) !== undefined; ) {
							if (this._isRequestPending(sRequestId)) {
								bExecuteRequest = false;
								break;
							}
						}
						if (bExecuteRequest) {
							this.aBatchRequestQueue.push([ AnalyticalBinding._requestType.groupMembersAutoExpansionQuery, sParentGroupId, oGroupExpansionFirstMissingMember, missingMemberCount, iNumberOfExpandedLevels ]);
						}
					} else { // ! bGroupLevelAutoExpansionIsActive
						bExecuteRequest = oGroupSection.length
							&& !this._isRequestPending(this._getRequestId(AnalyticalBinding._requestType.groupMembersQuery, {groupId: sParentGroupId}));
						if (bExecuteRequest) {
							this.aBatchRequestQueue.push([ AnalyticalBinding._requestType.groupMembersQuery, sParentGroupId, oGroupSection.startIndex, oGroupSection.length ]);
							aMembersRequestId = [ this._getRequestId(AnalyticalBinding._requestType.groupMembersQuery, {groupId: sParentGroupId}) ];
						}
					}
					if (bExecuteRequest && bNeedTotalSize) {
						aMembersRequestId.push(this._getRequestId(AnalyticalBinding._requestType.totalSizeQuery));
						this._considerRequestGrouping(aMembersRequestId);
						this.aBatchRequestQueue.push([ AnalyticalBinding._requestType.totalSizeQuery ]);
					}
					if (bExecuteRequest) {
						if (sParentGroupId == null) { // root node is requested, so discard all not received responses, because the entire table must be set up from scratch
							this._abortAllPendingRequests();
						}
						Promise.resolve().then(AnalyticalBinding.prototype._processRequestQueue.bind(this));
					}
				} else { // ! bUseBatchRequests
					var oMemberRequestDetails;
					if (bGroupLevelAutoExpansionIsActive) {
						aMembersRequestId = this._prepareGroupMembersAutoExpansionRequestIds(sParentGroupId, iNumberOfExpandedLevels);
						for (var j = -1, sMemberRequestId; (sMemberRequestId = aMembersRequestId[++j]) !== undefined; ) {
							if (this._isRequestPending(sMemberRequestId)) {
								bExecuteRequest = false;
								break;
							}
						}
						if (bExecuteRequest) {
							oMemberRequestDetails = this._prepareGroupMembersAutoExpansionQueryRequest(AnalyticalBinding._requestType.groupMembersAutoExpansionQuery, sParentGroupId, oGroupExpansionFirstMissingMember, missingMemberCount, iNumberOfExpandedLevels);
						}
					} else { // ! bGroupLevelAutoExpansionIsActive
						bExecuteRequest = oGroupSection.length
							&& !this._isRequestPending(this._getRequestId(AnalyticalBinding._requestType.groupMembersQuery, {groupId: sParentGroupId}));
						if (bExecuteRequest) {
							oMemberRequestDetails = this._prepareGroupMembersQueryRequest(AnalyticalBinding._requestType.groupMembersQuery, sParentGroupId, oGroupSection.startIndex, oGroupSection.length);
							aMembersRequestId = [ oMemberRequestDetails.sRequestId ];
						}
					}
					if (bExecuteRequest) {
						if (sParentGroupId == null) { // root node is requested, so discard all not received responses, because the entire table must be set up from scratch
							this._abortAllPendingRequests();
						}

						this._executeQueryRequest(oMemberRequestDetails);
						if (bNeedTotalSize && !oMemberRequestDetails.bIsFlatListRequest) {
							aMembersRequestId.push(this._getRequestId(AnalyticalBinding._requestType.totalSizeQuery));
							this._considerRequestGrouping(aMembersRequestId);
							this._executeQueryRequest(this._prepareTotalSizeQueryRequest(AnalyticalBinding._requestType.totalSizeQuery));
						}
					}
				}
			}
		}
		return aContext;
	};


	/**
	 * Computes the hierarchy level filters for all entries in <code>mHierarchyDetailsByName</code>
	 * and adds for each entry a recursive hierarchy to the given analytical query request.
	 * If the given group ID is null nothing is done and if the given group ID is not "/" an error
	 * is logged and an empty array is returned.
	 *
	 * @param {sap.ui.model.analytics.odata4analytics.QueryResultRequest} oAnalyticalQueryRequest
	 *   The analytical query request to which to add the recursive hierarchy
	 * @param {string} sGroupId
	 *   The group ID; has to be "/" or null otherwise an error is logged and an empty array is
	 *   returned
	 * @returns {object[]} An array of hierarchy level filters. Each filter has a
	 *   <code>propertyName</code> property of type string and a <code>level</code> property of type
	 *   number.
	 * @private
	 */
	AnalyticalBinding.prototype._getHierarchyLevelFiltersAndAddRecursiveHierarchy
			= function (oAnalyticalQueryRequest, sGroupId) {
		var aHierarchyKeys,
			aHierarchyLevelFilters = [],
			that = this;

		if (sGroupId === null) {
			return aHierarchyLevelFilters;
		}

		aHierarchyKeys = Object.keys(this.mHierarchyDetailsByName);
		if (aHierarchyKeys.length > 0 && sGroupId !== "/") {
			oLogger.error("Hierarchy cannot be requested for members of a group",
				sGroupId);
			return aHierarchyLevelFilters;
		}

		aHierarchyKeys.forEach(function (sHierarchyKey) {
			var oHierarchyDetails = that.mHierarchyDetailsByName[sHierarchyKey];

			oAnalyticalQueryRequest.addRecursiveHierarchy(oHierarchyDetails.dimensionName,
				!!oHierarchyDetails.nodeExternalKeyName,
				!!oHierarchyDetails.nodeTextName);
			aHierarchyLevelFilters.push({
				propertyName : oHierarchyDetails.nodeLevelName,
				level : oHierarchyDetails.level
			});
		});
		return aHierarchyLevelFilters;
	};

	/**
	 * Filters out hierarchy dimensions from given aggregation level.
	 *
	 * @param {string[]} aAggregationLevel
	 *   Array of dimension property names which define the aggregation level
	 * @returns {string[]} Array of non hierarchy dimensions
	 * @private
	 */
	AnalyticalBinding.prototype._getNonHierarchyDimensions = function (aAggregationLevel) {
		var that = this;

		return aAggregationLevel.filter(function (sDimension) {
			return !that.oDimensionDetailsSet[sDimension].isHierarchyDimension;
		});
	};

	AnalyticalBinding.prototype._processRequestQueue = function(aRequestQueue) {
		// if no argument is given: use the shared member aBatchRequestQueue
		if (aRequestQueue === undefined || aRequestQueue === null) {
			//safety check: empty array fallback in case the "global" batch queue is not defined yet
			aRequestQueue = this.aBatchRequestQueue || [];
		}
		// step out if the request queue is still empty after our previous checks
		if (aRequestQueue.length == 0) {
			return;
		}

		var aRequestDetails = [];
		var bFoundFlatListRequest = false;
		var i, oRequestDetails, aRequestQueueEntry;

		// create request objects: process group member requests first to detect flat list requests
		for (i = -1; (aRequestQueueEntry = aRequestQueue[++i]) !== undefined;) {
			if (aRequestQueueEntry[0] == AnalyticalBinding._requestType.groupMembersQuery) { // request type is at array index 0
				oRequestDetails = AnalyticalBinding.prototype._prepareGroupMembersQueryRequest.apply(this, aRequestQueueEntry);
				bFoundFlatListRequest = bFoundFlatListRequest || oRequestDetails.bIsFlatListRequest;
				aRequestDetails.push(oRequestDetails);
			}
		}

		// create request objects for all other request types
		for (i = -1; (aRequestQueueEntry = aRequestQueue[++i]) !== undefined;) {
			oRequestDetails = null;
			switch (aRequestQueueEntry[0]) { // different request types
			case AnalyticalBinding._requestType.groupMembersQuery:
				continue; // handled above
			case AnalyticalBinding._requestType.totalSizeQuery:
				if (!bFoundFlatListRequest) {
					oRequestDetails = AnalyticalBinding.prototype._prepareTotalSizeQueryRequest.apply(this, aRequestQueueEntry);
					aRequestDetails.push(oRequestDetails);
				}
				break;
			case AnalyticalBinding._requestType.groupMembersAutoExpansionQuery:
				oRequestDetails = AnalyticalBinding.prototype._prepareGroupMembersAutoExpansionQueryRequest.apply(this, aRequestQueueEntry);
				for (var j = -1, oLevelMembersRequestDetails; (oLevelMembersRequestDetails = oRequestDetails.aGroupMembersAutoExpansionRequestDetails[++j]) !== undefined; ) {
					aRequestDetails.push(oLevelMembersRequestDetails);
				}
				break;
			case AnalyticalBinding._requestType.reloadMeasuresQuery: {
				var aReloadMeasureRequestDetails = aRequestQueueEntry[1];
				for (var k = -1, oReloadMeasureRequestDetails; (oReloadMeasureRequestDetails = aReloadMeasureRequestDetails[++k]) !== undefined; ) {
					aRequestDetails.push(oReloadMeasureRequestDetails);
				}
				break;
			}
			default:
				oLogger.fatal("unhandled request type " + aRequestQueue[i][0]);
				continue;
			}
		}

		// execute them either directly in case of a single request or via a batch request
		if (aRequestDetails.length > 1) {
			this._executeBatchRequest(aRequestDetails);
		} else {
			this._executeQueryRequest(aRequestDetails[0]);
		}

		// clean up request queue after processing, if it is based on the shared member request queue
		if (aRequestQueue === this.aBatchRequestQueue) {
			this.aBatchRequestQueue = [];
		}
	};

	/** *************************************************************** */
	/**
	 * @private
	 */
	AnalyticalBinding.prototype._prepareGroupMembersQueryRequest = function(iRequestType, sGroupId, iStartIndex, iLength) {
		var aGroupId = [],
			// array of sap.ui.model.Sorter like objects ({sPatch, bDescending})
			aGroupingSorters = [],
			aHierarchyLevelFilters;

		// (0) set up analytical OData request object
		var oAnalyticalQueryRequest = new odata4analytics.QueryResultRequest(this.oAnalyticalQueryResult);
		oAnalyticalQueryRequest.setResourcePath(this._getResourcePath());
		oAnalyticalQueryRequest.getSortExpression().clear();

		// (1) analyze aggregation level of sGroupId

		// indexes to elements of this.aMaxAggregationLevel marking begin and end of the requested child level
		var iChildGroupFromLevel = 0, iChildGroupToLevel = -1;
		if (sGroupId) {
			aGroupId = this._getGroupIdComponents(sGroupId);
			iChildGroupFromLevel = iChildGroupToLevel = aGroupId.length;

			var iUngroupedParentLevelCount = 0;
			// determine offset for child level (depends on grouped column property of higher aggregation levels)
			// Ex: Assume aMaxAggregationLevel with (G=grouped,U=ungrouped): [ G1 U1 U2 G2 U3 U4 G3 F5 F6 ... ]
			// For sGroupId = "G1/G2", initial iChildGroupFromLevel is 2. The following loop will increment it to 4
			// and consequently point to U3
			for (var j = 0, iLevel = 0; j < iChildGroupFromLevel; iLevel++) {
				if (this.oDimensionDetailsSet[this.aMaxAggregationLevel[iLevel]].grouped == false) {
					++iUngroupedParentLevelCount;
				} else {
					++j;
				}
			}
			// adjust child levels by number of ungrouped parent levels!
			iChildGroupFromLevel = iChildGroupToLevel = iChildGroupFromLevel + iUngroupedParentLevelCount;

			// determine index range for aggregation levels included in child level
			// (rule: take all lower levels up to and including the first grouped level; G3 in above example
			if (this.aMaxAggregationLevel.length > 0) {
				while (this.oDimensionDetailsSet[this.aMaxAggregationLevel[iChildGroupToLevel]].grouped == false) {
					if (++iChildGroupToLevel == this.aMaxAggregationLevel.length) {
						break;
					}
				}
			}
		}

		// (2) determine if the sub groups will effectively represent leafs (relevant for un-"total"ed columns, see below)
		var bIsLeafGroupsRequest = iChildGroupToLevel >= this.aMaxAggregationLevel.length - 1;

		// (3) set aggregation level for child nodes
		// need to distinguish between regular dimensions and hierarchy dimensions
		aHierarchyLevelFilters
			= this._getHierarchyLevelFiltersAndAddRecursiveHierarchy(oAnalyticalQueryRequest,
				sGroupId);

		var aAggregationLevel = this.aMaxAggregationLevel.slice(0, iChildGroupToLevel + 1);
		var aAggregationLevelNoHierarchy = this._getNonHierarchyDimensions(aAggregationLevel);
		oAnalyticalQueryRequest.setAggregationLevel(aAggregationLevelNoHierarchy);
		for (var i = 0; i < aAggregationLevelNoHierarchy.length; i++) {
			// specify components requested for this level (key, text, attributes)
			var oDimensionDetails = this.oDimensionDetailsSet[aAggregationLevelNoHierarchy[i]];
			// as we combine the key and text in the group header we also need the text!
			var bIncludeText = (oDimensionDetails.textPropertyName != undefined);
			oAnalyticalQueryRequest.includeDimensionKeyTextAttributes(oDimensionDetails.name, // bIncludeKey: No, always needed!
			true, bIncludeText, oDimensionDetails.aAttributeName);

			// define a default sort order in case no sort criteria have been provided externally
			if (oDimensionDetails.grouped) {
				aGroupingSorters.push({
					sPath : aAggregationLevelNoHierarchy[i],
					bDescending : false
				});
			}
		}

		// (4) set filter
		var oFilterExpression = oAnalyticalQueryRequest.getFilterExpression();
		oFilterExpression.clear();
		if (this.aApplicationFilter) {
			oFilterExpression.addUI5FilterConditions(this.aApplicationFilter);
		}
		if (this.aControlFilter) {
			oFilterExpression.addUI5FilterConditions(this.aControlFilter);
		}

		if (iChildGroupFromLevel >= 1) {
			for (var k = 0, l = aGroupId.length; k < l; k++) {
				oFilterExpression.removeConditions(this.aAggregationLevel[k]);
				oFilterExpression.addCondition(this.aAggregationLevel[k], FilterOperator.EQ, aGroupId[k]);
			}
		}
		AnalyticalBinding._addHierarchyLevelFilters(aHierarchyLevelFilters, oFilterExpression);

		// (5) set measures as requested per column
		var bIncludeRawValue;
		var bIncludeFormattedValue;
		var bIncludeUnitProperty;
		var oMeasureDetails;

		var aSelectedUnitPropertyName = [];

		if (sGroupId != null || this.bProvideGrandTotals
				// get also grand total for group ID "null" (virtual root), independent of
				// bProvideGrandTotals, if there are sorters in this.aSorter and they need to be
				// applied to groups
				|| (this._canApplySortersToGroups() && this.aSorter.length > 0)) {
			// select measures if the requested group is not the root context i.e. the grand totals row, or grand totals shall be determined
			oAnalyticalQueryRequest.setMeasures(this.aMeasureName);

			for ( var sMeasureName in this.oMeasureDetailsSet) {
				oMeasureDetails = this.oMeasureDetailsSet[sMeasureName];
				if (!bIsLeafGroupsRequest && this._isSkippingTotalForMeasure(sMeasureName)) {
					bIncludeRawValue = false;
					bIncludeFormattedValue = false;
					bIncludeUnitProperty = false;
				} else {
					bIncludeRawValue = (oMeasureDetails.rawValuePropertyName != undefined);
					bIncludeFormattedValue = (oMeasureDetails.formattedValuePropertyName != undefined);
					bIncludeUnitProperty = (oMeasureDetails.unitPropertyName != undefined);
					if (bIncludeUnitProperty) {
						// remember unit property together with using measure raw value property for response analysis in success handler
						if (aSelectedUnitPropertyName.indexOf(oMeasureDetails.unitPropertyName) == -1) {
							aSelectedUnitPropertyName.push(oMeasureDetails.unitPropertyName);
						}
					}
				}
				oAnalyticalQueryRequest.includeMeasureRawFormattedValueUnit(oMeasureDetails.name, bIncludeRawValue,
						bIncludeFormattedValue, bIncludeUnitProperty);
			}
			// exclude those unit properties from the selected that are included in the current aggregation level
			for (var n in aAggregationLevelNoHierarchy) {
				var iMatchingIndex;
				if ((iMatchingIndex = aSelectedUnitPropertyName.indexOf(aAggregationLevelNoHierarchy[n])) != -1) {
					aSelectedUnitPropertyName.splice(iMatchingIndex, 1);
				}
			}
		}

		// (6) set sort order
		// Prevent sorter for grand total request
		if (sGroupId) {
			this._addSorters(oAnalyticalQueryRequest.getSortExpression(), aGroupingSorters);
		}

		// (7) set result page boundaries
		if (iLength == 0) {
			oLogger.fatal("unhandled case: load 0 entities of sub group");
		}
		var oKeyIndexMapping = this._getKeyIndexMapping(sGroupId, iStartIndex);
		if (!this.bNoPaging) {
			oAnalyticalQueryRequest.setResultPageBoundaries(oKeyIndexMapping.iServiceKeyIndex + 1, oKeyIndexMapping.iServiceKeyIndex + iLength);
		}

		// (8) request result entity count
		oAnalyticalQueryRequest.setRequestOptions(null, !this.mFinalLength[sGroupId]);

		return {
			iRequestType : iRequestType,
			sRequestId : this._getRequestId(AnalyticalBinding._requestType.groupMembersQuery, {groupId: sGroupId}),
			oAnalyticalQueryRequest : oAnalyticalQueryRequest,
			sGroupId : sGroupId,
			aSelectedUnitPropertyName : aSelectedUnitPropertyName,
			aAggregationLevel : aAggregationLevel,
			bIsFlatListRequest : bIsLeafGroupsRequest && iChildGroupFromLevel == 0,
			bIsLeafGroupsRequest : bIsLeafGroupsRequest,
			iStartIndex : iStartIndex,
			iLength : iLength,
			oKeyIndexMapping : oKeyIndexMapping
		};
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._prepareTotalSizeQueryRequest = function(iRequestType) {
		var aHierarchyLevelFilters;

		// (0) set up analytical OData request object
		var oAnalyticalQueryRequest = new odata4analytics.QueryResultRequest(this.oAnalyticalQueryResult);
		oAnalyticalQueryRequest.setResourcePath(this._getResourcePath());

		// (1) set aggregation level
		// need to distinguish between regular dimensions and hierarchy dimensions
		aHierarchyLevelFilters
			= this._getHierarchyLevelFiltersAndAddRecursiveHierarchy(oAnalyticalQueryRequest, "/");
		oAnalyticalQueryRequest
			.setAggregationLevel(this._getNonHierarchyDimensions(this.aMaxAggregationLevel));

		oAnalyticalQueryRequest.setMeasures([]);

		// (2) set filter
		var oFilterExpression = oAnalyticalQueryRequest.getFilterExpression();
		oFilterExpression.clear();
		if (this.aApplicationFilter) {
			oFilterExpression.addUI5FilterConditions(this.aApplicationFilter);
		}
		if (this.aControlFilter) {
			oFilterExpression.addUI5FilterConditions(this.aControlFilter);
		}
		AnalyticalBinding._addHierarchyLevelFilters(aHierarchyLevelFilters, oFilterExpression);

		// (2) fetch no data
		oAnalyticalQueryRequest.setRequestOptions(null, null, true);

		// (3) request result entity count
		oAnalyticalQueryRequest.setRequestOptions(null, true);

		return {
			iRequestType : iRequestType,
			sRequestId : this._getRequestId(AnalyticalBinding._requestType.totalSizeQuery),
			oAnalyticalQueryRequest : oAnalyticalQueryRequest
		};
	};


	/**
	 * @private
	 */
	AnalyticalBinding.prototype._prepareGroupMembersAutoExpansionQueryRequest = function(iRequestType, sGroupId, oGroupExpansionFirstMissingMember, iLength, iNumberOfExpandedLevels) {
		var that = this;

		// local helper function for creating filter expressions for all group level requests
		/*
		 * Let G be the group ID for the root for the first missing member, e.g. G = /A/B/C/D/.../W/X/, and (optional) startIndex_Missing > 0 for the children of X.
		 * Let P_1, P_2, ... be the properties for the different grouping levels.
		 * Then, for every level l, 1 <= l <= iAutoExpandGroupsToLevel, the filter expression
		 * is // every such expression is an instance of aLevelFilterCondition, see in code below
		 *   [0] ( P_1 = A and P_2 = B and .. P_l >= X )
		 *   [1] or ( P_1 = A and P_2 = B and .. P_(l-1) > W )    // every such line is an instance of aIntermediateLevelFilterCondition, see in code below
		 *       ...
		 *   [N] or ( P_1 > A )
		 *   assuming that P_1, P_2, ... are all to be sorted in ascending order. For any deviation, replace > with <.
		 *
		 *   Additional rules considered:
		 *   (R1) For every auto-expand level with a higher number than the level of the first missing member,
		 *     the strict comparison (< or >) has to include equality (<= or >=) to match all needed members of these deep levels.
		 *   (R2) If startIndex_Missing > 0, then the R1 does not apply. here,
		 *        (R2.1) the strict comparison (< or >) must be replaced by equality (=)
		 *        (R2.2) the partial filter expression for every auto-expand level with a higher number than the level of the first missing member
		 *               must be extended by a condition P_Y > Y, where Y is the child of X at position startIndex_Missing - 1,
		 *               and P_Y is the property for this grouping level.
		 */
		var prepareLevelFilterExpressions = function(oGroupExpansionFirstMissingMember, iAutoExpandGroupsToLevel) {
			var aFilterArray = [];

			if (oGroupExpansionFirstMissingMember.groupId_Missing == null) {
				oLogger.fatal("missing group Id not present");
				return aFilterArray;
			}
			var aGroupIdComponents_Missing = that._getGroupIdComponents(oGroupExpansionFirstMissingMember.groupId_Missing);
			var iGroupIdLevel_Missing = aGroupIdComponents_Missing.length;
			if (iGroupIdLevel_Missing > iAutoExpandGroupsToLevel) {
				oLogger.fatal("the given group ID is too deep for requested level for auto expansion");
				return aFilterArray;
			}

			// create template for every term of the filter expression
			var aTemplateFilter = [];
			for (var i = 0; i < iGroupIdLevel_Missing; i++) {
				var sGroupProperty = that.aAggregationLevel[i];
				var sValue = aGroupIdComponents_Missing[i];
				var sFilterOperator = that._getFilterOperatorMatchingPropertySortOrder(sGroupProperty);
				aTemplateFilter[i] = new Filter(sGroupProperty, sFilterOperator, sValue);
			}

			// if first missing member start within a partially loaded group, an extra condition will be needed below
			var oFirstMissingMemberStartIndexLastKnownFilterCondition = null;
			if (oGroupExpansionFirstMissingMember.startIndex_Missing > 0) {
				var oFirstMissingMemberStartIndexLastKnownGroupContextKey = that._getKey(oGroupExpansionFirstMissingMember.groupId_Missing,
						oGroupExpansionFirstMissingMember.startIndex_Missing - 1);
				var oFirstMissingMemberStartIndexLastKnownObject = that.oModel.getObject("/" + oFirstMissingMemberStartIndexLastKnownGroupContextKey);
				var sFirstMissingMemberStartIndexAggregationLevel = that.aAggregationLevel[iGroupIdLevel_Missing];
				var sFirstMissingMemberStartIndexLastKnownValue = oFirstMissingMemberStartIndexLastKnownObject
					[sFirstMissingMemberStartIndexAggregationLevel];
				oFirstMissingMemberStartIndexLastKnownFilterCondition = new Filter(sFirstMissingMemberStartIndexAggregationLevel,
						that._getFilterOperatorMatchingPropertySortOrder(sFirstMissingMemberStartIndexAggregationLevel, false),
						sFirstMissingMemberStartIndexLastKnownValue);
			}


			// now create the filter expressions (filter object arrays) for every group level to be requested
			for (var iLevel = 0; iLevel < iAutoExpandGroupsToLevel; iLevel++) {
				var aLevelFilterCondition = [];
				var iNumberOfIntermediateLevelConditions = Math.min(iGroupIdLevel_Missing, iLevel + 1);
				for (var iIntermediateLevel = 0; iIntermediateLevel < iNumberOfIntermediateLevelConditions; iIntermediateLevel++) {
					var aIntermediateLevelFilterCondition = [];
					var iNumberOfLevelConditions = Math.min(iGroupIdLevel_Missing, iIntermediateLevel + 1);
					var bAddExtraConditionForFirstMissingMemberStartIndexLastKnown =
						oGroupExpansionFirstMissingMember.startIndex_Missing > 0;
					for (var iLevelCondition = 0; iLevelCondition < iNumberOfLevelConditions; iLevelCondition++) {
						// create filter condition from template
						var oFilterCondition = new Filter("x", FilterOperator.EQ, "x");
						oFilterCondition = deepExtend(oFilterCondition, aTemplateFilter[iLevelCondition]);

						if (iNumberOfLevelConditions > 1 && iLevelCondition < iNumberOfLevelConditions - 1) {
							oFilterCondition.sOperator = FilterOperator.EQ;
						}
						if (iLevelCondition == iGroupIdLevel_Missing - 1
							&& iLevel > iGroupIdLevel_Missing - 1
							&& !bAddExtraConditionForFirstMissingMemberStartIndexLastKnown) { // rule (R1)
							if (oFilterCondition.sOperator == FilterOperator.GT) {
								oFilterCondition.sOperator = FilterOperator.GE;
							} else { // it must be LT
								oFilterCondition.sOperator = FilterOperator.LE;
							}
						}
						aIntermediateLevelFilterCondition.push(oFilterCondition);
					}
					// create the instance for ( P_1 = A and P_2 = B and .. P_(l-1) > W )
					if (aIntermediateLevelFilterCondition.length > 0) {
						aLevelFilterCondition.push(new Filter(aIntermediateLevelFilterCondition, true));
						// add an extra intermediate filter condition to reflect start position at oGroupExpansionFirstMissingMember.startIndex_Missing
						if (iLevel > iGroupIdLevel_Missing - 1
							&& iIntermediateLevel == iGroupIdLevel_Missing - 1
							&& bAddExtraConditionForFirstMissingMemberStartIndexLastKnown) { // rule (R2)
							// create a copy of the constructed intermediate filter condition
							var aStartIndexFilterCondition = [];
							for (var j = 0; j < aIntermediateLevelFilterCondition.length; j++) {
								var oConditionCopy = new Filter("x", FilterOperator.EQ, "x");
								oConditionCopy = deepExtend(oConditionCopy, aIntermediateLevelFilterCondition[j]);
								aStartIndexFilterCondition.push(oConditionCopy);
							}
							aStartIndexFilterCondition[iGroupIdLevel_Missing - 1].sOperator = FilterOperator.EQ; // (R2.1)
							aStartIndexFilterCondition.push(oFirstMissingMemberStartIndexLastKnownFilterCondition); // (R2.2)

							aLevelFilterCondition.push(new Filter(aStartIndexFilterCondition, true));
							break;
						}
					}
				}
				// create the entire filter expression
				if (aLevelFilterCondition.length > 0) {
					aFilterArray[iLevel] = new Filter(aLevelFilterCondition, false);
				} else {
					aFilterArray[iLevel] = null;
				}
			}

			return aFilterArray;
		};

		// local helper function for requesting members of a given level (across groups) - copied from _prepareGroupMembersQueryRequest & adapted
		var prepareLevelMembersQueryRequest = function(iRequestType, sGroupId, iLevel, oGroupContextFilter,
				iStartIndex, iLength, bAvoidLengthUpdate, bUseStartIndexForSkip) {
			var aHierarchyLevelFilters;

			// (1) set up analytical OData request object
			var oAnalyticalQueryRequest = new odata4analytics.QueryResultRequest(that.oAnalyticalQueryResult);
			oAnalyticalQueryRequest.setResourcePath(that._getResourcePath());
			oAnalyticalQueryRequest.getSortExpression().clear();
			// (2) analyze aggregation level of sGroupId

			// indexes to elements of this.aMaxAggregationLevel marking begin and end of the requested child level
			var iChildGroupFromLevel = 0, iChildGroupToLevel = -1;
			iChildGroupFromLevel = iChildGroupToLevel = iLevel - 1;

			var iUngroupedParentLevelCount = 0;
			// determine offset for child level (depends on grouped column property of higher aggregation levels)
			// Ex: Assume aMaxAggregationLevel with (G=grouped,U=ungrouped): [ G1 U1 U2 G2 U3 U4 G3 F5 F6 ... ]
			// For sGroupId = "G1/G2", initial iChildGroupFromLevel is 2. The following loop will increment it to 4
			// and consequently point to U3
			for (var i = 0, iParentLevel = 0; i < iChildGroupFromLevel; iParentLevel++) {
				if (that.oDimensionDetailsSet[that.aMaxAggregationLevel[iParentLevel]].grouped == false) {
					++iUngroupedParentLevelCount;
				} else {
					++i;
				}
			}
			// adjust child levels by number of ungrouped parent levels!
			iChildGroupFromLevel = iChildGroupToLevel = iChildGroupFromLevel + iUngroupedParentLevelCount;

			// determine index range for aggregation levels included in child level
			// (rule: take all lower levels up to and including the first grouped level; G3 in above example
			if (that.aMaxAggregationLevel.length > 0) {
				while (that.aMaxAggregationLevel[iChildGroupToLevel]
						&& that.oDimensionDetailsSet[that.aMaxAggregationLevel[iChildGroupToLevel]].grouped == false) {
					if (++iChildGroupToLevel == that.aMaxAggregationLevel.length) {
						break;
					}
				}
			}

			// determine if the sub groups will effectively represent leafs (relevant for un-"total"ed columns, see below)
			var bIsLeafGroupsRequest = iChildGroupToLevel >= that.aMaxAggregationLevel.length - 1;

			// (3) set aggregation level for child nodes
			aHierarchyLevelFilters
				= that._getHierarchyLevelFiltersAndAddRecursiveHierarchy(oAnalyticalQueryRequest,
					sGroupId);

			var aAggregationLevel = that.aMaxAggregationLevel.slice(0, iChildGroupToLevel + 1);
			oAnalyticalQueryRequest.setAggregationLevel(aAggregationLevel);

			const aGroupingSorters = [];
			for (var l = 0; l < aAggregationLevel.length; l++) {
				var oDimensionDetails = that.oDimensionDetailsSet[aAggregationLevel[l]];
				var bIncludeText = (oDimensionDetails.textPropertyName != undefined);
				oAnalyticalQueryRequest.includeDimensionKeyTextAttributes(oDimensionDetails.name, // bIncludeKey: No, always needed!
				true, bIncludeText, oDimensionDetails.aAttributeName);

				// define a default sort order in case no sort criteria have been provided externally
				if (oDimensionDetails.grouped) {
					aGroupingSorters.push(new Sorter(aAggregationLevel[l]));
				}
			}

			// (4) set filter
			var oFilterExpression = oAnalyticalQueryRequest.getFilterExpression();
			oFilterExpression.clear();
			if (that.aApplicationFilter) {
				oFilterExpression.addUI5FilterConditions(that.aApplicationFilter);
			}
			if (that.aControlFilter) {
				oFilterExpression.addUI5FilterConditions(that.aControlFilter);
			}
			if (oGroupContextFilter) {
				oFilterExpression.addUI5FilterConditions([oGroupContextFilter]);
			}
			AnalyticalBinding._addHierarchyLevelFilters(aHierarchyLevelFilters, oFilterExpression);

			// (5) set measures as requested per column
			var bIncludeRawValue;
			var bIncludeFormattedValue;
			var bIncludeUnitProperty;
			var oMeasureDetails;

			var aSelectedUnitPropertyName = [];

			// select measures if the requested group is not the root context i.e. the grand totals row, or grand totals shall be determined
			oAnalyticalQueryRequest.setMeasures(that.aMeasureName);

			for ( var sMeasureName in that.oMeasureDetailsSet) {
				oMeasureDetails = that.oMeasureDetailsSet[sMeasureName];
				if (!bIsLeafGroupsRequest && that._isSkippingTotalForMeasure(sMeasureName)) {
					bIncludeRawValue = false;
					bIncludeFormattedValue = false;
					bIncludeUnitProperty = false;
				} else {
					bIncludeRawValue = (oMeasureDetails.rawValuePropertyName != undefined);
					bIncludeFormattedValue = (oMeasureDetails.formattedValuePropertyName != undefined);
					bIncludeUnitProperty = (oMeasureDetails.unitPropertyName != undefined);
					if (bIncludeUnitProperty) {
						// remember unit property together with using measure raw value property for response analysis in success handler
						if (aSelectedUnitPropertyName.indexOf(oMeasureDetails.unitPropertyName) == -1) {
							aSelectedUnitPropertyName.push(oMeasureDetails.unitPropertyName);
						}
					}
				}
				oAnalyticalQueryRequest.includeMeasureRawFormattedValueUnit(oMeasureDetails.name, bIncludeRawValue,
						bIncludeFormattedValue, bIncludeUnitProperty);
			}
			// exclude those unit properties from the selected that are included in the current aggregation level
			for ( var j in aAggregationLevel) {
				var iMatchingIndex;
				if ((iMatchingIndex = aSelectedUnitPropertyName.indexOf(aAggregationLevel[j])) != -1) {
					aSelectedUnitPropertyName.splice(iMatchingIndex, 1);
				}
			}

			// (6) set sort order
			that._mergeAndAddSorters(aGroupingSorters, oAnalyticalQueryRequest.getSortExpression());

			// (7) set result page boundaries
			if (iLength == 0) {
				oLogger.fatal("unhandled case: load 0 entities of sub group");
			}
			var iEffectiveStartIndex = iStartIndex;
			if (!bUseStartIndexForSkip) {
				iEffectiveStartIndex = 0; // and the skip-value is encoded in the filter expression; still the start index is relevant and kept (see below) for booking the result entries
			} else {
				// when bUseStartIndexForSkip is set and no filter conditions are given, the top level must also be paged
				// calculate the number of loaded entries per level
				var iServiceLengthForGroupIdMissing = 0;
				for (var sGID in that.mServiceKey) {
					if (sGID.split("/").length === iLevel + 1) {
						iServiceLengthForGroupIdMissing += that.mServiceKey[sGID].length;
					}
				}

				iEffectiveStartIndex = Math.max(iEffectiveStartIndex, iServiceLengthForGroupIdMissing);
			}

			if (!that.bNoPaging) {
				oAnalyticalQueryRequest.setResultPageBoundaries(iEffectiveStartIndex + 1,
					iEffectiveStartIndex + iLength);
			}

			return {
				iRequestType : iRequestType,
				sRequestId : null, // set by caller
				oAnalyticalQueryRequest : oAnalyticalQueryRequest,
				iLevel : iLevel,
				aSelectedUnitPropertyName : aSelectedUnitPropertyName,
				aAggregationLevel : aAggregationLevel,
				bIsFlatListRequest : bIsLeafGroupsRequest,
				bIsLeafGroupsRequest : bIsLeafGroupsRequest,
				iStartIndex : iStartIndex,
				iLength : iLength,
				bAvoidLengthUpdate : bAvoidLengthUpdate
			};
		};

		// function implementation starts here
		var aGroupMembersAutoExpansionRequestDetails = [];
		var aRequestId = [];
		if (!oGroupExpansionFirstMissingMember) {
			oLogger.fatal("no first missing group member specified");
		}
		var iAutoExpandGroupsToLevel = this._getGroupIdLevel(sGroupId) + iNumberOfExpandedLevels + 1;
		var aGroupIdComponents_Missing = that._getGroupIdComponents(oGroupExpansionFirstMissingMember.groupId_Missing);
		var iGroupIdLevel_Missing = aGroupIdComponents_Missing.length;
		var aFilterArray = prepareLevelFilterExpressions(oGroupExpansionFirstMissingMember, iAutoExpandGroupsToLevel);
		var sGroupIdAtLevel;

		for (var iLevel = 1; iLevel <= iAutoExpandGroupsToLevel; iLevel++) {
			var iStartIndex;
			// determine start index
			if (iLevel >= iGroupIdLevel_Missing + 2) {
				iStartIndex = 0;
				sGroupIdAtLevel = undefined;
			} else if (iLevel == iGroupIdLevel_Missing + 1) {
				iStartIndex = oGroupExpansionFirstMissingMember.startIndex_Missing;
				sGroupIdAtLevel = oGroupExpansionFirstMissingMember.groupId_Missing;
			} else if (iGroupIdLevel_Missing > 0) {
				if (iLevel == iGroupIdLevel_Missing) {
					sGroupIdAtLevel = oGroupExpansionFirstMissingMember.groupId_Missing;
				} else {
					sGroupIdAtLevel = this._getGroupIdAncestors(oGroupExpansionFirstMissingMember.groupId_Missing, -(iGroupIdLevel_Missing - iLevel))[0];
				}
				var sGroupIdAtParentLevel = this._getGroupIdAncestors(oGroupExpansionFirstMissingMember.groupId_Missing, -(iGroupIdLevel_Missing - iLevel + 1))[0];
				if (!sGroupIdAtParentLevel) {
					oLogger.fatal("failed to determine group id at parent level; group ID = " + sGroupId + ", level = " + iLevel);
				}
				iStartIndex = this._findKeyIndex(sGroupIdAtParentLevel, this.mEntityKey[sGroupIdAtLevel]);
				if (iStartIndex == -1) {
					oLogger.fatal("failed to determine position of value " + sGroupIdAtLevel + " in group " + sGroupIdAtParentLevel);
				}
				sGroupIdAtLevel = sGroupIdAtParentLevel;
				iStartIndex++; // point to first missing position
			}

			// determine other parameters of the request
			var iLengthForLevel = iLength > iLevel ? Math.ceil((iLength - iLevel) / (iAutoExpandGroupsToLevel - iLevel + 1)) : iLength;
			var oLevelFilter = aFilterArray[iLevel - 1];

			if (this.bUseAcceleratedAutoExpand) {
				var oLevelMembersRequestDetails = prepareLevelMembersQueryRequest(AnalyticalBinding._requestType.levelMembersQuery, sGroupId,
						iLevel, oLevelFilter, iStartIndex, iLengthForLevel, false, oLevelFilter == null ? true : false); // rem: bUseStartIndexForSkip==false, because it is encoded in the filter condition
				oLevelMembersRequestDetails.sGroupId_Missing_AtLevel = sGroupIdAtLevel; // also remember group ID at the current level; needed for processing responses
				oLevelMembersRequestDetails.sRequestId = this._getRequestId(AnalyticalBinding._requestType.levelMembersQuery, { groupId: sGroupId, level: iLevel });
				aGroupMembersAutoExpansionRequestDetails.push(oLevelMembersRequestDetails);
				aRequestId.push(oLevelMembersRequestDetails.sRequestId);
			} else if (oLevelFilter && oLevelFilter.aFilters.length > 0) {
				if (!oLevelFilter._bMultiFilter || oLevelFilter.bAnd) {
					oLogger.fatal("level filter in wrong shape; cannot break it up");
				}
				for (var i = 0; i < oLevelFilter.aFilters.length; i++) { // break up level filter into its tuple filters combined with logical OR
					var oTupleFilter = oLevelFilter.aFilters[i];
					var oLevelMembersRequestDetails2 = prepareLevelMembersQueryRequest(AnalyticalBinding._requestType.levelMembersQuery, sGroupId,
							iLevel, oTupleFilter, iStartIndex, iLengthForLevel, false, oLevelFilter == null ? true : false); // rem: bUseStartIndexForSkip==false, because it is encoded in the filter condition
					oLevelMembersRequestDetails2.sGroupId_Missing_AtLevel = sGroupIdAtLevel; // also remember group ID at the current level; needed for processing responses
					oLevelMembersRequestDetails2.sRequestId = this._getRequestId(AnalyticalBinding._requestType.levelMembersQuery, { groupId: sGroupId, level: iLevel, tupleIndex: i });
					aGroupMembersAutoExpansionRequestDetails.push(oLevelMembersRequestDetails2);
					aRequestId.push(oLevelMembersRequestDetails2.sRequestId);
				}
			} else { // no level filter given, so no need to break up anything, hence a single request is sufficient for this level
				var oLevelMembersRequestDetails3 = prepareLevelMembersQueryRequest(AnalyticalBinding._requestType.levelMembersQuery, sGroupId,
						iLevel, null /*oLevelFilter*/, iStartIndex, iLengthForLevel, false, oLevelFilter == null ? true : false); // rem: bUseStartIndexForSkip==false, because it is encoded in the filter condition
				oLevelMembersRequestDetails3.sGroupId_Missing_AtLevel = sGroupIdAtLevel; // also remember group ID at the current level; needed for processing responses
				oLevelMembersRequestDetails3.sRequestId = this._getRequestId(AnalyticalBinding._requestType.levelMembersQuery, { groupId: sGroupId, level: iLevel });
				aGroupMembersAutoExpansionRequestDetails.push(oLevelMembersRequestDetails3);
				aRequestId.push(oLevelMembersRequestDetails3.sRequestId);
			}
		}
		return {
			iRequestType : iRequestType,
			aRequestId : aRequestId,
			aGroupMembersAutoExpansionRequestDetails : aGroupMembersAutoExpansionRequestDetails,
			sGroupId : sGroupId,
			iLength : iLength
		};
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._prepareReloadMeasurePropertiesQueryRequest = function(iRequestType, oGroupMembersRequestDetails, oMultiUnitRepresentative) {
		// build OData request based on given request details

		// (1) set up analytical OData request object
		var oAnalyticalQueryRequest = new odata4analytics.QueryResultRequest(this.oAnalyticalQueryResult);
		oAnalyticalQueryRequest.setResourcePath(this._getResourcePath());
		oAnalyticalQueryRequest.getSortExpression().clear();

		// (2) set aggregation level
		var aAggregationLevel = oGroupMembersRequestDetails.aAggregationLevel;
		oAnalyticalQueryRequest.setAggregationLevel(aAggregationLevel);

		var bIsLeafGroupsRequest = oGroupMembersRequestDetails.bIsLeafGroupsRequest;

		// (3) set filter
		var oFilterExpression = oAnalyticalQueryRequest.getFilterExpression();
		oFilterExpression.clear();
		if (this.aApplicationFilter) {
			oFilterExpression.addUI5FilterConditions(this.aApplicationFilter);
		}
		if (this.aControlFilter) {
			oFilterExpression.addUI5FilterConditions(this.aControlFilter);
		}
			// add conditions for aggregated dimension key
		var aAggregationDimensionKeyFilter = [];
		for (var i = 0; i < aAggregationLevel.length; i++) {
			var oFilter = new Filter(aAggregationLevel[i], FilterOperator.EQ, oMultiUnitRepresentative.oEntry[aAggregationLevel[i]]);
			aAggregationDimensionKeyFilter.push(oFilter);
		}
		oFilterExpression.addUI5FilterConditions(aAggregationDimensionKeyFilter);

		// (4) set measures as requested per column
		var bIncludeRawValue;
		var bIncludeFormattedValue;
		var bIncludeUnitProperty;
		var oMeasureDetails;

		var aSelectedUnitPropertyName = [];

		// consider only those mentioned in oMultiUnitRepresentative.aReloadMeasurePropertyName
		oAnalyticalQueryRequest.setMeasures(oMultiUnitRepresentative.aReloadMeasurePropertyName);

		for ( var sMeasureName in this.oMeasureDetailsSet) {
			oMeasureDetails = this.oMeasureDetailsSet[sMeasureName];
			if (!oMultiUnitRepresentative.aReloadMeasurePropertyName || oMultiUnitRepresentative.aReloadMeasurePropertyName.indexOf(oMeasureDetails.name) == -1) {
				continue;
			}
			if (!bIsLeafGroupsRequest && this._isSkippingTotalForMeasure(sMeasureName)) {
				bIncludeRawValue = false;
				bIncludeFormattedValue = false;
				bIncludeUnitProperty = false;
			} else {
				bIncludeRawValue = (oMeasureDetails.rawValuePropertyName != undefined);
				bIncludeFormattedValue = (oMeasureDetails.formattedValuePropertyName != undefined);
				bIncludeUnitProperty = (oMeasureDetails.unitPropertyName != undefined);
				if (bIncludeUnitProperty) {
					// remember unit property together with using measure raw value property for response analysis in success handler
					if (aSelectedUnitPropertyName.indexOf(oMeasureDetails.unitPropertyName) == -1) {
						aSelectedUnitPropertyName.push(oMeasureDetails.unitPropertyName);
					}
				}
			}
			oAnalyticalQueryRequest.includeMeasureRawFormattedValueUnit(oMeasureDetails.name, bIncludeRawValue,
					bIncludeFormattedValue, bIncludeUnitProperty);
		}
		// exclude those unit properties from the selected that are included in the current aggregation level
		for ( var j in aAggregationLevel) {
			var iMatchingIndex;
			if ((iMatchingIndex = aSelectedUnitPropertyName.indexOf(aAggregationLevel[j])) != -1) {
				aSelectedUnitPropertyName.splice(iMatchingIndex, 1);
			}
		}

		return {
			iRequestType : iRequestType,
			sRequestId : this._getRequestId(AnalyticalBinding._requestType.reloadMeasuresQuery, {multiUnitEntryKey: this.oModel.getKey(oMultiUnitRepresentative.oEntry)}),
			oAnalyticalQueryRequest : oAnalyticalQueryRequest,
			aSelectedUnitPropertyName : aSelectedUnitPropertyName,
			aAggregationLevel : aAggregationLevel,
			oMultiUnitRepresentative : oMultiUnitRepresentative
		};

	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._prepareGroupMembersAutoExpansionRequestIds = function(sGroupId, iNumberOfExpandedLevels) {
		// intention of this function is to encapsulate the knowledge about steps to be taken
		// for creating request IDs for all relevant requests
		var iMinRequiredLevel = this._getGroupIdLevel(sGroupId) + 1;
		var iAutoExpandGroupsToLevel = iMinRequiredLevel + iNumberOfExpandedLevels;
		var aRequestId = [];
		for (var iLevel = iMinRequiredLevel; iLevel <= iAutoExpandGroupsToLevel; iLevel++) {
			aRequestId.push(this._getRequestId(AnalyticalBinding._requestType.levelMembersQuery, { groupId: sGroupId, level: iLevel }));
		}
		return aRequestId;
	};

	/**
	 * @param {object} oAnalyticalQueryRequest
	 * @param {boolean} bAddAdditionalSelects
	 *   Whether additional selects, computed from select binding parameter, shall be added to the
	 *   $select query option.
	 * @param {object} mParameters
	 * @private
	 */
	AnalyticalBinding.prototype._getQueryODataRequestOptions = function(oAnalyticalQueryRequest,
			bAddAdditionalSelects, mParameters) {
		var i;

		mParameters = mParameters || {};

		try {
			oAnalyticalQueryRequest.getFilterExpression().checkValidity(); // fails if false
		} catch (e) {
			oLogger.fatal("filter expression is not valid", e.toString());
			return undefined;
		}

		var sSelect = oAnalyticalQueryRequest.getURIQueryOptionValue("$select");
		var sFilter = oAnalyticalQueryRequest.getURIQueryOptionValue("$filter");
		var sOrderBy = oAnalyticalQueryRequest.getURIQueryOptionValue("$orderby");
		var sSkip = oAnalyticalQueryRequest.getURIQueryOptionValue("$skip");
		var sTop = oAnalyticalQueryRequest.getURIQueryOptionValue("$top");
		var sInlineCount = oAnalyticalQueryRequest.getURIQueryOptionValue("$inlinecount");

		if (bAddAdditionalSelects && this.aAdditionalSelects.length > 0) {
			sSelect = (sSelect ? sSelect.split(",") : [])
				.concat(this.aAdditionalSelects).join(",");
			const oAdditionalProperties = {};
			this.aAdditionalSelects.forEach((sAdditionalSelect) => {
				oAdditionalProperties[sAdditionalSelect] = true;
			});
			const sAdditionalOrderBy = oAnalyticalQueryRequest.getSortExpression()
				.getURIOrderByOptionValue(oAdditionalProperties);
			if (sAdditionalOrderBy) {
				sOrderBy = sOrderBy ? sOrderBy + "," + sAdditionalOrderBy : sAdditionalOrderBy;
			}
		}

		if (this.mParameters && this.mParameters["filter"]) {
			if (sFilter === null) {
				sFilter = this.mParameters["filter"];
			} else {
				sFilter += "and (" + this.mParameters["filter"] + ")";
			}
		}

		// construct OData request option parameters
		var aParam = [];
		if (sSelect !== null) {
			aParam.push("$select=" + sSelect);
		}
		if (sFilter !== null) {
			aParam.push("$filter=" + sFilter);
		}
		if (sOrderBy !== null) {
			aParam.push("$orderby=" + sOrderBy);
		}
		if (sSkip !== null) {
			aParam.push("$skip=" + sSkip);
		}
		if (sTop !== null) {
			aParam.push("$top=" + sTop);
		}
		if (sInlineCount !== null) {
			aParam.push("$inlinecount=" + sInlineCount);
		}

		//encode if necessary
		if (mParameters.encode === true) {
			for (i = 0; i < aParam.length; i++) {
				aParam[i] = aParam[i].replace(/\ /g, "%20");
			}
		}

		return aParam;
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._executeBatchRequest = function(aRequestDetails) {
		var iCurrentAnalyticalInfoVersion = this.iAnalyticalInfoVersionNumber,
			iRequestHandleId,
			that = this;

		var aBatchQueryRequest = [], aExecutedRequestDetails = [];

		function triggerDataReceived() {
			that.fireDataReceived({__simulateAsyncAnalyticalBinding: true});
		}

		// Batch Response Handling for ODataModel V2
		var oResponseCollector = new BatchResponseCollector();
		//Sucess handler called by the ODataModel for each batch sub-request
		function fnSingleBatchSucess(oData, oResponse) {
			oResponseCollector.success(oResponse);
		}
		//same as with success
		function fnSingleBatchError(oData, oResponse) {
			oResponseCollector.error(oResponse || oData);
		}

		// BCP: 1770008178

		// Legacy Support:
		// We set the bNeedsUpdate flag to "true" if ALL request details are empty.
		// This happens when the initial analyticalInfo is empty and is not set correctly
		// before the control calls getRootContexts etc.
		// If at a later point the analyticalInfo is correctly set AND the bNeedsUpdate flag is still true
		// we falsly force a change event in checkUpdate --> this might lead to an unnecessary re-rendering of the control.

		// In case we have at least 1 valid request (including measures and/or dimensions)
		// we set the bNeedsUpdate flag to false, because the update flag is set to true ANYWAY during the response-processing.
		this.bNeedsUpdate = true;
		for (var iDetail = 0; iDetail < aRequestDetails.length; iDetail++) {
			var oDetail = aRequestDetails[iDetail];
			if (oDetail.aAggregationLevel && oDetail.aAggregationLevel.length > 0) {
				this.bNeedsUpdate = false;
			}
		}

		//create sub-requests for all defined requestDetails
		for (var i = -1, oRequestDetails; (oRequestDetails = aRequestDetails[++i]) !== undefined;) {
			var oAnalyticalQueryRequest = oRequestDetails.oAnalyticalQueryRequest, sGroupId = oRequestDetails.sGroupId;

			if (oAnalyticalQueryRequest.getURIQueryOptionValue("$select") == null) {
				// no dimensions and no measures requested, so create an artificial empty root context (synonym for the regular "/")
				this.fireDataRequested({__simulateAsyncAnalyticalBinding: true}); // simulate the async behavior

				// perform all steps of fct fnSuccess (w/o calling it, b/c its argument is some data object and not a context
				sGroupId = null;
				this.mServiceLength[sGroupId] = this.mLength[sGroupId] = 1;
				this.mServiceFinalLength[sGroupId] = true;
				this._setServiceKey(this._getKeyIndexMapping(sGroupId, 0), AnalyticalBinding._artificialRootContextGroupId);
				// BCP: 1770008178, see comment above
				// this.bNeedsUpdate = true;
				// simulate the async behavior, dataRequested and dataReceived have to be fired in pairs
				setTimeout(triggerDataReceived);

				this.bArtificalRootContext = true;
				// return immediately - no need to load data...
				continue;
			}
			var sPath = oAnalyticalQueryRequest.getURIToQueryResultEntries();

			//ensure absolute path if no context is set
			if (!this.oContext && sPath[0] !== "/") {
				sPath = "/" + sPath;
			}
			/*
			 * This might be needed, as soon as the AnalyticalBinding can handle relative binding
			 * @see odata4analytics -> getRequestURi... and _getResourcePath -> enforces always an absolute path
			 * else if (this.oContext && sPath[0] === "/") {
				sPath = sPath.substring(1);
			}*/
			if (!this._isRequestPending(oRequestDetails.sRequestId)) {
				/* side note: the check for a pending request is repeated at this point (first check occurs in _getContextsForParentGroupId),
				   because the logic executed for a call to the binding API may yield to identical OData requests in a single batch.
				   Since _processRequestQueue, and hence also _executeBatchRequest are executed asynchronously, this method is the first place
				   where the set of all operations included in the batch request becomes known and this condition can be checked. */
				this._registerNewRequest(oRequestDetails.sRequestId);

				if (this.iModelVersion === 2) {
					var aUrlParameters = this._getQueryODataRequestOptions(oAnalyticalQueryRequest,
							oRequestDetails.bIsLeafGroupsRequest,  {encode: true});
					if (this.sCustomParams) {
						aUrlParameters.push(this.sCustomParams);
					}
					//V2 - use read()
					var oRequestHandle = this.oModel.read(sPath.replace(/\ /g, "%20"), {
						success: fnSingleBatchSucess, // relays the success to the BatchResponseCollector
						error: fnSingleBatchError,
						context: this.oContext,
						urlParameters: aUrlParameters
					});
					aBatchQueryRequest.push(oRequestHandle);
				}
				aExecutedRequestDetails.push(oRequestDetails);
			}
		}

		//var iRequestHandleId = this._getIdForNewRequestHandle();
		if (aBatchQueryRequest.length > 0) {
			oLogger.debug("AnalyticalBinding: executing batch request with " + aExecutedRequestDetails.length + " operations");

			var oBatchRequestHandle;

			iRequestHandleId = this._getIdForNewRequestHandle();

			// fire events to indicate sending of a new request
			this.fireDataRequested();

			if (this.iModelVersion === 2) {
				// fake a uniform request handle, so the original code works with the v2 ODataModel
				// the v2 model does not return an overall request handle for the batch request
				oBatchRequestHandle = {
					abort: function() {
						//relay the abort call to all sub-requests created by v2.ODataModel.read()
						for (var iRequestIndex = 0; iRequestIndex < aBatchQueryRequest.length; iRequestIndex++) {
							aBatchQueryRequest[iRequestIndex].abort();
						}
					}
				};
				// The response collector keeps track of all returned requests and
				// calls the original success/error handlers after all batch responses have returned
				oResponseCollector.setup({
					executedRequests: aExecutedRequestDetails,
					binding: this,
					success: fnSuccess,
					error: fnError
				});
			}

			this._registerNewRequestHandle(iRequestHandleId, oBatchRequestHandle);
		}

		function fnSuccess(oData, response) {
			that._deregisterHandleOfCompletedRequest(iRequestHandleId);

			if (aExecutedRequestDetails.length != oData.__batchResponses.length) {
				oLogger.fatal("assertion failed: received " + oData.__batchResponses.length
						+ " responses for " + aExecutedRequestDetails.length + " read operations in the batch request");
			}

			if (iCurrentAnalyticalInfoVersion != that.iAnalyticalInfoVersionNumber) {
				// discard responses for outdated analytical infos
				for (var j = 0; j < aExecutedRequestDetails.length; j++) {
					var sRequestId = aExecutedRequestDetails[j].sRequestId;
					if (sRequestId !== undefined) {
						that._deregisterCompletedRequest(sRequestId);
						that._cleanupGroupingForCompletedRequest(sRequestId);
					}
				}
				that.fireDataReceived({data: []});
				return;
			}

			var iEmptyResults = 0;
			for (var k = 0; k < oData.__batchResponses.length; k++) {
				if (oData.__batchResponses[k].data != undefined) {
					//check for empty results
					if (oData.__batchResponses[k].data.results.length == 0) {
						iEmptyResults++;
					}
					switch (aExecutedRequestDetails[k].iRequestType) {
						case AnalyticalBinding._requestType.groupMembersQuery:
							that._processGroupMembersQueryResponse(aExecutedRequestDetails[k], oData.__batchResponses[k].data);
							break;
						case AnalyticalBinding._requestType.totalSizeQuery:
							that._processTotalSizeQueryResponse(aExecutedRequestDetails[k], oData.__batchResponses[k].data);
							break;
						case AnalyticalBinding._requestType.levelMembersQuery:
							that._processLevelMembersQueryResponse(aExecutedRequestDetails[k], oData.__batchResponses[k].data);
							break;
						case AnalyticalBinding._requestType.reloadMeasuresQuery:
							that._processReloadMeasurePropertiesQueryResponse(aExecutedRequestDetails[k], oData.__batchResponses[k].data);
							break;
						default:
							oLogger.fatal("invalid request type " + aExecutedRequestDetails[k].iRequestType);
							continue;
					}
				}
				that._deregisterCompletedRequest(aExecutedRequestDetails[k].sRequestId);
				that._cleanupGroupingForCompletedRequest(aExecutedRequestDetails[k].sRequestId);
			}

			// if all results are empty and the request was an auto-expand request, the length has to be set to final and 0
			if (that.mParameters && that.mParameters.numberOfExpandedLevels > 0) {
				if (iEmptyResults == oData.__batchResponses.length) {
					that.mLength["/"] = 0;
					that.mFinalLength["/"] = true;
				}
			}

			// raise event here since there is no separate fnCompleted handler for batch requests
			that.fireDataReceived({data: oData});
		}

		function fnError (oError) {
			// in case the error is triggered by an aborted request, don't cleanup the handle queue, as it is already cleaned-up by the abort call.
			if (oError && oError.statusText != "abort") {
				that._deregisterHandleOfCompletedRequest(iRequestHandleId);
				for (var j = -1, oExecutedRequestDetails; (oExecutedRequestDetails = aExecutedRequestDetails[++j]) !== undefined;) {
					that._deregisterCompletedRequest(oExecutedRequestDetails.sRequestId);
					that._cleanupGroupingForCompletedRequest(oExecutedRequestDetails.sRequestId);
				}
			}
			if (iCurrentAnalyticalInfoVersion != that.iAnalyticalInfoVersionNumber) {
				// discard responses for outdated analytical infos but fire dataReceived event
				// because it is expected that dataRequested and dataReceived events are sent as pairs
				that.fireDataReceived();
				return;
			}

			// fire event to indicate completion of request
			that.oModel.fireRequestCompleted({url : "", type : "POST", async : true,
				info: "",
				infoObject : {},
				success: false,
				errorobject: oError});

			that.fireDataReceived();
		}
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._executeQueryRequest = function(oRequestDetails) {
		if (oRequestDetails.iRequestType == AnalyticalBinding._requestType.groupMembersAutoExpansionQuery) {
			// handle auto-expanding requests that are actually a bundle of multiple requests, one per level
			for (var i = -1, oAnalyticalQueryRequest2; (oAnalyticalQueryRequest2 = oRequestDetails.aGroupMembersAutoExpansionRequestDetails[++i]) !== undefined; ) {
				this._executeQueryRequest(oAnalyticalQueryRequest2);
			}
			return;
		}

		var iCurrentAnalyticalInfoVersion = this.iAnalyticalInfoVersionNumber;

		var oAnalyticalQueryRequest = oRequestDetails.oAnalyticalQueryRequest, sGroupId = oRequestDetails.sGroupId;

		// determine relevant request query options
		var sPath = oAnalyticalQueryRequest.getURIToQueryResultEntitySet();
		var aParam = this._getQueryODataRequestOptions(oAnalyticalQueryRequest,
				oRequestDetails.bIsLeafGroupsRequest);

		if (!aParam) {
			// parameters could not be determined correctly
			return;
		}

		var that = this;

		if (oAnalyticalQueryRequest.getURIQueryOptionValue("$select") == null) {
			// no dimensions and no measures requested, so create an artificial empty root context (synonym for the regular "/")
			this.fireDataRequested({__simulateAsyncAnalyticalBinding: true}); // simulate the async behavior

			// perform all steps of fct fnSuccess (w/o calling it, b/c its argument is some data object and not a context
			sGroupId = null;
			this.mServiceLength[sGroupId] = this.mLength[sGroupId] = 1;
			this.mServiceFinalLength[sGroupId] = true;
			this._setServiceKey(this._getKeyIndexMapping(sGroupId, 0), AnalyticalBinding._artificialRootContextGroupId);
			this.bNeedsUpdate = true;
			// simulate the async behavior for the root context in case of having no sums
			setTimeout(function() {
				if (that._cleanupGroupingForCompletedRequest(oRequestDetails.sRequestId)) {
					that.fireDataReceived({__simulateAsyncAnalyticalBinding: true});
				}
			});
			this.bArtificalRootContext = true;
			// return immediately - no need to load data...
			return;
		}
		this._registerNewRequest(oRequestDetails.sRequestId);
		// execute the request and use the metadata if available
		this.fireDataRequested();
		for (var j = 0; j < aParam.length; j++) {
			aParam[j] = aParam[j].replace(/\ /g, "%20");
		}
		oLogger.debug("AnalyticalBinding: executing query request");

		var iRequestHandleId = this._getIdForNewRequestHandle();
		if (this.iModelVersion === 2) {
			if (this.sCustomParams) {
				aParam.push(this.sCustomParams);
			}
			var oRequestHandle = this.oModel.read(sPath.replace(/ /g, "%20"), {
				success: fnSuccess,
				error: fnError,
				context: this.oContext,
				urlParameters: aParam
			});
			//the handle has to be registered here, because the V2 model does not support an fnHandleUpdate callback anymore
			that._registerNewRequestHandle(iRequestHandleId, oRequestHandle);
		}

		function fnSuccess(oData) {
			that._deregisterHandleOfCompletedRequest(iRequestHandleId);

			if (iCurrentAnalyticalInfoVersion != that.iAnalyticalInfoVersionNumber) {
				// discard responses for outdated analytical infos
				that._deregisterCompletedRequest(oRequestDetails.sRequestId);
				return;
			}
			switch (oRequestDetails.iRequestType) {
				case AnalyticalBinding._requestType.groupMembersQuery:
					that._processGroupMembersQueryResponse(oRequestDetails, oData);
					break;
				case AnalyticalBinding._requestType.totalSizeQuery:
					that._processTotalSizeQueryResponse(oRequestDetails, oData);
					break;
				case AnalyticalBinding._requestType.levelMembersQuery:
					that._processLevelMembersQueryResponse(oRequestDetails, oData);
					break;
				case AnalyticalBinding._requestType.reloadMeasuresQuery:
					that._processReloadMeasurePropertiesQueryResponse(oRequestDetails, oData);
					break;
				default:
					oLogger.fatal("invalid request type " + oRequestDetails.iRequestType);
					break;
			}
			that._deregisterCompletedRequest(oRequestDetails.sRequestId);

			// with ODataModel V2, the completed function is not called by the model anymore
			// the correct moment to clean up is after the success handler
			// the error handler takes care of this itself
			if (that.iModelVersion === 2) {
				fnCompleted(oData);
			}
		}

		function fnCompleted(oData) {
			if (iCurrentAnalyticalInfoVersion != that.iAnalyticalInfoVersionNumber) {
				// discard responses for outdated analytical infos
				return;
			}
			if (that._cleanupGroupingForCompletedRequest(oRequestDetails.sRequestId)) {
				that.fireDataReceived({data: oData});
			}
		}

		function fnError(oError) {
			// in case the error is triggered by an aborted request, don't cleanup the request-handle queue, as it is already cleaned-up by the abort call
			if (oError && oError.statusText == "abort") {
				that.fireDataReceived();
				return;
			}

			that._deregisterHandleOfCompletedRequest(iRequestHandleId);
			that._deregisterCompletedRequest(oRequestDetails.sRequestId);
			that._cleanupGroupingForCompletedRequest(oRequestDetails.sRequestId);

			if (iCurrentAnalyticalInfoVersion != that.iAnalyticalInfoVersionNumber) {
				// discard responses for outdated analytical infos
				return;
			}
			that.fireDataReceived();
		}
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._abortAllPendingRequests = function() {
		this._abortAllPendingRequestsByHandle();
		this._clearAllPendingRequests();
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._processGroupMembersQueryResponse = function(oRequestDetails, oData) {
		var sEntryGroupId,
			sGroupId = oRequestDetails.sGroupId,
			bHasSorters = this.aSorter.length > 0, // this.aSorter is always an array
			aSelectedUnitPropertyName = oRequestDetails.aSelectedUnitPropertyName,
			aAggregationLevel = oRequestDetails.aAggregationLevel,
			iStartIndex = oRequestDetails.oKeyIndexMapping.iIndex,
			iServiceStartIndex = oRequestDetails.oKeyIndexMapping.iServiceKeyIndex,
			iLength = oRequestDetails.iLength,
			oKeyIndexMapping = oRequestDetails.oKeyIndexMapping,
			iGroupMembersLevel = sGroupId == null ? 0 : this._getGroupIdLevel(sGroupId) + 1,
			bUnitCheckRequired = (aSelectedUnitPropertyName.length > 0),
			sPreviousEntryDimensionKeyString, sDimensionKeyString,
			iFirstMatchingEntryIndex,
			iDiscardedEntriesCount = 0,
			bLastServiceKeyWasNew,
			oReloadMeasuresRequestDetails, aReloadMeasuresRequestDetails = [];

		// entry at start position may be a multi-unit entry w.r.t. entry at position before
		// prepare merging with this preceding entry
		var iODataResultsLength = oData.results.length;

		if (sGroupId === null && iODataResultsLength > 1 && this._canApplySortersToGroups()) {
			this._warnNoSortingOfGroups(bHasSorters ? "binding is refreshed" : undefined);
			if (bHasSorters) {
				// do refresh after _executeQueryRequest is finished to avoid an error while
				// cleaning the pending request queue (see _deregisterCompletedRequest)
				setTimeout(this.refresh.bind(this), 0);
				return;
			}
		}

		var aPreviousEntryServiceKey = this._getServiceKeys(sGroupId, oKeyIndexMapping.iIndex - 1);
		sPreviousEntryDimensionKeyString = undefined;
		if (aPreviousEntryServiceKey && aPreviousEntryServiceKey.length > 0) { // copy previous service keys to results for homogeneous processing below
			for (var i = 0, len = aPreviousEntryServiceKey.length; i < len; i++) {
				oData.results[i - len] = this.oModel.getObject("/" + aPreviousEntryServiceKey[i]);
			}
			var oEntry2 = oData.results[-aPreviousEntryServiceKey.length];
			sPreviousEntryDimensionKeyString = "";
			for (var j = 0; j < aAggregationLevel.length; j++) {
				sPreviousEntryDimensionKeyString +=
					AnalyticalBinding._getDimensionValue(oEntry2[aAggregationLevel[j]]) + "|";
			}
		}

		// special case: previous entry gets merged with the first loaded entry/ies
		// if there was a single preceding entity that was not yet a multi-unit entry, count it!
		// (on the opposite, if there were multiple, hence multi-unit entries, they were counted already when they got loaded)
		// Therefore, in order to count it, the bLastServiceKeyWasNew flag is set accordingly
		bLastServiceKeyWasNew = aPreviousEntryServiceKey && aPreviousEntryServiceKey.length == 1;

		// process loaded data, collect contexts and handle multi-unit occurrences; oKeyIndexMapping points to the current insert positions for key indexes and service keys
		for (var h = 0; h < iODataResultsLength; h++) {
			var oEntry = oData.results[h];

			if (bUnitCheckRequired) {
				// perform check to detect multiple returned entries for a single group level instance; duplicates are detected by having the same dimension keys
				sDimensionKeyString = "";
				for (var g = 0; g < aAggregationLevel.length; g++) {
					sDimensionKeyString += AnalyticalBinding._getDimensionValue(oEntry[aAggregationLevel[g]]) + "|";
				}
				if (sPreviousEntryDimensionKeyString == sDimensionKeyString) {
					this._warnNoSortingOfGroups();
					if (iFirstMatchingEntryIndex === undefined) {
						if (h == 0) { // adjust indexes such that the entry at position before is covered
							iFirstMatchingEntryIndex = -aPreviousEntryServiceKey.length;
							oKeyIndexMapping.iServiceKeyIndex -= aPreviousEntryServiceKey.length - 1; // must point to the second entry with the same dimension key
						} else {
							iFirstMatchingEntryIndex = h - 1;
						}
					}
					var iDeviatingUnitPropertyNameIndex = -1, oPreviousEntry = oData.results[h - 1];
					for (var k = 0; k < aSelectedUnitPropertyName.length; k++) {
						if (oPreviousEntry[aSelectedUnitPropertyName[k]] != oEntry[aSelectedUnitPropertyName[k]]) {
							iDeviatingUnitPropertyNameIndex = k; // aggregating dimensions are all the same, entries only differ in currency
							break;
						}
					}
					if (iDeviatingUnitPropertyNameIndex == -1) {
						oLogger.fatal("assertion failed: no deviating units found for result entries " + (h - 1) + " and " + h, null, null, createSupportInfo(this, "NO_DEVIATING_UNITS"));
					}
				}
				if ((sPreviousEntryDimensionKeyString != sDimensionKeyString || h == iODataResultsLength - 1)
						&& iFirstMatchingEntryIndex !== undefined) { // after sequence of identical entries or if processing the last result entry (the set iFirstMatchingEntryIndex indicates the multi-unit case)
					// collect all related result entries for this multi-unit entity and set the keys
					var aMultiUnitEntry = [];
					for (var l = iFirstMatchingEntryIndex; l < h; l++) {
						aMultiUnitEntry.push(oData.results[l]);
					}
					if (sPreviousEntryDimensionKeyString == sDimensionKeyString) {
						aMultiUnitEntry.push(oData.results[h]);
					}
					var aDeviatingUnitPropertyName = AnalyticalBinding._getDeviatingUnitPropertyNames(
							aSelectedUnitPropertyName, aMultiUnitEntry);
					// create a multi-unit repr. (includes a corresponding multi-unit entity)
					var oMultiUnitRepresentative = this._createMultiUnitRepresentativeEntry(sGroupId, oData.results[iFirstMatchingEntryIndex], aSelectedUnitPropertyName, aDeviatingUnitPropertyName, oRequestDetails.bIsFlatListRequest);
					if (oMultiUnitRepresentative.aReloadMeasurePropertyName.length > 0) {
						oReloadMeasuresRequestDetails = this._prepareReloadMeasurePropertiesQueryRequest(AnalyticalBinding._requestType.reloadMeasuresQuery, oRequestDetails, oMultiUnitRepresentative);
						// only schedule reloadMeasure requests if there is something to select -> it might be that some measure could be reloaded, but the column
						// might not be totaled (yet might be visible/inResult)
						// BCP: 1570786546
						if (oReloadMeasuresRequestDetails.oAnalyticalQueryRequest && oReloadMeasuresRequestDetails.oAnalyticalQueryRequest.getURIQueryOptionValue("$select") != null) {
							aReloadMeasuresRequestDetails.push(oReloadMeasuresRequestDetails);
						}
					}
					var iNewServiceKeyCount = this._setAdjacentMultiUnitKeys(oKeyIndexMapping, oMultiUnitRepresentative, aMultiUnitEntry);

					// update number of discarded entities
					var iMultiUnitEntryDiscardedEntriesCount;
					if (oMultiUnitRepresentative.bIsNewEntry) {
						iMultiUnitEntryDiscardedEntriesCount = aMultiUnitEntry.length - 1;
					} else {
						iMultiUnitEntryDiscardedEntriesCount = iNewServiceKeyCount;
					}
					if (bLastServiceKeyWasNew) {
						bLastServiceKeyWasNew = false;
					}
					if (iMultiUnitEntryDiscardedEntriesCount < 0) {
						oLogger.fatal("assertion failed: iDiscardedEntriesCount must be non-negative");
					}
					iDiscardedEntriesCount += iMultiUnitEntryDiscardedEntriesCount;
					// adjust mEntityKey for detected and handled multi-unit situation
					var sMultiUnitKey = this.oModel._getKey(oMultiUnitRepresentative.oEntry);
					var oMultiUnitContext = this.oModel.getContext('/' + sMultiUnitKey);
					this._getGroupIdFromContext(oMultiUnitContext, iGroupMembersLevel);
					this.mEntityKey[sEntryGroupId] = sMultiUnitKey;

					// reset multi-unit indicator
					iFirstMatchingEntryIndex = undefined;

					// add current entry if it has different key combination
					if (sPreviousEntryDimensionKeyString != sDimensionKeyString) {
						bLastServiceKeyWasNew = this._setServiceKey(oKeyIndexMapping, this.oModel._getKey(oEntry));
					}
				} else if (sPreviousEntryDimensionKeyString != sDimensionKeyString) {
					bLastServiceKeyWasNew = this._setServiceKey(oKeyIndexMapping, this.oModel._getKey(oEntry));
				}
				sPreviousEntryDimensionKeyString = sDimensionKeyString;
			} else {
				this._setServiceKey(oKeyIndexMapping, this.oModel._getKey(oEntry));
			}

			// remember mapping between entry key and group Id
			if (!oRequestDetails.bIsLeafGroupsRequest) {
				var sLastEntryKey = this._getKey(sGroupId, oKeyIndexMapping.iIndex - 1);

				sEntryGroupId = this._getGroupIdFromContext(this.oModel.getContext('/' + sLastEntryKey), iGroupMembersLevel);
				this.mEntityKey[sEntryGroupId] = sLastEntryKey;
			}
		}
		// if any new requests have been created for reloading single-unit measures, execute and group them to get a single update event for them
		var aReloadMeasureRequestId = [];
		if (this.bReloadSingleUnitMeasures && aReloadMeasuresRequestDetails.length > 0) {
			if (this.bUseBatchRequests) {
				this.aBatchRequestQueue.push([AnalyticalBinding._requestType.reloadMeasuresQuery, aReloadMeasuresRequestDetails]);
				Promise.resolve().then(AnalyticalBinding.prototype._processRequestQueue.bind(this));
			} else {
				for (var q = 0; q < aReloadMeasuresRequestDetails.length; q++){
					var oReloadMeasuresRequestDetails2 = aReloadMeasuresRequestDetails[q];
					this._executeQueryRequest(oReloadMeasuresRequestDetails2);
				}
			}

			for (var p = 0; p < aReloadMeasuresRequestDetails.length; p++){
				var oReloadMeasuresRequestDetails3 = aReloadMeasuresRequestDetails[p];
				aReloadMeasureRequestId.push(oReloadMeasuresRequestDetails3.sRequestId);
			}
			this._considerRequestGrouping(aReloadMeasureRequestId);
		}

		// cleanup results entry array from added previous entry
		if (aPreviousEntryServiceKey && aPreviousEntryServiceKey.length > 0) {
			for (var r = 0, len2 = aPreviousEntryServiceKey.length; r < len2; r++) {
				delete oData.results[r - len2];
			}
		}

		// if unit check is required, then merge loaded data with already available data occuring directly after the new data
		if (bUnitCheckRequired) {
			iDiscardedEntriesCount += this._mergeLoadedKeyIndexWithSubsequentIndexes(oKeyIndexMapping, aAggregationLevel, aSelectedUnitPropertyName, oRequestDetails.bIsFlatListRequest);
		}

		// update group length
		if (!oRequestDetails.bAvoidLengthUpdate) {
			var bNewLengthSet = false;

			if (oData.__count) {
				this.mServiceLength[sGroupId] = parseInt(oData.__count);
				this.mLength[sGroupId] = this.mServiceLength[sGroupId] - iDiscardedEntriesCount;
				this.mFinalLength[sGroupId] = true;

				if (oRequestDetails.bIsFlatListRequest) {
					this.iTotalSize = this.mServiceLength[sGroupId];
				}
				bNewLengthSet = true;
			}

			// if we got data and the results + startindex is larger than the length we just apply this value to the length
			if (!(sGroupId in this.mServiceLength) || this.mServiceLength[sGroupId] < iServiceStartIndex + iODataResultsLength) {
				this.mServiceLength[sGroupId] = iServiceStartIndex + iODataResultsLength;
				this.mLength[sGroupId] = iStartIndex + iODataResultsLength - iDiscardedEntriesCount;
				this.mFinalLength[sGroupId] = false;
			}

			// if less entries are returned than have been requested set length accordingly
			if (iODataResultsLength < iLength || iLength === undefined) {
				this.mServiceLength[sGroupId] = iServiceStartIndex + iODataResultsLength;
				this.mLength[sGroupId] = iStartIndex + oKeyIndexMapping.iIndex - iStartIndex;
				this.mFinalLength[sGroupId] = true;
				bNewLengthSet = true;
			}

			// check if there are any results at all
			if (iODataResultsLength == 0) {
				this.mLength[sGroupId] = this.mServiceLength[sGroupId] = 0;
				this.mFinalLength[sGroupId] = true;
				bNewLengthSet = true;
			}

			if (!bNewLengthSet && this.mLength[sGroupId] !== undefined && iDiscardedEntriesCount > 0) {
				this.mLength[sGroupId] -= iDiscardedEntriesCount;
			}
		}

		this.bNeedsUpdate = true;

		if (iDiscardedEntriesCount > 0) { // update load factor if entries have been discarded

			// If all loaded entries have been discarded, we have the following situation:
			// the last multi-unit entry was previously loaded with another data page, and thus it can happen, that all response entries
			// will have to be discarded, since there already is a virtual multi-unit entry created.
			// In this case we keep the last known load-factor stable.
			if (oData.results.length - iDiscardedEntriesCount > 0) {
				this.aMultiUnitLoadFactor[aAggregationLevel.length] = oData.results.length / (oData.results.length - iDiscardedEntriesCount);
			}

			if (this.aMultiUnitLoadFactor[aAggregationLevel.length] < 1.5) { // avoid too small factors
				this.aMultiUnitLoadFactor[aAggregationLevel.length] = 2;
			}
		}
		// #TH
		oLogger.info("MultiUnit Situation in Group (" + sGroupId + "), discarded: " + iDiscardedEntriesCount + ", load-factor is now: " + this.aMultiUnitLoadFactor[aAggregationLevel.length]);


	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._processTotalSizeQueryResponse = function(oRequestDetails, oData) {
		if (oData.__count == undefined) {
			oLogger.fatal("missing entity count in query result");
			return;
		}
		this.iTotalSize = parseInt(oData.__count);
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._processLevelMembersQueryResponse = function(oRequestDetails, oData) {
		// local helper function to transform a block of entries in the level response to a response for a particular parent group
		var that = this;
		var sPreviousParentGroupId, aParentGroupODataResult;

		var processSingleGroupFromLevelSubset = function (bProcessFirstLoadedGroup, bIncompleteGroupMembersSet) {
			// transform the subset for processing as group members query response
			var oGroupMembersRequestDetails = {
				iRequestType : AnalyticalBinding._requestType.groupMembersQuery,
				sRequestId : that._getRequestId(AnalyticalBinding._requestType.groupMembersQuery, {groupId: sPreviousParentGroupId}),
				oAnalyticalQueryRequest : oRequestDetails.oAnalyticalQueryRequest,
				sGroupId : sPreviousParentGroupId,
				aSelectedUnitPropertyName : oRequestDetails.aSelectedUnitPropertyName,
				aAggregationLevel : oRequestDetails.aAggregationLevel,
				bIsFlatListRequest : oRequestDetails.bIsFlatListRequest,
				bIsLeafGroupsRequest : oRequestDetails.bIsLeafGroupsRequest,
				iStartIndex : bProcessFirstLoadedGroup ? oRequestDetails.iStartIndex : 0,
				iLength : oRequestDetails.iLength,
				bAvoidLengthUpdate : oRequestDetails.bAvoidLengthUpdate
			}; // note that the keyIndexMapping is still missing; added later after handling of special cases

			// special handling for the first group contained in this level load if it starts a new group
			if (bProcessFirstLoadedGroup
				&& oRequestDetails.iStartIndex > 0
				&& (oRequestDetails.sGroupId_Missing_AtLevel != oGroupMembersRequestDetails.sGroupId
						|| that._getKeys(oGroupMembersRequestDetails.sGroupId) === undefined)) {
				// pendant to bIncompleteGroupMembersSet: set the finalLength of the previous group
				var sParentGroupId = that._getParentGroupId(oGroupMembersRequestDetails.sGroupId);
				var iPositionInParentGroup = that._findKeyIndex(sParentGroupId, that.mEntityKey[oGroupMembersRequestDetails.sGroupId]);
				if (iPositionInParentGroup < 0) {
					oLogger.fatal("assertion failed: failed to determine position of " + oGroupMembersRequestDetails.sGroupId + " in group " + sParentGroupId);
				} else if (!iPositionInParentGroup) {
					that.mFinalLength[oRequestDetails.sGroupId_Missing_AtLevel] = true;
					// iStartIndex must be reset to 0, because a new group starts
					oGroupMembersRequestDetails.iStartIndex = 0;
				} else if (that._getKey(sParentGroupId, iPositionInParentGroup - 1) !== undefined) {
					var sPreviousGroupMemberKey = that._getKey(sParentGroupId, iPositionInParentGroup - 1);
					var sPreviousGroupId = that._getGroupIdFromContext(that.oModel.getContext('/' + sPreviousGroupMemberKey),
							that._getGroupIdLevel(oGroupMembersRequestDetails.sGroupId));
					// the final length of the previous must be set to true
					that.mFinalLength[sPreviousGroupId] = true;
					// and iStartIndex must be reset to 0, because a new group starts
					oGroupMembersRequestDetails.iStartIndex = 0;
				}
			}
			// special handling for the last group contained in this level load
			if (bIncompleteGroupMembersSet) {
				// this will force the next call of _processGroupMembersQueryResponse() below to maintain the partial length
				oGroupMembersRequestDetails.iLength = aParentGroupODataResult.length;
			}
			oGroupMembersRequestDetails.oKeyIndexMapping = that._getKeyIndexMapping(oGroupMembersRequestDetails.sGroupId, oGroupMembersRequestDetails.iStartIndex);
			var oParentGroupOData = deepExtend({}, oData);
			oParentGroupOData.results = aParentGroupODataResult;
			that._processGroupMembersQueryResponse(oGroupMembersRequestDetails, oParentGroupOData);
		};

		// function implementation starts here

		if (oData.results.length == 0) {
			this.bNeedsUpdate = true;
			return;
		}
		// Collecting contexts
		sPreviousParentGroupId = this._getGroupIdFromContext( // setup for loop
				this.oModel.getContext("/" + this.oModel._getKey(oData.results[0])), oRequestDetails.iLevel - 1);
		aParentGroupODataResult = [];
		var bProcessFirstLoadedGroup = true;
		for (var i = 0; i < oData.results.length; i++) {
			// partition the result into several subsets each of which has a common parent group Id
			var oEntry = oData.results[i];
			var oContext = this.oModel.getContext("/" + this.oModel._getKey(oData.results[i]));
			var sParentGroupId = this._getGroupIdFromContext(oContext, oRequestDetails.iLevel - 1);
			if (sPreviousParentGroupId == sParentGroupId) {
				aParentGroupODataResult.push(oEntry);
				if (i < oData.results.length - 1) {
					continue;
				}
			}
			processSingleGroupFromLevelSubset(bProcessFirstLoadedGroup,
											oData.results.length == oRequestDetails.iLength && i == oData.results.length - 1);
			// setup for processing next parent group
			bProcessFirstLoadedGroup = false;
			if (sPreviousParentGroupId != sParentGroupId) {
				aParentGroupODataResult = [ oEntry ];
			}
			sPreviousParentGroupId = sParentGroupId;
		}
		// process remaining left over (can happen if results contains more than one entry and group ID switches on last entry)
		if (oData.results.length > 1 && aParentGroupODataResult.length == 1) {
			processSingleGroupFromLevelSubset(bProcessFirstLoadedGroup, oData.results.length == oRequestDetails.iLength);
		}
	};


	/**
	 * @private
	 */
	AnalyticalBinding.prototype._processReloadMeasurePropertiesQueryResponse = function(oRequestDetails, oData) {
		var oMultiUnitRepresentative = oRequestDetails.oMultiUnitRepresentative;
		var sMultiUnitEntryKey = this.oModel.getKey(oMultiUnitRepresentative.oEntry);

		if (oData.results.length != 1) {
			oLogger.fatal("assertion failed: more than one entity for reloaded measure properties of entity with key " + sMultiUnitEntryKey);
			return;
		}

		var oReloadedEntry = oData.results[0];
		var oMultiUnitEntry = this.oModel.getObject("/" + sMultiUnitEntryKey);
		if (!oMultiUnitEntry) {
			oLogger.fatal("assertion failed: no entity found with key " + sMultiUnitEntryKey);
			return;
		}
		var aMeasureName = oMultiUnitRepresentative.aReloadMeasurePropertyName;
		for (var i = 0; i < aMeasureName.length; i++) {
			oMultiUnitEntry[aMeasureName[i]] = oReloadedEntry[aMeasureName[i]];
		}
	};


	/** *************************************************************** */

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._getLoadedContextsForGroup = function(sGroupId, iStartIndex, iLength, bFetchAll) {
		var aContext = [], oContext, i, fKey = this._getKeys(sGroupId), sKey;

		if (!fKey) {
			return aContext;
		}

		if (!iStartIndex) {
			iStartIndex = 0;
		}

		if (!iLength) {
			iLength = this.oModel.iSizeLimit;
			//if the length is known, do not use the size limit of the model, but the known length
			if (this.mFinalLength[sGroupId]) { // && this.mLength[sGroupId] < iLength) {
				iLength = this.mLength[sGroupId];
			}
		}

		if (bFetchAll) {
			i = iStartIndex || 0;
			sKey = fKey(i);
			while (sKey) {
				oContext = this.oModel.getContext('/' + sKey);
				aContext.push(oContext);
				i++;
				sKey = fKey(i);
			}
			return aContext;
		}

		// Loop through known data and check whether we already have all rows loaded
		for (i = iStartIndex; i < iStartIndex + iLength; i++) {
			sKey = fKey(i);
			if (!sKey) {
				break;
			}
			oContext = this.oModel.getContext('/' + sKey);
			aContext.push(oContext);
		}

		return aContext;
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._calculateRequiredGroupSection = function (sGroupId, iStartIndex,
			iLength, iThreshold) {
		var aElements = this.mKeyIndex[sGroupId] || [],
			iLimit = this.mFinalLength[sGroupId] ? this.mLength[sGroupId] : undefined,
			aIntervals = ODataUtils._getReadIntervals(aElements, iStartIndex, iLength, iThreshold,
				iLimit),
			oInterval = ODataUtils._mergeIntervals(aIntervals);

		if (oInterval) {
			return {
				startIndex : oInterval.start,
				length : oInterval.end - oInterval.start
			};
		}

		return {startIndex : 0, length : Math.min(0, iLength)};
	};

	/**
	 * Searches for missing members in the sub groups and subsequent siblings and ancestors of the given sGroupId
	 * @returns {Object} Either { groupId_Missing, startIndex_Missing, length_Missing }
	 * expressing the number (length_Missing) of missing contexts starting in group (groupId_Missing)
	 * at position (startIndex_Missing) using depth-first traversal of loaded data,
	 * or { null, length_Missing } if all groups starting with the given ID (sGroupId) and all subsequent are
	 * completely loaded and still (length_Missing) further members are missing, which cannot be fulfilled by loading data.
	 * Special case: { null, 0 } denotes that everything is loaded for the requested length.
	 * @private
	 */
	AnalyticalBinding.prototype._calculateRequiredGroupExpansion = function(sGroupId, iAutoExpandGroupsToLevel, iStartIndex, iLength) {
		var oNO_MISSING_MEMBER = { groupId_Missing: null, length_Missing: 0 };
		var that = this;

		/**
		 * helper function
		 * 		Searches for missing members in the sub groups of the given sGroupId
		 * @returns {Object} Either { groupId_Missing, startIndex_Missing, length_Missing }
		 * expressing the number (length_Missing) of missing contexts starting in group (groupId_Missing)
		 * at position (startIndex_Missing) using depth-first traversal of loaded data,
		 * or { null, length_Missing } if the group with given ID (sGroupId) is completely loaded
		 * and still (length_Missing) further members (of other groups) are missing.
		 * Special case: { null, 0 } denotes that everything is loaded.
		 */
		var calculateRequiredSubGroupExpansion = function(sGroupId, iAutoExpandGroupsToLevel, iStartIndex, iLength) {
			var iLevel = that._getGroupIdLevel(sGroupId);
			if (iLevel == iAutoExpandGroupsToLevel) {
				var aContext = that._getLoadedContextsForGroup(sGroupId, iStartIndex, iLength);
				var iLastLoadedIndex = iStartIndex + aContext.length - 1;

				if (aContext.length >= iLength) {
					return oNO_MISSING_MEMBER;
				} else if (that.mFinalLength[sGroupId]) {
					if (aContext.length >= that.mLength[sGroupId]) {
						return { groupId_Missing: null, length_Missing: iLength - aContext.length }; // group completely loaded, but some members are still missing
					} else {
						return { groupId_Missing: sGroupId, startIndex_Missing: iLastLoadedIndex + 1, length_Missing: iLength - aContext.length }; // loading must start here
					}
				} else {
					return { groupId_Missing: sGroupId, startIndex_Missing: iLastLoadedIndex + 1, length_Missing: iLength - aContext.length }; // loading must start here
				}
			}
			// deepest expansion level not yet reached, so traverse groups in depth-first order
			var aContext2 = that._getLoadedContextsForGroup(sGroupId, iStartIndex, iLength);
			var iLength_Missing = iLength, iLastLoadedIndex2 = iStartIndex + aContext2.length - 1;
			for (var i = -1, oContext; (oContext = aContext2[++i]) !== undefined; ) {
				iLength_Missing--; // count the current context
				var oGroupExpansionFirstMember = calculateRequiredSubGroupExpansion(that._getGroupIdFromContext(oContext, iLevel + 1), iAutoExpandGroupsToLevel, 0, iLength_Missing);
				if (oGroupExpansionFirstMember.groupId_Missing == null) {
					if (oGroupExpansionFirstMember.length_Missing == 0) {
						return oGroupExpansionFirstMember; // finished - everything is loaded
					} else {
						iLength_Missing = oGroupExpansionFirstMember.length_Missing;
					}
				} else {
					return oGroupExpansionFirstMember; // loading must start here
				}
				if (iLength_Missing == 0) {
					break;
				}
			}

			if (that.mFinalLength[sGroupId] || iLength_Missing == 0) {
				return { groupId_Missing: null, length_Missing: iLength_Missing }; // group completely loaded; maybe some members are still missing
			} else {
				return { groupId_Missing: sGroupId, startIndex_Missing: iLastLoadedIndex2 + 1, length_Missing: iLength_Missing }; // loading must start here
			}
		};

		// function implementation starts here
		var iLevel = this._getGroupIdLevel(sGroupId);
		if (iLevel == iAutoExpandGroupsToLevel + 1) {
			sGroupId = this._getParentGroupId(sGroupId);
			--iLevel;
		}
		if (sGroupId == null || iLevel > iAutoExpandGroupsToLevel) {
			return oNO_MISSING_MEMBER;
		}

		var iLength_Missing = iLength, iCurrentStartIndex = iStartIndex;
		while (sGroupId != null) {
			var oGroupExpansionFirstMember = calculateRequiredSubGroupExpansion(sGroupId, iAutoExpandGroupsToLevel, iCurrentStartIndex, iLength_Missing);
			if (oGroupExpansionFirstMember.groupId_Missing != null) {
				return oGroupExpansionFirstMember;
			} else if (oGroupExpansionFirstMember.length_Missing == 0) {
				return oGroupExpansionFirstMember;
			} else { // last sub-tree is complete, so continue calculation w/ next sibling
				var bFoundSibling = false;
				while (!bFoundSibling) {
					var sParentGroupId = this._getParentGroupId(sGroupId);
					if (sParentGroupId == null) {
						sGroupId = sParentGroupId;
						--iLevel;
						break;
					}
					// determine position of sGroupId in members of group w/ ID sParentGroupId
					var sGroupKey = this.mEntityKey[sGroupId];
					if (!sGroupKey) {
						return oNO_MISSING_MEMBER;
					}
					var iGroupIndex = this._findKeyIndex(sParentGroupId,sGroupKey);
					if (iGroupIndex == -1) {
						return oNO_MISSING_MEMBER;
					}
					if (iGroupIndex == this._getKeyCount(sParentGroupId) - 1) {
						if (this.mFinalLength[sParentGroupId]) { // last member in group
							sGroupId = sParentGroupId;
							--iLevel;
							continue; // continue with next sibling one level up
						} else { // some members of this level have not been loaded yet --> loading must continue at this point
							return { groupId_Missing: sParentGroupId, startIndex_Missing: iGroupIndex + 1, length_Missing: iLength_Missing };
						}
					} else { // continue with next sibling in same level
						sGroupKey = this._getKey(sParentGroupId, iGroupIndex + 1);
						sGroupId = this._getGroupIdFromContext(this.oModel.getContext('/' + sGroupKey), iLevel);
						bFoundSibling = true;
					}
				}
				iCurrentStartIndex = 0;
				iLength_Missing = oGroupExpansionFirstMember.length_Missing;
			}
		}
		return { groupId_Missing: null, length_Missing: iLength_Missing }; // all data loaded; number of requested members cannot be fulfilled
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._getResourcePath = function() {
		return this.isRelative() ? this.getResolvedPath() : this.sPath;
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._getEntitySet = function() {
		var sEntitySet = this.sEntitySetName;

		if (!sEntitySet) {
			// assume absolute path complying with conventions from OData4SAP spec
			sEntitySet = this.sPath.split("/")[1];

			if (sEntitySet.indexOf("(") != -1) {
				sEntitySet = sEntitySet.split("(")[0] + "Results";
			}
		}
		return sEntitySet;

	};

	/**
	 * get the effective sort order for a given property considering the column settings, local sort() calls and a global sort order from bindRows
	 * @private
	 */
	AnalyticalBinding.prototype._getEffectiveSortOrder = function(sPropertyName) {
		for (var i = 0; i < this.aSorter.length; i++) {
			if (this.aSorter[i] && this.aSorter[i].sPath == sPropertyName) {
				return this.aSorter[i].bDescending ? odata4analytics.SortOrder.Descending : odata4analytics.SortOrder.Ascending;
			}
		}
		return null;
	};


	/**
	 * get the filter operator that matches the sort order set for the given property
	 * @private
	 */
	AnalyticalBinding.prototype._getFilterOperatorMatchingPropertySortOrder = function(sPropertyName, bWithEqual) {
		var sFilterOperator;
		switch (this._getEffectiveSortOrder(sPropertyName)) {
			case odata4analytics.SortOrder.Ascending:
				if (bWithEqual) {
					sFilterOperator = FilterOperator.GE;
				} else {
					sFilterOperator = FilterOperator.GT;
				}
				break;
			case odata4analytics.SortOrder.Descending:
				if (bWithEqual) {
					sFilterOperator = FilterOperator.LE;
				} else {
					sFilterOperator = FilterOperator.LT;
				}
				break;
			default: // null
				 // default if no sort order applied - matches the default ascending order set for grouped dimensions in prepare...QueryRequest()
				sFilterOperator = FilterOperator.GT;
		}
		return sFilterOperator;
	};

	/********************************
	 *** Processing Group IDs
	 ********************************/

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._getGroupIdFromContext = function(oContext, iLevel) {

		if (!oContext) {
			return null;
		}
		var sGroupId = "/";
		var sDimensionMember = null;
		if (iLevel > this.aAggregationLevel.length) {
			oLogger.fatal("assertion failed: aggregation level deeper than number of current aggregation levels");
		}
		for (var i = 0; i < iLevel; i++) {
			sDimensionMember = oContext.getProperty(this.aAggregationLevel[i]);
			if (sDimensionMember != null) {
				if (sDimensionMember.__edmType === "Edm.Time") {
					sDimensionMember = sDimensionMember.ms;
				}
				sGroupId += encodeURIComponent(sDimensionMember) + "/"; // encode to escape slashes and at signs in the value
			} else {
				sGroupId += "@/";
			}
		}

		return sGroupId;
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._getGroupIdLevel = function(sGroupId) {
		if (sGroupId == null) {
			oLogger.fatal("assertion failed: no need to determine level of group ID = null");
			return -1;
		}
		return sGroupId.split("/").length - 2;
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._getGroupIdComponents = function(sGroupId) {
		if (sGroupId == null) {
			return null;
		}
		var aGroupId = sGroupId.split("/");
		var aDecodedComponent = [];
		for (var i = 1; i < aGroupId.length - 1; i++) { // skip leading and trailing "" array elements
			if (aGroupId[i] == "@") {
				aDecodedComponent[i - 1] = null;
			} else {
				aDecodedComponent[i - 1] = decodeURIComponent(aGroupId[i]);
			}
		}
		return aDecodedComponent;
	};

	/**
	 * @param {string} sGroupId
	 * @param {int} iNumLevels anchestors starting at the root if greater than 0, or starting at the parent of sGroupId if less than 0.
	 * @private
	 */
	AnalyticalBinding.prototype._getGroupIdAncestors = function(sGroupId, iNumLevels) {
		if (!iNumLevels) {
			return [];
		}
		if (sGroupId == null) {
			oLogger.fatal("group ID null does not have ancestors");
			return [];
		}
		if (sGroupId == "/") {
			if (Math.abs(iNumLevels) == 1) {
				return [ null ];
			} else {
				oLogger.fatal("invalid level count " + iNumLevels + " for ancestors of groupId " + sGroupId);
				return [];
			}
		}
		var aGroupId = sGroupId.split("/");
		var aAncestorGroupId = [], sAncestorGroupId = "";
		var iFromLevel = 0, iToLevel = aGroupId.length - 3;
		if (iNumLevels > 0) {
			if (iNumLevels - 1 > iToLevel) {
				oLogger.fatal("invalid level count " + iNumLevels + " for ancestors of groupId " + sGroupId);
			} else {
				iToLevel = iNumLevels - 1;
			}
		} else if (-(iNumLevels + 1) > iToLevel) {
			oLogger.fatal("invalid level count " + iNumLevels + " for ancestors of groupId " + sGroupId);
		} else {
			iFromLevel = iToLevel + 1 + iNumLevels;
			for (var i = 0; i < iFromLevel; i++) {
				sAncestorGroupId += aGroupId[i] + "/";
			}
		}
		for (var j = iFromLevel; j <= iToLevel; j++) {
			sAncestorGroupId += aGroupId[j] + "/";
			aAncestorGroupId.push(sAncestorGroupId);
		}
		return aAncestorGroupId;
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._getParentGroupId = function(sGroupId) {
		return this._getGroupIdAncestors(sGroupId, -1)[0];
	};

	AnalyticalBinding.prototype._removeDuplicatesFromStringArray = function(aString) {
		var oTemp = {};
		for (var i = 0; i < aString.length; i++) {
			oTemp[aString[i]] = true;
		}
		var aUniqueString = [];
		for (var s in oTemp) {
			aUniqueString.push(s);
		}
		return aUniqueString;
	};


	/********************************
	 *** Maintaining handles of pending requests
	 ********************************/

	/**
	 * Get an ID for a new request handle yet to be registered
	 *
	 * @private
	 */
	AnalyticalBinding.prototype._getIdForNewRequestHandle = function() {
		if (this.oPendingRequestHandle === undefined) {
			this.oPendingRequestHandle = [];
		}
		// find first unused slot or extend array
		for (var i = 0; i < this.oPendingRequestHandle.length; i++) {
			if (this.oPendingRequestHandle[i] === undefined) {
				return i;
			}
		}
		this.oPendingRequestHandle[this.oPendingRequestHandle.length] = undefined;
		return this.oPendingRequestHandle.length - 1;
	};

	/**
	 * Register a new request handle with its given request ID
	 *
	 * @private
	 */
	AnalyticalBinding.prototype._registerNewRequestHandle = function(iRequestHandleId, oRequestHandle) {
		if (this.oPendingRequestHandle[iRequestHandleId] !== undefined) {
			oLogger.fatal("request handle ID already in use");
		}
		this.oPendingRequestHandle[iRequestHandleId] = oRequestHandle;
	};

	/**
	 * Deregister handle of completed request
	 *
	 * @private
	 */
	AnalyticalBinding.prototype._deregisterHandleOfCompletedRequest = function(iRequestHandleId) {
		if (isEmptyObject(this.oPendingRequestHandle)) {
			oLogger.warning("No request handles to be cleared. Previous abort/resetData?");
			return;
		}
		if (this.oPendingRequestHandle[iRequestHandleId] === undefined) {
			oLogger.fatal("no handle found for this request ID");
		}
		this.oPendingRequestHandle[iRequestHandleId] = undefined;
	};

	/**
	 * Abort all currently sent requests, which have not yet been completed
	 *
	 * @private
	 */
	AnalyticalBinding.prototype._abortAllPendingRequestsByHandle = function() {
		for (var i = 0; i < this.oPendingRequestHandle.length; i++) {
			if (this.oPendingRequestHandle[i]) {
				if (this.oPendingRequestHandle[i] !== undefined) {
					this.oPendingRequestHandle[i].abort();
				}
			}
		}
		this.oPendingRequestHandle = [];
	};

	/********************************
	 *** Maintaining pending requests
	 ********************************/

	/**
	 * Construct a request ID for a query request of the specified type
	 *
	 * @private
	 */
	AnalyticalBinding.prototype._getRequestId = function(iRequestType, mParameters) {
		switch (iRequestType) {
		case AnalyticalBinding._requestType.groupMembersQuery:
			if (mParameters.groupId === undefined) {
				oLogger.fatal("missing group ID");
			}
			return AnalyticalBinding._requestType.groupMembersQuery + (mParameters.groupId == null ? "" : mParameters.groupId);
		case AnalyticalBinding._requestType.levelMembersQuery:
			if (mParameters.level === undefined) {
				oLogger.fatal("missing level");
			}
			if (mParameters.groupId === undefined) {
				oLogger.fatal("missing groupId");
			}
			// for accelerated auto-expand, group Id does not provide context, i.e. filter condition, for the requested data, but is only a starting point
			return "" + AnalyticalBinding._requestType.levelMembersQuery + mParameters.level + (mParameters.tupleIndex ? "-" + mParameters.tupleIndex : "");
		case AnalyticalBinding._requestType.totalSizeQuery:
			return AnalyticalBinding._requestType.totalSizeQuery;
		case AnalyticalBinding._requestType.reloadMeasuresQuery:
			if (!mParameters.multiUnitEntryKey) {
				oLogger.fatal("missing multi unit entry key");
			}
			return AnalyticalBinding._requestType.reloadMeasuresQuery + mParameters.multiUnitEntryKey;
		default:
			oLogger.fatal("invalid request type " + iRequestType);
			return -1;
		}
	};

	/**
	 * Register another request to maintain its lifecycle (pending, completed)
	 *
	 * @private
	 */
	AnalyticalBinding.prototype._registerNewRequest = function(sRequestId) {
		if (sRequestId == undefined || sRequestId == "") {
			oLogger.fatal("missing request ID");
			return;
		}
		if (!this.oPendingRequests[sRequestId]) {
			this.oPendingRequests[sRequestId] = 1;
		} else {
			++this.oPendingRequests[sRequestId];
		}
	};

	/**
	 * Declare a group of related (pending) requests
	 *
	 * @private
	 */
	AnalyticalBinding.prototype._considerRequestGrouping = function(aRequestId) {
		for (var i = -1, sRequestId; (sRequestId = aRequestId[++i]) !== undefined; ) {
			if (this.oGroupedRequests[sRequestId] === undefined) {
				this.oGroupedRequests[sRequestId] = {};
			}
			var oGroup = this.oGroupedRequests[sRequestId];
			for (var j = 0; j < aRequestId.length; j++) {
				oGroup[aRequestId[j]] = true;
			}
		}
	};

	/**
	 * Is a request pending for a given group ID?
	 *
	 * @private
	 */
	AnalyticalBinding.prototype._isRequestPending = function(sRequestId) {
		return this.oPendingRequests[sRequestId] != undefined && this.oPendingRequests[sRequestId] > 0;
	};

	/**
	 * Deregister a request, because its data have been received and processed. A call to this method must be followed
	 * (not immediately, but logically) by this._cleanupGroupingForCompletedRequest to cleanup grouping information.
	 *
	 * @private
	 */
	AnalyticalBinding.prototype._deregisterCompletedRequest = function(sRequestId) {
		// in case there are no pending request, log a warning. This might happen during a refresh call
		// helps to keep track of timing issues / race conditions with already returned requests
		if (isEmptyObject(this.oPendingRequests)) {
			oLogger.warning("There are no pending requests which could be set to 'completed'.");
			return;
		}

		if (!this.oPendingRequests[sRequestId]) {
			oLogger.fatal("assertion failed: there is no pending request ID " + sRequestId);
		}
		if (this.oPendingRequests[sRequestId] == 1) {
			delete this.oPendingRequests[sRequestId];
		} else {
			--this.oPendingRequests[sRequestId];
		}
	};

	/**
	 * Cleanup request grouping, because its data have been received and processed. This method allows a caller to determine if it is possible
	 * to raise the "all data received" event for a group of related OData requests.
	 *
	 * A call to this method must be preceded by this._deregisterCompletedRequest to mark the received response.
	 *
	 * @return {boolean} whether or not all requests grouped together with this request have now been completed
	 * @private
	 */
	AnalyticalBinding.prototype._cleanupGroupingForCompletedRequest = function(sRequestId) {
		if (this._isRequestPending(sRequestId)) {
			return false;
		}
		var bGroupCompleted = true;
		if (this.oGroupedRequests[sRequestId] != undefined) {
			for ( var sOtherRequestId in this.oGroupedRequests[sRequestId]) {
				if (this.oPendingRequests[sOtherRequestId]) {
					bGroupCompleted = false;
					break;
				}
			}
		}
		if (bGroupCompleted) {
			var oRelatedGroup = this.oGroupedRequests[sRequestId];
			delete this.oGroupedRequests[sRequestId];
			for ( var sOtherRequestId2 in oRelatedGroup) {
				if (sOtherRequestId2 != sRequestId) {
					this._cleanupGroupingForCompletedRequest(sOtherRequestId2);
				}
			}
		}
		return bGroupCompleted;
	};

	//********************************************************************************
	//*** Service data consolidation (for multi-unit entities)
	//********************************************************************************/

	/**
	 * Returns an object containing the given ID of the node as <code>sGroupId</code>, the given
	 * index of the child in that node as <code>iIndex</code>, and the corresponding index for that
	 * child in the list of service keys for that node as <code>iServiceKeyIndex</code>.
	 * <code>iIndex</code> represents the index in the visible table/tree and
	 * <code>iServiceKeyIndex</code> the index in internal data structure for the entity keys. For
	 * aggregated data it may happen that there exist more entries in the service key list,
	 * representing different values for units of the aggregated data (multi unit case), for a
	 * single line in the table/tree.
	 *
	 * @param {string} sGroupId
	 *   The group ID of the node
	 * @param {number} iStartIndex
	 *   The index of the child element within the given node
	 * @returns {object}
	 *   An object containing the given ID of the node as <code>sGroupId</code>, the given index of
	 *   the child in that node as <code>iIndex</code>, and the corresponding index for that child
	 *   in the list of service keys for that node as <code>iServiceKeyIndex</code>
	 */
	AnalyticalBinding.prototype._getKeyIndexMapping = function(sGroupId, iStartIndex) {
		var iDistance, iLastOccupiedIndex, iLastOccupiedServiceKeyIndex,
			aKeyIndex = this.mKeyIndex[sGroupId],
			oKeyIndexMapping = {
				sGroupId : sGroupId,
				iIndex : iStartIndex,
				iServiceKeyIndex : iStartIndex
			},
			aServiceKey = this.mServiceKey[sGroupId];

		if (aKeyIndex !== undefined) { // find appropriate service key index for given start index
			if (aKeyIndex[iStartIndex] !== undefined) { // index is already known
				oKeyIndexMapping.iServiceKeyIndex = aKeyIndex[iStartIndex] === "ZERO"
					? 0
					: Math.abs(aKeyIndex[iStartIndex]);

				return oKeyIndexMapping;
			}

			// search for the last occupied key index
			iLastOccupiedIndex = iStartIndex;
			if (iLastOccupiedIndex > 0) {
				while (--iLastOccupiedIndex > 0) {
					if (aKeyIndex[iLastOccupiedIndex] !== undefined) {
						break;
					}
				}
			}
			if (iLastOccupiedIndex == 0) {
				iLastOccupiedServiceKeyIndex = 0;
			} else {
				if (aKeyIndex[iLastOccupiedIndex] >= 0) {
					iLastOccupiedServiceKeyIndex = aKeyIndex[iLastOccupiedIndex];
				} else if (aKeyIndex[iLastOccupiedIndex + 1] === undefined) {
					// iLastOccupiedIndex is the last key index before hole
					iLastOccupiedServiceKeyIndex = -aKeyIndex[iLastOccupiedIndex];
					while (aServiceKey[iLastOccupiedServiceKeyIndex + 1] !== undefined) {
						++iLastOccupiedServiceKeyIndex;
					}
				} else {
					// iLastOccupiedServiceKeyIndex is the service key index before start of service
					// keys related to next key index.
					iLastOccupiedServiceKeyIndex = Math.abs(aKeyIndex[iLastOccupiedIndex + 1]) - 1;
				}
				if (aServiceKey[iLastOccupiedServiceKeyIndex] === undefined) {
					oLogger.fatal(
						"assertion failed: no service key at iLastOccupiedServiceKeyIndex = "
						+ iLastOccupiedServiceKeyIndex);
				}
			}
			iDistance = iStartIndex - iLastOccupiedIndex;
			oKeyIndexMapping.iServiceKeyIndex = iLastOccupiedServiceKeyIndex + iDistance;
		}
		return oKeyIndexMapping;
	};

	AnalyticalBinding.prototype._moveKeyIndexMapping = function(oKeyIndexMapping, iIndexOffset) {
		return this._getKeyIndexMapping(oKeyIndexMapping.sGroupId, oKeyIndexMapping.iIndex + iIndexOffset);
	};

	// access entry key for a given group ID and index
	AnalyticalBinding.prototype._getKey = function(sGroupId, iIndex) { // replaces this.mKey[sGroupId][i] in Table.js
		var iServiceKeyIndex = this.mKeyIndex[sGroupId][iIndex];
		if (iServiceKeyIndex === undefined) {
			return undefined;
		}
		if (iServiceKeyIndex >= 0) {
			return this.mServiceKey[sGroupId][iServiceKeyIndex];
		}

		if (this.mMultiUnitKey[sGroupId] === undefined) {
			oLogger.fatal("assertion failed: missing expected multi currency key for group with ID " + sGroupId);
			return null;
		}
		var sKey = this.mMultiUnitKey[sGroupId][iIndex];
		if (sKey === undefined) {
			oLogger.fatal("assertion failed: missing expected multi currency key for group with ID " + sGroupId + " at pos " + iIndex);
			return null;
		}
		return sKey;
	};

	// access entry key array for a given group ID (as function)
	AnalyticalBinding.prototype._getKeys = function(sGroupId) { // replaces this.mKey[sGroupId][i] in Table.js
		if (this.mKeyIndex[sGroupId] === undefined) {
			return undefined;
		}
		var that = this;
		return function (iIndex) {
			return that._getKey(sGroupId, iIndex);
		};
	};

	// access array of service entry keys for a given group ID and index
	AnalyticalBinding.prototype._getServiceKeys = function(sGroupId, iIndex) {
		var aKeyIndex = this.mKeyIndex[sGroupId];
		if (aKeyIndex === undefined) {
			return undefined;
		}
		var aServiceKey = this.mServiceKey[sGroupId],
			iServiceKeyIndex = aKeyIndex[iIndex];

		if (iServiceKeyIndex === undefined) {
			return undefined;
		}
		if (iServiceKeyIndex >= 0) {
			return [ aServiceKey[iServiceKeyIndex] ];
		}

		var aGroupIndexServiceKey = [];
		if (aKeyIndex[iIndex + 1] === undefined) {
			iServiceKeyIndex = aKeyIndex[iIndex] == "ZERO" ? 0 : -aKeyIndex[iIndex];
			while (aServiceKey[iServiceKeyIndex] !== undefined) {
				aGroupIndexServiceKey.push(aServiceKey[iServiceKeyIndex++]);
			}
		} else {
			iServiceKeyIndex = aKeyIndex[iIndex] == "ZERO" ? 0 : -aKeyIndex[iIndex];
			for (var i = iServiceKeyIndex, iNextEntryIndex = Math.abs(aKeyIndex[iIndex + 1]); i < iNextEntryIndex; i++) {
				aGroupIndexServiceKey.push(aServiceKey[i]);
			}
		}
		return aGroupIndexServiceKey;
	};

	// number of keys in a group
	AnalyticalBinding.prototype._getKeyCount = function(sGroupId) { // replaces this.mKey[sGroupId].length in Table.js
		if (this.mKeyIndex[sGroupId] === undefined) {
			return undefined;
		}
		return this.mKeyIndex[sGroupId].length;
	};

	// substitute for indexOf in the key array for some group
	AnalyticalBinding.prototype._findKeyIndex = function(sGroupId, sKey) {
		// naive implementation follows
		var aKeyIndex = this.mKeyIndex[sGroupId];
		var aServiceKey = this.mServiceKey[sGroupId];
		var aMultiUnitKey = this.mMultiUnitKey[sGroupId];
		for (var i = 0; i < this.mLength[sGroupId]; i++) {
			if (aKeyIndex[i] < 0 || aKeyIndex[i] === "ZERO") {
				if (aMultiUnitKey[i] == sKey) {
					return i;
				}
			} else if (aServiceKey[aKeyIndex[i]] == sKey) {
				return i;
			}
		}
		return -1;
	};

	// save the key of a loaded entry at the given indexes
	AnalyticalBinding.prototype._setServiceKey = function(oKeyIndexMapping, sServiceKey) {
		if (!this.mServiceKey[oKeyIndexMapping.sGroupId]) {
			this.mServiceKey[oKeyIndexMapping.sGroupId] = [];
		}
		if (!this.mKeyIndex[oKeyIndexMapping.sGroupId]) {
			this.mKeyIndex[oKeyIndexMapping.sGroupId] = [];
		}

		var bNewKey = this.mServiceKey[oKeyIndexMapping.sGroupId][oKeyIndexMapping.iServiceKeyIndex] === undefined;

		this.mServiceKey[oKeyIndexMapping.sGroupId][oKeyIndexMapping.iServiceKeyIndex++] = sServiceKey;
		this.mKeyIndex[oKeyIndexMapping.sGroupId][oKeyIndexMapping.iIndex++] = oKeyIndexMapping.iServiceKeyIndex - 1;

		return bNewKey;
	};

	// save the keys of adjacent identical entries only differing in the given units; oKeyIndexMapping points to the position after the first multi-unit entry
	// returns number of service keys that were not yet available locally
	AnalyticalBinding.prototype._setAdjacentMultiUnitKeys = function(oKeyIndexMapping, oMultiUnitRepresentative, aMultiUnitEntry) {
		if (!this.mServiceKey[oKeyIndexMapping.sGroupId]) {
			this.mServiceKey[oKeyIndexMapping.sGroupId] = [];
		}
		if (!this.mKeyIndex[oKeyIndexMapping.sGroupId]) {
			this.mKeyIndex[oKeyIndexMapping.sGroupId] = [];
		}
		if (!this.mMultiUnitKey[oKeyIndexMapping.sGroupId]) {
			this.mMultiUnitKey[oKeyIndexMapping.sGroupId] = [];
		}

		// need to adjust positions to point to the first multi-unit entry
		// why? because in processGroupMemberQueryResponse(), advancing the mapping halts after(!) when the multi-unit case is detected, which happens with the second entry
		--oKeyIndexMapping.iIndex;
		--oKeyIndexMapping.iServiceKeyIndex;

		this.mMultiUnitKey[oKeyIndexMapping.sGroupId][oKeyIndexMapping.iIndex] = this.oModel._getKey(oMultiUnitRepresentative.oEntry);

		// the following setting in the key index serves two purposes: indicate the multi-unit situation and remember position of first related service key
		this.mKeyIndex[oKeyIndexMapping.sGroupId][oKeyIndexMapping.iIndex++] = oKeyIndexMapping.iServiceKeyIndex > 0 ? -oKeyIndexMapping.iServiceKeyIndex : "ZERO";

		// store service keys and consider new keys in the discarded count
		var iNewServiceKeyIndexCount = 0;
		for (var i = 0; i < aMultiUnitEntry.length; i++) {
			if (!this.mServiceKey[oKeyIndexMapping.sGroupId][oKeyIndexMapping.iServiceKeyIndex]) {
				++iNewServiceKeyIndexCount;
			}
			this.mServiceKey[oKeyIndexMapping.sGroupId][oKeyIndexMapping.iServiceKeyIndex++] = this.oModel._getKey(aMultiUnitEntry[i]);
		}
		return iNewServiceKeyIndexCount;
	};

	// combine loaded key index entries with a block of subsequent key index entries starting at the given key index mapping
	AnalyticalBinding.prototype._mergeLoadedKeyIndexWithSubsequentIndexes = function(oKeyIndexMapping, aAggregationLevel, aSelectedUnitPropertyName, bIsFlatListRequest) {
		/*
		 * Note:
		 * This is a complex algorithm with an external description.
		 * You will need this description in order to understand this implementation.
		 * The variable names are derived from the names used in the description, underscores in the names indicate indexed names.
		 */
		var aDeviatingUnitPropertyNames,
			aKI = this.mKeyIndex[oKeyIndexMapping.sGroupId], // is mKI in description
			aSK = this.mServiceKey[oKeyIndexMapping.sGroupId], // is mSK in description
			aMUK = this.mMultiUnitKey[oKeyIndexMapping.sGroupId], // is mMUK in description
			iDiscardedEntriesCount = 0,
			n_i = oKeyIndexMapping.iServiceKeyIndex,
			n_e = oKeyIndexMapping.iIndex;

		var	oMultiUnitRepresentative, oMultiUnitEntryKey;

		if (aKI === undefined) {
			return iDiscardedEntriesCount;
		}

		// step 1: determine if the adjacent service keys denote same dimension key and therefore must be merged
		var bNeedMultiUnitKeyMerge = false;
		var sPreviousServiceKey = aSK[n_i - 1],
			sNextServiceKey = aSK[n_i];

		if (sNextServiceKey === undefined) {
			return iDiscardedEntriesCount;
		}
		if (sPreviousServiceKey === undefined) {
			oLogger.fatal("assertion failed: missing expected entry before given key index");
			return iDiscardedEntriesCount;
		}
		var oPreviousEntry = this.oModel.getObject("/" + sPreviousServiceKey);
		var oNextEntry = this.oModel.getObject("/" + sNextServiceKey);
		var sPreviousEntryDimensionKeyString = "",
			sNextEntryDimensionKeyString = "";
		for (var i = 0; i < aAggregationLevel.length; i++) {
			sPreviousEntryDimensionKeyString += AnalyticalBinding._getDimensionValue(
					oPreviousEntry[aAggregationLevel[i]]) + "|";
			sNextEntryDimensionKeyString += AnalyticalBinding._getDimensionValue(
					oNextEntry[aAggregationLevel[i]]) + "|";
		}
		bNeedMultiUnitKeyMerge = sPreviousEntryDimensionKeyString == sNextEntryDimensionKeyString;

		// calculate nPrime_e for next steps
		var nPrime_e = n_e;
		if (nPrime_e >= this.mLength[oKeyIndexMapping.sGroupId]) {
			oLogger.fatal("assertion failed: service key exists,but no corresponding key index found");
			return iDiscardedEntriesCount;
		}
		while (aKI[nPrime_e] === undefined || Math.abs(aKI[nPrime_e]) < n_i) {
			++nPrime_e;
		}

		// step 2: combine loaded key index entries with subsequent key index entries
		if (bNeedMultiUnitKeyMerge) { // case 1
			if (Math.abs(aKI[nPrime_e]) == n_i && aKI[nPrime_e] < 0) { // case a) nPrime_e is a multi-unit entry and starts at n_i
				if (nPrime_e > n_e) { // relevance check for merging the loaded key index section with subsequent indexes
					if (aKI[n_e - 1] < 0) { // case I: (nPrime_e - 1) is a multi-unit entry
						aMUK[nPrime_e] = undefined; // delete its multi-unit entry
						// delete aKI entries n_e ... nPrime_e - 1 and at nPrime_e (this will remove the redundant second multi-unit entry at nPrime_e)
						aKI.splice(n_e, nPrime_e - n_e + 1);
						aMUK.splice(n_e, nPrime_e - n_e + 1);
					} else { // case II: (nPrime_e - 1) is NOT a multi-unit entry
						aKI[n_e - 1] = -aKI[n_e - 1]; // make n_e - 1 a multi-unit entry
						aMUK[n_e - 1] = aMUK[nPrime_e]; // reuse aMUK[nPrime_e] for aMUK[n_e - 1]
						aMUK[nPrime_e] = undefined; // clear aMUK[nPrime_e]
						// delete aKI entries n_e ... nPrime_e - 1 and at nPrime_e (this will remove the redundant second multi-unit entry at nPrime_e)
						aKI.splice(n_e, nPrime_e - n_e + 1);
						aMUK.splice(n_e, nPrime_e - n_e + 1);
						iDiscardedEntriesCount = 1;
					}
				}
			} else if (Math.abs(aKI[nPrime_e]) > n_i) { // case b) nPrimePrime_e = nPrime_e - 1 is a multi-unit entry pointing to service keys before n_i
				var nPrimePrime_e = nPrime_e - 1;

				if (aKI[nPrimePrime_e] > 0) { // case I: (nPrimePrime_e) is not a multi-unit entry
					// create a multi-unit entry for nPrimePrime_e
					// TODO integration test
					aDeviatingUnitPropertyNames =
						AnalyticalBinding._getDeviatingUnitPropertyNames(aSelectedUnitPropertyName,
							[oPreviousEntry, oNextEntry]);
					oMultiUnitRepresentative = this._createMultiUnitRepresentativeEntry(oKeyIndexMapping.sGroupId,
						oPreviousEntry, aSelectedUnitPropertyName, aDeviatingUnitPropertyNames, bIsFlatListRequest);
					oMultiUnitEntryKey = this.oModel._getKey(oMultiUnitRepresentative.oEntry);
					// make nPrimePrime_e a multi-unit entry
					aKI[nPrimePrime_e] = -aKI[nPrimePrime_e];
					aMUK[nPrimePrime_e] = oMultiUnitEntryKey;
					if (nPrimePrime_e > n_e) {
						// delete aKI entries n_e ... nPrimePrime_e - 1
						aKI.splice(n_e, nPrimePrime_e - n_e);
						aMUK.splice(n_e, nPrimePrime_e - n_e);
					}
					if (oMultiUnitRepresentative.bIsNewEntry) {
						// two service keys contributing to this multi-unit entry, and one new multi-unit representative => 1 more service key to discard
						iDiscardedEntriesCount = 1;
					} else {
						// more than two service keys contributing to this multi-unit entry, which were already detected as "multi-unit" and therefore discarded.
						// since the existing multi-unit representative has index nPrimePrime_e, the service key pointed to by this index was also already covered
						// => 0 more service key to discard
						iDiscardedEntriesCount = 0;
					}
				} else if (aKI[n_e - 1] < 0) {
						// case II: (nPrimePrime_e) is a multi-unit entry
						// case i: (n_e - 1) is a multi-unit entry
						if (nPrime_e > n_e) { // relevance check for merging the loaded key index section with subsequent indexes
							aMUK[nPrimePrime_e] = undefined; // delete its multi-unit entry
							// delete aKI entries n_e ... nPrimePrime_e - 1 and at nPrimePrime_e (this will remove the redundant second multi-unit entry at nPrimePrime_e)
							aKI.splice(n_e, nPrimePrime_e - n_e + 1);
							aMUK.splice(n_e, nPrimePrime_e - n_e + 1);
						}
					} else { // case ii: (n_e - 1) is NOT a multi-unit entry
						aKI[n_e - 1] = -aKI[n_e - 1]; // make n_e - 1 a multi-unit entry
						aMUK[n_e - 1] = aMUK[nPrimePrime_e]; // reuse aMUK[nPrimePrime_e] for aMUK[n_e - 1]
						aMUK[nPrimePrime_e] = undefined; // clear aMUK[nPrimePrime_e]
						// delete aKI entries n_e ... nPrime_e - 1 and at nPrimePrime_e (this will remove the redundant second multi-unit entry at nPrimePrime_e)
						aKI.splice(n_e, nPrimePrime_e - n_e + 1);
						aMUK.splice(n_e, nPrimePrime_e - n_e + 1);
					}
			} else if (aKI[nPrime_e] == n_i) { // case c) nPrime_e is NOT a multi-unit entry
				if (nPrime_e > n_e) { // relevance check for merging the loaded key index section with subsequent indexes
					if (aKI[n_e - 1] < 0) { // case I: (nPrime_e - 1) is a multi-unit entry
						// delete aKI entries n_e ... nPrime_e - 1 and at nPrime_e (this will remove the redundant second multi-unit entry at nPrimePrime_e)
						aKI.splice(n_e, nPrime_e - n_e + 1);
						aMUK.splice(n_e, nPrime_e - n_e + 1);
						iDiscardedEntriesCount = 1;
					} else { // case II: (nPrime_e - 1) is NOT a multi-unit entry
						// create a multi-unit entry for n_e - 1
						aDeviatingUnitPropertyNames = AnalyticalBinding._getDeviatingUnitPropertyNames(
							aSelectedUnitPropertyName, [oPreviousEntry, oNextEntry]);
						oMultiUnitRepresentative = this._createMultiUnitRepresentativeEntry(oKeyIndexMapping.sGroupId,
							oPreviousEntry, aSelectedUnitPropertyName, aDeviatingUnitPropertyNames, bIsFlatListRequest);
						oMultiUnitEntryKey = this.oModel._getKey(oMultiUnitRepresentative.oEntry);
						if (!oMultiUnitRepresentative.bIsNewEntry) {
							oLogger.fatal("assertion failed: multi-unit entry already existed before");
						}
						// make n_e - 1 a multi-unit entry
						aKI[n_e - 1] = -aKI[n_e - 1];
						aMUK[n_e - 1] = oMultiUnitEntryKey;
						// delete aKI entries n_e ... nPrime_e - 1 and at nPrime_e (this will remove the redundant second multi-unit entry at nPrimePrime_e)
						aKI.splice(n_e, nPrime_e - n_e + 1);
						aMUK.splice(n_e, nPrime_e - n_e + 1);
						iDiscardedEntriesCount = 1;
					}
				}
			} else {
				oLogger.fatal("assertion failed: uncovered case detected");
				return iDiscardedEntriesCount;
			}
		} else if (aKI[nPrime_e] > n_i) {
				// case 2

//				case a)
				oLogger.fatal("unstable query result for group ID " + oKeyIndexMapping.sGroupId + ": entries have been removed or added. Complete reload required");
			} else if (nPrime_e - n_e > 0) {
				// case b)

//				delete aKI entries n_e ... nPrime_e - 1
				aKI.splice(n_e, nPrime_e - n_e);
				aMUK.splice(n_e, nPrime_e - n_e);
			}

		return iDiscardedEntriesCount;
	};


	// create a local multi unit entry by copying the given reference entry, and modifying this new entry: clear all unit properties that are not part of the aggregation level, and all measures
	// returns { oEntry, bIsNewEntry) the multi-unit representativ entry and a flag whether it already existed before this call
	AnalyticalBinding.prototype._createMultiUnitRepresentativeEntry = function(sGroupId, oReferenceEntry, aSelectedUnitPropertyName, aDeviatingUnitPropertyName, bIsFlatListRequest) {
		// set up properties for measures and units in this new entry
		var oMultiUnitEntry = deepExtend({}, oReferenceEntry);
		var aReloadMeasurePropertyName = [];
		for ( var sMeasureName in this.oMeasureDetailsSet) {
			var oMeasureDetails = this.oMeasureDetailsSet[sMeasureName];
			if (!bIsFlatListRequest && this._isSkippingTotalForMeasure(sMeasureName)) {
				if (oMeasureDetails.rawValuePropertyName != undefined) {
					oMultiUnitEntry[oMeasureDetails.rawValuePropertyName] = undefined;
				}
				if (oMeasureDetails.formattedValuePropertyName != undefined) {
					oMultiUnitEntry[oMeasureDetails.formattedValuePropertyName] = undefined;
				}
			} else {
				if (oMeasureDetails.rawValuePropertyName != undefined) {
					oMultiUnitEntry[oMeasureDetails.rawValuePropertyName] = null; // cannot be "*" because of type validation!
				}
				if (oMeasureDetails.formattedValuePropertyName != undefined) {
					oMultiUnitEntry[oMeasureDetails.formattedValuePropertyName] = "*";
				}
			}
			// determine if this measure that can be reloaded, because their unit properties do not have deviating values
			if (aDeviatingUnitPropertyName) {
				if (!oMeasureDetails.unitPropertyName || aDeviatingUnitPropertyName.indexOf(oMeasureDetails.unitPropertyName) == -1) {
					aReloadMeasurePropertyName.push(oMeasureDetails.rawValuePropertyName
						|| oMeasureDetails.name);
				}
			}
		}
		for (var k = 0; k < aSelectedUnitPropertyName.length; k++) {
			if (aDeviatingUnitPropertyName.indexOf(aSelectedUnitPropertyName[k]) != -1) {
				oMultiUnitEntry[aSelectedUnitPropertyName[k]] = "*";
			}
		}

		/*
		 * assign a key to this new entry that allows to import it into the OData model that is guaranteed to be stable when used for multiple
		 * bindings 1) Take all(!) grouping dimensions in alphabetical order of their names 2) Concatenate the values of these dimenensions in this
		 * order separated by "," 3) append some indicator such as "-multiunit-not-dereferencable" to mark this special entry
		 */
		var sMultiUnitEntryKey = "";

		for (var l = 0; l < this.aAllDimensionSortedByName.length; l++) {
			var sDimVal = AnalyticalBinding._getDimensionValue(oMultiUnitEntry[this.aAllDimensionSortedByName[l]]);
			// if the value is an empty string, it should be treated as such in the generated key
			var sSaveDimVal = sDimVal === "" ? '""' : sDimVal;
			sSaveDimVal = sSaveDimVal === undefined ? "" : sSaveDimVal;
			sMultiUnitEntryKey += (encodeURIComponent(sSaveDimVal) + ",");
		}
		// If there are multiple analytical bindings for the same entity (maybe using different
		// filters), ensure that the keys for the multi unit representatives are unique for this
		// analytical binding, otherwise data could be overwritten by another binding.
		sMultiUnitEntryKey += "-multiple-units-not-dereferencable|" + this._iId;

		// check if an entry already exists; if so, dont proceed, but return it
		var iMultiUnitEntryIndex;
		if (this.mMultiUnitKey[sGroupId] && (iMultiUnitEntryIndex = this.mMultiUnitKey[sGroupId].indexOf(sMultiUnitEntryKey)) != -1) {
			return { oEntry: this.oModel.getObject("/" + sMultiUnitEntryKey), bIsNewEntry : false, iIndex: iMultiUnitEntryIndex, aReloadMeasurePropertyName: aReloadMeasurePropertyName }; // already created
		}

		// this modified copy must be imported to the OData model as a new entry with a modified key and OData metadata
		oMultiUnitEntry.__metadata.uri = sMultiUnitEntryKey;
		delete oMultiUnitEntry.__metadata["self"];
		delete oMultiUnitEntry.__metadata["self_link_extensions"];
		oMultiUnitEntry["^~volatile"] = true; // mark entry to distinguish it from others contained in the regular OData result

		// 3rd argument: empty response, needed by the ODataModel, but we do not have a response, as we did not perform any requests.
		this.oModel._importData(oMultiUnitEntry, {}, {});

		// mark the context for this entry as volatile to facilitate special treatment by consumers
		var sMultiUnitEntryModelKey = this.oModel._getKey(oMultiUnitEntry);
		this.oModel.getContext('/' + sMultiUnitEntryModelKey)["_volatile"] = true;
		return { oEntry: oMultiUnitEntry, bIsNewEntry : true, aReloadMeasurePropertyName: aReloadMeasurePropertyName };
	};



	//********************************
	//*** Miscellaneous
	//********************************/

	AnalyticalBinding.prototype._clearAllPendingRequests = function() {
		this.oPendingRequests = {};
		this.oGroupedRequests = {};
	};

	/**
	 * Resets the current list data and length
	 *
	 * @private
	 */
	AnalyticalBinding.prototype.resetData = function(oContext) {
		var sGroupId = oContext ? oContext.getPath() : undefined;
		this._resetData(sGroupId);
	};

	AnalyticalBinding.prototype._resetData = function(sGroupId) {
		if (sGroupId) {
			// reset only specific content
			delete this.mServiceKey[sGroupId];
			delete this.mServiceLength[sGroupId];
			delete this.mServiceFinalLength[sGroupId];

			delete this.mKeyIndex[sGroupId];
			delete this.mLength[sGroupId];

			delete this.mMultiUnitKey[sGroupId];
			delete this.mEntityKey[sGroupId];
		} else {
			this.mServiceKey = {};
			this.mServiceLength = {};
			this.mServiceFinalLength = {};
			this.mFinalLength = this.mServiceFinalLength;

			this.mKeyIndex = {};
			this.mLength = {};

			this.mMultiUnitKey = {};

			this.mEntityKey = {};
			// clear also the pending request queue because the contained requests are obsolete
			this.aBatchRequestQueue = [];
		}
	};

	/**
	 * Refreshes the binding, check whether the model data has been changed and fire change event if this is the case. For service side models this should refetch
	 * the data from the service. To update a control, even if no data has been changed, e.g. to reset a control after failed validation, please use the parameter
	 * bForceUpdate.
	 *
	 * @param {boolean}
	 *            [bForceUpdate] Update the bound control even if no data has been changed
	 * @public
	 */
	AnalyticalBinding.prototype.refresh = function(bForceUpdate) {
		// use apply as refresh may be called with more parameters
		AnalyticalBinding.prototype._refresh.apply(this, arguments);
	};

	/**
	 * @private
	 */
	AnalyticalBinding.prototype._refresh = function(bForceUpdate, mChangedEntities, mEntityTypes) {
		var bChangeDetected = false;
		if (!bForceUpdate) {
			if (mEntityTypes) {
				var sResolvedPath = this.getResolvedPath();
				var oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sResolvedPath);
				if (oEntityType && (oEntityType.entityType in mEntityTypes)) {
					bChangeDetected = true;
				}
			}
			if (mChangedEntities && !bChangeDetected) {
				each(this.mServiceKey, function(i, aNodeKeys) {
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
			if (!mChangedEntities && !mEntityTypes) { // default
				bChangeDetected = true;
			}
		}
		if (bForceUpdate || bChangeDetected) {
			this.iTotalSize = -1; // invalidate last row counter
			this._abortAllPendingRequests();
			this.resetData();
			this.bNeedsUpdate = false;
			this._fireRefresh({reason: ChangeReason.Refresh});
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed, inform interested parties about this.
	 *
	 * @param {boolean} [bForceUpdate]
	 * @param {object} mChangedEntities
	 * @private
	 */
	AnalyticalBinding.prototype.checkUpdate = function(bForceUpdate, mChangedEntities) {
		var bChangeDetected = false;
		if (!bForceUpdate) {
			if (this.bNeedsUpdate || !mChangedEntities) {
				bChangeDetected = true;
			} else {
				each(this.mServiceKey, function(i, aNodeKeys) {
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
			this._fireChange({reason: ChangeReason.Change});
		}
	};

	/**
	 * Get a download URL with the specified format considering the
	 * sort/filter/custom parameters.
	 *
	 * The download URL also takes into account the selected dimensions and measures,
	 * depending on the given column definitions of the AnalyticalTable.
	 * This is based on the visible/inResult flags of the columns, as well as integrity dependencies,
	 * e.g. for mandatory Unit properties.
	 *
	 * @param {string} sFormat Value for the $format Parameter
	 * @return {string} URL which can be used for downloading
	 * @since 1.24
	 * @public
	 */
	AnalyticalBinding.prototype.getDownloadUrl = function(sFormat) {
		var aSelectProperties, sProperty, z;

		// create a new request
		var oAnalyticalQueryRequest = new odata4analytics.QueryResultRequest(this.oAnalyticalQueryResult);
		oAnalyticalQueryRequest.setResourcePath(this._getResourcePath());

		// add current list of dimensions
		var aSelectedDimension = [];
		var aSelectedMeasure = [];
		for (var oDimensionName in this.oDimensionDetailsSet) {
			aSelectedDimension.push(oDimensionName);
		}
		oAnalyticalQueryRequest.setAggregationLevel(aSelectedDimension);
		for (var oDimensionName2 in this.oDimensionDetailsSet) {
			var oDimensionDetails = this.oDimensionDetailsSet[oDimensionName2];
			var bIncludeText = (oDimensionDetails.textPropertyName != undefined);
			oAnalyticalQueryRequest.includeDimensionKeyTextAttributes(oDimensionDetails.name, // bIncludeKey: No, always needed!
					true, bIncludeText, oDimensionDetails.aAttributeName);
		}

		// add current list of measures
		for (var sMeasureName in this.oMeasureDetailsSet) {
			aSelectedMeasure.push(sMeasureName);
		}
		oAnalyticalQueryRequest.setMeasures(aSelectedMeasure);
		for ( var sMeasureName2 in this.oMeasureDetailsSet) {
			var oMeasureDetails = this.oMeasureDetailsSet[sMeasureName2];
			var bIncludeRawValue = (oMeasureDetails.rawValuePropertyName != undefined);
			var bIncludeFormattedValue = (oMeasureDetails.formattedValuePropertyName != undefined);
			var bIncludeUnitProperty = (oMeasureDetails.unitPropertyName != undefined);
			oAnalyticalQueryRequest.includeMeasureRawFormattedValueUnit(oMeasureDetails.name, bIncludeRawValue,
					bIncludeFormattedValue, bIncludeUnitProperty);
		}

		// add the sorters, no need to merge with grouping sorters as no grouping is used
		var oSortExpression = oAnalyticalQueryRequest.getSortExpression();
		oSortExpression.clear();
		for (var i = 0; i < this.aSorter.length; i++) {
			if (this.aSorter[i]) {
				oSortExpression.addSorter(this.aSorter[i].sPath, this.aSorter[i].bDescending ? odata4analytics.SortOrder.Descending : odata4analytics.SortOrder.Ascending);
			}
		}

		// add the filters
		var oFilterExpression = oAnalyticalQueryRequest.getFilterExpression();
		oFilterExpression.clear();
		if (this.aApplicationFilter) {
			oFilterExpression.addUI5FilterConditions(this.aApplicationFilter);
		}
		if (this.aControlFilter) {
			oFilterExpression.addUI5FilterConditions(this.aControlFilter);
		}

		// determine the entityset path incl. the required params (sort, filter, ...)
		var sPath = oAnalyticalQueryRequest.getURIToQueryResultEntitySet();
		// always consider additional selects for download URL
		var aParam = this._getQueryODataRequestOptions(oAnalyticalQueryRequest, true);

		if (!aParam) {
			// parameters could not be determined correctly
			return undefined;
		}

		// add the new $select param which is sorted like the Table
		var aExportCols = [];
		for (var k = 0, m = this.aAnalyticalInfo.length; k < m; k++) {
			var oCol = this.aAnalyticalInfo[k];
			if ((oCol.visible || oCol.inResult)
					&& oCol.name !== ""
					&& oCol.name !== aExportCols[aExportCols.length - 1]) {
				aExportCols.push(oCol.name);

				// add belonging currency column implicitly if present
				if (this.oMeasureDetailsSet[oCol.name] != undefined
					&& this.oMeasureDetailsSet[oCol.name].unitPropertyName != undefined) {
					aExportCols.push(this.oMeasureDetailsSet[oCol.name].unitPropertyName);
				}
			}
		}

		// search and replace the $select
		for (var j = 0, l = aParam.length; j < l; j++) {
			if (/^\$select/i.test(aParam[j])) {
				if (this.mParameters.select) {
					// merge export columns with the computed $select only if select binding
					// parameter is given
					aSelectProperties = aParam[j].slice(8).split(",");
					for (z = 0; z < aSelectProperties.length; z++) {
						sProperty = aSelectProperties[z];
						if (aExportCols.indexOf(sProperty) === -1) {
							aExportCols.push(sProperty);
						}
					}
				}
				aParam[j] = "$select=" + aExportCols.join(",");
				break;
			}
		}

		// insert the format as first parameter
		if (sFormat) {
			aParam.splice(0, 0, "$format=" + encodeURIComponent(sFormat));
		}

		// add the custom url parameters
		if (this.sCustomParams) {
			aParam.push(this.sCustomParams);
		}

		// create the request URL
		if (sPath) {
			return this.oModel._createRequestUrl(sPath, null, aParam).replace(/ /g, "%20");
		}

		return undefined;
	};

	//**********************************
	//*** Grouping together with Sorting
	//**********************************
	/**
	 * Adds the given sorters and 'this.aSorter' to the given sort expression object.
	 * Depending on the result of {@link #_canApplySortersToGroups}, 'this.aSorter' are added
	 * before the given sorters or after them.
	 *
	 * @param {sap.ui.model.analytics.odata4analytics.SortExpression} oSortExpression
	 *    The sort expression
	 * @param {sap.ui.model.Sorter[]} aGroupingSorters
	 *    An array of sorter objects resulting from grouping
	 * @private
	 */
	AnalyticalBinding.prototype._addSorters = function (oSortExpression, aGroupingSorters) {
		if (this._canApplySortersToGroups()) {
			this.aSorter.forEach((oApplicationSorter) => {
				AnalyticalBinding._addSorter(oApplicationSorter, oSortExpression);
			});
			aGroupingSorters.forEach((oGroupingSorter) => {
				AnalyticalBinding._addSorter(oGroupingSorter, oSortExpression, true);
			});
			return;
		}
		this._mergeAndAddSorters(aGroupingSorters, oSortExpression);
	};

	/**
	 * Adds the given sorter to the given sort expression. If the parameter <code>bIgnoreIfAlreadySorted</code> is set
	 * to <code>true</code> the sorter is not added to the sort expression if it is already contained in the sort
	 * expression.
	 *
	 * @param {sap.ui.model.Sorter} oSorter
	 *   The sorter to add
	 * @param {sap.ui.model.analytics.odata4analytics.SortExpression} oSortExpression
	 *   The sort expression to which the given sorter is added
	 * @param {boolean} [bIgnoreIfAlreadySorted=false]
	 *   If there is already a sorter for that property, ignore this call
	 *
	 * @private
	 */
	AnalyticalBinding._addSorter = function (oSorter, oSortExpression, bIgnoreIfAlreadySorted) {
		oSortExpression.addSorter(oSorter.sPath,
			oSorter.bDescending
				? odata4analytics.SortOrder.Descending
				: odata4analytics.SortOrder.Ascending,
			bIgnoreIfAlreadySorted);
	};

	/**
	 * Merges the given grouping sorters with this binding's application sorters and adds them to the given
	 * sort expression.
	 *
	 * @param {sap.ui.model.Sorter[]} aGroupingSorters
	 *   The grouping sorters to add to the given sort expression
	 * @param {sap.ui.model.analytics.odata4analytics.SortExpression} oSortExpression
	 *   The sort expression to which the given grouping sorters as well as this binding's application sorters are added
	 *
	 * @private
	 */
	AnalyticalBinding.prototype._mergeAndAddSorters = function (aGroupingSorters, oSortExpression) {
		const aApplicationSorters = this.aSorter.slice();
		aGroupingSorters.forEach((oGroupingSorter) => {
			const sDimensionName = oGroupingSorter.sPath;
			for (let i = 0; i < aApplicationSorters.length; i += 1) {
				const oApplicationSorter = aApplicationSorters[i];
				const sPath = oApplicationSorter.sPath;
				if (sPath === sDimensionName || this.oDimensionDetailsSet[sDimensionName].textPropertyName === sPath) {
					AnalyticalBinding._addSorter(oApplicationSorter, oSortExpression);
					aApplicationSorters.splice(i, 1);
					break;
				}
			}
			AnalyticalBinding._addSorter(oGroupingSorter, oSortExpression, true);
		});
		aApplicationSorters.forEach((oApplicationSorter) => {
			AnalyticalBinding._addSorter(oApplicationSorter, oSortExpression, true);
		});
	};

	/**
	 * Returns whether sorters in 'this.aSorter' can be applied to the groups. This feature is only
	 * enabled if binding's auto expand mode is set to 'Sequential'.
	 * Logs a warning if applying sorters to groups is not possible because of auto expand mode.
	 * Do not log the warning twice if auto expand mode does not change.
	 *
	 * @returns {boolean} Whether 'this.aSorter' can be applied to the groups
	 * @private
	 */
	AnalyticalBinding.prototype._canApplySortersToGroups = function () {
		var sCurrentAutoExpandMode = this._autoExpandMode;

		if (this.bApplySortersToGroups) {
			if (this.aSorter.length > 0) {
				// check whether to log a warning and update sLastAutoExpandMode
				if (sCurrentAutoExpandMode !== this.sLastAutoExpandMode
						&& sCurrentAutoExpandMode !== TreeAutoExpandMode.Sequential) {
					oLogger.warning("Applying sorters to groups is only possible with auto"
						+ " expand mode 'Sequential'; current mode is: " + sCurrentAutoExpandMode,
						this.sPath);
				}
				this.sLastAutoExpandMode = sCurrentAutoExpandMode;
			}
			return sCurrentAutoExpandMode === TreeAutoExpandMode.Sequential;
		}
		return false;
	};

	/**
	 * Resets the flag that sorters can be applied to groups and logs a warning if not yet done.
	 *
	 * @param {string} sDetails Details for the warning
	 * @private
	 */
	AnalyticalBinding.prototype._warnNoSortingOfGroups = function (sDetails) {
		var sMessage;

		if (this.bApplySortersToGroups) {
			sMessage = "Detected a multi-unit case, so sorting is only possible on leaves";
			if (sDetails) {
				sMessage += "; " + sDetails;
			}
			oLogger.warning(sMessage, this.sPath);
		}
		this.bApplySortersToGroups = false;
	};

	/**
	 * Whether to skip requesting the total for the given measure. If there is no column for the
	 * measure request the total.
	 *
	 * @param {string} sMeasureName The property name of the measure
	 * @returns {boolean} Whether to skip requesting the total for the given measure.
	 * @private
	 */
	AnalyticalBinding.prototype._isSkippingTotalForMeasure = function (sMeasureName) {
		var oAnalyticalInfo = this.mAnalyticalInfoByProperty[sMeasureName];

		// It may happen that there is no column for the measure, for example because only the text
		// property for the measure and not the measure itself has been added as column. In that
		// case request the total for the corresponding measure.
		return !!oAnalyticalInfo && oAnalyticalInfo.total == false;
	};

	/**
	 * Updates the dimension details text property with the given property name in case it is the given dimension's
	 * text property.
	 *
	 * @param {object} oDimension The dimension
	 * @param {string} sPropertyName The property name
	 * @param {object} oDimensionDetails The dimension details
	 *
	 * @private
	 */
	AnalyticalBinding._updateDimensionDetailsTextProperty = function (oDimension, sPropertyName, oDimensionDetails) {
		const oTextProperty = oDimension.getTextProperty();
		if (oTextProperty && oTextProperty.name === sPropertyName) {
			oDimensionDetails.textPropertyName = sPropertyName;
		}
	};

	/**
	 * Returns a strigifyable value for the given value of a dimension property.
	 *
	 * @param {any} vValue The value of a dimension property
	 * @returns {any}
	 *   The stringifyable dimension value; if the given value is an "Edm.Time" object only the "ms" value is returned
	 * @private
	 */
	AnalyticalBinding._getDimensionValue = function (vValue) {
		if (vValue && vValue.__edmType === "Edm.Time") {
			vValue = vValue.ms;
		}

		return vValue;
	};

	/**
	 * Returns the unit property names for which a deviating unit value is found in the given multi unit entries.
	 *
	 * @param {string[]} aSelectedUnitPropertyNames The selected unit property names
	 * @param {object[]} aMultiUnitEntries The entries for which a multi unit situation exists
	 * @returns {string[]} An array containing the deviating unit property names
	 * @private
	 */
	AnalyticalBinding._getDeviatingUnitPropertyNames = function (aSelectedUnitPropertyNames, aMultiUnitEntries) {
		var aDeviatingUnitPropertyNames = [];

		aSelectedUnitPropertyNames.forEach(function(sUnitPropertyName) {
			for (var i = 1; i < aMultiUnitEntries.length; i += 1) {
				if (aMultiUnitEntries[i - 1][sUnitPropertyName] != aMultiUnitEntries[i][sUnitPropertyName]) {
					aDeviatingUnitPropertyNames.push(sUnitPropertyName);
					break;
				}
			}
		});

		return aDeviatingUnitPropertyNames;
	};

	AnalyticalBinding.Logger = oLogger;

	return AnalyticalBinding;
});