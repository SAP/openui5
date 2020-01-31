/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/Utils",
	"sap/base/Log",
	"sap/ui/fl/Layer",
	"sap/base/util/includes",
	"sap/base/util/merge"
], function(
	DescriptorVariantFactory,
	DescriptorInlineChangeFactory,
	ChangesController,
	Utils,
	Log,
	Layer,
	includes,
	merge
) {
	"use strict";

	function _validatePackageAndPrepareTransportInfo(mPropertyBag, oAppVariant) {
		// (Package Validation) Writing, updating or deleting content in VENDOR or CUSTOMER_BASE layer must require a package (either a valid package or local object)
		if (
			!mPropertyBag.package
			&& (
				mPropertyBag.layer === Layer.VENDOR
				|| (
					mPropertyBag.layer === Layer.CUSTOMER_BASE
					&& !oAppVariant.getSettings().isAtoEnabled()
				)
			)
		) {
			return Promise.reject("Package must be provided or is valid");
		}

		// (Transport Validation) Writing, updating or deleting content in onPremise systems in all layers must require a transport unless the package is not local object
		if (
			mPropertyBag.isForSmartBusiness
			&& (
				mPropertyBag.package !== '$TMP'
				&& mPropertyBag.package !== ''
			)
			&& !mPropertyBag.transport
			&& !oAppVariant.getSettings().isAtoEnabled()
		) {
			return Promise.reject("Transport must be provided");
		}

		// Smart business must pass transport information in case of onPremise systems unless app variant is not intended to be saved as local object
		if (
			mPropertyBag.isForSmartBusiness
			&& mPropertyBag.transport
			|| (
				mPropertyBag.package === "$TMP"
			)
		) {
			return Promise.resolve({
				packageName: mPropertyBag.package,
				transport: mPropertyBag.transport
			});
		}

		// Save As scenario for onPremise and cloud systems
		return Promise.resolve({
			packageName: "",
			transport: ""
		});
	}

	function _setTransportAndPackageInfoForAppVariant(oAppVariant, oTransportInfo) {
		// Sets the transport and package info for app variant
		var oTransportPromise = oTransportInfo.transport ? oAppVariant.setTransportRequest(oTransportInfo.transport) : Promise.resolve();

		return oTransportPromise.then(function() {
			if (oTransportInfo.packageName) {
				return oAppVariant.setPackage(oTransportInfo.packageName);
			}
			return Promise.resolve();
		});
	}

	function _getInlineChangesFromDescrChanges(aDescrChanges) {
		var aInlineChangesPromises = [];

		aDescrChanges.forEach(function(oChange) {
			var oChangeDefinition = oChange.getDefinition();
			// Change contains only descriptor change information so the descriptor inline change needs to be created again
			aInlineChangesPromises.push(DescriptorInlineChangeFactory.createNew(oChangeDefinition.changeType, oChangeDefinition.content, oChangeDefinition.texts));
		});
		return Promise.all(aInlineChangesPromises);
	}

	function _moveChangesToNewFlexReference(oChange, oAppVariant) {
		var oPropertyBag = {
			reference: oAppVariant.getId()
		};
		var sChangesNamespace = Utils.createNamespace(oPropertyBag, "changes");
		oChange.setNamespace(sChangesNamespace);
		oChange.setComponent(oAppVariant.getId());
		if (oAppVariant.getVersion()) {
			// Only needed for RTA tool, Smart business might not pass the version
			oChange.setValidAppVersions({
				creation: oAppVariant.getVersion(),
				from: oAppVariant.getVersion()
			});
		}
	}

	function _inlineDescriptorChanges(aAllInlineChanges, oAppVariant) {
		var aAllDescrChanges = [];
		aAllInlineChanges.forEach(function(oInlineChange) {
			//Replace the hosting key with the new reference
			oInlineChange.replaceHostingIdForTextKey(oAppVariant.getId(), oAppVariant.getReference(), oInlineChange.getContent(), oInlineChange.getTexts());
			aAllDescrChanges.push(oAppVariant.addDescriptorInlineChange(oInlineChange));
		});

		return Promise.all(aAllDescrChanges);
	}

	function _getDirtyDescrChanges(vSelector) {
		var oDescriptorFlexControllerPersistence = ChangesController.getDescriptorFlexControllerInstance(vSelector)._oChangePersistence;
		if (oDescriptorFlexControllerPersistence) {
			var aDescrChanges = oDescriptorFlexControllerPersistence.getDirtyChanges();
			aDescrChanges = aDescrChanges.slice();
			return aDescrChanges;
		}
		return [];
	}

	function _getDirtyUIChanges(vSelector) {
		var oFlexControllerPersistence = ChangesController.getFlexControllerInstance(vSelector)._oChangePersistence;
		if (oFlexControllerPersistence) {
			var aUIChanges = oFlexControllerPersistence.getDirtyChanges();
			aUIChanges = aUIChanges.slice();
			return aUIChanges;
		}
		return [];
	}

	function _arePersistenciesTheSame(vSelector) {
		var oFlexControllerPersistence = ChangesController.getFlexControllerInstance(vSelector)._oChangePersistence;
		var oDescriptorFlexControllerPersistence = ChangesController.getDescriptorFlexControllerInstance(vSelector)._oChangePersistence;
		// If the base application is already an app variant, the references and both persistences are same
		return oFlexControllerPersistence === oDescriptorFlexControllerPersistence;
	}

	function _reactOnChangesBasedOnPersistences(vSelector, bArePersistencesEqual, oAppVariant) {
		var aDescrChanges = [];
		if (bArePersistencesEqual) {
			_getDirtyDescrChanges(vSelector).forEach(function(oChange) {
				// UI and Descriptor changes need to be separated here so as to perform different operations on changes
				if (includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oChange.getDefinition().changeType)) {
					aDescrChanges.push(oChange);
				} else {
					_moveChangesToNewFlexReference(oChange, oAppVariant);
				}
			});
		} else {
			_getDirtyUIChanges(vSelector).forEach(function(oChange) {
				_moveChangesToNewFlexReference(oChange, oAppVariant);
			});

			aDescrChanges = _getDirtyDescrChanges(vSelector);
		}

		return aDescrChanges;
	}

	function _deleteDescrChangesFromPersistence(vSelector) {
		// In case of app variant, both persistences hold descriptor changes and have to be removed from one of the persistences
		_getDirtyDescrChanges(vSelector).forEach(function(oChange) {
			if (includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oChange.getChangeType())) {
				// In case there are UI changes, they will be sent to the backend in the last resolved promise and will be removed from the persistence
				ChangesController.getDescriptorFlexControllerInstance(vSelector)._oChangePersistence.deleteChange(oChange);
			}
		});
	}

	var SaveAs = {
		saveAs: function(mPropertyBag) {
			var oAppVariantClosure;
			var oAppVariantResultClosure;
			var bArePersistencesEqual = false;

			return DescriptorVariantFactory.createAppVariant(mPropertyBag)
				.then(function(oAppVariant) {
					oAppVariantClosure = merge({}, oAppVariant);
					return _validatePackageAndPrepareTransportInfo(mPropertyBag, oAppVariantClosure);
				})
				.then(function(oTransportInfo) {
					return _setTransportAndPackageInfoForAppVariant(oAppVariantClosure, oTransportInfo);
				})
				.then(function() {
					bArePersistencesEqual = _arePersistenciesTheSame(mPropertyBag.selector);
					var aDescrChanges = _reactOnChangesBasedOnPersistences(mPropertyBag.selector, bArePersistencesEqual, oAppVariantClosure);
					return _getInlineChangesFromDescrChanges(aDescrChanges);
				})
				.then(function(aAllInlineChanges) {
					return _inlineDescriptorChanges(aAllInlineChanges, oAppVariantClosure);
				})
				.then(function() {
					// Save the app variant to backend
					return oAppVariantClosure.submit()
						.catch(function(oError) {
							oError.messageKey = "MSG_SAVE_APP_VARIANT_FAILED";
							throw oError;
						});
				})
				.then(function(oResult) {
					oAppVariantResultClosure = merge({}, oResult);

					if (bArePersistencesEqual) {
						_deleteDescrChangesFromPersistence(mPropertyBag.selector);
					}

					var oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.selector);

					var aUIChanges = _getDirtyUIChanges(mPropertyBag.selector);
					if (aUIChanges.length) {
						// Save the dirty UI changes to backend => firing PersistenceWriteApi.save
						return oFlexController.saveAll(true)
							.catch(function(oError) {
								if (bArePersistencesEqual) {
									_deleteDescrChangesFromPersistence(mPropertyBag.selector);
								}

								// Delete the inconsistent app variant if the UI changes failed to save
								return this.deleteAppVariant({
									referenceAppId: mPropertyBag.id
								})
									.then(function() {
										oError.messageKey = "MSG_COPY_UNSAVED_CHANGES_FAILED";
										throw oError;
									});
							}.bind(this));
					}

					return Promise.resolve();
				}.bind(this))
				.then(function() {
					//Reference Application Usecase: Since the UI changes have been successfully saved, the descriptor inline changes will now be removed from persistence
					if (!bArePersistencesEqual) {
						_deleteDescrChangesFromPersistence(mPropertyBag.selector);
					}
					return oAppVariantResultClosure;
				})
				.catch(function(oError) {
					// If promise gets rejected before making a submit call, then app descriptor changes have to be removed from persistence
					if (
						_getDirtyDescrChanges(mPropertyBag.selector).length
					) {
						_deleteDescrChangesFromPersistence(mPropertyBag.selector);
					}

					Log.error("the app variant could not be created.", oError.message || oError);
					throw oError;
				});
		},
		updateAppVariant: function(mPropertyBag) {
			var oAppVariantClosure;
			var oAppVariantResultClosure;
			return DescriptorVariantFactory.loadAppVariant(mPropertyBag.referenceAppId, false)
				.catch(function(oError) {
					oError.messageKey = "MSG_LOAD_APP_VARIANT_FAILED";
					throw oError;
				})
				.then(function(oAppVariant) {
					if (!oAppVariant) {
						throw new Error("App variant with ID: " + mPropertyBag.referenceAppId + "does not exist");
					}

					oAppVariantClosure = merge({}, oAppVariant);
					mPropertyBag.package = oAppVariantClosure.getPackage();
					mPropertyBag.layer = oAppVariantClosure.getDefinition().layer;

					return _validatePackageAndPrepareTransportInfo(mPropertyBag, oAppVariantClosure);
				})
				.then(function(oTransportInfo) {
					return _setTransportAndPackageInfoForAppVariant(oAppVariantClosure, oTransportInfo);
				})
				.then(function() {
					var aDescrChanges = [];
					_getDirtyDescrChanges(mPropertyBag.selector).forEach(function(oChange) {
						if (includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oChange.getDefinition().changeType)) {
							aDescrChanges.push(oChange);
						}
					});

					return _getInlineChangesFromDescrChanges(aDescrChanges);
				})
				.then(function(aAllInlineChanges) {
					return _inlineDescriptorChanges(aAllInlineChanges, oAppVariantClosure);
				})
				.then(function() {
					// Updates the app variant saved in backend
					return oAppVariantClosure.submit()
						.catch(function(oError) {
							if (mPropertyBag.isForSmartBusiness) {
								_deleteDescrChangesFromPersistence(mPropertyBag.selector);
								throw oError;
							}
							oError.messageKey = "MSG_UPDATE_APP_VARIANT_FAILED";
							throw oError;
						});
				}).then(function(oResult) {
					oAppVariantResultClosure = merge({}, oResult);
					_deleteDescrChangesFromPersistence(mPropertyBag.selector);
					return oAppVariantResultClosure;
				})
				.catch(function(oError) {
					// If promise gets rejected before making a submit call, then also app descriptor changes have to be removed from persistence
					if (
						_getDirtyDescrChanges(mPropertyBag.selector).length
					) {
						_deleteDescrChangesFromPersistence(mPropertyBag.selector);
					}

					Log.error("the app variant could not be updated.", oError.message || oError);
					throw oError;
				});
		},
		deleteAppVariant: function(mPropertyBag) {
			var oAppVariantClosure;

			return DescriptorVariantFactory.loadAppVariant(mPropertyBag.referenceAppId, true)
				.catch(function(oError) {
					oError.messageKey = "MSG_LOAD_APP_VARIANT_FAILED";
					throw oError;
				})
				.then(function(oAppVariant) {
					if (!oAppVariant) {
						throw new Error("App variant with ID: " + mPropertyBag.referenceAppId + "does not exist");
					}

					oAppVariantClosure = merge({}, oAppVariant);
					mPropertyBag.package = oAppVariantClosure.getPackage();
					mPropertyBag.layer = oAppVariantClosure.getDefinition().layer;

					return _validatePackageAndPrepareTransportInfo(mPropertyBag, oAppVariantClosure);
				})
				.then(function(oTransportInfo) {
					return _setTransportAndPackageInfoForAppVariant(oAppVariantClosure, oTransportInfo);
				})
				.then(function () {
					return oAppVariantClosure.submit()
						.catch(function(oError) {
							if (oError === "cancel") {
								return Promise.reject("cancel");
							}
							oError.messageKey = "MSG_DELETE_APP_VARIANT_FAILED";
							throw oError;
						});
				})
				.catch(function(oError) {
					if (oError === "cancel") {
						return Promise.reject("cancel");
					}
					Log.error("the app variant could not be deleted.", oError.message || oError);
					throw oError;
				});
		}
	};
	return SaveAs;
}, true);