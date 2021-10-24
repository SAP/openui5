import library from "sap/ui/core/library";
import HashChanger from "./HashChanger";
import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
export class History {
    private static _aStateHistory = [];
    private static _bUsePushState = window.self === window.top;
    getHistoryStateOffset(...args: any) {
        if (!History._bUsePushState) {
            return undefined;
        }
        var aStateHistory = ObjectPath.get("history.state.sap.history");
        if (!Array.isArray(aStateHistory)) {
            return undefined;
        }
        return aStateHistory.length - History._aStateHistory.length;
    }
    destroy(...args: any) {
        this._unRegisterHashChanger();
    }
    getDirection(sNewHash: any) {
        if (sNewHash !== undefined && this._bIsInitial) {
            return undefined;
        }
        if (sNewHash === undefined) {
            return this._sCurrentDirection;
        }
        return this._getDirection(sNewHash);
    }
    getPreviousHash(...args: any) {
        return this.aHistory[this.iHistoryPosition - 1];
    }
    private _setHashChanger(oHashChanger: any) {
        if (this._oHashChanger) {
            this._unRegisterHashChanger();
        }
        this._oHashChanger = oHashChanger;
        this._mEventListeners = {};
        oHashChanger.getRelevantEventsInfo().forEach(function (oEventInfo) {
            var sEventName = oEventInfo.name, oParamMapping = oEventInfo.paramMapping || {}, fnListener = this._onHashChange.bind(this, oParamMapping);
            this._mEventListeners[sEventName] = fnListener;
            this._oHashChanger.attachEvent(sEventName, fnListener, this);
        }.bind(this));
        this._oHashChanger.attachEvent("hashReplaced", this._hashReplaced, this);
        this._oHashChanger.attachEvent("hashSet", this._hashSet, this);
    }
    private _unRegisterHashChanger(...args: any) {
        if (this._mEventListeners) {
            var aEventNames = Object.keys(this._mEventListeners);
            aEventNames.forEach(function (sEventName) {
                this._oHashChanger.detachEvent(sEventName, this._mEventListeners[sEventName], this);
            }.bind(this));
            delete this._mEventListeners;
        }
        this._oHashChanger.detachEvent("hashReplaced", this._hashReplaced, this);
        this._oHashChanger.detachEvent("hashSet", this._hashSet, this);
        this._oHashChanger = null;
    }
    private _reset(...args: any) {
        this.aHistory.length = 0;
        this.iHistoryPosition = 0;
        this._bUnknown = true;
        this.aHistory[0] = this._oHashChanger.getHash();
    }
    private _getDirection(sNewHash: any, bHistoryLengthIncreased: any, bCheckHashChangerEvents: any) {
        if (bCheckHashChangerEvents && this._oNextHash && this._oNextHash.sHash === sNewHash) {
            return HistoryDirection.NewEntry;
        }
        if (bHistoryLengthIncreased) {
            return HistoryDirection.NewEntry;
        }
        if (this._bUnknown) {
            return HistoryDirection.Unknown;
        }
        if (this.aHistory[this.iHistoryPosition + 1] === sNewHash && this.aHistory[this.iHistoryPosition - 1] === sNewHash) {
            return HistoryDirection.Unknown;
        }
        if (this.aHistory[this.iHistoryPosition - 1] === sNewHash) {
            return HistoryDirection.Backwards;
        }
        if (this.aHistory[this.iHistoryPosition + 1] === sNewHash) {
            return HistoryDirection.Forwards;
        }
        return HistoryDirection.Unknown;
    }
    private _getDirectionWithState(sHash: any) {
        var oState = window.history.state === null ? {} : window.history.state, bBackward, sDirection;
        if (typeof oState === "object") {
            if (oState.sap === undefined) {
                History._aStateHistory.push(sHash);
                oState.sap = {};
                oState.sap.history = History._aStateHistory;
                window.history.replaceState(oState, document.title);
                sDirection = HistoryDirection.NewEntry;
            }
            else {
                bBackward = oState.sap.history.every(function (sURL, index) {
                    return sURL === History._aStateHistory[index];
                });
                if (bBackward && oState.sap.history.length === History._aStateHistory.length) {
                    sDirection = DIRECTION_UNCHANGED;
                }
                else {
                    sDirection = bBackward ? HistoryDirection.Backwards : HistoryDirection.Forwards;
                    History._aStateHistory = oState.sap.history;
                }
            }
        }
        else {
            Log.debug("Unable to determine HistoryDirection as history.state is already set: " + window.history.state, "sap.ui.core.routing.History");
        }
        return sDirection;
    }
    private _onHashChange(oParamMapping: any, oEvent: any) {
        var sNewHashParamName = oParamMapping.newHash || "newHash", sOldHashParamName = oParamMapping.oldHash || "oldHash", sFullHashParamName = oParamMapping.fullHash || "fullHash";
        this._hashChange(oEvent.getParameter(sNewHashParamName), oEvent.getParameter(sOldHashParamName), oEvent.getParameter(sFullHashParamName));
    }
    private _hashChange(sNewHash: any, sOldHash: any, sFullHash: any) {
        var actualHistoryLength = window.history.length, sDirection;
        if (this._oNextHash && this._oNextHash.bWasReplaced && this._oNextHash.sHash === sNewHash) {
            if (this._oNextHash.sDirection) {
                sDirection = this._oNextHash.sDirection;
            }
            else {
                this.aHistory[this.iHistoryPosition] = sNewHash;
                if (sFullHash !== undefined && History._bUsePushState && this === History.getInstance()) {
                    History._aStateHistory[History._aStateHistory.length - 1] = sFullHash;
                    window.history.replaceState({
                        sap: {
                            history: History._aStateHistory
                        }
                    }, window.document.title);
                }
                this._oNextHash = null;
                if (!this._bIsInitial) {
                    this._sCurrentDirection = HistoryDirection.Unknown;
                }
                return;
            }
        }
        this._bIsInitial = false;
        if (sDirection) {
            this._adaptToDirection(sDirection, {
                oldHash: sOldHash,
                newHash: sNewHash,
                fullHash: sFullHash
            });
        }
        else {
            if (!sDirection && sFullHash !== undefined && History._bUsePushState && this === History.getInstance()) {
                sDirection = this._getDirectionWithState(sFullHash);
            }
            if (sDirection === DIRECTION_UNCHANGED) {
                return;
            }
            if (!sDirection) {
                sDirection = this._getDirection(sNewHash, this._iHistoryLength < window.history.length, true);
            }
            this._bUnknown = false;
            switch (sDirection) {
                case HistoryDirection.Unknown:
                    this._reset();
                    break;
                case HistoryDirection.NewEntry:
                    this.aHistory.splice(this.iHistoryPosition + 1, this.aHistory.length - this.iHistoryPosition - 1, sNewHash);
                    this.iHistoryPosition++;
                    break;
                case HistoryDirection.Forwards:
                    this.iHistoryPosition++;
                    break;
                case HistoryDirection.Backwards:
                    this.iHistoryPosition--;
                    break;
                default: break;
            }
        }
        this._sCurrentDirection = sDirection;
        this._iHistoryLength = actualHistoryLength;
        if (this._oNextHash) {
            this._oNextHash = null;
        }
    }
    private _adaptToDirection(sDirection: any, oHashInfo: any) {
        var sFullHash = oHashInfo.fullHash, sNewHash = oHashInfo.newHash, iIndex, oState;
        if (History._bUsePushState && this === History.getInstance() && sFullHash !== undefined) {
            switch (sDirection) {
                case HistoryDirection.NewEntry:
                case HistoryDirection.Forwards:
                    History._aStateHistory.push(sFullHash);
                    break;
                case HistoryDirection.Backwards:
                    iIndex = History._aStateHistory.lastIndexOf(sFullHash);
                    if (iIndex !== -1) {
                        History._aStateHistory.splice(iIndex + 1);
                    }
                    else {
                        History._aStateHistory = [sFullHash];
                        Log.debug("Can't find " + sFullHash + " in " + JSON.stringify(History._aStateHistory));
                    }
                    break;
                case HistoryDirection.Unknown:
                    History._aStateHistory[History._aStateHistory.length - 1] = sFullHash;
                    break;
                default: break;
            }
            oState = {};
            oState.sap = {};
            oState.sap.history = History._aStateHistory;
            window.history.replaceState(oState, document.title);
        }
        switch (sDirection) {
            case HistoryDirection.NewEntry:
                this.aHistory.splice(this.iHistoryPosition + 1, this.aHistory.length - this.iHistoryPosition - 1, sNewHash);
                this.iHistoryPosition += 1;
                break;
            case HistoryDirection.Forwards:
                iIndex = this.aHistory.indexOf(sNewHash, this.iHistoryPosition + 1);
                if (iIndex !== -1) {
                    this.iHistoryPosition = iIndex;
                }
                else {
                    this.aHistory.splice(this.iHistoryPosition + 1, this.aHistory.length - this.iHistoryPosition - 1, sNewHash);
                    this.iHistoryPosition++;
                }
                break;
            case HistoryDirection.Backwards:
                iIndex = this.aHistory.lastIndexOf(sNewHash, this.iHistoryPosition - 1);
                if (iIndex !== -1) {
                    this.iHistoryPosition = iIndex;
                }
                else {
                    this.aHistory = [sNewHash];
                    this.iHistoryPosition = 0;
                }
                break;
            case HistoryDirection.Unknown:
                this.aHistory[this.iHistoryPosition] = sNewHash;
                break;
            default: break;
        }
    }
    private _hashSet(oEvent: any) {
        var sHash = oEvent.getParameter("hash");
        if (sHash === undefined) {
            sHash = oEvent.getParameter("sHash");
        }
        this._hashChangedByApp(sHash, false);
    }
    private _hashReplaced(oEvent: any) {
        var sHash = oEvent.getParameter("hash"), sDirection = oEvent.getParameter("direction");
        if (sHash === undefined) {
            sHash = oEvent.getParameter("sHash");
        }
        if (sHash === this._oHashChanger.getHash() && sDirection) {
            this._sCurrentDirection = sDirection;
        }
        this._hashChangedByApp(sHash, true, sDirection);
    }
    private _hashChangedByApp(sNewHash: any, bWasReplaced: any, sDirection: any) {
        this._oNextHash = { sHash: sNewHash, bWasReplaced: bWasReplaced, sDirection: sDirection };
    }
    static getInstance(...args: any) {
        return instance;
    }
    constructor(oHashChanger: any) {
        var that = this;
        this._iHistoryLength = window.history.length;
        this.aHistory = [];
        this._bIsInitial = true;
        function initHistory(sCurrentHash) {
            if (History._bUsePushState && !History.getInstance()) {
                var oState = window.history.state === null ? {} : window.history.state;
                if (typeof oState === "object") {
                    oState.sap = oState.sap ? oState.sap : {};
                    if (oState.sap.history && Array.isArray(oState.sap.history) && oState.sap.history[oState.sap.history.length - 1] === sCurrentHash) {
                        History._aStateHistory = oState.sap.history;
                    }
                    else {
                        History._aStateHistory.push(sCurrentHash);
                        oState.sap.history = History._aStateHistory;
                        window.history.replaceState(oState, window.document.title);
                    }
                }
                else {
                    Log.debug("Unable to determine HistoryDirection as history.state is already set: " + window.history.state, "sap.ui.core.routing.History");
                }
            }
            that._reset();
        }
        if (!oHashChanger) {
            Log.error("sap.ui.core.routing.History constructor was called and it did not get a hashChanger as parameter");
        }
        this._setHashChanger(oHashChanger);
        if (oHashChanger._initialized) {
            initHistory(oHashChanger.getHash());
        }
        else {
            oHashChanger.attachEventOnce("hashChanged", function (oEvent) {
                initHistory(oEvent.getParameter("newHash"));
            });
        }
    }
}
var HistoryDirection = library.routing.HistoryDirection;
var DIRECTION_UNCHANGED = "Direction_Unchanged";
var instance;
instance = new History(HashChanger.getInstance());