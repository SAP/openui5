/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/base/ManagedObject', "sap/base/Log"], function(ManagedObject, Log) {
	"use strict";

	/**
	 * Implementation of the Context API
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var Context = ManagedObject.extend("sap.ui.fl.context.Context", {
		metadata : {
			library : "sap.ui.fl",
			properties : {
				configuration : {
					type : "object"
				},
				content : {
					type : "object"
				}
			},
			aggregations : {
				contextProviders : {
					type : "object",
					multiple : true
				}
			},
			events : {}
		}
	});

	Context.prototype.getValue = function(aRequest) {
		return this._getProviderContent(aRequest, "getValue");
	};

	Context.prototype.getValueHelp = function(aRequest) {
		return this._getProviderContent(aRequest, "getValueHelp");
	};

	var fnRemoveDomainFromRequest = function(sDomain, sRequest) {
		if (sDomain.indexOf(sRequest) !== -1) {
			//partial or full request for a domain, return all values of the domain
			return undefined;
		}
		if (sRequest.indexOf(sDomain + ".") !== -1) {
			//sub request for a domain, return all values of the domain
			return sRequest.substring(sDomain.length + 1);
		}
		throw new Error("Invalid request for sap.ui.fl.context - domain:" + sDomain + "request:" + sRequest);
	};

	Context.prototype._getProviderContent = function(aRequest, sPropertyName) {
		var that = this;
		var aPromises = [];
		var aRequestByDomain = [];

		var fnHandleOneDomain = function(sRequest) {
			var sAssuredDomain = that._assureDomain(sRequest);
			if (sAssuredDomain) {
				var oPromise = that._loadProvider(sAssuredDomain);
				aPromises.push(oPromise);

				aRequestByDomain.push({
					domain : sAssuredDomain,
					request : fnRemoveDomainFromRequest(sAssuredDomain, sRequest)
				});
			} else {
				//unkown domain
				aRequestByDomain.push({
					domain : undefined,
					request : sRequest
				});
			}
		};

		var fnMassUpdateConfiguration = function(aDomainProviderPairs) {
			var mConfiguration = that.getConfiguration();
			var bConfigurationChanged = false;
			for (var i = 0; i < aDomainProviderPairs.length; i++) {
				var oPair = aDomainProviderPairs[i];
				if (oPair) {
					mConfiguration[oPair.domain] = oPair.provider;
					bConfigurationChanged = true;
				}
			}
			if (bConfigurationChanged) {
				that.setConfiguration(mConfiguration);
			}
		};


		if (aRequest instanceof Array) {
			aRequest.forEach(function(sRequest) {
				fnHandleOneDomain(sRequest);
			});
		} else if (aRequest === undefined) {
			for (var sDomain in this.getConfiguration()) {
				aPromises.push(this._loadProvider(sDomain));
			}
			aRequestByDomain = Object.keys(this.getConfiguration()).map(function(sDomain) {
				return {
					domain : sDomain,
					request : undefined
				};
			});
		}

		return Promise.all(aPromises).then(fnMassUpdateConfiguration).then(function() {
			return that._mergeProviderContent(aRequestByDomain, sPropertyName);
		});
	};

	Context.prototype._assureDomain = function(oDomain) {
		var mConfiguration = this.getConfiguration();
		if (mConfiguration.hasOwnProperty(oDomain)) {
			return oDomain;
		}

		var aKeys = Object.keys(mConfiguration);
		for (var i = 0; i < aKeys.length; i++) {
			var sKey = aKeys[i];
			if (oDomain.indexOf(sKey) === 0 || sKey.indexOf(oDomain) === 0) {
				return sKey;
			}
		}

		return null;
	};

	Context.prototype._loadProvider = function(sDomain) {
		var sActConfigPath = this.getConfiguration()[sDomain];
		if (typeof (sActConfigPath) === "string") {
			return new Promise(function(resolve) {
				try {
					sap.ui.require([sActConfigPath],
						function(ProviderConstructor) {
							var oProvider = new ProviderConstructor();
							resolve({
								domain : sDomain,
								provider : oProvider
							});
						},
						function(oError) {
							Log.error(oError);
							resolve(); // recover from error, but deliver no information
							return;
						}
					);
				} catch (oError) {
					Log.error(oError);
					resolve(); // recover from error, but deliver no information
					return;
				}
			});
		}

		return Promise.resolve();
	};

	Context.prototype._mergeProviderContent = function(aRequestByDomain, sPropertyName) {
		var aPromises = [];

		var mConfiguration = this.getConfiguration();
		aRequestByDomain.forEach(function(oRequest) {
			if (mConfiguration.hasOwnProperty(oRequest.domain)) {
				var oActProvider = mConfiguration[oRequest.domain];
				if (oActProvider instanceof sap.ui.fl.context.BaseContextProvider) {
					aPromises.push(oActProvider[sPropertyName](oRequest.request).then(function(mValue) {
						var mSingleResult = {};
						var sResultKey = oRequest.domain;
						if (oRequest.request) {
							sResultKey = sResultKey + "." + oRequest.request;
						}
						mSingleResult[sResultKey] = mValue;
						return mSingleResult;
					}));
				}
			} else {
				var mSingleResult = {};
				mSingleResult[oRequest.request] = undefined;
				aPromises.push(Promise.resolve(mSingleResult));
			}
		});

		return Promise.all(aPromises).then(function(aResults) {
			return aResults.reduce(function(mResults, mCurrent) {
				//jQuery.extend will not merge undefined properties => do it on our own
				var sKey = Object.keys(mCurrent)[0];
				mResults[sKey] = mCurrent[sKey];
				return mResults;
			}, {});
		});
	};

	return Context;
});