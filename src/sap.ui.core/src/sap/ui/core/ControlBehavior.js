/*!
 * ${copyright}
 */

// Provides module sap.ui.core.ControlBehavior
sap.ui.define([
	"sap/base/config",
	"sap/base/Eventing",
	"sap/ui/core/AnimationMode"
], (
	BaseConfig,
	Eventing,
	AnimationMode
) => {
	"use strict";

	const oWritableConfig = BaseConfig.getWritableInstance();
	const oEventing = new Eventing();

	/**
	 * Provides control behavior relevant configuration options
	 *
	 * @namespace
	 * @alias module:sap/ui/core/ControlBehavior
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @since 1.116.0
	 */
	const ControlBehavior = {
		/**
		 * The <code>change</code> event is fired, when the configuration options are changed.
		 *
		 * @name module:sap/ui/core/ControlBehavior.change
		 * @event
		 * @type {module:sap/ui/core/ControlBehavior$ChangeEvent}
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.116.0
		 */

		/**
		 * The theme scoping change Event.
		 *
		 * @typedef {Object<string,string>} module:sap/ui/core/ControlBehavior$ChangeEvent
		 * @property {string} animationMode Whether the animation mode should be active or not.
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 * @since 1.116.0
		 */

		/**
		 * Attaches the <code>fnFunction</code> event handler to the {@link #event:change change} event
		 * of <code>sap.ui.core.ControlBehavior</code>.
		 *
		 * When called, the context of the event handler (its <code>this</code>) will be bound to
		 * <code>oListener</code> if specified, otherwise it will be bound to this
		 * <code>sap.ui.core.ControlBehavior</code> itself.
		 *
		 * @param {function(module:sap/ui/core/ControlBehavior$ChangeEvent)} fnFunction
		 *   The function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.116.0
		 */
		attachChange: (fnFunction) => {
			oEventing.attachEvent("change", fnFunction);
		},

		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:change change} event of
		 * this <code>sap.ui.core.ControlBehavior</code>.
		 *
		 * @param {function(module:sap/ui/core/ControlBehavior$ChangeEvent)} fnFunction Function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.116.0
		 */
		detachChange: (fnFunction) => {
			oEventing.detachEvent("change", fnFunction);
		},

		/**
		 * Returns whether the accessibility mode is enabled or not.
		 * @return {boolean} whether the accessibility mode is enabled or not
		 * @public
		 * @since 1.116.0
		 */
		isAccessibilityEnabled: () => {
			return oWritableConfig.get({
				name: "sapUiAccessibility",
				type: BaseConfig.Type.Boolean,
				defaultValue: true,
				external: true
			});
		},

		/**
		 * Returns the current animation mode.
		 *
		 * @return {module:sap/ui/core/AnimationMode} The current animationMode
		 * @public
		 * @since 1.116.0
		 */
		getAnimationMode: () => {
			let sAnimationMode = oWritableConfig.get({
				name: "sapUiAnimationMode",
				type: AnimationMode,
				defaultValue: undefined,
				external: true
			});
			const bAnimation = oWritableConfig.get({
				name: "sapUiAnimation",
				type: BaseConfig.Type.Boolean,
				defaultValue: true,
				external: true
			});
			if (sAnimationMode === undefined) {
				if (bAnimation) {
					sAnimationMode = AnimationMode.full;
				} else {
					sAnimationMode = AnimationMode.minimal;
				}
			}
			BaseConfig._.checkEnum(AnimationMode, sAnimationMode, "animationMode");
			return sAnimationMode;
		},

		/**
		 * Sets the current animation mode.
		 *
		 * Expects an animation mode as string and validates it. If a wrong animation mode was set, an error is
		 * thrown. If the mode is valid it is set, then the attributes <code>data-sap-ui-animation</code> and
		 * <code>data-sap-ui-animation-mode</code> of the HTML document root element are also updated.
		 * If the <code>animationMode</code> is <code>AnimationMode.none</code> the old
		 * <code>animation</code> property is set to <code>false</code>, otherwise it is set to <code>true</code>.
		 *
		 * @param {module:sap/ui/core/AnimationMode} sAnimationMode A valid animation mode
		 * @throws {Error} If the provided <code>sAnimationMode</code> does not exist, an error is thrown
		 * @public
		 * @since 1.116.0
		 */
		setAnimationMode: (sAnimationMode) => {
			BaseConfig._.checkEnum(AnimationMode, sAnimationMode, "animationMode");

			const sOldAnimationMode = oWritableConfig.get({
				name: "sapUiAnimationMode",
				type: AnimationMode,
				defaultValue: undefined,
				external: true
			});

			// Set the animation mode and update html attributes.
			oWritableConfig.set("sapUiAnimationMode", sAnimationMode);
			if (sOldAnimationMode != sAnimationMode) {
				fireChange({animationMode: sAnimationMode});
			}
		}
	};

	function fireChange(mChanges) {
		oEventing.fireEvent("change", mChanges);
	}

	return ControlBehavior;
});