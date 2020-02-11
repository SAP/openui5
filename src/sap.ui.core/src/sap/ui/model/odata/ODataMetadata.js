/*!
 * ${copyright}
 */



// Provides class sap.ui.model.odata.ODataMetadata
sap.ui.define([
	'sap/ui/base/EventProvider',
	'sap/ui/thirdparty/datajs',
	'sap/ui/core/cache/CacheManager',
	'./_ODataMetaModelUtils',
	"sap/base/util/uid",
	"sap/base/Log",
	"sap/base/assert",
	"sap/base/util/each",
	"sap/ui/thirdparty/jquery"
],
	function(EventProvider, OData, CacheManager, Utils, uid, Log, assert, each, jQuery) {
	"use strict";
	/*eslint max-nested-callbacks: 0*/

	/**
	 * Constructor for a new ODataMetadata.
	 *
	 * @param {string} sMetadataURI needs the correct metadata uri including $metadata
	 * @param {object} [mParams] optional map of parameters.
	 * @param {boolean} [mParams.async=true] request is per default async
	 * @param {string} [mParams.user] <b>Deprecated</b> for security reasons. Use strong server side
	 *   authentication instead. UserID for the service.
	 * @param {string} [mParams.password] <b>Deprecated</b> for security reasons. Use strong server
	 *   side authentication instead. Password for the service.
	 * @param {object} [mParams.headers] (optional) map of custom headers which should be set with the request.
	 * @param {string} [mParams.cacheKey] (optional) A valid cache key
	 *
	 * @class
	 * Implementation to access OData metadata
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.model.odata.ODataMetadata
	 * @extends sap.ui.base.EventProvider
	 */
	var ODataMetadata = EventProvider.extend("sap.ui.model.odata.ODataMetadata", /** @lends sap.ui.model.odata.ODataMetadata.prototype */ {

		constructor : function(sMetadataURI, mParams) {
			EventProvider.apply(this, arguments);

			this.bLoaded = false;
			this.bFailed = false;
			this.mEntityTypes = {};
			this.mRequestHandles = {};
			this.sUrl = sMetadataURI;
			this.bAsync = mParams.async;
			this.sUser = mParams.user;
			this.bWithCredentials = mParams.withCredentials;
			this.sPassword = mParams.password;
			this.mHeaders = mParams.headers;
			this.sCacheKey = mParams.cacheKey;
			this.oLoadEvent = null;
			this.oFailedEvent = null;
			this.oMetadata = null;
			this.bMessageScopeSupported = false;
			this.mNamespaces = mParams.namespaces || {
				sap:"http://www.sap.com/Protocols/SAPData",
				m:"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
				"":"http://schemas.microsoft.com/ado/2007/06/edmx"
			};
			var that = this;
			this.fnResolve;

			// global promise
			this.pLoaded = new Promise(function(resolve, reject) {
					that.fnResolve = resolve;
			});

			function writeCache(mParams) {
				CacheManager.set(that.sCacheKey, JSON.stringify({
					metadata: that.oMetadata,
					params: mParams
				}));
			}

			function logError(oError) {
				Log.error("[ODataMetadata] initial loading of metadata failed");
				if (oError && oError.message) {
					Log.error("Error: " + oError.message);
				}
			}

			//check cache
			if (this.sCacheKey) {
				CacheManager.get(this.sCacheKey)
					.then(function(sMetadata) {
						if (sMetadata) {
							var oCacheMetadata = JSON.parse(sMetadata);
							this.oMetadata = oCacheMetadata.metadata;
							this._handleLoaded(this.oMetadata, oCacheMetadata.params, false);
						} else {
							this._loadMetadata()
								.then(writeCache)
								.catch(logError);
						}
					}.bind(this))
					.catch(logError);
			} else {
				this._loadMetadata()
					.catch(logError);
			}
		},

		metadata : {
			publicMethods : ["getServiceMetadata", "attachFailed", "detachFailed", "attachLoaded", "detachLoaded", "refresh"]
		}

	});

	ODataMetadata.prototype._setNamespaces = function(mNamespaces) {
		this.mNamespaces = mNamespaces;
	};

	/*
	 * Handle Promise resolving/eventing when metadata is loaded
	 *
	 */
	ODataMetadata.prototype._handleLoaded = function(oMetadata, mParams, bSuppressEvents) {
		var aEntitySets = [];

		this.oMetadata = this.oMetadata ? this.merge(this.oMetadata, oMetadata, aEntitySets) : oMetadata;
		this.oRequestHandle = null;

		mParams.entitySets = aEntitySets;

		// resolve global promise
		this.fnResolve(mParams);

		if (this.bAsync && !bSuppressEvents) {
			this.fireLoaded(this);
		} else if (!this.bAsync && !bSuppressEvents){
			//delay the event so anyone can attach to this _before_ it is fired, but make
			//sure that bLoaded is already set properly
			this.bLoaded = true;
			this.bFailed = false;
			this.oLoadEvent = setTimeout(this.fireLoaded.bind(this, mParams), 0);
		}
	};

	/**
	 * Loads the metadata for the service.
	 *
	 * @param {string} sUrl The metadata URL
	 * @param {boolean} bSuppressEvents Suppress metadata events
	 * @returns {Promise} Promise for metadata loading
	 * @private
	 */
	ODataMetadata.prototype._loadMetadata = function(sUrl, bSuppressEvents) {

		// request the metadata of the service
		var that = this;
		sUrl = sUrl || this.sUrl;
		var oRequest = this._createRequest(sUrl);

		return new Promise(function(resolve, reject) {
			var oRequestHandle;

			function _handleSuccess(oMetadata, oResponse) {
				if (!oMetadata || !oMetadata.dataServices) {
					var mParameters = {
							message: "Invalid metadata document",
							request: oRequest,
							response: oResponse
					};
					_handleError(mParameters);
					return;
				}

				that.sMetadataBody = oResponse.body;
				that.oRequestHandle = null;

				var mParams = {
					metadataString: that.sMetadataBody
				};

				var sLastModified = oResponse.headers["Last-Modified"];
				if (sLastModified) {
					mParams.lastModified = sLastModified;
				}
				var sETag = oResponse.headers["eTag"];
				if (sETag) {
					mParams.eTag = sETag;
				}
				that._handleLoaded(oMetadata, mParams, bSuppressEvents);
				resolve(mParams);
			}

			function _handleError(oError) {
				var mParams = {
						message: oError.message,
						request: oError.request,
						response: oError.response
				};
				if (oError.response) {
					mParams.statusCode = oError.response.statusCode;
					mParams.statusText = oError.response.statusText;
					mParams.responseText = oError.response.body;
				}

				if (oRequestHandle && oRequestHandle.bSuppressErrorHandlerCall) {
					return;
				}
				if (that.bAsync) {
					delete that.mRequestHandles[oRequestHandle.id];
				}
				reject(mParams);
				if (that.bAsync && !bSuppressEvents) {
					that.fireFailed(mParams);
				} else if (!that.bAsync && !bSuppressEvents){
					that.bFailed = true;
					that.oFailedEvent = setTimeout(that.fireFailed.bind(that, mParams), 0);
				}
			}

			// execute the request
			oRequestHandle = OData.request(oRequest, _handleSuccess, _handleError, OData.metadataHandler);
			if (that.bAsync) {
				oRequestHandle.id = uid();
				that.mRequestHandles[oRequestHandle.id] = oRequestHandle;
			}
		});

	};

	/**
	 * Refreshes the metadata creating a new request to the server.
	 *
	 * Returns a new promise which can be resolved or rejected depending on the metadata loading state.
	 *
	 * @returns {Promise} A promise on metadata loaded state
	 *
	 * @public
	 */
	ODataMetadata.prototype.refresh = function(){
		return this._loadMetadata();
	};


	/**
	 * Return the metadata object.
	 *
	 * @return {Object} Metadata object
	 * @public
	 */
	ODataMetadata.prototype.getServiceMetadata = function() {
		return this.oMetadata;
	};

	/**
	 * Checks whether metadata is available.
	 *
	 * @public
	 * @returns {boolean} Whether metadata is already loaded
	 */
	ODataMetadata.prototype.isLoaded = function() {
		return this.bLoaded;
	};

	/**
	 * Returns a promise for the loaded state of the metadata.
	 *
	 * @public
	 * @returns {Promise} A promise on metadata loaded state
	 */
	ODataMetadata.prototype.loaded = function() {
		return this.pLoaded;
	};

	/**
	 * Checks whether metadata loading has already failed.
	 *
	 * @public
	 * @returns {boolean} Whether metadata request has failed
	 */
	ODataMetadata.prototype.isFailed = function() {
		return this.bFailed;
	};

	/**
	 * The <code>loaded</code> event is fired after metadata has been loaded and parsed.
	 *
	 * @name sap.ui.model.odata.ODataMetadata#loaded
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @public
	 */

	/**
	 * Fires event {@link #event:loaded loaded} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @returns {sap.ui.model.odata.ODataMetadata} Reference to <code>this</code> in order to allow method chaining
	 * @protected
	 */
	ODataMetadata.prototype.fireLoaded = function(oParameters) {
		this.bLoaded = true;
		this.bFailed = false;
		this.fireEvent("loaded", oParameters);
		Log.debug(this + " - loaded was fired");
		return this;
	};

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:loaded loaded} event of this
	 * <code>sap.ui.model.odata.ODataMetadata</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.odata.ODataMetadata</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.odata.ODataMetadata</code> itself
	 *
	 * @returns {sap.ui.model.odata.ODataMetadata} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataMetadata.prototype.attachLoaded = function(oData, fnFunction, oListener) {
		this.attachEvent("loaded", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:loaded loaded} event of this
	 * <code>sap.ui.model.odata.ODataMetadata</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.odata.ODataMetadata} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataMetadata.prototype.detachLoaded = function(fnFunction, oListener) {
		this.detachEvent("loaded", fnFunction, oListener);
		return this;
	};


	/**
	 * The <code>failed</code> event is fired when loading or parsing metadata failed.
	 *
	 * @name sap.ui.model.odata.ODataMetadata#failed
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @public
	 */

	/**
	 * Fires event {@link #event:failed failed} to attached listeners.
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @param {string} [oParameters.message] A text that describes the failure.
	 * @param {string} [oParameters.statusCode] HTTP status code returned by the request (if available)
	 * @param {string} [oParameters.statusText] The status as a text, details not specified, intended only for diagnosis output
	 * @param {string} [oParameters.responseText] Response that has been received for the request, as a text string
	 *
	 * @returns {sap.ui.model.odata.ODataMetadata} Reference to <code>this</code> in order to allow method chaining
	 * @protected
	 */
	ODataMetadata.prototype.fireFailed = function(oParameters) {
		this.bFailed = true;
		this.fireEvent("failed", oParameters);
		return this;
	};


	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:failed failed} event of this
	 * <code>sap.ui.model.odata.ODataMetadata</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.odata.ODataMetadata</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.model.odata.ODataMetadata</code> itself
	 *
	 * @returns {sap.ui.model.odata.ODataMetadata} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataMetadata.prototype.attachFailed = function(oData, fnFunction, oListener) {
		this.attachEvent("failed", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:failed failed} event of this
	 * <code>sap.ui.model.odata.ODataMetadata</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.odata.ODataMetadata} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	ODataMetadata.prototype.detachFailed = function(fnFunction, oListener) {
		this.detachEvent("failed", fnFunction, oListener);
		return this;
	};

	/**
	 * Retrieves the association end which contains the multiplicity.
	 * @param {object} oEntityType the entity type
	 * @param {string} sName the name
	 * @returns {*} entity association end
	 * @private
	 */
	ODataMetadata.prototype._getEntityAssociationEnd = function(oEntityType, sName) {
		var sCacheKey;

		if (!this._checkMetadataLoaded()) {
			return null;
		}

		this._mGetEntityAssociationEndCache = this._mGetEntityAssociationEndCache || {};
		sCacheKey = oEntityType.namespace + "." + oEntityType.name + "/" + sName;
		// fill the cache
		if (this._mGetEntityAssociationEndCache[sCacheKey] === undefined) {
			var oNavigationProperty = oEntityType
					? Utils.findObject(oEntityType.navigationProperty, sName)
					: null,
				oAssociation = oNavigationProperty
					? Utils.getObject(this.oMetadata.dataServices.schema, "association", oNavigationProperty.relationship)
					: null,
				oAssociationEnd = oAssociation
					? Utils.findObject(oAssociation.end, oNavigationProperty.toRole, "role")
					: null;

			this._mGetEntityAssociationEndCache[sCacheKey] = oAssociationEnd;
		}

		// return the value from the cache
		return this._mGetEntityAssociationEndCache[sCacheKey];
	};

	function getEntitySetsMap(schema){
		var mEntitySets = {};
		for (var i = 0; i < schema.length; i++) {
			var oSchema = schema[i];
			if (oSchema.entityContainer) {
				for (var j = 0; j < oSchema.entityContainer.length; j++) {
					var oEntityContainer = oSchema.entityContainer[j];
					if (oEntityContainer.entitySet) {
						for (var k = 0; k < oEntityContainer.entitySet.length; k++) {
							if (oEntityContainer.entitySet[k].name != null) {
								mEntitySets[oEntityContainer.entitySet[k].name] = oEntityContainer.entitySet[k];
							}
						}
					}
				}
			}
		}
		return mEntitySets;
	}

	/**
	 * Finds the first matching entity set by name.
	 * @param {string} sName Name of the entityset
	 * @returns {*} The first matching entity set by name
	 * @private
	 */
	ODataMetadata.prototype._findEntitySetByName = function(sName) {
		// fill the cache
		if (!this.mEntitySets) {
			this.mEntitySets = getEntitySetsMap(this.oMetadata.dataServices.schema);
		}
		return this.mEntitySets[sName];
	};

	/**
	 * Extract the entity type name of a given path. Also navigation properties in the path will be followed to get the right entity type for that property.
	 * eg.
	 * /Categories(1)/Products(1)/Category --> will get the Categories entity type
	 * /Products --> will get the Products entity type
	 * @return {object} the entity type or null if not found
	 */
	ODataMetadata.prototype._getEntityTypeByPath = function(sPath) {
		if (!sPath) {
			assert(undefined, "sPath not defined!");
			return null;
		}

		if (this.mEntityTypes[sPath]) {
			return this.mEntityTypes[sPath];
		}

		if (!this._checkMetadataLoaded()) {
			return null;
		}


		// remove starting and trailing /
		var sCandidate = sPath.replace(/^\/|\/$/g, ""),
			aParts = sCandidate.split("/"),
			iLength = aParts.length,
			oParentEntityType,
			oEntityTypeInfo,
			oEntityType,
			oResultEntityType,
			that = this;

		// remove key from first path segment if any (e.g. Products(555) --> Products)
		if (aParts[0].indexOf("(") != -1) {
			aParts[0] = aParts[0].substring(0,aParts[0].indexOf("("));
		}

		if (iLength > 1 ) {
			// check if navigation property is used
			// e.g. Categories(1)/Products(1)/Category --> Category is a navigation property so we need the collection Categories

			oParentEntityType = that._getEntityTypeByPath(aParts[0]);

			for (var i = 1; i < aParts.length; i++ ) {
				if (oParentEntityType) {
					// remove key from current part if any
					if (aParts[i].indexOf("(") != -1) {
						aParts[i] = aParts[i].substring(0,aParts[i].indexOf("("));
					}
					// check for navigation properties
					// if no navigation property found we assume that the current part is a normal property so we return the current oParentEntityType
					// which is the parent entity type of that property
					oResultEntityType = that._getEntityTypeByNavProperty(oParentEntityType, aParts[i]);
					if (oResultEntityType) {
						oParentEntityType = oResultEntityType;
					}

					oEntityType = oParentEntityType;

				}
			}
		} else {
			// if only one part exists it should be the name of the collection and we can get the entity type for it
			oEntityTypeInfo = this._splitName(this._getEntityTypeName(aParts[0]));
			oEntityType = this._getObjectMetadata("entityType", oEntityTypeInfo.name, oEntityTypeInfo.namespace);
			if (oEntityType) {
				// store the type name also in the oEntityType
				oEntityType.entityType = this._getEntityTypeName(aParts[0]);
			}
		}

		// check for function imports
		if (!oEntityType) {
			var sFuncCandName = aParts[aParts.length - 1]; // last segment is always a function import
			var oFuncType = this._getFunctionImportMetadata(sFuncCandName, "GET");
			if (!oFuncType) {
				oFuncType = this._getFunctionImportMetadata(sFuncCandName, "POST");
			}
			if (oFuncType && oFuncType.entitySet) { // only collections supported which have an entitySet
				oEntityType = Object.assign({}, this._getEntityTypeByPath(oFuncType.entitySet));
				if (oEntityType) {
					// store the type name also in the oEntityType
					oEntityType.entityType = this._getEntityTypeName(oFuncType.entitySet);
					oEntityType.isFunction = true;
				}
			}
		}

		if (oEntityType) {
			this.mEntityTypes[sPath] = oEntityType;
		}

		//jQuery.sap.assert(oEntityType, "EntityType for path " + sPath + " could not be found!");
		return oEntityType;
	};

	/**
	 * Extract the entity type from a given sName. Retrieved types will be cached
	 * so further calls must not iterate the metadata structure again.
	 *
	 * #/Category/CategoryName --> will get the Category entity type
	 * @param {string} sName the qualified or unqualified name of the entity
	 * @return {object} the entity type or null if not found
	 */
	ODataMetadata.prototype._getEntityTypeByName = function(sName) {
		var oEntityType, that = this, sEntityName, sNamespace, oEntityTypeInfo;

		if (!sName) {
			assert(undefined, "sName not defined!");
			return null;
		}
		oEntityTypeInfo = this._splitName(sName);
		sNamespace = oEntityTypeInfo.namespace;
		sEntityName = oEntityTypeInfo.name;

		if (!this._checkMetadataLoaded()) {
			return null;
		}
		if (this.mEntityTypes[sName]) {
			oEntityType = this.mEntityTypes[sName];
		} else {
			jQuery.each(this.oMetadata.dataServices.schema, function(i, oSchema) {
				if (oSchema.entityType && (!sNamespace || oSchema.namespace === sNamespace)) {
					jQuery.each(oSchema.entityType, function(k, oEntity) {
						if (oEntity.name === sEntityName) {
							oEntityType = oEntity;
							that.mEntityTypes[sName] = oEntityType;
							oEntityType.namespace = oSchema.namespace;
							return false;
						}
					});
				}
			});
		}
		return oEntityType;
	};


	/**
	 * Checks whether the metadata was loaded.
	 *
	 * @returns {boolean} Returns true, if the metadata was loaded.
	 */
	ODataMetadata.prototype._checkMetadataLoaded = function(){
		if (!this.oMetadata || jQuery.isEmptyObject(this.oMetadata)) {
			assert(undefined, "No metadata loaded!");
			return false;
		}
		return true;
	};

	/**
	 * Extracts an Annotation from given path parts
	 * @param {array} aMetaParts
	 * @returns {any}
	 * @private
	 */
	ODataMetadata.prototype._getAnnotation = function(sPath) {
		var oNode, aParts, sMetaPath, aMetaParts, oEntityType, sPropertyPath, oProperty;

		aParts = sPath.split('/#');
		aMetaParts = aParts[1].split('/');

		//check if we have an absolute meta binding
		if (!aParts[0]) {
			// first part must be the entityType
			oEntityType = this._getEntityTypeByName(aMetaParts[0]);

			assert(oEntityType, aMetaParts[0] + " is not a valid EntityType");

			if (!oEntityType) {
				return;
			}

			//extract property
			sPropertyPath = aParts[1].substr(aParts[1].indexOf('/') + 1);
			oProperty = this._getPropertyMetadata(oEntityType,sPropertyPath);

			assert(oProperty, sPropertyPath + " is not a valid property path");
			if (!oProperty) {
				return;
			}

			sMetaPath = sPropertyPath.substr(sPropertyPath.indexOf(oProperty.name));
			sMetaPath = sMetaPath.substr(sMetaPath.indexOf('/') + 1);
		} else {
			//getentityType from data Path
			oEntityType = this._getEntityTypeByPath(aParts[0]);

			assert(oEntityType, aParts[0] + " is not a valid path");

			if (!oEntityType) {
				return;
			}

			//extract property
			sPath = aParts[0].replace(/^\/|\/$/g, "");
			sPropertyPath = sPath;
			while (!oProperty && sPropertyPath.indexOf("/") > 0) {
				sPropertyPath = sPropertyPath.substr(sPropertyPath.indexOf('/') + 1);
				oProperty = this._getPropertyMetadata(oEntityType, sPropertyPath);
			}

			assert(oProperty, sPropertyPath + " is not a valid property path");
			if (!oProperty) {
				return;
			}

			sMetaPath = aMetaParts.join('/');
		}



		oNode = this._getAnnotationObject(oEntityType, oProperty, sMetaPath);

		return oNode;
	};

	/**
	 * Extract the Annotation Object from a given oProperty and a metadata path
	 *
	 * @return {object} the annotation object/value
	 */
	ODataMetadata.prototype._getAnnotationObject = function(oEntityType, oObject, sMetaDataPath) {
		var aAnnotationParts, aParts, oAnnotation, oNode, sAnnotation;

		if (!oObject) {
			return;
		}

		oNode = oObject;
		aParts = sMetaDataPath.split('/');

		//V4 annotation
		if (aParts[0].indexOf('.') > -1) {
			return this._getV4AnnotationObject(oEntityType, oObject, aParts);
		} else {
			if (aParts.length > 1) {
				//TODO:namespace handling
				oNode = oNode[aParts[0]];
				if (!oNode && oObject.extensions) {
					for (var i = 0; i < oObject.extensions.length; i++) {
						var oExtension = oObject.extensions[i];
						if (oExtension.name == aParts[0]) {
							oNode = oExtension;
							break;
						}
					}
				}
				sMetaDataPath = aParts.splice(0,1);
				oAnnotation = this._getAnnotationObject(oEntityType, oNode, aParts.join('/'));
			} else {
				//handle attributes
				if (aParts[0].indexOf('@') > -1) {
					sAnnotation = aParts[0].substr(1);
					aAnnotationParts = sAnnotation.split(':');
					oAnnotation = oNode[aAnnotationParts[0]];
					if (!oAnnotation && oNode.extensions) {
						for (var i = 0; i < oNode.extensions.length; i++) {
							var oExtension = oNode.extensions[i];
							if (oExtension.name === aAnnotationParts[1] && oExtension.namespace === this.mNamespaces[aAnnotationParts[0]]) {
								oAnnotation = oExtension.value;
								break;
							}
						}
					}
				} else { // handle nodes
					aAnnotationParts = aParts[0].split(':');
					oAnnotation = oNode[aAnnotationParts[0]];
					oAnnotation = oNode[aParts[0]];
					if (!oAnnotation && oNode.extensions) {
						for (var i = 0; i < oNode.extensions.length; i++) {
							var oExtension = oNode.extensions[i];
							if (oExtension.name === aAnnotationParts[1] && oExtension.namespace === this.mNamespaces[aAnnotationParts[0]]) {
								oAnnotation = oExtension;
								break;
							}
						}
					}
				}
			}
		}
		return oAnnotation;
	};

	/*
	 * @private
	 */
	ODataMetadata.prototype._getV4AnnotationObject = function(oEntityType, oObject, aParts) {
		var oAnnotationNode, aAnnotations = [];

		if (aParts.length > 1) {
			assert(aParts.length == 1, "'" + aParts.join('/') + "' is not a valid annotation path");
			return;
		}

		var sTargetName = oEntityType.namespace ? oEntityType.namespace + "." : "";
		sTargetName += oEntityType.name + "/" + oObject.name;

		jQuery.each(this.oMetadata.dataServices.schema, function(i, oSchema) {
			if (oSchema.annotations) {
				jQuery.each(oSchema.annotations, function(k, oObject) {
					//we do not support qualifiers on target level
					if (oObject.target === sTargetName && !oObject.qualifier) {
						aAnnotations.push(oObject.annotation);
						return false;
					}
				});
			}
		});
		if (aAnnotations) {
			jQuery.each(aAnnotations, function(i, aAnnotation) {
				jQuery.each(aAnnotation, function(j, oAnnotation) {
					if (oAnnotation.term === aParts[0]) {
						oAnnotationNode = oAnnotation;
					}
				});
			});
		}
		return oAnnotationNode;
	};

	/**
	 * splits a name e.g. Namespace.Name into [Name, Namespace]
	 */
	ODataMetadata.prototype._splitName = function(sFullName) {
		var oInfo = {};
		if (sFullName) {
			var iSepIdx = sFullName.lastIndexOf(".");
			oInfo.name = sFullName.substr(iSepIdx + 1);
			oInfo.namespace = sFullName.substr(0, iSepIdx);
		}
		return oInfo;
	};


	/**
	*  search metadata for specified collection name (= entity set name)
	*/
	ODataMetadata.prototype._getEntityTypeName = function(sCollection) {
		var sEntityTypeName, oEntitySet;

		if (sCollection) {
			oEntitySet = this._findEntitySetByName(sCollection);
			if (oEntitySet){
				sEntityTypeName = oEntitySet.entityType;
			}
		}
		//jQuery.sap.assert(sEntityTypeName, "EntityType name of EntitySet "+ sCollection + " not found!");
		return sEntityTypeName;
	};

	/**
	 * get the object of a specified type name and namespace
	 */
	ODataMetadata.prototype._getObjectMetadata = function(sObjectType, sObjectName, sNamespace) {
		var oObject;
		if (sObjectName && sNamespace) {
			// search in all schemas for the sObjectName
			jQuery.each(this.oMetadata.dataServices.schema, function(i, oSchema) {
				// check if we found the right schema which will contain the sObjectName
				if (oSchema[sObjectType] && oSchema.namespace === sNamespace) {
					jQuery.each(oSchema[sObjectType], function(j, oCurrentObject) {
						if (oCurrentObject.name === sObjectName) {
							oObject = oCurrentObject;
							oObject.namespace = oSchema.namespace;
							return false;
						}
					});
					return !oObject;
				}
			});
		}
		return oObject;
	};

	/**
	 * Get the use-batch extension value if any
	 * @return {boolean} true/false
	 * @public
	 */
	ODataMetadata.prototype.getUseBatch = function() {
		var bUseBatch = false;
		// search in all schemas for the use batch extension
		jQuery.each(this.oMetadata.dataServices.schema, function(i, oSchema) {
			if (oSchema.entityContainer) {
				jQuery.each(oSchema.entityContainer, function(k, oEntityContainer) {
					if (oEntityContainer.extensions) {
						jQuery.each(oEntityContainer.extensions, function(l, oExtension) {
							if (oExtension.name === "use-batch" && oExtension.namespace === "http://www.sap.com/Protocols/SAPData") {
								bUseBatch = (typeof oExtension.value === 'string') ? (oExtension.value.toLowerCase() === 'true') : !!oExtension.value;
								return false;
							}
						});
					}
				});
			}
		});
		return bUseBatch;
	};


	ODataMetadata.prototype._getFunctionImportMetadataIterate = function(fnCheck, bSingleEntry) {
		var aObjects = [];
		// search in all schemas for the sObjectName
		each(this.oMetadata.dataServices.schema, function(iSchema, oSchema) {
			// check if we found the right schema which will contain the sObjectName
			if (oSchema["entityContainer"]) {
				each(oSchema["entityContainer"], function(iEntityContainer, oEntityContainer) {
					if (oEntityContainer["functionImport"]) {
						each(oEntityContainer["functionImport"], function(iFunctionImport, oFunctionImport) {
							if (fnCheck(oFunctionImport)) {
								aObjects.push(oFunctionImport);
								if (bSingleEntry) {
									return false;
								}
							}
						});
					}
					// break if single entry is wanted and there is exactly one
					return !(bSingleEntry && aObjects.length === 1);
				});
			}
			// break if single entry is wanted and there is exactly one
			return !(bSingleEntry && aObjects.length === 1);
		});
		return aObjects;
	};

	ODataMetadata.prototype._getFirstMatchingFunctionImportMetadata = function(fnCheck){
		var aObjects = this._getFunctionImportMetadataIterate(fnCheck, true);
		return aObjects.length === 1 ? aObjects[0] : null;
	};

	/**
	 * Retrieve the function import metadata for a name.
	 *
	 * @param {string} sFunctionName The name of the function import to look up
	 * @return {object[]} array of matching function import metadata
	 */
	ODataMetadata.prototype._getFunctionImportMetadataByName = function(sFunctionName) {
		if (sFunctionName.indexOf("/") > -1) {
			sFunctionName = sFunctionName.substr(sFunctionName.indexOf("/") + 1);
		}
		return this._getFunctionImportMetadataIterate(function(oFunctionImport) {
			return oFunctionImport.name === sFunctionName;
		});
	};

	/**
	 * Retrieve the function import metadata for a name and a method.
	 *
	 * @param {string} sFunctionName The name of the function import to look up
	 * @param {string} sMethod The HTTP Method for which this function is requested
	 */
	ODataMetadata.prototype._getFunctionImportMetadata = function(sFunctionName, sMethod) {
		if (sFunctionName.indexOf("/") > -1) {
			sFunctionName = sFunctionName.substr(sFunctionName.indexOf("/") + 1);
		}
		return this._getFirstMatchingFunctionImportMetadata(function(oFunctionImport) {
			return oFunctionImport.name === sFunctionName && oFunctionImport.httpMethod === sMethod;
		});
	};


	/**
	 * Returns the target EntityType for NavgigationProperty-name of another given Entytype object. The target is
	 * defined as the toRole of the navigationproperty; this method looks up the corresponding matching End in the
	 * corresponding Association and returns the matching entityType
	 * @see sap.ui.model.odata.ODataMetadata#_getEntityTypeByNavPropertyObject
	 *
	 * @param {map} mEntityType - The EntityType that has the NavigationProperty
	 * @param {string} sNavPropertyName - The name of the NavigationProperty in the EntityType
	 * @returns {map|undefined} The EntityType that the NavigationProperty points to or undefined if not found
	 * @private
	 */
	ODataMetadata.prototype._getEntityTypeByNavProperty = function(mEntityType, sNavPropertyName) {
		if (!mEntityType.navigationProperty) {
			return undefined;
		}

		for (var i = 0; i < mEntityType.navigationProperty.length; ++i) {
			var oNavigationProperty = mEntityType.navigationProperty[i];
			if (oNavigationProperty.name === sNavPropertyName) {
				return this._getEntityTypeByNavPropertyObject(oNavigationProperty);
			}
		}

		return undefined;
	};


	/**
	 * Returns the target EntityType for a given NavgigationProperty object. The target is defined as the toRole of
	 * the navigationproperty; this method looks up the corresponding matching End in the corresponding Association
	 * and returns the matching entityType
	 *
	 * @param {map} mNavProperty - The NavigationProperty (from the navigationProperty array of an EntityType)
	 * @returns {map} The EntityType that the NavigationProperty points to
	 * @private
	 */
	ODataMetadata.prototype._getEntityTypeByNavPropertyObject = function(mNavProperty) {
		var mToEntityType;

		var oAssociationInfo = this._splitName(mNavProperty.relationship);
		var mAssociation = this._getObjectMetadata("association", oAssociationInfo.name, oAssociationInfo.namespace);

		// get association for navigation property and then the collection name
		if (mAssociation) {
			var mEnd = mAssociation.end[0];
			if (mEnd.role !== mNavProperty.toRole) {
				mEnd = mAssociation.end[1];
			}
			var oEntityTypeInfo = this._splitName(mEnd.type);
			mToEntityType = this._getObjectMetadata("entityType", oEntityTypeInfo.name, oEntityTypeInfo.namespace);
			if (mToEntityType) {
				// store the type name also in the oEntityType
				mToEntityType.entityType = mEnd.type;
			}
		}
		return mToEntityType;
	};

	/**
	 * get all navigation property names in an array by the specified entity type
	 */
	ODataMetadata.prototype._getNavigationPropertyNames = function(oEntityType) {
		var aNavProps = [];
		if (oEntityType.navigationProperty) {
			jQuery.each(oEntityType.navigationProperty, function(k, oNavigationProperty) {
				aNavProps.push(oNavigationProperty.name);
			});
		}
		return aNavProps;
	};

	/**
	 * Get dependent nav property name, entityset and key properties for given entity and property name.
	 * If the property name is contained as key property in a referential constraint of one of
	 * the navigation properties, return the name of the navigation property, as well as the
	 * referenced entityset and the array of key properties.
	 */
	ODataMetadata.prototype._getNavPropertyRefInfo = function(oEntityType, sPropertyName) {
		var oNavPropInfo, oAssociation, oAssociationInfo, oAssociationSet, oPrincipal, oDependent,
			bContainsProperty, sRole, oEnd, sEntitySet, aKeys,
			that = this;
		each(oEntityType.navigationProperty, function(i, oNavProperty) {
			oAssociationInfo = that._splitName(oNavProperty.relationship);
			oAssociation = that._getObjectMetadata("association", oAssociationInfo.name, oAssociationInfo.namespace);
			// Can't find referential info, if referentialConstraint isn't provided
			if (!oAssociation || !oAssociation.referentialConstraint) {
				return;
			}
			oDependent = oAssociation.referentialConstraint.dependent;
			oEnd = oAssociation.end.find(function(oEnd) {
				return oEnd.role === oDependent.role;
			});
			// Only if dependent role type matches entity type, look for properties
			if (oEnd.type !== oEntityType.namespace + "." + oEntityType.name) {
				return;
			}
			bContainsProperty = oDependent.propertyRef.some(function(oPropertyRef) {
				return oPropertyRef.name === sPropertyName;
			});
			// If dependent doesn't contain the property return
			if (!bContainsProperty) {
				return;
			}
			oPrincipal = oAssociation.referentialConstraint.principal;
			sRole = oPrincipal.role;
			oAssociationSet = that._getAssociationSetByAssociation(oNavProperty.relationship);
			oEnd = oAssociationSet.end.find(function(oEnd) {
				return oEnd.role === sRole;
			});
			sEntitySet = oEnd.entitySet;
			aKeys = oPrincipal.propertyRef.map(function(oPropertyRef) {
				return oPropertyRef.name;
			});
			oNavPropInfo = {
				name: oNavProperty.name,
				entitySet: sEntitySet,
				keys: aKeys
			};
		});
		return oNavPropInfo;
	};

	/**
	*  extract the property metadata of a specified property of an entity type out of the metadata document
	*/
	ODataMetadata.prototype._getPropertyMetadata = function(oEntityType, sProperty) {
		var oPropertyMetadata, that = this;

		if (!oEntityType) {
			return;
		}

		// remove starting/trailing /
		sProperty = sProperty.replace(/^\/|\/$/g, "");
		var aParts = sProperty.split("/"); // path could point to a complex type or nav property

		jQuery.each(oEntityType.property, function(k, oProperty) {
			if (oProperty.name === aParts[0]) {
				oPropertyMetadata = oProperty;
				return false;
			}
		});

		if (aParts.length > 1) {
			// check for navigation property and complex type
			if (!oPropertyMetadata) {
				while (oEntityType && aParts.length > 1) {
					oEntityType = this._getEntityTypeByNavProperty(oEntityType, aParts[0]);
					aParts.shift();
				}
				if (oEntityType) {
					oPropertyMetadata = that._getPropertyMetadata(oEntityType, aParts[0]);
				}
			} else if (!oPropertyMetadata.type.toLowerCase().startsWith("edm.")) {
				var oNameInfo = this._splitName(oPropertyMetadata.type);
				oPropertyMetadata = this._getPropertyMetadata(this._getObjectMetadata("complexType", oNameInfo.name, oNameInfo.namespace), aParts[1]);
			}
		}

		//jQuery.sap.assert(oPropertyMetadata, "PropertyType for property "+ aParts[0]+ " of EntityType " + oEntityType.name + " not found!");
		return oPropertyMetadata;
	};

	ODataMetadata.prototype.destroy = function() {
		delete this.oMetadata;
		var that = this;

		// Abort pending xml request
		jQuery.each(this.mRequestHandles, function(sKey, oRequestHandle) {
			oRequestHandle.bSuppressErrorHandlerCall = true;
			oRequestHandle.abort();
			delete that.mRequestHandles[sKey];
		});
		if (!!this.oLoadEvent) {
			clearTimeout(this.oLoadEvent);
		}
		if (!!this.oFailedEvent) {
			clearTimeout(this.oFailedEvent);
		}

		EventProvider.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Creates caches for entity sets, entity types and navigation properties if not yet done and if
	 * the metadata are loaded, otherwise nothing is done.
	 *
	 * <code>this._entitySetMap</code> maps the name of an entity type (including the namespace,
	 * for example "GWSAMPLE_BASIC.SalesOrder") to its corresponding entity set object as returned
	 * by datajs.
	 * At each entity set object contained in <code>this.oMetadata</code> the reference
	 * <code>__entityType</code> to the corresponding entity type object is added.
	 * At each entity type object contained in <code>this.oMetadata</code> the map
	 * <code>__navigationPropertiesMap</code> is added which maps the navigation property name to
	 * the corresponding navigation property object as returned by datajs.
	 */
	ODataMetadata.prototype._fillElementCaches = function () {
		var that = this;

		if (this._entitySetMap || !this._checkMetadataLoaded()) {
			return;
		}

		this._entitySetMap = {};
		this.oMetadata.dataServices.schema.forEach(function (mSchema) {
			(mSchema.entityContainer || []).forEach(function (mContainer) {
				(mContainer.entitySet || []).forEach(function (mEntitySet) {
					var oEntityType = that._getEntityTypeByName(mEntitySet.entityType);
					oEntityType.__navigationPropertiesMap = {};
					(oEntityType.navigationProperty || []).forEach(function (oProp) {
						oEntityType.__navigationPropertiesMap[oProp.name] = oProp;
					});
					mEntitySet.__entityType = oEntityType;
					that._entitySetMap[mEntitySet.entityType] = mEntitySet;
				});
			});
		});
	};

	/**
	 * creation of a request object for changes
	 *
	 * @return {object} request object
	 * @private
	 */
	ODataMetadata.prototype._createRequest = function(sUrl) {
		// The 'sap-cancel-on-close' header marks the OData metadata request as cancelable. This helps to save resources at the back-end.
		var oDefaultHeaders = {
				"sap-cancel-on-close": true
			},
			oLangHeader = {
				"Accept-Language": sap.ui.getCore().getConfiguration().getLanguageTag()
			};

		jQuery.extend(oDefaultHeaders, this.mHeaders, oLangHeader);

		var oRequest = {
			headers: oDefaultHeaders,
			requestUri: sUrl,
			method: 'GET',
			user: this.sUser,
			password: this.sPassword,
			async: this.bAsync
		};

		if (this.bAsync) {
			oRequest.withCredentials = this.bWithCredentials;
		}

		return oRequest;
	};

	/**
	 * Returns the entity set to which the given entity path belongs
	 *
	 * @param {string} sEntityPath The path to the entity
	 * @return {map|undefined} The EntitySet to which the path belongs or undefined if none
	 */
	ODataMetadata.prototype._getEntitySetByPath = function(sEntityPath) {
		var oEntityType;

		this._fillElementCaches();

		oEntityType = this._getEntityTypeByPath(sEntityPath);

		if (oEntityType)  {
			return this._entitySetMap[oEntityType.entityType];
		}
	};

	/**
	 * Add metadata url: The response will be merged with the existing metadata object
	 *
	 * @param {string | string[]} vUrl Either one URL as string or an array of Uri strings
	 * @returns Promise The Promise for metadata loading
	 * @private
	 */
	ODataMetadata.prototype._addUrl = function(vUrl) {
		var aUrls = [].concat(vUrl);

		return Promise.all(aUrls.map(function(sUrl) {
			return this._loadMetadata(sUrl, true);
		}, this));
	};

	/**
	 * merges two metadata objects
	 * @param {object} oTarget Target metadata object
	 * @param {object} oSource Source metadata object
	 * @param {array} aEntitySets An array where the entitySets (metadata objects) from the source objects will
	 * 								be collected and returned.
	 * @return {object} oTarget The merged metadata object
	 * @private
	 */
	ODataMetadata.prototype.merge = function(oTarget, oSource, aEntitySets) {
		var that = this;

		// invalidate cache for entity set map
		if (this.mEntitySets) {
			delete this.mEntitySets;
		}
		jQuery.each(oTarget.dataServices.schema, function(i, oTargetSchema) {
			// find schema
			jQuery.each(oSource.dataServices.schema, function(j, oSourceSchema) {
				if (oSourceSchema.namespace === oTargetSchema.namespace) {
					//merge entityTypes
					if (oSourceSchema.entityType) {
						//cache entityType names
						if (!that.mEntityTypeNames) {
							that.mEntityTypeNames = {};
							oTargetSchema.entityType.map(function(o) {
								that.mEntityTypeNames[o.name] = true;
							});
						}
						oTargetSchema.entityType = !oTargetSchema.entityType ? [] : oTargetSchema.entityType;
						for (var i = 0; i < oSourceSchema.entityType.length; i++) {
							if (!(oSourceSchema.entityType[i].name in that.mEntityTypeNames)) {
								oTargetSchema.entityType.push(oSourceSchema.entityType[i]);
								that.mEntityTypeNames[oSourceSchema.entityType[i].name] = true;
							}
						}
					}
					//find EntityContainer if any
					if (oTargetSchema.entityContainer && oSourceSchema.entityContainer) {
						jQuery.each(oTargetSchema.entityContainer, function(k, oTargetContainer) {
							//merge entitySets
							jQuery.each(oSourceSchema.entityContainer, function(l, oSourceContainer) {
								if (oSourceContainer.entitySet) {
									if (oSourceContainer.name === oTargetContainer.name) {
										//cache entitySet names
										if (!that.mEntitySetNames) {
											that.mEntitySetNames = {};
											oTargetContainer.entitySet.map(function(o) {
												that.mEntitySetNames[o.name] = true;
											});
										}
										oTargetContainer.entitySet = !oTargetContainer.entitySet ? [] : oTargetContainer.entitySet;
										for (var i = 0; i < oSourceContainer.entitySet.length; i++) {
											if (!(oSourceContainer.entitySet[i].name in that.mEntitySetNames)) {
												oTargetContainer.entitySet.push(oSourceContainer.entitySet[i]);
												that.mEntitySetNames[oSourceContainer.entitySet[i].name] = true;
											}
										}
										oSourceContainer.entitySet.forEach(function(oElement) {
											aEntitySets.push(oElement);
										});
									}
								}
							});
						});
					}
					//merge Annotations
					if (oSourceSchema.annotations) {
						oTargetSchema.annotations = !oTargetSchema.annotations ? [] : oTargetSchema.annotations;
						oTargetSchema.annotations = oTargetSchema.annotations.concat(oSourceSchema.annotations);
					}
				}
			});
		});
		return oTarget;
	};

	/**
	 * Returns the first EntitySet from all EntityContainers that matches the namespace and name of the given EntityType
	 *
	 * @param {map} mEntityType - The EntityType object
	 * @return {map|null} Retuns the EntitySet object or null if not found
	 */
	ODataMetadata.prototype._getEntitySetByType = function(mEntityType) {
		var sEntityType = mEntityType.namespace + "." + mEntityType.name;

		var aSchema = this.oMetadata.dataServices.schema;
		for (var i = 0; i < aSchema.length; ++i) {
			var aContainers = aSchema[i].entityContainer;
			if (aContainers) {
				for (var n = 0; n < aContainers.length; ++n) {
					var aSets = aContainers[n].entitySet;
					if (aSets) {
						for (var m = 0; m < aSets.length; ++m) {
							if (aSets[m].entityType === sEntityType) {
								return aSets[m];
							}
						}
					}
				}
			}
		}
		return null;
	};

	/**
	 * Calculates the canonical path of the given deep path.
	 *
	 * @param {string} sPath The deep path
	 * @return {string|undefined} The canonical path or undefined
	 * @private
	 */
	ODataMetadata.prototype._calculateCanonicalPath = function(sPath) {
		var sCanonicalPath, iIndex, aParts, sTempPath;
		if (sPath) {
			iIndex = sPath.lastIndexOf(")");
			if (iIndex !== -1) {
				sTempPath = sPath.substr(0, iIndex + 1);
				var oEntitySet = this._getEntitySetByPath(sTempPath);
				if (oEntitySet) {
					if (oEntitySet.__entityType.isFunction) {
						sCanonicalPath = sPath;
					} else {
						aParts = sPath.split("/");
						if (sTempPath === "/" + aParts[1]) {
							//check for nav prop
							if (!(aParts[2] in oEntitySet.__entityType.__navigationPropertiesMap)) {
								sCanonicalPath = sPath;
							}

						} else {
							aParts = sTempPath.split("/");
							sTempPath = '/' + oEntitySet.name + aParts[aParts.length - 1].substr(aParts[aParts.length - 1].indexOf("(")) + sPath.substr(iIndex + 1);
							if (sTempPath !== sPath) {
								sCanonicalPath = sTempPath;
							}
						}
					}
				}
			}
		}
		return sCanonicalPath;
	};
	/**
	 * Returns the first AssociationSet from all EntityContainers that matches the association name
	 *
	 * @param {string} sAssociation The full qualified association name
	 * @return {map|null} Retuns the AssocationSet object or null if not found
	 */
	ODataMetadata.prototype._getAssociationSetByAssociation = function(sAssociation) {
		var aSchema = this.oMetadata.dataServices.schema;
		for (var i = 0; i < aSchema.length; ++i) {
			var aContainers = aSchema[i].entityContainer;
			if (aContainers) {
				for (var n = 0; n < aContainers.length; ++n) {
					var aSets = aContainers[n].associationSet;
					if (aSets) {
						for (var m = 0; m < aSets.length; ++m) {
							if (aSets[m].association === sAssociation) {
								return aSets[m];
							}
						}
					}
				}
			}
		}
		return null;
	};

	/**
	 * Whether MessageScope is supported by service or not.
	 *
	 * @return {boolean} Whether MessageScope is supported
	 * @private
	 */
	ODataMetadata.prototype._isMessageScopeSupported = function() {
		var aSchema = this.oMetadata.dataServices.schema,
			oContainer, aContainers;

		// Note: "The edmx:DataServices element contains zero or more edm:Schema elements..."
		if (!this.bMessageScopeSupported && aSchema) {
			for (var i = 0; i < aSchema.length; ++i) {
				aContainers = aSchema[i].entityContainer;
				if (aContainers) {
					for (var n = 0; n < aContainers.length; ++n) {
						oContainer = aContainers[n];
						if (oContainer.extensions && Array.isArray(oContainer.extensions)) {
							for (var m = 0; m < oContainer.extensions.length; ++m) {
								if (oContainer.extensions[m].name === "message-scope-supported" &&
									oContainer.extensions[m].namespace === this.mNamespaces.sap) {
									if (oContainer.extensions[m].value === "true") {
										this.bMessageScopeSupported = true;
										break;
									}
								}
							}
						}
					}
				}
			}
		}
		return this.bMessageScopeSupported;
	};
	/**
	 * Check whether the given path points to a entity collection or not (single entity or not known).
	 *
	 * @param {sPath} Entity path
	 * @returns {boolean} Whether the path points to a collection.
	 * @private
	 */

	ODataMetadata.prototype._isCollection = function(sPath){
		var bCollection = false;
		var iIndex = sPath.lastIndexOf("/");
		if (iIndex > 0){ //e.g. 0:'/SalesOrderSet', -1:'empty string'
			var sEntityPath = sPath.substring(0, iIndex);
			var oEntityType = this._getEntityTypeByPath(sEntityPath);

			if (oEntityType) {
				var oAssociation = this._getEntityAssociationEnd(oEntityType, sPath.substring(iIndex + 1));
				if (oAssociation && oAssociation.multiplicity === "*") {
					bCollection = true;
				}
			}
		} else {
			bCollection = true;
		}
		return bCollection;
	};

	/**
	 * Reduces the given path based on metadata by removing adjacent partner navigation properties.
	 * If there are no adjacent partner navigation properties or if the path does not match the
	 * metadata the given path is returned.
	 *
	 * Example: The reduced path for
	 * "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToHeader/GrossAmount"
	 * is "/SalesOrderSet('1')/GrossAmount" iff "ToLineItems" and "ToHeader" are marked as partners
	 * of each other, that means both navigation properties have the same relationship attribute.
	 *
	 * The metadata must be available.
	 *
	 * @param {string} sPath
	 *   The absolute data path to be reduced
	 * @returns {string}
	 *   The reduced absolute path
	 *
	 * @private
	 */
	ODataMetadata.prototype._getReducedPath = function (sPath) {
		var oAssociationEnd,
			i,
			sKeyPredicate,
			oNavigatedEntityType,
			oNavigationProperty1,
			oNavigationProperty2,
			sNavigationPropertyName,
			aSegments = sPath.split("/"),
			oStartEntityType;

		if (aSegments.length < 4) {
			// no partner properties that can be removed
			return sPath;
		}
		// ensure __navigationPropertiesMap is available at all entity types
		this._fillElementCaches();

		for (i = 1; i < aSegments.length - 2; i += 1) {
			oStartEntityType = this._getEntityTypeByPath(aSegments.slice(0, i + 1).join('/'));
			oNavigationProperty1 = oStartEntityType
				&& oStartEntityType.__navigationPropertiesMap[aSegments[i + 1].split("(")[0]];
			if (!oNavigationProperty1) { // segment could be a structural property
				continue;
			}
			sNavigationPropertyName = aSegments[i + 2].split("(")[0];
			oNavigatedEntityType = this._getEntityTypeByNavPropertyObject(oNavigationProperty1);
			oNavigationProperty2 = oNavigatedEntityType
				&& oNavigatedEntityType.__navigationPropertiesMap[sNavigationPropertyName];
			if (!oNavigationProperty2
					|| oNavigationProperty1.relationship !== oNavigationProperty2.relationship) {
				continue;
			}
			sKeyPredicate = aSegments[i + 2].slice(sNavigationPropertyName.length);
			oAssociationEnd
				= this._getEntityAssociationEnd(oNavigatedEntityType, sNavigationPropertyName);

			if (oAssociationEnd.multiplicity !== "*" // 1 or 0..1
					|| sKeyPredicate && aSegments[i].endsWith(sKeyPredicate)) {
				aSegments.splice(i + 1, 2);
				return this._getReducedPath(aSegments.join("/"));
			}
		}
		return aSegments.join("/");
	};

	return ODataMetadata;
});