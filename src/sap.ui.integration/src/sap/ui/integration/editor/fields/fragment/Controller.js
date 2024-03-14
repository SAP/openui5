/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/util/Utils"
], function(
	FragmentController,
	Utils
) {
	"use strict";

	/**
	 * @class Visualization Fragment Control
	 * @extends sap.ui.core.mvc.Controller
	 * @alias sap.ui.integration.editor.fields.fragment.Controller
	 * @author SAP SE
	 * @since 1.105.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.105.0
	 * @ui5-restricted
	 */
	var Controller = FragmentController.extend("sap.ui.integration.editor.fields.fragment.Controller", {});

	Controller.prototype.init = function () {
	};

	Controller.prototype.setField = function (oField) {
		this._oField = oField;
	};

	Controller.prototype.saveValue = function (sValue) {
		var sLanguage =  Utils._language;
		var oConfig = this._oField.getConfiguration();
		if (oConfig.type === "string" && oConfig.translatable) {
			this._oField.setTranslationValueInTexts(sLanguage, sValue);
		} else {
			this._oField._settingsModel.setProperty(oConfig.manifestpath, sValue);
		}
	};

	return Controller;
});