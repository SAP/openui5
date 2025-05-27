/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/assert",
	"sap/base/future",
	"sap/base/Log",
	"sap/base/util/extend",
	"sap/ui/base/_runWithOwner",
	"./ViewType",
	"./XMLProcessingMode"
], function(
		assert,
		future,
		Log,
		extend,
		_runWithOwner,
		ViewType,
		XMLProcessingMode
	) {
	"use strict";

	/**
	 * Extract module name from viewName property.
	 *
	 * @param {object} mSettings Settings as given to the view factory
	 * @returns {string|undefined} Name of the module (in sap.ui.define syntax) from which to load the view definition.
	 * @private
	 */
	function getTypedViewModuleName(mSettings) {
		var sModuleName;
		if (mSettings.viewName && mSettings.viewName.startsWith("module:")) {
			sModuleName = mSettings.viewName.slice("module:".length);
		}
		return sModuleName;
	}

	/**
	 * Extract the class name from the given view settings object
	 *
	 * @param {object} oViewSettings Settings object as given to the view factory
	 * @param {boolean} [bSkipLog=false] Whether to skip the logging
	 * @returns {string|undefined} Name of the view class (in sap.ui.define syntax)
	 * @private
	 */
	function getViewClassName(oViewSettings, bSkipLog) {
		var sViewClass = getTypedViewModuleName(oViewSettings);

		// view creation
		if (sViewClass) {
			if (oViewSettings.type && !bSkipLog) {
				Log.error("When using the view factory, the 'type' setting must be omitted for typed views. When embedding typed views in XML, don't use the <JSView> tag, use the <View> tag instead.");
			}
			return sViewClass;
		}
		if (!oViewSettings.type) {
			throw new Error("No view type specified.");
		}

		if (oViewSettings.type === ViewType.XML) {
			return 'sap/ui/core/mvc/XMLView';
		}

		/**
		 * The different ViewTypes have been deprecated with different UI5 versions.
		 * Please see the public "sap/ui/core/mvc/ViewType" enum for the specific versions.
		 * @deprecated
		 */
		if (oViewSettings.type === ViewType.JS) {
			sViewClass = 'sap/ui/core/mvc/JSView';
		} else if (oViewSettings.type === ViewType.JSON) {
			sViewClass = 'sap/ui/core/mvc/JSONView';
		} else if (oViewSettings.type === ViewType.HTML) {
			sViewClass = 'sap/ui/core/mvc/HTMLView';
		} else if (oViewSettings.type === ViewType.Template) {
			sViewClass = 'sap/ui/core/mvc/TemplateView';
		}

		// unknown view type
		if (!sViewClass) {
			throw new Error("Unknown view type " + oViewSettings.type + " specified.");
		}

		return sViewClass;
	}

	function createView(sViewClass, oViewSettings) {
		var ViewClass = sap.ui.require(sViewClass);
		if (!ViewClass) {
			future.warningThrows(`The view class '${sViewClass}' needs to be required before an instance of the view can be created.`);
			/**
			 * @deprecated
			 */
			(() => {
				ViewClass = sap.ui.requireSync(sViewClass);// legacy-relevant: sync fallback for missing dependency
				if (oViewSettings.async) {
					//not supported
					Log.warning("sap.ui.view was called without requiring the according view class.");
				}
			})();
		}
		return new ViewClass(oViewSettings);
	}


	/**
	 * The old sap.ui.view implementation
	 *
	 * @param {string} sId id of the newly created view, only allowed for instance creation
	 * @param {string|object} [vView] the view name or view configuration object
	 * @param {sap.ui.core.mvc.ViewType} [sType] Specifies what kind of view will be instantiated. All valid
	 * view types are listed in the enumeration {@link sap.ui.core.mvc.ViewType}
	 * @returns {sap.ui.core.mvc.View} the created view instance
	 * @private
	 */
	function viewFactory(sId, vView, sType) {
		var view = null, oView = {};

		// if the id is a configuration object or a string
		// and the vView is not defined we shift the parameters
		if (typeof sId === "object" ||
				typeof sId === "string" && vView === undefined) {
			vView = sId;
			sId = undefined;
		}

		// prepare the parameters
		if (vView) {
			if (typeof vView === "string") {
				oView.viewName = vView;
			} else {
				oView = vView;
			}
		}

		// can be removed when generic type checking for special settings is introduced
		assert(!oView.async || typeof oView.async === "boolean", "sap.ui.view factory: Special setting async has to be of the type 'boolean'!");

		// apply the id if defined
		if (sId) {
			oView.id = sId;
		}

		// apply the type defined in specialized factory functions
		if (sType) {
			oView.type = sType;
		}

		/**
		 * @deprecated because the 'Sequential' Mode is used by default and it's the only mode that will be supported
		 * in the next major release
		 */
		if (oView.type === ViewType.XML && oView.async) {
			// the processingMode might be already set by the asnychronous View.create factory
			// "SequentialLegacy" is only used if the sap.ui.view factory with async=true was called
			oView.processingMode = oView.processingMode || XMLProcessingMode.SequentialLegacy;
		}



		// view replacement
		// get current owner component
		var Component = sap.ui.require("sap/ui/core/Component");

		if (Component && _runWithOwner.getCurrentOwnerId()) {
			var customViewConfig = Component.getCustomizing(_runWithOwner.getCurrentOwnerId(), {
				type: "sap.ui.viewReplacements",
				name: oView.viewName
			});
			if (customViewConfig) {
				// make sure that "async=true" will not be overriden
				delete customViewConfig.async;

				Log.info("Customizing: View replacement for view '" + oView.viewName + "' found and applied: " + customViewConfig.viewName + " (type: " + customViewConfig.type + ")");
				extend(oView, customViewConfig);
			} else {
				Log.debug("Customizing: no View replacement found for view '" + oView.viewName + "'.");
			}
		}

		var sViewClass = getViewClassName(oView);
		view = createView(sViewClass, oView);
		return view;
	}

	return {
		create: viewFactory,
		getViewClassName: getViewClassName
	};
});
