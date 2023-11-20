sap.ui.define(['sap/ui/core/Fragment'],
	function(Fragment) {
	"use strict";

	var ExtensionPointProvider = {
		/**
		 * <code>ExtensionPointProvider.applyExtensionPoint</code> is called during XMLView processing once all necessary information
		 * is collected.
		 *
		 * After inserting the final controls into the target aggregation of the target control,
		 * the ready() function on the oExtensionPoint object must be called.
		 *
		 * @param {object} oExtensionPoint an object containing all necessary information to process the ExtensionPoint.
		 * Documentation of all available properties and functions can be found in {@link sap.ui.core.ExtensionPoint}.
		 * @returns {Promise} a Promise which resolves once the
		 */
		applyExtensionPoint: function(oExtensionPoint) {
			return ExtensionPointProvider.doIt(oExtensionPoint, true);
		},
		doIt: function(oExtensionPoint, bInsert) {
			var pLoaded;

			var checkForExtensionPoint = function(aControls) {
				var pNested = [];
				aControls.forEach(function(oControl, i) {
					if (oControl._isExtensionPoint) {
						//pass aggregationBinding info, fragmentID, view instance, ... to next level EP? If so simply do it!
						pNested.push(ExtensionPointProvider.doIt(oControl).then(function(aNestedControls) {
							aControls.splice(i,1);
							aNestedControls.forEach(function(oNestedControl, j) {
								aControls.splice(i + j, 0, oNestedControl );
							});
							return aControls;
						}));
					}
				});
				if (pNested.length > 0) {
					return Promise.all(pNested).then(function() {
						return aControls;
					});
				} else {
					return Promise.resolve(aControls);
				}
			};
			var fnInsert = function(aControls) {
				aControls.forEach(function(oControl, i) {
				   oExtensionPoint.targetControl.insertAggregation(oExtensionPoint.aggregationName, oControl, oExtensionPoint.index + i);
				});
			};

			if (["EP1", "EP99"].indexOf(oExtensionPoint.name) >= 0) {

				if (oExtensionPoint.name == "EP1") {
					pLoaded =  Fragment.load({
						id: oExtensionPoint.view.createId("customFragment"),
						name: "testdata.customizing.customer.ext.Custom"
					});
				} else if (oExtensionPoint.name == "EP99") {
					pLoaded =  Fragment.load({
						id: oExtensionPoint.view.createId("ep99"),
						name: "testdata.customizing.customer.ext.EP99"
					});
				}

				/**
				 * Need the owner component?
				 *
				 * var oComponent = sap.ui.core.Component.getOwnerComponentFor(oExtensionPoint.view);
				 * oComponent.runAsOwner(function() {
				 *	// create controls
				 * });
				 */

				pLoaded = pLoaded.then(function(vControls) {
					if (!Array.isArray(vControls)) {
						vControls = [vControls];
					}
					return checkForExtensionPoint(vControls);
				}).then(function(vControls) {
					if (bInsert) {
						fnInsert(vControls);
						oExtensionPoint.ready(vControls);
					}
				});
			} else {
				pLoaded = new Promise(function(resolve, reject) {
					// NOTE: createDefault() can also return an array of controls synchronously!
					oExtensionPoint.createDefault().then(function(aControls) {
						return checkForExtensionPoint(aControls);
					}).then(function(aControls) {
						// insert and move indices only once at first level EP
						if (bInsert) {
							fnInsert(aControls);
							oExtensionPoint.ready(aControls);
						}
						resolve(aControls);
					});
				});
			}
			return pLoaded;
		}
	};

	return ExtensionPointProvider;
});