/*!
 * ${copyright}
 */

/**
 * This class provides the possibility to declare the "view" part of a composite control
 * in an XML fragment which will automatically define the rendering accordingly.
 *
 * <b>Note:</b> If you use aggregation forwarding with <code>idSuffix</<code> as defined
 * in {@link sap.ui.base.ManagedObject ManagedObject} and refer to IDs defined in the XML fragment
 * of the XML composite control, then these types of <code>idSuffix</<code> have the form
 * "--ID" where ID is the ID that you have defined in the XML fragment.
 *
 */
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/core/Control',
	'sap/ui/core/XMLCompositeMetadata',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/Fragment',
	'sap/ui/base/ManagedObject',
	'sap/ui/base/DataType',
	'sap/ui/model/resource/ResourceModel',
	'sap/base/Log',
	'sap/ui/performance/Measurement'
],
	function(
		jQuery,
		Control,
		XMLCompositeMetadata,
		ManagedObjectModel,
		JSONModel,
		Fragment,
		ManagedObject,
		DataType,
		ResourceModel,
		Log,
		Measurement
	) {
		"use strict";

		// private functions
		var sXMLComposite = "sap.ui.core.XMLComposite";

		/**
		 * XMLComposite is the base class for composite controls that use a XML fragment representation
		 * for their visual parts. From a user perspective such controls appear as any other control, but internally the
		 * rendering part is added as a fragment.
		 * The fragment that is used should appear in the same folder as the control's JS implementation with the file extension
		 * <code>.control.xml</code>.
		 * The fragment's content can access the interface data from the XMLComposite control via bindings. Currently only aggregations and properties
		 * can be used with bindings inside a fragment.
		 * The exposed model that is used for internal bindings in the fragment has the default name <code>$this</code>. The name will always start
		 * with an <code>$</code>. The metadata of the derived control can define the alias with its metadata. A code example can be found below.
		 *
		 * As XMLComposites compose other controls, they are only invalidated and re-rendered if explicitly defined. Additional metadata
		 * for invalidation can be given for properties and aggregation. The default invalidation is <code>"none"</code>.
		 * Setting invalidate to <code>true</code> for properties and aggregations sets the complete XMLComposite
		 * to invalidate and rerender.</code>
		 *
		 * Example:
		 * <pre>
		 * XMLComposite.extend("sap.mylib.MyXMLComposite", {
		 *   metadata : {
		 *     library: "sap.mylib",
		 *     properties : {
		 *       text: { //changing this property will not re-render the XMLComposite
		 *          type: "string",
		 *          defaultValue: ""
		 *       },
		 *       title: { //changing this property will re-render the XMLComposite as it defines invalidate: true
		 *          type: "string",
		 *          defaultValue: "",
		 *          invalidate: true
		 *       },
		 *       value: { //changing this property will re-render the XMLComposite as it defines invalidate: true
		 *          type: "string",
		 *          defaultValue: "",
		 *          invalidate: true
		 *       }
		 *     },
		 *     defaultProperty : "text",
		 *     aggregations : {
		 *       items : {
		 *          type: "sap.ui.core.Control",
		 *          invalidate: true
		 *       },
		 *       header : {
		 *          type: "sap.mylib.FancyHeader",
		 *          multiple : false
		 *       }
		 *     },
		 *     defaultAggregation : "items"
		 *     events: {
		 *       outerEvent : {
		 *         parameters : {
		 *           opener : "sap.ui.core.Control"
		 *         }
		 *       }
		 *     }
		 *   },
		 *   //alias defaults to "this"
		 *   alias: "mycontrolroot" //inner bindings will use model name $mycontrolroot
		 *   //fragment defaults to {control name}.control.xml in this case sap.mylib.MyXMLComposite.control.xml
		 *   fragment: "sap.mylib.MyXMLCompositeOther.control.xml" //the name of the fragment
		 * });
		 * </pre>
		 *
		 * Internally the XMLComposite instantiates and initializes the given fragment and stores the resulting control in a hidden
		 * aggregation named <code>_content</code>. The fragment should only include one root element.
		 *
		 * Bindings of inner controls to the interface of the XMLComposite can be done with normal binding syntax.
		 * Here properties are used as property bindings and aggregations are used as list bindings.
		 * Currently it is not possible to bind associations in a fragment.
		 *
		 * Example:
		 * <pre>
		 *    &lt;core:FragmentDefinition xmlns:m="sap.m" xmlns:core="sap.ui.core"&gt;
		 *       &lt;m:Text text="{$this&gt;text}" visible="{= ${$this&gt;text} !== ""}" /&gt;
		 *    &lt;/core:FragmentDefinition&gt;
		 * </pre>
		 * <pre>
		 *    &lt;core:FragmentDefinition xmlns:m="sap.m" xmlns:core="sap.ui.core"&gt;
		 *       &lt;m:VBox items="{path:"$this&gt;texts", filters:{path:"text", operator:"Contains", value1:"Text"}, sorter:{path:"text", descending:true}}"&gt;
		 *           &lt;m:Text text="{$this&gt;text}" /&gt;
		 *       &lt;/m:VBox&gt;
		 *    &lt;/core:FragmentDefinition&gt;
		 * </pre>
		 * <pre>
		 *    &lt;core:FragmentDefinition xmlns:m="sap.m" xmlns:core="sap.ui.core"&gt;
		 *       &lt;m:Button text="Press Me" press="handlePress"/&gt;
		 *    &lt;/core:FragmentDefinition&gt;
		 * </pre>
		 *
		 * All events handled within the fragment will be dispatched to the XMLComposite control. It is recommended to follow this paradigm to allow
		 * reuse of a XMLComposite without any dependency to controller code of the current embedding view.
		 *
		 * <pre>
		 *    MyXMLComposite.prototype.handlePress = function() {
		 *        this.fireOuterEvent(); // passing on the event to the outer view
		 *    }
		 * </pre>
		 *
		 * @see sap.ui.core.Control
		 * @see sap.ui.core.Fragment
		 *
		 * @class Base Class for XMLComposite controls.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.56.0
		 * @alias sap.ui.core.XMLComposite
		 * @see {@link topic:b83a4dcb7d0e46969027345b8d32fd44 XML Composite Controls}
		 *
		 * @abstract
		   * @public
		 * @experimental Since 1.56.0
		 */
		var XMLComposite = Control.extend("sap.ui.core.XMLComposite", {
			metadata: {
				interfaces: ["sap.ui.core.IDScope"],
				properties: {
					/**
					 * The width
					 */
					width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: '100%', invalidate: true },

					/**
					 * The height
					 */
					height: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null, invalidate: true },

					/**
					 * Whether the CSS display should be set to "block".
					 */
					displayBlock: { type: "boolean", group: "Appearance", defaultValue: true, invalidate: true }
				},
				aggregations: {
					/**
					 * Aggregation used to store the default content
					 * @private
					 */
					_content: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden",
						invalidate: true
					}
				}
			},
			constructor : function() {
				this._bIsCreating = true;
				Control.apply(this, arguments);
				delete this._bIsCreating;
			},
			renderer: function (oRm, oControl) {
				Log.debug("Start rendering '" + oControl.sId, sXMLComposite);
				Measurement.start(oControl.getId() + "---renderControl","Rendering of " + oControl.getMetadata().getName(), ["rendering","control"]);
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.writeAccessibilityState(oControl);

				// compare ViewRenderer.js - we negate since opposite default
				if (!oControl.getDisplayBlock() && (oControl.getWidth() !== "100%" || oControl.getHeight() !== "100%")) {
					oRm.addStyle("display", "inline-block");
				}
				oRm.writeClasses(); // to make class="..." in XMLViews and addStyleClass() work

				// add inline styles
				if (oControl.getHeight()) {
					oRm.addStyle("height", oControl.getHeight());
				}
				if (oControl.getWidth()) {
					oRm.addStyle("width", oControl.getWidth());
				}
				oRm.writeStyles();

				oRm.write(">");

				// render the content
				var oContent = oControl._renderingContent ? oControl._renderingContent() : oControl._getCompositeAggregation();
				if (oContent) {
					oRm.renderControl(oContent);
				}
				oRm.write("</div>");
				Measurement.end(oControl.getId() + "---renderControl");
				Log.debug("Stop rendering '" + oControl.sId, sXMLComposite);
			}
		}, XMLCompositeMetadata);

		/**
		 * Returns an element by its ID in the context of the XMLComposite.
		 *
		 * May only be used by the implementation of a specific XMLComposite, not by an application using a XMLComposite.
		 *
		 * @param {string} sId XMLComposite-local ID of the inner element
		 * @returns {sap.ui.core.Element} element by its ID or <code>undefined</code>
		 * @protected
		 */
		XMLComposite.prototype.byId = function (sId) {
			return sap.ui.getCore().byId(Fragment.createId(this.getId(), sId));
		};

		/**
		 * Returns the managed object model of the XMLComposite control
		 *
		 * @returns {sap.ui.model.base.ManagedObjectModel} the managed object model of the XMLComposite control
		 *
		 * @private
		 */
		XMLComposite.prototype._getManagedObjectModel = function () {
			if (!this._oManagedObjectModel) {
				this._oManagedObjectModel = new ManagedObjectModel(this);
			}
			return this._oManagedObjectModel;
		};

		/**
		 * Checks whether invalidation should be suppressed for the given aggregations
		 * Suppressing an aggregation update will only lead to rendering of the changed subtree
		 *
		 * @param {string} sName the name of the aggregation to check
		 * @param {boolean} [bSuppressInvalidate] the requested invalidation or undefined
		 *
		 * @private
		 *
		 */
		XMLComposite.prototype.getSuppressInvalidateAggregation = function (sName, bSuppressInvalidate) {
			var oMetadata = this.getMetadata(),
				oAggregation = oMetadata.getAggregation(sName) || oMetadata.getAllPrivateAggregations()[sName];
			if (!oAggregation) {
				return true;
			}
			bSuppressInvalidate = oMetadata._suppressInvalidate(oAggregation, bSuppressInvalidate);
			return bSuppressInvalidate;
		};

		/**
		 * @see sap.ui.core.Control#setProperty
		 */
		XMLComposite.prototype.setProperty = function (sName, oValue, bSuppressInvalidate) {
			var oMetadata = this.getMetadata(),
				oProperty = oMetadata.getManagedProperty(sName);
			if (!oProperty) {
				return this;
			}
			bSuppressInvalidate = oMetadata._suppressInvalidate(oProperty, bSuppressInvalidate);
			return Control.prototype.setProperty.apply(this, [sName, oValue, bSuppressInvalidate]);
		};

		/**
		 * @see sap.ui.core.Control#setAggregation
		 */
		XMLComposite.prototype.setAggregation = function (sName, oObject, bSuppressInvalidate) {
			return Control.prototype.setAggregation.apply(this, [sName, oObject, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
		};

		/**
		 * @see sap.ui.core.Control#addAggregation
		 */
		XMLComposite.prototype.addAggregation = function (sName, oObject, bSuppressInvalidate) {
			return Control.prototype.addAggregation.apply(this, [sName, oObject, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
		};

		/**
		 * @see sap.ui.core.Control#unbindAggregation
		 */
		XMLComposite.prototype.insertAggregation = function (sName, oObject, iIndex, bSuppressInvalidate) {
			return Control.prototype.insertAggregation.apply(this, [sName, oObject, iIndex, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
		};
		/**
		 * sap.ui.core.Control#removeAggregation
		 */
		XMLComposite.prototype.removeAggregation = function (sName, oObject, bSuppressInvalidate) {
			return Control.prototype.removeAggregation.apply(this, [sName, oObject, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
		};

		/**
		 * @see sap.ui.core.Control#removeAllAggregation
		 */
		XMLComposite.prototype.removeAllAggregation = function (sName, bSuppressInvalidate) {
			return Control.prototype.removeAllAggregation.apply(this, [sName, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
		};

		/**
		 * @see sap.ui.core.Control#destroyAggregation
		 */
		XMLComposite.prototype.destroyAggregation = function (sName, bSuppressInvalidate) {
			return Control.prototype.destroyAggregation.apply(this, [sName, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
		};

		/**
		 * @see sap.ui.core.Control#updateAggregation
		 */
		XMLComposite.prototype.updateAggregation = function (sName, bSuppressInvalidate) {
			var oAggregation = this.getMetadata().getAggregation(sName);
			if (oAggregation && oAggregation.type === "TemplateMetadataContext") {
				this.invalidate();
				return;
			}
			Control.prototype.updateAggregation.apply(this, arguments);
		};

		/**
		 * @see sap.ui.core.Control#setVisible
		 */
		XMLComposite.prototype.setVisible = function (bVisible) {
			this.setProperty("visible", bVisible);
			if (this.getParent()) {
				// TODO: is this correct ?
				this.getParent().invalidate();
			}
			return this;
		};

		/**
		 * Destroys the internal composite aggregation
		 *
		 * @returns {sap.ui.core.XMLComposite} Returns <code>this</code> to allow method chaining
		 *
		 * @private
		 */
		XMLComposite.prototype._destroyCompositeAggregation = function () {
			var oContent = this._getCompositeAggregation();
			if (oContent) {
				oContent.destroy("KeepDom");
			}
			return this;
		};

		/**
		 * Whenever bindings are updated the corresponding aggregations need to be destroyed,
		 * otherwise the managed object tree is not updating the proxy object in the inner managed object tree.
		 */
		XMLComposite.prototype.updateBindings = function () {
			if (this._bIsCreating) {
				return;
			}
			var oResult = Control.prototype.updateBindings.apply(this, arguments);
			for (var n in this.mBindingInfos) {
				var oAggregation = this.getMetadata().getAggregation(n);
				if (oAggregation &&
					oAggregation.multiple &&
					!oAggregation._doesNotRequireFactory &&
					this.isBound(n) &&
					!this.getBinding(n)) {
					this[oAggregation._sDestructor]();
				}
			}
			return oResult;
		};

		/**
		 * Returns the composite aggregation
		 */
		XMLComposite.prototype._getCompositeAggregation = function () {
			var sCompositeName = this.getMetadata().getCompositeAggregationName();
			return this.getAggregation(sCompositeName);
		};

		/**
		 * Sets the internal composite aggregation
		 *
		 * @returns {sap.ui.core.XMLComposite} Returns <code>this</code> to allow method chaining
		 *
		 * @private
		 */
		XMLComposite.prototype._setCompositeAggregation = function (oNewContent) {
			var sCompositeName = this.getMetadata().getCompositeAggregationName();
			this._destroyCompositeAggregation();
			if (!this._oManagedObjectModel) {
				this._getManagedObjectModel();
			}
			if (Array.isArray(oNewContent)) {
				this.setAggregation(sCompositeName, null);
				return;
			}
			if (oNewContent) {
				//accessibility
				if (!oNewContent.enhanceAccessibilityState) {
					oNewContent.enhanceAccessibilityState = function(oElement, mAriaProps) {
						this.enhanceAccessibilityState(oElement, mAriaProps);
					}.bind(this);
				}
				oNewContent.bindObject("$" + this.alias + ">/");//first define the context
				oNewContent.setModel(this._oManagedObjectModel, "$" + this.alias);//then set the model

				if (this.bUsesI18n) {
					var oResourceModel = this._getResourceModel();
					if (oResourceModel) {
						oNewContent.setModel(oResourceModel, "$" + this.alias + ".i18n");
					}
				}
			}
			this.setAggregation(sCompositeName, oNewContent);
		};

		/**
		* Already loaded resource models keyed by library. The key in the map is always libraryName + ".messagebundle"
		* @private
		* @see getLibraryResourceModel
		*/
		XMLComposite.mResourceModels = {};

		XMLComposite.getLibraryResourceModel = function (sLibraryName) {
			var oLibraryResourceModel = XMLComposite.mResourceModels[sLibraryName];
			if (!oLibraryResourceModel) {
				oLibraryResourceModel = new ResourceModel({ bundleName: sLibraryName + ".messagebundle", async: true });
				XMLComposite.mResourceModels[sLibraryName] = oLibraryResourceModel;
			}
			return oLibraryResourceModel;
		};

		/**
		 * if a messageBundle is specified from outside we rely on this, otherwise we take the library bundle
		 *
		 * @returns: undefined if no model can be found
		 *
		 * @private
		 */
		XMLComposite.prototype._getResourceModel = function () {
			if (this.resourceModel) {
				return this.resourceModel;
			}
			if (this.messageBundle) {
				// was set a bundle name from outside - in this case the control will get its own resourceModel
				this.resourceModel = new ResourceModel({ bundleName: this.messageBundle, async: true });
				return this.resourceModel;
			} else {
				// we rely on the library bundle
				this.sLibraryName = this.sLibraryName || this.getMetadata().getLibraryName();
				if (this.sLibraryName) {
					return XMLComposite.getLibraryResourceModel(this.sLibraryName);
				}
			}
		};

		/**
		 * Returns the resource bundle of the resource model
		 *
		 * Sample: this.getResourceBundle().then(function(oBundle) {oBundle.getText(<messagebundle_key>)})
		 *
		 * @returns {jQuery.sap.util.ResourceBundle|Promise} loaded resource bundle or ECMA Script 6 Promise in asynchronous case
		 *
		 * @public
		 */
		XMLComposite.prototype.getResourceBundle = function () {
			var oResourceModel = this._getResourceModel();
			return oResourceModel ? oResourceModel.getResourceBundle() : null;
		};

		XMLComposite.prototype.destroy = function () {
			Control.prototype.destroy.apply(this, arguments);
			if (this.resourceModel) {
				this.resourceModel.destroy();
			}

			if (this._oManagedObjectModel) {
				this._oManagedObjectModel.destroy();
			}
		};

		/**
		 * Initializes composite support with the given settings
		 * @param {map} mSettings the map of settings
		 *
		 * @private
		 */
		XMLComposite.prototype._initCompositeSupport = function (mSettings) {
			var oMetadata = this.getMetadata(),
			oFragmentContent = oMetadata._fragment,
			sAggregationName = oMetadata.getCompositeAggregationName();

			this._destroyCompositeAggregation();

			//identify the _fragmentContent the new template wins
			if (mSettings && sAggregationName && mSettings[sAggregationName]) {//or from the settings
				var oNode = mSettings[sAggregationName];
				if (oNode.localName === "FragmentDefinition") {//should be always the case
					oFragmentContent = oNode;
					delete mSettings[sAggregationName];
				}
			}

			var sFragment = oFragmentContent ? (new XMLSerializer()).serializeToString(oFragmentContent) : undefined;
			this.bUsesI18n = sFragment ? (sFragment.indexOf("$" + this.alias + ".i18n") != -1) : true;

			this._setCompositeAggregation(sap.ui.xmlfragment({
				sId: this.getId(),
				fragmentContent: oFragmentContent,
				oController: this
			}));

			this._bIsInitialized = true;
		};

		/**
		 * This method is a hook for the RenderManager that gets called
		 * during the rendering of child Controls. It allows to add,
		 * remove and update existing accessibility attributes (ARIA) of
		 * those controls.
		 *
		 * @param {sap.ui.core.Control} oElement - The Control that gets rendered by the RenderManager
		 * @param {Object} mAriaProps - The mapping of "aria-" prefixed attributes
		 * @protected
		 */
		XMLComposite.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {
			var oParent = this.getParent();

			if (oParent && oParent.enhanceAccessibilityState) {
				// use XMLComposite as control, but aria properties of rendered inner controls.
				return oParent.enhanceAccessibilityState(this, mAriaProps);
			}

			return mAriaProps;
		};

		/**
		 * Return the focus DOM Reference for accessibility
		 */
		XMLComposite.prototype.getFocusDomRef = function() {
			var oContent = this._renderingContent ? this._renderingContent() : this._getCompositeAggregation();
			return oContent.getFocusDomRef();
		};

		/**
		 * Return the focus DOM Reference for accessibility
		 */
		XMLComposite.prototype.getFocusInfo = function() {
			var oContent = this._renderingContent ? this._renderingContent() : this._getCompositeAggregation();
			return oContent.getFocusInfo();
		};

		/**
		 * Return the id the label control should point to, ideally the rendering content
		 */
		XMLComposite.prototype.getIdForLabel = function() {
			var oContent = this._renderingContent ? this._renderingContent() : this._getCompositeAggregation();
			return oContent.getIdForLabel();
		};

		return XMLComposite;
});