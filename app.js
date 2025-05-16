// Admin ve öğrenci yönetimi kodu
document.addEventListener("DOMContentLoaded", () => {
  const adminUsers = {
    "admin1": { password: "123", role: "admin" },
    "admin2": { password: "123", role: "admin" }
  };

  let users = JSON.parse(localStorage.getItem("users")) || {};
  for (const adminName in adminUsers) {
    if (!users[adminName]) {
      users[adminName] = adminUsers[adminName];
    }
  }
  localStorage.setItem("users", JSON.stringify(users));

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    if (currentUser.role === "admin") {
      showSection("admin");
    } else {
      showSection("kullanici");
      showKullaniciPanel();
    }
  } else {
    showSection("giris");
  }

  updateHeaderLinks();
  loadDersler();
  loadEtkinlikler();
});

function showKullaniciPanel() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || !currentUser.sinif) return;
  
  loadDersler();
  loadEtkinlikler();
}

function showSection(id) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// Kullanıcı işlemleri
function kayitOl() {
  const user = document.getElementById("registerUsername").value;
  const pass = document.getElementById("registerPassword").value;
  const pass2 = document.getElementById("registerPasswordAgain").value;
  const sinif = document.getElementById("registerSinif").value;

  if (!user || !pass || !pass2 || !sinif) return alert("Tüm alanları doldurun!");
  if (pass !== pass2) return alert("Şifreler eşleşmiyor!");

  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[user]) return alert("Bu kullanıcı adı zaten var!");

  users[user] = { password: pass, role: "user", sinif: sinif };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Kayıt başarılı!");
  showSection('giris');
}

function girisYap() {
  const user = document.getElementById("loginUsername").value;
  const pass = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[user] && users[user].password === pass) {
    localStorage.setItem("currentUser", JSON.stringify({ 
      username: user, 
      role: users[user].role,
      sinif: users[user].sinif 
    }));
    if (users[user].role === "admin") {
      showSection("admin");
    } else {
      showSection("kullanici");
      showKullaniciPanel();
    }
    updateHeaderLinks();
  } else {
    alert("Kullanıcı adı veya şifre yanlış!");
  }
}

function updateHeaderLinks() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const adminLink = document.getElementById("adminLink");
  const userLink = document.getElementById("userLink");
  const loginNav = document.getElementById("girisNav");
  const registerNav = document.getElementById("kayitNav");
  const logoutNav = document.getElementById("logoutNav");

  if (!user) {
    adminLink.style.display = "none";
    userLink.style.display = "none";
    logoutNav.style.display = "none";
    loginNav.style.display = "inline-block";
    registerNav.style.display = "inline-block";
    return;
  }

  logoutNav.style.display = "inline-block";
  loginNav.style.display = "none";
  registerNav.style.display = "none";

  if (user.role === "admin") {
    adminLink.style.display = "inline-block";
    userLink.style.display = "none";
  } else {
    adminLink.style.display = "none";
    userLink.style.display = "inline-block";
  }
}

// Ders programı işlemleri
function dersEkle() {
  const sinif = document.getElementById("sinif").value;
  const gun = document.getElementById("gun").value;
  const saat = document.getElementById("saat").value;
  const dersAdi = document.getElementById("dersAdi").value;
  const dersTuru = document.getElementById("dersTuru").value;

  if (!sinif || !gun || !saat || !dersAdi || !dersTuru) {
    alert("Tüm alanları doldurun!");
    return;
  }

  let dersler = JSON.parse(localStorage.getItem("dersler")) || [];
  dersler.push({
    sinif,
    gun,
    saat,
    dersAdi,
    dersTuru
  });

  localStorage.setItem("dersler", JSON.stringify(dersler));
  alert("Ders başarıyla eklendi!");
  loadDersler();
}

function loadDersler() {
  const dersler = JSON.parse(localStorage.getItem("dersler")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const tbody = document.querySelector("#dersTablosu tbody");
  
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  dersler.forEach(ders => {
    if (!currentUser || currentUser.role === "admin" || currentUser.sinif === ders.sinif) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${ders.dersTuru}</td>
        <td>${ders.dersAdi}</td>
        <td>${ders.gun}</td>
        <td>${ders.saat}</td>
      `;
      tbody.appendChild(row);
    }
  });
}

// Etkinlik işlemleri
function etkinlikEkle() {
  const kulup = document.getElementById("kulup").value;
  const tarih = document.getElementById("etkinlikTarihi").value;
  const aciklama = document.getElementById("etkinlikAciklama").value;

  if (!kulup || !tarih || !aciklama) {
    alert("Tüm alanları doldurun!");
    return;
  }

  let etkinlikler = JSON.parse(localStorage.getItem("etkinlikler")) || [];
  etkinlikler.push({
    kulup,
    tarih,
    aciklama,
    likes: 0,
    dislikes: 0,
    comments: [],
    id: Date.now()
  });

  localStorage.setItem("etkinlikler", JSON.stringify(etkinlikler));
  alert("Etkinlik başarıyla eklendi!");
  loadEtkinlikler();
}

function loadEtkinlikler() {
  const etkinlikler = JSON.parse(localStorage.getItem("etkinlikler")) || [];
  const etkinlikAlani = document.getElementById("etkinlikAlani");
  
  if (!etkinlikAlani) return;
  
  etkinlikAlani.innerHTML = "";
  
  etkinlikler.forEach(etkinlik => {
    const div = document.createElement("div");
    div.className = "etkinlik";
    div.innerHTML = `
      <h4>${etkinlik.kulup}</h4>
      <p><strong>Tarih:</strong> ${etkinlik.tarih}</p>
      <p>${etkinlik.aciklama}</p>
      <div class="etkinlik-actions">
        <button onclick="likeEtkinlik(${etkinlik.id})">👍 ${etkinlik.likes}</button>
        <button onclick="dislikeEtkinlik(${etkinlik.id})">👎 ${etkinlik.dislikes}</button>
      </div>
      <div class="comments">
        ${etkinlik.comments.map(comment => `
          <div class="comment">
            <strong>${comment.user}:</strong> ${comment.text}
          </div>
        `).join('')}
      </div>
      <div class="comment-form">
        <input type="text" placeholder="Yorumunuz..." id="comment-${etkinlik.id}">
        <button onclick="addComment(${etkinlik.id})">Yorum Ekle</button>
      </div>
    `;
    etkinlikAlani.appendChild(div);
  });
}

function likeEtkinlik(id) {
  let etkinlikler = JSON.parse(localStorage.getItem("etkinlikler")) || [];
  const index = etkinlikler.findIndex(e => e.id === id);
  if (index !== -1) {
    etkinlikler[index].likes++;
    localStorage.setItem("etkinlikler", JSON.stringify(etkinlikler));
    loadEtkinlikler();
  }
}

function dislikeEtkinlik(id) {
  let etkinlikler = JSON.parse(localStorage.getItem("etkinlikler")) || [];
  const index = etkinlikler.findIndex(e => e.id === id);
  if (index !== -1) {
    etkinlikler[index].dislikes++;
    localStorage.setItem("etkinlikler", JSON.stringify(etkinlikler));
    loadEtkinlikler();
  }
}

function addComment(id) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("Yorum yapmak için giriş yapmalısınız!");
    return;
  }

  const commentText = document.getElementById(`comment-${id}`).value;
  if (!commentText.trim()) return;

  let etkinlikler = JSON.parse(localStorage.getItem("etkinlikler")) || [];
  const index = etkinlikler.findIndex(e => e.id === id);
  if (index !== -1) {
    etkinlikler[index].comments.push({
      user: currentUser.username,
      text: commentText
    });
    localStorage.setItem("etkinlikler", JSON.stringify(etkinlikler));
    loadEtkinlikler();
  }
}

function cikisYap() {
  localStorage.removeItem("currentUser");
  showSection("giris");
  updateHeaderLinks();
}