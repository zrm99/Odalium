var createTopicReplyButton = document.getElementById("create-reply-form");
document.getElementById("reply-button-container").addEventListener("click", function(event) {
  if (createTopicReplyButton.style.display === "block" && (event.target.name != "replyContent" && event.target.name != "")) {
    createTopicReplyButton.style.display = "none";
  } else {
    createTopicReplyButton.style.display = "block";
  }
});

var createTopicDeleteButton = document.getElementById("delete-reply-form");
document.getElementById("delete-reply-container").addEventListener("click", function(event) {
  if (createTopicDeleteButton.style.display === "block" && (event.target.name != "replyCreator" && event.target.name != "" && event.target.name != "replyID")) {
    createTopicDeleteButton.style.display = "none";
  } else {
    createTopicDeleteButton.style.display = "block";
  }
});
