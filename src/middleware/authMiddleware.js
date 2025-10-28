export function ensureAuthenticated(req, res, next) {
  if (!req.session.user) {
    req.flash("error", "Please login first");
    return res.redirect("/login");
  }
  next();
}

export function ensureAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "ADMIN") {
    req.flash("error", "Access denied. Admins only.");
    return res.redirect("/login");
  }
  next();
}