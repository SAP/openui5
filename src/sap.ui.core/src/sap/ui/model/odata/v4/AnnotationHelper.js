/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.AnnotationHelper
sap.ui.define([
	"./_AnnotationHelperExpression"
], function (Expression) {
	"use strict";

	var rBadChars = /[\\\{\}:]/, // @see sap.ui.base.BindingParser: rObject, rBindingChars
		rCount = /\/\$count$/,
		/**
		 * @classdesc
		 * A collection of methods which help to consume
		 * <a href="http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html">
		 * OData V4 annotations</a> in XML template views. Every context argument must belong to a
		 * {@link sap.ui.model.odata.v4.ODataMetaModel} instance.
		 *
		 * @alias sap.ui.model.odata.v4.AnnotationHelper
		 * @namespace
		 * @public
		 * @since 1.43.0
		 */
		AnnotationHelper = {
			/**
			 * Returns the value for the label of a
			 * <code>com.sap.vocabularies.UI.v1.DataFieldAbstract</code> from the meta model. If no
			 * <code>Label</code> property is available, but the data field has a <code>Value</code>
			 * property with an <code>edm:Path</code> expression as value, the label will be taken
			 * from the <code>com.sap.vocabularies.Common.v1.Label</code> annotation of the path's
			 * target property.
			 *
			 * Example:
			 * <pre>
			 * &lt;Label text="{meta>@@sap.ui.model.odata.v4.AnnotationHelper.label}" />
			 * </pre>
			 *
			 * @param {any} vRawValue
			 *   The raw value from the meta model
			 * @param {object} oDetails
			 *   The details object
			 * @param {sap.ui.model.Context} oDetails.context
			 *   Points to the given raw value, that is
			 *   <code>oDetails.context.getProperty("") === vRawValue</code>
			 * @returns {string}
			 *   A data binding or a fixed text or a sequence thereof or <code>undefined</code>
			 *
			 * @public
			 * @since 1.49.0
			 */
			label : function (vRawValue, oDetails) {
				var oNewContext;

				if (vRawValue.Label) {
					return AnnotationHelper.value(vRawValue.Label, {
						context : oDetails.context.getModel()
							.createBindingContext("Label", oDetails.context)
					});
				}

				if (vRawValue.Value && vRawValue.Value.$Path) {
					oNewContext = oDetails.context.getModel().createBindingContext(
						"Value/$Path@com.sap.vocabularies.Common.v1.Label", oDetails.context);
					return AnnotationHelper.value(oNewContext.getObject(""), {
						context : oNewContext
					});
				}
			},

			/**
			 * Returns a data binding according to the result of {@link #getNavigationPath}.
			 *
			 * @param {string} sPath
			 *   The path value from the meta model, for example
			 *   "ToSupplier/@com.sap.vocabularies.Communication.v1.Address" or
			 *   "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"
			 * @returns {string}
			 *   A data binding according to the result of {@link #getNavigationPath}, for example
			 *   "{ToSupplier}" or ""
			 * @throws {Error}
			 *   If the result of {@link #getNavigationPath} contains segments which are not valid
			 *   OData identifiers and violate the data binding syntax
			 *
			 * @public
			 * @since 1.43.0
			 */
			getNavigationBinding : function (sPath) {
				sPath = AnnotationHelper.getNavigationPath(sPath);
				if (rBadChars.test(sPath)) {
					throw new Error("Invalid OData identifier: " + sPath);
				}
				return sPath ? "{" + sPath + "}" : sPath;
			},

			/**
			 * A function that helps to interpret OData V4 annotations. It knows about the syntax
			 * of the path value used by the following dynamic expressions:
			 * <ul>
			 * <li>"14.5.2 Expression edm:AnnotationPath"</li>
			 * <li>"14.5.11 Expression edm:NavigationPropertyPath"</li>
			 * <li>"14.5.12 Expression edm:Path"</li>
			 * <li>"14.5.13 Expression edm:PropertyPath"</li>
			 * </ul>
			 * It returns the path of structural and navigation properties from the given path
			 * value, but removes "$count", types casts, term casts, and annotations of navigation
			 * properties.
			 *
			 * @param {string} sPath
			 *   The path value from the meta model, for example
			 *   "ToSupplier/@com.sap.vocabularies.Communication.v1.Address" or
			 *   "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"
			 * @returns {string}
			 *   The path of structural and navigation properties, for example "ToSupplier" or ""
			 *
			 * @public
			 * @since 1.43.0
			 */
			getNavigationPath : function (sPath) {
				var iIndexOfAt;

				if (!sPath || sPath[0] === "@") {
					return "";
				}

				if (rCount.test(sPath)) {
					return sPath.slice(0, -7);
				}

				iIndexOfAt = sPath.indexOf("@");
				if (iIndexOfAt > -1) {
					sPath = sPath.slice(0, iIndexOfAt);
				}
				if (sPath[sPath.length - 1] === "/") {
					sPath = sPath.slice(0, -1);
				}

				if (sPath.indexOf(".") > -1) {
					sPath = sPath.split("/")
						.filter(function (sSegment) { // remove type casts
							return sSegment.indexOf(".") < 0;
						}).join("/");
				}

				return sPath;
			},

			/**
			 * Determines which type of value list exists for the given property.
			 *
			 * @param {any} vRawValue
			 *   The raw value from the meta model; must be either a property or a path pointing to
			 *   a property (relative to <code>oDetails.schemaChildName</code>)
			 * @param {object} oDetails
			 *   The details object
			 * @param {sap.ui.model.Context} oDetails.context
			 *   Points to the given path, that is
			 *   <code>oDetails.context.getProperty("") === vRawValue</code>
			 * @param {string} oDetails.schemaChildName
			 *   The qualified name of the schema child where the computed annotation has been
			 *   found, for example "name.space.EntityType"
			 * @returns {sap.ui.model.odata.v4.ValueListType}
			 *   The type of the value list
			 * @throws {Error}
			 *   If the property cannot be found in the metadata
			 *
			 * @public
			 * @since 1.47.0
			 */
			getValueListType : function (vRawValue, oDetails) {
				var sPath = typeof vRawValue === "string"
						? "/" + oDetails.schemaChildName + "/" + vRawValue
						: oDetails.context.getPath();

				return oDetails.context.getModel().getValueListType(sPath);
			},

			/**
			 * A function that helps to interpret OData V4 annotations. It knows about the syntax
			 * of the path value used by the following dynamic expressions:
			 * <ul>
			 * <li>"14.5.2 Expression edm:AnnotationPath"</li>
			 * <li>"14.5.11 Expression edm:NavigationPropertyPath"</li>
			 * <li>"14.5.12 Expression edm:Path"</li>
			 * <li>"14.5.13 Expression edm:PropertyPath"</li>
			 * </ul>
			 * It returns the information whether the given path ends with "$count" or with a
			 * multi-valued structural or navigation property. Term casts and annotations of
			 * navigation properties are ignored.
			 *
			 * Examples:
			 * <pre>
			 * &lt;template:if test="{facet>Target/$AnnotationPath@@sap.ui.model.odata.v4.AnnotationHelper.isMultiple}">
			 * </pre>
			 *
			 * @param {string} sPath
			 *   The path value from the meta model, for example
			 *   "ToSupplier/@com.sap.vocabularies.Communication.v1.Address" or
			 *   "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"
			 * @param {object} oDetails
			 *   The details object
			 * @param {sap.ui.model.Context} oDetails.context
			 *   Points to the given path, that is
			 *   <code>oDetails.context.getProperty("") === sPath</code>
			 * @param {string} oDetails.schemaChildName
			 *   The qualified name of the schema child where the computed annotation has been
			 *   found, for example "name.space.EntityType"
			 * @returns {boolean}
			 *   <code>true</code> if the given path ends with "$count" or with a multi-valued
			 *   structural or navigation property, <code>false</code> otherwise
			 *
			 * @public
			 * @since 1.43.0
			 */
			isMultiple : function (sPath, oDetails) {
				var iIndexOfAt;

				if (!sPath || sPath[0] === "@") {
					return false;
				}
				if (rCount.test(sPath)) {
					return true;
				}

				iIndexOfAt = sPath.indexOf("@");
				if (iIndexOfAt > -1) {
					sPath = sPath.slice(0, iIndexOfAt);
				}
				if (sPath[sPath.length - 1] !== "/") {
					sPath += "/";
				}
				sPath = "/" + oDetails.schemaChildName + "/" + sPath + "$isCollection";
				return oDetails.context.getObject(sPath) === true;
			},

			/**
			 * A function that helps to interpret OData V4 annotations. It knows about
			 * <ul>
			 *   <li> the "14.4 Constant Expressions" for "edm:Bool", "edm:Date",
			 *   "edm:DateTimeOffset", "edm:Decimal", "edm:Float", "edm:Guid", "edm:Int",
			 *   "edm:TimeOfDay".
			 *   <li> the constant "14.4.11 Expression edm:String": This is turned into a fixed
			 *   text (e.g. <code>"Width"</code>). String constants that contain a simple binding
			 *   <code>"{@i18n>...}"</code> to the hard-coded model name "@i18n" with arbitrary path
			 *   are not turned into a fixed text, but kept as a data binding expression; this
			 *   allows local annotation files to refer to a resource bundle for
			 *   internationalization.
			 *   <li> the dynamic "14.5.1 Comparison and Logical Operators": These are turned into
			 *   expression bindings to perform the operations at run-time.
			 *   <li> the dynamic "14.5.3 Expression edm:Apply":
			 *   <ul>
			 *     <li> "14.5.3.1.1 Function odata.concat": This is turned into a data binding
			 *     expression.
			 *     <li> "14.5.3.1.2 Function odata.fillUriTemplate": This is turned into an
			 *     expression binding to fill the template at run-time.
			 *     <li> "14.5.3.1.3 Function odata.uriEncode": This is turned into an expression
			 *     binding to encode the parameter at run-time.
			 *     <li> Apply functions may be nested arbitrarily.
			 *   </ul>
			 *   <li> the dynamic "14.5.6 Expression edm:If": This is turned into an expression
			 *   binding to be evaluated at run-time. The expression is a conditional expression
			 *   like <code>"{=condition ? expression1 : expression2}"</code>.
			 *   <li> the dynamic "14.5.10 Expression edm:Null": This is turned into a
			 *   <code>null</code> value. In <code>odata.concat</code> it is ignored.
			 *   <li> the dynamic "14.5.12 Expression edm:Path" and "14.5.13 Expression
			 *   edm:PropertyPath": This is turned into a simple data binding, e.g.
			 *   <code>"{Name}"</code>.
			 * </ul>
			 * Unsupported or incorrect values are turned into a string nevertheless, but indicated
			 * as such. An error describing the problem is logged to the console in such a case.
			 *
			 * Example:
			 * <pre>
			 * &lt;Text text="{meta>Value/@@sap.ui.model.odata.v4.AnnotationHelper.value}" />
			 * </pre>
			 *
			 * @param {any} vRawValue
			 *   The raw value from the meta model
			 * @param {object} oDetails
			 *   The details object
			 * @param {sap.ui.model.Context} oDetails.context
			 *   Points to the given raw value, that is
			 *   <code>oDetails.context.getProperty("") === vRawValue</code>
			 * @returns {string}
			 *   A data binding or a fixed text or a sequence thereof
			 *
			 * @public
			 * @since 1.43.0
			 */
			value : function (vRawValue, oDetails) {
				var sPath = oDetails.context.getPath();

				if (sPath.slice(-1) === "/") {
					// cut off trailing slash, happens with computed annotations
					sPath = sPath.slice(0, -1);
				}
				return Expression.getExpression({
						asExpression : false,
						model : oDetails.context.getModel(),
						path : sPath,
						value : vRawValue
					});
			}
		};

	return AnnotationHelper;
}, /* bExport= */ true);
