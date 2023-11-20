/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/Object',
	'sap/base/config',
	'sap/base/util/Deferred',
	'sap/base/util/LoaderExtensions',
	'sap/ui/core/BlockLayerUtils'
], function(
	BaseObject,
	BaseConfig,
	Deferred,
	LoaderExtensions,
	BlockLayerUtils
) {
	"use strict";

	// Array containing the registered provider functions
	var aProviders = [];

	/**
	 * Creates a Placeholder instance. A path to a '.html' file containing the placeholder HTML content
	 * must be provided.
	 *
	 * Note: As normal '.html' files are not bundled automatically, it is recommended to use an HTMLFragment
	 * definition ('.fragment.html') instead.
	 *
	 * @example
	 * new Placeholder({
	 * 	html: 'myPlaceholder.fragment.html'
	 * });
	 *
	 * @param {object} mParameters Object containing the settings for the placeholder
	 * @param {string} mParameters.html Name of the HTML file that provides the placeholder content
	 *
	 * @class Represents a placeholder and its HTML content.
	 * @alias sap.ui.core.Placeholder
	 * @extends sap.ui.base.Object
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @since 1.92
	 */
	var Placeholder = BaseObject.extend("sap.ui.core.Placeholder", /* @lends sap.ui.core.Placeholder.prototype */ {
		constructor : function(mParameters) {
			BaseObject.call(this);

			if (!mParameters.html) {
				throw new Error("An HTML page defining the placeholder's content must be given!");
			}
			this.bShow = false;
			this.placeholderHTML = mParameters.html;
		},

		/**
		 * Shows the placeholder content on the container control.
		 *
		 * @param {object} oControl The container control on which the placeholder is shown
		 * @param {string} sBlockedSection The block section Id
		 * @return {Promise} Returns a promise resolving with the placeholder content
		 *
		 * @private
		 * @ui5-restricted sap.ui.core.routing
		 */
		show: function(oControl, sBlockedSection) {
			this.bShow = true;

			return this._load().then(function(sPlaceholderContent) {
				// Because it's in a 'then' method the loading promise, it could happen that the 'hide' function is
				// already called. Therefore it's need to check the 'this.bShow' flag before inserting the placeholder
				// DOM element.
				// The 'show' method can be called from a rerendering delegate of a control. It's checked here whether
				// the DOM element of the control contains the placeholder. Only when the control doesn't have the
				// placeholder, a new placeholder DOM element is generated and inserted into the control.
				if (sPlaceholderContent && this.bShow && !oControl.getDomRef().contains(this.placeholder)) {
					// unblock old blockstate when multiple renderings happen
					if (this.blockState) {
						BlockLayerUtils.unblock(this.blockState);
					}
					this.blockState = BlockLayerUtils.block(oControl, oControl.getId() + "--placeholder", sBlockedSection);

					var oDomRef = this.blockState.$blockLayer[0];
					oDomRef.className += " sapUiPlaceholder";
					oDomRef.insertAdjacentHTML("beforeend", sPlaceholderContent);
					this.placeholder = oDomRef;
				}

				return sPlaceholderContent;
			}.bind(this));
		},

		/**
		 * Hides the placeholder.
		 *
		 * @private
		 * @ui5-restricted sap.ui.core.routing
		 */
		hide: function() {
			this.bShow = false;
			if (this.placeholder && this.blockState) {
				BlockLayerUtils.unblock(this.blockState);
				this.placeholder = undefined;
				this.blockState = undefined;
			}

			if (this.pLoaded) {
				this.pLoaded.resolve();
			}
		},

		/**
		 * Loads the placeholder from given HTML file name.
		 *
		 * @returns {Promise<string>} Returns a promise resolving with the placeholder content
		 * @private
		 */
		_load: function() {
			if (!this.pLoaded) {
				this.pLoaded = new Deferred();
				if (this.placeholderHTML) {
					LoaderExtensions.loadResource(this.placeholderHTML, {
						async: true,
						dataType: "html"
					}).then(function(sPlaceholder) {
						this.placeholderContent = sPlaceholder;
						this.pLoaded.resolve(sPlaceholder);
					}.bind(this));
				} else {
					this.pLoaded.reject();
				}
			}

			return this.pLoaded.promise;
		}
	});

	/**
	 * Registers provider functions which allow to dynamically define the placeholder HTML files,
	 * based on the routing configuration.
	 *
	 * @param {function} fnProvider Provider function which provides the placeholder HTML file name
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @since 1.92
	 */
	Placeholder.registerProvider = function(fnProvider) {
		aProviders.push(fnProvider);
	};

	/**
	 * Checks if provider functions have been registered.
	 *
	 * @returns {boolean} Whether provider functions have been registered or not.
	 * @private
	 */
	Placeholder.hasProviders = function() {
		return aProviders.length > 0;
	};

	/**
	 * Retrieves the placeholder HTML file for the given provider configuration.
	 *
	 * The registered provider function must return an object providing
	 * an html property that points to the placeholder's HTML content.
	 *
	 * @param  {object} oConfig Configuration object containing the provider name
	 * @return {object|undefined} If available, the config defined by the provider function will be returned
	 *
	 * @private
	 */
	Placeholder.getPlaceholderFromProviders = function(oConfig) {
		var oProviderConfig;

		if (oConfig) {
			aProviders.some(function(fnProvider) {
				oProviderConfig = fnProvider(oConfig);
				return !!oProviderConfig;
			});
		}

		return oProviderConfig;
	};

	/**
	 * Returns whether placeholders are active or not
	 *
	 * @returns {boolean} Whether placeholders are active or not
	 * @private
	 * @ui5-restricted sap.ui.core, sap.m, sap.f
	 */
	Placeholder.isEnabled = function() {
		return BaseConfig.get({
			name: "sapUiXxPlaceholder",
			type: BaseConfig.Type.Boolean,
			external: true,
			defaultValue: true
		});
	};

	return Placeholder;
});