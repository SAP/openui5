/*!
 * ${copyright}
 */

// Provides element sap.f.FlexibleColumnLayoutData
sap.ui.define(["sap/ui/core/LayoutData", "sap/ui/base/ManagedObjectObserver", "sap/ui/thirdparty/jquery"],
	function(LayoutData, ManagedObjectObserver, jQuery) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.f.FlexibleColumnLayoutData</code>.
		 *
		 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new element.
		 *
		 * @class
		 * Holds layout data for <code>sap.f.FlexibleColumnLayout</code>.
		 * Allows LayoutData of type <code>sap.f.FlexibleColumnLayoutDataForDesktop</code> or <code>sap.f.FlexibleColumnLayoutFlexibleColumnLayoutDataForTablet</code>
		 *
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @extends sap.ui.core.LayoutData
		 *
		 * @since 1.128
		 * @public
		 * @constructor
		 * @alias sap.f.FlexibleColumnLayoutData
		 */
		var FlexibleColumnLayoutData = LayoutData.extend("sap.f.FlexibleColumnLayoutData", /** @lends sap.f.FlexibleColumnLayoutData.prototype */ {
			metadata: {

				library: "sap.f",
				aggregations: {

					/**
					 * Allows LayoutData of type <code>sap.f.FlexibleColumnLayoutDataForDesktop</code>
					 */
					desktopLayoutData: {type: "sap.f.FlexibleColumnLayoutDataForDesktop", multiple: false, singularName: "desktopLayoutData"},
					/**
					 * Allows LayoutData of type <code>sap.f.FlexibleColumnLayoutDataForTablet</code>
					 */
					tabletLayoutData: {type: "sap.f.FlexibleColumnLayoutDataForTablet", multiple: false, singularName: "tabletLayoutData"}
				}
			}
		});

		FlexibleColumnLayoutData.prototype.init = function () {
			this._oObserver = new ManagedObjectObserver(FlexibleColumnLayoutData.prototype._onAggregationChange.bind(this));
			this._oObserver.observe(this, {
				aggregations: [
					"desktopLayoutData",
					"tabletLayoutData"
				]
			});
		};

		FlexibleColumnLayoutData.prototype._onAggregationChange = function(oChanges) {
			// Handle changes in the aggregations
			if (oChanges.mutation === "insert") {
				// Observe the properties of the newly added control
				this._observeControlProperties(oChanges.child);
			} else if (oChanges.mutation === "remove") {
				this._unobserveControlProperties(oChanges.child);
			} else if (oChanges.type === "property") {
				this.fireEvent("_layoutDataPropertyChanged", {
					layout: oChanges.name.charAt(0).toUpperCase() + oChanges.name.slice(1),
					srcControl: oChanges.object,
					oldValue: oChanges.old,
					newValue: oChanges.current
				});
			}
		};

		FlexibleColumnLayoutData.prototype._observeControlProperties = function(oControl) {
			// Observe changes in the properties of the control
			this._oObserver.observe(oControl, {
				properties: Object.keys(oControl.getMetadata().getAllProperties())
			});
		};

		FlexibleColumnLayoutData.prototype._unobserveControlProperties = function(oControl) {
			// Stop observing changes in the properties of the control
			this._oObserver.unobserve(oControl, {
				properties: Object.keys(oControl.getMetadata().getAllProperties())
			});
		};

		FlexibleColumnLayoutData.prototype.invalidate = function() {
			// Override to prevent error from Core implementation when the parent of FlexibleColumnLayout is UIComponent.
			// Here we also want to fire a LayoutDataChange event to the actual parent - the FlexibleColumnLayout Control.
			var oParent = this.getParent();

			if (oParent) {
				var oEvent = jQuery.Event("LayoutDataChange");
				oEvent.srcControl = this;
				oParent._handleEvent?.(oEvent);
			}
		};

		return FlexibleColumnLayoutData;
	});
