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
	'jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/XMLCompositeMetadata', 'sap/ui/model/base/ManagedObjectModel', 'sap/ui/core/util/XMLPreprocessor',
	'sap/ui/model/json/JSONModel', 'sap/ui/core/Fragment', 'sap/ui/base/ManagedObject', 'sap/ui/base/DataType', 'sap/ui/model/base/XMLNodeAttributesModel', 'sap/ui/core/util/reflection/XmlTreeModifier', 'sap/ui/model/resource/ResourceModel', 'sap/ui/model/base/XMLNodeUtils'],
	function (jQuery, Control, XMLCompositeMetadata, ManagedObjectModel, XMLPreprocessor, JSONModel, Fragment, ManagedObject, DataType, XMLNodeAttributesModel, XmlTreeModifier, ResourceModel, Utils) {
		"use strict";

		// private functions
		var mControlImplementations = {};

		function initXMLComposite(sFragment, oFragmentContext) {
			if (!mControlImplementations[sFragment]) {
				jQuery.sap.require(sFragment);
				mControlImplementations[sFragment] = jQuery.sap.getObject(sFragment);
			}
			return mControlImplementations[sFragment];
		}

		function parseScalarType(sType, sValue, sName, oController) {
			// check for a binding expression (string)
			var oBindingInfo = ManagedObject.bindingParser(sValue, oController, true);
			if (oBindingInfo && typeof oBindingInfo === "object") {
				return oBindingInfo;
			}

			var vValue = sValue = oBindingInfo || sValue;// oBindingInfo could be an unescaped string
			var oType = DataType.getType(sType);
			if (oType) {
				if (oType instanceof DataType) {
					vValue = oType.parseValue(sValue);
				}
				// else keep original sValue (e.g. for enums)
			} else {
				throw new Error("Property " + sName + " has unknown type " + sType);
			}

			// Note: to avoid double resolution of binding expressions, we have to escape string values once again
			return typeof vValue === "string" ? ManagedObject.bindingParser.escape(vValue) : vValue;
		}

		function addAttributesContext(mContexts, sName, oElement, oImpl, oVisitor) {
			var oAttributesModel = new JSONModel(oElement), oMetadata = oImpl.getMetadata(), mAggregations = oMetadata.getAllAggregations(), mProperties = oMetadata.getAllProperties(), mSpecialSettings = oMetadata._mAllSpecialSettings;

			oAttributesModel.getVisitor = function () {
				return oVisitor;
			};

			oAttributesModel._getObject = function (sPath, oContext) {
				var oResult;
				sPath = this.resolve(sPath, oContext);
				sPath = sPath.substring(1);
				var aPath = sPath.split("/");

				if (sPath && sPath.startsWith && sPath.startsWith("metadataContexts")) {
					return this._navInMetadataContexts(sPath);// note as metadataContexts is an object the path can be deep
				}

				if (mProperties.hasOwnProperty(sPath)) {
					// get a property
					var oProperty = mProperties[sPath];
					if (!oElement.hasAttribute(sPath)) {
						return oProperty.defaultValue;
					}
					// try to resolve a result from templating time or keep the original value
					oResult = oVisitor.getResult(oElement.getAttribute(sPath)) || oElement.getAttribute(sPath);
					if (oResult) {
						var oScalar = parseScalarType(oProperty.type, oResult, sPath);
						if (typeof oScalar === "object" && oScalar.path) {
							return oResult;
						}
						return oScalar;
					}
					return null;

				} else if (mAggregations.hasOwnProperty(aPath[0])) {
					var oAggregation = mAggregations[aPath[0]];
					var oAggregationModel, oContent = XmlTreeModifier.getAggregation(oElement, aPath[0]);
					if (!oContent) {
						return null;
					}

					if (oAggregation.multiple) {
						// return a list of context
						var aContexts = [];
						for (var i = 0; i < oContent.length; i++) {
							oAggregationModel = new XMLNodeAttributesModel(oContent[i], oVisitor, "");
							aContexts.push(oAggregationModel.getContext("/"));
						}

						oResult = aContexts;
					} else {
						oAggregationModel = new XMLNodeAttributesModel(oContent, oVisitor, "");
						oResult = oAggregationModel.getContext("/");
					}

					aPath.shift();
					return this._getNode(aPath, oResult);
				} else if (mSpecialSettings.hasOwnProperty(sPath)) {
					var oSpecialSetting = mSpecialSettings[sPath];

					if (!oElement.hasAttribute(sPath)) {
						return oSpecialSetting.defaultValue || null;
					}

					oResult = oVisitor.getResult(oElement.getAttribute(sPath));

					if (oSpecialSetting.type) {
						var oScalar = parseScalarType(oSpecialSetting.type, oResult, sPath);
						if (typeof oScalar === "object" && oScalar.path) {
							return oResult;
						}
						return oScalar;
					}

					if (oResult) {
						return oResult;
					}
					return oElement.getAttribute(sPath);
				}
			};

			oAttributesModel._navInMetadataContexts = function (sPath) {
				var sRemainPath = sPath.replace("metadataContexts", "");
				var aPath = sRemainPath.split("/"), vNode = mContexts["metadataContexts"].getObject();

				aPath.shift();
				return this._getNode(aPath, vNode);
			};

			oAttributesModel._getNode = function (aPath, vNode) {
				var oResult = null, sInnerPath;

				while (aPath.length > 0 && vNode) {

					if (vNode.getObject) {
						// try to nav deep
						oResult = vNode.getObject(aPath.join("/"));
					}

					if (!oResult) {
						sInnerPath = aPath.shift();
						vNode = vNode[sInnerPath];
					} else {
						return oResult;
					}
				}

				return vNode;
			};

			oAttributesModel.getContextName = function () {
				return sName;
			};

			mContexts[sName] = oAttributesModel.getContext("/");
			if (mContexts["metadataContexts"]) {
				// make attributes model available via metadataContexts
				mContexts["metadataContexts"].oModel.setProperty("/" + sName, mContexts[sName]);
			}
		}

		function addViewContext(mContexts, oVisitor) {
			var oViewModel = new JSONModel(oVisitor.getViewInfo());
			mContexts["$view"] = oViewModel.getContext("/");
		}

		function addSingleContext(mContexts, oVisitor, oCtx, oMetadataContexts, sDefaultMetaModel) {
			oCtx.model = oCtx.model || sDefaultMetaModel;

			var sKey = oCtx.name || oCtx.model || undefined;

			if (oMetadataContexts[sKey]) {
				return; // do not add twice
			}
			try {
				mContexts[sKey] = oVisitor.getContext(oCtx.model + ">" + oCtx.path);// add the context to the visitor
				oMetadataContexts[sKey] = mContexts[sKey];// make it available inside metadataContexts JSON object
			} catch (ex) {
				// ignore the context as this can only be the case if the model is not ready, i.e. not a preprocessing model but maybe a model for
				// providing afterwards
				mContexts["_$error"].oModel.setProperty("/" + sKey, ex);
			}
		}

		function addMetadataContexts(mContexts, oVisitor, sMetadataContexts, sDefaultMetadataContexts, sDefaultMetaModel) {
			if (!sMetadataContexts && !sDefaultMetadataContexts) {
				return;
			}

			var oMetadataContexts = sMetadataContexts ? ManagedObject.bindingParser(sMetadataContexts) : { parts: [] };
			var oDefaultMetadataContexts = sDefaultMetadataContexts ? ManagedObject.bindingParser(sDefaultMetadataContexts) : { parts: [] };

			if (!oDefaultMetadataContexts.parts) {
				oDefaultMetadataContexts = { parts: [oDefaultMetadataContexts] };
			}

			if (!oMetadataContexts.parts) {
				oMetadataContexts = { parts: [oMetadataContexts] };
			}

			// merge the arrays
			jQuery.merge(oMetadataContexts.parts, oDefaultMetadataContexts.parts);

			// extend the contexts from metadataContexts
			for (var j = 0; j < oMetadataContexts.parts.length; j++) {
				addSingleContext(mContexts, oVisitor, oMetadataContexts.parts[j], oMetadataContexts, sDefaultMetaModel);
				// Make sure every previously defined context can be used in the next binding
				oVisitor = oVisitor["with"](mContexts, false);
			}

			var oMdCModel = new JSONModel(oMetadataContexts);

			// make metadataContext accessible
			mContexts["metadataContexts"] = oMdCModel.getContext("/");

		}

		// TODO: be more specific about what is returned; at the moment we would return
		// also e.g. models which are not specifically defined on the composite control
		// but are propagated from outside of it. Ideally, we would only return
		// settings which are specifically defined on the XMLComposite !
		function getSettings(oPropagates) {
			var oSettings = {};
			oSettings.models = oPropagates.oModels || {};
			oSettings.bindingContexts = oPropagates.oBindingContexts || {};
			return oSettings;
		}

		function templateAggregations(oParent, oMetadata, oContextVisitor) {
			var aAggregationFragments = oMetadata._aggregationFragments,
				sLibrary = oMetadata.getLibraryName(),
				bCheckMultiple;
			if (aAggregationFragments) {
				Object.keys(aAggregationFragments).forEach(function (sAggregationName) {
					var oAggregation = oMetadata.getAggregation(sAggregationName);

					if (!oAggregation) {
						return true;
					}
					//check if there are user defined aggregations
					var oAggregationRoot = oParent.getElementsByTagNameNS(sLibrary, sAggregationName)[0];
					if (!oAggregationRoot) {
						oAggregationRoot = document.createElementNS(sLibrary, sAggregationName);
						oParent.appendChild(oAggregationRoot);
						bCheckMultiple = false;
					} else {
						bCheckMultiple = true;
					}

					if (bCheckMultiple && !oAggregation.multiple) {
						return true;// in case the user defined own content this shall win
					}

					var oAggregationFragment = aAggregationFragments[sAggregationName].cloneNode(true);
					// resolve templating in composite aggregation fragment
					oContextVisitor.visitChildNodes(oAggregationFragment);
					var aAggregationNodes = Utils.getChildren(oAggregationFragment);
					var id = oParent.getAttribute("id");

					// add the templated content
					for (var j = 0; j < aAggregationNodes.length; j++) {
						if (aAggregationNodes[j].getAttribute("id")) {
							aAggregationNodes[j].setAttribute("id", Fragment.createId(id, aAggregationNodes[j].getAttribute("id")));//adapt Aggregation ids
						}
						oAggregationRoot.appendChild(aAggregationNodes[j]);
					}
				});
			}
		}

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
						visibility: "hidden"
					}
				}
			},
			constructor : function(sId, mSettings) {
				this._bIsCreating = true;

				Control.apply(this,arguments);
				delete this._bIsCreating;
				if (this.getMetadata().usesTemplating() && !this._bIsInitialized) {
					//for the case the template is written against the ManagedObjectModel a templating before
					//creating was not possible so we have to retemplate against the Managed Object model
					this.requestFragmentRetemplating();
					delete this._bIsInitialized;
				}
			},
			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.writeControlData(oControl);

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
				var oContent = oControl.getAggregation(oControl.getMetadata().getCompositeAggregationName());
				if (oContent) {
					oRm.renderControl(oContent);
				}
				oRm.write("</div>");
			}
		}, XMLCompositeMetadata);

		XMLComposite.prototype.clone = function () {
			var oClone = ManagedObject.prototype.clone.apply(this, arguments);
			var aEvents, i, oContent = oClone.get_content();
			if (oContent) {
				//while cloning the children are also cloned which may yield in case the children
				//use the composite as event handler that the clones use the template this is fixed here
				for (var sEvent in oContent.mEventRegistry) {
					aEvents = oContent.mEventRegistry[sEvent];
					for (var i = 0; i < aEvents.length; i++) {
						if (aEvents[i].oListener == this) {
							aEvents[i].oListener = oClone;
						}
					}
				}
			}
			//also if the compisite is clone when already having children the propagated models are so far not set
			//fix that
			oClone.oPropagatedProperties = this.oPropagatedProperties;
			return oClone;
		};

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
			oMetadata._requestFragmentRetemplatingCheck(this, oAggregation);
			return bSuppressInvalidate;
		};

		/**
		 * @see sap.ui.core.Control#setProperty
		 */
		XMLComposite.prototype.setProperty = function (sName, oValue, bSuppressInvalidate) {
			var oMetadata = this.getMetadata(),
				oProperty = oMetadata.getProperty(sName);
			if (!oProperty) {
				return this;
			}
			bSuppressInvalidate = this.getMetadata()._suppressInvalidate(oProperty, bSuppressInvalidate);
			if (Control.prototype.getProperty.apply(this, [sName]) !== oValue) {
				oMetadata._requestFragmentRetemplatingCheck(this, oProperty);
			}
			return Control.prototype.setProperty.apply(this, [sName, oValue, bSuppressInvalidate]);
		};

		/**
		 * @see sap.ui.core.Control#bindAggregation
		 */
		XMLComposite.prototype.bindAggregation = function (sName, oObject) {
			var oMetadata = this.getMetadata(),
				oAggregation = oMetadata.getAggregation(sName) || oMetadata.getAllPrivateAggregations()[sName],
				oBinding = Control.prototype.getBinding.apply(this, [sName]);
			if (!oBinding || (oBinding && oBinding.getPath() !== oObject.path)) {
				oMetadata._requestFragmentRetemplatingCheck(this, oAggregation);
			}
			return Control.prototype.bindAggregation.apply(this, [sName, oObject]);
		};

		/**
		 * @see sap.ui.core.Control#unbindAggregation
		 */
		XMLComposite.prototype.unbindAggregation = function (sName) {
			var oMetadata = this.getMetadata(),
				oAggregation = oMetadata.getAggregation(sName) || oMetadata.getAllPrivateAggregations()[sName];
			if (this.isBound(sName)) {
				oMetadata._requestFragmentRetemplatingCheck(this, oAggregation, true);
			}
			return Control.prototype.unbindAggregation.apply(this, [sName]);
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
			var sCompositeName = this.getMetadata().getCompositeAggregationName(),
				oContent = this.getAggregation(sCompositeName);
			if (oContent) {
				oContent.destroy();
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
			if (jQuery.isArray(oNewContent)) {
				this.setAggregation(sCompositeName, null);
				return;
			}
			if (oNewContent) {
				oNewContent.setModel(this._oManagedObjectModel, "$" + this.alias);
				oNewContent.bindObject("$" + this.alias + ">/");
				var oResourceModel = this._getResourceModel();
				if (oResourceModel) {
					oNewContent.setModel(oResourceModel, "$" + this.alias + ".i18n");
				}
			}
			this.setAggregation(sCompositeName, oNewContent);
			this.invalidate();
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
				return XMLComposite.getLibraryResourceModel(this.sLibraryName);
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
		};

		/**
		 * Initializes composite support with the given settings
		 * @param {map} mSettings the map of settings
		 *
		 * @private
		 */
		XMLComposite.prototype._initCompositeSupport = function (mSettings) {
			var oMetadata = this.getMetadata(),
				sAggregationName = oMetadata.getCompositeAggregationName(),
				bInitialized = false;
			if (mSettings && sAggregationName) {
				//this branch is taken if the _content of the compostie is there at creation time
				var oNode = mSettings[sAggregationName];
				if (oNode instanceof ManagedObject) {
					//this happens either if we clone an existing composite and the children are already present
					//note that we adapted the event handling in the clone method that is enhanced in the composite
					this._destroyCompositeAggregation();
					this._setCompositeAggregation(oNode);
					bInitialized = true;
				} else {
					//or if a preprocessing like in the mdc:Table has happened
					if (oNode && oNode.localName === "FragmentDefinition") {
						this._destroyCompositeAggregation();
						this._setCompositeAggregation(sap.ui.xmlfragment({
							sId: this.getId(),
							fragmentContent: mSettings[sAggregationName],
							oController: this
						}));
						bInitialized = true;
					}
				}
				delete mSettings[sAggregationName];
			}
			if (!bInitialized) {
				//at this end the composite is not preprocessed or cloned
				this._destroyCompositeAggregation();
				if (!this.getMetadata().usesTemplating()) {
					//in case there is no templating it is possible to insert the fragment as content
					//Note: The applySettings comes later hence in this case there is no Managed Object model
					this._setCompositeAggregation(sap.ui.xmlfragment({
						sId: this.getId(),
						fragmentContent: this.getMetadata()._fragment,
						oController: this
					}));
					bInitialized = true;
				}
			}
			this._bIsInitialized = bInitialized;
		};

		/**
		 * Requests a re-templating of the XMLComposite control
		 *
		 * @param {boolean} bForce true forces the re-templating
		 *
		 * @private
		 */
		XMLComposite.prototype.requestFragmentRetemplating = function (bForce) {
			// check all binding context of aggregations
			if (bForce) {
				this.fragmentRetemplating();
				return;
			}
			var mAggregations = this.getMetadata().getMandatoryAggregations(),
				bBound = true;
			for (var n in mAggregations) {
				bBound = typeof this.getBindingInfo(n) === "object";
				if (!bBound) {
					break;
				}
			}
			if (bBound) {
				this.fragmentRetemplating();
			}
		};

		/**
		 * Retemplates the XMLComposite control if a property or aggregation marked with invalidate : "template" in the metadata of the
		 * specific instance
		 *
		 * @private
		 */
		XMLComposite.prototype.fragmentRetemplating = function () {
			var oMetadata = this.getMetadata(),
				oFragment = oMetadata.getFragment();

			if (!oFragment) {
				throw new Error("Fragment " + oFragment.tagName + " not found");
			}
			var oManagedObjectModel = this._getManagedObjectModel();
			var that = this;
			oManagedObjectModel.getContextName = function () {
				return that.alias;
			};
			// TODO: Can we add the Model manually to the propProp Map without setting it?
			// be more specific about which models are set

			// TODO: what happens with any previous model?  Memory leak?
			this.setModel(oManagedObjectModel, this.alias);
			this.bindObject(this.alias + ">/");
			oManagedObjectModel._mSettings = getSettings(this._getPropertiesToPropagate());
			delete oManagedObjectModel._mSettings.models["$" + this.alias];
			delete oManagedObjectModel._mSettings.bindingContexts["$" + this.alias];
			this.setModel(null, this.alias);
			XMLPreprocessor.process(oFragment.querySelector("*"), {}, oManagedObjectModel._mSettings);
			// now with the updated fragment, call _initCompositeSupport again on the
			// aggregation hosting the fragment
			var mSettings = {};
			mSettings[oMetadata.getCompositeAggregationName()] = oFragment;
			this._initCompositeSupport(mSettings);
		};

		/**
		 * Called for the initial templating of an XMLComposite control
		 * @param {DOMNode} oElement root element for templating
		 * @param {IVisitor} oVisitor the interface of the visitor of the XMLPreprocessor
		 * @see sap.ui.core.util.XMLPreprocessor
		 * @private
		 */
		XMLComposite.initialTemplating = function (oElement, oVisitor, sFragment) {
			var oImpl = initXMLComposite(sFragment),
				oErrorModel = new JSONModel({}),
				mContexts = { "_$error": oErrorModel.getContext("/") },
				oMetadata = oImpl.getMetadata(),
				oFragment = oMetadata.getFragment(),
				sDefaultMetadataContexts = oMetadata._mSpecialSettings.metadataContexts ? oMetadata._mSpecialSettings.metadataContexts.defaultValue : "";

			if (!oFragment) {
				throw new Error("Fragment " + sFragment + " not found");
			}


			//guarantee that element has an id
			if (!oElement.getAttribute("id")) {
				oElement.setAttribute("id", oMetadata.uid());
			}
			addMetadataContexts(mContexts, oVisitor, oElement.getAttribute("metadataContexts"), sDefaultMetadataContexts, oImpl.prototype.defaultMetaModel);
			addAttributesContext(mContexts, oImpl.prototype.alias, oElement, oImpl, oVisitor);
			addViewContext(mContexts,oVisitor);
			var oContextVisitor = oVisitor["with"](mContexts, true);
			templateAggregations(oElement, oMetadata, oContextVisitor);
			var oNode = oFragment.ownerDocument.createElementNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.xmlcomposite/1", oMetadata.getCompositeAggregationName());
			oNode.appendChild(oFragment);
			oElement.appendChild(oNode);
			//resolve Templating
			oContextVisitor.visitChildNodes(oElement);
		};

		return XMLComposite;
	});
