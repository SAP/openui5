/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var init = function(exports, module, require) {
  

// version information 
exports.version = { major: 4, minor: 0, build: 0 };

// core stuff, always needed
exports.deferred = require('./lib/deferred.js');
exports.utils = require('./lib/utils.js');

// only needed for xml metadata 
exports.xml = require('./lib/xml.js');

// only need in browser case
exports.oData = require('./lib/odata.js');
exports.store = require('./lib/store.js');
exports.cache = require('./lib/cache.js');




};

var datas = {"cache" : function(exports, module, require) {
'use strict';

 /** @module cache */

//var odatajs = require('./odatajs/utils.js');
var utils =  require('./utils.js');
var deferred = require('./deferred.js');
var storeReq = require('./store.js');
var cacheSource = require('./cache/source.js');


var assigned = utils.assigned;
var delay = utils.delay;
var extend = utils.extend;
var djsassert = utils.djsassert;
var isArray = utils.isArray;
var normalizeURI = utils.normalizeURI;
var parseInt10 = utils.parseInt10;
var undefinedDefault = utils.undefinedDefault;

var createDeferred = deferred.createDeferred;
var DjsDeferred = deferred.DjsDeferred;


var getJsonValueArraryLength = utils.getJsonValueArraryLength;
var sliceJsonValueArray = utils.sliceJsonValueArray;
var concatJsonValueArray = utils.concatJsonValueArray;



/** Appends a page's data to the operation data.
 * @param {Object} operation - Operation with  (i)ndex, (c)ount and (d)ata.
 * @param {Object} page - Page with (i)ndex, (c)ount and (d)ata.
 */
function appendPage(operation, page) {

    var intersection = intersectRanges(operation, page);
    var start = 0;
    var end = 0;
    if (intersection) {
        start = intersection.i - page.i;
        end = start + (operation.c - getJsonValueArraryLength(operation.d));
    }

    operation.d = concatJsonValueArray(operation.d, sliceJsonValueArray(page.d, start, end));
}

/** Returns the {(i)ndex, (c)ount} range for the intersection of x and y.
 * @param {Object} x - Range with (i)ndex and (c)ount members.
 * @param {Object} y - Range with (i)ndex and (c)ount members.
 * @returns {Object} The intersection (i)ndex and (c)ount; undefined if there is no intersection.
 */
function intersectRanges(x, y) {

    var xLast = x.i + x.c;
    var yLast = y.i + y.c;
    var resultIndex = (x.i > y.i) ? x.i : y.i;
    var resultLast = (xLast < yLast) ? xLast : yLast;
    var result;
    if (resultLast >= resultIndex) {
        result = { i: resultIndex, c: resultLast - resultIndex };
    }

    return result;
}

/** Checks whether val is a defined number with value zero or greater.
 * @param {Number} val - Value to check.
 * @param {String} name - Parameter name to use in exception.
 * @throws Throws an exception if the check fails
 */
function checkZeroGreater(val, name) {

    if (val === undefined || typeof val !== "number") {
        throw { message: "'" + name + "' must be a number." };
    }

    if (isNaN(val) || val < 0 || !isFinite(val)) {
        throw { message: "'" + name + "' must be greater than or equal to zero." };
    }
}

/** Checks whether val is undefined or a number with value greater than zero.
 * @param {Number} val - Value to check.
 * @param {String} name - Parameter name to use in exception.
 * @throws Throws an exception if the check fails
 */
function checkUndefinedGreaterThanZero(val, name) {

    if (val !== undefined) {
        if (typeof val !== "number") {
            throw { message: "'" + name + "' must be a number." };
        }

        if (isNaN(val) || val <= 0 || !isFinite(val)) {
            throw { message: "'" + name + "' must be greater than zero." };
        }
    }
}

/** Checks whether val is undefined or a number
 * @param {Number} val - Value to check.
 * @param {String} name - Parameter name to use in exception.
 * @throws Throws an exception if the check fails
 */
function checkUndefinedOrNumber(val, name) {
    if (val !== undefined && (typeof val !== "number" || isNaN(val) || !isFinite(val))) {
        throw { message: "'" + name + "' must be a number." };
    }
}

/** Performs a linear search on the specified array and removes the first instance of 'item'.
 * @param {Array} arr - Array to search.
 * @param {*} item - Item being sought.
 * @returns {Boolean} true if the item was removed otherwise false
 */
function removeFromArray(arr, item) {

    var i, len;
    for (i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === item) {
            arr.splice(i, 1);
            return true;
        }
    }

    return false;
}

/** Estimates the size of an object in bytes.
 * Object trees are traversed recursively
 * @param {Object} object - Object to determine the size of.
 * @returns {Number} Estimated size of the object in bytes.
 */
function estimateSize(object) {
    var size = 0;
    var type = typeof object;

    if (type === "object" && object) {
        for (var name in object) {
            size += name.length * 2 + estimateSize(object[name]);
        }
    } else if (type === "string") {
        size = object.length * 2;
    } else {
        size = 8;
    }
    return size;
}

/** Snaps low and high indices into page sizes and returns a range.
 * @param {Number} lowIndex - Low index to snap to a lower value.
 * @param {Number} highIndex - High index to snap to a higher value.
 * @param {Number} pageSize - Page size to snap to.
 * @returns {Object} A range with (i)ndex and (c)ount of elements.
 */
function snapToPageBoundaries(lowIndex, highIndex, pageSize) {
    lowIndex = Math.floor(lowIndex / pageSize) * pageSize;
    highIndex = Math.ceil((highIndex + 1) / pageSize) * pageSize;
    return { i: lowIndex, c: highIndex - lowIndex };
}

// The DataCache is implemented using state machines.  The following constants are used to properly
// identify and label the states that these machines transition to.
var CACHE_STATE_DESTROY  = "destroy";
var CACHE_STATE_IDLE     = "idle";
var CACHE_STATE_INIT     = "init";
var CACHE_STATE_READ     = "read";
var CACHE_STATE_PREFETCH = "prefetch";
var CACHE_STATE_WRITE    = "write";

// DataCacheOperation state machine states.
// Transitions on operations also depend on the cache current of the cache.
var OPERATION_STATE_CANCEL = "cancel";
var OPERATION_STATE_END    = "end";
var OPERATION_STATE_ERROR  = "error";
var OPERATION_STATE_START  = "start";
var OPERATION_STATE_WAIT   = "wait";

// Destroy state machine states
var DESTROY_STATE_CLEAR = "clear";

// Read / Prefetch state machine states
var READ_STATE_DONE   = "done";
var READ_STATE_LOCAL  = "local";
var READ_STATE_SAVE   = "save";
var READ_STATE_SOURCE = "source";

/** Creates a new operation object.
 * @class DataCacheOperation
 * @param {Function} stateMachine - State machine that describes the specific behavior of the operation.
 * @param {DjsDeferred} promise - Promise for requested values.
 * @param {Boolean} isCancelable - Whether this operation can be canceled or not.
 * @param {Number} index - Index of first item requested.
 * @param {Number} count - Count of items requested.
 * @param {Array} data - Array with the items requested by the operation.
 * @param {Number} pending - Total number of pending prefetch records.
 * @returns {DataCacheOperation} A new data cache operation instance.
 */
function DataCacheOperation(stateMachine, promise, isCancelable, index, count, data, pending) {

   var stateData;
    var cacheState;
    var that = this;

    that.p = promise;
    that.i = index;
    that.c = count;
    that.d = data;
    that.s = OPERATION_STATE_START;

    that.canceled = false;
    that.pending = pending;
    that.oncomplete = null;

    /** Transitions this operation to the cancel state and sets the canceled flag to true.
     * The function is a no-op if the operation is non-cancelable.
     * @method DataCacheOperation#cancel
     */
    that.cancel = function cancel() {

        if (!isCancelable) {
            return;
        }

        var state = that.s;
        if (state !== OPERATION_STATE_ERROR && state !== OPERATION_STATE_END && state !== OPERATION_STATE_CANCEL) {
            that.canceled = true;
            that.transition(OPERATION_STATE_CANCEL, stateData);
        }
    };

    /** Transitions this operation to the end state.
     * @method DataCacheOperation#complete
     */
    that.complete = function () {

        djsassert(that.s !== OPERATION_STATE_END, "DataCacheOperation.complete() - operation is in the end state", that);
        that.transition(OPERATION_STATE_END, stateData);
    };

    /** Transitions this operation to the error state.
     * @method DataCacheOperation#error
     */
    that.error = function (err) {
        if (!that.canceled) {
            djsassert(that.s !== OPERATION_STATE_END, "DataCacheOperation.error() - operation is in the end state", that);
            djsassert(that.s !== OPERATION_STATE_ERROR, "DataCacheOperation.error() - operation is in the error state", that);
            that.transition(OPERATION_STATE_ERROR, err);
        }
    };

    /** Executes the operation's current state in the context of a new cache state.
     * @method DataCacheOperation#run
     * @param {Object} state - New cache state.
     */
    that.run = function (state) {

        cacheState = state;
        that.transition(that.s, stateData);
    };

    /** Transitions this operation to the wait state.
     * @method DataCacheOperation#wait
     */
    that.wait = function (data) {

        djsassert(that.s !== OPERATION_STATE_END, "DataCacheOperation.wait() - operation is in the end state", that);
        that.transition(OPERATION_STATE_WAIT, data);
    };

    /** State machine that describes all operations common behavior.
     * @method DataCacheOperation#operationStateMachine
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
     * @param {Object} [data] - Additional data passed to the state.
     */
    var operationStateMachine = function (opTargetState, cacheState, data) {

        switch (opTargetState) {
            case OPERATION_STATE_START:
                // Initial state of the operation. The operation will remain in this state until the cache has been fully initialized.
                if (cacheState !== CACHE_STATE_INIT) {
                    stateMachine(that, opTargetState, cacheState, data);
                }
                break;

            case OPERATION_STATE_WAIT:
                // Wait state indicating that the operation is active but waiting for an asynchronous operation to complete.
                stateMachine(that, opTargetState, cacheState, data);
                break;

            case OPERATION_STATE_CANCEL:
                // Cancel state.
                stateMachine(that, opTargetState, cacheState, data);
                that.fireCanceled();
                that.transition(OPERATION_STATE_END);
                break;

            case OPERATION_STATE_ERROR:
                // Error state. Data is expected to be an object detailing the error condition.
                stateMachine(that, opTargetState, cacheState, data);
                that.canceled = true;
                that.fireRejected(data);
                that.transition(OPERATION_STATE_END);
                break;

            case OPERATION_STATE_END:
                // Final state of the operation.
                if (that.oncomplete) {
                    that.oncomplete(that);
                }
                if (!that.canceled) {
                    that.fireResolved();
                }
                stateMachine(that, opTargetState, cacheState, data);
                break;

            default:
                // Any other state is passed down to the state machine describing the operation's specific behavior.

                if (true) {
                    // Check that the state machine actually handled the sate.
                    var handled = stateMachine(that, opTargetState, cacheState, data);
                    djsassert(handled, "Bad operation state: " + opTargetState + " cacheState: " + cacheState, this);
                } else {

                    stateMachine(that, opTargetState, cacheState, data);

                }

                break;
        }
    };



    /** Transitions this operation to a new state.
     * @method DataCacheOperation#transition
     * @param {Object} state - State to transition the operation to.
     * @param {Object} [data] - 
     */
    that.transition = function (state, data) {
        that.s = state;
        stateData = data;
        operationStateMachine(state, cacheState, data);
    };
    
    return that;
}

/** Fires a resolved notification as necessary.
 * @method DataCacheOperation#fireResolved
 */
DataCacheOperation.prototype.fireResolved = function () {

    // Fire the resolve just once.
    var p = this.p;
    if (p) {
        this.p = null;
        p.resolve(this.d);
    }
};

/** Fires a rejected notification as necessary.
 * @method DataCacheOperation#fireRejected
 */
DataCacheOperation.prototype.fireRejected = function (reason) {

    // Fire the rejection just once.
    var p = this.p;
    if (p) {
        this.p = null;
        p.reject(reason);
    }
};

/** Fires a canceled notification as necessary.
 * @method DataCacheOperation#fireCanceled
 */
DataCacheOperation.prototype.fireCanceled = function () {

    this.fireRejected({ canceled: true, message: "Operation canceled" });
};


/** Creates a data cache for a collection that is efficiently loaded on-demand.
 * @class DataCache
 * @param options - Options for the data cache, including name, source, pageSize,
 * prefetchSize, cacheSize, storage mechanism, and initial prefetch and local-data handler.
 * @returns {DataCache} A new data cache instance.
 */
function DataCache(options) {

    var state = CACHE_STATE_INIT;
    var stats = { counts: 0, netReads: 0, prefetches: 0, cacheReads: 0 };

    var clearOperations = [];
    var readOperations = [];
    var prefetchOperations = [];

    var actualCacheSize = 0;                                             // Actual cache size in bytes.
    var allDataLocal = false;                                            // Whether all data is local.
    var cacheSize = undefinedDefault(options.cacheSize, 1048576);        // Requested cache size in bytes, default 1 MB.
    var collectionCount = 0;                                             // Number of elements in the server collection.
    var highestSavedPage = 0;                                            // Highest index of all the saved pages.
    var highestSavedPageSize = 0;                                        // Item count of the saved page with the highest index.
    var overflowed = cacheSize === 0;                                    // If the cache has overflowed (actualCacheSize > cacheSize or cacheSize == 0);
    var pageSize = undefinedDefault(options.pageSize, 50);               // Number of elements to store per page.
    var prefetchSize = undefinedDefault(options.prefetchSize, pageSize); // Number of elements to prefetch from the source when the cache is idling.
    var version = "1.0";
    var cacheFailure;

    var pendingOperations = 0;

    var source = options.source;
    if (typeof source === "string") {
        // Create a new cache source.
        source = new cacheSource.ODataCacheSource(options);
    }
    source.options = options;

    // Create a cache local store.
    var store = storeReq.createStore(options.name, options.mechanism);

    var that = this;

    that.onidle = options.idle;
    that.stats = stats;

    /** Counts the number of items in the collection.
     * @method DataCache#count
     * @returns {Object} A promise with the number of items.
     */
    that.count = function () {

        if (cacheFailure) {
            throw cacheFailure;
        }

        var deferred = createDeferred();
        var canceled = false;

        if (allDataLocal) {
            delay(function () {
                deferred.resolve(collectionCount);
            });

            return deferred.promise();
        }

        // TODO: Consider returning the local data count instead once allDataLocal flag is set to true.
        var request = source.count(function (count) {
            request = null;
            stats.counts++;
            deferred.resolve(count);
        }, function (err) {
            request = null;
            deferred.reject(extend(err, { canceled: canceled }));
        });

        return extend(deferred.promise(), {

             /** Aborts the count operation (used within promise callback)
              * @method DataCache#cancelCount
              */
            cancel: function () {
               
                if (request) {
                    canceled = true;
                    request.abort();
                    request = null;
                }
            }
        });
    };

    /** Cancels all running operations and clears all local data associated with this cache.
     * New read requests made while a clear operation is in progress will not be canceled.
     * Instead they will be queued for execution once the operation is completed.
     * @method DataCache#clear
     * @returns {Object} A promise that has no value and can't be canceled.
     */
    that.clear = function () {

        if (cacheFailure) {
            throw cacheFailure;
        }

        if (clearOperations.length === 0) {
            var deferred = createDeferred();
            var op = new DataCacheOperation(destroyStateMachine, deferred, false);
            queueAndStart(op, clearOperations);
            return deferred.promise();
        }
        return clearOperations[0].p;
    };

    /** Filters the cache data based a predicate.
     * Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
     * @method DataCache#filterForward
     * @param {Number} index - The index of the item to start filtering forward from.
     * @param {Number} count - Maximum number of items to include in the result.
     * @param {Function} predicate - Callback function returning a boolean that determines whether an item should be included in the result or not.
     * @returns {DjsDeferred} A promise for an array of results.
     */
    that.filterForward = function (index, count, predicate) {
        return filter(index, count, predicate, false);
    };

    /** Filters the cache data based a predicate.
     * Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
     * @method DataCache#filterBack
     * @param {Number} index - The index of the item to start filtering backward from.
     * @param {Number} count - Maximum number of items to include in the result.
     * @param {Function} predicate - Callback function returning a boolean that determines whether an item should be included in the result or not.
     * @returns {DjsDeferred} A promise for an array of results.
     */
    that.filterBack = function (index, count, predicate) {
        return filter(index, count, predicate, true);
    };

    /** Reads a range of adjacent records.
     * New read requests made while a clear operation is in progress will not be canceled.
     * Instead they will be queued for execution once the operation is completed.
     * @method DataCache#readRange
     * @param {Number} index - Zero-based index of record range to read.
     * @param {Number} count - Number of records in the range.
     * @returns {DjsDeferred} A promise for an array of records; less records may be returned if the
     * end of the collection is found.
     */
    that.readRange = function (index, count) {

        checkZeroGreater(index, "index");
        checkZeroGreater(count, "count");

        if (cacheFailure) {
            throw cacheFailure;
        }

        var deferred = createDeferred();

        // Merging read operations would be a nice optimization here.
        var op = new DataCacheOperation(readStateMachine, deferred, true, index, count, {}, 0);
        queueAndStart(op, readOperations);

        return extend(deferred.promise(), {
            cancel: function () {
                /** Aborts the readRange operation  (used within promise callback)
                 * @method DataCache#cancelReadRange
                 */
                op.cancel();
            }
        });
    };

    /** Creates an Observable object that enumerates all the cache contents.
     * @method DataCache#toObservable
     * @returns A new Observable object that enumerates all the cache contents.
     */
    that.ToObservable = that.toObservable = function () {
        if ( !utils.inBrowser()) {
            throw { message: "Only in broser supported" };
        }

        if (!window.Rx || !window.Rx.Observable) {
            throw { message: "Rx library not available - include rx.js" };
        }

        if (cacheFailure) {
            throw cacheFailure;
        }

        //return window.Rx.Observable.create(function (obs) {
        return new window.Rx.Observable(function (obs) {
            var disposed = false;
            var index = 0;

            var errorCallback = function (error) {
                if (!disposed) {
                    obs.onError(error);
                }
            };

            var successCallback = function (data) {
                if (!disposed) {
                    var i, len;
                    for (i = 0, len = data.value.length; i < len; i++) {
                        // The wrapper automatically checks for Dispose
                        // on the observer, so we don't need to check it here.
                        //obs.next(data.value[i]);
                        obs.onNext(data.value[i]);
                    }

                    if (data.value.length < pageSize) {
                        //obs.completed();
                        obs.onCompleted();
                    } else {
                        index += pageSize;
                        that.readRange(index, pageSize).then(successCallback, errorCallback);
                    }
                }
            };

            that.readRange(index, pageSize).then(successCallback, errorCallback);

            return { Dispose: function () { 
                obs.dispose(); // otherwise the check isStopped obs.onNext(data.value[i]);
                disposed = true; 
                } };
        });
    };

    /** Creates a function that handles a callback by setting the cache into failure mode.
     * @method DataCache~cacheFailureCallback
     * @param {String} message - Message text.
     * @returns {Function} Function to use as error callback.
     * This function will specifically handle problems with critical store resources
     * during cache initialization.
     */
    var cacheFailureCallback = function (message) {
        

        return function (error) {
            cacheFailure = { message: message, error: error };

            // Destroy any pending clear or read operations.
            // At this point there should be no prefetch operations.
            // Count operations will go through but are benign because they
            // won't interact with the store.
            djsassert(prefetchOperations.length === 0, "prefetchOperations.length === 0");
            var i, len;
            for (i = 0, len = readOperations.length; i < len; i++) {
                readOperations[i].fireRejected(cacheFailure);
            }
            for (i = 0, len = clearOperations.length; i < len; i++) {
                clearOperations[i].fireRejected(cacheFailure);
            }

            // Null out the operation arrays.
            readOperations = clearOperations = null;
        };
    };

    /** Updates the cache's state and signals all pending operations of the change.
     * @method DataCache~changeState
     * @param {Object} newState - New cache state.
     * This method is a no-op if the cache's current state and the new state are the same.
     */
    var changeState = function (newState) {

        if (newState !== state) {
            state = newState;
            var operations = clearOperations.concat(readOperations, prefetchOperations);
            var i, len;
            for (i = 0, len = operations.length; i < len; i++) {
                operations[i].run(state);
            }
        }
    };

    /** Removes all the data stored in the cache.
     * @method DataCache~clearStore
     * @returns {DjsDeferred} A promise with no value.
     */
    var clearStore = function () {
        djsassert(state === CACHE_STATE_DESTROY || state === CACHE_STATE_INIT, "DataCache.clearStore() - cache is not on the destroy or initialize state, current sate = " + state);

        var deferred = new DjsDeferred();
        store.clear(function () {

            // Reset the cache settings.
            actualCacheSize = 0;
            allDataLocal = false;
            collectionCount = 0;
            highestSavedPage = 0;
            highestSavedPageSize = 0;
            overflowed = cacheSize === 0;

            // version is not reset, in case there is other state in eg V1.1 that is still around.

            // Reset the cache stats.
            stats = { counts: 0, netReads: 0, prefetches: 0, cacheReads: 0 };
            that.stats = stats;

            store.close();
            deferred.resolve();
        }, function (err) {
            deferred.reject(err);
        });
        return deferred;
    };

    /** Removes an operation from the caches queues and changes the cache state to idle.
     * @method DataCache~dequeueOperation
     * @param {DataCacheOperation} operation - Operation to dequeue.
     * This method is used as a handler for the operation's oncomplete event.
    */
    var dequeueOperation = function (operation) {

        var removed = removeFromArray(clearOperations, operation);
        if (!removed) {
            removed = removeFromArray(readOperations, operation);
            if (!removed) {
                removeFromArray(prefetchOperations, operation);
            }
        }

        pendingOperations--;
        changeState(CACHE_STATE_IDLE);
    };

    /** Requests data from the cache source.
     * @method DataCache~fetchPage
     * @param {Number} start - Zero-based index of items to request.
     * @returns {DjsDeferred} A promise for a page object with (i)ndex, (c)ount, (d)ata.
     */
    var fetchPage = function (start) {

        djsassert(state !== CACHE_STATE_DESTROY, "DataCache.fetchPage() - cache is on the destroy state");
        djsassert(state !== CACHE_STATE_IDLE, "DataCache.fetchPage() - cache is on the idle state");

        var deferred = new DjsDeferred();
        var canceled = false;

        var request = source.read(start, pageSize, function (data) {
            var length = getJsonValueArraryLength(data);
            var page = { i: start, c: length, d: data };
            deferred.resolve(page);
        }, function (err) {
            deferred.reject(err);
        });

        return extend(deferred, {
            cancel: function () {
                if (request) {
                    request.abort();
                    canceled = true;
                    request = null;
                }
            }
        });
    };

    /** Filters the cache data based a predicate.
     * @method DataCache~filter
     * @param {Number} index - The index of the item to start filtering from.
     * @param {Number} count - Maximum number of items to include in the result.
     * @param {Function} predicate - Callback function returning a boolean that determines whether an item should be included in the result or not.
     * @param {Boolean} backwards - True if the filtering should move backward from the specified index, falsey otherwise.
     * Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
     * @returns {DjsDeferred} A promise for an array of results.
     */
    var filter = function (index, count, predicate, backwards) {

        index = parseInt10(index);
        count = parseInt10(count);

        if (isNaN(index)) {
            throw { message: "'index' must be a valid number.", index: index };
        }
        if (isNaN(count)) {
            throw { message: "'count' must be a valid number.", count: count };
        }

        if (cacheFailure) {
            throw cacheFailure;
        }

        index = Math.max(index, 0);

        var deferred = createDeferred();
        var returnData = {};
        returnData.value = [];
        var canceled = false;
        var pendingReadRange = null;

        var readMore = function (readIndex, readCount) {
            if (!canceled) {
                if (count > 0 && returnData.value.length >= count) {
                    deferred.resolve(returnData);
                } else {
                    pendingReadRange = that.readRange(readIndex, readCount).then(function (data) {
                        if (data["@odata.context"] && !returnData["@odata.context"]) {
                            returnData["@odata.context"] = data["@odata.context"];
                        }
                        
                        for (var i = 0, length = data.value.length; i < length && (count < 0 || returnData.value.length < count); i++) {
                            var dataIndex = backwards ? length - i - 1 : i;
                            var item = data.value[dataIndex];
                            if (predicate(item)) {
                                var element = {
                                    index: readIndex + dataIndex,
                                    item: item
                                };

                                backwards ? returnData.value.unshift(element) : returnData.value.push(element);
                            }
                        }

                        // Have we reached the end of the collection?
                        if ((!backwards && data.value.length < readCount) || (backwards && readIndex <= 0)) {
                            deferred.resolve(returnData);
                        } else {
                            var nextIndex = backwards ? Math.max(readIndex - pageSize, 0) : readIndex + readCount;
                            readMore(nextIndex, pageSize);
                        }
                    }, function (err) {
                        deferred.reject(err);
                    });
                }
            }
        };

        // Initially, we read from the given starting index to the next/previous page boundary
        var initialPage = snapToPageBoundaries(index, index, pageSize);
        var initialIndex = backwards ? initialPage.i : index;
        var initialCount = backwards ? index - initialPage.i + 1 : initialPage.i + initialPage.c - index;
        readMore(initialIndex, initialCount);

        return extend(deferred.promise(), {
            /** Aborts the filter operation (used within promise callback)
            * @method DataCache#cancelFilter
             */
            cancel: function () {

                if (pendingReadRange) {
                    pendingReadRange.cancel();
                }
                canceled = true;
            }
        });
    };

    /** Fires an onidle event if any functions are assigned.
     * @method DataCache~fireOnIdle
    */
    var fireOnIdle = function () {

        if (that.onidle && pendingOperations === 0) {
            that.onidle();
        }
    };

    /** Creates and starts a new prefetch operation.
     * @method DataCache~prefetch
     * @param {Number} start - Zero-based index of the items to prefetch.
     * This method is a no-op if any of the following conditions is true:
     *     1.- prefetchSize is 0
     *     2.- All data has been read and stored locally in the cache.
     *     3.- There is already an all data prefetch operation queued.
     *     4.- The cache has run out of available space (overflowed).
    */
    var prefetch = function (start) {
        

        if (allDataLocal || prefetchSize === 0 || overflowed) {
            return;
        }

        djsassert(state === CACHE_STATE_READ, "DataCache.prefetch() - cache is not on the read state, current state: " + state);

        if (prefetchOperations.length === 0 || (prefetchOperations[0] && prefetchOperations[0].c !== -1)) {
            // Merging prefetch operations would be a nice optimization here.
            var op = new DataCacheOperation(prefetchStateMachine, null, true, start, prefetchSize, null, prefetchSize);
            queueAndStart(op, prefetchOperations);
        }
    };

    /** Queues an operation and runs it.
     * @param {DataCacheOperation} op - Operation to queue.
     * @param {Array} queue - Array that will store the operation.
     */
    var queueAndStart = function (op, queue) {

        op.oncomplete = dequeueOperation;
        queue.push(op);
        pendingOperations++;
        op.run(state);
    };

    /** Requests a page from the cache local store.
     * @method DataCache~readPage    
     * @param {Number} key - Zero-based index of the reuqested page.
     * @returns {DjsDeferred} A promise for a found flag and page object with (i)ndex, (c)ount, (d)ata, and (t)icks.
     */
    var readPage = function (key) {

        djsassert(state !== CACHE_STATE_DESTROY, "DataCache.readPage() - cache is on the destroy state");

        var canceled = false;
        var deferred = extend(new DjsDeferred(), {
            /** Aborts the readPage operation. (used within promise callback)
             * @method DataCache#cancelReadPage
             */
            cancel: function () {
                canceled = true;
            }
        });

        var error = storeFailureCallback(deferred, "Read page from store failure");

        store.contains(key, function (contained) {
            if (canceled) {
                return;
            }
            if (contained) {
                store.read(key, function (_, data) {
                    if (!canceled) {
                        deferred.resolve(data !== undefined, data);
                    }
                }, error);
                return;
            }
            deferred.resolve(false);
        }, error);
        return deferred;
    };

    /** Saves a page to the cache local store.
     * @method DataCache~savePage    
     * @param {Number} key - Zero-based index of the requested page.
     * @param {Object} page - Object with (i)ndex, (c)ount, (d)ata, and (t)icks.
     * @returns {DjsDeferred} A promise with no value.
     */
    var savePage = function (key, page) {

        djsassert(state !== CACHE_STATE_DESTROY, "DataCache.savePage() - cache is on the destroy state");
        djsassert(state !== CACHE_STATE_IDLE, "DataCache.savePage() - cache is on the idle state");

        var canceled = false;

        var deferred = extend(new DjsDeferred(), {
            /** Aborts the savePage operation. (used within promise callback)
             * @method DataCache#cancelReadPage
             */
            cancel: function () {
                canceled = true;
            }
        });

        var error = storeFailureCallback(deferred, "Save page to store failure");

        var resolve = function () {
            deferred.resolve(true);
        };

        if (page.c > 0) {
            var pageBytes = estimateSize(page);
            overflowed = cacheSize >= 0 && cacheSize < actualCacheSize + pageBytes;

            if (!overflowed) {
                store.addOrUpdate(key, page, function () {
                    updateSettings(page, pageBytes);
                    saveSettings(resolve, error);
                }, error);
            } else {
                resolve();
            }
        } else {
            updateSettings(page, 0);
            saveSettings(resolve, error);
        }
        return deferred;
    };

    /** Saves the cache's current settings to the local store.
     * @method DataCache~saveSettings    
     * @param {Function} success - Success callback.
     * @param {Function} error - Errror callback.
     */
    var saveSettings = function (success, error) {

        var settings = {
            actualCacheSize: actualCacheSize,
            allDataLocal: allDataLocal,
            cacheSize: cacheSize,
            collectionCount: collectionCount,
            highestSavedPage: highestSavedPage,
            highestSavedPageSize: highestSavedPageSize,
            pageSize: pageSize,
            sourceId: source.identifier,
            version: version
        };

        store.addOrUpdate("__settings", settings, success, error);
    };

    /** Creates a function that handles a store error.
     * @method DataCache~storeFailureCallback    
     * @param {DjsDeferred} deferred - Deferred object to resolve.
     * @returns {Function} Function to use as error callback.
    
     * This function will specifically handle problems when interacting with the store.
     */
    var storeFailureCallback = function (deferred/*, message*/) {
        

        return function (/*error*/) {
            // var console = windo1w.console;
            // if (console && console.log) {
            //    console.log(message);
            //    console.dir(error);
            // }
            deferred.resolve(false);
        };
    };

    /** Updates the cache's settings based on a page object.
     * @method DataCache~updateSettings    
     * @param {Object} page - Object with (i)ndex, (c)ount, (d)ata.
     * @param {Number} pageBytes - Size of the page in bytes.
     */
    var updateSettings = function (page, pageBytes) {

        var pageCount = page.c;
        var pageIndex = page.i;

        // Detect the collection size.
        if (pageCount === 0) {
            if (highestSavedPage === pageIndex - pageSize) {
                collectionCount = highestSavedPage + highestSavedPageSize;
            }
        } else {
            highestSavedPage = Math.max(highestSavedPage, pageIndex);
            if (highestSavedPage === pageIndex) {
                highestSavedPageSize = pageCount;
            }
            actualCacheSize += pageBytes;
            if (pageCount < pageSize && !collectionCount) {
                collectionCount = pageIndex + pageCount;
            }
        }

        // Detect the end of the collection.
        if (!allDataLocal && collectionCount === highestSavedPage + highestSavedPageSize) {
            allDataLocal = true;
        }
    };

    /** State machine describing the behavior for cancelling a read or prefetch operation.
     * @method DataCache~cancelStateMachine    
     * @param {DataCacheOperation} operation - Operation being run.
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
     * @param {Object} [data] - 
     * This state machine contains behavior common to read and prefetch operations.
     */
    var cancelStateMachine = function (operation, opTargetState, cacheState, data) {
        

        var canceled = operation.canceled && opTargetState !== OPERATION_STATE_END;
        if (canceled) {
            if (opTargetState === OPERATION_STATE_CANCEL) {
                // Cancel state.
                // Data is expected to be any pending request made to the cache.
                if (data && data.cancel) {
                    data.cancel();
                }
            }
        }
        return canceled;
    };

    /** State machine describing the behavior of a clear operation.
     * @method DataCache~destroyStateMachine    
     * @param {DataCacheOperation} operation - Operation being run.
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
    
     * Clear operations have the highest priority and can't be interrupted by other operations; however,
     * they will preempt any other operation currently executing.
     */
    var destroyStateMachine = function (operation, opTargetState, cacheState) {
        

        var transition = operation.transition;

        // Signal the cache that a clear operation is running.
        if (cacheState !== CACHE_STATE_DESTROY) {
            changeState(CACHE_STATE_DESTROY);
            return true;
        }

        switch (opTargetState) {
            case OPERATION_STATE_START:
                // Initial state of the operation.
                transition(DESTROY_STATE_CLEAR);
                break;

            case OPERATION_STATE_END:
                // State that signals the operation is done.
                fireOnIdle();
                break;

            case DESTROY_STATE_CLEAR:
                // State that clears all the local data of the cache.
                clearStore().then(function () {
                    // Terminate the operation once the local store has been cleared.
                    operation.complete();
                });
                // Wait until the clear request completes.
                operation.wait();
                break;

            default:
                return false;
        }
        return true;
    };

    /** State machine describing the behavior of a prefetch operation.
     * @method DataCache~prefetchStateMachine    
     * @param {DataCacheOperation} operation - Operation being run.
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
     * @param {Object} [data] - 
    
     *  Prefetch operations have the lowest priority and will be interrupted by operations of
     *  other kinds. A preempted prefetch operation will resume its execution only when the state
     *  of the cache returns to idle.
     * 
     *  If a clear operation starts executing then all the prefetch operations are canceled,
     *  even if they haven't started executing yet.
     */
    var prefetchStateMachine = function (operation, opTargetState, cacheState, data) {
        

        // Handle cancelation
        if (!cancelStateMachine(operation, opTargetState, cacheState, data)) {

            var transition = operation.transition;

            // Handle preemption
            if (cacheState !== CACHE_STATE_PREFETCH) {
                if (cacheState === CACHE_STATE_DESTROY) {
                    if (opTargetState !== OPERATION_STATE_CANCEL) {
                        operation.cancel();
                    }
                } else if (cacheState === CACHE_STATE_IDLE) {
                    // Signal the cache that a prefetch operation is running.
                    changeState(CACHE_STATE_PREFETCH);
                }
                return true;
            }

            switch (opTargetState) {
                case OPERATION_STATE_START:
                    // Initial state of the operation.
                    if (prefetchOperations[0] === operation) {
                        transition(READ_STATE_LOCAL, operation.i);
                    }
                    break;

                case READ_STATE_DONE:
                    // State that determines if the operation can be resolved or has to
                    // continue processing.
                    // Data is expected to be the read page.
                    var pending = operation.pending;

                    if (pending > 0) {
                        pending -= Math.min(pending, data.c);
                    }

                    // Are we done, or has all the data been stored?
                    if (allDataLocal || pending === 0 || data.c < pageSize || overflowed) {
                        operation.complete();
                    } else {
                        // Continue processing the operation.
                        operation.pending = pending;
                        transition(READ_STATE_LOCAL, data.i + pageSize);
                    }
                    break;

                default:
                    return readSaveStateMachine(operation, opTargetState, cacheState, data, true);
            }
        }
        return true;
    };

    /** State machine describing the behavior of a read operation.
     * @method DataCache~readStateMachine    
     * @param {DataCacheOperation} operation - Operation being run.
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
     * @param {Object} [data] - 
    
     * Read operations have a higher priority than prefetch operations, but lower than
     * clear operations. They will preempt any prefetch operation currently running
     * but will be interrupted by a clear operation.
     *          
     * If a clear operation starts executing then all the currently running
     * read operations are canceled. Read operations that haven't started yet will
     * wait in the start state until the destory operation finishes.
     */
    var readStateMachine = function (operation, opTargetState, cacheState, data) {
        

        // Handle cancelation
        if (!cancelStateMachine(operation, opTargetState, cacheState, data)) {

            var transition = operation.transition;

            // Handle preemption
            if (cacheState !== CACHE_STATE_READ && opTargetState !== OPERATION_STATE_START) {
                if (cacheState === CACHE_STATE_DESTROY) {
                    if (opTargetState !== OPERATION_STATE_START) {
                        operation.cancel();
                    }
                } else if (cacheState !== CACHE_STATE_WRITE) {
                    // Signal the cache that a read operation is running.
                    djsassert(state == CACHE_STATE_IDLE || state === CACHE_STATE_PREFETCH, "DataCache.readStateMachine() - cache is not on the read or idle state.");
                    changeState(CACHE_STATE_READ);
                }

                return true;
            }

            switch (opTargetState) {
                case OPERATION_STATE_START:
                    // Initial state of the operation.
                    // Wait until the cache is idle or prefetching.
                    if (cacheState === CACHE_STATE_IDLE || cacheState === CACHE_STATE_PREFETCH) {
                        // Signal the cache that a read operation is running.
                        changeState(CACHE_STATE_READ);
                        if (operation.c >= 0) {
                            // Snap the requested range to a page boundary.
                            var range = snapToPageBoundaries(operation.i, operation.c, pageSize);
                            transition(READ_STATE_LOCAL, range.i);
                        } else {
                            transition(READ_STATE_DONE, operation);
                        }
                    }
                    break;

                case READ_STATE_DONE:
                    // State that determines if the operation can be resolved or has to
                    // continue processing.
                    // Data is expected to be the read page.
                    appendPage(operation, data);
                    var len = getJsonValueArraryLength(operation.d);
                    // Are we done?
                    if (operation.c === len || data.c < pageSize) {
                        // Update the stats, request for a prefetch operation.
                        stats.cacheReads++;
                        prefetch(data.i + data.c);
                        // Terminate the operation.
                        operation.complete();
                    } else {
                        // Continue processing the operation.
                        transition(READ_STATE_LOCAL, data.i + pageSize);
                    }
                    break;

                default:
                    return readSaveStateMachine(operation, opTargetState, cacheState, data, false);
            }
        }

        return true;
    };

    /** State machine describing the behavior for reading and saving data into the cache.
     * @method DataCache~readSaveStateMachine    
     * @param {DataCacheOperation} operation - Operation being run.
     * @param {Object} opTargetState - Operation state to transition to.
     * @param {Object} cacheState - Current cache state.
     * @param {Object} [data] - 
     * @param {Boolean} isPrefetch - Flag indicating whether a read (false) or prefetch (true) operation is running.
     * This state machine contains behavior common to read and prefetch operations.
    */
    var readSaveStateMachine = function (operation, opTargetState, cacheState, data, isPrefetch) {

        var error = operation.error;
        var transition = operation.transition;
        var wait = operation.wait;
        var request;

        switch (opTargetState) {
            case OPERATION_STATE_END:
                // State that signals the operation is done.
                fireOnIdle();
                break;

            case READ_STATE_LOCAL:
                // State that requests for a page from the local store.
                // Data is expected to be the index of the page to request.
                request = readPage(data).then(function (found, page) {
                    // Signal the cache that a read operation is running.
                    if (!operation.canceled) {
                        if (found) {
                            // The page is in the local store, check if the operation can be resolved.
                            transition(READ_STATE_DONE, page);
                        } else {
                            // The page is not in the local store, request it from the source.
                            transition(READ_STATE_SOURCE, data);
                        }
                    }
                });
                break;

            case READ_STATE_SOURCE:
                // State that requests for a page from the cache source.
                // Data is expected to be the index of the page to request.
                request = fetchPage(data).then(function (page) {
                    // Signal the cache that a read operation is running.
                    if (!operation.canceled) {
                        // Update the stats and save the page to the local store.
                        if (isPrefetch) {
                            stats.prefetches++;
                        } else {
                            stats.netReads++;
                        }
                        transition(READ_STATE_SAVE, page);
                    }
                }, error);
                break;

            case READ_STATE_SAVE:
                // State that saves a  page to the local store.
                // Data is expected to be the page to save.
                // Write access to the store is exclusive.
                if (cacheState !== CACHE_STATE_WRITE) {
                    changeState(CACHE_STATE_WRITE);
                    request = savePage(data.i, data).then(function (saved) {
                        if (!operation.canceled) {
                            if (!saved && isPrefetch) {
                                operation.pending = 0;
                            }
                            // Check if the operation can be resolved.
                            transition(READ_STATE_DONE, data);
                        }
                        changeState(CACHE_STATE_IDLE);
                    });
                }
                break;

            default:
                // Unknown state that can't be handled by this state machine.
                return false;
        }

        if (request) {
            // The operation might have been canceled between stack frames do to the async calls.
            if (operation.canceled) {
                request.cancel();
            } else if (operation.s === opTargetState) {
                // Wait for the request to complete.
                wait(request);
            }
        }

        return true;
    };

    // Initialize the cache.
    store.read("__settings", function (_, settings) {
        if (assigned(settings)) {
            var settingsVersion = settings.version;
            if (!settingsVersion || settingsVersion.indexOf("1.") !== 0) {
                cacheFailureCallback("Unsupported cache store version " + settingsVersion)();
                return;
            }

            if (pageSize !== settings.pageSize || source.identifier !== settings.sourceId) {
                // The shape or the source of the data was changed so invalidate the store.
                clearStore().then(function () {
                    // Signal the cache is fully initialized.
                    changeState(CACHE_STATE_IDLE);
                }, cacheFailureCallback("Unable to clear store during initialization"));
            } else {
                // Restore the saved settings.
                actualCacheSize = settings.actualCacheSize;
                allDataLocal = settings.allDataLocal;
                cacheSize = settings.cacheSize;
                collectionCount = settings.collectionCount;
                highestSavedPage = settings.highestSavedPage;
                highestSavedPageSize = settings.highestSavedPageSize;
                version = settingsVersion;

                // Signal the cache is fully initialized.
                changeState(CACHE_STATE_IDLE);
            }
        } else {
            // This is a brand new cache.
            saveSettings(function () {
                // Signal the cache is fully initialized.
                changeState(CACHE_STATE_IDLE);
            }, cacheFailureCallback("Unable to write settings during initialization."));
        }
    }, cacheFailureCallback("Unable to read settings from store."));

    return that;
}

/** Creates a data cache for a collection that is efficiently loaded on-demand.
 * @param options 
 * Options for the data cache, including name, source, pageSize, TODO check doku
 * prefetchSize, cacheSize, storage mechanism, and initial prefetch and local-data handler.
 * @returns {DataCache} A new data cache instance.
 */
function createDataCache (options) {
    checkUndefinedGreaterThanZero(options.pageSize, "pageSize");
    checkUndefinedOrNumber(options.cacheSize, "cacheSize");
    checkUndefinedOrNumber(options.prefetchSize, "prefetchSize");

    if (!assigned(options.name)) {
        throw { message: "Undefined or null name", options: options };
    }

    if (!assigned(options.source)) {
        throw { message: "Undefined source", options: options };
    }

    return new DataCache(options);
}


/** estimateSize (see {@link estimateSize}) */
exports.estimateSize = estimateSize;

/** createDataCache */  
exports.createDataCache = createDataCache;



}, "source" : function(exports, module, require) {
'use strict';

 /** @module cache/source */
 
var utils = require("./../utils.js");
var odataRequest = require("./../odata.js");

var parseInt10 = utils.parseInt10;
var normalizeURICase = utils.normalizeURICase;




/** Appends the specified escaped query option to the specified URI.
 * @param {String} uri - URI to append option to.
 * @param {String} queryOption - Escaped query option to append.
 */
function appendQueryOption(uri, queryOption) {
    var separator = (uri.indexOf("?") >= 0) ? "&" : "?";
    return uri + separator + queryOption;
}

/** Appends the specified segment to the given URI.
 * @param {String} uri - URI to append a segment to.
 * @param {String} segment - Segment to append.
 * @returns {String} The original URI with a new segment appended.
 */
function appendSegment(uri, segment) {
    var index = uri.indexOf("?");
    var queryPortion = "";
    if (index >= 0) {
        queryPortion = uri.substr(index);
        uri = uri.substr(0, index);
    }

    if (uri[uri.length - 1] !== "/") {
        uri += "/";
    }
    return uri + segment + queryPortion;
}

/** Builds a request object to GET the specified URI.
 * @param {String} uri - URI for request.
 * @param {Object} options - Additional options.
 */
function buildODataRequest(uri, options) {
    return {
        method: "GET",
        requestUri: uri,
        user: options.user,
        password: options.password,
        enableJsonpCallback: options.enableJsonpCallback,
        callbackParameterName: options.callbackParameterName,
        formatQueryString: options.formatQueryString
    };
}

/** Finds the index where the value of a query option starts.
 * @param {String} uri - URI to search in.
 * @param {String} name - Name to look for.
 * @returns {Number} The index where the query option starts.
 */
function findQueryOptionStart(uri, name) {
    var result = -1;
    var queryIndex = uri.indexOf("?");
    if (queryIndex !== -1) {
        var start = uri.indexOf("?" + name + "=", queryIndex);
        if (start === -1) {
            start = uri.indexOf("&" + name + "=", queryIndex);
        }
        if (start !== -1) {
            result = start + name.length + 2;
        }
    }
    return result;
}

/** Gets data from an OData service.
 * @param {String} uri - URI to the OData service.
 * @param {Object} options - Object with additional well-known request options.
 * @param {Function} success - Success callback.
 * @param {Function} error - Error callback.
 * @returns {Object} Object with an abort method.
 */
function queryForData (uri, options, success, error) {
    return queryForDataInternal(uri, options, {}, success, error);
}

/** Gets data from an OData service taking into consideration server side paging.
 * @param {String} uri - URI to the OData service.
 * @param {Object} options - Object with additional well-known request options.
 * @param {Array} data - Array that stores the data provided by the OData service.
 * @param {Function} success - Success callback.
 * @param {Function} error - Error callback.
 * @returns {Object} Object with an abort method.
 */
function queryForDataInternal(uri, options, data, success, error) {

    var request = buildODataRequest(uri, options);
    var currentRequest = odataRequest.request(request, function (newData) {
        var nextLink = newData["@odata.nextLink"];
        if (nextLink) {
            var index = uri.indexOf(".svc/", 0);
            if (index != -1) {
                nextLink = uri.substring(0, index + 5) + nextLink;
            }
        }

        if (data.value && newData.value) {
            data.value = data.value.concat(newData.value);
        }
        else {
            for (var property in newData) {
                if (property != "@odata.nextLink") {
                    data[property] = newData[property];
                }
            }
        }

        if (nextLink) {
            currentRequest = queryForDataInternal(nextLink, options, data, success, error);
        }
        else {
            success(data);
        }
    }, error, undefined, options.httpClient, options.metadata);

    return {
        abort: function () {
            currentRequest.abort();
        }
    };
}

/** Creates a data cache source object for requesting data from an OData service.
 * @class ODataCacheSource
 * @param options - Options for the cache data source.
 * @returns {ODataCacheSource} A new data cache source instance.
 */
function ODataCacheSource (options) {
    var that = this;
    var uri = options.source;
    
    that.identifier = normalizeURICase(encodeURI(decodeURI(uri)));
    that.options = options;

    /** Gets the number of items in the collection.
     * @method ODataCacheSource#count
     * @param {Function} success - Success callback with the item count.
     * @param {Function} error - Error callback.
     * @returns {Object} Request object with an abort method.
     */
    that.count = function (success, error) {
        var options = that.options;
        return odataRequest.request(
            buildODataRequest(appendSegment(uri, "$count"), options),
            function (data) {
                var count = parseInt10(data.toString());
                if (isNaN(count)) {
                    error({ message: "Count is NaN", count: count });
                } else {
                    success(count);
                }
            }, error, undefined, options.httpClient, options.metadata
        );
    };
    
    /** Gets a number of consecutive items from the collection.
     * @method ODataCacheSource#read
     * @param {Number} index - Zero-based index of the items to retrieve.
     * @param {Number} count - Number of items to retrieve.
     * @param {Function} success - Success callback with the requested items.
     * @param {Function} error - Error callback.
     * @returns {Object} Request object with an abort method.
    */
    that.read = function (index, count, success, error) {

        var queryOptions = "$skip=" + index + "&$top=" + count;
        return queryForData(appendQueryOption(uri, queryOptions), that.options, success, error);
    };

    return that;
}



/** ODataCacheSource (see {@link ODataCacheSource}) */
exports.ODataCacheSource = ODataCacheSource;}, "deferred" : function(exports, module, require) {
'use strict';

/** @module odatajs/deferred */



/** Creates a new function to forward a call.
 * @param {Object} thisValue - Value to use as the 'this' object.
 * @param {String} name - Name of function to forward to.
 * @param {Object} returnValue - Return value for the forward call (helps keep identity when chaining calls).
 * @returns {Function} A new function that will forward a call.
 */
function forwardCall(thisValue, name, returnValue) {
    return function () {
        thisValue[name].apply(thisValue, arguments);
        return returnValue;
    };
}

/** Initializes a new DjsDeferred object.
 * <ul>
 * <li> Compability Note A - Ordering of callbacks through chained 'then' invocations <br>
 *
 * The Wiki entry at http://wiki.commonjs.org/wiki/Promises/A
 * implies that .then() returns a distinct object.
 *
 * For compatibility with http://api.jquery.com/category/deferred-object/
 * we return this same object. This affects ordering, as
 * the jQuery version will fire callbacks in registration
 * order regardless of whether they occur on the result
 * or the original object.
 * </li>
 * <li>Compability Note B - Fulfillment value <br>
 *
 * The Wiki entry at http://wiki.commonjs.org/wiki/Promises/A
 * implies that the result of a success callback is the
 * fulfillment value of the object and is received by
 * other success callbacks that are chained.
 *
 * For compatibility with http://api.jquery.com/category/deferred-object/
 * we disregard this value instead.
 * </li></ul>
 * @class DjsDeferred 
 */
 function DjsDeferred() {
    this._arguments = undefined;
    this._done = undefined;
    this._fail = undefined;
    this._resolved = false;
    this._rejected = false;
}


DjsDeferred.prototype = {

    /** Adds success and error callbacks for this deferred object.
     * See Compatibility Note A.
     * @method DjsDeferred#then
     * @param {function} [fulfilledHandler] - Success callback ( may be null)
     * @param {function} [errorHandler] - Error callback ( may be null)
     */
    then: function (fulfilledHandler, errorHandler) {

        if (fulfilledHandler) {
            if (!this._done) {
                this._done = [fulfilledHandler];
            } else {
                this._done.push(fulfilledHandler);
            }
        }

        if (errorHandler) {
            if (!this._fail) {
                this._fail = [errorHandler];
            } else {
                this._fail.push(errorHandler);
            }
        }

        //// See Compatibility Note A in the DjsDeferred constructor.
        //// if (!this._next) {
        ////    this._next = createDeferred();
        //// }
        //// return this._next.promise();

        if (this._resolved) {
            this.resolve.apply(this, this._arguments);
        } else if (this._rejected) {
            this.reject.apply(this, this._arguments);
        }

        return this;
    },

    /** Invokes success callbacks for this deferred object.
     * All arguments are forwarded to success callbacks.
     * @method DjsDeferred#resolve
     */
    resolve: function (/* args */) {
        if (this._done) {
            var i, len;
            for (i = 0, len = this._done.length; i < len; i++) {
                //// See Compability Note B - Fulfillment value.
                //// var nextValue =
                this._done[i].apply(null, arguments);
            }

            //// See Compatibility Note A in the DjsDeferred constructor.
            //// this._next.resolve(nextValue);
            //// delete this._next;

            this._done = undefined;
            this._resolved = false;
            this._arguments = undefined;
        } else {
            this._resolved = true;
            this._arguments = arguments;
        }
    },

    /** Invokes error callbacks for this deferred object.
     * All arguments are forwarded to error callbacks.
     * @method DjsDeferred#reject
     */
    reject: function (/* args */) {
        
        if (this._fail) {
            var i, len;
            for (i = 0, len = this._fail.length; i < len; i++) {
                this._fail[i].apply(null, arguments);
            }

            this._fail = undefined;
            this._rejected = false;
            this._arguments = undefined;
        } else {
            this._rejected = true;
            this._arguments = arguments;
        }
    },

    /** Returns a version of this object that has only the read-only methods available.
     * @method DjsDeferred#promise
     * @returns An object with only the promise object.
     */

    promise: function () {
        var result = {};
        result.then = forwardCall(this, "then", result);
        return result;
    }
};

/** Creates a deferred object.
 * @returns {DjsDeferred} A new deferred object. If jQuery is installed, then a jQueryDeferred object is returned, which provides a superset of features.
*/
function createDeferred() {
    if (window.jQuery && window.jQuery.Deferred) {
        return new window.jQuery.Deferred();
    } else {
        return new DjsDeferred();
    }
}




/** createDeferred (see {@link module:datajs/deferred~createDeferred}) */
exports.createDeferred = createDeferred;

/** DjsDeferred (see {@link DjsDeferred}) */
exports.DjsDeferred = DjsDeferred;}, "odata" : function(exports, module, require) {
'use strict';

 /** @module odata */

// Imports
var odataUtils    = exports.utils     = require('./odata/odatautils.js');
var odataHandler  = exports.handler   = require('./odata/handler.js');
var odataMetadata = exports.metadata  = require('./odata/metadata.js');
var odataNet      = exports.net       = require('./odata/net.js');
var odataJson     = exports.json      = require('./odata/json.js');
                    exports.batch     = require('./odata/batch.js');
                    


var utils = require('./utils.js');
var assigned = utils.assigned;

var defined = utils.defined;
var throwErrorCallback = utils.throwErrorCallback;

var invokeRequest = odataUtils.invokeRequest;
var MAX_DATA_SERVICE_VERSION = odataHandler.MAX_DATA_SERVICE_VERSION;
var prepareRequest = odataUtils.prepareRequest;
var metadataParser = odataMetadata.metadataParser;

// CONTENT START

var handlers = [odataJson.jsonHandler, odataHandler.textHandler];

/** Dispatches an operation to handlers.
 * @param {String} handlerMethod - Name of handler method to invoke.
 * @param {Object} requestOrResponse - request/response argument for delegated call.
 * @param {Object} context - context argument for delegated call.
 */
function dispatchHandler(handlerMethod, requestOrResponse, context) {

    var i, len;
    for (i = 0, len = handlers.length; i < len && !handlers[i][handlerMethod](requestOrResponse, context); i++) {
    }

    if (i === len) {
        throw { message: "no handler for data" };
    }
}

/** Default success handler for OData.
 * @param data - Data to process.
 */
exports.defaultSuccess = function (data) {

    window.alert(window.JSON.stringify(data));
};

exports.defaultError = throwErrorCallback;

exports.defaultHandler = {

        /** Reads the body of the specified response by delegating to JSON handlers.
        * @param response - Response object.
        * @param context - Operation context.
        */
        read: function (response, context) {

            if (response && assigned(response.body) && response.headers["Content-Type"]) {
                dispatchHandler("read", response, context);
            }
        },

        /** Write the body of the specified request by delegating to JSON handlers.
        * @param request - Reques tobject.
        * @param context - Operation context.
        */
        write: function (request, context) {

            dispatchHandler("write", request, context);
        },

        maxDataServiceVersion: MAX_DATA_SERVICE_VERSION,
        accept: "application/json;q=0.9, */*;q=0.1"
    };

exports.defaultMetadata = []; //TODO check why is the defaultMetadata an Array? and not an Object.

/** Reads data from the specified URL.
 * @param urlOrRequest - URL to read data from.
 * @param {Function} [success] - 
 * @param {Function} [error] - 
 * @param {Object} [handler] - 
 * @param {Object} [httpClient] - 
 * @param {Object} [metadata] - 
 */
exports.read = function (urlOrRequest, success, error, handler, httpClient, metadata) {

    var request;
    if (urlOrRequest instanceof String || typeof urlOrRequest === "string") {
        request = { requestUri: urlOrRequest };
    } else {
        request = urlOrRequest;
    }

    return exports.request(request, success, error, handler, httpClient, metadata);
};

/** Sends a request containing OData payload to a server.
 * @param {Object} request - Object that represents the request to be sent.
 * @param {Function} [success] - 
 * @param {Function} [error] - 
 * @param {Object} [handler] - 
 * @param {Object} [httpClient] - 
 * @param {Object} [metadata] - 
 */
exports.request = function (request, success, error, handler, httpClient, metadata) {

    success = success || exports.defaultSuccess;
    error = error || exports.defaultError;
    handler = handler || exports.defaultHandler;
    httpClient = httpClient || odataNet.defaultHttpClient;
    metadata = metadata || exports.defaultMetadata;

    // Augment the request with additional defaults.
    request.recognizeDates = utils.defined(request.recognizeDates, odataJson.jsonHandler.recognizeDates);
    request.callbackParameterName = utils.defined(request.callbackParameterName, odataNet.defaultHttpClient.callbackParameterName);
    request.formatQueryString = utils.defined(request.formatQueryString, odataNet.defaultHttpClient.formatQueryString);
    request.enableJsonpCallback = utils.defined(request.enableJsonpCallback, odataNet.defaultHttpClient.enableJsonpCallback);

    // Create the base context for read/write operations, also specifying complete settings.
    var context = {
        metadata: metadata,
        recognizeDates: request.recognizeDates,
        callbackParameterName: request.callbackParameterName,
        formatQueryString: request.formatQueryString,
        enableJsonpCallback: request.enableJsonpCallback
    };

    try {
        odataUtils.prepareRequest(request, handler, context);
        return odataUtils.invokeRequest(request, success, error, handler, httpClient, context);
    } catch (err) {
        // errors in success handler for sync requests are catched here and result in error handler calls. 
        // So here we fix this and throw that error further.
        if (err.bIsSuccessHandlerError) {
            throw err;
        } else {
            error(err);
        }
    }

};

/** Parses the csdl metadata to ODataJS metatdata format. This method can be used when the metadata is retrieved using something other than odatajs
 * @param {string} csdlMetadataDocument - A string that represents the entire csdl metadata.
 * @returns {Object} An object that has the representation of the metadata in odatajs format.
 */
exports.parseMetadata = function (csdlMetadataDocument) {

    return metadataParser(null, csdlMetadataDocument);
};

// Configure the batch handler to use the default handler for the batch parts.
exports.batch.batchHandler.partHandler = exports.defaultHandler;
exports.metadataHandler =  odataMetadata.metadataHandler;
exports.jsonHandler =  odataJson.jsonHandler;
}, "batch" : function(exports, module, require) {
'use strict';

/** @module odata/batch */

var utils    = require('./../utils.js');
var odataUtils    = require('./odatautils.js');
var odataHandler = require('./handler.js');

var extend = utils.extend;
var isArray = utils.isArray;
var trimString = utils.trimString;

var contentType = odataHandler.contentType;
var handler = odataHandler.handler;
var isBatch = odataUtils.isBatch;
var MAX_DATA_SERVICE_VERSION = odataHandler.MAX_DATA_SERVICE_VERSION;
var normalizeHeaders = odataUtils.normalizeHeaders;
//TODO var payloadTypeOf = odata.payloadTypeOf;
var prepareRequest = odataUtils.prepareRequest;


// Imports

// CONTENT START
var batchMediaType = "multipart/mixed";
var responseStatusRegex = /^HTTP\/1\.\d (\d{3}) (.*)$/i;
var responseHeaderRegex = /^([^()<>@,;:\\"\/[\]?={} \t]+)\s?:\s?(.*)/;

/** Calculates a random 16 bit number and returns it in hexadecimal format.
 * @returns {String} A 16-bit number in hex format.
 */
function hex16() {

    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substr(1);
}

/** Creates a string that can be used as a multipart request boundary.
 * @param {String} [prefix] - 
 * @returns {String} Boundary string of the format: <prefix><hex16>-<hex16>-<hex16>
 */
function createBoundary(prefix) {

    return prefix + hex16() + "-" + hex16() + "-" + hex16();
}

/** Gets the handler for data serialization of individual requests / responses in a batch.
 * @param context - Context used for data serialization.
 * @returns Handler object
 */
function partHandler(context) {

    return context.handler.partHandler;
}

/** Gets the current boundary used for parsing the body of a multipart response.
 * @param context - Context used for parsing a multipart response.
 * @returns {String} Boundary string.
 */
function currentBoundary(context) {
    var boundaries = context.boundaries;
    return boundaries[boundaries.length - 1];
}

/** Parses a batch response.
 * @param handler - This handler.
 * @param {String} text - Batch text.
 * @param {Object} context - Object with parsing context.
 * @return An object representation of the batch.
 */
function batchParser(handler, text, context) {

    var boundary = context.contentType.properties["boundary"];
    return { __batchResponses: readBatch(text, { boundaries: [boundary], handlerContext: context }) };
}

/** Serializes a batch object representation into text.
 * @param handler - This handler.
 * @param {Object} data - Representation of a batch.
 * @param {Object} context - Object with parsing context.
 * @return An text representation of the batch object; undefined if not applicable.#
 */
function batchSerializer(handler, data, context) {

    var cType = context.contentType = context.contentType || contentType(batchMediaType);
    if (cType.mediaType === batchMediaType) {
        return writeBatch(data, context);
    }
}

/** Parses a multipart/mixed response body from from the position defined by the context.
 * @param {String}  text - Body of the multipart/mixed response.
 * @param context - Context used for parsing.
 * @return Array of objects representing the individual responses.
 */
function readBatch(text, context) {
    var delimiter = "--" + currentBoundary(context);

    // Move beyond the delimiter and read the complete batch
    readTo(text, context, delimiter);

    // Ignore the incoming line
    readLine(text, context);

    // Read the batch parts
    var responses = [];
    var partEnd = null;

    while (partEnd !== "--" && context.position < text.length) {
        var partHeaders = readHeaders(text, context);
        var partContentType = contentType(partHeaders["Content-Type"]);

        var changeResponses;
        if (partContentType && partContentType.mediaType === batchMediaType) {
            context.boundaries.push(partContentType.properties.boundary);
            try {
                changeResponses = readBatch(text, context);
            } catch (e) {
                e.response = readResponse(text, context, delimiter);
                changeResponses = [e];
            }
            responses.push({ __changeResponses: changeResponses });
            context.boundaries.pop();
            readTo(text, context, "--" + currentBoundary(context));
        } else {
            if (!partContentType || partContentType.mediaType !== "application/http") {
                throw { message: "invalid MIME part type " };
            }
            // Skip empty line
            readLine(text, context);
            // Read the response
            var response = readResponse(text, context, delimiter);
            try {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    partHandler(context.handlerContext).read(response, context.handlerContext);
                } else {
                    // Keep track of failed responses and continue processing the batch.
                    response = { message: "HTTP request failed", response: response };
                }
            } catch (e) {
                response = e;
            }

            responses.push(response);
        }

        partEnd = text.substr(context.position, 2);

        // Ignore the incoming line.
        readLine(text, context);
    }
    return responses;
}

/** Parses the http headers in the text from the position defined by the context.
 * @param {String} text - Text containing an http response's headers
 * @param context - Context used for parsing.
 * @returns Object containing the headers as key value pairs.
 * This function doesn't support split headers and it will stop reading when it hits two consecutive line breaks.
*/
function readHeaders(text, context) {
    var headers = {};
    var parts;
    var line;
    var pos;

    do {
        pos = context.position;
        line = readLine(text, context);
        parts = responseHeaderRegex.exec(line);
        if (parts !== null) {
            headers[parts[1]] = parts[2];
        } else {
            // Whatever was found is not a header, so reset the context position.
            context.position = pos;
        }
    } while (line && parts);

    normalizeHeaders(headers);

    return headers;
}

/** Parses an HTTP response.
 * @param {String} text -Text representing the http response.
 * @param context optional - Context used for parsing.
 * @param {String} delimiter -String used as delimiter of the multipart response parts.
 * @return Object representing the http response.
 */
function readResponse(text, context, delimiter) {
    // Read the status line.
    var pos = context.position;
    var match = responseStatusRegex.exec(readLine(text, context));

    var statusCode;
    var statusText;
    var headers;

    if (match) {
        statusCode = match[1];
        statusText = match[2];
        headers = readHeaders(text, context);
        readLine(text, context);
    } else {
        context.position = pos;
    }

    return {
        statusCode: statusCode,
        statusText: statusText,
        headers: headers,
        body: readTo(text, context, "\r\n" + delimiter)
    };
}

/** Returns a substring from the position defined by the context up to the next line break (CRLF).
 * @param {String} text - Input string.
 * @param context - Context used for reading the input string.
 * @returns {String} Substring to the first ocurrence of a line break or null if none can be found. 
 */
function readLine(text, context) {

    return readTo(text, context, "\r\n");
}

/** Returns a substring from the position given by the context up to value defined by the str parameter and increments the position in the context.
 * @param {String} text - Input string.
 * @param context - Context used for reading the input string.
 * @param {String} [str] - Substring to read up to.
 * @returns {String} Substring to the first ocurrence of str or the end of the input string if str is not specified. Null if the marker is not found.
 */
function readTo(text, context, str) {
    var start = context.position || 0;
    var end = text.length;
    if (str) {
        end = text.indexOf(str, start);
        if (end === -1) {
            return null;
        }
        context.position = end + str.length;
    } else {
        context.position = end;
    }

    return text.substring(start, end);
}

/** Serializes a batch request object to a string.
 * @param data - Batch request object in payload representation format
 * @param context - Context used for the serialization
 * @returns {String} String representing the batch request
 */
function writeBatch(data, context) {
    if (!isBatch(data)) {
        throw { message: "Data is not a batch object." };
    }

    var batchBoundary = createBoundary("batch_");
    var batchParts = data.__batchRequests;
    var batch = "";
    var i, len;
    for (i = 0, len = batchParts.length; i < len; i++) {
        batch += writeBatchPartDelimiter(batchBoundary, false) +
                 writeBatchPart(batchParts[i], context);
    }
    batch += writeBatchPartDelimiter(batchBoundary, true);

    // Register the boundary with the request content type.
    var contentTypeProperties = context.contentType.properties;
    contentTypeProperties.boundary = batchBoundary;

    return batch;
}

/** Creates the delimiter that indicates that start or end of an individual request.
 * @param {String} boundary Boundary string used to indicate the start of the request
 * @param {Boolean} close - Flag indicating that a close delimiter string should be generated
 * @returns {String} Delimiter string
 */
function writeBatchPartDelimiter(boundary, close) {
    var result = "\r\n--" + boundary;
    if (close) {
        result += "--";
    }

    return result + "\r\n";
}

/** Serializes a part of a batch request to a string. A part can be either a GET request or
 * a change set grouping several CUD (create, update, delete) requests.
 * @param part - Request or change set object in payload representation format
 * @param context - Object containing context information used for the serialization
 * @param {boolean} [nested] - 
 * @returns {String} String representing the serialized part
 * A change set is an array of request objects and they cannot be nested inside other change sets.
 */
function writeBatchPart(part, context, nested) {
    

    var changeSet = part.__changeRequests;
    var result;
    if (isArray(changeSet)) {
        if (nested) {
            throw { message: "Not Supported: change set nested in other change set" };
        }

        var changeSetBoundary = createBoundary("changeset_");
        result = "Content-Type: " + batchMediaType + "; boundary=" + changeSetBoundary + "\r\n";
        var i, len;
        for (i = 0, len = changeSet.length; i < len; i++) {
            result += writeBatchPartDelimiter(changeSetBoundary, false) +
                 writeBatchPart(changeSet[i], context, true);
        }

        result += writeBatchPartDelimiter(changeSetBoundary, true);
    } else {
        result = "Content-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\n";
        var partContext = extend({}, context);
        partContext.handler = handler;
        partContext.request = part;
        partContext.contentType = null;

        prepareRequest(part, partHandler(context), partContext);
        result += writeRequest(part);
    }

    return result;
}

/** Serializes a request object to a string.
 * @param request - Request object to serialize
 * @returns {String} String representing the serialized request
 */
function writeRequest(request) {
    var result = (request.method ? request.method : "GET") + " " + request.requestUri + " HTTP/1.1\r\n";
    for (var name in request.headers) {
        if (request.headers[name]) {
            result = result + name + ": " + request.headers[name] + "\r\n";
        }
    }

    result += "\r\n";

    if (request.body) {
        result += request.body;
    }

    return result;
}



/** batchHandler (see {@link module:odata/batch~batchParser}) */
exports.batchHandler = handler(batchParser, batchSerializer, batchMediaType, MAX_DATA_SERVICE_VERSION);

/** batchSerializer (see {@link module:odata/batch~batchSerializer}) */
exports.batchSerializer = batchSerializer;

/** writeRequest (see {@link module:odata/batch~writeRequest}) */
exports.writeRequest = writeRequest;}, "handler" : function(exports, module, require) {
'use strict';

/** @module odata/handler */


var utils    = require('./../utils.js');
var oDataUtils    = require('./odatautils.js');

// Imports.
var assigned = utils.assigned;
var extend = utils.extend;
var trimString = utils.trimString;
var maxVersion = oDataUtils.maxVersion;
var MAX_DATA_SERVICE_VERSION = "4.0";

/** Parses a string into an object with media type and properties.
 * @param {String} str - String with media type to parse.
 * @return null if the string is empty; an object with 'mediaType' and a 'properties' dictionary otherwise.
 */
function contentType(str) {

    if (!str) {
        return null;
    }

    var contentTypeParts = str.split(";");
    var properties = {};

    var i, len;
    for (i = 1, len = contentTypeParts.length; i < len; i++) {
        var contentTypeParams = contentTypeParts[i].split("=");
        properties[trimString(contentTypeParams[0])] = contentTypeParams[1];
    }

    return { mediaType: trimString(contentTypeParts[0]), properties: properties };
}

/** Serializes an object with media type and properties dictionary into a string.
 * @param contentType - Object with media type and properties dictionary to serialize.
 * @return String representation of the media type object; undefined if contentType is null or undefined.
 */
function contentTypeToString(contentType) {
    if (!contentType) {
        return undefined;
    }

    var result = contentType.mediaType;
    var property;
    for (property in contentType.properties) {
        result += ";" + property + "=" + contentType.properties[property];
    }
    return result;
}

/** Creates an object that is going to be used as the context for the handler's parser and serializer.
 * @param contentType - Object with media type and properties dictionary.
 * @param {String} dataServiceVersion - String indicating the version of the protocol to use.
 * @param context - Operation context.
 * @param handler - Handler object that is processing a resquest or response.
 * @return Context object.
 */
function createReadWriteContext(contentType, dataServiceVersion, context, handler) {

    var rwContext = {};
    extend(rwContext, context);
    extend(rwContext, {
        contentType: contentType,
        dataServiceVersion: dataServiceVersion,
        handler: handler
    });

    return rwContext;
}

/** Sets a request header's value. If the header has already a value other than undefined, null or empty string, then this method does nothing.
 * @param request - Request object on which the header will be set.
 * @param {String} name - Header name.
 * @param {String} value - Header value.
 */
function fixRequestHeader(request, name, value) {
    if (!request) {
        return;
    }

    var headers = request.headers;
    if (!headers[name]) {
        headers[name] = value;
    }
}

/** Sets the DataServiceVersion header of the request if its value is not yet defined or of a lower version.
 * @param request - Request object on which the header will be set.
 * @param {String} version - Version value.
 *  If the request has already a version value higher than the one supplied the this function does nothing.
 */
function fixDataServiceVersionHeader(request, version) {   

    if (request) {
        var headers = request.headers;
        var dsv = headers["OData-Version"];
        headers["OData-Version"] = dsv ? maxVersion(dsv, version) : version;
    }
}

/** Gets the value of a request or response header.
 * @param requestOrResponse - Object representing a request or a response.
 * @param {String} name - Name of the header to retrieve.
 * @returns {String} String value of the header; undefined if the header cannot be found.
 */
function getRequestOrResponseHeader(requestOrResponse, name) {

    var headers = requestOrResponse.headers;
    return (headers && headers[name]) || undefined;
}

/** Gets the value of the Content-Type header from a request or response.
 * @param requestOrResponse - Object representing a request or a response.
 * @returns {Object} Object with 'mediaType' and a 'properties' dictionary; null in case that the header is not found or doesn't have a value.
 */
function getContentType(requestOrResponse) {

    return contentType(getRequestOrResponseHeader(requestOrResponse, "Content-Type"));
}

var versionRE = /^\s?(\d+\.\d+);?.*$/;
/** Gets the value of the DataServiceVersion header from a request or response.
 * @param requestOrResponse - Object representing a request or a response.
 * @returns {String} Data service version; undefined if the header cannot be found.
 */
function getDataServiceVersion(requestOrResponse) {

    var value = getRequestOrResponseHeader(requestOrResponse, "OData-Version");
    if (value) {
        var matches = versionRE.exec(value);
        if (matches && matches.length) {
            return matches[1];
        }
    }

    // Fall through and return undefined.
}

/** Checks that a handler can process a particular mime type.
 * @param handler - Handler object that is processing a resquest or response.
 * @param cType - Object with 'mediaType' and a 'properties' dictionary.
 * @returns {Boolean} True if the handler can process the mime type; false otherwise.
 *
 * The following check isn't as strict because if cType.mediaType = application/; it will match an accept value of "application/xml";
 * however in practice we don't not expect to see such "suffixed" mimeTypes for the handlers.
 */
function handlerAccepts(handler, cType) {
    return handler.accept.indexOf(cType.mediaType) >= 0;
}

/** Invokes the parser associated with a handler for reading the payload of a HTTP response.
 * @param handler - Handler object that is processing the response.
 * @param {Function} parseCallback - Parser function that will process the response payload.
 * @param response - HTTP response whose payload is going to be processed.
 * @param context - Object used as the context for processing the response.
 * @returns {Boolean} True if the handler processed the response payload and the response.data property was set; false otherwise.
 */
function handlerRead(handler, parseCallback, response, context) {

    if (!response || !response.headers) {
        return false;
    }

    var cType = getContentType(response);
    var version = getDataServiceVersion(response) || "";
    var body = response.body;

    if (!assigned(body)) {
        return false;
    }

    if (handlerAccepts(handler, cType)) {
        var readContext = createReadWriteContext(cType, version, context, handler);
        readContext.response = response;
        response.data = parseCallback(handler, body, readContext);
        return response.data !== undefined;
    }

    return false;
}

/** Invokes the serializer associated with a handler for generating the payload of a HTTP request.
 * @param handler - Handler object that is processing the request.
 * @param {Function} serializeCallback - Serializer function that will generate the request payload.
 * @param request - HTTP request whose payload is going to be generated.
 * @param context - Object used as the context for serializing the request.
 * @returns {Boolean} True if the handler serialized the request payload and the request.body property was set; false otherwise.
 */
function handlerWrite(handler, serializeCallback, request, context) {
    if (!request || !request.headers) {
        return false;
    }

    var cType = getContentType(request);
    var version = getDataServiceVersion(request);

    if (!cType || handlerAccepts(handler, cType)) {
        var writeContext = createReadWriteContext(cType, version, context, handler);
        writeContext.request = request;

        request.body = serializeCallback(handler, request.data, writeContext);

        if (request.body !== undefined) {
            fixDataServiceVersionHeader(request, writeContext.dataServiceVersion || "4.0");

            fixRequestHeader(request, "Content-Type", contentTypeToString(writeContext.contentType));
            fixRequestHeader(request, "OData-MaxVersion", handler.maxDataServiceVersion);
            return true;
        }
    }

    return false;
}

/** Creates a handler object for processing HTTP requests and responses.
 * @param {Function} parseCallback - Parser function that will process the response payload.
 * @param {Function} serializeCallback - Serializer function that will generate the request payload.
 * @param {String} accept - String containing a comma separated list of the mime types that this handler can work with.
 * @param {String} maxDataServiceVersion - String indicating the highest version of the protocol that this handler can work with.
 * @returns {Object} Handler object.
 */
function handler(parseCallback, serializeCallback, accept, maxDataServiceVersion) {

    return {
        accept: accept,
        maxDataServiceVersion: maxDataServiceVersion,

        read: function (response, context) {
            return handlerRead(this, parseCallback, response, context);
        },

        write: function (request, context) {
            return handlerWrite(this, serializeCallback, request, context);
        }
    };
}

function textParse(handler, body /*, context */) {
    return body;
}

function textSerialize(handler, data /*, context */) {
    if (assigned(data)) {
        return data.toString();
    } else {
        return undefined;
    }
}




exports.textHandler = handler(textParse, textSerialize, "text/plain", MAX_DATA_SERVICE_VERSION);
exports.contentType = contentType;
exports.contentTypeToString = contentTypeToString;
exports.handler = handler;
exports.createReadWriteContext = createReadWriteContext;
exports.fixRequestHeader = fixRequestHeader;
exports.getRequestOrResponseHeader = getRequestOrResponseHeader;
exports.getContentType = getContentType;
exports.getDataServiceVersion = getDataServiceVersion;
exports.MAX_DATA_SERVICE_VERSION = MAX_DATA_SERVICE_VERSION;}, "json" : function(exports, module, require) {

/** @module odata/json */



var utils        = require('./../utils.js');
var oDataUtils   = require('./odatautils.js');
var oDataHandler = require('./handler.js');

var odataNs = "odata";
var odataAnnotationPrefix = odataNs + ".";
var contextUrlAnnotation = "@" + odataAnnotationPrefix + "context";

var assigned = utils.assigned;
var defined = utils.defined;
var isArray = utils.isArray;
//var isDate = utils.isDate;
var isObject = utils.isObject;
//var normalizeURI = utils.normalizeURI;
var parseInt10 = utils.parseInt10;
var getFormatKind = utils.getFormatKind;
var convertByteArrayToHexString = utils.convertByteArrayToHexString;


var formatDateTimeOffset = oDataUtils.formatDateTimeOffset;
var formatDuration = oDataUtils.formatDuration;
var formatNumberWidth = oDataUtils.formatNumberWidth;
var getCanonicalTimezone = oDataUtils.getCanonicalTimezone;
var handler = oDataUtils.handler;
var isComplex = oDataUtils.isComplex;
var isPrimitive = oDataUtils.isPrimitive;
var isCollectionType = oDataUtils.isCollectionType;
var lookupComplexType = oDataUtils.lookupComplexType;
var lookupEntityType = oDataUtils.lookupEntityType;
var lookupSingleton = oDataUtils.lookupSingleton;
var lookupEntitySet = oDataUtils.lookupEntitySet;
var lookupDefaultEntityContainer = oDataUtils.lookupDefaultEntityContainer;
var lookupProperty = oDataUtils.lookupProperty;
var MAX_DATA_SERVICE_VERSION = oDataUtils.MAX_DATA_SERVICE_VERSION;
var maxVersion = oDataUtils.maxVersion;

var isPrimitiveEdmType = oDataUtils.isPrimitiveEdmType;
var isGeographyEdmType = oDataUtils.isGeographyEdmType;
var isGeometryEdmType = oDataUtils.isGeometryEdmType;

var PAYLOADTYPE_FEED = "f";
var PAYLOADTYPE_ENTRY = "e";
var PAYLOADTYPE_PROPERTY = "p";
var PAYLOADTYPE_COLLECTION = "c";
var PAYLOADTYPE_ENUMERATION_PROPERTY = "enum";
var PAYLOADTYPE_SVCDOC = "s";
var PAYLOADTYPE_ENTITY_REF_LINK = "erl";
var PAYLOADTYPE_ENTITY_REF_LINKS = "erls";

var PAYLOADTYPE_VALUE = "v";

var PAYLOADTYPE_DELTA = "d";
var DELTATYPE_FEED = "f";
var DELTATYPE_DELETED_ENTRY = "de";
var DELTATYPE_LINK = "l";
var DELTATYPE_DELETED_LINK = "dl";

var jsonMediaType = "application/json";
var jsonContentType = oDataHandler.contentType(jsonMediaType);

var jsonSerializableMetadata = ["@odata.id", "@odata.type"];





/** Extend JSON OData payload with metadata
 * @param handler - This handler.
 * @param text - Payload text (this parser also handles pre-parsed objects).
 * @param {Object} context - Object with parsing context.
 * @return An object representation of the OData payload.
 */
function jsonParser(handler, text, context) {
    var recognizeDates = defined(context.recognizeDates, handler.recognizeDates);
    var model = context.metadata;
    var json = (typeof text === "string") ? JSON.parse(text) : text;
    var metadataContentType;
    if (assigned(context.contentType) && assigned(context.contentType.properties)) {
        metadataContentType = context.contentType.properties["odata.metadata"]; //TODO convert to lower before comparism
    }

    var payloadFormat = getFormatKind(metadataContentType, 1); // none: 0, minimal: 1, full: 2

    // No errors should be throw out if we could not parse the json payload, instead we should just return the original json object.
    if (payloadFormat === 0) {
        return json;
    }
    else if (payloadFormat === 1) {
        return addMinimalMetadataToJsonPayload(json, model, recognizeDates);
    }
    else if (payloadFormat === 2) {
        // to do: using the EDM Model to get the type of each property instead of just guessing.
        return addFullMetadataToJsonPayload(json, model, recognizeDates);
    }
    else {
        return json;
    }
}


















// The regular expression corresponds to something like this:
// /Date(123+60)/
//
// This first number is date ticks, the + may be a - and is optional,
// with the second number indicating a timezone offset in minutes.
//
// On the wire, the leading and trailing forward slashes are
// escaped without being required to so the chance of collisions is reduced;
// however, by the time we see the objects, the characters already
// look like regular forward slashes.
var jsonDateRE = /^\/Date\((-?\d+)(\+|-)?(\d+)?\)\/$/;


// Some JSON implementations cannot produce the character sequence \/
// which is needed to format DateTime and DateTimeOffset into the
// JSON string representation defined by the OData protocol.
// See the history of this file for a candidate implementation of
// a 'formatJsonDateString' function.


var jsonReplacer = function (_, value) {
    /// <summary>JSON replacer function for converting a value to its JSON representation.</summary>
    /// <param value type="Object">Value to convert.</param>
    /// <returns type="String">JSON representation of the input value.</returns>
    /// <remarks>
    ///   This method is used during JSON serialization and invoked only by the JSON.stringify function.
    ///   It should never be called directly.
    /// </remarks>

    if (value && value.__edmType === "Edm.Time") {
        return formatDuration(value);
    } else {
        return value;
    }
};

/** Serializes a ODataJs payload structure to the wire format which can be send to the server
 * @param handler - This handler.
 * @param data - Data to serialize.
 * @param {Object} context - Object with serialization context.
 * @returns {String} The string representation of data.
 */
function jsonSerializer(handler, data, context) {

    var dataServiceVersion = context.dataServiceVersion || "4.0";
    var cType = context.contentType = context.contentType || jsonContentType;

    if (cType && cType.mediaType === jsonContentType.mediaType) {
        context.dataServiceVersion = maxVersion(dataServiceVersion, "4.0");
        var newdata = formatJsonRequestPayload(data);
        if (newdata) {
            return JSON.stringify(newdata,jsonReplacer);
        }
    }
    return undefined;
}




/** Convert OData objects for serialisation in to a new data structure
 * @param data - Data to serialize.
 * @returns {String} The string representation of data.
 */
function formatJsonRequestPayload(data) {
    if (!data) {
        return data;
    }

    if (isPrimitive(data)) {
        return data;
    }

    if (isArray(data)) {
        var newArrayData = [];
        var i, len;
        for (i = 0, len = data.length; i < len; i++) {
            newArrayData[i] = formatJsonRequestPayload(data[i]);
        }

        return newArrayData;
    }

    var newdata = {};
    for (var property in data) {
        if (isJsonSerializableProperty(property)) {
            newdata[property] = formatJsonRequestPayload(data[property]);
        }
    }

    return newdata;
}

/** Determine form the attribute name if the attribute is a serializable property
 * @param attribute
 * @returns {boolean}
 */
function isJsonSerializableProperty(attribute) {
    if (!attribute) {
        return false;
    }

    if (attribute.indexOf("@odata.") == -1) {
        return true;
    }

    var i, len;
    for (i = 0, len = jsonSerializableMetadata.length; i < len; i++) {
        var name = jsonSerializableMetadata[i];
        if (attribute.indexOf(name) != -1) {
            return true;
        }
    }

    return false;
}

/** Creates an object containing information for the json payload.
 * @param {String} kind - JSON payload kind
 * @param {String} type - Type name of the JSON payload.
 * @returns {Object} Object with kind and type fields.
 */
function jsonMakePayloadInfo(kind, type) {
    return { kind: kind, type: type || null };
}



/** Add metadata to an JSON payload complex object containing full metadata
 * @param {Object} data - Data structure to be extended
 * @param {Object} model - Metadata model
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function addFullMetadataToJsonPayload(data, model, recognizeDates) {
    var type;
    if (utils.isObject(data)) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (key.indexOf('@') === -1) {
                    if (utils.isArray(data[key])) {
                        for (var i = 0; i < data[key].length; ++i) {
                            addFullMetadataToJsonPayload(data[key][i], model, recognizeDates);
                        }
                    } else if (utils.isObject(data[key])) {
                        if (data[key] !== null) {
                            //don't step into geo.. objects
                            type = data[key+'@odata.type'];
                            if (!type) {
                                //type unknown
                                addFullMetadataToJsonPayload(data[key], model, recognizeDates);
                            } else {
                                type = type.substring(1);
                                if  (isGeographyEdmType(type) || isGeometryEdmType(type)) {
                                    // don't add type info for geo* types
                                } else {
                                    addFullMetadataToJsonPayload(data[key], model, recognizeDates);
                                }
                            }
                        }
                    } else {
                        type = data[key + '@odata.type'];

                        // On .Net OData library, some basic EDM type is omitted, e.g. Edm.String, Edm.Int, and etc.
                        // For the full metadata payload, we need to full fill the @data.type for each property if it is missing.
                        // We do this is to help the OlingoJS consumers to easily get the type of each property.
                        if (!assigned(type)) {
                            // Guessing the "type" from the type of the value is not the right way here.
                            // To do: we need to get the type from metadata instead of guessing.
                            var typeFromObject = typeof data[key];
                            if (typeFromObject === 'string') {
                                addType(data, key, 'String');
                            } else if (typeFromObject === 'boolean') {
                                addType(data, key, 'Boolean');
                            } else if (typeFromObject === 'number') {
                                if (data[key] % 1 === 0) { // has fraction
                                    addType(data, key, 'Int32'); // the biggst integer
                                } else {
                                    addType(data, key, 'Decimal'); // the biggst float single,doulbe,decimal
                                }
                            }
                        }
                        else {
                            if (recognizeDates) {
                                convertDatesNoEdm(data, key, type.substring(1));
                            }
                        }
                    }
                }
            }
        }
    }

    return data;
}

/** Loop through the properties of an JSON payload object, look up the type info of the property and call
 * the appropriate add*MetadataToJsonPayloadObject function
 * @param {Object} data - Data structure to be extended
 * @param {String} objectInfoType - Information about the data (name,type,typename,...)
 * @param {String} baseURI - Base Url
 * @param {Object} model - Metadata model
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function checkProperties(data, objectInfoType, baseURI, model, recognizeDates) {
    for (var name in data) {
        if (name.indexOf("@") === -1) {
            var curType = objectInfoType;
            var propertyValue = data[name];
            var property = lookupProperty(curType.property,name); //TODO SK add check for parent type

            while (( property === null) && (curType.baseType !== undefined)) {
                curType = lookupEntityType(curType.baseType, model);
                property = lookupProperty(curType.property,name);
            }

            if ( isArray(propertyValue)) {
                //data[name+'@odata.type'] = '#' + property.type;
                if (isCollectionType(property.type)) {
                    addTypeColNoEdm(data,name,property.type.substring(11,property.type.length-1));
                } else {
                    addTypeNoEdm(data,name,property.type);
                }


                for ( var i = 0; i < propertyValue.length; i++) {
                    addMetadataToJsonMinimalPayloadComplex(propertyValue[i], property, baseURI, model, recognizeDates);
                }
            } else if (isObject(propertyValue) && (propertyValue !== null)) {
                addMetadataToJsonMinimalPayloadComplex(propertyValue, property, baseURI, model, recognizeDates);
            } else {
                //data[name+'@odata.type'] = '#' + property.type;
                addTypeNoEdm(data,name,property.type);
                if (recognizeDates) {
                    convertDates(data, name, property.type);
                }
            }
        }
    }
}



/** Add metadata to an JSON payload object containing minimal metadata
 * @param {Object} data - Json response payload object
 * @param {Object} model - Object describing an OData conceptual schema
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 * @returns {Object} Object in the library's representation.
 */
function addMinimalMetadataToJsonPayload(data, model, recognizeDates) {

    if (!assigned(model) || isArray(model)) {
        return data;
    }

    var baseURI = data[contextUrlAnnotation];
    var payloadInfo = createPayloadInfo(data, model);

    switch (payloadInfo.detectedPayloadKind) {

        case PAYLOADTYPE_VALUE:
            if (payloadInfo.type !== null) {
                return addMetadataToJsonMinimalPayloadEntity(data, payloadInfo, baseURI, model, recognizeDates);
            } else {
                return addTypeNoEdm(data,'value', payloadInfo.typeName);
            }

        case PAYLOADTYPE_FEED:
            return addMetadataToJsonMinimalPayloadFeed(data, model, payloadInfo, baseURI, recognizeDates);

        case PAYLOADTYPE_ENTRY:
            return addMetadataToJsonMinimalPayloadEntity(data, payloadInfo, baseURI, model, recognizeDates);

        case PAYLOADTYPE_COLLECTION:
            return addMetadataToJsonMinimalPayloadCollection(data, model, payloadInfo, baseURI, recognizeDates);

        case PAYLOADTYPE_PROPERTY:
            if (payloadInfo.type !== null) {
                return addMetadataToJsonMinimalPayloadEntity(data, payloadInfo, baseURI, model, recognizeDates);
            } else {
                return addTypeNoEdm(data,'value', payloadInfo.typeName);
            }

        case PAYLOADTYPE_SVCDOC:
            return data;

        case PAYLOADTYPE_LINKS:
            return data;
    }

    return data;
}

/** Add metadata to an JSON payload feed object containing minimal metadata
 * @param {Object} data - Data structure to be extended
 * @param {Object} model - Metadata model
 * @param {String} feedInfo - Information about the data (name,type,typename,...)
 * @param {String} baseURI - Base Url
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function addMetadataToJsonMinimalPayloadFeed(data, model, feedInfo, baseURI, recognizeDates) {
    var entries = [];
    var items = data.value;
    var i,len;
    var entry;
    for (i = 0, len = items.length; i < len; i++) {
        var item = items[i];
        if ( defined(item['@odata.type'])) { // in case of mixed feeds
            var typeName = item['@odata.type'].substring(1);
            var type = lookupEntityType( typeName, model);
            var entryInfo = {
                contentTypeOdata : feedInfo.contentTypeOdata,
                detectedPayloadKind : feedInfo.detectedPayloadKind,
                name : feedInfo.name,
                type : type,
                typeName : typeName
            };

            entry = addMetadataToJsonMinimalPayloadEntity(item, entryInfo, baseURI, model, recognizeDates);
        } else {
            entry = addMetadataToJsonMinimalPayloadEntity(item, feedInfo, baseURI, model, recognizeDates);
        }

        entries.push(entry);
    }
    data.value = entries;
    return data;
}


/** Add metadata to an JSON payload entity object containing minimal metadata
 * @param {Object} data - Data structure to be extended
 * @param {String} objectInfo - Information about the data (name,type,typename,...)
 * @param {String} baseURI - Base Url
 * @param {Object} model - Metadata model
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function addMetadataToJsonMinimalPayloadEntity(data, objectInfo, baseURI, model, recognizeDates) {
    addType(data,'',objectInfo.typeName);

    var keyType = objectInfo.type;
    while ((defined(keyType)) && ( keyType.key === undefined) && (keyType.baseType !== undefined)) {
        keyType = lookupEntityType(keyType.baseType, model);
    }

    if (keyType.key !== undefined) {
        var lastIdSegment = objectInfo.name + jsonGetEntryKey(data, keyType);
        data['@odata.id'] = baseURI.substring(0, baseURI.lastIndexOf("$metadata")) + lastIdSegment;
        data['@odata.editLink'] = lastIdSegment;
    }

    //var serviceURI = baseURI.substring(0, baseURI.lastIndexOf("$metadata"));

    checkProperties(data, objectInfo.type, baseURI, model, recognizeDates);

    return data;
}

/** Add metadata to an JSON payload complex object containing minimal metadata
 * @param {Object} data - Data structure to be extended
 * @param {String} property - Information about the data (name,type,typename,...)
 * @param {String} baseURI - Base Url
 * @param {Object} model - Metadata model
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function addMetadataToJsonMinimalPayloadComplex(data, property, baseURI, model, recognizeDates) {
    var type = property.type;
    if (isCollectionType(property.type)) {
        type =property.type.substring(11,property.type.length-1);
    }

    addType(data,'',property.type);

    var propertyType = lookupComplexType(type, model);
    if (propertyType === null)  {
        return; //TODO check what to do if the type is not known e.g. type #GeometryCollection
    }

    checkProperties(data, propertyType, baseURI, model, recognizeDates);
}

/** Add metadata to an JSON payload collection object containing minimal metadata
 * @param {Object} data - Data structure to be extended
 * @param {Object} model - Metadata model
 * @param {String} collectionInfo - Information about the data (name,type,typename,...)
 * @param {String} baseURI - Base Url
 * @param {Boolean} recognizeDates - Flag indicating whether datetime literal strings should be converted to JavaScript Date objects.
 */
function addMetadataToJsonMinimalPayloadCollection(data, model, collectionInfo, baseURI, recognizeDates) {

    addTypeColNoEdm(data,'', collectionInfo.typeName);

    if (collectionInfo.type !== null) {
        var entries = [];

        var items = data.value;
        var i,len;
        var entry;
        for (i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if ( defined(item['@odata.type'])) { // in case of mixed collections
                var typeName = item['@odata.type'].substring(1);
                var type = lookupEntityType( typeName, model);
                var entryInfo = {
                    contentTypeOdata : collectionInfo.contentTypeOdata,
                    detectedPayloadKind : collectionInfo.detectedPayloadKind,
                    name : collectionInfo.name,
                    type : type,
                    typeName : typeName
                };

                entry = addMetadataToJsonMinimalPayloadEntity(item, entryInfo, baseURI, model, recognizeDates);
            } else {
                entry = addMetadataToJsonMinimalPayloadEntity(item, collectionInfo, baseURI, model, recognizeDates);
            }

            entries.push(entry);
        }
        data.value = entries;
    }
    return data;
}

/** Add an OData type tag to an JSON payload object
 * @param {Object} data - Data structure to be extended
 * @param {String} name - Name of the property whose type is set
 * @param {String} value - Type name
 */
function addType(data, name, value ) {
    var fullName = name + '@odata.type';

    if ( data[fullName] === undefined) {
        data[fullName] = '#' + value;
    }
}

/** Add an OData type tag to an JSON payload object collection (without "Edm." namespace)
 * @param {Object} data - Data structure to be extended
 * @param {String} name - Name of the property whose type is set
 * @param {String} typeName - Type name
 */
function addTypeColNoEdm(data, name, typeName ) {
    var fullName = name + '@odata.type';

    if ( data[fullName] === undefined) {
        if ( typeName.substring(0,4)==='Edm.') {
            data[fullName] = '#Collection('+typeName.substring(4)+ ')';
        } else {
            data[fullName] = '#Collection('+typeName+ ')';
        }
    }
}


/** Add an OData type tag to an JSON payload object (without "Edm." namespace)
 * @param {Object} data - Data structure to be extended
 * @param {String} name - Name of the property whose type is set
 * @param {String} value - Type name
 */
function addTypeNoEdm(data, name, value ) {
    var fullName = name + '@odata.type';

    if ( data[fullName] === undefined) {
        if ( value.substring(0,4)==='Edm.') {
            data[fullName] = '#' + value.substring(4);
        } else {
            data[fullName] = '#' + value;
        }
    }
    return data;
}
/** Convert the date/time format of an property from the JSON payload object (without "Edm." namespace)
 * @param {Object} data - Data structure to be extended
 * @param propertyName - Name of the property to be changed
 * @param type - Type
 */
function convertDates(data, propertyName,type) {
    if (type === 'Edm.Date') {
        data[propertyName] = oDataUtils.parseDate(data[propertyName], true);
    } else if (type === 'Edm.DateTimeOffset') {
        data[propertyName] = oDataUtils.parseDateTimeOffset(data[propertyName], true);
    } else if (type === 'Edm.Duration') {
        data[propertyName] = oDataUtils.parseDuration(data[propertyName], true);
    } else if (type === 'Edm.Time') {
        data[propertyName] = oDataUtils.parseTime(data[propertyName], true);
    }
}

/** Convert the date/time format of an property from the JSON payload object
 * @param {Object} data - Data structure to be extended
 * @param propertyName - Name of the property to be changed
 * @param type - Type
 */
function convertDatesNoEdm(data, propertyName,type) {
    if (type === 'Date') {
        data[propertyName] = oDataUtils.parseDate(data[propertyName], true);
    } else if (type === 'DateTimeOffset') {
        data[propertyName] = oDataUtils.parseDateTimeOffset(data[propertyName], true);
    } else if (type === 'Duration') {
        data[propertyName] = oDataUtils.parseDuration(data[propertyName], true);
    } else if (type === 'Time') {
        data[propertyName] = oDataUtils.parseTime(data[propertyName], true);
    }
}

/** Formats a value according to Uri literal format
 * @param value - Value to be formatted.
 * @param type - Edm type of the value
 * @returns {string} Value after formatting
 */
function formatLiteral(value, type) {

    value = "" + formatRawLiteral(value, type);
    value = encodeURIComponent(value.replace("'", "''"));
    switch ((type)) {
        case "Edm.Binary":
            return "X'" + value + "'";
        case "Edm.DateTime":
            return "datetime" + "'" + value + "'";
        case "Edm.DateTimeOffset":
            return "datetimeoffset" + "'" + value + "'";
        case "Edm.Decimal":
            return value + "M";
        case "Edm.Guid":
            return "guid" + "'" + value + "'";
        case "Edm.Int64":
            return value + "L";
        case "Edm.Float":
            return value + "f";
        case "Edm.Double":
            return value + "D";
        case "Edm.Geography":
            return "geography" + "'" + value + "'";
        case "Edm.Geometry":
            return "geometry" + "'" + value + "'";
        case "Edm.Time":
            return "time" + "'" + value + "'";
        case "Edm.String":
            return "'" + value + "'";
        default:
            return value;
    }
}

/** convert raw byteArray to hexString if the property is an binary property
 * @param value - Value to be formatted.
 * @param type - Edm type of the value
 * @returns {string} Value after formatting
 */
function formatRawLiteral(value, type) {
    switch (type) {
        case "Edm.Binary":
            return convertByteArrayToHexString(value);
        default:
            return value;
    }
}

/** Formats the given minutes into (+/-)hh:mm format.
 * @param {Number} minutes - Number of minutes to format.
 * @returns {String} The minutes in (+/-)hh:mm format.
 */
function minutesToOffset(minutes) {

    var sign;
    if (minutes < 0) {
        sign = "-";
        minutes = -minutes;
    } else {
        sign = "+";
    }

    var hours = Math.floor(minutes / 60);
    minutes = minutes - (60 * hours);

    return sign + formatNumberWidth(hours, 2) + ":" + formatNumberWidth(minutes, 2);
}

/** Parses the JSON Date representation into a Date object.
 * @param {String} value - String value.
 * @returns {Date} A Date object if the value matches one; falsy otherwise.
 */
function parseJsonDateString(value) {

    var arr = value && jsonDateRE.exec(value);
    if (arr) {
        // 0 - complete results; 1 - ticks; 2 - sign; 3 - minutes
        var result = new Date(parseInt10(arr[1]));
        if (arr[2]) {
            var mins = parseInt10(arr[3]);
            if (arr[2] === "-") {
                mins = -mins;
            }

            // The offset is reversed to get back the UTC date, which is
            // what the API will eventually have.
            var current = result.getUTCMinutes();
            result.setUTCMinutes(current - mins);
            result.__edmType = "Edm.DateTimeOffset";
            result.__offset = minutesToOffset(mins);
        }
        if (!isNaN(result.valueOf())) {
            return result;
        }
    }

    // Allow undefined to be returned.
}

/** Creates an object containing information for the context
 * @param {String} fragments - Uri fragment
 * @param {Object} model - Object describing an OData conceptual schema
 * @returns {Object} type(optional)  object containing type information for entity- and complex-types ( null if a typeName is a primitive)
 */
function parseContextUriFragment( fragments, model ) {
    var ret = {};

    if (fragments.indexOf('/') === -1 ) {
        if (fragments.length === 0) {
            // Capter 10.1
            ret.detectedPayloadKind = PAYLOADTYPE_SVCDOC;
            return ret;
        } else if (fragments === 'Edm.Null') {
            // Capter 10.15
            ret.detectedPayloadKind = PAYLOADTYPE_VALUE;
            ret.isNullProperty = true;
            return ret;
        } else if (fragments === 'Collection($ref)') {
            // Capter 10.11
            ret.detectedPayloadKind = PAYLOADTYPE_ENTITY_REF_LINKS;
            return ret;
        } else if (fragments === '$ref') {
            // Capter 10.12
            ret.detectedPayloadKind = PAYLOADTYPE_ENTITY_REF_LINK;
            return ret;
        } else {
            //TODO check for navigation resource
        }
    }

    ret.type = undefined;
    ret.typeName = undefined;

    var fragmentParts = fragments.split("/");
    var type;

    for(var i = 0; i < fragmentParts.length; ++i) {
        var fragment = fragmentParts[i];
        if (ret.typeName === undefined) {
            //preparation
            if ( fragment.indexOf('(') !== -1 ) {
                //remove the query function, cut fragment to matching '('
                var index = fragment.length - 2 ;
                for ( var rCount = 1; rCount > 0 && index > 0; --index) {
                    if ( fragment.charAt(index)=='(') {
                        rCount --;
                    } else if ( fragment.charAt(index)==')') {
                        rCount ++;
                    }
                }

                if (index === 0) {
                    //TODO throw error
                }

                //remove the projected entity from the fragment; TODO decide if we want to store the projected entity
                var inPharenthesis = fragment.substring(index+2,fragment.length - 1);
                fragment = fragment.substring(0,index+1);

                if (utils.startsWith(fragment, 'Collection')) {
                    ret.detectedPayloadKind = PAYLOADTYPE_COLLECTION;
                    // Capter 10.14
                    ret.typeName = inPharenthesis;

                    type = lookupEntityType(ret.typeName, model);
                    if ( type !== null) {
                        ret.type = type;
                        continue;
                    }
                    type = lookupComplexType(ret.typeName, model);
                    if ( type !== null) {
                        ret.type = type;
                        continue;
                    }

                    ret.type = null;//in case of #Collection(Edm.String) only lastTypeName is filled
                    continue;
                } else {
                    // projection: Capter 10.7, 10.8 and 10.9
                    ret.projection = inPharenthesis;
                }
            }


            if (jsonIsPrimitiveType(fragment)) {
                ret.typeName = fragment;
                ret.type = null;
                ret.detectedPayloadKind = PAYLOADTYPE_VALUE;
                continue;
            }

            var container = lookupDefaultEntityContainer(model);

            //check for entity
            var entitySet = lookupEntitySet(container.entitySet, fragment);
            if ( entitySet !== null) {
                ret.typeName = entitySet.entityType;
                ret.type = lookupEntityType( ret.typeName, model);
                ret.name = fragment;
                ret.detectedPayloadKind = PAYLOADTYPE_FEED;
                // Capter 10.2
                continue;
            }

            //check for singleton
            var singleton = lookupSingleton(container.singleton, fragment);
            if ( singleton !== null) {
                ret.typeName = singleton.entityType;
                ret.type = lookupEntityType( ret.typeName, model);
                ret.name = fragment;
                ret.detectedPayloadKind =  PAYLOADTYPE_ENTRY;
                // Capter 10.4
                continue;
            }



            //TODO throw ERROR
        } else {
            //check for $entity
            if (utils.endsWith(fragment, '$entity') && (ret.detectedPayloadKind === PAYLOADTYPE_FEED)) {
                //TODO ret.name = fragment;
                ret.detectedPayloadKind = PAYLOADTYPE_ENTRY;
                // Capter 10.3 and 10.6
                continue;
            }

            //check for derived types
            if (fragment.indexOf('.') !== -1) {
                // Capter 10.6
                ret.typeName = fragment;
                type = lookupEntityType(ret.typeName, model);
                if ( type !== null) {
                    ret.type = type;
                    continue;
                }
                type = lookupComplexType(ret.typeName, model);
                if ( type !== null) {
                    ret.type = type;
                    continue;
                }

                //TODO throw ERROR invalid type
            }

            //check for property value
            if ( ret.detectedPayloadKind === PAYLOADTYPE_FEED || ret.detectedPayloadKind === PAYLOADTYPE_ENTRY) {
                var property = lookupProperty(ret.type.property, fragment);
                if (property !== null) {
                    //PAYLOADTYPE_COLLECTION
                    ret.typeName = property.type;


                    if (utils.startsWith(property.type, 'Collection')) {
                        ret.detectedPayloadKind = PAYLOADTYPE_COLLECTION;
                        var tmp12 =  property.type.substring(10+1,property.type.length - 1);
                        ret.typeName = tmp12;
                        ret.type = lookupComplexType(tmp12, model);
                        ret.detectedPayloadKind = PAYLOADTYPE_COLLECTION;
                    } else {
                        ret.type = lookupComplexType(property.type, model);
                        ret.detectedPayloadKind = PAYLOADTYPE_PROPERTY;
                    }

                    ret.name = fragment;
                    // Capter 10.15
                }
                continue;
            }

            if (fragment === '$delta') {
                ret.deltaKind = DELTATYPE_FEED;
                continue;
            } else if (utils.endsWith(fragment, '/$deletedEntity')) {
                ret.deltaKind = DELTATYPE_DELETED_ENTRY;
                continue;
            } else if (utils.endsWith(fragment, '/$link')) {
                ret.deltaKind = DELTATYPE_LINK;
                continue;
            } else if (utils.endsWith(fragment, '/$deletedLink')) {
                ret.deltaKind = DELTATYPE_DELETED_LINK;
                continue;
            }
            //TODO throw ERROr
        }
    }

    return ret;
}


/** Infers the information describing the JSON payload from its metadata annotation, structure, and data model.
 * @param {Object} data - Json response payload object.
 * @param {Object} model - Object describing an OData conceptual schema.
 * If the arguments passed to the function don't convey enough information about the payload to determine without doubt that the payload is a feed then it
 * will try to use the payload object structure instead.  If the payload looks like a feed (has value property that is an array or non-primitive values) then
 * the function will report its kind as PAYLOADTYPE_FEED unless the inferFeedAsComplexType flag is set to true. This flag comes from the user request
 * and allows the user to control how the library behaves with an ambigous JSON payload.
 * @return Object with kind and type fields. Null if there is no metadata annotation or the payload info cannot be obtained..
 */
function createPayloadInfo(data, model) {
    var metadataUri = data[contextUrlAnnotation];
    if (!metadataUri || typeof metadataUri !== "string") {
        return null;
    }

    var fragmentStart = metadataUri.lastIndexOf("#");
    if (fragmentStart === -1) {
        return jsonMakePayloadInfo(PAYLOADTYPE_SVCDOC);
    }

    var fragment = metadataUri.substring(fragmentStart + 1);
    return parseContextUriFragment(fragment,model);
}
/** Gets the key of an entry.
 * @param {Object} data - JSON entry.
 * @param {Object} data - EDM entity model for key loockup.
 * @returns {string} Entry instance key.
 */
function jsonGetEntryKey(data, entityModel) {

    var entityInstanceKey;
    var entityKeys = entityModel.key[0].propertyRef;
    var type;
    entityInstanceKey = "(";
    if (entityKeys.length == 1) {
        type = lookupProperty(entityModel.property, entityKeys[0].name).type;
        entityInstanceKey += formatLiteral(data[entityKeys[0].name], type);
    } else {
        var first = true;
        for (var i = 0; i < entityKeys.length; i++) {
            if (!first) {
                entityInstanceKey += ",";
            } else {
                first = false;
            }
            type = lookupProperty(entityModel.property, entityKeys[i].name).type;
            entityInstanceKey += entityKeys[i].name + "=" + formatLiteral(data[entityKeys[i].name], type);
        }
    }
    entityInstanceKey += ")";
    return entityInstanceKey;
}
/** Determines whether a type name is a primitive type in a JSON payload.
 * @param {String} typeName - Type name to test.
 * @returns {Boolean} True if the type name an EDM primitive type or an OData spatial type; false otherwise.
 */
function jsonIsPrimitiveType(typeName) {
    return isPrimitiveEdmType(typeName) || isGeographyEdmType(typeName) || isGeometryEdmType(typeName);
}


var jsonHandler = oDataHandler.handler(jsonParser, jsonSerializer, jsonMediaType, MAX_DATA_SERVICE_VERSION);
jsonHandler.recognizeDates = false;

exports.createPayloadInfo = createPayloadInfo;
exports.jsonHandler = jsonHandler;
exports.jsonParser = jsonParser;
exports.jsonSerializer = jsonSerializer;
exports.parseJsonDateString = parseJsonDateString;}, "metadata" : function(exports, module, require) {
'use strict';

/** @module odata/metadata */

var utils    = require('./../utils.js');
var oDSxml    = require('./../xml.js');
var odataHandler    = require('./handler.js');



// imports 
var contains = utils.contains;
var normalizeURI = utils.normalizeURI;
var xmlAttributes = oDSxml.xmlAttributes;
var xmlChildElements = oDSxml.xmlChildElements;
var xmlFirstChildElement = oDSxml.xmlFirstChildElement;
var xmlInnerText = oDSxml.xmlInnerText;
var xmlLocalName = oDSxml.xmlLocalName;
var xmlNamespaceURI = oDSxml.xmlNamespaceURI;
var xmlNS = oDSxml.xmlNS;
var xmlnsNS = oDSxml.xmlnsNS;
var xmlParse = oDSxml.xmlParse;

var ado = oDSxml.http + "docs.oasis-open.org/odata/";      // http://docs.oasis-open.org/odata/
var adoDs = ado + "ns";                             // http://docs.oasis-open.org/odata/ns
var edmxNs = adoDs + "/edmx";                       // http://docs.oasis-open.org/odata/ns/edmx
var edmNs1 = adoDs + "/edm";                        // http://docs.oasis-open.org/odata/ns/edm
var odataMetaXmlNs = adoDs + "/metadata";           // http://docs.oasis-open.org/odata/ns/metadata
var MAX_DATA_SERVICE_VERSION = odataHandler.MAX_DATA_SERVICE_VERSION;

var xmlMediaType = "application/xml";

/** Creates an object that describes an element in an schema.
 * @param {Array} attributes - List containing the names of the attributes allowed for this element.
 * @param {Array} elements - List containing the names of the child elements allowed for this element.
 * @param {Boolean} text - Flag indicating if the element's text value is of interest or not.
 * @param {String} ns - Namespace to which the element belongs to.
 * If a child element name ends with * then it is understood by the schema that that child element can appear 0 or more times.
 * @returns {Object} Object with attributes, elements, text, and ns fields.
 */
function schemaElement(attributes, elements, text, ns) {

    return {
        attributes: attributes,
        elements: elements,
        text: text || false,
        ns: ns
    };
}

// It's assumed that all elements may have Documentation children and Annotation elements.
// See http://docs.oasis-open.org/odata/odata/v4.0/cs01/part3-csdl/odata-v4.0-cs01-part3-csdl.html for a CSDL reference.
var schema = {
    elements: {
        Action: schemaElement(
        /*attributes*/["Name", "IsBound", "EntitySetPath"],
        /*elements*/["ReturnType", "Parameter*", "Annotation*"]
        ),
        ActionImport: schemaElement(
        /*attributes*/["Name", "Action", "EntitySet", "Annotation*"]
        ),
        Annotation: schemaElement(
        /*attributes*/["Term", "Qualifier", "Binary", "Bool", "Date", "DateTimeOffset", "Decimal", "Duration", "EnumMember", "Float", "Guid", "Int", "String", "TimeOfDay", "AnnotationPath", "NavigationPropertyPath", "Path", "PropertyPath", "UrlRef"],
        /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*", "Annotation*"]
        ),
        AnnotationPath: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Annotations: schemaElement(
        /*attributes*/["Target", "Qualifier"],
        /*elements*/["Annotation*"]
        ),
        Apply: schemaElement(
        /*attributes*/["Function"],
        /*elements*/["String*", "Path*", "LabeledElement*", "Annotation*"]
        ),
        And: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Or: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Not: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Eq: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Ne: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Gt: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Ge: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Lt: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Le: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Binary: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Bool: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Cast: schemaElement(
        /*attributes*/["Type"],
        /*elements*/["Path*", "Annotation*"]
        ),
        Collection: schemaElement(
        /*attributes*/null,
        /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*"]
        ),
        ComplexType: schemaElement(
        /*attributes*/["Name", "BaseType", "Abstract", "OpenType"],
        /*elements*/["Property*", "NavigationProperty*", "Annotation*"]
        ),
        Date: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        DateTimeOffset: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Decimal: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Duration: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        EntityContainer: schemaElement(
        /*attributes*/["Name", "Extends"],
        /*elements*/["EntitySet*", "Singleton*", "ActionImport*", "FunctionImport*", "Annotation*"]
        ),
        EntitySet: schemaElement(
        /*attributes*/["Name", "EntityType", "IncludeInServiceDocument"],
        /*elements*/["NavigationPropertyBinding*", "Annotation*"]
        ),
        EntityType: schemaElement(
        /*attributes*/["Name", "BaseType", "Abstract", "OpenType", "HasStream"],
        /*elements*/["Key*", "Property*", "NavigationProperty*", "Annotation*"]
        ),
        EnumMember: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        EnumType: schemaElement(
        /*attributes*/["Name", "UnderlyingType", "IsFlags"],
        /*elements*/["Member*"]
        ),
        Float: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Function: schemaElement(
        /*attributes*/["Name", "IsBound", "IsComposable", "EntitySetPath"],
        /*elements*/["ReturnType", "Parameter*", "Annotation*"]
        ),
        FunctionImport: schemaElement(
        /*attributes*/["Name", "Function", "EntitySet", "IncludeInServiceDocument", "Annotation*"]
        ),
        Guid: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        If: schemaElement(
        /*attributes*/null,
        /*elements*/["Path*", "String*", "Annotation*"]
        ),
        Int: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        IsOf: schemaElement(
        /*attributes*/["Type", "MaxLength", "Precision", "Scale", "Unicode", "SRID", "DefaultValue", "Annotation*"],
        /*elements*/["Path*"]
        ),
        Key: schemaElement(
        /*attributes*/null,
        /*elements*/["PropertyRef*"]
        ),
        LabeledElement: schemaElement(
        /*attributes*/["Name"],
        /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*", "Annotation*"]
        ),
        LabeledElementReference: schemaElement(
        /*attributes*/["Term"],
        /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*"]
        ),
        Member: schemaElement(
        /*attributes*/["Name", "Value"],
        /*element*/["Annotation*"]
        ),
        NavigationProperty: schemaElement(
        /*attributes*/["Name", "Type", "Nullable", "Partner", "ContainsTarget"],
        /*elements*/["ReferentialConstraint*", "OnDelete*", "Annotation*"]
        ),
        NavigationPropertyBinding: schemaElement(
        /*attributes*/["Path", "Target"]
        ),
        NavigationPropertyPath: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Null: schemaElement(
        /*attributes*/null,
        /*elements*/["Annotation*"]
        ),
        OnDelete: schemaElement(
        /*attributes*/["Action"],
        /*elements*/["Annotation*"]
        ),
        Path: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Parameter: schemaElement(
        /*attributes*/["Name", "Type", "Nullable", "MaxLength", "Precision", "Scale", "SRID"],
        /*elements*/["Annotation*"]
        ),
        Property: schemaElement(
        /*attributes*/["Name", "Type", "Nullable", "MaxLength", "Precision", "Scale", "Unicode", "SRID", "DefaultValue"],
        /*elements*/["Annotation*"]
        ),
        PropertyPath: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        PropertyRef: schemaElement(
        /*attributes*/["Name", "Alias"]
        ),
        PropertyValue: schemaElement(
        /*attributes*/["Property", "Path"],
        /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*", "Annotation*"]
        ),
        Record: schemaElement(
        /*attributes*/null,
        /*Elements*/["PropertyValue*", "Property*", "Annotation*"]
        ),
        ReferentialConstraint: schemaElement(
        /*attributes*/["Property", "ReferencedProperty", "Annotation*"]
        ),
        ReturnType: schemaElement(
        /*attributes*/["Type", "Nullable", "MaxLength", "Precision", "Scale", "SRID"]
        ),
        String: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        Schema: schemaElement(
        /*attributes*/["Namespace", "Alias"],
        /*elements*/["Action*", "Annotations*", "Annotation*", "ComplexType*", "EntityContainer", "EntityType*", "EnumType*", "Function*", "Term*", "TypeDefinition*", "Annotation*"]
        ),
        Singleton: schemaElement(
        /*attributes*/["Name", "Type"],
        /*elements*/["NavigationPropertyBinding*", "Annotation*"]
        ),
        Term: schemaElement(
        /*attributes*/["Name", "Type", "BaseTerm", "DefaultValue ", "AppliesTo", "Nullable", "MaxLength", "Precision", "Scale", "SRID"],
        /*elements*/["Annotation*"]
        ),
        TimeOfDay: schemaElement(
        /*attributes*/null,
        /*elements*/null,
        /*text*/true
        ),
        TypeDefinition: schemaElement(
        /*attributes*/["Name", "UnderlyingType", "MaxLength", "Unicode", "Precision", "Scale", "SRID"],
        /*elements*/["Annotation*"]
        ),
        UrlRef: schemaElement(
        /*attributes*/null,
        /*elements*/["Binary*", "Bool*", "Date*", "DateTimeOffset*", "Decimal*", "Duration*", "EnumMember*", "Float*", "Guid*", "Int*", "String*", "TimeOfDay*", "And*", "Or*", "Not*", "Eq*", "Ne*", "Gt*", "Ge*", "Lt*", "Le*", "AnnotationPath*", "Apply*", "Cast*", "Collection*", "If*", "IsOf*", "LabeledElement*", "LabeledElementReference*", "Null*", "NavigationPropertyPath*", "Path*", "PropertyPath*", "Record*", "UrlRef*", "Annotation*"]
        ),

        // See http://msdn.microsoft.com/en-us/library/dd541238(v=prot.10) for an EDMX reference.
        Edmx: schemaElement(
        /*attributes*/["Version"],
        /*elements*/["DataServices", "Reference*"],
        /*text*/false,
        /*ns*/edmxNs
        ),
        DataServices: schemaElement(
        /*attributes*/["m:MaxDataServiceVersion", "m:DataServiceVersion"],
        /*elements*/["Schema*"],
        /*text*/false,
        /*ns*/edmxNs
        ),
        Reference: schemaElement(
        /*attributes*/["Uri"],
        /*elements*/["Include*", "IncludeAnnotations*", "Annotation*"]
        ),
        Include: schemaElement(
        /*attributes*/["Namespace", "Alias"]
        ),
        IncludeAnnotations: schemaElement(
        /*attributes*/["TermNamespace", "Qualifier", "TargetNamespace"]
        )
    }
};


/** Converts a Pascal-case identifier into a camel-case identifier.
 * @param {String} text - Text to convert.
 * @returns {String} Converted text.
 * If the text starts with multiple uppercase characters, it is left as-is.
 */
function scriptCase(text) {

    if (!text) {
        return text;
    }

    if (text.length > 1) {
        var firstTwo = text.substr(0, 2);
        if (firstTwo === firstTwo.toUpperCase()) {
            return text;
        }

        return text.charAt(0).toLowerCase() + text.substr(1);
    }

    return text.charAt(0).toLowerCase();
}

/** Gets the schema node for the specified element.
 * @param {Object} parentSchema - Schema of the parent XML node of 'element'.
 * @param candidateName - XML element name to consider.
 * @returns {Object} The schema that describes the specified element; null if not found.
 */
function getChildSchema(parentSchema, candidateName) {

    var elements = parentSchema.elements;
    if (!elements) {
        return null;
    }

    var i, len;
    for (i = 0, len = elements.length; i < len; i++) {
        var elementName = elements[i];
        var multipleElements = false;
        if (elementName.charAt(elementName.length - 1) === "*") {
            multipleElements = true;
            elementName = elementName.substr(0, elementName.length - 1);
        }

        if (candidateName === elementName) {
            var propertyName = scriptCase(elementName);
            return { isArray: multipleElements, propertyName: propertyName };
        }
    }

    return null;
}

/** Checks whether the specifies namespace URI is one of the known CSDL namespace URIs.
 * @param {String} nsURI - Namespace URI to check.
 * @returns {Boolean} true if nsURI is a known CSDL namespace; false otherwise.
 */
function isEdmNamespace(nsURI) {

    return nsURI === edmNs1;
}

/** Parses a CSDL document.
 * @param element - DOM element to parse.
 * @returns {Object} An object describing the parsed element.
 */
function parseConceptualModelElement(element) {

    var localName = xmlLocalName(element);
    var nsURI = xmlNamespaceURI(element);
    var elementSchema = schema.elements[localName];
    if (!elementSchema) {
        return null;
    }

    if (elementSchema.ns) {
        if (nsURI !== elementSchema.ns) {
            return null;
        }
    } else if (!isEdmNamespace(nsURI)) {
        return null;
    }

    var item = {};
    var attributes = elementSchema.attributes || [];
    xmlAttributes(element, function (attribute) {

        var localName = xmlLocalName(attribute);
        var nsURI = xmlNamespaceURI(attribute);
        var value = attribute.value;

        // Don't do anything with xmlns attributes.
        if (nsURI === xmlnsNS) {
            return;
        }

        // Currently, only m: for metadata is supported as a prefix in the internal schema table,
        // un-prefixed element names imply one a CSDL element.
        var schemaName = null;
        if (isEdmNamespace(nsURI) || nsURI === null) {
            schemaName = "";
        } else if (nsURI === odataMetaXmlNs) {
            schemaName = "m:";
        }

        if (schemaName !== null) {
            schemaName += localName;

            if (contains(attributes, schemaName)) {
                item[scriptCase(localName)] = value;
            }
        }

    });

    xmlChildElements(element, function (child) {
        var localName = xmlLocalName(child);
        var childSchema = getChildSchema(elementSchema, localName);
        if (childSchema) {
            if (childSchema.isArray) {
                var arr = item[childSchema.propertyName];
                if (!arr) {
                    arr = [];
                    item[childSchema.propertyName] = arr;
                }
                arr.push(parseConceptualModelElement(child));
            } else {
                item[childSchema.propertyName] = parseConceptualModelElement(child);
            }
        } 
    });

    if (elementSchema.text) {
        item.text = xmlInnerText(element);
    }

    return item;
}

/** Parses a metadata document.
 * @param handler - This handler.
 * @param {String} text - Metadata text.
 * @returns An object representation of the conceptual model.
 */
function metadataParser(handler, text) {

    var doc = xmlParse(text);
    var root = xmlFirstChildElement(doc);
    return parseConceptualModelElement(root) || undefined;
}



exports.metadataHandler = odataHandler.handler(metadataParser, null, xmlMediaType, MAX_DATA_SERVICE_VERSION);

exports.schema = schema;
exports.scriptCase = scriptCase;
exports.getChildSchema = getChildSchema;
exports.parseConceptualModelElement = parseConceptualModelElement;
exports.metadataParser = metadataParser;}, "net" : function(exports, module, require) {

/** @module odata/net */
/*for browser*/


var utils    = require('./../utils.js');
// Imports.

var defined = utils.defined;
var delay = utils.delay;

var ticks = 0;

/* Checks whether the specified request can be satisfied with a JSONP request.
 * @param request - Request object to check.
 * @returns {Boolean} true if the request can be satisfied; false otherwise.

 * Requests that 'degrade' without changing their meaning by going through JSONP
 * are considered usable.
 *
 * We allow data to come in a different format, as the servers SHOULD honor the Accept
 * request but may in practice return content with a different MIME type.
 */
function canUseJSONP(request) {
    
    return !(request.method && request.method !== "GET");


}

/** Creates an IFRAME tag for loading the JSONP script
 * @param {String} url - The source URL of the script
 * @returns {HTMLElement} The IFRAME tag
 */
function createIFrame(url) {
    var iframe = window.document.createElement("IFRAME");
    iframe.style.display = "none";

    var attributeEncodedUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    var html = "<html><head><script type=\"text/javascript\" src=\"" + attributeEncodedUrl + "\"><\/script><\/head><body><\/body><\/html>";

    var body = window.document.getElementsByTagName("BODY")[0];
    body.appendChild(iframe);

    writeHtmlToIFrame(iframe, html);
    return iframe;
}

/** Creates a XmlHttpRequest object.
 * @returns {XmlHttpRequest} XmlHttpRequest object.
 */
function createXmlHttpRequest() {
    if (window.XMLHttpRequest) {
        return new window.XMLHttpRequest();
    }
    var exception;
    if (window.ActiveXObject) {
        try {
            return new window.ActiveXObject("Msxml2.XMLHTTP.6.0");
        } catch (_) {
            try {
                return new window.ActiveXObject("Msxml2.XMLHTTP.3.0");
            } catch (e) {
                exception = e;
            }
        }
    } else {
        exception = { message: "XMLHttpRequest not supported" };
    }
    throw exception;
}

/** Checks whether the specified URL is an absolute URL.
 * @param {String} url - URL to check.
 * @returns {Boolean} true if the url is an absolute URL; false otherwise.
*/
function isAbsoluteUrl(url) {
    return url.indexOf("http://") === 0 ||
        url.indexOf("https://") === 0 ||
        url.indexOf("file://") === 0;
}

/** Checks whether the specified URL is local to the current context.
 * @param {String} url - URL to check.
 * @returns {Boolean} true if the url is a local URL; false otherwise.
 */
function isLocalUrl(url) {

    if (!isAbsoluteUrl(url)) {
        return true;
    }

    // URL-embedded username and password will not be recognized as same-origin URLs.
    var location = window.location;
    var locationDomain = location.protocol + "//" + location.host + "/";
    return (url.indexOf(locationDomain) === 0);
}

/** Removes a callback used for a JSONP request.
 * @param {String} name - Function name to remove.
 * @param {Number} tick - Tick count used on the callback.
 */
function removeCallback(name, tick) {
    try {
        delete window[name];
    } catch (err) {
        window[name] = undefined;
        if (tick === ticks - 1) {
            ticks -= 1;
        }
    }
}

/** Removes an iframe.
 * @param {Object} iframe - The iframe to remove.
 * @returns {Object} Null value to be assigned to iframe reference.
 */
function removeIFrame(iframe) {
    if (iframe) {
        writeHtmlToIFrame(iframe, "");
        iframe.parentNode.removeChild(iframe);
    }

    return null;
}

/** Reads response headers into array.
 * @param {XMLHttpRequest} xhr - HTTP request with response available.
 * @param {Array} headers - Target array to fill with name/value pairs.
 */
function readResponseHeaders(xhr, headers) {

    var responseHeaders = xhr.getAllResponseHeaders().split(/\r?\n/);
    var i, len;
    for (i = 0, len = responseHeaders.length; i < len; i++) {
        if (responseHeaders[i]) {
            var header = responseHeaders[i].split(": ");
            headers[header[0]] = header[1];
        }
    }
}

/** Writes HTML to an IFRAME document.
 * @param {HTMLElement} iframe - The IFRAME element to write to.
 * @param {String} html - The HTML to write.
 */
function writeHtmlToIFrame(iframe, html) {
    var frameDocument = (iframe.contentWindow) ? iframe.contentWindow.document : iframe.contentDocument.document;
    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();
}

exports.defaultHttpClient = {
    callbackParameterName: "$callback",

    formatQueryString: "$format=json",

    enableJsonpCallback: false,

    /** Performs a network request.
     * @param {Object} request - Request description
     * @param {Function} success - Success callback with the response object.
     * @param {Function} error - Error callback with an error object.
     * @returns {Object} Object with an 'abort' method for the operation.
     */
    request: function createRequest() {

        var that = this;


        return function(request, success, error) {

        var result = {};
        var xhr = null;
        var done = false;
        var iframe;

        result.abort = function () {
            iframe = removeIFrame(iframe);
            if (done) {
                return;
            }

            done = true;
            if (xhr) {
                xhr.abort();
                xhr = null;
            }

            error({ message: "Request aborted" });
        };

        var handleTimeout = function () {
            iframe = removeIFrame(iframe);
            if (!done) {
                done = true;
                xhr = null;
                error({ message: "Request timed out" });
            }
        };

        var name;
        var url = request.requestUri;
        var enableJsonpCallback = defined(request.enableJsonpCallback , that.enableJsonpCallback);
        var callbackParameterName = defined(request.callbackParameterName, that.callbackParameterName);
        var formatQueryString = defined(request.formatQueryString, that.formatQueryString);
        if (!enableJsonpCallback || isLocalUrl(url)) {

            xhr = createXmlHttpRequest();
            xhr.onreadystatechange = function () {
                if (done || xhr === null || xhr.readyState !== 4) {
                    return;
                }

                // Workaround for XHR behavior on IE.
                var statusText = xhr.statusText;
                var statusCode = xhr.status;
                if (statusCode === 1223) {
                    statusCode = 204;
                    statusText = "No Content";
                }

                var headers = [];
                readResponseHeaders(xhr, headers);

                var response = { requestUri: url, statusCode: statusCode, statusText: statusText, headers: headers, body: xhr.responseText };

                done = true;
                xhr = null;
                if (statusCode >= 200 && statusCode <= 299) {
                    success(response);
                } else {
                    error({ message: "HTTP request failed", request: request, response: response });
                }
            };

            xhr.open(request.method || "GET", url, true, request.user, request.password);

            // Set the name/value pairs.
            if (request.headers) {
                for (name in request.headers) {
                    xhr.setRequestHeader(name, request.headers[name]);
                }
            }

            // Set the timeout if available.
            if (request.timeoutMS) {
                xhr.timeout = request.timeoutMS;
                xhr.ontimeout = handleTimeout;
            }

            xhr.send(request.body);
        } else {
            if (!canUseJSONP(request)) {
                throw { message: "Request is not local and cannot be done through JSONP." };
            }

            var tick = ticks;
            ticks += 1;
            var tickText = tick.toString();
            var succeeded = false;
            var timeoutId;
            name = "handleJSONP_" + tickText;
            window[name] = function (data) {
                iframe = removeIFrame(iframe);
                if (!done) {
                    succeeded = true;
                    window.clearTimeout(timeoutId);
                    removeCallback(name, tick);

                    // Workaround for IE8 and IE10 below where trying to access data.constructor after the IFRAME has been removed
                    // throws an "unknown exception"
                    if (window.ActiveXObject) {
                        data = window.JSON.parse(window.JSON.stringify(data));
                    }


                    var headers;
                    if (!formatQueryString || formatQueryString == "$format=json") {
                        headers = { "Content-Type": "application/json;odata.metadata=minimal", "OData-Version": "4.0" };
                    } else {
                        // the formatQueryString should be in the format of "$format=xxx", xxx should be one of the application/json;odata.metadata=minimal(none or full)
                        // set the content-type with the string xxx which stars from index 8.
                        headers = { "Content-Type": formatQueryString.substring(8), "OData-Version": "4.0" };
                    }

                    // Call the success callback in the context of the parent window, instead of the IFRAME
                    delay(function () {
                        removeIFrame(iframe);
                        success({ body: data, statusCode: 200, headers: headers });
                    });
                }
            };

            // Default to two minutes before timing out, 1000 ms * 60 * 2 = 120000.
            var timeoutMS = (request.timeoutMS) ? request.timeoutMS : 120000;
            timeoutId = window.setTimeout(handleTimeout, timeoutMS);

            var queryStringParams = callbackParameterName + "=parent." + name;
            if (formatQueryString) {
                queryStringParams += "&" + formatQueryString;
            }

            var qIndex = url.indexOf("?");
            if (qIndex === -1) {
                url = url + "?" + queryStringParams;
            } else if (qIndex === url.length - 1) {
                url = url + queryStringParams;
            } else {
                url = url + "&" + queryStringParams;
            }

            iframe = createIFrame(url);
        }

        return result;
    }
    }()
};



exports.canUseJSONP = canUseJSONP;
exports.isAbsoluteUrl = isAbsoluteUrl;
exports.isLocalUrl = isLocalUrl;}, "odatautils" : function(exports, module, require) {
'use strict';
 /** @module odata/utils */

var utils    = require('./../utils.js');

// Imports
var assigned = utils.assigned;
var contains = utils.contains;
var find = utils.find;
var isArray = utils.isArray;
var isDate = utils.isDate;
var isObject = utils.isObject;
var parseInt10 = utils.parseInt10;


/** Gets the type name of a data item value that belongs to a feed, an entry, a complex type property, or a collection property
 * @param {string} value - Value of the data item from which the type name is going to be retrieved.
 * @param {object} [metadata] - Object containing metadata about the data tiem.
 * @returns {string} Data item type name; null if the type name cannot be found within the value or the metadata
 * This function will first try to get the type name from the data item's value itself if it is an object with a __metadata property; otherwise
 * it will try to recover it from the metadata.  If both attempts fail, it will return null.
 */
var dataItemTypeName = function (value, metadata) {
    var valueTypeName = ((value && value.__metadata) || {}).type;
    return valueTypeName || (metadata ? metadata.type : null);
};

var EDM = "Edm.";
var EDM_BOOLEAN = EDM + "Boolean";
var EDM_BYTE = EDM + "Byte";
var EDM_SBYTE = EDM + "SByte";
var EDM_INT16 = EDM + "Int16";
var EDM_INT32 = EDM + "Int32";
var EDM_INT64 = EDM + "Int64";
var EDM_SINGLE = EDM + "Single";
var EDM_DOUBLE = EDM + "Double";
var EDM_DECIMAL = EDM + "Decimal";
var EDM_STRING = EDM + "String";

var EDM_BINARY = EDM + "Binary";
var EDM_DATE = EDM + "Date";
var EDM_DATETIMEOFFSET = EDM + "DateTimeOffset";
var EDM_DURATION = EDM + "Duration";
var EDM_GUID = EDM + "Guid";
var EDM_TIMEOFDAY = EDM + "Time";

var GEOGRAPHY = "Geography";
var EDM_GEOGRAPHY = EDM + GEOGRAPHY;
var EDM_GEOGRAPHY_POINT = EDM_GEOGRAPHY + "Point";
var EDM_GEOGRAPHY_LINESTRING = EDM_GEOGRAPHY + "LineString";
var EDM_GEOGRAPHY_POLYGON = EDM_GEOGRAPHY + "Polygon";
var EDM_GEOGRAPHY_COLLECTION = EDM_GEOGRAPHY + "Collection";
var EDM_GEOGRAPHY_MULTIPOLYGON = EDM_GEOGRAPHY + "MultiPolygon";
var EDM_GEOGRAPHY_MULTILINESTRING = EDM_GEOGRAPHY + "MultiLineString";
var EDM_GEOGRAPHY_MULTIPOINT = EDM_GEOGRAPHY + "MultiPoint";

var GEOGRAPHY_POINT = GEOGRAPHY + "Point";
var GEOGRAPHY_LINESTRING = GEOGRAPHY + "LineString";
var GEOGRAPHY_POLYGON = GEOGRAPHY + "Polygon";
var GEOGRAPHY_COLLECTION = GEOGRAPHY + "Collection";
var GEOGRAPHY_MULTIPOLYGON = GEOGRAPHY + "MultiPolygon";
var GEOGRAPHY_MULTILINESTRING = GEOGRAPHY + "MultiLineString";
var GEOGRAPHY_MULTIPOINT = GEOGRAPHY + "MultiPoint";

var GEOMETRY = "Geometry";
var EDM_GEOMETRY = EDM + GEOMETRY;
var EDM_GEOMETRY_POINT = EDM_GEOMETRY + "Point";
var EDM_GEOMETRY_LINESTRING = EDM_GEOMETRY + "LineString";
var EDM_GEOMETRY_POLYGON = EDM_GEOMETRY + "Polygon";
var EDM_GEOMETRY_COLLECTION = EDM_GEOMETRY + "Collection";
var EDM_GEOMETRY_MULTIPOLYGON = EDM_GEOMETRY + "MultiPolygon";
var EDM_GEOMETRY_MULTILINESTRING = EDM_GEOMETRY + "MultiLineString";
var EDM_GEOMETRY_MULTIPOINT = EDM_GEOMETRY + "MultiPoint";

var GEOMETRY_POINT = GEOMETRY + "Point";
var GEOMETRY_LINESTRING = GEOMETRY + "LineString";
var GEOMETRY_POLYGON = GEOMETRY + "Polygon";
var GEOMETRY_COLLECTION = GEOMETRY + "Collection";
var GEOMETRY_MULTIPOLYGON = GEOMETRY + "MultiPolygon";
var GEOMETRY_MULTILINESTRING = GEOMETRY + "MultiLineString";
var GEOMETRY_MULTIPOINT = GEOMETRY + "MultiPoint";

var GEOJSON_POINT = "Point";
var GEOJSON_LINESTRING = "LineString";
var GEOJSON_POLYGON = "Polygon";
var GEOJSON_MULTIPOINT = "MultiPoint";
var GEOJSON_MULTILINESTRING = "MultiLineString";
var GEOJSON_MULTIPOLYGON = "MultiPolygon";
var GEOJSON_GEOMETRYCOLLECTION = "GeometryCollection";

var primitiveEdmTypes = [
    EDM_STRING,
    EDM_INT32,
    EDM_INT64,
    EDM_BOOLEAN,
    EDM_DOUBLE,
    EDM_SINGLE,
    EDM_DATE,
    EDM_DATETIMEOFFSET,
    EDM_DURATION,
    EDM_TIMEOFDAY,
    EDM_DECIMAL,
    EDM_GUID,
    EDM_BYTE,
    EDM_INT16,
    EDM_SBYTE,
    EDM_BINARY
];

var geometryEdmTypes = [
    EDM_GEOMETRY,
    EDM_GEOMETRY_POINT,
    EDM_GEOMETRY_LINESTRING,
    EDM_GEOMETRY_POLYGON,
    EDM_GEOMETRY_COLLECTION,
    EDM_GEOMETRY_MULTIPOLYGON,
    EDM_GEOMETRY_MULTILINESTRING,
    EDM_GEOMETRY_MULTIPOINT
];

var geometryTypes = [
    GEOMETRY,
    GEOMETRY_POINT,
    GEOMETRY_LINESTRING,
    GEOMETRY_POLYGON,
    GEOMETRY_COLLECTION,
    GEOMETRY_MULTIPOLYGON,
    GEOMETRY_MULTILINESTRING,
    GEOMETRY_MULTIPOINT
];

var geographyEdmTypes = [
    EDM_GEOGRAPHY,
    EDM_GEOGRAPHY_POINT,
    EDM_GEOGRAPHY_LINESTRING,
    EDM_GEOGRAPHY_POLYGON,
    EDM_GEOGRAPHY_COLLECTION,
    EDM_GEOGRAPHY_MULTIPOLYGON,
    EDM_GEOGRAPHY_MULTILINESTRING,
    EDM_GEOGRAPHY_MULTIPOINT
];

var geographyTypes = [
    GEOGRAPHY,
    GEOGRAPHY_POINT,
    GEOGRAPHY_LINESTRING,
    GEOGRAPHY_POLYGON,
    GEOGRAPHY_COLLECTION,
    GEOGRAPHY_MULTIPOLYGON,
    GEOGRAPHY_MULTILINESTRING,
    GEOGRAPHY_MULTIPOINT
];

/** Invokes a function once per schema in metadata.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @param {Function} callback - Callback function to invoke once per schema.
 * @returns The first truthy value to be returned from the callback; null or the last falsy value otherwise.
 */
function forEachSchema(metadata, callback) {
    

    if (!metadata) {
        return null;
    }

    if (isArray(metadata)) {
        var i, len, result;
        for (i = 0, len = metadata.length; i < len; i++) {
            result = forEachSchema(metadata[i], callback);
            if (result) {
                return result;
            }
        }

        return null;
    } else {
        if (metadata.dataServices) {
            return forEachSchema(metadata.dataServices.schema, callback);
        }

        return callback(metadata);
    }
}

/** Formats a millisecond and a nanosecond value into a single string.
 * @param {Number} ms - Number of milliseconds to format.
 * @param {Number} ns - Number of nanoseconds to format.
 * @returns {String} Formatted text.
 * If the value is already as string it's returned as-is.
 */
function formatMilliseconds(ms, ns) {

    // Avoid generating milliseconds if not necessary.
    if (ms === 0) {
        ms = "";
    } else {
        ms = "." + formatNumberWidth(ms.toString(), 3);
    }
    if (ns > 0) {
        if (ms === "") {
            ms = ".000";
        }
        ms += formatNumberWidth(ns.toString(), 4);
    }
    return ms;
}

function formatDateTimeOffsetJSON(value) {
    return "\/Date(" + value.getTime() + ")\/";
}

/** Formats a DateTime or DateTimeOffset value a string.
 * @param {Date} value - Value to format
 * @returns {String} Formatted text.
 * If the value is already as string it's returned as-is
´*/
function formatDateTimeOffset(value) {

    if (typeof value === "string") {
        return value;
    }

    var hasOffset = isDateTimeOffset(value);
    var offset = getCanonicalTimezone(value.__offset);
    if (hasOffset && offset !== "Z") {
        // We're about to change the value, so make a copy.
        value = new Date(value.valueOf());

        var timezone = parseTimezone(offset);
        var hours = value.getUTCHours() + (timezone.d * timezone.h);
        var minutes = value.getUTCMinutes() + (timezone.d * timezone.m);

        value.setUTCHours(hours, minutes);
    } else if (!hasOffset) {
        // Don't suffix a 'Z' for Edm.DateTime values.
        offset = "";
    }

    var year = value.getUTCFullYear();
    var month = value.getUTCMonth() + 1;
    var sign = "";
    if (year <= 0) {
        year = -(year - 1);
        sign = "-";
    }

    var ms = formatMilliseconds(value.getUTCMilliseconds(), value.__ns);

    return sign +
        formatNumberWidth(year, 4) + "-" +
        formatNumberWidth(month, 2) + "-" +
        formatNumberWidth(value.getUTCDate(), 2) + "T" +
        formatNumberWidth(value.getUTCHours(), 2) + ":" +
        formatNumberWidth(value.getUTCMinutes(), 2) + ":" +
        formatNumberWidth(value.getUTCSeconds(), 2) +
        ms + offset;
}

/** Converts a duration to a string in xsd:duration format.
 * @param {Object} value - Object with ms and __edmType properties.
 * @returns {String} String representation of the time object in xsd:duration format.
 */
function formatDuration(value) {

    var ms = value.ms;

    var sign = "";
    if (ms < 0) {
        sign = "-";
        ms = -ms;
    }

    var days = Math.floor(ms / 86400000);
    ms -= 86400000 * days;
    var hours = Math.floor(ms / 3600000);
    ms -= 3600000 * hours;
    var minutes = Math.floor(ms / 60000);
    ms -= 60000 * minutes;
    var seconds = Math.floor(ms / 1000);
    ms -= seconds * 1000;

    return sign + "P" +
           formatNumberWidth(days, 2) + "DT" +
           formatNumberWidth(hours, 2) + "H" +
           formatNumberWidth(minutes, 2) + "M" +
           formatNumberWidth(seconds, 2) +
           formatMilliseconds(ms, value.ns) + "S";
}

/** Formats the specified value to the given width.
 * @param {Number} value - Number to format (non-negative).
 * @param {Number} width - Minimum width for number.
 * @param {Boolean} append - Flag indicating if the value is padded at the beginning (false) or at the end (true).
 * @returns {String} Text representation.
 */
function formatNumberWidth(value, width, append) {
    var result = value.toString(10);
    while (result.length < width) {
        if (append) {
            result += "0";
        } else {
            result = "0" + result;
        }
    }

    return result;
}

/** Gets the canonical timezone representation.
 * @param {String} timezone - Timezone representation.
 * @returns {String} An 'Z' string if the timezone is absent or 0; the timezone otherwise.
 */
function getCanonicalTimezone(timezone) {

    return (!timezone || timezone === "Z" || timezone === "+00:00" || timezone === "-00:00") ? "Z" : timezone;
}

/** Gets the type of a collection type name.
 * @param {String} typeName - Type name of the collection.
 * @returns {String} Type of the collection; null if the type name is not a collection type.
 */
function getCollectionType(typeName) {

    if (typeof typeName === "string") {
        var end = typeName.indexOf(")", 10);
        if (typeName.indexOf("Collection(") === 0 && end > 0) {
            return typeName.substring(11, end);
        }
    }
    return null;
}

/** Sends a request containing OData payload to a server.
* @param request - Object that represents the request to be sent..
* @param success - Callback for a successful read operation.
* @param error - Callback for handling errors.
* @param handler - Handler for data serialization.
* @param httpClient - HTTP client layer.
* @param context - Context used for processing the request
*/
function invokeRequest(request, success, error, handler, httpClient, context) {

    return httpClient.request(request, function (response) {
        try {
            if (response.headers) {
                normalizeHeaders(response.headers);
            }

            if (response.data === undefined && response.statusCode !== 204) {
                handler.read(response, context);
            }
        } catch (err) {
            if (err.request === undefined) {
                err.request = request;
            }
            if (err.response === undefined) {
                err.response = response;
            }
            error(err);
            return;
        }
        // errors in success handler for sync requests result in error handler calls. So here we fix this. 
        try {
            success(response.data, response);
        } catch (err) {
            err.bIsSuccessHandlerError = true;
            throw err;
        }
    }, error);
}

/** Tests whether a value is a batch object in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a batch object; false otherwise.
 */
function isBatch(value) {

    return isComplex(value) && isArray(value.__batchRequests);
}

// Regular expression used for testing and parsing for a collection type.
var collectionTypeRE = /Collection\((.*)\)/;

/** Tests whether a value is a collection value in the library's internal representation.
 * @param value - Value to test.
 * @param {String} typeName - Type name of the value. This is used to disambiguate from a collection property value.
 * @returns {Boolean} True is the value is a feed value; false otherwise.
 */
function isCollection(value, typeName) {

    var colData = value && value.results || value;
    return !!colData &&
        (isCollectionType(typeName)) ||
        (!typeName && isArray(colData) && !isComplex(colData[0]));
}

/** Checks whether the specified type name is a collection type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is the name of a collection type; false otherwise.
 */
function isCollectionType(typeName) {
    return collectionTypeRE.test(typeName);
}

/** Tests whether a value is a complex type value in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a complex type value; false otherwise.
 */
function isComplex(value) {

    return !!value &&
        isObject(value) &&
        !isArray(value) &&
        !isDate(value);
}

/** Checks whether a Date object is DateTimeOffset value
 * @param {Date} value - Value to check
 * @returns {Boolean} true if the value is a DateTimeOffset, false otherwise.
 */
function isDateTimeOffset(value) {
    return (value.__edmType === "Edm.DateTimeOffset" || (!value.__edmType && value.__offset));
}

/** Tests whether a value is a deferred navigation property in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a deferred navigation property; false otherwise.
 */
function isDeferred(value) {

    if (!value && !isComplex(value)) {
        return false;
    }
    var metadata = value.__metadata || {};
    var deferred = value.__deferred || {};
    return !metadata.type && !!deferred.uri;
}

/** Tests whether a value is an entry object in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is an entry object; false otherwise.
 */
function isEntry(value) {

    return isComplex(value) && value.__metadata && "uri" in value.__metadata;
}

/** Tests whether a value is a feed value in the library's internal representation.
 * @param value - Value to test.
 * @param {String} typeName - Type name of the value. This is used to disambiguate from a collection property value.
 * @returns {Boolean} True is the value is a feed value; false otherwise.
 */
function isFeed(value, typeName) {

    var feedData = value && value.results || value;
    return isArray(feedData) && (
        (!isCollectionType(typeName)) &&
        (isComplex(feedData[0]))
    );
}

/** Checks whether the specified type name is a geography EDM type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is a geography EDM type; false otherwise.
 */
function isGeographyEdmType(typeName) {
    //check with edm
    return contains(geographyEdmTypes, typeName) ||
        (typeName.indexOf('.') === -1 && contains(geographyTypes, typeName));
        
}

/** Checks whether the specified type name is a geometry EDM type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is a geometry EDM type; false otherwise.
 */
function isGeometryEdmType(typeName) {
    return contains(geometryEdmTypes, typeName) ||
        (typeName.indexOf('.') === -1 && contains(geometryTypes, typeName));
}



/** Tests whether a value is a named stream value in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a named stream; false otherwise.
 */
function isNamedStream(value) {

    if (!value && !isComplex(value)) {
        return false;
    }
    var metadata = value.__metadata;
    var mediaResource = value.__mediaresource;
    return !metadata && !!mediaResource && !!mediaResource.media_src;
}

/** Tests whether a value is a primitive type value in the library's internal representation.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is a primitive type value.
 * Date objects are considered primitive types by the library.
 */
function isPrimitive(value) {

    return isDate(value) ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean";
}

/** Checks whether the specified type name is a primitive EDM type.
 * @param {String} typeName - Name of type to check.
 * @returns {Boolean} True if the type is a primitive EDM type; false otherwise.
 */
function isPrimitiveEdmType(typeName) {

    return contains(primitiveEdmTypes, typeName);
}

/** Gets the kind of a navigation property value.
 * @param value - Value of the navigation property.
 * @param {Object} [propertyModel] - Object that describes the navigation property in an OData conceptual schema.
 * @returns {String} String value describing the kind of the navigation property; null if the kind cannot be determined.
 */
function navigationPropertyKind(value, propertyModel) {

    if (isDeferred(value)) {
        return "deferred";
    }
    if (isEntry(value)) {
        return "entry";
    }
    if (isFeed(value)) {
        return "feed";
    }
    if (propertyModel && propertyModel.relationship) {
        if (value === null || value === undefined || !isFeed(value)) {
            return "entry";
        }
        return "feed";
    }
    return null;
}

/** Looks up a property by name.
 * @param {Array} properties - Array of property objects as per EDM metadata (may be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The property object; null if not found.
 */
function lookupProperty(properties, name) {

    return find(properties, function (property) {
        return property.name === name;
    });
}

/** Looks up a type object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @param {String} kind - Kind of object to look for as per EDM metadata.
 * @returns An type description if the name is found; null otherwise
 */
function lookupInMetadata(name, metadata, kind) {

    return (name) ? forEachSchema(metadata, function (schema) {
        return lookupInSchema(name, schema, kind);
    }) : null;
}

/** Looks up a entity set by name.
 * @param {Array} entitySets - Array of entity set objects as per EDM metadata( may be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The entity set object; null if not found.
 */
function lookupEntitySet(entitySets, name) {

    return find(entitySets, function (entitySet) {
        return entitySet.name === name;
    });
}

/** Looks up a entity set by name.
 * @param {Array} singletons - Array of entity set objects as per EDM metadata (may be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The entity set object; null if not found.
 */
function lookupSingleton(singletons, name) {

    return find(singletons, function (singleton) {
        return singleton.name === name;
    });
}

/** Looks up a complex type object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns A complex type description if the name is found; null otherwise.
 */
function lookupComplexType(name, metadata) {

    return lookupInMetadata(name, metadata, "complexType");
}

/** Looks up an entity type object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns An entity type description if the name is found; null otherwise.
 */
function lookupEntityType(name, metadata) {

    return lookupInMetadata(name, metadata, "entityType");
}


/** Looks up an
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns An entity container description if the name is found; null otherwise.
 */
function lookupDefaultEntityContainer(metadata) {

    return forEachSchema(metadata, function (schema) {
        if (isObject(schema.entityContainer)) { 
            return schema.entityContainer;
        }
    });
}

/** Looks up an entity container object by name.
 * @param {String} name - Name, possibly null or empty.
 * @param metadata - Metadata store; one of edmx, schema, or an array of any of them.
 * @returns An entity container description if the name is found; null otherwise.
 */
function lookupEntityContainer(name, metadata) {

    return lookupInMetadata(name, metadata, "entityContainer");
}

/** Looks up a function import by name.
 * @param {Array} functionImports - Array of function import objects as per EDM metadata (May be null)
 * @param {String} name - Name to look for.
 * @returns {Object} The entity set object; null if not found.
 */
function lookupFunctionImport(functionImports, name) {
    return find(functionImports, function (functionImport) {
        return functionImport.name === name;
    });
}

/** Looks up the target entity type for a navigation property.
 * @param {Object} navigationProperty - 
 * @param {Object} metadata - 
 * @returns {String} The entity type name for the specified property, null if not found.
 */
function lookupNavigationPropertyType(navigationProperty, metadata) {

    var result = null;
    if (navigationProperty) {
        var rel = navigationProperty.relationship;
        var association = forEachSchema(metadata, function (schema) {
            // The name should be the namespace qualified name in 'ns'.'type' format.
            var nameOnly = removeNamespace(schema.namespace, rel);
            var associations = schema.association;
            if (nameOnly && associations) {
                var i, len;
                for (i = 0, len = associations.length; i < len; i++) {
                    if (associations[i].name === nameOnly) {
                        return associations[i];
                    }
                }
            }
            return null;
        });

        if (association) {
            var end = association.end[0];
            if (end.role !== navigationProperty.toRole) {
                end = association.end[1];
                // For metadata to be valid, end.role === navigationProperty.toRole now.
            }
            result = end.type;
        }
    }
    return result;
}

/** Looks up the target entityset name for a navigation property.
 * @param {Object} navigationProperty - 
 * @param {Object} sourceEntitySetName -
 * @param {Object} metadata -
 * metadata
 * @returns {String} The entityset name for the specified property, null if not found.
 */
function lookupNavigationPropertyEntitySet(navigationProperty, sourceEntitySetName, metadata) {

    if (navigationProperty) {
        var rel = navigationProperty.relationship;
        var associationSet = forEachSchema(metadata, function (schema) {
            var containers = schema.entityContainer;
            for (var i = 0; i < containers.length; i++) {
                var associationSets = containers[i].associationSet;
                if (associationSets) {
                    for (var j = 0; j < associationSets.length; j++) {
                        if (associationSets[j].association == rel) {
                            return associationSets[j];
                        }
                    }
                }
            }
            return null;
        });
        if (associationSet && associationSet.end[0] && associationSet.end[1]) {
            return (associationSet.end[0].entitySet == sourceEntitySetName) ? associationSet.end[1].entitySet : associationSet.end[0].entitySet;
        }
    }
    return null;
}

/** Gets the entitySet info, container name and functionImports for an entitySet
 * @param {Object} entitySetName -
 * @param {Object} metadata - 
 * @returns {Object} The info about the entitySet.
 */
function getEntitySetInfo(entitySetName, metadata) {

    var info = forEachSchema(metadata, function (schema) {
        var container = schema.entityContainer;
        var entitySets = container.entitySet;
        if (entitySets) {
            for (var j = 0; j < entitySets.length; j++) {
                if (entitySets[j].name == entitySetName) {
                    return { entitySet: entitySets[j], containerName: container.name, functionImport: container.functionImport };
                }
            }
        }
        return null;
    });

    return info;
}

/** Given an expected namespace prefix, removes it from a full name.
 * @param {String} ns - Expected namespace.
 * @param {String} fullName - Full name in 'ns'.'name' form.
 * @returns {String} The local name, null if it isn't found in the expected namespace.
 */
function removeNamespace(ns, fullName) {

    if (fullName.indexOf(ns) === 0 && fullName.charAt(ns.length) === ".") {
        return fullName.substr(ns.length + 1);
    }

    return null;
}

/** Looks up a schema object by name.
 * @param {String} name - Name (assigned).
 * @param schema - Schema object as per EDM metadata.
 * @param {String} kind - Kind of object to look for as per EDM metadata.
 * @returns An entity type description if the name is found; null otherwise.
 */
function lookupInSchema(name, schema, kind) {

    if (name && schema) {
        // The name should be the namespace qualified name in 'ns'.'type' format.
        var nameOnly = removeNamespace(schema.namespace, name);
        if (nameOnly) {
            return find(schema[kind], function (item) {
                return item.name === nameOnly;
            });
        }
    }
    return null;
}

/** Compares to version strings and returns the higher one.
 * @param {String} left - Version string in the form "major.minor.rev"
 * @param {String} right - Version string in the form "major.minor.rev"
 * @returns {String} The higher version string.
 */
function maxVersion(left, right) {

    if (left === right) {
        return left;
    }

    var leftParts = left.split(".");
    var rightParts = right.split(".");

    var len = (leftParts.length >= rightParts.length) ?
        leftParts.length :
        rightParts.length;

    for (var i = 0; i < len; i++) {
        var leftVersion = leftParts[i] && parseInt10(leftParts[i]);
        var rightVersion = rightParts[i] && parseInt10(rightParts[i]);
        if (leftVersion > rightVersion) {
            return left;
        }
        if (leftVersion < rightVersion) {
            return right;
        }
    }
}

var normalHeaders = {
    // Headers shared by request and response
    "content-type": "Content-Type",
    "content-encoding": "Content-Encoding",
    "content-length": "Content-Length",
    "odata-version": "OData-Version",
    
    // Headers used by request
    "accept": "Accept",
    "accept-charset": "Accept-Charset",
    "if-match": "If-Match",
    "if-none-match": "If-None-Match",
    "odata-isolation": "OData-Isolation",
    "odata-maxversion": "OData-MaxVersion",
    "prefer": "Prefer",
    "content-id": "Content-ID",
    "content-transfer-encoding": "Content-Transfer-Encoding",
    
    // Headers used by response
    "etag": "ETag",
    "location": "Location",
    "odata-entityid": "OData-EntityId",
    "preference-applied": "Preference-Applied",
    "retry-after": "Retry-After"
};

/** Normalizes headers so they can be found with consistent casing.
 * @param {Object} headers - Dictionary of name/value pairs.
 */
function normalizeHeaders(headers) {

    for (var name in headers) {
        var lowerName = name.toLowerCase();
        var normalName = normalHeaders[lowerName];
        if (normalName && name !== normalName) {
            var val = headers[name];
            delete headers[name];
            headers[normalName] = val;
        }
    }
}

/** Parses a string into a boolean value.
 * @param propertyValue - Value to parse.
 * @returns {Boolean} true if the property value is 'true'; false otherwise.
 */
function parseBool(propertyValue) {

    if (typeof propertyValue === "boolean") {
        return propertyValue;
    }

    return typeof propertyValue === "string" && propertyValue.toLowerCase() === "true";
}


// The captured indices for this expression are:
// 0     - complete input
// 1,2,3 - year with optional minus sign, month, day
// 4,5,6 - hours, minutes, seconds
// 7     - optional milliseconds
// 8     - everything else (presumably offset information)
var parseDateTimeRE = /^(-?\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?(.*)$/;

/** Parses a string into a DateTime value.
 * @param {String} value - Value to parse.
 * @param {Boolean} withOffset - Whether offset is expected.
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {Date} The parsed value.
 */
function parseDateTimeMaybeOffset(value, withOffset, nullOnError) {

    // We cannot parse this in cases of failure to match or if offset information is specified.
    var parts = parseDateTimeRE.exec(value);
    var offset = (parts) ? getCanonicalTimezone(parts[8]) : null;

    if (!parts || (!withOffset && offset !== "Z")) {
        if (nullOnError) {
            return null;
        }
        throw { message: "Invalid date/time value" };
    }

    // Pre-parse years, account for year '0' being invalid in dateTime.
    var year = parseInt10(parts[1]);
    if (year <= 0) {
        year++;
    }

    // Pre-parse optional milliseconds, fill in default. Fail if value is too precise.
    var ms = parts[7];
    var ns = 0;
    if (!ms) {
        ms = 0;
    } else {
        if (ms.length > 7) {
            if (nullOnError) {
                return null;
            }
            throw { message: "Cannot parse date/time value to given precision." };
        }

        ns = formatNumberWidth(ms.substring(3), 4, true);
        ms = formatNumberWidth(ms.substring(0, 3), 3, true);

        ms = parseInt10(ms);
        ns = parseInt10(ns);
    }

    // Pre-parse other time components and offset them if necessary.
    var hours = parseInt10(parts[4]);
    var minutes = parseInt10(parts[5]);
    var seconds = parseInt10(parts[6]) || 0;
    if (offset !== "Z") {
        // The offset is reversed to get back the UTC date, which is
        // what the API will eventually have.
        var timezone = parseTimezone(offset);
        var direction = -(timezone.d);
        hours += timezone.h * direction;
        minutes += timezone.m * direction;
    }

    // Set the date and time separately with setFullYear, so years 0-99 aren't biased like in Date.UTC.
    var result = new Date();
    result.setUTCFullYear(
        year,                       // Year.
        parseInt10(parts[2]) - 1,   // Month (zero-based for Date.UTC and setFullYear).
        parseInt10(parts[3])        // Date.
        );
    result.setUTCHours(hours, minutes, seconds, ms);

    if (isNaN(result.valueOf())) {
        if (nullOnError) {
            return null;
        }
        throw { message: "Invalid date/time value" };
    }

    if (withOffset) {
        result.__edmType = "Edm.DateTimeOffset";
        result.__offset = offset;
    }

    if (ns) {
        result.__ns = ns;
    }

    return result;
}

/** Parses a string into a Date object.
 * @param {String} propertyValue - Value to parse.
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {Date} The parsed with year, month, day set, time values are set to 0
 */
function parseDate(propertyValue, nullOnError) {
    var parts = propertyValue.split('-');

    if (parts.length != 3 && nullOnError) {
        return null;
    }
    return new Date(
        parseInt10(parts[0]),       // Year.
        parseInt10(parts[1]) - 1,   // Month (zero-based for Date.UTC and setFullYear).
        parseInt10(parts[2],
        0,0,0,0)        // Date.
        );

}

var parseTimeOfDayRE = /^(\d+):(\d+)(:(\d+)(.(\d+))?)?$/;

/**Parses a time into a Date object.
 * @param propertyValue
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {{h: Number, m: Number, s: Number, ms: Number}}
 */
function parseTimeOfDay(propertyValue, nullOnError) {
    var parts = parseTimeOfDayRE.exec(propertyValue);


    return {
        'h' :parseInt10(parts[1]),
        'm' :parseInt10(parts[2]),
        's' :parseInt10(parts[4]),
        'ms' :parseInt10(parts[6])
     };
}

/** Parses a string into a DateTimeOffset value.
 * @param {String} propertyValue - Value to parse.
 * @param {Boolean} nullOnError - return null instead of throwing an exception
 * @returns {Date} The parsed value.
 * The resulting object is annotated with an __edmType property and
 * an __offset property reflecting the original intended offset of
 * the value. The time is adjusted for UTC time, as the current
 * timezone-aware Date APIs will only work with the local timezone.
 */
function parseDateTimeOffset(propertyValue, nullOnError) {
    

    return parseDateTimeMaybeOffset(propertyValue, true, nullOnError);
}

// The captured indices for this expression are:
// 0       - complete input
// 1       - direction
// 2,3,4   - years, months, days
// 5,6,7,8 - hours, minutes, seconds, miliseconds

var parseTimeRE = /^([+-])?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d+))?S)?)?/;

function isEdmDurationValue(value) {
    parseTimeRE.test(value);
}

/** Parses a string in xsd:duration format.
 * @param {String} duration - Duration value.

 * This method will throw an exception if the input string has a year or a month component.

 * @returns {Object} Object representing the time
 */
function parseDuration(duration) {

    var parts = parseTimeRE.exec(duration);

    if (parts === null) {
        throw { message: "Invalid duration value." };
    }

    var years = parts[2] || "0";
    var months = parts[3] || "0";
    var days = parseInt10(parts[4] || 0);
    var hours = parseInt10(parts[5] || 0);
    var minutes = parseInt10(parts[6] || 0);
    var seconds = parseFloat(parts[7] || 0);

    if (years !== "0" || months !== "0") {
        throw { message: "Unsupported duration value." };
    }

    var ms = parts[8];
    var ns = 0;
    if (!ms) {
        ms = 0;
    } else {
        if (ms.length > 7) {
            throw { message: "Cannot parse duration value to given precision." };
        }

        ns = formatNumberWidth(ms.substring(3), 4, true);
        ms = formatNumberWidth(ms.substring(0, 3), 3, true);

        ms = parseInt10(ms);
        ns = parseInt10(ns);
    }

    ms += seconds * 1000 + minutes * 60000 + hours * 3600000 + days * 86400000;

    if (parts[1] === "-") {
        ms = -ms;
    }

    var result = { ms: ms, __edmType: "Edm.Time" };

    if (ns) {
        result.ns = ns;
    }
    return result;
}

/** Parses a timezone description in (+|-)nn:nn format.
 * @param {String} timezone - Timezone offset.
 * @returns {Object} An object with a (d)irection property of 1 for + and -1 for -, offset (h)ours and offset (m)inutes.
 */
function parseTimezone(timezone) {

    var direction = timezone.substring(0, 1);
    direction = (direction === "+") ? 1 : -1;

    var offsetHours = parseInt10(timezone.substring(1));
    var offsetMinutes = parseInt10(timezone.substring(timezone.indexOf(":") + 1));
    return { d: direction, h: offsetHours, m: offsetMinutes };
}

/** Prepares a request object so that it can be sent through the network.
* @param request - Object that represents the request to be sent.
* @param handler - Handler for data serialization
* @param context - Context used for preparing the request
*/
function prepareRequest(request, handler, context) {

    // Default to GET if no method has been specified.
    if (!request.method) {
        request.method = "GET";
    }

    if (!request.headers) {
        request.headers = {};
    } else {
        normalizeHeaders(request.headers);
    }

    if (request.headers.Accept === undefined) {
        request.headers.Accept = handler.accept;
    }

    if (assigned(request.data) && request.body === undefined) {
        handler.write(request, context);
    }

    if (!assigned(request.headers["OData-MaxVersion"])) {
        request.headers["OData-MaxVersion"] = handler.maxDataServiceVersion || "4.0";
    }

    if (request.async === undefined) {
        request.async = true;
    }

}

/** Traverses a tree of objects invoking callback for every value.
 * @param {Object} item - Object or array to traverse.
 * @param {Object} owner - Pass through each callback
 * @param {Function} callback - Callback function with key and value, similar to JSON.parse reviver.
 * @returns {Object} The object with traversed properties.
 Unlike the JSON reviver, this won't delete null members.
*/
function traverseInternal(item, owner, callback) {

    if (item && typeof item === "object") {
        for (var name in item) {
            var value = item[name];
            var result = traverseInternal(value, name, callback);
            result = callback(name, result, owner);
            if (result !== value) {
                if (value === undefined) {
                    delete item[name];
                } else {
                    item[name] = result;
                }
            }
        }
    }

    return item;
}

/** Traverses a tree of objects invoking callback for every value.
 * @param {Object} item - Object or array to traverse.
 * @param {Function} callback - Callback function with key and value, similar to JSON.parse reviver.
 * @returns {Object} The traversed object.
 * Unlike the JSON reviver, this won't delete null members.
*/
function traverse(item, callback) {

    return callback("", traverseInternal(item, "", callback));
}

exports.dataItemTypeName = dataItemTypeName;
exports.EDM_BINARY = EDM_BINARY;
exports.EDM_BOOLEAN = EDM_BOOLEAN;
exports.EDM_BYTE = EDM_BYTE;
exports.EDM_DATE = EDM_DATE;
exports.EDM_DATETIMEOFFSET = EDM_DATETIMEOFFSET;
exports.EDM_DURATION = EDM_DURATION;
exports.EDM_DECIMAL = EDM_DECIMAL;
exports.EDM_DOUBLE = EDM_DOUBLE;
exports.EDM_GEOGRAPHY = EDM_GEOGRAPHY;
exports.EDM_GEOGRAPHY_POINT = EDM_GEOGRAPHY_POINT;
exports.EDM_GEOGRAPHY_LINESTRING = EDM_GEOGRAPHY_LINESTRING;
exports.EDM_GEOGRAPHY_POLYGON = EDM_GEOGRAPHY_POLYGON;
exports.EDM_GEOGRAPHY_COLLECTION = EDM_GEOGRAPHY_COLLECTION;
exports.EDM_GEOGRAPHY_MULTIPOLYGON = EDM_GEOGRAPHY_MULTIPOLYGON;
exports.EDM_GEOGRAPHY_MULTILINESTRING = EDM_GEOGRAPHY_MULTILINESTRING;
exports.EDM_GEOGRAPHY_MULTIPOINT = EDM_GEOGRAPHY_MULTIPOINT;
exports.EDM_GEOMETRY = EDM_GEOMETRY;
exports.EDM_GEOMETRY_POINT = EDM_GEOMETRY_POINT;
exports.EDM_GEOMETRY_LINESTRING = EDM_GEOMETRY_LINESTRING;
exports.EDM_GEOMETRY_POLYGON = EDM_GEOMETRY_POLYGON;
exports.EDM_GEOMETRY_COLLECTION = EDM_GEOMETRY_COLLECTION;
exports.EDM_GEOMETRY_MULTIPOLYGON = EDM_GEOMETRY_MULTIPOLYGON;
exports.EDM_GEOMETRY_MULTILINESTRING = EDM_GEOMETRY_MULTILINESTRING;
exports.EDM_GEOMETRY_MULTIPOINT = EDM_GEOMETRY_MULTIPOINT;
exports.EDM_GUID = EDM_GUID;
exports.EDM_INT16 = EDM_INT16;
exports.EDM_INT32 = EDM_INT32;
exports.EDM_INT64 = EDM_INT64;
exports.EDM_SBYTE = EDM_SBYTE;
exports.EDM_SINGLE = EDM_SINGLE;
exports.EDM_STRING = EDM_STRING;
exports.EDM_TIMEOFDAY = EDM_TIMEOFDAY;
exports.GEOJSON_POINT = GEOJSON_POINT;
exports.GEOJSON_LINESTRING = GEOJSON_LINESTRING;
exports.GEOJSON_POLYGON = GEOJSON_POLYGON;
exports.GEOJSON_MULTIPOINT = GEOJSON_MULTIPOINT;
exports.GEOJSON_MULTILINESTRING = GEOJSON_MULTILINESTRING;
exports.GEOJSON_MULTIPOLYGON = GEOJSON_MULTIPOLYGON;
exports.GEOJSON_GEOMETRYCOLLECTION = GEOJSON_GEOMETRYCOLLECTION;
exports.forEachSchema = forEachSchema;
exports.formatDateTimeOffset = formatDateTimeOffset;
exports.formatDateTimeOffsetJSON = formatDateTimeOffsetJSON;
exports.formatDuration = formatDuration;
exports.formatNumberWidth = formatNumberWidth;
exports.getCanonicalTimezone = getCanonicalTimezone;
exports.getCollectionType = getCollectionType;
exports.invokeRequest = invokeRequest;
exports.isBatch = isBatch;
exports.isCollection = isCollection;
exports.isCollectionType = isCollectionType;
exports.isComplex = isComplex;
exports.isDateTimeOffset = isDateTimeOffset;
exports.isDeferred = isDeferred;
exports.isEntry = isEntry;
exports.isFeed = isFeed;
exports.isGeographyEdmType = isGeographyEdmType;
exports.isGeometryEdmType = isGeometryEdmType;
exports.isNamedStream = isNamedStream;
exports.isPrimitive = isPrimitive;
exports.isPrimitiveEdmType = isPrimitiveEdmType;
exports.lookupComplexType = lookupComplexType;
exports.lookupDefaultEntityContainer = lookupDefaultEntityContainer;
exports.lookupEntityContainer = lookupEntityContainer;
exports.lookupEntitySet = lookupEntitySet;
exports.lookupSingleton = lookupSingleton;
exports.lookupEntityType = lookupEntityType;
exports.lookupFunctionImport = lookupFunctionImport;
exports.lookupNavigationPropertyType = lookupNavigationPropertyType;
exports.lookupNavigationPropertyEntitySet = lookupNavigationPropertyEntitySet;
exports.lookupInSchema = lookupInSchema;
exports.lookupProperty = lookupProperty;
exports.lookupInMetadata = lookupInMetadata;
exports.getEntitySetInfo = getEntitySetInfo;
exports.maxVersion = maxVersion;
exports.navigationPropertyKind = navigationPropertyKind;
exports.normalizeHeaders = normalizeHeaders;
exports.parseBool = parseBool;


exports.parseDate = parseDate;
exports.parseDateTimeOffset = parseDateTimeOffset;
exports.parseDuration = parseDuration;
exports.parseTimeOfDay = parseTimeOfDay;

exports.parseInt10 = parseInt10;
exports.prepareRequest = prepareRequest;
exports.removeNamespace = removeNamespace;
exports.traverse = traverse;


}, "store" : function(exports, module, require) {
//'use strict';

 /** @module store */





exports.defaultStoreMechanism = "best";

/** Creates a new store object.
 * @param {String} name - Store name.
 * @param {String} [mechanism] - 
 * @returns {Object} Store object.
*/
exports.createStore = function (name, mechanism) {


    if (!mechanism) {
        mechanism = exports.defaultStoreMechanism;
    }

    if (mechanism === "best") {
        mechanism = (DomStore.isSupported()) ? "dom" : "memory";
    }

    var factory = mechanisms[mechanism];
    if (factory) {
        return factory.create(name);
    }

    throw { message: "Failed to create store", name: name, mechanism: mechanism };
};

exports.DomStore       = DomStore       = require('./store/dom.js');
exports.IndexedDBStore = IndexedDBStore = require('./store/indexeddb.js');
exports.MemoryStore    = MemoryStore    = require('./store/memory.js');

var mechanisms = {
    indexeddb: IndexedDBStore,
    dom: DomStore,
    memory: MemoryStore
};

exports.mechanisms = mechanisms;




}, "dom" : function(exports, module, require) {
'use strict';

/** @module store/dom */



var utils = require('./../utils.js');

// Imports.
var throwErrorCallback = utils.throwErrorCallback;
var delay = utils.delay;

var localStorage = null;

/** This method is used to override the Date.toJSON method and is called only by
 * JSON.stringify.  It should never be called directly.
 * @summary Converts a Date object into an object representation friendly to JSON serialization.
 * @returns {Object} Object that represents the Date.
 */
function domStoreDateToJSON() {
    var newValue = { v: this.valueOf(), t: "[object Date]" };
    // Date objects might have extra properties on them so we save them.
    for (var name in this) {
        newValue[name] = this[name];
    }
    return newValue;
}

/** This method is used during JSON parsing and invoked only by the reviver function.
 * It should never be called directly.
 * @summary JSON reviver function for converting an object representing a Date in a JSON stream to a Date object
 * @param value _
 * @param value - Object to convert.
 * @returns {Date} Date object.
 */
function domStoreJSONToDate(_, value) {
    if (value && value.t === "[object Date]") {
        var newValue = new Date(value.v);
        for (var name in value) {
            if (name !== "t" && name !== "v") {
                newValue[name] = value[name];
            }
        }
        value = newValue;
    }
    return value;
}

/** Qualifies the key with the name of the store.
 * @param {Object} store - Store object whose name will be used for qualifying the key.
 * @param {String} key - Key string.
 * @returns {String} Fully qualified key string.
 */
function qualifyDomStoreKey(store, key) {
    return store.name + "#!#" + key;
}

/** Gets the key part of a fully qualified key string.
 * @param {Object} store - Store object whose name will be used for qualifying the key.
 * @param {String} key - Fully qualified key string.
 * @returns {String} Key part string
 */
function unqualifyDomStoreKey(store, key) {
    return key.replace(store.name + "#!#", "");
}

/** Constructor for store objects that use DOM storage as the underlying mechanism.
 * @class DomStore
 * @constructor
 * @param {String} name - Store name.
 */
function DomStore(name) {
    this.name = name;
}

/** Creates a store object that uses DOM Storage as its underlying mechanism.
 * @method module:store/dom~DomStore.create
 * @param {String} name - Store name.
 * @returns {Object} Store object.
 */
DomStore.create = function (name) {

    if (DomStore.isSupported()) {
        localStorage = localStorage || window.localStorage;
        return new DomStore(name);
    }

    throw { message: "Web Storage not supported by the browser" };
};

/** Checks whether the underlying mechanism for this kind of store objects is supported by the browser.
 * @method DomStore.isSupported
 * @returns {Boolean} - True if the mechanism is supported by the browser; otherwise false.
*/
DomStore.isSupported = function () {
    return !!window.localStorage;
};

/** Adds a new value identified by a key to the store.
 * @method module:store/dom~DomStore#add
 * @param {String} key - Key string.
 * @param value - Value that is going to be added to the store.
 * @param {Function} success - Callback for a successful add operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 * This method errors out if the store already contains the specified key.
 */
DomStore.prototype.add = function (key, value, success, error) {
    error = error || this.defaultError;
    var store = this;
    this.contains(key, function (contained) {
        if (!contained) {
            store.addOrUpdate(key, value, success, error);
        } else {
            delay(error, { message: "key already exists", key: key });
        }
    }, error);
};

/** This method will overwrite the key's current value if it already exists in the store; otherwise it simply adds the new key and value.
 * @summary Adds or updates a value identified by a key to the store.
 * @method module:store/dom~DomStore#addOrUpdate
 * @param {String} key - Key string.
 * @param value - Value that is going to be added or updated to the store.
 * @param {Function} success - Callback for a successful add or update operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 */
DomStore.prototype.addOrUpdate = function (key, value, success, error) {
    error = error || this.defaultError;

    if (key instanceof Array) {
        error({ message: "Array of keys not supported" });
    } else {
        var fullKey = qualifyDomStoreKey(this, key);
        var oldDateToJSON = Date.prototype.toJSON;
        try {
            var storedValue = value;
            if (storedValue !== undefined) {
                // Dehydrate using json
                Date.prototype.toJSON = domStoreDateToJSON;
                storedValue = window.JSON.stringify(value);
            }
            // Save the json string.
            localStorage.setItem(fullKey, storedValue);
            delay(success, key, value);
        }
        catch (e) {
            if (e.code === 22 || e.number === 0x8007000E) {
                delay(error, { name: "QUOTA_EXCEEDED_ERR", error: e });
            } else {
                delay(error, e);
            }
        }
        finally {
            Date.prototype.toJSON = oldDateToJSON;
        }
    }
};

/** In case of an error, this method will not restore any keys that might have been deleted at that point.
 * @summary Removes all the data associated with this store object.
 * @method module:store/dom~DomStore#clear
 * @param {Function} success - Callback for a successful clear operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 */
DomStore.prototype.clear = function (success, error) {

    error = error || this.defaultError;
    try {
        var i = 0, len = localStorage.length;
        while (len > 0 && i < len) {
            var fullKey = localStorage.key(i);
            var key = unqualifyDomStoreKey(this, fullKey);
            if (fullKey !== key) {
                localStorage.removeItem(fullKey);
                len = localStorage.length;
            } else {
                i++;
            }
        }
        delay(success);
    }
    catch (e) {
        delay(error, e);
    }
};

/** This function does nothing in DomStore as it does not have a connection model
 * @method module:store/dom~DomStore#close
 */
DomStore.prototype.close = function () {
};

/** Checks whether a key exists in the store.
 * @method module:store/dom~DomStore#contains
 * @param {String} key - Key string.
 * @param {Function} success - Callback indicating whether the store contains the key or not.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
*/
DomStore.prototype.contains = function (key, success, error) {
    error = error || this.defaultError;
    try {
        var fullKey = qualifyDomStoreKey(this, key);
        var value = localStorage.getItem(fullKey);
        delay(success, value !== null);
    } catch (e) {
        delay(error, e);
    }
};

DomStore.prototype.defaultError = throwErrorCallback;

/** Gets all the keys that exist in the store.
 * @method module:store/dom~DomStore#getAllKeys
 * @param {Function} success - Callback for a successful get operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 */
DomStore.prototype.getAllKeys = function (success, error) {

    error = error || this.defaultError;

    var results = [];
    var i, len;

    try {
        for (i = 0, len = localStorage.length; i < len; i++) {
            var fullKey = localStorage.key(i);
            var key = unqualifyDomStoreKey(this, fullKey);
            if (fullKey !== key) {
                results.push(key);
            }
        }
        delay(success, results);
    }
    catch (e) {
        delay(error, e);
    }
};

/** Identifies the underlying mechanism used by the store.*/
DomStore.prototype.mechanism = "dom";

/** Reads the value associated to a key in the store.
 * @method module:store/dom~DomStore#read
 * @param {String} key - Key string.
 * @param {Function} success - Callback for a successful reads operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 */
DomStore.prototype.read = function (key, success, error) {

    error = error || this.defaultError;

    if (key instanceof Array) {
        error({ message: "Array of keys not supported" });
    } else {
        try {
            var fullKey = qualifyDomStoreKey(this, key);
            var value = localStorage.getItem(fullKey);
            if (value !== null && value !== "undefined") {
                // Hydrate using json
                value = window.JSON.parse(value, domStoreJSONToDate);
            }
            else {
                value = undefined;
            }
            delay(success, key, value);
        } catch (e) {
            delay(error, e);
        }
    }
};

/** Removes a key and its value from the store.
 * @method module:store/dom~DomStore#remove
 * @param {String} key - Key string.
 * @param {Function} success - Callback for a successful remove operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
 */
DomStore.prototype.remove = function (key, success, error) {
    error = error || this.defaultError;

    if (key instanceof Array) {
        error({ message: "Batches not supported" });
    } else {
        try {
            var fullKey = qualifyDomStoreKey(this, key);
            localStorage.removeItem(fullKey);
            delay(success);
        } catch (e) {
            delay(error, e);
        }
    }
};

/** Updates the value associated to a key in the store.
 * @method module:store/dom~DomStore#update
 * @param {String} key - Key string.
 * @param value - New value.
 * @param {Function} success - Callback for a successful update operation.
 * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked
 * This method errors out if the specified key is not found in the store.
 */
DomStore.prototype.update = function (key, value, success, error) {
    error = error || this.defaultError;
    var store = this;
    this.contains(key, function (contained) {
        if (contained) {
            store.addOrUpdate(key, value, success, error);
        } else {
            delay(error, { message: "key not found", key: key });
        }
    }, error);
};

module.exports = DomStore;}, "indexeddb" : function(exports, module, require) {
'use strict';

/** @module store/indexeddb */
var utils = require('./../utils.js');

// Imports.
var throwErrorCallback = utils.throwErrorCallback;
var delay = utils.delay;


var indexedDB = utils.inBrowser() ? window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.indexedDB : undefined;
var IDBKeyRange = utils.inBrowser() ? window.IDBKeyRange || window.webkitIDBKeyRange : undefined;
var IDBTransaction = utils.inBrowser() ? window.IDBTransaction || window.webkitIDBTransaction || {} : {} ;

var IDBT_READ_ONLY = IDBTransaction.READ_ONLY || "readonly";
var IDBT_READ_WRITE = IDBTransaction.READ_WRITE || "readwrite";

/** Returns either a specific error handler or the default error handler
 * @param {Function} error - The specific error handler
 * @param {Function} defaultError - The default error handler
 * @returns {Function} The error callback
 */
function getError(error, defaultError) {

    return function (e) {
        var errorFunc = error || defaultError;
        if (!errorFunc) {
            return;
        }

        // Old api quota exceeded error support.
        if (Object.prototype.toString.call(e) === "[object IDBDatabaseException]") {
            if (e.code === 11 /* IndexedDb disk quota exceeded */) {
                errorFunc({ name: "QuotaExceededError", error: e });
                return;
            }
            errorFunc(e);
            return;
        }

        var errName;
        try {
            var errObj = e.target.error || e;
            errName = errObj.name;
        } catch (ex) {
            errName = (e.type === "blocked") ? "IndexedDBBlocked" : "UnknownError";
        }
        errorFunc({ name: errName, error: e });
    };
}

/** Opens the store object's indexed db database.
 * @param {IndexedDBStore} store - The store object
 * @param {Function} success - The success callback
 * @param {Function} error - The error callback
 */
function openStoreDb(store, success, error) {

    var storeName = store.name;
    var dbName = "_odatajs_" + storeName;

    var request = indexedDB.open(dbName);
    request.onblocked = error;
    request.onerror = error;

    request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
        }
    };

    request.onsuccess = function (event) {
        var db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
            // Should we use the old style api to define the database schema?
            if ("setVersion" in db) {
                var versionRequest = db.setVersion("1.0");
                versionRequest.onsuccess = function () {
                    var transaction = versionRequest.transaction;
                    transaction.oncomplete = function () {
                        success(db);
                    };
                    db.createObjectStore(storeName, null, false);
                };
                versionRequest.onerror = error;
                versionRequest.onblocked = error;
                return;
            }

            // The database doesn't have the expected store.
            // Fabricate an error object for the event for the schema mismatch
            // and error out.
            event.target.error = { name: "DBSchemaMismatch" };
            error(event);
            return;
        }

        db.onversionchange = function(event) {
            event.target.close();
        };
        success(db);
    };
}

/** Opens a new transaction to the store
 * @param {IndexedDBStore} store - The store object
 * @param {Integer} mode - The read/write mode of the transaction (constants from IDBTransaction)
 * @param {Function} success - The success callback
 * @param {Function} error - The error callback
 */
function openTransaction(store, mode, success, error) {

    var storeName = store.name;
    var storeDb = store.db;
    var errorCallback = getError(error, store.defaultError);

    if (storeDb) {
        success(storeDb.transaction(storeName, mode));
        return;
    }

    openStoreDb(store, function (db) {
        store.db = db;
        success(db.transaction(storeName, mode));
    }, errorCallback);
}

/** Creates a new IndexedDBStore.
 * @class IndexedDBStore
 * @constructor
 * @param {String} name - The name of the store.
 * @returns {Object} The new IndexedDBStore.
 */
function IndexedDBStore(name) {
    this.name = name;
}

/** Creates a new IndexedDBStore.
 * @method module:store/indexeddb~IndexedDBStore.create
 * @param {String} name - The name of the store.
 * @returns {Object} The new IndexedDBStore.
 */
IndexedDBStore.create = function (name) {
    if (IndexedDBStore.isSupported()) {
        return new IndexedDBStore(name);
    }

    throw { message: "IndexedDB is not supported on this browser" };
};

/** Returns whether IndexedDB is supported.
 * @method module:store/indexeddb~IndexedDBStore.isSupported
 * @returns {Boolean} True if IndexedDB is supported, false otherwise.
 */
IndexedDBStore.isSupported = function () {
    return !!indexedDB;
};

/** Adds a key/value pair to the store
 * @method module:store/indexeddb~IndexedDBStore#add
 * @param {String} key - The key
 * @param {Object} value - The value
 * @param {Function} success - The success callback
 * @param {Function} error - The error callback
*/
IndexedDBStore.prototype.add = function (key, value, success, error) {
    var name = this.name;
    var defaultError = this.defaultError;
    var keys = [];
    var values = [];

    if (key instanceof Array) {
        keys = key;
        values = value;
    } else {
        keys = [key];
        values = [value];
    }

    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        transaction.onabort = getError(error, defaultError, key, "add");
        transaction.oncomplete = function () {
            if (key instanceof Array) {
                success(keys, values);
            } else {
                success(key, value);
            }
        };

        for (var i = 0; i < keys.length && i < values.length; i++) {
            transaction.objectStore(name).add({ v: values[i] }, keys[i]);
        }
    }, error);
};

/** Adds or updates a key/value pair in the store
 * @method module:store/indexeddb~IndexedDBStore#addOrUpdate
 * @param {String} key - The key
 * @param {Object} value - The value
 * @param {Function} success - The success callback
 * @param {Function} error - The error callback
 */
IndexedDBStore.prototype.addOrUpdate = function (key, value, success, error) {
    var name = this.name;
    var defaultError = this.defaultError;
    var keys = [];
    var values = [];

    if (key instanceof Array) {
        keys = key;
        values = value;
    } else {
        keys = [key];
        values = [value];
    }

    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        transaction.onabort = getError(error, defaultError);
        transaction.oncomplete = function () {
            if (key instanceof Array) {
                success(keys, values);
            } else {
                success(key, value);
            }
        };

        for (var i = 0; i < keys.length && i < values.length; i++) {
            var record = { v: values[i] };
            transaction.objectStore(name).put(record, keys[i]);
        }
    }, error);
};

/** Clears the store
 * @method module:store/indexeddb~IndexedDBStore#clear
 * @param {Function} success - The success callback
 * @param {Function} error - The error callback
 */
IndexedDBStore.prototype.clear = function (success, error) {
    var name = this.name;
    var defaultError = this.defaultError;
    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        transaction.onerror = getError(error, defaultError);
        transaction.oncomplete = function () {
            success();
        };

        transaction.objectStore(name).clear();
    }, error);
};

/** Closes the connection to the database
 * @method module:store/indexeddb~IndexedDBStore#close
*/
IndexedDBStore.prototype.close = function () {
    
    if (this.db) {
        this.db.close();
        this.db = null;
    }
};

/** Returns whether the store contains a key
 * @method module:store/indexeddb~IndexedDBStore#contains
 * @param {String} key - The key
 * @param {Function} success - The success callback
 * @param {Function} error - The error callback
 */
IndexedDBStore.prototype.contains = function (key, success, error) {
    var name = this.name;
    var defaultError = this.defaultError;
    openTransaction(this, IDBT_READ_ONLY, function (transaction) {
        var objectStore = transaction.objectStore(name);
        var request = objectStore.get(key);

        transaction.oncomplete = function () {
            success(!!request.result);
        };
        transaction.onerror = getError(error, defaultError);
    }, error);
};

IndexedDBStore.prototype.defaultError = throwErrorCallback;

/** Gets all the keys from the store
 * @method module:store/indexeddb~IndexedDBStore#getAllKeys
 * @param {Function} success - The success callback
 * @param {Function} error - The error callback
 */
IndexedDBStore.prototype.getAllKeys = function (success, error) {
    var name = this.name;
    var defaultError = this.defaultError;
    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        var results = [];

        transaction.oncomplete = function () {
            success(results);
        };

        var request = transaction.objectStore(name).openCursor();

        request.onerror = getError(error, defaultError);
        request.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                results.push(cursor.key);
                // Some tools have issues because continue is a javascript reserved word.
                cursor["continue"].call(cursor);
            }
        };
    }, error);
};

/** Identifies the underlying mechanism used by the store.
*/
IndexedDBStore.prototype.mechanism = "indexeddb";

/** Reads the value for the specified key
 * @method module:store/indexeddb~IndexedDBStore#read
 * @param {String} key - The key
 * @param {Function} success - The success callback
 * @param {Function} error - The error callback
 * If the key does not exist, the success handler will be called with value = undefined
 */
IndexedDBStore.prototype.read = function (key, success, error) {
    var name = this.name;
    var defaultError = this.defaultError;
    var keys = (key instanceof Array) ? key : [key];

    openTransaction(this, IDBT_READ_ONLY, function (transaction) {
        var values = [];

        transaction.onerror = getError(error, defaultError, key, "read");
        transaction.oncomplete = function () {
            if (key instanceof Array) {
                success(keys, values);
            } else {
                success(keys[0], values[0]);
            }
        };

        for (var i = 0; i < keys.length; i++) {
            // Some tools have issues because get is a javascript reserved word. 
            var objectStore = transaction.objectStore(name);
            var request = objectStore.get.call(objectStore, keys[i]);
            request.onsuccess = function (event) {
                var record = event.target.result;
                values.push(record ? record.v : undefined);
            };
        }
    }, error);
};

/** Removes the specified key from the store
 * @method module:store/indexeddb~IndexedDBStore#remove
 * @param {String} key - The key
 * @param {Function} success - The success callback
 * @param {Function} error - The error callback
 */
IndexedDBStore.prototype.remove = function (key, success, error) {

    var name = this.name;
    var defaultError = this.defaultError;
    var keys = (key instanceof Array) ? key : [key];

    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        transaction.onerror = getError(error, defaultError);
        transaction.oncomplete = function () {
            success();
        };

        for (var i = 0; i < keys.length; i++) {
            // Some tools have issues because continue is a javascript reserved word.
            var objectStore = transaction.objectStore(name);
            objectStore["delete"].call(objectStore, keys[i]);
        }
    }, error);
};

/** Updates a key/value pair in the store
 * @method module:store/indexeddb~IndexedDBStore#update
 * @param {String} key - The key
 * @param {Object} value - The value
 * @param {Function} success - The success callback
 * @param {Function} error - The error callback
 */
IndexedDBStore.prototype.update = function (key, value, success, error) {
    var name = this.name;
    var defaultError = this.defaultError;
    var keys = [];
    var values = [];

    if (key instanceof Array) {
        keys = key;
        values = value;
    } else {
        keys = [key];
        values = [value];
    }

    openTransaction(this, IDBT_READ_WRITE, function (transaction) {
        transaction.onabort = getError(error, defaultError);
        transaction.oncomplete = function () {
            if (key instanceof Array) {
                success(keys, values);
            } else {
                success(key, value);
            }
        };

        for (var i = 0; i < keys.length && i < values.length; i++) {
            var request = transaction.objectStore(name).openCursor(IDBKeyRange.only(keys[i]));
            var record = { v: values[i] };
            request.pair = { key: keys[i], value: record };
            request.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    cursor.update(event.target.pair.value);
                } else {
                    transaction.abort();
                }
            }
        }
    }, error);
};


module.exports = IndexedDBStore;}, "memory" : function(exports, module, require) {
'use strict';

/** @module store/memory */


var utils = require('./../utils.js');

// Imports.
var throwErrorCallback = utils.throwErrorCallback;
var delay = utils.delay;

/** Constructor for store objects that use a sorted array as the underlying mechanism.
 * @class MemoryStore
 * @constructor
 * @param {String} name - Store name.
 */
function MemoryStore(name) {

    var holes = [];
    var items = [];
    var keys = {};

    this.name = name;

    var getErrorCallback = function (error) {
        return error || this.defaultError;
    };

    /** Validates that the specified key is not undefined, not null, and not an array
     * @param key - Key value.
     * @param {Function} error - Error callback.
     * @returns {Boolean} True if the key is valid. False if the key is invalid and the error callback has been queued for execution.
     */
    function validateKeyInput(key, error) {

        var messageString;

        if (key instanceof Array) {
            messageString = "Array of keys not supported";
        }

        if (key === undefined || key === null) {
            messageString = "Invalid key";
        }

        if (messageString) {
            delay(error, { message: messageString });
            return false;
        }
        return true;
    }

    /** This method errors out if the store already contains the specified key.
     * @summary Adds a new value identified by a key to the store.
     * @method module:store/memory~MemoryStore#add
     * @param {String} key - Key string.
     * @param value - Value that is going to be added to the store.
     * @param {Function} success - Callback for a successful add operation.
     * @param {Function} error - Callback for handling errors. If not specified then store.defaultError is invoked.
     */
    this.add = function (key, value, success, error) {
        error = getErrorCallback(error);

        if (validateKeyInput(key, error)) {
            if (!keys.hasOwnProperty(key)) {
                this.addOrUpdate(key, value, success, error);
            } else {
                error({ message: "key already exists", key: key });
            }
        }
    };

    /** This method will overwrite the key's current value if it already exists in the store; otherwise it simply adds the new key and value.
     * @summary Adds or updates a value identified by a key to the store.
     * @method module:store/memory~MemoryStore#addOrUpdate
     * @param {String} key - Key string.
     * @param value - Value that is going to be added or updated to the store.
     * @param {Function} success - Callback for a successful add or update operation.
     * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
    */
    this.addOrUpdate = function (key, value, success, error) {
        
        error = getErrorCallback(error);

        if (validateKeyInput(key, error)) {
            var index = keys[key];
            if (index === undefined) {
                if (holes.length > 0) {
                    index = holes.splice(0, 1);
                } else {
                    index = items.length;
                }
            }
            items[index] = value;
            keys[key] = index;
            delay(success, key, value);
        }
    };

    /** Removes all the data associated with this store object.
     * @method module:store/memory~MemoryStore#clear
     * @param {Function} success - Callback for a successful clear operation.
     */
    this.clear = function (success) {
        items = [];
        keys = {};
        holes = [];
        delay(success);
    };

    /** Checks whether a key exists in the store.
     * @method module:store/memory~MemoryStore#contains
     * @param {String} key - Key string.
     * @param {Function} success - Callback indicating whether the store contains the key or not.
     */
    this.contains = function (key, success) {
        var contained = keys.hasOwnProperty(key);
        delay(success, contained);
    };

    /** Gets all the keys that exist in the store.
     * @method module:store/memory~MemoryStore#getAllKeys
     * @param {Function} success - Callback for a successful get operation.
     */
    this.getAllKeys = function (success) {

        var results = [];
        for (var name in keys) {
            results.push(name);
        }
        delay(success, results);
    };

    /** Reads the value associated to a key in the store.
     * @method module:store/memory~MemoryStore#read
     * @param {String} key - Key string.
     * @param {Function} success - Callback for a successful reads operation.
     * @param {Function} error - Callback for handling errors. If not specified then store.defaultError is invoked.
     */
    this.read = function (key, success, error) {
        error = getErrorCallback(error);

        if (validateKeyInput(key, error)) {
            var index = keys[key];
            delay(success, key, items[index]);
        }
    };

    /** Removes a key and its value from the store.
     * @method module:store/memory~MemoryStore#remove
     * @param {String} key - Key string.
     * @param {Function} success - Callback for a successful remove operation.
     * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
     */
    this.remove = function (key, success, error) {
        error = getErrorCallback(error);

        if (validateKeyInput(key, error)) {
            var index = keys[key];
            if (index !== undefined) {
                if (index === items.length - 1) {
                    items.pop();
                } else {
                    items[index] = undefined;
                    holes.push(index);
                }
                delete keys[key];

                // The last item was removed, no need to keep track of any holes in the array.
                if (items.length === 0) {
                    holes = [];
                }
            }

            delay(success);
        }
    };

    /** Updates the value associated to a key in the store.
     * @method module:store/memory~MemoryStore#update
     * @param {String} key - Key string.
     * @param value - New value.
     * @param {Function} success - Callback for a successful update operation.
     * @param {Function} [error] - Callback for handling errors. If not specified then store.defaultError is invoked.
     * This method errors out if the specified key is not found in the store.
     */
    this.update = function (key, value, success, error) {
        error = getErrorCallback(error);
        if (validateKeyInput(key, error)) {
            if (keys.hasOwnProperty(key)) {
                this.addOrUpdate(key, value, success, error);
            } else {
                error({ message: "key not found", key: key });
            }
        }
    };
}

/** Creates a store object that uses memory storage as its underlying mechanism.
 * @method MemoryStore.create
 * @param {String} name - Store name.
 * @returns {Object} Store object.
 */
MemoryStore.create = function (name) {
    return new MemoryStore(name);
};

/** Checks whether the underlying mechanism for this kind of store objects is supported by the browser.
 * @method MemoryStore.isSupported
 * @returns {Boolean} True if the mechanism is supported by the browser; otherwise false.
 */
MemoryStore.isSupported = function () {
    return true;
};

/** This function does nothing in MemoryStore as it does not have a connection model.
*/
MemoryStore.prototype.close = function () {
};

MemoryStore.prototype.defaultError = throwErrorCallback;

/** Identifies the underlying mechanism used by the store.
*/
MemoryStore.prototype.mechanism = "memory";


/** MemoryStore (see {@link MemoryStore}) */
module.exports = MemoryStore;}, "utils" : function(exports, module, require) {
'use strict';

/** @module odatajs/utils */


function inBrowser() {
    return typeof window !== 'undefined';
}

/** Creates a new ActiveXObject from the given progId.
 * @param {String} progId - ProgId string of the desired ActiveXObject.
 * @returns {Object} The ActiveXObject instance. Null if ActiveX is not supported by the browser.
 * This function throws whatever exception might occur during the creation
 * of the ActiveXObject.
*/
var activeXObject = function (progId) {
    
    if (window.ActiveXObject) {
        return new window.ActiveXObject(progId);
    }
    return null;
};

/** Checks whether the specified value is different from null and undefined.
 * @param [value] Value to check ( may be null)
 * @returns {Boolean} true if the value is assigned; false otherwise.
*/     
function assigned(value) {
    return value !== null && value !== undefined;
}

/** Checks whether the specified item is in the array.
 * @param {Array} [arr] Array to check in.
 * @param item - Item to look for.
 * @returns {Boolean} true if the item is contained, false otherwise.
*/
function contains(arr, item) {
    var i, len;
    for (i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === item) {
            return true;
        }
    }
    return false;
}

/** Given two values, picks the first one that is not undefined.
 * @param a - First value.
 * @param b - Second value.
 * @returns a if it's a defined value; else b.
 */
function defined(a, b) {
    return (a !== undefined) ? a : b;
}

/** Delays the invocation of the specified function until execution unwinds.
 * @param {Function} callback - Callback function.
 */
function delay(callback) {

    if (arguments.length === 1) {
        window.setTimeout(callback, 0);
        return;
    }

    var args = Array.prototype.slice.call(arguments, 1);
    window.setTimeout(function () {
        callback.apply(this, args);
    }, 0);
}

/** Throws an exception in case that a condition evaluates to false.
 * @param {Boolean} condition - Condition to evaluate.
 * @param {String} message - Message explaining the assertion.
 * @param {Object} data - Additional data to be included in the exception.
 */
function djsassert(condition, message, data) {


    if (!condition) {
        throw { message: "Assert fired: " + message, data: data };
    }
}

/** Extends the target with the specified values.
 * @param {Object} target - Object to add properties to.
 * @param {Object} values - Object with properties to add into target.
 * @returns {Object} The target object.
*/
function extend(target, values) {
    for (var name in values) {
        target[name] = values[name];
    }

    return target;
}

function find(arr, callback) {
    /** Returns the first item in the array that makes the callback function true.
     * @param {Array} [arr] Array to check in. ( may be null)
     * @param {Function} callback - Callback function to invoke once per item in the array.
     * @returns The first item that makes the callback return true; null otherwise or if the array is null.
    */

    if (arr) {
        var i, len;
        for (i = 0, len = arr.length; i < len; i++) {
            if (callback(arr[i])) {
                return arr[i];
            }
        }
    }
    return null;
}

function isArray(value) {
    /** Checks whether the specified value is an array object.
     * @param value - Value to check.
     * @returns {Boolean} true if the value is an array object; false otherwise.
     */

    return Object.prototype.toString.call(value) === "[object Array]";
}

/** Checks whether the specified value is a Date object.
 * @param value - Value to check.
 * @returns {Boolean} true if the value is a Date object; false otherwise.
 */
function isDate(value) {
    return Object.prototype.toString.call(value) === "[object Date]";
}

/** Tests whether a value is an object.
 * @param value - Value to test.
 * @returns {Boolean} True is the value is an object; false otherwise.
 * Per javascript rules, null and array values are objects and will cause this function to return true.
 */
function isObject(value) {
    return typeof value === "object";
}

/** Parses a value in base 10.
 * @param {String} value - String value to parse.
 * @returns {Number} The parsed value, NaN if not a valid value.
*/   
function parseInt10(value) {
    return parseInt(value, 10);
}

/** Renames a property in an object.
 * @param {Object} obj - Object in which the property will be renamed.
 * @param {String} oldName - Name of the property that will be renamed.
 * @param {String} newName - New name of the property.
 * This function will not do anything if the object doesn't own a property with the specified old name.
 */
function renameProperty(obj, oldName, newName) {
    if (obj.hasOwnProperty(oldName)) {
        obj[newName] = obj[oldName];
        delete obj[oldName];
    }
}

/** Default error handler.
 * @param {Object} error - Error to handle.
 */
function throwErrorCallback(error) {
    throw error;
}

/** Removes leading and trailing whitespaces from a string.
 * @param {String} str String to trim
 * @returns {String} The string with no leading or trailing whitespace.
 */
function trimString(str) {
    if (str.trim) {
        return str.trim();
    }

    return str.replace(/^\s+|\s+$/g, '');
}

/** Returns a default value in place of undefined.
 * @param [value] Value to check (may be null)
 * @param defaultValue - Value to return if value is undefined.
 * @returns value if it's defined; defaultValue otherwise.
 * This should only be used for cases where falsy values are valid;
 * otherwise the pattern should be 'x = (value) ? value : defaultValue;'.
 */
function undefinedDefault(value, defaultValue) {
    return (value !== undefined) ? value : defaultValue;
}

// Regular expression that splits a uri into its components:
// 0 - is the matched string.
// 1 - is the scheme.
// 2 - is the authority.
// 3 - is the path.
// 4 - is the query.
// 5 - is the fragment.
var uriRegEx = /^([^:\/?#]+:)?(\/\/[^\/?#]*)?([^?#:]+)?(\?[^#]*)?(#.*)?/;
var uriPartNames = ["scheme", "authority", "path", "query", "fragment"];

/** Gets information about the components of the specified URI.
 * @param {String} uri - URI to get information from.
 * @return  {Object} An object with an isAbsolute flag and part names (scheme, authority, etc.) if available.
 */
function getURIInfo(uri) {
    var result = { isAbsolute: false };

    if (uri) {
        var matches = uriRegEx.exec(uri);
        if (matches) {
            var i, len;
            for (i = 0, len = uriPartNames.length; i < len; i++) {
                if (matches[i + 1]) {
                    result[uriPartNames[i]] = matches[i + 1];
                }
            }
        }
        if (result.scheme) {
            result.isAbsolute = true;
        }
    }

    return result;
}

/** Builds a URI string from its components.
 * @param {Object} uriInfo -  An object with uri parts (scheme, authority, etc.).
 * @returns {String} URI string.
 */
function getURIFromInfo(uriInfo) {
    return "".concat(
        uriInfo.scheme || "",
        uriInfo.authority || "",
        uriInfo.path || "",
        uriInfo.query || "",
        uriInfo.fragment || "");
}

// Regular expression that splits a uri authority into its subcomponents:
// 0 - is the matched string.
// 1 - is the userinfo subcomponent.
// 2 - is the host subcomponent.
// 3 - is the port component.
var uriAuthorityRegEx = /^\/{0,2}(?:([^@]*)@)?([^:]+)(?::{1}(\d+))?/;

// Regular expression that matches percentage enconded octects (i.e %20 or %3A);
var pctEncodingRegEx = /%[0-9A-F]{2}/ig;

/** Normalizes the casing of a URI.
 * @param {String} uri - URI to normalize, absolute or relative.
 * @returns {String} The URI normalized to lower case.
*/
function normalizeURICase(uri) {
    var uriInfo = getURIInfo(uri);
    var scheme = uriInfo.scheme;
    var authority = uriInfo.authority;

    if (scheme) {
        uriInfo.scheme = scheme.toLowerCase();
        if (authority) {
            var matches = uriAuthorityRegEx.exec(authority);
            if (matches) {
                uriInfo.authority = "//" +
                (matches[1] ? matches[1] + "@" : "") +
                (matches[2].toLowerCase()) +
                (matches[3] ? ":" + matches[3] : "");
            }
        }
    }

    uri = getURIFromInfo(uriInfo);

    return uri.replace(pctEncodingRegEx, function (str) {
        return str.toLowerCase();
    });
}

/** Normalizes a possibly relative URI with a base URI.
 * @param {String} uri - URI to normalize, absolute or relative
 * @param {String} base - Base URI to compose with (may be null)
 * @returns {String} The composed URI if relative; the original one if absolute.
 */
function normalizeURI(uri, base) {
    if (!base) {
        return uri;
    }

    var uriInfo = getURIInfo(uri);
    if (uriInfo.isAbsolute) {
        return uri;
    }

    var baseInfo = getURIInfo(base);
    var normInfo = {};
    var path;

    if (uriInfo.authority) {
        normInfo.authority = uriInfo.authority;
        path = uriInfo.path;
        normInfo.query = uriInfo.query;
    } else {
        if (!uriInfo.path) {
            path = baseInfo.path;
            normInfo.query = uriInfo.query || baseInfo.query;
        } else {
            if (uriInfo.path.charAt(0) === '/') {
                path = uriInfo.path;
            } else {
                path = mergeUriPathWithBase(uriInfo.path, baseInfo.path);
            }
            normInfo.query = uriInfo.query;
        }
        normInfo.authority = baseInfo.authority;
    }

    normInfo.path = removeDotsFromPath(path);

    normInfo.scheme = baseInfo.scheme;
    normInfo.fragment = uriInfo.fragment;

    return getURIFromInfo(normInfo);
}

/** Merges the path of a relative URI and a base URI.
 * @param {String} uriPath - Relative URI path.
 * @param {String} basePath - Base URI path.
 * @returns {String} A string with the merged path.
 */
function mergeUriPathWithBase(uriPath, basePath) {
    var path = "/";
    var end;

    if (basePath) {
        end = basePath.lastIndexOf("/");
        path = basePath.substring(0, end);

        if (path.charAt(path.length - 1) !== "/") {
            path = path + "/";
        }
    }

    return path + uriPath;
}

/** Removes the special folders . and .. from a URI's path.
 * @param {string} path - URI path component.
 * @returns {String} Path without any . and .. folders.
 */
function removeDotsFromPath(path) {
    var result = "";
    var segment = "";
    var end;

    while (path) {
        if (path.indexOf("..") === 0 || path.indexOf(".") === 0) {
            path = path.replace(/^\.\.?\/?/g, "");
        } else if (path.indexOf("/..") === 0) {
            path = path.replace(/^\/\..\/?/g, "/");
            end = result.lastIndexOf("/");
            if (end === -1) {
                result = "";
            } else {
                result = result.substring(0, end);
            }
        } else if (path.indexOf("/.") === 0) {
            path = path.replace(/^\/\.\/?/g, "/");
        } else {
            segment = path;
            end = path.indexOf("/", 1);
            if (end !== -1) {
                segment = path.substring(0, end);
            }
            result = result + segment;
            path = path.replace(segment, "");
        }
    }
    return result;
}

function convertByteArrayToHexString(str) {
    var arr = [];
    if (window.atob === undefined) {
        arr = decodeBase64(str);
    } else {
        var binaryStr = window.atob(str);
        for (var i = 0; i < binaryStr.length; i++) {
            arr.push(binaryStr.charCodeAt(i));
        }
    }
    var hexValue = "";
    var hexValues = "0123456789ABCDEF";
    for (var j = 0; j < arr.length; j++) {
        var t = arr[j];
        hexValue += hexValues[t >> 4];
        hexValue += hexValues[t & 0x0F];
    }
    return hexValue;
}

function decodeBase64(str) {
    var binaryString = "";
    for (var i = 0; i < str.length; i++) {
        var base65IndexValue = getBase64IndexValue(str[i]);
        var binaryValue = "";
        if (base65IndexValue !== null) {
            binaryValue = base65IndexValue.toString(2);
            binaryString += addBase64Padding(binaryValue);
        }
    }
    var byteArray = [];
    var numberOfBytes = parseInt(binaryString.length / 8, 10);
    for (i = 0; i < numberOfBytes; i++) {
        var intValue = parseInt(binaryString.substring(i * 8, (i + 1) * 8), 2);
        byteArray.push(intValue);
    }
    return byteArray;
}

function getBase64IndexValue(character) {
    var asciiCode = character.charCodeAt(0);
    var asciiOfA = 65;
    var differenceBetweenZanda = 6;
    if (asciiCode >= 65 && asciiCode <= 90) {           // between "A" and "Z" inclusive
        return asciiCode - asciiOfA;
    } else if (asciiCode >= 97 && asciiCode <= 122) {   // between 'a' and 'z' inclusive
        return asciiCode - asciiOfA - differenceBetweenZanda;
    } else if (asciiCode >= 48 && asciiCode <= 57) {    // between '0' and '9' inclusive
        return asciiCode + 4;
    } else if (character == "+") {
        return 62;
    } else if (character == "/") {
        return 63;
    } else {
        return null;
    }
}

function addBase64Padding(binaryString) {
    while (binaryString.length < 6) {
        binaryString = "0" + binaryString;
    }
    return binaryString;

}

function getJsonValueArraryLength(data) {
    if (data && data.value) {
        return data.value.length;
    }

    return 0;
}

function sliceJsonValueArray(data, start, end) {
    if (data === undefined || data.value === undefined) {
        return data;
    }

    if (start < 0) {
        start = 0;
    }

    var length = getJsonValueArraryLength(data);
    if (length < end) {
        end = length;
    }

    var newdata = {};
    for (var property in data) {
        if (property == "value") {
            newdata[property] = data[property].slice(start, end);
        } else {
            newdata[property] = data[property];
        }
    }

    return newdata;
}

function concatJsonValueArray(data, concatData) {
    if (concatData === undefined || concatData.value === undefined) {
        return data;
    }

    if (data === undefined || Object.keys(data).length === 0) {
        return concatData;
    }

    if (data.value === undefined) {
        data.value = concatData.value;
        return data;
    }

    data.value = data.value.concat(concatData.value);

    return data;
}

function endsWith(input, search) {
    return input.indexOf(search, input.length - search.length) !== -1;
}

function startsWith (input, search) {
    return input.indexOf(search) === 0;
}

function getFormatKind(format, defaultFormatKind) {
    var formatKind = defaultFormatKind;
    if (!assigned(format)) {
        return formatKind;
    }

    var normalizedFormat = format.toLowerCase();
    switch (normalizedFormat) {
        case "none":
            formatKind = 0;
            break;
        case "minimal":
            formatKind = 1;
            break;
        case "full":
            formatKind = 2;
            break;
        default:
            break;
    }

    return formatKind;
}


    
    
exports.inBrowser = inBrowser;
exports.activeXObject = activeXObject;
exports.assigned = assigned;
exports.contains = contains;
exports.defined = defined;
exports.delay = delay;
exports.djsassert = djsassert;
exports.extend = extend;
exports.find = find;
exports.getURIInfo = getURIInfo;
exports.isArray = isArray;
exports.isDate = isDate;
exports.isObject = isObject;
exports.normalizeURI = normalizeURI;
exports.normalizeURICase = normalizeURICase;
exports.parseInt10 = parseInt10;
exports.renameProperty = renameProperty;
exports.throwErrorCallback = throwErrorCallback;
exports.trimString = trimString;
exports.undefinedDefault = undefinedDefault;
exports.decodeBase64 = decodeBase64;
exports.convertByteArrayToHexString = convertByteArrayToHexString;
exports.getJsonValueArraryLength = getJsonValueArraryLength;
exports.sliceJsonValueArray = sliceJsonValueArray;
exports.concatJsonValueArray = concatJsonValueArray;
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.getFormatKind = getFormatKind;}, "xml" : function(exports, module, require) {
'use strict';
 

/** @module odatajs/xml */

var utils    = require('./utils.js');

var activeXObject = utils.activeXObject;
var djsassert = utils.djsassert;
var extend = utils.extend;
var isArray = utils.isArray;
var normalizeURI = utils.normalizeURI;

// URI prefixes to generate smaller code.
var http = "http://";
var w3org = http + "www.w3.org/";               // http://www.w3.org/

var xhtmlNS = w3org + "1999/xhtml";             // http://www.w3.org/1999/xhtml
var xmlnsNS = w3org + "2000/xmlns/";            // http://www.w3.org/2000/xmlns/
var xmlNS = w3org + "XML/1998/namespace";       // http://www.w3.org/XML/1998/namespace

var mozillaParserErroNS = http + "www.mozilla.org/newlayout/xml/parsererror.xml";

/** Checks whether the specified string has leading or trailing spaces.
 * @param {String} text - String to check.
 * @returns {Boolean} true if text has any leading or trailing whitespace; false otherwise.
 */
function hasLeadingOrTrailingWhitespace(text) {
    var re = /(^\s)|(\s$)/;
    return re.test(text);
}

/** Determines whether the specified text is empty or whitespace.
 * @param {String} text - Value to inspect.
 * @returns {Boolean} true if the text value is empty or all whitespace; false otherwise.
 */
function isWhitespace(text) {


    var ws = /^\s*$/;
    return text === null || ws.test(text);
}

/** Determines whether the specified element has xml:space='preserve' applied.
 * @param domElement - Element to inspect.
 * @returns {Boolean} Whether xml:space='preserve' is in effect.
 */
function isWhitespacePreserveContext(domElement) {


    while (domElement !== null && domElement.nodeType === 1) {
        var val = xmlAttributeValue(domElement, "space", xmlNS);
        if (val === "preserve") {
            return true;
        } else if (val === "default") {
            break;
        } else {
            domElement = domElement.parentNode;
        }
    }

    return false;
}

/** Determines whether the attribute is a XML namespace declaration.
 * @param domAttribute - Element to inspect.
 * @return {Boolean} True if the attribute is a namespace declaration (its name is 'xmlns' or starts with 'xmlns:'; false otherwise.
 */
function isXmlNSDeclaration(domAttribute) {
    var nodeName = domAttribute.nodeName;
    return nodeName == "xmlns" || nodeName.indexOf("xmlns:") === 0;
}

/** Safely set as property in an object by invoking obj.setProperty.
 * @param obj - Object that exposes a setProperty method.
 * @param {String} name - Property name
 * @param value - Property value.
 */
function safeSetProperty(obj, name, value) {


    try {
        obj.setProperty(name, value);
    } catch (_) { }
}

/** Creates an configures new MSXML 3.0 ActiveX object.
 * @returns {Object} New MSXML 3.0 ActiveX object.
 * This function throws any exception that occurs during the creation
 * of the MSXML 3.0 ActiveX object.
 */
function msXmlDom3() {
    var msxml3 = activeXObject("Msxml2.DOMDocument.3.0");
    if (msxml3) {
        safeSetProperty(msxml3, "ProhibitDTD", true);
        safeSetProperty(msxml3, "MaxElementDepth", 256);
        safeSetProperty(msxml3, "AllowDocumentFunction", false);
        safeSetProperty(msxml3, "AllowXsltScript", false);
    }
    return msxml3;
}

/** Creates an configures new MSXML 6.0 or MSXML 3.0 ActiveX object.
 * @returns {Object} New MSXML 3.0 ActiveX object.
 * This function will try to create a new MSXML 6.0 ActiveX object. If it fails then
 * it will fallback to create a new MSXML 3.0 ActiveX object. Any exception that
 * happens during the creation of the MSXML 6.0 will be handled by the function while
 * the ones that happend during the creation of the MSXML 3.0 will be thrown.
 */
function msXmlDom() {
    try {
        var msxml = activeXObject("Msxml2.DOMDocument.6.0");
        if (msxml) {
            msxml.async = true;
        }
        return msxml;
    } catch (_) {
        return msXmlDom3();
    }
}

/** Parses an XML string using the MSXML DOM.
 * @returns {Object} New MSXML DOMDocument node representing the parsed XML string.
 * This function throws any exception that occurs during the creation
 * of the MSXML ActiveX object.  It also will throw an exception
 * in case of a parsing error.
 */
function msXmlParse(text) {
    var dom = msXmlDom();
    if (!dom) {
        return null;
    }

    dom.loadXML(text);
    var parseError = dom.parseError;
    if (parseError.errorCode !== 0) {
        xmlThrowParserError(parseError.reason, parseError.srcText, text);
    }
    return dom;
}

/** Throws a new exception containing XML parsing error information.
 * @param exceptionOrReason - String indicating the reason of the parsing failure or Object detailing the parsing error.
 * @param {String} srcText -     String indicating the part of the XML string that caused the parsing error.
 * @param {String} errorXmlText - XML string for wich the parsing failed.
 */
function xmlThrowParserError(exceptionOrReason, srcText, errorXmlText) {

    if (typeof exceptionOrReason === "string") {
        exceptionOrReason = { message: exceptionOrReason };
    }
    throw extend(exceptionOrReason, { srcText: srcText || "", errorXmlText: errorXmlText || "" });
}

/** Returns an XML DOM document from the specified text.
 * @param {String} text - Document text.
 * @returns XML DOM document.
 * This function will throw an exception in case of a parse error
 */
function xmlParse(text) {
    var domParser = undefined;
    if (utils.inBrowser()) {
        domParser = window.DOMParser && new window.DOMParser();
    } else {
        domParser = new (require('xmldom').DOMParser)();
    }
    var dom;

    if (!domParser) {
        dom = msXmlParse(text);
        if (!dom) {
            xmlThrowParserError("XML DOM parser not supported");
        }
        return dom;
    }

    try {
        dom = domParser.parseFromString(text, "text/xml");
    } catch (e) {
        xmlThrowParserError(e, "", text);
    }

    var element = dom.documentElement;
    var nsURI = element.namespaceURI;
    var localName = xmlLocalName(element);

    // Firefox reports errors by returing the DOM for an xml document describing the problem.
    if (localName === "parsererror" && nsURI === mozillaParserErroNS) {
        var srcTextElement = xmlFirstChildElement(element, mozillaParserErroNS, "sourcetext");
        var srcText = srcTextElement ? xmlNodeValue(srcTextElement) : "";
        xmlThrowParserError(xmlInnerText(element) || "", srcText, text);
    }

    // Chrome (and maybe other webkit based browsers) report errors by injecting a header with an error message.
    // The error may be localized, so instead we simply check for a header as the
    // top element or descendant child of the document.
    if (localName === "h3" && nsURI === xhtmlNS || xmlFirstDescendantElement(element, xhtmlNS, "h3")) {
        var reason = "";
        var siblings = [];
        var cursor = element.firstChild;
        while (cursor) {
            if (cursor.nodeType === 1) {
                reason += xmlInnerText(cursor) || "";
            }
            siblings.push(cursor.nextSibling);
            cursor = cursor.firstChild || siblings.shift();
        }
        reason += xmlInnerText(element) || "";
        xmlThrowParserError(reason, "", text);
    }

    return dom;
}

/** Builds a XML qualified name string in the form of "prefix:name".
 * @param {String} prefix - Prefix string (may be null)
 * @param {String} name - Name string to qualify with the prefix.
 * @returns {String} Qualified name.
 */
function xmlQualifiedName(prefix, name) {
    return prefix ? prefix + ":" + name : name;
}

/** Appends a text node into the specified DOM element node.
 * @param domNode - DOM node for the element.
 * @param {String} textNode - Text to append as a child of element.
*/
function xmlAppendText(domNode, textNode) {
    if (hasLeadingOrTrailingWhitespace(textNode.data)) {
        var attr = xmlAttributeNode(domNode, xmlNS, "space");
        if (!attr) {
            attr = xmlNewAttribute(domNode.ownerDocument, xmlNS, xmlQualifiedName("xml", "space"));
            xmlAppendChild(domNode, attr);
        }
        attr.value = "preserve";
    }
    domNode.appendChild(textNode);
    return domNode;
}

/** Iterates through the XML element's attributes and invokes the callback function for each one.
 * @param element - Wrapped element to iterate over.
 * @param {Function} onAttributeCallback - Callback function to invoke with wrapped attribute nodes.
*/
function xmlAttributes(element, onAttributeCallback) {
    var attributes = element.attributes;
    var i, len;
    for (i = 0, len = attributes.length; i < len; i++) {
        onAttributeCallback(attributes.item(i));
    }
}

/** Returns the value of a DOM element's attribute.
 * @param domNode - DOM node for the owning element.
 * @param {String} localName - Local name of the attribute.
 * @param {String} nsURI - Namespace URI of the attribute.
 * @returns {String} - The attribute value, null if not found (may be null)
 */
function xmlAttributeValue(domNode, localName, nsURI) {

    var attribute = xmlAttributeNode(domNode, localName, nsURI);
    return attribute ? xmlNodeValue(attribute) : null;
}

/** Gets an attribute node from a DOM element.
 * @param domNode - DOM node for the owning element.
 * @param {String} localName - Local name of the attribute.
 * @param {String} nsURI - Namespace URI of the attribute.
 * @returns The attribute node, null if not found.
 */
function xmlAttributeNode(domNode, localName, nsURI) {

    var attributes = domNode.attributes;
    if (attributes.getNamedItemNS) {
        return attributes.getNamedItemNS(nsURI || null, localName);
    }

    return attributes.getQualifiedItem(localName, nsURI) || null;
}

/** Gets the value of the xml:base attribute on the specified element.
 * @param domNode - Element to get xml:base attribute value from.
 * @param [baseURI] - Base URI used to normalize the value of the xml:base attribute ( may be null)
 * @returns {String} Value of the xml:base attribute if found; the baseURI or null otherwise.
 */
function xmlBaseURI(domNode, baseURI) {

    var base = xmlAttributeNode(domNode, "base", xmlNS);
    return (base ? normalizeURI(base.value, baseURI) : baseURI) || null;
}


/** Iterates through the XML element's child DOM elements and invokes the callback function for each one.
 * @param domNode - DOM Node containing the DOM elements to iterate over.
 * @param {Function} onElementCallback - Callback function to invoke for each child DOM element.
*/
function xmlChildElements(domNode, onElementCallback) {

    xmlTraverse(domNode, /*recursive*/false, function (child) {
        if (child.nodeType === 1) {
            onElementCallback(child);
        }
        // continue traversing.
        return true;
    });
}

/** Gets the descendant element under root that corresponds to the specified path and namespace URI.
 * @param root - DOM element node from which to get the descendant element.
 * @param {String} namespaceURI - The namespace URI of the element to match.
 * @param {String} path - Path to the desired descendant element.
 * @return The element specified by path and namespace URI.
 * All the elements in the path are matched against namespaceURI.
 * The function will stop searching on the first element that doesn't match the namespace and the path.
 */
function xmlFindElementByPath(root, namespaceURI, path) {
    var parts = path.split("/");
    var i, len;
    for (i = 0, len = parts.length; i < len; i++) {
        root = root && xmlFirstChildElement(root, namespaceURI, parts[i]);
    }
    return root || null;
}

/** Gets the DOM element or DOM attribute node under root that corresponds to the specified path and namespace URI.
 * @param root - DOM element node from which to get the descendant node.
 * @param {String} namespaceURI - The namespace URI of the node to match.
 * @param {String} path - Path to the desired descendant node.
 * @return The node specified by path and namespace URI.

* This function will traverse the path and match each node associated to a path segement against the namespace URI.
* The traversal stops when the whole path has been exahusted or a node that doesn't belogong the specified namespace is encountered.
* The last segment of the path may be decorated with a starting @ character to indicate that the desired node is a DOM attribute.
*/
function xmlFindNodeByPath(root, namespaceURI, path) {
    

    var lastSegmentStart = path.lastIndexOf("/");
    var nodePath = path.substring(lastSegmentStart + 1);
    var parentPath = path.substring(0, lastSegmentStart);

    var node = parentPath ? xmlFindElementByPath(root, namespaceURI, parentPath) : root;
    if (node) {
        if (nodePath.charAt(0) === "@") {
            return xmlAttributeNode(node, nodePath.substring(1), namespaceURI);
        }
        return xmlFirstChildElement(node, namespaceURI, nodePath);
    }
    return null;
}

/** Returns the first child DOM element under the specified DOM node that matches the specified namespace URI and local name.
 * @param domNode - DOM node from which the child DOM element is going to be retrieved.
 * @param {String} [namespaceURI] - 
 * @param {String} [localName] - 
 * @return The node's first child DOM element that matches the specified namespace URI and local name; null otherwise.
 */
function xmlFirstChildElement(domNode, namespaceURI, localName) {

    return xmlFirstElementMaybeRecursive(domNode, namespaceURI, localName, /*recursive*/false);
}

/** Returns the first descendant DOM element under the specified DOM node that matches the specified namespace URI and local name.
 * @param domNode - DOM node from which the descendant DOM element is going to be retrieved.
 * @param {String} [namespaceURI] - 
 * @param {String} [localName] - 
 * @return The node's first descendant DOM element that matches the specified namespace URI and local name; null otherwise.
*/
function xmlFirstDescendantElement(domNode, namespaceURI, localName) {
    if (domNode.getElementsByTagNameNS) {
        var result = domNode.getElementsByTagNameNS(namespaceURI, localName);
        return result.length > 0 ? result[0] : null;
    }
    return xmlFirstElementMaybeRecursive(domNode, namespaceURI, localName, /*recursive*/true);
}

/** Returns the first descendant DOM element under the specified DOM node that matches the specified namespace URI and local name.
 * @param domNode - DOM node from which the descendant DOM element is going to be retrieved.
 * @param {String} [namespaceURI] - 
 * @param {String} [localName] - 
 * @param {Boolean} recursive 
 * - True if the search should include all the descendants of the DOM node.  
 * - False if the search should be scoped only to the direct children of the DOM node.
 * @return The node's first descendant DOM element that matches the specified namespace URI and local name; null otherwise.
 */
function xmlFirstElementMaybeRecursive(domNode, namespaceURI, localName, recursive) {

    var firstElement = null;
    xmlTraverse(domNode, recursive, function (child) {
        if (child.nodeType === 1) {
            var isExpectedNamespace = !namespaceURI || xmlNamespaceURI(child) === namespaceURI;
            var isExpectedNodeName = !localName || xmlLocalName(child) === localName;

            if (isExpectedNamespace && isExpectedNodeName) {
                firstElement = child;
            }
        }
        return firstElement === null;
    });
    return firstElement;
}

/** Gets the concatenated value of all immediate child text and CDATA nodes for the specified element.
 * @param xmlElement - Element to get values for.
 * @returns {String} Text for all direct children.
 */
function xmlInnerText(xmlElement) {

    var result = null;
    var root = (xmlElement.nodeType === 9 && xmlElement.documentElement) ? xmlElement.documentElement : xmlElement;
    var whitespaceAlreadyRemoved = root.ownerDocument.preserveWhiteSpace === false;
    var whitespacePreserveContext;

    xmlTraverse(root, false, function (child) {
        if (child.nodeType === 3 || child.nodeType === 4) {
            // isElementContentWhitespace indicates that this is 'ignorable whitespace',
            // but it's not defined by all browsers, and does not honor xml:space='preserve'
            // in some implementations.
            //
            // If we can't tell either way, we walk up the tree to figure out whether
            // xml:space is set to preserve; otherwise we discard pure-whitespace.
            //
            // For example <a>  <b>1</b></a>. The space between <a> and <b> is usually 'ignorable'.
            var text = xmlNodeValue(child);
            var shouldInclude = whitespaceAlreadyRemoved || !isWhitespace(text);
            if (!shouldInclude) {
                // Walk up the tree to figure out whether we are in xml:space='preserve' context
                // for the cursor (needs to happen only once).
                if (whitespacePreserveContext === undefined) {
                    whitespacePreserveContext = isWhitespacePreserveContext(root);
                }

                shouldInclude = whitespacePreserveContext;
            }

            if (shouldInclude) {
                if (!result) {
                    result = text;
                } else {
                    result += text;
                }
            }
        }
        // Continue traversing?
        return true;
    });
    return result;
}

/** Returns the localName of a XML node.
 * @param domNode - DOM node to get the value from.
 * @returns {String} localName of domNode.
 */
function xmlLocalName(domNode) {

    return domNode.localName || domNode.baseName;
}

/** Returns the namespace URI of a XML node.
 * @param domNode - DOM node to get the value from.
 * @returns {String} Namespace URI of domNode.
 */
function xmlNamespaceURI(domNode) {

    return domNode.namespaceURI || null;
}

/** Returns the value or the inner text of a XML node.
 * @param domNode - DOM node to get the value from.
 * @return Value of the domNode or the inner text if domNode represents a DOM element node.
 */
function xmlNodeValue(domNode) {
    
    if (domNode.nodeType === 1) {
        return xmlInnerText(domNode);
    }
    return domNode.nodeValue;
}

/** Walks through the descendants of the domNode and invokes a callback for each node.
 * @param domNode - DOM node whose descendants are going to be traversed.
 * @param {Boolean} recursive
 * - True if the traversal should include all the descenants of the DOM node.
 * - False if the traversal should be scoped only to the direct children of the DOM node.
 * @param {Boolean} onChildCallback - Called for each child
 * @returns {String} Namespace URI of node.
 */
function xmlTraverse(domNode, recursive, onChildCallback) {

    var subtrees = [];
    var child = domNode.firstChild;
    var proceed = true;
    while (child && proceed) {
        proceed = onChildCallback(child);
        if (proceed) {
            if (recursive && child.firstChild) {
                subtrees.push(child.firstChild);
            }
            child = child.nextSibling || subtrees.shift();
        }
    }
}

/** Returns the next sibling DOM element of the specified DOM node.
 * @param domNode - DOM node from which the next sibling is going to be retrieved.
 * @param {String} [namespaceURI] - 
 * @param {String} [localName] - 
 * @return The node's next sibling DOM element, null if there is none.
 */
function xmlSiblingElement(domNode, namespaceURI, localName) {

    var sibling = domNode.nextSibling;
    while (sibling) {
        if (sibling.nodeType === 1) {
            var isExpectedNamespace = !namespaceURI || xmlNamespaceURI(sibling) === namespaceURI;
            var isExpectedNodeName = !localName || xmlLocalName(sibling) === localName;

            if (isExpectedNamespace && isExpectedNodeName) {
                return sibling;
            }
        }
        sibling = sibling.nextSibling;
    }
    return null;
}

/** Creates a new empty DOM document node.
 * @return New DOM document node.
 *
 * This function will first try to create a native DOM document using
 * the browsers createDocument function.  If the browser doesn't
 * support this but supports ActiveXObject, then an attempt to create
 * an MSXML 6.0 DOM will be made. If this attempt fails too, then an attempt
 * for creating an MXSML 3.0 DOM will be made.  If this last attemp fails or
 * the browser doesn't support ActiveXObject then an exception will be thrown.
 */
function xmlDom() {
    var implementation = window.document.implementation;
    return (implementation && implementation.createDocument) ?
       implementation.createDocument(null, null, null) :
       msXmlDom();
}

/** Appends a collection of child nodes or string values to a parent DOM node.
 * @param parent - DOM node to which the children will be appended.
 * @param {Array} children - Array containing DOM nodes or string values that will be appended to the parent.
 * @return The parent with the appended children or string values.
 *  If a value in the children collection is a string, then a new DOM text node is going to be created
 *  for it and then appended to the parent.
 */
function xmlAppendChildren(parent, children) {
    if (!isArray(children)) {
        return xmlAppendChild(parent, children);
    }

    var i, len;
    for (i = 0, len = children.length; i < len; i++) {
        children[i] && xmlAppendChild(parent, children[i]);
    }
    return parent;
}

/** Appends a child node or a string value to a parent DOM node.
 * @param parent - DOM node to which the child will be appended.
 * @param child - Child DOM node or string value to append to the parent.
 * @return The parent with the appended child or string value.
 * If child is a string value, then a new DOM text node is going to be created
 * for it and then appended to the parent.
 */
function xmlAppendChild(parent, child) {

    djsassert(parent !== child, "xmlAppendChild() - parent and child are one and the same!");
    if (child) {
        if (typeof child === "string") {
            return xmlAppendText(parent, xmlNewText(parent.ownerDocument, child));
        }
        if (child.nodeType === 2) {
            parent.setAttributeNodeNS ? parent.setAttributeNodeNS(child) : parent.setAttributeNode(child);
        } else {
            parent.appendChild(child);
        }
    }
    return parent;
}

/** Creates a new DOM attribute node.
 * @param dom - DOM document used to create the attribute.
 * @param {String} namespaceURI - Namespace URI.
 * @param {String} qualifiedName - Qualified OData name
 * @param {String} value - Value of the new attribute
 * @return DOM attribute node for the namespace declaration.
 */
function xmlNewAttribute(dom, namespaceURI, qualifiedName, value) {

    var attribute =
        dom.createAttributeNS && dom.createAttributeNS(namespaceURI, qualifiedName) ||
        dom.createNode(2, qualifiedName, namespaceURI || undefined);

    attribute.value = value || "";
    return attribute;
}

/** Creates a new DOM element node.
 * @param dom - DOM document used to create the DOM element.
 * @param {String} namespaceURI - Namespace URI of the new DOM element.
 * @param {String} qualifiedName - Qualified name in the form of "prefix:name" of the new DOM element.
 * @param {Array} [children] Collection of child DOM nodes or string values that are going to be appended to the new DOM element.
 * @return New DOM element.
 * If a value in the children collection is a string, then a new DOM text node is going to be created
 * for it and then appended to the new DOM element.
 */
function xmlNewElement(dom, namespaceURI, qualifiedName, children) {
    var element =
        dom.createElementNS && dom.createElementNS(nampespaceURI, qualifiedName) ||
        dom.createNode(1, qualifiedName, nampespaceURI || undefined);

    return xmlAppendChildren(element, children || []);
}

/** Creates a namespace declaration attribute.
 * @param dom - DOM document used to create the attribute.
 * @param {String} namespaceURI - Namespace URI.
 * @param {String} prefix - Namespace prefix.
 * @return DOM attribute node for the namespace declaration.
 */
function xmlNewNSDeclaration(dom, namespaceURI, prefix) {
    return xmlNewAttribute(dom, xmlnsNS, xmlQualifiedName("xmlns", prefix), namespaceURI);
}

/** Creates a new DOM document fragment node for the specified xml text.
 * @param dom - DOM document from which the fragment node is going to be created.
 * @param {String} text XML text to be represented by the XmlFragment.
 * @return New DOM document fragment object.
 */
function xmlNewFragment(dom, text) {

    var value = "<c>" + text + "</c>";
    var tempDom = xmlParse(value);
    var tempRoot = tempDom.documentElement;
    var imported = ("importNode" in dom) ? dom.importNode(tempRoot, true) : tempRoot;
    var fragment = dom.createDocumentFragment();

    var importedChild = imported.firstChild;
    while (importedChild) {
        fragment.appendChild(importedChild);
        importedChild = importedChild.nextSibling;
    }
    return fragment;
}

/** Creates new DOM text node.
 * @param dom - DOM document used to create the text node.
 * @param {String} text - Text value for the DOM text node.
 * @return DOM text node.
 */ 
function xmlNewText(dom, text) {
    return dom.createTextNode(text);
}

/** Creates a new DOM element or DOM attribute node as specified by path and appends it to the DOM tree pointed by root.
 * @param dom - DOM document used to create the new node.
 * @param root - DOM element node used as root of the subtree on which the new nodes are going to be created.
 * @param {String} namespaceURI - Namespace URI of the new DOM element or attribute.
 * @param {String} prefix - Prefix used to qualify the name of the new DOM element or attribute.
 * @param {String} path - Path string describing the location of the new DOM element or attribute from the root element.
 * @return DOM element or attribute node for the last segment of the path.

 * This function will traverse the path and will create a new DOM element with the specified namespace URI and prefix
 * for each segment that doesn't have a matching element under root.
 * The last segment of the path may be decorated with a starting @ character. In this case a new DOM attribute node
 * will be created.
 */
function xmlNewNodeByPath(dom, root, namespaceURI, prefix, path) {
    var name = "";
    var parts = path.split("/");
    var xmlFindNode = xmlFirstChildElement;
    var xmlNewNode = xmlNewElement;
    var xmlNode = root;

    var i, len;
    for (i = 0, len = parts.length; i < len; i++) {
        name = parts[i];
        if (name.charAt(0) === "@") {
            name = name.substring(1);
            xmlFindNode = xmlAttributeNode;
            xmlNewNode = xmlNewAttribute;
        }

        var childNode = xmlFindNode(xmlNode, namespaceURI, name);
        if (!childNode) {
            childNode = xmlNewNode(dom, namespaceURI, xmlQualifiedName(prefix, name));
            xmlAppendChild(xmlNode, childNode);
        }
        xmlNode = childNode;
    }
    return xmlNode;
}

/** Returns the text representation of the document to which the specified node belongs.
 * @param domNode - Wrapped element in the document to serialize.
 * @returns {String} Serialized document.
*/
function xmlSerialize(domNode) {
    var xmlSerializer = window.XMLSerializer;
    if (xmlSerializer) {
        var serializer = new xmlSerializer();
        return serializer.serializeToString(domNode);
    }

    if (domNode.xml) {
        return domNode.xml;
    }

    throw { message: "XML serialization unsupported" };
}

/** Returns the XML representation of the all the descendants of the node.
 * @param domNode - Node to serialize.
 * @returns {String} The XML representation of all the descendants of the node.
 */
function xmlSerializeDescendants(domNode) {
    var children = domNode.childNodes;
    var i, len = children.length;
    if (len === 0) {
        return "";
    }

    // Some implementations of the XMLSerializer don't deal very well with fragments that
    // don't have a DOMElement as their first child. The work around is to wrap all the
    // nodes in a dummy root node named "c", serialize it and then just extract the text between
    // the <c> and the </c> substrings.

    var dom = domNode.ownerDocument;
    var fragment = dom.createDocumentFragment();
    var fragmentRoot = dom.createElement("c");

    fragment.appendChild(fragmentRoot);
    // Move the children to the fragment tree.
    for (i = 0; i < len; i++) {
        fragmentRoot.appendChild(children[i]);
    }

    var xml = xmlSerialize(fragment);
    xml = xml.substr(3, xml.length - 7);

    // Move the children back to the original dom tree.
    for (i = 0; i < len; i++) {
        domNode.appendChild(fragmentRoot.childNodes[i]);
    }

    return xml;
}

/** Returns the XML representation of the node and all its descendants.
 * @param domNode - Node to serialize
 * @returns {String} The XML representation of the node and all its descendants.
 */
function xmlSerializeNode(domNode) {

    var xml = domNode.xml;
    if (xml !== undefined) {
        return xml;
    }

    if (window.XMLSerializer) {
        var serializer = new window.XMLSerializer();
        return serializer.serializeToString(domNode);
    }

    throw { message: "XML serialization unsupported" };
}

exports.http = http;
exports.w3org = w3org;
exports.xmlNS = xmlNS;
exports.xmlnsNS = xmlnsNS;

exports.hasLeadingOrTrailingWhitespace = hasLeadingOrTrailingWhitespace;
exports.isXmlNSDeclaration = isXmlNSDeclaration;
exports.xmlAppendChild = xmlAppendChild;
exports.xmlAppendChildren = xmlAppendChildren;
exports.xmlAttributeNode = xmlAttributeNode;
exports.xmlAttributes = xmlAttributes;
exports.xmlAttributeValue = xmlAttributeValue;
exports.xmlBaseURI = xmlBaseURI;
exports.xmlChildElements = xmlChildElements;
exports.xmlFindElementByPath = xmlFindElementByPath;
exports.xmlFindNodeByPath = xmlFindNodeByPath;
exports.xmlFirstChildElement = xmlFirstChildElement;
exports.xmlFirstDescendantElement = xmlFirstDescendantElement;
exports.xmlInnerText = xmlInnerText;
exports.xmlLocalName = xmlLocalName;
exports.xmlNamespaceURI = xmlNamespaceURI;
exports.xmlNodeValue = xmlNodeValue;
exports.xmlDom = xmlDom;
exports.xmlNewAttribute = xmlNewAttribute;
exports.xmlNewElement = xmlNewElement;
exports.xmlNewFragment = xmlNewFragment;
exports.xmlNewNodeByPath = xmlNewNodeByPath;
exports.xmlNewNSDeclaration = xmlNewNSDeclaration;
exports.xmlNewText = xmlNewText;
exports.xmlParse = xmlParse;
exports.xmlQualifiedName = xmlQualifiedName;
exports.xmlSerialize = xmlSerialize;
exports.xmlSerializeDescendants = xmlSerializeDescendants;
exports.xmlSiblingElement = xmlSiblingElement;
}};

var modules = {};

var require = function(path) {
    var name = path.substring(path.lastIndexOf('/')+1,path.length-3);
    if (modules[name]) { return modules[name].exports; }

    modules[name] = { exports : {}};
    console.log(name);
    if (name === 'sou') {
      var i = 0;
    }
    datas[name].call(this,modules[name].exports,modules[name],require);
    return modules[name].exports;
  };

window.odatajs = {};
init.call(this,window.odatajs,window.odatajs,require);


