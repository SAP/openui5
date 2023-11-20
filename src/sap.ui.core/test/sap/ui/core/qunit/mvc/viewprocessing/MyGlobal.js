/**
 * Control which ...
 */
sap.ui.define(['sap/ui/base/ManagedObject'], function(ManagedObject) {
	"use strict";

	var mMap = {};
	var mList = [];
	var MyGlobal = ManagedObject.extend("sap.ui.core.qunit.mvc.viewprocessing.MyGlobal", {
		metadata: {},
		init: function() {
			//initialize
		},
		renderer: function() {
			//render
		}
	});

	MyGlobal.add = function(oEle) {
		mList.push(oEle);
		mMap[oEle] = true;
	};

	MyGlobal.contains = function(oEle) {
		return mMap[oEle];
	};

	MyGlobal.get = function() {
		return mList;
	};


	MyGlobal.reset = function() {
		mMap = {};
		mList = [];
	};




	MyGlobal.prototype.toString = function() {
		return "BadControl";
	};

	return MyGlobal;
});