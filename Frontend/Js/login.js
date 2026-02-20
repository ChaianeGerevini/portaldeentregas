const supabase = window.supabase.createClient(
  "SUA_URL_SUPABASE",
  "SUA_ANON_KEY"
);

async function login() {

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    alert("Login inválido");
  } else {
    window.location.href = "dashboard.html";
  }
}
