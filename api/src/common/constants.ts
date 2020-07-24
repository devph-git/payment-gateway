const constants = {
  SALT_ROUNDS: 10,
  RATELIMIT: {
    max: 50,
    timeWindow: '1 minute',
  },
  SWAGGER: {
    TITLE: 'payment-gateway',
    VERSION: '1.0.0',
    DESCRIPTION:
      'You can find out more about the opensource project at https://github.com/devph-io/payment-gateway.',
  },
};

export default constants;
