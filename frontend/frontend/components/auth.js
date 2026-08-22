export function logoutUser(router) {
  localStorage.removeItem("rmsjToken");
  localStorage.removeItem("rmsjRefresh");
  localStorage.removeItem("rmsjRole");
  localStorage.removeItem("rmsjUsername");
  localStorage.removeItem("rmsjFullName");
  localStorage.removeItem("rmsjUser");

  router.replace("/");
}


export function confirmLogout(router) {
  const confirmed = window.confirm(
    "Are you sure you want to log out?"
  );

  if (!confirmed) {
    return false;
  }

  logoutUser(router);

  return true;
}