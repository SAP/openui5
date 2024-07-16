/*!
 * ${copyright}
 */
/*eslint-disable max-len */


// Provides class sap.ui.model.odata.ODataMetadata
sap.ui.define([
	"./_ODataMetaModelUtils",
	"./AnnotationParser",
	"sap/base/assert",
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/util/each",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject",
	"sap/base/util/uid",
	"sap/ui/base/EventProvider",
	"sap/ui/core/cache/CacheManager",
	"sap/ui/thirdparty/datajs"
],
	function(Utils, AnnotationParser, assert, Log, Localization, each, extend, isEmptyObject, uid, EventProvider,
		CacheManager, OData) {
	"use strict";
	/*eslint max-nested-callbacks: 0*/

	var sClassName = "sap.ui.model.odata.ODataMetadata",
		sSAPAnnotationNamespace = "http://www.sap.com/Protocols/SAPData";

	/**
	 * Constructor for a new ODataMetadata.
	 *
	 * @param {string} sMetadataURI needs the correct metadata uri including $metadata
	 * @param {object} mParams map of parameters.
	 * @param {boolean} [mParams.async=true] request is per default async
	 * @param {string} [mParams.user] <b>Deprecated</b> for security reasons. Use strong server side
	 *   authentication instead. UserID for the service.
	 * @param {string} [mParams.password] <b>Deprecated</b> for security reasons. Use strong server
	 *   side authentication instead. Password for the service.
	 * @param {object} [mParams.headers] (optional) map of custom headers which should be set with the request.
	 * @param {string} [mParams.cacheKey] (optional) A valid cache key
	 * @param {string} [mParams.metadata] The metadata XML as string as provided in a back-end response; the
	 *   <code>sMetadataURI</code> parameter is ignored if this parameter is set, and there is no request for the
	 *   metadata.
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
			this.sMetadata = mParams.metadata;
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

			// global promises
			this.pLoadedWithReject = new Promise(function (resolve, reject) {
				that.fnResolve = resolve;
				that.fnReject = reject;
			});
			this.pLoaded = this.pLoadedWithReject.catch(function (oError) {
				return new Promise(function (resolve, reject) {
					that.fnResolve = resolve;
				});
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

		metadata : {}

	});

	/**
	 * Returns whether the function returns a collection.
	 *
	 * @param {object} mFunctionInfo The function info map
	 * @returns {boolean} Whether the function returns a collection
	 * @private
	 */
	ODataMetadata._returnsCollection = function (mFunctionInfo) {
		if (mFunctionInfo && mFunctionInfo.returnType
				&& mFunctionInfo.returnType.startsWith("Collection(")) {
			return true;
		}

		return false;
	};

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

		// resolve global promises
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

		if (!this.sMetadata) {
			var oRequest = this._createRequest(sUrl);
		}

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
				that.fnReject(mParams);
				if (that.bAsync && !bSuppressEvents) {
					that.fireFailed(mParams);
				} else if (!that.bAsync && !bSuppressEvents){
					that.bFailed = true;
					that.oFailedEvent = setTimeout(that.fireFailed.bind(that, mParams), 0);
				}
			}

			if (that.sMetadata) { // response available synchronously
				const oResponse = {
					headers : {"Content-Type" : "application/xml"},
					body : that.sMetadata
				};
				// trigger response processing in datajs: this sets the parsed response to oResponse.data
				OData.metadataHandler.read(oResponse, /*oDatajsContext*/ {});
				_handleSuccess(oResponse.data, oResponse);
				return;
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
	 * @param {boolean} [bRejectOnFailure=false]
	 *   With <code>bRejectOnFailure=false</code> the returned promise is not rejected. In case of
	 *   failure this promise stays pending.
	 *   Since 1.79 with <code>bRejectOnFailure=true</code> the returned promise is rejected when
	 *   the initial loading of the metadata fails.
	 *
	 * @returns {Promise} A promise on metadata loaded state
	 * @public
	 */
	ODataMetadata.prototype.loaded = function (bRejectOnFailure) {
		return bRejectOnFailure ? this.pLoadedWithReject : this.pLoaded;
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
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
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
	 * Extract the entity type name of a given path. Also navigation properties in the path will be
	 * followed to get the right entity type for that property.
	 * eg.
	 * /Categories(1)/Products(1)/Category --> will get the Categories entity type
	 * /Products --> will get the Products entity type
	 *
	 * @param {string} sPath The entity types path
	 * @return {object} The entity type or null if not found
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
			each(this.oMetadata.dataServices.schema, function(i, oSchema) {
				if (oSchema.entityType && (!sNamespace || oSchema.namespace === sNamespace)) {
					each(oSchema.entityType, function(k, oEntity) {
						if (oEntity.name === sEntityName) {
							oEntityType = oEntity;
							that.mEntityTypes[sName] = oEntityType;
							oEntityType.namespace = oSchema.namespace;
							return false;
						}

						return true;
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
		if (!this.oMetadata || isEmptyObject(this.oMetadata)) {
			assert(undefined, "No metadata loaded!");
			return false;
		}
		return true;
	};

	/**
	 * Extracts an Annotation from given path parts.
	 *
	 * @param {string} sPath
	 *   The metadata path to the annotation
	 * @returns {object|undefined}
	 *   The annotation for the given metadata path; returns <code>undefined</code> if no annotation
	 *   can be found for that path
	 *
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
				return undefined;
			}

			//extract property
			sPropertyPath = aParts[1].substr(aParts[1].indexOf('/') + 1);
			oProperty = this._getPropertyMetadata(oEntityType,sPropertyPath);

			assert(oProperty, sPropertyPath + " is not a valid property path");
			if (!oProperty) {
				return undefined;
			}

			sMetaPath = sPropertyPath.substr(sPropertyPath.indexOf(oProperty.name));
			sMetaPath = sMetaPath.substr(sMetaPath.indexOf('/') + 1);
		} else {
			//getentityType from data Path
			oEntityType = this._getEntityTypeByPath(aParts[0]);

			assert(oEntityType, aParts[0] + " is not a valid path");

			if (!oEntityType) {
				return undefined;
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
				return undefined;
			}

			sMetaPath = aMetaParts.join('/');
		}



		oNode = this._getAnnotationObject(oEntityType, oProperty, sMetaPath);

		return oNode;
	};

	/**
	 * Gets the annotation specified by the given metadata path in the given metadata object for the
	 * given type.
	 *
	 * @param {object} oEntityType The entity type of the property
	 * @param {object} oObject The metadata object
	 * @param {string} sMetaDataPath The metadata path
	 * @return {object|undefined} The annotation object/value
	 */
	ODataMetadata.prototype._getAnnotationObject = function(oEntityType, oObject, sMetaDataPath) {
		var oAnnotation, sAnnotation, aAnnotationParts, oExtension, i, oNode, aParts;

		if (!oObject) {
			return undefined;
		}

		oNode = oObject;
		aParts = sMetaDataPath.split('/');

		//V4 annotation
		if (aParts[0].indexOf('.') > -1) {
			return this._getV4AnnotationObject(oEntityType, oObject, aParts);
		} else if (aParts.length > 1) {
			// Additional namespace handling cannot be done to keep compatibility
			oNode = oNode[aParts[0]];
			if (!oNode && oObject.extensions) {
				for (i = 0; i < oObject.extensions.length; i++) {
					oExtension = oObject.extensions[i];
					if (oExtension.name == aParts[0]) {
						oNode = oExtension;
						break;
					}
				}
			}
			sMetaDataPath = aParts.splice(0,1);
			oAnnotation = this._getAnnotationObject(oEntityType, oNode, aParts.join('/'));
		} else if (aParts[0].indexOf('@') > -1) { //handle attributes
			sAnnotation = aParts[0].substr(1);
			aAnnotationParts = sAnnotation.split(':');
			oAnnotation = oNode[aAnnotationParts[0]];
			if (!oAnnotation && oNode.extensions) {
				for (i = 0; i < oNode.extensions.length; i++) {
					oExtension = oNode.extensions[i];
					if (oExtension.name === aAnnotationParts[1]
							&& oExtension.namespace === this.mNamespaces[aAnnotationParts[0]]) {
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
				for (i = 0; i < oNode.extensions.length; i++) {
					oExtension = oNode.extensions[i];
					if (oExtension.name === aAnnotationParts[1]
							&& oExtension.namespace === this.mNamespaces[aAnnotationParts[0]]) {
						oAnnotation = oExtension;
						break;
					}
				}
			}
		}
		return oAnnotation;
	};

	/**
	 * Gets the annotation specified by the given metadata path in the given metadata object for the
	 * given type.
	 *
	 * @param {object} oEntityType The entity type of the property
	 * @param {object} oObject The metadata object
	 * @param {string[]} aParts The metadata path; must contain exactly one element
	 * @return {object|undefined} The annotation object/value
	 *
	 * @private
	 */
	ODataMetadata.prototype._getV4AnnotationObject = function(oEntityType, oObject, aParts) {
		var oAnnotationNode, aAnnotations = [];

		if (aParts.length > 1) {
			assert(aParts.length == 1, "'" + aParts.join('/') + "' is not a valid annotation path");
			return undefined;
		}

		var sTargetName = oEntityType.namespace ? oEntityType.namespace + "." : "";
		sTargetName += oEntityType.name + "/" + oObject.name;

		each(this.oMetadata.dataServices.schema, function(i, oSchema) {
			if (oSchema.annotations) {
				each(oSchema.annotations, function(k, oObject) {
					//we do not support qualifiers on target level
					if (oObject.target === sTargetName && !oObject.qualifier) {
						aAnnotations.push(oObject.annotation);
						return false;
					}
					return true;
				});
			}
		});
		if (aAnnotations) {
			each(aAnnotations, function(i, aAnnotation) {
				each(aAnnotation, function(j, oAnnotation) {
					if (oAnnotation.term === aParts[0]) {
						oAnnotationNode = oAnnotation;
					}
				});
			});
		}
		return oAnnotationNode;
	};

	/**
	 * Splits a full qualified name into its namespace and its name, for example splits
	 * "my.namespace.Foo" into {name : "Foo", namespace : "my.namespace"}.
	 *
	 * @param {string} sFullName
	 *   The full name
	 * @returns {object}
	 *   An object containing the properties <code>name</code> and <code>namespace</code>
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
	 * Gets the entity type name for the given entity set name.
	 *
	 * @param {string} sEntitySetName The collection name
	 * @returns {string} The name of the collection's entity type
	 */
	ODataMetadata.prototype._getEntityTypeName = function(sEntitySetName) {
		var sEntityTypeName, oEntitySet;

		if (sEntitySetName) {
			oEntitySet = this._findEntitySetByName(sEntitySetName);
			if (oEntitySet){
				sEntityTypeName = oEntitySet.entityType;
			}
		}
		return sEntityTypeName;
	};

	/**
	 * Gets the object of a specified type name and namespace.
	 *
	 * @param {string} sObjectType The object's type
	 * @param {string} sObjectName The object's name
	 * @param {string} sNamespace The object's namespace
	 * @returns {object} The found object
	 */
	ODataMetadata.prototype._getObjectMetadata = function(sObjectType, sObjectName, sNamespace) {
		var oObject;
		if (sObjectName && sNamespace) {
			// search in all schemas for the sObjectName
			each(this.oMetadata.dataServices.schema, function(i, oSchema) {
				// check if we found the right schema which will contain the sObjectName
				if (oSchema[sObjectType] && oSchema.namespace === sNamespace) {
					each(oSchema[sObjectType], function(j, oCurrentObject) {
						if (oCurrentObject.name === sObjectName) {
							oObject = oCurrentObject;
							oObject.namespace = oSchema.namespace;
							return false;
						}
						return true;
					});
					return !oObject;
				}
				return true;
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
		each(this.oMetadata.dataServices.schema, function(i, oSchema) {
			if (oSchema.entityContainer) {
				each(oSchema.entityContainer, function(k, oEntityContainer) {
					if (oEntityContainer.extensions) {
						each(oEntityContainer.extensions, function(l, oExtension) {
							if (oExtension.name === "use-batch" && oExtension.namespace === "http://www.sap.com/Protocols/SAPData") {
								bUseBatch = (typeof oExtension.value === 'string') ? (oExtension.value.toLowerCase() === 'true') : !!oExtension.value;
								return false;
							}
							return true;
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
							return true;
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
	 *
	 * @returns {object|null} The function import metadata
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
	 * Returns the target EntityType for the NavigationProperty of a given EntityType object. The target is
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
	 * Returns the target EntityType for a given NavigationProperty object. The target is defined as the toRole of
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
	 * Get all navigation property names in an array by the specified entity type.
	 *
	 * @param {object} oEntityType The entity type
	 * @returns {string[]} An array containing the navigation property names
	 */
	ODataMetadata.prototype._getNavigationPropertyNames = function(oEntityType) {
		var aNavProps = [];
		if (oEntityType.navigationProperty) {
			each(oEntityType.navigationProperty, function(k, oNavigationProperty) {
				aNavProps.push(oNavigationProperty.name);
			});
		}
		return aNavProps;
	};

	/**
	 * Get dependent nav property name, entityset and key properties for given entity and property
	 * name. If the property name is contained as key property in a referential constraint of one of
	 * the navigation properties, return the name of the navigation property, as well as the
	 * referenced entityset and the array of key properties.
	 *
	 * @param {object} oEntityType The entity type
	 * @param {string} sPropertyName The property name
	 * @returns {object} An object containing information about the navigation property
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
	 * Gets the property metadata of the given property path relative to the given entity type.
	 *
	 * @param {object} oEntityType
	 *   The entity type
	 * @param {string} sPropertyPath
	 *   The property path relative to the given entity type; may contain leading or trailing "/" and may contain
	 *   navigation properties, complex types and annotation path, for example: "Description" (simple property),
	 *   "ToProducts/Name" (property via navigation property), "Address/Street" (property via complex type),
	 *   "ToSupplier/Address/Street" (property via navigation property and complex type), "Amount/@sap:label" (property
	 *   with additional annotation path)
	 * @returns {object|undefined}
	 *   The property's metadata; or <code>undefined</code> if no property metadata could be found
	 */
	ODataMetadata.prototype._getPropertyMetadata = function(oEntityType, sPropertyPath) {
		var oPropertyMetadata, that = this;

		if (!oEntityType) {
			return undefined;
		}

		// remove starting/trailing /
		sPropertyPath = sPropertyPath.replace(/^\/|\/$/g, "");
		var aParts = sPropertyPath.split("/"); // path could point to a complex type or nav property

		each(oEntityType.property, function(k, oProperty) {
			if (oProperty.name === aParts[0]) {
				oPropertyMetadata = oProperty;
				return false;
			}
			return true;
		});

		if (aParts.length > 1) {
			// check for navigation property and complex type
			if (!oPropertyMetadata) {
				var oLastEntityType;
				while (oEntityType && aParts.length > 1) {
					oEntityType = this._getEntityTypeByNavProperty(oEntityType, aParts[0]);
					if (oEntityType) {
						oLastEntityType = oEntityType;
						aParts.shift();
					}
				}
				if (oEntityType) { // then there is only one part left
					oPropertyMetadata = that._getPropertyMetadata(oEntityType, aParts[0]);
				} else if (oLastEntityType) {
					// the remaining first part may be a complex type; retry with the last known entity type and the
					// remaining path
					oPropertyMetadata = that._getPropertyMetadata(oLastEntityType, aParts.join("/"));
				} // else: then the first part is neither a complex type nor a navigation property -> return undefined
			} else if (!oPropertyMetadata.type.toLowerCase().startsWith("edm.")) {
				var oNameInfo = this._splitName(oPropertyMetadata.type);
				oPropertyMetadata = this._getPropertyMetadata(this._getObjectMetadata("complexType", oNameInfo.name, oNameInfo.namespace), aParts[1]);
			} // else: the rest of the path is not relevant as it may be a metadata path, e.g. @sap:label
		}

		return oPropertyMetadata;
	};

	/**
	 * Gets a map of property names defined by referential constraints. Maps a key property name of the given entity to
	 * the corresponding property name of the entity referenced by the given navigation property.
	 *
	 * @param {object} oSourceEntityType
	 *   The entity type, for example the metadata object for "GWSAMPLE_BASIC.BusinessPartner"
	 * @param {string} sNavigationProperty
	 *   The navigation property name, for example "ToProducts"
	 * @returns {Object<string, string>}
	 *   Maps a key property name of the given entity to the foreign key property name of the entity referenced by the
	 *   given navigation property based on the association's referential constraints; returns an empty object if no
	 *   mapping is defined; for example <code>{"BusinessPartnerID" : "SupplierID"}</code>
	 * @private
	 */
	ODataMetadata.prototype._getReferentialConstraintsMapping = function (oSourceEntityType, sNavigationProperty) {
		const oNavigationPropertyInfo = oSourceEntityType.navigationProperty
			.find((oNavigationProperty) => oNavigationProperty.name === sNavigationProperty);
		const oAssociationInfo = this._splitName(oNavigationPropertyInfo.relationship);
		const oAssociation = this._getObjectMetadata("association", oAssociationInfo.name, oAssociationInfo.namespace);
		if (oNavigationPropertyInfo.fromRole === oAssociation.referentialConstraint?.principal.role) {
			const aSourceProperties = oAssociation.referentialConstraint.principal.propertyRef;
			const aTargetProperties = oAssociation.referentialConstraint.dependent.propertyRef;
			return aSourceProperties.reduce((mSource2TargetProperty, oSourceProperty, iSourceIndex) => {
				mSource2TargetProperty[oSourceProperty.name] = aTargetProperties[iSourceIndex].name;
				return mSource2TargetProperty;
			}, {});
		}
		return {};
	};

	ODataMetadata.prototype.destroy = function() {
		delete this.oMetadata;
		var that = this;

		// Abort pending xml request
		each(this.mRequestHandles, function(sKey, oRequestHandle) {
			oRequestHandle.bSuppressErrorHandlerCall = true;
			oRequestHandle.abort();
			delete that.mRequestHandles[sKey];
		});
		if (this.oLoadEvent) {
			clearTimeout(this.oLoadEvent);
		}
		if (this.oFailedEvent) {
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
	 * Creates a request object for changes.
	 *
	 * @param {string} sUrl The request URL
	 * @return {object} The request object
	 *
	 * @private
	 */
	ODataMetadata.prototype._createRequest = function(sUrl) {
		// The 'sap-cancel-on-close' header marks the OData metadata request as cancelable. This helps to save resources at the back-end.
		var oDefaultHeaders = {
				"sap-cancel-on-close": true
			},
			oLangHeader = {
				"Accept-Language": Localization.getLanguageTag().toString()
			};

		extend(oDefaultHeaders, this.mHeaders, oLangHeader);

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

		return oEntityType && this._entitySetMap[oEntityType.entityType];
	};

	/**
	 * Add metadata url: The response will be merged with the existing metadata object.
	 *
	 * @param {string|string[]} vUrl Either one URL as string or an array of URI strings
	 * @returns {Promise} The Promise for metadata loading
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
		each(oTarget.dataServices.schema, function(i, oTargetSchema) {
			// find schema
			each(oSource.dataServices.schema, function(j, oSourceSchema) {
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
						each(oTargetSchema.entityContainer, function(k, oTargetContainer) {
							//merge entitySets
							each(oSourceSchema.entityContainer, function(l, oSourceContainer) {
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
	 * @return {map|null} Returns the EntitySet object or null if not found
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
	 * @return {map|null} Returns the AssociationSet object or null if not found
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
	 * @param {string} sPath Entity path
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

	/**
	 * Returns an array of property names for the keys of the entity referenced by the given
	 * absolute data path, e.g. "/Categories(1)/Products(1)/Category".
	 *
	 * @param {string} sPath
	 *   The absolute data path
	 * @returns {string[]}
	 *   The names of the key properties, or <code>undefined</code> if the given path does not
	 *   reference an entity type or a collection of entity types
	 * @private
	 */
	ODataMetadata.prototype.getKeyPropertyNamesByPath = function (sPath) {
		var oAssociation,
			oEntityType,
			iIndex = sPath.lastIndexOf("/");

		if (iIndex > 0) {
			// check that last segment is a navigation property and set oEntityType accordingly
			oEntityType = this._getEntityTypeByPath(sPath.slice(0, iIndex));
			if (oEntityType) {
				oAssociation = this._getEntityAssociationEnd(oEntityType,
					sPath.slice(iIndex + 1).split("(")[0]);
				oEntityType = oAssociation
					? this._getEntityTypeByName(oAssociation.type)
					: undefined; // sPath references a property or a complex type
			}
		} else { // EntitySet or FunctionImport
			oEntityType = this._getEntityTypeByPath(sPath);
		}
		return oEntityType && oEntityType.key.propertyRef.map(function (oKey) {
			return oKey.name;
		});
	};

	/**
	 * Gets the canonical path of the entity referenced by the given function import and its
	 * parameters based on the function import's metadata.
	 *
	 * @param {Object<string,any>} mFunctionInfo
	 *   The function import metadata as returned by {@link #_getFunctionImportMetadata}
	 * @param {Object<string,string>} mFunctionParameters
	 *   Maps the function parameter name to its correct formatted value; for example
	 *   {SalesOrderID : "'42'"}
	 * @returns {string}
	 *   The canonical path of the entity referenced by the given function import and its
	 *   parameters; empty string if the path cannot be determined
	 * @private
	 */
	ODataMetadata.prototype._getCanonicalPathOfFunctionImport = function (mFunctionInfo,
			mFunctionParameters) {
		var sActionFor, mEntitySet, mEntityType, i, aKeys, sParameterName, aPropertyReferences,
			aExtensions = mFunctionInfo.extensions,
			sFunctionReturnType = mFunctionInfo.returnType,
			sId = "",
			bIsCollection = false;

		if (aExtensions) {
			for (i = 0; i < aExtensions.length; i += 1) {
				if (aExtensions[i].name === "action-for") {
					sActionFor = aExtensions[i].value;
					break;
				}
			}
		}
		if (ODataMetadata._returnsCollection(mFunctionInfo)) {
			bIsCollection = true;
			sFunctionReturnType = sFunctionReturnType.slice(11/* "Collection(".length */, -1);
		}
		if (sActionFor) {
			mEntityType = this._getEntityTypeByName(sActionFor);
		} else if (mFunctionInfo.entitySet) {
			mEntityType = this._getEntityTypeByPath(mFunctionInfo.entitySet);
		} else if (sFunctionReturnType) {
			mEntityType = this._getEntityTypeByName(sFunctionReturnType);
		}
		if (mEntityType) {
			mEntitySet = this._getEntitySetByType(mEntityType);
			if (mEntitySet && mEntityType.key && mEntityType.key.propertyRef) {
				if (bIsCollection) {
					return "/" + mEntitySet.name;
				}
				aPropertyReferences = mEntityType.key.propertyRef;
				// Only if the function import is annotated with the SAP OData V2 annotation
				// <code>sap:action-for</code>, the  names of the function import parameters and the
				// names of the entity keys are the same. Otherwise it is not guaranteed that the
				// function parameter name is equal to the corresponding key property of the
				// resulting entity type.
				// Parameter values need to be encoded, property names contain only the characters
				// _A-Za-z0-9 which don't need to be encoded.
				if (aPropertyReferences.length === 1) {
					sParameterName = aPropertyReferences[0].name;
					if (mFunctionParameters[sParameterName]) {
						sId = encodeURIComponent(mFunctionParameters[sParameterName]);
					}
				} else {
					aKeys = [];
					for (i = 0; i < aPropertyReferences.length; i += 1) {
						sParameterName = aPropertyReferences[i].name;
						if (mFunctionParameters[sParameterName]) {
							aKeys.push(sParameterName + "="
								+ encodeURIComponent(mFunctionParameters[sParameterName]));
						}
					}
					sId = aKeys.join(",");
				}

				return "/" + mEntitySet.name + "(" + sId + ")";
			} else if (!mEntitySet) {
				Log.error("Cannot determine path of the entity set for the function import '"
					+ mFunctionInfo.name + "'", this, sClassName);
			} else {
				Log.error("Cannot determine keys of the entity type '" + mEntityType.entityType
					+ "' for the function import '" + mFunctionInfo.name + "'", this, sClassName);
			}
		}

		return "";
	};

	/**
	 * Splits the given absolute path by the last navigation property. Computation stops at the
	 * first non-navigation property or if an entity type for a path segment cannot be determined.
	 *
	 * @param {string} sPath
	 *   Absolute path to be split
	 * @return {object}
	 *   An object containing following properties:
	 *   <ul>
	 *     <li>{string} pathBeforeLastNavigationProperty: The absolute path in front of the last
	 *       navigation property; if the given path does not have any navigation property, the
	 *       given path is returned</li>
	 *     <li>{string} lastNavigationProperty: The last navigation property in the given path,
	 *       starting with a <code>/</code> and including the key predicate if available; maybe
	 *       <code>""</code> if the given path does not contain any navigation property</li>
	 *     <li>{string} pathAfterLastNavigationProperty: The part after the last navigation
	 *       property in the given path, starting with a <code>/</code> or <code>""</code> if there
	 *       is no navigation property in the given path</li>
	 *     <li>{boolean} addressable: Whether the last navigation property references an
	 *       addressable entity set</li>
	 *   </ul>
	 * @private
	 */
	ODataMetadata.prototype._splitByLastNavigationProperty = function (sPath) {
		var oEntityType, i, iKeyPredicateIndex, iLastNavigationPropertyIndex, sSegment,
			aSegments = sPath.split("/"),
			sFirstPathSegment = "/" + aSegments[1],
			iSegmentsLength = aSegments.length;

		// ensure that caches for type and navigation properties are filled
		this._fillElementCaches();
		oEntityType = this._getEntityTypeByPath(sFirstPathSegment);
		for (i = 2; i < iSegmentsLength; i += 1) {
			sSegment = aSegments[i];
			iKeyPredicateIndex = sSegment.indexOf("(");
			if (iKeyPredicateIndex !== -1) {
				sSegment = sSegment.slice(0, iKeyPredicateIndex);
			}
			if (oEntityType && oEntityType.__navigationPropertiesMap[sSegment]) {
				iLastNavigationPropertyIndex = i;
				oEntityType = this._getEntityTypeByNavProperty(oEntityType, sSegment);
			} else {
				break;
			}
		}

		if (iLastNavigationPropertyIndex === undefined) {
			return {
				pathBeforeLastNavigationProperty : sPath,
				lastNavigationProperty : "",
				addressable : true,
				pathAfterLastNavigationProperty : ""
			};
		}

		return {
			pathBeforeLastNavigationProperty :
				aSegments.slice(0, iLastNavigationPropertyIndex).join("/"),
			lastNavigationProperty : "/" + aSegments[iLastNavigationPropertyIndex],
			addressable : this._isAddressable(oEntityType),
			pathAfterLastNavigationProperty : (iLastNavigationPropertyIndex + 1) >= iSegmentsLength
				? ""
				: ("/" + aSegments.slice(iLastNavigationPropertyIndex + 1).join("/"))
		};
	};

	/**
	 * Whether the entity set for the given entity type is addressable. The entity set for the type
	 * is not addressable if the set is annotated with <code>sap:addressable="false"</code>;
	 * otherwise it is addressable. The element cache has to be filled, {@link #_fillElementCaches}.
	 *
	 * @param {object} [oEntityType]
	 *   The metadata object representing an entity type
	 * @return {boolean}
	 *   Whether the entity set of the given entity type is addressable
	 *
	 * @private
	 */
	ODataMetadata.prototype._isAddressable = function (oEntityType) {
		var oEntitySet;

		if (!oEntityType) { // should not happen; for robustness
			return true;
		}
		oEntitySet = this._entitySetMap[oEntityType.entityType];
		if (!oEntitySet || !oEntitySet.extensions) {
			// for robustness: oEntitySet should never be falsy if the metadata are correct
			return true;
		}

		return !oEntitySet.extensions.some(function (oExtension) {
			return oExtension.name === "addressable"
				&& oExtension.namespace === sSAPAnnotationNamespace
				&& oExtension.value === "false";
		});
	};

	/**
	 * Returns the annotations for the given metadata string.
	 *
	 * @param {string} sMetadata The service metadata string in XML format as contained in the service's $metadata
	 * @returns {object} The annotation object
	 *
	 * @private
	 * @ui5-restricted sap.ui.core.util.MockServer
	 */
	ODataMetadata.getServiceAnnotations = function (sMetadata) {
		const oMetadata = new ODataMetadata(undefined, {metadata : sMetadata});
		const oXMLDoc = new DOMParser().parseFromString(sMetadata, 'application/xml');
		return AnnotationParser.parse(oMetadata, oXMLDoc);
	};

	return ODataMetadata;
});