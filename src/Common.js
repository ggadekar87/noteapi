export const ServiceErrorResponse = (messase) => {
  return { Error: messase, Success: false };
};
export const ServiceResponse = (messase) => {
  return { Message: messase, Success: true };
};

export const ServiceResponseOK = (response) => {
  return { Data: response, Success: true };
};
