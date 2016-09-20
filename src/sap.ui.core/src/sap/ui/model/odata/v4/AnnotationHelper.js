/*!
 * ${copyright}
 */
sap.ui.define([], function () {
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
			 * @public
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
			 * @public
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

				if (sPath.indexOf(".")) {
					sPath = sPath.split("/")
						.filter(function (sSegment) { // remove type casts
							return sSegment.indexOf(".") < 0;
						}).join("/");
				}

				return sPath;
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
			 * @public
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
			}
		};

	return AnnotationHelper;
}, /* bExport= */ true);
