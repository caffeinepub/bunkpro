import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

module {
  type OldWeeklySnapshot = {
    userId : Principal;
    weekNumber : Nat;
    rankPosition : Nat;
    weeklyPoints : Nat;
    longestStreak : Nat;
  };

  type OldUserData = {
    displayName : Text;
    points : Nat;
    streak : Nat;
    joinDate : Time.Time;
    lastUpdated : Int;
    longestStreak : Nat;
    currentStreak : Nat;
    college : ?Text;
    email : ?Text;
  };

  type NewRankingDetails = {
    displayName : Text;
    college : ?Text;
    points : Nat;
    streak : Nat;
    joinDate : Time.Time;
    longestStreak : Nat;
  };

  type NewUserData = {
    displayName : Text;
    points : Nat;
    streak : Nat;
    joinDate : Time.Time;
    longestStreak : Nat;
    currentStreak : Nat;
    college : ?Text;
    rankingDetails : NewRankingDetails;
  };

  type OldActor = {
    weeklySnapshots : Map.Map<Nat, Map.Map<Principal, OldWeeklySnapshot>>;
    lastSnapshottedWeek : Nat;
    users : Map.Map<Principal, OldUserData>;
  };

  type NewActor = {
    users : Map.Map<Principal, NewUserData>;
    lastRecalculated : ?Time.Time;
  };

  public func run(old : OldActor) : NewActor {
    let newUsers = old.users.map<Principal, OldUserData, NewUserData>(
      func(_userId, oldUserData) {
        {
          oldUserData with
          email = null; // Remove the email field in new version.
          rankingDetails = createRankingDetails(oldUserData);
        };
      }
    );
    { users = newUsers; lastRecalculated = null };
  };

  func createRankingDetails(userData : OldUserData) : NewRankingDetails {
    {
      displayName = userData.displayName;
      college = userData.college;
      points = userData.points;
      streak = userData.streak;
      joinDate = userData.joinDate;
      longestStreak = userData.longestStreak;
    };
  };
};
