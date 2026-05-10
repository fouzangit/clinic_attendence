export const calculateSalary = (
  employee,
  attendanceRecords
) => {

  // =========================
  // TOTAL HOURS
  // =========================

  const totalHours =
    attendanceRecords.reduce(
      (sum, record) => {

        return (
          sum +
          Number(
            record.working_hours || 0
          )
        )

      },
      0
    )

  // =========================
  // TOTAL LATE MINUTES
  // =========================

  const totalLateMinutes =
    attendanceRecords.reduce(
      (sum, record) => {

        return (
          sum +
          Number(
            record.late_minutes || 0
          )
        )

      },
      0
    )

  // =========================
  // GROSS SALARY
  // =========================

  const hourlyRate =
    Number(employee.hourly_rate || 0)

  const grossSalary =
    totalHours *
    hourlyRate

  // =========================
  // PER MINUTE DEDUCTION
  // =========================

  const perMinuteRate =
    hourlyRate / 60

  const calculatedDeduction =
    totalLateMinutes *
    perMinuteRate

  const deduction =
    Math.min(grossSalary, calculatedDeduction)

  // =========================
  // FINAL SALARY
  // =========================

  const finalSalary =
    Math.max(0, grossSalary - deduction)

  return {
    totalHours: Number(totalHours.toFixed(2)),
    totalLateMinutes: Number(totalLateMinutes),
    grossSalary: Number(grossSalary.toFixed(2)),
    deduction: Number(deduction.toFixed(2)),
    finalSalary: Number(finalSalary.toFixed(2)),
    calculatedDeduction: Number(calculatedDeduction.toFixed(2)),
    attendanceCount: attendanceRecords.length
  }

}
