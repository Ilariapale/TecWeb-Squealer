// services/rest.js
import axios from 'axios';

export const getRelativeTime = (input_date: Date | undefined) => {
  const now = new Date();
  const date = new Date(input_date || 0);
  let n = now.getTime();
  let d = new Date(date).getTime();
  const diff = now.getTime() - date.getTime();
  const minutesAgo = Math.floor(diff / (1000 * 60));

  if (isToday(date, now)) {
    if (minutesAgo < 1) return 'Now';
    else if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
    else return formatTime(date);
  } else if (isYesterday(date, now)) {
    return `Yesterday at ${formatTime(date)}`;
  } else {
    return formatDate(date);
  }
};

export const isYesterday = (date: Date, now: Date) => {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export const isToday = (date: Date, now: Date) => {
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

export const formatTime = (date: Date) => {
  // Personalizza il formato dell'orario in base alle tue esigenze
  return `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
};

export const formatDate = (date: Date) => {
  // Personalizza il formato della data in base alle tue esigenze
  return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(
    -2
  )}/${date.getFullYear()}`;
};
