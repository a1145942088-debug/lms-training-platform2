// ==================== 存储模块 ====================
const Storage = {
  prefix: 'lms_',
  
  get(key) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },
  
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },
  
  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }
};

// ==================== ATA系统管理器 ====================
const ATAManager = {
  getAll() {
    return Storage.get('ata_systems') || [];
  },
  
  getById(id) {
    return this.getAll().find(s => s.id === id);
  },
  
  create(systemData) {
    const systems = this.getAll();
    let ataCode = systemData.ataCode || '';
    if (!ataCode && systemData.name) {
      const match = systemData.name.match(/ATA\s*(\d{2})/i) || systemData.name.match(/^(\d{2})[\s\-]/);
      if (match) ataCode = match[1];
    }
    
    const newSystem = {
      id: 'ata' + Date.now(),
      ataCode: ataCode.padStart(2, '0'),
      name: systemData.name || '未命名系统',
      chapters: systemData.chapters || [],
      duration: systemData.chapters?.reduce((sum, c) => sum + (c.duration || 30), 0) || 0,
      status: 'published',
      fileName: systemData.fileName || '',
      createdAt: new Date().toISOString()
    };
    
    systems.push(newSystem);
    Storage.set('ata_systems', systems);
    return newSystem;
  },
  
  batchCreateFromFiles(files) {
    const results = [];
    files.forEach(file => {
      const name = file.name.replace(/\.[^/.]+$/, '');
      const result = this.create({
        name: name,
        fileName: file.name,
        chapters: [{ id: 1, title: name, duration: 30 }]
      });
      results.push(result);
    });
    return results;
  },
  
  update(id, data) {
    const systems = this.getAll();
    const index = systems.findIndex(s => s.id === id);
    if (index !== -1) {
      systems[index] = { ...systems[index], ...data, updatedAt: new Date().toISOString() };
      Storage.set('ata_systems', systems);
      return systems[index];
    }
    return null;
  },
  
  addChapter(systemId, chapterData) {
    const system = this.getById(systemId);
    if (!system) return null;
    
    const chapter = {
      id: 'ch_' + Date.now(),
      title: chapterData.title,
      duration: chapterData.duration || 30,
      entryFile: chapterData.entryFile || '',
      createdAt: new Date().toISOString()
    };
    
    system.chapters = system.chapters || [];
    system.chapters.push(chapter);
    system.duration = system.chapters.reduce((sum, c) => sum + (c.duration || 30), 0);
    
    return this.update(systemId, { chapters: system.chapters, duration: system.duration });
  },
  
  delete(id) {
    const systems = this.getAll();
    const filtered = systems.filter(s => s.id !== id);
    Storage.set('ata_systems', filtered);
  }
};

// ==================== 认证模块 ====================
const Auth = {
  USERS_KEY: 'users',
  CURRENT_KEY: 'current_user',
  
  init() {
    return Storage.get(this.CURRENT_KEY);
  },
  
  login(username, password) {
    const users = Storage.get(this.USERS_KEY) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      Storage.set(this.CURRENT_KEY, user);
      return { success: true, user: user };
    }
    
    return { success: false, message: '用户名或密码错误' };
  },
  
  logout() {
    Storage.remove(this.CURRENT_KEY);
  },
  
  getCurrentUser() {
    return this.init();
  },
  
  register(userData) {
    const users = Storage.get(this.USERS_KEY) || [];
    
    if (users.find(u => u.username === userData.username)) {
      return { success: false, message: '用户名已存在' };
    }
    
    const newUser = {
      id: 'user_' + Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    Storage.set(this.USERS_KEY, users);
    return { success: true, user: newUser };
  }
};

// ==================== 课程管理器 ====================
const CourseManager = {
  getAll() {
    return Storage.get('courses') || [];
  },
  
  getById(id) {
    return this.getAll().find(c => c.id === id);
  },
  
  create(courseData) {
    const courses = this.getAll();
    const newCourse = {
      id: 'course_' + Date.now(),
      ...courseData,
      createdAt: new Date().toISOString()
    };
    courses.push(newCourse);
    Storage.set('courses', courses);
    return newCourse;
  },
  
  update(id, data) {
    const courses = this.getAll();
    const index = courses.findIndex(c => c.id === id);
    if (index !== -1) {
      courses[index] = { ...courses[index], ...data, updatedAt: new Date().toISOString() };
      Storage.set('courses', courses);
      return courses[index];
    }
    return null;
  },
  
  delete(id) {
    const courses = this.getAll();
    const filtered = courses.filter(c => c.id !== id);
    Storage.set('courses', filtered);
  }
};

// ==================== 学习记录模块 ====================
const LearningTracker = {
  getAll() {
    return Storage.get('learning_records') || [];
  },
  
  getAllRecords(filters = {}) {
    let records = this.getAll();
    if (filters.userId) {
      records = records.filter(r => r.userId === filters.userId);
    }
    if (filters.courseId) {
      records = records.filter(r => r.courseId === filters.courseId);
    }
    if (filters.status) {
      records = records.filter(r => r.status === filters.status);
    }
    if (filters.startDate) {
      records = records.filter(r => new Date(r.startTime) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      records = records.filter(r => new Date(r.startTime) <= new Date(filters.endDate + 'T23:59:59'));
    }
    return records;
  },
  
  // 获取用户的学习记录（兼容别名）
  getUserRecords(userId) {
    return this.getAll().filter(r => r.userId === userId);
  },
  
  getByUser(userId) {
    return this.getAll().filter(r => r.userId === userId);
  },
  
  getByCourse(courseId) {
    return this.getAll().filter(r => r.courseId === courseId);
  },
  
  startLearning(userId, courseId, coursewareId) {
    const records = this.getAll();
    
    // 检查是否已有进行中的记录
    let record = records.find(r => r.userId === userId && r.courseId === courseId && !r.endTime);
    if (record) {
      return record;
    }
    
    // 创建新记录
    record = {
      id: 'record_' + Date.now(),
      userId,
      courseId,
      coursewareId,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      progress: 0,
      status: 'in_progress'
    };
    
    records.push(record);
    Storage.set('learning_records', records);
    return record;
  },
  
  finishLearning(recordId, duration) {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === recordId);
    if (index !== -1) {
      records[index].endTime = new Date().toISOString();
      records[index].duration = duration || 0;
      records[index].progress = 100;
      records[index].status = 'completed';
      Storage.set('learning_records', records);
      return records[index];
    }
    return null;
  },
  
  updateProgress(recordId, progress) {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === recordId);
    if (index !== -1) {
      records[index].progress = progress;
      records[index].updatedAt = new Date().toISOString();
      Storage.set('learning_records', records);
      return records[index];
    }
    return null;
  },
  
  updateDuration(recordId, duration) {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === recordId);
    if (index !== -1) {
      records[index].duration = duration;
      records[index].updatedAt = new Date().toISOString();
      Storage.set('learning_records', records);
      return records[index];
    }
    return null;
  }
};

// ==================== 学员管理器 ====================
const StudentManager = {
  getAll() {
    const users = Storage.get('users') || [];
    return users.filter(u => u.role === 'student');
  },
  
  getById(id) {
    const users = Storage.get('users') || [];
    return users.find(u => u.id === id && u.role === 'student');
  },
  
  create(studentData) {
    return Auth.register({
      ...studentData,
      role: 'student'
    });
  },
  
  update(id, data) {
    const users = Storage.get('users') || [];
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() };
      Storage.set('users', users);
      return users[index];
    }
    return null;
  },
  
  delete(id) {
    const users = Storage.get('users') || [];
    const filtered = users.filter(u => u.id !== id);
    Storage.set('users', filtered);
  },
  
  getStats(id) {
    const records = LearningTracker.getByUser(id);
    const completed = records.filter(r => r.status === 'completed').length;
    const totalDuration = records.reduce((sum, r) => sum + (r.duration || 0), 0);
    return {
      totalCourses: records.length,
      completedCourses: completed,
      inProgressCourses: records.length - completed,
      totalDuration
    };
  }
};

// ==================== 作业管理器 ====================
const AssignmentManager = {
  getAll() {
    return Storage.get('assignments') || [];
  },
  
  getById(id) {
    return this.getAll().find(a => a.id === id);
  },
  
  create(assignmentData) {
    const assignments = this.getAll();
    const newAssignment = {
      id: 'assign_' + Date.now(),
      ...assignmentData,
      assignedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    assignments.push(newAssignment);
    Storage.set('assignments', assignments);
    return newAssignment;
  },
  
  update(id, data) {
    const assignments = this.getAll();
    const index = assignments.findIndex(a => a.id === id);
    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...data, updatedAt: new Date().toISOString() };
      Storage.set('assignments', assignments);
      return assignments[index];
    }
    return null;
  },
  
  delete(id) {
    const assignments = this.getAll();
    const filtered = assignments.filter(a => a.id !== id);
    Storage.set('assignments', filtered);
  },
  
  assignToStudent(assignmentId, studentId) {
    const assignments = this.getAll();
    const index = assignments.findIndex(a => a.id === assignmentId);
    if (index !== -1) {
      assignments[index].assignedTo = assignments[index].assignedTo || [];
      if (!assignments[index].assignedTo.includes(studentId)) {
        assignments[index].assignedTo.push(studentId);
      }
      assignments[index].status = 'assigned';
      Storage.set('assignments', assignments);
      return assignments[index];
    }
    return null;
  }
};

// ==================== 课件管理器 ====================
const CoursewareManager = {
  getAll() {
    return Storage.get('coursewares') || [];
  },
  
  getById(id) {
    return this.getAll().find(c => c.id === id);
  },
  
  getByCourse(courseId) {
    return this.getAll().filter(c => c.courseId === courseId);
  },
  
  upload(metadata, file) {
    const coursewares = this.getAll();
    
    // 生成唯一ID
    const id = 'cw_' + Date.now();
    
    // 存储课件数据到LocalStorage
    // 注意：纯前端无法真正存储文件，这里记录元数据
    const courseware = {
      id,
      courseId: metadata.courseId,
      courseName: metadata.courseName || '',
      name: metadata.name,
      type: metadata.type || 'html5',
      duration: metadata.duration || 60,
      entryFile: metadata.entryFile || 'index.html',
      chapters: metadata.chapters || [],
      status: 'published',
      fileName: file?.name || metadata.name + '.zip',
      fileSize: file?.size || 0,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    coursewares.push(courseware);
    Storage.set('coursewares', coursewares);
    return courseware;
  },
  
  create(metadata) {
    return this.upload(metadata, { name: metadata.name + '.zip', size: 0 });
  },
  
  update(id, data) {
    const coursewares = this.getAll();
    const index = coursewares.findIndex(c => c.id === id);
    if (index !== -1) {
      coursewares[index] = { ...coursewares[index], ...data, updatedAt: new Date().toISOString() };
      Storage.set('coursewares', coursewares);
      return coursewares[index];
    }
    return null;
  },
  
  delete(id) {
    const coursewares = this.getAll();
    const filtered = coursewares.filter(c => c.id !== id);
    Storage.set('coursewares', filtered);
  }
};

// ==================== 数据导出模块 ====================
const DataExporter = {
  // 导出学习记录为CSV
  exportLearningRecords(filters = {}) {
    const records = LearningTracker.getAllRecords(filters);
    const users = Storage.get('users') || [];
    const courses = Storage.get('courses') || [];
    
    if (records.length === 0) {
      return null;
    }
    
    // CSV表头
    const headers = ['学员姓名', '学员邮箱', '部门', '课程名称', '开始时间', '结束时间', '学习时长(分钟)', '进度(%)', '状态', '成绩'];
    
    // CSV数据行
    const rows = records.map(r => {
      const user = users.find(u => u.id === r.userId);
      const course = courses.find(c => c.id === r.courseId);
      const durationMinutes = Math.round((r.duration || 0) / 60);
      
      return [
        user?.name || '未知',
        user?.email || '',
        user?.department || '',
        course?.name || '未知课程',
        r.startTime ? new Date(r.startTime).toLocaleString('zh-CN') : '',
        r.endTime ? new Date(r.endTime).toLocaleString('zh-CN') : '',
        durationMinutes,
        r.progress || 0,
        r.status === 'completed' ? '已完成' : '进行中',
        r.score ? r.score + '分' : ''
      ];
    });
    
    return this.arrayToCSV(headers, rows);
  },
  
  // 数组转CSV
  arrayToCSV(headers, rows) {
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => {
        const str = String(cell === null || cell === undefined ? '' : cell);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');
    
    return '\ufeff' + csvContent; // BOM for Excel UTF-8
  },
  
  // 下载文件
  download(content, filename, mimeType = 'text/csv;charset=utf-8') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
  
  // 格式化时长
  formatDuration(seconds) {
    if (!seconds) return '0分钟';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  },
  
  // 导出所有数据
  exportAllData() {
    return {
      users: Storage.get('users'),
      ata_systems: Storage.get('ata_systems'),
      courses: Storage.get('courses'),
      coursewares: Storage.get('coursewares'),
      learning_records: Storage.get('learning_records'),
      assignments: Storage.get('assignments'),
      exportedAt: new Date().toISOString()
    };
  }
};

// ==================== UI组件 ====================
const UI = {
  toast(message, type = 'info') {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    
    // 移除已存在的toast
    const existing = document.querySelector('.lms-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'lms-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: ${colors[type] || colors.info};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 100000;
      animation: toastSlideIn 0.3s ease;
      font-family: 'Noto Sans SC', sans-serif;
    `;
    toast.textContent = message;
    
    // 添加动画样式
    if (!document.getElementById('toastStyles')) {
      const style = document.createElement('style');
      style.id = 'toastStyles';
      style.textContent = `
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  
  modal(title, content, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      font-family: 'Noto Sans SC', sans-serif;
    `;
    
    modal.innerHTML = `
      <h3 style="margin:0 0 16px;font-size:18px;font-weight:600;">${title}</h3>
      <div style="margin-bottom:24px;color:#666;line-height:1.6;">${content}</div>
      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button id="modalCancel" style="padding:8px 16px;border:1px solid #ddd;border-radius:6px;background:white;cursor:pointer;font-size:14px;">取消</button>
        <button id="modalConfirm" style="padding:8px 16px;border:none;border-radius:6px;background:#3b82f6;color:white;cursor:pointer;font-size:14px;">确定</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    document.getElementById('modalConfirm').onclick = () => {
      overlay.remove();
      onConfirm && onConfirm();
    };
    
    document.getElementById('modalCancel').onclick = () => {
      overlay.remove();
      onCancel && onCancel();
    };
    
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
  },
  
  // 打开Modal（基于class）
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
    }
  },
  
  // 关闭Modal（基于class）
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  },
  
  formatDate(date, format = 'datetime') {
    if (!date) return '-';
    const d = new Date(date);
    
    if (format === 'date') {
      return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  formatDuration(seconds) {
    if (!seconds) return '0分钟';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  }
};

// ==================== 初始化模拟数据 ====================
function initializeMockData() {
  // 检查是否已初始化
  if (Storage.get('initialized')) return;
  
  // 管理员账户
  Storage.set('users', [
    {
      id: 'admin001',
      username: 'admin',
      password: 'admin123',
      name: '系统管理员',
      email: 'admin@cbt-platform.com',
      role: 'admin',
      department: '培训中心',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'admin002',
      username: 'super',
      password: 'super123',
      name: '超级管理员',
      email: 'super@cbt-platform.com',
      role: 'super_admin',
      department: '系统管理',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'student001',
      username: 'zhangwei',
      password: '123456',
      name: '张伟',
      email: 'zhangwei@cbt-platform.com',
      role: 'student',
      department: '机务维修部',
      phone: '13800138001',
      createdAt: '2024-02-15T00:00:00Z'
    },
    {
      id: 'student002',
      username: 'lina',
      password: '123456',
      name: '李娜',
      email: 'lina@cbt-platform.com',
      role: 'student',
      department: '机务维修部',
      phone: '13800138002',
      createdAt: '2024-02-16T00:00:00Z'
    },
    {
      id: 'student003',
      username: 'wangfang',
      password: '123456',
      name: '王芳',
      email: 'wangfang@cbt-platform.com',
      role: 'student',
      department: '航电部',
      phone: '13800138003',
      createdAt: '2024-03-01T00:00:00Z'
    }
  ]);

  // ATA系统
  Storage.set('ata_systems', [
    { id: 'ata21', ataCode: '21', name: '空调与增压系统', chapters: [{ id: 'ata21-1', title: '空调系统概述', duration: 25 }, { id: 'ata21-2', title: '座舱增压控制', duration: 30 }, { id: 'ata21-3', title: '温度控制系统', duration: 35 }], duration: 90, status: 'published', createdAt: '2024-01-15T00:00:00Z' },
    { id: 'ata22', ataCode: '22', name: '自动飞行系统', chapters: [{ id: 'ata22-1', title: '飞行指引系统', duration: 30 }, { id: 'ata22-2', title: '自动驾驶仪', duration: 40 }], duration: 70, status: 'published', createdAt: '2024-01-20T00:00:00Z' },
    { id: 'ata23', ataCode: '23', name: '通讯系统', chapters: [{ id: 'ata23-1', title: '甚高频通讯', duration: 25 }, { id: 'ata23-2', title: '高频通讯系统', duration: 20 }], duration: 45, status: 'published', createdAt: '2024-02-01T00:00:00Z' },
    { id: 'ata24', ataCode: '24', name: '电源系统', chapters: [{ id: 'ata24-1', title: '交流电源系统', duration: 35 }, { id: 'ata24-2', title: '直流电源系统', duration: 30 }], duration: 65, status: 'published', createdAt: '2024-02-05T00:00:00Z' },
    { id: 'ata27', ataCode: '27', name: '飞控系统', chapters: [{ id: 'ata27-1', title: '主飞控系统概述', duration: 30 }, { id: 'ata27-2', title: '副翼与扰流板', duration: 35 }, { id: 'ata27-3', title: '升降舵与安定面', duration: 30 }], duration: 95, status: 'published', createdAt: '2024-02-10T00:00:00Z' },
    { id: 'ata28', ataCode: '28', name: '燃油系统', chapters: [{ id: 'ata28-1', title: '燃油系统概述', duration: 25 }, { id: 'ata28-2', title: '燃油箱与加油', duration: 30 }], duration: 55, status: 'published', createdAt: '2024-02-15T00:00:00Z' },
    { id: 'ata29', ataCode: '29', name: '液压系统', chapters: [{ id: 'ata29-1', title: '液压系统概述', duration: 25 }, { id: 'ata29-2', title: '主液压系统', duration: 35 }], duration: 60, status: 'published', createdAt: '2024-02-20T00:00:00Z' },
    { id: 'ata32', ataCode: '32', name: '起落架系统', chapters: [{ id: 'ata32-1', title: '起落架概述', duration: 25 }, { id: 'ata32-2', title: '刹车与防滑系统', duration: 35 }], duration: 60, status: 'published', createdAt: '2024-03-05T00:00:00Z' },
    { id: 'ata34', ataCode: '34', name: '导航系统', chapters: [{ id: 'ata34-1', title: '惯性导航系统', duration: 35 }, { id: 'ata34-2', title: '大气数据计算机', duration: 30 }], duration: 65, status: 'published', createdAt: '2024-03-15T00:00:00Z' },
    { id: 'ata71', ataCode: '71', name: '动力装置', chapters: [{ id: 'ata71-1', title: 'CFM LEAP-1C概述', duration: 40 }, { id: 'ata71-2', title: '风扇与低压压气机', duration: 35 }, { id: 'ata71-3', title: '高压压气机', duration: 40 }], duration: 115, status: 'published', createdAt: '2024-04-15T00:00:00Z' }
  ]);

  // 课程（关联ATA系统）
  Storage.set('courses', [
    { id: 'course21', ataSystemId: 'ata21', name: '空调与增压系统培训课程', code: 'C919-ATA21', description: 'C919飞机空调与增压系统原理及维护培训', status: 'published', duration: 90, createdAt: '2024-01-15T00:00:00Z' },
    { id: 'course22', ataSystemId: 'ata22', name: '自动飞行系统培训课程', code: 'C919-ATA22', description: 'C919飞机自动飞行系统原理及维护培训', status: 'published', duration: 70, createdAt: '2024-01-20T00:00:00Z' },
    { id: 'course23', ataSystemId: 'ata23', name: '通讯系统培训课程', code: 'C919-ATA23', description: 'C919飞机通讯系统原理及维护培训', status: 'published', duration: 45, createdAt: '2024-02-01T00:00:00Z' },
    { id: 'course24', ataSystemId: 'ata24', name: '电源系统培训课程', code: 'C919-ATA24', description: 'C919飞机电源系统原理及维护培训', status: 'published', duration: 65, createdAt: '2024-02-05T00:00:00Z' },
    { id: 'course27', ataSystemId: 'ata27', name: '飞控系统培训课程', code: 'C919-ATA27', description: 'C919飞机飞控系统原理及维护培训', status: 'published', duration: 95, createdAt: '2024-02-10T00:00:00Z' },
    { id: 'course28', ataSystemId: 'ata28', name: '燃油系统培训课程', code: 'C919-ATA28', description: 'C919飞机燃油系统原理及维护培训', status: 'published', duration: 55, createdAt: '2024-02-15T00:00:00Z' },
    { id: 'course29', ataSystemId: 'ata29', name: '液压系统培训课程', code: 'C919-ATA29', description: 'C919飞机液压系统原理及维护培训', status: 'published', duration: 60, createdAt: '2024-02-20T00:00:00Z' },
    { id: 'course32', ataSystemId: 'ata32', name: '起落架系统培训课程', code: 'C919-ATA32', description: 'C919飞机起落架系统原理及维护培训', status: 'published', duration: 60, createdAt: '2024-03-05T00:00:00Z' },
    { id: 'course34', ataSystemId: 'ata34', name: '导航系统培训课程', code: 'C919-ATA34', description: 'C919飞机导航系统原理及维护培训', status: 'published', duration: 65, createdAt: '2024-03-15T00:00:00Z' },
    { id: 'course71', ataSystemId: 'ata71', name: '动力装置培训课程', code: 'C919-ATA71', description: 'CFM LEAP-1C发动机原理及维护培训', status: 'published', duration: 115, createdAt: '2024-04-15T00:00:00Z' }
  ]);

  // 课件示例
  Storage.set('coursewares', [
    { id: 'cw001', courseId: 'course21', courseName: '空调与增压系统培训课程', name: '空调系统原理', type: 'html5', duration: 30, status: 'published', uploadedAt: '2024-01-20T00:00:00Z' },
    { id: 'cw002', courseId: 'course27', courseName: '飞控系统培训课程', name: '飞控系统概述', type: 'html5', duration: 35, status: 'published', uploadedAt: '2024-02-15T00:00:00Z' }
  ]);
  
  // 学习记录示例
  Storage.set('learning_records', [
    { id: 'rec001', userId: 'student001', courseId: 'course21', startTime: '2024-06-01T09:00:00Z', endTime: '2024-06-01T10:30:00Z', duration: 5400, progress: 100, status: 'completed', createdAt: '2024-06-01T09:00:00Z' },
    { id: 'rec002', userId: 'student001', courseId: 'course27', startTime: '2024-06-02T14:00:00Z', duration: 1800, progress: 50, status: 'in_progress', createdAt: '2024-06-02T14:00:00Z' },
    { id: 'rec003', userId: 'student002', courseId: 'course21', startTime: '2024-06-03T10:00:00Z', endTime: '2024-06-03T11:00:00Z', duration: 3600, progress: 100, status: 'completed', createdAt: '2024-06-03T10:00:00Z' }
  ]);
  
  // 课程分配示例
  Storage.set('assignments', [
    { id: 'assign001', userId: 'student001', courseId: 'course21', assignedAt: '2024-06-01T08:00:00Z', status: 'assigned', createdAt: '2024-06-01T08:00:00Z' },
    { id: 'assign002', userId: 'student001', courseId: 'course27', assignedAt: '2024-06-02T08:00:00Z', status: 'assigned', createdAt: '2024-06-02T08:00:00Z' },
    { id: 'assign003', userId: 'student002', courseId: 'course21', assignedAt: '2024-06-03T08:00:00Z', status: 'assigned', createdAt: '2024-06-03T08:00:00Z' }
  ]);
  
  // 标记已初始化
  Storage.set('initialized', true);
}

// ==================== 导出模块 ====================
window.LMS = {
  Storage,
  Auth,
  ATAManager,
  CourseManager,
  LearningTracker,
  StudentManager,
  AssignmentManager,
  CoursewareManager,
  DataExporter,
  UI,
  initializeMockData
};

// 页面加载时初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMockData);
} else {
  initializeMockData();
}
