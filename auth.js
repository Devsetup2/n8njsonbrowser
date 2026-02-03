 const supabaseUrl = "https://uhilmiekxkfdivejkebx.supabase.co";
  const supabaseKey = "sb_publishable_ePVudy96lnfrBC7fApdILw_mcFhoxrF";
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

  // ?? Yetki kontrol�
  (function () {
    const remember = localStorage.getItem("remember") === "true";
    const storage = remember ? localStorage : sessionStorage;

    const session = storage.getItem("sb-session");
    if (!session) {
      window.location.href = "login.html";
    }
  })();

  async function logout() {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "login.html";
  }
