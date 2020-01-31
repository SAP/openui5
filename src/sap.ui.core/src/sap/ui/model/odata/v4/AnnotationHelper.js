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
		rPaths = /\$(?:(?:Annotation)|(?:(?:Navigation)?Property))?Path/,
		rSplitPathSegment = /^(.+?\/(\$(?:Annotation)?Path))(\/?)(.*)$/,
		rUnsupportedPathSegments = /\$(?:Navigation)?PropertyPath/,

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
			 * A function that helps to interpret OData V4 annotations. It knows about the following
			 * expressions:
			 * <ul>
			 *   <li>"14.4 Constant Expressions" for "edm:Bool", "edm:Date",
			 *   "edm:DateTimeOffset", "edm:Decimal", "edm:Float", "edm:Guid", "edm:Int",
			 *   "edm:TimeOfDay".
			 *   <li>constant "14.4.11 Expression edm:String": This is turned into a fixed
			 *   text (e.g. <code>"Width"</code>). String constants that contain a simple binding
			 *   <code>"{@i18n>...}"</code> to the hard-coded model name "@i18n" with arbitrary path
			 *   are not turned into a fixed text, but kept as a data binding expression; this
			 *   allows local annotation files to refer to a resource bundle for
			 *   internationalization.
			 *   <li>dynamic "14.5.1 Comparison and Logical Operators": These are turned into
			 *   expression bindings to perform the operations at runtime.
			 *   <li>dynamic "14.5.3 Expression edm:Apply":
			 *   <ul>
			 *     <li>"14.5.3.1.1 Function odata.concat": This is turned into a data binding
			 *     expression relative to an entity.
			 *     <li>"14.5.3.1.2 Function odata.fillUriTemplate": This is turned into an
			 *     expression binding to fill the template at runtime.
			 *     <li>"14.5.3.1.3 Function odata.uriEncode": This is turned into an expression
			 *     binding to encode the parameter at runtime.
			 *     <li>Apply functions may be nested arbitrarily.
			 *   </ul>
			 *   <li>dynamic "14.5.6 Expression edm:If": This is turned into an expression
			 *   binding to be evaluated at runtime. The expression is a conditional expression
			 *   like <code>"{=condition ? expression1 : expression2}"</code>.
			 *   <li>dynamic "14.5.10 Expression edm:Null": This is turned into a
			 *   <code>null</code> value. It is ignored in <code>odata.concat</code>.
			 *   <li>dynamic "14.5.12 Expression edm:Path" and "14.5.13 Expression
			 *   edm:PropertyPath": This is turned into a data binding relative to an entity,
			 *   including type information and constraints as available from metadata,
			 *   e.g. <code>"{path : 'Name', type : 'sap.ui.model.odata.type.String',
			 *   constraints : {'maxLength':'255'}}"</code>.
			 *   Depending on the used type, some additional constraints of this type are set:
			 *   <ul>
			 *     <li>Edm.DateTime: The "displayFormat" constraint is set to the value of the
			 *     "sap:display-format" annotation of the referenced property.
			 *     <li>Edm.Decimal: The "precision" and "scale" constraints are set to the values
			 *     of the corresponding attributes of the referenced property. The "minimum",
			 *     "maximum", "minimumExclusive" and "maximumExlusive" constraints are set to the
			 *     values of the corresponding "Org.OData.Validation.V1" annotation of the
			 *     referenced property; note that in this case only constant expressions are
			 *     supported to determine the annotation value.
			 *     <li>Edm.String: The "maxLength" constraint is set to the value of the
			 *     corresponding attribute of the referenced property, and the "isDigitSequence"
			 *     constraint is set to the value of the
			 *     "com.sap.vocabularies.Common.v1.IsDigitSequence" annotation of the referenced
			 *     property; note that in this case only constant expressions are supported to
			 *     determine the annotation value.
			 *   </ul>
			 * </ul>
			 *
			 * If <code>oDetails.context.getPath()</code> contains a single "$AnnotationPath" or
			 * "$Path" segment, the value corresponding to that segment is considered as a data
			 * binding path prefix whenever a dynamic "14.5.12 Expression edm:Path" or
			 * "14.5.13 Expression edm:PropertyPath" is turned into a data binding. Use
			 * {@link sap.ui.model.odata.v4.AnnotationHelper.resolve$Path} to avoid these prefixes
			 * in cases where they are not applicable.
			 *
			 * Unsupported or incorrect values are turned into a string nevertheless, but indicated
			 * as such. Proper escaping is used to make sure that data binding syntax is not
			 * corrupted. In such a case, an error describing the problem is logged to the console.
			 *
			 * Example:
			 * <pre>
			 * &lt;Text text="{meta>Value/@@sap.ui.model.odata.v4.AnnotationHelper.format}" />
			 * </pre>
			 *
			 * Example for "$Path" in the context's path:
			 * <pre>
			 * &lt;Annotations Target="com.sap.gateway.default.iwbep.tea_busi.v0001.EQUIPMENT">
			 *	&lt;Annotation Term="com.sap.vocabularies.UI.v1.LineItem">
			 *		&lt;Collection>
			 *			&lt;Record Type="com.sap.vocabularies.UI.v1.DataField">
			 *				&lt;PropertyValue Property="Value" Path="EQUIPMENT_2_PRODUCT/Name" />
			 *			&lt;/Record>
			 *		&lt;/Collection>
			 *	&lt;/Annotation>
			 * &lt;/Annotations>
			 * &lt;Annotations Target="com.sap.gateway.default.iwbep.tea_busi_product.v0001.Product/Name">
			 *	&lt;Annotation Term="com.sap.vocabularies.Common.v1.QuickInfo" Path="PRODUCT_2_SUPPLIER/Supplier_Name" />
			 * &lt;/Annotations>
			 * </pre>
			 * <pre>
			 * &lt;Text text="{meta>/Equipments/@com.sap.vocabularies.UI.v1.LineItem/0/Value/$Path@com.sap.vocabularies.Common.v1.QuickInfo@@sap.ui.model.odata.v4.AnnotationHelper.format}" />
			 * </pre>
			 * <code>format</code> returns a binding with path
			 * "EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/Supplier_Name".
			 *
			 * Example for "$AnnotationPath" in the context's path:
			 * <pre>
			 * &lt;Annotations Target="com.sap.gateway.default.iwbep.tea_busi.v0001.EQUIPMENT">
			 *	&lt;Annotation Term="com.sap.vocabularies.UI.v1.Facets">
			 *		&lt;Collection>
			 *			&lt;Record Type="com.sap.vocabularies.UI.v1.ReferenceFacet">
			 *				&lt;PropertyValue Property="Target" AnnotationPath="EQUIPMENT_2_PRODUCT/@com.sap.vocabularies.Common.v1.QuickInfo" />
			 *			&lt;/Record>
			 *		&lt;/Collection>
			 *	&lt;/Annotation>
			 * &lt;/Annotations>
			 * &lt;Annotations Target="com.sap.gateway.default.iwbep.tea_busi_product.v0001.Product">
			 *	&lt;Annotation Term="com.sap.vocabularies.Common.v1.QuickInfo" Path="Name" />
			 * &lt;/Annotations>
			 * </pre>
			 * <pre>
			 * &lt;Text text="{meta>/Equipments/@com.sap.vocabularies.UI.v1.Facets/0/Target/$AnnotationPath/@@sap.ui.model.odata.v4.AnnotationHelper.format}" />
			 * </pre>
			 * <code>format</code> returns a binding with path "EQUIPMENT_2_PRODUCT/Name".
			 *
			 * Since 1.73.0 in addition to supporting annotations, this function also can be used to
			 * interpret action or function parameters as a binding string.
			 *
			 * See an example of the metadata for an unbound action "AcChangeTeamBudgetByID":
			 * <pre>
			 *    &lt;Action Name="AcChangeTeamBudgetByID">
			 *        &lt;Parameter Name="TeamID" Type="Edm.String" Nullable="false" MaxLength="10"/>
			 *        &lt;Parameter Name="Budget" Type="Edm.Decimal" Nullable="false" Precision="16" Scale="variable"/>
			 *    &lt;/Action>
			 * </pre>
			 *
			 * Let <code>ChangeTeamBudgetByID</code> be the action import of this action. Using
			 * <code>AnnotationHelper.format</code> for the <code>TeamID</code> like
			 * <pre>
			 * &lt;Text text="{meta>/ChangeTeamBudgetByID/TeamID@@sap.ui.model.odata.v4.AnnotationHelper.format}" />
			 * </pre>
			 * returns the following binding string which contains information about path, type and
			 * constraints:
			 * <pre>
			 * &lt;Text text="{path:'TeamID',type:'sap.ui.model.odata.type.String',constraints:{'maxLength':10,'nullable':false}" />
			 * </pre>
			 *
			 * Since 1.71.0, for annotations on an operation or a parameter, the binding parameter's
			 * name is stripped off any dynamic "14.5.12 Expression edm:Path" and
			 * "14.5.13 Expression edm:PropertyPath" where it might be used as a first segment.
			 * Since 1.76.0 this does not apply to annotations on a parameter.
			 * In the former case, we assume that the resulting data binding is
			 * relative to the parent context of the operation binding, that is, to the context
			 * representing the binding parameter itself.
			 * In the latter case, we assume that the resulting data binding is relative to the
			 * parameter context of the operation binding (see
			 * {@link sap.ui.model.odata.v4.ODataContextBinding#getParameterContext}).
			 *
			 * Example:
			 * <pre>
			 *    &lt;Action Name="ShipProduct" EntitySetPath="_it" IsBound="true" >
			 *        &lt;Parameter Name="_it" Type="name.space.Product" Nullable="false"/>
			 *        &lt;Parameter Name="City" Type="Edm.String"/>
			 *    &lt;/Action>
			 * </pre>
			 * For the operation <code>ShipProduct</code> mentioned above, the following annotation
			 * targets an operation parameter and refers back to the binding parameter.
			 * <pre>
			 *     &lt;Annotations Target="name.space.ShipProduct(name.space.Product)/City">
			 *        &lt;Annotation Term="com.sap.vocabularies.Common.v1.Text" Path="_it/SupplierIdentifier"/>
			 *     &lt;/Annotations>
			 * </pre>
			 *
			 * Using <code>AnnotationHelper.format</code> like
			 * <pre>
			 * &lt;Text text="{meta>/Products/name.space.ShipProduct/$Parameter/City@com.sap.vocabularies.Common.v1.Text@@sap.ui.model.odata.v4.AnnotationHelper.format}" />
			 * </pre>
			 * results in
			 * <pre>
			 * &lt;Text text="{path:'_it/SupplierIdentifier',type:'sap.ui.model.odata.type.Int32'}" />
			 * </pre>
			 * and the data binding evaluates to the <code>SupplierIdentifier</code> property of the
			 * entity the operation is called on.
			 *
			 * @param {any} vRawValue
			 *   The raw value from the meta model
			 * @param {object} oDetails
			 *   The details object
			 * @param {sap.ui.model.Context} oDetails.context
			 *   Points to the given raw value, that is
			 *   <code>oDetails.context.getProperty("") === vRawValue</code>
			 * @param {object} [oDetails.overload]
			 *   The single operation overload that was targeted by annotations on an operation or
			 *   a parameter; needed to strip off the binding parameter's name from any dynamic
			 *   "14.5.12 Expression edm:Path" and "14.5.13 Expression edm:PropertyPath" where it
			 *   might be used as a first segment (since 1.71.0). This does not apply to annotations
			 *   on a parameter (since 1.76.0)
			 * @returns {string|Promise}
			 *   A data binding, or a fixed text, or a sequence thereof, or a <code>Promise</code>
			 *   resolving with that string, for example if not all type information is already
			 *   available
			 * @throws {Error}
			 *   If <code>oDetails.context.getPath()</code> contains a "$PropertyPath" or a
			 *   "$NavigationPropertyPath" segment, or if it contains more than one
			 *   "$AnnotationPath" or "$Path" segment
			 *
			 * @public
			 * @see sap.ui.model.odata.v4.AnnotationHelper.resolve$Path
			 * @see sap.ui.model.odata.v4.AnnotationHelper.value
			 * @since 1.63.0
			 */
			format : function (vRawValue, oDetails) {
				var aMatches,
					oModel = oDetails.context.getModel(),
					sPath = oDetails.context.getPath();

				function getExpression(sPrefix) {
					if (sPath.slice(-1) === "/") {
						// cut off trailing slash, happens with computed annotations
						sPath = sPath.slice(0, -1);
					}
					return Expression.getExpression({
							asExpression : false,
							complexBinding : true,
							ignoreAsPrefix : oDetails.overload && oDetails.overload.$IsBound
								&& !sPath.includes("/$Parameter/")
								? oDetails.overload.$Parameter[0].$Name + "/"
								: "",
							model : oModel,
							path : sPath,
							prefix : sPrefix, // prefix for computing paths
							value : vRawValue,
							// ensure that type information is available in sub paths of the
							// expression even if for that sub path no complex binding is needed,
							// e.g. see sap.ui.model.odata.v4_AnnotationHelperExpression.operator
							$$valueAsPromise : true
						});
				}

				aMatches = rUnsupportedPathSegments.exec(sPath);
				if (aMatches) {
					throw new Error("Unsupported path segment " + aMatches[0] + " in " + sPath);
				}

				// aMatches[0] - sPath, e.g. "/Equipments/@UI.LineItem/4/Value/$Path@Common.Label"
				// aMatches[1] - prefix of sPath including $Path or $AnnotationPath, e.g.
				//             "/Equipments/@UI.LineItem/4/Value/$Path"
				// aMatches[2] - "$AnnotationPath" or "$Path"
				// aMatches[3] - optional "/" after "$AnnotationPath" or "$Path"
				// aMatches[4] - rest of sPath, e.g. "@Common.Label"
				aMatches = rSplitPathSegment.exec(sPath);
				if (aMatches && sPath.length > aMatches[1].length) {
					if (rSplitPathSegment.test(aMatches[4])) {
						throw new Error("Only one $Path or $AnnotationPath segment is supported: "
							+ sPath);
					}

					return oModel.fetchObject(aMatches[1]).then(function (sPathValue) {
						var i,
							bIsAnnotationPath = aMatches[2] === "$AnnotationPath",
							sPrefix = bIsAnnotationPath
								? sPathValue.split("@")[0]
								: sPathValue;

						if (!bIsAnnotationPath && aMatches[3]) {
							sPrefix = sPrefix + "/";
						} else if (!sPrefix.endsWith("/")) {
							i = sPrefix.lastIndexOf("/");
							sPrefix = i < 0 ? "" : sPrefix.slice(0, i + 1);
						}
						return getExpression(sPrefix);
					});
				}
				return getExpression("");
			},

			/**
			 * Returns a data binding according to the result of
			 * {@link sap.ui.model.odata.v4.AnnotationHelper.getNavigationPath}.
			 *
			 * @param {string} sPath
			 *   The path value from the meta model, for example
			 *   "ToSupplier/@com.sap.vocabularies.Communication.v1.Address" or
			 *   "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"
			 * @returns {string}
			 *   A data binding according to the result of
			 *   {@link sap.ui.model.odata.v4.AnnotationHelper.getNavigationPath}, for example
			 *   "{ToSupplier}" or ""
			 * @throws {Error}
			 *   If the result of {@link sap.ui.model.odata.v4.AnnotationHelper.getNavigationPath}
			 *   contains segments which are not valid OData identifiers and violate the data
			 *   binding syntax
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
			 * value, but removes "$count", types casts, term casts, and annotations on navigation
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
			 * @param {boolean} [oDetails.$$valueAsPromise]
			 *   Whether a <code>Promise</code> may be returned if the needed metadata is not yet
			 *   loaded (since 1.57.0)
			 * @param {sap.ui.model.Context} oDetails.context
			 *   Points to the given path, that is
			 *   <code>oDetails.context.getProperty("") === vRawValue</code>
			 * @param {string} oDetails.schemaChildName
			 *   The qualified name of the schema child where the computed annotation has been
			 *   found, for example "name.space.EntityType"
			 * @returns {sap.ui.model.odata.v4.ValueListType|Promise}
			 *   The type of the value list or a <code>Promise</code> resolving with the type of the
			 *   value list or rejected, if the property cannot be found in the metadata
			 * @throws {Error}
			 *   If the property cannot be found in the metadata, or if
			 *   <code>$$valueAsPromise</code> is not set to <code>true</code> and the metadata is
			 *   not yet loaded
			 *
			 * @public
			 * @since 1.47.0
			 */
			getValueListType : function (vRawValue, oDetails) {
				var sPath = typeof vRawValue === "string"
						? "/" + oDetails.schemaChildName + "/" + vRawValue
						: oDetails.context.getPath();

				return oDetails.$$valueAsPromise
					? oDetails.context.getModel().fetchValueListType(sPath).unwrap()
					: oDetails.context.getModel().getValueListType(sPath);
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
			 * multi-valued structural or navigation property. Term casts and annotations on
			 * navigation properties are ignored.
			 *
			 * Example:
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
			 * @param {boolean} [oDetails.$$valueAsPromise]
			 *   Whether a <code>Promise</code> may be returned if the needed metadata is not yet
			 *   loaded (since 1.57.0)
			 * @param {sap.ui.model.Context} oDetails.context
			 *   Points to the given path, that is
			 *   <code>oDetails.context.getProperty("") === sPath</code>
			 * @param {string} oDetails.schemaChildName
			 *   The qualified name of the schema child where the computed annotation has been
			 *   found, for example "name.space.EntityType"
			 * @returns {boolean|Promise}
			 *   <code>true</code> if the given path ends with "$count" or with a multi-valued
			 *   structural or navigation property, <code>false</code> otherwise. If
			 *   <code>oDetails.$$valueAsPromise</code> is <code>true</code> a <code>Promise</code>
			 *   may be returned resolving with the boolean value.
			 *
			 * @public
			 * @since 1.43.0
			 */
			isMultiple : function (sPath, oDetails) {
				var iIndexOfAt;

				// Whether the given value is exactly <code>true</code>
				function isTrue (vValue) {
					return vValue === true;
				}

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
				return oDetails.$$valueAsPromise
					? oDetails.context.getModel().fetchObject(sPath).then(isTrue).unwrap()
					: oDetails.context.getObject(sPath) === true;
			},

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
			 * @param {boolean} [oDetails.$$valueAsPromise]
			 *   Whether a <code>Promise</code> may be returned if the needed metadata is not yet
			 *   loaded (since 1.57.0)
			 * @param {sap.ui.model.Context} oDetails.context
			 *   Points to the given raw value, that is
			 *   <code>oDetails.context.getProperty("") === vRawValue</code>
			 * @returns {string|Promise}
			 *   A data binding or a fixed text or a sequence thereof or <code>undefined</code>. If
			 *   <code>oDetails.$$valueAsPromise</code> is <code>true</code> a <code>Promise</code>
			 *   may be returned resolving with the value for the label.
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
					if (oDetails.$$valueAsPromise) {
						return oNewContext.getModel().fetchObject("", oNewContext)
							.then(function (oRawValue0) {
								return AnnotationHelper.value(oRawValue0, {
									context : oNewContext
								});
							}).unwrap();
					}
					return AnnotationHelper.value(oNewContext.getObject(""), {
						context : oNewContext
					});
				}
			},

			/**
			 * Helper function for a <code>template:with</code> instruction that returns an
			 * equivalent to the given context's path, without "$AnnotationPath",
			 * "$NavigationPropertyPath", "$Path", and "$PropertyPath" segments.
			 *
			 * @param {sap.ui.model.Context} oContext
			 *   A context which belongs to an {@link sap.ui.model.odata.v4.ODataMetaModel}
			 * @returns {string}
			 *   An equivalent to the given context's path, without the mentioned segments
			 * @throws {Error}
			 *   If one of the mentioned segments has a non-string value and thus the path cannot
			 *   be resolved
			 *
			 * @public
			 * @see sap.ui.model.odata.v4.AnnotationHelper.format
			 * @since 1.63.0
			 */
			resolve$Path : function (oContext) {
				var iEndOfPath, // after $*Path
					iIndexOfAt, // first "@" before $*Path
					iIndexOfPath, // begin of $*Path
					iLastIndexOfSlash, // last "/" before iIndexOfAt
					aMatches,
					sPath = oContext.getPath(),
					sPrefix,
					vValue;

				for (;;) {
					aMatches = sPath.match(rPaths);
					if (!aMatches) {
						return sPath;
					}

					iIndexOfPath = aMatches.index;
					iEndOfPath = iIndexOfPath + aMatches[0].length;
					sPrefix = sPath.slice(0, iEndOfPath);
					vValue = oContext.getModel().getObject(sPrefix);
					if (typeof vValue !== "string") {
						throw new Error("Cannot resolve " + sPrefix
							+ " due to unexpected value " + vValue);
					}

					sPrefix = sPath.slice(0, iIndexOfPath);
					iIndexOfAt = sPrefix.indexOf("@");
					iLastIndexOfSlash = sPrefix.lastIndexOf("/", iIndexOfAt);
					if (iLastIndexOfSlash === 0) { // do not cut off entity set
						sPrefix = sPrefix.slice(0, iIndexOfAt);
						if (iIndexOfAt > 1 && vValue) {
							sPrefix += "/";
						}
					} else { // cut off property, but end with slash
						sPrefix = sPrefix.slice(0, iLastIndexOfSlash + 1);
					}

					sPath = sPrefix + vValue + sPath.slice(iEndOfPath);
				}
			},

			/**
			 * A function that helps to interpret OData V4 annotations. It knows about the following
			 * expressions:
			 * <ul>
			 *   <li>"14.4 Constant Expressions" for "edm:Bool", "edm:Date",
			 *   "edm:DateTimeOffset", "edm:Decimal", "edm:Float", "edm:Guid", "edm:Int",
			 *   "edm:TimeOfDay".
			 *   <li>constant "14.4.11 Expression edm:String": This is turned into a fixed
			 *   text (e.g. <code>"Width"</code>). String constants that contain a simple binding
			 *   <code>"{@i18n>...}"</code> to the hard-coded model name "@i18n" with arbitrary path
			 *   are not turned into a fixed text, but kept as a data binding expression; this
			 *   allows local annotation files to refer to a resource bundle for
			 *   internationalization.
			 *   <li>dynamic "14.5.1 Comparison and Logical Operators": These are turned into
			 *   expression bindings to perform the operations at runtime.
			 *   <li>dynamic "14.5.3 Expression edm:Apply":
			 *   <ul>
			 *     <li>"14.5.3.1.1 Function odata.concat": This is turned into a data binding
			 *     expression.
			 *     <li>"14.5.3.1.2 Function odata.fillUriTemplate": This is turned into an
			 *     expression binding to fill the template at runtime.
			 *     <li>"14.5.3.1.3 Function odata.uriEncode": This is turned into an expression
			 *     binding to encode the parameter at runtime.
			 *     <li>Apply functions may be nested arbitrarily.
			 *   </ul>
			 *   <li>dynamic "14.5.6 Expression edm:If": This is turned into an expression
			 *   binding to be evaluated at runtime. The expression is a conditional expression
			 *   like <code>"{=condition ? expression1 : expression2}"</code>.
			 *   <li>dynamic "14.5.10 Expression edm:Null": This is turned into a
			 *   <code>null</code> value. It is ignored in <code>odata.concat</code>.
			 *   <li>dynamic "14.5.12 Expression edm:Path" and "14.5.13 Expression
			 *   edm:PropertyPath": This is turned into a simple data binding, e.g.
			 *   <code>"{Name}"</code>.
			 * </ul>
			 * Unsupported or incorrect values are turned into a string nevertheless, but indicated
			 * as such. In such a case, an error describing the problem is logged to the console.
			 *
			 * Example:
			 * <pre>
			 * &lt;Text text="{meta>Value/@@sap.ui.model.odata.v4.AnnotationHelper.value}" />
			 * </pre>
			 *
			 * Since 1.71.0, for annotations on an operation or a parameter, the binding parameter's
			 * name is stripped off any dynamic "14.5.12 Expression edm:Path" and
			 * "14.5.13 Expression edm:PropertyPath" where it might be used as a first segment.
			 * Since 1.76.0 this does not apply to annotations on a parameter.
			 * In the former case, we assume that the resulting data binding is
			 * relative to the parent context of the operation binding, that is, to the context
			 * representing the binding parameter itself.
			 * In the latter case, we assume that the resulting data binding is relative to the
			 * parameter context of the operation binding (see
			 * {@link sap.ui.model.odata.v4.ODataContextBinding#getParameterContext}).
			 *
			 * @param {any} vRawValue
			 *   The raw value from the meta model
			 * @param {object} oDetails
			 *   The details object
			 * @param {sap.ui.model.Context} oDetails.context
			 *   Points to the given raw value, that is
			 *   <code>oDetails.context.getProperty("") === vRawValue</code>
			 * @param {object} [oDetails.overload]
			 *   The single operation overload that was targeted by annotations on an operation or
			 *   a parameter; needed to strip off the binding parameter's name from any dynamic
			 *   "14.5.12 Expression edm:Path" and "14.5.13 Expression edm:PropertyPath" where it
			 *   might be used as a first segment (since 1.72.0). This does not apply to annotations
			 *   on a parameter (since 1.76.0)
			 * @returns {string}
			 *   A data binding or a fixed text or a sequence thereof
			 *
			 * @public
			 * @see sap.ui.model.odata.v4.AnnotationHelper.format
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
						complexBinding : false,
						ignoreAsPrefix : oDetails.overload && oDetails.overload.$IsBound
							&& !sPath.includes("/$Parameter/")
							? oDetails.overload.$Parameter[0].$Name + "/"
							: "",
						model : oDetails.context.getModel(),
						path : sPath,
						prefix : "",
						value : vRawValue,
						$$valueAsPromise : oDetails.$$valueAsPromise
					});
			}
		};

	return AnnotationHelper;
}, /* bExport= */ true);
