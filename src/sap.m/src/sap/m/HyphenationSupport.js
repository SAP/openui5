/*!
 * ${copyright}
 */

// Provides Mixin sap.m.HyphenationSupport
sap.ui.define([
		"sap/ui/core/Core",
		"./library",
		"sap/ui/core/hyphenation/Hyphenation",
		"sap/base/Log"
	],
	function (
		Core,
		library,
		Hyphenation,
		Log
	) {
		"use strict";

		// shortcut for sap.m.WrappingType
		var WrappingType = library.WrappingType;

		/**
		 * Checks if the given control implements IHyphenation.
		 *
		 * @param {sap.ui.core.Control} oControl The control to validate
		 * @returns {boolean} True if the control is valid
		 * @private
		 */
		function isValidControl(oControl) {
			if (!oControl.isA("sap.m.IHyphenation")) {
				Log.error("[UI5 Hyphenation] The given control does not implement interface sap.m.IHyphenation and can not use HyphenationSupport mixin.");
				return false;
			}

			return true;
		}

		/**
		 * Checks if the required text key is present in the texts map.
		 *
		 * @param {sap.m.IHyphenation} oControl The control to be checked
		 * @param {string} sKey The key to look for
		 * @returns {boolean} True if the key is correct
		 * @private
		 */
		function isValidTextKey(oControl, sKey) {
			var mTexts = oControl.getTextsToBeHyphenated();

			if (typeof mTexts !== "object") {
				Log.error("[UI5 Hyphenation] The result of getTextsToBeHyphenated method is not a map object.", oControl.getId());
				return false;
			}

			if (Object.keys(mTexts).indexOf(sKey) < 0) {
				Log.error("[UI5 Hyphenation] The key " + sKey + " is not found in the result of getTextsToBeHyphenated method.", oControl.getId());
				return false;
			}

			return true;
		}

		/**
		 * To prevent from the layout thrashing of the <code>textContent</code> call, this method
		 * first tries to set the <code>nodeValue</code> of the first child if it exists.
		 *
		 * @param {HTMLElement} oDomRef DOM reference of the text node container.
		 * @param {String} [sNodeValue] new Node value.
		 * @private
		 */
		function setNodeValue(oDomRef, sNodeValue) {
			sNodeValue = sNodeValue || "";
			var aChildNodes = oDomRef.childNodes;
			if (aChildNodes.length === 1 && aChildNodes[0].nodeType === window.Node.TEXT_NODE) {
				aChildNodes[0].nodeValue = sNodeValue;
			} else {
				oDomRef.textContent = sNodeValue;
			}
		}

		/**
		 * Checks which keys are not present in mTextsToDiff or their values are different
		 *
		 * @param {Object<string,string>} mTextsMain The map of texts to compare
		 * @param {Object<string,string>} mTextsToDiff The map of texts to compare against
		 * @returns {Array} An array containing all keys for which there is difference
		 * @private
		 */
		function diffTexts(mTextsMain, mTextsToDiff) {
			var aDiffs = [];
			Object.keys(mTextsMain).forEach(function(sKey) {
				if (!(sKey in mTextsToDiff && mTextsMain[sKey] === mTextsToDiff[sKey])) {
					aDiffs.push(sKey);
				}
			});
			return aDiffs;
		}

		/**
		 * Checks if the third-party hyphenation is required.
		 *
		 * @returns {boolean} True if third-party hyphenation is required. False if native hyphenation is available or required
		 * @private
		 */
		function shouldUseThirdParty() {
			var sHyphenationConfig = Core.getConfiguration().getHyphenation(),
				oHyphenationInstance = Hyphenation.getInstance();

			if (sHyphenationConfig === "native" || sHyphenationConfig === "disable") {
				return false;
			}

			if (sHyphenationConfig === "thirdparty") {
				return true;
			}

			return oHyphenationInstance.isLanguageSupported()
				&& !oHyphenationInstance.canUseNativeHyphenation()
				&& oHyphenationInstance.canUseThirdPartyHyphenation();
		}

		/**
		 * Checks whether the control's text should be hyphenated.
		 *
		 * @param {sap.m.IHyphenation} oControl The control to be checked
		 * @returns {boolean} True if the control should hyphenate
		 * @private
		 */
		function shouldControlHyphenate(oControl) {
			var sHyphenationConfig = Core.getConfiguration().getHyphenation();
			if (sHyphenationConfig === 'disable') {
				return false;
			}

			if (oControl.getWrappingType() === WrappingType.Hyphenated && !oControl.getWrapping()) {
				Log.warning("[UI5 Hyphenation] The property wrappingType=Hyphenated will not take effect unless wrapping=true.", oControl.getId());
			}

			return oControl.getWrapping() && oControl.getWrappingType() === WrappingType.Hyphenated;
		}

		/**
		 * Hyphenates all texts needed for the given control.
		 *
		 * @param {sap.m.IHyphenation} oControl The control whose texts need hyphenation
		 * @private
		 */
		function hyphenateTexts(oControl) {
			if (!shouldControlHyphenate(oControl) || !shouldUseThirdParty()) {
				// no hyphenation needed
				oControl._mHyphenatedTexts = {};
				oControl._mUnhyphenatedTexts = {};
				return;
			}

			var mTexts = oControl.getTextsToBeHyphenated(),
				aChangedTextKeys = diffTexts(mTexts, oControl._mUnhyphenatedTexts);

			if (aChangedTextKeys.length > 0) {
				oControl._mUnhyphenatedTexts = mTexts;
				aChangedTextKeys.forEach(function(sKey) {
					delete oControl._mHyphenatedTexts[sKey];
				});

				var oHyphenation = Hyphenation.getInstance();
				if (!oHyphenation.isLanguageInitialized()) {
					oHyphenation.initialize().then(function () {

						var mDomRefs = oControl.isActive() ? oControl.getDomRefsForHyphenatedTexts() : null,
							bNeedInvalidate = false;

						aChangedTextKeys.forEach(function(sKey) {
							oControl._mHyphenatedTexts[sKey] = oHyphenation.hyphenate(mTexts[sKey]);

							if (mDomRefs && sKey in mDomRefs) {
								setNodeValue(mDomRefs[sKey], oControl._mHyphenatedTexts[sKey]);
							} else {
								bNeedInvalidate = true;
							}
						});

						if (bNeedInvalidate) {
							oControl.invalidate();
						}
					});
				} else {
					aChangedTextKeys.forEach(function(sKey) {
						oControl._mHyphenatedTexts[sKey] = oHyphenation.hyphenate(mTexts[sKey]);
					});
				}
			}
		}

		/**
		 * @class Mixin which enables the use of hyphenation for controls.
		 *
		 * The control has to implement sap.m.IHyphenation interface.
		 * The mixin attaches to onBeforeRendering and prepares all texts which are needed for the control, provided by method sap.m.IHyphenation#getTextsToBeHyphenated.
		 * In the control renderer, the methods sap.m.HyphenationSupport#writeHyphenationClass and sap.m.HyphenationSupport#getTextForRender have to be used.
		 * If native hyphenation is available, the class for hyphenation will be added. If not - third-party hyphenation will be used.
		 *
		 * @name sap.m.HyphenationSupport
		 * @see sap.m.IHyphenation
		 * @private
		 */
		var HyphenationSupport = {};

		/**
		 * Extends the control with ability to use hyphenation.
		 *
		 * @param {sap.m.IHyphenation} oControlPrototype The control prototype to extend
		 * @private
		 */
		HyphenationSupport.mixInto = function (oControlPrototype) {
			if (!isValidControl(oControlPrototype)) {
				return;
			}

			var fnInit = oControlPrototype.init;
			oControlPrototype.init = function (sId) {
				var res = fnInit.apply(this, arguments);
				this._mHyphenatedTexts = {};
				this._mUnhyphenatedTexts = {};
				return res;
			};

			var fnOnBeforeRendering = oControlPrototype.onBeforeRendering;
			oControlPrototype.onBeforeRendering = function () {
				var res = fnOnBeforeRendering.apply(this, arguments);
				hyphenateTexts(this);
				return res;
			};
		};

		/**
		 * Adds sapUiHyphenation class to control if native hyphenation will be used.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The render manager
		 * @param {sap.m.IHyphenation} oControl A hyphenation enabled control
		 * @private
		 */
		HyphenationSupport.writeHyphenationClass = function (oRm, oControl) {
			if (!isValidControl(oControl)) {
				return;
			}

			if (shouldControlHyphenate(oControl) && !shouldUseThirdParty()) {
				oRm.class("sapUiHyphenation");
			}
		};

		/**
		 * Gets the text which should be rendered. This is either the hyphenated text if hyphenation is required and available, or the original text.
		 *
		 * @param {sap.m.IHyphenation} oControl The control for which the text is needed
		 * @param {string} sKey Which text to get. Out of multiple texts for the control sap.m.IHyphenation#getTextsToBeHyphenated
		 * @see sap.m.IHyphenation#getTextsToBeHyphenated
		 * @returns {string} The hyphenated or the original text
		 * @private
		 */
		HyphenationSupport.getTextForRender = function (oControl, sKey) {
			if (!isValidControl(oControl)) {
				return null;
			}

			if (!isValidTextKey(oControl, sKey)) {
				return null;
			}

			var mTexts = oControl.getTextsToBeHyphenated();

			if (shouldControlHyphenate(oControl) && shouldUseThirdParty()) {
				// if hyphenated texts are not prepared already prepare them now, needed in case of custom setText
				if (mTexts[sKey] !== oControl._mUnhyphenatedTexts[sKey]) {
					hyphenateTexts(oControl);
				}

				if (sKey in oControl._mHyphenatedTexts) {
					return oControl._mHyphenatedTexts[sKey];
				}
			}

			// hyphenation is not needed or not available yet - return the unmodified text
			return mTexts[sKey];
		};

		return HyphenationSupport;
	});