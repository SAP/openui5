/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */



// Provides class sap.ui.model.odata.ODataMetadata
jQuery.sap.declare("sap.ui.model.odata.ODataMetadata");

/**
 * Constructor for a new ODataMetadata.
 *
 * @param {object} oMetadata the parsed metadata object provided by datajs
 *
 * @class
 * Implementation to access oData metadata
 *
 * @author SAP AG
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor
 * @public
 * @name sap.ui.model.odata.ODataMetadata
 * @extends sap.ui.base.Object
 */
sap.ui.base.Object.extend("sap.ui.model.odata.ODataMetadata", /** @lends sap.ui.model.odata.ODataMetadata */ {
	
	constructor : function(oMetadata) {
	
		this.oMetadata = oMetadata;
	},
	
	metadata : {
		publicMethods : ["getServiceMetadata"]
	}
	
});

/**
 * Creates a new subclass of class sap.ui.model.odata.ODataMetadata with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code> 
 * see {@link sap.ui.base.Object.extend Object.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ui.model.odata.ODataMetadata.extend
 * @function
 */

/**
 * Return the metadata object
 *
 * @return {Object} metdata object
 * @public
 */
sap.ui.model.odata.ODataMetadata.prototype.getServiceMetadata = function() {
	return this.oMetadata;
};


/**
 * Extract the entity type name of a given sPath. Also navigation properties in the path will be followed to get the right entity type for that property.
 * eg. 
 * /Categories(1)/Products(1)/Category --> will get the Categories entity type
 * /Products --> will get the Products entity type
 * @return {object} the entity type or null if not found
 */
sap.ui.model.odata.ODataMetadata.prototype._getEntityTypeByPath = function(sPath) {
	if (!sPath) {
		jQuery.sap.assert(undefined, "sPath not defined!");
		return null;
	}
	if (!this.oMetadata || jQuery.isEmptyObject(this.oMetadata)) {
		jQuery.sap.assert(undefined, "No metadata loaded!");
		return null;
	}
	// remove starting and trailing / 
	var sCandidate = sPath.replace(/^\/|\/$/g, ""),
		aParts = sCandidate.split("/"),
		iLength = aParts.length,
		sCollectionBefore,
		oEntityTypeBefore,
		aAssociationName,
		oAssociation,
		oEnd,		
		aEntityTypeName,
		oEntityType,
		that = this;
	
	// remove key from last path segment if any (e.g. Products(555) --> Products)
	if (aParts[iLength-1].indexOf("(") != -1){
		aParts[iLength-1] = aParts[iLength - 1].substring(0,aParts[iLength - 1].indexOf("("));
	}
	
	if (iLength > 1 ) {
		// check if navigation property is used
		// e.g. Categories(1)/Products(1)/Category --> Category is a navigation property so we need the collection Categories
		if (aParts[iLength-2].indexOf("(") != -1){
			// get entity Type of collection before, which is e.g. Products and which has the navigation property Category inside
			sCollectionBefore = aParts[iLength - 2].substring(0,aParts[iLength - 2].indexOf("("));
			oEntityTypeBefore = this._getEntityTypeByPath(sCollectionBefore);
			
			if (oEntityTypeBefore && oEntityTypeBefore.navigationProperty) {				
				jQuery.each(oEntityTypeBefore.navigationProperty, function(i, oNavigationProperty) {   
					if (oNavigationProperty.name === aParts[iLength - 1]) {
						// get association for navigation property and then the collection name
						aAssociationName = that._splitName(oNavigationProperty.relationship); 
						oAssociation = that._getObjectMetadata("association", aAssociationName[0], aAssociationName[1]);
						if (oAssociation) {
							oEnd = oAssociation.end[0];
							if (oEnd.role !== oNavigationProperty.toRole) {
								oEnd = oAssociation.end[1];
							}
							aEntityTypeName = that._splitName(oEnd.type);
							oEntityType = that._getObjectMetadata("entityType", aEntityTypeName[0], aEntityTypeName[1]);
						}
						return false;
					}
				});
			}
		}
	} else {
		// if only one part exists it should be the name of the collection and we can get the entity type for it
		aEntityTypeName = this._splitName(this._getEntityTypeName(aParts[0]));		
		oEntityType = this._getObjectMetadata("entityType", aEntityTypeName[0], aEntityTypeName[1]);
	}
	jQuery.sap.assert(oEntityType, "EntityType for path " + sPath + " could not be found!");  
	return oEntityType;
};


/**
 * splits a name e.g. Namespace.Name into [Name, Namespace]
 */
sap.ui.model.odata.ODataMetadata.prototype._splitName = function(sFullName) {
	var aParts = [];
	if (sFullName) {
		var iSepIdx = sFullName.lastIndexOf(".");
		aParts[0] = sFullName.substr(iSepIdx + 1);
		aParts[1] = sFullName.substr(0, iSepIdx);		
	}
	return aParts;
};


/**  
*  search metadata for specified collection name (= entity set name)
*/  
sap.ui.model.odata.ODataMetadata.prototype._getEntityTypeName = function(sCollection) {
	var sEntityTypeName;
	if (sCollection) {
		jQuery.each(this.oMetadata.dataServices.schema, function(i, oSchema) {
			if (oSchema.entityContainer) {
				jQuery.each(oSchema.entityContainer, function(k, oEntityContainer) {   
					jQuery.each(oEntityContainer.entitySet, function(j, oEntitySet) {  
						if (oEntitySet.name === sCollection) {  
							sEntityTypeName = oEntitySet.entityType;
							return false;
						}
					});
				});
			}
		});		
	}
	jQuery.sap.assert(sEntityTypeName, "EntityType name of EntitySet "+ sCollection + " not found!");
	return sEntityTypeName;  
};

/**
 * get the object of a specified type name and namespace
 */
sap.ui.model.odata.ODataMetadata.prototype._getObjectMetadata = function(sObjectType, sObjectName, sNamespace) {
	var oObject;
	if (sObjectName && sNamespace) {
		// search in all schemas for the sObjectName
		jQuery.each(this.oMetadata.dataServices.schema, function(i, oSchema) {
			// check if we found the right schema which will contain the sObjectName
			if (oSchema[sObjectType] && oSchema.namespace === sNamespace) {
				jQuery.each(oSchema[sObjectType], function(j, oCurrentObject) {
					if (oCurrentObject.name === sObjectName) {  
						oObject = oCurrentObject;
						return false;
					}
				});
				return !oObject;
			}
		});		
	}	
	jQuery.sap.assert(oObject, "ObjectType " + sObjectType + " for name " + sObjectName + " not found!");  
	return oObject;  
};


/**  
*  extract the property metadata of a specified property of a entity type out of the metadata document 
*/  
sap.ui.model.odata.ODataMetadata.prototype._getPropertyMetadata = function(oEntityType, sProperty) {
	var oPropertyMetadata;
	
	var aParts = sProperty.split("/"); // path could point to a complex type
	
	jQuery.each(oEntityType.property, function(k, oProperty) {
		if (oProperty.name === aParts[0]){
			oPropertyMetadata = oProperty;
			return false;
		}
	});
	
	// check if complex type
	if (oPropertyMetadata && aParts.length > 1 && !jQuery.sap.startsWith(oPropertyMetadata.type.toLowerCase(), "edm.")) {		
		var aName = this._splitName(oPropertyMetadata.type);
		oPropertyMetadata = this._getPropertyMetadata(this._getObjectMetadata("complexType", aName[0], aName[1]), aParts[1]);
	}
	
	jQuery.sap.assert(oPropertyMetadata, "PropertyType for property "+ aParts[0]+ " of EntityType " + oEntityType.name + " not found!");  
	return oPropertyMetadata;  
};
