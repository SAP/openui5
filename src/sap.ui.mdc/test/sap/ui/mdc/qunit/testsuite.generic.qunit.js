sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	const oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.mdc",
		objectCapabilities: {
			"sap.ui.mdc.Control": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.Element": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.Table": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.MultiValueField": {
				properties: {
					dataType: "sap.ui.model.type.String",
					dataTypeFormatOptions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					dataTypeConstraints: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				},
				knownIssues: {
					memoryLeaks: true // as tested in MemoryLeak.qunit.js
				}
			},
			"sap.ui.mdc.FilterBar": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				}
			},
			"sap.ui.mdc.filterbar.p13n.AdaptationFilterBar": {
				properties: {
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit,
					adaptationControl: GenericTestCollection.ExcludeReason.CantSetDefaultValue
				}
			},
			"sap.ui.mdc.field.FieldBase": {
				properties: {
					dataType: "sap.ui.model.type.String",
					dataTypeFormatOptions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					dataTypeConstraints: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				},
				knownIssues: {
					memoryLeaks: true // as tested in MemoryLeak.qunit.js
				}
			},
			"sap.ui.mdc.Field": {
				properties: {
					dataType: "sap.ui.model.type.String",
					dataTypeFormatOptions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					dataTypeConstraints: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				},
				knownIssues: {
					memoryLeaks: true // as tested in MemoryLeak.qunit.js
				}
			},
			"sap.ui.mdc.FilterField": {
				properties: {
					dataType: "sap.ui.model.type.String",
					dataTypeFormatOptions: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					dataTypeConstraints: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					operators: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					delegate: GenericTestCollection.ExcludeReason.NotChangeableAfterInit
				},
				knownIssues: {
					memoryLeaks: true // as tested in MemoryLeak.qunit.js
				}
			},
			"sap.ui.mdc.valuehelp.base.DefineConditionPanel": {
				knownIssues: {
					memoryLeaks: true // as tested in MemoryLeak.qunit.js
				}
			}
		}
	});

	return oConfig;
});