/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/appVariant/AppVariantFactory",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], function(
	_omit,
	merge,
	Log,
	DescriptorChangeTypes,
	FlexObjectState,
	ManifestUtils,
	Settings,
	AppVariantFactory,
	AppVariantInlineChangeFactory,
	FlexControllerFactory,
	Layer,
	Utils
) {
	"use strict";

	function _validatePackageAndPrepareTransportInfo(mPropertyBag) {
		return Settings.getInstance().then(function(oSettings) {
			// (Package Validation) Writing, updating or deleting content in VENDOR or CUSTOMER_BASE layer must require a package (either a valid package or local object)
			if (
				!mPropertyBag.package
				&& (
					mPropertyBag.layer === Layer.VENDOR
					|| (
						mPropertyBag.layer === Layer.CUSTOMER_BASE
						&& !oSettings.isAtoEnabled()
					)
				)
			) {
				return Promise.reject("Package must be provided or is valid");
			}

			// (Transport Validation) Writing, updating or deleting content in onPremise systems in all layers must require a transport unless the package is not local object
			if (
				mPropertyBag.isForSmartBusiness
				&& (
					mPropertyBag.package !== "$TMP"
					&& mPropertyBag.package !== ""
				)
				&& !mPropertyBag.transport
				&& !oSettings.isAtoEnabled()
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
			// Change contains only descriptor change information so the descriptor inline change needs to be created again

			var oInlineChange = {
				changeType: oChange.getChangeType(),
				content: oChange.getContent()
			};

			if (oChange.getTexts()) {
				oInlineChange.texts = oChange.getTexts();
			}

			aInlineChangesPromises.push(AppVariantInlineChangeFactory.createNew(oInlineChange));
		});
		return Promise.all(aInlineChangesPromises);
	}

	function _moveChangesToNewFlexReference(oChange, oAppVariant) {
		var oPropertyBag = {
			reference: oAppVariant.getId()
		};
		var sChangesNamespace = Utils.createNamespace(oPropertyBag, "changes");
		var oFlexObjectMetadata = oChange.getFlexObjectMetadata();
		oFlexObjectMetadata.namespace = sChangesNamespace;
		oFlexObjectMetadata.reference = oAppVariant.getId();
		oChange.setFlexObjectMetadata(oFlexObjectMetadata);
	}

	function _inlineDescriptorChanges(aAllInlineChanges, oAppVariant) {
		var aAllDescrChanges = [];
		aAllInlineChanges.forEach(function(oInlineChange) {
			// Replace the hosting key with the new reference
			oInlineChange.replaceHostingIdForTextKey(oAppVariant.getId(), oAppVariant.getReference(), oInlineChange.getContent(), oInlineChange.getTexts());
			aAllDescrChanges.push(oAppVariant.addDescriptorInlineChange(oInlineChange));
		});

		return Promise.all(aAllDescrChanges);
	}

	function _getDirtyDescrChanges(vSelector) {
		const sReference = ManifestUtils.getFlexReferenceForSelector(vSelector);
		return FlexObjectState.getDirtyFlexObjects(sReference).filter(function(oChange) {
			return DescriptorChangeTypes.getChangeTypes().includes(oChange.getChangeType());
		});
	}

	function _getDirtyChanges(vSelector) {
		const sReference = ManifestUtils.getFlexReferenceForSelector(vSelector);
		return FlexObjectState.getDirtyFlexObjects(sReference).slice();
	}

	function _deleteDescrChangesFromPersistence(vSelector) {
		var aChangesToBeDeleted = [];
		// In case of app variant, both persistences hold descriptor changes and have to be removed from one of the persistences
		_getDirtyDescrChanges(vSelector).forEach(function(oChange) {
			if (DescriptorChangeTypes.getChangeTypes().includes(oChange.getChangeType())) {
				// If there are UI changes, they are sent to the backend in the last resolved promise and removed from the persistence
				aChangesToBeDeleted.push(oChange);
			}
		});
		FlexControllerFactory.createForSelector(vSelector)._oChangePersistence.deleteChanges(aChangesToBeDeleted);
	}

	function _addPackageAndTransport(oAppVariant, mPropertyBag) {
		if (!oAppVariant) {
			throw new Error(`App variant with ID: ${mPropertyBag.id}does not exist`);
		}

		mPropertyBag.package = oAppVariant.getPackage();
		mPropertyBag.layer = oAppVariant.getDefinition().layer;

		return _validatePackageAndPrepareTransportInfo(mPropertyBag)
		.then(function(oTransportInfo) {
			return _setTransportAndPackageInfoForAppVariant(oAppVariant, oTransportInfo);
		}).then(function() {
			return oAppVariant;
		});
	}

	var SaveAs = {
		saveAs(mPropertyBag) {
			var oAppVariantClosure;
			var oAppVariantResultClosure;

			return AppVariantFactory.prepareCreate(mPropertyBag)
			.then(function(oAppVariant) {
				oAppVariantClosure = merge({}, oAppVariant);
				return _validatePackageAndPrepareTransportInfo(mPropertyBag);
			})
			.then(function(oTransportInfo) {
				return _setTransportAndPackageInfoForAppVariant(oAppVariantClosure, oTransportInfo);
			})
			.then(function() {
				var aDescrChanges = [];
				_getDirtyChanges(mPropertyBag.selector).forEach(function(oChange) {
					// UI and Descriptor changes need to be separated here so as to perform different operations on changes
					if (DescriptorChangeTypes.getChangeTypes().includes(oChange.getChangeType())) {
						aDescrChanges.push(oChange);
					} else {
						_moveChangesToNewFlexReference(oChange, oAppVariantClosure);
					}
				});
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
				_deleteDescrChangesFromPersistence(mPropertyBag.selector);

				var oFlexController = FlexControllerFactory.createForSelector(mPropertyBag.selector);

				var aUIChanges = _getDirtyChanges(mPropertyBag.selector); // after removing descr changes, all remaining dirty changes are UI changes
				if (aUIChanges.length) {
					// Save the dirty UI changes to backend => firing PersistenceWriteApi.save
					return oFlexController.saveAll(Utils.getAppComponentForSelector(mPropertyBag.selector), true)
					.then(function() {
						oFlexController._oChangePersistence.removeDirtyChanges();
					})
					.catch(function(oError) {
						// Delete the inconsistent app variant if the UI changes failed to save
						return this.deleteAppVariant({
							id: mPropertyBag.id
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
		updateAppVariant(mPropertyBag) {
			var oAppVariantClosure;
			var oAppVariantResultClosure;

			return AppVariantFactory.prepareUpdate(_omit(mPropertyBag, "selector"))
			.catch(function(oError) {
				oError.messageKey = "MSG_LOAD_APP_VARIANT_FAILED";
				throw oError;
			})
			.then(function(oAppVariant) {
				if (!oAppVariant) {
					throw new Error(`App variant with ID: ${mPropertyBag.id}does not exist`);
				}

				oAppVariantClosure = merge({}, oAppVariant);
				mPropertyBag.package = oAppVariantClosure.getPackage();
				mPropertyBag.layer = oAppVariantClosure.getDefinition().layer;

				return _validatePackageAndPrepareTransportInfo(mPropertyBag);
			})
			.then(function(oTransportInfo) {
				return _setTransportAndPackageInfoForAppVariant(oAppVariantClosure, oTransportInfo);
			})
			.then(function() {
				var aDescrChanges = [];
				_getDirtyDescrChanges(mPropertyBag.selector).forEach(function(oChange) {
					if (DescriptorChangeTypes.getChangeTypes().includes(oChange.getChangeType())) {
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
		deleteAppVariant(mPropertyBag) {
			return AppVariantFactory.prepareDelete(_omit(mPropertyBag, "selector"))
			.catch(function(oError) {
				oError.messageKey = "MSG_LOAD_APP_VARIANT_FAILED";
				throw oError;
			})
			.then(function(oAppVariant) {
				return ((mPropertyBag.isForSmartBusiness)
					? Promise.resolve(oAppVariant)
					: _addPackageAndTransport(oAppVariant, mPropertyBag));
			})
			.then(function(oAppVariant) {
				return oAppVariant.submit()
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
});