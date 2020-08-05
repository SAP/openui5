/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.v2.ODataAnnotations
sap.ui.define([
	'sap/ui/model/odata/AnnotationParser',
	'sap/ui/Device',
	'sap/ui/base/EventProvider',
	'sap/ui/core/cache/CacheManager',
	"sap/base/assert",
	"sap/ui/thirdparty/jquery"
],
	function(AnnotationParser, Device, EventProvider, CacheManager, assert, jQuery) {
	"use strict";

	///////////////////////////////////////////////// Class Definition /////////////////////////////////////////////////

	/**
	 * Creates a new instance of the ODataAnnotations annotation loader.
	 *
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata
	 *   Metadata object with the metadata information needed to parse the annotations
	 * @param {object} mOptions Obligatory options
	 * @param {string|map|string[]|map[]} mOptions.source
	 *   One or several annotation sources; see {@link #addSource} for more details
	 * @param {Object<string,string>} mOptions.headers A map of headers to be sent with every request;
	 *   see {@link #setHeaders} for more details
	 * @param {boolean} mOptions.skipMetadata Whether the metadata document will not be parsed for
	 *   annotations
	 * @param {string} [mOptions.cacheKey] A valid cache key
	 * @public
	 *
	 * @class Annotation loader for OData V2 services
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.37.0
	 * @alias sap.ui.model.odata.v2.ODataAnnotations
	 * @extends sap.ui.base.EventProvider
	 */
	var ODataAnnotations = EventProvider.extend("sap.ui.model.odata.v2.ODataAnnotations", /** @lends sap.ui.model.odata.v2.ODataAnnotations.prototype */ {

		constructor : function(oMetadata, mOptions) {
			var that = this;
			// Allow event subscription in constructor options
			EventProvider.apply(this, [ mOptions ]);
			this._oMetadata = oMetadata;
			// The promise to have (loaded,) parsed and merged the previously added source.
			// This promise should never reject; to assign another promise "pPromise" use
			// alwaysResolve(pPromise)
			this._pLoaded = oMetadata.loaded();
			this._mCustomHeaders = {};
			this._mAnnotations = {};
			this._hasErrors = false;

			function writeCache(aResults) {
				// write annotations to cache if no errors occurred
				if (!that._hasErrors) {
					CacheManager.set(that.sCacheKey, JSON.stringify(aResults));
				}
			}

			if (!mOptions || !mOptions.skipMetadata) {
				if (!mOptions) {
					mOptions = {};
				}

				if (!mOptions.source) {
					mOptions.source = [];
				} else if (Array.isArray(mOptions.source)) {
					mOptions.source = mOptions.source.slice(0);
				} else {
					mOptions.source = [ mOptions.source ];
				}

				mOptions.source.unshift({
					type: "xml",
					data: oMetadata.loaded().then(function(mParams) {
						return {
							xml: mParams["metadataString"],
							lastModified: mParams["lastModified"],
							eTag: mParams["eTag"]
						};
					})
				});
			}
			if (mOptions) {
				this.sCacheKey = mOptions.cacheKey;
				this.setHeaders(mOptions.headers);
				if (this.sCacheKey) {
					//check cache
					this._pLoaded = CacheManager.get(that.sCacheKey)
						.then(function(sAnnotations){
							var aResults;
							if (sAnnotations) {
								aResults = JSON.parse(sAnnotations);
							}
							//old cache entries are an object; invalidate the cache in this case
							if (Array.isArray(aResults)) {
								// restore return array structure
								aResults.annotations = {};
								aResults.forEach(function(oAnnotation) {
									AnnotationParser.restoreAnnotationsAtArrays(oAnnotation.annotations);
									AnnotationParser.merge(aResults.annotations, oAnnotation.annotations);
								});
								that._mAnnotations = aResults.annotations;
								// only valid loading was cached - fire loaded event in this case
								that._fireSomeLoaded(aResults);
								that._fireLoaded(aResults);
								return aResults;
							} else {
								return that.addSource(mOptions.source)
									.then(function(aResults) {
										writeCache(aResults);
										return aResults;
									});
							}
						});
				} else {
					this._pLoaded = this.addSource(mOptions.source);
				}
			}
		},
		metadata : {
			publicMethods : [
				"getData", "addSource", "getHeaders", "setHeaders",
				"attachSuccess", "detachSuccess", "attachError", "detachError",
				"attachLoaded", "detachLoaded", "attachFailed", "detachFailed"
			]
		}
	});


	////////////////////////////////////////////////// Public Methods //////////////////////////////////////////////////

	/**
	 * Returns the parsed and merged annotation data object.
	 *
	 * @public
	 * @returns {object} The annotation data
	 */
	ODataAnnotations.prototype.getData = function() {
		return this._mAnnotations;
	};

	/**
	 * Returns the parsed and merged annotation data object.
	 *
	 * @public
	 * @returns {object} The annotation data
	 * @deprecated As of version 1.37.0, only kept for compatibility with V1 API, use {@link #getData} instead.
	 */
	ODataAnnotations.prototype.getAnnotationsData = function() {
		return this._mAnnotations;
	};

	/**
	 * Returns a map of custom headers that are sent with every request to an annotation URL.
	 * @public
	 * @returns {Object<string,string>} A map of all custom headers.
	 */
	ODataAnnotations.prototype.getHeaders = function() {
		return jQuery.extend({}, this._mCustomHeaders);
	};

	/**
	 * Set custom headers which are provided in a key/value map. These headers are used for all requests.
	 * The "Accept-Language" header cannot be modified and is set using the core's language setting.
	 *
	 * To remove these headers, simply set the <code>mHeaders</code> parameter to <code>{}</code>. Note that when calling this method
	 * again, all previous custom headers are removed, unless they are specified again in the <code>mCustomHeaders</code> parameter.
	 *
	 * @param {Object<string,string>} mHeaders the header name/value map.
	 * @public
	 */
	ODataAnnotations.prototype.setHeaders = function(mHeaders) {
		// Copy headers (don't use reference to mHeaders map)
		this._mCustomHeaders = jQuery.extend({}, mHeaders);
	};

	/**
	 * Returns a promise that resolves when the added annotation sources were successfully
	 * processed.
	 *
	 * @returns {Promise} A promise that resolves after the last added sources have been processed
	 * @public
	 */
	ODataAnnotations.prototype.loaded = function() {
		return this._pLoaded;
	};

	/**
	 * An annotation source, containing either a URL to be loaded or an XML string to be parsed.
	 *
	 * @typedef {object} sap.ui.model.odata.v2.ODataAnnotations.Source
	 * @property {string} type The source type. Either "url" or "xml".
	 * @property {string|Promise} data The data or a Promise that resolves with the data.
	 *           In case the type is set to "url" the data must be a URL, in case it is set to "xml" the data must be
	 *           an XML string.
	 * @property {string} [xml] (Set internally, available in event-callback) The XML string of the annotation source
	 * @property {Document} [document] (Set internally, available in event-callback) The parsed XML document of the annotation source
	 * @property {Object} [annotations] (Set internally, available in event-callback) The parsed Annotations object of the annotation source
	 * @public
	 */

	/**
	 * Adds one or several sources to the annotation loader. Sources will be loaded instantly but merged only after
	 * the previously added source has either been successfully merged or failed.
	 *
	 * @param {string|string[]|sap.ui.model.odata.v2.ODataAnnotations.Source|sap.ui.model.odata.v2.ODataAnnotations.Source[]} vSource One or several
	 *   Annotation source or array of annotation sources; an annotation source is either a string
	 *   containing a URL or an object of type
	 *   {@link sap.ui.model.odata.v2.ODataAnnotations.Source}.
	 * @returns {Promise} The promise to (load,) parse and merge the given source(s). The Promise
	 *   resolves with an array of maps containing the properties <code>source</code> and
	 *   <code>data</code>; see the parameters of the <code>success</code> event for more
	 *   details. In case at least one source could not be (loaded,) parsed or merged, the promise
	 *   fails with an array of objects containing Errors and/or Success objects.
	 * @public
	 */
	ODataAnnotations.prototype.addSource = function(vSource) {
		if (!vSource || Array.isArray(vSource) && vSource.length === 0) {
			//For compatibility
			return this._oMetadata.loaded();
		}

		if (!Array.isArray(vSource)) {
			vSource = [ vSource ];
		}

		var that = this;

		// Make sure aSources contains source objects not simple URL strings and create merge Promise array
		var aMergePromises = vSource.map(function(vAnnotationSource) {
			vAnnotationSource = (typeof vAnnotationSource === "string")
				? { type: "url", data: vAnnotationSource }
				: vAnnotationSource;

			return that._loadSource(vAnnotationSource)
				.then(that._parseSourceXML)
				.then(that._parseSource.bind(that))
				.catch(function(oError) {
					return oError;
				});
		});

		//merge parsed annotations in correct order
		return Promise.all(aMergePromises)
			.then(function(aAnnotations) {
				return aAnnotations.map(function(oAnnotation) {
					try {
						oAnnotation = that._mergeSource(oAnnotation);
						that._fireSuccess(oAnnotation);
					} catch (oError) {
						that._fireError(oAnnotation);
					}
					return oAnnotation;
				});
			})
			.then(function(aResults) {
				// Add for Promise compatibility with v1 version:
				aResults.annotations = that.getData();
				var aErrors = aResults.filter(function(oResult) {
					return oResult instanceof Error;
				});
				if (aErrors.length > 0) {
					that._hasErrors = true;
					if (aErrors.length !== aResults.length) {
						that._fireSomeLoaded(aResults);
						that._fireFailed(aResults);
					} else {
						that._fireFailed(aResults);
						that._fireAllFailed(aResults);
						return Promise.reject(aResults);
					}
				} else {
					that._fireSomeLoaded(aResults);
					that._fireLoaded(aResults);
				}
				return aResults;
			});
	};


	/////////////////////////////////////////////////// Event Methods //////////////////////////////////////////////////

	/**
	 * Parameters of the <code>success</code> event
	 *
	 * @typedef {object} sap.ui.model.odata.v2.ODataAnnotations.successParameters
	 * @property {sap.ui.model.odata.v2.ODataAnnotations.Source} result The source type. Either "url" or "xml".
	 * @public
	 */

	/**
	 * The <code>success</code> event is fired, whenever a source has been successfully (loaded,) parsed and merged into the
	 * annotation data.
	 *
	 * @name sap.ui.model.v2.ODataAnnotations#success
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.successParameters} oControlEvent.getParameters
	 * @public
	 */

	/**
	 * Attaches the given callback to the {@link #event:success success} event, which is fired whenever a source has been successfully
	 * (loaded,) parsed and merged into the annotation data.
	 *
	 * The following parameters are set on the event object that is given to the callback function:
	 *   <code>source</code> - A map containing the properties <code>type</code> - containing either "url" or "xml" - and <code>data</code> containing
	 *              the data given as source, either a URL or an XML string depending on how the source was added.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.odata.v2.ODataAnnotations</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with, defaults to this
	 *            <code>ODataAnnotations</code> itself
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachSuccess = function(oData, fnFunction, oListener) {
		return this.attachEvent("success", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>success</code> event.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.detachSuccess = function(fnFunction, oListener) {
		return this.detachEvent("success", fnFunction, oListener);
	};

	/**
	 * Parameters of the <code>error</code> event.
	 *
	 * @typedef {object} sap.ui.model.odata.v2.ODataAnnotations.errorParameters
	 * @property {Error} result The error that occurred. Also contains the properties from {@link sap.ui.model.odata.v2.ODataAnnotations.Source}
	 *           that could be filled up to that point
	 * @public
	 */

	/**
	 * The <code>error</code> event is fired, whenever a source cannot be loaded, parsed or merged into the annotation data.
	 *
	 * @name sap.ui.model.v2.ODataAnnotations#error
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.errorParameters} oEvent.getParameters
	 * @public
	 */

	/**
	 * Attaches the given callback to the {@link #event:error error} event, which is fired whenever a source cannot be loaded, parsed or
	 * merged into the annotation data.
	 *
	 * The following parameters will be set on the event object that is given to the callback function:
	 *   <code>source</code> - A map containing the properties <code>type</code> - containing either "url" or "xml" - and <code>data</code> containing
	 *              the data given as source, either a URL or an XML string depending on how the source was added.
	 *   <code>error</code>  - An Error object describing the problem that occurred
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.odata.v2.ODataAnnotations</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with, defaults to this
	 *            <code>ODataAnnotations</code> itself
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachError = function(oData, fnFunction, oListener) {
		return this.attachEvent("error", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>error</code> event.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.detachError = function(fnFunction, oListener) {
		return this.detachEvent("error", fnFunction, oListener);
	};

	/**
	 * Parameters of the <code>loaded</code> event.
	 *
	 * @typedef {object} sap.ui.model.odata.v2.ODataAnnotations.loadedParameters
	 * @property {sap.ui.model.odata.v2.ODataAnnotations.Source[]|Error[]|any} result An array of results and Errors
	 *           (@see sap.ui.model.v2.ODataAnnotations#success and @see sap.ui.model.v2.ODataAnnotations#error) that
	 *           occurred while loading a group of annotations
	 * @public
	 */

	/**
	 * The <code>loaded</code> event is fired, when all annotations from a group of sources have been
	 * (loaded,) parsed and merged successfully.
	 *
	 * @name sap.ui.model.v2.ODataAnnotations#loaded
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.loadedParameters} oEvent.getParameters
	 * @public
	 */

	 /**
	 * Attaches the given callback to the {@link #event:loaded loaded} event.
	 *
	 * This event is fired when all annotations from a group of sources was successfully (loaded,) parsed and merged.
	 * The parameter <code>result</code> will be set on the event argument and contains an array of all loaded sources as well
	 * as Errors in the order in which they had been added.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.odata.v2.ODataAnnotations</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with, defaults to this
	 *            <code>ODataAnnotations</code> itself
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachLoaded = function(oData, fnFunction, oListener) {
		return this.attachEvent("loaded", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>loaded</code> event.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.detachLoaded = function(fnFunction, oListener) {
		return this.detachEvent("loaded", fnFunction, oListener);
	};

	/**
	 * Parameters of the <code>failed</code> event.
	 *
	 * @typedef {object} sap.ui.model.odata.v2.ODataAnnotations.failedParameters
	 * @property {Error[]} result An array of Errors (@see sap.ui.model.v2.ODataAnnotations#error) that occurred while
	 *           loading a group of annotations
	 * @public
	 */

	/**
	 * The <code>failed</code> event is fired when at least one annotation from a group of sources was not
	 * successfully (loaded,) parsed or merged.
	 *
	 * @name sap.ui.model.v2.ODataAnnotations#failed
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.failedParameters} oEvent.getParameters
	 * @public
	 */

	/**
	 * Attaches the given callback to the {@link #event:failed failed} event.
	 *
	 * This event is fired when at least one annotation from a group of sources was not successfully (loaded,) parsed or merged.
	 * The parameter <code>result</code> will be set on the event argument and contains an array of Errors in the order in which
	 * the sources had been added.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.odata.v2.ODataAnnotations</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with, defaults to this
	 *            <code>ODataAnnotations</code> itself
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachFailed = function(oData, fnFunction, oListener) {
		return this.attachEvent("failed", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>failed</code> event.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.detachFailed = function(fnFunction, oListener) {
		return this.detachEvent("failed", fnFunction, oListener);
	};

	/**
	 * Attaches the given callback to the <code>someLoaded</code> event.
	 *
	 * This event exists for compatibility with the old annotation loader. It is fired when at least one annotation
	 * from a group of sources was successfully (loaded,) parsed and merged.
	 * The parameter <code>result</code> will be set on the event argument and contains an array of all loaded
	 * sources as well as Errors in the order in which they had been added.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.odata.v2.ODataAnnotations</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with, defaults to this
	 *            <code>ODataAnnotations</code> itself
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachSomeLoaded = function(oData, fnFunction, oListener) {
		return this.attachEvent("someLoaded", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>someLoaded</code> event.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.detachSomeLoaded = function(fnFunction, oListener) {
		return this.detachEvent("someLoaded", fnFunction, oListener);
	};

	/**
	 * Attaches the given callback to the <code>allFailed</code> event.
	 *
	 * This event exists for compatibility with the old Annotation loader. It is fired when no annotation from a group
	 * of sources was successfully (loaded,) parsed and merged.
	 * The parameter <code>result</code> will be set on the event argument and contains an array of Errors in the order
	 * in which the sources had been added.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.model.odata.v2.ODataAnnotations</code> itself.
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with, defaults to this
	 *            <code>ODataAnnotations</code> itself
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachAllFailed = function(oData, fnFunction, oListener) {
		return this.attachEvent("allFailed", oData, fnFunction, oListener);
	};

	/**
	 * Detaches the given callback from the <code>allFailed</code> event.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function} fnFunction The function to be called, when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.detachAllFailed = function(fnFunction, oListener) {
		return this.detachEvent("allFailed", fnFunction, oListener);
	};


	////////////////////////////////////////////////// Private Methods /////////////////////////////////////////////////

	/**
	 * Fires the <code>success</code> event whenever a source has successfully been (loaded,) parsed and merged into the annotation
	 * data.
	 *
	 * @param {Object} mResult The filled source-map of the successful loading and parsing
	 * @returns {sap.ui.model.odata.v2.ODataAnnotations} Reference to <code>this</code> to allow method chaining
	 * @private
	 */
	ODataAnnotations.prototype._fireSuccess = function(mResult) {
		return this.fireEvent("success", { result: mResult }, false, false);
	};

	/**
	 * Fires the <code>error</code> event whenever a source could not be (loaded,) parsed or merged into the annotation
	 * data.
	 *
	 * @param {Error} oError The error that occurred.
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireError = function(oError) {
		return this.fireEvent("error", { result: oError }, false, false);
	};


	/**
	 * Fires the <code>loaded</code> event with an array of results in the result-parameter of the event.
	 *
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.Source[]} aResults An array of results
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireLoaded = function(aResults) {
		return this.fireEvent("loaded", { result: aResults }, false, false);
	};

	/**
	 * Fires the <code>failed</code> event with an array of results and errors in the result-parameter of the event.
	 *
	 * @param {Error[]} aErrors An array of Errors
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireFailed = function(aErrors) {
		return this.fireEvent("failed", { result: aErrors }, false, false);
	};

	/**
	 * Fires the <code>someLoaded</code> event with an array of results and errors in the result-parameter of the event.
	 *
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.Source[]|Error[]|any} aResults An array of results and Errors
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireSomeLoaded = function(aResults) {
		return this.fireEvent("someLoaded", { result: aResults }, false, false);
	};

	/**
	 * Fires the <code>failed</code> event with an array of errors in the result-parameter of the event.
	 *
	 * @param {Error[]} aErrors An array of Errors
	 * @return {sap.ui.model.odata.v2.ODataAnnotations} Returns <code>this</code> to allow method chaining.
	 * @private
	 */
	ODataAnnotations.prototype._fireAllFailed = function(aErrors) {
		return this.fireEvent("allFailed", { result: aErrors }, false, false);
	};

	/**
	 * Loads a given source (sap.ui.model.odata.v2.ODataAnnotations.Source) if necessary and returns a promise that resolves
	 * if the source could be loaded or no laoding is necessary. In case the source type is neither "xml" nor "url" or
	 * the loading of the source fails, the promise rejects.
	 *
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.Source} mSource The source to be loaded
	 * @returns {Promise} The Promise to load the source if necessary
	 * @private
	 */
	ODataAnnotations.prototype._loadSource = function(mSource) {
		if (mSource.data instanceof Promise) {
			return mSource.data.then(function(oData) {
				delete mSource.data;
				mSource.type = "xml";
				mSource.xml = oData.xml;
				mSource.lastModified = oData.lastModified;
				mSource.eTag = oData.eTag;
				return this._loadSource(mSource);
			}.bind(this));
		} else if (mSource.type === "xml") {
			if (typeof mSource.data === "string") {
				mSource.xml = mSource.data;
				delete mSource.data;
			}
			return Promise.resolve(mSource);
		} else if (mSource.type === "url") {
			return this._loadUrl(mSource);
		} else {
			var oError = new Error("Unknown source type: \"" + mSource.type + "\"");
			oError.source = mSource;
			return Promise.reject(oError);
		}
	};

	/**
	 * Loads a source with the type "url" and returns a promise that resolves if the source was successfully loaded or
	 * rejects in case of failure.
	 *
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.Source} mSource The source of type "url" to be loaded
	 * @returns {Promise} The Promise to load the source
	 * @private
	 */
	ODataAnnotations.prototype._loadUrl = function(mSource) {
		assert(mSource.type === "url", "Source type must be \"url\" in order to be loaded");

		return new Promise(function(fnResolve, fnReject) {
			var mAjaxOptions = {
				url: mSource.data,
				async: true,
				headers: this._getHeaders(),
				beforeSend: function(oXHR) {
					// Force text/plain so the XML parser does not run twice
					oXHR.overrideMimeType("text/plain");
				}
			};

			var fnSuccess = function(sData, sStatusText, oXHR) {
				mSource.xml = oXHR.responseText;

				if (oXHR.getResponseHeader("Last-Modified")) {
					mSource.lastModified = new Date(oXHR.getResponseHeader("Last-Modified"));
				}

				if (oXHR.getResponseHeader("eTag")) {
					mSource.eTag = oXHR.getResponseHeader("eTag");
				}

				fnResolve(mSource);
			};

			var fnFail = function(oXHR, sStatusText) {
				var oError = new Error("Could not load annotation URL: \"" + mSource.data + "\"");
				oError.source = mSource;
				fnReject(oError);
			};

			jQuery.ajax(mAjaxOptions).done(fnSuccess).fail(fnFail);
		}.bind(this));
	};

	/**
	 * Parses a source as XML and returns a promise that resolves when the source's <code>xml</code> property string could be
	 * successfully parsed as an XML document.
	 *
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.Source} mSource The source that should be parsed with its <code>xml</code> property set to a string
	 * @returns {Promise} The Promise to parse the source as XML
	 * @private
	 */
	ODataAnnotations.prototype._parseSourceXML = function(mSource) {
		assert(typeof mSource.xml === "string", "Source must contain XML string in order to be parsed");

		return new Promise(function(fnResolve, fnReject) {
			var oXMLDocument;
			if (Device.browser.msie) {
				// IE is a special case: Even though it supports DOMParser with the latest versions, the resulting
				// document does not support the 'evaluate' method, which leads to a different kind of XPath implementation
				// being used in the AnnotationParser. Thus IE (the MSXML implementation) must always be handled separately.
				oXMLDocument = new window.ActiveXObject("Microsoft.XMLDOM");
				oXMLDocument.preserveWhiteSpace = true;

				// The MSXML implementation does not parse documents with the technically correct "xmlns:xml"-attribute
				// So if a document contains 'xmlns:xml="http://www.w3.org/XML/1998/namespace"', IE will stop working.
				// This hack removes the XML namespace declaration which is then implicitly set to the default one.
				var sXMLContent = mSource.xml;
				if (sXMLContent.indexOf(" xmlns:xml=") > -1) {
					sXMLContent = sXMLContent
						.replace(' xmlns:xml="http://www.w3.org/XML/1998/namespace"', "")
						.replace(" xmlns:xml='http://www.w3.org/XML/1998/namespace'", "");
				}

				oXMLDocument.loadXML(sXMLContent);
			} else if (window.DOMParser) {
				oXMLDocument = new DOMParser().parseFromString(mSource.xml, 'application/xml');
			}

			var oError;
			if (!oXMLDocument) {
				oError = new Error("The browser does not support XML parsing. Annotations are not available.");
				oError.source = mSource;
				fnReject(oError);
			} else if (
				// Check for errors: All browsers including IE
				oXMLDocument.getElementsByTagName("parsererror").length > 0 ||
				// Check for errors: IE 11 special case
				(oXMLDocument.parseError && oXMLDocument.parseError.errorCode !== 0)
			) {
				oError = new Error("There were errors parsing the XML.");
				oError.source = {
					type: mSource.type,
					data: mSource.data,
					xml: mSource.xml,
					document: oXMLDocument
				};
				fnReject(oError);
			} else {
				mSource.document = oXMLDocument;
				fnResolve(mSource);
			}
		});
	};

	/**
	 * Parses a source that has been parsed to an XML document as annotations and returns a promise that resolves when
	 * the source's <code>document</code> property could be successfully parsed as an annotations object.
	 *
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.Source} mSource The source that should be parsed with its <code>document</code> property set to an XML document
	 * @returns {Promise} The Promise to parse the source as an annotations object
	 * @private
	 */
	ODataAnnotations.prototype._parseSource = function(mSource) {
		// On IE we have a special format for the XML documents on every other browser it must be a "Document" object.
		assert(mSource.document instanceof window.Document || Device.browser.msie, "Source must contain a parsed XML document converted to an annotation object");

		return this._oMetadata.loaded()
			.then(function() {
				mSource.annotations
					= AnnotationParser.parse(this._oMetadata, mSource.document, mSource.data);
				//delete document as it is not needed anymore after parsing
				delete mSource.document;
				return mSource;
			}.bind(this));
	};

	/**
	 * Merges the parsed annotation object of the given source into the internal annotations object. The source's
	 * <code>annotations</code> property must contain an annotations object.
	 *
	 * @param {sap.ui.model.odata.v2.ODataAnnotations.Source} mSource The source that should be parsed with its <code>annotations</code> property set to an annotations object
	 * @returns {Promise} The Promise to merge the source's annotations object into the internal annotations object
	 * @private
	 */
	ODataAnnotations.prototype._mergeSource = function(mSource) {
		assert(typeof mSource.annotations === "object", "Source must contain an annotation object to be merged");

		AnnotationParser.merge(this._mAnnotations, mSource.annotations);

		return mSource;
	};

	/**
	 * Returns a map of the public and private headers that are sent with every request to an annotation URL.
	 * @private
	 * @returns {Object<string,string>} A map of all public and private headers.
	 */
	ODataAnnotations.prototype._getHeaders = function() {
		//The 'sap-cancel-on-close' header marks the OData annotation request as cancelable. This helps to save resources at the back-end.
		return jQuery.extend({"sap-cancel-on-close": true}, this.getHeaders(), {
			"Accept-Language": sap.ui.getCore().getConfiguration().getLanguageTag() // Always overwrite
		});
	};

	///////////////////////////////////////////////////// End Class ////////////////////////////////////////////////////

	return ODataAnnotations;

});