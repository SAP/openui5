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
						oAssociation = that._getAssociation(aAssociationName[0], aAssociationName[1]);
						if (oAssociation) {
							oEnd = oAssociation.end[0];
							if (oEnd.role !== oNavigationProperty.toRole) {
								oEnd = oAssociation.end[1];
							}
							aEntityTypeName = that._splitName(oEnd.type);
							oEntityType = that._getEntityType(aEntityTypeName[0], aEntityTypeName[1]);
						}
						return false;
					}
				});
			}
		}
	} else {
		// if only one part exists it should be the name of the collection and we can get the entity type for it
		aEntityTypeName = this._splitName(this._getEntityTypeName(aParts[0]));		
		oEntityType = this._getEntityType(aEntityTypeName[0], aEntityTypeName[1]);
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
 * search metadata for specified association name with the specified namespace
 */
sap.ui.model.odata.ODataMetadata.prototype._getAssociation = function(sAssociationName, sNameSpace) {
	var oAssociation;
	if (sAssociationName && sNameSpace) {
		// search association in all schemas
		jQuery.each(this.oMetadata.dataServices.schema, function(i, oSchema) {
			if (oSchema.namespace === sNameSpace && oSchema.association) {
				if (oSchema.association) {
					jQuery.each(oSchema.association, function(k, oCurrentAssociation) {   
						if (oCurrentAssociation.name === sAssociationName){
							oAssociation = oCurrentAssociation;
							return false;
						}
					});					
				}
			}
		});		
	}
	jQuery.sap.assert(oAssociation, "Association " + sAssociationName + " not found!");  
	return oAssociation;
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
 * get the entity type of a specified entity type name and namespace
 */
sap.ui.model.odata.ODataMetadata.prototype._getEntityType = function(sEntityTypeName, sNamespace) {
	var oEntityType;
	if (sEntityTypeName && sNamespace) {
		// search in all schemas for the entity type
		jQuery.each(this.oMetadata.dataServices.schema, function(i, oSchema) {
			// check if we found the right schema which will contain the type
			if (oSchema.entityType && oSchema.namespace === sNamespace) {
				jQuery.each(oSchema.entityType, function(j, oCurrentEntityType) {
					if (oCurrentEntityType.name === sEntityTypeName) {  
						oEntityType = oCurrentEntityType;
						return false;
					}
				});
				return !oEntityType;
			}
		});		
	}	
	jQuery.sap.assert(oEntityType, "EntityType of EntityType name " + sEntityTypeName + " not found!");  
	return oEntityType;  
};


// TODO complex types not supported
/**  
*  extract the property metadata of a specified property of a entity type out of the metadata document 
*/  
sap.ui.model.odata.ODataMetadata.prototype._getPropertyMetadata = function(oEntityType, sProperty) {
	var oPropertyMetadata;
	jQuery.each(oEntityType.property, function(k, oProperty) {
		if (oProperty.name === sProperty){
			oPropertyMetadata = oProperty;
			return false;
		}
	});
	
	jQuery.sap.assert(oPropertyMetadata, "PropertyType for property "+sProperty+ " of EntityType " +oEntityType.name+ " not found!");  
	return oPropertyMetadata;  
};
