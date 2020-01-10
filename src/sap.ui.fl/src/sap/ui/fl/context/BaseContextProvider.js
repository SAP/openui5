/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/ManagedObject"], function(ManagedObject) {
	"use strict";

	/**
	 * Abstract context provider.
	 *
	 * Do not create an instance of this. Instead extend this abstract class with a custom implementation and instantiate
	 * that.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @abstract
	 * @since 1.38
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var BaseContextProvider = ManagedObject.extend("sap.ui.fl.context.BaseContextProvider", {
		metadata : {
			properties : {
				text : {
					type : "String"
				},
				description : {
					type : "String"
				}
			}
		}
	});

	/**
	* Template method for context provider that just fetch a JSON object,
	* so that getValue can have the filtering implemented once.
	* @protected
	* @returns Promise which resolves with JSON object containing all context data
	*/
	BaseContextProvider.prototype.loadData = function() {
		return Promise.resolve({});
	};

	BaseContextProvider.prototype.getValue = function(sRequest) {
		return this.loadData().then(function(mData) {
			var aRequestParts = sRequest && sRequest.split(".") || [];
			var mResult = aRequestParts.reduce(function(mContextPart, sCurrent) {
				if (mContextPart && mContextPart.hasOwnProperty(sCurrent)) {
					return mContextPart[sCurrent];
				}
				return undefined;
			}, mData);
			return mResult;
		});
	};

	BaseContextProvider.prototype.getValueHelp = function() {
		return Promise.resolve({});
	};

	BaseContextProvider.prototype.validate = function() {
		return Promise.resolve(true);
	};

	return BaseContextProvider;
});
