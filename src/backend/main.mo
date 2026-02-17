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

import Validation "validation";


// Apply data migration

actor {
  // Mix in the authorization logic
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var requiredMinAttendancePercentage = 75;

  type AttendanceDay = {
    date : Time.Time;
    courses : [Text];
    timestamp : Time.Time;
  };

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
  let attendanceDays = Map.empty<Principal, Map.Map<Time.Time, AttendanceDay>>();
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

    let trimmedDisplayName = profile.displayName.trim(#char ' ');

    Validation.isValidName(trimmedDisplayName);

    let trimmedCollege = profile.college.trim(#char ' ');

    switch (users.get(caller)) {
      case (null) {
        let newUser : UserData = {
          displayName = trimmedDisplayName;
          points = 0;
          streak = 0;
          joinDate = Time.now();
          longestStreak = 0;
          currentStreak = 0;
          college = ?trimmedCollege;
          rankingDetails = {
            displayName = trimmedDisplayName;
            points = 0;
            streak = 0;
            joinDate = Time.now();
            longestStreak = 0;
            college = ?trimmedCollege;
          };
        };
        users.add(caller, newUser);
      };
      case (?existingUser) {
        let updatedUser : UserData = {
          existingUser with
          displayName = trimmedDisplayName;
          college = ?trimmedCollege;
          rankingDetails = {
            existingUser.rankingDetails with
            displayName = trimmedDisplayName;
            college = ?trimmedCollege;
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

  public shared ({ caller }) func addDailyAttendance(date : Time.Time, courses : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark attendance");
    };

    let now = Time.now();

    // Prevent marking future dates
    if (date > now) {
      Runtime.trap("Cannot mark attendance for a future date");
    };

    // Check for duplicate dates
    let callerAttendance = attendanceDays.get(caller);
    switch (callerAttendance) {
      case (null) {
        // No existing attendance map for caller, create new and add entry
        let newAttendance = Map.empty<Time.Time, AttendanceDay>();
        newAttendance.add(date, { date; courses; timestamp = now });
        attendanceDays.add(caller, newAttendance);
      };
      case (?userAttendance) {
        // Check if date already exists to prevent duplicates
        switch (userAttendance.get(date)) {
          case (null) {
            userAttendance.add(date, { date; courses; timestamp = now });
          };
          case (?_) {
            Runtime.trap("Attendance already marked for this date");
          };
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

  //-----------------------
  // Attendance Calculator
  //-----------------------

  public query ({ caller }) func getRequiredAttendancePercentage() : async Nat {
    requiredMinAttendancePercentage;
  };

  public shared ({ caller }) func setRequiredAttendancePercentage(newPercentage : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update required attendance percentage");
    };

    if (newPercentage > 100 or newPercentage < 1) {
      Runtime.trap("InvalidSet: newPercentage must be in range 1..=100");
    };
    requiredMinAttendancePercentage := newPercentage;
  };

  // Returns the maximum number of classes that can be bunked (missed)
  // without dropping below the required percentage.
  public query ({ caller }) func calculateMaxBunkableClasses(attendedClasses : Nat, totalClasses : Nat) : async Nat {
    if (totalClasses == 0 or attendedClasses == 0) {
      return 0;
    };

    // Calculate C as whole number (requiredMinPercentage in percent)
    // existingAttendedOverTotal * 100 >= requiredMinPercentage * newTotal
    // C_attend >= C_old * (attend + bunk) / (attend + bunk)
    // 100 * attended / (total + x) >= requiredMinPercentage
    // Cross-multiply (avoid float division)
    // 100 * attended >= required * (total + x)
    // 100 * attended >= total * required + x * required
    // 100 * attended - total * required >= x * required
    // (100 * attended - total * required) / required >= x
    let requiredNat = requiredMinAttendancePercentage;
    let leftSide = 100 * attendedClasses;
    let rightSideBase = totalClasses * requiredNat;

    if (leftSide < rightSideBase) {
      return 0;
    };

    let numerator = leftSide - rightSideBase;
    numerator / requiredNat;
  };
};

