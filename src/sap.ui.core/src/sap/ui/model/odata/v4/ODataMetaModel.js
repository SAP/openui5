/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataMetaModel
sap.ui.define([
	"sap/ui/model/ContextBinding",
	"sap/ui/model/Context",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/MetaModel",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/_SyncPromise",
	"sap/ui/model/PropertyBinding"
], function (ContextBinding, Context, FilterProcessor, JSONListBinding, MetaModel, Helper,
		SyncPromise, PropertyBinding) {
	"use strict";

	var ODataMetaContextBinding,
		ODataMetaListBinding,
		ODataMetaModel,
		sODataMetaModel = "sap.ui.model.odata.v4.ODataMetaModel",
		ODataMetaPropertyBinding,
		// rest of segment after opening ( or [ and segments that consist only of digits
		rNotMetaContext = /[([][^/]*|\/\d+/g,
		mUi5TypeForEdmType = {
			"Edm.Boolean" : {type : "sap.ui.model.odata.type.Boolean"},
			"Edm.Byte" : {type : "sap.ui.model.odata.type.Byte"},
			"Edm.Date" : {type : "sap.ui.model.odata.type.Date"},
//			"Edm.DateTimeOffset" : {type : "sap.ui.model.odata.type.DateTimeOffset"},
			"Edm.Decimal" : {
				type : "sap.ui.model.odata.type.Decimal",
				constraints : {"$Precision" : "precision", "$Scale" : "scale"}
			},
			"Edm.Double" : {type : "sap.ui.model.odata.type.Double"},
			"Edm.Guid" : {type : "sap.ui.model.odata.type.Guid"},
			"Edm.Int16" : {type : "sap.ui.model.odata.type.Int16"},
			"Edm.Int32" : {type : "sap.ui.model.odata.type.Int32"},
			"Edm.Int64" : {type : "sap.ui.model.odata.type.Int64"},
			"Edm.SByte" : {type : "sap.ui.model.odata.type.SByte"},
			"Edm.Single" : {type : "sap.ui.model.odata.type.Single"},
			"Edm.String" : {
				type : "sap.ui.model.odata.type.String",
				constraints : {"$MaxLength" : "maxLength"}
			}
		};

	/**
	 * @class Context binding implementation for the OData meta model.
	 *
	 * @extends sap.ui.model.ContextBinding
	 * @private
	 */
	ODataMetaContextBinding
		= ContextBinding.extend("sap.ui.model.odata.v4.ODataMetaContextBinding", {
			constructor : function (oModel, sPath, oContext, mParameters) {
				jQuery.sap.assert(!oContext || oContext.getModel() === oModel,
					"oContext must belong to this model");
				ContextBinding.call(this, oModel, sPath, oContext, mParameters);
			},
			initialize : function () {
				var oElementContext = this.oModel.createBindingContext(this.sPath, this.oContext);
				this.bInitial = false; // initialize() has been called
				if (oElementContext !== this.oElementContext) {
					this.oElementContext = oElementContext;
					this._fireChange();
				}
			},
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
	 * @class List binding implementation for the OData meta model which supports filtering on
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
		enableExtendedChangeDetection : function () {
			throw new Error("Unsupported operation");
		}
	});

	/**
	 * @class Property binding implementation for the OData meta model.
	 *
	 * @extends sap.ui.model.PropertyBinding
	 * @private
	 */
	ODataMetaPropertyBinding
		= PropertyBinding.extend("sap.ui.model.odata.v4.ODataMetaPropertyBinding", {
			constructor : function () {
				PropertyBinding.apply(this, arguments);
			},
			getValue : function () {
				return this.getModel().getProperty(this.getPath(), this.getContext());
			}
		});

	/**
	 * Do <strong>NOT</strong> call this private constructor for a new <code>ODataMetaModel</code>,
	 * but rather use {@link sap.ui.model.odata.v4.ODataModel#getMetaModel getMetaModel} instead.
	 *
	 * @param {sap.ui.model.odata.v4.lib._MetadataRequestor} oRequestor
	 *   the meta data requestor
	 * @param {string} sUrl
	 *   the URL to the $metadata document of the service
	 *
	 * @class Implementation of an OData meta model which offers access to OData v4 meta data.
	 *
	 * This model is read-only.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.v4.ODataMetaModel
	 * @extends sap.ui.model.MetaModel
	 * @public
	 */
	ODataMetaModel = MetaModel.extend("sap.ui.model.odata.v4.ODataMetaModel", {
		constructor : function (oRequestor, sUrl) {
			MetaModel.call(this);
			this.oMetadataPromise = null;
			this.oRequestor = oRequestor;
			this.sUrl = sUrl;
		}
	});

	/**
	 * Returns the value of the object or property inside this model's data which can be reached,
	 * starting at the given context, by following the given path. The resulting value is suitable
	 * for a list binding, e.g. <code>&lt;template:repeat list="{context>path}" ...&gt;</code>.
	 *
	 * @param {string} sPath
	 *   a relative or absolute path
	 * @param {object|sap.ui.model.Context} [oContext]
	 *   the context to be used as a starting point in case of a relative path
	 * @returns {any}
	 *   the value of the object or property or <code>null</code> in case a relative path without
	 *   a context is given
	 * @private
	 */
	ODataMetaModel.prototype._getObject = function (sPath, oContext) {
		var sKey,
			sPathDot,
			vResult;

		if (sPath === "/") {
			sPathDot = "/.";
		} else if (sPath) {
			sPathDot = sPath + "/.";
		} else {
			sPathDot = ".";
		}
		vResult = this.getObject(sPathDot, oContext);

		vResult = jQuery.extend({}, vResult);
		for (sKey in vResult) {
			if (sKey[0] === "$") {
				delete vResult[sKey];
			}
		}

		return vResult;
	};

	ODataMetaModel.prototype.bindContext = function (sPath, oContext, mParameters) {
		return new ODataMetaContextBinding(this, sPath, oContext, mParameters);
	};

	ODataMetaModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters,
		mParameters) {
		return new ODataMetaListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
	};

	ODataMetaModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		return new ODataMetaPropertyBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * Requests the single entity container for this meta model's service by reading the $metadata
	 * document via the meta data requestor. The resulting $metadata JSON object is a map of
	 * qualified names to their corresponding meta data, with the special key "$EntityContainer"
	 * mapped to the entity container's qualified name as a starting point.
	 *
	 * @returns {SyncPromise}
	 *   A promise which is resolved with the $metadata JSON object as soon as the entity container
	 *   is fully available, or rejected with an error.
	 * @private
	 */
	ODataMetaModel.prototype.fetchEntityContainer = function () {
		if (!this.oMetadataPromise) {
			this.oMetadataPromise = SyncPromise.resolve(this.oRequestor.read(this.sUrl));
		}
		return this.oMetadataPromise;
	};

	/**
	 * @param {string} sPath
	 *   A relative or absolute path within the meta model, e.g.
	 *   "/$EntityContainer/EMPLOYEES/ENTRYDATE"
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {SyncPromise}
	 *   A promise which is resolved with the requested meta model object as soon as it is
	 *   available
	 * @see #requestObject
	 * @private
	 */
	ODataMetaModel.prototype.fetchObject = function (sPath, oContext) {
		var sResolvedPath = this.resolve(sPath, oContext);

		return this.fetchEntityContainer().then(function (mScope) {
			var bJsonMode, // "JSON" drill-down mode triggered by technical property
				sName, // the current object's OData name
				// parent for next "17.2 SimpleIdentifier"
				// (normally the schema child containing the current object)
				oSchemaChild,
				sSchemaChildName,
				sSchemaName,
				sTarget, // annotation target pointing to current object
				vResult = mScope;

			/*
			 * Takes one step according to the given segment, starting at the current
			 * <code>vResult</code> and changing that.
			 * @param {string} [sLocation]
			 *   where the relative path has been found (in case of implicit lookup)
			 * @param {string} sSegment
			 *   current segment
			 * @param {number} i
			 *   current segment's index
			 * @param {string[]} aSegments
			 *   all segments
			 * @returns {boolean}
			 *   whether to continue after this step
			 */
			function step(sLocation, sSegment, i, aSegments) {
				if (!sSegment) {
					return warn("Invalid empty segment");
				}
				if (sSegment === "$Annotations") {
					return warn("Invalid segment: $Annotations");
				}
				// Note: "@sapui.name" refers back to the object's OData name
				if (sSegment === "@sapui.name") {
					vResult = sName;
					if (vResult === undefined) {
						warn("Unsupported path before @sapui.name");
					} else if (i + 1 < aSegments.length) {
						warn("Unsupported path after @sapui.name");
					}
					return false;
				}
				if (typeof vResult === "string"
					// implicit scope lookup
					&& !steps(vResult, aSegments.slice(0, i).join("/"))) {
					return false;
				}
				if (!vResult || typeof vResult !== "object") {
					// Note: even an OData path cannot continue here (e.g. by type cast)
					return warn("Invalid segment: " + sSegment);
				}
				if (sSegment[0] === "@") {
					// annotation
					if (!sTarget) {
						return warn("Unsupported path before " + sSegment);
					}
					sSchemaName = sSchemaChildName.slice(0, sSchemaChildName.lastIndexOf(".") + 1);
					vResult = mScope[sSchemaName].$Annotations[sTarget][sSegment];
					bJsonMode = true;
					return true;
				}
				bJsonMode = bJsonMode || sSegment[0] === "$";
				if (!bJsonMode) {
					if (sSegment.indexOf(".") > 0) {
						// "17.3 QualifiedName": scope lookup
						if (!(sSegment in mScope)) {
							return warn("Unknown qualified name '" + sSegment + "'"
								+ (sLocation ? " at /" + sLocation : ""));
						}
						sTarget = sName = sSchemaChildName = sSegment;
						vResult = oSchemaChild = mScope[sSchemaChildName];
						return true;
					} else if ("$Type" in vResult) {
						// implicit $Type insertion, e.g. at (navigation) property
						if (!steps(vResult.$Type, aSegments.slice(0, i).join("/") + "/$Type")) {
							return false;
						}
					} else {
						// "17.2 SimpleIdentifier" (or placeholder): lookup inside schema child
						// (which is determined lazily)
						sSchemaChildName = sSchemaChildName || mScope.$EntityContainer;
						oSchemaChild = oSchemaChild || mScope[sSchemaChildName];
						if (sLocation && !(sSegment in oSchemaChild)) {
							return warn("Unknown child '" + sSegment + "' of '" + sSchemaChildName
								+ "' at /" + sLocation);
						}
						sTarget = sName = sSchemaChildName;
						vResult = oSchemaChild;
					}
				}
				// Note: "." is useful to force implicit lookup or $Type insertion
				if (sSegment !== ".") {
					sName = bJsonMode ? undefined : sSegment;
					sTarget = bJsonMode ? undefined : sTarget + "/" + sSegment;
					vResult = vResult[sSegment];
				}
				return true;
			}

			/*
			 * Takes multiple steps according to the given relative path, starting at the global
			 * scope and changing <code>vResult</code>.
			 * @param {string} sRelativePath
			 *   some relative path (semantically, it is absolute as we start at the global scope,
			 *   but it does not begin with a slash!)
			 * @param {string} [sLocation]
			 *   where the relative path has been found (in case of implicit lookup)
			 * @returns {boolean}
			 *   whether to continue after all steps
			 */
			function steps(sRelativePath, sLocation) {
				bJsonMode = false;
				vResult = mScope;
				return sRelativePath.split("/").every(step.bind(null, sLocation));
			}

			/*
			 * Outputs a warning message. Leads to an <code>undefined</code> result.
			 * @param {string} sMessage
			 *   the message
			 * @returns {boolean}
			 *   <code>false</code>
			 */
			function warn(sMessage) {
				if (jQuery.sap.log.isLoggable(jQuery.sap.log.Level.WARNING)) {
					jQuery.sap.log.warning(sMessage, sResolvedPath, sODataMetaModel);
				}
				vResult = undefined;
				return false;
			}

			if (sResolvedPath !== "/") {
				steps(sResolvedPath.slice(1));
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
	 * @returns {SyncPromise}
	 *   A promise that gets resolved with the corresponding UI5 type from
	 *   <code>sap.ui.model.odata.type</code>; if no type can be determined, the promise is
	 *   rejected with the corresponding error
	 * @private
	 */
	ODataMetaModel.prototype.fetchUI5Type = function (sPath) {
		// Note: undefined is more efficient than "" here
		return this.fetchObject(undefined, this.getMetaContext(sPath)).then(function (oProperty) {
			var mConstraints,
				sName,
				oType = oProperty["$ui5.type"],
				oTypeInfo;

			function setConstraint(sKey, vValue) {
				if (vValue !== undefined) {
					mConstraints = mConstraints || {};
					mConstraints[sKey] = vValue;
				}
			}

			if (oType) {
				return oType;
			}

			oTypeInfo = mUi5TypeForEdmType[oProperty.$Type];
			if (!oTypeInfo) {
				throw new Error("Unsupported EDM type '" + oProperty.$Type + "' at " + sPath);
			}

			for (sName in oTypeInfo.constraints) {
				setConstraint(oTypeInfo.constraints[sName], oProperty[sName]);
			}
			if (oProperty.$Nullable === false) {
				setConstraint("nullable", false);
			}
			oType = new (jQuery.sap.getObject(oTypeInfo.type, 0))({}, mConstraints);
			oProperty["$ui5.type"] = oType;

			return oType;
		});
	};

	/**
	 * Returns the OData meta model context corresponding to the given OData model path.
	 *
	 * @param {string} sPath
	 *   an absolute data path within the OData data model, e.g. "/EMPLOYEES[0];list=1/ENTRYDATE"
	 * @returns {sap.ui.model.Context}
	 *   the corresponding meta data context within the OData meta model, e.g. with meta data path
	 *   "/EMPLOYEES/ENTRYDATE"
	 * @public
	 */
	ODataMetaModel.prototype.getMetaContext = function (sPath) {
		return new Context(this, sPath.replace(rNotMetaContext, ""));
	};

	/**
	 * Returns the meta data object for the given path relative to the given context. Returns
	 * <code>undefined</code> in case the meta data is not (yet) available.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the meta model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {any}
	 *   the requested meta model object if it is already available, or <code>undefined</code>
	 * @public
	 */
	ODataMetaModel.prototype.getObject = SyncPromise.createGetMethod("fetchObject");

	/**
	 * Returns the meta data value for the given path relative to the given context. Returns
	 * <code>undefined</code> in case the meta data is not (yet) available. Returns
	 * <code>null</code> instead of object values!
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the meta model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {any}
	 *   the requested meta model value if it is already available, or <code>undefined</code> or
	 *   <code>null</code>
	 * @public
	 */
	ODataMetaModel.prototype.getProperty = function (sPath, oContext) {
		var vResult = this.getObject(sPath, oContext);
		if (vResult && typeof vResult === "object") {
			if (jQuery.sap.log.isLoggable(jQuery.sap.log.Level.WARNING)) {
				jQuery.sap.log.warning("Accessed value is not primitive",
					this.resolve(sPath, oContext), sODataMetaModel);
			}
			return null;
		}
		return vResult;
	};

	/**
	 * Returns the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {sap.ui.model.odata.type.ODataType}
	 *   The corresponding UI5 type from <code>sap.ui.model.odata.type</code>, if all required meta
	 *   data to calculate this type is already available
	 * @throws {Error}
	 *   if the UI5 type cannot be determined synchronously (due to a pending meta data request) or
	 *   cannot be determined at all (due to a wrong data path)
	 * @public
	 */
	ODataMetaModel.prototype.getUI5Type = SyncPromise.createGetMethod("fetchUI5Type", true);

	/**
	 * Returns a promise for the "4.3.1 Canonical URL" corresponding to the given service root URL
	 * and absolute data binding path which must point to an entity.
	 *
	 * @param {string} sServiceUrl
	 *   root URL of the service
	 * @param {string} sPath
	 *   an absolute data binding path pointing to an entity, e.g.
	 *   "/TEAMS[0];root=0/TEAM_2_EMPLOYEES/0"
	 * @param {function} fnRead
	 *   function like {@link sap.ui.model.odata.v4.ODataModel#read} which provides access to data
	 * @returns {Promise}
	 *   a promise which is resolved with the canonical URL (e.g.
	 *   "/<service root URL>/EMPLOYEES(ID='1')") in case of success, or rejected with an instance
	 *   of <code>Error</code> in case of failure
	 * @private
	 */
	ODataMetaModel.prototype.requestCanonicalUrl = function (sServiceUrl, sPath, fnRead) {
		var sMetaPath = sPath.replace(rNotMetaContext, ""),
			aSegments = sMetaPath.slice(1).split("/");

		return Promise.all([
			fnRead(sPath, true),
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
				+ Helper.getKeyPredicate(oEntityType, oEntityInstance);
		});
	};

	/**
	 * Requests the meta data value for the given path relative to the given context.
	 * Returns a <code>Promise</code> which is resolved with the requested meta model value or
	 * rejected with an error.
	 *
	 * The resolved path "/" addresses the global scope of all known qualified names. It has two
	 * technical properties: "$Version" (typically "4.0") and "$EntityContainer" with the name
	 * of the single entity container for this meta model's service; you can address it via
	 * "/$EntityContainer".
	 *
	 * If a path comes across a string value like this and continues, the string value is treated
	 * as a qualified name and looked up in the global scope first ("scope lookup"). This way,
	 * "/$EntityContainer/EMPLOYEES" addresses the "EMPLOYEES" child of the entity container.
	 * A warning is logged in case the string value is not a known qualified name.
	 *
	 * If a path starts with an OData simple identifier, "$EntityContainer" is inserted into the
	 * path implicitly. This way, "/EMPLOYEES" addresses the same object as
	 * "/$EntityContainer/EMPLOYEES", namely the "EMPLOYEES" child of the entity container.
	 *
	 * If a path comes across an object that does not contain OData children, but continues with
	 * an OData simple identifier, "$Type" is inserted into the path implicitly. This way,
	 * "/$EntityContainer/EMPLOYEES/ENTRYDATE" addresses the same object as
	 * "/$EntityContainer/EMPLOYEES/$Type/ENTRYDATE", namely the "ENTRYDATE" child of the entity
	 * type corresponding to the "EMPLOYEES" child of the entity container.
	 *
	 * "." can be used as a segment to continue a path and thus force scope lookup or implicit
	 * ($EntityContainer or $Type) insertion, but then stay at the resulting object ("current
	 * directory"). This way, "/$EntityContainer/EMPLOYEES/$Type/." addresses the entity type
	 * itself corresponding to the "EMPLOYEES" child of the entity container. Although "." is not
	 * an OData simple identifier, it can be used as a placeholder for one. In this way,
	 * "/$EntityContainer/EMPLOYEES/." addresses the same entity type as
	 * "/$EntityContainer/EMPLOYEES/$Type/.". That entity type in turn is a map of all its OData
	 * children (structural and navigation properties) and thus determines the set of possible
	 * child names that might be used instead of the "." placeholder.
	 *
	 * "@sapui.name" can be used as a segment to refer back to the last OData name (simple
	 * identifier or qualified name) immediately before that segment, e.g.
	 * "/$EntityContainer/EMPLOYEES/@sapui.name" results in "EMPLOYEES". It does not matter whether
	 * that name is valid or not. No scope lookup or implicit insertion is triggered by
	 * "@sapui.name" itself, but "." can still be used. Lookup of a qualified name also contributes
	 * here, i.e. "/$EntityContainer/EMPLOYEES/./@sapui.name" results in the name of the
	 * entity type corresponding to the "EMPLOYEES" child of the entity container.
	 * Any technical property (i.e. one with a "$" as first character of the name) immediately
	 * before "@sapui.name", e.g. "/$EntityContainer/EMPLOYEES/$kind/@sapui.name", leads to an
	 * <code>undefined</code> result and a warning is logged.
	 * In case a path continues after "@sapui.name", this leads to an <code>undefined</code> result
	 * and a warning is logged.
	 *
	 * In case a path comes across a non-object value and continues (except for scope lookup or
	 * "@sapui.name"), this leads to an <code>undefined</code> result and a warning
	 * ("Invalid segment") is logged.
	 *
	 * Segments starting with an "@" character, e.g. "@com.sap.vocabularies.Common.v1.Label",
	 * address annotations at the current object. For objects which can only be annotated inline
	 * (see "14.3 Element edm:Annotation" minus "14.2.1 Attribute Target"), the object already
	 * contains the annotations as a property. For objects which can (only or also) be annotated
	 * via external targeting, the object does not contain any annotation as a property. Such
	 * annotations MUST be accessed via a path. BEWARE of a special case: Actions, functions and
	 * their parameters can be annotated inline for a single overload or via external targeting for
	 * all overloads at the same time. In this case, the object contains all annotations for the
	 * single overload as a property, but annotations MUST nevertheless be accessed via a path in
	 * order to include also annotations for all overloads at the same time!
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the meta model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {Promise}
	 *   A promise which is resolved with the requested meta model value as soon as it is
	 *   available
	 * @public
	 */
	ODataMetaModel.prototype.requestObject = SyncPromise.createRequestMethod("fetchObject");

	/**
	 * Requests the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and constraints. The property's type must be a primitive type.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {Promise}
	 *   A promise that gets resolved with the corresponding UI5 type from
	 *   <code>sap.ui.model.odata.type</code>; if no type can be determined, the promise is
	 *   rejected with the corresponding error
	 * @public
	 */
	ODataMetaModel.prototype.requestUI5Type
		= SyncPromise.createRequestMethod("fetchUI5Type");

	return ODataMetaModel;
}, /* bExport= */ true);
