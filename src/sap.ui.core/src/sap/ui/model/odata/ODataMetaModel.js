/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/model/BindingMode', 'sap/ui/model/ClientContextBinding',
		'sap/ui/model/FilterProcessor', 'sap/ui/model/json/JSONListBinding',
		'sap/ui/model/json/JSONPropertyBinding', 'sap/ui/model/json/JSONTreeBinding',
		'sap/ui/model/MetaModel', './_ODataMetaModelUtils'],
	function (BindingMode, ClientContextBinding, FilterProcessor, JSONListBinding,
		JSONPropertyBinding, JSONTreeBinding, MetaModel, Utils) {
	"use strict";

	/**
	 * @class List binding implementation for the OData meta model which supports filtering on
	 * the virtual property "@sapui.name" (which refers back to the name of the object in
	 * question).
	 *
	 * Example:
	 * <pre>
	 * &lt;template:repeat list="{path:'entityType>', filters: {path: '@sapui.name', operator: 'StartsWith', value1: 'com.sap.vocabularies.UI.v1.FieldGroup'}}" var="fieldGroup">
	 * </pre>
	 *
	 * @extends sap.ui.model.json.JSONListBinding
	 * @private
	 */
	var ODataMetaListBinding = JSONListBinding.extend("sap.ui.model.odata.ODataMetaListBinding");

	/**
	 * @inheritdoc
	 */
	ODataMetaListBinding.prototype.applyFilter = function () {
		var that = this;

		this.aIndices = FilterProcessor.apply(this.aIndices,
			this.aFilters.concat(this.aApplicationFilters), function (vRef, sPath) {
			return sPath === "@sapui.name"
				? vRef
				: that.oModel.getProperty(sPath, that.oList[vRef]);
		});
		this.iLength = this.aIndices.length;
	};

	/**
	 * DO NOT CALL this private constructor for a new <code>ODataMetaModel</code>,
	 * but rather use {@link sap.ui.model.odata.ODataModel#getMetaModel} instead!
	 *
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata
	 *   the OData model's meta data object
	 * @param {sap.ui.model.odata.ODataAnnotations} oAnnotations
	 *   the OData model's annotations object
	 *
	 * @class Implementation of an OData meta model which offers a unified access to both OData v2
	 * meta data and v4 annotations. It uses the existing {@link sap.ui.model.odata.ODataMetadata}
	 * as a foundation and merges v4 annotations from the existing
	 * {@link sap.ui.model.odata.ODataAnnotations} directly into the corresponding model element.
	 *
	 * Also, annotations from the "http://www.sap.com/Protocols/SAPData" namespace are lifted up
	 * from the <code>extensions</code> array and transformed from objects into simple properties
	 * with an "sap:" prefix for their name. Note that this happens in addition, thus the
	 * following example shows both representations. This way, such annotations can be addressed
	 * via a simple relative path instead of searching an array.
	 * <pre>
		{
			"name" : "BusinessPartnerID",
			"extensions" : [{
				"name" : "label",
				"value" : "Bus. Part. ID",
				"namespace" : "http://www.sap.com/Protocols/SAPData"
			}],
			"sap:label" : "Bus. Part. ID"
		}
	 * </pre>
	 *
	 * As of 1.29.0, the corresponding vocabulary-based annotations for the following
	 * "<a href="http://www.sap.com/Protocols/SAPData">SAP Annotations for OData Version 2.0</a>"
	 * are added, if they are not yet defined in the v4 annotations:
	 * <ul>
	 * <li><code>label</code>;</li>
	 * <li><code>creatable</code>, <code>deletable</code>, <code>pageable</code>,
	 * <code>requires-filter</code>, <code>searchable</code>, <code>topable</code> and
	 * <code>updatable</code> on entity sets;</li>
	 * <li><code>creatable</code>, <code>display-format</code> ("UpperCase" and "NonNegative"),
	 * <code>field-control</code>, <code>filterable</code>, <code>heading</code>,
	 * <code>precision</code>, <code>quickinfo</code>, <code>required-in-filter</code>,
	 * <code>sortable</code>, <code>text</code>, <code>unit</code>, <code>updatable</code> and
	 * <code>visible</code> on properties;</li>
	 * <li><code>semantics</code>; the following values are supported:
	 * <ul>
	 * <li>"bday", "city", "country", "email" (including support for types, for example
	 * "email;type=home,pref"), "familyname", "givenname", "honorific", "middlename", "name",
	 * "nickname", "note", "org", "org-unit", "org-role", "photo", "pobox", "region", "street",
	 * "suffix", "tel" (including support for types, for example "tel;type=cell,pref"), "title" and
	 * "zip" (mapped to v4 annotation <code>com.sap.vocabularies.Communication.v1.Contact</code>);
	 * </li>
	 * <li>"class", "dtend", "dtstart", "duration", "fbtype", "location", "status", "transp" and
	 * "wholeday" (mapped to v4 annotation
	 * <code>com.sap.vocabularies.Communication.v1.Event</code>);</li>
	 * <li>"body", "from", "received", "sender" and "subject" (mapped to v4 annotation
	 * <code>com.sap.vocabularies.Communication.v1.Message</code>);</li>
	 * <li>"completed", "due", "percent-complete" and "priority" (mapped to v4 annotation
	 * <code>com.sap.vocabularies.Communication.v1.Task</code>).</li>
	 * </ul>
	 * </ul>
	 * For example:
	 * <pre>
		{
			"name" : "BusinessPartnerID",
			...
			"sap:label" : "Bus. Part. ID",
			"com.sap.vocabularies.Common.v1.Label" : {
				"String" : "Bus. Part. ID"
			}
		}
	 * </pre>
	 *
	 * This model is read-only and thus only supports
	 * {@link sap.ui.model.BindingMode.OneTime OneTime} binding mode. No events
	 * ({@link sap.ui.model.Model#event:parseError parseError},
	 * {@link sap.ui.model.Model#event:requestCompleted requestCompleted},
	 * {@link sap.ui.model.Model#event:requestFailed requestFailed},
	 * {@link sap.ui.model.Model#event:requestSent requestSent}) are fired!
	 *
	 * <b>BEWARE:</b> Access to this OData meta model will fail before the promise returned by
	 * {@link #loaded loaded} has been resolved!
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.ODataMetaModel
	 * @extends sap.ui.model.MetaModel
	 * @public
	 * @since 1.27.0
	 */
	var ODataMetaModel = MetaModel.extend("sap.ui.model.odata.ODataMetaModel",
			/** @lends sap.ui.model.odata.ODataMetaModel.prototype */ {

			constructor : function (oMetadata, oAnnotations) {
				MetaModel.apply(this); // no arguments to pass!
				this.sDefaultBindingMode = BindingMode.OneTime;
				this.mSupportedBindingModes = {"OneTime" : true};
				this.oModel = null; // not yet available!
				this.oLoadedPromise = Utils.load(this, oMetadata, oAnnotations);
			},

			metadata : {
				publicMethods : ["loaded"]
			}
		});

	/**
	 * Returns the value of the object or property inside this model's data which can be reached,
	 * starting at the given context, by following the given path.
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
		var i, oNode = oContext, aParts, sResolvedPath = sPath || "";

		if (!oContext || oContext instanceof sap.ui.model.Context){
			sResolvedPath = this.resolve(sPath || "", oContext);
			if (!sResolvedPath) {
				jQuery.sap.log.error("Invalid relative path w/o context", sPath,
					"sap.ui.model.odata.ODataMetaModel");
				return null;
			}
		}

		if (sResolvedPath.charAt(0) === "/") {
			oNode = this.oModel._getObject("/");
			sResolvedPath = sResolvedPath.slice(1);
		}

		if (sResolvedPath) {
			aParts = sResolvedPath.split("/");
			for (i = 0; i < aParts.length; i += 1) {
				if (!oNode) {
					if (jQuery.sap.log.isLoggable(jQuery.sap.log.Level.WARNING)) {
						jQuery.sap.log.warning("Invalid part: " + aParts[i],
							"path: " + sPath + ", context: "
							+ (oContext instanceof sap.ui.model.Context ?
								oContext.getPath() : oContext),
							"sap.ui.model.odata.ODataMetaModel");
					}
					break;
				}
				oNode = oNode[aParts[i]];
			}
		}
		return oNode;
	};

	/**
	 * @inheritdoc
	 */
	ODataMetaModel.prototype.bindContext = function (sPath, oContext, mParameters) {
		return new ClientContextBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * @inheritdoc
	 */
	ODataMetaModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters,
		mParameters) {
		return new ODataMetaListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
	};

	/**
	 * @inheritdoc
	 */
	ODataMetaModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		return new JSONPropertyBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * @inheritdoc
	 */
	ODataMetaModel.prototype.bindTree = function (sPath, oContext, aFilters, mParameters) {
		return new JSONTreeBinding(this, sPath, oContext, aFilters, mParameters);
	};

	/**
	 * @inheritdoc
	 */
	ODataMetaModel.prototype.destroy = function () {
		MetaModel.prototype.destroy.apply(this, arguments);
		return this.oModel.destroy.apply(this.oModel, arguments);
	};

	/**
	 * Returns the OData meta model context corresponding to the given OData model path.
	 *
	 * @param {string} [sPath]
	 *   an absolute path pointing to an entity or property, e.g.
	 *   "/ProductSet(1)/ToSupplier/BusinessPartnerID"; this equals the
	 *   <a href="http://www.odata.org/documentation/odata-version-2-0/uri-conventions#ResourcePath">
	 *   resource path</a> component of a URI according to OData v2 URI conventions
	 * @returns {sap.ui.model.Context}
	 *   the context for the corresponding meta data object, i.e. an entity type or its property,
	 *   or <code>null</code> in case no path is given
	 * @throws {Error} in case no context can be determined
	 * @public
	 */
	ODataMetaModel.prototype.getMetaContext = function (sPath) {
		var oAssocationEnd,
			oEntitySet,
			oEntityType,
			sMetaPath,
			sNavigationPropertyName,
			aParts,
			sQualifiedName; // qualified name of current entity type across navigations

		/*
		 * Strips the OData key predicate from a resource path segment.
		 *
		 * @param {string} sSegment
		 * @returns {string}
		 */
		function stripKeyPredicate(sSegment) {
			var iPos = sSegment.indexOf("(");
			return iPos >= 0
				? sSegment.slice(0, iPos)
				: sSegment;
		}

		if (!sPath) {
			return null;
		}

		aParts = sPath.split("/");
		if (aParts[0] !== "") {
			throw new Error("Not an absolute path: " + sPath);
		}
		aParts.shift();

		// from entity set to entity type
		oEntitySet = this.getODataEntitySet(stripKeyPredicate(aParts[0]));
		if (!oEntitySet) {
			throw new Error("Entity set not found: " + aParts[0]);
		}
		aParts.shift();
		sQualifiedName = oEntitySet.entityType;

		// follow (navigation) properties
		while (aParts.length) {
			oEntityType = this.getODataEntityType(sQualifiedName);
			sNavigationPropertyName = stripKeyPredicate(aParts[0]);
			oAssocationEnd = this.getODataAssociationEnd(oEntityType, sNavigationPropertyName);

			if (oAssocationEnd) {
				// navigation property
				sQualifiedName = oAssocationEnd.type;
				if (oAssocationEnd.multiplicity === "1" && sNavigationPropertyName !== aParts[0]) {
					// key predicate not allowed here
					throw new Error("Multiplicity is 1: " + aParts[0]);
				}
				aParts.shift();
			} else {
				// structural property, incl. complex types
				sMetaPath = this.getODataProperty(oEntityType, aParts, true);
				if (aParts.length) {
					throw new Error("Property not found: " + aParts.join("/"));
				}
				break;
			}
		}

		sMetaPath = sMetaPath || this.getODataEntityType(sQualifiedName, true);
		return this.createBindingContext(sMetaPath);
	};

	/**
	 * Returns the OData association end corresponding to the given entity type's navigation
	 * property of given name.
	 *
	 * @param {object} oEntityType
	 *   an entity type as returned by {@link #getODataEntityType getODataEntityType}
	 * @param {string} sName
	 *   the name of a navigation property within this entity type
	 * @returns {object}
	 *   the OData association end or <code>null</code> if no such association end is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataAssociationEnd = function (oEntityType, sName) {
		var oNavigationProperty = oEntityType
				? Utils.findObject(oEntityType.navigationProperty, sName)
				: null,
			oAssociation = oNavigationProperty
				? Utils.getObject(this.oModel, "association", oNavigationProperty.relationship)
				: null,
			oAssociationEnd = oAssociation
				? Utils.findObject(oAssociation.end, oNavigationProperty.toRole, "role")
				: null;

		return oAssociationEnd;
	};

	/**
	 * Returns the OData association <em>set</em> end corresponding to the given entity type's
	 * navigation property of given name.
	 *
	 * @param {object} oEntityType
	 *   an entity type as returned by {@link #getODataEntityType getODataEntityType}
	 * @param {string} sName
	 *   the name of a navigation property within this entity type
	 * @returns {object}
	 *   the OData association set end or <code>null</code> if no such association set end is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataAssociationSetEnd = function (oEntityType, sName) {
		var oAssociationSet,
			oAssociationSetEnd = null,
			oEntityContainer = this.getODataEntityContainer(),
			oNavigationProperty = oEntityType
				? Utils.findObject(oEntityType.navigationProperty, sName)
				: null;

		if (oEntityContainer && oNavigationProperty) {
			oAssociationSet = Utils.findObject(oEntityContainer.associationSet,
				oNavigationProperty.relationship, "association");
			oAssociationSetEnd = oAssociationSet
				? Utils.findObject(oAssociationSet.end, oNavigationProperty.toRole, "role")
				: null;
		}

		return oAssociationSetEnd;
	};

	/**
	 * Returns the OData complex type with the given qualified name, either as a path or as an
	 * object, as indicated.
	 *
	 * @param {string} sQualifiedName
	 *   a qualified name, e.g. "ACME.Address"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the complex type is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the complex type with the given qualified name; <code>undefined</code> (for
	 *   a path) or <code>null</code> (for an object) if no such type is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataComplexType = function (sQualifiedName, bAsPath) {
		return Utils.getObject(this.oModel, "complexType", sQualifiedName, bAsPath);
	};

	/**
	 * Returns the OData default entity container.
	 *
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the entity container is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the default entity container; <code>undefined</code> (for a path) or
	 *   <code>null</code> (for an object) if no such container is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataEntityContainer = function (bAsPath) {
		var vResult = bAsPath ? undefined : null;

		(this.oModel.getObject("/dataServices/schema") || []).forEach(function (oSchema, i) {
			var j = Utils.findIndex(oSchema.entityContainer, "true", "isDefaultEntityContainer");

			if (j >= 0) {
				vResult = bAsPath
					? "/dataServices/schema/" + i + "/entityContainer/" + j
					: oSchema.entityContainer[j];
				return false; //break
			}
		});

		return vResult;
	};

	/**
	 * Returns the OData entity set with the given simple name from the default entity container.
	 *
	 * @param {string} sName
	 *   a simple name, e.g. "ProductSet"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the entity type is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the entity set with the given simple name; <code>undefined</code> (for a
	 *   path) or <code>null</code> (for an object) if no such set is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataEntitySet = function (sName, bAsPath) {
		return Utils.getFromContainer(this.getODataEntityContainer(), "entitySet", sName, bAsPath);
	};

	/**
	 * Returns the OData entity type with the given qualified name, either as a path or as an
	 * object, as indicated.
	 *
	 * @param {string} sQualifiedName
	 *   a qualified name, e.g. "ACME.Product"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the entity type is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the entity type with the given qualified name; <code>undefined</code> (for a
	 *   path) or <code>null</code> (for an object) if no such type is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataEntityType = function (sQualifiedName, bAsPath) {
		return Utils.getObject(this.oModel, "entityType", sQualifiedName, bAsPath);
	};

	/**
	 * Returns the OData function import with the given simple name from the default entity
	 * container.
	 *
	 * @param {string} sName
	 *   a simple or qualified name, e.g. "Save" or "MyService.Entities/Save"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the function import is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the function import with the given simple name; <code>undefined</code> (for
	 *   a path) or <code>null</code> (for an object) if no such function import is found
	 * @public
	 * @since 1.29.0
	 */
	ODataMetaModel.prototype.getODataFunctionImport = function (sName, bAsPath) {
		var aParts =  sName && sName.indexOf('/') >= 0  ? sName.split('/') : undefined,
			oEntityContainer = aParts ?
				Utils.getObject(this.oModel, "entityContainer", aParts[0]) :
				this.getODataEntityContainer();

		return Utils.getFromContainer(oEntityContainer, "functionImport",
			aParts ? aParts[1] : sName, bAsPath);
	};

	/**
	 * Returns the given OData type's property (not navigation property!) of given name.
	 *
	 * If an array is given instead of a single name, it is consumed (via
	 * <code>Array.prototype.shift</code>) piece by piece. Each element is interpreted as a
	 * property name of the current type, and the current type is replaced by that property's type.
	 * This is repeated until an element is encountered which cannot be resolved as a property name
	 * of the current type anymore; in this case, the last property found is returned and
	 * <code>vName</code> contains only the remaining names, with <code>vName[0]</code> being the
	 * one which was not found.
	 *
	 * Examples:
	 * <ul>
	 * <li> Get address property of business partner:
	 * <pre>
	 * var oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.BusinessPartner"),
	 *     oAddressProperty = oMetaModel.getODataProperty(oEntityType, "Address");
	 * oAddressProperty.name === "Address";
	 * oAddressProperty.type === "GWSAMPLE_BASIC.CT_Address";
	 * </pre>
	 * </li>
	 * <li> Get street property of address type:
	 * <pre>
	 * var oComplexType = oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
	 *     oStreetProperty = oMetaModel.getODataProperty(oComplexType, "Street");
	 * oStreetProperty.name === "Street";
	 * oStreetProperty.type === "Edm.String";
	 * </pre>
	 * </li>
	 * <li> Get address' street property directly from business partner:
	 * <pre>
	 * var aParts = ["Address", "Street"];
	 * oMetaModel.getODataProperty(oEntityType, aParts) === oStreetProperty;
	 * aParts.length === 0;
	 * </pre>
	 * </li>
	 * <li> Trying to get address' foo property directly from business partner:
	 * <pre>
	 * aParts = ["Address", "foo"];
	 * oMetaModel.getODataProperty(oEntityType, aParts) === oAddressProperty;
	 * aParts.length === 1;
	 * aParts[0] === "foo";
	 * </pre>
	 * </li>
	 * </ul>
	 *
	 * @param {object} oType
	 *   a complex type as returned by {@link #getODataComplexType getODataComplexType}, or
	 *   an entity type as returned by {@link #getODataEntityType getODataEntityType}
	 * @param {string|string[]} vName
	 *   the name of a property within this type (e.g. "Address"), or an array of such names (e.g.
	 *   <code>["Address", "Street"]</code>) in order to drill-down into complex types;
	 *   <b>BEWARE</b> that this array is modified by removing each part which is understood!
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the property is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the last OData property found; <code>undefined</code> (for a path) or
	 *   <code>null</code> (for an object) if no property was found at all
	 * @public
	 */
	ODataMetaModel.prototype.getODataProperty = function (oType, vName, bAsPath) {
		var i,
			aParts = Array.isArray(vName) ? vName : [vName],
			oProperty = null,
			sPropertyPath;

		while (oType && aParts.length) {
			i = Utils.findIndex(oType.property, aParts[0]);
			if (i < 0) {
				break;
			}

			aParts.shift();
			oProperty = oType.property[i];
			sPropertyPath = oType.$path + "/property/" + i;

			if (aParts.length) {
				// go to complex type in order to allow drill-down
				oType = this.getODataComplexType(oProperty.type);
			}
		}

		return bAsPath ? sPropertyPath : oProperty;
	};

	/**
	 * @inheritdoc
	 */
	ODataMetaModel.prototype.getProperty = function () {
		return this._getObject.apply(this, arguments);
	};

	/**
	 * @inheritdoc
	 */
	ODataMetaModel.prototype.isList = function () {
		return this.oModel.isList.apply(this.oModel, arguments);
	};

	/**
	 * Returns a promise which is fulfilled once the meta model data is loaded and can be used.
	 * It is rejected with a corresponding <code>Error</code> object in case of errors, such as
	 * failure to load meta data or annotations.
	 *
	 * @public
	 * @returns {Promise} a Promise
	 */
	ODataMetaModel.prototype.loaded = function () {
		return this.oLoadedPromise;
	};

	/**
	 * Refresh not supported by OData meta model!
	 *
	 * @throws {Error}
	 * @returns {void}
	 * @public
	 */
	ODataMetaModel.prototype.refresh = function () {
		throw new Error("Unsupported operation: ODataMetaModel#refresh");
	};

	/**
	 * Legacy syntax not supported by OData meta model!
	 *
	 * @param {boolean} bLegacySyntax
	 *   must not be true!
	 * @throws {Error} if <code>bLegacySyntax</code> is true
	 * @returns {void}
	 * @public
	 */
	ODataMetaModel.prototype.setLegacySyntax = function (bLegacySyntax) {
		if (bLegacySyntax) {
			throw new Error("Legacy syntax not supported by ODataMetaModel");
		}
	};

	/**
	 * Changes not supported by OData meta model!
	 *
	 * @throws {Error}
	 * @returns {void}
	 * @private
	 */
	ODataMetaModel.prototype.setProperty = function () {
		// Note: this method is called by JSONPropertyBinding#setValue
		throw new Error("Unsupported operation: ODataMetaModel#setProperty");
	};

	return ODataMetaModel;
}, /* bExport= */ true);
