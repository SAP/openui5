/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";
	/**
	 * Object containing metadata properties and nodes. Deep structure.
	 *
	 * @typedef {object} sap.ui.fl.interfaces.delegate.PropertyInfo
	 * @property {string} name - Technical name of the property, in case of nested properties (e.g. complex types in
	 * 		OData) it is the name of the property that has nested properties
	 * @property {string} [label] - If metadata has label information, it should be provided. A fallback to the
	 * 		technical name is implemented in the tooling and doesn't need to be provided by delegates
	 * @property {string} [tooltip] - If metadata has tooltip information (e.g. <code>quickinfo</code> annotation in OData),
	 * 		it should be provided. A fallback to the label or technical name is implemented in the tooling and
	 * 		doesn't need to be provided by delegates
	 * @property {string} bindingPath - Relative binding path, starting from the current binding context. Usually the
	 * 		same as the name, but for nested properties (e.g. complex properties or navigation properties) it has
	 * 		segments
	 * @property {boolean} [unsupported] - The delegate has to return all properties that could be bound somewhere.
	 * 		However some properties maybe shouldn't appear in the dialog (e.g. properties you would name in the <code>filter</code>
	 * 		attribute of <code>SmartForm</code>s or properties that are unsupported by the delegate's create methods).
	 * 		These properties should be marked as <code>unsupported</code>.
	 * @property {boolean} [hideFromReveal] - The delegate has to return all properties that could be bound somewhere.
	 * 		However some properties maybe shouldn't appear in the dialog (e.g. based on <code>UI.Hidden</code> annotation
	 * 		or Field Control). These properties should be marked as <code>hiddenByAnnotation</code>.
	 * @property {string} [entityType] - Only needed for OData-based delegates to help custom field support tooling
	 * @property {sap.ui.fl.interfaces.delegate.PropertyInfo[]} [properties] - Some properties can be nested (e.g.
	 * 		based on complex types and navigation properties in OData). In this case the delegate can provide these
	 * 		nested properties. However currently only nesting of one level is supported by adaptation dialogs.
	 *
	 * @private
	 * @ui5-restricted
	 * @since 1.78
	 */

	 /**
	 * Object containing information about properties represented on the UI. The property may be hidden, but was placed by
	 * someone before, so you would like to reveal it instead of recreating it.
	 *
	 * @typedef {object} sap.ui.fl.interfaces.delegate.RepresentedPropertyInfo
	 * @property {string} id - Control ID that represents this metadata property
	 * @property {string[]} bindingPaths - Binding path that represents this property, the binding path doesn't
	 * 		need to be used in a real binding.
	 *
  	 * @private
	 * @ui5-restricted
	 * @since 1.78
	 */

	/**
	 * Object containing the control representations.
	 *
	 * @typedef {object} sap.ui.fl.interfaces.delegate.SpecificControlInfo
	 * @property {sap.ui.base.ManagedObject|Element} control - Control representation for the concrete control that
	 * 		represents the models property that should be added, e.g. a <code>SmartField</code>
	 * @property {sap.ui.base.ManagedObject|Element} valueHelp - Control representation for the value help, returned
	 * 		if it needs to be added separately
	 *
	 * @private
	 * @ui5-restricted
	 * @since 1.78
	 */


	/**
	 * Object containing the control representations.
	 *
	 * @typedef {object} sap.ui.fl.interfaces.delegate.LayoutControlInfo
	 * @property {sap.ui.base.ManagedObject|Element} control - Control representation for a whole layout construction
	 * 		including the concrete control that represents the models property and the corresponding label in a way
	 * 		appropriate for the current placement in a generic container/layout
	 * @property {sap.ui.base.ManagedObject|Element} valueHelp - Control representation for the value help, returned
	 * 		if it needs to be added separately
	 *
	 * @private
	 * @ui5-restricted
	 * @since 1.78
	 */

	//TODO add link to app developer guide when it includes delegate description and test utility


	/**
	 * Interface for SAPUI5 flexibility delegates.
	 * Such delegates can be attached to controls to let key users add additional properties from metadata.
	 *
	 * <h4>Example:</h4>
	 * <pre>
	 * &ltmvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:fl="sap.ui.fl" &gt
	 *     &ltf:Form id="idForm"
	 *         fl:delegate='{
	 *             "name":"some/library/DelegateName",
	 *             "payload":{
	 *                 "modelName":"Books"
	 *             }
	 *         }'
	 *     &gt...&lt/f:Form&gt
	 *     ...
	 * &lt/mvc:View&gt
	 * </pre>
	 *
	 * @private
	 * @ui5-restricted
	 * @since 1.78
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted
	 * @interface
	 */
	return /** @lends sap.ui.fl.interfaces.Delegate */ {
		/**
		 * Provides all properties that are available at the current binding context. In OData, this will probably
		 * be all properties of the entityType. Technical properties, such as field control, should not be returned.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.base.ManagedObject} mPropertyBag.element - Element instance the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation for which delegate should provide
		 * 		all properties
		 * @param {object} mPropertyBag.payload - Payload parameter attached to the delegate, undefined if no payload
		 * 		was assigned
		 * @returns {Promise<sap.ui.fl.interfaces.delegate.PropertyInfo[]>} Metadata in a deep structure of nodes and properties
		 *
		 * @private
		 * @ui5-restricted
		 * @abstract
		 */
		getPropertyInfo: function(/*mPropertyBag*/) {
			return Promise.reject("not implemented");
		},

		/**
		 * Optional method to provide all properties and the corresponding controls that represent them.
		 * Implement this method if evaluating the binding is not enough e.g. a Table has not yet received a binding or
		 * if e.g. a filter field represents a property without binding.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {object} mPropertyBag.payload - Payload parameter attached to the delegate, undefined if no payload was assigned
		 * @param {sap.ui.base.ManagedObject} mPropertyBag.element - Control of the element the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation for which delegate should provide
		 * 		the property information
		 * @returns {Promise<sap.ui.fl.interfaces.delegate.RepresentedPropertyInfo[]>} Data about properties represented.
				Resolve <code>undefined</code> or don't implement the method if you don't want to take over the check for representation.
				Resolve an empty array if no property is represented at the moment.
		 *
		 * @private
		 * @ui5-restricted
		 * @abstract
		 */
		getRepresentedProperties: function(/*mPropertyBag*/) {
			return Promise.reject("not implemented");
		},

		/**
		 * Creates a label for the corresponding metadata property.
		 * The control should be created with the modifier as it will be called by change handlers during XML preprocessing
		 * with XML nodes as well as at runtime when real control instances exist.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier to harmonize access,
		 *		creation and manipulation to controls in XML views and JS controls
		 * @param {sap.ui.core.UIComponent} [mPropertyBag.appComponent] - Needed to calculate the correct ID in case you
		 *		provide a selector
		 * @param {Element} [mPropertyBag.view] - XML node of the view, required for the XML case to create nodes and to find
		 *		elements
		 * @param {string} [mPropertyBag.labelFor] - ID of the control the label is used for, this can serve as prefix for
		 *		the label's ID
		 * @param {string} mPropertyBag.parentSelector - Selector of the parent
		 * @param {string} mPropertyBag.bindingPath - Runtime binding path the control should be bound to
		 * @param {object} mPropertyBag.payload - Payload parameter attached to the delegate, undefined if no payload was assigned
		 * @param {sap.ui.base.ManagedObject|Element} mPropertyBag.element - Control representation of the element the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation for which delegate should create the label
		 * @returns {Promise<sap.ui.base.ManagedObject|Element>} Control representation of the label (e.g. <code>sap.m.Label</code>)
		 *
		 * @private
		 * @ui5-restricted
		 * @abstract
		 */
		createLabel: function(/*mPropertyBag*/) {
			return Promise.reject("not implemented");
		},

		/**
		 * Creates a control to show and edit the corresponding metadata property and provide a value help if that is needed
		 * in addition. The control should be created with the modifier as it will be called by change handlers during XML
		 * preprocessing with XML nodes as well as at runtime when real control instances exist.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier to harmonize access,
		 *		creation and manipulation to controls in XML views and JS controls
		 * @param {sap.ui.core.UIComponent} [mPropertyBag.appComponent] - Needed to calculate the correct ID in case you
		 *		provide a selector
		 * @param {Element} [mPropertyBag.view] - XML node of the view, required for the XML case to create nodes and to find
		 *		elements
		 * @param {object} [mPropertyBag.fieldSelector] - Selector to calculate the ID for the control that is created
		 * @param {string} [mPropertyBag.fieldSelector.id] - Control ID targeted by the change
		 * @param {boolean} [mPropertyBag.fieldSelector.isLocalId] - <code>true</code> if the ID within the selector is a local ID or a global ID
		 * @param {string} mPropertyBag.parentSelector - Selector of the parent
		 * @param {string} mPropertyBag.bindingPath - Runtime binding path the control should be bound to
		 * @param {object} mPropertyBag.payload - Payload parameter attached to the delegate, undefined if no payload was assigned
		 * @param {sap.ui.base.ManagedObject|Element} mPropertyBag.element - Control representation of the element the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation for which delegate should create controls
		 * @returns {Promise<sap.ui.fl.interfaces.delegate.SpecificControlInfo>} Map containing the controls to add
		 *
		 * @private
		 * @ui5-restricted
		 * @abstract
		 */
		createControlForProperty: function(/*mPropertyBag*/) {
			return Promise.reject("not implemented");
		},

		/**
		 * Creates a layout control that should already include the label and a control to show and edit the metadata property in an arrangement fitting a generic layout container.
		 * The controls should be created with the modifier as it will be called by change handlers during XML preprocessing with XML nodes
		 * as well as at runtime when real control instances exist.
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier to harmonize access,
		 *		creation and manipulation to controls in XML views and JS controls
		 * @param {sap.ui.core.UIComponent} [mPropertyBag.appComponent] - Needed to calculate the correct ID in case you
		 *		provide a selector
		 * @param {Element} [mPropertyBag.view] - XML node of the view, required for the XML case to create nodes and to find
		 *		elements
		 * @param {object} [mPropertyBag.fieldSelector] - Selector to calculate the ID for the control that is created
		 * @param {string} [mPropertyBag.fieldSelector.id] - Control ID targeted by the change
		 * @param {boolean} [mPropertyBag.fieldSelector.isLocalId] - <code>true</code> if the ID within the selector is a local ID or a global ID
		 * @param {string} mPropertyBag.bindingPath - Runtime binding path the control should be bound to
		 * @param {object} mPropertyBag.payload - Payload parameter attached to the delegate, undefined if no payload was assigned
		 * @param {sap.ui.base.ManagedObject|Element} mPropertyBag.element - Control representation of the element the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation for which delegate should create controls
		 * @returns {Promise<sap.ui.fl.interfaces.delegate.LayoutControlInfo>} Map containing the controls to add
		 *
		 * @private
		 * @ui5-restricted
		 * @abstract
		 */
		createLayout: function(/*mPropertyBag*/) {
			return Promise.reject("not implemented");
		}
	};
});
