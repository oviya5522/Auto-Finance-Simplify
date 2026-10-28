/**
 * MotoLend Custom Reminders Storage and Utilities
 *
 * Persists scheduled custom reminders in LocalStorage and dispatches
 * standard storage and custom events for real-time reactivity.
 */

export const CUSTOM_REMINDERS_STORAGE_KEY = 'motoLendCustomReminders_data';
export const REMINDERS_UPDATE_EVENT = 'motoLend_custom_reminders_updated';

/**
 * Loads all saved custom reminders from localStorage.
 */
export const getCustomReminders = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_REMINDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load custom reminders from storage:', err);
    return [];
  }
};

/**
 * Evaluates the real-time status of a custom reminder.
 * Possible statuses:
 * - 'Completed'
 * - 'Cancelled'
 * - 'Overdue' (scheduled date & time have passed and reminder remains incomplete)
 * - 'Scheduled' (future scheduled date & time)
 * - 'Pending' (requires attention)
 */
export const evaluateCustomReminderStatus = (reminder) => {
  if (!reminder) return 'Pending';
  if (reminder.status === 'Completed') return 'Completed';
  if (reminder.status === 'Cancelled') return 'Cancelled';

  // Compare schedule date & time with now
  try {
    const scheduleDate = reminder.scheduleDate; // format: YYYY-MM-DD
    const scheduleTime = reminder.scheduleTime || '23:59'; // format: HH:mm or HH:mm AM/PM

    if (!scheduleDate) return reminder.status || 'Pending';

    // Parse time components
    let hours = 0;
    let minutes = 0;
    const timeStr = String(scheduleTime).trim();

    if (/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(timeStr)) {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const meridian = match[3] ? match[3].toLowerCase() : null;
        if (meridian === 'pm' && hours < 12) hours += 12;
        if (meridian === 'am' && hours === 12) hours = 0;
      }
    }

    const [year, month, day] = scheduleDate.split('-').map(Number);
    const scheduledDateTime = new Date(year, month - 1, day, hours, minutes, 0).getTime();
    const now = Date.now();

    if (scheduledDateTime < now) {
      return 'Overdue';
    }
    return 'Scheduled';
  } catch {
    return reminder.status || 'Pending';
  }
};

/**
 * Saves a new custom reminder.
 */
export const saveCustomReminder = (reminderData) => {
  if (!reminderData) throw new Error('Reminder data is required');

  const customerId = String(reminderData.customerId || '').trim();
  const customerName = String(reminderData.customerName || '').trim();
  const title = String(reminderData.title || '').trim();
  const scheduleDate = String(reminderData.scheduleDate || '').trim();

  if (!customerName) {
    throw new Error('Please select a customer.');
  }
  if (!title) {
    throw new Error('Please provide a reminder title.');
  }
  if (!scheduleDate) {
    throw new Error('Please select a schedule date.');
  }

  const existing = getCustomReminders();
  const newReminder = {
    id: `REM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerId,
    customerName,
    loanId: reminderData.loanId ? String(reminderData.loanId).trim() : null,
    title,
    reminderType: reminderData.reminderType || 'Payment Follow-up',
    message: String(reminderData.message || '').trim(),
    priority: reminderData.priority || 'Medium', // 'High' | 'Medium' | 'Low'
    scheduleDate,
    scheduleTime: reminderData.scheduleTime || '10:00 AM',
    repeat: reminderData.repeat || 'Does Not Repeat',
    notes: String(reminderData.notes || '').trim(),
    status: reminderData.status || 'Scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newReminder, ...existing];
  try {
    localStorage.setItem(CUSTOM_REMINDERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(REMINDERS_UPDATE_EVENT, { detail: newReminder }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save custom reminder to storage:', err);
    throw new Error('Failed to save reminder to local storage.');
  }

  return newReminder;
};

/**
 * Updates an existing custom reminder's status or properties.
 */
export const updateCustomReminder = (id, updates = {}) => {
  if (!id) return null;
  const reminders = getCustomReminders();
  let updatedRecord = null;

  const nextList = reminders.map((r) => {
    if (r.id === id) {
      updatedRecord = {
        ...r,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updatedRecord;
    }
    return r;
  });

  if (updatedRecord) {
    try {
      localStorage.setItem(CUSTOM_REMINDERS_STORAGE_KEY, JSON.stringify(nextList));
      window.dispatchEvent(new CustomEvent(REMINDERS_UPDATE_EVENT, { detail: updatedRecord }));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Failed to update reminder in storage:', err);
    }
  }

  return updatedRecord;
};

/**
 * Deletes a custom reminder by ID.
 */
export const deleteCustomReminder = (id) => {
  if (!id) return;
  const reminders = getCustomReminders();
  const nextList = reminders.filter((r) => r.id !== id);
  try {
    localStorage.setItem(CUSTOM_REMINDERS_STORAGE_KEY, JSON.stringify(nextList));
    window.dispatchEvent(new CustomEvent(REMINDERS_UPDATE_EVENT, { detail: { id, deleted: true } }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to delete reminder from storage:', err);
  }
};
