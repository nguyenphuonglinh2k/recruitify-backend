module.exports = {
  USER_ROLE: {
    admin: 1,
    hr: 2,
    manager: 3,
    candidate: 4,
  },

  PROGRESS_STATUS: {
    new: 1,
    doing: 2,
    done: 3,
  },

  JOB_AND_APPLICATION_STATUS: {
    active: 1,
    closed: 2,
  },

  APPLICATION_PROCESS_STATUS: {
    screening: 1,
    interview: 2,
    reject: 3,
    hire: 4,
  },

  RESULT_STATUS: {
    qualified: 1,
    unqualified: 2,
  },

  DEFAULT_AVATAR_URL:
    "https://res.cloudinary.com/coders-tokyo/image/upload/v1657474500/instello/avatar.png",

  BCRYPT_SALT_ROUNDS: 12,

  FORMAT_DATE_WITH_HYPHEN: "YYYY-MM-DD",
};
