/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/descriptorRelated/internal/Utils",
	"sap/base/Log"
], function (
	jQuery,
	ManagedObject,
	Utils,
	Log
) {
	"use strict";

	/**
	 * App variant inline change.
	 *
	 * @param {object} mPropertyBag Parameters of the inline change for the provided change type
	 * @param {string} mPropertyBag.content Content of the inline change
	 * @param {string} mPropertyBag.changeType Change type
	 * @param {object} [mPropertyBag.texts] Texts of the inline change
	 *
	 * @constructor
	 * @alias sap.ui.fl.write._internal.appVariant.AppVariantInlineChange
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	var AppVariantInlineChange = ManagedObject.extend("sap.ui.fl.write._internal.appVariant.AppVariantInlineChange", /** @lends sap.ui.fl.write._internal.appVariant.AppVariantInlineChange */ {
		constructor : function(mPropertyBag) {
			ManagedObject.apply(this);
			if (!jQuery.isPlainObject(mPropertyBag)) {
				Log.error("Constructor : sap.ui.fl.write._internal.appVariant.AppVariantInlineChange: mPropertyBag is not defined");
			}
			Utils.checkTexts(mPropertyBag.texts);
			this._oDefinition = mPropertyBag;
			return this;
		}
	});

	AppVariantInlineChange.prototype._getChangeType = function() {
		return this._oDefinition.changeType;
	};

	AppVariantInlineChange.prototype.getMap = function() {
		return this._oDefinition;
	};

	AppVariantInlineChange.prototype.getContent = function() {
		return this._oDefinition.content;
	};

	AppVariantInlineChange.prototype.getTexts = function() {
		return this._oDefinition.texts;
	};

	AppVariantInlineChange.prototype.getHostingIdSuffix = function() {
		return this._sHostingIdSuffix;
	};

	AppVariantInlineChange.prototype.setHostingIdSuffix = function(sHostingIdSuffix) {
		this._sHostingIdSuffix = sHostingIdSuffix;
	};

	AppVariantInlineChange.prototype.replaceHostingIdForTextKey = function(sNewHostingId, sOldHostingId, oContent, mTexts) {
		var sContent = JSON.stringify(oContent);
		if (mTexts) {
			Object.keys(mTexts).forEach(function(sTextKey) {
				var sTextKeyNew;

				if (sTextKey.indexOf(sOldHostingId) === 0) {
					sTextKeyNew = sNewHostingId + sTextKey.substring(sOldHostingId.length);
					this._oDefinition.texts[sTextKeyNew] = this._oDefinition.texts[sTextKey];
					delete this._oDefinition.texts[sTextKey];

					sContent = sContent.split("{{" + sTextKey + "}}").join("{{" + sTextKeyNew + "}}");
				}
			}, this);

			this._oDefinition.content = JSON.parse(sContent);
		}
	};

	AppVariantInlineChange.prototype.setHostingIdForTextKey = function(sHostingId) {
		if (this.getHostingIdSuffix()) {
			var sTextKey = sHostingId + this.getHostingIdSuffix();
			if (this._oDefinition.texts) {
				this._oDefinition.texts[sTextKey] = this._oDefinition.texts[""];
				delete this._oDefinition.texts[""];
			}
		}
	};

	return AppVariantInlineChange;
}, true);