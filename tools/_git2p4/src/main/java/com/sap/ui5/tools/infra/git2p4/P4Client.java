package com.sap.ui5.tools.infra.git2p4;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class P4Client {

  private String NL = System.getProperty("line.separator");
  private String p4cmd = "p4";
  String port = "perforce3003.wdf.sap.corp:3003";
  String user = "TBS";
  String passwd = null;
  String client = null; //
  boolean verbose = false;
  private int lastExitValue;
  private List<String> lastOutput;
  List<P4Client.FStat> lastFiles;
  List<P4Client.Change> lastChanges;
  private P4Client.Diff lastDiff;
  List<P4Client.Chunk> lastDiffChunks;
  private boolean loggedIn = false;

  P4Client(){

  }

  boolean execute(String ... cmds) throws IOException {
    return executeWithInput(null, cmds);
  }

  boolean executeWithInput(String input, String ... cmds) throws IOException {
    ProcessBuilder pb = new ProcessBuilder();
    List<String> args = pb.command();
    args.add(p4cmd);
    args.add("-p");
    args.add(port);
    if ( user != null ) {
      args.add("-u");
      args.add(user);
    }
    /*
    if ( passwd != null ) {
      args.add("-P");
      args.add(passwd == null ? user : passwd);
    }
     */
    if ( client != null ) {
      args.add("-c");
      args.add(client);
    }
    for(String cmd : cmds) {
      if ( cmd != null ) {
        args.add(cmd);
      }
    }
    // Log.println("executing " + args);
    pb.redirectErrorStream(true);
    if ( verbose ) {
      Log.println(pb.command());
    }
    long t0 = System.currentTimeMillis();
    Process process = pb.start();
    if ( input != null ) {
      Writer w = new OutputStreamWriter(process.getOutputStream());
      w.write(input);
      w.close();
    }
    BufferedReader r = new BufferedReader(new InputStreamReader(process.getInputStream()));
    String line;
    List<String> lines = new ArrayList<String>();
    while ((line = r.readLine()) != null) {
      lines.add(line);
    }
    r.close();
    try {
      process.waitFor();
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
    lastExitValue = process.exitValue();
    lastOutput = lines;
    lastFiles = null;
    lastDiff = null;
    lastDiffChunks = null;
    long t1 = System.currentTimeMillis();
    Log.println("  Process returned exit code " + process.exitValue() + " (" + (t1-t0) + "ms)");
    Log.println("  Process returned output " + Log.summary(lines));
    if ( lastExitValue != 0 )
      throw new RuntimeException("" + lastExitValue );
    return true;
  }

  static Pattern CHANGE_CREATED = Pattern.compile("change\\s*([0-9]+)\\s*created", Pattern.CASE_INSENSITIVE);

  private String createOrUpdateChange(String change, String description) throws IOException {
    StringBuilder input = new StringBuilder();
    input.append("Change: ").append(change == null ? "new" : change).append(NL);
    input.append(NL);
    if ( client != null ) {
      input.append("Client: ").append(client).append(NL);
      input.append(NL);
    }
    if ( user != null ) {
      input.append("User: ").append(user).append(NL);
      input.append(NL);
    }
    input.append("Status: ").append(change == null ? "new" : "pending").append(NL);
    input.append(NL);
    input.append("Description: ").append(NL);
    for(String line : description.split(NL)) {
      input.append("  ").append(line).append(NL);
    }
    input.append(NL);
    input.append("Files: ").append(NL);
    input.append(NL);
    input.append(NL);
    if ( change == null ) {
      executeWithInput(input.toString(), "change", "-i");
    } else {
      executeWithInput(input.toString(), "change", "-i", "-u");
    }
    if ( lastExitValue == 0 && change == null ) {
      for(String line : lastOutput) {
        Matcher m = CHANGE_CREATED.matcher(line);
        if ( m.find() ) {
          change = m.group(1);
        }
      }
    }
    return change;
  }
  String createChange(String description) throws IOException {
    return createOrUpdateChange(null, description);
  }
  String updateChange(String change, String description) throws IOException {
    return createOrUpdateChange(change, description);
  }

  static class FStat {
    Map<String,String> fields = new HashMap<String,String>();
    boolean isEmpty() {
      return fields.isEmpty();
    }
    void setField(String field, String value) {
      fields.put(field, value);
    }
    String getDepotPath() {
      return fields.get("depotFile");
    }
    String getAction() {
      return fields.get("action");
    }
    String getHeadAction() {
      return fields.get("headAction");
    }
    String getPath() {
      return fields.get("path");
    }
    File getFile() {
      return new File(fields.get("path"));
    }
  }

  static class Change {
    String changeId;
    String date;
    String owner;
    List<String> description = new ArrayList<String>();
  }

  static Pattern FSTAT_LINE = Pattern.compile("\\.\\.\\.\\s+(\\S+)\\s+(.*)");

  void evalFStatReport() {
    lastFiles = new ArrayList<P4Client.FStat>();
    P4Client.FStat current = new FStat();
    lastOutput.add("");
    for(String line : lastOutput) {
      Matcher m = FSTAT_LINE.matcher(line);
      if ( m.matches() ) {
        String field = m.group(1);
        String value = m.group(2);
        current.setField(field, value);
      } else if ( line.trim().isEmpty() ){
        if ( !current.isEmpty() ) {
          lastFiles.add(current);
        }
        current = new FStat();
      }
    }
  }

  static Pattern CHANGE_LINE = Pattern.compile("^Change\\s+([0-9]+)\\s+on\\s+([0-9/: ]+)\\s+by\\s+(.*)$", Pattern.CASE_INSENSITIVE);

  void evalChangesReport() {
    lastChanges = new ArrayList<P4Client.Change>();
    P4Client.Change current = null;
    lastOutput.add("");
    for(String line : lastOutput) {
      Matcher m = CHANGE_LINE.matcher(line);
      if ( m.matches() ) {
        current = new Change();
        lastChanges.add(current);
        current.changeId = m.group(1);
        current.date = m.group(2);
        current.owner = m.group(3);
      } else if ( current != null && line.matches("\\s+.*") || line.trim().isEmpty() )  {
        current.description.add(line);
      }
    }
  }

  boolean sync(String path, String revision) throws IOException {
    if ( execute("sync", path + revision) ) {
      return true;
    }
    return false;
  }

  boolean fstat(String path) throws IOException {
    if ( execute("fstat", "-Op", "-T", "depotFile path headAction", path) ) {
      evalFStatReport();
      return true;
    }
    return false;
  }

  boolean fstat(String path, String pending) throws IOException {
    if ( execute("fstat", "-e", pending, "-Ro", "-Op", "-T", "depotFile path action", path) ) {
      evalFStatReport();
      return true;
    }
    return false;
  }

  boolean changes(String path, int max) throws IOException {
    boolean result;
    if ( max < 0 ) {
      result = execute("changes", "-s", "submitted", "-l", path);
    } else {
      result = execute("changes", "-s", "submitted", "-m", String.valueOf(max), "-l", path);
    }
    if ( result ) {
      evalChangesReport();
      return true;
    }
    return false;
  }

  boolean checkOut(File file, String change) throws IOException {
    return checkOut(file.getAbsolutePath(), change);
  }

  boolean checkOut(String path, String change) throws IOException {
    if ( change == null ) {
      return execute("edit", path);
    } else {
      return execute("edit", "-c", change, path);
    }
  }

  boolean revert(String path, String change) throws IOException {
    if ( change == null ) {
      return execute("revert", path);
    } else {
      return execute("revert", "-c", change, path);
    }
  }

  boolean revertUnchanged(String change) throws IOException {
    return execute("revert", "-a", "-c", change);
  }

  static class Diff {
    boolean binary = false;
    int add = 0;
    int deleted = 0;
    int changedFrom = 0;
    int changedTo = 0;
  }

  static class Chunk {
    String x;
    List<String> before = new ArrayList<String>();
    List<String> after = new ArrayList<String>();
    @Override
    public String toString() {
      return x;
    }
  }
  static Pattern DIFF_BINARY = Pattern.compile("====\\s*\\(\\w*binary\\)\\s*$");
  static Pattern DIFF_FILES_DIFFER = Pattern.compile(" files differ ");
  static Pattern DIFF_ADD = Pattern.compile("add\\s+(\\d+)\\s+chunks\\s+(\\d+)\\s+lines");
  static Pattern DIFF_DELETED = Pattern.compile("deleted\\s+(\\d+)\\s+chunks\\s+(\\d+)\\s+lines");
  static Pattern DIFF_CHANGED = Pattern.compile("changed\\s+(\\d+)\\s+chunks\\s+(\\d+)\\s*/\\s*(\\d+)\\s+lines");

  void evalDiffSummaryReport() {
    lastDiff = new Diff();
    for(String line : lastOutput) {
      Matcher m = DIFF_ADD.matcher(line);
      if ( m.matches() ) {
        lastDiff.add = Integer.parseInt(m.group(2));
      }
      m = DIFF_DELETED.matcher(line);
      if ( m.matches() ) {
        lastDiff.deleted = Integer.parseInt(m.group(2));
      }
      m = DIFF_CHANGED.matcher(line);
      if ( m.matches() ) {
        lastDiff.changedFrom = Integer.parseInt(m.group(2));
        lastDiff.changedTo = Integer.parseInt(m.group(3));
      }
    }
  }

  boolean diffSummary(String path) throws IOException {
    if ( execute("diff", "-dsl", path) ) {
      evalDiffSummaryReport();
      return true;
    } else {
      return false;
    }
  }

  void evalDiffReport() {
    lastDiffChunks = new ArrayList<P4Client.Chunk>();
    lastOutput.add("");
    Matcher m = DIFF_BINARY.matcher(lastOutput.get(0));
    if ( m.find() ) {
      P4Client.Chunk chunk = new Chunk();
      chunk.x = (lastOutput.size() > 1 && DIFF_FILES_DIFFER.matcher(lastOutput.get(1)).find()) ? "binarydiff" : "binaryequal";
      lastDiffChunks.add(chunk);
      return;
    }
    int i=1;
    String line = lastOutput.get(i++);
    while (!line.isEmpty()) {
      P4Client.Chunk c = new Chunk();
      c.x = line;
      line = lastOutput.get(i++);
      while ( line.startsWith("<") ) {
        c.before.add(line.substring(1));
        line = lastOutput.get(i++);
      }
      if ( line.startsWith("---") ) {
        line = lastOutput.get(i++);
      }
      while ( line.startsWith(">") ) {
        c.after.add(line.substring(1));
        line = lastOutput.get(i++);
      }
      lastDiffChunks.add(c);
    }
  }

  boolean diff(String path) throws IOException {
    if ( execute("diff", "-dl", path) ) {
      evalDiffReport();
      return true;
    } else {
      return false;
    }
  }

  boolean delete(String path, String change) throws IOException {
    if ( change == null ) {
      return execute("delete", path);
    } else {
      return execute("delete", "-c", change, path);
    }
  }

  boolean add(String path, String change) throws IOException {
    return add(path, change, false);
  }

  boolean add(String path, String change, boolean force) throws IOException {
    if ( change == null ) {
      return execute("add", force ? "-f" : null, path);
    } else {
      return execute("add", "-c", change, force ? "-f" : null, path);
    }
  }

  boolean submit(String change) throws IOException {
    return execute("submit", "-c", change);
  }

  boolean login() throws IOException {
    if ( !loggedIn ) {
      loggedIn = executeWithInput(passwd, "login");
    }
    return loggedIn;
  }

  boolean logout() throws IOException {
    if ( loggedIn ) {
      loggedIn = !execute("logout");
    }
    return !loggedIn;
  }
}