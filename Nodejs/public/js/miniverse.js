var createMiniverseTopicButton = document.getElementById("create-post-form");
document.getElementById("create-post-container").addEventListener("click", function(event) {
  if (createMiniverseTopicButton.style.display === "block" && (event.target.name != "topicTitle" && event.target.name != "topicContent" && event.target.name != "")) {
    createMiniverseTopicButton.style.display = "none";
  } else {
    createMiniverseTopicButton.style.display = "block";
  }
});
