/*!
 * ${copyright}
 */

// Provides inactive support for controls
sap.ui.define(["sap/base/assert", "sap/ui/core/Element"],
	function(assert, Element) {
		"use strict";

		/**
		 * @class Mixin for Controls which enables stashing of controls declaratively in XMLViews
		 *
		 * NOTE: stashingh of <code>sap.ui.core.Fragments</code> and <code>sap.ui.core.mvc.View</code> is not supported!
		 *
		 * <code>stashed</code> Controls are created as placeholder control without any content and bindings
		 * and added to the Control tree. That means it is available with <code>Element.getElementById</code>
		 * and as child in the parents aggregation. It is unstashable by calling <code>unstash</code>.
		 * Currently this is a one-time operation. Once unstashed, a control cannot be re-stashed again.
		 *
		 * @name sap.ui.core.StashedControlSupport
		 * @since 1.35
		 * @private
		 */
		var StashedControlSupport = {},

			/**
			 * inactive controls registry
			 * @private
			 */
			stashedControls = {};

		/**
		 * Mixin function to enhance control functionality
		 *
		 * @name sap.ui.core.StashedControlSupport.mixInto
		 * @param {function} fnClass the class to be enhanced
		 *
		 * @private
		 */
		StashedControlSupport.mixInto = function(fnClass) {
			assert(!fnClass.prototype.unstash, "StashedControlSupport: fnClass already has method 'unstash', sideeffects possible", fnClass.getMetadata().getName());
			if (fnClass.getMetadata().isA("sap.ui.core.Fragment") || fnClass.getMetadata().isA("sap.ui.core.mvc.View")) {
				throw new Error("Stashing is not supported for sap.ui.coreFragment or sap.ui.core.mvc.View");
			}
			mixInto(fnClass);
		};

		// private function without validity checks
		function mixInto(fnClass) {
			// mix the required methods into the target fnClass
			fnClass.prototype.unstash = function() {
				if (this.isStashed()) {
					var oControl = unstash(this);
					// we need to set the property to the stashed control
					oControl.stashed = false;
					return oControl;
				}
				return this;
			};

			fnClass.prototype.isStashed = function() {
				return !!stashedControls[this.getId()];
			};

			var fnClone = fnClass.prototype.clone;
			fnClass.prototype.clone = function() {
				if (this.isStashed()) {
					throw new Error("A stashed control cannot be cloned, id: '" + this.getId() + "'.");
				}
				return fnClone.apply(this, arguments);
			};

			var fnDestroy = fnClass.prototype.destroy;
			fnClass.prototype.destroy = function() {
				delete stashedControls[this.getId()];
				fnDestroy.apply(this, arguments);
			};
		}

		function unstash(oWrapperControl) {
			var oWrapperParent;
			var iIndexInParent;
			var oTargetAggregation;

			var oStashedInfo = stashedControls[oWrapperControl.getId()];

			// find parent of wrapper control
			oWrapperParent = oWrapperControl.getParent();

			// the wrapper might have been removed from the control tree
			// in this case we can't find it in any aggregation and will not have an index for removal/insertation
			if (oWrapperParent) {
				oTargetAggregation = oWrapperParent.getMetadata().getAggregation(oWrapperControl.sParentAggregationName);
				iIndexInParent = oTargetAggregation.indexOf(oWrapperParent, oWrapperControl);

				// remove wrapper (removeAggregation does nothing if not in the aggregation)
				oTargetAggregation.remove(oWrapperParent, oWrapperControl);
			}

			// always: destroy wrapper and free the id for the actual control instance
			oWrapperControl.destroy();

			// finally perform the real unstashing by starting the XMLTP again for the stashed part (scoped in XMLTP)
			var Component = sap.ui.require("sap/ui/core/Component");
			var oOwnerComponent = Component && oWrapperParent && Component.getOwnerComponentFor(oWrapperParent);
			var aControls;
			var fnCreate = oStashedInfo.fnCreate;

			if (oOwnerComponent) {
				aControls = oOwnerComponent.runAsOwner(fnCreate);
			} else {
				aControls = fnCreate();
			}

			// found an index: we can now insert the actual control instance
			if (iIndexInParent >= 0) {
				// call hook to create the actual control (multiple controls in case of fragment)
				aControls.forEach(function(c) {
					oTargetAggregation.insert(oWrapperParent, c, iIndexInParent);
				});
			}

			delete stashedControls[oWrapperControl.getId()];
			//TemplateProcessor returns an array. Should contain only one control in the stashed scenario.
			return aControls[0];
		}

		function getStashedControls(bAsInstance, sParentId) {
			var aStashedChildren = [];
			for (var sId in stashedControls) {
				// get placeholder for stashed-control
				var oPlaceholder = Element.getElementById(stashedControls[sId].wrapperId);
				var vInstanceOrId = bAsInstance ? oPlaceholder : sId;
				// A stashed-control without a placeholder can happen if the placeholder was already destroyed.
				// In this case we also don't have a parent.
				var oPlaceholderParent = oPlaceholder && oPlaceholder.getParent();

				if (!sParentId || (oPlaceholderParent && oPlaceholderParent.getId() === sParentId)) {
					aStashedChildren.push(vInstanceOrId);
				}
			}
			return aStashedChildren;
		}

		/**
		 * Gets the ids of StashedControls
		 *
		 * @name sap.ui.core.StashedControlSupport.getStashedControlIds
		 * @param {string} [sParentId] if set only StashedControlIds for a specific parent are returned
		 * @return {string[]} array with the ids of the StashedControls
		 *
		 * @private
		 */
		StashedControlSupport.getStashedControlIds = function(sParentId) {
			return getStashedControls(false, sParentId);
		};

		/**
		 * Gets the instances of StashedControls
		 *
		 * @name sap.ui.core.StashedControlSupport.getStashedControlIds
		 * @param {string} [sParentId] if set only StashedControls for a specific parent are returned
		 * @return {Control[]} array with the StashedControls
		 *
		 * @private
		 */
		StashedControlSupport.getStashedControls = function(sParentId) {
			return getStashedControls(true, sParentId);
		};

		/**
		 * StashedControl factory function
		 *
		 * @name sap.ui.core.StashedControlSupport.createStashedControl
		 * @param {object} mSettings the settings object
		 * @param {string} mSettings.wrapperId the ID for the placeholder control
		 * @param {string} mSettings.fnCreate hook for the later creation, which should return the actual control
		 * @return {sap.ui.core._StashedControl} the StashedControl
		 *
		 * @private
		 */
		StashedControlSupport.createStashedControl = function(mSettings) {
			var oStashedInfo = {
				wrapperId: mSettings.wrapperId,
				fnCreate: mSettings.fnCreate
			};
			stashedControls[mSettings.wrapperId] = oStashedInfo;
			return oStashedInfo;
		};

		return StashedControlSupport;

	});