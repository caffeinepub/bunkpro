import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Mix in the authorization logic
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type RankingDetails = {
    displayName : Text;
    college : ?Text;
    points : Nat;
    streak : Nat;
    joinDate : Time.Time;
    longestStreak : Nat;
  };

  type UserData = {
    displayName : Text;
    points : Nat;
    streak : Nat;
    joinDate : Time.Time;
    longestStreak : Nat;
    currentStreak : Nat;
    college : ?Text;
    rankingDetails : RankingDetails;
  };

  type AddPointsResult = {
    #success : Nat;
    #pointsUpdateFailed;
  };

  type UserProfile = {
    displayName : Text;
    college : Text;
    email : Text;
  };

  let users = Map.empty<Principal, UserData>();
  var lastRecalculated : ?Time.Time = null;

  func compareEntriesForRanking(a : RankingDetails, b : RankingDetails) : Order.Order {
    switch (Nat.compare(b.points, a.points)) {
      case (#less) { #less };
      case (#greater) { #greater };
      case (#equal) {
        switch (Nat.compare(b.streak, a.streak)) {
          case (#less) { #less };
          case (#greater) { #greater };
          case (#equal) { Int.compare(a.joinDate, b.joinDate) };
        };
      };
    };
  };

  func sortRankings(entries : [RankingDetails]) : [RankingDetails] {
    entries.sort(
      func(a, b) {
        compareEntriesForRanking(a, b);
      }
    );
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?userData) {
        ?{
          displayName = userData.displayName;
          college = switch (userData.college) {
            case (null) { "unknown" };
            case (?college) { college };
          };
          email = "not-implemented";
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (users.get(caller)) {
      case (null) {
        let newUser : UserData = {
          displayName = profile.displayName;
          points = 0;
          streak = 0;
          joinDate = Time.now();
          longestStreak = 0;
          currentStreak = 0;
          college = ?profile.college;
          rankingDetails = {
            displayName = profile.displayName;
            points = 0;
            streak = 0;
            joinDate = Time.now();
            longestStreak = 0;
            college = ?profile.college;
          };
        };
        users.add(caller, newUser);
      };
      case (?existingUser) {
        let updatedUser : UserData = {
          existingUser with
          displayName = profile.displayName;
          college = ?profile.college;
          rankingDetails = {
            existingUser.rankingDetails with
            displayName = profile.displayName;
            college = ?profile.college;
          };
        };
        users.add(caller, updatedUser);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (users.get(caller)) {
      case (null) { null };
      case (?userData) {
        ?{
          displayName = userData.displayName;
          college = switch (userData.college) {
            case (null) { "unknown" };
            case (?college) { college };
          };
          email = "not-implemented";
        };
      };
    };
  };

  public shared ({ caller }) func addPoints(pointsToAdd : Nat) : async AddPointsResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add points");
    };
    switch (users.get(caller)) {
      case (null) {
        #pointsUpdateFailed;
      };
      case (?existingUser) {
        let newPoints = existingUser.points + pointsToAdd;
        let updatedUser : UserData = {
          existingUser with
          points = newPoints;
          rankingDetails = {
            existingUser.rankingDetails with
            points = newPoints;
          };
        };
        users.add(caller, updatedUser);
        #success(newPoints);
      };
    };
  };

  public shared ({ caller }) func deleteCallerUser() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete their profiles");
    };

    let existingUser = users.get(caller);
    switch (existingUser) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?_) {
        users.remove(caller);
      };
    };
  };

  // Public query - accessible to all users including guests
  // Global leaderboard should be publicly accessible
  public query func getGlobalRankingPaginated(start : Nat, count : Nat) : async [RankingDetails] {
    let allEntries = users.values().map(func(userData) { userData.rankingDetails }).toArray();
    let sortedEntries = allEntries.sort(compareEntriesForRanking);

    if (start >= sortedEntries.size()) {
      return [];
    };

    let end = Nat.min(start + count, sortedEntries.size());
    let sliceSize = if (end >= start) { 0 : Nat } else { end - start };

    Array.tabulate<RankingDetails>(
      sliceSize,
      func(i) {
        sortedEntries[start + i];
      },
    );
  };

  // Public query - accessible to all users including guests
  // College-specific leaderboard should be publicly accessible
  public query func getRankingByCollege(college : Text, start : Nat, count : Nat) : async [RankingDetails] {
    let filteredEntries = users.values()
      .map(func(userData) { userData.rankingDetails })
      .filter(func(entry) { entry.displayName.contains(#text college) })
      .toArray();

    let sortedEntries = filteredEntries.sort(compareEntriesForRanking);

    if (start >= sortedEntries.size()) {
      return [];
    };

    let end = Nat.min(start + count, sortedEntries.size());
    let sliceSize = if (end >= start) { 0 : Nat } else { end - start };

    Array.tabulate<RankingDetails>(
      sliceSize,
      func(i) {
        sortedEntries[start + i];
      },
    );
  };
};
