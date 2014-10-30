/*
 * Copyright 2014 by SAP AG, Walldorf., http://www.sap.com.
 * All rights reserved. Use is subject to license terms.
 * This software is the confidential and proprietary information
 * of SAP AG, Walldorf. You shall not disclose such confidential
 * information and shall use it only in accordance with the terms
 * of the license agreement you entered into with SAP.
 */
package com.sap.ui5.tools.maven;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

/**
 * 
 * The class <b><code>LastRunInfo</code></b> ...
 * Allow the .version-tool.xml properties file to be used for another purposes
 * <br>
 * @author Todor Atanasov
 * @since 1.25.0
 */
public class LastRunInfo {
  private static final String LAST_COMMIT_ID = "lastCommitId";
  private Properties diffs = new Properties();
  private String lastCommitId;
  private File lastVersionToolResultsFile;
  
  public LastRunInfo (File root) throws IOException{
    lastVersionToolResultsFile = new File(root, ".version-tool.xml");
    if ( lastVersionToolResultsFile.canRead() ) {
      getDiffs().loadFromXML(new FileInputStream(lastVersionToolResultsFile));
      setLastCommitId((String)getDiffs().get(LAST_COMMIT_ID));
      if (getLastCommitId() != null){
        diffs.remove(LAST_COMMIT_ID);
      }
    }
  }
  
  public void save() throws IOException{
    if (lastCommitId != null){
      diffs.put(LAST_COMMIT_ID, lastCommitId);
    }
    if (!diffs.isEmpty()) {
      diffs.storeToXML(new FileOutputStream(lastVersionToolResultsFile), "Last Version-Tool Changes");
    }
    if (lastCommitId != null){
      diffs.remove(LAST_COMMIT_ID);
    }
  }
  
  public String getLastCommitId() {
    return this.lastCommitId;
  }
  public void setLastCommitId(String lastCommitId) {
    this.lastCommitId = lastCommitId;
  }
  public Properties getDiffs() {
    return this.diffs;
  }
  public void setDiffs(Properties diffs) {
    this.diffs = diffs;
  }
}
