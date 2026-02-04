const supabaseUrl = "https://uhilmiekxkfdivejkebx.supabase.co";
const supabaseKey = "sb_publishable_ePVudy96lnfrBC7fApdILw_mcFhoxrF";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const remember = document.getElementById("rememberMe").checked;
  const message = document.getElementById("message");

  message.innerText = "";
  message.className = "";

  // Validation
  if (!email || !password) {
    message.innerText = "E-posta ve şifre giriniz";
    message.className = "error";
    return;
  }

  // Email format validation (optional)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    message.innerText = "Geçerli bir e-posta adresi giriniz";
    message.className = "error";
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Login error:", error.message);
      message.innerText = "E-posta veya şifre yanlış";
      message.className = "error";
      return;
    }

    // ✅ Login successful
    console.log("Login successful:", data.user.email);
    
    // Remember me - Supabase oturum süresini ayarla
    if (remember) {
      // 30 gün süreyle hatırla
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });
      
      // Alternatif: localStorage'a token kaydet (gerekirse)
      localStorage.setItem("sb-remember", "true");
    } else {
      // Session storage için (browser kapandığında silinsin)
      sessionStorage.setItem("sb-temp-session", "true");
      localStorage.removeItem("sb-remember");
    }

    // Başarı mesajı
    message.innerText = "Giriş başarılı! Yönlendiriliyorsunuz...";
    message.className = "success";

    // Kısa gecikme ile yönlendirme (kullanıcı mesajı görebilsin)
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);

  } catch (err) {
    console.error("Unexpected error:", err);
    message.innerText = "Bir hata oluştu. Lütfen tekrar deneyin.";
    message.className = "error";
  }
}

// Enter tuşu ile login
document.addEventListener("DOMContentLoaded", function() {
  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        login();
      }
    });
  }
});
