import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";

actor {
  type UserId = Principal;

  type RankingEntry = {
    displayName : Text;
    points : Nat;
  };

  type UserData = {
    displayName : Text;
    points : Nat;
    lastUpdated : Int;
  };

  let users = Map.empty<UserId, UserData>();

  func toRankingEntry(userData : UserData) : RankingEntry {
    {
      displayName = userData.displayName;
      points = userData.points;
    };
  };

  func orderEntriesByPoints(a : RankingEntry, b : RankingEntry) : Order.Order {
    Nat.compare(b.points, a.points);
  };

  public type RankingError = {
    #userNotAuthenticated;
    #pointsUpdateFailed;
    #displayNameUpdateFailed;
  };

  func getCurrentWeekStart() : Int {
    let timestamp = Time.now();
    let seconds = timestamp / 1_000_000_000;
    let daysSinceEpoch = seconds / 86_400;
    let daysSinceWeekStart = daysSinceEpoch % 7;
    let weekStartDays = daysSinceEpoch - daysSinceWeekStart;
    let weekStartSeconds = weekStartDays * 86_400;
    weekStartSeconds * 1_000_000_000;
  };

  public shared ({ caller }) func registerDisplayName(displayName : Text) : async Bool {
    let userId = caller;
    let currentWeekStart = getCurrentWeekStart();

    switch (users.get(userId)) {
      case (null) {
        let newUser : UserData = {
          displayName;
          points = 0;
          lastUpdated = currentWeekStart;
        };
        users.add(userId, newUser);
        true;
      };
      case (?existingUser) {
        if (existingUser.displayName != displayName or existingUser.lastUpdated < currentWeekStart) {
          let updatedUser : UserData = {
            displayName;
            points =
              if (existingUser.lastUpdated < currentWeekStart) { 0 } else {
                existingUser.points;
              };
            lastUpdated = currentWeekStart;
          };
          users.add(userId, updatedUser);
        };
        true;
      };
    };
  };

  public type Ranking = {
    displayName : Text;
    points : Nat;
  };

  public shared ({ caller }) func addPoints(displayName : Text, points : Nat) : async RankingError {
    let userId = caller;
    let currentWeekStart = getCurrentWeekStart();

    switch (users.get(userId)) {
      case (null) { #displayNameUpdateFailed };
      case (?userData) {
        let updatedPoints =
          (if (userData.lastUpdated < currentWeekStart) { 0 } else {
            userData.points;
          }) + points;
        let updatedUser : UserData = {
          userData with
          points = updatedPoints;
          lastUpdated = currentWeekStart;
          displayName;
        };
        users.add(userId, updatedUser);
        #displayNameUpdateFailed;
      };
    };
  };

  public query ({ caller }) func getCurrentWeekRanking() : async [RankingEntry] {
    let currentWeekStart = getCurrentWeekStart();
    let rankingList = users.entries().filter(
      func((_, userData)) {
        userData.lastUpdated >= currentWeekStart;
      }
    ).map(
      func((_, userData)) { toRankingEntry(userData) }
    );

    rankingList.toArray().sort(orderEntriesByPoints);
  };
};
