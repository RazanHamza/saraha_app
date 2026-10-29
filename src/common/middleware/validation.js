
 

export const validation = (schema) => {
  return (req, res, next) => {
    const errorResult = [];

    for (const key of Object.keys(schema)) {
      const { error } = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (error) {
        error.details.forEach((err) => {
          errorResult.push({
            message: err.message,
            path: err.path.join("."),
            key,
          });
        });
      }
    }

    if (errorResult.length > 0) {
      return res.status(400).json({
        message: "validation error",
        errorResult,
      });
    }

    next();
  };
};

