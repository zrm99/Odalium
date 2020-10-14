var profilePostButton = document.getElementById("profile-post-form");
document.getElementById("profile-post-container").addEventListener("click", function(event) {
  if (profilePostButton.style.display === "block" && (event.target.name != "profilePostContent" && event.target.name != "")) {
    profilePostButton.style.display = "none";
  } else {
    profilePostButton.style.display = "block";
  }
});
