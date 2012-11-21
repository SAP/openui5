/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.core.mvc.XMLView.
jQuery.sap.declare("sap.ui.core.mvc.XMLView");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.mvc.View");

/**
 * Constructor for a new mvc/XMLView.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.ui.core.mvc.View#constructor sap.ui.core.mvc.View}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * A View defined using (P)XML and HTML markup.
 * @extends sap.ui.core.mvc.View
 *
 * @author  
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.ui.core.mvc.XMLView
 */
sap.ui.core.mvc.View.extend("sap.ui.core.mvc.XMLView", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.ui.core"
}});


/**
 * Creates a new subclass of class sap.ui.core.mvc.XMLView with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ui.core.mvc.XMLView.extend
 * @function
 */


// Start of sap\ui\core\mvc\XMLView.js
jQuery.sap.require("jquery.sap.xml");
jQuery.sap.require("sap.ui.base.DataType");
jQuery.sap.require("sap.ui.model.resource.ResourceModel");

(function(){

	/**
	 * Creates an XML view of the given name and with the given id.
	 *
	 * The <code>viewName</code> must either correspond to an XML module that can be loaded
	 * via the module system (viewName + suffix ".view.xml") and which defines the view or must
	 * be a configuration object for a view.
	 * The configuration object can have a vieName, viewContent and a controller property. The viewName
	 * behaves as described above. ViewContent can hold the view description as XML string. The controller
	 * property can hold an controller instance. If a controller instance is given it overrides the
	 * controller defined in the view.
	 *
	 * Like with any other control, id is optional and one will be created automatically.
	 *
	 * @param {string} [sId] id of the newly created view
	 * @param {string | object} vView name of the view or view configuration as described above.
	 * @public
	 * @static
	 */
	sap.ui.xmlview = function(sId, vView) {
		var mSettings = {};
		if (vView) {
			if (typeof(vView) == "string") {
				mSettings.viewName = vView;
			}
			else {
				mSettings.viewName = vView.viewName;
				mSettings.controller = vView.controller;
				mSettings.viewContent = vView.viewContent;
			}
			return new sap.ui.core.mvc.XMLView(sId, mSettings);
		} else {
			if (typeof(sId) == "string") {
				mSettings.viewName = sId;
			}
			else {
				mSettings.viewName = sId.viewName;
				mSettings.controller = sId.controller;
				mSettings.viewContent = sId.viewContent;
			}
			return new sap.ui.core.mvc.XMLView(mSettings);
		}
	};


	sap.ui.core.mvc.XMLView.prototype.initViewSettings = function(mSettings) {
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
			this._xContent = loadTemplate(mSettings.viewName);
		} else if (mSettings.viewContent) {
			this.mProperties["viewContent"] = mSettings.viewContent;
			this._xContent = jQuery.sap.parseXML(mSettings.viewContent);
			if (this._xContent.parseError.errorCode != 0){
				var oParseError = this._xContent.parseError;
				throw new Error("The following problem occurred: XML parse Error for " + oParseError.url + " code: " + oParseError.errorCode + " reason: " +
						oParseError.reason +  " src: " + oParseError.srcText + " line: " +  oParseError.line +  " linepos: " + oParseError.linepos +  " filepos: " + oParseError.filepos);
			}else{
				this._xContent = this._xContent.documentElement;
			}

		} else if (mSettings.xmlNode) {
			this._xContent = mSettings.xmlNode;
		} else {
			// does not happen, already checked
		}
		this._oContainingView = mSettings.containingView || this;

		// extract the properties of the view from the XML element
		if ( !this.isSubView() ) {
			// for a real XMLView, we need to parse the attributes of the root node
			parseViewAttributes(this._xContent, this, mSettings);
		} else {
			// when used as fragment: prevent connection to controller, only top level XMLView must connect
			delete mSettings.controller;
		}

		if(this._resourceBundleName || this._resourceBundleUrl) {
			var model = new sap.ui.model.resource.ResourceModel({bundleName:this._resourceBundleName, bundleUrl:this._resourceBundleUrl, bundleLocale:this._resourceBundleLocale});
			this.setModel(model,this._resourceBundleAlias);
		}
	};

	sap.ui.core.mvc.XMLView.prototype.onControllerConnected = function(oController) {
		var that=this;
		// unset any preprocessors (e.g. from an enclosing JSON view)
		sap.ui.core.Element.runWithPreprocessors(function() {
			// parse the XML tree
			that._aParsedContent = parseView(that._xContent, that);
		})
	};

	sap.ui.core.mvc.XMLView.prototype.getControllerName = function() {
		return this._controllerName;
	};


	sap.ui.core.mvc.XMLView.prototype.isSubView = function() {
		return this._oContainingView != this;
	};

	/**
	 * If the HTML doesn't contain own content, it tries to reproduce existing content
	 */
	sap.ui.core.mvc.XMLView.prototype.onAfterRendering = function() {

		if ( this._$oldContent.length !== 0 ) {
			// jQuery.sap.log.debug("after rendering for " + this);

			// move DOM of children into correct place in preserved DOM
			var aChildren = this.getAggregation("content");
			if ( aChildren ) {
				for(var i=0; i<aChildren.length; i++) {
					var $childDOM = aChildren[i].$();
					// jQuery.sap.log.debug("replacing placeholder for " + aChildren[i] + " with content");
					jQuery.sap.byId("sap-ui-dummy-" + aChildren[i].getId(), this._$oldContent).replaceWith($childDOM);
				}
			}
			// move preserved DOM into place
			// jQuery.sap.log.debug("moving preserved dom into place for " + this);
			jQuery.sap.byId("sap-ui-dummy-" + this.getId()).replaceWith(this._$oldContent);
		}
		this._$oldContent = undefined;

		// call super
		sap.ui.core.mvc.View.prototype.onAfterRendering.apply(this, arguments);
	};

	function loadTemplate(sTemplateName) {
		var url = jQuery.sap.getModulePath(sTemplateName, ".view.xml");

		var response = jQuery.sap.sjax({
			url : url,
			dataType: 'xml'
		});
		var _xContent = response.data;
		if (!_xContent) {
			throw new Error("View definition could not be loaded from " + url + ". Check for XML errors or 'file not found' errors.");
		}
		return _xContent.documentElement; // response.data is the document node
	}

	//************* PARSING *************

	function parseScalarType(sType, sValue, sName) {
		// check for a binding expression (string)
		// TODO factor out and move to Element or ExpressionLanguage to guarantee that the check is in sync with the data binding
		if ( sValue && sValue.slice(0,1) === '{' && sValue.slice(-1) === '}' ) {
			return sValue;
		}
		var oType = sap.ui.base.DataType.getType(sType);
		if (oType) {
			if (oType instanceof sap.ui.base.DataType) {
				return oType.parseValue(sValue);
			}
			// else return original sValue (e.g. for enums)
		} else {
			throw new Error("Property " + sName + " has no known type");
		}
		return sValue;
	}

	function localName(xmlNode) {
		// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
		return xmlNode.localName || xmlNode.baseName || xmlNode.nodeName;
	}

	/**
	 * Parses only the attributes of the root node (View)
	 * Children are parsed later on after the controller has been set.
	 * TODO can't handle event handlers in the root node
	 */
	function parseViewAttributes(xmlNode, oView, mSettings) {

		var mAllProperties = oView.getMetadata().getAllProperties();
		for ( var i = 0; i < xmlNode.attributes.length; i++) {
			var attr = xmlNode.attributes[i];
			if (attr.name === 'controllerName') {
				oView._controllerName = attr.value;
			} else if (attr.name === 'resourceBundleName') {
				oView._resourceBundleName =  attr.value;
			} else if (attr.name === 'resourceBundleUrl') {
				oView._resourceBundleUrl =  attr.value;
			} else if (attr.name === 'resourceBundleLocale') {
				oView._resourceBundleLocale =  attr.value;
			} else if (attr.name === 'resourceBundleAlias') {
				oView._resourceBundleAlias =  attr.value;
			} else if (!mSettings[attr.name] && mAllProperties[attr.name]) {
				mSettings[attr.name] = parseScalarType(mAllProperties[attr.name].type, attr.value, attr.name);
			}
		}
	}

	/**
	 * Parses a complete View definition (full node hierarchy)
	 */
	function parseView(xmlNode, oView) {

		var aResult=[];
		if (oView.isSubView()) {
			parseNode(xmlNode, true);
		} else {
			parseChildren(xmlNode);
		}
		return aResult;

		/**
		 * Parses an XML node that might represent an UI5 control or simple XHTML.
		 * XHTML will be added to the aResult array as a sequence of strings,
		 * UI5 controls will be instantiated and added as controls
		 */
		function parseNode(xmlNode, bRoot) {

			if ( xmlNode.nodeType === 1 /* ELEMENT_NODE */ ) {

				var sLocalName = localName(xmlNode);
				if (xmlNode.namespaceURI === "http://www.w3.org/1999/xhtml" || xmlNode.namespaceURI === "http://www.w3.org/2000/svg") {
					// write opening tag
					aResult.push("<" + sLocalName + " ");
					// write attributes
					var sId;
					for (var i = 0; i < xmlNode.attributes.length; i++) {
						var attr = xmlNode.attributes[i];
						var value = attr.value;
						if (attr.name === "id") {
							value = oView._oContainingView.createId(value);
						}
						aResult.push(attr.name + "='" + value + "' ");
					}
					if ( bRoot === true ) {
						aResult.push("data-sap-ui-preserve" + "='" + oView.getId() + "' ");
					}
					aResult.push(">");

					// write children
					parseChildren(xmlNode);

					// close the tag
					aResult.push("</" + sLocalName + ">");

				} else {

					// assumption: an ELEMENT_NODE with non-XHTML namespace is a SAPUI5 control and the namespace equals the library name
					var oChild = createRegularControl(xmlNode);

					oView.addAggregation("content", oChild);
					aResult.push(oChild);

				}

			} else if (xmlNode.nodeType === 3 /* TEXT_NODE */ ) {

				var text = xmlNode.textContent || xmlNode.text;
				if (text) {
					aResult.push(text);
				}

			}

		}

		/**
		 * Parses the children of an XML node
		 */
		function parseChildren(xmlNode, bRoot) {
			var children = xmlNode.childNodes;
			for (var i = 0; i < children.length; i++) {
				parseNode(children[i], bRoot);
			}
		}

		function findControlClass(sNamespaceURI, sLocalName) {
			var sClassName;
			var mLibraries = sap.ui.getCore().getLoadedLibraries();
			jQuery.each(mLibraries, function(sLibName, oLibrary) {
				if ( sNamespaceURI === oLibrary.namespace || sNamespaceURI === oLibrary.name ) {
					sClassName = oLibrary.name + "." + ((oLibrary.tagNames && oLibrary.tagNames[sLocalName]) || sLocalName);
				}
			});
			// TODO guess library from sNamespaceURI and load corresponding lib!?
			sClassName = sClassName || sNamespaceURI + "." + sLocalName;

			// ensure that control and library are loaded
			jQuery.sap.require(sClassName); // make sure oClass.getMetadata() exists

			return jQuery.sap.getObject(sClassName);
		}

		/**
		 * Takes an arbitrary node and creates a SAPUI5 control from it, iterating over the attributes and child nodes
		 *
		 * @private
		 */
		function createControl(node) {
			// differentiate between SAPUI5 and plain-HTML children
			if (node.namespaceURI === "http://www.w3.org/1999/xhtml" || node.namespaceURI === "http://www.w3.org/2000/svg" ) {
				// plain HTML node - create a new View control
				return new sap.ui.core.mvc.XMLView({
					id: xmlNode.attributes['id'] ? oView.createId(xmlNode.attributes['id']) : undefined, 
					xmlNode:node,
					containingView:oView._oContainingView});
			} else {
				// SAPUI5 control
				return createRegularControl(node);
			}
		}

		function createRegularControl(node) {
			var ns = node.namespaceURI,
				oClass = findControlClass(ns, localName(node)),
				oMetadata = oClass.getMetadata(),
				mJSONKeys = oMetadata.getJSONKeys(),
				mSettings = {},
				sStyleClasses = "",
				aCustomData = [];

			for (var i = 0; i < node.attributes.length; i++) {
				var attr = node.attributes[i];

				var sName = attr.name;
				var sValue = attr.value;

				// apply the value of the attribute to a
				//   * property,
				//   * association (id of the control),
				//   * event (name of the function in the controller) or
				//   * CustomData element (namespace-prefixed attribute)

				var oInfo = mJSONKeys[sName];

				if (sName === "id") {
					// special handling for ID
					mSettings[sName] = oView.createId(sValue);

				} else if (sName === "class") {
					// special handling for CSS classes, which will be added via addStyleClass()
					sStyleClasses += sValue;

				} else if (sName === "viewName") {
					mSettings[sName] = sValue;

				} else if (sName.indexOf(":") > -1) {  // namespace-prefixed attribute found
					if (attr.namespaceURI === "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1") {  // CustomData attribute found
						aCustomData.push({
							Type:"sap.ui.core.CustomData",
							key:localName(attr),
							value:sValue
						});
					} else { // other, unknown namespace
						jQuery.sap.log.warning("XMLView parser encountered and ignored attribute '" + sName + "' (value: '" + sValue + "') with unknown namespace");
						// TODO: here XMLView could check for namespace handlers registered by the application for this namespace which could modify mSettings according to their interpretation of the attribute
					}

				} else if (oInfo && oInfo._iKind === 0 /* PROPERTY */ ) {
					// other PROPERTY
					mSettings[sName] = parseScalarType(oInfo.type, sValue, sName);

				} else if (oInfo && oInfo._iKind === 1 /* SINGLE_AGGREGATION */ && oInfo.altTypes ) {
					// AGGREGATION with scalar type (altType)
					mSettings[sName] = parseScalarType(oInfo.altTypes[0], sValue, sName);

				} else if (oInfo && oInfo._iKind === 2 /* MULTIPLE_AGGREGATION */ ) {
					jQuery.sap.assert(sValue && sValue.slice(0,1) === '{' && sValue.slice(-1) === '}', "aggregations with cardinality 0..n only allow binding paths as attribute value");
					if ( sValue && sValue.slice(0,1) === '{' && sValue.slice(-1) === '}' ) {
						mSettings[sName] = { path : sValue.slice(1,-1), template : null };
					}
				} else if (oInfo && oInfo._iKind === 3 /* SINGLE_ASSOCIATION */ ) {
					// ASSOCIATION
					mSettings[sName] = oView.createId(sValue); // use the value as ID

				} else if (oInfo && oInfo._iKind === 5 /* EVENT */ ) {
					// EVENT
					var fnEventHandler = oView._oContainingView.oController[sValue];
					jQuery.sap.assert(typeof(fnEventHandler) === "function", "event handler function \"" + sValue + "\" is not a function or does not exist in the controller.");
					if (fnEventHandler) {
						mSettings[sName] = [fnEventHandler, oView._oContainingView.oController];
					}
				} else {
					jQuery.sap.log.warning("XMLView parser encountered and ignored unknown attribute '" + sName + "' (value: '" + sValue + "')");
				}
			}
			if (aCustomData.length > 0) {
				mSettings["customData"] = aCustomData;
			}

			function handleChildren(node, oAggregation, mAggregations) {

				var childNode,oNamedAggregation,oControl;

				// loop over all nodes
				for (childNode=node.firstChild; childNode; childNode = childNode.nextSibling) {

					// inspect only element nodes
					if ( childNode.nodeType === 1 /* ELEMENT_NODE */ ) {

						// check for a named aggregation (must have the same namespace as the parent and an aggregation with the same name must exist)
						oNamedAggregation = childNode.namespaceURI === ns && mAggregations && mAggregations[localName(childNode)];
						if (oNamedAggregation) {

							// the children of the current childNode are aggregated controls (or HTML) below the named aggregation
							handleChildren(childNode, oNamedAggregation);

						} else if (oAggregation) {
							// child node name does not equal an aggregation name,
							// so this child must be a control (or HTML) which is aggregated below the DEFAULT aggregation
							var oControl = createControl(childNode);
							if ( oControl ) {
								// append the child to the aggregation
								var name = oAggregation._sName;
								if (oAggregation.multiple) {
									// 1..n AGGREGATION
									if (!mSettings[name]) {
										mSettings[name] = [];
									}
									if ( typeof mSettings[name].path === "string" ) {
										jQuery.sap.assert(!mSettings[name].template, "list bindings support only a single template object");
										mSettings[name].template = oControl;
									} else {
										mSettings[name].push(oControl);
									}
								} else {
									// 1..1 AGGREGATION
									jQuery.sap.assert(!mSettings[name], "multiple aggregates defined for aggregation with cardinality 0..1");
									mSettings[name] = oControl;
								}
							}
						} else {
							throw new Error("Cannot add direct child without default aggregation defined for control " + oMetadata.getElementName());
						}

					} else if ( childNode.nodeType === 3 /* TEXT_NODE */ ) {
						if ( jQuery.trim(childNode.textContent || childNode.text) ) { // whitespace would be okay
							throw new Error("Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed");
						}
					} // other nodes types are silently ignored

				}
			}

			// loop child nodes and handle all AGGREGATIONS
			handleChildren(node, oMetadata.getDefaultAggregation(), oMetadata.getAllAggregations());

			// apply the settings to the control
			var oControl = new oClass(mSettings);

			if (sStyleClasses && oControl.addStyleClass) {
				// Elements do not have a style class!
				oControl.addStyleClass(sStyleClasses);
			}

			return oControl;
		}

	}

}());
