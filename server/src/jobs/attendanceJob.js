import cron from 'node-cron';
import supabase from '../config/supabaseClient.js';
import { getISTDate } from '../utils/dateHelper.js';

export const startAttendanceJob = () => {
  // Run at 2:00 AM every night (gives them time if they check out late)
  cron.schedule('0 2 * * *', async () => {
    console.log('Running nightly attendance cleanup job...');
    
    try {
      const today = getISTDate();

      // Find all records that have no check_out and the date is NOT today
      const { data: openRecords, error: fetchError } = await supabase
        .from('attendance')
        .select('*')
        .is('check_out', null)
        .neq('date', today);

      if (fetchError) {
        console.error('Error fetching open attendance records:', fetchError);
        return;
      }

      if (!openRecords || openRecords.length === 0) {
        console.log('No open attendance records found.');
        return;
      }

      console.log(`Found ${openRecords.length} employees who forgot to check out.`);

      let updatedCount = 0;

      for (const record of openRecords) {
        // Auto-checkout at their exact check-in time, making working_hours = 0
        const { error: updateError } = await supabase
          .from('attendance')
          .update({
            check_out: record.check_in, 
            working_hours: 0,
            status: 'Forgot Checkout'
          })
          .eq('id', record.id);

        if (updateError) {
          console.error(`Failed to auto-checkout record ${record.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }

      console.log(`Successfully auto-checked out ${updatedCount} records.`);

    } catch (err) {
      console.error('Nightly attendance cleanup crashed:', err);
    }
  });
};
