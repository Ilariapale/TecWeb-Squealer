const MAX_DESCRIPTION_LENGTH = 140;
const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 20;
const CHANNEL_NAME_MIN_LENGTH = 5;
const CHANNEL_NAME_MAX_LENGTH = 23;
const OFFICIAL_CHANNEL_NAME_MIN_LENGTH = 5;
const OFFICIAL_CHANNEL_NAME_MAX_LENGTH = 23;
const KEYWORD_MIN_LENGTH = 4;
const KEYWORD_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;
const MEDIA_QUOTA = { image: 125, video: 300, position: 150 }; //char_quota per image
const DIRECT_MESSAGE_MAX_LENGTH = 1000;

module.exports = {
  MAX_DESCRIPTION_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  CHANNEL_NAME_MIN_LENGTH,
  CHANNEL_NAME_MAX_LENGTH,
  OFFICIAL_CHANNEL_NAME_MIN_LENGTH,
  OFFICIAL_CHANNEL_NAME_MAX_LENGTH,
  KEYWORD_MIN_LENGTH,
  KEYWORD_MAX_LENGTH,
  MEDIA_QUOTA,
  PASSWORD_MIN_LENGTH,
  DIRECT_MESSAGE_MAX_LENGTH,
};
