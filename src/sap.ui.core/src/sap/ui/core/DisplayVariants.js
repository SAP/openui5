/*!
 * ${copyright}
 */
/*global Promise */

/**
 * @namespace TINAF support for display variants in (smart) controls which allows to save and
 * restore a partial state of a control. As an example, a table control could allow the user to
 * keep a list of variants (e.g. subset of columns to be displayed) and to choose among them.
 * <p>
 * As a <b>general precondition</b>, all controls used here MUST know the component they belong to
 * (see {@link sap.ui.base.ManagedObject.getOwnerIdFor}). This is guaranteed if they are created
 * inside a call to {@link sap.ui.core.UIComponent#createContent}.
 *
 * @name sap.ui.core.DisplayVariants
 * @author SAP SE
 * @version ${version}
 * @private
 * @since 1.25.0
 */
sap.ui.define(function () {
	"use strict";

	return {
		/**
		 * Applies the variant with the given ID to the given control. This means that the
		 * partial state included by {@link sap.ui.core.DisplayVariants.save} is asynchronously
		 * restored to the control while all other settings are left untouched.
		 *
		 * @param {sap.ui.core.Control} oControl
		 *     a control
		 * @param {string} sId
		 *     ID of the variant to be applied
		 * @returns {Promise}
		 *     promise which is fulfilled without further details once the variant has
		 *     successfully been applied, or rejected with an error in case applying fails
		 *     asynchronously, e.g. in case no such variant is found for the control
		 *
		 * @function
		 * @name sap.ui.core.DisplayVariants.apply
		 * @private
		 * @since 1.25.0
		 *
		 * @see sap.ui.core.DisplayVariants.read
		 */
		apply: function (oControl, sId) {
			return this._init(oControl).then(function (sComponentClassName) {
				var oVariant = oControl._mDisplayVariants[sId];

				if (Object.prototype.hasOwnProperty.call(oControl._mDisplayVariants, sId)) {
					sap.ui.core.DisplayVariants._applyChanges(oControl, oVariant.changes,
						sComponentClassName, oVariant.__texts__);
				} else {
					throw new Error("Variant '" + sId + "' not found for " + oControl);
				}
			});
		},

		/**
		 * Asynchronously returns a (possibly empty) list of all variants for the given control
		 * as an <code>object[]</code>, with each variant object containing at least a
		 * technical <code>id</code> and a human readable, translated <code>description</code>
		 * as <code>string</code> properties.
		 *
		 * @param {sap.ui.core.Control} oControl
		 *     a control
		 * @returns {Promise}
		 *     promise which is fulfilled with the result once variants have successfully been
		 *     read, or rejected with an error in case loading fails asynchronously
		 *
		 * @function
		 * @name sap.ui.core.DisplayVariants.read
		 * @private
		 * @since 1.25.0
		 *
		 * @see sap.ui.core.DisplayVariants.apply
		 * @see sap.ui.core.DisplayVariants.remove
		 * @see sap.ui.core.DisplayVariants.save
		 * @see sap.ui.core.DisplayVariants.setDescription
		 */
		read: function (oControl) {
			return this._init(oControl).then(function (sComponentClassName) {
				var aVariants = [];
				jQuery.each(oControl._mDisplayVariants, function (sKey, oChange) {
					aVariants.push({
						id: oChange.variantId,
						description: sap.ui.core.DisplayVariants._getTranslatedText(oChange.__texts__,
							oChange.variantDescription)
					});
				});
				return aVariants;
			});
		},

		/**
		 * Removes the variant with the given ID from the given control. It does not matter whether
		 * that variant is currently applied.
		 *
		 * @param {sap.ui.core.Control} oControl
		 *     a control
		 * @param {string} sId
		 *     ID of the variant to be removed
		 * @throws {Error}
		 *     in case no such variant is found for the control
		 * @returns {Promise}
		 *     promise which is fulfilled without further details once the variant has
		 *     successfully been removed, or rejected with an error in case removal fails
		 *     asynchronously
		 *
		 * @function
		 * @name sap.ui.core.DisplayVariants.remove
		 * @private
		 * @since 1.25.0
		 *
		 * @see sap.ui.core.DisplayVariants.save
		 */
		remove: function (oControl, sId) {},

		/**
		 * Saves a new or modified variant for the given control. New variants are
		 * automatically given a unique ID. <code>aNames</code> specifies which settings of the
		 * control are included in the saved variant, all others are ignored; sub-objects
		 * contained in included aggregations are fully included. A later call to
		 * {@link sap.ui.core.DisplayVariants.apply} will restore the saved state of these named
		 * settings only!
		 * <p>
		 * BEWARE: Associations and binding (e.g. event binding, aggregation binding, and
		 * property data binding) are not yet supported! IDs are not saved and thus will not be
		 * restored (instead, automatic IDs will be used).
		 *
		 * @param {sap.ui.core.Control} oControl
		 *     a control
		 * @param {string} sId
		 *     the unique technical ID of the variant; leave this empty for new variants and
		 *     pass the value from {@link sap.ui.core.DisplayVariants.read} for modifications
		 * @param {string} sDescription
		 *     a human readable, translatable description for this variant (in the current
		 *     session language: {@link sap.ui.core.Configuration#getLanguage}); must not be empty
		 * @param {string[]} aNames
		 *     a list of settings (e.g. property or aggregation names) to be included in the
		 *     saved variant
		 * @returns {Promise}
		 *     promise which is fulfilled with the unique technical ID of the variant (useful
		 *     for new variants) once the variant has successfully been saved, or rejected with
		 *     an error in case saving fails asynchronously; the variant MUST NOT be used
		 *     anymore until the promise is fulfilled!
		 * @throws {Error}
		 *     in case an ID is provided but no such variant is found for the control
		 * @throws {Error}
		 *     in case no description is provided
		 * @throws {Error}
		 *     in case no names are provided
		 * @throws {Error}
		 *     in case the named settings cannot be properly serialized
		 *
		 * @function
		 * @name sap.ui.core.DisplayVariants.save
		 * @private
		 * @since 1.25.0
		 *
		 * @see sap.ui.core.DisplayVariants.read
		 * @see sap.ui.core.DisplayVariants.remove
		 * @see sap.ui.core.DisplayVariants.setDescription
		 */
		save: function (oControl, sId, sDescription, aNames) {
			var oChange;

			if (!sDescription) {
				throw new Error("Missing variant description for " + oControl);
			}
			if (!aNames || !aNames.length) {
				throw new Error("Missing names for " + oControl);
			}

			// Note: server CANNOT compute variant ID because it is part of black-box payload!
			sId = jQuery.sap.uid();
			oChange = {
				selector: "#" + oControl.getId(),
				operation: "defineVariant",
				variantId: sId,
				variantDescription: sDescription,
				changes: [{
					selector: "#" + oControl.getId(),
					operation: "applySettings",
					destroyAll: true,
					// Note: this should fail SYNCHRONOUSLY!
					settings: this._toSettings(oControl, aNames)
				}]
			};

			return new Promise(function(fnResolve, fnReject) {
				sap.ui.core.DisplayVariants._init(oControl).then(function (sComponentClassName) {
					//TODO update change document!
					jQuery.ajax({
						async: true,
						data: JSON.stringify(
								sap.ui.core.DisplayVariants._createChangeDocument(
									sComponentClassName, "USER", [oChange])),
						dataType: "json",
						error: function (oXHR, sTextStatus, sErrorThrown) {
							fnReject(new Error("Could not save variant due to '" + sTextStatus
									+ "' with error '" + sErrorThrown + "'"));
							jQuery.sap.log.error(
								"Could not save variant with id '" + sId
								+ "' and description '" + sDescription
								+ "' due to '" + sTextStatus + "'",
								sErrorThrown, "sap.ui.core.DisplayVariants"
							);
						},
						success: function (sData) {
							//TODO backlink to change doc needed for update/PUT
							oControl._mDisplayVariants[sId] = oChange;
							//use texts from response as they are not a black-box for the server
							oChange.__texts__ = JSON.parse(sData).texts;
							fnResolve(sId);
						},
						type: "POST",
						url: "/sap/bc/lrep/changes"
					});
				}, fnReject);
			});
		},

		/**
		 * Sets a new description for an existing variant of the given control and saves it. It
		 * does not matter whether that variant is currently applied.
		 *
		 * @param {sap.ui.core.Control} oControl
		 *     a control
		 * @param {string} sId
		 *     ID of the variant to be saved with a new description
		 * @param {string} sDescription
		 *     a human readable, translatable description for this variant (in the current
		 *     session language: {@link sap.ui.core.Configuration#getLanguage}); must not be empty
		 * @returns {Promise}
		 *     promise which is fulfilled without further details once the variant has successfully
		 *     been saved, or rejected with an error in case saving fails asynchronously
		 * @throws {Error}
		 *     in case no such variant is found for the control
		 * @throws {Error}
		 *     in case no description is provided
		 *
		 * @function
		 * @name sap.ui.core.DisplayVariants.setDescription
		 * @private
		 * @since 1.25.0
		 *
		 * @see sap.ui.core.DisplayVariants.save
		 */
		setDescription: function (oControl, sId, sDescription) {},

		/**
		 * Applies the given changes related to the given control.
		 *
		 * @param {sap.ui.core.Control} oControl
		 *     a control
		 * @param {object[]} aChanges
		 *     the array of changes
		 * @param {string} sComponent
		 *     the component class name
		 * @param {object} mTexts
		 *     the map with the translatable texts
		 * @private
		 */
		_applyChanges: function (oControl, aChanges, sComponent, mTexts) {
			var sExpectedSelector = "#" + oControl.getId();

			jQuery.each(aChanges, function (j, oChange) {
				if (oChange.selector === sExpectedSelector) {
					if (oChange.operation === "defineVariant") {
						oControl._mDisplayVariants[oChange.variantId] = oChange;
						oChange.__texts__ = mTexts;
					} else if (oChange.operation === "applySettings") {
						if (oChange.destroyAll) {
							jQuery.each(oChange.settings, function (sName) {
								sap.ui.core.DisplayVariants._destroyAll(oControl, sName);
							});
						}
						oControl.applySettings(oChange.settings);
					} else {
						jQuery.sap.log.error("Unsupported change operation '" + oChange.operation
							+ "' for component '" + sComponent + "'",
							JSON.stringify(oChange),
							"sap.ui.core.DisplayVariants");
					}
				}
			});
		},

		/**
		 * Applies the change documents related to the given control if not done already.
		 *
		 * @param {sap.ui.core.Control} oControl
		 *     a control
		 * @param {object[]} aChangeDocuments
		 *     the array of change documents
		 * @private
		 */
		_applyChangeDocuments: function (oControl, aChangeDocuments) {
			if (oControl._mDisplayVariants) {
				return;
			}

			oControl._mDisplayVariants = {};
			jQuery.each(aChangeDocuments, function (i, oChangeDocument) {
				sap.ui.core.DisplayVariants._applyChanges(oControl, oChangeDocument.content,
					oChangeDocument.component, oChangeDocument.texts);
			});
		},

		/**
		 * Creates a change document object for the given component class name, layer and array of
		 * changes with defineVariant operations.
		 * Language dependent texts are extracted from the changes and put to the texts property
		 * of the change document. The document uses the current user language.
		 *
		 * @param {string} sComponentClassName
		 *     the component class name
		 * @param {string} sLayer
		 *     the layer
		 * @param {object[]} aChanges
		 *     the array of changes
		 * @returns {object}
		 *     The change document
		 * @private
		 */
		_createChangeDocument: function (sComponentClassName, sLayer, aChanges) {
			var mTexts = {};
			jQuery.each(aChanges, function(i, oChange) {
				mTexts[oChange.variantId] = {
						value: oChange.variantDescription,
						type: "XTIT"
				};
				oChange.variantDescription = "{{{" + oChange.variantId + "}}}";
			});
			return {
				component: sComponentClassName,
				content: aChanges,
				layer: sLayer,
				originalLanguage: sap.ui.getCore().getConfiguration().getLocale().getLanguage(),
				texts: mTexts
			};
		},

		/**
		 * Destroys all elements within the 0..n aggregation with given name on the given control.
		 * Names which do not refer to aggregations are silently ignored.
		 *
		 * @param {sap.ui.core.Control} oControl
		 *     a control
		 * @param {string} sName
		 *     the aggregation name
		 */
		_destroyAll: function (oControl, sName) {
			var mAllAggregations = oControl.getMetadata().getAllAggregations(),
				oAggregationInfo = mAllAggregations[sName];

			if (Object.prototype.hasOwnProperty.call(mAllAggregations, sName)) {
				oControl[oAggregationInfo._sDestructor](); // call specific destroy<Name>()
			}
		},

		/**
		 * Returns the class name of the component the given control belongs to.
		 *
		 * @param {sap.ui.core.Control} oControl
		 *     a control
		 * @returns {string}
		 *     a component class name, ending with ".Component"
		 * @throws {Error}
		 *     if component cannot be determined
		 *
		 * @see sap.ui.base.ManagedObject.getOwnerIdFor
		 */
		_getComponentClassName: function (oControl) {
			var sComponentId = sap.ui.base.ManagedObject.getOwnerIdFor(oControl);

			if (!sComponentId) {
				throw new Error("Cannot determine component for " + oControl);
			}

			return sap.ui.component(sComponentId).getMetadata().getName();
		},

		/**
		 * Returns the translated text for the given key. The given key, which is marked with leading
		 * "{{{" and followed by closing "}}}" is first extracted.
		 *
		 * @param {object} mTexts
		 *     a map with the translated texts
		 * @param {string} sKey
		 *     the key of the text to translate
		 * @returns {string}
		 *     the translated text; if there is no text found, the key itself is returned.
		 */
		_getTranslatedText: function (mTexts, sKey) {
			var sText, aResults;

			if (!sKey || !mTexts) {
				return sKey;
			}
			aResults = /^\{\{\{([-\w]+)\}\}\}$/.exec(sKey);
			if (!aResults) {
				return sKey;
			}
			sText = mTexts[aResults[1]];
			return (sText && sText.value) ? sText.value : sKey;
		},

		/**
		 * Initialize variant support for the given control.
		 *
		 * @param {sap.ui.core.Control} oControl
		 *     a control
		 * @returns {Promise}
		 *     promise which is fulfilled with the component class name once variants have
		 *     successfully been initialized, or rejected with an error in case initialization
		 *     fails asynchronously
		 * @private
		 */
		_init: function (oControl) {
			var sComponentClassName = this._getComponentClassName(oControl);

			if (oControl._mDisplayVariants) {
				// shortcut in case _applyChangeDocuments() would do nothing
				return Promise.resolve(sComponentClassName);
			}

			return jQuery.sap.loadResource(
				jQuery.sap.getResourceName(sComponentClassName, "-changes.json"), {
					async: true,
					failOnError: true,
					headers: {
						"X-UI5-Component": sComponentClassName.slice(
							0, sComponentClassName.length - ".Component".length
						)
					}
				}
			).then(function (aChangeDocuments) {
				sap.ui.core.DisplayVariants._applyChangeDocuments(oControl, aChangeDocuments.changes);
				return sComponentClassName;
			});
		},

		/**
		 * Turns the settings (such as properties or aggregations) with the given names of the
		 * given control into an "object literal" which can be given to
		 * {@link sap.ui.base.ManagedObject#applySettings}.
		 * <p>
		 * BEWARE: Associations and binding (e.g. event binding, aggregation binding, and
		 * property data binding) are not yet supported!
		 *
		 * @param {sap.ui.base.ManagedObject} oControl
		 *     any managed object, typically a control
		 * @param {string[]} [aNames]
		 *     A list of settings (e.g. property or aggregation names) to be included, all others
		 *     are ignored; sub-objects contained in included aggregations are fully included!
		 *     Default is to include everything, even the control's type.
		 * @returns {object}
		 *     "object literal" which can be given to
		 *     {@link sap.ui.base.ManagedObject#applySettings}
		 * @throws {Error}
		 *     in case the included settings cannot be properly serialized
		 *
		 * @private
		 *
		 * @see sap.ui.core.DisplayVariants.save
		 */
		_toSettings: function (oControl, aNames) {
			var oMetadata = oControl.getMetadata(),
				mName2Info = oMetadata.getJSONKeys(),
				mSettings = {};

			/*
			 * Turns a single object or an array of objects into an "object literal" value.
			 * <code>ManagedObject</code> is transformed to a settings object, everything else is
			 * left "as is".
			 *
			 * @param {string} sName
			 *     the setting's name (used for error handling only)
			 * @param {any} v
			 *     any value
			 * @returns {any}
			 *     a legal value inside a settings object
			 * @throws {Error}
			 *     in case the given value cannot be properly transformed into a settings object
			 */
			function toJSON(sName, v) {
				var aResults;

				if (jQuery.isArray(v)) {
					aResults = [];
					jQuery.each(v, function (i, o) {
						aResults.push(toJSON(sName, o));
					});
					return aResults;
				}
				if (v instanceof sap.ui.base.ManagedObject) {
					return sap.ui.core.DisplayVariants._toSettings(v); // include everything!
				}
				if (v === null) {
					return null;
				}
				switch (typeof v) {
				case "boolean":
				case "number":
				case "string":
					return v;

				// case "object": // must be instanceof sap.ui.base.ManagedObject
				default:
					throw new Error("Cannot turn '" + v + "' into setting '" + sName
						+ "' for " + oControl);
				}
			}

			/*
			 * Tells whether the given value is an array which is empty.
			 *
			 * @param {any} v
			 *     any value
			 * @returns {boolean}
			 */
			function isEmptyArray(v) {
				return jQuery.isArray(v) && v.length === 0;
			}

			/*
			 * Adds the setting with the given name unless the current value is trivial.
			 *
			 * @param {string} sName
			 *     the setting's name
			 * @param {object} oInfo
			 *     the setting's meta info
			 * @param {object} oDefaultValue
			 *     the setting's default value
			 * @param {boolean} [bMandatory = false]
			 *     whether the setting is needed, even if the value is the default one
			 * @param {boolean} [bUnsupported = false]
			 *     whether the setting is unsupported (only if the value is not the default one)
			 */
			function addSetting(sName, oInfo, oDefaultValue, bMandatory, bUnsupported) {
				var oCurrentValue;

				if (oControl.getBindingInfo(sName)) {
					throw new Error("Unsupported bound setting '" + sName + "' for "
						+ oControl);
				}

				oCurrentValue = oControl[oInfo._sGetter]();
				if (!bMandatory
					&& (oCurrentValue === oDefaultValue
						|| (isEmptyArray(oCurrentValue) && isEmptyArray(oDefaultValue)))) {
					return; // ignore this value
				}
				if (bUnsupported) {
					throw new Error("Unsupported setting '" + sName + "' for " + oControl);
				}

				mSettings[sName] = toJSON(sName, oCurrentValue);
			}

			/*
			 * Adds the setting with the given name and meta info if supported and needed.
			 *
			 * @param {string} sName
			 *     the setting's name
			 * @param {object} oInfo
			 *     the setting's meta info
			 * @param {boolean} bMandatory
			 *     whether the setting is needed, even if the value is the default one
			 */
			function visitInfo(sName, oInfo, bMandatory) {
				if (!Object.prototype.hasOwnProperty.call(mName2Info, sName)) {
					throw new Error("Setting '" + sName + "' not found for " + oControl);
				}
				if (oInfo._sName === sName) { // ignore "aggregation:*" & Co.
					switch (oInfo._iKind) {
					case 0: // PROPERTY
						addSetting(sName, oInfo, oInfo.defaultValue, bMandatory, false);
						break;

					case 1: // SINGLE_AGGREGATION
						addSetting(sName, oInfo, null, bMandatory, false);
						break;

					case 2: // MULTIPLE_AGGREGATION
						addSetting(sName, oInfo, [], bMandatory, false);
						break;

					case 3: // SINGLE_ASSOCIATION
						addSetting(sName, oInfo, null, false, true);
						break;

					case 4: // MULTIPLE_ASSOCIATION
						addSetting(sName, oInfo, [], false, true);
						break;

					case 5: // EVENT
						if (Object.prototype.hasOwnProperty.call(oControl.mEventRegistry, sName)) {
							throw new Error("Unsupported setting '" + sName + "' for " + oControl);
						}
						break;

					default:
						break;
					}
				}
			}

			if (!jQuery.isEmptyObject(oControl.mBoundObjects)) {
				throw new Error("Unsupported element binding for " + oControl);
			}

			if (aNames) { // iterate given names
				jQuery.each(aNames, function (i, sName) {
					// Note: do not ignore named settings, no matter what value
					visitInfo(sName, mName2Info[sName], true);
				});
			} else { // iterate all valid names, include type
				jQuery.each(mName2Info, visitInfo);
				// Note: "Type" is not an allowed name for ordinary settings
				mSettings.Type = oMetadata.getName();
			}

			return mSettings;
		}
	};
}, /* bExport= */ true);
