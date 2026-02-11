let user = null;

function login() {
  const name = document.getElementById("username").value;

  if (!name) return;

  user = name;

  document.querySelector(".login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("welcome").innerText =
    "Bem-vindo " + user + " 🐱";
}

function addPost() {
  const text = document.getElementById("postText").value;

  if (!text) return;

  const feed = document.getElementById("feed");

  const post = document.createElement("div");
  post.className = "post";
  post.innerHTML = `<strong>${user}</strong><p>${text}</p>`;

  feed.prepend(post);

  document.getElementById("postText").value = "";
}
