/**
 * the $metadata response for VLI
 */
o4aFakeService.addResponse({
	uri: "$metadata",
	header: o4aFakeService.headers.METADATA,
	content: "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" + 
			"<edmx:Edmx Version=\"1.0\"\n" + 
			"	xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\"\n" + 
			"	xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\n" + 
			"	xmlns:sap=\"http://www.sap.com/Protocols/SAPData\">\n" + 
			"	<edmx:Reference\n" + 
			"		Uri=\"http://localhost:8080/uilib-sample/proxy/http/ldai2er3.wdf.sap.corp:50035/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_COMMON\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value\"\n" + 
			"		xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\">\n" + 
			"		<edmx:Include Namespace=\"com.sap.vocabularies.Common.v1\"\n" + 
			"			Alias=\"Common\" />\n" + 
			"	</edmx:Reference>\n" + 
			"	<edmx:Reference\n" + 
			"		Uri=\"http://localhost:8080/uilib-sample/proxy/http/ldai2er3.wdf.sap.corp:50035/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_UI\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value\"\n" + 
			"		xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\">\n" + 
			"		<edmx:Include Namespace=\"com.sap.vocabularies.UI.v1\"\n" + 
			"			Alias=\"UI\" />\n" + 
			"	</edmx:Reference>\n" + 
			"	<edmx:DataServices m:DataServiceVersion=\"2.0\">\n" + 
			"		<Schema Namespace=\"fap_vendor_line_items_srv\" xml:lang=\"en\"\n" + 
			"			sap:schema-version=\"0\" xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\">\n" + 
			"			<EntityType Name=\"Vendor\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"VendorId\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Country\" Type=\"Edm.String\" MaxLength=\"3\"\n" + 
			"					sap:label=\"Country\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"VendorName\" Type=\"Edm.String\" MaxLength=\"35\"\n" + 
			"					sap:label=\"Vendor Name\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"VendorId\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:text=\"VendorName\" sap:label=\"Vendor\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AddressNumber\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:label=\"Address Number\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"Address\" Type=\"Edm.String\" MaxLength=\"80\"\n" + 
			"					sap:label=\"Address Long\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"UpdatableItem\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"CompanyCode\" />\n" + 
			"					<PropertyRef Name=\"AccountingDocument\" />\n" + 
			"					<PropertyRef Name=\"FiscalYear\" />\n" + 
			"					<PropertyRef Name=\"AccountingDocumentItem\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"CompanyCode\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:label=\"Company Code\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"AccountingDocument\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"10\" sap:label=\"Document Number\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:sortable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"FiscalYear\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:label=\"Fiscal Year\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"AccountingDocumentItem\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"3\" sap:label=\"Line item\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"DunningBlockingReasonCode\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:label=\"Dunning Block\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"PaymentBlockingReasonCode\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:label=\"Item Payment Block\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"DueCalculationBaseDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:label=\"Baseline Date\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscount1Days\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"3\" Scale=\"0\" sap:label=\"Days 1\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscount1Percent\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"5\" Scale=\"3\" sap:label=\"Disc. Percent 1\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscount2Days\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"3\" Scale=\"0\" sap:label=\"Days 2\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscount2Percent\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"5\" Scale=\"3\" sap:label=\"Disc. Percent 2\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"NetPaymentDays\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"3\" Scale=\"0\" sap:label=\"Days net\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"PaymentMethod\" Type=\"Edm.String\" MaxLength=\"1\"\n" + 
			"					sap:label=\"Payment Method\" sap:creatable=\"false\" sap:sortable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"DunningArea\" Type=\"Edm.String\" MaxLength=\"2\"\n" + 
			"					sap:label=\"Dunning Area\" sap:creatable=\"false\" sap:sortable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"LastDunningDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:label=\"Last Dunned\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"DunningLevel\" Type=\"Edm.String\" MaxLength=\"1\"\n" + 
			"					sap:label=\"Dunning Level\" sap:creatable=\"false\" sap:sortable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"MaximumDunningLevel\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:label=\"Dunning Key\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"AssignmentReference\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"18\" sap:label=\"Assignment\" sap:creatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"DocumentItemText\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"50\" sap:label=\"Text\" sap:creatable=\"false\" sap:sortable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"FinancialAccountType\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:label=\"Account Type\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SpecialGeneralLedgerCode\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:label=\"Special G/L ind\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"PostingKey\" Type=\"Edm.String\" MaxLength=\"2\"\n" + 
			"					sap:label=\"Posting Key\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"AccountingDocumentCategory\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:label=\"Doc.status\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"TaxCode\" Type=\"Edm.String\" MaxLength=\"2\"\n" + 
			"					sap:label=\"Tax Code\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"Note\" Type=\"Edm.String\" sap:label=\"Note\"\n" + 
			"					sap:creatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"Title\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Title\" sap:creatable=\"false\" sap:sortable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"ItemSinglePayable\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"Item\" sap:service-schema-version=\"1\"\n" + 
			"				sap:service-version=\"1\" sap:semantics=\"aggregate\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"GeneratedID\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"AmountInTransactionCurrency\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" + 
			"					sap:label=\"Amount (Tran Cur.)\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"BalancedAmountInCompanyCodeCurrency\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"CompanyCodeCurrency\"\n" + 
			"					sap:label=\"Amount (no sign)\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscountBaseAmount\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" + 
			"					sap:label=\"Cash Discount Base\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AmountInCompanyCodeCurrency\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"CompanyCodeCurrency\"\n" + 
			"					sap:label=\"Amount (CoCd Cur.)\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscountAmountInTransactionCurrency\"\n" + 
			"					Type=\"Edm.Decimal\" Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" + 
			"					sap:label=\"Discount Available\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscountAmtInCompanyCodeCrcy\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"CompanyCodeCurrency\"\n" + 
			"					sap:label=\"Discount (CoCd Cur.)\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscountAmount\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" + 
			"					sap:label=\"Discount (Tran Cur.)\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AmountInBalanceTransactionCurrency\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"BalanceTransactionCurrency\"\n" + 
			"					sap:label=\"G/L Update Amount\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"HedgedAmount\" Type=\"Edm.Decimal\" Precision=\"24\"\n" + 
			"					Scale=\"3\" sap:aggregation-role=\"measure\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:unit=\"TransactionCurrency\" sap:label=\"Hedged Amount\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"ValuatedAmountInCompanyCodeCurrency\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"CompanyCodeCurrency\"\n" + 
			"					sap:label=\"LC Evaluated Amount\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AmountInAdditionalCurrency1\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"AdditionalCurrency1\"\n" + 
			"					sap:label=\"Amt (CoCd Curr. 2)\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"ValuatedAmountInAdditionalCurrency1\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"AdditionalCurrency1\"\n" + 
			"					sap:label=\"LC2 Evaluated Amount\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AmountInAdditionalCurrency2\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"AdditionalCurrency2\"\n" + 
			"					sap:label=\"Amt (CoCd Curr. 3)\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"ValuatedAmountInAdditionalCurrency2\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"AdditionalCurrency2\"\n" + 
			"					sap:label=\"LC3 Evaluated Amount\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PlannedAmountInTransactionCurrency\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" + 
			"					sap:label=\"Planned Amount\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AmountInPaymentCurrency\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"PaymentCurrency\"\n" + 
			"					sap:label=\"Pymt Currency Amnt\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"WithholdingTaxExemptionAmount\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" + 
			"					sap:label=\"Withhold. Tax Exempt\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"WithholdingTaxAmount\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" + 
			"					sap:label=\"Withholding Tax\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"WithholdingTaxBaseAmount\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"24\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"TransactionCurrency\"\n" + 
			"					sap:label=\"Withholding Tax Base\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"InterestToBePosted\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"16\" Scale=\"3\" sap:aggregation-role=\"measure\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:unit=\"CompanyCodeCurrency\"\n" + 
			"					sap:label=\"Imputed Interest\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscount1Percent\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"5\" Scale=\"3\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Disc. Percent 1\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscount2Percent\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"5\" Scale=\"3\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Disc. Percent 2\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscount1ArrearsDays\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"5\" Scale=\"0\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Disc.1 Arrears\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"NetDueArrearsDays\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"5\" Scale=\"0\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Net Arrears\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscount1Days\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"3\" Scale=\"0\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Cash Discount Days 1\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDiscount2Days\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"3\" Scale=\"0\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Cash Discount Days 2\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"NetPaymentDays\" Type=\"Edm.Decimal\"\n" + 
			"					Precision=\"3\" Scale=\"0\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Days Net\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AccountingDocumentCreationDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Entered On\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"VendorAccountName\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Account Group\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AccountMemo\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:label=\"Account Memo\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CustomerVendorAccount\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Account Number\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"FinancialAccountType\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Account Type\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AccountingClerk\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Acctg Clerk\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AlternativePayeeAccount\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Alternat.Payee\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsAccountsReceivablePledged\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"AR Pledging\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsDocumentArchived\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Archived\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AssignmentReference\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"18\" sap:aggregation-role=\"dimension\" sap:label=\"Assignment\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AuthorizationGroup\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"4\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Authorization\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:sortable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"PaymentCurrency\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Autom. Pymt Currency\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:semantics=\"currency-code\" />\n" + 
			"				<Property Name=\"DueCalculationBaseDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Baseline Date\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"BillOfExchangeUsage\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"BoE Usage\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"BranchAccount\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Branch Account No.\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"BusinessArea\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Business Area\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"BusinessPlace\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Business Place\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDateDueNetSymbol\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Cash Date 1 Due\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashDisount1DueDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Cash Disc 1 Due Date\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsCashDiscount1Due\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Cash Disc 1 Due Ind\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CityName\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:label=\"City\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"ClearingDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Clearing Date\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"ClearingAccountingDocument\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Clearing Doc. No.\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"ClearingStatus\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Clearing Status\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"ClearingDocFiscalYear\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Clrg Fiscal Yr\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"InvoiceList\" Type=\"Edm.String\" MaxLength=\"8\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Coll. Inv. List No.\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CompanyCode\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:text=\"CompanyName\" sap:label=\"Company Code\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"TradingPartnerCompanyID\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"6\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Company ID\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CompanyName\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:label=\"Company Name\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AssetContract\" Type=\"Edm.String\" MaxLength=\"13\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Contract Number\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"TreasuryContractType\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Contract Type\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CorporateGroup\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Corporate Group\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CostCenter\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Cost Center\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"VendorCountry\" Type=\"Edm.String\" MaxLength=\"3\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Country\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AccountCreatedByUser\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"12\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Created by\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AccountCreationDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Created on\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CreditControlArea\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Credit Control Area\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"TransactionCurrency\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Currency\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:semantics=\"currency-code\" />\n" + 
			"				<Property Name=\"DebitCreditCode\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Debit/Credit\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsMarkedForDeletion\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Delete\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsDisputed\" Type=\"Edm.String\" MaxLength=\"1\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Disputed Item\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"DocumentDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Document Date\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AccountingDocument\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Document Number\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AccountingDocumentCategory\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Document Status\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AccountingDocumentType\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Document Type\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"DueItemCategory\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:label=\"Due Item Category\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"DueNetSymbol\" Type=\"Edm.String\" MaxLength=\"1\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Due Net (Symbol)\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsDueNet\" Type=\"Edm.String\" MaxLength=\"1\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Due Net Indicator\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"NetDueDate\" Type=\"Edm.DateTime\" Precision=\"0\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Due on\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"DunningArea\" Type=\"Edm.String\" MaxLength=\"2\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Dunning Area\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"DunningBlockingReasonCode\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Dunning Block\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"MaximumDunningLevel\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Dunning Key\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"DunningLevel\" Type=\"Edm.String\" MaxLength=\"1\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Dunning Level\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"EffectiveExchangeRate\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"12\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Effect. Exch. Rate\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"FiscalYear\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Fiscal Year\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"FixedCashDiscount\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Fixed Payment Terms\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CashFlowType\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Flow Type\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"FollowOnDocumentType\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Follow-On Doc.Type\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"TuningParameter1\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"40\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:label=\"for internal use only\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"TuningParameter2\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"40\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:label=\"for internal use only\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"FundsManagementCenter\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"16\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Funds Center\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"GeneralLedgerAccount\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"G/L\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"BalanceTransactionCurrency\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"G/L Currency\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:semantics=\"currency-code\" />\n" + 
			"				<Property Name=\"HeadOffice\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Head Office\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"HouseBank\" Type=\"Edm.String\" MaxLength=\"5\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"House Bank\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsSinglePayment\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Individual Payment\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"Industry\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:text=\"IndustryName\" sap:label=\"Industry\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IndustryName\" Type=\"Edm.String\" MaxLength=\"20\"\n" + 
			"					sap:label=\"Industry Name\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"DataExchangeInstruction1\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Instruction 1\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"DataExchangeInstruction2\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Instruction 2\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"DataExchangeInstruction3\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Instruction 3\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"DataExchangeInstruction4\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Instruction 4\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"InterestCalculationDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Int. Last Calculated\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IntrstCalcFrequencyInMonths\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Interest Calc. Freq.\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"InterestCalculationCode\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Interest Indic.\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"InvoiceReference\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Invoice Reference\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsCleared\" Type=\"Edm.String\" MaxLength=\"1\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Item Cleared\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"SalesDocumentItem\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"6\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Item No.\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PaymentBlockingReason\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Item Payment Block\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"HasClearingAccountingDocument\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Item Status\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"DocumentItemText\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"50\" sap:aggregation-role=\"dimension\" sap:label=\"Item Text\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"LastDunningDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Last Dunned\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AccountingDocumentItem\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"3\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Line Item\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"CompanyCodeCurrency\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Local Currency\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:semantics=\"currency-code\" />\n" + 
			"				<Property Name=\"AdditionalCurrency1\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Local Currency 2\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:semantics=\"currency-code\" />\n" + 
			"				<Property Name=\"AdditionalCurrency2\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Local Currency 3\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:semantics=\"currency-code\" />\n" + 
			"				<Property Name=\"MasterFixedAsset\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"12\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Main Asset No.\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsNegativePosting\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Negative Posting\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsOneTimeAccount\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"One-Time Account\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"KeyDate\" Type=\"Edm.DateTime\" Precision=\"0\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Open at Key Date\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" />\n" + 
			"				<Property Name=\"Order\" Type=\"Edm.String\" MaxLength=\"12\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Order\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"AlternativePayerIsAllowed\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Payee in Doc.\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PaymentCardItem\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"3\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Payment Card Item\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PaymentMethod\" Type=\"Edm.String\" MaxLength=\"1\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Payment Method\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PaymentReference\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"30\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Payment Reference\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"HasPaymentOrder\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Payment Sent\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PaymentTerms\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Payment Terms\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"FiscalPeriod\" Type=\"Edm.String\" MaxLength=\"2\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Period\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"VendorIsBlockedForPosting\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Phys.Invent. Blocked\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"Plant\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Plant\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsPaytAdviceSentByEDI\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Pmt Adv. by EDI\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"POBox\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"PO Box\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"POBoxPostalCode\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"PO Box Postal Code\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PostalCode\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Postal Code\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PostingDate\" Type=\"Edm.DateTime\" Precision=\"0\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Posting Date\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PostingKey\" Type=\"Edm.String\" MaxLength=\"2\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Posting Key\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"ProfitCenter\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Profit Center\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PurchasingDocumentItem\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"5\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Purchasing Doc. Item\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PurchasingDocument\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Purchasing Document\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PaymentMethodSupplement\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"2\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Pymnt Methd Supplemt\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsUsedInPaymentTransaction\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Pymt Tran.\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"RealEstateObject\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"8\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Real Estate Key\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PaymentDifferenceReason\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"3\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Reason Code\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"ReconciliationAccount\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Recon. Account\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"DocumentReferenceID\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"16\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Reference\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"SettlementReferenceDate\" Type=\"Edm.DateTime\"\n" + 
			"					Precision=\"0\" sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Reference Date\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"Reference1IDByBusinessPartner\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"12\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Reference Key 1\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"Reference2IDByBusinessPartner\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"12\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Reference Key 2\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"Reference3IDByBusinessPartner\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"20\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Reference Key 3\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"Region\" Type=\"Edm.String\" MaxLength=\"3\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:text=\"RegionName\" sap:label=\"Region\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"RegionName\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:label=\"Region Name\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"IsClearingReversed\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Reverse Clearing\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"GeneratedID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:label=\"SADL ID\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SalesDocument\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Sales Document\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"IsSalesRelated\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Sales-Related Item\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"TaxCode\" Type=\"Edm.String\" MaxLength=\"2\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Tax Code\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"DeliveryScheduleLine\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Schedule Line\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"BillingDocument\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"SD Document No.\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"SortKey\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Search Term\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"TaxSection\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Section Code\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"PaymentCardsSettlementRun\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Settlement\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"SpecialGeneralLedgerTransactionType\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"SG Transaction Type\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"SpecialGeneralLedgerCode\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Special G/L ind\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"FixedAsset\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Subnumber\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"TargetTaxCode\" Type=\"Edm.String\" MaxLength=\"2\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Target Tax Code\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"TaxJurisdiction\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"15\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Tax Jur.\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"TaxID1\" Type=\"Edm.String\" MaxLength=\"16\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Tax Number 1\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"TaxID2\" Type=\"Edm.String\" MaxLength=\"11\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Tax Number 2\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"HasText\" Type=\"Edm.String\" MaxLength=\"1\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Text Exists\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"AccountingDocumentTextCategory\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Text ID\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"ToleranceGroup\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Tolerance Group\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"ValueDate\" Type=\"Edm.DateTime\" Precision=\"0\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"Date\"\n" + 
			"					sap:label=\"Value Date\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"VATRegistration\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"20\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"VAT Registration No.\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"VendorPaymentBlockingReason\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"1\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Vend. Payment Block\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"Vendor\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:text=\"VendorName\" sap:label=\"Vendor\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"VendorName\" Type=\"Edm.String\" MaxLength=\"35\"\n" + 
			"					sap:label=\"Vendor Name\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"WorkBreakdownStructureElement\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"24\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"WBS Element\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"FiscalYearPeriod\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"7\" sap:aggregation-role=\"dimension\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Year/Period\" sap:creatable=\"false\" sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"BooleanParameter\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"5\" sap:aggregation-role=\"dimension\"\n" + 
			"					sap:label=\"for internal use only\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"ReturnValue\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"rv\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"rv\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_KREDA\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SORTL\" />\n" + 
			"					<PropertyRef Name=\"PSTLZ\" />\n" + 
			"					<PropertyRef Name=\"MCOD3\" />\n" + 
			"					<PropertyRef Name=\"MCOD1\" />\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BEGRU\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Authorization\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SORTL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Search Term\" />\n" + 
			"				<Property Name=\"LAND1\" Type=\"Edm.String\" MaxLength=\"3\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"PSTLZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Postal Code\" />\n" + 
			"				<Property Name=\"MCOD3\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"City\" />\n" + 
			"				<Property Name=\"MCOD1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"Vendor Name\" />\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:text=\"MCOD1\"\n" + 
			"					sap:label=\"Vendor\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_KREDI\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"LAND1\" />\n" + 
			"					<PropertyRef Name=\"MCOD3\" />\n" + 
			"					<PropertyRef Name=\"SORTL\" />\n" + 
			"					<PropertyRef Name=\"MCOD1\" />\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BEGRU\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Authorization\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"LAND1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"MCOD3\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"City\" />\n" + 
			"				<Property Name=\"SORTL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Search Term\" />\n" + 
			"				<Property Name=\"MCOD1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"Vendor Name\" />\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:text=\"MCOD1\"\n" + 
			"					sap:label=\"Vendor\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_KREDK\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SORTL\" />\n" + 
			"					<PropertyRef Name=\"PSTLZ\" />\n" + 
			"					<PropertyRef Name=\"MCOD3\" />\n" + 
			"					<PropertyRef Name=\"MCOD1\" />\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BEGRU\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Authorization\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SORTL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Search Term\" />\n" + 
			"				<Property Name=\"LAND1\" Type=\"Edm.String\" MaxLength=\"3\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"PSTLZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Postal Code\" />\n" + 
			"				<Property Name=\"MCOD3\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"City\" />\n" + 
			"				<Property Name=\"MCOD1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"Vendor Name\" />\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:text=\"MCOD1\"\n" + 
			"					sap:label=\"Vendor\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_KREDL\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"LAND1\" />\n" + 
			"					<PropertyRef Name=\"SORTL\" />\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BEGRU\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Authorization\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"LAND1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"SORTL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Search Term\" />\n" + 
			"				<Property Name=\"MCOD1\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Customer Name\" />\n" + 
			"				<Property Name=\"MCOD3\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"City\" />\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:text=\"MCOD1\"\n" + 
			"					sap:label=\"Vendor\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_KREDP\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"					<PropertyRef Name=\"PERNR\" />\n" + 
			"					<PropertyRef Name=\"MCOD1\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:text=\"MCOD1\"\n" + 
			"					sap:label=\"Vendor\" />\n" + 
			"				<Property Name=\"PERNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"8\" sap:display-format=\"NonNegative\" sap:label=\"Personnel No.\" />\n" + 
			"				<Property Name=\"MCOD1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"Vendor Name\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_KREDT\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BEGRU\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Authorization\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"STCD1\" Type=\"Edm.String\" MaxLength=\"16\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Tax Number 1\" />\n" + 
			"				<Property Name=\"STCD2\" Type=\"Edm.String\" MaxLength=\"11\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Tax Number 2\" />\n" + 
			"				<Property Name=\"STCD3\" Type=\"Edm.String\" MaxLength=\"18\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Tax Number 3\" />\n" + 
			"				<Property Name=\"STCD4\" Type=\"Edm.String\" MaxLength=\"18\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Tax Number 4\" />\n" + 
			"				<Property Name=\"STCD5\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Tax Number 5\" />\n" + 
			"				<Property Name=\"STCEG\" Type=\"Edm.String\" MaxLength=\"20\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"VAT Registration No.\" />\n" + 
			"				<Property Name=\"LAND1\" Type=\"Edm.String\" MaxLength=\"3\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"MCOD1\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Vendor Name\" />\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:text=\"MCOD1\"\n" + 
			"					sap:label=\"Vendor\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_KREDE\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SORTL\" />\n" + 
			"					<PropertyRef Name=\"PSTLZ\" />\n" + 
			"					<PropertyRef Name=\"MCOD3\" />\n" + 
			"					<PropertyRef Name=\"MCOD1\" />\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BEGRU\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Authorization\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SORTL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Search Term\" />\n" + 
			"				<Property Name=\"LAND1\" Type=\"Edm.String\" MaxLength=\"3\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"PSTLZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Postal Code\" />\n" + 
			"				<Property Name=\"MCOD3\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"City\" />\n" + 
			"				<Property Name=\"MCOD1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"Vendor Name\" />\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:text=\"MCOD1\"\n" + 
			"					sap:label=\"Vendor\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"BOLRE\" Type=\"Edm.Boolean\" sap:label=\"Subseq. sett.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_KREDM_E\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"MATNR\" />\n" + 
			"					<PropertyRef Name=\"IDNLF\" />\n" + 
			"					<PropertyRef Name=\"EIORG\" />\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"					<PropertyRef Name=\"INFNR\" />\n" + 
			"					<PropertyRef Name=\"ESOKZ\" />\n" + 
			"					<PropertyRef Name=\"EWERK\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BEGRU\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Authorization\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"MATNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"18\" sap:display-format=\"UpperCase\" sap:label=\"Material\" />\n" + 
			"				<Property Name=\"IDNLF\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"35\" sap:display-format=\"UpperCase\" sap:label=\"Vendor Mat. No.\" />\n" + 
			"				<Property Name=\"EIORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Vendor\" />\n" + 
			"				<Property Name=\"INFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Info Record\" />\n" + 
			"				<Property Name=\"ESOKZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Infotype\" />\n" + 
			"				<Property Name=\"EWERK\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Plant\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_KREDW\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SORTL\" />\n" + 
			"					<PropertyRef Name=\"PSTLZ\" />\n" + 
			"					<PropertyRef Name=\"MCOD3\" />\n" + 
			"					<PropertyRef Name=\"MCOD1\" />\n" + 
			"					<PropertyRef Name=\"WERKS\" />\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BEGRU\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Authorization\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SORTL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Search Term\" />\n" + 
			"				<Property Name=\"LAND1\" Type=\"Edm.String\" MaxLength=\"3\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"PSTLZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Postal Code\" />\n" + 
			"				<Property Name=\"MCOD3\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"City\" />\n" + 
			"				<Property Name=\"MCOD1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"Vendor Name\" />\n" + 
			"				<Property Name=\"WERKS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Plant\" />\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:text=\"MCOD1\"\n" + 
			"					sap:label=\"Vendor\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_RELIFNRCN\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"					<PropertyRef Name=\"NAME_FIRST\" />\n" + 
			"					<PropertyRef Name=\"NAME_LAST\" />\n" + 
			"					<PropertyRef Name=\"NAME_ORG1\" />\n" + 
			"					<PropertyRef Name=\"NAME_ORG2\" />\n" + 
			"					<PropertyRef Name=\"RECNNR\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"RECNTYPE\" />\n" + 
			"					<PropertyRef Name=\"MC_NAME1\" />\n" + 
			"					<PropertyRef Name=\"MC_NAME2\" />\n" + 
			"					<PropertyRef Name=\"RECNBEG\" />\n" + 
			"					<PropertyRef Name=\"RECNENDABS\" />\n" + 
			"					<PropertyRef Name=\"RECNNOTPER\" />\n" + 
			"					<PropertyRef Name=\"RECNTXTOLD\" />\n" + 
			"					<PropertyRef Name=\"RECNNRCOLLECT\" />\n" + 
			"					<PropertyRef Name=\"RECNTXT\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:text=\"MC_NAME1\"\n" + 
			"					sap:label=\"Vendor\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"NAME_FIRST\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"First name\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"NAME_LAST\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Last name\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"NAME_ORG1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Name 1\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"NAME_ORG2\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Name 2\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"RECNNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"13\" sap:display-format=\"UpperCase\" sap:label=\"Contract\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"RECNTYPE\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Contract Type\" />\n" + 
			"				<Property Name=\"MC_NAME1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"35\" sap:display-format=\"UpperCase\" sap:label=\"Name 1/last nm\" />\n" + 
			"				<Property Name=\"MC_NAME2\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"35\" sap:display-format=\"UpperCase\" sap:label=\"Name2/first nme\" />\n" + 
			"				<Property Name=\"RECNBEG\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Contract Start\" />\n" + 
			"				<Property Name=\"RECNENDABS\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"End of Term\" />\n" + 
			"				<Property Name=\"RECNNOTPER\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Notice Per\" />\n" + 
			"				<Property Name=\"RECNTXTOLD\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"20\" sap:display-format=\"UpperCase\" sap:label=\"Old contract\" />\n" + 
			"				<Property Name=\"RECNNRCOLLECT\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"13\" sap:display-format=\"UpperCase\" sap:label=\"Main Contract\" />\n" + 
			"				<Property Name=\"RECNTXT\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"80\" sap:label=\"Contract name\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T001\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:text=\"BUTXT\"\n" + 
			"					sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"BUTXT\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:label=\"Company Name\" />\n" + 
			"				<Property Name=\"ORT01\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:label=\"City\" />\n" + 
			"				<Property Name=\"WAERS\" Type=\"Edm.String\" MaxLength=\"5\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Currency\" sap:semantics=\"currency-code\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T077K\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"KTOKK\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"KTOKK\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:text=\"TXT30\"\n" + 
			"					sap:label=\"Account Group\" />\n" + 
			"				<Property Name=\"NUMKR\" Type=\"Edm.String\" MaxLength=\"2\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Number range\" />\n" + 
			"				<Property Name=\"XCPDS\" Type=\"Edm.Boolean\" sap:label=\"One-time acct\" />\n" + 
			"				<Property Name=\"TXT30\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Meaning\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T001S\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"BUSAB\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"BUSAB\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"UpperCase\" sap:text=\"SNAME\"\n" + 
			"					sap:label=\"Acctg Clerk\" />\n" + 
			"				<Property Name=\"SNAME\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Acctg clerk\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CT_TCESSION\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"COMPANY\" />\n" + 
			"					<PropertyRef Name=\"CESSION_KZ\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"COMPANY\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"CESSION_KZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"UpperCase\" sap:label=\"AR Pledging\" />\n" + 
			"				<Property Name=\"CESSION_TEXT\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"AR pled. text\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CT_TCURC\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"WAERS\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"WAERS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"UpperCase\" sap:label=\"Currency\"\n" + 
			"					sap:semantics=\"currency-code\" />\n" + 
			"				<Property Name=\"LTEXT\" Type=\"Edm.String\" MaxLength=\"40\"\n" + 
			"					sap:label=\"Long Text\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_TGSB\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"GSBER\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"GSBER\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:text=\"GTEXT\"\n" + 
			"					sap:label=\"Business Area\" />\n" + 
			"				<Property Name=\"GTEXT\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"BA Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_J_1BBRANHV\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"BRANCH\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"BRANCH\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Business Place\" />\n" + 
			"				<Property Name=\"NAME\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Name 1\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T880\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"RCOMP\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"RCOMP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"6\" sap:display-format=\"UpperCase\" sap:text=\"NAME1\"\n" + 
			"					sap:label=\"Company\" />\n" + 
			"				<Property Name=\"NAME1\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Name\" />\n" + 
			"				<Property Name=\"CNTRY\" Type=\"Edm.String\" MaxLength=\"3\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"CURR\" Type=\"Edm.String\" MaxLength=\"5\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Currency\" sap:semantics=\"currency-code\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CT_CSKS\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"KOKRS\" />\n" + 
			"					<PropertyRef Name=\"KOSTL\" />\n" + 
			"					<PropertyRef Name=\"DATBI\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"KOKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"CO Area\" />\n" + 
			"				<Property Name=\"KOSTL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Cost Center\" />\n" + 
			"				<Property Name=\"DATBI\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Valid To\" />\n" + 
			"				<Property Name=\"KTEXT\" Type=\"Edm.String\" MaxLength=\"20\"\n" + 
			"					sap:label=\"Profit Center Name\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_FARP_T005\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"LAND1\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"LAND1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"LANDX\" Type=\"Edm.String\" MaxLength=\"15\"\n" + 
			"					sap:label=\"Name\" />\n" + 
			"				<Property Name=\"NATIO\" Type=\"Edm.String\" MaxLength=\"15\"\n" + 
			"					sap:label=\"Nationality\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T014\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"KKBER\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"KKBER\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:text=\"KKBTX\"\n" + 
			"					sap:label=\"Credit Control Area\" />\n" + 
			"				<Property Name=\"KKBTX\" Type=\"Edm.String\" MaxLength=\"35\"\n" + 
			"					sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T003\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BLART\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BLART\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"UpperCase\" sap:text=\"LTEXT\"\n" + 
			"					sap:label=\"Document Type\" />\n" + 
			"				<Property Name=\"LTEXT\" Type=\"Edm.String\" MaxLength=\"20\"\n" + 
			"					sap:label=\"Document Type Name\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T047M\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"MABER\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"MABER\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"UpperCase\" sap:label=\"Dunning Area\" />\n" + 
			"				<Property Name=\"TEXT1\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T040S\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"MANSP\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"MANSP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:text=\"TEXT1\"\n" + 
			"					sap:label=\"Dunning Block\" />\n" + 
			"				<Property Name=\"TEXT1\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T040\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"MSCHL\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"MSCHL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:text=\"TEXT1\"\n" + 
			"					sap:label=\"Dunning Key\" />\n" + 
			"				<Property Name=\"TEXT1\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_TZB0A\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"RANTYP\" />\n" + 
			"					<PropertyRef Name=\"SBEWART\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"RANTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Contract Type\" />\n" + 
			"				<Property Name=\"SBEWART\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Flow Type\" />\n" + 
			"				<Property Name=\"XBEWART\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Name\" />\n" + 
			"				<Property Name=\"SBEWZITI\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Flow category\" />\n" + 
			"				<Property Name=\"SSOLHAB\" Type=\"Edm.String\" MaxLength=\"1\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Debit/Credit\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_GL_ACCT_CA_NO\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SAKNR\" />\n" + 
			"					<PropertyRef Name=\"KTOPL\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"SAKNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L Account\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"TXT50\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Long Text\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SAKAN\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"G/L account\" />\n" + 
			"				<Property Name=\"KTOPL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Chart of Accts\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_GL_ACCT_CA_TEXT\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SAKNR\" />\n" + 
			"					<PropertyRef Name=\"SPRAS\" />\n" + 
			"					<PropertyRef Name=\"KTOPL\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"SAKNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L Account\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"TXT50\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Long Text\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"MCOD1\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Long text\" />\n" + 
			"				<Property Name=\"SPRAS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:label=\"Language\" />\n" + 
			"				<Property Name=\"KTOPL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Chart of Accts\" />\n" + 
			"				<Property Name=\"SAKAN\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"G/L account\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_GL_ACCT_CA_FLAGS\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SAKNR\" />\n" + 
			"					<PropertyRef Name=\"KTOPL\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"SAKNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L Account\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"TXT50\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Long Text\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SAKAN\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"G/L account\" />\n" + 
			"				<Property Name=\"KTOPL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Chart of Accts\" />\n" + 
			"				<Property Name=\"XLOEV\" Type=\"Edm.Boolean\" sap:label=\"Deletion flag\" />\n" + 
			"				<Property Name=\"XSPEB\" Type=\"Edm.Boolean\" sap:label=\"Posting Block\" />\n" + 
			"				<Property Name=\"XSPEA\" Type=\"Edm.Boolean\" sap:label=\"Creation block\" />\n" + 
			"				<Property Name=\"XSPEP\" Type=\"Edm.Boolean\" sap:label=\"Planning block\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_GL_ACCT_CA_KEY\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SAKNR\" />\n" + 
			"					<PropertyRef Name=\"SCHLW\" />\n" + 
			"					<PropertyRef Name=\"SPRAS\" />\n" + 
			"					<PropertyRef Name=\"KTOPL\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"SAKNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L Account\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"TXT50\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Long Text\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SCHLW\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"30\" sap:display-format=\"UpperCase\" sap:label=\"Keyword\" />\n" + 
			"				<Property Name=\"SPRAS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:label=\"Language\" />\n" + 
			"				<Property Name=\"KTOPL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Chart of Accts\" />\n" + 
			"				<Property Name=\"SAKAN\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"G/L account\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_GL_ACCT_CC_NO\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SAKNR\" />\n" + 
			"					<PropertyRef Name=\"SAKAN\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"SAKNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L Account\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"TXT50\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Long Text\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SAKAN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L account\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_GL_ACCT_CC_TEXT\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SAKNR\" />\n" + 
			"					<PropertyRef Name=\"TXT50\" />\n" + 
			"					<PropertyRef Name=\"MCODF\" />\n" + 
			"					<PropertyRef Name=\"SPRAS\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"SAKAN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"SAKNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L Account\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"TXT50\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"50\" sap:label=\"Long Text\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"MCODF\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"Long text\" />\n" + 
			"				<Property Name=\"SPRAS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:label=\"Language\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"SAKAN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L account\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_GL_ACCT_CC_FLAGS\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SAKNR\" />\n" + 
			"					<PropertyRef Name=\"TXT50\" />\n" + 
			"					<PropertyRef Name=\"XLOEV_KTP\" />\n" + 
			"					<PropertyRef Name=\"XSPEB_KTP\" />\n" + 
			"					<PropertyRef Name=\"SAKAN\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"XLOEV\" />\n" + 
			"					<PropertyRef Name=\"XSPEB\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"SAKNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L Account\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"TXT50\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"50\" sap:label=\"Long Text\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"XLOEV_KTP\" Type=\"Edm.Boolean\" Nullable=\"false\"\n" + 
			"					sap:label=\"Del.flag for ch/acct\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"XSPEB_KTP\" Type=\"Edm.Boolean\" Nullable=\"false\"\n" + 
			"					sap:label=\"Ch/acct post.blk\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SAKAN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L account\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"XLOEV\" Type=\"Edm.Boolean\" Nullable=\"false\"\n" + 
			"					sap:label=\"Deletion flag\" />\n" + 
			"				<Property Name=\"XSPEB\" Type=\"Edm.Boolean\" Nullable=\"false\"\n" + 
			"					sap:label=\"Posting Block\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_GL_ACCT_CC_ALTERNATIV_NO\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SAKNR\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"SAKAN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"SAKNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L Account\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"TXT50\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Long Text\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"ALTKT\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Altern. Account\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"SAKAN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"G/L account\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T012\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"HBKID\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BANKA\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Bank name\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"ORT01\" Type=\"Edm.String\" MaxLength=\"35\"\n" + 
			"					sap:label=\"City\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"HBKID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"UpperCase\" sap:label=\"House Bank\" />\n" + 
			"				<Property Name=\"BANKS\" Type=\"Edm.String\" MaxLength=\"3\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Bank Country\" />\n" + 
			"				<Property Name=\"BANKL\" Type=\"Edm.String\" MaxLength=\"15\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Bank Key\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T016\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BRSCH\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BRSCH\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:text=\"BRTXT\"\n" + 
			"					sap:label=\"Industry\" />\n" + 
			"				<Property Name=\"BRTXT\" Type=\"Edm.String\" MaxLength=\"20\"\n" + 
			"					sap:label=\"Industry Name\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CT_T015W1\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"DTWSC\" />\n" + 
			"					<PropertyRef Name=\"DTWSF\" />\n" + 
			"					<PropertyRef Name=\"DTWSX\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"DTWSC\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"UpperCase\" sap:label=\"App.area\" />\n" + 
			"				<Property Name=\"DTWSF\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Field no.\" />\n" + 
			"				<Property Name=\"DTWSX\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"NonNegative\" sap:label=\"Instructions\" />\n" + 
			"				<Property Name=\"TEXT\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Text\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T056\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"VZSKZ\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"VZSKZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"UpperCase\" sap:text=\"VTEXT\"\n" + 
			"					sap:label=\"Interest Indic.\" />\n" + 
			"				<Property Name=\"VTEXT\" Type=\"Edm.String\" MaxLength=\"20\"\n" + 
			"					sap:label=\"Name\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CT_T008\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"ZAHLS\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"ZAHLS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Payment block\" />\n" + 
			"				<Property Name=\"TEXTL\" Type=\"Edm.String\" MaxLength=\"20\"\n" + 
			"					sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CH_ANLH\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"ANLN1\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"ANLN1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"12\" sap:display-format=\"UpperCase\" sap:label=\"Main Asset No.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T042Z\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"LAND1\" />\n" + 
			"					<PropertyRef Name=\"ZLSCH\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"TEXT1\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Name\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"LAND1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"ZLSCH\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Pymt Meth.\" />\n" + 
			"				<Property Name=\"TEXT2\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T001W\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"CITY1\" />\n" + 
			"					<PropertyRef Name=\"NAME1\" />\n" + 
			"					<PropertyRef Name=\"SORT2\" />\n" + 
			"					<PropertyRef Name=\"SORT1\" />\n" + 
			"					<PropertyRef Name=\"POST_CODE1\" />\n" + 
			"					<PropertyRef Name=\"MC_CITY1\" />\n" + 
			"					<PropertyRef Name=\"NAME2\" />\n" + 
			"					<PropertyRef Name=\"MC_NAME1\" />\n" + 
			"					<PropertyRef Name=\"NATION\" />\n" + 
			"					<PropertyRef Name=\"WERKS\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"CITY1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"City\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"NAME1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Name\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SORT2\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"20\" sap:display-format=\"UpperCase\" sap:label=\"Search Term 2\" />\n" + 
			"				<Property Name=\"SORT1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"20\" sap:display-format=\"UpperCase\" sap:label=\"Search Term 1\" />\n" + 
			"				<Property Name=\"POST_CODE1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Postal Code\" />\n" + 
			"				<Property Name=\"MC_CITY1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"City\" />\n" + 
			"				<Property Name=\"NAME2\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Name 2\" />\n" + 
			"				<Property Name=\"MC_NAME1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:display-format=\"UpperCase\" sap:label=\"Name\" />\n" + 
			"				<Property Name=\"NATION\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Address Version\" />\n" + 
			"				<Property Name=\"WERKS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:text=\"NAME1\"\n" + 
			"					sap:label=\"Plant\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_TBSL\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BSCHL\" />\n" + 
			"					<PropertyRef Name=\"KOART\" />\n" + 
			"					<PropertyRef Name=\"SHKZG\" />\n" + 
			"					<PropertyRef Name=\"LTEXT\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BSCHL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"UpperCase\" sap:text=\"LTEXT\"\n" + 
			"					sap:label=\"Posting Key\" />\n" + 
			"				<Property Name=\"KOART\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Account Type\" />\n" + 
			"				<Property Name=\"SHKZG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Debit/Credit\" />\n" + 
			"				<Property Name=\"LTEXT\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"20\" sap:label=\"Name\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_PRCTN\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"DATBI\" />\n" + 
			"					<PropertyRef Name=\"PRCTR\" />\n" + 
			"					<PropertyRef Name=\"KOKRS\" />\n" + 
			"					<PropertyRef Name=\"VERAPC\" />\n" + 
			"					<PropertyRef Name=\"VERAK_USER\" />\n" + 
			"					<PropertyRef Name=\"MCTXT\" />\n" + 
			"					<PropertyRef Name=\"SPRAS\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"DATBI\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Valid To\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"PRCTR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Profit Center\" />\n" + 
			"				<Property Name=\"KOKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"CO Area\" />\n" + 
			"				<Property Name=\"VERAPC\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"20\" sap:label=\"Person Respons.\" />\n" + 
			"				<Property Name=\"VERAK_USER\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"12\" sap:display-format=\"UpperCase\" sap:label=\"User Responsible\" />\n" + 
			"				<Property Name=\"MCTXT\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"20\" sap:display-format=\"UpperCase\" sap:label=\"PrCtr text\" />\n" + 
			"				<Property Name=\"SPRAS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:label=\"Language\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_PRCTS\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"DATBI\" />\n" + 
			"					<PropertyRef Name=\"MCTXT\" />\n" + 
			"					<PropertyRef Name=\"SPRAS\" />\n" + 
			"					<PropertyRef Name=\"KOKRS\" />\n" + 
			"					<PropertyRef Name=\"PRCTR\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"DATBI\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Valid To\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"MCTXT\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"20\" sap:display-format=\"UpperCase\" sap:label=\"PrCtr text\" />\n" + 
			"				<Property Name=\"SPRAS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:label=\"Language\" />\n" + 
			"				<Property Name=\"KOKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"CO Area\" />\n" + 
			"				<Property Name=\"PRCTR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Profit Center\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CH_EKPO\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKA\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"ANLN1\" />\n" + 
			"					<PropertyRef Name=\"ANLN2\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"					<PropertyRef Name=\"ZEKKN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"ANLN1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"12\" sap:display-format=\"UpperCase\" sap:label=\"Main Asset No.\" />\n" + 
			"				<Property Name=\"ANLN2\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Subnumber\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\" />\n" + 
			"				<Property Name=\"ZEKKN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"NonNegative\" sap:label=\"Seq.No.Acc.Ass.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKB\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BEDNR\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"BSART\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BEDNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Tracking Number\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\" />\n" + 
			"				<Property Name=\"BSART\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Document Type\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKC\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"BEDAT\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"BEDAT\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Document Date\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKD\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"BEDAT\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"BEDAT\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Document Date\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKE\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BANFN\" />\n" + 
			"					<PropertyRef Name=\"BNFPO\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"					<PropertyRef Name=\"ETENR\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BANFN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchase Req.\" />\n" + 
			"				<Property Name=\"BNFPO\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Requisn Item\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\" />\n" + 
			"				<Property Name=\"ETENR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"NonNegative\" sap:label=\"Schedule Line\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKG\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"AUFNR\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"					<PropertyRef Name=\"ZEKKN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"AUFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"12\" sap:display-format=\"UpperCase\" sap:label=\"Order\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\" />\n" + 
			"				<Property Name=\"ZEKKN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"NonNegative\" sap:label=\"Seq.No.Acc.Ass.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKH\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"WERKS\" />\n" + 
			"					<PropertyRef Name=\"MATKL\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"TXZ01\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"WERKS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Plant\" />\n" + 
			"				<Property Name=\"MATKL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"9\" sap:display-format=\"UpperCase\" sap:label=\"Material Group\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"TXZ01\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Short Text\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKI\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"WERKS\" />\n" + 
			"					<PropertyRef Name=\"MATKL\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"TXZ01\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"WERKS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Plant\" />\n" + 
			"				<Property Name=\"MATKL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"9\" sap:display-format=\"UpperCase\" sap:label=\"Material Group\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"TXZ01\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Short Text\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKK\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"KOSTL\" />\n" + 
			"					<PropertyRef Name=\"KOKRS\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"					<PropertyRef Name=\"ZEKKN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"KOSTL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Cost Center\" />\n" + 
			"				<Property Name=\"KOKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"CO Area\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\" />\n" + 
			"				<Property Name=\"ZEKKN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"NonNegative\" sap:label=\"Seq.No.Acc.Ass.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKL\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EKGRP\" />\n" + 
			"					<PropertyRef Name=\"BEDAT\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"BSART\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Vendor\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EKGRP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"Purch. Group\" />\n" + 
			"				<Property Name=\"BEDAT\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Document Date\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\" />\n" + 
			"				<Property Name=\"BSART\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Order Type\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKM\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"MATNR\" />\n" + 
			"					<PropertyRef Name=\"WERKS\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"BSART\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"MATNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"18\" sap:display-format=\"UpperCase\" sap:label=\"Material\" />\n" + 
			"				<Property Name=\"WERKS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Plant\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\" />\n" + 
			"				<Property Name=\"BSART\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Order Type\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKN\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"NPLNR\" />\n" + 
			"					<PropertyRef Name=\"AUFPL\" />\n" + 
			"					<PropertyRef Name=\"APLZL\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"					<PropertyRef Name=\"ZEKKN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"NPLNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"12\" sap:display-format=\"UpperCase\" sap:label=\"Network\" />\n" + 
			"				<Property Name=\"AUFPL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"NonNegative\" sap:label=\"Plan no.f.oper.\" />\n" + 
			"				<Property Name=\"APLZL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"8\" sap:display-format=\"NonNegative\" sap:label=\"Counter\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\" />\n" + 
			"				<Property Name=\"ZEKKN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"NonNegative\" sap:label=\"Seq.No.Acc.Ass.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKP\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"PS_PSP_PNR\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"					<PropertyRef Name=\"ZEKKN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"PS_PSP_PNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"24\" sap:display-format=\"NonNegative\" sap:label=\"WBS Element\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"POSID\" Type=\"Edm.String\" MaxLength=\"24\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"WBS element\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\" />\n" + 
			"				<Property Name=\"ZEKKN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"NonNegative\" sap:label=\"Seq.No.Acc.Ass.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKS\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SUBMI\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"SUBMI\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Collective No.\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKT\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"BEDAT\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"BEDAT\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Document Date\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKU\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"BEDAT\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"BEDAT\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Document Date\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKV\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"VETEN\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"					<PropertyRef Name=\"ZEKKN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"VBELN\" Type=\"Edm.String\" MaxLength=\"10\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"SD Document No.\" />\n" + 
			"				<Property Name=\"VBELP\" Type=\"Edm.String\" MaxLength=\"6\"\n" + 
			"					sap:display-format=\"NonNegative\" sap:label=\"Item\" />\n" + 
			"				<Property Name=\"VETEN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"NonNegative\" sap:label=\"Schedule Line\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\" />\n" + 
			"				<Property Name=\"ZEKKN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"NonNegative\" sap:label=\"Seq.No.Acc.Ass.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MEKKW\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"RESWK\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"EKGRP\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"RESWK\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Supplying Plant\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\" />\n" + 
			"				<Property Name=\"EKGRP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"Purch. Group\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MMBSI_MEKK_DBSH_CC_E\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"AEDAT\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"					<PropertyRef Name=\"ZTERM\" />\n" + 
			"					<PropertyRef Name=\"HIERARCHY_EXISTS\" />\n" + 
			"					<PropertyRef Name=\"WAERS\" />\n" + 
			"					<PropertyRef Name=\"THRESHOLD_EXISTS\" />\n" + 
			"					<PropertyRef Name=\"KTMNG\" />\n" + 
			"					<PropertyRef Name=\"KTWRT\" />\n" + 
			"					<PropertyRef Name=\"STATU\" />\n" + 
			"					<PropertyRef Name=\"LOEKZ\" />\n" + 
			"					<PropertyRef Name=\"MEINS\" />\n" + 
			"					<PropertyRef Name=\"MMBSI_MENGE\" />\n" + 
			"					<PropertyRef Name=\"MMBSI_NETWR\" />\n" + 
			"					<PropertyRef Name=\"NETPR\" />\n" + 
			"					<PropertyRef Name=\"RELEASE_DATE\" />\n" + 
			"					<PropertyRef Name=\"SRM_CONTRACT_ID\" />\n" + 
			"					<PropertyRef Name=\"SRM_CONTRACT_ITM\" />\n" + 
			"					<PropertyRef Name=\"DESCRIPTION\" />\n" + 
			"					<PropertyRef Name=\"MATNR\" />\n" + 
			"					<PropertyRef Name=\"TXZ01\" />\n" + 
			"					<PropertyRef Name=\"WERKS\" />\n" + 
			"					<PropertyRef Name=\"KDATB\" />\n" + 
			"					<PropertyRef Name=\"KDATE\" />\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"PSTYP\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"AEDAT\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Changed on\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"ZTERM\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Payment Terms\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"HIERARCHY_EXISTS\" Type=\"Edm.Boolean\"\n" + 
			"					Nullable=\"false\" sap:label=\"Contract Hierarchy\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"WAERS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"UpperCase\" sap:label=\"Currency\"\n" + 
			"					sap:filterable=\"false\" sap:semantics=\"currency-code\" />\n" + 
			"				<Property Name=\"THRESHOLD_EXISTS\" Type=\"Edm.Boolean\"\n" + 
			"					Nullable=\"false\" sap:label=\"Thresh. Val. Exists\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"KTMNG\" Type=\"Edm.Decimal\" Nullable=\"false\"\n" + 
			"					Precision=\"13\" Scale=\"3\" sap:label=\"Target Quantity\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"KTWRT\" Type=\"Edm.Decimal\" Nullable=\"false\"\n" + 
			"					Precision=\"15\" Scale=\"2\" sap:label=\"Target Value\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"STATU\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Status\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"LOEKZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Deletion Ind.\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"MEINS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:label=\"Base Unit\" sap:filterable=\"false\"\n" + 
			"					sap:semantics=\"unit-of-measure\" />\n" + 
			"				<Property Name=\"MMBSI_MENGE\" Type=\"Edm.Decimal\" Nullable=\"false\"\n" + 
			"					Precision=\"13\" Scale=\"3\" sap:label=\"Release Quantity\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"MMBSI_NETWR\" Type=\"Edm.Decimal\" Nullable=\"false\"\n" + 
			"					Precision=\"15\" Scale=\"2\" sap:label=\"Release Value\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"NETPR\" Type=\"Edm.Decimal\" Nullable=\"false\"\n" + 
			"					Precision=\"11\" Scale=\"2\" sap:label=\"Net Price\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"RELEASE_DATE\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Released On\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SRM_CONTRACT_ID\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"10\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Central Contract\" />\n" + 
			"				<Property Name=\"SRM_CONTRACT_ITM\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"10\" sap:display-format=\"NonNegative\"\n" + 
			"					sap:label=\"Cent. Contract Item\" />\n" + 
			"				<Property Name=\"DESCRIPTION\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Contract Name\" />\n" + 
			"				<Property Name=\"MATNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"18\" sap:display-format=\"UpperCase\" sap:label=\"Material\" />\n" + 
			"				<Property Name=\"TXZ01\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Short Text\" />\n" + 
			"				<Property Name=\"WERKS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Plant\" />\n" + 
			"				<Property Name=\"KDATB\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Validity Start\" />\n" + 
			"				<Property Name=\"KDATE\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Validity End\" />\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Vendor\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\" />\n" + 
			"				<Property Name=\"PSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Item Category\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_MMBSI_MEKK_TREX_CC_E\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"ZTERM\" />\n" + 
			"					<PropertyRef Name=\"WERKS\" />\n" + 
			"					<PropertyRef Name=\"WAERS\" />\n" + 
			"					<PropertyRef Name=\"TXZ01\" />\n" + 
			"					<PropertyRef Name=\"THRESHOLD_EXISTS\" />\n" + 
			"					<PropertyRef Name=\"STATU\" />\n" + 
			"					<PropertyRef Name=\"SRM_CONTRACT_ITM\" />\n" + 
			"					<PropertyRef Name=\"SRM_CONTRACT_ID\" />\n" + 
			"					<PropertyRef Name=\"SxRPxMODE_FUZZY\" />\n" + 
			"					<PropertyRef Name=\"REQUEST\" />\n" + 
			"					<PropertyRef Name=\"RELEASE_DATE\" />\n" + 
			"					<PropertyRef Name=\"PSTYP\" />\n" + 
			"					<PropertyRef Name=\"OBJECT_TYPE_ID\" />\n" + 
			"					<PropertyRef Name=\"NETPR\" />\n" + 
			"					<PropertyRef Name=\"MMBSI_NETWR\" />\n" + 
			"					<PropertyRef Name=\"MMBSI_MENGE\" />\n" + 
			"					<PropertyRef Name=\"MEINS\" />\n" + 
			"					<PropertyRef Name=\"MATNR\" />\n" + 
			"					<PropertyRef Name=\"LOEKZ\" />\n" + 
			"					<PropertyRef Name=\"LIFNR\" />\n" + 
			"					<PropertyRef Name=\"KTWRT\" />\n" + 
			"					<PropertyRef Name=\"KTMNG\" />\n" + 
			"					<PropertyRef Name=\"KDATE\" />\n" + 
			"					<PropertyRef Name=\"KDATB\" />\n" + 
			"					<PropertyRef Name=\"HIERACHY_EXISTS\" />\n" + 
			"					<PropertyRef Name=\"EKORG\" />\n" + 
			"					<PropertyRef Name=\"EBELP\" />\n" + 
			"					<PropertyRef Name=\"EBELN\" />\n" + 
			"					<PropertyRef Name=\"DESCRIPTION\" />\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"BSTYP\" />\n" + 
			"					<PropertyRef Name=\"AEDAT\" />\n" + 
			"					<PropertyRef Name=\"SxRPxSEARCH_TERM\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"ZTERM\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Payment Terms\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"WERKS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Plant\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"WAERS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"UpperCase\" sap:label=\"Currency\"\n" + 
			"					sap:filterable=\"false\" sap:semantics=\"currency-code\" />\n" + 
			"				<Property Name=\"TXZ01\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Short Text\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"THRESHOLD_EXISTS\" Type=\"Edm.Boolean\"\n" + 
			"					Nullable=\"false\" sap:label=\"Thresh. Val. Exists\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"STATU\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Status\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SRM_CONTRACT_ITM\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"10\" sap:display-format=\"NonNegative\"\n" + 
			"					sap:label=\"Cent. Contract Item\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SRM_CONTRACT_ID\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"10\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Central Contract\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SxRPxMODE_FUZZY\" Type=\"Edm.Boolean\"\n" + 
			"					Nullable=\"false\" sap:label=\"TRUE\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"REQUEST\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"32\" sap:display-format=\"UpperCase\" sap:label=\"Request Type ID\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"RELEASE_DATE\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Released On\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"PSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Item Category\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"OBJECT_TYPE_ID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"20\" sap:display-format=\"UpperCase\" sap:label=\"Object Type\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"NETPR\" Type=\"Edm.Decimal\" Nullable=\"false\"\n" + 
			"					Precision=\"11\" Scale=\"2\" sap:label=\"Net Price\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"MMBSI_NETWR\" Type=\"Edm.Decimal\" Nullable=\"false\"\n" + 
			"					Precision=\"15\" Scale=\"2\" sap:label=\"Release Value\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"MMBSI_MENGE\" Type=\"Edm.Decimal\" Nullable=\"false\"\n" + 
			"					Precision=\"13\" Scale=\"3\" sap:label=\"Release Quantity\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"MEINS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:label=\"Base Unit\" sap:filterable=\"false\"\n" + 
			"					sap:semantics=\"unit-of-measure\" />\n" + 
			"				<Property Name=\"MATNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"18\" sap:display-format=\"UpperCase\" sap:label=\"Material\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"LOEKZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Deletion Ind.\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"LIFNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Vendor\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"KTWRT\" Type=\"Edm.Decimal\" Nullable=\"false\"\n" + 
			"					Precision=\"15\" Scale=\"2\" sap:label=\"Target Value\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"KTMNG\" Type=\"Edm.Decimal\" Nullable=\"false\"\n" + 
			"					Precision=\"13\" Scale=\"3\" sap:label=\"Target Quantity\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"KDATE\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Validity End\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"KDATB\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Validity Start\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"HIERACHY_EXISTS\" Type=\"Edm.Boolean\"\n" + 
			"					Nullable=\"false\" sap:label=\"Contract Hierarchy\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"EKORG\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Org.\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"EBELP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"NonNegative\" sap:label=\"Purchasing Doc. Item\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"EBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Purchasing Document\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"DESCRIPTION\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Contract Name\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"BSTYP\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Doc. Category\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"AEDAT\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" + 
			"					Precision=\"0\" sap:display-format=\"Date\" sap:label=\"Changed on\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"SxRPxSEARCH_TERM\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"45\" sap:label=\"Search Term\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CT_T053R\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"RSTGR\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"RSTGR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"Reason Code\" />\n" + 
			"				<Property Name=\"TXT20\" Type=\"Edm.String\" MaxLength=\"20\"\n" + 
			"					sap:label=\"Short text\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_FARP_T005S\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"LAND1\" />\n" + 
			"					<PropertyRef Name=\"BLAND\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"LAND1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"Country\" />\n" + 
			"				<Property Name=\"BLAND\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"Region\" />\n" + 
			"				<Property Name=\"BEZEI\" Type=\"Edm.String\" MaxLength=\"20\"\n" + 
			"					sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_SH_T007A\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"KALSM\" />\n" + 
			"					<PropertyRef Name=\"MWSKZ\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"KALSM\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"6\" sap:display-format=\"UpperCase\" sap:label=\"Procedure\" />\n" + 
			"				<Property Name=\"MWSKZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"UpperCase\" sap:label=\"Tax Code\" />\n" + 
			"				<Property Name=\"TEXT1\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CH_VBEP\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"VBELN\" />\n" + 
			"					<PropertyRef Name=\"POSNR\" />\n" + 
			"					<PropertyRef Name=\"ETENR\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"VBELN\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Sales Document\" />\n" + 
			"				<Property Name=\"POSNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"6\" sap:display-format=\"NonNegative\" sap:label=\"Item\" />\n" + 
			"				<Property Name=\"ETENR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"NonNegative\" sap:label=\"Schedule Line\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_SECCODE\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"SECCODE\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"NAME\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Name 1\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"SECCODE\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Section Code\" />\n" + 
			"				<Property Name=\"BPLACE\" Type=\"Edm.String\" MaxLength=\"4\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Business Place\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_T074U\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"KOART\" />\n" + 
			"					<PropertyRef Name=\"UMSKZ\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"KOART\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Account Type\" />\n" + 
			"				<Property Name=\"UMSKZ\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:display-format=\"UpperCase\" sap:label=\"Special G/L ind\" />\n" + 
			"				<Property Name=\"LTEXT\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CH_ANLA\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"ANLN1\" />\n" + 
			"					<PropertyRef Name=\"ANLN2\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"ANLN1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"12\" sap:display-format=\"UpperCase\" sap:label=\"Main Asset No.\" />\n" + 
			"				<Property Name=\"ANLN2\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Subnumber\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_TTXJ\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"KALSM\" />\n" + 
			"					<PropertyRef Name=\"TXJCD\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"KALSM\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"6\" sap:display-format=\"UpperCase\" sap:label=\"Schema\" />\n" + 
			"				<Property Name=\"TXJCD\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"15\" sap:display-format=\"UpperCase\" sap:label=\"Tax Jur.\" />\n" + 
			"				<Property Name=\"TEXT1\" Type=\"Edm.String\" MaxLength=\"50\"\n" + 
			"					sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_H_TTXID\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"TDOBJECT\" />\n" + 
			"					<PropertyRef Name=\"TDID\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"TDOBJECT\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Text Object\" />\n" + 
			"				<Property Name=\"TDID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:text=\"TDTEXT\"\n" + 
			"					sap:label=\"Text ID\" />\n" + 
			"				<Property Name=\"TDTEXT\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Meaning\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_CT_T043G\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"BUKRS\" />\n" + 
			"					<PropertyRef Name=\"TOGRU\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"BUKRS\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company Code\" />\n" + 
			"				<Property Name=\"TOGRU\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Tolerance Group\" />\n" + 
			"				<Property Name=\"TXT30\" Type=\"Edm.String\" MaxLength=\"30\"\n" + 
			"					sap:label=\"Name\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_PRPMP\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"POST1\" />\n" + 
			"					<PropertyRef Name=\"POSTU\" />\n" + 
			"					<PropertyRef Name=\"POSKI\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"POST1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Description\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"POSTU\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:display-format=\"UpperCase\" sap:label=\"Description\" />\n" + 
			"				<Property Name=\"PSPID\" Type=\"Edm.String\" MaxLength=\"24\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:label=\"Project def.\" />\n" + 
			"				<Property Name=\"POSID\" Type=\"Edm.String\" MaxLength=\"24\"\n" + 
			"					sap:display-format=\"UpperCase\" sap:text=\"POSTU\" sap:label=\"WBS element\" />\n" + 
			"				<Property Name=\"POSKI\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"16\" sap:display-format=\"UpperCase\" sap:label=\"Short ID\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_PRPMK\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"POST1\" />\n" + 
			"					<PropertyRef Name=\"POSKI\" />\n" + 
			"					<PropertyRef Name=\"POSID\" />\n" + 
			"					<PropertyRef Name=\"POSTU\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"POST1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Description\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"POSKI\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"16\" sap:display-format=\"UpperCase\" sap:label=\"Short ID\" />\n" + 
			"				<Property Name=\"POSID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"24\" sap:display-format=\"UpperCase\" sap:text=\"POSTU\"\n" + 
			"					sap:label=\"WBS element\" />\n" + 
			"				<Property Name=\"POSTU\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:display-format=\"UpperCase\" sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_PRPMZ\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"VERNA\" />\n" + 
			"					<PropertyRef Name=\"VERNR\" />\n" + 
			"					<PropertyRef Name=\"POSID\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"VERNA\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"25\" sap:label=\"Pers.Resp.Name\" />\n" + 
			"				<Property Name=\"VERNR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"8\" sap:display-format=\"NonNegative\" sap:label=\"Pers.Resp.No.\" />\n" + 
			"				<Property Name=\"POSID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"24\" sap:display-format=\"UpperCase\" sap:label=\"WBS element\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_PRPMA\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"POST1\" />\n" + 
			"					<PropertyRef Name=\"POSID\" />\n" + 
			"					<PropertyRef Name=\"POSTU\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"POST1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Description\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"POSID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"24\" sap:display-format=\"UpperCase\" sap:text=\"POSTU\"\n" + 
			"					sap:label=\"WBS element\" />\n" + 
			"				<Property Name=\"POSTU\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:display-format=\"UpperCase\" sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_PRPMB\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"POST1\" />\n" + 
			"					<PropertyRef Name=\"POSID\" />\n" + 
			"					<PropertyRef Name=\"POSTU\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"POST1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Description\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"POSID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"24\" sap:display-format=\"UpperCase\" sap:text=\"POSTU\"\n" + 
			"					sap:label=\"WBS element\" />\n" + 
			"				<Property Name=\"POSTU\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:display-format=\"UpperCase\" sap:label=\"Description\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_CN_LDST_PS_PR\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"SHORTTEXT\" />\n" + 
			"					<PropertyRef Name=\"PSPID\" />\n" + 
			"					<PropertyRef Name=\"POSID\" />\n" + 
			"					<PropertyRef Name=\"SHORTTEXTU\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"SHORTTEXT\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"ShortTxt\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"PSPID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"24\" sap:display-format=\"UpperCase\" sap:label=\"Project def.\" />\n" + 
			"				<Property Name=\"POSID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"24\" sap:display-format=\"UpperCase\" sap:label=\"WBS element\" />\n" + 
			"				<Property Name=\"SHORTTEXTU\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:display-format=\"UpperCase\" sap:label=\"ShortTxt\" />\n" + 
			"				<Property Name=\"LANGUAGE\" Type=\"Edm.String\" MaxLength=\"2\"\n" + 
			"					sap:label=\"Language\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_IAOM_CPROJECTS_WBS\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"POSID\" />\n" + 
			"					<PropertyRef Name=\"OBJECT_TYPE\" />\n" + 
			"					<PropertyRef Name=\"PROJ_ELEMENT_ID\" />\n" + 
			"					<PropertyRef Name=\"BEZEICH_PRJ_ELEM\" />\n" + 
			"					<PropertyRef Name=\"RESP_ORG_UNIT\" />\n" + 
			"					<PropertyRef Name=\"PRIORITY\" />\n" + 
			"					<PropertyRef Name=\"PRO_TYPE\" />\n" + 
			"					<PropertyRef Name=\"CAUSE\" />\n" + 
			"					<PropertyRef Name=\"GROUPING\" />\n" + 
			"					<PropertyRef Name=\"SEARCH_FIELD\" />\n" + 
			"					<PropertyRef Name=\"TEMP_EXTERNAL_ID\" />\n" + 
			"					<PropertyRef Name=\"CUSTOMER\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"POSID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"24\" sap:display-format=\"UpperCase\" sap:label=\"WBS element\" />\n" + 
			"				<Property Name=\"OBJECT_TYPE\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"cProj.ObjectCat\" />\n" + 
			"				<Property Name=\"PROJ_ELEMENT_ID\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"24\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Project Element No.\" />\n" + 
			"				<Property Name=\"BEZEICH_PRJ_ELEM\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"40\" sap:label=\"Project Element Name\" />\n" + 
			"				<Property Name=\"RESP_ORG_UNIT\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"8\" sap:display-format=\"NonNegative\" sap:label=\"Org. Responsible\" />\n" + 
			"				<Property Name=\"PRIORITY\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"NonNegative\" sap:label=\"Priority\" />\n" + 
			"				<Property Name=\"PRO_TYPE\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"15\" sap:display-format=\"UpperCase\" sap:label=\"Project Type\" />\n" + 
			"				<Property Name=\"CAUSE\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"15\" sap:display-format=\"UpperCase\" sap:label=\"Cause\" />\n" + 
			"				<Property Name=\"GROUPING\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:display-format=\"UpperCase\" sap:label=\"Grouping\" />\n" + 
			"				<Property Name=\"SEARCH_FIELD\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:display-format=\"UpperCase\" sap:label=\"Search Field\" />\n" + 
			"				<Property Name=\"TEMP_EXTERNAL_ID\" Type=\"Edm.String\"\n" + 
			"					Nullable=\"false\" MaxLength=\"24\" sap:display-format=\"UpperCase\"\n" + 
			"					sap:label=\"Template Number\" />\n" + 
			"				<Property Name=\"CUSTOMER\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"10\" sap:display-format=\"UpperCase\" sap:label=\"Sold-to party\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_SH_JVH_PRPMG\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"PBUKR\" />\n" + 
			"					<PropertyRef Name=\"POSID\" />\n" + 
			"					<PropertyRef Name=\"POST1\" />\n" + 
			"					<PropertyRef Name=\"VNAME\" />\n" + 
			"					<PropertyRef Name=\"RECID\" />\n" + 
			"					<PropertyRef Name=\"ETYPE\" />\n" + 
			"					<PropertyRef Name=\"OTYPE\" />\n" + 
			"					<PropertyRef Name=\"JIBCL\" />\n" + 
			"					<PropertyRef Name=\"JIBSA\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"PBUKR\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"Company code\" />\n" + 
			"				<Property Name=\"POSID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"24\" sap:display-format=\"UpperCase\" sap:label=\"WBS element\" />\n" + 
			"				<Property Name=\"POST1\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"40\" sap:label=\"Description\" />\n" + 
			"				<Property Name=\"VNAME\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"6\" sap:display-format=\"UpperCase\" sap:label=\"Joint Venture\" />\n" + 
			"				<Property Name=\"RECID\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:display-format=\"UpperCase\" sap:label=\"Recovery Indic.\" />\n" + 
			"				<Property Name=\"ETYPE\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"Equity Type\" />\n" + 
			"				<Property Name=\"OTYPE\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:display-format=\"UpperCase\" sap:label=\"JV Project Type\" />\n" + 
			"				<Property Name=\"JIBCL\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:display-format=\"UpperCase\" sap:label=\"JIB/JIBE Class\" />\n" + 
			"				<Property Name=\"JIBSA\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:display-format=\"UpperCase\" sap:label=\"JIB/JIBE SbClsA\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_KOART\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_BSTAT\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_BOOLEAN\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_XFELD\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_WVERW\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_FAR_SYM_DUE\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_AUGST\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_RANTYP\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_SHKZG\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_ZBFIX\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_ZINRT\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_SPERR\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"VL_FV_FARP_BOOLEAN\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"5\" sap:text=\"Text\" sap:label=\"Value\" />\n" + 
			"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"60\"\n" + 
			"					sap:label=\"Short Descript.\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"DunningArea\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"CompanyCode\" />\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"CompanyCode\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:label=\"Company Code\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"2\" sap:label=\"Dunning Area\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"Name\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"50\" sap:label=\"Text\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"DunningBlockingReasonCode\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:label=\"Dunn. Block\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"Name\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"50\" sap:label=\"Text\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"PaymentMethod\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Country\" />\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Country\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"3\" sap:label=\"Country\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:label=\"Pymt Method\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" />\n" + 
			"				<Property Name=\"Name\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"30\" sap:label=\"Description\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"DunningKey\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:label=\"Dunning Key\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"Name\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"50\" sap:label=\"Text\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"Company\" sap:service-schema-version=\"1\"\n" + 
			"				sap:service-version=\"1\" sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"CompanyCode\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"CompanyCode\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"4\" sap:text=\"CompanyName\" sap:label=\"Company Code\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:sortable=\"false\"\n" + 
			"					sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"CompanyName\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:label=\"Company Name\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"CompanyCity\" Type=\"Edm.String\" MaxLength=\"25\"\n" + 
			"					sap:label=\"City\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:sortable=\"false\" sap:filterable=\"false\" sap:semantics=\"city\" />\n" + 
			"				<Property Name=\"CompanyCurrency\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"5\" sap:label=\"Currency\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:semantics=\"currency-code\" />\n" + 
			"				<Property Name=\"CompanyCountry\" Type=\"Edm.String\"\n" + 
			"					MaxLength=\"3\" sap:label=\"Country\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityType Name=\"PaymentBlockingReasonCode\"\n" + 
			"				sap:content-version=\"1\">\n" + 
			"				<Key>\n" + 
			"					<PropertyRef Name=\"Code\" />\n" + 
			"				</Key>\n" + 
			"				<Property Name=\"Code\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"1\" sap:label=\"Payment block\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"				<Property Name=\"Name\" Type=\"Edm.String\" Nullable=\"false\"\n" + 
			"					MaxLength=\"20\" sap:label=\"Description\" sap:creatable=\"false\"\n" + 
			"					sap:updatable=\"false\" sap:sortable=\"false\" sap:filterable=\"false\" />\n" + 
			"			</EntityType>\n" + 
			"			<EntityContainer Name=\"fap_vendor_line_items_srv_Entities\"\n" + 
			"				m:IsDefaultEntityContainer=\"true\" sap:supported-formats=\"atom json xlsx\">\n" + 
			"				<EntitySet Name=\"Vendors\" EntityType=\"fap_vendor_line_items_srv.Vendor\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:pageable=\"false\" sap:content-version=\"1\" />\n" + 
			"				<EntitySet Name=\"UpdatableItems\" EntityType=\"fap_vendor_line_items_srv.UpdatableItem\"\n" + 
			"					sap:creatable=\"false\" sap:deletable=\"false\" sap:pageable=\"false\"\n" + 
			"					sap:addressable=\"false\" sap:content-version=\"1\" />\n" + 
			"				<EntitySet Name=\"Items\" EntityType=\"fap_vendor_line_items_srv.Item\"\n" + 
			"					sap:label=\"Vendor Line Items\" sap:creatable=\"false\" sap:updatable=\"false\"\n" + 
			"					sap:deletable=\"false\" sap:pageable=\"false\" sap:content-version=\"1\" />\n" + 
			"				<EntitySet Name=\"ReturnValueCollection\" EntityType=\"fap_vendor_line_items_srv.ReturnValue\"\n" + 
			"					sap:content-version=\"1\" />\n" + 
			"				<EntitySet Name=\"VL_SH_KREDA\" EntityType=\"fap_vendor_line_items_srv.VL_SH_KREDA\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_KREDI\" EntityType=\"fap_vendor_line_items_srv.VL_SH_KREDI\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_KREDK\" EntityType=\"fap_vendor_line_items_srv.VL_SH_KREDK\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_KREDL\" EntityType=\"fap_vendor_line_items_srv.VL_SH_KREDL\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_KREDP\" EntityType=\"fap_vendor_line_items_srv.VL_SH_KREDP\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_KREDT\" EntityType=\"fap_vendor_line_items_srv.VL_SH_KREDT\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_KREDE\" EntityType=\"fap_vendor_line_items_srv.VL_SH_KREDE\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_KREDM_E\" EntityType=\"fap_vendor_line_items_srv.VL_SH_KREDM_E\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_KREDW\" EntityType=\"fap_vendor_line_items_srv.VL_SH_KREDW\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_RELIFNRCN\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_RELIFNRCN\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T001\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T001\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T077K\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T077K\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T001S\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T001S\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_CT_TCESSION\" EntityType=\"fap_vendor_line_items_srv.VL_CT_TCESSION\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_CT_TCURC\" EntityType=\"fap_vendor_line_items_srv.VL_CT_TCURC\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_TGSB\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_TGSB\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_J_1BBRANHV\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_J_1BBRANHV\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T880\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T880\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_CT_CSKS\" EntityType=\"fap_vendor_line_items_srv.VL_CT_CSKS\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_SH_FARP_T005\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_FARP_T005\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T014\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T014\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T003\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T003\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T047M\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T047M\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T040S\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T040S\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T040\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T040\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_TZB0A\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_TZB0A\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_GL_ACCT_CA_NO\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_GL_ACCT_CA_NO\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_GL_ACCT_CA_TEXT\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_GL_ACCT_CA_TEXT\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_GL_ACCT_CA_FLAGS\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_GL_ACCT_CA_FLAGS\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_GL_ACCT_CA_KEY\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_GL_ACCT_CA_KEY\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_GL_ACCT_CC_NO\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_GL_ACCT_CC_NO\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_GL_ACCT_CC_TEXT\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_GL_ACCT_CC_TEXT\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_GL_ACCT_CC_FLAGS\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_GL_ACCT_CC_FLAGS\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_GL_ACCT_CC_ALTERNATIV_NO\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_GL_ACCT_CC_ALTERNATIV_NO\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T012\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T012\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T016\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T016\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_CT_T015W1\" EntityType=\"fap_vendor_line_items_srv.VL_CT_T015W1\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T056\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T056\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_CT_T008\" EntityType=\"fap_vendor_line_items_srv.VL_CT_T008\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_CH_ANLH\" EntityType=\"fap_vendor_line_items_srv.VL_CH_ANLH\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T042Z\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T042Z\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T001W\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T001W\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_TBSL\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_TBSL\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_PRCTN\" EntityType=\"fap_vendor_line_items_srv.VL_SH_PRCTN\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_PRCTS\" EntityType=\"fap_vendor_line_items_srv.VL_SH_PRCTS\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_CH_EKPO\" EntityType=\"fap_vendor_line_items_srv.VL_CH_EKPO\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKA\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKA\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKB\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKB\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKC\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKC\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKD\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKD\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKE\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKE\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKG\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKG\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKH\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKH\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKI\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKI\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKK\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKK\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKL\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKL\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKM\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKM\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKN\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKN\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKP\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKP\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKS\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKS\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKT\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKT\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKU\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKU\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKV\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKV\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MEKKW\" EntityType=\"fap_vendor_line_items_srv.VL_SH_MEKKW\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MMBSI_MEKK_DBSH_CC_E\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_MMBSI_MEKK_DBSH_CC_E\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_MMBSI_MEKK_TREX_CC_E\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_MMBSI_MEKK_TREX_CC_E\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_CT_T053R\" EntityType=\"fap_vendor_line_items_srv.VL_CT_T053R\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_SH_FARP_T005S\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_FARP_T005S\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_SH_T007A\" EntityType=\"fap_vendor_line_items_srv.VL_SH_SH_T007A\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_CH_VBEP\" EntityType=\"fap_vendor_line_items_srv.VL_CH_VBEP\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_SH_SECCODE\" EntityType=\"fap_vendor_line_items_srv.VL_SH_SECCODE\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_T074U\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_T074U\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_CH_ANLA\" EntityType=\"fap_vendor_line_items_srv.VL_CH_ANLA\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_TTXJ\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_TTXJ\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_H_TTXID\" EntityType=\"fap_vendor_line_items_srv.VL_SH_H_TTXID\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_CT_T043G\" EntityType=\"fap_vendor_line_items_srv.VL_CT_T043G\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" sap:semantics=\"aggregate\" />\n" + 
			"				<EntitySet Name=\"VL_SH_PRPMP\" EntityType=\"fap_vendor_line_items_srv.VL_SH_PRPMP\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_PRPMK\" EntityType=\"fap_vendor_line_items_srv.VL_SH_PRPMK\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_PRPMZ\" EntityType=\"fap_vendor_line_items_srv.VL_SH_PRPMZ\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_PRPMA\" EntityType=\"fap_vendor_line_items_srv.VL_SH_PRPMA\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_PRPMB\" EntityType=\"fap_vendor_line_items_srv.VL_SH_PRPMB\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_CN_LDST_PS_PR\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_CN_LDST_PS_PR\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_IAOM_CPROJECTS_WBS\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_IAOM_CPROJECTS_WBS\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_SH_JVH_PRPMG\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_SH_JVH_PRPMG\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:content-version=\"1\" sap:countable=\"false\" />\n" + 
			"				<EntitySet Name=\"VL_FV_KOART\" EntityType=\"fap_vendor_line_items_srv.VL_FV_KOART\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_BSTAT\" EntityType=\"fap_vendor_line_items_srv.VL_FV_BSTAT\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_BOOLEAN\" EntityType=\"fap_vendor_line_items_srv.VL_FV_BOOLEAN\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_XFELD\" EntityType=\"fap_vendor_line_items_srv.VL_FV_XFELD\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_WVERW\" EntityType=\"fap_vendor_line_items_srv.VL_FV_WVERW\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_FAR_SYM_DUE\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_FV_FAR_SYM_DUE\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_AUGST\" EntityType=\"fap_vendor_line_items_srv.VL_FV_AUGST\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_RANTYP\" EntityType=\"fap_vendor_line_items_srv.VL_FV_RANTYP\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_SHKZG\" EntityType=\"fap_vendor_line_items_srv.VL_FV_SHKZG\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_ZBFIX\" EntityType=\"fap_vendor_line_items_srv.VL_FV_ZBFIX\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_ZINRT\" EntityType=\"fap_vendor_line_items_srv.VL_FV_ZINRT\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_SPERR\" EntityType=\"fap_vendor_line_items_srv.VL_FV_SPERR\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"VL_FV_FARP_BOOLEAN\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.VL_FV_FARP_BOOLEAN\"\n" + 
			"					sap:content-version=\"1\" sap:semantics=\"fixed-values\" />\n" + 
			"				<EntitySet Name=\"DunningAreas\" EntityType=\"fap_vendor_line_items_srv.DunningArea\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:pageable=\"false\" sap:content-version=\"1\" />\n" + 
			"				<EntitySet Name=\"DunningBlockingReasonCodes\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.DunningBlockingReasonCode\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:pageable=\"false\" sap:content-version=\"1\" />\n" + 
			"				<EntitySet Name=\"PaymentMethods\" EntityType=\"fap_vendor_line_items_srv.PaymentMethod\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:pageable=\"false\" sap:content-version=\"1\" />\n" + 
			"				<EntitySet Name=\"DunningKeys\" EntityType=\"fap_vendor_line_items_srv.DunningKey\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:pageable=\"false\" sap:content-version=\"1\" />\n" + 
			"				<EntitySet Name=\"Companies\" EntityType=\"fap_vendor_line_items_srv.Company\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:pageable=\"false\" sap:content-version=\"1\" />\n" + 
			"				<EntitySet Name=\"PaymentBlockingReasonCodes\"\n" + 
			"					EntityType=\"fap_vendor_line_items_srv.PaymentBlockingReasonCode\"\n" + 
			"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" + 
			"					sap:pageable=\"false\" sap:content-version=\"1\" />\n" + 
			"				<FunctionImport Name=\"CheckPaymentItems\"\n" + 
			"					ReturnType=\"fap_vendor_line_items_srv.ReturnValue\" EntitySet=\"ReturnValueCollection\"\n" + 
			"					m:HttpMethod=\"GET\" sap:action-for=\"fap_vendor_line_items_srv.ReturnValue\">\n" + 
			"					<Parameter Name=\"keys\" Type=\"Edm.String\" Mode=\"In\" />\n" + 
			"				</FunctionImport>\n" + 
			"			</EntityContainer>\n" + 
			"			<atom:link rel=\"self\"\n" + 
			"				href=\"http://localhost:8080/uilib-sample/proxy/http/ldai2er3.wdf.sap.corp:50035/sap/opu/odata/sap/fap_vendor_line_items_srv/$metadata\"\n" + 
			"				xmlns:atom=\"http://www.w3.org/2005/Atom\" />\n" + 
			"			<atom:link rel=\"latest-version\"\n" + 
			"				href=\"http://localhost:8080/uilib-sample/proxy/http/ldai2er3.wdf.sap.corp:50035/sap/opu/odata/sap/fap_vendor_line_items_srv/$metadata\"\n" + 
			"				xmlns:atom=\"http://www.w3.org/2005/Atom\" />\n" + 
			"			<atom:link rel=\"self\"\n" + 
			"				href=\"http://localhost:8080/uilib-sample/proxy/http/ldai2er3.wdf.sap.corp:50035/sap/opu/odata/sap/fap_vendor_line_items_srv/$metadata\"\n" + 
			"				xmlns:atom=\"http://www.w3.org/2005/Atom\" />\n" + 
			"			<atom:link rel=\"latest-version\"\n" + 
			"				href=\"http://localhost:8080/uilib-sample/proxy/http/ldai2er3.wdf.sap.corp:50035/sap/opu/odata/sap/fap_vendor_line_items_srv/$metadata\"\n" + 
			"				xmlns:atom=\"http://www.w3.org/2005/Atom\" />\n" + 
			"		</Schema>\n" + 
			"	</edmx:DataServices>\n" + 
			"</edmx:Edmx>"
});