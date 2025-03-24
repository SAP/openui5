/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/BindingInfo",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/ElementRegistry",
	"sap/ui/core/LabelEnablement"
], function (Log, BindingInfo, ManagedObject, Element, ElementRegistry, LabelEnablement) {
	"use strict";

	const sClassName = "sap/ui/core/fieldhelp/FieldHelp";
	const sDocumentationRef = "com.sap.vocabularies.Common.v1.DocumentationRef";
	/**
	 * The singleton instance.
	 * @type {module:sap/ui/core/fieldhelp/FieldHelp}
	 */
	let oFieldHelp;
	const sURNPrefix = "urn:sap-com:documentation:key?=";

	/**
	 * Replacement for <code>ManagedObject.prototype.updateFieldHelp</code> to update the field help information
	 * for the given control property name of <code>this</code> control instance, if the corresponding binding has been
	 * created or destroyed, or its context has been changed.
	 *
	 * @param {string} sPropertyName
	 *   The name of the control property for which the field help information has to be updated
	 */
	function updateFieldHelp(sPropertyName) {
		// "this" is the managed object on which this function is called
		if (sPropertyName) {
			oFieldHelp._updateProperty(this, sPropertyName);
		} else {
			oFieldHelp._updateElement(this);
		}
	}

	/**
	 * @typedef {object} module:sap/ui/core/fieldhelp/BackendHelpKey
	 * @description The back-end help key as used by the SAP Companion to retrieve the field help.
	 * @property {string} id The ID of the back-end help key
	 * @property {string} [origin] The origin of the back end
	 * @property {string} type The type of the help key
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 */

	/**
	 * @typedef {object} module:sap/ui/core/fieldhelp/FieldHelpInfo
	 * @description The label, the control ID and the back-end help key as required by the SAP Companion to display
	 *   the field help for the control with the given ID.
	 * @property {module:sap/ui/core/fieldhelp/BackendHelpKey} backendHelpKey The back-end help key
	 * @property {string} hotspotId The ID of the control
	 * @property {string} labelText The label text of the control
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 */

	/**
	 * DO NOT call this private constructor for <code>FieldHelp</code>; use <code>FieldHelp.getInstance</code> instead.
	 * Singleton class to provide field help support for controls as used by the SAP Companion.
	 *
	 * @alias module:sap/ui/core/fieldhelp/FieldHelp
	 * @author SAP SE
	 * @class
	 *
	 * @hideconstructor
	 * @private
	 * @since 1.125.0
	 */
	class FieldHelp {
		/**
		 * Whether the field help support is active.
		 *
		 * @default false
		 * @type {boolean}
		 */
		#bActive = false;

		/**
		 * The callback function that is called if the field help hotspots have changed.
		 *
		 * @default null
		 * @type {function(module:sap/ui/core/fieldhelp/FieldHelpInfo[])}
		 */
		#fnUpdateHotspotsCallback = null;

		/**
		 * Maps a control ID to an object mapping a control property to an array of back-end help key URNs.
		 *
		 * @default {}
		 * @type {Object<string, Object<string, string[]>>}
		 */
		mDocuRefControlToFieldHelp = {};

		/**
		 * A Promise that resolves when all hotspot updates are done.
		 *
		 * @default null
		 * @type {Promise}
		 */
		#oUpdateHotspotsPromise = null;

		/**
		 * @typedef {Map<string,Map<string,string>>} sap.ui.core.fieldhelp.Text2IdByType
		 *
		 * Map of a text property path to a map of the qualified name of the type to the ID property path for the text
		 * property which is used with the following semantics:
		 * If the given text property path is used relative to a path P of the given type, the path
		 * for field help lookup is the ID property path appended to P.
		 * Sample mappings:
		 * "ProductName" => { "com.sap....PackagedDangerousGoodWorkItemType" => "Product" },
		 * "toBusinessPartner/CompanyName" => {
		 *   "com.sap....SalesOrderType" => "BusinessPartnerID",
		 *   "com.sap....SalesOrderItemType"=> "BusinessPartnerID"
		 * }
		 * Sample for path used to lookup field help resulting from these mappings: Binding path
		 * "SalesOrderSet('42')/toBusinessPartner/CompanyName" is mapped to path
		 * "SalesOrderSet('42')/BusinessPartnerID" to look up field help
		 */

		// map of meta model -> promise on text to ID mapping
		// Map(<string, Promise<sap.ui.core.fieldhelp.Text2IdByType>>)
		#mMetaModel2TextMappingPromise = new Map();

		/**
		 * @typedef {object} sap.ui.core.fieldhelp.TextPropertyInfo
		 *
		 * Information about the text to ID property mapping for a meta model including the visited types, that is the
		 * types, for which this mapping has already been computed.
		 *
		 * @property {Set<string>} visitedTypes
		 *   Set of QNames of already visited types for the meta model
		 * @property {sap.ui.core.fieldhelp.Text2IdByType} text2IdByType
		 *   The mapping of text properties to id properties by type for the meta model
		 */
		// metamodel -> text property info
		// Map<sap.ui.model.odata.ODataMetaModel|sap.ui.model.odata.v4.ODataMetaModel,
		//     sap.ui.core.fieldhelp.TextPropertyInfo>
		#mMetamodel2TextPropertyInfo = new Map();

		/**
		 * @interface
		 * @name sap.ui.core.fieldhelp.MetaModelInterface
		 * @description Interface for uniform access to OData V4 and OData V2 meta models to retrieve information
		 *   required to compute text to ID property mappings.
		 */

		/**
		 * Gets the string value of the <code>com.sap.vocabulary.Common.DocumentationRef</code> annotation for the
		 * property with the given path.
		 * Calling this method requires that {@link #requestTypes} has been called before, so that metadata is
		 * loaded and can be accessed synchronously.
		 *
		 * @function
		 * @name sap.ui.core.fieldhelp.MetaModelInterface#getDocumentationRef
		 * @param {string} sPropertyPath The property path
		 * @returns {string|undefined} The string value of the <code>com.sap.vocabulary.Common.DocumentationRef</code>
		 *   annotation targeting the given property or <code>undefined</code> if the property has no such annotation
		 */

		/**
		 * Gets the array of property names for the given entity type or complex type.
		 * Calling this method requires that {@link #requestTypes} has been called before, so that metadata is
		 * loaded and can be accessed synchronously.
		 *
		 * @function
		 * @name sap.ui.core.fieldhelp.MetaModelInterface#getProperties
		 * @param {object} oType The type object
		 * @returns {string[]} Array of property names
		 */

		/**
		 * Gets the path of the <code>com.sap.vocabulary.Common.Text</code> annotation for the given property in the
		 * given entity type or complex type.
		 * Calling this method requires that {@link #requestTypes} has been called before, so that metadata is
		 * loaded and can be accessed synchronously.
		 *
		 * @function
		 * @name sap.ui.core.fieldhelp.MetaModelInterface#getTextPropertyPath
		 * @param {string} sType The type name
		 * @param {string} sProperty The property name
		 * @param {number} [iTypeIndex] (OData V2 only) The type index in the corresponding collection metamodel data
		 * @param {number} [iPropertyIndex] (OData V2 only) The property index in the type object's property array
		 * @param {boolean} [bComplexType] (OData V2 only) Whether the type is a complex type
		 * @returns {string|undefined} The path value of the <code>com.sap.vocabulary.Common.Text</code> annotation
		 *   targeting the given property or <code>undefined</code> if the property has no such annotation
		 */

		/**
		 * Gets the qualified name of the type for the given resolved data path.
		 * Calling this method requires that {@link #requestTypes} has been called before, so that metadata is
		 * loaded and can be accessed synchronously.
		 *
		 * @function
		 * @name sap.ui.core.fieldhelp.MetaModelInterface#getTypeQName
		 * @param {string} sResolvedPath The resolved data path
		 * @returns {string|undefined}
		 *   The qualified type name for the resolved path or <code>undefined</code>, if the path does not correspond to
		 *   a type
		 * @throws {Error} In case the resolved path does not comply to the metadata
		 */

		/**
		 * Requests the entity types and complex types for this meta model.
		 *
		 * @async
		 * @function
		 * @name sap.ui.core.fieldhelp.MetaModelInterface#requestTypes
		 * @returns {Promise<Array<Map<string, object>>>}
		 *   A promise resolving with an array with two maps of the type's qualified name to the type object; the first
		 *   map for entity types, the second for complex types. The promise rejects, if the requested metadata cannot
		 *   be loaded.
		 */

		/**
		 * Implementation of the meta model interface for OData V4.
		 *
	 	 * @implements {sap.ui.core.fieldhelp.MetaModelInterface}
	 	 */
		static #oMetaModelInterfaceV4 = {
			getDocumentationRef(sPropertyPath) {
				return this.oMetaModel.getObject("@" + sDocumentationRef,
					this.oMetaModel.getMetaContext(sPropertyPath));
			},

			getProperties(oType) {
				return Object.keys(oType).filter((sKey) => oType[sKey].$kind === "Property");
			},

			getTextPropertyPath(sType, sProperty) {
				return this.oMetaModel.getObject(`/${sType}/${sProperty}@com.sap.vocabularies.Common.v1.Text/$Path`);
			},

			getTypeQName(sResolvedPath) {
				return this.oMetaModel.getObject(this.oMetaModel.getMetaPath(sResolvedPath) + "/$Type");
			},

			async requestTypes() {
				const mEntityTypes = new Map();
				const mComplexTypes = new Map();
				const mScope = await this.oMetaModel.requestObject("/$");
				Object.entries(mScope).forEach(([sKey, oValue]) => {
					if (oValue.$kind === "EntityType") {
						mEntityTypes.set(sKey, oValue);
					} else if (oValue.$kind === "ComplexType") {
						mComplexTypes.set(sKey, oValue);
					}
				});
				return [mEntityTypes, mComplexTypes];
			}
		};

		static #oMetaModelInterfaceV2 = {
			getDocumentationRef(sPropertyPath) {
				return this.oMetaModel.getObject("", this.oMetaModel.getMetaContext(sPropertyPath))
					[sDocumentationRef]?.String;
			},

			getProperties(oType) {
				return oType.property?.map((oProperty) => oProperty.name) ?? [];
			},

			getTextPropertyPath(sType, sProperty, iTypeIndex, iPropertyIndex, bComplexType) {
				const sKindOfType = bComplexType ? "complexType" : "entityType";
				// do not access "Path" property of Text annotation directly via metamodel path, as this leads to
				// a console warning in case there is no Text annotation
				return this.oMetaModel.getObject(
					`/dataServices/schema/0/${sKindOfType}/${iTypeIndex}/property/${iPropertyIndex}`
					+ "/com.sap.vocabularies.Common.v1.Text")?.Path;
			},

			getTypeQName(sResolvedPath) {
				let oMetaContext;
				try {
					oMetaContext = this.oMetaModel.getMetaContext(sResolvedPath);
				} catch (oCause) {
					const oError = new Error(`Failed to determine type QName for path '${sResolvedPath}'`);
					oError.cause = oCause;
					throw oError;
				}

				const oMetaObject = this.oMetaModel.getObject("", oMetaContext);
				if (oMetaObject.namespace) {
					return `${oMetaObject.namespace}.${oMetaObject.name}`; // path to entity or entity collection
				}

				return oMetaObject.type; // path to (possibly complex typed) property
			},

			async requestTypes() {
				await this.oMetaModel.loaded();
				const oSchema = this.oMetaModel.getObject("/dataServices/schema/0");
				const createTypeMap =
					(aTypes) => new Map(aTypes?.map((oType) => [`${oType.namespace}.${oType.name}`, oType]) ?? []);
				return [createTypeMap(oSchema.entityType), createTypeMap(oSchema.complexType)];
			}
		};

		/**
		 * Gets the meta model interface for the given OData model's meta model or <code>undefined</code>, if the model
		 * is not a <code>sap.ui.model.odata.v4.ODataModel</code> or <code>sap.ui.model.odata.v2.ODataModel</code>.
		 *
		 * @param {sap.ui.model.Model} [oModel] The model
		 * @returns {sap.ui.core.fieldhelp.MetaModelInterface|undefined} The meta model interface of the given model's
		 *   meta model or <code>undefined</code>, if the model is not set or is not an OData V4 or OData V2 model
		 */
		static _getMetamodelInterface(oModel) {
			if (!oModel) {
				return undefined;
			}

			let oInterface;
			if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
				oInterface = Object.create(FieldHelp.#oMetaModelInterfaceV4);
			} else if (oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
				oInterface = Object.create(FieldHelp.#oMetaModelInterfaceV2);
			} else {
				return undefined;
			}

			oInterface.oMetaModel = oModel.getMetaModel();
			return oInterface;
		}

		/**
		 * Requests the ID property path for the given meta model interface and the given resolved path; if the
		 * resolved path does not point to a text property, the resolved path itself is returned.
		 *
		 * @param {sap.ui.core.fieldhelp.MetaModelInterface} oMetaModelInterface
		 *   The OData meta model interface
		 * @param {string} sResolvedPath
		 *    The resolved path
		 * @returns {Promise<string>}
		 *   A promise that resolves with the ID property path for the given resolved path, if it points to a text
		 *   property or the given resolved path otherwise. The promise rejects, if the requested metadata cannot
		 *   be loaded or - for OData V2 only - in case of a resolved path which does not comply to the metadata.
		 */
		async _requestIDPropertyPath(oMetaModelInterface, sResolvedPath) {
			const mText2IdByType = await this._requestText2IdByType(oMetaModelInterface);
			const [sFirstSegment, ...aSuffixSegments] = sResolvedPath.slice(1).split("/");
			const aPrefixSegments = [sFirstSegment];
			while (aSuffixSegments.length) {
				const sPrefixPath = "/" + aPrefixSegments.join("/");
				const sTypeQName = oMetaModelInterface.getTypeQName(sPrefixPath);
				const sTextPropertyPath = aSuffixSegments.join("/");
				const sIDPropertyPath = mText2IdByType.get(sTextPropertyPath)?.get(sTypeQName);
				if (sIDPropertyPath) {
					return sPrefixPath + "/" + sIDPropertyPath;
				}
				aPrefixSegments.push(aSuffixSegments.shift());
			}
			return sResolvedPath;
		}

		/**
		 * Requests the mapping of text properties to ID properties for the given meta model interface.
		 *
		 * @param {sap.ui.core.fieldhelp.MetaModelInterface} oMetaModelInterface
		 *   The meta model interface
		 * @returns {Promise<sap.ui.core.fieldhelp.Text2IdByType>}
		 *   A promise on the mapping of text to ID properties by type. The promise rejects, if the requested metadata
		 *   cannot be loaded.
		 */
		_requestText2IdByType(oMetaModelInterface) {
			const oMetaModel = oMetaModelInterface.oMetaModel;
			if (this.#mMetaModel2TextMappingPromise.has(oMetaModel)) {
				return this.#mMetaModel2TextMappingPromise.get(oMetaModel);
			}

			const oTextMappingPromise = oMetaModelInterface.requestTypes().then(([mEntityTypes, mComplexTypes]) => {
				const oTextPropertyInfo = this.#mMetamodel2TextPropertyInfo.get(oMetaModel);
				const mText2IdByType = oTextPropertyInfo?.text2IdByType ?? new Map();
				const oVisitedTypes = oTextPropertyInfo?.visitedTypes ?? new Set();
				const mAllTypes = new Map([...mEntityTypes, ...mComplexTypes]);
				const iEntityTypesCount = mEntityTypes.size;
				let i = 0;
				for (const [sType, oType] of mAllTypes) {
					const bComplexType = i >= iEntityTypesCount;
					const iTypeIndex = bComplexType ? i - iEntityTypesCount : i;
					i += 1;
					if (oVisitedTypes.has(sType)) {
						continue;
					}
					oVisitedTypes.add(sType);
					oMetaModelInterface.getProperties(oType).forEach((sProperty, iPropertyIndex) => {
						const sTextPropertyPath = oMetaModelInterface.getTextPropertyPath(sType, sProperty, iTypeIndex,
							iPropertyIndex, bComplexType);
						if (!sTextPropertyPath) {
							return;
						}
						const mIdByType = mText2IdByType.get(sTextPropertyPath) ??
							mText2IdByType.set(sTextPropertyPath, new Map()).get(sTextPropertyPath);
						mIdByType.set(sType, sProperty);
					});
				}
				this.#mMetamodel2TextPropertyInfo.set(oMetaModel, {
					text2IdByType: mText2IdByType,
					visitedTypes: oVisitedTypes
				});
				return mText2IdByType;
			});
			this.#mMetaModel2TextMappingPromise.set(oMetaModelInterface.oMetaModel, oTextMappingPromise);
			return oTextMappingPromise;
		}

		/**
		 * Requests the <code>String</code> value of the <code>com.sap.vocabularies.Common.v1.DocumentationRef</code>
		 * annotation for the given binding.
		 *
		 * @param {sap.ui.model.Binding} oBinding The binding
		 * @returns {Promise<string|undefined>}
		 *   If the binding is destroyed, or does not belong to an OData model, or the resolved path of the binding is a
		 *   meta model path or referencing an annotation, a promise resolving with <code>undefined</code> is returned;
		 *   if the binding belongs to an OData model the <code>com.sap.vocabularies.Common.v1.DocumentationRef</code>
		 *   annotation value for the binding is asynchronously requested via the OData meta model and the resulting
		 *   <code>Promise</code> either resolves with the <code>String</code> value of that annotation or with
		 *   <code>undefined</code> if the annotation is not available; the <code>Promise</code> never rejects
		 */
		async _requestDocumentationRef(oBinding) {
			if (oBinding.isDestroyed()) {
				return undefined;
			}

			let sResolvedPath = oBinding.getResolvedPath();
			if (!sResolvedPath || sResolvedPath.includes("#") /*meta model path*/
					|| sResolvedPath.includes("@") /*annotation path*/) {
				return undefined;
			}

			const oMetaModelInterface = FieldHelp._getMetamodelInterface(oBinding.getModel());
			if (!oMetaModelInterface) {
				return undefined;
			}

			let sDocumentationRefValue;
			try {
				const sFieldHelpPath = await this._requestIDPropertyPath(oMetaModelInterface, sResolvedPath);
				sResolvedPath = sFieldHelpPath; // for message logged in case of errors below
				sDocumentationRefValue = oMetaModelInterface.getDocumentationRef(sFieldHelpPath);
			} catch (oError) {
				Log.error(`Failed to request '${sDocumentationRef}' annotation for path '${sResolvedPath}'`,
					oError, sClassName);
			}
			return sDocumentationRefValue;
		}

		/**
		 * Iterates over the internal data structure for all controls which have field help information and
		 * checks whether the field help for that control has to be displayed at another control, e.g. an
		 * input field in a table has to show the field help information at the table column header. It checks the
		 * <code>fieldHelpDisplay</code> association or the <code>sap.ui.base.BindingInfo.OriginalParent</code>
		 * symbol at the control and in the control's parent hierarchy. If the internal data structure contains
		 * outdated references, they are cleaned up.
		 *
		 * @returns {Object<string, string>}
		 *   Maps a control ID having a field help information to the control ID at which it shall be displayed
		 */
		_getFieldHelpDisplayMapping() {
			const mControlIDToDisplayControlID = {};
			for (const sControlID in this.mDocuRefControlToFieldHelp) {
				const oControl = Element.getElementById(sControlID);
				if (!oControl) { // control has been destroyed, cleanup internal data structure
					delete this.mDocuRefControlToFieldHelp[sControlID];
					continue;
				}

				let sFieldHelpDisplayControlId;
				let oTempControl = oControl;
				do {
					sFieldHelpDisplayControlId = oTempControl.getAssociation("fieldHelpDisplay")
						|| oTempControl[BindingInfo.OriginalParent]?.getId();
					oTempControl = oTempControl.getParent();
				} while (!sFieldHelpDisplayControlId && oTempControl);
				if (sFieldHelpDisplayControlId) {
					mControlIDToDisplayControlID[sControlID] = sFieldHelpDisplayControlId;
				}
			}
			return mControlIDToDisplayControlID;
		}

		/**
		 * Gets an array of field help hotspots as required by the SAP Companion.
		 *
		 * @returns {module:sap/ui/core/fieldhelp/FieldHelpInfo[]} The array of field help hotspots
		 */
		_getFieldHelpHotspots() {
			const mControlIDToDisplayControlID = this._getFieldHelpDisplayMapping();
			const mDisplayControlIDToURNs = new Map();
			const aFieldHelpHotspots = [];
			Object.keys(this.mDocuRefControlToFieldHelp).forEach((sControlID) => {
				const sDisplayControlID = mControlIDToDisplayControlID[sControlID] || sControlID;
				const oURNSet = mDisplayControlIDToURNs.get(sDisplayControlID)
					?? mDisplayControlIDToURNs.set(sDisplayControlID, new Set()).get(sDisplayControlID);
				const aDocuRefsForControl = this.mDocuRefControlToFieldHelp[sControlID][undefined];
				const aDocuRefs = aDocuRefsForControl
					? [aDocuRefsForControl]
					: Object.values(this.mDocuRefControlToFieldHelp[sControlID]);
				aDocuRefs.forEach((aURNs) => {
					aURNs.forEach(oURNSet.add.bind(oURNSet)); // add to the Set to filter duplicates
				});
			});

			for (const [sDisplayControlID, oURNSet] of mDisplayControlIDToURNs) {
				const oControl = Element.getElementById(sDisplayControlID);
				const sLabel = LabelEnablement._getLabelTexts(oControl)[0];
				if (!sLabel) {
					Log.error(`Cannot find a label for control '${sDisplayControlID}'; ignoring field help`,
						Array.from(oURNSet).join(), sClassName);
					continue;
				}
				for (const sURN of oURNSet) {
					const oParameters = new URLSearchParams(sURN.slice(sURNPrefix.length));
					const sOrigin = oParameters.get("origin");
					aFieldHelpHotspots.push({
						backendHelpKey: {
							id: oParameters.get("id"),
							type: oParameters.get("type"),
							...(sOrigin && {origin: sOrigin})
						},
						hotspotId: sDisplayControlID,
						labelText: sLabel
					});
				}
			}

			return aFieldHelpHotspots;
		}

		/**
		 * Sets the field help information, given as documentation reference URNs, for the given control and the given
		 * control property and calls asynchronously the <code>fnUpdateHotspotsCallback</code> as given in
		 * {@link #activate}.
		 *
		 * @param {sap.ui.core.Element} oElement
		 *   The control
		 * @param {string} [sControlProperty]
		 *   The name of the control property
		 * @param {Array<string>} aDocumentationRefs
		 *   An array of documentation reference annotation URNs, e.g.
		 *   <code>["urn:sap-com:documentation:key?=~key&type=~type&id=~id&origin=~origin"]</code>
		 */
		_setFieldHelpDocumentationRefs(oElement, sControlProperty, aDocumentationRefs) {
			const sControlID = oElement.getId();
			this.mDocuRefControlToFieldHelp[sControlID] ||= {};
			if (aDocumentationRefs.length > 0) {
				this.mDocuRefControlToFieldHelp[sControlID][sControlProperty] = aDocumentationRefs;
			} else {
				delete this.mDocuRefControlToFieldHelp[sControlID][sControlProperty];
				if (Object.keys(this.mDocuRefControlToFieldHelp[sControlID]).length === 0) {
					delete this.mDocuRefControlToFieldHelp[sControlID];
				}
			}
			this._updateHotspots().catch(() => {/* avoid uncaught in Promise; do nothing */});
		}

		/**
		 * Updates the field help information for the given element.
		 *
		 * @param {sap.ui.core.Element} oElement
		 *   The element for which to set the field help information
		 * @param {string[]} [aDocumentationRefs]
		 *   The string values of <code>com.sap.vocabularies.Common.v1.DocumentationRef</code> annotations; if not given
		 *   the custom data <code>sap-ui-DocumentationRef</code> of the given element is used
		 */
		_updateElement(oElement, aDocumentationRefs) {
			if (oElement.isDestroyed() || oElement.isDestroyStarted()) {
				aDocumentationRefs = [];
			} else {
				aDocumentationRefs ||= oElement.data("sap-ui-DocumentationRef") || [];
			}
			this._setFieldHelpDocumentationRefs(oElement, undefined, aDocumentationRefs);
		}

		/**
		 * Calls the <code>fnUpdateHotspotsCallback</code> as given in {@link #activate} asynchronously with the latest
		 * field help hotspots.
		 *
		 * @returns {Promise<undefined>}
		 *   A Promise that resolves when the <code>fnUpdateHotspotsCallback</code> as given in {@link #activate} has
		 *   been called with the latest field help hotspots; rejects if the field help has been deactivated in between.
		 */
		_updateHotspots() {
			if (this.#oUpdateHotspotsPromise) {
				return this.#oUpdateHotspotsPromise;
			}
			let fnResolve, fnReject;
			this.#oUpdateHotspotsPromise = new Promise((resolve, reject) => {
				fnResolve = resolve;
				fnReject = reject;
			});

			// gather and send field help info in task so that e.g. field help can be displayed at a column header
			setTimeout(() => {
				if (this.isActive()) {
					this.#fnUpdateHotspotsCallback(this._getFieldHelpHotspots());
					this.#mMetaModel2TextMappingPromise.clear();
					fnResolve();
				} else {
					fnReject();
				}
				this.#oUpdateHotspotsPromise = null;
			}, 0);

			return this.#oUpdateHotspotsPromise;
		}

		/**
		 * Updates the field help information for the given property of the given control if the control property
		 * belongs to the {@link sap.ui.base.ManagedObject.MetadataOptions.Property "Data" group} and is bound to an
		 * OData model.
		 *
		 * @param {sap.ui.core.Element} oElement The control
		 * @param {string} sControlProperty The name of the control property
		 *
		 * @private
		 */
		_updateProperty(oElement, sControlProperty) {
			if (oElement.getMetadata().getProperty(sControlProperty)?.group !== "Data") {
				return;
			}

			const oBinding = oElement.getBinding(sControlProperty);
			if (!oBinding) {
				return;
			}

			let aBindings;
			if (oBinding.isA("sap.ui.model.CompositeBinding")) {
				const aPartsToIgnore = oBinding.getType()?.getPartsIgnoringMessages() || [];
				aBindings = oBinding.getBindings().filter((oPart, i) => !aPartsToIgnore.includes(i));
			} else {
				aBindings = [oBinding];
			}
			Promise.all(
				aBindings.map((oBinding) => this._requestDocumentationRef(oBinding))
			).then((aDocumentationRefs) => {
				aDocumentationRefs = aDocumentationRefs.filter((sDocumentationRef) => sDocumentationRef);
				this._setFieldHelpDocumentationRefs(oElement, sControlProperty, aDocumentationRefs);
			});
		}

		/**
		 * Gets the singleton instance of <code>FieldHelp</code>.
		 *
		 * @returns {module:sap/ui/core/fieldhelp/FieldHelp} The singleton instance
		 *
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.125.0
		 */
		static getInstance() {
			oFieldHelp ||= new FieldHelp();
			return oFieldHelp;
		}

		/**
		 * Activates the field help support. Determines the field help for all controls and calls the given update
		 * callback with the currently available field help.
		 *
		 * @param {function(module:sap/ui/core/fieldhelp/FieldHelpInfo[])} fnUpdateHotspotsCallback
		 *   The callback function that is called with the currently available field help information if the hotspots
		 *   for the field help have changed
		 * @throws {Error}
		 *   If the field help is already active and the update hotspots callback is different
		 *
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.125.0
		 */
		activate(fnUpdateHotspotsCallback) {
			if (this.#bActive) {
				if (this.#fnUpdateHotspotsCallback !== fnUpdateHotspotsCallback) {
					throw new Error("The field help is active for a different update hotspots callback handler");
				}
				return;
			}

			this.#bActive = true;
			this.#fnUpdateHotspotsCallback = fnUpdateHotspotsCallback;
			ElementRegistry.forEach((oElement) => {
				const aDocumentationRefs = oElement.data("sap-ui-DocumentationRef");
				if (aDocumentationRefs) {
					this._updateElement(oElement, aDocumentationRefs);
				} else {
					Object.keys(oElement.getMetadata().getAllProperties()).forEach((sPropertyName) => {
						this._updateProperty(oElement, sPropertyName);
					});
				}
			});
			ManagedObject.prototype.updateFieldHelp = updateFieldHelp;
		}

		/**
		 * Deactivates the field help support and cleans up the internal data structures.
		 *
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.125.0
		 */
		deactivate() {
			this.#bActive = false;
			this.mDocuRefControlToFieldHelp = {};
			this.#fnUpdateHotspotsCallback = null;
			this.#mMetaModel2TextMappingPromise.clear();
			this.#mMetamodel2TextPropertyInfo.clear();
			ManagedObject.prototype.updateFieldHelp = undefined; // restore the default
		}

		/**
		 * Whether the field help is currently active.
		 *
		 * @returns {boolean} Whether the field help is active
		 *
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.125.0
		 */
		isActive() {
			return this.#bActive;
		}
	}

	return FieldHelp;
});
