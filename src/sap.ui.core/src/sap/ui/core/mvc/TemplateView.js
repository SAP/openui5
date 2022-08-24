/*!
 * ${copyright}
 */

// Provides control sap.ui.core.mvc.TemplateView.
sap.ui.define([
	"./View",
	"./TemplateViewRenderer",
	"./ViewType",
	"sap/base/Log"
],
function(View, TemplateViewRenderer, ViewType, Log) {
"use strict";

	/**
	 * Constructor for a new mvc/TemplateView.
	 *
	 * <strong>Note:</strong> Application code shouldn't call the constructor directly, but rather use the
	 * factory {@link sap.ui.templateview} or {@link sap.ui.core.mvc.View.create View.create} with type
	 * {@link sap.ui.core.mvc.ViewType.Template Template}.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A view defined in a template.
	 * @extends sap.ui.core.mvc.View
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @deprecated Since version 1.56.0, use {@link sap.ui.core.mvc.XMLView} in combination with
	 *             {@link topic:5ee619fc1370463ea674ee04b65ed83b XML Templating} instead.
	 * @alias sap.ui.core.mvc.TemplateView
	 */
	var TemplateView = View.extend("sap.ui.core.mvc.TemplateView", /** @lends sap.ui.core.mvc.TemplateView.prototype */ {
		metadata : {
			library : "sap.ui.core"
		},
		renderer: TemplateViewRenderer
	});

	(function(){

		/**
		 * Defines or creates an instance of a template view.
		 *
		 * The behavior of this method depends on the signature of the call and on the current context.
		 *
		 * <ul>
		 * <li>View Definition <code>sap.ui.templateview(sId, vView)</code>: Defines a view of the given name with the given
		 * implementation. sId must be the views name, vView must be an object and can contain
		 * implementations for any of the hooks provided by templateview</li>
		 * <li>View Instantiation <code>sap.ui.templateview(sId?, vView)</code>: Creates an instance of the view with the given name (and id)</li>.
		 * </ul>
		 *
		 * Any other call signature will lead to a runtime error. If the id is omitted in the second variant, an id will
		 * be created automatically.
		 *
		 * @param {string} [sId] id of the newly created view, only allowed for instance creation
		 * @param {string | object} vView name or implementation of the view.
		 * @public
		 * @static
		 * @return {sap.ui.core.mvc.TemplateView | undefined} the created TemplateView instance in the creation case, otherwise undefined
		 * @deprecated since 1.56 use {@link sap.ui.core.mvc.XMLView} in combination with {@link topic:5ee619fc1370463ea674ee04b65ed83b XML Templating} instead
		 * @ui5-global-only
		 */
		sap.ui.templateview = function(sId, vView) {
			Log.warning("sap.ui.core.mvc.TemplateView is deprecated. Use XMLView or JSView instead.");
			return sap.ui.view(sId, vView, ViewType.Template); // legacy-relevant
		};

		/**
		 * The type of the view used for the <code>sap.ui.view</code> factory
		 * function. This property is used by the parsers to define the specific
		 * view type.
		 * @private
		 */
		TemplateView._sType = ViewType.Template;

		/**
		 * Abstract method implementation. Returns the name of the controller.
		 * @return {string} the name of the set controller. Returns undefined when no controller is set.
		 * @private
		 */
		TemplateView.prototype.getControllerName = function() {
			return this._sControllerName;
		};


		/**
		 * Returns the view URL for a given template name in respect of the module path.
		 *
		 * @param {string} sTemplateName The name of the template
		 * @return {string} the view url
		 * @private
		 * @static
		 */
		TemplateView._getViewUrl = function(sTemplateName) {
			return sap.ui.require.toUrl(sTemplateName.replace(/\./g, "/")) + ".view.tmpl";
		};

		/**
		 * Abstract method implementation.
		 *
		 * @param {object} mSettings settings for the view
		 * @param {object.string} mSettings.viewData view data
		 * @param {object.string} mSettings.viewName view name
		 * @param {object.boolean} [mSettings.async] set the view to load a view resource asynchronously
		 * @see sap.ui.core.mvc.View#initViewSettings
		 *
		 * @private
		 */
		TemplateView.prototype.initViewSettings = function (mSettings) {
			if (!mSettings) {
				throw new Error("mSettings must be given");
			}

			// View template handling - no Tmpl template given
			if (!mSettings.viewName) {
				throw new Error("No view name is given.");
			}

			this._oTemplate = sap.ui.template({
				id: this.getId(),
				src: TemplateView._getViewUrl(mSettings.viewName)
			});
			this._sControllerName = this._oTemplate._sControllerName;
			this._oTemplate = this._oTemplate.createControl(undefined, undefined, this);
			this.addContent(this._oTemplate);
		};

	}());

	return TemplateView;

});