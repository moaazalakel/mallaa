import { STORAGE_KEYS } from './constants';

// Generic storage operations
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },
};

// Entity-specific CRUD operations
export const usersStorage = {
  getAll: () => storage.get(STORAGE_KEYS.USERS) || [],
  save: (users) => storage.set(STORAGE_KEYS.USERS, users),
  findById: (id) => {
    const users = usersStorage.getAll();
    return users.find((u) => u.id === id);
  },
  findByUsername: (username) => {
    const users = usersStorage.getAll();
    return users.find((u) => u.username === username);
  },
  update: (id, updates) => {
    const users = usersStorage.getAll();
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      usersStorage.save(users);
      return users[index];
    }
    return null;
  },
};

export const casesStorage = {
  getAll: () => storage.get(STORAGE_KEYS.CASES) || [],
  save: (cases) => storage.set(STORAGE_KEYS.CASES, cases),
  findById: (id) => {
    const cases = casesStorage.getAll();
    return cases.find((c) => c.id === id);
  },
  findByGovernorate: (governorateId) => {
    const cases = casesStorage.getAll();
    return cases.filter((c) => c.governorateId === governorateId);
  },
  create: (caseData) => {
    const cases = casesStorage.getAll();
    const newCase = {
      ...caseData,
      id: caseData.id || `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: caseData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    cases.push(newCase);
    casesStorage.save(cases);
    return newCase;
  },
  update: (id, updates) => {
    const cases = casesStorage.getAll();
    const index = cases.findIndex((c) => c.id === id);
    if (index !== -1) {
      cases[index] = {
        ...cases[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      casesStorage.save(cases);
      return cases[index];
    }
    return null;
  },
  delete: (id) => {
    const cases = casesStorage.getAll();
    const filtered = cases.filter((c) => c.id !== id);
    casesStorage.save(filtered);
    return filtered.length < cases.length;
  },
};

export const auditsStorage = {
  getAll: () => storage.get(STORAGE_KEYS.AUDITS) || [],
  save: (audits) => storage.set(STORAGE_KEYS.AUDITS, audits),
  findByCaseId: (caseId) => {
    const audits = auditsStorage.getAll();
    return audits.find((a) => a.caseId === caseId);
  },
  findBySpecialistId: (specialistId) => {
    const audits = auditsStorage.getAll();
    return audits.filter((a) => a.specialistId === specialistId);
  },
  create: (auditData) => {
    const audits = auditsStorage.getAll();
    const newAudit = {
      ...auditData,
      id: auditData.id || `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submittedAt: auditData.submittedAt || new Date().toISOString(),
    };
    audits.push(newAudit);
    auditsStorage.save(audits);
    return newAudit;
  },
  update: (id, updates) => {
    const audits = auditsStorage.getAll();
    const index = audits.findIndex((a) => a.id === id);
    if (index !== -1) {
      audits[index] = { ...audits[index], ...updates };
      auditsStorage.save(audits);
      return audits[index];
    }
    return null;
  },
};

export const activitiesStorage = {
  getAll: () => storage.get(STORAGE_KEYS.ACTIVITIES) || [],
  save: (activities) => storage.set(STORAGE_KEYS.ACTIVITIES, activities),
  findByGovernorate: (governorateId) => {
    const activities = activitiesStorage.getAll();
    return activities.filter((a) => a.governorateId === governorateId);
  },
  create: (activityData) => {
    const activities = activitiesStorage.getAll();
    const newActivity = {
      ...activityData,
      id: activityData.id || `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: activityData.createdAt || new Date().toISOString(),
    };
    activities.push(newActivity);
    activitiesStorage.save(activities);
    return newActivity;
  },
  update: (id, updates) => {
    const activities = activitiesStorage.getAll();
    const index = activities.findIndex((a) => a.id === id);
    if (index !== -1) {
      activities[index] = { ...activities[index], ...updates };
      activitiesStorage.save(activities);
      return activities[index];
    }
    return null;
  },
  delete: (id) => {
    const activities = activitiesStorage.getAll();
    const filtered = activities.filter((a) => a.id !== id);
    activitiesStorage.save(filtered);
    return filtered.length < activities.length;
  },
};

export const notificationsStorage = {
  getAll: () => storage.get(STORAGE_KEYS.NOTIFICATIONS) || [],
  save: (notifications) => storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications),
  create: (notificationData) => {
    const notifications = notificationsStorage.getAll();
    const newNotification = {
      ...notificationData,
      id: notificationData.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: notificationData.createdAt || new Date().toISOString(),
    };
    notifications.unshift(newNotification); // Add to beginning
    notificationsStorage.save(notifications);
    return newNotification;
  },
  markAsRead: (id) => {
    const notifications = notificationsStorage.getAll();
    const index = notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      notificationsStorage.save(notifications);
      return notifications[index];
    }
    return null;
  },
  markAllAsRead: () => {
    const notifications = notificationsStorage.getAll();
    notifications.forEach((n) => (n.read = true));
    notificationsStorage.save(notifications);
  },
  getUnreadCount: () => {
    const notifications = notificationsStorage.getAll();
    return notifications.filter((n) => !n.read).length;
  },
};

export const reportsStorage = {
  getAll: () => storage.get(STORAGE_KEYS.REPORTS) || [],
  save: (reports) => storage.set(STORAGE_KEYS.REPORTS, reports),
  findById: (id) => {
    const reports = reportsStorage.getAll();
    return reports.find((r) => r.id === id) || null;
  },
  create: (reportData) => {
    const reports = reportsStorage.getAll();
    const now = new Date().toISOString();
    const newReport = {
      ...reportData,
      id: reportData.id || `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: reportData.createdAt || now,
      updatedAt: now,
    };
    reports.unshift(newReport);
    reportsStorage.save(reports);
    return newReport;
  },
  update: (id, updates) => {
    const reports = reportsStorage.getAll();
    const index = reports.findIndex((r) => r.id === id);
    if (index !== -1) {
      reports[index] = {
        ...reports[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      reportsStorage.save(reports);
      return reports[index];
    }
    return null;
  },
  delete: (id) => {
    const reports = reportsStorage.getAll();
    const filtered = reports.filter((r) => r.id !== id);
    reportsStorage.save(filtered);
    return filtered.length < reports.length;
  },
};
