/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/isPlainObject"
],
function(
	isPlainObject
) {
	"use strict";

	function isAString(oObject, sKey) {
		return oObject[sKey] && typeof oObject[sKey] === "string";
	}

	function checkCommonParametersForControl(mPropertyBag) {
		if (!mPropertyBag.appComponent.isA("sap.ui.core.Component")) {
			return false;
		}

		if (!isPlainObject(mPropertyBag.modifier)) {
			return false;
		}

		if (mPropertyBag.modifier.targets === "xmlTree" && !isAString(mPropertyBag.view, "nodeName")) {
			return false;
		}

		if (mPropertyBag.payload && !isPlainObject(mPropertyBag.payload)) {
			return false;
		}

		return ["aggregationName", "bindingPath"].every(isAString.bind(null, mPropertyBag));
	}

	var TestDelegate = {
		/**
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation the delegate should provide additional elements
		 * @param {object} [mPropertyBag.payload] - Payload parameter attached to the delegate, empty object if no payload was assigned
		 * @returns {Promise<sap.ui.fl.delegate.PropertyInfo[]>} Metadata in a deep structure of nodes and properties
		 */
		getPropertyInfo: function (mPropertyBag) {
			return Promise.resolve()
				.then(function() {
					var bValidParameters =
						mPropertyBag.element.isA("sap.ui.core.Element")
						&& mPropertyBag.aggregationName && typeof mPropertyBag.aggregationName === "string"
						&& (!mPropertyBag.payload || typeof mPropertyBag.payload === "object");

					if (bValidParameters) {
						return [];
					}
				});
		},

		/**
		 * Optional method to provide all properties and the corresponding controls that represent them.
		 * Implement this method if evaluating the binding is not enough e.g. a Table has not yet received a binding or if like filter field represents a property without binding)
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {object} mPropertyBag.payload - Payload parameter attached to the delegate, empty object if no payload was assigned
		 * @param {string} mPropertyBag.element - Control of the element the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation the delegate should provide additional elements
		 * @returns {Promise<sap.ui.fl.delegate.RepresentedPropertyInfo[]>} data about properties represented on the screen (either via binding or similar like a filter field that has never directly a binding)
		 * @experimental we still need some more use cases/pilot usage to finalize the API
		 */
		getRepresentedProperties: function (/*mPropertyBag*/) {
		},

		/**
		 * Creates a label for the corresponding metadata property
		 * The control should be created with the modifier as it will be called by change handlers during XML preprocessing with XML nodes
		 * as well as at runtime when real control instances exist.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier to harmonize access, creation and manipulation to controls in XML Views and JS Controls
		 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - Needed to calculate the correct ID in case you provide an selector
		 * @param {Element} [mPropertyBag.view] - XML node of the view, required for XML case to create nodes and to find elements
		 * @param {string} mPropertyBag.labelFor - ID of the control the label is used for, this can serve as prefix for the labels ID
		 * @param {string} mPropertyBag.bindingPath - Runtime binding path the control should be bound to
		 * @param {object} [mPropertyBag.payload] - Payload parameter attached to the delegate, undefined if no payload was assigned
		 * @param {string} mPropertyBag.controlType - Control type of the element the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation the delegate should provide additional elements
		 * @returns {Promise<sap.ui.base.ManagedObject|Element>} Control representation of the label
		 */
		createLabel: function (mPropertyBag) {
			return Promise.resolve()
				.then(function () {
					var bParametersValid =
						checkCommonParametersForControl(mPropertyBag)
						&& isAString(mPropertyBag, "labelFor");

					if (bParametersValid) {
						return mPropertyBag.modifier.createControl("sap.m.Label", //for V4/FIHR | for v2 it should be smart label
							mPropertyBag.appComponent,
							mPropertyBag.view,
							mPropertyBag.labelFor + "-label",
							{
								labelFor: mPropertyBag.labelFor,
								text: mPropertyBag.bindingPath
							},
							true/*async*/
						);
					}
				});
		},

		/**
		 * Creates a control to show and edit the corresponding metadata property and provide a value help if that is needed in addition.
		 * The control should be created with the modifier as it will be called by change handlers during XML preprocessing with XML nodes
		 * as well as at runtime when real control instances exist.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier to harmonize access, creation and manipulation to controls in XML Views and JS Controls
		 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - Needed to calculate the correct ID in case you provide an selector
		 * @param {Element} [mPropertyBag.view] - XML node of the view, required for XML case to create nodes and to find elements
		 * @param {object} mPropertyBag.fieldSelector - Selector to calculate the ID for the control that is created
		 * @param {string} mPropertyBag.fieldSelector.id - Control ID targeted by the change
		 * @param {boolean} [mPropertyBag.fieldSelector.isLocalId] - <code>true</code> if the ID within the selector is a local ID or a global ID
		 * @param {string} mPropertyBag.bindingPath - Runtime binding path the control should be bound to
		 * @param {object} mPropertyBag.payload - Payload parameter attached to the delegate, undefined if no payload was assigned
		 * @param {string} mPropertyBag.controlType - Control type of the element the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation the delegate should provide additional elements
		 * @returns {Promise<sap.ui.fl.delegate.SpecificControlInfo>} Map containing the controls to add
		 */
		createControlForProperty: function (mPropertyBag) {
			return Promise.resolve()
				.then(function () {
					var bParametersValid =
						checkCommonParametersForControl(mPropertyBag)
						&& isPlainObject(mPropertyBag.fieldSelector) && isAString(mPropertyBag.fieldSelector, "id");

					if (bParametersValid) {
						return Promise.all([
							mPropertyBag.modifier.createControl("sap.m.Text",
								mPropertyBag.appComponent,
								mPropertyBag.view,
								mPropertyBag.fieldSelector,
								{
									text: "{" + mPropertyBag.bindingPath + "}"
								},
								true/*async*/
							),
							mPropertyBag.modifier.createControl("sap.ui.core.Element",
								mPropertyBag.appComponent,
								mPropertyBag.view,
								{
									id: mPropertyBag.modifier.getId(mPropertyBag.view) + "--valueHelp",
									idIsLocal: true
								},
								true
							)
						]).then(function (aControls) {
							return {
								control: aControls[0],
								valueHelp: aControls[1]
							};
						});
					}
				});
		},

		/**
		 * Creates a layout control that should already include the label and a control to show an edit the metadata property in an arrangement fitting a generic layout container.
		 * The controls should be created with the modifier as it will be called by change handlers during XML preprocessing with XML nodes
		 * as well as at runtime when real control instances exist.
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier to harmonize access, creation and manipulation to controls in XML Views and JS Controls
		 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - Needed to calculate the correct ID in case you provide an selector
		 * @param {Element} [mPropertyBag.view] - XML node of the view, required for XML case to create nodes and to find elements
		 * @param {object} mPropertyBag.fieldSelector - Selector to calculate the ID for the control that is created
		 * @param {string} mPropertyBag.fieldSelector.id - Control ID targeted by the change
		 * @param {boolean} [mPropertyBag.fieldSelector.isLocalId] - <code>true</code> if the ID within the selector is a local ID or a global ID
		 * @param {string} mPropertyBag.bindingPath - Runtime binding path the control should be bound to
		 * @param {object} [mPropertyBag.payload] - Payload parameter attached to the delegate, undefined if no payload was assigned
		 * @param {string} mPropertyBag.controlType - Control type of the element the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation the delegate should provide additional elements
		 * @returns {Promise<sap.ui.fl.delegate.LayoutControlInfo>} Map containing the controls to add
		 */
		createLayout: function (mPropertyBag) {
			return Promise.resolve()
				.then(function () {
					var bParametersValid =
						checkCommonParametersForControl(mPropertyBag)
						&& mPropertyBag.fieldSelector && typeof mPropertyBag.fieldSelector === "object" && typeof mPropertyBag.fieldSelector.id === "string";

					if (bParametersValid) {
						return {
							control: {},
							valueHelp: {}
						};
					}
				});
		}
	};

	return TestDelegate;
});
