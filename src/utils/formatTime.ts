import moment from 'moment';
import momentTz from 'moment-timezone';

const SECONDS_PER_MINUTE = 60;
export const EXPECTED_TIMEZONE = 'America/New_York';

export const getTimestampWithTimezoneOffset = (timestamp: number) => {
  const timezoneOffset = -momentTz.tz(timestamp, EXPECTED_TIMEZONE).utcOffset() * SECONDS_PER_MINUTE;
  return moment(timestamp).unix() - timezoneOffset;
};

export const formatTime = (timestamp: number) => {
  return getTimestampWithTimezoneOffset(timestamp);
};
