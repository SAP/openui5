/*!
 * ${copyright}
 */

sap.ui.define([
	"./HashChangerBase",
	"./RouterHashChanger",
	'sap/ui/thirdparty/hasher',
	"sap/base/Log",
	"sap/base/util/ObjectPath"
], function(HashChangerBase, RouterHashChanger, hasher, Log, ObjectPath) {
	"use strict";

	/**
	 * @class Class for manipulating and receiving changes of the browserhash with the hasher framework.
	 *
	 * Fires a <code>hashChanged</code> event if the browser hash changes.
	 * @extends sap.ui.base.EventProvider
	 *
	 * @public
	 * @alias sap.ui.core.routing.HashChanger
	 */
	var HashChanger = HashChangerBase.extend("sap.ui.core.routing.HashChanger", {

		constructor : function() {
			HashChangerBase.apply(this);
		}

	});

	/**
	 * Will start listening to hashChanges with the parseHash function.
	 * This will also fire a hashchanged event with the initial hash.
	 *
	 * @public
	 * @return {boolean} false if it was initialized before, true if it was initialized the first time
	 */
	HashChanger.prototype.init = function() {
		if (this._initialized) {
			Log.info("this HashChanger instance has already been initialized.");
			return false;
		}

		this._initialized = true;

		hasher.changed.add(this.fireHashChanged, this); //parse hash changes

		if (!hasher.isActive()) {
			hasher.initialized.addOnce(this.fireHashChanged, this); //parse initial hash
			hasher.init(); //start listening for history change
		} else {
			this.fireHashChanged(hasher.getHash());
		}

		return this._initialized;
	};

	/**
	 * Fires the hashchanged event, may be extended to modify the hash before fireing the event
	 * @param {string} sNewHash the new hash of the browser
	 * @param {string} sOldHash - the previous hash
	 * @protected
	 */
	HashChanger.prototype.fireHashChanged = function(sNewHash, sOldHash) {
		this.fireEvent("hashChanged", {
			newHash: sNewHash,
			oldHash: sOldHash
		});
	};

	/**
	 * Creates an instance of {@link sap.ui.core.routing.RouterHashChanger} which is connected with
	 * this HashChanger.
	 *
	 * The HashChanger attaches to the RouterHashChanger's "hashSet" and "hashReplaced" events to
	 * propagate the hash modification from the RouterHashChanger to the browser.
	 *
	 * There's maximum one instance of RouterHashChanger created under a HashChanger.
	 *
	 * @return {sap.ui.core.routing.RouterHashChanger} the created RouterHashChanger
	 * @private
	 */
	HashChanger.prototype.createRouterHashChanger = function() {
		if (!this._oRouterHashChanger) {
			this._oRouterHashChanger = new RouterHashChanger({
				parent: this
			});

			this._registerListenerToRelevantEvents();

			this._oRouterHashChanger.attachEvent("hashSet", this._onHashModified, this);
			this._oRouterHashChanger.attachEvent("hashReplaced", this._onHashModified, this);
		}

		return this._oRouterHashChanger;
	};

	HashChanger.prototype._registerListenerToRelevantEvents = function() {
		if (!this._mEventListeners) {
			this._mEventListeners = {};

			// get all relevant events which should be forwarded to the _oRouterHashChanger
			this.getRelevantEventsInfo().forEach(function(oEventInfo) {
				var sEventName = oEventInfo.name,
					fnListener = this._onHashChangedForRouterHashChanger.bind(this, oEventInfo);

				this._mEventListeners[sEventName] = fnListener;

				this.attachEvent(sEventName, fnListener, this);
			}.bind(this));
		}
	};

	HashChanger.prototype._deregisterListenerFromRelevantEvents = function() {
		if (this._mEventListeners) {
			var aEventNames = Object.keys(this._mEventListeners);

			aEventNames.forEach(function(sEventName) {
				this.detachEvent(sEventName, this._mEventListeners[sEventName], this);
			}.bind(this));

			delete this._mEventListeners;
		}
	};

	HashChanger.prototype._onHashChangedForRouterHashChanger = function(oEventInfo, oEvent) {
		if (this._oRouterHashChanger) {
			var oParamMapping = oEventInfo.paramMapping || {},
				sParamName = oParamMapping["newHash"] || "newHash",
				sNewHash = oEvent.getParameter(sParamName) || "",
				oParsedHash = this._parseHash(sNewHash);

			this._oRouterHashChanger.fireHashChanged(oParsedHash.hash, oParsedHash.subHashMap, !!oEventInfo.updateHashOnly);
		}
	};

	HashChanger.prototype._onHashModified = function(oEvent) {
		var sEventName = oEvent.getId(),
			aHashes = [oEvent.getParameter("hash")],
			aKeys = [oEvent.getParameter("key")],
			aNestedHashInfo = oEvent.getParameter("nestedHashInfo"),
			aDeletePrefix = oEvent.getParameter("deletePrefix") || [];

		if (Array.isArray(aNestedHashInfo)) {
			aNestedHashInfo.forEach(function(oHashInfo) {
				aHashes.push(oHashInfo.hash);
				aKeys.push(oHashInfo.key);

				if (Array.isArray(oHashInfo.deletePrefix)) {
					oHashInfo.deletePrefix.forEach(function(sDeletePrefix) {
						if (aDeletePrefix.indexOf(sDeletePrefix) === -1) {
							aDeletePrefix.push(sDeletePrefix);
						}
					});
				}
			});
		}

		if (sEventName === "hashSet") {
			this._setSubHash(aKeys, aHashes, aDeletePrefix);
		} else {
			this._replaceSubHash(aKeys, aHashes, aDeletePrefix);
		}
	};

	HashChanger.prototype._setSubHash = function(aKeys, aSubHashes, aChildPrefix) {
		// construct the full hash by replacing the part starts with the sKey
		var sHash = this._reconstructHash(aKeys, aSubHashes, aChildPrefix);
		this.setHash(sHash);
	};

	HashChanger.prototype._replaceSubHash = function(aKeys, aSubHashes, aChildPrefix) {
		// construct the full hash by replacing the part starts with the sKey
		var sHash = this._reconstructHash(aKeys, aSubHashes, aChildPrefix);
		this.replaceHash(sHash);
	};

	/**
	 * Reconstructs the hash
	 *
	 * @param {string[]} aKeys The prefixes of the RouterHashChangers which changed their hash during the last navTo call
	 * @param {string[]} aValues The new hashes in the last navTo call
	 * @param {string[]} aDeleteKeys The prefixes of the RouterHashChanger which are navigated away and their hashes will be deleted from the browser hash
	 * @returns {string} The reconstructed hash
	 * @private
	 */
	HashChanger.prototype._reconstructHash = function(aKeys, aValues, aDeleteKeys) {
		var aParts = this.getHash().split("&/"),
			sTopHash = aParts.shift();

		aKeys.forEach(function(sKey, index) {
			// remove sKey from aDeleteKeys because sKey should have a part in the final browser hash
			// when sValue is falsy, the sKey will be inserted into aDeleteKeys later
			if (aDeleteKeys) {
				aDeleteKeys = aDeleteKeys.filter(function(sDeleteKey) {
					return sDeleteKey !== sKey;
				});
			}

			var sValue = aValues[index];
			if (sKey === undefined) {
				// change the top level hash
				// convert all values to string for compatibility reason (for
				// example, undefined is converted to "undefined")
				sTopHash = sValue + "";
			} else {
				var bFound = aParts.some(function(sPart, i, aParts) {
					if (sPart.startsWith(sKey)) {
						if (sValue) {
							// replace the subhash
							aParts[i] =  sKey + "/" + sValue;
						} else {
							// remove the subhash
							aDeleteKeys.push(sKey);
						}
						return true;
					}
				});
				if (!bFound) {
					// the subhash must be added
					aParts.push(sKey + "/" + sValue);
				}
			}

		});

		if (aDeleteKeys && aDeleteKeys.length > 0) {
			// remove dependent subhashes from aDeleteKeys from the hash
			aParts = aParts.filter(function(sPart) {
				return !aDeleteKeys.some(function(sPrefix) {
					return sPart.startsWith(sPrefix);
				});
			});
		}

		aParts.unshift(sTopHash);

		return aParts.join("&/");
	};

	HashChanger.prototype._parseHash = function(sHash) {
		var aParts = sHash.split("&/");

		return {
			hash: aParts.shift(),
			subHashMap: aParts.reduce(function(oMap, sPart) {
				var iSlashPos = sPart.indexOf("/");

				oMap[sPart.substring(0, iSlashPos)] = sPart.substring(iSlashPos + 1);
				return oMap;
			}, {})
		};
	};

	/**
	 * Sets the hash to a certain value. When using this function, a browser history entry is written.
	 * If you do not want to have an entry in the browser history, please use the {@link #replaceHash} function.
	 * @param {string} sHash New hash
	 * @public
	 */
	HashChanger.prototype.setHash = function(sHash) {
		HashChangerBase.prototype.setHash.apply(this, arguments);
		hasher.setHash(sHash);
	};

	/**
	 * Replaces the hash with a certain value. When using the replace function, no browser history entry is written.
	 * If you want to have an entry in the browser history, please use the {@link #setHash} function.
	 * @param {string} sHash New hash
	 * @public
	 */
	HashChanger.prototype.replaceHash = function(sHash) {
		HashChangerBase.prototype.replaceHash.apply(this, arguments);
		hasher.replaceHash(sHash);
	};

	/**
	 * Gets the current hash
	 *
	 * @return {string} the current hash
	 * @public
	 */
	HashChanger.prototype.getHash = function() {
		return hasher.getHash();
	};

	/**
	 * Defines the events and its parameters which should be used for tracking the hash changes
	 *
	 * @return {Object[]} the events info. Each event info object in the array should
	 * contain a name property which describes the event name, and an optional paramMapping object where the parameter
	 * names in the event are defined for the 'newHash', 'oldHash' and 'fullHash'. If any of them isn't defined in the
	 * mapping, the same name is used to get the property value from the event object. Every object can also define a
	 * "updateHashOnly" option with boolean value to indicate whether the event is only relevant for the
	 * RouterHashChanger instances which are going to be created and the event shouldn't be forwarded to the existing
	 * RouterHashChanger instances. If this option is set to true, the new hash is saved RouterHashChanger instances but
	 * no "hashChanged" event is fired on any existing RouterHashChanger instance.
	 * @protected
	 */
	HashChanger.prototype.getRelevantEventsInfo = function() {
		return [
			{
				name: "hashChanged",
				paramMapping: {
					fullHash: "newHash"
				}
			}
		];
	};
	/**
	 * Cleans the event registration
	 * @see sap.ui.base.Object.prototype.destroy
	 * @protected
	 */
	HashChanger.prototype.destroy = function() {
		if (this._oRouterHashChanger) {
			this._deregisterListenerFromRelevantEvents();
			this._oRouterHashChanger.destroy();
			this._oRouterHashChanger = undefined;
		}

		delete this._initialized;
		hasher.changed.remove(this.fireHashChanged, this);
		HashChangerBase.prototype.destroy.apply(this, arguments);
	};

	HashChanger.prototype.deregisterRouterHashChanger = function() {
		// detach the hashChanged event handler for the RouterHashChanger instance
		this._deregisterListenerFromRelevantEvents();
		delete this._oRouterHashChanger;
	};

	(function() {

		var _oHashChanger = null;

		/**
		 * Gets a global singleton of the HashChanger. The singleton will get created when this function is invoked for the first time.
		 * @public
		 * @return {sap.ui.core.routing.HashChanger} The global HashChanger
		 * @static
		 */
		HashChanger.getInstance = function() {
			if (!_oHashChanger) {
				_oHashChanger = new HashChanger();
			}
			return _oHashChanger;
		};

		function extendHashChangerEvents (oHashChanger) {
			var sEventName,
				aExistingEventListeners,
				aNewEventListeners;

			for (sEventName in _oHashChanger.mEventRegistry) {
				// only modify the new event registry if the old one contains the entry
				if (_oHashChanger.mEventRegistry.hasOwnProperty(sEventName)) {

					aExistingEventListeners = _oHashChanger.mEventRegistry[sEventName];
					aNewEventListeners = oHashChanger.mEventRegistry[sEventName];

					if (aNewEventListeners) {
						// Both instances have the same event: merge the arrays
						oHashChanger.mEventRegistry[sEventName] = aExistingEventListeners.concat(aNewEventListeners);
					} else {
						// Only the previous hashchanger has the event - add it to the new hashCHanger
						oHashChanger.mEventRegistry[sEventName] = aExistingEventListeners;
					}
				}
			}
		}

		/**
		 * Sets the hashChanger to a new instance, destroys the old one and copies all its event listeners to the new one
		 * @param {sap.ui.core.routing.HashChanger} oHashChanger the new instance for the global singleton
		 * @protected
		 */
		HashChanger.replaceHashChanger = function(oHashChanger) {
			if (_oHashChanger && oHashChanger) {
				var fnGetHistoryInstance = ObjectPath.get("sap.ui.core.routing.History.getInstance"),
					oHistory;

				// replace the hash changer on oHistory should occur before the replacement on router hash changer
				// because the history direction should be determined before a router processes the hash.
				if (fnGetHistoryInstance) {
					oHistory = fnGetHistoryInstance();
					// set the new hash changer to oHistory. This will also deregister the listeners from the old hash
					// changer.
					oHistory._setHashChanger(oHashChanger);
				}

				if (_oHashChanger._oRouterHashChanger) {
					_oHashChanger._oRouterHashChanger.detachEvent("hashSet", _oHashChanger._onHashModified, _oHashChanger);
					_oHashChanger._oRouterHashChanger.detachEvent("hashReplaced", _oHashChanger._onHashModified, _oHashChanger);
					_oHashChanger._deregisterListenerFromRelevantEvents();

					oHashChanger._oRouterHashChanger = _oHashChanger._oRouterHashChanger;
					oHashChanger._oRouterHashChanger.parent = oHashChanger;
					delete _oHashChanger._oRouterHashChanger;

					oHashChanger._oRouterHashChanger.attachEvent("hashSet", oHashChanger._onHashModified, oHashChanger);
					oHashChanger._oRouterHashChanger.attachEvent("hashReplaced", oHashChanger._onHashModified, oHashChanger);
					oHashChanger._registerListenerToRelevantEvents();
				}

				extendHashChangerEvents(oHashChanger);
				_oHashChanger.destroy();
			}

			_oHashChanger = oHashChanger;
		};

	}());

	return HashChanger;

});
