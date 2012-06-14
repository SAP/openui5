package com.sap.ui5.tools.infra.git2p4;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class GitClient {

  private String gitcmd = "git.cmd";
  File repository = new File(".");
  String sshuser = "hudsonvoter";
  boolean verbose = false;
  private int lastExitValue;
  private List<String> lastOutput;
  Map<String,GitClient.Commit> lastCommits;

  GitClient(){

  }

  boolean execute(String ... cmds) throws IOException {
    return executeWithInput(null, cmds);
  }

  boolean executeWithInput(String input, String ... cmds) throws IOException {
    ProcessBuilder pb = new ProcessBuilder();
    pb.directory(repository);
    List<String> args = pb.command();
    args.add(gitcmd);
    for(String cmd : cmds) {
      args.add(cmd);
    }
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
    lastCommits = null;
    long t1 = System.currentTimeMillis();
    Log.println("  Process returned exit code " + process.exitValue() + " (" + (t1-t0) + "ms)");
    Log.println("  Process returned output " + Log.summary(lines));
    return lastExitValue == 0;
  }

  static class Commit {
    File repository;
    String[] ids;
    Map<String,String> fields = new HashMap<String,String>();
    List<String> lines = new ArrayList<String>();
    List<Commit> mergeIns = new ArrayList<Commit>();
    Object data = null;

    @Override
    public String toString() {
      return getId();
    }

    void setField(String field, String value) {
      fields.put(field, value);
    }
    String getId() {
      return ids[0];
    }

    boolean isMerge() {
      return ids.length == 3;
    }

    boolean isGerrit() {
      return fields.containsKey("Commit") && fields.get("Commit").startsWith("Gerrit Code Review");
    }

    static Pattern DATE = Pattern.compile("^(\\d+)\\s+([-+]\\d{4})$");
    private Date asDate(String field) {
      Matcher m = DATE.matcher(fields.get("CommitDate"));
      if ( m.matches() ) {
        long time = Long.parseLong(m.group(1));
        String offsetStr = m.group(2);
        long offset = (60 * Long.parseLong(offsetStr.substring(1,3)) + Long.parseLong(offsetStr.substring(3,5))) * 60L;
        if ( offsetStr.charAt(0) == '-' ) {
          offset = -offset;
        }
        return new Date(time * 1000L);
      } else {
        throw new RuntimeException();
      }
    }

    public boolean isGerritMergeOf(Commit other) {
      String summary = getSummary();
      if ( GerritHelper.isGerritMerge(summary) ) {
        summary = GerritHelper.ungerrit(summary);
        String otherSummary = other.getSummary();
        int length = Math.min(summary.length(), otherSummary.length());
        return length >= 20 && summary.regionMatches(0, otherSummary, 0, length);
      } else {
        return false;
      }
    }

    public String getSummary() {
      return lines.get(0);
    }
    public String getOrigSummary() {
      return GerritHelper.ungerrit(lines.get(0));
    }
    public Date getAuthorDate() {
      return asDate("AuthorDate");
    }
    public Date getCommitDate() {
      return asDate("CommitDate");
    }
    public String getAuthor() {
      return fields.get("Author");
    }
    public String getCommiter() {
      return fields.get("Commit");
    }
  }

  static Pattern COMMIT_LINE = Pattern.compile("^commit\\s+(.*)$");
  static Pattern TOKEN_LINE = Pattern.compile("^([^\\s:]+):\\s+(.*)$");
  static Pattern TEXT_LINE = Pattern.compile("^\\s+(.*)$");

  void evalCommitLog() {
    Map<String,GitClient.Commit> commits = new LinkedHashMap<String,GitClient.Commit>();
    lastOutput.add("");
    for (int i=0; i<lastOutput.size(); ) {
      String line = lastOutput.get(i++);
      Matcher m = COMMIT_LINE.matcher(line);
      if ( m.matches() ) {
        GitClient.Commit commit = new Commit();
        commit.repository = repository;
        commit.ids = m.group(1).trim().split("\\s");
        commits.put(commit.getId(), commit);
        while( i<lastOutput.size() && (m = TOKEN_LINE.matcher(line = lastOutput.get(i++))).matches() ) {
          String field = m.group(1);
          String value = m.group(2);
          commit.setField(field, value);
        }
        if ( !line.isEmpty() )
          throw new RuntimeException();
        while( i<lastOutput.size() && (m = TEXT_LINE.matcher(line = lastOutput.get(i++))).matches() ) {
          commit.lines.add(m.group(1));
        }
        if ( !line.isEmpty() )
          throw new RuntimeException();
      }
    }

    lastCommits = commits;
    Log.println("found " + lastCommits.size() + " commits");
  }

  public boolean log(String range) throws IOException {
    if ( execute("log", "--format=fuller", "--date=raw", "--no-abbrev-commit", "--parents", range) ) {
      evalCommitLog();
      return true;
    }
    return false;
  }

  public boolean log(int n) throws IOException {
    if ( execute("log", "--max-count", String.valueOf(n)) ) {
      evalCommitLog();
      return true;
    }
    return false;
  }

  public boolean clone(String gitUrl) throws IOException {
    return execute("clone", "ssh://" + sshuser + "@" + gitUrl, repository.getAbsolutePath());
  }

  public boolean fetch() throws IOException {
    return execute("fetch");
  }

  public boolean checkout(String commit) throws IOException {
    return execute("checkout", "--force", "--detach", commit);
  }

  public boolean addAll() throws IOException {
    return execute("add", "--all");
  }

  public boolean commit(String message) throws IOException {
    // ensure that the changeId commit hook exists
    File commitMsgHook = new File(repository, ".git/hooks/commit-msg");
    if ( !commitMsgHook.exists() ) {
      URL url = new URL("https://git.wdf.sap.corp:8080/tools/hooks/commit-msg");
      IOUtils.copy(url.openConnection().getInputStream(), new FileOutputStream(commitMsgHook), /* close= */ true);
    }
    return execute("-c", "core.autocrlf=false", "commit", "--message=" + message);
  }

  public boolean push(String gitUrl, String refSpec) throws IOException {
    return execute("push", "ssh://" + sshuser + "@" + gitUrl, refSpec);
  }
}