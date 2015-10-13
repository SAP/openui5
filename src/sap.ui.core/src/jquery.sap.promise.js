/*!
 * ${copyright}
 */
/*eslint-disable no-extend-native */

// Provides ECMA Script 6 Polyfill
(function(jQuery) {
	"use strict";
	
	/*
	 * No Documentation by intention.
	 * This class represents a polyfill for ECMA Script 6 Promises
	 * see http://www.html5rocks.com/en/tutorials/es6/promises/
	 */
	
	var Promise = function(fAction) {
		if (typeof (fAction) != "function") {
			throw new TypeError("Argument is not a function");
		}
		
		this._deferred = new jQuery.Deferred();

		try {
			var that = this;
			fAction(function(oVal){
				_finalize(that, oVal, true); //force async resolve
			}, function(oVal){
				_finalize(that, oVal, false); //force async reject
			});
		} catch (e) { //Error in action rejects the promise
			_finalize(this, e, false);
		}
	};
	
	// *** Instance Promise functions ***
	
	Promise.prototype.then = function(fOnFulfilled, fOnRejected){
		var oFollowUpPromise = new Promise(_dummy);
		setTimeout(function(){
			this._deferred.then(_doWrap(fOnFulfilled, oFollowUpPromise, true), _doWrap(fOnRejected, oFollowUpPromise, false));
		}.bind(this), 0);
		return oFollowUpPromise;
	};
	
	Promise.prototype["catch"] = function(fOnRejected){
		return this.then(undefined, fOnRejected);
	};
	
	
	// *** Static Promise functions ***
	
	Promise.all = function(aPromises){
		return new Promise(function(fResolve, fReject){
			if (!jQuery.isArray(aPromises)) {
				fReject(new TypeError("invalid argument"));
				return;
			}
			if (aPromises.length == 0) {
				fResolve([]);
				return;
			}
			
			var bFailed = false,
				aValues = new Array(aPromises.length),
				iCount = 0;
			
			function _check(iIdx){
				Promise.resolve(aPromises[iIdx]).then(function(oObj){
					if (!bFailed) {
						iCount++;
						aValues[iIdx] = oObj;
						if (iCount == aPromises.length) {
							fResolve(aValues);
						}
					}
				}, function(oObj){
					if (!bFailed) {
						bFailed = true;
						fReject(oObj);
					}
				});
			}
			
			for (var i = 0; i < aPromises.length; i++) {
				_check(i);
			}
		});
	};
	
	Promise.race = function(aPromises){
		return new Promise(function(fResolve, fReject){
			if (!jQuery.isArray(aPromises)) {
				fReject(new TypeError("invalid argument"));
			}
			
			var bFinal = false;
			
			for (var i = 0; i < aPromises.length; i++) {
				/*eslint-disable no-loop-func */
				Promise.resolve(aPromises[i]).then(function(oObj){
					if (!bFinal) {
						bFinal = true;
						fResolve(oObj);
					}
				}, function(oObj){
					if (!bFinal) {
						bFinal = true;
						fReject(oObj);
					}
				});
				/*eslint-enable no-loop-func */
			}
		});
	};
	
	Promise.resolve = function(oObj){
		return oObj instanceof Promise ? oObj : _resolve(new Promise(_dummy), oObj);
	};
	
	Promise.reject = function(oObj){
		return _finalize(new Promise(_dummy), oObj, false);
	};
	
	
	// *** Helper functions ***
	
	function _dummy(){}
	
	function _isThenable(oObj){
		return oObj && oObj.then && typeof (oObj.then) == "function";
	}
	
	function _finalize(oPromise, oObj, bResolve){
		setTimeout(function(){
			if (_isThenable(oObj) && bResolve) { //Assimilation
				_resolve(oPromise, oObj);
			} else {
				oPromise._deferred[bResolve ? "resolve" : "reject"](oObj);
			}
		}, 0);
		return oPromise;
	}
	
	function _resolve(oPromise, oObj){
		if (_isThenable(oObj)) {
			var bFinal = false;
			try {
				oObj.then(function(oVal){
					_finalize(oPromise, oVal, true);
					bFinal = true;
				}, function(oVal){
					_finalize(oPromise, oVal, false);
					bFinal = true;
				});
			} catch (e) {
				if (!bFinal) {
					_finalize(oPromise, e, false);
				} else {
					jQuery.sap.log.debug("Promise: Error in then: " + e); //Error is ignored
				}
			}
		} else {
			_finalize(oPromise, oObj, true);
		}
		return oPromise;
	}
	
	function _doWrap(fAction, oPromise, bResolve){
		return function(oObj){
			if (!fAction) {
				_finalize(oPromise, oObj, bResolve);
			} else {
				try {
					_resolve(oPromise, fAction(oObj));
				} catch (e) { //catch error in fAction
					_finalize(oPromise, e, false);
				}
			}
		};
	}
	
	
	// *** Polyfill ***
	
	if (!window.Promise) {
		window.Promise = Promise;
	}

	if (window.sap && window.sap.__ui5PublishPromisePolyfill) { //For testing purposes
		window._UI5Promise = Promise;
	}
	
})(jQuery);
