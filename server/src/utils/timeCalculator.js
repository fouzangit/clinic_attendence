import { getISTTimeDetails } from './dateHelper.js';

export const getShiftDetails = (
  employee
) => {

  const { hour: currentHour, minute: currentMinute, totalMinutes: currentTime } = getISTTimeDetails();

  // Morning start
  const morningStart =
    employee.role === 'doctor'
      ? 10 * 60
      : 9 * 60

  // Evening start
  const eveningStart =
    employee.role === 'doctor'
      ? 18 * 60
      : 17 * 60

  // Grace periods
  const morningGrace = 30
  const eveningGrace = 15

  // MORNING SHIFT (Allow check-in 1 hour early)
  if (
    currentTime >= morningStart - 60 &&
    currentTime <= morningStart + 360
  ) {

    const lateMinutes =
      Math.max(
        0,
        currentTime -
        (morningStart + morningGrace)
      )

    return {
      shift: 'morning',
      lateMinutes
    }

  }

  // EVENING SHIFT (Allow check-in 1 hour early)
  if (
    currentTime >= eveningStart - 60 &&
    currentTime <= eveningStart + 240
  ) {

    const lateMinutes =
      Math.max(
        0,
        currentTime -
        (eveningStart + eveningGrace)
      )

    return {
      shift: 'evening',
      lateMinutes
    }

  }

  return null

}