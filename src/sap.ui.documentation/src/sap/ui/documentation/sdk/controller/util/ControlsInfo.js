/*!
 * ${copyright}
 */

// Provides information about 'explored' samples.
sap.ui.define(["sap/ui/thirdparty/jquery", 'sap/ui/documentation/library', "sap/base/Log", "sap/ui/documentation/sdk/util/Resources"], function(jQuery, library, Log, ResourcesUtil) {
	"use strict";

	var oPromise;

	var ControlsInfo = {

		loadData: function() {
			if (!oPromise) {

				oPromise = new Promise(function(resolve, reject) {
					library._loadAllLibInfo(
						"", "_getDocuIndex",
						function (aLibs, oDocIndicies) {
							var oData = ControlsInfo._getIndices(aLibs, oDocIndicies, function () {
								// We pass the resolve method to be called when we have all the component data loaded
								resolve(oData);
							});
						});
				});
			}
			return oPromise;
		},

		_getIndices: function (aLibs, oDocIndicies, fnComponentLoadCallback) {
			var aInternalCategoryAllowList = [
				"_PRIVATE_"
			];

			var aCategoryAllowList = [
				"Action",
				"Application",
				"Container",
				"Display",
				"Chart",
				"Mini Chart",
				"Layout",
				"List",
				"Floorplans & Patterns",
				"Popup",
				"Tile",
				"User Input",
				"Showcase",
				"Testing",
				"Theming",
				"Tutorial",
				"Routing",
				"Data Binding",
				"Data Visualization",
				"Map",
				"Utility",
				"Web Components",
				"Metadata-Driven Controls (sap.ui.mdc)",
				"Personalization"
			];
			var afilterProps = ["namespace", "since", "category"]; // content density are set manually
			var oFilterSets = {
				namespace: {},
				since: {},
				category: {},
				formFactors: { // content density are set manually
					"Independent": true,
					"Condensed": true,
					"Compact": true,
					"Cozy": true
				}
			};
			var mFormFactorsMap = {
				"-": "Independent",
				"S": "Condensed",
				"SM": "Condensed, Compact",
				"SL": "Condensed, Cozy",
				"SML": "Condensed, Compact, Cozy",
				"M": "Compact",
				"ML": "Compact, Cozy",
				"L": "Cozy"
			};

			// init data structures
			var data = {};
			data = {};
			data.entityCount = 0;
			data.entities = [];
			data.filter = {};
			data.samples = {};

			// iterate docu indices
			jQuery.each(oDocIndicies, function (i, oDoc) {

				// check data
				if (!oDoc.explored) {
					return;
				} else if (!oDoc.explored.samplesRef) {
					Log.error("explored: cannot register lib '" + oDoc.library + "'. missing 'explored.samplesRef'");
					return;
				} else if (Array.isArray(oDoc.explored.samplesRef) && oDoc.explored.samplesRef.length !== oDoc.explored.samplesRef.filter(function (oItem) {
						return oItem.namespace && oItem.ref;
					}).length) {
					Log.error("explored: cannot register lib '" + oDoc.library + "'. missing 'explored.samplesRef.namespace' or 'explored.samplesRef.ref' in one or more of the configured namespaces");
					return;
				} else if (!Array.isArray(oDoc.explored.samplesRef) && !oDoc.explored.samplesRef.namespace) {
					Log.error("explored: cannot register lib '" + oDoc.library + "'. missing 'explored.samplesRef.namespace'");
					return;
				} else if (!Array.isArray(oDoc.explored.samplesRef) && !oDoc.explored.samplesRef.ref) {
					Log.error("explored: cannot register lib '" + oDoc.library + "'. missing 'explored.samplesRef.ref'");
					return;
				} else if (!oDoc.explored.entities) {
					Log.error("explored: cannot register lib '" + oDoc.library + "'. missing 'explored.entities'");
					return;
				} else {
					Log.info("explored: now reading lib '" + oDoc.library + "'");
				}

				// register sample resources
				if (Array.isArray(oDoc.explored.samplesRef)) {
					// register an array of namespaces
					oDoc.explored.samplesRef.forEach(function (oItem) {
						(function() {
							var paths = {};
							paths[oItem.namespace.replace(/\./g, "/")] = "" + ResourcesUtil.getResourceOriginPath(oItem.ref || ".");
							sap.ui.loader.config({paths: paths});
						}());
					});
				} else {
					// register a single namespace
					(function() {
						var paths = {};
						paths[oDoc.explored.samplesRef.namespace.replace(/\./g, "/")] = "" + ResourcesUtil.getResourceOriginPath(oDoc.explored.samplesRef.ref || ".");
						sap.ui.loader.config({paths: paths});
					}());
				}

				// build sample map
				jQuery.each(oDoc.explored.samples, function (i, oSample) {
					if (!oSample.id) {
						Log.error("explored: cannot register sample '?'. missing 'id'");
					} else if (!oSample.name) {
						Log.error("explored: cannot register sample '" + oSample.id + "'. missing 'name'");
					} else {
						data.samples[oSample.id] = oSample;
						oSample.library = oDoc.library;
					}
				});

				// iterate entities
				jQuery.each(oDoc.explored.entities, function (j, oEnt) {

					// check id property
					if (!oEnt.id) {
						Log.error("explored: cannot register entity '?'. missing 'id'");
						return;
					}

					// apply default properties
					if (oDoc.explored.entitiesDefaults) {
						jQuery.each(oDoc.explored.entitiesDefaults, function (key, value) {
							if (!oEnt.hasOwnProperty(key)) {
								oEnt[key] = value;
							}
						});
					}

					// apply namespace property
					var iIndex = oEnt.id.lastIndexOf(".");
					var sNamespace = (iIndex !== -1) ? oEnt.id.substring(0, iIndex) : oEnt.id;
					oEnt.namespace = sNamespace;

					// check name property
					if (!oEnt.name) {
						Log.error("explored: cannot register entity '" + oEnt.id + "'. missing 'name'");
						return;
					}

					// check category allowlist
					if (aCategoryAllowList.indexOf(oEnt.category) === -1 && aInternalCategoryAllowList.indexOf(oEnt.category) === -1) {
						Log.error("explored: cannot register entity '" + oEnt.id + "'. category '" + oEnt.category + "' is not allowed");
						return;
					}

					// convert content density
					if (!oEnt.formFactors) {
						Log.error("explored: cannot register entity '" + oEnt.id + "'. missing 'formFactors'");
						return;
					}
					if (!mFormFactorsMap[oEnt.formFactors]) {
						Log.error("explored: cannot register entity '" + oEnt.id + "'. formFactors '" + oEnt.formFactors + "' is not allowed");
						return;
					}
					oEnt.formFactors = mFormFactorsMap[oEnt.formFactors];

					// check filter properties
					var bAbortEntity = false;
					jQuery.each(afilterProps, function (i, sProp) {
						if (!oEnt[sProp]) {
							Log.error("explored: cannot register entity '" + oEnt.id + "'. missing '" + sProp + "'");
							bAbortEntity = true;
							return false;
						}
					});
					if (bAbortEntity) {
						return;
					}

					// add filter properties to sets
					jQuery.each(afilterProps, function (i, sProp) {
						oFilterSets[sProp][oEnt[sProp]] = true;
					});

					oEnt.library = oDoc.library;

					// add entity
					if (aCategoryAllowList.indexOf(oEnt.category) > -1) {
						data.entities.push(oEnt);
					}
				});
			});

			// iterate entities one more time and add the sample data
			// (this must be done in a separate loop in order to map samples across libraries/docIndizes)
			jQuery.each(data.entities, function (sNamespace, oEnt) {
				var i = 0,
					oStep,
					fnPrependZero;

				// define search tags
				oEnt.searchTags = oEnt.name + " " + oEnt.name.replace(/\s/g, "") + " " + oEnt.category;

				// add sample name and descriptions to search tags
				if (oEnt.samples) {
					oEnt.samples.forEach(function (sSample) {
						var oSample = data.samples[sSample];
						if (oSample) {
							oEnt.searchTags += " " + oSample.name;
							oEnt.searchTags += " " + oSample.description;
						}
					});
				}

				// check samples property
				if (oEnt.samples && !(oEnt.samples instanceof Array)) {
					oEnt.samples = [];
					Log.error("explored: cannot register samples for entity '" + oEnt.id + "'. 'samples' is not an array");
					return;
				}
				if (!oEnt.samples) {
					oEnt.samples = [];
				}

				// add samples to entity
				if (oEnt.samplesAsSteps) {
					// step-based entities: generate a sample based on the name of the step and the position in the array
					if (!(oEnt.samplesAsSteps instanceof Array)) {
						Log.error("explored: cannot register samples for entity '" + oEnt.id + "'. 'samplesAsSteps' is not an array");
						return;
					}

					// helper function to add a leading 0 for all samples (folders will start with 01)
					fnPrependZero = function (iNumber) {
						if (iNumber.toString().length === 1) {
							return "0" + iNumber;
						}
						return iNumber;
					};

					for (; i < oEnt.samplesAsSteps.length; i++) {
						oStep = {
							"id": oEnt.id + "." + fnPrependZero(i + 1),
							"name": oEnt.name + " - Step " + (i + 1) + " - " + oEnt.samplesAsSteps[i]
						};

						// dynamically add a prev / next pointer to be able to cross-navigate between the samples of the same type
						if (i > 0) {
							oStep.previousSampleId = oEnt.id + "." + fnPrependZero(i);
						}
						if (i < oEnt.samplesAsSteps.length - 1) {
							oStep.nextSampleId = oEnt.id + "." + fnPrependZero(i + 2);
						}

						oStep.entityId = oEnt.id;

						// add generated sample to this entity and to the samples array
						oEnt.samples.push(oStep);
						//Added library property, used to load sample resources
						oStep.library = oEnt.library;
						data.samples[oStep.id] = oStep;
						oEnt.searchTags += " " + oStep.name;
					}
				} else {
					// other entities: lookup samples and build search tags
					var aSamples = [],
						oPreviousSample;

					jQuery.each(oEnt.samples, function (j, sId) {
						var oSample = data.samples[sId];

						if (!oSample) {
							Log.warning("explored: cannot register sample '" + sId + "' for '" + oEnt.id + "'. not found in the available docu indizes");
						} else {

							oSample.entityId = oEnt.id;

							// Record specifics based on sample contexts
							if (!oSample.contexts) {
								oSample.contexts = {};
							}

							if (!oSample.contexts[oSample.entityId]) {
								oSample.contexts[oSample.entityId] = {};
							}

							// dynamically add a prev / next pointer to be able to cross-navigate between the samples of the same type
							oSample.contexts[oSample.entityId].previousSampleId = (oPreviousSample ? oPreviousSample.id : undefined);

							if (oPreviousSample) {
								oPreviousSample.contexts[oSample.entityId].nextSampleId = oSample.id;
							}
							oPreviousSample = oSample;

							// add the sample to the local store
							aSamples.push(oSample);
							oEnt.searchTags += " " + oSample.name;
						}
					});
					oEnt.samples = aSamples;
				}

				// set count
				oEnt.sampleCount = oEnt.samples.length;
			});

			// set count
			data.entityCount = data.entities.length;

			// convert filter sets to arrays
			jQuery.each(oFilterSets, function (setKey, setValue) {
				data.filter[setKey] = [];
				jQuery.each(setValue, function (key, value) {
					data.filter[setKey].push({id: key});
				});
			});
			// Call LibraryInfo API method for collecting all component info from the .library files
			// Note: _getLibraryInfo collects info with a delayed call so we need a callback to know
			// when the last library info is collected

			var oLibInfo = library._getLibraryInfoSingleton();
			var oLibComponents = {};
			var aPromises = [];

			// Create promises for all libraries needed
			for (var i = 0; i < aLibs.length; i++) {
				/* eslint-disable no-loop-func */
				aPromises.push(new Promise(function (fnResolve) {
					var oLibraryComponentInfo = function (oComponent) {
						oLibComponents[oComponent.library] = oComponent.componentInfo;
						fnResolve();
					};
					oLibInfo._getLibraryInfo(aLibs[i], oLibraryComponentInfo);
				}));
				/* eslint-enable no-loop-func */
			}

			// Execute promises
			Promise.all(aPromises).then(function () {
				// Callback so the loading of the library component data can be handled
				fnComponentLoadCallback && fnComponentLoadCallback();
			});

			data.libComponentInfos = oLibComponents;

			data.groups = this.getGroups(data.entities);
			return data;
		},

		findGroup: function (groups, name) {

			var group;

			for (var i = 0; i < groups.length; i++) {

				group = groups[i];

				if (group.name == name) {
					return group;
				}
			}
		},

		getGroups : function (entities) {
			var groups = [],
				entity,
				group,
				samples,
				sample,
				i,
				j;

			for (i = 0; i < entities.length; i++) {
				entity = entities[i];
				entity.key = '#/entity/' + entity.id;

				samples = entity.samples;
				for (j = 0; j < samples.length; j++) {
					sample = samples[j];
					sample.key = '#/sample/' + sample.id + "/preview";
				}

				group = this.findGroup(groups, entity.category);
				if (!group) {
					group = {
						name: entity.category,
						key: '#/group/' + entity.category,
						controls: [entity]
					};

					groups.push(group);
				} else {
					group.controls.push(entity);
				}
			}

			return groups;
		}
	};

	return ControlsInfo;

});
