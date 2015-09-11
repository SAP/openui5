/*!
 * ${copyright}
 */

/*
 * Helper functions for checking the bootstrap process 
 */

// wraps jQuery.ajax to count and collect *.js requests
(function() {
	var fnOldAjax = jQuery.ajax;
	var iAjaxCalls = 0;
	var aAjaxCalls = [];
	var sRoot = jQuery.sap.getModulePath("", "/");

	jQuery.ajax = function(settings) {
		if ( settings && settings.url && /\.js$/.test(settings.url) ) {
			var sUrl = settings.url;
			sUrl = sUrl.slice(sUrl.indexOf(sRoot) == 0 ? sRoot.length : 0);
			if (sUrl.indexOf("sap/ui/thirdparty/") < 0) {
				aAjaxCalls.push(sUrl);
			}
		}
		iAjaxCalls++;
		return fnOldAjax.apply(this, arguments);
	};

	window.ajaxCallsReset = function() {
		aAjaxCalls = [];
	};
	window.ajaxCalls = function() {
		return aAjaxCalls;
	};
	window.ajaxCallsCount = function() {
		return iAjaxCalls;
	};
}());


var _aExpectedAjaxCalls = {
	/*
	"sap.ui.commons" : [
		"sap/ui/unified/FileUploaderParameter.js",
		"sap/ui/unified/library.js",
		"sap/ui/unified/MenuItem.js",
		"sap/ui/unified/MenuItemBase.js",
		"sap/ui/unified/MenuTextFieldItem.js",
		"sap/ui/unified/FileUploader.js",
		"sap/ui/unified/Menu.js"
	]
	*/
};

function checkLibrary(sLibraryName, bExpectLazyStubs, assert) {

	// ensure that assert.* even works if a test page doesn't provide 'assert' as a param (e.g. pages outside openui5 repo) 
	assert = assert || window;

	ajaxCallsReset();

	assert.ok(jQuery.sap.isDeclared(sLibraryName + ".library"), "module for library " + sLibraryName + " must have been declared");
	assert.ok(jQuery.sap.getObject(sLibraryName), "namespace " + sLibraryName + " must exists");

	var oLib = sap.ui.getCore().getLoadedLibraries()[sLibraryName];
	assert.ok(!!oLib, "library info object must exists");

	// Check that all modules have been loaded. As we don't have access to the "all modules", 
	// we simply check for all types, elements and controls
	// Note: the tests must not call functions/ctors to avoid side effects like lazy loading

	// we must exclude the primitive types - no module for them
	var aExcludes = "any boolean float int object string void".split(" ");
	jQuery.each(oLib.types, function(idx,sType) {
		if ( jQuery.inArray(sType, aExcludes) < 0 ) {
			var oClass = jQuery.sap.getObject(sType);
			assert.ok(typeof oClass === "object", "type " + sType + " must be an object");
		}
	});

	// check existence and lazy loader status
	var sMessage = bExpectLazyStubs ? "class must be a lazy loader only" : "class must not be a lazy loader";
	var aExcludes = "sap.ui.core.Element sap.ui.core.Control sap.ui.core.Component sap.ui.table.Column".split(" ");
	
	jQuery.each(oLib.elements, function(idx,sElement) {
		if ( jQuery.inArray(sElement, aExcludes) < 0 ) {
			assert.notEqual(jQuery.sap.isDeclared(sElement), bExpectLazyStubs, "module for element " + sElement + " must have been declared");
			assert.equal(sap.ui.lazyRequire._isStub(sElement), bExpectLazyStubs, sMessage + ":" + sElement);
			if ( !bExpectLazyStubs ) {
				var oClass = jQuery.sap.getObject(sElement);
				assert.equal(typeof oClass, "function", "Element constructor for " + sElement + " must exist and must be a function");
			}
		}
	});

	jQuery.each(oLib.controls, function(idx,sControl) {
		if ( jQuery.inArray(sControl, aExcludes) < 0 ) {
			assert.notEqual(jQuery.sap.isDeclared(sControl), bExpectLazyStubs, "module for element " + sControl + " must have been declared");
			assert.equal(sap.ui.lazyRequire._isStub(sControl), bExpectLazyStubs, sMessage + ":" + sControl);
			if ( !bExpectLazyStubs ) {
				var oClass = jQuery.sap.getObject(sControl);
				assert.equal(typeof oClass, "function", "Control constructor for " + sControl + " must exist and must be a function");
			}
		}
	});

	jQuery.each(oLib.elements, function(idx,sElement) {
		var oClass = jQuery.sap.getObject(sElement);
		if ( bExpectLazyStubs ) {
			try {
				new oClass();
			} catch (e) {
				jQuery.sap.log.error(e.message || e);
			}
			oClass = jQuery.sap.getObject(sElement);
		}
		assert.ok(typeof oClass.prototype.getMetadata === "function", "Element class " + sElement + " should have been loaded and initialized");
	});

	jQuery.each(oLib.controls, function(idx,sControl) {
		var oClass = jQuery.sap.getObject(sControl);
		if ( bExpectLazyStubs ) {
			try {
				new oClass();
			} catch (e) {
				jQuery.sap.log.error(e.message || e);
			}
			oClass = jQuery.sap.getObject(sControl);
		}
		assert.ok(typeof oClass.prototype.getMetadata === "function", "Control class " + sControl + " should have been loaded and initialized");
	});

	var aExpectedCalls = bExpectLazyStubs ? (_aExpectedAjaxCalls[sLibraryName] || []) : [];
	assert.deepEqual(ajaxCalls(), aExpectedCalls, (aExpectedCalls.length === 0 ? "no" : "only some expected") + " additional ajax calls should have happened");

}