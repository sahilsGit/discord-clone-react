const responseInterceptor = (req, res, next) => {
  if (res.locals.newAccessToken) {
    res.body = { newAccessToken: res.locals.newAccessToken };
  }
  next();
};

export default responseInterceptor;
