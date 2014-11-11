/*!
 * ${copyright}
 */

// Provides control sap.ui.core.mvc.XMLView.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/DataType', 'sap/ui/core/XMLTemplateProcessor', 'sap/ui/core/library', './View', 'sap/ui/model/resource/ResourceModel', 'jquery.sap.xml'],
	function(jQuery, DataType, XMLTemplateProcessor, library, View, ResourceModel/* , jQuerySap */) {
	"use strict";


	
	/**
	 * Constructor for a new mvc/XMLView.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A View defined using (P)XML and HTML markup.
	 * @extends sap.ui.core.mvc.View
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.core.mvc.XMLView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var XMLView = View.extend("sap.ui.core.mvc.XMLView", /** @lends sap.ui.core.mvc.XMLView.prototype */ { metadata : {
	
		library : "sap.ui.core"
	}});
	
	
	
	
		/**
		 * Instantiates an XMLView of the given name and with the given id.
		 *
		 * The <code>viewName</code> must either correspond to an XML module that can be loaded
		 * via the module system (viewName + suffix ".view.xml") and which defines the view or it must
		 * be a configuration object for a view.
		 * The configuration object can have a viewName, viewContent and a controller property. The viewName
		 * behaves as described above. ViewContent is optional and can hold a view description as XML string or as 
		 * already parsed XML Document. If not given, the view content definition is loaded by the module system.
		 * 
		 * <strong>Note</strong>: if a Document is given, it might be modified during view construction.
		 *   
		 * The controller property can hold an controller instance. If a controller instance is given,
		 * it overrides the controller defined in the view.
		 *
		 * Like with any other control, id is optional and one will be created automatically.
		 *
		 * @param {string} [sId] id of the newly created view
		 * @param {string | object} vView name of the view or a view configuration object as described above.
		 * @param {string} [vView.viewName] name of the view resource in module name notation (without suffix)
		 * @param {string|Document} [vView.viewContent] XML string or XML document that defines the view.
		 * @param {sap.ui.core.mvc.Controller} [vView.controller] Controller instance to be used for this view 
		 * @public
		 * @static
		 * @return {sap.ui.core.mvc.XMLView} the created XMLView instance
		 */
		sap.ui.xmlview = function(sId, vView) {
			return sap.ui.view(sId, vView, sap.ui.core.mvc.ViewType.XML);
		};
	
		/**
		 * The type of the view used for the <code>sap.ui.view</code> factory 
		 * function. This property is used by the parsers to define the specific 
		 * view type.
		 * @private
		 */
		XMLView._sType = sap.ui.core.mvc.ViewType.XML;
		
		XMLView.prototype.initViewSettings = function(mSettings) {
			if (!mSettings) {
				throw new Error("mSettings must be given");
			}
	
			// View template handling - either template name or XML node is given
			if (mSettings.viewName && mSettings.viewContent) {
				throw new Error("View name and view content are given. There is no point in doing this, so please decide.");
			} else if ((mSettings.viewName || mSettings.viewContent) && mSettings.xmlNode) {
				throw new Error("View name/content AND an XML node are given. There is no point in doing this, so please decide.");
			} else if (!(mSettings.viewName || mSettings.viewContent) && !mSettings.xmlNode) {
				throw new Error("Neither view name/content nor an XML node is given. One of them is required.");
			}
	
			if (mSettings.viewName) {
				this._xContent = XMLTemplateProcessor.loadTemplate(mSettings.viewName);
			} else if (mSettings.viewContent) {
				// keep the content as a pseudo property to make cloning work but without supporting mutation
				// TODO model this as a property as soon as write-once-during-init properties become available
				this.mProperties["viewContent"] = mSettings.viewContent;
				this._xContent = jQuery.sap.parseXML(mSettings.viewContent);
				if (this._xContent.parseError.errorCode != 0) {
					var oParseError = this._xContent.parseError;
					throw new Error("The following problem occurred: XML parse Error for " + oParseError.url + " code: " + oParseError.errorCode + " reason: " +
							oParseError.reason +  " src: " + oParseError.srcText + " line: " +  oParseError.line +  " linepos: " + oParseError.linepos +  " filepos: " + oParseError.filepos);
				} else {
					this._xContent = this._xContent.documentElement;
				}
	
			} else if (mSettings.xmlNode) {
				this._xContent = mSettings.xmlNode;
			} // else does not happen, already checked

			//TODO/FIX4MASTER replace once final solution is available
			if (this._xContent.getAttribute("isTemplate") === "true") {
				jQuery.sap.require("sap.ui.core.util.XMLPreprocessor");
				sap.ui.core.util.XMLPreprocessor.process(this._xContent, {
					bindingContexts: mSettings.bindingContexts,
					models: mSettings.models,
					//TODO viewName is not necessarily available, do not use it for error messages
					viewName: mSettings.viewName
				});
			}

			this._oContainingView = mSettings.containingView || this;
	
			// extract the properties of the view from the XML element
			if ( !this.isSubView() ) {
				// for a real XMLView, we need to parse the attributes of the root node
				XMLTemplateProcessor.parseViewAttributes(this._xContent, this, mSettings);
			} else {
				// when used as fragment: prevent connection to controller, only top level XMLView must connect
				delete mSettings.controller;
			}
	
			if ((this._resourceBundleName || this._resourceBundleUrl) && (!mSettings.models || !mSettings.models[this._resourceBundleAlias])) {
				var model = new ResourceModel({bundleName:this._resourceBundleName, bundleUrl:this._resourceBundleUrl, bundleLocale:this._resourceBundleLocale});
				this.setModel(model,this._resourceBundleAlias);
			}
	
			// Delegate for after rendering notification before onAfterRendering of child controls
			var that = this;
			this.oAfterRenderingNotifier = new sap.ui.core.mvc.XMLAfterRenderingNotifier();
			this.oAfterRenderingNotifier.addDelegate({
				onAfterRendering: function() {
					that.onAfterRenderingBeforeChildren();
				}
			});
		};
	
		XMLView.prototype.exit = function() {
			this.oAfterRenderingNotifier.destroy();
			View.prototype.exit.apply(this, arguments);
		};
	
		XMLView.prototype.onControllerConnected = function(oController) {
			var that = this;
			// unset any preprocessors (e.g. from an enclosing JSON view)
			sap.ui.base.ManagedObject.runWithPreprocessors(function() {
				// parse the XML tree
				that._aParsedContent = XMLTemplateProcessor.parseTemplate(that._xContent, that);
			}, {
				settings: this._fnSettingsPreprocessor
			});
		};
	
		XMLView.prototype.getControllerName = function() {
			return this._controllerName;
		};
	
	
		XMLView.prototype.isSubView = function() {
			return this._oContainingView != this;
		};
	
		/**
		 * If the HTML doesn't contain own content, it tries to reproduce existing content
		 * This is executed before the onAfterRendering of the child controls, to ensure that
		 * the HTML is already at its final position, before additional operations are executed.
		 */
		XMLView.prototype.onAfterRenderingBeforeChildren = function() {
	
			if ( this._$oldContent.length !== 0 ) {
				// jQuery.sap.log.debug("after rendering for " + this);
	
				// move DOM of children into correct place in preserved DOM
				var aChildren = this.getAggregation("content");
				if ( aChildren ) {
					for (var i = 0; i < aChildren.length; i++) {
						if (aChildren[i].getDomRef() === null) {
							// Do not replace if there is no dom to replace it with...
							continue;
						}
						var $childDOM = aChildren[i].$();
						// jQuery.sap.log.debug("replacing placeholder for " + aChildren[i] + " with content");
						jQuery.sap.byId(sap.ui.core.RenderPrefixes.Dummy + aChildren[i].getId(), this._$oldContent).replaceWith($childDOM);
					}
				}
				// move preserved DOM into place
				// jQuery.sap.log.debug("moving preserved dom into place for " + this);
				jQuery.sap.byId(sap.ui.core.RenderPrefixes.Dummy + this.getId()).replaceWith(this._$oldContent);
			}
			this._$oldContent = undefined;
		};
		
		XMLView.prototype._onChildRerenderedEmpty = function(oControl, oElement) {
			// when the render manager notifies us about an empty child rendering, we replace the old DOM with a dummy
			jQuery(oElement).replaceWith('<div id="' + sap.ui.core.RenderPrefixes.Dummy + oControl.getId() + '" class="sapUiHidden"/>');
			return true; // indicates that we have taken care
		};

		/**
		 * Dummy control for after rendering notification before onAfterRendering of
		 * child controls of the XMLView is called
		 */
		sap.ui.core.Control.extend("sap.ui.core.mvc.XMLAfterRenderingNotifier", {
			renderer: function(oRM, oControl) {
				oRM.write(""); // onAfterRendering is only called if control produces output
			}
		});
	
	
	

	return XMLView;

}, /* bExport= */ true);
