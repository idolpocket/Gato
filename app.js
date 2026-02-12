let currentUser = null;
const godAccounts = ["gato", "zeh"];
const godModePasswords = { "gato": "GatoByZeh@", "zeh": "ZehIsDiva&" };

// ===== INICIALIZAÇÃO =====
window.addEventListener("load", () => {
  const savedUser = JSON.parse(localStorage.getItem("currentUser"));
  if (savedUser) { loginUser(savedUser.username, false); }
  initTabs();
});

// ===== LOGIN =====
document.getElementById("loginBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Preenche todos os campos!");
  loginUser(username, true, password);
});

function loginUser(username, manual = true, password = "") {
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let userObj = users.find(u => u.username === username);

  if (godAccounts.includes(username)) {
    if (manual && password !== godModePasswords[username]) return alert("Senha incorreta!");
    currentUser = username;
    if (!userObj) { users.push({ username, password: godModePasswords[username], verified: true }); }
  } else {
    if (!userObj) {
      if (!manual) return;
      users.push({ username, password, verified: false });
      alert("Conta criada! Bem-vindo @" + username);
    } else {
      if (manual && userObj.password !== password) return alert("Senha incorreta!");
      currentUser = username;
      if (manual) alert("Login efetuado! Bem-vindo @" + username);
    }
  }

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify({ username: currentUser }));
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("welcome").innerText = "Bem-vindo @" + currentUser;

  loadFeed(); loadMessages(); checkGodMode();
}

// ===== LOGOUT =====
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUser"); currentUser = null;
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
});

// ===== ABAS =====
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabs = document.querySelectorAll(".tab");

  tabButtons.forEach(btn => btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  }));
}

// ===== CRIAR POST =====
document.getElementById("addPostBtn").addEventListener("click", () => {
  const text = document.getElementById("postText").value.trim();
  if (!text) return alert("Escreve algo para postar!");

  let blogs = JSON.parse(localStorage.getItem("blogs") || "{}");
  if (!blogs[currentUser]) blogs[currentUser] = { title: currentUser + "'s Blog", posts: [] };

  blogs[currentUser].posts.push({ text, date: new Date() });
  localStorage.setItem("blogs", JSON.stringify(blogs));
  document.getElementById("postText").value = "";
  loadFeed();
});

// ===== FEED =====
function loadFeed() {
  const feed = document.getElementById("feed"); feed.innerHTML = "";
  let blogs = JSON.parse(localStorage.getItem("blogs") || "{}");
  let users = JSON.parse(localStorage.getItem("users") || "[]");

  for (let user in blogs) {
    let userObj = users.find(u => u.username === user);
    blogs[user].posts.slice().reverse().forEach((post, index) => {
      const div = document.createElement("div"); div.className = "post";
      let verifiedMark = userObj && userObj.verified ? " ✔️" : "";
      div.innerHTML = `<strong>@${user}${verifiedMark}</strong> (${new Date(post.date).toLocaleString()}):<br>${post.text}`;
      feed.appendChild(div);
    });
  }
}

// ===== MENSAGENS =====
document.getElementById("sendMsgBtn").addEventListener("click", () => {
  const toUser = document.getElementById("msgTo").value.trim();
  const text = document.getElementById("msgText").value.trim();
  if (!toUser || !text) return alert("Preenche todos os campos!");
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  if (!users.find(u => u.username === toUser)) return alert("Esse GATTAG não existe!");

  let messages = JSON.parse(localStorage.getItem("messages") || "{}");
  if (!messages[toUser]) messages[toUser] = [];
  messages[toUser].push({ from: currentUser, text, date: new Date() });
  localStorage.setItem("messages", JSON.stringify(messages));
  document.getElementById("msgText").value = ""; loadMessages();
});
function loadMessages() {
  const messagesDiv = document.getElementById("messages"); messagesDiv.innerHTML = "";
  let messages = JSON.parse(localStorage.getItem("messages") || "{}");
  if (!messages[currentUser]) return;
  messages[currentUser].slice().reverse().forEach(msg => {
    const div = document.createElement("div"); div.className = "message";
    div.innerHTML = `<strong>@${msg.from}</strong> (${new Date(msg.date).toLocaleString()}): ${msg.text}`;
    messagesDiv.appendChild(div);
  });
}

// ===== GOD MODE =====
function checkGodMode() {
  const godBtn = document.querySelector(".god-btn");
  if (godAccounts.includes(currentUser)) {
    godBtn.style.display = "inline-block"; loadGodUsers();
  } else godBtn.style.display = "none";
}

function loadGodUsers(search = "") {
  const godDiv = document.getElementById("godUsers"); godDiv.innerHTML = "";
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let blogs = JSON.parse(localStorage.getItem("blogs") || "{}");

  let filtered = search ? users.filter(u => u.username.includes(search)) : users;

  filtered.forEach(u => {
    const div = document.createElement("div"); div.className = "god-user";
    div.innerHTML = `<span>@${u.username} ${u.verified ? "✔️" : ""}</span>`;
    if (!godAccounts.includes(u.username)) {
      const verifyBtn = document.createElement("button");
      verifyBtn.innerText = u.verified ? "Desverificar" : "Verificar";
      verifyBtn.onclick = () => {
        u.verified = !u.verified; localStorage.setItem("users", JSON.stringify(users)); loadGodUsers();
        loadFeed();
      };
      div.appendChild(verifyBtn);
      if (blogs[u.username] && blogs[u.username].posts.length > 0) {
        const delBtn = document.createElement("button");
        delBtn.innerText = "Deletar Posts"; delBtn.onclick = () => {
          blogs[u.username].posts = []; localStorage.setItem("blogs", JSON.stringify(blogs));
          loadGodUsers(); loadFeed();
        };
        div.appendChild(delBtn);
      }
    }
    godDiv.appendChild(div);
  });
}

// ===== PESQUISA GOD MODE =====
document.getElementById("searchGodBtn").addEventListener("click", () => {
  const search = document.getElementById("searchGod").value.trim();
  loadGodUsers(search);
});
