// Default grading rubric
const DEFAULT_RUBRIC = [
    { grade: 'O', points: 10 },
    { grade: 'A+', points: 9.5 },
    { grade: 'A', points: 9 },
    { grade: 'B+', points: 8.5 },
    { grade: 'B', points: 8 },
    { grade: 'C', points: 7.5 },
    { grade: 'P', points: 7 }
];

// Application state
let state = {
    rubric: [...DEFAULT_RUBRIC],
    semesters: []
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initializeEventListeners();
    renderRubricDisplay();
    renderSemesters();
    calculateResults();
});

// Event Listeners
function initializeEventListeners() {
    document.getElementById('toggleRubric').addEventListener('click', toggleRubricEditor);
    document.getElementById('addGrade').addEventListener('click', addGradeToRubric);
    document.getElementById('resetRubric').addEventListener('click', resetRubric);
    document.getElementById('addSemester').addEventListener('click', addSemester);
}

// Local Storage Functions
function saveState() {
    localStorage.setItem('gpaCalculatorState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('gpaCalculatorState');
    if (saved) {
        state = JSON.parse(saved);
    }
}

// Rubric Management
function toggleRubricEditor() {
    const display = document.getElementById('rubricDisplay');
    const editor = document.getElementById('rubricEditor');
    const toggleBtn = document.getElementById('toggleRubric');
    const toggleText = document.getElementById('toggleRubricText');
    
    if (editor.classList.contains('hidden')) {
        display.classList.add('hidden');
        editor.classList.remove('hidden');
        toggleText.textContent = 'Done';
        renderRubricEditor();
    } else {
        display.classList.remove('hidden');
        editor.classList.add('hidden');
        toggleText.textContent = 'Edit';
        renderRubricDisplay();
    }
}

function renderRubricDisplay() {
    const container = document.getElementById('rubricDisplay');
    container.innerHTML = state.rubric.map(item => `
        <div class="rubric-item">
            <div class="rubric-grade">${item.grade}</div>
            <div class="rubric-points">${item.points} points</div>
        </div>
    `).join('');
}

function renderRubricEditor() {
    const container = document.getElementById('rubricInputs');
    container.innerHTML = state.rubric.map((item, index) => `
        <div class="rubric-input-row">
            <div class="form-group">
                <label class="form-label">Grade</label>
                <input type="text" class="form-input" value="${item.grade}" 
                    onchange="updateRubricGrade(${index}, this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">Points</label>
                <input type="number" class="form-input" value="${item.points}" 
                    step="0.5" min="0" max="10"
                    onchange="updateRubricPoints(${index}, this.value)">
            </div>
            <button class="btn btn-danger" onclick="removeGradeFromRubric(${index})" 
                style="margin-top: 1.5rem;">
                <span class="btn-icon">×</span>
            </button>
        </div>
    `).join('');
}

function updateRubricGrade(index, value) {
    state.rubric[index].grade = value.trim();
    saveState();
}

function updateRubricPoints(index, value) {
    state.rubric[index].points = parseFloat(value);
    saveState();
    calculateResults();
}

function addGradeToRubric() {
    state.rubric.push({ grade: '', points: 0 });
    renderRubricEditor();
    saveState();
}

function removeGradeFromRubric(index) {
    state.rubric.splice(index, 1);
    renderRubricEditor();
    saveState();
    calculateResults();
}

function resetRubric() {
    if (confirm('Reset grading rubric to default values?')) {
        state.rubric = [...DEFAULT_RUBRIC];
        renderRubricEditor();
        renderRubricDisplay();
        saveState();
        calculateResults();
    }
}

// Semester Management
function addSemester() {
    const semesterNumber = state.semesters.length + 1;
    state.semesters.push({
        number: semesterNumber,
        subjects: []
    });
    saveState();
    renderSemesters();
    calculateResults();
}

function removeSemester(index) {
    if (confirm(`Remove Semester ${state.semesters[index].number}?`)) {
        state.semesters.splice(index, 1);
        // Renumber remaining semesters
        state.semesters.forEach((sem, idx) => {
            sem.number = idx + 1;
        });
        saveState();
        renderSemesters();
        calculateResults();
    }
}

function renderSemesters() {
    const container = document.getElementById('semestersContainer');
    
    if (state.semesters.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">📚 No semesters added yet</p>
                <p>Click "Add Semester" to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.semesters.map((semester, semIndex) => `
        <div class="semester-card">
            <div class="semester-header">
                <h3 class="semester-title">Semester ${semester.number}</h3>
                <div class="semester-actions">
                    <button class="btn btn-outline" onclick="addSubject(${semIndex})">
                        <span class="btn-icon">+</span>
                        Add Subject
                    </button>
                    <button class="btn btn-danger" onclick="removeSemester(${semIndex})">
                        <span class="btn-icon">×</span>
                    </button>
                </div>
            </div>
            
            <div class="subjects-container" id="subjects-${semIndex}">
                ${renderSubjects(semester, semIndex)}
            </div>
            
            <div class="semester-footer">
                <div class="semester-gpa">
                    GPA: <span id="gpa-${semIndex}">${calculateSemesterGPA(semester, semIndex)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSubjects(semester, semIndex) {
    if (semester.subjects.length === 0) {
        return `
            <div style="text-align: center; padding: 1rem; color: var(--text-muted);">
                No subjects added yet
            </div>
        `;
    }
    
    return semester.subjects.map((subject, subIndex) => `
        <div class="subject-row">
            <div class="form-group">
                <label class="form-label">Subject Name</label>
                <input type="text" class="form-input" 
                    placeholder="e.g., Legal Language" 
                    value="${subject.name}"
                    onchange="updateSubjectName(${semIndex}, ${subIndex}, this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">Grade</label>
                <select class="form-select" 
                    onchange="updateSubjectGrade(${semIndex}, ${subIndex}, this.value)">
                    <option value="">Select</option>
                    ${state.rubric.map(r => `
                        <option value="${r.grade}" ${subject.grade === r.grade ? 'selected' : ''}>
                            ${r.grade} (${r.points})
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Type</label>
                <select class="form-select" 
                    onchange="updateSubjectType(${semIndex}, ${subIndex}, this.value)">
                    <option value="law" ${subject.type === 'law' ? 'selected' : ''}>Law (4)</option>
                    <option value="non-law" ${subject.type === 'non-law' ? 'selected' : ''}>Non-Law (3)</option>
                </select>
            </div>
            <button class="btn btn-danger" onclick="removeSubject(${semIndex}, ${subIndex})"
                style="margin-top: 1.5rem;">
                <span class="btn-icon">×</span>
            </button>
        </div>
    `).join('');
}

// Subject Management
function addSubject(semIndex) {
    state.semesters[semIndex].subjects.push({
        name: '',
        grade: '',
        type: 'law'
    });
    saveState();
    renderSemesters();
}

function removeSubject(semIndex, subIndex) {
    state.semesters[semIndex].subjects.splice(subIndex, 1);
    saveState();
    renderSemesters();
    calculateResults();
}

function updateSubjectName(semIndex, subIndex, value) {
    state.semesters[semIndex].subjects[subIndex].name = value.trim();
    saveState();
}

function updateSubjectGrade(semIndex, subIndex, value) {
    state.semesters[semIndex].subjects[subIndex].grade = value;
    saveState();
    calculateResults();
}

function updateSubjectType(semIndex, subIndex, value) {
    state.semesters[semIndex].subjects[subIndex].type = value;
    saveState();
    calculateResults();
}

// GPA Calculation
function getGradePoints(grade) {
    const rubricItem = state.rubric.find(r => r.grade === grade);
    return rubricItem ? rubricItem.points : 0;
}

function getCredits(type) {
    return type === 'law' ? 4 : 3;
}

function calculateSemesterGPA(semester, semesterIndex) {
    let totalPoints = 0;
    let totalCredits = 0;
    
    semester.subjects.forEach(subject => {
        // Skip English in Semester 1
        if (semesterIndex === 0 && subject.name.toLowerCase().includes('english')) {
            return;
        }
        
        if (subject.grade) {
            const gradePoints = getGradePoints(subject.grade);
            const credits = getCredits(subject.type);
            totalPoints += gradePoints * credits;
            totalCredits += credits;
        }
    });
    
    if (totalCredits === 0) return '-';
    
    const gpa = (totalPoints / totalCredits).toFixed(2);
    return gpa;
}

function calculateResults() {
    // Update individual semester GPAs
    state.semesters.forEach((semester, index) => {
        const gpaElement = document.getElementById(`gpa-${index}`);
        if (gpaElement) {
            gpaElement.textContent = calculateSemesterGPA(semester, index);
        }
    });
    
    // Calculate overall CGPA
    let totalGPA = 0;
    let validSemesters = 0;
    
    state.semesters.forEach((semester, index) => {
        const gpa = calculateSemesterGPA(semester, index);
        if (gpa !== '-') {
            totalGPA += parseFloat(gpa);
            validSemesters++;
        }
    });
    
    const cgpa = validSemesters > 0 ? (totalGPA / validSemesters).toFixed(2) : '-';
    
    // Update results display
    document.getElementById('totalSemesters').textContent = state.semesters.length;
    document.getElementById('overallCGPA').textContent = cgpa;
    
    // Update semester GPAs breakdown
    renderSemesterGPAsBreakdown();
}

function renderSemesterGPAsBreakdown() {
    const container = document.getElementById('semesterGPAs');
    
    if (state.semesters.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = state.semesters.map((semester, index) => {
        const gpa = calculateSemesterGPA(semester, index);
        return `
            <div class="semester-gpa-item">
                <div class="semester-gpa-label">Sem ${semester.number}</div>
                <div class="semester-gpa-value">${gpa}</div>
            </div>
        `;
    }).join('');
}
