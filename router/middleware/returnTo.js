module.exports = function (req, res, next) {
    res.locals.returnTo = req.originalUrl;
}