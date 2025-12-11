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

// Default subject types
const DEFAULT_TYPES = [
    { name: 'Law', credits: 4 },
    { name: 'Non-Law', credits: 3 }
];

// Application state
let state = {
    rubric: [...DEFAULT_RUBRIC],
    subjectTypes: [...DEFAULT_TYPES],
    years: []
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initializeEventListeners();
    renderRubricDisplay();
    renderSubjectTypes();
    renderYears();
    calculateResults();
});

// Event Listeners
function initializeEventListeners() {
    document.getElementById('toggleRubric').addEventListener('click', toggleRubricEditor);
    document.getElementById('addGrade').addEventListener('click', addGradeToRubric);
    document.getElementById('resetRubric').addEventListener('click', resetRubric);
    document.getElementById('toggleTypes').addEventListener('click', toggleTypesEditor);
    document.getElementById('addType').addEventListener('click', addSubjectType);
    document.getElementById('resetTypes').addEventListener('click', resetTypes);
    document.getElementById('addYear').addEventListener('click', addYear);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
}

// Local Storage Functions
function saveState() {
    localStorage.setItem('gpaCalculatorState', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('gpaCalculatorState');
    if (saved) {
        try {
            const loadedState = JSON.parse(saved);
            // Migrate old state format to new format
            if (loadedState.semesters && !loadedState.years) {
                // Convert old semester-based format to year-based format
                state.rubric = loadedState.rubric || [...DEFAULT_RUBRIC];
                state.subjectTypes = loadedState.subjectTypes || [...DEFAULT_TYPES];
                state.years = [];

                // Group semesters into years (2 per year)
                for (let i = 0; i < loadedState.semesters.length; i += 2) {
                    const yearNumber = Math.floor(i / 2) + 1;
                    const year = {
                        number: yearNumber,
                        semesters: [
                            loadedState.semesters[i] || { number: 1, subjects: [] }
                        ]
                    };
                    if (loadedState.semesters[i + 1]) {
                        year.semesters.push(loadedState.semesters[i + 1]);
                    } else {
                        // Add empty second semester if only one exists
                        year.semesters.push({ number: 2, subjects: [] });
                    }
                    state.years.push(year);
                }
                // Save migrated state
                saveState();
            } else {
                state = loadedState;
                // Ensure subjectTypes exists for backward compatibility
                if (!state.subjectTypes) {
                    state.subjectTypes = [...DEFAULT_TYPES];
                }
                // Ensure years is an array
                if (!Array.isArray(state.years)) {
                    state.years = [];
                }
            }
        } catch (e) {
            console.error('Error loading state:', e);
            // Reset to default state if there's an error
            state = {
                rubric: [...DEFAULT_RUBRIC],
                subjectTypes: [...DEFAULT_TYPES],
                years: []
            };
        }
    }
}

function clearAllData() {
    if (confirm('⚠️ This will delete ALL your data including grades, semesters, and custom settings. This cannot be undone. Are you sure?')) {
        localStorage.removeItem('gpaCalculatorState');
        state = {
            rubric: [...DEFAULT_RUBRIC],
            subjectTypes: [...DEFAULT_TYPES],
            years: []
        };
        renderRubricDisplay();
        renderSubjectTypes();
        renderYears();
        calculateResults();
        alert('✅ All data has been cleared!');
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
                    data-index="${index}" data-field="grade" class="rubric-grade-input">
            </div>
            <div class="form-group">
                <label class="form-label">Points</label>
                <input type="number" class="form-input" value="${item.points}" 
                    step="0.5" min="0" max="10"
                    data-index="${index}" data-field="points" class="rubric-points-input">
            </div>
            <button class="btn btn-danger rubric-remove-btn" data-index="${index}"
                style="margin-top: 1.5rem;">
                <span class="btn-icon">×</span>
            </button>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.rubric-grade-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            state.rubric[index].grade = e.target.value.trim();
            saveState();
            renderYears();
        });
    });

    container.querySelectorAll('.rubric-points-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            state.rubric[index].points = parseFloat(e.target.value);
            saveState();
            calculateResults();
        });
    });

    container.querySelectorAll('.rubric-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            state.rubric.splice(index, 1);
            renderRubricEditor();
            saveState();
            calculateResults();
        });
    });
}

function addGradeToRubric() {
    state.rubric.push({ grade: '', points: 0 });
    renderRubricEditor();
    saveState();
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

// Subject Types Management
function toggleTypesEditor() {
    const display = document.getElementById('typesDisplay');
    const editor = document.getElementById('typesEditor');
    const toggleBtn = document.getElementById('toggleTypes');
    const toggleText = document.getElementById('toggleTypesText');

    if (editor.classList.contains('hidden')) {
        display.classList.add('hidden');
        editor.classList.remove('hidden');
        toggleText.textContent = 'Done';
        renderTypesEditor();
    } else {
        display.classList.remove('hidden');
        editor.classList.add('hidden');
        toggleText.textContent = 'Edit';
        renderSubjectTypes();
    }
}

function renderSubjectTypes() {
    const container = document.getElementById('typesDisplay');
    container.innerHTML = state.subjectTypes.map(type => `
        <div class="rubric-item">
            <div class="rubric-grade">${type.name}</div>
            <div class="rubric-points">${type.credits} credits</div>
        </div>
    `).join('');
}

function renderTypesEditor() {
    const container = document.getElementById('typesInputs');
    container.innerHTML = state.subjectTypes.map((type, index) => `
        <div class="rubric-input-row">
            <div class="form-group">
                <label class="form-label">Type Name</label>
                <input type="text" class="form-input type-name-input" value="${type.name}" 
                    data-index="${index}">
            </div>
            <div class="form-group">
                <label class="form-label">Credits</label>
                <input type="number" class="form-input type-credits-input" value="${type.credits}" 
                    step="0.5" min="0" max="10"
                    data-index="${index}">
            </div>
            <button class="btn btn-danger type-remove-btn" data-index="${index}"
                style="margin-top: 1.5rem;">
                <span class="btn-icon">×</span>
            </button>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.type-name-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            state.subjectTypes[index].name = e.target.value.trim();
            saveState();
            renderYears();
        });
    });

    container.querySelectorAll('.type-credits-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            state.subjectTypes[index].credits = parseFloat(e.target.value);
            saveState();
            calculateResults();
        });
    });

    container.querySelectorAll('.type-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            state.subjectTypes.splice(index, 1);
            renderTypesEditor();
            saveState();
            renderYears();
            calculateResults();
        });
    });
}

function addSubjectType() {
    state.subjectTypes.push({ name: '', credits: 0 });
    renderTypesEditor();
    saveState();
}

function resetTypes() {
    if (confirm('Reset subject types to default values?')) {
        state.subjectTypes = [...DEFAULT_TYPES];
        renderTypesEditor();
        renderSubjectTypes();
        saveState();
        renderYears();
        calculateResults();
    }
}

// Year Management
function addYear() {
    const yearNumber = state.years.length + 1;
    state.years.push({
        number: yearNumber,
        semesters: [
            { number: 1, subjects: [] },
            { number: 2, subjects: [] }
        ]
    });
    saveState();
    renderYears();
    calculateResults();
}

function removeYear(yearIndex) {
    if (confirm(`Remove Year ${state.years[yearIndex].number}?`)) {
        state.years.splice(yearIndex, 1);
        // Renumber remaining years
        state.years.forEach((year, idx) => {
            year.number = idx + 1;
        });
        saveState();
        renderYears();
        calculateResults();
    }
}

function renderYears() {
    const container = document.getElementById('yearsContainer');

    if (state.years.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">📚 No years added yet</p>
                <p>Click "Add Year" to get started</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.years.map((year, yearIndex) => `
        <div class="year-card">
            <div class="year-header">
                <h2 class="year-title">Year ${year.number}</h2>
                <button class="btn btn-danger year-remove-btn" data-year-index="${yearIndex}">
                    <span class="btn-icon">×</span>
                    Remove Year
                </button>
            </div>
            
            <div class="semesters-grid">
                ${year.semesters.map((semester, semIndex) => renderSemester(year, yearIndex, semester, semIndex)).join('')}
            </div>
        </div>
    `).join('');

    // Add event listeners for year removal
    container.querySelectorAll('.year-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const yearIndex = parseInt(e.target.closest('button').dataset.yearIndex);
            removeYear(yearIndex);
        });
    });

    // Add event listeners for subjects
    addSubjectEventListeners();
}

function renderSemester(year, yearIndex, semester, semIndex) {
    const globalSemIndex = (yearIndex * 2) + semIndex;
    return `
        <div class="semester-card">
            <div class="semester-header">
                <h3 class="semester-title">Semester ${semester.number}</h3>
                <button class="btn btn-outline add-subject-btn" 
                    data-year-index="${yearIndex}" data-sem-index="${semIndex}">
                    <span class="btn-icon">+</span>
                    Add Subject
                </button>
            </div>
            
            <div class="subjects-container">
                ${renderSubjects(yearIndex, semIndex, semester, globalSemIndex)}
            </div>
            
            <div class="semester-footer">
                <div class="semester-gpa">
                    GPA: <span id="gpa-${yearIndex}-${semIndex}">${calculateSemesterGPA(semester, globalSemIndex)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderSubjects(yearIndex, semIndex, semester, globalSemIndex) {
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
                <input type="text" class="form-input subject-name-input" 
                    placeholder="e.g., Legal Language" 
                    value="${subject.name}"
                    data-year-index="${yearIndex}" 
                    data-sem-index="${semIndex}" 
                    data-sub-index="${subIndex}">
            </div>
            <div class="form-group">
                <label class="form-label">Grade</label>
                <select class="form-select subject-grade-select" 
                    data-year-index="${yearIndex}" 
                    data-sem-index="${semIndex}" 
                    data-sub-index="${subIndex}">
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
                <select class="form-select subject-type-select" 
                    data-year-index="${yearIndex}" 
                    data-sem-index="${semIndex}" 
                    data-sub-index="${subIndex}">
                    ${state.subjectTypes.map(type => `
                        <option value="${type.name}" ${subject.type === type.name ? 'selected' : ''}>
                            ${type.name} (${type.credits})
                        </option>
                    `).join('')}
                </select>
            </div>
            <button class="btn btn-danger subject-remove-btn" 
                data-year-index="${yearIndex}" 
                data-sem-index="${semIndex}" 
                data-sub-index="${subIndex}"
                style="margin-top: 1.5rem;">
                <span class="btn-icon">×</span>
            </button>
        </div>
    `).join('');
}

function addSubjectEventListeners() {
    // Add subject buttons
    document.querySelectorAll('.add-subject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const yearIndex = parseInt(e.target.closest('button').dataset.yearIndex);
            const semIndex = parseInt(e.target.closest('button').dataset.semIndex);
            addSubject(yearIndex, semIndex);
        });
    });

    // Subject name inputs
    document.querySelectorAll('.subject-name-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const yearIndex = parseInt(e.target.dataset.yearIndex);
            const semIndex = parseInt(e.target.dataset.semIndex);
            const subIndex = parseInt(e.target.dataset.subIndex);
            updateSubjectName(yearIndex, semIndex, subIndex, e.target.value);
        });
    });

    // Subject grade selects
    document.querySelectorAll('.subject-grade-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const yearIndex = parseInt(e.target.dataset.yearIndex);
            const semIndex = parseInt(e.target.dataset.semIndex);
            const subIndex = parseInt(e.target.dataset.subIndex);
            updateSubjectGrade(yearIndex, semIndex, subIndex, e.target.value);
        });
    });

    // Subject type selects
    document.querySelectorAll('.subject-type-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const yearIndex = parseInt(e.target.dataset.yearIndex);
            const semIndex = parseInt(e.target.dataset.semIndex);
            const subIndex = parseInt(e.target.dataset.subIndex);
            updateSubjectType(yearIndex, semIndex, subIndex, e.target.value);
        });
    });

    // Remove subject buttons
    document.querySelectorAll('.subject-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const yearIndex = parseInt(e.target.closest('button').dataset.yearIndex);
            const semIndex = parseInt(e.target.closest('button').dataset.semIndex);
            const subIndex = parseInt(e.target.closest('button').dataset.subIndex);
            removeSubject(yearIndex, semIndex, subIndex);
        });
    });
}

// Subject Management
function addSubject(yearIndex, semIndex) {
    const defaultType = state.subjectTypes.length > 0 ? state.subjectTypes[0].name : '';
    state.years[yearIndex].semesters[semIndex].subjects.push({
        name: '',
        grade: '',
        type: defaultType
    });
    saveState();
    renderYears();
}

function removeSubject(yearIndex, semIndex, subIndex) {
    state.years[yearIndex].semesters[semIndex].subjects.splice(subIndex, 1);
    saveState();
    renderYears();
    calculateResults();
}

function updateSubjectName(yearIndex, semIndex, subIndex, value) {
    state.years[yearIndex].semesters[semIndex].subjects[subIndex].name = value.trim();
    saveState();
}

function updateSubjectGrade(yearIndex, semIndex, subIndex, value) {
    state.years[yearIndex].semesters[semIndex].subjects[subIndex].grade = value;
    saveState();
    calculateResults();
}

function updateSubjectType(yearIndex, semIndex, subIndex, value) {
    state.years[yearIndex].semesters[semIndex].subjects[subIndex].type = value;
    saveState();
    calculateResults();
}

// GPA Calculation
function getGradePoints(grade) {
    const rubricItem = state.rubric.find(r => r.grade === grade);
    return rubricItem ? rubricItem.points : 0;
}

function getCredits(typeName) {
    const typeItem = state.subjectTypes.find(t => t.name === typeName);
    return typeItem ? typeItem.credits : 0;
}

function calculateSemesterGPA(semester, globalSemIndex) {
    let totalPoints = 0;
    let totalCredits = 0;

    semester.subjects.forEach(subject => {
        // Skip English in Semester 1 (global index 0)
        if (globalSemIndex === 0 && subject.name.toLowerCase().includes('english')) {
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
    let totalGPA = 0;
    let validSemesters = 0;
    let totalYears = 0;

    state.years.forEach((year, yearIndex) => {
        year.semesters.forEach((semester, semIndex) => {
            const globalSemIndex = (yearIndex * 2) + semIndex;
            const gpaElement = document.getElementById(`gpa-${yearIndex}-${semIndex}`);
            const gpa = calculateSemesterGPA(semester, globalSemIndex);

            if (gpaElement) {
                gpaElement.textContent = gpa;
            }

            if (gpa !== '-') {
                totalGPA += parseFloat(gpa);
                validSemesters++;
            }
        });
    });

    const cgpa = validSemesters > 0 ? (totalGPA / validSemesters).toFixed(2) : '-';

    // Update results display
    const totalSemestersElement = document.getElementById('totalSemesters');
    const totalYearsElement = document.getElementById('totalYears');
    const overallCGPAElement = document.getElementById('overallCGPA');

    if (totalSemestersElement) totalSemestersElement.textContent = validSemesters;
    if (totalYearsElement) totalYearsElement.textContent = state.years.length;
    if (overallCGPAElement) overallCGPAElement.textContent = cgpa;

    // Update semester GPAs breakdown
    renderSemesterGPAsBreakdown();
}

function renderSemesterGPAsBreakdown() {
    const container = document.getElementById('semesterGPAs');

    if (!container) return;

    if (state.years.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    state.years.forEach((year, yearIndex) => {
        year.semesters.forEach((semester, semIndex) => {
            const globalSemIndex = (yearIndex * 2) + semIndex;
            const gpa = calculateSemesterGPA(semester, globalSemIndex);
            const semesterLabel = `Y${year.number}S${semester.number}`;
            html += `
                <div class="semester-gpa-item">
                    <div class="semester-gpa-label">${semesterLabel}</div>
                    <div class="semester-gpa-value">${gpa}</div>
                </div>
            `;
        });
    });

    container.innerHTML = html;
}
