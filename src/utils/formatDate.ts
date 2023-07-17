import moment from 'moment';

export const formatDate = date => {
  const now = moment(date);
  const duration = moment.duration(now);
  const hours = duration.asHours();

  return hours <= 6 ? moment(date).fromNow() : moment(date).format('M/D/Y');
};

export const formatDay = date => {
    const now = moment(date);
    const duration = moment.duration(now);
    const hours = duration.asHours();
    return hours <= 6 ? moment(date).fromNow() : moment(date).format('D');
};

export const formatMonth = date => {
    const now = moment(date);
    const duration = moment.duration(now);
    const hours = duration.asHours();
    return hours <= 6 ? moment(date).fromNow() : moment(date).format('MMM');
};