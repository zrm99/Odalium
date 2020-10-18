module.exports = {
  verifySession: function verifySession(request) {
  	if (request.session.user != undefined) {
  		return true;
  	} else {
  		return false;
  	}
  },
  userRequirements: function userRequirements(username, password) {
    // uses positive look ahead to not consume match
    var usernameRequirements = new RegExp("[a-zA-Z]{3,}");
    var passwordRequirements = new RegExp("^(?=.*[0-9]{3,})(?=.*[a-zA-Z])(?=.*[!@#$%^&*])([a-zA-Z0-9!@#$%^&*]+)$");
    if (usernameRequirements.test(username) == true) {
      if (passwordRequirements.test(password) == false || password.length < 6 || password.length > 30) {
        throw "<h1>Password requirements not met</h1>";
      }
    } else if (usernameRequirements.test(username) == false  || username.length < 3 || username.length > 20) {
      throw "<h1>Username requirements not met</h1>";
    } else {
      throw 404;
    }
  },

  miniverseCreationForm: function miniverseCreationForm(req) {
    if (req.body.miniverseName == '' || req.body.miniverseSummary == '' || req.body.agreementTerms != '') {
      throw "<h1>Empty values</h1>";
    } else if (req.body.miniverseName.length > 20) {
      throw "<h1>Miniverse name too long</h1>";
    }
  },

}
