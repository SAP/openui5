/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataMetaModel
sap.ui.define([
	"./ValueListType",
	"./lib/_Helper",
	"sap/base/assert",
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ClientListBinding",
	"sap/ui/model/Context",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/MetaModel",
	"sap/ui/model/PropertyBinding",
	"sap/ui/model/odata/OperationMode",
	// load all modules for predefined OData types upfront so that ODataPropertyBinding#checkUpdate
	// does not lead to a new task just because the module of the auto-detected type is not loaded
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/odata/type/Byte",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/type/Double",
	"sap/ui/model/odata/type/Guid",
	"sap/ui/model/odata/type/Int16",
	"sap/ui/model/odata/type/Int32",
	"sap/ui/model/odata/type/Int64",
	"sap/ui/model/odata/type/Raw",
	"sap/ui/model/odata/type/SByte",
	"sap/ui/model/odata/type/Single",
	"sap/ui/model/odata/type/Stream",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/type/TimeOfDay",
	"sap/ui/thirdparty/URI"
], function (ValueListType, _Helper, assert, Log, ObjectPath, SyncPromise, BindingMode,
		ChangeReason, ClientListBinding, BaseContext, ContextBinding, MetaModel, PropertyBinding,
		OperationMode, Boolean, Byte, EdmDate, DateTimeOffset, Decimal, Double, Guid, Int16, Int32,
		Int64, Raw, SByte, Single, Stream, String, TimeOfDay, URI) {
	"use strict";
	/*global Map */
	/*eslint max-nested-callbacks: 0 */

	var oCountType,
		mCodeListUrl2Promise = new Map(),
		DEBUG = Log.Level.DEBUG,
		rNumber = /^-?\d+$/,
		ODataMetaContextBinding,
		ODataMetaListBinding,
		sODataMetaModel = "sap.ui.model.odata.v4.ODataMetaModel",
		ODataMetaPropertyBinding,
		rPredicate = /\(.*\)$/,
		oRawType = new Raw(),
		mSharedModelByUrl = new Map(),
		mSupportedEvents = {
			messageChange : true
		},
		mUi5TypeForEdmType = {
			"Edm.Boolean" : {Type : Boolean},
			"Edm.Byte" : {Type : Byte},
			"Edm.Date" : {Type : EdmDate},
			"Edm.DateTimeOffset" : {
				constraints : {
					"$Precision" : "precision"
				},
				Type : DateTimeOffset
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
				Type : Decimal
			},
			"Edm.Double" : {Type : Double},
			"Edm.Guid" : {Type : Guid},
			"Edm.Int16" : {Type : Int16},
			"Edm.Int32" : {Type : Int32},
			"Edm.Int64" : {Type : Int64},
			"Edm.SByte" : {Type : SByte},
			"Edm.Single" : {Type : Single},
			"Edm.Stream" : {Type : Stream},
			"Edm.String" : {
				constraints : {
					"@com.sap.vocabularies.Common.v1.IsDigitSequence" : "isDigitSequence",
					"$MaxLength" : "maxLength"
				},
				Type : String
			},
			"Edm.TimeOfDay" : {
				constraints : {
					"$Precision" : "precision"
				},
				Type : TimeOfDay
			}
		},
		UNBOUND = {},
		sValueList = "@com.sap.vocabularies.Common.v1.ValueList",
		sValueListMapping = "@com.sap.vocabularies.Common.v1.ValueListMapping",
		sValueListReferences = "@com.sap.vocabularies.Common.v1.ValueListReferences",
		sValueListWithFixedValues = "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues",
		WARNING = Log.Level.WARNING;

	/**
	 * Adds the given reference URI to the map of reference URIs for schemas.
	 *
	 * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel
	 *   The OData metadata model
	 * @param {string} sSchema
	 *   A namespace of a schema, for example "foo.bar."
	 * @param {string} sReferenceUri
	 *   A URI to the metadata document for the given schema
	 * @param {string} [sDocumentUri]
	 *   The URI to the metadata document containing the given reference to the given schema
	 * @throws {Error}
	 *   If the schema has already been loaded from a different URI
	 */
	function addUrlForSchema(oMetaModel, sSchema, sReferenceUri, sDocumentUri) {
		var sUrl0,
			mUrls = oMetaModel.mSchema2MetadataUrl[sSchema];

		if (!mUrls) {
			mUrls = oMetaModel.mSchema2MetadataUrl[sSchema] = {};
			mUrls[sReferenceUri] = false;
		} else if (!(sReferenceUri in mUrls)) {
			sUrl0 = Object.keys(mUrls)[0];
			if (mUrls[sUrl0]) {
				// document already processed, no different URLs allowed
				reportAndThrowError(oMetaModel, "A schema cannot span more than one document: "
					+ sSchema + " - expected reference URI " + sUrl0 + " but instead saw "
					+ sReferenceUri, sDocumentUri);
			}
			mUrls[sReferenceUri] = false;
		}
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
	 * @throws {Error}
	 *   If the schema has already been loaded and read from a different URI
	 */
	function getOrFetchSchema(oMetaModel, mScope, sSchema, fnLog) {
		var oPromise, sUrl, aUrls, mUrls;

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

		mUrls = oMetaModel.mSchema2MetadataUrl[sSchema];
		if (mUrls) {
			aUrls = Object.keys(mUrls);
			if (aUrls.length > 1) {
				reportAndThrowError(oMetaModel, "A schema cannot span more than one document: "
					+ "schema is referenced by following URLs: " + aUrls.join(", "), sSchema);
			}

			sUrl = aUrls[0];
			mUrls[sUrl] = true;
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
	 * Checks that the term is a ValueList or a ValueListMapping and determines the qualifier.
	 *
	 * @param {string} sTerm
	 *   The term
	 * @returns {string}
	 *   The qualifier or undefined, if the term is not as expected
	 */
	function getValueListQualifier(sTerm) {
		var sQualifier = getQualifier(sTerm, sValueListMapping);

		return sQualifier !== undefined ? sQualifier : getQualifier(sTerm, sValueList);
	}

	/**
	 * Tells whether the given name matches a parameter of at least one of the given overloads, or
	 * is the special name "$ReturnType" and at least one of the given overloads has a return type.
	 *
	 * @param {string} sName
	 *   A path segment which maybe is a parameter name or the special name "$ReturnType"
	 * @param {object[]} aOverloads
	 *   Operation overload(s)
	 * @returns {boolean}
	 *   <code>true</code> iff at least one of the given overloads has a parameter with the given
	 *   name (incl. the special name "$ReturnType")
	 */
	function maybeParameter(sName, aOverloads) {
		return aOverloads.some(function (oOverload) {
			return sName === "$ReturnType"
				? oOverload.$ReturnType
				: oOverload.$Parameter && oOverload.$Parameter.some(function (oParameter) {
					return oParameter.$Name === sName;
				});
		});
	}

	/**
	 * Merges the given schema's annotations into the root scope's $Annotations.
	 *
	 * @param {object} oSchema
	 *   a schema; schema children are ignored because they do not contain $Annotations
	 * @param {object} mAnnotations
	 *   the root scope's $Annotations
	 * @param {boolean} [bPrivileged=false]
	 *   whether the schema has been loaded from a privileged source and thus may overwrite
	 *   existing annotations
	 */
	function mergeAnnotations(oSchema, mAnnotations, bPrivileged) {
		var sTarget;

		/*
		 * "PUT" semantics on term/qualifier level, only privileged sources may overwrite.
		 *
		 * @param {object} oTarget
		 *   The target object (which is modified)
		 * @param {object} oSource
		 *   The source object
		 */
		function extend(oTarget, oSource) {
			var sName;

			for (sName in oSource) {
				if (bPrivileged || !(sName in oTarget)) {
					oTarget[sName] = oSource[sName];
				}
			}
		}

		for (sTarget in oSchema.$Annotations) {
			if (!(sTarget in mAnnotations)) {
				mAnnotations[sTarget] = {};
			}
			extend(mAnnotations[sTarget], oSchema.$Annotations[sTarget]);
		}
		delete oSchema.$Annotations;
	}

	/**
	 * Reports an error with the given message and details and throws it.
	 *
	 * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel
	 *   The OData metadata model
	 * @param {string} sMessage
	 *   Error message
	 * @param {string} sDetails
	 *   Error details
	 * @throws {Error}
	 */
	function reportAndThrowError(oMetaModel, sMessage, sDetails) {
		var oError = new Error(sDetails + ": " + sMessage);

		oMetaModel.oModel.reportError(sMessage, sODataMetaModel, oError);
		throw oError;
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
				assert(!oContext || oContext.getModel() === oModel,
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
				assert(!oContext || oContext.getModel() === this.oModel,
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
			bIterateAnnotations = sResolvedPath.endsWith("@");
			if (!bIterateAnnotations && !sResolvedPath.endsWith("/")) {
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
					// filter annotations iff not iterating them
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
			this.iCurrentLength = Math.min(iLength || Infinity, this.iLength - this.iCurrentStart,
				this.oModel.iSizeLimit);
			return this.getCurrentContexts();
		},

		// @override
		// @see sap.ui.model.ListBinding#getCurrentContexts
		getCurrentContexts : function () {
			var aContexts = [],
				i,
				n = this.iCurrentStart + this.iCurrentLength;

			for (i = this.iCurrentStart; i < n; i += 1) {
				aContexts.push(this.oList[this.aIndices[i]]);
			}
			if (this.oList.dataRequested) {
				aContexts.dataRequested = true;
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
				aContexts.dataRequested = true;
			}
			this.setContexts(aContexts);
		}
	});

	/**
	 * @class Property binding implementation for the OData metadata model.
	 *
	 * @extends sap.ui.model.PropertyBinding
	 * @private
	 */
	ODataMetaPropertyBinding
		= PropertyBinding.extend("sap.ui.model.odata.v4.ODataMetaPropertyBinding", {
			constructor : function () {
				PropertyBinding.apply(this, arguments);
				this.vValue = undefined;
			},

			// Updates the binding's value and sends a change event if the <code>bForceUpdate</code>
			// parameter is set to <code>true</code> or if the value has changed.
			// If the binding parameter <code>$$valueAsPromise</code> is <code>true</code> and the
			// value cannot be fetched synchronously then <code>getValue</code> returns a
			// <code>Promise</code> resolving with the value. After the value is resolved a second
			// change event is fired and <code>getValue</code> returns the value itself.
			//
			// @param {boolean} [bForceUpdate=false]
			//   If <code>true</code>, the change event is always fired.
			// @param {sap.ui.model.ChangeReason} [sChangeReason=ChangeReason.Change]
			//   The change reason for the change event
			// @override
			// @see sap.ui.model.Binding#checkUpdate
			checkUpdate : function (bForceUpdate, sChangeReason) {
				var oPromise,
					that = this;

				function setValue(vValue) {
					if (bForceUpdate || vValue !== that.vValue) {
						that.vValue = vValue;
						that._fireChange({
							reason : sChangeReason || ChangeReason.Change
						});
					}
					return vValue;
				}

				oPromise = this.oModel.fetchObject(this.sPath, this.oContext, this.mParameters)
					.then(setValue);
				if (this.mParameters && this.mParameters.$$valueAsPromise && oPromise.isPending()) {
					setValue(oPromise.unwrap());
				}
			},

			// May return a <code>Promise</code> instead of the value if the binding parameter
			// <code>$$valueAsPromise</code> is <code>true</code>
			// @override
			// @see sap.ui.model.PropertyBinding#getValue
			getValue : function () {
				return this.vValue;
			},

			// @override
			// @see sap.ui.model.Binding#setContext
			setContext : function (oContext) {
				if (this.oContext !== oContext) {
					this.oContext = oContext;
					if (this.bRelative) {
						this.checkUpdate(false, ChangeReason.Context);
					}
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
	 * @hideconstructor
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
			// maps the schema name to a map containing the URL references for the schema as key
			// and a boolean value whether the schema has been read already as value; the URL
			// reference is used by _MetadataRequestor#read()
			// Example:
			// mSchema2MetadataUrl = {
			//   "A." : {"/A/$metadata" : false}, // namespace not yet read
			//   // multiple references are ok as long as they are not read
			//   "A.A." : {"/A/$metadata" : false, "/A/V2/$metadata" : false},
			//   "B." : {"/B/$metadata" : true} // namespace already read
			// }
			this.mSchema2MetadataUrl = {};
			this.mSupportedBindingModes = {"OneTime" : true, "OneWay" : true};
			this.bSupportReferences = bSupportReferences !== false; // default is true
			// ClientListBinding#filter calls checkFilterOperation on the model; ClientModel does
			// not support "All" and "Any" filters
			this.mUnsupportedFilterOperators = {"All" : true, "Any" : true};
			this.sUrl = sUrl;
		}
	});

	/**
	 * Indicates that the property bindings of this model support the binding parameter
	 * <code>$$valueAsPromise</code> which allows to return the value as a <code>Promise</code> if
	 * the value cannot be fetched synchronously.
	 *
	 * @private
	 */
	ODataMetaModel.prototype.$$valueAsPromise = true;

	/**
	 * Merges <code>$Annotations</code> from the given $metadata and additional annotation files
	 * into the root scope as a new map of all annotations, called <code>$Annotations</code>.
	 *
	 * @param {object} mScope
	 *   The $metadata "JSON" of the root service
	 * @param {object[]} aAnnotationFiles
	 *   The metadata "JSON" of the additional annotation files
	 * @throws {Error}
	 *   If metadata cannot be merged or if the schema has already been loaded from a different URI
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
				addUrlForSchema(that, sElement, that.sUrl);
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
						reportAndThrowError(that, "A schema cannot span more than one document: "
							+ sQualifiedName, that.aAnnotationUris[i]);
					}
					oElement = mAnnotationScope[sQualifiedName];
					mScope[sQualifiedName] = oElement;
					if (oElement.$kind === "Schema") {
						addUrlForSchema(that, sQualifiedName, that.aAnnotationUris[i]);
						mergeAnnotations(oElement, mScope.$Annotations, true);
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
	 *   Initial application filter(s), see {@link sap.ui.model.ListBinding#filter}; filters with
	 *   filter operators "All" or "Any" are not supported
	 * @returns {sap.ui.model.ListBinding}
	 *   A list binding for this metadata model
	 *
	 * @public
	 * @see #requestObject
	 * @see sap.ui.model.FilterOperator
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
	 * @param {boolean} [mParameters.$$valueAsPromise]
	 *   Whether {@link sap.ui.model.PropertyBinding#getValue} may return a <code>Promise</code>
	 *   resolving with the value (since 1.57.0)
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
	 *   case of success; it is rejected if the requested metadata cannot be loaded, if the context
	 *   path does not point to an entity, if the entity is transient, or if required key properties
	 *   are missing
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchCanonicalPath = function (oContext) {
		return this.fetchUpdateData("", oContext).then(function (oResult) {
			if (!oResult.editUrl) {
				throw new Error(oContext.getPath() + ": No canonical path for transient entity");
			}
			if (oResult.propertyPath) {
				throw new Error("Context " + oContext.getPath()
					+ " does not point to an entity. It should be " + oResult.entityPath);
			}
			return "/" + oResult.editUrl;
		});
	};

	/**
	 * Requests the metadata.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved with the requested metadata as soon as it is available
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchData = function () {
		return this.fetchEntityContainer().then(function (mScope) {
			return JSON.parse(JSON.stringify(mScope));
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
	 * @param {string} sPath
	 *   A relative or absolute path within the metadata model, for example "/EMPLOYEES/ENTRYDATE"
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {object} [mParameters]
	 *   Optional (binding) parameters; if they are given, <code>oContext</code> cannot be omitted
	 * @param {boolean} [mParameters.$$valueAsPromise]
	 *   Whether a computed annotation may return a <code>Promise</code> resolving with its value
	 *   (since 1.57.0)
	 * @param {object} [mParameters.scope]
	 *   Optional scope for lookup of aliases for computed annotations (since 1.43.0)
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved with the requested metadata object as soon as it is available;
	 *   it is rejected if the requested metadata cannot be loaded
	 *
	 * @private
	 * @see #requestObject
	 */
	ODataMetaModel.prototype.fetchObject = function (sPath, oContext, mParameters) {
		var sResolvedPath = this.resolve(sPath, oContext),
			that = this;

		if (!sResolvedPath) {
			Log.error("Invalid relative path w/o context", sPath, sODataMetaModel);
			return SyncPromise.resolve(null);
		}

		return this.fetchEntityContainer().then(function (mScope) {
				// binding parameter's type name ({string}) for overloading of bound operations
				// or UNBOUND ({object}) for unbound operations called via an import
			var vBindingParameterType,
				bInsideAnnotation, // inside an annotation, invalid names are OK
				vLocation, // {string[]|string} location of indirection
				sName, // what "@sapui.name" refers to: OData or annotation name
				bODataMode, // OData navigation mode with scope lookup etc.
				// parent for next "17.2 SimpleIdentifier"...
				// (normally the schema child containing the current object)
				oSchemaChild, // ...as object
				sSchemaChildName, // ...as qualified name
				// annotation target pointing to current object, or undefined
				// (schema child's qualified name plus optional segments)
				sTarget,
				vResult; // current object

			/*
			 * Handles annotation at operation or parameter, taking care of individual versus all
			 * overloads.
			 *
			 * @param {string} sSegment
			 *   The current <code>sSegment</code> of <code>step</code>
			 * @param {string} [sTerm=sSegment]
			 *   The term
			 * @param {string} [sSuffix=""]
			 *   A target suffix to address a parameter
			 * @returns {boolean}
			 *   Whether further steps are needed
			 */
			function annotationAtOperationOrParameter(sSegment, sTerm, sSuffix) {
				var mAnnotationsXAllOverloads,
					iIndexOfAtAt,
					sIndividualOverloadTarget,
					aOverloads,
					sSignature = "";

				if (sTerm) {
					// split trailing computed annotation
					iIndexOfAtAt = sTerm.indexOf("@@");
					if (iIndexOfAtAt > 0) {
						sTerm = sTerm.slice(0, iIndexOfAtAt);
					}
					// Note: The case that sTerm includes @sapui.name need not be handled here.
					// sTerm is used below only to determine the correct annotation target, but that
					// does not matter because the term's name can be determined nevertheless.
				} else {
					sTerm = sSegment;
				}

				sSuffix = sSuffix || "";
				if (vBindingParameterType) {
					oSchemaChild = aOverloads = vResult.filter(isRightOverload);
					if (aOverloads.length !== 1) {
						return log(WARNING, "Expected a single overload, but found "
							+ aOverloads.length);
					}
					if (vBindingParameterType !== UNBOUND) {
						sSignature = aOverloads[0].$Parameter[0].$isCollection
							? "Collection(" + vBindingParameterType + ")"
							: vBindingParameterType;
					}
					sIndividualOverloadTarget = sTarget + "(" + sSignature + ")" + sSuffix;
					if (mScope.$Annotations[sIndividualOverloadTarget]) {
						if (sTerm === "@") {
							vResult = mScope.$Annotations[sIndividualOverloadTarget];
							mAnnotationsXAllOverloads = mScope.$Annotations[sTarget + sSuffix];
							if (mAnnotationsXAllOverloads) {
								vResult = Object.assign({}, mAnnotationsXAllOverloads, vResult);
							}
							// sTarget does not matter because no further steps follow
							return false; // no further steps must happen
						}
						if (sTerm in mScope.$Annotations[sIndividualOverloadTarget]) {
							// "external targeting of individual operation overload"
							sTarget = sIndividualOverloadTarget;
							vResult = mScope; // see below
							return true;
						}
					}
				}

				// "the annotation applies to all overloads of the action or function or all
				// parameters of that name across all overloads" [OData-Part3]
				sTarget += sSuffix;
				// any object (no array!) should do here to skip repeated handling of overloads
				vResult = mScope;
				return true;
			}

			/*
			 * Calls a computed annotation according to the given segment which was found at the
			 * given path; changes <code>vResult</code> accordingly.
			 *
			 * @param {string} sSegment
			 *   Contains the name of the computed annotation as "@@..."
			 * @param {string} sPath
			 *   Path where the segment was found
			 * @returns {boolean}
			 *   <code>true</code>
			 */
			function computedAnnotation(sSegment, sPath) {
				var fnAnnotation,
					iThirdAt = sSegment.indexOf("@", 2);

				if (iThirdAt > -1) {
					return log(WARNING, "Unsupported path after ", sSegment.slice(0, iThirdAt));
				}

				sSegment = sSegment.slice(2);
				fnAnnotation = sSegment[0] === "."
					? ObjectPath.get(sSegment.slice(1), mParameters.scope)
					: mParameters && ObjectPath.get(sSegment, mParameters.scope)
						|| (sSegment === "requestCurrencyCodes"
							|| sSegment === "requestUnitsOfMeasure"
							? that[sSegment].bind(that)
							: ObjectPath.get(sSegment));
				if (typeof fnAnnotation !== "function") {
					// Note: "varargs" syntax does not help because Array#join ignores undefined
					return log(WARNING, sSegment, " is not a function but: " + fnAnnotation);
				}

				try {
					vResult = fnAnnotation(vResult, {
						$$valueAsPromise : mParameters && mParameters.$$valueAsPromise,
						context : new BaseContext(that, sPath),
						schemaChildName : sSchemaChildName,
						// Note: length === 1 implies Array.isArray(oSchemaChild)
						overload : oSchemaChild.length === 1 ? oSchemaChild[0] : undefined
					});
				} catch (e) {
					log(WARNING, "Error calling ", sSegment, ": ", e);
				}

				return true;
			}

			/*
			 * Tells whether the given segment matches a parameter of the given overload, or is the
			 * special name "$ReturnType" and the given overload has a return type; changes
			 * <code>vResult</code> etc. accordingly.
			 *
			 * @param {string} sSegment
			 *   A segment (may be empty)
			 * @param {object} oOverload
			 *   A single operation overload
			 * @returns {boolean}
			 *   <code>true</code> iff the given overload has a parameter with the given name
			 *   (incl. the special name "$ReturnType")
			 */
			function isParameter(sSegment, oOverload) {
				var aMatches;

				if (sSegment === "$ReturnType") {
					if (oOverload.$ReturnType) {
						vResult = oOverload.$ReturnType;
						return true;
					}
				} else if (sSegment && oOverload.$Parameter) {
					aMatches = oOverload.$Parameter.filter(function (oParameter) {
						return oParameter.$Name === sSegment;
					});
					if (aMatches.length) { // there can be at most one match
						// Note: annotations at operation or parameter are handled before this
						// method is called; @see annotationAtOperationOrParameter
						vResult = aMatches[0];
						return true;
					}
				}

				return false;
			}

			/*
			 * Tells whether the given overload is the right one.
			 *
			 * @param {object} oOverload
			 *   A single operation overload
			 * @returns {boolean}
			 *   <code>true</code> iff the given overload is an operation with the appropriate
			 *   binding parameter (bound and unbound cases).
			 */
			function isRightOverload(oOverload) {
				return !oOverload.$IsBound && vBindingParameterType === UNBOUND
					|| oOverload.$IsBound
					&& vBindingParameterType === oOverload.$Parameter[0].$Type;
			}

			/*
			 * Outputs a log message for the given level. Leads to an <code>undefined</code> result
			 * in case of a WARNING.
			 *
			 * @param {sap.base.Log.Level} iLevel
			 *   A log level, either DEBUG or WARNING
			 * @param {...string} aTexts
			 *   The main text of the message is constructed from the rest of the arguments by
			 *   joining them
			 * @returns {boolean}
			 *   <code>false</code>
			 */
			function log(iLevel) {
				var sLocation;

				if (Log.isLoggable(iLevel, sODataMetaModel)) {
					sLocation = Array.isArray(vLocation)
						? vLocation.join("/")
						: vLocation;
					Log[iLevel === DEBUG ? "debug" : "warning"](
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
					if (!SyncPromise.isThenable(vResult)) {
						return true; // qualified name found, steps may continue
					}
				}

				if (SyncPromise.isThenable(vResult) && vResult.isPending()) {
					// load on demand still pending (else it must be rejected at this point)
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
				var iIndexOfAt, bSplitSegment;

				if (sSegment === "$Annotations") {
					return log(WARNING, "Invalid segment: $Annotations");
				}

				if (i && typeof vResult === "object" && sSegment in vResult) {
					// fast path for pure "JSON" drill-down, but this cannot replace scopeLookup()!
					if (sSegment[0] === "$" || rNumber.test(sSegment)) {
						bODataMode = false; // technical property, switch to pure "JSON" drill-down
					}
				} else {
					// split trailing computed annotation, @sapui.name, or annotation
					iIndexOfAt = sSegment.indexOf("@@");
					if (iIndexOfAt < 0) {
						if (sSegment.endsWith("@sapui.name")) {
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
						&& !(bSplitSegment && (sSegment === "@sapui.name" || sSegment[1] === "@"))
						// indirection: treat string content as a meta model path unless followed by
						// a computed annotation
						&& !steps(vResult, aSegments.slice(0, i))) {
						return false;
					}

					if (bODataMode) {
						if (sSegment[0] === "$"
								&& sSegment !== "$Parameter" && sSegment !== "$ReturnType"
							|| rNumber.test(sSegment)) {
							// technical property, switch to pure "JSON" drill-down
							bODataMode = false;
						} else {
							if (bSplitSegment) {
								// no special preparations needed, but handle overloads below!
							} else if (sSegment[0] !== "@" && sSegment.indexOf(".") > 0) {
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
								vBindingParameterType = UNBOUND;
							} else if (!i) {
								// "17.2 SimpleIdentifier" (or placeholder):
								// lookup inside schema child (which is determined lazily)
								sTarget = sName = sSchemaChildName
									= sSchemaChildName || mScope.$EntityContainer;
								vResult = oSchemaChild = oSchemaChild || mScope[sSchemaChildName];
								if (Array.isArray(vResult) && isParameter(sSegment, vResult[0])) {
									// path evaluation relative to an operation overload
									// @see [OData-CSDL-JSON-v4.01] "14.4.1.2 Path Evaluation"
									return true;
								}
								if (sSegment && sSegment[0] !== "@"
									&& !(sSegment in oSchemaChild)) {
									return log(WARNING, "Unknown child ", sSegment, " of ",
										sSchemaChildName);
								}
							}
							if (Array.isArray(vResult)) { // operation overloads
								if (sSegment === "$Parameter") {
									return true;
								}
								if (sSegment.startsWith("@$ui5.overload@")) {
									// useful to force annotation at unbound operation overload
									sSegment = sSegment.slice(14);
									bSplitSegment = true;
								}
								if (bSplitSegment) {
									if (sSegment[1] !== "@"
										&& !annotationAtOperationOrParameter(sSegment)) {
										return false;
									}
								} else {
									if (sSegment !== aSegments[i]
										&& aSegments[i][sSegment.length + 1] !== "@"
										&& maybeParameter(sSegment, vResult)) { // not looking for
										// parameter itself, but for annotation at parameter
										// (incl. the special name "$ReturnType")
										sName = sSegment;
										return annotationAtOperationOrParameter(sSegment,
											aSegments[i].slice(sSegment.length), "/" + sName);
									}
									if (vBindingParameterType) {
										vResult = vResult.filter(isRightOverload);
									}
									if (sSegment === "@$ui5.overload") {
										return true;
									}
									if (vResult.length !== 1) {
										return log(WARNING, "Expected a single overload, but found "
											+ vResult.length);
									}
									if (isParameter(sSegment, vResult[0])) {
										return true;
									}
									vResult = vResult[0].$ReturnType;
									sTarget += "/0/$ReturnType"; // for logWithLocation() only
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
									if (!sSegment) { // empty segment forces $ReturnType insertion
										return true;
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
							return computedAnnotation(sSegment, [""].concat(aSegments.slice(0, i),
								aSegments[i].slice(0, iIndexOfAt)).join("/"));
						}
					}
					if (!vResult || typeof vResult !== "object") {
						// Note: even an OData path cannot continue here (e.g. by type cast)
						vResult = undefined;
						return !bInsideAnnotation && log(DEBUG, "Invalid segment: ", sSegment);
					}
					if (bODataMode && sSegment[0] === "@") {
						// annotation(s) via external targeting
						// Note: inline annotations can only be reached via pure "JSON" drill-down,
						//       e.g. ".../$ReferentialConstraint/...@..."
						vResult = mScope.$Annotations[sTarget] || {};
						bODataMode = false; // switch to pure "JSON" drill-down
					} else if (sSegment === "$" && i + 1 < aSegments.length) {
						return log(WARNING, "Unsupported path after $");
					}
				}

				if (sSegment !== "@" && sSegment !== "$") {
					if (sSegment[0] === "@") {
						bInsideAnnotation = true;
					}
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

				bInsideAnnotation = false;
				bODataMode = true;
				vResult = mScope;
				bContinue = sRelativePath.split("/").every(step);

				vLocation = undefined;
				return bContinue;
			}

			if (!steps(sResolvedPath.slice(1)) && SyncPromise.isThenable(vResult)) {
				// try again after getOrFetchSchema's promise has resolved,
				// but avoid endless loop for computed annotations returning a promise!
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
	 *   {@link sap.ui.model.odata.type}; if no specific type can be determined, a warning is logged
	 *   and {@link sap.ui.model.odata.type.Raw} is used
	 *
	 * @private
	 * @see #requestUI5Type
	 */
	ODataMetaModel.prototype.fetchUI5Type = function (sPath) {
		var oMetaContext = this.getMetaContext(sPath),
			that = this;

		if (sPath.endsWith("/$count")) {
			oCountType = oCountType || new Int64();
			return SyncPromise.resolve(oCountType);
		}
		// Note: undefined is more efficient than "" here
		return this.fetchObject(undefined, oMetaContext).catch(function () {
			// do not log, we log a warning "No metadata for path..." afterwards
		}).then(function (oProperty) {
			var oType = oRawType,
				oTypeInfo;

			if (!oProperty) {
				Log.warning("No metadata for path '" + sPath + "', using " + oType.getName(),
					undefined, sODataMetaModel);
				return oType;
			}

			if (oProperty["$ui5.type"]) {
				return oProperty["$ui5.type"];
			}

			if (oProperty.$isCollection) {
				Log.warning("Unsupported collection type, using " + oType.getName(), sPath,
					sODataMetaModel);
			} else {
				oTypeInfo = mUi5TypeForEdmType[oProperty.$Type];
				if (oTypeInfo) {
					oType = new oTypeInfo.Type(undefined,
						that.getConstraints(oProperty, oMetaContext.getPath()));
				} else {
					Log.warning("Unsupported type '" + oProperty.$Type + "', using "
						+ oType.getName(), sPath, sODataMetaModel);
				}
			}
			oProperty["$ui5.type"] = oType;
			return oType;
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
	 * @param {boolean} [bNoEditUrl]
	 *   Whether no edit URL is required
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that gets resolved with an object having the following properties:
	 *   <ul>
	 *    <li><code>editUrl</code>: The edit URL or undefined if the entity is transient
	 *    <li><code>entityPath</code>: The resolved, absolute path of the entity to be PATCHed
	 *    <li><code>propertyPath</code>: The path of the property relative to the entity
	 *   </ul>
	 *   The promise is rejected if the requested metadata cannot be loaded or the key predicate
	 *   cannot be determined.
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchUpdateData = function (sPropertyPath, oContext, bNoEditUrl) {
		var oModel = oContext.getModel(),
			sResolvedPath = oModel.resolve(sPropertyPath, oContext),
			that = this;

		function error(sMessage) {
			var oError = new Error(sResolvedPath + ": " + sMessage);

			oModel.reportError(sMessage, sODataMetaModel, oError);
			throw oError;
		}

		// First fetch the complete metapath to ensure that everything is in mScope
		// This also ensures that the metadata is valid
		return this.fetchObject(this.getMetaPath(sResolvedPath)).then(function () {
			// Then fetch mScope
			return that.fetchEntityContainer();
		}).then(function (mScope) {
			var aEditUrl,        // The edit URL as array of segments (encoded)
				oEntityContainer = mScope[mScope.$EntityContainer],
				sEntityPath,     // The absolute path to the entity for the PATCH (encoded)
				oEntitySet,      // The entity set that starts the edit URL
				sEntitySetName,  // The name of this entity set (decoded)
				sFirstSegment,
				sInstancePath,   // The absolute path to the instance currently in evaluation
								// (encoded; re-builds sResolvedPath)
				sNavigationPath, // The relative meta path starting from oEntitySet (decoded)
				//sPropertyPath, // The relative path following sEntityPath (parameter re-used -
								// encoded)
				aSegments,       // The resource path split in segments (encoded)
				oType;           // The type of the data at sInstancePath

			// Determines the predicate from a segment (empty string if there is none)
			function predicate(sSegment) {
				var i = sSegment.indexOf("(");
				return i >= 0 ? sSegment.slice(i) : "";
			}

			// Pushes a request to append the key predicate for oType and the instance at
			// sInstancePath. Does not calculate it yet, because it might be replaced again later.
			function prepareKeyPredicate(sSegment) {
				aEditUrl.push({path : sInstancePath, prefix : sSegment, type : oType});
			}

			// Strips off the predicate from a segment
			function stripPredicate(sSegment) {
				var i = sSegment.indexOf("(");
				return i >= 0 ? sSegment.slice(0, i) : sSegment;
			}

			// The segment is added to the edit URL; transient predicate is converted to real
			// predicate
			function pushToEditUrl(sSegment) {
				if (sSegment.includes("($uid=")) {
					prepareKeyPredicate(stripPredicate(sSegment));
				} else {
					aEditUrl.push(sSegment);
				}
			}

			aSegments = sResolvedPath.slice(1).split("/");
			sFirstSegment = aSegments.shift();
			sInstancePath = "/" + sFirstSegment;
			sEntityPath = sInstancePath;
			sEntitySetName = decodeURIComponent(stripPredicate(sFirstSegment));
			oEntitySet = oEntityContainer[sEntitySetName];
			if (!oEntitySet) {
				error("Not an entity set: " + sEntitySetName);
			}
			oType = mScope[oEntitySet.$Type];
			sPropertyPath = "";
			sNavigationPath = "";
			aEditUrl = [];
			pushToEditUrl(sFirstSegment);
			aSegments.forEach(function (sSegment) {
				var oProperty, sPropertyName;

				sInstancePath += "/" + sSegment;
				if (rNumber.test(sSegment)) {
					prepareKeyPredicate(aEditUrl.pop());
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
						if (oEntitySet.$NavigationPropertyBinding
								&& sNavigationPath in oEntitySet.$NavigationPropertyBinding) {
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
								prepareKeyPredicate(aEditUrl.pop());
							}
						} else {
							pushToEditUrl(sSegment);
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
					var sPredicate;

					if (!oEntity) {
						if (bNoEditUrl) {
							return undefined;
						}
						error("No instance to calculate key predicate at " + vSegment.path);
					}
					if (_Helper.hasPrivateAnnotation(oEntity, "transient")) {
						bNoEditUrl = true;
						return undefined;
					}
					sPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate");
					if (!sPredicate) {
						error("No key predicate known at " + vSegment.path);
					}
					return vSegment.prefix + sPredicate;
				}, function (oError) { // enrich the error message with the path
					error(oError.message + " at " + vSegment.path);
				});
			})).then(function (aFinalEditUrl) {
				return {
					editUrl : bNoEditUrl ? undefined : aFinalEditUrl.join("/"),
					entityPath : sEntityPath,
					propertyPath : sPropertyPath
				};
			});
		});
	};

	/**
	 * Fetches the value list mappings for a property or an operation parameter from the metadata of
	 * the given model.
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oValueListModel
	 *   The value list model containing the "ValueListMapping" annotations
	 * @param {string} sQualifiedParentName
	 *   The qualified name of the structured type containing the property or the operation
	 *   containing the parameter; only annotations for its namespace are observed
	 * @param {object} oProperty
	 *   The metadata for the property or the operation parameter in the data service
	 * @param {object[]} [aOverloads]
	 *   The list of operation overloads in case of an operation parameter, must contain exactly one
	 *   entry (which means that the parameter's binding path exactly matches one overload)
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that gets resolved with a map containing all "ValueListMapping" annotations in
	 *   the metadata of the given model by qualifier.
	 *
	 *   It is rejected with an error if the value list model contains annotation targets in the
	 *   namespace of the data service that are not mappings for the given target, if there are
	 *   no mappings for the given target, or if there is not exactly one overload for an operation
	 *   parameter.
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchValueListMappings = function (oValueListModel,
			sQualifiedParentName, oProperty, aOverloads) {
		var that = this,
			oValueListMetaModel = oValueListModel.getMetaModel();

		/**
		 * Determines the annotation target for the specific overload.
		 *
		 * @returns {string} The annotation target
		 */
		function getOverloadTarget () {
			var oOverload = aOverloads[0],
				sSignature = "";

			if (aOverloads.length !== 1) {
				throw new Error("Expected a single overload, but found " + aOverloads.length);
			}
			if (oOverload.$IsBound) {
				sSignature = oOverload.$Parameter[0].$isCollection
					? "Collection(" + oOverload.$Parameter[0].$Type + ")"
					: oOverload.$Parameter[0].$Type;
			}
			return sQualifiedParentName + "(" + sSignature + ")";
		}

		// We cannot use fetchObject here for two reasons: We only have a property path and not
		// necessarily the property's qualified name, and accessing a property annotation would fail
		// because the value list service does not necessarily have the property. So we choose
		// another way: We inspect all annotations in the value list service and try to resolve the
		// target in the data service.
		return oValueListMetaModel.fetchEntityContainer().then(function (oValueListMetadata) {
			var mAnnotationByTerm,
				mAnnotationMapByTarget = oValueListMetadata.$Annotations,
				sIndividualOverloadTarget,
				sNamespace = _Helper.namespace(sQualifiedParentName),
				mValueListMappingByQualifier = {},
				bValueListOnValueList = that === oValueListMetaModel,
				aTargets,
				sXAllOverloadsTarget;

			// operation parameters (those with $Name) require a different target
			// Note: in this case, we need to determine the target from the overload
			if (oProperty.$Name) {
				sIndividualOverloadTarget = getOverloadTarget() + "/" + oProperty.$Name;
				sXAllOverloadsTarget = sQualifiedParentName + "/" + oProperty.$Name;
			}

			// Note: This filter iterates over all targets, but matches at most twice
			aTargets = Object.keys(mAnnotationMapByTarget).filter(function (sTarget) {
				if (_Helper.namespace(sTarget) === sNamespace) {
					if (sIndividualOverloadTarget
						? sTarget === sIndividualOverloadTarget || sTarget === sXAllOverloadsTarget
						: that.getObject("/" + sTarget) === oProperty) {
						// this is the target for the given property
						return true;
					}
					if (bValueListOnValueList
							|| sXAllOverloadsTarget
								&& _Helper.getMetaPath(sTarget) === sXAllOverloadsTarget) {
						return false;
					}
					throw new Error("Unexpected annotation target '" + sTarget
						+ "' with namespace of data service in "
						+ oValueListModel.sServiceUrl);
				}
				return false;
			});

			if (!aTargets.length) {
				throw new Error("No annotation '" + sValueList.slice(1) + "' in " +
					oValueListModel.sServiceUrl);
			}

			if (aTargets.length === 1) {
				mAnnotationByTerm = mAnnotationMapByTarget[aTargets[0]];
			} else { // length === 2
				mAnnotationByTerm = Object.assign({}, mAnnotationMapByTarget[sXAllOverloadsTarget],
					mAnnotationMapByTarget[sIndividualOverloadTarget]);
			}

			Object.keys(mAnnotationByTerm).forEach(function (sTerm) {
				var sQualifier = getValueListQualifier(sTerm);

				if (sQualifier !== undefined) {
					mValueListMappingByQualifier[sQualifier] = mAnnotationByTerm[sTerm];
					["CollectionRoot", "SearchSupported"].forEach(function (sProperty) {
						if (sProperty in mAnnotationByTerm[sTerm]) {
							throw new Error("Property '" + sProperty
								+ "' is not allowed in annotation '" + sTerm.slice(1)
								+ "' for target '" + aTargets[0] + "' in "
								+ oValueListModel.sServiceUrl);
						}
					});
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
				if (getQualifier(sTerm, sValueList) !== undefined) {
					return mAnnotationByTerm[sTerm].SearchSupported === false
						? ValueListType.Fixed
						: ValueListType.Standard;
				}
			}
			return ValueListType.None;
		});
	};

	/**
	 * Returns the absolute service URL corresponding to the given relative $metadata URL.
	 *
	 * @param {string} sUrl
	 *   A $metadata URL, for example "../ValueListService/$metadata?sap-client=123", interpreted
	 *   relative to this meta model's URL
	 * @returns {string}
	 *   The corresponding absolute service URL
	 *
	 * @private
	 */
	ODataMetaModel.prototype.getAbsoluteServiceUrl = function (sUrl) {
		// Note: make our $metadata URL absolute because URI#absoluteTo requires an absolute base
		// URL (and it fails if the base URL starts with "..")
		var sAbsoluteUrl = new URI(this.sUrl).absoluteTo(document.baseURI).pathname().toString();

		// sUrl references the metadata document, make it absolute based on our $metadata URL to get
		// rid of ".." segments and remove the filename part
		return new URI(sUrl).absoluteTo(sAbsoluteUrl).filename("").toString();
	};

	/**
	 * Returns the type constraints for the given property.
	 *
	 * @param {object} oProperty
	 *   The property
	 * @param {string} sMetaPath
	 *   The OData metadata model path corresponding to the given property
	 * @returns {object}
	 *   The type constraints for the property or <code>undefined</code> if the property's type is
	 *   not supported
	 *
	 * @private
	 */
	ODataMetaModel.prototype.getConstraints = function (oProperty, sMetaPath) {
		var sConstraintPath,
			mConstraints,
			oTypeConstraints,
			oTypeInfo = mUi5TypeForEdmType[oProperty.$Type];

		/*
		 * Adds a constraint to the map of constraints if a value is given. Does not create the map
		 * or a constraint if not needed.
		 *
		 * @param {string} sKey The constraint's name
		 * @param {any} vValue The contraint's value
		 */
		function setConstraint(sKey, vValue) {
			if (vValue !== undefined) {
				mConstraints = mConstraints || {};
				mConstraints[sKey] = vValue;
			}
		}

		if (oTypeInfo) {
			oTypeConstraints = oTypeInfo.constraints;
			for (sConstraintPath in oTypeConstraints) {
				setConstraint(oTypeConstraints[sConstraintPath],
					sConstraintPath[0] === "@"
						// external targeting
						? this.getObject(sMetaPath + sConstraintPath)
						: oProperty[sConstraintPath]);
			}
			if (oProperty.$Nullable === false) {
				setConstraint("nullable", false);
			}
		}
		return mConstraints;
	};

	/**
	 * Returns a snapshot of each $metadata or annotation file loaded so far, combined into a
	 * single "JSON" object according to the streamlined OData V4 Metadata JSON Format.
	 *
	 * @returns {object}
	 *   The OData metadata as a "JSON" object, if it is already available, or
	 *   <code>undefined</code>.
	 *
	 * @function
	 * @public
	 * @see #requestData
	 * @since 1.59.0
	 */
	ODataMetaModel.prototype.getData = _Helper.createGetMethod("fetchData");

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
	 * @deprecated As of 1.51.0, use {@link #getETags} instead because modifications to old files
	 *   may be shadowed by a new file in certain scenarios.
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
	 * Creates an OData model for the given URL, normalizes the path, caches it, and retrieves it
	 * from the cache upon further requests. The model is read-only ("OneWay") and can, thus, safely
	 * be shared. It shares this meta model's security token.
	 *
	 * @param {string} sUrl
	 *   The (relative) $metadata URL, for example "../ValueListService/$metadata"
	 * @param {string} [sGroupId]
	 *   The group ID, for example "$direct"
	 * @param {boolean} [bAutoExpandSelect=false]
	 *   Whether the model is to be created with autoExpandSelect
	 * @returns {sap.ui.model.odata.v4.ODataModel}
	 *   The value list model
	 *
	 * @private
	 */
	ODataMetaModel.prototype.getOrCreateSharedModel = function (sUrl, sGroupId, bAutoExpandSelect) {
		var sCacheKey,
			oSharedModel;

		sUrl = this.getAbsoluteServiceUrl(sUrl);
		sCacheKey = !!bAutoExpandSelect + sUrl;
		oSharedModel = mSharedModelByUrl.get(sCacheKey);
		if (!oSharedModel) {
			oSharedModel = new this.oModel.constructor({
				autoExpandSelect : bAutoExpandSelect,
				groupId : sGroupId,
				httpHeaders : this.oModel.getHttpHeaders(),
				operationMode : OperationMode.Server,
				serviceUrl : sUrl,
				synchronizationMode : "None"
			});
			oSharedModel.setDefaultBindingMode(BindingMode.OneWay);
			mSharedModelByUrl.set(sCacheKey, oSharedModel);
		}
		return oSharedModel;
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
	 * @deprecated As of 1.37.0, use {@link #getObject}.
	 * @function
	 * @public
	 * @see sap.ui.model.Model#getProperty
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getProperty = ODataMetaModel.prototype.getObject;

	/**
	 * Reduces the given path based on metadata. Removes adjacent partner navigation properties and
	 * reduces binding paths to properties of an operation's binding parameter.
	 *
	 * Examples:
	 * The reduced binding path for "/SalesOrderList(42)/SO_2_SOITEM(20)/SOITEM_2_SO/Note" is
	 * "/SalesOrderList(42)/Note" iff "SO_2_SOITEM" and "SOITEM_2_SO" are marked as partners of each
	 * other.
	 * "/Employees(42)/name.space.AcIncreaseSalaryByFactor(...)/$Parameter/_it/Name" is reduced to
	 * "/Employees(42)/Name" if "_it" is the binding parameter.
	 *
	 * The metadata for <code>sPath</code> must be available synchronously.
	 *
	 * @param {string} sPath
	 *   The absolute data path to be reduced
	 * @param {string} sRootPath
	 *   The absolute data path to the root binding, must be a prefix of <code>sPath</code>
	 * @returns {string}
	 *   The reduced absolute data path; it will not be shorter than <code>sRootPath</code>
	 *
	 * @private
	 */
	ODataMetaModel.prototype.getReducedPath = function (sPath, sRootPath) {
		var i,
			aMetadataForPathPrefix,
			aOverloadMetadata,
			iPotentialPartner,
			iRootPathLength = sRootPath.split("/").length,
			aSegments = sPath.split("/"),
			that = this;

		aMetadataForPathPrefix = aSegments.map(function (sSegment, j) {
			return j < iRootPathLength || sSegment[0] === "#" || sSegment[0] === "@"
					|| rNumber.test(sSegment) || sSegment === "$Parameter"
				? {} // simply an object w/o $Partner and $isCollection
				: that.getObject(that.getMetaPath(aSegments.slice(0, j + 1).join("/"))) || {};
		});
		if (!aMetadataForPathPrefix[aSegments.length - 1].$isCollection) {
			for (i = aSegments.length - 2; i >= iRootPathLength; i -= 1) {
				// if i + 1 is an index segment, the potential partner is in i + 2
				iPotentialPartner = rNumber.test(aSegments[i + 1]) ? i + 2 : i + 1;
				if (iPotentialPartner < aSegments.length
						&& aMetadataForPathPrefix[i].$Partner === aSegments[iPotentialPartner]
						&& !aMetadataForPathPrefix[iPotentialPartner].$isCollection
						&& aMetadataForPathPrefix[iPotentialPartner].$Partner
							=== aSegments[i].replace(rPredicate, "")) {
					aMetadataForPathPrefix.splice(i, iPotentialPartner - i + 1);
					aSegments.splice(i, iPotentialPartner - i + 1);
				} else if (Array.isArray(aMetadataForPathPrefix[i])
						&& aSegments[i + 1] === "$Parameter") {
					// Filter via the binding parameter
					aOverloadMetadata = that.getObject(
						that.getMetaPath(aSegments.slice(0, i + 1).join("/") + "/@$ui5.overload")
					);
					// Note: This must be a bound operation with a binding parameter; otherwise it
					// would be in the first segment and the loop would not touch it due to
					// iRootPathLength. So we have $Parameter[0].
					if (aOverloadMetadata.length === 1
							&& aOverloadMetadata[0].$Parameter[0].$Name === aSegments[i + 2]) {
						aSegments.splice(i, 3);
					}
				} else if (aMetadataForPathPrefix[i].$isCollection) {
					break;
				}
			}
		}
		return aSegments.join("/");
	};

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
	 *   If the UI5 type cannot be determined synchronously (due to a pending metadata request)
	 *
	 * @function
	 * @public
	 * @see #requestUI5Type
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getUI5Type = _Helper.createGetMethod("fetchUI5Type", true);

	/**
	 * Returns the path of the unit or currency associated with the property identified by the given
	 * path.
	 *
	 * @param {string} sPropertyPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {string}
	 *   The path of the property's unit or currency relative to the property's entity, or
	 *   <code>undefined</code> in case the property has no associated unit or currency
	 *
	 * @private
	 */
	ODataMetaModel.prototype.getUnitOrCurrencyPath = function (sPropertyPath) {
		var mAnnotations = this.getObject("@", this.getMetaContext(sPropertyPath)),
			oMeasureAnnotation = mAnnotations
				&& (mAnnotations["@Org.OData.Measures.V1.Unit"]
					|| mAnnotations["@Org.OData.Measures.V1.ISOCurrency"]);

		return oMeasureAnnotation && oMeasureAnnotation.$Path;
	};

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
	 * Request customizing based on the code list reference given in the entity container's
	 * given <code>com.sap.vocabularies.CodeList.v1.*</code> annotation.
	 *
	 * @param {string} sTerm
	 *   The unqualified name of the term from the <code>com.sap.vocabularies.CodeList.v1</code>
	 *   vocabulary used to annotate the entity container, e.g. "CurrencyCodes" or "UnitsOfMeasure"
	 * @param {any} [vRawValue]
	 *   If present, it must be this meta model's root entity container
	 * @param {object} [oDetails]
	 *   The details object
	 * @param {sap.ui.model.Context} [oDetails.context]
	 *   If present, it must point to this meta model's root entity container, that is,
	 *   <code>oDetails.context.getModel() === this</code> and
	 *   <code>oDetails.context.getPath() === "/"</code>
	 * @returns {Promise}
	 *   A promise resolving with the customizing which is a map from the code key to an object with
	 *   the following properties:
	 *   <ul>
	 *   <li>StandardCode: The language-independent standard code (e.g. ISO) for the code as
	 *     referred to via the <code>com.sap.vocabularies.CodeList.v1.StandardCode</code> annotation
	 *     on the code's key, if present
	 *   <li>Text: The language-dependent text for the code as referred to via the
	 *     <code>com.sap.vocabularies.Common.v1.Text</code> annotation on the code's key
	 *   <li>UnitSpecificScale: The decimals for the code as referred to via the
	 *     <code>com.sap.vocabularies.Common.v1.UnitSpecificScale</code> annotation on the code's
	 *     key; entries where this would be <code>null</code> are ignored, and an error is logged
	 *   </ul>
	 *   It resolves with <code>null</code>, if no given
	 *   <code>com.sap.vocabularies.CodeList.v1.*</code> annotation is found.
	 *   It is rejected, if there is not exactly one code key, or if the customizing cannot be
	 *   loaded.
	 * @throws {Error}
	 *   If <code>vRawValue</code> or <code>oDetails.context</code> are present, but unsupported
	 *
	 * @private
	 * @see #requestCurrencyCodes
	 * @see #requestUnitsOfMeasure
	 */
	ODataMetaModel.prototype.requestCodeList = function (sTerm, vRawValue, oDetails) {
		var mScope = this.fetchEntityContainer().getResult(),
			oEntityContainer = mScope[mScope.$EntityContainer],
			that = this;

		if (oDetails && oDetails.context) {
			if (oDetails.context.getModel() !== this || oDetails.context.getPath() !== "/") {
				throw new Error("Unsupported context: " + oDetails.context);
			}
		}
		if (vRawValue !== undefined && vRawValue !== oEntityContainer) {
			throw new Error("Unsupported raw value: " + vRawValue);
		}

		return this.requestObject("/@com.sap.vocabularies.CodeList.v1." + sTerm)
			.then(function (oCodeList) {
				var sCacheKey,
					oCodeListMetaModel,
					oCodeListModel,
					oPromise,
					sTypePath;

				if (!oCodeList) {
					return null;
				}

				sCacheKey = that.getAbsoluteServiceUrl(oCodeList.Url)
					+ "#" + oCodeList.CollectionPath;
				oPromise = mCodeListUrl2Promise.get(sCacheKey);
				if (oPromise) {
					return oPromise;
				}

				oCodeListModel = that.getOrCreateSharedModel(oCodeList.Url, "$direct");
				oCodeListMetaModel = oCodeListModel.getMetaModel();
				sTypePath = "/" + oCodeList.CollectionPath + "/";
				oPromise = oCodeListMetaModel.requestObject(sTypePath).then(function (oType) {
					var sAlternateKeysPath = sTypePath + "@Org.OData.Core.V1.AlternateKeys",
						aAlternateKeys = oCodeListMetaModel.getObject(sAlternateKeysPath),
						oCodeListBinding,
						sKeyPath = getKeyPath(oType.$Key),
						sKeyAnnotationPathPrefix = sTypePath + sKeyPath
							+ "@com.sap.vocabularies.Common.v1.",
						aSelect,
						sScalePropertyPath,
						sStandardCodePath = sTypePath + sKeyPath
							+ "@com.sap.vocabularies.CodeList.v1.StandardCode/$Path",
						sStandardPropertyPath,
						sTextPropertyPath;

					/*
					 * Adds customizing for a single code to the result map. Ignores customizing
					 * where the unit-specific scale is missing, and logs an error for this.
					 *
					 * @param {object} mCode2Customizing
					 *   Map from code to its customizing
					 * @param {sap.ui.model.odata.v4.Context} oContext
					 *   Context for a single code's customizing
					 * @returns {object}
					 *   <code>mCode2Customizing</code>
					 */
					function addCustomizing(mCode2Customizing, oContext) {
						var sCode = oContext.getProperty(sKeyPath),
							oCustomizing = {
								Text : oContext.getProperty(sTextPropertyPath),
								UnitSpecificScale : oContext.getProperty(sScalePropertyPath)
							};

						if (sStandardPropertyPath) {
							oCustomizing.StandardCode = oContext.getProperty(sStandardPropertyPath);
						}
						if (oCustomizing.UnitSpecificScale === null) {
							Log.error("Ignoring customizing w/o unit-specific scale for code "
									+ sCode + " from " + oCodeList.CollectionPath,
								oCodeList.Url, sODataMetaModel);
						} else {
							mCode2Customizing[sCode] = oCustomizing;
						}

						return mCode2Customizing;
					}

					/*
					 * @param {object[]} aKeys
					 *   The type's keys
					 * @returns {string}
					 *   The property path to the type's single key
					 * @throws {Error}
					 *   If the type does not have a single key
					 */
					function getKeyPath(aKeys) {
						var vKey;

						if (aKeys && aKeys.length === 1) {
							vKey = aKeys[0];
						} else {
							throw new Error("Single key expected: " + sTypePath);
						}

						return typeof vKey === "string" ? vKey : vKey[Object.keys(vKey)[0]];
					}

					if (aAlternateKeys) {
						if (aAlternateKeys.length !== 1) {
							throw new Error("Single alternative expected: " + sAlternateKeysPath);
						} else if (aAlternateKeys[0].Key.length !== 1) {
							throw new Error(
								"Single key expected: " + sAlternateKeysPath + "/0/Key");
						}
						sKeyPath = aAlternateKeys[0].Key[0].Name.$PropertyPath;
					}

					sScalePropertyPath = oCodeListMetaModel
						.getObject(sKeyAnnotationPathPrefix + "UnitSpecificScale/$Path");
					sTextPropertyPath = oCodeListMetaModel
						.getObject(sKeyAnnotationPathPrefix + "Text/$Path");
					aSelect = [sKeyPath, sScalePropertyPath, sTextPropertyPath];

					sStandardPropertyPath = oCodeListMetaModel.getObject(sStandardCodePath);
					if (sStandardPropertyPath) {
						aSelect.push(sStandardPropertyPath);
					}

					oCodeListBinding = oCodeListModel.bindList("/" + oCodeList.CollectionPath,
						null, null, null, {$select : aSelect});

					return oCodeListBinding.requestContexts(0, Infinity)
						.then(function (aContexts) {
							if (!aContexts.length) {
								Log.error("Customizing empty for ",
									oCodeListModel.sServiceUrl + oCodeList.CollectionPath,
									sODataMetaModel);
							}
							return aContexts.reduce(addCustomizing, {});
						}).finally(function () {
							oCodeListBinding.destroy();
						});
				});
				mCodeListUrl2Promise.set(sCacheKey, oPromise);

				return oPromise;
			});
	};

	/**
	 * Request currency customizing based on the code list reference given in the entity container's
	 * <code>com.sap.vocabularies.CodeList.v1.CurrencyCodes</code> annotation. The corresponding
	 * HTTP request uses the HTTP headers obtained via
	 * {@link sap.ui.model.odata.v4.ODataModel#getHttpHeaders} from this meta model's data model.
	 *
	 * @param {any} [vRawValue]
	 *   If present, it must be this meta model's root entity container
	 * @param {object} [oDetails]
	 *   The details object
	 * @param {sap.ui.model.Context} [oDetails.context]
	 *   If present, it must point to this meta model's root entity container, that is,
	 *   <code>oDetails.context.getModel() === this</code> and
	 *   <code>oDetails.context.getPath() === "/"</code>
	 * @returns {Promise}
	 *   A promise resolving with the currency customizing which is a map from currency key to an
	 *   object with the following properties:
	 *   <ul>
	 *   <li>StandardCode: The language-independent standard code (e.g. ISO) for the currency as
	 *     referred to via the <code>com.sap.vocabularies.CodeList.v1.StandardCode</code> annotation
	 *     on the currency's key, if present
	 *   <li>Text: The language-dependent text for the currency as referred to via the
	 *     <code>com.sap.vocabularies.Common.v1.Text</code> annotation on the currency's key
	 *   <li>UnitSpecificScale: The decimals for the currency as referred to via the
	 *     <code>com.sap.vocabularies.Common.v1.UnitSpecificScale</code> annotation on the
	 *     currency's key; entries where this would be <code>null</code> are ignored, and an error
	 *     is logged
	 *   </ul>
	 *   It resolves with <code>null</code>, if no
	 *   <code>com.sap.vocabularies.CodeList.v1.CurrencyCodes</code> annotation is found.
	 *   It is rejected, if there is not exactly one currency key, or if the currency customizing
	 *   cannot be loaded.
	 * @throws {Error}
	 *   If <code>vRawValue</code> or <code>oDetails.context</code> are present, but unsupported
	 *
	 * @public
	 * @see #requestUnitsOfMeasure
	 * @since 1.63.0
	 */
	ODataMetaModel.prototype.requestCurrencyCodes = function (vRawValue, oDetails) {
		return this.requestCodeList("CurrencyCodes", vRawValue, oDetails);
	};

	/**
	 * Requests a snapshot of each $metadata or annotation file loaded so far, combined into a
	 * single "JSON" object according to the streamlined OData V4 Metadata JSON Format. It is a
	 * map from all currently known qualified names to their values, with the special key
	 * "$EntityContainer" mapped to the root entity container's qualified name as a starting point.
	 * See {@link topic:87aac894a40640f89920d7b2a414499b OData V4 Metadata JSON Format}.
	 *
	 * Note that this snapshot may change due to load-on-demand of "cross-service references" (see
	 * parameter <code>supportReferences</code> of
	 * {@link sap.ui.model.odata.v4.ODataModel#constructor}).
	 *
	 * @returns {Promise}
	 *   A promise which is resolved with the OData metadata as a "JSON" object as soon as it is
	 *   available.
	 *
	 * @function
	 * @public
	 * @see #getData
	 * @since 1.59.0
	 */
	ODataMetaModel.prototype.requestData = _Helper.createRequestMethod("fetchData");

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
	 * An empty segment in between is invalid, except to force return type lookup for operation
	 * overloads (see below). An empty segment at the end caused by a trailing slash differentiates
	 * between a name and the object it refers to. This way, "/$EntityContainer" refers to the name
	 * of the single entity container and "/$EntityContainer/" refers to the single entity container
	 * as an object.
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
	 * "/TEAMS/$NavigationPropertyBinding/TEAM_2_EMPLOYEES/...") including the special name
	 * "$ReturnType" (since 1.71.0), or even a path according to "14.5.12 Expression edm:Path" etc.
	 * (example path "/TEAMS/@com.sap.vocabularies.UI.v1.LineItem/0/Value/$Path/...".
	 *
	 * Segments starting with an "@" character, for example "@com.sap.vocabularies.Common.v1.Label",
	 * address annotations at the current object. As the first segment, they refer to the single
	 * entity container. For objects which can only be annotated inline (see "14.3 Element
	 * edm:Annotation" minus "14.2.1 Attribute Target"), the object already contains the
	 * annotations as a property. For objects which can (only or also) be annotated via external
	 * targeting, the object does not contain any annotation as a property. Such annotations MUST
	 * be accessed via a path. Such objects include operations (that is, actions and functions) and
	 * their parameters, which can be annotated for a single overload or for all overloads at the
	 * same time.
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
	 * refer to a function in <code>mParameters.scope</code> in case of a relative name starting
	 * with a dot, which is stripped before lookup; see the <code>&lt;template:alias></code>
	 * instruction for XML Templating. In case of an absolute name, it is searched in
	 * <code>mParameters.scope</code> first and then in the global namespace. The names
	 * "requestCurrencyCodes" and "requestUnitsOfMeasure" default to {@link #requestCurrencyCodes}
	 * and {@link #requestUnitsOfMeasure} resp. if not present in <code>mParameters.scope</code>.
	 * This function is called with the current object (or primitive value) and additional details
	 * and returns the result of this {@link #requestObject} call. The additional details are given
	 * as an object with the following properties:
	 * <ul>
	 * <li><code>{boolean} $$valueAsPromise</code> Whether the computed annotation may return a
	 *   <code>Promise</code> resolving with its value (since 1.57.0)
	 * <li><code>{@link sap.ui.model.Context} context</code> Points to the current object
	 * <li><code>{object} overload</code> In case of annotations of an operation or a parameter, if
	 *   filtering by binding parameter determines a single operation overload, that overload is
	 *   passed (since 1.71.0), else <code>undefined</code>
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
	 * A segment which represents an OData simple identifier (or the special names "$ReturnType",
	 * since 1.71.0, or "$Parameter", since 1.73.0) needs special preparations. The same applies to
	 * the empty segment after a trailing slash.
	 * <ol>
	 * <li> If the current object has a "$Action", "$Function" or "$Type" property, it is used for
	 *    scope lookup first. This way, "/EMPLOYEES/ENTRYDATE" addresses the same object as
	 *    "/EMPLOYEES/$Type/ENTRYDATE", namely the "ENTRYDATE" child of the entity type
	 *    corresponding to the "EMPLOYEES" child of the entity container. The other cases jump from
	 *    an operation import to the corresponding operation overloads.
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
	 * <li> Afterwards, if the current object is an array, it represents overloads for an operation.
	 *    Annotations of an operation (since 1.71.0) or a parameter (since 1.66.0) can be
	 *    immediately addressed, no matter if they apply for a single overload or for all overloads
	 *    at the same time, for example "/TEAMS/acme.NewAction@" or
	 *    "/TEAMS/acme.NewAction/Team_ID@". Annotations of an unbound operation overload can be
	 *    addressed like "/OperationImport/@$ui5.overload@", while "/OperationImport/@" addresses
	 *    annotations of the operation import itself. The special name "$ReturnType" can be used
	 *    (since 1.71.0) like a parameter to address annotations of the return type instead, for
	 *    example "/TEAMS/acme.NewAction/$ReturnType@".
	 *
	 *    Operation overloads are then filtered by binding parameter; multiple overloads after
	 *    filtering are invalid except if addressing all overloads via the segment "@$ui5.overload",
	 *    for example "/acme.NewAction/@$ui5.overload".
	 *
	 *    Once a single overload has been determined, its parameters can be immediately addressed,
	 *    for example "/TEAMS/acme.NewAction/Team_ID", or the special name "$Parameter" can be used
	 *    (since 1.73.0), for example "/TEAMS/acme.NewAction/$Parameter/Team_ID". The special name
	 *    "$ReturnType" can be used (since 1.71.0) like a parameter to address the return type
	 *    instead, for example "/TEAMS/acme.NewAction/$ReturnType". For all other names, the
	 *    overload's "$ReturnType/$Type" is used for scope lookup. This way, "/GetOldestWorker/AGE"
	 *    addresses the same object as "/GetOldestWorker/$ReturnType/AGE" or
	 *    "/GetOldestWorker/$Function/0/$ReturnType/$Type/AGE", and
	 *    "/TEAMS/acme.NewAction/MemberCount" (assuming "MemberCount" is not a parameter in this
	 *    example) addresses the same object as "/TEAMS/acme.NewAction/$ReturnType/MemberCount" or
	 *    "/TEAMS/acme.NewAction/@$ui5.overload/0/$ReturnType/$Type/MemberCount". In case a name
	 *    can refer both to a parameter and to a property of the return type, an empty segment can
	 *    be used instead of "@$ui5.overload/0/$ReturnType/$Type" or "$ReturnType" to force return
	 *    type lookup, for example "/TEAMS/acme.NewAction//Team_ID".
	 *
	 *    For primitive return types, the special segment "value" can be used to refer to the return
	 *    type itself (see {@link sap.ui.model.odata.v4.ODataContextBinding#execute}). This way,
	 *    "/GetOldestAge/value" addresses the same object as "/GetOldestAge/$ReturnType"
	 *    or "/GetOldestAge/$Function/0/$ReturnType" or "/GetOldestAge/@$ui5.overload/0/$ReturnType"
	 *    (which is needed for automatic type determination, see {@link #requestUI5Type}).
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
	 * "$" can be used as the last segment to continue a path and thus force scope lookup, but no
	 * OData simple identifier preparations. In this way, it serves as a placeholder for a technical
	 * property. The path must not continue after "$", except for a computed annotation.
	 * Example: "/TEAMS/@com.sap.vocabularies.UI.v1.LineItem/0/Value/$Path/$" addresses the
	 * referenced property itself, not the corresponding type like
	 * "/TEAMS/@com.sap.vocabularies.UI.v1.LineItem/0/Value/$Path/" does.
	 * "/TEAMS/@com.sap.vocabularies.UI.v1.LineItem/0/Target/$NavigationPropertyPath/$@@.isMultiple"
	 * calls a computed annotation on the navigation property itself, not on the corresponding type.
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
	 *   A promise which is resolved with the requested metadata value as soon as it is available;
	 *   it is rejected if the requested metadata cannot be loaded
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
	 *   {@link sap.ui.model.odata.type}; if no specific type can be
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
	 * Request unit customizing based on the code list reference given in the entity container's
	 * <code>com.sap.vocabularies.CodeList.v1.UnitOfMeasure</code> annotation. The corresponding
	 * HTTP request uses the HTTP headers obtained via
	 * {@link sap.ui.model.odata.v4.ODataModel#getHttpHeaders} from this meta model's data model.
	 *
	 * @param {any} [vRawValue]
	 *   If present, it must be this meta model's root entity container
	 * @param {object} [oDetails]
	 *   The details object
	 * @param {sap.ui.model.Context} [oDetails.context]
	 *   If present, it must point to this meta model's root entity container, that is,
	 *   <code>oDetails.context.getModel() === this</code> and
	 *   <code>oDetails.context.getPath() === "/"</code>
	 * @returns {Promise}
	 *   A promise resolving with the unit customizing which is a map from unit key to an object
	 *   with the following properties:
	 *   <ul>
	 *   <li>StandardCode: The language-independent standard code (e.g. ISO) for the unit as
	 *     referred to via the <code>com.sap.vocabularies.CodeList.v1.StandardCode</code> annotation
	 *     on the unit's key, if present
	 *   <li>Text: The language-dependent text for the unit as referred to via the
	 *     <code>com.sap.vocabularies.Common.v1.Text</code> annotation on the unit's key
	 *   <li>UnitSpecificScale: The decimals for the unit as referred to via the
	 *     <code>com.sap.vocabularies.Common.v1.UnitSpecificScale</code> annotation on the unit's
	 *     key; entries where this would be <code>null</code> are ignored, and an error is logged
	 *   </ul>
	 *   It resolves with <code>null</code>, if no
	 *   <code>com.sap.vocabularies.CodeList.v1.UnitOfMeasure</code> annotation is found.
	 *   It is rejected, if there is not exactly one unit key, or if the unit customizing cannot be
	 *   loaded.
	 * @throws {Error}
	 *   If <code>vRawValue</code> or <code>oDetails.context</code> are present, but unsupported
	 *
	 * @public
	 * @see #requestCurrencyCodes
	 * @since 1.63.0
	 */
	ODataMetaModel.prototype.requestUnitsOfMeasure = function (vRawValue, oDetails) {
		return this.requestCodeList("UnitsOfMeasure", vRawValue, oDetails);
	};

	/**
	 * Requests information to retrieve a value list for the property given by
	 * <code>sPropertyPath</code>.
	 *
	 * @param {string} sPropertyPath
	 *   An absolute path to an OData property within the OData data model or a (meta) path to an
	 *   operation parameter, for example "/TEAMS(1)/acme.NewAction/Team_ID"
	 * @param {boolean} [bAutoExpandSelect=false]
	 *   The value of the parameter <code>autoExpandSelect</code> for value list models created by
	 *   this method. If the value list model is the data model associated with this meta model,
	 *   this flag has no effect. Supported since 1.68.0
	 * @returns {Promise}
	 *   A promise which is resolved with a map of qualifier to value list mapping objects
	 *   structured as defined by <code>com.sap.vocabularies.Common.v1.ValueListType</code>;
	 *   the map entry with key "" represents the mapping without qualifier. Each entry has an
	 *   additional property "$model" which is the {@link sap.ui.model.odata.v4.ODataModel} instance
	 *   to read value list data via this mapping; this model is constructed with the HTTP headers
	 *   obtained via {@link sap.ui.model.odata.v4.ODataModel#getHttpHeaders} from this meta model's
	 *   data model.
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
	 *     <li> There is a reference, but the referenced service does not contain mappings for the
	 *       property.
	 *     <li> The referenced service contains annotation targets in the namespace of the data
	 *       service that are not mappings for the property.
	 *     <li> Two different referenced services contain a mapping using the same qualifier.
	 *     <li> A service is referenced twice.
	 *     <li> There are multiple mappings for a fixed value list.
	 *     <li> A <code>com.sap.vocabularies.Common.v1.ValueList</code> annotation in a referenced
	 *       service has the property <code>CollectionRoot</code> or <code>SearchSupported</code>.
	 *     <li> A <code>com.sap.vocabularies.Common.v1.ValueList</code> annotation in the service
	 *       itself has the property <code>SearchSupported</code> and additionally the annotation
	 *       <code>com.sap.vocabularies.Common.v1.ValueListWithFixedValues</code> is defined.
	 *   </ul>
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataMetaModel.prototype.requestValueListInfo = function (sPropertyPath, bAutoExpandSelect) {
		var sPropertyMetaPath = this.getMetaPath(sPropertyPath),
			sParentMetaPath = sPropertyMetaPath.slice(0, sPropertyMetaPath.lastIndexOf("/"))
				.replace("/$Parameter", ""),
			sQualifiedName = sParentMetaPath.slice(sParentMetaPath.lastIndexOf("/") + 1),
			that = this;

		if (!sQualifiedName.includes(".")) {
			sQualifiedName = undefined;
		}

		return Promise.all([
			sQualifiedName
			|| this.requestObject(sParentMetaPath + "/@sapui.name"), // the name of the owning type
			this.requestObject(sPropertyMetaPath), // the property itself
			this.requestObject(sPropertyMetaPath + "@"), // all property annotations
			// flag for "fixed values"
			this.requestObject(sPropertyMetaPath + sValueListWithFixedValues),
			this.requestObject(sParentMetaPath + "/@$ui5.overload")
		]).then(function (aResults) {
			var mAnnotationByTerm = aResults[2],
				bFixedValues = aResults[3],
				mMappingUrlByQualifier = {},
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
				if (bFixedValues !== undefined && "SearchSupported" in mValueListMapping) {
					throw new Error("Must not set 'SearchSupported' in annotation "
						+ "'com.sap.vocabularies.Common.v1.ValueList' and annotation "
						+ "'com.sap.vocabularies.Common.v1.ValueListWithFixedValues'");
				}
				if ("CollectionRoot" in mValueListMapping) {
					oModel = that.getOrCreateSharedModel(mValueListMapping.CollectionRoot,
						undefined, bAutoExpandSelect);
					if (oValueListInfo[sQualifier]
							&& oValueListInfo[sQualifier].$model === oModel) {
						// same model -> allow overriding the qualifier
						mMappingUrlByQualifier[sQualifier] = undefined;
					}
				}
				if (mMappingUrlByQualifier[sQualifier]) {
					throw new Error("Annotations '" + sValueList.slice(1)
						+ "' with identical qualifier '" + sQualifier
						+ "' for property " + sPropertyPath + " in "
						+ mMappingUrlByQualifier[sQualifier] + " and " + sMappingUrl);
				}
				mMappingUrlByQualifier[sQualifier] = sMappingUrl;
				mValueListMapping = _Helper.clone(mValueListMapping);
				mValueListMapping.$model = oModel;
				delete mValueListMapping.CollectionRoot;
				delete mValueListMapping.SearchSupported;
				oValueListInfo[sQualifier] = mValueListMapping;
			}

			if (!oProperty) {
				throw new Error("No metadata for " + sPropertyPath);
			}

			// filter all reference annotations, for each create a promise to evaluate the mapping
			// and wait for all of them to finish
			return Promise.all(Object.keys(mAnnotationByTerm).filter(function (sTerm) {
				return getQualifier(sTerm, sValueListReferences) !== undefined;
			}).map(function (sTerm) {
				var aMappingUrls = mAnnotationByTerm[sTerm];

				// fetch mappings for each entry and wait for all
				return Promise.all(aMappingUrls.map(function (sMappingUrl) {
					var oValueListModel = that.getOrCreateSharedModel(sMappingUrl, undefined,
							bAutoExpandSelect);

					// fetch the mappings for the given mapping URL
					return that.fetchValueListMappings(oValueListModel,
						/*sQualifiedParentName*/aResults[0], oProperty, /*aOverloads*/aResults[4]
					).then(function (mValueListMappingByQualifier) {
						// insert the returned mappings into oValueListInfo
						Object.keys(mValueListMappingByQualifier).forEach(function (sQualifier) {
							addMapping(mValueListMappingByQualifier[sQualifier], sQualifier,
								sMappingUrl, oValueListModel);
						});
					});
				}));
			})).then(function () {
				var aQualifiers;

				// add all mappings in the data service (or local annotation files)
				Object.keys(mAnnotationByTerm).filter(function (sTerm) {
					return getValueListQualifier(sTerm) !== undefined;
				}).forEach(function (sTerm) {
					addMapping(mAnnotationByTerm[sTerm], getValueListQualifier(sTerm), that.sUrl,
						that.oModel);
				});
				aQualifiers = Object.keys(oValueListInfo);

				// Each reference must have contributed at least one qualifier. So if oValueListInfo
				// is empty, there cannot have been a reference.
				if (!aQualifiers.length) {
					throw new Error("No annotation '" + sValueListReferences.slice(1) + "' for " +
						sPropertyPath);
				}
				if (bFixedValues) {
					// With fixed values, only one mapping may exist. Return it for qualifier "".
					if (aQualifiers.length > 1) {
						throw new Error("Annotation '" + sValueListWithFixedValues.slice(1)
							+ "' but multiple '" + sValueList.slice(1)
							+ "' for property " + sPropertyPath);
					}
					return {"" : oValueListInfo[aQualifiers[0]]};
				}

				return oValueListInfo;
			});
		});
	};

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
		return sPathFirst === "@" || sContextPath.endsWith("/")
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
	 *   If validation fails or if the schema has already been loaded from a different URI
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
				reportAndThrowError(this, "Unsupported IncludeAnnotations", sUrl);
			}
			for (i in oReference.$Include) {
				sSchema = oReference.$Include[i];
				if (sSchema in mScope) {
					reportAndThrowError(this, "A schema cannot span more than one document: "
						+ sSchema + " - is both included and defined",
						sUrl);
				}
				addUrlForSchema(this, sSchema, sReferenceUri, sUrl);
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