/*!
 * ${copyright}
 */

/**
 * This class provides the possibly to declare the "view" part of a control
 * in an XML fragment which will automatically define the rendering accordingly.
 * Additionally, the FragmentControl allows aggregations defined on the control
 * to be forwarded (on an instance level) to the inner controls used in the
 * XML fragment.
 *
 * CAUTION: naming, location and APIs of this entity will possibly change and should
 * therefore be considered experimental
 *
 * @private
 * @sap-restricted
 *
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/FragmentControlMetadata', 'sap/ui/model/base/ManagedObjectModel', 'sap/ui/core/util/XMLPreprocessor',
	'sap/ui/model/json/JSONModel', 'sap/ui/core/Fragment', 'sap/ui/base/ManagedObject', 'sap/ui/base/DataType', 'sap/ui/core/FragmentProxy'
], function (jQuery, Control, FragmentControlMetadata, ManagedObjectModel, XMLPreprocessor, JSONModel, Fragment, ManagedObject, DataType, Proxy) {
	"use strict";

	// private functions
	var mControlImplementations = {};

	function initFragmentControl (sFragment, oFragmentContext) {
		if (!mControlImplementations[sFragment]) {
			jQuery.sap.require(sFragment);
			mControlImplementations[sFragment] = jQuery.sap.getObject(sFragment);
		}
		return mControlImplementations[sFragment];
	}

	function parseScalarType (sType, sValue, sName, oController) {
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

	function addAttributesContext (mContexts, sName, oElement, oImpl, oVisitor) {
		var oAttributesModel = new JSONModel(oElement),
			oMetadata = oImpl.getMetadata(),
			mAggregations = oMetadata.getAllAggregations(),
			mProperties = oMetadata.getAllProperties(),
			mSpecialSettings = oMetadata._mAllSpecialSettings;

		oAttributesModel.getVisitor = function () {
			return oVisitor;
		};
		oAttributesModel.getProperty = function (sPath, oContext) {
			var oResult;
			sPath = this.resolve(sPath, oContext);
			sPath = sPath.substring(1);
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

			} else if (mAggregations.hasOwnProperty(sPath)) {
				var oAggregation = mAggregations[sPath];
				if (oAggregation.multiple === true && oAggregation.type === "TemplateMetadataContext") {
					if (!oElement.hasAttribute(sPath)) {
						return null;
					}
					return oElement.getAttribute(sPath);
				}
				return oElement.getAttribute(sPath);
			} else if (mSpecialSettings.hasOwnProperty(sPath)) {
				if (!oElement.hasAttribute(sPath)) {
					return null;
				}
				oResult = oVisitor.getResult(oElement.getAttribute(sPath));
				if (oResult) {
					return oResult;
				}
				return oElement.getAttribute(sPath);
			}
		};
		oAttributesModel.getContextName = function () {
			return sName;
		};
		mContexts[sName] = oAttributesModel.getContext("/");
	}

	// TODO: be more specific about what is returned; at the moment we would return
	// also e.g. models which are not specifically defined on the fragment control
	// but are propagated from outside of it. Ideally, we would only return
	// settings which are specifically defined on the FragmentControl !
	function getSettings (oPropagates) {
		var oSettings = {};
		oSettings.models = oPropagates.oModels || {};
		oSettings.bindingContexts = oPropagates.oBindingContexts || {};
		return oSettings;
	}

	/**
	 * Fragment Control is the base class for composite controls that use a XML fragment representation
	 * for their visual parts. From a user perspective such controls appear as any other control, but internally the
	 * rendering part is added as a fragment.
	 * The fragment that is used should appear in the same folder as the control"s JS implementation with the file extension
	 * <code>.control.xml</code>.
	 * The fragment"s content can access the interface data from the fragment control via bindings. Currently only aggregations and properties
	 * can be used with bindings inside a fragment.
	 * The exposed model that is used for internal bindings in the fragment has the default name <code>$this</code>. The name will always start
	 * with an <code>$</code>. The metadata of the derived control can define the alias with its metadata. A code example can be found below.
	 *
	 * As fragment controls compose other controls, fragment controls are only invalidated and re-rendered if explicitly defined. Additional metadata
	 * for invalidation can be given for properties and aggregation. The default invalidation is <code>"none"</code>.
	 * Setting invalidate to <code>true</code> for properties and aggregations sets the complete FragmentControl
	 * to invalidate and rerender. For templating scenarios the Fragment Control can also be forced to re-template completely. In such case set invalidate
	 * of the corresponding property to <code>"template"</code>
	 *
	 * Example:
	 * <pre>
	 * FragmentControl.extend("sap.mylib.MyFragmentControl", {
	 *   metadata : {
	 *     library: "sap.mylib",
	 *     properties : {
	 *       text: { //changing this property will not re-render the FragmentControl
	 *          type: "string",
	 *          defaultValue: ""
	 *       },
	 *       title: { //changing this property will re-render the FragmentControl as it defines invalidate: true
	 *          type: "string",
	 *          defaultValue: "",
	 *          invalidate: true
	 *       },
	 *       value: { //changing this property will re-render the FragmentControl as it defines invalidate: true
	 *          type: "string",
	 *          defaultValue: "",
	 *          invalidate: true
	 *       },
	 *       progress: { //changing this property will re-template the FragmentControl as it defines invalidate: true
	 *          type: "int",
	 *          defaultValue: "",
	 *          invalidate: "template"
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
	 *   //fragment defaults to {control name}.control.xml in this case sap.mylib.MyFragmentControl.control.xml
	 *   fragment: "sap.mylib.MyFragmentControlOther.control.xml" //the name of the fragment
	 * });
	 * </pre>
	 *
	 * Internally the FragmentControl instantiates and initializes the given fragment and stores the resulting control in a hidden
	 * aggregation named <code>_content</code>. The fragment should only include one root element.
	 *
	 * Bindings of inner controls to the interface of the Fragment Control can be done with normal binding syntax.
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
	 * All events handled within the fragment will be dispatched to the Fragment Control. It is recommended to follow this paradigm to allow
	 * reuse of a Fragment Control without any dependency to controller code of the current embedding view.
	 *
	 * <pre>
	 *    MyFragmentControl.prototype.handlePress = function() {
	 *        this.fireOuterEvent(); // passing on the event to the outer view
	 *    }
	 * </pre>
	 *
	 * @see sap.ui.core.Control
	 * @see sap.ui.core.Fragment
	 *
	 * @class Base Class for fragment controls.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.48.0
	 * @alias sap.ui.core.FragmentControl
	 *
	 * @abstract
	 * @experimental
	 * @private
	 * @sap-restricted sap.fe
	 */
	var FragmentControl = Control.extend("sap.ui.core.FragmentControl", {
		metadata: {
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
		renderer: function (oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.writeClasses(); // to make class="..." in XMLViews and addStyleClass() work
			oRm.write(">");
			var oContent = oControl.getAggregation(oControl.getMetadata().getCompositeAggregationName());
			if (oContent) {
				oRm.renderControl(oContent);
			}
			oRm.write("</div>");
		}
	}, FragmentControlMetadata);

	/**
	 * Applies the settings of the fragment control
	 *
	 * @returns {sap.ui.core.FragmentControl} The instance of the control
	 *
	 * @private
	 */
	FragmentControl.prototype.applySettings = function () {
		this._bIsInitializing = true;
		var vResult = Control.prototype.applySettings.apply(this, arguments);
		this._bIsInitializing = false;
		return vResult;
	};

	/**
	 * Returns the managed object model of the the fragment control
	 *
	 * @returns {sap.ui.model.base.ManagedObjectModel} the managed object model of the fragment control
	 *
	 * @private
	 */
	FragmentControl.prototype._getManagedObjectModel = function () {
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
	FragmentControl.prototype.getSuppressInvalidateAggregation = function (sName, bSuppressInvalidate) {
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
	FragmentControl.prototype.setProperty = function (sName, oValue, bSuppressInvalidate) {
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
	FragmentControl.prototype.bindAggregation = function (sName, oObject) {
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
	FragmentControl.prototype.unbindAggregation = function (sName) {
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
	FragmentControl.prototype.setAggregation = function (sName, oObject, bSuppressInvalidate) {
		return Control.prototype.setAggregation.apply(this, [sName, oObject, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
	};

	/**
	 * @see sap.ui.core.Control#addAggregation
	 */
	FragmentControl.prototype.addAggregation = function (sName, oObject, bSuppressInvalidate) {
		return Control.prototype.addAggregation.apply(this, [sName, oObject, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
	};

	/**
	 * @see sap.ui.core.Control#unbindAggregation
	 */
	FragmentControl.prototype.insertAggregation = function (sName, oObject, iIndex, bSuppressInvalidate) {
		return Control.prototype.insertAggregation.apply(this, [sName, oObject, iIndex, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
	};
	/**
	 * sap.ui.core.Control#removeAggregation
	 */
	FragmentControl.prototype.removeAggregation = function (sName, oObject, bSuppressInvalidate) {
		return Control.prototype.removeAggregation.apply(this, [sName, oObject, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
	};

	/**
	 * @see sap.ui.core.Control#removeAllAggregation
	 */
	FragmentControl.prototype.removeAllAggregation = function (sName, bSuppressInvalidate) {
		return Control.prototype.removeAllAggregation.apply(this, [sName, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
	};

	/**
	 * @see sap.ui.core.Control#destroyAggregation
	 */
	FragmentControl.prototype.destroyAggregation = function (sName, bSuppressInvalidate) {
		return Control.prototype.destroyAggregation.apply(this, [sName, this.getSuppressInvalidateAggregation(sName, bSuppressInvalidate)]);
	};

	/**
	 * @see sap.ui.core.Control#updateAggregation
	 */
	FragmentControl.prototype.updateAggregation = function (sName, bSuppressInvalidate) {
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
	FragmentControl.prototype.setVisible = function (bVisible) {
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
	 * @returns {sap.ui.core.FragmentControl} Returns <code>this</code> to allow method chaining
	 *
	 * @private
	 */
	FragmentControl.prototype._destroyCompositeAggregation = function () {
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
	FragmentControl.prototype.updateBindings = function () {
		if (this._bIsInitializing) {
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
	 * @returns {sap.ui.core.FragmentControl} Returns <code>this</code> to allow method chaining
	 *
	 * @private
	 */
	FragmentControl.prototype._setCompositeAggregation = function (oNewContent) {
		var sCompositeName = this.getMetadata().getCompositeAggregationName();
		this._destroyCompositeAggregation();
		if (!this._oManagedObjectModel) {
			this._oManagedObjectModel = new ManagedObjectModel(this);
		}
		if (jQuery.isArray(oNewContent)) {
			this.setAggregation(sCompositeName, null);
			return;
		}
		if (oNewContent) {
			oNewContent.setModel(this._oManagedObjectModel, "$" + this.alias);
			oNewContent.bindObject("$" + this.alias + ">/");
		}
		var that = this;
		this.setAggregation(sCompositeName, oNewContent);
		var that = this;

		// in short, the reason we overwrite the _getPropertiesToPropagate is that we wish to filter out controlTree models from parents
		// from being propagated. This is not strictly needed but it could lead to confusion if in an inner
		// fragment control you could reference the controlTree model of a "parent" fragment control.
		oNewContent._getPropertiesToPropagate = function () {
			// fragment control content should only propagate the contexts that are not contexts of parent fragment controls
			// this is the case for fragment controls that are nested in other fragment controls

			// notice that the call ManagedObject.prototype._getPropertiesToPropagate.apply(this, arguments) gives us
			// all the parent properties (model, bindingContexts and listeners) merged with the properties of self
			// (the latter is merged on top of the parent properties) - in this method it is about what we overtake from
			// this already merged result
			var oProperties = ManagedObject.prototype._getPropertiesToPropagate.apply(this, arguments),
				oBindingContexts = {},
				oModels = {},
				oModel;
			for (var n in oProperties.oBindingContexts) {
				var oContext = oProperties.oBindingContexts[n];
				if (oContext) {
					oModel = oContext.getModel();
					// if the model to be propageted is a controlTree model of a FragmentControl with a different name that the controlTree model
					// of our current control, then we do *not* propagate
					if (oModel instanceof ManagedObjectModel && oModel.getRootObject() instanceof FragmentControl && "$" + that.alias !== n) {
						continue;
					}
					// so in this case we know that either we are dealing with a model which is not a controlTree model of a FragmentControl or
					// it is so but the name of the model to propagete is identical to the name of our current control and since oProperties
					// is already a merge we know that in the latter case the controlTree model *is* the controlTree model set on
					// oNewContent (=this) in _setCompositeAggregation
					oBindingContexts[n] = oProperties.oBindingContexts[n];
				}
			}
			for (var n in oProperties.oModels) {
				var oModel = oProperties.oModels[n];
				if (oModel && oModel instanceof ManagedObjectModel && oModel.getRootObject() instanceof FragmentControl && "$" + that.alias !== n) {
					continue;
				}
				oModels[n] = oProperties.oModels[n];
			}

			oProperties.oBindingContexts = oBindingContexts;
			oProperties.oModels = oModels;
			return oProperties;
		};
		this.invalidate();
	};

	/**
	 * Initializes composite support with the given settings
	 * @param {map} mSettings the map of settings
	 *
	 * @private
	 */
	FragmentControl.prototype._initCompositeSupport = function (mSettings) {
		var oMetadata = this.getMetadata(),
			sAggregationName = oMetadata.getCompositeAggregationName(),
			bInitialized = false;
		if (mSettings && sAggregationName) {
			var oNode = mSettings[sAggregationName];
			if (oNode && oNode.localName === "FragmentDefinition") {
				this._destroyCompositeAggregation();
				this._setCompositeAggregation(sap.ui.xmlfragment({
					sId: this.getId(),
					fragmentContent: mSettings[sAggregationName],
					oController: this
				}));
				bInitialized = true;
			}
			delete mSettings[sAggregationName];
		}
		if (!bInitialized) {
			this._destroyCompositeAggregation();
			this._setCompositeAggregation(sap.ui.xmlfragment({
				sId: this.getId(),
				fragmentContent: this.getMetadata()._fragment,
				oController: this
			}));
		}

	};

	/**
	 * Requests a retemplating of the fragment ontrol
	 *
	 * @param {boolean} bForce true forces the retemplating
	 *
	 * @private
	 */
	FragmentControl.prototype.requestFragmentRetemplating = function (bForce) {
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
	 * Retemplates the Fragment Control if a property or aggregation marked with invalidate : "template" in the metadata of the
	 * specific instance
	 *
	 * @private
	 */
	FragmentControl.prototype.fragmentRetemplating = function () {
		var oMetadata = this.getMetadata(),
			oFragment = oMetadata.getFragment();

		if (!oFragment) {
			throw new Error("Fragment " + oFragment.tagName + " not found");
		}
		var oManagedObjectModel = new ManagedObjectModel(this);
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
	 * Called for the initial templating of a fragment control
	 * @param {DOMNode} oElement root element for templating
	 * @param {IVisitor} oVisitor the interface of the visitor of the XMLPreprocessor
	 * @see sap.ui.core.util.XMLPreprocessor
	 * @private
	 */
	FragmentControl.initialTemplating = function (oElement, oVisitor, sFragment) {
		var oImpl = initFragmentControl(sFragment),
			mContexts = {},
			oFragment = oImpl.getMetadata().getFragment();
		if (!oFragment) {
			throw new Error("Fragment " + sFragment + " not found");
		}
		addAttributesContext(mContexts, oImpl.prototype.alias, oElement, oImpl, oVisitor);
		var oContextVisitor = oVisitor["with"](mContexts, true),
			mMetadata = oImpl.getMetadata();
		// resolve templating
		oContextVisitor.visitChildNodes(oFragment);
		var oNode = oFragment.ownerDocument.createElementNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.fragmentcontrol/1", mMetadata.getCompositeAggregationName());
		oNode.appendChild(oFragment);
		oElement.appendChild(oNode);
	};

	/**
	 * TODO: Where to put default helpers
	 */
	FragmentControl.helper = {
		// Annotation Helper to go to the meta model context of the corresponding meta model
		listContext: function (oContext) {
			var oBindingInfo = oContext.getModel().getProperty(oContext.getPath());
			if (typeof oBindingInfo === "string") {
				oBindingInfo = ManagedObject.bindingParser(oBindingInfo);
			}
			if (jQuery.isArray(oBindingInfo)) {
				var oBinding = oContext.getModel().getProperty(oContext.getPath() + "/@binding");
				if (oBinding) {
					return oBinding.getModel().getMetaModel().getMetaContext(oBinding.getPath());
				} else {
					return undefined;
				}
			}
			if (typeof oBindingInfo === "object") {
				var oVisitor = oContext.getModel().getVisitor();
				var oModel = oVisitor.getSettings().models[oBindingInfo.model];
				if (oModel) {
					return oModel.createBindingContext(oBindingInfo.path);
				}
				return null;
			} else {
				return undefined;
			}
		},
		// TODO: very similar to listContext, maybe parts like the identical first 60% can be factored out
		listMetaContext: function (oContext) {
			var oBindingInfo = oContext.getModel().getProperty(oContext.getPath());
			if (typeof oBindingInfo === "string") {
				oBindingInfo = ManagedObject.bindingParser(oBindingInfo);
			}
			if (jQuery.isArray(oBindingInfo)) {
				var oBinding = oContext.getModel().getProperty(oContext.getPath() + "/@binding");
				if (oBinding) {
					return oBinding.getModel().getMetaModel().getMetaContext(oBinding.getPath());
				} else {
					return undefined;
				}
			}
			if (typeof oBindingInfo === "object") {
				var oVisitor = oContext.getModel().getVisitor();
				oBindingInfo = ManagedObject.bindingParser("{" + oBindingInfo.path + "}");
				var oModel = oVisitor.getSettings().models[oBindingInfo.model];
				if (oModel) {
					var oMetaModel = oModel.getMetaModel();
					if (oMetaModel && oMetaModel.getMetaContext) {
						return oMetaModel.getMetaContext(oBindingInfo.path);
					}
				}
				return null;
			} else {
				return undefined;
			}
		},

		// Annotation Helper to bind a property to the managed object model
		runtimeProperty: function (oContext, vValue) {
			if (oContext.getModel().getContextName) {
				return "{$" + oContext.getModel().getContextName() + ">" + oContext.getPath() + "}";
			}
			return vValue;
		},

		// Annotation Helper to bind a property to the managed object model
		runtimeBinding: function (oContext, vValue) {
			return "{Name}";
		},

		// Annotation Helper to bind an aggregation
		runtimeListBinding: function (oContext, vValue) {
			// if the value is an array, this is an resolved list binding and the binding needs to be as string
			if (jQuery.isArray(vValue)) {
				var oBinding = oContext.getModel().getProperty(oContext.getPath() + "/@binding");
				if (oBinding) {
					return "{path: '" + oBinding.getPath() + "'}";
				}
				return null;
			}
			return vValue;
		}
	};
	FragmentControl.helper.listMetaContext.requiresIContext = true;
	FragmentControl.helper.runtimeProperty.requiresIContext = true;
	FragmentControl.helper.runtimeListBinding.requiresIContext = true;
	FragmentControl.helper.runtimeBinding.requiresIContext = true;
	return FragmentControl;
}, true);
