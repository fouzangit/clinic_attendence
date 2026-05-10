import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kolkata';

/**
 * Get current date in IST (YYYY-MM-DD)
 */
export const getISTDate = () => {
    return formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
};

/**
 * Get current date and time as a standard ISO string for DB storage.
 */
export const getStorageTime = () => {
    return new Date().toISOString();
};

/**
 * Get current date and time in IST (as a Date object for legacy reasons).
 */
export const getISTDateTime = () => {
    const istStr = formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
    return new Date(istStr);
};

/**
 * Get current hour and minute in IST
 */
export const getISTTimeDetails = () => {
    const now = new Date();
    const hour = parseInt(formatInTimeZone(now, TIMEZONE, 'H'));
    const minute = parseInt(formatInTimeZone(now, TIMEZONE, 'm'));
    return { hour, minute, totalMinutes: hour * 60 + minute };
};
