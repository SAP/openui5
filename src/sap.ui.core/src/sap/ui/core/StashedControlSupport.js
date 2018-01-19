/*!
 * ${copyright}
 */

// Provides inactive support for controls
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element'],
	function(jQuery, Element) {
		"use strict";

		/**
		 * @class Mixin for Controls which enables stashing of controls declaratively in XMLViews
		 *
		 * Two new SpecialSettings and belonging methods are added to the controls prototype. <code>stashed</code> Controls are not
		 * created and added to the Control tree, but remain uncreated. Although they are not instances of their actual
		 * class, a surrogate is created which serves as id holder. That means it is availyble with <code>sap.ui.getCore().byId</code>
		 * and unstashable. Currently this is a one-time operation. Once unstashed, a control cannot be re-stashed again.
		 *
		 * Parts of the code here are commented out, as the SpecialSetting <code>stashed</code> may change to be Property lateron.
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
			stashedControls = {},

			/**
			 * @class surrogate for controls - serves as id holder
			 *
			 * Surrogate control which serves as id holder for its actual Control. The implementation uses an element for
			 * economic reasons. The constructor should not be called directly, see {@link sap.ui.core.StashedControlSupport.createStashedControl}
			 *
			 * @name sap.ui.core.StashedControlSupport
			 * @since 1.35
			 * @private
			 */
			StashedControl = Element.extend("sap.ui.core._StashedControl", {
				constructor: function(sId, mSettings) {
					Element.apply(this, arguments);
					// stashed is always true for instances of StashedControl
					mSettings.stashed = true;
					jQuery.sap.extend(this, mSettings);
					this._stash(mSettings.sParentId, mSettings.sParentAggregationName);
					return this;
				},
				metadata: {
					specialSettings : {
						/**
						 * the stashed state of the control
						 */
						stashed: { type: 'boolean', visibility: 'hidden' },
						/**
						 * id of the actual parent of the control (virtual control tree position)
						 */
						sParentId: { type: 'string', visibility: 'hidden' },
						/**
						 * name of the aggregation in which the actual control would be placed
						 */
						sParentAggregationName: { type: 'string', visibility: 'hidden' },
						/**
						 * hook for the later creation, which should return the actual control
						 */
						fnCreate: { type: 'function', visibility: 'hidden' }
					}
				}
			});

		/**
		 * adding the Surrogate to the control tree should not be allowed
		 *
		 * @private
		 */
		StashedControl.prototype.setParent = function() {
			jQuery.sap.log.error("Cannot set parent on a StashedControl", this.getId());
		};

		/**
		 * cloning requires special treatment
		 *
		 * @return {sap.ui.core._StashedControl} the clone
		 * @private
		 */
		StashedControl.prototype.clone = function() {
			var c = Element.prototype.clone.apply(this, arguments);
			stashedControls[c.getId()] = c;
			return c;
		};

		/**
		 * destruction requires special treatment
		 *
		 * @private
		 */
		StashedControl.prototype.destroy = function() {
			delete stashedControls[this.getId()];
			Element.prototype.destroy.apply(this, arguments);
		};

		// enable StashedControlSupport for surrogates
		mixInto(StashedControl, true);

		/**
		 * Mixin function to enhance control functionality
		 *
		 * @name sap.ui.core.StashedControlSupport.mixInto
		 * @param {function} fnClass the class to be enhanced
		 * @param {boolean} [bDefaultValue=true] default value for the stashed setting in the stashed control
		 *
		 * @private
		 */
		StashedControlSupport.mixInto = function(fnClass, bDefaultValue /*=true*/) {
			jQuery.sap.assert(!fnClass.getMetadata().hasProperty("stashed"), "StashedControlSupport: fnClass already has property 'stashed', sideeffects possible", fnClass.getMetadata().getName());
			jQuery.sap.assert(!fnClass.prototype.setStashed, "StashedControlSupport: fnClass already has method 'setStashed', sideeffects possible", fnClass.getMetadata().getName());
			mixInto(fnClass, bDefaultValue);
		};

		// private function without validity checks
		function mixInto(fnClass, bDefaultValue) {
			// add the properties
			fnClass.getMetadata().addSpecialSetting("stashed", {type: "boolean", defaultValue: !!bDefaultValue});

			// mix the required methods into the target fnClass
			fnClass.prototype.setStashed = function(bStashed) {
				if (this.stashed === true && !bStashed) {
					if (this.sParentId) {
						var oControl = unstash(this, sap.ui.getCore().byId(this.sParentId));
						// we need to set the property to the stashed control
						oControl.stashed = false;
						return;
					}
				} else if (bStashed) {
					jQuery.sap.log.warning("Cannot re-stash a control", this.getId());
				}
			};

			fnClass.prototype.getStashed = function() {
				return this.stashed;
			};

			var fnDestroy = fnClass.prototype.destroy;
			fnClass.prototype.destroy = function() {
				delete stashedControls[this.getId()];
				fnDestroy.apply(this, arguments);
			};

			fnClass.prototype._stash = function(sParentId, sParentAggregationName) {
				// for later unstash these parent infos have to be kept
				this.sParentId = sParentId;
				this.sParentAggregationName = sParentAggregationName;
				stashedControls[this.getId()] = this;
			};
		}

		function unstash(oControl, oParent) {
			if (oControl instanceof StashedControl) {
				// remember activation function and parent aggregation name of surrogate
				var aControls, Component, oOwnerComponent,
					fnCreate = oControl.fnCreate,
					sParentAggregationName = oControl.sParentAggregationName;
				// destroy obsolete surrogate control - free the id
				oControl.destroy();

				// as the runAsOwner context is missing here we need to call it
				Component = sap.ui.require("sap/ui/core/Component");
				oOwnerComponent = Component && Component.getOwnerComponentFor(oParent);
				if (oOwnerComponent) {
					aControls = oOwnerComponent.runAsOwner(fnCreate);
				} else {
					aControls = fnCreate();
				}

				// call hook to create the actual control (multiple controls in case of fragment)
				aControls.forEach(function(c) {
					oParent.getMetadata().getAggregation(sParentAggregationName).add(oParent, c);
				});
			}
			delete stashedControls[oControl.getId()];
			return oControl;
		}

		function getStashedControls(bAsInstance, sParentId) {
			var aStashedChildren = [];
			for (var sId in stashedControls) {
				var vInstanceOrId = bAsInstance ? stashedControls[sId] : stashedControls[sId].getId();
				if (!sParentId || stashedControls[sId].sParentId === sParentId) {
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
		 * @param {string} sId id of the actual control the StashedControl serves as surrogate for
		 * @param {object} mSettings the settings object
		 * @param {string} mSettings.sParentId id of the actual parent of the control (virtual control tree position)
		 * @param {string} mSettings.sParentAggregationName name of the aggregation in which the actual control would be placed
		 * @param {string} mSettings.fnCreate hook for the later creation, which should return the actual control
		 * @return {sap.ui.core._StashedControl} the StashedControl
		 *
		 * @private
		 */
		StashedControlSupport.createStashedControl = function(sId, mSettings) {
			return new StashedControl(sId, mSettings);
		};

		return StashedControlSupport;

	});
