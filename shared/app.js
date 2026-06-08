/* ============================================
   CBT 航空培训平台 - 核心逻辑
   ============================================ */

// LMS命名空间
const LMS = {
    // 存储键名
    STORAGE_KEYS: {
        USERS: 'lms_users',
        COURSES: 'lms_courses',
        COURSEWARE: 'lms_courseware',
        ASSIGNMENTS: 'lms_assignments',
        LEARNING_RECORDS: 'lms_learning_records',
        CURRENT_USER: 'lms_current_user',
        SESSION: 'lms_session'
    },

    // 初始化数据
    init() {
        this.initDefaultData();
        this.setupEventListeners();
    },

    // 初始化默认数据
    initDefaultData() {
        // 初始化管理员账号
        if (!this.getData(this.STORAGE_KEYS.USERS)) {
            const defaultUsers = [
                { id: 'admin', username: 'admin', password: 'admin123', role: 'admin', name: '管理员', email: 'admin@捷安.com' },
                { id: 'super', username: 'super', password: 'super123', role: 'super_admin', name: '超级管理员', email: 'super@捷安.com' },
                { id: 'student1', username: 'zhangwei', password: '123456', role: 'student', name: '张伟', email: 'zhangwei@捷安.com', class: '2024级机务班' },
                { id: 'student2', username: 'lisi', password: '123456', role: 'student', name: '李四', email: 'lisi@捷安.com', class: '2024级机务班' }
            ];
            this.setData(this.STORAGE_KEYS.USERS, defaultUsers);
        }

        // 初始化课程数据
        if (!this.getData(this.STORAGE_KEYS.COURSES)) {
            const defaultCourses = [
                {
                    id: 'cbt_b737',
                    code: 'CBT-B737NG',
                    name: 'Boeing 737 NG 系统培训',
                    category: 'CBT',
                    description: '波音737NG机型系统交互式培训课件',
                    aircraft: 'Boeing 737 NG',
                    chapters: [
                        { id: 'ch1', code: '00', name: 'Aircraft General', type: 'chapter' },
                        { id: 'ch2', code: '20', name: 'Air Conditioning & Pressurization', type: 'chapter' },
                        { id: 'ch3', code: '21', name: 'Auto Flight', type: 'chapter' },
                        { id: 'ch4', code: '24', name: 'Electrical System', type: 'chapter' },
                        { id: 'ch5', code: '28', name: 'Fuel System', type: 'chapter' },
                        { id: 'ch6', code: '32', name: 'Landing Gear', type: 'chapter' },
                        { id: 'ch7', code: '34', name: 'Navigation', type: 'chapter' },
                        { id: 'ch8', code: '70', name: 'Powerplant', type: 'chapter' }
                    ],
                    createdAt: '2026-01-01'
                },
                {
                    id: 'cbt_a320',
                    code: 'CBT-A320neo',
                    name: 'Airbus A320neo 系统培训',
                    category: 'CBT',
                    description: '空客A320neo机型系统交互式培训课件（CFM LEAP发动机）',
                    aircraft: 'Airbus A320neo',
                    chapters: [
                        { id: 'ch1', code: '00', name: 'Aircraft General', type: 'chapter' },
                        { id: 'ch2', code: '21', name: 'Air Conditioning & Pressurization', type: 'chapter' },
                        { id: 'ch3', code: '22', name: 'Auto Flight', type: 'chapter' },
                        { id: 'ch4', code: '23', name: 'Communications', type: 'chapter' },
                        { id: 'ch5', code: '24', name: 'Electrical Power', type: 'chapter' },
                        { id: 'ch6', code: '27', name: 'Flight Controls', type: 'chapter' },
                        { id: 'ch7', code: '28', name: 'Fuel System', type: 'chapter' },
                        { id: 'ch8', code: '29', name: 'Hydraulic Power', type: 'chapter' },
                        { id: 'ch9', code: '32', name: 'Landing Gear', type: 'chapter' },
                        { id: 'ch10', code: '33', name: 'Lights', type: 'chapter' },
                        { id: 'ch11', code: '34', name: 'Navigation', type: 'chapter' },
                        { id: 'ch12', code: '49', name: 'Auxiliary Power Unit', type: 'chapter' },
                        { id: 'ch13', code: '70', name: 'Powerplant', type: 'chapter' },
                        { id: 'ch14', code: '71', name: 'Propulsion', type: 'chapter' }
                    ],
                    createdAt: '2026-01-01'
                },
                {
                    id: 'acpc_basic',
                    code: 'ACPC-BASIC',
                    name: '副驾驶预备课程 - 基础模块',
                    category: 'ACPC',
                    description: '面向副驾驶预备课程的基础理论模块',
                    aircraft: '通用',
                    chapters: [
                        { id: 'ch1', code: '01', name: '飞行原理', type: 'chapter' },
                        { id: 'ch2', code: '02', name: '气象学基础', type: 'chapter' },
                        { id: 'ch3', code: '03', name: '航空气象', type: 'chapter' },
                        { id: 'ch4', code: '04', name: '航空法规', type: 'chapter' },
                        { id: 'ch5', code: '05', name: '人为因素', type: 'chapter' }
                    ],
                    createdAt: '2026-01-01'
                },
                {
                    id: 'pbn_rnav',
                    code: 'PBN-RNAV',
                    name: '性能导航(RNAV)培训',
                    category: 'PBN',
                    description: '性能导航基础理论与程序训练',
                    aircraft: '通用',
                    chapters: [
                        { id: 'ch1', code: '01', name: 'PBN基础概念', type: 'chapter' },
                        { id: 'ch2', code: '02', name: 'RNAV系统', type: 'chapter' },
                        { id: 'ch3', code: '03', name: 'RNP程序', type: 'chapter' },
                        { id: 'ch4', code: '04', name: '精密进近', type: 'chapter' }
                    ],
                    createdAt: '2026-01-01'
                }
            ];
            this.setData(this.STORAGE_KEYS.COURSES, defaultCourses);
        }

        // 初始化课件示例数据
        if (!this.getData(this.STORAGE_KEYS.COURSEWARE)) {
            const defaultCourseware = [
                {
                    id: 'cw_b737_00',
                    courseId: 'cbt_b737',
                    chapterId: 'ch1',
                    name: 'Aircraft Overview',
                    type: 'html',
                    duration: 1800,
                    hasTest: true,
                    filePath: 'courseware/b737ng/00_aircraft_general/index.html',
                    createdAt: '2026-01-01'
                },
                {
                    id: 'cw_b737_28',
                    courseId: 'cbt_b737',
                    chapterId: 'ch5',
                    name: 'Fuel System',
                    type: 'html',
                    duration: 2400,
                    hasTest: true,
                    filePath: 'courseware/b737ng/28_fuel_system/index.html',
                    createdAt: '2026-01-01'
                },
                {
                    id: 'cw_a320_27',
                    courseId: 'cbt_a320',
                    chapterId: 'ch6',
                    name: 'Flight Controls',
                    type: 'html',
                    duration: 3000,
                    hasTest: true,
                    filePath: 'courseware/a320neo/27_flight_controls/index.html',
                    createdAt: '2026-01-01'
                }
            ];
            this.setData(this.STORAGE_KEYS.COURSEWARE, defaultCourseware);
        }

        // 初始化课程分配
        if (!this.getData(this.STORAGE_KEYS.ASSIGNMENTS)) {
            const defaultAssignments = [
                { id: 'asg1', studentId: 'student1', courseId: 'cbt_b737', assignedBy: 'admin', assignedAt: '2026-01-01' },
                { id: 'asg2', studentId: 'student1', courseId: 'cbt_a320', assignedBy: 'admin', assignedAt: '2026-01-01' },
                { id: 'asg3', studentId: 'student2', courseId: 'cbt_b737', assignedBy: 'admin', assignedAt: '2026-01-01' },
                { id: 'asg4', studentId: 'student2', courseId: 'acpc_basic', assignedBy: 'admin', assignedAt: '2026-01-01' }
            ];
            this.setData(this.STORAGE_KEYS.ASSIGNMENTS, defaultAssignments);
        }

        // 初始化学习记录
        if (!this.getData(this.STORAGE_KEYS.LEARNING_RECORDS)) {
            const defaultRecords = [
                {
                    id: 'rec1',
                    studentId: 'student1',
                    courseId: 'cbt_b737',
                    chapterId: 'ch1',
                    startTime: '2026-06-07 09:00:00',
                    endTime: '2026-06-07 09:45:00',
                    duration: 2700,
                    status: 'completed'
                },
                {
                    id: 'rec2',
                    studentId: 'student1',
                    courseId: 'cbt_a320',
                    chapterId: 'ch6',
                    startTime: '2026-06-07 14:00:00',
                    endTime: '2026-06-07 14:30:00',
                    duration: 1800,
                    status: 'in_progress'
                }
            ];
            this.setData(this.STORAGE_KEYS.LEARNING_RECORDS, defaultRecords);
        }
    },

    // 设置事件监听
    setupEventListeners() {
        // 文件上传拖拽
        document.addEventListener('dragover', (e) => {
            const uploadArea = e.target.closest('.file-upload-area');
            if (uploadArea) {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            }
        });

        document.addEventListener('dragleave', (e) => {
            const uploadArea = e.target.closest('.file-upload-area');
            if (uploadArea) {
                uploadArea.classList.remove('dragover');
            }
        });

        document.addEventListener('drop', (e) => {
            const uploadArea = e.target.closest('.file-upload-area');
            if (uploadArea) {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    uploadArea.dispatchEvent(new CustomEvent('files-dropped', { detail: files }));
                }
            }
        });
    },

    // LocalStorage操作
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('读取数据失败:', e);
            return null;
        }
    },

    setData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存数据失败:', e);
            return false;
        }
    },

    // 用户相关
    login(username, password) {
        const users = this.getData(this.STORAGE_KEYS.USERS) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // 记录登录会话
            const session = {
                userId: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            this.setData(this.STORAGE_KEYS.SESSION, session);
            
            // 记录登录日志
            this.addLogEntry(user.id, 'login', `用户 ${user.name} 登录系统`);
            
            return { success: true, user: session };
        }
        
        return { success: false, message: '用户名或密码错误' };
    },

    logout() {
        const session = this.getData(this.STORAGE_KEYS.SESSION);
        if (session) {
            this.addLogEntry(session.userId, 'logout', `用户 ${session.name} 退出系统`);
        }
        localStorage.removeItem(this.STORAGE_KEYS.SESSION);
        window.location.href = 'index.html';
    },

    getCurrentUser() {
        return this.getData(this.STORAGE_KEYS.SESSION);
    },

    checkAuth(requiredRoles = []) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return null;
        }
        
        if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
            alert('您没有权限访问此页面');
            window.location.href = this.getDefaultPage(user.role);
            return null;
        }
        
        return user;
    },

    getDefaultPage(role) {
        switch (role) {
            case 'admin':
            case 'super_admin':
                return 'admin/dashboard.html';
            case 'student':
                return 'student/index.html';
            default:
                return 'index.html';
        }
    },

    // 课程相关
    getCourses() {
        return this.getData(this.STORAGE_KEYS.COURSES) || [];
    },

    getCourse(courseId) {
        const courses = this.getCourses();
        return courses.find(c => c.id === courseId);
    },

    addCourse(course) {
        const courses = this.getCourses();
        course.id = 'course_' + Date.now();
        course.createdAt = new Date().toISOString().split('T')[0];
        courses.push(course);
        this.setData(this.STORAGE_KEYS.COURSES, courses);
        this.addLogEntry(this.getCurrentUser()?.userId, 'add_course', `添加课程: ${course.name}`);
        return course;
    },

    updateCourse(courseId, updates) {
        const courses = this.getCourses();
        const index = courses.findIndex(c => c.id === courseId);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...updates };
            this.setData(this.STORAGE_KEYS.COURSES, courses);
            return courses[index];
        }
        return null;
    },

    deleteCourse(courseId) {
        const courses = this.getCourses();
        const course = courses.find(c => c.id === courseId);
        const filtered = courses.filter(c => c.id !== courseId);
        this.setData(this.STORAGE_KEYS.COURSES, filtered);
        
        // 同时删除关联的课件和分配
        const courseware = (this.getData(this.STORAGE_KEYS.COURSEWARE) || []).filter(cw => cw.courseId !== courseId);
        this.setData(this.STORAGE_KEYS.COURSEWARE, courseware);
        
        const assignments = (this.getData(this.STORAGE_KEYS.ASSIGNMENTS) || []).filter(a => a.courseId !== courseId);
        this.setData(this.STORAGE_KEYS.ASSIGNMENTS, assignments);
        
        this.addLogEntry(this.getCurrentUser()?.userId, 'delete_course', `删除课程: ${course?.name}`);
        return true;
    },

    // 课件相关
    getCourseware() {
        return this.getData(this.STORAGE_KEYS.COURSEWARE) || [];
    },

    getCoursewareByCourse(courseId) {
        const courseware = this.getCourseware();
        return courseware.filter(cw => cw.courseId === courseId);
    },

    getCoursewareItem(id) {
        const courseware = this.getCourseware();
        return courseware.find(cw => cw.id === id);
    },

    addCourseware(courseware) {
        const allCourseware = this.getCourseware();
        courseware.id = 'cw_' + Date.now();
        courseware.createdAt = new Date().toISOString().split('T')[0];
        allCourseware.push(courseware);
        this.setData(this.STORAGE_KEYS.COURSEWARE, allCourseware);
        this.addLogEntry(this.getCurrentUser()?.userId, 'add_courseware', `上传课件: ${courseware.name}`);
        return courseware;
    },

    deleteCourseware(id) {
        const courseware = this.getCourseware();
        const item = courseware.find(cw => cw.id === id);
        const filtered = courseware.filter(cw => cw.id !== id);
        this.setData(this.STORAGE_KEYS.COURSEWARE, filtered);
        this.addLogEntry(this.getCurrentUser()?.userId, 'delete_courseware', `删除课件: ${item?.name}`);
        return true;
    },

    // 学生相关
    getStudents() {
        const users = this.getData(this.STORAGE_KEYS.USERS) || [];
        return users.filter(u => u.role === 'student');
    },

    getStudent(studentId) {
        const users = this.getData(this.STORAGE_KEYS.USERS) || [];
        return users.find(u => u.id === studentId);
    },

    addStudent(student) {
        const users = this.getData(this.STORAGE_KEYS.USERS) || [];
        student.id = 'student_' + Date.now();
        student.role = 'student';
        users.push(student);
        this.setData(this.STORAGE_KEYS.USERS, users);
        this.addLogEntry(this.getCurrentUser()?.userId, 'add_student', `添加学生: ${student.name}`);
        return student;
    },

    updateStudent(studentId, updates) {
        const users = this.getData(this.STORAGE_KEYS.USERS) || [];
        const index = users.findIndex(u => u.id === studentId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.setData(this.STORAGE_KEYS.USERS, users);
            return users[index];
        }
        return null;
    },

    deleteStudent(studentId) {
        const users = this.getData(this.STORAGE_KEYS.USERS) || [];
        const student = users.find(u => u.id === studentId);
        const filtered = users.filter(u => u.id !== studentId);
        this.setData(this.STORAGE_KEYS.USERS, filtered);
        
        // 同时删除关联的分配和记录
        const assignments = (this.getData(this.STORAGE_KEYS.ASSIGNMENTS) || []).filter(a => a.studentId !== studentId);
        this.setData(this.STORAGE_KEYS.ASSIGNMENTS, assignments);
        
        const records = (this.getData(this.STORAGE_KEYS.LEARNING_RECORDS) || []).filter(r => r.studentId !== studentId);
        this.setData(this.STORAGE_KEYS.LEARNING_RECORDS, records);
        
        this.addLogEntry(this.getCurrentUser()?.userId, 'delete_student', `删除学生: ${student?.name}`);
        return true;
    },

    importStudents(csvData) {
        const lines = csvData.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const students = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const student = { id: 'student_' + Date.now() + '_' + i, role: 'student' };
            headers.forEach((header, index) => {
                if (header === 'username') student.username = values[index];
                if (header === 'password') student.password = values[index] || '123456';
                if (header === 'name') student.name = values[index];
                if (header === 'email') student.email = values[index];
                if (header === 'class') student.class = values[index];
            });
            if (student.username && student.name) {
                students.push(student);
            }
        }
        
        const users = this.getData(this.STORAGE_KEYS.USERS) || [];
        users.push(...students);
        this.setData(this.STORAGE_KEYS.USERS, users);
        
        return { success: true, count: students.length };
    },

    // 课程分配相关
    getAssignments() {
        return this.getData(this.STORAGE_KEYS.ASSIGNMENTS) || [];
    },

    getStudentAssignments(studentId) {
        const assignments = this.getAssignments();
        return assignments.filter(a => a.studentId === studentId);
    },

    getCourseAssignments(courseId) {
        const assignments = this.getAssignments();
        return assignments.filter(a => a.courseId === courseId);
    },

    assignCourse(studentId, courseId) {
        const assignments = this.getAssignments();
        
        // 检查是否已分配
        const exists = assignments.find(a => a.studentId === studentId && a.courseId === courseId);
        if (exists) {
            return { success: false, message: '该课程已分配给此学生' };
        }
        
        const assignment = {
            id: 'asg_' + Date.now(),
            studentId,
            courseId,
            assignedBy: this.getCurrentUser()?.userId,
            assignedAt: new Date().toISOString()
        };
        
        assignments.push(assignment);
        this.setData(this.STORAGE_KEYS.ASSIGNMENTS, assignments);
        this.addLogEntry(this.getCurrentUser()?.userId, 'assign_course', `分配课程给学员`);
        return { success: true, assignment };
    },

    removeAssignment(assignmentId) {
        const assignments = this.getAssignments();
        const filtered = assignments.filter(a => a.id !== assignmentId);
        this.setData(this.STORAGE_KEYS.ASSIGNMENTS, filtered);
        return true;
    },

    // 学习记录相关
    getLearningRecords() {
        return this.getData(this.STORAGE_KEYS.LEARNING_RECORDS) || [];
    },

    getStudentRecords(studentId) {
        const records = this.getLearningRecords();
        return records.filter(r => r.studentId === studentId);
    },

    getCourseRecords(courseId) {
        const records = this.getLearningRecords();
        return records.filter(r => r.courseId === courseId);
    },

    startLearning(studentId, courseId, chapterId) {
        const records = this.getLearningRecords();
        
        // 检查是否有进行中的记录
        const inProgress = records.find(r => 
            r.studentId === studentId && 
            r.courseId === courseId && 
            r.chapterId === chapterId && 
            r.status === 'in_progress'
        );
        
        if (inProgress) {
            return inProgress;
        }
        
        const record = {
            id: 'rec_' + Date.now(),
            studentId,
            courseId,
            chapterId,
            startTime: new Date().toISOString(),
            endTime: null,
            duration: 0,
            status: 'in_progress'
        };
        
        records.push(record);
        this.setData(this.STORAGE_KEYS.LEARNING_RECORDS, records);
        return record;
    },

    stopLearning(recordId) {
        const records = this.getLearningRecords();
        const index = records.findIndex(r => r.id === recordId);
        
        if (index !== -1) {
            const startTime = new Date(records[index].startTime);
            const endTime = new Date();
            const duration = Math.floor((endTime - startTime) / 1000); // 秒
            
            records[index].endTime = endTime.toISOString();
            records[index].duration = duration;
            records[index].status = 'completed';
            
            this.setData(this.STORAGE_KEYS.LEARNING_RECORDS, records);
            return records[index];
        }
        return null;
    },

    // 学习时长统计
    getStudentTotalTime(studentId) {
        const records = this.getLearningRecords();
        return records
            .filter(r => r.studentId === studentId)
            .reduce((total, r) => total + (r.duration || 0), 0);
    },

    getCourseCompletionRate(courseId) {
        const records = this.getLearningRecords();
        const course = this.getCourse(courseId);
        if (!course) return 0;
        
        const courseRecords = records.filter(r => r.courseId === courseId && r.status === 'completed');
        const totalChapters = course.chapters?.length || 0;
        
        if (totalChapters === 0) return 0;
        
        // 简化计算：已完成的章节数 / 总章节数
        const completedChapters = new Set(courseRecords.map(r => r.chapterId)).size;
        return Math.round((completedChapters / totalChapters) * 100);
    },

    // ZIP上传处理
    async handleZipUpload(file, courseId, chapterId) {
        return new Promise((resolve, reject) => {
            if (!file.name.endsWith('.zip')) {
                reject(new Error('请上传ZIP格式的文件'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // 这里需要JSZip库来解析ZIP
                    // 简化处理：直接保存文件信息到LocalStorage
                    // 实际部署时，需要后端来处理ZIP解压
                    
                    const courseware = {
                        id: 'cw_' + Date.now(),
                        courseId,
                        chapterId,
                        name: file.name.replace('.zip', ''),
                        type: 'html',
                        fileName: file.name,
                        fileSize: file.size,
                        duration: 1800, // 默认30分钟
                        hasTest: false,
                        uploadedAt: new Date().toISOString()
                    };
                    
                    this.addCourseware(courseware);
                    resolve({ success: true, courseware });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    },

    // 日志记录
    addLogEntry(userId, action, description) {
        // 简化处理，实际应该有专门的日志表
        console.log(`[LOG] ${new Date().toISOString()} - ${action}: ${description}`);
    },

    // 工具函数
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${secs}秒`;
        } else {
            return `${secs}秒`;
        }
    },

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Toast通知
    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : ''}
                ${type === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : ''}
                ${type === 'info' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>' : ''}
            </svg>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // 导出数据
    exportRecords(format = 'csv') {
        const records = this.getLearningRecords();
        const users = this.getData(this.STORAGE_KEYS.USERS) || [];
        const courses = this.getCourses();
        
        if (format === 'csv') {
            let csv = '学员姓名,学员账号,课程名称,章节,开始时间,结束时间,学习时长(秒),状态\n';
            
            records.forEach(r => {
                const student = users.find(u => u.id === r.studentId);
                const course = courses.find(c => c.id === r.courseId);
                const chapter = course?.chapters?.find(ch => ch.id === r.chapterId);
                
                csv += `${student?.name || ''},${student?.username || ''},${course?.name || ''},${chapter?.name || ''},${r.startTime},${r.endTime || ''},${r.duration || 0},${r.status}\n`;
            });
            
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `学习记录_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    },

    // 清除所有数据（恢复出厂设置）
    clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.init();
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    LMS.init();
});

// 添加slideOut动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
