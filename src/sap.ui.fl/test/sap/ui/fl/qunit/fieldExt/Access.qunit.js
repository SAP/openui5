/*globals QUnit, sinon*/
jQuery.sap.require("sap.ui.fl.fieldExt.Access");

(function(Access) {
	"use strict";

	var oMetadata =
		JSON
			.parse('{"version":"1.0","dataServices":{"dataServiceVersion":"2.0","schema":[{"namespace":"com.sap.GL.ZAF","entityType":[{"name":"GL_ACCOUNT","key":{"propertyRef":[{"name":"CompanyCode"},{"name":"GLAccount"}]},"property":[{"name":"CompanyCode","type":"Edm.String","nullable":"false","maxLength":"4","extensions":[{"name":"filter-restriction","value":"multi-value","namespace":"SAPData"},{"name":"required-in-filter","value":"true","namespace":"SAPData"},{"name":"label","value":"Company","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"GLAccount","type":"Edm.String","nullable":"false","maxLength":"10","extensions":[{"name":"label","value":"Account","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"ChartOfAccount","type":"Edm.String","nullable":"false","maxLength":"4","extensions":[{"name":"label","value":"Chart Of Account","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"Description","type":"Edm.String","nullable":"false","maxLength":"50","extensions":[{"name":"label","value":"Description","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]}],"navigationProperty":[{"name":"GL_ACCOUNT_BALANCE","relationship":"com.sap.GL.ZAF.ACCOUNT_ACCOUNT_BALANCE","fromRole":"FromRole_ACCOUNT_ACCOUNT_BALANCE","toRole":"ToRole_ACCOUNT_ACCOUNT_BALANCE"}],"extensions":[{"name":"label","value":"GL Account","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"LINE_ITEM","key":{"propertyRef":[{"name":"Ledger"},{"name":"CompanyCode"},{"name":"LedgerFiscalYear"},{"name":"LedgerAccountingDocument"},{"name":"LedgerGLLineItem"}]},"property":[{"name":"GLAccount","type":"Edm.String","nullable":"false","maxLength":"10","extensions":[{"name":"label","value":"Account","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"}]},{"name":"Ledger","type":"Edm.String","nullable":"false","maxLength":"2","extensions":[{"name":"label","value":"Ledger","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"}]},{"name":"CompanyCode","type":"Edm.String","nullable":"false","maxLength":"4","extensions":[{"name":"label","value":"Company","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"}]},{"name":"LedgerFiscalYear","type":"Edm.String","nullable":"false","maxLength":"4","extensions":[{"name":"label","value":"Year","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"}]},{"name":"LedgerFiscalPeriod","type":"Edm.String","nullable":"false","maxLength":"3","extensions":[{"name":"label","value":"Period","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"}]},{"name":"LedgerAccountingDocument","type":"Edm.String","nullable":"false","maxLength":"10","extensions":[{"name":"label","value":"Document","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"}]},{"name":"LedgerGLLineItem","type":"Edm.String","nullable":"false","maxLength":"6","extensions":[{"name":"label","value":"Item","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"}]},{"name":"PostingDate","type":"Edm.DateTime","nullable":"false","precision":"0","extensions":[{"name":"display-format","value":"Date","namespace":"SAPData"},{"name":"filter-restriction","value":"interval","namespace":"SAPData"},{"name":"label","value":"Posting Date","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"}]},{"name":"Amount","type":"Edm.Decimal","precision":"28","scale":"3","extensions":[{"name":"unit","value":"CurrencyCode","namespace":"SAPData"},{"name":"label","value":"Balance","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"}]},{"name":"CurrencyCode","type":"Edm.String","nullable":"false","maxLength":"5","extensions":[{"name":"label","value":"Currency","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"},{"name":"semantics","value":"currency-code","namespace":"SAPData"}]}],"extensions":[{"name":"label","value":"Line Item","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"ACCOUNTING_DOCUMENT","key":{"propertyRef":[{"name":"CompanyCode"},{"name":"DocumentID"},{"name":"Year"},{"name":"ItemID"}]},"property":[{"name":"CompanyCode","type":"Edm.String","nullable":"false","maxLength":"4","extensions":[{"name":"label","value":"Company Code","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"DocumentID","type":"Edm.String","nullable":"false","maxLength":"10","extensions":[{"name":"label","value":"Document Number","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"Year","type":"Edm.String","nullable":"false","maxLength":"4","extensions":[{"name":"label","value":"Fiscal Year","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"ItemID","type":"Edm.String","nullable":"false","maxLength":"3","extensions":[{"name":"label","value":"Line item","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"RegionCode","type":"Edm.String","nullable":"false","maxLength":"3","extensions":[{"name":"label","value":"Region","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"Amount","type":"Edm.Decimal","nullable":"false","precision":"28","scale":"3","extensions":[{"name":"unit","value":"CurrencyCode","namespace":"SAPData"},{"name":"label","value":"Amount","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"}]},{"name":"CurrencyCode","type":"Edm.String","nullable":"false","maxLength":"5","extensions":[{"name":"label","value":"Currency","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"},{"name":"semantics","value":"currency-code","namespace":"SAPData"}]}],"extensions":[{"name":"label","value":"Accounting Document","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"GEO_COORDINATES","key":{"propertyRef":[{"name":"CountryCode"},{"name":"RegionCode"}]},"property":[{"name":"CountryCode","type":"Edm.String","nullable":"false","maxLength":"3","extensions":[{"name":"filter-restriction","value":"single-value","namespace":"SAPData"},{"name":"label","value":"Country","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"RegionCode","type":"Edm.String","nullable":"false","maxLength":"3","extensions":[{"name":"label","value":"Region","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"Longitude","type":"Edm.Double","nullable":"false","extensions":[{"name":"label","value":"Longitude","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"}]},{"name":"Latitude","type":"Edm.Double","nullable":"false","extensions":[{"name":"label","value":"Latitude","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"}]}],"extensions":[{"name":"label","value":"Geo Coordinates","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"COUNTRY","key":{"propertyRef":[{"name":"CountryCode"}]},"property":[{"name":"CountryCode","type":"Edm.String","nullable":"false","maxLength":"3","extensions":[{"name":"text","value":"Description","namespace":"SAPData"},{"name":"label","value":"Country","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"Description","type":"Edm.String","nullable":"false","maxLength":"50","extensions":[{"name":"label","value":"Long name","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]}],"extensions":[{"name":"label","value":"Country","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"REGION","key":{"propertyRef":[{"name":"CountryCode"},{"name":"RegionCode"}]},"property":[{"name":"CountryCode","type":"Edm.String","nullable":"false","maxLength":"3","extensions":[{"name":"label","value":"Country","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"RegionCode","type":"Edm.String","nullable":"false","maxLength":"3","extensions":[{"name":"text","value":"Description","namespace":"SAPData"},{"name":"label","value":"Region","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"Description","type":"Edm.String","nullable":"false","maxLength":"20","extensions":[{"name":"label","value":"Description","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]}],"extensions":[{"name":"label","value":"Region","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"GL_ACCOUNT_BALANCE","key":{"propertyRef":[{"name":"Ledger"},{"name":"LedgerFiscalYear"},{"name":"CompanyCode"},{"name":"GLAccount"}]},"property":[{"name":"AccmltdBalAmtInCoCodeCrcy","type":"Edm.Decimal","precision":"28","scale":"3","extensions":[{"name":"unit","value":"CurrencyCode","namespace":"SAPData"},{"name":"label","value":"Balance","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"}]},{"name":"CurrencyCode","type":"Edm.String","nullable":"false","maxLength":"5","extensions":[{"name":"label","value":"Currency","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"},{"name":"semantics","value":"currency-code","namespace":"SAPData"}]},{"name":"Ledger","type":"Edm.String","nullable":"false","maxLength":"2","extensions":[{"name":"label","value":"Ledger","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"LedgerFiscalYear","type":"Edm.String","nullable":"false","maxLength":"4","extensions":[{"name":"label","value":"Fiscal Year","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"CompanyCode","type":"Edm.String","nullable":"false","maxLength":"4","extensions":[{"name":"label","value":"Company","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"GLAccount","type":"Edm.String","nullable":"false","maxLength":"10","extensions":[{"name":"label","value":"Account","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"}]}],"navigationProperty":[{"name":"GL_ACCOUNT","relationship":"com.sap.GL.ZAF.ACCOUNT_ACCOUNT_BALANCE","fromRole":"ToRole_ACCOUNT_ACCOUNT_BALANCE","toRole":"FromRole_ACCOUNT_ACCOUNT_BALANCE"}],"extensions":[{"name":"label","value":"GL Account Balance","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"COMPANY","key":{"propertyRef":[{"name":"CompanyCode"}]},"property":[{"name":"CompanyCode","type":"Edm.String","nullable":"false","maxLength":"4","extensions":[{"name":"text","value":"CompanyName","namespace":"SAPData"},{"name":"label","value":"Company","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"}]},{"name":"CompanyName","type":"Edm.String","nullable":"false","maxLength":"25","extensions":[{"name":"label","value":"Name","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"}]},{"name":"City","type":"Edm.String","nullable":"false","maxLength":"25","extensions":[{"name":"label","value":"City","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"},{"name":"filterable","value":"false","namespace":"SAPData"}]},{"name":"CurrencyCode","type":"Edm.String","nullable":"false","maxLength":"5","extensions":[{"name":"label","value":"Currency","namespace":"SAPData"},{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"sortable","value":"false","namespace":"SAPData"},{"name":"semantics","value":"currency-code","namespace":"SAPData"}]}],"extensions":[{"name":"label","value":"Company","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]}],"association":[{"name":"ACCOUNT_ACCOUNT_BALANCE","end":[{"type":"com.sap.GL.ZAF.GL_ACCOUNT","multiplicity":"1","role":"FromRole_ACCOUNT_ACCOUNT_BALANCE"},{"type":"com.sap.GL.ZAF.GL_ACCOUNT_BALANCE","multiplicity":"*","role":"ToRole_ACCOUNT_ACCOUNT_BALANCE"}],"referentialConstraint":{"principal":{"role":"FromRole_ACCOUNT_ACCOUNT_BALANCE","propertyRef":[{"name":"CompanyCode"},{"name":"GLAccount"}]},"dependent":{"role":"ToRole_ACCOUNT_ACCOUNT_BALANCE","propertyRef":[{"name":"CompanyCode"},{"name":"GLAccount"}]}},"extensions":[{"name":"content-version","value":"1","namespace":"SAPData"}]}],"entityContainer":[{"name":"com.sap.GL.ZAF_Entities","isDefaultEntityContainer":"true","entitySet":[{"name":"LINE_ITEMS","entityType":"com.sap.GL.ZAF.LINE_ITEM","extensions":[{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"deletable","value":"false","namespace":"SAPData"},{"name":"searchable","value":"true","namespace":"SAPData"},{"name":"pageable","value":"false","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"ACCOUNTING_DOCUMENTSet","entityType":"com.sap.GL.ZAF.ACCOUNTING_DOCUMENT","extensions":[{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"deletable","value":"false","namespace":"SAPData"},{"name":"searchable","value":"true","namespace":"SAPData"},{"name":"pageable","value":"false","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"GEO_COORDINATESSet","entityType":"com.sap.GL.ZAF.GEO_COORDINATES","extensions":[{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"deletable","value":"false","namespace":"SAPData"},{"name":"searchable","value":"true","namespace":"SAPData"},{"name":"pageable","value":"false","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"COUNTRYSet","entityType":"com.sap.GL.ZAF.COUNTRY","extensions":[{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"deletable","value":"false","namespace":"SAPData"},{"name":"searchable","value":"true","namespace":"SAPData"},{"name":"pageable","value":"false","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"REGIONSet","entityType":"com.sap.GL.ZAF.REGION","extensions":[{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"deletable","value":"false","namespace":"SAPData"},{"name":"searchable","value":"true","namespace":"SAPData"},{"name":"pageable","value":"false","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"GL_ACCOUNT_BALANCE_SET","entityType":"com.sap.GL.ZAF.GL_ACCOUNT_BALANCE","extensions":[{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"deletable","value":"false","namespace":"SAPData"},{"name":"searchable","value":"true","namespace":"SAPData"},{"name":"pageable","value":"false","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"COMPANIES","entityType":"com.sap.GL.ZAF.COMPANY","extensions":[{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"deletable","value":"false","namespace":"SAPData"},{"name":"searchable","value":"true","namespace":"SAPData"},{"name":"pageable","value":"false","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]},{"name":"GL_ACCOUNT_SET","entityType":"com.sap.GL.ZAF.GL_ACCOUNT","extensions":[{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"deletable","value":"false","namespace":"SAPData"},{"name":"searchable","value":"true","namespace":"SAPData"},{"name":"pageable","value":"false","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]}],"associationSet":[{"name":"ACCOUNT_ACCOUNT_BALANCESet","association":"com.sap.GL.ZAF.ACCOUNT_ACCOUNT_BALANCE","end":[{"entitySet":"GL_ACCOUNT_SET","role":"FromRole_ACCOUNT_ACCOUNT_BALANCE"},{"entitySet":"GL_ACCOUNT_BALANCE_SET","role":"ToRole_ACCOUNT_ACCOUNT_BALANCE"}],"extensions":[{"name":"creatable","value":"false","namespace":"SAPData"},{"name":"updatable","value":"false","namespace":"SAPData"},{"name":"deletable","value":"false","namespace":"SAPData"},{"name":"content-version","value":"1","namespace":"SAPData"}]}],"functionImport":[{"name":"SendForClarification","returnType":"com.sap.GL.ZAF.GL_ACCOUNT_BALANCE","entitySet":"GL_ACCOUNT_BALANCE_SET","httpMethod":"GET","parameter":[{"name":"Receiver","type":"Edm.String","mode":"In"}]}]}],"annotations":[{"target":"com.sap.GL.ZAF.GL_ACCOUNT_BALANCE/CompanyCode","annotation":[{"term":"com.sap.vocabularies.Common.v1.ValueList","record":{"propertyValue":[{"property":"CollectionPath","string":"COMPANIES"},{"property":"SearchSupported","bool":"true"},{"property":"Parameters","collection":{"record":[{"type":"com.sap.vocabularies.Common.v1.ValueListParameterInOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CompanyCode"},{"property":"ValueListProperty","string":"CompanyCode"}]},{"type":"com.sap.vocabularies.Common.v1.ValueListParameterIn","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CurrencyCode"},{"property":"ValueListProperty","string":"CurrencyCode"}]},{"type":"com.sap.vocabularies.Common.v1.ValueListParameterOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CompanyName"},{"property":"ValueListProperty","string":"CompanyName"}]},{"type":"com.sap.vocabularies.Common.v1.ValueListParameterOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CurrencyCode"},{"property":"ValueListProperty","string":"CurrencyCode"}]}]}}]}}]},{"target":"com.sap.GL.ZAF.GL_ACCOUNT/CompanyCode","annotation":[{"term":"com.sap.vocabularies.Common.v1.ValueList","record":{"propertyValue":[{"property":"CollectionPath","string":"COMPANIES"},{"property":"SearchSupported","bool":"true"},{"property":"Parameters","collection":{"record":[{"type":"com.sap.vocabularies.Common.v1.ValueListParameterInOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CompanyCode"},{"property":"ValueListProperty","string":"CompanyCode"}]},{"type":"com.sap.vocabularies.Common.v1.ValueListParameterIn","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CurrencyCode"},{"property":"ValueListProperty","string":"CurrencyCode"}]},{"type":"com.sap.vocabularies.Common.v1.ValueListParameterOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CompanyName"},{"property":"ValueListProperty","string":"CompanyName"}]},{"type":"com.sap.vocabularies.Common.v1.ValueListParameterOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CurrencyCode"},{"property":"ValueListProperty","string":"CurrencyCode"}]}]}}]}}]},{"target":"com.sap.GL.ZAF.GL_ACCOUNT/CurrencyCode","annotation":[{"term":"com.sap.vocabularies.Common.v1.ValueList","record":{"propertyValue":[{"property":"CollectionPath","string":"CURRENCYSet"},{"property":"CollectionRoot","string":"foo/ZAF_CURRENCY_SRV"},{"property":"Parameters","collection":{"record":[{"type":"com.sap.vocabularies.Common.v1.ValueListParameterInOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CurrencyCode"},{"property":"ValueListProperty","string":"CurrencyCode"}]}]}}]}}]},{"target":"com.sap.GL.ZAF.COMPANY/CurrencyCode","annotation":[{"term":"com.sap.vocabularies.Common.v1.ValueList","record":{"propertyValue":[{"property":"CollectionPath","string":"CURRENCYSet"},{"property":"CollectionRoot","string":"foo/ZAF_CURRENCY_SRV"},{"property":"Parameters","collection":{"record":[{"type":"com.sap.vocabularies.Common.v1.ValueListParameterInOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CurrencyCode"},{"property":"ValueListProperty","string":"CurrencyCode"}]}]}}]}}]},{"target":"com.sap.GL.ZAF.GEO_COORDINATES/CountryCode","annotation":[{"term":"com.sap.vocabularies.Common.v1.ValueList","record":{"propertyValue":[{"property":"CollectionPath","string":"COUNTRYSet"},{"property":"Parameters","collection":{"record":[{"type":"com.sap.vocabularies.Common.v1.ValueListParameterInOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CountryCode"},{"property":"ValueListProperty","string":"CountryCode"}]}]}}]}}]},{"target":"com.sap.GL.ZAF.GEO_COORDINATES/RegionCode","annotation":[{"term":"com.sap.vocabularies.Common.v1.ValueList","record":{"propertyValue":[{"property":"CollectionPath","string":"REGIONSet"},{"property":"Parameters","collection":{"record":[{"type":"com.sap.vocabularies.Common.v1.ValueListParameterInOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"RegionCode"},{"property":"ValueListProperty","string":"RegionCode"}]},{"type":"com.sap.vocabularies.Common.v1.ValueListParameterInOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CountryCode"},{"property":"ValueListProperty","string":"CountryCode"}]}]}}]}}]},{"target":"com.sap.GL.ZAF.REGION/CountryCode","annotation":[{"term":"com.sap.vocabularies.Common.v1.ValueList","record":{"propertyValue":[{"property":"CollectionPath","string":"COUNTRYSet"},{"property":"Parameters","collection":{"record":[{"type":"com.sap.vocabularies.Common.v1.ValueListParameterInOut","propertyValue":[{"property":"LocalDataProperty","propertyPath":"CountryCode"},{"property":"ValueListProperty","string":"CountryCode"}]}]}}]}}]}],"extensions":[{"name":"lang","value":"en","namespace":"http://www.w3.org/XML/1998/namespace"},{"name":"link","value":null,"attributes":[{"name":"rel","value":"self","namespace":null},{"name":"href","value":"foo/ZAF_GL_BALANCE_SRV/$metadata","namespace":null}],"children":[],"namespace":"http://www.w3.org/2005/Atom"},{"name":"link","value":null,"attributes":[{"name":"rel","value":"latest-version","namespace":null},{"name":"href","value":"foo/ZAF_GL_BALANCE_SRV/$metadata","namespace":null}],"children":[],"namespace":"http://www.w3.org/2005/Atom"}]}]},"extensions":[{"name":"Reference","value":null,"attributes":[{"name":"Uri","value":"http://someService/s�lName=\'%2FIWBEP%2FVOC_MEASURES\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value","namespace":null}],"children":[{"name":"Include","value":null,"attributes":[{"name":"Namespace","value":"Org.OData.Measures.V1","namespace":null}],"children":[],"namespace":"http://docs.oasis-open.org/odata/ns/edmx"}],"namespace":"http://docs.oasis-open.org/odata/ns/edmx"},{"name":"Reference","value":null,"attributes":[{"name":"Uri","value":"http://someService/s�nicalName=\'%2FIWBEP%2FVOC_CORE\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value","namespace":null}],"children":[{"name":"Include","value":null,"attributes":[{"name":"Namespace","value":"Org.OData.Core.V1","namespace":null}],"children":[],"namespace":"http://docs.oasis-open.org/odata/ns/edmx"}],"namespace":"http://docs.oasis-open.org/odata/ns/edmx"},{"name":"Reference","value":null,"attributes":[{"name":"Uri","value":"http://someService/s�ies(TechnicalName=\'ZRHA_COMMON\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value","namespace":null}],"children":[{"name":"Include","value":null,"attributes":[{"name":"Namespace","value":"com.sap.vocabularies.Common.v1_1","namespace":null}],"children":[],"namespace":"http://docs.oasis-open.org/odata/ns/edmx"}],"namespace":"http://docs.oasis-open.org/odata/ns/edmx"}]}');

	var oBusinessExpectedContextRetrievalResult = {
		BusinessContexts: [
			"CFD_TSM_BUPA_ADR", "CFD_TSM_BUPA"
		],
		ServiceName: "someService",
		ServiceVersion: "0001"
	};

	var oBusinessExpectedContextRetrievalResultWithoutBusinesscontexts = {
		BusinessContexts: [],
		ServiceName: "someService",
		ServiceVersion: "0001"
	};

	var oHttpErrorResponse = {
		"error": {
			"code": "005056A509B11EE1B9A8FEC11C21578E",
			"message": {
				"lang": "en",
				"value": "Invalid Function Import Parameter"
			},
			"innererror": {
				"transactionid": "54E429A74593458DE10000000A420908",
				"timestamp": "20150219074515.1395610",
				"Error_Resolution": {
					"SAP_Transaction": "Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details",
					"SAP_Note": "See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)"
				}
			}
		}
	};

	var oExpectedErrorResult = {
		"severity": "error",
		"text": "{\"error\":{\"code\":\"005056A509B11EE1B9A8FEC11C21578E\",\"message\":{\"lang\":\"en\",\"value\":\"Invalid Function Import Parameter\"},\"innererror\":{\"transactionid\":\"54E429A74593458DE10000000A420908\",\"timestamp\":\"20150219074515.1395610\",\"Error_Resolution\":{\"SAP_Transaction\":\"Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details\",\"SAP_Note\":\"See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)\"}}}}"
	};

	var oServiceUri = {
		sServiceName: "SOME_SRVC_NM",
		sNamespace: "/namespace/",
		sPrefix: "/someService",
		sODataPrefix: "/sap/opu/odata",
		sSapPrefix: "/SAP",
		sVersion: ";v=0007"
	};

	var mockAccessJs = function() {
		var oUnchangedAccess = { };
		for (var propertyName in Access) {
			oUnchangedAccess[propertyName] = Access[propertyName];
		}

		Access._getSystemInfo = function() {
			return {
				getName: function() {
					return "ABC";
				},
				getClient: function() {
					return "123";
				}
			};
		};

		Access._isSystemInfoAvailable = function() {
			return true;
		};

		return oUnchangedAccess;
	};

	var unMockAccessJs = function(oUnchangedAccess) {
		for(var propertyName in oUnchangedAccess) {
			Access[propertyName] = oUnchangedAccess[propertyName];
		}
	};

	var checkServiceName = function(sUri, sExpectedServiceName) {
		var oService = Access._parseServiceUri(sUri);
		assert.equal(oService.serviceName, sExpectedServiceName);
	};

	var checkServiceVersion = function(sUri, sExpectedServiceVersion) {
		var oService = Access._parseServiceUri(sUri);
		assert.equal(oService.serviceVersion, sExpectedServiceVersion);
	};

	QUnit.module("sap.ui.fl.fieldExt.Access", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test("_parseServiceName can extract a service name from an uri without a namespace", function (assert) {
		var sServiceName = oServiceUri.sServiceName;
		var sDeterminedServiceName = Access._parseServiceUri(sServiceName).serviceName;
		assert.equal(sDeterminedServiceName, sServiceName);
	});

	QUnit.test("_parseServiceName can extract a service name from an 'sap/opu/odata/' uri", function (assert) {
		var sServiceNameWithNamespace = oServiceUri.sNamespace + oServiceUri.sServiceName;
		var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + sServiceNameWithNamespace;
		var sDeterminedServiceName = Access._parseServiceUri(sServiceUri).serviceName;
		assert.equal(sDeterminedServiceName, sServiceNameWithNamespace);
	});

	QUnit.test("_parseServiceName can extract a simple service name from an 'sap/opu/odata/' uri with version information", function (assert) {
		var sServiceNameWithNamespace = oServiceUri.sNamespace + oServiceUri.sServiceName;
		var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + sServiceNameWithNamespace + oServiceUri.sVersion;
		var sDeterminedServiceName = Access._parseServiceUri(sServiceUri).serviceName;
		assert.equal(sDeterminedServiceName, sServiceNameWithNamespace);
	});

	QUnit.test("_parseServiceName can extract a service name from an 'sap/opu/odata/SAP/' uri", function (assert) {
		var sServiceName = oServiceUri.sServiceName;
		var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + oServiceUri.sSapPrefix + "/" + sServiceName;
		var sDeterminedServiceName = Access._parseServiceUri(sServiceUri).serviceName;
		assert.equal(sDeterminedServiceName, sServiceName);
	});

	QUnit.test("_parseServiceName can extract a simple service name from an 'sap/opu/odata/SAP/' uri with version information", function (assert) {
		var sServiceName = oServiceUri.sServiceName;
		var sServiceUri = oServiceUri.sPrefix + oServiceUri.sODataPrefix + oServiceUri.sSapPrefix + "/" + sServiceName + oServiceUri.sVersion;
		var sDeterminedServiceName = Access._parseServiceUri(sServiceUri).serviceName;
		assert.equal(sDeterminedServiceName, sServiceName);
	});

	QUnit.test('getBusinessContextsByEntityType', function(assert) {
		var sServiceUrl = "/someService";
		var sEntityName = "BusinessPartner";

		var oServer;
		oServer = sinon.fakeServer.create();

		oServer.autoRespond = true;
		try {
			var oPromise = Access.getBusinessContexts(sServiceUrl, sEntityName);

			oPromise.done(function(oBusinessContexts) {
				oServer.restore();
				assert.deepEqual(oBusinessContexts, oBusinessExpectedContextRetrievalResult);
			});

			oPromise.fail(function(error) {
				oServer.restore();
				assert.ok(false, "Should not run into fail branch. Error" + error);
			});

			oServer.requests[0].respond(200, {
				"Content-Type": "application/json",
				"Content-Length": 13,
				"X-CSRF-Token": "0987654321"
			}, '{ "d": {"results":[{"BusinessContext":"CFD_TSM_BUPA_ADR"},{"BusinessContext":"CFD_TSM_BUPA"}] }}');

		} catch (e) {
			oServer.restore();
			assert.ok(false, e);
		}
	});

	QUnit.test('getBusinessContextsByEntitySet', function(assert) {
		var sServiceUrl = "/someService";
		var sEntitySetName = "BusinessPartnerSet";

		var oServer;
		oServer = sinon.fakeServer.create();
		oServer.autoRespond = true;
		try {
			var oPromise = Access.getBusinessContexts(sServiceUrl, null, sEntitySetName);

			oPromise.done(function(oBusinessContexts) {
				oServer.restore();
				assert.deepEqual(oBusinessContexts, oBusinessExpectedContextRetrievalResult);
			});

			oPromise.fail(function(error) {
				oServer.restore();
				assert.ok(false, "Should not run into fail branch. Error" + error);
			});

			oServer.requests[0].respond(200, {
				"Content-Type": "application/json",
				"Content-Length": 13,
				"X-CSRF-Token": "0987654321"
			}, '{ "d": {"results":[{"BusinessContext":"CFD_TSM_BUPA_ADR"},{"BusinessContext":"CFD_TSM_BUPA"}] }}');

		} catch (e) {
			oServer.restore();
			assert.ok(false, e);
		}
	});

	QUnit.test('getBusinessContextsWhereNoContextsAreReturned', function(assert) {
		var sServiceUrl = "/someService";
		var sEntityTypeName = "BusinessPartner";

		var oServer;
		oServer = sinon.fakeServer.create();
		oServer.autoRespond = true;
		try {
			var oPromise = Access.getBusinessContexts(sServiceUrl, sEntityTypeName);

			oPromise.done(function(oBusinessContexts) {
				oServer.restore();
				assert.deepEqual(oBusinessContexts, oBusinessExpectedContextRetrievalResultWithoutBusinesscontexts);
			});

			oPromise.fail(function(error) {
				oServer.restore();
				assert.ok(false, "Should not run into fail branch. Error" + error);
			});

			oServer.requests[0].respond(200, {
				"Content-Type": "application/json",
				"Content-Length": 13,
				"X-CSRF-Token": "0987654321"
			}, '{ "results":[] }');

		} catch (e) {
			oServer.restore();
			assert.ok(false, e);
		}
	});

	//In case EntitySetName was not provided at all - at least EntitySetName='' has to be provided -
	// the real get response is used in respond parameter of this test
	QUnit.test('getBusinessContextsWhereRetrievalFails', function(assert) {

		var sServiceUrl = "/someService";
		var sEntityTypeName = "BusinessPartner";

		var oServer;
		oServer = sinon.fakeServer.create();
		oServer.autoRespond = true;
		try {
			var oPromise = Access.getBusinessContexts(sServiceUrl, sEntityTypeName);

			oPromise.done(function(oBusinessContexts) {
				oServer.restore();
				assert.ok(false, "Should not run into done branch. ");
			});

			oPromise.fail(function(oError) {
				oServer.restore();
				assert.equal(oError.errorMessages[0].text, "Invalid Function Import Parameter");
				assert.equal(oError.errorMessages[0].severity, oExpectedErrorResult.severity);
			});

			oServer.requests[0].respond(404, {
				"Content-Type": "application/json",
				"Content-Length": 13,
				"X-CSRF-Token": "0987654321"
			}, JSON.stringify(oHttpErrorResponse));

		} catch (e) {
			oServer.restore();
			assert.ok(false, e);
		}
	});

	QUnit.test( "Test set service invalid", function( assert ) {
		var oUnchangedAccess = mockAccessJs();
		var service = {
			"serviceName": "abc",
			"serviceVersion": "0001"
		};

		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		Access.setServiceInvalid(service);
		assert.ok(Access.isServiceOutdated(service));
		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		unMockAccessJs(oUnchangedAccess);
	});

	QUnit.test( "Test expiration date", function( assert ) {
		var oUnchangedAccess = mockAccessJs();
		var service = {
			"serviceName": "abc",
			"serviceVersion": "0001"
		};

		// Mock current time to 5
		Access._getCurrentTime = function() {
			return 5;
		};

		// Clear storage
		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		// Check expiration date 5 + 1 week
		Access.setServiceInvalid(service);
		assert.ok(Access.isServiceOutdated(service));

		Access._getCurrentTime = function() {
			return 5 + (1 * 7 * 24 * 60 * 60 * 1000) - 1;
		};

		assert.ok(Access.isServiceOutdated(service));

		Access._getCurrentTime = function() {
			return 5 + (1 * 7 * 24 * 60 * 60 * 1000);
		};

		assert.notOk(Access.isServiceOutdated(service));

		// Make sure the service has been deleted from the local storage
		assert.notOk(Access._getServiceItem(Access._createServiceItem(service)));

		unMockAccessJs(oUnchangedAccess);
	});

	QUnit.test("Test reinvalidate", function( assert ) {
		var oUnchangedAccess = mockAccessJs();
		var service = {
			"serviceName": "abc",
			"serviceVersion": "0001"
		};

		// Clear storage
		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		// Mock current time to 5 and invalidate
		Access._getCurrentTime = function() {
			return 5;
		};
		Access.setServiceInvalid(service);

		// Two weeks have been passed
		Access._getCurrentTime = function() {
			return 5 + (2 * 7 * 24 * 60 * 60 * 1000);
		};

		// The service must be valid, but the entry is still there.
		// Let`s invalidate the service again
		Access.setServiceInvalid(service);

		// Service have to be stale
		assert.ok(Access.isServiceOutdated(service));
		assert.ok(Access.isServiceOutdated(service));
		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		unMockAccessJs(oUnchangedAccess);
	});

	QUnit.test("Test logon system not available", function( assert ) {
		// The service is always valid
		var service = {
			"serviceName": "abc",
			"serviceVersion": "0001"
		};
		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));
		Access.setServiceInvalid(service);
		assert.notOk(Access.isServiceOutdated(service));
	});

	QUnit.test("Test ushell not available", function( assert ) {
		var shell = null;
		if (sap.ushell) {
			shell = sap.ushell;
			delete sap.ushell;
		}

		// The service is always valid
		var service = {
			"serviceName": "abc",
			"serviceVersion": "0001"
		};
		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));
		Access.setServiceInvalid(service);
		assert.notOk(Access.isServiceOutdated(service));

		if (shell) {
			sap.ushell = shell;
		}
	});

	QUnit.test("Test uniqueness", function( assert ) {
		var oUnchangedAccess = mockAccessJs();
		var service = {
			"serviceName": "abc",
			"serviceVersion": "0001"
		};

		var serviceModifiedName = {
			"serviceName": "abcd",
			"serviceVersion": "0001"
		};

		var serviceModifiedVersion = {
			"serviceName": "abc",
			"serviceVersion": "0002"
		};

		// Clear storage
		Access.setServiceValid(service);
		Access.setServiceValid(serviceModifiedName);
		Access.setServiceValid(serviceModifiedVersion);
		assert.notOk(Access.isServiceOutdated(service));
		assert.notOk(Access.isServiceOutdated(serviceModifiedName));
		assert.notOk(Access.isServiceOutdated(serviceModifiedVersion));

		// Mock current time to 5 and invalidate
		Access._getCurrentTime = function() {
			return 5;
		};
		Access.setServiceInvalid(service);

		assert.ok(Access.isServiceOutdated(service));
		assert.notOk(Access.isServiceOutdated(serviceModifiedName));
		assert.notOk(Access.isServiceOutdated(serviceModifiedVersion));

		unMockAccessJs(oUnchangedAccess);
	});

	QUnit.test( "Validate local storage is used", function( assert ) {
		var oUnchangedAccess = mockAccessJs();
		var service;
		var storageItem;

		// Run test only if local storage is available
		if (window.localStorage) {
			window.localStorage.setItem("state.key_-sap.ui.fl.fieldExt.Access", "\"{ }\"");

			service = {
				"serviceName": "abc",
				"serviceVersion": "0001"
			};

			Access.setServiceValid(service);
			assert.notOk(Access.isServiceOutdated(service));
			Access.setServiceInvalid(service);
			assert.ok(Access.isServiceOutdated(service));

			storageItem = window.localStorage.getItem("state.key_-sap.ui.fl.fieldExt.Access");
			assert.ok(storageItem != "\"{ }\"");

		}
		unMockAccessJs(oUnchangedAccess);
		assert.ok(true);
	});

	QUnit.test( "Test no local storage", function( assert ) {
		var oUnchangedAccess = mockAccessJs();
		// If no local storage is available => This class does nothing => A service is never outdated
		var service = {
			"serviceName": "abc",
			"serviceVersion": "0001"
		};

		// We simulate a very old browser
		Access._getLocalStorage = function() {
			return null;
		};

		// Execute tests
		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		Access.setServiceInvalid(service);
		assert.notOk(Access.isServiceOutdated(service));

		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		unMockAccessJs(oUnchangedAccess);
	});

	QUnit.test("Test set service invalid with relative uri", function( assert ) {
		var oUnchangedAccess = mockAccessJs();
		var service = "/sap/opu/odata/SAP/someService";
		var serviceAsObject = {
			"serviceName": "someService",
			"serviceVersion": "0001"
		};

		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		Access.setServiceInvalid(service);
		assert.ok(Access.isServiceOutdated(service));
		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		// Different parameters
		Access.setServiceInvalid(service);
		assert.ok(Access.isServiceOutdated(service));
		assert.ok(Access.isServiceOutdated(serviceAsObject));
		Access.setServiceValid(serviceAsObject);
		assert.notOk(Access.isServiceOutdated(service));
		assert.notOk(Access.isServiceOutdated(serviceAsObject));

		unMockAccessJs(oUnchangedAccess);
	});

	QUnit.test("Test set service invalid with relative and version uri", function( assert ) {
		var oUnchangedAccess = mockAccessJs();
		var service = "/sap/opu/odata/SAP/someService;v=0002";
		var serviceAsObject = {
			"serviceName": "someService",
			"serviceVersion": "0002"
		};

		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		Access.setServiceInvalid(service);
		assert.ok(Access.isServiceOutdated(service));
		Access.setServiceValid(service);
		assert.notOk(Access.isServiceOutdated(service));

		// Different parameters
		Access.setServiceInvalid(service);
		assert.ok(Access.isServiceOutdated(service));
		assert.ok(Access.isServiceOutdated(serviceAsObject));
		Access.setServiceValid(serviceAsObject);
		assert.notOk(Access.isServiceOutdated(service));
		assert.notOk(Access.isServiceOutdated(serviceAsObject));

		unMockAccessJs(oUnchangedAccess);
	});

	QUnit.test("Parse service version of relative uri", function( assert ) {
		checkServiceVersion("sap/opu/odata/SAP/someServicesomeService;v=0002", 		 "0002");
		checkServiceVersion("/sap/opu/odata/SAP/someServicesomeService;v=0002/", 	 "0002");
		checkServiceVersion("sap/opu/odata/ns/someServicesomeService;v=0002", 		 "0002");
		checkServiceVersion("/sap/opu/odata/ns/someServicesomeService;v=0002/", 		 "0002");
		checkServiceVersion("/foo/opu/odata/ns/someServicesomeService;v=0002/", 	 	 "0002");
		checkServiceVersion("/foo/opu/odata/ns/someServicesomeService;v=0002", 		 "0002");
		checkServiceVersion("foo/opu/odata/ns/someServicesomeService;v=0002/", 		 "0002");
		checkServiceVersion("foo/opu/odata/ns/someServicesomeService;v=0002", 		 "0002");
		checkServiceVersion("foo/opu/odata/ns/someServicesomeService;v=0002;w=foo", 	 "0002");
		checkServiceVersion("sap/opu/odata/SAP/someServicesomeService", 				 "0001");
		checkServiceVersion("sap/opu/odata/SAP/someServicesomeService;v=0002;v=0004", "0002");
		checkServiceVersion("foo/opu/odata/ns/someServicesomeService;v=0002;w=foo?$format=json", 	"0002");
		checkServiceVersion("sap/opu/odata/ns/someServicesomeService;v=0002;w=foo?$format=json", 	"0002");
	});

	QUnit.test("Parse service name", function( assert ) {
		// 1.) Case
		checkServiceName("/sap/opu/odata/SAP/someServicesomeService" 		 , "someServicesomeService");
		checkServiceName("/sap/opu/odata/SAP/someServicesomeService/" 		 , "someServicesomeService");
		checkServiceName("/sap/opu/odata/SAP/someServicesomeService;v=0002"   , "someServicesomeService");
		checkServiceName("/sap/opu/odata/SAP/someServicesomeService;v=0002/"  , "someServicesomeService");

		checkServiceName("sap/opu/odata/SAP/someServicesomeService"		     , "someServicesomeService");
		checkServiceName("sap/opu/odata/SAP/someServicesomeService/" 		 , "someServicesomeService");
		checkServiceName("sap/opu/odata/SAP/someServicesomeService;v=0002"    , "someServicesomeService");
		checkServiceName("sap/opu/odata/SAP/someServicesomeService;v=0002/"   , "someServicesomeService");

		checkServiceName("/sap/opu/odata/sap/someServicesomeService" 		 , "someServicesomeService");
		checkServiceName("/sap/opu/odata/SaP/someServicesomeService/" 		 , "someServicesomeService");
		checkServiceName("/sap/opu/oData/SAP/someServicesomeService;v=0002"   , "someServicesomeService");
		checkServiceName("/sap/Opu/odata/SAP/someServicesomeService;v=0002/"  , "someServicesomeService");
		checkServiceName("/Sap/Opu/odata/SAP/someServicesomeService;v=0002/"  , "someServicesomeService");
		checkServiceName("/Sap/Opu/odata/SAP/someServicesomeService;v=0002/"  , "someServicesomeService");

		checkServiceName("sap/opu/odata/SAP/someServicesomeService;v=0002;w=foo?$format=xml"  , "someServicesomeService");

		// 2.) Case
		checkServiceName("/sap/opu/odata/PAS/someServicesomeService" 		 , "/PAS/someServicesomeService");
		checkServiceName("/sap/opu/odata/PAS/someServicesomeService/" 		 , "/PAS/someServicesomeService");
		checkServiceName("/sap/opu/odata/PAS/someServicesomeService;v=0002"   , "/PAS/someServicesomeService");
		checkServiceName("/sap/opu/odata/PAS/someServicesomeService;v=0002/"  , "/PAS/someServicesomeService");
		checkServiceName("sap/opu/odata/PAS/someServicesomeService" 		     , "/PAS/someServicesomeService");
		checkServiceName("sap/opu/odata/PAS/someServicesomeService/" 		 , "/PAS/someServicesomeService");
		checkServiceName("sap/opu/odata/PAS/someServicesomeService;v=0002"    , "/PAS/someServicesomeService");
		checkServiceName("sap/opu/odata/PAS/someServicesomeService;v=0002/"   , "/PAS/someServicesomeService");

		// 3.) Case
		checkServiceName("/foo/opu/odata/SAP/someServicesomeService" 		 , "someServicesomeService");
		checkServiceName("/foo/opu/odata/SAP/someServicesomeService/" 		 , "someServicesomeService");
		checkServiceName("/foo/opu/odata/SAP/someServicesomeService;v=0002"   , "someServicesomeService");
		checkServiceName("/foo/opu/odata/SAP/someServicesomeService;v=0002/"  , "someServicesomeService");

		checkServiceName("foo/opu/odata/SAP/someServicesomeService"		     , "someServicesomeService");
		checkServiceName("foo/opu/odata/SAP/someServicesomeService/"		     , "someServicesomeService");
		checkServiceName("foo/opu/odata/SAP/someServicesomeService;v=0002"    , "someServicesomeService");
		checkServiceName("foo/opu/odata/SAP/someServicesomeService;v=0002/"   , "someServicesomeService");

		checkServiceName("/foo/opu/odata/PAS/someServicesomeService" 		 , "someServicesomeService");
		checkServiceName("/foo/opu/odata/PAS/someServicesomeService/" 		 , "someServicesomeService");
		checkServiceName("/foo/opu/odata/PAS/someServicesomeService;v=0002"   , "someServicesomeService");
		checkServiceName("/foo/opu/odata/PAS/someServicesomeService;v=0002/"  , "someServicesomeService");

		checkServiceName("foo/opu/odata/PAS/someServicesomeService"		     , "someServicesomeService");
		checkServiceName("foo/opu/odata/PAS/someServicesomeService/"		     , "someServicesomeService");
		checkServiceName("foo/opu/odata/PAS/someServicesomeService;v=0002"    , "someServicesomeService");
		checkServiceName("foo/opu/odata/PAS/someServicesomeService;v=0002/"   , "someServicesomeService");
	});

}(sap.ui.fl.fieldExt.Access));
