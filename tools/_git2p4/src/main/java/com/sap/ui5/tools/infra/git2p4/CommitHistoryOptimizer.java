package com.sap.ui5.tools.infra.git2p4;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

class CommitHistoryOptimizer {

  private final Map<String,GitClient.Commit> commits;
  private final Set<String> ids;
  private final List<GitClient.Commit> orderedCommits;

  CommitHistoryOptimizer(Map<String,GitClient.Commit> commits) {
    this.commits = commits;
    this.ids = new HashSet<String>(commits.keySet());
    this.orderedCommits = new ArrayList<GitClient.Commit>();
  }

  private void mergeIn(GitClient.Commit commit, String id) {
    while ( ids.remove(id) ) {
      GitClient.Commit parent = commits.get(id);
      if ( parent.isMerge() ) {
        throw new IllegalStateException();
      }
      commit.mergeIns.add(parent);
      id = parent.ids[1];
    }
  }

  private void enrich(Map<String,String> reachable) {
    Set<String> commitIds = new HashSet<String>(reachable.keySet());
    for(String id : commitIds) {
      String path = reachable.get(id);
      if ( !path.endsWith(id) ) {
        path = path + " " + id;
        reachable.put(id, path);
        GitClient.Commit commit = commits.get(id);
        if ( commit != null ) {
          if ( !reachable.containsKey(commit.ids[1]) ) {
            reachable.put(commit.ids[1], path);
          }
          if ( commit.ids.length > 2 && !reachable.containsKey(commit.ids[2]) ) {
            reachable.put(commit.ids[2], path);
          }
        }
      }
    }
  }

  private String[][] findNearestCommonPredecessor(GitClient.Commit commit) {
    Map<String,String> predecessors1 = new HashMap<String,String>();
    Map<String,String> predecessors2 = new HashMap<String,String>();

    predecessors1.put(commit.ids[1], "");
    predecessors2.put(commit.ids[2], "");

    Set<String> intersect = new HashSet<String>(predecessors1.keySet());
    intersect.retainAll(predecessors2.keySet());
    while ( intersect.isEmpty() ) {
      int oldSize = predecessors1.size() + predecessors2.size();
      enrich(predecessors1);
      enrich(predecessors2);
      if ( predecessors1.size() + predecessors2.size() == oldSize )
        return null; // throw new RuntimeException("failed to find common predecessor for " + commit.ids[1] + " and " + commit.ids[2]);
      intersect = new HashSet<String>(predecessors1.keySet());
      intersect.retainAll(predecessors2.keySet());
    }

    if ( !intersect.isEmpty() ) {
      String common = intersect.iterator().next();
      String path1 = predecessors1.get(common);
      if ( path1.endsWith(" " + common) ) path1 = path1.substring(0, path1.length()-common.length()).trim();
      String path2 = predecessors2.get(common);
      if ( path2.endsWith(" " + common) ) path2 = path2.substring(0, path2.length()-common.length()).trim();
      return new String[][] { path1.trim().split(" "), path2.trim().split(" ") };
    }
    return null;
  }

  private int decide(GitClient.Commit commit) {

    GitClient.Commit parent1 = commits.get(commit.ids[1]);
    GitClient.Commit parent2 = commits.get(commit.ids[2]);
    if ( parent1 != null && parent2 == null ) {
      return 1;
    }
    if ( parent1 == null && parent2 != null ) {
      return 2;
    }

    boolean g1 = parent1.isGerrit();
    boolean g2 = parent2.isGerrit();

    if ( g1 && !g2 ) {
      return 1;
    }
    if ( !g1 && g2 ) {
      return 2;
    }

    boolean m1 = commit.isGerritMergeOf(parent1);
    boolean m2 = commit.isGerritMergeOf(parent2);
    if ( m1 && !m2 ) {
      return 2;
    }
    if ( !m1 && m2 ) {
      return 1;
    }

    String[][] paths = findNearestCommonPredecessor(commit);
    if ( paths != null ) {
      g1 = false;
      for(int i=0; i<paths[0].length; i++) {
        if ( commits.get(paths[0][i]).isGerrit() ) {
          g1 = true;
          break;
        }
      }
      g2 = false;
      for(int i=0; i<paths[1].length; i++) {
        if ( commits.get(paths[1][i]).isGerrit() ) {
          g2 = true;
          break;
        }
      }
      if ( g1 && !g2 ) {
        return 1;
      }
      if ( !g1 && g2 ) {
        return 2;
      }
      if ( paths[0].length < paths[1].length ) {
        Log.println("random decision for parent 2: " + commit.ids[0] + ":" + commit.ids[2]);
        return 2;
      } else {
        Log.println("random decision for parent 1: " + commit.ids[0] + ":" + commit.ids[1]);
        return 1;
      }
    }

    if ( parent1.getCommitDate().compareTo(parent2.getCommitDate()) < 0 ) {
      return 2;
    } else if ( parent1.getCommitDate().compareTo(parent2.getCommitDate()) > 0 ) {
      return 1;
    }
    throw new IllegalStateException("can't decide although it is a merge: " + commit.ids[0] + ":" + commit.ids[1] + " vs. " + commit.ids[2]);
  }

  private void track(String id) {

    if ( !ids.remove(id) ) {
      Log.println("dead end " + id);
      return;
    }

    GitClient.Commit commit = commits.get(id);
    if ( commit == null )
      return;

    orderedCommits.add(commit);

    if ( commit.isMerge() ) { // MERGE
      int which = decide(commit);
      track(commit.ids[which]);
      mergeIn(commit, commit.ids[3-which]);
    } else {
      track(commit.ids[1]);
    }

  }

  List<GitClient.Commit> run() throws IOException {

    if ( !commits.isEmpty() ) {

      // note: commits must be in reverse order!
      String lastCommit = commits.keySet().iterator().next();
      Log.println("tracking back from commit " + lastCommit);
      track(lastCommit);
      Collections.reverse(orderedCommits);

      // sanity checks
      if ( !ids.isEmpty() ) {
        throw new IllegalStateException("dangling commits: " + ids);
      }
      GitClient.Commit last = null;
      List<String> errors = new ArrayList<String>();
      for(GitClient.Commit commit : orderedCommits) {
        Date curr = commit.getCommitDate();
        if ( last != null && curr.compareTo(last.getCommitDate()) < 0 ) {
          errors.add("*** wrong commit order: " + commit.getId() + " < " + last.getId());
        }
        last = commit;
      }
      if ( !errors.isEmpty() ) {
        Log.println(errors.toString());
      }

      for(GitClient.Commit commit : orderedCommits) {
        String b = commit.getId() + " " + commit.getCommitDate() + " ";
        for(int i=0; i<commit.mergeIns.size(); i++) {
          b += " " + commit.mergeIns.get(i);
        }
        Log.println(b);
      }

    }

    return orderedCommits;
  }
}