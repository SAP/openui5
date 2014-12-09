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
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.InvalidPropertiesFormatException;
import java.util.Map;
import java.util.Properties;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.stream.JsonReader;

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
  private File lastVersionToolResultsFile;
  private String profile;
  private VersionTool versionTool;
  
  private class VersionTool{
    Map<String, Properties> changes;
    String lastCommitId;
  }
  
  public LastRunInfo (File root) throws IOException {
    this(root, "default");
  }
   
  public LastRunInfo (File root, String profile) throws IOException {
    this.profile = profile;
    lastVersionToolResultsFile = new File(root, ".version-tool.xml");
    if ( lastVersionToolResultsFile.canRead() ) {
      try {
        //try the old format
        Properties diffs = new Properties();
        diffs.loadFromXML(new FileInputStream(lastVersionToolResultsFile));
        versionTool = new VersionTool();
        setLastCommitId((String)diffs.get(LAST_COMMIT_ID));
        if (getLastCommitId() != null){
          diffs.remove(LAST_COMMIT_ID);
        }
        versionTool.changes = new HashMap<String, Properties>();
        versionTool.changes.put(profile, diffs);
      } catch (InvalidPropertiesFormatException e) {
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        versionTool = gson.fromJson(new JsonReader(new FileReader(lastVersionToolResultsFile)), VersionTool.class);
      }
    }
  }
  
  public void save() throws IOException{
    Gson gson = new GsonBuilder().disableHtmlEscaping().setPrettyPrinting().create();
    String json = gson.toJson(versionTool);
    FileWriter fw = new FileWriter(lastVersionToolResultsFile);
    fw.write(json);
    fw.close();
  }
  
  public String getLastCommitId() {
    return versionTool.lastCommitId;
  }
  public void setLastCommitId(String lastCommitId) {
    versionTool.lastCommitId = lastCommitId;
  }
  public Properties getDiffs() {
    if (!versionTool.changes.containsKey(profile)) {
      versionTool.changes.put(profile, new Properties());
    }
    return versionTool.changes.get(profile);
  }
  public void setDiffs(Properties diffs) {
    versionTool.changes.put(profile, diffs);
  }
}
