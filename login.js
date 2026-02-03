const supabaseUrl = "https://uhilmiekxkfdivejkebx.supabase.co";
const supabaseKey = "sb_publishable_ePVudy96lnfrBC7fApdILw_mcFhoxrF";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const remember = document.getElementById("rememberMe").checked;
  const message = document.getElementById("message");

  message.innerText = "";

  if (!email || !password) {
    message.innerText = "E-posta ve şifre giriniz";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message.innerText = "E-posta veya şifre yanlış";
    return;
  }

  // ✅ GİRİŞ BAŞARILI
  const storage = remember ? localStorage : sessionStorage;

  storage.setItem("sb-session", JSON.stringify(data.session));
  localStorage.setItem("remember", remember);

  // 👉 SADECE BURADA YÖNLENDİRİR
  window.location.href = "dashboard.html";
}
