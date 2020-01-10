/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/library',
	'./HashChanger',
	"sap/base/Log",
	"sap/ui/thirdparty/URI",
	"sap/ui/Device",
	"sap/base/util/ObjectPath"
], function(library, HashChanger, Log, URI, Device, ObjectPath) {
	"use strict";

	// shortcut for enum(s)
	var HistoryDirection = library.routing.HistoryDirection;


	/**
	 * Used to determine the {@link sap.ui.core.routing.HistoryDirection} of the current or a future navigation,
	 * done with a {@link sap.ui.core.routing.Router} or {@link sap.ui.core.routing.HashChanger}.
	 *
	 * <strong>ATTENTION:</strong> this class will not be accurate if someone does hash-replacement without the named classes above.
	 * If you are manipulating the hash directly, this class is not supported anymore.
	 *
	 * @param {sap.ui.core.routing.HashChanger} oHashChanger required, without a HashChanger this class cannot work. The class needs to be aware of the hash-changes.
	 * @public
	 * @class
	 * @alias sap.ui.core.routing.History
	 */
	var History = function(oHashChanger) {
		this._iHistoryLength = window.history.length;
		this.aHistory = [];
		this._bIsInitial = true;

		if (!Device.browser.msie) { // the state information isn't used for IE
			// because it doesn't clear the state after new hash is set
			var oState = window.history.state === null ? {} : window.history.state,
				sHash = window.location.hash;

			// remove the leading '#'
			sHash = sHash.replace(/^#/, "");

			if (typeof oState === "object") {
				History._aStateHistory.push(sHash);
				oState.sap = {};
				oState.sap.history = History._aStateHistory;
				window.history.replaceState(oState, window.document.title);
			} else {
				Log.debug("Unable to determine HistoryDirection as history.state is already set: " + window.history.state, "sap.ui.core.routing.History");
			}
		}

		if (!oHashChanger) {
			Log.error("sap.ui.core.routing.History constructor was called and it did not get a hashChanger as parameter");
		}

		this._setHashChanger(oHashChanger);

		this._reset();
	};

	/**
	 * Stores the history of full hashes to compare with window.history.state
	 * @private
	 */
	History._aStateHistory = [];

	/**
	 * Returns the length difference between the history state stored in browser's
	 * pushState and the state maintained in this class.
	 *
	 * The function returns <code>undefined</code> when
	 * <ul>
	 *     <li>The current state in browser's history pushState isn't
	 *         initialized, for example, between a new hash is set or replaced
	 *         and the "hashChange" event is processed by this class</li>
	 *     <li>History pushState isn't fully supported, for example,
	 *         Internet Explorer.</li>
	 *     <li>History pushState is already used before UI5 History
	 *         is initialized, and UI5 can't maintain the hash history
	 *         by using the browser pushState</li>
	 * </ul>
	 *
	 * Once the "hashChange" event is processed by this class, this method always
	 * returns 0. However, before a "hashChange" event reaches this class, it
	 * returns the offset between the new hash and the previous one within the
	 * history state.
	 *
	 * @public
	 * @since 1.70
	 * @return {int|undefined} The length difference or returns
	 *  <code>undefined</code> when browser pushState can't be used at the
	 *  moment when this function is called
	 */
	History.prototype.getHistoryStateOffset = function() {
		// browser doesn't fully support pushState
		if (Device.browser.msie) {
			return undefined;
		}

		var aStateHistory = ObjectPath.get("history.state.sap.history");

		if (!Array.isArray(aStateHistory)) {
			return undefined;
		}

		return aStateHistory.length - History._aStateHistory.length;
	};

	/**
	 * Detaches all events and cleans up this instance
	 *
	 * @private
	 */
	History.prototype.destroy = function() {
		this._unRegisterHashChanger();
	};

	/**
	 * Determines what the navigation direction for a newly given hash would be
	 * It will say Unknown if there is a history foo - bar (current history) - foo
	 * If you now ask for the direction of the hash "foo" you get Unknown because it might be backwards or forwards.
	 * For hash replacements, the history stack will be replaced at this position for the history.
	 * @param {string} [sNewHash] optional, if this parameter is not passed the last hashChange is taken.
	 * @returns {sap.ui.core.routing.HistoryDirection} or undefined, if no navigation has taken place yet.
	 * @public
	 */
	History.prototype.getDirection = function(sNewHash) {
		//no navigation has taken place and someone asks for a direction
		if (sNewHash !== undefined && this._bIsInitial) {
			return undefined;
		}

		if (sNewHash === undefined) {
			return this._sCurrentDirection;
		}

		return this._getDirection(sNewHash);
	};

	/**
	 * gets the previous hash in the history - if the last direction was Unknown or there was no navigation yet, undefined will be returned
	 * @returns {string} or undefined
	 * @public
	 */
	History.prototype.getPreviousHash = function() {
		return this.aHistory[this.iHistoryPosition - 1];
	};

	History.prototype._setHashChanger = function(oHashChanger) {
		if (this._oHashChanger) {
			this._unRegisterHashChanger();
		}

		this._oHashChanger = oHashChanger;

		this._mEventListeners = {};

		oHashChanger.getRelevantEventsInfo().forEach(function(oEventInfo) {
			var sEventName = oEventInfo.name,
				oParamMapping = oEventInfo.paramMapping || {},
				fnListener = this._onHashChange.bind(this, oParamMapping);

			this._mEventListeners[sEventName] = fnListener;

			this._oHashChanger.attachEvent(sEventName, fnListener, this);
		}.bind(this));

		this._oHashChanger.attachEvent("hashReplaced", this._hashReplaced, this);
		this._oHashChanger.attachEvent("hashSet", this._hashSet, this);
	};

	History.prototype._unRegisterHashChanger = function() {
		if (this._mEventListeners) {
			var aEventNames = Object.keys(this._mEventListeners);

			aEventNames.forEach(function(sEventName) {
				this._oHashChanger.detachEvent(sEventName, this._mEventListeners[sEventName], this);
			}.bind(this));

			delete this._mEventListeners;
		}

		this._oHashChanger.detachEvent("hashReplaced", this._hashReplaced, this);
		this._oHashChanger.detachEvent("hashSet", this._hashSet, this);

		this._oHashChanger = null;
	};


		/**
	 * Empties the history array, and sets the instance back to the unknown state.
	 * @private
	 */
	History.prototype._reset = function() {
		this.aHistory.length = 0;
		this.iHistoryPosition = 0;
		this._bUnknown = true;

		/*
		 * if the history is reset it should always get the current hash since -
		 * if you go from the Unknown to a defined state and then back is pressed we can be sure that the direction is backwards.
		 * Because the only way from unknown to known state is a new entry in the history.
		 */
		this.aHistory[0] = this._oHashChanger.getHash();
	};

	/**
	 * Determines what the navigation direction for a newly given hash would be
	 * @param {string} sNewHash the new hash
	 * @param {boolean} bHistoryLengthIncreased if the history length has increased compared with the last check
	 * @param {boolean} bCheckHashChangerEvents Checks if the hash was set or replaced by the hashchanger. When getDirection is called by an app this has to be false.
	 * @returns {sap.ui.core.routing.HistoryDirection} The history direction
	 * @private
	 */
	History.prototype._getDirection = function(sNewHash, bHistoryLengthIncreased, bCheckHashChangerEvents) {

		//Next hash was set by the router - it has to be a new entry
		if (bCheckHashChangerEvents && this._oNextHash && this._oNextHash.sHash === sNewHash) {
			return HistoryDirection.NewEntry;
		}


		//increasing the history length will add entries but we cannot rely on this as only criteria, since the history length is capped
		if (bHistoryLengthIncreased) {
			return HistoryDirection.NewEntry;
		}

		//we have not had a direction yet and the application did not trigger navigation + the browser history does not increase
		//the user is navigating in his history but we cannot determine the direction
		if (this._bUnknown) {
			return HistoryDirection.Unknown;
		}

		//At this point we know the user pressed a native browser navigation button

		//both directions contain the same hash we don't know the direction
		if (this.aHistory[this.iHistoryPosition + 1] === sNewHash && this.aHistory[this.iHistoryPosition - 1] === sNewHash) {
			return HistoryDirection.Unknown;
		}

		if (this.aHistory[this.iHistoryPosition - 1] === sNewHash) {
			return HistoryDirection.Backwards;
		}

		if (this.aHistory[this.iHistoryPosition + 1] === sNewHash) {
			return HistoryDirection.Forwards;
		}

		//Nothing hit, return unknown since we cannot determine what happened
		return HistoryDirection.Unknown;
	};

	/**
	 * Determine HistoryDirection leveraging the full hash as in window.location.hash
	 * and window.history.state.
	 *
	 * @param {string} sHash the complete hash, same as window.location.hash
	 * @return {sap.ui.core.routing.HistoryDirection} The determined HistoryDirection
	 * @private
	 */
	History.prototype._getDirectionWithState = function(sHash) {
		var oState = window.history.state === null ? {} : window.history.state,
			bBackward,
			sDirection;

		if (typeof oState === "object") {
			if (oState.sap === undefined) {
				History._aStateHistory.push(sHash);
				oState.sap = {};
				oState.sap.history = History._aStateHistory;
				history.replaceState(oState, document.title);
				sDirection = HistoryDirection.NewEntry;
			} else {
				bBackward = oState.sap.history.every(function(sURL, index) {
					return sURL === History._aStateHistory[index];
				});

				// If the state history is identical with the history trace, it means
				// that a hashChanged event is fired without a real brower hash change.
				// In this case, the _getDirectionWithState can't be used to determine
				// the history direction and should fallback to the legacy function
				if (bBackward && oState.sap.history.length === History._aStateHistory.length) {
					sDirection = undefined;
				} else {
					sDirection = bBackward ? HistoryDirection.Backwards : HistoryDirection.Forwards;
					History._aStateHistory = oState.sap.history;
				}
			}
		} else {
			Log.debug("Unable to determine HistoryDirection as history.state is already set: " + window.history.state, "sap.ui.core.routing.History");
		}

		return sDirection;
	};

	History.prototype._onHashChange = function(oParamMapping, oEvent) {
		var sNewHashParamName = oParamMapping.newHash || "newHash",
			sOldHashParamName = oParamMapping.oldHash || "oldHash",
			sFullHashParamName = oParamMapping.fullHash || "fullHash";

		// Leverage the fullHash parameter if available
		this._hashChange(oEvent.getParameter(sNewHashParamName), oEvent.getParameter(sOldHashParamName), oEvent.getParameter(sFullHashParamName));
	};

	/**
	 * Handles a hash change and cleans up the History
	 *
	 * @param {string} sNewHash The new hash
	 * @param {string} sOldHash The old hash
	 * @param {string} sFullHash The full hash
	 * @private
	 */
	History.prototype._hashChange = function(sNewHash, sOldHash, sFullHash) {
		var actualHistoryLength = window.history.length,
			sDirection;

		//We don't want to record replaced hashes
		if (this._oNextHash && this._oNextHash.bWasReplaced && this._oNextHash.sHash === sNewHash) {
			//Since a replace has taken place, the current history entry is also replaced
			this.aHistory[this.iHistoryPosition] = sNewHash;

			if (sFullHash !== undefined && !Device.browser.msie && this === History.getInstance()) {
				// after the hash is replaced, the history state is cleared.
				// We need to update the last entry in _aStateHistory and save the
				// history back to the browser history state
				History._aStateHistory[History._aStateHistory.length - 1] = sFullHash;
				window.history.replaceState({
					sap: {
						history: History._aStateHistory
					}
				}, window.document.title);
			}

			this._oNextHash = null;
			//reset the direction to Unknown when hash is replaced after history is already initialized
			if (!this._bIsInitial) {
				this._sCurrentDirection = HistoryDirection.Unknown;
			}
			return;
		}

		//a navigation has taken place so the history is not initial anymore.
		this._bIsInitial = false;

		// Extended direction determination with window.history.state
		// IE 11 doesn't clear the window.history.state when new hash is set
		// therefore the state solution can't be used
		//
		// The enhancement for direction determination is only done for the global
		// instance because the window.history.state can only be used once for the
		// new entry determination. Once the window.history.state is changed, it
		// can't be used again for the same hashchange event to determine the
		// direction which is the case if additional History instance is created
		if (sFullHash !== undefined && !Device.browser.msie && this === History.getInstance()) {
			sDirection = this._getDirectionWithState(sFullHash);
		}

		// if the direction can't be decided by using the state method, the fallback to the legacy method is taken
		if (!sDirection) {
			sDirection = this._getDirection(sNewHash, this._iHistoryLength < window.history.length, true);
		}

		this._sCurrentDirection = sDirection;

		// Remember the new history length, after it has been taken into account by getDirection
		this._iHistoryLength = actualHistoryLength;

		//the next hash direction was determined - set it back
		if (this._oNextHash) {
			this._oNextHash = null;
		}

		//We don't know the state of the history, don't record it set it back to unknown, since we can't say what comes up until the app navigates again
		if (sDirection === HistoryDirection.Unknown) {
			this._reset();
			return;
		}

		//We are at a known state of the history now, since we have a new entry / forwards or backwards
		this._bUnknown = false;

		//new history entry
		if (sDirection === HistoryDirection.NewEntry) {
			//new item and there where x back navigations before - remove all the forward items from the history
			if (this.iHistoryPosition + 1 < this.aHistory.length) {
				this.aHistory = this.aHistory.slice(0, this.iHistoryPosition + 1);
			}

			this.aHistory.push(sNewHash);
			this.iHistoryPosition += 1;
			return;
		}

		if (sDirection === HistoryDirection.Forwards) {
			this.iHistoryPosition++;
			return;
		}

		if (sDirection === HistoryDirection.Backwards) {
			this.iHistoryPosition--;
		}
	};

	/**
	 * Handles a hash change and cleans up the History
	 * @param {sap.ui.base.Event} oEvent The event containing the hash
	 * @private
	 */
	History.prototype._hashSet = function(oEvent) {
		this._hashChangedByApp(oEvent.getParameter("sHash"), false);
	};

	/**
	 * Handles a hash change and cleans up the History
	 * @param {sap.ui.base.Event} oEvent The event containing the hash
	 * @private
	 */
	History.prototype._hashReplaced = function(oEvent) {
		this._hashChangedByApp(oEvent.getParameter("sHash"), true);
	};

	/**
	 * Sets the next hash that is going to happen in the hashChange function - used to determine if the app or the browserHistory/links triggered this navigation
	 * @param {string} sNewHash The new hash
	 * @param {boolean} bWasReplaced If the hash was replaced
	 */
	History.prototype._hashChangedByApp = function(sNewHash, bWasReplaced) {
		this._oNextHash = { sHash : sNewHash, bWasReplaced : bWasReplaced };
	};


	var instance = new History(HashChanger.getInstance());

	/**
	 * @public
	 * @returns { sap.ui.core.routing.History } a global singleton that gets created as soon as the sap.ui.core.routing.History is required
	 */
	History.getInstance = function() {
		return instance;
	};

	return History;

}, /* bExport= */ true);
