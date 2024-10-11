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
		 * Maps a control ID to an object mapping a control property to a back-end help key URNs.
		 *
		 * @default {}
		 * @type {Object<string, Object<string, string[]>>}
		 */
		#mDocuRefControlToFieldHelp = {};

		/**
		 * A Promise that resolves when all hotspot updates are done.
		 *
		 * @default null
		 * @type {Promise}
		 */
		#oUpdateHotspotsPromise = null;

		/**
		 * Requests the <code>String</code> value of the <code>com.sap.vocabularies.Common.v1.DocumentationRef</code>
		 * annotation for the given binding.
		 *
		 * @param {sap.ui.model.Binding} oBinding The binding
		 * @return {Promise<string>|undefined}
		 *   If the binding is destroyed, or does not belong to an OData model, or the resolved path of the binding is a
		 *   meta model path or referencing an annotation, then <code>undefined</code> is returned; if the binding
		 *   belongs to an OData model the <code>com.sap.vocabularies.Common.v1.DocumentationRef</code> annotation value
		 *   for the binding is asynchronously requested via the OData meta model and the resulting <code>Promise</code>
		 *   either resolves with the <code>String</code> value of that annotation or with <code>undefined</code> if the
		 *   annotation is not available; the <code>Promise</code> never rejects
		 */
		static _requestDocumentationRef(oBinding) {
			if (oBinding.isDestroyed()) {
				return undefined;
			}
			const sResolvedPath = oBinding.getResolvedPath();
			if (!sResolvedPath || sResolvedPath.includes("#") /*meta model path*/
					|| sResolvedPath.includes("@") /*annotation path*/) {
				return undefined;
			}
			const oMetaModel = oBinding.getModel()?.getMetaModel();
			if (!oMetaModel || !oMetaModel.getMetaContext) {
				return undefined;
			}

			let oFieldHelpAnnotationPromise;
			if (oMetaModel.isA("sap.ui.model.odata.ODataMetaModel")) {
				oFieldHelpAnnotationPromise = oMetaModel.loaded().then(() => {
					// first get the object for the meta context then get the annotation to avoid warnings that an
					// invalid path is used; getMetaContext has to be called after the meta model is loaded.
					return oMetaModel.getObject("", oMetaModel.getMetaContext(sResolvedPath))?.[sDocumentationRef]
						?.String;
				});
			} else { // V4 meta model
				oFieldHelpAnnotationPromise = oMetaModel.requestObject("@" + sDocumentationRef,
					oMetaModel.getMetaContext(sResolvedPath));
			}
			return oFieldHelpAnnotationPromise.catch((oReason) => {
					Log.error(`Failed to request '${sDocumentationRef}' annotation for path '${sResolvedPath}'`,
						oReason, sClassName);
					return undefined;
				});
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
			const mControlIDToFieldHelpDisplayControlID = {};
			for (const sControlID in this.#mDocuRefControlToFieldHelp) {
				const oControl = Element.getElementById(sControlID);
				if (!oControl) { // control has been destroyed, cleanup internal data structure
					delete this.#mDocuRefControlToFieldHelp[sControlID];
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
					mControlIDToFieldHelpDisplayControlID[sControlID] = sFieldHelpDisplayControlId;
				}
			}
			return mControlIDToFieldHelpDisplayControlID;
		}

		/**
		 * Gets an array of field help hotspots as required by the SAP Companion.
		 *
		 * @returns {module:sap/ui/core/fieldhelp/FieldHelpInfo[]} The array of field help hotspots
		 */
		_getFieldHelpHotspots() {
			const mControlIDToFieldHelpDisplayControlID = this._getFieldHelpDisplayMapping();
			const oFieldHelpDisplayControlIDToAddedURNs = {};
			const aFieldHelpHotspots = [];
			Object.keys(this.#mDocuRefControlToFieldHelp).forEach((sControlID) => {
				const sControlIDToDisplayFieldHelp = mControlIDToFieldHelpDisplayControlID[sControlID] || sControlID;
				const oControl = Element.getElementById(sControlIDToDisplayFieldHelp);
				const sLabel = LabelEnablement._getLabelTexts(oControl)[0];
				if (!sLabel) {
					Log.error(`Cannot find a label for control '${sControlID}'; ignoring field help`,
						JSON.stringify(this.#mDocuRefControlToFieldHelp[sControlID]), sClassName);

					return;
				}
				const oURNSet = new Set();
				Object.values(this.#mDocuRefControlToFieldHelp[sControlID]).forEach((aURNs) => {
					aURNs.forEach(oURNSet.add.bind(oURNSet)); // add to the Set to filter duplicates
				});
				Array.from(oURNSet).forEach((sURN) => {
					if (oFieldHelpDisplayControlIDToAddedURNs[sControlIDToDisplayFieldHelp]?.[sURN]) {
						return; // already added for another control
					}

					oFieldHelpDisplayControlIDToAddedURNs[sControlIDToDisplayFieldHelp] ??= {};
					oFieldHelpDisplayControlIDToAddedURNs[sControlIDToDisplayFieldHelp][sURN] = true;
					const oParameters = new URLSearchParams(sURN.slice(sURNPrefix.length));
					const sOrigin = oParameters.get("origin");
					aFieldHelpHotspots.push({
						backendHelpKey: {
							id: oParameters.get("id"),
							type: oParameters.get("type"),
							...(sOrigin && {origin: sOrigin})
						},
						hotspotId: sControlIDToDisplayFieldHelp,
						labelText: sLabel
					});
				});
			});

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
			this.#mDocuRefControlToFieldHelp[sControlID] ||= {};
			if (aDocumentationRefs.length > 0) {
				this.#mDocuRefControlToFieldHelp[sControlID][sControlProperty] = aDocumentationRefs;
			} else {
				delete this.#mDocuRefControlToFieldHelp[sControlID][sControlProperty];
				if (Object.keys(this.#mDocuRefControlToFieldHelp[sControlID]).length === 0) {
					delete this.#mDocuRefControlToFieldHelp[sControlID];
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
		 * @returns {Promise}
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
				aBindings.map((oBinding) => FieldHelp._requestDocumentationRef(oBinding))
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
			this.#mDocuRefControlToFieldHelp = {};
			this.#fnUpdateHotspotsCallback = null;
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
