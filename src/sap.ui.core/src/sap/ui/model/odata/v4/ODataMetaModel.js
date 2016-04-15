/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataMetaModel
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/Context",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/MetaModel",
	"sap/ui/model/PropertyBinding",
	"./_ODataHelper",
	"./_SyncPromise"
], function (jQuery, BindingMode, ContextBinding, Context, FilterProcessor, JSONListBinding,
		MetaModel, PropertyBinding, _ODataHelper, _SyncPromise) {
	"use strict";

	var DEBUG = jQuery.sap.log.Level.DEBUG,
		ODataMetaContextBinding,
		ODataMetaListBinding,
		sODataMetaModel = "sap.ui.model.odata.v4.ODataMetaModel",
		ODataMetaPropertyBinding,
		// rest of segment after opening ( and segments that consist only of digits
		rNotMetaContext = /\([^/]*|\/\d+/g,
		rNumber = /^\d+$/,
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
		mSupportedEvents = {
			messageChange : true
		},
		WARNING = jQuery.sap.log.Level.WARNING;

	/**
	 * @class Context binding implementation for the OData meta data model.
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
	 * @class List binding implementation for the OData meta data model which supports filtering on
	 * the virtual property "@sapui.name" (which refers back to the name of the object in
	 * question).
	 *
	 * Example:
	 * <pre>
	 * &lt;template:repeat list="{path : 'entityType>', filters : {path : '@sapui.name', operator : 'StartsWith', value1 : 'com.sap.vocabularies.UI.v1.FieldGroup'}}" var="fieldGroup">
	 * </pre>
	 *
	 * @extends sap.ui.model.json.JSONListBinding
	 * @private
	 */
	ODataMetaListBinding = JSONListBinding.extend("sap.ui.model.odata.v4.ODataMetaListBinding", {
		// @override
		// @see sap.ui.model.ClientListBinding#applyFilter
		applyFilter : function () {
			var that = this;

			this.aIndices = FilterProcessor.apply(this.aIndices,
				this.aFilters.concat(this.aApplicationFilters), function (vRef, sPath) {
				return sPath === "@sapui.name"
					? vRef
					: that.oModel.getProperty(sPath, that.oList[vRef]);
			});
			this.iLength = this.aIndices.length;
		},
		constructor : function () {
			JSONListBinding.apply(this, arguments);
		},
		// @override
		// @see sap.ui.model.ListBinding#enableExtendedChangeDetection
		enableExtendedChangeDetection : function () {
			throw new Error("Unsupported operation");
		}
	});

	/**
	 * @class Property binding implementation for the OData meta data model.
	 *
	 * @extends sap.ui.model.PropertyBinding
	 * @private
	 */
	ODataMetaPropertyBinding
		= PropertyBinding.extend("sap.ui.model.odata.v4.ODataMetaPropertyBinding", {
			constructor : function () {
				PropertyBinding.apply(this, arguments);
				this.vValue = this.oModel.getProperty(this.sPath, this.oContext);
			},
			// @see sap.ui.model.PropertyBinding#getValue
			getValue : function () {
				return this.vValue;
			},
			// @see sap.ui.model.PropertyBinding#setValue
			setValue : function () {
				throw new Error("Unsupported operation: ODataMetaPropertyBinding#setValue");
			}
		});

	/**
	 * Do <strong>NOT</strong> call this private constructor for a new <code>ODataMetaModel</code>,
	 * but rather use {@link sap.ui.model.odata.v4.ODataModel#getMetaModel getMetaModel} instead.
	 *
	 * @param {sap.ui.model.odata.v4.lib._MetadataRequestor} oRequestor
	 *   The meta data requestor
	 * @param {string} sUrl
	 *   The URL to the $metadata document of the service
	 *
	 * @alias sap.ui.model.odata.v4.ODataMetaModel
	 * @author SAP SE
	 * @class Implementation of an OData meta data model which offers access to OData V4 meta data.
	 *   The meta model does not support any public events; attaching an event handler leads to an
	 *   error.
	 *
	 *   This model is read-only.
	 *
	 * @extends sap.ui.model.MetaModel
	 * @public
	 * @version ${version}
	 */
	var ODataMetaModel = MetaModel.extend("sap.ui.model.odata.v4.ODataMetaModel", {
		constructor : function (oRequestor, sUrl) {
			MetaModel.call(this);
			this.sDefaultBindingMode = BindingMode.OneTime;
			this.oMetadataPromise = null;
			this.oRequestor = oRequestor;
			this.mSupportedBindingModes = {"OneTime" : true};
			this.sUrl = sUrl;
		}
	});

	/**
	 * Returns the value of the object or property inside this model's meta data which can be
	 * reached, starting at the given context, by following the given path. The resulting value is
	 * suitable for a list binding, for example
	 * <code>&lt;template:repeat list="{context>path}" ...></code>.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path
	 * @param {object|sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {any}
	 *   The value of the object or property or <code>null</code> in case a relative path without
	 *   a context is given
	 *
	 * @private
	 */
	ODataMetaModel.prototype._getObject = function (sPath, oContext) {
		var bIsCloned = false,
			bIterateAnnotations = sPath === "@"
				|| sPath === "" && oContext.getPath().slice(-2) === "/@"
				|| sPath.slice(-2) === "/@",
			sKey,
			sPathIntoObject,
			vResult;

		if (bIterateAnnotations || sPath === "/") {
			sPathIntoObject = sPath; // no trailing slash needed
		} else if (sPath) {
			sPathIntoObject = sPath + "/";
		} else {
			sPathIntoObject = "./";
		}
		vResult = this.getObject(sPathIntoObject, oContext);

		for (sKey in vResult) {
			// always filter technical properties; filter annotations iff. not iterating them
			if (sKey[0] === "$" || bIterateAnnotations === (sKey[0] !== "@")) {
				if (!bIsCloned) { // copy on write
					vResult = jQuery.extend({}, vResult);
					bIsCloned = true;
				}
				delete vResult[sKey];
			}
		}

		return vResult;
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
	 * Creates a list binding for this meta data model which iterates content from the given path
	 * (relative to the given context), sorted and filtered as indicated.
	 *
	 * By default, OData names are iterated and a trailing slash is implicitly added to the path
	 * (see {@link #requestObject requestObject} for the effects this has); technical properties
	 * and inline annotations are filtered out.
	 *
	 * A path which ends with an "@" segment can be used to iterate all inline or external
	 * targeting annotations; no trailing slash is added implicitly; technical properties and OData
	 * names are filtered out.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the meta data model, for example "/EMPLOYEES"
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters]
	 *   Initial sort order, see {@link sap.ui.model.ListBinding#sort sort}
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters]
	 *   Initial application filter(s), see {@link sap.ui.model.ListBinding#filter filter}
	 * @returns {sap.ui.model.ListBinding}
	 *   A list binding for this meta data model
	 *
	 * @public
	 * @see #requestObject
	 * @see sap.ui.model.Model#bindList
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters) {
		return new ODataMetaListBinding(this, sPath, oContext, aSorters, aFilters);
	};

	// @public
	// @see sap.ui.model.Model#bindProperty
	// @since 1.37.0
	ODataMetaModel.prototype.bindProperty = function (sPath, oContext) {
		return new ODataMetaPropertyBinding(this, sPath, oContext);
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
	 * Requests the single entity container for this meta data model's service by reading the
	 * $metadata document via the meta data requestor. The resulting $metadata JSON object is a map
	 * of qualified names to their corresponding meta data, with the special key "$EntityContainer"
	 * mapped to the entity container's qualified name as a starting point.
	 *
	 * @returns {SyncPromise}
	 *   A promise which is resolved with the $metadata JSON object as soon as the entity container
	 *   is fully available, or rejected with an error.
	 *
	 * @private
	 */
	ODataMetaModel.prototype.fetchEntityContainer = function () {
		if (!this.oMetadataPromise) {
			this.oMetadataPromise = _SyncPromise.resolve(this.oRequestor.read(this.sUrl));
		}
		return this.oMetadataPromise;
	};

	/**
	 * @param {string} sPath
	 *   A relative or absolute path within the meta data model, for example "/EMPLOYEES/ENTRYDATE"
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {SyncPromise}
	 *   A promise which is resolved with the requested meta data object as soon as it is
	 *   available
	 *
	 * @private
	 * @see #requestObject
	 */
	ODataMetaModel.prototype.fetchObject = function (sPath, oContext) {
		var sResolvedPath = this.resolve(sPath, oContext);

		if (!sResolvedPath) {
			jQuery.sap.log.error("Invalid relative path w/o context", sPath, sODataMetaModel);
			return _SyncPromise.resolve(null);
		}

		return this.fetchEntityContainer().then(function (mScope) {
			var vLocation, // {string[]|string} location of indirection
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
			 * Outputs a log message for the given level. Leads to an <code>undefined</code> result.
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

				if (jQuery.sap.log.isLoggable(iLevel)) {
					sLocation = Array.isArray(vLocation)
						? vLocation.join("/")
						: vLocation;
					jQuery.sap.log[iLevel === DEBUG ? "debug" : "warning"](
						Array.prototype.slice.call(arguments, 1).join("")
						+ (sLocation ? " at /" + sLocation : ""),
						sResolvedPath, sODataMetaModel);
				}
				vResult = undefined;
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
				if (!(sQualifiedName in mScope)) {
					vLocation = vLocation || sTarget && sTarget + "/" + sPropertyName;
					return log(WARNING, "Unknown qualified name '", sQualifiedName, "'");
				}
				sTarget = sName = sSchemaChildName = sQualifiedName;
				vResult = oSchemaChild = mScope[sSchemaChildName];
				return true;
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
					sSchemaName,
					bSplitSegment;

				if (sSegment === "$Annotations") {
					return log(WARNING, "Invalid segment: $Annotations");
				}

				if (sSegment.length > 11 && sSegment.slice(-11) === "@sapui.name") {
					// split trailing @sapui.name first
					iIndexOfAt = sSegment.length - 11;
				} else {
					iIndexOfAt = sSegment.indexOf("@");
				}
				if (iIndexOfAt > 0) {
					// <17.2 SimpleIdentifier|17.3 QualifiedName>@<annotation[@annotation]>
					if (!step(sSegment.slice(0, iIndexOfAt), i, aSegments)) {
						return false;
					}
					sSegment = sSegment.slice(iIndexOfAt);
					bSplitSegment = true;
				}

				if (!(bSplitSegment && sSegment === "@sapui.name") && typeof vResult === "string"
					// indirection: treat string content as a meta model path
					&& !steps(vResult, aSegments.slice(0, i))) {
					return false;
				}

				if (bODataMode) {
					if (sSegment[0] === "$" || rNumber.test(sSegment)) {
						bODataMode = false; // technical property, switch to pure "JSON" drill-down
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
								return log(WARNING, "Unknown child '", sSegment,
									"' of '", sSchemaChildName, "'");
							}
						}
						if (Array.isArray(vResult)) { // overloads of Action or Function
							if (vResult.length !== 1) {
								return log(WARNING, "Unsupported overloads");
							}
							vResult = vResult[0].$ReturnType;
							sTarget = sTarget + "/0/$ReturnType";
							if (vResult) {
								if (sSegment === "value"
									&& !(mScope[vResult.$Type] && mScope[vResult.$Type].value)) {
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
				if (sSegment === "@sapui.name") {
					vResult = sName;
					if (vResult === undefined) {
						log(WARNING, "Unsupported path before @sapui.name");
					} else if (i + 1 < aSegments.length) {
						log(WARNING, "Unsupported path after @sapui.name");
					}
					return false;
				}
				if (!vResult || typeof vResult !== "object") {
					// Note: even an OData path cannot continue here (e.g. by type cast)
					return log(DEBUG, "Invalid segment: ", sSegment);
				}
				if (bODataMode && sSegment[0] === "@") {
					// annotation(s) via external targeting
					sSchemaName
						= sSchemaChildName.slice(0, sSchemaChildName.lastIndexOf(".") + 1);
					vResult = sSchemaName === sSchemaChildName
						? oSchemaChild // annotations at schema are inline
						: (mScope[sSchemaName].$Annotations || {})[sTarget] || {};
					bODataMode = false; // switch to pure "JSON" drill-down
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

			return vResult;
		});
	};

	/**
	 * Requests the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {SyncPromise}
	 *   A promise that gets resolved with the corresponding UI5 type from
	 *   <code>sap.ui.model.odata.type</code> or rejected with an error; if no specific type can be
	 *   determined, a warning is logged and <code>sap.ui.model.odata.type.Raw</code> is used
	 *
	 * @private
	 * @see #requestUI5Type
	 */
	ODataMetaModel.prototype.fetchUI5Type = function (sPath) {
		var oMetaContext = this.getMetaContext(sPath),
			that = this;

		// Note: undefined is more efficient than "" here
		return this.fetchObject(undefined, oMetaContext).then(function (oProperty) {
			var mConstraints,
				sName,
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
					for (sName in oTypeInfo.constraints) {
						setConstraint(oTypeInfo.constraints[sName], sName[0] === "@"
							? that.getObject(sName, oMetaContext)
							: oProperty[sName]);
					}
					if (oProperty.$Nullable === false) {
						setConstraint("nullable", false);
					}
				} else {
					jQuery.sap.log.warning("Unsupported type '" + oProperty.$Type + "', using "
						+ sTypeName, sPath, sODataMetaModel);
				}
			}

			oType = new (jQuery.sap.getObject(sTypeName, 0))(undefined, mConstraints);
			oProperty["$ui5.type"] = oType;

			return oType;
		});
	};

	/**
	 * Returns the OData meta data model context corresponding to the given OData data model path.
	 *
	 * @param {string} sPath
	 *   An absolute data path within the OData data model, for example
	 *   "/EMPLOYEES/0/ENTRYDATE"
	 * @returns {sap.ui.model.Context}
	 *   The corresponding meta data context within the OData meta data model, for example with
	 *   meta data path "/EMPLOYEES/ENTRYDATE"
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getMetaContext = function (sPath) {
		return new Context(this, sPath.replace(rNotMetaContext, ""));
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
	 * Returns the meta data object for the given path relative to the given context. Returns
	 * <code>undefined</code> in case the meta data is not (yet) available. Use
	 * {@link #requestObject requestObject} for asynchronous access.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the meta data model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {any}
	 *   The requested meta data object if it is already available, or <code>undefined</code>
	 *
	 * @function
	 * @public
	 * @see #requestObject
	 * @see sap.ui.model.Model#getObject
	 * @since 1.37.0
	 */
	// @override
	ODataMetaModel.prototype.getObject = _SyncPromise.createGetMethod("fetchObject");

	/**
	 * @deprecated Use {@link #getObject getObject}.
	 * @function
	 * @public
	 * @see sap.ui.model.Model#getProperty
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getProperty = ODataMetaModel.prototype.getObject;

	/**
	 * Returns the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type. Use
	 * {@link #requestUI5Type requestUI5Type} for asynchronous access.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {sap.ui.model.odata.type.ODataType}
	 *   The corresponding UI5 type from <code>sap.ui.model.odata.type</code>, if all required meta
	 *   data to calculate this type is already available; if no specific type can be determined, a
	 *   warning is logged and <code>sap.ui.model.odata.type.Raw</code> is used
	 * @throws {Error}
	 *   If the UI5 type cannot be determined synchronously (due to a pending meta data request) or
	 *   cannot be determined at all (due to a wrong data path)
	 *
	 * @function
	 * @public
	 * @see #requestUI5Type
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.getUI5Type = _SyncPromise.createGetMethod("fetchUI5Type", true);

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#isList
	 * @since 1.37.0
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
	 * Returns a promise for the "4.3.1 Canonical URL" corresponding to the given service root URL
	 * and absolute data binding path which must point to an entity.
	 *
	 * @param {string} sServiceUrl
	 *   Root URL of the service
	 * @param {string} sPath
	 *   An absolute data binding path pointing to an entity, for example
	 *   "/TEAMS/0/TEAM_2_EMPLOYEES/0"
	 * @param {sap.ui.model.Context} oContext
	 *   OData V4 context object which provides access to data via <code>requestValue()</code>
	 * @returns {Promise}
	 *   A promise which is resolved with the canonical URL (for example
	 *   "/<service root URL>/EMPLOYEES(ID='1')") in case of success, or rejected with an instance
	 *   of <code>Error</code> in case of failure
	 *
	 * @private
	 */
	ODataMetaModel.prototype.requestCanonicalUrl = function (sServiceUrl, sPath, oContext) {
		var sMetaPath = sPath.replace(rNotMetaContext, ""),
			aSegments = sMetaPath.slice(1).split("/");

		return Promise.all([
			oContext.requestValue(""),
			this.fetchEntityContainer()
		]).then(function (aValues) {
			var oEntityInstance = aValues[0],
				mScope = aValues[1],
				oEntityContainer = mScope[mScope.$EntityContainer],
				sEntitySetName = aSegments.shift(),
				oEntitySet = oEntityContainer[sEntitySetName],
				oEntityType = mScope[oEntitySet.$Type];

			aSegments.forEach(function (sSegment) {
				var oNavigationProperty = oEntityType[sSegment];

				if (!oNavigationProperty || oNavigationProperty.$kind !== "NavigationProperty") {
					throw new Error("Not a navigation property: " + sSegment + " (" + sPath + ")");
				}

				sEntitySetName = oEntitySet.$NavigationPropertyBinding[sSegment];
				oEntitySet = oEntityContainer[sEntitySetName];
				oEntityType = mScope[oNavigationProperty.$Type];
			});

			return sServiceUrl + encodeURIComponent(sEntitySetName)
				+ _ODataHelper.getKeyPredicate(oEntityType, oEntityInstance);
		});
	};

	/**
	 * Requests the meta data value for the given path relative to the given context (see
	 * {@link #resolve resolve} on how this resolution happens and how slashes are inserted as a
	 * separator). Returns a <code>Promise</code> which is resolved with the requested meta data
	 * value or rejected with an error (only in case meta data cannot be loaded). An invalid path
	 * leads to an <code>undefined</code> result and a warning is logged. Use
	 * {@link #getObject getObject} for synchronous access.
	 *
	 * The basic idea is that every path described in "14.2.1 Attribute Target" in specification
	 * "OData Version 4.0 Part 3: Common Schema Definition Language" is a valid absolute path
	 * within the meta data model if a leading slash is added; for example
	 * "/" + "MySchema.MyEntityContainer/MyEntitySet/MyComplexProperty/MyNavigationProperty". Also,
	 * every path described in "14.5.2 Expression edm:AnnotationPath",
	 * "14.5.11 Expression edm:NavigationPropertyPath", "14.5.12 Expression edm:Path", and
	 * "14.5.13 Expression edm:PropertyPath" is a valid relative path within the meta data model
	 * if a suitable prefix is added which addresses an entity container, entity set, singleton,
	 * complex type, entity type, or property; for example
	 * "/MySchema.MyEntityType/MyProperty" + "@vCard.Address#work/FullName".
	 *
	 * The absolute path is split into segments and followed step-by-step, starting at the global
	 * scope of all known qualified OData names. There are two technical properties there:
	 * "$Version" (typically "4.0") and "$EntityContainer" with the name of the single entity
	 * container for this meta data model's service.
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
	 *   A relative or absolute path within the meta data model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path, see
	 *   {@link #resolve resolve}
	 * @returns {Promise}
	 *   A promise which is resolved with the requested meta data value as soon as it is
	 *   available
	 *
	 * @function
	 * @public
	 * @see #getObject
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.requestObject = _SyncPromise.createRequestMethod("fetchObject");

	/**
	 * Requests the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type. Use
	 * {@link #getUI5Type getUI5Type} for synchronous access.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {Promise}
	 *   A promise that gets resolved with the corresponding UI5 type from
	 *   <code>sap.ui.model.odata.type</code> or rejected with an error; if no specific type can be
	 *   determined, a warning is logged and <code>sap.ui.model.odata.type.Raw</code> is used
	 *
	 * @function
	 * @public
	 * @see #getUI5Type
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.requestUI5Type
		= _SyncPromise.createRequestMethod("fetchUI5Type");

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
	 * @param {string} sPath
	 *   A relative or absolute path within the meta data model
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
	 * @public
	 * @since 1.37.0
	 */
	ODataMetaModel.prototype.toString = function () {
		return sODataMetaModel + ": " + this.sUrl;
	};

	return ODataMetaModel;
}, /* bExport= */ true);
