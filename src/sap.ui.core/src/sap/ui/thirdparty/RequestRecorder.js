/*!
 * ${copyright}
 */

(function(global, factory) {
	"use strict";
	if (typeof define === "function" && define.amd) {
		// AMD
		define(["URI", "sinon"], function(URI, sinon) {
			return factory(URI, sinon);
		});
	} else {
		// Global
		global.RequestRecorder = factory(global.URI, global.sinon);
	}
}(this, function(URI, sinon) {
	"use strict";
	var sModuleName = "RequestRecorder";

	// resolves the given (potentially relative) URL in the same way as the browser would resolve it
	function resolveURL(url) {
		return new URI(url).absoluteTo(new URI(document.baseURI).search("")).toString();
	}

	function _privateObject() { }
	_privateObject.prototype = {

		//used for both modes
		bIsRecording: false,
		bIsPaused: false,
		aEntriesUrlFilter: [],
		aEntriesUrlReplace: [],
		fnCustomGroupNameCallback: null,

		//used for record mode only
		sDefaultFilename: "Record",
		aRequests: [],
		mXhrNativeFunctions: {},
		sFilename: "",
		bIsDownloadDisabled: false,
		bPromptForDownloadFilename: false,

		//used in play mode only
		mHarFileContent: null,
		sDefaultMajorHarVersion: 1,
		sDefaultCustomGroup: "defaultCustomGroup",
		oSinonXhr: null,
		mDelaySettings: null,

		// Set default logging
		oLog: {
			info: function(text) {
				console.info(text);
			},
			debug: function(text) {
				console.debug(text);
			},
			warning: function(text) {
				console.warn(text);
			},
			error: function(text) {
				console.error(text);
			}
		},

		/**
		 * The function delivers a more precise timestamp with more decimal digits.
		 * This timestamp is used for a better determination of the correct request/response order,
		 * especially if requests are asynchronous.
		 *
		 * @returns {number} Timestamp with milliseconds
		 */
		preciseDateNow: function() {
			return window.performance.timing.navigationStart + window.performance.now();
		},

		/**
		 * Tries to load an har file from the given location URL. If no the file could not be loaded, the
		 * function returns null. This is used to determine if the RequestRecorder tries to record instead.
		 *
		 * If a har file is loaded, the major version is validated to match the specifications.
		 *
		 * @param {string} sLocationUrl The full URL with filename und extension.
		 * @returns {object|null} Har file content as JSON or null if no file is found.
		 */
		loadFile: function(sLocationUrl) {
			// Try to request the har file from the given location url
			var mHarFileContent = null;
			var oRequest = new XMLHttpRequest();
			oRequest.open("GET", sLocationUrl, false);
			oRequest.addEventListener("load", function() {
				if (this.status === 200) {
					mHarFileContent = JSON.parse(this.responseText);
				}
			});
			oRequest.send();
			try {
				mHarFileContent = JSON.parse(oRequest.responseText);
			} catch (e) {
				throw new Error("Har file could not be loaded.");
			}

			// Validate version of the har file
			if (mHarFileContent && (!mHarFileContent.log || !mHarFileContent.log.version || parseInt(mHarFileContent.log.version, 10) != this.sDefaultMajorHarVersion)) {
				this.oLog.error(sModuleName + " - Incompatible version. Please provide .har file with version " + this.sDefaultMajorHarVersion + ".x");
			}

			return mHarFileContent;
		},

		/**
		 * Sorts the entries of a har file by response and request order. After the entries are sorted, the function builds
		 * a map of the entries with the assigned custom groups and url groups.
		 *
		 * @param {object} mHarFileContent The loaded map from the har file.
		 * @returns {object} Prepared Har content with sorted entries and all the mappings (URL, Groups).
		 */
		prepareEntries: function(mHarFileContent) {
			var aEntries;
			if (!mHarFileContent.log.entries || !mHarFileContent.log.entries.length) {
				this.oLog.info(sModuleName + " - Empty entries array or the provided har file is empty.");
				aEntries = [];
			} else {
				// Add start and end timestamps to determine the request and response order.
				aEntries = mHarFileContent.log.entries;
				for (var i = 0; i < aEntries.length; i++) {
					aEntries[i]._timestampStarted = new Date(aEntries[i].startedDateTime).getTime();
					aEntries[i]._timestampFinished = aEntries[i]._timestampStarted + aEntries[i].time;
					aEntries[i]._initialOrder = i;
				}

				// Sort by response first, then by request to ensure the correct order.
				this.prepareEntriesOrder(aEntries, "_timestampFinished");
				this.prepareEntriesOrder(aEntries, "_timestampStarted");

				// Build a map with the sorted entries in the correct custom groups and by URL groups.
				mHarFileContent._groupedEntries = {};
				for (var j = 0; j < aEntries.length; j++) {
					this.addEntryToMapping(mHarFileContent, aEntries, j);
				}
			}

			mHarFileContent.log.entries = aEntries;
			return mHarFileContent;
		},

		/**
		 * Sorts the entries by a field, if the timestamp is equal, there is a fallback to the initial order.
		 * This can be possible if async requests are completed at exactly the same time or if the requests are
		 * added manually with the same timestamps (which are created if they are not provided). If this is the case
		 * the initial order is important.
		 *
		 * @param {object} aEntries The Array with har file entries to sort.
		 * @param {string} sFieldToSort Name of the field which is sorted.
		 */
		prepareEntriesOrder: function(aEntries, sFieldToSort) {
			aEntries.sort(function(oAEntry, oBEntry) {
				var iResult = oAEntry[sFieldToSort] - oBEntry[sFieldToSort];
				if (iResult === 0) {
					return oAEntry._initialOrder - oBEntry._initialOrder;
				} else {
					return iResult;
				}
			});
		},

		/**
		 * Adds an entry to the mapping. The order needs to be prepared and considered when adding the entry.
		 * This is used to add each entry from from a provided har file or to add an entry during runtime when play is already started.
		 * The mapping is created at 1st by a custom group, and 2nd the method and the URL (e.g. "GET/somePath/file.js").
		 * The custom group is optional and determined from a provided callback (e.g. It can determine the name of a test or
		 * can pop from an array of names).
		 *
		 * @param {object} mHarFileContent The har file content map.
		 * @param {array} aEntries The entries array. Default location of har files is within mHarFileContent.log.entries.
		 * @param {int} iIndex The index of the entry in the entries array. This is used as the key for the mapping.
		 */
		addEntryToMapping: function(mHarFileContent, aEntries, iIndex) {
			var sUrlGroup = this.createUrlGroup(aEntries[iIndex].request.method, aEntries[iIndex].request.url);
			var customGroupName = aEntries[iIndex]._customGroupName ? aEntries[iIndex]._customGroupName : this.sDefaultCustomGroup;
			if (!mHarFileContent._groupedEntries[customGroupName]) {
				mHarFileContent._groupedEntries[customGroupName] = {};
			}
			if (!mHarFileContent._groupedEntries[customGroupName][sUrlGroup]) {
				mHarFileContent._groupedEntries[customGroupName][sUrlGroup] = [];
			}
			mHarFileContent._groupedEntries[customGroupName][sUrlGroup].push(iIndex);
		},

		/**
		 * Creates the URL group for to map the requested XMLHttpRequests to it's response.
		 *
		 * @param {string} sMethod The http method (e.g. GET, POST...)
		 * @param {string} sUrl The full requested URL.
		 * @returns {string} The created URL group for the mapping.
		 */
		createUrlGroup: function(sMethod, sUrl) {
			var sUrlResourcePart = new URI(sUrl).resource();
			sUrlResourcePart = this.replaceEntriesUrlByRegex(sUrlResourcePart);
			return sMethod + sUrlResourcePart;
		},

		/**
		 * Applies the provided Regex on the URL and replaces the needed parts.
		 *
		 * @param {string} sUrl The URL on which the replaces are applied.
		 * @returns {string} The new URL with the replaced parts.
		 */
		replaceEntriesUrlByRegex: function(sUrl) {
			for (var i = 0; i < this.aEntriesUrlReplace.length; i++) {
				var oEntry = this.aEntriesUrlReplace[i];
				if (oEntry.regex instanceof RegExp && oEntry.value !== undefined) {
					sUrl = sUrl.replace(oEntry.regex, oEntry.value);
				} else {
					this.oLog.warning(sModuleName + " - Invalid regular expression for url replace.");
				}
			}
			return sUrl;
		},

		/**
		 * Prepares the data from an XMLHttpRequest for saving into an har file. All needed data to replay the request
		 * is collected (e.g. time, headers, response, status).
		 *
		 * @param {Object} oXhr The finished XMLHttpRequest, from which the data for the har file is extracted.
		 * @param {number} fStartTimestamp The request start timestamp.
		 * @returns {Object} The prepared entry for the har file.
		 */
		prepareRequestForHar: function(oXhr, fStartTimestamp) {
			var oEntry = {
				startedDateTime: new Date(fStartTimestamp).toISOString(),
				time: this.preciseDateNow() - fStartTimestamp,
				request: {
					headers: oXhr._requestParams.headers,
					url: resolveURL(oXhr._requestParams.url),
					method: oXhr._requestParams.method
				},
				response: {
					status: oXhr.status,
					content: {
						text: oXhr.responseText
					}
				}
			};
			if (oXhr._requestParams.customGroupName) {
				oEntry._customGroupName = oXhr._requestParams.customGroupName;
			}
			oEntry.response.headers = this.transformHeadersFromArrayToObject(oXhr);
			return oEntry;
		},

		/**
		 * Transforms the headers from an XMLHttpRequest to the expected har file format.
		 * The origin format is a string which will be transformed to an object with name and value properties.
		 * E.g. { name: "headername", value: "headervalue" }
		 *
		 * @param {Object} oXhr The XMLHttpRequest with response headers (needs to be sent).
		 * @returns {Array} The result array with the headers as objects.
		 */
		transformHeadersFromArrayToObject: function(oXhr) {
			var aTemp = oXhr.getAllResponseHeaders().split("\r\n");
			var aHeadersObjects = [];
			for (var i = 0; i < aTemp.length; i++) {
				if (aTemp[i]) {
					var aHeaderValues = aTemp[i].split(":");
					aHeadersObjects.push({
						name: aHeaderValues[0].trim(),
						value: aHeaderValues[1].trim()
					});
				}
			}
			return aHeadersObjects;
		},

		/**
		 * Delete the current recordings
		 */
		deleteRecordedEntries: function() {
			this.aRequests = [];
		},

		/**
		 * Transforms and delivers the recorded data for the har file.
		 * If the downloading is not disabled the file will be downloaded automatically or with an optional prompt for a filename.
		 *
		 * @param  {boolean} bDeleteRecordings True if the existing entries should be deleted.
		 * @returns {Object} The recorded har file content
		 */
		getHarContent: function(bDeleteRecordings) {
			// Check for the filename or ask for it (if configured)
			var sFilename = (this.sFilename || this.sDefaultFilename);
			if (this.bPromptForDownloadFilename) {
				sFilename = window.prompt("Enter file name", sFilename + ".har");
			} else {
				sFilename = sFilename + ".har";
			}

			// The content skeleton
			var mHarContent = {
				log: {
					version: "1.2",
					creator: {
						name: "RequestRecorder",
						version: "1.0"
					},
					entries: this.aRequests
				}
			};

			// Check if recorded entries should be cleared.
			if (bDeleteRecordings) {
				this.deleteRecordedEntries();
			}

			// Inject the data into the dom and download it (if configured).
			if (!this.bIsDownloadDisabled) {
				var sString = JSON.stringify(mHarContent, null, 4);
				var a = document.createElement("a");
				document.body.appendChild(a);
				var oBlob = new window.Blob([sString], { type: "octet/stream" });
				var sUrl = window.URL.createObjectURL(oBlob);
				a.href = sUrl;
				a.download = sFilename;
				a.click();
				window.URL.revokeObjectURL(sUrl);
			}
			return mHarContent;
		},

		/**
		 * Calculates the delay on base of the provided settings.
		 * It is possible to configure an offset, a minimum and a maximum delay.
		 *
		 * @param {object} mDelaySettings The settings map.
		 * @param {int} iTime The curreent duration of the request as milliseconds.
		 * @returns {int} The new duration as milliseconds.
		 */
		calculateDelay: function(mDelaySettings, iTime) {
			if (mDelaySettings) {
				if (mDelaySettings.factor !== undefined && typeof mDelaySettings.factor === 'number') {
					iTime *= mDelaySettings.factor;
				}
				if (mDelaySettings.offset !== undefined && typeof mDelaySettings.offset === 'number') {
					iTime += mDelaySettings.offset;
				}
				if (mDelaySettings.max !== undefined && typeof mDelaySettings.max === 'number') {
					iTime = Math.min(mDelaySettings.max, iTime);
				}
				if (mDelaySettings.min !== undefined && typeof mDelaySettings.min === 'number') {
					iTime = Math.max(mDelaySettings.min, iTime);
				}
			}
			return iTime;
		},

		/**
		 * Responds to a given FakeXMLHttpRequest object with an entry from a har file.
		 * If a delay is provided, the time is calculated and the response of async requests will be delayed.
		 * Sync requests can not be deleayed.
		 *
		 * @param {Object} oXhr FakeXMLHttpRequest to respond.
		 * @param {Object} oEntry Entry from the har file.
		 */
		respond: function(oXhr, oEntry) {
			var fnRespond = function() {
				if (oXhr.readyState !== 0) {
					var sResponseText = oEntry.response.content.text;

					// Transform headers to the required format for XMLHttpRequests.
					var oHeaders = {};
					oEntry.response.headers.forEach(function(mHeader) {
						oHeaders[mHeader.name] = mHeader.value;
					});

					// Support for injected callbacks
					if (typeof sResponseText === "function") {
						sResponseText = sResponseText();
					}

					oXhr.respond(
						oEntry.response.status,
						oHeaders,
						sResponseText
					);
				}
			};
			// If the request is async, a possible delay will be applied.
			if (oXhr.async) {
				// Create new browser task with the setTimeout function to make sure that responses of async requests are not delievered too fast.
				setTimeout(function() {
					fnRespond();
				}, this.calculateDelay(this.mDelaySettings, oEntry.time));
			} else {
				fnRespond();
			}
		},

		/**
		 * Checks a URL against an array of regex if its filtered.
		 * If the RequestRecorder is paused, the URL is filtered, too.
		 *
		 * @param {string} sUrl URL to check.
		 * @param {RegExp[]} aEntriesUrlFilter Array of regex filters.
		 * @returns {boolean} If the URL is filterd true is returned.
		 */
		isUrlFiltered: function(sUrl, aEntriesUrlFilter) {
			if (this.bIsPaused) {
				return true;
			}
			var that = this;
			return aEntriesUrlFilter.every(function(regex) {
				if (regex instanceof RegExp) {
					return !regex.test(sUrl);
				} else {
					that.oLog.error(sModuleName + " - Invalid regular expression for filter.");
					return true;
				}
			});
		},

		/**
		 * Initilizes the RequestRecorder with the provided options, otherwise all default options will be set.
		 * This method is used to init and also to RESET the needed paramters before replay and recording.
		 *
		 * It restores sinon and the native XHR functions which are overwritten during the recording.
		 *
		 * @param {object} mOptions The options parameter from the public API (start, play, record).
		 */
		init: function(mOptions) {
			mOptions = mOptions || {};
			if (typeof mOptions !== "object") {
				throw new Error("Parameter object isn't a valid object");
			}

			// Reset all parameters to default
			this.mHarFileContent = null;
			this.aRequests = [];
			this.sFilename = "";
			this.bIsRecording = false;
			this.bIsPaused = false;
			this.bIsDownloadDisabled = false;
			if (this.oSinonXhr) {
				this.oSinonXhr.filters = this.aSinonFilters;
				this.aSinonFilters = [];
				this.oSinonXhr.restore();
				this.oSinonXhr = null;
			}

			// Restore native XHR functions if they were overwritten.
			for (var sFunctionName in this.mXhrNativeFunctions) {
				if (this.mXhrNativeFunctions.hasOwnProperty(sFunctionName)) {
					window.XMLHttpRequest.prototype[sFunctionName] = this.mXhrNativeFunctions[sFunctionName];
				}
			}
			this.mXhrNativeFunctions = {};

			// Set options to provided values or to default
			this.bIsDownloadDisabled = mOptions.disableDownload === true;
			this.bPromptForDownloadFilename = mOptions.promptForDownloadFilename === true;

			if (mOptions.delay) {
				if (mOptions.delay === true) {
					this.mDelaySettings = {}; // Use delay of recording
				} else {
					this.mDelaySettings = mOptions.delay;
				}
			} else {
				this.mDelaySettings = { max: 0 }; // default: no delay
			}
			if (mOptions.entriesUrlFilter) {
				if (Array.isArray(mOptions.entriesUrlFilter)) {
					this.aEntriesUrlFilter = mOptions.entriesUrlFilter;
				} else {
					this.aEntriesUrlFilter = [mOptions.entriesUrlFilter];
				}
			} else {
				this.aEntriesUrlFilter = [new RegExp(".*")]; // default: no filtering
			}
			if (mOptions.entriesUrlReplace) {
				if (Array.isArray(mOptions.entriesUrlReplace)) {
					this.aEntriesUrlReplace = mOptions.entriesUrlReplace;
				} else {
					this.aEntriesUrlReplace = [mOptions.entriesUrlReplace];
				}
			} else {
				this.aEntriesUrlReplace = [];
			}

			if (mOptions.customGroupNameCallback && typeof mOptions.customGroupNameCallback === "function") {
				this.fnCustomGroupNameCallback = mOptions.customGroupNameCallback;
			} else {
				this.fnCustomGroupNameCallback = function() { return false; }; // default: Empty Callback function used
			}
		},

		/**
		 * Checks if the player is started.
		 * If FakeXMLHttprequest from sinon is enabled from the RequestRecorder, it should be in play mode.
		 *
		 * @returns {boolean} True if the replay is started.
		 */
		isPlayStarted: function() {
			return !!this.oSinonXhr;
		},

		/**
		 * Checks if the recorder is started.
		 *
		 * @returns {boolean} True if recording is started.
		 */
		isRecordStarted: function() {
			return this.bIsRecording;
		}
	};

	/**
	 * Instance of the RequestRecorder's private part.
	 *
	 * @type {object} The private functions.
	 * @private
	 */
	var _private = new _privateObject();

	/**
	 * Instance of the RequestRecorder's public part (API).
	 *
	 * @type {object}
	 */
	var RequestRecorder = {
		/**
		 * Start with existing locationUrl or inline entries results in a playback. If the file does not exist, XMLHttpRequests are not faked and the recording starts.
		 *
		 * @param {string|Array} locationUrl Specifies from which location the file is loaded. If it is not found, the recording is started. The provided filename is the name of the output har file.
		 * 		This parameter can be the entries array for overloading the function.
		 * @param {object} [options] Contains optional parameters to config the RequestRecorder:
		 *        {boolean|object} [options.delay] If a the parameter is equals true, the recorded delay timings are used, instead of the default delay equals zero. If a map as parameter is used, the delay is calculated with the delaysettings in the object. Possible settings are max, min, offset, factor.
		 *        {function} [options.customGroupNameCallback] A callback is used to determine the custom groupname of the current XMLHttpRequest. If the callback returns a falsy value, the default groupname is used.
		 *        {boolean} [options.disableDownload] Set this flag to true if you don´t want to download the recording after the recording is finished. This parameter is only used for testing purposes.
		 *        {boolean} [options.promptForDownloadFilename] Activates a prompt popup after stop is called to enter a desired filename.
		 *        {array|RegExp} [options.entriesUrlFilter] A list of regular expressions, if it matches the URL the request-entry is filtered.
		 *        array|object} [options.entriesUrlReplace] A list of objects with regex and value to replace. E.g.: "{ regex: new RegExp("RegexToSearchForInUrl"), "value": "newValueString" }"
		 */
		start: function(locationUrl, options) {
			try {
				// Try to start play-mode
				this.play(locationUrl, options);
			} catch (e) {
				// If play-mode could not be started, try to record instead.
				var oUri = new URI(locationUrl);
				var sExtension = oUri.suffix();
				// Check if the provided URL is a har file, maybe the wrong url is provided
				if (sExtension != "har") {
					_private.oLog.warning(sModuleName + " - Invalid file extension: " + sExtension + ", please use '.har' files.");
				}
				this.record(oUri.filename().replace("." + sExtension, ""), options);
			}
		},

		/**
		 * Start recording with a desired filename and the required options.
		 *
		 * @param {string|object} filename The name of the har file to be recorded.
		 * @param {object} [options] Contains optional parameters to config the RequestRecorder:
		 *        {function} [options.customGroupNameCallback] A callback is used to determine the custom groupname of the current XMLHttpRequest. If the callback returns a falsy value, the default groupname is used.
		 *        boolean} [options.disableDownload] Set this flag to true if you don´t want to download the recording after the recording is finished. This parameter is only used for testing purposes.
		 *        {boolean} [options.promptForDownloadFilename] Activates a prompt popup after stop is called to enter a desired filename.
		 *        {array|RegExp} [options.entriesUrlFilter] A list of regular expressions, if it matches the URL the request-entry is filtered.
		 */
		record: function(filename, options) {
			_private.oLog.info(sModuleName + " - Record");
			if (window.XMLHttpRequest.name === 'FakeXMLHttpRequest') {
				_private.oLog.warning(sModuleName + " - Sinon FakeXMLHttpRequest is enabled by another application, recording could be defective");
			}
			if (_private.isRecordStarted()) {
				_private.oLog.error(sModuleName + " - RequestRecorder is already recording, please stop first...");
				return;
			}
			_private.init(options);

			_private.sFilename = filename;
			_private.bIsRecording = true;

			// Overwrite the open method to get the required request parameters (method, URL, headers) and assign
			// a group name if provided.
			_private.mXhrNativeFunctions.open = window.XMLHttpRequest.prototype.open;
			window.XMLHttpRequest.prototype.open = function() {
				this._requestParams = this._requestParams || {};
				this._requestParams.method = arguments[0];
				this._requestParams.url = arguments[1];
				this._requestParams.customGroupName = _private.fnCustomGroupNameCallback();
				this._requestParams.headers = this._requestParams.headers || [];
				_private.mXhrNativeFunctions.open.apply(this, arguments);
			};

			// Overwrite the setRequestHeader method to record the request headers.
			_private.mXhrNativeFunctions.setRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;
			window.XMLHttpRequest.prototype.setRequestHeader = function(sHeaderName, sHeaderValue) {
				this._requestParams = this._requestParams || { headers: [] };
				this._requestParams.headers.push({
					name: sHeaderName,
					value: sHeaderValue
				});
				_private.mXhrNativeFunctions.setRequestHeader.apply(this, arguments);
			};

			// Overwrite the send method to get the response and the collected data from the XMLHttpRequest
			_private.mXhrNativeFunctions.send = window.XMLHttpRequest.prototype.send;
			window.XMLHttpRequest.prototype.send = function() {
				if (!_private.isUrlFiltered(this._requestParams.url, _private.aEntriesUrlFilter)) {
					var fTimestamp = _private.preciseDateNow();

					// If the onreadystatechange is already specified by another application, it is called, too.
					var fnOldStateChanged = this.onreadystatechange;
					this.onreadystatechange = function() {
						if (this.readyState === 4) {
							_private.aRequests.push(_private.prepareRequestForHar(this, fTimestamp));
							_private.oLog.info(
								sModuleName + " - Record XMLHttpRequest. Method: " + this._requestParams.method + ", URL: " + this._requestParams.url
							);
						}
						if (fnOldStateChanged) {
							fnOldStateChanged.apply(this, arguments);
						}
					};
				}
				_private.mXhrNativeFunctions.send.apply(this, arguments);
			};
		},

		/**
		 * Start replay with a complete URL to the har file or with an entries array and the required options.
		 *
		 * @param {string|Array} locationUrlOrEntriesArray Specifies from which location the file is loaded. This parameter is overloaded and can also be an entries array.
		 * @param {object} [options] Contains optional parameters to config the RequestRecorder:
		 *        {boolean|object} [options.delay] If a the parameter is equals true, the recorded delay timings are used, instead of the default delay equals zero. If a map as parameter is used, the delay is calculated with the delaysettings in the object. Possible settings are max, min, offset, factor.
		 *        {function} [options.customGroupNameCallback] A callback is used to determine the custom group name of the current XMLHttpRequest. If the callback returns a falsy value, the default group name is used.
		 *        {array|RegExp} [options.entriesUrlFilter] A list of regular expressions, if it matches the URL the request-entry is filtered.
		 *        {array|object} [options.entriesUrlReplace] A list of objects with regex and value to replace. E.g.: "{ regex: new RegExp("RegexToSearchForInUrl"), "value": "newValueString" }"
		 */
		play: function(locationUrlOrEntriesArray, options) {
			_private.oLog.info(sModuleName + " - Play");
			if (_private.isPlayStarted()) {
				_private.oLog.error(sModuleName + " - RequestRecorder is already playing, please stop first...");
				return;
			}
			_private.init(options);
			var sLocationUrl;

			// Check if locationUrl parameter is entries array
			// Decide if entries are provided or if a file needs to be loaded.
			if (locationUrlOrEntriesArray && Array.isArray(locationUrlOrEntriesArray)) {
				_private.mHarFileContent = {};
				_private.mHarFileContent.log = { "entries": locationUrlOrEntriesArray.slice(0) };
				sLocationUrl = "";
			} else {
				sLocationUrl = locationUrlOrEntriesArray;
				_private.mHarFileContent = _private.loadFile(sLocationUrl);
			}

			// Provided entries or har file entries must be prepared for usage with the RequestRecorder.
			if (_private.mHarFileContent) {
				_private.mHarFileContent = _private.prepareEntries(_private.mHarFileContent);
				_private.oLog.info(sModuleName + " - Har file found, replay started (" + sLocationUrl + ")");
				// If entries are found, start the player
				_private.oSinonXhr = sinon.useFakeXMLHttpRequest();
				_private.oSinonXhr.useFilters = true;
				// Wrapping of Sinon filters, because also sap.ui.core.util.MockServer also use the same sinon instance
				_private.aSinonFilters = _private.oSinonXhr.filters;
				_private.oSinonXhr.filters = [];

				_private.oSinonXhr.addFilter(function(sMethod, sUrl, bAsync, sUsername, sPassword) {
					if (!_private.isUrlFiltered(sUrl, _private.aEntriesUrlFilter)) {
						return false;
					}
					for (var i = 0; i < _private.aSinonFilters.length; i++) {
						if (_private.aSinonFilters[i](sMethod, sUrl, bAsync, sUsername, sPassword) === false) {
							_private.oLog.debug(sModuleName + " - Foreign URL filter from sinon filters are applied.");
							return false;
						}
					}
					return true;
				});
				var fnOnCreate = _private.oSinonXhr.onCreate;
				_private.oSinonXhr.onCreate = function(oXhr) {
					var fnXhrSend = oXhr.send;
					oXhr.send = function() {
						if (!_private.isUrlFiltered(oXhr.url, _private.aEntriesUrlFilter)) {
							var oEntry;
							var mCustomGroup;

							// Get next entry
							var sUrl = resolveURL(oXhr.url);
							sUrl = _private.replaceEntriesUrlByRegex(sUrl);
							var sUrlGroup = oXhr.method + sUrl;

							var customGroupName = _private.fnCustomGroupNameCallback();
							if (!customGroupName) {
								customGroupName = _private.sDefaultCustomGroup;
							}
							if (!_private.mHarFileContent._groupedEntries[customGroupName]) {
								throw new Error("Custom group name does not exist: " + customGroupName);
							}

							mCustomGroup = _private.mHarFileContent._groupedEntries[customGroupName];
							if (!mCustomGroup[sUrlGroup]) {
								throw new Error("URL does not exist: " + sUrlGroup);
							}

							if (!mCustomGroup[sUrlGroup].length) {
								throw new Error("No more entries left for: " + sUrlGroup);
							}

							oEntry = _private.mHarFileContent.log.entries[mCustomGroup[sUrlGroup].shift()];
							_private.oLog.info(sModuleName + " - Respond XMLHttpRequest. Method: " + oXhr.method + ", URL: " + sUrl);

							_private.respond(oXhr, oEntry);
						} else {
							fnXhrSend.apply(this, arguments);
						}
					};
					// sinon onCreate call. MockServer use the onCreate hook to the onSend to the xhr.
					if (fnOnCreate) {
						fnOnCreate.apply(this, arguments);
					}
				};
			}
		},

		/**
		 * Stops the recording or the player.
		 * If downloading is not disabled, the har file is downloaded automatically.
		 *
		 * @returns {Object|null} In record mode the har file is returned as json, otherwise null is returned.
		 */
		stop: function() {
			_private.oLog.info(sModuleName + " - Stop");
			var mHarContent = null;
			if (_private.isRecordStarted()) {
				mHarContent = _private.getHarContent(true);
			}

			// do this for a full cleanup
			_private.init();

			return mHarContent;
		},

		/**
		 * Pause the replay or recording.
		 * Can be used to exclude XMLHttpRequests.
		 */
		pause: function() {
			_private.oLog.info(sModuleName + " - Pause");
			_private.bIsPaused = true;
		},

		/**
		 * Continues the replay or recording.
		 */
		resume: function() {
			_private.oLog.info(sModuleName + " - Resume");
			_private.bIsPaused = false;
		},

		/**
		 * Delivers the current recordings in HAR format during record mode and the recording is not aborted.
		 * Requests which are not completed with readyState 4 are not included.
		 *
		 * @param {boolean} [deleteRecordings] True if the recordings should be deleted.
		 * @returns {Object} The har file as json.
		 */
		getRecordings: function(deleteRecordings) {
			var bDeleteRecordings = deleteRecordings || false;
			_private.oLog.info(sModuleName + " - Get Recordings");
			return _private.getHarContent(bDeleteRecordings);
		},

		/**
		 * Adds a JSON encoded response for a request with the provided URL.
		 *
		 * @param {string} url The requested URL.
		 * @param {string|function} response The returned response as string or callback.
		 * @param {string} [method] The HTTP method (e.g. GET, POST), default is GET.
		 * @param {int} [status] The desired status, default is 200.
		 * @param {array} [headers] The response Headers, the Content-Type for JSON is already set for this method.
		 */
		addResponseJson: function(url, response, method, status, headers) {
			var aHeaders = headers || [];
			aHeaders.push({
				"name": "Content-Type",
				"value": "application/json;charset=utf-8"
			});
			this.addResponse(url, response, method, status, aHeaders);
		},

		/**
		 * Adds a response for a request with the provided URL.
		 *
		 * @param {string} url The requested URL.
		 * @param {string|function} response The returned response as string or callback.
		 * @param {string} [method] The HTTP method (e.g. GET, POST), default is GET.
		 * @param {int} [status] The desired status, default is 200.
		 * @param {array} [headers] The response Headers, default is text/plain.
		 */
		addResponse: function(url, response, method, status, headers) {
			if (!_private.isPlayStarted()) {
				throw new Error("Start the player first before you add a response.");
			}
			var sMethod = method || "GET";
			var aHeaders = headers || [{
				"name": "Content-Type",
				"value": "text/plain;charset=utf-8"
			}];
			var iStatus = status || 200;
			var oEntry = {
				"startedDateTime": new Date().toISOString(),
				"time": 0,
				"request": {
					"headers": [],
					"url": url,
					"method": sMethod
				},
				"response": {
					"status": iStatus,
					"content": {
						"text": response
					},
					"headers": aHeaders
				}
			};
			var iIndex = _private.mHarFileContent.log.entries.push(oEntry) - 1;
			_private.addEntryToMapping(_private.mHarFileContent, _private.mHarFileContent.log.entries, iIndex);
		},

		/**
		 * Sets a custom logger for the log messages of the RequestRecorder.
		 * The logger objects needs to implement the following functions: info, debug, warning, error
		 *
		 * @param {object} logger The log object with the required functions.
		 */
		setLogger: function(logger) {
			if (typeof logger != "object"
				|| typeof logger.info != "function"
				|| typeof logger.debug != "function"
				|| typeof logger.warning != "function"
				|| typeof logger.error != "function"
			) {
				throw new Error("Logger is not valid. It should implement at least the functions: info, debug, warning, error.");
			}
			_private.oLog = logger;
		}
	};
	return RequestRecorder;
}));