package com.sap.ui5.sonar.javascript.jslint;

import org.apache.commons.io.IOUtils;
import org.sonar.api.resources.Java;
import org.sonar.api.rules.Rule;
import org.sonar.api.rules.RuleRepository;
import org.sonar.api.rules.XMLRuleParser;

import java.io.InputStream;
import java.util.List;


/**
 * The class <b><code>JSLintExtensionRepository</code></b> ...
 * TODO Enter the description here
 * <br>
 * @author D039071@exchange.sap.corp
 * @author <code>Revision Author: ($Author: D039071 $)</code>
 * @version 1.0 - 04.03.2012 19:59:57
 * @version <code>Revision Version: ($Revision: #1 $)</code>
 * @version <code>Revision Date: ($Date: 2012/01/01 $)</code>
 */
public final class JSLintExtensionRepository extends RuleRepository {

	
  private XMLRuleParser xmlRuleParser;

  
  /**
   * constructs the class <code>JSLintExtensionRepository</code>
   * @param xmlRuleParser
   */
  public JSLintExtensionRepository(XMLRuleParser xmlRuleParser) {
    super("JSLint", Java.KEY);
    setName("JSLint");
    this.xmlRuleParser = xmlRuleParser;
  } // constructor

  
  /* (non-Javadoc)
   * @see org.sonar.api.rules.RuleRepository#createRules()
   */
  @Override
  public List<Rule> createRules() {
    InputStream input = getClass().getResourceAsStream("jslint-rules.xml");
    try {
      return xmlRuleParser.parse(input);
    } finally {
      IOUtils.closeQuietly(input);
    }
  } // method: createRules
  
  
} // class: JSLintExtensionRepository