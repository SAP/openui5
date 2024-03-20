/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.dt.
 */
sap.ui.define([
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(
	ManagedObjectMetadata,
	Lib
) {
	"use strict";

	/**
	 * Object containing the aggregation configuration
	 *
	 * @typedef {object} sap.ui.dt.DesignTimeMetadata.Aggregation
	 * @property {boolean|function} [ignore = false] - Used to ignore the aggregation (and all its children) at design time.
	 * For example, this can be used to ignore deprecated or duplicated aggregations as well as aggregations irrelevant during the design time (such as dependents).
	 * If the value is true, then no overlays will be created for the aggregation and its children.
	 * For more options on how to disable actions in design time please refer to the UI5 Demo Kit.
	 * @property {string|function} [domRef] - Defines the DOM reference of the aggregation.
	 * The DOM reference is used to calculate the dimension of the aggregation at design time.
	 * This is needed, for instance, to make drag&drop possible.
	 * If no domRef property is given, a heuristic is used to calculate the dimension of the aggregation
	 * from its children during the design time.
	 * @property {object|function} [childNames] - Provide or compute name for the controls inside the aggregation which is understandable for the key user.
	 * This is needed for the "addODataProperty" and "createContainer" action to show the names in the context menu (Add <singular>, Available <plural>).
	 * Name the control based on the general UI concept and follow the guidance from https://experience.sap.com/fiori-design/.
	 * The key user doesn't care about the difference between a smart, mobile, or responsive version of a form, it's just a form.
	 * @property {string|function} childNames.singular - i18n key from library's design-time resource bundle or function returning the translated text
	 * @property {string|function} childNames.plural - i18n key from library's design-time resource bundle or function returning the translated text
	 * @property {object} [actions] - Actions that can be performed on the aggregation (e.g. move).
	 * @property {function} [propagateMetadata] - Returns DesignTime-Metadata object which extends or overrides existing metadata of a successor control.
	 * In the negative case it returns the boolean "false" value.
	 * The propagateMetadata function gets 2 parameters passed through during execution: oControl and oRelevantContainerControl.
	 * The second parameter is the control which has defined this propagation function.
	 * It can be used if you need to know the relevantContainer during the execution of the function.
	 * @property {boolean|function} [propagateRelevantContainer] - Defines the relevant container control for the actions which belong to successor controls.
	 *
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Object containing the aggregation configuration
	 *
	 * @typedef {object} sap.ui.dt.DesignTimeMetadata.Property
	 * @property {boolean|function} [ignore = false] - Used to ignore the property at design time.
	 * For example, this can be used to ignore deprecated properties or properties that shall not be changed during design time.
	 *
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Object containing the association configuration
	 *
	 * @typedef {object} sap.ui.dt.DesignTimeMetadata.Association
	 * @property {boolean} aggregationLike - Can be used to tell the design time that it should follow the association hierarchy.
	 * This is used by controls like e.g. the componentContainer that should allow to follow the association component,
	 * which defines the control hierarchy but is not a real aggregation (more isolation, regarding model propagation/rendering/eventing/...).
	 *
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Object containing a sample design time configuration
	 *
	 * @typedef {object} sap.ui.dt.DesignTimeMetadata
	 * @property {object|function} name - Specify or calculate a speaking name for the  control (which is understandable to key users).
	 * This is needed for the "reveal" action to show the names in the context menu (Add <name in singular> and Available <name in plural>).
	 * Name your control based on the general UI concept and follow the guidance from https://experience.sap.com/fiori-design/.
	 * Example: Key users don't care about the difference between a smart, mobile or responsive version of a form, it's just a form.
	 * @property {string|function} name.singular - i18n key from library's design-time resource bundle or function returning the translated text
	 * @property {string|function} name.plural - i18n key from library's design-time resource bundle or function returning the translated text
	 * @property {function} [getLabel] - Allows you to return the label texts of the control, that is useful in outlines, context menus
	 * and e.g. "add" dialogs so that users can identify which of the controls of this type is meant (e.g. the product price).
	 * Our default implementation tries getText() and then getLabelText(). If it's not available,
	 * it tries getLabel().getText(), then getTitle(), and then getId()
	 * @property {string|function} [domRef] - Defines the DOM reference of the control
	 * @property {function} isVisible - Needed for Elements that are not derived from sap.ui.core.Control.
	 * The function should return the visibility of the Element as a boolean (true = visible).
	 * This function can be called before the DOM is ready, so e.g. jQuery.is(":visible") should not be used.
	 * @property {object|function} palette - Palette settings for the control.
	 * @property {string|function} palette.group - Possible values: "ACTION", "DISPLAY", "LAYOUT", "LIST", "INPUT", "CONTAINER", "CHART", "TILE"
	 * @property {string|function} palette.icon - Preferable as SVG as this icon scales
	 * @property {object} templates - Create template will not be inherited, they are special to the current type.
	 * @property {string} templates.create - Path to the template file
	 * @property {object} actions - RTA specific actions that can be performed on the control.
	 * @property {object} properties - Configuration for the properties of the control. See sap.ui.dt.DesignTimeMetadata.Property
	 * @property {object} aggregations - Configuration for the aggregations of the control. See sap.ui.dt.DesignTimeMetadata.Aggregation
	 * @property {object} associations - Describes the associations of the control.
	 * Per default no association is followed as overlays should match the control hierarchy. No actions are supported for associations.
	 * See sap.ui.dt.DesignTimeMetadata.Association
	 * @property {object} annotations - Describes the OData annotations that are actively used by your control.
	 * This section needs to be filled for controls evaluating annotations.
	 * It can be used for documentation purposes, but is also evaluated by UI adaptation at design time.
	 * @property {object[]} scrollContainers - Describes the scroll containers of the control.
	 * This is needed when there are more than one aggregation in one scroll container (e.g. ObjectPageLayout: Header + Sections).
	 * @property {string|function} scrollContainers.domRef - Defines the DOM reference for the scroll wrapper
	 * @property {string[]|function} scrollContainers.aggregations - Names of the aggregations inside the scroll wrapper.
	 * Two arguments are passed to the function: the control instance and an update function that can be called if the aggregations change.
	 * @property {object} tool - This object defines hooks that are being called when a tool, e.g. Runtime Adaptation, is started and stopped.
	 * The functions are being called with the control instance as parameter.
	 * @property {function} tool.start - Called when the tool is started
	 * @property {function} tool.stop - Called when the tool is stopped
	 *
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * DesignTime library.
	 *
	 * @namespace
	 * @alias sap.ui.dt
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.30
	 * @private
	 * @ui5-restricted
	 */
	var thisLib = Lib.init({
		name: "sap.ui.dt",
		apiVersion: 2,
		version: "${version}",
		dependencies: ["sap.ui.core"],
		types: [],
		interfaces: [],
		controls: [],
		elements: []
	});

	ManagedObjectMetadata.setDesignTimeDefaultMapping({
		"not-adaptable": "sap/ui/dt/designtime/notAdaptable.designtime",
		"not-adaptable-tree": "sap/ui/dt/designtime/notAdaptableTree.designtime",
		"not-adaptable-visibility": "sap/ui/dt/designtime/notAdaptableVisibility.designtime",
		// legacy, should not be used anymore
		"not-removable": "sap/ui/dt/designtime/notAdaptableVisibility.designtime"
	});

	return thisLib;
});
