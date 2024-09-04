/*!
 * ${copyright}
 */
/*eslint-disable max-len */
sap.ui.define([
	"./_ODataMetaModelUtils",
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/ui/base/BindingParser",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/_Helper",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ClientContextBinding",
	"sap/ui/model/Context",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/MetaModel",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/json/JSONPropertyBinding",
	"sap/ui/model/json/JSONTreeBinding"
], function (Utils, Log, isEmptyObject, BindingParser, ManagedObject, SyncPromise, _Helper, BindingMode,
		ClientContextBinding, Context, FilterProcessor, MetaModel, JSONListBinding, JSONModel, JSONPropertyBinding,
		JSONTreeBinding) {
	"use strict";

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable} sap.ui.model.odata.ODataMetaModel.AbstractProperty
	 *
	 * The abstraction of an OData property.
	 *
	 * @property {string} name
	 *   The name of the property
	 * @property {string} [default]
	 *   The default value of the property
	 * @property {"false"|"true"} [nullable]
	 *   Whether this property can be <code>null</code>
	 * @property {"false"|"true"} [readOnly]
	 *   Whether this property is read-only
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.Annotatable
	 *
	 * An OData metadata element which can be annotated. For annotations from SAP or OData vocabularies, it may contain
	 * properties like <code>com.sap.vocabularies.Common.v1.Label</code> with the annotation value as an object.
	 * For annotations from the "http://www.sap.com/Protocols/SAPData" namespace, it may contain properties like
	 * <code>sap:label</code> with the annotation value as a string. For details on annotation representation, see
	 * {@link sap.ui.model.odata.ODataMetaModel ODataMetaModel} resp.
	 * {@link topic:6c47b2b39db9404582994070ec3d57a2%23loio341823349ed04df1813197f2a0d71db2 OData V2 Model - Meta Model
	 * for OData V2}.
	 *
	 * @property {Array<sap.ui.model.odata.ODataMetaModel.Extension>} [extensions]
	 *   The array of extension elements, see {@link sap.ui.model.odata.ODataMetaModel.Extension Extension}
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.Extension
	 *
	 * An extension object generated from OData annotations.
	 *
	 * @property {string} name
	 *   The name of the extension
	 * @property {string} namespace
	 *   The namespace of the extension
	 * @property {string} value
	 *   The value of the extension
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.BinaryProperty
	 *
	 * A property of type <code>Edm.Binary</code>, see
	 * <a href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem" target="_blank">
	 * <code>Edm.Binary</code></a>.
	 *
	 * @property {"Edm.Binary"} type
	 *   The type name
	 * @property {string} [maxLength]
	 *   The maximum size of the binary data
	 * @property {"false"|"true"} [fixedLength]
	 *   Whether the length can vary
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.BooleanProperty
	 *
	 * A property of type <code>Edm.Boolean</code>, see the corresponding UI5 type
	 * {@link sap.ui.model.odata.type.Boolean}.
	 *
	 * @property {"Edm.Boolean"} type
	 *   The type name
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.ByteProperty
	 *
	 * A property of type <code>Edm.Byte</code>, see the corresponding UI5 type {@link sap.ui.model.odata.type.Byte}.
	 *
	 * @property {"Edm.Byte"} type
	 *   The type name
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.DateTimeProperty
	 *
	 * A property of type <code>Edm.DateTime</code>, see the corresponding UI5 type
	 * {@link sap.ui.model.odata.type.DateTime}.
	 *
	 * @property {"Edm.DateTime"} type
	 *   The type name
	 * @property {string} [precision]
	 *   The maximum number of fractional seconds
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.DateTimeOffsetProperty
	 *
	 * A property of type <code>Edm.DateTimeOffset</code>, see the corresponding UI5 type
	 * {@link sap.ui.model.odata.type.DateTimeOffset}.
	 *
	 * @property {"Edm.DateTimeOffset"} type
	 *   The type name
	 * @property {string} [precision]
	 *   The maximum number of fractional seconds
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.DecimalProperty
	 *
	 * A property of type <code>Edm.Decimal</code>, see the corresponding UI5 type
	 * {@link sap.ui.model.odata.type.Decimal}.
	 *
	 * @property {"Edm.Decimal"} type
	 *   The type name
	 * @property {string} [precision]
	 *   The maximum number of decimal digits
	 * @property {string} [scale]
	 *   The maximum number of decimal digits to the right of the decimal point
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.DoubleProperty
	 *
	 * A property of type <code>Edm.Double</code>, see the corresponding UI5 type
	 * {@link sap.ui.model.odata.type.Double}.
	 *
	 * @property {"Edm.Double"} type
	 *   The type name
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.GuidProperty
	 *
	 * A property of type <code>Edm.Guid</code>, see the corresponding UI5 type {@link sap.ui.model.odata.type.Guid}.
	 *
	 * @property {"Edm.Guid"} type
	 *   The type name
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.Int16Property
	 *
	 * A property of type <code>Edm.Int16</code>, see the corresponding UI5 type {@link sap.ui.model.odata.type.Int16}.
	 *
	 * @property {"Edm.Int16"} type
	 *   The type name
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.Int32Property
	 *
	 * A property of type <code>Edm.Int32</code>, see the corresponding UI5 type {@link sap.ui.model.odata.type.Int32}.
	 *
	 * @property {"Edm.Int32"} type
	 *   The type name
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.Int64Property
	 *
	 * A property of type <code>Edm.Int64</code>, see the corresponding UI5 type {@link sap.ui.model.odata.type.Int64}.
	 *
	 * @property {"Edm.Int64"} type
	 *   The type name
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.SByteProperty
	 *
	 * A property of type <code>Edm.SByte</code>, see the corresponding UI5 type {@link sap.ui.model.odata.type.SByte}.
	 *
	 * @property {"Edm.SByte"} type
	 *   The type name
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.SingleProperty
	 *
	 * A property of type <code>Edm.Single</code>, see the corresponding UI5 type
	 * {@link sap.ui.model.odata.type.Single}.
	 *
	 * @property {"Edm.Single"} type
	 *   The type name
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.StreamProperty
	 *
	 * A property of type <code>Edm.Stream</code>, see the corresponding UI5 type
	 * {@link sap.ui.model.odata.type.Stream}.
	 *
	 * @property {"Edm.Stream"} type
	 *   The type name
	 * @property {"false"|"true"} [fixedLength]
	 *   Whether the stream requires a fixed length
	 * @property {string} [maxLength]
	 *   The maximal length of the stream
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.StringProperty
	 *
	 * A property of type <code>Edm.String</code>, see the corresponding UI5 type
	 * {@link sap.ui.model.odata.type.String}.
	 *
	 * @property {"Edm.String"} type
	 *   The type name
	 * @property {"false"|"true"} [fixedLength]
	 *   Whether the string requires a fixed length
	 * @property {string} [maxLength]
	 *   The maximal length of the string
	 * @property {"false"|"true"} [unicode]
	 *   Whether Unicode characters are used instead of ASCII characters
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.AbstractProperty} sap.ui.model.odata.ODataMetaModel.TimeProperty
	 *
	 * A property of type <code>Edm.Time</code>, see the corresponding UI5 type {@link sap.ui.model.odata.type.Time}.
	 *
	 * @property {"Edm.Time"} type
	 *   The type name
	 * @property {string} [precision]
	 *   The maximum number of fractional seconds
	 *
	 * @public
	 */

	/**
	 * The alias type for an OData property of an entity type; the alias comprises all supported OData EDM types.
	 *
	 * @typedef {
	 *   sap.ui.model.odata.ODataMetaModel.BinaryProperty |
	 *   sap.ui.model.odata.ODataMetaModel.BooleanProperty |
	 *   sap.ui.model.odata.ODataMetaModel.ByteProperty |
	 *   sap.ui.model.odata.ODataMetaModel.DateTimeProperty |
	 *   sap.ui.model.odata.ODataMetaModel.DateTimeOffsetProperty |
	 *   sap.ui.model.odata.ODataMetaModel.DecimalProperty |
	 *   sap.ui.model.odata.ODataMetaModel.DoubleProperty |
	 *   sap.ui.model.odata.ODataMetaModel.GuidProperty |
	 *   sap.ui.model.odata.ODataMetaModel.Int16Property |
	 *   sap.ui.model.odata.ODataMetaModel.Int32Property |
	 *   sap.ui.model.odata.ODataMetaModel.Int64Property |
	 *   sap.ui.model.odata.ODataMetaModel.SByteProperty |
	 *   sap.ui.model.odata.ODataMetaModel.SingleProperty |
	 *   sap.ui.model.odata.ODataMetaModel.StreamProperty |
	 *   sap.ui.model.odata.ODataMetaModel.StringProperty |
	 *   sap.ui.model.odata.ODataMetaModel.TimeProperty
	 * } sap.ui.model.odata.ODataMetaModel.Property
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable} sap.ui.model.odata.ODataMetaModel.AssociationEnd
	 *
	 * An object representing one end of an OData association.
	 *
	 * @property {string} type
	 *   The qualified name of the entity type at the end of the association
	 * @property {"0" | "0..1" | "*"} multiplicity
	 *   The multiplicity of the association end
	 * @property {string} role
	 *   The name of the association role
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable} sap.ui.model.odata.ODataMetaModel.AssociationSet
	 *
	 * An object representing an OData association set.
	 *
	 * @property {string} association
	 *   The qualified name of the association set's association; the value is identical to the corresponding
	 *   XML attribute value in the service metadata document.
	 * @property {Array<sap.ui.model.odata.ODataMetaModel.AssociationSetEnd>} end
	 *   The two ends of the association set
	 * @property {string} name
	 *   The association set's name
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable} sap.ui.model.odata.ODataMetaModel.AssociationSetEnd
	 *
	 * An object representing one end of an OData association set.
	 *
	 * @property {string} entitySet
	 *   The entity set's name at the end of the association
	 * @property {string} role
	 *   The name of the association role
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable} sap.ui.model.odata.ODataMetaModel.ComplexType
	 *
	 * An object representing an OData complex type.
	 *
	 * @property {string} $path
	 *   The path to the complex type
	 * @property {string} name
	 *   The complex type's name
	 * @property {string} namespace
	 *   The complex type's namespace
	 * @property {Array<sap.ui.model.odata.ODataMetaModel.Property>} property
	 *   The complex type's properties
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.PropertyRef
	 *
	 * An object representing an OData property reference.
	 *
	 * @property {string} name
	 *   The property name
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.EntityKey
	 *
	 * An object representing an OData entity type's key.
	 *
	 * @property {Array<sap.ui.model.odata.ODataMetaModel.PropertyRef>} propertyRef
	 *   The references to the properties defining the entity type's key
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable} sap.ui.model.odata.ODataMetaModel.EntitySet
	 *
	 * An object representing an OData entity set.
	 *
	 * @property {string} entityType
	 *   The qualified name of the entity set's entity type
	 * @property {string} name
	 *   The name of the entity set
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable} sap.ui.model.odata.ODataMetaModel.NavigationProperty
	 *
	 * An OData navigation property of an entity type.
	 *
	 * @property {string} name
	 *   The name of the navigation property
	 * @property {string} fromRole
	 *   The name of the starting point for the navigation; refers to a role defined in the association
	 * @property {string} relationship
	 *   The qualified name of the navigation property's association
	 * @property {string} toRole
	 *   The name of the other end of the relationship; refers to a role defined in the association
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable} sap.ui.model.odata.ODataMetaModel.EntityType
	 *
	 * An object representing an OData entity type.
	 *
	 * @property {string} $path
	 *   The path to the entity type
	 * @property {sap.ui.model.odata.ODataMetaModel.EntityKey} key
	 *   The entity type's key
	 * @property {string} name
	 *   The entity type's name
	 * @property {string} namespace
	 *   The entity type's namespace
	 * @property {Array<sap.ui.model.odata.ODataMetaModel.NavigationProperty>} [navigationProperty]
	 *   The entity type's navigation properties
	 * @property {Array<sap.ui.model.odata.ODataMetaModel.Property>} [property]
	 *   The entity type's properties
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable}
	 *   sap.ui.model.odata.ODataMetaModel.FunctionImportParameter
	 *
	 * An object representing an OData function import parameter.
	 *
	 * @property {string} name
	 *   The function import parameter's name
	 * @property {string} type
	 *   The function import parameter's type; the value is identical to the corresponding XML attribute value in the
	 *   service metadata document.
	 * @property {"false"|"true"} [fixedLength]
	 *   The fixedLength constraint if supported by the function import parameter's type
	 * @property {string} [maxLength]
	 *   The maxLength constraint if supported by the function import parameter's type
	 * @property {"In"|"InOut"|"Out"} [mode]
	 *   The function import parameter's mode
	 * @property {string} [precision]
	 *   The precision constraint if supported by the function import parameter's type
	 * @property {string} [scale]
	 *   The scale constraint if supported by the function import parameter's type
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable} sap.ui.model.odata.ODataMetaModel.FunctionImport
	 *
	 * An object representing an OData function import.
	 *
	 * @property {string} [entitySet]
	 *   The entity set of the function import's return value
	 * @property {"GET"|"POST"} [httpMethod]
	 *   The http method to execute the function import
	 * @property {string} name
	 *   The function import's name
	 * @property {Array<sap.ui.model.odata.ODataMetaModel.FunctionImportParameter>} [parameter]
	 *   The function import parameters
	 * @property {string} [returnType]
	 *   The qualified name of the function import's return type; the value is identical to the corresponding
	 *   XML attribute value in the service metadata document.
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.model.odata.ODataMetaModel.Annotatable} sap.ui.model.odata.ODataMetaModel.EntityContainer
	 *
	 * An object representing an OData entity container.
	 *
	 * @property {string} $path
	 *   The path to the entity container
	 * @property {string} name
	 *   The entity container's name
	 * @property {string} namespace
	 *   The entity container's namespace
	 * @property {Array<sap.ui.model.odata.ODataMetaModel.AssociationSet>} [associationSet]
	 *   The association sets in the entity container
	 * @property {Array<sap.ui.model.odata.ODataMetaModel.EntitySet>} [entitySet]
	 *   The entity sets in the entity container
	 * @property {Array<sap.ui.model.odata.ODataMetaModel.FunctionImport>} [functionImport]
	 *   The function imports in the entity container
	 * @property {"false"|"true"} [isDefaultEntityContainer]
	 *   Whether this is the default entity container
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.StringExpression
	 *
	 * An object representing a string value.
	 *
	 * @property {string} String
	 *   The string value
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.BoolExpression
	 *
	 * An object representing a Boolean value.
	 *
	 * @property {"true"|"false"} Bool
	 *   The Boolean value
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.PropertyPathExpression
	 *
	 * An object representing a <code>PropertyPathExpression</code> with its corresponding value.
	 *
	 * @property {string} PropertyPath
	 *   The value of the <code>PropertyPathExpression</code>
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.SimpleIdentifier
	 *
	 * An object representing an
	 * {@link https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Core.V1.md#SimpleIdentifier
	 * OData SimpleIdentifier}
	 * @property {string} String
	 *   The simple identifier string
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.ValueListProperty
	 *
	 * An object representing a <code>ValueListProperty</code> of a
	 * {@link https://sap.github.io/odata-vocabularies/vocabularies/Common.html#ValueListParameter ValueListParameter}.
	 *
	 * @property {string} String
	 *   The value of the <code>ValueListProperty</code>
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.ValueListParameterIn
	 *
	 * An object representing the value list parameter type
	 * {@link https://sap.github.io/odata-vocabularies/vocabularies/Common.html#ValueListParameterIn
	 * ValueListParameterIn}.
	 *
	 * @property {sap.ui.model.odata.ODataMetaModel.PropertyPathExpression} LocalDataProperty
	 *   An object containing the property path that is used to filter the value list with an <code>eq</code> comparison
	 * @property {sap.ui.model.odata.ODataMetaModel.ValueListProperty} ValueListProperty
	 *   An object containing the path to the property in the value list
	 * @property {"com.sap.vocabularies.Common.v1.ValueListParameterIn"} RecordType
	 *   Fully qualified name of the value list parameter type <code>ValueListParameterIn</code>
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.ValueListParameterConstant
	 *
	 * An object representing the value list parameter type
	 * {@link https://sap.github.io/odata-vocabularies/vocabularies/Common.html#ValueListParameterConstant
	 * ValueListParameterConstant}.
	 *
	 * @property {sap.ui.model.odata.ODataMetaModel.ValueListProperty} ValueListProperty
	 *   An object containing the path to the property in the value list
	 * @property {string} Constant
	 *   A string representing a constant value that is used to filter the value list with an <code>eq</code>
	 *   comparison, using the same representation as property default values
	 * @property {"com.sap.vocabularies.Common.v1.ValueListParameterConstant"} RecordType
	 *   Fully qualified name of the value list parameter type <code>ValueListParameterConstant</code>
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.ValueListParameterInOut
	 *
	 * An object representing the value list parameter type
	 * {@link https://sap.github.io/odata-vocabularies/vocabularies/Common.html#ValueListParameterInOut
	 * ValueListParameterInOut}.
	 *
	 * @property {sap.ui.model.odata.ODataMetaModel.PropertyPathExpression} LocalDataProperty
	 *   An object containing the property path that is used to filter the value list with an <code>startswith</code>
	 *   comparison and filled from the picked value list item
	 * @property {sap.ui.model.odata.ODataMetaModel.ValueListProperty} ValueListProperty
	 *   An object containing the path to the property in the value list
	 * @property {"com.sap.vocabularies.Common.v1.ValueListParameterInOut"} RecordType
	 *   Fully qualified name of the value list parameter type <code>ValueListParameterInOut</code>
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.ValueListParameterOut
	 *
	 * An object representing the value list parameter type
	 * {@link https://sap.github.io/odata-vocabularies/vocabularies/Common.html#ValueListParameterOut
	 * ValueListParameterOut}.
	 *
	 * @property {sap.ui.model.odata.ODataMetaModel.PropertyPathExpression} LocalDataProperty
	 *   An object containing the path to the property that is filled from the response
	 * @property {sap.ui.model.odata.ODataMetaModel.ValueListProperty} ValueListProperty
	 *   An object containing the path to the property in the value list
	 * @property {"com.sap.vocabularies.Common.v1.ValueListParameterOut"} RecordType
	 *   Fully qualified name of the value list parameter type <code>ValueListParameterOut</code>
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.ValueListParameterDisplayOnly
	 *
	 * An object representing the value list parameter type
	 * {@link https://sap.github.io/odata-vocabularies/vocabularies/Common.html#ValueListParameterDisplayOnly
	 * ValueListParameterDisplayOnly}.
	 *
	 * @property {sap.ui.model.odata.ODataMetaModel.ValueListProperty} ValueListProperty
	 *   An object containing the path to the property in the value list
	 * @property {"com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly"} RecordType
	 *   Fully qualified name of the value list parameter type <code>ValueListParameterDisplayOnly</code>
	 *
	 * @public
	 */

	/**
	 * The alias type for the OData
	 * {@link https://sap.github.io/odata-vocabularies/vocabularies/Common.html#ValueListParameter ValueListParameter};
	 * this alias comprises all supported value list parameter types.
	 *
	 * @typedef {
	 *   sap.ui.model.odata.ODataMetaModel.ValueListParameterIn |
	 *   sap.ui.model.odata.ODataMetaModel.ValueListParameterConstant |
	 *   sap.ui.model.odata.ODataMetaModel.ValueListParameterInOut |
	 *   sap.ui.model.odata.ODataMetaModel.ValueListParameterOut |
	 *   sap.ui.model.odata.ODataMetaModel.ValueListParameterDisplayOnly
	 * } sap.ui.model.odata.ODataMetaModel.ValueListParameter
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.model.odata.ODataMetaModel.ValueListType
	 *
	 * An object describing the {@link https://sap.github.io/odata-vocabularies/vocabularies/Common.html#ValueListType
	 * ValueListType}.
	 *
	 * @property {sap.ui.model.odata.ODataMetaModel.StringExpression} [Label]
	 *   A <code>StringExpression</code> object representing the <code>Label</code> property
	 * @property {sap.ui.model.odata.ODataMetaModel.StringExpression} CollectionPath
	 *   A <code>StringExpression</code> object representing the <code>CollectionPath</code> property
	 * @property {sap.ui.model.odata.ODataMetaModel.StringExpression} [CollectionRoot]
	 *   A <code>StringExpression</code> object representing the <code>CollectionRoot</code> property
	 * @property {sap.ui.model.odata.ODataMetaModel.BoolExpression} DistinctValuesSupported
	 *   A <code>BoolExpression</code> object representing the <code>DistinctValuesSupported</code> property
	 * @property {sap.ui.model.odata.ODataMetaModel.BoolExpression} SearchSupported
	 *   A <code>BoolExpression</code> object representing the <code>SearchSupported</code> property
	 * @property {sap.ui.model.odata.ODataMetaModel.SimpleIdentifier} [PresentationVariantQualifier]
	 *   The <code>PresentationVariantQualifier</code> property defines the identifier for an alternative representation
	 *   of the value help, e.g. as a bar chart
	 * @property {sap.ui.model.odata.ODataMetaModel.SimpleIdentifier} [SelectionVariantQualifier]
	 *   The <code>SelectionVariantQualifier</code> property contains a combination of parameters and filters to query
	 *   the value help entity set
	 * @property {sap.ui.model.odata.ODataMetaModel.ValueListParameter[]} Parameters
	 *   An array of parameters used to construct the value list request and consume the response properties
	 *
	 * @public
	 */

	var // maps the metadata URL with query parameters concatenated with the code list collection
		// path (e.g. /foo/bar/$metadata#SAP__Currencies) to a SyncPromise resolving with the code
		// list customizing as needed by the OData type
		mCodeListUrl2Promise = new Map(),
		sODataMetaModel = "sap.ui.model.odata.ODataMetaModel",
		// path to a type's property e.g. ("/dataServices/schema/<i>/entityType/<j>/property/<k>")
		rPropertyPath =
			/^((\/dataServices\/schema\/\d+)\/(?:complexType|entityType)\/\d+)\/property\/\d+$/;

	/**
	 * @class List binding implementation for the OData meta model which supports filtering on
	 * the virtual property "@sapui.name" (which refers back to the name of the object in
	 * question).
	 *
	 * Example:
	 * <pre>
	 * &lt;template:repeat list="{path:'entityType>', filters: {path: '@sapui.name', operator: 'StartsWith', value1: 'com.sap.vocabularies.UI.v1.FieldGroup'}}" var="fieldGroup">
	 * </pre>
	 *
	 * @extends sap.ui.model.json.JSONListBinding
	 * @private
	 */
	var ODataMetaListBinding = JSONListBinding.extend("sap.ui.model.odata.ODataMetaListBinding"),
		Resolver = ManagedObject.extend("sap.ui.model.odata._resolver", {
			metadata : {
				properties : {
					any : "any"
				}
			}
		});

	ODataMetaListBinding.prototype.applyFilter = function () {
		var that = this,
			oCombinedFilter = FilterProcessor.combineFilters(this.aFilters, this.aApplicationFilters);

		this.aIndices = FilterProcessor.apply(this.aIndices, oCombinedFilter, function (vRef, sPath) {
			return sPath === "@sapui.name"
				? vRef
				: that.oModel.getProperty(sPath, that.oList[vRef]);
		}, this.mNormalizeCache);
		this.iLength = this.aIndices.length;
	};

	/**
	 * DO NOT CALL this private constructor for a new <code>ODataMetaModel</code>,
	 * but rather use {@link sap.ui.model.odata.v2.ODataModel#getMetaModel getMetaModel} instead!
	 *
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata
	 *   the OData model's metadata object
	 * @param {sap.ui.model.odata.ODataAnnotations} [oAnnotations]
	 *   the OData model's annotations object
	 * @param {sap.ui.model.odata.v2.ODataModel} oDataModel
	 *   the data model instance
	 *
	 * @class Implementation of an OData meta model which offers a unified access to both OData V2
	 * metadata and V4 annotations. It uses the existing {@link sap.ui.model.odata.ODataMetadata}
	 * as a foundation and merges V4 annotations from the existing
	 * {@link sap.ui.model.odata.ODataAnnotations} directly into the corresponding model element.
	 *
	 * This model is not prepared to be inherited from.
	 *
	 * Also, annotations from the "http://www.sap.com/Protocols/SAPData" namespace are lifted up
	 * from the <code>extensions</code> array and transformed from objects into simple properties
	 * with an "sap:" prefix for their name. Note that this happens in addition, thus the
	 * following example shows both representations. This way, such annotations can be addressed
	 * via a simple relative path instead of searching an array.
	 * <pre>
		{
			"name" : "BusinessPartnerID",
			"extensions" : [{
				"name" : "label",
				"value" : "Bus. Part. ID",
				"namespace" : "http://www.sap.com/Protocols/SAPData"
			}],
			"sap:label" : "Bus. Part. ID"
		}
	 * </pre>
	 *
	 * As of 1.29.0, the corresponding vocabulary-based annotations for the following
	 * "<a href="http://www.sap.com/Protocols/SAPData">SAP Annotations for OData Version 2.0</a>"
	 * are added, if they are not yet defined in the V4 annotations:
	 * <ul>
	 * <li><code>label</code>;</li>
	 * <li><code>schema-version</code> (since 1.53.0) on schemas;</li>
	 * <li><code>creatable</code>, <code>deletable</code>, <code>deletable-path</code>,
	 * <code>pageable</code>, <code>requires-filter</code>, <code>searchable</code>,
	 * <code>topable</code>, <code>updatable</code> and <code>updatable-path</code> on entity sets;
	 * </li>
	 * <li><code>creatable</code> (since 1.41.0), <code>creatable-path</code> (since 1.41.0) and
	 * <code>filterable</code> (since 1.39.0) on navigation properties;</li>
	 * <li><code>aggregation-role</code> ("dimension" and "measure", both since 1.45.0),
	 * <code>creatable</code>, <code>display-format</code> ("UpperCase" and "NonNegative"),
	 * <code>field-control</code>, <code>filterable</code>, <code>filter-restriction</code>,
	 * <code>heading</code>, <code>precision</code>, <code>quickinfo</code>,
	 * <code>required-in-filter</code>, <code>sortable</code>, <code>text</code>, <code>unit</code>,
	 * <code>updatable</code> and <code>visible</code> on properties;</li>
	 * <li><code>semantics</code>; the following values are supported:
	 * <ul>
	 * <li>"bday", "city", "country", "email" (including support for types, for example
	 * "email;type=home,pref"), "familyname", "givenname", "honorific", "middlename", "name",
	 * "nickname", "note", "org", "org-unit", "org-role", "photo", "pobox", "region", "street",
	 * "suffix", "tel" (including support for types, for example "tel;type=cell,pref"), "title" and
	 * "zip" (mapped to V4 annotation <code>com.sap.vocabularies.Communication.v1.Contact</code>);
	 * </li>
	 * <li>"class", "dtend", "dtstart", "duration", "fbtype", "location", "status", "transp" and
	 * "wholeday" (mapped to V4 annotation
	 * <code>com.sap.vocabularies.Communication.v1.Event</code>);</li>
	 * <li>"body", "from", "received", "sender" and "subject" (mapped to V4 annotation
	 * <code>com.sap.vocabularies.Communication.v1.Message</code>);</li>
	 * <li>"completed", "due", "percent-complete" and "priority" (mapped to V4 annotation
	 * <code>com.sap.vocabularies.Communication.v1.Task</code>);</li>
	 * <li>"fiscalyear", "fiscalyearperiod" (mapped to the corresponding V4 annotation
	 * <code>com.sap.vocabularies.Common.v1.IsFiscal(Year|YearPeriod)</code>);</li>
	 * <li>"year", "yearmonth", "yearmonthday", "yearquarter", "yearweek" (mapped to the
	 * corresponding V4 annotation
	 * <code>com.sap.vocabularies.Common.v1.IsCalendar(Year|YearMonth|Date|YearQuarter|YearWeek)</code>);
	 * </li>
	 * <li>"url" (mapped to V4 annotation <code>Org.OData.Core.V1.IsURL"</code>).</li>
	 * </ul>
	 * </ul>
	 * For example:
	 * <pre>
		{
			"name" : "BusinessPartnerID",
			...
			"sap:label" : "Bus. Part. ID",
			"com.sap.vocabularies.Common.v1.Label" : {
				"String" : "Bus. Part. ID"
			}
		}
	 * </pre>
	 * <b>Note:</b> Annotation terms are not merged, but replaced as a whole ("PUT" semantics). That
	 * means, if you have, for example, an OData V2 annotation <code>sap:sortable=false</code> at a
	 * property <code>PropA</code>, the corresponding OData V4 annotation is added to each entity
	 * set to which this property belongs:
	 * <pre>
		"Org.OData.Capabilities.V1.SortRestrictions": {
			"NonSortableProperties" : [
				{"PropertyPath" : "BusinessPartnerID"}
			]
		}
	 * </pre>
	 * If the same term <code>"Org.OData.Capabilities.V1.SortRestrictions"</code> targeting one of
	 * these entity sets is also contained in an annotation file, the complete OData V4 annotation
	 * converted from the OData V2 annotation is replaced by the one contained in the annotation
	 * file for the specified target. Converted annotations never use a qualifier and are only
	 * overwritten by the same annotation term without a qualifier.
	 *
	 * This model is read-only and thus only supports
	 * {@link sap.ui.model.BindingMode.OneTime OneTime} binding mode. No events
	 * ({@link sap.ui.model.Model#event:parseError parseError},
	 * {@link sap.ui.model.Model#event:requestCompleted requestCompleted},
	 * {@link sap.ui.model.Model#event:requestFailed requestFailed},
	 * {@link sap.ui.model.Model#event:requestSent requestSent}) are fired!
	 *
	 * Within the meta model, the objects are arranged in arrays.
	 * <code>/dataServices/schema</code>, for example, is an array of schemas where each schema has
	 * an <code>entityType</code> property with an array of entity types, and so on. So,
	 * <code>/dataServices/schema/0/entityType/16</code> can be the path to the entity type with
	 * name "Order" in the schema with namespace "MySchema". However, these paths are not stable:
	 * If an entity type with lower index is removed from the schema, the path to
	 * <code>Order</code> changes to <code>/dataServices/schema/0/entityType/15</code>.
	 *
	 * To avoid problems with changing indexes, {@link sap.ui.model.Model#getObject getObject} and
	 * {@link sap.ui.model.Model#getProperty getProperty} support XPath-like queries for the
	 * indexes (since 1.29.1). Each index can be replaced by a query in square brackets. You can,
	 * for example, address the schema using the path
	 * <code>/dataServices/schema/[${namespace}==='MySchema']</code> or the entity using
	 * <code>/dataServices/schema/[${namespace}==='MySchema']/entityType/[${name}==='Order']</code>.
	 *
	 * The syntax inside the square brackets is the same as in expression binding. The query is
	 * executed for each object in the array until the result is true (truthy) for the first time.
	 * This object is then chosen.
	 *
	 * <b>BEWARE:</b> Access to this OData meta model will fail before the promise returned by
	 * {@link #loaded loaded} has been resolved!
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.ODataMetaModel
	 * @extends sap.ui.model.MetaModel
	 * @public
	 * @since 1.27.0
	 */
	var ODataMetaModel = MetaModel.extend("sap.ui.model.odata.ODataMetaModel", {
			constructor : function (oMetadata, oAnnotations, oDataModel) {
				var oAnnotationsLoadedPromise = oDataModel.annotationsLoaded(),
					that = this;

				function load() {
					var oData;

					if (that.bDestroyed) {
						throw new Error("Meta model already destroyed");
					}
					oData = JSON.parse(JSON.stringify(oMetadata.getServiceMetadata()));
					that.oModel = new JSONModel(oData);
					that.oModel.setDefaultBindingMode(that.sDefaultBindingMode);
					return oDataModel._requestAnnotationChanges().then((aAnnotationChanges) => {
						Utils.merge(oAnnotations ? oAnnotations.getData() : {}, oData, that,
							oDataModel.bIgnoreAnnotationsFromMetadata);
						that.aAnnotationChanges = _Helper.deepClone(aAnnotationChanges, 20);
						that._applyAnnotationChanges();
					});
				}

				MetaModel.apply(this); // no arguments to pass!
				this.oModel = null; // not yet available!

				// map path of property to promise for loading its value list
				this.mContext2Promise = {};
				this.sDefaultBindingMode = BindingMode.OneTime;
				this.oLoadedPromise = oAnnotationsLoadedPromise
					? oAnnotationsLoadedPromise.then(load)
					: new Promise(function (fnResolve) {
							load();
							fnResolve();
						}); // call load() synchronously!
				this.oLoadedPromiseSync = SyncPromise.resolve(this.oLoadedPromise);
				this.oMetadata = oMetadata;
				this.oDataModel = oDataModel;
				this.mQueryCache = {};
				// map qualified property name to internal "promise interface" for request bundling
				this.mQName2PendingRequest = {};
				this.oResolver = undefined;
				this.mSupportedBindingModes = {"OneTime" : true};
			}
		});

	/**
	 * Apply the annotation changes for this model.
	 *
	 * @private
	 * @see sap.ui.model.odata.v2.ODataModel#setAnnotationChangePromise
	 */
	ODataMetaModel.prototype._applyAnnotationChanges = function () {
		if (!this.aAnnotationChanges) {
			return;
		}
		const aNotAppliedChanges = [];
		this.aAnnotationChanges.forEach((oAnnotationChange) => {
			const sResolvedPath = this._getObject(oAnnotationChange.path, undefined, /*bAsPath*/true);
			// value help metadata maybe loaded and merged later; if the path cannot be resolved yet ignore the
			// annotation change and process it later
			if (sResolvedPath) {
				this.oModel.setProperty(sResolvedPath, oAnnotationChange.value);
			} else {
				aNotAppliedChanges.push(oAnnotationChange);
			}
		});
		this.aAnnotationChanges = aNotAppliedChanges.length ? aNotAppliedChanges : undefined;
	};

	/**
	 * Returns the value of the object or property inside this model's data which can be reached,
	 * starting at the given context, by following the given path.
	 *
	 * @param {string} sPath
	 *   a relative or absolute path
	 * @param {object|sap.ui.model.Context} [oContext]
	 *   the context to be used as a starting point in case of a relative path
	 * @param {boolean} [bAsPath]
	 *   Whether to return the JSON model path instead of the value for the given path and context
	 * @returns {any}
	 *   the value of the object or property or <code>null</code> in case a relative path without
	 *   a context is given
	 * @private
	 */
	ODataMetaModel.prototype._getObject = function (sPath, oContext, bAsPath) {
		var oBaseNode = oContext,
			oBinding,
			sCacheKey,
			i,
			iEnd,
			oNode,
			vPart,
			sProcessedPath,
			sResolvedPath = sPath || "",
			oResult;

		if (!oContext || oContext instanceof Context) {
			sResolvedPath = this.resolve(sPath || "", oContext);
			if (!sResolvedPath) {
				Log.error("Invalid relative path w/o context", sPath,
					sODataMetaModel);
				return null;
			}
		}

		if (sResolvedPath.charAt(0) === "/") {
			oBaseNode = this.oModel._getObject("/");
			sResolvedPath = sResolvedPath.slice(1);
		}

		sProcessedPath = "/";
		oNode = oBaseNode;
		while (sResolvedPath) {
			vPart = undefined;
			oBinding = undefined;
			if (sResolvedPath.charAt(0) === '[') {
				try {
					oResult = BindingParser.parseExpression(sResolvedPath, 1);
					iEnd = oResult.at;
					if (sResolvedPath.length === iEnd + 1
							|| sResolvedPath.charAt(iEnd + 1) === '/') {
						oBinding = oResult.result;
						vPart = sResolvedPath.slice(0, iEnd + 1);
						sResolvedPath = sResolvedPath.slice(iEnd + 2);
					}
				} catch (ex) {
					if (!(ex instanceof SyntaxError)) {
						throw ex;
					}
					// do nothing, syntax error is logged already
				}
			}
			if (vPart === undefined) {
				// No query or unsuccessful query, simply take the next part until '/'
				iEnd = sResolvedPath.indexOf("/");
				if (iEnd < 0) {
					vPart = sResolvedPath;
					sResolvedPath = "";
				} else {
					vPart = sResolvedPath.slice(0, iEnd);
					sResolvedPath = sResolvedPath.slice(iEnd + 1);
				}
			}
			if (!oNode) {
				if (bAsPath) {
					return null;
				}
				if (Log.isLoggable(Log.Level.WARNING, sODataMetaModel)) {
					Log.warning("Invalid part: " + vPart,
						"path: " + sPath + ", context: "
							+ (oContext instanceof Context ? oContext.getPath() : oContext),
						sODataMetaModel);
				}
				break;
			}
			if (oBinding) {
				if (oBaseNode === oContext) {
					Log.error(
						"A query is not allowed when an object context has been given", sPath,
						sODataMetaModel);
					return null;
				}
				if (!Array.isArray(oNode)) {
					Log.error(
						"Invalid query: '" + sProcessedPath + "' does not point to an array",
						sPath, sODataMetaModel);
					return null;
				}
				sCacheKey = sProcessedPath + vPart;
				vPart = this.mQueryCache[sCacheKey];
				if (vPart === undefined) {
					// Set the resolver on the internal JSON model, so that resolving does not use
					// this._getObject itself.
					this.oResolver = this.oResolver || new Resolver({models: this.oModel});
					for (i = 0; i < oNode.length; i += 1) {
						this.oResolver.bindObject(sProcessedPath + i);
						this.oResolver.bindProperty("any", oBinding);
						try {
							if (this.oResolver.getAny()) {
								this.mQueryCache[sCacheKey] = vPart = i;
								break;
							}
						} finally {
							this.oResolver.unbindProperty("any");
							this.oResolver.unbindObject();
						}
					}
				}
			}
			oNode = oNode[vPart];
			sProcessedPath = sProcessedPath + vPart + "/";
		}
		return bAsPath ? sProcessedPath : oNode;
	};

	/**
	 * Gets an object containing a shared {@link sap.ui.model.odata.v2.ODataModel} instance, which
	 * is used to load code lists for currencies and units, and
	 * <code>bFirstCodeListRequested</code>, which is initially <code>false</code> and is used to
	 * destroy the shared model at the right time. The <code>ODataMetaModel</code> is able to handle
	 * two code lists, one for currencies and one for units. As soon as the first code list is
	 * processed, whether successfully or not, <code>bFirstCodeListRequested</code> is set to
	 * <code>true</code>. Once a second code list has been processed, the shared model is not needed
	 * any more and is destroyed. The shared model is also destroyed when this instance of the
	 * <code>ODataMetaModel</code> gets destroyed.
	 *
	 * @returns {object}
	 *   An object containing an OData model and <code>bFirstCodeListRequested</code>
	 *
	 * @private
	 */
	ODataMetaModel.prototype._getOrCreateSharedModelCache = function () {
		var oDataModel = this.oDataModel;

		if (!this.oSharedModelCache) {
			this.oSharedModelCache = {
				bFirstCodeListRequested : false,
				oModel : new oDataModel.constructor(oDataModel.getCodeListModelParameters())
			};
		}

		return this.oSharedModelCache;
	};

	/**
	 * Merges metadata retrieved via <code>this.oDataModel.addAnnotationUrl</code>.
	 *
	 * @param {object} oResponse response from addAnnotationUrl.
	 *
	 * @private
	 */
	ODataMetaModel.prototype._mergeMetadata = function (oResponse) {
		var oEntityContainer = this.getODataEntityContainer(),
			mChildAnnotations = Utils.getChildAnnotations(oResponse.annotations,
				oEntityContainer.namespace + "." + oEntityContainer.name, true),
			iFirstNewEntitySet = oEntityContainer.entitySet.length,
			aSchemas = this.oModel.getObject("/dataServices/schema"),
			that = this;

		// merge metadata for entity sets/types
		oResponse.entitySets.forEach(function (oEntitySet) {
			var oEntityType,
				oSchema,
				sTypeName = oEntitySet.entityType,
				// Note: namespaces may contain dots themselves!
				sNamespace = sTypeName.slice(0, sTypeName.lastIndexOf("."));

			if (!that.getODataEntitySet(oEntitySet.name)) {
				oEntityContainer.entitySet.push(JSON.parse(JSON.stringify(oEntitySet)));

				if (!that.getODataEntityType(sTypeName)) {
					oEntityType = that.oMetadata._getEntityTypeByName(sTypeName);
					oSchema = Utils.getSchema(aSchemas, sNamespace);
					oSchema.entityType.push(JSON.parse(JSON.stringify(oEntityType)));

					// visit all entity types before visiting the entity sets to ensure that V2
					// annotations are already lifted up and can be used for calculating entity
					// set annotations which are based on V2 annotations on entity properties
					Utils.visitParents(oSchema, oResponse.annotations,
						"entityType", Utils.visitEntityType,
						oSchema.entityType.length - 1);
				}
			}
		});

		Utils.visitChildren(oEntityContainer.entitySet, mChildAnnotations, "EntitySet", aSchemas,
			/*fnCallback*/null, iFirstNewEntitySet);
		Utils.addUnitAnnotations(aSchemas, this);
	};


	/**
	 * Send all currently pending value list requests as a single bundle.
	 *
	 * @private
	 */
	ODataMetaModel.prototype._sendBundledRequest = function () {
		var mQName2PendingRequest = this.mQName2PendingRequest, // remember current state
			aQualifiedPropertyNames = Object.keys(mQName2PendingRequest),
			that = this;

		if (!aQualifiedPropertyNames.length) {
			return; // nothing to do
		}

		this.mQName2PendingRequest = {}; // clear pending requests for next bundle

		// normalize URL to be browser cache friendly with value list request
		aQualifiedPropertyNames = aQualifiedPropertyNames.sort();
		aQualifiedPropertyNames.forEach(function (sQualifiedPropertyName, i) {
			aQualifiedPropertyNames[i] = encodeURIComponent(sQualifiedPropertyName);
		});

		this.oDataModel
			.addAnnotationUrl("$metadata?sap-value-list=" + aQualifiedPropertyNames.join(","))
			.then(
				function (oResponse) {
					var sQualifiedPropertyName;
					that._mergeMetadata(oResponse);
					for (sQualifiedPropertyName in mQName2PendingRequest) {
						try {
							mQName2PendingRequest[sQualifiedPropertyName].resolve(oResponse);
						} catch (oError) {
							mQName2PendingRequest[sQualifiedPropertyName].reject(oError);
						}
					}
					that._applyAnnotationChanges(); // new metadata is merged, apply annotation changes again
				},
				function (oError) {
					var sQualifiedPropertyName;
					for (sQualifiedPropertyName in mQName2PendingRequest) {
						mQName2PendingRequest[sQualifiedPropertyName].reject(oError);
					}
				}
			);
	};

	ODataMetaModel.prototype.bindContext = function (sPath, oContext, mParameters) {
		return new ClientContextBinding(this, sPath, oContext, mParameters);
	};

	ODataMetaModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters,
		mParameters) {
		return new ODataMetaListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
	};

	ODataMetaModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		return new JSONPropertyBinding(this, sPath, oContext, mParameters);
	};

	ODataMetaModel.prototype.bindTree = function (sPath, oContext, aFilters, mParameters) {
		return new JSONTreeBinding(this, sPath, oContext, aFilters, mParameters);
	};

	ODataMetaModel.prototype.destroy = function () {
		MetaModel.prototype.destroy.apply(this, arguments);
		if (this.oSharedModelCache) {
			this.oSharedModelCache.oModel.destroy();
			delete this.oSharedModelCache;
		}
		return this.oModel && this.oModel.destroy.apply(this.oModel, arguments);
	};

	/**
	 * Requests the customizing based on the code list reference given in the entity container's
	 * <code>com.sap.vocabularies.CodeList.v1.*</code> annotation for the term specified in the
	 * <code>sTerm</code> parameter. Once a code list has been requested, the promise is cached.
	 *
	 * @param {string} sTerm
	 *   The unqualified name of the term from the <code>com.sap.vocabularies.CodeList.v1</code>
	 *   vocabulary used to annotate the entity container, e.g. "CurrencyCodes" or "UnitsOfMeasure"
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving with the customizing, which is a map from the code key to an object
	 *   with the following properties:
	 *   <ul>
	 *     <li>StandardCode: The language-independent standard code (e.g. ISO) for the code as
	 *       referred to via the <code>com.sap.vocabularies.CodeList.v1.StandardCode</code>
	 *       annotation on the code's key, if present
	 *     <li>Text: The language-dependent text for the code as referred to via the
	 *       <code>com.sap.vocabularies.Common.v1.Text</code> annotation on the code's key
	 *     <li>UnitSpecificScale: The decimals for the code as referred to via the
	 *       <code>com.sap.vocabularies.Common.v1.UnitSpecificScale</code> annotation on the code's
	 *       key; entries where this would be <code>null</code> are ignored, and an error is logged
	 *   </ul>
	 *   It resolves with <code>null</code> if no given
	 *   <code>com.sap.vocabularies.CodeList.v1.*</code> annotation is found.
	 *   It is rejected if the code list URL is not "./$metadata", there is not exactly one code
	 *   key, or if the customizing cannot be loaded.
	 *
	 * @private
	 * @see #requestCurrencyCodes
	 * @see #requestUnitsOfMeasure
	 */
	ODataMetaModel.prototype.fetchCodeList = function (sTerm) {
		var that = this;

		return this.oLoadedPromiseSync.then(function () {
			var sCacheKey, sCacheKeyWithModel, oCodeListModel, oCodeListModelCache, sCollectionPath,
				oMappingPromise, sMetaDataUrl, oPromise, oReadPromise,
				sCodeListAnnotation = "com.sap.vocabularies.CodeList.v1." + sTerm,
				oCodeListAnnotation = that.getODataEntityContainer()[sCodeListAnnotation];

			if (!oCodeListAnnotation
				// for backend backward compatibility it may happen that a code list annotation is
				// available but the "Url" property has no "String" value -> treat it as if no code
				// list is available
				|| !oCodeListAnnotation.Url.String) {
				return null;
			}

			if (oCodeListAnnotation.Url.String !== "./$metadata") {
				throw new Error(sCodeListAnnotation
					+ "/Url/String has to be './$metadata' for the service "
					+ that.oDataModel.getCodeListModelParameters().serviceUrl);
			}

			sCollectionPath = oCodeListAnnotation.CollectionPath.String;
			sMetaDataUrl = that.oDataModel.getMetadataUrl();
			sCacheKey = sMetaDataUrl + "#" + sCollectionPath;
			// check for global cache entry
			oPromise = mCodeListUrl2Promise.get(sCacheKey);
			if (oPromise) {
				return oPromise;
			}
			// check for an ODataModel related cache entry
			sCacheKeyWithModel = sCacheKey + "#" + that.getId();
			oPromise = mCodeListUrl2Promise.get(sCacheKeyWithModel);
			if (oPromise) {
				return oPromise;
			}

			oCodeListModelCache = that._getOrCreateSharedModelCache();
			oCodeListModel = oCodeListModelCache.oModel;

			oReadPromise = new SyncPromise(function (fnResolve, fnReject) {
				const oURLSearchParams = new URL(sMetaDataUrl, "https://localhost").searchParams;
				const sClient = oURLSearchParams.get("sap-client");
				const sLanguage = oURLSearchParams.get("sap-language");
				const mUrlParameters = {$skip : 0, $top : 5000}; // avoid server-driven paging

				if (sClient) {
					mUrlParameters["sap-client"] = sClient;
				}
				if (sLanguage) {
					mUrlParameters["sap-language"] = sLanguage;
				}
				oCodeListModel.read("/" + sCollectionPath, {
					error : fnReject,
					success : fnResolve,
					urlParameters : mUrlParameters
				});
			});
			oMappingPromise = new SyncPromise(function (fnResolve, fnReject) {
				try {
					fnResolve(that._getPropertyNamesForCodeListCustomizing(sCollectionPath));
				} catch (oError) {
					// ensure that oPromise gets a value and is cached even if there is an error
					// when calling _getPropertyNamesForCodeListCustomizing
					fnReject(oError);
				}
			});

			oPromise = SyncPromise.all([oReadPromise, oMappingPromise]).then(function (aResults) {
				var aData = aResults[0].results,
					mMapping = aResults[1];

				mCodeListUrl2Promise.set(sCacheKey, oPromise);
				mCodeListUrl2Promise.delete(sCacheKeyWithModel); // not needed any more

				return aData.reduce(function (mCode2Customizing, oEntity) {
					var sCode = oEntity[mMapping.code],
						oCustomizing = {
							Text : oEntity[mMapping.text],
							UnitSpecificScale : oEntity[mMapping.unitSpecificScale]
						};

					if (mMapping.standardCode) {
						oCustomizing.StandardCode = oEntity[mMapping.standardCode];
					}
					// ignore customizing where the unit-specific scale is missing; log an error
					if (oCustomizing.UnitSpecificScale === null) {
						Log.error("Ignoring customizing w/o unit-specific scale for code "
								+ sCode + " from " + sCollectionPath,
							that.oDataModel.getCodeListModelParameters().serviceUrl,
							sODataMetaModel);
					} else {
						mCode2Customizing[sCode] = oCustomizing;
					}

					return mCode2Customizing;
				}, {});
			}).catch(function (oError) {
				if (oCodeListModel.bDestroyed) {
					// do not cache rejected Promise caused by a destroyed code list model
					mCodeListUrl2Promise.delete(sCacheKey);
					mCodeListUrl2Promise.delete(sCacheKeyWithModel);
				} else {
					Log.error("Couldn't load code list: " + sCollectionPath + " for "
							+ that.oDataModel.getCodeListModelParameters().serviceUrl,
						oError, sODataMetaModel);
				}
				throw oError;
			}).finally(function () {
				if (oCodeListModelCache.bFirstCodeListRequested) {
					if (!oCodeListModel.bDestroyed) {
						oCodeListModel.destroy();
					}
					delete that.oSharedModelCache;
				} else {
					oCodeListModelCache.bFirstCodeListRequested = true;
				}
			});
			mCodeListUrl2Promise.set(sCacheKeyWithModel, oPromise);

			return oPromise;
		});
	};

	/**
	 * Returns the OData meta model context corresponding to the given OData model path.
	 *
	 * @param {string} [sPath]
	 *   an absolute path pointing to an entity or property, e.g.
	 *   "/ProductSet(1)/ToSupplier/BusinessPartnerID"; this equals the
	 *   <a href="http://www.odata.org/documentation/odata-version-2-0/uri-conventions#ResourcePath">
	 *   resource path</a> component of a URI according to OData V2 URI conventions
	 * @returns {sap.ui.model.Context|null}
	 *   the context for the corresponding metadata object, i.e. an entity type or its property,
	 *   or <code>null</code> in case no path is given
	 * @throws {Error} in case no context can be determined
	 * @public
	 */
	ODataMetaModel.prototype.getMetaContext = function (sPath) {
		var oAssocationEnd,
			oEntitySet,
			oEntityType,
			oFunctionImport,
			sMetaPath,
			sNavigationPropertyName,
			sPart,
			aParts,
			sQualifiedName; // qualified name of current (entity) type across navigations

		/*
		 * Strips the OData key predicate from a resource path segment.
		 *
		 * @param {string} sSegment
		 * @returns {string}
		 */
		function stripKeyPredicate(sSegment) {
			var iPos = sSegment.indexOf("(");
			return iPos >= 0
				? sSegment.slice(0, iPos)
				: sSegment;
		}

		if (!sPath) {
			return null;
		}

		aParts = sPath.split("/");
		if (aParts[0] !== "") {
			throw new Error("Not an absolute path: " + sPath);
		}
		aParts.shift();

		// from entity set to entity type
		sPart = stripKeyPredicate(aParts[0]);
		oEntitySet = this.getODataEntitySet(sPart);
		if (oEntitySet) {
			sQualifiedName = oEntitySet.entityType;
		} else {
			oFunctionImport = this.getODataFunctionImport(sPart);
			if (oFunctionImport) {
				if (aParts.length === 1) {
					sMetaPath = this.getODataFunctionImport(sPart, true);
				}
				sQualifiedName = oFunctionImport.returnType;
				if (sQualifiedName.lastIndexOf("Collection(", 0) === 0) {
					sQualifiedName = sQualifiedName.slice(11, -1);
				}
			} else {
				throw new Error("Entity set or function import not found: " + sPart);
			}
		}
		aParts.shift();

		// follow (navigation) properties
		while (aParts.length) {
			oEntityType = this.getODataEntityType(sQualifiedName);
			if (oEntityType) {
				sNavigationPropertyName = stripKeyPredicate(aParts[0]);
				oAssocationEnd = this.getODataAssociationEnd(oEntityType, sNavigationPropertyName);
			} else { // function import's return type may be a complex type
				oEntityType = this.getODataComplexType(sQualifiedName);
			}

			if (oAssocationEnd) {
				// navigation property (Note: can appear in entity types, but not complex types)
				sQualifiedName = oAssocationEnd.type;
				if (oAssocationEnd.multiplicity === "1" && sNavigationPropertyName !== aParts[0]) {
					// key predicate not allowed here
					throw new Error("Multiplicity is 1: " + aParts[0]);
				}
				aParts.shift();
			} else {
				// structural property, incl. complex types
				sMetaPath = this.getODataProperty(oEntityType, aParts, true);
				if (aParts.length) {
					throw new Error("Property not found: " + aParts.join("/"));
				}
				break;
			}
		}

		sMetaPath = sMetaPath || this.getODataEntityType(sQualifiedName, true);
		return this.createBindingContext(sMetaPath);
	};

	/**
	 * Returns the OData association end corresponding to the given entity type's navigation
	 * property of given name.
	 *
	 * @param {sap.ui.model.odata.ODataMetaModel.EntityType} oEntityType
	 *   an entity type as returned by {@link #getODataEntityType getODataEntityType}
	 * @param {string} sName
	 *   the name of a navigation property within this entity type
	 * @returns {sap.ui.model.odata.ODataMetaModel.AssociationEnd|null}
	 *   the OData association end or <code>null</code> if no such association end is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataAssociationEnd = function (oEntityType, sName) {
		var oNavigationProperty = oEntityType
				? Utils.findObject(oEntityType.navigationProperty, sName)
				: null,
			oAssociation = oNavigationProperty
				? Utils.getObject(this.oModel, "association", oNavigationProperty.relationship)
				: null,
			oAssociationEnd = oAssociation
				? Utils.findObject(oAssociation.end, oNavigationProperty.toRole, "role")
				: null;

		return oAssociationEnd;
	};

	/**
	 * Returns the OData association <em>set</em> end corresponding to the given entity type's
	 * navigation property of given name.
	 *
	 * @param {sap.ui.model.odata.ODataMetaModel.EntityType} oEntityType
	 *   an entity type as returned by {@link #getODataEntityType getODataEntityType}
	 * @param {string} sName
	 *   the name of a navigation property within this entity type
	 * @returns {sap.ui.model.odata.ODataMetaModel.AssociationSetEnd|null}
	 *   the OData association set end or <code>null</code> if no such association set end is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataAssociationSetEnd = function (oEntityType, sName) {
		var oAssociationSet,
			oAssociationSetEnd = null,
			oEntityContainer = this.getODataEntityContainer(),
			oNavigationProperty = oEntityType
				? Utils.findObject(oEntityType.navigationProperty, sName)
				: null;

		if (oEntityContainer && oNavigationProperty) {
			oAssociationSet = Utils.findObject(oEntityContainer.associationSet,
				oNavigationProperty.relationship, "association");
			oAssociationSetEnd = oAssociationSet
				? Utils.findObject(oAssociationSet.end, oNavigationProperty.toRole, "role")
				: null;
		}

		return oAssociationSetEnd;
	};

	/**
	 * Returns the OData complex type with the given qualified name, either as a path or as an
	 * object, as indicated.
	 *
	 * @param {string} sQualifiedName
	 *   a qualified name, e.g. "ACME.Address"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the complex type is returned as a path or as an object
	 * @returns {sap.ui.model.odata.ODataMetaModel.ComplexType|string|undefined|null}
	 *   (the path to) the complex type with the given qualified name; <code>undefined</code> (for
	 *   a path) or <code>null</code> (for an object) if no such type is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataComplexType = function (sQualifiedName, bAsPath) {
		return Utils.getObject(this.oModel, "complexType", sQualifiedName, bAsPath);
	};

	/**
	 * Returns the OData default entity container. If there is only a single schema with a single
	 * entity container, the entity container does not need to be marked as default explicitly.
	 *
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the entity container is returned as a path or as an object
	 * @returns {sap.ui.model.odata.ODataMetaModel.EntityContainer|string|undefined|null}
	 *   (the path to) the default entity container; <code>undefined</code> (for a path) or
	 *   <code>null</code> (for an object) if no such container is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataEntityContainer = function (bAsPath) {
		var vResult = bAsPath ? undefined : null,
			aSchemas = this.oModel.getObject("/dataServices/schema");

		if (aSchemas) {
			aSchemas.forEach(function (oSchema, i) {
				var j = Utils.findIndex(oSchema.entityContainer, "true",
						"isDefaultEntityContainer");

				if (j >= 0) {
					vResult = bAsPath
						? "/dataServices/schema/" + i + "/entityContainer/" + j
						: oSchema.entityContainer[j];
				}
			});

			if (!vResult && aSchemas.length === 1 && aSchemas[0].entityContainer
					&& aSchemas[0].entityContainer.length === 1) {
				vResult = bAsPath
					? "/dataServices/schema/0/entityContainer/0"
					: aSchemas[0].entityContainer[0];
			}
		}

		return vResult;
	};

	/**
	 * Returns the OData entity set with the given simple name from the default entity container.
	 *
	 * @param {string} sName
	 *   a simple name, e.g. "ProductSet"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the entity set is returned as a path or as an object
	 * @returns {sap.ui.model.odata.ODataMetaModel.EntitySet|string|undefined|null}
	 *   (the path to) the entity set with the given simple name; <code>undefined</code> (for a
	 *   path) or <code>null</code> (for an object) if no such set is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataEntitySet = function (sName, bAsPath) {
		return Utils.getFromContainer(this.getODataEntityContainer(), "entitySet", sName, bAsPath);
	};

	/**
	 * Returns the OData entity type with the given qualified name, either as a path or as an
	 * object, as indicated.
	 *
	 * @param {string} sQualifiedName
	 *   a qualified name, e.g. "ACME.Product"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the entity type is returned as a path or as an object
	 * @returns {sap.ui.model.odata.ODataMetaModel.EntityType|string|undefined|null}
	 *   (the path to) the entity type with the given qualified name; <code>undefined</code> (for a
	 *   path) or <code>null</code> (for an object) if no such type is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataEntityType = function (sQualifiedName, bAsPath) {
		return Utils.getObject(this.oModel, "entityType", sQualifiedName, bAsPath);
	};

	/**
	 * Returns the OData function import with the given simple or qualified name from the default
	 * entity container or the respective entity container specified in the qualified name.
	 *
	 * @param {string} sName
	 *   a simple or qualified name, e.g. "Save" or "MyService.Entities/Save"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the function import is returned as a path or as an object
	 * @returns {sap.ui.model.odata.ODataMetaModel.FunctionImport|string|undefined|null}
	 *   (the path to) the function import with the given simple name; <code>undefined</code> (for
	 *   a path) or <code>null</code> (for an object) if no such function import is found
	 * @public
	 * @since 1.29.0
	 */
	ODataMetaModel.prototype.getODataFunctionImport = function (sName, bAsPath) {
		var aParts =  sName && sName.indexOf('/') >= 0  ? sName.split('/') : undefined,
			oEntityContainer = aParts ?
				Utils.getObject(this.oModel, "entityContainer", aParts[0]) :
				this.getODataEntityContainer();

		return Utils.getFromContainer(oEntityContainer, "functionImport",
			aParts ? aParts[1] : sName, bAsPath);
	};

	/**
	 * Returns the given OData type's property (not navigation property!) of given name.
	 *
	 * If an array is given instead of a single name, it is consumed (via
	 * <code>Array.prototype.shift</code>) piece by piece. Each element is interpreted as a
	 * property name of the current type, and the current type is replaced by that property's type.
	 * This is repeated until an element is encountered which cannot be resolved as a property name
	 * of the current type anymore; in this case, the last property found is returned and
	 * <code>vName</code> contains only the remaining names, with <code>vName[0]</code> being the
	 * one which was not found.
	 *
	 * Examples:
	 * <ul>
	 * <li> Get address property of business partner:
	 * <pre>
	 * var oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.BusinessPartner"),
	 *     oAddressProperty = oMetaModel.getODataProperty(oEntityType, "Address");
	 * oAddressProperty.name === "Address";
	 * oAddressProperty.type === "GWSAMPLE_BASIC.CT_Address";
	 * </pre>
	 * </li>
	 * <li> Get street property of address type:
	 * <pre>
	 * var oComplexType = oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
	 *     oStreetProperty = oMetaModel.getODataProperty(oComplexType, "Street");
	 * oStreetProperty.name === "Street";
	 * oStreetProperty.type === "Edm.String";
	 * </pre>
	 * </li>
	 * <li> Get address' street property directly from business partner:
	 * <pre>
	 * var aParts = ["Address", "Street"];
	 * oMetaModel.getODataProperty(oEntityType, aParts) === oStreetProperty;
	 * aParts.length === 0;
	 * </pre>
	 * </li>
	 * <li> Trying to get address' foo property directly from business partner:
	 * <pre>
	 * aParts = ["Address", "foo"];
	 * oMetaModel.getODataProperty(oEntityType, aParts) === oAddressProperty;
	 * aParts.length === 1;
	 * aParts[0] === "foo";
	 * </pre>
	 * </li>
	 * </ul>
	 *
	 * @param {sap.ui.model.odata.ODataMetaModel.ComplexType|sap.ui.model.odata.ODataMetaModel.EntityType} oType
	 *   a complex type as returned by {@link #getODataComplexType getODataComplexType}, or
	 *   an entity type as returned by {@link #getODataEntityType getODataEntityType}
	 * @param {string|string[]} vName
	 *   the name of a property within this type (e.g. "Address"), or an array of such names (e.g.
	 *   <code>["Address", "Street"]</code>) in order to drill-down into complex types;
	 *   <b>BEWARE</b> that this array is modified by removing each part which is understood!
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the property is returned as a path or as an object
	 * @returns {sap.ui.model.odata.ODataMetaModel.Property|string|undefined|null}
	 *   (the path to) the last OData property found; <code>undefined</code> (for a path) or
	 *   <code>null</code> (for an object) if no property was found at all
	 * @public
	 */
	ODataMetaModel.prototype.getODataProperty = function (oType, vName, bAsPath) {
		var i,
			aParts = Array.isArray(vName) ? vName : [vName],
			oProperty = null,
			sPropertyPath;

		while (oType && aParts.length) {
			i = Utils.findIndex(oType.property, aParts[0]);
			if (i < 0) {
				break;
			}

			aParts.shift();
			oProperty = oType.property[i];
			sPropertyPath = oType.$path + "/property/" + i;

			if (aParts.length) {
				// go to complex type in order to allow drill-down
				oType = this.getODataComplexType(oProperty.type);
			}
		}

		return bAsPath ? sPropertyPath : oProperty;
	};

	/**
	 * Returns a <code>Promise</code> which is resolved with a map representing the
	 * <code>com.sap.vocabularies.Common.v1.ValueList</code> annotations of the given property or
	 * rejected with an error.
	 * The key in the map provided on successful resolution is the qualifier of the annotation or
	 * the empty string if no qualifier is defined. The value in the map is the JSON object for
	 * the annotation. The map is empty if the property has no
	 * <code>com.sap.vocabularies.Common.v1.ValueList</code> annotations.
	 *
	 * @param {sap.ui.model.Context} oPropertyContext
	 *   A model context for a structural property of an entity type or a complex type, as
	 *   returned by {@link #getMetaContext getMetaContext}
	 * @returns {Promise<Object<string,sap.ui.model.odata.ODataMetaModel.ValueListType>>}
	 *   A Promise that gets resolved into the value lists for the given context, as soon as the value lists as well as
	 *   the required model elements have been loaded
	 * @since 1.29.1
	 * @public
	 */
	ODataMetaModel.prototype.getODataValueLists = function (oPropertyContext) {
		var bCachePromise = false, // cache only promises which trigger a request
			aMatches,
			sPropertyPath = oPropertyContext.getPath(),
			oPromise = this.mContext2Promise[sPropertyPath],
			that = this;

		if (oPromise) {
			return oPromise;
		}

		aMatches = rPropertyPath.exec(sPropertyPath);
		if (!aMatches) {
			throw new Error("Unsupported property context with path " + sPropertyPath);
		}

		oPromise = new Promise(function (fnResolve, fnReject) {
			var oProperty = oPropertyContext.getObject(),
				sQualifiedTypeName,
				mValueLists = Utils.getValueLists(oProperty);

			const bValueListLoaded = "" in mValueLists
				&& that.getODataEntitySet(mValueLists[""].CollectionPath.String); // SNOW: DINC0054202
			if (!bValueListLoaded && oProperty["sap:value-list"]) {
				// property with value list which is not yet (fully) loaded
				bCachePromise = true;
				sQualifiedTypeName = that.oModel.getObject(aMatches[2]).namespace
					+ "." + that.oModel.getObject(aMatches[1]).name;
				that.mQName2PendingRequest[sQualifiedTypeName + "/" + oProperty.name] = {
					resolve : function (oResponse) {
						const oPropertyAnnotations = oResponse.annotations.propertyAnnotations?.[sQualifiedTypeName]
							?.[oProperty.name] || {};
						// enhance property by annotations from response to get value lists
						Object.keys(oPropertyAnnotations).forEach((sAnnotation) => {
							if (!oProperty.hasOwnProperty(sAnnotation)) {
								// apply only new annotations to avoid overwriting annotation changes
								oProperty[sAnnotation] = oPropertyAnnotations[sAnnotation];
							}
						});
						mValueLists = Utils.getValueLists(oProperty);
						if (isEmptyObject(mValueLists)) {
							fnReject(new Error("No value lists returned for " + sPropertyPath));
						} else {
							delete that.mContext2Promise[sPropertyPath];
							fnResolve(mValueLists);
						}
					},
					reject : fnReject
				};
				// send bundled value list request once after multiple synchronous API calls
				setTimeout(that._sendBundledRequest.bind(that), 0);
			} else {
				fnResolve(mValueLists);
			}
		});
		if (bCachePromise) {
			this.mContext2Promise[sPropertyPath] = oPromise;
		}

		return oPromise;
	};

	ODataMetaModel.prototype.getProperty = function () {
		return this._getObject.apply(this, arguments);
	};

	ODataMetaModel.prototype.isList = function () {
		return this.oModel.isList.apply(this.oModel, arguments);
	};

	/**
	 * Returns a promise which is fulfilled once the meta model data is loaded and can be used.
	 *
	 * @public
	 * @returns {Promise} a Promise
	 */
	ODataMetaModel.prototype.loaded = function () {
		return this.oLoadedPromise;
	};

	/**
	 * Refresh not supported by OData meta model!
	 *
	 * @throws {Error}
	 * @public
	 */
	ODataMetaModel.prototype.refresh = function () {
		throw new Error("Unsupported operation: ODataMetaModel#refresh");
	};

	/**
	 * Requests the currency customizing based on the code list reference given in the entity
	 * container's <code>com.sap.vocabularies.CodeList.v1.CurrencyCodes</code> annotation. The
	 * corresponding HTTP request uses the HTTP headers obtained via
	 * {@link sap.ui.model.odata.v2.ODataModel#getHeaders} from this meta model's data model.
	 *
	 * @returns {Promise<Object<string,{StandardCode: string, Text: string, UnitSpecificScale: string}>|null>}
	 *   A promise resolving with the currency customizing, which is a map from the currency key to
	 *   an object with the following properties:
	 *   <ul>
	 *     <li><code>StandardCode</code>: The language-independent standard code (e.g. ISO) for the
	 *       currency as referred to via the
	 *       <code>com.sap.vocabularies.CodeList.v1.StandardCode</code> annotation on the currency's
	 *       key, if present
	 *     <li><code>Text</code>: The language-dependent text for the currency as referred to via
	 *       the <code>com.sap.vocabularies.Common.v1.Text</code> annotation on the currency's key
	 *     <li><code>UnitSpecificScale</code>: The decimals for the currency as referred to via the
	 *       <code>com.sap.vocabularies.Common.v1.UnitSpecificScale</code> annotation on the
	 *       currency's key; entries where this would be <code>null</code> are ignored, and an error
	 *       is logged
	 *   </ul>
	 *   It resolves with <code>null</code> if no
	 *   <code>com.sap.vocabularies.CodeList.v1.CurrencyCodes</code> annotation is found.
	 *   It is rejected if the code list URL is not "./$metadata", there is not exactly one code
	 *   key, or if the customizing cannot be loaded.
	 *
	 * @public
	 * @see {@link #requestUnitsOfMeasure}
	 * @since 1.88.0
	 */
	ODataMetaModel.prototype.requestCurrencyCodes = function () {
		return Promise.resolve(this.fetchCodeList("CurrencyCodes")).then(function (mCodeList) {
			return mCodeList ? _Helper.merge({}, mCodeList) : mCodeList;
		});
	};

	/**
	 * Requests the unit customizing based on the code list reference given in the entity
	 * container's <code>com.sap.vocabularies.CodeList.v1.UnitOfMeasure</code> annotation. The
	 * corresponding HTTP request uses the HTTP headers obtained via
	 * {@link sap.ui.model.odata.v2.ODataModel#getHeaders} from this meta model's data model.
	 *
	 * @returns {Promise<Object<string,{StandardCode: string, Text: string, UnitSpecificScale: string}>|null>}
	 *   A promise resolving with the unit customizing, which is a map from the unit key to an
	 *   object with the following properties:
	 *   <ul>
	 *     <li><code>StandardCode</code>: The language-independent standard code (e.g. ISO) for the
	 *       unit as referred to via the <code>com.sap.vocabularies.CodeList.v1.StandardCode</code>
	 *       annotation on the unit's key, if present
	 *     <li><code>Text</code>: The language-dependent text for the unit as referred to via the
	 *       <code>com.sap.vocabularies.Common.v1.Text</code> annotation on the unit's key
	 *     <li><code>UnitSpecificScale</code>: The decimals for the unit as referred to via the
	 *       <code>com.sap.vocabularies.Common.v1.UnitSpecificScale</code> annotation on the unit's
	 *       key; entries where this would be <code>null</code> are ignored, and an error is logged
	 *   </ul>
	 *   It resolves with <code>null</code> if no
	 *   <code>com.sap.vocabularies.CodeList.v1.UnitOfMeasure</code> annotation is found.
	 *   It is rejected if the code list URL is not "./$metadata", there is not exactly one code
	 *   key, or if the customizing cannot be loaded.
	 *
	 * @public
	 * @see {@link #requestCurrencyCodes}
	 * @since 1.88.0
	 */
	ODataMetaModel.prototype.requestUnitsOfMeasure = function () {
		return Promise.resolve(this.fetchCodeList("UnitsOfMeasure")).then(function (mCodeList) {
			return mCodeList ? _Helper.merge({}, mCodeList) : mCodeList;
		});
	};

	/**
	 * Legacy syntax not supported by OData meta model!
	 *
	 * @param {boolean} bLegacySyntax
	 *   must not be true!
	 * @throws {Error} if <code>bLegacySyntax</code> is true
	 * @public
	 */
	ODataMetaModel.prototype.setLegacySyntax = function (bLegacySyntax) {
		if (bLegacySyntax) {
			throw new Error("Legacy syntax not supported by ODataMetaModel");
		}
	};

	/**
	 * Changes not supported by OData meta model!
	 *
	 * @throws {Error}
	 * @private
	 */
	ODataMetaModel.prototype.setProperty = function () {
		// Note: this method is called by JSONPropertyBinding#setValue
		throw new Error("Unsupported operation: ODataMetaModel#setProperty");
	};

	/**
	 * Gets the property names for the code list customizing for the given code list collection
	 * path.
	 *
	 * In some cases it might be necessary to overwrite code list annotations contained in the
	 * service metadata document. So local annotations need to be considered when loading code
	 * lists. As code lists have to be provided by the same service as the current data model is
	 * using, the metadata of the data model can be used to determine the property names
	 * for the code list customizing. In that case also annotations added via
	 * {@link sap.ui.model.odata.v2.ODataModel#addAnnotationUrl} or
	 * {@link sap.ui.model.odata.v2.ODataModel#addAnnotationXML} are considered.
	 *
	 * @param {string} sCollectionPath
	 *   The collection path specified in the corresponding
	 *   com.sap.vocabularies.CodeList.v1.* annotation e.g. "SAP__Currencies"
	 * @returns {object}
	 *   The returned object has the properties "code", "text", "unitSpecificScale" and
	 *   optionally "standardCode", with the values for the corresponding property names of the
	 *   entity representing a code list entry
	 * @throws {Error}
	 *   If there is more than one alternative or more than one key per alternative
	 *
	 * @private
	 */
	ODataMetaModel.prototype._getPropertyNamesForCodeListCustomizing = function (sCollectionPath) {
		var sPathToCollectionMetadata = "/" + sCollectionPath + "/##",
			oTypeMetadata = this.oDataModel.getObject(sPathToCollectionMetadata),
			aAlternateKeys = oTypeMetadata["Org.OData.Core.V1.AlternateKeys"],
			sKeyPath = ODataMetaModel._getKeyPath(oTypeMetadata, sPathToCollectionMetadata),
			oKeyMetadata = this.oDataModel.getObject("/" + sCollectionPath + "/" + sKeyPath
				+ "/##");

		if (aAlternateKeys) {
			if (aAlternateKeys.length !== 1) {
				throw new Error("Single alternative expected: " + sPathToCollectionMetadata
					+ "Org.OData.Core.V1.AlternateKeys");
			} else if (aAlternateKeys[0].Key.length !== 1) {
				throw new Error("Single key expected: " + sPathToCollectionMetadata
					+ "Org.OData.Core.V1.AlternateKeys/0/Key");
			}
			sKeyPath = aAlternateKeys[0].Key[0].Name.Path;
		}

		return {
			code : sKeyPath,
			standardCode : oKeyMetadata["com.sap.vocabularies.CodeList.v1.StandardCode"]
				&& oKeyMetadata["com.sap.vocabularies.CodeList.v1.StandardCode"].Path,
			text : oKeyMetadata["com.sap.vocabularies.Common.v1.Text"].Path,
			unitSpecificScale :
				oKeyMetadata["com.sap.vocabularies.Common.v1.UnitSpecificScale"].Path
		};
	};

	//*********************************************************************************************
	// "static" functions
	//*********************************************************************************************

	/**
	 * Gets the single key property name for the given type.
	 *
	 * @param {sap.ui.model.odata.ODataMetaModel.EntityType} oType The entity type
	 * @param {string} sTypePath The path to the entity type
	 * @returns {string} The property path to the type's single key
	 * @throws {Error} If the type does not have exactly one key
	 *
	 * @private
	 */
	ODataMetaModel._getKeyPath = function (oType, sTypePath) {
		var aKeys = oType.key.propertyRef;

		if (aKeys && aKeys.length === 1) {
			return aKeys[0].name;
		}
		throw new Error("Single key expected: " + sTypePath);
	};

	/**
	 * Returns the code list term for the given data path in case it is "/##@@requestCurrencyCodes"
	 * or "/##@@requestUnitsOfMeasure" so that it refers to a code list.
	 *
	 * @param {string} sDataPath
	 *   The data path
	 * @returns {string|undefined}
	 *   The code list term as specified in {@link #fetchCodeList}; <code>undefined</code> if the
	 *   data path does not refer to a code list
	 *
	 * @private
	 */
	ODataMetaModel.getCodeListTerm = function (sDataPath) {
		if (sDataPath === "/##@@requestCurrencyCodes") {
			return "CurrencyCodes";
		} else if (sDataPath === "/##@@requestUnitsOfMeasure") {
			return "UnitsOfMeasure";
		}

		return undefined;
	};

	return ODataMetaModel;
});