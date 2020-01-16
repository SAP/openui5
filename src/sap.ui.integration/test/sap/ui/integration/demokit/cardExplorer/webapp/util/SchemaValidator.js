sap.ui.loader.config({
	shim: {
		"sap/ui/integration/designtime/thirdparty/ajv": {
			amd: true,
			exports: "Ajv"
		}
	}
});

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/base/Log"
], function (
	jQuery,
	Log
) {
	"use strict";

	/**
	 * Helper class that handles validations with "sap-card" schema.
	 * @namespace
	 */
	var SchemaValidator = {};

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
		if (sUri.endsWith("adaptive-card.json")) {
			sUri = sap.ui.require.toUrl("sap/ui/integration/schemas/adaptive-card.json");
		}

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
	 * @returns {Promise} Promise, which will be resolved with the Ajv class
	 * @private
	 */
	SchemaValidator._requireAjv = function () {
		return new Promise(function (resolve) {
			sap.ui.require([
				"sap/ui/integration/designtime/thirdparty/ajv"
			], function (Ajv) {
				resolve(Ajv);
			});
		});
	};

	/**
	 * Creates Ajv instance and adds meta-schemas to it
	 * @param {Ajv} Ajv Class
	 * @param {object} oDraft06Schema Draft 06 meta schema
	 * @returns {Promise} Resolved with new instance
	 * @private
	 */
	SchemaValidator._initAjv = function (Ajv, oDraft06Schema) {
		return new Promise(function (resolve) {
			var oAjv = new Ajv({
				loadSchema: SchemaValidator._loadSchema,
				schemaId: "auto",
				meta: true // by default add draft 07 meta schema, needed for sap-card
			});

			oAjv.addMetaSchema(oDraft06Schema); // needed for AdaptiveCards
			resolve(oAjv);
		});
	};

	/**
	 * Loads meta schemas, loads "sap-card" schema, creates Ajv instance and compiles "sap-card" schema to "validate" function
	 * @return {Promise} Resolved with the "validate" function
	 * @private
	 */
	SchemaValidator._initValidate = function () {
		if (SchemaValidator._fnValidate) {
			return Promise.resolve(SchemaValidator._fnValidate);
		}

		return Promise.all([
				SchemaValidator._requireAjv(),
				SchemaValidator._loadSchema("https://json-schema.org/draft-06/schema#") // needed for AdaptiveCards
			])
			.then(function (aArgs) {
				var Ajv = aArgs[0],
					oDraft06Schema = aArgs[1];

				return Promise.all([
					SchemaValidator._initAjv(Ajv, oDraft06Schema),
					SchemaValidator._loadSchema(sap.ui.require.toUrl("sap/ui/integration/schemas/sap-card.json"))
				]);
			})
			.then(function (aArgs) {
				var oAjv = aArgs[0],
					oSapCardSchema = aArgs[1];

				return oAjv.compileAsync(oSapCardSchema);
			})
			.then(function (fnValidate) {
				SchemaValidator._fnValidate = fnValidate;
				return SchemaValidator._fnValidate;
			});
	};

	/**
	 * Validates manifest against "sap-card" schema asynchronously.
	 * @param {object} oManifest The manifest, which will be validated.
	 * @returns {Promise} If manifest is valid, resolves without any value, else throws exception with the array of errors.
	 *                    Also throws, if there is a problem with validator initialization.
	 * @public
	 */
	SchemaValidator.validate = function (oManifest) {
		return SchemaValidator._initValidate()
			.catch(function () {
				Log.error("Could not initialize Validator. Schema validation skipped!!!");
				throw "Could not initialize Validator. Schema validation skipped!!!";
			})
			.then(function (fnValidate) {
				var bValid = fnValidate(oManifest);

				if (!bValid) {
					throw fnValidate.errors;
				} else {
					return "Validation Successful";
				}
			});
	};

	return SchemaValidator;
});