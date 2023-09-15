sap.ui.loader.config({
	shim: {
		"sap/ui/demo/cardExplorer/thirdparty/CfWorkerJsonSchemaValidator": {
			amd: true,
			exports: "JsonSchemaValidator"
		}
	}
});

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/base/util/deepExtend"
], function (
	jQuery,
	Log,
	deepExtend
) {
	"use strict";

	/**
	 * Helper class that handles validations with "sap-card" schema.
	 * @namespace
	 */
	var SchemaValidator = {};

	/**
	 * Version of the JSON Schema draft that the manifest is written in.
	 * @constant
	 * @private
	 */
	var SCHEMA_DRAFT_VERSION = "7";
	/**
	 * Reference to "validate" function.
	 * @function
	 * @private
	 */
	SchemaValidator._fnValidate = null;

	/**
	 * Creates ajax request to load json schema
	 * @param {string} sUri Location of the resource
	 * @returns {Promise} Promise, which will be resolved with the json file content
	 * @private
	 */
	SchemaValidator._loadSchema = function (sUri) {

		// Wrapped in promise as jQuery is not resolving properly and thus creating two requests
		return new Promise(function (resolve, reject) {
				jQuery.ajax(sUri, { dataType: "json" })
				.then(function (oSchema) {
					resolve(oSchema);
				})
				.fail(function () {
					Log.error("Unable to load schema " + sUri);
					reject("Unable to load schema " + sUri);
				});
			});
	};

	/**
	 * Wrapper of sap.ui.require
	 * @returns {Promise} Promise, which will be resolved with the JsonSchemaValidator class
	 * @private
	 */
	SchemaValidator._requireJsonSchemaValidator = function () {
		return new Promise(function (resolve) {
			sap.ui.require([
				"sap/ui/demo/cardExplorer/thirdparty/CfWorkerJsonSchemaValidator"
			], function (JsonSchemaValidator) {
				resolve(JsonSchemaValidator);
			});
		});
	};

	/**
	 * Loads meta schemas, loads "sap-card" schema, creates JsonSchemaValidator instance and compiles "sap-card" schema to "validate" function
	 * @return {Promise} Resolved with the "validate" function
	 * @private
	 */
	SchemaValidator._initValidate = function () {
		if (SchemaValidator._fnValidate) {
			return Promise.resolve(SchemaValidator._fnValidate);
		}

		return Promise.all([
				SchemaValidator._requireJsonSchemaValidator(),
				SchemaValidator._loadSchema(sap.ui.require.toUrl("sap/ui/integration/schemas/sap-card.json")),
				SchemaValidator._loadSchema(sap.ui.require.toUrl("sap/ui/integration/schemas/adaptive-card.json"))
			])
			.then(function (aArgs) {
				var JsonSchemaValidator = aArgs[0],
					oCardSchema = aArgs[1],
					oAdaptiveCardsSchema = aArgs[2],
					oValidator = new JsonSchemaValidator(oCardSchema, SCHEMA_DRAFT_VERSION);

				oValidator.addSchema(oAdaptiveCardsSchema);

				// also add adaptive cards schema with https
				var oAdaptiveCardsHttpsSchema = deepExtend({}, oAdaptiveCardsSchema);
				oAdaptiveCardsHttpsSchema["id"] = "https://adaptivecards.io/schemas/adaptive-card.json";
				oValidator.addSchema(oAdaptiveCardsHttpsSchema);

				SchemaValidator._fnValidate = oValidator.validate.bind(oValidator);

				return SchemaValidator._fnValidate;
			});
	};

	/**
	 * Validates manifest against "sap-card" schema asynchronously.
	 * @param {object} oManifest The manifest, which will be validated.
	 * @returns {Promise} If manifest is valid, resolves without any value, else throws exception with the array of errors.
	 *                    Also throws, if there is a problem with initialization of the validator.
	 * @public
	 */
	SchemaValidator.validate = async (oManifest) => {
		let fnValidate, oResult;

		try {
			fnValidate = await SchemaValidator._initValidate();
		} catch (oError) {
			Log.error("Could not initialize Validator. Schema validation skipped! " + oError);
			throw "Could not initialize Validator. Schema validation skipped!";
		}

		try {
			oResult = fnValidate(oManifest);
		} catch (oError) {
			Log.error("Could not execute validation! " + oError);
			throw "Could not execute validation!";
		}

		if (!oResult.valid) {
			throw oResult.errors;
		}

		return "Validation successful";
	};

	return SchemaValidator;
});