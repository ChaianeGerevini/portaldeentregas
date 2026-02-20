const supabase = window.supabase.createClient(
  "SUA_URL_SUPABASE",
  "SUA_ANON_KEY"
);

document.addEventListener("DOMContentLoaded", async () => {

  const { data: { user } } = await supabase.auth.getUser();

  // Se não estiver logado, manda pro login
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Mostrar email ou nome na sidebar
  const usuarioElemento = document.getElementById("usuarioLogado");
  if (usuarioElemento) {
    usuarioElemento.innerText = `👤 ${user.email}`;
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "login.html";
    });
  }

});
