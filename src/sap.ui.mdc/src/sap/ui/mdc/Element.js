/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/mdc/mixin/DelegateMixin",
	"sap/ui/mdc/mixin/PropertyHelperMixin",
	"sap/ui/mdc/mixin/AdaptationMixin"
], (CoreElement, DelegateMixin, PropertyHelperMixin, AdaptationMixin) => {
	"use strict";

	/**
	 * Creates and initializes a new element with the given <code>sId</code> and settings.
	 *
	 * @param {string} [sId] Optional ID for the new element; generated automatically if no non-empty ID is given
	 *      <b>Note:</b> This can be omitted, no matter whether <code>mSettings</code> is given.
	 * @param {object} [mSettings] Object with initial settings for the new control
	 *
	 * @class The base class for composite elements in the <code>sap.ui.mdc</code> library providing delegate-related functionality (see {@link sap.ui.mdc.mixin.DelegateMixin}).
	 *
	 * @extends sap.ui.core.Element
	 * @abstract
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.Element
	 *
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.awaitControlDelegate as #awaitControlDelegate
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.getControlDelegate as #getControlDelegate
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.getPayload as #getPayload
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.getTypeUtil as #getTypeUtil
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.getTypeMap as #getTypeMap
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.initControlDelegate as #initControlDelegate
	 *
	 * @borrows sap.ui.mdc.mixin.PropertyHelperMixin.initPropertyHelper as #initPropertyHelper
	 * @borrows sap.ui.mdc.mixin.PropertyHelperMixin.awaitPropertyHelper as #awaitPropertyHelper
	 * @borrows sap.ui.mdc.mixin.PropertyHelperMixin.getPropertyHelper as #getPropertyHelper
	 * @borrows sap.ui.mdc.mixin.PropertyHelperMixin.finalizePropertyHelper as #finalizePropertyHelper
	 * @borrows sap.ui.mdc.mixin.PropertyHelperMixin.isPropertyHelperFinal as #isPropertyHelperFinal
	 *
	 * @borrows sap.ui.mdc.mixin.AdaptationMixin.getEngine as #getInstance
	 * @borrows sap.ui.mdc.mixin.AdaptationMixin.retrieveInbuiltFilter as #retrieveInbuiltFilter
	 * @borrows sap.ui.mdc.mixin.AdaptationMixin.getInbuiltFilter as #getInbuiltFilter
	 *
	 * @since 1.74
	 * @public
	 */
	const Element = CoreElement.extend("sap.ui.mdc.Element", /** @lends sap.ui.mdc.Element.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
				 * The object has the following properties:
				 * <ul>
				 * 	<li><code>name</code> defines the path to the <code>Delegate</code> module</li>
				 * 	<li><code>payload</code> (optional) defines application-specific information that can be used in the given delegate</li>
				 * </ul>
				 * <i>Sample delegate object:</i>
				 * <pre><code>{
				 * 	name: "sap/ui/mdc/BaseDelegate",
				 * 	payload: {}
				 * }</code></pre>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. This property can only be configured during control initialization.
				 */
				delegate: {
					type: "object",
					group: "Data"
				}
			}
		},
		renderer: CoreElement.renderer
	});

	DelegateMixin.call(Element.prototype);
	AdaptationMixin.call(Element.prototype);
	PropertyHelperMixin.call(Element.prototype);

	/**
	 * @name sap.ui.mdc.Element#setDelegate
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * @name sap.ui.mdc.Element#getDelegate
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */

	return Element;
});