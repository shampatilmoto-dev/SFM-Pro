const { ZodError } = require("zod");

function parseSchema(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

function validationMiddleware(schema, source = "body") {
  return (request, _response, next) => {
    try {
      request.validated = request.validated || {};
      request.validated[source] = parseSchema(schema, request[source]);
      next();
    } catch (error) {
      next(error);
    }
  };
}

function isZodError(error) {
  return error instanceof ZodError;
}

module.exports = {
  parseSchema,
  validationMiddleware,
  isZodError
};
