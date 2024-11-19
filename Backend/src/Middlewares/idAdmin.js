const isAdmin = (req, res, next) => {
  const userRole = req.userRole;
  if (userRole !== 'admin') {
    return res.status(401).json({
      message:
        "vous n'avez pas les droits necessaires pour effectuer cette action",
    });
  }
  next();
};

export default isAdmin;
