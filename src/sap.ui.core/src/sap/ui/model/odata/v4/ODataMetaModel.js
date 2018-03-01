/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataMetaModel
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ClientListBinding",
	"sap/ui/model/ClientPropertyBinding",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/Context",
	"sap/ui/model/MetaModel",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/type/Int64",
	"sap/ui/thirdparty/URI",
	"./lib/_Helper",
	"./ValueListType"
], function (jQuery, SyncPromise, BindingMode, ChangeReason, ClientListBinding,
		ClientPropertyBinding, ContextBinding, BaseContext, MetaModel, OperationMode, Int64, URI,
		_Helper, ValueListType) {
	"use strict";
	/*eslint max-nested-callbacks: 0 */

	var oCountType,
		DEBUG = jQuery.sap.log.Level.DEBUG,
		ODataMetaContextBinding,
		ODataMetaListBinding,
		sODataMetaModel = "sap.ui.model.odata.v4.ODataMetaModel",
		ODataMetaPropertyBinding,
		rNumber = /^-?\d+$/,
		mSupportedEvents = {
			messageChange : true
		},
		mUi5TypeForEdmType = {
			"Edm.Boolean" : {type : "sap.ui.model.odata.type.Boolean"},
			"Edm.Byte" : {type : "sap.ui.model.odata.type.Byte"},
			"Edm.Date" : {type : "sap.ui.model.odata.type.Date"},
			"Edm.DateTimeOffset" : {
				constraints : {
					"$Precision" : "precision"
				},
				type : "sap.ui.model.odata.type.DateTimeOffset"
			},
			"Edm.Decimal" : {
				constraints : {
					"@Org.OData.Validation.V1.Minimum/$Decimal" : "minimum",
					"@Org.OData.Validation.V1.Minimum@Org.OData.Validation.V1.Exclusive" :
						"minimumExclusive",
					"@Org.OData.Validation.V1.Maximum/$Decimal" : "maximum",
					"@Org.OData.Validation.V1.Maximum@Org.OData.Validation.V1.Exclusive" :
						"maximumExclusive",
					"$Precision" : "precision",
					"$Scale" : "scale"
				},
				type : "sap.ui.model.odata.type.Decimal"
			},
			"Edm.Double" : {type : "sap.ui.model.odata.type.Double"},
			"Edm.Guid" : {type : "sap.ui.model.odata.type.Guid"},
			"Edm.Int16" : {type : "sap.ui.model.odata.type.Int16"},
			"Edm.Int32" : {type : "sap.ui.model.odata.type.Int32"},
			"Edm.Int64" : {type : "sap.ui.model.odata.type.Int64"},
			"Edm.SByte" : {type : "sap.ui.model.odata.type.SByte"},
			"Edm.Single" : {type : "sap.ui.model.odata.type.Single"},
			"Edm.Stream" : {type : "sap.ui.model.odata.type.Stream"},
			"Edm.String" : {
				constraints : {
					"@com.sap.vocabularies.Common.v1.IsDigitSequence" : "isDigitSequence",
					"$MaxLength" : "maxLength"
				},
				type : "sap.ui.model.odata.type.String"
			},
			"Edm.TimeOfDay" : {
				constraints : {
					"$Precision" : "precision"
				},
				type : "sap.ui.model.odata.type.TimeOfDay"
			}
		},
		UNBOUND = {},
		sValueListMapping = "@com.sap.vocabularies.Common.v1.ValueListMapping",
		mValueListModelByUrl = {},
		sValueListReferences = "@com.sap.vocabularies.Common.v1.ValueListReferences",
		sValueListWithFixedValues = "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues",
		WARNING = jQuery.sap.log.Level.WARNING;

	/**
	 * Logs an error with the given message and details and throws it.
	 *
	 * @param {string} sMessage
	 *   Error message
	 * @param {string} sDetails
	 *   Error details
	 * @throws {Error}
	 */
	function logAndThrowError(sMessage, sDetails) {
		jQuery.sap.log.error(sMessage, sDetails, sODataMetaModel);
		throw new Error(sDetails + ": " + sMessage);
	}

	/**
	 * Returns the schema with the given namespace, or a promise which is resolved as soon as the
	 * schema has been included, or <code>undefined</code> in case the schema is neither present nor
	 * referenced.
	 *
	 * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel
	 *   The OData metadata model
	 * @param {object} mScope
	 *   The $metadata "JSON" of the root service
	 * @param {string} sSchema
	 *   A namespace, for example "foo.bar.", of a schema.
	 * @param {function} fnLog
	 *   The log function
	 * @returns {object|SyncPromise|undefined}
	 *   The schema, or a promise which is resolved without details or rejected with an error, or
	 *   <code>undefined</code>.
	 */
	function getOrFetchSchema(oMetaModel, mScope, sSchema, fnLog) {
		var oPromise,
			sUrl;

		/**
		 * Include the schema (and all of its children) with namespace <code>sSchema</code> from
		 * the given referenced scope.
		 *
		 * @param {object} mReferencedScope
		 *   The $metadata "JSON"
		 */
		function includeSchema(mReferencedScope) {
			var oElement,
				sKey;

			if (!(sSchema in mReferencedScope)) {
				fnLog(WARNING, sUrl, " does not contain ", sSchema);
				return;
			}

			fnLog(DEBUG, "Including ", sSchema, " from ", sUrl);
			for (sKey in mReferencedScope) {
				// $EntityContainer can be ignored; $Reference, $Version is handled above
				if (sKey[0] !== "$" && schema(sKey) === sSchema) {
					oElement = mReferencedScope[sKey];
					mScope[sKey] = oElement;
					mergeAnnotations(oElement, mScope.$Annotations);
				}
			}
		}

		if (sSchema in mScope) {
			return mScope[sSchema];
		}

		sUrl = oMetaModel.mSchema2MetadataUrl[sSchema];
		if (sUrl) {
			fnLog(DEBUG, "Namespace ", sSchema, " found in $Include of ", sUrl);
			oPromise = oMetaModel.mMetadataUrl2Promise[sUrl];
			if (!oPromise) {
				fnLog(DEBUG, "Reading ", sUrl);
				oPromise = oMetaModel.mMetadataUrl2Promise[sUrl]
					= SyncPromise.resolve(oMetaModel.oRequestor.read(sUrl))
						.then(oMetaModel.validate.bind(oMetaModel, sUrl));
			}
			oPromise = oPromise.then(includeSchema);
			// BEWARE: oPromise may already be resolved, then includeSchema() is done now
			if (sSchema in mScope) {
				return mScope[sSchema];
			}
			mScope[sSchema] = oPromise;
			return oPromise;
		}
	}

	/**
	 * Checks that the term is the expected term and determines the qualifier.
	 *
	 * @param {string} sTerm
	 *   The term
	 * @param {string} sExpectedTerm
	 *   The expected term
	 * @returns {string}
	 *   The qualifier or undefined, if the term is not the expected term
	 */
	function getQualifier(sTerm, sExpectedTerm) {
		if (sTerm === sExpectedTerm) {
			return "";
		}
		if (sTerm.indexOf(sExpectedTerm) === 0 && sTerm[sExpectedTerm.length] === "#"
				&& sTerm.indexOf("@", sExpectedTerm.length) < 0) {
			return sTerm.slice(sExpectedTerm.length + 1);
		}
	}

	/**
	 * Merges the given schema's annotations into the root scope's $Annotations.
	 *
	 * @param {object} oSchema
	 *   a schema; schema children are ignored because they do not contain $Annotations
	 * @param {object} mAnnotations
	 *   the root scope's $Annotations
	 */
	function mergeAnnotations(oSchema, mAnnotations) {
		var sTarget;

		for (sTarget in oSchema.$Annotations) {
			if (sTarget in mAnnotations) {
				// "PUT" semantics on term level, last annotation file wins
				jQuery.extend(mAnnotations[sTarget], oSchema.$Annotations[sTarget]);
			} else {
				mAnnotations[sTarget] = oSchema.$Annotations[sTarget];
			}
		}
		delete oSchema.$Annotations;
	}

	/**
	 * Returns the namespace of the given qualified name's schema, including the trailing dot.
	 *
	 * @param {string} sQualifiedName
	 *   A qualified name
	 * @returns {string}
	 *   The schema's namespace
	 */
	function schema(sQualifiedName) {
		return sQualifiedName.slice(0, sQualifiedName.lastIndexOf(".") + 1);
	}

	/**
	 * @class Context binding implementation for the OData metadata model.
	 *
	 * @extends sap.ui.model.ContextBinding
	 * @private
	 */
	ODataMetaContextBinding
		= ContextBinding.extend("sap.ui.model.odata.v4.ODataMetaContextBinding", {
			constructor : function (oModel, sPath, oContext) {
				jQuery.sap.assert(!oContext || oContext.getModel() === oModel,
					"oContext must belong to this model");
				ContextBinding.call(this, oModel, sPath, oContext);
			},
			// @override
			// @see sap.ui.model.Binding#initialize
			initialize : function () {
				var oElementContext = this.oModel.createBindingContext(this.sPath, this.oContext);
				this.bInitial = false; // initialize() has been called
				if (oElementContext !== this.oElementContext) {
					this.oElementContext = oElementContext;
					this._fireChange();
				}
			},
			// @override
			// @see sap.ui.model.Binding#setContext
			setContext : function (oContext) {
				jQuery.sap.assert(!oContext || oContext.getModel() === this.oModel,
					"oContext must belong to this model");
				if (oContext !== this.oContext) {
					this.oContext = oContext;
					if (!this.bInitial) {
						this.initialize();
					} // else: do not cause implicit 1st initialize(), avoid _fireChange!
				}
			}
		});

	/**
	 * @class List binding implementation for the OData metadata model which supports filtering on
	 * the virtual property "@sapui.name" (which refers back to the name of the object in
	 * question).
	 *
	 * Example:
	 * <pre>
	 * &lt;template:repeat list="{path : 'entityType>', filters : {path : '@sapui.name', operator :
	 *     'StartsWith', value1 : 'com.sap.vocabularies.UI.v1.FieldGroup'}}" var="fieldGroup">
	 * </pre>
	 *
	 * @extends sap.ui.model.ClientListBinding
	 * @private
	 */
	ODataMetaListBinding = ClientListBinding.extend("sap.ui.model.odata.v4.ODataMetaListBinding", {
		constructor : function () {
			ClientListBinding.apply(this, arguments);
		},

		// @deprecated
		// @override
		// @see sap.ui.model.ListBinding#_fireFilter
		_fireFilter : function () {
			// do not fire an event as this function is deprecated
		},

		// @deprecated
		// @override
		// @see sap.ui.model.ListBinding#_fireSort
		_fireSort : function () {
			// do not fire an event as this function is deprecated
		},

		// @override
		// @see sap.ui.model.Binding#checkUpdate
		checkUpdate : function (bForceUpdate) {
			var iPreviousLength = this.oList.length;

			this.update();
			// the data cannot change, only new items may be added due to lazy loading of references
			if (bForceUpdate || this.oList.length !== iPreviousLength) {
				this._fireChange({reason: ChangeReason.Change});
			}
		},

		/**
		 * Returns the contexts that result from iterating over the binding's path/context.
		 * @returns {sap.ui.base.SyncPromise} A promise that is resolved with an array of contexts
		 *
		 * @private
		 */
		fetchContexts : function () {
			var bIterateAnnotations,
				sResolvedPath = this.oModel.resolve(this.sPath, this.oContext),
				that = this;

			if (!sResolvedPath) {
				return SyncPromise.resolve([]);
			}
			bIterateAnnotations = sResolvedPath.slice(-1) === "@";
			if (!bIterateAnnotations && sResolvedPath !== "/") {
				sResolvedPath += "/";
			}
			return this.oModel.fetchObject(sResolvedPath).then(function (oResult) {
				if (!oResult) {
					return [];
				}
				if (bIterateAnnotations) {
					// strip off the trailing "@"
					sResolvedPath = sResolvedPath.slice(0, -1);
				}
				return Object.keys(oResult).filter(function (sKey) {
					// always filter technical properties;
					// filter annotations iff. not iterating them
					return sKey[0] !== "$" &&  bIterateAnnotations !== (sKey[0] !== "@");
				}).map(function (sKey) {
					return new BaseContext(that.oModel, sResolvedPath + sKey);
				});
			});
		},

		// @override
		// @see sap.ui.model.ListBinding#getContexts
		// the third parameter (iMaximumPrefetchSize) is ignored because the data is already
		// available completely
		getContexts : function (iStartIndex, iLength) {
			// extended change detection is ignored
			this.iCurrentStart = iStartIndex || 0;
			this.iCurrentLength =
				Math.min(iLength || Infinity, this.iLength, this.oModel.iSizeLimit);
			return this.getCurrentContexts();
		},

		// @override
		// @see sap.ui.model.ListBinding#getCurrentContexts
		getCurrentContexts : function () {
			var aContexts = [],
				i,
				n = this.iCurrentStart + this.iCurrentLength;

			for (i = this.iCurrentStart; i < n; i++) {
				aContexts.push(this.oList[this.aIndices[i]]);
			}
			return aContexts;
		},

		/**
		 * Updates the list and indices array from the given contexts.
		 * @param {sap.ui.model.Context[]} aContexts The contexts
		 * @private
		 */
		setContexts : function (aContexts) {
			this.oList = aContexts;
			this.updateIndices();
			this.applyFilter();
			this.applySort();
			this.iLength = this._getLength();
		},

		/**
		 * Updates the list and indices array. Fires a change event if the data was retrieved
		 * asynchronously.
		 * @private
		 */
		update : function () {
			var aContexts = [],
				oPromise = this.fetchContexts(),
				that = this;

			if (oPromise.isFulfilled()) {
				aContexts = oPromise.getResult();
			} else {
				oPromise.then(function (aContexts) {
					that.setContexts(aContexts);
					that._fireChange({reason: ChangeReason.Change});
				});
			}
			this.setContexts(aContexts);
		}
	});

	/**
	 * @class Property binding implementation for the OData metadata model.
	 *
	 * @extends sap.ui.model.ClientPropertyBinding
	 * @private
	 */
	ODataMetaPropertyBinding
		= ClientPropertyBinding.extend("sap.ui.model.odata.v4.ODataMetaPropertyBinding", {
			constructor : function () {
				ClientPropertyBinding.apply(this, arguments);
			},
			// @override
			// @see sap.ui.model.ClientPropertyBinding#_getValue
			_getValue : function () {
				var oPromise,
				that = this;

				oPromise = this.oModel.fetchObject(this.sPath, this.oContext, this.mParameters);
				if (oPromise.isFulfilled()) {
					return oPromise.getResult();
				}
				// This is the async case
				oPromise.then(function () {
					// Now the value is available, fetch it again (now synchronously) and notify
					// listeners
					that.checkUpdate();
				});
				return undefined;
			},
			// @override
			// @see sap.ui.model.Binding#checkUpdate
			checkUpdate : function (bForceUpdate) {
				var vValue = this._getValue();

				if (bForceUpdate || vValue !== this.oValue) {
					this.oValue = vValue;
					this._fireChange({reason : ChangeReason.Change});
				}
			},
			// @override
			// @see sap.ui.model.PropertyBinding#setValue
			setValue : function () {
				throw new Error("Unsupported operation: ODataMetaPropertyBinding#setValue");
			}
		});

	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.odata.v4.ODataModel#getMetaModel} instead.
	 *
	 * @param {object} oRequestor
	 *   The metadata requestor
	 * @param {string} sUrl
	 *   The URL to the $metadata document of the service
	 * @param {string|string[]} [vAnnotationUri]
	 *   The URL (or an array of URLs) from which the annotation metadata are loaded
	 *   Supported since 1.41.0
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The model this meta model is related to
	 * @param {boolean} [bSupportReferences=true]
	 *   Whether <code>&lt;edmx:Reference></code> and <code>&lt;edmx:Include></code> directives are
	 *   supported in order to load schemas on demand from other $metadata documents and include
	 *   them into the current service ("cross-service references").
	 *
	 * @alias sap.ui.model.odata.v4.ODataMetaModel
	 * @author SAP SE
	 * @class Implementation of an OData metadata model which offers access to OData V4 metadata.
	 *   The meta model does not support any public events; attaching an event handler leads to an
	 *   error.
	 *
	 *   This model is read-only.
	 *
	 * @extends sap.ui.model.MetaModel
	 * @public
	 * @since 1.37.0
	 * @version ${version}
	 */
	var ODataMetaModel = MetaModel.extend("sap.ui.model.odata.v4.ODataMetaModel", {
		/*
		 * @param {sap.ui.model.odata.v4.lib._MetadataRequestor} oRequestor
		 */
		constructor : function (oRequestor, sUrl, vAnnotationUri, oModel, bSupportReferences) {
			MetaModel.call(this);
			this.aAnnotationUris = vAnnotationUri && !Array.isArray(vAnnotationUri)
				? [vAnnotationUri] : vAnnotationUri;
			this.sDefaultBindingMode = BindingMode.OneTime;
			this.mETags = {};
			this.dLastModified = new Date(0);
			this.oMetadataPromise = null;
			this.oModel = oModel;
			this.mMetadataUrl2Promise = {};
			this.oRequestor = oRequestor;
			// map from schema name to the same URL that _MetadataRequestor#read() takes
			this.mSchema2MetadataUrl = {};
			this.mSupportedBindingModes = {"OneTime" : true, "OneWay" : true};
			this.bSupportReferences = bSupportReferences !== false; // default is true
			this.sUrl = sUrl;
		}
	});

	/**
	 * Merges <code>$Annotations</code> from the given $metadata and additional annotation files
	 * into the root scope as a new map of all annotations, called <code>$Annotations</code>.
	 *
	 * @param {object} mScope
	 *   The $metadata "JSON" of the root service
	 * @param {object[]} aAnnotationFiles
	 *   The metadata "JSON" of the additional annotation files
	 * @throws {Error}
	 *   If metadata cannot be merged
	 *
	 * @private
	 */
	ODataMetaModel.prototype._mergeAnnotations = function (mScope, aAnnotationFiles) {
		var that = this;

		this.validate(this.sUrl, mScope);

		// merge $Annotations from all schemas at root scope
		mScope.$Annotations = {};
		Object.keys(mScope).forEach(function (sElement) {
			if (mScope[sElement].$kind === "Schema") {
				that.mSchema2MetadataUrl[sElement] = that.sUrl;
				mergeAnnotations(mScope[sElement], mScope.$Annotations);
			}
		});

		// merge annotation files into root scope
		aAnnotationFiles.forEach(function (mAnnotationScope, i) {
			var oElement,
				sQualifiedName;

			that.validate(that.aAnnotationUris[i], mAnnotationScope);
			for (sQualifiedName in mAnnotationScope) {
				if (sQualifiedName[0] !== "$") {
					if (sQualifiedName in mScope) {
						logAndThrowError("A schema cannot span more than one document: "
							+ sQualifiedName, that.aAnnotationUris[i]);
					}
					oElement = mAnnotationScope[sQualifiedName];
					mScope[sQualifiedName] = oElement;
					if (oElement.$kind === "Schema") {
						that.mSchema2MetadataUrl[sQualifiedName] = that.aAnnotationUris[i];
						mergeAnnotations(oElement, mScope.$Annotations);
					}
				}
			}
		});
	};

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataMetaModel.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataMetaModel#attachEvent");
		}
		return MetaModel.prototype.attachEvent.apply(this, arguments);
	};

	// @public
	// @see sap.ui.model.Model#bindContext
	// @since 1.37.0
	ODataMetaModel.prototype.bindContext = function (sPath, oContext) {
		return new ODataMetaContextBinding(this, sPath, oContext);
	};

	/**
	 * Creates a list binding for this metadata model which iterates content from the given path
	 * (relative to the given context), sorted and filtered as indicated.
	 *
	 * By default, OData names are iterated and a trailing slash is implicitly added to the path
	 * (see {@link #requestObject} for the effects this has); technical properties and inline
	 * annotations are filtered out.
	 *
	 * A path which ends with an "@" segment can be used to iterate all inline or external
	 * targeting annotations; no trailing slash is added implicitly; technical properties and OData
	 * names are filtered out.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the metadata model, for example "/EMPLOYEES"
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters]
	 *   Initial sort order, see {@link sap.ui.model.ListBinding#sort}
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters]
	 *   Initial application filter(s), see {@link sap.ui.model.ListBinding#filter}
	 * @returns {sap.ui.model.ListBinding}
	 *   A list binding for this metadata model
	 *
	 * @public
	 * @see #requestObject
	 * @see sap.ui.model.Model#bindList
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters) {
		return new ODataMetaListBinding(this, sPath, oContext, aSorters, aFilters);
	};

	/**
	 * Creates a property binding for this meta data model which refers to the content from the
	 * given path (relative to the given context).
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the meta data model, for example "/EMPLOYEES/ENTRYDATE"
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {object} [mParameters]
	 *   Optional binding parameters that are passed to {@link #getObject} to compute the binding's
	 *   value; if they are given, <code>oContext</code> cannot be omitted
	 * @param {object} [mParameters.scope]
	 *   Optional scope for lookup of aliases for computed annotations (since 1.43.0)
	 * @returns {sap.ui.model.PropertyBinding}
	 *   A property binding for this meta data model
	 *
	 * @public
	 * @see sap.ui.model.Model#bindProperty
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		return new ODataMetaPropertyBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#bindTree
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.bindTree = function () {
		throw new Error("Unsupported operation: v4.ODataMetaModel#bindTree");
	};

	/**
	 * Returns a promise for an absolute data binding path of a "4.3.1 Canonical URL" for the given
	 * context.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   OData V4 context object for which the canonical path is requested; it must point to an
	 *   entity
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved with the canonical path (for example "/EMPLOYEES('1')") in
	 *   case of success, or rejected with an instance of <code>Error</code> in case of failure
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchCanonicalPath = function (oContext) {
		return this.fetchUpdateData("", oContext).then(function (oResult) {
			if (oResult.propertyPath) {
				throw new Error("Context " + oContext.getPath()
					+ " does not point to an entity. It should be " + oResult.entityPath);
			}
			return "/" + oResult.editUrl;
		});
	};

	/**
	 * Requests the single entity container for this metadata model's service by reading the
	 * $metadata document via the metadata requestor. The resulting $metadata "JSON" object is a map
	 * of qualified names to their corresponding metadata, with the special key "$EntityContainer"
	 * mapped to the entity container's qualified name as a starting point.
	 *
	 * @param {boolean} [bPrefetch=false]
	 *   Whether to just read the $metadata document and annotations, but not yet convert them from
	 *   XML to JSON; this is useful at most once in an early call that precedes all other normal
	 *   calls and ignored after the first call without this.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved with the $metadata "JSON" object as soon as the entity
	 *   container is fully available, or rejected with an error. In case of
	 *   <code>bPrefetch</code> in an early call, <code>null</code> is returned.
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchEntityContainer = function (bPrefetch) {
		var aPromises,
			that = this;

		if (!this.oMetadataPromise) {
			aPromises
				= [SyncPromise.resolve(this.oRequestor.read(this.sUrl, false, bPrefetch))];

			if (this.aAnnotationUris) {
				this.aAnnotationUris.forEach(function (sAnnotationUri) {
					aPromises.push(SyncPromise.resolve(
						that.oRequestor.read(sAnnotationUri, true, bPrefetch)));
				});
			}
			if (!bPrefetch) {
				this.oMetadataPromise = SyncPromise.all(aPromises).then(function (aMetadata) {
					var mScope = aMetadata[0];

					that._mergeAnnotations(mScope, aMetadata.slice(1));

					return mScope;
				});
			}
		}
		return this.oMetadataPromise;
	};

	/**
	 * Requests a module for the given <code>sModuleName</code>.
	 *
	 * @param {string} sModuleName
	 *   The name of the module to fetch (e.g. sap.ui.model.odata.type.Int16)
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved with the requested module as soon as it is available
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchModule = function (sModuleName) {
		var vModule;

		sModuleName = sModuleName.replace(/\./g, "/");
		vModule = sap.ui.require(sModuleName);

		if (vModule) {
			return SyncPromise.resolve(vModule);
		}
		return SyncPromise.resolve(new Promise(function (resolve, reject) {
			sap.ui.require([sModuleName], resolve);
		}));
	};

	/**
	 * @param {string} sPath
	 *   A relative or absolute path within the metadata model, for example "/EMPLOYEES/ENTRYDATE"
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {object} [mParameters]
	 *   Optional (binding) parameters; if they are given, <code>oContext</code> cannot be omitted
	 * @param {object} [mParameters.scope]
	 *   Optional scope for lookup of aliases for computed annotations (since 1.43.0)
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved with the requested metadata object as soon as it is available
	 *
	 * @private
	 * @see #requestObject
	 */
	ODataMetaModel.prototype.fetchObject = function (sPath, oContext, mParameters) {
		var sResolvedPath = this.resolve(sPath, oContext),
			that = this;

		if (!sResolvedPath) {
			jQuery.sap.log.error("Invalid relative path w/o context", sPath, sODataMetaModel);
			return SyncPromise.resolve(null);
		}

		return this.fetchEntityContainer().then(function (mScope) {
				// binding parameter's type name ({string}) for overloading of bound operations
				// or UNBOUND ({object}) for unbound operations called via an import
			var vBindingParameterType,
				vLocation, // {string[]|string} location of indirection
				sName, // what "@sapui.name" refers to: OData or annotation name
				bODataMode = true, // OData navigation mode with scope lookup etc.
				// parent for next "17.2 SimpleIdentifier"...
				// (normally the schema child containing the current object)
				oSchemaChild, // ...as object
				sSchemaChildName, // ...as qualified name
				// annotation target pointing to current object, or undefined
				// (schema child's qualified name plus optional segments)
				sTarget,
				vResult = mScope; // current object

			/*
			 * Calls a computed annotation according to the given segment which was found at the
			 * given path; changes <code>vResult</code> accordingly.
			 *
			 * @param {string} sSegment
			 *   Contains the name of the computed annotation as "@@..."
			 * @param {string} sPath
			 *   Path where the segment was found
			 * @returns {boolean}
			 *   <code>false</code>
			 */
			function computedAnnotation(sSegment, sPath) {
				var fnAnnotation,
					iThirdAt = sSegment.indexOf("@", 2);

				if (iThirdAt > -1) {
					return log(WARNING, "Unsupported path after ", sSegment.slice(0, iThirdAt));
				}

				sSegment = sSegment.slice(2);
				fnAnnotation = sSegment[0] === "."
					? jQuery.sap.getObject(sSegment.slice(1), undefined, mParameters.scope)
					: jQuery.sap.getObject(sSegment);
				if (typeof fnAnnotation !== "function") {
					// Note: "varargs" syntax does not help because Array#join ignores undefined
					return log(WARNING, sSegment, " is not a function but: " + fnAnnotation);
				}

				try {
					vResult = fnAnnotation(vResult, {
						context : new BaseContext(that, sPath),
						schemaChildName : sSchemaChildName
					});
				} catch (e) {
					log(WARNING, "Error calling ", sSegment, ": ", e);
				}

				return false;
			}

			/*
			 * Tells whether the given overload is the right one.
			 *
			 * @param {object} oOverload
			 *   A single operation overload
			 * @returns {true}
			 *   Iff the given overload is an action with the appropriate binding parameter (bound
			 *   and unbound cases), or not an action at all.
			 */
			function isRightOverload(oOverload) {
				return oOverload.$kind !== "Action"
					|| (!oOverload.$IsBound && vBindingParameterType === UNBOUND
						|| oOverload.$IsBound
						&& vBindingParameterType === oOverload.$Parameter[0].$Type);
			}

			/*
			 * Tells whether the given object is "thenable".
			 *
			 * @param {object} [o]
			 *   Any object
			 * @returns {boolean}
			 *   <code>true</code> iff. an object is given which has a method called "then"
			 */
			function isThenable(o) {
				return o && typeof o.then === "function";
			}

			/*
			 * Outputs a log message for the given level. Leads to an <code>undefined</code> result
			 * in case of a WARNING.
			 *
			 * @param {jQuery.sap.log.Level} iLevel
			 *   A log level, either DEBUG or WARNING
			 * @param {...string} aTexts
			 *   The main text of the message is constructed from the rest of the arguments by
			 *   joining them
			 * @returns {boolean}
			 *   <code>false</code>
			 */
			function log(iLevel) {
				var sLocation;

				if (jQuery.sap.log.isLoggable(iLevel, sODataMetaModel)) {
					sLocation = Array.isArray(vLocation)
						? vLocation.join("/")
						: vLocation;
					jQuery.sap.log[iLevel === DEBUG ? "debug" : "warning"](
						Array.prototype.slice.call(arguments, 1).join("")
						+ (sLocation ? " at /" + sLocation : ""),
						sResolvedPath, sODataMetaModel);
				}
				if (iLevel === WARNING) {
					vResult = undefined;
				}
				return false;
			}

			/*
			 * Looks up the given qualified name in the global scope.
			 *
			 * @param {string} sQualifiedName
			 *   A qualified name
			 * @param {string} [sPropertyName]
			 *   Where the qualified name was found
			 * @returns {boolean}
			 *   Whether to continue after scope lookup
			 */
			function scopeLookup(sQualifiedName, sPropertyName) {
				var sSchema;

				/*
				 * Sets <code>vLocation</code> and delegates to {@link log}.
				 */
				function logWithLocation() {
					vLocation = vLocation
						|| sTarget && sPropertyName && sTarget + "/" + sPropertyName;
					return log.apply(this, arguments);
				}

				vBindingParameterType = vResult && vResult.$Type;
				if (that.bSupportReferences && !(sQualifiedName in mScope)) {
					// unknown qualified name: maybe schema is referenced and can be included?
					sSchema = schema(sQualifiedName);
					vResult = getOrFetchSchema(that, mScope, sSchema, logWithLocation);
				}

				if (sQualifiedName in mScope) {
					sTarget = sName = sSchemaChildName = sQualifiedName;
					vResult = oSchemaChild = mScope[sSchemaChildName];
					if (!isThenable(vResult)) {
						return true; // qualified name found, steps may continue
					}
				}

				if (isThenable(vResult) && vResult.isPending()) {
					// load on demand still pending
					return logWithLocation(DEBUG, "Waiting for ", sSchema);
				}

				return logWithLocation(WARNING, "Unknown qualified name ", sQualifiedName);
			}

			/*
			 * Takes one step according to the given segment, starting at the current
			 * <code>vResult</code> and changing that.
			 *
			 * @param {string} sSegment
			 *   Current segment
			 * @param {number} i
			 *   Current segment's index
			 * @param {string[]} aSegments
			 *   All segments
			 * @returns {boolean}
			 *   Whether to continue after this step
			 */
			function step(sSegment, i, aSegments) {
				var iIndexOfAt,
					bSplitSegment;

				if (sSegment === "$Annotations") {
					return log(WARNING, "Invalid segment: $Annotations");
				}

				if (vResult !== mScope && typeof vResult === "object" && sSegment in vResult) {
					// fast path for pure "JSON" drill-down, but this cannot replace scopeLookup()!
					if (sSegment[0] === "$" || rNumber.test(sSegment)) {
						bODataMode = false; // technical property, switch to pure "JSON" drill-down
					}
				} else {
					// split trailing computed annotation, @sapui.name, or annotation
					iIndexOfAt = sSegment.indexOf("@@");
					if (iIndexOfAt < 0) {
						if (sSegment.length > 11 && sSegment.slice(-11) === "@sapui.name") {
							iIndexOfAt = sSegment.length - 11;
						} else {
							iIndexOfAt = sSegment.indexOf("@");
						}
					}
					if (iIndexOfAt > 0) {
						// <17.2 SimpleIdentifier|17.3 QualifiedName>@<annotation[@annotation]>
						// Note: only the 1st annotation may use external targeting, the rest is
						// pure "JSON" drill-down (except for computed annotations/"@sapui.name")!
						if (!step(sSegment.slice(0, iIndexOfAt), i, aSegments)) {
							return false;
						}
						sSegment = sSegment.slice(iIndexOfAt);
						bSplitSegment = true;
					}

					if (typeof vResult === "string"
						&& !(bSplitSegment && sSegment[0] === "@"
							&& (sSegment === "@sapui.name" || sSegment[1] === "@"))
						// indirection: treat string content as a meta model path unless followed by
						// a computed annotation
						&& !steps(vResult, aSegments.slice(0, i))) {
						return false;
					}

					if (bODataMode) {
						if (sSegment[0] === "$" || rNumber.test(sSegment)) {
							// technical property, switch to pure "JSON" drill-down
							bODataMode = false;
						} else if (!bSplitSegment) {
							if (sSegment[0] !== "@" && sSegment.indexOf(".") > 0) {
								// "17.3 QualifiedName": scope lookup
								return scopeLookup(sSegment);
							} else if (vResult && "$Type" in vResult) {
								// implicit $Type insertion, e.g. at (navigation) property
								if (!scopeLookup(vResult.$Type, "$Type")) {
									return false;
								}
							} else if (vResult && "$Action" in vResult) {
								// implicit $Action insertion at action import
								if (!scopeLookup(vResult.$Action, "$Action")) {
									return false;
								}
								vBindingParameterType = UNBOUND;
							} else if (vResult && "$Function" in vResult) {
								// implicit $Function insertion at function import
								if (!scopeLookup(vResult.$Function, "$Function")) {
									return false;
								}
							} else if (i === 0) {
								// "17.2 SimpleIdentifier" (or placeholder):
								// lookup inside schema child (which is determined lazily)
								sTarget = sName = sSchemaChildName
									= sSchemaChildName || mScope.$EntityContainer;
								vResult = oSchemaChild = oSchemaChild || mScope[sSchemaChildName];
								if (sSegment && sSegment[0] !== "@"
									&& !(sSegment in oSchemaChild)) {
									return log(WARNING, "Unknown child ", sSegment, " of ",
										sSchemaChildName);
								}
							}
							if (Array.isArray(vResult)) { // overloads of Action or Function
								vResult = vResult.filter(isRightOverload);
								if (sSegment === "@$ui5.overload") {
									return false;
								}
								if (vResult.length !== 1) {
									return log(WARNING, "Unsupported overloads");
								}
								vResult = vResult[0].$ReturnType;
								sTarget = sTarget + "/0/$ReturnType";
								if (vResult) {
									if (sSegment === "value"
										&& !(mScope[vResult.$Type]
											&& mScope[vResult.$Type].value)) {
										// symbolic name "value" points to primitive return type
										sName = undefined; // block "@sapui.name"
										return true;
									}
									if (!scopeLookup(vResult.$Type, "$Type")) {
										return false;
									}
								}
							}
						}
					}

					// Note: trailing slash is useful to force implicit lookup or $Type insertion
					if (!sSegment) { // empty segment is at end or else...
						return i + 1 >= aSegments.length || log(WARNING, "Invalid empty segment");
					}
					if (sSegment[0] === "@") {
						if (sSegment === "@sapui.name") {
							vResult = sName;
							if (vResult === undefined) {
								log(WARNING, "Unsupported path before @sapui.name");
							} else if (i + 1 < aSegments.length) {
								log(WARNING, "Unsupported path after @sapui.name");
							}
							return false;
						}
						if (sSegment[1] === "@") {
							// computed annotation
							if (i + 1 < aSegments.length) {
								return log(WARNING, "Unsupported path after ", sSegment);
							}
							return computedAnnotation(sSegment, "/"
								+ aSegments.slice(0, i).join("/") + "/"
								+ aSegments[i].slice(0, iIndexOfAt));
						}
					}
					if (!vResult || typeof vResult !== "object") {
						// Note: even an OData path cannot continue here (e.g. by type cast)
						vResult = undefined;
						return log(DEBUG, "Invalid segment: ", sSegment);
					}
					if (bODataMode && sSegment[0] === "@") {
						// annotation(s) via external targeting
						// Note: inline annotations can only be reached via pure "JSON" drill-down,
						//       e.g. ".../$ReturnType/@..."
						vResult = (mScope.$Annotations || {})[sTarget] || {};
						bODataMode = false; // switch to pure "JSON" drill-down
					}
				}

				if (sSegment !== "@") {
					sName = bODataMode || sSegment[0] === "@" ? sSegment : undefined;
					sTarget = bODataMode ? sTarget + "/" + sSegment : undefined;
					vResult = vResult[sSegment];
				}
				return true;
			}

			/*
			 * Takes multiple steps according to the given relative path, starting at the global
			 * scope and changing <code>vResult</code>.
			 *
			 * @param {string} sRelativePath
			 *   Some relative path (semantically, it is absolute as we start at the global scope,
			 *   but it does not begin with a slash!)
			 * @param {string[]} [vNewLocation]
			 *   List of segments up to the point where the relative path has been found (in case
			 *   of indirection)
			 * @returns {boolean}
			 *   Whether to continue after all steps
			 */
			function steps(sRelativePath, vNewLocation) {
				var bContinue;

				if (vLocation) {
					return log(WARNING, "Invalid recursion");
				}
				vLocation = vNewLocation;

				bODataMode = true;
				vResult = mScope;
				bContinue = sRelativePath.split("/").every(step);

				vLocation = undefined;
				return bContinue;
			}

			steps(sResolvedPath.slice(1));

			if (isThenable(vResult)) {
				vResult = vResult.then(function () {
					return that.fetchObject(sPath, oContext, mParameters);
				});
			}

			return vResult;
		});
	};

	/**
	 * Requests the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that gets resolved with the corresponding UI5 type from
	 *   {@link sap.ui.model.odata.type} or rejected with an error; if no specific type can be
	 *   determined, a warning is logged and {@link sap.ui.model.odata.type.Raw} is used
	 *
	 * @private
	 * @see #requestUI5Type
	 */
	ODataMetaModel.prototype.fetchUI5Type = function (sPath) {
		var oMetaContext = this.getMetaContext(sPath),
			that = this;

		if (jQuery.sap.endsWith(sPath, "/$count")) {
			oCountType = oCountType || new Int64();
			return SyncPromise.resolve(oCountType);
		}
		// Note: undefined is more efficient than "" here
		return this.fetchObject(undefined, oMetaContext).then(function (oProperty) {
			var mConstraints,
				sConstraintPath,
				oType = oProperty["$ui5.type"],
				oTypeInfo,
				sTypeName = "sap.ui.model.odata.type.Raw";

			function setConstraint(sKey, vValue) {
				if (vValue !== undefined) {
					mConstraints = mConstraints || {};
					mConstraints[sKey] = vValue;
				}
			}

			if (oType) {
				return oType;
			}

			if (oProperty.$isCollection) {
				jQuery.sap.log.warning("Unsupported collection type, using " + sTypeName,
					sPath, sODataMetaModel);
			} else {
				oTypeInfo = mUi5TypeForEdmType[oProperty.$Type];
				if (oTypeInfo) {
					sTypeName = oTypeInfo.type;
					for (sConstraintPath in oTypeInfo.constraints) {
						setConstraint(oTypeInfo.constraints[sConstraintPath],
							sConstraintPath[0] === "@"
								// external targeting
								? that.getObject(sConstraintPath, oMetaContext)
								: oProperty[sConstraintPath]);
					}
					if (oProperty.$Nullable === false) {
						setConstraint("nullable", false);
					}
				} else {
					jQuery.sap.log.warning("Unsupported type '" + oProperty.$Type + "', using "
						+ sTypeName, sPath, sODataMetaModel);
				}
			}

			oProperty["$ui5.type"] = that.fetchModule(sTypeName).then(function (Type) {
				oType = new Type(undefined, mConstraints);
				oProperty["$ui5.type"] = oType;
				return oType;
			});
			return oProperty["$ui5.type"];
		});
	};

	/**
	 * Fetches the paths and the edit URL required for the update of the given property.
	 * Example: When called on a context with path "/SalesOrderList/0" and a property path
	 * "SO_2_BP/CompanyName", it delivers the editUrl "BusinessPartnerList('42')", the
	 * entityPath "/SalesOrderList/0/SO_2_BP" and the propertyPath "CompanyName".
	 *
	 * @param {string} sPropertyPath
	 *   A path of a property in the OData data model, relative to <code>oContext</code>.
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   A context
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that gets resolved with an object having the following properties:
	 *   <ul>
	 *    <li><code>editUrl</code>: The edit URL or undefined if the entity is transient
	 *    <li><code>entityPath</code>: The resolved, absolute path of the entity to be PATCHed
	 *    <li><code>propertyPath</code>: The path of the property relative to the entity
	 *   </ul>
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchUpdateData = function (sPropertyPath, oContext) {
		var sResolvedPath = this.resolve(sPropertyPath, oContext),
			that = this;

		function error(sMessage) {
			jQuery.sap.log.error(sMessage, sResolvedPath, sODataMetaModel);
			throw new Error(sResolvedPath + ": " + sMessage);
		}

		// First fetch the complete metapath to ensure that everything is in mScope
		// This also ensures that the metadata is valid
		return this.fetchObject(this.getMetaPath(sResolvedPath)).then(function () {
			// Then fetch mScope
			return that.fetchEntityContainer();
		}).then(function (mScope) {
			var aEditUrl,        // The edit URL as array of segments (poss. with promises)
				oEntityContainer = mScope[mScope.$EntityContainer],
				sEntityPath,     // The absolute path to the entity for the PATCH (encoded)
				oEntitySet,      // The entity set that starts the edit URL
				sEntitySetName,  // The name of this entity set (decoded)
				sInstancePath,   // The absolute path to the instance currently in evaluation
								 // (encoded; re-builds sResolvedPath)
				sNavigationPath, // The relative meta path starting from oEntitySet (decoded)
				//sPropertyPath, // The relative path following sEntityPath (parameter re-used -
								 // encoded)
				aSegments,       // The resource path split in segments
				bTransient = false, // Whether there is a transient entity -> no edit URL available
				oType;           // The type of the data at sInstancePath

			// Replaces the last segment in aEditUrl with a a request to append the key predicate
			// for oType and the instance at sInstancePath. Does not calculate it yet, because it
			// might be replaced again later.
			function prepareKeyPredicate() {
				aEditUrl.push({path : sInstancePath, prefix : aEditUrl.pop(), type : oType});
			}

			// Determines the predicate from a segment (empty string if there is none)
			function predicate(sSegment) {
				var i = sSegment.indexOf("(");
				return i >= 0 ? sSegment.slice(i) : "";
			}

			// Strips off the predicate from a segment
			function stripPredicate(sSegment) {
				var i = sSegment.indexOf("(");
				return i >= 0 ? sSegment.slice(0, i) : sSegment;
			}

			aSegments = sResolvedPath.slice(1).split("/");
			aEditUrl = [aSegments.shift()];
			sInstancePath = "/" + aEditUrl[0];
			sEntityPath = sInstancePath;
			sEntitySetName = decodeURIComponent(stripPredicate(aEditUrl[0]));
			oEntitySet = oEntityContainer[sEntitySetName];
			if (!oEntitySet) {
				error("Not an entity set: " + sEntitySetName);
			}
			oType = mScope[oEntitySet.$Type];
			sPropertyPath = "";
			sNavigationPath = "";
			aSegments.forEach(function (sSegment) {
				var oProperty, sPropertyName;

				sInstancePath += "/" + sSegment;
				if (rNumber.test(sSegment)) {
					prepareKeyPredicate();
					sEntityPath += "/" + sSegment;
				} else {
					sPropertyName = decodeURIComponent(stripPredicate(sSegment));
					sNavigationPath = _Helper.buildPath(sNavigationPath, sPropertyName);
					oProperty = oType[sPropertyName];
					if (!oProperty) {
						error("Not a (navigation) property: " + sPropertyName);
					}
					oType = mScope[oProperty.$Type];
					if (oProperty.$kind === "NavigationProperty") {
						if (sNavigationPath in oEntitySet.$NavigationPropertyBinding) {
							sEntitySetName = oEntitySet.$NavigationPropertyBinding[sNavigationPath];
							oEntitySet = oEntityContainer[sEntitySetName];
							sNavigationPath = "";
							aEditUrl = [encodeURIComponent(sEntitySetName) + predicate(sSegment)];
							// A target at a :n navigation property gets its predicate either from
							// the line above or from a subsequent index segment
							if (!oProperty.$isCollection) {
								// A :1 navigation property identifies the target, the set however
								// doesn't -> add the predicate
								// Example: EMPLOYEES('1')/EMPLOYEE_2_TEAM -> TEAMS('A')
								prepareKeyPredicate();
							}
						} else {
							aEditUrl.push(sSegment);
						}
						sEntityPath = sInstancePath;
						sPropertyPath = "";
					} else {
						sPropertyPath = _Helper.buildPath(sPropertyPath, sSegment);
					}
				}
			});
			// aEditUrl may still contain key predicate requests, run them and wait for the promises
			return SyncPromise.all(aEditUrl.map(function (vSegment) {
				if (typeof vSegment === "string") {
					return vSegment;
				}
				// calculate the key predicate asynchronously and append it to the prefix
				return oContext.fetchValue(vSegment.path).then(function (oEntity) {
					if (!oEntity) {
						error("No instance to calculate key predicate at " + vSegment.path);
					}
					if ("@$ui5.transient" in oEntity) {
						bTransient = true;
						return undefined;
					}
					if (!oEntity["@$ui5.predicate"]) {
						error("No key predicate known at " + vSegment.path);
					}
					return vSegment.prefix + oEntity["@$ui5.predicate"];
				}, function (oError) { // enrich the error message with the path
					error(oError.message + " at " + vSegment.path);
				});
			})).then(function (aFinalEditUrl) {
				return {
					editUrl : bTransient ? undefined : aFinalEditUrl.join("/"),
					entityPath : sEntityPath,
					propertyPath : sPropertyPath
				};
			});
		});
	};

	/**
	 * Fetches the value list mappings from the metadata of the given model.
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oValueListModel
	 *   The value list model containing the "ValueListMapping" annotations
	 * @param {string} sNamespace
	 *   The namespace of the property in the data service; only annotations for that namespace are
	 *   observed
	 * @param {object} oProperty
	 *   The property in the data service
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that gets resolved with a map containing all "ValueListMapping" annotations in
	 *   the metadata of the given model by qualifier.
	 *
	 *   It is rejected with an error if the value list model contains annotation targets in the
	 *   namespace of the data service that are not mappings for the given property, or if there are
	 *   no mappings for the given property.
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchValueListMappings = function (oValueListModel, sNamespace,
			oProperty) {
		var that = this,
			oValueListMetaModel = oValueListModel.getMetaModel();

		// We cannot use fetchObject here for two reasons: We only have a property path and not
		// necessarily the property's qualified name, and accessing a property annotation would fail
		// because the value list service does not necessarily have the property. So we choose
		// another way: We inspect all annotations in the value list service and try to resolve the
		// target in the data service.
		return oValueListMetaModel.fetchEntityContainer().then(function (oValueListMetadata) {
			var mAnnotationByTerm,
				mAnnotationMapByTarget = oValueListMetadata.$Annotations,
				mValueListMappingByQualifier = {},
				bValueListOnValueList = that === oValueListMetaModel,
				aTargets;

			// Note: This filter iterates over all targets, but matches at most once
			aTargets = Object.keys(mAnnotationMapByTarget).filter(function (sTarget) {
				if (_Helper.namespace(sTarget) === sNamespace) {
					if (that.getObject("/" + sTarget) === oProperty) {
						// this is the target for the given property
						return true;
					}
					if (!bValueListOnValueList) {
						throw new Error("Unexpected annotation target '" + sTarget
							+ "' with namespace of data service in "
							+ oValueListModel.sServiceUrl);
					}
				}
				return false;
			});

			if (!aTargets.length) {
				throw new Error("No annotation '" + sValueListMapping.slice(1) + "' in " +
					oValueListModel.sServiceUrl);
			}

			mAnnotationByTerm = mAnnotationMapByTarget[aTargets[0]];
			Object.keys(mAnnotationByTerm).forEach(function (sTerm) {
				var sQualifier = getQualifier(sTerm, sValueListMapping);

				if (sQualifier !== undefined) {
					mValueListMappingByQualifier[sQualifier] = mAnnotationByTerm[sTerm];
				} else if (!bValueListOnValueList) {
					throw new Error("Unexpected annotation '" + sTerm.slice(1) +
						"' for target '" + aTargets[0] + "' with namespace of data service in "
						+ oValueListModel.sServiceUrl);
				}
			});

			return mValueListMappingByQualifier;
		});
	};

	/**
	 * Determines which type of value list exists for the given property.
	 *
	 * @param {string} sPropertyPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolved with the type of the value list. It is rejected if the property
	 *   cannot be found in the metadata.
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchValueListType = function (sPropertyPath) {
		var oMetaContext = this.getMetaContext(sPropertyPath),
			that = this;

		// Note: undefined is more efficient than "" here
		return this.fetchObject(undefined, oMetaContext).then(function (oProperty) {
			var mAnnotationByTerm, sTerm;

			if (!oProperty) {
				throw new Error("No metadata for " + sPropertyPath);
			}
			// now we can use getObject() because the property's annotations are definitely loaded
			mAnnotationByTerm = that.getObject("@", oMetaContext);
			if (mAnnotationByTerm[sValueListWithFixedValues]) {
				return ValueListType.Fixed;
			}
			for (sTerm in mAnnotationByTerm) {
				if (getQualifier(sTerm, sValueListReferences) !== undefined
						|| getQualifier(sTerm, sValueListMapping) !== undefined) {
					return ValueListType.Standard;
				}
			}
			return ValueListType.None;
		});
	};

	/**
	 * Returns the module path to the model specific adapter factory.
	 *
	 * @returns {string}
	 *   The module path to the model specific adapter factory
	 *
	 * @private
	 * @see sap.ui.model.MetaModel#getAdapterFactoryModulePath
	 * @since 1.55.0
	 */
	// @override
	ODataMetaModel.prototype.getAdapterFactoryModulePath = function () {
		return "sap/ui/model/odata/v4/meta/ODataAdapterFactory";
	};

	/**
	 * Returns a map of entity tags for each $metadata or annotation file loaded so far.
	 *
	 * @returns {object}
	 *   A map which contains one entry for each $metadata or annotation file loaded so far: the key
	 *   is the file's URL as a <code>string</code> and the value is the <code>string</code> value
	 *   of the "ETag" response header for that file. Initially, the map is empty. If no "ETag"
	 *   response header was sent for a file, the <code>Date</code> value of the "Last-Modified"
	 *   response header is used instead. The value <code>null</code> is used in case no such header
	 *   is sent at all. Note that this map may change due to load-on-demand of "cross-service
	 *   references" (see parameter <code>supportReferences</code> of
	 *   {@link sap.ui.model.odata.v4.ODataModel#constructor}).
	 *
	 * @public
	 * @since 1.51.0
	 */
	ODataMetaModel.prototype.getETags = function () {
		return this.mETags;
	};

	/**
	 * Returns the maximum value of all "Last-Modified" response headers seen so far.
	 *
	 * @returns {Date}
	 *   The maximum value of all "Last-Modified" (or, as a fallback, "Date") response headers seen
	 *   so far when loading $metadata or annotation files. It is <code>new Date(0)</code> initially
	 *   as long as no such files have been loaded. It becomes <code>new Date()</code> as soon as a
	 *   file without such a header is loaded. Note that this value may change due to load-on-demand
	 *   of "cross-service references" (see parameter <code>supportReferences</code> of
	 *   {@link sap.ui.model.odata.v4.ODataModel#constructor}).
	 *
	 * @deprecated Use {@link #getETags} instead because modifications to old files may be
	 *   shadowed by a new file in certain scenarios.
	 * @public
	 * @since 1.47.0
	 */
	ODataMetaModel.prototype.getLastModified = function () {
		return this.dLastModified;
	};

	/**
	 * Returns the OData metadata model context corresponding to the given OData data model path.
	 *
	 * @param {string} sPath
	 *   An absolute data path within the OData data model, for example
	 *   "/EMPLOYEES/0/ENTRYDATE"
	 * @returns {sap.ui.model.Context}
	 *   The corresponding metadata context within the OData metadata model, for example with
	 *   metadata path "/EMPLOYEES/ENTRYDATE"
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getMetaContext = function (sPath) {
		return new BaseContext(this, this.getMetaPath(sPath));
	};

	/**
	 * Returns the OData metadata model path corresponding to the given OData data model path.
	 *
	 * @param {string} sPath
	 *   An absolute data path within the OData data model, for example
	 *   "/EMPLOYEES/0/ENTRYDATE" or "/EMPLOYEES('42')/ENTRYDATE
	 * @returns {string}
	 *   The corresponding metadata path within the OData metadata model, for example
	 *    "/EMPLOYEES/ENTRYDATE"
	 *
	 * @private
	 */
	ODataMetaModel.prototype.getMetaPath = function (sPath) {
		return _Helper.getMetaPath(sPath);
	};

	/**
	 * Creates a value list model for the given mapping URL. Normalizes the path. Caches it and
	 * retrieves it from the cache upon further requests.
	 *
	 * @param {string} sMappingUrl
	 *   The mapping URL, for example "../ValueListService/$metadata"
	 * @returns {sap.ui.model.odata.v4.ODataModel}
	 *   The value list model
	 *
	 * @private
	 */
	ODataMetaModel.prototype.getOrCreateValueListModel = function (sMappingUrl) {
		// Note: make the service URL absolute because URI#absoluteTo requires an absolute base URL
		// (and it fails if the base URL starts with "..")
		var sAbsoluteUrl = new URI(this.sUrl).absoluteTo(document.baseURI).pathname().toString(),
			oValueListModel,
			sValueListUrl;

		// the MappingUrl references the metadata document, make it absolute based on the data
		// service URL to get rid of ".." segments and remove the filename part
		sValueListUrl = new URI(sMappingUrl).absoluteTo(sAbsoluteUrl).filename("").toString();
		oValueListModel = mValueListModelByUrl[sValueListUrl];
		if (!oValueListModel) {
			oValueListModel = new this.oModel.constructor({
				operationMode : OperationMode.Server,
				serviceUrl : sValueListUrl,
				synchronizationMode : "None"
			});
			oValueListModel.setDefaultBindingMode(BindingMode.OneWay);
			mValueListModelByUrl[sValueListUrl] = oValueListModel;
			oValueListModel.oRequestor.mHeaders["X-CSRF-Token"]
				= this.oModel.oRequestor.mHeaders["X-CSRF-Token"];
		}
		return oValueListModel;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#getOriginalProperty
	 * @since 1.37.0
	 */
	// @override
	ODataMetaModel.prototype.getOriginalProperty = function () {
		throw new Error("Unsupported operation: v4.ODataMetaModel#getOriginalProperty");
	};

	/**
	 * Returns the metadata object for the given path relative to the given context. Returns
	 * <code>undefined</code> in case the metadata is not (yet) available. Use
	 * {@link #requestObject} for asynchronous access.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the metadata model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {object} [mParameters]
	 *   Optional (binding) parameters; if they are given, <code>oContext</code> cannot be omitted
	 * @param {object} [mParameters.scope]
	 *   Optional scope for lookup of aliases for computed annotations (since 1.43.0)
	 * @returns {any}
	 *   The requested metadata object if it is already available, or <code>undefined</code>
	 *
	 * @function
	 * @public
	 * @see #requestObject
	 * @see sap.ui.model.Model#getObject
	 * @since 1.37.0
	 */
	// @override
	ODataMetaModel.prototype.getObject = _Helper.createGetMethod("fetchObject");

	/**
	 * @deprecated Use {@link #getObject}.
	 * @function
	 * @public
	 * @see sap.ui.model.Model#getProperty
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getProperty = ODataMetaModel.prototype.getObject;

	/**
	 * Returns the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type. Use
	 * {@link #requestUI5Type} for asynchronous access.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {sap.ui.model.odata.type.ODataType}
	 *   The corresponding UI5 type from {@link sap.ui.model.odata.type}, if all required
	 *   metadata to calculate this type is already available; if no specific type can be
	 *   determined, a warning is logged and {@link sap.ui.model.odata.type.Raw} is used
	 * @throws {Error}
	 *   If the UI5 type cannot be determined synchronously (due to a pending metadata request) or
	 *   cannot be determined at all (due to a wrong data path)
	 *
	 * @function
	 * @public
	 * @see #requestUI5Type
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getUI5Type = _Helper.createGetMethod("fetchUI5Type", true);

	/**
	 * Determines which type of value list exists for the given property.
	 *
	 * @param {string} sPropertyPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {sap.ui.model.odata.v4.ValueListType}
	 *   The type of the value list
	 * @throws {Error}
	 *   If the metadata is not yet loaded or the property cannot be found in the metadata
	 *
	 * @function
	 * @public
	 * @see #requestValueListType
	 * @since 1.45.0
	 */
	ODataMetaModel.prototype.getValueListType
		= _Helper.createGetMethod("fetchValueListType", true);

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @private
	 * @see sap.ui.model.Model#isList
	 */
	ODataMetaModel.prototype.isList = function () {
		throw new Error("Unsupported operation: v4.ODataMetaModel#isList");
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#refresh
	 * @since 1.37.0
	 */
	// @override
	ODataMetaModel.prototype.refresh = function () {
		throw new Error("Unsupported operation: v4.ODataMetaModel#refresh");
	};

	/**
	 * Requests the metadata value for the given path relative to the given context. Returns a
	 * <code>Promise</code> which is resolved with the requested metadata value or rejected with
	 * an error (only in case metadata cannot be loaded). An invalid path leads to an
	 * <code>undefined</code> result and a warning is logged. Use {@link #getObject} for
	 * synchronous access.
	 *
	 * A relative path is appended to the context's path separated by a forward slash("/").
	 * A relative path starting with "@" (that is, an annotation) is appended without a separator.
	 * Use "./" as a prefix for such a relative path to enforce a separator.
	 *
	 * Example:
	 * <pre>
	 * &lt;template:with path="/EMPLOYEES/ENTRYDATE" var="property">
	 *   &lt;!-- /EMPLOYEES/ENTRYDATE/$Type -->
	 *   "{property>$Type}"
	 *
	 *   &lt;!-- /EMPLOYEES/ENTRYDATE@com.sap.vocabularies.Common.v1.Text -->
	 *   "{property>@com.sap.vocabularies.Common.v1.Text}"
	 *
	 *   &lt;!-- /EMPLOYEES/ENTRYDATE/@com.sap.vocabularies.Common.v1.Text -->
	 *   "{property>./@com.sap.vocabularies.Common.v1.Text}"
	 * &lt;/template:with>
	 * </pre>
	 *
	 * The basic idea is that every path described in "14.2.1 Attribute Target" in specification
	 * "OData Version 4.0 Part 3: Common Schema Definition Language" is a valid absolute path
	 * within the metadata model if a leading slash is added; for example
	 * "/" + "MySchema.MyEntityContainer/MyEntitySet/MyComplexProperty/MyNavigationProperty". Also,
	 * every path described in "14.5.2 Expression edm:AnnotationPath",
	 * "14.5.11 Expression edm:NavigationPropertyPath", "14.5.12 Expression edm:Path", and
	 * "14.5.13 Expression edm:PropertyPath" is a valid relative path within the metadata model
	 * if a suitable prefix is added which addresses an entity container, entity set, singleton,
	 * complex type, entity type, or property; for example
	 * "/MySchema.MyEntityType/MyProperty" + "@vCard.Address#work/FullName".
	 *
	 * The absolute path is split into segments and followed step-by-step, starting at the global
	 * scope of all known qualified OData names. There are two technical properties there:
	 * "$Version" (typically "4.0") and "$EntityContainer" with the name of the single entity
	 * container for this metadata model's service.
	 *
	 * An empty segment in between is invalid. An empty segment at the end caused by a trailing
	 * slash differentiates between a name and the object it refers to. This way,
	 * "/$EntityContainer" refers to the name of the single entity container and
	 * "/$EntityContainer/" refers to the single entity container as an object.
	 *
	 * The segment "@sapui.name" refers back to the last OData name (simple identifier or qualified
	 * name) or annotation name encountered during path traversal immediately before "@sapui.name":
	 * <ul>
	 * <li> "/EMPLOYEES@sapui.name" results in "EMPLOYEES" and "/EMPLOYEES/@sapui.name"
	 * results in the same as "/EMPLOYEES/$Type", that is, the qualified name of the entity set's
	 * type (see below how "$Type" is inserted implicitly). Note how the separating slash again
	 * makes a difference here.
	 * <li> "/EMPLOYEES/@com.sap.vocabularies.Common.v1.Label@sapui.name" results in
	 * "@com.sap.vocabularies.Common.v1.Label" and a slash does not make any difference as long as
	 * the annotation does not have a "$Type" property.
	 * <li> A technical property (that is, a numerical segment or one starting with a "$")
	 * immediately before "@sapui.name" is invalid, for example "/$EntityContainer@sapui.name".
	 * </ul>
	 * The path must not continue after "@sapui.name".
	 *
	 * If the current object is a string value, that string value is treated as a relative path and
	 * followed step-by-step before the next segment is processed. Except for this, a path must
	 * not continue if it comes across a non-object value. Such a string value can be a qualified
	 * name (example path "/$EntityContainer/..."), a simple identifier (example path
	 * "/TEAMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/...") or even a path according to
	 * "14.5.12 Expression edm:Path" etc. (example path
	 * "/TEAMS/$Type/@com.sap.vocabularies.UI.v1.LineItem/0/Value/$Path/...").
	 *
	 * Segments starting with an "@" character, for example "@com.sap.vocabularies.Common.v1.Label",
	 * address annotations at the current object. As the first segment, they refer to the single
	 * entity container. For objects which can only be annotated inline (see "14.3 Element
	 * edm:Annotation" minus "14.2.1 Attribute Target"), the object already contains the
	 * annotations as a property. For objects which can (only or also) be annotated via external
	 * targeting, the object does not contain any annotation as a property. Such annotations MUST
	 * be accessed via a path. BEWARE of a special case: Actions, functions and their parameters
	 * can be annotated inline for a single overload or via external targeting for all overloads at
	 * the same time. In this case, the object contains all annotations for the single overload as
	 * a property, but annotations MUST nevertheless be accessed via a path in order to include
	 * also annotations for all overloads at the same time.
	 *
	 * Segments starting with an OData name followed by an "@" character, for example
	 * "/TEAMS@Org.OData.Capabilities.V1.TopSupported", address annotations at an entity set,
	 * singleton, or property, not at the corresponding type. In contrast,
	 * "/TEAMS/@com.sap.vocabularies.Common.v1.Deletable" (note the separating slash) addresses an
	 * annotation at the entity set's type. This is in line with the special rule of
	 * "14.5.12 Expression edm:Path" regarding annotations at a navigation property itself.
	 *
	 * "@" can be used as a segment to address a map of all annotations of the current object. This
	 * is useful for iteration, for example via
	 * <code>&lt;template:repeat list="{entityType>@}" ...></code>.
	 *
	 * Annotations of an annotation are addressed not by two separate segments, but by a single
	 * segment like
	 * "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.Common.v1.TextArrangement". Each
	 * annotation can have a qualifier, for example "@first#foo@second#bar". Note: If the first
	 * annotation's value is a record, a separate segment addresses an annotation of that record,
	 * not an annotation of the first annotation itself.
	 * In a similar way, annotations of "7.2 Element edm:ReferentialConstraint",
	 * "7.3 Element edm:OnDelete", "10.2 Element edm:Member" and
	 * "14.5.14.2 Element edm:PropertyValue" are addressed by segments like
	 * "&lt;7.2.1 Attribute Property>@...", "$OnDelete@...", "&lt;10.2.1 Attribute Name>@..." and
	 * "&lt;14.5.14.2.1 Attribute Property>@..." (where angle brackets denote a variable part and
	 * sections refer to specification "OData Version 4.0 Part 3: Common Schema Definition
	 * Language").
	 *
	 * Annotations starting with "@@", for example
	 * "@@sap.ui.model.odata.v4.AnnotationHelper.isMultiple" or "@@.AH.isMultiple" or
	 * "@@.isMultiple", represent computed annotations. Their name without the "@@" prefix must
	 * refer to a function either in the global namespace (in case of an absolute name) or in
	 * <code>mParameters.scope</code> (in case of a relative name starting with a dot, which is
	 * stripped before lookup; see the <code>&lt;template:alias></code> instruction for XML
	 * Templating). This function is called with the current object (or primitive value) and
	 * additional details and returns the result of this {@link #requestObject} call. The additional
	 * details are given as an object with the following properties:
	 * <ul>
	 * <li><code>{@link sap.ui.model.Context} context</code> Points to the current object
	 * <li><code>{string} schemaChildName</code> The qualified name of the schema child where the
	 *   computed annotation has been found
	 * </ul>
	 * Computed annotations cannot be iterated by "@". The path must not continue after a computed
	 * annotation.
	 *
	 * A segment which represents an OData qualified name is looked up in the global scope ("scope
	 * lookup") and thus determines a schema child which is used later on. Unknown qualified names
	 * are invalid. This way, "/acme.DefaultContainer/EMPLOYEES" addresses the "EMPLOYEES" child of
	 * the schema child named "acme.DefaultContainer". This also works indirectly
	 * ("/$EntityContainer/EMPLOYEES") and implicitly ("/EMPLOYEES", see below).
	 *
	 * A segment which represents an OData simple identifier needs special preparations. The same
	 * applies to the empty segment after a trailing slash.
	 * <ol>
	 * <li> If the current object has a "$Action", "$Function" or "$Type" property, it is used for
	 *    scope lookup first. This way, "/EMPLOYEES/ENTRYDATE" addresses the same object as
	 *    "/EMPLOYEES/$Type/ENTRYDATE", namely the "ENTRYDATE" child of the entity type
	 *    corresponding to the "EMPLOYEES" child of the entity container. The other cases jump from
	 *    an action or function import to the corresponding action or function overloads.
	 * <li> Else if the segment is the first one within its path, the last schema child addressed
	 *    via scope lookup is used instead of the current object. This can only happen indirectly as
	 *    in "/TEAMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/..." where the schema child is the
	 *    entity container and the navigation property binding can contain the simple identifier of
	 *    another entity set within the same container.
	 *
	 *    If the segment is the first one overall, "$EntityContainer" is inserted into the path
	 *    implicitly. In other words, the entity container is used as the initial schema child.
	 *    This way, "/EMPLOYEES" addresses the same object as "/$EntityContainer/EMPLOYEES", namely
	 *    the "EMPLOYEES" child of the entity container.
	 * <li> Afterwards, if the current object is an array, it represents overloads for an action or
	 *    function. Multiple overloads are invalid. The overload's "$ReturnType/$Type" is used for
	 *    scope lookup. This way, "/GetOldestWorker/AGE" addresses the same object as
	 *    "/GetOldestWorker/0/$ReturnType/$Type/AGE". For primitive return types, the special
	 *    segment "value" can be used to refer to the return type itself (see
	 *    {@link sap.ui.model.odata.v4.ODataContextBinding#execute}). This way,
	 *    "/GetOldestAge/value" addresses the same object as "/GetOldestAge/0/$ReturnType" (which
	 *    is needed for automatic type determination, see {@link #requestUI5Type}).
	 * </ol>
	 *
	 * A trailing slash can be used to continue a path and thus force scope lookup or OData simple
	 * identifier preparations, but then stay at the current object. This way, "/EMPLOYEES/$Type/"
	 * addresses the entity type itself corresponding to the "EMPLOYEES" child of the entity
	 * container. Although the empty segment is not an OData simple identifier, it can be used as a
	 * placeholder for one. In this way, "/EMPLOYEES/" addresses the same entity type as
	 * "/EMPLOYEES/$Type/". That entity type in turn is a map of all its OData children (that is,
	 * structural and navigation properties) and determines the set of possible child names that
	 * might be used after the trailing slash.
	 *
	 * Any other segment, including an OData simple identifier, is looked up as a property of the
	 * current object.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the metadata model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {object} [mParameters]
	 *   Optional (binding) parameters; if they are given, <code>oContext</code> cannot be omitted
	 * @param {object} [mParameters.scope]
	 *   Optional scope for lookup of aliases for computed annotations (since 1.43.0)
	 * @returns {Promise}
	 *   A promise which is resolved with the requested metadata value as soon as it is
	 *   available
	 *
	 * @function
	 * @public
	 * @see #getObject
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.requestObject = _Helper.createRequestMethod("fetchObject");

	/**
	 * Requests the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type. Use
	 * {@link #getUI5Type} for synchronous access.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {Promise}
	 *   A promise that gets resolved with the corresponding UI5 type from
	 *   {@link sap.ui.model.odata.type} or rejected with an error; if no specific type can be
	 *   determined, a warning is logged and {@link sap.ui.model.odata.type.Raw} is used
	 *
	 * @function
	 * @public
	 * @see #getUI5Type
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.requestUI5Type
		= _Helper.createRequestMethod("fetchUI5Type");

	/**
	 * Determines which type of value list exists for the given property.
	 *
	 * @param {string} sPropertyPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {Promise}
	 *   A promise that is resolved with the type of the value list, a constant of the enumeration
	 *   {@link sap.ui.model.odata.v4.ValueListType}. The promise is rejected if the property cannot
	 *   be found in the metadata.
	 *
	 * @function
	 * @public
	 * @see #getValueListType
	 * @since 1.47.0
	 */
	ODataMetaModel.prototype.requestValueListType
		= _Helper.createRequestMethod("fetchValueListType");

	/**
	 * Requests information to retrieve a value list for the property given by
	 * <code>sPropertyPath</code>.
	 *
	 * @param {string} sPropertyPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {Promise}
	 *   A promise which is resolved with a map of qualifier to value list mapping objects
	 *   structured as defined by <code>com.sap.vocabularies.Common.v1.ValueListMappingType</code>;
	 *   the map entry with key "" represents the mapping without qualifier. Each entry has an
	 *   additional property "$model" which is the {@link sap.ui.model.odata.v4.ODataModel} instance
	 *   to read value list data via this mapping.
	 *
	 *   For fixed values, only one mapping is expected and the qualifier is ignored. The mapping
	 *   is available with key "".
	 *
	 *   The promise is rejected with an error if there is no value list information available
	 *   for the given property path. Use {@link #getValueListType} to determine if value list
	 *   information exists. It is also rejected with an error if the value list metadata is
	 *   inconsistent.
	 *
	 *   An inconsistency can result from one of the following reasons:
	 *   <ul>
	 *    <li> There is a reference, but the referenced service does not contain mappings for the
	 *     property.
	 *    <li> The referenced service contains annotation targets in the namespace of the data
	 *     service that are not mappings for the property.
	 *    <li> Two different referenced services contain a mapping using the same qualifier.
	 *    <li> A service is referenced twice.
	 *    <li> No mappings have been found.
	 *    <li> There are multiple mappings for a fixed value list.
	 *   </ul>
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataMetaModel.prototype.requestValueListInfo = function (sPropertyPath) {
		var sPropertyMetaPath = this.getMetaPath(sPropertyPath),
			sTypeMetaPath = sPropertyMetaPath.slice(0, sPropertyMetaPath.lastIndexOf("/") + 1),
			that = this;

		return Promise.all([
			this.requestObject(sTypeMetaPath + "@sapui.name"),	// the name of the owning type
			this.requestObject(sPropertyMetaPath),				// the property itself
			this.requestObject(sPropertyMetaPath + "@"),		// all property annotations
																// flag for "fixed values"
			this.requestObject(sPropertyMetaPath + sValueListWithFixedValues)
		]).then(function (aResults) {
			var mAnnotationByTerm = aResults[2],
				bFixedValues = aResults[3],
				mMappingUrlByQualifier = {},
				// Only annotations in the type's namespace are relevant
				sNamespace = _Helper.namespace(aResults[0]),
				oProperty = aResults[1],
				oValueListInfo = {};

			/*
			 * Adds the given mapping to oValueListInfo.
			 *
			 * @param {object} mValueListMapping The mapping
			 * @param {string} sQualifier The mapping qualifier
			 * @param {string} sMappingUrl The mapping URL (for error messages)
			 * @param {sap.ui.model.odata.v4.ODataModel} oModel The value list model
			 * @throws {Error} If there is already a mapping for the given qualifier
			 */
			function addMapping(mValueListMapping, sQualifier, sMappingUrl, oModel) {
				if (mMappingUrlByQualifier[sQualifier]) {
					throw new Error("Annotations '" + sValueListMapping.slice(1)
						+ "' with identical qualifier '" + sQualifier
						+ "' for property " + sPropertyPath + " in "
						+ mMappingUrlByQualifier[sQualifier] + " and " + sMappingUrl);
				}
				if (bFixedValues && oValueListInfo[""]) {
					throw new Error("Annotation '" + sValueListWithFixedValues.slice(1)
						+ "' but multiple '" + sValueListMapping.slice(1)
						+ "' for property " + sPropertyPath);
				}
				mMappingUrlByQualifier[sQualifier] = sMappingUrl;
				oValueListInfo[bFixedValues ? "" : sQualifier] = jQuery.extend(true, {
					$model : oModel
				}, mValueListMapping);
			}

			if (!oProperty) {
				throw new Error("No metadata for " + sPropertyPath);
			}

			Object.keys(mAnnotationByTerm).filter(function (sTerm) {
				return getQualifier(sTerm, sValueListMapping) !== undefined;
			}).forEach(function (sTerm) {
				addMapping(mAnnotationByTerm[sTerm], getQualifier(sTerm, sValueListMapping),
					that.sUrl, that.oModel);
			});


			// filter all reference annotations, for each create a promise to evaluate the mapping
			// and wait for all of them to finish
			return Promise.all(Object.keys(mAnnotationByTerm).filter(function (sTerm) {
				return getQualifier(sTerm, sValueListReferences) !== undefined;
			}).map(function (sTerm) {
				var aMappingUrls = mAnnotationByTerm[sTerm];

				// fetch mappings for each entry and wait for all
				return Promise.all(aMappingUrls.map(function (sMappingUrl) {
					var oValueListModel = that.getOrCreateValueListModel(sMappingUrl);
					// fetch the mappings for the given mapping URL
					return that.fetchValueListMappings(
						oValueListModel, sNamespace, oProperty
					).then(function (mValueListMappingByQualifier) {
						// insert the returned mappings into oValueListInfo
						Object.keys(mValueListMappingByQualifier).forEach(function (sQualifier) {
							addMapping(mValueListMappingByQualifier[sQualifier], sQualifier,
								sMappingUrl, oValueListModel);
						});
					});
				}));
			})).then(function () {
				// Each reference must have contributed at least one qualifier. So if oValueListInfo
				// is empty, there cannot have been a reference.
				if (!Object.keys(oValueListInfo).length) {
					throw new Error("No annotation '" + sValueListReferences.slice(1) + "' for " +
						sPropertyPath);
				}

				return oValueListInfo;
			});
		});
	};

	/**
	 * Resolves the given path relative to the given context. Without a context, a relative path
	 * cannot be resolved and <code>undefined</code> is returned. An absolute path is returned
	 * unchanged. A relative path is appended to the context's path separated by a forward slash
	 * ("/"). A relative path starting with "@" (that is, an annotation) is appended without a
	 * separator. Use "./" as a prefix for such a relative path to enforce a separator.
	 *
	 * Example:
	 * <pre>
	 * &lt;template:with path="/EMPLOYEES/ENTRYDATE" var="property">
	 * &lt;!-- /EMPLOYEES/ENTRYDATE/$Type -->
	 * "{property>$Type}"
	 * &lt;!-- /EMPLOYEES/ENTRYDATE@com.sap.vocabularies.Common.v1.Text -->
	 * "{property>@com.sap.vocabularies.Common.v1.Text}"
	 * &lt;!-- /EMPLOYEES/ENTRYDATE/@com.sap.vocabularies.Common.v1.Text -->
	 * "{property>./@com.sap.vocabularies.Common.v1.Text}"
	 * </pre>
	 *
	 * @param {string} [sPath=""]
	 *   A relative or absolute path within the metadata model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {string}
	 *   Resolved path or <code>undefined</code>
	 * @throws {Error}
	 *   If relative path starts with a dot which is not followed by a forward slash
	 *
	 * @private
	 * @see sap.ui.model.Model#resolve
	 */
	// @override
	ODataMetaModel.prototype.resolve = function (sPath, oContext) {
		var sContextPath,
			sPathFirst;

		if (!sPath) {
			return oContext ? oContext.getPath() : undefined;
		}
		sPathFirst = sPath[0];
		if (sPathFirst === "/") {
			return sPath;
		}
		if (!oContext) {
			return undefined;
		}
		if (sPathFirst === ".") {
			if (sPath[1] !== "/") {
				throw new Error("Unsupported relative path: " + sPath);
			}
			sPath = sPath.slice(2); // BEWARE: sPathFirst !== sPath[0] intentionally now
		}
		sContextPath = oContext.getPath();
		return sPathFirst === "@" || sContextPath.slice(-1) === "/"
			? sContextPath + sPath
			: sContextPath + "/" + sPath;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#setLegacySyntax
	 * @since 1.37.0
	 */
	// @override
	ODataMetaModel.prototype.setLegacySyntax = function () {
		throw new Error("Unsupported operation: v4.ODataMetaModel#setLegacySyntax");
	};

	/**
	 * Returns a string representation of this object including the URL to the $metadata document of
	 * the service.
	 *
	 * @return {string} A string description of this model
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.toString = function () {
		return sODataMetaModel + ": " + this.sUrl;
	};

	/**
	 * Validates the given scope. Checks the OData version, searches for forbidden
	 * $IncludeAnnotations and conflicting $Include. Uses and fills
	 * <code>this.mSchema2MetadataUrl</code>. Computes <code>this.dLastModified</code> and
	 * <code>this.mETags</code>.
	 *
	 * @param {string} sUrl
	 *   The same $metadata URL that _MetadataRequestor#read() takes
	 * @param {object} mScope
	 *   The $metadata "JSON"
	 * @returns {object}
	 *   <code>mScope</code> to allow "chaining"
	 * @throws {Error}
	 *   If validation fails
	 *
	 * @private
	 */
	ODataMetaModel.prototype.validate = function (sUrl, mScope) {
		var i,
			dDate,
			dLastModified,
			sSchema,
			oReference,
			sReferenceUri;

		if (!this.bSupportReferences) {
			return mScope;
		}

		for (sReferenceUri in mScope.$Reference) {
			oReference = mScope.$Reference[sReferenceUri];
			// interpret reference URI relative to metadata URL
			sReferenceUri = new URI(sReferenceUri).absoluteTo(this.sUrl).toString();

			if ("$IncludeAnnotations" in oReference) {
				logAndThrowError("Unsupported IncludeAnnotations", sUrl);
			}
			for (i in oReference.$Include) {
				sSchema = oReference.$Include[i];
				if (sSchema in mScope) {
					logAndThrowError("A schema cannot span more than one document: " + sSchema
						+ " - is both included and defined",
						sUrl);
				} else if (sSchema in this.mSchema2MetadataUrl
					&& this.mSchema2MetadataUrl[sSchema] !== sReferenceUri) {
					logAndThrowError("A schema cannot span more than one document: " + sSchema
						+ " - expected reference URI " + this.mSchema2MetadataUrl[sSchema]
						+ " but instead saw " + sReferenceUri,
						sUrl);
				}
				this.mSchema2MetadataUrl[sSchema] = sReferenceUri;
			}
		}

		// handle & remove Date, ETag and Last-Modified headers
		dLastModified = mScope.$LastModified ? new Date(mScope.$LastModified) : null;
		this.mETags[sUrl] = mScope.$ETag ? mScope.$ETag : dLastModified;
		dDate = mScope.$Date ? new Date(mScope.$Date) : new Date();
		dLastModified = dLastModified || dDate; // @see #getLastModified
		if (this.dLastModified < dLastModified) {
			this.dLastModified = dLastModified;
		}
		delete mScope.$Date;
		delete mScope.$ETag;
		delete mScope.$LastModified;

		return mScope;
	};

	return ODataMetaModel;
});
