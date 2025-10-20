const Joi = require('joi');

function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.params) {
        const { error, value } = schemas.params.validate(req.params);
        if (error) return res.status(400).json({ error: error.details[0].message });
        req.params = value;
      }
      if (schemas.query) {
        const { error, value } = schemas.query.validate(req.query);
        if (error) return res.status(400).json({ error: error.details[0].message });
        req.query = value;
      }
      if (schemas.body) {
        const { error, value } = schemas.body.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
        req.body = value;
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { validate, Joi };


