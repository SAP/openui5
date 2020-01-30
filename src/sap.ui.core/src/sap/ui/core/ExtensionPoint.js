/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath", "sap/ui/core/mvc/View"],
	function(Log, ObjectPath, View) {

	"use strict";

	/**
	 * Creates 0..n UI5 controls from an <code>ExtensionPoint</code>.
	 *
	 * One control if the <code>ExtensionPoint</code> is e.g. filled with a <code>View</code>, zero for extension points without configured extension and
	 * n controls for multi-root <code>Fragments</code> as extension.
	 *
	 * In <code>JSViews</code>, this function allows both JSON notation in aggregation content as well as adding an extension point to an aggregation after the target control
	 * has already been instantiated. In the latter case the optional parameters oTargetControls and oTargetAggregation need to be specified.
	 *
	 * @param {sap.ui.core.mvc.View|sap.ui.core.Fragment} oContainer The view or fragment containing the extension point
	 * @param {string} sExtName The extensionName used to identify the extension point in the customizing
	 * @param {function} [fnCreateDefaultContent] Optional callback function creating default content, returning an array of controls. It is executed
	 * 			when there's no customizing, if not provided, no default content will be rendered.
	 * 			<code>fnCreateDefaultContent</code> might also return a Promise, which resolves with an array of controls.
	 * @param {sap.ui.core.Control} [oTargetControl] Optional - use this parameter to attach the extension point to a particular aggregation
	 * @param {string} [sAggregationName] Optional - if provided along with <code>oTargetControl</code>, the extension point content is added to this particular aggregation at oTargetControl,
	 * 			if not given, but an oTargetControl is still present, the function will attempt to add the extension point to the default aggregation of oTargetControl.
	 * 			If no oTargetControl is provided, sAggregationName will also be ignored.
	 *
	 * @return {sap.ui.core.Control[]|Promise} An array with 0..n controls created from an ExtensionPoint or
	 * 			if fnCreateDefaultContent is called and returns a Promise, a Promise with the controls is returned instead
	 * @deprecated since 1.56, Use {@link sap.ui.core.ExtensionPoint.load} instead
	 * @public
	 * @static
	 */
	sap.ui.extensionpoint = function(oContainer, sExtName, fnCreateDefaultContent,  oTargetControl, sAggregationName) {
		Log.warning("Do not use deprecated factory function 'sap.ui.extensionpoint'. Use 'sap.ui.core.ExtensionPoint.load' instead", "sap.ui.extensionpoint", null, function () {
			return {
				type: "sap.ui.extensionpoint",
				name: sExtName
			};
		});
		return ExtensionPoint._factory(oContainer, sExtName, fnCreateDefaultContent,  oTargetControl, sAggregationName);
	};


	/**
	 * @alias sap.ui.core.ExtensionPoint
	 * @namespace
	 * @public
	 */
	// Following we attach all additional module API functions to the original sap.ui.extensionpoint factory.
	// For compatibility we cannot change the actual return value of this module.
	var ExtensionPoint = sap.ui.extensionpoint;

	/**
	 * API documentation see ExtensionPoint.load() and sap.ui.extensionpoint().
	 *
	 * Used only internally by this module, as well as the XMLTemplateProcessor.
	 */
	ExtensionPoint._factory = function(oContainer, sExtName, fnCreateDefaultContent,  oTargetControl, sAggregationName) {
		var extensionConfig, oView, vResult;

		// Note: the existing dependencies to ./Fragment and ./View are not statically declared to avoid cyclic dependencies
		// Note: the dependency to CustomizingConfiguration is not statically declared to not enforce the loading of that module

		var CustomizingConfiguration = sap.ui.require('sap/ui/core/CustomizingConfiguration'),
			View = sap.ui.require('sap/ui/core/mvc/View'),
			Fragment = sap.ui.require('sap/ui/core/Fragment');

		// do we have a view to check or do we need to check for configuration for a fragment?
		if (View && oContainer instanceof View) {
			extensionConfig = CustomizingConfiguration && CustomizingConfiguration.getViewExtension(oContainer.sViewName, sExtName, oContainer);
			oView = oContainer;
		} else if (Fragment && oContainer instanceof Fragment) {
			extensionConfig = CustomizingConfiguration && CustomizingConfiguration.getViewExtension(oContainer.getFragmentName(), sExtName, oContainer);
			oView = oContainer._oContainingView;
		}

		// Extension Point - is something configured?
		if (CustomizingConfiguration) {
			if (extensionConfig) {
				if (extensionConfig.className) {
					var fnClass = sap.ui.requireSync(extensionConfig.className.replace(/\./g, "/")); // make sure fnClass.getMetadata() exists
					fnClass = fnClass || ObjectPath.get(extensionConfig.className);
					var sId = oView && extensionConfig.id ? oView.createId(extensionConfig.id) : extensionConfig.id;
					Log.info("Customizing: View extension found for extension point '" + sExtName
							+ "' in View '" + oView.sViewName + "': " + extensionConfig.className + ": " + (extensionConfig.viewName || extensionConfig.fragmentName));

					if (extensionConfig.className === "sap.ui.core.Fragment") {
						var oFragment = new fnClass({
							id: sId,
							type: extensionConfig.type,
							fragmentName: extensionConfig.fragmentName,
							containingView: oView
						});
						vResult = (Array.isArray(oFragment) ? oFragment : [oFragment]); // vResult is now an array, even if empty - so if a Fragment is configured, the default content below is not added anymore

					} else if (extensionConfig.className === "sap.ui.core.mvc.View") {
						var oView = View._legacyCreate({type: extensionConfig.type, viewName: extensionConfig.viewName, id: sId});
						vResult = [oView]; // vResult is now an array, even if empty - so if a Fragment is configured, the default content below is not added anymore

					} else {
						// unknown extension class
						Log.warning("Customizing: Unknown extension className configured (and ignored) in Component.js for extension point '" + sExtName
								+ "' in View '" + oView.sViewName + "': " + extensionConfig.className);
					}
				} else {
					Log.warning("Customizing: no extension className configured in Component.js for extension point '" + sExtName
							+ "' in View '" + oView.sViewName + "': " + extensionConfig.className);
				}
			}
		} else if (ExtensionPoint._sExtensionProvider) {
			/**
			 * In case we have an ExtensionProvider assigned, we return a marker object.
			 * This marker object will be used later during the View processing to apply the ExtensionProvider
			 * once the target control (parent of the extension point) was instantiated.
			 *
			 * The marker object is defined below, including all available properties.
			 * Properties starting with an underscore will only be used internally for processing.
			 * All other properties are exposed to be used for applying flexibility changes.
			 *
			 * The properties will be correctly filled when applyExtensionPoint() is called on the ExtensionProvider module.
			 */
			return [{
				// The containing view instance.
				view: oView,

				// The extension point name.
				name: sExtName,

				// Callback, which can be called to create the default content of the ExtensionPoint if needed.
				// The fnCreateDefaultContent function can either return an array of controls OR a Promise,
				// which then resolves with an array of controls.
				// See:  {@link sap.ui.core.ExtensionPoint.load}
				// Also: {@link sap.ui.extensionpoint}
				createDefault: fnCreateDefaultContent,

				// The target control into which the ExtensionPoint content will be inserted.
				targetControl: undefined,

				// The name of the target aggregation inside the target control.
				aggregationName: undefined,

				// the index of the ExtensionPoint inside its target aggregation in the parent control
				index: undefined,

				// The ready() function needs to be called once the controls have been inserted into the
				// target aggregation of the target control.
				// An array of all inserted controls must be passed to the ready function.
				// The index of all following sibling ExtensionPoints will then be shifted via the the marker object by reference.
				ready: function(aControls) {
					// propagate index shift
					var next = this._nextSibling;
					while (next != null) {
						next.index += aControls.length;
						next = next._nextSibling;
					}
				},

				// only used internally to check for a marker object
				_isExtensionPoint: true,

				// reference to the next sibling ExtensionPoint OR null if none present in the XML DOM
				_nextSibling: null
			}];
		}

		if (!vResult && typeof fnCreateDefaultContent === 'function') {
			// if there is no extension configured or found or customizing disabled - check for default content
			// do we have a callback function?
			vResult = fnCreateDefaultContent();
		}

		var fnProcessResult = function (vResult) {
			// if the result returned from the default content is no array, wrap it in one
			if (vResult && !Array.isArray(vResult)){
				vResult = [vResult];
			}

			//if we have any result from either default content or customizing AND a target control is provided:
			if (vResult && oTargetControl) {
				//directly add the extension to the corresponding aggregation at the target control:
				var oAggregationInfo = oTargetControl.getMetadata().getAggregation(sAggregationName);
				if (oAggregationInfo) {
					for (var i = 0, l = vResult.length; i < l; i++) {
						// call the corresponding mutator for each element within the extension point - may be one or multiple elements
						oTargetControl[oAggregationInfo._sMutator](vResult[i]);
					}
				} else {
					// the target control has no default aggregation, or the aggregationName provided doesn't match an existing aggregation as defined at the targetControl
					Log.error("Creating extension point failed - Tried to add extension point with name " + sExtName + " to an aggregation of " +
							oTargetControl.getId() + " in view " + oView.sViewName + ", but sAggregationName was not provided correctly and I could not find a default aggregation");
				}
			}

			return vResult || [];
		};

		// if vResult was created via fnCreateDefaultContent and is a Promise (or SyncPromise)
		if (vResult && typeof vResult.then === 'function') {
			return vResult.then(fnProcessResult);
		} else {
			return fnProcessResult(vResult);
		}
	};

	/**
	 * Registers the given module path as an ExtensionProvider.
	 * The registered module will be loaded once an ExtensionPoint is encountered during XMLView processing.
	 *
	 * @param {string} sExtensionProvider the module path of the ExtensionProvider
	 * @private
	 * @ui5-restricted sap.ui.fl
	 * @since 1.76.0
	 */
	ExtensionPoint.registerExtensionProvider = function(sExtensionProvider) {
		ExtensionPoint._sExtensionProvider = sExtensionProvider;
	};

	/**
	 * Creates 0..n UI5 controls from an <code>ExtensionPoint</code>.
	 *
	 * One control if the <code>ExtensionPoint</code> is e.g. filled with a <code>View</code>, zero for extension points without configured extension and
	 * n controls for multi-root <code>Fragments</code> as extension.
	 *
	 * @param {object} mOptions an object map (see below)
	 * @param {sap.ui.core.mvc.View|sap.ui.core.Fragment} mOptions.container The view or fragment containing the extension point
	 * @param {string} mOptions.name The <code>mOptions.name</code> is used to identify the extension point in the customizing
	 * @param {function} [mOptions.createDefaultContent] Optional callback function creating default content, returning an array of controls. It is executed
	 *        when there's no customizing, if not provided, no default content will be rendered.
	 *        <code>mOptions.createDefaultContent</code> might also return a Promise, which resolves with an array of controls.
	 * @return {Promise<sap.ui.core.Control[]>} a Promise, which resolves with an array of 0..n controls created from an <code>ExtensionPoint</code>.
	 *        If <code>mOptions.createDefaultContent</code> is called and returns a Promise, that Promise is returned by <code>ExtensionPoint.load</code>.
	 * @since 1.56.0
	 * @public
	 * @static
	 */
	ExtensionPoint.load = function(mOptions) {
		return Promise.resolve(
			ExtensionPoint._factory(
				mOptions.container,
				mOptions.name,
				mOptions.createDefaultContent
			)
		);
	};

	return ExtensionPoint;
});