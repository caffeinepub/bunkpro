import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

module {
  let maxLength = 63;
  let reservedSystemWords = ["ic", "2vxsx", "aaaaaaaa"];
  let regexPattern = "^[A-Za-z0-9_ ]+$";

  func isNotEmpty(name : Text) : Bool {
    name.trim(#char ' ') != "";
  };

  func isValidLength(name : Text) : Bool {
    name.size() <= maxLength;
  };

  func containsOnlyAllowedChars(name : Text) : Bool {
    name.contains(#predicate(func(c) { c >= 'A' and c <= 'Z' or c >= 'a' and c <= 'z' or c >= '0' and c <= '9' or c == ' ' or c == '_' }))
  };

  func isNotReservedWord(name : Text) : Bool {
    not reservedSystemWords.foldLeft(
      false,
      func(found, word) {
        found or Text.equal(name, word);
      },
    );
  };

  public func isValidName(name : Text) : () {
    if (not isNotEmpty(name)) {
      Runtime.trap("Name cannot be empty");
    };

    if (not isValidLength(name)) {
      Runtime.trap("Name can have max " # maxLength.toText() # " characters");
    };

    if (not containsOnlyAllowedChars(name)) {
      Runtime.trap("Name format is not valid");
    };

    if (not isNotReservedWord(name)) {
      Runtime.trap("Name contains reserved keyword");
    };
  };
};

