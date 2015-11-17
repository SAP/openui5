/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v4/_SyncPromise"
], function (ODataUtils, SyncPromise) {
	"use strict";

	var Helper,
		rNamedSegment = /^(.+)\('(.*)'\)$/; // e.g. "EntitySets('Employees')"

	Helper = {
		/**
		 * Requests the entity container from the meta data model including the entity sets and the
		 * singletons. Keeps it in a cache and responds subsequent requests from the cache.
		 *
		 * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel
		 *   the meta model
		 * @returns {SyncPromise}
		 *   A promise which is resolved with the entity container as soon as it is available
		 * @private
		 */
		fetchEntityContainer : function (oMetaModel) {
			if (!oMetaModel._oEntityContainerPromise) {
				oMetaModel._oEntityContainerPromise
					= oMetaModel.oModel.fetchEntityContainer()
						.then(function (oEntityContainer) {
							Helper.resolveNavigationPropertyBindings(oEntityContainer);
							return oEntityContainer;
						});
			}
			return oMetaModel._oEntityContainerPromise;
		},

		/**
		 * Requests the type for the given navigation property at the given object if it is not
		 * available yet. It is stored at the property, cached in the meta model and then given to
		 * the promise.
		 *
		 * Example:
		 * <code>
		 * requestTypeForNavigationProperty(oMetaModel, oEntitySet, "EntityType")
		 * </code>
		 * This requests and sets the entity type at the given entity set. The entity set is
		 * expected to already have a "placeholder" object with the QualifiedName, as it is
		 * returned from the metadata model.
		 *
		 * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel
		 *   the meta model
		 * @param {object} oObject
		 *   the object having a navigation link to a type
		 * @param {string} sProperty
		 *   the name of the type property
		 * @returns {SyncPromise}
		 *   a promise that will be resolved with the requested type
		 * @private
		 */
		fetchTypeForNavigationProperty : function (oMetaModel, oObject, sProperty) {
			var sQualifiedName = oObject[sProperty].QualifiedName;

			if (Object.keys(oObject[sProperty]).length > 1) {
				//navigation property already resolved
				return SyncPromise.resolve(oObject[sProperty]);
			}

			return Helper.fetchEntityContainer(oMetaModel).then(function (oEntityContainer) {
				var oArray = oEntityContainer.Types,
					oResult;

				if (oArray) {
					oResult = Helper.findInArray(oArray, "QualifiedName", sQualifiedName);
					if (oResult) {
						return SyncPromise.resolve(oResult);
					}
				} else {
					oEntityContainer.Types = [];
				}

				return oMetaModel.oModel.fetchEntityType(sQualifiedName)
					.then(function (oResult) {
						oEntityContainer.Types.push(oResult);
						oObject[sProperty] = oResult;
						return oResult;
					});
			});
		},

		/**
		 * Finds an object which has a property <code>sProperty</code> with value
		 * <code>sValue</code> in the given array.
		 *
		 * @param {object[]} aObjects
		 *   the array to search in
		 * @param {string} sProperty
		 *   the name of the property to look at
		 * @param {string} sValue
		 *   the expected value
		 * @returns {object}
		 *   the matching object or <code>undefined</code> if not found
		 */
		findInArray : function (aObjects, sProperty, sValue) {
			var i;

			for (i = 0; i < aObjects.length; i++) {
				if (aObjects[i][sProperty] === sValue) {
					return aObjects[i];
				}
			}
			return undefined;
		},

		/**
		 * Returns the key predicate (see "4.3.1 Canonical URL") for the given entity type meta
		 * data and entity instance runtime data.
		 *
		 * @param {object} oEntityType
		 *   entity type meta data
		 * @param {object} oEntityInstance
		 *   entity instance runtime data
		 * @returns {string}
		 *   the key predicate, e.g. "(Sector='DevOps',ID='42')"
		 */
		getKeyPredicate : function (oEntityType, oEntityInstance) {
			var aKeyValuePairs = [];

			oEntityType.Key.forEach(function (oKey) {
				var sName = oKey.PropertyPath,
					oProperty = Helper.findInArray(oEntityType.Properties, "Name", sName),
					sType = oProperty.Type.QualifiedName,
					sValue = ODataUtils.formatValue(oEntityInstance[sName], sType);

				aKeyValuePairs.push(
					encodeURIComponent(sName) + "=" + encodeURIComponent(sValue));
			});

			return "(" + aKeyValuePairs.join(",") + ")";
		},

		/**
		 * Parses a segment of a path in the OData v4 meta model in the simplified syntax where the
		 * name of the single key property is not provided.
		 *
		 * @param {string} sSegment
		 *   the segment like "Type" or "EntitySets('Employees')"
		 * @returns {object}
		 *   the result with property, name and segment or <code>undefined</code> if
		 *   <code>sSegment</code> is falsy
		 *   Example:
		 *   {
		 *     name: "€mployees"
		 *     property: "EntitySets",
		 *     segment: "EntitySets('%E2%82%ACmployees')",
		 *   }
		 */
		parseSegment : function (sSegment) {
			var aMatches,
				oPart;

			if (!sSegment) {
				return undefined;
			}
			oPart = {
				property: sSegment,
				segment: sSegment
			};
			aMatches = rNamedSegment.exec(sSegment);
			if (aMatches) {
				oPart.property = aMatches[1];
				oPart.name = aMatches[2];
			}
			return oPart;
		},

		/**
		 * Resolves all navigation property bindings in the entity container unless they are
		 * leading into another container.
		 *
		 * @param {object} oEntityContainer
		 *   the entity container
		 */
		resolveNavigationPropertyBindings : function (oEntityContainer) {

			// finds the entity set or singleton with the given fullname
			function findTarget(sFullname) {
				return Helper.findInArray(oEntityContainer.EntitySets, "Fullname", sFullname)
					|| Helper.findInArray(oEntityContainer.Singletons, "Fullname", sFullname);
			}

			// resolves all navigation property bindings for the given entity set or singleton
			function resolve(oSetOrSingleton) {
				oSetOrSingleton.NavigationPropertyBindings.forEach(function (oBinding) {
					var oTarget = findTarget(oBinding.Target.Fullname);
					if (oTarget) {
						// TODO Here we modify the object, so that ODataMetaModel.requestObject
						// can follow the path because it always uses "Name"; this is not compliant
						// to the metadata service (use @sapui.name annotation?)
						oBinding.Name = oBinding.Path;
						oBinding.Target = oTarget;
					}
				});
			}

			oEntityContainer.EntitySets.forEach(resolve);
			oEntityContainer.Singletons.forEach(resolve);
		},

		/**
		 * Splits an absolute path at '/' into an array of path segments. URI-decodes the path
		 * segments. The empty path "/" results in an empty array.
		 *
		 * @param {string} sPath
		 *   the path
		 * @returns {string[]}
		 *   the path parts
		 * @throws {Error} if the path is not absolute
		 */
		splitPath : function (sPath) {
			if (sPath === '/') {
				return [];
			}
			if (sPath.charAt(0) !== '/') {
				throw new Error("Not an absolute path: " + sPath);
			}
			return sPath.substring(1).split('/');
		}
	};

	return Helper;
}, /* bExport= */ false);
