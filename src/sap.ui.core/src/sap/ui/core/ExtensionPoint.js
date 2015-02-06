/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {

	// TODO: the existing dependencies to ./Fragment and ./View can't be declared as they would result in a new cyclic dependency
	// Note: the dependency to CustomizingConfiguration is not declared in order not to enforce the loading of CustomizingConfiguration

	"use strict";

	/**
	 * @callback createDefaultContent
	 * @return {sap.ui.core.Control|[sap.ui.core.Control]} a control or an array with 0..n controls
	 */

	/**
	 * Creates 0..n UI5 controls from an ExtensionPoint.
	 * One control if the ExtensionPoint is e.g. filled with a View, zero for ExtensionPoints without configured extension and
	 * n controls for multi-root Fragments as extension.
	 *
	 * In JSViews, this function allows both JSON notation in aggregation content as well as adding an extension point to an aggregation after the target control
	 * has already been instantiated. In the latter case the optional parameters oTargetControls and oTargetAggregation need to be specified.
	 *
	 * @param {sap.ui.core.mvc.View|sap.ui.core.Fragment} oContainer The view or fragment containing the extension point
	 * @param {string} sExtName The extensionName used to identify the extension point in the customizing
	 * @param {createDefaultContent} [fnCreateDefaultContent] Optional callback function creating default content, returning an Array of controls. It is executed
	 * 			when there's no customizing, if not provided, no default content will be rendered.
	 * @param {sap.ui.core.Control} [oTargetControl] Optional - use this parameter to attach the extension point to a particular aggregation
	 * @param {string} [sAggregationName] Optional - if provided along with oTargetControl, the extension point content is added to this particular aggregation at oTargetControl,
	 * 			if not given, but an oTargetControl is still present, the function will attempt to add the extension point to the default aggregation of oTargetControl.
	 * 			If no oTargetControl is provided, sAggregationName will also be ignored.
	 *
	 * @return {sap.ui.core.Control[]} an array with 0..n controls created from an ExtensionPoint
	 * @public
	 * @static
	 */
	sap.ui.extensionpoint = function(oContainer, sExtName, fnCreateDefaultContent,  oTargetControl, sAggregationName) {
		var extensionConfig, oView, vResult;

		// Extension Point - is something configured?
		if (sap.ui.core.CustomizingConfiguration) {

			// do we have a view to check or do we need to check for configuration for a fragment?
			if (oContainer instanceof sap.ui.core.mvc.View){
				extensionConfig = sap.ui.core.CustomizingConfiguration.getViewExtension(oContainer.sViewName, sExtName, oContainer);
				oView = oContainer;
			} else if (oContainer instanceof sap.ui.core.Fragment) {
				extensionConfig = sap.ui.core.CustomizingConfiguration.getViewExtension(oContainer.getFragmentName(), sExtName, oContainer);
				oView = oContainer._oContainingView;
			}

			if (extensionConfig) {
				if (extensionConfig.className) {
					jQuery.sap.require(extensionConfig.className); // make sure oClass.getMetadata() exists
					var oClass = jQuery.sap.getObject(extensionConfig.className);
					jQuery.sap.log.info("Customizing: View extension found for extension point '" + sExtName
							+ "' in View '" + oView.sViewName + "': " + extensionConfig.className + ": " + (extensionConfig.viewName || extensionConfig.fragmentName));

					if (extensionConfig.className === "sap.ui.core.Fragment") {
						var oFragment = new oClass({
							type: extensionConfig.type,
							fragmentName: extensionConfig.fragmentName,
							containingView: oView
						});
						vResult = (jQuery.isArray(oFragment) ? oFragment : [oFragment]); // vResult is now an array, even if empty - so if a Fragment is configured, the default content below is not added anymore

					} else if (extensionConfig.className === "sap.ui.core.mvc.View") {
						var oView = sap.ui.view({type: extensionConfig.type, viewName: extensionConfig.viewName});
						vResult = [oView]; // vResult is now an array, even if empty - so if a Fragment is configured, the default content below is not added anymore

					} else {
						// unknown extension class
						jQuery.sap.log.warning("Customizing: Unknown extension className configured (and ignored) in Component.js for extension point '" + sExtName
								+ "' in View '" + oView.sViewName + "': " + extensionConfig.className);
					}
				} else {
					jQuery.sap.log.warning("Customizing: no extension className configured in Component.js for extension point '" + sExtName
							+ "' in View '" + oView.sViewName + "': " + extensionConfig.className);
				}
			}
		}

		if (!vResult && typeof fnCreateDefaultContent === 'function') {
			// if there is no extension configured or found or customizing disabled - check for default content
			// do we have a callback function?
			vResult = fnCreateDefaultContent();
		}

		// if the result returned from the default content is no array, wrap it in one
		if (vResult && !jQuery.isArray(vResult)){
			vResult = [vResult];
		}

		//if we have any result from either default content or customizing AND a target control is provided:
		if (vResult && oTargetControl) {
			//directly add the extension to the corresponding aggregation at the target control:
			var oAggregationInfo;
			if (!sAggregationName) {
				// no aggregation name for the target control is provided, so we try to retrieve the default aggregation and use this instead
				jQuery.sap.log.debug("no target aggregationName given - trying to attach the extension point content to the targetControl's default aggregation");
				oAggregationInfo = oTargetControl.getMetadata().getDefaultAggregation();
			} else {
				oAggregationInfo = oTargetControl.getMetadata().getJSONKeys()[sAggregationName];
			}
			if (oAggregationInfo) {
				for (var i = 0, l = vResult.length; i < l; i++) {
					// call the corresponding mutator for each element within the extension point - may be one or multiple elements
					oTargetControl[oAggregationInfo._sMutator](vResult[i]);
				}
			} else {
				// the target control has no default aggregation, or the aggregationName provided doesn't match an existing aggregation as defined at the targetControl
				jQuery.sap.log.error("Creating extension point failed - Tried to add extension point with name " + sExtName + " to an aggregation of " +
						oTargetControl.getId() + " in view " + oView.sViewName + ", but sAggregationName was not provided correctly and I could not find a default aggregation");
			}
		}

		return vResult || [];
	};

	return sap.ui.extensionpoint;

}, /* bExport= */ false);
